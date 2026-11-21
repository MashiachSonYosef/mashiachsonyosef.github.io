// X1, wider: on a phone, at rest, for the first words of a book: where the card stands before and after its second pill
// is pressed, and how far it then stands from its word. One fresh load per word (a pick is the page's, gone on a reload).
// node x1-sweep.mjs [book] [query, "-" for none] [how many words] [scroll: none|center]
import { open, ready, mask } from "./lib.mjs";
const [BOOK = "obadiah", Q = "&commentary=on", N = "6", SCROLL = "none"] = process.argv.slice(2);
const QUERY = Q === "-" ? "" : Q;
const { b, p, errors } = await open(`b=${BOOK}${QUERY}`);
console.log(`${BOOK}${QUERY}, 412x915, the word ${SCROLL === "center" ? "brought to the middle of the screen" : "pressed where the page opens (brought into view if it is off it)"}`);
const r1 = (x) => Math.round(x * 10) / 10;
let moved = 0, asked = 0;
for (let w = 0; w < Number(N); w += 1) {
  if (w) { await p.reload({ waitUntil: "networkidle" }); await ready(p); }
  const WB = `[...document.querySelector("section.seg").querySelectorAll(".he-text .wb:not(.mark)")][${w}]`;
  const at = () => p.evaluate((src) => {
    const hh = document.getElementById("hud"), wb = eval(src), r = wb.getBoundingClientRect(), hr = hh.getBoundingClientRect();
    const above = hr.bottom <= r.top + 1;
    return { top: hr.top, bottom: hr.bottom, h: hh.offsetHeight, wTop: r.top, wBottom: r.bottom, side: above ? "above" : hr.top >= r.bottom - 1 ? "beneath" : "OVER THE WORD", gap: above ? r.top - hr.bottom : hr.top - r.bottom, scrollY: window.scrollY, tight: hh.classList.contains("tight") };
  }, WB);
  const target = await p.evaluateHandle((src) => { const wb = eval(src); return wb ? (wb.querySelector(".w span") || wb.querySelector(".w")) : null; }, WB);
  if (!target.asElement()) break;
  if (SCROLL === "center") await p.evaluate((src) => eval(src).scrollIntoView({ block: "center" }), WB);
  await target.asElement().click();
  const got = await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 }).then(() => true, () => false);
  await p.waitForTimeout(1500);
  if (!got) { console.log(`word ${w}: its card draws no reading pills`); await p.keyboard.press("Escape"); continue; }
  const before = await at();
  const pills = await p.$$("#hud .b-read .r-pills button");
  if (pills.length < 2) { console.log(`word ${w}: one pill only`); continue; }
  const label = await pills[1].textContent();
  await pills[1].click();
  await p.waitForTimeout(1700);
  const after = await at();
  asked += 1;
  const dTop = r1(after.top - before.top), dBottom = r1(after.bottom - before.bottom), dWord = r1(after.wTop - before.wTop);
  if (Math.abs(dTop) > 1 || Math.abs(dBottom) > 1) moved += 1;
  console.log(`word ${w} (pill 2 ${JSON.stringify(mask(label).slice(0, 24))}): ${before.side} -> ${after.side}; card top ${r1(before.top)} -> ${r1(after.top)} (${dTop >= 0 ? "+" : ""}${dTop}), bottom ${r1(before.bottom)} -> ${r1(after.bottom)} (${dBottom >= 0 ? "+" : ""}${dBottom}), height ${before.h} -> ${after.h}; word top ${r1(before.wTop)} -> ${r1(after.wTop)} (${dWord >= 0 ? "+" : ""}${dWord}); gap to the word ${r1(before.gap)} -> ${r1(after.gap)}; page scrolled ${r1(after.scrollY - before.scrollY)}`);
}
console.log(`cards that moved by more than a pixel: ${moved} of ${asked}`);
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
