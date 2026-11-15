#!/usr/bin/env node
// RUN: tree
// GUARDS: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second
// LEDGER: -
// no frame letter. A check opens the page and reads what it draws; it is not
// the ledger for anything.
//
// A PRESS OF THE DEFAULT SOURCES HOLDS NO PAGE, AND NO LINE IS SEEN BEFORE
// IT IS PAINTED (the completeness critic of 15 November 2026, of the
// default sources shipped that morning: a press repainted every built line
// in one task, so Psalms built whole held the page for 10 to 12 seconds,
// twice, the press and its book file's landing). The page paints the
// sections within a screen of the window at once and the rest in slices,
// and a section scrolled to, landed on or read is painted first (zone.html
// dfltRepaint).
//   L1  on the work with the most sections, built whole, a press of MACULA
//       holds the page in no task longer than two seconds (the browser's
//       long tasks, from the press until the page says its lines stand),
//       and the page says so
//   L2  on each work judged, built whole and its book's file here (asked by a
//       first card, and a card opened again carrying the sources' lines),
//       under MACULA, UBS and BDB pressed in turn and then STEP
//       pressed: scrolled through from its first section to its last a
//       window at a time, every section in the
//       window draws, in the frame the scroll brings, the lines the first
//       paint under the same source draws (?default=, built whole), and so
//       does every section of the work once the page says its lines stand
//   L0  no page error
// The works are found from the default picks on disk, never named here
// (check-scope-derived S1): for L1 and L2, of the four works with the most
// places, the one with the most sections; for L2 also the work with the
// fewest places. WORKS names others (a comma list); SERVE_BASE serves
// another build (the live build, to see these laws red before a fix).
// Usage: node tools/check-press-paints-before-seen-v1.mjs
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { linesInPage } from "./resting-lines-v1.mjs";
import { DEFAULT_PICKS_RULE_ID } from "./bake-default-picks-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const DP = join(K3, "data", "default-picks");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? `  \u00b7  ${d}` : ""}`); };
const noHe = (t) => String(t == null ? "" : t).replace(/[\u0590-\u05ff]/gu, (c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`);
const said = (t, n = 50) => { const s = noHe(t); return `\u00ab${s.length > n ? `${s.slice(0, n)}\u2026` : s}\u00bb`; };
console.log(`\u2014 ${DEFAULT_PICKS_RULE_ID} \u2014`);
if (!existsSync(join(DP, "index.json"))) { console.log("SKIPPED \u2014 no default picks index in this checkout"); process.exit(3); }
const IX = JSON.parse(readFileSync(join(DP, "index.json"), "utf8"));
const works = Object.keys(IX.books || {}).filter((b) => existsSync(join(K3, "data", "zones", `${b}.bin`)) && existsSync(join(DP, IX.books[b].file)));
works.sort((a, b) => IX.books[a].places - IX.books[b].places || (a < b ? -1 : 1));
if (!works.length) { console.log("SKIPPED \u2014 no work on this disk has a book file of default picks"); process.exit(3); }
const sectionsOf = (b) => (JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${b}.bin`))).toString("utf8")).sections || []).length;
const MOST = works.slice(-4).map((b) => [b, sectionsOf(b)]).sort((a, b) => b[1] - a[1])[0][0];
const JUDGED = process.env.WORKS ? process.env.WORKS.split(",").map((x) => x.trim()).filter(Boolean) : [works[0], MOST];
const SOURCES = ["macula", "ubs", "bdb", "step"];

const tree = process.env.SERVE_BASE ? { base: process.env.SERVE_BASE.replace(/\/$/u, ""), close: async () => {} } : await serveTree(K3);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const pageErrors = [];
const LONG = () => { window.__long = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push([e.startTime, e.duration]); }).observe({ type: "longtask", buffered: true }); } catch { /* a browser without long tasks says none */ } };
const said0 = (p, ms) => p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: ms }).then(() => true, () => false);
/** A work opened as a first visit opens it (nothing kept), with a query, built whole once the page says its lines stand. */
const open = async (b, query = "") => {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("pps-check")) { localStorage.clear(); sessionStorage.setItem("pps-check", "1"); } } catch { /* a page with no memory is a first visit */ } });
  await ctx.addInitScript(LONG);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => pageErrors.push(`${b}: ${String((e && e.message) || e).slice(0, 160)}`));
  await p.goto(`${tree.base}/zone.html?b=${b}${query}`, { waitUntil: "domcontentloaded", timeout: 180000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 180000 });
  // under a source other than STEP its lines stand once its book file is here, and the page says so; at rest they
  // stand at once (a build that does not say so at rest is waited for a while and read: its lines need no file)
  const waits = /default=(?!step)/u.test(query);
  if (!(await said0(p, waits ? 120000 : 20000)) && waits) throw new Error(`${b}${query}: the page did not say its lines stand`);
  const n = await p.evaluate(() => window.__materialise());
  if (!(await said0(p, waits ? 180000 : 20000)) && waits) throw new Error(`${b}${query}: built whole, the page did not say its lines stand`);
  await p.waitForTimeout(600);
  return { ctx, p, n };
};
const unitsOf = (got) => got.sections.map((s) => JSON.stringify(s.units));

