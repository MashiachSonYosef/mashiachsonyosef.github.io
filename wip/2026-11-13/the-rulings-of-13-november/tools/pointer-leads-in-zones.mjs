// Where a pointer leads a plain cell: for each served zone, the plain words whose baked lead (gloss[key]) is a
// text the pointer map holds under that key, by whether the map resolves it and why not; set beside the same count
// under an older map. Says why the pointer check finds no word to press.
// node pointer-leads-in-zones.mjs <reader dir> <map now> <map before>
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [reader, nowPath, beforePath] = process.argv.slice(2);
const noDot = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");   // as it prints
const maps = { now: JSON.parse(readFileSync(nowPath, "utf8")), before: JSON.parse(readFileSync(beforePath, "utf8")) };
const zones = join(reader, "data", "zones");
const T = { now: {}, before: {} };
const ex = { now: [], before: [] };
let plain = 0;
for (const f of readdirSync(zones).filter((x) => x.endsWith(".bin") && x.split(".").length === 2).sort()) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(zones, f))).toString("utf8")); } catch { continue; }
  if (!z.sections || !z.gloss) continue;
  for (const sec of z.sections) for (const w of sec.words || []) {
    if (!w.k || w.mark) continue;
    if ((z.spans && z.spans[w.k]) || /־/u.test(w.s || "")) continue;
    const lead = z.gloss[w.k]; if (lead == null) continue;
    plain += 1;
    for (const which of ["now", "before"]) {
      const l = maps[which].keys[w.k]; if (!l) continue;
      const by = z.gloss_m && z.gloss_m[w.k] ? z.gloss_m[w.k].by || [] : [];
      const e = l.find((x) => by.includes(x.m) && noDot(x.t) === noDot(lead)) || l.find((x) => noDot(x.t) === noDot(lead));
      if (!e) { T[which]["the key is in the map, its lead is not a pointer of it"] = (T[which]["the key is in the map, its lead is not a pointer of it"] || 0) + 1; continue; }
      const k = e.resolved ? `resolved (${e.class})` : `not resolved: ${e.why} (${e.class})`;
      T[which][k] = (T[which][k] || 0) + 1;
      if (ex[which].length < 6 && !ex[which].some((x) => x.includes(w.k))) ex[which].push(`${f.replace(".bin", "")} ${sec.label} ${w.k}: «${String(lead).slice(0, 60)}» ${e.resolved ? `-> «${e.resolved.text.slice(0, 40)}»` : e.why}`);
    }
  }
}
console.log(`${plain} plain words with a lead`);
for (const which of ["before", "now"]) {
  console.log(`under the map ${which}:`);
  for (const [k, v] of Object.entries(T[which]).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(7)}  ${k}`);
  for (const x of ex[which]) console.log(`     ${x}`);
}
