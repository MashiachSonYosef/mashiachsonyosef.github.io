// The real page under each choice the owner is to pick from: node pick.mjs <base url (zone.html?b=...)> <out dir> [only ids...]
// For each variant: a phone screen of the first verses (the English reader, numbers on) and the same with a card open.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const [url, out, ...only] = process.argv.slice(2);
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (v) => "#" + v.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// a dye lightened toward the linen until it reads at a ratio on a dark ground (or as far as the linen itself)
const lift = (dye, ground, want) => { for (let t = 0; t <= 1.0001; t += 0.02) { const c = mix(dye, "#f3ecd9", t); if (ratio(c, ground) >= want) return c; } return "#f3ecd9"; };
const LINEN = "#ebdec3", SW_LINEN = "#e9dfc4", BLUE = "#23558a", PURPLE = "#642460", SCARLET = "#a52035", GOLD = "#d3af37", BRONZE = "#7f6044", GOLD_NOW = "#93661a", GOLD_LINE = "#a06c10";
const linen = (c) => `--bg:${c}; --press-wash:${mix(c, BRONZE, 0.16)}; --nav-veil:${c}f0;`;
const night = (g) => { const red = lift(SCARLET, g, 4.5), blue = lift(BLUE, g, 4.5), text = lift(PURPLE, g, 7), gold = ratio(GOLD, g) >= 3 ? GOLD : lift(GOLD, g, 3);
  return { css: `html:root { --bg:${g}; --press-wash:${mix(g, "#f3ecd9", 0.10)}; --cell-wash:rgba(243,236,217,.07); --nav-veil:${g}f0;
     --argaman:${text}; --argaman-dim:${mix(text, g, 0.25)}; --shani:${red}; --shani-dim:${mix(red, g, 0.35)}; --halo-shani:${red}bf;
     --tekhelet:${blue}; --tekhelet-dim:${mix(blue, g, 0.35)}; --halo-tekhelet:${blue}bf; --gold:${gold}; --gold-dim:${gold}; --mark-ink:${gold};
     --shadow-pop:0 8px 24px rgba(0,0,0,.5); --shadow-card:0 14px 40px rgba(0,0,0,.55); --shadow-hud:0 18px 48px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.4); }
     html, body { background-color:${g} !important; } body { background-blend-mode: soft-light, soft-light, soft-light, soft-light; }`,
    say: `letters ${red} ${ratio(red, g).toFixed(1)}:1 · readings ${blue} ${ratio(blue, g).toFixed(1)}:1 · gold ${gold} ${ratio(gold, g).toFixed(1)}:1 · page text ${text} ${ratio(text, g).toFixed(1)}:1` }; };
const edge = `svg.wj-tie path.wj-line, #tether .line { filter: drop-shadow(0 0 0.45px #5b4126) drop-shadow(0 0 0.45px #5b4126); }
     .vnum, .rail, #hud, .wb .g-lic, .chip, button.xp-open { box-shadow: 0 0 0 0.5px rgba(91,65,38,.55); }`;
