// Finding 4, the mend's road tried by hand (nothing in the page is changed): from a live box, is the source's own chip
// found by the panel's key on its own shelf, and what does pressing that chip do to the panel being read?
import { open } from "./lib.mjs";
const { b, p, errors } = await open("b=obadiah");
await p.click("#rail > summary"); await p.waitForTimeout(400);
const keys = await p.evaluate(() => [...document.querySelectorAll("#sourcesRow .src-open")].map((x) => x.dataset.key));
for (const key of keys) {
  await p.evaluate((k) => { [...document.querySelectorAll("#sourcesRow .src-open")].find((x) => x.dataset.key === k).click(); }, key);
  await p.waitForSelector("#sourcesRow .decl", { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(300);
  if (!(await p.evaluate(() => document.querySelectorAll("#sourcesRow .decl .decl-bx:not(:disabled)").length))) continue;
  const r = await p.evaluate(() => {
    const bx = document.querySelector("#sourcesRow .decl .decl-bx:not(:disabled)");
    const panel = bx.closest(".decl"), shelf = bx.closest(".shelf");
    const viaReport = bx.closest(".src-row");
    const chip = shelf && shelf.querySelector(`.src-row[data-key="${CSS.escape(panel.dataset.key)}"] > button.dfp`);
    const before = chip ? chip.getAttribute("aria-pressed") : null;
    if (chip) chip.click();
    const chipNow = [...document.querySelectorAll("#sourcesRow .src-row")].find((x) => x.dataset.key === panel.dataset.key);
    return { key: panel.dataset.key, "the page's road (closest .src-row)": viaReport ? "found" : "null", "the panel's key on its shelf": chip ? "found" : "null", chipBefore: before, chipAfter: chipNow.querySelector("button.dfp").getAttribute("aria-pressed"),
      panelStillOpen: !!document.querySelector("#sourcesRow .decl"), fold: document.querySelector("#sourcesRow .src-sum").textContent };
  });
  console.log(JSON.stringify(r));
  break;
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
