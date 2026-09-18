#!/usr/bin/env node
// GUARDS: pointing-store-landing-rule-v1-the-served-v2-is-the-served-v1-plus-one-slot-or-it-does-not-land, pointing-store-counter-verification-rule-v1-a-shipment-is-what-this-side-measured-not-what-it-said
//
// THE LANDING, RE-PROVED FROM THE CANDIDATE. The landing tool writes a
// receipt saying the candidate folds to the served store; a receipt is a
// claim. This reads the candidate's shards off disk, folds them again, and
// compares to the served shards again — so the guard is a recount, not a
// re-read. And the counter-verification record, if it is here, must say
// what a record can be held to: every pinned file that was present matched,
// the fold held on every shard, and the grade table agreed at every row.
//
// SKIPS by name when there is no candidate and no record: this is a guard on
// what was landed, not a demand that something be.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const CAND = "build/pointing-store-v2-served", SERVED = "data/route-store", REC = "data/pointing-store-verify-v1.json";
const haveCand = existsSync(join(CAND, "landing-receipt-v1.json")), haveRec = existsSync(REC);
if (!haveCand && !haveRec) { console.log("SKIPPED — no pointing-store candidate under build/ and no counter-verification record in data/; nothing landed to guard"); process.exit(3); }

if (haveCand) {
  const receipt = JSON.parse(readFileSync(join(CAND, "landing-receipt-v1.json"), "utf8"));
  const fold = (r) => { const c = r.slice(0, 6); if (c[5] === null) c.pop(); return c; };
  const names = readdirSync(join(CAND, "shards")).filter((f) => f.endsWith(".bin")).sort();
  let same = 0; const differ = []; let bad7 = 0;
  for (const n of names) {
    const cand = JSON.parse(gunzipSync(readFileSync(join(CAND, "shards", n))).toString("utf8"));
    const served = existsSync(join(SERVED, "shards", n)) ? gunzipSync(readFileSync(join(SERVED, "shards", n))).toString("utf8") : null;
    const folded = {}; for (const [k, rs] of Object.entries(cand)) folded[k] = rs.map((r) => { if (r.length !== 7) bad7 += 1; return fold(r); });
    if (served !== null && JSON.stringify(folded) === served) same += 1; else differ.push(n);
  }
  check("L1  the candidate's shards, folded, are the served shards byte for byte — recounted, not re-read",
    names.length === 256 && same === 256 && bad7 === 0, `${same} of ${names.length} · ${bad7} rows not length 7${differ.length ? " · differ: " + differ.slice(0, 4).join(",") : ""}`);
  check("L2  and the receipt says the same, with every dropped id on the struck list",
    receipt.landable === true && receipt.counts.shards_identical_after_fold === 256 && receipt.counts.dropped_ids_all_on_the_struck_list === true,
    `receipt: landable ${receipt.landable} · ${receipt.counts.rows_dropped_by_admission.toLocaleString()} rows dropped on ${receipt.counts.dropped_ids.length} ids`);
  // the served store must not have moved under the candidate
  const idx = JSON.parse(readFileSync(join(SERVED, "index.json"), "utf8"));
  check("L3  the served store the candidate was proved against is the served store on disk",
    receipt.served.store_version === idx.store_version, `${receipt.served.store_version} vs ${idx.store_version}`);
}
if (haveRec) {
  const rec = JSON.parse(readFileSync(REC, "utf8"));
  check("V1  every pinned file that was present matched its pin, and the shard digest matched",
    rec.pin.files_mismatched.length === 0 && rec.pin.shard_digest_matches === true && rec.pin.files_present_and_matching + rec.pin.files_absent.length === rec.pin.files_pinned,
    `${rec.pin.files_present_and_matching} of ${rec.pin.files_pinned} matched · ${rec.pin.files_absent.length} absent`);
  check("V2  the fold held on every shard against this lane's own pre-strike copy",
    rec.fold.shards_identical === 256 && rec.fold.shards_differ.length === 0 && rec.fold.rows_length_7 === rec.fold.rows,
    `${rec.fold.shards_identical} of 256 · ${rec.fold.rows.toLocaleString()} rows`);
  check("V3  the grade table agreed with the lattice sidecar at every row",
    rec.same_fact.disagree === 0 && rec.same_fact.unjoinable === 0 && rec.same_fact.agree === rec.same_fact.grade_rows && rec.same_fact.grade_rows > 0,
    `${rec.same_fact.agree.toLocaleString()} of ${rec.same_fact.grade_rows.toLocaleString()}`);
  check("V4  the record says what it does not say", Array.isArray(rec.what_this_does_not_say) && rec.what_this_does_not_say.length >= 3);
}
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