const onLinen = (c) => `letters ${ratio(SCARLET, c).toFixed(1)}:1 · readings ${ratio(BLUE, c).toFixed(1)}:1 · page text ${ratio(PURPLE, c).toFixed(1)}:1 · gold lines ${ratio(GOLD_LINE, c).toFixed(1)}:1`;
const N1 = night(BRONZE), N2 = night("#4a3727"), N3 = night("#2b1f16");
const V = {
  L1: { sheet: "linen", name: "L1 · the linen as it is today (#ebdec3)", say: onLinen(LINEN), css: "" },
  L2: { sheet: "linen", name: "L2 · the swatch's linen as it is (#e9dfc4)", say: onLinen(SW_LINEN), css: `html:root { ${linen(SW_LINEN)} }` },
  L3: { sheet: "linen", name: "L3 · lighter (#f0e8d3)", say: onLinen("#f0e8d3"), css: `html:root { ${linen("#f0e8d3")} }` },
  L4: { sheet: "linen", name: "L4 · lightest (#f6f1e3)", say: onLinen("#f6f1e3"), css: `html:root { ${linen("#f6f1e3")} }` },
  B1: { sheet: "bronze", name: "B1 · the swatch's bronze as it is (#7f6044)", say: N1.say, css: N1.css },
  B2: { sheet: "bronze", name: "B2 · bronze deepened (#4a3727)", say: N2.say, css: N2.css },
  B3: { sheet: "bronze", name: "B3 · deep bronze (#2b1f16)", say: N3.say, css: N3.css },
  G1: { sheet: "gold", name: "G1 · the gold as it is today (writing #93661a, lines and marks #a06c10)", say: `writing ${ratio(GOLD_NOW, LINEN).toFixed(1)}:1 · lines ${ratio(GOLD_LINE, LINEN).toFixed(1)}:1 on the linen`, css: "" },
  G2: { sheet: "gold", name: "G2 · the swatch's gold as it is, everywhere (#d3af37)", say: `${ratio(GOLD, LINEN).toFixed(1)}:1 on the linen: lines, marks and small writing alike`, css: `html:root { --gold:${GOLD}; --gold-dim:${GOLD}; }` },
  G3: { sheet: "gold", name: "G3 · swatch gold lines with a bronze edge; small writing and marks in deep gold", say: `lines ${ratio(GOLD, LINEN).toFixed(1)}:1 with a bronze edge · writing #8a5a00 ${ratio("#8a5a00", LINEN).toFixed(1)}:1 · marks #a8780a ${ratio("#a8780a", LINEN).toFixed(1)}:1`, css: `html:root { --gold:#8a5a00; --gold-dim:${GOLD}; --mark-ink:#a8780a; } ${edge}` },
  G4: { sheet: "gold", name: "G4 · swatch gold lines with a bronze edge; small writing and marks in the swatch's bronze", say: `lines ${ratio(GOLD, LINEN).toFixed(1)}:1 with a bronze edge · writing and marks ${BRONZE} ${ratio(BRONZE, LINEN).toFixed(1)}:1`, css: `html:root { --gold:${BRONZE}; --gold-dim:${GOLD}; --mark-ink:${BRONZE}; } ${edge}` },
  M1: { sheet: "marks", name: "M1 · the points and accents gold, as today", say: `marks ${ratio(GOLD_LINE, LINEN).toFixed(1)}:1 · letters ${ratio(SCARLET, LINEN).toFixed(1)}:1`, css: "" },
  M2: { sheet: "marks", name: "M2 · the points and accents scarlet, as the letters", say: `marks and letters ${ratio(SCARLET, LINEN).toFixed(1)}:1`, css: `html:root { --mark-ink:${SCARLET}; }` },
};
const ids = (only.length ? only : Object.keys(V));
const b = await chromium.launch();
const meta = {};
for (const id of ids) {
  const v = V[id];
  const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(({ css }) => {
    try { localStorage.setItem("fh.mode", "en"); localStorage.setItem("fh.nums", "on"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); } catch {}
    if (css) { const add = () => { const st = document.createElement("style"); st.id = "mock"; st.textContent = css; document.documentElement.append(st); }; if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true }); }
  }, { css: v.css });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForSelector("section.seg .he-text .wb");
  // the palette is read when frames are drawn: the mock stands last in the cascade, then the page redraws
  await p.evaluate(() => { const st = document.getElementById("mock"); if (st) document.documentElement.append(st); window.dispatchEvent(new Event("resize")); });
  await p.waitForTimeout(1800);
  await p.evaluate(() => { const s = document.querySelector("section.seg"); scrollTo(0, s.getBoundingClientRect().top + scrollY - 70); });
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/${id}-line.png` });
  await p.evaluate(() => { const wb = document.querySelectorAll("section.seg .he-text .wb:not(.mark)")[2]; (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); });
  await p.waitForTimeout(1900);
  await p.screenshot({ path: `${out}/${id}-card.png` });
  meta[id] = { sheet: v.sheet, name: v.name, say: v.say };
  console.log(id, v.name, "·", v.say);
  await ctx.close();
}
writeFileSync(`${out}/meta.json`, JSON.stringify(meta, null, 1));
await b.close();
