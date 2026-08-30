#!/usr/bin/env node
// What lands when the reader copies.
//
// There is no copy button on this page any more. A button writing to a
// clipboard is the site handing text over, and text handed over carries
// obligations; a reader who selects and presses copy is doing what a reader
// does on any page, and the licences are on the page they copied from.
//
// So the site owes them nothing except a clean selection — and a clean
// selection is not free here, because the Hebrew and its reading live inside
// one block, so a browser selecting across a verse used to interleave them
// word by word, one word per line.
//
// The falsifier for the whitespace rewrite is the last check: take every space
// out of what the clipboard holds and it must equal, character for character,
// the page's own selectable text over that range. Nothing added — no licence
// line, no citation — and nothing dropped.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
const { chromium } = pw;

const URL = defaultZoneUrl();
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const HE = /[֐-׿]/;
const LAT = /[A-Za-z]/;
const bare = (s) => s.replace(/\s+/g, "");

const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.context().grantPermissions(["clipboard-read", "clipboard-write"]);
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");

// The copy laws are about verses a reader would copy — lines of text. A
// fleet shelf carries zones whose sections hold one word each (poem shards,
// dedication pages); on those, a triple-tap's 20-character floor and a
// two-verse drag's geometry witness nothing but the zone's smallness, and
// the drag can wander into the masthead. The verse is derived: the first
// section pair where both hold at least four words. A zone with no such
// pair offers no witness for these laws — the panel's larger zones carry
// them — and this check says so instead of failing the smallness.
const VERSE_IX = await p.evaluate(() => {
  const secs = [...document.querySelectorAll("section.seg")];
  for (let i = 0; i + 1 < secs.length; i += 1) {
    const a = secs[i].querySelectorAll(".he-text .wb").length;
    const c = secs[i + 1].querySelectorAll(".he-text .wb").length;
    if (a >= 4 && c >= 4) return i;
  }
  return -1;
});
if (VERSE_IX < 0) {
  console.log("SKIPPED — no adjacent pair of four-word verses on this zone; the copy laws are witnessed on the panel's larger zones");
  await b.close();
  process.exit(3);
}

const copyNow = async () => {
  // The clipboard is cleared to a sentinel first and read until it changes:
  // a fixed wait read whatever was there when the copy event ran late, and
  // the suite then judged this page by the previous gesture's text.
  await p.evaluate(() => navigator.clipboard.writeText("\u0007stale\u0007").catch(() => {}));
  await p.keyboard.press("Control+C");
  for (let i = 0; i < 20; i += 1) {
    await p.waitForTimeout(70);
    const t = await p.evaluate(() => navigator.clipboard.readText().catch(() => ""));
    if (t !== "\u0007stale\u0007") return t;
  }
  return "";
};
const clearClip = () => p.evaluate(() => navigator.clipboard.writeText("·nothing·").catch(() => {}));

/** Three taps on a verse, the way a reader asks for a line. */
const tripleVerse = async (nth = 0, target = ".wb .w") => {
  await clearClip();
  const el = (await p.$$("section.seg .he-text"))[nth];
  // the reader's gesture is three taps ON A WORD — a coordinate ten pixels
  // under the block's top edge is a bet about overlays, and on a tall verse
  // it landed on the sticky section bar and copied its label. The WORD is
  // what scrolls into view: scrolling the block parks its first line under
  // the sticky chrome, and a click on covered glyphs selects the cover.
  const word = await el.$(target);
  await word.scrollIntoViewIfNeeded();
  const box = await word.boundingBox();
  await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { clickCount: 3 });
  await p.waitForTimeout(120);
  return copyNow();
};

// what the page itself is showing, read straight off the DOM rather than off
// anything the copy path touched
const showing = async (nth = 0) => p.evaluate((i) => {
  const s = document.querySelectorAll("section.seg")[i];
  // the license chip inside a gloss is frame, not text — it never rides a
  // copy, so the "shown" measure strips it too
  const sel = (q) => [...s.querySelectorAll(q)].map((x) => {
    const c = x.cloneNode(true);
    c.querySelectorAll(".g-lic").forEach((e) => e.remove());
    return c.textContent;
  }).join(" ");
  return {
    he: sel(".he-text .wb .w"),
    en: sel(".he-text .wb .g"),
    bar: s.querySelector(".c-bar")?.innerText.replace(/\s+/g, " ").trim() || "",
    label: s.querySelector(".vnum")?.textContent || "",
  };
}, nth);

