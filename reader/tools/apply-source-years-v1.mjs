#!/usr/bin/env node
// GUARDS: source-year-rule-v1-a-row-carries-its-sources-year-of-writing-and-an-older-witnesss-year-already-on-it-stands
// LEDGER: M
//
// THE YEAR EACH SOURCE'S ENGLISH WAS WRITTEN, ON ITS ROWS.
//
// The corpus lane's years list (moses-source-table-v1/years-v1.1/
// years-to-apply-v1.1.json, relay v165, 8 November 2026) names, per m id, the
// year the source's English was written, with the basis of each: the source's
// own stated date, a known publication with its pointer, or, for Davidson
// (M97), the catalog's date, on the owner's ruling of 8 November 2026 ("i
// trust your findings 1848 makes sense"; 7 November: "if you know its 1855
// thats fine", so a library's catalog date counts for a printed book that
// prints none, and the card says the year is the catalog's). Every source the
// list does not name keeps what it has. The list is kept here byte for byte
// (data/source-years-v1/) and applied by this tool to the year slot (slot 4)
// of every row of a listed source, in the route store and the span store.
//
// THE RULE, AND THE ONE PLACE IT IS NOT "EVERY ROW". The store keeps one row
// per key and text under one source's name, and where an older dated source
// wrote the same words the corpus lane's package wrote THAT source's year on
// the row (the fold: 184 MACULA rows carry Strong's 1890, 65 and 24 of the
// two SDBH copies, 46 of Classical Hebrew Words). The page reads a row's year
// as the year its wording was written, and orders "oldest first" by it. The
// relay says of those years: "the oldest-witness year your package writes on
// another source's row where a dated source witnessed the same text is the
// fold's, and road A's rebuild ends it: one row per key, text and source,
// each with its own year." Until that rebuild the older witness has no row
// of its own, so writing the listed source's later year over it would take a
// witness's year off the page with nothing standing in its place. So:
//
//   - a row of a listed source that carries no year takes the source's year;
//   - a row that carries a LATER year than its source's takes the source's
//     (Davidson's rows that the fold dated 1890 or 2022, before anyone had
//     dated Davidson: 1848 is older than either);
//   - a row that carries an OLDER year than its source's keeps it, and the
//     receipt counts it by source and by the year kept. Nothing here works
//     out who witnessed what; the year kept is the one already on the row.
//
// A YEAR HELD (data/source-years-v1/HELD.json, the page lane's own record).
// The list's year for a source is not written on its rows while the store's
// fold would make it lie about the source itself. Davidson (M97) is the
// case, 10 November 2026: the store holds 85 rows under his name on 44 keys,
// and they are only the senses no other dictionary shares, because the fold
// stands a shared sense under one source's name (his «father» stands under
// another's; «author», «inventor» and an honorary sense are what carry his).
// Dated 1848 alone, those lead "oldest first": the keyed line moved at 30
// keys across the 40 served zones, every one to a row of his («father» to
// «author», «Abraham» to «father of a great multitude», «that» to «so
// that»). That is the fold speaking, not Davidson. So his year waits for the
// store that keeps one row per key, text and source, where his first sense
// carries his year too; the index names the year, its mark and the hold, and
// the rows keep what they carried. The owner's ruling on the year itself
// stands (1848, the catalog's date); only its writing on the rows waits.
//
// The index's edition year (m_sources[m].sourceYear) is not touched: "the
// edition year in the index stays the edition shelf" (the list's own words).
// The index carries the list's entries under source_years, so the page can
// say beside a year what kind of year it is (mark_on_the_card).
//
// Idempotent: a second run moves nothing. --dry prints and writes nothing.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const RULE_ID = "source-year-rule-v1-a-row-carries-its-sources-year-of-writing-and-an-older-witnesss-year-already-on-it-stands";
const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const SPAN = arg("span-store", join(K3, "data", "span-store"));
const LIST = arg("list", join(K3, "data", "source-years-v1", "years-to-apply-v1.1.json"));
const PIN = arg("pin", join(K3, "data", "source-years-v1", "PIN.json"));
const RECEIPT = arg("receipt", join(K3, "data", "source-years-receipt-v1.json"));
const HELD_FILE = arg("held", join(K3, "data", "source-years-v1", "HELD.json"));
const NO_YEAR = "S_NO_SOURCE_YEAR";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");

