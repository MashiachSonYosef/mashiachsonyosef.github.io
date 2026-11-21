#!/usr/bin/env node
// RUN: tree
// GUARDS: default-spans-rule-v1-a-default-sources-line-that-reads-several-words-is-one-unit-of-those-words-read-from-the-sources-own-data
// LEDGER: -
// no frame letter. A check reads the spans' pin, the default picks' book files and receipt, the zones and, where it
// is on this machine, the corpus lane's spans list, opens the reader under each default source, and judges them; it
// is not the ledger for one.
//
// A DEFAULT SOURCE'S LINE THAT READS SEVERAL WORDS IS ONE UNIT OF THOSE WORDS, READ FROM THE SOURCE'S OWN DATA
// (tools/default-spans-v1.mjs says the rule whole). The corpus lane's spans list (relay v209) gives the words each
// default-pick line reads; tools/bake-default-picks-v1.mjs lays each source's units in the book's file; the page
// reads a unit's words as one (zone.html dfltSpanUnit): one line over them where they stand in one cell, each word
// as it rests where they stand apart, the card saying what the source reads across them.
//
// S1  the pin: its shape, the rule and the two receipts kept beside it as the bytes it names, the receipt naming
//     the list by the pin's bytes, the second count agreeing; and the bake's receipt carrying the spans under this
//     rule, by the pin's bytes.
// S2  every book's file: its spans are units of two or more words, each word a place of the zone that is no mark,
//     each unit filed at one place or more, no place in two units of one source; the counts are the receipt's.
//     With the list on this machine (--ledger <dir>, or DEFAULT_PICKS_LEDGER): each book's spans are this check's
//     own recount of the list through the one reading, and a book the list gives no unit carries none.
// S3  ON THE PAGE, under each of MACULA, UBS and BDB set first, every book that carries a unit of it: at every
//     unit whose line is filed with a line of the source, no name stands twice. Where a line credited to the source
//     stands under any word of the unit, one line stands over all the unit's words, the source's; and no line of the
//     source stands under a place a unit's line is filed beside. Counted: the units read as one line, and the units
//     whose every word rests. Each source with a unit to print shows some of the first.
// S4  ON THE PAGE, THE CARD: at the first unit of each source drawn as one line, the card a press on its first word
//     opens says the line's reading once; at the first unit of each source whose words rest apart, the card says
//     the source reads the words as one, and gives its reading as one reading of those words.
//
// Run (from reader/):
//   node tools/check-default-spans-v1.mjs [--ledger <dir holding spans-v1/>] [--node] [--only <book,book>]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PinFault, sha256Of } from "./pinned-v1.mjs";
import { DEFAULT_SPANS_RULE_ID, DEFAULT_SPANS_HOME, SPAN_SOURCES, readDefaultSpansPin, readDefaultSpans, unitsOfBook } from "./default-spans-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const NODE_ONLY = process.argv.includes("--node");
const ONLY = (arg("only") || "").split(",").filter(Boolean);
const LEDGER = arg("ledger", process.env.DEFAULT_PICKS_LEDGER || null);
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const side = (n, d) => console.log(`  --  ${n}  ·  ${d}`);
const n0 = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const first = (a, k = 3) => a.slice(0, k).join(" | ") + (a.length > k ? ` | and ${n0(a.length - k)} more` : "");
const PIN = join(K3, DEFAULT_SPANS_HOME, "PIN.json");
const CREDIT = { macula: "M3", ubs: "M18", bdb: "M46" };
const SLOT = { step: 0, macula: 1, ubs: 2, bdb: 3 };
const PILL = { macula: "MACULA", ubs: "UBS", bdb: "BDB" };

console.log("check-default-spans-v1");
if (!existsSync(PIN)) { console.log(`SKIPPED — this tree pins no spans list (${DEFAULT_SPANS_HOME}/PIN.json)`); process.exit(3); }

