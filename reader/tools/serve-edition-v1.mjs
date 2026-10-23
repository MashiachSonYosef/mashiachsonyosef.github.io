#!/usr/bin/env node
// LEDGER: O U N
// an edition (O) of a work (U) served with the rights the edition door gives
// it (N): the serve NDJSON and the edition bridge this tool writes are the
// inputs the zone builder reads; nothing here writes into data/.
//
// Synthesis lane · edition-serve-rule-v1-the-edition-is-the-text-the-door-is-the-rights
//
// THE EDITION IS THE TEXT. THE DOOR IS THE RIGHTS. The corpus lane builds
// every admissible edition of a work as its own token stream, with a unit
// map beside it and a receipt naming the stream by hash (editions-built-v1,
// 2026-09-02), and lists each edition on the edition door with its licence
// family, licensor, kind and coverage (serve-set-v9-built.csv). The owner's
// ruling of 2026-09-02: all editions serve, none canonical, the reader
// chooses, differences are findings. This tool serves ONE edition:
//
//   1. the stream is verified before a row is read: the surfaces, one per
//      line, hash to the receipt's surface_token_stream_sha256, and the keys
//      to its normalized_token_stream_sha256 — recomputed here, never
//      trusted. A stream that does not hash to its receipt is refused.
//   2. the unit map is held to the stream: the units cover exactly its rows,
//      contiguously, in order. Otherwise refused.
//   3. the rights are the door's row, joined to N's own profile catalog by
//      licence class and version — the same catalog the body serves draw
//      from — and carried verbatim on every row. A family the catalog holds
//      no profile for, a profile whose display state is HOLD, a display
//      conditioned on attribution with no credit in hand, a pending or
//      undeclared row: each refuses by name. Nothing is guessed.
//   4. the identity is the edition's own position space: rows 1..N, units
//      by the sidecar. It is written as an edition bridge in the bridge's own
//      column layout, so the zone builder's identity oracle reads it
//      unchanged and the zone says which edition it is by the receipt's hash.
//
// Run: node tools/serve-edition-v1.mjs --door <serve-set csv> --edition <O-ED id>
//        --built <dir holding <O-ED>-{whole|assembled}.{json,tokens.csv.gz,units.csv.gz}>
//        [--profiles build/rights-binding-v3/rights-profiles-v3.csv]
//        --out <serve ndjson> --bridge-out <edition bridge csv.gz>
import { readFileSync, writeFileSync, existsSync, createWriteStream } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DOOR = arg("door"), EDITION = arg("edition"), BUILT = arg("built"), OUT = arg("out"), BRIDGE_OUT = arg("bridge-out");
const PROFILES = arg("profiles", join(K3, "build", "rights-binding-v3", "rights-profiles-v3.csv"));
const die = (code, why) => { console.error(`${code}: ${why}`); process.exit(1); };
for (const [k, v] of [["door", DOOR], ["edition", EDITION], ["built", BUILT], ["out", OUT], ["bridge-out", BRIDGE_OUT]]) if (!v) die("MISSING_ARG", `--${k}`);

export const RULE = "edition-serve-rule-v1-the-edition-is-the-text-the-door-is-the-rights";
export const ROUTE = "EDITION_DOOR_SERVE__BUILT_STREAM";
export const RIGHTS_SOURCE = "EDITION_DOOR__LICENCE_FAMILY_JOINED_TO_PROFILE_CATALOG";

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
// minimal RFC-4180: quoted fields carry commas, quotes and newlines
const csv = (text) => {
  const out = []; let cur = "", q = false, row = [];
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i += 1; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n") { row.push(cur); out.push(row); row = []; cur = ""; }
    else if (ch !== "\r") cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); out.push(row); }
  return out;
};
const table = (text) => { const rows = csv(text); const h = rows[0]; return rows.slice(1).filter((r) => r.length === h.length).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]]))); };

// ── the door's row ────────────────────────────────────────────────────────
const doorBytes = readFileSync(DOOR);
const doorRow = table(doorBytes.toString("utf8")).find((r) => r.edition_o_id === EDITION);
if (!doorRow) die("EDITION_NOT_ON_DOOR", `${EDITION} is not a row of ${DOOR}`);
const workId = doorRow.work_id;
if (!/^[a-z0-9_-]+\/[^\s]+$/u.test(workId)) die("DOOR_WORK_ID_SHAPE", workId);

