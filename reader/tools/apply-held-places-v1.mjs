#!/usr/bin/env node
// apply-held-places-v1 · on the word of each place the corpus lane holds a row at, the rows held there and the line the place reads without them
//
// GUARDS: place-hold-rule-v1-a-row-the-corpus-lane-holds-at-a-place-rests-withheld-there-and-stands-at-every-other-place
// LEDGER: -
// no frame letter. This reads the corpus lane's list of held places, pinned
// in data/held-places/, the commentary zones and the store, and writes on the
// zones the hold of each held place; it moves no word, no position, no count,
// no key and no line of any other place.
//
// THE RULE IS SAID ONCE, in tools/held-places-v1.mjs (23 November 2026, ship
// 18, relay v221). This tool lays it: on the word of each place the list
// marks held at rest, `ph`, the rows held there (each its source, words and
// the lane's class) and the line the place reads without them (the first
// reading of the key's pool less those rows, in the store's own order, or
// none). The reader draws that line at the place and keeps the rows off the
// word's card there at rest.
//
// WHAT IT PROVES FIRST, every one a refusal that writes nothing. The pin's
// files are the bytes the relay's letter names. Every held place is of a work
// a zone of this tree serves, or of a work the pin names as not served (and
// no zone serves it), or a place the pin names as not found. A served work's
// place is a commentary zone's: the Tikkunei Zohar, served as a book, holds
// none, and a held place there is refused (the book's line is the lattice's
// and its card is gated by the place's own facts; laying a hold there is
// another build). Each place is found by its work, its verse unit and its key
// among the verse's plain words; where the key stands more than once, as
// tools/held-places-v1.mjs says (matchHeld). The zone's own line for each key
// held is the store's (the line read again before this, as the round runs it),
// so the line written is of the store the zone reads.
//
// IT IS RUN BY THE ROUND, IN ITS ZONES STEP, right after the commentary's line
// is read again (tools/round-v1.sh): the line under a hold is read from the
// same store, and a store that moved moves it. A word that carries a hold no
// place of the list names loses it. Run over zones that carry its work, with
// the same store, it writes nothing.
//
// The write is typed on each zone it changes (single-pass-exemption-v1,
// tools/zone-post-build-v1.mjs), with what the zone carries in
// emitted_from.held_places.
//
// Run: node tools/apply-held-places-v1.mjs --stamp <YYYY-MM-DD> [--zones data/zones] [--store data/route-store] [--dry]
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readKinds, restsOffIn } from "./dictionary-kinds-v1.mjs";
import { PinFault } from "./pinned-v1.mjs";
import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";
import { PLACE_HOLD_RULE_ID, HELD_PLACES_HOME, HELD_PLACES_TOOL, PLACE_HOLD_FIELD, readHeldPlaces, servedWorks, heldGroups, wordsOfKeyIn, matchHeld, lineUnderHold, placeHoldOf } from "./held-places-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt = null) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : dflt; };
const STAMP = arg("stamp"), ZONES = arg("zones", join(K3, "data", "zones")), STORE = arg("store", join(K3, "data", "route-store"));
const DRY = process.argv.includes("--dry");
if (!STAMP || !/^\d{4}-\d{2}-\d{2}$/u.test(STAMP)) { console.log("usage: --stamp <YYYY-MM-DD> [--zones data/zones] [--store data/route-store] [--dry]"); process.exit(2); }
const n = (x) => Number(x).toLocaleString("en-US");
const faults = [];
const fault = (say) => { faults.push(say); console.log(`FAIL  ${say}`); };
const refuse = () => { console.log(`\napply-held-places-v1: ${faults.length} fault(s); nothing written`); process.exit(1); };
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// ── the pin and its list ────────────────────────────────────────────────
let list;
try { list = readHeldPlaces(K3); } catch (e) { if (e instanceof PinFault) { fault(e.message); refuse(); } throw e; }
const { pin } = list;
const served = servedWorks(ZONES);
const groups = heldGroups(list);
const notServed = pin.works_not_served || {};
const notFound = new Set((pin.not_found || []).map((x) => [x.work, x.unit, x.key].join("\u0001")));
for (const w of Object.keys(notServed)) {
  if (served.has(w)) fault(`the pin names ${w} as not served, and ${served.get(w).file} serves it`);
  if (typeof notServed[w].why !== "string" || !notServed[w].why.trim()) fault(`the pin names ${w} as not served and does not say why`);
}

