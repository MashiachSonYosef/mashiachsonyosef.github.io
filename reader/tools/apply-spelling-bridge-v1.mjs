// apply-spelling-bridge-v1 · at a place where our text spells a word otherwise and STEP names our spelling, the word carries STEP's own words for the place as its pieces
//
// GUARDS: spelling-bridge-rule-v1-where-our-text-spells-a-word-otherwise-and-step-names-our-spelling-the-place-reads-steps-own-words-for-it-cut-on-our-letters
// LEDGER: -
// no frame letter. This reads the corpus lane's spelling bridge, pinned in
// data/spelling-bridge/, and writes on the zones it names the pieces of the
// places the pin lays; it moves no word, no position, no count, no key and
// no tag.
//
// THE GAP IT FILLS IS THE LATTICE'S. Lattice v12 reads STEP and MACULA under
// the Leningrad text's spelling. Where our text spells the word otherwise it
// gives the place no reading, and at most such places no pieces, so the
// reader has nothing of the place's own to draw: its line is whatever row
// leads under the key. The corpus lane's relay v202 (Moses, 20 November 2026
// AD) lists the 1,173 places and cuts STEP's pieces onto our letters at
// 1,035. What the list is, which of its classes are laid and what a zone
// carries for a laid place is said once, in tools/spelling-bridge-v1.mjs;
// this tool writes it.
//
// WHAT THIS WRITES, place by place. On the word of a laid place, pg: its
// pieces in order, each as a zone writes a piece (our letters, STEP's English
// as STEP writes it, its source, its role). At a place the pin does not lay,
// nothing.
//
// WHAT IT PROVES FIRST, every one a refusal that writes nothing. The pin's
// files are the bytes it names, and the lane's receipt names the three lists
// the same. Every class of the list is named by the pin, laid or not, with
// the list's own count. Each laid place's pieces are STEP's, in order, and
// spell our letters; one form row of the relay is named for the place, under
// the same key, and its words cut at the stroke are the pieces' English, the
// brackets aside. Each laid place is found on its zone by its verse, its
// number among the verse's words and the lattice's surface, a plain word
// under the list's key, carrying no pieces or these pieces. Anything else, a
// laid place that carries other pieces, is a refusal.
//
// BRIDGE V1.1 (relay v214; ship 17, 22 November 2026). The list read is v1.1,
// v1's lines with each piece's part as STEP writes it, brackets kept. The pin
// lays, beside the 206 places worded by their form rows, the other places of
// new pieces (THROUGH_ONE_LETTER, SAME_LETTERS), each piece worded by its part
// as written, its ends trimmed; it holds within their class the places whose
// pieces carry STEP's «}+» tag (bridge v1.2 mends them), the places that are
// pairs, and the places call 4 of relay v189 holds as they rest (STEP's words
// written with « | », until the corpus lane says how STEP reads them). Before
// anything is written it proves, as well, that each line of v1.1
// with its added fields taken off is v1's line, and that the marks off each
// laid piece's part give v1's English (tools/spelling-bridge-v1.mjs). Nothing
// laid at the 206 moves: each form row's part is the part as v1.1 writes it.
// Where call 4 of relay v189 makes STEP's own reading stand, the place is held
// too (ship 17's suite, 22 November 2026): the page asks STEP's reading before
// the place's pieces, and laid there the pieces read the place a second way,
// on its card and across words, until the page lane says how such a place is
// drawn.
//
// BRIDGE V1.2 (relay v220; ship 20, 23 November 2026). The list laid from is
// v1.2, v1.1's lines with STEP's «{…}+» tags read as STEP's key says, and it is
// proved first, as well, that each of its lines, its three added fields taken
// off and the changes its list of changes names set back, is v1.1's line. No
// laid place is among the 43 it mends, so no piece laid moves; each zone's
// record names v1.2's list and the list it extends (v1.1), and is written again
// where it named v1.1's.
//
// IT IS RUN BY THE ROUND, FIRST IN ITS ZONES STEP (tools/round-v1.sh), and
// whenever the place's pieces are laid again. First, because two tools of
// that step read a place's pieces: the line read again takes a name's lead
// from the piece of STEP's that is the word's core (tools/proper-name-v1.mjs),
// and the lattice projection takes the name's lead under "only" and the stems
// a card can ask. Laid after them, a first round left Genesis 49:10's
// «Shiloh» without its name's lead until a second round. Run over zones that
// carry its work it writes nothing.
//
// The lane's next lattice may read these places under our spelling and give
// them pieces itself. A zone that carries other pieces at a laid place is
// refused here, and the pin is retired then; it is never to be run past a
// refusal.
//
// The write is typed on each zone it changes (single-pass-exemption-v1,
// tools/zone-post-build-v1.mjs), with what the zone carries in
// emitted_from.spelling_bridge.
//
// Run: node tools/apply-spelling-bridge-v1.mjs --stamp <YYYY-MM-DD> [--zones data/zones] [--pin data/spelling-bridge/PIN.json] [--dry]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { PinFault } from "./pinned-v1.mjs";
import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";
import {
  SPELLING_BRIDGE_RULE_ID, SPELLING_BRIDGE_HOME, SPELLING_BRIDGE_TOOL, readBridge, receiptAgainst, v11Against, v12Against, laidOf, findBridgePlace, carriedAt,
} from "./spelling-bridge-v1.mjs";

