#!/usr/bin/env node
// serve-from-body-v1 — one work's serve NDJSON from the verified rebuilt body.
//
// The text authority is the body: the canonical store rematerialized by the
// corpus lane and re-hashed on this side, 4,646/4,646 shards byte-exact
// against the July manifest. The rights authority is the binding composite;
// text and rights are different organs and this tool refuses to conflate
// them: no rights source in custody, no serve — the fleet records the hold
// with that reason, per work, and nothing is emitted.
//
// Output is the same NDJSON contract mishkan-serve emits (line 1 provenance,
// then rows ascending by c0_numeric_id), so build-zone and every gate behind
// it run unchanged. The route is named for what it is — BODY_REBUILD_SERVE —
// never dressed as a terminal-reader walk it did not make, and the oracle it
// cites is the one that actually vouched for these bytes: the July manifest
// this lane re-hashed the shards against.
//
// Rights sources, in order of dignity:
//   --binding <dir>    the canonical current N — active-rights-resolution-v2
//                      (work → rights_profile_id → 9-profile catalog), shipped
//                      by the corpus lane on the owner's word and verified on
//                      this side against its SHA256SUMS and the bridge census.
//                      Fail-closed: no row, or an unresolved row, serves nothing
//   --rights-fixture <json> + --fixture   an instrument: rights copied from a
//                      declared record for an end-to-end proof, allowed ONLY
//                      with --fixture, which brands the provenance so no gate
//                      ever lets the output serve
//
// Rule id: serve-from-body-rule-v1-the-verified-body-is-the-text-the-binding-is-the-rights
//
// Run: node tools/serve-from-body-v1.mjs --work <id> --body <dir> \
//        --bridge <csv.gz> --out <ndjson> [--binding <dir>]
//        [--rights-fixture <json> --fixture]
import { createReadStream, createWriteStream, readFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";

const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const has = (n) => process.argv.includes(`--${n}`);
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };

const WORK = arg("work") || die("MISSING_ARG", "--work");
const BODY = arg("body") || die("MISSING_ARG", "--body");
const BRIDGE = arg("bridge") || die("MISSING_ARG", "--bridge");
const OUT = arg("out") || die("MISSING_ARG", "--out");
const RULE = "serve-from-body-rule-v1-the-verified-body-is-the-text-the-binding-is-the-rights";

const csvSplit = (line) => {
  // quoted fields carry commas (capture URLs, provider assertions); a real
  // RFC-4180 walk, minimal
  const outF = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i += 1; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { outF.push(cur); cur = ""; }
    else cur += c;
  }
  outF.push(cur);
  return outF;
};
const readCsv = (path) => {
  const lines = readFileSync(path, "utf8").trim().split("\n");
  const col = csvSplit(lines[0]);
  return lines.slice(1).map((l) => Object.fromEntries(csvSplit(l).map((v, i) => [col[i], v])));
};