// ── the three built files ─────────────────────────────────────────────────
const base = ["whole", "assembled"].map((k) => join(BUILT, `${EDITION}-${k}`)).find((p) => existsSync(p + ".json"));
if (!base) die("EDITION_FILES_MISSING", `${BUILT}/${EDITION}-{whole,assembled}.json`);
const receipt = JSON.parse(readFileSync(base + ".json", "utf8"));
if (receipt.edition_o_id !== EDITION || receipt.work_id !== workId) die("RECEIPT_DISAGREES_WITH_DOOR", `${receipt.edition_o_id} ${receipt.work_id} vs ${EDITION} ${workId}`);
const tokensGz = readFileSync(base + ".tokens.csv.gz");
const tokens = csv(gunzipSync(tokensGz).toString("utf8")).slice(1).filter((r) => r.length >= 2 && r[0] !== "");
const unitsGz = readFileSync(base + ".units.csv.gz");
const units = csv(gunzipSync(unitsGz).toString("utf8")).slice(1).filter((r) => r.length >= 3 && r[0] !== "")
  .map((r) => ({ unit_id: r[0], start: Number(r[1]), rows: Number(r[2]) }));

// 1. the stream hashes to its receipt, recomputed here
const surfaceSha = sha256(Buffer.from(tokens.map((t) => t[0]).join("\n") + "\n", "utf8"));
const normalizedSha = sha256(Buffer.from(tokens.map((t) => t[1]).join("\n") + "\n", "utf8"));
if (surfaceSha !== receipt.surface_token_stream_sha256) die("EDITION_STREAM_HASH_MISMATCH", `surfaces hash to ${surfaceSha.slice(0, 12)}, the receipt says ${String(receipt.surface_token_stream_sha256).slice(0, 12)}`);
if (normalizedSha !== receipt.normalized_token_stream_sha256) die("EDITION_STREAM_HASH_MISMATCH", `keys hash to ${normalizedSha.slice(0, 12)}, the receipt says ${String(receipt.normalized_token_stream_sha256).slice(0, 12)}`);
if (Number(receipt.built_rows) !== tokens.length) die("EDITION_ROW_COUNT", `receipt says ${receipt.built_rows} rows, the stream holds ${tokens.length}`);

// 2. the unit map covers the stream exactly
let expect = 1;
for (const u of units) {
  if (!(Number.isInteger(u.start) && Number.isInteger(u.rows) && u.rows > 0)) die("UNIT_MAP_MALFORMED", JSON.stringify(u));
  if (u.start !== expect) die("UNIT_MAP_NOT_CONTIGUOUS", `${u.unit_id} starts at ${u.start}, expected ${expect}`);
  expect += u.rows;
}
if (expect - 1 !== tokens.length) die("UNIT_MAP_DOES_NOT_COVER", `units cover ${expect - 1} rows, the stream holds ${tokens.length}`);
if (new Set(units.map((u) => u.unit_id)).size !== units.length) die("UNIT_MAP_DUPLICATE_UNIT", "two units share an id");

// 3. the rights: the door's family joined to the catalog's profile
const profilesBytes = existsSync(PROFILES) ? readFileSync(PROFILES) : null;
if (!profilesBytes) die("PROFILE_CATALOG_MISSING", PROFILES);
const profiles = table(profilesBytes.toString("utf8"));
const family = String(doorRow.licence_family || "").trim();
const state = String(doorRow.serve_state || "").trim();
if (state === "PENDING" || family === "NOT_DECLARED" || !family) die("RIGHTS_PENDING_ON_DOOR", `${EDITION}: licence family ${JSON.stringify(family)}, state ${state}`);
// the class the family names, in the catalog's own vocabulary; a provider
// dump's family names the class in its serve state and the version as the
// dump's assertion, which is a profile the catalog holds by that name
let cls = family.replace(/_/gu, "-"), version = "UNSPECIFIED";
if (/public_domain_dump/iu.test(family) && state === "PUBLIC_DOMAIN") { cls = "PUBLIC_DOMAIN"; version = "PROVIDER_DUMP_ASSERTION"; }
else if (/^Sefaria version record/iu.test(family) && /^(PUBLIC_DOMAIN|CC0|CC_BY[A-Z_]*)$/u.test(state)) { cls = state.replace(/_/gu, "-"); }
if (cls === "PUBLIC-DOMAIN") cls = "PUBLIC_DOMAIN";
const profile = profiles.find((p) => p.normalized_license_class === cls && p.license_version === version)
  || profiles.find((p) => p.normalized_license_class === cls && p.license_version === "UNSPECIFIED");
