# 💧 Klo-Check – Darf das ins Klo?

Web-App (PWA), mit der Bürgerinnen und Bürger in Sekunden prüfen, ob etwas ins Klo
oder in den Abfluss darf – mit Erklärung, was im Kanal passiert, wohin es stattdessen
gehört, und einer Pointe von Tropfi, dem Wassertropfen.

> **Stand: Meilenstein 2** – Datenbank-Entwurf, Suche, Ergebnis-Karte, Barcode-Scan, Quiz.
> Design-Feinschliff, Offline-Fähigkeit und Infoseite folgen in Meilenstein 3.

---

## 1. Lokal starten

Die App besteht nur aus normalen Dateien (HTML, CSS, JavaScript, JSON).
Es gibt **keinen Build-Schritt**. Sie braucht aber einen kleinen lokalen Webserver,
weil Browser JSON-Dateien aus Sicherheitsgründen nicht direkt von der Festplatte laden.

**Variante A – Python (auf Mac/Linux meist schon da):**
```bash
git clone https://github.com/joostrenken-beep/klo-check.git
cd klo-check
python3 -m http.server 8000
```
Dann im Browser öffnen: <http://localhost:8000>

**Variante B – Visual Studio Code:** Erweiterung „Live Server“ installieren,
`index.html` öffnen, unten rechts auf „Go Live“ klicken.

**Auf dem Handy testen:** Handy und Computer im selben WLAN, dann am Handy
`http://<IP-des-Computers>:8000` öffnen. (Die Kamera für den Barcode-Scan
funktioniert später nur über `https://` – also nach dem Veröffentlichen.)

---

## 2. Ordnerstruktur

```
klo-check/  (Hauptordner des Repositorys)
├── index.html            ← die einzige HTML-Seite
├── css/style.css         ← Gestaltung
├── js/
│   ├── config.js         ← ⭐ Branding, Kontakt, Entsorgungswege (hier anpassen!)
│   ├── app.js            ← Hauptprogramm: Seiten zeichnen
│   ├── suche.js          ← unscharfe Suche mit Tippfehler-Toleranz
│   ├── daten.js          ← lädt Produkte und Texte (inkl. Übersetzungen)
│   ├── barcode.js        ← Kamera, Nachschlagen, Zuordnung
│   ├── quiz.js           ← Quiz „Klo oder nicht Klo?“
│   ├── helfer.js         ← kleine gemeinsame Hilfsfunktionen
│   └── statistik.js      ← Phase 2, derzeit ausgeschaltet
├── data/
│   ├── produkte.json           ← ⭐ die Produktdatenbank
│   └── barcode-zuordnung.json  ← ⭐ Regeln: gescannte Kategorie → unser Produkt
├── vendor/html5-qrcode.min.js  ← Barcode-Bibliothek (Apache-2.0), lokal gespeichert
└── i18n/de.json          ← Oberflächentexte (Knöpfe, Überschriften)
```

---

## 3. Produkte prüfen und ergänzen

### Prüfen
In der App unten auf **„Alle Produkte“** tippen. Dort steht jedes Produkt mit allen
Texten zum Aufklappen, Filter „Nur ungeprüfte zeigen“, druckbar mit Strg+P.

Wenn ein Eintrag fachlich in Ordnung ist, in `data/produkte.json` bei diesem Produkt
`"geprueft": false` → `"geprueft": true` ändern. Das gelbe Schild „Entwurf“ verschwindet dann.

### Ein Produkt hinzufügen
Einen vorhandenen Block kopieren, hinter einen anderen setzen (Komma dazwischen!) und anpassen:

```json
{
  "id": "glitzer",                     ← eindeutig, klein, ohne Leerzeichen/Umlaute
  "name": "Glitzer",                   ← so steht es auf der Karte
  "kategorie": "sonstiges",            ← hygiene | kueche | medikamente | chemie | haustier | sonstiges
  "icon": "✨",                         ← ein Emoji (wird in Meilenstein 3 ggf. durch Grafik ersetzt)
  "synonyme": ["Glitter", "Konfetti"], ← alles, was Leute eintippen könnten
  "ampel": "rot",                      ← gruen | gelb | rot
  "kanal": "Was im Kanal passiert …",
  "wohin": ["restmuell"],              ← Schlüssel aus js/config.js → ziele
  "wohinHinweis": "optional: Zusatz zu „Wohin?“",
  "hinweis": "optional: praktischer Tipp",
  "gully": "optional: Warnung zum Straßengully",
  "spuelbar": false,                   ← true = Erklärkasten „Spülbar – stimmt das?“
  "pointe": "Ein witziger Satz.",
  "geprueft": false
}
```

**Ampel-Bedeutung**

