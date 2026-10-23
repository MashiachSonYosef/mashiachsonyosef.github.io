#!/usr/bin/env node
// Synthesis lane · serve one work from the corpus lane's successor stream
// under bridge-v2, the rights joined from the binding
//
// RULE: serve-from-stream-rule-v2-the-successor-stream-is-the-text-bridge-v2-is-its-identity-the-binding-is-the-rights
//
// 2026-09-03. The corpus lane split every maqaf compound in 3,042 works into
// its words (moses-ledgers/maqaf-reseal-v1/streams, one stream per work,
// each with a receipt naming two hashes), the website lane countersigned
// (Ruth and Leviticus: successor ink rejoins byte-equal, both hashes
// reproduce), and the corpus lane promoted: "successor streams are the body;
// this bridge carries their identity" (bridge-v2-receipt). Every C0 id after
// the first split moved, so every work is served again on bridge-v2, whether
// its rows split or not.
//
// What this tool does, per work:
//   1. rights first, from the binding, through the one join every route
//      shares (tools/rights-join-v1.mjs); a refusal there reads no text
//   2. identity from bridge-v2: the work's units in order, each with its
//      row count and its new first and last id
//   3. text: the successor stream where the reseal wrote one (its surface
//      hash recomputed and held to the receipt, its row count held to the
//      bridge), else the verified July body, unit by unit, where the reseal
//      skipped the work for having no maqaf and the bridge carries it
//      unchanged (each unit's row count held to the predecessor bridge)
//   4. rows out in the serve shape every builder reads, with bridge-v2 ids
//   5. the binding's scope, which names the predecessor extent, is held to
//      the predecessor bridge; the successor extent is recorded beside it
//
// Nothing is decided here. The split is the corpus lane's; the ids are the
// bridge's; the rights are the binding's; where a count disagrees the work
// refuses with the disagreement named.
//
// Run: node tools/serve-from-stream-v2.mjs --work <id> --bridge-v2 <csv.gz> --bridge <predecessor csv.gz>
//        --streams <dir of maqaf-reseal-v1 streams> --body <verified body dir> --binding <dir> --out <ndjson>
import { createReadStream, createWriteStream, readFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { createGunzip, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";
import { joinRights } from "./rights-join-v1.mjs";

const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const WORK = arg("work") || die("MISSING_ARG", "--work");
const BRIDGE2 = arg("bridge-v2") || die("MISSING_ARG", "--bridge-v2");
const BRIDGE1 = arg("bridge") || die("MISSING_ARG", "--bridge");
const STREAMS = arg("streams") || die("MISSING_ARG", "--streams");
const BODY = arg("body") || die("MISSING_ARG", "--body");
const BINDING = arg("binding") || die("MISSING_ARG", "--binding");
const OUT = arg("out") || die("MISSING_ARG", "--out");
const RULE = "serve-from-stream-rule-v2-the-successor-stream-is-the-text-bridge-v2-is-its-identity-the-binding-is-the-rights";
const ROUTE = "RESEAL_STREAM_SERVE__BRIDGE_V2";
const sha = (b) => createHash("sha256").update(b).digest("hex");

// ---- 1 · rights, before a row of text --------------------------------------
let joined;
try { joined = joinRights({ dir: BINDING, work: WORK }); } catch (e) { const [code, ...rest] = String(e.message).split(": "); die(code, rest.join(": ")); }
const { rights, rightsProvenance, bindingScope } = joined;

// ---- 2 · identity from both bridges ----------------------------------------
const readBridge = (path) => {
  const bytes = readFileSync(path);
  const lines = gunzipSync(bytes).toString("utf8").split("\n");
  const col = Object.fromEntries(lines[0].split(",").map((h, i) => [h.trim(), i]));
  const units = [];
  for (let i = 1; i < lines.length; i += 1) {
    if (!lines[i]) continue;
    const f = lines[i].split(",");
    if (f[col.work_id] !== WORK) continue;
    units.push({ unit_id: f[col.unit_id], c0_rows: Number(f[col.c0_rows]), min: Number(f[col.min_c0_numeric_id]), max: Number(f[col.max_c0_numeric_id]) });
  }
  units.sort((a, b) => a.min - b.min);
  return { sha256: sha(bytes), units, name: basename(path) };
};
const b2 = readBridge(BRIDGE2), b1 = readBridge(BRIDGE1);
if (!b2.units.length) die("WORK_NOT_IN_BRIDGE_V2", WORK);
if (!b1.units.length) die("WORK_NOT_IN_PREDECESSOR_BRIDGE", WORK);
for (const u of b2.units) if (u.max - u.min + 1 !== u.c0_rows) die("BRIDGE_V2_UNIT_ARITHMETIC", `${u.unit_id}: ${u.min}-${u.max} vs ${u.c0_rows} rows`);
const rows2 = b2.units.reduce((n, u) => n + u.c0_rows, 0), rows1 = b1.units.reduce((n, u) => n + u.c0_rows, 0);
const min2 = b2.units[0].min, max2 = b2.units[b2.units.length - 1].max;
const min1 = b1.units[0].min, max1 = b1.units[b1.units.length - 1].max;
const old = new Map(b1.units.map((u) => [u.unit_id, u]));
if (b1.units.length !== b2.units.length || b2.units.some((u) => !old.has(u.unit_id))) die("BRIDGE_V2_UNITS_DIFFER", `${WORK}: ${b1.units.length} units before, ${b2.units.length} after, or a unit renamed`);
// the binding names the predecessor extent
if (bindingScope && !(bindingScope.rows === rows1 && bindingScope.first === min1 && bindingScope.last === max1))
  die("RIGHTS_SCOPE_MISMATCH", `binding covers c0 ${bindingScope.first}-${bindingScope.last} (${bindingScope.rows} rows); the predecessor bridge holds ${min1}-${max1} (${rows1} rows)`);

// ---- 3 · the text: successor stream, or the body unchanged ------------------
// a stream is named for its work; a name too long for the disk is stored
// under a short hashed name the download's index maps to (stream-index.json)
const streamStem = `${WORK.replace(/\//gu, "-")}-maqaf-split-v1`;
const streamIndex = existsSync(join(STREAMS, "stream-index.json")) ? JSON.parse(readFileSync(join(STREAMS, "stream-index.json"), "utf8")) : {};
const streamBase = join(STREAMS, streamIndex[streamStem] || streamStem);
const hasStream = existsSync(`${streamBase}.tokens.csv.gz`) && existsSync(`${streamBase}.json`);
let surfaces = [];        // every row's surface, in stream order
let textOracle = null;
if (hasStream) {
  const receipt = JSON.parse(readFileSync(`${streamBase}.json`, "utf8"));
  const gz = readFileSync(`${streamBase}.tokens.csv.gz`);
  const text = gunzipSync(gz).toString("utf8");
  // csv_escaped_two_field: hebrew,normalized_key — a real RFC-4180 walk on
  // the first field only; the key column is the corpus lane's and unused here
  const lines = text.split("\n");
  if (lines[0].trim() !== "hebrew,normalized_key") die("STREAM_HEADER", `${basename(streamBase)}: ${lines[0].slice(0, 40)}`);
  for (let i = 1; i < lines.length; i += 1) {
    const l = lines[i];
    if (!l) continue;
    let s;
    if (l[0] === '"') { let cur = "", j = 1; for (; j < l.length; j += 1) { if (l[j] === '"') { if (l[j + 1] === '"') { cur += '"'; j += 1; } else break; } else cur += l[j]; } s = cur; }
    else s = l.slice(0, l.indexOf(","));
    surfaces.push(s);
  }
  const surfaceSha = sha(surfaces.join("\n") + "\n");
  if (surfaceSha !== receipt.surface_token_stream_sha256) die("STREAM_HASH_MISMATCH", `${basename(streamBase)}: surfaces hash ${surfaceSha.slice(0, 12)}…, receipt ${String(receipt.surface_token_stream_sha256).slice(0, 12)}…`);
  if (surfaces.length !== rows2) die("STREAM_ROWS_VS_BRIDGE_V2", `${basename(streamBase)}: ${surfaces.length} rows, bridge-v2 holds ${rows2}`);
  if (Number(receipt.rows_before) !== rows1) die("STREAM_PREDECESSOR_ROWS", `receipt says ${receipt.rows_before} rows before, the predecessor bridge holds ${rows1}`);
  if (Number(receipt.rows_after) !== rows2) die("STREAM_SUCCESSOR_ROWS", `receipt says ${receipt.rows_after} rows after, bridge-v2 holds ${rows2}`);
  textOracle = {
    kind: "SUCCESSOR_STREAM",
    stream: `${basename(streamBase)}.tokens.csv.gz`,
    stream_gz_sha256: sha(gz),
    receipt: `${basename(streamBase)}.json`,
    receipt_status: receipt.status,
    surface_sha256: surfaceSha,
    surface_sha256_reproduced: true,
    normalized_sha256: receipt.normalized_sha256 || receipt.normalized_token_stream_sha256,
    rows_before: Number(receipt.rows_before), rows_after: Number(receipt.rows_after),
    maqaf_sites_split: Number(receipt.maqaf_sites_split), rows_added: Number(receipt.rows_added),
    reversibility: receipt.reversibility,
    law: receipt.law,
    countersign: "website lane, 2026-09-03: Ruth and Leviticus successor ink rejoins byte-equal to the predecessor rows; both hashes reproduce; this serve reproduces the surface hash again for every work it serves",
  };
} else {
  // unsplit: the bridge must carry the work unchanged, unit for unit
  for (const u of b2.units) { const o = old.get(u.unit_id); if (o.c0_rows !== u.c0_rows) die("UNSPLIT_WORK_BRIDGE_DISAGREES", `${WORK}: no successor stream, yet ${u.unit_id} holds ${o.c0_rows} rows before and ${u.c0_rows} after`); }
  const MAN = join(BODY, "c0-active-rebuild-partial-manifest.csv");
  if (!existsSync(MAN)) die("BODY_MANIFEST_MISSING", MAN);
  const manBytes = readFileSync(MAN);
  const manLines = manBytes.toString("utf8").trim().split("\n");
  const mCol = Object.fromEntries(manLines[0].split(",").map((h, i) => [h.trim(), i]));
  const shards = [];
  for (let i = 1; i < manLines.length; i += 1) {
    const f = manLines[i].split(",");
    const lo = Number(f[mCol.first_c0_numeric_id]), hi = Number(f[mCol.last_c0_numeric_id]);
    if (hi < min1 || lo > max1) continue;
    shards.push({ file: f[mCol.slice_file], sha256: f[mCol.sha256], lo });
  }
  if (!shards.length) die("WORK_NOT_IN_BODY", `${WORK}: predecessor c0 ${min1}-${max1} touches no shard`);
  shards.sort((a, b) => a.lo - b.lo);
  const csvSplit = (line) => { const o = []; let cur = "", q = false; for (let i = 0; i < line.length; i += 1) { const c = line[i]; if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i += 1; } else q = false; } else cur += c; } else if (c === '"') q = true; else if (c === ",") { o.push(cur); cur = ""; } else cur += c; } o.push(cur); return o; };
  let lastId = -1;
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
      surfaces.push(f[col.hebrew]);
    }
  }
  if (surfaces.length !== rows1) die("BODY_ROWS_VS_PREDECESSOR_BRIDGE", `${WORK}: read ${surfaces.length} rows, the predecessor bridge holds ${rows1}`);
  textOracle = {
    kind: "VERIFIED_BODY_UNCHANGED",
    manifest: basename(MAN), manifest_sha256: sha(manBytes),
    shards_verified: "4646/4646 byte-exact against the July manifest, re-hashed by the website lane",
    shards_read: shards.map((s) => ({ file: s.file, sha256: s.sha256 })),
    why: "the reseal skipped this work for carrying no maqaf; bridge-v2 carries every unit at its predecessor row count, so the July body's rows are the text, re-identified",
  };
}

