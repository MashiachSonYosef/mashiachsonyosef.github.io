#!/usr/bin/env node
// GUARDS: ledger-division-rule-v2-a-ledgered-row-divides-prints-a-part-or-prints-no-pill-only-as-its-ledger-and-the-owner-say
// LEDGER: M R
// THE LEDGERS BECOME DATA, AND THE PAGE READS THE DATA.
//
// Until 6 November 2026 one rule divided every dictionary's route text into
// readings: the pack mark (";" outside brackets), then the comma rule
// (the sense-split rule, v3; retired 7 November 2026), with a sense whose brackets do not balance held
// back. It was a guess made once for all 36 dictionaries, and it was wrong
// in each of them somewhere: a sentence cut at its commas, a verse reference
// cut at its colon, a bracket half printed as a reading, a whole Strong's
// list hidden for one stray bracket.
//
// The corpus lane then declared, dictionary by dictionary, what every mark
// means (ask v1.1: 1,774 shapes over 35 ledgers, each with a classifier that
// names the shape of every mark of every route, and a checker that proves the
// counts). Where the meaning is a matter for the owner, the ledger carries a
// branch: a question, its options, and the one it rests on. This tool is how
// a ledger reaches the page:
//
//   1. For each ledgered source, every served row's route is classified by
//      the source's own classifier. A mark divides the route when its shape
//      divides: as the declaration says, or because the owner answered the
//      shape's branch "divides" (data/ledger-branch-answers-v1.json). At rest
//      no shape of any ledger divides, so at rest no row divides.
//   2. A row that divides takes a slot: row[7], the indices of the marks it
//      divides at. A row that does not divide takes none. The page reads the
//      slot and nothing else for a ledgered source: no slot, one reading, as
//      the source wrote it, brackets and all.
//   3. The index names the ledger each source is under (index.ledgers, and
//      m_sources[m].ledger), with the files' sha256, the branch answers, and
//      the counts.
//   4. (ledger-division-rule-v2, 6 November 2026) A branch whose options are
//      neither "divides" nor its resting one asks for one step of the page's
//      own: a tag this corpus's script wrote comes off, a name prints alone,
//      a bracket's two forms print as two, a row that renders nothing prints
//      no pill. tools/ledger-print-v1.mjs is that step, one entry per branch
//      written from the branch's own words and tested on the branch's own
//      examples before any store is written. A row such an answered branch
//      reaches takes a second slot: row[8], the texts it prints ([] for no
//      pill), each a run of the route's own characters in their own order.
//      A row with a print slot prints those texts and nothing else; a print
//      rule that keeps a part cannot combine with a cut on the same row, and
//      this tool refuses the store rather than guess.
//
// A store source with no ledger in data/ledgers-v1 is refused unless the
// manifest says why (none from 7 November 2026: Strong's 1890, the last,
// untabled by the owner). The dictionaries beside the store (the overlays) and
// the span store's own sources print whole until their ledgers land (the
// owner, 7 November 2026: the comma rule the page had guessed for them
// retired); index.ledgers.unledgered names each with its rows.
//
//   5. (6 November 2026, the code review) The span store's rows
//      (data/span-store/<book>.json) take the same slots the same way: a
//      span row of a ledgered source is a row like any, and until then it was
//      served whole where the generic rule had divided it.
//   6. (7 November 2026, the corpus lane's v153.1 and v155 to v160) The
//      dictionaries beside the store (data/overlays/<id>/: Jastrow, the
//      Samaritan sources) take the same slots, one further out (an overlay's
//      slot 7 is the lane's own: the Samaritan lane), row for row in their
//      own shards, and their index marks each ledgered source, as the
//      span store's index marks its own two: the page merges both indexes'
//      sources into the store's, so its readingsOfRow reads an overlay's slots
//      as it reads the store's. The bytes the lane delivered are pinned in its
//      MANIFEST-overlay-v1.json; every file this tool rewrites is pinned again
//      in LEDGERED-overlay-v1.json beside it, with the delivered pin it stands
//      on, so a check can hold each file to one of the two.
//
// Usage: node tools/apply-ledger-divisions-v1.mjs [--store data/route-store]
//          [--ledgers data/ledgers-v1] [--answers data/ledger-branch-answers-v1.json]
//          [--receipt data/ledger-divisions-receipt-v1.json] [--span-store data/span-store]
//          [--overlays data/overlays] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { PRINT_RULES, printOf, selfTest } from "./ledger-print-v1.mjs";
import { printUnder, kindOf, selfTestDeclaration, stepsOf } from "./ledger-print-from-declaration-v1.mjs";
// the print steps the declarations carry (ask v1.2): ruleKey -> the option, read beside the hand table
const DATA_RULES = new Map();

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
const LEDGERS = arg("ledgers", join(K3, "data", "ledgers-v1"));
const ANSWERS = arg("answers", join(K3, "data", "ledger-branch-answers-v1.json"));
const RECEIPT = arg("receipt", join(K3, "data", "ledger-divisions-receipt-v1.json"));
const DRY = process.argv.includes("--dry");
export const LEDGER_DIVISION_RULE_ID = "ledger-division-rule-v2-a-ledgered-row-divides-prints-a-part-or-prints-no-pill-only-as-its-ledger-and-the-owner-say";
const refuse = (msg) => { console.log(`REFUSED — ${msg}`); process.exit(1); };
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const n = (x) => Number(x).toLocaleString("en-US");

