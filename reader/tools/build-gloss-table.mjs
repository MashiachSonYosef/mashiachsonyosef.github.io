#!/usr/bin/env node
// Synthesis lane · thin CLI over tools/gloss-store-v1.mjs
//
// The zone builder embeds its own table, so this exists for the two cases the
// builder does not cover: emitting the whole catalog's default readings for
// review, and diffing one build's table against another's.
//
// Usage:
//   node tools/build-gloss-table.mjs --store data/route-store \
//        [--keys keys.json] --out build/gloss-table.json

import { readFileSync, writeFileSync } from "node:fs";
import { openRouteStore, GLOSS_RULE_ID, GLOSS_RULE_TEXT } from "./gloss-store-v1.mjs";

const arg = (flag, fallback = null) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
};
const storeDir = arg("--store", "data/route-store");
const keysFile = arg("--keys");
const outFile = arg("--out");
if (!outFile) throw new Error("--out is required");

const store = openRouteStore(storeDir);

let keys;
if (keysFile) {
  keys = JSON.parse(readFileSync(keysFile, "utf8"));
  if (!Array.isArray(keys)) throw new Error("--keys must be a JSON array of exact K strings");
} else {
  keys = [];
  for (let i = 0; i < 256; i += 1) {
    const name = i.toString(16).padStart(2, "0");
    // touch every shard through the public surface so the lib owns the paths
    keys.push(...Object.keys(store.routesFor.shardKeys?.(name) || {}));
  }
  if (!keys.length) throw new Error("--keys is required in this build (whole-store emit needs a shard walk)");
}

const { table, counts, sha256 } = store.tableFor(keys);
writeFileSync(outFile, JSON.stringify(table));
writeFileSync(`${outFile}.receipt.json`, JSON.stringify({
  schema_version: "GLOSS_TABLE_V1",
  rule_id: GLOSS_RULE_ID,
  rule: GLOSS_RULE_TEXT,
  generated_by: "tools/build-gloss-table.mjs",
  gloss_table_sha256: sha256,
  store: { rule_id: store.index.rule_id, keys_in_store: store.index.counts.keys, routes_in_store: store.index.counts.routes, inputs: store.index.inputs },
  counts,
}, null, 1));

console.log(
  `gloss table: ${counts.glossed}/${counts.keys_asked} keys glossed ` +
  `(${counts.no_exact_route} no exact route, ${counts.no_displayable_route} no displayable route) · sha256 ${sha256.slice(0, 16)}…`,
);
