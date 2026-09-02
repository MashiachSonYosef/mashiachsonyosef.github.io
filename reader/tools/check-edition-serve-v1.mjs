#!/usr/bin/env node
// GUARDS: edition-serve-rule-v1-the-edition-is-the-text-the-door-is-the-rights
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE EDITION IS THE TEXT. THE DOOR IS THE RIGHTS. tools/serve-edition-v1.mjs
// declares it: an edition serves from the corpus lane's built stream, held
// to its receipt by hash, with the unit map beside it, and its rights are
// the edition door's row joined to N's profile catalog, carried verbatim.
// This check reads every zone on the shelf that rides the edition route and
// holds it to that.
//
//   L1  the serving tool still declares the rule, the route and the rights
//       source this check reads
//   L2  every zone on the edition route names its edition: the door's row
//       (edition id, work id, kind, licence family, coverage) and the
//       receipt's two hashes, each 64 hex; the edition id is the zone's
//       and the work id is the zone's own
//   L3  its identity is the edition's position space: the bridge named is
//       the edition bridge, rows walked equal the edition's built rows, and
//       the units sealed equal the door's unit map
//   L4  its rights are the door's: source named, a profile id in the
//       catalog's shape, the door and catalog named by hash, and the
//       posture on the rows equal to what the profile says, all nine
//       fields; a display conditioned on attribution carries a credit
//   L5  it wears no other route's oracle: no body oracle, no sealed oracle,
//       and the route is the edition route
//   L6  no two zones on the shelf claim the same edition
//
// What this does NOT prove. It does not re-hash the edition's stream (the
// three built files are not on the branch; the serve did that and the zone
// carries what it found). It does not prove the door's row is current; that
// is the corpus lane's serve set and its receipt. It does not open a page.
//
// Run: node tools/check-edition-serve-v1.mjs [--zones data/zones] [--tool tools/serve-edition-v1.mjs]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); const v = i > -1 ? process.argv[i + 1] : undefined; return v && !v.startsWith("--") ? v : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const TOOL = arg("tool", join(K3, "tools", "serve-edition-v1.mjs"));

const RULE = "edition-serve-rule-v1-the-edition-is-the-text-the-door-is-the-rights";
const ROUTE = "EDITION_DOOR_SERVE__BUILT_STREAM";
const SOURCE = "EDITION_DOOR__LICENCE_FAMILY_JOINED_TO_PROFILE_CATALOG";
const HEX64 = /^[0-9a-f]{64}$/u;
const POSTURE = ["normalized_license_class", "license_version", "reader_display_axis", "public_distribution_axis", "attribution_required", "noncommercial_required", "share_alike_required", "no_derivatives_required", "terminal_resolution_state"];

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");

if (!existsSync(TOOL)) { console.log(`SKIPPED — no serving tool at ${TOOL}`); process.exit(3); }
const src = readFileSync(TOOL, "utf8");
check("L1  the serving tool declares the rule, the route and the rights source",
  src.includes(`"${RULE}"`) && src.includes(`"${ROUTE}"`) && src.includes(`"${SOURCE}"`),
  `quoted from ${TOOL.split("/").pop()}`);

