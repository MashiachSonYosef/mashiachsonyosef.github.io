// A reading a reader pressed stays on their line when the dictionaries that brought it rest shut again (ship 9).
// node pressed-stays.mjs <base> <book> <verse> <key, as JSON escapes> <reading>
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [base, book, verse, key0, want] = process.argv.slice(2);
const wi = JSON.parse(`"${key0}"`);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
const errors = []; p.on("pageerror", (e) => errors.push(String(e.message)));
await p.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
const seg = async () => p.evaluateHandle((v) => [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent.trim().endsWith(v)), verse);
const lineOf = () => p.evaluate(({ v, i }) => {
  const s = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent.trim().endsWith(v));
  const letters = (t) => [...String(t)].filter((c) => c >= "\u05d0" && c <= "\u05ea").join("");
  const wb = s && [...s.querySelectorAll(".he-text .wb")].find((x) => letters((x.querySelector(".w") || x).textContent) === i);
  const g = wb && (wb.querySelector(".g") || wb.parentElement.querySelector(".g"));
  if (!g) return null; const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, " ").trim();
}, { v: verse, i: wi });
await (await seg()).evaluate((s) => s.scrollIntoView({ block: "center" }));
await p.waitForTimeout(1500);
const before = await lineOf();
// press the word
await p.evaluate(({ v, i }) => {
  const s = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent.trim().endsWith(v));
  const letters = (t) => [...String(t)].filter((c) => c >= "\u05d0" && c <= "\u05ea").join("");
  const wb = [...s.querySelectorAll(".he-text .wb")].find((x) => letters((x.querySelector(".w") || x).textContent) === i);
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
}, { v: verse, i: wi });
await p.waitForTimeout(2500);
const hud = () => p.evaluate(() => { const h = document.getElementById("hud"); return h ? [...h.querySelectorAll("button")].map((b) => b.textContent.replace(/\s+/g, " ").trim()).filter(Boolean) : []; });
const b1 = await hud();
const pressText = (re) => p.evaluate((src) => { const r = new RegExp(src, "i"); const h = document.getElementById("hud"); const btn = h && [...h.querySelectorAll("button")].find((x) => r.test(x.textContent)); if (!btn) return false; btn.click(); return btn.textContent.trim(); }, re);
const shown = await pressText("shut at rest|· show$|\\bshow\\b");
await p.waitForTimeout(1500);
const b2 = await hud();
const hit = await pressText(`^\\s*${want}`);
await p.waitForTimeout(1500);
const afterPress = await lineOf();
await p.keyboard.press("Escape"); await p.waitForTimeout(800);
// shut the dictionaries again, as the rail's switch does
const shut = await p.evaluate(() => { const b = document.querySelector('.kinds-opt[data-kinds="shut"]'); if (!b) return "no switch"; b.click(); return window.__kinds; });
await p.waitForTimeout(2000);
const afterShut = await lineOf();
console.log(JSON.stringify({ before, pills_at_rest: b1.slice(0, 12), opened_by: shown, pills_opened_has: b2.filter((x) => new RegExp(want, "i").test(x)), pressed: hit, line_after_press: afterPress, kinds_after: shut, line_after_shut: afterShut, errors }, null, 1));
await b.close();
