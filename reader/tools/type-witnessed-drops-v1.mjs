#!/usr/bin/env node
// GUARDS: witnessed-order-bake-rule-v1-three-columns-as-shipped-each-reading-with-its-own-credit
//
// THE DROPS A PROJECTION LOST, TYPED BACK FROM THE ZONE'S OWN HISTORY. On
// 2026-10-17 regloss-zone dropped from the witnessed columns every reading
// whose lane credit named a struck source; it counted each drop only in
// gloss_m_orders_layer, which the next projection replaces whole, so by
// 2026-10-23 the count was gone and the witnessed receipt's "baked" stood
// above the column. regloss now types each drop on the witnessed receipt
// (struck_credit_drops); this tool types the drops already made by re-running
// the same rule over the zone as it stood BEFORE the strike (a git revision)
// against the store on disk, keeping only a key absent from the column now.
// No reading moves: the columns are read, never written.
//
// Run: node tools/type-witnessed-drops-v1.mjs --zone data/zones/<book>.bin --before <git-rev> --dropped-on YYYY-MM-DD --stamp YYYY-MM-DD
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { gzipSync, gunzipSync } from "node:zlib";
import { basename } from "node:path";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { glossMFor } from "./gloss-m-v1.mjs";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const ZONE = arg("--zone"), BEFORE = arg("--before"), DROPPED_ON = arg("--dropped-on"), STAMP = arg("--stamp");
if (!ZONE || !BEFORE || !DROPPED_ON || !STAMP) { console.error("usage: --zone <book.bin> --before <git-rev> --dropped-on YYYY-MM-DD --stamp YYYY-MM-DD"); process.exit(2); }
const store = openRouteStore(arg("--store", "data/route-store"));
const book = basename(ZONE, ".bin");
const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));
const rec = zone.emitted_from && zone.emitted_from.witnessed_order;
if (!rec) { console.log(`${book}: no witnessed order`); process.exit(0); }
const was = JSON.parse(gunzipSync(execFileSync("git", ["show", `${BEFORE}:reader/${ZONE}`], { maxBuffer: 1 << 28 })).toString("utf8"));
let typed = 0;
for (const o of Object.keys(rec.columns)) {
  const col = zone.gloss_orders[o] || {}, wasCol = (was.gloss_orders || {})[o] || {}, wasM = (was.gloss_m_orders || {})[o] || {};
  const have = new Set((rec.columns[o].struck_credit_drops || []).map((d) => d.key));
  for (const [k, m] of Object.entries(wasM)) {
    if (k in col || have.has(k)) continue;
    const ids = typeof m === "string" ? [m] : (m && Array.isArray(m.by) ? m.by : []);
    const altIds = m && m.alt && Array.isArray(m.alt.by) ? m.alt.by : [];
    if (![...ids, ...altIds].some((id) => !store.index.m_sources[id])) continue;              // its credit is not struck
    if (wasCol[k] !== undefined && glossMFor(store, { [k]: wasCol[k] }).gloss_m[k]) continue;  // the store re-credits it: not a drop
    (rec.columns[o].struck_credit_drops = rec.columns[o].struck_credit_drops || []).push({ key: k, by: [...ids, ...altIds], on: DROPPED_ON, why: "source-strike-rule-v1: the credited source is no longer in the store and no route the store holds stands on the reading", typed_on: STAMP, typed_from: BEFORE, typed_by: "tools/type-witnessed-drops-v1.mjs" });
    typed += 1;
  }
}
if (!typed) { console.log(`${book}: nothing to type`); process.exit(0); }
{ // the post_build exemption names this write
  const pb = zone.emitted_from.post_build, me = "tools/type-witnessed-drops-v1.mjs", f = "emitted_from.witnessed_order";
  pb.by = pb.by.includes(me) ? pb.by : `${pb.by} + ${me}`;
  pb.by_field[f] = (pb.by_field[f] || "").includes(me) ? pb.by_field[f] : `${pb.by_field[f] ? `${pb.by_field[f]} + ` : ""}${me}`;
  if (Array.isArray(pb.wrote) && !pb.wrote.includes(f)) pb.wrote.push(f);
  pb.on = STAMP;
}
writeFileSync(ZONE, gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 }));
console.log(`${book}: ${typed} drop${typed === 1 ? "" : "s"} typed on the witnessed receipt`);
