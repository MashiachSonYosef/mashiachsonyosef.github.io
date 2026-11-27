// Read-only exploration: open one book, build its sections, print the markup of a few sections.
import { join } from "node:path";
const [R, BOOK, ...LABELS] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
try {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  const t0 = Date.now();
  await page.goto(`${tree.base}/zone.html?b=${BOOK}`, { waitUntil: "networkidle" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await page.waitForTimeout(800);
  const n = await page.evaluate(() => window.__materialise());
  await page.waitForTimeout(500);
  const out = await page.evaluate((labels) => {
    const res = { marksOn: document.body.classList.contains("marks-on"), btn: (document.getElementById("marksToggle") || {}).textContent, bodyClass: document.body.className, secs: [] };
    for (const sec of document.querySelectorAll("section.seg")) {
      const lab = (sec.querySelector(".vnum") || {}).textContent;
      if (!labels.includes(lab)) continue;
      const he = sec.querySelector(".he-text");
      res.secs.push({ lab, html: he ? he.outerHTML : null });
    }
    return res;
  }, LABELS);
  console.log(JSON.stringify({ sections: n, ms: Date.now() - t0, errors, ...out }, null, 1));
  await ctx.close();
} finally { await browser.close(); await tree.close(); }
