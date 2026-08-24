#!/usr/bin/env node
// A layout and behaviour check for the two things asked for: the card holds
// still while the reader works inside it and can be moved by hand, and the
// section's three acts sit at three different weights.
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
const SKIP_LABEL = "check-levels-v1";
// A check about commentary needs a work that carries some. When none is
// served, that is a fact about the corpus and not a defect in the reader, so
// this says so and stops rather than failing every assertion against a page
// with nothing on it.
{
  const { zonesWithCommentary } = await import("./zones-on-disk-v1.mjs");
  if (!zonesWithCommentary().length) {
    console.log(`SKIPPED — no served work carries a commentary sidecar, so ${SKIP_LABEL} has nothing to open`);
    process.exit(3);
  }
}


// The book fills in as it is read: a section arrives as its number and a
// reserved height, and builds when it comes within reach. A claim about every
// section is therefore a claim about a book somebody has read through, so this
// reads it through first — going to whatever is still waiting until nothing is.
const readThrough = async (p) => {
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
};
const { chromium } = pw;

const URL = defaultZoneUrl();
const shots = process.argv[3] || "/home/claude/k3/shots";
let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "  ok  " : "FAIL  "}${name}${detail ? "  ·  " + detail : ""}`);
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
page.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); failures += 1; });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector("section.seg", { timeout: 20000 });

await readThrough(page);

// ---- levels ----------------------------------------------------------
const levels = await page.evaluate(() => {
  const s = document.querySelector("section.seg");
  const bar = s.querySelector(".c-bar");
  const xp = s.querySelector(".xp-row");
  const seg = s.querySelector(".seg-row");
  const r = (el) => (el ? el.getBoundingClientRect() : null);
  return {
    hasBar: !!bar, hasXp: !!xp,
    barText: bar ? bar.innerText.replace(/\s+/g, " ").trim() : "",
    segBottom: r(seg)?.bottom, barTop: r(bar)?.top, barW: r(bar)?.width,
    xpTop: r(xp)?.top, secW: r(s)?.width,
    xpW: [...s.querySelectorAll(".xp-row .xp")].map((c) => Math.round(c.getBoundingClientRect().width)),
    barInsideSegRow: !!(seg && bar && seg.contains(bar)),
    // no control on this page writes to a clipboard: copying is the reader's
    // act, so the site never hands text over on a press
    clipboardControls: document.querySelectorAll(".cp, .cp-row").length,
    sections: document.querySelectorAll("section.seg").length,
    sectionsWithXp: [...document.querySelectorAll("section.seg")]
      .filter((x) => x.querySelector(".xp-row")).length,
    heBottom: r(s.querySelector(".he-text"))?.bottom,
    slotAfterBar: (() => { const sl = s.querySelector(".c-slot"); return !!sl && !!bar &&
      (bar.compareDocumentPosition(sl) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0; })(),
    slotBeforeExport: (() => { const sl = s.querySelector(".c-slot"); return !!sl && !!xp &&
      (sl.compareDocumentPosition(xp) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0; })(),
  };
});
check("the commentary has a line of its own", levels.hasBar && !levels.barInsideSegRow, levels.barText);
check("the commentary line is the width of the column",
  levels.barW > levels.secW * 0.9, `${Math.round(levels.barW)} of ${Math.round(levels.secW)}`);
check("the commentary line sits at the foot, under the text it belongs to",
  levels.barTop >= levels.heBottom, `line at ${Math.round(levels.barTop)}, text ends ${Math.round(levels.heBottom)}`);
check("its text opens directly beneath the line, not at the end of the section",
  levels.slotAfterBar && levels.slotBeforeExport);
check("no control on the page writes to a clipboard", levels.clipboardControls === 0,
  `${levels.clipboardControls} found`);
check("the export sits under the commentary line, at the smaller weight",
  levels.hasXp && levels.xpTop >= levels.barTop && Math.max(...levels.xpW) < levels.barW / 2,
  `${Math.max(...levels.xpW)}px vs ${Math.round(levels.barW)}px`);
check("every section carries the export", levels.sectionsWithXp === levels.sections,
  `${levels.sectionsWithXp} of ${levels.sections}`);

// ---- the card holds still -------------------------------------------
await page.click("section.seg .he-text .wb");
await page.waitForSelector("#hud .r-pills button", { timeout: 20000 });
const before = await page.evaluate(() => {
  const h = document.getElementById("hud");
  return { top: h.style.top, left: h.style.left, h: h.offsetHeight };
});
// switch reading — the card used to be re-anchored here, for a height it no
// longer had, which is what made it feel shifty
const pills = await page.$$("#hud .r-pills button");
if (pills.length > 1) await pills[1].click();
await page.waitForTimeout(120);
const afterPill = await page.evaluate(() => {
  const h = document.getElementById("hud");
  return { top: h.style.top, left: h.style.left, h: h.offsetHeight };
});
check("switching reading does not move the card",
  before.top === afterPill.top && before.left === afterPill.left,
  `${before.top}/${before.left} → ${afterPill.top}/${afterPill.left}`);

// open the records drawer, same test
const more = await page.$("#hud .d-more");
if (more) { await more.click(); await page.waitForTimeout(120); }
const afterDrawer = await page.evaluate(() => {
  const h = document.getElementById("hud");
  const r = h.getBoundingClientRect();
  return { top: h.style.top, left: h.style.left, bottom: r.bottom, right: r.right, t: r.top, l: r.left };
});
check("opening the records drawer does not move the card",
  afterPill.top === afterDrawer.top && afterPill.left === afterDrawer.left,
  `${afterPill.top} → ${afterDrawer.top}`);
check("the card is still fully on screen",
  afterDrawer.t >= 0 && afterDrawer.l >= 0 &&
  afterDrawer.bottom <= 915 + 1 && afterDrawer.right <= 412 + 1,
  `top ${Math.round(afterDrawer.t)} bottom ${Math.round(afterDrawer.bottom)}`);

// ---- the reader can move it -----------------------------------------
const head = await page.$("#hud .head");
const hb = await head.boundingBox();
await page.mouse.move(hb.x + hb.width / 2 - 30, hb.y + hb.height / 2);
await page.mouse.down();
await page.mouse.move(hb.x + hb.width / 2 - 30, hb.y + hb.height / 2 - 120, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(80);
const moved = await page.evaluate(() => {
  const h = document.getElementById("hud");
  const r = h.getBoundingClientRect();
  return { top: h.style.top, moved: h.classList.contains("moved"), t: r.top, b: r.bottom, l: r.left, rr: r.right };
});
check("the reader can move the card", moved.moved && moved.top !== afterDrawer.top,
  `${afterDrawer.top} → ${moved.top}`);
// A moved card is the reader's: it may hang off an edge if they put it there.
// What must hold is that it can always be grabbed back — the head on screen,
// and at least a strip of the card within reach. Hanging off is checked on its
// own in check-drag-offscreen-v1.mjs.
check("a moved card can still be grabbed back",
  moved.t >= 0 && moved.t <= 915 - 40 && moved.rr >= 40 && moved.l <= 412 - 40,
  `top ${Math.round(moved.t)}, ${Math.round(Math.min(moved.rr, 412) - Math.max(moved.l, 0))}px of it on screen`);

// once moved, it stays put even when the reader opens another word
const wbs = await page.$$("section.seg .he-text .wb");
await wbs[3].click();
await page.waitForTimeout(400);
// The card must not be re-anchored to the new word. It may still be pulled
// back into view when the new record is taller than the last — that is the
// clamp, not the anchor, and it shows as the card sitting on the bottom edge
// rather than beside the word that was tapped.
const afterOther = await page.evaluate(() => {
  const h = document.getElementById("hud");
  const r = h.getBoundingClientRect();
  return { top: h.style.top, h: h.offsetHeight, bottom: Math.round(r.bottom),
           moved: h.classList.contains("moved") };
});
const heldStill = afterOther.top === moved.top;
const onlyClamped = afterOther.bottom >= 915 - 9 && afterOther.bottom <= 915 - 7;
check("a card the reader moved is not dragged back to a word",
  afterOther.moved && (heldStill || onlyClamped),
  heldStill ? `held at ${moved.top}`
            : `clamped to the edge, ${moved.top} → ${afterOther.top}, card grew to ${afterOther.h}px`);

// closing gives the anchoring back
await page.keyboard.press("Escape");
await page.waitForTimeout(80);
const cleared = await page.evaluate(() => document.getElementById("hud").classList.contains("moved"));
check("closing releases the reader's hold", !cleared);

// ---- the commentary opens in place, not in a card --------------------
await page.click("section.seg .c-bar");
await page.waitForTimeout(400);
const cm = await page.evaluate(() => {
  const s = document.querySelector("section.seg");
  const p = s.querySelector(".c-inline");
  const r = p ? p.getBoundingClientRect() : null;
  const bar = s.querySelector(".c-bar").getBoundingClientRect();
  return {
    card: !document.getElementById("hud").hidden,
    expanded: s.querySelector(".c-bar")?.getAttribute("aria-expanded"),
    shown: !!p && !p.hidden,
    words: s.querySelectorAll(".c-inline .wb").length,
    lab: p ? p.querySelector(".lab")?.innerText.replace(/\s+/g, " ").trim() : "",
    licence: !!(p && p.querySelector(".lab .lic-chip")),
    basis: p ? (p.querySelector(".c-att")?.textContent || "").replace(/\s+/g, " ").trim() : "",
    belowBar: !!r && r.top >= bar.top,
    insideSection: !!p && s.contains(p),
  };
});
check("a section's commentary opens in place, not in a card", cm.shown && !cm.card && cm.insideSection);
check("it sits under the section it comments on", cm.belowBar && cm.expanded === "true", `${cm.words} words`);
check("it carries its reference and licence in place", cm.licence && cm.lab.length > 10, cm.lab);
// It says in English what a commentary is and why this one stands here, and it
// prints the chain's own word for that reason underneath. A sentence with no
// basis under it is a claim; a basis with no sentence over it is a token.
check("it says what a commentary is and why this one is here",
  /a work of its own/i.test(cm.basis) && /SEALED_UNIT_COORDINATE_IDENTITY/.test(cm.basis),
  cm.basis.slice(0, 90) + "…");

// the same line closes it again
await page.click("section.seg .c-bar");
await page.waitForTimeout(200);
const cmOff = await page.evaluate(() => {
  const s = document.querySelector("section.seg");
  return { hidden: s.querySelector(".c-inline").hidden, expanded: s.querySelector(".c-bar").getAttribute("aria-expanded") };
});
check("the same line closes it", cmOff.hidden && cmOff.expanded === "false");

// the book-level button turns every one of them on
const layer = await page.$("#layerC");
if (layer) {
  await layer.click();
  await page.waitForTimeout(900);
  const all = await page.evaluate(() => {
    const ps = [...document.querySelectorAll(".c-inline")];
    const bars = [...document.querySelectorAll(".c-bar")];
    return { total: ps.length, shown: ps.filter((p) => !p.hidden).length,
      sections: document.querySelectorAll("section.seg").length,
      barsOn: bars.filter((b) => b.getAttribute("aria-expanded") === "true").length };
  });
  check("the book-level button turns on every section's commentary",
    all.shown === all.total && all.total >= all.sections, `${all.shown} of ${all.total} over ${all.sections} sections`);
  check("and the section lines agree with it", all.barsOn === all.sections, `${all.barsOn} of ${all.sections}`);
}

await page.screenshot({ path: `${shots}/levels-hud.png` });
await page.keyboard.press("Escape");
await page.screenshot({ path: `${shots}/levels-section.png` });
await browser.close();

console.log(failures ? `\n${failures} FAILED` : "\nall checks passed");
process.exit(failures ? 1 : 0);
