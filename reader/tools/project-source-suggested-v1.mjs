#!/usr/bin/env node
// project-source-suggested-v1 · the BSB's whole-word rendering at every place, laid on the zone's words
//
// RULE: source-suggested-rule-v1-a-running-bible-reads-the-whole-word-and-is-credited-by-name
// LEDGER: data/source-suggested/<book>.json (this tool), from the corpus lane's
//         moses-source-suggested-v1/v1.1/build/out/source-suggested-bsb/<book>.source-suggested-bsb-v1.1.json
//
// The corpus lane's relay FOR-ELIJAH-v63.1 (Moses, 4 October 2026 AD, READY,
// candidate only): how the Berean Standard Bible's translation tables put the
// WHOLE word into its sentence, one rendering per place, the BSB's own cell
// byte for byte with its leading and trailing spaces, under the BSB's own
// licence words (public domain, 30 April 2023). The owner, 3 October 2026:
// "we can use BSB as primary source suggested".
//
// This reads the lane's 39 files and lays each place on the zone's words:
// place n (zone_word_n, one-based over every entry of the book's words, marks
// included, in section order, as the lane and tools/apply-span-ledger-v1.mjs
// number them) must carry the zone's word byte for byte (the file's s), or the
// place is held and counted, never laid. What is written per place: the
// rendering as the BSB wrote it (untrimmed), its kind (WORDS, DASH,
// THREE_DOTS, VVV, EMPTY, or joined kinds for a place that is several BSB
// words), and the match kind. A place with no rendering (unmatched,
// ambiguous, a BSB word over several places' later parts) is null, with the
// match kind kept in `held` so the card can say why.
//
// Run: node tools/project-source-suggested-v1.mjs --in <dir with the 39 files> [--out data/source-suggested] [--zones data/zones]
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join } from "node:path";

const RULE = "source-suggested-rule-v1-a-running-bible-reads-the-whole-word-and-is-credited-by-name";
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const IN = arg("in"), OUT = arg("out", "data/source-suggested"), ZONES = arg("zones", "data/zones");
if (!IN) { console.log("usage: --in <dir> [--out data/source-suggested] [--zones data/zones]"); process.exit(2); }
const sha = (b) => createHash("sha256").update(b).digest("hex");
mkdirSync(OUT, { recursive: true });
const files = readdirSync(IN).filter((f) => f.endsWith(".source-suggested-bsb-v1.1.json")).sort();
const index = { schema_version: "SOURCE_SUGGESTED_INDEX_V1", rule_id: RULE, candidate_only: true, family: "SOURCE SUGGESTED", m: null, books: {}, totals: { places: 0, laid: 0, held: 0, mismatched: 0 } };
let bad = 0;
for (const f of files) {
  const bytes = readFileSync(join(IN, f));
  const F = JSON.parse(bytes.toString("utf8"));
  const book = F.book;
  const zp = join(ZONES, `${book}.bin`);
  if (!existsSync(zp)) { console.log(`  --  ${book}: no zone`); continue; }
  const zone = JSON.parse(gunzipSync(readFileSync(zp)).toString("utf8"));
  const words = [];
  for (const sec of zone.sections || []) for (const w of sec.words || []) words.push(w);
  if (!index.m) index.m = { label: F.m.label, name: F.m.name, credit_line: F.m.credit_line, licence_text: F.m.licence_text, licence_html: F.m.licence_html, licence_html_note: F.m.licence_line_breaks || null, year: 2023, year_says: "the public-domain dedication the terms page states, 30 April 2023; the wording's own year is not stated", file: F.m.file, m_id: null };
  const places = new Array(words.length).fill(null);
  const held = {};
  let laid = 0, mismatched = 0, heldN = 0;
  const kinds = {}, matches = {};
  for (const p of Object.values(F.places)) {
    const n = p.zone_word_n;
    const w = words[n - 1];
    matches[p.match] = (matches[p.match] || 0) + 1;
    if (!w || w.s !== p.s) { mismatched += 1; continue; }
    if (!Array.isArray(p.bsb) || !p.bsb.length) { heldN += 1; held[String(n)] = p.match; continue; }
    const r = p.bsb.map((b) => b.rendering).join("");
    const k = p.bsb.map((b) => b.rendering_kind).join("+");
    kinds[k] = (kinds[k] || 0) + 1;
    places[n - 1] = p.part ? [r, k, p.match, p.part] : [r, k, p.match];
    laid += 1;
  }
  const out = {
    schema_version: "SOURCE_SUGGESTED_BSB_V1", rule_id: RULE, book, candidate_only: true, family: F.family, credit: F.credit,
    from: { file: f, sha256: sha(bytes), bytes: bytes.length, schema: F.schema, rule: F.rule, relay: "FOR-ELIJAH-v63.1.md" },
    keyed_by: "places[n - 1] for zone word n, one-based over every entry of the book's words, marks included, in section order; null where the BSB gives no rendering (see held)",
    place: "[rendering as the BSB wrote it (its spaces kept), rendering kind, match kind, part?]",
    counts: { words: words.length, places: Object.keys(F.places).length, laid, held: heldN, mismatched, kinds, matches },
    held, places,
  };
  writeFileSync(join(OUT, `${book}.json`), JSON.stringify(out));
  index.books[book] = { places: out.counts.places, laid, held: heldN, mismatched };
  index.totals.places += out.counts.places; index.totals.laid += laid; index.totals.held += heldN; index.totals.mismatched += mismatched;
  if (mismatched) { bad += 1; console.log(`FAIL  ${book}: ${mismatched} places whose word is not the zone's`); }
  else console.log(`  ok  ${book}: ${laid} laid, ${heldN} held, of ${out.counts.places}`);
}
writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 1));
console.log(`\n${Object.keys(index.books).length} books · ${index.totals.laid} laid · ${index.totals.held} held · ${index.totals.mismatched} mismatched`);
process.exit(bad ? 1 : 0);
