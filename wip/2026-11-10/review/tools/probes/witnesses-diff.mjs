// Two witness records: every row that was added, removed, or whose figure or source moved. Read-only.
// node witnesses-diff.mjs <before.json> <after.json>
import { readFileSync } from "node:fs";
const [A, B] = process.argv.slice(2).map((p) => JSON.parse(readFileSync(p, "utf8")));
const key = (r) => `${r.class}|${r.axis}|${r.witness}`;
let same = 0, reworded = 0;
for (const kind of ["books", "sections"]) {
  for (const name of new Set([...Object.keys(A[kind]), ...Object.keys(B[kind])])) {
    const a = new Map(((A[kind][name] || {}).rows || []).map((r) => [key(r), r]));
    const b = new Map(((B[kind][name] || {}).rows || []).map((r) => [key(r), r]));
    for (const [k, r] of b) {
      const o = a.get(k);
      if (!o) console.log(`added    ${kind} ${name}: ${r.axis} ${r.figure} · ${r.witness.slice(0, 40)}`);
      else if (o.figure !== r.figure) console.log(`MOVED    ${kind} ${name}: ${r.axis} ${o.figure} → ${r.figure}`);
      else if (o.source !== r.source) reworded += 1;
      else same += 1;
    }
    for (const [k, r] of a) if (!b.has(k)) console.log(`removed  ${kind} ${name}: ${r.axis} ${r.figure}`);
  }
}
console.log(`${same} rows the same · ${reworded} rows the same figure, their source named anew`);
for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) if (!["books", "sections"].includes(k) && JSON.stringify(A[k]) !== JSON.stringify(B[k])) console.log(`field ${k}: ${A[k] === undefined ? "added" : B[k] === undefined ? "removed" : "changed"}`);
