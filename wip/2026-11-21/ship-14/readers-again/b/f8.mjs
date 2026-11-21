// Finding 8: the card's label names TAHOT over pieces that are MACULA's.
// Prints the verse's words with the chip under each, opens the card of one word, and prints the label and the source lines.
// node f8.mjs <book> <label> <idx> [extra query]
import { open, mask, cellSrc, clickWord, lineOf } from "./lib.mjs";
const [BOOK, LABEL, IDX, EXTRA = ""] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}${EXTRA}#${LABEL}`);
await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label), LABEL, { timeout: 20000 }).catch(() => console.log("the verse was not drawn"));
await p.waitForTimeout(1500);
const words = await p.evaluate((label) => {
  const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === label);
  if (!sec) return null;
  return [...sec.querySelectorAll(".he-text .wb")].map((wb, i) => { const g = wb.querySelector(":scope > .g"); const chips = g ? [...g.querySelectorAll(".g-lic")].map((x) => `${x.dataset.line || ""}/${x.textContent}`) : []; const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return `${i}: ${c ? c.textContent.trim() : "(no line)"} [${chips.join(",")}]`; });
}, LABEL);
console.log((words || []).map(mask).join("\n"));
if (IDX !== undefined && IDX !== "-") {
  const src = cellSrc(LABEL, IDX);
  await clickWord(p, src);
  const card = await p.evaluate(() => ({
    label: (document.querySelector("#hud .r-now .k") || {}).textContent || null,
    now: (document.querySelector("#hud .r-now") || {}).textContent || null,
    tag: [...document.querySelectorAll("#hud .r-now [class]")].map((x) => `${x.className}=${x.textContent}`),
    piece: [...document.querySelectorAll("#hud .r-piece, #hud .r-dflt")].map((x) => x.textContent.slice(0, 140)),
    pressed: [...document.querySelectorAll("#hud .b-read .r-pills button")].filter((x) => x.getAttribute("aria-pressed") === "true").map((x) => x.textContent),
    foot: (document.querySelector("#hud .d-card") || {}).textContent ? document.querySelector("#hud .d-card").textContent.slice(0, 200) : null,
  }));
  console.log("card label (.r-now .k):", JSON.stringify(mask(card.label)));
  console.log("card .r-now:", JSON.stringify(mask(card.now)));
  console.log("spans in .r-now:", JSON.stringify(card.tag.map(mask)));
  console.log("place/default lines:", JSON.stringify(card.piece.map(mask)));
  console.log("pressed pill:", JSON.stringify(card.pressed.map(mask)));
  console.log("record card:", JSON.stringify(mask(card.foot)));
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
