// Pictures set side by side in rows, "now" on the left and "proposed" on the right, one row per pair, captioned.
// node pair.mjs <reader dir> <out.png> <caption> <left.png> <right.png> [<caption> <left.png> <right.png> ...]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const [reader, out, ...rest] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const uri = (f) => `data:image/png;base64,${readFileSync(f).toString("base64")}`;
let rows = "";
for (let i = 0; i < rest.length; i += 3) rows += `<tr><td class="c" colspan="2">${rest[i]}</td></tr><tr><td><img src="${uri(rest[i + 1])}"></td><td><img src="${uri(rest[i + 2])}"></td></tr>`;
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#faf6ec;font:15px system-ui,sans-serif;color:#333}table{border-collapse:separate;border-spacing:14px 6px;margin:6px}th{text-align:left;font-weight:600}td.c{padding-top:8px;color:#555}img{display:block;width:auto;height:auto;max-width:420px;border:1px solid #ddd}</style><table><tr><th>now (live)</th><th>proposed</th></tr>${rows}</table>`;
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 900, height: 400 }, deviceScaleFactor: 1 });
await p.setContent(html, { waitUntil: "load" });
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log("pair", out);
