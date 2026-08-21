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
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;

const URL = process.argv[2] || "http://127.0.0.1:8899/zone.html?b=1kings";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const HE = /[֐-׿]/;
const LAT = /[A-Za-z]/;
const bare = (s) => s.replace(/\s+/g, "");

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.context().grantPermissions(["clipboard-read", "clipboard-write"]);
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");

const copyNow = async () => {
  await p.keyboard.press("Control+C");
  await p.waitForTimeout(140);
  return p.evaluate(() => navigator.clipboard.readText().catch(() => ""));
};
const clearClip = () => p.evaluate(() => navigator.clipboard.writeText("·nothing·").catch(() => {}));

/** Three taps on a verse, the way a reader asks for a line. */
const tripleVerse = async (nth = 0) => {
  await clearClip();
  const el = (await p.$$("section.seg .he-text"))[nth];
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  await p.mouse.click(box.x + box.width / 2, box.y + 10, { clickCount: 3 });
  await p.waitForTimeout(120);
  return copyNow();
};

// what the page itself is showing, read straight off the DOM rather than off
// anything the copy path touched
const showing = async (nth = 0) => p.evaluate((i) => {
  const s = document.querySelectorAll("section.seg")[i];
  const sel = (q) => [...s.querySelectorAll(q)].map((x) => x.textContent).join(" ");
  return {
    he: sel(".he-text .wb .w"),
    en: sel(".he-text .wb .g"),
    bar: s.querySelector(".c-bar")?.innerText.replace(/\s+/g, " ").trim() || "",
    label: s.querySelector(".vnum")?.textContent || "",
  };
}, nth);

// ---- the Hebrew reader copies Hebrew ---------------------------------
{
  const t = (await tripleVerse()).trim();
  const dom = await showing();
  check("three taps on a verse copy the verse", t.length > 20, `${t.length} chars`);
  check("the Hebrew reader copies Hebrew", HE.test(t), t.slice(0, 42));
  check("no reading is zipped into it", !LAT.test(t),
    (t.match(/[A-Za-z][A-Za-z ]*/g) || []).slice(0, 3).join(" | ") || "clean");
  check("it comes out as a line, not a column of words",
    !t.includes("\n") && t.split(" ").filter(Boolean).length >= 5,
    `${t.split("\n").length} line(s), ${t.split(" ").filter(Boolean).length} words`);
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
  await p.evaluate(() => document.querySelectorAll("section.seg")[1].scrollIntoView({ block: "center" }));
  await p.waitForTimeout(200);
  const secs = await p.$$("section.seg");
  const b1 = await (await secs[0].$(".he-text")).boundingBox();
  const b2 = await (await secs[1].$(".he-text")).boundingBox();
  if (b1 && b2 && b1.y > 0 && b2.y + b2.height < 915) {
    await clearClip();
    await p.mouse.move(b1.x + b1.width - 4, b1.y + 6);
    await p.mouse.down();
    await p.mouse.move(b2.x + 6, b2.y + b2.height - 6, { steps: 24 });
    await p.mouse.up();
    await p.waitForTimeout(140);
    const t = (await copyNow()).trim();
    const lines = t.split("\n").filter((l) => l.trim());
    const d1 = await showing(0), d2 = await showing(1);
    check("a drag across two verses gives two lines", lines.length === 2, `${lines.length} lines`);
    check("each line is its own verse, entire",
      lines.length === 2 && bare(lines[0]) === bare(d1.he) && bare(lines[1]) === bare(d2.he),
      lines.map((l) => l.slice(0, 22)).join(" ⏎ "));
    check("a word held together by a maqaf stays one word",
      !/\s־\s|־\s|\s־/.test(t), (t.match(/.{0,4}־.{0,4}/) || ["no maqaf here"])[0]);
  } else check("a drag across two verses gives two lines", false, "both verses did not fit the viewport");
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
  const dragFrom = async (sel) => {
    await clearClip();
    const el = await p.$(sel);
    await el.scrollIntoViewIfNeeded();
    const bb = await el.boundingBox();
    const para = await (await p.$("section.seg .he-text")).boundingBox();
    await p.mouse.move(bb.x + bb.width - 2, bb.y + bb.height / 2);
    await p.mouse.down();
    await p.mouse.move(para.x + 4, para.y + para.height - 6, { steps: 18 });
    await p.mouse.up();
    await p.waitForTimeout(140);
    return (await copyNow()).trim();
  };
  const W = "section.seg .he-text .wb:first-child .w";
  const G = "section.seg .he-text .wb:first-child .g";
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
  const t = (await tripleVerse()).trim();
  const dom = await showing();
  check("the English reader copies English", LAT.test(t), t.slice(0, 42));
  check("no Hebrew is zipped into it", !HE.test(t),
    (t.match(/[֐-׿]+/g) || []).slice(0, 3).join(" | ") || "clean");
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
  const o = await p.evaluate(() => {
    const s = document.querySelector("section.seg");
    const els = [...s.querySelectorAll(".he-text .wb .g")];
    const doc = els.map((e) => e.textContent.trim());
    const eye = els.map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), y: Math.round(r.y / 14), x: r.x }; })
      .sort((a, b) => a.y - b.y || a.x - b.x).map((z) => z.t);
    return { doc, eye, agree: doc.join("|") === eye.join("|") };
  });
  check(`in ${mode}, the eye's order ${agree ? "agrees with the text's" : "does not — and the text's is what is copied"}`,
    o.agree === agree, `text starts "${o.doc[0]}", the eye meets "${o.eye[0]}" first`);
}

// ---- and the licence is on the page they copied from -----------------
{
  const lic = await p.evaluate(() => {
    const txt = document.body.innerText;
    return { has: /CC[- ]BY|public domain|licen[cs]e/i.test(txt), where: (txt.match(/CC-BY[^\n]{0,44}/) || [""])[0] };
  });
  check("the licence is readable on the page they copied from", lic.has, lic.where || "in the receipts");
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
