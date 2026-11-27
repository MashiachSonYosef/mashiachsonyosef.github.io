// Read-only: what English Wiktionary's own records (as the dictionary store serves them, field D) say of each entry:
// part of speech, etymology number, the tags on each sense.
import { readFileSync, readdirSync } from "node:fs"; import { gunzipSync } from "node:zlib"; import { join } from "node:path";
const R = process.argv[2]; const dir = join(R, "data", "dictionary-store", "shards");
const want = new Set(["M13", "M25", "M11", "M50", "M69", "M60", "M72", "M177"]);
const seen = new Set(); let recs = 0, withPos = 0, withEty = 0, senses = 0; const pos = {}, tags = {}; let sensesTagged = 0; let ex = null; const keysOfD = {};
for (const f of readdirSync(dir)) {
  const body = JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8"));
  for (const v of Object.values(body)) for (const r of v.records || []) {
    if (!want.has(r.m) || seen.has(r.rid) || !r.D || r.D[0] !== "{") continue; seen.add(r.rid);
    let j; try { j = JSON.parse(r.D); } catch { continue; }
    recs += 1; for (const k of Object.keys(j)) keysOfD[k] = (keysOfD[k] || 0) + 1;
    if (j.pos) { withPos += 1; pos[j.pos] = (pos[j.pos] || 0) + 1; }
    if (j.etymology_number) withEty += 1;
    for (const s of j.senses || []) { senses += 1; if (s.tags && s.tags.length) sensesTagged += 1; for (const t of s.tags || []) tags[t] = (tags[t] || 0) + 1; }
    if (!ex && (j.senses || []).some((s) => (s.tags || []).includes("Biblical-Hebrew"))) ex = JSON.stringify(j).slice(0, 1500);
  }
}
console.log(JSON.stringify({ recs, withPos, withEty, senses, sensesTagged, keysOfD }, null, 0));
console.log("pos", JSON.stringify(Object.entries(pos).sort((a, b) => b[1] - a[1]).slice(0, 25)));
console.log("tags", JSON.stringify(Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 70)));
console.log(ex);
