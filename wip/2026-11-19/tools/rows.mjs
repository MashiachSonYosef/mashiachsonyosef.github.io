// rows under a key on the live tree: source id, source name, year, reading, headwords, entries; with a filter on the text
import { join } from "node:path";
const [RD, key, filter] = process.argv.slice(2);
const { openRouteStore, factsOf } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const st = openRouteStore(join(RD, "data/route-store"));
const K = JSON.parse(`"${key}"`);
const re = filter ? new RegExp(filter, "i") : null;
const esc = (t) => String(t).replace(/[֐-׿]/gu, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
const rows = st.routesFor(K) || [];
console.log("rows", rows.length);
for (const r of rows) {
  if (re && !re.test(String(r[1])) && !re.test(String(r[2] || ""))) continue;
  const f = factsOf(r) || {};
  const src = st.index.m_sources[r[3]] || {};
  console.log([r[3], (src.label || src.name || src.title || "").slice(0, 40), r[4], JSON.stringify(String(r[1]).slice(0, 90)), "D:" + JSON.stringify(String(r[2] || "").slice(0, 160)), "heads:" + esc((r[6] || []).slice(0, 2).join("|")), "n:" + (f.n || []).join(","), f.name ? "name" : ""].join(" · "));
}
