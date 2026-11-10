#!/usr/bin/env node
// GUARDS: hebrew-is-red-rule-v1-every-hebrew-letter-the-site-prints-is-the-corpuss-red
// LEDGER: -
// no frame letter. A check reads the pages and judges them; it is not the
// ledger for one.
//
// THE RULE. The owner, 2026-11-09, on a card whose head wrote the word twice,
// once in bare letters and once pointed in our own ink: "inside the card it
// should just match outside: our red design with gold masoretic vowel marks.
// we shouldn't write the hebrew twice just write the pointed version not the
// stripped version. hebrew should never ever appear as anything but red
// anywhere". So:
//
//   - every Hebrew letter a reader page prints is the corpus's red
//     (--shani): the words on the line, the head of a card, a pill of
//     letters, the verse's numeral, and a run of Hebrew inside someone
//     else's sentence (a dictionary's reading, a note, a label), which the
//     page names to the browser's highlight (zone.html, HEBREW IS RED);
//   - the Masoretic marks stay the gold they are (the owner, 2026-10-10),
//     over red letters;
//   - the head of a card is the word as the page writes it, once, in every
//     position of the pointing switch.
//
// The laws, each read in a browser off the served pages:
//
//   H1  on a chapter of a Bible book with a card open, in each position of
//       the pointing switch, no Hebrew letter is painted in another ink: a
//       text holding Hebrew is red itself, or is the gold marks' layer over
//       red letters, or has each of its runs named to the highlight
//   H2  the head of the card is the line's word, once, in the word's own
//       red, in each position
//   H3  a run of Hebrew inside a line's English is named to the highlight,
//       and the browser paints it red: the run's own pixels are read, and
//       they hold the red and none of the reading's blue
//   H4  the verse's numeral is red
//   H5  on the census, every title that holds Hebrew letters is red
//
// Usage: node tools/check-hebrew-is-red-v1.mjs [--root <repository root>]
import { readFileSync, existsSync, statSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ROOT = arg("root", join(HERE, "..", ".."));
// THE WORKS ARE FOUND IN THE DATA, never named here (check-scope-derived S1):
// the chapter pages are asked of the first served work with a built first
// chapter whose verses the navigation labels give Hebrew numerals for
// (data/y-nav-labels-v1.json), so H4 has numerals to judge, or of the first
// with a built first chapter where no served work has them (H4 then says so
// and holds the numerals it finds, which may be none); and the served works
// whose keyed lines quote Hebrew in their English stand for H3, the one that
// quotes most first (its own first page is asked; the next is asked only
// where that page shows no such line).
const ZONES = join(HERE, "..", "data", "zones");
const HE_IN = /[\u05D0-\u05EA]/u;
const served = zonesServed(ZONES);
const quotesOf = (bk) => { try { const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, `${bk}.bin`))).toString("utf8")); return Object.values(z.gloss || {}).filter((v) => typeof v === "string" && HE_IN.test(v)).length; } catch { return 0; } };
const NAV = (() => { try { return JSON.parse(readFileSync(join(HERE, "..", "data", "y-nav-labels-v1.json"), "utf8")).works || {}; } catch { return {}; } })();
const numbered = (bk) => !!(NAV[bk] && NAV[bk].sections && Object.keys(NAV[bk].sections).length);
const built = served.filter((bk) => existsSync(join(ROOT, bk, "1", "index.html")));
const BOOK = arg("book", "") || built.find(numbered) || built[0] || "";
const QUOTING = arg("quoting", "") ? [arg("quoting", "")]
  : served.map((bk) => [bk, existsSync(join(ROOT, bk, "index.html")) ? quotesOf(bk) : 0]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([bk]) => bk);
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
if (!BOOK) { console.log(`SKIPPED — no served work has a built first chapter under ${ROOT}`); process.exit(3); }

