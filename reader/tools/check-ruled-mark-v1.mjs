#!/usr/bin/env node
// A word the reader has ruled on says so after the card is closed.
//
// Closing the card used to leave the page exactly as it found it, so the only
// record of which word had just been changed was in the reader's head. This
// marks a ruling, not a visit: opening a word and closing it again changes
// nothing and leaves nothing behind.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
const SKIP_LABEL = "check-ruled-mark-v1";
// A check about commentary needs a work that carries some. When none is
// served, that is a fact about the corpus and not a defect in the reader, so
// this says so and stops rather than failing every assertion against a page
// with nothing on it.
{
  const { zonesWithCommentary } = await import("./zones-on-disk-v1.mjs");
  if (!zonesWithCommentary().length) {
    console.log(`SKIPPED — no served work carries a commentary sidecar, so ${SKIP_LABEL} has nothing to open`);
    process.exit(3);
  }
}

const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad++; });
await p.goto(defaultZoneUrl(), { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");

// IN THE TEXT, NOT ON THE PAGE. The masthead's title is a word like any
// other: it carries its own key, it opens its own record, and it wears the
// reading the reader ruled — the door and the book agree about a word on
// purpose, so a ruling made in Amos 1:1 follows to the title that names the
// book. That is the behaviour, not a leak. Counted across the whole document
// it read as the mark spreading to a second word, and three clauses below it
// then measured the TITLE instead of the word: "not a tint", "did not survive
// the close". The subject of this check is the text.
const IN_TEXT = "section.seg .he-text .wb.chosen";
const marked = () => p.evaluate((q) => document.querySelectorAll(q).length, IN_TEXT);
// THE MARK, MEASURED ALONE. "The mark moves nothing" is a claim about the
// mark, and two other things move a word at the same moment: its reading
// changes, which is the ruling doing its work, and a longer reading wraps to
// another line. Measuring the word before the ruling and after it caught all
// three at once and reported a box growing 77px to 139px as if the mark had
// done it. So the mark is taken off and put back on the settled word, with
// nothing else touched, and the box is read on both sides of that.
const markCosts = () => p.evaluate(() => {
  const e = document.querySelectorAll("section.seg .he-text .wb.chosen")[0];
  if (!e) return null;
  const read = () => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100,
      pad: ["Top", "Right", "Bottom", "Left"].map((k) => cs[`padding${k}`]).join(" "),
      border: ["Top", "Right", "Bottom", "Left"].reduce((t, k) => t + parseFloat(cs[`border${k}Width`] || 0), 0) }; };
  const on = read();
  e.classList.remove("chosen");
  void e.offsetHeight;
  const off = read();
  e.classList.add("chosen");
  return { on, off };
});
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

const after = await p.evaluate((q) => {
  const w = [...document.querySelectorAll(q)];
  const one = w[0];
  const cs = one ? getComputedStyle(one) : null;
  return {
    n: w.length,
    isTheWord: !!one && one === document.querySelectorAll("section.seg .he-text .wb")[1],
    gloss: one ? one.querySelector(".g").textContent.trim() : "",
    // THE LAW IS THAT THE MARK DOES NOT MOVE THE LINE, and the mechanism is
    // the design's to choose. This asked for a background tint by name, so
    // when the mark became an inset rule — drawn inside the word's own box,
    // which is strictly better at the same job: it takes no layout AND puts
    // no colour behind the letters — the check called a correct mark wrong.
    // What is asked now is what the law says: something is drawn, it takes no
    // border, and the word's box is the size an unmarked word's box is.
    marks: !!cs && ((cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent")
      || (cs.boxShadow && cs.boxShadow !== "none")),
    borderPx: cs ? ["Top", "Right", "Bottom", "Left"].reduce((t, side) => t + parseFloat(cs[`border${side}Width`] || 0), 0) : -1,

    stillActive: document.querySelectorAll("section.seg .he-text .wb.active").length,
    // and the title still follows the ruling, which is the other half of the
    // same law and would otherwise go unwatched now that it is out of the count
    titleFollows: [...document.querySelectorAll(".wb.chosen")].length > w.length,
  };
}, IN_TEXT);
check("the word the reader ruled on is marked", after.n === 1 && after.isTheWord, `${after.n} marked`);
{
  const m = await markCosts();
  const free = !!m && m.on.w === m.off.w && m.on.h === m.off.h
    && m.on.pad === m.off.pad && m.on.border === m.off.border;
  check("the mark is drawn on the word and moves nothing",
    after.marks && after.borderPx === 0 && free,
    `${after.marks ? "drawn" : "nothing drawn"} · ${after.borderPx}px of border · ` +
    (!m ? "no marked word to measure"
        : free ? `the box is ${m.on.w}\u00d7${m.on.h} with the mark and without it`
               : `the mark costs layout: ${m.off.w}\u00d7${m.off.h} without, ${m.on.w}\u00d7${m.on.h} with`));
}
check("the mark survives the card closing", after.n === 1 && after.stillActive === 0);
check("and the reading it carries is the one that was chosen", after.gloss === chosenText,
  `page "${after.gloss}" vs card "${chosenText}"`);
check("and the book's own title follows the same ruling", after.titleFollows,
  after.titleFollows ? "the masthead wears it too" : "the title did not follow");

// the mark does not spread to its neighbours
await wbs[4].click();
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
await p.keyboard.press("Escape");
await p.waitForTimeout(120);
check("a word merely opened alongside it stays unmarked", (await marked()) === 1, `${await marked()} marked`);

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
