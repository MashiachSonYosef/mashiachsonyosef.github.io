#!/usr/bin/env node
// The English and license reader: a gloss never stands without its M.
// GUARDS: gloss-m-rule-v1-a-reading-shown-is-a-reading-licensed
//
// The owner's ruling, 2026-08-30, in his words: the English reader "is now
// english and license reader … never let them separate even by a display
// degree." The zones bake their gloss table as key → English string; this
// pass re-derives every baked gloss from the same route store the build
// derived it from, finds the oldest licensed M whose own text divides to
// that exact reading (the door's standing glossSource law), and writes a
// parallel table gloss_m: key → { lic, m, y } beside it. Nothing about the
// gloss text changes; what changes is that the license can now ride it.
//
// Fail-open per key, fail-honest per zone: a gloss whose source cannot be
// re-derived (the store moved since the build) gets NO entry — an absent
// chip over a wrong one — and the count of such keys is printed per zone,
// because a drift between a zone's glosses and the store is a fact the
// build lane should hear about, not silently paper over.
//
// Idempotent: gloss_m is recomputed whole on every run.
//
// Run: node tools/enrich-gloss-m-v1.mjs [--zones data/zones]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { senseSplit as readingSplit } from "./sense-split-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : dflt;
};
const ZONES = arg("zones", join(K3, "data", "zones"));
const STORE = openRouteStore(join(K3, "data", "route-store"));

// the posture names are the declarations record's, same as everywhere
const POSTURE_NAMES = Object.fromEntries(
  Object.entries(JSON.parse(readFileSync(join(K3, "tools", "declarations-v1.json"), "utf8")).export_postures)
    .map(([key, row]) => [key, row.name])
);
const licenseName = (posture) => {
  const p = String(posture || "");
  if (!p) return "License unrecorded";
  return POSTURE_NAMES[p] || p;
};
// the door's glossSource law, verbatim in spirit: the oldest licensed route
// whose own text divides — under the store's own pack and reading rules —
// to this exact reading
const glossSource = (key, text) => {
  if (!key || !text) return null;
  const routes = STORE.routesFor(key);
  if (!routes) return null;
  const want = String(text).toLowerCase();
  const hits = routes.filter((row) => {
    if (!STORE.index.m_sources[row[3]]) return false;
    return STORE.packSplit(row[1]).some((sense) => {
      const r = readingSplit(sense);
      return !r.damaged && r.readings.some((x) => x.toLowerCase() === want);
    });
  });
  if (!hits.length) return null;
  hits.sort((a, c) => {
    const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10);
    return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9);
  });
  const m = STORE.index.m_sources[hits[0][3]];
  return { lic: licenseName(m.licensePosture), m: m.label || "", y: m.sourceYear || "" };
};

const bins = readdirSync(ZONES)
  .filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !f.endsWith(".commentary.bin"))
  .sort();
let zones = 0, keys = 0, chipped = 0, drifted = 0;
const driftZones = [];
for (const f of bins) {
  const path = join(ZONES, f);
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")); }
  catch { continue; }
  const g = z.gloss;
  if (!g || typeof g !== "object") continue;
  const gm = {};
  let zoneDrift = 0;
  for (const [k, t] of Object.entries(g)) {
    keys += 1;
    const src = glossSource(k, t);
    if (src) { gm[k] = src; chipped += 1; }
    else { zoneDrift += 1; drifted += 1; }
  }
  z.gloss_m = gm;
  writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(z), "utf8")));
  zones += 1;
  if (zoneDrift) driftZones.push(`${f.replace(/\.bin$/, "")}: ${zoneDrift}`);
}
console.log(`${zones} zones · ${keys} gloss keys · ${chipped} carry their M · ${drifted} could not be re-derived (no chip written)`);
if (driftZones.length) console.log(`drift, per zone: ${driftZones.slice(0, 10).join(" · ")}${driftZones.length > 10 ? ` · +${driftZones.length - 10} more` : ""}`);
