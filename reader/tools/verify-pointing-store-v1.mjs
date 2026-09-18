#!/usr/bin/env node
// Synthesis lane · pointing-store-counter-verification-rule-v1-a-shipment-is-what-this-side-measured-not-what-it-said
// LEDGER: -
// no frame letter. This reads a shipment and writes a record of what THIS
// side measured; it changes no letter and serves nothing.
//
// The corpus lane's pointing store arrived with its own receipts and two
// blind verifiers. Those are the corpus lane's. This is the serving lane's
// counter-verification, from bytes this lane holds, and it lives in the
// repository as a record rather than in a session's scratch — the lattice
// v12 receipt lived only in scratch and the audit of 2026-09-16 named that
// as a gap. Four questions, every answer a count:
//
//   1  THE PIN. Every file the manifest names that is present hashes to its
//      pin; the shard digest (sha256 over the 256 shard hex hashes, 00..ff)
//      matches; the files named but absent are listed by name.
//   2  THE FOLD, FROM OUR COPY. Drop [6], drop a null [5], and every v2
//      shard is byte-identical to the v1 shard this lane's git holds at the
//      pre-strike commit — not the corpus lane's copy, ours.
//   3  THE LANDING. Our admission filter over v2, folded, is the store this
//      site serves today, shard for shard (tools/land-pointing-store-v2-v1).
//   4  THE SAME FACT. The shipment's grade table, joined by (book, i, j,
//      reading) to its own entries for the surface and by card_index into
//      the lattice order, agrees with the grade the lattice sidecar already
//      carries for that card — at every row, or the rows that differ are
//      counted.
//
// Nothing here copies a shipment file into the repository; the record
// carries hashes, counts and names.
//
// Run: node tools/verify-pointing-store-v1.mjs --from <shipment dir> [--pre b1d1895ef]
//        [--out data/pointing-store-verify-v1.json] [--stamp YYYY-MM-DD]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { zonesServed } from "./zones-on-disk-v1.mjs";

export const COUNTER_RULE_ID = "pointing-store-counter-verification-rule-v1-a-shipment-is-what-this-side-measured-not-what-it-said";
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const FROM = arg("--from"), PRE = arg("--pre", "b1d1895ef"), OUT = arg("--out", "data/pointing-store-verify-v1.json"), STAMP = arg("--stamp", new Date().toISOString().slice(0, 10));
if (!FROM || !existsSync(join(FROM, "POINTING-STORE-MANIFEST-v1.json"))) { console.error("missing --from <dir with POINTING-STORE-MANIFEST-v1.json>"); process.exit(2); }
const sha = (b) => createHash("sha256").update(b).digest("hex");
const say = (s) => console.log(s);

// ---- 1 · the pin -----------------------------------------------------------
const manBytes = readFileSync(join(FROM, "POINTING-STORE-MANIFEST-v1.json"));
const man = JSON.parse(manBytes.toString("utf8"));
let pinned = 0, matched = 0; const absent = [], mismatched = [];
for (const [rel, ent] of Object.entries(man.files || {})) {
  pinned += 1;
  const p = join(FROM, rel);
  if (!existsSync(p)) { absent.push(rel); continue; }
  const b = readFileSync(p);
  if (sha(b) === ent.sha256 && b.length === ent.bytes) matched += 1; else mismatched.push(rel);
}
const shardDir = join(FROM, "store-v2", "route-store", "shards");
const shardNames = readdirSync(shardDir).filter((f) => f.endsWith(".bin")).sort();
const hexes = shardNames.map((n) => sha(readFileSync(join(shardDir, n)))).join("");
const digest = sha(Buffer.from(hexes));
const pin = { manifest_sha256: sha(manBytes), files_pinned: pinned, files_present_and_matching: matched, files_mismatched: mismatched, files_absent: absent,
  shard_digest_matches: digest === man.shard_digest_sha256, shard_digest: digest, shards: shardNames.length };
say(`1 pin · ${matched} of ${pinned} pinned files present and matching · ${absent.length} absent (${absent.filter((a) => /\.log$/u.test(a)).length} logs) · ${mismatched.length} mismatched · shard digest ${pin.shard_digest_matches ? "matches" : "DIFFERS"}`);

// ---- 2 · the fold, from our copy ---------------------------------------
const fold = (r) => { const c = r.slice(0, 6); if (c[5] === null) c.pop(); return c; };
const isPointed = (t) => /[\u05B0-\u05BB]/u.test(String(t ?? "").normalize("NFKD"));
let same = 0, differ = []; let rows = 0, len7 = 0, hw = 0, hwp = 0, keys = 0;
for (const n of shardNames) {
  const v2 = JSON.parse(gunzipSync(readFileSync(join(shardDir, n))).toString("utf8"));
  const v1 = gunzipSync(execSync(`git show ${PRE}:reader/data/route-store/shards/${n}`, { maxBuffer: 1 << 30, encoding: "buffer" })).toString("utf8");
  const folded = {};
  for (const [k, rs] of Object.entries(v2)) { keys += 1; folded[k] = rs.map((r) => { rows += 1; if (r.length === 7) len7 += 1; if (Array.isArray(r[6]) && r[6].length) { hw += 1; if (r[6].some(isPointed)) hwp += 1; } return fold(r); }); }
  if (JSON.stringify(folded) === v1) same += 1; else differ.push(n);
}
const foldRec = { against: `git ${PRE}:reader/data/route-store (the pre-strike store this lane holds)`, shards_identical: same, shards_differ: differ, rows, rows_length_7: len7, keys, rows_with_headword: hw, rows_with_pointed_headword: hwp };
say(`2 fold · ${same} of ${shardNames.length} shards fold to our pre-strike bytes · rows ${rows.toLocaleString()} (length 7: ${len7.toLocaleString()}) · with a headword ${hw.toLocaleString()} (${(100 * hw / rows).toFixed(1)}%)`);

