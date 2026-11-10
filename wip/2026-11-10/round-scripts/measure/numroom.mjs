// Does a card's number touch other gold? The page is photographed with the numbers off and on; what changed and is gold
// is the numbers' own ink; every other gold pixel (frames, ties, rules, the marks) and every letter's ink is what it must
// stay clear of. Reports, per reader, how near each cell's number comes to other gold and to ink, and what lies outside a cell.
// node numroom.mjs <url> <mode en|he> [width] [css file] [crop out prefix]
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const [url, mode = "en", width = "412", cssFile = "", cropOut = ""] = process.argv.slice(2);
const css = cssFile ? readFileSync(cssFile, "utf8") : "";
const DSF = 2, H = Number(process.env.VH || 5200);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: Number(width), height: H }, deviceScaleFactor: DSF });
await ctx.addInitScript(({ mode, css }) => {
  try { localStorage.setItem("fh.mode", mode); localStorage.setItem("fh.nums", "on"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); } catch {}
  if (css) { const add = () => { const st = document.createElement("style"); st.id = "mock"; st.textContent = css; document.documentElement.append(st); }; if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true }); }
}, { mode, css });
const T0 = Date.now(); const lap = (n) => { if (process.env.LAPS) console.log(`    [${n} ${((Date.now() - T0) / 1000).toFixed(1)}s]`); };
const p = await ctx.newPage();
const errs = []; p.on("pageerror", (e) => errs.push(String(e.message).slice(0, 160)));
await p.goto(url, { waitUntil: "networkidle", timeout: 120000 }); await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(async () => { const st = document.getElementById("mock"); if (st) document.documentElement.append(st); let g = 0; while (g < 400) { window.scrollTo(0, 0); const n = [...document.querySelectorAll("section.seg.seg-wait")].find((x) => x.getBoundingClientRect().top < innerHeight); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 30)); g += 1; } window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 900)); });
const cells = await p.evaluate((H) => [...document.querySelectorAll("section.seg .he-text > .wb:not(.mark), section.seg .he-text .wjoin")].map((c) => {
  const r = c.getBoundingClientRect();
  return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height, run: c.classList.contains("wjoin"), words: c.classList.contains("wjoin") ? c.querySelectorAll(".wb:not(.mark)").length : 1, tied: c.classList.contains("tied") || !!c.querySelector("svg path"), text: (c.querySelector(".w") || c).textContent.slice(0, 14), cn: getComputedStyle(c.classList.contains("wjoin") ? c.querySelector(".wb:not(.mark)") : c).getPropertyValue("--cn") };
}).filter((c) => c.y + c.h < H - 4), H);
lap("built"); await p.waitForTimeout(500);
const on = await p.screenshot({ timeout: 120000 });
// the same page with the numbers' own ink unseen and everything else as it stands (a line that gave way stays parted)
await p.addStyleTag({ content: "body.nums .he-text .wb::after { color: transparent !important; -webkit-text-fill-color: transparent !important; }" }); await p.waitForTimeout(400);
const off = await p.screenshot({ timeout: 120000 }); lap("shots");
const res = await p.evaluate(async ({ a, c, cells, DSF }) => {
  const load = async (d) => { const im = new Image(); im.src = `data:image/png;base64,${d}`; await im.decode(); const cv = document.createElement("canvas"); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0); return g.getImageData(0, 0, cv.width, cv.height); };
  const A = await load(a), B = await load(c), W = A.width, Hh = A.height;
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
  // per pixel: 1 the number's ink (changed, gold now), 2 other gold, 3 letters' or readings' ink
  const K = new Uint8Array(W * Hh);
  for (let i = 0, n = 0; n < W * Hh; i += 4, n += 1) {
    const changed = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 24;
    const now = kindOf(B.data, i), was = kindOf(A.data, i);
    // a number's ink is what its own drawing changed; other gold is what stands there without it
    if (changed && now === "gold") K[n] = 1; else if (was === "gold") K[n] = 2; else if (was === "ink") K[n] = 3;
  }
  const inCell = new Uint8Array(W * Hh);
  const out = [];
  for (const cell of cells) {
    const X0 = Math.max(0, Math.floor(cell.x * DSF)), Y0 = Math.max(0, Math.floor(cell.y * DSF)), X1 = Math.min(W, Math.ceil((cell.x + cell.w) * DSF)), Y1 = Math.min(Hh, Math.ceil((cell.y + cell.h) * DSF));
    let ink = 0, minGold = 99, minInk = 99, bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
    const RAD = 10;
    for (let y = Y0; y < Y1; y += 1) for (let x = X0; x < X1; x += 1) {
      const n = y * W + x; inCell[n] = 1;
      if (K[n] !== 1) continue;
      ink += 1; bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y);
      for (let dy = -RAD; dy <= RAD; dy += 1) for (let dx = -RAD; dx <= RAD; dx += 1) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= Hh) continue;
        const k = K[yy * W + xx]; if (k < 2) continue;
        const d = Math.hypot(dx, dy) / DSF;
        if (k === 2 && d < minGold) minGold = d; else if (k === 3 && d < minInk) minInk = d;
      }
    }
    out.push({ ...cell, ink, minGold, minInk, box: ink ? { x: (bx0 / DSF - cell.x), y: (by0 / DSF - cell.y), w: (bx1 - bx0 + 1) / DSF, h: (by1 - by0 + 1) / DSF } : null });
  }
  let outside = 0; const where = new Map();
  for (let n = 0; n < W * Hh; n += 1) if (K[n] === 1 && !inCell[n]) {
    outside += 1; const x = (n % W) / DSF, y = Math.floor(n / W) / DSF;
    let best = null, bd = 1e9; for (const c of cells) { const dx = Math.max(c.x - x, 0, x - c.x - c.w), dy = Math.max(c.y - y, 0, y - c.y - c.h), d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = c; } }
    if (best) { const k = `${best.cn} ${best.text}`; const e = where.get(k) || { n: 0, d: 0, side: "" }; e.n += 1; e.d = Math.max(e.d, bd); e.side = y < best.y ? "above" : y > best.y + best.h ? "below" : x < best.x ? "left" : "right"; where.set(k, e); }
  }
  return { out, outside, where: [...where].map(([k, e]) => `${k}: ${e.n}px ${e.side}, up to ${e.d.toFixed(1)}px out`) };
}, { a: off.toString("base64"), c: on.toString("base64"), cells, DSF });
lap("judged"); const marks = await p.evaluate(() => ({ out: document.querySelectorAll('section.seg:not(.seg-wait) .he-text .wb.cn-out').length, parted: document.querySelectorAll('section.seg:not(.seg-wait) .he-text svg.wj-tie > mask.cn-mask').length, moved: [...document.querySelectorAll('section.seg:not(.seg-wait) .he-text .wb')].filter((w) => w.style.getPropertyValue('--cn-x')).length, all: document.querySelectorAll('section.seg:not(.seg-wait) .he-text .wb:not(.mark)').length }));
const cellsOut = res.out;
const q = (v, f) => v[Math.floor((v.length - 1) * f)];
const rep = (label, list) => {
  if (!list.length) return console.log(`  ${label}: none`);
  const noNum = list.filter((c) => !c.ink).length;
  const g = list.filter((c) => c.ink).map((c) => c.minGold).sort((x, y) => x - y), k = list.filter((c) => c.ink).map((c) => c.minInk).sort((x, y) => x - y);
  console.log(`  ${label}: ${list.length} cells${noNum ? `, ${noNum} show no number` : ""} · nearest other gold: least ${g[0].toFixed(1)}px, 5% ${q(g, 0.05).toFixed(1)}, half ${q(g, 0.5).toFixed(1)}; under 1px at ${g.filter((x) => x < 1).length}, under 2px at ${g.filter((x) => x < 2).length}, under 3px at ${g.filter((x) => x < 3).length} · nearest ink: least ${k[0].toFixed(1)}px, under 1px at ${k.filter((x) => x < 1).length}, under 2px at ${k.filter((x) => x < 2).length}`);
  const tight = list.filter((c) => c.ink && c.minGold < 2).slice(0, 8).map((c) => `${c.cn} ${c.text} (${c.minGold.toFixed(1)}px${c.tied ? ", framed" : ""})`);
  if (tight.length) console.log(`     nearest gold under 2px: ${tight.join(" · ")}`);
};
console.log(`${url} · ${mode} reader · ${width}px${cssFile ? " · " + cssFile : " · as built"} · ${cellsOut.length} cells`);
rep("cards of one word", cellsOut.filter((c) => !c.run));
rep("  of them framed", cellsOut.filter((c) => !c.run && c.tied));
rep("runs", cellsOut.filter((c) => c.run));
console.log(`  of ${marks.all} numbers built: ${marks.moved} stand away from their corner, ${marks.parted} cells part a frame's line for one, ${marks.out} hang outside their card`);
console.log(`  number ink outside every cell: ${res.outside} px${res.where.length ? " · " + res.where.slice(0, 6).join(" · ") : ""}`);
const boxes = cellsOut.filter((c) => c.box && !c.run).map((c) => c.box);
if (boxes.length) console.log(`  the number's ink in a one-word card: from the card's left ${Math.min(...boxes.map((x) => x.x)).toFixed(1)}–${Math.max(...boxes.map((x) => x.x)).toFixed(1)}px, from its top ${Math.min(...boxes.map((x) => x.y)).toFixed(1)}–${Math.max(...boxes.map((x) => x.y)).toFixed(1)}px, ${Math.max(...boxes.map((x) => x.w)).toFixed(1)}px wide at most, ${Math.max(...boxes.map((x) => x.h)).toFixed(1)}px tall at most; from the card's foot ${Math.min(...cellsOut.filter((c) => c.box && !c.run).map((c) => c.h - c.box.y - c.box.h)).toFixed(1)}px at least`);
if (errs.length) console.log("  page errors:", errs.slice(0, 2).join(" | "));
if (cropOut) { writeFileSync(cropOut + "-on.png", on); writeFileSync(cropOut + "-cells.json", JSON.stringify(cellsOut)); }
await b.close();