if (!profile) die("RIGHTS_FAMILY_NOT_IN_CATALOG", `${EDITION}: family ${JSON.stringify(family)} (class ${cls}, version ${version}) has no profile in ${PROFILES}; fail-closed, nothing serves`);
// THE RIGHTS ARE THE SOURCE'S OWN ATTESTATION (owner, 2026-09-03): a profile the
// serving rulings record lists as retired is a hold, read from the record.
const retiredProfile = (() => { try { return (JSON.parse(readFileSync(new URL("../data/serving-rulings-v1.json", import.meta.url), "utf8")).retired_rights_profiles || []).find((r) => r.rights_profile_id === profile.rights_profile_id); } catch { return null; } })();
if (retiredProfile) die("RIGHTS_PROFILE_RETIRED", `${EDITION}: profile ${retiredProfile.rights_profile_id} is retired under ${retiredProfile.ruling}: ${retiredProfile.why}`);
if (profile.reader_display_state === "HOLD" || profile.rights_state !== "RESOLVED") die("RIGHTS_HOLD_UNRESOLVED", `${EDITION}: profile ${profile.rights_profile_id} holds (${profile.reader_display_state}, ${profile.rights_state})`);
// a display conditioned on attribution needs the credit in hand; the door
// names a licensor, and "(registry-mapped)" is a pointer at a registry, not
// a credit line. Only a real licensor line discharges it.
const licensor = String(doorRow.licensor || "").trim();
const creditLine = licensor && !/^\(.*\)$/u.test(licensor) ? `${licensor} · edition ${EDITION} of ${workId} · ${cls}${version === "UNSPECIFIED" ? "" : ` (${version})`}` : null;
if (profile.reader_display_state !== "ALLOW" && !creditLine)
  die("RIGHTS_ATTRIBUTION_NOT_IN_CUSTODY", `${EDITION}: reader display is ${profile.reader_display_state}; the door's licensor is ${JSON.stringify(licensor)}, which is not a credit`);
const rights = {
  reader_display_axis: profile.reader_display_state,
  public_distribution_axis: profile.public_distribution_state,
  attribution_required: profile.attribution_required,
  noncommercial_required: profile.noncommercial_required,
  share_alike_required: profile.share_alike_required,
  no_derivatives_required: profile.no_derivatives_required,
  normalized_license_class: profile.normalized_license_class,
  license_version: profile.license_version,
  terminal_resolution_state: profile.rights_state,
};

// 4. the identity: the edition bridge, in the bridge's own layout
const header = "u_id,b_id,n_id,site_root,work_id,unit_id,c0_rows,first_c0_id,last_c0_id,min_c0_numeric_id,max_c0_numeric_id,min_unit_word_index,max_unit_word_index,corpus_family,author_facet,license_state,source_bridge_state";
const family0 = workId.split("/")[0];
const bridgeLines = [header, ...units.map((u, i) => {
  const min = u.start, max = u.start + u.rows - 1;
  return [`U-${EDITION}-${String(i + 1).padStart(6, "0")}`, `B-${EDITION}`, `N-${EDITION}`, family0, workId, u.unit_id, u.rows,
    `C0-${EDITION}-${min}`, `C0-${EDITION}-${max}`, min, max, 0, u.rows - 1, family0, "", "EDITION_DOOR", "EDITION_BUILT_V1"].join(",");
})];
if (bridgeLines.some((l) => l.includes('"'))) die("BRIDGE_QUOTED_FIELDS", "a unit id carries a quote; the bridge layout forbids it");
const bridgeBytes = gzipSync(Buffer.from(bridgeLines.join("\n") + "\n", "utf8"));
writeFileSync(BRIDGE_OUT, bridgeBytes);

