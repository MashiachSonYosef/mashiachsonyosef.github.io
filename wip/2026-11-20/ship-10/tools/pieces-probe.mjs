// Ship 10: what the page draws with the maqaf switch at "pieces" (each word its own cell), beside the rest.
// node pieces-probe.mjs <base> <book> <maqaf|pieces> <out.json> [shot-dir label,label...]
import { createRequire } from "node:module";
import fs from "node:fs";
const pw = createRequire(import.meta.url)("playwright");
const [base, book, mode, out, shotDir, labels] = process.argv.slice(2);
const b = await pw.chromium.launch();
const ctx = await b.newContext({ ...pw.devices["Pixel 7"] });
await ctx.addInitScript((m) => { try { localStorage.setItem("fh.maqaf-join", m); } catch {} }, mode);
const p = await ctx.newPage();
await p.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.evaluate(async () => { if (window.__materialise) { try { await window.__materialise(); } catch {} } });
await p.waitForTimeout(1500);
const r = await p.evaluate(() => {
  const lines = []; let rows = 0, clipped = 0; const kinds = { word: 0, run: 0 }; const ex = [];
  let joins = 0, chains = 0, spans = 0, lic = 0;
  for (const j of document.querySelectorAll(".he-text .wjoin")) { joins += 1; if (j.__chain) chains += 1; if (j.__run && j.__run.spanKey) spans += 1; if (j.classList.contains("lic")) lic += 1; }
  for (const s of document.querySelectorAll("section.seg")) {
    const label = ((s.querySelector(".vnum") || {}).textContent || "").trim();
    const row = [];
    for (const g of s.querySelectorAll(".he-text .wb > .g, .he-text .wjoin > .g")) {
      const c = g.cloneNode(true); c.querySelectorAll(".g-lic, .g-pcs-lic").forEach((y) => y.remove());
      row.push((g.parentElement.classList.contains("wjoin") ? "J:" : "") + c.textContent.replace(/\s+/g, " ").trim());
      if (g.classList.contains("bare")) continue;
      rows += 1;
      const gb = g.getBoundingClientRect(); let over = 0;
      for (const t of g.querySelectorAll(".g-pc, .g-part")) {
        if (t.querySelector(".g-pc, .g-part")) continue;
        const rg = document.createRange(); rg.selectNodeContents(t);
        for (const q of rg.getClientRects()) { if (q.width < 1) continue; over = Math.max(over, gb.left - q.left, q.right - gb.right); }
      }
      if (over > 0.5) { clipped += 1; kinds[g.parentElement.classList.contains("wjoin") ? "run" : "word"] += 1; if (ex.length < 8) ex.push(`${label} ${Math.round(over)}px ${row[row.length - 1].slice(0, 40)}`); }
    }
    lines.push([label, row]);
  }
  return { toggles: window.__hudToggles, span: window.__spanStore ? { places: window.__spanStore.places, cards: window.__spanStore.cards, laid: window.__spanStore.laid } : null, joins, chains, spans, lic, rows, clipped, kinds, ex, lines };
});
fs.writeFileSync(out, JSON.stringify(r));
const { lines, ...head } = r;
console.log(mode, JSON.stringify(head));
if (shotDir && labels) for (const lab of labels.split(",")) {
  const ok = await p.evaluate((lab) => { for (const s of document.querySelectorAll("section.seg")) { if (((s.querySelector(".vnum") || {}).textContent || "").trim() === lab) { s.scrollIntoView({ block: "center" }); return true; } } return false; }, lab);
  if (!ok) { console.log("no section", lab); continue; }
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${shotDir}/${book}-${lab.replace(/[^0-9]+/g, "-")}-${mode}.png` });
}
await b.close();
