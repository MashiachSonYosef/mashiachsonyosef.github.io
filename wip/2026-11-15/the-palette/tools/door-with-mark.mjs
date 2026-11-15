// The door with a drawing of the woven name served in place of the live mark.
// node door.mjs <reader dir> <svg> <out prefix>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const [reader, svg, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const body = readFileSync(svg);
for (const [name, opts] of [["phone", { ...pw.devices["Pixel 7"] }], ["desktop", { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }]]) {
  const ctx = await b.newContext(opts);
  await ctx.route("**/mark/fireandhail.com-woven-v1.svg", (r) => r.fulfill({ status: 200, contentType: "image/svg+xml", body }));
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:8914/", { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForTimeout(800);
  const box = await p.evaluate(() => { const r = document.querySelector(".masthead").getBoundingClientRect(); return { y: r.top + scrollY, h: r.height }; });
  const w = p.viewportSize().width;
  await p.screenshot({ path: `${out}-${name}.png`, clip: { x: 0, y: 0, width: w, height: Math.min(Math.ceil(box.y + box.h + 120), 560) } });
  await ctx.close();
}
await b.close();
