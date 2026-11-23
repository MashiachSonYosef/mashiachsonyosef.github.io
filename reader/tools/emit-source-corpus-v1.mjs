#!/usr/bin/env node
// RULE: source-corpus-rule-v1-a-witness-names-the-body-it-describes-or-is-not-sorted-by-one
// LEDGER: M
// the witness and what it may be asked about: this record carries, for every
// witness the route store cites, which body of text that witness declares
// itself to describe, and refuses outright the ones that describe a language
// outside Hebrew and Aramaic.
//
// 2026-09-06. M has always carried who said it, on what terms, and when. It
// did not carry WHAT BODY OF TEXT the source describes, and without that the
// reader's default sorter — lexicons of the text's own era first — cannot be
// built, because nothing on the card says which era a lexicon is of.
//
// The corpus lane classified all 79 of its source labels from each source's
// own title, and found more than a gap. Three of them describe languages the
// frame refuses absolutely: a Yiddish dictionary, an Arabic one, and a table
// of non-Hebrew languages written in Hebrew letters. Between them they were
// feeding 8,173 cards into the twenty-four books, and they were not harmless:
// the Yiddish source glosses the Hebrew word for "then" as "when", because
// the same letters are a Yiddish word, and it hands back "rebbe" and "cohen"
// — English loanwords fed onto the Hebrew they came from.
//
// This lane's route store never admitted any of the three; that was checked
// row by row across all 676,463 of them before this record was written, and
// it holds. So this is not a repair. It is the boundary made explicit, so it
// cannot drift the day the corpus lane's word layer is wired in: a witness
// arrives classified, or it arrives unclassified and is named here, and a
// witness the corpus lane refuses can never be served whatever else changes.
//
// 2026-11-22. THE LEDGER IS v1.1, AND A LABEL MAY BE JUDGED ROW BY ROW. The
// corpus lane reissued its ledger as v1.1 (relay v210, 21 November 2026), at
// its own address beside v1, which stays as it was. Three labels carry a new
// value, BY_ROW: such a label is neither admitted whole nor refused whole, and
// a served row of it stands only where the ledger's admitted_rows names it, by
// m, key and words, each such row admitted by its own source's language field.
// admitted_rows names a landing list by its file and sha256. This tree keeps
// that list where the landings' pin names those bytes, and the record says
// where (kept_here), so the check reads the very bytes the ledger names. A row
// of a BY_ROW label the list does not name is refused, as a witness M refuses
// is, and counted. The ledger read must be v1.1's bytes, the ones the address
// names: a record that names one ledger and was emitted from another is the
// fault this file exists to stop.
//
// 2026-11-22, the same day. WHAT A BY_ROW WITNESS'S ROWS COUNT AS. BY_ROW says
// how a label is judged, not which language it answers for, and the page's
// language shelf put such a witness under «Hebrew in general». Each line of
// the admitted list says what its own source's field counts as (language.
// counts_as), so the record carries, for each BY_ROW witness, those values
// over its own lines, each with its count (rows_count_as): recounted here from
// the lines, never typed. Lines that name none add nothing; a witness whose
// lines name none carries {}. The page shelves by it (shelfCorpusOf).
//
// AN ADMITTED LINE MAY STAND AS NO SERVED ROW (22 November 2026). The ledger
// names the rows it admits; the landings' pin may hold some of them back, a
// whole source (held_sources) or single lines (held_lines). A named row not
// served is no fault: the record says, for each BY_ROW witness, how many of its
// admitted lines stand as no served row, and of those how many its landing
// pin holds back by their line or with their source (admitted_lines_not_served).
// A line the pin held by its line and let go (let_go, 23 November 2026: a later list that re-reads its own, re_reads,
// lands it) is held no more: served, it is counted as served, and not served, as other.
//
// Run: node tools/emit-source-corpus-v1.mjs --ledger <source-corpus-v1.1.json> --stamp YYYY-MM-DD
//        [--store data/route-store] [--out data/source-corpus-v1.json]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinnedLines, PinFault } from "./pinned-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const LEDGER = arg("ledger") || die("MISSING_ARG", "--ledger");
const STAMP = arg("stamp") || die("MISSING_ARG", "--stamp");
const STORE = arg("store", join(K3, "data", "route-store"));
const OUT = arg("out", join(K3, "data", "source-corpus-v1.json"));
// Where the ledger came from, said as the address the other lane ships to and
// never as a path on whatever machine ran this.
const LEDGER_AT = "r2:mishkan/v2/ledgers/all/toggle-ledgers/source-corpus-v1.1.json";
// the bytes that address holds, as the corpus lane's letter names them (relay v210)
const LEDGER_VERSION = "v1.1";
const LEDGER_SHA256 = "8d9caf8c5c5f253f307ce9ffac176d77c01642e7fb72fcb1ae4241c4b9c78bbc";
const BY_ROW = "BY_ROW";
const SEP = "\x01";

