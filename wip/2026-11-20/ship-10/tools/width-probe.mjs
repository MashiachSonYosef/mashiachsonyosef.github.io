// Ship 10: the cut rows and the page's width, by the joined-words switch. node width-probe.mjs <base> <book> <rest|maqaf> [width]
import { createRequire } from "node:module";
const pw = createRequire(import.meta.url)("playwright");
const [base, book, mode, width = "412"] = process.argv.slice(2);
const b = await pw.chromium.launch();
const ctx = await b.newContext({ ...pw.devices["Pixel 7"], viewport: { width: +width, height: 839 } });
const p = await ctx.newPage();
await p.goto(`${base}/zone.html?b=${book}${mode === "maqaf" ? "&maqaf=maqaf" : ""}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.evaluate(async () => { if (window.__materialise) { try { await window.__materialise(); } catch {} } });
await p.waitForTimeout(1500);
const r = await p.evaluate(() => {
  let rows = 0; const cut = []; let widest = 0, past = 0;
  const vw = document.documentElement.clientWidth;
  for (const s of document.querySelectorAll("section.seg")) {
    const label = s.__sec ? String(s.__sec.label) : "";
    for (const j of s.querySelectorAll(".he-text .wjoin, .he-text > .wb")) { const q = j.getBoundingClientRect(); widest = Math.max(widest, q.width); if (q.right > vw + 0.5 || q.left < -0.5) past += 1; }
    for (const g of s.querySelectorAll(".he-text .wb > .g, .he-text .wjoin > .g")) {
      if (g.classList.contains("bare")) continue;
      rows += 1;
      const gb = g.getBoundingClientRect(); let over = 0;
      for (const t of g.querySelectorAll(".g-pc, .g-part")) {
        if (t.querySelector(".g-pc, .g-part")) continue;
        const rg = document.createRange(); rg.selectNodeContents(t);
        for (const q of rg.getClientRects()) { if (q.width < 1) continue; over = Math.max(over, gb.left - q.left, q.right - gb.right); }
      }
      if (over > 0.5) cut.push(`${label} ${Math.round(over)}px`);
    }
  }
  return { vw, scrollW: document.documentElement.scrollWidth, rows, cut: cut.length, first: cut.slice(0, 5), widestCell: Math.round(widest), cellsPastThePage: past, joins: document.querySelectorAll(".he-text .wjoin").length };
});
console.log(book, mode, width, JSON.stringify(r));
await b.close();
