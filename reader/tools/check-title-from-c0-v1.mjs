#!/usr/bin/env node
// The title is the work's own opening words, read from the serve — or it is
// nothing at all.
// GUARDS: title-from-c0-rule-v1-the-title-is-the-works-own-opening-words
//
// The owner's ruling folded the Hebrew structural world into C0: a title is
// not a supplied string riding beside the text, it is rows 1..k OF the text,
// and the id in the bridge is only the finder that says which rows those
// are. This check drives the real pipeline — serve-from-body over the
// verified body, then build-zone with --title-from-c0 — and holds it to both
// halves of the law:
//
//   claimed   a work whose id tokens match its opening occurrences K-for-K
//             gets work_he_tokens that ARE those serve rows: same surfaces
//             verbatim, same keys, the receipt naming the exact c0 ids
//   refused   a Latin-id work claims nothing: no tokens, no invented Hebrew,
//             the reason on the receipt in words
//
// Rights for the serves are an instrument (declared values, --fixture), so
// every artifact this check makes is branded RIGHTS_FIXTURE__NEVER_SERVABLE
// and asserted as such — nothing built here can ever be mistaken for a
// servable zone.
//
// The body, the bridge, and the openings survey live on the fleet machine
// only, so elsewhere this check reports SKIP rather than inventing a fixture
// corpus that would prove nothing.
//
// Run: node tools/check-title-from-c0-v1.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exactK } from "./k-normalization-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const BODY = "/home/user/body";
const BRIDGE = "/home/user/ai-sdk-starter-deepinfra/ledgers/work/c0/current-c0-location-source-bridge-2026-07-10.csv.gz";
const OPENINGS = join(BODY, "work-openings.json");
if (!existsSync(BODY) || !existsSync(BRIDGE) || !existsSync(OPENINGS)) {
  console.log("SKIP — the verified body, the bridge, and the openings survey live on the fleet machine; nothing to prove here without them");
  process.exit(0);
}

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const OUT = join(K3, "build", "title-gate");
mkdirSync(OUT, { recursive: true });

// an instrument rights record: declared values, never resolved ones, lawful
// only under --fixture, which brands everything downstream never-servable
const RIGHTS = join(OUT, "rights-instrument.json");
writeFileSync(RIGHTS, JSON.stringify({
  basis: "instrument for the title-from-c0 gate; values are declared, not resolved; every output is branded RIGHTS_FIXTURE__NEVER_SERVABLE",
  rights: {
    reader_display_axis: "ALLOW",
    public_distribution_axis: "ALLOW_WITH_OBLIGATIONS",
    attribution_required: "POLICY_DEPENDENT",
    noncommercial_required: "FALSE_OR_NOT_ESTABLISHED",
    share_alike_required: "FALSE_OR_NOT_ESTABLISHED",
    no_derivatives_required: "FALSE_OR_NOT_ESTABLISHED",
    normalized_license_class: "PUBLIC_DOMAIN",
    license_version: "UNSPECIFIED",
    terminal_resolution_state: "RESOLVED",
  },
}, null, 1));

// ---- pick the claimed-case work by rule, not by hand ----------------------
// First pby work in id order whose id tokens (trailing catalog number
// dropped) K-match its opening occurrences whole and in order — the same
// match build-zone will make, computed here independently from the openings
// survey so the check does not grade the tool with the tool's own answer.
const openings = JSON.parse(readFileSync(OPENINGS, "utf8"));
const idTokensOf = (work) => {
  const t = work.split("/").pop().split("-").filter(Boolean);
  while (t.length && /^\d+$/.test(t[t.length - 1])) t.pop();
  return t;
};
const matches = (work) => {
  const toks = idTokensOf(work);
  const open = openings[work] || [];
  if (!toks.length || open.length < toks.length) return false;
  const folds = toks.map((s) => exactK(s));
  return folds.every(Boolean) && folds.every((f, i) => exactK(open[i].hebrew) === f);
};
const all = Object.keys(openings).filter((w) => w.startsWith("pby/")).sort().filter(matches);
// a several-word title exercises "whole and in order"; a one-word title
// only exercises "whole" — so the many-word works go first, by rule
const candidates = [...all.filter((w) => idTokensOf(w).length >= 3), ...all.filter((w) => idTokensOf(w).length < 3)];
check("the census's shelf offers works whose id IS the opening text", candidates.length > 0, `${candidates.length} candidates`);

