// screenshot one verse's line: node shot-verse.mjs <base> <book> <label> <out.png> [width] [en]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [base, book, label, out, w = "412", en = ""] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
if (en) await p.addInitScript(() => { try { localStorage.setItem("fh.reader", "en"); } catch {} });
await p.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
const ok = await p.evaluate(async (label) => {
  const segs = [...document.querySelectorAll("section.seg")];
  const s = segs.find((x) => (x.dataset.label || x.id || "").endsWith(label) || (x.querySelector(".vnum")?.textContent || "").trim() === label);
  if (!s) return segs.slice(0, 3).map((x) => [x.id, x.dataset.label]);
  s.scrollIntoView({ block: "center" });
  return true;
}, label);
await p.waitForTimeout(2500);
const info = await p.evaluate((label) => {
  const segs = [...document.querySelectorAll("section.seg")];
  const s = segs.find((x) => (x.dataset.label || x.id || "").endsWith(label) || (x.querySelector(".vnum")?.textContent || "").trim() === label);
  if (!s) return null; const r = s.getBoundingClientRect(); return { x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height };
}, label);
console.log(JSON.stringify(ok), JSON.stringify(info));
if (info) await p.screenshot({ path: out, clip: { x: 0, y: info.y, width: +w, height: Math.min(info.h, 1400) }, fullPage: true });
await b.close();
