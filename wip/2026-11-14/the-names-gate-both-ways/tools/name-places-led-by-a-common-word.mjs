// Name places whose leader under "only this pointing" (what shows at rest where the place has no reading of its own,
// and under "oldest first") is not a reading any row listed as a name prints, while a row listed as a name stands
// among the key's rows: Rimmon's case (relay v177's names gate, the owner's call of 14 November). Counted with the
// leader's carriers, by whether those carriers are of a source the corpus lane read for names. It measures only.
// node name-places-led-by-a-common-word.mjs <reader dir>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const R = process.argv[2];
const { openRouteStore, factsOf, printedForm } = await import(pathToFileURL(join(R, "tools", "gloss-store-v1.mjs")).href);
const { onlyLeaders } = await import(pathToFileURL(join(R, "tools", "place-leaders-v1.mjs")).href);
const st = openRouteStore(join(R, "data", "route-store"));
const READ = new Set(JSON.parse(readFileSync(join(R, "data", "names", "names-v1", "receipt-v1.json"), "utf8")).rows.m_ids_read);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const low = (t) => printedForm(t).toLowerCase();
const T = { "name places with a leader": 0, "  led by a reading a name row prints": 0, "  led by another reading, no name row on the key": 0,
  "  led by another reading while a name row stands on the key (Rimmon's case)": 0, "    its carriers all of sources read for names": 0, "    some carrier of a source not read for names": 0 };
const eg = new Map(), bySrc = new Map();
const dir = join(R, "data", "zones");
for (const f of readdirSync(dir).filter((x) => x.endsWith(".lattice.bin")).sort()) {
  const z = f.slice(0, -".lattice.bin".length);
  const zone = gz(join(dir, `${z}.bin`)), side = gz(join(dir, f));
  if (!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names)) continue;
  for (const sec of zone.sections) for (const w of sec.words || []) {
    if (w.mark || !w.np || typeof w.s !== "string") continue;
    const gr = (side.grades || {})[w.s];
    const l = onlyLeaders(gr, w.tg || null, true).l;
    if (!l) continue;
    T["name places with a leader"] += 1;
    const rows = st.routesFor(w.k) || [];
    const names = rows.filter((r) => (factsOf(r) || {}).name);
    const said = low(l[0]);
    if (names.some((r) => low(r[1]) === said)) { T["  led by a reading a name row prints"] += 1; continue; }
    if (!names.length) { T["  led by another reading, no name row on the key"] += 1; continue; }
    T["  led by another reading while a name row stands on the key (Rimmon's case)"] += 1;
    const carriers = Array.isArray(l[4]) ? l[4] : [];
    T[carriers.length && carriers.every((m) => READ.has(m)) ? "    its carriers all of sources read for names" : "    some carrier of a source not read for names"] += 1;
    for (const m of carriers) bySrc.set(m, (bySrc.get(m) || 0) + 1);
    const id = `${w.k} «${String(l[0]).slice(0, 70)}» (${carriers.join(" ")}) beside «${String(names[0][1]).slice(0, 40)}»`;
    eg.set(id, (eg.get(id) || 0) + 1);
  }
}
for (const [k, v] of Object.entries(T)) console.log(`${v.toLocaleString("en-US").padStart(9)}  ${k}`);
console.log("\nRimmon's case by the leader's carriers (places):");
for (const [m, n] of [...bySrc].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  ${String(n).padStart(7)}  ${m} ${((st.index.m_sources || {})[m] || {}).key || ""}${READ.has(m) ? " (read for names)" : ""}`);
console.log(`\nRimmon's case: ${eg.size} kinds, the first 25 by places:`);
for (const [id, n] of [...eg].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  ${String(n).padStart(6)}  ${id}`);
