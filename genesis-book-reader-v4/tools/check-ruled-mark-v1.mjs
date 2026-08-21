#!/usr/bin/env node
// A word the reader has ruled on says so after the card is closed.
//
// Closing the card used to leave the page exactly as it found it, so the only
// record of which word had just been changed was in the reader's head. This
// marks a ruling, not a visit: opening a word and closing it again changes
// nothing and leaves nothing behind.
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(process.argv[2] || "http://127.0.0.1:8899/zone.html?b=1kings", { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");

const marked = () => p.evaluate(() => document.querySelectorAll(".wb.chosen").length);
check("nothing is marked before the reader has ruled on anything", (await marked()) === 0);

// open a word, change nothing, close
const wbs = await p.$$("section.seg .he-text .wb");
await wbs[1].click();
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
await p.keyboard.press("Escape");
await p.waitForTimeout(120);
check("looking at a word and closing again leaves no mark", (await marked()) === 0, `${await marked()} marked`);

// open the same word and choose a different reading
await wbs[1].click();
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
const pills = await p.$$("#hud .r-pills button");
check("this word has readings to choose between", pills.length > 1, `${pills.length} readings`);
await pills[1].click();
await p.waitForTimeout(150);
const chosenText = await p.evaluate(() => document.querySelector("#hud .r-now .v").textContent.trim());
await p.keyboard.press("Escape");
await p.waitForTimeout(150);

const after = await p.evaluate(() => {
  const w = [...document.querySelectorAll(".wb.chosen")];
  const one = w[0];
  const cs = one ? getComputedStyle(one) : null;
  return {
    n: w.length,
    isTheWord: !!one && one === document.querySelectorAll("section.seg .he-text .wb")[1],
    gloss: one ? one.querySelector(".g").textContent.trim() : "",
    tinted: !!cs && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent",
    stillActive: document.querySelectorAll(".wb.active").length,
  };
});
check("the word the reader ruled on is marked", after.n === 1 && after.isTheWord, `${after.n} marked`);
check("the mark is a tint, not a border that moves the line", after.tinted);
check("the mark survives the card closing", after.n === 1 && after.stillActive === 0);
check("and the reading it carries is the one that was chosen", after.gloss === chosenText,
  `page "${after.gloss}" vs card "${chosenText}"`);

// the mark does not spread to its neighbours
await wbs[4].click();
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
await p.keyboard.press("Escape");
await p.waitForTimeout(120);
check("a word merely opened alongside it stays unmarked", (await marked()) === 1, `${await marked()} marked`);

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
