#!/usr/bin/env node
// A word the reader has ruled on says so after the card is closed.
//
// Closing the card used to leave the page exactly as it found it, so the only
// record of which word had just been changed was in the reader's head. This
// marks a ruling, not a visit: opening a word and closing it again changes
// nothing and leaves nothing behind.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesOnDisk, zoneIdOf } from "./zones-on-disk-v1.mjs";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
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
const URL = defaultZoneUrl();
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");

// ── HOW MANY WORDS A RULING TOUCHES, ASKED OF THE BOOK ────────────────────
//
// A RULING IS ABOUT A FORM, NOT ABOUT A POSITION. The page keeps a registry
// of every place a form stands (standsOf, beside standAt in zone.html), and a
// reading ruled at any one of them is painted at all of them, with the mark
// on each. That is the site's whole model of a reading: the English attaches
// to the key, so a reader who rules once does not have to rule again forty
// lines down, and a book that showed two different readings for one form
// would be the page disagreeing with itself.
//
// This check used to assert that exactly ONE word carried the mark. That was
// true for as long as the shelf held two short books where a form stood once.
// On a seventy-three-thousand-word work a common form stands hundreds of
// times, and the check read the model working as the mark leaking — four
// failures, all of them the check's. So the number is now DERIVED: the ruled
// form's own count, taken from the zone the page is built from, over the
// stretch of the book the page has actually rendered.
//
// The window is verified, never assumed: the rendered surfaces are compared
// against the book's own first N, and when they do not line up this says so
// and holds only the law that needs no count.
const SLUG = zoneIdOf(URL);
const BIN = SLUG ? `data/zones/${SLUG}.bin` : null;
const zone = BIN && existsSync(BIN) ? JSON.parse(gunzipSync(readFileSync(BIN)).toString("utf8")) : null;
const flat = [];
for (const sec of (zone ? zone.sections || [] : [])) for (const w of (sec.words || [])) flat.push(w);
const rendered = await p.evaluate(() => [...document.querySelectorAll("section.seg .he-text .wb")].map((e) => (e.querySelector(".w") || e).textContent.trim()));
const isPrefix = flat.length >= rendered.length && rendered.length > 0
  && rendered.every((t, i) => String(flat[i].s ?? "").trim() === t);
const RULED_KEY = flat.length > 1 ? flat[1].k : null;
// every place that form stands inside what the page has drawn
const EXPECT = isPrefix && RULED_KEY
  ? flat.slice(0, rendered.length).filter((w) => w.k === RULED_KEY).length : null;
// and a neighbour that is NOT that form, so "it does not spread" is a real question
const OTHER = isPrefix && RULED_KEY ? flat.slice(0, rendered.length).findIndex((w, i) => i > 1 && w.k && w.k !== RULED_KEY) : 4;
// the masthead's title is a word like any other: it wears the ruling when it
// carries the ruled form, and there is nothing for it to follow when it does not
const TITLE_CARRIES = !!(zone && (zone.work_he_tokens || []).some((t) => t.k && t.k === RULED_KEY));
console.log(`  --  ${SLUG}: ${rendered.length.toLocaleString()} of ${flat.length.toLocaleString()} words drawn${
  isPrefix ? "" : " (not the book's own opening stretch — the count cannot be derived and is not asserted)"}${
  EXPECT === null ? "" : ` · the form at word 2 stands ${EXPECT.toLocaleString()} time(s) in what is drawn`}${
  TITLE_CARRIES ? " · the title carries it too" : " · the title does not carry it"}`);

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
check("the word the reader ruled on is marked, and so is every other place that form stands",
  after.isTheWord && (EXPECT === null ? after.n >= 1 : after.n === EXPECT),
  EXPECT === null ? `${after.n} marked · the book's own count could not be derived, so only the ruled word itself is held`
                  : `${after.n} marked · the form stands ${EXPECT} time(s) in what is drawn`);
// AND NOT ONE OF THEM READS ANYTHING ELSE. The count above says how many; this
// says they are the right ones. A mark on a word still showing another reading
// would be the page claiming a ruling it did not make.
{
  const spread = await p.evaluate((q) => {
    const ch = [...document.querySelectorAll(q)];
    const gl = ch.map((e) => (e.querySelector(".g") || { textContent: "" }).textContent.trim());
    return { n: ch.length, distinct: [...new Set(gl)], };
  }, IN_TEXT);
  check("  and every one of them reads what was ruled, so the mark never lands on a word saying something else",
    spread.distinct.length === 1 && spread.distinct[0] === chosenText,
    spread.distinct.length === 1 ? `${spread.n} word(s), all reading "${spread.distinct[0]}"`
      : `${spread.distinct.length} different readings under one mark: ${spread.distinct.slice(0, 3).map((x) => `"${x}"`).join(", ")}`);
}
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
check("the mark survives the card closing", (EXPECT === null ? after.n >= 1 : after.n === EXPECT) && after.stillActive === 0,
  `${after.n} still marked with no card open`);
check("and the reading it carries is the one that was chosen", after.gloss === chosenText,
  `page "${after.gloss}" vs card "${chosenText}"`);
check("and the book's own title follows the same ruling, where the title carries that form",
  TITLE_CARRIES ? after.titleFollows : !after.titleFollows,
  TITLE_CARRIES
    ? (after.titleFollows ? "the masthead carries this form and wears the ruling too" : "the masthead carries this form and did NOT follow")
    : (after.titleFollows ? "the masthead does not carry this form yet wears the mark" : "this book's title does not carry the ruled form, so there is nothing here for it to follow"));

// AND OPENING A DIFFERENT FORM RULES NOTHING. The neighbour is chosen for
// carrying a different key, so this asks a real question: looking at another
// word must not add a mark, and must not take one away from the form that was
// ruled.
const nbr = OTHER >= 0 && wbs[OTHER] ? OTHER : 4;
await wbs[nbr].click();
await p.waitForSelector("#hud .r-pills button", { timeout: 20000 });
await p.keyboard.press("Escape");
await p.waitForTimeout(120);
{
  const now = await marked();
  check("a word of another form, merely opened alongside it, leaves the marks exactly as they were",
    EXPECT === null ? now === after.n : now === EXPECT,
    `${now} marked after opening word ${nbr + 1}, which stands under a different form`);
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
