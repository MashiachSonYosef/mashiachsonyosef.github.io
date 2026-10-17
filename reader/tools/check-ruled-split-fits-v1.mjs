// A RULED SPLIT READING STANDS WHOLE IN ITS CELL (the owner, 2026-10-17, of
// "and + plowshare" at the sixth word of Genesis 1:1: "selecting plowshare
// glitched out the shading and width"). A word whose English splits into
// pieces is laid as one row that never wraps (a tie runs to each piece), and
// a reader's ruling repaints it: the cell takes the row's width where the row
// is wider than the width the cell was held at, and the box is as tall as
// what it shows, never taller.
//   F1  in the Hebrew reader and in the English reader, a split word whose
//       piece the reader rules to its longest reading: its row stands inside
//       its cell, the cell stands inside the text's column (a reading too
//       long for it wraps its long piece in its own column), the box holds no
//       line nobody filled, and the page does not scroll sideways
// The word is found on the page, never named here (check-scope-derived S1):
// the first split word with a blob whose last piece's longest reading needs
// more room than its cell had.
// Usage: node tools/check-ruled-split-fits-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const URL = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
for (const mode of ["he", "en"]) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.addInitScript((mode) => { try { localStorage.clear(); if (mode === "en") localStorage.setItem("fh.mode", "en"); } catch { /* fresh reader */ } }, mode);
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(1200);
  const docW0 = await p.evaluate(() => document.documentElement.scrollWidth);
  let found = null;
  for (let i = 0; i < 40 && !found; i += 1) {
    // the i-th split word that wears a blob, its card opened
    const opened = await p.evaluate((i) => {
      const wbs = [...document.querySelectorAll(".he-text > .wb.tied")].filter((wb) => wb.querySelector(":scope > .g > .g-pcs") && wb.__word && Array.isArray(wb.__word.pg) && wb.__word.pg.length > 1 && !wb.classList.contains("kq"));
      const wb = wbs[i]; if (!wb) return null;
      wb.scrollIntoView({ block: "center" });
      (wb.querySelector(".w span") || wb.querySelector(".w")).click();
      wb.dataset.fitProbe = String(i);
      return { cut: wb.__word.pg.map((x) => x.k).join(" + "), last: wb.__word.pg[wb.__word.pg.length - 1].k, width: wb.getBoundingClientRect().width };
    }, i);
    if (!opened) break;
    const t0 = Date.now(); while (Date.now() - t0 < 12000 && !(await p.$("#hud .r-pills button"))) await p.waitForTimeout(80);
    await p.waitForTimeout(400);
    const pressed = async (sel, t) => { const ok = await p.evaluate(({ sel, t }) => { const xs = [...document.querySelectorAll(sel)].filter((y) => y.textContent.trim() === t); const x = xs[xs.length - 1]; if (x) x.click(); return !!x; }, { sel, t }); await p.waitForTimeout(900); return ok; };
    if (!(await pressed("#hud .b-cut .s-pills button", opened.cut)) || !(await pressed("#hud .b-cell .s-pills button", opened.last))) { await p.keyboard.press("Escape"); await p.waitForTimeout(200); continue; }
    // the longest reading of the last piece, if it is longer than the one shown
    const longest = await p.evaluate(() => { const bs = [...document.querySelectorAll("#hud .b-read .r-pills button")].filter((x) => !/\+/u.test(x.textContent)); bs.sort((a, c) => c.textContent.trim().length - a.textContent.trim().length); return bs[0] ? bs[0].textContent.trim() : null; });
    if (!longest || longest.length < 9) { await p.keyboard.press("Escape"); await p.waitForTimeout(200); continue; }
    await pressed("#hud .b-read .r-pills button", longest);
    await p.keyboard.press("Escape"); await p.waitForTimeout(700);
    const m = await p.evaluate((i) => {
      const wb = document.querySelector(`.he-text > .wb[data-fit-probe="${i}"]`);
      const g = wb && wb.querySelector(":scope > .g"); const row = g && g.querySelector(":scope > .g-pcs");
      if (!row) return null;
      const r = wb.getBoundingClientRect(), rr = row.getBoundingClientRect(), gr = g.getBoundingClientRect();
      // what the box shows: its row, and its chip where the chip is drawn
      const chip = g.querySelector(":scope > .g-lic"); const cr = chip && getComputedStyle(chip).display !== "none" ? chip.getBoundingClientRect() : null;
      const shown = Math.max(rr.bottom, cr ? cr.bottom : 0) - Math.min(rr.top, cr ? cr.top : Infinity);
      const lh = parseFloat(getComputedStyle(g).lineHeight) || 18;
      // the cells beside it on its own line of the page
      const mates = [...wb.parentElement.children].filter((x) => x.matches(".wb") && Math.abs(x.getBoundingClientRect().top - r.top) < 4);
      const colR = wb.parentElement.getBoundingClientRect();
      // the room the row asks for, whatever the cell gave it
      const rowNeeds = row.scrollWidth;
      return { text: row.textContent, cell: [Math.round(r.left), Math.round(r.right)], row: [Math.round(rr.left), Math.round(rr.right)], inside: rr.left >= r.left - 1 && rr.right <= r.right + 1 && row.scrollWidth <= row.clientWidth + 1, inColumn: r.left >= colR.left - 1 && r.right <= colR.right + 1, box: Math.round(gr.height), shown: Math.round(shown), spare: gr.height - shown > lh * 0.9, rowNeeds };
    }, i);
    if (m && m.rowNeeds + 8 > opened.width + 1) found = { ...m, at: i, longest };
  }
  const docW1 = await p.evaluate(() => document.documentElement.scrollWidth);
  check(`F1  ${mode === "en" ? "the English reader" : "the Hebrew reader"}: a ruled split reading stands whole in its cell`, !!found && found.inside && found.inColumn && !found.spare && docW1 === docW0,
    found ? `"${found.text.slice(0, 60)}" · cell ${found.cell.join("-")}${found.inColumn ? "" : " (outside the column)"} · row ${found.row.join("-")}${found.inside ? "" : " (outside the cell)"} · box ${found.box}px for ${found.shown}px shown · page ${docW0}px → ${docW1}px` : "no split word's ruling widened its row here");
  await p.close();
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
