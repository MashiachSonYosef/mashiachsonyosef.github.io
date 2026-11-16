#!/usr/bin/env node
// RUN: tree
// GUARDS: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second
// GUARDS: ruled-reading-stands-rule-v1-a-reading-the-reader-ruled-stays-on-the-card-wherever-the-ruling-stands-whatever-its-points
// LEDGER: -
// no frame letter. A check opens the page and reads what it draws; it is not
// the ledger for anything.
//
// A READER'S RULING OUTRANKS A SOURCE, AT THE CARD TOO, AND A READING ACROSS
// WORDS STANDS OR GOES WHOLE (the review of 15 November 2026, of the default
// sources shipped that morning). The page's precedence (THE ORDER TOGGLES in
// zone.html: a reading the reader has ruled wins, then the toggle, then the
// record's order) held on the lines through every switch, but the card of a
// ruled form, opened under another source than the one it was ruled under,
// opened on another division, found no reading pressed there and painted the
// source in force over the ruling, at every word whose place has a set of
// several pieces (about half of all words); check-default-picks-v1's D9 rules,
// switches and reads lines, and never opens a ruled word's card after a
// switch. These laws do:
//   U1  a reading pressed on a block of the place's own pieces at rest (the
//       card opens on its core block) holds under MACULA when the card of its
//       form is opened at another place: both lines read the ruling, the
//       card reads it, and the card presses the block's reading
//   U2  the same ruling holds with its card standing open while MACULA is
//       pressed (the row's pill opens the card again under the source)
//   U3  MACULA's own reading at a word, a row the page made for the place,
//       pressed under MACULA, holds back on STEP when the card of its form is
//       opened at another place: the line, the card's reading and its pressed
//       pill; the chip under every line it reaches names the place the
//       reading is MACULA's own, never «at this place» where MACULA reads
//       other words, nor «chosen on the row of sources»
//   U4  the export of the verse holding that other place cites the ruled
//       reading from MACULA, under MACULA and back on STEP: no reading of
//       the verse is withheld
//   U5  under MACULA, UBS and BDB, every section built, no word of a reading
//       the place gives across words (TAHOT's «Beth-» «-lehem») prints its
//       half while its other word prints a source's line: the reading stands
//       whole, or each word takes the source's own
//   U7  a division pressed alone at rest, the whole form with no reading
//       pressed on it (the review of the toggles fixes, 15 November 2026: the
//       press drew the card's reading on both lines, the painters drew the
//       baked column after any switch, and the card at another place read a
//       third over it), holds under MACULA and back on STEP at its form's
//       card at another place: both lines read what the press drew, the card
//       reads it and presses the pill the press pressed, and opening the card
//       paints nothing over the lines
//   U8  under each of MACULA, UBS and BDB, at a reading the place gives across
//       two words with the hyphen at the end of the first only (TAHOT's
//       «Tubal-» «Cain», «fif-» «teen»), that source reading one word of it and
//       not the other, both words keep the line as it rests (the same review:
//       held only where both hyphens stood, «Baal-Hamon» «Hamon» under UBS)
//   U9  the guard an open keeps over a ruled line: U7's division pressed
//       alone, its card shut before its readings came (the catalog's shard of
//       the form held back until then), so the ruling is the division alone
//       and the card at another place reads its own reading of it there;
//       opened under MACULA, that card paints nothing over the ruled lines
//       (paintGloss: an open paints nothing over a form the reader ruled)
//   U10 under each of MACULA, UBS and BDB, a unit the source reads at every
//       word of it prints once (the completeness critic of 15 November 2026:
//       BDB's «Bethel · sense 1» under both words at Amos 3:14:10-11, MACULA's
//       «with food» under both at Daniel 1:8:8-9): the words of a reading the
//       place gives across words, or of one entry across words (the lattice's
//       headword the same at each, its letters running across their
//       boundary), the source's line at each from one and the same pick in its
//       book file, standing in one run: every word of it under one line that
//       reads it, the run's one line where it is the whole run, else one part
//       over its words (data-wn), never the same words under two lines and no
//       word of it under none. Where its words stand apart (no run holds them
//       all: no line stands over both, and printed under each it is the
//       doubled word), each word keeps its line as it rests, and the card at
//       its first word says the source reads them as one and they stand apart
//   U0  every page opened, and every press, said within 30 s that its lines
//       stand as the sources in force draw them (window.__default.ready)
// The words are found from the zones and the default picks on disk, never
// named here (check-scope-derived S1): for U1 to U4 the work with the fewest
// places holding a form that stands at two places with a set of several
// pieces whose core piece TAHOT marks, MACULA reading the form at both and
// otherwise at the second (for U3 and U4, where its reading at the first is
// a row the page makes for the place); for
// U5 the work with the fewest places where MACULA and UBS each read one word
// of such a reading and not the other; for U7 and U9 the first form as U1's,
// work by work, whose baked column is a divided reading (the whole form's card
// does not offer it, so the press draws another); for U8, for each source, the
// work with the fewest places holding such a reading the source reads in part;
// for U10, for each source, the work with the fewest places holding a unit,
// and the work with the fewest places holding one whose words the text writes
// apart (no maqaf between them; the page then says whether a run holds them).
// The page is the checkout's own, served here; SERVE_BASE names another (the
// live build, to see these laws red before a fix). Nothing printed holds
// Hebrew: a text is printed with any Hebrew as U+ codes.
// Usage: node tools/check-rulings-under-sources-v1.mjs
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { DEFAULT_PICKS_RULE_ID } from "./bake-default-picks-v1.mjs";
import { lineOfPill } from "./card-readings-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const DP = join(K3, "data", "default-picks");
const readGz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? `  \u00b7  ${d}` : ""}`); };
const noHe = (t) => String(t == null ? "" : t).replace(/[\u0590-\u05ff]/gu, (c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`);
const said = (t, n = 60) => { const s = noHe(t); return `\u00ab${s.length > n ? `${s.slice(0, n)}\u2026` : s}\u00bb`; };
console.log(`\u2014 ${DEFAULT_PICKS_RULE_ID} \u2014`);
if (!existsSync(join(DP, "index.json"))) { console.log("SKIPPED \u2014 no default picks index in this checkout"); process.exit(3); }
const IX = JSON.parse(readFileSync(join(DP, "index.json"), "utf8"));
const BOOKS = Object.keys(IX.books || {}).filter((b) => existsSync(join(K3, "data", "zones", `${b}.bin`)) && existsSync(join(DP, IX.books[b].file)));
const byPlaces = [...BOOKS].sort((a, b) => IX.books[a].places - IX.books[b].places || (a < b ? -1 : 1));

