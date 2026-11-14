// The cells of the maqaf runs of one verse: each cell's children with class, text, font size and width. Measures only.
// node run-cell-style.mjs <reader dir> <base> <work> <verse label>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, w, label] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const { linesOnPage } = await import(pathToFileURL(join(reader, "tools", "resting-lines-v1.mjs")).href);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
await p.goto(`${base}/zone.html?b=${w}`, { waitUntil: "networkidle", timeout: 120000 });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await linesOnPage(p);
const got = await p.evaluate((label) => {
  const G = String.fromCharCode(0x200b);
  const sec = [...document.querySelectorAll("section.seg")].find((s) => ((s.querySelector(".vnum") || {}).textContent || "").trim() === label);
  const out = [];
  const desc = (el, d) => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    out.push(`${"  ".repeat(d)}${el.tagName.toLowerCase()}.${[...el.classList].join(".")} font=${cs.fontSize} display=${cs.display} w=${r.width.toFixed(1)} text=${JSON.stringify([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.data).join("")).split(G).join("[gap]")}${el.style.cssText ? " style=" + el.style.cssText : ""}`);
    for (const k of el.children) desc(k, d + 1);
  };
  for (const g of sec.querySelectorAll(".wjoin > .g")) desc(g, 0);
  return out;
}, label);
for (const x of got) console.log(x);
await browser.close();
