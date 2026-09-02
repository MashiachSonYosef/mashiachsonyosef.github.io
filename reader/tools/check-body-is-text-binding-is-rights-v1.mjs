#!/usr/bin/env node
// GUARDS: serve-from-body-rule-v1-the-verified-body-is-the-text-the-binding-is-the-rights
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE VERIFIED BODY IS THE TEXT. THE BINDING IS THE RIGHTS. They are two
// organs and a serve may not conflate them. tools/serve-from-body-v1.mjs
// declares it in its own header:
//
//   "The text authority is the body: the canonical store rematerialized by
//    the corpus lane and re-hashed on this side, 4,646/4,646 shards byte-exact
//    against the July manifest. The rights authority is the binding composite;
//    text and rights are different organs and this tool refuses to conflate
//    them: no rights source in custody, no serve."
//
// Why it exists. A text can be read for what it is; a license cannot. Nothing
// in a row of Hebrew says who may show it, and a serve that guessed rights
// from the text, or defaulted them, would be serving a posture nobody granted.
// So the tool takes every surface form from a body shard the July manifest
// vouches for, and takes every rights field from one binding row joined to
// one profile in the rights catalog, carried verbatim in the resolution's own
// vocabulary. It writes both authorities into line 1 of the serve NDJSON,
// each named by sha256, and build-zone copies that line whole into the zone
// under emitted_from.walk. The zone therefore says, of itself, which body
// its words came from and which binding its rights came from. That is what
// this check reads, and where the binding is in custody it re-does the join.
//
//   L1  the tool still declares the rule: text from the body row, rights
//       from the binding or nothing, refused before a row of text is read
//   L2  every zone on this route names its body oracle by hash of the
//       right shape: the manifest, every shard read, and the pointer
//   L3  every zone's rights name a binding source, never a guess and never
//       an instrument
//   L4  one binding row, one posture, over exactly the rows served: the
//       rights do not vary with the text, and the held count follows the
//       display axis the record carries and nothing else
//   L5  the body the zones cite is the body in custody: the manifest hashes
//       to what they say, and the shards each zone names are exactly the
//       manifest's shards for its range, with the manifest's own hashes
//   L6  the license each zone shows is the one the binding gave: the row for
//       the work, its profile, and every field carried, equal to the record
//   L7  every serve output on disk that rides this route names a binding
//       source or is branded an instrument, and carries one rights record
//       over all its rows, each visible exactly when the axis says ALLOW
//
// L5 needs the body manifest and L6 needs the binding, and neither is on
// every disk. Where one is absent its law is reported in its place as not
// judged. Where the binding is absent altogether the run's verdict cannot be
// a pass: L6 is the half of the rule that says whose rights these are, and a
// shelf whose rights were checked against nothing was not checked. The check
// then exits 3 after printing what the other laws found.
//
// What this check does NOT prove. It does not re-hash a shard: the body's own
// verification against the July manifest is the tool's claim and the corpus
// lane's work, and this check holds the zone to the hashes the manifest
// carries rather than recomputing them. It does not prove the binding is the
// canonical current N; that was verified against SHA256SUMS corpus-side. It
// does not prove the license is VISIBLE on the page; that needs a browser.
// It proves that what every zone shows as its rights is what the binding in
// custody says, and that its text is tied by hash to the body and to nothing
// else.
//
// Run: node tools/check-body-is-text-binding-is-rights-v1.mjs [--zones data/zones]
//        [--tool tools/serve-from-body-v1.mjs] [--binding build/rights-binding]
//        [--body ../../body] [--serves build]
import { readFileSync, readdirSync, existsSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const TOOL = arg("tool", join(K3, "tools", "serve-from-body-v1.mjs"));
const BINDING = arg("binding", join(K3, "build", "rights-binding"));
const BODY = arg("body", join(K3, "..", "..", "body"));
const SERVES = arg("serves", join(K3, "build"));

// The names the tool writes. Quoted here so a zone can be held to them; L1
// confirms the tool still writes these very strings, so the day one is
// renamed this check turns red instead of quietly matching nothing.
const RULE = "serve-from-body-rule-v1-the-verified-body-is-the-text-the-binding-is-the-rights";
const ROUTE = "BODY_REBUILD_SERVE__VERIFIED_JULY_BODY";
const SOURCE_V2 = "ACTIVE_RIGHTS_RESOLUTION_V2__CANONICAL_CURRENT";
const SOURCE_V3 = "ACTIVE_RIGHTS_RESOLUTION_V3__ATTRIBUTION_IN_BINDING";
const SOURCE_FIXTURE = "RIGHTS_FIXTURE__NEVER_SERVABLE";
const BINDING_SOURCES = new Set([SOURCE_V2, SOURCE_V3]);
const MANIFEST = "c0-active-rebuild-partial-manifest.csv";
const SHA256 = /^[0-9a-f]{64}$/;
// The order build-zone's licensePosture writes the nine profile fields in, and
// the profile catalog's column for each. Held to the catalog by name in L6.
const POSTURE_COLS = ["normalized_license_class", "license_version", "reader_display_state", "public_distribution_state",
  "attribution_required", "noncommercial_required", "share_alike_required", "no_derivatives_required", "rights_state"];

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const push = (list, s, cap = 12) => { list.push(list.length < cap ? s : null); };
const named = (list, n = 3) => list.filter(Boolean).slice(0, n).join(" · ");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const isInt = (x) => Number.isInteger(x);

// A quoted field carries commas; the same minimal RFC-4180 walk the tool uses.
const csvSplit = (line) => {
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
  return lines.slice(1).filter(Boolean).map((l) => Object.fromEntries(csvSplit(l).map((v, i) => [col[i], v])));
};

// The per-occurrence receipt: "N rows: a · b · … · i" groups joined by " | ",
// then " — computed over the full serve output on <date>", then a note.
const parsePosture = (s) => {
  const head = String(s || "").split(" — computed over")[0];
  return head.split(" | ").map((g) => {
    const m = g.match(/^([\d,]+) rows: (.*)$/);
    return m ? { rows: Number(m[1].replace(/,/g, "")), tokens: m[2].split(" · ") } : null;
  });
};

// ── L1: the declaring file ────────────────────────────────────────────────
if (!existsSync(TOOL)) {
  console.log(`SKIPPED — no serving tool at ${TOOL}, so the rule this check guards cannot be quoted`);
  process.exit(3);
}
const src = readFileSync(TOOL, "utf8");
const l1Why = [];
if (!(src.includes(`Rule id: ${RULE}`) && src.includes(`const RULE = "${RULE}"`))) l1Why.push("the rule id is gone from the tool");
if (!src.includes(`route: "${ROUTE}"`)) l1Why.push("the route name is gone");
if (!(src.includes(`"${SOURCE_V2}"`) && src.includes(`"${SOURCE_V3}"`) && src.includes(`"${SOURCE_FIXTURE}"`))) l1Why.push("a rights source name is gone");
if (!/exact_surface_form:\s*f\[col\.hebrew\]/.test(src)) l1Why.push("the surface form no longer comes from the body row");
if (!/\}\s*else\s*\{\s*die\("RIGHTS_NOT_IN_CUSTODY"/.test(src)) l1Why.push("the refusal without a rights source is gone");
// rights come from a constant per work, never from the row: both assignments
// are zero-arity and there is no third
const rightsAssign = src.match(/rightsOf = \(\) => (?:rights|r);/g) || [];
if (!(rightsAssign.length === 2 && (src.match(/rightsOf\s*=/g) || []).length === 3)) l1Why.push("rightsOf is no longer a constant per work");
if (!(src.includes('die("FIXTURE_RIGHTS_REQUIRE_FIXTURE_FLAG"') && /if \(!has\("fixture"\)\) die\("FIXTURE_RIGHTS_REQUIRE_FIXTURE_FLAG"/.test(src))) l1Why.push("an instrument rights source no longer needs --fixture");
if (!(src.includes('die("RIGHTS_HOLD_UNRESOLVED"') && src.includes('b.rights_state !== "RESOLVED"'))) l1Why.push("an unresolved binding row no longer refuses");
if (!src.includes('die("RIGHTS_SCOPE_MISMATCH"')) l1Why.push("a serve outside the binding's extent no longer refuses");
if (!/visible_in_hebrew_reader:\s*rights\.reader_display_axis === "ALLOW"/.test(src)) l1Why.push("visibility no longer follows the display axis alone");
const refuseAt = src.lastIndexOf('die("RIGHTS_NOT_IN_CUSTODY"'), textAt = src.indexOf("readFileSync(BRIDGE)");
if (!(refuseAt > -1 && textAt > refuseAt)) l1Why.push("rights are no longer settled before the first byte of text is read");
const l1 = l1Why.length === 0;

// ── the shelf ─────────────────────────────────────────────────────────────
if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.endsWith("-commentary.bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

// ── what is in custody ────────────────────────────────────────────────────
// Every binding file the dir carries, keyed by its own sha256, so a zone is
// joined to the binding it cites and never to a neighbor of it.
const bindingsBySha = new Map(), profilesBySha = new Map(), custodyNote = [];
if (existsSync(BINDING)) {
  for (const v of ["v2", "v3"]) {
    const bp = join(BINDING, `representation-rights-bindings-${v}.csv`), pp = join(BINDING, `rights-profiles-${v}.csv`);
    if (existsSync(bp)) {
      const h = sha(bp);
      bindingsBySha.set(h, { version: v, byWork: new Map(readCsv(bp).map((r) => [r.work_id, r])) });
      custodyNote.push(`bindings ${v} ${h.slice(0, 12)}`);
    }
    if (existsSync(pp)) {
      const h = sha(pp);
      if (!profilesBySha.has(h)) profilesBySha.set(h, { version: v, byId: new Map(readCsv(pp).map((r) => [r.rights_profile_id, r])) });
      custodyNote.push(`profiles ${v} ${h.slice(0, 12)}`);
    }
  }
}
const manifestPath = join(BODY, MANIFEST);
let manifestSha = null, manifestShards = null;
if (existsSync(manifestPath)) {
  manifestSha = sha(manifestPath);
  const lines = readFileSync(manifestPath, "utf8").trim().split("\n");
  const col = Object.fromEntries(lines[0].split(",").map((h, i) => [h.trim(), i]));
  manifestShards = [];
  for (const l of lines.slice(1)) {
    if (!l) continue;
    const f = l.split(",");
    manifestShards.push({ file: f[col.slice_file], sha256: f[col.sha256], lo: Number(f[col.first_c0_numeric_id]), hi: Number(f[col.last_c0_numeric_id]) });
  }
}

// ── the zones ─────────────────────────────────────────────────────────────
const oracleBad = [], rightsBad = [], postureBad = [], bodyBad = [], joinBad = [];
const bodyOther = new Map(); // manifest sha cited -> zones, when not the one in custody
const bindingUncited = new Map(); // bindings/profiles sha cited but not in custody -> zones
let zonesRead = 0, instruments = 0, onRoute = 0, otherRoute = 0, joined = 0, bodyJudged = 0, creditsSeen = 0;
const profilesSeen = new Map();
const zoneOf = (f) => JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));

for (const f of bins) {
  let z;
  try { z = zoneOf(f); } catch { continue; }
  if ((z.emitted_from || {}).test_instrument) { instruments += 1; continue; }
  zonesRead += 1;
  const name = String(z.work || f.replace(/\.bin$/, ""));
  const ef = z.emitted_from || {};
  const walk = ef.walk || null;
  const rights = walk && walk.rights && typeof walk.rights === "object" ? walk.rights : null;
  // an instrument's rights on the shelf is a leak whatever route the zone rides
  if (rights && rights.source === SOURCE_FIXTURE) push(rightsBad, `${name} · wears the instrument's rights source on the shelf`);
  if (walk && walk.fixture) push(rightsBad, `${name} · branded an instrument and on the shelf`);
  const rides = String(z.route || "") === ROUTE || !!(walk && (walk.rule === RULE || walk.body_oracle));
  if (!rides) { otherRoute += 1; continue; }
  onRoute += 1;

  // L2 — the body oracle, named by hash of the right shape
  const bo = walk.body_oracle && typeof walk.body_oracle === "object" ? walk.body_oracle : null;
  const shards = bo && Array.isArray(bo.shards_read) ? bo.shards_read : [];
  const why2 = [];
  if (String(z.route || "") !== ROUTE) why2.push(`route ${z.route}`);
  if (walk.rule !== RULE) why2.push("the walk names another rule");
  if (!bo) why2.push("no body oracle");
  else {
    if (!bo.manifest || typeof bo.manifest !== "string") why2.push("no manifest named");
    if (!SHA256.test(String(bo.manifest_sha256 || ""))) why2.push("manifest hash is not a sha256");
    if (!shards.length) why2.push("no shard read");
    const badShard = shards.filter((s) => !s || typeof s.file !== "string" || !s.file.endsWith(".csv.gz") || !SHA256.test(String(s.sha256 || "")));
    if (badShard.length) why2.push(`${badShard.length} shard(s) named without a sha256 of the right shape`);
    const ptr = walk.pointer && typeof walk.pointer === "object" ? walk.pointer : {};
    if (ptr.sha256 !== bo.manifest_sha256) why2.push("the pointer is not the manifest");
  }
  const mod = walk.module && typeof walk.module === "object" ? walk.module : {};
  if (!(/serve-from-body-v1\.mjs/.test(String(mod.path || "")) && SHA256.test(String(mod.sha256 || "")))) why2.push("the module is not the body serve, or carries no sha256");
  const ident = walk.identity && typeof walk.identity === "object" ? walk.identity : {};
  if (!SHA256.test(String(ident.bridge_sha256 || ""))) why2.push("the identity oracle carries no sha256");
  if (why2.length) push(oracleBad, `${name} · ${why2.join("; ")}`);

  // L3 — the rights name a binding source
  const why3 = [];
  if (!rights) why3.push("no rights record at all");
  else {
    if (!BINDING_SOURCES.has(String(rights.source))) why3.push(`source ${JSON.stringify(rights.source ?? null)} is not a binding`);
    if (!SHA256.test(String(rights.bindings_sha256 || ""))) why3.push("no bindings sha256");
    if (!SHA256.test(String(rights.profiles_sha256 || ""))) why3.push("no profiles sha256");
    if (!(typeof rights.rights_profile_id === "string" && rights.rights_profile_id.trim())) why3.push("no rights profile id");
    if (!(typeof rights.normalized_license_id === "string" && rights.normalized_license_id.trim())) why3.push("no normalized license id");
    if (!(typeof rights.commercial_use_state === "string" && rights.commercial_use_state.trim())) why3.push("no commercial use state");
    if (!(typeof rights.authority_record_id === "string" && rights.authority_record_id.trim())) why3.push("no authority record");
    const sc = rights.binding_scope && typeof rights.binding_scope === "object" ? rights.binding_scope : null;
    if (!(sc && isInt(sc.first) && isInt(sc.last) && isInt(sc.rows) && sc.rows > 0 && sc.last >= sc.first)) why3.push("no binding scope of the right shape");
    if (rights.credit !== undefined) {
      creditsSeen += 1;
      if (rights.source !== SOURCE_V3) why3.push("a credit under a source that carries none");
      if (!(rights.credit && typeof rights.credit.line === "string" && rights.credit.line.trim())) why3.push("a credit with no line");
    }
  }
  if (why3.length) push(rightsBad, `${name} · ${why3.join("; ")}`);
  if (rights) profilesSeen.set(rights.rights_profile_id, (profilesSeen.get(rights.rights_profile_id) || 0) + 1);

  // L4 — one row, one posture, over exactly the rows served
  const c = z.counts || {}, io = ef.identity_oracle || {}, words = c.words, held = Number(c.held) || 0;
  const groups = parsePosture((ef.license_receipts || {}).per_occurrence);
  const sc = rights && rights.binding_scope && typeof rights.binding_scope === "object" ? rights.binding_scope : null;
  const why4 = [];
  if (sc) {
    if (!(sc.rows === words && walk.ids_walked === words)) why4.push(`binding covers ${sc.rows} rows, walked ${walk.ids_walked}, zone carries ${words}`);
    if (!(sc.first === ident.c0_first && sc.first === io.first_c0_numeric_id && sc.last === ident.c0_last && sc.last === io.last_c0_numeric_id))
      why4.push(`binding covers c0 ${sc.first}-${sc.last}, served ${ident.c0_first}-${ident.c0_last}, identity says ${io.first_c0_numeric_id}-${io.last_c0_numeric_id}`);
  }
  if (groups.length !== 1 || !groups[0]) why4.push(`${groups.length} posture group(s) in the receipt, so the rights varied with the text`);
  else {
    if (groups[0].rows !== words) why4.push(`the receipt covers ${groups[0].rows} rows, the zone carries ${words}`);
    if (groups[0].tokens.length !== POSTURE_COLS.length) why4.push(`the receipt carries ${groups[0].tokens.length} fields, not ${POSTURE_COLS.length}`);
    else {
      const axis = groups[0].tokens[2];
      const expectHeld = axis === "ALLOW" ? 0 : words;
      if (held !== expectHeld) why4.push(`display axis ${axis} yet ${held} of ${words} rows held`);
    }
  }
  if (why4.length) push(postureBad, `${name} · ${why4.join("; ")}`);

  // L5 — the body cited is the body in custody
  if (manifestShards && bo) {
    if (bo.manifest_sha256 !== manifestSha) {
      const k = String(bo.manifest_sha256).slice(0, 12);
      if (!bodyOther.has(k)) bodyOther.set(k, []);
      push(bodyOther.get(k), name, 3);
    } else {
      bodyJudged += 1;
      const expect = new Map(manifestShards.filter((s) => !(s.hi < ident.c0_first || s.lo > ident.c0_last)).map((s) => [s.file, s.sha256]));
      const why5 = [];
      for (const s of shards) {
        if (!expect.has(s.file)) why5.push(`${basename(s.file).replace(/^cleanroom-c0-ledger-map-rebuilt-active-/, "").slice(0, 30)} is not a manifest shard for c0 ${ident.c0_first}-${ident.c0_last}`);
        else if (expect.get(s.file) !== s.sha256) why5.push(`${basename(s.file).slice(-30)} cited under a hash the manifest does not carry`);
      }
      if (expect.size !== shards.length) why5.push(`the manifest holds ${expect.size} shard(s) for the range, the zone names ${shards.length}`);
      if (why5.length) push(bodyBad, `${name} · ${why5.join("; ")}`);
    }
  }

  // L6 — the license shown is the one the binding gave
  if (rights && bindingsBySha.size) {
    const b = bindingsBySha.get(String(rights.bindings_sha256)), p = profilesBySha.get(String(rights.profiles_sha256));
    if (!b || !p) {
      const k = `${!b ? `bindings ${String(rights.bindings_sha256).slice(0, 12)}` : ""}${!b && !p ? " + " : ""}${!p ? `profiles ${String(rights.profiles_sha256).slice(0, 12)}` : ""}`;
      if (!bindingUncited.has(k)) bindingUncited.set(k, []);
      push(bindingUncited.get(k), name, 3);
    } else {
      joined += 1;
      const m = String((z.work_receipts || {}).b_n || "").match(/work_id=(\S+)/);
      const workId = m ? m[1] : null;
      const row = workId ? b.byWork.get(workId) : null;
      const why6 = [];
      if (!workId) why6.push("the work receipt names no work_id, so no binding row can be found");
      else if (!row) why6.push(`the binding carries no row for ${workId}`);
      else {
        if (row.rights_state !== "RESOLVED") why6.push(`the binding holds ${workId} ${row.rights_state}`);
        if (row.rights_profile_id !== rights.rights_profile_id) why6.push(`profile ${rights.rights_profile_id}, the binding says ${row.rights_profile_id}`);
        if (row.authority_record_id !== rights.authority_record_id) why6.push("authority record differs");
        if (sc && !(Number(row.first_c0_numeric_id) === sc.first && Number(row.last_c0_numeric_id) === sc.last && Number(row.c0_rows) === sc.rows))
          why6.push(`scope ${sc.first}-${sc.last}/${sc.rows}, the binding says ${row.first_c0_numeric_id}-${row.last_c0_numeric_id}/${row.c0_rows}`);
        const prof = p.byId.get(row.rights_profile_id);
        if (!prof) why6.push(`the catalog carries no profile ${row.rights_profile_id}`);
        else {
          if (prof.normalized_license_id !== rights.normalized_license_id) why6.push(`license ${rights.normalized_license_id}, the catalog says ${prof.normalized_license_id}`);
          if (prof.commercial_use_state !== rights.commercial_use_state) why6.push(`commercial use ${rights.commercial_use_state}, the catalog says ${prof.commercial_use_state}`);
          const g = groups.length === 1 && groups[0] && groups[0].tokens.length === POSTURE_COLS.length ? groups[0].tokens : null;
          if (!g) why6.push("no posture receipt to hold to the catalog");
          else {
            const off = POSTURE_COLS.map((k, i) => (g[i] !== prof[k] ? `${k} shown ${g[i]}, catalog ${prof[k]}` : null)).filter(Boolean);
            if (off.length) why6.push(off.join("; "));
          }
          // the tool's own fail-closed law: a display conditioned on attribution
          // serves only with the credit in the binding row
          const credit = rights.credit || null;
          if (prof.reader_display_state !== "ALLOW" && !credit) why6.push(`display ${prof.reader_display_state} served with no credit in hand`);
          if (credit) {
            if (b.version !== "v3") why6.push("a credit cited from a binding that carries none");
            else if (!(String(row.attribution_state || "").startsWith("ATTRIBUTION_IN_BINDING") && String(row.credit_line || "").trim() === String(credit.line).trim()))
              why6.push("the credit shown is not the binding row's own");
          }
        }
      }
      if (why6.length) push(joinBad, `${name} · ${why6.join("; ")}`);
    }
  }
}

// ── the serve outputs ─────────────────────────────────────────────────────
// Line 1 of a serve is its provenance. Read that alone first so a directory of
// large files is classified without being loaded; only a file that rides this
// route is read whole.
const firstLine = (p) => {
  const fd = openSync(p, "r");
  try {
    let buf = Buffer.alloc(0), pos = 0;
    const chunk = Buffer.alloc(65536);
    for (;;) {
      const n = readSync(fd, chunk, 0, chunk.length, pos);
      if (n <= 0) break;
      buf = Buffer.concat([buf, chunk.subarray(0, n)]); pos += n;
      const nl = buf.indexOf(10);
      if (nl > -1) return buf.subarray(0, nl).toString("utf8");
      if (buf.length > 16 * 1024 * 1024) break;
    }
    return buf.toString("utf8");
  } finally { closeSync(fd); }
};
const ndjsons = [];
const walkDir = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = join(d, e.name);
    if (e.isDirectory()) walkDir(p);
    else if (e.name.endsWith(".ndjson")) ndjsons.push(p);
  }
};
if (existsSync(SERVES)) {
  if (statSync(SERVES).isDirectory()) walkDir(SERVES);
  else if (SERVES.endsWith(".ndjson")) ndjsons.push(SERVES);
}
ndjsons.sort();
let serveFiles = 0, serveOnRoute = 0, serveInstruments = 0;
const serveBad = [];
for (const p of ndjsons) {
  let rec;
  try { rec = JSON.parse(firstLine(p)); } catch { continue; }
  const prov = rec && rec.provenance;
  if (!prov || typeof prov !== "object") continue;
  serveFiles += 1;
  if (!(prov.rule === RULE || prov.route === ROUTE || prov.body_oracle)) continue;
  serveOnRoute += 1;
  const rel = relative(K3, p);
  const r = prov.rights && typeof prov.rights === "object" ? prov.rights : null;
  const why = [];
  if (prov.rule !== RULE) why.push("names another rule");
  if (!r) why.push("no rights record");
  else if (prov.fixture) { serveInstruments += 1; if (r.source !== SOURCE_FIXTURE) why.push(`an instrument whose rights claim ${r.source}`); }
  else if (!BINDING_SOURCES.has(String(r.source))) why.push(`source ${JSON.stringify(r.source ?? null)} is not a binding`);
  const bo = prov.body_oracle && typeof prov.body_oracle === "object" ? prov.body_oracle : null;
  if (!(bo && SHA256.test(String(bo.manifest_sha256 || "")) && Array.isArray(bo.shards_read) && bo.shards_read.length && bo.shards_read.every((s) => SHA256.test(String(s.sha256 || "")))))
    why.push("no body oracle of the right shape");
  // every row: one posture, visible exactly when the axis says ALLOW
  const keys = new Map();
  let rows = 0, visOff = 0, malformed = 0;
  for (const line of readFileSync(p, "utf8").split("\n").slice(1)) {
    if (!line) continue;
    let row;
    try { row = JSON.parse(line); } catch { malformed += 1; continue; }
    rows += 1;
    const ra = row.rights_authority || {};
    const key = [ra.normalized_license_class, ra.license_version, row.reader_display_axis, row.public_distribution_axis, row.attribution_required,
      row.noncommercial_required, row.share_alike_required, row.no_derivatives_required, ra.terminal_resolution_state].join(" · ");
    keys.set(key, (keys.get(key) || 0) + 1);
    if (row.visible_in_hebrew_reader !== (row.reader_display_axis === "ALLOW")) visOff += 1;
  }
  if (malformed) why.push(`${malformed} row(s) do not parse`);
  if (keys.size !== 1) why.push(`${keys.size} rights records across ${rows} rows`);
  if (visOff) why.push(`${visOff} row(s) visible against their display axis`);
  const sc = r && r.binding_scope && typeof r.binding_scope === "object" ? r.binding_scope : null;
  if (sc && sc.rows !== rows) why.push(`binding covers ${sc.rows} rows, the file holds ${rows}`);
  // and, where the binding it cites is in custody, the same join as L6
  if (r && !prov.fixture && bindingsBySha.size) {
    const p2 = profilesBySha.get(String(r.profiles_sha256));
    const prof = p2 ? p2.byId.get(r.rights_profile_id) : null;
    if (prof && keys.size === 1) {
      const g = [...keys.keys()][0].split(" · ");
      const off = POSTURE_COLS.map((k, i) => (g[i] !== prof[k] ? k : null)).filter(Boolean);
      if (off.length) why.push(`rows disagree with the catalog on ${off.join(", ")}`);
    }
  }
  if (why.length) push(serveBad, `${rel} · ${why.join("; ")}`);
}

