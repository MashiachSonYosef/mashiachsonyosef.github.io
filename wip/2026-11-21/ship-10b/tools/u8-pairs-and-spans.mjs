// U8's pairs (a reading across two words, the hyphen at the end of the first only, the source holding a line at one
// word and not the other), by whether the source's own unit (default-spans-rule-v1) reads both words.
// Usage: node u8-pairs-and-spans.mjs <reader dir>
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
const K3 = process.argv[2], DP = join(K3, "data", "default-picks");
const readGz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const IX = JSON.parse(readFileSync(join(DP, "index.json"), "utf8"));
const BOOKS = Object.keys(IX.books || {}).filter((b) => existsSync(join(K3, "data", "zones", `${b}.bin`)) && existsSync(join(DP, IX.books[b].file)));
const byPlaces = [...BOOKS].sort((a, b) => IX.books[a].places - IX.books[b].places || (a < b ? -1 : 1));
const SLOT = { macula: 1, ubs: 2, bdb: 3 };
const linePick = (t) => typeof t === "string" && /[\p{L}\p{N}]/u.test(t) && t !== "NO DATA YET";
const lineAt = (bf, n, src) => {
  const at = bf.places[n - 1], slot = at ? at[SLOT[src]] : 0;
  if (!slot) return null;
  if (src === "macula") return linePick(slot) ? slot : null;
  if (src === "ubs") return linePick(slot[0]) ? slot[0] : null;
  const p = slot[0], words = p && p[1] ? bf.bdb_words[p[1] - 1] : null;
  return linePick(words) ? words : null;
};
const placesOf = (z) => {
  const out = [];
  let n = 0;
  for (const sec of z.sections || []) { let k = 0; for (const w of sec.words || []) { n += 1; if (!w.mark) { k += 1; out.push({ w, n, label: String(sec.label), at: `${sec.label}:${k}` }); } } }
  return out;
};
const text = (w) => (Array.isArray(w.pg) && w.pg.length && w.pg.every((p) => p && String(p.g || "").trim()) ? w.pg.map((p) => String(p.g).trim()).join("/") : "");
const tally = {};
for (const src of ["macula", "ubs", "bdb"]) {
  tally[src] = { pairs: 0, both: 0, one: 0, none: 0, firstWork: null, firstWorkWithout: null, samples: { both: [], one: [] } };
  for (const b of byPlaces) {
    const z = readGz(join(K3, "data", "zones", `${b}.bin`)), bf = readGz(join(DP, IX.books[b].file));
    const units = ((bf.spans || {})[src] || []).map((u) => ({ ns: u[0], filed: u[1] }));
    const ps = placesOf(z);
    let here = 0, hereWithout = 0;
    for (let i = 0; i + 1 < ps.length; i += 1) {
      if (ps[i].label !== ps[i + 1].label || !/-$/u.test(text(ps[i].w)) || /^-/u.test(text(ps[i + 1].w))) continue;
      if ((!ps[i].w.kq && !!lineAt(bf, ps[i].n, src)) === (!ps[i + 1].w.kq && !!lineAt(bf, ps[i + 1].n, src))) continue;
      here += 1;
      const a = ps[i].n, c = ps[i + 1].n;
      const both = units.find((u) => u.ns.includes(a) && u.ns.includes(c));
      const one = units.find((u) => u.ns.includes(a) !== u.ns.includes(c));
      const cls = both ? "both" : one ? "one" : "none";
      tally[src][cls] += 1;
      if (cls !== "both") hereWithout += 1;
      if (cls !== "none" && tally[src].samples[cls].length < 6) tally[src].samples[cls].push(`${b} ${ps[i].at}-${ps[i + 1].at.split(":")[2]} «${text(ps[i].w)}» «${text(ps[i + 1].w)}» unit ${JSON.stringify((both || one).ns)} filed ${JSON.stringify((both || one).filed)} places ${a},${c}`);
    }
    tally[src].pairs += here;
    if (here && !tally[src].firstWork) tally[src].firstWork = `${b} (${here})`;
    if (hereWithout && !tally[src].firstWorkWithout) tally[src].firstWorkWithout = `${b} (${hereWithout})`;
  }
}
console.log(JSON.stringify(tally, null, 1));
