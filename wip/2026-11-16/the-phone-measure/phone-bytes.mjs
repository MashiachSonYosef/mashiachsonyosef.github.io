// What a chapter page fetches before its first card is read: every response, by size, and when it was asked for
// (before the words appeared, before the lines, or for the card).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");
const [ORIGIN, path] = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 5"] });
const p = await ctx.newPage();
const got = []; let phase = "to the words";
p.on("response", async (r) => { try { const b = await r.body(); got.push({ url: r.url().replace(ORIGIN, ""), n: b.length, enc: (r.headers()["content-encoding"] || ""), phase }); } catch {} });
await p.goto(`${ORIGIN}${path}`, { waitUntil: "domcontentloaded" });
await p.waitForSelector(".he-text .wb"); phase = "to the lines";
await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 120000 }).catch(() => {});
await p.waitForTimeout(3000); phase = "for the card";
await p.evaluate(() => { const w = document.querySelectorAll(".he-text .wb:not(.mark)")[2]; if (w) (w.querySelector(".w span") || w.querySelector(".w") || w).click(); });
await p.waitForTimeout(4000);
const sum = {}; for (const g of got) sum[g.phase] = (sum[g.phase] || 0) + g.n;
console.log(JSON.stringify(Object.fromEntries(Object.entries(sum).map(([k, v]) => [k, (v / 1e6).toFixed(2) + " MB"]))), got.length, "files");
for (const g of got.sort((a, b) => b.n - a.n).slice(0, 14)) console.log(String((g.n / 1e3).toFixed(0)).padStart(7), "KB", g.phase.padEnd(13), g.url.slice(0, 90));
await browser.close();