// S1 · the pin and the receipt
let pin = null, pinFault = "";
try { pin = readDefaultSpansPin(PIN); } catch (e) { if (!(e instanceof PinFault)) throw e; pinFault = e.message; }
const receipt = JSON.parse(readFileSync(join(K3, "data", "default-picks-receipt-v1.json"), "utf8"));
const rs = receipt.spans || null;
{
  const f = [];
  if (!pin) f.push(pinFault);
  else {
    if (!rs) f.push("the default picks' receipt carries no spans");
    else {
      if (rs.rule_id !== DEFAULT_SPANS_RULE_ID) f.push("the receipt's spans stand under another rule");
      if (!rs.pin || rs.pin.sha256 !== sha256Of(readFileSync(PIN))) f.push("the receipt names another pin than the one in this tree");
      if (!rs.pin || !rs.pin.list || rs.pin.list.sha256 !== pin.spans.sha256 || rs.pin.list.bytes !== pin.spans.bytes) f.push("the receipt names another list than the pin");
    }
  }
  check("S1  the pin, its rule and its two receipts as the bytes it names, the list named alike by the lane's receipt, the second count agreeing, and the bake's receipt carrying the spans by this pin", !f.length,
    f.length ? first(f) : `relay ${pin.relay}: ${pin.spans.file}, ${n0(pin.spans.lines)} lines, ${n0(pin.spans.bytes)} bytes`);
}
if (!pin || !rs) { console.log(`\n${bad} FAILED`); process.exit(1); }

