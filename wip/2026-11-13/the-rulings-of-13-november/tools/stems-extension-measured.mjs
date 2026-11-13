// What the stems extension would withhold, measured on every word place of the books before anything is wired. A
// place is asked its stem where its pointed surface carries stems in the book's sidecar. For each such place the
// rows of its key are gated as the page gates them (the store's rows: the entry, the name, the pointing; a row
// beside the store: the pointing alone), and of the rows left, those the extension gives stems are set against the
// place's stems by family:
//   kept       the row's stems share a family with the place's
//   withheld   they share none (a reading of another stem)
// Counted by source, with the pairs (the row's stems against the place's) that withhold most, and the stem names
// the extension brings that are no family's member and that no place carries, so a row holding only such names is
// another stem's everywhere. It measures; it changes nothing.
// node stems-extension-measured.mjs <reader dir> <row-stems-extension-v1.jsonl> [--top=N]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [R, FILE] = process.argv.slice(2);
const TOP = Number((process.argv.find((a) => a.startsWith("--top=")) || "--top=30").slice(6));
const tool = (name) => import(pathToFileURL(join(R, "tools", name)).href);
const { openRouteStore, factsOf } = await tool("gloss-store-v1.mjs");
const { placeEntry, bdbEntriesAt, entryVerdict } = await tool("entry-gate-v1.mjs");
const { nameWithheld } = await tool("names-gate-v1.mjs");
const { gradeRow } = await tool("pointing-grade-v1.mjs");
const { isOtherStem, stemFamily, STEM_FAMILY } = await tool("stem-family-v1.mjs");
const { readStemsExtension, stemsId } = await tool("stems-extension-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const store = openRouteStore(join(R, "data", "route-store"));
const beside = [];
const od = join(R, "data", "overlays");
for (const id of existsSync(od) ? readdirSync(od).sort() : []) if (existsSync(join(od, id, "index.json")) && existsSync(join(od, id, "shards"))) beside.push(openRouteStore(join(od, id)));
const ext = readStemsExtension(FILE);
const stemsOf = new Map();   // key -> Map(id -> stems)
const names = new Map();     // stem name -> rows carrying it
for (const l of ext.lines) {
  if (!l.stems.length) continue;
  if (!stemsOf.has(l.key)) stemsOf.set(l.key, new Map());
  stemsOf.get(l.key).set(stemsId(l.m, l.rank, l.route), l.stems);
  for (const s of l.stems) names.set(s, (names.get(s) || 0) + 1);
}
const T = { books: 0, "word places": 0, "places asked their stem (the surface carries stems)": 0, "of those, places whose key holds a row the extension gives stems": 0, "places where the extension withholds a row the gates before it leave": 0 };
const bySource = {};
const src = (m) => (bySource[m] ||= { "rows left by the gates before, place by place": 0, kept: 0, withheld: 0, "places with a row withheld": 0 });
const pairs = new Map(), placeFamilies = new Set(), placeNames = new Set();
const held = new Map();
const rowsOf = (k) => { if (!held.has(k)) { const s = (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]); const o = beside.flatMap((b) => (b.routesFor(k) || []).filter((r) => b.index.m_sources[r[3]])); held.set(k, { s, o, facts: s.map(factsOf) }); } return held.get(k); };
const zonesDir = join(R, "data", "zones");
for (const f of readdirSync(zonesDir).filter((x) => x.endsWith(".lattice.bin")).sort()) {
  const z = f.slice(0, -".lattice.bin".length);
  const zone = gz(join(zonesDir, `${z}.bin`)), side = gz(join(zonesDir, f));
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  T.books += 1;
  for (const sec of zone.sections) for (const w of sec.words || []) {
    if (w.mark) continue;
    T["word places"] += 1;
    const g = (side.grades || {})[w.s];
    const st = g && Array.isArray(g.st) && g.st.length ? g.st : null;
    if (!st || !w.k) continue;
    T["places asked their stem (the surface carries stems)"] += 1;
    for (const x of st) { placeNames.add(x); placeFamilies.add(stemFamily(x)); }
    const mine = stemsOf.get(w.k);
    if (!mine) continue;
    T["of those, places whose key holds a row the extension gives stems"] += 1;
    const { s, o, facts } = rowsOf(w.k);
    const grades = s.map((r) => gradeRow(r, w.s));
    const attested = grades.includes("m");
    const place = w.tg ? placeEntry([].concat(w.tg)) : null;
    const bdbHere = place ? bdbEntriesAt(place, facts) : null;
    const isName = !namesRead || !!w.np;
    const left = [];
    s.forEach((r, j) => {
      const v = place ? entryVerdict(facts[j], place, bdbHere) : "none";
      if (v === "other" || nameWithheld(facts[j], isName)) return;
      if (v !== "this" && attested && grades[j] === "x") return;
      left.push(r);
    });
    for (const r of o) if (!(attested && gradeRow(r, w.s) === "x")) left.push(r);
    const hit = new Set();
    for (const r of left) {
      const rs = mine.get(stemsId(r[3], r[0], r[1]));
      if (!rs) continue;
      const t = src(r[3]);
      t["rows left by the gates before, place by place"] += 1;
      if (isOtherStem(rs, st)) { t.withheld += 1; hit.add(r[3]); const id = `${rs.join("+")} against ${st.join("+")}`; pairs.set(id, (pairs.get(id) || 0) + 1); } else t.kept += 1;
    }
    for (const m of hit) src(m)["places with a row withheld"] += 1;
    if (hit.size) T["places where the extension withholds a row the gates before it leave"] += 1;
  }
}
for (const [k, v] of Object.entries(T)) console.log(`${v.toLocaleString("en-US").padStart(9)}  ${k}`);
console.log("\nby source (rows counted place by place):");
for (const [m, t] of Object.entries(bySource).sort()) console.log(`  ${m.padEnd(4)} ${String((store.index.m_sources[m] || (beside.map((b) => b.index.m_sources[m]).find(Boolean)) || {}).label || "").slice(0, 50).padEnd(50)} left ${t["rows left by the gates before, place by place"].toLocaleString("en-US").padStart(9)} · kept ${t.kept.toLocaleString("en-US").padStart(9)} · withheld ${t.withheld.toLocaleString("en-US").padStart(9)} · places with a row withheld ${t["places with a row withheld"].toLocaleString("en-US").padStart(7)}`);
const list = [...pairs].sort((a, b) => b[1] - a[1]);
console.log(`\n${list.length.toLocaleString("en-US")} pairs of a row's stems against a place's that withhold. The first ${Math.min(TOP, list.length)} by rows:`);
for (const [id, n] of list.slice(0, TOP)) console.log(`  ${String(n.toLocaleString("en-US")).padStart(9)} · ${id}`);
console.log(`\nthe stem names the places carry: ${[...placeNames].sort().join(", ")}`);
const lone = [...names].filter(([s]) => !Object.prototype.hasOwnProperty.call(STEM_FAMILY, s) && !placeFamilies.has(s)).sort((a, b) => b[1] - a[1]);
console.log(`\nstem names the extension brings that are no family's member and that no place carries (a row holding only such names is another stem's wherever it stands): ${lone.length}`);
for (const [s, n] of lone) console.log(`  ${String(n).padStart(6)} rows · ${s}`);
const mapped = [...names].filter(([s]) => Object.prototype.hasOwnProperty.call(STEM_FAMILY, s) || placeFamilies.has(s)).sort((a, b) => b[1] - a[1]);
console.log(`\nand those that are a family's member or a place's own name: ${mapped.map(([s, n]) => `${s} ${n}${STEM_FAMILY[s] ? ` (${STEM_FAMILY[s]}'s)` : ""}`).join(" · ")}`);
