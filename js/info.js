// =====================================================================
//  Infoseite: Der Weg vom Klo zur Kläranlage – plus Kontakt.
//  Die Grafik ist eine Liste von Stationen, verbunden durch ein "Rohr".
//  Als Liste bleibt sie auch für Screenreader verständlich.
// =====================================================================
import { esc } from "./helfer.js";
import { tropfi } from "./tropfi.js";

// Kleine gezeichnete Symbole (SVG) für die Stationen
const B = 'stroke="#0b2f4a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const SYMBOL = {
  haus: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 30 L32 10 L56 30" fill="none" ${B}/><rect x="14" y="28" width="36" height="28" fill="#fff" ${B}/>
         <rect x="20" y="36" width="10" height="10" fill="#8fd8f8" ${B}/><path d="M38 56 v-14 h8 v14" fill="#ffd27a" ${B}/></svg>`,
  kanal: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="8" width="56" height="10" fill="#9e9e9e" ${B}/><circle cx="32" cy="42" r="18" fill="#cfd8dc" ${B}/>
          <path d="M16 46 Q32 54 48 46 L48 50 Q32 60 16 50 Z" fill="#8d6e63"/><path d="M32 18 v6" ${B}/></svg>`,
  pumpe: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="20" width="44" height="36" rx="4" fill="#cfd8dc" ${B}/><circle cx="32" cy="38" r="11" fill="#fff" ${B}/>
          <path d="M32 27 v22 M21 38 h22 M24 30 l16 16 M40 30 l-16 16" stroke="#0277bd" stroke-width="2.5"/><path d="M32 20 v-12 h20" fill="none" ${B}/></svg>`,
  rechen: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="30" width="52" height="24" fill="#8fd8f8" ${B}/>
           <path d="M18 14 v40 M26 14 v40 M34 14 v40 M42 14 v40" ${B}/><path d="M12 14 h40" ${B}/><path d="M8 40 q4 -6 8 0 q4 6 8 0" fill="none" stroke="#fff" stroke-width="3"/></svg>`,
  becken: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 24 h52 v28 a4 4 0 0 1 -4 4 h-44 a4 4 0 0 1 -4 -4 z" fill="#a5d6a7" ${B}/>
           <circle cx="18" cy="38" r="3" fill="#fff"/><circle cx="30" cy="44" r="2.5" fill="#fff"/><circle cx="42" cy="36" r="3.5" fill="#fff"/><circle cx="48" cy="46" r="2" fill="#fff"/>
           <circle cx="24" cy="32" r="2" fill="#fff"/><path d="M14 18 q4 -6 8 0 M40 16 q4 -6 8 0" fill="none" ${B}/></svg>`,
  fluss: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 40 q10 -8 20 0 t20 0 t20 0 v20 h-60 z" fill="#29a8e8" ${B}/>
          <path d="M36 50 q6 -6 12 0 q-6 6 -12 0 z M48 50 l5 -4 v8 z" fill="#ffb74d" stroke="#0b2f4a" stroke-width="1.5"/>
          <path d="M14 34 v-18 M14 22 q-6 -4 -8 -10 M14 26 q6 -4 8 -10" fill="none" stroke="#43a047" stroke-width="2.5" stroke-linecap="round"/></svg>`,
};

const STATIONEN = [
  { symbol: "haus",   titel: "Zuhause",
    text: "Alles aus Klo, Dusche, Waschmaschine und Spüle fließt in die Hausanschlussleitung. Die ist oft nur so dick wie ein Unterarm – eine Windel reicht, um sie zu verstopfen." },
  { symbol: "kanal",  titel: "Kanal unter der Straße",
    text: "Unter der Straße liegt der Schmutzwasserkanal. Das Abwasser fließt mit leichtem Gefälle ganz von allein. Fett wird hier kalt und klebt an den Rohrwänden." },
  { symbol: "pumpe",  titel: "Pumpwerk",
    text: "Wo es nicht mehr bergab geht, heben Pumpen das Abwasser an. Hier wickeln sich Feuchttücher, Zahnseide und Haare zu dicken Zöpfen um die Laufräder – dann steht die Pumpe still." },
  { symbol: "rechen", titel: "Kläranlage: Rechen & Sandfang",
    text: "Ein großer Rechen fischt alles Grobe heraus, was nicht ins Klo gehört hätte. Danach setzen sich Sand und Steinchen ab, und Fett wird abgeschöpft." },
  { symbol: "becken", titel: "Kläranlage: Belebungsbecken",
    text: "Jetzt arbeiten Milliarden winziger Bakterien: Sie fressen den Schmutz aus dem Wasser. Chemikalien und Medikamente können sie dabei krank machen – oder sie werden gar nicht abgebaut." },
  { symbol: "fluss",  titel: "Zurück in den Fluss",
    text: "Das gereinigte Wasser fließt in den Fluss. Was die Kläranlage nicht herausholen konnte – Mikroplastik oder Arzneireste – schwimmt mit zu Fischen und Pflanzen." },
];

