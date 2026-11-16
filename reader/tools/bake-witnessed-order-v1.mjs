#!/usr/bin/env node
// GUARDS: witnessed-order-bake-rule-v2-three-columns-as-shipped-each-reading-with-its-own-credit-an-entry-whose-row-prints-only-strongs-signed-renderings-is-refused-where-the-pool-holds-a-plain-one
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
// the row by the store's own rule — the rule every other line and every
// card pill is cut by, so the card's first pill is the line. Until 6
// November that rule was the generic one (packSplit, then
// the sense-split rule, v3, retired 7 November 2026); from that day it is the row's own ledger
// (ledger-division-rule-v2: the marks row[7] names, the texts row[8]
// prints, else the row whole), and from 7 November 2026 a source with no
// ledger stands whole, the generic rule retired on the owner's word. The
// line takes the row's first reading; the
// M is the one the lane found or built for that row, verbatim. Nothing is
// picked. A key is refused, not baked, when its M lacks a licence or a name,
// when the zone has no reading of its own at that key (the column is an
// order over the zone's words, never an addition), or when
// the row prints no pill under the owner's answer to its ledger's branch
// (ledger-division-rule-v2: the card does not hold it, so no column may name
// it), or when the row is only the words opening a numbered sense of its
// entry (sense-openings-rule-v1, 13 November 2026: the card prints it as a
// note, and a note is no line), or when no served row accounts for the text any more (struck, re-keyed
// or retexted since the lane's build: the card holds nothing of it, and until
// 7 November 2026 the generic rule cut such a text into a line no card held).
// Each refusal is typed with its reason.
//
// VERSION 2 (6 November 2026). The shipped input lives in the repository
// (data/witnessed-orders-v2.7, tools/import-witnessed-orders-v1.mjs: the
// lane's files verbatim, at the bytes the first bake's receipt pinned), and
// this bake runs on EVERY store change, before regloss-zone projects the
// store over the zone: a column derived from the shipped whole text cannot
// drift, where one derived from the already-cut piece did (the code review
// of 6 November: 508 readings credited to a source that no longer gave
// them). The receipt names the store the columns were baked against;
// regloss-zone refuses a zone whose columns were baked against another
// store, and check-witnessed-order-v1 W0 reads the same.
//
// The receipt rides on emitted_from.witnessed_order, with every input's
// sha256; regloss-zone keeps these columns' M as shipped (and re-credits or
// drops a reading whose credited source the store no longer holds,
// source-strike-rule-v1, typed on this receipt beside the bake's own counts).
//
// THE RULE'S SECOND VERSION (15 November 2026; the bake's input and its
// receipt's version, 2, are as above). A RENDERING
// CARRYING STRONG'S SIGN LEADS NO LINE WHERE THE KEY'S POOL AT REST HOLDS ONE
// WITHOUT IT. On a book the record of dictionary kinds rests shut (its scope,
// the thirty-nine books, asked of the zone's own fields), the base table
// reads the store's pool with Strong's sign last (zone-gloss-rule-v8, rule 7
// of tools/gloss-store-v1.mjs; the lead's call of 15 November 2026 on call 7
// of relay v189: «a rendering carrying its source's sign does not lead the
// line while the signs switch rests off», in every position of the switch,
// his call 3). A witnessed column cannot follow by taking the row's next
// reading: at every entry it touched on the combined ship, the row the lane
// shipped prints one signed rendering and nothing else («+ advertise», «X
// common», «X after»). So the entry is refused, typed with that reason, where
// every reading of its row opens with the sign (opensWithStrongSign: the
// source-signs ledger's STRONG_SIGN at the head, or the sign held alone in a
// round bracket there, the lead's call 1) and the pool the base table reads
// for the key at rest holds a reading that does not. The key then leaves the
// column, and the page lays a column only over its own keys, so the line
// under that order reads the base table, as the card does. Where the pool
// holds only signed readings too, the entry stands: the sign separates
// nothing there. Off the scope (no book there has a shipped witnessed order
// today) nothing is refused for it. The receipt counts the refusals of each
// column and names their keys (strongs_sign_refused,
// strongs_sign_refused_keys); check-witnessed-order-v1 refuses the same in its
// rebuild.
//
// Run: node tools/bake-witnessed-order-v1.mjs --zone data/zones/<book>.bin --stamp YYYY-MM-DD
//        [--from data/witnessed-orders-v2.7] [--store data/route-store] [--out <file>]
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { join, basename } from "node:path";
import { openRouteStore, routePrinted, senseOpened, opensWithStrongSign } from "./gloss-store-v1.mjs";
import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";
import { readKinds, restsOffIn } from "./dictionary-kinds-v1.mjs";

