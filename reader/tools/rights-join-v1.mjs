// Synthesis lane · the rights join, one function, for every serve route
//
// serve-from-body-v1 wrote this join inline in 2026-08 and every law in it
// was found the hard way: fail-closed on a work the binding does not carry,
// on an unresolved state, on a missing profile, on a display conditioned on
// attribution with no credit in hand, and on a profile the serving rulings
// record retires. The stream route (serve-from-stream-v2) needs the same
// join, byte for byte in its outcomes, so it lives here once. serve-from-body
// keeps its own copy until it is retired; a check holds the two to the same
// refusal codes.
//
// Returns { rights, rightsProvenance, bindingScope, row: b, profile: p } or
// throws an Error whose message begins with the refusal code, in the form the
// fleet's ledger reads ("CODE: detail").
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

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
export const readCsv = (path) => {
  const lines = readFileSync(path, "utf8").trim().split("\n");
  const col = csvSplit(lines[0]);
  return lines.slice(1).map((l) => Object.fromEntries(csvSplit(l).map((v, i) => [col[i], v])));
};
const RULINGS_PATH = new URL("../data/serving-rulings-v1.json", import.meta.url);
const retiredProfiles = () => { try { return JSON.parse(readFileSync(RULINGS_PATH, "utf8")).retired_rights_profiles || []; } catch { return []; } };
const refuse = (code, detail) => { throw new Error(`${code}: ${detail}`); };

export const joinRights = ({ dir, work }) => {
  const v3 = existsSync(join(dir, "representation-rights-bindings-v3.csv")) && existsSync(join(dir, "rights-profiles-v3.csv"));
  const bindsPath = join(dir, v3 ? "representation-rights-bindings-v3.csv" : "representation-rights-bindings-v2.csv");
  const profsPath = join(dir, v3 ? "rights-profiles-v3.csv" : "rights-profiles-v2.csv");
  if (!existsSync(bindsPath) || !existsSync(profsPath))
    refuse("BINDING_FILES_MISSING", `${dir} does not carry representation-rights-bindings-{v2,v3}.csv + rights-profiles-{v2,v3}.csv`);
  const b = readCsv(bindsPath).find((r) => r.work_id === work);
  if (!b) refuse("RIGHTS_NOT_IN_CUSTODY", `the canonical rights resolution carries no row for ${work}; fail-closed, nothing serves`);
  if (b.rights_state !== "RESOLVED") refuse("RIGHTS_HOLD_UNRESOLVED", `the canonical rights resolution holds ${work} fail-closed: rights_state=${b.rights_state}`);
  const p = readCsv(profsPath).find((r) => r.rights_profile_id === b.rights_profile_id);
  if (!p) refuse("RIGHTS_PROFILE_MISSING", b.rights_profile_id);
  const retired = retiredProfiles().find((r) => r.rights_profile_id === b.rights_profile_id);
  if (retired) refuse("RIGHTS_PROFILE_RETIRED",
    `${work}: profile ${retired.rights_profile_id} (${retired.normalized_license_id}) is retired under ${retired.ruling}: ${retired.why}; the work holds until its source attests its rights`);
  const creditInBinding = v3 && String(b.attribution_state || "").startsWith("ATTRIBUTION_IN_BINDING") && String(b.credit_line || "").trim().length > 0;
  if (p.reader_display_state !== "ALLOW" && !creditInBinding)
    refuse("RIGHTS_ATTRIBUTION_NOT_IN_CUSTODY", `${work}: reader display is ${p.reader_display_state}; the attribution that discharges it is not in custody`);
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
  const bindingScope = { first: Number(b.first_c0_numeric_id), last: Number(b.last_c0_numeric_id), rows: Number(b.c0_rows) };
  const rightsProvenance = {
    source: v3 ? "ACTIVE_RIGHTS_RESOLUTION_V3__ATTRIBUTION_IN_BINDING" : "ACTIVE_RIGHTS_RESOLUTION_V2__CANONICAL_CURRENT",
    ...(creditInBinding ? { credit: {
      line: b.credit_line.trim(),
      source_url: String(b.attribution_source_url || "").trim(),
      license_link: String(b.attribution_license_link || "").trim(),
      basis: "the credit is the binding record's own, joined from the audited attribution table; printing it is what discharges the display condition",
    } } : {}),
    bindings_sha256: createHash("sha256").update(readFileSync(bindsPath)).digest("hex"),
    profiles_sha256: createHash("sha256").update(readFileSync(profsPath)).digest("hex"),
    rights_profile_id: b.rights_profile_id,
    normalized_license_id: p.normalized_license_id,
    commercial_use_state: p.commercial_use_state,
    authority_record_id: b.authority_record_id,
    binding_scope: bindingScope,
    note: "rights bind to the exact representation, never the abstract work; profile fields carried verbatim in the resolution's own vocabulary",
  };
  return { rights, rightsProvenance, bindingScope, row: b, profile: p, v3 };
};
