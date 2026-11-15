import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, html, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 1800, height: 600 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(html).href); await p.waitForTimeout(500);
await p.screenshot({ path: out, fullPage: true }); await b.close();
