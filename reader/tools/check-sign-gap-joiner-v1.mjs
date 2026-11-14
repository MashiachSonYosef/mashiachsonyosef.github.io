#!/usr/bin/env node
// RUN: tree
// GUARDS: sign-gap-joiner-rule-v1-a-joiner-stands-between-two-pieces-that-print-and-never-beside-a-hidden-signs-gap, gap-blob-rule-v1-a-hidden-signs-letters-wear-a-blob-of-their-own-ink-and-tie-to-nothing
// LEDGER: -
// no frame letter. A check reads the resting lines the reader drew, and the page itself, and judges them; it is not the
// ledger for one.
//
// A HIDDEN SIGN'S GAP TAKES NO JOINER OF ITS OWN (the owner, 14 November 2026, taking the page lane's answer to
// the fresh readers' remark of the corpus lane's relay v184 §5). Under the signs switch off, a piece of a reading
// that is a sign and nothing else («<obj.>», «<the>») is not drawn; it keeps its place as a gap (the owner,
// 16 October 2026: nothing left out). Until 14 November the joiner beside it stayed, and 15,483 lines at rest
// printed a "+" with nothing on one side of it («and +» under the vav and the object marker at Genesis 1:1).
// A joiner now stands between two pieces that print and nowhere else.
//
//   G1  every line at rest that holds a gap, in every served work, reads back into its pieces (by its joiners
//       and by the gap) and draws again to the same text: no joiner at either end beside a gap, none on both
//       sides of one, and one between any two pieces that print. A gap is read as a piece of its own wherever it
//       stands, so a joiner left out between two pieces that print fails here too; no reading holds a zero-width
//       space of its own (none of 22,063 lines with a gap did on 14 November 2026), so one inside a stretch
//       between joiners is a joiner missing, or a source's own character taken for a gap, and either is a fault
//   G2  the rule is met where it matters: the recordings hold each shape a gap takes, a maqaf run's cell that is
//       a gap and nothing else, a gap at an end of a line beside a piece that prints, and a gap between two pieces
//       that print
//   G3  the joiners no recording holds, read on the page itself. A maqaf run laid in cells is recorded cell by
//       cell, and the joiners between its cells stand outside every line; a line laid in its pieces is recorded by
//       its text, which does not say which of its separators shows. So the works are opened as a first visit opens
//       them, on the tree this check serves itself, the shortest first among those whose recordings hold all three
//       shapes, until runs and laid lines with a gap have both been judged; once a work's lines are at rest, every
//       separator of every run and every laid line shows "+" exactly where a joiner stands between two pieces that
//       print, and shows nothing beside a gap; every gap keeps its slot; and a joiner the page does not draw moves
//       nothing it draws: each run is fitted to its column again by the page's own redraw with the hidden joiners in
//       place and with them taken out, and comes out the same size both times (on 14 November 2026 a hidden joiner
//       was counted as a second row of its run, and every run that holds a gap was drawn at four fifths of its size)
//   G4  a hidden sign's letters wear a blob of their own, closed around their ink, and it ties to nothing (the owner,
//       14 November 2026, once the joiner beside the gap went: "spacing looks better but blobs will need updated").
//       On the pages G3 opens, once their blobs are all drawn, and on the first of them again under the English
//       reader: every gap the page lays in a word or a run that wears blobs has a blob marked as the gap's, on its
//       own word; that blob stands within its letters' columns and stops short of the English row (it never reaches
//       the middle of the gap's slot); and every other blob reaches over its English whole. Until 14 November the
//       gap's blob ran down to its empty slot, a stalk pressed against the blob beside it, crossing it in the
//       English reader
//
// The recordings are read off the page by the round (data/resting-lines), so G1 holds the page's drawing at every
// line of every work at rest, and G3 the joiners between the pieces of the lines it lays. The words are found in
// the data, never named.
//
// Run: node tools/check-sign-gap-joiner-v1.mjs
import { readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RESTING_DIR, readRecord, linesOnPage } from "./resting-lines-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const RULE = "sign-gap-joiner-rule-v1-a-joiner-stands-between-two-pieces-that-print-and-never-beside-a-hidden-signs-gap";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (list, n = 3) => list.slice(0, n).join(" · ");

console.log(`— ${RULE} —\n`);
const GAP = String.fromCharCode(0x200b);
const JOINER = " + ";
const isGap = (x) => x === GAP;
// a line read back into its pieces: by its joiners, and every gap, wherever it stands, is a piece of its own
const piecesOf = (text) => String(text).split(JOINER).flatMap((chunk) => chunk.split(GAP).flatMap((x, i) => (i ? [GAP, x] : [x]))).filter((x) => x !== "");
// the pieces drawn: a joiner between two pieces that print, none beside a gap
const drawn = (pieces) => pieces.map((x, i) => `${i && !isGap(x) && pieces.slice(0, i).some((y) => !isGap(y)) ? JOINER : ""}${x}`).join("");
const shown = (t) => String(t).split(GAP).join("[gap]");

