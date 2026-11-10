// The first verse close up, under a sheet's CSS: node close.mjs <url> <mode> <out.png> [css]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [url, mode, out, css = ""] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, deviceScaleFactor: 4 });
await ctx.addInitScript(({ mode, css }) => {
  try { localStorage.setItem("fh.mode", mode); localStorage.setItem("fh.nums", "on"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); } catch {}
  if (css) { const add = () => { const st = document.createElement("style"); st.id = "mock"; st.textContent = css; document.documentElement.append(st); }; if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true }); }
}, { mode, css });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle", timeout: 120000 }); await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(() => { const st = document.getElementById("mock"); if (st) document.documentElement.append(st); window.dispatchEvent(new Event("resize")); });
await p.waitForTimeout(1800);
const clip = await p.evaluate(() => { const t = document.querySelector("section.seg .he-text"); t.scrollIntoView({ block: "center" }); return new Promise((done) => setTimeout(() => { const r = t.getBoundingClientRect(); done({ x: 0, y: Math.max(0, r.y - 8), width: innerWidth, height: r.height + 16 }); }, 700)); });
await p.screenshot({ path: out, clip });
await b.close();
