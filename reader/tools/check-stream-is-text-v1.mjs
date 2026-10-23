#!/usr/bin/env node
// GUARDS: serve-from-stream-rule-v2-the-successor-stream-is-the-text-bridge-v2-is-its-identity-the-binding-is-the-rights
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE SUCCESSOR STREAM IS THE TEXT, BRIDGE-V2 IS ITS IDENTITY, THE BINDING IS
// THE RIGHTS. tools/serve-from-stream-v2.mjs declares it, and every zone on
// the shelf rides it since the maqaf split was promoted (2026-09-03). This
// check reads every zone and holds it to that.
//
//   L1  the serving tool still declares the rule and the route
//   L2  every zone rides this route or the edition route: none is left on
//       the predecessor bridge, because two id spaces on one shelf is two
//       shelves
//   L3  every zone on this route names its text oracle: a successor stream
//       with its receipt's surface hash reproduced, or the July body
//       unchanged with the manifest and every shard read, each hash 64 hex
//   L4  its identity is bridge-v2's, and the predecessor bridge is named by
//       hash beside it; the rows walked equal the identity's rows, and a
//       successor stream's receipt arithmetic holds: before + added = after
//       = rows walked
//   L5  its rights are a binding's: the source named, the scope the
//       predecessor extent, the successor extent recorded; one posture over
//       every row, held following the display axis with the credit in hand
//   L6  it wears no other route's oracle
//   L7  every zone on the shelf names one bridge-v2 by one hash
//
// What this does NOT prove: that the stream hashes to its receipt today (the
// serve did that, off the branch), or that bridge-v2 is the corpus lane's
// current bridge; the serve's receipt names the hash it read.
//
// Run: node tools/check-stream-is-text-v1.mjs [--zones data/zones] [--tool tools/serve-from-stream-v2.mjs]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); const v = i > -1 ? process.argv[i + 1] : undefined; return v && !v.startsWith("--") ? v : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const TOOL = arg("tool", join(K3, "tools", "serve-from-stream-v2.mjs"));
const RULE = "serve-from-stream-rule-v2-the-successor-stream-is-the-text-bridge-v2-is-its-identity-the-binding-is-the-rights";
const ROUTE = "RESEAL_STREAM_SERVE__BRIDGE_V2";
const EDITION_ROUTE = "EDITION_DOOR_SERVE__BUILT_STREAM";
const HEX64 = /^[0-9a-f]{64}$/u;
const POSTURE_FIELDS = 9;

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");

if (!existsSync(TOOL)) { console.log(`SKIPPED — no serving tool at ${TOOL}`); process.exit(3); }
const src = readFileSync(TOOL, "utf8");
check("L1  the serving tool declares the rule and the route", src.includes(`"${RULE}"`) && src.includes(`"${ROUTE}"`), TOOL.split("/").pop());

