#!/usr/bin/env node
// RUN: tree
// GUARDS: word-senses-rule-v1-a-word-sense-is-not-a-definition-and-prints-only-under-the-word-senses-switch-which-rests-off
// LEDGER: -
// no frame letter. A check reads the record, the overlay and the page, and judges them; it is not the ledger for one.
//
// A WORD SENSE IS NOT A DEFINITION (the owner, 13 November 2026, of the notes Jastrow sets in square brackets on a
// word's sense, which the dictionary beside the store serves as readings of their own: "toggle it so it could be
// like 'toggle on word senses' and the actual R pill showing something like 'word sense, not definition: pointed
// out'"; whether the switch rests on or off, "leave that to elijah": it rests off). The corpus lane lists the rows
// (relay v185.1, and v2 in relay v185.2), tools/bake-word-senses-v2.mjs carries them to the page, and the page holds
// them back while the switch is off and prints them as word senses while it is on.
//
//   W1  the record the page reads (data/word-senses/jastrow-v2.json) is the bake of the corpus lane's pinned list
//       against the served overlay as it stands: the bytes the tool writes now, every row one the overlay holds
//   W2  on a first visit the switch rests off, and nothing on the device says otherwise; and the page reads the
//       record W1 judges, and no other, as baked against the overlay it serves (a record of another version marks
//       nothing; a page left asking for v1's record holds back v1's rows); and the line
//       rests on STEP among the default sources (default-picks-rule-v1) with none kept, so a source kept on the
//       device cannot pass for rest
//   W3  on cards found from the record and the zones, never named, the smallest works first: with the switch off
//       no pill prints a word sense; a card whose word senses the other gates leave says how many it holds back,
//       with a press; the press shows exactly that many, each a pill of its own that begins «word sense, not
//       definition: »,
//       stands on Jastrow's records alone, says on itself that it is a word sense and wears the page's purple
//       (the owner, 14 November 2026: «maybe instead of in blue it should be in purple»), while no other pill
//       says so or wears it, and every other pill stays where it stood; pressed again, the card is as it was
//       Each word sense shown, pressed, lights its record on the record card, says nothing was cut out of it, and
//       prints Jastrow's bracketed entry where one prints its words (the review's critic, 14 November 2026); a
//       word sense that is a piece of a row Jastrow's ledger divides says it was cut out of that row, as any piece
//       does (relay v185.2's first card at Obadiah 1:4, «rounded, globe» cut in two).
//       Nor does a blue pill on Jastrow's records alone print a word sense's words while it is held back (its
//       bare twin: the review of 14 November 2026, Obadiah 1:8 «retentive»), unless a row outside the record that is
//       no twin prints it, as another entry's definition (W7's sixteen; a piece of a divided word sense can also
//       meet another entry's words, as «to split» at Psalms 45:5).
//   W4  the reset pill puts the switch back where it rests
//   W5  a word sense the reader pressed prints on the line under the word, and is held back from it with the rest
//       when the switch goes off: the line reads what it read before the press; a reading the reader pressed on
//       another word of the verse, no word sense, stays where it was (found by the page lane's own probe, 14
//       November 2026, at Obadiah 1:3: the card held the word sense back and the line went on printing it); and
//       again under the UBS dictionary's own readings (?default=ubs): switched off, the line returns to UBS's
//       line, not to today's
//   W7  every served Jastrow row that prints a listed word sense's words under its key and source id is in the
//       record, so none stands at rest as a definition, or is the same words from another entry: «SAME WORDS,
//       OTHER ENTRY» (the review of relay v185.2). The lane reads each row through the catalog card it was made
//       from, which names its entry (its RULE.md v2, A5), and at eight keys one of Jastrow's entries brackets words
//       as a sense where another entry of the same letters gives the same words as a definition (alam: «to
//       surround, tie up»). Such a row is no word sense: the list names it in another branch, or its definition
//       field is not its route. Exactly sixteen rows at eight keys are, and no other; the lane is asked for a list
//       of its own to name them
//   W8  the record is the list's, whole: its rows exactly the list's word senses, every row today's record held
//       back (v1's list and the twins v1's rule found) among them; its legend exactly on the rows the lane's
//       legend cards say it holds on; and no bare twin of a word sense that the list names in no branch
//   W6  the owner's legend, «brackets mean sense, not definition», stands in the page's purple under a record on the
//       record card exactly where the record of word senses says it holds (its legend: one bracket, its words a
//       word sense on the corpus lane's list), and under no other record pressed: on cards found from the legend's
//       rows that can print first (most of Jastrow's bracketed entries stand behind a bare row of the same reading,
//       which prints instead), smallest works first, every pill a Jastrow record stands behind pressed, and one other, with
//       the switch at rest and the pointing lifted, so Jastrow's records reach the cards; the record asked is the
//       one whose wording prints (the owner, 14 November
//       2026: «should it say that in purple somewhere if we are stripping the brackets»)
//
// Run: node tools/check-word-senses-v1.mjs
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { readPinnedLines } from "./pinned-v1.mjs";
import { pageReading } from "./page-reading-v1.mjs";
import { bakeWordSenses, overlayRowsOf, rowId, WORD_SENSES_RECORD, WORD_SENSES_DIR, WORD_SENSES_FOLDER, WORD_SENSE_PRINTS } from "./bake-word-senses-v2.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const first = (list, n = 3) => list.slice(0, n).join(" · ");

