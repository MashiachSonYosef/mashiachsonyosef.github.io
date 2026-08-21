#!/usr/bin/env node
// mark-inventory-rule-v1-closed-set-over-route-text
//
// Enumerates, for every provider present in the route store, every mark it uses
// in route text — where "mark" is any character that is not a letter, not a
// digit and not whitespace.
//
// This tool makes NO claim about what any mark means. It only establishes the
// closed set that a declaration must cover, so that a missing rule is
// distinguishable from a rule nobody has written yet.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const RULE_ID = "mark-inventory-rule-v1-closed-set-over-route-text";

const storeDir = process.argv[2];
const outPath = process.argv[3];
if (!storeDir || !outPath) {
  console.error("usage: mark-inventory-v1.mjs <route-store-dir> <out.json>");
  process.exit(2);
}

const index = JSON.parse(readFileSync(join(storeDir, "index.json"), "utf8"));
const shardDir = join(storeDir, "shards");
const shardFiles = readdirSync(shardDir).filter((f) => f.endsWith(".bin")).sort();

const isMark = (ch) => !/[\p{L}\p{N}\s]/u.test(ch);

// provider -> { routes, marks: Map(mark -> {n, examples:Set}) , region: {eq,slice,absent} }
const prov = new Map();
const bump = (p) => {
  let b = prov.get(p);
  if (!b) {
    b = { routes: 0, marks: new Map(), region: { whole: 0, slice: 0, absent: 0 } };
    prov.set(p, b);
  }
  return b;
};

let totalRoutes = 0;
let totalKeys = 0;

for (const f of shardFiles) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(shardDir, f))).toString("utf8"));
  for (const [, rows] of Object.entries(shard)) {
    totalKeys += 1;
    for (const row of rows) {
      const [, routeText, defText, source] = row;
      const R = String(routeText);
      const D = String(defText);
      const b = bump(source);
      b.routes += 1;
      totalRoutes += 1;

      const Rt = R.trim();
      const Dt = D.trim();
      if (Rt === Dt) b.region.whole += 1;
      else if (Dt.includes(Rt)) b.region.slice += 1;
      else b.region.absent += 1;

      const seen = new Set();
      for (const ch of R) {
        if (!isMark(ch)) continue;
        let m = b.marks.get(ch);
        if (!m) { m = { n: 0, rows: 0, examples: [] }; b.marks.set(ch, m); }
        m.n += 1;
        if (!seen.has(ch)) {
          seen.add(ch);
          m.rows += 1;
          if (m.examples.length < 3 && R.length <= 140) m.examples.push(R.replace(/\s+/g, " "));
        }
      }
    }
  }
}

if (totalRoutes !== index.counts.routes) {
  throw new Error(`ROUTE_COUNT_MISMATCH store=${index.counts.routes} walked=${totalRoutes}`);
}
if (totalKeys !== index.counts.keys) {
  throw new Error(`KEY_COUNT_MISMATCH store=${index.counts.keys} walked=${totalKeys}`);
}

const providers = [...prov.entries()]
  .map(([id, b]) => ({
    provider: id,
    label: (index.m_sources && index.m_sources[id] && index.m_sources[id].label) || null,
    routes: b.routes,
    route_region_in_definition: b.region,
    mark_count: b.marks.size,
    marks: [...b.marks.entries()]
      .sort((x, y) => y[1].rows - x[1].rows)
      .map(([mark, m]) => ({
        mark,
        codepoint: "U+" + mark.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
        occurrences: m.n,
        routes_carrying_it: m.rows,
        examples: m.examples,
      })),
  }))
  .sort((a, b) => b.routes - a.routes);

const slots = providers.reduce((a, p) => a + p.mark_count, 0);

const out = {
  schema_version: "MARK_INVENTORY_V1",
  rule_id: RULE_ID,
  emitted_from: {
    route_store_rule: index.rule_id,
    store_version: index.store_version,
    keys: totalKeys,
    routes: totalRoutes,
  },
  counts: {
    providers: providers.length,
    providers_with_no_marks: providers.filter((p) => p.mark_count === 0).length,
    declaration_slots: slots,
    slots_under_ten_routes: providers.reduce(
      (a, p) => a + p.marks.filter((m) => m.routes_carrying_it < 10).length, 0),
    distinct_marks_store_wide: new Set(providers.flatMap((p) => p.marks.map((m) => m.mark))).size,
  },
  providers,
};

writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(
  `${RULE_ID}\n` +
  `  providers            ${out.counts.providers}\n` +
  `  with no marks at all ${out.counts.providers_with_no_marks}\n` +
  `  declaration slots    ${out.counts.declaration_slots}\n` +
  `  slots under 10 rows  ${out.counts.slots_under_ten_routes}\n` +
  `  distinct marks       ${out.counts.distinct_marks_store_wide}\n` +
  `  routes walked        ${totalRoutes} over ${totalKeys} keys`
);
