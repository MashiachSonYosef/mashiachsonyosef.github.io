// Finding 12, one more way from a let-down row of parts straight to a line that is not parts: the shelves arranged
// another way (by language or license), so one press may take every carrier of the line at once.
// node f12c.mjs <book> <label> <cell index> <extra query> <width> <shelve by: language|license|century>
import { chromium, BASE, ready, noHe } from "./lib.mjs";
const [BOOK, LABEL, CELL, EXTRA = "", WIDTH = "240", BY = "language"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(WIDTH), height: 915 } });
await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
await p.goto(`${BASE}?b=${BOOK}${EXTRA}#${LABEL}`, { waitUntil: "domcontentloaded" }); await ready(p);
await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label && s.querySelector(".he-text .wb")), LABEL, { timeout: 20000 }).catch(() => console.log("the verse was not drawn"));
await p.waitForTimeout(1800);
const cellSrc = `[...[...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ${JSON.stringify(LABEL)}).querySelectorAll(".wjoin")][${CELL}]`;
const state = (tag) => p.evaluate(({ src, tag }) => { const r = eval(src); if (!r) return `${tag}: the cell is not there`; const g = r.querySelector(":scope > .g"); const seen = !!g.__probeSeen; g.__probeSeen = true; return `${tag}: line[${g.className}] inline font-size=${g.style.fontSize || "none"} computed=${getComputedStyle(g).fontSize} text=${JSON.stringify(g.textContent.trim().slice(0, 60))} ${seen ? "(the same element)" : "(first seen)"} span places ${window.__spanStore ? window.__spanStore.laid + " laid" : "?"}`; }, { src: cellSrc, tag });
console.log(noHe(await state("before")));
await p.evaluate((by) => { window.scrollTo(0, 0); document.querySelector("#rail > summary").click(); const o = [...document.querySelectorAll(".shelve-opt")].find((x) => x.textContent === by); if (o) o.click(); }, BY); await p.waitForTimeout(700);
const shelves = await p.evaluate(() => [...document.querySelectorAll('.row[data-toggle="sources"] button.shelf-sw')].map((x) => x.getAttribute("aria-label") || x.title));
console.log("shelves:", JSON.stringify(shelves));
for (let i = 0; i < shelves.length; i++) {
  await p.evaluate((i) => document.querySelectorAll('.row[data-toggle="sources"] button.shelf-sw')[i].click(), i); await p.waitForTimeout(2500);
  console.log(noHe(await state(`after shelf ${i} off`)));
}
await b.close();
