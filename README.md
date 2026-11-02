# 💧 Klo-Check – Darf das ins Klo?

Web-App (PWA), mit der Bürgerinnen und Bürger in Sekunden prüfen, ob etwas ins Klo
oder in den Abfluss darf – mit Erklärung, was im Kanal passiert, wohin es stattdessen
gehört, und einer Pointe von Tropfi, dem Wassertropfen.

> **Stand: Meilenstein 3 (Phase 1 komplett)** – Suche, Ergebnis-Karte, Barcode-Scan, Quiz,
> Infoseite, Maskottchen Tropfi, offline nutzbar und auf dem Handy installierbar.
>
> **Live:** <https://joostrenken-beep.github.io/klo-check/>

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

**Tipp beim Ändern:** Wegen des Offline-Speichers (Service Worker) siehst du Änderungen erst
nach **zweimaligem** Neuladen. In Chrome geht es bequemer: F12 → Reiter „Application“ →
„Service workers“ → Haken bei **„Update on reload“**.

**Auf dem Handy testen:** Handy und Computer im selben WLAN, dann am Handy
`http://<IP-des-Computers>:8000` öffnen. (Die Kamera für den Barcode-Scan
funktioniert später nur über `https://` – also nach dem Veröffentlichen.)

---

## 2. Ordnerstruktur

```
klo-check/  (Hauptordner des Repositorys)
├── index.html            ← die einzige HTML-Seite
├── sw.js                 ← Service Worker: macht die App offline nutzbar
├── manifest.webmanifest  ← App-Name, Farben, Symbole (für „Zum Home-Bildschirm“)
├── icons/                ← App-Symbole (aus Tropfi erzeugt)
├── css/style.css         ← Gestaltung
├── js/
│   ├── config.js         ← ⭐ Branding, Kontakt, Entsorgungswege (hier anpassen!)
│   ├── app.js            ← Hauptprogramm: Seiten zeichnen
│   ├── suche.js          ← unscharfe Suche mit Tippfehler-Toleranz
│   ├── daten.js          ← lädt Produkte und Texte (inkl. Übersetzungen)
│   ├── barcode.js        ← Kamera, Nachschlagen, Zuordnung
│   ├── quiz.js           ← Quiz „Klo oder nicht Klo?“
│   ├── info.js           ← Infoseite „Vom Klo zur Kläranlage“
│   ├── tropfi.js         ← das Maskottchen als Zeichnung (SVG), mit Stimmungen
│   ├── helfer.js         ← kleine gemeinsame Hilfsfunktionen
│   └── statistik.js      ← Phase 2, derzeit ausgeschaltet
├── data/
│   ├── produkte.json           ← ⭐ die Produktdatenbank
│   ├── barcode-zuordnung.json  ← ⭐ Regeln: gescannte Kategorie → unser Produkt
│   └── produkte.<sprache>.json ← Übersetzungen der Produkttexte (en, tr, ru, uk)
├── vendor/html5-qrcode.min.js  ← Barcode-Bibliothek (Apache-2.0), lokal gespeichert
└── i18n/                ← Oberflächentexte je Sprache (de, en, tr, ru, uk)
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

## 6. Infoseite und Maskottchen

- **Infoseite** (`#/info`): Weg vom Klo über Kanal, Pumpwerk und Kläranlage zurück in den Fluss,
  Erklärung Trennsystem (Gully → Bach) und Kontakt. Die Texte der Stationen stehen in `js/info.js`,
  die Zahlen („Wusstest du?“) und Kontaktdaten in `js/config.js` (`zahlen`, `kontakt`).
- **Tropfi** ist eine Zeichnung im Code (`js/tropfi.js`) mit den Stimmungen *froh, winkt, skeptisch,
  entsetzt, jubel, traurig*. Auf der Karte passt die Stimmung zur Ampel (grün → froh, gelb →
  skeptisch, rot → entsetzt). Farben in `config.js` unter `farben.tropfi…`.
- Wer ein **eigenes Logo** einträgt (`stadtwerk.logo`), ersetzt Tropfi in der Kopfzeile.

## 7. Branding für ein anderes Stadtwerk

