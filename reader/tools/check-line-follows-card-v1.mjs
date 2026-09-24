#!/usr/bin/env node
// GUARDS: source-switch-rule-v1-a-reading-remembers-who-carried-it
//
// THE LINE SAYS WHAT THE CARD SAYS, WHATEVER IS SWITCHED OFF.
//
// A shelf switch throws many sources at once. The line under a word used to
// read only what was baked beside it — its reading's carriers and one
// alternate — so a thrown shelf left 17,104 lines bare on the 39 books while
// their cards still offered readings, and 113,963 lines wore a chip naming a
// source the reader had turned off. This holds the page to its own rule:
//
//   F1  with a whole century shelf thrown, on a sample of words across the
//       book: a line is bare only where the card has no reading, and where
//       the card has one, the line is the card's first pill
//   F2  no chip on a line names a source that is switched off
//   F3  under an order column ("characters"), with the source that carries
//       that column's reading switched off, the line leaves it: no line's
//       chip names the switched-off source
//   F4  a ketiv/qere pair's line is re-read when the order changes: the half
//       it shows says what the table now says for that half
//   F5  everything switched back on: every sampled line is what it was
//
// Runs against the served book with the most pairs among those on disk
// (pairs make F4 bite), or the one named with --zone.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };

let ZONE = arg("zone", null);
if (!ZONE) {
  let best = -1;
  for (const z of zonesServed()) {
    let s; try { s = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8")); } catch { continue; }
    if (!(s.gloss_orders && s.emitted_from && s.emitted_from.toggles && s.emitted_from.toggles.sources)) continue;
    const kq = Number((s.counts || {}).kq_sites) || 0;
    if (kq > best && kq < 60) { best = kq; ZONE = z; }
  }
}
if (!ZONE) { console.log("SKIPPED — no served zone carries order columns and the source switches"); process.exit(3); }

const pw = await loadPlaywright();
const BASE = (defaultZoneUrl()).split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(async () => {
  let g = 0;
  while (g < 4000) { const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 6)); g += 1; }
  window.scrollTo(0, 0);
});
await p.waitForTimeout(500);
console.log(`— ${ZONE} —`);

const openRail = () => p.evaluate(() => { const r = document.getElementById("rail"); r.open = true; document.querySelectorAll(".rail details").forEach((d) => { d.open = true; }); });
await openRail();

// what every sampled line says now: text, chip ids, and whether it is bare
const SAMPLE = 160;
const lines = () => p.evaluate((n) => {
  const wbs = [...document.querySelectorAll("section.seg .he-text .wb:not(.kq)")].filter((w) => w.querySelector(":scope > .g"));
  const step = Math.max(1, Math.floor(wbs.length / n));
  const pick = wbs.filter((_, i) => i % step === 0).slice(0, n);
  return pick.map((w) => {
    const g = w.querySelector(":scope > .g");
    const chip = g.querySelector(".g-lic");
    const text = (chip ? g.textContent.replace(chip.textContent, "") : g.textContent).trim();
    return { idx: [...document.querySelectorAll("section.seg .he-text .wb:not(.kq)")].indexOf(w), text, bare: g.classList.contains("bare"), chipTitle: chip ? chip.title : "" };
  });
}, SAMPLE);
const before = await lines();