const arg = (name, dflt = null) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : dflt; };
const STAMP = arg("stamp"), ZONES = arg("zones", "data/zones"), PIN = arg("pin", `${SPELLING_BRIDGE_HOME}/PIN.json`);
const DRY = process.argv.includes("--dry");
if (!STAMP || !/^\d{4}-\d{2}-\d{2}$/u.test(STAMP)) { console.log(`usage: --stamp <YYYY-MM-DD> [--zones data/zones] [--pin ${SPELLING_BRIDGE_HOME}/PIN.json] [--dry]`); process.exit(2); }

const faults = [];
const fault = (say) => { faults.push(say); console.log(`FAIL  ${say}`); };
const refuse = () => { console.log(`\napply-spelling-bridge-v1: ${faults.length} fault(s); nothing written`); process.exit(1); };
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
const n = (x) => Number(x).toLocaleString("en-US");

// ── the pin and the list ────────────────────────────────────────────────
let bridge = null;
try { bridge = readBridge(PIN); } catch (e) { if (!(e instanceof PinFault)) throw e; fault(e.message); refuse(); }
for (const f of receiptAgainst(bridge)) fault(f);
for (const f of v11Against(bridge)) fault(f);
for (const f of v12Against(bridge)) fault(f);
const { laid, counts, faults: listFaults } = laidOf(bridge);
for (const f of listFaults) fault(f);
if (faults.length) refuse();

// ── each laid place, on its zone ────────────────────────────────────────
const zones = new Map();   // book -> { zone, zPath, here: [{ place, found, carried }] }
for (const place of laid) {
  if (!zones.has(place.book)) {
    const zPath = join(ZONES, `${place.book}.bin`);
    if (!existsSync(zPath)) { fault(`${place.book}: ${zPath} is not on disk`); zones.set(place.book, null); continue; }
    zones.set(place.book, { zone: gz(zPath), zPath, here: [] });
  }
  const held = zones.get(place.book);
  if (!held) continue;
  const where = `${place.book} ${place.place}`;
  const found = findBridgePlace(held.zone, place);
  if (found.fault) { fault(`${where}: ${found.fault}`); continue; }
  const carried = carriedAt(found.word, place);
  if (carried === "other") { fault(`${where}: the zone carries pieces that are not the list's (${JSON.stringify(found.word.pg)})`); continue; }
  held.here.push({ place, found, carried });
}
if (faults.length) refuse();

