// The word senses, photographed: the card with the switch on, scrolled to its first purple pill; then that pill
// pressed and the card closed, the line under the word. node shot-sense.mjs <reader dir> <zone url> <book> <c:v> <n> <out prefix> [width]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, book, label, wnum, out, width = "412"] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const W = Number(width);
const p = await b.newPage({ viewport: { width: W, height: 915 }, deviceScaleFactor: 2 });
p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await p.goto(`${url}?b=${book}&senses=on`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate((h) => { location.hash = h; }, `${label}:${wnum}`);
await p.waitForTimeout(2500);
const said = await p.evaluate(() => {
  const x = document.querySelector("#hud .r-pills button.sense");
  if (x) x.scrollIntoView({ block: "center" });
  return { sense: x ? x.textContent.trim() : null, line: ((document.querySelector("#hud .withheld-line") || {}).textContent || "").trim() };
});
console.log("card:", JSON.stringify(said));
await p.waitForTimeout(400);
const box = await p.evaluate(() => { const r = document.getElementById("hud").getBoundingClientRect(); return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(innerWidth - Math.max(0, r.x), r.width), height: Math.min(innerHeight - Math.max(0, r.y), r.height) }; });
await p.screenshot({ path: `${out}-card.png`, clip: box });
const pressed = await p.evaluate(() => { const x = document.querySelector("#hud .r-pills button.sense"); if (!x) return null; x.click(); return x.textContent.trim(); });
await p.waitForTimeout(900);
await p.keyboard.press("Escape"); await p.waitForTimeout(600);
const clip = await p.evaluate(([label, n]) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "").trim() === label);
  const wb = sec.querySelectorAll(".he-text .wb:not(.mark)")[n - 1];
  wb.scrollIntoView({ block: "center" });
  const r = wb.getBoundingClientRect();
  const g = wb.querySelector(":scope > .g") || wb.querySelector(".g");
  return { text: g ? g.textContent.trim() : "", box: { x: 0, y: Math.max(0, r.y - 120), width: innerWidth, height: Math.min(300, innerHeight - Math.max(0, r.y - 120)) } };
}, [label, Number(wnum)]);
console.log("pressed «" + pressed + "» · the line:", clip.text);
await p.screenshot({ path: `${out}-line.png`, clip: clip.box });
await b.close();
