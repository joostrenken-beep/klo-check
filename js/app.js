// =====================================================================
//  KLO-CHECK – Hauptprogramm
//  Aufbau: Die App hat nur EINE HTML-Seite. Je nach Adresse hinter dem
//  "#" (z. B. #/produkt/feuchttuecher) wird ein anderer Inhalt in <main>
//  gezeichnet. So funktionieren Links und der Zurück-Knopf, und GitHub
//  Pages braucht keine Server-Einstellungen.
// =====================================================================
import config from "./config.js";
import { ladeTexte, ladeProdukte } from "./daten.js";
import { baueIndex, suche } from "./suche.js";
import { zaehleAufruf } from "./statistik.js";
import { esc, AMPEL_SYMBOL, teile } from "./helfer.js";
import { starteKamera, stoppeKamera, schlageNach, ordneZu, anzeigeName, istGueltigerCode, eintragenLink } from "./barcode.js";
import { zeichneQuiz } from "./quiz.js";
import { zeichneInfo } from "./info.js";
import { tropfi, STIMMUNG_ZUR_AMPEL } from "./tropfi.js";

const main = document.getElementById("inhalt");
let T = {};          // Oberflächentexte
let DATEN = null;    // { kategorien, produkte }
let INDEX = [];      // Suchindex
let letzteSuche = ""; // damit die Suche nach "Zurück" erhalten bleibt
let ZUORDNUNG = null; // Barcode-Regeln, werden erst beim ersten Scan geladen
let scanHinweis = null; // { id, name, code } – Banner über der Karte nach einem Scan

const BELIEBT = ["feuchttuecher", "bratfett", "tabletten", "wattestaebchen", "katzenstreu", "zigaretten", "speiseoel", "toilettenpapier"];

// ---------- kleine Helfer ----------
/** Übersetzung holen, {n} ersetzen */
const t = (key, werte = {}) => (T[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => werte[k] ?? "");
const produktById = (id) => DATEN.produkte.find((p) => p.id === id);
const kategorieById = (id) => DATEN.kategorien.find((k) => k.id === id);

// ---------- Start ----------
async function start() {
  wendeBrandingAn();
  const sprache = waehleSprache();
  document.documentElement.lang = sprache;
  try {
    [T, DATEN] = await Promise.all([ladeTexte(sprache), ladeProdukte(sprache)]);
  } catch (e) {
    console.error(e);
    main.innerHTML = `<p class="fehler">Die Daten konnten nicht geladen werden. Läuft die App über einen Webserver? (siehe README)</p>`;
    return;
  }
  INDEX = baueIndex(DATEN.produkte);
  uebersetzeStatischeTexte();
  window.addEventListener("hashchange", zeichne);
  zeichne();
  beobachteOnline();
  registriereServiceWorker();
}

/** Offline-Hinweis oben einblenden, wenn das Netz weg ist. */
function beobachteOnline() {
  const leiste = document.getElementById("offline");
  const pruefe = () => { leiste.hidden = navigator.onLine; };
  window.addEventListener("online", pruefe);
  window.addEventListener("offline", pruefe);
  pruefe();
}

/**
 * Service Worker = kleiner Helfer im Browser, der die App-Dateien speichert.
 * Dadurch startet die App auch ohne Internet (z. B. im Keller oder Funkloch).
 */
function registriereServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch((e) => console.warn("Service Worker:", e));
}

