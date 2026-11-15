import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const [reader, svgFile] = process.argv.slice(2);
const t = readFileSync(svgFile, "utf8");
const pick = (id) => t.match(new RegExp(`<clipPath id="${id}"><path d="([^"]+)"`))[1];
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const b = await (await loadPlaywright()).chromium.launch(launchOptions());
const p = await b.newPage();
await p.setContent("<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'></svg>");
const out = {};
for (const [name, id] of [["a", "cwr1"], ["d", "cwr3"]]) {
  out[name] = await p.evaluate((d) => {
    const svg = document.querySelector("svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d); svg.appendChild(path);
    const bb = path.getBBox(); const sn = Math.sin(Math.PI / 3), cs = Math.cos(Math.PI / 3);
    const vs = []; const pt = svg.createSVGPoint();
    for (let x = bb.x; x <= bb.x + bb.width; x += 3) for (let y = bb.y; y <= bb.y + bb.height; y += 3) {
      pt.x = x; pt.y = y; if (path.isPointInFill(pt)) vs.push(-x * sn + y * cs);
    }
    path.remove(); vs.sort((a, b) => a - b);
    return { bbox: [bb.x, bb.y, bb.width, bb.height], n: vs.length, vmin: vs[0], vmax: vs[vs.length - 1], vs: vs.filter((_, i) => i % 7 === 0) };
  }, pick(id));
}
await b.close();
const frac = (vs, f) => vs.filter(f).length / vs.length;
const a = out.a, d = out.d;
console.log("a bbox", a.bbox.map(Math.round), "v", Math.round(a.vmin), Math.round(a.vmax));
console.log("d bbox", d.bbox.map(Math.round), "v", Math.round(d.vmin), Math.round(d.vmax));
console.log("a red now", frac(a.vs, (v) => (v >= -1806 && v < -1764) || v >= -1722).toFixed(3));
console.log("d blue now", frac(d.vs, (v) => v < -2730 || (v >= -2688 && v < -2646)).toFixed(3));
for (let k = -50; k <= -30; k++) { const B = k * 42; console.log("a: red where v >=", B, frac(a.vs, (v) => v >= B).toFixed(3)); }
for (let k = -75; k <= -55; k++) { const B = k * 42; console.log("d: blue where v <", B, frac(d.vs, (v) => v < B).toFixed(3)); }
