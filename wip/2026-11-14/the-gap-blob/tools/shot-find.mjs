// The first word on a zone page whose laid line holds a gap of the shape asked, pictured with its neighbors.
// node shot-find.mjs <reader dir> <zone url> <book> <between|start|end> <out.png> [scale] [en] [skip]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const [reader, url, book, kind, out, scale, modeEn, skip] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 900 }, deviceScaleFactor: Number(scale || 2) });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh */ } });
await p.goto(`${url}?b=${book}${modeEn === "en" ? "&mode=en" : ""}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
let found = null;
const n = await p.evaluate(() => document.querySelectorAll("section.seg").length);
for (let si = 0; si < Math.min(n, 80) && !found; si += 1) {
  await p.evaluate((si) => document.querySelectorAll("section.seg")[si].scrollIntoView({ block: "center" }), si);
  await p.waitForTimeout(250);
  found = await p.evaluate(([si, kind, skip]) => {
    const sec = document.querySelectorAll("section.seg")[si];
    let k = 0;
    for (const row of sec.querySelectorAll(".he-text > .wb > .g > .g-pcs")) {
      const pcs = [...row.querySelectorAll(":scope > .g-pc")];
      const at = pcs.map((x, i) => (x.classList.contains("gap") ? i : -1)).filter((i) => i >= 0);
      if (!at.length) continue;
      const ok = kind === "between" ? at.some((i) => i > 0 && i < pcs.length - 1) : kind === "start" ? at.includes(0) : at.includes(pcs.length - 1);
      if (!ok) continue;
      if (k++ < skip) continue;
      const wb = row.closest(".wb"); wb.id = "__shot"; wb.scrollIntoView({ block: "center" });
      return { si, text: pcs.map((x) => (x.classList.contains("gap") ? "[gap]" : x.textContent)).join(" | "), vnum: (sec.querySelector(".vnum") || {}).textContent || "?" };
    }
    return null;
  }, [si, kind, Number(skip || 0)]);
}
if (!found) { console.log("none found"); process.exit(1); }
await p.waitForTimeout(1500);
const box = await p.evaluate(() => { const q = document.getElementById("__shot").getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; });
const pad = 40;
await p.screenshot({ path: out, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(412 - Math.max(0, box.x - pad), box.w + 2 * pad), height: box.h + 2 * pad } });
console.log("shot", out, JSON.stringify(found));
await b.close();
