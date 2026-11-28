// Scratch (builder H2): how many lines the switch's note takes at 412 px, for each wording given, at the page's
// head and in the bottom bar's menu. node h2-note.mjs <site root> <wording> …
import { join } from "node:path";
const [SITE, ...WORDS] = process.argv.slice(2);
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const browser = await pw.chromium.launch(launchOptions());
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${tree.base}/reader/zone.html?b=ruth`, { waitUntil: "networkidle" });
  await page.waitForSelector("section.seg", { timeout: 60000 }); await page.waitForTimeout(1500);
  const lines = () => page.evaluate(() => { const n = document.getElementById("cardState"); const r = document.createRange(); r.selectNodeContents(n); const tops = new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))); const b = n.getBoundingClientRect(); return { lines: tops.size, width: Math.round(b.width), left: Math.round(b.left), shown: b.width > 0 }; });
  for (const w of WORDS) {
    await page.evaluate((w) => { document.getElementById("cardState").textContent = w; }, w);
    console.log(JSON.stringify({ at: "head", ...(await lines()), chars: w.length, w }));
  }
} finally { await browser.close(); await tree.close(); }
