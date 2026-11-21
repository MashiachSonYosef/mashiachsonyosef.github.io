// Finding 14 (both readers): on a work with no lattice, does the rail light "only this pointing" though the page refused it?
// node f14-pointing-refused.mjs [book] [extra query]
import { open } from "./lib.mjs";
const [BOOK = "tikkunei-zohar", EXTRA = "&rail=all"] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}${EXTRA}`);
const row = () => p.evaluate(() => {
  const r = document.querySelector('#railRows .row[data-toggle="masorah"]');
  if (!r) return { row: null };
  const fold = r.closest("details.more-switches");
  return { masorah: window.__masorah, stored: Object.entries(localStorage).filter(([k]) => /masor|point/i.test(k)).map(([k, v]) => `${k}=${v}`).join(";") || "(nothing kept)",
    foldHidden: fold ? fold.hidden : null, rowDead: r.classList.contains("dead"),
    buttons: [...r.querySelectorAll("button")].map((x) => `${x.textContent}:${x.getAttribute("aria-pressed")}${x.disabled ? ":disabled" : ""}${x.classList.contains("on") ? ":lit" : ""}`) };
});
console.log(`${BOOK}${EXTRA} at load:`, JSON.stringify(await row()));
const fold = await p.evaluate(() => { const m = document.querySelector("#railRows details.more-switches"); return m ? m.hidden : null; });
if (fold) { console.log("the fold the row stands under is not drawn (hidden): no press reaches the row here"); }
else {
  await p.click("#rail > summary"); await p.waitForTimeout(300);
  await p.evaluate(() => { document.querySelector("#railRows details.more-switches").open = true; });
  const btn = p.locator('#railRows .row[data-toggle="masorah"] button', { hasText: "only this pointing" });
  await btn.scrollIntoViewIfNeeded(); await btn.click(); await p.waitForTimeout(1500);
  console.log('after a press on "only this pointing":', JSON.stringify(await row()));
  const b2 = p.locator('#railRows .row[data-toggle="masorah"] button', { hasText: "the letters only" });
  await b2.click(); await p.waitForTimeout(1200);
  console.log('after a press on "the letters only":', JSON.stringify(await row()));
  await btn.click(); await p.waitForTimeout(1200);
  console.log('and "only this pointing" again:', JSON.stringify(await row()));
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
