// Before (the live main at 8914) and after (the palette tree at 8912), phone-sized, page by page, and a sheet.
// node before-after.mjs <reader dir> <out dir>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
const [reader, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const SIDES = [["before", "http://127.0.0.1:8914"], ["after", "http://127.0.0.1:8912"]];
const PAGES = [
  ["door", "/", null],
  ["chapter", "/reader/zone.html?b=amos", "line"],
  ["card", "/reader/zone.html?b=amos", "card"],
  ["chain", "/chain/obadiah/", null],
  ["palette", "/palette/", null],
];
for (const [side, base] of SIDES) for (const [id, path, act] of PAGES) {
  const ctx = await b.newContext({ ...pw.devices["Pixel 7"] });
  await ctx.addInitScript(() => { try { localStorage.setItem("fh.mode", "en"); localStorage.setItem("fh.nums", "on"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); } catch { /* first visit */ } });
  const p = await ctx.newPage();
  await p.goto(base + path, { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForTimeout(1200);
  if (act) {
    await p.waitForSelector("section.seg .he-text .wb");
    await p.evaluate(() => { const s = document.querySelector("section.seg"); scrollTo(0, s.getBoundingClientRect().top + scrollY - 60); });
    await p.waitForTimeout(800);
    if (act === "card") { await p.evaluate(() => { const wb = document.querySelectorAll("section.seg .he-text .wb:not(.mark)")[4]; (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }); await p.waitForTimeout(1800); }
  }
  await p.screenshot({ path: `${out}/${id}-${side}.png` });
  await ctx.close();
}
const rows = PAGES.map(([id]) => `<div class="row"><div class="c"><h2>${id}, before</h2><img src="${id}-before.png"></div><div class="c"><h2>${id}, after</h2><img src="${id}-after.png"></div></div>`).join("");
writeFileSync(`${out}/sheet.html`, `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#fff;font:14px Georgia,serif;color:#222}.row{display:flex;gap:12px;margin-bottom:14px}.c{width:412px}h2{font-size:14px;font-weight:normal;margin:0 0 4px}img{width:412px;display:block;border:1px solid #ccc}</style>${rows}`);
const sp = await b.newPage({ viewport: { width: 2 * 412 + 12 + 32, height: 900 }, deviceScaleFactor: 1 });
await sp.goto(pathToFileURL(`${out}/sheet.html`).href); await sp.waitForTimeout(800);
await sp.screenshot({ path: `${out}/before-after.png`, fullPage: true });
await b.close();
console.log("ok");
