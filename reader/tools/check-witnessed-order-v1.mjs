#!/usr/bin/env node
// RUN: page
// GUARDS: witnessed-order-bake-rule-v2-three-columns-as-shipped-each-reading-with-its-own-credit-an-entry-whose-row-prints-only-strongs-signed-renderings-is-refused-where-the-pool-holds-a-plain-one
// LEDGER: -
// no frame letter. A check reads what is served and judges it; it is not the ledger for one.
//
// THE WITNESSED ORDER, PRESSED.
//
//   W0  the columns were baked from the shipped input kept in the repository
//       (data/witnessed-orders-v2.7: the lane's files verbatim, at the bytes
//       the receipt pins) and against the store this book is served from
//   W1  the book carries the three columns with their receipt: baked, less
//       every reading the receipt types as dropped for a struck credit (each
//       gone from the column, each crediting a source the store no longer
//       holds), and every baked reading carries its own credit (a licence
//       and a name); a reading whose row prints no pill under its ledger
//       was refused by the bake, typed, and is in no column
//   W2  each baked reading is the first reading the store's own rule cuts
//       from the row the corpus lane shipped, re-derived here from the
//       shipped input for every shipped key; its credit is the lane's,
//       verbatim, or the store's where the receipt types it re-credited:
//       for a struck source, or, on a book the record of what each
//       dictionary is rests shut (dictionary-kinds-rule-v1), for a source
//       that rests shut there, whose credit is then the store's at rest
//       for the reading, and the lane's credit named a source shut whole,
//       or one that carries the reading only in rows that rest shut, as a
//       carrier, as the source its chip names, or in its alternate; and no
//       credit kept as the lane gave it stands on such a source there. On a
//       book of the record's scope the rebuild refuses what the bake refuses
//       under its rule's second version: an entry whose row, as the bake
//       finds it, prints only renderings carrying Strong's sign
//       (opensWithStrongSign of tools/gloss-store-v1.mjs: the sign at the
//       head, or held alone in a round bracket there), where the key's pool
//       at rest, the sign last, holds a reading without it; each such entry
//       is in no column and typed on its column's receipt
//       (strongs_sign_refused_keys), the receipt types no other, and off the
//       scope none
//   W3  the order switch offers the three positions, live on this book
//   W4  under each, the lines move, and every sampled moved line is what its
//       card offers first, with a chip
//   W5  back to oldest first, every sampled line is what it was
//
// Run: node tools/check-witnessed-order-v1.mjs [url] [--zone <book>] [--zones <dir>] [--node]
//   --zones reads the book's zone from another folder (a proof on a book
//   baked in a scratch folder; the store and the shipped input are this
//   tree's); --node judges W0 to W2 alone and exits 3 where they hold, since
//   a law not judged is not passed
//
// THE BAKE KNOWS THE STORE'S SOURCES (as check-card-opens-on-the-line-v1 C2
// judges it). The dictionaries beside the store sort on the card like every
// other (overlay-rule-v2), but no overlay ever carries the line, so where one
// of their readings is the oldest the card leads with it while the line
// keeps the store's (Amos 1:1's בימי: Jastrow's "Bimi" before "in + days").
// W4 asks whether the column and the card's sort agree, so it is judged with
// the overlays' chips off, the sources the columns were baked from.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
import { openRouteStore, opensWithStrongSign } from "./gloss-store-v1.mjs";
import { glossMFor } from "./gloss-m-v1.mjs";
import { readKinds, restsOffIn, restsOffIds } from "./dictionary-kinds-v1.mjs";
import { lineOfPill } from "./card-readings-v1.mjs";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONE = arg("zone", "amos");
// --zones reads the book's zone from another folder than data/zones (a proof on a book baked in a scratch folder), and
// --node judges W0 to W2 alone: the page laws read the page this tree serves, and a law not judged is not passed (exit 3)
const ZONES_DIR = arg("zones", "data/zones");
const NODE_ONLY = process.argv.includes("--node");
const COLS = [["witnessed_same_place", "same-place", "witnessed here"], ["witnessed_entry", "entry", "witnessed in entry"], ["witnessed_entry_and_lists", "entry-and-lists", "witnessed in lists"]];
const zone = JSON.parse(gunzipSync(readFileSync(join(ZONES_DIR, `${ZONE}.bin`))).toString("utf8"));
const rec = zone.emitted_from && zone.emitted_from.witnessed_order;
if (!rec) { console.log(`SKIPPED — ${ZONE} carries no witnessed order; run tools/bake-witnessed-order-v1.mjs`); process.exit(3); }
const store = openRouteStore("data/route-store");
const { index } = store;
// THE DICTIONARIES THAT REST SHUT (dictionary-kinds-rule-v1): on a book the record rests shut, a witnessed credit
// that named a source resting shut is re-credited by the store at rest (tools/regloss-zone.mjs, typed on the
// column's receipt as rests_shut_recredited_keys); the store opened at rest says what that credit is
const kinds = readKinds("data");
const zoneRests = restsOffIn(kinds.rec, zone);
// and on those books the store is read with Strong's sign last (zone-gloss-rule-v8), as tools/regloss-zone.mjs and the
// bake read it: the credit's alternate and the pool a refusal for the sign asks are drawn from it
const storeAtRest = zoneRests ? openRouteStore("data/route-store", { atRest: true, signLast: true }) : null;
// the bake's refusal under its rule's second version: every reading of the row the lane shipped, as the bake finds it,
// carries Strong's sign, and the key's pool at rest holds a reading that does not
const plainAtRest = (k) => !!storeAtRest && storeAtRest.readingPool(storeAtRest.routesFor(k) || [], "oldest").some((g) => !opensWithStrongSign(g.text));
const signRefused = (k, text, M) => {
  if (!storeAtRest) return false;
  const ids = M && Array.isArray(M.by) ? M.by : M && M.m ? store.mIdsOfLabel(M.m) : null;
  const row = store.rowOfText(k, text, ids);
  const readings = row ? store.readingsOf(row) : [];
  return readings.length > 0 && readings.every((x) => opensWithStrongSign(x)) && plainAtRest(k);
};
const signRefusedOf = (o) => (Array.isArray(rec.columns[o].strongs_sign_refused_keys) ? rec.columns[o].strongs_sign_refused_keys : []);
const shutIds = new Set(zoneRests ? restsOffIds(kinds.rec, index.m_sources) : []);
const shutLabels = new Set([...shutIds].map((id) => (index.m_sources[id] || {}).label).filter(Boolean));
const carrierIds = (st, k, text) => new Set(st.carriersOf(st.routesFor(k) || [], text).map((row) => String(row[3])));
// whether the lane's credit for a reading stood on a source that rests shut: one shut whole, by id or by the label
// its chip names, or a source that carries the reading in the store whole and in no row that rests open; asked of
// the credit and of its alternate (the reading it gives in second place, with its own carriers), as the bake asks
const creditShut = (k, text, M) => {
  if (!storeAtRest || !M) return false;
  const standsShut = (t, c) => {
    if (typeof t !== "string" || !c) return false;
    const ids = Array.isArray(c.by) ? c.by.map(String) : c.m ? store.mIdsOfLabel(c.m) : [];
    if (ids.some((id) => shutIds.has(id)) || shutLabels.has(c.m)) return true;
    const whole = carrierIds(store, k, t), open = carrierIds(storeAtRest, k, t);
    return ids.some((id) => whole.has(id) && !open.has(id));
  };
  return standsShut(text, M) || !!(M.alt && standsShut(M.alt.text, M.alt));
};
// the drops typed on a column's receipt (regloss-zone, source-strike-rule-v1)
const dropsOf = (o) => (Array.isArray(rec.columns[o].struck_credit_drops) ? rec.columns[o].struck_credit_drops : []);
// a reading whose row prints no pill under the owner's answer to its ledger's branch was refused by the bake (ledger-division-rule-v2)
const withdrawnOf = (o) => (Array.isArray(rec.columns[o].no_pill_withdrawals) ? rec.columns[o].no_pill_withdrawals : []);

