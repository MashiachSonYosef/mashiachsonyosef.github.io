#!/usr/bin/env node
// GUARDS: route-delta-landing-rule-v1-a-row-the-rebuild-wrote-lands-by-content-under-the-shape-the-store-has-now
// LEDGER: M R
//
// THE 88 SHARDS THAT NEVER LANDED, LANDED AS A DELTA.
//
// Store 7d3e04a9d270 (the 2026-08-18 rebuild) was committed in three batches
// of shards and the middle one, shards 55..ac, never landed: those 88 shards
// kept the previous store's bytes while the index declared the rebuild's
// counts. The witness beside the store (data/store-before-strike-witness-v1)
// records the gap to the row — 430 routes, all M14 (Strong's), 19 of them
// cut readings — and C0 of check-store-continuity-v1 alarms until the rows
// land or the owner rules. The owner ruled (23 October 2026): "if its
// licensed we want it". M14 is SERVED in the license ledger.
//
// The corpus lane shipped the rows as a delta rather than as the shards:
// the rebuilt shards also carry struck text (M20 and others), and the lane
// writes none of it. The delta (relay moses-route-store-88-shards-v1, v83)
// names, per changed key, the rows the rebuild removed with their index in
// the site's shards as committed (I2, commit 3f977342) and the rows it added
// with their index in the rebuild's array (I1); the kept rows are a longest
// common subsequence of whole rows. Applied to I2 it re-makes I1 byte for
// byte, and this tool replays that proof for every key before it writes.
//
// The store in front of us is not I2 any more. Four moves stand between:
// two admission rounds and the M20 strike removed rows (so the delta's
// indexes no longer point), the pointing-store landing widened every row to
// seven fields (cut flag at [5], HEADWORDS at [6]), and the year repair set
// slot 4 on 1,318 of the 2,948 rows these keys hold (M14's rows read 1890 on
// both sides, measured). So this lands by CONTENT and by ORDER, never by
// index:
//
//   1  I2 is read from git at the commit the relay names; each key's rows
//      hash to the relay's i2_rows_sha256, and I2 less removed plus added at
//      their positions hashes to i1_rows_sha256. Anything else stops.
//   2  each removed row is found in the current shard by its first five
//      fields, exactly once, or this stops. No guessing.
//   3  the current rows, less the removed ones, are walked against the kept
//      rows in I1 order on their first four fields (rank, route_text,
//      definition_text, m_id: the year repair moved slot 4 by rule, and the
//      moves are counted); every current row must match a kept row in order,
//      and every kept row that no current row matches must stand on a
//      struck source (the admission strike's or the license strike's), or
//      this stops.
//   4  the key's new rows are the I1 order with the struck rows absent: a
//      kept row contributes the current row it matched (bytes untouched), an
//      added row contributes a seven-field row — the delta's five fields, the
//      delta's own cut flag ([5] === 1 in the rebuild's row, else null), and
//      HEADWORDS copied from the removed row of the same (m_id,
//      definition_text) when there is one, else from the first current M14
//      row of the key with that definition_text, else [key]. An added row
//      therefore stands after the nearest preceding kept row that survives.
//   5  the shards are rewritten with the serializer every store tool uses
//      (gzip level 9 of JSON.stringify); the index's counts move, its
//      store_version is recomputed from the shard bytes as the strikes do,
//      the move is named in store_version_history, and a receipt beside the
//      store names every row that moved. The witness's gap is ruled.
//
// Usage: node tools/apply-route-delta-v1.mjs --relay <relay dir> [--store data/route-store]
//        [--repo <git dir holding the I2 commit>] [--i2-commit <sha>] [--i2-path <path in that commit>]
//        [--witness data/store-before-strike-witness-v1.json] [--on YYYY-MM-DD] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
export const ROUTE_DELTA_LANDING_RULE_ID = "route-delta-landing-rule-v1-a-row-the-rebuild-wrote-lands-by-content-under-the-shape-the-store-has-now";

