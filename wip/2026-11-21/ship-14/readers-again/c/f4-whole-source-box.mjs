// Finding 4: the live box on a "whole source" line of a dictionary's panel in the rail: does a press do anything?
// node f4-whole-source-box.mjs [book]
import { open } from "./lib.mjs";
const [BOOK = "obadiah"] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}`);
await p.click("#rail > summary"); await p.waitForTimeout(400);
const names = await p.evaluate(() => [...document.querySelectorAll("#sourcesRow .src-open")].map((x) => x.dataset.key));
let done = false;
for (const key of names) {
  await p.evaluate((k) => { [...document.querySelectorAll("#sourcesRow .src-open")].find((x) => x.dataset.key === k).click(); }, key);
  await p.waitForSelector("#sourcesRow .decl", { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(300);
  const boxes = await p.evaluate(() => ({ live: document.querySelectorAll("#sourcesRow .decl .decl-bx:not(:disabled)").length, dead: document.querySelectorAll("#sourcesRow .decl .decl-bx:disabled").length }));
  if (!boxes.live) { continue; }
  const state = () => p.evaluate((k) => {
    const chip = [...document.querySelectorAll("#sourcesRow .src-row")].find((x) => x.dataset.key === k);
    const bx = document.querySelector("#sourcesRow .decl .decl-bx:not(:disabled)");
    return {
      chipPressed: chip.querySelector("button.dfp").getAttribute("aria-pressed"), idsOff: (window.__sourcesOff || []).join(" "),
      fold: document.querySelector("#sourcesRow .src-sum").textContent,
      box: bx ? { pressed: bx.getAttribute("aria-pressed"), title: bx.title, label: bx.getAttribute("aria-label"), under: (bx.parentElement.querySelector(".decl-reach") || {}).textContent, visible: bx.getBoundingClientRect().width > 0, insideSrcRow: !!bx.closest(".src-row"), parentChain: (() => { const a = []; for (let e = bx.parentElement; e && e.id !== "sourcesRow"; e = e.parentElement) a.push(e.className.split(" ")[0]); return a.join(" < "); })() } : null,
    };
  }, key);
  console.log(`dictionary ${key}: ${boxes.live} live box(es), ${boxes.dead} dead`);
  console.log("before the press:", JSON.stringify(await state()));
  // a reader's press, with the mouse, on the first live box
  const bx = p.locator("#sourcesRow .decl .decl-bx:not(:disabled)").first();
  await bx.scrollIntoViewIfNeeded(); await bx.click(); await p.waitForTimeout(1200);
  console.log("after the press: ", JSON.stringify(await state()));
  done = true; break;
}
if (!done) console.log("no dictionary on this book draws a live box");
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
