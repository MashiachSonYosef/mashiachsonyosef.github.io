// RUN: given
// SAME PRODUCT (the rebuild, 2026-10-23: "a full rebuild, same product,
// lighter weight"). Two builds of the site, the one shipped and the one
// proposed, served at two origins, print the same thing to a reader:
//   S1  on every sampled chapter page, every word's line and its chip are
//       the same, under the default switches, with no blanks on, with no
//       names on, in the English reader, and under each default source other
//       than STEP pressed and then STEP pressed to come back
//       (default-picks-rule-v1; a switch one build lacks is reported, not
//       compared). A word's line is the line drawn over it: its own, or,
//       where it stands in words one card joins, the run's part under it
//       (none where the run draws it bare) or the run's one line over all of
//       them (the lines resting-lines-v1 reads). With --expect
//       data/default-picks/index.json, the lines the new build fills at rest
//       (where STEP leaves a word and its second, the source that fills most
//       of what STEP leaves in the book, reads it) are the differences the
//       batch makes on purpose: every line that differs is one of them, and
//       every one of them on a sampled page reads the second's words under
//       the second's chip; so are the lines where the old build's line is
//       bare and the index carries STEP's own words (step_words): there the
//       new line is STEP's words drawn as the page draws them (a "/" a
//       joint; under the signs switch at rest a piece that is a sign alone,
//       beside pieces that carry words, drawn as the hidden sign's gap), under
//       STEP's chip (M4), under every switch both builds carry; and so are
//       the lines of their neighbors in the run: a word whose part was a
//       sign alone, standing because no part of the run carried words, is
//       drawn as the hidden sign's gap under its own chip once STEP's words
//       stand beside it. The owed lines are read from the index and the
//       page, never named; a line not drawn as owed is said once
//   S2  the cards of the first words of the chapter carry the same pills in
//       the same order with the same one pressed
// The sample: every fifth served book with a chapter page, the first and the
// last among them, chapter 1 and the middle chapter of each; no book is
// named here (check-scope-derived S1). Without two origins the check skips.
// Usage: node tools/check-same-product-v1.mjs --old <origin> --new <origin> [--every 5] [--chapters 2] [--diff <path>] [--expect <data/default-picks/index.json>]
//   --diff writes every differing card in full (old pills, new pills, the
//   pills only one build carries) and, after the cards, every differing line
//   (old and new, with their chips), one per "line:" entry, so a batch that
//   changes pills or lines on purpose can name each difference in its notes
import { writeFileSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DIFF = arg("diff", ""); const diffLines = [];
const OLD = arg("old", ""), NEW = arg("new", ""), EVERY = Number(arg("every", "5")), CHAPTERS = Number(arg("chapters", "2"));
if (!/^https?:/u.test(OLD) || !/^https?:/u.test(NEW)) { console.log("SKIPPED — needs two builds to compare: --old <origin> --new <origin>"); process.exit(3); }
const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const withPages = zonesServed().filter((z) => existsSync(join(SITE, z, "1", "index.html")));
const books = withPages.filter((z, i) => i % EVERY === 0 || i === withPages.length - 1);
const chaptersOf = (z) => readdirSync(join(SITE, z)).filter((d) => /^\d+$/u.test(d)).map(Number).sort((a, c) => a - c);
const pages = [];
for (const z of books) { const chs = chaptersOf(z); if (!chs.length) continue; const pick = [chs[0]]; if (CHAPTERS > 1 && chs.length > 1) pick.push(chs[Math.floor(chs.length / 2)]); for (const ch of pick.slice(0, CHAPTERS)) pages.push({ z, ch }); }
console.log(`${books.length} of ${withPages.length} served books with chapter pages · ${pages.length} pages · old ${OLD} · new ${NEW}`);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
// [name, the pill pressed, the pill that puts it back]: a pill that flips is pressed again; a default source is put
// back by pressing STEP
const STATES = [["default", null, null], ["no blanks", "blanksPill", "blanksPill"], ["no names", "namesPill", "namesPill"], ["English reader", "modeEn", "modeEn"],
  ["MACULA", "default-macula", "default-step"], ["UBS", "default-ubs", "default-step"], ["BDB", "default-bdb", "default-step"]];
// THE FILLS AT REST, read from the index the new build serves (--expect): per book, WORD_N -> the second's line,
// the second worked out as the page works it, every source on: the one that fills the most of what STEP leaves,
// a tie to the earlier pill
const EXPECT = arg("expect", "");
const FILLED = new Map(), STEP_WORDS = new Map();
// the M a source's line is credited to (STEP's reading: its TAHOT translation's)
const M_OF = new Map();
// STEP's words as the page draws a reading: its "/" a joint, a closing stop dropped (spanJoin)
const packed = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");
// a line that draws no words: none, or only the hidden sign's gap
const blank = (t) => !String(t || "").replace(/\u200b/gu, "").trim();
// THE SIGNS AT REST (the page's signsOffLine): a piece that is a sign alone is drawn as the hidden sign's gap beside
// pieces that carry words, and every piece a sign, they stand; a joiner stands only between two pieces that print
const SIGN_GAP = "\u200b";
const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|\u00bf|~|X|\u00d7|\+)$/u.test(String(t).trim());
const isGap = (x) => String(x ?? "").trim() === SIGN_GAP;
const joinDrawn = (pieces) => pieces.map((x, i) => `${i && !isGap(x) && pieces.slice(0, i).some((y) => !isGap(y)) ? " + " : ""}${x}`).join("");
const signsOff = (text) => { const pieces = String(text).split(" + "); return joinDrawn(pieces.every(signOnly) ? pieces : pieces.map((x) => (signOnly(x) ? SIGN_GAP : x))); };
// STEP's words as the line draws them at rest
const drawnStep = (t) => signsOff(packed(t));
if (EXPECT) {
  const ix = JSON.parse(readFileSync(EXPECT, "utf8"));
  const ids = (ix.sources || []).map((x) => x.id);
  for (const s of ix.sources || []) M_OF.set(s.id, typeof s.m === "string" ? s.m : (s.m || {}).r || null);
  for (const [book, e] of Object.entries(ix.books || {})) {
    let y = null;
    for (const z of ids) if (z !== "step" && e.fills.step[z] > 0 && (y === null || e.fills.step[z] > e.fills.step[y])) y = z;
    const at = new Map();
    for (const leaf of y ? e.step_leaves : []) {
      const t = y === "macula" ? leaf[1] : y === "ubs" ? leaf[2] : Array.isArray(leaf[3]) && leaf[3][1] ? (leaf[3][0] !== "" ? `${leaf[3][1]} \u00b7 sense ${leaf[3][0]}` : leaf[3][1]) : 0;
      if (t) at.set(leaf[0], { text: String(t).trim().replace(/\.$/u, ""), m: M_OF.get(y) });
    }
    FILLED.set(book, at);
    STEP_WORDS.set(book, new Map((e.step_words || []).map(([n, w]) => [n, drawnStep(w)])));
  }
}
// a section's first WORD_N, from the zone the page is built from (sections are s<index>, words in order)
const baseN = new Map();
const firstN = (z, secId) => {
  if (!baseN.has(z)) {
    const zone = JSON.parse(gunzipSync(readFileSync(join(SITE, "reader", "data", "zones", `${z}.bin`))).toString("utf8"));
    const at = []; let n = 0;
    for (const sec of zone.sections || []) { at.push(n); n += (sec.words || []).length; }
    baseN.set(z, at);
  }
  return baseN.get(z)[Number(String(secId).slice(1))];
};
const read = async (origin, z, ch) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  const errors = []; p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh */ } });
  const out = { states: {}, cards: null, errors, absent: [] };
  try {
    await p.goto(`${origin}/${z}/${ch}/`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    // the chapter and what follows it, built: a stretch below the arrival
    const y0 = await p.evaluate(() => window.scrollY);
    for (let y = 0; y < 3000; y += 1000) { await p.evaluate((y) => window.scrollTo(0, y), y0 + y); await p.waitForTimeout(120); }
    await p.evaluate((y) => window.scrollTo(0, y), y0); await p.waitForTimeout(600);
    const lines = () => p.evaluate(() => {
      const out = {};
      document.querySelectorAll("section.seg").forEach((sec) => {
        const wbs = [...sec.querySelectorAll(".he-text .wb")]; if (!wbs.length) return;
        // [the word, its line, its chip as it reads, the M the chip names, the run it stands in or ""]: the line drawn
        // over the word, as resting-lines-v1 reads it: its own, or in words one card joins the run's part under it
        // (none: drawn bare) or the run's one line over all of them
        const runs = [...sec.querySelectorAll(".he-text .wjoin")];
        // drawn: nothing between it and the section's text is hidden
        const he = sec.querySelector(".he-text");
        const drawnEl = (el) => { for (let x = el; x && x !== he; x = x.parentElement) if (getComputedStyle(x).display === "none") return false; return true; };
        out[sec.id] = wbs.map((wb) => {
          const said = wb.querySelector(".w")?.textContent || "";
          const run = wb.closest(".wjoin"), runG = run ? run.querySelector(":scope > .g") : null, rg = runG && drawnEl(runG) ? runG : null;
          const key = run ? `r${runs.indexOf(run)}` : "";
          let g = wb.querySelector(":scope > .g");
          if (rg && rg.classList.contains("parts")) g = rg.querySelector(`:scope > .g-part[data-wi="${[...run.querySelectorAll(".wb")].indexOf(wb)}"]`);
          else if (rg) g = rg;
          if (!g) return [said, "", "", "", key];
          const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
          const chip = g.querySelector(".g-lic");
          return [said, c.textContent.trim(), chip ? chip.textContent || "" : "", chip ? chip.dataset.line || "" : "", key];
        });
      });
      return out;
    });
    out.states.default = await lines();
    // the cards of the first three words of the chapter, at the default
    out.cards = [];
    for (let i = 0; i < 3; i += 1) {
      const ok = await p.evaluate((i) => { const wb = document.querySelectorAll("section.seg .he-text .wb:not(.mark)")[i]; if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; }, i);
      if (!ok) break;
      await p.waitForSelector("#hud > .rows .b-read .r-pills button", { timeout: 15000 }).catch(() => {});
      await p.waitForTimeout(700);
      out.cards.push(await p.evaluate(() => [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => `${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${x.textContent.trim()}`)));
      await p.keyboard.press("Escape"); await p.waitForTimeout(200);
    }
    for (const [name, id, back] of STATES.slice(1)) {
      const has = await p.evaluate((id) => { const x = document.getElementById(id); return !!(x && !x.disabled && !x.closest("[hidden]")); }, id);
      if (!has) { out.absent.push(name); continue; }
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(100);
      await p.click(`#${id}`); await p.waitForTimeout(1500);
      // a default source's picks are the book's own file, asked on the press
      await p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
      out.states[name] = await lines();
      await p.click(`#${back}`); await p.waitForTimeout(800);
    }
  } catch (e) { out.failed = String(e.message || e).slice(0, 160); }
  await ctx.close();
  return out;
};
const s1 = [], s2 = [], skipped = [], failed = [], expected = [];
let linesCompared = 0, cardsCompared = 0, filledSeen = 0, neighborsSeen = 0;
for (const { z, ch } of pages) {
  const [a, c] = [await read(OLD, z, ch), await read(NEW, z, ch)];
  if (a.failed || c.failed) { failed.push(`${z} ${ch}: ${a.failed || ""}${c.failed ? ` / new: ${c.failed}` : ""}`); continue; }
  for (const [name] of STATES) {
    const A = a.states[name], C = c.states[name];
    if (!A || !C) { if (name !== "default") skipped.push(`${z} ${ch} ${name}: ${!A ? "old" : "new"} lacks the switch`); continue; }
    const common = Object.keys(A).filter((k) => C[k]);
    if (!common.length) { s1.push(`${z} ${ch} ${name}: no section built on both`); continue; }
    for (const k of common) {
      const n = Math.max(A[k].length, C[k].length);
      const filled = FILLED.get(z), stepWords = STEP_WORDS.get(z);
      const nOf = (i) => firstN(z, k) + i + 1;
      // STEP's words owed where the old line is bare; and in a run that holds such a word, the neighbors whose old
      // part was a sign alone, standing because no part of the run carried words: the hidden sign's gap is owed
      const gains = (i) => !!stepWords && stepWords.has(nOf(i)) && !!A[k][i] && blank(A[k][i][1]);
      const gapOwed = new Set();
      for (let i = 0; i < A[k].length; i += 1) {
        const r = A[k][i][4];
        if (!r || !gains(i)) continue;
        A[k].forEach((x, j) => { if (j !== i && x[4] === r && signOnly(x[1])) gapOwed.add(j); });
      }
      for (let i = 0; i < n; i += 1) {
        linesCompared += 1;
        const x = A[k][i] || ["", "", "", "", ""], y = C[k][i] || ["", "", "", "", ""];
        const at = `${z} ${ch} ${name === "default" ? "" : `${name} `}${k} #${i + 1}`;
        // a fill at rest the batch makes on purpose: the new line is the second's words under its chip, whatever the old one was
        const want = filled ? filled.get(nOf(i)) : undefined;
        if (want !== undefined) {
          if (name === "default") filledSeen += 1;
          const owed = y[1] === want.text && y[3] === want.m && x[0] === y[0];
          if (owed) { if (x[1] !== y[1] && DIFF) diffLines.push(`fill: ${z} ${ch} ${name} ${k} #${i + 1}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); continue; }
          expected.push(`${at}: "${y[1]}" [${y[3]}], the fill owed "${want.text}" [${want.m}]`);
          continue;
        }
        // STEP's own words where the old line is bare: the new line is STEP's words as the page draws them, under STEP's chip
        const words = gains(i) ? stepWords.get(nOf(i)) : undefined;
        if (words !== undefined && x[0] === y[0]) {
          if (name === "default") filledSeen += 1;
          const owed = y[1] === words && y[3] === M_OF.get("step");
          if (owed) { if (DIFF) diffLines.push(`step's words: ${z} ${ch} ${name} ${k} #${i + 1}: bare → "${y[1]}" [${y[2]}]`); continue; }
          expected.push(`${at}: "${y[1]}" [${y[3]}], STEP's words owed "${words}" [${M_OF.get("step")}]`);
          continue;
        }
        // a neighbor in the run: its sign alone drawn as the hidden sign's gap, under its own chip
        if (gapOwed.has(i) && x[0] === y[0]) {
          if (name === "default") neighborsSeen += 1;
          const owed = y[1] === SIGN_GAP && y[2] === x[2] && y[3] === x[3];
          if (owed) { if (DIFF) diffLines.push(`gap beside STEP's words: ${z} ${ch} ${name} ${k} #${i + 1}: "${x[1]}" [${x[2]}] → the hidden sign's gap [${y[2]}]`); continue; }
          expected.push(`${at}: "${y[1]}" [${y[3]}], the hidden sign's gap owed beside STEP's words in its run [${x[3]}]`);
          continue;
        }
        if (x[0] !== y[0] || x[1] !== y[1] || x[2] !== y[2]) { s1.push(`${at} ${x[0]}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); if (s1.length > 400) break; }
      }
    }
  }
  const n = Math.max(a.cards.length, c.cards.length);
  for (let i = 0; i < n; i += 1) { cardsCompared += 1; const x = (a.cards[i] || []).join(" | "), y = (c.cards[i] || []).join(" | "); if (x !== y) { if (DIFF) { const A = a.cards[i] || [], C = c.cards[i] || []; diffLines.push(`== ${z} ${ch} card ${i + 1}\n  old: ${x}\n  new: ${y}\n  only old: ${A.filter((t) => !C.includes(t)).join(" | ")}\n  only new: ${C.filter((t) => !A.includes(t)).join(" | ")}`); } s2.push(`${z} ${ch} card ${i + 1}: ${x.slice(0, 80)} → ${y.slice(0, 80)}`); } }
}
await b.close();
check(`S1 every sampled line and its chip are the same on both builds, under every switch both carry${EXPECT ? ", but the fills at rest the index names, each reading the second's words, STEP's own words where the old line is bare, and the hidden sign's gap beside them in their run" : ""}`, !failed.length && pages.length > 0 && !s1.length && !expected.length,
  `${linesCompared.toLocaleString("en-US")} lines compared on ${pages.length} pages${EXPECT ? ` · ${filledSeen} fill(s) and STEP's words at rest on them, ${neighborsSeen} gap(s) beside them${expected.length ? `, ${expected.length} not as owed: ${expected.slice(0, 3).join("; ")}` : ", each as owed"}` : ""}${s1.length ? ` · ${s1.length} differ: ${s1.slice(0, 4).join("; ")}` : ""}${skipped.length ? ` · not compared: ${[...new Set(skipped.map((x) => x.split(": ")[1]))].join(", ")} (${skipped.length})` : ""}${failed.length ? ` · failed to read: ${failed.slice(0, 3).join("; ")}` : ""}`);
check("S2 the first cards of every sampled chapter carry the same pills, the same one pressed", !failed.length && cardsCompared > 0 && !s2.length, `${cardsCompared} cards compared${s2.length ? ` · ${s2.length} differ: ${s2.slice(0, 3).join("; ")}` : ""}`);
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
// every differing line too (7 November 2026): "line: <book> <chapter> <switch> <section> #<n> <surface>: "<old>" [<chip>] → "<new>" [<chip>]", so an accounting can read every move, not the four the summary names
// (the moves owed at rest, "fill:", "step's words:" and "gap beside STEP's words:", are written as they are met and
// counted apart from the cards)
if (DIFF) {
  writeFileSync(DIFF, diffLines.concat(s1.map((x) => `line: ${x}`)).join("\n") + "\n");
  const cards = diffLines.filter((x) => x.startsWith("== ")).length;
  console.log(`every differing card written in full: ${DIFF} (${cards} cards, ${diffLines.length - cards} lines that moved as owed, ${s1.length} lines that differ)`);
}
process.exit(bad ? 1 : 0);
