// =====================================================================
//  Mini-Quiz "Klo oder nicht Klo?"
//  10 zufällige Produkte aus der Datenbank, je drei Antwortknöpfe
//  (wie die Ampel). Nach jeder Antwort gibt es die Erklärung.
// =====================================================================
import { esc, AMPEL_SYMBOL, teile, mische } from "./helfer.js";
import { tropfi, STIMMUNG_ZUR_AMPEL } from "./tropfi.js";

const ANZAHL = 10;
// Mischung pro Runde: ein paar grüne und gelbe, der Rest rot
const MISCHUNG = { gruen: 2, gelb: 2 };

let ctx = null;   // { main, produkte, t, ausschluss }
let runde = null; // { fragen, nr, punkte, fehler, beantwortet }

export function zeichneQuiz(kontext) {
  ctx = kontext;
  zeigeStart();
}

function waehleFragen() {
  const pool = ctx.produkte.filter((p) => !ctx.ausschluss.includes(p.id));
  const nachFarbe = (f) => mische(pool.filter((p) => p.ampel === f));
  const gruen = nachFarbe("gruen").slice(0, MISCHUNG.gruen);
  const gelb = nachFarbe("gelb").slice(0, MISCHUNG.gelb);
  const rot = nachFarbe("rot").slice(0, ANZAHL - gruen.length - gelb.length);
  return mische([...gruen, ...gelb, ...rot]);
}

function bestwert() {
  try { return Number(localStorage.getItem("klocheck-quiz-bestwert")) || 0; } catch { return 0; }
}
function speichereBestwert(p) {
  try { if (p > bestwert()) localStorage.setItem("klocheck-quiz-bestwert", String(p)); } catch { /* egal */ }
}

// ---------- Startbildschirm ----------
function zeigeStart() {
  const { t } = ctx;
  const best = bestwert();
  ctx.main.innerHTML = `
    <section class="quiz quiz--start">
      ${tropfi("winkt", "tropfi--gross")}
      <h1>${esc(t("quiz.titel"))}</h1>
      <p>${esc(t("quiz.intro", { n: ANZAHL }))}</p>
      ${best ? `<p class="klein">${esc(t("quiz.bestwert", { p: best, n: ANZAHL }))}</p>` : ""}
      <button class="knopf knopf--gross" id="quiz-los">${esc(t("quiz.los"))}</button>
    </section>`;
  document.getElementById("quiz-los").addEventListener("click", () => {
    runde = { fragen: waehleFragen(), nr: 0, punkte: 0, fehler: [] };
    zeigeFrage();
  });
}

// ---------- Eine Frage ----------
function zeigeFrage() {
  const { t } = ctx;
  const p = runde.fragen[runde.nr];
  runde.beantwortet = false;
  const antworten = ["gruen", "gelb", "rot"];
  ctx.main.innerHTML = `
    <section class="quiz" aria-labelledby="quiz-frage">
      <div class="quiz__kopf">
        <span>${esc(t("quiz.frageVon", { nr: runde.nr + 1, n: runde.fragen.length }))}</span>
        <span>${esc(t("quiz.punkte", { p: runde.punkte }))}</span>
      </div>
      <div class="fortschritt" role="progressbar" aria-valuemin="0" aria-valuemax="${runde.fragen.length}" aria-valuenow="${runde.nr}"
           aria-label="${esc(t("quiz.fortschritt"))}"><span style="width:${(runde.nr / runde.fragen.length) * 100}%"></span></div>

      <div class="quiz__produkt">
        <span class="quiz__icon" aria-hidden="true">${p.icon}</span>
        <h1 id="quiz-frage"><span class="quiz__name">${esc(p.name)}</span><span class="quiz__frage">${esc(t("quiz.frage"))}</span></h1>
      </div>

      <div class="quiz__antworten">
        ${antworten.map((a) => `<button class="antwort antwort--${a}" data-antwort="${a}">
            <span class="antwort__symbol" aria-hidden="true">${AMPEL_SYMBOL[a]}</span>${esc(t(`quiz.antwort.${a}`))}</button>`).join("")}
      </div>
      <div id="quiz-feedback" aria-live="assertive"></div>
    </section>`;
  ctx.main.querySelectorAll(".antwort").forEach((b) => b.addEventListener("click", () => beantworte(b.dataset.antwort)));
  ctx.main.querySelector(".antwort").focus();
}

