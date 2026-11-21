// Finding 12, the one transition a browser could be made to show: a let-down run line that stops being a row of parts
// because its sources are switched off (the shelves, in an order whose last press lays no section again).
// node f12b.mjs <book> <label> <cell index among the verse's cells> <extra query> <width> <shelf order>
import { chromium, BASE, ready, noHe } from "./lib.mjs";
const [BOOK, LABEL, CELL, EXTRA = "", WIDTH = "240", ORDER = "2,0,1"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(WIDTH), height: 915 } });
await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
await p.goto(`${BASE}?b=${BOOK}${EXTRA}#${LABEL}`, { waitUntil: "domcontentloaded" }); await ready(p);
await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label && s.querySelector(".he-text .wb")), LABEL, { timeout: 20000 }).catch(() => console.log("the verse was not drawn"));
await p.waitForTimeout(1800);
const cellSrc = `[...[...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ${JSON.stringify(LABEL)}).querySelectorAll(".wjoin")][${CELL}]`;
const state = (tag) => p.evaluate(({ src, tag }) => { const r = eval(src); if (!r) return `${tag}: the cell is not there`; const g = r.querySelector(":scope > .g"); const seen = !!g.__probeSeen; g.__probeSeen = true; return `${tag}: line[${g.className}] inline font-size=${g.style.fontSize || "none"} computed=${getComputedStyle(g).fontSize} text=${JSON.stringify(g.textContent.trim().slice(0, 60))} ${seen ? "(the same element)" : "(first seen)"}`; }, { src: cellSrc, tag });
console.log(noHe(await state("before")));
await p.evaluate(() => { window.scrollTo(0, 0); document.querySelector("#rail > summary").click(); }); await p.waitForTimeout(500);
for (const i of ORDER.split(",").map(Number)) {
  const lab = await p.evaluate((i) => { const x = document.querySelectorAll('.row[data-toggle="sources"] button.shelf-sw')[i]; x.click(); return x.getAttribute("aria-label") || x.title; }, i);
  await p.waitForTimeout(2500);
  console.log(noHe(await state(`after «${lab}»`)));
}
await b.close();
