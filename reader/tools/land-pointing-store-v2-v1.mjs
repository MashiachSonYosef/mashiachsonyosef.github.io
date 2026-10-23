#!/usr/bin/env node
// Synthesis lane · pointing-store-landing-rule-v1-the-served-v2-is-the-served-v1-plus-one-slot-or-it-does-not-land
// LEDGER: -
// no frame letter. This writes a CANDIDATE under build/ and a receipt; it
// serves nothing and changes no letter. What it changes is whether the
// corpus lane's pointing store can be shown, on this side, to be exactly the
// store this site already serves with one slot added — before anyone swaps
// a wire.
//
// The corpus lane's pointing store (moses-pointing-store-v1, ROUTE_STORE_V2)
// is v1 plus one slot: [6] HEADWORDS, the source's own pointed headword
// strings for that (key, text, source). Its fold test proves v2 → v1 against
// the 196-source DISK store. This site serves 147 sources: the language
// admission strike removed 49. So the question this side has to answer is
// not "does v2 fold to disk v1" (proven there, counter-verified here against
// git b1d1895ef, 256/256) but:
//
//   apply THIS site's admission filter to v2, fold, and is the result the
//   store THIS site serves today, byte for byte, shard for shard?
//
// If yes, the served v2 is the served v1 plus one slot, and a reader that
// ignores [6] keeps reading exactly what it reads now. If no, nothing lands
// and the receipt says which shard differs. The candidate is written under
// build/ with its own index (store_version recomputed from its shard bytes,
// history carried forward from the served index) — pinned by sha256 in the
// receipt, never copied into data/.
//
// The struck ranks stay struck: filtering rows by m id leaves the holes the
// strike left, never renumbered — struck-rank-rule-v1.
//
// Run: node tools/land-pointing-store-v2-v1.mjs --from <dir with store-v2/route-store>
//        [--served data/route-store] [--out build/pointing-store-v2-served] [--stamp YYYY-MM-DD]
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { join } from "node:path";

export const LANDING_RULE_ID = "pointing-store-landing-rule-v1-the-served-v2-is-the-served-v1-plus-one-slot-or-it-does-not-land";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const FROM = arg("--from"), SERVED = arg("--served", "data/route-store"), OUT = arg("--out", "build/pointing-store-v2-served"), STAMP = arg("--stamp", new Date().toISOString().slice(0, 10));
if (!FROM) { console.error("missing --from <dir holding store-v2/route-store>"); process.exit(2); }
const V2 = join(FROM, "store-v2", "route-store");
for (const p of [join(V2, "index.json"), join(V2, "shards"), join(SERVED, "index.json"), join(SERVED, "shards")])
  if (!existsSync(p)) { console.error(`NOT_FOUND ${p}`); process.exit(1); }

const sha = (b) => createHash("sha256").update(b).digest("hex");
const v2Index = JSON.parse(readFileSync(join(V2, "index.json"), "utf8"));
const served = JSON.parse(readFileSync(join(SERVED, "index.json"), "utf8"));
if (v2Index.schema_version !== "ROUTE_STORE_V2") { console.error(`NOT_V2: ${v2Index.schema_version}`); process.exit(1); }
const admitted = new Set(Object.keys(served.m_sources || {}));
const struck = new Set((served.language_admission || {}).struck_m_ids || []);
const names = readdirSync(join(V2, "shards")).filter((f) => f.endsWith(".bin")).sort();
const servedNames = readdirSync(join(SERVED, "shards")).filter((f) => f.endsWith(".bin")).sort();

mkdirSync(join(OUT, "shards"), { recursive: true });
const fold = (r) => { const c = r.slice(0, 6); if (c[5] === null) c.pop(); return c; };
const isPointed = (t) => /[\u05B0-\u05BB]/u.test(String(t ?? "").normalize("NFKD"));
const stats = { shards: 0, shards_identical_after_fold: 0, shards_differ: [], rows_in: 0, rows_dropped_by_admission: 0, rows_kept: 0, keys_in: 0, keys_kept: 0, keys_emptied: 0,
  kept_rows_with_headword: 0, kept_rows_with_pointed_headword: 0, dropped_ids_seen: new Set(), unknown_ids_seen: new Set() };
