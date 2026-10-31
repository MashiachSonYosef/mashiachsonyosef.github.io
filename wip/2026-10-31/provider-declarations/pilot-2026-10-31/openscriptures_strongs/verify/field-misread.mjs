// The field test against the records it misreads: KJV lists that end in a closing note read as Strong's sentence,
// and the one sentence+list record read as a list. Counts the rendering commas the declaration then never cuts.
import { writeFileSync } from "node:fs";
import { loadRows, parse } from "./common.mjs";
import { analyze, useLabels } from "./classify.mjs";
useLabels("draft");
const rows = loadRows(); const seen = new Set(); const out = { list_read_as_sentence: [], missed_rendering_commas: 0, routes: 0 };
for (const r of rows) {
  const a = analyze(r.def);
  const listLike = a.field === "def" && (/\.\s*\((?:[^()]|\([^()]*\))*\)\s*$/u.test(r.def) || /\.'\s*$/u.test(r.def)) && !/\betc\.\s*\(/u.test(r.def);
  if (!listLike) continue;
  out.routes++;
  if (seen.has(r.def)) continue; seen.add(r.def);
  const p = parse(r.def); let stop = -1;
  for (let i = 0; i < r.def.length; i++) if (r.def[i] === "." && p.depth[i] === 0 && r.def[i - 1] !== "." && r.def[i + 1] !== "." && r.def[i + 1] !== ",") { stop = i; break; }
  let n = 0; for (let i = 0; i < stop; i++) if ((r.def[i] === "," || r.def[i] === ";") && p.depth[i] === 0 && !/^\s*-/u.test(r.def.slice(i + 1))) n++;
  out.missed_rendering_commas += n;
  out.list_read_as_sentence.push({ key: r.key, window: r.def.slice(Math.max(0, stop - 40), stop + 18), depth0_separators_before_the_stop: n, slice_routes_on_record: rows.filter((x) => x.def === r.def && x.route !== x.def).length });
}
writeFileSync(new URL("./field-misread.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