// F1 / F2 — throw the century shelf that holds the most chips
const thrown = await p.evaluate(() => {
  const row = document.querySelector('.rail .row[data-toggle="sources"]');
  row.querySelector('.shelve-opt[data-shelving="century"]').click();
  const shelves = [...row.querySelectorAll(".shelf")].filter((s) => s.dataset.shelf !== "no year given");
  shelves.sort((a, b) => b.querySelectorAll(".dfp").length - a.querySelectorAll(".dfp").length);
  const sh = shelves[0];
  if (!sh) return null;
  sh.querySelector(".shelf-sw").click();
  return { shelf: sh.dataset.shelf, ids: [...(window.__sourcesOff || [])] };
});
const t0 = Date.now(); await p.waitForFunction(() => window.__livePending === 0, null, { timeout: 600000 }); await p.waitForTimeout(300); const settledIn = Date.now() - t0;
const underShelf = await lines();
// the card for each sampled word: open it and read its first pill
const cardFirst = async (idx) => p.evaluate(async (i) => {
  const w = [...document.querySelectorAll("section.seg .he-text .wb:not(.kq)")][i];
  w.scrollIntoView({ block: "center" });
  (w.querySelector(".w span") || w.querySelector(".w")).click();
  const t0 = Date.now();
  while (Date.now() - t0 < 4000) {
    const pill = document.querySelector("#hud .r-pills button");
    const none = document.querySelector("#hud .b-read .kq-role, #hud .b-read .sources-withheld");
    if (pill || (none && !document.querySelector("#hud .r-pills"))) break;
    await new Promise((r) => setTimeout(r, 60));
  }
  const pill = document.querySelector("#hud .r-pills button");
  const text = pill ? pill.textContent.replace(/\s+/g, " ").trim() : null;
  const count = document.querySelectorAll("#hud .r-pills button").length;
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await new Promise((r) => setTimeout(r, 80));
  return { text, count };
}, idx);
let bareWithReadings = 0, differs = 0, looked = 0;
const eg = [];
for (const l of underShelf.slice(0, 60)) {
  const c = await cardFirst(l.idx);
  looked += 1;
  if (l.bare && c.count > 0) { bareWithReadings += 1; if (eg.length < 3) eg.push(`bare over ${c.count} readings`); }
  if (!l.bare && c.text && !c.text.startsWith(l.text.slice(0, Math.min(12, l.text.length))) && !l.text.startsWith(c.text.slice(0, 12))) { differs += 1; if (eg.length < 3) eg.push(`line "${l.text.slice(0, 24)}" · card "${c.text.slice(0, 24)}"`); }
}
check(`F1  with the ${thrown ? thrown.shelf : "?"} shelf thrown, no line is bare while its card has readings`, bareWithReadings === 0, `${bareWithReadings} of ${looked} · the page settled in ${(settledIn / 1000).toFixed(1)} s${eg.length ? ` · ${eg.join(" | ")}` : ""}`);
check("F1  and each line says what its card's first pill says", differs === 0, `${differs} of ${looked} differ`);
const offChips = await p.evaluate(() => {
  const off = new Set(window.__sourcesOff || []);
  const row = document.querySelector('.rail .row[data-toggle="sources"]');
  const offLabels = new Set();
  for (const btn of row.querySelectorAll(".dfp[data-ids]")) if (btn.dataset.ids.split(" ").every((id) => off.has(id))) {
    const open = btn.parentElement.querySelector(".src-open");
    for (const line of (open.title || "").split("\n")) { const m = line.match(/^M\d+ (.+)$/); if (m) offLabels.add(m[1]); }
  }
  let n = 0; const eg = [];
  for (const chip of document.querySelectorAll("section.seg .he-text .wb:not(.kq) > .g .g-lic")) {
    const who = chip.title.split("\n").map((l) => l.replace(/^[^—]*— /, "").split(" · ")[0].split(" — ")[0].trim());
    const head = chip.title.split(" · ")[0].split(" — ")[0].trim();
    if (offLabels.has(head) || who.some((w) => offLabels.has(w))) { n += 1; if (eg.length < 2) eg.push(head.slice(0, 40)); }
  }
  return { n, eg, labels: offLabels.size };
});
check("F2  no chip on a line names a source that is switched off", offChips.n === 0, `${offChips.n} chips · ${offChips.eg.join(" | ")} · ${offChips.labels} labels off`);

// F5 — back on
await p.evaluate(() => { const row = document.querySelector('.rail .row[data-toggle="sources"]'); for (const s of row.querySelectorAll('.shelf-sw[aria-checked="false"], .shelf-sw[aria-checked="mixed"]')) { s.click(); if (s.getAttribute("aria-checked") !== "true") s.click(); } });
await p.waitForTimeout(1500);
const after = await lines();
const same = before.every((l, i) => after[i] && after[i].text === l.text && after[i].bare === l.bare);
check("F5  switched back on, every sampled line is what it was", same, same ? `${before.length} lines` : `first difference: "${(before.find((l, i) => !after[i] || after[i].text !== l.text) || {}).text}"`);

