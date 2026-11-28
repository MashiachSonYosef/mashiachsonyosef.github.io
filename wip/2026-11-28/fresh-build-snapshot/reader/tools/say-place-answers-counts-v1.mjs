// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It prints counts from the entries' pin; it writes nothing.
//
// say-place-answers-counts-v1
//
// Prints the counts of the fresh build's entries and bridges from PIN.json,
// as tables a person can read: per source what was kept, and per source how
// STEP's tags reach it (tags, and words by their root tag).
//
//   node reader/tools/say-place-answers-counts-v1.mjs [out dir]

import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(process.argv[2] || join(here, "..", "data", "place-answers-v1"));
const p = JSON.parse(readFileSync(join(OUT, "entries", "PIN.json"), "utf8")); // the entries' own pin
const n = (x) => (x || 0).toLocaleString("en-US");
const pad = (s, w) => String(s).padEnd(w);
const padl = (s, w) => String(s).padStart(w);
console.log("SOURCES (file, bytes, sha256)");
for (const [k, s] of Object.entries(p.sources)) for (const f of s.files) if (k !== "our_text") console.log("  " + pad(k, 34) + pad(f.file.slice(0, 58), 60) + padl(n(f.bytes), 12) + "  " + f.sha256);
console.log("  our_text: " + p.sources.our_text.files.length + " zones, " + n(p.our_verses) + " verses");
console.log("\nMADE");
for (const [k, m] of Object.entries(p.made)) console.log("  " + pad(k, 62) + padl(n(m.bytes), 11) + (m.raw_bytes ? "  (" + n(m.raw_bytes) + " unpacked)" : ""));
console.log("\nTAGS: " + n(Object.keys(p.bridge_counts.openscriptures_strongs.tags).reduce((a, h) => a + p.bridge_counts.openscriptures_strongs.tags[h], 0)) + " tags on " + n(p.tag_counts.rows) + " rows, " + n(p.tag_counts.parts) + " tagged parts, " + n(p.tag_counts.root_parts) + " root parts (" + n(p.tag_counts.rows_with_one_root) + " rows with one root, " + p.tag_counts.rows_with_several_roots + " with several, " + p.tag_counts.rows_with_no_root + " with none)");
console.log("\nBRIDGE, per source: tags | words by their root tag (root parts) | all tagged parts");
const HOWS = [["T", "exact, STEP's own lettered number"], ["N", "exact, the number alone"], ["E", "exact, number + Open Scriptures letter"], ["S", "exact, several entries naming one"], ["A", "AMBIGUOUS"], ["0", "absent, no entry"], ["B", "absent, no BDB id"], ["H", "absent, file not on hand"], ["P", "absent, STEP's own prefix/suffix/mark number"]];
for (const [k, c] of Object.entries(p.bridge_counts)) {
  console.log("  " + k);
  for (const [h, name] of HOWS) if (c.tags[h]) console.log("    " + pad(name, 46) + padl(n(c.tags[h]), 8) + padl(n(c.root_parts[h]), 10) + padl(n(c.parts[h]), 10));
}
console.log("\nVERSES of " + n(p.our_verses));
for (const [k, c] of Object.entries(p.verse_bridges)) console.log("  " + pad(k, 30) + "references " + padl(n(c.references), 8) + "  indexed " + padl(n(c.references_indexed), 8) + "  verses cited " + padl(n(c.verses_cited), 7) + "  senses citing " + padl(n(c.senses_citing), 7) + "  entries citing " + padl(n(c.entries_citing), 6));
