// Does the letter ever withhold the place's own reading? A place's own reading is TAHOT's pieces at that word, packed
// with "/" as the store packs a divided reading (the page's placeLine). The store row of the aligned source that
// prints that reading under the word's key was read from the same places, so its lettered tags should hold the
// place's tag. Where they do not, the lattice's tag at the place and the ledger's tags for the row disagree, and
// the entry gate would count the place's own reading "of another entry". This counts every tagged place:
//   the place's own row found, and the gate keeps it
//   the place's own row found, and the gate withholds it as another entry (by its number, or by its letter)
//   no row of the aligned source prints the place's reading under the word's key
// It measures; it changes nothing.
// node the-places-own-row-and-the-letter.mjs <reader dir> [--list=N]
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const R = process.argv[2];
const LIST = Number((process.argv.find((a) => a.startsWith("--list=")) || "--list=25").slice(7));
const tool = (name) => import(pathToFileURL(join(R, "tools", name)).href);
const { openRouteStore, factsOf, readingKey } = await tool("gloss-store-v1.mjs");
const { placeEntry, bdbEntriesAt, entryVerdict } = await tool("entry-gate-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const store = openRouteStore(join(R, "data", "route-store"));
const held = new Map();
const rowsOf = (k) => { if (!held.has(k)) { const rows = (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]); held.set(k, { rows, facts: rows.map(factsOf), readings: rows.map((r) => store.readingPool([r], "oldest").map((g) => readingKey(g.text))) }); } return held.get(k); };
const T = { "tagged places whose every piece the lattice glosses": 0, "the place's own row found": 0, "  and the gate keeps it": 0, "  and the gate withholds it by its number": 0, "  and the gate withholds it by its letter": 0, "no row of the aligned source prints the place's reading under the word's key": 0 };
const byLetter = new Map(), byNumber = new Map();
const zonesDir = join(R, "data", "zones");
for (const f of readdirSync(zonesDir).filter((x) => x.endsWith(".lattice.bin")).sort()) {
  const z = f.slice(0, -".lattice.bin".length);
  const zone = gz(join(zonesDir, `${z}.bin`));
  // the aligned source's m id, as the zone's own record names the witness of its pieces
  const who = ((((((zone.emitted_from || {}).toggles || {}).lattice || {}).pieces || {}).witnesses || {}).english_tahot || {}).m;
  if (!who) { console.log(`${z}: the zone names no witness for its pieces; not read`); continue; }
  for (const sec of zone.sections) for (const w of sec.words || []) {
    if (w.mark || !w.tg || !w.k || !Array.isArray(w.pg) || !w.pg.length) continue;
    const parts = w.pg.map((p) => String((p && p.g) || "").trim());
    if (parts.some((t) => !t)) continue;
    T["tagged places whose every piece the lattice glosses"] += 1;
    const want = readingKey(parts.join("/"));
    const { rows, facts, readings } = rowsOf(w.k);
    const mine = rows.map((r, j) => j).filter((j) => rows[j][3] === who && readings[j].includes(want));
    if (!mine.length) { T["no row of the aligned source prints the place's reading under the word's key"] += 1; continue; }
    T["the place's own row found"] += 1;
    const tags = [].concat(w.tg);
    const place = placeEntry(tags);
    if (!place) { T["  and the gate keeps it"] += 1; continue; }
    const bdbHere = bdbEntriesAt(place, facts);
    const full = mine.map((j) => entryVerdict(facts[j], place, bdbHere));
    if (full.some((v) => v !== "other")) { T["  and the gate keeps it"] += 1; continue; }
    const numbered = mine.map((j) => entryVerdict(facts[j], { ...place, lettered: false }, bdbHere));
    const id = `${w.k} at ${tags.join(" ")} · «${parts.join("/")}» · the row's ${JSON.stringify(facts[mine[0]])}`;
    if (numbered.some((v) => v !== "other")) { T["  and the gate withholds it by its letter"] += 1; byLetter.set(id, (byLetter.get(id) || 0) + 1); }
    else { T["  and the gate withholds it by its number"] += 1; byNumber.set(id, (byNumber.get(id) || 0) + 1); }
  }
}
for (const [k, v] of Object.entries(T)) console.log(`${v.toLocaleString("en-US").padStart(9)}  ${k}`);
for (const [name, m] of [["by its letter", byLetter], ["by its number", byNumber]]) {
  const list = [...m].sort((a, b) => b[1] - a[1]);
  console.log(`\nthe place's own row withheld ${name}: ${list.length.toLocaleString("en-US")} kinds. The first ${Math.min(LIST, list.length)}:`);
  for (const [id, n] of list.slice(0, LIST)) console.log(`  ${String(n).padStart(5)} places · ${id.slice(0, 260)}`);
}
