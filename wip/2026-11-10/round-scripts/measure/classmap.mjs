// Paint what the measure sees around one cell: the number's ink red, other gold green, letters blue. node classmap.mjs <url> <mode> <width> <letters to find> <out.png> [run|card]
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const [url, mode, width, find, out, sel = "run"] = process.argv.slice(2);
const DSF = 4;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: Number(width), height: 5200 }, deviceScaleFactor: DSF });
await ctx.addInitScript((mode) => { try { localStorage.setItem("fh.mode", mode); localStorage.setItem("fh.nums", "on"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); } catch {} }, mode);
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle", timeout: 120000 }); await p.waitForSelector("section.seg .he-text .wb"); await p.waitForTimeout(2500);
const clip = await p.evaluate(({ find, sel }) => { const all = [...document.querySelectorAll(sel === "run" ? "section.seg .he-text .wjoin" : "section.seg .he-text > .wb:not(.mark)")]; const el = all.find((x) => x.textContent.replace(/[^א-ת]/gu, "").startsWith(find)); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 14), width: r.width + 16, height: r.height + 28, cnx: [...el.querySelectorAll(".wb")].concat(el.matches(".wb") ? [el] : []).map((w) => `${w.style.getPropertyValue("--cn")}@${w.style.getPropertyValue("--cn-x") || "corner"}${w.classList.contains("cn-out") ? " out" : ""}`), mask: (el.querySelector("svg.wj-tie > mask") || { innerHTML: "" }).innerHTML.slice(0, 400) }; }, { find, sel });
if (!clip) { console.log("not found"); await b.close(); process.exit(2); }
console.log(clip.cnx.join(" | "), "\n", clip.mask);
const on = await p.screenshot({ clip, timeout: 60000 });
await p.addStyleTag({ content: "body.nums .he-text .wb::after { color: transparent !important; -webkit-text-fill-color: transparent !important; }" }); await p.waitForTimeout(300);
const off = await p.screenshot({ clip, timeout: 60000 });
const png = await p.evaluate(async ({ a, c }) => {
  const load = async (d) => { const im = new Image(); im.src = `data:image/png;base64,${d}`; await im.decode(); const cv = document.createElement("canvas"); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext("2d"); g.drawImage(im, 0, 0); return { cv, g, d: g.getImageData(0, 0, cv.width, cv.height) }; };
  const A = await load(a), B = await load(c), W = A.cv.width, H = A.cv.height;
  const probe = (v) => { const x = document.createElement("span"); x.style.color = v; document.documentElement.append(x); const q = getComputedStyle(x).color.match(/\d+/gu).slice(0, 3).map(Number); x.remove(); return q; };
  const GROUNDS = [probe("var(--bg)"), probe("var(--press-wash)")];
  const INKSET = [["gold", probe("var(--gold-dim)")], ["gold", probe("var(--gold)")], ["ink", probe("var(--shani)")], ["ink", probe("var(--shani-dim)")], ["ink", probe("var(--tekhelet)")], ["ink", probe("var(--tekhelet-dim)")], ["ink", probe("var(--argaman)")]];
  // what a pixel is: the ink whose line from the linen it lies nearest, at least two fifths of the way along it
  const kindOf = (d, i) => {
    let best = null, br = 34;
    for (const g of GROUNDS) for (const [kind, c] of INKSET) {
      const vx = c[0] - g[0], vy = c[1] - g[1], vz = c[2] - g[2], px = d[i] - g[0], py = d[i + 1] - g[1], pz = d[i + 2] - g[2];
      const t = (px * vx + py * vy + pz * vz) / (vx * vx + vy * vy + vz * vz);
      if (t < 0.4) continue;
      const tt = Math.min(t, 1.15), r = Math.hypot(px - tt * vx, py - tt * vy, pz - tt * vz);
      if (r < br) { br = r; best = kind; }
    }
    return best;
  };
  const O = B.g.createImageData(W, H);
  for (let i = 0; i < W * H * 4; i += 4) {
    const changed = Math.abs(A.d.data[i] - B.d.data[i]) + Math.abs(A.d.data[i + 1] - B.d.data[i + 1]) + Math.abs(A.d.data[i + 2] - B.d.data[i + 2]) > 24;
    const now = kindOf(B.d.data, i), was = kindOf(A.d.data, i);
    let c2 = [245, 240, 225];
    if (changed && now === "gold") c2 = [220, 30, 30]; else if (was === "gold") c2 = [20, 150, 40]; else if (was === "ink") c2 = [60, 90, 200];
    O.data[i] = c2[0]; O.data[i + 1] = c2[1]; O.data[i + 2] = c2[2]; O.data[i + 3] = 255;
  }
  B.g.putImageData(O, 0, 0); return B.cv.toDataURL("image/png").split(",")[1];
}, { a: off.toString("base64"), c: on.toString("base64") });
writeFileSync(out, Buffer.from(png, "base64")); writeFileSync(out.replace(/\.png$/u, "-real.png"), on);
await b.close();
