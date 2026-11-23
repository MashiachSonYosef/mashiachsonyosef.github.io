#!/usr/bin/env node
// RUN: tree
// GUARDS: place-hold-rule-v1-a-row-the-corpus-lane-holds-at-a-place-rests-withheld-there-and-stands-at-every-other-place
// LEDGER: -
// no frame letter. A check reads the pin of the held places, its list, the
// zones and the store, and judges them; it is not the ledger for one.
//
// A ROW THE CORPUS LANE HOLDS AT A PLACE RESTS WITHHELD THERE, AND STANDS AT
// EVERY OTHER PLACE (23 November 2026, ship 18; the rule is said once, in
// tools/held-places-v1.mjs). The corpus lane's resting call for every row of
// the translation tables at every place of the Targum and the Zohar (relay
// v221) is kept in data/held-places/, and tools/apply-held-places-v1.mjs lays
// it on the commentary zones. This holds the zones to the list:
//
//   H1  the pin is a pin of the held places, and every file it names is the
//       bytes it names (the relay's letter's); the list holds the places the
//       pin counts as held at rest, zone by zone
//   H2  every place the list holds at rest is held on our zones: its word,
//       found by its work, verse unit and key, carries the row with the
//       lane's class; or its work is named in the pin as not served, with
//       why, and no zone of this tree serves it; or the place is named in
//       the pin as not found, with why, and its verse does not carry the key
//   H3  nothing else is held: every word of every zone that carries a hold
//       is a held place of the list, with exactly the list's rows; a place
//       the list says stands holds no row, and so the branches the lane
//       labels and leaves off at rest (WIDE_HOLD, the corpus hold on a
//       points tie) hold nothing; no book zone carries a hold
//   H4  the line each held word carries is the store's: the first reading of
//       its key's pool less the rows held there (none where nothing is left),
//       the store opened as the zone's line is read; and the zone's own line
//       for the key is the store's
//   H5  a zone that carries holds says so (emitted_from.held_places: the
//       rule, the pin, the list's bytes, one entry for each held word), and
//       its post-build record names the tool for the field; a zone that
//       carries none says nothing of it
//
// The words are found in the data, never named. A tree with no pin of the
// held places is skipped (exit 3).
// Run: node tools/check-held-places-v1.mjs [--zones data/zones] [--store data/route-store]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readKinds, restsOffIn } from "./dictionary-kinds-v1.mjs";
import { PinFault } from "./pinned-v1.mjs";
import { wordListsOf } from "./zone-walk-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { PLACE_HOLD_RULE_ID, HELD_PLACES_HOME, HELD_PLACES_TOOL, PLACE_HOLD_FIELD, readHeldPlaces, servedWorks, heldGroups, wordsOfKeyIn, matchHeld, lineUnderHold, placeHoldOf } from "./held-places-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones")), STORE = arg("store", join(K3, "data", "route-store"));
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (xs, k = 3) => xs.slice(0, k).join(" · ") + (xs.length > k ? ` · and ${nf(xs.length - k)} more` : "");
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const sorted = (o) => JSON.stringify(Object.entries(o || {}).sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const SEP = "\u0001";

console.log(`— ${PLACE_HOLD_RULE_ID} —\n`);
if (!existsSync(join(K3, HELD_PLACES_HOME, "PIN.json"))) { console.log(`SKIPPED — no pin of the held places on this tree (${HELD_PLACES_HOME}/PIN.json)`); process.exit(3); }

// ---- H1 ----------------------------------------------------------------------------------------------------------------
let list = null;
{
  const faults = [];
  try { list = readHeldPlaces(K3); } catch (e) { if (!(e instanceof PinFault)) throw e; faults.push(e.message); }
  if (list) {
    const by = {};
    for (const p of list.held) by[p.zone] = (by[p.zone] || 0) + 1;
    if (sorted(by) !== sorted((list.pin.held_at_rest || {}).by_zone)) faults.push(`the list holds ${JSON.stringify(by)} at rest by zone, and the pin says ${JSON.stringify((list.pin.held_at_rest || {}).by_zone)}`);
    const br = {};
    for (const p of list.places) for (const b of p.branches) br[b] = (br[b] || 0) + 1;
    if (sorted(br) !== sorted((list.pin.branches_off_at_rest || {}).places)) faults.push(`the list labels ${JSON.stringify(br)} with a branch, and the pin says ${JSON.stringify((list.pin.branches_off_at_rest || {}).places)}`);
  }
  check("H1  the pin is a pin of the held places; every file it names is its bytes; the list holds the places the pin counts as held at rest, zone by zone, and labels the branches it counts", faults.length === 0,
    faults.length ? first(faults) : `relay ${list.pin.relay} · ${nf(list.places.length)} row-places · ${nf(list.held.length)} held at rest (${Object.entries(list.pin.held_at_rest.by_zone).map(([z, k]) => `${z} ${nf(k)}`).join(", ")}) · branches off at rest: ${Object.entries(list.pin.branches_off_at_rest.places).map(([b, k]) => `${b} ${nf(k)}`).join(", ")}`);
}
if (!list) { console.log(`\n${bad} check(s) FAILED`); process.exit(1); }
const { pin } = list;

// the zones as they stand: every word that carries a hold, by zone, with its work and verse unit
const served = servedWorks(ZONES);
const zones = new Map();
const zoneOf = (f) => { if (!zones.has(f)) zones.set(f, gz(join(ZONES, f))); return zones.get(f); };
const carried = new Map();   // the word object -> { file, work, unit, key }
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".commentary.bin") && !x.startsWith("fixture-")).sort()) {
  const z = zoneOf(f);
  for (const u of Object.values(z.units || {})) for (const e of u.section || []) for (const w of e.words || []) if (w && w[PLACE_HOLD_FIELD] !== undefined) carried.set(w, { file: f, work: ((z.works || [])[e.work ?? 0] || {}).id, unit: e.unit, key: w.k });
}
const groups = heldGroups(list);
const placed = new Map();   // the word object -> the rows the list holds there

