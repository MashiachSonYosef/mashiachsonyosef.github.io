// RUN: given
// GUARDS: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second, dictionary-kinds-rule-v1-each-dictionary-is-filed-by-what-it-says-it-is-and-a-kind-or-a-category-it-marks-in-its-own-data-may-rest-shut
// LEDGER: -
// no frame letter. A check reads what is served and judges it; it is not the ledger for one.
// SAME PRODUCT (the rebuild, 2026-10-23: "a full rebuild, same product,
// lighter weight"). Two builds of the site, the one shipped and the one
// proposed, served at two origins, print the same thing to a reader:
//   S1  on every sampled chapter page, read whole (every section of the
//       chapter built and read, not only the stretch the arrival builds; a
//       section of it one build did not build is said), every word's line
//       and its chip are
//       the same, under the default switches, with no blanks on, with no
//       names on, in the English reader, and under each default source other
//       than STEP pressed and then STEP pressed to come back
//       (default-picks-rule-v1; a switch one build lacks is reported, not
//       compared). A word's line is the line drawn over it: its own, or,
//       where it stands in words one card joins, the run's part under it
//       (none where the run draws it bare) or the run's one line over all of
//       them (the lines resting-lines-v1 reads). With --expect
//       data/default-picks/index.json, the lines the new build fills at rest
//       (where STEP leaves a word and its second, the source that fills most
//       of what STEP leaves in the book, reads it) are the differences the
//       batch makes on purpose: every line that differs is one of them, and
//       every one of them on a sampled page reads the second's words under
//       the second's chip; so are the lines where the old build's line is
//       bare and the index carries STEP's own words (step_words): there the
//       new line is STEP's words drawn as the page draws them (a "/" a
//       joint; under the signs switch at rest a piece that is a sign alone,
//       beside pieces that carry words, drawn as the hidden sign's gap), under
//       STEP's chip (M4), under every switch both builds carry; and so are
//       the lines of their neighbors in the run: a word whose part was a
//       sign alone, standing because no part of the run carried words, is
//       drawn as the hidden sign's gap under its own chip once STEP's words
//       stand beside it; and under each default source pressed, a word of a
//       reading the place gives across words (a reading ending with a hyphen
//       goes on in the next word: TAHOT's «from/ Beth-» «-lehem», «Tubal-»
//       «Cain») that no one source reads at every word of it keeps the line
//       as it rests, the new build's own line at rest there, where an older
//       build printed a source's line at one word of it and the other's half
//       alone (zone.html dfltHalvesOf, the review of the toggles fixes, 15
//       November 2026). The owed lines are read from the index, the zones,
//       the default picks' book files and the page, never named; a line not
//       drawn as owed is said once
//   S2  the cards of the first words of the chapter carry the same pills in
//       the same order with the same one pressed
// THE DICTIONARIES THAT REST SHUT (dictionary-kinds-rule-v1, 15 November
// 2026). With --expect data/dictionary-kinds-v1.json, on a book the record
// rests shut (its scope, asked of the new build's zone), the differences
// the record makes on purpose are owed: on S1, a line that differs is one
// whose old chip names a source the record rests shut whole (a word's line
// or a run's), or whose old leader at its place (the old sidecar's o.l, or
// its place's own e[…].l, under «only»; the old zone's table line where the
// word is not graded or its name leads; never an alternate, la or alt,
// which the line reads only under the reader's switches) held one among its
// own carriers and the new build at rest leads the word otherwise, a
// reading that lost the rank a shut co-carrier's year gave it, or named a
// source that carries the credited reading only in rows a category of its
// own data rests shut (English Wiktionary's names: «Zilpah.», «Gershom.»),
// asked of the new build's store whole and at rest; its new chip names no
// such source; and
// every old line whose chip named one differs. On S2, a card that differs
// lost only pills whose every old carrier is a source shut whole or of a
// family a fact entry rests shut in part (English Wiktionary's names), and
// says it holds back at least as many (data-kind-withheld); it carries no
// pill the old card lacks, the pills both carry keep their order (each
// compared by its printed form, case folded, as the card groups them), and
// its pressed pill moves only where its word's line moved as owed. A work
// the record does not rest shut is compared as before, line for line and
// pill for pill. --expect may be given twice, and each file is told by its
// own rule_id; a file of another rule is refused, never guessed.
// The sample: every fifth served book with a chapter page, the first and the
// last among them, chapter 1 and the middle chapter of each; no book is
// named here (check-scope-derived S1). Without two origins the check skips.
// Usage: node tools/check-same-product-v1.mjs --old <origin> --new <origin> [--every 5] [--chapters 2] [--diff <path>] [--expect <data/default-picks/index.json>] [--expect <data/dictionary-kinds-v1.json>]
//   --diff writes every differing card in full (old pills, new pills, the
//   pills only one build carries) and, after the cards, every differing line
//   (old and new, with their chips), one per "line:" entry, so a batch that
//   changes pills or lines on purpose can name each difference in its notes
import { writeFileSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { autoSecond } from "./bake-default-picks-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { readingKey, openRouteStore } from "./gloss-store-v1.mjs";
import { DICTIONARY_KINDS_RULE_ID, restsOffIds, restsOffIn } from "./dictionary-kinds-v1.mjs";
import { onlyLeaders } from "./place-leaders-v1.mjs";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DIFF = arg("diff", ""); const diffLines = [];
const OLD = arg("old", ""), NEW = arg("new", ""), EVERY = Number(arg("every", "5")), CHAPTERS = Number(arg("chapters", "2"));
if (!/^https?:/u.test(OLD) || !/^https?:/u.test(NEW)) { console.log("SKIPPED — needs two builds to compare: --old <origin> --new <origin>"); process.exit(3); }
const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const withPages = zonesServed().filter((z) => existsSync(join(SITE, z, "1", "index.html")));
const books = withPages.filter((z, i) => i % EVERY === 0 || i === withPages.length - 1);
const chaptersOf = (z) => readdirSync(join(SITE, z)).filter((d) => /^\d+$/u.test(d)).map(Number).sort((a, c) => a - c);
const pages = [];
for (const z of books) { const chs = chaptersOf(z); if (!chs.length) continue; const pick = [chs[0]]; if (CHAPTERS > 1 && chs.length > 1) pick.push(chs[Math.floor(chs.length / 2)]); for (const ch of pick.slice(0, CHAPTERS)) pages.push({ z, ch }); }
console.log(`${books.length} of ${withPages.length} served books with chapter pages · ${pages.length} pages · old ${OLD} · new ${NEW}`);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
// [name, the pill pressed, the pill that puts it back]: a pill that flips is pressed again; a default source is put
// back by pressing STEP
const STATES = [["default", null, null], ["no blanks", "blanksPill", "blanksPill"], ["no names", "namesPill", "namesPill"], ["English reader", "modeEn", "modeEn"],
  ["MACULA", "default-macula", "default-step"], ["UBS", "default-ubs", "default-step"], ["BDB", "default-bdb", "default-step"]];
// THE FILLS AT REST, read from the index the new build serves (--expect): per book, WORD_N -> the second's line,
// the second worked out as the page works it, every source on: the one that fills the most of what STEP leaves,
// a tie to the earlier pill
// --expect, as often as given, each file told by its own rule_id
const DEFAULT_PICKS_RULE = "default-picks-rule-v1-";
let EXPECT = "", KINDS = null;
for (const [i, a] of process.argv.entries()) {
  if (a !== "--expect") continue;
  const path = process.argv[i + 1] || "";
  let rec = null;
  try { rec = JSON.parse(readFileSync(path, "utf8")); } catch (e) { console.log(`REFUSED — --expect ${path}: not a file of JSON this check can read (${e.message})`); process.exit(2); }
  if (String(rec.rule_id || "").startsWith(DEFAULT_PICKS_RULE)) { if (EXPECT) { console.log(`REFUSED — --expect names two files of ${DEFAULT_PICKS_RULE}…`); process.exit(2); } EXPECT = path; }
  else if (rec.rule_id === DICTIONARY_KINDS_RULE_ID) { if (KINDS) { console.log(`REFUSED — --expect names two records of ${DICTIONARY_KINDS_RULE_ID}`); process.exit(2); } KINDS = { rec, path }; }
  else { console.log(`REFUSED — --expect ${path}: its rule_id ${JSON.stringify(rec.rule_id || null)} is not an expectation this check knows (${DEFAULT_PICKS_RULE}…, ${DICTIONARY_KINDS_RULE_ID})`); process.exit(2); }
}
// THE DICTIONARIES THAT REST SHUT, as the new build's store and zones hold them: the ids the record rests shut
// whole; the ids of the families a fact entry rests shut in part; which works it rests shut; and the old build's
// zone and sidecar, for who carried an old line (fetched from the old origin)
let SHUT = new Set(), FACT_IDS = new Set();
const scopeMemo = new Map(), oldMemo = new Map();
if (KINDS) {
  const ix = JSON.parse(readFileSync(join(SITE, "reader", "data", "route-store", "index.json"), "utf8"));
  SHUT = new Set(restsOffIds(KINDS.rec, ix.m_sources));
  const factKeys = new Set(KINDS.rec.rests_off.filter((e) => e.fact).flatMap((e) => e.families || []).flatMap((id) => (KINDS.rec.families.find((f) => f.id === id) || { keys: [] }).keys));
  FACT_IDS = new Set(Object.entries(ix.m_sources).filter(([, x]) => factKeys.has(x.key)).map(([m]) => m));
}
const restsHere = (z) => {
  if (!KINDS) return false;
  if (!scopeMemo.has(z)) scopeMemo.set(z, restsOffIn(KINDS.rec, JSON.parse(gunzipSync(readFileSync(join(SITE, "reader", "data", "zones", `${z}.bin`))).toString("utf8"))));
  return scopeMemo.get(z);
};
// the new build's store, whole and at rest, opened only when a line asks: which of the ids a credit names carried its
// reading in the store whole and in no row that rests open (a source shut whole, or a category its own data marks)
let STORES = null;
const storesOf = () => { if (!STORES) { const dir = join(SITE, "reader", "data", "route-store"); STORES = [openRouteStore(dir), openRouteStore(dir, { atRest: true })]; } return STORES; };
const stoodShut = (keys, text, ids) => {
  if (typeof text !== "string" || !text || !Array.isArray(ids) || !ids.length) return false;
  const [whole, rest] = storesOf();
  const of = (st) => new Set(keys.flatMap((kk) => st.carriersOf(st.routesFor(kk) || [], text).map((row) => String(row[3]))));
  const w = of(whole), o = of(rest);
  return ids.map(String).some((id) => w.has(id) && !o.has(id));
};
const fetchGz = async (u) => { try { const r = await fetch(u); return r.ok ? JSON.parse(gunzipSync(Buffer.from(await r.arrayBuffer())).toString("utf8")) : null; } catch { return null; } };
const oldOf = async (z) => { if (!oldMemo.has(z)) oldMemo.set(z, { zone: await fetchGz(`${OLD}/reader/data/zones/${z}.bin`), side: await fetchGz(`${OLD}/reader/data/zones/${z}.lattice.bin`) }); return oldMemo.get(z); };
// the new build's zone and sidecar, from this tree (the build the gate stands in)
const newMemo = new Map();
const readGz = (path) => { try { return JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")); } catch { return null; } };
const newOf = (z) => { if (!newMemo.has(z)) newMemo.set(z, { zone: readGz(join(SITE, "reader", "data", "zones", `${z}.bin`)), side: readGz(join(SITE, "reader", "data", "zones", `${z}.lattice.bin`)) }); return newMemo.get(z); };
// THE LEADERS A WORD'S LINE READS IN A BUILD, under "only": the place's own where the lattice grades the word
// (onlyLeaders: its e[…].l, else o.l), and the table's line of each of its keys where it does not, or where the name
// leads; each with its own carriers. Never an alternate (la, the table's alt): the line reads one only under the
// reader's switches. Counted with the alternates and every carrier of the word, almost a third of the words of every
// book held a shut source (Genesis 6,831 of 22,329), and a line any other fault moved there passed as owed (the review
// of 15 November 2026). `build` is { zone, side }, `w` the word as that build's zone holds it, `keys` its keys.
const leadersRead = (build, w, keys) => {
  const out = [];
  if (!build || !w) return out;
  const zone = build.zone || {}, side = build.side || null;
  const g = side && side.grades ? side.grades[w.s] : null;
  const graded = !!(g && g.o && Object.prototype.hasOwnProperty.call(g.o, "l"));
  const at = graded ? onlyLeaders(g, w.tg || null, !side.names || !!w.np) : null;
  if (at && Array.isArray(at.l)) out.push({ text: String(at.l[0]), by: (Array.isArray(at.l[4]) ? at.l[4] : []).map(String) });
  if (!graded || (at && at.nl)) for (const kk of keys) { const m = (zone.gloss_m || {})[kk], t = (zone.gloss || {})[kk]; if (m && typeof t === "string") out.push({ text: t, by: (Array.isArray(m.by) ? m.by : []).map(String) }); }
  return out;
};
// A RANK A SHUT CO-CARRIER GAVE, or a reading that stood on rows a category rests shut: why a word's line that differs
// moved on purpose, asked of the leaders it read in the old build and the new (leadersRead). The first, a leader whose
// own carriers held a source the record rests shut whole, which the new build at rest no longer leads at the word; the
// second, a leader naming a source of a family a fact entry rests shut in part that itself carries the reading only in
// rows that rest shut (stood, asked of those sources alone: a source shut whole among the carriers is the first's).
// Null where neither: the line moved for another reason, and the gate says so.
const kindsMovedWhy = (was, now, shut, factIds, stood) => {
  const nowTexts = new Set(now.map((l) => l.text));
  if (was.some((l) => l.by.some((id) => shut.has(id)) && !nowTexts.has(l.text))) return "a rank a shut co-carrier gave";
  if (factIds.size && was.some((l) => { const of = l.by.filter((id) => factIds.has(id)); return of.length > 0 && stood(l.text, of); })) return "a reading on rows a category rests shut";
  return null;
};
const idsOf = (chipLine) => String(chipLine || "").split(/[\s,]+/u).filter(Boolean);
const FILLED = new Map(), STEP_WORDS = new Map();
// the M a source's line is credited to (STEP's reading: its TAHOT translation's)
const M_OF = new Map();
// STEP's words as the page draws a reading: its "/" a joint, a closing stop dropped (spanJoin)
const packed = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");
// a line that draws no words: none, or only the hidden sign's gap
const blank = (t) => !String(t || "").replace(/\u200b/gu, "").trim();
// THE SIGNS AT REST (the page's signsOffLine): a piece that is a sign alone is drawn as the hidden sign's gap beside
// pieces that carry words, and every piece a sign, they stand; a joiner stands only between two pieces that print
const SIGN_GAP = "\u200b";
const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|\u00bf|~|X|\u00d7|\+)$/u.test(String(t).trim());
const isGap = (x) => String(x ?? "").trim() === SIGN_GAP;
const joinDrawn = (pieces) => pieces.map((x, i) => `${i && !isGap(x) && pieces.slice(0, i).some((y) => !isGap(y)) ? " + " : ""}${x}`).join("");
const signsOff = (text) => { const pieces = String(text).split(" + "); return joinDrawn(pieces.every(signOnly) ? pieces : pieces.map((x) => (signOnly(x) ? SIGN_GAP : x))); };
// STEP's words as the line draws them at rest
const drawnStep = (t) => signsOff(packed(t));
if (EXPECT) {
  const ix = JSON.parse(readFileSync(EXPECT, "utf8"));
  const ids = (ix.sources || []).map((x) => x.id);
  for (const s of ix.sources || []) M_OF.set(s.id, typeof s.m === "string" ? s.m : (s.m || {}).r || null);
  for (const [book, e] of Object.entries(ix.books || {})) {
    let y = null;
    for (const z of ids) if (z !== "step" && e.fills.step[z] > 0 && (y === null || e.fills.step[z] > e.fills.step[y])) y = z;
    const at = new Map();
    for (const leaf of y ? e.step_leaves : []) {
      const t = y === "macula" ? leaf[1] : y === "ubs" ? leaf[2] : Array.isArray(leaf[3]) && leaf[3][1] ? (leaf[3][0] !== "" ? `${leaf[3][1]} \u00b7 sense ${leaf[3][0]}` : leaf[3][1]) : 0;
      if (t) at.set(leaf[0], { text: String(t).trim().replace(/\.$/u, ""), m: M_OF.get(y) });
    }
    FILLED.set(book, at);
    STEP_WORDS.set(book, new Map((e.step_words || []).map(([n, w]) => [n, drawnStep(w)])));
  }
}
// A READING ACROSS WORDS STANDS OR GOES WHOLE (zone.html dfltHalvesOf; the review of the toggles fixes, 15 November
// 2026: S1 green on a tree read the shipped engine, and the round's door, which builds the tree's own, would have met
// these lines as differences). Under a source pressed on the row, a word of a reading the place gives across words
// takes a source's line only where one source has a line at every word of it, and else keeps the line as it rests: a
// reading ending with a hyphen (the place's reading as its pieces print it, every piece carrying words) goes on in the
// next word of its section that is not a mark. A word's source is the one whose line it would read: the source pressed,
// else its second (autoSecond, every source on), a pair (kq) none; STEP as a second fills only where today's line is
// bare, which a word whose pieces print is not. Per book, from the index, the zone and the book file the new build
// serves: source -> the WORD_N held to the line as it rests
const HELD = new Map();
const HELD_SLOT = { macula: 1, ubs: 2, bdb: 3 };
const SRC_OF_STATE = new Map(STATES.filter(([, id]) => /^default-(?!step$)/u.test(id || "")).map(([nm, id]) => [nm, id.slice("default-".length)]));
let heldSeen = 0;
const heldIn = (z, src) => {
  if (!EXPECT) return null;
  if (!HELD.has(z)) {
    const bySrc = new Map();
    HELD.set(z, bySrc);
    const e = (JSON.parse(readFileSync(EXPECT, "utf8")).books || {})[z];
    const bookAt = e ? join(dirname(EXPECT), e.file) : "";
    if (!e || !existsSync(bookAt)) return null;
    const zone = JSON.parse(gunzipSync(readFileSync(join(SITE, "reader", "data", "zones", `${z}.bin`))).toString("utf8"));
    const bf = JSON.parse(gunzipSync(readFileSync(bookAt)).toString("utf8"));
    // the one counting rule: a pick's words hold a letter or a digit and are not the UBS dictionary's «NO DATA YET»
    const linePick = (t) => typeof t === "string" && /[\p{L}\p{N}]/u.test(t) && t !== "NO DATA YET";
    const lineAt = (n, x) => {
      const at = bf.places[n - 1], slot = at && HELD_SLOT[x] ? at[HELD_SLOT[x]] : 0;
      if (!slot) return false;
      if (x === "macula") return linePick(slot);
      if (x === "ubs") return linePick(slot[0]);
      return linePick(slot[0] && slot[0][1] ? bf.bdb_words[slot[0][1] - 1] : null);
    };
    const said = (w) => (Array.isArray(w.pg) && w.pg.length && w.pg.every((p) => p && String(p.g || "").trim()) ? w.pg.map((p) => String(p.g).trim()).join("/") : "");
    const groups = [];
    let n = 0;
    for (const sec of zone.sections || []) {
      const ws = [];
      for (const w of sec.words || []) { n += 1; if (!w.mark) ws.push({ w, n }); }
      let g = null;
      for (const q of ws) {
        if (g) g.push(q);
        if (!/-$/u.test(said(q.w))) g = null;
        else if (!g) { g = [q]; groups.push(g); }
      }
    }
    for (const x of Object.keys(HELD_SLOT)) {
      const y = autoSecond(e.fills, x);
      const srcAt = (q) => (q.w.kq ? null : lineAt(q.n, x) ? x : y && y !== "step" && lineAt(q.n, y) ? y : null);
      const held = new Set();
      for (const g of groups) {
        const s = g.map(srcAt);
        if (s.every((v) => v && v === s[0])) continue;
        g.forEach((q, j) => { if (s[j]) held.add(q.n); });
      }
      bySrc.set(x, held);
    }
  }
  return HELD.get(z).get(src) || null;
};
// a section's first WORD_N, from the zone the page is built from (sections are s<index>, words in order)
const baseN = new Map();
const firstN = (z, secId) => {
  if (!baseN.has(z)) {
    const zone = JSON.parse(gunzipSync(readFileSync(join(SITE, "reader", "data", "zones", `${z}.bin`))).toString("utf8"));
    const at = []; let n = 0;
    for (const sec of zone.sections || []) { at.push(n); n += (sec.words || []).length; }
    baseN.set(z, at);
  }
  return baseN.get(z)[Number(String(secId).slice(1))];
};
const read = async (origin, z, ch) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  const errors = []; p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh */ } });
  const out = { states: {}, cards: null, errors, absent: [], chapter: [] };
  try {
    await p.goto(`${origin}/${z}/${ch}/`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    // THE CHAPTER WHOLE (the review of 15 November 2026: only the stretch the arrival happened to build was read, about
    // the first ten verses, so an owed line missing or an unowed line moved farther down a sampled chapter passed
    // green). Every section of the page's own chapter is built: by the page's own function where it offers one
    // (__materialise, as tools/resting-lines-v1.mjs builds a work), else by scrolling each section of it that still
    // waits into view; and every one of them is read, under every switch. A section of the chapter is one whose
    // number begins with the chapter's
    const chapter = await p.evaluate((c) => [...document.querySelectorAll("section.seg")].map((s, i) => [i, s.id, ((s.querySelector(".vnum") || {}).textContent || "").split(":")[0]]).filter((x) => x[2] === String(c)).map((x) => [x[0], x[1]]), ch);
    out.chapter = chapter.map((x) => x[1]);
    if (chapter.length) {
      const built = await p.evaluate(([from, to]) => (typeof window.__materialise === "function" ? (window.__materialise(from, to), true) : false), [chapter[0][0], chapter[chapter.length - 1][0] + 1]);
      if (!built) for (let k = 0; k < 2000; k += 1) {
        const waits = await p.evaluate((ids) => { const el = ids.map((id) => document.getElementById(id)).find((x) => x && !x.querySelector(".he-text .wb")); if (el) el.scrollIntoView({ block: "start" }); return !!el; }, out.chapter);
        if (!waits) break;
        await p.waitForTimeout(120);
      }
      await p.evaluate((id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: "start" }); }, out.chapter[0]);
    }
    await p.waitForTimeout(600);
    // the chapter's sections only, each read when built
    const readLines = () => p.evaluate((ids) => {
      const out = {};
      ids.map((id) => document.getElementById(id)).filter(Boolean).forEach((sec) => {
        const wbs = [...sec.querySelectorAll(".he-text .wb")]; if (!wbs.length) return;
        // [the word, its line, its chip as it reads, the M the chip names, the run it stands in or ""]: the line drawn
        // over the word, as resting-lines-v1 reads it: its own, or in words one card joins the run's part under it
        // (none: drawn bare) or the run's one line over all of them
        const runs = [...sec.querySelectorAll(".he-text .wjoin")];
        // drawn: nothing between it and the section's text is hidden
        const he = sec.querySelector(".he-text");
        const drawnEl = (el) => { for (let x = el; x && x !== he; x = x.parentElement) if (getComputedStyle(x).display === "none") return false; return true; };
        out[sec.id] = wbs.map((wb) => {
          const said = wb.querySelector(".w")?.textContent || "";
          const run = wb.closest(".wjoin"), runG = run ? run.querySelector(":scope > .g") : null, rg = runG && drawnEl(runG) ? runG : null;
          const key = run ? `r${runs.indexOf(run)}` : "";
          let g = wb.querySelector(":scope > .g");
          if (rg && rg.classList.contains("parts")) g = rg.querySelector(`:scope > .g-part[data-wi="${[...run.querySelectorAll(".wb")].indexOf(wb)}"]`);
          else if (rg) g = rg;
          if (!g) return [said, "", "", "", key];
          const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
          const chip = g.querySelector(".g-lic");
          return [said, c.textContent.trim(), chip ? chip.textContent || "" : "", chip ? chip.dataset.line || "" : "", key];
        });
      });
      return out;
    }, out.chapter);
    // read until two readings agree: a whole chapter's lines are drawn again as the files they read land
    const lines = async () => {
      let last = null, got = null;
      for (let k = 0; k < 12; k += 1) { got = await readLines(); const now = JSON.stringify(got); if (now === last) break; last = now; await p.waitForTimeout(300); }
      return got;
    };
    out.states.default = await lines();
    // the cards of the first three words of the chapter, at the default
    out.cards = [];
    for (let i = 0; i < 3; i += 1) {
      const ok = await p.evaluate((i) => { const wb = document.querySelectorAll("section.seg .he-text .wb:not(.mark)")[i]; if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; }, i);
      if (!ok) break;
      await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 }).catch(() => {});
      await p.waitForTimeout(700);
      // each pill as "*text" where pressed, with its carriers; what the card holds back as resting shut; the word's
      // section and its place among the section's entries, so a moved pressed pill can be held to its word's line
      out.cards.push(await p.evaluate((i) => {
        const wb = document.querySelectorAll("section.seg .he-text .wb:not(.mark)")[i], sec = wb ? wb.closest("section.seg") : null;
        const box = document.querySelector("#hud > .rows .b-read .r-pills");
        const pills = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")];
        return { said: pills.map((x) => `${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${x.textContent.trim()}`), by: pills.map((x) => x.dataset.by || ""),
          held: box ? Number(box.dataset.kindWithheld || 0) : 0, at: sec ? [sec.id, [...sec.querySelectorAll(".he-text .wb")].indexOf(wb)] : null };
      }, i));
      await p.keyboard.press("Escape"); await p.waitForTimeout(200);
    }
    for (const [name, id, back] of STATES.slice(1)) {
      const has = await p.evaluate((id) => { const x = document.getElementById(id); return !!(x && !x.disabled && !x.closest("[hidden]")); }, id);
      if (!has) { out.absent.push(name); continue; }
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(100);
      await p.click(`#${id}`); await p.waitForTimeout(1500);
      // a default source's picks are the book's own file, asked on the press
      await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
      out.states[name] = await lines();
      await p.click(`#${back}`); await p.waitForTimeout(800);
    }
  } catch (e) { out.failed = String(e.message || e).slice(0, 160); }
  await ctx.close();
  return out;
};
const s1 = [], s2 = [], skipped = [], failed = [], expected = [];
let linesCompared = 0, cardsCompared = 0, filledSeen = 0, neighborsSeen = 0;
// the moves the record of what rests shut owes: lines by class, the default lines that moved (for S2's pressed
// pill), and cards that held back what rests shut
const kindsMoved = { "a shut source's line": 0, "a shut source's run line": 0, "a rank a shut co-carrier gave": 0, "a reading on rows a category rests shut": 0 }, kindsLines = new Set();
let kindsCards = 0, kindsPillsLost = 0;
for (const { z, ch } of pages) {
  const [a, c] = [await read(OLD, z, ch), await read(NEW, z, ch)];
  if (a.failed || c.failed) { failed.push(`${z} ${ch}: ${a.failed || ""}${c.failed ? ` / new: ${c.failed}` : ""}`); continue; }
  for (const [name] of STATES) {
    const A = a.states[name], C = c.states[name];
    if (!A || !C) { if (name !== "default") skipped.push(`${z} ${ch} ${name}: ${!A ? "old" : "new"} lacks the switch`); continue; }
    // every section of the chapter, read on both builds: one that either did not build is said, never skipped
    const common = a.chapter.filter((k) => c.chapter.includes(k) && A[k] && C[k]);
    const unread = [...new Set([...a.chapter, ...c.chapter])].filter((k) => !common.includes(k));
    if (unread.length) s1.push(`${z} ${ch} ${name}: ${unread.length} section(s) of the chapter not read on both builds (${unread.slice(0, 4).join(", ")})`);
    if (!common.length) { s1.push(`${z} ${ch} ${name}: no section built on both`); continue; }
    for (const k of common) {
      const n = Math.max(A[k].length, C[k].length);
      const filled = FILLED.get(z), stepWords = STEP_WORDS.get(z);
      const nOf = (i) => firstN(z, k) + i + 1;
      // STEP's words owed where the old line is bare; and in a run that holds such a word, the neighbors whose old
      // part was a sign alone, standing because no part of the run carried words: the hidden sign's gap is owed
      const gains = (i) => !!stepWords && stepWords.has(nOf(i)) && !!A[k][i] && blank(A[k][i][1]);
      const gapOwed = new Set();
      for (let i = 0; i < A[k].length; i += 1) {
        const r = A[k][i][4];
        if (!r || !gains(i)) continue;
        A[k].forEach((x, j) => { if (j !== i && x[4] === r && signOnly(x[1])) gapOwed.add(j); });
      }
      for (let i = 0; i < n; i += 1) {
        linesCompared += 1;
        const x = A[k][i] || ["", "", "", "", ""], y = C[k][i] || ["", "", "", "", ""];
        const at = `${z} ${ch} ${name === "default" ? "" : `${name} `}${k} #${i + 1}`;
        // a fill at rest the batch makes on purpose: the new line is the second's words under its chip, whatever the old one was
        const want = filled ? filled.get(nOf(i)) : undefined;
        if (want !== undefined) {
          if (name === "default") filledSeen += 1;
          const owed = y[1] === want.text && y[3] === want.m && x[0] === y[0];
          if (owed) { if (x[1] !== y[1] && DIFF) diffLines.push(`fill: ${z} ${ch} ${name} ${k} #${i + 1}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); continue; }
          expected.push(`${at}: "${y[1]}" [${y[3]}], the fill owed "${want.text}" [${want.m}]`);
          continue;
        }
        // STEP's own words where the old line is bare: the new line is STEP's words as the page draws them, under STEP's chip
        const words = gains(i) ? stepWords.get(nOf(i)) : undefined;
        if (words !== undefined && x[0] === y[0]) {
          if (name === "default") filledSeen += 1;
          const owed = y[1] === words && y[3] === M_OF.get("step");
          if (owed) { if (DIFF) diffLines.push(`step's words: ${z} ${ch} ${name} ${k} #${i + 1}: bare → "${y[1]}" [${y[2]}]`); continue; }
          expected.push(`${at}: "${y[1]}" [${y[3]}], STEP's words owed "${words}" [${M_OF.get("step")}]`);
          continue;
        }
        // under a source pressed, a word of a reading across words no one source reads at every word: the line as it
        // rests, the new build's own at rest there, its text and its chip (heldIn)
        const holds = SRC_OF_STATE.has(name) ? heldIn(z, SRC_OF_STATE.get(name)) : null;
        if (holds && holds.has(nOf(i)) && x[0] === y[0]) {
          const rest = c.states.default && c.states.default[k] ? c.states.default[k][i] : null;
          if (rest && y[1] === rest[1] && y[2] === rest[2] && y[3] === rest[3]) {
            if (x[1] !== y[1] || x[2] !== y[2]) { heldSeen += 1; if (DIFF) diffLines.push(`held whole: ${z} ${ch} ${name} ${k} #${i + 1}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); }
            continue;
          }
          expected.push(`${at}: "${y[1]}" [${y[3]}], the line as it rests owed at a word of a reading across words ${name} does not read whole ("${rest ? rest[1] : ""}" [${rest ? rest[3] : ""}])`);
          continue;
        }
        // a neighbor in the run: its sign alone drawn as the hidden sign's gap, under its own chip
        if (gapOwed.has(i) && x[0] === y[0]) {
          if (name === "default") neighborsSeen += 1;
          const owed = y[1] === SIGN_GAP && y[2] === x[2] && y[3] === x[3];
          if (owed) { if (DIFF) diffLines.push(`gap beside STEP's words: ${z} ${ch} ${name} ${k} #${i + 1}: "${x[1]}" [${x[2]}] → the hidden sign's gap [${y[2]}]`); continue; }
          expected.push(`${at}: "${y[1]}" [${y[3]}], the hidden sign's gap owed beside STEP's words in its run [${x[3]}]`);
          continue;
        }
        // THE DICTIONARIES THAT REST SHUT (--expect data/dictionary-kinds-v1.json), on a book the record rests shut
        const differs = x[0] !== y[0] || x[1] !== y[1] || x[2] !== y[2];
        if (KINDS && restsHere(z)) {
          const oldIds = idsOf(x[3]), newIds = idsOf(y[3]);
          let why = null;
          if (oldIds.some((id) => SHUT.has(id))) why = x[4] ? "a shut source's run line" : "a shut source's line";
          else if (differs) {
            // the leaders the word's line read in the old build and reads in the new (leadersRead), and why it moved
            const old = await oldOf(z), neu = newOf(z), si = Number(String(k).slice(1));
            const wordOf = (build) => (build.zone && build.zone.sections ? ((build.zone.sections[si] || {}).words || [])[i] : null);
            const w = wordOf(old);
            const keys = w ? (Array.isArray(w.w) ? w.w.map((r) => r && r.k).filter(Boolean) : [w.k].filter(Boolean)) : [];
            why = kindsMovedWhy(leadersRead(old, w, keys), leadersRead(neu, wordOf(neu), keys), SHUT, FACT_IDS, (t, ids) => stoodShut(keys, t, ids));
          }
          if (why) {
            if (differs && x[0] === y[0] && !newIds.some((id) => SHUT.has(id))) {
              kindsMoved[why] += 1;
              if (name === "default") kindsLines.add(`${z} ${ch} ${k} #${i + 1}`);
              if (DIFF) diffLines.push(`kinds (${why}): ${z} ${ch} ${name} ${k} #${i + 1} ${x[0]}: "${x[1]}" [${x[2]} · ${x[3]}] → "${y[1]}" [${y[2]} · ${y[3]}]`);
              continue;
            }
            if (!differs || newIds.some((id) => SHUT.has(id))) { s1.push(`${at} ${x[0]}: "${x[1]}" [${x[2]} · ${x[3]}] → "${y[1]}" [${y[2]} · ${y[3]}]: ${!differs ? "credited to a source the record rests shut, and it stands" : "its new chip names a source the record rests shut"}`); if (s1.length > 400) break; continue; }
          }
        }
        if (differs) { s1.push(`${at} ${x[0]}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); if (s1.length > 400) break; }
      }
    }
  }
  const n = Math.max(a.cards.length, c.cards.length);
  for (let i = 0; i < n; i += 1) {
    cardsCompared += 1;
    const A = (a.cards[i] || { said: [], by: [], held: 0, at: null }), C = (c.cards[i] || { said: [], by: [], held: 0, at: null });
    const x = A.said.join(" | "), y = C.said.join(" | ");
    if (x === y) continue;
    // THE DICTIONARIES THAT REST SHUT on a book the record rests shut: the card may lose pills of theirs alone
    let owed = null;
    if (KINDS && restsHere(z)) {
      const key = (t) => readingKey(String(t).replace(/^\*/u, ""));
      const aKeys = A.said.map(key), cKeys = C.said.map(key), cSet = new Set(cKeys), aSet = new Set(aKeys);
      const lost = A.said.map((t, j) => [t, idsOf(A.by[j])]).filter(([t]) => !cSet.has(key(t)));
      const faults = [];
      for (const [t, ids] of lost) if (!ids.length || !ids.every((id) => SHUT.has(id) || FACT_IDS.has(id))) faults.push(`it lost «${t}» [${ids.join(" ")}], not carried by sources that rest shut alone`);
      if (cKeys.some((t) => !aSet.has(t))) faults.push(`it carries ${C.said.filter((t) => !aSet.has(key(t))).map((t) => `«${t}»`).join(", ")}, which the old card lacks`);
      if (JSON.stringify(aKeys.filter((t) => cSet.has(t))) !== JSON.stringify(cKeys.filter((t) => aSet.has(t)))) faults.push("the pills both carry do not keep their order");
      if (C.held < lost.length) faults.push(`it lost ${lost.length} pill(s) and says it holds back ${C.held}`);
      const pressedA = A.said.find((t) => t.startsWith("*")), pressedC = C.said.find((t) => t.startsWith("*"));
      const lineMoved = !!C.at && kindsLines.has(`${z} ${ch} ${C.at[0]} #${C.at[1] + 1}`);
      if ((pressedA ? key(pressedA) : null) !== (pressedC ? key(pressedC) : null) && !lineMoved) faults.push(`its pressed pill moved from ${pressedA || "none"} to ${pressedC || "none"}, and its word's line did not move as owed`);
      if (!faults.length) { owed = lost.length; kindsCards += 1; kindsPillsLost += lost.length; }
      else s2.push(`${z} ${ch} card ${i + 1}: ${faults.join("; ")}`);
    }
    if (DIFF) diffLines.push(`== ${z} ${ch} card ${i + 1}${owed !== null ? ` (kinds: ${owed} pill(s) of the dictionaries that rest shut, held back ${C.held})` : ""}\n  old: ${x}\n  new: ${y}\n  only old: ${A.said.filter((t) => !C.said.includes(t)).join(" | ")}\n  only new: ${C.said.filter((t) => !A.said.includes(t)).join(" | ")}`);
    if (owed === null && !(KINDS && restsHere(z))) s2.push(`${z} ${ch} card ${i + 1}: ${x.slice(0, 80)} → ${y.slice(0, 80)}`);
  }
}
// the lines that moved as heldIn owes them, said apart (a line held whole that differs from the old build's)
if (EXPECT) console.log(`readings across words (S1): under a source pressed, ${heldSeen} line(s) at a word of one no one source reads at every word moved to the line as it rests, as owed`);
await b.close();
const kindsSaid = KINDS ? ` · the dictionaries that rest shut (${KINDS.path}): ${Object.entries(kindsMoved).map(([why, nn]) => `${nn} ${why}`).join(", ")}, each as owed` : "";
check(`S1 every sampled line and its chip are the same on both builds, under every switch both carry${EXPECT ? ", but the fills at rest the index names, each reading the second's words, STEP's own words where the old line is bare, and the hidden sign's gap beside them in their run" : ""}${KINDS ? ", and on a book the record rests shut, the lines a source it rests shut carried or ranked, each moved to a source it does not" : ""}`, !failed.length && pages.length > 0 && !s1.length && !expected.length,
  `${linesCompared.toLocaleString("en-US")} lines compared on ${pages.length} pages${EXPECT ? ` · ${filledSeen} fill(s) and STEP's words at rest on them, ${neighborsSeen} gap(s) beside them${expected.length ? `, ${expected.length} not as owed: ${expected.slice(0, 3).join("; ")}` : ", each as owed"}` : ""}${kindsSaid}${s1.length ? ` · ${s1.length} differ: ${s1.slice(0, 4).join("; ")}` : ""}${skipped.length ? ` · not compared: ${[...new Set(skipped.map((x) => x.split(": ")[1]))].join(", ")} (${skipped.length})` : ""}${failed.length ? ` · failed to read: ${failed.slice(0, 3).join("; ")}` : ""}`);
check(`S2 the first cards of every sampled chapter carry the same pills, the same one pressed${KINDS ? ", but on a book the record rests shut, the pills of the sources it rests shut alone, held back and counted" : ""}`, !failed.length && cardsCompared > 0 && !s2.length,
  `${cardsCompared} cards compared${KINDS ? ` · ${kindsCards} card(s) lost ${kindsPillsLost} pill(s) of the dictionaries that rest shut, each held back` : ""}${s2.length ? ` · ${s2.length} differ: ${s2.slice(0, 3).join("; ")}` : ""}`);
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
// every differing line too (7 November 2026): "line: <book> <chapter> <switch> <section> #<n> <surface>: "<old>" [<chip>] → "<new>" [<chip>]", so an accounting can read every move, not the four the summary names
// (the moves owed at rest, "fill:", "step's words:" and "gap beside STEP's words:", are written as they are met and
// counted apart from the cards)
if (DIFF) {
  writeFileSync(DIFF, diffLines.concat(s1.map((x) => `line: ${x}`)).join("\n") + "\n");
  const cards = diffLines.filter((x) => x.startsWith("== ")).length;
  console.log(`every differing card written in full: ${DIFF} (${cards} cards, ${diffLines.length - cards} lines that moved as owed, ${s1.length} lines that differ)`);
}
process.exit(bad ? 1 : 0);
