// Pictures set side by side in one row, each with its own heading: node row3.mjs <reader dir> <out.png> <caption> <heading> <png> [<heading> <png> ...]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const [reader, out, caption, ...rest] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const uri = (f) => `data:image/png;base64,${readFileSync(f).toString("base64")}`;
let heads = "", cells = "";
for (let i = 0; i < rest.length; i += 2) { heads += `<th>${rest[i]}</th>`; cells += `<td><img src="${uri(rest[i + 1])}"></td>`; }
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#faf6ec;font:15px system-ui,sans-serif;color:#333}p{margin:10px 14px 0}table{border-collapse:separate;border-spacing:14px 6px}th{text-align:left;font-weight:600;vertical-align:bottom}td{vertical-align:top}img{display:block;width:300px;height:auto;border:1px solid #ddd}</style><p>${caption}</p><table><tr>${heads}</tr><tr>${cells}</tr></table>`;
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 1000, height: 400 }, deviceScaleFactor: 1.5 });
await p.setContent(html, { waitUntil: "load" });
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log("row", out);