const dir = join(K3, RESTING_DIR);
if (!existsSync(dir)) { console.log("SKIPPED — no resting lines on this disk (data/resting-lines)"); process.exit(3); }
const g1 = { works: 0, lines: 0, withGap: 0, faults: [] };
const g2 = { cell: 0, atEnd: 0, between: 0 };
const shapes = [];   // per work: its lines at rest, and how many of each shape its recording holds
for (const f of readdirSync(dir).filter((x) => x.endsWith(".json.gz")).sort()) {
  const rec = readRecord(join(dir, f));
  if (!rec || !Array.isArray(rec.sections)) continue;
  g1.works += 1;
  const work = f.slice(0, -".json.gz".length);
  const mine = { work, lines: 0, cell: 0, atEnd: 0, between: 0 };
  for (const [label, lines] of rec.sections) for (const line of lines || []) {
    g1.lines += 1; mine.lines += 1;
    const text = String(line[2] ?? "");
    if (!text.includes(GAP)) continue;
    g1.withGap += 1;
    const pieces = piecesOf(text);
    if (drawn(pieces) !== text && g1.faults.length < 40) g1.faults.push(`${work} ${label}: «${shown(text)}» draws «${shown(drawn(pieces))}»`);
    if (pieces.every(isGap)) { mine.cell += 1; continue; }
    const at = pieces.map((x, i) => (isGap(x) ? i : -1)).filter((i) => i >= 0);
    if (at.some((i) => i === 0 || i === pieces.length - 1)) mine.atEnd += 1;
    if (at.some((i) => pieces.slice(0, i).some((y) => !isGap(y)) && pieces.slice(i + 1).some((y) => !isGap(y)))) mine.between += 1;
  }
  for (const k of ["cell", "atEnd", "between"]) g2[k] += mine[k];
  shapes.push(mine);
}

check("G1  every line at rest that holds a gap draws a joiner only between two pieces that print, never beside the gap", g1.withGap > 0 && g1.faults.length === 0,
  g1.faults.length ? `${nf(g1.faults.length)}${g1.faults.length >= 40 ? " or more" : ""} · ${first(g1.faults)}` : `${g1.works} works · ${nf(g1.lines)} lines at rest · ${nf(g1.withGap)} hold a gap, each drawn so`);
check("G2  the rule is met where it matters: a run's cell that is a gap, a gap at an end of a line, a gap between two pieces that print", g2.cell > 0 && g2.atEnd > 0 && g2.between > 0,
  `${nf(g2.cell)} cells that are a gap · ${nf(g2.atEnd)} lines with a gap at an end beside a piece that prints · ${nf(g2.between)} with a gap between two pieces that print`);

// ---- G3: the joiners between the pieces the page lays, read on the page ----------------------------------------
/** IN THE PAGE. Every separator of every maqaf run laid in cells and of every line laid in its pieces, judged by the
 *  rule against the pieces beside it; and every gap, whether it keeps its slot. Handed to the browser whole. */
