// Loads a book in the bare reader and reports page errors and a few line chips.
import { loadPlaywright, launchOptions } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/playwright-v1.mjs";
const book = process.argv[2] || "ruth";
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());
const page = await (await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
await page.goto(`http://127.0.0.1:8912/reader/zone.html?b=${book}&blobs=every`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const chips = [...document.querySelectorAll(".he-text .g-lic")].slice(0, 400);
  const lines = {};
  for (const c of chips) { const k = `${c.textContent.trim()} | ${c.dataset.line || "-"}`; lines[k] = (lines[k] || 0) + 1; }
  const odd = chips.filter((c) => c.dataset.line === "M4").map((c) => { const g = c.closest(".g"); const wb = c.closest(".wb") || c.closest(".wjoin"); return { g: g && g.textContent, cls: g && g.className, title: c.title, w: wb && wb.textContent.slice(0, 40) }; });
  return { chips: chips.length, lines, odd, ties: document.querySelectorAll("svg.wj-tie").length };
});
console.log(JSON.stringify({ errors, ...out }, null, 1));
await browser.close();
