// read-only (23 November 2026): every commentary-zone and Tikkunei Zohar place whose line or whose card at rest differs
// between main (<before>) and the sandbox after ship 18 (<after>). The line: a commentary word's is its zone's line for
// its key, or, where its word carries a hold, the line the hold gives; the Tikkunei Zohar's lines are compared as
// tables. The card at rest: it differs where the store's rows under the word's key differ, or where the word carries a
// hold. Merged with what the page drew at the held places (the probe's cards before and after). Writes the TSV.
// Usage: node what-moves-18.mjs <before reader> <after reader> <cards-before.json> <cards-after.json> <out.tsv>
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [B, A, CB, CA, OUT] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { openRouteStore } = await import(join(A, "tools", "gloss-store-v1.mjs"));
const sb = openRouteStore(join(B, "data", "route-store")), sa = openRouteStore(join(A, "data", "route-store"));
const J = (x) => JSON.stringify(x ?? null);
const rowsMoved = new Map();
const rowsDiffer = (k) => { if (!rowsMoved.has(k)) rowsMoved.set(k, J(sb.routesWhole(k)) !== J(sa.routesWhole(k))); return rowsMoved.get(k); };
const cards = new Map();
const cb = JSON.parse(readFileSync(CB, "utf8")), ca = JSON.parse(readFileSync(CA, "utf8"));
cb.forEach((x, i) => cards.set(`${x.unit}|${x.i}`, [x, ca[i]]));
const rows = [], tz = { keys_whose_rows_moved: 0, table_keys_moved: 0 };
const zones = readdirSync(join(A, "data", "zones")).filter((f) => f.endsWith(".commentary.bin") && !f.startsWith("fixture-")).sort();
for (const f of zones) {
  const zb = gz(join(B, "data", "zones", f)), za = gz(join(A, "data", "zones", f));
  for (const [uid, u] of Object.entries(za.units)) (u.section || []).forEach((e, ei) => {
    const eb = ((zb.units[uid] || {}).section || [])[ei] || { words: [] };
    (e.words || []).forEach((w, i) => {
      if (!w.k) return;
      const lb = (zb.gloss || {})[w.k] ?? null, la = w.ph ? w.ph.g : ((za.gloss || {})[w.k] ?? null);
      const moved = lb !== la, card = rowsDiffer(w.k) || !!w.ph;
      if (!moved && !card) return;
      const c = cards.get(`${e.unit}|${i}`) || [];
      const pb = c[0] ? c[0].pills : null, pa = c[1] ? c[1].pills : null;
      const kind = [moved ? (la === null ? "line goes bare" : lb === null ? "line gains a reading" : "line moves") : "line the same",
        w.ph ? (pb && pa ? (pb.filter((x) => !pa.includes(x)).length ? `card: ${pb.filter((x) => !pa.includes(x)).map((x) => `«${x}»`).join(", ")} no longer offered` : J(pb) !== J(pa) ? "card: the same readings, another order" : "card: the same readings") + "; its withheld line says the hold" : "card: the held row withheld") : "card: the key's rows moved"].join("; ");
      rows.push([f.replace(".commentary.bin", ""), e.unit, i, w.s, w.ph ? w.ph.r.map((r) => `${r[0]} ${r[1]} (${r[2]})`).join(", ") : "", lb ?? "", la ?? "", pb ? pb.join(" | ") : "", pa ? pa.join(" | ") : "", c[1] ? c[1].withheld_line : "", kind]);
    });
  });
}
// the Tikkunei Zohar: its table, and the keys whose rows moved
{
  const zb = gz(join(B, "data", "zones", "tikkunei-zohar.bin")), za = gz(join(A, "data", "zones", "tikkunei-zohar.bin"));
  const ks = new Set([...Object.keys(zb.gloss || {}), ...Object.keys(za.gloss || {})]);
  for (const k of ks) { if ((zb.gloss || {})[k] !== (za.gloss || {})[k]) tz.table_keys_moved += 1; if (rowsDiffer(k)) tz.keys_whose_rows_moved += 1; }
  let words = 0; for (const s of za.sections || []) for (const w of s.words || []) if (w.ph) words += 1;
  tz.words_with_a_hold = words;
}
const head = ["book", "unit", "word", "the word", "held there", "line on main", "line after", "card on main (pills)", "card after (pills)", "card after: withheld line", "what moves"];
writeFileSync(OUT, [head, ...rows].map((r) => r.join("\t")).join("\n") + "\n");
const byRow = {}, byKind = {};
for (const r of rows) { const k = r[4] || "(no hold)"; byRow[k.replace(/ \(.*/u, "")] = (byRow[k.replace(/ \(.*/u, "")] || 0) + 1; byKind[r[10]] = (byKind[r[10]] || 0) + 1; }
console.log(JSON.stringify({ places: rows.length, keys_whose_store_rows_moved: [...rowsMoved].filter(([, v]) => v).map(([k]) => k), by_row: byRow, by_kind: byKind, tikkunei_zohar: tz }, null, 1));
