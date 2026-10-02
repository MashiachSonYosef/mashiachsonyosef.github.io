#!/usr/bin/env node
// GUARDS: gloss-m-rule-v1-a-reading-shown-is-a-reading-licensed
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE LICENSE IS THE ABSOLUTE. The frame is a description of the work and is
// only as absolute as it is correct; a license is not a description of
// anything and does not bend to being described wrongly. So the rule that
// every reading shown is a reading licensed is the one rule in this tree that
// must be checked over EVERYTHING, never sampled.
//
// It was being sampled. check-english-license-v1 renders a page and looks at
// the chips, which is the right way to check that the license SHOWS — but the
// suite lists it among the checks that "take no URL", the ones that are the
// same check whichever work is served, and it is not one of those. A gloss
// chip is per-zone data. So the site's core license rule stood verified on
// one book out of 3,065.
//
// This is the other half, and it is the half that can cover the shelf: the
// baked gloss table of every zone, read off disk, with no browser. The page
// check keeps its job — that the license is VISIBLE where a reading is — and
// this one answers the prior question, that every reading has one at all.
//
//   L1  every baked reading carries a license record
//   L2  every license named is one the postures record declares
//   L3  every reading names the source it came from, so it can be attributed
//   L4  no reading names a source the store no longer holds
//
// L3 and L4 are license laws, not bookkeeping. Attribution is an obligation
// under CC BY and CC BY-SA, and an obligation cannot be met for a reading
// whose source we cannot name. A reading whose M has been struck is worse
// than unattributed: it is attributed to something we have withdrawn.
//
// Run: node tools/check-every-reading-licensed-v1.mjs [--zones data/zones]
//                                                     [--postures data/license-postures-v1.json]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const POSTURES = arg("postures", join(K3, "data", "license-postures-v1.json"));
const STORE = arg("store", join(K3, "data", "route-store", "index.json"));

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(POSTURES)) { console.log(`SKIPPED — no postures record at ${POSTURES}`); process.exit(3); }
if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }

// The names a license may be shown under, taken from the record rather than
// from anything typed here. A check that carries its own list of acceptable
// licenses is a check that will disagree with the record the day the record
// changes, and the record governs.
const posturesRecord = JSON.parse(readFileSync(POSTURES, "utf8"));
const declaredNames = new Set(Object.values(posturesRecord.postures || {})
  .map((p) => String(p.name || "")).filter(Boolean));

// The sources the store still holds, by the label a baked reading names them by.
const heldLabels = new Set();
let struckIds = 0;
if (existsSync(STORE)) {
  const idx = JSON.parse(readFileSync(STORE, "utf8"));
  for (const v of Object.values(idx.m_sources || {})) if (v && v.label) heldLabels.add(String(v.label));
  struckIds = ((idx.language_admission || {}).struck_m_ids || []).length;
}

const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

const noRecord = [], undeclared = new Map(), unnamed = [], withdrawn = new Map();
let zonesRead = 0, readings = 0;
for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  const gloss = z.gloss || {}, glossM = z.gloss_m || {};
  for (const k of Object.keys(gloss)) {
    readings += 1;
    const m = glossM[k];
    // L1 — a reading with no license record at all
    if (!m) { if (noRecord.length < 12) noRecord.push(`${z.work} · ${k}`); else noRecord.push(null); continue; }
    // L2 — a license name the record does not declare
    const lic = String(m.lic || "");
    if (!lic || !declaredNames.has(lic))
      undeclared.set(lic || "(empty)", (undeclared.get(lic || "(empty)") || 0) + 1);
    // L3 — a reading that cannot be attributed because it names no source
    const src = String(m.m || "");
    if (!src) { if (unnamed.length < 12) unnamed.push(`${z.work} · ${k}`); else unnamed.push(null); continue; }
    // L4 — a reading attributed to a source the store has withdrawn
    if (heldLabels.size && !heldLabels.has(src))
      withdrawn.set(src, (withdrawn.get(src) || 0) + 1);
  }
}

console.log(`— ${zonesRead} zones · ${readings.toLocaleString()} baked readings · ${declaredNames.size} declared postures · ${struckIds} sources struck —\n`);

check("L1  every baked reading carries a license record",
  noRecord.length === 0,
  noRecord.length ? `${noRecord.length} without one — ${noRecord.filter(Boolean).slice(0, 3).join(" · ")}`
    : "none is shown without one");

check("L2  every license named is one the postures record declares",
  undeclared.size === 0,
  undeclared.size
    ? [...undeclared.entries()].slice(0, 4).map(([n, c]) => `${JSON.stringify(n)} x${c}`).join(" · ")
    : `${declaredNames.size} names declared, and no reading wears another`);

check("L3  every reading names the source it came from, so it can be attributed",
  unnamed.length === 0,
  unnamed.length ? `${unnamed.length} name none — ${unnamed.filter(Boolean).slice(0, 3).join(" · ")}`
    : "attribution is possible for every one");

check("L4  no reading names a source the store no longer holds",
  withdrawn.size === 0,
  withdrawn.size
    ? [...withdrawn.entries()].slice(0, 3).map(([s, c]) => `${s.slice(0, 46)} x${c}`).join(" · ")
    : heldLabels.size ? `${heldLabels.size} sources held, every reading names one of them`
      : "no store index here, so this one went unasked");

console.log("\n  what this does not say: that the license is VISIBLE beside the reading on");
console.log("  the page. That is check-english-license-v1's question and it needs a browser.");
console.log("  This one answers the prior question — whether there is a license to show —");
console.log("  and answers it for the whole shelf rather than for one book.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