// W0 — the shipped input, and the store the columns were baked against
const FROM = arg("from", "data/witnessed-orders-v2.7");
const shippedPath = join(FROM, `${ZONE}.bin`);
let shipped = null;
{
  const w0 = [];
  if (rec.version !== 2 || !rec.shipped_from) w0.push("the receipt is not a version 2 bake (from the shipped input)");
  if (!existsSync(shippedPath)) w0.push(`${shippedPath} is not on disk`);
  else {
    const bytes = readFileSync(shippedPath);
    const got = createHash("sha256").update(bytes).digest("hex");
    if (rec.shipped_from && rec.shipped_from.sha256 !== got) w0.push(`the receipt pins ${String(rec.shipped_from.sha256).slice(0, 10)}…, the shipped input on disk is ${got.slice(0, 10)}…`);
    shipped = JSON.parse(gunzipSync(bytes).toString("utf8"));
    const ix = JSON.parse(readFileSync(join(FROM, "index.json"), "utf8"));
    if (!ix.books || !ix.books[ZONE] || ix.books[ZONE].sha256 !== got) w0.push("the shipped input's index does not pin this book's file at these bytes");
    for (const [o] of COLS) { const c = (shipped.columns || {})[o], r = rec.columns[o]; if (!c || !r) continue; if (c.order_sha256 !== r.order_sha256 || c.m_sha256 !== r.m_sha256) w0.push(`${o}: the receipt's lane-file hashes are not the shipped input's`); }
  }
  if ((rec.baked_against_store ?? null) !== (index.store_version ?? null)) w0.push(`baked against store ${rec.baked_against_store}, served from store ${index.store_version}`);
  check("W0  the columns were baked from the shipped input in the repository, against the store this book is served from", w0.length === 0,
    w0.length ? w0.slice(0, 3).join(" | ") : `${shippedPath} · store ${index.store_version}`);
}

