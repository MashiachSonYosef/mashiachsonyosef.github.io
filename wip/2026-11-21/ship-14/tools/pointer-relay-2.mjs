// Press a reading on a word's card (after choosing a cut and a cell of it, when the card offers them), then have the
// section laid again (joined words out and back), and say what the word's line prints before and after.
// node pointer-relay-2.mjs <zone url> <section label> <word index in the verse> <pill text starts with> [default] [--no-cut]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [URL, LABEL, IDX, STARTS, DFLT, NOCUT] = process.argv.slice(2);
const noHe = (t) => String(t == null ? "" : t).replace(/[֐-׿]+/gu, "<he>");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e && e.message)));
await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
await p.goto(DFLT && DFLT !== "-" ? `${URL}&default=${DFLT}` : URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(1200);
const cell = `[...[...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ${JSON.stringify(LABEL)}).querySelectorAll(".he-text .wb")][${IDX}]`;
const text = () => p.evaluate((src) => {
  const wb = eval(src); if (!wb) return null;
  const run = wb.closest(".wjoin"), rg = run ? run.querySelector(":scope > .g") : null, g = wb.querySelector(":scope > .g") || rg;
  if (!g) return null;
  const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  const chips = [...g.querySelectorAll(".g-lic")].map((x) => x.dataset.line || "");
  return `${c.textContent} [${chips.join(",")}]${rg && g === rg ? " (the run's line)" : ""}`;
}, cell);
console.log("at rest:", JSON.stringify(noHe(await text())));
await p.evaluate((src) => { const wb = eval(src); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, cell);
await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { timeout: 15000 }).catch(() => {});
await p.waitForTimeout(900);
const press = async (sel, fn) => { const r = await p.evaluate(({ sel, fn }) => { const xs = [...document.querySelectorAll(sel)]; const x = new Function("xs", fn)(xs); if (x) x.click(); return x ? x.textContent : null; }, { sel, fn }); await p.waitForTimeout(900); return noHe(r); };
if (NOCUT !== "--no-cut") {
  console.log("cuts offered:", JSON.stringify((await p.evaluate(() => [...document.querySelectorAll("#hud .b-cut .s-pills button")].map((x) => x.textContent))).map(noHe)));
  console.log("cut:", await press("#hud .b-cut .s-pills button", "return xs.find((x) => x.textContent.includes('+'));"));
  console.log("cells offered:", JSON.stringify((await p.evaluate(() => [...document.querySelectorAll("#hud .b-cell .s-pills button")].map((x) => x.textContent))).map(noHe)));
  console.log("cell:", await press("#hud .b-cell .s-pills button", "return xs[xs.length - 1];"));
}
const pills = await p.evaluate(() => [...document.querySelectorAll("#hud .b-read .r-pills button")].map((x) => x.textContent));
console.log("pills on the card:", pills.length, JSON.stringify(pills.map(noHe).filter((t) => /form of|<he>|\(/u.test(t)).slice(0, 60)));
console.log("pressed:", await press("#hud .b-read .r-pills button", `return xs.find((x) => x.textContent.trim().startsWith(${JSON.stringify(STARTS)}));`));
console.log("the card's line:", JSON.stringify(noHe(await p.evaluate(() => { const k = document.querySelector("#hud .r-now"); return k ? k.textContent : null; }))));
await p.keyboard.press("Escape"); await p.waitForTimeout(700);
console.log("ruled:", JSON.stringify(noHe(await text())));
const relay = (label) => p.evaluate((label) => { const l = [...document.querySelectorAll(".row .lab")].find((x) => x.textContent.startsWith("joined words")); const x = l && [...l.nextElementSibling.querySelectorAll("button")].find((y) => y.textContent === label); if (x) x.click(); return !!x; }, label);
console.log("relay out:", await relay("as separate words")); await p.waitForTimeout(1500);
console.log("apart:", JSON.stringify(noHe(await text())));
console.log("relay back:", await relay("as written")); await p.waitForTimeout(2500);
console.log("laid again:", JSON.stringify(noHe(await text())));
await p.reload({ waitUntil: "networkidle" }); await p.waitForSelector("section.seg .he-text .wb");
await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(1500);
console.log("after a reload:", JSON.stringify(noHe(await text())));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
