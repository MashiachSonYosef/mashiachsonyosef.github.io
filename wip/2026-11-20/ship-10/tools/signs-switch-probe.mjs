// Ship 10: the signs switch moved on the rail: the cells are laid again. node signs-switch-probe.mjs <base> <book>
import { createRequire } from "node:module";
const pw = createRequire(import.meta.url)("playwright");
const [base, book] = process.argv.slice(2);
const b = await pw.chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1200, height: 900 } })).newPage();
await p.goto(`${base}/zone.html?b=${book}&rail=all`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.waitForTimeout(800);
const state = () => p.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  let signCells = 0, shownSigns = 0, built = 0;
  for (const s of document.querySelectorAll("section.seg")) { if (s.querySelector(".he-text")) built += 1; }
  for (const j of document.querySelectorAll(".he-text .wjoin")) if (!j.__key && !j.__chain && !(j.__run && j.__run.spanKey)) signCells += 1;
  for (const wb of document.querySelectorAll(".he-text > .wb")) { const g = wb.querySelector(":scope > .g"); if (g && vis(g) && /^<[^<>]+>$/.test(g.textContent.replace(/CC BY[^<]*$/, "").trim())) shownSigns += 1; }
  return { signs: window.__signs, built, signCells, wordsAloneShowingASign: shownSigns, relaid: window.__hudRelaid || 0 };
});
console.log("at rest", JSON.stringify(await state()));
const press = async (lab) => {
  const ok = await p.evaluate((lab) => { const btn = [...document.querySelectorAll("#rail button, #railRows button")].find((x) => x.textContent.trim() === lab); if (!btn) return false; btn.click(); return true; }, lab);
  await p.waitForTimeout(1200); return ok;
};
console.log("pressed «as printed»:", await press("as printed"), JSON.stringify(await state()));
console.log("pressed «off»:", await press("off"), JSON.stringify(await state()));
await b.close();
