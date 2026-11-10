#!/usr/bin/env node
// Synthesis lane · a built zone, stamped again from the witness record as it now stands
//
// RULE: count-stamp-rule-v1-the-count-is-stamped-beside-the-witnesses-that-published-one
// LEDGER: -
// no frame letter. This writes only the zone it was given: its count stamp,
// set again from the witness record, which it reads and never writes.
//
// A zone's count stamp is written when the zone is built: its own measure,
// beside the figures the witness record held that day. When the record is
// corrected, the zones already built go on saying what the old record said,
// under the old record's hash, and the count check faults every one of them
// (check-bookword-count-v1 L2: every stamp row is the record's figure, and
// every figure of the record is on the stamp).
//
// 10 November 2026 is the case this was written for. The record held
// Leningrad's Ecclesiastes at 2,573 words, a count with its maqaf pairs
// joined, on the axis where each maqaf piece is a word; the stamp showed our
// 2,987 as 414 words more than the held edition, which it is not
// (tools/emit-masorah-witnesses-v1.mjs has the account). The zones cannot be
// rebuilt on this checkout, and nothing about them has changed but the
// figures set beside them.
//
// So this sets the stamp again and touches nothing else. The zone is measured
// from its own bytes by the measure the builder used; the stamp it carries
// must already state that measure on every axis, or this refuses (a stamp
// that is not the bytes is a different fault and is not papered over here).
// The rows are then computed by the builder's own rule
// (tools/count-stamp-v1.mjs) from the record given, and the write is typed on
// the zone as every post-build write is (single-pass-exemption-v1). A zone
// with no stamp, or one stamped beside no witness record, is left as it is
// and said so. A zone whose stamp is already what the record gives is not
// rewritten.
//
// Run: node tools/restamp-zone-v1.mjs --zone <zone .bin> --stamp YYYY-MM-DD
//        [--witnesses data/masorah-witnesses-v1.json] [--out <zone .bin>] [--dry]
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { measureZone, MEASURE_RULE_ID, MEASURE_AXES } from "./bookword-measure-v1.mjs";
import { countStampOf } from "./count-stamp-v1.mjs";

const K3 = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const ZONE = arg("zone") || die("MISSING_ARG", "--zone");
const STAMP = arg("stamp") || die("MISSING_ARG", "--stamp");
if (!/^\d{4}-\d{2}-\d{2}$/u.test(STAMP)) die("STAMP_FORM", STAMP);
const WITNESSES = arg("witnesses", join(K3, "data", "masorah-witnesses-v1.json"));
const OUT = arg("out", ZONE);
const DRY = process.argv.includes("--dry");
const slug = basename(ZONE).replace(/\.bin$/u, "");

const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));
const was = zone.count_stamp;
if (!was) { console.log(`${slug}: carries no count stamp; left as it is`); process.exit(0); }
if (!was.witnesses) { console.log(`${slug}: stamped beside no witness record; left as it is`); process.exit(0); }

const recordBytes = readFileSync(WITNESSES);
const witnesses = JSON.parse(recordBytes.toString("utf8"));
if (witnesses.schema_version !== "MASORAH_WITNESSES_V1") die("WITNESSES_SCHEMA", String(witnesses.schema_version));

// the stamp is the bytes, before anything is set beside them
const measure = measureZone(zone);
const AXES = ["verses", "words", "words_written", "letters", "letters_read", "c0_on", "c0_off", "kq_sites"];
const off = AXES.filter((a) => measure[a] !== (was.ours || {})[a]);
if (off.length) die("STAMP_NOT_THE_BYTES", `${slug}: ${off.map((a) => `${a} bytes ${measure[a]} vs stamp ${(was.ours || {})[a]}`).join(", ")}`);
if (JSON.stringify(measure.marks) !== JSON.stringify((was.ours || {}).marks)) die("STAMP_NOT_THE_BYTES", `${slug}: the marks`);
if (was.measured_by !== MEASURE_RULE_ID) die("STAMP_MEASURE_RULE", `${slug}: ${was.measured_by}`);

const now = countStampOf({ slug, measure, witnesses, record: basename(WITNESSES), sha256: createHash("sha256").update(recordBytes).digest("hex"),
  measuredBy: MEASURE_RULE_ID, axes: MEASURE_AXES, refuse: (ok, code, detail) => { if (!ok) die(code, detail); } });
if (JSON.stringify(now) === JSON.stringify(was)) { console.log(`${slug}: the stamp is already what the record gives; not rewritten`); process.exit(0); }

// what moves, said row by row: a figure, a row gone, a row come; a row whose
// source alone is worded anew is counted and not listed
const keyOf = (r) => `${r.axis}|${r.witness}`;
const figureOf = (r) => `${r.theirs === null ? "no witness" : r.theirs} (ours ${r.ours}, ${r.delta === null ? "—" : r.delta === 0 ? "exact" : `${r.delta > 0 ? "+" : "−"}${Math.abs(r.delta)}`})`;
const wasBy = new Map((was.rows || []).map((r) => [keyOf(r), r])), nowBy = new Map(now.rows.map((r) => [keyOf(r), r]));
const moved = [];
for (const [k, r] of wasBy) { const n = nowBy.get(k); if (!n) moved.push(`${r.axis}: the row is gone, was ${figureOf(r)}`); else if (n.theirs !== r.theirs) moved.push(`${r.axis}: ${figureOf(r)} → ${figureOf(n)}`); }
for (const [k, r] of nowBy) if (!wasBy.has(k)) moved.push(`${r.axis}: a row comes, ${figureOf(r)}`);
const reworded = now.rows.filter((r) => { const o = wasBy.get(keyOf(r)); return o && o.theirs === r.theirs && o.source !== r.source; }).length;

// TYPED on the zone, as every post-build write is (single-pass-exemption-v1):
// who wrote, which field, why, and when it expires. Merged with the
// exemptions the zone already carries.
const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
const ef = zone.emitted_from || (zone.emitted_from = {});
const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: STAMP };
const me = "tools/restamp-zone-v1.mjs";
pb.by = pb.by ? (pb.by.includes(me) ? pb.by : `${pb.by} + ${me}`) : me;
for (const f of ["count_stamp"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (String(pb.by_field[f]).includes(me) ? pb.by_field[f] : `${pb.by_field[f]} + ${me}`) : me; }
const why = "the count stamp is set again from the witness record as it now stands, by the builder's own rule over this zone's own measure, after the record was corrected";
pb.why = pb.why ? (pb.why.includes(why) ? pb.why : `${pb.why}; ${why}`) : why;
const exp = "with this zone's rebuild by a build-zone run that reads the corrected witness record in its single pass";
pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : `${pb.expires}; ${exp}`) : exp;
pb.on = STAMP;
ef.post_build = pb;
zone.count_stamp = now;

const body = gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 });
if (!DRY) writeFileSync(OUT, body);
console.log(`${slug}: ${DRY ? "would be " : ""}restamped from ${basename(WITNESSES)} ${now.witnesses.sha256.slice(0, 12)} (was ${String(was.witnesses.sha256).slice(0, 12)}) · ${now.rows.length} rows (${was.rows.length} before) · ${moved.length ? moved.join("; ") : "no figure moves"}${reworded ? ` · ${reworded} row${reworded === 1 ? "" : "s"} name their source anew` : ""} · zone sha256 ${createHash("sha256").update(body).digest("hex").slice(0, 16)}`);
