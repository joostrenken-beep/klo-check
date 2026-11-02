// =====================================================================
//  SERVICE WORKER – macht die App offline nutzbar.
//
//  Strategie "stale-while-revalidate" (zu Deutsch etwa: "erst das
//  Gespeicherte zeigen, im Hintergrund auffrischen"):
//   1. Die App startet sofort aus dem Speicher – auch ohne Internet.
//   2. Gleichzeitig wird die Datei neu geladen und für das nächste
//      Mal gespeichert. Änderungen (z. B. an produkte.json) sind also
//      spätestens beim ÜBERNÄCHSTEN Öffnen der App sichtbar.
//
//  VERSION hochzählen, wenn Dateien dazukommen oder wegfallen
//  (dann wird der Speicher komplett neu angelegt).
// =====================================================================
const VERSION = "klocheck-v4";

// Diese Dateien werden beim ersten Besuch sofort gespeichert:
const DATEIEN = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/config.js",
  "js/daten.js",
  "js/suche.js",
  "js/helfer.js",
  "js/barcode.js",
  "js/quiz.js",
  "js/info.js",
  "js/tropfi.js",
  "js/statistik.js",
  "data/produkte.json",
  "data/barcode-zuordnung.json",
  "i18n/de.json",
  "i18n/en.json",
  "i18n/tr.json",
  "i18n/ru.json",
  "i18n/uk.json",
  "data/produkte.en.json",
  "data/produkte.tr.json",
  "data/produkte.ru.json",
  "data/produkte.uk.json",
  "manifest.webmanifest",
  "icons/favicon.svg",
  "icons/favicon-32.png",
  "icons/icon-maskable-512.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(DATEIEN)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  // alte Speicher-Versionen aufräumen
  event.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const anfrage = event.request;
  const url = new URL(anfrage.url);
  // Nur eigene Dateien speichern – Anfragen an Open Food Facts usw. gehen direkt ins Netz.
  if (anfrage.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      // "?lang=en" o. Ä. ignorieren, damit die Startseite immer gefunden wird
      const gespeichert = await cache.match(anfrage, { ignoreSearch: true });
      const ausDemNetz = fetch(anfrage)
        .then((antwort) => {
          if (antwort.ok) cache.put(anfrage, antwort.clone());
          return antwort;
        })
        .catch(() => gespeichert);
      if (gespeichert) {
        event.waitUntil(ausDemNetz); // im Hintergrund auffrischen
        return gespeichert;
      }
      return ausDemNetz;
    })
  );
});
