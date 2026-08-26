#!/usr/bin/env node
// GUARDS: zone-gloss-rule-v5-the-catalogs-own-order-leads
//
// The source year decides nothing, and this proves it every run.
//
// Under rule v4 this check proved a weaker claim: the 1940 tier in the rule's
// own name was inert, because the year-ascending sort after it always agreed
// with it. The year itself still decided everything — Strong's 1890 root
// glosses led wherever they stood, which is how Genesis 1:1 would have
// printed "cut down + judges". Rule v5 removed the year from the comparison:
// the catalog's own ledger rank orders the pool, and readings tied on rank
// stand as the catalog lists them.
//
// So the claim this file asserts is now absolute. Rewrite every source year —
// to nothing, to one constant, to a different constant per row — and the
// printed reading of every form must be the same one. If this ever fails, a
// year has crept back into the comparison, and somebody must own it.
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

// The zone is whichever work is here, not a work that was here in July. A
// default naming a file is the same claim about the future as a default
// naming a URL, and this one went on skipping politely for a work that had
// been withdrawn — a skip nobody reads is indistinguishable from a pass.
const { zonesOnDisk } = await import("./zones-on-disk-v1.mjs");
const ZONE = process.argv[2] && !/^https?:/.test(process.argv[2])
  ? process.argv[2]
  : (() => {
      const u = process.argv[2] || "";
      const slug = (u.match(/[?&]b=([a-z0-9-]+)/) || [])[1] || zonesOnDisk()[0];
      return slug ? `data/zones/${slug}.bin` : "";
    })();
// A check that cannot reach its inputs has not passed. It says so and stands
// aside, so an empty run cannot be read as a clean one.
if (!existsSync(ZONE) || !existsSync("data/route-store/index.json")) {
  console.log(`SKIPPED — the zone or the route store is not here (${ZONE}, data/route-store)`);
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

// The leader, computed through the rule's own machinery — readingPool is the
// function every builder calls, not a copy of it — with the years rewritten
// on the way in. If the comparison consults a year in any branch, one of
// these rewrites finds it.
const YEAR_AT = 4; // route row shape: [rank, reading, routeText, mId, year]
const leaderUnder = (routes, mutate) => {
  const rows = routes.map((row, i) => {
    const out = row.slice();
    out[YEAR_AT] = mutate(out[YEAR_AT], i);
    return out;
  });
  const pool = store.readingPool(rows);
  return pool.length ? pool[0].text : null;
};

console.log(`— the source year decides nothing · ${ZONE} —`);
const MUTATIONS = [
  ["every year removed", () => ""],
  ["every year 1500", () => "1500"],
  ["every year 3000", () => "3000"],
  ["a different year per row", (y, i) => String(1800 + (i * 37) % 300)],
];
const moved = Object.fromEntries(MUTATIONS.map(([n]) => [n, 0]));
let asked = 0;
for (const k of keys) {
  const routes = store.routesFor(k);
  if (!routes) continue;
  asked += 1;
  const base = leaderUnder(routes, (y) => y);
  for (const [name, mutate] of MUTATIONS)
    if (leaderUnder(routes, mutate) !== base) moved[name] += 1;
}
check("  there are forms to ask about", asked > 100, `${asked} distinct keys the store answers for`);
for (const [name] of MUTATIONS)
  check(`  with ${name}, no printed reading moves`, moved[name] === 0,
    `${moved[name]} of ${asked} would change`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
