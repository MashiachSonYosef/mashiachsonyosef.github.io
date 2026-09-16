#!/usr/bin/env node
// GUARDS: source-switch-rule-v1-a-reading-remembers-who-carried-it
//
// A READING HAS TO REMEMBER WHO CARRIED IT.
//
// The pool that chooses the word under a form merges every witness of the same
// reading into one entry, and it does that by Math.min: the oldest year any
// witness gives it, the best rank any witness gives it, BIBLICAL if any
// witness is biblical. For sorting that is right. For identity it is a
// shredder, and until 2026-09-15 identity went through it — after readingPool
// a reading knew when it was first attested and did not know by whom.
//
// Two things fell out of that, and this check exists because of both.
//
// A per-source switch could not be built at all. "Turn Jastrow off" has to
// remove the readings Jastrow carries, and nothing recorded that Jastrow
// carried them; a page filtering the pool afterward would be a page deciding
// what a source said, which is the one thing this project does not do.
//
// And it produced a fabricated finding. `ledger` holds Number(rank) — a
// semantic rank, not an id — and it was read here as though "M" + ledger named
// the source. That published a confident sentence about where 62.8% of the
// English on this site comes from, and the sentence was invented by a field
// that looked like an identity and was not one. The retraction is in the
// record; this is the part that makes the retraction hold. C6 below asserts
// that the rank STILL misattributes, because a guard against a mistake nobody
// can make any more guards nothing.
//
// What is asserted:
//
//   C1  there is a shelf to ask about, and enough of it to mean something
//   C2  every reading this site has already shipped still computes identically
//       — the switch is additive to the machinery and invisible to the page
//   C3  every pooled reading names its carriers, as a sorted array of m ids
//       the index knows, never a Set and never empty
//   C4  `sole` is exactly one carrier, not a hint of one
//   C5  the carriers survive the merge: re-derived from the raw route rows,
//       without the merge, the carrier set of every reading is what `by` says
//   C6  the rank is not an id, and reading it as one still gets it wrong
//   C7  the switch subtracts and never invents — no reading appears under an
//       omit that the full pool did not already hold, no surviving reading is
//       carried by an omitted id, and what DOES move when a carrier goes is
//       counted rather than swallowed
//   C8  a pool the switch emptied is named apart from a form the catalog never
//       carried — and the switch is not blamed for silence it did not cause
//   C9  an empty switch is the unswitched pool, entry for entry
//
// Run: node tools/check-carrier-survives-v1.mjs

import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore, SWITCH_RULE_ID } from "./gloss-store-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";

let bad = 0;
const check = (name, ok, detail = "") => {
  if (!ok) bad += 1;
  console.log(`${ok ? "  ok  " : "FAIL  "}${name}${detail ? "  ·  " + detail : ""}`);
};

const SERVED = existsSync("data/zones") ? zonesServed() : [];
if (!SERVED.length || !existsSync("data/route-store/index.json")) {
  console.log("SKIPPED — no served zone or no route store here (data/zones, data/route-store)");
  process.exit(3);
}

const store = openRouteStore("data/route-store");
console.log(`— ${SWITCH_RULE_ID} · ${SERVED.length} served work(s) —`);

// ---- C2 · the page does not move ----------------------------------------
//
// Carrier tracking added fields to pool entries and a parameter to two
// functions. Neither may reach the reader. tableFor stores only the entry's
// text, so the claim is structural — but structural is what people say about
// changes that turn out to have moved something, so it is measured: every
// gloss in every shipped zone, recomputed, compared to the byte on disk.
const shipped = [];
for (const z of SERVED) {
  const p = `data/zones/${z}.bin`;
  if (!existsSync(p)) continue;
  const zone = JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
  for (const [k, v] of Object.entries(zone.gloss || {})) shipped.push([z, k, v]);
}
let moved = 0, firstMove = "";
for (const [z, k, v] of shipped) {
  const g = store.glossFor(k);
  if (g.text !== v) { moved += 1; if (!firstMove) firstMove = `${z} ${k}: ${JSON.stringify(v)} -> ${JSON.stringify(g.text)}`; }
}
check("C1  there is a shelf to ask about", shipped.length > 10000, `${shipped.length.toLocaleString()} shipped readings`);
check("C2  every shipped reading still computes identically", moved === 0,
  moved ? `${moved.toLocaleString()} moved · first: ${firstMove}` : `${shipped.length.toLocaleString()} of ${shipped.length.toLocaleString()} unchanged`);

