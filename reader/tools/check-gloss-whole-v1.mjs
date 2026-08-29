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
// A glossed word, wherever it stands: the first word of a book can be one
// the store has nothing for — the Aramaic Targum to Ruth opens on such a
// word — and waiting on it declares an honest bare form a broken page.
await p.waitForSelector("section.seg .he-text .wb .g:not(.bare)");

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

// The page must not re-wrap while the reader works in it — and a reader who
// RULES a longer reading is owed the whole of it. The old resolution froze
// the box at first-paint height and let the hover title carry the tail, and
// the owner met the result on a phone, where nothing hovers: his own ruling
// clipped to "both…" — the one reading on the page the page refused to
// show. The law now (owner, 2026-08-29): shown whole outranks held still.
// The box grows by whole lines — a reading costs its own word a few lines,
// never the reader the reading — its width stays held so nothing re-wraps
// beside it, and the vertical room it takes is the lawful cost.
const before = await p.evaluate(() => ({
  docWidth: document.documentElement.scrollWidth,
  docHeight: document.body.scrollHeight,
}));
// find a word whose catalog holds a reading far longer than the one painted —
// otherwise this proves nothing
let grew = 0, ruledIx = -1;
// Only a word that carries a reading has a record to open — a bare word is
// the store's honest silence, and waiting for its pills declares it broken.
const wbs = await p.$$("section.seg .he-text .wb:has(.g:not(.bare))");
for (let i = 0; i < Math.min(wbs.length, 10); i++) {
  await wbs[i].click();
  await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
  await p.waitForTimeout(250);
  grew = await p.evaluate((i) => {
    const bs = [...document.querySelectorAll("#hud .r-pills button")];
    const g = [...document.querySelectorAll("section.seg .he-text .wb:has(.g:not(.bare))")][i].querySelector(".g");
    const now = g.textContent.trim().length;
    const longest = Math.max(...bs.map((b) => b.textContent.trim().length));
    return longest - now;
  }, i);
  if (grew > 40) { ruledIx = i; await p.evaluate(() => {
      const bs = [...document.querySelectorAll("#hud .r-pills button")];
      bs.sort((a, b) => b.textContent.length - a.textContent.length)[0].click();
    }); break; }
  await p.keyboard.press("Escape"); await p.waitForTimeout(80);
}
console.log(`  ..  worst case found: a reading ${grew} characters longer than the one painted`);
await p.waitForTimeout(400);
const after = await p.evaluate((i) => {
  const wb = [...document.querySelectorAll("section.seg .he-text .wb:has(.g:not(.bare))")][i];
  const g = wb ? wb.querySelector(".g") : null;
  return {
    docWidth: document.documentElement.scrollWidth,
    docHeight: document.body.scrollHeight,
    clipped: g ? g.scrollHeight > g.clientHeight + 1 || g.scrollWidth > g.clientWidth + 1 : true,
    widthHeld: !!(wb && wb.style.width),
    text: g ? g.textContent.trim().length : 0,
    title: g ? (g.title || "").length : 0,
  };
}, ruledIx);
check("the ruled reading is shown whole — the box grows to fit what the reader chose",
  ruledIx >= 0 && !after.clipped, `${after.text} chars, none clipped`);
check("its word's width is held, so nothing re-wraps beside it",
  after.widthHeld && after.docWidth === before.docWidth,
  `page ${before.docWidth}px wide → ${after.docWidth}px`);
check("the page grew only downward, the reading's own lawful cost",
  after.docHeight >= before.docHeight,
  `page ${before.docHeight} → ${after.docHeight}`);
check("and the whole reading still rides the box for any surface that asks",
  after.title >= after.text, `title carries ${after.title} chars`);
// after the ruling, the global law still holds everywhere: nothing on the
// page is clipped, the repainted occurrences included
const ruledSweep = await clip();
check("no reading anywhere is cut off after the ruling", ruledSweep.clipped === 0,
  `${ruledSweep.clipped} of ${ruledSweep.n}`);
await p.keyboard.press("Escape");

// The tether: an open card runs four faint lines back to the word it opened
// from, so the page says where you were working. It is an overlay — it must
// take no taps, and it must die with the card.
{
  const t = await p.evaluate(async () => {
    const wb = document.querySelector("section.seg .he-text .wb:has(.g:not(.bare))");
    wb.click();
    await new Promise((r) => setTimeout(r, 900));
    const svg = document.getElementById("tether");
    const open = svg && getComputedStyle(svg).display !== "none";
    const lines = svg ? svg.querySelectorAll("line").length : 0;
    const noTaps = svg && getComputedStyle(svg).pointerEvents === "none";
    const a = wb.getBoundingClientRect();
    const l0 = svg && svg.querySelector("line");
    const anchored = l0 && Math.abs(Number(l0.getAttribute("x1")) - a.left) < 2
      && Math.abs(Number(l0.getAttribute("y1")) - a.top) < 2;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const closed = getComputedStyle(svg).display === "none";
    return { open, lines, noTaps, anchored, closed };
  });
  check("an open card runs its tether back to the word", t.open && t.lines === 4 && t.anchored,
    `${t.lines} lines · anchored ${t.anchored}`);
  check("the tether takes no taps and dies with the card", t.noTaps && t.closed);
}

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