// ---- W1: the record is the bake ---------------------------------------------------------------------------------
let record = null, why = "";
let fresh = null;
try { fresh = `${JSON.stringify(bakeWordSenses())}\n`; } catch (e) { why = `the bake refuses: ${e.message}`; }
if (!existsSync(WORD_SENSES_RECORD)) why = why || "no record at data/word-senses/jastrow-v2.json";
else {
  const disk = readFileSync(WORD_SENSES_RECORD, "utf8");
  try { record = JSON.parse(disk); } catch (e) { why = why || `the record is not JSON (${e.message})`; }
  if (fresh && disk !== fresh) why = why || "the record on disk is not what the bake writes from the pinned list and the overlay as they stand: run tools/bake-word-senses-v2.mjs";
}
check("W1  the record the page reads is the bake of the corpus lane's pinned list against the served overlay", !why && !!record,
  why || `${record.counts.rows} rows under ${record.counts.keys} keys (${record.counts.twins} of them bare twins), each found in the overlay by its key, rank and source id`);
if (!record) { console.log(`\n${bad} FAILED`); process.exit(1); }

// the dictionary's own source ids, read off the overlay's index
const jix = JSON.parse(readFileSync(join(K3, "data", "overlays", "jastrow", "index.json"), "utf8"));
const OWN = new Set(Object.keys(jix.m_sources || {}));
const inRecord = (k, rank, m) => (record.rows[k] || []).some(([rk, mm]) => rk === rank && mm === m);
// a pinned list, read through its pin; a list that is not its bytes is said by the law that reads it
const pinnedLines = (folder, entry, faults) => {
  try { const pin = JSON.parse(readFileSync(join(folder, "PIN.json"), "utf8")); return readPinnedLines(join(folder, pin[entry].file), pin[entry]); } catch (e) { faults.push(e.message); return []; }
};

// ---- W7: every served row that prints a listed word sense's words is in the record, or the same words from
// another entry (the list names it in another branch, or its definition field is not its route) -----------------
const SAME_WORDS_OTHER_ENTRY = { rows: 16, keys: 8 };   // the review of relay v185.2, until the lane names them
const w7 = { faults: [], senses: 0, rows: new Set(), outside: new Map(), other: new Map(), unlisted: new Map() };
const listed = pinnedLines(WORD_SENSES_FOLDER, "word_senses", w7.faults);
const branchOf = new Map(listed.map((r) => [rowId(r.k, r.rank, r.m), r.branch]));
for (const r of listed) {
  if (r.branch !== "WORD_SENSE") continue;
  w7.senses += 1;
  for (const x of overlayRowsOf(r.k)) {
    if (x[3] !== r.m || x[1] !== r.route) continue;
    const id = rowId(r.k, x[0], x[3]);
    w7.rows.add(id);
    if (inRecord(r.k, x[0], x[3])) continue;
    const said = `${r.k} rank ${x[0]} ${x[3]} «${x[1]}»`;
    const b = branchOf.get(id);
    if (b && b !== "WORD_SENSE") w7.other.set(id, `${said} (${b})`);
    else if (x[2] !== x[1]) w7.other.set(id, `${said} (a definition, read through its card)`);
    else { w7.outside.set(id, said); if (!b) w7.unlisted.set(id, said); }
  }
}
const otherKeys = new Set([...w7.other.keys()].map((id) => id.split("\u0001")[0]));
const w7same = w7.other.size === SAME_WORDS_OTHER_ENTRY.rows && otherKeys.size === SAME_WORDS_OTHER_ENTRY.keys;
// W3's blue pills beside a held word sense of the same words. A pill may stand blue there where a served Jastrow
// row outside the record prints it and is no twin of a word sense (a bare row under the key with a word sense's
// route, any of Jastrow's source ids), or is one of the sixteen: a definition of its own entry. A pill printed only
// by rows in the record (the page let a word sense through), or by them and a twin left outside it, may not. A row
// prints the pieces its ledger divides it into, read by the page's own reading of a row (tools/page-reading-v1.mjs),
// each as the pill prints it («/» as « + », a closing stop dropped): «to surround, tie up» is two pills, and at
// Psalms 45:5 another entry's «to split» stands beside the held piece «to split» of «to split, pass through»
const blueMayStand = new Map();   // key and pill -> true where one of the sixteen prints it
try {
  const jPage = pageReading(readFileSync(join(K3, "zone.html"), "utf8"), jix);
  const pillsOf = (x) => jPage.readingsOfRow([...x.slice(0, 7), Array.isArray(x[8]) ? x[8] : null, Array.isArray(x[9]) ? x[9] : null])
    .map((s) => String(s).split("/").map((p) => p.trim()).filter(Boolean).join(" + ").replace(/\.$/u, ""));
  const senseRoutes = new Map();
  for (const r of listed) if (r.branch === "WORD_SENSE") senseRoutes.set(r.k, (senseRoutes.get(r.k) || new Set()).add(r.route));
  for (const [k, routes] of senseRoutes) {
    for (const x of overlayRowsOf(k)) {
      if (!OWN.has(x[3]) || inRecord(k, x[0], x[3])) continue;
      const sixteen = w7.other.has(rowId(k, x[0], x[3]));
      if (x[2] === x[1] && routes.has(x[1]) && !sixteen) continue;
      for (const p of pillsOf(x)) blueMayStand.set(`${k}\u0001${p}`, blueMayStand.get(`${k}\u0001${p}`) || sixteen);
    }
  }
} catch (e) { w7.faults.push(`the page's reading of a row could not be run: ${e.message}`); }

