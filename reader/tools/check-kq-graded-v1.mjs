#!/usr/bin/env node
// RUN: page
// GUARDS: kq-grade-rule-v1-the-read-half-is-graded-by-its-own-vowels-the-written-half-by-letters-only
//
// THE READ HALF IS GRADED; THE WRITTEN HALF IS MATCHED BY ITS LETTERS (the
// owner, 7 November 2026, adopting the corpus lane's v151 until the owner's
// own review). At a place written one way and read another, the vowels in the
// text are the reading's: the scribes kept the letters they received and read
// the qere aloud. So the pointing grade and the stem follow the read half, and
// the written half, which has no vowels of its own, is matched by letters only.
//
//   Q1  every book's sidecar says what the projection did with the stems of
//       such places (binyan.kq, under this rule): a place with a stem gave it
//       to its read half, or is counted as a read half of several words, or as
//       having no read half, and the three add up to the places with a stem
//   Q2  no written half carries a stem: the written letters key no stems in
//       any sidecar (a stem of the written letters is a reconstruction)
//   Q3  on the page, a card opened on a read half grades against the read
//       form inside the source's brackets, the form the sidecar grades under,
//       and its head says the read half is graded by its vowels; a card opened
//       on the written half grades against nothing and says its readings are
//       matched by letters only
//
// The places are found in the data, never named: for Q3, in served book
// order, the first place in each of three books whose one-word read half the
// sidecar grades with at least one row graded. SKIPS by name when there is
// none.
//
// Run: node tools/check-kq-graded-v1.mjs [zone url]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";

const RULE = "kq-grade-rule-v1-the-read-half-is-graded-by-its-own-vowels-the-written-half-by-letters-only";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const readGz = (f) => JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));
const bareRead = (s) => String(s || "").replace(/^\[+|\]+$/gu, "");
const bareWritten = (s) => String(s || "").replace(/^\(+|\)+$/gu, "");

const books = zonesServed("data/zones").filter((b) => existsSync(`data/zones/${b}.lattice.bin`));
if (!books.length) { console.log("SKIPPED — no served book with a sidecar, so check-kq-graded-v1 has nothing to hold"); process.exit(3); }

// ---- Q1, Q2: the sidecars ----------------------------------------------------
let withBinyan = 0, unsaid = 0, unbalanced = 0, given = 0, several = 0, none = 0, withStem = 0, writtenStems = 0;
const unsaidEx = [], unbalancedEx = [], writtenEx = [];
const samples = [];
for (const book of books) {
  const zone = readGz(`data/zones/${book}.bin`);
  const side = readGz(`data/zones/${book}.lattice.bin`);
  const grades = side.grades || {};
  if (side.binyan) {
    withBinyan += 1;
    const kq = side.binyan.kq;
    if (!kq || kq.rule !== RULE) { unsaid += 1; if (unsaidEx.length < 3) unsaidEx.push(book); }
    else {
      withStem += kq.places_with_a_stem; given += kq.given_to_the_read_half; several += kq.read_half_of_several_words; none += kq.no_read_half;
      if (kq.places_with_a_stem !== kq.given_to_the_read_half + kq.read_half_of_several_words + kq.no_read_half) { unbalanced += 1; if (unbalancedEx.length < 3) unbalancedEx.push(book); }
    }
  }
  for (const sec of zone.sections || []) {
    let n = 0;
    for (const w of sec.words || []) {
      if (w.mark) continue;
      n += 1;
      if (!w.kq || !Array.isArray(w.w)) continue;
      for (const r of w.w) {
        if (!r || r.role !== "KETIV") continue;
        const g = grades[bareWritten(r.s)] || grades[r.s];
        if (g && Array.isArray(g.st) && g.st.length) { writtenStems += 1; if (writtenEx.length < 3) writtenEx.push(`${book} ${sec.label}:${n} ${r.s}`); }
      }
      const reads = w.w.filter((r) => r && r.role === "QERE" && r.s);
      if (reads.length !== 1 || samples.some((x) => x.book === book) || samples.length >= 3) continue;
      const g = grades[bareRead(reads[0].s)];
      if (g && /[^-]/u.test(g.g || "")) samples.push({ book, label: sec.label, n, read: bareRead(reads[0].s), written: (w.w.find((r) => r && r.role === "KETIV") || {}).s || "" });
    }
  }
}
check("Q1  every sidecar says what became of the stems where the text is written one way and read another, and its counts add up",
  withBinyan > 0 && unsaid === 0 && unbalanced === 0,
  `${withBinyan} sidecars with stems · ${withStem} such places with a stem: ${given} given to the read half, ${several} read as several words, ${none} with no read half${unsaid ? ` · ${unsaid} say nothing (${unsaidEx.join(", ")})` : ""}${unbalanced ? ` · ${unbalanced} do not add up (${unbalancedEx.join(", ")})` : ""}`);