try {
  // L1: a press on the work with the most sections, built whole
  {
    const { ctx, p, n } = await open(MOST);
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.4));
    await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => {
      const mark = performance.now();
      document.getElementById("default-macula").click();
      await new Promise((res) => { const t = setInterval(() => { const d = window.__default; if ((d && (d.ready || d.failed)) || performance.now() - mark > 150000) { clearInterval(t); res(); } }, 25); });
      const readyMs = performance.now() - mark, d = window.__default;
      await new Promise((res) => setTimeout(res, 300));
      const lt = window.__long.filter(([s]) => s >= mark - 5);
      return { readyMs: Math.round(readyMs), ready: !!(d && d.ready), tasks: lt.length, max: Math.round(lt.reduce((m, x) => Math.max(m, x[1]), 0)), sum: Math.round(lt.reduce((m, x) => m + x[1], 0)) };
    });
    check(`L1  a press of MACULA on ${MOST} built whole (${n} sections) holds the page in no task longer than two seconds, and the page says its lines stand`,
      r.ready && r.max <= 2000, `the longest task ${r.max} ms, ${r.tasks} long task(s) of ${r.sum} ms in all, its lines stand ${r.ready ? `after ${r.readyMs} ms` : "never said in 150 s"}`);
    await ctx.close();
  }
  // L2: each work judged, under each source pressed in turn, scrolled through
  for (const b of JUDGED) {
    const first = {};
    for (const src of SOURCES) {
      const { ctx, p } = await open(b, `&default=${src}`);
      first[src] = unitsOf(await p.evaluate(linesInPage, [0, 1e9]));
      await ctx.close();
    }
    const { ctx, p, n } = await open(b);
    const faults = [], saw = [];
    // the book's file asked by a first card, as a reader's first card asks it, and here before the presses: a press
    // made before it lands draws the line as it rests until it lands (dfltLayerNow), which no window should be read
    // against, however fast the file comes. At rest the card standing open when it lands is not built again (zone.html
    // reopenCardFree, the review of the second fix round, 15 November 2026), so the file is known to be here by the
    // card opened again, which then carries the sources' lines
    const firstCard = () => p.evaluate(() => { const wb = document.querySelector("section.seg .he-text .wb:not(.mark)"); if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); return true; });
    let here = false;
    for (const t0 = Date.now(); !here && Date.now() - t0 < 30000;) {
      if (!(await firstCard())) break;
      here = await p.waitForSelector("#hud .r-dflt", { state: "attached", timeout: 1500 }).then(() => true, () => false);
      await p.keyboard.press("Escape");
    }
    if (!here) faults.push(`${b}: no card showed the sources' lines in 30 s (the book's file)`);
    for (const src of SOURCES) {
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(300);
      await p.evaluate((id) => document.getElementById(id).click(), `default-${src}`);
      let seen = 0, off = 0, steps = 0;
      for (; steps < 20000; steps += 1) {
        // the frame the scroll brought, drawn; then the sections in the window, read as the page drew them
        const w = await p.evaluate(async () => {
          await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
          const secs = [...document.querySelectorAll("section.seg")], vh = window.innerHeight;
          let lo = 0, hi = secs.length - 1;
          while (lo < hi) { const m = (lo + hi) >> 1; if (secs[m].getBoundingClientRect().bottom <= 0) lo = m + 1; else hi = m; }
          let to = lo; while (to < secs.length && secs[to].getBoundingClientRect().top < vh) to += 1;
          return { from: lo, to, end: window.scrollY + vh >= document.documentElement.scrollHeight - 2 };
        });
        const got = unitsOf(await p.evaluate(linesInPage, [w.from, w.to]));
        got.forEach((u, k) => { seen += 1; if (u !== first[src][w.from + k]) { off += 1; if (faults.length < 6) faults.push(`under ${src.toUpperCase()} ${b} section ${w.from + k + 1} seen as ${said(u, 60)}, the first paint ${said(first[src][w.from + k], 60)}`); } });
        if (w.end) break;
        await p.evaluate(() => window.scrollBy(0, window.innerHeight));
      }
      if (!(await said0(p, 180000))) faults.push(`under ${src.toUpperCase()} ${b} the page did not say its lines stand`);
      const all = unitsOf(await p.evaluate(linesInPage, [0, 1e9]));
      const after = all.filter((u, i) => u !== first[src][i]).length;
      if (after) faults.push(`under ${src.toUpperCase()} ${b}, scrolled through, ${after} section(s) not the first paint's`);
      saw.push(`${src.toUpperCase()} ${seen} section(s) seen in ${steps + 1} window(s)${off ? `, ${off} not the first paint's` : ""}`);
    }
    check(`L2  ${b} built whole (${n} sections): under MACULA, UBS, BDB and back on STEP, scrolled through, every section in the window draws the first paint's lines under the same source in the frame the scroll brings, and every section after`,
      !faults.length, faults.length ? faults.slice(0, 3).join(" | ") : saw.join(" \u00b7 "));
    await ctx.close();
  }
  check("L0  no page error", !pageErrors.length, pageErrors.slice(0, 2).join(" | "));
} finally {
  await browser.close();
  await tree.close();
}
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
