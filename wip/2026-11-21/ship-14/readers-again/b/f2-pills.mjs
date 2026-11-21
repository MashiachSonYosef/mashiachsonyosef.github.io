// Finding 2, step 2: on one word's card, press each pill and say which pills' records carry a witness line.
// node f2-pills.mjs <book> <label> <idx> [max pills]
import { open, mask, cellSrc, clickWord } from "./lib.mjs";
const [BOOK, LABEL, IDX, MAX = "20"] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}`);
const src = cellSrc(LABEL, IDX);
await clickWord(p, src);
const n = await p.evaluate(() => document.querySelectorAll("#hud .b-read .r-pills button").length);
for (let i = 0; i < Math.min(n, Number(MAX)); i++) {
  const t = await p.evaluate((i) => { const x = document.querySelectorAll("#hud .b-read .r-pills button")[i]; x.click(); return x.textContent; }, i);
  await p.waitForTimeout(350);
  const labs = await p.evaluate(() => [...document.querySelectorAll("#hud .d-also")].map((l) => `${(l.querySelector(".d-also-lab") || {}).textContent} :: ${[...l.querySelectorAll(".d-also-m")].map((x) => x.textContent).join(" || ")}`));
  console.log(i, JSON.stringify(mask(t)), labs.length ? JSON.stringify(labs.map(mask)) : "");
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
