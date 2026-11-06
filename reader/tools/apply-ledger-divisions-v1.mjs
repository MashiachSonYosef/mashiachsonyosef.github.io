#!/usr/bin/env node
// GUARDS: ledger-division-rule-v2-a-ledgered-row-divides-prints-a-part-or-prints-no-pill-only-as-its-ledger-and-the-owner-say
// LEDGER: M R
// THE LEDGERS BECOME DATA, AND THE PAGE READS THE DATA.
//
// Until 6 November 2026 one rule divided every dictionary's route text into
// readings: the pack mark (";" outside brackets), then the comma rule
// (sense-split-rule-v3), with a sense whose brackets do not balance held
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
//      the counts; the receipt beside it says, source by source, how the
//      ledger's division differs from the generic rule's (the byte match: the
//      rows the generic rule divided that the ledger keeps whole, the rows it
//      hid that the ledger prints, and the rows the ledger divides that it
//      did not).
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
// A source with no ledger in data/ledgers-v1 keeps the generic rule, and the
// manifest says which and why (Strong's 1890, whose ledger the owner tabled).
//
// Usage: node tools/apply-ledger-divisions-v1.mjs [--store data/route-store]
//          [--ledgers data/ledgers-v1] [--answers data/ledger-branch-answers-v1.json]
//          [--receipt data/ledger-divisions-receipt-v1.json] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { senseSplit as readingSplit } from "./sense-split-v1.mjs";
import { PRINT_RULES, printOf, selfTest } from "./ledger-print-v1.mjs";

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
    let printRule = null;
    if (option !== b.resting && option !== "divides") {
      const rule = PRINT_RULES[`${key}:${b.id}`];
      if (!rule) refuse(`${key} ${b.id}: answered "${option}"; ledger-print-v1 has no step for this branch`);
      if (rule.option !== option) refuse(`${key} ${b.id}: answered "${option}", but ledger-print-v1's step for it serves "${rule.option}"`);
      printRule = `${key}:${b.id}`;
    }
    for (const id of b.shapes || []) if (!shapes.has(id)) refuse(`${key} ${b.id}: names shape ${id}, which the declaration lacks`);
    if (option === "divides") for (const id of b.shapes || []) shapes.get(id).divides = true;
    if (printRule) for (const id of b.shapes || []) { const sh = shapes.get(id); if (sh.divides) refuse(`${key} ${b.id}: shape ${id} both divides and prints`); sh.prints = printRule; }
    branches[b.id] = { option, resting: b.resting, by: a ? a.by || null : "resting", on: a ? a.on || null : null, shapes: b.shapes || [], occurrences: b.occurrences ?? null, prints: printRule };
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
}

