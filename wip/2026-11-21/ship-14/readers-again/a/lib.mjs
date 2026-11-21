// shared helpers for the probes in this folder (read-only against the served page)
import { createRequire } from "node:module";
export const { chromium } = createRequire(import.meta.url)("playwright");
export const BASE = "http://127.0.0.1:8899/zone.html";
export const U = (t) => String(t == null ? "" : t).replace(/[֐-׿]/gu, (c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0") + " ").replace(/\u0000/gu, "\\0");
export const open = async (book, extra = "", opts = {}) => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: !!opts.touch });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e && e.message)));
  await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
  if (opts.before) await opts.before(p, ctx);
  await p.goto(`${BASE}?b=${book}${extra}`, { waitUntil: "networkidle" });
  if (!opts.noWait) await ready(p);
  return { b, ctx, p, errors };
};
export const ready = async (p) => {
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1200);
};
export const waitCard = async (p) => { await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud .r-dflt, #hud .r-piece", { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(900); };
// a compact latin mask of Hebrew consonants for the probes' own output (points dropped)
const TR = { "א": "A", "ב": "b", "ג": "g", "ד": "d", "ה": "h", "ו": "w", "ז": "z", "ח": "H", "ט": "T", "י": "y", "כ": "k", "ך": "K", "ל": "l", "מ": "m", "ם": "M", "נ": "n", "ן": "N", "ס": "s", "ע": "E", "פ": "p", "ף": "P", "צ": "c", "ץ": "C", "ק": "q", "ר": "r", "ש": "S", "ת": "t", "־": "-" };
export const T = (t) => String(t == null ? "" : t).replace(/[֐-׿]/gu, (c) => TR[c] ?? "").replace(/\u0000/gu, "\\0");
