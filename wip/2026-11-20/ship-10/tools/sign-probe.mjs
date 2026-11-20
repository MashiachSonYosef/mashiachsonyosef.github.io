// Ship 10: how a word whose whole reading is a sign is drawn, alone and joined by a stroke. node sign-probe.mjs <base> <book> <label,...> <out-prefix>
import { createRequire } from "node:module";
const pw = createRequire(import.meta.url)("playwright");
const [base, book, labels, out] = process.argv.slice(2);
const b = await pw.chromium.launch();
const ctx = await b.newContext({ ...pw.devices["Pixel 7"] });
const p = await ctx.newPage();
await p.goto(`${base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.evaluate(async () => { if (window.__materialise) { try { await window.__materialise(); } catch {} } });
await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  let aloneSign = 0, aloneGap = 0, joinedSign = 0, joinedGap = 0, signWords = 0; const ex = [];
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" && getComputedStyle(el).display !== "none"; };
  for (const s of document.querySelectorAll("section.seg")) {
    const label = s.__sec ? String(s.__sec.label) : "";
    for (const wb of s.querySelectorAll(".he-text .wb:not(.mark)")) {
      const g = wb.querySelector(":scope > .g"); if (!g) continue;
      const c = g.cloneNode(true); c.querySelectorAll(".g-lic, .g-pcs-lic").forEach((y) => y.remove());
      const own = c.textContent.replace(/\s+/g, " ").trim();
      const w = wb.__word || {};
      const joinedNext = !!(w.presentation_join && w.presentation_join.join_next_without_separator);
      const isSign = /^<[^<>]+>$/.test(own);
      if (!isSign && !g.querySelector(".gap") && !g.classList.contains("gap")) continue;
      signWords += 1;
      const inJoin = wb.closest(".wjoin");
      const shown = vis(g) ? own : (inJoin ? "(the cell's row)" : "(hidden)");
      if (joinedNext) { if (vis(g) && isSign) joinedSign += 1; else joinedGap += 1; } else { if (vis(g) && isSign) aloneSign += 1; else aloneGap += 1; }
      if (ex.length < 6) ex.push(`${label} ${joinedNext ? "joined" : "alone"}: ${shown}`);
    }
  }
  return { signWords, aloneSign, aloneGap, joinedSign, joinedGap, ex };
});
console.log(book, JSON.stringify(r));
for (const lab of (labels || "").split(",").filter(Boolean)) {
  await p.evaluate((lab) => { for (const s of document.querySelectorAll("section.seg")) if (s.__sec && String(s.__sec.label) === lab) s.scrollIntoView({ block: "center" }); }, lab);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}-${lab.replace(/[^0-9]+/g, "-")}.png` });
}
await b.close();