// ---- the store ------------------------------------------------------------------
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
const shards = new Map(shardNames.map((f) => [f, JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"))]));
const keyOfM = (m) => (index.m_sources[m] || {}).key || null;
const ledgerOfM = (m) => { const k = keyOfM(m); return k && ledgers.has(k) ? ledgers.get(k) : null; };
// a source with no ledger: tolerated only where the manifest says why, or where it serves no row
const unledgeredRows = {};

// the generic rule, for the receipt's comparison only
const packSplit = (text) => {
  const t = String(text || ""); const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) { const c = t[i]; if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; } else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; } }
  out.push(t.slice(start));
  if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
};
const genericReadings = (text) => { const out = []; let hidden = 0; for (const s of packSplit(text)) { const r = readingSplit(s); if (r.damaged) { hidden += 1; continue; } out.push(...r.readings); } return { readings: out, hidden }; };
const piecesAt = (text, cuts) => { const p = []; let from = 0; for (const i of cuts) { p.push(text.slice(from, i)); from = i + 1; } p.push(text.slice(from)); return p.map((x) => x.trim()).filter(Boolean); };

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
      const c = (per[L.key] ||= { rows: 0, rows_dividing: 0, rows_printing_a_part: 0, rows_no_pill: 0, marks: 0, marks_dividing: 0, by_shape: {}, by_print_rule: {}, uncovered: 0, vs_generic: { same: 0, generic_divided_ledger_whole: 0, generic_hid_ledger_prints: 0, ledger_divides_generic_did_not: 0, both_divide_differently: 0 } });
      c.rows += 1;
      const text = String(row[1]);
      let marks = null;
      try { marks = L.classify(text); } catch (e) { c.uncovered += 1; if (uncovered.length < 400) uncovered.push({ source: L.key, key: k, m: String(row[3]), rank: row[0], route: text, error: String(e.message || e).slice(0, 160) }); }
      let cuts = [];
      const printRules = new Set();
      if (Array.isArray(marks)) {
        for (const g of marks) {
          const s = L.shapes.get(g.shape);
          if (!s) { c.uncovered += 1; if (uncovered.length < 400) uncovered.push({ source: L.key, key: k, m: String(row[3]), rank: row[0], route: text, error: `shape ${g.shape} is not in the declaration` }); cuts = []; printRules.clear(); marks = null; break; }
          c.marks += 1;
          if (s.divides) { cuts.push(g.i); c.marks_dividing += 1; c.by_shape[g.shape] = (c.by_shape[g.shape] || 0) + 1; }
          if (s.prints) printRules.add(s.prints);
        }
      }
      cuts = [...new Set(cuts)].sort((a, b) => a - b);
      // the print slot: the texts the row prints under its answered branch; two
      // branches on one row refuse unless both take marks out, in which case
      // the second works on what the first kept — a case this store has none of
      let prints = null;
      if (printRules.size) {
        // a row that renders nothing has no pill whatever else its marks say (so each branch's own words); two other
        // steps on one row are a conflict this tool refuses rather than guess at
        const none = [...printRules].find((r) => PRINT_RULES[r].kind === "none");
        if (printRules.size > 1 && !none) { conflicts.push(`${L.key} ${k}#${row[0]}: two print steps on one row (${[...printRules].join(", ")}) «${text.slice(0, 60)}»`); }
        else {
          const ruleKey = none || [...printRules][0];
          const branchMarks = marks.filter((g) => L.shapes.get(g.shape).prints === ruleKey);
          try { const r = printOf(ruleKey, text, branchMarks, cuts); if (r) prints = r.texts; }
          catch (e) { conflicts.push(`${L.key} ${k}#${row[0]}: ${e.message}`); }
          if (prints) { c.by_print_rule[ruleKey] = (c.by_print_rule[ruleKey] || 0) + 1; if (prints.length) { rowsPrinting += 1; c.rows_printing_a_part += 1; } else { rowsNoPill += 1; c.rows_no_pill += 1; } }
        }
      }
      // the row's slots: row[7] present only where the row divides, row[8] only where it prints a part or no pill
      const had = Array.isArray(row[7]) ? row[7] : null, hadPrint = Array.isArray(row[8]) ? row[8] : null;
      const now = cuts.length ? cuts : null;
      if (JSON.stringify(had) !== JSON.stringify(now) || JSON.stringify(hadPrint) !== JSON.stringify(prints)) {
        rowsChanged += 1; touched.add(shardName);
        if (!DRY) {
          while (row.length < 7) row.push(null);
          row[7] = now; row[8] = prints;
          if (!prints) { row.length = 8; if (!now) row.length = 7; }
        }
      }
      if (now) { rowsDividing += 1; c.rows_dividing += 1; }
      // against the generic rule
      const g = genericReadings(text);
      const ledgerPieces = prints ? prints : now ? piecesAt(text, now) : [text.trim()].filter(Boolean);
      const v = c.vs_generic;
      if (g.hidden && g.readings.length === 0) { if (ledgerPieces.length) v.generic_hid_ledger_prints += 1; else v.same += 1; }
      else if (g.readings.length > 1 && ledgerPieces.length === 1) v.generic_divided_ledger_whole += 1;
      else if (g.readings.length <= 1 && ledgerPieces.length > 1) v.ledger_divides_generic_did_not += 1;
      else if (g.readings.length > 1 && ledgerPieces.length > 1 && JSON.stringify(g.readings) !== JSON.stringify(ledgerPieces)) v.both_divide_differently += 1;
      else v.same += 1;
    }
  }
}
for (const [k, c] of Object.entries(unledgeredRows)) if (!(manifest.excluded || {})[k]) refuse(`${k} serves ${c} rows, has no ledger, and the manifest does not say why`);
if (conflicts.length) refuse(`${conflicts.length} rows where a print step cannot be applied: ${conflicts.slice(0, 4).join(" · ")}`);
const sources = {};
for (const [key, L] of ledgers) {
  const c = per[key] || { rows: 0, rows_dividing: 0, rows_printing_a_part: 0, rows_no_pill: 0, marks: 0, marks_dividing: 0, by_shape: {}, by_print_rule: {}, uncovered: 0, vs_generic: {} };
  sources[key] = { relay: L.relay, declaration_sha256: L.declaration_sha256, classifier_sha256: L.classifier_sha256, m_ids: Object.keys(index.m_sources).filter((m) => keyOfM(m) === key).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))), shapes: L.shapes.size, shapes_dividing: [...L.shapes.values()].filter((s) => s.divides).map((s) => s.id), branches: L.branches, ...c };
}
const totals = { ledgered_sources: ledgers.size, rows: rowsSeen, rows_dividing: rowsDividing, rows_printing_a_part: rowsPrinting, rows_no_pill: rowsNoPill, rows_whose_slot_moved: rowsChanged, uncovered: uncovered.length ? Object.values(per).reduce((a, c) => a + c.uncovered, 0) : 0 };
const vs = Object.values(per).reduce((a, c) => { for (const [x, y] of Object.entries(c.vs_generic)) a[x] = (a[x] || 0) + y; return a; }, {});
console.log(`ledger divisions · ${ledgers.size} ledgers · ${n(rowsSeen)} rows of ledgered sources · ${n(rowsDividing)} divide · ${n(rowsPrinting)} print a part · ${n(rowsNoPill)} print no pill · ${n(rowsChanged)} slots move · uncovered ${n(totals.uncovered)}`);
console.log(`  against the generic rule: ${JSON.stringify(vs)}`);
for (const [key, s] of Object.entries(sources)) if (s.rows) console.log(`  ${key.padEnd(66)} rows ${String(s.rows).padStart(7)} · divide ${String(s.rows_dividing).padStart(6)} · print ${String(s.rows_printing_a_part).padStart(5)} · no pill ${String(s.rows_no_pill).padStart(4)} · generic divided ${String(s.vs_generic.generic_divided_ledger_whole || 0).padStart(6)} · generic hid ${String(s.vs_generic.generic_hid_ledger_prints || 0).padStart(4)} · uncovered ${s.uncovered}`);
for (const u of uncovered.slice(0, 12)) console.log(`  uncovered: ${u.source} ${u.key}#${u.rank} ${u.m} «${u.route.slice(0, 70)}» — ${u.error}`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }

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
  what: "every source under a ledger divides its route text only where the ledger's shapes divide under the owner's answers, at the marks row[7] names, and prints a part of itself or no pill only where a branch the owner answered says so, the texts row[8] names (ledger-print-v1); a row with neither slot is one reading as the source wrote it; a source with no ledger keeps the generic rule",
  print_step: "tools/ledger-print-v1.mjs",
  sources: Object.fromEntries(Object.entries(sources).map(([k, s]) => [k, { relay: s.relay, declaration_sha256: s.declaration_sha256, classifier_sha256: s.classifier_sha256, m_ids: s.m_ids, shapes: s.shapes, shapes_dividing: s.shapes_dividing, branches: Object.fromEntries(Object.entries(s.branches).map(([id, b]) => [id, { option: b.option, resting: b.resting, by: b.by, on: b.on, ...(b.prints ? { prints: b.prints } : {}) }])), rows: s.rows, rows_dividing: s.rows_dividing, rows_printing_a_part: s.rows_printing_a_part, rows_no_pill: s.rows_no_pill, uncovered: s.uncovered }])),
  totals,
};
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: LEDGER_DIVISION_RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "LEDGER_DIVISIONS_RECEIPT_V2", rule_id: LEDGER_DIVISION_RULE_ID, print_step: "tools/ledger-print-v1.mjs", ran_at: on, store_version: { was, now }, totals, vs_generic_rule: vs, sources, uncovered_rows: uncovered }, null, 1));
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · index.ledgers names ${ledgers.size} ledgers · receipt ${RECEIPT}`);
