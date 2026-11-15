// Press a given reading on a split word's card under a source, then lay the section again (joined words out and back),
// and say what the cell prints before and after. node pointer-relay.mjs <zone url> <section label> <cell index> <pill text starts with> [default]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [URL, LABEL, IDX, STARTS, DFLT] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh */ } });
await p.goto(DFLT ? `${URL}&default=${DFLT}` : URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(1200);
const cell = `[...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ${JSON.stringify(LABEL)}).querySelectorAll(".he-text > .wb")[${IDX}]`;
const text = () => p.evaluate((src) => { const wb = eval(src); const g = wb && wb.querySelector(":scope > .g"); return g ? [...g.childNodes].filter((n) => !(n.nodeType === 1 && n.classList.contains("g-lic"))).map((n) => n.textContent).join("") : null; }, cell);
console.log("at rest:", JSON.stringify(await text()));
await p.evaluate((src) => { const wb = eval(src); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, cell);
await p.waitForTimeout(1500);
const press = async (sel, fn) => { const r = await p.evaluate(({ sel, fn }) => { const xs = [...document.querySelectorAll(sel)]; const x = new Function("xs", fn)(xs); if (x) x.click(); return x ? x.textContent : null; }, { sel, fn }); await p.waitForTimeout(900); return r; };
console.log("cut:", await press("#hud .b-cut .s-pills button", "return xs.find((x) => x.textContent.includes('+'));"));
console.log("cell:", await press("#hud .b-cell .s-pills button", "return xs[xs.length - 1];"));
const pills = await p.evaluate(() => [...document.querySelectorAll("#hud .b-read .r-pills button")].map((x) => x.textContent));
console.log("pills on the card:", pills.length, JSON.stringify(pills.slice(0, 12)));
console.log("pressed:", await press("#hud .b-read .r-pills button", `return xs.find((x) => x.textContent.trim().startsWith(${JSON.stringify(STARTS)}));`));
await p.keyboard.press("Escape"); await p.waitForTimeout(700);
console.log("ruled:", JSON.stringify(await text()));
const relay = (label) => p.evaluate((label) => { const l = [...document.querySelectorAll(".row .lab")].find((x) => x.textContent.startsWith("joined words")); const x = l && [...l.nextElementSibling.querySelectorAll("button")].find((y) => y.textContent === label); if (x) x.click(); return !!x; }, label);
await relay("as separate words"); await p.waitForTimeout(1500); await relay("as written"); await p.waitForTimeout(2500);
console.log("laid again:", JSON.stringify(await text()));
await b.close();
