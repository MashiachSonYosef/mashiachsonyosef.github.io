// Ship 13: at one pointed surface of a book, the cards the sidecar says name its first verse, the store rows behind each, and the pool's groups in order.
// node cites-at.mjs <reader dir> <book> <key>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [reader, book, key] = process.argv.slice(2);
const { openRouteStore } = await import(join(reader, "tools/gloss-store-v1.mjs"));
const { fnv1a } = await import(join(reader, "tools/lattice-lib-v1.mjs"));
const { readKinds, restsOffIn } = await import(join(reader, "tools/dictionary-kinds-v1.mjs"));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const side = gz(join(reader, "data/zones", `${book}.lattice.bin`)), zone = gz(join(reader, "data/zones", `${book}.bin`));
const kinds = readKinds(join(reader, "data"));
const atRest = restsOffIn(kinds.rec, zone);
for (const [label, store] of [["the store whole", openRouteStore(join(reader, "data/route-store"))], ...(atRest ? [["the store at rest", openRouteStore(join(reader, "data/route-store"), { atRest: true, signLast: true })]] : [])]) {
  const rows = store.routesFor(key) || [];
  const f = side.routes[key].f;
  const ixOf = (row) => { const src = store.index.m_sources[row[3]]; return src ? f.indexOf(fnv1a(`${row[1]}|${src.label}`)) : -1; };
  console.log(`\n== ${label}: ${rows.length} rows under the key, ${f.length} cards`);
  for (const [surface, gr] of Object.entries(side.grades)) {
    if (gr.k !== key) continue;
    console.log(`  surface ${surface} · n ${JSON.stringify(gr.n)} · o.c ${JSON.stringify((gr.o.c || []).slice(0, 2))}`);
    for (const ix of gr.n) { const hit = rows.filter((r) => ixOf(r) === ix); console.log(`    card ${ix}: ${hit.length ? hit.map((r) => `«${String(r[1]).slice(0, 60)}» ${r[3]} ${(store.index.m_sources[r[3]] || {}).label.slice(0, 30)}`).join(" | ") : "no row of this store"}`); }
    const pool = store.readingPool(rows, "oldest");
    pool.slice(0, 40).forEach((g, i) => { const car = store.carriersOf(rows, g.text); const cards = car.map(ixOf).filter((x) => x >= 0); const cites = cards.some((x) => gr.n.includes(x)); if (cites || i < 3) console.log(`    group ${i} «${g.text}» carriers ${car.map((r) => r[3]).join(",")} cards ${cards.join(",")}${cites ? "  <- CITES" : ""}`); });
    break;
  }
}