// S2 · the book files
const IX = JSON.parse(readFileSync(join(K3, "data", "default-picks", "index.json"), "utf8"));
const BOOKS = Object.keys(IX.books).filter((b) => !ONLY.length || ONLY.includes(b));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const bookFile = new Map(), zoneOf = new Map();
const zone = (b) => { if (!zoneOf.has(b)) zoneOf.set(b, gz(join(K3, "data", "zones", `${b}.bin`))); return zoneOf.get(b); };
// a zone's entries in WORD_N order: null at a mark, else the place's label and its seat [section, entry]
const entriesOf = (b) => {
  const out = [];
  (zone(b).sections || []).forEach((sec, si) => { let k = 0; (sec.words || []).forEach((w, ei) => out.push(w && w.mark ? null : { label: `${sec.label}:${++k}`, si, ei, kq: !!w.kq })); });
  return out;
};
const entries = new Map();
const total = Object.fromEntries(SPAN_SOURCES.map((x) => [x, { units: 0, words: 0, filed_beside: 0, filed_with_a_line: 0 }]));
// whether a source has a line at place n, by the bake's own counting rule: the word no pair (a ketiv/qere word
// takes no source's line), and the pick's words a letter or a digit and not NO DATA YET
const linePick = (t) => typeof t === "string" && /[\p{L}\p{N}]/u.test(t) && t !== "NO DATA YET";
const hasLine = (bf, src, n, es) => {
  const at = bf.places[n - 1], slot = at ? at[SLOT[src]] : 0;
  if (!slot || (es[n - 1] && es[n - 1].kq)) return false;
  if (src === "macula") return linePick(slot);
  if (src === "ubs") return linePick(slot[0]);
  return Array.isArray(slot[0]) && slot[0][1] > 0 && linePick(bf.bdb_words[slot[0][1] - 1]);
};
{
  const f = [];
  for (const b of BOOKS) {
    const bf = gz(join(K3, "data", "default-picks", IX.books[b].file));
    bookFile.set(b, bf);
    const es = entriesOf(b);
    entries.set(b, es);
    const sp = bf.spans;
    if (!sp || sp.rule_id !== DEFAULT_SPANS_RULE_ID) { f.push(`${b}: its file carries no spans under this rule`); continue; }
    for (const x of SPAN_SOURCES) {
      const seen = new Set();
      if (!Array.isArray(sp[x])) { f.push(`${b}: no list of ${x}'s units`); continue; }
      let prev = 0;
      for (const u of sp[x]) {
        const ok = Array.isArray(u) && u.length === 2 && Array.isArray(u[0]) && u[0].length >= 2 && Array.isArray(u[1]) && u[1].length >= 1
          && [...u[0], ...u[1]].every((n) => Number.isInteger(n) && n >= 1 && n <= es.length && es[n - 1]) && u[0].every((n, i) => !i || n > u[0][i - 1]);
        if (!ok) { f.push(`${b}: a unit of ${x} is not [[words in order], [places filed at]], each a word of the zone (${JSON.stringify(u).slice(0, 80)})`); continue; }
        if (u[0].some((n) => seen.has(n))) f.push(`${b} ${es[u[0][0] - 1].label}: a place stands in two units of ${x}`);
        if (u[0][0] <= prev) f.push(`${b} ${es[u[0][0] - 1].label}: ${x}'s units are not in the order of their first word`);
        prev = u[0][0];
        for (const n of u[0]) seen.add(n);
        const t = total[x];
        t.units += 1; t.words += u[0].length; t.filed_beside += u[1].filter((n) => !u[0].includes(n)).length;
        if (u[1].some((n) => hasLine(bf, x, n, es))) t.filed_with_a_line += 1;
      }
    }
  }
  if (!ONLY.length) for (const x of SPAN_SOURCES) for (const k of Object.keys(total[x])) if ((rs.by_source[x] || {})[k] !== total[x][k]) f.push(`the receipt counts ${x}'s ${k} as ${(rs.by_source[x] || {})[k]} and the book files hold ${total[x][k]}`);
  check("S2  every book's spans: units of two or more words in order, each a word of the zone, filed at a place of it, no place in two units of one source, counted as the receipt counts them", !f.length,
    f.length ? first(f) : SPAN_SOURCES.map((x) => `${PILL[x]} ${n0(total[x].units)} units over ${n0(total[x].words)} words, ${n0(total[x].filed_with_a_line)} filed with a line`).join(" · "));
}
if (!LEDGER) side("S2  the recount of the list not judged here", "the corpus lane's spans list is not on this machine (--ledger <dir holding spans-v1/>, or DEFAULT_PICKS_LEDGER)");
else {
  const f = [];
  let read = null;
  try { read = readDefaultSpans(PIN, LEDGER); } catch (e) { if (!(e instanceof PinFault)) throw e; f.push(e.message); }
  let lines = 0;
  if (read) for (const b of BOOKS) {
    const es = entries.get(b), nOf = new Map();
    es.forEach((e, i) => { if (e) nOf.set(e.label, i + 1); });
    let units = null;
    try { units = unitsOfBook(b, read.byBook.get(b) || [], nOf); } catch (e) { if (!(e instanceof PinFault)) throw e; f.push(e.message); continue; }
    for (const x of SPAN_SOURCES) {
      lines += units[x].lines;
      const want = JSON.stringify(units[x].units.map((u) => [u.places.map((p) => nOf.get(p)), u.filed.map((p) => nOf.get(p))]));
      if (want !== JSON.stringify(((bookFile.get(b) || {}).spans || {})[x])) f.push(`${b}: ${x}'s units in its file are not the list's (${units[x].units.length} by the list)`);
    }
  }
  if (read && !ONLY.length) { const strays = [...read.byBook.keys()].filter((b) => !IX.books[b]); if (strays.length) f.push(`the list lands lines in ${first(strays)}, which the index does not list`); }
  check("S2  with the list on this machine: each book's spans are this check's recount of the list through the one reading", !f.length, f.length ? first(f) : `${n0(lines)} lines landed in ${n0(BOOKS.length)} books`);
}

if (NODE_ONLY) { console.log(bad ? `\n${bad} FAILED` : "\nall checks passed (the laws that open no page)"); process.exit(bad ? 1 : 0); }

