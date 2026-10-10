#!/usr/bin/env node
// check-blob-precision-v1 · a blob holds its own ink, all of it, and no one else's
//
// GUARDS: blob-precision-rule-v1-a-blob-is-cut-to-the-ink-and-split-where-the-word-divides
// LEDGER: -
// no frame letter. This writes nothing: it reads the page.
//
// The owner, 2026-10-09, on Genesis 1:2: "we need these to be tight like
// splitting between characters and not cutting off tops of words", and,
// drawn over it, "see how its a flat line". Asked of the pixels, not of the
// page's own numbers: each cell is photographed with its Hebrew painted black
// on white and its blobs hidden, and every dark pixel is asked of the blob
// paths whether it lies inside one.
//
// B1  live run cells (the first book on the shelf, its first sections): every
//     ink pixel of a word that wears a blob lies inside a blob, and every
//     English letter likewise; no pixel lies inside two blobs except along a
//     seam they share
// B2  the split: a word whose English stands in pieces wears one blob per
//     piece, and its pieces' blobs stand over the English pieces in the same
//     order (no tie crosses another)
// B3  the reading's text is untouched: a run part set in pieces reads its
//     word's own line, character for character
// B4  under any naming (the record's ALL): as B1 and B2, with words split
// B5  the English reader: as B1
// B6  the preview of every word (?blobs=every): as B1 on lone words; and at
//     the default no lone word wears a blob (the live page draws on runs)
// B7  the cost: a redraw of every built blob stays under 4 ms a cell
// Every book and section is read off the served index, never typed.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { readFileSync } from "node:fs";
const PORT = process.env.SERVE_PORT || "8899";   // the runner serves 8899; a hand run says its own
let bad = 0;
const check = (name, ok, say) => { console.log(`${ok ? "  ok " : "FAIL "} ${name}${say ? `  ·  ${say}` : ""}`); if (!ok) bad += 1; };
const BOOK = Object.keys(JSON.parse(readFileSync("data/hud-runs/index.json", "utf8")).books).sort()[0];
const { chromium } = await loadPlaywright();
const b = await chromium.launch(launchOptions());
const CELLS = ".he-text .wjoin:has(> svg.wj-tie), .he-text > .wb.tied:has(> svg.wj-tie)";
const PASSES = {
  he: `.he-text .wjoin, .he-text .wjoin *, .he-text > .wb.tied, .he-text > .wb.tied * { background: #fff !important; border-color: transparent !important; outline: none !important; box-shadow: none !important; }
       .he-text .w, .he-text .w * { color: #000 !important; } .he-text .wjoin > .g, .he-text > .wb.tied > .g { visibility: hidden !important; } .he-text svg.wj-tie { visibility: hidden !important; }`,
  en: `.he-text .wjoin, .he-text .wjoin *, .he-text > .wb.tied, .he-text > .wb.tied * { background: #fff !important; border-color: transparent !important; outline: none !important; box-shadow: none !important; }
       .he-text .wjoin > .g, .he-text .wjoin > .g *, .he-text > .wb.tied > .g, .he-text > .wb.tied > .g * { color: #000 !important; } .he-text .wjoin .wj-ink, .he-text > .wb.tied > .w { visibility: hidden !important; }
       .he-text .g-lic, .he-text .g-sep, .he-text .g-pp { visibility: hidden !important; } .he-text svg.wj-tie { visibility: hidden !important; }`,
};
const run = async ({ runs, mode, every, sections }) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((runs) => { try { localStorage.setItem("fh.runs", runs); localStorage.setItem("fh.maqaf-join", "maqaf"); } catch { /* a device that remembers nothing still reads */ } }, runs);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`http://127.0.0.1:${PORT}/zone.html?b=${BOOK}${mode === "en" ? "&mode=en" : ""}${every ? "&blobs=every" : ""}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.evaluate(async (n) => { for (const s of [...document.querySelectorAll("section.seg")].slice(0, n)) { s.scrollIntoView(); await new Promise((x) => setTimeout(x, 60)); } window.scrollTo(0, 0); await new Promise((x) => setTimeout(x, 900)); }, sections);
  const tot = { cells: await p.$$eval(CELLS, (els) => els.length), he: { ink: 0, outside: 0, twice: 0 }, en: { ink: 0, outside: 0, twice: 0 }, worst: [] };
  // B2 and B3, read off the cells before they are painted for the pixels
  tot.split = await p.evaluate(() => {
    const out = { words: 0, wrongCount: 0, crossed: 0, textDiffers: 0, examples: [] };
    for (const cell of document.querySelectorAll(".he-text .wjoin, .he-text > .wb.tied")) {
      const paths = [...cell.querySelectorAll(":scope > svg.wj-tie > path[data-wi]")];
      const parts = cell.classList.contains("wjoin") ? [...cell.querySelectorAll(":scope > .g.parts > .g-part")] : [cell.querySelector(":scope > .g")].filter(Boolean);
      for (const part of parts) {
        const row = part.querySelector(":scope > .g-pcs"); if (!row) continue;
        const wi = cell.classList.contains("wjoin") ? part.dataset.wi : "0";
        const mine = paths.filter((x) => x.dataset.wi === wi).sort((x, y) => Number(x.dataset.piece) - Number(y.dataset.piece));
        const pcs = row.querySelectorAll(":scope > .g-pc").length;
        out.words += 1;
        if (mine.length !== pcs) { out.wrongCount += 1; if (out.examples.length < 3) out.examples.push(`${row.textContent}: ${mine.length} blobs for ${pcs} pieces`); continue; }
        const cx = (v) => { const [l, r] = v.split(",").map(Number); return (l + r) / 2; };
        for (let i = 0; i < mine.length - 1; i += 1) {
          const dh = cx(mine[i + 1].dataset.he) - cx(mine[i].dataset.he), de = cx(mine[i + 1].dataset.en) - cx(mine[i].dataset.en);
          if (Math.sign(dh) !== Math.sign(de)) { out.crossed += 1; if (out.examples.length < 3) out.examples.push(`${row.textContent}: pieces ${i} and ${i + 1} cross`); }
        }
        if (cell.classList.contains("wjoin")) {
          const wb = cell.querySelectorAll(":scope > .wj-ink > .wb")[Number(wi)];
          const g = wb && wb.querySelector(":scope > .g");
          const own = g ? [...g.childNodes].filter((n) => n.nodeType === 3).map((n) => n.data).join("").trim() : null;
          if (own !== null && own !== row.textContent.trim()) { out.textDiffers += 1; if (out.examples.length < 3) out.examples.push(`part "${row.textContent}" against its word's line "${own}"`); }
        }
      }
    }
    return out;
  });
  for (const [pass, css] of Object.entries(PASSES)) {
    const st = await p.addStyleTag({ content: css });
    await p.evaluate(() => { for (const el of document.querySelectorAll("body *")) { const ps = getComputedStyle(el).position; if (ps === "fixed" || ps === "sticky") el.style.visibility = "hidden"; } });
    await p.waitForTimeout(150);
    for (const cell of await p.$$(CELLS)) {
      // a word with no blob (its English dropped by a switch) is not judged
      await cell.evaluate((el) => { el.scrollIntoView({ block: "center" }); const tied = new Set([...el.querySelectorAll(":scope > svg.wj-tie > path[data-wi]")].map((q) => q.dataset.wi)); if (el.classList.contains("wjoin")) [...el.querySelectorAll(":scope > .wj-ink > .wb")].forEach((wb, i) => { wb.style.visibility = tied.has(String(i)) ? "" : "hidden"; }); });
      await p.waitForTimeout(30);
      const png = (await cell.screenshot()).toString("base64");
      const r = await cell.evaluate(async (cell, [png, pass]) => {
        const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode();
        const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0);
        const px = cx.getImageData(0, 0, cv.width, cv.height).data;
        const R = cell.getBoundingClientRect(); const sx = img.width / R.width, sy = img.height / R.height;
        const paths = [...cell.querySelectorAll(":scope > svg.wj-tie > path[data-wi]")];
        let ink = 0, outside = 0, twice = 0; const at = [];
        for (let y = 0; y < cv.height; y += 1) for (let x = 0; x < cv.width; x += 1) {
          const o = (y * cv.width + x) * 4; if (0.3 * px[o] + 0.59 * px[o + 1] + 0.11 * px[o + 2] > 110) continue;
          const X = (x + 0.5) / sx, Y = (y + 0.5) / sy, pt = { x: X, y: Y };
          ink += 1;
          const fills = paths.filter((q) => q.isPointInFill(pt));
          if (!fills.length && !paths.some((q) => q.isPointInStroke(pt))) { outside += 1; if (at.length < 2) at.push(`${X.toFixed(1)},${Y.toFixed(1)}`); }
          // two blobs may meet along a seam: a step of 1.9 px either way leaves one of them
          if (fills.length > 1 && !fills.some((q) => !q.isPointInFill({ x: X - 1.9, y: Y }) || !q.isPointInFill({ x: X + 1.9, y: Y }))) twice += 1;
        }
        return { ink, outside, twice, at, label: cell.closest("section.seg").querySelector(".vnum").textContent };
      }, [png, pass]);
      tot[pass].ink += r.ink; tot[pass].outside += r.outside; tot[pass].twice += r.twice;
      if ((r.outside || r.twice) && tot.worst.length < 4) tot.worst.push(`${pass} ${r.label}: ${r.outside} outside, ${r.twice} in two${r.at.length ? ` at ${r.at.join(" ")}` : ""}`);
    }
    await st.evaluate((x) => x.remove());
  }
  // B7, and whether a lone word wears a blob
  tot.lone = await p.evaluate(() => document.querySelectorAll(".he-text > .wb.tied > svg.wj-tie").length);
  tot.cost = await p.evaluate(async () => { window.__drawAllTies(); await new Promise((x) => setTimeout(x, 500)); return window.__tieMs || null; });
  await ctx.close();
  return tot;
};
const say = (t) => `${t.cells} cells · Hebrew ${t.he.ink.toLocaleString()} ink pixels, ${t.he.outside} outside, ${t.he.twice} in two · English ${t.en.ink.toLocaleString()}, ${t.en.outside} outside, ${t.en.twice} in two${t.worst.length ? ` · ${t.worst.join("; ")}` : ""}`;
const clean = (t) => t.cells > 0 && t.he.ink > 0 && t.en.ink > 0 && !t.he.outside && !t.he.twice && !t.en.outside && !t.en.twice;
const live = await run({ runs: "own", sections: 12 });
check(`B1  ${BOOK}'s run cells: every ink pixel inside its blob, no two blobs over one pixel`, clean(live), say(live));
check("B2  a word set in pieces wears one blob per piece, standing over its English pieces in their order", live.split.wrongCount === 0 && live.split.crossed === 0,
  `${live.split.words} words in pieces${live.split.examples.length ? ` · ${live.split.examples.join("; ")}` : ""}`);