// ---- W8: the record is the list's, whole ------------------------------------------------------------------------
const w8 = { faults: [], rows: 0, senses: 0, v1: 0, legend: 0, holds: 0 };
{
  const ids = (byKey) => new Set(Object.entries(byKey || {}).flatMap(([k, list]) => list.map(([rank, m]) => rowId(k, rank, m))));
  const apart = (a, b, what) => { const only = [...a].filter((x) => !b.has(x)).map((x) => x.split("\u0001").join(" ")); if (only.length) w8.faults.push(`${only.length} ${what} · ${first(only)}`); };
  const recRows = ids(record.rows), recLegend = ids(record.legend && record.legend.rows);
  const senses = new Set(listed.filter((r) => r.branch === "WORD_SENSE").map((r) => rowId(r.k, r.rank, r.m)));
  apart(recRows, senses, "row(s) of the record the list does not name a word sense");
  apart(senses, recRows, "word sense(s) of the list not in the record");
  // the record v1 built (main ace7f07eba), from v1's pinned list: its word senses, and the twins v1's rule found
  // beside them (an unlisted row under a word sense's key and source id, printing its route, whose definition field
  // is that route); none is let go
  const v1 = pinnedLines(join(WORD_SENSES_DIR, "jastrow-word-senses-v1"), "word_senses", w8.faults);
  const v1Listed = new Set(v1.map((r) => rowId(r.k, r.rank, r.m)));
  const v1Rows = new Set();
  for (const r of v1) {
    if (r.branch !== "WORD_SENSE") continue;
    v1Rows.add(rowId(r.k, r.rank, r.m));
    for (const x of overlayRowsOf(r.k)) if (x[3] === r.m && x[1] === r.route && x[2] === r.route && !v1Listed.has(rowId(r.k, x[0], x[3]))) v1Rows.add(rowId(r.k, x[0], x[3]));
  }
  apart(v1Rows, recRows, "row(s) v1's record held back that the record lets go");
  const holds = new Set(pinnedLines(WORD_SENSES_FOLDER, "legend_cards", w8.faults).filter((c) => c.legend_holds === true).map((c) => rowId(c.k, c.rank, c.m)));
  apart(recLegend, holds, "row(s) the record's legend holds on where the lane's cards say it does not");
  apart(holds, recLegend, "row(s) the lane's cards say the legend holds on that the record leaves out");
  if (w7.unlisted.size) w8.faults.push(`the twin guard finds ${w7.unlisted.size} bare twin(s) of a word sense the list names in no branch · ${first([...w7.unlisted.values()])}`);
  Object.assign(w8, { rows: recRows.size, senses: senses.size, v1: v1Rows.size, legend: recLegend.size, holds: holds.size });
}

// ---- the places to open: words whose key the record names, in works addressed chapter:verse:word ----------------
const VERSE = /^\d+:\d+$/u;
const works = zonesOnDisk().map((id) => ({ id, size: statSync(join(K3, "data", "zones", `${id}.bin`)).size }))
  .sort((a, b) => a.size - b.size || (a.id < b.id ? -1 : 1));
