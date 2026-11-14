// The switch row of a zone page, pictured: node shot-row.mjs <reader dir> <zone url> <book> <out.png> [width]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, book, out, width] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const W = Number(width || 412);
const p = await b.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh */ } });
await p.goto(`${url}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("#modeRow");
await p.waitForTimeout(800);
const r = await p.evaluate(() => { const q = document.getElementById("modeRow").getBoundingClientRect(); return { x: q.x, y: q.y + window.scrollY, w: q.width, h: q.height }; });
await p.screenshot({ path: out, clip: { x: 0, y: Math.max(0, r.y - 8), width: W, height: r.h + 16 }, fullPage: true });
console.log("row", JSON.stringify(r));
await b.close();
