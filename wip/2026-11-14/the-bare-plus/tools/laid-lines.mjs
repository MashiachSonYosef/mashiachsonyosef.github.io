// The lines a page lays in their pieces (.g-pcs), with where they stand and their pieces, for one work, so two builds
// can be set side by side. It measures; it changes nothing. node laid-lines.mjs <reader dir> <base url> <work>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, w] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
await p.goto(`${base}/zone.html?b=${w}`, { waitUntil: "networkidle", timeout: 120000 });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.evaluate(() => window.__materialise());
await p.waitForTimeout(1500);
const got = await p.evaluate(() => [...document.querySelectorAll(".he-text .g > .g-pcs")].map((row) => {
  const s = row.closest("section.seg"); const g = row.parentElement;
  const host = g.parentElement;
  return `${(s && s.querySelector(".vnum") || {}).textContent || "?"} [${host.className}] ${[...row.children].map((k) => (k.classList.contains("g-pp") ? (k.classList.contains("at-gap") ? "·" : "+") : (k.textContent || "").split(String.fromCharCode(0x200b)).join("[gap]"))).join("|")}`;
}));
for (const x of got) console.log(x);
await browser.close();