// ── each held place, on its zone ────────────────────────────────────────
const zones = new Map();   // file -> { zone, store, laid: [{ g, unit, word }] }
const kindsRec = readKinds(join(STORE, ".."));
let away = 0, missing = 0;
for (const g of groups.values()) {
  const where = `${g.work} ${g.unit} (${[...g.rows.values()].map((r) => `${r.m} «${r.route}»`).join(", ")})`;
  const s = served.get(g.work);
  if (!s) { if (notServed[g.work]) away += [...g.rows.values()].reduce((a, r) => a + r.held.length, 0); else fault(`${where}: no zone of this tree serves the work, and the pin does not name it as not served`); continue; }
  if (s.kind !== "commentary") { fault(`${where}: the work is served as a book (${s.file}); a hold there is not laid by this tool`); continue; }
  if (!zones.has(s.file)) {
    const zone = gz(join(ZONES, s.file));
    // the store opened as the line of this zone is read (tools/regloss-zone.mjs, rules 6 and 7)
    const atRest = restsOffIn(kindsRec.rec, zone);
    zones.set(s.file, { zone, store: openRouteStore(STORE, { atRest, signLast: atRest }), laid: [] });
  }
  const z = zones.get(s.file);
  const { entries, hits } = wordsOfKeyIn(z.zone, g.work, g.unit, g.key);
  if (!hits.length) {
    if (notFound.has([g.work, g.unit, g.key].join("\u0001"))) { missing += 1; continue; }
    fault(`${where}: ${entries ? "the verse on our zone does not carry the key" : "our zone carries no such verse of the work"}, and the pin does not name the place as not found`); continue;
  }
  const m = matchHeld(g, hits);
  if (m.fault) { fault(`${where}: ${m.fault}`); continue; }
  // the zone's own line for the key is the store's, so the line under the hold is of the store the zone reads
  const unheld = z.store.glossFor(g.key).text;
  if ((z.zone.gloss || {})[g.key] !== (unheld ?? undefined)) { fault(`${where}: ${s.file} reads ${JSON.stringify((z.zone.gloss || {})[g.key] ?? null)} under the key and the store ${JSON.stringify(unheld)}: read the commentary's line again first (tools/regloss-zone.mjs)`); continue; }
  for (const [j, rows] of m.at) z.laid.push({ g, unit: g.unit, word: hits[j].word, at: hits[j].i, rows, unheld, ph: placeHoldOf(rows, lineUnderHold(z.store, g.key, rows)) });
}
if (faults.length) refuse();