const joinersInPage = () => {
  const G = String.fromCharCode(0x200b);
  const showing = (el) => getComputedStyle(el).display !== "none";
  const r = { signs: window.__signs || null, runs: 0, runsWithGap: 0, laid: 0, laidWithGap: 0, separators: 0, gapsWithoutSlot: 0, faults: [] };
  const where = (el) => { const sec = el.closest("section.seg"); return (sec && sec.querySelector(".vnum") || {}).textContent || "?"; };
  const judge = (box, pieceClass, sepClass, joiner) => {
    const kids = [...box.children];
    const pieces = kids.filter((k) => k.classList.contains(pieceClass));
    const gap = pieces.map((k) => k.classList.contains("gap") || (k.textContent || "").trim() === G);
    let at = 0;
    for (const k of kids) {
      if (k.classList.contains(pieceClass)) { if (gap[at] && (!showing(k) || k.getBoundingClientRect().width <= 0)) r.gapsWithoutSlot += 1; at += 1; continue; }
      if (!k.classList.contains(sepClass)) continue;
      r.separators += 1;
      const stands = !gap[at] && gap.slice(0, at).some((g) => !g);
      const shows = showing(k) && (k.textContent || "") !== "";
      const right = stands ? shows && k.textContent === joiner : !shows;
      if (!right && r.faults.length < 6) r.faults.push(`${where(box)}: the separator before piece ${at + 1} ${stands ? "does not show" : "shows beside a gap"} («${pieces.map((x, j) => (gap[j] ? "[gap]" : x.textContent)).join(" | ")}»)`);
    }
    return gap.some(Boolean);
  };
  for (const g of document.querySelectorAll(".he-text .g.parts")) { r.runs += 1; if (judge(g, "g-part", "g-sep", "+")) r.runsWithGap += 1; }
  for (const row of document.querySelectorAll(".he-text .g > .g-pcs")) { r.laid += 1; if (judge(row, "g-pc", "g-pp", " + ")) r.laidWithGap += 1; }
  return r;
};
/** IN THE PAGE. Every blob drawn, judged: a gap's (data-gap) closed on its letters, every other reaching its English. */
const blobsInPage = () => {
  const r = { en: document.body.classList.contains("en"), hosts: 0, gapPieces: 0, gapBlobs: 0, ties: 0, faults: [] };
  const where = (el) => { const sec = el.closest("section.seg"); return (sec && sec.querySelector(".vnum") || {}).textContent || "?"; };
  const nums = (v) => String(v || "").split(",").map(Number);
  for (const svg of document.querySelectorAll(".he-text svg.wj-tie")) {
    const host = svg.parentElement; r.hosts += 1;
    const paths = [...svg.querySelectorAll("path[data-wi]")];
    for (const g of host.querySelectorAll(".g-pc.gap, .g-part.gap")) {
      r.gapPieces += 1;
      const part = g.closest(".g-part"), wi = part ? String(part.dataset.wi) : "0";
      if (!paths.some((x) => x.dataset.gap === "1" && x.dataset.wi === wi) && r.faults.length < 6) r.faults.push(`${where(host)}: a gap whose letters wear no blob of their own`);
    }
    for (const x of paths) {
      const bb = x.getBBox(), [hL, hR] = nums(x.dataset.he), [, , eT, eB] = nums(x.dataset.en);
      const top = bb.y, bottom = bb.y + bb.height, mid = (eT + eB) / 2;
      if (x.dataset.gap === "1") {
        r.gapBlobs += 1;
        const inColumns = bb.x >= hL - 1.5 && bb.x + bb.width <= hR + 1.5;
        const short = r.en ? top > mid : bottom < mid;
        if ((!inColumns || !short) && r.faults.length < 6) r.faults.push(`${where(host)}: a gap's blob ${!inColumns ? "leaves its letters' columns" : "reaches the English row"} (${Math.round(top)}..${Math.round(bottom)}, its slot ${Math.round(eT)}..${Math.round(eB)})`);
      } else {
        r.ties += 1;
        if (!(top <= eT + 1.5 && bottom >= eB - 1.5) && r.faults.length < 6) r.faults.push(`${where(host)}: a blob that does not reach over its English (${Math.round(top)}..${Math.round(bottom)}, its English ${Math.round(eT)}..${Math.round(eB)})`);
      }
    }
  }
  return r;
};
const g4 = { readers: [], hosts: 0, gapPieces: 0, gapBlobs: 0, ties: 0, faults: [] };
const addBlobs = (r, work) => {
  g4.readers.push(`${work} ${r.en ? "English on top" : "Hebrew on top"}: ${nf(r.gapBlobs)} gap blobs`);
  for (const k of ["hosts", "gapPieces", "gapBlobs", "ties"]) g4[k] += r[k];
  for (const x of r.faults) if (g4.faults.length < 12) g4.faults.push(`${work}${r.en ? " (English on top)" : ""} ${x}`);
};
const blobsDrawn = async (p) => {
  await p.evaluate(() => { window.__tieMs = null; window.__drawAllTies(); });
  await p.waitForFunction(() => !!window.__tieMs, null, { timeout: 30000 });
  await p.waitForFunction(() => !window.__tiePending, null, { timeout: 60000 });
  return p.evaluate(blobsInPage);
};
const g3 = { opened: [], runs: 0, runsWithGap: 0, laid: 0, laidWithGap: 0, separators: 0, gapsWithoutSlot: 0, faults: [], notOff: [], refitted: 0, noRedraw: [] };
/** IN THE PAGE. Every run's line, where it stands and the size it is drawn at. */
const runSizes = () => [...document.querySelectorAll(".he-text .wjoin > .g.parts")].map((g) => { const sec = g.closest("section.seg"); return [(sec && sec.querySelector(".vnum") || {}).textContent || "?", getComputedStyle(g).fontSize]; });
const candidates = shapes.filter((x) => x.cell > 0 && x.atEnd > 0 && x.between > 0).sort((a, b) => a.lines - b.lines || (a.work < b.work ? -1 : 1));
const tree = await serveTree(K3);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
try {
  for (const { work } of candidates) {
    if (g3.opened.length >= 6 || (g3.opened.length >= 2 && g3.runsWithGap > 0 && g3.laidWithGap > 0)) break;
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const p = await ctx.newPage();
      await p.goto(`${tree.base}/zone.html?b=${work}`, { waitUntil: "networkidle", timeout: 120000 });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await linesOnPage(p);
      // the lines are at rest; the pieces are read until two readings agree
      let last = "", got = null;
      for (let i = 0; i < 20; i += 1) { got = await p.evaluate(joinersInPage); const now = JSON.stringify(got); if (now === last) break; last = now; await p.waitForTimeout(350); }
      g3.opened.push(work);
      if (got.signs !== "off") g3.notOff.push(`${work}: ${got.signs}`);
      // every run fitted again by the page's own redraw, with the joiners it does not draw and without them
      if (await p.evaluate(() => typeof window.__drawAllTies !== "function")) g3.noRedraw.push(work);
      else {
        const fitted = async () => {
          await p.evaluate(() => { window.__tieMs = null; window.__drawAllTies(); });
          await p.waitForFunction(() => !!window.__tieMs, null, { timeout: 30000 });
          return p.evaluate(runSizes);
        };
        const withThem = await fitted();
        addBlobs(await blobsDrawn(p), work);
        await p.evaluate(() => { for (const x of document.querySelectorAll(".he-text .g-sep.at-gap, .he-text .g-pp.at-gap")) x.remove(); });
        const without = await fitted();
        g3.refitted += withThem.length;
        withThem.forEach(([label, size], i) => {
          const other = without[i] ? without[i][1] : "gone";
          if (size !== other && g3.faults.length < 12) g3.faults.push(`${work} ${label}: a run drawn at ${size} with the joiners the page hides and at ${other} without them`);
        });
      }
      for (const k of ["runs", "runsWithGap", "laid", "laidWithGap", "separators", "gapsWithoutSlot"]) g3[k] += got[k];
      for (const x of got.faults) if (g3.faults.length < 12) g3.faults.push(`${work} ${x}`);
    } finally { await ctx.close(); }
  }
  // the first work again, under the English reader: its English stands over the letters
  if (g3.opened.length && !g3.noRedraw.length) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const p = await ctx.newPage();
      await p.goto(`${tree.base}/zone.html?b=${g3.opened[0]}&mode=en`, { waitUntil: "networkidle", timeout: 120000 });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await linesOnPage(p);
      addBlobs(await blobsDrawn(p), g3.opened[0]);
    } finally { await ctx.close(); }
  }
} finally { await browser.close(); await tree.close(); }
check("G3  on the page, each separator between the pieces of a run or a laid line shows only between two pieces that print, every gap keeps its slot, and a hidden joiner moves nothing drawn",
  g3.opened.length > 0 && !g3.notOff.length && !g3.noRedraw.length && g3.runsWithGap > 0 && g3.laidWithGap > 0 && g3.refitted > 0 && !g3.faults.length && !g3.gapsWithoutSlot,
  !g3.opened.length ? "no work's recording holds all three shapes of a gap, so no page was opened"
    : g3.notOff.length ? `the signs switch was not off: ${first(g3.notOff)}`
    : g3.noRedraw.length ? `the page offers no __drawAllTies to fit its runs again: ${first(g3.noRedraw)}`
    : g3.faults.length ? `${g3.faults.length}${g3.faults.length >= 12 ? " or more" : ""} · ${first(g3.faults, 3).split(GAP).join("[gap]")}`
    : `${g3.opened.join(", ")} · ${nf(g3.runs)} runs, ${nf(g3.runsWithGap)} with a gap · ${nf(g3.laid)} laid lines, ${nf(g3.laidWithGap)} with a gap · ${nf(g3.separators)} separators · ${nf(g3.gapsWithoutSlot)} gaps without their slot · ${nf(g3.refitted)} runs fitted again, each the same size without the hidden joiners`);
check("G4  a hidden sign's letters wear a blob of their own, closed around their ink, tied to no English; every other blob reaches over its English",
  g4.readers.length >= 2 && g4.gapBlobs > 0 && g4.gapPieces > 0 && !g4.faults.length,
  g4.readers.length < 2 ? `blobs were judged under ${g4.readers.length} reader(s), not both: ${first(g4.readers)}`
    : g4.faults.length ? `${g4.faults.length}${g4.faults.length >= 12 ? " or more" : ""} · ${first(g4.faults, 3)}`
    : `${g4.readers.join(" · ")} · ${nf(g4.gapPieces)} gaps laid where blobs are worn, each with its own blob · ${nf(g4.ties)} other blobs, each over its English`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
