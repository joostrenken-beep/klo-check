// =====================================================================
//  KLO-CHECK – ZENTRALE KONFIGURATION
//  Hier passt ein Stadtwerk alles an, was "seins" ist:
//  Name, Farben, Logo, Kontakt und die örtlichen Entsorgungswege.
//  Am Programmcode muss dafür niemand etwas ändern.
// =====================================================================

export default {
  // ---------- Branding ----------
  stadtwerk: {
    name: "Osterholzer Stadtwerke",            // erscheint in Kopf- und Fußzeile
    kurzname: "Stadtwerke",
    logo: null,                                // z. B. "img/logo.svg" – null = nur Text
    webseite: "https://www.osterholzer-stadtwerke.de",
  },

  // Farben als Hex-Werte. VORLÄUFIG: Hellblau + saftiges Grün.
  // Später durch die Hausfarben ersetzen. Kontrast prüfen (siehe README)!
  farben: {
    kopf: "#8fd8f8",           // Hellblau der Kopfzeile
    kopfText: "#0b2f4a",       // Schrift auf der Kopfzeile (dunkel, weil Hellblau hell ist)
    primaer: "#0277bd",        // Knöpfe und Links (weiße Schrift → muss dunkel genug sein)
    primaerHell: "#e1f5fe",    // helle blaue Flächen
    akzent: "#6ab023",         // Saftiges Grün – nur als Schmuck (Streifen, Rahmen)
    akzentHell: "#eef8e3",     // helles Grün für Flächen
    text: "#12263a",
    tropfi: "#29a8e8",         // Maskottchen: Körper
    tropfiHell: "#8fd8f8",     //             Glanz oben
    tropfiDunkel: "#0277bd",   //             Umriss und Arme
    hintergrund: "#f3fbff",
    // Ampel – bewusst kräftig und mit Symbol, nicht nur über die Farbe erkennbar.
    // Das Ampel-Grün ist absichtlich dunkler als das Schmuck-Grün.
    gruen: "#1e7d32",
    gelb: "#a35f00",
    rot: "#c62828",
  },

  // ---------- Zahlen für die Infoseite ("Wusstest du?") ----------
  // BITTE PRÜFEN – übernommen aus der Präsentation zum Sanierungsprogramm.
  // Ganzen Block auf null setzen, um ihn auszublenden.
  zahlen: {
    schmutzwasserKm: 140,
    regenwasserKm: 100,
    extra: [
      "Ein einziges Feuchttuch zerfällt im Kanal nicht – auch nach Tagen nicht.",
      "Jede Pumpenstörung durch Verzopfungen bezahlen am Ende alle über die Abwassergebühr.",
    ],
  },

  // ---------- Kontakt (Infoseite, Fußzeile) ----------
  kontakt: {
    abteilung: "Abteilung Entwässerung",
    telefon: "04791 / 000 000",                // PLATZHALTER
    email: "entwaesserung@example.org",        // PLATZHALTER
    adresse: "Musterstraße 1, 27711 Osterholz-Scharmbeck", // PLATZHALTER
  },

  // Impressum & Datenschutz – Pflicht, sobald die App öffentlich ist.
  rechtliches: {
    impressumUrl: "#/impressum",               // PLATZHALTER: später Link zum Stadtwerk
    datenschutzUrl: "#/datenschutz",           // PLATZHALTER
  },

  // ---------- Sprachen ----------
  // Erste Sprache = Standard. Für jede Sprache braucht es i18n/<code>.json,
  // optional data/produkte.<code>.json mit übersetzten Produkttexten.
  sprachen: ["de"],

  // ---------- Fachliche Prüfung ----------
  // true = Einträge mit "geprueft": false bekommen ein Hinweis-Schild.
  // Vor der Veröffentlichung auf false stellen.
  zeigePruefstatus: true,

  // ---------- Örtliche Entsorgungswege ----------
  // Die Produkte in data/produkte.json verweisen nur auf diese Schlüssel
  // (z. B. "restmuell"). Was das vor Ort genau heißt, steht hier.
  // ⚠ ALLE ANGABEN SIND PLATZHALTER und müssen mit dem örtlichen
  //   Abfallentsorger (z. B. Abfall-Service Osterholz) abgestimmt werden.
  ziele: {
    klo:        { icon: "🚽", titel: "Ab ins Klo",         text: "Genau dafür ist die Toilette da. Spülen – fertig!" },
    ausguss:    { icon: "🚰", titel: "Spüle, Waschbecken oder Klo", text: "In normalen Haushaltsmengen in Ordnung. Sparsam dosieren hilft der Kläranlage." },
    restmuell:  { icon: "🗑️", titel: "Restmüll",            text: "Graue bzw. schwarze Tonne. Am besten gut verpackt." },
    biotonne:   { icon: "🍂", titel: "Biotonne / Kompost",  text: "Braune Tonne. Was genau hinein darf, regelt der Abfallentsorger." },
    gelber_sack:{ icon: "♻️", titel: "Gelber Sack / Gelbe Tonne", text: "Verpackungen aus Kunststoff, Metall und Verbundstoff." },
    altpapier:  { icon: "📰", titel: "Altpapier",           text: "Blaue Tonne: sauberes Papier, Pappe und Kartons." },
    altglas:    { icon: "🍾", titel: "Altglascontainer",    text: "Nach Farben getrennt: weiß, braun, grün." },
    altkleider: { icon: "👕", titel: "Altkleidercontainer", text: "Saubere, tragbare Textilien. Kaputtes in den Restmüll." },
    schadstoff: { icon: "☣️", titel: "Schadstoffmobil / Wertstoffhof", text: "Kostenlose Annahme von Schadstoffen aus dem Haushalt. Termine beim Abfallentsorger.", link: null },
    wertstoffhof:{ icon: "🏗️", titel: "Wertstoffhof",       text: "Für größere Mengen, Bauschutt und Sonderfälle.", link: null },
    handel:     { icon: "🏪", titel: "Rückgabe im Handel",  text: "Läden, die so etwas verkaufen, müssen es auch zurücknehmen." },
    apotheke:   { icon: "💊", titel: "Apotheke (freiwillig)", text: "Viele Apotheken nehmen Altmedikamente zurück – nachfragen lohnt sich." },
    waschanlage:{ icon: "🚗", titel: "Autowaschanlage",     text: "Dort wird das Wasser über einen Ölabscheider gereinigt." },
  },

  // ---------- Quiz ----------
  quiz: {
    // Diese Produkte kommen im Quiz nicht vor (z. B. mit Blick auf Schulklassen).
    // IDs stehen in data/produkte.json bzw. auf der Seite "Alle Produkte".
    ausschluss: ["kondome", "erbrochenes", "hormone", "spritzen", "lebende-tiere", "menstruationstasse"],
  },

  // ---------- Phase 2 (noch ausgeschaltet) ----------
  phase2: {
    // URL des Cloudflare Workers für die Foto-Erkennung. null = Funktion aus.
    fotoErkennungUrl: null,
    // URL des anonymen Zählers für Suchbegriffe. null = es wird nichts gesendet.
    statistikUrl: null,
  },
};