function wendeBrandingAn() {
  const f = config.farben;
  const css = document.documentElement.style;
  const map = { kopf: "--kopf", kopfText: "--kopf-text", primaer: "--primaer", primaerHell: "--primaer-hell", akzent: "--akzent", akzentHell: "--akzent-hell", text: "--text", hintergrund: "--hg", tropfi: "--tropfi", tropfiHell: "--tropfi-hell", tropfiDunkel: "--tropfi-dunkel", gruen: "--gruen", gelb: "--gelb", rot: "--rot" };
  for (const [k, v] of Object.entries(map)) if (f[k]) css.setProperty(v, f[k]);
  document.querySelector('meta[name="theme-color"]').content = f.kopf || f.primaer;
  document.getElementById("fuss-name").textContent = config.stadtwerk.name;
  document.getElementById("link-impressum").href = config.rechtliches.impressumUrl;
  document.getElementById("link-datenschutz").href = config.rechtliches.datenschutzUrl;
  const tropfen = document.querySelector(".kopf__tropfen");
  tropfen.outerHTML = config.stadtwerk.logo
    ? `<img class="kopf__logo" src="${esc(config.stadtwerk.logo)}" alt="">`
    : tropfi("froh", "kopf__tropfi");
}

function waehleSprache() {
  const erlaubt = config.sprachen;
  const ausUrl = new URLSearchParams(location.search).get("lang");
  let gespeichert = null;
  try { gespeichert = localStorage.getItem("klocheck-sprache"); } catch { /* privat */ }
  const browser = (navigator.language || "de").slice(0, 2);
  return [ausUrl, gespeichert, browser].find((s) => s && erlaubt.includes(s)) || erlaubt[0];
}

function uebersetzeStatischeTexte() {
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.title = `${t("app.titel")} – ${t("app.untertitel")}`;
}

// ---------- Router ----------
function zeichne() {
  const [, seite = "", wert = ""] = location.hash.split("/");
  const id = decodeURIComponent(wert);
  stoppeKamera(); // Kamera immer ausschalten, wenn man die Seite wechselt
  const ansichten = {
    "": zeichneStart,
    produkt: () => zeichneProdukt(id),
    kategorien: zeichneKategorien,
    kategorie: () => zeichneKategorie(id),
    alle: zeichneAlle,
    scan: zeichneScan,
    info: () => zeichneInfo(main, config),
    quiz: () => zeichneQuiz({ main, produkte: DATEN.produkte, t, ausschluss: config.quiz?.ausschluss || [] }),
    impressum: () => zeichnePlatzhalter("fuss.impressum", "platzhalter.impressum"),
    datenschutz: () => zeichnePlatzhalter("fuss.datenschutz", "platzhalter.datenschutz"),
  };
  (ansichten[seite] || zeichneStart)();
  markiereNavigation(seite);
  if (seite !== "") {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true }); // Screenreader springt zum neuen Inhalt
  }
}

