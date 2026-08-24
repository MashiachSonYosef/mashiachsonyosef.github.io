#!/usr/bin/env node
// check-attachment-grain-v1
//
// V's attachment grain policy, made enforceable:
//
//   section by default; word pairing requires explicit exact
//   normalized-surface evidence
//                    — ledgers/work/v/v-lane-current-pointer, boundary block
//
// V links a commentary segment to a base verse and stamps every row
// NOT_WORD_ALIGNED. Its Genesis 1:1 slice does it 624 times without exception,
// and the presentation fixture it feeds declares "word_alignment": false. So a
// word-level mark under a commentary is never something V handed over. It is
// something this repository decided.
//
// It is allowed to decide it — but only on the evidence V names. The
// attachment map already stamps each of its hints with a basis saying whether
// that evidence exists. This file checks that the sidecar honoured the stamp.
//
//   node tools/check-attachment-grain-v1.mjs <commentary.bin> [--url <served url>]
//
//   A1  an entry carrying a word span carries a basis that proves a word
//   A2  the census adds up: word + section + no-text equals what is recorded
//   A3  a word span reads as a run of the section's own words
//   A4  the page draws no word-level mark for an entry without word evidence
//   A5  an entry carries the presentation V chose for it
//   A6  an entry V scoped to a range is not carried as an attachment
//   A7  a Targum carries a presentation that allows it to run as parallel text
//
// Not covered: whether the evidence itself is honest. A basis of
// EXPLICIT_VISIBLE_HEADWORD asserts that a record shows the commentary's
// opening word; this file takes that assertion at face value. Proving it is
// the corpus lane's, and V's own row is where it would be proven.

import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

// The only basis this reader treats as proving a word. A basis absent from
// this set is not refused as wrong — it is refused as unproven, and its
// commentary is drawn at the section, which is where V puts it by default.
const WORD_GRADE_BASIS = new Set(["EXPLICIT_VISIBLE_HEADWORD"]);

const args = process.argv.slice(2);
let binPath = args.find((a) => !a.startsWith("--"));
const url = args.includes("--url") ? args[args.indexOf("--url") + 1] : null;
if (!binPath) {
  // No sidecar named: take the sidecars on disk, and with none, say which
  // fact made this skip — the same guard its sibling commentary checks hold.
  const { zonesWithCommentary } = await import("./zones-on-disk-v1.mjs");
  const carried = zonesWithCommentary();
  if (!carried.length) {
    console.log("SKIPPED — no served work carries a commentary sidecar, so check-attachment-grain-v1 has nothing to check");
    process.exit(3);
  }
  binPath = `data/zones/${carried[0]}-commentary.bin`;
}

const fails = [];
const notes = [];
const refuse = (law, what, detail) => fails.push({ law, what, detail });

const side = JSON.parse(gunzipSync(readFileSync(binPath)).toString("utf8"));
const units = side.units || {};

let onWord = 0, onSection = 0, byBasis = new Map();

for (const [unitId, unit] of Object.entries(units)) {
  for (const [pos, list] of Object.entries(unit.words || {})) {
    for (const e of list) {
      onWord += 1;
      const basis = e.basis || "";
      byBasis.set(basis || "(none)", (byBasis.get(basis || "(none)") || 0) + 1);

      // ---- A1 : a word span needs a basis that proves a word --------------
      if (!WORD_GRADE_BASIS.has(basis)) {
        refuse("A1", `${unitId} word ${pos} · ${e.ref || "?"}`,
          `drawn on a word under basis "${basis || "(none)"}", which does not prove one` +
          (basis === "DIBBUR_HAMATCHIL_SUGGESTION_NOT_PROVEN"
            ? " — the map itself calls this unproven" : "") +
          "; V scopes this link to the verse");
      }

      // ---- A3 : the span reads as a run of this section's words -----------
      const span = e.v_words;
      if (span !== null && span !== undefined) {
        const ok = Array.isArray(span) && span.length === 2 &&
          Number.isInteger(span[0]) && Number.isInteger(span[1]) && span[1] >= span[0];
        if (!ok) {
          refuse("A3", `${unitId} · ${e.ref || "?"}`,
            `v_words ${JSON.stringify(span)} does not read as a run of words`);
        }
      }
    }
  }
  onSection += (unit.section || []).length;
}

