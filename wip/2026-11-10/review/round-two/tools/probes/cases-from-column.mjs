// The pointed surfaces of a book's words whose key stands in one of the zone's order columns (or in none), as a cases file.
// node cases-from-column.mjs <zone.bin> <column | "all" | "wanted:<column>"> <out.json> [--reader <reader dir>] [--max N]
//   <column>           keys the zone's gloss_orders[column] holds
//   wanted:<column>    keys the store's own projection of that order gives today (needs --reader), whether the zone holds them or not
//   all                every word that stands alone
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [zonePath, which, outPath] = process.argv.slice(2);
const flag = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const MAX = Number(flag("--max", "1000000"));
const z = JSON.parse(gunzipSync(readFileSync(zonePath)).toString("utf8"));
let keys = null;
//   missing:<column>   keys the store's projection gives and the zone's column does not hold (needs --reader)
//   stale:<column>     keys the zone's column holds and the store's projection no longer gives (needs --reader)
if (/^(wanted|missing|stale):/u.test(which)) {
  const R = flag("--reader", null);
  const { openRouteStore } = await import(pathToFileURL(join(R, "tools", "gloss-store-v1.mjs")).href);
  const store = openRouteStore(join(R, "data", "route-store"));
  const rec = JSON.parse(readFileSync(join(R, "data", "source-corpus-v1.json"), "utf8"));
  const corpusOf = (m) => ((rec.witnesses || {})[m] || {}).corpus || null;
  const [mode, col] = [which.slice(0, which.indexOf(":")), which.slice(which.indexOf(":") + 1)];
  const want = store.tableFor(Object.keys(z.gloss || {}), { corpusOf }).deltas[col] || {}, held = (z.gloss_orders || {})[col] || {};
  keys = new Set(mode === "wanted" ? Object.keys(want) : mode === "missing" ? Object.keys(want).filter((k) => !(k in held)) : Object.keys(held).filter((k) => !(k in want)));
} else if (which !== "all") keys = new Set(Object.keys((z.gloss_orders || {})[which] || {}));
const seen = new Set(), out = [];
for (const sec of z.sections || []) for (const w of sec.words || []) {
  if (!w || w.mark || w.w || !w.k || typeof w.s !== "string" || w.presentation_join) continue;
  if (keys && !keys.has(w.k)) continue;
  if (seen.has(w.s)) continue;
  seen.add(w.s); out.push(w.s);
}
// spread across the book rather than its first chapters
const step = Math.max(1, Math.floor(out.length / MAX));
const picked = out.filter((_, i) => i % step === 0).slice(0, MAX);
writeFileSync(outPath, JSON.stringify(picked));
console.log(`${zonePath.split("/").pop()} ${which}: ${keys ? keys.size + " keys · " : ""}${out.length} surfaces standing alone${picked.length < out.length ? `, ${picked.length} taken` : ""} -> ${outPath}`);
