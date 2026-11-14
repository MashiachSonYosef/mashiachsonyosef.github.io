// The names gate the other way, measured on the store's rows: at a word place that is a name, which rows a gate that
// withholds "a row its own source gives as not a name" would reach. Two readings of "its own source gives": (narrow)
// the sources the corpus lane read for names (relay v177's m_ids_read), a row there not listed as a name; (broad) any
// row not listed as a name and carrying no entry of the place. Rows are counted at each name place where the key's
// rows stand in the store, by source: first with every row of the key, then with the rows the entry gate already
// withholds at that place set aside (a row of another entry than the place's); the pointing and stem gates are not
// applied, so these are still upper bounds. It measures; it changes nothing.
// node names-gate-both-ways-reach.mjs <reader dir>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const R = process.argv[2];
const { openRouteStore, factsOf } = await import(pathToFileURL(join(R, "tools", "gloss-store-v1.mjs")).href);
const { placeEntry, bdbEntriesAt, entryVerdict } = await import(pathToFileURL(join(R, "tools", "entry-gate-v1.mjs")).href);
const st = openRouteStore(join(R, "data", "route-store"));
const receipt = JSON.parse(readFileSync(join(R, "data", "names", "names-v1", "receipt-v1.json"), "utf8"));
const READ = new Set(receipt.rows.m_ids_read);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const T = { books: 0, "name places": 0, "name places whose key has rows": 0, "rows at name places (row x place)": 0,
  "  listed as a name": 0, "  of a source read for names, not listed (narrow reach)": 0, "  of a source not read for names": 0,
  "name places the narrow form reaches": 0, "name places where every row of a read source would go": 0,
  "after the entry gate: rows at name places it leaves standing": 0, "after the entry gate: the narrow reach (row x place)": 0, "after the entry gate: name places the narrow form reaches": 0 };
const bySrcAfter = new Map(), distinctAfter = new Set();
const bySrc = new Map(), byKey = new Map(), distinct = new Set();
const dir = join(R, "data", "zones");
for (const f of readdirSync(dir).filter((x) => /^[a-z0-9-]+\.bin$/.test(x) && !x.includes("."+"lattice"))) {
  const zone = gz(join(dir, f));
  if (!zone.sections) continue;
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  if (!namesRead) continue;
  T.books += 1;
  for (const sec of zone.sections) for (const w of sec.words || []) {
    if (w.mark || !w.np || !w.k) continue;
    T["name places"] += 1;
    const rows = st.routesFor(w.k);
    if (!rows || !rows.length) continue;
    T["name places whose key has rows"] += 1;
    let reached = 0, readRows = 0, reachedAfter = 0;
    const place = w.tg ? placeEntry([].concat(w.tg)) : null;
    const bdbHere = place ? bdbEntriesAt(place, rows.map((r) => factsOf(r))) : new Set();
    for (const r of rows) {
      const standsEntry = !place || entryVerdict(factsOf(r), place, bdbHere) !== "other";
      if (standsEntry) {
        T["after the entry gate: rows at name places it leaves standing"] += 1;
        const f2 = factsOf(r) || {};
        if (!f2.name && READ.has(String(r[3]))) { T["after the entry gate: the narrow reach (row x place)"] += 1; reachedAfter += 1; bySrcAfter.set(String(r[3]), (bySrcAfter.get(String(r[3])) || 0) + 1); distinctAfter.add(`${w.k}|${r[0]}|${r[3]}`); }
      }
      T["rows at name places (row x place)"] += 1;
      const facts = factsOf(r) || {};
      const m = String(r[3]);
      if (facts.name) { T["  listed as a name"] += 1; continue; }
      if (!READ.has(m)) { T["  of a source not read for names"] += 1; continue; }
      readRows += 1; reached += 1;
      T["  of a source read for names, not listed (narrow reach)"] += 1;
      bySrc.set(m, (bySrc.get(m) || 0) + 1);
      distinct.add(`${w.k}|${r[0]}|${m}`);
      byKey.set(w.k, (byKey.get(w.k) || 0) + 1);
    }
    if (reached) T["name places the narrow form reaches"] += 1;
    if (reachedAfter) T["after the entry gate: name places the narrow form reaches"] += 1;
    const named = rows.filter((r) => READ.has(String(r[3])) && (factsOf(r) || {}).name).length;
    if (readRows && !named) T["name places where every row of a read source would go"] += 1;
  }
}
for (const [k, v] of Object.entries(T)) console.log(`${v.toLocaleString("en-US").padStart(10)}  ${k}`);
console.log(`${distinct.size.toLocaleString("en-US").padStart(10)}  distinct rows the narrow form reaches`);
console.log(`${distinctAfter.size.toLocaleString("en-US").padStart(10)}  distinct rows the narrow form reaches after the entry gate`);
console.log("\nafter the entry gate, the narrow reach by source (row x place):");
for (const [m, n] of [...bySrcAfter].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(8)}  ${m} ${((st.index.m_sources || {})[m] || {}).key || ""}`);
console.log("\nthe narrow reach by source (row x place):");
for (const [m, n] of [...bySrc].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(8)}  ${m} ${((st.index.m_sources || {})[m] || {}).key || ""}`);
console.log("\nthe keys most reached (row x place):");
for (const [k, n] of [...byKey].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  ${String(n).padStart(8)}  ${k}`);
