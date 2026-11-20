// Ship 9: the kinds press's focus after a «show» that makes the card tight (check-dictionary-kinds-v1 K4), under a
// slowed page. node focus-repro.mjs <base> <book> <section> <entry> <cpu rate>
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [base, book, sec, ent, rate] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
const errors = []; p.on("pageerror", (e) => errors.push(String(e.message)));
await p.addInitScript(() => {
  window.__flog = []; let n = 0; const t0 = performance.now();
  const say = (x) => window.__flog.push(`${Math.round(performance.now() - t0)} ${x}`);
  const name = (el) => !el ? "null" : el === document.body ? "body" : `${el.tagName.toLowerCase()}${el.classList.length ? "." + [...el.classList].join(".") : ""}${el.dataset && el.dataset.n ? "#" + el.dataset.n : ""}`;
  window.__say = say; window.__name = name;
  document.addEventListener("focusin", (e) => say(`focusin ${name(e.target)}`), true);
  document.addEventListener("focusout", (e) => say(`focusout ${name(e.target)} -> ${name(e.relatedTarget)}\n${(new Error().stack || "").split("\n").slice(2, 14).map((l) => "    " + l.trim().replace(/^at /, "").replace(/https?:\/\/[^ )]*\//, "")).join("\n")}`), true);
  new MutationObserver((ms) => { for (const m of ms) { for (const x of m.addedNodes) if (x.nodeType === 1) for (const k of [x, ...x.querySelectorAll(".kinds-switch")]) if (k.classList && k.classList.contains("kinds-switch")) { k.dataset.n = String(++n); say(`built ${name(k)} «${k.textContent}» in ${k.closest(".r-label") ? "label" : "line"}`); }
    for (const x of m.removedNodes) if (x.nodeType === 1 && (x.classList.contains("kinds-switch") || x.querySelector(".kinds-switch"))) say(`removed ${name(x)}`); } })
    .observe(document, { childList: true, subtree: true });
});
const cdp = await ctx.newCDPSession(p);
await p.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.evaluate(() => window.__materialise(0));
await p.waitForTimeout(400);
if (Number(rate) > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(rate) });
await p.evaluate(async ({ section, entry }) => {
  const hud = document.getElementById("hud");
  const wb = document.querySelectorAll("section.seg")[section].querySelectorAll(".he-text .wb")[entry];
  window.__say("word click");
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  const t0 = performance.now();
  const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
  while (!settled() && performance.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 25));
}, { section: Number(sec), entry: Number(ent) });
await p.evaluate(() => { const all = [...document.querySelectorAll("#hud .kinds-switch")]; const x = all.find((y) => y.getClientRects().length) || all[0]; window.__say(`press ${window.__name(x)}`); x.click(); });
await p.waitForFunction(() => { const b = document.querySelector("#hud .kinds-switch"); return !!b && b.getAttribute("aria-pressed") === "true"; }, null, { timeout: 15000 }).catch(() => {});
await p.waitForTimeout(500);
const at500 = await p.evaluate(() => ({ active: window.__name(document.activeElement), tight: document.getElementById("hud").classList.contains("tight") }));
await p.waitForTimeout(2500);
const later = await p.evaluate(() => ({ active: window.__name(document.activeElement), tight: document.getElementById("hud").classList.contains("tight") }));
console.log(JSON.stringify({ rate, at500, later, errors }));
console.log((await p.evaluate(() => window.__flog)).join("\n"));
await b.close();