const placesIn = (id, most) => {
  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${id}.bin`))).toString("utf8"));
  const out = [];
  for (const sec of z.sections || []) {
    if (!VERSE.test(String(sec.label || ""))) continue;
    const words = (sec.words || []).filter((w) => !w.mark);
    words.forEach((w, i) => { if (out.length < most && w.k && record.rows[w.k]) out.push({ label: String(sec.label), n: i + 1 }); });
    if (out.length >= most) break;
  }
  return out;
};

/** IN THE PAGE. The card standing open: its pills (each with the sources under it) and the word senses' press. */
const cardNow = () => {
  const hud = document.getElementById("hud");
  const pills = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => ({ t: x.textContent.trim(), by: x.dataset.by || "", sense: x.dataset.sense === "1", ink: getComputedStyle(x).color }));
  const b = document.querySelector("#hud .withheld-line .senses-switch");
  // the page's purple, as the card computes it
  let purple = "";
  if (hud) { const probe = document.createElement("i"); probe.style.color = "var(--argaman)"; hud.append(probe); purple = getComputedStyle(probe).color; probe.remove(); }
  return { open: !!hud && !hud.hidden, pills, purple, btn: b ? { t: b.textContent.trim(), pressed: b.getAttribute("aria-pressed") } : null, senses: window.__senses };
};
const settled = async (p, test = (s) => s.open && (s.pills.length > 0 || s.btn)) => {
  let last = "", now = null;
  for (let i = 0; i < 40; i += 1) {
    await p.waitForTimeout(250);
    now = await p.evaluate(cardNow);
    const k = JSON.stringify(now);
    if (test(now) && k === last) return now;
    last = k;
  }
  return now;
};
const texts = (s) => (s ? s.pills.map((x) => x.t) : []);
// the press, through the page: a card laid tight on a short window keeps its notes out of sight (as it keeps the
// pointing's and the entry's counts), and a mouse cannot press what is not drawn; the switch is the same either way
const press = (p) => p.evaluate(() => { const b = document.querySelector("#hud .withheld-line .senses-switch"); if (b) b.click(); return !!b; });
// IN THE PAGE. Each word sense the card shows, pressed in turn: what its record card prints
const pressSenses = (p) => p.evaluate(async () => {
  const out = [];
  for (const x of [...document.querySelectorAll("#hud > .rows .b-read .r-pills button.sense")]) {
    x.click(); await new Promise((r) => setTimeout(r, 200));
    const d = document.querySelector("#hud .d-card");
    out.push({ pill: x.textContent.trim(), key: d ? d.dataset.key || "" : "", row: d ? d.dataset.row || "" : "", text: d ? ((d.querySelector(".d-text") || {}).textContent || "").trim() : "", lit: !!(d && d.querySelector(".d-text .d-sense.on")), cut: !!(d && d.querySelector(".d-cut")) });
  }
  return out;
});
// IN THE PAGE. The line under a word, by its verse and its place among the verse's words (marks not counted), as a
// reader sees it, its license chip left off
const lineAt = (p, q) => p.evaluate(([label, n]) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "").trim() === label);
  const wb = sec ? sec.querySelectorAll(".he-text .wb:not(.mark)")[n - 1] : null;
  const g = wb ? wb.querySelector(":scope > .g") || wb.querySelector(".g") : null;
  if (!g) return null;
  const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  return c.textContent.trim();
}, [q.label, q.n]);
const openAt = async (p, q, test) => { await p.keyboard.press("Escape"); await p.waitForTimeout(150); await p.evaluate((h) => { location.hash = h; }, `${q.label}:${q.n}`); return settled(p, test); };

// W5's steps on a page standing open at `at`, a word whose word senses the card holds back: a word sense pressed,
// a reading pressed on a word beside it, the switch off; the line under it is read before and after
const w5Run = async (p, at, where) => {
  const atRest = await lineAt(p, at);
  await openAt(p, at, (s) => s.open && !!s.btn);
  await press(p);
  await settled(p, (s) => s.open && !!s.btn && s.btn.pressed === "true");
  const took = await p.evaluate(() => { const x = document.querySelector("#hud > .rows .b-read .r-pills button.sense"); if (!x) return null; x.click(); return x.textContent.trim(); });
  await p.waitForTimeout(800);
  const ruled = await lineAt(p, at);
  let nb = null, nbRest = null, other = null, nbRuled = null, nbSense = null, nbSensed = null;
  for (const n of [at.n - 1, at.n + 1]) {
    if (n < 1) continue;
    const q = { label: at.label, n };
    const rest0 = await lineAt(p, q);
    if (rest0 === null) continue;
    const s = await openAt(p, q);
    if (!s || !s.open) continue;
    other = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((b) => b.getAttribute("aria-pressed") !== "true" && !b.dataset.sense); if (!x) return null; x.click(); return x.textContent.trim(); });
    if (!other) continue;
    await p.waitForTimeout(800);
    nb = q; nbRest = rest0; nbRuled = await lineAt(p, q);
    // and a word sense pressed over it, where the block offers one: the switch off gives the reading back
    nbSense = await p.evaluate(() => { const x = document.querySelector("#hud > .rows .b-read .r-pills button.sense"); if (!x) return null; x.click(); return x.textContent.trim(); });
    if (nbSense) { await p.waitForTimeout(800); nbSensed = await lineAt(p, q); }
    break;
  }
  await openAt(p, at, (s) => s.open && !!s.btn && s.btn.pressed === "true");
  await press(p);
  await p.waitForTimeout(1500);
  const after = await lineAt(p, at), nbAfter = nb ? await lineAt(p, nb) : null;
  const said = await p.evaluate(() => window.__senses);
  const faults = [];
  if (!took) faults.push("no word sense's pill to press");
  else if (!ruled || !ruled.startsWith(WORD_SENSE_PRINTS)) faults.push(`pressed «${took}», the line read «${ruled}»`);
  if (said !== "off") faults.push(`the switch stood ${said} after its press`);
  if (after !== atRest) faults.push(`switched off, the line reads «${after}», not «${atRest}» as before the press`);
  if (!nb) faults.push("no word beside it offered another reading to press");
  else if (nbRuled === nbRest) faults.push(`pressed «${other}» at ${nb.label}:${nb.n}, its line stayed «${nbRest}»`);
  // a word sense pressed on a block prints among the word's other pieces («in + word sense, not definition: … + his»)
  else if (nbSense && !String(nbSensed || "").includes(WORD_SENSE_PRINTS)) faults.push(`pressed «${nbSense}» over «${other}» at ${nb.label}:${nb.n}, its line read «${nbSensed}»`);
  else if (nbAfter !== nbRuled) faults.push(`the switch off moved ${nb.label}:${nb.n}'s line from the reading pressed, «${nbRuled}», to «${nbAfter}»`);
  return { ok: !faults.length, said: faults.length ? faults.join(" · ") : `${where}: pressed «${took}», the line read it; switched off, the line reads «${after}» again · ${nb.label}:${nb.n} pressed «${other}»${nbSense ? `, then «${nbSense}» over it` : ""}, and «${nbAfter}» stands` };
};