// ---- the list, as the corpus lane wrote it -----------------------------------------
if (!existsSync(LIST) || !existsSync(PIN)) refuse(`the years list or its pin is missing (${LIST})`);
const listBytes = readFileSync(LIST);
const pin = JSON.parse(readFileSync(PIN, "utf8"));
if (sha256(listBytes) !== pin.sha256) refuse(`the years list is not the bytes its pin names (${sha256(listBytes)} against ${pin.sha256})`);
const list = JSON.parse(listBytes.toString("utf8"));
if (!Array.isArray(list.years) || !list.years.length) refuse("the years list holds no years");
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const spanIndexPath = join(SPAN, "index.json");
const spanIndex = existsSync(spanIndexPath) ? JSON.parse(readFileSync(spanIndexPath, "utf8")) : null;
const keyOf = (m) => ((index.m_sources || {})[m] || ((spanIndex && spanIndex.m_sources) || {})[m] || {}).key || null;
const YEARS = new Map();
for (const y of list.years) {
  if (!y || typeof y.m !== "string" || !Number.isInteger(y.year) || y.year < 1 || y.year > 2100) refuse(`a line of the years list names no m id or no year: ${JSON.stringify(y).slice(0, 120)}`);
  if (YEARS.has(y.m)) refuse(`the years list names ${y.m} twice`);
  // the list names each source by its key too: an m id that stands for another source here is a refusal, never a guess
  if (keyOf(y.m) !== y.key) refuse(`${y.m} is ${keyOf(y.m) || "no source"} in the store and ${y.key} in the years list`);
  YEARS.set(y.m, y);
}
// the years held off the rows, each with why and until when; a hold on a source the list does not name is a refusal
const heldRecord = existsSync(HELD_FILE) ? JSON.parse(readFileSync(HELD_FILE, "utf8")) : { held: {} };
const HELD = new Map(Object.entries(heldRecord.held || {}));
for (const [m, h] of HELD) {
  if (!YEARS.has(m)) refuse(`${m} is held and the years list does not name it`);
  if (!h || !h.why || !h.until) refuse(`the hold on ${m} does not say why or until when`);
}

// ---- one row's year ------------------------------------------------------------------
const tally = {};   // m -> counts
const of = (m) => (tally[m] ||= { rows: 0, took_the_year_from_none: 0, took_the_year_from_a_later_year: {}, kept_an_older_year: {}, already_the_year: 0 });
const yearOf = (v) => { const s = String(v ?? ""); return /^\d{3,4}$/u.test(s) ? Number(s) : null; };
// the slots array of a row (a store row is its own slots; a span row keeps them under .slots); true where the year moved
const setYear = (slots, where) => {
  const y = YEARS.get(String(slots[3])); if (!y) return false;
  const c = of(y.m)[where] ||= { rows: 0, moved: 0 }; c.rows += 1;
  const t = of(y.m); t.rows += 1;
  if (HELD.has(y.m)) { const k = String(slots[4]); (t.held_rows_carry ||= {})[k] = (t.held_rows_carry[k] || 0) + 1; return false; }
  const has = yearOf(slots[4]);
  if (has === y.year) { t.already_the_year += 1; return false; }
  if (has !== null && has < y.year) { t.kept_an_older_year[has] = (t.kept_an_older_year[has] || 0) + 1; return false; }
  if (has === null) {
    if (slots[4] !== NO_YEAR) refuse(`a row of ${y.m} carries a year slot that is neither a year nor ${NO_YEAR}: ${JSON.stringify(slots[4])}`);
    t.took_the_year_from_none += 1;
  } else t.took_the_year_from_a_later_year[has] = (t.took_the_year_from_a_later_year[has] || 0) + 1;
  c.moved += 1;
  if (!DRY) slots[4] = String(y.year);
  return true;
};