const digest = createHash("sha256"); let shardBytes = 0; const pins = {};
for (const n of names) {
  const v2 = JSON.parse(gunzipSync(readFileSync(join(V2, "shards", n))).toString("utf8"));
  const out = {}; const folded = {};
  for (const [k, rows] of Object.entries(v2)) {
    stats.keys_in += 1;
    const kept = [];
    for (const r of rows) {
      stats.rows_in += 1;
      if (r.length !== 7) { console.error(`ROW_NOT_LENGTH_7 ${n} ${k}`); process.exit(1); }
      if (!admitted.has(r[3])) { stats.rows_dropped_by_admission += 1; (struck.has(r[3]) ? stats.dropped_ids_seen : stats.unknown_ids_seen).add(r[3]); continue; }
      kept.push(r); stats.rows_kept += 1;
      if (Array.isArray(r[6]) && r[6].length) { stats.kept_rows_with_headword += 1; if (r[6].some(isPointed)) stats.kept_rows_with_pointed_headword += 1; }
    }
    if (kept.length) { out[k] = kept; folded[k] = kept.map(fold); stats.keys_kept += 1; } else stats.keys_emptied += 1;
  }
  // the proof: the folded candidate shard IS the served shard, byte for byte
  const servedBytes = existsSync(join(SERVED, "shards", n)) ? gunzipSync(readFileSync(join(SERVED, "shards", n))).toString("utf8") : null;
  stats.shards += 1;
  if (servedBytes !== null && JSON.stringify(folded) === servedBytes) stats.shards_identical_after_fold += 1; else stats.shards_differ.push(n);
  const body = gzipSync(Buffer.from(JSON.stringify(out)), { level: 9 });
  writeFileSync(join(OUT, "shards", n), body);
  digest.update(body); shardBytes += body.length; pins[`shards/${n}`] = { bytes: body.length, sha256: sha(body) };
}
const landable = stats.shards_differ.length === 0 && names.length === servedNames.length;
const version = digest.digest("hex").slice(0, 12);
const index = {
  ...served,
  schema_version: "ROUTE_STORE_V2",
  store_version: version,
  store_version_history: [...(served.store_version_history || []), { was: served.store_version, now: version, why: LANDING_RULE_ID, on: STAMP }],
  route_row: v2Index.route_row, fold_to_v1: v2Index.fold_to_v1, join_rule: v2Index.join_rule,
  counts: { ...(served.counts || {}), keys: stats.keys_kept, routes: stats.rows_kept, shards: names.length, shard_bytes_total: shardBytes,
    scope: "the served v2 candidate: v2 rows whose m id this site admits, folded to prove identity with the served v1" },
  pointing_store: {
    rule: LANDING_RULE_ID, landed_on: STAMP, landable,
    from: { store_version: v2Index.store_version, schema: v2Index.schema_version, built_against: "7d3e04a9d270 (196 sources, disk)" },
    proof: landable ? `every one of ${names.length} shards, admission-filtered and folded, is the served shard's bytes exactly` : `${stats.shards_differ.length} shard(s) differ after fold: ${stats.shards_differ.slice(0, 6).join(", ")}`,
    headwords: { scope: "rows this site admits", rows: stats.rows_kept, with_headword: stats.kept_rows_with_headword, with_pointed_headword: stats.kept_rows_with_pointed_headword },
  },
};
writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 1));
const receipt = {
  rule: LANDING_RULE_ID, on: STAMP, landable,
  from: { store_version: v2Index.store_version, shards: names.length },
  served: { store_version: served.store_version, sources_admitted: admitted.size, sources_struck: struck.size },
  candidate: { out: OUT, store_version: version, shard_bytes_total: shardBytes, index_sha256: sha(readFileSync(join(OUT, "index.json"))), pins },
  counts: {
    rows_in: stats.rows_in, rows_dropped_by_admission: stats.rows_dropped_by_admission, rows_kept: stats.rows_kept,
    keys_in: stats.keys_in, keys_kept: stats.keys_kept, keys_emptied_by_admission: stats.keys_emptied,
    dropped_ids_all_on_the_struck_list: stats.unknown_ids_seen.size === 0, dropped_ids: [...stats.dropped_ids_seen].sort(), dropped_ids_not_on_the_struck_list: [...stats.unknown_ids_seen].sort(),
    shards: stats.shards, shards_identical_after_fold: stats.shards_identical_after_fold, shards_differ: stats.shards_differ,
    kept_rows_with_headword: stats.kept_rows_with_headword, kept_rows_with_pointed_headword: stats.kept_rows_with_pointed_headword,
  },
  what_this_does_not_say: "that the candidate is served — it is not; that the page can read [6] — it cannot yet; that the default is decided — it is the owner's",
};
mkdirSync("build", { recursive: true });
writeFileSync(join(OUT, "landing-receipt-v1.json"), JSON.stringify(receipt, null, 1));
const c = receipt.counts;
console.log(`${landable ? "LANDABLE" : "DOES NOT LAND"} · ${c.shards_identical_after_fold} of ${c.shards} shards fold to the served bytes · rows ${c.rows_in.toLocaleString()} → ${c.rows_kept.toLocaleString()} (dropped ${c.rows_dropped_by_admission.toLocaleString()} on admission, ${c.dropped_ids.length} ids, all on the struck list: ${c.dropped_ids_all_on_the_struck_list}) · keys ${c.keys_in.toLocaleString()} → ${c.keys_kept.toLocaleString()}`);
console.log(`  served rows carrying a headword ${c.kept_rows_with_headword.toLocaleString()} (${(100 * c.kept_rows_with_headword / c.rows_kept).toFixed(1)}%) · pointed ${c.kept_rows_with_pointed_headword.toLocaleString()} · candidate ${OUT} store_version ${version} · receipt ${OUT}/landing-receipt-v1.json`);
process.exit(landable ? 0 : 1);
