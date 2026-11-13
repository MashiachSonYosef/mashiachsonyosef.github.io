// The stems extension's lines set against the rows they speak of: the route store's rows (the sources the store
// serves) and the rows of the dictionaries beside it (every overlay under data/overlays shaped as a route store).
// For each source: its lines, how many find a row of that source under their key with their rank and route, how
// many find none or more than one, how many carry stems as the source wrote them, how many carry a branch and what
// the branch's own verdict would give, and how many rows of that source on the lines' keys have no line. It also
// says whether one id (m, rank, route) under a key ever stands on two lines. It measures; it changes nothing.
// node stems-extension-met.mjs <reader dir> <row-stems-extension-v1.jsonl>
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [R, FILE] = process.argv.slice(2);
const { openRouteStore } = await import(pathToFileURL(join(R, "tools", "gloss-store-v1.mjs")).href);
const stores = [["the route store", openRouteStore(join(R, "data", "route-store"))]];
const od = join(R, "data", "overlays");
for (const id of existsSync(od) ? readdirSync(od).sort() : []) if (existsSync(join(od, id, "index.json")) && existsSync(join(od, id, "shards"))) stores.push([`the overlay ${id}`, openRouteStore(join(od, id))]);
const homeOf = (m) => stores.filter(([, s]) => (s.index.m_sources || {})[m]).map(([name]) => name);
const rowsOf = (m, k) => stores.flatMap(([, s]) => ((s.index.m_sources || {})[m] ? (s.routesFor(k) || []).filter((r) => r[3] === m) : []));
const T = {};
const t = (m) => (T[m] ||= { lines: 0, "find one row": 0, "find no row": 0, "find several rows": 0, "stems as the source wrote them": 0, "unknown as written": 0, branch: {}, "ids on two lines": 0 });
const seen = new Set(), keysOf = {};
const firstNone = {};
for (const line of readFileSync(FILE, "utf8").split("\n")) {
  if (!line) continue;
  const l = JSON.parse(line);
  const x = t(l.m);
  x.lines += 1;
  const rows = rowsOf(l.m, l.key).filter((r) => r[0] === l.rank && r[1] === l.route);
  x[rows.length === 1 ? "find one row" : rows.length ? "find several rows" : "find no row"] += 1;
  if (!rows.length && !firstNone[l.m]) firstNone[l.m] = `${l.key} rank ${l.rank} «${String(l.route).slice(0, 40)}» (the source has ${rowsOf(l.m, l.key).length} row(s) under that key)`;
  if (Array.isArray(l.stems) && l.stems.length) x["stems as the source wrote them"] += 1; else x["unknown as written"] += 1;
  if (l.branch) {
    const b = (x.branch[l.branch.name] ||= { lines: 0, "the branch gives stems": 0, "the branch gives a verdict with no stems": 0, "the branch gives nothing (null)": 0, options: new Set(), resting: new Set() });
    b.lines += 1;
    const v = l.branch[l.branch.name];
    b[v == null ? "the branch gives nothing (null)" : Array.isArray(v.stems) && v.stems.length ? "the branch gives stems" : "the branch gives a verdict with no stems"] += 1;
    for (const o of l.branch.options || []) b.options.add(o);
    b.resting.add(String(l.branch.resting));
  }
  const id = `${l.m}\u0001${l.key}\u0001${l.rank}\u0001${l.route}`;
  if (seen.has(id)) x["ids on two lines"] += 1;
  seen.add(id);
  (keysOf[l.m] ||= new Set()).add(l.key);
}
for (const [m, x] of Object.entries(T).sort()) {
  let rows = 0; for (const k of keysOf[m]) rows += rowsOf(m, k).length;
  console.log(`${m} · in ${homeOf(m).join(", ") || "NO STORE READ HERE"} · ${x.lines.toLocaleString("en-US")} lines under ${keysOf[m].size.toLocaleString("en-US")} keys · the source's rows on those keys: ${rows.toLocaleString("en-US")}`);
  for (const k of ["find one row", "find no row", "find several rows", "stems as the source wrote them", "unknown as written", "ids on two lines"]) console.log(`   ${String(x[k].toLocaleString("en-US")).padStart(7)}  ${k}`);
  if (firstNone[m]) console.log(`            the first line that finds no row: ${firstNone[m]}`);
  for (const [name, b] of Object.entries(x.branch)) console.log(`   branch ${name}: ${b.lines.toLocaleString("en-US")} lines · gives stems ${b["the branch gives stems"].toLocaleString("en-US")} · a verdict with no stems ${b["the branch gives a verdict with no stems"].toLocaleString("en-US")} · nothing ${b["the branch gives nothing (null)"].toLocaleString("en-US")} · options ${[...b.options].join(", ")} · resting in the file: ${[...b.resting].join(", ")}`);
}
