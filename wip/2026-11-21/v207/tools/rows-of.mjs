// the rows under a key in two stores, side by side: rank, source, year, words. Usage: rows-of.mjs <reader A> <reader B> <key code points, hex, space separated>...
import { join } from "node:path";
const [A, B, ...keys] = process.argv.slice(2);
const open = async (R) => (await import(join(R, "tools", "gloss-store-v1.mjs"))).openRouteStore(join(R, "data", "route-store"));
const a = await open(A), b = await open(B);
for (const hex of keys) {
  const k = String.fromCodePoint(...hex.split("-").map((h) => parseInt(h, 16)));
  const ra = a.routesWhole(k) || [], rb = b.routesWhole(k) || [];
  const id = (r) => `${r[0]}\u0001${r[3]}\u0001${r[1]}`;
  const inA = new Set(ra.map(id));
  console.log(`== ${k} · ${ra.length} rows before, ${rb.length} after`);
  for (const r of rb) console.log(`  ${inA.has(id(r)) ? " " : "+"} #${r[0]} ${r[3]} ${r[4]} «${String(r[1]).slice(0, 60)}»${r[5] ? " cut" : ""}`);
}
