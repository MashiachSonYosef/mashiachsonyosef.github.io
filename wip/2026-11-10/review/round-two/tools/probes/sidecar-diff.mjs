// What moved in the lattice sidecars between two builds, field by field.
// node sidecar-diff.mjs <dir before> <dir after> [--examples N] [--book slug]
// Reads every <slug>.lattice.bin that stands in both folders. Nothing is written.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const [a, b] = process.argv.slice(2);
const flag = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const EX = Number(flag("--examples", "3"));
const only = flag("--book", null);
const read = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);

const files = readdirSync(a).filter((f) => f.endsWith(".lattice.bin") && existsSync(join(b, f)) && (!only || f === `${only}.lattice.bin`)).sort();
const tot = { files: 0, files_same_bytes: 0, surfaces: 0, surfaces_differ: 0 };
const byField = {};       // field -> { differ, reading, credit, examples: [] }
const topLevel = {};      // top-level key -> files where it differs
const bump = (f) => (byField[f] ||= { differ: 0, reading: 0, credit_only: 0, became_null: 0, was_null: 0, examples: [] });
for (const f of files) {
  tot.files += 1;
  const ba = readFileSync(join(a, f)), bb = readFileSync(join(b, f));
  if (ba.equals(bb)) { tot.files_same_bytes += 1; continue; }
  const A = JSON.parse(gunzipSync(ba).toString("utf8")), B = JSON.parse(gunzipSync(bb).toString("utf8"));
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
    if (k === "grades") continue;
    if (!same(A[k], B[k])) (topLevel[k] ||= []).push(f.replace(".lattice.bin", ""));
  }
  const ga = A.grades || {}, gb = B.grades || {};
  for (const s of new Set([...Object.keys(ga), ...Object.keys(gb)])) {
    tot.surfaces += 1;
    const x = ga[s], y = gb[s];
    if (same(x, y)) continue;
    tot.surfaces_differ += 1;
    if (!x || !y) { bump(x ? "(surface gone)" : "(surface new)").differ += 1; continue; }
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if (k === "o") {
        for (const ok of new Set([...Object.keys(x.o || {}), ...Object.keys(y.o || {})])) {
          const p = (x.o || {})[ok] ?? null, q = (y.o || {})[ok] ?? null;
          if (same(p, q)) continue;
          const e = bump(`o.${ok}`); e.differ += 1;
          if (p && !q) e.became_null += 1; else if (!p && q) e.was_null += 1;
          else if (p[0] !== q[0]) e.reading += 1; else e.credit_only += 1;
          if (e.examples.length < EX) e.examples.push(`${f.replace(".lattice.bin", "")} ${s} (${x.k}): ${JSON.stringify(p)} -> ${JSON.stringify(q)}`);
        }
      } else if (!same(x[k], y[k])) {
        const e = bump(k); e.differ += 1;
        if (e.examples.length < EX) e.examples.push(`${f.replace(".lattice.bin", "")} ${s} (${x.k}): ${JSON.stringify(x[k])} -> ${JSON.stringify(y[k])}`);
      }
    }
  }
}
console.log(`${tot.files} sidecars in both · ${tot.files_same_bytes} the same bytes · ${tot.files - tot.files_same_bytes} differ`);
console.log(`surfaces in the sidecars that differ: ${tot.surfaces.toLocaleString("en-US")} · surfaces that differ: ${tot.surfaces_differ.toLocaleString("en-US")}`);
for (const [k, e] of Object.entries(byField).sort()) {
  console.log(`  ${k}: ${e.differ.toLocaleString("en-US")}${k.startsWith("o.") ? ` (another reading ${e.reading.toLocaleString("en-US")} · the same reading with another credit ${e.credit_only.toLocaleString("en-US")} · became null ${e.became_null} · was null ${e.was_null})` : ""}`);
  for (const x of e.examples) console.log(`      ${x}`);
}
for (const [k, fs] of Object.entries(topLevel).sort()) console.log(`  top-level ${k}: differs in ${fs.length} (${fs.slice(0, 4).join(", ")}${fs.length > 4 ? ", …" : ""})`);
