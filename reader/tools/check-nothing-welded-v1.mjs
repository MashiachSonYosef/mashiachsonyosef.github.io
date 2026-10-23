#!/usr/bin/env node
// GUARDS: nothing-welds-rule-v1-a-mark-is-a-position-and-a-reading-is-a-word
//
// A section mark and the word after it are two things at two positions. When
// they arrive as one token they are a weld, and a weld does not add a false
// word — it DESTROYS a true one.
//
//   the ink        {ס}  ויאמר
//   the weld       {ס}ויאמר   ->  normalizes to  סויאמר
//   the store      ויאמר has 18 routes ("and/ he said"). סויאמר has none.
//
// So the reader is shown a word that is not a word, at a position where a real
// one stood, with no definition — and nothing anywhere says a definition was
// lost. The mark is gone too: it cannot be a section break if it is a prefix.
//
// The cause is known and is not ours to fix: the tokenizer splits on literal
// spaces, and MAM writes a non-breaking space between the mark and the word
// after it, which is not one. Some are worse than two words — a mark, a
// preposition and a name have been found fused into a single token.
//
// This gate is not the repair. The repair is an entity-aware retokenize on the
// corpus side, and REFUSING here never drops the word: a refusal stops the
// build, so nothing ships until the token is whole again. Refusing is how the
// word gets kept, not how it gets lost.
//
// The rule, in one line: a brace-wrapped mark may be the whole of a token or
// no part of it.
//
// Run: node tools/check-nothing-welded-v1.mjs [--zones data/zones]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// The marks as the source writes them: a Hebrew letter inside braces. Written
// as codepoints — this file may reason about the script, not carry a glyph of
// it. samekh, pe, and the inverted nun which stands without braces.
const BRACED_MARK = /\{[א-ת]\}/u;
const BRACED_MARK_ALONE = /^\s*\{[א-ת]\}\s*$/u;
const HEBREW = /[א-ת]/u;

if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

const welded = [];
let zonesRead = 0, wordsRead = 0, marksStandingAlone = 0;
for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  for (const sec of z.sections || []) {
    for (const w of sec.words || []) {
      wordsRead += 1;
      const s = String(w.s || "");
      if (!BRACED_MARK.test(s)) continue;
      if (BRACED_MARK_ALONE.test(s)) { marksStandingAlone += 1; continue; }
      // a mark sharing a token with anything else, and worst when that
      // anything is Hebrew: a real word is inside this token, unreachable
      if (welded.length < 12)
        welded.push(`${z.work} ${sec.label} ${JSON.stringify(s).slice(0, 40)}${HEBREW.test(s.replace(BRACED_MARK, "")) ? "  (a word is inside it)" : ""}`);
      else welded.push(null);
    }
  }
}

console.log(`— ${zonesRead} zones · ${wordsRead.toLocaleString()} words —`);
check("a mark is the whole of its token or no part of it",
  welded.length === 0,
  welded.length
    ? `${welded.length} welded — ${welded.filter(Boolean).slice(0, 4).join(" · ")}`
    : `${marksStandingAlone} mark(s) stand alone, none fused to a word`);

// A shelf carrying no marks at all cannot demonstrate this rule, and saying
// "passed" without saying that would be the same trap as a book whose
// apparatus was stripped passing every positional check.
if (!marksStandingAlone && !welded.length)
  console.log("\n  note: no zone on this shelf carries a section mark, so this run proves the\n"
    + "  absence of welds and nothing about the rule. The Tanakh is held; the marks\n"
    + "  arrive with it, and this gate is here first on purpose.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