function beantworte(antwort) {
  if (runde.beantwortet) return;
  runde.beantwortet = true;
  const { t } = ctx;
  const p = runde.fragen[runde.nr];
  const richtig = antwort === p.ampel;
  if (richtig) runde.punkte++;
  else runde.fehler.push(p);

  ctx.main.querySelectorAll(".antwort").forEach((b) => {
    b.disabled = true;
    if (b.dataset.antwort === p.ampel) b.classList.add("antwort--richtig");
    else if (b.dataset.antwort === antwort) b.classList.add("antwort--falsch");
  });

  const letzte = runde.nr === runde.fragen.length - 1;
  document.getElementById("quiz-feedback").innerHTML = `
    <div class="feedback feedback--${richtig ? "ja" : "nein"}">
      <p class="feedback__titel">${esc(richtig ? t("quiz.richtig") : t("quiz.falsch", { antwort: t(`ampel.${p.ampel}`) }))}</p>
      <p>${esc(p.kanal)}</p>
      <div class="feedback__pointe">${tropfi(richtig ? "froh" : STIMMUNG_ZUR_AMPEL[p.ampel], "pointe__tropfi")}<p>${esc(p.pointe)}</p></div>
      <button class="knopf knopf--gross" id="quiz-weiter">${esc(t(letzte ? "quiz.auswertung" : "quiz.weiter"))}</button>
    </div>`;
  const weiter = document.getElementById("quiz-weiter");
  weiter.addEventListener("click", () => {
    runde.nr++;
    if (runde.nr < runde.fragen.length) zeigeFrage();
    else zeigeErgebnis();
    window.scrollTo(0, 0);
  });
  weiter.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---------- Ergebnis ----------
function bewertung(punkte, n) {
  const anteil = punkte / n;
  if (anteil === 1) return "quiz.urteil.perfekt";
  if (anteil >= 0.7) return "quiz.urteil.gut";
  if (anteil >= 0.4) return "quiz.urteil.mittel";
  return "quiz.urteil.schwach";
}

function zeigeErgebnis() {
  const { t } = ctx;
  const { punkte, fragen, fehler } = runde;
  const n = fragen.length;
  speichereBestwert(punkte);
  ctx.main.innerHTML = `
    <section class="quiz quiz--ergebnis">
      ${tropfi(punkte === n ? "jubel" : punkte / n >= 0.7 ? "froh" : punkte / n >= 0.4 ? "skeptisch" : "traurig", "tropfi--gross")}
      <h1>${esc(t("quiz.ergebnis", { p: punkte, n }))}</h1>
      <p class="quiz__urteil">${esc(t(bewertung(punkte, n)))}</p>
      ${fehler.length ? `<h2>${esc(t("quiz.nachlesen"))}</h2>
        <ul class="liste">${fehler.map((p) => `<li><a class="zeile zeile--${p.ampel}" href="#/produkt/${p.id}">
          <span class="zeile__icon" aria-hidden="true">${p.icon}</span><span class="zeile__name">${esc(p.name)}</span>
          <span class="ampelpunkt ampelpunkt--${p.ampel}"><span aria-hidden="true">${AMPEL_SYMBOL[p.ampel]}</span> ${esc(t(`ampel.${p.ampel}.kurz`))}</span></a></li>`).join("")}</ul>` : ""}
      <div class="knopfreihe">
        <button class="knopf knopf--gross" id="quiz-teilen">${esc(t("quiz.teilen"))}</button>
        <button class="knopf knopf--hell knopf--gross" id="quiz-nochmal">${esc(t("quiz.nochmal"))}</button>
      </div>
    </section>`;
  document.getElementById("quiz-nochmal").addEventListener("click", () => {
    runde = { fragen: waehleFragen(), nr: 0, punkte: 0, fehler: [] };
    zeigeFrage();
  });
  document.getElementById("quiz-teilen").addEventListener("click", () => {
    const url = location.href.split("#")[0] + "#/quiz";
    teile({ titel: t("app.titel"), text: t("quiz.teilText", { p: punkte, n }), url, kopiertMeldung: t("teilen.kopiert") });
  });
}