check("Q2  no written half carries a stem", writtenStems === 0, writtenStems ? `${writtenStems}: ${writtenEx.join(" | ")}` : "none in any sidecar");

// ---- Q3: the page -------------------------------------------------------------
if (!samples.length) { console.log("  --  Q3 skipped: no served place has a one-word read half the sidecar grades"); console.log(bad ? `\n${bad} FAILED` : "\nall checks passed"); process.exit(bad ? 1 : 0); }
const pw = await loadPlaywright();
const BASE = defaultZoneUrl().replace(/[?&]b=[^&#]+/, "").replace(/\?$/, "");
const browser = await pw.chromium.launch(launchOptions());
const said = [];
let q3bad = 0;
for (const s of samples) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript(() => { try { localStorage.clear(); } catch { /* a fresh reader */ } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${BASE}${BASE.includes("?") ? "&" : "?"}b=${s.book}&at=${encodeURIComponent(s.label)}`, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await p.waitForTimeout(900);
  const r = await p.evaluate(async ({ label, n }) => {
    const sec = [...document.querySelectorAll("section.seg")].find((x) => (x.querySelector(".vnum") || {}).textContent?.trim() === label);
    const wb = sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")][n - 1] : null;
    if (!wb) return { error: "word not on the page" };
    const halves = [...wb.querySelectorAll(".wr")];
    // the read half from the line; the written half from the open card's own
    // head, where the half the card is not on stands one press away
    const open = async (re, fromHead) => {
      const h = fromHead ? [...document.querySelectorAll("#hud .head [role='button']")].find((x) => fromHead.test(x.title || ""))
        : halves.find((x) => re.test(x.title || ""));
      if (!h) return { error: `no half titled ${fromHead || re}` };
      window.__cardGradedBy = undefined;
      h.click();
      const t0 = Date.now();
      while (Date.now() - t0 < 15000 && !(document.querySelector("#hud .kq-role[data-graded]") && window.__cardGradedBy !== undefined)) await new Promise((x) => setTimeout(x, 50));
      await new Promise((x) => setTimeout(x, 400));
      const role = document.querySelector("#hud .kq-role[data-graded]");
      return { by: window.__cardGradedBy, graded: role ? role.dataset.graded : null, say: role ? role.textContent : "" };
    };
    // a press on the other half closes this card and opens that one
    const read = await open(/^qere/u);
    const written = await open(/^ketiv/u, /^open the ketiv/u);
    return { read, written };
  }, s);
  await ctx.close();
  const ok = !r.error && r.read && !r.read.error && r.read.by === s.read && r.read.graded === "vowels"
    && r.written && !r.written.error && r.written.graded === "letters" && !/[\u05B0-\u05BB]/u.test(r.written.by || "");
  if (!ok) q3bad += 1;
  said.push(r.error ? `${s.book} ${s.label}:${s.n}: ${r.error}`
    : `${s.book} ${s.label}:${s.n}: the read half grades against ${r.read.by === s.read ? "its form inside the brackets" : `"${r.read.by}" (want "${s.read}")`} and says ${r.read.graded || "nothing"}; the written half ${/[\u05B0-\u05BB]/u.test(r.written.by || "") ? "grades against vowels" : "grades against no vowels"} and says ${r.written.graded || "nothing"}`);
}
await browser.close();
check("Q3  a card on the read half grades by the read form's own vowels and says so; a card on the written half says it matches by letters", q3bad === 0, said.join(" ‖ "));

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