// ---- rights: refuse before reading a single row of text -------------------
let rightsOf = null;   // (row) => rights fields, or null meaning "not in custody"
let rightsProvenance = null;
let bindingScope = null; // the binding's own claim of extent, verified against the serve at the end
if (arg("binding")) {
  // The canonical current N: active-rights-resolution-v2, shipped by the
  // corpus lane on the owner's word (staging 706d122, verified 245/245
  // against SHA256SUMS-n-and-rights.txt, then counter-verified on this side:
  // one row per work, c0 ranges byte-equal to the bridge's own aggregates).
  // work → rights_profile_id → the 9-profile catalog in the same shipment.
  // Fail-closed is the shipment's own law and this join keeps it: a work the
  // resolution does not carry, or carries unresolved, serves nothing.
  const dir = arg("binding");
  const bindsPath = join(dir, "representation-rights-bindings-v2.csv");
  const profsPath = join(dir, "rights-profiles-v2.csv");
  if (!existsSync(bindsPath) || !existsSync(profsPath))
    die("BINDING_FILES_MISSING", `${dir} does not carry representation-rights-bindings-v2.csv + rights-profiles-v2.csv`);
  const b = readCsv(bindsPath).find((r) => r.work_id === WORK);
  if (!b) die("RIGHTS_NOT_IN_CUSTODY",
    `the canonical rights resolution carries no row for ${WORK}; fail-closed, nothing serves`);
  if (b.rights_state !== "RESOLVED")
    die("RIGHTS_HOLD_UNRESOLVED",
      `the canonical rights resolution holds ${WORK} fail-closed: rights_state=${b.rights_state}`);
  const p = readCsv(profsPath).find((r) => r.rights_profile_id === b.rights_profile_id);
  if (!p) die("RIGHTS_PROFILE_MISSING", b.rights_profile_id);
  // A display conditioned on attribution is dischargeable only with the
  // attribution in hand. This machine holds no attribution string for any
  // work — the licensor identity lives in the N ledger, corpus-side — so a
  // profile that says ALLOW_WITH_ATTRIBUTION serves nothing here: serving
  // the text dark would misread the license as a hold, and serving it lit
  // without the credit would violate it. Fail closed, ask for the cargo.
  if (p.reader_display_state !== "ALLOW")
    die("RIGHTS_ATTRIBUTION_NOT_IN_CUSTODY",
      `${WORK}: reader display is ${p.reader_display_state}; the attribution that discharges it is not in custody — the N ledger's licensor identity is asked of the corpus lane`);
  // the profile's own vocabulary, verbatim — nothing translated here
  const rights = {
    reader_display_axis: p.reader_display_state,
    public_distribution_axis: p.public_distribution_state,
    attribution_required: p.attribution_required,
    noncommercial_required: p.noncommercial_required,
    share_alike_required: p.share_alike_required,
    no_derivatives_required: p.no_derivatives_required,
    normalized_license_class: p.normalized_license_class,
    license_version: p.license_version,
    terminal_resolution_state: p.rights_state,
  };
  rightsOf = () => rights;
  bindingScope = {
    first: Number(b.first_c0_numeric_id),
    last: Number(b.last_c0_numeric_id),
    rows: Number(b.c0_rows),
  };
  rightsProvenance = {
    source: "ACTIVE_RIGHTS_RESOLUTION_V2__CANONICAL_CURRENT",
    bindings_sha256: createHash("sha256").update(readFileSync(bindsPath)).digest("hex"),
    profiles_sha256: createHash("sha256").update(readFileSync(profsPath)).digest("hex"),
    rights_profile_id: b.rights_profile_id,
    normalized_license_id: p.normalized_license_id,
    commercial_use_state: p.commercial_use_state,
    authority_record_id: b.authority_record_id,
    binding_scope: bindingScope,
    note: "rights bind to the exact representation, never the abstract work; profile fields carried verbatim in the resolution's own vocabulary",
  };
} else if (arg("rights-fixture")) {
  if (!has("fixture")) die("FIXTURE_RIGHTS_REQUIRE_FIXTURE_FLAG",
    "an instrument rights source is only lawful in an output branded as an instrument");
  const fx = JSON.parse(readFileSync(arg("rights-fixture"), "utf8"));
  const r = fx.rights || die("FIXTURE_RIGHTS_SHAPE", "expected { basis, rights: {...} }");
  rightsOf = () => r;
  rightsProvenance = {
    source: "RIGHTS_FIXTURE__NEVER_SERVABLE",
    basis: fx.basis || "unstated",
    sha256: createHash("sha256").update(readFileSync(arg("rights-fixture"))).digest("hex"),
  };
} else {
  die("RIGHTS_NOT_IN_CUSTODY",
    `no rights record in custody covers ${WORK}; the binding composite is asked of the corpus lane`);
}

// ---- the work's shape, from the identity oracle ---------------------------
const bridgeBytes = readFileSync(BRIDGE);
const bridgeSha = createHash("sha256").update(bridgeBytes).digest("hex");
const { gunzipSync } = await import("node:zlib");
const bridgeText = gunzipSync(bridgeBytes).toString("utf8");
const bLines = bridgeText.split("\n");
const bCol = Object.fromEntries(bLines[0].split(",").map((h, i) => [h.trim(), i]));
let wMin = Infinity, wMax = -Infinity, wUnits = 0;
for (let i = 1; i < bLines.length; i += 1) {
  if (!bLines[i]) continue;
  const f = bLines[i].split(",");
  if (f[bCol.work_id] !== WORK) continue;
  wUnits += 1;
  wMin = Math.min(wMin, Number(f[bCol.min_c0_numeric_id]));
  wMax = Math.max(wMax, Number(f[bCol.max_c0_numeric_id]));
}
if (!wUnits) die("WORK_NOT_IN_BRIDGE", WORK);