check("B3  a run part set in pieces reads its word's own line, character for character", live.split.textDiffers === 0, `${live.split.words} parts compared`);
const all = await run({ runs: "all", sections: 12 });
check(`B4  under any naming: every ink pixel inside its blob, words split and uncrossed`, clean(all) && all.split.words > 0 && all.split.wrongCount === 0 && all.split.crossed === 0, `${say(all)} · ${all.split.words} words in pieces`);
const enr = await run({ runs: "own", mode: "en", sections: 12 });
check("B5  the English reader: every ink pixel inside its blob", clean(enr), say(enr));
const every = await run({ runs: "own", every: true, sections: 4 });
check("B6  the preview of every word: every lone word's ink inside its blob, split where its English is", clean(every) && every.lone > 0 && every.split.words > 0 && every.split.crossed === 0, `${say(every)} · ${every.lone} lone words with a blob · ${every.split.words} in pieces`);
check("    and at the default no lone word wears a blob", live.lone === 0 && all.lone === 0, `${live.lone} at the default`);
const per = (t) => (t.cost && t.cost.cells ? t.cost.ms / t.cost.cells : null);
check("B7  a redraw of every built blob stays under 4 ms a cell", [live, all, every].every((t) => per(t) !== null && per(t) < 4),
  [live, all, every].map((t) => (t.cost ? `${t.cost.cells} cells in ${t.cost.ms} ms` : "no measure")).join(" · "));
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
