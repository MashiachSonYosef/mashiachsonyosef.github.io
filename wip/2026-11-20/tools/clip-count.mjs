// Ship 10: how many English rows a word's or a run's own row clips (the owner's fault 8), per width, over a book.
// node clip-count.mjs <base> <book> <width>...
import { createRequire } from "node:module";
const pw = createRequire(import.meta.url)("playwright");
const [base, book, ...widths] = process.argv.slice(2);
const b = await pw.chromium.launch();
for (const w of widths) {
  const ctx = await b.newContext({ ...pw.devices["Pixel 7"], viewport: { width: +w, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.evaluate(async () => { if (window.__materialise) { try { await window.__materialise(); } catch {} } });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    let rows = 0, clipped = 0, worst = 0; const sections = new Set(), ex = [], kinds = { word: 0, run: 0 };
    for (const s of document.querySelectorAll("section.seg")) {
      const label = ((s.querySelector(".vnum") || {}).textContent || "").trim();
      for (const g of s.querySelectorAll(".he-text .wb > .g, .he-text .wjoin > .g")) {
        if (g.classList.contains("bare")) continue;
        rows += 1;
        const gb = g.getBoundingClientRect(); let over = 0;
        for (const t of g.querySelectorAll(".g-pc, .g-part")) {
          if (t.querySelector(".g-pc, .g-part")) continue;
          const rg = document.createRange(); rg.selectNodeContents(t);
          for (const q of rg.getClientRects()) { if (q.width < 1) continue; over = Math.max(over, gb.left - q.left, q.right - gb.right); }
        }
        if (over > 0.5) { clipped += 1; sections.add(label); worst = Math.max(worst, over); kinds[g.parentElement.classList.contains("wjoin") ? "run" : "word"] += 1; if (ex.length < 6) { const c = g.cloneNode(true); c.querySelectorAll(".g-lic, .g-pcs-lic").forEach((y) => y.remove()); ex.push(`${label} «${c.textContent.replace(/\s+/g, " ").trim().slice(0, 44)}» ${Math.round(over)}px`); } }
      }
    }
    return { inner: window.innerWidth, rows, clipped, kinds, sections: sections.size, worst: Math.round(worst), ex };
  });
  console.log(w, JSON.stringify(r));
  await ctx.close();
}
await b.close();
