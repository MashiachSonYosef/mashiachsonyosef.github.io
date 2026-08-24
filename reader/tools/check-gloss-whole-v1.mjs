#!/usr/bin/env node
// The reading under a word is shown whole, in both readers, and the page does
// not move while it is being read.
// GUARDS: zone-gloss-rule-v4-reading-level-antiquity-1940-lastuary
//
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(defaultZoneUrl(), { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb .g");

// The book fills in as it is read: a section arrives as its number and a
// reserved height and builds when it comes within reach. A claim about the
// page not moving is a claim about a page that has finished arriving, so this
// reads it through first — otherwise a section settling two screens down is
// mistaken for the word under test having moved something.
await p.evaluate(async () => {
  let guard = 0;
  while (guard < 5000) {
    const next = document.querySelector("section.seg.seg-wait");
    if (!next) break;
    next.scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 8));
    guard += 1;
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 80));
});

const clip = () => p.evaluate(() => {
  const gs = [...document.querySelectorAll("section.seg .he-text .wb .g")].slice(0, 4000);
  let clipped = 0, longest = "";
  for (const g of gs) {
    if (g.scrollWidth > g.clientWidth + 1 || g.scrollHeight > g.clientHeight + 1) clipped++;
    const t = g.textContent.trim(); if (t.length > longest.length) longest = t;
  }
  const cs = getComputedStyle(gs[0]);
  return { n: gs.length, clipped, longest: longest.length, sample: longest.slice(0, 46),
           ellipsis: cs.textOverflow, clamp: cs.webkitLineClamp };
});

const he = await clip();
check("no reading under a word is cut off in the Hebrew reader", he.clipped === 0,
  `${he.clipped} of ${he.n} · longest shown is ${he.longest} chars, "${he.sample}…"`);
check("nothing is left ellipsising", he.clamp === "none", `line-clamp ${he.clamp}`);

// The page must not move while the reader works in it. Measured in document
// coordinates, not viewport ones — clicking scrolls the page, and a scroll is
// not a reflow.
const before = await p.evaluate(() => {
  return {
    laterSection: document.querySelectorAll("section.seg")[6].offsetTop,
    docHeight: document.body.scrollHeight,
  };
});
// find a word whose catalog holds a reading far longer than the one painted —
// otherwise this proves nothing
let grew = 0;
const wbs = await p.$$("section.seg .he-text .wb");
for (let i = 0; i < Math.min(wbs.length, 10); i++) {
  await wbs[i].click();
  await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
  await p.waitForTimeout(250);
  grew = await p.evaluate((i) => {
    const bs = [...document.querySelectorAll("#hud .r-pills button")];
    const g = [...document.querySelectorAll("section.seg .he-text .wb")][i].querySelector(".g");
    const now = g.textContent.trim().length;
    const longest = Math.max(...bs.map((b) => b.textContent.trim().length));
    return longest - now;
  }, i);
  if (grew > 40) { await p.evaluate(() => {
      const bs = [...document.querySelectorAll("#hud .r-pills button")];
      bs.sort((a, b) => b.textContent.length - a.textContent.length)[0].click();
    }); break; }
  await p.keyboard.press("Escape"); await p.waitForTimeout(80);
}
console.log(`  ..  worst case found: a reading ${grew} characters longer than the one painted`);
await p.waitForTimeout(400);
const after = await p.evaluate(() => {
  const g = [...document.querySelectorAll("section.seg .he-text .wb .g")].find((x) => x.style.height);
  return {
    laterSection: document.querySelectorAll("section.seg")[6].offsetTop,
    docHeight: document.body.scrollHeight,
    boxH: g ? Math.round(g.getBoundingClientRect().height) : 0,
    lockedTo: g ? Math.round(parseFloat(g.style.height)) : 0,
    text: g ? g.textContent.trim().length : 0,
    locked: !!g,
    title: g ? (g.title || "").length : 0,
  };
});
check("choosing a different reading does not move the Hebrew",
  after.laterSection === before.laterSection && after.docHeight === before.docHeight,
  `section 7 at ${before.laterSection} → ${after.laterSection}; page ${before.docHeight} → ${after.docHeight}`);
check("the word's box is fixed at the height it painted at",
  after.locked && after.boxH === after.lockedTo,
  `box held at ${after.boxH}px while its reading became ${after.text} chars`);
check("a chosen reading longer than the box is still reachable whole",
  after.title >= after.text, `title carries ${after.title} chars`);
await p.keyboard.press("Escape");

await p.click("#modeEn");
await p.waitForTimeout(600);
const en = await clip();
check("nor in the English reader", en.clipped === 0,
  `${en.clipped} of ${en.n} · longest ${en.longest} chars`);
{ const { mkdirSync } = await import("node:fs"); const { dirname: dn, join: jn } = await import("node:path"); const { fileURLToPath: fu } = await import("node:url"); const sh = jn(dn(fu(import.meta.url)), "..", "build", "shots"); mkdirSync(sh, { recursive: true }); await p.screenshot({ path: jn(sh, "gloss-whole-en.png") }); }
await p.click("#modeHe");
await p.waitForTimeout(500);
await p.evaluate(() => document.querySelector("section.seg").scrollIntoView({ block: "start" }));
await p.waitForTimeout(200);
{ const { mkdirSync } = await import("node:fs"); const { dirname: dn, join: jn } = await import("node:path"); const { fileURLToPath: fu } = await import("node:url"); const sh = jn(dn(fu(import.meta.url)), "..", "build", "shots"); mkdirSync(sh, { recursive: true }); await p.screenshot({ path: jn(sh, "gloss-whole-he.png") }); }
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
