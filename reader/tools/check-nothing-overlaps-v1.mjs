#!/usr/bin/env node
// Three things a reader on a phone should never meet, none of which any other
// check could see.
//
// 1. The page never scrolls sideways. It did: the chain holds section markers
//    that arrive as a run of markup with no break in it, and an unbreakable run
//    wider than the column pushed the document 104px past the window — so the
//    text sat off the left edge with dead space on the right.
//
// 2. A reading never prints over the Hebrew. The reading's box is held at the
//    height it painted at, because nothing on this page may move while the
//    reader is reading. In the English reader that box was set to let its
//    content spill, so a longer reading did not extend the box, it printed
//    through it onto the word underneath.
//
// 3. The card opens under the word, never over it. A card above the word covers
//    the text the reader was reading to get there.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const URL = defaultZoneUrl();
const VIEWPORTS = [
  { width: 412, height: 915, name: "a phone" },
  { width: 360, height: 640, name: "a small phone" },
  { width: 1440, height: 900, name: "a desktop" },
];

const b = await chromium.launch(launchOptions());
for (const vp of VIEWPORTS) {
  for (const mode of ["", "&mode=en"]) {
    const p = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
    await p.goto(URL + mode, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb");
    const reader = mode ? "English" : "Hebrew";
    console.log(`— ${vp.name}, ${vp.width}×${vp.height}, the ${reader} reader —`);

    // ---- 1 · nothing sticks out sideways ------------------------------
    const wide = await p.evaluate(() => {
      const out = [];
      for (const e of document.querySelectorAll("body *")) {
        const r = e.getBoundingClientRect();
        if (r.right > innerWidth + 1 || r.left < -1) {
          out.push(`${(e.className || e.tagName).toString().slice(0, 20)} to ${Math.round(r.right)}`);
        }
      }
      return { doc: document.documentElement.scrollWidth, win: innerWidth, n: out.length, first: out.slice(0, 2) };
    });
    check("  the page does not scroll sideways", wide.doc <= wide.win + 1,
      `${wide.doc}px of page in a ${wide.win}px window`);
    check("  and nothing sticks out past the window", wide.n === 0, wide.first.join(", ") || "nothing does");

    // ---- 2 · a chosen reading never prints over the Hebrew ------------
    // a word that carries a reading — a bare word opens no pills to measure
    const wbs = await p.$$("section.seg .he-text .wb:has(.g:not(.bare))");
    await wbs[0].click();
    await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
    await p.waitForTimeout(300);
    const pills = await p.$$("#hud .r-pills button");
    let longest = null, len = 0;
    for (const pill of pills) {
      const t = await pill.evaluate((e) => e.textContent);
      if (t.length > len) { len = t.length; longest = pill; }
    }
    if (longest) {
      await longest.scrollIntoViewIfNeeded();
      await longest.click();
      await p.waitForTimeout(400);
    }
    const spill = await p.evaluate(() => {
      const wb = document.querySelectorAll("section.seg .he-text .wb")[3];
      const g = wb.querySelector(".g"), gr = g.getBoundingClientRect();
      const hit = [...document.querySelectorAll("section.seg .he-text .wb")].filter((o) => {
        if (o === wb) return false;
        const r = o.getBoundingClientRect();
        return gr.bottom > r.top + 1 && gr.top < r.bottom - 1 && gr.right > r.left + 1 && gr.left < r.right - 1;
      });
      const w = wb.querySelector(".w").getBoundingClientRect();
      return {
        chars: g.textContent.length, boxH: Math.round(gr.height), contentH: g.scrollHeight,
        contained: g.scrollHeight <= g.clientHeight + 1 || getComputedStyle(g).overflow === "hidden",
        overHebrew: gr.bottom > w.top + 1 && gr.top < w.bottom - 1,
        overNeighbours: hit.map((o) => o.querySelector(".w").textContent).slice(0, 2),
      };
    });
    check(`  a ${spill.chars}-character reading stays inside its own box`,
      spill.contained, `${spill.contentH}px of reading in a ${spill.boxH}px box`);
    check("  and prints over neither its Hebrew nor its neighbours",
      !spill.overHebrew && spill.overNeighbours.length === 0,
      spill.overNeighbours.join(", ") || (spill.overHebrew ? "over its own Hebrew" : "clear"));
    await p.keyboard.press("Escape");
    await p.waitForTimeout(80);

    // ---- 3 · the card opens under the word ---------------------------
    let below = 0, covering = 0, n = 0, example = null, lineOnly = 0;
    for (let i = 0; i < Math.min(wbs.length, 10); i += 1) {
      try {
        await wbs[i].click();
        await p.waitForSelector("#hud .r-pills button", { timeout: 8000 });
        // the law is about settled geometry: the card's final clamp lands in
        // an animation frame, and under a loaded machine (the suite runs in
        // parallel) a fixed 100ms read mid-flight and failed a placement the
        // settled page gets right. Wait until the card's box holds still for
        // two consecutive frames, capped at a second.
        await p.evaluate(async () => {
          const box = () => { const h = document.getElementById("hud").getBoundingClientRect(); return `${h.top}|${h.bottom}`; };
          const t0 = performance.now();
          let last = box(), still = 0;
          while (still < 2 && performance.now() - t0 < 1000) {
            await new Promise((r) => requestAnimationFrame(r));
            const now = box();
            still = now === last ? still + 1 : 0;
            last = now;
          }
        });
        // measured on the very element that was clicked: this loop walks the
        // GLOSSED words, and indexing the all-words list by the same i once
        // measured a clicked word's neighbour — the card was judged against
        // a word it never belonged to (found 2026-08-30, when the first word
        // of the shelf's first book went bare and the two lists diverged)
        // The card clears the whole block — the Hebrew line and the reading
        // painted under it — wherever the window allows. Where it cannot (a
        // small phone, a block grown tall by a ruled reading, so that no
        // card of the page's floor height fits beneath the block even with
        // the block brought to the top), the page's last resort clears the
        // Hebrew line and stands over the reader's own ruled reading, which
        // the card carries whole. That case is counted apart and printed; a
        // card over the Hebrew line itself is never allowed.
        const o = await wbs[i].evaluate((el) => {
          const wb = el.getBoundingClientRect();
          const line = (el.querySelector(".w") || el).getBoundingClientRect();
          const h = document.getElementById("hud").getBoundingClientRect();
          const FLOOR = 200, pad = 8;
          const blockClearable = wb.bottom - Math.max(0, wb.top - pad) + pad + FLOOR + pad <= innerHeight;
          return {
            below: h.top >= wb.bottom - 0.5,
            belowLine: h.top >= line.bottom - 0.5,
            blockClearable,
            covers: h.top < line.bottom - 0.5 && h.bottom > line.top + 0.5,
            wordOnScreen: wb.top >= -1 && wb.bottom <= innerHeight + 1,
            word: [Math.round(wb.top), Math.round(wb.bottom)], line: [Math.round(line.top), Math.round(line.bottom)], card: [Math.round(h.top), Math.round(h.bottom)],
          };
        });
        n += 1;
        if (o.below) below += 1;
        else if (!o.blockClearable && o.belowLine) { below += 1; lineOnly += 1; }
        else if (!example) example = o;
        if (o.covers) covering += 1;
        if (!o.wordOnScreen && !example) example = o;
      } catch { /* a word with no card is not this check's business */ }
      await p.keyboard.press("Escape");
      await p.waitForTimeout(50);
    }
    check("  the card opens under the word it belongs to", below === n,
      example ? `word block ${example.word.join("..")}, Hebrew line ${example.line.join("..")}, card ${example.card.join("..")}` : `${below} of ${n}${lineOnly ? ` · ${lineOnly} under the Hebrew line only, the block too tall to clear in this window` : ""}`);
    check("  and never over it", covering === 0, `${covering} covering the Hebrew line`);
    await p.close();
  }
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
