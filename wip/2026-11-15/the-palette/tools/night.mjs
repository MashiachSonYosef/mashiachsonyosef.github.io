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
const lift = (dye, ground, want) => { for (let t = 0; t <= 1.0001; t += 0.02) { const c = mix(dye, "#f3ecd9", t); if (ratio(c, ground) >= want) return c; } return "#f3ecd9"; };
const night = (g) => { const red = lift(SCARLET, g, 4.5), blue = lift(BLUE, g, 4.5), text = lift(PURPLE, g, 7), gold = ratio(PALE, g) >= 3 ? PALE : lift(PALE, g, 3);
  return { css: `html:root { --bg:${g}; --press-wash:${mix(g, "#f3ecd9", 0.10)}; --cell-wash:rgba(243,236,217,.07); --nav-veil:${g}f0;
     --argaman:${text}; --argaman-dim:${mix(text, g, 0.25)}; --shani:${red}; --shani-dim:${mix(red, g, 0.35)}; --halo-shani:${red}bf;
     --tekhelet:${blue}; --tekhelet-dim:${mix(blue, g, 0.35)}; --halo-tekhelet:${blue}bf; --gold:${gold}; --gold-dim:${gold}; --mark-ink:${gold};
     --shadow-pop:0 8px 24px rgba(0,0,0,.5); --shadow-card:0 14px 40px rgba(0,0,0,.55); --shadow-hud:0 18px 48px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.4); }
     html, body { background-color:${g} !important; } body { background-blend-mode: soft-light, soft-light, soft-light, soft-light; } ${HUD}`,
    say: `letters ${ratio(red, g).toFixed(1)}:1 · readings ${ratio(blue, g).toFixed(1)}:1 · gold ${gold} ${ratio(gold, g).toFixed(1)}:1 · page text ${ratio(text, g).toFixed(1)}:1` }; };
const N1 = night("#7f6044"), N2 = night("#4a3727"), N3 = night("#2b1f16");
const V = [
  { id: "D", name: "Light · D, as chosen: pale gold #d3af37 on the linen #f6f1e3", say: say("#f6f1e3", PALE), css: `html:root { ${pale} ${linen("#f6f1e3")} } ${HUD}` },
  { id: "N1", name: "Dark · the swatch's bronze as it is #7f6044", say: N1.say, css: N1.css },
  { id: "N2", name: "Dark · bronze deepened #4a3727", say: N2.say, css: N2.css },
  { id: "N3", name: "Dark · deep bronze #2b1f16", say: N3.say, css: N3.css },
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
writeFileSync(`${out}/sheet.html`, `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#fff;font:15px Georgia,serif;color:#222}h1{font-size:26px;font-weight:400;margin:0 0 14px}.row{display:flex;gap:16px}.col{width:412px}h2{font-size:16px;margin:0 0 4px;min-height:44px}p{font-size:13px;color:#555;margin:0 0 10px;min-height:34px}img{width:412px;display:block;margin-bottom:12px;border:1px solid #ccc}</style><h1>Light mode D, and bronze for a dark mode (pale gold, the card outlined in gold)</h1><div class="row">${cols}</div>`);
const sp = await b.newPage({ viewport: { width: 4 * 412 + 3 * 16 + 48, height: 1000 }, deviceScaleFactor: 2 });
await sp.goto(pathToFileURL(`${out}/sheet.html`).href);
await sp.waitForTimeout(600);
await sp.screenshot({ path: `${out}/bronze-night-sheet.png`, fullPage: true });
writeFileSync(`${out}/meta.json`, JSON.stringify(meta, null, 1));
await b.close();