const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" };
const srv = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  try {
    let file = join(ROOT, p);
    if (!extname(p) || (existsSync(file) && statSync(file).isDirectory())) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${srv.address().port}`;
const { chromium } = await loadPlaywright();
const browser = await chromium.launch(launchOptions());

// every visible text that holds a Hebrew letter, and whether it is the red: read in the page
const audit = () => {
  const HE = /[\u05D0-\u05EA\uFB1D-\uFB4F]/u, RUN = /[\u05D0-\u05EA\uFB1D-\uFB4F][\u0591-\u05C7\u05D0-\u05F4\uFB1D-\uFB4F\u034F\u200D]*/gu;
  const probe = (v) => { const x = document.createElement("span"); x.style.color = v; document.documentElement.append(x); const c = getComputedStyle(x).color; x.remove(); return c; };
  const RED = probe("var(--shani)"), MARK = probe("var(--mark-ink)");
  const where = (el) => { const parts = []; for (let e = el, i = 0; e && e !== document.body && i < 3; e = e.parentElement, i += 1) parts.unshift(e.tagName.toLowerCase() + (e.id && !/^s\d+$/u.test(e.id) ? `#${e.id}` : "") + (typeof e.className === "string" && e.className.trim() ? `.${e.className.trim().split(/\s+/u).slice(0, 2).join(".")}` : "")); return parts.join(" > "); };
  const out = { texts: 0, red: 0, marks: 0, highlighted: 0, faults: [], api: !!window.__hebrewRed };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t = w.nextNode(); t; t = w.nextNode()) {
    if (!HE.test(t.data)) continue;
    const el = t.parentElement; if (!el || ["SCRIPT", "STYLE", "TITLE", "NOSCRIPT", "TEXTAREA", "OPTION"].includes(el.tagName)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    out.texts += 1;
    const fill = cs.webkitTextFillColor || cs.color;
    if (fill === RED) { out.red += 1; continue; }
    // the gold marks' layer: the element is filled with the mark's gold and its letters are laid over it, by ::before, in its own color
    if ((el.classList.contains("mg") || el.classList.contains("mg-all")) && fill === MARK) {
      if (el.classList.contains("mg-all") || getComputedStyle(el, "::before").webkitTextFillColor === RED || getComputedStyle(el, "::before").color === RED) { out.marks += 1; continue; }
      out.faults.push(`${where(el)} «${t.data.trim().slice(0, 24)}»: the letters under the gold marks are ${getComputedStyle(el, "::before").color}`); continue;
    }
    // a run inside someone else's sentence: each run named to the highlight
    const runs = [...t.data.matchAll(RUN)];
    if (window.__hebrewRed && runs.length && runs.every((m) => window.__hebrewRed.covers(t, m.index, m.index + m[0].length))) { out.highlighted += 1; continue; }
    out.faults.push(`${where(el)} «${t.data.trim().slice(0, 24)}» is ${fill}`);
  }
  return out;
};
// the word opened is found on the page, never named here: the second word of
// the first verse the page lays (its first, where the verse is one word)
const openWord = async (p) => {
  await p.evaluate(() => {
    const sec = [...document.querySelectorAll("section.seg")].find((s) => s.querySelector(".he-text .wb:not(.mark)"));
    const wbs = [...sec.querySelectorAll(".he-text .wb:not(.mark)")];
    const wb = wbs[1] || wbs[0];
    wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  });
  await p.waitForSelector("#hud:not([hidden]) .head b", { timeout: 60000 });
  await p.waitForTimeout(1200);
};