// ── what there is to do ─────────────────────────────────────────────────
const all = [...zones.values()].flatMap((z) => z.here);
const toLay = all.filter((h) => h.carried === "none");
const recordOf = (here) => ({
  rule_id: SPELLING_BRIDGE_RULE_ID,
  applied_by: SPELLING_BRIDGE_TOOL,
  pin: `${SPELLING_BRIDGE_HOME}/PIN.json`,
  relay: bridge.pin.v1_2.relay,
  letter: bridge.pin.v1_2.letter,
  list: { file: `${bridge.pin.v1_2.folder}/${bridge.pin.v1_2.places.file}`, sha256: bridge.pin.v1_2.places.sha256, lines: bridge.pin.v1_2.places.lines },
  extends: { file: `${bridge.pin.v1_1.folder}/${bridge.pin.v1_1.places.file}`, sha256: bridge.pin.v1_1.places.sha256, relay: bridge.pin.v1_1.relay },
  counts: { places_laid: here.length, pieces: here.reduce((s, h) => s + h.place.pieces.length, 0) },
  here: here.map((h) => ({ ref: h.place.ref, section_word: h.found.at, word: h.place.n, reads: h.place.words })),
  what: "each of these places is spelled otherwise in our text than in the Leningrad text STEP follows, and the corpus lane's list cuts STEP's pieces onto our letters there. The word carries the place's pieces (pg): our letters as the corpus lane's list cuts them, and for each piece STEP's own words for this place, as STEP writes them, so the reader draws the place's line from them as it does at every place that carries pieces. No word, position, count, key or tag moved",
});
// a zone whose record is not the recount is written again, though its pieces stand
const stale = [...zones.values()].filter((z) => z && z.here.length && (() => { const has = (z.zone.emitted_from || {}).spelling_bridge; if (!has) return true; const { applied_on, ...rest } = has; return JSON.stringify(rest) !== JSON.stringify(recordOf(z.here)); })());
console.log(`${n(bridge.places.length)} places listed · ${[...counts].filter(([k]) => (bridge.pin.laid || []).some((e) => k === `${e.class} · ${e.use}`)).map(([k, v]) => `${n(v)} of ${k}`).join(", ")} laid, on ${zones.size} zones (${n(all.reduce((s, h) => s + h.place.pieces.length, 0))} pieces)`);
console.log(`  pieces: ${n(toLay.length)} place(s) to lay (${n(toLay.reduce((s, h) => s + h.place.pieces.length, 0))} pieces) · ${n(all.length - toLay.length)} already laid, the same`);
if (process.argv.includes("--list")) for (const h of all) console.log(`  ${h.place.book} ${h.place.place} · ${h.place.pieces.map((x) => `${x.k} «${x.g.trim()}»`).join(" + ")}${h.carried === "none" ? "" : " · laid"}`);
if (!toLay.length && !stale.length) { console.log("nothing to write"); process.exit(0); }
if (DRY) { console.log("--dry: nothing written"); process.exit(0); }

// ── the write ───────────────────────────────────────────────────────────
for (const { zone, zPath, here } of zones.values()) {
  if (!here.length) continue;
  if (!here.some((h) => h.carried === "none") && !stale.some((z) => z.zone === zone)) continue;
  for (const { place, found, carried } of here) if (carried === "none") found.word.pg = place.pieces.map((x) => ({ k: x.k, g: x.g, s: x.s, r: x.r }));
  const ef = zone.emitted_from || (zone.emitted_from = {});
  const { rule_id, ...rest } = recordOf(here);
  ef.spelling_bridge = { rule_id, applied_on: STAMP, ...rest };
  typePostBuildWrite(zone, {
    tool: SPELLING_BRIDGE_TOOL,
    fields: ["emitted_from.spelling_bridge", "sections[].words[].pg"],
    why: "the lattice the zone was projected from reads STEP under the Leningrad text's spelling and gives a place our text spells otherwise no pieces; the corpus lane's spelling bridge (relays v202, v214 and v220) cuts STEP's pieces onto our letters, and STEP's own words for the place, as STEP writes them, give their words",
    expires: "with this zone's projection from a lattice of the corpus lane's that gives these places pieces itself",
    stamp: STAMP,
  });
  writeZone(zPath, zone);
  console.log(`wrote ${zPath} · ${here.length} place(s)`);
}
