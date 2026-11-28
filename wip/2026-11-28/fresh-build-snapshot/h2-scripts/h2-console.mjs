// Scratch (builder H2): the console errors and failed requests of a site root's live reader on one book, at rest.
import { join } from "node:path";
const [SITE, BOOK] = process.argv.slice(2);
const { serveTree } = await import(join(SITE, "reader", "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(SITE, "reader", "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const browser = await pw.chromium.launch(launchOptions());
try { const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); const out = [];
  page.on("console", (m) => { if (m.type() === "error") out.push(`console: ${m.text()} @ ${JSON.stringify(m.location())}`); });
  ctx.on("requestfailed", (r) => out.push(`failed: ${r.url()}`)); ctx.on("response", (r) => { if (r.status() >= 400) out.push(`${r.status()} ${r.url().replace(tree.base, "")}`); });
  await page.goto(`${tree.base}/reader/zone.html?b=${BOOK}`, { waitUntil: "networkidle" }); await page.waitForTimeout(2000); console.log(out.join("\n") || "(none)"); }
finally { await browser.close(); await tree.close(); }
