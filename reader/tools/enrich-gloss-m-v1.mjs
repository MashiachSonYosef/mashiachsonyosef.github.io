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
import { glossSource as glossSourceFor } from "./gloss-m-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : dflt;
};
const ZONES = arg("zones", join(K3, "data", "zones"));
const STORE = openRouteStore(join(K3, "data", "route-store"));

// The derivation lives in tools/gloss-m-v1.mjs since 2026-09-02, where
// build-zone reads it too: the builder writes gloss_m in its own pass, and
// this tool only serves the zones built before it could. What it writes it
// TYPES on the zone — emitted_from.post_build names the exemption rule, this
// tool, every field written, the store version read, and the expiry (the
// zone's rebuild) — so the single-pass check counts it instead of faulting
// it, and a zone the builder already served is left alone.
const glossSource = (key, text) => glossSourceFor(STORE, key, text);
export const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
const WROTE = ["gloss_m", "gloss_layer.store_version"];

const bins = readdirSync(ZONES)
  .filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !f.endsWith(".commentary.bin"))
  .sort();
let zones = 0, keys = 0, chipped = 0, drifted = 0, builtInPass = 0;
const driftZones = [];
for (const f of bins) {
  const path = join(ZONES, f);
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8")); }
  catch { continue; }
  const g = z.gloss;
  if (!g || typeof g !== "object") continue;
  const ef = z.emitted_from || (z.emitted_from = {});
  const gl = ef.gloss_layer || (ef.gloss_layer = {});
  // the builder wrote this zone's M in its own pass: nothing here to serve
  if (typeof gl.m_layer === "string" && gl.m_layer && z.gloss_m && typeof z.gloss_m === "object") { builtInPass += 1; continue; }
  const gm = {};
  let zoneDrift = 0;
  for (const [k, t] of Object.entries(g)) {
    keys += 1;
    const src = glossSource(k, t);
    if (src) { gm[k] = src; chipped += 1; }
    else { zoneDrift += 1; drifted += 1; }
  }
  z.gloss_m = gm;
  gl.store_version = STORE.index.store_version || null;
  // The redrive of 2026-09-01 (tools/redrive-zone-gloss-v1.mjs) left its own
  // post-build mark, gloss_layer.language_admission, on the zones it moved to
  // the struck store. It is typed here under the same exemption, named to
  // its writer, so the record says who wrote what rather than one tool
  // claiming another's field.
  const wrote = [...WROTE];
  const byField = Object.fromEntries(WROTE.map((f) => [f, "tools/enrich-gloss-m-v1.mjs"]));
  if (gl.language_admission) { wrote.push("gloss_layer.language_admission"); byField["gloss_layer.language_admission"] = "tools/redrive-zone-gloss-v1.mjs"; }
  ef.post_build = {
    rule_id: EXEMPTION_RULE_ID,
    by: "tools/enrich-gloss-m-v1.mjs",
    wrote,
    by_field: byField,
    store_version: STORE.index.store_version || null,
    why: "this zone was built before build-zone wrote gloss_m in its single pass (2026-09-02); its M is derived here from the store now on disk, the same derivation the builder runs",
    expires: "with this zone's rebuild by a build-zone that writes gloss_m (gloss_layer.m_layer present)",
    on: new Date().toISOString().slice(0, 10),
  };
  writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(z), "utf8")));
  zones += 1;
  if (zoneDrift) driftZones.push(`${f.replace(/\.bin$/, "")}: ${zoneDrift}`);
}
console.log(`${zones} zones · ${keys} gloss keys · ${chipped} carry their M · ${drifted} could not be re-derived (no chip written) · ${builtInPass} left alone, their builder wrote the M`);
if (driftZones.length) console.log(`drift, per zone: ${driftZones.slice(0, 10).join(" · ")}${driftZones.length > 10 ? ` · +${driftZones.length - 10} more` : ""}`);
