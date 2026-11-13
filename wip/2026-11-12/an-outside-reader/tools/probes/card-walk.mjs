// Every word's card, opened in the page's own way and read off the page, timed: what a recording of the cards
// would cost, and what the cards hold. For each word of the sections asked for, the open card is closed, the word
// is pressed as a reader presses it, and when the readings have arrived the card is read: its divisions and blocks
// as their rows print them, and every pill (its text, its title, the sources behind it).
// node card-walk.mjs <reader dir> <zone url base> <book> <first section> <count or 0 for all> <out.json> [--lift] [--rungs]
//   --lift    every switch lifted first: the pointing "keep", every source on, signs printed
//   --rungs   after the opening state, every division is pressed and every block of it, and the pills counted
//             (this presses the card's own buttons, so it rules divisions as a reader would: a throwaway visit)
// Nothing is written but the dump asked for. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
const argv = process.argv.slice(2);
const flag = (f) => { const i = argv.indexOf(f); if (i < 0) return false; argv.splice(i, 1); return true; };
const LIFT = flag("--lift"), RUNGS = flag("--rungs");
const [reader, base, book, fromArg, countArg, out] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const ix = JSON.parse(readFileSync(join(reader, "data/route-store/index.json"), "utf8"));
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
const t00 = Date.now();
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
if (LIFT) {
  await p.evaluate(() => { localStorage.setItem("fh.masorah", "keep"); localStorage.setItem("fh.signs", "printed"); localStorage.setItem("fh.sources.off", "[]"); localStorage.setItem("fh.sources.shelve", "[]"); });
  await p.reload({ waitUntil: "networkidle" });
}
await p.waitForSelector("section.seg");
await p.waitForFunction(() => !!(window.__latticeStore || window.__latticeRefused) || !(window.__zone && window.__zone.emitted_from && window.__zone.emitted_from.toggles && window.__zone.emitted_from.toggles.lattice), null, { timeout: 60000 });
const state = await p.evaluate(() => ({ masorah: window.__masorah, signs: window.__signs, off: window.__sourcesOff || [], sections: document.querySelectorAll("section.seg").length }));
const FROM = Number(fromArg), TO = Number(countArg) ? Math.min(state.sections, FROM + Number(countArg)) : state.sections;
const tLoad = Date.now() - t00;
const t0 = Date.now();
const got = await p.evaluate(async ({ from, to, rungs }) => {
  const hud = document.getElementById("hud");
  // a turn of the event loop given back to the page, with no timer's floor under it
  const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });
  const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
  const waitSettled = async (ms) => { const t = performance.now(); while (!settled()) { if (performance.now() - t > ms) return false; await turn(); } return true; };
  const press = (el) => (el.querySelector(".w span") || el.querySelector(".w") || el).click();
  const band = (q) => [...hud.querySelectorAll(`:scope > .rows > ${q} .s-pills button`)].map((x) => [x.textContent, x.getAttribute("aria-pressed") === "true"]);
  const readCard = () => {
    const read = hud.querySelector(":scope > .rows > .b-read");
    const pl = read.querySelector(":scope > .r-pills");
    return {
      q: band(".b-q"), chain: band(".b-chain"), chainCell: band(".b-chain-cell"), cuts: band(".b-cut"), cells: band(".b-cell"),
      label: (read.querySelector(":scope > .r-label") || {}).textContent || "",
      pieces: [...read.querySelectorAll(":scope > .r-piece")].map((x) => { const chip = x.querySelector(".g-lic"); const v = x.querySelector("b"); return [x.className, v ? v.textContent : "", chip ? (chip.dataset.line || "") : "", chip ? chip.title : ""]; }),
      pills: pl ? [...pl.querySelectorAll(":scope > button")].map((x) => [x.textContent, x.title, x.dataset.by || "", x.dataset.grade || "", x.dataset.pointer || "", x.getAttribute("aria-pressed") === "true" ? 1 : 0]) : [],
      lead: pl ? [...(window.__poolLead || [])] : [], ov: pl ? [...(window.__poolOv || [])] : [], place: pl ? [...(window.__poolPlace || [])] : [],
      data: pl ? { ...pl.dataset } : {},
      notes: [...read.querySelectorAll(":scope > p:not(.r-label):not(.r-piece)")].map((x) => [x.className, x.textContent]),
    };
  };
  window.__materialise(from, to);
  const secs = [...document.querySelectorAll("section.seg")];
  const out = [];
  let words = 0, slow = 0, unsettled = 0, presses = 0, pressPills = 0, pressMs = 0;
  for (let i = from; i < to; i += 1) {
    const sec = secs[i];
    const wbs = [...sec.querySelectorAll(".he-text .wb:not(.mark)")];
    const cards = [];
    for (let n = 0; n < wbs.length; n += 1) {
      const wb = wbs[n];
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      if (!hud.hidden || hud.children.length) { cards.push({ n: n + 1, fault: "the card before did not close" }); continue; }
      const t = performance.now();
      window.__pool = null; window.__poolLead = null; window.__poolOv = null; window.__poolPlace = null;
      press(wb);
      const ok = await waitSettled(15000);
      const ms = performance.now() - t;
      words += 1; if (ms > 250) slow += 1;
      if (!ok) { unsettled += 1; cards.push({ n: n + 1, fault: "the readings did not arrive in 15 s", ms }); continue; }
      const card = readCard();
      card.n = n + 1; card.ms = Math.round(ms * 10) / 10; card.s = wb.__word ? wb.__word.s : ""; card.k = wb.__word ? wb.__word.k : ""; card.run = !!wb.closest(".wjoin"); card.pair = !!(wb.__word && Array.isArray(wb.__word.w));
      if (rungs) {
        // every division pressed, and every block of it: the buttons are asked for again after each press, since a press draws its rows again
        const tr = performance.now();
        const rung = [];
        const nCuts = Math.max(1, hud.querySelectorAll(":scope > .rows > .b-cut .s-pills button").length);
        for (let c = 0; c < nCuts; c += 1) {
          const cb = hud.querySelectorAll(":scope > .rows > .b-cut .s-pills button")[c];
          if (cb) { if (cb.getAttribute("aria-pressed") !== "true") { cb.click(); presses += 1; if (!(await waitSettled(15000))) { rung.push({ c, fault: "unsettled" }); break; } } }
          const wholeN = hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button").length;
          const cellsNow = band(".b-cell");
          const blocks = [];
          const nCells = hud.querySelectorAll(":scope > .rows > .b-cell .s-pills button").length;
          // a card that opened another word's card on the press (a chain's words) is left as it is
          if (!hud.querySelector(":scope > .rows")) { rung.push({ c, fault: "the press opened another card" }); break; }
          for (let x = 0; x < nCells; x += 1) {
            const xb = hud.querySelectorAll(":scope > .rows > .b-cell .s-pills button")[x];
            if (!xb) break;
            if (xb.getAttribute("aria-pressed") !== "true") { xb.click(); presses += 1; if (!(await waitSettled(15000))) { blocks.push(-1); continue; } }
            const np = hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button").length;
            blocks.push(np); pressPills += np;
          }
          rung.push({ c, cut: cb ? cb.textContent : "", whole: wholeN, cells: cellsNow.map((y) => y[0]), blocks });
        }
        card.rungs = rung; pressMs += performance.now() - tr;
      }
      cards.push(card);
    }
    out.push({ i, label: sec.__sec ? sec.__sec.label : "", cards });
  }
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  return { out, words, slow, unsettled, presses, pressPills, pressMs };
}, { from: FROM, to: TO, rungs: RUNGS });
const tWalk = Date.now() - t0;
await b.close();
const labelOf = (m) => (ix.m_sources[m] && ix.m_sources[m].label) || null;
const T = { words: 0, opened: 0, faults: 0, pills: 0, noPills: 0, pieces: 0, cuts: 0, wordsWithCuts: 0, chainCards: 0, qCards: 0, titleNoLabel: 0, titleNotLead: 0, ovPills: 0, placePills: 0, pointer: 0, pillsInRuns: 0 };
const eg = { titleNotLead: [], titleNoLabel: [], faults: [], noPills: [] };
const labels = [...new Set(Object.values(ix.m_sources).map((s) => s && s.label).filter(Boolean))].sort((x, y) => y.length - x.length);
let msSum = 0, msMax = 0;
for (const s of got.out) for (const c of s.cards) {
  T.words += 1;
  if (c.fault) { T.faults += 1; if (eg.faults.length < 8) eg.faults.push(`${s.label}:${c.n} ${c.fault}`); continue; }
  T.opened += 1; msSum += c.ms; msMax = Math.max(msMax, c.ms);
  T.pills += c.pills.length; if (!c.pills.length) { T.noPills += 1; if (eg.noPills.length < 6) eg.noPills.push(`${s.label}:${c.n} ${JSON.stringify(c.notes.map((x) => x[1].slice(0, 60)))}`); }
  T.pieces += c.pieces.length;
  if (c.cuts.length) { T.wordsWithCuts += 1; T.cuts += c.cuts.length; }
  if (c.chain.length) T.chainCards += 1;
  if (c.q.length) T.qCards += 1;
  if (c.run) T.pillsInRuns += c.pills.length;
  c.pills.forEach((pl, x) => {
    const title = pl[1];
    const lab = labels.find((l) => title === l || title.endsWith(` · ${l}`));
    if (!lab) { T.titleNoLabel += 1; if (eg.titleNoLabel.length < 8) eg.titleNoLabel.push(`${s.label}:${c.n} ${JSON.stringify(pl[0].slice(0, 40))} title ${JSON.stringify(title)} by ${pl[2]} ov ${c.ov[x] || ""}`); }
    else if (c.lead[x] && labelOf(c.lead[x]) && labelOf(c.lead[x]) !== lab) { T.titleNotLead += 1; if (eg.titleNotLead.length < 8) eg.titleNotLead.push(`${s.label}:${c.n} ${JSON.stringify(pl[0].slice(0, 40))} title says ${lab}, the lead record is ${c.lead[x]} ${labelOf(c.lead[x])}`); }
    if (c.ov[x]) T.ovPills += 1;
    if (c.place[x]) T.placePills += 1;
    if (pl[4]) T.pointer += 1;
  });
}
console.log(`${book} sections ${FROM}..${TO - 1} · switches ${LIFT ? "lifted" : "at rest"}: pointing ${state.masorah}, signs ${state.signs}, sources off ${JSON.stringify(state.off)}`);
console.log(`  loaded in ${tLoad} ms · walked in ${tWalk} ms · ${T.words} words · ${T.opened} cards read · ${T.faults} faults · per card ${(msSum / Math.max(1, T.opened)).toFixed(1)} ms mean, ${msMax.toFixed(0)} ms max · ${got.slow} over 250 ms`);
console.log(`  ${T.pills} pills · ${T.noPills} cards with no pill · ${T.pieces} "here the source reads" lines · ${T.wordsWithCuts} cards list divisions (${T.cuts} divisions) · ${T.chainCards} cards carry a chain's rows · ${T.qCards} a forms row`);
console.log(`  pills from an overlay ${T.ovPills} · on a place's own reading ${T.placePills} · pointer pills ${T.pointer} · a title naming no label an index holds ${T.titleNoLabel} · a title naming another label than the lead record's ${T.titleNotLead}`);
if (RUNGS) console.log(`  rungs: ${got.presses} presses · ${got.pressPills} pills behind them · ${Math.round(got.pressMs)} ms`);
for (const [k, v] of Object.entries(eg)) if (v.length) console.log(`  ${k}: ${v.join(" | ")}`);
writeFileSync(out, `${JSON.stringify({ book, lift: LIFT, state, tLoad, tWalk, totals: T, sections: got.out })}\n`);
console.log(`dump: ${out}`);