try {
  // H1, H2, H4: a chapter with a card open, in each position of the pointing switch
  const h1 = [], h2 = [], h4 = [];
  for (const pos of ["only", "keep", "letters"]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript((m) => { try { localStorage.setItem("fh.masorah", m); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); } catch { /* the default stands */ } }, pos);
    const p = await ctx.newPage();
    await p.goto(`${base}/${BOOK}/1/`, { waitUntil: "networkidle", timeout: 180000 });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
    await openWord(p);
    const a = await p.evaluate(audit);
    const head = await p.evaluate(() => {
      const b = document.querySelector("#hud .head b"), wb = document.querySelector("section.seg .he-text .wb.active");
      const w = wb ? wb.querySelector(".w") : null;
      return b && w ? { head: b.textContent.trim(), word: w.textContent.trim(), headInk: getComputedStyle(b).color, wordInk: getComputedStyle(w).color, kids: b.children.length, masorah: window.__masorah } : null;
    });
    const nums = await p.evaluate(() => { const x = document.createElement("span"); x.style.color = "var(--shani)"; document.documentElement.append(x); const red = getComputedStyle(x).color; x.remove(); const all = [...document.querySelectorAll(".seg-row .v-he")]; return { n: all.length, off: all.filter((e) => getComputedStyle(e).color !== red).length }; });
    h1.push({ pos, ...a }); h2.push({ pos, ...(head || {}) }); h4.push({ pos, ...nums });
    await ctx.close();
  }
  check("H1  on a chapter with a card open, no Hebrew letter is painted in another ink, in each position of the pointing switch",
    h1.every((x) => x.api && x.texts > 0 && !x.faults.length),
    `/${BOOK}/1/ · ` + h1.map((x) => `${x.pos}: ${x.texts} texts (${x.red} red, ${x.marks} under gold marks, ${x.highlighted} named runs)${x.faults.length ? ` · ${x.faults.length} off: ${x.faults.slice(0, 3).join(" · ")}` : ""}`).join(" | "));
  check("H2  the head of the card is the line's word, once, in the word's own red, in each position",
    h2.every((x) => x.head && x.head === x.word && x.headInk === x.wordInk && x.masorah === x.pos),
    h2.map((x) => `${x.pos}: "${x.head}"${x.head === x.word ? "" : ` (the line's "${x.word}")`} ${x.headInk}`).join(" | "));
  check("H4  the verse's numeral is red", h4.every((x) => (numbered(BOOK) ? x.n > 0 : true) && x.off === 0),
    (numbered(BOOK) ? "" : `the navigation labels give /${BOOK}/ no Hebrew numerals, and none is drawn · `) + h4.map((x) => `${x.pos}: ${x.n} numerals, ${x.off} off`).join(" | "));

  // H3: a run of Hebrew inside a line's English, named and painted
  {
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    const found = QUOTING.length > 0;
    let r = null, asked = "";
    for (const work of QUOTING) {
      asked = work;
      await p.goto(`${base}/${work}/`, { waitUntil: "networkidle", timeout: 180000 });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
      await p.waitForTimeout(1200);
      r = await p.evaluate(() => {
        const HE = /[\u05D0-\u05EA]/u;
        const gs = [...document.querySelectorAll(".he-text .g")].filter((g) => [...g.childNodes].some((n) => n.nodeType === 3 && HE.test(n.data)));
        if (!gs.length) return { glosses: 0 };
        const g = gs[0]; g.scrollIntoView({ block: "center" });
        const tn = [...g.childNodes].find((n) => n.nodeType === 3 && HE.test(n.data));
        const m = /[\u05D0-\u05EA]+/u.exec(tn.data);
        const rg = document.createRange(); rg.setStart(tn, m.index); rg.setEnd(tn, m.index + m[0].length);
        const b = rg.getBoundingClientRect();
        const probe = (v) => { const x = document.createElement("span"); x.style.color = v; document.documentElement.append(x); const c = getComputedStyle(x).color; x.remove(); return c.match(/\d+/gu).slice(0, 3).map(Number); };
        return { glosses: gs.length, text: g.textContent.slice(0, 40), covered: !!window.__hebrewRed && window.__hebrewRed.covers(tn, m.index, m.index + m[0].length),
          allCovered: gs.every((x) => { const t = [...x.childNodes].find((n) => n.nodeType === 3 && HE.test(n.data)); const mm = /[\u05D0-\u05EA]+/u.exec(t.data); return window.__hebrewRed && window.__hebrewRed.covers(t, mm.index, mm.index + mm[0].length); }),
          box: { x: b.x, y: b.y, width: b.width, height: b.height }, red: probe("var(--shani)"), blue: probe("var(--tekhelet)") };
      });
      if (r && r.box && r.box.width > 2) {
        // the run's own pixels: the ink nearest the red, and none nearer the reading's blue than the red
        await p.waitForTimeout(300);
        const png = await p.screenshot({ clip: { x: r.box.x, y: r.box.y, width: r.box.width, height: r.box.height } });
        const px = await p.evaluate(async ({ data, red, blue }) => {
          const im = new Image(); im.src = `data:image/png;base64,${data}`; await im.decode();
          const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
          const g = c.getContext("2d"); g.drawImage(im, 0, 0);
          const d = g.getImageData(0, 0, c.width, c.height).data;
          const dist = (i, q) => Math.hypot(d[i] - q[0], d[i + 1] - q[1], d[i + 2] - q[2]);
          let reds = 0, blues = 0;
          for (let i = 0; i < d.length; i += 4) { const a = dist(i, red), b2 = dist(i, blue); if (a < 40 && a < b2) reds += 1; else if (b2 < 40 && b2 < a) blues += 1; }
          return { reds, blues, pixels: d.length / 4 };
        }, { data: png.toString("base64"), red: r.red, blue: r.blue });
        r.px = px;
      }
      if (r && r.glosses > 0) break;
    }
    await ctx.close();
    check("H3  a run of Hebrew inside a line's English is named to the highlight and painted red",
      !!r && r.glosses > 0 && r.covered && r.allCovered && r.px && r.px.reds > 20 && r.px.blues === 0,
      !found ? "no served work's keyed lines quote Hebrew in their English" : !r ? "no reading" : r.glosses === 0 ? `no line of the first page of ${QUOTING.join(", ")} quotes Hebrew in its English` : `/${asked}/ · ${r.glosses} lines quote Hebrew in their English, each named · «${r.text}»: ${r.px ? `${r.px.reds} red pixels, ${r.px.blues} blue, in the run's box` : "the run has no box"}`);
  }

  // H5: the census
  {
    const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const have = existsSync(join(ROOT, "census", "index.html"));
    let r = null;
    if (have) {
      await p.goto(`${base}/census/`, { waitUntil: "networkidle", timeout: 180000 });
      r = await p.evaluate(() => {
        const HE = /[\u05D0-\u05EA]/u;
        const x = document.createElement("span"); x.style.color = "var(--shani)"; document.documentElement.append(x); const red = getComputedStyle(x).color; x.remove();
        const all = [...document.querySelectorAll(".atlas-row .aw")].filter((e) => HE.test(e.textContent));
        const off = all.filter((e) => getComputedStyle(e).color !== red);
        return { n: all.length, off: off.length, sample: off.slice(0, 2).map((e) => e.textContent.trim().slice(0, 30)) };
      });
    }
    await p.close();
    check("H5  on the census, every title that holds Hebrew letters is red", !!r && r.off === 0,
      !have ? "no census page" : `${r.n} Hebrew titles, ${r.off} off${r.off ? `: ${r.sample.join(" · ")}` : ""}`);
  }
} finally {
  await browser.close();
  srv.close();
}
console.log(bad ? `FAIL — ${bad} law(s) of hebrew-is-red-rule-v1 do not hold` : "PASS — every Hebrew letter the pages print is the corpus's red");
process.exit(bad ? 1 : 0);
