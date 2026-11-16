#!/usr/bin/env node
// RUN: page
// GUARDS: licence-columns-rule-v1-the-licence-preference-is-a-baked-order-column-so-the-line-and-the-card-answer-as-one, reading-order-rule-v1-the-first-reading-is-the-sorted-pools-first-and-not-the-stores-first-stored-row, run-reads-its-words-rule-v1-a-run-whose-every-word-has-its-own-reading-at-the-place-reads-word-by-word-the-joined-reading-a-press-away
// LEDGER: -
// no frame letter. A check reads the page and judges it; it is not the
// ledger for one.
//
// THE LINE AND THE CARD ANSWER AS ONE, UNDER EVERY SETTING THE DEVICE
// REMEMBERS. A reader's switches are kept on their own device and are
// there again on the next load, so the page is opened cold under each one
// and asked, at its first words, whether the reading under the word, the
// card's own reading row and the pressed pill are one reading. They were
// not (the owner, 2026-09-27): the licence preference and the letters switch
// sorted the card and never reached the line, so a fresh load pressed one
// reading and printed another under the same word.
//
//   C1  under every remembered setting, on every word opened: the pressed
//       pill is the card's reading row is the line under the word
//   C2  and where the setting is baked as a column or an order the line can
//       read, the card's FIRST pill is that reading — the sort and the line
//       agree, not only the press
//
// A setting whose column is not baked on this book is reported, not failed,
// on C2: the rail says so in words, and C1 still holds there.
//
// A READING THAT TOOK A POINTER (pointer-one-pill-rule-v1, question 12 of
// relay v189, ship 5) prints the pointers resolving to it beside it on its
// one pill, and puts the reading on the line, the line's own pool not
// folded: such a pill is read as the line prints it (lineOfPill), the case
// folded, on C1 and on C2.
//
// THE WORDS OF A RUN ARE OPENED TOO (run-reads-its-words-rule-v1, call 3 of
// relay v189 as the lead landed it, 15 November 2026). A run whose every
// word has its own reading at the place draws each word's own line under it
// (the run's line in parts) and its card opens on the word pressed; a run
// some word of which has none keeps its one line and its card opens on the
// run. Either way the line over the word, the card's reading row and its
// pressed pill are one reading, and the first pill is the line where the
// setting is baked: besides the first words standing alone, the first two
// words of the first run drawn in parts (a place the span store names with
// its words apart first) and of the first run drawn whole are opened, the
// line over each read as the run draws it (its part over the word, or its one
// line); the card's reading row is that line, or, where the card opens on the
// run's division, the run's line over all its words (its parts joined, as the
// row of a set reads the set).
//
// A CARD OF ONE PILL OPENS ON ITS CORE BLOCK (core-block-rule-v1, the owner,
// 14 November 2026). Where the line reads the source's set, the card opens on
// the set's division with the core block pressed: the reading row and the line
// are still the set, and the pressed pill is the line's own piece for that
// block. Its pills are that block's, in its own pool's order, so C2 is not
// asked of it; such cards are counted and said.
//
// THE BAKE KNOWS THE STORE'S SOURCES. The dictionaries beside the store
// (Jastrow, the Samaritan dictionaries) sort on the card like every other
// since 2026-10-03 (overlay-rule-v2; the owner: "just treat them normal"), but
// the line is baked from the store alone, so with their chips on the card can
// put one of their readings first (Amos אשר: Uhlemann's 1837 "quod" before the
// store's "that") while it still opens pressed on the line's reading. C1 is
// judged with their chips on, as a reader meets the page; C2, which asks
// whether the sort and the bake agree, is judged with their chips off, the
// sources the bake was made from. Whether their readings reach the line is a
// bake of its own, and the owner's to call.
//
// THE DICTIONARIES THAT REST SHUT (dictionary-kinds-rule-v1). On a book baked
// at rest the card holds their readings back and the line was baked without
// them, so the default trial asks both laws of the page at rest. A reader who
// opens them keeps that on the device ("open@" the record's version): the
// line stays as it was baked and the card offers their readings again, sorted
// with the rest, so under that setting the press is asked (C1) and the sort
// is not (C2), as under the other card-only settings.
//
// Run: node tools/check-card-opens-on-the-line-v1.mjs [zone url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
import { lineOfPill } from "./card-readings-v1.mjs";
import { readKinds } from "./dictionary-kinds-v1.mjs";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const URL = process.argv[2] || defaultZoneUrl();
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const WORDS = 5;

