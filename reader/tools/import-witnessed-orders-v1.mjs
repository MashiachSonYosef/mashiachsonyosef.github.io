#!/usr/bin/env node
// GUARDS: witnessed-order-bake-rule-v1-three-columns-as-shipped-each-reading-with-its-own-credit
// LEDGER: M R
// THE WITNESSED ORDER'S SHIPPED INPUT, KEPT BESIDE THE ZONES.
//
// The corpus lane shipped the witnessed order as files (orders-witnessed-v2.7
// under moses-orders-rebase-v2.1, 25 September 2026): for each served book
// and each of the three columns, an order file (key -> the served row's whole
// text, verbatim) and an M file (key -> the credit for that text, verbatim).
// tools/bake-witnessed-order-v1.mjs read them once and baked each column as
// the row's FIRST reading under the store's rule of the day; the whole text
// it was cut from stayed only in the lane's files, in the relay store.
//
// When the store's rule moves (the ledgers, 6 November 2026), a column must
// be derived again from the whole text, and a column derived from the
// already-cut piece drifts: the code review of 6 November found 508 readings
// credited to a source that no longer gives them, and readings that walked
// from "trouble" to "weariness" across three runs. So the shipped input
// lives here, in the repository, and the bake reads it on every store
// change:
//
//   data/witnessed-orders-v2.7/<book>.bin   gzipped JSON: the book's three
//                                           columns, each with the lane's two
//                                           files' names and sha256 and their
//                                           entries and m_entries verbatim
//                                           (the M files' trace is left out:
//                                           it is the lane's working, not
//                                           the credit)
//   data/witnessed-orders-v2.7/index.json   what this is, where it came from,
//                                           every book's file and sha256
//
// Each lane file's sha256 must equal the one the zone's receipt pinned when
// the column was first baked (emitted_from.witnessed_order.columns[o]), or
// this refuses: the input on disk is the input that was shipped, proved by
// the bytes.
//
// Usage: node tools/import-witnessed-orders-v1.mjs --dir <orders-witnessed-v2.7> --taken-from "<R2 prefix>"
//          [--zones data/zones] [--out data/witnessed-orders-v2.7] [--stamp YYYY-MM-DD]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { join, basename } from "node:path";
import { zonesServed } from "./zones-on-disk-v1.mjs";

const RULE = "witnessed-order-bake-rule-v1-three-columns-as-shipped-each-reading-with-its-own-credit";
const COLUMNS = [["witnessed_same_place", "same-place"], ["witnessed_entry", "entry"], ["witnessed_entry_and_lists", "entry-and-lists"]];
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const DIR = arg("--dir"), TAKEN_FROM = arg("--taken-from", ""), ZONES = arg("--zones", "data/zones"), OUT = arg("--out", "data/witnessed-orders-v2.7"), STAMP = arg("--stamp", new Date().toISOString().slice(0, 10));
if (!DIR || !TAKEN_FROM) { console.error("usage: --dir <orders-witnessed-v2.7> --taken-from \"<the R2 prefix the files were read from>\" [--zones data/zones] [--out data/witnessed-orders-v2.7] [--stamp YYYY-MM-DD]"); process.exit(2); }
const refuse = (msg) => { console.log(`REFUSED — ${msg}`); process.exit(1); };
const sha = (b) => createHash("sha256").update(b).digest("hex");
mkdirSync(OUT, { recursive: true });

const manifestName = "MANIFEST-witnessed-v2.7.json";
const manifestBytes = existsSync(join(DIR, manifestName)) ? readFileSync(join(DIR, manifestName)) : null;
const books = {};
let entries = 0;
for (const book of zonesServed(ZONES)) {
  const zone = JSON.parse(gunzipSync(readFileSync(join(ZONES, `${book}.bin`))).toString("utf8"));
  const rec = zone.emitted_from && zone.emitted_from.witnessed_order;
  if (!rec || !rec.columns) continue;   // a book with no witnessed columns (the commentary zones) ships nothing here
  const out = { schema_version: "WITNESSED_ORDERS_SHIPPED_V1", rule: RULE, book, taken_from: TAKEN_FROM, imported_on: STAMP, columns: {} };
  const ixCols = {};
  for (const [order, stem] of COLUMNS) {
    const c = rec.columns[order];
    if (!c) refuse(`${book}: the zone's receipt has no ${order} column`);
    const of = join(DIR, `witnessed-${stem}-v2.7-${book}.json`), mf = join(DIR, `witnessed-${stem}-m-v2.7-${book}.json`);
    if (basename(of) !== c.order_file || basename(mf) !== c.m_file) refuse(`${book} ${order}: the receipt names ${c.order_file} and ${c.m_file}`);
    if (!existsSync(of) || !existsSync(mf)) refuse(`${book} ${order}: ${of} or ${mf} is not on disk`);
    const ob = readFileSync(of), mb = readFileSync(mf);
    if (sha(ob) !== c.order_sha256) refuse(`${book} ${order}: ${basename(of)} is ${sha(ob).slice(0, 12)}…, the receipt pins ${String(c.order_sha256).slice(0, 12)}…`);
    if (sha(mb) !== c.m_sha256) refuse(`${book} ${order}: ${basename(mf)} is ${sha(mb).slice(0, 12)}…, the receipt pins ${String(c.m_sha256).slice(0, 12)}…`);
    const o = JSON.parse(ob.toString("utf8")), m = JSON.parse(mb.toString("utf8"));
    if (o.book !== book || o.order !== order || m.book !== book || m.order !== order) refuse(`${book} ${order}: the files are not this book's ${order}`);
    const ents = o.entries || {}, ments = m.m_entries || {};
    for (const k of Object.keys(ents)) if (!(k in ments)) refuse(`${book} ${order}: ${k} has a reading and no credit`);
    out.columns[order] = {
      order_file: basename(of), order_sha256: sha(ob), m_file: basename(mf), m_sha256: sha(mb),
      version: o.version, build: o.build, store_version_rows_and_years: o.store_version_rows_and_years, values_are: o.values_are, m_rule: m.m_rule,
      entries: ents, m_entries: ments,
    };
    ixCols[order] = { order_file: basename(of), order_sha256: sha(ob), m_file: basename(mf), m_sha256: sha(mb), shipped: Object.keys(ents).length };
    entries += Object.keys(ents).length;
  }
  const bytes = gzipSync(Buffer.from(JSON.stringify(out)), { level: 9 });
  writeFileSync(join(OUT, `${book}.bin`), bytes);
  books[book] = { file: `${book}.bin`, sha256: sha(bytes), columns: ixCols };
}
const index = {
  schema_version: "WITNESSED_ORDERS_SHIPPED_INDEX_V1", rule: RULE, imported_on: STAMP, imported_by: "tools/import-witnessed-orders-v1.mjs",
  what: "the corpus lane's witnessed order as shipped (orders-witnessed-v2.7, build moses-orders-rebase-v2.1): for each served book and each of its three columns, the lane's order file (key -> the served row's whole text, verbatim) and M file (key -> the credit, verbatim), kept here so tools/bake-witnessed-order-v1.mjs derives the columns from the shipped text on every store change; each lane file's sha256 is the one the zone's receipt pinned at the first bake",
  taken_from: TAKEN_FROM, version: "v2.7", build: "moses-orders-rebase-v2.1",
  manifest: manifestBytes ? { file: manifestName, sha256: sha(manifestBytes) } : null,
  counts: { books: Object.keys(books).length, columns: Object.keys(books).length * COLUMNS.length, entries },
  books,
};
writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 1));
console.log(`imported ${Object.keys(books).length} books · ${entries} shipped entries · ${OUT}`);
