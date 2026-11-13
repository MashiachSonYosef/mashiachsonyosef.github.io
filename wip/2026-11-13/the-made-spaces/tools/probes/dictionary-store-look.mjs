// The dictionary store beside the route store: its index's small fields, and the shape of the records of one shard.
// node dictionary-store-look.mjs <reader dir>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
const dir = join(process.argv[2], "data", "dictionary-store");
const ix = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
for (const [k, v] of Object.entries(ix)) { if (k === "m_sources") continue; console.log(`${k}: ${JSON.stringify(v).slice(0, 500)}\n`); }
for (const [m, s] of Object.entries(ix.m_sources)) if (/openscriptures/u.test(s.key)) console.log(m, JSON.stringify(s));
const names = readdirSync(join(dir, "shards")).sort();
console.log(names.length, "shard files", names.slice(0, 3));
const body = JSON.parse(gunzipSync(readFileSync(join(dir, "shards", names[0]))).toString("utf8"));
const keys = Object.keys(body);
console.log("top-level:", Array.isArray(body) ? "array" : typeof body, keys.slice(0, 5));
let shown = 0;
for (const k of keys) { const v = body[k]; const s = JSON.stringify(v); if (/"M5"|"M9"/u.test(s) && shown < 3) { console.log(k, s.slice(0, 900)); shown += 1; } }