// F3 — under "characters", switch off the source leading most of that column
const f3 = await p.evaluate(async () => {
  const row = document.querySelector('.rail .row[data-toggle="order"]');
  const btn = row && [...row.querySelectorAll(".dfp")].find((x) => /characters/i.test(x.textContent));
  if (!btn) return null;
  btn.click();
  await new Promise((r) => setTimeout(r, 800));
  // the source whose chip is most common on lines right now
  const count = new Map();
  for (const chip of document.querySelectorAll("section.seg .he-text .wb:not(.kq) > .g .g-lic")) {
    const head = chip.title.split(" · ")[0].split(" — ")[0].trim();
    count.set(head, (count.get(head) || 0) + 1);
  }
  const [label] = [...count].sort((a, b) => b[1] - a[1])[0] || [];
  const srow = document.querySelector('.rail .row[data-toggle="sources"]');
  let pressed = null;
  for (const b of srow.querySelectorAll(".dfp[data-ids]")) {
    const open = b.parentElement.querySelector(".src-open");
    if ((open.title || "").split("\n").some((l) => l.replace(/^M\d+ /, "") === label)) { b.click(); pressed = label; break; }
  }
  return { label, pressed };
});
await p.waitForFunction(() => window.__livePending === 0, null, { timeout: 600000 }); await p.waitForTimeout(300);
const f3n = f3 && f3.pressed ? await p.evaluate((label) => [...document.querySelectorAll("section.seg .he-text .wb:not(.kq) > .g .g-lic")].filter((c) => c.title.split(" · ")[0].split(" — ")[0].trim() === label).length, f3.pressed) : -1;
check("F3  under an order column, a switched-off source leaves every line it led", f3 && f3.pressed && f3n === 0, f3 ? `${f3.pressed ? f3.pressed.slice(0, 40) : "no source pressed"} · ${f3n} chips still name it` : "no characters order on this page");

// F4 — pairs repaint with the order
const f4 = await p.evaluate(() => {
  const z = window.__zone;
  if (!z) return null;
  const out = { pairs: 0, stale: 0, eg: "" };
  for (const w of document.querySelectorAll("section.seg .he-text .wb.kq")) {
    const g = w.querySelector(":scope > .g"); if (!g) continue;
    const chip = g.querySelector(".g-lic");
    const text = (chip ? g.textContent.replace(chip.textContent, "") : g.textContent).trim();
    const halves = [...w.querySelectorAll(".wr")];
    const i = halves.findIndex((h) => h.classList.contains("backs-en"));
    if (i < 0 || !text) continue;
    out.pairs += 1;
    // the key of the half the line reads, from the page's own drawn record
    const secEl = w.closest("section.seg");
    const words = (z.sections.find((s) => String(s.id) === secEl.dataset.id || s.label === secEl.dataset.label) || {}).words || [];
    const rec = words.find((x) => x.kq && x.s === w.querySelector(".w").textContent.replace(/⁘/g, ""));
    if (!rec) continue;
    const regs = rec.w.filter((r) => !String(r.s || r.k).includes("\u05be"));
    const want = z.gloss[regs[i].k];
    if (want && want.split("/").join(" + ").replace(/\s+/g, " ").trim() !== text.replace(/\s+/g, " ").trim() && !text.includes(want.split("/")[0].trim())) { out.stale += 1; if (!out.eg) out.eg = `${text.slice(0, 20)} vs ${want.slice(0, 20)}`; }
  }
  return out;
});
check("F4  under an order, each pair's line reads what the table now says for its half", f4 && f4.stale === 0, f4 ? `${f4.pairs} pairs · ${f4.stale} stale${f4.eg ? ` · ${f4.eg}` : ""}` : "the page exposes no zone to compare against");

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall green");
process.exit(bad ? 1 : 0);
