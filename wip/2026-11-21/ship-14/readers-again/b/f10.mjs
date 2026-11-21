// Finding 10: a reading chosen on a maqaf-keyed inner rung of a spaced named run goes into the standalone chain's memory
// with no cut; the run's own line does not show it, and the chain's standalone cells then read word by word, marked chosen.
// node f10.mjs <book> <label of the spaced run> <idx of a word of it> <pill index to press> <extra query or ""> <label of a standalone cell drawn before> <label of one drawn afterwards>
import { open, noHe, mask, cellSrc, clickWord } from "./lib.mjs";
const [BOOK, LABEL, IDX, PILL, EXTRA = "", NEAR = "", FAR = ""] = process.argv.slice(2);
const { b, p, errors } = await open(`b=${BOOK}${EXTRA}#${LABEL}`);
const drawn = (label) => p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label && s.querySelector(".he-text .wb")), label, { timeout: 20000 }).catch(() => console.log(`verse ${label} was not drawn`));
await drawn(LABEL); await p.waitForTimeout(1500);
const cellsOf = (label) => p.evaluate((label) => {
  const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === label);
  if (!sec) return [`${label}: not drawn`];
  const out = [...sec.querySelectorAll(".wjoin")].filter((r) => r.__key).map((r) => { const g = r.querySelector(":scope > .g"); const c = g ? g.cloneNode(true) : null; const chips = g ? [...g.querySelectorAll(".g-lic")].map((x) => x.dataset.line || x.textContent) : []; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return `${label} cell key=${r.__key} class="${r.className}" line[${g ? g.className : "-"}]=${JSON.stringify(c ? c.textContent.trim() : null)} chips=${JSON.stringify(chips)}${g && g.dataset.span ? " (the span store's line)" : ""}`; });
  return out.length ? out : [`${label}: no keyed cell`];
}, label);
const say = async (tag, labels) => { console.log(`-- ${tag}`); for (const l of labels) for (const s of await cellsOf(l)) console.log("     " + noHe(s)); };
await say("before", [LABEL, NEAR].filter(Boolean));
if (PILL !== "-") {
const src = cellSrc(LABEL, IDX);
await clickWord(p, src);
const cuts = await p.evaluate(() => [...document.querySelectorAll("#hud .b-cut .s-pills button")].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`));
console.log("the run's card: divisions", noHe(JSON.stringify(cuts)));
// the division of two blocks of which one is a maqaf chain
const cut = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-cut .s-pills button")]; const x = xs.find((y) => y.textContent.split("+").length === 2 && /־/u.test(y.textContent)); if (x) x.click(); return x ? x.textContent : null; });
await p.waitForTimeout(900);
console.log("pressed division:", noHe(cut));
const blk = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-cell .s-pills button")]; const x = xs.find((y) => /־/u.test(y.textContent)); if (x) x.click(); return x ? x.textContent : null; });
await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(900);
console.log("pressed block:", noHe(blk));
const pills = await p.evaluate(() => [...document.querySelectorAll("#hud .b-read .r-pills button")].map((x) => `${x.textContent}${x.getAttribute("aria-pressed") === "true" ? "*" : ""}`));
console.log("pills on the block:", pills.length, JSON.stringify(pills.slice(0, 8).map(mask)));
const pressed = await p.evaluate((k) => { const x = document.querySelectorAll("#hud .b-read .r-pills button")[k]; if (x) x.click(); return x ? x.textContent : null; }, Number(PILL));
await p.waitForTimeout(900);
console.log("pressed reading:", JSON.stringify(mask(pressed)), "| the card says:", JSON.stringify(mask(await p.evaluate(() => (document.querySelector("#hud .r-now") || {}).textContent))));
await say("with the card open, after the press", [LABEL, NEAR].filter(Boolean));
await p.keyboard.press("Escape"); await p.waitForTimeout(700);
await say("card closed", [LABEL, NEAR].filter(Boolean));
} else console.log("(control: nothing pressed)");
if (FAR) {
  const [farLabel, farWord] = [FAR.split(":").slice(0, 2).join(":"), FAR.split(":")[2] || "1"];
  await p.evaluate((l) => { location.hash = `#${l}`; }, `${farLabel}:${farWord}`); await drawn(farLabel); await p.waitForTimeout(2500);
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  await say(`a standalone cell drawn afterwards (${farLabel})`, [farLabel]);
  // the standalone cell's own card
  const opened = await p.evaluate((label) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === label); const r = sec && [...sec.querySelectorAll(".wjoin")].find((x) => x.__key); const wb = r && r.querySelector(".wb"); if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; }, farLabel);
  if (opened) { await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud > .rows .b-read p", { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(900);
    console.log("its card:", JSON.stringify(mask(await p.evaluate(() => `${(document.querySelector("#hud .head .wn") || {}).textContent} | bands ${[...document.querySelectorAll("#hud > .rows > *")].map((x) => x.className.replace("band ", "")).join(",")} | divisions ${[...document.querySelectorAll("#hud .b-cut .s-pills button")].map((x) => x.textContent + (x.getAttribute("aria-pressed") === "true" ? "*" : "")).join("  ")} | ${(document.querySelector("#hud .r-now") || {}).textContent} | pressed pill: ${([...document.querySelectorAll("#hud .b-read .r-pills button")].find((x) => x.getAttribute("aria-pressed") === "true") || {}).textContent}`)))); }
}
if (FAR) {
  // where the pick went: the standalone cell's card, its whole (as written) division pressed
  const whole = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-cut .s-pills button")]; const x = xs.find((y) => !y.textContent.includes("+")); if (x) x.click(); return x ? x.textContent : null; });
  await p.waitForTimeout(1200);
  console.log("its whole division pressed:", noHe(whole), "| pills:", JSON.stringify(mask(await p.evaluate(() => [...document.querySelectorAll("#hud .b-read .r-pills button")].map((x) => x.textContent + (x.getAttribute("aria-pressed") === "true" ? "*" : "")).slice(0, 6)))), "| the card says:", JSON.stringify(mask(await p.evaluate(() => (document.querySelector("#hud .r-now") || {}).textContent))));
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
}
// and the spaced run's own card again
if (PILL !== "-") {
  await p.evaluate((l) => { const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === l); if (sec) sec.scrollIntoView(); }, LABEL); await p.waitForTimeout(800);
  await clickWord(p, cellSrc(LABEL, IDX));
  console.log("the spaced run's card reopened:", JSON.stringify(mask(await p.evaluate(() => `divisions ${[...document.querySelectorAll("#hud .b-cut .s-pills button")].map((x) => x.textContent + (x.getAttribute("aria-pressed") === "true" ? "*" : "")).join("  ")} | blocks ${[...document.querySelectorAll("#hud .b-cell .s-pills button")].map((x) => x.textContent + (x.getAttribute("aria-pressed") === "true" ? "*" : "")).join("  ")} | ${(document.querySelector("#hud .r-now") || {}).textContent}`))));
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
  await say("at the end", [LABEL]);
}
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