export const RULE = "witnessed-order-bake-rule-v2-three-columns-as-shipped-each-reading-with-its-own-credit-an-entry-whose-row-prints-only-strongs-signed-renderings-is-refused-where-the-pool-holds-a-plain-one";
export const COLUMNS = [
  ["witnessed_same_place", "same-place"],
  ["witnessed_entry", "entry"],
  ["witnessed_entry_and_lists", "entry-and-lists"],
];
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const ZONE = arg("--zone"), STAMP = arg("--stamp"), FROM = arg("--from", "data/witnessed-orders-v2.7"), OUT = arg("--out", null);
if (!ZONE || !STAMP) { console.error("usage: --zone <book.bin> --stamp YYYY-MM-DD [--from data/witnessed-orders-v2.7] [--store data/route-store] [--out <file>]"); process.exit(2); }
const STORE = arg("--store", "data/route-store");
const store = openRouteStore(STORE);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const book = basename(ZONE, ".bin");
const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));
if (!zone.gloss) { console.error(`${book}: no gloss table`); process.exit(1); }
// the rule's second version: on a book of the record's scope, the pool the base table reads for a key at rest (Strong's sign last); a
// record that is missing or does not hold is refused, never guessed past
let rest = null;
try {
  const kinds = readKinds(join(STORE, ".."));
  if (restsOffIn(kinds.rec, zone)) rest = openRouteStore(STORE, { atRest: true, signLast: true });
} catch (e) { console.error(`${book}: REFUSED — ${String((e && e.message) || e)}`); process.exit(1); }
const SIGN_REFUSED = "a rendering carrying Strong's sign leads no line where the key's pool at rest holds one without it";
const plainAtRest = (k) => (rest.readingPool(rest.routesFor(k) || [], "oldest")).some((g) => !opensWithStrongSign(g.text));
const shippedPath = join(FROM, `${book}.bin`);
if (!existsSync(shippedPath)) { console.log(`${book}: no shipped witnessed order in ${FROM}; nothing baked`); process.exit(3); }
const shippedBytes = readFileSync(shippedPath);
const shipped = JSON.parse(gunzipSync(shippedBytes).toString("utf8"));
if (shipped.book !== book) { console.error(`${book}: ${shippedPath} is ${shipped.book}'s`); process.exit(1); }

/** the row the lane shipped, as the store holds it now, and its readings under the
 *  store's rule of the day: the credited source's row whose route is the text */
const rowAndReadings = (k, text, M) => {
  const ids = M && Array.isArray(M.by) ? M.by : M && M.m ? store.mIdsOfLabel(M.m) : null;
  const row = store.rowOfText(k, text, ids);
  return { row, readings: row ? store.readingsOf(row) : [] };
};

const receipt = { rule: RULE, baked_on: STAMP, baked_by: "tools/bake-witnessed-order-v1.mjs", version: 2,
  shipped_from: { dir: FROM, file: basename(shippedPath), sha256: sha(shippedBytes), taken_from: shipped.taken_from || null },
  baked_against_store: store.index.store_version ?? null, columns: {} };
