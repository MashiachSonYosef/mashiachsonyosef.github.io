// Count every mark occurrence in route text by shape; report completeness.
import { loadRows, isMark } from "./common.mjs";
import { analyze } from "./classify.mjs";
export const census = () => {
  const rows = loadRows();
  const cache = new Map();
  const byMark = {}; const unexplained = []; let total = 0; const routeRegion = { list_whole: 0, definition_whole: 0, definition_slice: 0 };
  const examples = {};
  for (const r of rows) {
    let a = cache.get(r.def); if (!a) { a = analyze(r.def); cache.set(r.def, a); }
    const off = r.route === r.def ? 0 : r.def.indexOf(r.route);
    const slice = r.route !== r.def;
    routeRegion[(a.field === "list" ? "list" : "definition") + (slice ? "_slice" : "_whole")]++;
    for (let k = 0; k < r.route.length; k++) {
      const c = r.route[k]; if (!isMark(c)) continue;
      total++;
      const i = off + k;
      let sh = a.shape.get(i);
      if (c === ")" && slice && !a.p.orphan.has(i) && a.p.partner[i] < off) sh = "paren.partner_outside_route";
      byMark[c] ??= { occ: 0, shapes: {} }; byMark[c].occ++;
      if (!sh) { unexplained.push({ key: r.key, mark: c, at: i, win: r.def.slice(Math.max(0, i - 25), i + 25) }); sh = "UNEXPLAINED"; }
      byMark[c].shapes[sh] = (byMark[c].shapes[sh] || 0) + 1;
      (examples[sh] ??= []).length < 3 && examples[sh].push(`${r.key}: ${r.def.slice(Math.max(0, i - 28), i + 28)}`);
    }
  }
  return { rows, cache, total, byMark, unexplained, routeRegion, examples };
};
if (process.argv[1].endsWith("census.mjs")) {
  const { total, byMark, unexplained, routeRegion } = census();
  console.log("total mark occurrences", total, routeRegion);
  for (const [m, v] of Object.entries(byMark).sort((a, b) => b[1].occ - a[1].occ)) console.log(JSON.stringify(m), v.occ, JSON.stringify(v.shapes));
  console.log("unexplained", unexplained.length); for (const u of unexplained.slice(0, 40)) console.log(" ", JSON.stringify(u));
}
