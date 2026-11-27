// Read-only: opens one chapter page of the frozen tree as a first visit, takes pictures, and writes what the page prints.
// Usage: node look.mjs <tree root> <out dir> <chapter>
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const [ROOT, OUT, CH = "1"] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
  const t0 = Date.now();
  await page.goto(`${tree.base}/genesis/${CH}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
  const tFirst = Date.now() - t0;
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(OUT, `shot-ch${CH}-top.png`) });
  const info = await page.evaluate(() => {
    const secs = [...document.querySelectorAll("section.seg")];
    const first = secs[0];
    return {
      title: document.title,
      sections: secs.length,
      bodyTextHead: document.body.innerText.slice(0, 1500),
      firstSectionHtml: first ? first.outerHTML.slice(0, 6000) : null,
      labels: secs.slice(0, 5).map((s) => (s.querySelector(".lab, .label, h3, .ref") || {}).textContent || s.id || s.dataset.label || ""),
    };
  });
  writeFileSync(join(OUT, `look-ch${CH}.json`), JSON.stringify({ tFirst, errors, info }, null, 1));
  console.log("first words after ms", tFirst, "sections", info.sections, "errors", errors.length);
} finally { await browser.close(); await tree.close(); }