// W1
const w1 = [];
for (const [o] of COLS) {
  const col = (zone.gloss_orders || {})[o], mcol = (zone.gloss_m_orders || {})[o];
  if (!col || !mcol || !rec.columns[o]) { w1.push(`${o}: missing`); continue; }
  for (const k of Object.keys(col)) { const M = mcol[k]; if (!M || !M.lic || !M.m) w1.push(`${o}/${k}: no credit`); if (!(k in zone.gloss)) w1.push(`${o}/${k}: not a key of the book`); }
  const drops = dropsOf(o);
  for (const d of drops) {
    if (d.key in col) w1.push(`${o}/${d.key}: typed as dropped for a struck credit, yet still in the column`);
    if (!(Array.isArray(d.by) && d.by.some((id) => !index.m_sources[id]))) w1.push(`${o}/${d.key}: typed as dropped, but every source it credits is still in the store`);
  }
  const withdrawn = withdrawnOf(o);
  for (const w of withdrawn) if (w.key in col) w1.push(`${o}/${w.key}: typed as refused for a row that prints no pill, yet in the column`);
  // the refusals for Strong's sign (the rule's second version): typed only on a book of the scope, counted as listed, in no column
  const signed = signRefusedOf(o);
  if (!zoneRests && ("strongs_sign_refused" in rec.columns[o] || signed.length)) w1.push(`${o}: the receipt types refusals for Strong's sign on a book the record's scope does not reach`);
  if (zoneRests && rec.columns[o].strongs_sign_refused !== signed.length) w1.push(`${o}: the receipt counts ${rec.columns[o].strongs_sign_refused} refusals for Strong's sign and lists ${signed.length}`);
  for (const k of signed) if (k in col) w1.push(`${o}/${k}: typed as refused for Strong's sign, yet in the column`);
  if (rec.columns[o].shipped !== rec.columns[o].baked + rec.columns[o].refused) w1.push(`${o}: ${rec.columns[o].shipped} shipped, ${rec.columns[o].baked} baked and ${rec.columns[o].refused} refused`);
  if (Object.keys(col).length !== rec.columns[o].baked - drops.length) w1.push(`${o}: ${Object.keys(col).length} baked, receipt says ${rec.columns[o].baked}${drops.length ? ` less ${drops.length} dropped for a struck credit` : ""}`);
}
check("W1  three columns with their receipt, every reading with its own credit", w1.length === 0,
  w1.length ? w1.slice(0, 3).join(" | ") : COLS.map(([o]) => `${o.replace("witnessed_", "")} ${rec.columns[o].baked - dropsOf(o).length}${dropsOf(o).length || withdrawnOf(o).length || signRefusedOf(o).length ? ` (${rec.columns[o].baked} baked${dropsOf(o).length ? `, ${dropsOf(o).length} dropped for a struck credit` : ""}${withdrawnOf(o).length ? `, ${withdrawnOf(o).length} refused for a row that prints no pill` : ""}${signRefusedOf(o).length ? `, ${signRefusedOf(o).length} refused for Strong's sign` : ""})` : ""}`).join(" · "));

