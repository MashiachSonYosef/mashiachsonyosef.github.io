// Ship 13: over the first words of a book, open each word's card oldest first, press each lattice order with the
// card open, and set the line under the word beside the card's first pill. Counts where the two differ, where a
// pill is new that the line does not read, and where the pool's whole count (pills and the readings the signs
// switch has off) moves.
// node orders-line-and-pill.mjs <reader dir> <base url of zone.html> <book> [words=40] [extra localStorage as k=v,k=v]
import { join } from "node:path";
const [reader, base, book, nWords = "40", extra = ""] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(join(reader, "tools/playwright-v1.mjs"));
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
const set = Object.fromEntries(extra.split(",").filter(Boolean).map((x) => x.split("=")));
await p.addInitScript((set) => { try { localStorage.setItem("fh.def.order", "oldest"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); for (const [k, v] of Object.entries(set)) localStorage.setItem(k, v); } catch { /* none */ } }, set);
let errors = 0;
p.on("pageerror", (e) => { errors += 1; console.log("PAGE ERROR:", e.message); });
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(600);
const press = async (id) => {
  await p.evaluate(() => { const r = document.getElementById("rail"); if (r && !r.open) r.open = true; });
  const ok = await p.evaluate((id) => { const btn = [...document.querySelectorAll("#defRow .dfp, .def-order .dfp")].find((x) => x.dataset.id === id || x.textContent.trim() === id); if (!btn || btn.disabled) return false; btn.click(); return true; }, id);
  await p.waitForTimeout(350);
  return ok;
};
const read = () => p.evaluate(() => {
  const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
  const row = h.querySelector(".r-pills");
  const pills = [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim());
  const wb = document.querySelector("section.seg .he-text .wb.active");
  const g = wb ? wb.querySelector(".g") : null;
  let line = null;
  if (g) { const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); line = c.textContent.replace(/\s+/g, " ").trim(); }
  return { pills, off: row && row.dataset.signsOff !== undefined ? Number(row.dataset.signsOff) : null, line, rows: h.querySelectorAll(".r-pills").length };
});
// a reading as the line draws it with the signs at rest: a piece that is a sign and nothing else is not drawn
// beside pieces that carry the reading (the page's trimSigns), and the gap it leaves is not a letter
const signOnly = (x) => /^(<[^>]*>|\[[^\]]*\]|\u00bf|~|X|\u00d7|\+)$/u.test(String(x).trim());
const asDrawn = (t) => { const pcs = String(t).replace(/[\u200b-\u200d\u2060\ufeff]/g, "").split(" + ").map((x) => x.trim()).filter(Boolean); const kept = pcs.every(signOnly) ? pcs : pcs.filter((x) => !signOnly(x)); return kept.join(" + ").replace(/\s+/g, " ").trim().toLowerCase(); };
const count = await p.evaluate(() => document.querySelectorAll("section.seg .he-text .wb").length);
const tally = {}; const eg = [];
const note = (k, d) => { tally[k] = (tally[k] || 0) + 1; if (d && eg.filter((x) => x[0] === k).length < 4) eg.push([k, d]); };
let opened = 0;
for (let i = 0; i < Math.min(count, Number(nWords)); i += 1) {
  await press("oldest first");
  const ok = await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i]; const g = w.querySelector(".g"); if (!g || g.classList.contains("bare")) return false; (w.querySelector(".w span") || w.querySelector(".w")).click(); return true; }, i);
  if (!ok) continue;
  await p.waitForTimeout(350);
  const baseR = await read(); if (!baseR || !baseR.pills.length) { note("no card"); continue; }
  if (baseR.rows !== 1) { note("a card of more than one row (not judged)"); continue; }
  opened += 1;
  for (const lab of ["masoretic", "vowels differ", "cites here"]) {
    if (!(await press(lab))) { note(`${lab}: not pressed`); continue; }
    await p.waitForFunction(() => !!window.__latticeStore, null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(250);
    const r = await read(); if (!r) { note(`${lab}: card gone`); continue; }
    const same = r.line !== null && r.pills[0] !== undefined && asDrawn(r.line) === asDrawn(r.pills[0]);
    note(`${lab}: ${same ? "line and first pill the same" : "LINE AND FIRST PILL DIFFER"}`, same ? null : `word ${i + 1}: line «${r.line}» · pill «${r.pills[0]}»`);
    const fresh = r.pills.filter((x) => !baseR.pills.includes(x));
    if (fresh.length) note(`${lab}: a pill more than at rest${fresh.every((x) => r.line && asDrawn(x) === asDrawn(r.line)) ? ", the line's own" : ", NOT THE LINE'S"}`, `word ${i + 1}: ${fresh.join(" | ")} · line «${r.line}»`);
    if (r.off !== null && baseR.off !== null && r.pills.length + r.off !== baseR.pills.length + baseR.off) note(`${lab}: THE POOL'S COUNT MOVED`, `word ${i + 1}: ${r.pills.length}+${r.off} vs ${baseR.pills.length}+${baseR.off}`);
    if (r.off === null && r.pills.length !== baseR.pills.length) note(`${lab}: the pills' count moved (no signs count on this page)`, `word ${i + 1}: ${r.pills.length} vs ${baseR.pills.length}`);
  }
  await press("oldest first");
  const back = await read();
  note(back && JSON.stringify(back.pills) === JSON.stringify(baseR.pills) ? "back at oldest first: as it was" : "BACK AT OLDEST FIRST: NOT AS IT WAS", null);
}
console.log(`${book} at ${base}${extra ? " with " + extra : ""}: ${opened} cards opened of the first ${Math.min(count, Number(nWords))} words, ${errors} page errors`);
for (const k of Object.keys(tally).sort()) console.log(`  ${String(tally[k]).padStart(4)}  ${k}`);
for (const [k, d] of eg) console.log(`     e.g. ${k} · ${d}`);
await b.close();
