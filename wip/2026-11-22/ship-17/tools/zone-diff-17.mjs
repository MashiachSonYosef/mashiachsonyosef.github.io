// Ship 17 (22 November 2026): each zone the laying wrote, against main's bytes (git HEAD), field by field: what moved
// beyond the pieces of laid places, the bridge's record and the typed write. Reads only. Usage: node zone-diff-17.mjs <repo> <laid-places.json>
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [G, PLACES] = process.argv.slice(2);
const laid = JSON.parse(readFileSync(PLACES, "utf8"));
const changed = execFileSync("git", ["-C", G, "status", "--short", "reader/data/zones"]).toString().split("\n").filter(Boolean).map((l) => l.slice(3));
let pgSet = 0, other = [];
for (const f of changed) {
  const a = JSON.parse(gunzipSync(execFileSync("git", ["-C", G, "show", `HEAD:${f}`], { maxBuffer: 1 << 30 })).toString("utf8"));
  const b = JSON.parse(gunzipSync(readFileSync(join(G, f))).toString("utf8"));
  const book = f.split("/").pop().replace(/\.bin$/u, "");
  const here = new Set(laid.filter((p) => p.book === book).map((p) => `${p.si}:${p.at}`));
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (k === "sections" || k === "emitted_from") continue;
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) other.push(`${book}: ${k}`);
  }
  for (const k of new Set([...Object.keys(a.emitted_from || {}), ...Object.keys(b.emitted_from || {})])) {
    if (k === "spelling_bridge" || k === "post_build") continue;
    if (JSON.stringify(a.emitted_from[k]) !== JSON.stringify(b.emitted_from[k])) other.push(`${book}: emitted_from.${k}`);
  }
  a.sections.forEach((s, si) => (s.words || []).forEach((w, at) => {
    const v = b.sections[si].words[at];
    const { pg: p1, ...r1 } = w, { pg: p2, ...r2 } = v;
    if (JSON.stringify(r1) !== JSON.stringify(r2)) other.push(`${book} ${s.label} entry ${at}: a field other than pg`);
    if (JSON.stringify(p1) !== JSON.stringify(p2)) { if (here.has(`${si}:${at}`) && p1 === undefined) pgSet += 1; else other.push(`${book} ${s.label} entry ${at}: pg moved where nothing was to be laid`); }
  }));
  const { sections: s1, emitted_from: e1, ...x1 } = a, { sections: s2, emitted_from: e2, ...x2 } = b;
  if (s1.length !== s2.length) other.push(`${book}: the count of sections`);
}
console.log(`${changed.length} zones written · pieces set at ${pgSet} words, each a laid place that carried none · anything else moved: ${other.length ? other.slice(0, 8).join(" · ") : "nothing"}`);
