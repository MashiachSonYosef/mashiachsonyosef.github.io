// The gap cells of maqaf runs and the gap pieces of laid lines: their classes, display and width. Measures only.
// node gap-cells.mjs <reader dir> <base url> <work>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, w] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const { linesOnPage } = await import(pathToFileURL(join(reader, "tools", "resting-lines-v1.mjs")).href);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
await p.goto(`${base}/zone.html?b=${w}`, { waitUntil: "networkidle", timeout: 120000 });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await linesOnPage(p);
const got = await p.evaluate(() => {
  const G = String.fromCharCode(0x200b);
  const out = [];
  for (const k of document.querySelectorAll(".he-text .g.parts > .g-part, .he-text .g > .g-pcs > .g-pc")) {
    const t = (k.textContent || "").trim();
    if (!(k.classList.contains("gap") || t === G)) continue;
    const cs = getComputedStyle(k), r = k.getBoundingClientRect();
    const sec = k.closest("section.seg");
    out.push(`${(sec && sec.querySelector(".vnum") || {}).textContent} ${k.className} display=${cs.display} minw=${cs.minWidth} w=${r.width.toFixed(1)} h=${r.height.toFixed(1)} text=${JSON.stringify(k.textContent).split(G).join("[gap]")} parentDisplay=${getComputedStyle(k.parentElement).display}`);
  }
  return out;
});
for (const x of got.slice(0, 14)) console.log(x);
console.log(got.length, "gap cells or pieces");
await browser.close();