// S3, S4 · on the page
const unitsOf = (b, x) => (bookFile.get(b).spans[x] || []).map((u) => ({ ns: u[0], filed: u[1], lineAt: u[1].find((n) => hasLine(bookFile.get(b), x, n, entries.get(b))) || null }));
const wordsInPage = () => [...document.querySelectorAll("section.seg")].map((s) => { const he = s.querySelector(".he-text"); const wbs = he ? [...he.querySelectorAll(".wb")] : []; return wbs.map((w) => { const r = w.closest(".wjoin"); return r ? wbs.indexOf(r.querySelector(".wb")) : wbs.indexOf(w); }); });
const cardInPage = () => {
  const h = document.querySelector("#hud");
  if (!h || h.hidden) return null;
  const t = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : "");
  return { label: t(h.querySelector(".r-now .k")), said: t(h.querySelector(".r-now .v")), dflt: [...h.querySelectorAll(".r-dflt")].map((el) => ({ src: el.dataset.src || "", text: t(el) })) };
};
const tree = await serveTree(K3);
const pw = await loadPlaywright();
const S3 = Object.fromEntries(SPAN_SOURCES.map((x) => [x, { faults: [], one: 0, rests: 0, books: 0, cards: [], cardFaults: [] }]));
const readSource = async (x) => {
  const R = S3[x];
  const browser = await pw.chromium.launch(launchOptions());
  let oneCard = false, restCard = false;
  try {
    for (const b of BOOKS) {
      const units = unitsOf(b, x).filter((u) => u.lineAt);
      const beside = unitsOf(b, x).flatMap((u) => (u.lineAt ? u.filed.filter((n) => !u.ns.includes(n)) : []));
      if (!units.length) continue;
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
      try {
        const p = await ctx.newPage();
        const errors = [];
        p.on("pageerror", (e) => errors.push(String(e && e.message)));
        await p.addInitScript((src) => { try { localStorage.setItem("fh.defaults", src); } catch { /* none */ } }, x);
        await p.goto(`${tree.base}/zone.html?b=${b}`, { waitUntil: "networkidle" });
        const drew = await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }).then(() => true, () => false);
        if (!drew) { R.faults.push(`${b}: the page drew no word within a minute${errors.length ? ` (it threw: ${errors[0]})` : ""}`); continue; }
        let got = null;
        try { got = await linesOnPage(p, {}); } catch (e) { R.faults.push(`${b}: ${String(e.message || e).split("\n")[0].slice(0, 140)}`); continue; }
        if (got.state.defaults !== x || got.state.pointing !== "only") { R.faults.push(`${b}: the page did not open under ${PILL[x]} as a first visit would (${JSON.stringify(got.state).slice(0, 120)})`); continue; }
        R.books += 1;
        const es = entries.get(b);
        const lineOver = (n) => { const e = es[n - 1]; return ((got.sections[e.si] || {}).units || []).find((u) => e.ei >= u[0] && e.ei < u[0] + u[1]) || null; };
        const said = (n) => { const u = lineOver(n); return `${es[n - 1].label}: ${u ? `«${u[2]}» (${u[3] || "no credit"})` : "no line"}`; };
        let firstOne = null, firstRest = null;
        for (const u of units) {
          const over = u.ns.map(lineOver), ours = over.filter((l) => l && l[3] === CREDIT[x]);
          if (!ours.length) { R.rests += 1; if (!firstRest && u.ns.every((n) => !es[n - 1].kq)) firstRest = u; continue; }
          const e0 = es[u.ns[0] - 1], eZ = es[u.ns[u.ns.length - 1] - 1];
          const whole = over.every((l) => l === over[0]) && over[0] && over[0][3] === CREDIT[x] && e0.si === eZ.si && over[0][0] <= e0.ei && over[0][0] + over[0][1] > eZ.ei;
          if (!whole) { R.faults.push(`${b}: ${u.ns.map(said).join(" | ")}`); continue; }
          R.one += 1;
          if (!firstOne) firstOne = { u, line: over[0][2] };
        }
        for (const n of beside) { const l = lineOver(n); if (l && l[3] === CREDIT[x]) R.faults.push(`${b}: a line filed beside the words it reads is printed where it is filed, ${said(n)}`); }
        // S4 · the card of the first unit of each shape, once for the source
        const press = async (n) => {
          const e = es[n - 1];
          await p.evaluate(([si, ei]) => { const s = document.querySelectorAll("section.seg")[si]; const w = s && s.querySelectorAll(".he-text .wb")[ei]; if (w) { w.scrollIntoView({ block: "center" }); (w.querySelector(".w") || w).click(); } }, [e.si, e.ei]);
          // the card's rows are laid once its readings are here: read it when its pills or its sources' lines stand
          const t0 = Date.now();
          while (Date.now() - t0 < 15000) { await p.waitForTimeout(250); if (await p.evaluate(() => !!document.querySelector("#hud:not([hidden]) .r-pills button, #hud:not([hidden]) .r-dflt, #hud:not([hidden]) .r-piece"))) break; }
          await p.waitForTimeout(400);
          const c = await p.evaluate(cardInPage);
          await p.keyboard.press("Escape"); await p.waitForTimeout(200);
          return c;
        };
        if (firstOne && !oneCard) {
          oneCard = true;
          const c = await press(firstOne.u.ns[0]);
          if (!c || c.said !== firstOne.line) R.cardFaults.push(`${b} ${es[firstOne.u.ns[0] - 1].label}: the line reads «${firstOne.line}» once and the card says ${c ? `«${c.said}»` : "nothing"}`);
          else R.cards.push(`${b} ${es[firstOne.u.ns[0] - 1].label}: «${c.said}» once over ${firstOne.u.ns.length} words`);
        }
        if (firstRest && !restCard) {
          restCard = true;
          const k = firstRest.ns.length, c = await press(firstRest.ns[0]);
          const d = c ? c.dflt.find((q) => q.src === x) : null;
          if (!c || !c.label.includes(`${PILL[x]} reads these ${k} words as one`) || !d || !d.text.includes(`one reading of these ${k} words`)) R.cardFaults.push(`${b} ${es[firstRest.ns[0] - 1].label}: the words rest apart and the card says «${c ? c.label : "nothing"}», ${d ? `«${d.text}»` : `no line of ${PILL[x]}'s`}`);
          else R.cards.push(`${b} ${es[firstRest.ns[0] - 1].label}: «${d.text}»`);
        }
        if (errors.length) R.faults.push(`${b}: the page threw: ${errors[0]}`);
      } finally { await ctx.close(); }
    }
  } finally { await browser.close(); }
};
try { await Promise.all(SPAN_SOURCES.map(readSource)); } finally { await tree.close(); }
for (const x of SPAN_SOURCES) {
  const R = S3[x], owed = BOOKS.some((b) => unitsOf(b, x).some((u) => u.lineAt));
  check(`S3  on the page under ${PILL[x]}: at every unit filed with a line, no name stands twice (one line of the source over all the unit's words, or none of the source's under any), and no line printed where it is filed beside its words`,
    !R.faults.length && (!owed || R.one > 0), R.faults.length ? first(R.faults, 2) : !owed ? "no unit of it is filed with a line in these books" : `${n0(R.books)} books: ${n0(R.one)} units read as one line, ${n0(R.rests)} whose words rest`);
  check(`S4  the card under ${PILL[x]}: a unit drawn as one line is said once, and a unit whose words rest apart is said as the source's one reading of them`, !R.cardFaults.length, R.cardFaults.length ? first(R.cardFaults, 2) : R.cards.length ? R.cards.join(" · ") : "no unit of it to open in these books");
}
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