// W2 — against the shipped input, every key the lane shipped
if (shipped) {
  const first = (k, t, M) => { const ids = M && Array.isArray(M.by) ? M.by : M && M.m ? store.mIdsOfLabel(M.m) : null; const rs = store.readingsOfText(k, t, ids); return rs.length ? rs[0] : null; };
  const w2 = []; let keys = 0, shutRecredited = 0, refusedForSign = 0;
  for (const [o] of COLS) {
    const c = shipped.columns[o] || {}, mEntries = c.m_entries || {};
    const col = zone.gloss_orders[o], mcol = zone.gloss_m_orders[o] || {}, dropped = new Set(dropsOf(o).map((d) => d.key));
    for (const [k, t] of Object.entries(c.entries || {})) {
      const M = mEntries[k];
      if (dropped.has(k)) continue;   // typed on the receipt: the lane's row stands on a struck source
      // the bake's own refusals: not a key of the zone, or a credit with no licence and name
      if (typeof t !== "string" || !t || !(k in zone.gloss) || !M || !M.lic || !M.m) { if (k in col) w2.push(`${o}/${k}: baked, but the bake refuses it`); continue; }
      keys += 1;
      // the rule's second version: the bake refuses the entry, the receipt types it, and the column does not hold it
      if (signRefused(k, t, M)) {
        refusedForSign += 1;
        if (k in col) w2.push(`${o}/${k}: "${col[k]}" for "${t}", whose row prints only renderings carrying Strong's sign while the key's pool at rest holds a plain one: the bake refuses it`);
        if (!signRefusedOf(o).includes(k)) w2.push(`${o}/${k}: refused for Strong's sign by the rule, and the receipt does not type it so`);
        continue;
      }
      if (signRefusedOf(o).includes(k)) { w2.push(`${o}/${k}: typed as refused for Strong's sign, and its row prints a plain reading or the key's pool at rest holds none`); continue; }
      const want = first(k, t, M);
      if (want === null ? k in col : col[k] !== want) w2.push(`${o}/${k}: "${col[k]}" for "${t}", the store's rule gives "${want}"`);
      // the credit is the lane's, verbatim, unless regloss re-credited it for a struck source (then the receipt says
      // so), or for a source the record rests shut on this book: then it is the store's credit at rest for the
      // reading, and the lane's credit named a source that rests shut (the receipt says that too)
      else if (want !== null && JSON.stringify(mcol[k]) !== JSON.stringify(M)) {
        if ((rec.columns[o].rests_shut_recredited_keys || []).includes(k)) {
          shutRecredited += 1;
          if (!storeAtRest) w2.push(`${o}/${k}: typed re-credited for a source that rests shut, on a book the record does not rest shut`);
          else if (!creditShut(k, col[k], M)) w2.push(`${o}/${k}: typed re-credited for a source that rests shut, and the lane's credit names none`);
          else if (JSON.stringify(mcol[k]) !== JSON.stringify(glossMFor(storeAtRest, { [k]: col[k] }).gloss_m[k] || null)) w2.push(`${o}/${k}: re-credited for a source that rests shut, and the credit is not the store's at rest`);
        } else if (!(rec.columns[o].struck_credit_recredited_keys || []).includes(k)) w2.push(`${o}/${k}: the credit is not the lane's`);
      }
      // and the lane's credit kept as it came must not stand on a source that rests shut here: that one is re-credited
      else if (want !== null && creditShut(k, col[k], M)) w2.push(`${o}/${k}: the lane's credit stands on a source that rests shut on ${ZONE}, and the column keeps it`);
    }
  }
  check("W2  each reading is the first the store's rule cuts from the row the lane shipped, with the lane's credit, or the store's where the receipt types it re-credited; and on a book of the scope an entry whose row prints only renderings carrying Strong's sign over a pool at rest that holds a plain one is refused and typed", w2.length === 0, w2.length ? `${w2.length} · ${w2.slice(0, 3).join(" | ")}` : `${keys} shipped keys re-derived${zoneRests ? ` · ${refusedForSign} refused for Strong's sign, each typed on its receipt · ${shutRecredited} credit(s) the lane gave a source that rests shut on ${ZONE}, each the store's at rest` : ""}`);
} else console.log("  --  W2  not judged: the shipped input is not on disk (W0)");

// W3–W5 on the page
if (NODE_ONLY) { console.log("  --  W3 to W5 not judged: --node asks the laws over the files alone, and the page's laws are not passed"); console.log(bad ? `\n${bad} FAILED` : "\nW0 to W2 green; the page not judged"); process.exit(bad ? 1 : 3); }
const pw = await loadPlaywright();
const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
// every source id beside the store, read off the overlays' own indexes, off
const OV_DIR = join("data", "overlays");
const OV_IDS = existsSync(OV_DIR) ? readdirSync(OV_DIR).filter((d) => existsSync(join(OV_DIR, d, "index.json")))
  .flatMap((d) => Object.keys(JSON.parse(readFileSync(join(OV_DIR, d, "index.json"), "utf8")).m_sources || {})) : [];