const tree = await serveTree(K3);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const w2 = { said: null, kept: null, asked: [] };
const RECORD_PATH = `/${relative(K3, WORD_SENSES_RECORD).split(sep).join("/")}`;
const w3 = { works: [], opened: 0, atRest: 0, printedAtRest: [], hits: [], faults: [], blueBeside: [], pieces: [] };
const w4 = { judged: false, ok: false, said: "" };
const w5 = { judged: false, ok: false, said: "" };
const w5u = { judged: false, ok: false, said: "", laid: false };
const w6 = { cards: 0, pressed: 0, shown: [], quiet: 0, faults: [] };
try {
  for (const { id } of works) {
    if (w3.hits.length >= 2 || w3.opened >= 160) break;
    const places = placesIn(id, 40);
    if (!places.length) continue;
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const p = await ctx.newPage();
      // the records of word senses the first page asks for, and how each was answered
      if (w2.said === null) p.on("response", (q) => { const u = new URL(q.url()); if (u.pathname.startsWith("/data/word-senses/")) w2.asked.push(`${u.pathname} ${q.status()}`); });
      await p.addInitScript(() => { try { if (!sessionStorage.getItem("ws-check")) { localStorage.clear(); sessionStorage.setItem("ws-check", "1"); } } catch { /* a page with no memory is a first visit */ } });
      await p.goto(`${tree.base}/zone.html?b=${id}`, { waitUntil: "networkidle", timeout: 120000 });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      if (w2.said === null) {
        w2.said = await p.evaluate(() => window.__senses); w2.fit = await p.evaluate(() => window.__sensesFit); w2.kept = await p.evaluate(() => { try { return localStorage.getItem("fh.senses"); } catch { return null; } });
        // the default sources: STEP, nothing kept (null where the book's picks are not laid)
        w2.dflt = await p.evaluate(() => (window.__default && window.__default.book ? window.__default.on : null));
        w2.dfltKept = await p.evaluate(() => { try { return localStorage.getItem("fh.defaults"); } catch { return null; } });
      }
      w3.works.push(id);
      for (const at of places) {
        if (w3.hits.length >= 2 || w3.opened >= 160) break;
        await p.keyboard.press("Escape"); await p.waitForTimeout(150);
        await p.evaluate((h) => { location.hash = h; }, `${at.label}:${at.n}`);
        const rest = await settled(p);
        if (!rest || !rest.open) continue;
        w3.opened += 1; w3.atRest += 1;
        const printed = rest.pills.filter((x) => x.t.startsWith(WORD_SENSE_PRINTS) || x.sense || x.ink === rest.purple);
        if (printed.length) w3.printedAtRest.push(`${id} ${at.label}:${at.n}: «${printed[0].t}»${printed[0].sense ? " (marked a word sense)" : ""}${printed[0].ink === rest.purple ? " (purple)" : ""}`);
        if (!rest.btn) continue;
        // a card that holds word senses back
        const where = `${id} ${at.label}:${at.n}`;
        const m = /^(\d+) word senses?, not definitions?, held back/u.exec(rest.btn.t);
        if (!m || rest.btn.pressed !== "false") { w3.faults.push(`${where}: the press reads «${rest.btn.t}» (${rest.btn.pressed})`); continue; }
        const n = Number(m[1]);
        await press(p);
        const on = await settled(p, (s) => s.open && !!s.btn && s.btn.pressed === "true");
        const shown = on.pills.filter((x) => x.t.startsWith(WORD_SENSE_PRINTS));
        const others = on.pills.filter((x) => !x.t.startsWith(WORD_SENSE_PRINTS)).map((x) => x.t);
        const notOwn = shown.filter((x) => !x.by || x.by.split(" ").some((mid) => !OWN.has(mid)));
        if (on.senses !== "on") w3.faults.push(`${where}: the press left the switch ${on.senses}`);
        if (!on.btn || !new RegExp(`^${n} word senses? shown`, "u").test(on.btn.t)) w3.faults.push(`${where}: shown, the press reads «${on.btn ? on.btn.t : "nothing"}»`);
        // a word sense's words on a blue pill of Jastrow's records alone, while held back (its twin)
        // each word sense shown, pressed: its record card; then the reading the card had pressed, pressed again, so
        // no word sense stays chosen when the switch goes off (which would lay the sections again and shut the card)
        const wasPressed = await p.evaluate(() => { const x = document.querySelector("#hud > .rows .b-read .r-pills button[aria-pressed=true]"); return x ? x.textContent.trim() : null; });
        const pressedSenses = await pressSenses(p);
        await p.evaluate((t) => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((y) => y.textContent.trim() === t); if (x) x.click(); }, wasPressed);
        await p.waitForTimeout(300);
        for (const r of pressedSenses) {
          const words = r.pill.slice(WORD_SENSE_PRINTS.length);
          const bracketedServed = overlayRowsOf(r.key).some((x) => OWN.has(x[3]) && x[1] === words && /\[/u.test(String(x[2] || "")));
          if (!r.lit) w3.faults.push(`${where}: pressed «${r.pill}», its record «${r.text.slice(0, 50)}» is not lit`);
          // the row whose wording prints (rank|source id): its words a piece of it where its ledger divides it
          const [rank, m] = r.row.split("|");
          const lead = overlayRowsOf(r.key).find((x) => x[0] === Number(rank) && x[3] === m);
          const aPiece = !!lead && lead[1] !== words && [lead[8], lead[9]].some((s) => Array.isArray(s) && s.length > 0);
          if (r.cut && !aPiece) w3.faults.push(`${where}: pressed «${r.pill}», the card says the reading was cut out of «${r.text.slice(0, 50)}»`);
          if (!r.cut && aPiece) w3.faults.push(`${where}: pressed «${r.pill}», a piece of «${lead[1]}», and the card does not say it was cut out of it`);
          if (aPiece) w3.pieces.push(`${where} «${words}» of «${lead[1]}»`);
          if (bracketedServed && !r.text.includes("[")) w3.faults.push(`${where}: pressed «${r.pill}», the card prints «${r.text.slice(0, 50)}» bare though Jastrow serves the bracketed entry`);
        }
        // a blue pill of a held word sense's words: no twin where a row outside the record that is none prints it
        const keyOf = (x) => (pressedSenses.find((r) => r.pill === `${WORD_SENSE_PRINTS}${x.t}`) || {}).key;
        const blueOfShown = rest.pills.filter((x) => !x.t.startsWith(WORD_SENSE_PRINTS) && x.by && x.by.split(" ").every((mid) => OWN.has(mid)) && shown.some((y) => y.t.slice(WORD_SENSE_PRINTS.length) === x.t));
        const twinAtRest = blueOfShown.filter((x) => !blueMayStand.has(`${keyOf(x)}\u0001${x.t}`));
        for (const x of blueOfShown) if (blueMayStand.has(`${keyOf(x)}\u0001${x.t}`)) w3.blueBeside.push(`${where} «${x.t}»${blueMayStand.get(`${keyOf(x)}\u0001${x.t}`) ? " (the sixteen)" : ""}`);
        if (twinAtRest.length) w3.faults.push(`${where}: at rest «${twinAtRest[0].t}» prints as a definition on ${twinAtRest[0].by}, while its word sense is held back`);
        if (shown.length !== n) w3.faults.push(`${where}: the press said ${n} held back and showed ${shown.length} word sense${shown.length === 1 ? "" : "s"}`);
        if (notOwn.length) w3.faults.push(`${where}: «${notOwn[0].t}» stands on ${notOwn[0].by || "no record"}, not on Jastrow's alone`);
        const notPurple = shown.filter((x) => !x.sense || x.ink !== on.purple);
        if (!on.purple || notPurple.length) w3.faults.push(`${where}: «${notPurple.length ? notPurple[0].t : ""}» ${notPurple.length && !notPurple[0].sense ? "does not say it is a word sense" : `wears ${notPurple.length ? notPurple[0].ink : "?"}, not the page's purple ${on.purple || "(none computed)"}`}`);
        const posing = on.pills.filter((x) => !x.t.startsWith(WORD_SENSE_PRINTS) && (x.sense || x.ink === on.purple));
        if (posing.length) w3.faults.push(`${where}: «${posing[0].t}» is no word sense and ${posing[0].sense ? "says it is one" : "wears the purple"}`);
        if (JSON.stringify(others) !== JSON.stringify(texts(rest))) w3.faults.push(`${where}: shown, the other pills moved (${rest.pills.length} before, ${others.length} after)`);
        await press(p);
        const back = await settled(p, (s) => s.open && !!s.btn && s.btn.pressed === "false");
        if (JSON.stringify(texts(back)) !== JSON.stringify(texts(rest))) w3.faults.push(`${where}: held back again, the card is not as it was`);
        w3.hits.push(`${where}: ${n} held back, ${shown.length} pill${shown.length === 1 ? "" : "s"} shown («${shown.length ? shown[0].t : ""}»)`);
        // W4, once: shown again, then the reset pill
        if (!w4.judged) {
          await press(p);
          await settled(p, (s) => s.open && !!s.btn && s.btn.pressed === "true");
          await p.keyboard.press("Escape"); await p.waitForTimeout(200);
          const before = await p.evaluate(() => window.__senses);
          const enabled = await p.evaluate(() => { const r = document.getElementById("resetPill"); return !!r && !r.disabled; });
          if (enabled) await p.click("#resetPill");
          await p.waitForTimeout(600);
          const after = await p.evaluate(() => ({ said: window.__senses, kept: (() => { try { return localStorage.getItem("fh.senses"); } catch { return null; } })() }));
          w4.judged = true;
          w4.ok = before === "on" && enabled && after.said === "off" && after.kept === "off";
          w4.said = `before the reset ${before}, the reset pill ${enabled ? "pressed" : "not pressable"}, after it ${after.said} (kept: ${after.kept})`;
        }
        // W5, once, after the reset: a word sense pressed, a reading pressed on a word beside it, the switch off
        if (w4.judged && !w5.judged) {
          w5.judged = true;
          Object.assign(w5, await w5Run(p, at, where));
          w5.work = id; w5.at = at;
        }
      }
    } finally { await ctx.close(); }
  }
  // W5 again at the same word under the UBS dictionary's own readings (default-picks-rule-v1, for one load):
  // switched off, the line is UBS's line again, not today's
  if (w5.work) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const p = await ctx.newPage();
      await p.addInitScript(() => { try { if (!sessionStorage.getItem("ws-check5")) { localStorage.clear(); sessionStorage.setItem("ws-check5", "1"); } } catch { /* a page with no memory is a first visit */ } });
      await p.goto(`${tree.base}/zone.html?b=${w5.work}&default=ubs`, { waitUntil: "networkidle", timeout: 120000 });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      // the page says when every line stands as the sources in force draw it (window.__default.ready: under UBS once
      // its book file is here; failed where it could not be fetched); a page that does not say so in 30 s is a fault
      // said under W5, not a wait run out and the law passed over as not judged (the completeness critic of 15
      // November 2026)
      const said = await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).then(() => true, () => false);
      if (!said) Object.assign(w5u, { laid: true, judged: true, ok: false, said: `${w5.work} under UBS: the page did not say in 30 s that its lines stand as the sources in force draw them (window.__default.ready)` });
      else {
        w5u.laid = await p.evaluate(() => !!(window.__default && window.__default.book && window.__default.on === "ubs" && window.__default.ready));
        if (w5u.laid) { w5u.judged = true; Object.assign(w5u, await w5Run(p, w5.at, `${w5.work} ${w5.at.label}:${w5.at.n} under UBS`)); }
      }
    } finally { await ctx.close(); }
  }
} finally { await browser.close(); await tree.close(); }