const RELAY = arg("relay", null);
const STORE = arg("store", join(K3, "data", "route-store"));
const REPO = arg("repo", join(K3, ".."));
const I2_COMMIT = arg("i2-commit", "3f977342b847951a3ba5a22fc2710e3d0dd1f957");
const I2_PATH = arg("i2-path", "genesis-book-reader-v4/data/route-store/shards");
const WITNESS = arg("witness", join(K3, "data", "store-before-strike-witness-v1.json"));
const ON = arg("on", new Date().toISOString().slice(0, 10));
const RECEIPT_NAME = "delta-88-shards-v1-receipt.json";
if (!RELAY) { console.log("usage: --relay <relay dir with RECEIPT.json and outputs/delta-v1.jsonl> [--store dir] [--repo dir] [--i2-commit sha] [--i2-path path] [--witness file] [--on date] [--dry]"); process.exit(2); }

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const stop = (why) => { console.log(`STOPPED — ${why}`); process.exit(1); };
const n = (v) => Number(v).toLocaleString();
const five = (r) => JSON.stringify(r.slice(0, 5));
const sameFour = (a, b) => a.length >= 5 && b.length >= 5 && a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
const sameFive = (a, b) => sameFour(a, b) && a[4] === b[4];

// ── the relay: its receipt vouches for the delta's bytes ──────────────────
const relayReceipt = JSON.parse(readFileSync(join(RELAY, "RECEIPT.json"), "utf8"));
const deltaBytes = readFileSync(join(RELAY, "outputs", "delta-v1.jsonl"));
const pinned = (relayReceipt.files || {})["outputs/delta-v1.jsonl"] || {};
if (pinned.sha256 !== sha256(deltaBytes) || pinned.bytes !== deltaBytes.length) stop(`the relay's RECEIPT.json pins outputs/delta-v1.jsonl at ${pinned.sha256} (${pinned.bytes} bytes); the file is ${sha256(deltaBytes)} (${deltaBytes.length} bytes)`);
const lines = deltaBytes.toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const relayShards = JSON.parse(readFileSync(join(RELAY, "outputs", "shards-88-v1.json"), "utf8"));
const relayCounts = JSON.parse(readFileSync(join(RELAY, "outputs", "counts-v1.json"), "utf8"));
console.log(`relay ${relative(K3, RELAY)} · ${lines.length} delta lines · delta ${pinned.sha256.slice(0, 12)} as the receipt pins it`);

// ── the store: what it admits and what the strikes took ───────────────────
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const admitted = new Set(Object.keys(index.m_sources || {}));
const struckIds = new Set([...(((index.language_admission || {}).struck_m_ids) || []), ...(((index.source_strikes || {}).struck_m_ids) || [])]);
// L1 of the relay's rule, read back here: every row is M14 and M14 is served
const ids = new Set();
for (const l of lines) for (const x of [...l.removed, ...l.added]) ids.add(String(x.row[3]));
if (ids.size !== 1 || !ids.has("M14")) stop(`the delta carries rows of ${[...ids].join(", ")}; this landing is the one-source licensed case and nothing else`);
if (!admitted.has("M14") || struckIds.has("M14")) stop("M14 is not a source the index admits");

// ── I2, from the repository's own history ─────────────────────────────────
const i2Shard = (xx) => {
  const packed = execFileSync("git", ["-C", REPO, "show", `${I2_COMMIT}:${I2_PATH}/${xx}.bin`], { maxBuffer: 1 << 26 });
  const pin = relayShards.find((s) => s.shard === xx);
  if (!pin) stop(`the relay's shards-88-v1.json names no shard ${xx}`);
  if (sha256(packed) !== pin.i2_sha256) stop(`shard ${xx} at ${I2_COMMIT.slice(0, 9)} hashes to ${sha256(packed)}; the relay's I2 is ${pin.i2_sha256}`);
  return JSON.parse(gunzipSync(packed).toString("utf8"));
};

