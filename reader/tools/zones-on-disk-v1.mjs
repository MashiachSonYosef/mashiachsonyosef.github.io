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

import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ZONES = process.env.ZONES_DIR || "data/zones";
const PORT = process.env.SERVE_PORT || "8899";
const BASE = process.env.SERVE_BASE || `http://127.0.0.1:${PORT}`;

/** Every zone on disk that is a work: not a commentary sidecar, not a route
 *  shard, not a test instrument. Sorted, so a run is reproducible.
 *
 *  A sidecar is <slug>.commentary.bin — a dot, not a hyphen. It was
 *  <slug>-commentary.bin until 2026-09-02, when the fleet served a work whose
 *  own slug ends in "-commentary" (an introduction to a Mishnah commentary)
 *  and every tool that knew a sidecar by that suffix passed the work over as
 *  one. A slug is derived from the work id and never carries a dot, so a name
 *  with one cannot be a work's, and the collision cannot recur. */
export function zonesOnDisk(dir = ZONES) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".bin"))
    .filter((f) => !f.endsWith(".commentary.bin"))
    .filter((f) => !/^[0-9a-f]{2}\.bin$/.test(f))   // route-store shards
    .filter((f) => f !== "w-top.bin")
    .filter((f) => !f.startsWith("fixture-"))       // instruments, not works
    .map((f) => f.replace(/\.bin$/, ""))
    .sort();
}

/** Every zone the door may SERVE — the shelf, after the count gate.
 *
 *  These were one list for as long as the shelf was the publishing
 *  authority: a zone existed, so a book was served, and a check that wanted
 *  to know what the door offers could ask the directory. count-gate-rule-v1
 *  separates them. A book is served when its own count equals the count the
 *  scribes published for it, so the shelf is now what we have and this is
 *  what we can stand behind, and the two differ by however much we have not
 *  yet proved.
 *
 *  A check that asks "what does the door offer" wants this one. A check that
 *  asks "what did the builder produce" still wants zonesOnDisk. Getting that
 *  backwards is how a guard comes to demand that the door publish a book the
 *  gate withheld — which is the guard failing, not the door.
 *
 *  No receipt is a refusal, never a pass: same law as the door's. */
export function zonesServed(dir = ZONES) {
  const receipt = join(dir, "..", "count-gate-receipt-v1.json");
  if (!existsSync(receipt)) return [];
  const passed = new Set(JSON.parse(readFileSync(receipt, "utf8")).passed || []);
  return zonesOnDisk(dir).filter((z) => passed.has(z));
}

/** Zones that also carry a commentary sidecar. A check about commentary has
 *  nothing to look at without one, and should say so rather than pass. */
export function zonesWithCommentary(dir = ZONES) {
  return zonesOnDisk(dir).filter((z) => existsSync(join(dir, `${z}.commentary.bin`)));
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