// ── verdicts ──────────────────────────────────────────────────────────────
const bindingInCustody = bindingsBySha.size > 0 && profilesBySha.size > 0;
const l2 = oracleBad.length === 0, l3 = rightsBad.length === 0, l4 = postureBad.length === 0;
const l5 = bodyBad.length === 0 && bodyOther.size === 0, l6 = joinBad.length === 0, l7 = serveBad.length === 0;
const nothingOnRoute = onRoute === 0 && serveOnRoute === 0;
const joinedNothing = joined === 0;
const anyBad = !l1 || !l3 || !l7 || (onRoute > 0 && !(l2 && l4 && (manifestShards === null || l5) && (joinedNothing || l6)));

// The suite reads the first line of a skip. Say it first, and say what was
// looked for, so a shelf checked against nothing cannot read as a clean one.
if (!anyBad && nothingOnRoute) {
  console.log(`SKIPPED — no zone in ${relative(K3, ZONES)} and no serve output under ${relative(K3, SERVES)} rides route ${ROUTE}; `
    + `${zonesRead} zones read, ${otherRoute} on another route, so the body and binding laws had nothing to judge`);
} else if (!anyBad && joinedNothing) {
  console.log(`SKIPPED — ${bindingInCustody ? "the binding in custody is not the one the zones cite" : `no binding at ${relative(K3, BINDING)}`}; `
    + `L6, the law that says whose rights these are, judged nothing (${onRoute} zone(s) on this route${bindingUncited.size ? `, citing ${[...bindingUncited.keys()].join(", ")}` : ""})`);
}

