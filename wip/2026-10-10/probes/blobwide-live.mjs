// pixel test over every blob cell of a book's first N sections; usage: node blobwide.mjs <book> <runs> <maqaf> <n> [en] [every]
import { loadPlaywright, launchOptions } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/playwright-v1.mjs";
const [book, runs, maqaf, nSec, mode, every] = process.argv.slice(2);
const { chromium } = await loadPlaywright();
const br = await chromium.launch(launchOptions());
const ctx = await br.newContext({ viewport: { width: 412, height: 900 }, deviceScaleFactor: 2 });
await ctx.addInitScript(([runs, maqaf]) => { try { localStorage.setItem("fh.runs", runs); localStorage.setItem("fh.maqaf-join", maqaf); } catch {} }, [runs, maqaf]);
const pg = await ctx.newPage(); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
await pg.goto(`http://127.0.0.1:8921/reader/zone.html?b=${book}${mode === "en" ? "&mode=en" : ""}${every === "every" ? "&blobs=every" : ""}`, { waitUntil: "networkidle" });
await pg.waitForSelector(".he-text .wb"); await pg.waitForTimeout(1000);
// build the first n sections
await pg.evaluate(async (n) => { const secs = [...document.querySelectorAll("section.seg")].slice(0, n); for (const s of secs) { s.scrollIntoView(); await new Promise((x) => setTimeout(x, 60)); } window.scrollTo(0, 0); await new Promise((x) => setTimeout(x, 800)); }, Number(nSec));
const CELLS = ".he-text .wjoin:has(> svg.wj-tie), .he-text > .wb.tied:has(> svg.wj-tie)";
const n = await pg.$$eval(CELLS, (els) => els.length);
const passes = {
  he: `.he-text .wjoin, .he-text .wjoin *, .he-text > .wb.tied, .he-text > .wb.tied * { background: #fff !important; border-color: transparent !important; outline: none !important; box-shadow: none !important; }
       .he-text .w, .he-text .w * { color: #000 !important; } .he-text .wjoin > .g, .he-text > .wb.tied > .g { visibility: hidden !important; } .he-text svg.wj-tie { visibility: hidden !important; }`,
  en: `.he-text .wjoin, .he-text .wjoin *, .he-text > .wb.tied, .he-text > .wb.tied * { background: #fff !important; border-color: transparent !important; outline: none !important; box-shadow: none !important; }
       .he-text .wjoin > .g, .he-text .wjoin > .g *, .he-text > .wb.tied > .g, .he-text > .wb.tied > .g * { color: #000 !important; } .he-text .wjoin .wj-ink, .he-text > .wb.tied > .w { visibility: hidden !important; }
       .he-text .g-lic, .he-text .g-sep, .he-text .g-pp { visibility: hidden !important; } .he-text svg.wj-tie { visibility: hidden !important; }`,
};
const tot = { cells: n, he: { ink: 0, outside: 0, twice: 0 }, en: { ink: 0, outside: 0, twice: 0 }, split: 0, worst: [] };
for (const [pass, css] of Object.entries(passes)) {
  const st = await pg.addStyleTag({ content: css });
  // nothing fixed or sticky may stand in a cell's picture
  await pg.evaluate(() => { for (const el of document.querySelectorAll("body *")) { const p = getComputedStyle(el).position; if (p === "fixed" || p === "sticky") { el.dataset.hidForTest = el.style.visibility || "-"; el.style.visibility = "hidden"; } } });
  await pg.waitForTimeout(150);
  const cells = await pg.$$(CELLS);
  for (const cell of cells) {
    await cell.evaluate((el) => { el.scrollIntoView({ block: "center" }); const tied = new Set([...el.querySelectorAll(":scope > svg.wj-tie > path[data-wi]")].map((p) => p.dataset.wi)); const ws = el.classList.contains("wjoin") ? [...el.querySelectorAll(":scope > .wj-ink > .wb")] : []; ws.forEach((wb, i) => { wb.style.visibility = tied.has(String(i)) ? "" : "hidden"; }); }); await pg.waitForTimeout(40);
    const png = (await cell.screenshot()).toString("base64");
    const r = await cell.evaluate(async (cell, [png, pass]) => {
      const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode();
      const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0);
      const px = cx.getImageData(0, 0, cv.width, cv.height).data;
      const R = cell.getBoundingClientRect(); const sx = img.width / R.width, sy = img.height / R.height;
      const paths = [...cell.querySelectorAll(":scope > svg.wj-tie > path[data-wi]")];
      const seps = [];
      if (pass === "en") for (const t of cell.querySelectorAll(":scope > .g, :scope > .g .g-part")) for (const n of t.childNodes) if (n.nodeType === 3) { let i = -1; while ((i = n.data.indexOf(" + ", i + 1)) >= 0) { const rg = document.createRange(); rg.setStart(n, i + 1); rg.setEnd(n, i + 2); for (const q of rg.getClientRects()) seps.push({ L: q.left - R.left - 1, R: q.right - R.left + 1, T: q.top - R.top - 1, B: q.bottom - R.top + 1 }); } }
      let ink = 0, outside = 0, twice = 0, seam = 0; const at = [];
      for (let y = 0; y < cv.height; y += 1) for (let x = 0; x < cv.width; x += 1) {
        const o = (y * cv.width + x) * 4; if (0.3 * px[o] + 0.59 * px[o + 1] + 0.11 * px[o + 2] > 110) continue;
        const X = (x + 0.5) / sx, Y = (y + 0.5) / sy;
        if (seps.some((q) => X >= q.L && X <= q.R && Y >= q.T && Y <= q.B)) continue;
        ink += 1; const pt = { x: X, y: Y };
        const fills = paths.filter((p) => p.isPointInFill(pt)), inFill = fills.length, near = inFill || paths.some((p) => p.isPointInStroke(pt));
        if (!near) { outside += 1; if (at.length < 3) at.push(`${X.toFixed(1)},${Y.toFixed(1)}`); }
        if (inFill > 1) {
          // two blobs may share a seam strip no wider than the grain twice over:
          // a step of 1.9px left or right leaves one of them
          if (fills.some((p) => !p.isPointInFill({ x: X - 1.9, y: Y }) || !p.isPointInFill({ x: X + 1.9, y: Y }))) seam += 1; else twice += 1;
        }
      }
      const words = cell.classList.contains("wjoin") ? [...cell.querySelectorAll(".wj-ink > .wb > .w")].map((w) => w.textContent).join(" ") : cell.querySelector(":scope > .w").textContent;
      return { ink, outside, twice, seam, at, words, split: paths.filter((p) => p.dataset.piece === "1").length, label: cell.closest("section.seg").querySelector(".vnum").textContent };
    }, [png, pass]);
    tot[pass].ink += r.ink; tot[pass].outside += r.outside; tot[pass].twice += r.twice; tot[pass].seam = (tot[pass].seam || 0) + r.seam;
    if (pass === "he") tot.split += r.split;
    if (r.outside || r.twice) tot.worst.push(`${pass} ${r.label} ${r.words}: out ${r.outside} two ${r.twice} ${r.at.join(" ")}`);
  }
  await st.evaluate((x) => x.remove());
}
console.log(`${book} runs=${runs} maqaf=${maqaf} ${mode || "he"} ${every || ""} · ${tot.cells} cells · split words ${tot.split} · he ink ${tot.he.ink} out ${tot.he.outside} two ${tot.he.twice} seam ${tot.he.seam || 0} · en ink ${tot.en.ink} out ${tot.en.outside} two ${tot.en.twice} · errors ${errs.length}`);
for (const w of tot.worst.slice(0, 8)) console.log("   ", w);
await br.close();
