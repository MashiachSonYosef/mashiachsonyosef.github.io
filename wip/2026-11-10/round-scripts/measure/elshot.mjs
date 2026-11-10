// A close crop of the page around chosen cells: node elshot.mjs '<json>'
// json: { url, mode, css (file), out, pick: "run"|"run3"|"card"|"<css selector>", nth, n (how many cells along), pad, dsf, w }
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const o = { mode: "en", css: "", pick: "run", nth: 0, pad: 14, dsf: 3, w: 412, nums: "on", ls: {}, ...JSON.parse(process.argv[2]) };
const css = o.css ? readFileSync(o.css, "utf8") : "";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: o.w, height: o.vh || 2400 }, deviceScaleFactor: o.dsf });
await ctx.addInitScript(({ mode, css, nums, ls }) => {
  try { localStorage.setItem("fh.mode", mode); localStorage.setItem("fh.nums", nums); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v); } catch {}
  if (css) { const add = () => { const st = document.createElement("style"); st.id = "mock"; st.textContent = css; document.documentElement.append(st); }; if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true }); }
}, { mode: o.mode, css, nums: o.nums, ls: o.ls });
const p = await ctx.newPage();
await p.goto(o.url, { waitUntil: "networkidle", timeout: 120000 }); await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(() => { const st = document.getElementById("mock"); if (st) document.documentElement.append(st); window.dispatchEvent(new Event("resize")); });
await p.waitForTimeout(1200);
const clip = await p.evaluate(({ pick, nth, pad }) => {
  const runs = [...document.querySelectorAll("section.seg .he-text .wjoin")];
  let el;
  if (pick === "run") el = runs[nth];
  else if (pick === "run3") el = runs.filter((r) => r.querySelectorAll(".wb:not(.mark)").length >= 3)[nth];
  else if (pick === "lic") el = runs.filter((r) => r.classList.contains("lic"))[nth];
  else if (pick === "tight") el = runs.filter((r) => { const i = r.querySelector(".wj-ink").getBoundingClientRect(), c = r.getBoundingClientRect(); return i.width > c.width - 30; })[nth];
  else el = document.querySelectorAll(pick)[nth];
  if (!el) return null;
  // the row of cells the chosen one stands in
  el.scrollIntoView({ block: "center" });
  return new Promise((done) => setTimeout(() => { const r = el.getBoundingClientRect(), host = el.closest(".he-text").getBoundingClientRect();
    done({ x: Math.max(0, host.x - 4), y: Math.max(0, r.y - pad), width: Math.min(innerWidth, host.width + 8), height: r.height + 2 * pad }); }, 900));
}, o);
if (!clip) { console.log("nothing to photograph for", o.pick, o.nth); await b.close(); process.exit(2); }
await p.screenshot({ path: o.out, clip, timeout: 60000 });
await b.close();