// ---- the route store -------------------------------------------------------------------
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
const touched = [];
let storeMoved = 0;
for (const name of shardNames) {
  const path = join(STORE, "shards", name);
  const body = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
  let moved = 0;
  for (const rows of Object.values(body)) for (const row of rows) if (Array.isArray(row) && setYear(row, "store")) moved += 1;
  if (moved) { storeMoved += moved; touched.push(name); if (!DRY) writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 })); }
}

// ---- the span store ------------------------------------------------------------------
let spanMoved = 0; const spanFilesMoved = [];
if (spanIndex) {
  for (const f of readdirSync(SPAN).filter((x) => /^[a-z0-9-]+\.json$/u.test(x) && x !== "index.json").sort()) {
    const path = join(SPAN, f);
    const file = JSON.parse(readFileSync(path, "utf8"));
    if (!file.keys || typeof file.keys !== "object") continue;
    let moved = 0;
    for (const rows of Object.values(file.keys)) for (const r of rows) if (r && Array.isArray(r.slots) && setYear(r.slots, "span_store")) moved += 1;
    if (moved) { spanMoved += moved; spanFilesMoved.push(f); if (!DRY) writeFileSync(path, JSON.stringify(file)); }   // the bake's own byte shape: one line, no indent
  }
}

// ---- say it ------------------------------------------------------------------------------
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const sources = {};
for (const [m, y] of YEARS) {
  const t = tally[m] || { rows: 0, took_the_year_from_none: 0, took_the_year_from_a_later_year: {}, kept_an_older_year: {}, already_the_year: 0 };
  sources[m] = { key: y.key, year: y.year, basis: y.basis, ...(y.mark_on_the_card ? { mark_on_the_card: y.mark_on_the_card } : {}),
    ...(HELD.has(m) ? { held: { until: HELD.get(m).until, why: HELD.get(m).why, held_on: HELD.get(m).held_on || null, rows_carry: t.held_rows_carry || {} } } : {}),
    rows: t.rows, rows_in_the_store: (t.store || {}).rows || 0, rows_in_the_span_store: (t.span_store || {}).rows || 0,
    took_the_year_from_none: t.took_the_year_from_none, took_the_year_from_a_later_year: t.took_the_year_from_a_later_year,
    kept_an_older_year: t.kept_an_older_year, already_the_year: t.already_the_year };
  const kept = sum(t.kept_an_older_year), later = sum(t.took_the_year_from_a_later_year);
  if (HELD.has(m)) { console.log(`  ${m.padEnd(5)} ${String(y.year).padEnd(5)} ${String(y.key).slice(0, 54).padEnd(54)} rows ${String(t.rows).padStart(7)} · HELD off the rows until ${HELD.get(m).until} (they carry ${Object.entries(t.held_rows_carry || {}).map(([yr, c]) => `${yr}×${c}`).join(" ") || "nothing"})`); continue; }
  console.log(`  ${m.padEnd(5)} ${String(y.year).padEnd(5)} ${String(y.key).slice(0, 54).padEnd(54)} rows ${String(t.rows).padStart(7)} · from none ${String(t.took_the_year_from_none).padStart(6)} · from a later year ${String(later).padStart(3)} · an older year kept ${String(kept).padStart(4)}${kept ? ` (${Object.entries(t.kept_an_older_year).map(([yr, c]) => `${yr}×${c}`).join(" ")})` : ""} · already ${t.already_the_year}`);
}
const totals = { sources: YEARS.size, sources_held_off_the_rows: [...HELD.keys()], rows_of_listed_sources: sum(Object.fromEntries(Object.entries(sources).map(([m, s]) => [m, s.rows]))),
  years_moved_in_the_store: storeMoved, years_moved_in_the_span_store: spanMoved, shards_rewritten: touched.length, span_files_rewritten: spanFilesMoved.length,
  rows_keeping_an_older_year: sum(Object.fromEntries(Object.entries(sources).map(([m, s]) => [m, sum(s.kept_an_older_year)]))) };
console.log(`source years · ${YEARS.size} sources${HELD.size ? ` (${[...HELD.keys()].join(", ")} held off the rows)` : ""} · ${n(totals.rows_of_listed_sources)} rows · ${n(storeMoved)} years move in the store (${touched.length} shards) · ${n(spanMoved)} in the span store (${spanFilesMoved.length} books) · ${n(totals.rows_keeping_an_older_year)} rows keep an older year`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }

