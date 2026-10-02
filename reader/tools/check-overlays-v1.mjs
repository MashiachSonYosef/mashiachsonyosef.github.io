// check-overlays-v1 · an overlay adds readings after the store and changes nothing above them
//
// GUARDS: overlay-rule-v1-an-overlay-adds-readings-after-the-store-and-changes-nothing-above-them
// LEDGER: -
// no frame letter. This writes nothing: it reads the overlays the reader serves
// and the page it draws.
//
// The owner ruled Jastrow and Samaritan in on 2026-10-02 (data/serving-rulings-v1.json,
// jastrow-served and samaritan-served). Each is served beside the route store under
// data/overlays/<id>/, never merged into it, under its own switch. What must hold:
//
//   O1  every overlay beside the store is the corpus lane's delivery, file for file:
//       sha256 and size against the manifest that came with it
//   O2  the page loads each overlay and draws its switch live on the rail
//   O3  with the switches off, no card holds an overlay reading
//   O4  with them on, every card begins with exactly the readings it holds with
//       them off, in the same order, and every reading after those is an overlay's
//   O5  the line under every word is the same with the switches on and off
//   O6  an overlay's reading, opened, names its overlay in the card
//
// Run: node tools/check-overlays-v1.mjs [zone url]   (with python3 -m http.server 8899 in reader/)
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const OVERLAYS = ["jastrow", "samaritan"].filter((id) => existsSync(join("data", "overlays", id, "index.json")));
if (!OVERLAYS.length) { console.log("SKIPPED — no overlay beside the store (data/overlays/<id>/index.json)"); process.exit(3); }
for (const id of OVERLAYS) {
  const dir = join("data", "overlays", id);
  const man = JSON.parse(readFileSync(join(dir, "MANIFEST-overlay-v1.json"), "utf8"));
  const off = man.files.filter((f) => {
    const p = join(dir, f.path);
    if (!existsSync(p)) return true;
    const b = readFileSync(p);
    return b.length !== f.bytes || createHash("sha256").update(b).digest("hex") !== f.sha256;
  });
  check(`O1  the ${id} overlay is the corpus lane's delivery, file for file`, off.length === 0,
    off.length ? `${off.length} of ${man.files.length} differ: ${off.slice(0, 4).map((f) => f.path).join(", ")}` : `${man.files.length} files · store_version ${man.store_version}`);
}

const pw = await loadPlaywright();
const URL0 = defaultZoneUrl();
const BASE = URL0.split("?")[0];
const BOOK = (URL0.match(/[?&]b=([^&]+)/) || [])[1] || "daniel";
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
const SAMPLE = 30;

const pass = async (state) => {
  await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" });
  await p.evaluate(({ ids, v }) => { for (const id of ids) localStorage.setItem(`fh.overlay.${id}`, v); }, { ids: OVERLAYS, v: state });
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(500);
  const lines = await p.evaluate(() => [...document.querySelectorAll(".wb > .g, .wjoin > .g")].slice(0, 400).map((g) => g.textContent));
  const meta = await p.evaluate(() => ({ overlays: window.__overlays || [], on: window.__overlayOn || {},
    rail: [...document.querySelectorAll(".rail .row[data-toggle]")].map((r) => ({ id: r.dataset.toggle, dead: r.classList.contains("dead") || !!r.querySelector(".dead") })) }));
  const cards = [];
  const n = await p.evaluate(() => document.querySelectorAll("section.seg .he-text .wb").length);
  for (let i = 0; i < Math.min(SAMPLE, n); i += 1) {
    const got = await p.evaluate(async (i) => {
      const w = document.querySelectorAll("section.seg .he-text .wb")[i];
      window.__pool = null; window.__poolOv = null;
      (w.querySelector(".w span") || w.querySelector(".w")).click();
      const t0 = Date.now(); while (Date.now() - t0 < 6000 && !window.__pool) await new Promise((r) => setTimeout(r, 40));
      const out = { pool: window.__pool || [], ov: window.__poolOv || [] };
      const x = document.querySelector("#hud .head button"); if (x) x.click();
      return out;
    }, i);
    cards.push(got);
  }
  return { lines, meta, cards };
};

const on = await pass("on");
const off = await pass("off");
for (const id of OVERLAYS) {
  const row = on.meta.rail.find((r) => r.id === id);
  check(`O2  the ${id} overlay loads and its switch is live on the rail`, on.meta.overlays.includes(id) && !!row && !row.dead, row ? (row.dead ? "drawn dead" : "live") : "no row");
}
const leaked = off.cards.filter((c) => c.ov.some(Boolean)).length;
check("O3  with the switches off, no card holds an overlay reading", leaked === 0, `${off.cards.length} cards · ${leaked} with an overlay reading`);
let moved = 0, notOverlay = 0, added = 0;
on.cards.forEach((c, i) => {
  const o = off.cards[i];
  const head = c.pool.slice(0, o.pool.length);
  if (head.length !== o.pool.length || head.some((t, k) => t !== o.pool[k])) moved += 1;
  const tail = c.ov.slice(o.pool.length);
  if (tail.some((v) => !v) || c.ov.slice(0, o.pool.length).some(Boolean)) notOverlay += 1;
  added += c.pool.length - o.pool.length;
});
check("O4  on, every card begins with exactly its readings off, and only an overlay's follow", moved === 0 && notOverlay === 0,
  `${on.cards.length} cards · ${added} overlay readings added · ${moved} cards whose store readings moved · ${notOverlay} with a non-overlay reading after the store's`);
const diffLines = on.lines.filter((t, i) => t !== off.lines[i]).length;
check("O5  the line under every word is the same on and off", diffLines === 0 && on.lines.length === off.lines.length, `${on.lines.length} lines · ${diffLines} differ`);

// O6 · open one overlay reading and read its mark
const pick = on.cards.findIndex((c) => c.ov.some(Boolean));
if (pick < 0) check("O6  an overlay's reading names its overlay in the card", false, `no overlay reading among the first ${SAMPLE} cards of ${BOOK}`);
else {
  await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" });
  await p.evaluate((ids) => { for (const id of ids) localStorage.setItem(`fh.overlay.${id}`, "on"); }, OVERLAYS);
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const want = on.cards[pick].pool[on.cards[pick].ov.findIndex(Boolean)];
  const mark = await p.evaluate(async ({ i, want }) => {
    const w = document.querySelectorAll("section.seg .he-text .wb")[i];
    window.__pool = null;
    (w.querySelector(".w span") || w.querySelector(".w")).click();
    const t0 = Date.now(); while (Date.now() - t0 < 6000 && !window.__pool) await new Promise((r) => setTimeout(r, 40));
    const btn = [...document.querySelectorAll("#hud .r-pills button")].find((x) => x.textContent.trim() === want);
    if (btn) btn.click();
    else {
      const sel = document.querySelector("#hud .r-overflow select");
      const opt = sel && [...sel.options].find((o) => o.textContent.trim() === want);
      if (!opt) return { how: "not offered", marks: [] };
      sel.value = opt.value; sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await new Promise((r) => setTimeout(r, 300));
    return { how: btn ? "pill" : "list", marks: [...document.querySelectorAll("#hud .d-card .att .ov-mark")].map((s) => s.textContent) };
  }, { i: pick, want });
  check("O6  an overlay's reading names its overlay in the card", mark.marks.length > 0, `"${want}" by ${mark.how} · marks: ${mark.marks.join(", ") || "none"}`);
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
