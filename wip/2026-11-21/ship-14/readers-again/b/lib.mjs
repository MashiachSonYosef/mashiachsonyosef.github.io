// Shared by the probes of folder b: open the reader page at a phone viewport, wait until it is ready, open cards.
import { createRequire } from "node:module";
export const { chromium } = createRequire(import.meta.url)("playwright");
export const BASE = "http://127.0.0.1:8899/zone.html";
export const noHe = (t) => String(t == null ? "" : t).replace(/[֐-׿]+/gu, (m) => "<" + [...m].map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join(" ") + ">");
export const mask = (t) => String(t == null ? "" : t).replace(/[֐-׿]+/gu, "<he>");
export const ready = async (p) => {
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1200);
};
export const open = async (query, { clear = true, route = null } = {}) => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e && e.message)));
  if (clear) await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
  if (route) await route(p);
  await p.goto(`${BASE}?${query}`, { waitUntil: "networkidle" });
  await ready(p);
  return { b, p, errors };
};
// the JS source of an expression that finds the nth word box of a verse (label like "2:7")
export const cellSrc = (label, idx) => `[...[...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ${JSON.stringify(label)}).querySelectorAll(".he-text .wb")][${idx}]`;
export const clickWord = async (p, src) => {
  await p.evaluate((src) => { const wb = eval(src); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, src);
  await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(900);
};
export const lineOf = (p, src) => p.evaluate((src) => {
  const wb = eval(src); if (!wb) return null;
  const run = wb.closest(".wjoin"), rg = run ? run.querySelector(":scope > .g") : null, g = wb.querySelector(":scope > .g") || rg;
  if (!g) return null;
  const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  const chips = [...g.querySelectorAll(".g-lic")].map((x) => x.dataset.line || x.textContent || "");
  return `${c.textContent.trim()} [${chips.join(",")}]${rg && g === rg ? " (the run's line)" : ""}`;
}, src);