console.log(`— ${zonesRead} zones · ${onRoute} on this route · ${otherRoute} on another route`
  + `${instruments ? ` · ${instruments} test instrument(s) set aside` : ""}`
  + ` · binding ${bindingInCustody ? `in custody (${custodyNote.join(", ")})` : `not in custody at ${relative(K3, BINDING)}`}`
  + ` · body manifest ${manifestSha ? `in custody (${manifestSha.slice(0, 12)}, ${manifestShards.length} shards)` : `not on this disk at ${relative(K3, BODY)}`}`
  + ` · ${serveFiles} serve output(s) on disk, ${serveOnRoute} on this route —\n`);

check("L1  the tool still declares the rule: text from the body row, rights from the binding or nothing", l1,
  l1 ? "it names the rule, the route and the three rights sources; the surface form is the body's; rightsOf is a constant per work; it refuses without a binding before reading the bridge"
    : l1Why.join("; "));

if (onRoute === 0) {
  console.log(`  --  L2 to L6 had no zone on route ${ROUTE} to judge; not counted as passed`);
} else {
  check("L2  every zone names its body oracle by hash of the right shape", l2,
    oracleBad.length ? `${oracleBad.length} do not — ${named(oracleBad)}`
      : `${onRoute} zones, each naming the manifest, every shard read, the pointer and the module by sha256`);

  check("L3  every zone's rights name a binding source, never a guess and never an instrument", l3,
    rightsBad.length ? `${rightsBad.length} do not — ${named(rightsBad)}`
      : `${[...profilesSeen.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} under ${k}`).join(", ")}${creditsSeen ? ` · ${creditsSeen} carry a credit` : ""}`);

  check("L4  one binding row, one posture, over exactly the rows served; held follows the display axis alone", l4,
    postureBad.length ? `${postureBad.length} do not — ${named(postureBad)}`
      : "scope, ids walked, words carried and the receipt agree on every zone, and no zone holds a row its axis allows");

  if (manifestShards === null) {
    console.log(`  --  L5 not judged: no ${MANIFEST} at ${relative(K3, BODY)}, so the body the zones cite could not be opened`);
  } else {
    check("L5  the body the zones cite is the body in custody, shard for shard, hash for hash", l5,
      bodyOther.size
        ? `${[...bodyOther.entries()].map(([k, zs]) => `${zs.length}${zs.includes(null) ? "+" : ""} zone(s) cite manifest ${k}`).join(", ")}, the manifest in custody is ${manifestSha.slice(0, 12)} — the body moved under the shelf, or --body names another`
        : bodyBad.length ? `${bodyBad.length} disagree — ${named(bodyBad)}`
          : `${bodyJudged} zones cite the manifest in custody, and each names exactly the manifest's shards for its range under the manifest's own hashes`);
  }

  if (!bindingInCustody) {
    console.log(`  --  L6 not judged: no binding at ${relative(K3, BINDING)}`);
  } else if (joinedNothing) {
    console.log(`  --  L6 not judged: the binding in custody is not the one the zones cite (${[...bindingUncited.keys()].join(", ")})`);
  } else {
    check("L6  the license each zone shows is the one the binding gave", l6,
      joinBad.length ? `${joinBad.length} differ — ${named(joinBad)}`
        : `${joined} zones joined to their binding row and profile: resolved, same profile, same scope, same authority, all ${POSTURE_COLS.length} fields shown as the catalog carries them`
          + (bindingUncited.size ? ` · ${[...bindingUncited.values()].reduce((n, zs) => n + zs.length, 0)}+ cite a binding not in custody and went unjoined` : ""));
  }
}

if (serveOnRoute === 0) {
  console.log(`  --  L7 had no serve output under ${relative(K3, SERVES)} on this route; not counted as passed`);
} else {
  check("L7  every serve output on this route names a binding or is branded an instrument, and carries one rights record over all its rows", l7,
    serveBad.length ? `${serveBad.length} fail — ${named(serveBad)}`
      : `${serveOnRoute} serve output(s)${serveInstruments ? `, ${serveInstruments} branded an instrument` : ""}, each one rights record, every row visible exactly as its axis says`);
}

console.log("\n  what this does not say: that a shard hashes today to what the manifest says,");
console.log("  or that the binding is the canonical current N. Both were verified where they");
console.log("  were made, and this check holds every zone to the hashes those records carry.");
console.log("  It also does not say the license is visible on the page; that needs a browser.");

if (bad) { console.log(`\n${bad} FAILED`); process.exit(1); }
if (nothingOnRoute || joinedNothing) {
  console.log("\nSKIPPED — the laws with evidence held, and the binding law had nothing on this disk to judge");
  process.exit(3);
}
console.log("\nall checks passed");
process.exit(0);
