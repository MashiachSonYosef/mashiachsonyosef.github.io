// Ship 10: one before-and-after picture per verse, from the phone shots. node pair-shots.mjs <shots dir> <out dir> <label>...
import { createRequire } from "node:module";
import fs from "node:fs";
const pw = createRequire(import.meta.url)("playwright");
const [src, out, ...labels] = process.argv.slice(2);
const b = await pw.chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 2 });
for (const lab of labels) {
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#faf6ec;font:600 15px system-ui,sans-serif;color:#3a2a20}
  .row{display:flex;gap:16px;padding:14px}.col{flex:1}.col p{margin:0 0 8px}.col img{width:100%;display:block;border:1px solid #cdbfa5;border-radius:6px}</style>
  <div class="row"><div class="col"><p>Before (live today), Isaiah ${lab.replace("-", ":")}</p><img src="file://${src}/isaiah-${lab}-maqaf.png"></div>
  <div class="col"><p>After (ship 10)</p><img src="file://${src}/isaiah-${lab}-rest.png"></div></div>`;
  const f = `${out}/pair-${lab}.html`; fs.writeFileSync(f, html);
  await p.goto(`file://${f}`); await p.waitForLoadState("networkidle");
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.setViewportSize({ width: 900, height: Math.min(h, 1000) });
  await p.screenshot({ path: `${out}/isaiah-${lab}-before-after.png`, clip: { x: 0, y: 0, width: 900, height: Math.min(h, 980) } });
  fs.unlinkSync(f);
}
await b.close();
