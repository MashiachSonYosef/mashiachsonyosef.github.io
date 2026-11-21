// Finding 12: a run line let down to fit keeps its reduced font size when it stops being a row of parts.
// At a given width, find the let-down run line of a verse, rule a whole rung of its run on the card, and print the line's
// inline and computed font size before and after, beside a neighbor's.
// node f12.mjs <book> <label> <cell index among the verse's cells> <extra query> <width>
import { chromium, BASE, ready, noHe, mask } from "./lib.mjs";
const [BOOK, LABEL, CELL, EXTRA = "", WIDTH = "412"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(WIDTH), height: 915 } });
const errors = []; p.on("pageerror", (e) => errors.push(String(e && e.message)));
await p.addInitScript(() => { try { if (!sessionStorage.getItem("probe")) { localStorage.clear(); sessionStorage.setItem("probe", "1"); } } catch { /* fresh */ } });
await p.goto(`${BASE}?b=${BOOK}${EXTRA}#${LABEL}`, { waitUntil: "domcontentloaded" }); await ready(p);
await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label && s.querySelector(".he-text .wb")), LABEL, { timeout: 20000 }).catch(() => console.log("the verse was not drawn"));
await p.waitForTimeout(1800);
const cellSrc = `[...[...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ${JSON.stringify(LABEL)}).querySelectorAll(".wjoin")][${CELL}]`;
const state = (tag) => p.evaluate(({ src, tag }) => { const r = eval(src); const g = r.querySelector(":scope > .g"); const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); const sec = r.closest("section.seg"); const other = [...sec.querySelectorAll(".he-text .wb > .g")].find((x) => x.offsetParent && !x.closest(".wjoin")); return `${tag}: cell key=${r.__key} class="${r.className}" line[${g.className}] inline font-size=${g.style.fontSize || "none"} computed=${getComputedStyle(g).fontSize} text=${JSON.stringify(c.textContent.trim())} | a plain word's line in the verse: computed=${other ? getComputedStyle(other).fontSize : "?"}`; }, { src: cellSrc, tag });
console.log(noHe(await state("before")));
await p.evaluate((src) => { const r = eval(src); const wb = r.querySelector(".wb"); wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, cellSrc);
await p.waitForSelector("#hud > .rows .b-read .r-pills button, #hud > .rows .b-read p", { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(900);
const card = () => p.evaluate(() => `bands ${[...document.querySelectorAll("#hud > .rows > *")].map((x) => x.className.replace("band ", "")).join(",")} | chain ${[...document.querySelectorAll("#hud .b-chain .s-pills button")].map((x) => x.textContent + (x.getAttribute("aria-pressed") === "true" ? "*" : "")).join("  ")} | divisions ${[...document.querySelectorAll("#hud .b-cut .s-pills button")].map((x) => x.textContent + (x.getAttribute("aria-pressed") === "true" ? "*" : "")).join("  ")} | pills ${document.querySelectorAll("#hud .b-read .r-pills button").length} | ${[...document.querySelectorAll("#hud .b-read p:not(.r-label)")].map((x) => x.textContent.slice(0, 80)).join(" / ")}`);
console.log("card:", noHe(await card()));
// the chain's whole rung, from the chain band where the word's own card opened, else from the divisions
const rung = await p.evaluate(() => { const band = document.querySelector("#hud .b-chain") ? "#hud .b-chain" : "#hud .b-cut"; const xs = [...document.querySelectorAll(`${band} .s-pills button`)]; const x = xs.find((y) => !y.textContent.includes("+")); if (x) x.click(); return x ? `${band.slice(5)}: ${x.textContent}` : null; });
await p.waitForTimeout(1800);
console.log("pressed the whole rung:", noHe(rung)); console.log("card:", noHe(await card()));
const pill = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-read .r-pills button")]; const x = xs.find((y) => y.getAttribute("aria-pressed") !== "true") || xs[0]; if (x) x.click(); return x ? x.textContent : null; });
await p.waitForTimeout(900);
console.log("pressed a reading:", JSON.stringify(mask(pill)));
await p.keyboard.press("Escape"); await p.waitForTimeout(900);
console.log(noHe(await state("after")));
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await b.close();