const trials = [["(default)", null]];
for (const v of ["corpus", "masoretic", "cites", "characters", "vowels-differ", "outside-era", "witnessed_same_place", "witnessed_entry", "witnessed_entry_and_lists", "oldest"]) trials.push(["fh.def.order", v]);
for (const v of ["pd", "by", "by-sa"]) trials.push(["fh.licence", v]);
trials.push(["fh.names", "sound"], ["fh.lookup", "headword"], ["fh.masorah", "only"], ["fh.masorah", "letters"], ["fh.edition", "diff"], ["fh.order.kq", "QERE"]);
// THE DEFAULT SOURCES (default-picks-rule-v1): a source other than STEP kept on
// the device prints its own pick on the line from the first paint, and its
// card opens on that pick, pressed, first among the pills (the source's own
// row made where none of the store's prints it)
for (const v of ["macula", "ubs", "bdb"]) trials.push(["fh.defaults", v]);
// the dictionaries that rest shut, opened and kept so (the record's version names the choice)
const KINDS_OPEN = `open@${readKinds("data").rec.version}`;
trials.push(["fh.kinds", KINDS_OPEN]);
// settings the line is not expected to follow pill for pill: names-as-sound
// sorts the card alone by the lattice's transliteration flag; under "look up
// by the headword" the card opens on the headword's lemma-sorted first
// reading, which the line prints, while its pills stand in the headword
// pool's own order (the open says so on the card); with the dictionaries that
// rest shut opened, the card sorts their readings in while the line stays as
// baked at rest
const CARD_ONLY = new Set(["fh.names=sound", "fh.lookup=headword", `fh.kinds=${KINDS_OPEN}`]);

