#!/usr/bin/env node
// RUN: tree
// GUARDS: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second
// LEDGER: -
// no frame letter. A check opens the page and reads what it draws; it is not
// the ledger for anything.
//
// THE CONCORDANCE COUNTS THE LINE'S OWN READING WHERE IT STANDS (the
// completeness critic of 15 November 2026, of the default sources shipped
// that morning). With the concordance on, a word's card opens to a table of
// one row, the reading the card stands on, with the places a source reads
// exactly those words. The table counted only the readings the dictionary
// store files under the word's letters, and a row the page makes for a
// default source (STEP's own words where today's line is bare, MACULA's,
// UBS's and BDB's own words under their pills) is filed nowhere: the line's
// own reading said «0 locations» at every place of STEP's own words at rest
// and at about half the lines under MACULA or UBS (Ruth 1:1:1, 1:1:5, 1:19:8),
// and no tool read that count. The owner, of such a zero (zone.html, A
// BLOCK'S OWN LETTERS): "why would sleep be 0 other places".
//   K1  at rest, at every place of a work where STEP's own words are the line
//       (the line credited to STEP, where today's line is bare), the card's
//       table stands on the line's reading and counts it here: the row is
//       this place's («pick here»), at least one location, and its places
//       begin «here · »
//   K2  under MACULA, K3 under UBS, K4 under BDB: the same at every word of
//       a work's first verses whose card's table stands on the line's own
//       reading, the whole word (a card standing on a block of the word's
//       division reads that block's own letters, and is not judged), at least
//       one such line a row the page made for the source (credited to it on
//       the line)
// The work is found from the default picks on disk and the page, never named
// here (check-scope-derived S1): of the works holding a place the index gives
// STEP's own words for, by their number of places, the first where the page
// draws STEP's own words at one of them (the index names the places they may
// fill; the page draws them where today's line is bare). The page is the
// checkout's own, served here; SERVE_BASE names another (the live build, to
// see these laws red before a fix). Nothing printed holds Hebrew: a text is
// printed with any Hebrew as U+ codes.
// Usage: node tools/check-concordance-counts-the-line-v1.mjs
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { DEFAULT_PICKS_RULE_ID } from "./bake-default-picks-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const DP = join(K3, "data", "default-picks");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? `  \u00b7  ${d}` : ""}`); };
const noHe = (t) => String(t == null ? "" : t).replace(/[\u0590-\u05ff]/gu, (c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`);
const said = (t, n = 60) => { const s = noHe(t); return `\u00ab${s.length > n ? `${s.slice(0, n)}\u2026` : s}\u00bb`; };
console.log(`\u2014 ${DEFAULT_PICKS_RULE_ID} \u2014`);
if (!existsSync(join(DP, "index.json"))) { console.log("SKIPPED \u2014 no default picks index in this checkout"); process.exit(3); }
const IX = JSON.parse(readFileSync(join(DP, "index.json"), "utf8"));
const works = Object.keys(IX.books || {}).filter((b) => existsSync(join(K3, "data", "zones", `${b}.bin`)) && existsSync(join(DP, IX.books[b].file))
  && Array.isArray(IX.books[b].step_words) && IX.books[b].step_words.length);
works.sort((a, b) => IX.books[a].places - IX.books[b].places || (a < b ? -1 : 1));
if (!works.length) { console.log("SKIPPED \u2014 no work on this disk has a place of STEP's own words"); process.exit(3); }
const FIRST_WORDS = 24;

const tree = process.env.SERVE_BASE ? { base: process.env.SERVE_BASE.replace(/\/$/u, ""), close: async () => {} } : await serveTree(K3);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const pageErrors = [];
const ready = (p) => p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 120000 }).catch(() => {});
const open = async (w) => {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("ccl-check")) { localStorage.clear(); sessionStorage.setItem("ccl-check", "1"); } } catch { /* a page with no memory is a first visit */ } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => pageErrors.push(`${w}: ${String((e && e.message) || e).slice(0, 160)}`));
  await p.goto(`${tree.base}/zone.html?b=${w}&dict=on`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 120000 });
  await ready(p);
  await p.waitForTimeout(800);
  return { ctx, p };
};
const press = async (p, id) => { await p.evaluate((x) => document.getElementById(x).click(), id); await p.waitForTimeout(600); await ready(p); await p.waitForTimeout(800); };
/** IN THE PAGE: the words to judge: the addresses (marks not counted) of the places given by number, or else of the
 *  first words of the work that stand alone (no run, no pair) with a line; each with its line and whose it is. */
const pick = (p, ns, first) => p.evaluate(({ ns, first }) => {
  const out = [];
  const secs = [...document.querySelectorAll("section.seg")];
  const z = window.__zone;
  let n = 0;
  z.sections.forEach((sec, si) => {
    let k = 0;
    for (const w of sec.words) {
      n += 1;
      if (w.mark) continue;
      k += 1;
      if (ns ? !ns.includes(n) : out.length >= first) continue;
      if (secs[si].__body && window.__materialise) window.__materialise(si, si + 1);
      const wb = [...secs[si].querySelectorAll(".he-text .wb:not(.mark)")][k - 1];
      if (!wb || wb.closest(".wjoin") || wb.classList.contains("kq")) continue;
      const g = wb.querySelector(":scope > .g");
      if (!g || g.classList.contains("bare")) continue;
      const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
      out.push({ at: `${sec.label}:${k}`, line: c.textContent.trim(), src: g.dataset.src || "" });
    }
  });
  return out;
}, { ns, first });
/** Open the word's card (the concordance on) and read its table's row, once it holds still. */
const rowAt = async (p, at) => {
  const ok = await p.evaluate((at) => {
    const m = /^(.*):(\d+)$/u.exec(at);
    const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === m[1]);
    const wb = sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")][Number(m[2]) - 1] : null;
    if (!wb) return false;
    wb.scrollIntoView({ block: "center" });
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    return true;
  }, at);
  if (!ok) return null;
  let last = "", same = 0, now = null;
  for (let k = 0; k < 60; k += 1) {
    await p.waitForTimeout(200);
    now = await p.evaluate(() => {
      const h = document.getElementById("hud");
      const tr = h && !h.hidden ? h.querySelector(".dict-tab tbody tr.pick") : null;
      if (!tr) return null;
      const b = tr.querySelector(".r-pills button");
      const blocks = [...h.querySelectorAll(":scope > .rows .b-cell .s-pills button")];
      const sub = tr.nextElementSibling;
      const first = sub && !sub.hidden ? sub.querySelector(".item") : null;
      return { reading: b ? b.textContent.trim() : null, here: tr.classList.contains("here"), count: (tr.cells[2] ? tr.cells[2].textContent : "").trim(),
        block: blocks.length > 1 && blocks.some((x) => x.getAttribute("aria-pressed") === "true"), first: first ? first.textContent.trim().slice(0, 40) : "" };
    });
    const key = JSON.stringify(now);
    if (now && key === last) { same += 1; if (same >= 3) break; } else same = 0;
    last = key;
  }
  await p.keyboard.press("Escape"); await p.waitForTimeout(250);
  return now;
};
const counted = (r) => !!r && r.here && /^([1-9]\d*) locations?/u.test(r.count) && /^here \u00b7 /u.test(r.first);
/** Judge the words: where the row stands on the line's own reading, whole, it is counted here. */
const judge = async (p, words) => {
  const out = { judged: 0, made: 0, blocks: 0, faults: [] };
  for (const w of words) {
    const r = await rowAt(p, w.at);
    if (!r) { out.faults.push(`${w.at}: no table`); continue; }
    if (r.block) { out.blocks += 1; continue; }
    if (r.reading !== w.line) continue;
    out.judged += 1;
    if (w.src) out.made += 1;
    if (!counted(r)) out.faults.push(`${w.at} ${said(w.line, 40)}${w.src ? ` [${w.src}'s own words]` : ""}: ${said(r.count, 40)}${r.here ? "" : ", not this place's row"}${r.first ? `, its places begin ${said(r.first, 30)}` : ""}`);
  }
  return out;
};

try {
  // K1: at rest, at every place of STEP's own words drawn, in the first work that draws one
  let W = null;
  {
    let words = [], tried = 0;
    for (const w of works) {
      tried += 1;
      const s = await open(w);
      words = (await pick(s.p, IX.books[w].step_words.map((r) => r[0]), 0)).filter((x) => x.src === "step");
      if (words.length) {
        W = w;
        const j = await judge(s.p, words);
        check(`K1  at rest, STEP's own words on the line are counted here in the concordance (${w}, ${words.length} of its ${IX.books[w].step_words.length} place(s) the index gives them for)`,
          j.judged === words.length && !j.faults.length, `${j.judged} judged${j.faults.length ? ` \u00b7 ${j.faults.slice(0, 3).join(" | ")}` : ""}`);
      }
      await s.ctx.close();
      if (W || tried >= 8) break;
    }
    if (!W) check("K1  at rest, STEP's own words on the line are counted here in the concordance", false, `none of the first ${tried} works draws STEP's own words at a place the index gives them for`);
  }
  // K2-K4: under each source, the first words of the same work
  const work = W || works[0];
  for (const [law, id, name] of [["K2", "default-macula", "MACULA"], ["K3", "default-ubs", "UBS"], ["K4", "default-bdb", "BDB"]]) {
    const { ctx, p } = await open(work);
    await press(p, id);
    const words = await pick(p, null, FIRST_WORDS);
    const j = await judge(p, words);
    check(`${law}  under ${name}, every line whose card's table stands on its own reading is counted here (${work}, the first ${words.length} words that stand alone)`,
      j.judged > 0 && j.made > 0 && !j.faults.length,
      `${j.judged} judged, ${j.made} of them a source's own words on the line, ${j.blocks} on a block of the division${j.faults.length ? ` \u00b7 ${j.faults.length} not counted here: ${j.faults.slice(0, 3).join(" | ")}` : ""}`);
    await ctx.close();
  }
  check("K0  no page error", !pageErrors.length, pageErrors.slice(0, 2).join(" | "));
} finally {
  await browser.close();
  await tree.close();
}
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