// ---- 3 · the landing (the landing tool's receipt, if it ran) ------------
const landPath = "build/pointing-store-v2-served/landing-receipt-v1.json";
const land = existsSync(landPath) ? JSON.parse(readFileSync(landPath, "utf8")) : null;
const landing = land ? { landable: land.landable, shards_identical_after_fold: land.counts.shards_identical_after_fold, shards: land.counts.shards, rows_kept: land.counts.rows_kept, rows_dropped_by_admission: land.counts.rows_dropped_by_admission, dropped_ids: land.counts.dropped_ids.length, dropped_ids_all_on_the_struck_list: land.counts.dropped_ids_all_on_the_struck_list, served_rows_with_headword: land.counts.kept_rows_with_headword, candidate_store_version: land.candidate.store_version } : { not_run: "tools/land-pointing-store-v2-v1.mjs has not written build/pointing-store-v2-served/landing-receipt-v1.json" };
say(land ? `3 landing · ${land.landable ? "LANDABLE" : "DOES NOT LAND"} · ${land.counts.shards_identical_after_fold} of ${land.counts.shards} shards · ${land.counts.rows_dropped_by_admission.toLocaleString()} rows dropped on ${land.counts.dropped_ids.length} ids, all struck: ${land.counts.dropped_ids_all_on_the_struck_list}` : "3 landing · not run");

// ---- 4 · the same fact -----------------------------------------------------
const G = { VOWEL_MATCH: "m", NORMALIZED: "n", VOWEL_MISMATCH: "x" };
const side = new Map(); for (const b of zonesServed()) if (existsSync(`data/zones/${b}.lattice.bin`)) side.set(b, JSON.parse(gunzipSync(readFileSync(`data/zones/${b}.lattice.bin`)).toString("utf8")));
const surf = new Map();
for await (const line of createInterface({ input: createReadStream(join(FROM, "grades", "entries-v1.jsonl.gz")).pipe(createGunzip()) })) { const e = JSON.parse(line); surf.set(`${e.book}|${e.i}|${e.j}|${e.reading}`, e.surface); }
let gRows = 0, agree = 0, disagree = 0, unjoinable = 0; const perBook = {};
for await (const line of createInterface({ input: createReadStream(join(FROM, "grades", "grades-v1.jsonl.gz")).pipe(createGunzip()) })) {
  const r = JSON.parse(line); gRows += 1;
  const s = surf.get(`${r.book}|${r.i}|${r.j}|${r.reading}`); const sc = side.get(r.book); const gr = s && sc && sc.grades[s];
  if (!gr || r.card_index >= gr.g.length) { unjoinable += 1; continue; }
  if (gr.g[r.card_index] === G[r.grade]) agree += 1; else { disagree += 1; perBook[r.book] = (perBook[r.book] || 0) + 1; }
}
const sameFact = { grade_rows: gRows, agree, disagree, unjoinable, books_with_disagreements: perBook, joined_by: "(book, i, j, reading) into entries-v1 for the surface; card_index into the lattice order the sidecar's fingerprints keep" };
say(`4 same fact · ${agree.toLocaleString()} of ${gRows.toLocaleString()} grade rows agree with the lattice sidecar · ${disagree.toLocaleString()} disagree · ${unjoinable.toLocaleString()} unjoinable`);

const record = {
  schema_version: "POINTING_STORE_VERIFY_V1", rule_id: COUNTER_RULE_ID, verified_on: STAMP,
  shipment: { lane: man.lane || null, manifest_sha256: pin.manifest_sha256, store_version: JSON.parse(readFileSync(join(FROM, "store-v2", "route-store", "index.json"), "utf8")).store_version, candidate_only: man.candidate_only, current_effect: man.current_effect },
  pin, fold: foldRec, landing, same_fact: sameFact,
  what_this_does_not_say: [
    "that the candidate is served; it is not, and the page cannot yet read [6]",
    "that the per-source grade the contract asks the card to compute from [6] equals the merged lattice grade — the contract itself counts 6.1% of slots where it does not, and that difference is the toggle's purpose",
    "anything about the default, which is the owner's",
  ],
};
writeFileSync(OUT, `${JSON.stringify(record, null, 1)}\n`);
say(`${OUT} written`);