// ---- the sample the carrier assertions stand on --------------------------
//
// Spread rather than sliced: the first N keys of a sorted list are the first
// N keys of one shard, and a carrier fault that lives in one provider's rows
// would sit outside a window taken off the front.
const allKeys = [...new Set(shipped.map(([, k]) => k))].sort();
const WANT = 4000;
const step = Math.max(1, Math.floor(allKeys.length / WANT));
const sample = allKeys.filter((_, i) => i % step === 0);

// ---- C3–C5 · who carried it ---------------------------------------------
//
// The re-derivation deliberately reuses the store's own packSplit and
// readingSplit — the division rule is not what is under test here and a second
// copy of it would be the fault the store's own comment names. What it does
// NOT reuse is the merge, which is the thing that was losing identity: the
// carriers are accumulated per reading straight off the route rows.
const carriersOf = (routes, omit = null) => {
  const m = new Map();
  for (const row of routes || []) {
    const [, routeText, , mId] = row;
    if (!store.index.m_sources[mId]) continue;
    if (omit && omit.has(mId)) continue;
    for (const sense of store.packSplit(routeText)) {
      const r = store.readingSplit(sense);
      if (r.damaged) continue;
      for (const reading of r.readings) {
        const key = reading.toLowerCase();
        if (!m.has(key)) m.set(key, new Set());
        m.get(key).add(mId);
      }
    }
  }
  return m;
};

const known = new Set(Object.keys(store.index.m_sources));
let entries = 0, shapeBad = 0, shapeSay = "", soleBad = 0, soleSay = "", carrierBad = 0, carrierSay = "";
let multi = 0, rankWrong = 0, rankAsked = 0;
for (const k of sample) {
  const routes = store.routesFor(k);
  if (!routes) continue;
  const pool = store.readingPool(routes);
  const truth = carriersOf(routes);
  for (const e of pool) {
    entries += 1;
    const okShape = Array.isArray(e.by) && e.by.length > 0
      && e.by.every((id) => known.has(id))
      && new Set(e.by).size === e.by.length
      && JSON.stringify([...e.by].sort()) === JSON.stringify(e.by);
    if (!okShape) { shapeBad += 1; if (!shapeSay) shapeSay = `${k}: ${JSON.stringify(e.by)}`; }
    if (e.sole !== (e.by.length === 1)) {
      soleBad += 1; if (!soleSay) soleSay = `${k}: by=${JSON.stringify(e.by)} sole=${e.sole}`;
    }
    if (e.by.length > 1) multi += 1;
    const want = [...(truth.get(e.text.toLowerCase()) || new Set())].sort();
    if (JSON.stringify(want) !== JSON.stringify(e.by)) {
      carrierBad += 1; if (!carrierSay) carrierSay = `${k} ${JSON.stringify(e.text)}: pool ${JSON.stringify(e.by)} vs routes ${JSON.stringify(want)}`;
    }
    // C6 · the rank read as an id. Only counted where it produces a plausible
    // id at all, because "M4093 is not a source" is a weaker statement than
    // "M4 is a source and is not the one that carried this".
    const asId = `M${e.ledger}`;
    if (known.has(asId)) { rankAsked += 1; if (!e.by.includes(asId)) rankWrong += 1; }
  }
}

check("C3  every pooled reading names its carriers, sorted and known to the index",
  entries > 0 && shapeBad === 0, shapeBad ? `${shapeBad} of ${entries} malformed · ${shapeSay}` : `${entries.toLocaleString()} pool entries over ${sample.length.toLocaleString()} keys`);
check("C4  `sole` is exactly one carrier", soleBad === 0,
  soleBad ? `${soleBad} disagree · ${soleSay}` : `${multi.toLocaleString()} of ${entries.toLocaleString()} entries have more than one carrier`);
check("C5  the carriers survive the merge, re-derived from the route rows", carrierBad === 0,
  carrierBad ? `${carrierBad} of ${entries} wrong · ${carrierSay}` : `${entries.toLocaleString()} entries agree with their routes`);
