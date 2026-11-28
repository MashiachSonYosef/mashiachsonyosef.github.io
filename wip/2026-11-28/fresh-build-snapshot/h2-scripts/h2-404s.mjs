// Scratch (builder H2): which files a tree's live reader asks for and does not find, on one book.
import { join } from "node:path";
const [R, BOOK] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(R); const browser = await pw.chromium.launch(launchOptions());
try { const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage(); const miss = [];
  page.on("response", (r) => { if (r.status() >= 400) miss.push(`${r.status()} ${r.url().replace(tree.base, "")}`); });
  await page.goto(`${tree.base}/zone.html?b=${BOOK}`, { waitUntil: "networkidle" }); await page.waitForTimeout(1500); console.log(miss.join("\n")); }
finally { await browser.close(); await tree.close(); }
