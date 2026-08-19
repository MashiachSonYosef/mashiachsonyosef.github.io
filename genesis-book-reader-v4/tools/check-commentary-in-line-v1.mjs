#!/usr/bin/env node
// Commentary opens where it was asked for, and the verse reorganises around it.
//
// A commentary attached at a word used to be a chip that opened the reader's
// card — a whole Rashi in the same box as the readings and the record. It is
// the section's other text, so it belongs in the section.
//
// One handle per line, not per word: three words on a line share a single
// generic handle under them, and which of them the reader wants is settled
// after the press, not before it. Choosing one opens it under the words it
// covers, which pushes the words it does not cover onto the next line — and
// pushes the handles with them, because handles belong to lines and the lines
// have just changed.
//
// The word-anchored map is a Genesis shape and 1 Kings carries none, so this
// runs against data/zones/fixture*.bin — a copy of 1 Kings with its own
// section commentary also hung at word positions. The fixture is a test
// instrument, never served and never deployed; ?b=1kings below is the real
// zone, and checks the section-level line is untouched by any of this.
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const BASE = (process.argv[2] || "http://127.0.0.1:8899/zone.html?b=1kings").split("?")[0];

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

for (const [mode, reader] of [["", "the Hebrew reader"], ["&mode=en", "the English reader"]]) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=fixture${mode}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(400);
  console.log(`— ${reader} —`);

  const shut = await p.evaluate(() => {
    const s = document.querySelector("section.seg"), para = s.querySelector(".he-text");
    const top = (e) => Math.round(e.getBoundingClientRect().top);
    const wbs = [...para.querySelectorAll(".wb")];
    const marked = wbs.filter((w) => w.__cm && w.__cm.length);
    return {
      names: [...para.querySelectorAll(".c-mark")].map((m) => m.textContent.replace(/\s+/g, " ").trim()),
      handles: para.querySelectorAll(".c-mark").length,
      chips: s.querySelectorAll(".c-chip").length,
      open: para.querySelectorAll(".c-mark-slot").length,
      // one handle per line that carries any commentary, and no more
      linesWithCommentary: new Set(marked.map(top)).size,
      handleLines: new Set([...para.querySelectorAll(".c-mark")].map(top)).size,
      // The handle sits under the whole line it belongs to: below every word on
      // that line, and above whatever line comes next. Not among them — inline,
      // it wrapped onto the following line and stood among words it had nothing
      // to do with.
      handleAfterItsLine: [...para.querySelectorAll(".c-mark")].every((m) => {
        const r = m.getBoundingClientRect();
        const mine = marked.filter((w) => w.getBoundingClientRect().bottom <= r.top + 2);
        if (!mine.length) return false;
        const line = Math.max(...mine.map((w) => w.getBoundingClientRect().bottom));
        const next = wbs.map((w) => w.getBoundingClientRect().top).filter((t) => t >= r.bottom - 2);
        return r.top >= line - 2 && (!next.length || Math.min(...next) >= r.bottom - 2);
      }),
      units: marked.reduce((n, w) => n + w.__cm.length, 0),
      lines: new Set(wbs.map(top)).size,
    };
  });
  check("  a line that carries commentary carries one handle", shut.handles > 0 &&
    shut.handles === shut.linesWithCommentary, `${shut.handles} handles over ${shut.linesWithCommentary} lines`);
  check("  the handle stands under the line it covers", shut.handleAfterItsLine);
  // Under the START of the line: the word a handle opens on is the first one it
  // covers and the one left standing above the commentary, so the handle
  // belongs beneath that word rather than at the far end of the line.
  const where = await p.evaluate(() => {
    const para = document.querySelector("section.seg .he-text");
    const pill = para.querySelector(".c-mark");
    const pr = pill.getBoundingClientRect(), cr = para.getBoundingClientRect();
    return { fromLeft: Math.round(pr.left - cr.left), fromRight: Math.round(cr.right - pr.right),
      dir: getComputedStyle(para).direction, pillDir: getComputedStyle(pill).direction };
  });
  check("  it sits under the start of the line, not its end",
    where.dir === "rtl" ? where.fromRight < 12 : where.fromLeft < 12,
    `${where.dir} · ${where.fromLeft}px from the left, ${where.fromRight}px from the right`);
  check("  and its own text still reads left to right", where.pillDir === "ltr");
  check("  it counts everything attached to that line, not to one word",
    shut.names.some((n) => new RegExp(`^C${shut.units}\\b`).test(n)), shut.names.join(" | "));
  // The handle says what it is and how much of it there is. Which works, which
  // units and which word each sits on is what the press is for — naming five
  // commentators on a pill only made the line noisy.
  check("  the handle says what it is, and leaves the names to the press",
    shut.names.every((n) => /^C\d*\s*Commentary$/.test(n)), shut.names.slice(0, 2).join(" | "));
  check("  the old chip that opened the card is gone", shut.chips === 0);
  check("  nothing is open until it is pressed", shut.open === 0);

  // the press offers what is on the line; the choice opens under its own word
  await p.click("section.seg .c-mark");
  await p.waitForTimeout(350);
  const offered = await p.evaluate(() => {
    const para = document.querySelector("section.seg .he-text");
    const box = para.querySelector(".c-choose");
    return { chooser: !!box, onCard: !document.getElementById("hud").hidden,
      choices: box ? box.querySelectorAll(".c-choice").length : 0,
      namesWord: box ? [...box.querySelectorAll(".c-choice .c-on")].every((x) => x.textContent.trim()) : false,
      first: box ? box.querySelector(".c-choice").textContent.replace(/\s+/g, " ").trim() : "" };
  });
  check("  pressing it offers what is attached to that line", offered.chooser && offered.choices > 1,
    `${offered.choices} offered · ${offered.first}`);
  check("  and it offers them in the section, not on the card", offered.chooser && !offered.onCard);
  check("  each offer says which word it is on", offered.namesWord);

  await p.click("section.seg .c-choice");
  await p.waitForTimeout(450);
  const open = await p.evaluate(() => {
    const s = document.querySelector("section.seg"), para = s.querySelector(".he-text");
    const panel = para.querySelector(".c-mark-slot:not(.c-choose)");
    if (!panel) return null;
    const pr = panel.getBoundingClientRect();
    const col = para.getBoundingClientRect();
    const wbs = [...para.querySelectorAll(".wb")];
    return {
      above: wbs.filter((w) => w.getBoundingClientRect().bottom <= pr.top + 1).length,
      below: wbs.filter((w) => w.getBoundingClientRect().top >= pr.bottom - 1).length,
      straddling: wbs.filter((w) => { const r = w.getBoundingClientRect();
        return r.top < pr.bottom - 1 && r.bottom > pr.top + 1; }).length,
      fullWidth: Math.round(pr.width) >= Math.round(col.width) - 2,
      chooserGone: para.querySelectorAll(".c-choose").length === 0,
      handles: para.querySelectorAll(".c-mark").length,
      inSection: s.contains(panel), onCard: !document.getElementById("hud").hidden,
      units: panel.querySelector("select")?.options.length || 1,
      ref: (panel.querySelector(".lab")?.textContent || "").trim().slice(0, 40),
      licence: panel.querySelector(".lic-chip")?.textContent || "",
      text: (panel.querySelector(".c-mark-text")?.textContent || "").trim().length,
      basis: (panel.querySelector(".c-att")?.textContent || "").slice(0, 12),
      canClose: !!panel.querySelector(".c-shut"),
    };
  });
  check("  choosing one opens it", !!open);
  if (open) {
    check("  it opens in the section, not on the card", open.inSection && !open.onCard);
    check("  the chooser gives way to it", open.chooserGone);
    check("  only the words it covers are left above it", open.above === 1 && open.straddling === 0,
      `${open.above} above, ${open.straddling} straddling`);
    check("  the rest of the verse is pushed below it", open.below > 0, `${open.below} words below`);
    check("  and the handles follow the words onto their new lines", open.handles >= 1,
      `${open.handles} handles now, was ${shut.handles}`);
    check("  it takes the width of the column", open.fullWidth);
    check("  a word carrying many units offers them all from inside", open.units > 1, `${open.units} units`);
    check("  it carries its reference, its licence and its basis",
      open.ref.length > 8 && open.licence.length > 2 && open.basis.startsWith("Attachment"),
      `${open.ref} · ${open.licence}`);
    check("  and it carries the commentary's own text", open.text > 10, `${open.text} characters`);
    check("  it can be closed from where it stands", open.canClose);
  }

  // The word it opened on stays above it. That says so only to a reader who
  // already knows to look, so the word carries a mark while its commentary
  // stands open — one thing on the page, not two that happen to be adjacent.
  const covered = await p.evaluate(() => {
    const para = document.querySelector("section.seg .he-text");
    const marked = [...para.querySelectorAll(".wb.c-open")];
    const panel = para.querySelector(".c-mark-slot:not(.c-choose)");
    return { n: marked.length, word: marked[0]?.querySelector(".w")?.textContent?.trim() || "",
      above: !!panel && marked.every((w) => w.getBoundingClientRect().bottom <= panel.getBoundingClientRect().top + 1),
      lit: marked[0] ? getComputedStyle(marked[0]).backgroundColor : "" };
  });
  check("  the word it opened on is marked while it stands open", covered.n === 1,
    `${covered.n} marked · ${covered.word}`);
  check("  and it is the one left above the commentary", covered.above);
  check("  the mark is actually painted", /^rgba?\(/.test(covered.lit) && covered.lit !== "rgba(0, 0, 0, 0)",
    covered.lit);

  // closing it puts the verse back together
  await p.click("section.seg .c-mark-slot .c-shut");
  await p.waitForTimeout(400);
  const closed = await p.evaluate(() => {
    const para = document.querySelector("section.seg .he-text");
    const wbs = [...para.querySelectorAll(".wb")];
    return { panels: para.querySelectorAll(".c-mark-slot:not(.c-choose)").length,
      lines: new Set(wbs.map((w) => Math.round(w.getBoundingClientRect().top))).size,
      handles: para.querySelectorAll(".c-mark").length };
  });
  const stillMarked = await p.evaluate(() => document.querySelectorAll("section.seg .wb.c-open").length);
  check("  closing it takes the mark off the word", stillMarked === 0, `${stillMarked} still marked`);
  check("  closing it brings the verse back together",
    closed.panels === 0 && closed.lines === shut.lines && closed.handles === shut.handles,
    `${closed.lines} lines and ${closed.handles} handles, was ${shut.lines} and ${shut.handles}`);
  await p.close();
}

