// Read-only: opens the Genesis 1 chapter page as a first visit; writes the markup of a few verses (drawing paths removed),
// the addresses that answered 404, and pictures of the top of the page and of chosen verses.
// Usage: node look2.mjs <tree root> <out dir>
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const [ROOT, OUT] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  const bad = [];
  page.on("response", (r) => { if (r.status() >= 400) bad.push([r.status(), r.url().replace(tree.base, "")]); });
  await page.goto(`${tree.base}/genesis/1/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
  await page.waitForTimeout(2500);
  const html = await page.evaluate(() => {
    const strip = (el) => { const c = el.cloneNode(true); c.querySelectorAll("svg").forEach((s) => s.remove()); return c.outerHTML; };
    const secs = [...document.querySelectorAll("section.seg")];
    return { s3: strip(secs[3]), s6: strip(secs[6]), s126: strip(secs[105 + 0]) };
  });
  writeFileSync(join(OUT, "markup-samples.json"), JSON.stringify({ bad, html }, null, 1));
  // the very top of the page
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, "shot-page-top.png") });
  for (const [si, name] of [[3, "1-4"], [6, "1-7"], [13, "1-14"]]) {
    await page.evaluate((i) => { document.querySelectorAll("section.seg")[i].scrollIntoView(); window.scrollBy(0, -20); }, si);
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(OUT, `shot-${name}.png`) });
  }
  console.log("bad", JSON.stringify(bad));
} finally { await browser.close(); await tree.close(); }
