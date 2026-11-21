// shared: launch, load a book clean, wait until the page is ready
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
export const BASE = "http://127.0.0.1:8899/zone.html";
export const noHe = (t) => String(t == null ? "" : t).replace(/[֐-׿]/gu, (c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")} `);
export const mask = (t) => String(t == null ? "" : t).replace(/[֐-׿]+/gu, "<he>");
export const ready = async (p) => {
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1200);
};
export const open = async (query, opts = {}) => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: opts.viewport || { width: 412, height: 915 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e && e.message)));
  await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
  await p.goto(`${BASE}?${query}`, { waitUntil: "networkidle" });
  await ready(p);
  return { b, p, errors };
};