// ── the landing, key by key, counted before anything is written ───────────
const byShard = new Map();
for (const l of lines) { if (!byShard.has(l.shard)) byShard.set(l.shard, []); byShard.get(l.shard).push(l); }
const rewritten = new Map();
const perKey = [];
let removedTotal = 0, addedTotal = 0, cutAdded = 0, cutRemoved = 0, struckKept = 0, yearMoved = 0, keptMatched = 0;
const headwordsFrom = { removed_row_of_the_same_record: 0, sibling_row_of_the_same_definition: 0, the_key_alone: 0 };
let targetsEqual = 0;
for (const [xx, group] of [...byShard.entries()].sort()) {
  const path = join(STORE, "shards", `${xx}.bin`);
  const body = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
  const i2 = i2Shard(xx);
  for (const l of group) {
    const where = `${xx} · ${l.key}`;
    const i2rows = i2[l.key];
    if (!Array.isArray(i2rows)) stop(`${where}: no rows in I2`);
    if (sha256(JSON.stringify(i2rows)) !== l.i2_rows_sha256 || i2rows.length !== l.i2_row_count) stop(`${where}: I2's rows do not hash to the relay's i2_rows_sha256`);
    // replay the relay's rule: drop the removed indexes, insert the added rows at their positions
    const removedAt = new Set(l.removed.map((r) => r.at));
    for (const r of l.removed) if (JSON.stringify(i2rows[r.at]) !== JSON.stringify(r.row)) stop(`${where}: the row at I2 index ${r.at} is not the row the delta says it removed`);
    const kept = i2rows.filter((_, i) => !removedAt.has(i));
    const i1 = [];
    let k = 0;
    const addedAt = new Map(l.added.map((a) => [a.at, a.row]));
    for (let p = 0; p < l.i1_row_count; p += 1) {
      if (addedAt.has(p)) i1.push({ added: addedAt.get(p) });
      else { if (k >= kept.length) stop(`${where}: I1 position ${p} has no kept row to take`); i1.push({ kept: kept[k] }); k += 1; }
    }
    if (k !== kept.length) stop(`${where}: ${kept.length - k} kept rows left over after I1's ${l.i1_row_count} positions`);
    if (sha256(JSON.stringify(i1.map((x) => x.added || x.kept))) !== l.i1_rows_sha256) stop(`${where}: the replay does not hash to the relay's i1_rows_sha256`);

    // the current rows, the removed rows taken out by content, exactly once each
    const current = body[l.key];
    if (!Array.isArray(current)) stop(`${where}: the key is not in the current shard`);
    const before = current.length;
    const takeOut = new Set();
    const removedRows = [];
    for (const r of l.removed) {
      const hits = current.map((row, i) => (sameFive(row, r.row) ? i : -1)).filter((i) => i >= 0);
      if (hits.length !== 1) stop(`${where}: removed row ${five(r.row)} found ${hits.length} times in the current shard; it must be exactly once`);
      takeOut.add(hits[0]); removedRows.push(current[hits[0]]);
      if (current[hits[0]][5] === 1) cutRemoved += 1;
    }
    const survivors = current.filter((_, i) => !takeOut.has(i));
    // walk the survivors against the kept rows in I1 order
    const out = [];
    const added = [];
    let j = 0;
    const headwordsOf = (row) => {
      const fromRemoved = removedRows.find((x) => x[3] === row[3] && x[2] === row[2]);
      if (fromRemoved) { headwordsFrom.removed_row_of_the_same_record += 1; return { hw: fromRemoved[6], from: "removed_row_of_the_same_record" }; }
      const sibling = current.find((x) => x[3] === "M14" && x[2] === row[2] && Array.isArray(x[6]));
      if (sibling) { headwordsFrom.sibling_row_of_the_same_definition += 1; return { hw: sibling[6], from: "sibling_row_of_the_same_definition" }; }
      headwordsFrom.the_key_alone += 1; return { hw: [l.key], from: "the_key_alone" };
    };
    for (const x of i1) {
      if (x.added) {
        const r = x.added;
        const cut = r[5] === 1 ? 1 : null;
        if (cut === 1) cutAdded += 1;
        const { hw, from } = headwordsOf(r);
        const row = [r[0], r[1], r[2], r[3], r[4], cut, hw];
        out.push(row); added.push({ row, headwords_from: from });
        continue;
      }
      if (j < survivors.length && sameFour(survivors[j], x.kept)) { if (survivors[j][4] !== x.kept[4]) yearMoved += 1; keptMatched += 1; out.push(survivors[j]); j += 1; continue; }
      // a kept row no survivor matches must be one a strike took
      if (!struckIds.has(String(x.kept[3]))) stop(`${where}: kept row ${five(x.kept)} is not in the current shard and its source ${x.kept[3]} was never struck`);
      struckKept += 1;
    }
    if (j !== survivors.length) stop(`${where}: ${survivors.length - j} current rows matched no kept row of I1 — the current order is not a subsequence of the rebuild's`);
    body[l.key] = out;
    removedTotal += l.removed.length; addedTotal += l.added.length;
    const target = before + (l.i1_row_count - l.i2_row_count);
    if (out.length === target) targetsEqual += 1;
    perKey.push({ shard: xx, key: l.key, before, after: out.length, target_current_plus_i1_minus_i2: target, equal: out.length === target, i2_row_count: l.i2_row_count, i1_row_count: l.i1_row_count, i1_rows_sha256: l.i1_rows_sha256, removed: removedRows, added });
  }
  rewritten.set(xx, body);
}
console.log(`landing: ${n(addedTotal)} rows added, ${n(removedTotal)} removed, net ${n(addedTotal - removedTotal)} over ${perKey.length} keys in ${rewritten.size} shards · cut readings added ${cutAdded}, removed ${cutRemoved} · kept rows matched ${n(keptMatched)} (${n(yearMoved)} with slot 4 moved by the year repair) · kept rows the strikes hold: ${n(struckKept)}`);
console.log(`every key's count after equals current + (i1 - i2): ${targetsEqual} of ${perKey.length} · HEADWORDS from ${JSON.stringify(headwordsFrom)}`);
const relayNet = ((relayCounts.counts || relayCounts).routes_net || {}).value ?? (relayCounts.routes_net && relayCounts.routes_net.value) ?? null;
if (targetsEqual !== perKey.length) stop("a key's count after is not current + (i1 - i2)");
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }

// ── the shards, then the version from their bytes ─────────────────────────
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => /^[0-9a-f]{2}\.bin$/.test(f)).sort();
for (const [xx, body] of rewritten) writeFileSync(join(STORE, "shards", `${xx}.bin`), gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 }));
const digest = createHash("sha256"); let shardBytes = 0, keys = 0, routes = 0, cuts = 0; const cutsBySource = {};
for (const name of shardNames) {
  const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length;
  const body = JSON.parse(gunzipSync(b).toString("utf8"));
  for (const rows of Object.values(body)) { keys += 1; for (const r of rows) { routes += 1; if (r[5] === 1) { cuts += 1; cutsBySource[r[3]] = (cutsBySource[r[3]] || 0) + 1; } } }
}
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
const cutsBefore = index.counts.cuts_by_source || {};
const cutsMoved = Object.keys({ ...cutsBefore, ...cutsBySource }).filter((m) => (cutsBefore[m] || 0) !== (cutsBySource[m] || 0));
if (cutsMoved.some((m) => m !== "M14")) stop(`the cut counts moved on a source the delta never touched: ${cutsMoved.join(", ")}`);

// ── the receipt beside the store ──────────────────────────────────────────
const receipt = {
  schema_version: "ROUTE_DELTA_LANDING_RECEIPT_V1",
  rule_id: ROUTE_DELTA_LANDING_RULE_ID,
  what: "the rows of the 2026-08-18 rebuild (store 7d3e04a9d270) that the 88 shards 55..ac never carried, landed on the served store from the corpus lane's delta: per key, the rows removed and the rows added as written, with the count before and after against current + (i1 - i2)",
  landed_on: ON,
  source_relay: {
    folder: relative(resolve(K3, ".."), resolve(RELAY)).replace(/\\/g, "/"),
    note: "FOR-ELIJAH-v83.md",
    receipt_rule_sha256: relayReceipt.rule_sha256,
    delta: { file: "outputs/delta-v1.jsonl", sha256: pinned.sha256, bytes: pinned.bytes, lines: lines.length },
    i1: "store 7d3e04a9d270 as the lane pinned it (manifest tree_sha256 fe470e2cc238625ceaee71f76dcaf4189c3836d67f09d264237ba279cfa400e4)",
    i2: { commit: I2_COMMIT, path: I2_PATH, read_from: "this repository's history, each shard's sha256 checked against the relay's shards-88-v1.json" },
  },
  how_rows_were_placed: "I2 from git, less the removed indexes plus the added rows at their I1 indexes, hashed to the relay's i1_rows_sha256 for every key; the current rows less the removed rows (found by their first five fields, exactly once each) were walked in that I1 order, every kept row either matching the next current row on its first four fields (the year repair of 2026-09-23 moved slot 4 by rule) or standing on a struck source; an added row is written where the I1 order puts it, after the nearest preceding kept row that survives",
  how_added_rows_were_shaped: "seven fields: the delta's five; [5] the rebuild's own cut flag (1) or null; [6] HEADWORDS copied from the removed row of the same (m_id, definition_text) when there is one, else from the first current M14 row of the key with that definition_text, else [key]",
  counts: {
    keys: perKey.length, shards_rewritten: rewritten.size,
    rows_added: addedTotal, rows_removed: removedTotal, rows_net: addedTotal - removedTotal,
    cut_readings_added: cutAdded, cut_readings_removed: cutRemoved,
    kept_rows_matched: keptMatched,
    kept_rows_whose_year_slot_the_year_repair_moved: yearMoved,
    kept_rows_absent_because_a_strike_took_them: struckKept,
    keys_whose_count_after_equals_current_plus_i1_minus_i2: targetsEqual,
    headwords_from: headwordsFrom,
    axis: "route rows, except keys and shards",
  },
  store: {
    was: { store_version: was, routes: index.counts.routes, keys: index.counts.keys, shard_bytes_total: index.counts.shard_bytes_total, cuts_m14: cutsBefore.M14 || 0 },
    now: { store_version: now, routes, keys, shard_bytes_total: shardBytes, cuts_m14: cutsBySource.M14 || 0 },
  },
  keys: perKey,
};
writeFileSync(join(STORE, RECEIPT_NAME), JSON.stringify(receipt, null, 1) + "\n");