// ---- the shards that hold it, from the body's own manifest ----------------
const MAN = join(BODY, "c0-active-rebuild-partial-manifest.csv");
if (!existsSync(MAN)) die("BODY_MANIFEST_MISSING", MAN);
const manBytes = readFileSync(MAN);
const manSha = createHash("sha256").update(manBytes).digest("hex");
const manLines = manBytes.toString("utf8").trim().split("\n");
const mCol = Object.fromEntries(manLines[0].split(",").map((h, i) => [h.trim(), i]));
const shards = [];
for (let i = 1; i < manLines.length; i += 1) {
  const f = manLines[i].split(",");
  const lo = Number(f[mCol.first_c0_numeric_id]), hi = Number(f[mCol.last_c0_numeric_id]);
  if (hi < wMin || lo > wMax) continue;
  shards.push({ file: f[mCol.slice_file], sha256: f[mCol.sha256], lo });
}
if (!shards.length) die("WORK_NOT_IN_BODY", `${WORK}: c0 ${wMin}-${wMax} touches no shard`);
shards.sort((a, b) => a.lo - b.lo);

// ---- emit -----------------------------------------------------------------
const out = createWriteStream(OUT);
const wr = (o) => new Promise((r) => (out.write(JSON.stringify(o) + "\n") ? r() : out.once("drain", r)));
await wr({
  provenance: {
    rule: RULE,
    route: "BODY_REBUILD_SERVE__VERIFIED_JULY_BODY",
    fixture: has("fixture") || undefined,
    body_oracle: {
      // the oracle that actually vouched for these bytes: the July manifest,
      // every shard of the body re-hashed against it on this side
      manifest: basename(MAN),
      manifest_sha256: manSha,
      shards_verified: "4646/4646 byte-exact against the July manifest, re-hashed by the website lane",
      shards_read: shards.map((s) => ({ file: s.file, sha256: s.sha256 })),
    },
    identity: { bridge: basename(BRIDGE), bridge_sha256: bridgeSha, units: wUnits, c0_first: wMin, c0_last: wMax },
    rights: rightsProvenance,
  },
});

let rows = 0, lastId = -1, lastUnit = null, ordinal = 0;
for (const sh of shards) {
  const path = join(BODY, "shards", sh.file);
  if (!existsSync(path)) die("SHARD_MISSING", sh.file);
  const rl = createInterface({ input: createReadStream(path).pipe(createGunzip()), crlfDelay: Infinity });
  let col = null;
  for await (const line of rl) {
    if (!line) continue;
    if (!col) { col = Object.fromEntries(csvSplit(line).map((h, i) => [h, i])); continue; }
    const f = csvSplit(line);
    if (f[col.work_id] !== WORK) continue;
    const id = Number(f[col.c0_numeric_id]);
    if (id <= lastId) die("BODY_NOT_ASCENDING", `${id} after ${lastId}`);
    lastId = id;
    const unit = f[col.unit_id];
    if (unit !== lastUnit) { lastUnit = unit; ordinal = 0; }
    ordinal += 1;
    const bodyOrdinal = Number(f[col.unit_word_index]);
    if (bodyOrdinal !== ordinal) die("BODY_ORDINAL_GAP", `${unit}: expected ${ordinal}, body says ${bodyOrdinal}`);
    const rights = rightsOf(f);
    await wr({
      c0_numeric_id: id,
      status: "FOUND_EXACT",
      location: { local_unit_id: unit },
      token_ordinal_in_unit: ordinal,
      exact_surface_form: f[col.hebrew],
      visible_in_hebrew_reader: rights.reader_display_axis === "ALLOW",
      reader_display_axis: rights.reader_display_axis,
      public_distribution_axis: rights.public_distribution_axis,
      attribution_required: rights.attribution_required,
      noncommercial_required: rights.noncommercial_required,
      share_alike_required: rights.share_alike_required,
      no_derivatives_required: rights.no_derivatives_required,
      rights_authority: {
        normalized_license_class: rights.normalized_license_class,
        license_version: rights.license_version,
        terminal_resolution_state: rights.terminal_resolution_state,
      },
    });
    rows += 1;
  }
}
await new Promise((r) => out.end(r));
if (!rows) die("WORK_EMPTY_IN_BODY", WORK);
// The binding names its own extent; a serve that read more or less than the
// binding covers is serving rows the rights record never spoke for.
if (bindingScope && (rows !== bindingScope.rows || wMin !== bindingScope.first || wMax !== bindingScope.last))
  die("RIGHTS_SCOPE_MISMATCH",
    `binding covers c0 ${bindingScope.first}-${bindingScope.last} (${bindingScope.rows} rows); served c0 ${wMin}-${wMax} (${rows} rows)`);
console.log(`${OUT}: ${rows.toLocaleString()} rows · ${wUnits} units · c0 ${wMin}-${wMax}${has("fixture") ? " · FIXTURE (never servable)" : ""}`);
