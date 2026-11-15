// The swatch's pale gold on the live page, on today's linen and on lighter linens. A phone screen of the first verses
// (the English reader, numbers on, as the sheets of 10 November) and the same with a card open.
// node pale-gold.mjs <reader dir> <url ?b=...> <out dir>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
const [reader, url, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (v) => "#" + v.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const LINEN = "#ebdec3", BLUE = "#23558a", PURPLE = "#642460", SCARLET = "#a52035", PALE = "#d3af37", BRONZE = "#7f6044", GOLD_NOW = "#93661a", GOLD_LINE = "#a06c10";
const linen = (c) => `--bg:${c}; --press-wash:${mix(c, BRONZE, 0.16)}; --nav-veil:${c}f0;`;
const pale = `--gold:${PALE}; --gold-dim:${PALE};`;
const say = (bg, gold) => `gold ${ratio(gold, bg).toFixed(1)}:1 · scarlet ${ratio(SCARLET, bg).toFixed(1)}:1 · blue ${ratio(BLUE, bg).toFixed(1)}:1 · purple ${ratio(PURPLE, bg).toFixed(1)}:1`;
const HUD = `#hud { border-color: var(--gold-dim); } #hud.moved { box-shadow: var(--shadow-card), 0 0 0 1px var(--gold-dim); } #hud .d-also-m:hover { border-color: var(--gold-dim); } .rail .def-order.src-list .dfp.on, .rail .def-order.src-list .dfp:hover, .rail .decl-bx[aria-pressed="true"]:not(:disabled) { border-color: var(--gold); }`;
const SILVER = "#7c8187", SILVER_LIGHT = "#a3a7ad", BRONZE_PTR = "#7f6044";
const metals = (marks) => `html:root { --gold:${SILVER}; --gold-dim:${SILVER}; --mark-ink:${marks}; }
  #hud { border-color:${SILVER}; } #hud.moved { box-shadow: var(--shadow-card), 0 0 0 1px ${SILVER}; }
  #tether .line { stroke:${BRONZE_PTR}; stroke-width:1.75; }`;
const VOICE = "#5b5f65", VOICE_DIM = "#6c7177", BRZ = "#7f6044";
const bronzeHud = `html:root { --gold:${BRZ}; --gold-dim:${BRZ}; --mark-ink:#a06c10; --argaman:${VOICE}; --argaman-dim:${VOICE_DIM}; }
  #hud { border-color:${BRZ}; } #hud.moved { box-shadow: var(--shadow-card), 0 0 0 1px ${BRZ}; }
  #tether .line { stroke:${BRZ}; stroke-width:1.75; }`;
const SIL = "#7c8187";
const scheme = (marks) => `html:root { --gold:${BRZ}; --gold-dim:${BRZ}; --mark-ink:${marks}; }
  #hud { border-color:${BRZ}; } #hud.moved { box-shadow: var(--shadow-card), 0 0 0 1px ${BRZ}; }
  #tether .line { stroke:${BRZ}; stroke-width:1.75; }
  svg.wj-tie path.wj-line { stroke:${SIL} !important; }`;
const V = [
  { id: "T", name: "Today, live (the card's outline purple)", say: `gold lines ${ratio("#a06c10", LINEN).toFixed(1)}:1 on the linen #ebdec3`, css: "" },
  { id: "S", name: "Silver blobs (our layering), bronze card, outlines and pointers, gold Masoretic signs; purple, blue, scarlet as today", say: `silver ${ratio(SIL, LINEN).toFixed(1)}:1 · bronze ${ratio(BRZ, LINEN).toFixed(1)}:1 · gold signs ${ratio("#a06c10", LINEN).toFixed(1)}:1`, css: scheme("#a06c10") },
];
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const meta = [];
for (const v of V) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(({ css }) => {
    try { localStorage.setItem("fh.mode", "en"); localStorage.setItem("fh.nums", "on"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); } catch { /* a first visit */ }
    if (css) { const add = () => { const st = document.createElement("style"); st.id = "mock"; st.textContent = css; document.documentElement.append(st); }; if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true }); }
  }, { css: v.css });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log(v.id, "PAGE ERROR", e.message));
  await p.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.evaluate(() => { const st = document.getElementById("mock"); if (st) document.documentElement.append(st); window.dispatchEvent(new Event("resize")); });
  await p.waitForTimeout(1800);
  await p.evaluate(() => { const s = document.querySelector("section.seg"); scrollTo(0, s.getBoundingClientRect().top + scrollY - 70); });
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/${v.id}-line.png` });
  await p.evaluate(() => { const wb = document.querySelectorAll("section.seg .he-text .wb:not(.mark)")[2]; (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); });
  await p.waitForTimeout(1900);
  await p.screenshot({ path: `${out}/${v.id}-card.png` });
  const got = await p.evaluate(() => { const cs = getComputedStyle(document.documentElement); return { bg: cs.getPropertyValue("--bg").trim(), gold: cs.getPropertyValue("--gold").trim(), body: getComputedStyle(document.body).backgroundColor }; });
  meta.push({ id: v.id, name: v.name, say: v.say, got });
  console.log(v.id, JSON.stringify(got), "·", v.say);
  await ctx.close();
}
// the sheet: the four columns side by side, screen over card
const cols = meta.map((m) => `<div class="col"><h2>${m.name}</h2><p>${m.say}</p><img src="${m.id}-line.png"><img src="${m.id}-card.png"></div>`).join("");
writeFileSync(`${out}/sheet.html`, `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#fff;font:15px Georgia,serif;color:#222}h1{font-size:26px;font-weight:400;margin:0 0 14px}.row{display:flex;gap:16px}.col{width:412px}h2{font-size:16px;margin:0 0 4px;min-height:44px}p{font-size:13px;color:#555;margin:0 0 10px;min-height:34px}img{width:412px;display:block;margin-bottom:12px;border:1px solid #ccc}</style><h1>Silver for our layering, bronze for the card, gold for the signs</h1><div class="row">${cols}</div>`);
const sp = await b.newPage({ viewport: { width: 2 * 412 + 3 * 16 + 48, height: 1000 }, deviceScaleFactor: 2 });
await sp.goto(pathToFileURL(`${out}/sheet.html`).href);
await sp.waitForTimeout(600);
await sp.screenshot({ path: `${out}/scheme-sheet.png`, fullPage: true });
writeFileSync(`${out}/meta.json`, JSON.stringify(meta, null, 1));
await b.close();
