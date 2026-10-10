// The exporter credits the reading shown: under "look up by: the headword",
// export Ruth 1:1 as English and read which source each word is credited to.
import { readFileSync } from "node:fs";
import { loadPlaywright, launchOptions } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/playwright-v1.mjs";
const lookup = process.argv[2] || "headword";
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, acceptDownloads: true });
await ctx.addInitScript(() => { const o = URL.createObjectURL; URL.createObjectURL = (b) => { b.text().then((t) => { window.__saved = t; }); return o.call(URL, b); }; });
// "before" as a second argument serves the reader as it stood before this work
if (process.argv[3] === "before") await ctx.route(/\/reader\/zone\.html(\?|$)/, (r) => r.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: readFileSync("/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/follow/zone-before-follow.html") }));
await ctx.addInitScript((lk) => { try { localStorage.setItem("fh.lookup", lk); localStorage.setItem("fh.def.order", "oldest"); } catch {} }, lookup);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:8912/reader/zone.html?b=ruth", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await page.waitForTimeout(1500);
const line = await page.evaluate(() => { const wb = document.querySelectorAll("section.seg .he-text .wb")[1]; const g = wb.querySelector(".g"); const c = g.querySelector(".g-lic"); return { he: wb.querySelector(".w").textContent, g: g.textContent, chip: c ? c.title.split(" — ")[0] : null, line: c ? c.dataset.line : null }; });
const btn = await page.locator("section.seg").first().locator(".xp-row button.xp", { hasText: /^english$/ }).elementHandle();
await btn.click();
await page.waitForFunction(() => /Press again/.test((document.querySelector("section.seg .xp-note") || {}).textContent || ""), null, { timeout: 60000 });
await btn.click();
await page.waitForTimeout(1500);
const note = await page.evaluate(() => (document.querySelector("section.seg .xp-note") || {}).textContent);
const text = (await page.evaluate(() => window.__saved)) || `(nothing saved; note: ${note})`;
if (process.env.EXPORT_DUMP) (await import("node:fs")).writeFileSync(process.env.EXPORT_DUMP, text);
const days = text.split("\n").filter((l) => /time|days|Wikisource|TAHOT|STEP/i.test(l)).slice(0, 12); 
console.log(JSON.stringify({ lookup, errors, line, exportLines: days }, null, 1));
await browser.close();
