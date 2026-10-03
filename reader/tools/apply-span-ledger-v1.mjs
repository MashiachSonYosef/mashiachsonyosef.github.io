// apply-span-ledger-v1 · a zone's divisions are the corpus lane's span ledger, swapped whole
//
// RULE: span-ledger-rule-v1-a-zones-divisions-are-the-corpus-lanes-span-ledger-swapped-whole
// LEDGER: -
// no frame letter. This reads the corpus lane's span ledgers and, when given,
// its piece-gloss files, and rewrites the four span fields (and each word's
// pg) of the zones they name. Run it on a restored shelf, then re-pin.
//
// The corpus lane, relay v59 (2026-10-03), the owner: "lets get that fixed its
// literally the first word we serve". Every zone's span layer was the lane's
// old one, stamped by the retired formula: Genesis spans["בראשית"] was a
// draft_candidate row of formulaic_clitic_candidate_v1, so the card withheld
// the division the sources themselves name (TAHOT and MACULA: ב + ראשית), and
// the same stamp hid the sources' own division at 53,731 places. The fix is
// the lane's data:
//
//   moses-compspan-v13.5/build/spans-ledger/<book>.spans-ledger-v3.json
//     span_roles, span_rules, span_conf and spans replace the zone's four
//     fields TOGETHER: spans index into the file's own lists, and the roles
//     are renamed, so swapping fewer than four would point rows at the wrong
//     names. Nothing else in the zone moves.
//   moses-compspan-v13.5/build/pg/<book>.pg-from-piece-gloss-v4.json (with --pg)
//     each word's pg, keyed by j: one-based over every entry of the book's
//     words, marks included, in section order (the file's joined_on). TAHOT's
//     words are carried byte for byte ("tahot sounds done wrong all around",
//     the owner, relayed). A word whose pieces do not spell its key (for a
//     ketiv/qere pair, either side's) is held: its pg is left as it was and
//     counted.
//
// Each rewritten zone says what it was given under emitted_from.span_ledger,
// with the same descriptors the template slice's receipt carried (forms,
// histogram, derived cells and covers, the roles and provenance tables), so
// check-respan-projection-v1 can recompute them from the table; the slice's
// own receipt (emitted_from.span_layer) no longer describes the table and is
// kept inside the new one as what it replaced; counts.w_regions_with_a_
// component_system is recounted over the new table.
//
// Run: node tools/apply-span-ledger-v1.mjs --ledger <dir> [--pg <dir>] --stamp <stamp> [--zones data/zones] [--only <slug>]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";

const RULE = "span-ledger-rule-v1-a-zones-divisions-are-the-corpus-lanes-span-ledger-swapped-whole";
const arg = (name, dflt = null) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : dflt; };
const LEDGER = arg("ledger"), PG = arg("pg"), STAMP = arg("stamp"), ZONES = arg("zones", "data/zones"), ONLY = arg("only");
const TYPE_ONLY = process.argv.includes("--type-only");
if ((!LEDGER && !TYPE_ONLY) || !STAMP) { console.log("usage: --ledger <dir> [--pg <dir>] --stamp <stamp> [--zones data/zones] [--only <slug>]\n   or: --type-only --stamp <stamp> [--zones data/zones]  (type the post-build record on zones already swapped)"); process.exit(2); }
const sha = (b) => createHash("sha256").update(b).digest("hex");
const letters = (t) => String(t || "").replace(/[^א-ת]/gu, "");

// TYPED on the zone, as every post-build write is (single-pass-exemption-v1):
// who wrote the receipt, which field, why, and when it expires, so the
// receipts check counts it rather than faulting it as anonymous patching.
// Merged with the exemptions the zone already carries. --type-only types it
// on zones swapped before this was written, and changes nothing else.
function typePostBuild(zone, stamp) {
  const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
  const ef = zone.emitted_from;
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  const me = "tools/apply-span-ledger-v1.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : `${pb.by} + ${me}`) : me;
  for (const f of ["emitted_from.span_ledger"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (pb.by_field[f].includes(me) ? pb.by_field[f] : `${pb.by_field[f]} + ${me}`) : me; }
  const why = "the zone's divisions are the corpus lane's span ledger, swapped in whole after the build, and its receipt names the ledger file";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : `${pb.why}; ${why}`) : why;
  const exp = "with this zone's rebuild by a build-zone run that reads the span ledger in its single pass";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : `${pb.expires}; ${exp}`) : exp;
  pb.on = stamp;
  ef.post_build = pb;
}

if (TYPE_ONLY) {
  let typed = 0;
  for (const f of readdirSync(ZONES).filter((x) => /^[a-z0-9-]+\.bin$/u.test(x)).sort()) {
    const zPath = join(ZONES, f);
    let zone;
    try { zone = JSON.parse(gunzipSync(readFileSync(zPath)).toString("utf8")); } catch { continue; }
    if (!zone.emitted_from || !zone.emitted_from.span_ledger) continue;
    if (ONLY && f !== `${ONLY}.bin`) continue;
    typePostBuild(zone, STAMP);
    writeFileSync(zPath, gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 }));
    typed += 1;
  }
  console.log(`${typed} zone(s) carry the span ledger's post-build record`);
  process.exit(0);
}

