// What each zone holds of the two orders the store defines (characters, corpus) and of the switch prices, in two builds.
// node order-columns-count.mjs <zones dir before> <zones dir after>
// Reads every <slug>.bin and <slug>.commentary.bin that stands in both folders. Nothing is written.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const [a, b] = process.argv.slice(2);
const read = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const isZone = (f) => /\.bin$/.test(f) && !/\.(lattice|volume)\.bin$/.test(f);
const files = readdirSync(b).filter((f) => isZone(f) && existsSync(join(a, f))).sort();
const count = (o) => (o && typeof o === "object" ? Object.keys(o).length : 0);
// every number found under a zone's switch weights, summed by its path's last name
const sumLeaves = (o, into, path = "") => {
  if (typeof o === "number") { into[path] = (into[path] || 0) + o; return; }
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) sumLeaves(v, into, Array.isArray(o) ? path : (path ? `${path}.${k}` : k));
};
const tot = {};
const add = (kind, side, name, n) => { ((tot[kind] ||= {})[side] ||= {})[name] = (((tot[kind] || {})[side] || {})[name] || 0) + n; };
const weightKeys = new Set();
for (const f of files) {
  const kind = /\.commentary\.bin$/.test(f) ? "commentary" : "book";
  const A = read(join(a, f)), B = read(join(b, f));
  for (const [side, z] of [["before", A], ["after", B]]) {
    add(kind, side, "files", 1);
    add(kind, side, "gloss", count(z.gloss));
    add(kind, side, "gloss_m", count(z.gloss_m));
    add(kind, side, "orders.characters", count((z.gloss_orders || {}).characters));
    add(kind, side, "orders.corpus", count((z.gloss_orders || {}).corpus));
    // the switch prices: per source (summed over the sources by the field's own name) and the joint record
    const tg = ((z.emitted_from || {}).toggles || {}).sources || null;
    if (tg) {
      weightKeys.add("emitted_from.toggles.sources");
      for (const src of Object.values(tg.sources || {})) for (const [k, v] of Object.entries(src)) if (typeof v === "number") add(kind, side, `switch per source, summed over the sources: ${k}`, v);
      // the joint record prices each set of switches thrown together; summed over the sets by the field's own name
      const sets = Object.values((tg.joint || {}).sets || {});
      add(kind, side, "switch sets", sets.length);
      for (const set of sets) for (const [k, v] of Object.entries(set)) if (typeof v === "number") add(kind, side, `switch sets, summed: ${k}`, v);
    }
  }
}
for (const kind of Object.keys(tot)) {
  console.log(`== ${kind} zones (${tot[kind].after.files})`);
  const names = [...new Set([...Object.keys(tot[kind].before), ...Object.keys(tot[kind].after)])].filter((n) => n !== "files").sort();
  for (const n of names) {
    const p = tot[kind].before[n] || 0, q = tot[kind].after[n] || 0;
    console.log(`  ${n}: ${p.toLocaleString("en-US")} -> ${q.toLocaleString("en-US")}${p === q ? "  (the same)" : ""}`);
  }
}
console.log(`fields read as switch prices: ${[...weightKeys].join(", ") || "none found by name"}`);
