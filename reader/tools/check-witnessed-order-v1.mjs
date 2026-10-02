#!/usr/bin/env node
// GUARDS: witnessed-order-bake-rule-v1-three-columns-as-shipped-each-reading-with-its-own-credit
//
// THE WITNESSED ORDER, PRESSED.
//
//   W1  the book carries the three columns with their receipt, and every
//       baked reading carries its own credit (a licence and a name)
//   W2  each baked reading is the first reading the store's own rule cuts
//       from the row the corpus lane shipped (when its files are on disk)
//   W3  the order switch offers the three positions, live on this book
//   W4  under each, the lines move, and every sampled moved line is what its
//       card offers first, with a chip
//   W5  back to oldest first, every sampled line is what it was
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONE = arg("zone", "amos");
const COLS = [["witnessed_same_place", "same-place", "witnessed here"], ["witnessed_entry", "entry", "witnessed in entry"], ["witnessed_entry_and_lists", "entry-and-lists", "witnessed in lists"]];
const zone = JSON.parse(gunzipSync(readFileSync(`data/zones/${ZONE}.bin`)).toString("utf8"));
const rec = zone.emitted_from && zone.emitted_from.witnessed_order;
if (!rec) { console.log(`SKIPPED — ${ZONE} carries no witnessed order; run tools/bake-witnessed-order-v1.mjs`); process.exit(3); }

// W1
const w1 = [];
for (const [o] of COLS) {
  const col = (zone.gloss_orders || {})[o], mcol = (zone.gloss_m_orders || {})[o];
  if (!col || !mcol || !rec.columns[o]) { w1.push(`${o}: missing`); continue; }
  for (const k of Object.keys(col)) { const M = mcol[k]; if (!M || !M.lic || !M.m) w1.push(`${o}/${k}: no credit`); if (!(k in zone.gloss)) w1.push(`${o}/${k}: not a key of the book`); }
  if (Object.keys(col).length !== rec.columns[o].baked) w1.push(`${o}: ${Object.keys(col).length} baked, receipt says ${rec.columns[o].baked}`);
}
check("W1  three columns with their receipt, every reading with its own credit", w1.length === 0,
  w1.length ? w1.slice(0, 3).join(" | ") : COLS.map(([o]) => `${o.replace("witnessed_", "")} ${rec.columns[o].baked}`).join(" · "));

// W2 — against the lane's files, when they are on disk
const DIR = arg("dir", "build/witnessed-v2.7");
if (existsSync(`${DIR}/witnessed-same-place-v2.7-${ZONE}.json`)) {
  const { packSplit, readingSplit } = openRouteStore("data/route-store");
  const first = (t) => { for (const s of packSplit(t)) { const r = readingSplit(s); if (!r.damaged && r.readings.length) return r.readings[0]; } return null; };
  const w2 = [];
  for (const [o, stem] of COLS) {
    const shipped = JSON.parse(readFileSync(`${DIR}/witnessed-${stem}-v2.7-${ZONE}.json`, "utf8")).entries;
    const col = zone.gloss_orders[o];
    for (const [k, t] of Object.entries(shipped)) {
      const want = first(t);
      if (want === null ? k in col : col[k] !== want) w2.push(`${o}/${k}: "${col[k]}" for "${t}"`);
    }
  }
  check("W2  each reading is the first the store's rule cuts from the row the lane shipped", w2.length === 0, w2.slice(0, 3).join(" | "));
} else console.log(`  --  W2  the lane's files are not on this disk (${DIR}); the receipt's hashes stand for them`);

// W3–W5 on the page
const pw = await loadPlaywright();
const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
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