check("C6  the rank is not an id, and reading it as one still gets it wrong",
  rankAsked > 0 && rankWrong > 0,
  rankAsked ? `${rankWrong.toLocaleString()} of ${rankAsked.toLocaleString()} entries whose rank spells a real source id name the wrong one`
    : "no rank in the sample spells a source id — the confusion this guards is no longer reachable, and the guard should be re-stated");

// ---- C6, C8, C9 · what the switch does ----------------------------------
let invented = 0, inventedSay = "", survivorBad = 0, survivorSay = "";
let emptied = 0, emptiedReason = 0, emptiedSay = "";
let nullDiff = 0, nullSay = "";
let switchedKeys = 0, caseMoved = 0, caseSay = "";
for (const k of sample) {
  const routes = store.routesFor(k);
  if (!routes) continue;
  const full = store.readingPool(routes);
  if (!full.length) continue;
  switchedKeys += 1;

  // C9 · an empty switch is the unswitched pool, entry for entry.
  for (const omit of [null, new Set()]) {
    const same = store.readingPool(routes, "oldest", null, omit);
    if (JSON.stringify(same) !== JSON.stringify(full)) {
      nullDiff += 1; if (!nullSay) nullSay = `${k} under ${omit ? "an empty set" : "null"}`;
    }
  }

  // C7 · turn the leading reading's first carrier off.
  //
  // "The same reading" is the pool's own identity, which is the lowercased
  // text — that is what the merge dedupes on, so it is what a claim about
  // inventing has to be made in. Comparing displayed text instead reports a
  // handover as an invention: on אכד the pool holds "Akkad" from M5 and
  // "akkad" from M6 as ONE entry whose face is whichever route was read
  // first, so switching M5 off leaves M6's lowercase face standing. The
  // reading did not change. Its capital did, and it did so because the source
  // that supplied the capital is the one the reader switched off. C7b counts
  // that, because a reader who turns a source off and sees a word change
  // shape is owed an account of why.
  const ident = new Set(full.map((e) => e.text.toLowerCase()));
  const faces = new Map(full.map((e) => [e.text.toLowerCase(), e.text]));
  const off = new Set([full[0].by[0]]);
  const after = store.readingPool(routes, "oldest", null, off);
  for (const e of after) {
    const id = e.text.toLowerCase();
    if (!ident.has(id)) { invented += 1; if (!inventedSay) inventedSay = `${k}: ${JSON.stringify(e.text)} appears only under the switch`; }
    else if (faces.get(id) !== e.text) {
      caseMoved += 1;
      if (!caseSay) caseSay = `${k}: ${JSON.stringify(faces.get(id))} -> ${JSON.stringify(e.text)} with ${[...off]} off`;
    }
    if (e.by.some((x) => off.has(x))) { survivorBad += 1; if (!survivorSay) survivorSay = `${k}: ${JSON.stringify(e.text)} still credits ${[...off]}`; }
  }

  // C8 · turn every carrier off, and the pool is gone — named as the reader's
  // own doing, not as the catalog's limit.
  const all = new Set(full.flatMap((e) => e.by));
  const dark = store.glossFor(k, "oldest", null, all);
  if (dark.text === null) {
    emptied += 1;
    if (dark.reason === "EVERY_CARRIER_SWITCHED_OFF") emptiedReason += 1;
    else if (!emptiedSay) emptiedSay = `${k}: ${dark.reason}`;
  } else if (!emptiedSay) emptiedSay = `${k}: still reads ${JSON.stringify(dark.text)} with every carrier off`;
}

