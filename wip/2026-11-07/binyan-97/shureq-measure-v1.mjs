// task #41: what moves if a shureq-only headword counts as pointed — over the 39 graded books' surfaces and the store's rows
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore } from "../pt/reader/tools/gloss-store-v1.mjs";
import { gradeRow as oldGrade } from "../pt/reader/tools/pointing-grade-v1.mjs";
import { gradeRow as newGrade } from "./pointing-grade-shureq.mjs";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const store = openRouteStore(`${S}/pt/reader/data/route-store`);
const T = { books: 0, surfaces: 0, row_surface_pairs: 0, n_to_m: 0, n_to_x: 0, other_moves: 0, attested_old: 0, attested_new: 0, newly_attested: 0, withheld_old: 0, withheld_new: 0, surfaces_where_withholding_moves: 0 };
const bySrc = {}; const ex = [];
for (const f of readdirSync(`${S}/pt/reader/data/zones`)) {
  if (!f.endsWith(".lattice.bin")) continue;
  const lat = JSON.parse(gunzipSync(readFileSync(`${S}/pt/reader/data/zones/${f}`)).toString("utf8"));
  T.books += 1;
  for (const [s, gr] of Object.entries(lat.grades || {})) {
    T.surfaces += 1;
    const rows = (store.routesFor(gr.k) || []).filter((r) => store.index.m_sources[r[3]] && Array.isArray(r[6]));
    let aOld = false, aNew = false; const g = [];
    for (const r of rows) { const o = oldGrade(r, s), n = newGrade(r, s); g.push([r, o, n]); if (o === "m") aOld = true; if (n === "m") aNew = true; T.row_surface_pairs += 1;
      if (o !== n) { if (o === "n" && n === "m") T.n_to_m += 1; else if (o === "n" && n === "x") T.n_to_x += 1; else T.other_moves += 1; bySrc[r[3]] = bySrc[r[3]] || { n_to_m: 0, n_to_x: 0 }; bySrc[r[3]][o === "n" && n === "m" ? "n_to_m" : "n_to_x"] += 1; } }
    if (aOld) T.attested_old += 1; if (aNew) T.attested_new += 1; if (!aOld && aNew) { T.newly_attested += 1; if (ex.length < 8) ex.push(`${f.replace(".lattice.bin", "")} ${s}: newly attested by ${g.filter(([, , n]) => n === "m").map(([r]) => r[3] + " «" + r[6][0] + "»").slice(0, 2).join(", ")}`); }
    const wOld = aOld ? g.filter(([, o]) => o === "x").length : 0, wNew = aNew ? g.filter(([, , n]) => n === "x").length : 0;
    T.withheld_old += wOld; T.withheld_new += wNew; if (wOld !== wNew) T.surfaces_where_withholding_moves += 1;
  }
}
console.log(JSON.stringify(T, null, 1));
console.log(JSON.stringify(Object.fromEntries(Object.entries(bySrc).sort((a, b) => (b[1].n_to_m + b[1].n_to_x) - (a[1].n_to_m + a[1].n_to_x)).slice(0, 12))));
for (const e of ex) console.log(e);