// ---- the Hebrew reader copies Hebrew ---------------------------------
{
  const t = (await tripleVerse(VERSE_IX)).trim();
  const dom = await showing(VERSE_IX);
  // what a whole copy owes is the verse's own measure, not a typed one: a
  // fleet essay's opening unit is four words of seventeen characters, and
  // holding it to a Tanakh verse's length failed a copy that was exact
  const owedChars = Math.min(21, bare(dom.he).length);
  const owedWords = Math.min(5, dom.he.split(/\s+/).filter(Boolean).length);
  check("three taps on a verse copy the verse", t.length >= owedChars,
    `${t.length} chars, ${owedChars} owed by this verse`);
  check("the Hebrew reader copies Hebrew", HE.test(t), t.slice(0, 42));
  check("no reading is zipped into it", !LAT.test(t),
    (t.match(/[A-Za-z][A-Za-z ]*/g) || []).slice(0, 3).join(" | ") || "clean");
  check("it comes out as a line, not a column of words",
    !t.includes("\n") && t.split(" ").filter(Boolean).length >= owedWords,
    `${t.split("\n").length} line(s), ${t.split(" ").filter(Boolean).length} words, ${owedWords} owed`);
  check("no word is glued to the next", !t.split(/\s+/).some((w) => w.length > 24),
    `longest ${Math.max(...t.split(/\s+/).map((w) => w.length))}`);
  check("the chrome does not come with it",
    !/export/i.test(t) && !(dom.bar && t.includes(dom.bar)) && !(dom.label && t.includes(dom.label)),
    t.slice(-36));
  check("it is exactly what the page is showing, whitespace aside",
    bare(t) === bare(dom.he), `${bare(t).length} copied vs ${bare(dom.he).length} shown`);
}

// ---- a word on its own ------------------------------------------------
{
  await clearClip();
  const w = await p.$("section.seg .he-text .wb .w");
  const box = await w.boundingBox();
  await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { clickCount: 2 });
  await p.waitForTimeout(120);
  const t = (await copyNow()).trim();
  check("two taps copy the one word", HE.test(t) && !LAT.test(t) && !t.includes("\n"), t);
}

// ---- two verses come out as two lines --------------------------------
{
  // Close the card the taps above opened — it stands over the text now, and a
  // drag begun on it drags the card rather than selecting anything. Then step
  // away: a mousedown landing soon enough and close enough after a double click
  // counts as the third of a triple, and the page would answer it by selecting
  // the whole line.
  await p.keyboard.press("Escape");
  await p.mouse.move(4, 4);
  await p.waitForTimeout(700);
  // Drop the selection the taps above left. A real mouse clears it on the next
  // mousedown; a synthetic one driven over the debug protocol does not, so
  // without this the drag below measures the previous gesture's selection and
  // reports a page fault that only exists in the harness. Verified by setting a
  // selection with plain JS, no page handler involved, and watching the same
  // synthetic drag fail to replace it.
  await p.evaluate(() => window.getSelection().removeAllRanges());
  // Two adjacent verses that fit the viewport together, found by looking:
  // the first two of a book can be long — the Targum to Ruth opens on such a
  // pair — and typing 0 and 1 here declared every such book broken.
  const secs = await p.$$("section.seg");
  let pair = -1, b1 = null, b2 = null;
  for (let i = 0; i + 1 < Math.min(secs.length, 12); i += 1) {
    await p.evaluate((n) => document.querySelectorAll("section.seg")[n].scrollIntoView({ block: "center" }), i + 1);
    await p.waitForTimeout(250);
    const ha = await secs[i].$(".he-text"), hb = await secs[i + 1].$(".he-text");
    if (!ha || !hb) continue;
    // the same four-word law as the verse pick: a one-word dedication line
    // witnesses nothing about verse-line copying
    const [wa, wb2] = await p.evaluate((n) => {
      const ss = document.querySelectorAll("section.seg");
      return [ss[n].querySelectorAll(".he-text .wb").length, ss[n + 1].querySelectorAll(".he-text .wb").length];
    }, i);
    if (wa < 4 || wb2 < 4) continue;
    const xa = await ha.boundingBox(), xb = await hb.boundingBox();
    if (xa && xb && xa.y > 0 && xb.y + xb.height < 915) { pair = i; b1 = xa; b2 = xb; break; }
  }
  if (pair >= 0) {
    await clearClip();
    await p.mouse.move(b1.x + b1.width - 4, b1.y + 6);
    await p.mouse.down();
    await p.mouse.move(b2.x + 6, b2.y + b2.height - 6, { steps: 24 });
    await p.mouse.up();
    await p.waitForTimeout(140);
    const t = (await copyNow()).trim();
    const lines = t.split("\n").filter((l) => l.trim());
    const d1 = await showing(pair), d2 = await showing(pair + 1);
    check("a drag across two verses gives two lines", lines.length === 2, `${lines.length} lines`);
    check("each line is its own verse, entire",
      lines.length === 2 && bare(lines[0]) === bare(d1.he) && bare(lines[1]) === bare(d2.he),
      lines.map((l) => l.slice(0, 22)).join(" ⏎ "));
    check("a word held together by a maqaf stays one word",
      !/\s־\s|־\s|\s־/.test(t), (t.match(/.{0,4}־.{0,4}/) || ["no maqaf here"])[0]);
  } else console.log("  note  no adjacent pair of four-word verses fits this viewport together on this zone; the two-line law is witnessed on the panel's other zones");
}