const ledgerBytes = readFileSync(LEDGER);
const ledger = JSON.parse(ledgerBytes.toString("utf8"));
if (ledger.schema !== "mishkan.moses.toggle.source_corpus.v1")
  die("UNEXPECTED_LEDGER_SCHEMA", String(ledger.schema));
const ledgerSha = createHash("sha256").update(ledgerBytes).digest("hex");
if (ledger.version !== LEDGER_VERSION || ledgerSha !== LEDGER_SHA256)
  die("NOT_THE_LEDGER_NAMED", `the ledger read is ${ledger.version || "unversioned"}, sha256 ${ledgerSha}; the record names ${LEDGER_AT}, ${LEDGER_VERSION}, sha256 ${LEDGER_SHA256}`);
const byLabel = new Map((ledger.sources || []).map((s) => [s.source, s]));

const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const mSources = index.m_sources || {};

// Which witnesses the store actually cites, read from the shards rather than
// from the index: a witness recorded and never cited is not something this
// lane serves, and a witness cited is, whatever the index says.
// A label the ledger judges row by row: the rows its admitted_rows names, read
// from the list of the landings' pin that is those bytes (m, key and words).
const landingsPin = existsSync(join(K3, "data", "landings", "PIN.json")) ? JSON.parse(readFileSync(join(K3, "data", "landings", "PIN.json"), "utf8")) : { lists: [] };
const admittedOf = new Map();
// what each m's lines count as, by their own language field, each value with its count (most first, then by name)
const countsAsOf = (lines) => {
  const by = new Map();
  for (const e of lines) {
    if (!by.has(e.m)) by.set(e.m, {});
    const v = e.language && typeof e.language.counts_as === "string" && e.language.counts_as ? e.language.counts_as : null;
    if (v) by.get(e.m)[v] = (by.get(e.m)[v] || 0) + 1;
  }
  for (const [m, o] of by) by.set(m, Object.fromEntries(Object.entries(o).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))));
  return by;
};
const admittedRowsOf = (label) => {
  if (admittedOf.has(label)) return admittedOf.get(label);
  const a = (byLabel.get(label) || {}).admitted_rows || {};
  if (typeof a.file !== "string" || !/^[0-9a-f]{64}$/u.test(String(a.sha256))) die("BY_ROW_NAMES_NO_ROWS", `the ledger judges \u00ab${label}\u00bb row by row and names no list of the rows it admits`);
  const L = (landingsPin.lists || []).find((l) => l.list && l.list.sha256 === a.sha256);
  if (!L) die("BY_ROW_ROWS_NOT_HERE", `the rows the ledger admits for \u00ab${label}\u00bb are ${a.file} (sha256 ${a.sha256}), and no list of data/landings/PIN.json is those bytes`);
  const kept = `data/landings/${L.folder}/${L.list.file}`;
  let lines;
  try { lines = readPinnedLines(join(K3, kept), L.list, kept); } catch (e) { if (e instanceof PinFault) die("BY_ROW_ROWS_NOT_THEIR_BYTES", e.message); throw e; }
  const got = { entry: a, kept_here: kept, stored: L.list.stored || null, bytes: L.list.bytes, lines: L.list.lines, named: new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))), countsAs: countsAsOf(lines),
    idsOf: (m) => lines.filter((e) => e.m === m).map((e) => [e.m, e.key, e.route].join(SEP)),
    heldLineIds: new Set((Array.isArray(L.held_lines) ? L.held_lines : []).filter((h) => h && !h.let_go).map((h) => [h.m, h.key, h.route].join(SEP))),
    heldSources: new Set(Object.keys(L.held_sources || {})) };
  admittedOf.set(label, got);
  return got;
};
const byRowLabelOf = new Map(Object.entries(mSources).filter(([, s]) => s && (byLabel.get(s.label) || {}).declared_corpus === BY_ROW).map(([m, s]) => [m, s.label]));
const notNamed = new Map();   // m -> rows of a BY_ROW label that its admitted_rows does not name
const servedNamed = new Map();   // m -> the named rows of a BY_ROW label that stand served (m, key and words)
const cited = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(shard)) for (const r of rows) {
    cited.set(r[3], (cited.get(r[3]) || 0) + 1);
    const m = String(r[3]);
    if (byRowLabelOf.has(m)) {
      const id = [m, k, r[1]].join(SEP);
      if (!admittedRowsOf(byRowLabelOf.get(m)).named.has(id)) notNamed.set(m, (notNamed.get(m) || 0) + 1);
      else (servedNamed.get(m) || servedNamed.set(m, new Set()).get(m)).add(id);
    }
  }
}

