// Run the census under a label mode and diff every shape count against the draft's claims.
import { readFileSync, writeFileSync } from "node:fs";
import { useLabels } from "./classify.mjs";
import { census } from "./census.mjs";
const mode = process.argv[2] || "own"; useLabels(mode);
const claimed = JSON.parse(readFileSync(new URL("./claimed.json", import.meta.url), "utf8"));
const { total, byMark, unexplained, routeRegion } = census();
const diffs = []; let occOk = true;
for (const [m, v] of Object.entries(byMark)) {
  if (claimed.occurrences[m] !== v.occ) { occOk = false; diffs.push({ mark: m, occurrences: v.occ, claimed: claimed.occurrences[m] }); }
  const keys = new Set([...Object.keys(v.shapes), ...Object.keys(claimed[m] || {})]);
  for (const k of keys) { const mine = v.shapes[k] || 0, theirs = (claimed[m] || {})[k] || 0; if (mine !== theirs) diffs.push({ mark: m, shape: k, mine, claimed: theirs, delta: mine - theirs }); }
}
const out = { mode, total, routeRegion, occurrences_match: occOk, shapes: Object.fromEntries(Object.entries(byMark).map(([m, v]) => [m, v.shapes])), diffs, unexplained };
writeFileSync(new URL(`./counts-${mode}.json`, import.meta.url), JSON.stringify(out, null, 1));
console.log("mode", mode, "total", total, routeRegion, "occurrences match", occOk, "unexplained", unexplained.length);
for (const d of diffs) console.log(JSON.stringify(d));
