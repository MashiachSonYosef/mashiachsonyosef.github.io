#!/usr/bin/env node
// GUARDS: orders-registered-together-rule-v1-a-reading-column-and-its-credit-column-are-one-registration
//
// AN ORDER'S READINGS AND THEIR CREDIT ARE REGISTERED TOGETHER. A zone's
// gloss_orders[o] (key -> the reading that leads under order o) and its
// gloss_m_orders[o] (key -> that reading's M) are one thing: a reading with
// no credit draws no chip, and the page then prints an unattributed line;
// a credit with no reading is a chip on nothing. The corpus lane's rule
// (v11/v15): "register both together".
//
//   O1  every reading column has a credit column of the same name
//   O2  every key of a reading column has its credit, and no credit stands
//       on a key the column does not read
//   O3  every credit carries a licence and a name
//
// Off disk, every zone on the shelf. Run: node tools/check-orders-registered-together-v1.mjs [--zones data/zones]
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { isSidecar } from "./zones-on-disk-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", "data/zones");
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !isSidecar(f)).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

const o1 = [], o2 = [], o3 = [];
let withOrders = 0, columns = 0, keys = 0;
for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(`${ZONES}/${f}`)).toString("utf8")); } catch { continue; }
  const go = z.gloss_orders, gm = z.gloss_m_orders || {};
  if (!go || typeof go !== "object" || !Object.keys(go).length) continue;
  withOrders += 1;
  for (const [o, col] of Object.entries(go)) {
    columns += 1;
    const mcol = gm[o];
    if (!mcol || typeof mcol !== "object") { o1.push(`${f}: ${o}`); continue; }
    const ks = Object.keys(col || {});
    keys += ks.length;
    const missing = ks.filter((k) => !(k in mcol));
    const extra = Object.keys(mcol).filter((k) => !(k in col));
    if (missing.length || extra.length) o2.push(`${f}: ${o} — ${missing.length} readings without credit, ${extra.length} credits without reading`);
    const bare = ks.filter((k) => { const M = mcol[k]; return !M || typeof M !== "object" || Array.isArray(M) || !M.lic || !M.m; });
    if (bare.length) o3.push(`${f}: ${o} — ${bare.length} credits without licence or name`);
  }
}
console.log(`— ${withOrders} zones carry orders · ${columns} columns · ${keys.toLocaleString()} readings —`);
check("O1  every reading column has a credit column of the same name", o1.length === 0, o1.slice(0, 3).join(" | "));
check("O2  every reading has its credit, and no credit stands on a key the column does not read", o2.length === 0, o2.slice(0, 3).join(" | "));
check("O3  every credit carries a licence and a name", o3.length === 0, o3.slice(0, 3).join(" | "));
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