// ---- the drag takes the layer of the word it starts on ---------------
//
// Nothing on this page is locked away from a reader who reaches for it: the
// reader you are in only sets which layer a drag starts on, and pressing a
// word of the other layer takes that one instead. This matters beyond the
// gesture — a page that permanently refuses to let one layer be selected is
// applying a technical restriction to licensed material, and every licence in
// this corpus asks for attribution, not for lockdown.
{
  // anchored to the derived verse, not the page's first section — on a flat
  // zone the first section is a one-word dedication and a drag from it
  // witnesses nothing
  const dragSec = (await p.$$("section.seg"))[VERSE_IX];
  const dragFrom = async (sel) => {
    await clearClip();
    const el = await dragSec.$(sel);
    await el.scrollIntoViewIfNeeded();
    const bb = await el.boundingBox();
    // The drag ends ON the paragraph's own last word, not at a corner of its
    // box: a pixel corner is a bet about line metrics, and a font swap in
    // the harness environment landed the old corner on the next chapter's
    // head — the copy swept a frame the gesture never touched. The last
    // word's box moves with the layout, so the gesture stays the gesture.
    // …and on-screen: the Targum's first paragraph is taller than a phone,
    // so "the last word" must mean the last word a finger could reach
    // without scrolling — a coordinate outside the viewport is not a
    // gesture at all.
    const tail = await dragSec.$$(".he-text .wb .w");
    let tb = null;
    for (const w of tail) {
      const cand = await w.boundingBox();
      if (cand && cand.y > bb.y && cand.y + cand.height < 875) tb = cand;
    }
    if (!tb) tb = await tail[Math.min(8, tail.length - 1)].boundingBox();
    await p.mouse.move(bb.x + bb.width - 2, bb.y + bb.height / 2);
    await p.mouse.down();
    await p.mouse.move(tb.x + 2, tb.y + tb.height / 2, { steps: 18 });
    await p.mouse.up();
    await p.waitForTimeout(140);
    return (await copyNow()).trim();
  };
  // the first word that carries a reading: a bare word's gloss span is
  // empty, and a drag begun on nothing takes whatever stands beside it
  const W = ".he-text .wb:has(.g:not(.bare)) .w";
  const G = ".he-text .wb:has(.g:not(.bare)) .g";
  for (const [mode, btn] of [["the Hebrew reader", "#modeHe"], ["the English reader", "#modeEn"]]) {
    await p.click(btn); await p.waitForTimeout(300);
    const he = await dragFrom(W), en = await dragFrom(G);
    check(`in ${mode}, a drag begun on a Hebrew word takes Hebrew`,
      HE.test(he) && !LAT.test(he), he.slice(0, 34));
    check(`in ${mode}, a drag begun on a reading takes readings`,
      LAT.test(en) && !HE.test(en), en.slice(0, 34));
  }
}

