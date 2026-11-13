// What a page says when it loads: its errors, its console's errors and failed requests, and how many sections it drew.
// node page-errors.mjs <reader dir> <url> [seconds]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, secs = "20"] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const page = await browser.newPage();
const said = [];
page.on("pageerror", (e) => said.push(`pageerror: ${String(e.message || e).slice(0, 300)}`));
page.on("console", (m) => { if (m.type() === "error") said.push(`console: ${m.text().slice(0, 300)}`); });
page.on("requestfailed", (r) => said.push(`failed: ${r.url()} ${r.failure() ? r.failure().errorText : ""}`));
page.on("response", (r) => { if (r.status() >= 400) said.push(`http ${r.status()}: ${r.url()}`); });
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(Number(secs) * 1000);
const n = await page.evaluate(() => ({ sections: document.querySelectorAll("section.seg").length, drawn: document.querySelectorAll("section.seg .he-text .wb").length, title: document.title }));
console.log(JSON.stringify(n));
for (const s of said.slice(0, 12)) console.log(s);
await browser.close();
