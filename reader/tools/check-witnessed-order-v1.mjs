#!/usr/bin/env node
// RUN: page
// GUARDS: witnessed-order-bake-rule-v1-three-columns-as-shipped-each-reading-with-its-own-credit
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
//       shipped input for every shipped key
//   W3  the order switch offers the three positions, live on this book
//   W4  under each, the lines move, and every sampled moved line is what its
//       card offers first, with a chip
//   W5  back to oldest first, every sampled line is what it was
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
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONE = arg("zone", "amos");
const COLS = [["witnessed_same_place", "same-place", "witnessed here"], ["witnessed_entry", "entry", "witnessed in entry"], ["witnessed_entry_and_lists", "entry-and-lists", "witnessed in lists"]];
const zone = JSON.parse(gunzipSync(readFileSync(`data/zones/${ZONE}.bin`)).toString("utf8"));
const rec = zone.emitted_from && zone.emitted_from.witnessed_order;
if (!rec) { console.log(`SKIPPED — ${ZONE} carries no witnessed order; run tools/bake-witnessed-order-v1.mjs`); process.exit(3); }
const store = openRouteStore("data/route-store");
const { index } = store;
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
  if (rec.columns[o].shipped !== rec.columns[o].baked + rec.columns[o].refused) w1.push(`${o}: ${rec.columns[o].shipped} shipped, ${rec.columns[o].baked} baked and ${rec.columns[o].refused} refused`);
  if (Object.keys(col).length !== rec.columns[o].baked - drops.length) w1.push(`${o}: ${Object.keys(col).length} baked, receipt says ${rec.columns[o].baked}${drops.length ? ` less ${drops.length} dropped for a struck credit` : ""}`);
}
check("W1  three columns with their receipt, every reading with its own credit", w1.length === 0,
  w1.length ? w1.slice(0, 3).join(" | ") : COLS.map(([o]) => `${o.replace("witnessed_", "")} ${rec.columns[o].baked - dropsOf(o).length}${dropsOf(o).length || withdrawnOf(o).length ? ` (${rec.columns[o].baked} baked${dropsOf(o).length ? `, ${dropsOf(o).length} dropped for a struck credit` : ""}${withdrawnOf(o).length ? `, ${withdrawnOf(o).length} refused for a row that prints no pill` : ""})` : ""}`).join(" · "));

// W2 — against the shipped input, every key the lane shipped
if (shipped) {
  const first = (k, t, M) => { const ids = M && Array.isArray(M.by) ? M.by : M && M.m ? store.mIdsOfLabel(M.m) : null; const rs = store.readingsOfText(k, t, ids); return rs.length ? rs[0] : null; };
  const w2 = []; let keys = 0;
  for (const [o] of COLS) {
    const c = shipped.columns[o] || {}, mEntries = c.m_entries || {};
    const col = zone.gloss_orders[o], mcol = zone.gloss_m_orders[o] || {}, dropped = new Set(dropsOf(o).map((d) => d.key));
    for (const [k, t] of Object.entries(c.entries || {})) {
      const M = mEntries[k];
      if (dropped.has(k)) continue;   // typed on the receipt: the lane's row stands on a struck source
      // the bake's own refusals: not a key of the zone, or a credit with no licence and name
      if (typeof t !== "string" || !t || !(k in zone.gloss) || !M || !M.lic || !M.m) { if (k in col) w2.push(`${o}/${k}: baked, but the bake refuses it`); continue; }
      keys += 1;
      const want = first(k, t, M);
      if (want === null ? k in col : col[k] !== want) w2.push(`${o}/${k}: "${col[k]}" for "${t}", the store's rule gives "${want}"`);
      // the credit is the lane's, verbatim, unless regloss re-credited it for a struck source (then the receipt says so)
      else if (want !== null && JSON.stringify(mcol[k]) !== JSON.stringify(M) && !(rec.columns[o].struck_credit_recredited_keys || []).includes(k)) w2.push(`${o}/${k}: the credit is not the lane's`);
    }
  }
  check("W2  each reading is the first the store's rule cuts from the row the lane shipped, with the lane's credit", w2.length === 0, w2.length ? w2.slice(0, 3).join(" | ") : `${keys} shipped keys re-derived`);
} else console.log("  --  W2  not judged: the shipped input is not on disk (W0)");

// W3–W5 on the page
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
      const f = ((document.querySelector("#hud .r-pills button") || {}).textContent || "").trim();
      const c = document.querySelector("#hud .head button"); if (c) c.click();
      await new Promise((r) => setTimeout(r, 200));
      return f;
    }, i);
    if (first.toLowerCase() !== x.t.toLowerCase()) w4.push(`${lab}: line "${x.t}", card "${first}"`);
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
