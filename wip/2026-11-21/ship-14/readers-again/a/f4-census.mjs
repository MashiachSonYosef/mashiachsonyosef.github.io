// Finding 4, counted: every section of a book built, one source chip pressed off on the main rail; how many lines
// still wear a chip naming a switched-off source, pairs and ordinary words apart.
// node f4-census.mjs <book> <source key>
import { open, U } from "./lib.mjs";
const [book, key] = process.argv.slice(2);
const { b, p, errors } = await open(book);
await p.evaluate(() => window.__materialise()); await p.waitForTimeout(2500);
const census = () => p.evaluate(() => {
  const off = new Set(window.__sourcesOff || []); const out = { pairs: 0, pairsNamingOff: [], plain: 0, plainNamingOff: 0 };
  for (const wb of document.querySelectorAll("section.seg .he-text .wb")) {
    const g = wb.querySelector(":scope > .g"); const chip = g && g.querySelector(".g-lic"); if (!chip) continue;
    const ids = (chip.dataset.line || "").split(" "); const hit = ids.some((id) => off.has(id));
    if (wb.classList.contains("kq")) { out.pairs += 1; if (hit) { const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); out.pairsNamingOff.push(`${wb.closest("section").querySelector(".vnum").textContent} «${c.textContent.trim()}» ${chip.dataset.line}`); } }
    else { out.plain += 1; if (hit) out.plainNamingOff += 1; }
  }
  return out;
});
console.log("at rest:", JSON.stringify(await census()));
const r = await p.evaluate((key) => { const x = document.querySelector(`#sourcesRow button.dfp.on[data-key="${key}"]`); if (!x) return "no chip"; x.click(); return `pressed off ${key} (${x.dataset.ids}); off now ${JSON.stringify(window.__sourcesOff)}`; }, key);
console.log(r);
await p.waitForTimeout(2000); await p.waitForFunction(() => !window.__livePending, null, { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(2000);
const c = await census();
console.log("after:", U(JSON.stringify(c)));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
