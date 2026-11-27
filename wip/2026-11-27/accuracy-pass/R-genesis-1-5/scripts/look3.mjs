// Read-only: presses a few words on the Genesis chapter page and writes the card's markup and pictures, to learn the card.
// Usage: node look3.mjs <tree root> <out dir>
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const [ROOT, OUT] = process.argv.slice(2);
const R = join(ROOT, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(ROOT);
const browser = await pw.chromium.launch(launchOptions());
const places = [[0, 0, "1-1-w1"], [3, 2, "1-4-w3"], [104, 15, "4-25-w16"], [36, 0, "2-6-w1"]];
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${tree.base}/genesis/1/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 90000 });
  await page.waitForTimeout(2500);
  const out = {};
  for (const [si, wi, name] of places) {
    await page.evaluate(({ si }) => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); const s = document.querySelectorAll("section.seg")[si]; s.scrollIntoView(); window.scrollBy(0, -30); }, { si });
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(OUT, `shot-verse-${name}.png`) });
    const got = await page.evaluate(async ({ si, wi }) => {
      const turn = (ms) => new Promise((r) => setTimeout(r, ms));
      const hud = document.getElementById("hud");
      const sec = document.querySelectorAll("section.seg")[si];
      const wb = [...sec.querySelectorAll(".he-text .wb")][wi];
      (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
      const t0 = performance.now();
      const settled = () => { const read = hud && hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
      while (!settled() && performance.now() - t0 < 20000) await turn(50);
      await turn(500);
      const c = hud.cloneNode(true); c.querySelectorAll("svg").forEach((s) => s.remove());
      return { ms: Math.round(performance.now() - t0), text: hud.innerText, html: c.outerHTML.slice(0, 30000) };
    }, { si, wi });
    out[name] = got;
    await page.screenshot({ path: join(OUT, `shot-card-${name}.png`) });
  }
  writeFileSync(join(OUT, "card-samples.json"), JSON.stringify(out, null, 1));
  console.log(Object.entries(out).map(([k, v]) => k + " " + v.ms + "ms " + v.html.length).join("\n"));
} finally { await browser.close(); await tree.close(); }
