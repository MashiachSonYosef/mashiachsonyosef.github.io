#!/usr/bin/env node
// GUARDS: serving-rulings-record-v1-a-ruling-the-site-acts-on-is-written-where-the-site-can-read-it
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE RIGHTS ARE THE SOURCE'S OWN ATTESTATION. The owner, 2026-09-03: "honest
// means adhering to THEIR license or attestation." A right the site reasons
// its way to is a decision of ours, and the site adds no decisions. Public
// domain by source publication year was retired for one morning on that
// footing ("books can be rearranged and count as new") and then KEPT on a
// condition: the year is the printed imprint's own attestation, and a
// rearranged edition would say so and carry its own rights, so the binding
// must name the year it rests on. The serving rulings record lists what is
// retired (nothing, today) and what is kept on condition; this check holds
// the site to both lists.
//
//   L1  the rulings record carries the ruling; every retired profile and
//       every profile kept on condition names the ruling that decided it
//   L2  both serve tools refuse a retired profile with RIGHTS_PROFILE_RETIRED
//       and read the list from the record, not from a typed constant
//   L3  no zone on the shelf is bound under a retired profile
//   L4  every work the binding in custody binds under a retired profile is
//       held in the fleet ledger at the rights stage, with the refusal named
//   L5  a retired profile is still in the catalog under the same id (it is
//       retired, not erased: a receipt that names it must still resolve)
//   L6  every binding under a profile kept on condition carries the year it
//       rests on in its own row, as the condition requires
//
// Run: node tools/check-rights-profile-attested-v1.mjs [--zones data/zones] [--binding build/rights-binding-v3]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); const v = i > -1 ? process.argv[i + 1] : undefined; return v && !v.startsWith("--") ? v : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const BINDING = arg("binding", join(K3, "build", "rights-binding-v3"));
const RECORD = join(K3, "data", "serving-rulings-v1.json");
const LEDGER = join(K3, "build", "fleet-ledger-v2.json");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");
const csv = (t) => { const [h, ...rows] = t.split(/\r?\n/).filter(Boolean); const cols = h.split(","); return rows.map((r) => { const out = {}; let i = 0, f = "", q = false; const cells = []; for (const c of r) { if (q) { if (c === '"') q = false; else f += c; } else if (c === '"') q = true; else if (c === ",") { cells.push(f); f = ""; } else f += c; } cells.push(f); cols.forEach((k, n) => { out[k] = cells[n] ?? ""; }); return out; }); };

if (!existsSync(RECORD)) { console.log("SKIPPED — no serving rulings record"); process.exit(3); }
const rec = JSON.parse(readFileSync(RECORD, "utf8"));
const retired = rec.retired_rights_profiles || [];
const kept = rec.kept_on_condition || [];
const rulingIds = new Set((rec.rulings || []).map((r) => r.id));

// L1
const why1 = [];
if (!Array.isArray(rec.retired_rights_profiles)) why1.push("the record carries no retired_rights_profiles list");
if (!retired.length && !kept.length) why1.push("neither a retired profile nor a profile kept on condition is listed");
for (const r of kept) {
  if (!/^RIGHTS-[0-9A-F]{24}$/u.test(String(r.rights_profile_id))) why1.push(`${r.rights_profile_id}: not a profile id`);
  if (!rulingIds.has(r.ruling)) why1.push(`${r.rights_profile_id}: names ruling ${r.ruling}, which the record does not carry`);
  if (!r.condition) why1.push(`${r.rights_profile_id}: kept on no condition`);
}
for (const r of retired) {
  if (!/^RIGHTS-[0-9A-F]{24}$/u.test(String(r.rights_profile_id))) why1.push(`${r.rights_profile_id}: not a profile id`);
  if (!rulingIds.has(r.ruling)) why1.push(`${r.rights_profile_id}: names ruling ${r.ruling}, which the record does not carry`);
  if (!r.why || !r.retired_on) why1.push(`${r.rights_profile_id}: no why or no date`);
}
check("L1  the record lists what is retired and what is kept on condition, each under a ruling it carries", why1.length === 0,
  why1.length ? few(why1) : `${retired.length} retired · ${kept.length} kept on condition — ${kept.map((r) => `${r.normalized_license_id}: ${r.condition}`).join("; ") || "none"}`);
const ids = new Set(retired.map((r) => r.rights_profile_id));

