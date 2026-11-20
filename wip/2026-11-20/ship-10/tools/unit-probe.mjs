// Ship 10: one verse's words, each with its cell and the line over it, under a default source. node unit-probe.mjs <base> <book> <label> [query]
import { createRequire } from "node:module";
const pw = createRequire(import.meta.url)("playwright");
const [base, book, label, query = ""] = process.argv.slice(2);
const b = await pw.chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1100, height: 900 } })).newPage();
await p.goto(`${base}/zone.html?b=${book}${query}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.waitForTimeout(2500);
const r = await p.evaluate(async (label) => {
  const s = [...document.querySelectorAll("section.seg")].find((x) => x.__sec && String(x.__sec.label) === label);
  if (!s) return null;
  s.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 1500));
  const txt = (el) => { if (!el) return null; const c = el.cloneNode(true); c.querySelectorAll(".g-lic, .g-pcs-lic").forEach((x) => x.remove()); return c.textContent.trim(); };
  const runs = [...s.querySelectorAll(".he-text .wjoin")];
  return { dflt: window.__default || null, cells: runs.map((j) => ({ cls: j.className, key: !!j.__key, span: !!(j.__run && j.__run.spanKey), n: (j.__words || []).length, row: txt(j.querySelector(":scope > .g")), parts: [...j.querySelectorAll(":scope > .g > .g-part")].map((x) => `${x.dataset.wi}+${x.dataset.wn || 1}:${txt(x)}`) })),
    words: [...s.querySelectorAll(".he-text .wb:not(.mark)")].map((wb, i) => ({ i: i + 1, run: runs.indexOf(wb.closest(".wjoin")), own: txt(wb.querySelector(":scope > .g")), src: (wb.querySelector(":scope > .g") || { dataset: {} }).dataset.src || null, pg: wb.__word && Array.isArray(wb.__word.pg) ? wb.__word.pg.map((x) => x && x.g).join("/") : null, join: !!(wb.__word && wb.__word.presentation_join && wb.__word.presentation_join.join_next_without_separator) })) };
}, label);
console.log(JSON.stringify(r).replace(/[֐-׿]/g, "?"));
await b.close();
