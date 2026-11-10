// One phone screen of a real page, as a reader's device would show it: node shot.mjs '<json>'
// json: { url, out, mode: "en"|"he", css: "<css to lay last>", open: <word n of the first verse to open, or 0>, verse: "<label to scroll to>", y: <extra scroll>, w, h, dsf, wait, ls: {..} }
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const o = { mode: "en", css: "", open: 0, verse: "", y: 0, w: 412, h: 915, dsf: 2, wait: 1500, ls: {}, ...JSON.parse(process.argv[2]) };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: o.w, height: o.h }, deviceScaleFactor: o.dsf });
await ctx.addInitScript(({ mode, css, ls }) => {
  try { localStorage.setItem("fh.mode", mode); localStorage.setItem("fh.nums", "on"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v); } catch {}
  if (css) { const add = () => { const st = document.createElement("style"); st.id = "mock"; st.textContent = css; document.documentElement.append(st); }; if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true }); }
}, { mode: o.mode, css: o.css, ls: o.ls });
const p = await ctx.newPage();
const errs = []; p.on("pageerror", (e) => errs.push(String(e.message).slice(0, 160)));
await p.goto(o.url, { waitUntil: "networkidle", timeout: 120000 });
const reader = await p.$("section.seg .he-text .wb");
// the palette is read when the frames are drawn: the mock stands last in the cascade, then the page redraws
await p.evaluate(() => { const st = document.getElementById("mock"); if (st) document.documentElement.append(st); window.dispatchEvent(new Event("resize")); });
await p.waitForTimeout(o.wait);
if (reader) {
  await p.evaluate(async ({ verse, y }) => {
    const secs = [...document.querySelectorAll("section.seg")];
    const s = verse ? secs.find((x) => (x.querySelector(".vnum") || {}).textContent.trim() === verse) : secs[0];
    if (!s) return;
    s.scrollIntoView({ block: "start" }); scrollBy(0, -70 + y);
    await new Promise((r) => setTimeout(r, 700));
  }, { verse: o.verse, y: o.y });
  if (o.open) {
    await p.evaluate(({ verse, n }) => {
      const secs = [...document.querySelectorAll("section.seg")];
      const s = verse ? secs.find((x) => (x.querySelector(".vnum") || {}).textContent.trim() === verse) : secs[0];
      const wb = [...s.querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
      (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    }, { verse: o.verse, n: o.open });
    await p.waitForTimeout(1900);
  }
}
await p.screenshot({ path: o.out });
if (errs.length) console.log("page errors:", errs.slice(0, 2).join(" | "));
await b.close();