// L2
const why2 = [];
for (const t of ["serve-from-body-v1.mjs", "serve-edition-v1.mjs"]) {
  const p = join(HERE, t);
  if (!existsSync(p)) { why2.push(`${t} missing`); continue; }
  const src = readFileSync(p, "utf8");
  if (!src.includes('"RIGHTS_PROFILE_RETIRED"')) why2.push(`${t} does not refuse a retired profile`);
  if (!/serving-rulings-v1\.json/u.test(src) || !/retired_rights_profiles/u.test(src)) why2.push(`${t} does not read the list from the record`);
  for (const id of ids) if (src.includes(id)) why2.push(`${t} types ${id} instead of reading it`);
}
check("L2  both serve tools refuse a retired profile, reading the list from the record", why2.length === 0, why2.length ? few(why2) : "serve-from-body and serve-edition, RIGHTS_PROFILE_RETIRED from the record");

// L3
const l3 = [];
let zonesRead = 0;
if (existsSync(ZONES)) for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin") && !x.startsWith("fixture-"))) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  const r = ((z.emitted_from || {}).walk || {}).rights || {};
  if (ids.has(String(r.rights_profile_id))) l3.push(f.replace(/\.bin$/u, ""));
}
check("L3  no zone on the shelf is bound under a retired profile", l3.length === 0, l3.length ? `${l3.length} — ${few(l3)}` : `${zonesRead} zones, none`);

// L4
const bindsPath = ["representation-rights-bindings-v3.csv", "representation-rights-bindings-v2.csv"].map((n) => join(BINDING, n)).find(existsSync);
if (!ids.size) console.log("  --  L4 nothing retired, so no work is owed a hold");
else if (!bindsPath || !existsSync(LEDGER)) {
  console.log(`  --  L4 SKIPPED — ${bindsPath ? "no fleet ledger" : "no binding in custody"} to judge the holds against`);
} else {
  const bound = csv(readFileSync(bindsPath, "utf8")).filter((r) => ids.has(r.rights_profile_id)).map((r) => r.work_id);
  const L = JSON.parse(readFileSync(LEDGER, "utf8"));
  const led = new Map((L.ledger || []).map((e) => [e.work, e]));
  const why4 = [];
  for (const w of bound) {
    const e = led.get(w);
    if (!e) { why4.push(`${w}: not in the ledger`); continue; }
    if (e.verdict !== "HOLD" || e.stage !== "RIGHTS" || !/RIGHTS_PROFILE_RETIRED/u.test(String(e.reason))) why4.push(`${w}: ${e.verdict}/${e.stage} — ${String(e.reason || "").slice(0, 60)}`);
  }
  check("L4  every work bound under a retired profile is held at the rights stage, refusal named", why4.length === 0,
    why4.length ? `${why4.length} of ${bound.length} — ${few(why4)}` : `${bound.length} works held`);
}

// L5
const profsPath = ["rights-profiles-v3.csv", "rights-profiles-v2.csv"].map((n) => join(BINDING, n)).find(existsSync);
if (!profsPath) console.log("  --  L5 SKIPPED — no profile catalog in custody");
else {
  const cat = new Set(csv(readFileSync(profsPath, "utf8")).map((p) => p.rights_profile_id));
  const gone = [...ids].filter((id) => !cat.has(id));
  check("L5  a retired profile is still in the catalog under its id (retired, not erased)", gone.length === 0, gone.length ? few(gone) : "every retired id still resolves");
}

// L6 — the condition a kept profile rests on
if (!bindsPath) console.log("  --  L6 SKIPPED — no binding in custody");
else if (!kept.length) console.log("  --  L6 no profile is kept on condition");
else {
  const keptIds = new Set(kept.map((k) => k.rights_profile_id));
  const under = csv(readFileSync(bindsPath, "utf8")).filter((r) => keptIds.has(r.rights_profile_id));
  const bare = under.filter((r) => !/\b(1[5-9]\d\d|20[0-2]\d)\b/u.test(String(r.raw_license || "")));
  check("L6  every binding under a profile kept on condition names the year it rests on", bare.length === 0,
    bare.length ? `${bare.length} of ${under.length} name none — ${few(bare.map((r) => r.work_id))}` : `${under.length} bindings, each naming its year`);
}

console.log("\n  what this does not say: that the remaining profiles are attestations rather than");
console.log("  inferences; it says only that what the owner retired serves nothing here, and what was kept\n  on condition meets the condition as the binding states it.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