// ---- H2 ----------------------------------------------------------------------------------------------------------------
{
  const faults = [];
  let laid = 0, away = 0, missing = 0;
  const notServed = pin.works_not_served || {};
  const notFound = new Map((pin.not_found || []).map((x) => [[x.work, x.unit, x.key].join(SEP), x]));
  for (const [w, x] of Object.entries(notServed)) {
    if (served.has(w)) faults.push(`the pin names ${w} as not served, and data/zones/${served.get(w).file} serves it`);
    if (!x || typeof x.why !== "string" || !x.why.trim()) faults.push(`the pin names ${w} as not served and does not say why`);
  }
  for (const g of groups.values()) {
    const where = `${g.work} ${g.unit} (${[...g.rows.values()].map((r) => `${r.m} «${r.route}»`).join(", ")})`;
    const nRows = [...g.rows.values()].reduce((a, r) => a + r.held.length, 0);
    const s = served.get(g.work);
    if (!s) { if (notServed[g.work]) away += nRows; else faults.push(`${where}: no zone serves the work, and the pin does not name it as not served`); continue; }
    if (s.kind !== "commentary") { faults.push(`${where}: the work is served as a book (${s.file}), and the place is not held there`); continue; }
    const { hits } = wordsOfKeyIn(zoneOf(s.file), g.work, g.unit, g.key);
    const nf_ = notFound.get([g.work, g.unit, g.key].join(SEP));
    if (!hits.length) { if (nf_ && typeof nf_.why === "string" && nf_.why.trim()) missing += nRows; else faults.push(`${where}: its verse on ${s.file} does not carry the key, and the pin does not name the place as not found`); continue; }
    if (nf_) faults.push(`${where}: the pin names the place as not found, and its verse carries the key`);
    const m = matchHeld(g, hits);
    if (m.fault) { faults.push(`${where}: ${m.fault}`); continue; }
    for (const [j, rows] of m.at) {
      const w = hits[j].word, want = placeHoldOf(rows, null).r;
      placed.set(w, rows);
      const ph = w[PLACE_HOLD_FIELD];
      if (!ph || !same(ph.r, want)) { faults.push(`${where}: word ${hits[j].i} of the verse on ${s.file} carries ${JSON.stringify(ph ? ph.r : null)}, and the list holds ${JSON.stringify(want)} there`); continue; }
      laid += rows.length;
    }
  }
  check("H2  every place the list holds at rest is held on our zones, its word carrying the row with the lane's class; or its work is named not served, with why, and no zone serves it; or it is named not found, with why, and its verse does not carry the key", faults.length === 0 && laid + away + missing === list.held.length,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(list.held.length)} held at rest: ${nf(laid)} held on ${new Set([...placed.keys()].map((w) => carried.get(w) && carried.get(w).file)).size} commentary zones · ${nf(away)} in ${Object.keys(notServed).length} works no zone serves (${Object.entries(notServed).map(([w, x]) => `${w.split("/").pop()} ${x.places_held}`).join(", ")}) · ${nf(missing)} named not found`);
}

// ---- H3 ----------------------------------------------------------------------------------------------------------------
{
  const faults = [];
  for (const [w, at] of carried) if (!placed.has(w)) faults.push(`${at.file} ${at.unit}: a word carries a hold (${JSON.stringify(w[PLACE_HOLD_FIELD].r)}) at no place the list holds`);
  // a place the list says stands holds none of its row: its verse's words of that key carry no hold of that row
  let stands = 0, branchOnZones = {};
  const standing = list.places.filter((p) => p.at_rest !== "held");
  const heldIds = new Set(list.held.map((p) => [p.work, p.unit, p.key, p.m, p.route].join(SEP)));
  for (const p of standing) {
    const s = served.get(p.work);
    if (!s || s.kind !== "commentary") continue;
    const { hits } = wordsOfKeyIn(zoneOf(s.file), p.work, p.unit, p.key);
    if (!hits.length) continue;
    stands += 1;
    for (const b of p.branches) branchOnZones[b] = (branchOnZones[b] || 0) + 1;
    // where the same row is held at another place of the verse, H2 matched it; else no word of the verse holds the row
    if (heldIds.has([p.work, p.unit, p.key, p.m, p.route].join(SEP))) continue;
    for (const h of hits) { const ph = h.word[PLACE_HOLD_FIELD]; if (ph && (ph.r || []).some((r) => r[0] === p.m && r[1] === p.route)) faults.push(`${s.file} ${p.unit}: the list says «${p.route}» stands here (${p.class}${p.branches.length ? `, ${p.branches.join(" ")} off at rest` : ""}), and its word holds it`); }
  }
  // no book zone carries a hold
  let bookHolds = 0;
  for (const b of zonesServed(ZONES)) {
    const z = gz(join(ZONES, `${b}.bin`));
    for (const words of wordListsOf(z)) for (const w of words) if (w && w[PLACE_HOLD_FIELD] !== undefined) bookHolds += 1;
  }
  if (bookHolds) faults.push(`${bookHolds} word(s) of the book zones carry a hold`);
  check("H3  nothing else is held: every word that carries a hold is a held place of the list with exactly its rows; a place the list says stands holds no row, so the branches off at rest hold nothing; no book zone carries a hold", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(carried.size)} words carry a hold, each a held place · ${nf(stands)} places the list says stand are on our zones, none held (of them labelled off at rest: ${Object.entries(branchOnZones).map(([b, k]) => `${b} ${nf(k)}`).join(", ") || "none"}) · no book zone carries a hold`);
}

