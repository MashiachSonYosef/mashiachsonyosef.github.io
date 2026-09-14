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

/** EVERY SIDECAR SUFFIX THERE IS, in one place, because four tools got this
 *  wrong in one week by each keeping its own list.
 *
 *  A sidecar rides beside a book zone under the book's own slug and a
 *  suffix: <slug>.commentary.bin, <slug>.hoh.bin, <slug>.lattice.bin,
 *  <slug>.volume.bin. None of them is a work. Every tool that enumerates the
 *  shelf must skip all of them, and the way a tool comes to skip three of
 *  four is by holding its own copy of the list: the copy was right when it
 *  was written and the fourth suffix arrived somewhere else. So the list
 *  lives here, is exported, and check-sidecars-all-named-v1 fails any tool
 *  that writes its own.
 *
 *  The suffix is a DOT, not a hyphen. It was <slug>-commentary.bin until
 *  2026-09-02, when the fleet served a work whose own slug ends in
 *  "-commentary" (an introduction to a Mishnah commentary) and every tool
 *  that knew a sidecar by that suffix passed the work over as one. A slug is
 *  derived from the work id and never carries a dot, so a name with one
 *  cannot be a work's, and the collision cannot recur. */
export const SIDECAR_SUFFIXES = Object.freeze([
  ".commentary.bin",   // a commentary on this book, aligned to its sections
  ".hoh.bin",          // Hebrew-on-Hebrew: a dictionary in the text's own language
  ".lattice.bin",      // the corpus lane's grade of every card, per position
  ".volume.bin",       // how much commentary sits on each verse, chapter and book
]);

/** Whether a file name in the zones directory is a sidecar rather than a work. */
export const isSidecar = (f) => SIDECAR_SUFFIXES.some((s) => String(f).endsWith(s));

/** The sidecars that hold no Hebrew a reader opens.
 *
 *  A second axis, and a real one: a commentary sidecar and a dictionary
 *  sidecar are text — every word of them opens a card, so every check about
 *  what a reader may open asks them the same questions it asks a book. A
 *  lattice sidecar holds grades and fingerprints; a volume sidecar holds
 *  three numbers. Asking either of them about its component layer is asking
 *  a file with no words in it whether it withheld any.
 *
 *  It is a separate list from SIDECAR_SUFFIXES because it answers a separate
 *  question, and a check that wants "not a work" must not get "not text" by
 *  accident. Both are here so neither is written anywhere else. */
export const SIDECARS_WITHOUT_READER_HEBREW = Object.freeze([".lattice.bin", ".volume.bin"]);

/** Whether a name in the zones directory holds Hebrew a reader can open —
 *  true for a book, a commentary sidecar and a dictionary sidecar. */
export const carriesReaderHebrew = (f) => !SIDECARS_WITHOUT_READER_HEBREW.some((s) => String(f).endsWith(s));

/** The book a sidecar rides beside, or null if the name is not a sidecar. */
export function baseOfSidecar(f) {
  const s = SIDECAR_SUFFIXES.find((x) => String(f).endsWith(x));
  return s ? String(f).slice(0, -s.length) : null;
}

/** Every zone on disk that is a work: not a sidecar, not a route shard, not a
 *  test instrument. Sorted, so a run is reproducible. */
export function zonesOnDisk(dir = ZONES) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".bin"))
    .filter((f) => !isSidecar(f))
    .filter((f) => !/^[0-9a-f]{2}\.bin$/.test(f))   // route-store shards
    .filter((f) => f !== "w-top.bin")
    .filter((f) => !f.startsWith("fixture-"))       // instruments, not works
    .map((f) => f.replace(/\.bin$/, ""))
    .sort();
}

/** Every zone the door may SERVE — the shelf, after the gate.
 *
 *  These were one list for as long as the shelf was the publishing
 *  authority: a zone existed, so a book was served, and a check that wanted
 *  to know what the door offers could ask the directory. The gate separates
 *  them. Since 2026-09-06 the gate is the frame's own REFUSALS
 *  (refusals-gate-rule-v1, tools/check-c0-refusals-v1.mjs): a book is
 *  served when no line of the C0 letter refuses a position of it, as built;
 *  the count is not a gate but a stamp on the book's own page. So the shelf
 *  is what we have and this is what we can stand behind, and the two differ
 *  by every book a line refused.
 *
 *  A check that asks "what does the door offer" wants this one. A check that
 *  asks "what did the builder produce" still wants zonesOnDisk. Getting that
 *  backwards is how a guard comes to demand that the door publish a book the
 *  gate withheld — which is the guard failing, not the door.
 *
 *  No receipt is a refusal, never a pass: same law as the door's. */
export const SERVE_GATE_RECEIPT = "serve-gate-receipt-v1.json";
export function zonesServed(dir = ZONES) {
  const receipt = join(dir, "..", SERVE_GATE_RECEIPT);
  if (!existsSync(receipt)) return [];
  // `served` is what the door offers: the books no line refused AND whose
  // count is stamped beside its witnesses — the counted works, this launch
  const served = new Set(JSON.parse(readFileSync(receipt, "utf8")).served || []);
  return zonesOnDisk(dir).filter((z) => served.has(z));
}

/** Zones that also carry a commentary sidecar. A check about commentary has
 *  nothing to look at without one, and should say so rather than pass. */
export function zonesWithCommentary(dir = ZONES) {
  return zonesOnDisk(dir).filter((z) => existsSync(join(dir, `${z}.commentary.bin`)));
}

/** Zones that carry a commentary sidecar AND are themselves served. This is
 *  what the door may offer: a commentary is read where its base is read, so a
 *  commentary beside a book the gate withheld has nowhere to be offered and
 *  must not be. A check asking "what does the door offer" wants this one;
 *  a check asking "what did the builder produce" still wants the list above. */
export function zonesServedWithCommentary(dir = ZONES) {
  const served = new Set(zonesServed(dir));
  return zonesWithCommentary(dir).filter((z) => served.has(z));
}

/** Zones that carry V's volume sidecar (<slug>.volume.bin): how much
 *  commentary the corpus lane has indexed on each of that book's verses,
 *  chapters and the book itself. A check about the counts layer has nothing
 *  to look at without one, and should say so rather than pass. */
export function zonesWithVolume(dir = ZONES) {
  return zonesOnDisk(dir).filter((z) => existsSync(join(dir, `${z}.volume.bin`)));
}

/** Zones that also carry a Hebrew-on-Hebrew sidecar (<slug>.hoh.bin), fixtures
 *  included — a fixture is the only place one may stand until a delivery
 *  lands, and the check that presses the panel needs to find it. */
export function zonesWithHoh(dir = ZONES) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".hoh.bin")).map((f) => f.replace(/\.hoh\.bin$/, "")).sort()
    .filter((z) => existsSync(join(dir, `${z}.bin`)));
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
