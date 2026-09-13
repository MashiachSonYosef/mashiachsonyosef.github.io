#!/usr/bin/env node
// The top of a book is the book, not its index.
//
// Fifty chapter cells and five dozen commentator names stood between a reader
// and the first word of Genesis — on a phone, the whole screen went to two
// things nobody had asked for yet. Both are now handles: they say what they
// are and how much is behind them, and they name their contents on the press.
//
// The same rule the line handles already keep. A shut handle carries a count,
// never a list; the list is what the press is for.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesServed, zonesServedWithCommentary } from "./zones-on-disk-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const SKIP_LABEL = "check-contents-shut-v1";
// A check about commentary needs a work that carries some. When none is
// served, that is a fact about the corpus and not a defect in the reader, so
// this says so and stops rather than failing every assertion against a page
// with nothing on it.
const WITH_COMMENTARY = zonesServedWithCommentary();
if (!WITH_COMMENTARY.length) {
  console.log(`SKIPPED — no served work carries a commentary sidecar, so ${SKIP_LABEL} has nothing to open`);
  process.exit(3);
}

const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const BASE = (defaultZoneUrl()).split("?")[0];

// WHICH BOOKS, AND WHY THESE. This walked every zone on disk. That was
// written for a two-book shelf and went on standing while the shelf grew to
// thousands — a browser page each, which is a check that times out rather
// than reports, and it opened withheld books besides. It never showed,
// because the file skipped for want of a commentary sidecar from the day the
// shelf grew until the day one was built.
//
// What this check is about is the reader's own behaviour — one codebase — so
// it walks the SHAPES the handle has to hold rather than every instance:
// the longest book and the shortest, because a grid of fifty cells and a grid
// of one are the two ends of "a count, never a list"; a book that carries a
// commentary, because the second handle only exists there; and the first
// served book in sort order, so the panel is not all extremes. Derived from
// the shelf, never typed, deduped.
const SECTIONS = new Map();
for (const z of zonesServed()) {
  try { SECTIONS.set(z, (JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8")).sections || []).length); }
  catch { /* a zone that will not read is another check's finding */ }
}
const bySections = [...SECTIONS.entries()].sort((a, c) => c[1] - a[1]).map(([z]) => z);
const BOOKS = [...new Set([bySections[0], bySections[bySections.length - 1], WITH_COMMENTARY[0], zonesServed()[0]].filter(Boolean))];
console.log(`panel: ${BOOKS.map((z) => `${z} (${SECTIONS.get(z)} sections)`).join(" · ")}`);

const b = await chromium.launch(launchOptions());
for (const book of BOOKS) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=${book}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(400);
  console.log(`— ${book} —`);

  const shut = await p.evaluate(() => {
    const head = document.getElementById("tocHead"), body = document.getElementById("tocBody");
    const t = head.querySelector(".toc-t").getBoundingClientRect();
    const n = head.querySelector(".toc-n").getBoundingClientRect();
    const ci = document.getElementById("cIndex");
    const first = document.querySelector("section.seg .he-text .wb");
    return {
      label: head.querySelector(".toc-t").textContent.trim(),
      count: head.querySelector(".toc-n").textContent.trim(),
      gap: Math.round(n.left - t.right),
      gridShown: !body.hidden,
      tocH: Math.round(document.getElementById("toc").getBoundingClientRect().height),
      // the point of all this: the book itself is reachable without scrolling
      firstWordTop: Math.round(first.getBoundingClientRect().top),
      ciHead: ci ? ci.querySelector(".ci-head").textContent.replace(/\s+/g, " ").trim() : null,
      ciOpen: ci ? !ci.querySelector(".ci-body").hidden : null,
      // the count is the third thing that stood between a reader and the book
      stampShown: !document.getElementById("stamp").hidden,
      stampHead: (document.querySelector("#stampHead .toc-t")?.textContent || "").trim(),
      stampSays: (document.querySelector("#stampHead .toc-n")?.textContent || "").replace(/\s+/g, " ").trim(),
      stampOpen: !document.getElementById("stampBody").hidden,
      stampH: Math.round(document.getElementById("stamp").getBoundingClientRect().height),
    };
  });
  check("  the contents arrives shut", !shut.gridShown && /^Contents$/i.test(shut.label), shut.label);
  check("  and says how much is behind it", /^\d[\d,]*\s+\w+/.test(shut.count), shut.count);
  check("  with air between the two", shut.gap >= 5, `${shut.gap}px`);
  check("  it costs a line, not a screen", shut.tocH < 90, `${shut.tocH}px tall`);
  check("  the first word of the book is on screen without scrolling",
    shut.firstWordTop > 0 && shut.firstWordTop < 915, `${shut.firstWordTop}px down`);
  if (shut.ciHead !== null) {
    check("  the book's commentary is a handle too", !shut.ciOpen &&
      /^C[\d,]+ Commentary$/.test(shut.ciHead), shut.ciHead);
  }
  // AND SO IS THE COUNT. It was the third thing standing between a reader and
  // the book, and the largest: five figures, a witness row apiece and a
  // paragraph, 285px of a 915px phone. The owner put the count on the book's
  // own page and it stays there; what it may not do is be the page. Shut, it
  // keeps the same law as the two handles beside it — a count, never a list —
  // and the news a reader wants at a glance is whether this text agrees with
  // the men who counted it.
  if (shut.stampShown) {
    check("  the count is a handle too, and says its verdict shut",
      !shut.stampOpen && /^The count$/i.test(shut.stampHead)
      && /\bwitness(es)?\b/.test(shut.stampSays)
      && /(all agree|differs?|none published)/.test(shut.stampSays)
      && shut.stampH < 90,
      `${shut.stampHead} — ${shut.stampSays} · ${shut.stampH}px tall`);
    const st = await p.evaluate(async () => {
      document.getElementById("stampHead").click();
      await new Promise((r) => setTimeout(r, 240));
      const body = document.getElementById("stampBody");
      return { open: !body.hidden, cells: body.querySelectorAll(".desk .cell").length,
        rows: body.querySelectorAll("table tr").length };
    });
    check("  pressing it gives the whole comparison, witness by witness",
      st.open && st.cells > 0 && st.rows > 0, `${st.cells} figures, ${st.rows} witness rows`);
    await p.evaluate(() => document.getElementById("stampHead").click());
  }

  const opened = await p.evaluate(async () => {
    document.getElementById("tocHead").click();
    await new Promise((r) => setTimeout(r, 220));
    const body = document.getElementById("tocBody");
    const cells = [...body.querySelectorAll(".chs a")];
    cells[Math.min(2, cells.length - 1)].click();
    await new Promise((r) => setTimeout(r, 260));
    const sp = document.getElementById("secPanel");
    return { shown: !body.hidden, cells: cells.length, drilled: !sp.hidden,
      links: sp.querySelectorAll("a").length };
  });
  // A COUNT IS NOT A LENGTH. This read `cells > 5`, which asks the book to be
  // long rather than asking the handle to work: a book of one chapter opens a
  // grid of one cell, correctly, and failed. What the press has to prove is
  // that the list arrived, and that it is the list the shut handle counted.
  const claim = /^([\d,]+)\s+(\w+)/.exec(shut.count || "");
  const claimed = claim ? Number(claim[1].replace(/,/gu, "")) : null;
  const countsChapters = !!claim && /^chapter/i.test(claim[2]);
  check("  pressing it opens the grid",
    opened.shown && opened.cells >= 1 && (!countsChapters || opened.cells === claimed),
    `${opened.cells} cells for a handle that said "${shut.count}"`);
  check("  and a chapter still drills to its sections",
    opened.drilled && opened.links > 1, `${opened.links} in the panel`);

  const reshut = await p.evaluate(async () => {
    document.getElementById("tocHead").click();
    await new Promise((r) => setTimeout(r, 220));
    return { body: document.getElementById("tocBody").hidden,
      panel: document.getElementById("secPanel").hidden,
      lit: document.querySelectorAll("#toc .chs a.on").length };
  });
  check("  shutting it takes the drilled panel with it",
    reshut.body && reshut.panel && reshut.lit === 0);

  if (shut.ciHead !== null) {
    const ci = await p.evaluate(async () => {
      const box = document.getElementById("cIndex");
      box.querySelector(".ci-head").click();
      await new Promise((r) => setTimeout(r, 280));
      const works = box.querySelector(".ci-body .ci-sum");
      return { open: !box.querySelector(".ci-body").hidden,
        works: (works?.textContent || "").replace(/\s+/g, " ").trim(),
        hits: box.querySelectorAll(".ci-hit").length,
        licences: box.querySelectorAll(".ci-hit .lic-chip").length };
    });
    // It says how many works, not which — the roll-call of every name and
    // count was longer than the thing it introduced.
    check("  opening it says how many works it holds",
      ci.open && /\bworks?\b/.test(ci.works) && /\d/.test(ci.works), ci.works.slice(0, 64));
    check("  and offers them with their licences",
      ci.hits > 0 && ci.licences === ci.hits, `${ci.hits} shown, ${ci.licences} licensed`);
  }
  await p.close();
}
// ---- and a shut control is a control ----------------------------------
//
// Shut, the contents was a faint grey phrase two words wide. It was there, it
// was correct, and a reader who knew it was there took twenty seconds to find
// it — which is the same as not being there. A thing that can be pressed has
// to look like the other things on this page that can be pressed, and it has
// to say what is behind it before the press is made.
{
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}?b=${BOOKS[0]}`, { waitUntil: "networkidle" });
  await p.waitForSelector("#tocHead");
  await p.waitForTimeout(600);
  console.log("— shut, the contents is still a control —");
  const t = await p.evaluate(() => {
    const el = document.getElementById("tocHead");
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const faint = getComputedStyle(document.documentElement).getPropertyValue("--faint").trim();
    const asRgb = (hex) => {
      const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
      return m ? `rgb(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)})` : hex;
    };
    return { h: Math.round(r.height), w: Math.round(r.width), colour: cs.color,
      faint: asRgb(faint), edge: cs.borderLeftWidth, bg: cs.backgroundColor,
      says: el.textContent.replace(/\s+/g, " ").trim(),
      count: (el.querySelector(".toc-n")?.textContent || "").trim() };
  });
  check("  it is a box, not a phrase", t.h >= 32 && parseFloat(t.edge) >= 2,
    `${t.w}×${t.h}px · ${t.edge} edge · ${t.bg}`);
  check("  it does not wear the colour of the things that are only labels",
    t.colour !== t.faint, `${t.colour} against faint ${t.faint}`);
  check("  and it says how much is behind it before it is pressed",
    /\d/.test(t.count), t.says);
  await p.close();
}

// ---- the way back exists wherever you are -----------------------------
//
// Fifteen hundred sections deep, the way out of a book should not be a phrase
// inside a sentence that a reader has to read to find. It is the same pill as
// everything else that can be pressed, it is in the same place in every book,
// and it goes to the site's own root and nowhere else.
{
  // The same panel as above: the way home is one codebase's behaviour, not a
// fact about a book, so the shapes cover it. This read every zone on disk,
// which at fleet scale is thousands of browser pages.
for (const book of BOOKS) {
    const p = await b.newPage({ viewport: { width: 412, height: 915 } });
    p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
    await p.goto(`${BASE}?b=${book}`, { waitUntil: "networkidle" });
    await p.waitForSelector("header.top nav");
    await p.waitForTimeout(400);
    const h = await p.evaluate(() => {
      const a = document.querySelector("header.top nav a.home");
      if (!a) return null;
      const cs = getComputedStyle(a), r = a.getBoundingClientRect();
      return { to: a.getAttribute("href"), text: a.textContent.trim(),
        h: Math.round(r.height), pad: cs.paddingLeft, radius: cs.borderRadius,
        onScreen: r.top >= 0 && r.height > 0 };
    });
    check(`  ${book}: the way back is on the page`, !!h && h.onScreen, h ? h.text : "no home control");
    check(`  ${book}: and it goes to the root`, !!h && h.to === "/", h ? h.to : "-");
    check(`  ${book}: and it is shaped like something you press`,
      !!h && h.h >= 26 && parseFloat(h.pad) >= 8, h ? `${h.h}px tall, ${h.pad} padding, ${h.radius}` : "-");
    await p.close();
  }
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
