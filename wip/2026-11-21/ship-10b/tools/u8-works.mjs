// Per source: the first work holding a U8 pair no unit of the source reads whole, the first holding one a unit reads
// whole, and each such work's pairs by kind. Usage: node u8-works.mjs <reader dir>
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
const lineAt = (bf, n, src) => { const at = bf.places[n - 1], slot = at ? at[SLOT[src]] : 0; if (!slot) return null; if (src === "macula") return linePick(slot) ? slot : null; if (src === "ubs") return linePick(slot[0]) ? slot[0] : null; const p = slot[0], words = p && p[1] ? bf.bdb_words[p[1] - 1] : null; return linePick(words) ? words : null; };
const placesOf = (z) => { const out = []; let n = 0; for (const sec of z.sections || []) { let k = 0; for (const w of sec.words || []) { n += 1; if (!w.mark) { k += 1; out.push({ w, n, label: String(sec.label), at: `${sec.label}:${k}` }); } } } return out; };
const text = (w) => (Array.isArray(w.pg) && w.pg.length && w.pg.every((p) => p && String(p.g || "").trim()) ? w.pg.map((p) => String(p.g).trim()).join("/") : "");
for (const src of ["macula", "ubs", "bdb"]) {
  let part = null, whole = null;
  for (const b of byPlaces) {
    const z = readGz(join(K3, "data", "zones", `${b}.bin`)), bf = readGz(join(DP, IX.books[b].file));
    const units = ((bf.spans || {})[src] || []).map((u) => new Set(u[0]));
    const ps = placesOf(z), pairs = [];
    for (let i = 0; i + 1 < ps.length; i += 1) {
      if (ps[i].label !== ps[i + 1].label || !/-$/u.test(text(ps[i].w)) || /^-/u.test(text(ps[i + 1].w))) continue;
      if ((!ps[i].w.kq && !!lineAt(bf, ps[i].n, src)) === (!ps[i + 1].w.kq && !!lineAt(bf, ps[i + 1].n, src))) continue;
      pairs.push({ at: `${ps[i].at}-${ps[i + 1].at.split(":")[2]}`, t: `${text(ps[i].w)} ${text(ps[i + 1].w)}`, unit: units.some((u) => u.has(ps[i].n) && u.has(ps[i + 1].n)) });
    }
    if (!part && pairs.some((q) => !q.unit)) part = { b, places: IX.books[b].places, pairs };
    if (!whole && pairs.some((q) => q.unit)) whole = { b, places: IX.books[b].places, pairs };
    if (part && (whole || src !== "ubs")) break;
  }
  console.log(src, JSON.stringify({ part, whole }));
}
