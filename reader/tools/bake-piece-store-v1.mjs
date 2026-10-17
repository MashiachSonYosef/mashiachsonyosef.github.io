#!/usr/bin/env node
// Bakes the corpus lane's piece store v2 (FOR-ELIJAH-v77, normalized: records
// once under a hash id, claims apart) into the served shape: one file per
// book holding the claims at each place as short arrays and the records
// they name, and an index naming the two PIECE sources with their license.
// Share the record, never share the claim: a served claim carries no text
// of its own; its English is a slice of its record's D by the lane's byte
// ranges, cut here from that one copy.
// The served record is [m, headword, R, year]: the record's source line (D,
// a TSV row of TAHOT or MACULA) stays in the lane's store under the same rid
// (corpus-lane-builds/moses-piece-store-v2/build/piece-store-v2/records/)
// and is not served; the page shows R, the record's own reading, as the
// piece's definition.
// Usage: node tools/bake-piece-store-v1.mjs --from <build>/piece-store-v2 [--out data/piece-store]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const FROM = arg("from", ""), OUT = arg("out", "data/piece-store");
if (!FROM || !existsSync(join(FROM, "index.json"))) { console.error("usage: --from <folder holding index.json, claims/, records/>"); process.exit(2); }
const ix = JSON.parse(readFileSync(join(FROM, "index.json"), "utf8"));
mkdirSync(OUT, { recursive: true });
const sliceD = (D, r, recs, byRid) => {
  if (!Array.isArray(r)) return null;
  const parts = [];
  for (const seg of r) {
    if (!Array.isArray(seg)) continue;
    const [s, e, i] = seg; const d = i === undefined ? D : (byRid.get(recs[i]) || {}).D;
    if (typeof d !== "string") continue;
    parts.push(Buffer.from(d, "utf8").subarray(s, e).toString("utf8"));
  }
  return parts.length ? parts.join(" ") : null;
};
let claimsAll = 0, recsAll = 0, placesAll = 0, withR = 0; let joins = 0; const perSrcJoins = {};
const perSrc = {};
for (const book of ix.books) {
  const byRid = new Map();
  for (const src of ["tahot", "macula"]) {
    const f = join(FROM, "records", src, `${book}.jsonl`);
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) { if (!line) continue; const r = JSON.parse(line); byRid.set(r.rid, r); }
  }
  const places = {}, records = {};
  for (const line of readFileSync(join(FROM, "claims", `${book}.jsonl`), "utf8").split("\n")) {
    if (!line) continue;
    const c = JSON.parse(line);
    const [p, ref, w, pi, src, kind, reading, rec, r, cut, sign, cell, letters] = c;
    claimsAll += 1; perSrc[src] = (perSrc[src] || 0) + 1;
    // THE LANE'S JOINS ARE NOT READINGS: a whole-word claim on a word the
    // source divides names two or more records (MACULA) or two or more ranges
    // of one record (TAHOT, "in/ beginning"), its R their slices joined by
    // the lane ("in  beginning"); the pieces carry the records, so the join is
    // counted and not served (the owner, 2026-10-16: "each piece in the + sign
    // is RMD"; "share the record, never share the claim")
    if ((rec && rec.length > 1) || (r && r.length > 1)) { joins += 1; perSrcJoins[src] = (perSrcJoins[src] || 0) + 1; continue; }
    const rid = rec && rec[0]; const R0 = rid ? byRid.get(rid) : null;
    const R = R0 ? sliceD(R0.D, r, rec, byRid) : null;
    if (R) withR += 1;
    const key = `${ref}:${w}`;
    if (!places[key]) { places[key] = []; placesAll += 1; }
    places[key].push([pi, src, kind, reading, letters ? letters[0] : null, letters ? letters[1] : null, R, rid || null, cut, !!sign]);
    if (R0 && !records[rid]) { records[rid] = [R0.m, (R0.headwords || [])[0] || "", R0.R, R0.year || "S_NO_SOURCE_YEAR"]; recsAll += 1; }
  }
  writeFileSync(join(OUT, `${book}.json`), JSON.stringify({ book, places, records }));
}
const m_sources = {};
for (const ml of ix.m_lines || []) {
  const raw = JSON.parse(ml.raw);
  m_sources[ml.m] = { key: raw.key, label: ml.m === "PIECE:TAHOT" ? "STEPBible TAHOT: the aligned translation's pieces (PIECE:TAHOT)" : "MACULA Hebrew: the morphology's pieces (PIECE:MACULA)", licensePosture: raw.short_label, licensePointer: `${ml.file}#L${ml.line}`, sourceYear: "S_NO_SOURCE_YEAR", from: "piece-store-v2", licence_label: raw.licence_label || "" };
}
writeFileSync(join(OUT, "index.json"), JSON.stringify({ rule: "piece-store-serve-v1-a-claim-carries-no-text-its-english-is-a-slice-of-its-records-d", from: { relay: "FOR-ELIJAH-v77", build: ix.rule, recipe: ix.recipe, date: ix.date }, m_sources, counts: { claims_received: { value: claimsAll, axis: "claims" }, claims: { value: claimsAll - joins, axis: "claims", what: "served: the received claims less the lane's joins" }, joins_not_served: { value: joins, axis: "claims", why: "a whole-word claim naming two or more records is the lane's join of their slices, not a source's reading; its pieces are served", per_source: perSrcJoins }, claims_with_english: { value: withR, axis: "claims" }, records_named: { value: recsAll, axis: "records" }, places: { value: placesAll, axis: "places" }, books: { value: ix.books.length, axis: "books" }, per_source: perSrc } }, null, 1));
console.log(`${OUT}: ${claimsAll} claims (${withR} with English) at ${placesAll} places · ${recsAll} records named · ${ix.books.length} books · sources ${Object.keys(m_sources).join(", ")}`);