// ── the serve ─────────────────────────────────────────────────────────────
const provenance = {
  rule: RULE,
  route: ROUTE,
  edition: {
    edition_o_id: EDITION, work_id: workId, kind: receipt.kind, edition_key: receipt.edition_key,
    built_rows: tokens.length, member_files: receipt.member_files,
    surface_sha256: surfaceSha, normalized_sha256: normalizedSha,
    stream_files: { tokens: `${EDITION}-${base.endsWith("whole") ? "whole" : "assembled"}.tokens.csv.gz`, tokens_gz_sha256: sha256(tokensGz), units_gz_sha256: sha256(unitsGz), receipt_sha256: sha256(readFileSync(base + ".json")) },
    verified: "surfaces and keys re-hashed here, one per line, equal to the receipt; the unit map covers the stream contiguously",
    countersign: "the shipped stream hashes to its receipt (a self-consistency countersign); re-derivation from raw responses awaits their custody",
  },
  door: {
    file: DOOR.split("/").pop(), sha256: sha256(doorBytes),
    row: { edition_o_id: EDITION, work_id: workId, work_common_name: doorRow.work_common_name, kind: doorRow.kind, serve_state: state, licence_family: family, licensor, coverage_pct: doorRow.coverage_pct, built_rows: doorRow.built_rows, work_plan_rows: doorRow.work_plan_rows, labels: doorRow.labels || "" },
  },
  identity: { bridge: BRIDGE_OUT.split("/").pop(), bridge_sha256: sha256(bridgeBytes), units: units.length, c0_first: 1, c0_last: tokens.length },
  rights: {
    source: RIGHTS_SOURCE,
    door_sha256: sha256(doorBytes), profiles_file: PROFILES.split("/").pop(), profiles_sha256: sha256(profilesBytes),
    rights_profile_id: profile.rights_profile_id, normalized_license_id: profile.normalized_license_id, licence_family: family, licensor,
    binding_scope: { first: 1, last: tokens.length, rows: tokens.length },
    ...(creditLine ? { credit: { line: creditLine, source_url: "", license_link: "", basis: "the door's own licensor line; printing it is what discharges the display condition" } } : {}),
  },
  id_count: tokens.length,
};
const out = createWriteStream(OUT);
const wr = (o) => new Promise((r) => (out.write(JSON.stringify(o) + "\n") ? r() : out.once("drain", r)));
await wr({ provenance });
const visible = rights.reader_display_axis === "ALLOW" || (rights.reader_display_axis === "ALLOW_WITH_ATTRIBUTION" && !!creditLine);
let pos = 0;
for (const u of units) {
  for (let j = 0; j < u.rows; j += 1) {
    const t = tokens[pos]; pos += 1;
    await wr({
      c0_numeric_id: pos, status: "FOUND_EXACT", location: { local_unit_id: u.unit_id }, token_ordinal_in_unit: j + 1,
      exact_surface_form: t[0], edition_key: t[1],
      visible_in_hebrew_reader: visible,
      reader_display_axis: rights.reader_display_axis, public_distribution_axis: rights.public_distribution_axis,
      attribution_required: rights.attribution_required, noncommercial_required: rights.noncommercial_required,
      share_alike_required: rights.share_alike_required, no_derivatives_required: rights.no_derivatives_required,
      rights_authority: { normalized_license_class: rights.normalized_license_class, license_version: rights.license_version, terminal_resolution_state: rights.terminal_resolution_state },
    });
  }
}
await new Promise((r) => out.end(r));
console.log(`${OUT}: ${tokens.length.toLocaleString()} rows · ${units.length} units · ${EDITION} of ${workId} (${receipt.kind}, ${doorRow.coverage_pct}%) · rights ${profile.rights_profile_id} ${cls}${creditLine ? " · credit rides" : ""} · stream hashes equal the receipt`);