// ---- W6: the legend, on its own cards ----------------------------------------------------------------------------
const LEG = record.legend && record.legend.rows ? record.legend.rows : {};
// the keys whose legend rows can print first on a card: Jastrow's overlay serves most bracketed entries behind a
// bare row of the same reading and source, which prints instead (EARLIEST_FIRST, then rank); a legend row with no
// such row ahead of it is one a card can show
const LEG_FIRST = new Set(Object.entries(LEG).filter(([k, list]) => {
  const rows = overlayRowsOf(k);
  return list.some(([rk, m]) => { const r = rows.find((x) => x[0] === rk && x[3] === m); return r && !rows.some((x) => x[0] < rk && x[3] === m && x[1] === r[1]); });
}).map(([k]) => k));
const legendPlaces = (id, most) => {
  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${id}.bin`))).toString("utf8"));
  const out = [];
  for (const sec of z.sections || []) {
    if (!VERSE.test(String(sec.label || ""))) continue;
    const words = (sec.words || []).filter((w) => !w.mark);
    words.forEach((w, i) => { if (out.length < most && w.k && LEG_FIRST.has(w.k)) out.push({ label: String(sec.label), n: i + 1 }); });
    if (out.length >= most) break;
  }
  return out;
};
{
  const tree6 = await serveTree(K3);
  const b6 = await (await loadPlaywright()).chromium.launch(launchOptions());
  try {
    for (const { id } of works) {
      if (w6.shown.length >= 3 || w6.cards >= 80) break;
      const places = legendPlaces(id, 30);
      if (!places.length) continue;
      const ctx = await b6.newContext({ viewport: { width: 412, height: 915 } });
      try {
        const p = await ctx.newPage();
        // the pointing lifted ("keep"), so Jastrow's records reach the cards where the verse points the word
        // otherwise than Jastrow's headword; the legend is asked of the record printed, whatever withheld others
        await p.addInitScript(() => { try { if (!sessionStorage.getItem("ws-check6")) { localStorage.clear(); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); sessionStorage.setItem("ws-check6", "1"); } } catch { /* a first visit */ } });
        await p.goto(`${tree6.base}/zone.html?b=${id}`, { waitUntil: "networkidle", timeout: 120000 });
        await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        for (const at of places) {
          if (w6.shown.length >= 3 || w6.cards >= 80) break;
          const rest = await openAt(p, at);
          if (!rest || !rest.open || !rest.pills.length) continue;
          w6.cards += 1;
          const theirs = rest.pills.map((x, i) => (x.by.split(" ").some((mid) => OWN.has(mid)) ? i : -1)).filter((i) => i >= 0);
          // and one other, so the cards also show where the legend must not stand
          const other = rest.pills.findIndex((x) => !x.by.split(" ").some((mid) => OWN.has(mid)));
          for (const i of [...theirs.slice(0, 30), ...(other >= 0 ? [other] : [])]) {
            const seen = await p.evaluate(async (i) => {
              const xs = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")];
              if (!xs[i]) return null;
              xs[i].click();
              await new Promise((r) => setTimeout(r, 120));
              const d = document.querySelector("#hud .d-card");
              const lg = d && d.querySelector(".sense-legend");
              let purple = "";
              const probe = document.createElement("i"); probe.style.color = "var(--argaman)"; document.getElementById("hud").append(probe); purple = getComputedStyle(probe).color; probe.remove();
              return { pill: xs[i].textContent.trim(), key: d ? d.dataset.key || "" : "", row: d ? d.dataset.row || "" : "", legend: lg ? lg.textContent.trim() : null, ink: lg ? getComputedStyle(lg).color : "", purple, text: ((d && d.querySelector(".d-text")) || {}).textContent || "" };
            }, i);
            if (!seen) continue;
            w6.pressed += 1;
            const want = (LEG[seen.key] || []).some(([rk, m]) => seen.row === `${rk}|${m}`);
            const where = `${id} ${at.label}:${at.n} «${seen.pill}»`;
            if (want && seen.legend === null) w6.faults.push(`${where}: its record is one the legend holds on, and the card shows no legend`);
            else if (!want && seen.legend !== null) w6.faults.push(`${where}: the card shows the legend under a record it does not hold on (${seen.key} ${seen.row})`);
            else if (want && (seen.legend !== record.legend.text || seen.ink !== seen.purple)) w6.faults.push(`${where}: the legend reads «${seen.legend}» in ${seen.ink}, not «${record.legend.text}» in the page's purple ${seen.purple}`);
            else if (want) { if (w6.shown.length < 3) w6.shown.push(`${where}: «${seen.text.slice(0, 60)}» · ${seen.legend}`); }
            else w6.quiet += 1;
          }
        }
      } finally { await ctx.close(); }
    }
  } finally { await b6.close(); await tree6.close(); }
}

