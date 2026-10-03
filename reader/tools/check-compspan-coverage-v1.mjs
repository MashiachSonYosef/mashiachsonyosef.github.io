#!/usr/bin/env node
// check-compspan-coverage-v1 · every word its source divides opens a card that offers the division
//
// GUARDS: compspan-coverage-rule-v1-a-word-its-source-divides-opens-with-its-divisions
// LEDGER: -
// no frame letter. This reads a served zone and the page drawn from it, and
// writes nothing.
//
// The owner, 2026-10-03, on Genesis 1:2: "we seem to be messing up basic
// prefix and suffix still. wheres the compspan?", and then "i shouldnt still
// be finding compspan errors". The span ledger's served rows carried two-piece
// divisions only: every word its source divides into three or four pieces,
// and about a hundred suffixed forms, opened a card with no divisions at all,
// and no check asked. Every other check compares the page with the record;
// this one asks whether the division the source makes reaches the reader.
//
//   C1  from the record, over the whole book: every word whose pieces (pg)
//       come from one source and spell its form has a division the card can
//       offer, a ledger row or the source's pieces at its place. A word whose
//       pieces spell no side of it (a read side of two words) is excused by
//       name, never silently
//   C2  on the page: a sample of real cards, the first words of each piece
//       count with no ledger row and the first with one, each opens offering
//       every complete division of the form (2^(n-1) of them, the whole first),
//       and its finest division's blocks are the source's pieces in order
//   C3  the source's glosses carry only as a set (the owner's rule of 20
//       September, relayed by the corpus lane 2026-10-03: "the piece gloss
//       travels with the position"): under "the source here" the whole word
//       opens pressed on the set, and a piece pressed alone is the
//       dictionaries' own, with no "here the source reads" line on it
//
// Run: node tools/check-compspan-coverage-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

const pw = await loadPlaywright();
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const URL = defaultZoneUrl();
const PER = 4;   // cards opened per piece count and kind
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForFunction(() => window.__zone && document.querySelector("section.seg"), null, { timeout: 30000 });
console.log(`— ${URL} —`);

// C1, from the record
const rec = await p.evaluate(() => {
  const z = window.__zone;
  const out = { pieced: 0, byRow: 0, byPlace: 0, excused: [], uncovered: [], byCount: {} };
  z.sections.forEach((sec, si) => (sec.words || []).forEach((w, wi) => {
    if (!Array.isArray(w.pg) || w.pg.length < 2) return;
    out.pieced += 1;
    out.byCount[w.pg.length] = (out.byCount[w.pg.length] || 0) + 1;
    const sides = w.w ? w.w.map((r) => r.k).filter(Boolean) : [w.k];
    if (sides.some((k) => z.spans && z.spans[k])) { out.byRow += 1; return; }
    const spelled = w.pg.map((x) => x && x.k).join("");
    const oneSource = w.pg.every((x) => x && x.k && x.s === w.pg[0].s);
    if (!sides.includes(spelled)) { out.excused.push(`${sec.label} ${w.s}: pieces spell ${spelled}, the word is ${sides.join(" or ")}`); return; }
    if (oneSource) { out.byPlace += 1; return; }
    out.uncovered.push(`${sec.label} ${w.s}`);
  }));
  return out;
});
check("C1  every word its source divides has a division the card can offer",
  rec.pieced > 0 && rec.uncovered.length === 0,
  `${rec.pieced} divided words (${Object.entries(rec.byCount).map(([n, c]) => `${c} of ${n} pieces`).join(", ")}): ${rec.byRow} by the ledger's row, ${rec.byPlace} by the source's pieces at the place` +
  (rec.uncovered.length ? ` · UNCOVERED ${rec.uncovered.length}: ${rec.uncovered.slice(0, 4).join("; ")}` : "") +
  (rec.excused.length ? ` · excused ${rec.excused.length}: ${rec.excused.slice(0, 3).join("; ")}` : ""));

