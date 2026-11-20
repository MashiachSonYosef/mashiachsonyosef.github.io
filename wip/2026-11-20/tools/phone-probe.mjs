// Ship 10: the owner's drawing faults (Isaiah 1:6, 2:9, 9:12, 12:2) as a phone's Chrome draws them: a named phone,
// and the Hebrew in the face a phone falls to (the page ships no Hebrew face). Shots and measures per verse.
// node phone-probe.mjs <base> <book> <device> <font file or -> <out dir> <verse>...
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const pw = createRequire(import.meta.url)("playwright");
const [base, book, device, font, out, ...verses] = process.argv.slice(2);
const b = await pw.chromium.launch();
const ctx = await b.newContext({ ...pw.devices[device] });
const p = await ctx.newPage();
if (font !== "-") {
  const bytes = readFileSync(font);
  await p.route("**/__font/hebrew.ttf", (r) => r.fulfill({ status: 200, contentType: "font/ttf", body: bytes }));
  await p.addInitScript(() => {
    const css = ["Frank Ruehl CLM", "Frank Ruehl", "David Libre", "SBL Hebrew"].map((f) => `@font-face{font-family:"${f}";src:url("/__font/hebrew.ttf") format("truetype");unicode-range:U+0590-05FF,U+FB1D-FB4F;}`).join("");
    const add = () => { const s = document.createElement("style"); s.textContent = css; (document.head || document.documentElement).appendChild(s); };
    if (document.head) add(); else document.addEventListener("DOMContentLoaded", add);
  });
}
await p.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.evaluate(async () => { if (window.__materialise) { try { await window.__materialise(); } catch {} } });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
const tag = `${device.replace(/\W+/g, "")}-${font === "-" ? "machine" : font.split("/").pop().replace(/-Regular\.ttf$/, "")}`;
const res = [];
for (const v of verses) {
  const got = await p.evaluate(async (v) => {
    const s = [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "").trim().endsWith(v));
    if (!s) return null;
    s.scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 400));
    if (window.__drawAllTies) { try { window.__drawAllTies(); } catch {} }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const box = s.getBoundingClientRect(), vw = document.documentElement.clientWidth, faults = [];
    const he = s.querySelector(".he-text"), hb = he.getBoundingClientRect();
    for (const t of s.querySelectorAll(".he-text .g .g-pc, .he-text .g .g-part, .he-text .g")) {
      if (t.querySelector(".g-pc, .g-part")) continue;
      const rg = document.createRange(); rg.selectNodeContents(t);
      for (const r of rg.getClientRects()) { if (r.width < 1) continue; if (r.left < Math.max(0, box.left) - 0.5 || r.right > Math.min(vw, box.right) + 0.5) { faults.push(`text «${t.textContent.trim().slice(0, 24)}» ${Math.round(r.left)}..${Math.round(r.right)} past the card ${Math.round(box.left)}..${Math.round(box.right)}`); break; } }
      // clipped by an ancestor that hides its overflow
      let a = t.parentElement;
      while (a && a !== s) { const cs = getComputedStyle(a); if (cs.overflowX !== "visible" || cs.overflow !== "visible") { const ab = a.getBoundingClientRect(); const tb = t.getBoundingClientRect(); if (tb.width > 1 && (tb.left < ab.left - 0.5 || tb.right > ab.right + 0.5)) faults.push(`text «${t.textContent.trim().slice(0, 24)}» clipped by .${a.className.split(" ")[0]} (${Math.round(tb.left)}..${Math.round(tb.right)} in ${Math.round(ab.left)}..${Math.round(ab.right)})`); } a = a.parentElement; }
    }
    for (const path of s.querySelectorAll("svg.wj-tie path")) { const bb = path.getBoundingClientRect(); if (bb.width < 1) continue; if (bb.left < Math.max(0, box.left) - 1 || bb.right > Math.min(vw, box.right) + 1) faults.push(`blob ${Math.round(bb.left)}..${Math.round(bb.right)} past the card ${Math.round(box.left)}..${Math.round(box.right)}`); }
    const heFont = getComputedStyle(s.querySelector(".he-text .w") || he).fontFamily.slice(0, 40);
    return { faults: [...new Set(faults)], y: Math.round(box.top + window.scrollY), h: Math.round(box.height), w: Math.round(box.width), vw, scrollW: document.documentElement.scrollWidth, heFont };
  }, v);
  if (!got) { res.push({ v, missing: true }); continue; }
  const s = await p.evaluateHandle((v) => [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "").trim().endsWith(v)), v);
  await s.asElement().screenshot({ path: `${out}/${book}-${v.replace(":", "-")}-${tag}.png` });
  res.push({ v, ...got });
}
console.log(JSON.stringify({ device, font: tag, res }, null, 1));
await b.close();
