// The card numbers in two silvers on the live page (injection; the tree untouched): the line's silver, and a regular silver for text.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
const [reader, url, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const V = [["bronze", null, "today: bronze #6d523a"], ["silver-line", "#6e7378", "silver, the lines' own #6e7378 (3.3:1 in a cell)"], ["silver-regular", "#53575b", "silver's regular #53575b (5.0:1 in a cell)"]];
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
for (const [id, hex] of V) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 760 }, deviceScaleFactor: 2 });
  const css = hex ? `#hud .head .wn { color: ${hex} !important; } body.nums .he-text .wb:not(.mark)::after { color: ${hex} !important; -webkit-text-fill-color: ${hex} !important; }` : "";
  await ctx.addInitScript(({ css }) => {
    try { localStorage.setItem("fh.mode", "en"); localStorage.setItem("fh.nums", "on"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); } catch { /* first visit */ }
    if (css) { const add = () => { const st = document.createElement("style"); st.id = "mock"; st.textContent = css; document.documentElement.append(st); }; if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true }); }
  }, { css });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.evaluate(() => { const st = document.getElementById("mock"); if (st) document.documentElement.append(st); const s = document.querySelector("section.seg"); scrollTo(0, s.getBoundingClientRect().top + scrollY - 40); });
  await p.waitForTimeout(900);
  await p.evaluate(() => { const wb = document.querySelectorAll("section.seg .he-text .wb:not(.mark)")[4]; (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `${out}/${id}.png` });
  await ctx.close();
}
writeFileSync(`${out}/sheet.html`, `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#fff;font:14px Georgia,serif;color:#222}.row{display:flex;gap:12px}.c{width:412px}h2{font-size:14px;font-weight:normal;margin:0 0 4px}img{width:412px;display:block;border:1px solid #ccc}</style><div class="row">${V.map(([id, , say]) => `<div class="c"><h2>${say}</h2><img src="${id}.png"></div>`).join("")}</div>`);
const sp = await b.newPage({ viewport: { width: 3 * 412 + 2 * 12 + 32, height: 820 }, deviceScaleFactor: 2 });
await sp.goto(pathToFileURL(`${out}/sheet.html`).href); await sp.waitForTimeout(600);
await sp.screenshot({ path: `${out}/numbers-silver.png`, fullPage: true });
await b.close(); console.log("ok");