const books = readdirSync(LEDGER).filter((f) => f.endsWith(".spans-ledger-v3.json")).map((f) => f.replace(/\.spans-ledger-v3\.json$/u, "")).filter((b) => !ONLY || b === ONLY).sort();
let bad = 0;
for (const slug of books) {
  const zPath = join(ZONES, `${slug}.bin`);
  if (!existsSync(zPath)) { console.log(`  --  ${slug}: no zone on this shelf`); continue; }
  const lPath = join(LEDGER, `${slug}.spans-ledger-v3.json`);
  const lBytes = readFileSync(lPath);
  const L = JSON.parse(lBytes.toString("utf8"));
  if (L.book !== slug) { console.log(`FAIL  ${slug}: the ledger names ${L.book}`); bad += 1; continue; }
  if (!Array.isArray(L.span_roles) || !Array.isArray(L.span_rules) || !Array.isArray(L.span_conf) || !L.spans || typeof L.spans !== "object") { console.log(`FAIL  ${slug}: the ledger lacks one of the four fields`); bad += 1; continue; }
  const zBytes = readFileSync(zPath);
  const zText = gunzipSync(zBytes);
  const zone = JSON.parse(zText.toString("utf8"));
  const read = L.zone_read && L.zone_read.sha256;
  const readMatches = read ? (read === sha(zBytes) ? "the zone's bytes" : read === sha(zText) ? "the zone's unzipped bytes" : "neither") : "not stated";
  const before = Object.keys(zone.spans || {}).length;
  zone.span_roles = L.span_roles;
  zone.span_rules = L.span_rules;
  zone.span_conf = L.span_conf;
  zone.spans = L.spans;
  const receipt = {
    rule: RULE,
    stamp: STAMP,
    ledger: { file: basename(lPath), sha256: sha(lBytes), bytes: lBytes.length, schema: L.schema || null, generated: L.generated || null, lane_rule: L.rule || null },
    rows_before: before,
    rows_after: Object.keys(L.spans).length,
    the_ledger_read_this_zone: readMatches,
    relay: "corpus lane v59, 2026-10-03",
  };
  // the piece words, by j
  if (PG) {
    const pPath = join(PG, `${slug}.pg-from-piece-gloss-v4.json`);
    if (!existsSync(pPath)) { receipt.pg = { file: null, why: "no pg file for this book" }; }
    else {
      const pBytes = readFileSync(pPath);
      const P = JSON.parse(pBytes.toString("utf8"));
      if (P.book !== slug || !P.pg) { console.log(`FAIL  ${slug}: the pg file names ${P.book}`); bad += 1; continue; }
      let j = 0, replaced = 0, held = 0, unchanged = 0, cleared = 0;
      const heldAt = [];
      for (const sec of zone.sections || []) for (const w of sec.words || []) {
        j += 1;
        const next = P.pg[String(j)];
        if (!next) { if (w.pg) { delete w.pg; cleared += 1; } continue; }
        // a pair's pieces spell one of its two sides, the written or the read
        const spelled = next.map((p) => letters(p.k)).join("");
        const sides = w.w ? w.w.map((r) => letters(r.k)) : [letters(w.k || w.s)];
        if (!sides.includes(spelled)) { held += 1; if (heldAt.length < 5) heldAt.push(`${sec.label} j${j}`); continue; }
        if (JSON.stringify(w.pg) === JSON.stringify(next)) unchanged += 1; else { w.pg = next; replaced += 1; }
      }
      receipt.pg = { file: basename(pPath), sha256: sha(pBytes), bytes: pBytes.length, positions_in_file: Object.keys(P.pg).length, replaced, unchanged, cleared, held, held_at: heldAt };
      if (zone.piece_gloss && typeof zone.piece_gloss === "object") zone.piece_gloss = { ...zone.piece_gloss, from: basename(pPath), replaced_by: RULE, stamp: STAMP };
    }
  }
  // what the new table is, in the slice receipt's own terms
  const keys = Object.keys(L.spans);
  const hist = {};
  let cells = 0, covers = 0;
  for (const k of keys) { const n = (L.spans[k][0] || []).length; if (!n) continue; hist[n] = (hist[n] || 0) + 1; cells += (n * (n + 1)) / 2; covers += 2 ** (n - 1); }
  receipt.forms_with_a_component_system = keys.length;
  receipt.component_count_histogram = hist;
  receipt.derived_cells = cells;
  receipt.derived_complete_covers = covers;
  receipt.roles = L.span_roles;
  receipt.provenance_fields = { split_rule: L.span_rules, split_confidence: L.span_conf };
  const keysOf = (w) => (w.w ? w.w.map((r) => r.k).filter(Boolean) : w.k ? [w.k] : []);
  let spanned = 0;
  for (const sec of zone.sections || []) for (const w of sec.words || []) for (const k of keysOf(w)) if (L.spans[k]) spanned += 1;
  zone.counts = zone.counts || {};
  receipt.w_regions_with_a_component_system_before = zone.counts.w_regions_with_a_component_system ?? null;
  zone.counts.w_regions_with_a_component_system = spanned;
  zone.emitted_from = zone.emitted_from || {};
  if (zone.emitted_from.span_layer) { receipt.replaced_span_layer = zone.emitted_from.span_layer; delete zone.emitted_from.span_layer; }
  zone.emitted_from.span_ledger = receipt;
  typePostBuild(zone, STAMP);
  writeFileSync(zPath, gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 }));
  console.log(`  ok  ${slug}: spans ${before} -> ${receipt.rows_after} · the ledger read ${readMatches}${receipt.pg ? ` · pg ${receipt.pg.replaced ?? 0} replaced, ${receipt.pg.unchanged ?? 0} unchanged, ${receipt.pg.cleared ?? 0} cleared, ${receipt.pg.held ?? 0} held${receipt.pg.held_at && receipt.pg.held_at.length ? ` (${receipt.pg.held_at.join(", ")})` : ""}` : ""}`);
}
console.log(bad ? `\n${bad} FAILED` : `\n${books.length} zones given the span ledger`);
process.exit(bad ? 1 : 0);
