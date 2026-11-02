// =====================================================================
//  TROPFI – das Maskottchen (ein Wassertropfen), als SVG-Grafik.
//  SVG = Zeichnung aus Formen statt Pixeln: gestochen scharf, winzig klein.
//
//  Stimmungen:
//   "froh"     – Standard, lächelt (grüne Karten, Start)
//   "winkt"    – begrüßt (Startseite)
//   "skeptisch"– hebt eine Augenbraue (gelbe Karten)
//   "entsetzt" – große Augen, offener Mund, Schweißtropfen (rote Karten)
//   "jubel"    – Arme hoch (Quiz gewonnen)
//   "traurig"  – (Quiz schlecht gelaufen)
// =====================================================================

let zaehler = 0;

const GESICHTER = {
  froh: `
    <ellipse cx="38" cy="74" rx="4.5" ry="6" fill="#0b2f4a"/><ellipse cx="62" cy="74" rx="4.5" ry="6" fill="#0b2f4a"/>
    <circle cx="39.5" cy="72" r="1.6" fill="#fff"/><circle cx="63.5" cy="72" r="1.6" fill="#fff"/>
    <path d="M40 88 Q50 97 60 88" fill="none" stroke="#0b2f4a" stroke-width="3.2" stroke-linecap="round"/>
    <ellipse cx="30" cy="85" rx="5" ry="3" fill="#ff8fa3" opacity=".55"/><ellipse cx="70" cy="85" rx="5" ry="3" fill="#ff8fa3" opacity=".55"/>`,
  skeptisch: `
    <ellipse cx="38" cy="75" rx="4.5" ry="5.5" fill="#0b2f4a"/><ellipse cx="62" cy="74" rx="4.5" ry="6" fill="#0b2f4a"/>
    <circle cx="39.5" cy="73" r="1.5" fill="#fff"/><circle cx="63.5" cy="72" r="1.6" fill="#fff"/>
    <path d="M32 66 L44 67" stroke="#0b2f4a" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M56 62 Q62 58 68 62" fill="none" stroke="#0b2f4a" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M42 90 Q50 87 58 91" fill="none" stroke="#0b2f4a" stroke-width="3.2" stroke-linecap="round"/>`,
  entsetzt: `
    <circle cx="38" cy="73" r="7.5" fill="#fff" stroke="#0b2f4a" stroke-width="2"/><circle cx="62" cy="73" r="7.5" fill="#fff" stroke="#0b2f4a" stroke-width="2"/>
    <circle cx="38" cy="74" r="3" fill="#0b2f4a"/><circle cx="62" cy="74" r="3" fill="#0b2f4a"/>
    <path d="M30 61 Q37 56 44 60" fill="none" stroke="#0b2f4a" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M56 60 Q63 56 70 61" fill="none" stroke="#0b2f4a" stroke-width="2.8" stroke-linecap="round"/>
    <ellipse cx="50" cy="92" rx="6" ry="7.5" fill="#0b2f4a"/><ellipse cx="50" cy="95" rx="3.5" ry="3" fill="#ff8fa3"/>
    <path d="M80 50 q4 7 0 10 q-4 -3 0 -10z" fill="#e1f5fe" stroke="#0b2f4a" stroke-width="1.2"/>`,
  jubel: `
    <path d="M33 75 Q38 69 43 75" fill="none" stroke="#0b2f4a" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M57 75 Q62 69 67 75" fill="none" stroke="#0b2f4a" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M38 85 Q50 101 62 85 Z" fill="#0b2f4a"/><path d="M43 92 Q50 98 57 92" fill="#ff8fa3"/>
    <ellipse cx="29" cy="84" rx="5" ry="3" fill="#ff8fa3" opacity=".6"/><ellipse cx="71" cy="84" rx="5" ry="3" fill="#ff8fa3" opacity=".6"/>`,
  traurig: `
    <ellipse cx="38" cy="75" rx="4.5" ry="5.5" fill="#0b2f4a"/><ellipse cx="62" cy="75" rx="4.5" ry="5.5" fill="#0b2f4a"/>
    <circle cx="39.5" cy="73" r="1.5" fill="#fff"/><circle cx="63.5" cy="73" r="1.5" fill="#fff"/>
    <path d="M31 66 L43 63" stroke="#0b2f4a" stroke-width="2.6" stroke-linecap="round"/><path d="M57 63 L69 66" stroke="#0b2f4a" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M41 93 Q50 85 59 93" fill="none" stroke="#0b2f4a" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M64 82 q3 5 0 8 q-3 -3 0 -8z" fill="#8fd8f8"/>`,
};
GESICHTER.winkt = GESICHTER.froh;