// ── the index: the counts moved, the version renamed with its reason ──────
const historyEntry = { was, now, why: ROUTE_DELTA_LANDING_RULE_ID, on: ON };
index.counts = { ...index.counts, keys, routes, shards: shardNames.length, shard_bytes_total: shardBytes, readings_that_are_a_cut_of_a_sibling_record: cuts, cuts_by_source: { ...cutsBefore, M14: cutsBySource.M14 || 0 } };
index.store_version = now;
index.store_version_history = [...(index.store_version_history || []), historyEntry];
index.route_delta_landings = {
  rule_id: ROUTE_DELTA_LANDING_RULE_ID,
  record: `data/route-store/${RECEIPT_NAME}`,
  landings: [...(((index.route_delta_landings || {}).landings) || []), { on: ON, relay: receipt.source_relay.note, from_store: "7d3e04a9d270", shards: "55..ac", rows_added: addedTotal, rows_removed: removedTotal, rows_net: addedTotal - removedTotal, store_version: { was, now } }],
};
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));

// ── the witness: the gap is ruled, and what landed is written beside it ───
if (existsSync(WITNESS)) {
  const w = JSON.parse(readFileSync(WITNESS, "utf8"));
  const why = w.why_they_differ || (w.why_they_differ = {});
  why.ruled = `${ON}: the owner ruled on 2026-10-23 that licensed rows are wanted ("if its licensed we want it"); the 88 shards' delta landed from the corpus lane's relay v83 (moses-route-store-88-shards-v1): ${n(addedTotal)} M14 rows added, ${n(removedTotal)} removed, net ${n(addedTotal - removedTotal)}, ${cutAdded} of them cut readings, by tools/apply-route-delta-v1.mjs, store ${was} -> ${now}; the receipt is data/route-store/${RECEIPT_NAME}`;
  why.landed_since = {
    on: ON, relay: "corpus-lane-builds/moses-route-store-88-shards-v1 (FOR-ELIJAH-v83.md)", receipt: `data/route-store/${RECEIPT_NAME}`,
    rows_added: addedTotal, rows_removed: removedTotal, routes: addedTotal - removedTotal, m14_cut_readings: cutAdded - cutRemoved,
    store_version: { was, now },
    how: "the rows the shards beside the pre-strike index never held, brought through the moves since by content: the rows the strikes took stay out, the rows the rebuild wrote are in, in the rebuild's order",
  };
  writeFileSync(WITNESS, JSON.stringify(w, null, 1) + "\n");
}
console.log(`written · store ${was} -> ${now} · ${n(routes)} routes served (${n(keys)} keys, ${n(shardBytes)} shard bytes) · M14 cuts ${cutsBefore.M14 || 0} -> ${cutsBySource.M14 || 0} · receipt data/route-store/${RECEIPT_NAME}${relayNet !== null ? ` · relay net ${n(relayNet)}` : ""}`);
