// The ketiv half's welded card: count and press. node kq-senses2.mjs <reader> <url> <book> <c:v:n>
import { pathToFileURL } from "node:url"; import { join } from "node:path";
const [reader, url, book, at] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await p.goto(`${url}?b=${book}`, { waitUntil: "networkidle" }); await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate((h) => { location.hash = h; }, at); await p.waitForTimeout(3000);
const heads = await p.evaluate(() => [...document.querySelectorAll("#hud .head button, #hud .head [role=button], #hud .rows .b-form button, #hud .kq-head button")].map((x, i) => `${i}:${x.className}:${x.textContent.trim().slice(0, 30)}:${x.getAttribute("aria-pressed")}`));
console.log("head buttons:", heads.join(" | "));
const read = () => p.evaluate(() => ({ line: ((document.querySelector("#hud .withheld-line") || {}).textContent || "").trim(), weld: ((document.querySelector("#hud .kq-weld") || {}).textContent || "").trim().slice(0, 80), senses: [...document.querySelectorAll("#hud > .rows .b-read .r-pills button.sense")].map((x) => x.textContent.trim()), n: document.querySelectorAll("#hud > .rows .b-read .r-pills button").length }));
// press the written (ketiv) half wherever the card offers it
const pressed = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud button")].find((y) => /^\(/.test(y.textContent.trim()) || /written|ketiv/i.test(y.title || "") || y.dataset.role === "KETIV"); if (!x) return null; x.click(); return `${x.className}:${x.textContent.trim()}`; });
await p.waitForTimeout(3000);
console.log("pressed", pressed, "→", JSON.stringify(await read()));
const sw = await p.evaluate(() => { const x = document.querySelector("#hud .withheld-line .senses-switch"); if (!x) return null; x.click(); return x.textContent; });
await p.waitForTimeout(3000);
console.log("switch", sw, "→", JSON.stringify(await read()));
await b.close();
