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
      { de: "Ein einziges Feuchttuch zerfällt im Kanal nicht – auch nach Tagen nicht.",
        en: "A single wet wipe does not break down in the sewer – not even after days.",
        tr: "Tek bir ıslak mendil bile kanalda dağılmaz – günler sonra bile.",
        ru: "Даже одна влажная салфетка не распадается в канализации – и через несколько дней.",
        uk: "Навіть одна волога серветка не розпадається в каналізації – і через кілька днів." },
      { de: "Jede Pumpenstörung durch Verzopfungen bezahlen am Ende alle über die Abwassergebühr.",
        en: "Every pump breakdown caused by tangled wipes is paid for by everyone through the wastewater fee.",
        tr: "Mendillerin dolanmasından kaynaklanan her pompa arızasını sonunda herkes atık su ücretiyle öder.",
        ru: "Каждую поломку насоса из-за намотанных салфеток в итоге оплачивают все – через плату за водоотведение.",
        uk: "Кожну поломку насоса через намотані серветки зрештою оплачують усі – через плату за водовідведення." },
    ],
  },

  // ---------- Kontakt (Infoseite, Fußzeile) ----------
  kontakt: {
    abteilung: { de: "Abteilung Entwässerung", en: "Wastewater department", tr: "Atık su bölümü", ru: "Отдел водоотведения", uk: "Відділ водовідведення" },
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
  // Die Übersetzungen (en, tr, ru, uk) wurden mit KI erstellt – bitte von
  // Muttersprachlern prüfen lassen. Eine Sprache entfernen = aus der Liste löschen.
  sprachen: ["de", "en", "tr", "ru", "uk"],

  // ---------- Fachliche Prüfung ----------
  // true = Einträge mit "geprueft": false bekommen ein Hinweis-Schild.
  // Vor der Veröffentlichung auf false stellen.
  zeigePruefstatus: true,

  // ---------- Örtliche Entsorgungswege ----------
  // Die Produkte in data/produkte.json verweisen nur auf diese Schlüssel
  // (z. B. "restmuell"). Was das vor Ort genau heißt, steht hier.
  // ⚠ ALLE ANGABEN SIND PLATZHALTER und müssen mit dem örtlichen
  //   Abfallentsorger (z. B. Abfall-Service Osterholz) abgestimmt werden.
  //
  // Texte können einfach "Text" sein oder je Sprache { de: "…", en: "…", … }.
  // Fehlt eine Sprache, wird Deutsch angezeigt. Die deutschen Fachbegriffe
  // (z. B. „Gelber Sack“) stehen in den Übersetzungen in Klammern, damit man
  // sie auf Tonnen und Schildern wiedererkennt.
  ziele: {
    klo: { icon: "🚽",
      titel: { de: "Ab ins Klo", en: "Into the toilet", tr: "Tuvalete", ru: "В унитаз", uk: "В унітаз" },
      text:  { de: "Genau dafür ist die Toilette da. Spülen – fertig!", en: "That’s exactly what the toilet is for. Flush – done!", tr: "Tuvalet tam da bunun için var. Sifonu çek – bitti!", ru: "Именно для этого и нужен унитаз. Смыть – готово!", uk: "Саме для цього й потрібен унітаз. Змити – готово!" } },
    ausguss: { icon: "🚰",
      titel: { de: "Spüle, Waschbecken oder Klo", en: "Sink, washbasin or toilet", tr: "Evye, lavabo veya tuvalet", ru: "Мойка, раковина или унитаз", uk: "Мийка, умивальник або унітаз" },
      text:  { de: "In normalen Haushaltsmengen in Ordnung. Sparsam dosieren hilft der Kläranlage.", en: "Fine in normal household amounts. Using it sparingly helps the treatment plant.", tr: "Normal ev miktarlarında sorun yok. Az kullanmak arıtma tesisine yardımcı olur.", ru: "В обычных бытовых количествах – можно. Экономное использование помогает очистным сооружениям.", uk: "У звичайних побутових кількостях – можна. Економне використання допомагає очисним спорудам." } },
    restmuell: { icon: "🗑️",
      titel: { de: "Restmüll", en: "General waste (Restmüll)", tr: "Evsel çöp (Restmüll)", ru: "Остаточные отходы (Restmüll)", uk: "Залишкові відходи (Restmüll)" },
      text:  { de: "Graue bzw. schwarze Tonne. Am besten gut verpackt.", en: "Grey or black bin. Best well wrapped.", tr: "Gri veya siyah çöp kutusu. Tercihen iyice paketlenmiş olarak.", ru: "Серый или чёрный бак. Лучше хорошо упаковать.", uk: "Сірий або чорний бак. Краще добре запакувати." } },
    biotonne: { icon: "🍂",
      titel: { de: "Biotonne / Kompost", en: "Organic waste bin / compost (Biotonne)", tr: "Organik atık kutusu / kompost (Biotonne)", ru: "Биоотходы / компост (Biotonne)", uk: "Біовідходи / компост (Biotonne)" },
      text:  { de: "Braune Tonne. Was genau hinein darf, regelt der Abfallentsorger.", en: "Brown bin. Your local waste service decides exactly what goes in.", tr: "Kahverengi kutu. İçine tam olarak neyin girebileceğini atık şirketi belirler.", ru: "Коричневый бак. Что именно туда можно, решает служба вывоза мусора.", uk: "Коричневий бак. Що саме туди можна, визначає служба вивезення сміття." } },
    gelber_sack: { icon: "♻️",
      titel: { de: "Gelber Sack / Gelbe Tonne", en: "Yellow bag / yellow bin (Gelber Sack)", tr: "Sarı torba / sarı kutu (Gelber Sack)", ru: "Жёлтый мешок / жёлтый бак (Gelber Sack)", uk: "Жовтий мішок / жовтий бак (Gelber Sack)" },
      text:  { de: "Verpackungen aus Kunststoff, Metall und Verbundstoff.", en: "Packaging made of plastic, metal and composite materials.", tr: "Plastik, metal ve kompozit ambalajlar.", ru: "Упаковка из пластика, металла и комбинированных материалов.", uk: "Упаковка з пластику, металу та комбінованих матеріалів." } },
    altpapier: { icon: "📰",
      titel: { de: "Altpapier", en: "Paper recycling (Altpapier)", tr: "Atık kâğıt (Altpapier)", ru: "Макулатура (Altpapier)", uk: "Макулатура (Altpapier)" },
      text:  { de: "Blaue Tonne: sauberes Papier, Pappe und Kartons.", en: "Blue bin: clean paper, cardboard and boxes.", tr: "Mavi kutu: temiz kâğıt, mukavva ve kartonlar.", ru: "Синий бак: чистая бумага, картон и коробки.", uk: "Синій бак: чистий папір, картон і коробки." } },
    altglas: { icon: "🍾",
      titel: { de: "Altglascontainer", en: "Glass container (Altglas)", tr: "Cam kumbarası (Altglas)", ru: "Контейнер для стекла (Altglas)", uk: "Контейнер для скла (Altglas)" },
      text:  { de: "Nach Farben getrennt: weiß, braun, grün.", en: "Sorted by colour: white, brown, green.", tr: "Renge göre ayrılmış: beyaz, kahverengi, yeşil.", ru: "Раздельно по цветам: белое, коричневое, зелёное.", uk: "Окремо за кольорами: біле, коричневе, зелене." } },
    altkleider: { icon: "👕",
      titel: { de: "Altkleidercontainer", en: "Clothing container (Altkleider)", tr: "Eski giysi kumbarası (Altkleider)", ru: "Контейнер для одежды (Altkleider)", uk: "Контейнер для одягу (Altkleider)" },
      text:  { de: "Saubere, tragbare Textilien. Kaputtes in den Restmüll.", en: "Clean, wearable textiles. Broken items go into general waste.", tr: "Temiz, giyilebilir tekstiller. Yırtık olanlar evsel çöpe.", ru: "Чистый, пригодный для носки текстиль. Испорченное – в остаточные отходы.", uk: "Чистий текстиль, придатний для носіння. Зіпсоване – у залишкові відходи." } },
    schadstoff: { icon: "☣️", link: null,
      titel: { de: "Schadstoffmobil / Wertstoffhof", en: "Hazardous waste collection (Schadstoffmobil)", tr: "Zararlı atık toplama aracı (Schadstoffmobil)", ru: "Сбор опасных отходов (Schadstoffmobil)", uk: "Збір небезпечних відходів (Schadstoffmobil)" },
      text:  { de: "Kostenlose Annahme von Schadstoffen aus dem Haushalt. Termine beim Abfallentsorger.", en: "Free collection of hazardous household waste. Dates from your local waste service.", tr: "Evdeki zararlı maddeler ücretsiz kabul edilir. Tarihler atık şirketinden öğrenilir.", ru: "Бесплатный приём опасных бытовых отходов. Даты – у службы вывоза мусора.", uk: "Безкоштовний прийом небезпечних побутових відходів. Дати – у служби вивезення сміття." } },
    wertstoffhof: { icon: "🏗️", link: null,
      titel: { de: "Wertstoffhof", en: "Recycling centre (Wertstoffhof)", tr: "Geri dönüşüm merkezi (Wertstoffhof)", ru: "Пункт приёма вторсырья (Wertstoffhof)", uk: "Пункт прийому вторсировини (Wertstoffhof)" },
      text:  { de: "Für größere Mengen, Bauschutt und Sonderfälle.", en: "For larger amounts, building rubble and special cases.", tr: "Büyük miktarlar, inşaat molozu ve özel durumlar için.", ru: "Для больших объёмов, строительного мусора и особых случаев.", uk: "Для великих обсягів, будівельного сміття та особливих випадків." } },
    handel: { icon: "🏪",
      titel: { de: "Rückgabe im Handel", en: "Return to the shop", tr: "Mağazaya iade", ru: "Возврат в магазин", uk: "Повернення в магазин" },
      text:  { de: "Läden, die so etwas verkaufen, müssen es auch zurücknehmen.", en: "Shops that sell these items must also take them back.", tr: "Bunları satan mağazalar geri almak zorundadır.", ru: "Магазины, которые это продают, обязаны принимать обратно.", uk: "Магазини, які це продають, зобов’язані приймати назад." } },
    apotheke: { icon: "💊",
      titel: { de: "Apotheke (freiwillig)", en: "Pharmacy (voluntary)", tr: "Eczane (gönüllü)", ru: "Аптека (добровольно)", uk: "Аптека (добровільно)" },
      text:  { de: "Viele Apotheken nehmen Altmedikamente zurück – nachfragen lohnt sich.", en: "Many pharmacies take back old medicines – it’s worth asking.", tr: "Birçok eczane eski ilaçları geri alır – sormaya değer.", ru: "Многие аптеки принимают старые лекарства – стоит спросить.", uk: "Багато аптек приймають старі ліки – варто запитати." } },
    waschanlage: { icon: "🚗",
      titel: { de: "Autowaschanlage", en: "Car wash", tr: "Oto yıkama", ru: "Автомойка", uk: "Автомийка" },
      text:  { de: "Dort wird das Wasser über einen Ölabscheider gereinigt.", en: "There the water is cleaned by an oil separator.", tr: "Orada su bir yağ ayırıcıyla temizlenir.", ru: "Там вода очищается в маслоотделителе.", uk: "Там вода очищується в маслоуловлювачі." } },
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