// ---- write: the index, the receipt ---------------------------------------------------
const on = new Date().toISOString();
const digest = createHash("sha256");
// the shards' weight on disk, which the index states (counts.shard_bytes_total; check-route-store-exact-k L10): a year
// written into a row moves its shard's bytes, so the total is taken again from the shards as they now stand
let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
// a run that moves no year on a list already applied is a recount: the indexes keep the totals and the date of the run that
// moved the years, and say when they were last counted again; the receipt takes the recount as its own run
const priorSY = index.source_years || null;
const recount = storeMoved + spanMoved === 0 && !!priorSY && !!priorSY.list && priorSY.list.sha256 === pin.sha256 && !!priorSY.totals;
const WHAT = "a row of a source the corpus lane's years list names carries the year that source's English was written in its year slot (slot 4), unless an older year already stands there: the year of an older witness of the same words, which the store's fold wrote on the row and which stands until the store keeps one row per key, text and source; a source whose year is held (HELD.json) keeps what its rows carried until the hold lifts; a source the list does not name keeps what it has; the edition year (m_sources[m].sourceYear) is the edition shelf's and is not touched; mark_on_the_card is printed beside the year wherever a row carries that source's own year";
index.source_years = {
  rule_id: RULE_ID, applied_on: recount ? priorSY.applied_on : on, ...(recount ? { recounted_on: on } : {}), applied_by: "tools/apply-source-years-v1.mjs",
  list: { file: "reader/data/source-years-v1/years-to-apply-v1.1.json", sha256: pin.sha256, relay: pin.relay, from: pin.from },
  what: WHAT,
  sources: Object.fromEntries(Object.entries(sources).map(([m, s]) => [m, { key: s.key, year: s.year, basis: s.basis, ...(s.mark_on_the_card ? { mark_on_the_card: s.mark_on_the_card } : {}), ...(s.held ? { held: { until: s.held.until, why: s.held.why, held_on: s.held.held_on } } : {}) }])),
  held: HELD.size ? { file: "reader/data/source-years-v1/HELD.json", what: "a year the list names that is not written on its source's rows yet, with why and until when; the rows keep what they carried" } : null,
  totals: recount ? priorSY.totals : totals,
};
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
if (spanIndex) {
  const priorSpan = spanIndex.source_years || null;
  const spanRecount = recount && !!priorSpan && priorSpan.list_sha256 === pin.sha256;
  spanIndex.source_years = { rule_id: RULE_ID, applied_on: spanRecount ? priorSpan.applied_on : on, ...(spanRecount ? { recounted_on: on } : {}), applied_by: "tools/apply-source-years-v1.mjs", list_sha256: pin.sha256,
    what: "a span row of a source the years list names carries that source's year in its year slot (slot 4) as a store row does; the other slots are the lane's, byte for byte",
    on_the_card: "a span row's year is said beside its credit and orders nothing: the span store's own order (by_key: names first) stands on the card, as the line reads the store's first row, until the corpus lane says how its order and the years combine (zone.html, orderYearOf; check-span-store-v1 S6)",
    years_moved: spanRecount ? priorSpan.years_moved : spanMoved, books_rewritten: spanRecount ? priorSpan.books_rewritten : spanFilesMoved };
  writeFileSync(spanIndexPath, JSON.stringify(spanIndex, null, 1));
}
const prior = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
const run = { ran_at: on, store_version: { was, now }, totals, sources };
// the first run is the one that moved the years; a later run that moves nothing is appended as a recount, never over it
const runs = [...((prior && prior.runs) || []), run];
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "SOURCE_YEARS_RECEIPT_V1", rule_id: RULE_ID, what: WHAT,
  list: { file: "reader/data/source-years-v1/years-to-apply-v1.1.json", sha256: pin.sha256, relay: pin.relay, from: pin.from },
  runs }, null, 1) + "\n");
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""}${recount ? " · a recount: the indexes keep the applying run's totals" : ""} · shards weigh ${n(shardBytes)} bytes · index.source_years names ${YEARS.size} sources · receipt ${RECEIPT}`);
