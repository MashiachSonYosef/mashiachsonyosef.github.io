#!/usr/bin/env node
// GUARDS: parts-direction-rule-v1-the-first-part-of-a-hebrew-row-is-the-rightmost
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE FIRST PART IS THE RIGHTMOST PART.
//
// Wherever the page draws a form's parts in a row — the regions of a compound
// in the text, the cells of a division in a card, a joined pair — the part the
// record puts first is the part a reader's eye meets first, and in Hebrew that
// is the RIGHTMOST one. This has now been got wrong twice, both times the same
// way and both times invisibly: the row is written in reading order, the
// container is left to lay it out, and one container in the page runs
// left-to-right while its neighbour runs right-to-left. The two then disagree
// about the same division, and the pair reads backwards.
//
// A `dir="rtl"` attribute is NOT proof. The attribute was present the last
// time this went wrong; a later rule, a flex container, or an inherited
// direction had already decided otherwise. So this check asks the browser
// where each part actually landed, in pixels, and judges that.
//
//   L1  in every row of two or more Hebrew parts, the part first in the
//       document is the part furthest right on the screen
//   L2  no row of Hebrew parts is laid out left-to-right — measured, not
//       read off an attribute
//   L3  a row and the rows beside it agree: two rows of the same card do not
//       run in opposite directions
//
// What this does NOT prove: that the parts are the right parts (the store and
// the span checks judge that), or that a row of ENGLISH readings runs
// left-to-right, which is correct and is left alone.
//
// Run: node tools/check-parts-read-right-to-left-v1.mjs <served zone url>
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const URL_ARG = process.argv[2];
if (!URL_ARG || !/^https?:/u.test(URL_ARG)) { console.log("SKIPPED — needs a served zone url"); process.exit(3); }

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
await page.goto(URL_ARG, { waitUntil: "domcontentloaded", timeout: 60000 });
// A zone page draws its words from data, so wait for them. Any other served
// page — the door, a demonstration index — has its rows already; the law is
// about how a row is laid out, not about which page it is on.
const isZone = await page.evaluate(() => !!document.querySelector("section.seg") || !!document.querySelector('meta[name="reader-book"]'));
if (isZone) await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
else await page.waitForTimeout(1200);

// A ROW THAT IS NOT ON SCREEN IS NOT JUDGED, SO PRESS FIRST. The rows that
// went backwards last time only exist after a reader presses a word: the card
// draws them. A check that scans the page as loaded sees the text and calls it
// clean, which is exactly the reading that let this through twice. So this
// presses what a reader presses — a word of the text, then whatever the card
// offers as a further choice — and scans after every press, keeping every row
// it has ever seen.
const SCAN = () => page.evaluate(() => {
  const esc = (s) => [...String(s)].map((c) => (c.charCodeAt(0) > 0x400 ? "\\u" + c.charCodeAt(0).toString(16) : c)).join("");
  const HEB = /[\u0590-\u05ff]/u;
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const kids = [...el.children].filter((k) => k.getClientRects().length);
    if (kids.length < 2 || kids.length > 16) continue;
    const parts = kids.filter((k) => HEB.test(k.textContent || ""));
    if (parts.length < 2) continue;
    const boxes = parts.map((k) => k.getBoundingClientRect());
    if (Math.max(...boxes.map((r) => r.top)) - Math.min(...boxes.map((r) => r.top)) > 10) continue;  // wrapped: not one row
    const texts = parts.map((k) => esc((k.textContent || "").trim().replace(/\s+/g, " ")).slice(0, 22));
    const xs = boxes.map((r) => r.left);
    let rtl = true, ltr = true;
    for (let i = 1; i < xs.length; i += 1) {
      if (!(xs[i] < xs[i - 1])) rtl = false;
      if (!(xs[i] > xs[i - 1])) ltr = false;
    }
    out.push({
      where: `${el.tagName.toLowerCase()}.${String(el.className || "").split(/\s+/)[0] || "-"}`,
      parent: `${(el.parentElement || {}).tagName || ""}.${String((el.parentElement || {}).className || "").split(/\s+/)[0] || "-"}`.toLowerCase(),
      dirAttr: el.getAttribute("dir") || "(none)",
      computed: getComputedStyle(el).direction,
      texts, firstIsRightmost: xs[0] === Math.max(...xs), rtl, ltr,
    });
  }
  return out;
});

const rows = [], seen = new Set();
const keep = (found) => { for (const r of found) { const k = `${r.where}|${r.texts.join("|")}`; if (!seen.has(k)) { seen.add(k); rows.push(r); } } };
keep(await SCAN());

// what a reader can press: a word of the text, and anything a card offers as a
// further choice once it is open
const PRESSABLE = "section.seg .he-text .wb .w, section.seg .he-text .wb.mark, .pc-open, [data-open], .pc-pick, .pc-div";
for (let round = 0; round < 6; round += 1) {
  const n = await page.locator(PRESSABLE).count();
  if (!n) break;
  let pressed = false;
  for (let i = 0; i < Math.min(n, 12) && !pressed; i += 1) {
    const t = page.locator(PRESSABLE).nth(i);
    try {
      if (!(await t.isVisible())) continue;
      if (await t.getAttribute("data-checked-rtl")) continue;
      await t.evaluate((e) => e.setAttribute("data-checked-rtl", "1"));
      await t.scrollIntoViewIfNeeded({ timeout: 4000 });
      await t.click({ timeout: 6000 });
      pressed = true;
    } catch { /* something else is pressable */ }
  }
  if (!pressed) break;
  await page.waitForTimeout(650);
  keep(await SCAN());
}

if (!rows.length) { console.log("SKIPPED — this page drew no row of two or more Hebrew parts"); await b.close(); process.exit(3); }

const l1 = rows.filter((r) => !r.firstIsRightmost)
  .map((r) => `${r.where} in ${r.parent}: ${r.texts.join(" ")} — first part is not the rightmost (dir=${r.dirAttr}, computed ${r.computed})`);
check("L1  the part the record puts first is the part furthest right", l1.length === 0,
  l1.length ? `${l1.length} of ${rows.length} — ${few(l1)}` : `${rows.length} row(s) of parts, every one leading from the right`);

const l2 = rows.filter((r) => r.ltr && !r.rtl)
  .map((r) => `${r.where} in ${r.parent}: ${r.texts.join(" ")} — laid out left to right (dir=${r.dirAttr}, computed ${r.computed})`);
check("L2  no row of Hebrew parts is laid out left to right", l2.length === 0,
  l2.length ? `${l2.length} — ${few(l2)}` : "none");

// L3: two rows under one parent must not disagree about which way they run
const byParent = new Map();
for (const r of rows) {
  if (!r.rtl && !r.ltr) continue;
  const k = r.parent;
  if (!byParent.has(k)) byParent.set(k, new Set());
  byParent.get(k).add(r.rtl ? "rtl" : "ltr");
}
const l3 = [...byParent.entries()].filter(([, s]) => s.size > 1).map(([k]) => `${k} holds rows running both ways`);
check("L3  rows beside each other do not run in opposite directions", l3.length === 0,
  l3.length ? few(l3) : `${byParent.size} container(s), each consistent`);

if (errs.length) check("  no page error", false, errs[0].slice(0, 120));
await b.close();
console.log("\n  what this does not say: that the parts are the right parts, or anything about a row of");
console.log("  English readings, which runs left to right and is meant to.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