// ── what there is to do ─────────────────────────────────────────────────
const recordOf = (laid) => ({
  rule_id: PLACE_HOLD_RULE_ID,
  applied_by: HELD_PLACES_TOOL,
  pin: `${HELD_PLACES_HOME}/PIN.json`,
  relay: pin.relay,
  letter: pin.letter,
  list: { file: `${pin.folder}/${pin.places.file}`, sha256: pin.places.sha256, lines: pin.places.lines },
  counts: { places_held: laid.length, rows_held: laid.reduce((a, x) => a + x.rows.length, 0), lines_moved: laid.filter((x) => x.ph.g !== x.unheld).length },
  here: laid.map((x) => ({ unit: x.unit, word: x.at, key: x.g.key, held: x.ph.r, line: x.ph.g, line_unheld: x.unheld })),
  what: "at each of these places the corpus lane's resting call (relay v221) says the text's word is another word written alike than the word of the rows held there. The word carries ph: those rows, each its source, words and the lane's class, and the line the place reads without them, the first reading of its key's pool less those rows in the store's own order (null: none is left). The reader draws that line at the place and keeps the rows off the word's card there under «only this pointing»; they stand at every other place. No word, position, count or key moved, and no line of another place",
});
let toWrite = 0, linesMoved = 0, stripped = 0;
for (const [file, z] of zones) {
  const want = new Map(z.laid.map((x) => [x.word, x.ph]));
  z.changes = 0;
  for (const u of Object.values(z.zone.units || {})) for (const e of u.section || []) for (const w of e.words || []) {
    const has = w[PLACE_HOLD_FIELD], should = want.get(w);
    if (should === undefined && has !== undefined) { z.changes += 1; stripped += 1; continue; }
    if (should !== undefined && !same(has, should)) z.changes += 1;
  }
  const rec = recordOf(z.laid), have = (z.zone.emitted_from || {}).held_places;
  const { applied_on, ...rest } = have || {};
  z.stale = !have || !same(rest, rec);
  if (z.changes || z.stale) toWrite += 1;
  linesMoved += rec.counts.lines_moved;
}
// a zone this list lays nothing on that carries a hold all the same (the list moved): its holds come off
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".commentary.bin") && !x.startsWith("fixture-")).sort()) {
  if (zones.has(f)) continue;
  const zone = gz(join(ZONES, f));
  let k = 0;
  for (const u of Object.values(zone.units || {})) for (const e of u.section || []) for (const w of e.words || []) if (w[PLACE_HOLD_FIELD] !== undefined) k += 1;
  if (k || (zone.emitted_from || {}).held_places) { zones.set(f, { zone, laid: [], changes: k, stale: true, none: true }); stripped += k; toWrite += 1; }
}
const laid = [...zones.values()].flatMap((z) => z.laid);
console.log(`held places · relay ${pin.relay} · ${n(list.held.length)} row-places held at rest: ${n(laid.reduce((a, x) => a + x.rows.length, 0))} laid on ${n([...zones.values()].filter((z) => z.laid.length).length)} commentary zone(s) at ${n(laid.length)} word(s), ${n(away)} in ${Object.keys(notServed).length} works no zone serves, ${n(missing)} named not found`);
console.log(`  holds: ${n(laid.length)} word(s) · ${n([...zones.values()].reduce((a, z) => a + z.changes, 0))} to write (${n(stripped)} to take off) · zones to write ${n(toWrite)}`);
console.log(`  lines: ${n(linesMoved)} of the ${n(laid.length)} held words read another line than their key's (${n(laid.filter((x) => x.ph.g === null && x.unheld !== null).length)} bare)`);
if (process.argv.includes("--list")) for (const x of laid) console.log(`  ${x.unit} word ${x.at} · ${x.ph.r.map((r) => `${r[0]} «${r[1]}» ${r[2]}`).join(", ")} · line ${JSON.stringify(x.unheld)} -> ${JSON.stringify(x.ph.g)}`);
if (!toWrite) { console.log("nothing to write"); process.exit(0); }
if (DRY) { console.log("--dry: nothing written"); process.exit(0); }

// ── the write ───────────────────────────────────────────────────────────
for (const [file, z] of zones) {
  if (!z.changes && !z.stale) continue;
  const want = new Map(z.laid.map((x) => [x.word, x.ph]));
  for (const u of Object.values(z.zone.units || {})) for (const e of u.section || []) for (const w of e.words || []) {
    const should = want.get(w);
    if (should === undefined) delete w[PLACE_HOLD_FIELD];
    else w[PLACE_HOLD_FIELD] = should;
  }
  const ef = z.zone.emitted_from || (z.zone.emitted_from = {});
  if (z.none) delete ef.held_places;
  else { const { rule_id, ...rest } = recordOf(z.laid); ef.held_places = { rule_id, applied_on: STAMP, ...rest }; }
  typePostBuildWrite(z.zone, {
    tool: HELD_PLACES_TOOL,
    fields: ["emitted_from.held_places", "units[].section[].words[].ph"],
    why: "a row of the translation tables names a spelling and no place, and the commentary's zone carries no tag or grade of a place to part it from another word written alike; the corpus lane's resting call (relay v221) names, place by place, where the text's word is another word, and the word carries the rows held there and the line it reads without them",
    expires: "with the corpus lane's next resting call for these rows, or a commentary zone that carries the place's own entry",
    stamp: STAMP,
  });
  writeZone(join(ZONES, file), z.zone);
  console.log(`wrote data/zones/${file} · ${z.laid.length} held word(s)`);
}
