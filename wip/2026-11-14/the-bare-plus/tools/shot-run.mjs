// A picture of the maqaf runs of one verse that hold a gap, on one build. node shot-run.mjs <reader dir> <base> <work> <verse label> <out.png>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, w, label, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const { linesOnPage } = await import(pathToFileURL(join(reader, "tools", "resting-lines-v1.mjs")).href);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto(`${base}/zone.html?b=${w}`, { waitUntil: "networkidle", timeout: 120000 });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await linesOnPage(p);
const box = await p.evaluate((label) => {
  const sec = [...document.querySelectorAll("section.seg")].find((s) => ((s.querySelector(".vnum") || {}).textContent || "").trim() === label);
  if (!sec) return null;
  const he = sec.querySelector(".he-text");
  he.scrollIntoView({ block: "center" });
  const r = he.getBoundingClientRect();
  return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(r.width, 412), height: Math.min(r.height, 900) };
}, label);
if (!box) { console.log("no such verse"); process.exit(1); }
await p.waitForTimeout(400);
await p.screenshot({ path: out, clip: box });
console.log("wrote", out, JSON.stringify(box));
await browser.close();
