// =====================================================================
//  Unscharfe Suche ("fuzzy search") ohne fremde Bibliothek.
//  Idee: Suchwort und alle Namen/Synonyme werden vereinfacht
//  (klein, ohne Umlaute, ohne Satzzeichen) und dann verglichen.
//  Kleine Tippfehler werden über die "Levenshtein-Distanz" verziehen:
//  Das ist die Anzahl Buchstaben, die man ändern muss, damit zwei
//  Wörter gleich sind ("Fechttuch" → "Feuchttuch" = 1).
// =====================================================================

/**
 * Text vereinfachen: "Feuchttücher!" → "feuchttucher", "Islak Mendil" → "islak mendil",
 * "Вологі серветки" → "вологі серветки". Funktioniert für alle Schriften.
 */
export function normalisiere(text) {
  return String(text)
    .toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss")
    .replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u")
    .replace(/ı/g, "i")                                   // türkisches i ohne Punkt
    .replace(/ё/g, "е")                                   // russisch: ё wird oft als е getippt
    .normalize("NFD").replace(/\p{M}/gu, "")              // Akzente entfernen: é → e, ş → s, й → и
    .replace(/[^\p{L}\p{N} ]+/gu, " ")                    // Buchstaben aller Sprachen behalten
    .replace(/\s+/g, " ")
    .trim();
}

/** Levenshtein-Distanz mit Abbruch, sobald sie größer als max wird. */
function distanz(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let vorher = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const jetzt = [i];
    let zeilenMin = i;
    for (let j = 1; j <= b.length; j++) {
      const kosten = a[i - 1] === b[j - 1] ? 0 : 1;
      jetzt[j] = Math.min(vorher[j] + 1, jetzt[j - 1] + 1, vorher[j - 1] + kosten);
      zeilenMin = Math.min(zeilenMin, jetzt[j]);
    }
    if (zeilenMin > max) return max + 1;
    vorher = jetzt;
  }
  return vorher[b.length];
}

/** Wie viele Tippfehler erlauben wir? Kurze Wörter: keine. */
function erlaubteFehler(laenge) {
  if (laenge <= 3) return 0;
  if (laenge <= 5) return 1;
  if (laenge <= 9) return 2;
  return 3;
}

/** Bewertet, wie gut die Suche q zu einem Begriff t passt (0–100). */
function bewerte(q, t) {
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90 - Math.min(20, t.length - q.length);
  const woerter = t.split(" ");
  if (woerter.some((w) => w.startsWith(q))) return 78; // knapp unter "Begriff beginnt so"
  if (q.length >= 3 && t.includes(q)) return 70;      // "tuch" findet "feuchttuch"

  const max = erlaubteFehler(q.length);
  if (max === 0) return 0;
  let best = 0;
  for (const w of [t, ...woerter]) {
    // ganzes Wort mit Tippfehler
    const d = distanz(q, w, max);
    // Bonus, wenn der ganze Begriff passt (nicht nur ein Teilwort)
    if (d <= max) best = Math.max(best, 60 - d * 8 + (w === t ? 4 : 0));
    // Anfang des Wortes mit Tippfehler (man tippt ja noch)
    if (w.length > q.length) {
      const dp = distanz(q, w.slice(0, q.length), max);
      if (dp <= max) best = Math.max(best, 50 - dp * 8);
    }
  }
  return best;
}

/**
 * Baut einen Suchindex. Jeder Eintrag merkt sich alle Begriffe
 * (Name + Synonyme) in vereinfachter Form.
 */
export function baueIndex(produkte) {
  return produkte.map((p) => ({
    produkt: p,
    begriffe: [p.name, ...(p.synonyme || [])].map(normalisiere),
  }));
}

/** Sucht und liefert die besten Treffer, sortiert nach Punkten. */
export function suche(index, eingabe, anzahl = 8) {
  const q = normalisiere(eingabe);
  if (q.length < 2) return [];
  // Mehrwort-Eingaben ("wet wipes"): ganze Eingabe UND jedes Wort einzeln prüfen
  const teile = q.includes(" ") ? [q, ...q.split(" ").filter((x) => x.length >= 3)] : [q];

  const treffer = [];
  for (const eintrag of index) {
    let punkte = 0;
    for (const begriff of eintrag.begriffe) {
      for (const teil of teile) {
        const p = bewerte(teil, begriff) - (teil === q ? 0 : 10);
        if (p > punkte) punkte = p;
      }
    }
    if (punkte >= 40) treffer.push({ produkt: eintrag.produkt, punkte });
  }
  treffer.sort((a, b) => b.punkte - a.punkte || a.produkt.name.localeCompare(b.produkt.name, "de"));
  // Schwache Zufallstreffer weglassen, wenn es einen klar besseren gibt
  const grenze = treffer.length ? treffer[0].punkte - 35 : 0;
  return treffer.filter((x) => x.punkte >= grenze).slice(0, anzahl);
}