// ---- 4 · rows out, with bridge-v2 ids -------------------------------------
const out = createWriteStream(OUT);
const wr = (o) => new Promise((r) => (out.write(JSON.stringify(o) + "\n") ? r() : out.once("drain", r)));
const visible = rights.reader_display_axis === "ALLOW" || (rights.reader_display_axis === "ALLOW_WITH_ATTRIBUTION" && !!rightsProvenance.credit);
await wr({
  provenance: {
    rule: RULE,
    route: ROUTE,
    stream_oracle: textOracle,
    identity: {
      bridge: b2.name, bridge_sha256: b2.sha256, units: b2.units.length, c0_first: min2, c0_last: max2, rows: rows2,
      predecessor_bridge: { bridge: b1.name, bridge_sha256: b1.sha256, c0_first: min1, c0_last: max1, rows: rows1 },
      rows_added_by_split: rows2 - rows1,
    },
    rights: { ...rightsProvenance, binding_scope_successor: { first: min2, last: max2, rows: rows2, note: "the binding names the predecessor extent (verified against the predecessor bridge); the successor extent is bridge-v2's" } },
  },
});
let at = 0, rows = 0;
for (const u of b2.units) {
  for (let ord = 1; ord <= u.c0_rows; ord += 1) {
    const s = surfaces[at]; at += 1;
    await wr({
      c0_numeric_id: u.min + ord - 1,
      status: "FOUND_EXACT",
      location: { local_unit_id: u.unit_id },
      token_ordinal_in_unit: ord,
      exact_surface_form: s,
      visible_in_hebrew_reader: visible,
      reader_display_axis: rights.reader_display_axis,
      public_distribution_axis: rights.public_distribution_axis,
      attribution_required: rights.attribution_required,
      noncommercial_required: rights.noncommercial_required,
      share_alike_required: rights.share_alike_required,
      no_derivatives_required: rights.no_derivatives_required,
      rights_authority: { normalized_license_class: rights.normalized_license_class, license_version: rights.license_version, terminal_resolution_state: rights.terminal_resolution_state },
    });
    rows += 1;
  }
}
if (at !== surfaces.length) die("ROWS_LEFT_OVER", `${surfaces.length - at} rows past the bridge's units`);
await new Promise((r) => out.end(r));
console.log(`${OUT}: ${rows.toLocaleString()} rows · ${b2.units.length} units · c0 ${min2}-${max2} · ${textOracle.kind}${rows2 - rows1 ? ` · ${(rows2 - rows1).toLocaleString()} rows added by the split` : ""}`);
