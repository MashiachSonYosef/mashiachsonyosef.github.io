#!/usr/bin/env node
// Carries the corpus lane's blank ledger (piece store v2.1, FOR-ELIJAH-v86:
// one line per served piece row with no English, each with its class) beside
// the served piece store, small, so the page can say at a blank piece which
// class it is. The lane's ledger is read against the served store as baked
// from the mended claims: a ledger row the claims patch mended is listed under
// "mended" (served with its English now, or withheld by the served rules as a
// join of two or more ranges); every other ledger row must still stand in the
// served store as a row with no English, and every served row with no English
// must be in the ledger, or the bake stops. The classes' words are the
// ledger's own (its index.json) and the relay's "the page" column.
// Usage: node tools/bake-blank-ledger-v1.mjs --from <piece-store-v2.1 folder> --relay <relay .md> [--store data/piece-store] [--out data/piece-store/blank-ledger-v1.json]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const FROM = arg("from", ""), RELAY = arg("relay", ""), STORE = arg("store", "data/piece-store"), OUT = arg("out", "data/piece-store/blank-ledger-v1.json");
if (!FROM || !existsSync(join(FROM, "blank-ledger-v1.jsonl")) || !RELAY || !existsSync(RELAY)) { console.error("usage: --from <folder holding blank-ledger-v1.jsonl, claims-patch-v1.jsonl, index.json> --relay <the relay .md that hands the ledger over>"); process.exit(2); }
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const ledgerBuf = readFileSync(join(FROM, "blank-ledger-v1.jsonl"));
const ledger = ledgerBuf.toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const patch = readFileSync(join(FROM, "claims-patch-v1.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const pix = JSON.parse(readFileSync(join(FROM, "index.json"), "utf8"));
const six = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
// the relay's CLASSES table: class, definition, rows, places, the page
const relayText = readFileSync(RELAY, "utf8");
const pageOf = {};
{ const lines = relayText.split("\n"); const h = lines.findIndex((l) => /^\|\s*class\s*\|\s*definition\s*\|.*\|\s*the page\s*\|/u.test(l));
  for (let i = h + 2; h > -1 && i < lines.length && lines[i].startsWith("|"); i += 1) { const cells = lines[i].split("|").slice(1, -1).map((x) => x.trim()); pageOf[cells[0]] = cells[4] || ""; } }
const classes = (pix.classes || []).map((c) => ({ name: c.name, def: c.def, page: pageOf[c.name] || "" }));
const ci = new Map(classes.map((c, i) => [c.name, i]));
for (const r of ledger) if (!ci.has(r.class)) { console.error(`ledger class ${r.class} is not in the ledger's index.json classes`); process.exit(1); }
const patched = new Map(patch.map((l) => [`${l.book}\u0001${l.place}\u0001${l.served_row_index}`, l]));
const rowOf = (r, c) => [r.pi, r.src, r.kind, r.reading, r.from, r.to, c];
const keyOf = (x) => `${x[0]}|${x[1]}|${x[2]}|${x[3]}|${x[4]}|${x[5]}`;
const books = {}, mended = {}, counts = { ledger_rows: 0, served_blank_rows: 0, mended_served: 0, mended_withheld: 0 }, perClass = {};
let stop = 0;
const storeOf = new Map();
const store = (bk) => storeOf.get(bk) || storeOf.set(bk, JSON.parse(readFileSync(join(STORE, `${bk}.json`), "utf8"))).get(bk);
for (const r of ledger) {
  counts.ledger_rows += 1;
  const c = ci.get(r.class); perClass[r.class] = perClass[r.class] || { ledger: 0, served_blank: 0, mended: 0 }; perClass[r.class].ledger += 1;
  const l = patched.get(`${r.book}\u0001${r.place}\u0001${r.served_row_index}`);
  if (l) {
    if (!(r.evidence && r.evidence.patched)) { console.error(`${r.book} ${r.place} row ${r.served_row_index}: in the claims patch but the ledger does not mark it patched`); stop += 1; }
    const how = l.served_rule_would_withhold ? "withheld" : "served";
    counts[`mended_${how}`] += 1; perClass[r.class].mended += 1;
    ((mended[r.book] = mended[r.book] || {})[r.place] = mended[r.book][r.place] || []).push([...rowOf(r, c), how, l.served_rule_would_withhold || null]);
    continue;
  }
  if (r.evidence && r.evidence.patched) { console.error(`${r.book} ${r.place} row ${r.served_row_index}: marked patched but no claims-patch line`); stop += 1; }
  // the row must still stand in the served store with no English
  const rows = (store(r.book).places[r.place] || []).filter((x) => keyOf(x) === keyOf(rowOf(r)) );
  if (!rows.length || !rows.every((x) => x[6] === null)) { console.error(`${r.book} ${r.place} row ${r.served_row_index} (${r.class}): ${rows.length ? "the served row carries English" : "no served row with its key"}`); stop += 1; }
  counts.served_blank_rows += 1; perClass[r.class].served_blank += 1;
  ((books[r.book] = books[r.book] || {})[r.place] = books[r.book][r.place] || []).push(rowOf(r, c));
}
// every served row with no English is in the ledger (by key, as many as listed)
let servedBlank = 0, unlisted = 0; const eg = [];
for (const bk of six.books) {
  const pb = store(bk);
  for (const [place, rows] of Object.entries(pb.places)) {
    const blanks = rows.filter((x) => x[6] === null || x[6] === "");
    if (!blanks.length) continue;
    servedBlank += blanks.length;
    const listed = ((books[bk] || {})[place] || []).map(keyOf);
    for (const x of blanks) { const i = listed.indexOf(keyOf(x)); if (i < 0) { unlisted += 1; if (eg.length < 5) eg.push(`${bk} ${place} ${JSON.stringify(x)}`); } else listed.splice(i, 1); }
  }
}
if (unlisted) { console.error(`${unlisted} served rows with no English are not in the ledger: ${eg.join(" | ")}`); stop += 1; }
if (stop) process.exit(1);
counts.places_blank = Object.values(books).reduce((t, b) => t + Object.keys(b).length, 0);
const out = {
  rule: "blank-ledger-serve-v1-every-served-row-with-no-english-carries-the-lane-s-class-for-it",
  from: { relay: basename(RELAY), build: basename(FROM.replace(/\/+$/u, "")), file: "blank-ledger-v1.jsonl", sha256: sha(ledgerBuf), rows: ledger.length, rule: pix.rule, rule_sha256_as_first_written: pix.rule_sha256_as_first_written, date: pix.date, amendments: pix.amendments },
  store: { relay: six.from && six.from.relay, build: six.from && six.from.build, served_rows: six.counts && six.counts.claims && six.counts.claims.value },
  what: "per book, per served place (chapter:verse:w), the served piece rows with no English, each with the lane's class: the page finds the row by its pi, src, kind, reading, from and to (the served row's first six slots) and prints the class's words; a row the lane mended is under mended, served with its English now or withheld by the served rules",
  row: ["pi", "src", "kind", "reading", "from", "to", "class (an index into classes)"],
  mended_row: ["pi", "src", "kind", "reading", "from", "to", "class (an index into classes)", "served | withheld", "the served rule that withholds it, or null"],
  classes,
  counts: {
    ledger_rows: { value: counts.ledger_rows, axis: "rows" },
    served_blank_rows: { value: counts.served_blank_rows, axis: "rows", what: "the ledger rows that still stand in the served store with no English; equal to the store's rows with no English" },
    served_blank_places: { value: counts.places_blank, axis: "places" },
    mended_served: { value: counts.mended_served, axis: "rows", what: "ledger rows the claims patch mended, served with their English now" },
    mended_withheld: { value: counts.mended_withheld, axis: "rows", what: "ledger rows the claims patch mended whose mended claim the served rules withhold (a join of two or more ranges: joins_whole_word or joins_run)" },
    per_class: Object.fromEntries(classes.map((c) => [c.name, { ...(perClass[c.name] || { ledger: 0, served_blank: 0, mended: 0 }), axis: "rows" }])),
  },
  books, mended,
};
writeFileSync(OUT, JSON.stringify(out));
console.log(`${OUT}: ${counts.ledger_rows} ledger rows [rows]: ${counts.served_blank_rows} still blank and served at ${counts.places_blank} places [rows; places] (the store's rows with no English: ${servedBlank}), ${counts.mended_served} mended and served, ${counts.mended_withheld} mended and withheld [rows]; ${Buffer.byteLength(JSON.stringify(out))} bytes`);
for (const c of classes) console.log(`  ${c.name}: ${JSON.stringify(perClass[c.name] || { ledger: 0, served_blank: 0, mended: 0 })}`);