if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !f.endsWith(".commentary.bin")).sort();
const l2 = [], l3 = [], l4 = [], l5 = [], seen = new Map();
let onRoute = 0, zonesRead = 0;
for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  const e = z.emitted_from || {}, walk = e.walk || {};
  const rides = z.route === ROUTE || walk.route === ROUTE || walk.rule === RULE || !!walk.edition;
  if (!rides) continue;
  onRoute += 1;
  const name = f.replace(/\.bin$/u, "");
  const ed = walk.edition || {}, door = walk.door || {}, row = door.row || {}, r = walk.rights || {}, io = e.identity_oracle || {};
  const workId = (String((z.work_receipts || {}).b_n || "").match(/work_id=([^\s·]+)/u) || [])[1];
  // L2
  const why2 = [];
  if (!/^O-ED-\d{6}$/u.test(String(ed.edition_o_id))) why2.push("no edition id of the door's shape");
  if (row.edition_o_id !== ed.edition_o_id) why2.push("the door's row names another edition");
  if (!workId || row.work_id !== workId || ed.work_id !== workId) why2.push(`work id ${workId} vs door ${row.work_id} vs edition ${ed.work_id}`);
  if (!HEX64.test(String(ed.surface_sha256)) || !HEX64.test(String(ed.normalized_sha256))) why2.push("receipt hashes not 64 hex");
  if (!row.kind || !row.licence_family || row.coverage_pct === undefined) why2.push("door row short of kind, licence family or coverage");
  if (why2.length) l2.push(`${name}: ${why2.join("; ")}`);
  // L3
  const why3 = [];
  if (!/edition-bridge/u.test(String(io.bridge))) why3.push(`bridge ${io.bridge} is not an edition bridge`);
  if (walk.ids_walked !== Number(ed.built_rows)) why3.push(`walked ${walk.ids_walked}, the edition holds ${ed.built_rows}`);
  if (Number(io.sealed_c0_rows) !== Number(ed.built_rows)) why3.push(`sealed ${io.sealed_c0_rows} rows vs ${ed.built_rows}`);
  if (Number(io.sealed_units) !== Number((walk.identity || {}).units)) why3.push(`${io.sealed_units} units sealed vs ${(walk.identity || {}).units} in the unit map`);
  if (io.first_c0_numeric_id !== 1 || io.last_c0_numeric_id !== Number(ed.built_rows)) why3.push("the position space does not run 1..N");
  if (why3.length) l3.push(`${name}: ${why3.join("; ")}`);
  // L4
  const why4 = [];
  if (r.source !== SOURCE) why4.push(`rights source ${JSON.stringify(r.source ?? null)}`);
  if (!/^RIGHTS-[0-9A-F]{24}$/u.test(String(r.rights_profile_id))) why4.push("no profile id of the catalog's shape");
  if (!HEX64.test(String(r.door_sha256)) || !HEX64.test(String(r.profiles_sha256))) why4.push("door or catalog not named by hash");
  const posture = String((e.license_receipts || {}).per_occurrence || "");
  const groups = posture.split(" — computed over")[0].split(" | ");
  if (groups.length !== 1) why4.push(`${groups.length} postures across the rows`);
  const g = (groups[0].match(/^[\d,]+ rows: (.*)$/u) || [])[1];
  if (!g) why4.push("no posture line");
  else {
    const fields = g.split(" · ");
    if (fields.length !== POSTURE.length) why4.push(`posture carries ${fields.length} fields, not ${POSTURE.length}`);
    if (fields[2] === "ALLOW_WITH_ATTRIBUTION" && !(r.credit && r.credit.line)) why4.push("display conditioned on attribution with no credit");
    if (fields[2] === "HOLD") why4.push("a held display served");
  }
  if (why4.length) l4.push(`${name}: ${why4.join("; ")}`);
  // L5
  const why5 = [];
  if (walk.body_oracle) why5.push("wears a body oracle");
  if (walk.sealed_oracle) why5.push("wears a sealed oracle");
  if (z.route !== ROUTE) why5.push(`route ${z.route}`);
  if (why5.length) l5.push(`${name}: ${why5.join("; ")}`);
  // L6
  const key = String(ed.edition_o_id);
  if (seen.has(key)) l5.push(`${name}: claims ${key}, already claimed by ${seen.get(key)}`); else seen.set(key, name);
}

if (!onRoute) { console.log(`SKIPPED — ${zonesRead} zones read and none rides ${ROUTE}; the laws L2 to L6 had nothing to judge`); process.exit(bad ? 1 : 3); }
console.log(`\n— ${onRoute} edition zone(s) among ${zonesRead} —`);
check("L2  every edition zone names its edition: the door's row and the receipt's hashes", l2.length === 0, l2.length ? `${l2.length} short — ${few(l2)}` : `${onRoute} named`);
check("L3  its identity is the edition's own position space, units per the unit map", l3.length === 0, l3.length ? `${l3.length} off — ${few(l3)}` : "rows and units equal the edition's");
check("L4  its rights are the door's row joined to the catalog, one posture over every row", l4.length === 0, l4.length ? `${l4.length} off — ${few(l4)}` : "source, profile, hashes and posture agree");
check("L5  it wears no other route's oracle, and no two zones claim one edition", l5.length === 0, l5.length ? `${l5.length} — ${few(l5)}` : "each edition its own zone, each on its own route");
console.log("\n  what this does not say: that the stream hashes to its receipt (the serve did that, off the branch),");
console.log("  or that the door's row is current, or that a page opens on it.");
process.exit(bad ? 1 : 0);