// ---- the English reader copies English -------------------------------
await p.click("#modeEn");
await p.waitForTimeout(350);
{
  check("the page can be read in English", await p.evaluate(() => document.body.classList.contains("en")));
  const t = (await tripleVerse(VERSE_IX, ".wb .g:not(.bare)")).trim();
  const dom = await showing(VERSE_IX);
  check("the English reader copies English", LAT.test(t), t.slice(0, 42));
  // "no Hebrew at all" was a proxy that broke the day a record quoted its
  // own lemma — Strong's writes the Hebrew inside its English. The law is
  // that the VERSE's words do not interleave into the reading run; a
  // record's own quoted Hebrew is the record's text, lawfully copied.
  const verseWords = dom.he.split(/\s+/).filter((w) => w.length > 1);
  const zipped = verseWords.filter((w) => t.includes(w));
  check("no word of the verse is zipped into it", zipped.length === 0,
    zipped.slice(0, 3).join(" | ") || "clean");
  check("it comes out as a line", !t.includes("\n"), `${t.split("\n").length} line(s)`);
  check("it is exactly the reading the page is showing, whitespace aside",
    bare(t) === bare(dom.en), `${bare(t).length} copied vs ${bare(dom.en).length} shown`);
}

// ---- the order is the text's order, not the eye's --------------------
//
// In the Hebrew reader the verse flows right to left, so the readings sit
// under it right to left too: the eye scanning the line from the left meets
// the last word of the verse first. What is copied is the order of the text —
// word one first — because that is the order the corpus emitted them in, and a
// copy that emitted reading ten before reading one would be a sequence nobody
// wrote. The Hebrew needs no help here: its own characters carry their
// direction, so it lands on the page it is pasted into laid out as it was
// here. The readings cannot, being English words arranged in Hebrew's order.
for (const [mode, btn, agree] of [["the Hebrew reader", "#modeHe", false], ["the English reader", "#modeEn", true]]) {
  await p.click(btn); await p.waitForTimeout(300);
  const o = await p.evaluate((ix) => {
    const s = document.querySelectorAll("section.seg")[ix];
    const els = [...s.querySelectorAll(".he-text .wb .g")];
    const doc = els.map((e) => e.textContent.trim());
    const eye = els.map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), y: Math.round(r.y / 14), x: r.x }; })
      .sort((a, b) => a.y - b.y || a.x - b.x).map((z) => z.t);
    return { doc, eye, agree: doc.join("|") === eye.join("|") };
  }, VERSE_IX);
  check(`in ${mode}, the eye's order ${agree ? "agrees with the text's" : "does not — and the text's is what is copied"}`,
    o.agree === agree, `text starts "${o.doc[0]}", the eye meets "${o.eye[0]}" first`);
}

// ---- and the licence is on the page they copied from -----------------
{
  // Which licence, asked of the zone. This looked for the strings CC-BY or
  // "public domain" or the word "licence" anywhere on the page — so a work
  // under any other licence could only pass by the page happening to contain
  // the word "licence", and the detail line could only ever quote a CC-BY.
  // What matters is that this work's own family is on the page a reader
  // copied from, and the page says which family that is.
  const lic = await p.evaluate(() => {
    const per = ((window.__zone || {}).emitted_from || {}).license_receipts || {};
    const m = String(per.per_occurrence || "").match(/rows:\s*([^·]+)·/u);
    const family = m ? m[1].trim() : "";
    const txt = document.body.innerText;
    const at = family ? txt.indexOf(family) : -1;
    return { family, has: at >= 0, where: at >= 0 ? txt.slice(at, at + 60).split("\n")[0] : "" };
  });
  check("  the zone records a licence family at all", !!lic.family && !/NOT[_ ]ESTABLISHED/iu.test(lic.family),
    lic.family || "the zone's receipts name no family");
  check("the licence is readable on the page they copied from", lic.has,
    lic.where || `${lic.family || "no family"} appears nowhere on the page — only in the receipts`);
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
