// Two gate receipts, field by field: which fields are the same value and which differ. Read-only.
// node receipt-compare.mjs <before.json> <after.json>
import { readFileSync } from "node:fs";
const [A, B] = process.argv.slice(2).map((p) => JSON.parse(readFileSync(p, "utf8")));
const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])];
for (const k of keys) {
  const a = JSON.stringify(A[k]), b = JSON.stringify(B[k]);
  if (a === b) { console.log(`same     ${k}`); continue; }
  if (A[k] === undefined) { console.log(`added    ${k}: ${b.slice(0, 300)}`); continue; }
  if (B[k] === undefined) { console.log(`removed  ${k}`); continue; }
  const sa = JSON.stringify(Array.isArray(A[k]) ? [...A[k]].sort() : Object.fromEntries(Object.entries(A[k]).sort()));
  const sb = JSON.stringify(Array.isArray(B[k]) ? [...B[k]].sort() : Object.fromEntries(Object.entries(B[k]).sort()));
  console.log(`${sa === sb ? "reordered" : "DIFFERS  "} ${k}: ${a.length} → ${b.length} chars${sa === sb ? "" : ` · ${a.slice(0, 120)} → ${b.slice(0, 120)}`}`);
}
