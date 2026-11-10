// How a scribal mark's letters are boxed on a page: the four borders of the first few marks, at rest.
// node mark-box.mjs <reader dir> <zone url base> <book>
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, base, book] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
const r = await p.evaluate(() => {
  const out = new Map();
  for (const w of document.querySelectorAll(".he-text .wb.mark > .w")) {
    const cs = getComputedStyle(w), wb = w.parentElement;
    const side = (s) => `${cs[`border${s}Width`]} ${cs[`border${s}Style`]} ${cs[`border${s}Color`]}`;
    const k = `${wb.dataset.mark || "?"} · top ${side("Top")} · right ${side("Right")} · bottom ${side("Bottom")} · left ${side("Left")}`;
    out.set(k, (out.get(k) || 0) + 1);
  }
  return [...out];
});
for (const [k, n] of r) console.log(`${String(n).padStart(4)} · ${k}`);
await b.close();