const ARME = {
  normal: `<path d="M15 82 Q6 88 9 97" fill="none" stroke="var(--tropfi-dunkel, #0277bd)" stroke-width="4" stroke-linecap="round"/>
           <path d="M85 82 Q94 88 91 97" fill="none" stroke="var(--tropfi-dunkel, #0277bd)" stroke-width="4" stroke-linecap="round"/>`,
  winkt:  `<path d="M15 82 Q6 88 9 97" fill="none" stroke="var(--tropfi-dunkel, #0277bd)" stroke-width="4" stroke-linecap="round"/>
           <g class="tropfi__winkarm"><path d="M85 78 Q96 68 94 56" fill="none" stroke="var(--tropfi-dunkel, #0277bd)" stroke-width="4" stroke-linecap="round"/>
           <circle cx="94" cy="53" r="4" fill="var(--tropfi-dunkel, #0277bd)"/></g>`,
  hoch:   `<path d="M16 78 Q5 66 8 54" fill="none" stroke="var(--tropfi-dunkel, #0277bd)" stroke-width="4" stroke-linecap="round"/>
           <path d="M84 78 Q95 66 92 54" fill="none" stroke="var(--tropfi-dunkel, #0277bd)" stroke-width="4" stroke-linecap="round"/>
           <circle cx="8" cy="51" r="4" fill="var(--tropfi-dunkel, #0277bd)"/><circle cx="92" cy="51" r="4" fill="var(--tropfi-dunkel, #0277bd)"/>`,
  haende: `<path d="M15 80 Q10 70 24 64" fill="none" stroke="var(--tropfi-dunkel, #0277bd)" stroke-width="4" stroke-linecap="round"/>
           <path d="M85 80 Q90 70 76 64" fill="none" stroke="var(--tropfi-dunkel, #0277bd)" stroke-width="4" stroke-linecap="round"/>`,
};
const ARM_FUER = { froh: "normal", winkt: "winkt", skeptisch: "normal", entsetzt: "haende", jubel: "hoch", traurig: "normal" };

/**
 * Liefert Tropfi als SVG-Text.
 * @param {string} stimmung  siehe oben
 * @param {string} klasse    zusätzliche CSS-Klasse (z. B. für die Größe)
 */
export function tropfi(stimmung = "froh", klasse = "") {
  const id = `tg${++zaehler}`;
  const gesicht = GESICHTER[stimmung] || GESICHTER.froh;
  return `<svg class="tropfi tropfi--${stimmung} ${klasse}" viewBox="0 0 100 120" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--tropfi-hell, #8fd8f8)"/><stop offset="1" stop-color="var(--tropfi, #29a8e8)"/>
    </linearGradient></defs>
    ${ARME[ARM_FUER[stimmung] || "normal"]}
    <path d="M50 6 C46 14 16 50 16 78 a34 34 0 0 0 68 0 C84 50 54 14 50 6 Z" fill="url(#${id})" stroke="var(--tropfi-dunkel, #0277bd)" stroke-width="2.5"/>
    <path d="M30 60 Q32 44 42 32" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    ${gesicht}
  </svg>`;
}

/** Passende Stimmung zur Ampelfarbe */
export const STIMMUNG_ZUR_AMPEL = { gruen: "froh", gelb: "skeptisch", rot: "entsetzt" };
