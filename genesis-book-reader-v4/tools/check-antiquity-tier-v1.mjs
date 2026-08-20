#!/usr/bin/env node
// GUARDS: zone-gloss-rule-v3-sense-level-antiquity-1940-lastuary
//
// The year in the gloss rule's name decides nothing, and this proves it every
// run.
//
// `zone-gloss-rule-v3-sense-level-antiquity-1940-lastuary` puts a number in its
// own name and thereby advertises 1940 as the thing that chooses which reading
// a reader meets first, across a corpus of 3.7 billion occurrences. It was
// chosen by this project. Nothing attests it. And it is inert: the comparison
// after it already sorts ascending by year, with an unyeared sense carrying
// Infinity, so the tier can only ever agree with what follows it.
//
// A choice that decides nothing is not a fault. A choice that decides nothing
// while looking like it decides everything is, because the next person to read
// the rule will believe a number is doing work that no number is doing. So the
// inertness is asserted rather than remembered: move the cutoff, remove it, and
// the printed reading of every form must be the same one.
//
// If this ever fails, the tier has started deciding something — which is a
// finding about the catalog, and a number somebody must own.
//
// Run: node tools/check-antiquity-tier-v1.mjs [zone]

import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore } from "./gloss-store-v1.mjs";

let bad = 0;
const check = (name, ok, detail = "") => {
  if (!ok) bad += 1;
  console.log(`${ok ? "  ok  " : "FAIL  "}${name}${detail ? "  ·  " + detail : ""}`);
};

const ZONE = process.argv[2] || "data/zones/genesis.bin";
// A check that cannot reach its inputs has not passed. It says so and stands
// aside, so an empty run cannot be read as a clean one.
if (!existsSync(ZONE) || !existsSync("data/route-store/index.json")) {
  console.log(`SKIPPED \u2014 the zone or the route store is not here (${ZONE}, data/route-store)`);
  process.exit(3);
}
const store = openRouteStore("data/route-store");
const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));

const keys = new Set();
for (const s of zone.sections || [])
  for (const w of s.words || []) {
    if (w.w) w.w.forEach((r) => { if (r.k) keys.add(r.k); });
    else if (w.k) keys.add(w.k);
  }

// The pool, rebuilt with the cutoff as a parameter. Everything else is the
// rule's own machinery, copied so the comparison is against what it does.
const senseSplit = (t) => {
  const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) {
    const c = t[i];
    if (c === "(") d += 1;
    else if (c === ")") { if (d > 0) d -= 1; }
    else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; }
  }
  out.push(t.slice(start));
  if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
};
const leaderAt = (routes, cut) => {
  const groups = new Map();
  for (const row of routes || []) {
    const [rank, text, , mId, year] = row;
    if (!store.index.m_sources[mId]) continue;
    const parsed = Number.parseInt(year, 10);
    const yr = Number.isInteger(parsed) ? parsed : Infinity;
    for (const sense of senseSplit(String(text || ""))) {
      const k = sense.toLowerCase(); const g = groups.get(k);
      if (!g) groups.set(k, { text: sense, year: yr, ledger: Number(rank) });
      else { g.year = Math.min(g.year, yr); g.ledger = Math.min(g.ledger, Number(rank)); }
    }
  }
  const tier = (r) => (cut === null ? 0 : (Number.isFinite(r.year) && r.year <= cut ? 0 : 1));
  const out = [...groups.values()].sort((a, b) => tier(a) - tier(b) || a.year - b.year || a.ledger - b.ledger);
  return out.length ? out[0].text : null;
};

console.log(`— the year in the rule's name decides nothing · ${ZONE} —`);
const CUTS = [1700, 1900, 1950, 2100, null];
const moved = Object.fromEntries(CUTS.map((c) => [String(c), 0]));
let asked = 0;
for (const k of keys) {
  const routes = store.routesFor(k);
  if (!routes) continue;
  asked += 1;
  const base = leaderAt(routes, 1940);
  for (const c of CUTS) if (leaderAt(routes, c) !== base) moved[String(c)] += 1;
}
check("  there are forms to ask about", asked > 100, `${asked} distinct keys the store answers for`);
for (const c of CUTS)
  check(`  moving the cutoff to ${c === null ? "nothing at all" : c} moves no printed reading`,
    moved[String(c)] === 0, `${moved[String(c)]} of ${asked} would change`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
