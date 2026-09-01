// LEDGER: -
// no frame letter. This pins the bytes of what ships; the facts inside those bytes are M and R, and strike-language-v1 is their ledger.
//
// Synthesis lane · store-manifest-rule-v1-what-ships-is-pinned
//
// The route store ships as an index and 256 shards, and until now nothing
// pinned the shards: the receipt pins the zones and the count inputs, the
// zones pin their gloss tables, and the shards those tables were projected
// from carried no hash anywhere. A shard swapped in place would have moved
// readings under words with nothing to notice. This manifest is that pin:
// every file the store directory serves, by exact bytes and sha256, plus
// the reading count each shard answers for — recomputed here, never typed.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const STORE = arg("store", "data/route-store");
const OUT = arg("out", join(STORE, "store-manifest-v1.json"));

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const files = {};
let keys = 0, rows = 0;
for (const f of readdirSync(STORE).sort()) {
  if (f === "store-manifest-v1.json") continue; // the pin does not pin itself
  const p = join(STORE, f);
  if (statSync(p).isDirectory()) continue;
  const bytes = readFileSync(p);
  files[f] = { bytes: bytes.length, sha256: sha256(bytes) };
}
const shardsDir = join(STORE, "shards");
for (const f of readdirSync(shardsDir).sort()) {
  const bytes = readFileSync(join(shardsDir, f));
  const entry = { bytes: bytes.length, sha256: sha256(bytes) };
  if (/^[0-9a-f]{2}\.bin$/.test(f)) {
    const body = JSON.parse(gunzipSync(bytes).toString("utf8"));
    entry.keys = Object.keys(body).length;
    entry.route_rows = Object.values(body).reduce((t, r) => t + r.length, 0);
    keys += entry.keys; rows += entry.route_rows;
  }
  files[`shards/${f}`] = entry;
}

const doc = {
  schema_version: "ROUTE_STORE_MANIFEST_V1",
  emitted_by: "tools/emit-store-manifest-v1.mjs",
  rule: "every file the store serves is pinned by exact bytes and sha256, and every shard by the keys and route rows it answers for; a moved shard is a moved reading, and this is what notices",
  counts: { files: Object.keys(files).length, keys, route_rows: rows },
  files,
};
writeFileSync(OUT, JSON.stringify(doc, null, 1) + "\n");
console.log(`${OUT}: ${Object.keys(files).length} files pinned · ${keys.toLocaleString()} keys · ${rows.toLocaleString()} route rows`);