// every source id beside the store, read off the overlays' own indexes
const OV_DIR = join("data", "overlays");
const OV_IDS = existsSync(OV_DIR) ? readdirSync(OV_DIR).filter((d) => existsSync(join(OV_DIR, d, "index.json")))
  .flatMap((d) => Object.keys(JSON.parse(readFileSync(join(OV_DIR, d, "index.json"), "utf8")).m_sources || {})) : [];

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const c1 = [], c2 = [], unbaked = [];
let opened = 0, coreOpened = 0, inRunOpened = 0;
const passes = [];
for (const [k, v] of trials) { passes.push([k, v, false]); if (OV_IDS.length) passes.push([k, v, true]); }
for (const [k, v, bakeOnly] of passes) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  if (v !== null) await ctx.addInitScript(([kk, vv]) => { try { localStorage.setItem(kk, vv); } catch { /* a device that remembers nothing still reads */ } }, [k, v]);
  if (bakeOnly) await ctx.addInitScript((ids) => { try { localStorage.setItem("fh.sources.off", JSON.stringify(ids)); } catch { /* as above */ } }, OV_IDS);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  const tag = v === null ? k : `${k}=${v}`;
  try {
    await p.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
    // the page says when every line stands as the sources in force draw it (window.__default.ready): at once where
    // the line rests on STEP or no source is in force, and under a kept source once that source's book file is here
    // (failed: it could not be fetched, and every line is the line as it rests). It said «the book file is here», so
    // at rest it waited out 30 s on every load (the review of 15 November 2026); a page that does not say so now is
    // a fault, not a wait run out
    const ready = await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).then(() => true, () => false);
    if (!ready) throw new Error("the page did not say in 30 s that its lines stand as the sources in force draw them (window.__default.ready)");
    await p.waitForTimeout(800);
    const r = await p.evaluate(async (n) => {
      const wait = (ms) => new Promise((x) => setTimeout(x, ms));
      const out = [];
      // the first words standing alone with a line of their own; and the words of a run drawn with a line: the first
      // run whose line stands in parts, its words' own (a place the span store names with its words apart first, then
      // any it names: the runs call 3 takes to their words), and the first whose one line reads it whole, each opened on
      // its first two words
      const alone = [...document.querySelectorAll("section.seg .he-text .wb:has(.g:not(.bare))")].filter((w) => !w.closest(".wjoin")).slice(0, n);
      const runsNow = () => [...document.querySelectorAll("section.seg .he-text .wjoin")].filter((r) => { const rg = r.querySelector(":scope > .g"); return !!rg && !rg.classList.contains("bare"); });
      const inParts = (r) => r.querySelector(":scope > .g").classList.contains("parts");
      const spanKey = (r) => (r.__run && r.__run.spanKey) || "";
      const spaced = (r) => inParts(r) && / /u.test(spanKey(r));
      let runs = runsNow();
      // where the sections built at the top hold no such place, the book's every section is built (the page's own
      // __materialise, as the resting lines are read) and its lines given time to land
      if (!runs.some(spaced) && typeof window.__materialise === "function") { window.__materialise(); await wait(1500); runs = runsNow(); }
      const runsOpened = [runs.find(spaced) || runs.find((r) => inParts(r) && spanKey(r)) || runs.find(inParts), runs.find((r) => !inParts(r))].filter(Boolean);
      const inRuns = runsOpened.flatMap((r) => [...r.querySelectorAll(".wb:not(.mark)")].slice(0, 2));
      const wbs = [...alone, ...inRuns];
      // the line over a word of a run as the page draws it, and the run's line over all its words: the run's part
      // over the word and its parts joined as the card's row reads them, or the run's one line for both
      const lineOver = (wb) => {
        const run = wb.closest(".wjoin"), rg = run ? run.querySelector(":scope > .g") : null;
        if (!rg || rg.classList.contains("bare")) return { line: "", runLine: "" };
        const text = (el) => { const c = el.cloneNode(true); c.querySelectorAll(".g-lic, .g-pcs-lic").forEach((y) => y.remove()); return c.textContent.replace(/\s+/gu, " ").trim(); };
        if (!rg.classList.contains("parts")) { const t = (rg.title || text(rg)).trim(); return { line: t, runLine: t }; }
        const wi = [...run.querySelectorAll(".wb")].indexOf(wb);
        const parts = [...rg.querySelectorAll(":scope > .g-part")];
        const part = parts.find((x) => Number(x.dataset.wi) <= wi && wi < Number(x.dataset.wi) + Number(x.dataset.wn || 1));
        return { line: part ? (part.title || text(part)).trim() : "", runLine: parts.map((x) => (x.title || text(x)).trim()).join(" + ") };
      };
      const h = document.getElementById("hud");
      for (const wb of wbs) {
        const g = wb.querySelector(":scope > .g"), inRun = !!wb.closest(".wjoin");
        wb.querySelector(".w").click();
        const t0 = Date.now(); while (Date.now() - t0 < 12000 && !h.querySelector(".r-pills button, .b-read p:not(.r-label)")) await wait(50);
        await wait(700);
        const pills = [...h.querySelectorAll(".r-pills button")];
        const pressed = pills.find((x) => x.getAttribute("aria-pressed") === "true");
        const block = h.querySelector('.b-cell .s-pills button[aria-pressed="true"]');
        const blocks = [...h.querySelectorAll(".b-cell .s-pills button")];
        const pcs = [...wb.querySelectorAll(":scope > .g > .g-pcs > .g-pc")].map((x) => x.textContent.trim());
        // a word of a run is not a block of its own set: its card's row of blocks is the run's words
        const over = inRun ? lineOver(wb) : null;
        out.push({ inRun, runLine: over ? over.runLine : null, core: !inRun && block && blocks.length > 1 ? { at: blocks.indexOf(block), pieces: pcs } : null, w: (wb.querySelector(".w")?.textContent || "").replace(/[֑-ׇ]/g, ""), line: over ? over.line : (g?.title || "").trim(), now: (h.querySelector(".r-now .v")?.textContent || "").trim(), first: pills[0] ? pills[0].textContent.trim() : null, firstBy: pills[0] ? pills[0].dataset.pointerBy || "" : "", pressed: pressed ? pressed.textContent.trim() : null, pressedBy: pressed ? pressed.dataset.pointerBy || "" : "" });
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await wait(150);
      }
      // the switch's own words on the rail: a column the book does not carry
      // is said there, and C2 reports rather than fails such a setting
      const rail = [...document.querySelectorAll("b[data-toggle]")].map((e) => e.textContent).join(" ");
      return { out, unbaked: /not baked on this book/.test(rail) };
    }, WORDS);
    opened += r.out.length;
    inRunOpened += r.out.filter((x) => x.inRun).length;
    for (const x of r.out) {
      if (x.pressed === null) continue;   // a card that says a reason instead of readings is not this check's
      // a reading that took the pointers resolving to it prints them beside it on its pill and puts the reading on the
      // line (pointer-one-pill-rule-v1, ship 5): such a pill is read as the line prints it (lineOfPill), the case folded
      const folded = !!x.pressedBy;
      const pressedReads = lineOfPill(x.pressed, x.pressedBy), firstReads = x.first === null ? null : lineOfPill(x.first, x.firstBy);
      const pressedIs = (t) => (folded ? pressedReads.toLowerCase() === String(t).toLowerCase() : pressedReads === t);
      if (x.core) {
        // opened on a block of the set's division: the row and the line the set, the pill the line's piece there
        coreOpened += 1;
        const piece = x.core.pieces.length > x.core.at ? x.core.pieces[x.core.at] : (x.line.split(" + ")[x.core.at] || "");
        if (!(x.now === x.line && pressedReads.toLowerCase() === piece.toLowerCase())) c1.push(`${tag}${bakeOnly ? " (beside-store chips off)" : ""} · ${x.w} (on its core block): line "${x.line}" · row "${x.now}" · pressed "${x.pressed}", owed the line's piece "${piece}"`);
        continue;
      }
      // a word of a run: the pressed pill is the line over the word, and the reading row is that line, or, where the
      // card opens on the run's division, the run's line over all its words (its parts joined; its one line, read whole)
      if (x.inRun ? !(pressedIs(x.line) && (x.now === x.line || x.now === x.runLine)) : !(pressedIs(x.now) && x.now === x.line)) c1.push(`${tag}${bakeOnly ? " (beside-store chips off)" : ""} · ${x.w}${x.inRun ? ` (in a run, its line "${x.runLine}")` : ""}: line "${x.line}" · row "${x.now}" · pressed "${x.pressed}"`);
      if ((bakeOnly || !OV_IDS.length) && !CARD_ONLY.has(tag) && !(x.firstBy ? String(firstReads).toLowerCase() === x.line.toLowerCase() : x.first === x.line)) {
        if (r.unbaked) unbaked.push(`${tag} · ${x.w}`);
        else c2.push(`${tag} · ${x.w}: first "${x.first}" · line "${x.line}"`);
      }
    }
  } catch (e) { c1.push(`${tag}: could not open — ${String(e.message).slice(0, 120)}`); }
  await ctx.close();
}
await b.close();
console.log(`— ${trials.length} settings · ${opened} cards opened cold, ${coreOpened} of them on the core block of their set, ${inRunOpened} of a word standing in a run —`);
check("C1  under every remembered setting the pressed pill, the reading row and the line are one reading", c1.length === 0, c1.slice(0, 3).join(" | "));
check("C2  and the card's first pill is the line wherever the setting is baked for this book, among the sources the bake was made from", c2.length === 0, c2.slice(0, 3).join(" | ") || (unbaked.length ? `${unbaked.length} not baked here (reported, not failed): ${unbaked.slice(0, 2).join(", ")}` : "every sort and the line agree"));
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