if (OV_IDS.length) await p.addInitScript((ids) => { try { localStorage.setItem("fh.sources.off", JSON.stringify(ids)); } catch { /* as above */ } }, OV_IDS);
// THE ORDER THESE CLAIMS ARE WRITTEN AGAINST: oldest first. The owner made
// "at this place" the default (2026-10-03: "we dont do blanket oldest first
// anymore thats a subtoggle"); it leads wherever TAHOT reads the word, and it
// has its own check (check-line-reads-the-place-v1). A stored choice is kept.
await p.addInitScript(() => { try { if (!localStorage.getItem("fh.def.order")) localStorage.setItem("fh.def.order", "oldest"); } catch { /* a device that remembers nothing still reads */ } });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(async () => { let g = 0; while (g < 4000) { const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 5)); g += 1; } window.scrollTo(0, 0); });
const offered = await p.evaluate(() => [...document.querySelectorAll("#defRow button")].map((x) => ({ t: x.textContent, dead: x.disabled })));
check("W3  the order switch offers the three positions, live on this book",
  COLS.every(([, , lab]) => offered.some((x) => x.t === lab && !x.dead)), offered.map((x) => `${x.t}${x.dead ? " (dead)" : ""}`).join(" | "));

const lines = () => p.evaluate(() => [...document.querySelectorAll("section.seg .he-text .wb")].map((wb) => { const g = wb.querySelector(".g"); if (!g) return null; const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return { t: c.textContent.trim(), chip: !!g.querySelector(".g-lic") }; }));
const press = (lab) => p.evaluate((lab) => { const r = document.getElementById("rail"); if (r && !r.open) r.open = true; const x = [...document.querySelectorAll("#defRow button")].find((y) => y.textContent === lab); if (x) x.click(); }, lab);
const before = await lines();
const w4 = [];
for (const [o, , lab] of COLS) {
  await press(lab); await p.waitForTimeout(1200);
  const now = await lines();
  const moved = now.map((x, i) => [i, x]).filter(([i, x]) => x && before[i] && x.t !== before[i].t);
  if (!moved.length) { w4.push(`${lab}: no line moved`); continue; }
  for (const [i, x] of moved.slice(0, 5)) {
    const first = await p.evaluate(async (i) => {
      const wb = document.querySelectorAll("section.seg .he-text .wb")[i];
      wb.scrollIntoView({ block: "center" });
      (wb.querySelector(".w span") || wb.querySelector(".w")).click();
      const t0 = Date.now(); while (Date.now() - t0 < 5000 && !document.querySelector("#hud .r-pills button")) await new Promise((r) => setTimeout(r, 50));
      await new Promise((r) => setTimeout(r, 300));
      const lead = document.querySelector("#hud .r-pills button");
      const f = { t: ((lead || {}).textContent || "").trim(), by: lead ? lead.dataset.pointerBy || "" : "" };
      const c = document.querySelector("#hud .head button"); if (c) c.click();
      await new Promise((r) => setTimeout(r, 200));
      return f;
    }, i);
    // a reading that took the pointers resolving to it prints them beside it on its pill alone (pointer-one-pill-rule-v1,
    // ship 5): its pill is read as the line prints it (lineOfPill)
    if (lineOfPill(first.t, first.by).toLowerCase() !== x.t.toLowerCase()) w4.push(`${lab}: line "${x.t}", card "${first.t}"`);
    if (!x.chip && !x.t.includes(" + ")) w4.push(`${lab}: "${x.t}" has no chip`);
  }
  console.log(`  ..  ${lab}: ${moved.length} lines moved`);
}
check("W4  under each, the lines move, and each sampled line is its card's first pill, with a chip", w4.length === 0, w4.slice(0, 3).join(" | "));
await press("oldest first"); await p.waitForTimeout(1200);
const after = await lines();
const w5 = before.map((x, i) => [x, after[i]]).filter(([x, y]) => x && y && x.t !== y.t).length;
check("W5  back to oldest first, every line is what it was", w5 === 0, `${w5} differ`);
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall green");
process.exit(bad ? 1 : 0);
