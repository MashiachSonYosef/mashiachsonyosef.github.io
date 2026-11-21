// Finding 11: on the card of a named run that is exactly a maqaf chain, only the first word of the head is bold.
// Press a word; if the word's own card opens (a chain band at its top), press the chain's whole rung there; print the head.
// node f11.mjs <book> <label> <idx> [extra query]
import { open, noHe, mask, cellSrc, clickWord } from "./lib.mjs";
const [BOOK, LABEL, IDX, EXTRA = ""] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}${EXTRA}#${LABEL}`);
await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label), LABEL, { timeout: 20000 }).catch(() => console.log("the verse was not drawn"));
await p.waitForTimeout(1500);
const src = cellSrc(LABEL, IDX);
const cell = await p.evaluate((src) => { const wb = eval(src); const run = wb.closest(".wjoin"); return run ? `cell[${run.className}] key=${run.__key || "none"} chain=${!!run.__chain} named=${!!run.__run}${run.__run && run.__run.spanKey ? " (a span-store place)" : ""}` : "the word stands alone"; }, src);
console.log("the cell:", noHe(cell));
const head = async (tag) => {
  const h = await p.evaluate(() => ({ wn: (document.querySelector("#hud .head .wn") || {}).textContent, bands: [...document.querySelectorAll("#hud > .rows > *")].map((x) => x.className.replace("band ", "")).join(","), segs: [...document.querySelectorAll("#hud .head b > span")].map((x) => `${x.classList.contains("mq") ? "joiner" : "word"} ${JSON.stringify(x.textContent)} weight=${getComputedStyle(x).fontWeight}${x.getAttribute("role") ? " role=" + x.getAttribute("role") : ""}`), chain: [...document.querySelectorAll("#hud .b-chain .s-pills button")].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`), cuts: [...document.querySelectorAll("#hud .b-cut .s-pills button")].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`) }));
  console.log(`-- ${tag}: card ${h.wn} bands ${h.bands}`); for (const s of h.segs) console.log("     " + noHe(s));
  console.log("     chain band:", noHe(JSON.stringify(h.chain)), "divisions:", noHe(JSON.stringify(h.cuts)));
  return h;
};
await clickWord(p, src);
const h1 = await head("the card the press opens");
if (h1.chain.length) {
  const pressed = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-chain .s-pills button")]; const x = xs.find((y) => !y.textContent.includes("+")) || xs[0]; if (x) x.click(); return x ? x.textContent : null; });
  await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud > .rows .b-read p", { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(1200);
  console.log("pressed in the chain band:", noHe(pressed));
  await head("the run's card, reached from the chain band");
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