check("W2  on a first visit the switch rests off, and the page reads this record, of the served overlay's version; the line rests on STEP with no source kept", w2.said === "off" && w2.kept === null && w2.fit === true && w2.asked.length === 1 && w2.asked[0] === `${RECORD_PATH} 200` && (w2.dflt === null || w2.dflt === "step") && w2.dfltKept === null,
  w2.said === null ? "no page was opened" : `the page says ${w2.said}; the device keeps ${w2.kept === null ? "nothing" : w2.kept}; the page asked for ${w2.asked.join(", ") || "no record of word senses"}${w2.asked.length === 1 && w2.asked[0] === `${RECORD_PATH} 200` ? "" : `, not ${RECORD_PATH} alone`}; the record ${w2.fit === true ? "is" : "is NOT"} of the served overlay's version; the default source ${w2.dflt === null ? "not laid on this book" : w2.dflt}, kept ${w2.dfltKept === null ? "nothing" : w2.dfltKept}`);
check("W3  off, no pill prints a word sense; the card says how many it holds back, and its press shows them as word senses on Jastrow's records alone, each in the page's purple, every other pill in its place and its own ink, and holds them back again",
  w3.hits.length >= 1 && !w3.printedAtRest.length && !w3.faults.length,
  w3.printedAtRest.length ? `${w3.printedAtRest.length} card(s) print a word sense with the switch off: ${first(w3.printedAtRest)}`
    : w3.faults.length ? `${w3.faults.length} · ${first(w3.faults)}`
    : !w3.hits.length ? `${w3.opened} cards opened in ${w3.works.length} work(s) (${first(w3.works)}) and none held a word sense back for the switch to show`
    : `${w3.opened} cards opened in ${first(w3.works)}, none printing a word sense at rest · ${w3.hits.join(" · ")}${w3.pieces.length ? ` · ${w3.pieces.length} word sense(s) a piece of a divided row, the card saying so: ${first(w3.pieces)}` : ""}${w3.blueBeside.length ? ` · ${w3.blueBeside.length} blue pill(s) beside a held word sense of the same words, another entry's definition: ${first(w3.blueBeside)}` : ""}`);
check("W4  the reset pill puts the switch back where it rests", w4.judged && w4.ok, w4.said || "no card held a word sense back, so the switch was never turned on to be reset");
check("W5  a word sense pressed is held back from the line when the switch goes off, and a reading pressed beside it stays", w5.judged && w5.ok, w5.said || "no card held a word sense back, so none was pressed");
if (w5.judged && !w5u.laid) console.log(`  --  W5  under UBS not judged here: the default sources are not laid on ${w5.work}`);
else check("W5  and under UBS: switched off, the line is UBS's line again, not today's", w5u.judged && w5u.ok, w5u.said || "no card held a word sense back, so none was pressed");
{
  const byBranch = [...w7.other.keys()].filter((id) => branchOf.has(id)).length;
  check(`W7  every served Jastrow row that prints a listed word sense's words under its key and source id is in the record, or one of the ${SAME_WORDS_OTHER_ENTRY.rows} rows at ${SAME_WORDS_OTHER_ENTRY.keys} keys that are the same words from another entry`,
    !w7.faults.length && w7.senses > 0 && !w7.outside.size && w7same,
    w7.faults.length ? w7.faults.join(" · ")
      : w7.outside.size ? `${w7.outside.size} row(s) outside it, standing at rest as definitions · ${first([...w7.outside.values()])}`
      : !w7same ? `${w7.other.size} row(s) at ${otherKeys.size} keys are the same words from another entry, not ${SAME_WORDS_OTHER_ENTRY.rows} at ${SAME_WORDS_OTHER_ENTRY.keys} · ${first([...w7.other.values()], 20)}`
      : `${w7.rows.size} served row(s) print the words of the ${w7.senses} listed word senses: ${w7.rows.size - w7.other.size} in the record (${record.counts.twins} of its rows bare twins), ${w7.other.size} at ${otherKeys.size} keys the same words from another entry (${byBranch} the list names in another branch, ${w7.other.size - byBranch} definitions read through their cards)`);
}
check("W6  the owner's legend stands in purple under a record exactly where the record of word senses says it holds, and under no other record pressed",
  w6.shown.length >= 1 && w6.quiet >= 1 && !w6.faults.length,
  w6.faults.length ? `${w6.faults.length} · ${first(w6.faults)}`
    : !w6.shown.length ? `${w6.pressed} pills pressed on ${w6.cards} cards and no record the legend holds on was printed`
    : `${w6.pressed} pills pressed on ${w6.cards} cards: the legend under ${w6.shown.length} record(s) it holds on, none under the other ${w6.quiet} · ${w6.shown.join(" · ")}`);
check("W8  the record is the list's, whole: exactly its word senses, every row v1's record held back among them, the legend exactly where the lane's cards say it holds, and no bare twin left unlisted",
  !w8.faults.length && w8.rows > 0,
  w8.faults.length ? `${w8.faults.length} · ${first(w8.faults)}`
    : `${w8.rows} rows, exactly the list's ${w8.senses} word senses; all ${w8.v1} rows v1's record held back among them; the legend on exactly the ${w8.holds} rows the lane's cards say it holds on; the twin guard finds 0`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
