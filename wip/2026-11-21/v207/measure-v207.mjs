// v207's three landing lists against a store: for each line, whether its hole is empty, whether its own source prints
// its words under its key now, whether another source does, and whether the key is in the store. Reads; writes nothing.
// Usage: node measure-v207.mjs <reader dir with tools and data/route-store> <send-back-v1 dir>
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [R, D] = process.argv.slice(2);
const { openRouteStore } = await import(join(R, "tools", "gloss-store-v1.mjs"));
const store = openRouteStore(join(R, "data", "route-store"));
const spaced = (t) => String(t).replace(/\s+/gu, " ").trim();
const MAQAF = "־";
for (const f of ["landing-own-language-v1.jsonl", "landing-bible-dictionaries-v1.jsonl", "landing-harkavy-v1.jsonl"]) {
  const lines = readFileSync(join(D, f), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const T = {}; const add = (k, n = 1) => { T[k] = (T[k] || 0) + n; };
  const seen = new Map(); const bySrc = {};
  for (const e of lines) {
    add("lines");
    const rows = store.routesWhole(e.key) || [];
    if (!rows.length) add("key not in the store now");
    if (e.key.endsWith(MAQAF)) add("key ends in a maqaf");
    if (e.from_key) add("moved off another key by the list");
    const own = rows.filter((r) => String(r[3]) === e.m && spaced(r[1]) === spaced(e.route));
    if (own.length) add("its own source prints the words now");
    const other = rows.filter((r) => String(r[3]) !== e.m && spaced(r[1]) === spaced(e.route));
    if (other.length) add("another source prints the same words now");
    if (e.rank === null) add("rank null");
    else if (rows.some((r) => Number(r[0]) === e.rank)) add("rank named, a row stands at the hole now");
    else add("rank named, the hole is empty");
    const id = `${e.m}\u0001${e.key}\u0001${e.route}`;
    if (seen.has(id)) add("same source, key and words as an earlier line"); else seen.set(id, 1);
    if (e.facts) add("with facts");
    if (e.cut === 1) add("cut 1");
    if (/[<\[]/u.test(e.route)) add("words carry a bracket");
    add(`year ${e.year}`);
    bySrc[e.source_class || e.work_family || e.m] = (bySrc[e.source_class || e.work_family || e.m] || 0) + 1;
  }
  console.log(f, JSON.stringify(T)); console.log("   by class:", JSON.stringify(bySrc));
}
console.log("store", store.index.store_version, store.index.counts.routes, "rows");