if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-")).sort();
const l2 = [], l3 = [], l4 = [], l5 = [], l6 = [];
const bridges = new Map();
let onRoute = 0, zonesRead = 0, streams = 0, bodies = 0, rowsAdded = 0;
for (const f of bins) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  const name = f.replace(/\.bin$/u, "");
  const e = z.emitted_from || {}, walk = e.walk || {}, io = e.identity_oracle || {};
  const route = z.route || walk.route;
  if (route === EDITION_ROUTE) continue;
  if (route !== ROUTE) { l2.push(`${name}: ${route || "no route"}`); continue; }
  onRoute += 1;
  const so = walk.stream_oracle || {}, id = walk.identity || {}, r = walk.rights || {};
  // L3
  const why3 = [];
  if (so.kind === "SUCCESSOR_STREAM") {
    streams += 1;
    if (!HEX64.test(String(so.surface_sha256)) || so.surface_sha256_reproduced !== true) why3.push("surface hash not reproduced");
    if (!HEX64.test(String(so.stream_gz_sha256)) || !so.receipt || !so.stream) why3.push("stream or receipt unnamed");
  } else if (so.kind === "VERIFIED_BODY_UNCHANGED") {
    bodies += 1;
    if (!HEX64.test(String(so.manifest_sha256))) why3.push("manifest hash");
    if (!(Array.isArray(so.shards_read) && so.shards_read.length && so.shards_read.every((s) => s.file && HEX64.test(String(s.sha256))))) why3.push("shards read");
  } else why3.push(`oracle kind ${JSON.stringify(so.kind ?? null)}`);
  if (why3.length) l3.push(`${name}: ${why3.join("; ")}`);
  // L4
  const why4 = [];
  const words = (z.counts || {}).c0_rows_walked ?? (z.counts || {}).words;
  if (!/bridge-v2/u.test(String(io.bridge)) || !HEX64.test(String(io.bridge_sha256))) why4.push(`identity bridge ${io.bridge}`);
  if (!(id.predecessor_bridge && HEX64.test(String(id.predecessor_bridge.bridge_sha256)))) why4.push("predecessor bridge unnamed");
  if (walk.ids_walked !== words || Number(id.rows) !== words || Number(io.sealed_c0_rows) !== words) why4.push(`walked ${walk.ids_walked}, identity ${id.rows}, sealed ${io.sealed_c0_rows}, zone ${words}`);
  if (so.kind === "SUCCESSOR_STREAM") {
    if (Number(so.rows_before) + Number(so.rows_added) !== Number(so.rows_after) || Number(so.rows_after) !== words) why4.push(`receipt ${so.rows_before} + ${so.rows_added} = ${so.rows_after} vs ${words} walked`);
    rowsAdded += Number(so.rows_added) || 0;
  }
  if (Number(id.c0_first) !== io.first_c0_numeric_id || Number(id.c0_last) !== io.last_c0_numeric_id) why4.push("identity ids vs oracle ids");
  if (why4.length) l4.push(`${name}: ${why4.join("; ")}`);
  bridges.set(String(io.bridge_sha256), (bridges.get(String(io.bridge_sha256)) || 0) + 1);
  // L5
  const why5 = [];
  if (!/^ACTIVE_RIGHTS_RESOLUTION_V[23]/u.test(String(r.source))) why5.push(`rights source ${JSON.stringify(r.source ?? null)}`);
  const sc = r.binding_scope || {}, pb = id.predecessor_bridge || {}, ss = r.binding_scope_successor || {};
  if (!(sc.rows === pb.rows && sc.first === pb.c0_first && sc.last === pb.c0_last)) why5.push("binding scope is not the predecessor extent");
  if (!(ss.rows === words && ss.first === Number(id.c0_first) && ss.last === Number(id.c0_last))) why5.push("successor extent not recorded as bridge-v2's");
  const posture = String((e.license_receipts || {}).per_occurrence || "");
  const groups = posture.split(" — computed over")[0].split(" | ");
  if (groups.length !== 1) why5.push(`${groups.length} postures across the rows`);
  const g = (groups[0].match(/^([\d,]+) rows: (.*)$/u) || []);
  if (!g[2]) why5.push("no posture line");
  else {
    if (Number(g[1].replace(/,/gu, "")) !== words) why5.push(`posture covers ${g[1]} rows`);
    const fields = g[2].split(" · ");
    if (fields.length !== POSTURE_FIELDS) why5.push(`${fields.length} posture fields`);
    const axis = fields[2], credit = !!(r.credit && r.credit.line);
    const held = Number((z.counts || {}).held) || 0;
    const expectHeld = axis === "ALLOW" || (axis === "ALLOW_WITH_ATTRIBUTION" && credit) ? 0 : words;
    if (held !== expectHeld) why5.push(`axis ${axis}${credit ? " with credit" : ""} yet ${held} held`);
  }
  if (why5.length) l5.push(`${name}: ${why5.join("; ")}`);
  // L6
  if (walk.body_oracle || walk.sealed_oracle || walk.edition) l6.push(name);
}
check("L2  every zone rides this route or the edition route; none is left on the predecessor bridge", l2.length === 0, l2.length ? `${l2.length} — ${few(l2)}` : `${onRoute} on the stream route among ${zonesRead}`);
if (!onRoute) { console.log(`SKIPPED — none of ${zonesRead} zones rides ${ROUTE}; L3 to L7 had nothing to judge`); process.exit(bad ? 1 : 3); }
check("L3  every zone names its text oracle with its hashes reproduced or its shards read", l3.length === 0, l3.length ? `${l3.length} — ${few(l3)}` : `${streams} from successor streams, ${bodies} from the July body unchanged`);
check("L4  its identity is bridge-v2's with the predecessor named, and the receipt arithmetic holds", l4.length === 0, l4.length ? `${l4.length} — ${few(l4)}` : `${rowsAdded.toLocaleString()} rows added by the split across the shelf`);
check("L5  its rights are a binding's, scoped to the predecessor, one posture, held following the axis", l5.length === 0, l5.length ? `${l5.length} — ${few(l5)}` : "source, scope and posture agree");
check("L6  it wears no other route's oracle", l6.length === 0, l6.length ? `${l6.length} — ${few(l6)}` : "none");
check("L7  every zone on the shelf names one bridge-v2 by one hash", bridges.size === 1, bridges.size === 1 ? `${[...bridges.keys()][0].slice(0, 16)}… on ${onRoute}` : `${bridges.size} bridges — ${[...bridges.entries()].map(([k, n]) => `${k.slice(0, 12)}… ×${n}`).join(", ")}`);
console.log("\n  what this does not say: that a stream hashes to its receipt today, or that bridge-v2 is");
console.log("  the corpus lane's current bridge; the serve's receipt names the hash it read.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
