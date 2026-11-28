// Scratch (builder H2): the suite's runs side by side, one line a check: its verdict in each run, how long, and what it
// said first. node h2-suite-table.mjs <run dir> … (each with its summary.json)
import { readFileSync } from "node:fs";
import { join, basename } from "node:path";
const runs = process.argv.slice(2).map((d) => [basename(d), JSON.parse(readFileSync(join(d, "summary.json"), "utf8"))]);
const names = [...new Set(runs.flatMap(([, s]) => Object.keys(s)))].sort();
const short = (v) => (!v ? "-" : v.verdict === "ok" ? "ok" : v.verdict === "skipped" ? "skip" : v.verdict === "not run" ? "not run" : "RED");
const tally = runs.map(() => ({}));
for (const n of names) {
  const cells = runs.map(([, s], i) => { const v = s[n]; const k = short(v); tally[i][k] = (tally[i][k] || 0) + 1; return v ? `${k}${v.seconds !== undefined ? ` ${v.seconds}s` : ""}` : "-"; });
  const said = runs.map(([, s]) => { const v = s[n]; return v && v.verdict !== "ok" ? (v.said || [v.why || ""])[0] : ""; });
  console.log(`${n.padEnd(46)} ${cells.map((c) => c.padEnd(11)).join(" ")} ${said.map((x) => (x || "").replace(/\s+/g, " ").slice(0, 150)).filter(Boolean).join(" || ")}`);
}
runs.forEach(([name], i) => console.log(`${name}: ${JSON.stringify(tally[i])}`));