// ---- A5/A6/A7 : the presentation V chose, carried or lost ------------------
//
// V decides per row how a commentary is meant to appear: 607 of Genesis 1:1's
// links are side_panel, 5 are parallel_text_or_side_panel, and 12 are
// RANGE_NOTICE_ONLY — a notice that a work touches this passage, not an
// attachment to it. It also says, lane-wide, that paired layers share one
// scroll track and that a phone shows both members over-under and hides
// neither.
//
// None of that reaches here. The V ledger has the columns; the pack derived
// from it carries none of them, and the pack's own stated purpose is a
// "Phone-sized presentation proof". So the reader has never been told how V
// wants any of this drawn, and invents a single presentation for everything.
//
// This does not fail once per entry — the defect is one dropped field, not six
// hundred bad rows, and six hundred findings would bury it.
const PRESENTATION_FIELDS = ["presentation_default", "presentation_allowed_modes", "hud_link_policy"];
{
  const all = [];
  for (const unit of Object.values(units)) {
    for (const list of Object.values(unit.words || {})) all.push(...list);
    all.push(...(unit.section || []));
  }
  for (const f of PRESENTATION_FIELDS) {
    const carried = all.filter((e) => e[f] !== undefined && e[f] !== null).length;
    if (all.length && carried === 0) {
      refuse("A5", `every entry · ${all.length}`,
        `no entry carries "${f}" — V names it per row and nothing downstream keeps it, ` +
        `so the reader cannot draw what V chose`);
    } else if (all.length && carried < all.length) {
      refuse("A5", `${all.length - carried} of ${all.length} entries`, `carry no "${f}"`);
    }
  }
  const ranged = all.filter((e) => /RANGE_NOTICE_ONLY/.test(String(e.hud_link_policy || "")));
  const rangedDrawn = ranged.filter((e) => e.v_words !== undefined && e.v_words !== null);
  if (rangedDrawn.length) {
    refuse("A6", `${rangedDrawn.length} entries`,
      "V scopes these to a range and asks for a notice; they are carried with a word span");
  }
  const targums = all.filter((e) => /TARGUM/i.test(String(e.commentary_kind || "")));
  const badTargum = targums.filter((e) =>
    e.presentation_default !== undefined &&
    !/parallel/i.test(String(e.presentation_default)));
  if (badTargum.length) {
    refuse("A7", `${badTargum.length} Targum entries`,
      "carry a presentation that does not allow parallel text; V makes Targum its own presentation type");
  }
  notes.push(`entries carrying V's presentation : ` +
    PRESENTATION_FIELDS.map((f) => `${f.split("_")[0]}=${all.filter((e) => e[f] != null).length}/${all.length}`).join("  "));
}

// ---- A2 : the census adds up ----------------------------------------------
const c = side.counts || {};
const recorded = Number(c.recorded ?? c.total ?? NaN);
const noText = Number(c.no_source_text ?? c.no_text ?? 0);
if (Number.isFinite(recorded)) {
  const seen = onWord + onSection + noText;
  if (seen !== recorded) {
    refuse("A2", "census",
      `${onWord} on a word + ${onSection} on the section + ${noText} with no text = ${seen}, ` +
      `but the file records ${recorded}`);
  }
}

notes.push(`attachments drawn on a word      : ${onWord.toLocaleString()}`);
notes.push(`attachments drawn on a section   : ${onSection.toLocaleString()}`);
for (const [b, n] of [...byBasis].sort((a, b2) => b2[1] - a[1])) {
  notes.push(`  ${String(n).padStart(5)}  ${b}${WORD_GRADE_BASIS.has(b) ? "  (proves a word)" : "  (does not)"}`);
}

// ---------------------------------------------------------------------------
if (url) {
  const { createRequire } = await import("node:module");
  const req = createRequire(import.meta.url);
  let chromium;
  try { ({ chromium } = req("playwright")); }
  catch { ({ chromium } = req(`${process.env.NODE_PATH || "/usr/lib/node_modules"}/playwright`)); }
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);

  // ---- A4 : no word-level mark without word evidence ---------------------
  const marks = await page.evaluate(() =>
    [...document.querySelectorAll(".wb")].filter((w) => w.__cm && w.__cm.length)
      .map((w) => ({ word: w.querySelector(".w")?.textContent || "",
                     refs: (w.__cm || []).map((e) => ({ ref: e.ref, basis: e.basis })) })));
  let drawn = 0;
  for (const m of marks) {
    for (const r of m.refs) {
      drawn += 1;
      if (!WORD_GRADE_BASIS.has(r.basis || "")) {
        refuse("A4", `"${m.word}"`,
          `a commentary mark is drawn on this word under basis "${r.basis || "(none)"}" · ${r.ref || "?"}`);
      }
    }
  }
  notes.push(`word-level marks drawn on the page: ${drawn.toLocaleString()}`);
  await browser.close();
}

console.log(`check-attachment-grain-v1 · ${binPath}${url ? ` · ${url}` : ""}`);
for (const n of notes) console.log(`  ${n}`);
console.log("");
if (!fails.length) {
  console.log(`  PASS · ${url ? "7 laws" : "6 laws (bin only — pass --url to check the page)"}`);
  console.log("");
  console.log("  Not covered: whether the evidence is honest. This file checks that a word");
  console.log("  mark carries a basis claiming surface evidence; it cannot check the claim.");
  process.exit(0);
}
const byLaw = new Map();
for (const f of fails) byLaw.set(f.law, [...(byLaw.get(f.law) || []), f]);
console.log(`  REFUSED · ${fails.length} finding${fails.length === 1 ? "" : "s"}`);
for (const [law, list] of [...byLaw].sort()) {
  console.log(`\n  ${law} · ${list.length}`);
  for (const f of list.slice(0, 8)) console.log(`    ${f.what}\n        ${f.detail}`);
  if (list.length > 8) console.log(`    … and ${list.length - 8} more`);
}
process.exit(1);
