// Every word cell of a book at a width: English that runs past its cell, and a blob that leaves its cell.
// node overflow-probe.mjs <base> <book> <width> [en] [maxVerses]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [base, book, w = "412", en = "", maxV = "9999"] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: 900 } });
const p = await ctx.newPage();
if (en === "en") await p.addInitScript(() => { try { localStorage.setItem("fh.reader", "en"); } catch {} });
await p.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
// build every section and let the ties draw
await p.evaluate(async () => { if (window.__materialise) { try { await window.__materialise(); } catch {} } });
const n = await p.evaluate(() => document.querySelectorAll("section.seg").length);
const out = [];
for (let i = 0; i < Math.min(n, +maxV); i += 1) {
  const got = await p.evaluate(async (i) => {
    const s = document.querySelectorAll("section.seg")[i];
    s.scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 120));
    if (window.__drawAllTies) { try { window.__drawAllTies(); } catch {} }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const label = (s.querySelector(".vnum") || {}).textContent || String(i);
    const faults = [];
    for (const cell of s.querySelectorAll(".he-text > .wb, .he-text > .wjoin")) {
      const c = cell.getBoundingClientRect();
      const texts = [...cell.querySelectorAll(".g .g-pc, .g .g-part, .g")].filter((e) => !e.querySelector(".g-pc, .g-part"));
      for (const t of texts) {
        const rg = document.createRange(); rg.selectNodeContents(t);
        for (const r of rg.getClientRects()) {
          if (r.width < 1) continue;
          if (r.left < c.left - 1 || r.right > c.right + 1) { faults.push(`text «${t.textContent.trim().slice(0, 30)}» ${Math.round(r.left - c.left)}..${Math.round(r.right - c.left)} of a cell ${Math.round(c.width)} wide`); break; }
        }
      }
      for (const path of cell.querySelectorAll("svg.wj-tie path")) {
        const bb = path.getBoundingClientRect();
        if (bb.width < 1) continue;
        if (bb.left < c.left - 2 || bb.right > c.right + 2) faults.push(`blob ${Math.round(bb.left - c.left)}..${Math.round(bb.right - c.left)} of a cell ${Math.round(c.width)} wide`);
      }
    }
    return { label, faults };
  }, i);
  if (got.faults.length) out.push(got);
}
console.log(JSON.stringify({ book, width: +w, reader: en || "he", sections: n, withFaults: out.length, out: out.slice(0, 40) }, null, 1));
await b.close();
