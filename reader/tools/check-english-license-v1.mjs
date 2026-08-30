#!/usr/bin/env node
// The English and license reader: they never separate, even by a display
// degree — the owner's ruling, 2026-08-30.
// GUARDS: gloss-m-rule-v1-a-reading-shown-is-a-reading-licensed
//
// In the English reader, a gloss the baked table answers for wears its M's
// license inline. In the Hebrew reader the chip stays quiet (every license
// one tap away on the word's card). A chip never rides a copy — it is
// frame, not text. And a repaint under a ruling drops the baked chip with
// the text it rode on: an absent chip over a wrong one.
//
// Run: node tools/check-english-license-v1.mjs [zone-url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.context().grantPermissions(["clipboard-read", "clipboard-write"]);
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(defaultZoneUrl(), { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb .g:not(.bare)");

// 1 · Hebrew reader: chips exist in the DOM but stay quiet
const heMode = await p.evaluate(() => {
  const chips = [...document.querySelectorAll("section.seg .g .g-lic")];
  return { chips: chips.length,
    visible: chips.filter((c) => getComputedStyle(c).display !== "none").length };
});
check("the Hebrew reader keeps the chips quiet — licenses one tap away",
  heMode.chips > 0 && heMode.visible === 0,
  `${heMode.chips} chips carried, ${heMode.visible} showing`);

// 2 · English reader: every chip shows, and glossed words overwhelmingly wear one
await p.click("#modeEn");
await p.waitForTimeout(600);
const enMode = await p.evaluate(() => {
  const gs = [...document.querySelectorAll("section.seg .he-text .wb .g:not(.bare)")];
  const chipped = gs.filter((g) => { const c = g.querySelector(".g-lic");
    return c && getComputedStyle(c).display !== "none"; });
  const sample = chipped[0] ? { lic: chipped[0].querySelector(".g-lic").textContent,
    title: chipped[0].querySelector(".g-lic").title } : null;
  return { glossed: gs.length, chipped: chipped.length, sample };
});
check("in the English reader the license rides the reading",
  enMode.chipped > 0 && enMode.chipped >= enMode.glossed * 0.5,
  `${enMode.chipped} of ${enMode.glossed} glossed words wear their chip`);
check("the chip is a license name and the witness rides its hover",
  !!enMode.sample && enMode.sample.lic.length > 1 && /witness|licenses —|·/.test(enMode.sample.title),
  enMode.sample ? `${enMode.sample.lic} · ${enMode.sample.title.slice(0, 50)}` : "no chip to read");

// 3 · a copy never carries the chip: select a glossed word's English by
// triple-tap and read the clipboard — frame text stays out of copies
const copied = await p.evaluate(async () => {
  const g = [...document.querySelectorAll("section.seg .he-text .wb .g:not(.bare)")]
    .find((x) => { const c = x.querySelector(".g-lic"); return c && getComputedStyle(c).display !== "none"; });
  if (!g) return null;
  const lic = g.querySelector(".g-lic").textContent;
  const sel = window.getSelection(); sel.removeAllRanges();
  const range = document.createRange(); range.selectNodeContents(g);
  sel.addRange(range);
  document.execCommand("copy");
  const t = await navigator.clipboard.readText().catch(() => sel.toString());
  return { text: t, lic };
});
check("a copy carries the reading and never the chip",
  !!copied && !copied.text.includes(copied.lic),
  copied ? JSON.stringify(copied.text.slice(0, 60)) : "no chipped gloss to copy");

// 4 · a ruling repaints the line and the baked chip goes with it — an
// absent chip over a wrong one
await p.click("#modeHe");
await p.waitForTimeout(400);
const ruled = await p.evaluate(async () => {
  const wbs = [...document.querySelectorAll("section.seg .he-text .wb:has(.g:not(.bare))")].slice(0, 40);
  for (const wb of wbs) {
    wb.click();
    await new Promise((r) => setTimeout(r, 400));
    const pills = [...document.querySelectorAll("#hud .r-pills button")];
    const other = pills.find((x) => x.getAttribute("aria-pressed") !== "true");
    if (other) {
      other.click();
      await new Promise((r) => setTimeout(r, 500));
      const g = wb.querySelector(".g");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return { chip: !!g.querySelector(".g-lic"), text: g.textContent.trim().slice(0, 40) };
    }
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
  }
  return null;
});
check("a ruling repaints the line and the baked chip goes with it",
  !!ruled && ruled.chip === false, ruled ? `"${ruled.text}" · chip ${ruled.chip}` : "no second reading offered in forty words");

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