// ---- the counting rule, as the page reads a source's line (lineOf) --------------------------------------------------
const SLOT = { macula: 1, ubs: 2, bdb: 3 };
const linePick = (t) => typeof t === "string" && /[\p{L}\p{N}]/u.test(t) && t !== "NO DATA YET";
const lineAt = (bf, n, src) => {
  const at = bf.places[n - 1], slot = at ? at[SLOT[src]] : 0;
  if (!slot) return null;
  if (src === "macula") return linePick(slot) ? slot : null;
  if (src === "ubs") return linePick(slot[0]) ? slot[0] : null;
  const p = slot[0], words = p && p[1] ? bf.bdb_words[p[1] - 1] : null;
  return linePick(words) ? words : null;
};
const pieced = (w) => Array.isArray(w.pg) && w.pg.length > 1 && w.pg.every((p) => p && String(p.g || "").trim() && p.k);
/** A zone's words with their place number (WORD_N: one-based over every entry, marks included) and address. */
const placesOf = (z) => {
  const out = [];
  let n = 0;
  for (const sec of z.sections || []) { let k = 0; for (const w of sec.words || []) { n += 1; if (!w.mark) { k += 1; out.push({ w, n, label: String(sec.label), at: `${sec.label}:${k}` }); } } }
  return out;
};

