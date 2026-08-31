#!/usr/bin/env node
// GUARDS: apparatus-baseline-rule-v1-arithmetic-over-positions-cannot-see-a-label-that-is-gone
//
// What the source's own labels said, per book, written down so a later read
// can be compared against it.
//
// The defect this exists for. One work may hold several stream copies under one
// filename — the ten-hex content hash inside that filename included, which
// therefore identifies nothing. Copies of a book can carry the SAME row count,
// the SAME C0 span and the SAME first id, and differ only in whether MAM's own
// class labels survived the capture. Measured across four books:
//
//   i-samuel   11594 positions   copy A: 0 apparatus   copy B: 184
//   proverbs    6129 positions   copy A: 0             copy B:  44
//   micah       1266 positions   copy A: 0             copy B:  16
//   zephaniah    670 positions   copy A: 0             copy B:   5
//
// Row count matches. Span matches. The seal passes. A book can lose its entire
// apparatus and not one check either lane holds will fire, because every one of
// them is arithmetic over positions, and arithmetic over positions cannot see a
// label that is gone.
//
// The cost of that blindness, already paid twice: eight books were reported
// flattened that are not — the stripped copy was the one read — and two lanes
// counting the same corpus differed by twelve percent for a week without either
// having miscounted.
//
// So this records the apparatus itself: per work, per class, what the labels
// said. It is not a designation of which copy is canonical — that is the corpus
// lane's to make, by a recorded rule and a hash over the stream's own bytes.
// It is the evidence that designation gets checked against.
//
// Emitted from build/mam-apparatus-census-v1.json, which read every Tanakh
// stream the verified body covered. Those figures are the BEST-COPY figures:
// they reproduce exactly when the richest copy of each book is read, and they
// were arrived at without choosing, which is the part that needs fixing.
//
// Run: node tools/emit-apparatus-baseline-v1.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const CENSUS = arg("census", join(K3, "build", "mam-apparatus-census-v1.json"));
const OUT = arg("out", join(K3, "data", "apparatus-baseline-v1.json"));

export const BASELINE_RULE_ID =
  "apparatus-baseline-rule-v1-arithmetic-over-positions-cannot-see-a-label-that-is-gone";

// the classes that are apparatus — the source describing its own marks
export const APPARATUS_CLASSES = [
  "mam-spi-pe", "mam-spi-samekh", "mam-spi-invnun",
  "mam-kq-k", "mam-kq-q", "mam-kq-trivial", "mam-implicit-maqaf",
];

// Everything below runs only when this file is the program. It used to run on
// import, and the checker imports it for one constant — so importing it
// regenerated the baseline, from the checker's own --census argument, and then
// the checker compared that baseline against the same file and passed. It
// passed against a census stripped on purpose. A check that rebuilds its own
// baseline cannot fail, and a tool with side effects at import is how that
// happens without anyone writing it down.
if (import.meta.url !== `file://${process.argv[1]}`) {
  // imported for APPARATUS_CLASSES and BASELINE_RULE_ID; write nothing
} else {

if (!existsSync(CENSUS)) {
  console.log(`SKIPPED — no census at ${CENSUS}; run tools/mam-apparatus-census-v1.mjs first`);
  process.exit(3);
}

const census = JSON.parse(readFileSync(CENSUS, "utf8"));
const works = {};
for (const r of census.ledger || []) {
  const labels = {};
  let total = 0;
  for (const c of APPARATUS_CLASSES) if (r.labels && r.labels[c]) { labels[c] = r.labels[c]; total += r.labels[c]; }
  works[r.work] = {
    units: r.units, tokens: r.tokens, apparatus_rows: total,
    labels,
    // which copy these figures came out of, when the census recorded it. A
    // figure with no copy behind it is not reproducible: the same book can be
    // read from a stream that kept the source labels or one that discarded
    // them, and nothing in the filename tells the two apart.
    read_from: r.read_from || null,
    copy_identified: Boolean(r.read_from && (r.read_from.shards || []).length),
    // a book whose labels are all gone is either genuinely flat or a stripped
    // copy, and this record cannot tell those apart — it says which it saw
    carries_apparatus: total > 0,
  };
}

// A work carrying no apparatus label is one of two things this record cannot
// tell apart: a MAM book whose marks were stripped from the copy that was read,
// and a work that never had MAM marks at all because it is not MAM's text —
// Rashi, Ibn Ezra, Onkelos and Targum Neofiti are all in this family and none
// of them was ever going to carry a petuchah of MAM's. Saying "56 works carry
// no apparatus" as though it were one finding would repeat, in a record, the
// exact error that cost two lanes a week: eight books called flattened that
// were not. So the list is published as what it is — the works whose labels
// this census did not see — and the question of which of them LOST something
// is left to the corpus lane, which holds the copies.
const flat = Object.entries(works).filter(([, w]) => !w.carries_apparatus).map(([k]) => k).sort();
const totals = {};
for (const w of Object.values(works)) for (const [c, n] of Object.entries(w.labels)) totals[c] = (totals[c] || 0) + n;

const record = {
  schema: "apparatus-baseline-v1",
  rule_id: BASELINE_RULE_ID,
  emitted_by: "tools/emit-apparatus-baseline-v1.mjs",
  emitted_on: new Date().toISOString().slice(0, 10),
  derived_from: {
    census: "build/mam-apparatus-census-v1.json",
    census_ran_at: census.ran_at,
    census_sha256: createHash("sha256").update(readFileSync(CENSUS)).digest("hex"),
    source: census.source,
  },
  what_this_is:
    "what the source's own class labels said, per work, at the time of the census. Not a designation "
    + "of the canonical copy — that is the corpus lane's, by a recorded rule and a hash over the "
    + "stream's own bytes. This is what such a designation gets checked against.",
  standing_caveat:
    "these are the best-copy figures. They reproduce exactly when the richest copy of each book is "
    + "read, and they were arrived at without choosing a copy, which is the part that needs fixing.",
  counts: {
    works: Object.keys(works).length,
    works_whose_copy_is_identified: Object.values(works).filter((w) => w.copy_identified).length,
    works_carrying_apparatus: Object.values(works).filter((w) => w.carries_apparatus).length,
    works_carrying_none: flat.length,
    apparatus_rows: Object.values(works).reduce((n, w) => n + w.apparatus_rows, 0),
    by_class: totals,
  },
  works_whose_labels_this_census_did_not_see: {
    note:
      "NOT a list of flattened books. It mixes two causes this record cannot separate: a MAM book "
      + "whose marks were stripped from the copy that was read, and a work that never carried MAM's "
      + "marks because it is not MAM's text — Rashi, Ibn Ezra, Onkelos and Targum Neofiti are all "
      + "here and none was ever going to carry a petuchah of MAM's. Which of these lost something is "
      + "the corpus lane's to say, because it holds the copies. Calling this list flattened would "
      + "repeat in a record the error that already cost a week: eight books reported flattened that "
      + "were not, because the stripped copy was the one read.",
    works: flat,
  },
  works,
};

writeFileSync(OUT, JSON.stringify(record, null, 1));
console.log(`${record.counts.works} works · ${record.counts.apparatus_rows} apparatus rows`);
console.log(`  carrying apparatus: ${record.counts.works_carrying_apparatus}`);
console.log(`  carrying none:      ${record.counts.works_carrying_none}`);
console.log(`  by class: ${JSON.stringify(totals)}`);
console.log(`written to ${OUT}`);

}
