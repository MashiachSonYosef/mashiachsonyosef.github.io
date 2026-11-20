// Ship 10: the joined cells of one verse, each word's own line and whose it is. node cell-probe.mjs <base> <book> <label> [query]
import { createRequire } from "node:module";
const pw = createRequire(import.meta.url)("playwright");
const [base, book, label, query = ""] = process.argv.slice(2);
const b = await pw.chromium.launch();
const p = await (await b.newContext({ ...pw.devices["Pixel 7"] })).newPage();
await p.goto(`${base}/zone.html?b=${book}${query}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.evaluate(async () => { if (window.__materialise) { try { await window.__materialise(); } catch {} } });
await p.waitForTimeout(1200);
const r = await p.evaluate((label) => {
  const s = [...document.querySelectorAll("section.seg")].find((x) => x.__sec && String(x.__sec.label) === label);
  if (!s) return null;
  const esc = (t) => String(t).replace(/[֐-׿]/gu, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
  return [...s.querySelectorAll(".he-text .wjoin")].map((j) => ({ key: j.__key ? esc(j.__key) : null, cls: j.className, row: (j.querySelector(":scope > .g") || {}).textContent,
    words: [...j.querySelectorAll(".wj-ink > .wb")].map((wb) => { const g = wb.querySelector(":scope > .g"); const w = wb.__word || {}; return { s: esc(w.s || ""), own: g ? g.textContent : null, src: g ? g.dataset.src || null : null, layer: g ? g.dataset.layer || null : null, pg: Array.isArray(w.pg) ? w.pg.map((x) => x && x.g) : null }; }) }));
}, label);
console.log(JSON.stringify(r, null, 1));
await b.close();
