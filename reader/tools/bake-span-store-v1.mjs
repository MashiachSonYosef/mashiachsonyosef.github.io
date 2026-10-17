// THE SPAN STORE, SERVED (Moses's relay v75.3, 16 October 2026: "Both stores
// are READY"; span store v1.3: 1717 rows, 462 ink keys, 2845 places, 38
// books; span store v1.4, 17 October 2026, served on the owner's word though
// its draft relay reads NOT READY, superseded by span store v2: 1767 rows,
// 465 keys, 2848 places, the 29 closed-up rows withheld below). The owner's
// rule: "an underline is one license defining both words". This tool lays
// the lane's build on the shelf as the page reads it:
//   data/span-store/index.json      the store's own record (counts, rule,
//                                   instruction lines), the sources it names
//                                   in the served index's shape (m_sources),
//                                   and by_key as the lane orders it
//   data/span-store/<book>.json     the book's places, and under each ink
//                                   key the rows that answer it, in by_key
//                                   order (NAME rows first), the seven slots
//                                   byte for byte as rows.jsonl carries them
// Usage: node tools/bake-span-store-v1.mjs --from <build>/span-store-v1.N --relay <relay file name>
//          [--relay-standing "<the relay's own standing, and on whose word it is served>"]
//          [--taken-from <the R2 prefix the build was read from>] [--out data/span-store] [--store data/route-store]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const FROM = arg("from", "");
if (!FROM || !existsSync(join(FROM, "index.json"))) { console.error("usage: --from <folder holding index.json, rows.jsonl, places/>"); process.exit(2); }
const OUT = arg("out", "data/span-store"), STORE = arg("store", "data/route-store");
// the build's own name, from its folder (span-store-v1.4), and its relay
const BUILD = basename(FROM.replace(/\/+$/u, ""));
const RELAY = arg("relay", ""), RELAY_STANDING = arg("relay-standing", ""), TAKEN_FROM = arg("taken-from", "");
if (!RELAY) { console.error("--relay <the relay file that hands this build over> is required"); process.exit(2); }
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
    sourceYear: "S_NO_SOURCE_YEAR", from: BUILD, licence_label: m.licence_label || "" };
}
const slim = (r) => ({ row_id: r.row_id, keys: r.keys, slots: r.slots, gap: r.gap, order_kind: r.order_kind, kind: r.span && r.span.row_kind ? r.span.row_kind : null });
const books = [];
let placesTotal = 0, nested = 0, overlaps = 0; const withheld = new Set(), emptied = [], rowsDiffer = [];
for (const f of readdirSync(join(FROM, "places")).sort()) {
  if (!f.endsWith(".jsonl")) continue;
  const book = basename(f, ".jsonl");
  const lines = readFileSync(join(FROM, "places", f), "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  const header = lines[0] && lines[0].header ? lines.shift() : null;
  const keys = {};
  for (const p of lines) {
    // NO WELD (the owner, 2026-10-16/17: "drop welding", "and weld fix"): a
    // row whose gap is NONE is a source's closed-up spelling of the words
    // (weld) or fold; the ink wrote them apart, so the row is withheld from
    // the page and counted here (rows_closed_up_withheld)
    if (!keys[p.key]) keys[p.key] = (ix.by_key[p.key] || p.row_ids).map((id) => slim(rows.get(id))).filter(Boolean).filter((r) => { if (r.gap === "NONE") { withheld.add(r.row_id); return false; } return true; });
    // EACH PLACE'S OWN ROWS (v1.4, I2: "draw each row the place's row_ids
    // name"): the page reads a key's rows, so a place may name no other rows
    // than its key's, closed-up rows aside; a build where one does stops here
    const own = (p.row_ids || []).filter((id) => rows.get(id) && rows.get(id).gap !== "NONE");
    const kin = new Set(keys[p.key].map((r) => r.row_id));
    if (own.length !== kin.size || own.some((id) => !kin.has(id))) rowsDiffer.push(`${book} ${p.ref} ${p.key}`);
  }
  if (rowsDiffer.length) { console.error(`STOP: ${rowsDiffer.length} places name rows their key does not: ${rowsDiffer.slice(0, 5).join(" | ")}`); process.exit(1); }
  // a place whose rows were all closed-up spellings has nothing to draw: it
  // is not served (places_withheld), and its key goes with it
  const kept = lines.filter((p) => { if (keys[p.key].length) return true; emptied.push(`${book} ${p.ref} ${p.key}`); return false; });
  for (const k of Object.keys(keys)) if (!keys[k].length) delete keys[k];
  // and no served place points at one: its overlaps, its inner places and
  // the place it stands inside name only places the page draws
  const gone = new Set(lines.filter((p) => !kept.includes(p)).map((p) => `${p.ref}\u0001${p.key}`));
  if (gone.size) for (const p of kept) {
    const here = (k) => !gone.has(`${p.ref}\u0001${k}`);
    if (Array.isArray(p.overlaps)) p.overlaps = p.overlaps.filter(here);
    if (Array.isArray(p.contains)) p.contains = p.contains.filter(here);
    if (p.inside_of && !here(p.inside_of)) p.inside_of = null;
  }
  for (const p of kept) { if (p.inside_of) nested += 1; if (p.overlaps && p.overlaps.length) overlaps += 1; }
  lines.length = 0; lines.push(...kept);
  placesTotal += lines.length;
  const out = { schema_version: "span-store-served-v1", from: `${BUILD} (Moses, ${RELAY}, ${ix.date || "no date"})`, book, places: lines.length,
    places_axis: "places", rule: header ? header.rule : null, keys_axis: "ink keys", keys };
  out.placesList = lines.map((p) => ({ key: p.key, ref: p.ref, first: p.first_word_number, last: p.last_word_number, row_ids: p.row_ids, inside_of: p.inside_of, contains: p.contains, overlaps: p.overlaps }));
  writeFileSync(join(OUT, `${book}.json`), JSON.stringify(out));
  books.push({ book, places: lines.length, keys: Object.keys(keys).length });
}
const index = {
  schema_version: "span-store-served-v1", from: BUILD, relay: RELAY, relay_standing: RELAY_STANDING || null, taken_from: TAKEN_FROM || null, date: ix.date, rule: ix.rule, rule_sha256_before_any_script: ix.rule_sha256_before_any_script,
  what_a_row_is: ix.what_a_row_is, ink_key: ix.ink_key, gap_values: ix.gap_values, by_key_rule: ix.by_key_rule, instruction_lines: ix.instruction_lines,
  counts: { rows: { value: rows.size, axis: "store rows" }, ink_keys: { value: Object.keys(ix.by_key).length, axis: "keys" }, places: { value: placesTotal, axis: "places" }, nested_places: { value: nested, axis: "places" }, places_overlapping: { value: overlaps, axis: "places" }, books: { value: books.length, axis: "books" }, rows_closed_up_withheld: { value: withheld.size, axis: "store rows", why: "gap NONE: the source printed the words closed up; the ink did not (no weld)" }, places_withheld: { value: emptied.length, axis: "places", why: "every row of the place was a closed-up spelling", places: emptied } },
  books: Object.fromEntries(books.map((b) => [b.book, { places: b.places, keys: b.keys }])),
  rows_sha256: sha(rowsText), index_sha256: sha(readFileSync(join(FROM, "index.json"))),
  m_sources,
};
writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 1));
console.log(`${OUT}: ${rows.size} rows · ${Object.keys(ix.by_key).length} keys · ${placesTotal} places in ${books.length} books · ${nested} nested · ${overlaps} overlapping · sources added ${Object.keys(m_sources).join(", ") || "none"}`);
if (emptied.length) console.log(`places withheld, every row a closed-up spelling: ${emptied.length} · ${emptied.join(" | ")}`);
console.log(`closed-up rows withheld: ${withheld.size}`);
