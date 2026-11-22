// Ship 16, a probe that reads and writes nothing of the tree: every place a key stands in the zones on disk (the
// books' sections and the commentaries' units), with the unit's own reference and work. Keys are given as code points.
// Usage: node probe-places-of-keys.mjs <reader dir> <code points joined by + , e.g. 5E0+5D2> ...
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const R = process.argv[2];
const keys = process.argv.slice(3).map((x) => String.fromCodePoint(...x.split("+").map((h) => parseInt(h, 16))));
const ZONES = join(R, "data", "zones");
const asCodes = (k) => [...k].map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join(" ");
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin") && !/\.(lattice|volume)\.bin$/u.test(x)).sort()) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  const lists = [];
  for (const sec of z.sections || []) lists.push([sec.ref || sec.id || sec.label || "?", z.work, sec.words || []]);
  for (const [uid, u] of Object.entries(z.units || {})) for (const e of [...(u.section || []), ...Object.values(u.words || {}).flat()]) lists.push([`${uid} (${e.ref || "?"}, ${e.label || e.unit || ""})`, (z.works || [])[e.work] ? z.works[e.work].id : z.work, e.words || []]);
  for (const [where, work, words] of lists) words.forEach((w, i) => {
    const ks = w.w ? w.w.map((r) => r.k) : [w.k];
    for (const k of keys) if (ks.includes(k)) console.log(`${asCodes(k)} · ${f} · ${work} · ${where} · word ${i + 1} · line «${z.gloss ? z.gloss[k] ?? "bare" : "?"}»`);
  });
}
