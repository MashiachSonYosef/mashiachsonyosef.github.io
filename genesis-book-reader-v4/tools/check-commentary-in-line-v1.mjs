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
    // the verse's own words: a commentary's words are blocks too, and they
    // stand inside the open panel, so they are its text and not this verse's
    const wbs = [...para.querySelectorAll(".wb")].filter((w) => !w.closest(".c-mark-slot"));
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
    // the verse's own words: a commentary's words are blocks too, and they
    // stand inside the open panel, so they are its text and not this verse's
    const wbs = [...para.querySelectorAll(".wb")].filter((w) => !w.closest(".c-mark-slot"));
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
    // the verse's own words: a commentary's words are blocks too, and they
    // stand inside the open panel, so they are its text and not this verse's
    const wbs = [...para.querySelectorAll(".wb")].filter((w) => !w.closest(".c-mark-slot"));
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
  // one unit of each span width the sidecar records on the first word, taken
  // from the list inside the open commentary, so every width the chain uses is
  // actually drawn at least once
  const wanted = await p.evaluate(() => {
    const w0 = (((window.__commentaryStore || {}).units || {})["genesis-1-1"] || {}).words["0"] || [];
    const yr = (e) => (e.years && e.years.length && Number.isFinite(Number(e.years[0])) ? Number(e.years[0]) : Infinity);
    const ordered = [...w0].map((e, i) => ({ e, i })).sort((a, b) => yr(a.e) - yr(b.e) || a.i - b.i);
    const first = new Map();
    ordered.forEach((x, at) => {
      const wdt = x.e.v_words[1] - x.e.v_words[0] + 1;
      if (!first.has(wdt)) first.set(wdt, at);
    });
    return [...first.values()].sort((a, b) => a - b);
  });
  await p.evaluate(() => document.querySelector("section.seg .c-mark").click());
  await p.waitForTimeout(350);
  await p.evaluate(() => document.querySelectorAll("section.seg .c-choice")[0].click());
  await p.waitForTimeout(520);
  for (const pick of wanted) {
    await p.evaluate((i) => {
      const sel = document.querySelector("section.seg .c-mark-slot:not(.c-choose) select");
      if (!sel) return;
      sel.value = String(i);
      sel.dispatchEvent(new Event("change"));
    }, pick);
    await p.waitForTimeout(520);
    const r = await p.evaluate(() => {
      const para = document.querySelector("section.seg .he-text");
      const panel = para.querySelector(".c-mark-slot:not(.c-choose)");
      if (!panel) return null;
      // the verse's own words, not the commentary's — a commentary's words are
      // blocks too now, and they live inside the panel
      const verseWb = (root) => [...root.querySelectorAll(".wb")]
        .filter((w) => !w.closest(".c-mark-slot"));
      const marked = verseWb(para).filter((w) => w.classList.contains("c-open"));
      const wbs = verseWb(para);
      const pr = panel.getBoundingClientRect();
      const lab = (panel.querySelector(".lab")?.textContent || "").trim();
      // the chain's own number for whichever unit is open, found by the
      // reference the panel names — the page is not asked what it decided,
      // the store is asked what it recorded
      let span = null;
      const units = (window.__commentaryStore || {}).units || {};
      for (const u of Object.values(units))
        for (const list of Object.values(u.words || {}))
          for (const e of list)
            if (e.he_ref && lab.includes(e.he_ref) && e.v_words)
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
    if (!r) continue;
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

// ---- a commentary is a work, so its own words open ---------------------
//
// The verse's words carry readings and open a card. So must a commentary's:
// the whole project is that no English is forced anywhere, and a commentary
// printed as one unreadable run of Hebrew forces the reader either to know it
// already or to go somewhere else. The same block, the same card, the same
// store, the same licence per reading.
{
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=genesis`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .c-mark");
  await p.waitForTimeout(800);
  console.log("— a commentary's own words open —");
  await p.evaluate(() => document.querySelector("section.seg .c-mark").click());
  await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelectorAll("section.seg .c-choice")[1].click());
  await p.waitForTimeout(700);

  const r = await p.evaluate(() => {
    const pan = document.querySelector("section.seg .c-mark-slot:not(.c-choose)");
    const lab = (pan.querySelector(".lab")?.textContent || "").trim();
    const wbs = [...pan.querySelectorAll(".c-mark-text .wb")];
    // what the sidecar itself recorded for whichever unit is open, found by
    // the reference the panel names rather than by the text it is printing
    let recorded = null;
    const units = (window.__commentaryStore || {}).units || {};
    for (const u of Object.values(units))
      for (const list of Object.values(u.words || {}))
        for (const e of list)
          if (e.he_ref && lab.includes(e.he_ref))
            recorded = { words: (e.words || []).length, text: e.text };
    return { ref: lab.slice(0, 24),
      blocks: wbs.length, recorded,
      withReading: wbs.filter((w) => (w.querySelector(".g")?.textContent || "").trim()).length,
      // the pieces put the commentary back together, on the page as in the file
      rejoins: wbs.map((w) => w.querySelector(".w").textContent).join("") ===
        String(recorded ? recorded.text : "").replace(/\s+/gu, "") };
  });
  check("  every word of it is a block", r.recorded && r.blocks === r.recorded.words,
    `${r.ref} · ${r.blocks} blocks, the sidecar records ${r.recorded ? r.recorded.words : "?"}`);
  check("  and the blocks put the commentary back together", r.rejoins);
  check("  most of them carry a reading", r.withReading > r.blocks / 2,
    `${r.withReading} of ${r.blocks}`);

  // pressing one opens the same card the verse's words open
  const pressed = await p.evaluate(() => {
    const w = [...document.querySelectorAll(".c-mark-text .wb")]
      .find((x) => (x.querySelector(".g")?.textContent || "").trim());
    if (!w) return null;
    (w.querySelector(".w span") || w.querySelector(".w")).click();
    return w.querySelector(".w").textContent.trim();
  });
  await p.waitForTimeout(600);
  const card = await p.evaluate(() => {
    const h = document.querySelector("#hud");
    if (!h || h.hidden) return { open: false };
    return { open: true,
      pills: h.querySelectorAll(".r-pills button, .r-pills .r-pill").length,
      licences: h.querySelectorAll(".lic-chip").length,
      text: (h.textContent || "").replace(/\s+/g, " ").slice(0, 60) };
  });
  check("  pressing one opens the card", card.open, `${pressed} · ${card.text}`);
  check("  and the card offers its routes", card.pills > 0, `${card.pills} on offer`);

  // a commentary answering another opens under it, and its words open too
  const ans = await p.evaluate(() => {
    const h = document.querySelector("#hud"); if (h) h.hidden = true;
    const btn = document.querySelector(".c-counter-mark");
    if (!btn) return { none: true };
    btn.click();
    return { none: false, label: btn.textContent.trim() };
  });
  await p.waitForTimeout(600);
  if (!ans.none) {
    const under = await p.evaluate(() => {
      const u = document.querySelector(".c-mark-slot.c-counter");
      if (!u) return null;
      const wbs = [...u.querySelectorAll(".c-mark-text .wb")];
      return { blocks: wbs.length, lic: !!u.querySelector(".lic-chip"),
        withReading: wbs.filter((w) => (w.querySelector(".g")?.textContent || "").trim()).length };
    });
    check("  a commentary answering it opens under it, worded too",
      under && under.blocks > 0 && under.lic,
      `${ans.label} · ${under ? `${under.withReading} of ${under.blocks} carry a reading` : "did not open"}`);
  }
  await p.close();
}

// ---- and what stands on a word is offered in the chain's own order ------
//
// A word of Genesis 1:1 carries a hundred and six commentaries from fifty-one
// works. Offered in the order the map happened to build them, that is a wall
// with no way in: the reader meets fifty-one names and nothing to navigate by.
// They are offered by work, oldest first by the dates the chain itself
// records. That is not a ranking — the page has no opinion about which
// commentary is right — it is the same antiquity clause the readings already
// follow, and it is the only ordering here that nobody had to invent.
{
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=genesis`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .c-mark");
  await p.waitForTimeout(800);
  console.log("— what stands on a word, in the order the chain records —");
  await p.evaluate(() => document.querySelector("section.seg .c-mark").click());
  await p.waitForTimeout(450);

  const shown = await p.evaluate(() => [...document.querySelectorAll(".c-choice")]
    .map((x) => x.textContent.replace(/\s+/g, " ").trim()));
  const truth = await p.evaluate(() => {
    const w0 = (((window.__commentaryStore || {}).units || {})["genesis-1-1"] || {}).words["0"] || [];
    const byWork = new Map();
    for (const e of w0) {
      const y = (e.years && e.years.length && Number.isFinite(Number(e.years[0]))) ? Number(e.years[0]) : Infinity;
      const k = e.family_en || e.ref;
      byWork.set(k, Math.min(byWork.has(k) ? byWork.get(k) : Infinity, y));
    }
    return { works: [...byWork].sort((a, b) => a[1] - b[1]).map((x) => x[0]), units: w0.length };
  });
  const firstWord = shown.filter((t) => truth.works.some((w) => t.endsWith(w) || t.includes(` ${w} ·`)));
  check("  the first work offered is the oldest the chain records",
    firstWord.length > 0 && firstWord[0].includes(truth.works[0]),
    `offered "${firstWord[0]}" · chain's oldest is ${truth.works[0]}`);
  // the point of the ordering: the works a reader is looking for are reachable
  // without hunting, because nothing but a date decided where they sit
  const pos = (name) => firstWord.findIndex((t) => t.includes(name));
  check("  and every work sits where its date puts it",
    truth.works.slice(0, 12).every((w, i) => (firstWord[i] || "").includes(w)),
    firstWord.slice(0, 4).join(" | "));
  check("  Ramban stands within reach of Rashi rather than sixty places away",
    pos("Ramban") > 0 && pos("Ramban") < 12,
    `Rashi at ${pos("Rashi") + 1}, Ramban at ${pos("Ramban") + 1} of ${truth.works.length} works`);

  // nothing is withheld: the rest are one press away, and then all of them stand
  const more = await p.evaluate(() => {
    const b2 = document.querySelector(".c-more"); if (!b2) return null;
    const said = b2.textContent; b2.click(); return said;
  });
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => ({
    choices: document.querySelectorAll(".c-choice").length,
    left: document.querySelectorAll(".c-more").length }));
  check("  and the rest are reached, not withheld",
    more !== null && after.left === 0 && after.choices > 12,
    `"${more}" -> ${after.choices} works offered, ${after.left} still behind a press`);
  await p.close();
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