Alles in `js/config.js`: Name, Farben, Logo (Datei in `img/` legen und Pfad eintragen),
Kontakt, Links zu Impressum und Datenschutz, Entsorgungswege.
Farben – worauf achten?
- Schrift auf `primaer`, `gruen`, `gelb`, `rot` ist weiß, Schrift auf `kopf` ist `kopfText`.
  Der Kontrast muss mindestens 4,5 : 1 sein (prüfen z. B. mit
  <https://webaim.org/resources/contrastchecker/>).
- `akzent` (derzeit saftiges Grün) ist nur Schmuck. Bitte **nicht** für Knöpfe nutzen:
  Grün bedeutet in der Ampel „darf ins Klo“ – grüne Knöpfe würden das verwässern.

---

## 8. Sprachen

Die App gibt es auf **Deutsch, Englisch, Türkisch, Russisch und Ukrainisch**. Beim ersten Besuch
wird die Sprache des Handys gewählt; oben rechts kann man jederzeit wechseln (die Wahl wird gemerkt).
Direktlink in einer Sprache: `…/klo-check/?lang=tr`

> ⚠️ Die Übersetzungen wurden mit KI erstellt. Bitte vor der Veröffentlichung von
> Muttersprachlern gegenlesen lassen (z. B. Kolleginnen/Kollegen, Integrationsbeirat, Schulen).

**Wo stehen die Texte?**

| Was | Datei |
|---|---|
| Knöpfe, Überschriften, Quiz, Infoseite | `i18n/<sprache>.json` (z. B. `i18n/tr.json`) |
| Produkttexte (Name, Synonyme, Kanal, Tipp, Pointe) | `data/produkte.<sprache>.json` |
| Örtliches: Entsorgungswege, Abteilung, „Wusstest du?“ | `js/config.js` – je Text `{ de: "…", en: "…", … }` |

**Wichtig:** Ampelfarbe und Entsorgungsweg stehen **nur** in der deutschen `produkte.json`.
Übersetzungen können sie nicht verändern – fachlich geprüft wird also nur an einer Stelle.
Fehlt in einer Übersetzung ein Text, erscheint automatisch der deutsche.

**Neues Produkt?** Zuerst in `produkte.json` anlegen (deutsch). Danach in jeder
`produkte.<sprache>.json` unter `"produkte"` einen Eintrag mit derselben `id` ergänzen –
oder weglassen, dann erscheint das Produkt in dieser Sprache auf Deutsch.

**Weitere Sprache hinzufügen** (z. B. Arabisch `ar`):
1. `i18n/en.json` kopieren nach `i18n/ar.json` und die Texte rechts übersetzen.
2. `data/produkte.en.json` kopieren nach `data/produkte.ar.json` und übersetzen.
3. In `js/config.js` bei `sprachen` ergänzen und örtliche Texte um `ar: "…"` erweitern.
4. In `sw.js` die beiden neuen Dateien in `DATEIEN` eintragen und `VERSION` hochzählen.
5. Hinweis für Arabisch/Persisch: Diese Sprachen werden von rechts nach links geschrieben –
   dafür ist noch eine kleine Anpassung im Layout nötig.

## 9. Veröffentlichen (GitHub Pages)

**Einmalig einrichten** (ist bereits erledigt):
Repository → **Settings → Pages** → Source „Deploy from a branch“ → Branch **`main`**, Ordner **`/ (root)`** → Save.

**Änderungen veröffentlichen** – zwei Wege:

*a) Direkt im Browser (am einfachsten, z. B. für `produkte.json`):*
1. Auf github.com die Datei öffnen, oben rechts auf den **Stift ✏️** klicken.
2. Ändern, unten auf **„Commit changes…“**. Bei „Commit directly to the main branch“ bestätigen.
3. Nach 1–2 Minuten ist die Änderung online (Status unter dem Reiter **Actions**: grüner Haken = fertig).

*b) Über den Computer (für größere Änderungen):*
```bash
git pull                      # neuesten Stand holen
# … Dateien ändern, lokal testen (siehe Abschnitt 1) …
git add .
git commit -m "Beschreibung der Änderung"
git push
```

**Wichtig – Offline-Speicher:** Die App speichert sich auf den Handys. Neue Inhalte erscheinen dort
deshalb erst beim **übernächsten** Öffnen (beim ersten Öffnen wird im Hintergrund aktualisiert).
Wenn Dateien **hinzukommen oder wegfallen**, in `sw.js` die Liste `DATEIEN` anpassen und
`VERSION` hochzählen (z. B. `"klocheck-v2"`).

**Hinweis:** Mit einem kostenlosen GitHub-Konto funktioniert Pages nur bei öffentlichen
Repositories. Für einen dauerhaften Betrieb empfiehlt sich später eine eigene Adresse
(z. B. `klo-check.stadtwerke-….de`) – das lässt sich unter Settings → Pages → „Custom domain“ einstellen.

## 10. Auf dem Handy installieren

- **iPhone (Safari):** Seite öffnen → Teilen-Knopf (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“** → Hinzufügen.
- **Android (Chrome):** Seite öffnen → Menü ⋮ → **„App installieren“** bzw. „Zum Startbildschirm hinzufügen“.

**Symbol fehlt auf dem iPhone-Home-Bildschirm?** Safari übernimmt das Symbol nur in dem Moment,
in dem man „Zum Home-Bildschirm“ tippt, und merkt es sich danach. So bekommt man es neu:
1. Das alte Symbol auf dem Home-Bildschirm lange drücken → „App entfernen“ → „Vom Home-Bildschirm entfernen“.
2. Einstellungen → Apps → Safari → Erweitert → Website-Daten → nach `github` suchen → löschen.
3. Seite in Safari neu öffnen, einmal neu laden, dann wieder „Zum Home-Bildschirm“.

Wer das App-Symbol später austauscht, zählt in `index.html` und `manifest.webmanifest` die
Versionsnummer hinter den Symbolen hoch (`?v=2` → `?v=3`), damit alle Geräte es neu laden.

Danach startet Klo-Check wie eine App, ohne Adressleiste – und funktioniert auch ohne Internet
(nur der Barcode-Scan braucht eine Verbindung).

---

## Phase 2 (vorbereitet, nicht aktiv)

- **Foto-Erkennung:** eigener Cloudflare Worker hält den API-Schlüssel geheim; das Modell
  darf nur Produkt-IDs aus `produkte.json` zurückgeben – alle Aussagen bleiben fachlich geprüft.
- **Statistik:** `js/statistik.js` sendet erst, wenn `phase2.statistikUrl` gesetzt ist –
  nur Produkt-ID und Datum, keine IP, keine Cookies.
