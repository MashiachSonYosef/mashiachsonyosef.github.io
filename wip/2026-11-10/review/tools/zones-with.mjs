// Which served zones carry a given top-level field, and what it holds. node zones-with.mjs <zones dir> <field path>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [dir, path] = process.argv.slice(2);
for (const f of readdirSync(dir).filter((x) => /^[^.]+\.bin$/u.test(x)).sort()) {
  const z = JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8"));
  let v = z; for (const k of path.split(".")) v = v == null ? undefined : v[k];
  if (v !== undefined && v !== null) console.log(f, JSON.stringify(v).slice(0, 300));
}
console.log("done");
