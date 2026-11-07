// the printed-form grouping (zone-gloss-rule-v6), measured: the old reader's pool against the new, over every served zone's keys
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore as openOld } from "<scratchpad>/old/reader/tools/gloss-store-v1.mjs";
import { openRouteStore as openNew, readingKey } from "<scratchpad>/pt/reader/tools/gloss-store-v1.mjs";
const S = "<scratchpad>";
const STORE = `${S}/pt/reader/data/route-store`;
const A = openOld(STORE), B = openNew(STORE);
const ZD = `${S}/pt/reader/data/zones`;
const zones = readdirSync(ZD).filter((f) => f.endsWith(".bin") && !f.includes(".lattice"));
const C = {}; const inc = (k, n = 1) => { C[k] = (C[k] || 0) + n; };
const ex = { merged: [], lead_bytes: [], lead_printed: [], by: [] };
const seenKeys = new Set(); let keysDistinct = 0;
const byBook = {};
for (const f of zones.sort()) {
  const z = JSON.parse(gunzipSync(readFileSync(`${ZD}/${f}`)).toString("utf8"));
  const keys = new Set();
  for (const sec of z.sections || []) for (const w of sec.words || []) if (!w.mark && w.k) keys.add(w.k);
  if (!keys.size && z.gloss) for (const k of Object.keys(z.gloss)) keys.add(k);
  const b = { keys: 0, pills_old: 0, pills_new: 0, keys_with_a_merge: 0, lead_bytes_moved: 0, lead_printed_moved: 0, lead_by_changed: 0 };
  for (const k of keys) {
    const routes = B.routesFor(k); if (!routes) continue;
    b.keys += 1;
    const first = !seenKeys.has(k); if (first) { seenKeys.add(k); keysDistinct += 1; }
    const pa = A.readingPool(routes, "oldest"), pb = B.readingPool(routes, "oldest");
    b.pills_old += pa.length; b.pills_new += pb.length;
    if (pb.length < pa.length) {
      b.keys_with_a_merge += 1; if (first) inc("keys_with_a_merge_distinct");
      if (first) inc("pills_merged_distinct", pa.length - pb.length);
      if (ex.merged.length < 40 && first) {
        const groups = new Map();
        for (const g of pa) { const d = readingKey(g.text); if (!groups.has(d)) groups.set(d, []); groups.get(d).push(`${g.text} [${g.by.join(" ")}]`); }
        ex.merged.push({ book: f, key: k, joined: [...groups.values()].filter((x) => x.length > 1).slice(0, 3) });
      }
    }
    const la = pa[0], lb = pb[0];
    if (la && lb) {
      if (la.text !== lb.text) { b.lead_bytes_moved += 1; if (first) inc("lead_bytes_moved_distinct"); if (ex.lead_bytes.length < 40 && first) ex.lead_bytes.push({ book: f, key: k, from: la.text, to: lb.text, from_by: la.by, to_by: lb.by, from_y: la.year, to_y: lb.year }); }
      if (readingKey(la.text) !== readingKey(lb.text)) { b.lead_printed_moved += 1; if (first) inc("lead_printed_moved_distinct"); if (ex.lead_printed.length < 60 && first) ex.lead_printed.push({ book: f, key: k, from: la.text, to: lb.text, from_by: la.by, to_by: lb.by, from_y: la.year, to_y: lb.year, from_rank: la.ledger, to_rank: lb.ledger }); }
      if (la.by.join() !== lb.by.join()) { b.lead_by_changed += 1; if (first) inc("lead_by_changed_distinct"); if (ex.by.length < 30 && first) ex.by.push({ book: f, key: k, text: lb.text, from_by: la.by, to_by: lb.by }); }
    }
  }
  byBook[f] = b;
  for (const [k, v] of Object.entries(b)) inc(`book_and_key:${k}`, v);
  console.error(f, JSON.stringify(b));
}
C.keys_distinct = keysDistinct;
const out = { rule: "zone-gloss-rule-v6: the pool keyed by the printed form (spanJoin, one closing stop dropped), case folded; measured old reader vs new over the served zones' keys, store 3d8c4ef86c01", totals: C, examples: ex, by_book: byBook };
writeFileSync(`${S}/v16/group/measure-v1.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(C, null, 1));