zone.gloss_orders = zone.gloss_orders || {};
zone.gloss_m_orders = zone.gloss_m_orders || {};
for (const [order] of COLUMNS) {
  const c = shipped.columns[order];
  if (!c) { console.error(`${book}: the shipped input has no ${order}`); process.exit(1); }
  const col = {}, mcol = {}, refused = [], noPill = [], signRefused = [];
  let cut = 0, whole = 0, unmapped = 0;
  for (const [k, text] of Object.entries(c.entries || {})) {
    const M = (c.m_entries || {})[k];
    if (typeof text !== "string" || !text) { refused.push([k, "no reading"]); continue; }
    if (!(k in zone.gloss)) { refused.push([k, "not a key of this zone"]); continue; }
    if (!M || typeof M !== "object" || Array.isArray(M) || !M.lic || !M.m) { refused.push([k, "no licence and name"]); continue; }
    const { row, readings } = rowAndReadings(k, text, M);
    if (!row) { unmapped += 1; refused.push([k, "no served row accounts for the text"]); continue; }
    if (!readings.length) {
      if (senseOpened(row)) { noPill.push({ key: k, text, m: String(row[3]), on: STAMP, why: "sense-openings-rule-v1: the row this reading came from is only the words opening a numbered sense of its entry, which the owner ruled a note and not a pill" }); refused.push([k, "prints as a note"]); }
      else if (store.ledgerOf(row[3])) { noPill.push({ key: k, text, m: String(row[3]), on: STAMP, why: "ledger-division-rule-v2: the row this reading came from prints no pill under the owner's answer to its ledger's branch" }); refused.push([k, "prints no pill"]); }
      else refused.push([k, "no reading under its rule"]);
      continue;
    }
    // the rule's second version: every reading of the row carries Strong's sign, and the key's pool at rest holds one that does not
    if (rest && readings.every((x) => opensWithStrongSign(x)) && plainAtRest(k)) { signRefused.push(k); refused.push([k, SIGN_REFUSED]); continue; }
    const line = readings[0];
    col[k] = line; mcol[k] = M;
    // whole where the line is the shipped text as it prints: a made space in a row's route closes there (made-spaces-rule-v1)
    if (line !== (String(row[1]) === text ? routePrinted(row) : text)) cut += 1; else whole += 1;
  }
  zone.gloss_orders[order] = col;
  zone.gloss_m_orders[order] = mcol;
  receipt.columns[order] = {
    order_file: c.order_file, order_sha256: c.order_sha256, m_file: c.m_file, m_sha256: c.m_sha256,
    version: c.version, build: c.build, store_version: c.store_version_rows_and_years,
    shipped: Object.keys(c.entries || {}).length, baked: Object.keys(col).length, cut_to_first_reading: cut, whole_row_is_the_reading: whole,
    text_no_served_row_accounts_for: unmapped,
    built_from_row: Object.values(mcol).filter((x) => x.built_from_row).length,
    refused: refused.length, refused_why: refused.reduce((a, [, why]) => { a[why] = (a[why] || 0) + 1; return a; }, {}), refused_first: refused.slice(0, 5),
    ...(noPill.length ? { no_pill_withdrawals: noPill } : {}),
    ...(rest ? { strongs_sign_refused: signRefused.length, strongs_sign_refused_keys: signRefused } : {}),
  };
}
zone.emitted_from = zone.emitted_from || {};
zone.emitted_from.witnessed_order = receipt;
// typed under the single-pass exemption, merged with what regloss typed, so
// the receipts check counts this write rather than faulting it as patching
typePostBuildWrite(zone, {
  tool: "tools/bake-witnessed-order-v1.mjs",
  fields: ["gloss_orders", "gloss_m_orders", "emitted_from.witnessed_order"],
  why: "the owner selected the corpus lane's witnessed order (2026-09-25); its three columns are baked as shipped over this zone's own keys",
  expires: "with this zone's rebuild by a build-zone run, after which the columns are baked again",
  stamp: STAMP,
});
writeZone(OUT || ZONE, zone);
console.log(`${book}: ${COLUMNS.map(([o]) => `${o.replace("witnessed_", "")} ${receipt.columns[o].baked}/${receipt.columns[o].shipped}${receipt.columns[o].no_pill_withdrawals ? ` (${receipt.columns[o].no_pill_withdrawals.length} no pill)` : ""}${receipt.columns[o].strongs_sign_refused ? ` (${receipt.columns[o].strongs_sign_refused} refused for Strong's sign)` : ""}`).join(" · ")} · against store ${receipt.baked_against_store}${rest ? " · Strong's sign last at rest" : ""}`);
