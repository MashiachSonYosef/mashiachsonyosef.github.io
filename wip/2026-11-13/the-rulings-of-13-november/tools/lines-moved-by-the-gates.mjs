// The resting lines as recorded (data/resting-lines) in two trees, the tree before the two gates and the tree with
// them, and every line that reads otherwise accounted for by the rows of its word's key in the store with the gates'
// own modules. A line under one word that changed is one of:
//   ENTRY   every row that carries the reading it stood on is another entry's than the place's, and is withheld now
//   NAME    every row that carries it is withheld by the entry or as a name, at least one as a name, at a place that
//           is not one
//   OWN     the reading it stands on now is carried by a row of the place's own entry that its source points
//           otherwise, which the pointing withheld before and which stands now, and no row that carries it was
//           kept before
//   ORDER   one of the rows that carried the reading it stood on is withheld (another entry's, or a name's), and
//           with it out another reading stands first among the rows left
//   other   none of these: listed, to be read
// A line under a cell of several words (a run one card joins) is counted apart. It measures; it changes nothing.
// node lines-moved-by-the-gates.mjs <reader dir before> <reader dir after> [--pairs N]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const argv = process.argv.slice(2);
let PAIRS = 10;
{ const at = argv.indexOf("--pairs"); if (at >= 0) { PAIRS = Number(argv[at + 1]); argv.splice(at, 2); } }
const [BEFORE, AFTER] = argv;
const tool = (name) => import(pathToFileURL(join(AFTER, "tools", name)).href);
const { openRouteStore, factsOf, readingKey } = await tool("gloss-store-v1.mjs");
const { placeEntry, bdbEntriesAt, entryVerdict } = await tool("entry-gate-v1.mjs");
const { nameWithheld } = await tool("names-gate-v1.mjs");
const { gradeRow } = await tool("pointing-grade-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const store = openRouteStore(join(AFTER, "data", "route-store"));
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
const lines = (reader, file) => {
  const d = gz(join(reader, "data", "resting-lines", file));
  const units = new Map();
  d.sections.forEach(([label, us], si) => { for (const [first, count, text] of us) units.set(`${si}\u0001${first}\u0001${count}`, { si, first, count, label, text }); });
  return { work: d.work, units };
};
const T = { works: 0, "lines before": 0, "lines after": 0, "lines only before": 0, "lines only after": 0, "lines that read otherwise": 0, "  under one word": 0, "  under a cell of several words": 0 };
const cause = { ENTRY: 0, NAME: 0, OWN: 0, ORDER: 0, other: 0 };
const pairs = { ENTRY: new Map(), NAME: new Map(), OWN: new Map(), ORDER: new Map(), other: new Map(), cell: new Map() };
const byWork = new Map();
const note = (kind, work, k, a, b, where) => {
  const id = `${k}\u0001${a}\u0001${b}`;
  const m = pairs[kind];
  const x = m.get(id) || m.set(id, { k, a, b, n: 0, first: where }).get(id);
  x.n += 1;
};
for (const file of readdirSync(join(AFTER, "data", "resting-lines")).filter((f) => f.endsWith(".json.gz")).sort()) {
  if (!existsSync(join(BEFORE, "data", "resting-lines", file))) continue;
  const A = lines(BEFORE, file), B = lines(AFTER, file);
  T.works += 1; T["lines before"] += A.units.size; T["lines after"] += B.units.size;
  for (const k of A.units.keys()) if (!B.units.has(k)) T["lines only before"] += 1;
  for (const k of B.units.keys()) if (!A.units.has(k)) T["lines only after"] += 1;
  const zonePath = join(AFTER, "data", "zones", `${file.replace(/\.json\.gz$/u, "")}.bin`);
  const zone = existsSync(zonePath) ? gz(zonePath) : null;
  const namesRead = !!(zone && (((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  let moved = 0;
  for (const [id, b] of B.units) {
    const a = A.units.get(id);
    if (!a || a.text === b.text) continue;
    T["lines that read otherwise"] += 1; moved += 1;
    const where = `${B.work} ${b.label} entry ${b.first}`;
    const w = zone ? ((zone.sections[b.si] || {}).words || [])[b.first] : null;
    if (b.count > 1 || !w || !w.k) { T["  under a cell of several words"] += 1; note("cell", B.work, w ? w.k : "", a.text, b.text, where); continue; }
    T["  under one word"] += 1;
    const rows = rowsOf(w.k);
    const facts = rows.map(factsOf);
    const place = w.tg ? placeEntry([].concat(w.tg)) : null;
    const bdbHere = place ? bdbEntriesAt(place, facts) : null;
    const verdicts = rows.map((r, i) => (place ? entryVerdict(facts[i], place, bdbHere) : "none"));
    const isName = !namesRead || !!w.np;
    const named = rows.map((r, i) => verdicts[i] !== "other" && nameWithheld(facts[i], isName));
    const grades = rows.map((r) => gradeRow(r, w.s));
    const attested = grades.includes("m");
    const keptBefore = (i) => !attested || grades[i] !== "x";
    const carriers = (text) => { const want = readingKey(text); return rows.map((r, i) => i).filter((i) => store.readingPool([rows[i]], "oldest").some((g) => readingKey(g.text) === want)); };
    const c0 = carriers(a.text), c1 = carriers(b.text);
    let kind = "other";
    if (c0.length && c0.every((i) => verdicts[i] === "other")) kind = "ENTRY";
    else if (c0.length && c0.every((i) => verdicts[i] === "other" || named[i]) && c0.some((i) => named[i])) kind = "NAME";
    else if (c1.some((i) => verdicts[i] === "this" && grades[i] === "x") && c1.every((i) => !keptBefore(i))) kind = "OWN";
    else if (c0.some((i) => verdicts[i] === "other" || named[i])) kind = "ORDER";
    cause[kind] += 1;
    note(kind, B.work, w.k, a.text, b.text, where);
  }
  if (moved) byWork.set(B.work, moved);
}
const n = (x) => Number(x).toLocaleString("en-US");
for (const [k, v] of Object.entries(T)) console.log(`${n(v).padStart(9)}  ${k}`);
console.log("\nthe lines under one word, by why they read otherwise:");
const SAYS = { ENTRY: "the reading the line stood on is another entry's than the place's", NAME: "the reading the line stood on is a name's, at a place that is not a name",
  OWN: "a row of the place's own entry, pointed otherwise, stands now and leads",
  ORDER: "one of the rows that carried the reading the line stood on is withheld, and with it out another reading stands first", other: "none of these (listed below, to be read)" };
for (const [k, v] of Object.entries(cause)) console.log(`${n(v).padStart(9)}  ${SAYS[k]}`);
console.log("\nby work:");
console.log([...byWork].sort((x, y) => y[1] - x[1]).map(([w, v]) => `${w} ${n(v)}`).join(" · "));
for (const kind of ["ENTRY", "NAME", "OWN", "ORDER", "other", "cell"]) {
  const list = [...pairs[kind].values()].sort((x, y) => y.n - x.n);
  if (!list.length) continue;
  console.log(`\n${kind === "cell" ? "under a cell of several words" : SAYS[kind]} · ${n(list.length)} pairs of readings; the most frequent:`);
  for (const x of list.slice(0, kind === "other" ? PAIRS * 3 : PAIRS)) console.log(`${n(x.n).padStart(7)} place(s) · ${x.k} · «${String(x.a).slice(0, 60)}» -> «${String(x.b).slice(0, 60)}» · first at ${x.first}`);
}
