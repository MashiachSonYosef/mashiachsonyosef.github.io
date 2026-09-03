#!/usr/bin/env node
// GUARDS: zone-emit-rule-v8-single-pass-from-sealed-serve
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE RULE. tools/build-zone.mjs declares it at the top of the file: "One
// pass, sources in and a zone out. The zone this replaces was built by four
// in-place patch scripts run one after another over the same file, which
// meant the file could not be rebuilt from anything — it was an heirloom, not
// an output. Nothing here mutates a prior zone. Run it twice on the same
// inputs and you get the same bytes." And: "Inputs, all of them named and
// hashed into the zone's own receipts: --serve, --bridge, --store, --work,
// --title." Every zone the builder writes then says so about itself, in
// emitted_from.build: "no zone is ever patched in place; this file is an
// output of its inputs".
//
// WHY IT EXISTS. A zone that is an output can be made again from its inputs
// and checked against what it was. A zone that has been patched in place can
// only be trusted, because the thing that made it no longer exists. The
// receipts are how a reader tells the two apart without a rebuild: an output
// names its inputs and carries no field its builder does not write.
//
// The manifest lists this rule as UNGUARDED. This is the guard. It reads the
// receipts block of every zone once, off disk, and judges it against the
// builder's own text. The laws:
//
//   L0  the builder still declares the rule and the single-pass promise
//   L1  every zone names every input the builder declares — serve, bridge,
//       store, work, title — each with a hash of the right shape
//   L2  one pass, one set of inputs: where the receipt repeats an input it
//       carries the same hash and the same count every time
//   L3  the gloss table shipped is the table the receipt hashes
//   L4  the store the zone was glossed from is the store on disk (its input
//       package hashes equal the store index's)
//   L5  the zone's readings stand on the store version now on disk: either
//       the store has not moved since the zone was emitted, or the zone names
//       the move (a store_version, or the admission record whose struck set
//       is the store's current struck set)
//   L6  no zone carries evidence of in-place patching it does not type: no
//       field the builder does not write, nothing appended after the
//       builder's last key — except what a TYPED exemption on the zone names
//       (emitted_from.post_build: rule, tool, fields written, store version
//       read, expiry), which is counted and printed, never faulted. Since
//       2026-09-02 the builder writes gloss_m in its own pass; the exemption
//       covers the zones built before that and expires with each rebuild.
//   L7  the same inputs give the same bytes: the builder run twice on one
//       serve, one bridge, one store, one spans template writes one hash.
//       Needs the serve NDJSON, the bridge and the spans template, which the
//       fleet does not keep on the branch. Absent, this half is SKIPPED and
//       says so; it is never passed vacuously.
//
// WHAT THIS DOES NOT PROVE. L1..L6 read what the zone says about itself. They
// do not re-derive a single word from the body, do not open the bridge, and
// cannot tell a receipt that is true from one that was copied whole from a
// true zone. That is L7's job and L7 needs inputs. Nor does this check judge
// whether the readings are right; check-page-agrees-with-store-v1 and
// check-every-reading-licensed-v1 do that.
//
// Run: node tools/check-zone-single-pass-receipts-v1.mjs [--zones data/zones]
//                                                         [--builder tools/build-zone.mjs]
//                                                         [--store data/route-store/index.json]
//                                                         [--manifest data/workspace-manifest-v1.json]
//                                                         [--ledger build/fleet-ledger-v2.json]
//                                                         [--workspace "/mnt/user-data/uploads/999 footsteps"]
//                                                         [--serve-dir build/fleet] [--serve <one.ndjson>]
//                                                         [--bridge <csv.gz>] [--spans <csv.gz>]
//                                                         [--scratch <dir for the two trial builds>]
import { readFileSync, readdirSync, existsSync, statSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const BUILDER = arg("builder", join(K3, "tools", "build-zone.mjs"));
const STORE_INDEX = arg("store", join(K3, "data", "route-store", "index.json"));
const MANIFEST = arg("manifest", join(K3, "data", "workspace-manifest-v1.json"));
const LEDGER = arg("ledger", join(K3, "build", "fleet-ledger-v2.json"));
// The corpus workspace the manifest describes, by the same default the tree's
// own check-workspace-staged-v1 uses. It is not mounted on most machines.
const WORKSPACE = arg("workspace", "/mnt/user-data/uploads/999 footsteps");
const SERVE_DIR = arg("serve-dir", join(K3, "build", "fleet"));
const SERVE = arg("serve", "");
const BRIDGE_FLAG = arg("bridge", "");
const SPANS_FLAG = arg("spans", "");
const SCRATCH = arg("scratch", join(tmpdir(), "check-zone-single-pass-receipts-v1"));

const RULE = "zone-emit-rule-v8-single-pass-from-sealed-serve";
const HEX64 = /^[0-9a-f]{64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}/;

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (arr, n = 3) => arr.filter(Boolean).slice(0, n).join(" · ");
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const isHex = (v) => typeof v === "string" && HEX64.test(v);

// ── L0 · the builder ──────────────────────────────────────────────────────
if (!existsSync(BUILDER)) { console.log(`SKIPPED — no builder at ${BUILDER}, so the rule this gate enforces cannot be quoted`); process.exit(3); }
const builderSrc = readFileSync(BUILDER, "utf8");
const declaresRule = builderSrc.includes(RULE);
const promisesOnePass = /single_pass:\s*true/.test(builderSrc) && /no zone is ever patched in place/.test(builderSrc);
check("L0  the builder still declares the rule and the single-pass promise",
  declaresRule && promisesOnePass,
  declaresRule && promisesOnePass
    ? `quoted from ${basename(BUILDER)}: rule_id and build.single_pass`
    : `${declaresRule ? "" : "the rule id is gone from the builder; "}${promisesOnePass ? "" : "the single-pass promise is gone from the builder; "}this gate has no authority until it is back`);

// What one pass writes. Read off the builder's own zone literal, so the
// field sets below are its and not this file's. The top-level keys are
// listed in the order the builder emits them; the last one is the last thing
// a single pass writes, and anything after it in a file was appended later.
const TOP_KEYS = ["schema_version", "rule_id", "work", "work_he", "work_he_tokens", "byline", "work_receipts", "route", "emitted_from", "counts", "nodes", "span_roles", "span_rules", "span_conf", "spans", "gloss", "gloss_m", "sections"];
const LAST_KEY = "sections";
const EMITTED_KEYS = ["kq_policy", "kq_none_attested", "walk", "title_from_c0", "identity_oracle", "license_receipts", "gloss_layer", "span_layer", "y_ledger", "license_links", "coordinate_basis", "numbering", "coordinate_labels", "coordinate_shape", "build", "post_build"];
const GLOSS_LAYER_KEYS = ["source", "key_rule", "rule", "gloss_table_sha256", "distinct_forms_glossed", "distinct_forms_bare", "grain", "store_inputs", "store_version", "m_layer"];
// A zone built before the builder wrote gloss_m carries it from the
// enrichment under a TYPED exemption: emitted_from.post_build names this rule,
// the tool, every field it wrote, the store version it read, and when the
// exemption expires (the zone's rebuild). A mark the exemption names is
// counted and printed, not faulted; an anonymous mark is still a fault. The
// rule does not bend; the pipeline does, and says so on the zone.
const EXEMPTION_RULE = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
const SPAN_LAYER_KEYS = ["rule", "source", "rows_scanned", "forms_with_a_component_system", "component_count_histogram", "derived_cells", "derived_complete_covers", "derivation", "cross_check", "provenance_fields", "roles", "status"];
// The tools in this tree that write into an existing zone, by the field each
// leaves behind. Named so a red line says who to look at, not only that
// something is there.
const PATCH_MARKS = {
  "gloss_m": "tools/enrich-gloss-m-v1.mjs",
  "gloss_layer.language_admission": "tools/redrive-zone-gloss-v1.mjs",
  "gloss_layer.reprojected": "tools/regloss-zone.mjs",
  "span_layer.projected_by": "tools/respan-zone-v1.mjs",
  "span_layer.receipt_carried": "tools/carry-span-receipt-v1.mjs",
};
for (const k of TOP_KEYS) if (!new RegExp(`\\b${k}\\b`).test(builderSrc))
  console.log(`  --  the builder no longer names "${k}"; the field lists here need re-reading against it`);

// ── the store on disk ─────────────────────────────────────────────────────
if (!existsSync(STORE_INDEX)) { console.log(`SKIPPED — no route store index at ${STORE_INDEX}`); process.exit(3); }
const index = JSON.parse(readFileSync(STORE_INDEX, "utf8"));
const storeInputs = (index.inputs || []).map((i) => `${i.file}@${i.sha256}`).sort().join("\n");
const storeVersion = String(index.store_version || "");
const storeMoves = (index.store_version_history || []).map((h) => ({ on: String(h.on || "").slice(0, 10), now: h.now, why: h.why }));
const admission = index.language_admission || null;
const struckNow = admission ? [...(admission.struck_m_ids || [])].sort().join(",") : null;

// ── the shelf, read once ──────────────────────────────────────────────────
if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !f.endsWith(".commentary.bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

let zonesRead = 0, otherRule = 0, unreadable = 0;
const l1 = [], l2 = [], l3 = [], l4 = [], l5 = [];
const l6 = new Map();          // mark -> count
let l6Zones = 0;
const l6ExemptMarks = new Map(); // mark -> count, under a typed exemption
let l6Exempt = 0;
const bridgeNames = new Map(), bridgeHashes = new Map(), spansNames = new Map(), moduleHashes = new Map(), stamps = new Map();
const inc = (m, k) => m.set(k, (m.get(k) || 0) + 1);
let oldestStamp = null, newestStamp = null;

for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { unreadable += 1; continue; }
  if (z.rule_id !== RULE) { otherRule += 1; continue; }
  zonesRead += 1;
  const name = String(z.work || f.replace(/\.bin$/, ""));
  const e = z.emitted_from || {};
  const walk = e.walk || {}, io = e.identity_oracle || {}, gl = e.gloss_layer || {}, sl = e.span_layer || {}, build = e.build || {};
  const counts = z.counts || {};

  // L1 · every declared input, named and hashed ---------------------------
  const missing = [];
  if (!(walk.module && walk.module.path && isHex(walk.module.sha256))) missing.push("serve: walk.module.sha256");
  if (!(walk.pointer && walk.pointer.path && isHex(walk.pointer.sha256))) missing.push("serve: walk.pointer.sha256");
  const bo = walk.body_oracle, so = walk.sealed_oracle;
  if (bo) {
    if (!isHex(bo.manifest_sha256)) missing.push("serve: body_oracle.manifest_sha256");
    if (!(Array.isArray(bo.shards_read) && bo.shards_read.length && bo.shards_read.every((s) => s.file && isHex(s.sha256)))) missing.push("serve: body_oracle.shards_read[].sha256");
  } else if (so) {
    if (!isHex(so.pointer_sha256)) missing.push("serve: sealed_oracle.pointer_sha256");
  } else if (walk.stream_oracle) {
    // the stream route (2026-09-03): the reseal receipt's surface hash,
    // reproduced by the serve, or the July manifest for an unsplit work
    const st = walk.stream_oracle;
    if (st.kind === "SUCCESSOR_STREAM") {
      if (!isHex(st.surface_sha256) || st.surface_sha256_reproduced !== true) missing.push("serve: stream_oracle.surface_sha256 reproduced");
      if (!isHex(st.stream_gz_sha256)) missing.push("serve: stream_oracle.stream_gz_sha256");
    } else if (st.kind === "VERIFIED_BODY_UNCHANGED") {
      if (!isHex(st.manifest_sha256)) missing.push("serve: stream_oracle.manifest_sha256");
      if (!(Array.isArray(st.shards_read) && st.shards_read.length && st.shards_read.every((x) => x.file && isHex(x.sha256)))) missing.push("serve: stream_oracle.shards_read");
    } else missing.push(`serve: stream_oracle of unknown kind ${st.kind}`);
    if (!(walk.identity && walk.identity.predecessor_bridge && isHex(walk.identity.predecessor_bridge.bridge_sha256))) missing.push("serve: identity.predecessor_bridge.bridge_sha256");
  } else if (walk.edition) {
    // the edition route (2026-09-02): the receipt's surface hash is the oracle
    if (!isHex(walk.edition.surface_sha256) || !isHex(walk.edition.normalized_sha256)) missing.push("serve: edition.surface_sha256 / normalized_sha256");
  } else missing.push("serve: no oracle (body_oracle, sealed_oracle, stream_oracle or edition)");
  if (!(io.bridge && isHex(io.bridge_sha256))) missing.push("bridge: identity_oracle.bridge_sha256");
  if (!(Array.isArray(gl.store_inputs) && gl.store_inputs.length && gl.store_inputs.every((i) => i.file && isHex(i.sha256)))) missing.push("store: gloss_layer.store_inputs[].sha256");
  if (!isHex(gl.gloss_table_sha256)) missing.push("store: gloss_layer.gloss_table_sha256");
  if (!/work_id=\S+/.test(String((z.work_receipts || {}).b_n || ""))) missing.push("work: work_receipts.b_n work_id=");
  if (!(typeof z.work === "string" && z.work.trim())) missing.push("title: work");
  if (build.builder !== "tools/build-zone.mjs" || build.single_pass !== true || !DATE.test(String(build.emitted || ""))) missing.push("build: builder/single_pass/emitted");
  if (sl.rule && !(sl.source && isHex(sl.source.sha256))) missing.push("spans: span_layer.source.sha256");
  const y = e.y_ledger || {};
  if (/^current/.test(String(y.status || "")) && !isHex(y.fixture_sha256)) missing.push("y: y_ledger.fixture_sha256");
  if (missing.length) l1.push(`${name}: ${missing.slice(0, 2).join(", ")}`);

  // L2 · the same input, the same hash, everywhere it recurs ---------------
  const dis = [];
  const wi = walk.identity;
  if (wi) {
    if (wi.bridge_sha256 !== io.bridge_sha256) dis.push("bridge hash differs between walk.identity and identity_oracle");
    if (wi.bridge !== io.bridge) dis.push("bridge name differs between walk.identity and identity_oracle");
    if (wi.units !== io.sealed_units) dis.push("unit count differs between walk.identity and identity_oracle");
    if (wi.c0_first !== io.first_c0_numeric_id || wi.c0_last !== io.last_c0_numeric_id) dis.push("c0 range differs between walk.identity and identity_oracle");
  }
  const oracleHash = bo ? bo.manifest_sha256 : so ? so.pointer_sha256 : null;
  if (walk.pointer && oracleHash && walk.pointer.sha256 !== oracleHash) dis.push("walk.pointer hash is not the oracle's");
  // rows walked and words held differ by the kq sites the builder paired
  // (two sealed rows, one word); a zone that names its rows walked is held
  // to that, and its words plus its kq sites must be that number
  const rowsWalked = counts.c0_rows_walked ?? counts.words;
  if (rowsWalked !== walk.ids_walked) dis.push(`counts.c0_rows_walked ${rowsWalked} vs ids_walked ${walk.ids_walked}`);
  if (counts.c0_rows_walked !== undefined && counts.words + (counts.kq_sites || 0) !== counts.c0_rows_walked) dis.push(`counts.words ${counts.words} + kq_sites ${counts.kq_sites || 0} vs c0_rows_walked ${counts.c0_rows_walked}`);
  if (counts.sealed_expected_words !== io.sealed_c0_rows) dis.push("counts.sealed_expected_words vs identity_oracle.sealed_c0_rows");
  if (counts.sections !== (z.sections || []).length) dis.push(`counts.sections ${counts.sections} vs ${(z.sections || []).length} sections`);
  if ((e.license_receipts || {}).attribution !== z.byline) dis.push("license_receipts.attribution is not the byline");
  if (dis.length) l2.push(`${name}: ${dis[0]}`);

  // L3 · the gloss table shipped is the one hashed ------------------------
  const gloss = z.gloss || {};
  const glossHash = sha(JSON.stringify(gloss));
  const glossN = Object.keys(gloss).length;
  if (glossHash !== gl.gloss_table_sha256) l3.push(`${name}: table hashes ${glossHash.slice(0, 12)}, receipt says ${String(gl.gloss_table_sha256 || "").slice(0, 12)}`);
  else if (glossN !== gl.distinct_forms_glossed) l3.push(`${name}: ${glossN} forms in the table, receipt says ${gl.distinct_forms_glossed}`);

  // L4 · the store it was glossed from is the store on disk ---------------
  const zoneInputs = (gl.store_inputs || []).map((i) => `${i.file}@${i.sha256}`).sort().join("\n");
  if (zoneInputs !== storeInputs) l4.push(`${name}: store inputs differ from ${basename(dirname(STORE_INDEX))}/index.json`);

  // L5 · which store version the readings stand on ------------------------
  const emitted = String(build.emitted || "").slice(0, 10);
  const movedSince = storeMoves.filter((m) => m.on && emitted && m.on > emitted);
  if (movedSince.length) {
    const namesVersion = gl.store_version && gl.store_version === storeVersion;
    const la = gl.language_admission;
    const zoneStruck = la ? [...(la.struck_m_ids || [])].sort() : [];
    const namesStrike = la && admission && la.rule_id === admission.rule_id && zoneStruck.join(",") === struckNow;
    if (!namesVersion && !namesStrike) {
      const behind = admission ? (admission.struck_m_ids || []).filter((m) => !zoneStruck.includes(m)).length : 0;
      l5.push(`${name}: emitted ${emitted}, store moved ${movedSince.map((m) => m.on).join(", ")} to ${storeVersion}; the zone names ${la ? `${zoneStruck.length} struck sources, the store has struck ${(admission || {}).struck_m_ids ? admission.struck_m_ids.length : "?"} (${behind} it does not name)` : "no store version and no admission record"}`);
    }
  }

  // L6 · evidence of patching ---------------------------------------------
  const marks = [];
  const topKeys = Object.keys(z);
  const lastAt = topKeys.indexOf(LAST_KEY);
  for (const k of topKeys) if (!TOP_KEYS.includes(k)) marks.push(k);
  if (lastAt > -1 && lastAt !== topKeys.length - 1) marks.push(`(appended after ${LAST_KEY}: ${topKeys.slice(lastAt + 1).join(",")})`);
  for (const k of Object.keys(e)) if (!EMITTED_KEYS.includes(k)) marks.push(`emitted_from.${k}`);
  for (const k of Object.keys(gl)) if (!GLOSS_LAYER_KEYS.includes(k)) marks.push(`gloss_layer.${k}`);
  for (const k of Object.keys(sl)) if (!SPAN_LAYER_KEYS.includes(k)) marks.push(`span_layer.${k}`);
  if (build.note && !/no zone is ever patched in place/.test(String(build.note))) marks.push("build.note rewritten");
  // the typed exemption: the marks it names are its, the rest are faults
  const pb = e.post_build && typeof e.post_build === "object" ? e.post_build : null;
  const exemptionTyped = !!(pb && pb.rule_id === EXEMPTION_RULE && typeof pb.by === "string" && Array.isArray(pb.wrote) && pb.wrote.length && typeof pb.expires === "string" && pb.expires);
  const exempt = new Set(exemptionTyped ? pb.wrote : []);
  const faults = marks.filter((m) => {
    if (m === "emitted_from.post_build") return !exemptionTyped;
    if (exempt.has(m)) return false;
    const appended = /^\(appended after \w+: (.*)\)$/.exec(m);
    if (appended) return !appended[1].split(",").every((k) => exempt.has(k));
    return true;
  });
  if (exemptionTyped) { l6Exempt += 1; for (const m of marks.filter((x) => !faults.includes(x))) inc(l6ExemptMarks, m); }
  if (faults.length) { l6Zones += 1; for (const m of faults) inc(l6, m); }

  // shelf-wide facts, for the summary and for L7's inputs
  inc(bridgeNames, io.bridge); inc(bridgeHashes, io.bridge_sha256);
  if (sl.source && sl.source.path) inc(spansNames, sl.source.path);
  if (walk.module) inc(moduleHashes, `${walk.module.path} ${String(walk.module.sha256).slice(0, 12)}`);
  inc(stamps, emitted);
  if (emitted) { if (!oldestStamp || emitted < oldestStamp) oldestStamp = emitted; if (!newestStamp || emitted > newestStamp) newestStamp = emitted; }
}

if (!zonesRead) { console.log(`SKIPPED — ${bins.length} bins read and none carries rule ${RULE}`); process.exit(3); }

console.log(`\n— ${zonesRead} zones under the rule · ${otherRule} under another builder · ${unreadable} unreadable · emitted ${oldestStamp}..${newestStamp} —`);
console.log(`  bridge: ${[...bridgeNames.keys()].join(", ")} (${bridgeHashes.size} distinct hash${bridgeHashes.size === 1 ? "" : "es"})`);
console.log(`  serve module: ${[...moduleHashes.entries()].map(([k, n]) => `${k} x${n}`).join(" · ")}`);
console.log(`  store: version ${storeVersion || "(none)"} · ${(index.inputs || []).length} input packages · moved ${storeMoves.map((m) => `${m.on} to ${m.now}`).join(", ") || "never"}\n`);

check("L1  every zone names every declared input with a hash of the right shape",
  l1.length === 0,
  l1.length ? `${l1.length} short — ${few(l1)}` : "serve, bridge, store, work, title and build named on every zone");

check("L2  one pass, one set of inputs: a repeated input carries the same hash and count",
  l2.length === 0,
  l2.length ? `${l2.length} disagree — ${few(l2)}` : "every repeated hash and count agrees with itself");

check("L3  the gloss table shipped is the table the receipt hashes",
  l3.length === 0,
  l3.length ? `${l3.length} differ — ${few(l3)}` : "sha256 of the shipped table equals the receipt on every zone");

check("L4  the store the zone was glossed from is the store on disk",
  l4.length === 0,
  l4.length ? `${l4.length} name other input packages — ${few(l4)}` : `every zone names the store's ${(index.inputs || []).length} input packages by file and hash`);

check("L5  the readings stand on the store version now on disk, and the zone says which",
  l5.length === 0,
  l5.length ? `${l5.length} are silent about a move — ${few(l5)}`
    : storeMoves.length ? `the store moved after every build (${storeMoves.map((m) => m.on).join(", ")}) and every zone names the admission record whose struck set is the store's`
      : "the store has not moved since the zones were emitted");

const exemptLine = l6Exempt
  ? ` · ${l6Exempt} zone(s) under a typed exemption for ${[...l6ExemptMarks.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([m, n]) => `${m} x${n}`).join(", ")} — expires with each zone's rebuild`
  : "";
check("L6  no zone carries evidence of in-place patching it does not type",
  l6Zones === 0,
  l6Zones
    ? `${l6Zones}/${zonesRead} zones — ${[...l6.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([m, n]) => `${m} x${n}${PATCH_MARKS[m.replace(/^emitted_from\./, "")] ? ` (written by ${PATCH_MARKS[m.replace(/^emitted_from\./, "")]})` : ""}`).join(" · ")}${exemptLine}`
    : `no field the builder does not write, nothing appended after its last key${exemptLine}`);

// ── L7 · the same inputs give the same bytes ─────────────────────────────
// A serve NDJSON, the bridge and the spans template. The fleet writes each
// serve to build/fleet and deletes it after the zone is built; the bridge and
// the template live in the corpus workspace. So on most machines this half
// has nothing to run on, and it says so rather than passing.
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const manifestPath = (pred) => { const f = ((manifest || {}).files || []).find(pred); return f ? join(WORKSPACE, f.path) : ""; };
const bridgeName = [...bridgeNames.keys()][0] || "";
const spansName = [...spansNames.keys()][0] || "";
const BRIDGE = BRIDGE_FLAG || manifestPath((f) => bridgeName && f.path.endsWith(bridgeName));
const SPANS = SPANS_FLAG || manifestPath((f) => spansName && f.path.endsWith(spansName));
const serveCandidates = SERVE ? [SERVE]
  : existsSync(SERVE_DIR)
    ? readdirSync(SERVE_DIR).filter((f) => f.endsWith(".ndjson")).map((f) => join(SERVE_DIR, f))
      .filter((p) => { try { return /^\{"provenance":/.test(readFileSync(p, "utf8").slice(0, 20)); } catch { return false; } })
      .sort((a, b) => statSync(a).size - statSync(b).size)
    : [];
const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : null;
const workIdFor = (servePath) => {
  const slug = basename(servePath).replace(/\.ndjson$/, "");
  const row = ((ledger || {}).ledger || []).find((r) => String(r.work || "").split("/").pop() === slug || String(r.work || "").replace(/^[^/]+\//, "").replace(/\//g, "-") === slug);
  return row ? row.work : "";
};

const absent = [];
if (!serveCandidates.length) absent.push(`a serve NDJSON (none under ${SERVE_DIR})`);
if (!BRIDGE || !existsSync(BRIDGE)) absent.push(`the bridge${BRIDGE ? ` at ${BRIDGE}` : ` ${bridgeName || ""} (not resolved from ${basename(MANIFEST)})`}`);
if (spansName && (!SPANS || !existsSync(SPANS))) absent.push(`the spans template${SPANS ? ` at ${SPANS}` : ` ${spansName} (not resolved from ${basename(MANIFEST)})`}`);
// The smallest serve whose work the fleet ledger names; a probe file with no
// work behind it cannot be built and is not chosen.
const servePath = serveCandidates.find((p) => workIdFor(p)) || "";
const serveWork = servePath ? workIdFor(servePath) : "";
if (serveCandidates.length && !servePath) absent.push(`a serve whose work ${basename(LEDGER)} names (${serveCandidates.map((p) => basename(p)).slice(0, 3).join(", ")} are not)`);

if (absent.length) {
  console.log(`\n  --  L7 SKIPPED — the rebuild half needs ${absent.join("; ")}. Pass --serve, --bridge, --spans (or --workspace) to run it.`);
} else {
  const bridgeHash = sha(readFileSync(BRIDGE));
  const bridgeIsTheShelfs = bridgeHashes.has(bridgeHash);
  mkdirSync(SCRATCH, { recursive: true });
  const outs = [join(SCRATCH, "trial-a.bin"), join(SCRATCH, "trial-b.bin")];
  const args = (out) => [BUILDER, "--serve", servePath, "--bridge", BRIDGE, "--store", dirname(STORE_INDEX),
    "--work", serveWork, "--title", serveWork.split("/").pop().replace(/[-_]+/g, " "), "--title-from-c0",
    "--out", out, "--stamp", "2000-01-01", ...(SPANS ? ["--spans", SPANS] : [])];
  const runs = outs.map((out) => spawnSync("node", args(out), { cwd: K3, encoding: "utf8", timeout: 75_000 }));
  const refused = runs.find((r) => r.status !== 0);
  if (refused) {
    // the builder's refusals are thrown as "CODE — detail"; quote that line,
    // not the stack frame node prints above it
    const said = String(refused.stderr || refused.stdout || "").split("\n");
    const why = (said.find((l) => /^\w*Error: /.test(l)) || said.find((l) => /\b[A-Z][A-Z_]{4,}\b/.test(l)) || said.find((l) => /\w/.test(l)) || `exit ${refused.status}`).replace(/^\w*Error: /, "");
    console.log(`\n  --  L7 unmeasured — the builder refused ${serveWork} from ${basename(servePath)}: ${why.slice(0, 160)}`);
    console.log("      a refusal is the builder's own gate speaking, not a verdict on determinism; point --serve at a work that builds");
  } else {
    const hashes = outs.map((o) => sha(readFileSync(o)));
    check("L7  the same inputs give the same bytes (the builder run twice on one serve, one bridge, one store)",
      hashes[0] === hashes[1],
      hashes[0] === hashes[1]
        ? `${serveWork}: both runs hash ${hashes[0].slice(0, 16)}${bridgeIsTheShelfs ? "; the bridge on disk is the shelf's" : "; NOTE the bridge on disk is not the one the shelf names"}`
        : `${serveWork}: ${hashes[0].slice(0, 16)} vs ${hashes[1].slice(0, 16)}`);
  }
}

// ── what this does not say ────────────────────────────────────────────────
console.log("\n  what this does not say: that any word on the shelf is the word in the body,");
console.log("  or that a reading is right. L1..L6 read the receipts a zone carries and hold");
console.log("  them to the builder's own field list; a receipt copied whole from a true zone");
console.log("  would pass them. Only L7 rebuilds, and only when the inputs are here. A red L6");
console.log("  says the files on disk are not outputs of the builder; the builder's own text");
console.log("  names the remedy — a fleet run from source, or the builder writing in its one");
console.log("  pass what the patch tools now write after it.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
