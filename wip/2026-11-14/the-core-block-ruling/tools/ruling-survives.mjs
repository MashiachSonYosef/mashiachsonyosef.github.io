// A reading pressed on a card that opened on its core block: does the line keep it through a switch that repaints
// the lines (source signs) and through a section laid again? node ruling-survives.mjs <reader dir> <zone url> <book> <c:v> <n>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, book, label, wnum] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await p.goto(`${url}?b=${book}&rail=all`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
const line = () => p.evaluate(([label, n]) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "").trim() === label);
  const wb = sec ? sec.querySelectorAll(".he-text .wb:not(.mark)")[n - 1] : null;
  const g = wb ? wb.querySelector(":scope > .g") || wb.querySelector(".g") : null;
  if (!g) return null; const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim();
}, [label, Number(wnum)]);
await p.evaluate((h) => { location.hash = h; }, `${label}:${wnum}`);
await p.waitForTimeout(2500);
const card = await p.evaluate(() => ({ cells: [...document.querySelectorAll("#hud .cell.on, #hud [aria-pressed=true]")].map((x) => x.textContent.trim()).slice(0, 4) }));
console.log("rest line:", await line(), "· card pressed:", JSON.stringify(card));
const took = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((q) => q.getAttribute("aria-pressed") !== "true"); if (!x) return null; x.click(); return x.textContent.trim(); });
await p.waitForTimeout(1000);
console.log("pressed «" + took + "» · line:", await line());
await p.keyboard.press("Escape"); await p.waitForTimeout(400);
console.log("card closed · line:", await line());
const flipped = await p.evaluate(() => {
  const row = [...document.querySelectorAll("#railRows .row")].find((r) => /source signs/u.test((r.querySelector(".lab") || {}).textContent || ""));
  if (!row) return "no signs row";
  const btn = [...row.querySelectorAll("button")].find((x) => x.textContent.trim() === "as printed");
  if (!btn) return "no as-printed button: " + [...row.querySelectorAll("button")].map((x) => x.textContent).join("|");
  btn.click(); return "signs as printed";
});
await p.waitForTimeout(1200);
console.log(flipped, "· line:", await line());
await b.close();
