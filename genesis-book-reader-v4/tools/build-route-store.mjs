#!/usr/bin/env node
// Synthesis lane · route-store-rule-v1-catalog-compact-top5
//
// Builds the reader's first ledger-backed lookup layer from the definition
// factory's sealed compact packages (definition-poc, frame 38 selection):
//
//   k-r-routes    one row per exact K+R, semantic rank, top-5 selection flag
//   r-identities  R id -> selectable route text
//   d-identities  D id -> definition text
//   m-identities  M id -> source key/label/license posture/pointer/year
//
// Rule, declared before output:
//   1. Exact K only. The store is keyed by the byte-exact k_normalized_key.
//      No folding, no derivation, no related edges — FRAME.md law.
//   2. Only rows with selected_visible_top5=true are shipped (<=5 per K),
//      in semantic_route_rank order. Alternatives stay in the workshop's
//      residual ledger; this store never claims to be the full catalog.
//   3. Every route ships with its primary D text and full M license record.
//      A route whose M lacks key/label/posture/pointer is REFUSED, because
//      the reader's routeIsDisplayReady would hide it anyway — shipping it
//      would be dead weight pretending to be coverage.
//   4. Shard = first 2 hex chars of sha256(utf8(K)) -> 256 gzip shards.
//      The browser recomputes the same hash and fetches one shard.
//   5. Inputs are recorded by path and sha256 in the index. Rebuild is
//      deterministic from the same sealed inputs.
//
// Usage: node tools/build-route-store.mjs <successor-dir> <breadth-dir> --out data/route-store
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { join, basename } from "node:path";

const [rdmDir, breadthDir] = process.argv.slice(2);
const outFlag = process.argv.indexOf("--out");
const outDir = outFlag >= 0 ? process.argv[outFlag + 1] : "data/route-store";

// ---- strict RFC4180 parse over the fully decompressed buffer ----------
// (A first draft streamed chunks and lost rows at chunk boundaries; the
// files are small enough to decompress whole, so correctness wins.)
function* parseCsvIter(text) {
  let field = "", row = [], inQ = false, width = -1, n = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else inQ = false;
      } else field += c;
      continue;
    }
    if (c === '"') { inQ = true; continue; }
    if (c === ",") { row.push(field); field = ""; continue; }
    if (c === "\n") {
      row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
      if (width < 0) width = row.length;
      else if (row.length !== width)
        throw new Error(`row ${n} has ${row.length} fields, header has ${width} — refusing output`);
      n += 1; yield row; field = ""; row = [];
      continue;
    }
    field += c;
  }
  if (inQ) throw new Error("unterminated quoted field — refusing output");
  if (field.length || row.length) { row.push(field); yield row; }
}
async function* csvRows(path) {
  const text = gunzipSync(readFileSync(path)).toString("utf8");
  let count = -1;
  for (const row of parseCsvIter(text)) { count += 1; yield row; }
  console.log(`  ${path.split("/").pop()}: ${count} rows`);
}

const sha256File = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");

const table = async (path, idCol, cols) => {
  const out = new Map(); let header = null;
  for await (const row of csvRows(path)) {
    if (!header) { header = row; continue; }
    const rec = Object.fromEntries(header.map((h, i) => [h, row[i]]));
    out.set(rec[idCol], cols.map((c) => rec[c]));
  }
  return out;
};

const find = (dir, suffix) => join(dir, readdirSync(dir).find((f) => f.endsWith(suffix)));

const rFile = find(rdmDir, "-r-identities.csv.gz");
const dFile = find(rdmDir, "-d-identities.csv.gz");
const mFile = find(rdmDir, "-m-identities.csv.gz");
const routesFile = find(breadthDir, "-k-r-routes.csv.gz");

console.log("loading identity tables…");
const R = await table(rFile, "r_id", ["r_route_text"]);
const D = await table(dFile, "d_id", ["d_exact_text"]);
const M = await table(mFile, "m_id", [
  "m_source_key", "m_source_label", "m_license_posture", "m_license_pointer",
  "s_source_year_or_no_source_year",
]);
console.log(`R:${R.size} D:${D.size} M:${M.size}`);

// M records missing any license field are refused whole (rule 3).
const refusedM = new Set();
for (const [id, [key, label, posture, pointer]] of M) {
  if (!key || !label || !posture || !pointer) refusedM.add(id);
}

const shards = new Map(); // "00".."ff" -> { K: [[rank,rText,dText,mId,year],...] }
let header = null, kept = 0, skippedNotTop5 = 0, refusedRoutes = 0, keys = new Set();
for await (const row of csvRows(routesFile)) {
  if (!header) { header = row; continue; }
  const rec = Object.fromEntries(header.map((h, i) => [h, row[i]]));
  if (rec.selected_visible_top5 !== "true") { skippedNotTop5 += 1; continue; }
  const rText = R.get(rec.r_id)?.[0];
  const dText = D.get(rec.primary_d_id)?.[0];
  const mId = rec.primary_m_id;
  if (!rText || !dText || !M.has(mId) || refusedM.has(mId)) { refusedRoutes += 1; continue; }
  const K = rec.k_normalized_key;
  const shard = createHash("sha256").update(K, "utf8").digest("hex").slice(0, 2);
  if (!shards.has(shard)) shards.set(shard, {});
  const bucket = shards.get(shard);
  (bucket[K] = bucket[K] || []).push([
    Number(rec.semantic_route_rank), rText, dText, mId,
    rec.primary_source_year_or_no_source_year,
  ]);
  keys.add(K); kept += 1;
}
for (const bucket of shards.values())
  for (const list of Object.values(bucket)) list.sort((a, b) => a[0] - b[0]);

mkdirSync(join(outDir, "shards"), { recursive: true });
let totalBytes = 0;
for (let i = 0; i < 256; i += 1) {
  const name = i.toString(16).padStart(2, "0");
  const body = gzipSync(Buffer.from(JSON.stringify(shards.get(name) || {})), { level: 9 });
  writeFileSync(join(outDir, "shards", `${name}.bin`), body);
  totalBytes += body.length;
}

const index = {
  schema_version: "ROUTE_STORE_V1",
  rule_id: "route-store-rule-v1-catalog-compact-top5",
  generated_by: "tools/build-route-store.mjs",
  key: "byte-exact kNormalizedKey; shard = sha256(utf8(K)) first 2 hex chars",
  shard_path: "data/route-store/shards/{shard}.bin",
  shard_encoding: "gzip(JSON) — unpack with DecompressionStream('gzip')",
  route_row: ["semantic_route_rank", "route_text", "definition_text", "m_id", "source_year_or_S_NO_SOURCE_YEAR"],
  selection: "selected_visible_top5 only; alternatives remain in the workshop residual ledger",
  m_sources: Object.fromEntries(
    [...M].filter(([id]) => !refusedM.has(id)).map(([id, [key, label, posture, pointer, year]]) =>
      [id, { key, label, licensePosture: posture, licensePointer: pointer, sourceYear: year }]),
  ),
  counts: { keys: keys.size, routes: kept, skipped_not_top5: skippedNotTop5, refused_routes: refusedRoutes, refused_m_records: refusedM.size, shards: 256, shard_bytes_total: totalBytes },
  inputs: [routesFile, rFile, dFile, mFile].map((p) => ({ file: basename(p), sha256: sha256File(p) })),
};
writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 1));
console.log(`keys:${keys.size} routes:${kept} not-top5:${skippedNotTop5} refused:${refusedRoutes} (${refusedM.size} M refused)`);
console.log(`shards: 256, total ${(totalBytes / 1e6).toFixed(1)} MB gz; index written to ${outDir}/index.json`);