// ---- the ledgers, each file at the bytes its manifest pins ------------------------
const manifest = JSON.parse(readFileSync(join(LEDGERS, "manifest.json"), "utf8"));
if (manifest.rule_id !== LEDGER_DIVISION_RULE_ID) refuse(`the ledger manifest is under ${manifest.rule_id}, not this rule`);
const answersBytes = existsSync(ANSWERS) ? readFileSync(ANSWERS) : null;
const answers = answersBytes ? JSON.parse(answersBytes.toString("utf8")) : { answers: {} };
const ledgers = new Map();
for (const [key, L] of Object.entries(manifest.ledgers)) {
  const decPath = join(K3, L.declaration.file), clsPath = join(K3, L.classifier.file);
  for (const [p, want] of [[decPath, L.declaration.sha256], [clsPath, L.classifier.sha256]]) {
    if (!existsSync(p)) refuse(`${key}: ${p} is missing`);
    const got = sha256(readFileSync(p));
    if (got !== want) refuse(`${key}: ${p} is ${got.slice(0, 12)}…, the manifest pins ${want.slice(0, 12)}…`);
  }
  const decl = JSON.parse(readFileSync(decPath, "utf8"));
  if (decl.source_key !== key) refuse(`${key}: its declaration is for ${decl.source_key}`);
  const shapes = new Map((decl.shapes || []).map((s) => [s.id, { ...s }]));
  // the branches, each at its answer: resting unless the owner answered it
  const branches = {};
  for (const b of decl.branches || []) {
    const a = ((answers.answers || {})[key] || {})[b.id] || null;
    const option = a ? a.option : b.resting;
    if (!(b.options || []).some((o) => o.id === option)) refuse(`${key} ${b.id}: "${option}" is none of its options (${(b.options || []).map((o) => o.id).join(", ")})`);
    let printRule = null, printFrom = null;
    if (option !== b.resting && option !== "divides") {
      const opt = (b.options || []).find((o) => o.id === option);
      if (opt && stepsOf(opt).length) {
        // the declaration carries the step (ask v1.2): it is read from there, and the hand table is not consulted
        DATA_RULES.set(`${key}:${b.id}`, { option: opt, kind: kindOf(opt) });
        printFrom = "declaration";
      } else {
        const rule = PRINT_RULES[`${key}:${b.id}`];
        if (!rule) refuse(`${key} ${b.id}: answered "${option}"; the declaration carries no print step for it and ledger-print-v1 has no entry for this branch`);
        if (rule.option !== option) refuse(`${key} ${b.id}: answered "${option}", but ledger-print-v1's step for it serves "${rule.option}"`);
        printFrom = "hand table";
      }
      printRule = `${key}:${b.id}`;
    }
    for (const id of b.shapes || []) if (!shapes.has(id)) refuse(`${key} ${b.id}: names shape ${id}, which the declaration lacks`);
    if (option === "divides") for (const id of b.shapes || []) shapes.get(id).divides = true;
    if (printRule) for (const id of b.shapes || []) { const sh = shapes.get(id); if (sh.divides) refuse(`${key} ${b.id}: shape ${id} both divides and prints`); sh.prints = printRule; }
    branches[b.id] = { option, resting: b.resting, by: a ? a.by || null : "resting", on: a ? a.on || null : null, shapes: b.shapes || [], occurrences: b.occurrences ?? null, prints: printRule, ...(printFrom ? { print_step_from: printFrom } : {}) };
  }
  const { classify } = await import(pathToFileURL(resolve(clsPath)).href);
  if (typeof classify !== "function") refuse(`${key}: its classifier exports no classify(text)`);
  ledgers.set(key, { key, relay: L.relay, decl, shapes, branches, classify, declaration_sha256: L.declaration.sha256, classifier_sha256: L.classifier.sha256 });
}

