#!/usr/bin/env node
// GUARDS: apparatus-baseline-rule-v1-arithmetic-over-positions-cannot-see-a-label-that-is-gone
//
// The check that is not blind to a stripped copy.
//
// Every integrity check either lane holds is arithmetic over positions: row
// counts, C0 spans, first ids, sealed word totals. A stripped copy of a book
// passes all of them, because it has the same rows in the same span starting
// at the same id — it has only lost the source's own class labels, and no
// amount of counting positions can see a label that is gone. Measured on four
// books, copy against copy: i-samuel 11594 positions either way, 184 apparatus
// rows or none; proverbs 6129 either way, 44 or none.
//
// So this compares a census against the recorded baseline, per work, per class,
// and refuses on any drop. It is deliberately one-directional: a count that
// went UP is a richer copy or a repaired capture and is reported, never
// refused. A count that went DOWN is a copy that lost something, and there is
// no benign version of that.
//
// It cannot tell you which copy is canonical — that is a designation the corpus
// lane makes by a recorded rule and a hash over the stream's own bytes. What it
// can do is notice, on the run after, that the copy being read is not the copy
// that was measured. Nothing noticed for a week, twice: eight books called
// flattened that were not, and a twelve percent disagreement between two lanes
// where neither had miscounted.
//
// Run: node tools/check-apparatus-not-stripped-v1.mjs
//        [--baseline data/apparatus-baseline-v1.json]
//        [--census build/mam-apparatus-census-v1.json]
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { APPARATUS_CLASSES } from "./emit-apparatus-baseline-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg("baseline", join(K3, "data", "apparatus-baseline-v1.json"));
const CENSUS = arg("census", join(K3, "build", "mam-apparatus-census-v1.json"));

if (!existsSync(BASE)) { console.log(`SKIPPED — no baseline at ${BASE}`); process.exit(3); }
if (!existsSync(CENSUS)) {
  console.log("SKIPPED — no census on this disk to compare against the baseline. The baseline stands;");
  console.log("          re-run tools/mam-apparatus-census-v1.mjs against the body and check again.");
  process.exit(3);
}

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const base = JSON.parse(readFileSync(BASE, "utf8"));
const census = JSON.parse(readFileSync(CENSUS, "utf8"));

const now = {};
for (const r of census.ledger || []) {
  const labels = {};
  let total = 0;
  for (const c of APPARATUS_CLASSES) if (r.labels && r.labels[c]) { labels[c] = r.labels[c]; total += r.labels[c]; }
  now[r.work] = { labels, total, units: r.units };
}

console.log(`— baseline ${base.emitted_on} · census ${(census.ran_at || "").slice(0, 10)} —`);

// 1 · no work in the baseline has vanished from the census
const gone = Object.keys(base.works).filter((w) => !now[w]);
check("every work the baseline measured is still in the census",
  gone.length === 0,
  gone.length ? `${gone.length} missing — ${gone.slice(0, 4).join(" ")}` : `${Object.keys(base.works).length} works`);

// 2 · no work lost apparatus
const lost = [], gained = [], perClass = [];
for (const [work, b] of Object.entries(base.works)) {
  const n = now[work];
  if (!n) continue;
  if (n.total < b.apparatus_rows) lost.push(`${work} ${b.apparatus_rows} -> ${n.total}`);
  else if (n.total > b.apparatus_rows) gained.push(`${work} ${b.apparatus_rows} -> ${n.total}`);
  for (const c of APPARATUS_CLASSES) {
    const was = b.labels[c] || 0, is = n.labels[c] || 0;
    if (is < was) perClass.push(`${work} ${c} ${was} -> ${is}`);
  }
}
check("no work carries less apparatus than the baseline recorded",
  lost.length === 0,
  lost.length ? `${lost.length} lost — ${lost.slice(0, 4).join(" · ")}` : "none lost");
check("  and no single class dropped inside a work whose total held",
  perClass.length === 0,
  perClass.length ? `${perClass.length} — ${perClass.slice(0, 3).join(" · ")}` : "every class holds");

// 3 · a book that carried apparatus and now carries none is the whole defect
const emptied = Object.entries(base.works)
  .filter(([w, b]) => b.carries_apparatus && now[w] && now[w].total === 0).map(([w]) => w);
check("no work that carried apparatus now carries none",
  emptied.length === 0,
  emptied.length ? `STRIPPED COPY — ${emptied.join(" ")}` : "none emptied");

// 4 · a rise is news, not a fault
if (gained.length) {
  console.log(`\n  ${gained.length} work(s) carry MORE than the baseline — a richer copy or a repaired`);
  console.log("  capture. Not a failure. Re-emit the baseline to adopt them:");
  for (const g of gained.slice(0, 8)) console.log(`    ${g}`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
