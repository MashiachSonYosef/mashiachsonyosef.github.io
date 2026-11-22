// Ship 16: for every commentary zone, the keys whose baked line differs between live (S/old) and the new build (S/s13),
// with each place the key stands at and the words around it. Reads only.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [OLD, NEW] = process.argv.slice(2);
const { wordListsOf } = await import(join(NEW, "tools", "zone-walk-v1.mjs"));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const Z = (r) => join(r, "data", "zones");
for (const f of readdirSync(Z(NEW)).filter((x) => x.endsWith(".commentary.bin") || x === "tikkunei-zohar.bin").sort()) {
  const a = gz(join(Z(OLD), f)), b = gz(join(Z(NEW), f));
  const ks = new Set([...Object.keys(a.gloss || {}), ...Object.keys(b.gloss || {})]);
  const moved = [...ks].filter((k) => JSON.stringify((a.gloss || {})[k] ?? null) !== JSON.stringify((b.gloss || {})[k] ?? null));
  if (!moved.length) continue;
  for (const k of moved) {
    let shown = 0;
    for (const words of wordListsOf(b)) {
      words.forEach((w, i) => {
        const keys = w.w ? w.w.map((r) => r.k) : [w.k];
        if (!keys.includes(k) || shown >= 3) return;
        shown += 1;
        const ctx = words.slice(Math.max(0, i - 4), i + 5).map((x, j) => (j === Math.min(4, i) ? `[${x.s || x.k}]` : (x.s || x.k))).join(" ");
        console.log(`${f}\t${k}\t${JSON.stringify((a.gloss || {})[k] ?? null)} -> ${JSON.stringify((b.gloss || {})[k] ?? null)}\t${w.v || w.ref || ""}\t${ctx}`);
      });
    }
    if (!shown) console.log(`${f}\t${k}\t${JSON.stringify((a.gloss || {})[k] ?? null)} -> ${JSON.stringify((b.gloss || {})[k] ?? null)}\t(no place found)`);
  }
}
