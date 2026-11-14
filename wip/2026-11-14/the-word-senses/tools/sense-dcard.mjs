// A word sense pressed: what its record card prints. node sense-dcard.mjs <reader> <url> <book> <c:v:n>
import { pathToFileURL } from "node:url"; import { join } from "node:path";
const [reader, url, book, at] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await p.goto(`${url}?b=${book}&senses=on`, { waitUntil: "networkidle" }); await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate((h) => { location.hash = h; }, at); await p.waitForTimeout(2500);
const got = await p.evaluate(async () => {
  const out = [];
  for (const x of [...document.querySelectorAll("#hud > .rows .b-read .r-pills button.sense")]) {
    x.click(); await new Promise((r) => setTimeout(r, 200));
    const d = document.querySelector("#hud .d-card");
    out.push({ pill: x.textContent.trim(), text: ((d.querySelector(".d-text") || {}).textContent || "").trim(), lit: !!d.querySelector(".d-text .d-sense.on"), legend: ((d.querySelector(".sense-legend") || {}).textContent || ""), cut: !!d.querySelector(".d-cut") });
  }
  return out;
});
console.log(JSON.stringify(got, null, 1));
const d = await p.$("#hud .d-card"); if (d) { await d.scrollIntoViewIfNeeded(); await p.screenshot({ path: process.argv[6] || "/dev/null" }).catch(() => {}); }
await b.close();
