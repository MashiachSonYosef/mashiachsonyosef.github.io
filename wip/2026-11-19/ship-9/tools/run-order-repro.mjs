// Ship 9: Amos's first run drawn in parts that the span store names, under an order (check-card-opens-on-the-line-v1 C1)
// node run-order-repro.mjs <zone url> <order>
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [url, order] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
if (order) await ctx.addInitScript((v) => { try { localStorage.setItem("fh.def.order", v); } catch {} }, order);
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const wait = (ms) => new Promise((x) => setTimeout(x, ms));
  const runsNow = () => [...document.querySelectorAll("section.seg .he-text .wjoin")].filter((r) => { const rg = r.querySelector(":scope > .g"); return !!rg && !rg.classList.contains("bare"); });
  const inParts = (r) => r.querySelector(":scope > .g").classList.contains("parts");
  const spanKey = (r) => (r.__run && r.__run.spanKey) || "";
  const spaced = (r) => inParts(r) && / /u.test(spanKey(r));
  let runs = runsNow();
  if (!runs.some(spaced) && typeof window.__materialise === "function") { window.__materialise(); await wait(1500); runs = runsNow(); }
  const run = runs.find(spaced);
  if (!run) return null;
  const rg = run.querySelector(":scope > .g");
  const parts = [...rg.querySelectorAll(":scope > .g-part")].map((x) => (x.title || x.textContent).replace(/\s+/gu, " ").trim());
  const sec = run.closest("section.seg"); const v = sec && sec.querySelector(".vnum") ? sec.querySelector(".vnum").textContent.trim() : "";
  const wb = run.querySelector(".wb:not(.mark)");
  wb.querySelector(".w").click();
  const h = document.getElementById("hud");
  const t0 = Date.now(); while (Date.now() - t0 < 12000 && !h.querySelector(".r-pills button, .b-read p:not(.r-label)")) await wait(50);
  await wait(900);
  const pills = [...h.querySelectorAll(".r-pills button")].map((x) => `${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${x.textContent.replace(/\s+/gu, " ").trim().slice(0, 50)} [${x.dataset.by || ""}]`);
  const cuts = [...h.querySelectorAll(".s-cut button, .cuts button, [data-cut]")].map((x) => `${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${x.textContent.trim()}`).slice(0, 8);
  return { v, spanKey: spanKey(run), parts, now: (h.querySelector(".r-now .v")?.textContent || "").trim(), pills: pills.slice(0, 12), cuts };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