// C2 and C3, on real cards: candidates from rendered sections whose blocks
// line up one to one with the record's words
const picks = await p.evaluate(async (per) => {
  const z = window.__zone;
  const want = new Map();   // "n|row" -> count
  // one card per form: a division pressed on a card is the reader's ruling
  // for that form at every place it stands, so a second card of the same form
  // opens on the ruling, rightly, and would say nothing about the record
  const seenForm = new Set();
  const out = [];
  const secs = [...document.querySelectorAll("section.seg")];
  for (let si = 0; si < secs.length && out.length < per * 6; si += 1) {
    secs[si].scrollIntoView();
    await new Promise((r) => setTimeout(r, 60));
    const wbs = [...secs[si].querySelectorAll(".he-text .wb")];
    const words = (z.sections[si] || {}).words || [];
    if (wbs.length !== words.length) continue;
    words.forEach((w, wi) => {
      if (!Array.isArray(w.pg) || w.pg.length < 2 || w.w || wbs[wi].closest(".wjoin") || wbs[wi].classList.contains("wrun")) return;
      if (w.pg.map((x) => x.k).join("") !== w.k || !w.pg.every((x) => x.g && x.s === w.pg[0].s)) return;
      const row = !!(z.spans && z.spans[w.k]);
      if (row && z.spans[w.k][0].join("|") !== w.pg.map((x) => x.k).join("|")) return;   // a ledger division unlike the place's: not this claim
      const key = `${w.pg.length}|${row}`;
      if ((want.get(key) || 0) >= per || seenForm.has(w.k)) return;
      seenForm.add(w.k);
      want.set(key, (want.get(key) || 0) + 1);
      out.push({ si, wi, n: w.pg.length, row, label: z.sections[si].label, s: w.s, pieces: w.pg.map((x) => x.k), glosses: w.pg.map((x) => String(x.g).trim()) });
    });
  }
  return out;
}, PER);

const noDiv = [], wrongFinest = [], notLed = [];
for (const c of picks) {
  await p.evaluate(([si, wi]) => { const s = document.querySelectorAll("section.seg")[si]; s.scrollIntoView(); s.querySelectorAll(".he-text .wb")[wi].querySelector(".w").click(); }, [c.si, c.wi]);
  try { await p.waitForSelector("#hud .r-pills button, #hud .b-cut .s-pills button", { timeout: 20000 }); } catch { noDiv.push(`${c.label} ${c.s}: the card did not open`); continue; }
  await p.waitForTimeout(400);
  const cuts = await p.evaluate(() => [...document.querySelectorAll("#hud .b-cut .s-pills button")].map((x) => x.textContent));
  const expect = 2 ** (c.n - 1);
  if (cuts.length !== expect) { noDiv.push(`${c.label} ${c.s}: ${cuts.length} divisions, ${expect} owed`); }
  else {
    const finest = c.pieces.join(" + ");
    if (cuts[0] !== c.pieces.join("") || cuts[cuts.length - 1] !== finest) wrongFinest.push(`${c.label} ${c.s}: ${cuts[0]} … ${cuts[cuts.length - 1]}, owed ${c.pieces.join("")} … ${finest}`);
    else {
      // C3: the whole word, as the card opens, pressed on the source's set
      const set = c.glosses.join(" + ");
      const whole = await p.evaluate(() => { const x = document.querySelector('#hud .r-pills button[aria-pressed="true"]'); return x ? x.textContent.trim() : null; });
      if (whole !== set) notLed.push(`${c.label} ${c.s}: opens pressed on ${whole}, owed the set ${set}`);
      // and each piece pressed alone carries no line of the source's
      await p.evaluate((t) => { const x = [...document.querySelectorAll("#hud .b-cut .s-pills button")].find((e) => e.textContent === t); if (x) x.click(); }, finest);
      await p.waitForTimeout(500);
      for (let i = 0; i < c.n; i += 1) {
        await p.evaluate((i2) => { const x = document.querySelectorAll("#hud .b-cell .s-pills button")[i2]; if (x) x.click(); }, i);
        try { await p.waitForFunction((k) => (document.querySelector("#hud .b-read .r-label") || {}).textContent?.includes(k), c.pieces[i], { timeout: 15000 }); } catch { /* read below */ }
        await p.waitForTimeout(150);
        const line = await p.evaluate(() => (document.querySelector("#hud .r-piece") || {}).textContent || null);
        if (line) notLed.push(`${c.label} ${c.s} piece ${c.pieces[i]} alone: "${line.trim()}"`);
      }
    }
  }
  await p.keyboard.press("Escape");
  await p.waitForTimeout(150);
}
const kinds = [...new Set(picks.map((c) => `${c.n} pieces${c.row ? " (ledger row)" : " (no row)"}`))];
check("C2  each card opens offering every complete division, its finest the source's pieces",
  picks.length > 0 && noDiv.length === 0 && wrongFinest.length === 0,
  `${picks.length} cards: ${kinds.join(", ")}` + (noDiv.length ? ` · ${noDiv.slice(0, 3).join("; ")}` : "") + (wrongFinest.length ? ` · ${wrongFinest.slice(0, 3).join("; ")}` : ""));
check("C3  the source's glosses carry only as a set: the whole word opens on the set, a piece alone is the dictionaries'",
  picks.length > 0 && notLed.length === 0,
  notLed.length ? notLed.slice(0, 3).join("; ") : "every whole word opened on its set; no piece alone carried the source's line");

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