const witnesses = {}, unclassified = [], refused = [];
for (const [m, rows] of [...cited.entries()].sort((a, b) => b[1] - a[1])) {
  const label = (mSources[m] || {}).label || null;
  const row = label ? byLabel.get(label) : null;
  if (!label) { unclassified.push({ m, label: null, rows, why: "the store cites this witness and its index does not record it" }); continue; }
  if (!row) { unclassified.push({ m, label, rows, why: "the corpus lane's ledger does not carry this label; its 79 answer the twenty-four books, this shelf is wider" }); continue; }
  witnesses[m] = { label, corpus: row.declared_corpus, evidence: row.evidence || null, rows };
  if (row.declared_corpus === "REFUSED") refused.push({ m, label, rows, why: row.evidence || "refused by M" });
  if (row.declared_corpus === BY_ROW) {
    const a = admittedRowsOf(label), off = notNamed.get(m) || 0;
    witnesses[m].admitted_rows = { file: a.entry.file, in: a.entry.in || null, sha256: a.entry.sha256, bytes: a.bytes, lines: a.lines, ...(a.stored ? { stored: a.stored } : {}),
      kept_here: a.kept_here, lines_of_this_label: a.entry.lines_of_this_label ?? null, by_m: a.entry.by_m || null, how: a.entry.how || null };
    witnesses[m].rows_named_by_admitted_rows = rows - off;
    witnesses[m].rows_count_as = a.countsAs.get(m) || {};
    const unserved = a.idsOf(m).filter((id) => !(servedNamed.get(m) || new Set()).has(id));
    const byLine = unserved.filter((id) => a.heldLineIds.has(id)).length, bySource = a.heldSources.has(m) ? unserved.length - byLine : 0;
    witnesses[m].admitted_lines_not_served = { lines: unserved.length, held_by_their_line: byLine, held_with_their_source: bySource, other: unserved.length - byLine - bySource };
    if (off) refused.push({ m, label, rows: off, why: "rows of a label the ledger judges row by row (BY_ROW) that its admitted_rows does not name: M refuses them" });
  }
}

const counts = {};
for (const w of Object.values(witnesses)) counts[w.corpus] = (counts[w.corpus] || 0) + 1;

const record = {
  schema_version: "SOURCE_CORPUS_V1",
  rule_id: "source-corpus-rule-v1-a-witness-names-the-body-it-describes-or-is-not-sorted-by-one",
  what: "for every witness this lane's route store cites, the body of text that witness declares itself to describe — the field the reader's era sorter reads, and the field that refuses a source describing a language outside Hebrew and Aramaic",
  stamp: STAMP,
  ledger: {
    at: LEDGER_AT,
    sha256: ledgerSha,
    version: ledger.version || null,
    generated: ledger.generated || null,
    law: ledger.law || null,
    classified_by: "the corpus lane, from each source's own title",
    sources_in_the_ledger: (ledger.sources || []).length,
    correction: ledger.correction || null,
  },
  values: ledger.values || {},
  witnesses_cited_here: cited.size,
  witnesses_classified: Object.keys(witnesses).length,
  by_value: counts,
  refused_and_cited_here: refused,
  unclassified,
  witnesses,
  says: refused.length
    ? `${refused.length} witness(es) this shelf cites are refused by M and must not be served`
    : "no witness this shelf cites is one M refuses",
};
const out = JSON.stringify(record, null, 2) + "\n";
if (/\b[A-Za-z]:[\\/](?![\\/])|\/(?:home|root|tmp|mnt|Users)\/|Users[\\/]/u.test(out))
  die("PATH_IN_RECORD", "a machine path reached the record; refusing to write it");
writeFileSync(OUT, out);
console.log(`${OUT.replace(K3 + "/", "")}: ${cited.size} witnesses cited · ${Object.keys(witnesses).length} classified · ${unclassified.length} not in the ledger · ${refused.length} refused · ledger ${ledger.version} ${ledgerSha.slice(0, 12)}`);
for (const [m, w] of Object.entries(witnesses)) if (w.corpus === BY_ROW) console.log(`  ${m} judged row by row: ${w.rows} rows served, ${w.rows_named_by_admitted_rows} named by ${w.admitted_rows.kept_here}; its lines count as ${JSON.stringify(w.rows_count_as)}; admitted lines not served ${JSON.stringify(w.admitted_lines_not_served)}`);
for (const [v, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${v.toLowerCase()}`);