export function zeichneInfo(main, config) {
  const k = config.kontakt;
  const z = config.zahlen;
  main.innerHTML = `
    <section class="info-kopf">
      ${tropfi("winkt", "tropfi--mittel")}
      <div>
        <h1>Vom Klo zur Kläranlage</h1>
        <p>Komm mit auf die Reise! So kommt das Wasser aus deinem Klo wieder sauber in den Fluss.</p>
      </div>
    </section>

    <ol class="weg" aria-label="Weg des Abwassers">
      ${STATIONEN.map((s, i) => `
        <li class="station">
          <span class="station__bild">${SYMBOL[s.symbol]}</span>
          <div class="station__text">
            <h2><span class="station__nr">${i + 1}</span> ${esc(s.titel)}</h2>
            <p>${esc(s.text)}</p>
          </div>
        </li>`).join("")}
    </ol>

    <aside class="infobox infobox--gully trennsystem">
      <h2>🌧️ Und der Gully auf der Straße?</h2>
      <svg class="trennsystem__grafik" viewBox="0 0 320 175" role="img" aria-labelledby="ts-titel">
        <title id="ts-titel">Trennsystem: Schmutzwasser aus dem Haus fließt zur Kläranlage und wird gereinigt. Regenwasser aus dem Gully fließt ungeklärt direkt in den Bach.</title>
        <rect x="0" y="68" width="320" height="6" fill="#b0bec5"/>
        <path d="M18 46 L45 22 L72 46 Z" fill="#fff" stroke="#0b2f4a" stroke-width="2" stroke-linejoin="round"/>
        <rect x="24" y="46" width="42" height="22" fill="#fff" stroke="#0b2f4a" stroke-width="2"/>
        <text x="45" y="14" font-size="11" text-anchor="middle" fill="#0b2f4a">Haus</text>
        <rect x="104" y="66" width="24" height="6" fill="#455a64"/>
        <text x="116" y="60" font-size="11" text-anchor="middle" fill="#0b2f4a">Gully</text>
        <path d="M116 74 V150 H226" fill="none" stroke="#29a8e8" stroke-width="7" stroke-linecap="round"/>
        <path d="M45 68 V108 H226" fill="none" stroke="#8d6e63" stroke-width="7" stroke-linecap="round"/>
        <text x="136" y="100" font-size="11" fill="#5d4037">Schmutzwasser</text>
        <text x="128" y="142" font-size="11" fill="#01579b" font-weight="bold">Regenwasser – ungeklärt!</text>
        <rect x="228" y="94" width="84" height="26" rx="5" fill="#a5d6a7" stroke="#0b2f4a" stroke-width="1.5"/>
        <text x="270" y="111" font-size="11" text-anchor="middle" fill="#0b2f4a">Kläranlage</text>
        <path d="M270 120 V134" stroke="#0b2f4a" stroke-width="1.5" marker-end="url(#ts-pfeil)"/>
        <defs><marker id="ts-pfeil" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#0b2f4a"/></marker></defs>
        <path d="M228 148 q10 -6 20 0 t20 0 t20 0 t20 0 t12 0 V175 H228 Z" fill="#29a8e8"/>
        <text x="270" y="166" font-size="11" text-anchor="middle" fill="#fff" font-weight="bold">Bach</text>
      </svg>
      <p>Bei uns gibt es zwei getrennte Kanäle: einen für Schmutzwasser und einen für Regenwasser.
        Was in den <strong>Straßengully</strong> kommt, fließt <strong>ohne Reinigung direkt in den Bach</strong>.
        Deshalb: Kein Putzwasser, kein Autowaschwasser, keine Kippen und kein Laub in den Gully!</p>
    </aside>

    ${z ? `<section class="block">
      <h2>Wusstest du?</h2>
      <ul class="fakten">
        ${z.schmutzwasserKm ? `<li><strong>${esc(z.schmutzwasserKm)} km</strong> Schmutzwasserkanal</li>` : ""}
        ${z.regenwasserKm ? `<li><strong>${esc(z.regenwasserKm)} km</strong> Regenwasserkanal</li>` : ""}
        ${(z.extra || []).map((f) => `<li>${esc(f)}</li>`).join("")}
      </ul>
    </section>` : ""}

    <section class="block kontakt">
      <h2>Fragen? Wir helfen gern!</h2>
      <p><strong>${esc(config.stadtwerk.name)}</strong><br>${esc(k.abteilung)}<br>${esc(k.adresse)}</p>
      <p class="kontakt__knoepfe">
        <a class="knopf" href="tel:${esc(k.telefon.replace(/[^\d+]/g, ""))}">📞 ${esc(k.telefon)}</a>
        <a class="knopf knopf--hell" href="mailto:${esc(k.email)}">✉️ E-Mail schreiben</a>
      </p>
      ${config.stadtwerk.webseite ? `<p><a href="${esc(config.stadtwerk.webseite)}" target="_blank" rel="noopener">Zur Webseite der ${esc(config.stadtwerk.name)}</a></p>` : ""}
    </section>`;
}