// ---- H4 ----------------------------------------------------------------------------------------------------------------
{
  const faults = [];
  const kinds = readKinds(join(STORE, ".."));
  const stores = new Map();
  let moved = 0, bare = 0;
  for (const [w, at] of carried) {
    const z = zoneOf(at.file);
    if (!stores.has(at.file)) { const r = restsOffIn(kinds.rec, z); stores.set(at.file, openRouteStore(STORE, { atRest: r, signLast: r })); }
    const store = stores.get(at.file), rows = placed.get(w);
    if (!rows) continue;
    const unheld = store.glossFor(at.key).text, want = lineUnderHold(store, at.key, rows);
    if ((z.gloss || {})[at.key] !== (unheld ?? undefined)) faults.push(`${at.file} ${at.unit}: the zone reads ${JSON.stringify((z.gloss || {})[at.key] ?? null)} under the key and the store ${JSON.stringify(unheld)}`);
    if (w[PLACE_HOLD_FIELD].g !== want) faults.push(`${at.file} ${at.unit}: the word's line under the hold is ${JSON.stringify(w[PLACE_HOLD_FIELD].g)}, and the store's pool less the rows held there leads with ${JSON.stringify(want)}`);
    if (want !== unheld) moved += 1;
    if (want === null) bare += 1;
  }
  check("H4  the line each held word carries is the first reading of its key's pool less the rows held there (none where nothing is left), and the zone's own line for the key is the store's", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(carried.size)} lines · ${nf(moved)} read otherwise than their key's line (${nf(bare)} bare), the rest read their key's line`);
}

// ---- H5 ----------------------------------------------------------------------------------------------------------------
{
  const faults = [];
  let with_ = 0;
  for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".commentary.bin") && !x.startsWith("fixture-")).sort()) {
    const z = zoneOf(f), rec = (z.emitted_from || {}).held_places, pb = (z.emitted_from || {}).post_build || {};
    const here = [...carried.values()].filter((x) => x.file === f).length;
    if (!here) { if (rec) faults.push(`${f} carries no hold and a record of them`); continue; }
    with_ += 1;
    if (!rec || rec.rule_id !== PLACE_HOLD_RULE_ID || rec.pin !== `${HELD_PLACES_HOME}/PIN.json` || !rec.list || rec.list.sha256 !== pin.places.sha256 || !Array.isArray(rec.here) || rec.here.length !== here || (rec.counts || {}).places_held !== here) faults.push(`${f}: its record of the holds is not the rule's, the pin's list and its ${here} held word(s)`);
    if (!String((pb.by_field || {})["units[].section[].words[].ph"] || "").includes(HELD_PLACES_TOOL)) faults.push(`${f}: its post-build record does not name ${HELD_PLACES_TOOL} for the field`);
  }
  check("H5  a zone that carries holds says so, by the rule, the pin and the list's bytes, one entry for each held word, and its post-build record names the tool; a zone with none says nothing of it", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${with_} zones carry holds and say so`);
}

console.log(bad ? `\n${bad} check(s) FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