// U1-U4: a form at two places, each a set of TAHOT's several pieces with one core piece, MACULA reading the form at
// both, and otherwise at the second than at the first; for U3-U4 the first of them, in the works of the fewest places,
// where MACULA's reading at the first is a row the page makes for the place (what the export failed to cite elsewhere),
// read off the card
const candidates = [];
for (const b of byPlaces) {
  const z = readGz(join(K3, "data", "zones", `${b}.bin`)), bf = readGz(join(DP, IX.books[b].file));
  const byKey = new Map();
  for (const p of placesOf(z)) {
    const w = p.w;
    if (w.kq || !w.k || !pieced(w) || w.pg.map((x) => x.k).join("") !== w.k || !w.pg.every((x) => x.s === "tahot")) continue;
    if (w.pg.filter((x) => x.r === "core").length !== 1 || !lineAt(bf, p.n, "macula")) continue;
    (byKey.get(w.k) || byKey.set(w.k, []).get(w.k)).push(p);
  }
  // the other place in another verse, where MACULA reads the form otherwise (so its line there is not the ruling)
  for (const ps of byKey.values()) {
    const B = ps.find((q) => q.label !== ps[0].label && lineAt(bf, q.n, "macula") !== lineAt(bf, ps[0].n, "macula"));
    if (B) candidates.push({ b, A: ps[0], B });
  }
  if (new Set(candidates.map((c) => c.b)).size >= 3) break;
}
const rulingWork = candidates[0] || null;
// U5: TAHOT's readings across two words, one word read by the source and not the other, for MACULA and for UBS
let halvesWork = null;
for (const b of byPlaces) {
  const z = readGz(join(K3, "data", "zones", `${b}.bin`)), bf = readGz(join(DP, IX.books[b].file));
  const text = (w) => (Array.isArray(w.pg) && w.pg.length && w.pg.every((p) => p && String(p.g || "").trim()) ? w.pg.map((p) => String(p.g).trim()).join("/") : "");
  const part = { macula: [], ubs: [], bdb: [] };
  // two words of one verse, the marks not counted, by their place numbers (WORD_N, over the whole work)
  const ps = placesOf(z);
  for (let i = 0; i + 1 < ps.length; i += 1) {
    if (ps[i].label !== ps[i + 1].label || !/-$/u.test(text(ps[i].w)) || !/^-/u.test(text(ps[i + 1].w))) continue;
    // words drawn one by one: a chain the scribes joined (its first word's ink ends in a maqaf) draws its own line
    if (/\u05be/u.test(String(ps[i].w.s || "").slice(-2))) continue;
    for (const src of Object.keys(part)) {
      const a = !ps[i].w.kq && !!lineAt(bf, ps[i].n, src), c = !ps[i + 1].w.kq && !!lineAt(bf, ps[i + 1].n, src);
      if (a !== c) part[src].push(`${ps[i].at}-${ps[i + 1].at.split(":")[2]}`);
    }
  }
  if (part.macula.length && part.ubs.length) { halvesWork = { b, part }; break; }
}
// U7: a form as U1's whose baked column (zone.gloss) is a divided reading, its «/» drawn as « + »
let divisionWork = null;
// every such form in the books' order, the first a work holds of each key, up to twelve: U9 asks the first, and U7
// asks them in turn until one's whole form, pressed at rest, offers a reading (a row with no pointing of its own
// qualifies for none under «only», the owner, 16 November 2026: Obadiah 1:8:2's whole form offered only Hebrew
// Wiktionary's «staging» and «direction», with no pointing, and now offers none)
const divisionWorks = [];
for (const b of byPlaces) {
  const z = readGz(join(K3, "data", "zones", `${b}.bin`)), bf = readGz(join(DP, IX.books[b].file));
  const byKey = new Map();
  for (const p of placesOf(z)) {
    const w = p.w;
    if (w.kq || !w.k || !pieced(w) || w.pg.map((x) => x.k).join("") !== w.k || !w.pg.every((x) => x.s === "tahot")) continue;
    if (w.pg.filter((x) => x.r === "core").length !== 1 || !lineAt(bf, p.n, "macula") || !/\//u.test(String((z.gloss || {})[w.k] || ""))) continue;
    (byKey.get(w.k) || byKey.set(w.k, []).get(w.k)).push(p);
  }
  for (const ps of byKey.values()) {
    const B = ps.find((q) => q.label !== ps[0].label && lineAt(bf, q.n, "macula") !== lineAt(bf, ps[0].n, "macula"));
    if (B) { divisionWorks.push({ b, A: ps[0], B }); if (divisionWorks.length >= 12) break; }
  }
  if (divisionWorks.length >= 12) break;
}
divisionWork = divisionWorks[0] || null;
// U8: per source, TAHOT's readings across two words with the hyphen at the end of the first only, read in part
const endOnly = {};   // source -> { b, pairs: [[the first word's address, the second's]] }
for (const src of ["macula", "ubs", "bdb"]) {
  for (const b of byPlaces) {
    const z = readGz(join(K3, "data", "zones", `${b}.bin`)), bf = readGz(join(DP, IX.books[b].file));
    const text = (w) => (Array.isArray(w.pg) && w.pg.length && w.pg.every((p) => p && String(p.g || "").trim()) ? w.pg.map((p) => String(p.g).trim()).join("/") : "");
    const ps = placesOf(z), pairs = [];
    for (let i = 0; i + 1 < ps.length; i += 1) {
      if (ps[i].label !== ps[i + 1].label || !/-$/u.test(text(ps[i].w)) || /^-/u.test(text(ps[i + 1].w))) continue;
      if ((!ps[i].w.kq && !!lineAt(bf, ps[i].n, src)) !== (!ps[i + 1].w.kq && !!lineAt(bf, ps[i + 1].n, src))) pairs.push([ps[i].at, ps[i + 1].at]);
    }
    if (pairs.length) { endOnly[src] = { b, pairs }; break; }
  }
}
// U10: per source, the units it reads at every word of one reading across words or of one entry across words, the
// same pick at each word (the page's dfltUnitOf)
const lettersIn = (t) => [...String(t || "").normalize("NFD")].filter((c) => { const n = c.codePointAt(0); return n >= 0x5d0 && n <= 0x5ea; }).join("");
const unitsIn = (z, bf, src) => {
  const out = [];
  const text = (w) => (Array.isArray(w.pg) && w.pg.length && w.pg.every((p) => p && String(p.g || "").trim()) ? w.pg.map((p) => String(p.g).trim()).join("/") : "");
  const pickOf = (n) => JSON.stringify((bf.places[n - 1] || [])[SLOT[src]]);
  const bySec = new Map();
  for (const p of placesOf(z)) { if (!bySec.has(p.label)) bySec.set(p.label, []); bySec.get(p.label).push(p); }
  for (const ps of bySec.values()) {
    const groups = [];
    let g = null;
    for (const q of ps) { if (g) g.push(q); if (!/-$/u.test(text(q.w))) g = null; else if (!g) { g = [q]; groups.push(g); } }
    const live = ps.filter((q) => !q.w.kq);
    for (let i = 0; i < live.length;) {
      let j = i;
      while (live[i].w.h && j + 1 < live.length && live[j + 1].w.h === live[i].w.h) j += 1;
      const ks = live.slice(i, j + 1).map((q) => lettersIn(q.w.k)), h = lettersIn(live[i].w.h), at = j > i && h ? ks.join("").indexOf(h) : -1;
      if (at >= 0) {
        let from = -1, to = -1, pos = 0;
        ks.forEach((k, x) => { if (from < 0 && at < pos + k.length) from = x; if (at + h.length > pos) to = x; pos += k.length; });
        if (to > from) groups.push(live.slice(i + from, i + to + 1));
      }
      i = j + 1;
    }
    const seen = new Set();
    for (const gr of groups) {
      const key = gr.map((q) => q.n).join(",");
      if (seen.has(key) || gr.some((q) => q.w.kq)) continue;
      seen.add(key);
      if (gr.every((q) => lineAt(bf, q.n, src) && pickOf(q.n) === pickOf(gr[0].n))) out.push({ ats: gr.map((q) => q.at), text: lineAt(bf, gr[0].n, src), maqaf: gr.slice(0, -1).every((q) => /\u05be/u.test(String(q.w.s || "").slice(-2))) });
    }
  }
  return out;
};
const unitWork = {};   // source -> { b, units }
// source -> [{ b, units }, ...]: the works holding a unit of words the text writes apart (no maqaf between them), fewest
// places first, up to four: the page says which it draws apart (a run the lanes laid may hold them)
const apartWorks = {};
for (const src of ["macula", "ubs", "bdb"]) {
  apartWorks[src] = [];
  for (const b of byPlaces) {
    if (unitWork[src] && apartWorks[src].length >= 4) break;
    const units = unitsIn(readGz(join(K3, "data", "zones", `${b}.bin`)), readGz(join(DP, IX.books[b].file)), src);
    if (units.length && !unitWork[src]) unitWork[src] = { b, units };
    if (units.some((u) => !u.maqaf) && apartWorks[src].length < 4) apartWorks[src].push({ b, units });
  }
}

const tree = process.env.SERVE_BASE ? { base: process.env.SERVE_BASE.replace(/\/$/u, ""), close: async () => {} } : await serveTree(K3);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const pageErrors = [];
// the page says every line stands as the sources in force draw it (window.__default.ready); one that does not say so
// in 30 s is a fault (U0), not a wait run out and passed over (it was 120 s, swallowed: a page that never said so
// passed every law)
const unsaid = [];
const said30 = (p, what) => p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).then(() => true, () => { unsaid.push(what); return false; });
const open = async (b, query = "") => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, acceptDownloads: true });
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("rus-check")) { localStorage.clear(); sessionStorage.setItem("rus-check", "1"); } } catch { /* a page with no memory is a first visit */ } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => pageErrors.push(`${b}${query}: ${String((e && e.message) || e).slice(0, 160)}`));
  await p.goto(`${tree.base}/zone.html?b=${b}${query}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
  await said30(p, `${b}${query} opened`);
  await p.waitForTimeout(800);
  return { ctx, p };
};
const ready = (p) => said30(p, "after a press");
/** IN THE PAGE: the word at an address (marks not counted), its section built first. */
const findWb = (at) => {
  const m = /^(.*):(\d+)$/u.exec(at);
  const secs = [...document.querySelectorAll("section.seg")];
  const i = secs.findIndex((s) => s.__sec && s.__sec.label === m[1]);
  if (i < 0) return null;
  if (secs[i].__body && window.__materialise) window.__materialise(i, i + 1);
  return [...secs[i].querySelectorAll(".he-text .wb:not(.mark)")][Number(m[2]) - 1] || null;
};
const lineOf = (p, at) => p.evaluate(({ at, f }) => {
  const wb = (0, eval)(`(${f})`)(at);
  const g = wb && wb.querySelector(":scope > .g");
  if (!g) return null;
  const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  const chip = g.querySelector(".g-lic");
  return { text: c.textContent.trim(), chip: chip ? chip.dataset.line || "" : "", title: chip ? chip.title : "" };
}, { at, f: findWb.toString() });
const cardNow = (p) => p.evaluate(() => {
  const h = document.getElementById("hud");
  if (!h || h.hidden) return { open: false };
  const pills = [...h.querySelectorAll(":scope > .rows .b-read .r-pills button")];
  return { open: true, now: ((h.querySelector(".r-now .v") || {}).textContent || "").trim(), pressed: pills.filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.textContent.trim()),
    made: pills.map((b, i) => (window.__poolPlace || [])[i] && b.getAttribute("aria-pressed") === "true").some(Boolean) };
});
const still = async (p) => {
  let last = "", same = 0, now = null;
  for (let k = 0; k < 100; k += 1) {
    await p.waitForTimeout(200);
    now = await cardNow(p);
    const key = JSON.stringify(now);
    if (now.open && key === last) { same += 1; if (same >= 3 && (now.pressed.length || same >= 10)) return now; } else same = 0;
    last = key;
  }
  return now;
};
const openCard = async (p, at) => {
  const ok = await p.evaluate(({ at, f }) => { const wb = (0, eval)(`(${f})`)(at); if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); return true; }, { at, f: findWb.toString() });
  if (!ok) return { open: false };
  return still(p);
};
const shut = async (p) => { await p.keyboard.press("Escape"); await p.waitForTimeout(300); };
const pressRow = async (p, id) => { await p.evaluate((x) => document.getElementById(x).click(), id); await p.waitForTimeout(600); await ready(p); await p.waitForTimeout(1200); };
/** Press, on the open card, the first reading not pressed and not divided («+»); answer its words as the pill prints
 *  them, and, as reads, the words it puts on the line: a reading that took the pointers resolving to it prints them
 *  beside it on its pill alone (pointer-one-pill-rule-v1, ship 5: lineOfPill). */
const pressOther = async (p) => {
  const x = await p.evaluate(() => { const y = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((z) => z.getAttribute("aria-pressed") !== "true" && !z.textContent.includes("+")); if (!y) return null; y.click(); return { t: y.textContent.trim(), by: y.dataset.pointerBy || "" }; });
  return x ? { t: x.t, reads: lineOfPill(x.t, x.by), folded: !!x.by } : null;
};
/** Whether a line reads the words a pressed pill puts on it (a folded pill's reading with the case folded). */
const lineReads = (line, took) => (took.folded ? String(line).toLowerCase().includes(took.reads.replace(/\s+/gu, " ").toLowerCase()) : String(line).includes(took.reads.replace(/\s+/gu, " ")));
const pressPressed = (p) => p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((y) => y.getAttribute("aria-pressed") === "true"); if (!x) return null; x.click(); return x.textContent.trim(); });
/** Press, on the open card, the division that is the whole form (one block, no «+»), where it is not pressed. */
const pressWhole = (p) => p.evaluate(() => { const x = [...document.querySelectorAll("#hud .b-cut .s-pills button")].find((y) => !y.textContent.includes("+")); if (!x) return null; if (x.getAttribute("aria-pressed") === "true") return "already"; x.click(); return "pressed"; });
/** The line drawn over each word at the addresses, with the chip's line: its own, or in a run drawn in parts the
 *  run's part under it; «the run's one line» where the run draws one line over its words. */
const drawnAt = (p, ats) => p.evaluate(({ ats, f }) => {
  const find = (0, eval)(`(${f})`);
  const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); };
  return ats.map((at) => {
    const wb = find(at);
    if (!wb) return null;
    const run = wb.closest(".wjoin"), rg = run ? run.querySelector(":scope > .g") : null;
    if (rg && !rg.classList.contains("parts")) return "the run's one line";
    const g = rg ? rg.querySelector(`:scope > .g-part[data-wi="${[...run.querySelectorAll(".wb")].indexOf(wb)}"]`) : wb.querySelector(":scope > .g");
    if (!g) return "";
    const chip = g.querySelector(".g-lic");
    return `${txt(g)} [${chip ? chip.dataset.line || "" : ""}]`;
  });
}, { ats, f: findWb.toString() });
/** The verse holding a place exported (Hebrew and English), and what its file says was withheld. */
const exportOf = async (p, label) => {
  const id = await p.evaluate((label) => { const secs = [...document.querySelectorAll("section.seg")]; const i = secs.findIndex((s) => s.__sec && s.__sec.label === label); if (i < 0) return null; window.__materialise(i, i + 1); const s = secs[i]; s.id = s.id || `rus-sec-${i}`; s.scrollIntoView(); return s.id; }, label);
  if (!id) return { fault: `no section ${label}` };
  await p.waitForTimeout(800);
  await p.evaluate((id) => { const s = document.getElementById(id); const m = s.querySelector(".xp-menu"); if (!m || m.hidden) s.querySelector(".xp-open").click(); }, id);
  await p.waitForSelector(`[id="${id}"] .xp-menu .xp-row .xp`, { timeout: 30000 }).catch(() => {});
  await p.evaluate((id) => { const b = document.getElementById(id).querySelectorAll(".xp-menu .xp-row")[0].querySelectorAll(".xp")[2]; if (b) b.click(); }, id);
  await p.waitForFunction((id) => /Press again|Refused|Could not/u.test((document.getElementById(id).querySelector(".xp-note") || {}).textContent || ""), id, { timeout: 180000 }).catch(() => {});
  const note = await p.evaluate((id) => (document.getElementById(id).querySelector(".xp-note") || {}).textContent || "", id);
  if (!/Press again/u.test(note)) return { fault: `the export said ${said(note, 120)}` };
  const [dl] = await Promise.all([p.waitForEvent("download"), p.evaluate((id) => document.getElementById(id).querySelector(".xp-row .xp.armed").click(), id)]);
  const text = readFileSync(await dl.path(), "utf8");
  await p.evaluate((id) => { const s = document.getElementById(id); const m = s.querySelector(".xp-menu"); if (m && !m.hidden) s.querySelector(".xp-open").click(); }, id);
  return { text, withheld: (text.match(/[^\n]*readings? (?:was|were) not exported/gu) || []).map((x) => x.trim()) };
};

try {
  if (!rulingWork) for (const k of ["U1", "U2", "U3", "U4"]) check(k, false, "no work on this disk holds a form at two places with a set of TAHOT's pieces that MACULA reads at both");
  else {
    const { b, A, B } = rulingWork;
    const where = `${b} ${A.at} and ${B.at}`;
    // U1: a block of the pieces ruled at rest, MACULA pressed, the card at the other place
    {
      const { ctx, p } = await open(b);
      await openCard(p, A.at);
      const pill = await pressOther(p);
      const took = pill ? pill.t : null;
      await p.waitForTimeout(800); await shut(p);
      const ruled = await lineOf(p, A.at);
      await pressRow(p, "default-macula");
      const card = await openCard(p, B.at);
      await shut(p);
      const la = await lineOf(p, A.at), lb = await lineOf(p, B.at);
      const fault = !took ? "no reading to press on the card at rest"
        : !ruled || !lineReads(ruled.text, pill) ? `pressed ${said(took)}${pill.folded ? ` (it reads ${said(pill.reads)} on the line)` : ""}, the line reads ${said(ruled && ruled.text)}`
          : la.text !== ruled.text || lb.text !== ruled.text ? `under MACULA, the card at ${B.at} opened: ${A.at} reads ${said(la.text)}, ${B.at} ${said(lb.text)}, ruled ${said(ruled.text)}`
            : card.now !== ruled.text ? `the card at ${B.at} reads ${said(card.now)}, ruled ${said(ruled.text)}`
              : !(card.pressed.length === 1 && card.pressed[0] === took) ? `the card at ${B.at} presses ${card.pressed.map((x) => said(x)).join(", ") || "nothing"}, the block ruled ${said(took)}` : "";
      check("U1  a block of the place's pieces ruled at rest holds under MACULA at its form's card at another place: both lines, the card's reading, its pressed pill", !fault, fault || `${where}: ruled ${said(took)}, both lines ${said(ruled.text)} under MACULA`);
      await ctx.close();
    }
    // U2: the same, the card standing open while MACULA is pressed
    {
      const { ctx, p } = await open(b);
      await openCard(p, A.at);
      const took = await pressOther(p);
      await p.waitForTimeout(800);
      const ruled = await lineOf(p, A.at);
      await pressRow(p, "default-macula");
      const card = await still(p);
      await shut(p);
      const la = await lineOf(p, A.at), lb = await lineOf(p, B.at);
      const fault = !took ? "no reading to press" : la.text !== ruled.text || lb.text !== ruled.text ? `MACULA pressed with the card open at ${A.at}: ${A.at} reads ${said(la.text)}, ${B.at} ${said(lb.text)}, ruled ${said(ruled.text)}`
        : card.open && card.now !== ruled.text ? `the card standing open reads ${said(card.now)}, ruled ${said(ruled.text)}` : "";
      check("U2  that ruling holds with its card standing open while MACULA is pressed", !fault, fault || `${where}: ${said(ruled.text)} at both`);
      await ctx.close();
    }
    // U3 and U4: MACULA's own reading at A ruled under MACULA; back on STEP, the card at B; the exports. The form is
    // the first candidate, work by work, whose card under MACULA presses a row made for the place
    let made = null;
    for (const w of [...new Set(candidates.map((c) => c.b))]) {
      const { ctx, p } = await open(w);
      await pressRow(p, "default-macula");
      for (const c of candidates.filter((x) => x.b === w)) { const got = await openCard(p, c.A.at); await shut(p); if (got.made) { made = c; break; } }
      await ctx.close();
      if (made) break;
    }
    if (!made) for (const k of ["U3", "U4"]) check(k, false, `no form found whose reading under MACULA is a row the page makes, in ${[...new Set(candidates.map((c) => c.b))].join(", ")}`);
    else {
      const { b: b3, A: A3, B: B3 } = made;
      const { ctx, p } = await open(b3);
      await pressRow(p, "default-macula");
      const c0 = await openCard(p, A3.at);
      const took = await pressPressed(p);
      await p.waitForTimeout(800); await shut(p);
      const ruled = await lineOf(p, A3.at);
      const exUnder = await exportOf(p, B3.at.split(":").slice(0, 2).join(":"));
      await p.evaluate(() => window.scrollTo(0, 0));
      await pressRow(p, "default-macula");
      const on = await p.evaluate(() => window.__default && window.__default.on);
      const card = await openCard(p, B3.at);
      await shut(p);
      const la = await lineOf(p, A3.at), lb = await lineOf(p, B3.at);
      const exBack = await exportOf(p, B3.at.split(":").slice(0, 2).join(":"));
      const where3 = `${b3} ${A3.at} and ${B3.at}, ruled ${said(took)} under MACULA${c0.made ? " (a row made for the place)" : ""}`;
      const titles = [la.title, lb.title];
      const falseTitle = titles.find((t) => /at this place|chosen on the row of sources/u.test(t)) || "";
      const fault3 = !took || !ruled ? "no reading pressed under MACULA"
        : on !== "step" ? `MACULA pressed again left ${on}`
          : la.text !== ruled.text || lb.text !== ruled.text ? `back on STEP, the card at ${B3.at} opened: ${A3.at} reads ${said(la.text)}, ${B3.at} ${said(lb.text)}, ruled ${said(ruled.text)}`
            : card.now !== ruled.text ? `the card at ${B3.at} reads ${said(card.now)}, ruled ${said(ruled.text)}`
              : !(card.pressed.length === 1 && card.pressed[0] === took) ? `the card at ${B3.at} presses ${card.pressed.map((x) => said(x)).join(", ") || "nothing"}, ruled ${said(took)}`
                : falseTitle ? `a chip under the ruling says ${said(falseTitle.split(" \u2014 ").pop(), 110)}` : "";
      check("U3  MACULA's own reading ruled under MACULA holds back on STEP at its form's card at another place: the line, the card, its pressed pill, and a chip that names where it is MACULA's own", !fault3, fault3 || `${where3}: ${said(ruled.text)} at both, chip ${said(lb.title.split(" \u2014 ").pop(), 90)}`);
      const fault4 = [["under MACULA", exUnder], ["back on STEP", exBack]].map(([k, x]) => (x.fault ? `${k}: ${x.fault}` : x.withheld.length ? `${k}: ${x.withheld.join("; ")}` : "")).filter(Boolean).join(" \u00b7 ");
      check("U4  the export of the verse at the other place cites the ruled reading, under MACULA and back on STEP: nothing withheld", !fault4 && !!took, fault4 || `${b3} ${B3.at.split(":").slice(0, 2).join(":")}: every reading exported both times`);
      await ctx.close();
    }
  }
  // U5: the halves under each source
  if (!halvesWork) check("U5", false, "no work on this disk holds a reading across two words that MACULA and UBS each read in part");
  else {
    const { b, part } = halvesWork;
    const faults = [], saw = [];
    for (const X of ["macula", "ubs", "bdb"]) {
      const { ctx, p } = await open(b, `&default=${X}`);
      await ready(p);
      await p.evaluate(() => window.__materialise(0)); await p.waitForTimeout(2500);
      const r = await p.evaluate(() => {
        let lone = 0, whole = 0; const ex = [];
        const txt = (el) => { if (!el) return ""; const c = el.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); };
        for (const sec of document.querySelectorAll("section.seg")) {
          if (!sec.__sec) continue;
          const wbs = [...sec.querySelectorAll(".he-text .wb")].filter((w) => w.__word && !w.__word.mark);
          const drawn = wbs.map((wb) => {
            const run = wb.closest(".wjoin");
            if (!run) return txt(wb.querySelector(":scope > .g"));
            const rg = run.querySelector(":scope > .g");
            if (rg && rg.classList.contains("parts")) { const parts = [...rg.querySelectorAll(":scope > .g-part")], all = [...run.querySelectorAll(".wb")]; return parts.length === all.length ? txt(parts[all.indexOf(wb)]) : null; }
            return null;
          });
          for (let i = 0; i < drawn.length; i += 1) {
            const a = drawn[i], c = drawn[i + 1], z = drawn[i - 1];
            if (a == null) continue;
            if (/[\p{L}\]]-$/u.test(a)) { if (c != null && /^-[\p{L}[]/u.test(c)) whole += 1; else { lone += 1; if (ex.length < 3) ex.push(`${sec.__sec.label}:${i + 1} \u00ab${a}\u00bb \u00ab${c}\u00bb`); } }
            if (/^-[\p{L}[]/u.test(a) && !(z != null && /[\p{L}\]]-$/u.test(z))) { lone += 1; if (ex.length < 3) ex.push(`${sec.__sec.label}:${i} \u00ab${z}\u00bb \u00ab${a}\u00bb`); }
          }
        }
        return { lone, whole, ex, on: window.__default && window.__default.on };
      });
      if (r.on !== X) faults.push(`?default=${X} stood on ${r.on}`);
      if (r.lone) faults.push(`under ${X.toUpperCase()} ${r.lone} half(s) alone: ${r.ex.map((x) => noHe(x)).join(" \u00b7 ")}`);
      saw.push(`${X.toUpperCase()} ${r.whole} whole`);
      await ctx.close();
    }
    check("U5  under MACULA, UBS and BDB, every section built, no word of a reading the place gives across words prints its half alone", !faults.length,
      faults.length ? faults.join(" \u00b7 ") : `${b}: ${saw.join(", ")}; read in part by MACULA at ${part.macula.length} (${part.macula.slice(0, 2).join(", ")}), UBS at ${part.ubs.length}, BDB at ${part.bdb.length}`);
  }
  // U7: the whole form's division pressed alone at rest; MACULA pressed and the card opened at the other place; MACULA
  // pressed again (STEP) and the card opened there again
  if (!divisionWork) check("U7", false, "no work on this disk holds a form as U1's whose baked column is a divided reading");
  else {
    // the forms in turn, until one's whole form pressed at rest offers a reading; each one passed over is said
    let found = null, ctx = null, p = null, how = null, c0 = null;
    const passed = [];
    for (const dw of divisionWorks) {
      ({ ctx, p } = await open(dw.b));
      await openCard(p, dw.A.at);
      how = await pressWhole(p);
      c0 = await still(p);
      if (how === "pressed" && c0.pressed.length === 1) { found = dw; break; }
      passed.push(`${dw.b} ${dw.A.at} (${how !== "pressed" ? how || "no division row" : `its whole form pressed at rest offers no reading: ${said(c0.now)}`})`);
      await ctx.close();
    }
    const { b, A, B } = found || divisionWorks[divisionWorks.length - 1];
    if (!found) ({ ctx, p } = await open(b));
    await shut(p);
    const ruled = await lineOf(p, A.at), atB = await lineOf(p, B.at);
    const legs = [];
    for (const leg of ["under MACULA", "back on STEP"]) {
      await pressRow(p, "default-macula");
      const before = [await lineOf(p, A.at), await lineOf(p, B.at)];
      const card = await openCard(p, B.at);
      await shut(p);
      legs.push({ leg, before, card, after: [await lineOf(p, A.at), await lineOf(p, B.at)] });
    }
    const t = (l) => (l ? l.text : null);
    const fault = !found ? `no form's whole form, pressed at rest, offers a reading: ${passed.join("; ")}`
      : how !== "pressed" ? `the card at ${A.at} at rest offered no whole form to press (${how || "no division row"})`
      : c0.pressed.length !== 1 ? `the whole form pressed, the card pressed ${c0.pressed.length} reading(s)`
        : t(atB) !== t(ruled) ? `the press drew ${said(t(ruled))} at ${A.at} and ${said(t(atB))} at ${B.at}`
          : legs.map(({ leg, before, card, after }) => (before.some((l) => t(l) !== t(ruled)) ? `${leg}: ${A.at} reads ${said(t(before[0]))}, ${B.at} ${said(t(before[1]))}, the press drew ${said(t(ruled))}`
            : after.some((l, j) => t(l) !== t(before[j])) ? `${leg}: the card at ${B.at} opened, and ${A.at} reads ${said(t(after[0]))}, ${B.at} ${said(t(after[1]))}`
              : card.now !== c0.now ? `${leg}: the card at ${B.at} reads ${said(card.now)} over the line ${said(t(ruled))}, the press's card ${said(c0.now)}`
                : !(card.pressed.length === 1 && card.pressed[0] === c0.pressed[0]) ? `${leg}: the card at ${B.at} presses ${card.pressed.map((x) => said(x)).join(", ") || "nothing"}, the press pressed ${said(c0.pressed[0])}` : "")).filter(Boolean).join(" \u00b7 ");
    check("U7  the whole form's division pressed alone at rest holds under MACULA and back on STEP at its form's card at another place: both lines read what the press drew, the card reads it and presses its pill, and the open paints nothing", !fault,
      fault || `${b} ${A.at} and ${B.at}: the whole form pressed, ${said(t(ruled))} on both lines under MACULA and back on STEP${passed.length ? ` (passed over, their whole forms offering no reading at rest: ${passed.join("; ")})` : ""}`);
    await ctx.close();
  }
  // U8: by work, the lines at rest, then under each source chosen for it
  if (!Object.keys(endOnly).length) check("U8", false, "no work on this disk holds a reading across two words, its hyphen at the end of the first only, that a source reads in part");
  else {
    const faults = [], saw = [];
    for (const b of [...new Set(Object.values(endOnly).map((x) => x.b))]) {
      const srcs = Object.keys(endOnly).filter((s) => endOnly[s].b === b);
      const ats = [...new Set(srcs.flatMap((s) => endOnly[s].pairs.flat()))];
      const s0 = await open(b);
      const rest = await drawnAt(s0.p, ats);
      await s0.ctx.close();
      for (const src of srcs) {
        const { ctx, p } = await open(b, `&default=${src}`);
        await ready(p);
        const on = await p.evaluate(() => window.__default && window.__default.on);
        const got = await drawnAt(p, ats);
        await ctx.close();
        if (on !== src) { faults.push(`?default=${src} stood on ${on}`); continue; }
        let held = 0;
        for (const [x, y] of endOnly[src].pairs) {
          const i = ats.indexOf(x), j = ats.indexOf(y);
          if ([rest[i], rest[j], got[i], got[j]].includes("the run's one line")) continue;
          held += 1;
          if (got[i] !== rest[i] || got[j] !== rest[j]) faults.push(`${b} ${x}-${y.split(":")[2]} under ${src.toUpperCase()}: ${said(got[i])} ${said(got[j])}, as it rests ${said(rest[i])} ${said(rest[j])}`);
        }
        if (!held) faults.push(`${b}: no reading of the kind that ${src.toUpperCase()} reads in part is drawn word by word`);
        saw.push(`${src.toUpperCase()} ${b} ${held}`);
      }
    }
    check("U8  under MACULA, UBS and BDB, a reading across two words with the hyphen at the end of the first only, read in part by the source, keeps the line as it rests at both words", !faults.length,
      faults.length ? faults.slice(0, 4).join(" \u00b7 ") : `held whole: ${saw.join(", ")}`);
  }
  // U9: U7's division pressed alone, the catalog's shard of the form held back until its card is shut
  if (!divisionWork) check("U9", false, "no work on this disk holds a form as U1's whose baked column is a divided reading");
  else {
    const { b, A, B } = divisionWork;
    const shard = createHash("sha256").update(String(A.w.k), "utf8").digest()[0].toString(16).padStart(2, "0");
    let release = () => {};
    const held = new Promise((r) => { release = r; });
    let heldBack = 0;
    const { ctx, p } = await open(b);
    await p.route(`**/data/route-store/shards/${shard}.bin*`, async (r) => { heldBack += 1; await held; await r.continue().catch(() => {}); });
    await openCard(p, A.at);
    const how = await pressWhole(p);
    await p.waitForTimeout(600);
    const waiting = await cardNow(p);
    await shut(p);
    release();
    await p.waitForTimeout(1500);
    await pressRow(p, "default-macula");
    const before = [await lineOf(p, A.at), await lineOf(p, B.at)];
    const card = await openCard(p, B.at);
    await shut(p);
    const after = [await lineOf(p, A.at), await lineOf(p, B.at)];
    const t = (l) => (l ? l.text : null);
    const fault = how !== "pressed" ? `the card at ${A.at} at rest offered no whole form to press (${how || "no division row"})`
      : !heldBack ? `the form's shard ${shard} was not asked for on the press: the card's readings were not held back`
        : waiting.pressed.length ? `the card's readings came while its shard was held back (${said(waiting.pressed[0])} pressed)`
          : t(before[0]) !== t(before[1]) ? `under MACULA the ruled form reads ${said(t(before[0]))} at ${A.at} and ${said(t(before[1]))} at ${B.at}`
            : after.some((l, j) => t(l) !== t(before[j])) ? `the card at ${B.at} opened under MACULA (it reads ${said(card.now)}) and painted over the ruled lines: ${A.at} ${said(t(before[0]))} to ${said(t(after[0]))}, ${B.at} ${said(t(before[1]))} to ${said(t(after[1]))}` : "";
    check("U9  an open paints nothing over a ruled line: the whole form's division pressed alone, its card shut before its readings came, the card opened under MACULA at another place", !fault,
      fault || `${b} ${A.at} and ${B.at}: both lines ${said(t(before[0]))}, the card at ${B.at} reading ${said(card.now)}, painted nothing`);
    await ctx.close();
  }
  // U10: per source, every unit of its works, under that source and at rest
  if (!Object.keys(unitWork).length) check("U10", false, "no work on this disk holds a unit a source reads at every word of one reading or one entry across words");
  else {
    const faults = [], saw = [];
    /** IN THE PAGE: each word of a unit, the cell it stands in (its run, or none) and the line over it. */
    const drawnOf = (p, ats) => p.evaluate(({ ats, f }) => {
      const find = (0, eval)(`(${f})`);
      const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); };
      // every word found first (its section built), then the runs they stand in
      const wbs = ats.map((at) => find(at));
      const runs = [...document.querySelectorAll(".he-text .wjoin")];
      return wbs.map((wb) => {
        if (!wb) return null;
        const run = wb.closest(".wjoin"), rg = run ? run.querySelector(":scope > .g") : null;
        if (rg && !rg.classList.contains("parts")) return { run: runs.indexOf(run), el: "the run's line", t: txt(rg) };
        // the part over the word: its own, or a part a unit prints over several words (data-wn)
        const wi = run ? [...run.querySelectorAll(".wb")].indexOf(wb) : -1, ps = rg ? [...rg.querySelectorAll(":scope > .g-part")] : [];
        const k = ps.findIndex((x) => Number(x.dataset.wi) <= wi && wi < Number(x.dataset.wi) + Number(x.dataset.wn || 1));
        const g = rg ? ps[k] || null : wb.querySelector(":scope > .g");
        return { run: run ? runs.indexOf(run) : -1, el: rg ? `part ${k}` : "its own", t: g ? txt(g) : "" };
      });
    }, { ats, f: findWb.toString() });
    let apart = 0;
    const judged = [];
    const judgeWork = async (src, b, units) => {
      judged.push(`${src} ${b}`);
      const rest = await open(b);
      const atRest = [];
      for (const u of units) atRest.push(await drawnOf(rest.p, u.ats));
      await rest.ctx.close();
      const { ctx, p } = await open(b, `&default=${src}`);
      await ready(p);
      let once = 0, held = 0, said0 = null;
      for (const [x, u] of units.entries()) {
        const drawn = await drawnOf(p, u.ats);
        if (drawn.some((d) => !d) || atRest[x].some((d) => !d)) { faults.push(`${src} ${b} ${u.ats.join(",")}: a word was not found`); continue; }
        if (drawn[0].run >= 0 && drawn.every((d) => d.run === drawn[0].run)) {
          once += 1;
          // once over its words: every word of it under one line, the run's or one part, which reads the unit
          const t = drawn[0].t, lines = new Set(drawn.map((d) => d.el));
          if (!t || lines.size !== 1 || drawn.some((d) => d.t !== t)) faults.push(`under ${src.toUpperCase()} ${b} ${u.ats.join(", ")}: ${t ? `${said(t, 40)} under ${drawn.filter((d) => d.t === t).length} of its ${drawn.length} words, in ${lines.size} line(s)` : "no line at its first word"}`);
          continue;
        }
        // its words apart: each keeps its line as it rests, and the card at its first word says why
        held += 1;
        const off = drawn.filter((d, i) => d.t !== atRest[x][i].t);
        if (off.length) faults.push(`under ${src.toUpperCase()} ${b} ${u.ats.join(", ")} (its words apart): ${drawn.map((d) => said(d.t, 30)).join(" ")}, as it rests ${atRest[x].map((d) => said(d.t, 30)).join(" ")}`);
        if (said0 === null) {
          said0 = await p.evaluate(({ at, f }) => { const wb = (0, eval)(`(${f})`)(at); if (!wb) return ""; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); return true; }, { at: u.ats[0], f: findWb.toString() })
            // (the label folds away on a tight card, and its words stand all the same)
            .then(() => p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 })).then(() => p.waitForTimeout(400))
            .then(() => p.evaluate(() => { const k = document.querySelector("#hud .r-now .k"); return k ? k.textContent : ""; })).catch(() => "");
          if (!/as one, and they stand apart/u.test(said0)) faults.push(`under ${src.toUpperCase()} ${b} ${u.ats[0]} (its words apart): the card says ${said(said0, 80)}`);
          await p.keyboard.press("Escape");
        }
      }
      apart += held;
      saw.push(`${src.toUpperCase()} ${b} ${once} unit(s) once in their run${held ? `, ${held} of words apart held as they rest (the card: ${said(said0, 70)})` : ""}`);
      await ctx.close();
      return held;
    };
    // per source its work of units; then, until the page has drawn one unit apart, the works whose units the text
    // writes apart, source by source
    for (const src of Object.keys(unitWork)) await judgeWork(src, unitWork[src].b, unitWork[src].units);
    for (const src of Object.keys(apartWorks)) for (const w of apartWorks[src]) if (!apart && !judged.includes(`${src} ${w.b}`)) await judgeWork(src, w.b, w.units);
    if (!apart && Object.values(apartWorks).some((l) => l.length)) faults.push(`no unit of words the text writes apart was drawn apart in ${judged.join(", ")}`);
    check("U10 under MACULA, UBS and BDB, a unit the source reads at every word of one reading or one entry across words prints once over its words where they stand in one run, and where they stand apart each word keeps its line as it rests, the card saying why", !faults.length,
      faults.length ? faults.slice(0, 4).join(" \u00b7 ") : saw.join(", "));
  }
} finally { await browser.close(); await tree.close(); }
check("U6  no page error", !pageErrors.length, pageErrors.length ? noHe(pageErrors[0]) : "none");
check("U0  every page said within 30 s that its lines stand as the sources in force draw them", !unsaid.length, unsaid.length ? `${unsaid.length}: ${unsaid.slice(0, 3).join(" | ")}` : "every one");
console.log(bad ? `${bad} FAILED` : "all checks passed");
process.exit(bad ? 1 : 0);
