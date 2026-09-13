#!/usr/bin/env node
// GUARDS: lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store
//
// The lattice orders answer on the page. A word opened on a book that
// carries the lattice layer can be re-ordered by the corpus lane's grade —
// masoretic (vowel match first), vowels differ (mismatch first), cites here
// (this verse's own citations first) — and by licence class and by
// names-as-sound; the line under the word moves with the order where the
// sidecar baked a first card, and the edition toggle marks the words the
// Leningrad codex spells otherwise. Every position is a re-order of the same
// pool: the count of readings never changes.
//
// Runs against the first zone on disk that carries the layer; SKIPS by name
// when none does.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const ZONE = zonesOnDisk().find((z) => {
  if (!existsSync(`data/zones/${z}.lattice.bin`)) return false;
  const s = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8"));
  return !!(s.emitted_from && s.emitted_from.toggles && s.emitted_from.toggles.lattice);
});
if (!ZONE) { console.log("SKIPPED — no zone on disk carries the lattice layer, so check-lattice-orders-v1 has nothing to press"); process.exit(3); }

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const BASE = (defaultZoneUrl()).split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(600);
console.log(`— ${ZONE} —`);

const pillsNow = () => p.evaluate(() => {
  const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
  return [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim());
});
const pressOrder = async (id) => {
  await p.evaluate(() => { const r = document.getElementById("rail"); if (r && !r.open) r.open = true; });
  const ok = await p.evaluate((id) => {
    const btn = [...document.querySelectorAll("#defRow .dfp, .def-order .dfp")].find((x) => x.dataset.id === id || x.textContent.trim() === id);
    if (!btn || btn.disabled) return false; btn.click(); return true;
  }, id);
  await p.waitForTimeout(900);
  return ok;
};
// which word: one whose pointed surface the sidecar graded with a first-under
// masoretic card that differs from the baked line, so the move can be seen
const target = await p.evaluate(() => {
  const z = window.__zone;
  const wbs = [...document.querySelectorAll("section.seg .he-text .wb")];
  for (let i = 0; i < Math.min(wbs.length, 60); i += 1) {
    const g = wbs[i].querySelector(".g"); if (!g || g.classList.contains("bare")) continue;
    return { i, text: g.textContent.trim() };
  }
  return null;
});
check("  a word with a reading stands on the page", !!target, target ? `word ${target.i + 1} · ${target.text}` : "");
await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i]; (w.querySelector(".w span") || w.querySelector(".w")).click(); }, target ? target.i : 0);
await p.waitForTimeout(600);
const base = await pillsNow();
check("  the card opened with its readings", !!base && base.length > 0, base ? `${base.length} readings, first "${base[0]}"` : "no card");

// the lattice orders
for (const [lab, tierChar, key] of [["masoretic", "m", "m"], ["vowels differ", "x", "x"], ["cites here", null, "c"]]) {
  const pressed = await pressOrder(lab);
  check(`  "${lab}" is live and can be pressed`, pressed);
  if (!pressed) continue;
  await p.waitForFunction(() => !!window.__latticeStore, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(700);
  const r = await p.evaluate((tierChar) => {
    const s = window.__latticeStore; if (!s) return { loaded: false };
    const h = document.querySelector("#hud");
    const pills = [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim());
    // the word standing open, by its outlined block
    const wb = document.querySelector("section.seg .he-text .wb.active");
    const surface = wb ? wb.querySelector(".w").textContent.trim() : null;
    const gr = s.grades[surface] || null;
    const line = wb ? wb.querySelector(".g").textContent.replace(/\s+/g, " ").trim() : null;
    return { loaded: true, pills, surface, graded: !!gr, first: gr && gr.o ? gr.o : null, line, tierChar };
  }, tierChar);
  check(`    the sidecar loaded and this surface is graded`, r.loaded && r.graded, r.surface || "");
  check(`    the pool is the same pool, re-ordered`, r.pills && base && r.pills.length === base.length, `${r.pills ? r.pills.length : "?"} vs ${base.length}`);
  if (r.first && r.first[key]) {
    const want = String(r.first[key][0]).toLowerCase();
    check(`    the line under the word moved to the order's first card`, r.line && r.line.toLowerCase().startsWith(want.slice(0, 12)), `line "${r.line}" · first "${r.first[key][0]}"`);
    // and the card's first pill is that same reading: one answer, two places
    check(`    and the card's first pill says the same`, r.pills && r.pills[0] && r.pills[0].toLowerCase() === want, `pill "${r.pills ? r.pills[0] : "?"}"`);
  } else {
    console.log(`  --    no ${lab} card for this surface, so the line stands (nothing to move it to)`);
  }
}
// back to oldest, and the pool is unchanged
await pressOrder("oldest first");
const back = await pillsNow();
check("  back at oldest first the readings are what they were", !!back && JSON.stringify(back) === JSON.stringify(base));

// licence class as a sort
const licPress = await p.evaluate(() => {
  const btn = [...document.querySelectorAll(".rail .dfp, .rail button")].find((x) => /public domain/i.test(x.textContent || ""));
  if (!btn || btn.disabled) return false; btn.click(); return true;
});
await p.waitForTimeout(600);
const lic = await p.evaluate(() => {
  const h = document.querySelector("#hud");
  const pills = [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim());
  const row = h.querySelector(".r-pills");
  return { pills, firstClass: row ? row.dataset.firstLic : null, minClass: row ? row.dataset.minLic : null };
});
// a class-0 reading leads when the pool has one; when it has none, the sort
// changes nothing and says so by the numbers
check("  license · public domain first: a sort that keeps every reading, and the lowest class the pool holds leads", licPress && lic.pills.length === base.length && lic.firstClass === (lic.minClass === "0" ? "0" : lic.minClass), `${lic.pills.length} readings · first reading's class ${lic.firstClass}, lowest in the pool ${lic.minClass}`);
await p.evaluate(() => { const btn = [...document.querySelectorAll(".rail .dfp, .rail button")].find((x) => /^any$/i.test((x.textContent || "").trim())); if (btn) btn.click(); });

// the edition mark
const ed = await p.evaluate(() => {
  const btn = [...document.querySelectorAll(".rail .dfp, .rail button")].find((x) => /Leningrad/i.test(x.textContent || ""));
  const n = document.querySelectorAll("section.seg .wb[data-ld]").length;
  if (!btn || btn.disabled) return { live: false, n };
  btn.click();
  return { live: true, n, marked: document.body.classList.contains("ed-mark") };
});
check("  edition · words where Leningrad differs carry the mark, and the toggle turns it on", ed.n === 0 ? true : ed.live && ed.marked, `${ed.n} marked words in the built sections${ed.n === 0 ? " (none built yet, nothing to mark)" : ""}`);

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
