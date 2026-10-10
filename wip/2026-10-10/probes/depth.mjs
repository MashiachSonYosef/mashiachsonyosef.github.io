// how deep the ink goes under the baseline, by the pixels, at the reader's own face: letters, the ordinary vowel row, and every surface on the shelf
import { loadPlaywright, launchOptions } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/playwright-v1.mjs";
import { readFileSync } from "node:fs";
const surfaces = JSON.parse(readFileSync(process.argv[2], "utf8"));
const { chromium } = await loadPlaywright();
const br = await chromium.launch(launchOptions());
const pg = await br.newPage();
await pg.goto("http://127.0.0.1:8921/reader/zone-zig2-tmp.html?b=genesis", { waitUntil: "networkidle" });
await pg.waitForSelector(".he-text .wb .w");
const r = await pg.evaluate((surfaces) => {
  const w = document.querySelector(".he-text .wb .w"); const cs = getComputedStyle(w);
  const font = `${cs.fontStyle} ${cs.fontWeight} 24px ${cs.fontFamily}`;
  const S = 3, cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
  const quick = document.createElement("canvas").getContext("2d"); quick.font = font;
  const botOf = (str) => { cx.setTransform(1, 0, 0, 1, 0, 0); cx.font = font; const m = cx.measureText(str); const ox = Math.ceil(Math.max(0, m.actualBoundingBoxLeft)) + 2, oy = Math.ceil(Math.max(0, m.actualBoundingBoxAscent)) + 2, dn = Math.ceil(Math.max(0, m.actualBoundingBoxDescent)) + 2; const W = (ox + Math.ceil(Math.max(0, m.actualBoundingBoxRight)) + 2) * S, H = (oy + dn) * S; if (cv.width < W) cv.width = W; if (cv.height < H) cv.height = H; cx.clearRect(0, 0, cv.width, cv.height); cx.setTransform(S, 0, 0, S, 0, 0); cx.font = font; cx.direction = "rtl"; cx.textAlign = "right"; cx.fillText(str, ox, oy); const px = cx.getImageData(0, 0, W, H).data; for (let y = H - 1; y >= 0; y -= 1) for (let x = 0; x < W; x += 1) if (px[(y * W + x) * 4 + 3] > 64) return (y + 1) / S - oy; return 0; };
  const L = (c) => String.fromCharCode(c);
  const desc = [0x05da, 0x05df, 0x05e3, 0x05e5, 0x05e7];
  const letters = []; for (let c = 0x05d0; c <= 0x05ea; c += 1) letters.push([L(c), botOf(L(c))]);
  const plain = letters.filter(([ch]) => !desc.includes(ch.charCodeAt(0)));
  const vowels = [0x05b0, 0x05b1, 0x05b2, 0x05b3, 0x05b4, 0x05b5, 0x05b6, 0x05b7, 0x05b8, 0x05bb, 0x05c7];
  const vrow = []; for (const [ch] of plain) for (const v of vowels) vrow.push([ch + L(v), botOf(ch + L(v))]);
  vrow.sort((a, b) => b[1] - a[1]);
  const cands = surfaces.filter(([s]) => quick.measureText(s).actualBoundingBoxDescent >= 5);
  const bots = cands.map(([s, at]) => [botOf(s), s, at]).sort((a, b) => b[0] - a[0]);
  const hist = {}; for (const [b] of bots) { const k = Math.floor(b * 2) / 2; hist[k] = (hist[k] || 0) + 1; }
  return { font, plainMax: Math.max(...plain.map((x) => x[1])), descenders: letters.filter(([ch]) => desc.includes(ch.charCodeAt(0))).map(([ch, b]) => `U+${ch.charCodeAt(0).toString(16)} ${b.toFixed(2)}`),
    vowelRowMax: vrow[0][1], vowelRowTop: vrow.slice(0, 4).map(([s, b]) => `${[...s].map((c) => c.charCodeAt(0).toString(16)).join(" ")} ${b.toFixed(2)}`),
    measured: cands.length, of: surfaces.length, hist, deepest: bots.slice(0, 8).map(([b, s, at]) => `${b.toFixed(2)} ${[...s].map((c) => c.charCodeAt(0).toString(16)).join(" ")} (${at})`) };
}, surfaces);
console.log(JSON.stringify(r, null, 1));
await br.close();
