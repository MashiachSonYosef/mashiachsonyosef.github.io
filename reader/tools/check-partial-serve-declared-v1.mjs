#!/usr/bin/env node
// GUARDS: partial-serve-rule-v1-a-work-served-in-part-says-so-where-the-part-is-missing
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// A LICENSED PORTION WITHHELD. Not an out-of-scope language — that case was
// ruled out of this mechanism, and the reason matters more than the rule.
//
// This gate was first written for the wrong case. The owner ruled that a
// licence covering a whole work does not stop us serving part of it: half
// Hebrew and half Yiddish, take the Hebrew, and the Hebrew is worth having.
// The reasoning was sound and the case was not, because word-level partial
// serve turned out not to be implementable at all. Yiddish and Hebrew overlap
// at the TOKEN level, not merely in script. DALET-YOD-NUN-YOD-NUN is Yiddish
// "to serve" and also a real Aramaic word, judgments. ALEPH-YOD-NUN is
// Yiddish "in" and Aramaic "there is not." The longest unverified run in 300
// rows is three tokens, because the Yiddish never forms a run — it is
// interleaved with words the base legitimately contains. Wordlists get the
// recall wrong; orthography has no marker that is not ordinary Hebrew;
// unverified runs fail because Yiddish borrows the token set. The
// distinguishing information is syntax, and syntax lives in the passage, not
// the word. The unit of language is the passage.
//
// So the owner ruled: remove the whole work. A work carrying material outside
// the admitted languages is NOT SERVED, and is not served in part either.
//
// What survives is this mechanism pointed at the case it fits: a portion we
// are not LICENSED to serve, where a licence drew the boundary rather than a
// guess about language. L5 refuses the misuse outright, so the ruling cannot
// be undone by declaring a language omission and serving the rest.
//
// The claim is what makes a partial serve honest, and a claim nobody makes is
// a claim nobody can rely on. A work served with its withheld portion quietly
// deleted does not read as a partial work — it reads as a complete one
// missing a sentence. That is the
// flattening defect exactly: a book that arrived without its section marks
// presents as a book that never had any, and eight of them did. A petuchah
// drawn as nothing is a lie about the page, and so is an omission drawn as
// nothing.
//
// So a zone may serve less than the whole, and may not do it silently.
//
//   L1  a zone serving fewer words than it was sealed to hold declares it
//   L2  every declaration names WHAT is withheld and WHY, in words
//   L3  a zone that declares nothing serves everything — no silent shortfall
//   L4  a gap in C0 is witnessed or declared, never merely absent
//   L5  no omission is excused by a language — that work is removed, not cut
//
// Nothing on this shelf is partial today: 3,064 zones, every one serving
// exactly its sealed count, nothing held, no C0 gap. The works carrying
// Yiddish are not published here and now never will be — they are removed
// whole, not cut. The gate is written first on purpose, the same way the weld
// gate and the joiner gate were, so that the first genuinely licence-withheld
// portion cannot arrive and pass unnoticed.
//
// THE SHAPE A DECLARATION TAKES. On the zone, a served_in_part record:
//
//   served_in_part: {
//     rule_id: "partial-serve-rule-v1-...",
//     sealed_words: 4210,          what the whole work holds
//     served_words: 3980,          what this zone carries
//     omissions: [ { at_c0: 175939990, words: 230,
//                    what: "the editor's apparatus",
//                    why:  "not covered by the licence this work is served under" } ]
//   }
//
// at_c0 is what lets the reader draw the omission WHERE IT HAPPENED rather
// than as a footnote at the end. An omission reported only in a total is a
// number; an omission reported at its own position is a hole a reader can
// see, which is what was asked for.
//
// Run: node tools/check-partial-serve-declared-v1.mjs [--zones data/zones]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));

export const PARTIAL_SERVE_RULE_ID =
  "partial-serve-rule-v1-a-work-served-in-part-says-so-where-the-part-is-missing";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

const silentShort = [], bareDeclaration = [], falseWhole = [], undeclaredGap = [], languageExcused = [];
// The reasons an omission may not give. A work carrying material outside the
// admitted languages is removed whole, so an omission blaming a language is a
// work that should not be on the shelf at all — served with its problem cut
// out and the remainder presented as fit to read. Matched as words, because
// the reason is prose and prose is what a stranger would audit.
const LANGUAGE_EXCUSE = /\b(yiddish|ladino|judeo-arabic|arabic|persian|turkish|syriac|mandaic|samaritan|greek|latin)\b|out of scope|outside the (admitted )?languages/i;
let zonesRead = 0, partial = 0, omissions = 0, wordsOmitted = 0;

