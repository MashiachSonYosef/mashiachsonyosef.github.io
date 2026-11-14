// One word of a zone page as drawn, pictured with its neighbors, under a chosen switch state.
// node shot-word.mjs <reader dir> <zone url> <book> <section index> <word index from 0, marks not counted> <out.png> [width] [scale] [modeEn]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, book, secIx, wIx, out, width, scale, modeEn] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const W = Number(width || 412);
const p = await b.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: Number(scale || 2) });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh */ } });
await p.goto(`${url}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
if (modeEn === "en") { await p.click("#modeEn"); await p.waitForTimeout(1500); }
await p.evaluate((si) => document.querySelectorAll("section.seg")[si].scrollIntoView({ block: "center" }), Number(secIx));
await p.waitForFunction((si) => document.querySelectorAll("section.seg")[si].querySelectorAll(".he-text .wb").length > 0, Number(secIx), { timeout: 30000 });
await p.waitForTimeout(800);
const r = await p.evaluate(([si, wi]) => {
  const sec = document.querySelectorAll("section.seg")[si];
  const wb = sec.querySelectorAll(".he-text .wb:not(.mark)")[wi];
  wb.scrollIntoView({ block: "center" });
  return true;
}, [Number(secIx), Number(wIx)]);
await p.waitForTimeout(1500);
const box = await p.evaluate(([si, wi]) => {
  const sec = document.querySelectorAll("section.seg")[si];
  const wb = sec.querySelectorAll(".he-text .wb:not(.mark)")[wi];
  const q = wb.getBoundingClientRect();
  return { x: q.x, y: q.y, w: q.width, h: q.height };
}, [Number(secIx), Number(wIx)]);
const pad = 40;
await p.screenshot({ path: out, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(W - Math.max(0, box.x - pad), box.w + 2 * pad), height: box.h + 2 * pad } });
console.log("shot", out, JSON.stringify(box));
await b.close();