// the print step's own examples, through these ledgers' own classifiers, before any row is touched
{
  const t = selfTest(new Map([...ledgers].map(([k, L]) => [k, L.classify])), new Map([...ledgers].map(([k, L]) => [k, L.decl])));
  if (t.failed.length) refuse(`ledger-print-v1 fails ${t.failed.length} of its own examples: ${t.failed.slice(0, 3).join(" · ")}`);
  console.log(`ledger-print-v1: ${t.ran} examples hold under the ledgers' classifiers${t.skipped.length ? ` (${t.skipped.length} skipped: no ledger)` : ""}`);
  // and the declarations' own examples, under their print steps (ask v1.2)
  let ran = 0; const failed = [];
  for (const [, L] of ledgers) { const r = selfTestDeclaration(L.decl, L.classify); ran += r.ran; failed.push(...r.failed); }
  if (failed.length) refuse(`the declarations' print steps fail ${failed.length} of their own examples: ${failed.slice(0, 3).join(" · ")}`);
  console.log(`ledger-print-from-declaration-v1: ${ran} examples hold under the ledgers' classifiers · ${DATA_RULES.size} branch${DATA_RULES.size === 1 ? "" : "es"} print by the declaration's own step`);
}

// ---- the store ------------------------------------------------------------------
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
const shards = new Map(shardNames.map((f) => [f, JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"))]));
const keyOfM = (m) => (index.m_sources[m] || {}).key || null;
const ledgerOfM = (m) => { const k = keyOfM(m); return k && ledgers.has(k) ? ledgers.get(k) : null; };
// a source with no ledger: tolerated only where the manifest says why, or where it serves no row
const unledgeredRows = {};


// ---- what a ledger says of one text ---------------------------------------------------
// the marks it divides at, the texts it prints (null where no answered branch
// reaches it), or that the text is UNCOVERED (the classifier throws, or names a
// shape the declaration lacks): then nothing of it is counted, it stands whole,
// and the receipt names it. A print step that cannot be applied is a CONFLICT
// this tool refuses on, never a guess: two steps on one row where neither is
// "no pill", a step that cannot combine with the row's cut, or a step whose
// branch marks the row and that does not reach it (the review of 6 November:
// such a row printed as if its branch were unanswered, uncounted).
const slotsOf = (L, text) => {
  let marks;
  try { marks = L.classify(text); } catch (e) { return { uncovered: String(e.message || e).slice(0, 160) }; }
  if (!Array.isArray(marks)) return { uncovered: "the classifier gave no marks" };
  const unknown = marks.find((g) => !L.shapes.get(g.shape));
  if (unknown) return { uncovered: `shape ${unknown.shape} is not in the declaration` };
  const dividing = marks.filter((g) => L.shapes.get(g.shape).divides);
  const cuts = [...new Set(dividing.map((g) => g.i))].sort((a, b) => a - b);
  const byShape = {}; for (const g of dividing) byShape[g.shape] = (byShape[g.shape] || 0) + 1;
  const printRules = new Set(marks.map((g) => L.shapes.get(g.shape).prints).filter(Boolean));
  let prints = null, ruleKey = null, conflict = null;
  if (printRules.size) {
    // a row that renders nothing has no pill whatever else its marks say (so each branch's own words)
    const kindOfRule = (r) => (DATA_RULES.has(r) ? DATA_RULES.get(r).kind : PRINT_RULES[r].kind);
    const none = [...printRules].find((r) => kindOfRule(r) === "none");
    if (printRules.size > 1 && !none) conflict = `two print steps on one row (${[...printRules].join(", ")})`;
    else {
      ruleKey = none || [...printRules][0];
      const branchMarks = marks.filter((g) => L.shapes.get(g.shape).prints === ruleKey);
      try { const r = DATA_RULES.has(ruleKey) ? printUnder(DATA_RULES.get(ruleKey).option, text, branchMarks, cuts) : printOf(ruleKey, text, branchMarks, cuts); if (r) prints = r.texts; else conflict = `the print step ${ruleKey} does not reach a row its branch's shapes mark`; }
      catch (e) { conflict = e.message; }
    }
  }
  return { marks: marks.length, marksDividing: dividing.length, byShape, cuts, prints, ruleKey, conflict };
};
const newCounts = () => ({ rows: 0, rows_dividing: 0, rows_printing_a_part: 0, rows_no_pill: 0, marks: 0, marks_dividing: 0, by_shape: {}, by_print_rule: {}, uncovered: 0 });
const count = (c, r) => {
  c.marks += r.marks; c.marks_dividing += r.marksDividing;
  for (const [sh, n] of Object.entries(r.byShape)) c.by_shape[sh] = (c.by_shape[sh] || 0) + n;
  if (r.prints) { c.by_print_rule[r.ruleKey] = (c.by_print_rule[r.ruleKey] || 0) + 1; if (r.prints.length) c.rows_printing_a_part += 1; else c.rows_no_pill += 1; }
  if (r.cuts.length) c.rows_dividing += 1;
};
// the row's slots: row[7] present only where the row divides, row[8] only where it prints a part or no pill
const setSlots = (row, cuts, prints) => {
  const had = Array.isArray(row[7]) ? row[7] : null, hadPrint = Array.isArray(row[8]) ? row[8] : null;
  const now = cuts.length ? cuts : null;
  if (JSON.stringify(had) === JSON.stringify(now) && JSON.stringify(hadPrint) === JSON.stringify(prints)) return false;
  if (!DRY) {
    while (row.length < 7) row.push(null);
    row[7] = now; row[8] = prints;
    if (!prints) { row.length = 8; if (!now) row.length = 7; }
  }
  return true;
};

// ---- every served row of every ledgered source ------------------------------------
const per = {};   // source key -> counts
const uncovered = [];
const conflicts = [];
const touched = new Set();
let rowsSeen = 0, rowsDividing = 0, rowsChanged = 0, rowsPrinting = 0, rowsNoPill = 0;
for (const [shardName, body] of shards) {
  for (const [k, rows] of Object.entries(body)) {
    for (const row of rows) {
      const L = ledgerOfM(String(row[3]));
      if (!L) { const kk = keyOfM(String(row[3])); unledgeredRows[kk] = (unledgeredRows[kk] || 0) + 1; continue; }
      rowsSeen += 1;
      const c = (per[L.key] ||= newCounts());
      c.rows += 1;
      const text = String(row[1]);
      const r = slotsOf(L, text);
      let cuts = [], prints = null;
      if (r.uncovered) { c.uncovered += 1; if (uncovered.length < 400) uncovered.push({ source: L.key, key: k, m: String(row[3]), rank: row[0], route: text, error: r.uncovered }); }
      else {
        if (r.conflict) conflicts.push(`${L.key} ${k}#${row[0]}: ${r.conflict} «${text.slice(0, 60)}»`);
        else { count(c, r); cuts = r.cuts; prints = r.prints; }
      }
      if (setSlots(row, cuts, prints)) { rowsChanged += 1; touched.add(shardName); }
      if (cuts.length) rowsDividing += 1;
      if (prints) { if (prints.length) rowsPrinting += 1; else rowsNoPill += 1; }
    }
  }
}

// ---- the span store's rows (data/span-store/<book>.json), the same way --------------
// (6 November 2026, the code review of that day: a span row of a ledgered
// source was served whole, its slots never written, where the generic rule
// had divided it the day before — 308 rows). A span row is a row like any:
// seven slots the lane shipped byte for byte, and beyond them the page's own
// division slots where the row's source is under a ledger. A span-only
// source (the span store's own m_sources) is under a ledger by its key, as a
// store source is; a row of a source under no ledger carries no slot.
const SPAN = arg("span-store", join(K3, "data", "span-store"));
const spanCounts = { books: 0, rows: 0, rows_of_ledgered_sources: 0, rows_dividing: 0, rows_printing_a_part: 0, rows_no_pill: 0, rows_whose_slot_moved: 0, uncovered: 0, by_source: {} };
const spanUncovered = [];
const spanRowsByUnledgeredId = {};
if (existsSync(join(SPAN, "index.json"))) {
  const spanIndex = JSON.parse(readFileSync(join(SPAN, "index.json"), "utf8"));
  const keyOfSpanM = (m) => keyOfM(m) || ((spanIndex.m_sources || {})[m] || {}).key || null;
  const spanFiles = readdirSync(SPAN).filter((x) => /^[a-z0-9-]+\.json$/u.test(x) && x !== "index.json").sort();
  for (const f of spanFiles) {
    const path = join(SPAN, f);
    const file = JSON.parse(readFileSync(path, "utf8"));
    if (!file.keys || typeof file.keys !== "object") continue;
    spanCounts.books += 1;
    let moved = 0;
    for (const [k, rows] of Object.entries(file.keys)) for (const r of rows) {
      const row = r.slots; if (!Array.isArray(row)) continue;
      spanCounts.rows += 1;
      const key = keyOfSpanM(String(row[3]));
      const L = key && ledgers.has(key) ? ledgers.get(key) : null;
      if (!L) { spanRowsByUnledgeredId[String(row[3])] = (spanRowsByUnledgeredId[String(row[3])] || 0) + 1; if (setSlots(row, [], null)) moved += 1; continue; }
      spanCounts.rows_of_ledgered_sources += 1;
      const bs = (spanCounts.by_source[key] ||= { rows: 0, rows_dividing: 0, rows_printing_a_part: 0, rows_no_pill: 0, uncovered: 0 });
      bs.rows += 1;
      const text = String(row[1]);
      const res = slotsOf(L, text);
      let cuts = [], prints = null;
      if (res.uncovered) { bs.uncovered += 1; spanCounts.uncovered += 1; if (spanUncovered.length < 200) spanUncovered.push({ source: key, book: file.book || f, key: k, m: String(row[3]), row_id: r.row_id || null, route: text, error: res.uncovered }); }
      else if (res.conflict) conflicts.push(`${key} span ${file.book || f} ${k} (${r.row_id || "?"}): ${res.conflict} «${text.slice(0, 60)}»`);
      else { cuts = res.cuts; prints = res.prints; }
      if (setSlots(row, cuts, prints)) moved += 1;
      if (cuts.length) { bs.rows_dividing += 1; spanCounts.rows_dividing += 1; }
      if (prints) { if (prints.length) { bs.rows_printing_a_part += 1; spanCounts.rows_printing_a_part += 1; } else { bs.rows_no_pill += 1; spanCounts.rows_no_pill += 1; } }
    }
    spanCounts.rows_whose_slot_moved += moved;
    if (moved && !DRY) writeFileSync(path, JSON.stringify(file));   // the bake's own byte shape: one line, no indent
  }
  if (!DRY && !conflicts.length) {
    // the span store's own sources under a ledger are marked as the store's are,
    // so the page, which merges this index's sources into the store's, reads
    // their rows' slots (until 7 November 2026 neither had a ledger)
    for (const m of Object.keys(spanIndex.m_sources || {})) { const k = ((spanIndex.m_sources || {})[m] || {}).key; if (!keyOfM(m) && k && ledgers.has(k)) spanIndex.m_sources[m].ledger = k; else delete spanIndex.m_sources[m].ledger; }
    spanIndex.ledgers = { rule_id: LEDGER_DIVISION_RULE_ID, applied_on: new Date().toISOString(), applied_by: "tools/apply-ledger-divisions-v1.mjs",
      what: "a span row of a source under a ledger carries the page's division slots beyond the lane's seven, as a store row does: row[7] the marks it divides at, row[8] the texts it prints ([] for no pill); a row of a source under no ledger carries none; the first seven slots are the lane's, byte for byte",
      counts: { books: spanCounts.books, rows: spanCounts.rows, rows_of_ledgered_sources: spanCounts.rows_of_ledgered_sources, rows_dividing: spanCounts.rows_dividing, rows_printing_a_part: spanCounts.rows_printing_a_part, rows_no_pill: spanCounts.rows_no_pill, uncovered: spanCounts.uncovered } };
    writeFileSync(join(SPAN, "index.json"), JSON.stringify(spanIndex, null, 1));
  }
}
// ---- the dictionaries beside the store (data/overlays/<id>/), the same way ------------
// (7 November 2026: Jastrow's and four of the Samaritan sources' ledgers, the
// corpus lane's v153.1 and v155 to v158). An overlay row is a row like the
// store's (overlay-rule-v2): the lane's seven slots byte for byte, and beyond
// them the page's division slots where the row's source is under a ledger.
const OVERLAYS_DIR = arg("overlays", join(K3, "data", "overlays"));
// AN OVERLAY ROW'S SLOT 7 IS THE LANE'S OWN (the Samaritan rows carry their
// lane there, which the page filters on; Jastrow's rows stop at seven), so the
// page's division slots stand one further out in an overlay's shard: row[8]
// the marks it divides at, row[9] the texts it prints. The page, the search
// bake and its check read them into 7 and 8 of the row they serve, so
// readingsOfRow reads every row alike (overlay-slots: the same convention in
// zone.html overlayRowsFor, tools/bake-search-index-v1.mjs, check-search-v1).
const setOverlaySlots = (row, cuts, prints) => {
  const had = Array.isArray(row[8]) ? row[8] : null, hadPrint = Array.isArray(row[9]) ? row[9] : null;
  const now = cuts.length ? cuts : null;
  if (JSON.stringify(had) === JSON.stringify(now) && JSON.stringify(hadPrint) === JSON.stringify(prints)) return false;
  if (!DRY) {
    while (row.length < 8) row.push(null);   // the lane's slot 7 stays as it is, null where the lane wrote none
    row[8] = now; row[9] = prints;
    if (!prints) { row.length = 9; if (!now) row.length = row[7] === null || row[7] === undefined ? 7 : 8; }
  }
  return true;
};
const overlayCounts = {};
const overlayUncovered = [];
const overlayWrites = [];   // [dir, ix, bodies, moved]
if (existsSync(OVERLAYS_DIR)) for (const d of readdirSync(OVERLAYS_DIR).sort()) {
  const dir = join(OVERLAYS_DIR, d), ixPath = join(dir, "index.json");
  if (!existsSync(ixPath) || !existsSync(join(dir, "shards"))) continue;
  const ix = JSON.parse(readFileSync(ixPath, "utf8"));
  const keyOfOvM = (m) => ((ix.m_sources || {})[m] || {}).key || null;
  const c = (overlayCounts[d] = { rows: 0, rows_of_ledgered_sources: 0, rows_dividing: 0, rows_printing_a_part: 0, rows_no_pill: 0, rows_whose_slot_moved: 0, uncovered: 0, by_source: {} });
  const bodies = new Map(), moved = new Set();
  for (const f of readdirSync(join(dir, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
    const body = JSON.parse(gunzipSync(readFileSync(join(dir, "shards", f))).toString("utf8"));
    bodies.set(f, body);
    for (const [k, rows] of Object.entries(body)) for (const row of rows) {
      if (!Array.isArray(row)) continue;
      c.rows += 1;
      const key = keyOfOvM(String(row[3]));
      const L = key && ledgers.has(key) ? ledgers.get(key) : null;
      if (!L) { if (setOverlaySlots(row, [], null)) { moved.add(f); c.rows_whose_slot_moved += 1; } continue; }
      c.rows_of_ledgered_sources += 1;
      const bs = (c.by_source[key] ||= { rows: 0, rows_dividing: 0, rows_printing_a_part: 0, rows_no_pill: 0, uncovered: 0 });
      bs.rows += 1;
      const text = String(row[1]);
      const res = slotsOf(L, text);
      let cuts = [], prints = null;
      if (res.uncovered) { bs.uncovered += 1; c.uncovered += 1; if (overlayUncovered.length < 200) overlayUncovered.push({ overlay: d, source: key, key: k, m: String(row[3]), route: text, error: res.uncovered }); }
      else if (res.conflict) conflicts.push(`${key} overlay ${d} ${k}: ${res.conflict} «${text.slice(0, 60)}»`);
      else { cuts = res.cuts; prints = res.prints; }
      if (setOverlaySlots(row, cuts, prints)) { moved.add(f); c.rows_whose_slot_moved += 1; }
      if (cuts.length) { bs.rows_dividing += 1; c.rows_dividing += 1; }
      if (prints) { if (prints.length) { bs.rows_printing_a_part += 1; c.rows_printing_a_part += 1; } else { bs.rows_no_pill += 1; c.rows_no_pill += 1; } }
    }
  }
  overlayWrites.push([dir, ix, ixPath, bodies, moved, keyOfOvM, d]);
}
for (const [k, c] of Object.entries(unledgeredRows)) if (!(manifest.excluded || {})[k]) refuse(`${k} serves ${c} rows, has no ledger, and the manifest does not say why`);
if (conflicts.length) refuse(`${conflicts.length} rows where a print step cannot be applied: ${conflicts.slice(0, 4).join(" · ")}`);
const sources = {};
for (const [key, L] of ledgers) {
  const c = per[key] || { rows: 0, rows_dividing: 0, rows_printing_a_part: 0, rows_no_pill: 0, marks: 0, marks_dividing: 0, by_shape: {}, by_print_rule: {}, uncovered: 0 };
  sources[key] = { relay: L.relay, declaration_sha256: L.declaration_sha256, classifier_sha256: L.classifier_sha256, m_ids: Object.keys(index.m_sources).filter((m) => keyOfM(m) === key).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))), shapes: L.shapes.size, shapes_dividing: [...L.shapes.values()].filter((s) => s.divides).map((s) => s.id), branches: L.branches, ...c };
}
const totals = { ledgered_sources: ledgers.size, rows: rowsSeen, rows_dividing: rowsDividing, rows_printing_a_part: rowsPrinting, rows_no_pill: rowsNoPill, rows_whose_slot_moved: rowsChanged, uncovered: uncovered.length ? Object.values(per).reduce((a, c) => a + c.uncovered, 0) : 0 };
console.log(`ledger divisions · ${ledgers.size} ledgers · ${n(rowsSeen)} rows of ledgered sources · ${n(rowsDividing)} divide · ${n(rowsPrinting)} print a part · ${n(rowsNoPill)} print no pill · ${n(rowsChanged)} slots move · uncovered ${n(totals.uncovered)}`);
console.log(`  span store · ${spanCounts.books} books · ${n(spanCounts.rows)} rows, ${n(spanCounts.rows_of_ledgered_sources)} of ledgered sources · ${n(spanCounts.rows_dividing)} divide · ${n(spanCounts.rows_printing_a_part)} print a part · ${n(spanCounts.rows_no_pill)} print no pill · ${n(spanCounts.rows_whose_slot_moved)} slots move · uncovered ${n(spanCounts.uncovered)}`);
for (const u of spanUncovered.slice(0, 6)) console.log(`  span uncovered: ${u.source} ${u.book} ${u.key} ${u.m} «${u.route.slice(0, 70)}» — ${u.error}`);
for (const [d, c] of Object.entries(overlayCounts)) console.log(`  overlay ${d} · ${n(c.rows)} rows, ${n(c.rows_of_ledgered_sources)} of ledgered sources · ${n(c.rows_dividing)} divide · ${n(c.rows_printing_a_part)} print a part · ${n(c.rows_no_pill)} print no pill · ${n(c.rows_whose_slot_moved)} slots move · uncovered ${n(c.uncovered)}`);
for (const u of overlayUncovered.slice(0, 8)) console.log(`  overlay uncovered: ${u.overlay} ${u.source} ${u.key} ${u.m} «${u.route.slice(0, 70)}» — ${u.error}`);
for (const [key, s] of Object.entries(sources)) if (s.rows) console.log(`  ${key.padEnd(66)} rows ${String(s.rows).padStart(7)} · divide ${String(s.rows_dividing).padStart(6)} · print ${String(s.rows_printing_a_part).padStart(5)} · no pill ${String(s.rows_no_pill).padStart(4)} · uncovered ${s.uncovered}`);
for (const u of uncovered.slice(0, 12)) console.log(`  uncovered: ${u.source} ${u.key}#${u.rank} ${u.m} «${u.route.slice(0, 70)}» — ${u.error}`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }

// the sources with no ledger, printing whole until theirs land, named with their
// rows: the dictionaries beside the store (data/overlays/*/index.json) and the
// span store's own sources (data/span-store/index.json)
const unledgered = () => {
  const out = {};
  const OV = join(K3, "data", "overlays");
  if (existsSync(OV)) for (const d of readdirSync(OV)) {
    const p = join(OV, d, "index.json"); if (!existsSync(p)) continue;
    const ix = JSON.parse(readFileSync(p, "utf8"));
    let byId = (ix.counts || {}).store_rows_by_m_id || null;
    if (!byId && existsSync(join(OV, d, "shards"))) {   // an overlay whose index does not count its rows by id: counted from its shards
      byId = {};
      for (const f of readdirSync(join(OV, d, "shards")).filter((x) => x.endsWith(".bin"))) { const body = JSON.parse(gunzipSync(readFileSync(join(OV, d, "shards", f))).toString("utf8")); for (const rows of Object.values(body)) for (const r of rows) byId[String(r[3])] = (byId[String(r[3])] || 0) + 1; }
    }
    for (const [id, m] of Object.entries(ix.m_sources || {})) if (!ledgers.has(m.key)) out[id] = { key: m.key, where: `overlay ${d}`, rows: (byId || {})[id] ?? null };
  }
  if (existsSync(join(SPAN, "index.json"))) {
    const six = JSON.parse(readFileSync(join(SPAN, "index.json"), "utf8"));
    for (const [id, m] of Object.entries(six.m_sources || {})) if (!keyOfM(id) && !ledgers.has(m.key)) out[id] = { key: m.key, where: "the span store's own source", rows: spanRowsByUnledgeredId[id] || 0 };
  }
  return out;
};

// ---- write: the shards that moved, the index, the receipt ---------------------------
for (const name of touched) writeFileSync(join(STORE, "shards", name), gzipSync(Buffer.from(JSON.stringify(shards.get(name))), { level: 9 }));
const digest = createHash("sha256"); let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12), on = new Date().toISOString();
for (const m of Object.keys(index.m_sources)) { const k = keyOfM(m); if (ledgers.has(k)) index.m_sources[m].ledger = k; else delete index.m_sources[m].ledger; }
index.ledgers = {
  rule_id: LEDGER_DIVISION_RULE_ID, applied_on: on, manifest: "reader/data/ledgers-v1/manifest.json", ask: manifest.ask, checker: manifest.checker,
  answers: answersBytes ? { file: "reader/data/ledger-branch-answers-v1.json", sha256: sha256(answersBytes) } : null,
  excluded: Object.fromEntries(Object.entries(manifest.excluded || {}).map(([k, why]) => [k, { why, rows: unledgeredRows[k] || 0 }])),
  untabled: manifest.untabled || {},
  unledgered: unledgered(),
  what: "every source under a ledger divides its route text only where the ledger's shapes divide under the owner's answers, at the marks row[7] names, and prints a part of itself or no pill only where a branch the owner answered says so, the texts row[8] names (ledger-print-v1); a row with neither slot is one reading as the source wrote it; a source with no ledger is one reading as written, whole (7 November 2026: the comma rule the page had guessed retired), and those are only the dictionaries beside the store and the span store's own sources, named in unledgered, until their ledgers land",
  print_step: `the declaration's own step (tools/ledger-print-from-declaration-v1.mjs, ask v1.2) for ${DATA_RULES.size} branch${DATA_RULES.size === 1 ? "" : "es"}; tools/ledger-print-v1.mjs, the hand table, for the rest`,
  span_store: { file: "reader/data/span-store/<book>.json", ...Object.fromEntries(Object.entries(spanCounts).filter(([k]) => k !== "by_source")) },
  sources: Object.fromEntries(Object.entries(sources).map(([k, s]) => [k, { relay: s.relay, declaration_sha256: s.declaration_sha256, classifier_sha256: s.classifier_sha256, m_ids: s.m_ids, shapes: s.shapes, shapes_dividing: s.shapes_dividing, branches: Object.fromEntries(Object.entries(s.branches).map(([id, b]) => [id, { option: b.option, resting: b.resting, by: b.by, on: b.on, ...(b.prints ? { prints: b.prints, print_step_from: b.print_step_from } : {}) }])), rows: s.rows, rows_dividing: s.rows_dividing, rows_printing_a_part: s.rows_printing_a_part, rows_no_pill: s.rows_no_pill, uncovered: s.uncovered }])),
  totals,
};
index.ledgers.overlays = Object.fromEntries(Object.entries(overlayCounts).map(([d, c]) => [d, { file: `reader/data/overlays/${d}/shards/<shard>.bin`, ...Object.fromEntries(Object.entries(c).filter(([k]) => k !== "by_source")), by_source: c.by_source }]));
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
// the overlays: the shards whose slots moved, each index's ledger marks and its
// ledgers block, and the pin of every file as it now stands beside the
// lane's delivered pin (LEDGERED-overlay-v1.json)
for (const [dir, ix, ixPath, bodies, moved, keyOfOvM, d] of overlayWrites) {
  for (const f of moved) writeFileSync(join(dir, "shards", f), gzipSync(Buffer.from(JSON.stringify(bodies.get(f))), { level: 9 }));
  for (const m of Object.keys(ix.m_sources || {})) { const k = keyOfOvM(m); if (k && ledgers.has(k)) ix.m_sources[m].ledger = k; else delete ix.m_sources[m].ledger; }
  const c = overlayCounts[d];
  // the overlay's version follows its shards, as the store's does: the page
  // asks a shard under ?v=<store_version>, so a version that stood still while
  // the slots moved would leave a reader's cached shards printing whole
  const ovDigest = createHash("sha256");
  for (const f of readdirSync(join(dir, "shards")).filter((x) => x.endsWith(".bin")).sort()) ovDigest.update(readFileSync(join(dir, "shards", f)));
  const ovWas = ix.store_version || null, ovNow = ovDigest.digest("hex").slice(0, 12);
  if (ovNow !== ovWas) {
    if (!ix.store_version_delivered) ix.store_version_delivered = ovWas;
    ix.store_version = ovNow;
    ix.store_version_history = [...(ix.store_version_history || []), { was: ovWas, now: ovNow, why: LEDGER_DIVISION_RULE_ID, on }];
  }
  ix.ledgers = { rule_id: LEDGER_DIVISION_RULE_ID, applied_on: on, applied_by: "tools/apply-ledger-divisions-v1.mjs",
    what: "an overlay row of a source under a ledger carries the page's division slots beyond the lane's own: row[8] the marks it divides at, row[9] the texts it prints ([] for no pill), which the page reads into slots 7 and 8 of the row it serves; slot 7 stays the lane's (the Samaritan lane, null where the lane wrote none); a row of a source under no ledger carries none; the lane's slots are byte for byte",
    counts: Object.fromEntries(Object.entries(c).filter(([k]) => k !== "by_source")), by_source: c.by_source };
  writeFileSync(ixPath, JSON.stringify(ix, null, 1));
  const delivered = existsSync(join(dir, "MANIFEST-overlay-v1.json")) ? JSON.parse(readFileSync(join(dir, "MANIFEST-overlay-v1.json"), "utf8")) : null;
  const files = (delivered && Array.isArray(delivered.files) ? delivered.files : []).map((f) => {
    const b = existsSync(join(dir, f.path)) ? readFileSync(join(dir, f.path)) : null;
    const sha = b ? sha256(b) : null;
    return sha === f.sha256 && b.length === f.bytes ? null : { path: f.path, delivered: { sha256: f.sha256, bytes: f.bytes }, now: b ? { sha256: sha, bytes: b.length } : null };
  }).filter(Boolean);
  writeFileSync(join(dir, "LEDGERED-overlay-v1.json"), JSON.stringify({ schema_version: "LEDGERED_OVERLAY_V1", rule_id: LEDGER_DIVISION_RULE_ID, applied_on: on, applied_by: "tools/apply-ledger-divisions-v1.mjs",
    what: "the files this tool rewrote in the lane's delivered overlay, each with the delivered pin it stands on (MANIFEST-overlay-v1.json) and its pin now; every other file is the delivery's, byte for byte",
    delivered_manifest: delivered ? { file: "MANIFEST-overlay-v1.json", store_version: delivered.store_version || null, files: (delivered.files || []).length } : null,
    files }, null, 1) + "\n");
  console.log(`  overlay ${d}: ${moved.size} shard${moved.size === 1 ? "" : "s"} rewritten · ${files.length} file${files.length === 1 ? "" : "s"} now pinned apart from the delivery`);
}
if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: LEDGER_DIVISION_RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "LEDGER_DIVISIONS_RECEIPT_V3", rule_id: LEDGER_DIVISION_RULE_ID, print_step: `the declaration's own step (tools/ledger-print-from-declaration-v1.mjs, ask v1.2) for ${DATA_RULES.size} branch${DATA_RULES.size === 1 ? "" : "es"} (${[...DATA_RULES.keys()].join(", ")}); tools/ledger-print-v1.mjs, the hand table, for the rest`, ran_at: on, store_version: { was, now }, totals, sources, uncovered_rows: uncovered, span_store: { ...spanCounts, uncovered_rows: spanUncovered }, overlays: { ...overlayCounts, uncovered_rows: overlayUncovered } }, null, 1));
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · index.ledgers names ${ledgers.size} ledgers · receipt ${RECEIPT}`);
