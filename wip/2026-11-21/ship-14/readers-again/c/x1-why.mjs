// X1, the why: (a) what moves the word 16px at the first pick of a page; (b) whether the page's own placement, run once
// more on the card as it stands after the press, puts the card back on its word (the placement is run through the page's
// own listener: an "animationend" of the card's pop calls placeHud()).
// node x1-why.mjs [book] [query, "-" for none] [word]
import { open, mask } from "./lib.mjs";
const [BOOK = "obadiah", Q = "&commentary=on", W = "0"] = process.argv.slice(2);
const QUERY = Q === "-" ? "" : Q;
const { b, p, errors } = await open(`b=${BOOK}${QUERY}`);
const WB = `[...document.querySelector("section.seg").querySelectorAll(".he-text .wb:not(.mark)")][${Number(W)}]`;
const r1 = (x) => Math.round(x * 10) / 10;
const at = () => p.evaluate((src) => {
  const hh = document.getElementById("hud"), wb = eval(src), r = wb.getBoundingClientRect(), hr = hh.getBoundingClientRect();
  const above = hr.bottom <= r.top + 1;
  const tall = (sel) => { const x = document.querySelector(sel); return x ? Math.round(x.getBoundingClientRect().height * 10) / 10 : null; };
  const sec = document.querySelector("section.seg");
  return { cardTop: hr.top, cardBottom: hr.bottom, cardH: hh.offsetHeight, tight: hh.classList.contains("tight"), wordTop: r.top, side: above ? "above" : "beneath", gap: above ? r.top - hr.bottom : hr.top - r.bottom,
    modeRow: tall("#modeRow"), resetState: (document.getElementById("resetState") || {}).textContent, sectionTop: sec.getBoundingClientRect().top + window.scrollY,
    title: (() => { const t = document.querySelector("h1, .book-title, #title"); return t ? Math.round(t.getBoundingClientRect().height) : null; })() };
}, WB);
const show = (name, s) => console.log(`${name}: card ${s.side} its word, top ${r1(s.cardTop)} bottom ${r1(s.cardBottom)} height ${s.cardH}${s.tight ? " (tight)" : ""}; word top ${r1(s.wordTop)}; gap ${r1(s.gap)}; switches row ${s.modeRow}px tall, reset says "${s.resetState}"; section starts at ${r1(s.sectionTop)} of the page; title ${s.title}px`);
const target = await p.evaluateHandle((src) => { const wb = eval(src); return wb.querySelector(".w span") || wb.querySelector(".w"); }, WB);
await target.asElement().click();
await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 20000 });
await p.waitForTimeout(1500);
console.log(`${BOOK}${QUERY}, word ${W}, 412x915`);
show("card open        ", await at());
const pills = await p.$$("#hud .b-read .r-pills button");
await pills[1].click(); await p.waitForTimeout(1700);
show("pill 2 pressed   ", await at());
// the page's own placement, once more, on the card as it now stands
await p.evaluate(() => { const hud = document.getElementById("hud"); hud.dispatchEvent(new AnimationEvent("animationend", { animationName: "hud-pop" })); });
await p.waitForTimeout(600);
show("placed once more ", await at());
// and the third pill: the page is no longer at its first pick
const pills2 = await p.$$("#hud .b-read .r-pills button");
if (pills2.length > 2) { await pills2[2].click(); await p.waitForTimeout(1700); show("pill 3 pressed   ", await at()); }
await p.evaluate(() => { const hud = document.getElementById("hud"); hud.dispatchEvent(new AnimationEvent("animationend", { animationName: "hud-pop" })); });
await p.waitForTimeout(600);
show("placed once more ", await at());
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
