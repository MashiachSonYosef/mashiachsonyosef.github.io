import { readFileSync } from "node:fs";
const F = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/by-source/openscriptures_strongs.jsonl";
const rows = readFileSync(F, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const c = {}; const inc = (k, n = 1) => (c[k] = (c[k] || 0) + n);
const recs = new Map(); const keys = new Set(); const defs = new Set();
const multi = [];
for (const r of rows) {
  keys.add(r.key); defs.add(r.def);
  const rk = r.key + "\u0001" + r.def;
  if (!recs.has(rk)) recs.set(rk, { slices: 0, n: 0 });
  recs.get(rk).n++;
  if (r.route === r.def) inc("whole"); else if (r.def.includes(r.route)) { inc("slice"); recs.get(rk).slices++; const a = r.def.indexOf(r.route), b = r.def.lastIndexOf(r.route); if (a !== b) inc("slice_multi_offset"); } else inc("absent");
  inc("m:" + r.m); inc("cut:" + r.cut);
  if (r.route !== r.route.trim()) inc("route_untrimmed");
  if (r.def !== r.def.trim()) inc("def_untrimmed");
}
console.log(rows.length, "keys", keys.size, "records(key,def)", recs.size, "distinct defs", defs.size);
console.log(c);
