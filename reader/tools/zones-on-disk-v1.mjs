// zones-on-disk-v1
//
// What is actually here, asked of the directory rather than of a list.
//
// Every check in this tree used to name its book in its own source — a slug
// typed once and then true only until somebody moved a work. On 2026-08-23 a
// withdrawal moved five, and twenty checks went on naming `genesis` and
// `1kings`, which is to say twenty checks stopped running. Nothing said so.
// The export was broken end to end for every work in the repository during
// exactly that window, and the check written to catch it could not open a
// page to look.
//
// So the default is derived. A check that asks this module for its target
// gets a zone that exists at the moment it runs, and follows the corpus when
// the corpus moves. A slug typed into a check is a claim about the future,
// and this file is how that claim stops being made.

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ZONES = process.env.ZONES_DIR || "data/zones";
const PORT = process.env.SERVE_PORT || "8899";
const BASE = process.env.SERVE_BASE || `http://127.0.0.1:${PORT}`;

/** Every zone on disk that is a work: not a commentary sidecar, not a route
 *  shard, not a test instrument. Sorted, so a run is reproducible. */
export function zonesOnDisk(dir = ZONES) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".bin"))
    .filter((f) => !f.endsWith("-commentary.bin"))
    .filter((f) => !/^[0-9a-f]{2}\.bin$/.test(f))   // route-store shards
    .filter((f) => f !== "w-top.bin")
    .filter((f) => !f.startsWith("fixture-"))       // instruments, not works
    .map((f) => f.replace(/\.bin$/, ""))
    .sort();
}

/** Zones that also carry a commentary sidecar. A check about commentary has
 *  nothing to look at without one, and should say so rather than pass. */
export function zonesWithCommentary(dir = ZONES) {
  return zonesOnDisk(dir).filter((z) => existsSync(join(dir, `${z}-commentary.bin`)));
}

/** The URL a check should open by default. Argv still wins, so a run can
 *  always be pointed somewhere on purpose. */
export function defaultZoneUrl(argv = process.argv[2], dir = ZONES) {
  if (argv) return argv;
  const [first] = zonesOnDisk(dir);
  if (!first) {
    console.error("no zone on disk to check — refusing to open a page for a work that is not here");
    process.exit(2);
  }
  return `${BASE}/zone.html?b=${first}`;
}

/** Every served zone, for a check that should sweep rather than sample. */
export function zoneUrls(dir = ZONES) {
  return zonesOnDisk(dir).map((z) => `${BASE}/zone.html?b=${z}`);
}

/** The slug out of a url a check was handed. */
export function zoneIdOf(url) {
  // letters in any script — most of the shelf's slugs are Hebrew; an
  // ASCII-only match here silently returned null for two thousand works
  const m = String(url || "").match(/[?&]b=([^&#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
