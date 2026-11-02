// Kleine Helfer, die mehrere Programmteile brauchen.

/** Text sicher in HTML einsetzen (verhindert, dass Daten Code einschleusen). */
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Symbol zur Ampelfarbe – damit die Ampel nicht nur über Farbe erkennbar ist. */
export const AMPEL_SYMBOL = { gruen: "✓", gelb: "!", rot: "✕" };

/** Teilen über das Handy-Menü (WhatsApp, Mail …) oder – am PC – Link kopieren. */
export async function teile({ titel, text, url = location.href, kopiertMeldung = "Link kopiert!" }) {
  try {
    if (navigator.share) {
      await navigator.share({ title: titel, text, url });
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert(kopiertMeldung);
    }
  } catch {
    /* Teilen abgebrochen – kein Problem */
  }
}

/** Mischt eine Liste zufällig (Fisher-Yates). */
export function mische(liste) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