| Farbe | Bedeutung | Beispiele |
|---|---|---|
| 🟢 `gruen` | gehört ins Klo | Urin, Kot, Toilettenpapier |
| 🟡 `gelb` | normales Haushaltsabwasser, in üblichen Mengen okay | Spülwasser, Putzwasser, Zahnpasta |
| 🔴 `rot` | gehört nicht ins Klo / in den Abfluss | Feuchttücher, Fett, Medikamente |

**Häufige Fehler:** fehlendes Komma zwischen zwei Blöcken, Komma nach dem letzten Feld,
gerade Anführungszeichen `"` vergessen. Prüfen kann man die Datei z. B. auf
<https://jsonlint.com> (Inhalt hineinkopieren → „Validate JSON“).

### Entsorgungswege anpassen
Was „Restmüll“, „Schadstoffmobil“ usw. vor Ort genau bedeutet, steht **nur einmal**
in `js/config.js` unter `ziele`. Dort kann man auch einen Link (z. B. zum
Abfuhrkalender) eintragen: `link: "https://…"`.

---

## 4. Barcode-Scan

**So funktioniert es:** Die Kamera liest den Strichcode (EAN). Die Nummer wird gleichzeitig bei
Open Beauty Facts, Open Products Facts, Open Food Facts und Open Pet Food Facts nachgeschlagen –
freie, von Freiwilligen gepflegte Datenbanken. Deren Kategorien (z. B. `en:baby-wipes`) und der
Produktname werden mit den Regeln in `data/barcode-zuordnung.json` verglichen.
Angezeigt wird **immer unsere eigene, geprüfte Karte** – nie Texte aus der fremden Datenbank.

**Regel ergänzen:** Wenn ein Produkt falsch oder gar nicht zugeordnet wird, eine Zeile ergänzen:
```json
{ "muster": ["glitter", "glitzer"], "produkt": "glitzer" },
```
Die **erste** passende Regel gewinnt – spezielle Regeln also weiter oben einsortieren
(z. B. „feuchtes Toilettenpapier“ vor „Toilettenpapier“, „Motoröl“ vor „Öl“).

**Gut zu wissen:**
- Die Kamera funktioniert nur über `https://` (also nach dem Veröffentlichen) oder `localhost`.
- Viele Drogerie- und Haushaltsprodukte fehlen in den freien Datenbanken. Dann zeigt die App
  ehrlich „kenne ich nicht“ und bietet Kategorien und Suche an. Jeder kann Produkte dort
  selbst eintragen – die App verlinkt darauf.
- Datenschutz: Das Kamerabild verlässt das Handy nicht, nur die Barcode-Nummer wird gesendet.
- Ohne Kamera kann man die Ziffern unter dem Strichcode auch eintippen.

## 5. Quiz

10 zufällige Fragen (2 grüne, 2 gelbe, 6 rote), mit Erklärung nach jeder Antwort.
Produkte, die nicht ins Quiz sollen (z. B. für Schulklassen), stehen in `js/config.js`
unter `quiz.ausschluss`. Der persönliche Rekord wird nur im Browser des Geräts gespeichert.

## 6. Branding für ein anderes Stadtwerk

Alles in `js/config.js`: Name, Farben, Logo (Datei in `img/` legen und Pfad eintragen),
Kontakt, Links zu Impressum und Datenschutz, Entsorgungswege.
Farben – worauf achten?
- Schrift auf `primaer`, `gruen`, `gelb`, `rot` ist weiß, Schrift auf `kopf` ist `kopfText`.
  Der Kontrast muss mindestens 4,5 : 1 sein (prüfen z. B. mit
  <https://webaim.org/resources/contrastchecker/>).
- `akzent` (derzeit saftiges Grün) ist nur Schmuck. Bitte **nicht** für Knöpfe nutzen:
  Grün bedeutet in der Ampel „darf ins Klo“ – grüne Knöpfe würden das verwässern.

---

## 7. Weitere Sprachen

1. `i18n/de.json` kopieren nach z. B. `i18n/en.json` und die Texte rechts übersetzen.
2. Optional `data/produkte.en.json` anlegen – nur die Texte, Ampel und Entsorgungsweg
   bleiben immer aus der geprüften deutschen Datei:
   ```json
   { "kategorien": { "hygiene": "Bathroom" },
     "produkte": { "feuchttuecher": { "name": "Wet wipes", "kanal": "…", "pointe": "…" } } }
   ```
3. In `js/config.js` bei `sprachen` ergänzen: `["de", "en"]`.

---

## 8. Veröffentlichen (GitHub Pages)

Folgt ausführlich in Meilenstein 3.

---

## Phase 2 (vorbereitet, nicht aktiv)

- **Foto-Erkennung:** eigener Cloudflare Worker hält den API-Schlüssel geheim; das Modell
  darf nur Produkt-IDs aus `produkte.json` zurückgeben – alle Aussagen bleiben fachlich geprüft.
- **Statistik:** `js/statistik.js` sendet erst, wenn `phase2.statistikUrl` gesetzt ist –
  nur Produkt-ID und Datum, keine IP, keine Cookies.
