#!/usr/bin/env node
// RUN: tree
// GUARDS: stems-extension-rule-v1-three-more-dictionaries-name-their-stems-as-the-owner-set-their-branches-and-a-row-beside-the-store-is-asked-its-stem-too
// LEDGER: -
// no frame letter. A check reads the extension's pin, the pinned ruling, the
// store, the dictionaries beside it, the zones and the pages and judges them;
// it is not the ledger for one.
//
// THREE MORE DICTIONARIES NAME THEIR STEMS, AS THE OWNER SET THEIR BRANCHES,
// AND A ROW BESIDE THE STORE IS ASKED ITS STEM TOO. The binyan ledger's file
// 2 names the stems of the store's rows where BDB, TAHOT and MACULA say them.
// The corpus lane extended it to the UBS dictionary and the SDBH, whose rows
// the store serves, and to Jastrow, whose rows stand beside the store (relay
// v173; data/stems-extension/). Two branches were left to the owner and set
// on 13 November 2026 (ruling 2): the SDBH takes the UBS edition's verdict
// where that edition gives one, and a sense Jastrow prints before his first
// heading is the base stem's. The round's projection writes the stems into
// each book's sidecar, and the page asks them of every row, the store's and
// the rows beside it.
//
//   B1  the extension's rule and receipt are the bytes their pin names, the
//       lane's receipt names the file of lines as the pin does, and the
//       pinned rulings hold exactly one ruling on that file, which sets each
//       branch to a setting this lane knows how to read
//   B2  with the file on this machine (--extension <file>, or
//       STEMS_EXTENSION): it is the bytes its pin names; every line is well
//       formed and every branch on a line is one the ruling sets, to one of
//       the line's own options; and the lines are counted as the lane counts
//       them, source by source (lines, the bases as written, the lines that
//       carry a branch) and branch by branch as the ruling counts them.
//       Without the file this is said and not judged
//   B3  with the file: every line finds exactly one row, of the store where
//       the store serves its source and of a dictionary beside the store
//       where it does not, and no row is named by two lines
//   B4  every served book's sidecar that carries stems names the extension:
//       the rule, the pin, the file by its sha256, the ruling it was read
//       under and the branches as that ruling sets them, and how many rows
//       it gave stems, which is a recount's. With the file: each row of the
//       extension's sources carries in the sidecar exactly the stems its
//       line gives under the settings, no row of those sources carries stems
//       no line gives, and at every word of the book whose key holds a line
//       with stems the sidecar holds that row
//   B5  on the page, a verb whose key holds a row BESIDE THE STORE whose own
//       source names its stem, another stem than the word's: under the
//       default the card withholds for the stem exactly the rows this check
//       counts, the store's and those beside it, says so on its withheld
//       line, and prints no reading of that source that only such rows
//       carry; under "keep" it withholds none for the stem and the reading
//       is back on a pill of its source
//   B6  the same for a row of the store that has its stem by the owner's
//       setting of the_ubs_edition (with the file)
//   B7  the same for a row beside the store that has its stem by the owner's
//       setting of the_base_stem (with the file)
//   B8  a row beside the store whose stems share a family with the word's
//       stands: a reading only such rows of its source carry is on the card
//
// The words are found in the data, never named.
//
// Run: node tools/check-stems-extension-v1.mjs [--extension <row-stems-extension-v1.jsonl>]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, factsOf, readingKey, printedForm } from "./gloss-store-v1.mjs";
import { placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { nameWithheld } from "./names-gate-v1.mjs";
import { gradeRow } from "./pointing-grade-v1.mjs";
import { isOtherStem } from "./stem-family-v1.mjs";
import { readPinned, PinFault } from "./pinned-v1.mjs";
import { rulingsPinned, rulingOf, cited } from "./rulings-v1.mjs";
import { STEMS_EXTENSION_RULE_ID, STEMS_EXTENSION_DIR, STEMS_EXTENSION_HOME, readStemsExtension, stemsId } from "./stems-extension-v1.mjs";
import { openBesideTheStore, rowsBeside, besideAtAWord } from "./rows-beside-the-store-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { plainWord, openGatedCard } from "./gated-card-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const FILE = arg("extension", process.env.STEMS_EXTENSION || null);
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

console.log(`— ${STEMS_EXTENSION_RULE_ID} —\n`);
if (!existsSync(join(STEMS_EXTENSION_DIR, "PIN.json"))) { console.log("SKIPPED — no stems extension on this disk (data/stems-extension/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(STEMS_EXTENSION_DIR, "PIN.json"), "utf8"));
const store = openRouteStore(join(K3, "data", "route-store"));
const beside = openBesideTheStore(K3);

// ---- B1: the pinned bytes and the ruling -------------------------------------------------------
let theirs = null, ruling = null;
{
  const faults = [];
  if (pin.schema_version !== "STEMS_EXTENSION_PIN_V1" || !pin.lines || !pin.rule || !pin.receipt) faults.push("the pin names no file of lines, rule or receipt");
  else {
    try {
      readPinned(join(STEMS_EXTENSION_DIR, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
      theirs = JSON.parse(readPinned(join(STEMS_EXTENSION_DIR, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
    } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
    const out = (theirs || {}).output || {};
    if (theirs && (out.file !== pin.lines.file || out.sha256 !== pin.lines.sha256 || out.bytes !== pin.lines.bytes || out.lines !== pin.lines.lines)) faults.push("the lane's receipt names another file of lines than the pin");
    if (theirs && (theirs.rule || {}).sha256 !== pin.rule.sha256) faults.push("the lane's receipt names another rule than the pin");
    try {
      ruling = rulingOf(rulingsPinned(), pin.lines.sha256, (r) => Array.isArray(r.branches), "the setting of the stems extension's branches");
      for (const b of ruling.branches) if (b.resting !== "NONE" && b.resting !== String(b.name).toUpperCase()) faults.push(`the ruling sets ${b.name} to ${b.resting}, a setting this lane has not been told how to read`);
    } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  }
  check("B1  the extension's rule and receipt are the bytes their pin names, the lane's receipt names the file of lines as the pin does, and one pinned ruling sets each branch to a setting this lane reads", faults.length === 0,
    faults.length ? first(faults) : `relay ${pin.relay} · ${nf(pin.lines.lines)} lines (${String(pin.lines.sha256).slice(0, 12)}…) · ruling ${ruling.n} of relay ${ruling.relay_of_the_ruling}: ${ruling.branches.map((b) => `${b.name} at ${b.resting}`).join(", ")}`);
}

// ---- B2: the file itself, where it is here -----------------------------------------------------
let ext = null;
if (!FILE) console.log("  --  B2 and B3 were not judged here, nor the line-by-line half of B4, nor B6 and B7: the corpus lane's file of lines is not on this machine (--extension <row-stems-extension-v1.jsonl> or STEMS_EXTENSION)");
else {
  const faults = [];
  try { ext = readStemsExtension(FILE); } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  const by = {};
  if (ext) {
    for (const l of ext.lines) {
      const t = (by[l.m] ||= { lines: 0, basis: {}, branch: 0 });
      t.lines += 1; t.basis[l.written.basis] = (t.basis[l.written.basis] || 0) + 1; if (l.branch) t.branch += 1;
    }
    const want = Object.fromEntries(Object.entries((theirs || {}).by_source || {}).filter(([, v]) => v.rows_on_verb_keys > 0));
    for (const m of new Set([...Object.keys(by), ...Object.keys(want)])) {
      const mine = by[m], lane = want[m];
      if (!mine || !lane) { faults.push(`${m}: ${mine ? "the file holds its lines and the receipt counts none" : "the receipt counts its rows and the file holds no line"}`); continue; }
      if (mine.lines !== lane.rows_on_verb_keys) faults.push(`${m}: ${mine.lines} lines, the lane counts ${lane.rows_on_verb_keys}`);
      if (!same(Object.entries(mine.basis).sort(), Object.entries(lane.basis || {}).sort())) faults.push(`${m}: the bases as written are ${JSON.stringify(mine.basis)}, the lane counts ${JSON.stringify(lane.basis)}`);
      const laneBranch = Object.values(lane.branch || {}).reduce((a, n) => a + n, 0);
      if (mine.branch !== laneBranch) faults.push(`${m}: ${mine.branch} lines carry a branch, the lane counts ${laneBranch}`);
    }
    for (const b of ruling ? ruling.branches : []) {
      const lines = ext.lines.filter((l) => l.branch === b.name);
      if (lines.length !== b.lines) faults.push(`${b.name}: ${lines.length} lines carry it, the ruling counts ${b.lines}`);
      // where the ruling counts the lines its branch gives a verdict for, the count is this file's
      const counted = Object.entries(b).find(([k]) => /^lines_where_.*_gives_a_verdict$/u.test(k));
      if (counted && lines.filter((l) => l.by === b.name).length !== counted[1]) faults.push(`${b.name}: ${lines.filter((l) => l.by === b.name).length} lines take its verdict, the ruling counts ${counted[1]}`);
    }
  }
  const withStems = ext ? ext.lines.filter((l) => l.stems.length).length : 0;
  check("B2  the file of lines is the bytes its pin names, every line and branch is well formed and ruled, and the lines are counted as the lane's receipt and the ruling count them", !!ext && faults.length === 0,
    faults.length ? first(faults) : `${nf(ext.lines.length)} lines of ${Object.keys(by).length} sources (${Object.entries(by).sort().map(([m, t]) => `${m} ${nf(t.lines)}`).join(", ")}) · ${nf(withStems)} give their row stems under the settings, ${nf(ext.lines.filter((l) => l.by && l.stems.length).length)} of them by a branch`);
}

// ---- B3: every line finds its row ----------------------------------------------------------------
const sourcesOfTheExtension = new Set(Object.entries((theirs || {}).by_source || {}).filter(([, v]) => v.rows_on_verb_keys > 0).map(([m]) => m));
const inTheStore = (m) => !!(store.index.m_sources || {})[m];
const rowsOfSource = (m, k) => (inTheStore(m) ? (store.routesFor(k) || []) : rowsBeside(beside, k)).filter((r) => r[3] === m);
const lineOf = new Map();   // key -> Map(id -> line), where the file is here
if (ext) {
  const faults = [];
  let met = 0, stored = 0;
  for (const l of ext.lines) {
    const id = stemsId(l.m, l.rank, l.route);
    const held = lineOf.get(l.key) || lineOf.set(l.key, new Map()).get(l.key);
    if (held.has(id)) { faults.push(`«${l.key}» ${l.m} rank ${l.rank}: named by two lines`); continue; }
    held.set(id, l);
    const rows = rowsOfSource(l.m, l.key).filter((r) => r[0] === l.rank && r[1] === l.route);
    if (rows.length === 1) { met += 1; if (inTheStore(l.m)) stored += 1; }
    else if (faults.length < 6) faults.push(`«${l.key}» ${l.m} rank ${l.rank}: ${rows.length} rows carry that rank and route`);
    else faults.push("");
  }
  check("B3  every line finds exactly one row, of the store where the store serves its source and of a dictionary beside the store where it does not", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults.filter(Boolean))}` : `${nf(met)} of ${nf(ext.lines.length)} lines · ${nf(stored)} rows of the store, ${nf(met - stored)} beside it (${beside.map((b) => b.id).join(", ")})`);
}

// ---- B4: the sidecars, and the words for the page ------------------------------------------------
// what the place's gates and the pointing leave of the store's rows at a word, as the page gates them
const storeLeft = (w, rows, isName) => {
  const grades = rows.map((r) => gradeRow(r, w.s));
  const attested = grades.includes("m");
  const place = w.tg ? placeEntry([].concat(w.tg)) : null;
  const facts = rows.map(factsOf);
  const bdbHere = place ? bdbEntriesAt(place, facts) : null;
  const verdicts = rows.map((r, j) => (place ? entryVerdict(facts[j], place, bdbHere) : "none"));
  return { attested, left: rows.filter((r, j) => verdicts[j] !== "other" && !nameWithheld(facts[j], isName) && (verdicts[j] === "this" || !attested || grades[j] !== "x")) };
};
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
// a row beside the store prints its route whole where its dictionary's ledger wrote it no division
const printsWhole = (row) => row.length <= 8 || (!Array.isArray(row[8]) && !Array.isArray(row[9]));
const WANT = ["beside", "ubs", "base", "stands"];
const MOST = 4;
const picks = {};
const more = (kind) => (picks[kind] || []).length < MOST;
const b4 = { books: 0, ids: 0, words: 0, faults: [] };
const wantCited = ruling ? cited(ruling) : null;
const wantBranches = ruling ? Object.fromEntries(ruling.branches.map((b) => [b.name, b.resting])) : null;
for (const z of zonesServed()) {
  const sp = join(ZONES, `${z}.lattice.bin`);
  if (!existsSync(sp)) continue;
  const side = gz(sp);
  if (!side.stems || !side.binyan) continue;
  b4.books += 1;
  const said = side.binyan.extension || null;
  if (!said || said.rule !== STEMS_EXTENSION_RULE_ID || said.pin !== `${STEMS_EXTENSION_HOME}/PIN.json` || said.lines_sha256 !== pin.lines.sha256 || !same(said.ruling, wantCited) || !same(said.branches, wantBranches)
    || !(side.binyan.files || []).some((f) => f.file === pin.lines.file && f.sha256 === pin.lines.sha256)) { b4.faults.push(`${z}: its sidecar does not name this extension, its pin, the ruling and the branches as that ruling sets them`); continue; }
  let given = 0;
  for (const [k, held] of Object.entries(side.stems)) for (const [id, stems] of Object.entries(held)) {
    const m = id.split("\u0001")[0];
    if (!sourcesOfTheExtension.has(m)) continue;
    given += 1;
    if (!ext) continue;
    const l = (lineOf.get(k) || new Map()).get(id);
    if (!l || !l.stems.length) b4.faults.push(`${z} «${k}» ${m}: the sidecar gives a row stems no line gives`);
    else if (!same(stems, l.stems)) b4.faults.push(`${z} «${k}» ${m} rank ${l.rank}: the sidecar holds ${stems.join("+")} and its line gives ${l.stems.join("+")}`);
  }
  b4.ids += given;
  if (said.rows_given_stems_in_this_book !== given) b4.faults.push(`${z}: its sidecar says ${said.rows_given_stems_in_this_book} rows were given stems, and it holds ${given}`);
  const zone = gz(join(ZONES, `${z}.bin`));
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  for (const [si, sec] of (zone.sections || []).entries()) {
    const words = sec.words || [];
    for (const [e, w] of words.entries()) {
      if (w.mark) continue;
      // every key the word is asked under: its own, and each half's where it is written one way and read another
      for (const k of new Set([w.k, ...(w.w || []).map((h) => h && h.k)].filter(Boolean))) {
        if (!ext || !lineOf.has(k)) continue;
        b4.words += 1;
        const held = side.stems[k] || {};
        for (const [id, l] of lineOf.get(k)) if (l.stems.length && !same(held[id], l.stems)) { if (b4.faults.length < 40) b4.faults.push(`${z} ${sec.label} «${k}» ${l.m} rank ${l.rank}: its line gives ${l.stems.join("+")} and the sidecar holds ${held[id] ? held[id].join("+") : "nothing"}`); }
      }
      // the words for the page: one its place does not divide, whose pointed surface carries stems
      if (!WANT.some(more) || !plainWord(words, e)) continue;
      const g = (side.grades || {})[w.s];
      const st = g && Array.isArray(g.st) && g.st.length ? g.st : null;
      const rs = side.stems[w.k] || null;
      if (!st || !rs) continue;
      const rows = rowsOf(w.k);
      const { attested, left } = storeLeft(w, rows, !namesRead || !!w.np);
      const at = besideAtAWord(rowsBeside(beside, w.k), { surface: w.s, attested, rowStems: rs, wordStems: st });
      const otherInStore = left.filter((r) => isOtherStem(rs[stemsId(r[3], r[0], r[1])], st));
      const keptInStore = left.filter((r) => !otherInStore.includes(r));
      const total = otherInStore.length + at.ofAnotherStem.length;
      const here = { zone: z, section: si, entry: e, label: sec.label, s: w.s, k: w.k, st, total, ofTheStore: otherInStore.length, beside: at.ofAnotherStem.length };
      const lineFor = (r) => (ext ? (lineOf.get(w.k) || new Map()).get(stemsId(r[3], r[0], r[1])) : null) || null;
      // a reading of one source that only rows of a kind carry: no kept row of that source prints it
      const keptOf = (m) => [...keptInStore, ...at.kept].filter((r) => r[3] === m);
      const onlyBeside = (cands) => {
        for (const r of cands) {
          if (!printsWhole(r)) continue;
          const key = readingKey(r[1]);
          if (!key || keptOf(r[3]).some((x) => readingKey(x[1]).includes(key))) continue;
          return [printedForm(r[1]), r];
        }
        return null;
      };
      const onlyStore = (cands) => {
        for (const r of cands) for (const grp of store.readingPool([r], "oldest")) {
          const key = readingKey(grp.text);
          if (keptOf(r[3]).some((x) => (inTheStore(x[3]) ? store.readingPool([x], "oldest").some((y) => readingKey(y.text) === key) : readingKey(x[1]).includes(key)))) continue;
          return [grp.text, r];
        }
        return null;
      };
      if (more("beside") && at.ofAnotherStem.length && (keptInStore.length || at.kept.length)) {
        // its own source names its stem: with the file, a line that stands as written; without it, any row beside the store
        const only = onlyBeside(at.ofAnotherStem.filter((r) => !ext || (lineFor(r) && !lineFor(r).by)));
        if (only) (picks.beside ||= []).push({ ...here, reading: only[0], m: String(only[1][3]), stems: rs[stemsId(only[1][3], only[1][0], only[1][1])] });
      }
      if (ext && more("ubs") && otherInStore.length && (keptInStore.length || at.kept.length)) {
        const only = onlyStore(otherInStore.filter((r) => { const l = lineFor(r); return l && l.by && inTheStore(r[3]); }));
        if (only) (picks.ubs ||= []).push({ ...here, reading: only[0], m: String(only[1][3]), stems: rs[stemsId(only[1][3], only[1][0], only[1][1])], by: lineFor(only[1]).by });
      }
      if (ext && more("base") && at.ofAnotherStem.length && (keptInStore.length || at.kept.length)) {
        const only = onlyBeside(at.ofAnotherStem.filter((r) => { const l = lineFor(r); return l && l.by; }));
        if (only) (picks.base ||= []).push({ ...here, reading: only[0], m: String(only[1][3]), stems: rs[stemsId(only[1][3], only[1][0], only[1][1])], by: lineFor(only[1]).by });
      }
      if (more("stands")) {
        // a row beside the store whose stems are known and share a family with the word's, the only row of its source printing its reading
        const mine = at.kept.filter((r) => Array.isArray(rs[stemsId(r[3], r[0], r[1])]) && printsWhole(r));
        const r = mine.find((x) => { const key = readingKey(x[1]); return key && ![...keptInStore, ...at.kept].some((y) => y !== x && y[3] === x[3] && readingKey(y[1]).includes(key)); });
        if (r) (picks.stands ||= []).push({ ...here, reading: printedForm(r[1]), m: String(r[3]), stems: rs[stemsId(r[3], r[0], r[1])] });
      }
    }
  }
}
check(`B4  every book's sidecar that carries stems names the extension and the ruling it was read under, counts the rows it gave stems as a recount does${ext ? ", and holds for each row of the extension's sources exactly the stems its line gives, at every word whose key holds such a line" : ""}`, b4.books > 0 && b4.faults.length === 0,
  b4.faults.length ? `${nf(b4.faults.length)}${b4.faults.length >= 40 ? " or more" : ""} · ${first(b4.faults)}` : `${b4.books} books · ${nf(b4.ids)} rows given stems, book by book${ext ? ` · ${nf(b4.words)} words stand on a key that holds a line` : " · the lines were not read (the file is not on this machine)"}`);

// ---- B5 to B8: on the page -------------------------------------------------------------------------
const kinds = [
  ["beside", "B5  a row beside the store whose own source names its stem, another stem than the word's, is withheld for the stem and counted with the store's, and a reading only such rows of its source carry is on no pill", true],
  ["ubs", "B6  a row of the store that has its stem by the owner's setting of a branch, another stem than the word's, is withheld for the stem and counted, and a reading only such rows of its source carry is on no pill", !!ext],
  ["base", "B7  a row beside the store that has its stem by the owner's setting of a branch, another stem than the word's, is withheld for the stem and counted, and a reading only such rows of its source carry is on no pill", !!ext],
];
const lacking = kinds.filter(([kind, , judged]) => judged && !picks[kind]).map(([kind]) => kind);
if (lacking.length || !picks.stands) check("B5–B8 on the page", false, `no served word was found for: ${[...lacking, ...(picks.stands ? [] : ["stands"])].join(", ")}`);
else {
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  const open = (pick, masorah = null) => openGatedCard(browser, tree.base, pick, { masorah });
  const where = (pick) => `${pick.zone} ${pick.label}, entry ${pick.entry} (${pick.k}, ${pick.st.join(" or ")})`;
  const pillOf = (got, pick) => got.said.find(([text, by, own]) => [text, own].some((t) => t && readingKey(t) === readingKey(pick.reading)) && by.split(/[\s,]+/u).includes(pick.m)) || null;
  const own = async (list) => {
    for (const pick of list || []) { const got = await open(pick); if (got.fault || !got.joined) return [pick, got]; }
    return [null, null];
  };
  const JOINED = (list) => `each of the ${(list || []).length} word(s) found stands in a cell the page joins to its neighbors, so no card of its own was read`;
  try {
    for (const [kind, law, judged] of kinds) {
      if (!judged) continue;
      const [pick, got] = await own(picks[kind]);
      const says = pick ? `${pick.total} of another stem than ${pick.st.join(" or ")}, withheld` : "";
      check(law, !!pick && !got.fault && !!got.data && Number(got.data.stemWithheld) === pick.total && got.line.includes(says) && !pillOf(got, pick),
        !pick ? JOINED(picks[kind]) : got.fault || `${where(pick)} · ${pick.total} rows of another stem (${pick.ofTheStore} of the store, ${pick.beside} beside it); the card says ${got.data ? got.data.stemWithheld : "nothing"} · "${got.line}" · «${String(pick.reading).slice(0, 40)}» (${pick.m}, ${pick.stems.join("+")}${pick.by ? `, by ${pick.by}` : ""}) ${pillOf(got, pick) ? "stands on a pill" : "is on no pill"} · ${got.said.length} pills`);
      if (pick) {
        const keep = await open(pick, "keep");
        check("    and under \"keep\" it withholds none for the stem, and the reading is back on a pill of its source", !keep.fault && !!keep.data && Number(keep.data.stemWithheld) === 0 && !/of another stem/u.test(keep.line) && !!pillOf(keep, pick),
          keep.fault || `stem ${keep.data ? keep.data.stemWithheld : "?"} · "${keep.line}" · «${String(pick.reading).slice(0, 40)}» ${pillOf(keep, pick) ? "stands on a pill" : "is on no pill"} · ${keep.said.length} pills`);
      }
    }
    {
      const [pick, got] = await own(picks.stands);
      check("B8  a row beside the store whose stems share a family with the word's stands: a reading only such a row of its source carries is on the card, credited to its source", !!pick && !got.fault && !!got.data && Number(got.data.stemWithheld) === pick.total && !!pillOf(got, pick),
        !pick ? JOINED(picks.stands) : got.fault || `${where(pick)} · «${String(pick.reading).slice(0, 40)}» (${pick.m}, ${pick.stems.join("+")}) ${pillOf(got, pick) ? "stands on a pill" : "is on no pill"} · the card withholds ${got.data ? got.data.stemWithheld : "?"} for the stem, this check counts ${pick.total} · ${got.said.length} pills`);
    }
  } finally { await browser.close().catch(() => {}); await tree.close(); }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
