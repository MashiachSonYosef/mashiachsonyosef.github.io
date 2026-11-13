// The dividing marks one source's rows lose between two stores: how many rows lose a mark, how many marks in all,
// the rows that lose more than one, and by the character at the mark (a semicolon, a colon, an equals sign, a comma).
// node marks-taken-off.mjs <old reader dir> <new reader dir> <m id>
// It reads; it changes nothing.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [oldDir, newDir, M] = process.argv.slice(2);
const shard = (dir, f) => JSON.parse(gunzipSync(readFileSync(join(dir, "data", "route-store", "shards", f))).toString("utf8"));
let rows = 0, marks = 0, gained = 0; const several = []; const at = {}; const lead = {};
for (const f of readdirSync(join(newDir, "data", "route-store", "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const a = shard(oldDir, f), b = shard(newDir, f);
  for (const k of Object.keys(b)) (b[k] || []).forEach((y, i) => {
    if (String(y[3]) !== M) return;
    const x = (a[k] || [])[i];
    const was = Array.isArray(x[7]) ? x[7] : [], is = Array.isArray(y[7]) ? y[7] : [];
    const off = was.filter((c) => !is.includes(c));
    gained += is.filter((c) => !was.includes(c)).length;
    if (!off.length) return;
    rows += 1; marks += off.length;
    for (const c of off) at[String(y[1])[c]] = (at[String(y[1])[c]] || 0) + 1;
    const head = (/^[a-z]+(?=:)/u.exec(String(y[1])) || ["(no lead word)"])[0]; lead[head] = (lead[head] || 0) + 1;
    if (off.length > 1) several.push(`${k} «${String(y[1]).slice(0, 110)}» ${JSON.stringify(was)} -> ${JSON.stringify(is)}`);
  });
}
console.log(`${M}: ${rows} rows lose a dividing mark · ${marks} marks in all · ${gained} marks gained · the character at the mark: ${JSON.stringify(at)} · the text's lead word: ${JSON.stringify(lead)}`);
for (const s of several) console.log("  more than one:", s);
