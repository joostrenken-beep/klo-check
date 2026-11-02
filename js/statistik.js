// =====================================================================
//  Anonyme Suchstatistik – PHASE 2, derzeit AUSGESCHALTET.
//  Solange config.phase2.statistikUrl = null ist, wird nichts gesendet.
//  Geplant: Nur "Produkt-ID + Datum" an einen eigenen Zähler senden –
//  keine IP-Speicherung, keine Cookies, keine Geräte-Kennung.
// =====================================================================
import config from "./config.js";

export function zaehleAufruf(produktId) {
  const url = config.phase2?.statistikUrl;
  if (!url) return;
  try {
    // sendBeacon schickt im Hintergrund, ohne die App aufzuhalten
    navigator.sendBeacon?.(url, JSON.stringify({ id: produktId, tag: new Date().toISOString().slice(0, 10) }));
  } catch {
    /* Statistik darf die App nie stören */
  }
}
