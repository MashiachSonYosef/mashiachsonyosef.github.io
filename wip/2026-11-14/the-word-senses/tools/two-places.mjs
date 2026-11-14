// A reading pressed at place A; then the card and line at place B of the same letters.
// node two-places.mjs <reader dir> <zone url> <book> <c:v:n A> <c:v:n B>
import { pathToFileURL } from "node:url"; import { join } from "node:path";
const [reader, url, book, A, B] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
await p.goto(`${url}?b=${book}`, { waitUntil: "networkidle" }); await p.waitForSelector("section.seg .he-text .wb");
const lineAt = (q) => p.evaluate((q) => { const [c, v, n] = q.split(":"); const sec = [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "").trim() === `${c}:${v}`); const wb = sec ? sec.querySelectorAll(".he-text .wb:not(.mark)")[Number(n) - 1] : null; const g = wb && (wb.querySelector(":scope > .g") || wb.querySelector(".g")); if (!g) return null; const x = g.cloneNode(true); x.querySelectorAll(".g-lic").forEach((y) => y.remove()); return x.textContent.trim(); }, q);
const card = () => p.evaluate(() => ({ cuts: [...document.querySelectorAll("#hud .b-cut .s-pills button[aria-pressed=true]")].map((x) => x.textContent.trim()), cells: [...document.querySelectorAll("#hud .b-cell .s-pills button[aria-pressed=true]")].map((x) => x.textContent.trim()), pressed: [...document.querySelectorAll("#hud > .rows .b-read .r-pills button[aria-pressed=true]")].map((x) => x.textContent.trim()), pills: document.querySelectorAll("#hud > .rows .b-read .r-pills button").length }));
const open = async (q) => { await p.keyboard.press("Escape"); await p.waitForTimeout(200); await p.evaluate((h) => { location.hash = h; }, q); await p.waitForTimeout(2500); };
await open(B); console.log("B at rest:", await lineAt(B), JSON.stringify(await card()));
await open(A); const a0 = await card();
const took = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((q) => q.getAttribute("aria-pressed") !== "true"); if (!x) return null; x.click(); return x.textContent.trim(); });
await p.waitForTimeout(900); console.log("A:", JSON.stringify(a0), "pressed «" + took + "» · A line:", await lineAt(A));
await open(B); console.log("B after:", await lineAt(B), JSON.stringify(await card()));
await b.close();
