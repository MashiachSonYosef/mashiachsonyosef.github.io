#!/usr/bin/env node
// GUARDS: witnessed-order-bake-rule-v1-three-columns-as-shipped-each-reading-with-its-own-credit
//
// THE WITNESSED ORDER, BAKED AS SHIPPED. The owner selected it (2026-09-25):
// a reading order, like "corpus" and "characters" — a column per order in
// zone.gloss_orders (key -> the reading that leads) with its credit in
// zone.gloss_m_orders (key -> M). The corpus lane built three columns over
// the served zones (moses-orders-rebase-v2.1, orders-witnessed-v2.7):
//
//   witnessed_same_place       a source gives this reading at this verse
//   witnessed_entry            ... in its entry for the word
//   witnessed_entry_and_lists  ... in its entry or its word lists
//
// The lane ships each reading as the served row's whole text ("fall out,
// come to pass, become, be"); a line under a word is ONE reading, cut from
// the row by the store's own rule (packSplit, then sense-split-rule-v2) —
// the rule every other line and every card pill is cut by, so the card's
// first pill is the line. The line takes the row's first reading; the M is
// the one the lane found or built for that row, verbatim. Nothing is picked.
// A key is refused, not baked, when its M lacks a licence or a name, when
// the zone has no reading of its own at that key (the column is an order
// over the zone's words, never an addition), or when the rule holds every
// sense of the row back as damaged (the card would not offer it).
// The receipt rides on emitted_from.witnessed_order, with every input's
// sha256; regloss-zone keeps these columns' M as shipped.
//
// Run: node tools/bake-witnessed-order-v1.mjs --dir <orders-witnessed-v2.7> --zone data/zones/<book>.bin --stamp YYYY-MM-DD
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { join, basename } from "node:path";
import { openRouteStore } from "./gloss-store-v1.mjs";

const RULE = "witnessed-order-bake-rule-v1-three-columns-as-shipped-each-reading-with-its-own-credit";
const COLUMNS = [
  ["witnessed_same_place", "same-place"],
  ["witnessed_entry", "entry"],
  ["witnessed_entry_and_lists", "entry-and-lists"],
];
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const DIR = arg("--dir"), ZONE = arg("--zone"), STAMP = arg("--stamp");
if (!DIR || !ZONE || !STAMP) { console.error("usage: --dir <orders-witnessed-v2.7> --zone <book.bin> --stamp YYYY-MM-DD"); process.exit(2); }
const { packSplit, readingSplit } = openRouteStore(arg("--store", "data/route-store"));
const firstReading = (text) => {
  for (const sense of packSplit(text)) { const r = readingSplit(sense); if (!r.damaged && r.readings.length) return r.readings[0]; }
  return null;
};
const sha = (b) => createHash("sha256").update(b).digest("hex");
const book = basename(ZONE, ".bin");
const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));
if (!zone.gloss) { console.error(`${book}: no gloss table`); process.exit(1); }

const receipt = { rule: RULE, baked_on: STAMP, baked_by: "tools/bake-witnessed-order-v1.mjs", columns: {} };
zone.gloss_orders = zone.gloss_orders || {};
zone.gloss_m_orders = zone.gloss_m_orders || {};
for (const [order, stem] of COLUMNS) {
  const of = join(DIR, `witnessed-${stem}-v2.7-${book}.json`), mf = join(DIR, `witnessed-${stem}-m-v2.7-${book}.json`);
  const ob = readFileSync(of), mb = readFileSync(mf);
  const o = JSON.parse(ob), m = JSON.parse(mb);
  if (o.book !== book || o.order !== order || m.book !== book || m.order !== order) {
    console.error(`${book}: ${stem} files are not this book's ${order}`); process.exit(1);
  }
  const col = {}, mcol = {}, refused = [];
  let cut = 0;
  for (const [k, text] of Object.entries(o.entries || {})) {
    const M = (m.m_entries || {})[k];
    if (typeof text !== "string" || !text) { refused.push([k, "no reading"]); continue; }
    if (!(k in zone.gloss)) { refused.push([k, "not a key of this zone"]); continue; }
    if (!M || typeof M !== "object" || Array.isArray(M) || !M.lic || !M.m) { refused.push([k, "no licence and name"]); continue; }
    const line = firstReading(text);
    if (!line) { refused.push([k, "every sense damaged"]); continue; }
    col[k] = line; mcol[k] = M;
    if (line !== text) cut += 1;
  }
  zone.gloss_orders[order] = col;
  zone.gloss_m_orders[order] = mcol;
  receipt.columns[order] = {
    order_file: basename(of), order_sha256: sha(ob), m_file: basename(mf), m_sha256: sha(mb),
    version: o.version, build: o.build, store_version: o.store_version_rows_and_years,
    shipped: Object.keys(o.entries || {}).length, baked: Object.keys(col).length, cut_to_first_reading: cut,
    built_from_row: Object.values(mcol).filter((x) => x.built_from_row).length,
    refused: refused.length, refused_first: refused.slice(0, 5),
  };
}
zone.emitted_from = zone.emitted_from || {};
zone.emitted_from.witnessed_order = receipt;
// typed under the single-pass exemption, merged with what regloss typed, so
// the receipts check counts this write rather than faulting it as patching
{
  const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
  const ef = zone.emitted_from;
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: STAMP };
  const me = "tools/bake-witnessed-order-v1.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : `${pb.by} + ${me}`) : me;
  for (const f of ["gloss_orders", "gloss_m_orders", "emitted_from.witnessed_order"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (pb.by_field[f].includes(me) ? pb.by_field[f] : `${pb.by_field[f]} + ${me}`) : me; }
  const why = "the owner selected the corpus lane's witnessed order (2026-09-25); its three columns are baked as shipped over this zone's own keys";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : `${pb.why}; ${why}`) : why;
  const exp = "with this zone's rebuild by a build-zone run, after which the columns are baked again";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : `${pb.expires}; ${exp}`) : exp;
  pb.on = STAMP;
  ef.post_build = pb;
}
writeFileSync(ZONE, gzipSync(Buffer.from(JSON.stringify(zone)), { level: 9 }));
console.log(`${book}: ${COLUMNS.map(([o]) => `${o.replace("witnessed_", "")} ${receipt.columns[o].baked}/${receipt.columns[o].shipped}`).join(" · ")}`);