for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  const c = z.counts || {};
  const sealed = c.sealed_expected_words, served = c.words;
  const decl = z.served_in_part || null;
  const short = Number.isFinite(sealed) && Number.isFinite(served) && served < sealed;

  // L1 / L3 — the two directions of the same law
  if (short && !decl) silentShort.push(`${z.work} · ${served} of ${sealed} · short ${sealed - served}`);
  if (decl && !short) falseWhole.push(`${z.work} · declares an omission its counts do not show`);

  if (decl) {
    partial += 1;
    const oms = Array.isArray(decl.omissions) ? decl.omissions : [];
    if (!oms.length) bareDeclaration.push(`${z.work} · declares partial serve and lists no omission`);
    for (const o of oms) {
      omissions += 1;
      wordsOmitted += Number(o.words) || 0;
      // L2 — what and why, both in words a stranger can read, and a position
      if (!o.what || !o.why || !Number.isFinite(Number(o.at_c0)))
        bareDeclaration.push(`${z.work} · an omission without ${!o.what ? "a what" : !o.why ? "a why" : "a position"}`);
      // L5 — the ruling enforced rather than remembered
      if (o.why && LANGUAGE_EXCUSE.test(String(o.why)))
        languageExcused.push(`${z.work} · ${JSON.stringify(String(o.why).slice(0, 54))}`);
    }
  }

  // L4 — a hole in the numbering, unaccounted for. The corpus lane's own rule
  // is that a witnessed gap is a fact and not a fault; what is refused is a
  // gap nobody witnessed and nobody declared.
  let prev = null;
  for (const s of z.sections || []) {
    if (prev != null && Number(s.c0_first) > prev + 1) {
      const at = Number(s.c0_first);
      const covered = decl && (decl.omissions || []).some((o) => Number(o.at_c0) <= at && at <= Number(o.at_c0) + (Number(o.words) || 0) + 1);
      const witnessed = (z.numbering_gaps || z.witnessed_gaps || []).length > 0;
      if (!covered && !witnessed) undeclaredGap.push(`${z.work} · ${prev} then ${s.c0_first}`);
    }
    prev = Number(s.c0_last);
  }
}

console.log(`— ${zonesRead} zones · ${partial} served in part · ${omissions} omissions · ${wordsOmitted.toLocaleString()} words withheld —\n`);

check("L1  a zone serving fewer words than it was sealed to hold declares it",
  silentShort.length === 0,
  silentShort.length ? `${silentShort.length} silently short — ${silentShort.slice(0, 3).join(" · ")}`
    : partial ? `${partial} declare it` : "no zone here is short of its seal");

check("L2  every declaration names what is out of scope, why, and where",
  bareDeclaration.length === 0,
  bareDeclaration.length ? bareDeclaration.slice(0, 3).join(" · ")
    : omissions ? `${omissions} omissions, each with a what, a why and a position`
      : "none to name");

check("L3  a zone that declares nothing serves everything",
  falseWhole.length === 0,
  falseWhole.length ? falseWhole.slice(0, 3).join(" · ")
    : "no zone claims an omission its own counts deny");

check("L5  no omission is excused by a language — that work is removed, not cut",
  languageExcused.length === 0,
  languageExcused.length
    ? `${languageExcused.length} cut for a language — ${languageExcused.slice(0, 3).join(" · ")}`
    : "no declaration blames a language for a hole");

check("L4  a gap in C0 is witnessed or declared, never merely absent",
  undeclaredGap.length === 0,
  undeclaredGap.length ? `${undeclaredGap.length} unaccounted — ${undeclaredGap.slice(0, 3).join(" · ")}`
    : "the numbering runs unbroken or says why it does not");

if (!partial) {
  console.log("\n  note: nothing on this shelf is served in part, so this run proves the absence");
  console.log("  of a silent omission and nothing about how a declared one is drawn. The works");
  console.log("  known to carry material outside the admitted languages are not published here");
  console.log("  yet. This gate stands first so the first one cannot arrive and pass unnoticed.");
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
