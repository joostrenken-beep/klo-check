// =====================================================================
//  Lädt Produktdaten und Oberflächentexte – passend zur Sprache.
//  Deutsch ist die fachlich geprüfte Grundlage. Für andere Sprachen
//  gibt es optional data/produkte.<sprache>.json, die NUR Texte
//  überschreibt (Ampel und Entsorgungswege bleiben immer deutsch-geprüft).
// =====================================================================

// Diese Felder dürfen von einer Übersetzung ersetzt werden:
const UEBERSETZBAR = ["name", "synonyme", "kanal", "wohinHinweis", "hinweis", "gully", "pointe"];

async function ladeJson(pfad) {
  const antwort = await fetch(pfad);
  if (!antwort.ok) throw new Error(`${pfad}: ${antwort.status}`);
  return antwort.json();
}

export async function ladeTexte(sprache) {
  const basis = await ladeJson("i18n/de.json");
  if (sprache === "de") return basis;
  try {
    return { ...basis, ...(await ladeJson(`i18n/${sprache}.json`)) };
  } catch {
    return basis; // fehlende Übersetzung → deutsch
  }
}

export async function ladeProdukte(sprache) {
  const daten = await ladeJson("data/produkte.json");
  if (sprache !== "de") {
    try {
      const ueb = await ladeJson(`data/produkte.${sprache}.json`);
      for (const p of daten.produkte) {
        const t = ueb.produkte?.[p.id];
        if (!t) continue;
        // deutsche Namen bleiben zusätzlich suchbar
        const deutscheBegriffe = [p.name, ...(p.synonyme || [])];
        for (const feld of UEBERSETZBAR) if (t[feld]) p[feld] = t[feld];
        p.synonyme = [...(t.synonyme || []), ...deutscheBegriffe];
      }
      for (const k of daten.kategorien) if (ueb.kategorien?.[k.id]) k.name = ueb.kategorien[k.id];
    } catch {
      /* keine Produktübersetzung vorhanden – deutsche Texte bleiben */
    }
  }
  return daten;
}
