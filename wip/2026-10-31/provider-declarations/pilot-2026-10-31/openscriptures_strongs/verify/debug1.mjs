import { loadRows, fieldOf, TRACE } from "./common.mjs";
import { analyze } from "./classify.mjs";
const rows = loadRows(); const seen = new Set();
const want = new Set(process.argv.slice(2));
for (const r of rows) {
  if (seen.has(r.def)) continue; seen.add(r.def);
  const a = analyze(r.def);
  for (const [i, sh] of a.shape) if (want.has(sh) || (want.has("NULL") && !sh)) console.log(sh, "|", r.key, "|", a.field, "|", r.def.slice(Math.max(0, i - 40), i + 30).replace(/\n/g, " "), "|", r.def.length > 120 ? "" : "");
}