// And the other side of C8, which is the one I got wrong first: a form the
// catalog never carried is the catalog's limit whether or not the reader has
// switched anything off. If the switch takes the blame for those too, then
// "readers switched this many words dark" counts words no reader touched —
// a number that would make a setting look more costly than it is, which is
// the same overstatement as a mark that covers every word.
//
// The forms are taken from the zones' own words, not from the gloss tables:
// a gloss table holds only the keys that GOT a reading, so asking it about
// silence is asking the survivors about the dead.
//
// The harshest switch there is — every source the index knows, off — taken
// from the index rather than typed, so it is still the harshest switch on a
// shelf that gains a source tomorrow.
const ALL_OFF = new Set(known);
const wordKeys = new Set();
for (const z of SERVED) {
  const p = `data/zones/${z}.bin`;
  if (!existsSync(p)) continue;
  const zone = JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
  for (const s of zone.sections || [])
    for (const w of s.words || []) {
      if (w.w) w.w.forEach((r) => { if (r.k) wordKeys.add(r.k); });
      else if (w.k) wordKeys.add(w.k);
    }
}
const silence = { NO_EXACT_ROUTE: [], NO_DISPLAYABLE_ROUTE: [] };
for (const k of wordKeys) {
  const g = store.glossFor(k);
  if (g.text === null && silence[g.reason]) silence[g.reason].push(k);
}
const keepsReason = (list) => {
  let blamed = 0, say = "";
  for (const k of list) {
    const g = store.glossFor(k, "oldest", null, ALL_OFF);
    if (g.reason === "EVERY_CARRIER_SWITCHED_OFF") { blamed += 1; if (!say) say = `${k}: ${g.reason}`; }
  }
  return { blamed, say };
};
const gap = keepsReason(silence.NO_EXACT_ROUTE);

check("C7a  the switch subtracts and never invents", invented === 0 && survivorBad === 0,
  invented || survivorBad ? `${invented} invented · ${survivorBad} still credited · ${inventedSay || survivorSay}`
    : `${switchedKeys.toLocaleString()} keys switched, no reading appeared that the full pool did not hold`);
// Not a fault and not hidden. A number that is zero today and would be a
// surprise tomorrow belongs on the page either way.
console.log(`  --  C7b  and when a carrier goes, the face it supplied goes with it  ·  ${caseMoved.toLocaleString()} of ${switchedKeys.toLocaleString()} keys change the CASE of a reading they keep${caseSay ? `  ·  e.g. ${caseSay}` : ""}`);
check("C8a  a pool the switch emptied says the switch emptied it",
  emptied > 0 && emptied === emptiedReason,
  emptied === emptiedReason ? `${emptied.toLocaleString()} keys go dark under a full switch, all named as the switch`
    : `${emptied - emptiedReason} of ${emptied} named otherwise · ${emptiedSay}`);
check("C8b  and the switch is not blamed for silence it did not cause",
  silence.NO_EXACT_ROUTE.length > 0 && gap.blamed === 0,
  silence.NO_EXACT_ROUTE.length
    ? (gap.blamed ? `${gap.blamed} of ${silence.NO_EXACT_ROUTE.length} blamed the switch · ${gap.say}`
      : `${silence.NO_EXACT_ROUTE.length.toLocaleString()} forms the catalog never carries keep their own reason under every source off`)
    : "no form on this shelf is outside the catalog — the check has nothing to stand on");
// The third silence — a form the catalog carries and no licence lets it print
// — has no case on this shelf. glossFor asks the unswitched pool before it
// blames the switch precisely so that silence keeps its own name when the case
// arrives, and a licence strike is exactly what would make it arrive. The
// number is printed rather than asserted, because a clause that only ever
// takes its empty branch is a clause that has stopped being read.
if (silence.NO_DISPLAYABLE_ROUTE.length) {
  const un = keepsReason(silence.NO_DISPLAYABLE_ROUTE);
  check("C8c  and an unlicensed form keeps the catalog's reason, not the reader's",
    un.blamed === 0, un.blamed ? `${un.blamed} of ${silence.NO_DISPLAYABLE_ROUTE.length} blamed the switch · ${un.say}`
      : `${silence.NO_DISPLAYABLE_ROUTE.length.toLocaleString()} unlicensed forms keep NO_DISPLAYABLE_ROUTE`);
} else {
  console.log(`  --  C8c  no form on this shelf has routes it may not print  ·  0 of ${wordKeys.size.toLocaleString()} zone word keys — the arm that tells the reader's silence from the catalog's has no case here today`);
}
check("C9  an empty switch is the unswitched pool, entry for entry", nullDiff === 0,
  nullDiff ? `${nullDiff} differ · ${nullSay}` : `${switchedKeys.toLocaleString()} keys identical under null and under an empty set`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
