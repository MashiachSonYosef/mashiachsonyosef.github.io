// read-only probe (23 November 2026): open one work's page as a first visit and say what it threw or logged, and
// whether it drew a word within a minute. Usage: node probe-page-errors.mjs <reader dir> <work>
import { join } from "node:path";
const [R, WORK] = process.argv.slice(2);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(R); const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage(); const said = [];
p.on("pageerror", (e) => said.push(`pageerror: ${e.message}`)); p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") said.push(`${m.type()}: ${m.text()}`.slice(0, 300)); });
p.on("response", (r) => { if (r.status() >= 400) said.push(`http ${r.status()} ${r.url().replace(tree.base, "")}`); });
await p.goto(`${tree.base}/zone.html?b=${WORK}`, { waitUntil: "networkidle" });
const drew = await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }).then(() => true, () => false);
console.log(JSON.stringify({ drew, said: said.slice(0, 12) }, null, 1));
await b.close(); await tree.close();
