// node probe-card.mjs <reader dir> <url> <book> <c:v:n>
import { pathToFileURL } from "node:url"; import { join } from "node:path";
const [reader, url, book, at] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("x")) { localStorage.clear(); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); sessionStorage.setItem("x", "1"); } } catch {} });
const p = await ctx.newPage(); p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await p.goto(`${url}?b=${book}`, { waitUntil: "networkidle" }); await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate((h) => { location.hash = h; }, at); await p.waitForTimeout(2500);
const info = await p.evaluate(async () => {
  const xs = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")];
  const out = { legendRec: !!(window.__dbg), n: xs.length, withheld: ((document.querySelector("#hud .withheld-line") || {}).textContent || ""), pills: [] };
  for (const x of xs) {
    if (!/M12|M39|M49|M65|M75|M106/.test(x.dataset.by || "")) continue;
    x.click(); await new Promise((r) => setTimeout(r, 150));
    const d = document.querySelector("#hud .d-card");
    out.pills.push({ t: x.textContent.trim(), by: x.dataset.by, key: d.dataset.key, row: d.dataset.row, legend: !!d.querySelector(".sense-legend"), text: ((d.querySelector(".d-text") || {}).textContent || "").slice(0, 80) });
  }
  return out;
});
console.log(JSON.stringify(info, null, 1).slice(0, 4000));
await b.close();