const serve = (work, out) => execFileSync("node", [join(HERE, "serve-from-body-v1.mjs"),
  "--work", work, "--body", BODY, "--bridge", BRIDGE, "--out", out,
  "--rights-fixture", RIGHTS, "--fixture"], { stdio: "pipe" });
const buildZone = (serveNdjson, work, out, extra = []) => execFileSync("node", [join(HERE, "build-zone.mjs"),
  "--serve", serveNdjson, "--bridge", BRIDGE, "--store", join(K3, "data", "route-store"),
  "--work", work, "--title", work.split("/").pop().replace(/[-_]+/g, " "),
  "--title-from-c0", "--out", out, "--stamp", "title-gate", ...extra], { stdio: "pipe" });
const readZone = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));

// the first candidate that both serves and zones; a coordinate-shaped hold on
// one work is that work's own story, not this check's subject
let zone = null, work = null, serveRows = null;
for (const w of candidates.slice(0, 12)) {
  const nd = join(OUT, "claimed.ndjson"), bin = join(OUT, "claimed.bin");
  try {
    serve(w, nd);
    buildZone(nd, w, bin);
    work = w;
    zone = readZone(bin);
    serveRows = readFileSync(nd, "utf8").trim().split("\n").slice(1).map((l) => JSON.parse(l));
    break;
  } catch { /* held by its own shape; the next candidate answers */ }
}
check("a candidate work runs the real pipeline end-to-end", !!zone, work || "none of the first 12 built");

if (zone) {
  const toks = idTokensOf(work);
  const r = (zone.emitted_from || {}).title_from_c0 || {};
  check("the zone is branded as an instrument, never servable",
    zone.emitted_from.walk.fixture === true && zone.emitted_from.walk.rights.source === "RIGHTS_FIXTURE__NEVER_SERVABLE",
    zone.emitted_from.walk.rights && zone.emitted_from.walk.rights.source);
  check("the title was claimed from C0, by the rule, with the receipt",
    r.rule_id === "title-from-c0-rule-v1-the-title-is-the-works-own-opening-words" && r.matched_tokens === toks.length,
    `${r.matched_tokens} of ${toks.length} id tokens`);
  const t = zone.work_he_tokens || [];
  check("the title tokens ARE the opening serve rows, surfaces verbatim",
    t.length === toks.length && t.every((x, i) => x.s === serveRows[i].exact_surface_form),
    t.map((x) => x.s).join(" "));
  check("each token keeps its text key, exactly the text's own fold",
    t.every((x) => x.held || (x.w ? x.w.every((rg) => rg.k) : x.k === exactK(x.s))));
  check("the receipt names the exact c0 rows the title is",
    Array.isArray(r.c0_rows) && r.c0_rows.length === toks.length && r.c0_rows.every((id, i) => id === serveRows[i].c0_numeric_id),
    `c0 ${r.c0_rows && r.c0_rows[0]}…${r.c0_rows && r.c0_rows[r.c0_rows.length - 1]}`);
  check("work_he is those same surfaces, nothing retyped",
    zone.work_he === t.map((x) => x.s).join(" "));
}

// ---- the refusal half: a Latin id claims nothing --------------------------
const latin = Object.keys(openings).filter((w) => idTokensOf(w).every((s) => !exactK(s))).sort();
let zone2 = null, work2 = null;
for (const w of latin.slice(0, 12)) {
  const nd = join(OUT, "refused.ndjson"), bin = join(OUT, "refused.bin");
  try {
    serve(w, nd);
    buildZone(nd, w, bin);
    work2 = w;
    zone2 = readZone(bin);
    break;
  } catch { /* same posture as above */ }
}
check("a Latin-id work runs the pipeline too", !!zone2, work2 || "none of the first 12 built");
if (zone2) {
  const r2 = (zone2.emitted_from || {}).title_from_c0 || {};
  check("it claims no Hebrew title — no tokens, no invented text",
    !zone2.work_he_tokens && zone2.work_he === "",
    JSON.stringify(zone2.work_he));
  check("and the refusal is on the receipt, in words",
    r2.matched_tokens === 0 && /awaits corpus-minted title rows/.test(r2.reason || ""),
    r2.reason || "(no reason)");
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
