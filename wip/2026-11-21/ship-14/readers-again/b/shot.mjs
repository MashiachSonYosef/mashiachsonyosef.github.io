// A look at the page with a card open (a screenshot, and where the switches stand).
// node shot.mjs <book> <label> <idx> <out.png> [extra query]
import { open, mask, cellSrc, clickWord } from "./lib.mjs";
const [BOOK, LABEL, IDX, OUT, EXTRA = ""] = process.argv.slice(2);
const { b, p } = await open(`b=${BOOK}${EXTRA}`);
await clickWord(p, cellSrc(LABEL, IDX));
await p.screenshot({ path: OUT });
const info = await p.evaluate(() => ({
  hud: (() => { const h = document.querySelector("#hud"); const r = h.getBoundingClientRect(); return `${h.className} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; })(),
  rows: [...document.querySelectorAll("#hud > .rows > *")].map((x) => `${x.className}`),
  labs: [...document.querySelectorAll(".row .lab")].map((x) => { const r = x.getBoundingClientRect(); return `${x.textContent.slice(0, 30)} @${Math.round(r.top)} vis=${!!(x.offsetParent)}`; }).slice(0, 60),
}));
console.log(JSON.stringify(info, null, 1));
await b.close();
