// THE SPAN STORE, SERVED (Moses's relay v75.3, 16 October 2026: "Both stores
// are READY"; span store v1.3: 1717 rows, 462 ink keys, 2845 places, 38
// books). The owner's rule: "an underline is one license defining both
// words". This tool lays the lane's build on the shelf as the page reads it:
//   data/span-store/index.json      the store's own record (counts, rule,
//                                   instruction lines), the sources it names
//                                   in the served index's shape (m_sources),
//                                   and by_key as the lane orders it
//   data/span-store/<book>.json     the book's places, and under each ink
//                                   key the rows that answer it, in by_key
//                                   order (NAME rows first), the seven slots
//                                   byte for byte as rows.jsonl carries them
// Usage: node tools/bake-span-store-v1.mjs --from <build>/span-store-v1.3 [--out data/span-store] [--store data/route-store]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const FROM = arg("from", "");
if (!FROM || !existsSync(join(FROM, "index.json"))) { console.error("usage: --from <folder holding index.json, rows.jsonl, places/>"); process.exit(2); }
const OUT = arg("out", "data/span-store"), STORE = arg("store", "data/route-store");
mkdirSync(join(OUT), { recursive: true });
const sha = (b) => createHash("sha256").update(b).digest("hex");
const ix = JSON.parse(readFileSync(join(FROM, "index.json"), "utf8"));
const rowsText = readFileSync(join(FROM, "rows.jsonl"), "utf8");
const rows = new Map();
for (const line of rowsText.split("\n")) { if (!line.trim()) continue; const r = JSON.parse(line); rows.set(r.row_id, r); }
// the served index: which sources the store names and which the shelf lacks
const served = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const m_sources = {};
for (const [id, m] of Object.entries(ix.m_sources || {})) {
  if (served.m_sources && served.m_sources[id]) continue;   // a store source is never overwritten
  // a source the shelf does not carry yet: its license as the lane's ledger
  // line names it; the pointer is the same declaration another served id
  // of the same source points to, where one exists, else the ledger's file
  const twin = Object.values(served.m_sources || {}).find((s) => s.key === m.key);
  const declared = (m.declared_at || [])[0] || {};
  m_sources[id] = { key: m.key, label: m.name, licensePosture: m.short_label,
    licensePointer: twin && twin.licensePointer ? twin.licensePointer : `${declared.file || ""}${declared.line ? `#L${declared.line}` : ""}`,
    sourceYear: "S_NO_SOURCE_YEAR", from: "span-store-v1.3", licence_label: m.licence_label || "" };
}
const slim = (r) => ({ row_id: r.row_id, keys: r.keys, slots: r.slots, gap: r.gap, order_kind: r.order_kind, kind: r.span && r.span.row_kind ? r.span.row_kind : null });
const books = [];
let placesTotal = 0, nested = 0, overlaps = 0;
for (const f of readdirSync(join(FROM, "places")).sort()) {
  if (!f.endsWith(".jsonl")) continue;
  const book = basename(f, ".jsonl");
  const lines = readFileSync(join(FROM, "places", f), "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  const header = lines[0] && lines[0].header ? lines.shift() : null;
  const keys = {};
  for (const p of lines) {
    if (!keys[p.key]) keys[p.key] = (ix.by_key[p.key] || p.row_ids).map((id) => slim(rows.get(id))).filter(Boolean);
    if (p.inside_of) nested += 1;
    if (p.overlaps && p.overlaps.length) overlaps += 1;
  }
  placesTotal += lines.length;
  const out = { schema_version: "span-store-served-v1", from: "span-store-v1.3 (Moses, relay v75.3, 16 October 2026)", book, places: lines.length,
    places_axis: "places", rule: header ? header.rule : null, keys_axis: "ink keys", keys };
  out.placesList = lines.map((p) => ({ key: p.key, ref: p.ref, first: p.first_word_number, last: p.last_word_number, row_ids: p.row_ids, inside_of: p.inside_of, contains: p.contains, overlaps: p.overlaps }));
  writeFileSync(join(OUT, `${book}.json`), JSON.stringify(out));
  books.push({ book, places: lines.length, keys: Object.keys(keys).length });
}
const index = {
  schema_version: "span-store-served-v1", from: "span-store-v1.3", relay: "FOR-ELIJAH-v75.3.md", date: ix.date, rule: ix.rule, rule_sha256_before_any_script: ix.rule_sha256_before_any_script,
  what_a_row_is: ix.what_a_row_is, ink_key: ix.ink_key, gap_values: ix.gap_values, by_key_rule: ix.by_key_rule, instruction_lines: ix.instruction_lines,
  counts: { rows: { value: rows.size, axis: "store rows" }, ink_keys: { value: Object.keys(ix.by_key).length, axis: "keys" }, places: { value: placesTotal, axis: "places" }, nested_places: { value: nested, axis: "places" }, places_overlapping: { value: overlaps, axis: "places" }, books: { value: books.length, axis: "books" } },
  books: Object.fromEntries(books.map((b) => [b.book, { places: b.places, keys: b.keys }])),
  rows_sha256: sha(rowsText), index_sha256: sha(readFileSync(join(FROM, "index.json"))),
  m_sources,
};
writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 1));
console.log(`${OUT}: ${rows.size} rows · ${Object.keys(ix.by_key).length} keys · ${placesTotal} places in ${books.length} books · ${nested} nested · ${overlaps} overlapping · sources added ${Object.keys(m_sources).join(", ") || "none"}`);