function markiereNavigation(seite) {
  const aktiv = { "": "suche", produkt: "suche", kategorien: "kategorien", kategorie: "kategorien", scan: "scan", quiz: "quiz", info: "info" }[seite];
  document.querySelectorAll("[data-nav]").forEach((a) => {
    if (a.dataset.nav === aktiv) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

// ---------- Ansicht: Start mit Suche ----------
function zeichneStart() {
  main.innerHTML = `
    <h1 class="sr-only">${esc(t("app.titel"))} – ${esc(t("app.untertitel"))}</h1>
    <section class="begruessung">
      ${tropfi("winkt", "tropfi--mittel")}
      <p class="sprechblase">${esc(t("start.begruessung"))}</p>
    </section>
    <section class="suche" role="search">
      <form id="suchform" autocomplete="off">
        <label for="suchfeld" class="suche__label">${esc(t("suche.label"))}</label>
        <div class="suche__zeile">
          <input id="suchfeld" type="search" inputmode="search" enterkeyhint="search"
                 placeholder="${esc(t("suche.platzhalter"))}" value="${esc(letzteSuche)}"
                 aria-describedby="suchstatus" aria-controls="ergebnisse">
          <button type="submit" class="knopf">${esc(t("suche.knopf"))}</button>
        </div>
      </form>
      <p id="suchstatus" class="sr-only" aria-live="polite"></p>
      <ul id="ergebnisse" class="liste"></ul>
      <div id="leer"></div>
    </section>

    <section class="block">
      <h2>${esc(t("start.beliebt"))}</h2>
      <div class="chips">
        ${BELIEBT.map(produktById).filter(Boolean).map((p) => `<a class="chip" href="#/produkt/${p.id}"><span aria-hidden="true">${p.icon}</span> ${esc(p.name)}</a>`).join("")}
      </div>
    </section>

    ${faustregelHtml()}

    <section class="block">
      <h2>${esc(t("start.kategorien"))}</h2>
      ${kategorieKachelnHtml()}
    </section>`;

  const feld = document.getElementById("suchfeld");
  feld.addEventListener("input", () => zeigeTreffer(feld.value));
  document.getElementById("suchform").addEventListener("submit", (e) => {
    e.preventDefault();
    const treffer = suche(INDEX, feld.value, 1);
    if (treffer.length) location.hash = `#/produkt/${treffer[0].produkt.id}`;
    else zeigeTreffer(feld.value);
  });
  if (letzteSuche) zeigeTreffer(letzteSuche);
}

function zeigeTreffer(eingabe) {
  letzteSuche = eingabe;
  const liste = document.getElementById("ergebnisse");
  const leer = document.getElementById("leer");
  const status = document.getElementById("suchstatus");
  const treffer = suche(INDEX, eingabe);
  liste.innerHTML = treffer.map(({ produkt }) => produktZeileHtml(produkt)).join("");
  const zuKurz = eingabe.trim().length < 2;
  leer.innerHTML = !zuKurz && !treffer.length
    ? `<div class="hinweisbox"><p>${esc(t("suche.keinTreffer"))}</p><p><strong>${esc(t("faustregel.text"))}</strong></p><p><a class="knopf knopf--hell" href="#/kategorien">${esc(t("nav.kategorien"))}</a></p></div>`
    : "";
  status.textContent = zuKurz ? "" : treffer.length ? t("suche.treffer", { n: treffer.length }) : t("suche.keinTreffer");
}

function produktZeileHtml(p) {
  return `<li><a class="zeile zeile--${p.ampel}" href="#/produkt/${p.id}">
      <span class="zeile__icon" aria-hidden="true">${p.icon}</span>
      <span class="zeile__name">${esc(p.name)}</span>
      <span class="ampelpunkt ampelpunkt--${p.ampel}"><span aria-hidden="true">${AMPEL_SYMBOL[p.ampel]}</span> ${esc(t(`ampel.${p.ampel}.kurz`))}</span>
    </a></li>`;
}

function faustregelHtml() {
  return `<section class="block faustregel" aria-labelledby="fr-titel">
      ${tropfi("froh", "faustregel__tropfi")}
      <div><h2 id="fr-titel">${esc(t("faustregel.titel"))}</h2><p>${esc(t("faustregel.text"))}</p></div>
    </section>`;
}

function kategorieKachelnHtml() {
  return `<ul class="kacheln">${DATEN.kategorien.map((k) => {
    const n = DATEN.produkte.filter((p) => p.kategorie === k.id).length;
    return `<li><a class="kachel" href="#/kategorie/${k.id}">
        <span class="kachel__icon" aria-hidden="true">${k.icon}</span>
        <span class="kachel__name">${esc(k.name)}</span>
        <span class="kachel__anzahl">${esc(t("kategorie.anzahl", { n }))}</span></a></li>`;
  }).join("")}</ul>`;
}

// ---------- Ansicht: Ergebnis-Karte ----------
function zeichneProdukt(id) {
  const p = produktById(id);
  if (!p) {
    main.innerHTML = `<p class="hinweisbox">${esc(t("karte.nichtGefunden"))}</p>`;
    return;
  }
  zaehleAufruf(p.id);
  const vomScan = scanHinweis && scanHinweis.id === p.id ? scanHinweis : null;
  scanHinweis = null;
  const gruen = p.ampel === "gruen";
  const ziele = p.wohin.map((key) => config.ziele[key]).filter(Boolean);

  main.innerHTML = `
    <article class="karte karte--${p.ampel}" aria-labelledby="karte-titel">
      <button class="zurueck" type="button" id="zurueck">← ${esc(t("karte.zurueck"))}</button>
      ${vomScan ? `<p class="scanbanner"><span aria-hidden="true">📷</span> ${esc(t("scan.erkannt", { name: vomScan.name || vomScan.code }))}
        <a href="#/scan">${esc(t("scan.nochmal"))}</a></p>` : ""}

      <header class="karte__kopf">
        <span class="karte__icon" aria-hidden="true">${p.icon}</span>
        <h1 id="karte-titel">${esc(p.name)}</h1>
        <p class="ampel ampel--${p.ampel}">
          <span class="ampel__symbol" aria-hidden="true">${AMPEL_SYMBOL[p.ampel]}</span>
          <span>${esc(t(`ampel.${p.ampel}`))}</span>
        </p>
        ${config.zeigePruefstatus && !p.geprueft ? `<p class="entwurf">${esc(t("karte.ungeprueft"))}</p>` : ""}
      </header>

      <section class="karte__abschnitt">
        <h2>${esc(t(gruen ? "karte.kanal.gruen" : "karte.kanal"))}</h2>
        <p>${esc(p.kanal)}</p>
      </section>

      ${p.spuelbar ? `<section class="infobox infobox--spuelbar"><h2>🏷️ ${esc(t("spuelbar.titel"))}</h2><p>${esc(t("spuelbar.text"))}</p></section>` : ""}

      <section class="karte__abschnitt">
        <h2>${esc(t(gruen ? "karte.wohin.gruen" : "karte.wohin"))}</h2>
        <ul class="ziele">
          ${ziele.map((z) => `<li class="ziel"><span class="ziel__icon" aria-hidden="true">${z.icon}</span>
              <span><strong>${esc(z.titel)}</strong><br>${esc(z.text)}${z.link ? ` <a href="${esc(z.link)}" target="_blank" rel="noopener">Mehr Infos</a>` : ""}</span></li>`).join("")}
        </ul>
        ${p.wohinHinweis ? `<p class="klein">${esc(p.wohinHinweis)}</p>` : ""}
      </section>

      ${p.gully ? `<section class="infobox infobox--gully"><h2>🌧️ ${esc(t("karte.gully"))}</h2><p>${esc(p.gully)}</p></section>` : ""}
      ${p.hinweis ? `<section class="infobox"><h2>💡 ${esc(t("karte.tipp"))}</h2><p>${esc(p.hinweis)}</p></section>` : ""}

      <figure class="pointe">
        ${tropfi(STIMMUNG_ZUR_AMPEL[p.ampel], "pointe__tropfi")}
        <blockquote><p>${esc(p.pointe)}</p></blockquote>
        <figcaption class="sr-only">${esc(t("karte.pointe"))}</figcaption>
      </figure>

      <p><button class="knopf knopf--hell" type="button" id="teilen">${esc(t("karte.teilen"))}</button></p>
    </article>`;

  document.getElementById("zurueck").addEventListener("click", () => {
    if (history.length > 1) history.back(); else location.hash = "#/";
  });
  document.getElementById("teilen").addEventListener("click", () => teile({
    titel: t("app.titel"),
    text: `${t("app.titel")}: ${p.name} – ${t(`ampel.${p.ampel}`)}`,
    kopiertMeldung: t("teilen.kopiert"),
  }));
}

// ---------- Ansicht: Barcode-Scan ----------
function zeichneScan() {
  main.innerHTML = `
    <h1>${esc(t("scan.titel"))}</h1>
    <p>${esc(t("scan.intro"))}</p>
    <div id="kamera" class="kamera" aria-label="${esc(t("scan.kameraLabel"))}"></div>
    <p><button class="knopf knopf--gross" id="kamera-start">📷 ${esc(t("scan.starten"))}</button></p>
    <form id="code-form" class="code-form" autocomplete="off">
      <label for="code-feld">${esc(t("scan.manuell"))}</label>
      <div class="suche__zeile">
        <input id="code-feld" inputmode="numeric" pattern="[0-9]*" maxlength="13" placeholder="4006…">
        <button class="knopf" type="submit">${esc(t("suche.knopf"))}</button>
      </div>
    </form>
    <div id="scan-status" aria-live="polite"></div>
    <p class="klein">${esc(t("scan.datenschutz"))}</p>`;

  const status = document.getElementById("scan-status");
  const knopf = document.getElementById("kamera-start");
  knopf.addEventListener("click", async () => {
    knopf.hidden = true;
    status.innerHTML = "";
    try {
      await starteKamera("kamera", verarbeiteCode);
    } catch (e) {
      console.warn(e);
      knopf.hidden = false;
      status.innerHTML = `<p class="hinweisbox">${esc(t("scan.keineKamera"))}</p>`;
    }
  });
  document.getElementById("code-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("code-feld").value.replace(/\D/g, "");
    if (!istGueltigerCode(code.length === 12 ? "0" + code : code)) {
      status.innerHTML = `<p class="hinweisbox">${esc(t("scan.ungueltig"))}</p>`;
      return;
    }
    verarbeiteCode(code.length === 12 ? "0" + code : code);
  });
}

async function verarbeiteCode(code) {
  const status = document.getElementById("scan-status");
  if (!status) return; // Seite wurde inzwischen verlassen
  document.getElementById("kamera-start").hidden = false;
  status.innerHTML = `<p class="laden">${esc(t("scan.suche", { code }))}</p>`;

  if (!navigator.onLine) {
    status.innerHTML = `<p class="hinweisbox">${esc(t("scan.offline"))}</p>`;
    return;
  }
  let fremd;
  try {
    ZUORDNUNG ??= await (await fetch("data/barcode-zuordnung.json")).json();
    fremd = await schlageNach(code);
  } catch {
    status.innerHTML = `<p class="hinweisbox">${esc(t("scan.offline"))}</p>`;
    return;
  }
  const name = fremd ? anzeigeName(fremd) : "";
  const id = fremd ? ordneZu(fremd, ZUORDNUNG) : null;

  if (id && produktById(id)) {
    scanHinweis = { id, name, code };
    location.hash = `#/produkt/${id}`;
    return;
  }
  // Unbekannt: ehrlich sagen, Kategorien anbieten, Suche vorbefüllen
  status.innerHTML = `
    <div class="hinweisbox">
      <p><strong>${esc(fremd ? t("scan.nichtZuordenbar", { name }) : t("scan.unbekannt", { code }))}</strong></p>
      <p>${esc(t("scan.waehleKategorie"))}</p>
    </div>
    ${kategorieKachelnHtml()}
    <p><a class="knopf knopf--hell" href="#/" id="scan-suche">🔍 ${esc(t("scan.selbstSuchen"))}</a></p>
    ${faustregelHtml()}
    ${fremd ? "" : `<p class="klein">${esc(t("scan.eintragen"))} <a href="${esc(eintragenLink(code))}" target="_blank" rel="noopener">Open Products Facts</a></p>`}`;
  document.getElementById("scan-suche").addEventListener("click", () => { letzteSuche = name; });
}

// ---------- Ansicht: Kategorien ----------
function zeichneKategorien() {
  main.innerHTML = `<h1>${esc(t("kategorie.titel"))}</h1>${kategorieKachelnHtml()}${faustregelHtml()}`;
}

function zeichneKategorie(id) {
  const k = kategorieById(id);
  if (!k) return zeichneKategorien();
  const reihenfolge = { gruen: 0, gelb: 1, rot: 2 };
  const produkte = DATEN.produkte.filter((p) => p.kategorie === id)
    .sort((a, b) => reihenfolge[a.ampel] - reihenfolge[b.ampel] || a.name.localeCompare(b.name, "de"));
  main.innerHTML = `
    <a class="zurueck" href="#/kategorien">← ${esc(t("kategorie.titel"))}</a>
    <h1><span aria-hidden="true">${k.icon}</span> ${esc(k.name)}</h1>
    <ul class="liste">${produkte.map(produktZeileHtml).join("")}</ul>`;
}

// ---------- Ansicht: Alle Produkte (auch zum fachlichen Prüfen) ----------
function zeichneAlle() {
  const sortiert = [...DATEN.produkte].sort((a, b) => a.kategorie.localeCompare(b.kategorie) || a.name.localeCompare(b.name, "de"));
  const ungeprueft = DATEN.produkte.filter((p) => !p.geprueft).length;
  main.innerHTML = `
    <h1>${esc(t("alle.titel"))} (${DATEN.produkte.length})</h1>
    <p class="klein">${esc(t("alle.hinweis"))} – ${ungeprueft} von ${DATEN.produkte.length} noch ungeprüft.</p>
    <label class="schalter"><input type="checkbox" id="nurUngeprueft"> ${esc(t("alle.filterUngeprueft"))}</label>
    <div class="pruefliste">${sortiert.map((p) => `
      <details class="pruef ${p.geprueft ? "pruef--ok" : ""}" data-geprueft="${p.geprueft}">
        <summary><span aria-hidden="true">${p.icon}</span> <strong>${esc(p.name)}</strong>
          <span class="ampelpunkt ampelpunkt--${p.ampel}"><span aria-hidden="true">${AMPEL_SYMBOL[p.ampel]}</span> ${esc(t(`ampel.${p.ampel}.kurz`))}</span>
          <span class="klein">· ${esc(kategorieById(p.kategorie)?.name)} · id: ${esc(p.id)}${p.geprueft ? " · ✔ geprüft" : ""}</span></summary>
        <dl>
          <dt>Synonyme</dt><dd>${esc((p.synonyme || []).join(", "))}</dd>
          <dt>${esc(t("karte.kanal"))}</dt><dd>${esc(p.kanal)}</dd>
          <dt>${esc(t("karte.wohin"))}</dt><dd>${esc(p.wohin.map((z) => config.ziele[z]?.titel || `⚠ unbekannt: ${z}`).join(", "))}${p.wohinHinweis ? ` – ${esc(p.wohinHinweis)}` : ""}</dd>
          ${p.hinweis ? `<dt>${esc(t("karte.tipp"))}</dt><dd>${esc(p.hinweis)}</dd>` : ""}
          ${p.gully ? `<dt>Gully</dt><dd>${esc(p.gully)}</dd>` : ""}
          <dt>Pointe</dt><dd>${esc(p.pointe)}</dd>
          ${p.spuelbar ? `<dt>„Spülbar“-Hinweis</dt><dd>wird angezeigt</dd>` : ""}
        </dl>
        <a href="#/produkt/${p.id}">Karte ansehen →</a>
      </details>`).join("")}
    </div>`;
  document.getElementById("nurUngeprueft").addEventListener("change", (e) => {
    document.querySelectorAll(".pruef").forEach((el) => { el.hidden = e.target.checked && el.dataset.geprueft === "true"; });
  });
}

function zeichnePlatzhalter(titelKey, textKey) {
  main.innerHTML = `<h1>${esc(t(titelKey))}</h1><p class="hinweisbox">${esc(t(textKey))}</p>
    <h2>Kontakt</h2><p>${esc(config.stadtwerk.name)}<br>${esc(config.kontakt.abteilung)}<br>${esc(config.kontakt.adresse)}<br>
    Tel. ${esc(config.kontakt.telefon)}<br><a href="mailto:${esc(config.kontakt.email)}">${esc(config.kontakt.email)}</a></p>`;
}

start();
