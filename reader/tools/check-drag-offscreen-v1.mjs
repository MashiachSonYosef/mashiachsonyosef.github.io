#!/usr/bin/env node
// A card the reader drags may hang off the edge. A card the page placed may not.
// Either way the head stays reachable, because it is the only way back.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const W = 412, H = 915;
const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: W, height: H } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(defaultZoneUrl(), { waitUntil: "networkidle" });
await p.waitForSelector("section.seg");

const open = async (i = 0) => {
  // a word carrying a reading — a bare word opens no record to drag. And a
  // word standing behind the parked card is not a word a finger can reach:
  // on a short poem the card the reader parked at the top covers the opening
  // lines, so the check does what a reader would — it takes the next word
  // that is clear of the card, scrolled to the middle of the window first.
  const wbs = await p.$$("section.seg .he-text .wb:has(.g:not(.bare))");
  const covered = (h) => h.evaluate((e) => {
    const hud = document.getElementById("hud");
    if (!hud || hud.hidden) return false;
    const r = e.getBoundingClientRect(), c = hud.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    return x >= c.left && x <= c.right && y >= c.top && y <= c.bottom;
  });
  let target = null;
  for (let j = i; j < wbs.length; j += 1) {
    await wbs[j].evaluate((e) => e.scrollIntoView({ block: "center" }));
    await p.waitForTimeout(80);
    if (!(await covered(wbs[j]))) { target = wbs[j]; break; }
  }
  if (!target) throw new Error("no reachable word clear of the parked card");
  await target.click();
  await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
  await p.waitForTimeout(400);
};
const box = () => p.evaluate(() => {
  const h = document.getElementById("hud"), r = h.getBoundingClientRect();
  return { t: Math.round(r.top), l: Math.round(r.left), b: Math.round(r.bottom), r: Math.round(r.right),
           w: Math.round(r.width), h: Math.round(r.height), moved: h.classList.contains("moved") };
});
const dragBy = async (dx, dy) => {
  const head = await p.$("#hud .head");
  if (!head) throw new Error("the card closed while being dragged");
  const hb = await head.boundingBox();
  // grab a point that is actually on screen, wherever the card is parked
  const x = Math.max(8, Math.min(W - 8, hb.x + hb.width / 2));
  const y = Math.max(8, Math.min(H - 8, hb.y + hb.height / 2));
  await p.mouse.move(x, y);
  await p.mouse.down();
  await p.mouse.move(x + dx, y + dy, { steps: 10 });
  await p.mouse.up();
  await p.waitForTimeout(150);
};

// ---- placed by the page: whole card on screen ----
await open(0);
const placed = await box();
check("a card the page placed is kept whole on screen",
  placed.t >= 0 && placed.l >= 0 && placed.b <= H + 1 && placed.r <= W + 1,
  `${placed.l},${placed.t} → ${placed.r},${placed.b}`);

// ---- dragged hard right: allowed to hang off ----
await dragBy(600, 0);
const right = await box();
check("dragged right, it may hang off the right edge", right.r > W, `right edge at ${right.r} of ${W}`);
check("and enough stays on to grab it back", W - right.l >= 40, `${W - right.l}px still on screen`);

// ---- dragged hard left ----
await dragBy(-900, 0);
const left = await box();
check("dragged left, it may hang off the left edge", left.l < 0, `left edge at ${left.l}`);
check("and enough stays on to grab it back", left.r >= 40, `${left.r}px still on screen`);

// ---- dragged down: allowed to hang below the fold ----
await dragBy(500, 700);
const down = await box();
check("dragged down, it may hang below the fold", down.b > H, `bottom at ${down.b} of ${H}`);
check("but the head stays reachable", down.t >= 0 && down.t <= H - 40, `top at ${down.t}`);

// ---- dragged up: the head is not allowed off the top ----
await dragBy(0, -900);
const up = await box();
check("it cannot be pushed off the top, where the handle would be lost", up.t >= 0, `top at ${up.t}`);

// ---- it stays where it was put, through a reading switch and another word ----
const parked = await box();
const pills = await p.$$("#hud .r-pills button");
if (pills.length > 1) await pills[1].click();
await p.waitForTimeout(250);
const afterPill = await box();
check("switching reading leaves it parked", afterPill.t === parked.t && afterPill.l === parked.l,
  `${parked.l},${parked.t} → ${afterPill.l},${afterPill.t}`);
await open(4);
const afterWord = await box();
check("opening another word leaves it parked", afterWord.l === parked.l, `left ${parked.l} → ${afterWord.l}`);

// ---- closing gives the whole-card rule back ----
await p.keyboard.press("Escape");
await p.waitForTimeout(150);
await open(1);
const reopened = await box();
check("after closing, the next card is placed whole on screen again",
  reopened.t >= 0 && reopened.l >= 0 && reopened.b <= H + 1 && reopened.r <= W + 1 && !reopened.moved,
  `${reopened.l},${reopened.t} → ${reopened.r},${reopened.b}`);

{ const { mkdirSync } = await import("node:fs"); const { dirname: dn, join: jn } = await import("node:path"); const { fileURLToPath: fu } = await import("node:url"); const sh = jn(dn(fu(import.meta.url)), "..", "build", "shots"); mkdirSync(sh, { recursive: true }); await p.screenshot({ path: jn(sh, "drag-offscreen.png") }); }
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