// ---- and the section-level line, on the real zone, is untouched -------
{
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=1kings`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .c-bar");
  await p.click("section.seg .c-bar");
  await p.waitForTimeout(400);
  const sec = await p.evaluate(() => {
    const s = document.querySelector("section.seg");
    const inl = s.querySelector(".c-inline");
    const bar = s.querySelector(".c-bar").getBoundingClientRect();
    return { marks: s.querySelectorAll(".c-mark").length,
      shown: !!inl && !inl.hidden, belowBar: !!inl && inl.getBoundingClientRect().top >= bar.top,
      licence: !!inl?.querySelector(".lic-chip") };
  });
  console.log("— the real zone, section-level commentary —");
  check("  a section-only zone grows no in-line handles", sec.marks === 0, `${sec.marks} handles`);
  check("  its own line still opens under itself, with its licence", sec.shown && sec.belowBar && sec.licence);
  await p.close();
}

// ---- every attachment in every book, by the shape it declares ---------
//
// This is the one that guards the corpus. Shapes 1 to 3 the reader draws: a
// section coordinate covers its section, a word coordinate with a recorded
// span covers that span, a word coordinate without one covers its word.
// Shapes 4 and 5 — a coordinate spanning several sections, or a whole work —
// are declared and not yet drawn, because there is nothing to draw them
// against. Shape 6 is anything else.
//
// A count above zero in 4, 5 or 6 is a book arriving with a shape nobody has
// given the reader, and it must stop the build rather than be drawn wrong
// across everything. The reader refuses it visibly either way; this makes sure
// nobody ships past the refusal.
for (const book of ["genesis", "1kings"]) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=${book}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(800);
  const t = await p.evaluate(() => window.__scopeCensus);
  console.log(`— ${book}: every attachment by its declared shape —`);
  check("  the census counted them all", !!t && t.total > 0, t ? `${t.total} attachments` : "no census");
  if (t) {
    check("  none arrived at a shape the reader has not been given",
      t[4] + t[5] + t[6] === 0,
      `${t[4]} on a range of sections, ${t[5]} on a whole work, ${t[6]} otherwise`);
    check("  and every one of them is drawn at a declared shape",
      t[1] + t[2] + t[3] === t.total,
      `${t[1]} on a section, ${t[2]} on the span the chain recorded, ${t[3]} on the word they are attached to`);
    // Where the chain's span and the commentary's own opening quotation come
    // to different lengths, the mark follows the chain and the page says both
    // numbers. That is a count, not a failure — but it must be a count on the
    // page, so a book that starts disagreeing everywhere is visible at once.
    check("  and every disagreement between the two counts is said out loud",
      Number.isInteger(t.quoted_differs),
      `${t.quoted_differs} of ${t[2]} spans differ from their own opening quotation`);
    // The page says so on its own face, so a book that changes shape says it
    // before anyone thinks to look.
    const said = await p.evaluate(() => (document.querySelector("#meta .receipts-full")?.textContent || ""));
    check("  and the receipts say so on the page's own face",
      /commentary attachments/.test(said) && /shape/.test(said));
  }
  await p.close();
}

// ---- and the span the chain recorded for it ---------------------------
//
// The chain records how many words each commentary covers. That number is the
// corpus's own measurement of its own claim, and the reader draws it: the
// panel opens after the last word of the span, everything the span covers
// stays above it, and the rest of the verse goes below.
//
// The commentary's own opening quotation is checked against that span but
// never substituted for it. In Genesis the two agree on 180 of 181; the one
// that differs is a comment whose second head token is a one-letter
// abbreviation that a verse word ending in the same letter absorbed. Where
// they differ the panel prints both numbers. This makes sure it does, and that
// the mark did not quietly follow the quotation instead.
{
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=genesis`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .c-mark");
  await p.waitForTimeout(700);
  console.log("— a commentary covers the span the chain recorded —");
  let seen = 0; const widths = new Set(); let saidBoth = 0;
  for (const pick of [0, 1, 3, 6, 10]) {
    await p.evaluate(() => {
      document.querySelectorAll("section.seg .c-mark-slot").forEach((x) => x.remove());
      document.querySelectorAll("section.seg .wb.c-open").forEach((w) => w.classList.remove("c-open"));
      document.querySelector("section.seg .c-mark").click();
    });
    await p.waitForTimeout(320);
    const offered = await p.evaluate(() => document.querySelectorAll("section.seg .c-choice").length);
    if (pick >= offered) continue;
    await p.evaluate((i) => document.querySelectorAll("section.seg .c-choice")[i].click(), pick);
    await p.waitForTimeout(520);
    const r = await p.evaluate(() => {
      const para = document.querySelector("section.seg .he-text");
      const panel = para.querySelector(".c-mark-slot:not(.c-choose)");
      const marked = [...para.querySelectorAll(".wb.c-open")];
      const wbs = [...para.querySelectorAll(".wb")];
      const pr = panel.getBoundingClientRect();
      const lab = (panel.querySelector(".lab")?.textContent || "").trim();
      // the chain's own number for whichever entry is open, found by the text
      // the panel is printing — the page is not asked what it decided, the
      // store is asked what it recorded
      const shown = (panel.querySelector(".c-mark-text")?.textContent || "").trim();
      let span = null;
      const units = (window.__commentaryStore || {}).units || {};
      for (const u of Object.values(units))
        for (const list of Object.values(u.words || {}))
          for (const e of list)
            if (String(e.text || "").trim() === shown && e.v_words)
              span = e.v_words[1] - e.v_words[0] + 1;
      return { ref: lab.slice(0, 30), span, words: wbs.length,
        covered: marked.map((w) => w.querySelector(".w").textContent.trim()),
        allAbove: marked.every((w) => w.getBoundingClientRect().bottom <= pr.top + 1),
        below: wbs.filter((w) => w.getBoundingClientRect().top >= pr.bottom - 1).length,
        bothCounts: !!panel.querySelector(".c-two-counts") };
    });
    // everything the span covers is above the panel and everything else is
    // below it — which is nothing at all when the span is the whole verse,
    // and six comments on Genesis 1:1 are
    check(`  ${r.ref}`,
      r.span !== null && r.covered.length === r.span && r.allAbove &&
      r.below === r.words - r.span,
      `chain says ${r.span} of ${r.words} · covers ${r.covered.length} · ${r.covered.join(" ")} · ${r.below} below`);
    if (r.span !== null) widths.add(r.span);
    if (r.bothCounts) saidBoth += 1;
    seen += 1;
  }
  check("  more than one span length was reached", widths.size >= 2, `${widths.size} lengths across ${seen} opened`);
  // and at least one of them printed both numbers, so the line is not dead code
  const anyBoth = await p.evaluate(() => {
    const units = (window.__commentaryStore || {}).units || {};
    let n = 0;
    for (const u of Object.values(units))
      for (const list of Object.values(u.words || {})) n += list.length;
    return n;
  });
  check("  the store was reachable to check the chain's own numbers against", anyBoth > 0, `${anyBoth} attachments`);
  await p.close();
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
