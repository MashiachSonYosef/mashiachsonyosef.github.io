// What the served dictionary store holds under one letters key from one source: each record as it stands (its
// headwords, its reading R, and its record text D in full), so that what a source said, and what of it is kept,
// can be read.
// node dictionary-key.mjs <reader dir> <letters key> <source id, e.g. M9> [--max chars of D, default 2400]
// Nothing is written. It prints; it does not judge.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join } from "node:path";
const argv = process.argv.slice(2);
const mi = argv.indexOf("--max"); const MAX = mi >= 0 ? Number(argv[mi + 1]) : 2400; if (mi >= 0) argv.splice(mi, 2);
const [R, key, only] = argv;
const hex = createHash("sha256").update(key, "utf8").digest("hex").slice(0, 2);
let raw = readFileSync(join(R, "data/dictionary-store/shards", `${hex}.bin`));
try { raw = gunzipSync(raw); } catch { /* served plain */ }
const under = JSON.parse(raw.toString("utf8"))[key];
if (!under) { console.log(`nothing under ${key}`); process.exit(0); }
const recs = (under.records || []).filter((r) => !only || r.m === only);
console.log(`under ${key}: ${(under.records || []).length} records, ${recs.length} of ${only || "every source"} · the record's fields: ${recs[0] ? Object.keys(recs[0]).join(" ") : "none"}`);
const seenD = new Set();
for (const r of recs) {
  const d = String(r.D || "");
  const first = !seenD.has(d); seenD.add(d);
  console.log(`\n  ${r.rid} · headwords ${JSON.stringify(r.headwords)} · R ${JSON.stringify(r.R)}`);
  console.log(first ? `  D (${d.length} chars): ${d.slice(0, MAX)}${d.length > MAX ? " …" : ""}` : "  D: the same record text as one above");
}
