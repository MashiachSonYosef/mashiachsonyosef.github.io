// The woven name (option 3: pale gold thread, deeper gold edge) on grounds of linen and bronze.
// node ground.mjs <reader dir> <logo svg> <out png>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
const [reader, svgPath, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (v) => "#" + v.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const lift = (dye, ground, want) => { for (let t = 0; t <= 1.0001; t += 0.02) { const c = mix(dye, "#f3ecd9", t); if (ratio(c, ground) >= want) return c; } return "#f3ecd9"; };
const LINEN = "#f6f1e3", BRONZE = "#2b1f16", BRONZE_SW = "#7f6044", PALE = "#d3af37";
const svg = readFileSync(svgPath, "utf8").replace(/<\?xml[^>]*>/, "");
// by night the dyes are lifted until they read on the deep bronze, as the dark mode lifts them; the gold stays
const night = {};
for (const [reg, dim] of [["#a52035", "#be6367"], ["#23558a", "#768ea2"], ["#642460", "#753c6d"]]) {
  const r = lift(reg, BRONZE, 4.5); night[reg] = r; night[dim] = mix(r, "#f3ecd9", 0.3);
}
const svgNight = Object.entries(night).reduce((s, [a, b]) => s.split(a).join(b), svg);
// the grounds
const weave = (base, thread, a) => `background-color:${base};background-image:repeating-linear-gradient(0deg, ${thread}${a} 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, ${thread}${a} 0 1px, transparent 1px 3px);`;
const G = [
  { id: "1", name: "1 · linen cloth: the name woven into a linen ground, a gold frame line", css: `${weave(LINEN, "#8a7350", "22")} border:1.5px solid ${PALE};`, logo: svg },
  { id: "2", name: "2 · the court: linen hangings standing on a bronze base (Exodus 27:9–10, 17)", css: `${weave(LINEN, "#8a7350", "22")} border:1.5px solid ${PALE}; box-shadow: inset 0 -16px 0 ${BRONZE_SW}, inset 0 -18px 0 ${PALE};`, logo: svg, pad: "padding-bottom:40px;" },
  { id: "3", name: "3 · linen and bronze woven: bronze threads crossing the linen", css: `background-color:${LINEN};background-image:repeating-linear-gradient(0deg, ${BRONZE_SW}30 0 2px, transparent 2px 7px), repeating-linear-gradient(90deg, #8a735022 0 1px, transparent 1px 3px); border:1.5px solid ${PALE};`, logo: svg },
  { id: "4", name: "4 · bronze by night: the deep bronze, the dyes lifted as the dark mode lifts them", css: `${weave(BRONZE, "#f3ecd9", "0d")} border:1.5px solid ${PALE};`, logo: svgNight },
];
const tile = (g, w) => `<div class="tile" style="${g.css}${g.pad || ""}"><div style="width:${w}px">${g.logo.replace("<svg ", `<svg width="${w}" height="${Math.round(w * 87.9 / 710.2)}" `)}</div></div>`;
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:28px;background:#fff;font:15px Georgia,serif;color:#222}
h1{font-size:24px;font-weight:400;margin:0 0 16px}.row{display:flex;gap:26px;align-items:flex-start;margin-bottom:26px}
.col{width:780px}h2{font-size:15px;margin:0 0 8px}.tile{display:inline-block;padding:30px 34px;border-radius:12px}
.small .tile{padding:12px 14px;border-radius:8px}
</style><h1>The woven name on linen and bronze</h1>
${G.map((g) => `<div class="row"><div class="col"><h2>${g.name}</h2>${tile(g, 700)}</div><div class="col small"><h2>&nbsp;</h2>${tile(g, 260)}</div></div>`).join("")}`;
writeFileSync(out.replace(/\.png$/, ".html"), html);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 1700, height: 900 }, deviceScaleFactor: 2 });
await p.setContent(html); await p.waitForTimeout(400);
await p.screenshot({ path: out, fullPage: true }); await b.close();
console.log("night dyes:", JSON.stringify(night));
