// =====================================================================
//  Barcode: Kamera, Nachschlagen in den offenen Produktdatenbanken
//  und Zuordnung zu unseren eigenen (fachlich geprüften) Einträgen.
//
//  Ablauf:  Kamera liest EAN-Code  →  Prüfziffer ok?
//           → Open Food / Beauty / Products / Pet Food Facts fragen
//           → Kategorien + Name mit data/barcode-zuordnung.json abgleichen
//           → eigenes Produkt anzeigen (oder: "unbekannt" + Kategorien)
// =====================================================================
import { normalisiere } from "./suche.js";

// Die vier offenen Datenbanken (alle frei nutzbar, Lizenz ODbL).
// Reihenfolge = Priorität, falls ein Code in mehreren steht.
const DATENBANKEN = [
  { id: "beauty",   name: "Open Beauty Facts",   basis: "https://world.openbeautyfacts.org",   lebensmittel: false },
  { id: "products", name: "Open Products Facts", basis: "https://world.openproductsfacts.org", lebensmittel: false },
  { id: "food",     name: "Open Food Facts",     basis: "https://world.openfoodfacts.org",     lebensmittel: true },
  { id: "petfood",  name: "Open Pet Food Facts", basis: "https://world.openpetfoodfacts.org",  lebensmittel: true },
];
const FELDER = "product_name,product_name_de,generic_name_de,brands,categories_tags,categories";

// ---------- Prüfziffer ----------
/** Prüft die letzte Ziffer von EAN-8, EAN-13, UPC-A (12). Fängt Lesefehler der Kamera ab. */
export function istGueltigerCode(code) {
  if (!/^\d{8}$|^\d{12,13}$/.test(code)) return false;
  const ziffern = code.split("").map(Number);
  const pruef = ziffern.pop();
  const summe = ziffern.reverse().reduce((s, z, i) => s + z * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (summe % 10)) % 10 === pruef;
}

// ---------- Nachschlagen ----------
async function frage(db, code, signal) {
  const antwort = await fetch(`${db.basis}/api/v2/product/${code}.json?fields=${FELDER}`, { signal });
  if (!antwort.ok) return null;
  const daten = await antwort.json();
  if (daten.status !== 1 || !daten.product) return null;
  return { ...daten.product, quelle: db };
}

/**
 * Fragt alle Datenbanken gleichzeitig. Liefert das erste gefundene Produkt
 * (nach Priorität) oder null. Wirft einen Fehler, wenn kein Internet da ist.
 */
export async function schlageNach(code, zeitlimitMs = 8000) {
  const abbruch = new AbortController();
  const timer = setTimeout(() => abbruch.abort(), zeitlimitMs);
  try {
    const ergebnisse = await Promise.allSettled(DATENBANKEN.map((db) => frage(db, code, abbruch.signal)));
    const gefunden = ergebnisse.find((e) => e.status === "fulfilled" && e.value);
    if (gefunden) return gefunden.value;
    // Alle fehlgeschlagen (nicht nur "nicht gefunden") → Netzwerkproblem
    if (ergebnisse.every((e) => e.status === "rejected")) throw new Error("offline");
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Zuordnung ----------
/** Name, den wir anzeigen: deutscher Name bevorzugt. */
export function anzeigeName(fremd) {
  const name = fremd.product_name_de || fremd.product_name || fremd.generic_name_de || "";
  const marke = (fremd.brands || "").split(",")[0].trim();
  return [name, marke && !name.toLowerCase().includes(marke.toLowerCase()) ? `(${marke})` : ""].filter(Boolean).join(" ");
}

/**
 * Sucht in den Kategorien und im Namen des fremden Produkts nach unseren Mustern.
 * Liefert unsere Produkt-ID oder null.
 */
export function ordneZu(fremd, zuordnung) {
  const kategorien = (fremd.categories_tags || [])
    .map((tag) => tag.replace(/^[a-z]{2}:/, "").replace(/-/g, " "));
  const text = " " + normalisiere([
    ...kategorien,
    fremd.categories || "",
    fremd.product_name_de || "",
    fremd.product_name || "",
    fremd.generic_name_de || "",
  ].join(" ")) + " ";

  for (const regel of zuordnung.regeln) {
    for (const muster of regel.muster) {
      // Muster muss am WORTANFANG stehen: "tea" passt zu "teas", aber nicht zu "steak"
      if (text.includes(" " + normalisiere(muster))) return regel.produkt;
    }
  }
  return fremd.quelle?.lebensmittel ? zuordnung.rueckfallLebensmittel : null;
}

/** Link, um ein unbekanntes Produkt selbst in Open Products Facts einzutragen. */
export const eintragenLink = (code) => `https://world.openproductsfacts.org/cgi/product.pl?type=search_or_add&code=${encodeURIComponent(code)}`;

// ---------- Kamera ----------
let scanner = null;

/** Lädt die Barcode-Bibliothek erst, wenn sie gebraucht wird (spart 370 KB beim Start). */
function ladeBibliothek() {
  if (window.__Html5QrcodeLibrary__) return Promise.resolve(window.__Html5QrcodeLibrary__);
  return new Promise((ok, fehler) => {
    const s = document.createElement("script");
    s.src = "vendor/html5-qrcode.min.js";
    s.onload = () => ok(window.__Html5QrcodeLibrary__);
    s.onerror = () => fehler(new Error("Bibliothek nicht geladen"));
    document.head.appendChild(s);
  });
}

/**
 * Startet die Kamera im Element mit der ID elementId.
 * beiCode(code) wird EINMAL mit einem gültigen Code aufgerufen, danach stoppt die Kamera.
 */
export async function starteKamera(elementId, beiCode) {
  await stoppeKamera();
  const { Html5Qrcode, Html5QrcodeSupportedFormats: F } = await ladeBibliothek();
  scanner = new Html5Qrcode(elementId, {
    formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A], // in Deutschland praktisch nur EAN
    useBarCodeDetectorIfSupported: true, // schneller, wo der Browser es kann (Android)
    verbose: false,
  });
  let fertig = false;
  await scanner.start(
    { facingMode: "environment" }, // Rückkamera
    { fps: 10, qrbox: (b, h) => ({ width: Math.min(300, b * 0.85), height: Math.min(160, h * 0.5) }) },
    (text) => {
      const code = text.length === 12 ? "0" + text : text; // UPC-A → EAN-13
      if (fertig || !istGueltigerCode(code)) return;
      fertig = true;
      navigator.vibrate?.(80);
      stoppeKamera().finally(() => beiCode(code));
    },
    () => { /* kein Code im Bild – normal, ignorieren */ }
  );
}

export async function stoppeKamera() {
  if (!scanner) return;
  const s = scanner;
  scanner = null;
  try { if (s.isScanning) await s.stop(); s.clear(); } catch { /* schon gestoppt */ }
}
