// Two pictures of the same page set side by side under a plain label each, so a before and an after are read at once.
// node side-by-side.mjs <reader dir> <left.png> <left label> <right.png> <right label> <out.png>
// The pictures are laid at their own pixels; nothing is scaled.
import { pathToFileURL } from "node:url";
import { join, resolve } from "node:path";
import { readFileSync } from "node:fs";
const [reader, left, leftLabel, right, rightLabel, out] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const size = (file) => { const b = readFileSync(file); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
const A = size(left), B = size(right);
const GAP = 24, BAND = 64;
const W = A.w + GAP + B.w, H = Math.max(A.h, B.h) + BAND;
const esc = (s) => String(s).replace(/[&<>"]/gu, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const data = (file) => `data:image/png;base64,${readFileSync(resolve(file)).toString("base64")}`;
const html = `<!doctype html><meta charset="utf-8"><style>
  html, body { margin: 0; background: #faf6ec; }
  .sheet { width: ${W}px; height: ${H}px; position: relative; font: 700 34px/1 Georgia, serif; color: #5a3c0a; }
  .lab { position: absolute; top: 0; height: ${BAND}px; display: flex; align-items: center; justify-content: center; }
  img { position: absolute; top: ${BAND}px; display: block; }
</style><div class="sheet">
  <div class="lab" style="left:0;width:${A.w}px">${esc(leftLabel)}</div>
  <div class="lab" style="left:${A.w + GAP}px;width:${B.w}px">${esc(rightLabel)}</div>
  <img src="${data(left)}" width="${A.w}" height="${A.h}" style="left:0">
  <img src="${data(right)}" width="${B.w}" height="${B.h}" style="left:${A.w + GAP}px">
</div>`;
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await (await b.newContext({ viewport: { width: W, height: Math.min(H, 2000) }, deviceScaleFactor: 1 })).newPage();
await p.setContent(html, { waitUntil: "load" });
await p.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H }, fullPage: true });
await b.close();
console.log(`${out} · ${W} x ${H}`);
