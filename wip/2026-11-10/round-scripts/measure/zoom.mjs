// A tight zoom on one cell: node zoom.mjs '<json>' { url, mode, css, out, sel ("run"|"card"), nth, dsf, grow, nums }
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const o = { mode: "en", css: "", sel: "run", nth: 0, dsf: 5, w: 412, grow: 6, nums: "on", vh: 2400, ls: {}, ...JSON.parse(process.argv[2]) };
const css = o.css ? readFileSync(o.css, "utf8") : "";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: o.w, height: o.vh }, deviceScaleFactor: o.dsf });
await ctx.addInitScript(({ mode, css, nums, ls }) => {
  try { localStorage.setItem("fh.mode", mode); localStorage.setItem("fh.nums", nums); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v); } catch {}
  if (css) { const add = () => { const st = document.createElement("style"); st.id = "mock"; st.textContent = css; document.documentElement.append(st); }; if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true }); }
}, { mode: o.mode, css, nums: o.nums, ls: o.ls });
const p = await ctx.newPage();
await p.goto(o.url, { waitUntil: "networkidle", timeout: 120000 }); await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(() => { const st = document.getElementById("mock"); if (st) document.documentElement.append(st); window.dispatchEvent(new Event("resize")); });
await p.waitForTimeout(1200);
const clip = await p.evaluate(({ sel, nth, grow, find }) => {
  const all = sel === "run" ? [...document.querySelectorAll("section.seg .he-text .wjoin")] : [...document.querySelectorAll("section.seg .he-text > .wb:not(.mark)")];
  const el = find ? all.find((x) => x.textContent.replace(/[^א-ת]/gu, "").startsWith(find)) : all[nth];
  if (!el) return null;
  el.scrollIntoView({ block: "center" });
  return new Promise((done) => setTimeout(() => { const r = el.getBoundingClientRect(); done({ x: Math.max(0, r.x - grow), y: Math.max(0, r.y - grow), width: r.width + 2 * grow, height: r.height + 2 * grow }); }, 900));
}, o);
if (!clip) { console.log("nothing found"); await b.close(); process.exit(2); }
await p.screenshot({ path: o.out, clip, timeout: 60000 });
await b.close();
