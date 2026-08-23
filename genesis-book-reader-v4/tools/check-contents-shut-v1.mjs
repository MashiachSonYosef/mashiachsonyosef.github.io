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
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
const SKIP_LABEL = "check-contents-shut-v1";
// A check about commentary needs a work that carries some. When none is
// served, that is a fact about the corpus and not a defect in the reader, so
// this says so and stops rather than failing every assertion against a page
// with nothing on it.
{
  const { zonesWithCommentary } = await import("./zones-on-disk-v1.mjs");
  if (!zonesWithCommentary().length) {
    console.log(`${SKIP_LABEL}: no served work carries a commentary sidecar — nothing to check`);
    process.exit(0);
  }
}

const { chromium } = pw;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const BASE = (defaultZoneUrl()).split("?")[0];

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const book of ["genesis", "1kings"]) {
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
  check("  pressing it opens the grid", opened.shown && opened.cells > 5, `${opened.cells} cells`);
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
  await p.goto(`${BASE}?b=${zonesOnDisk()[0]}`, { waitUntil: "networkidle" });
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
  for (const book of ["genesis", "1kings"]) {
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
