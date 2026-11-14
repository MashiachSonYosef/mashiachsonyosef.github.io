// Press a word sense's pill and read the line under the word; then switch word senses off and read it again.
// node press-sense.mjs <reader dir> <zone url> <book> <label c:v> <word n> <out prefix>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, book, label, wnum, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await p.goto(`${url}?b=${book}&senses=on`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
const open = () => p.evaluate((h) => { location.hash = ""; location.hash = h; }, `${label}:${wnum}`);
const read = () => p.evaluate(([label, n]) => {
  const secs = [...document.querySelectorAll("section.seg")];
  const sec = secs.find((s) => ((s.querySelector(".vnum") || {}).textContent || "").trim() === label);
  const wb = sec ? sec.querySelectorAll(".he-text .wb:not(.mark)")[n - 1] : null;
  const g = wb ? wb.querySelector(".g") : null;
  return {
    line: g ? g.textContent.trim() : "(no line)",
    lineInk: g ? getComputedStyle(g).color : "",
    pills: [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => `${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${x.dataset.sense ? "[S]" : ""}${x.textContent.trim()}`),
    withheld: (document.querySelector("#hud .withheld-line") || {}).textContent || "",
    senses: window.__senses,
  };
}, [label, Number(wnum)]);
await open(); await p.waitForTimeout(2000);
console.log("1 opened, senses on:", JSON.stringify(await read()));
const pressed = await p.evaluate(() => { const x = document.querySelector("#hud .r-pills button.sense"); if (!x) return null; x.click(); return x.textContent; });
await p.waitForTimeout(1200);
console.log("2 pressed", pressed, ":", JSON.stringify(await read()));
await p.screenshot({ path: `${out}-pressed.png` });
await p.evaluate(() => { const x = document.querySelector("#hud .withheld-line .senses-switch"); if (x) x.click(); });
await p.waitForTimeout(1500);
console.log("3 switched off:", JSON.stringify(await read()));
await p.screenshot({ path: `${out}-off.png` });
await p.keyboard.press("Escape"); await p.waitForTimeout(500);
await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(1500);
await open(); await p.waitForTimeout(2000);
console.log("4 reloaded, off:", JSON.stringify(await read()));
await b.close();
