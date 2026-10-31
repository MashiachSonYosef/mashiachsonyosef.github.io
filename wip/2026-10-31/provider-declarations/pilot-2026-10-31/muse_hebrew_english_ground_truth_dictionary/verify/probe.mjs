#!/usr/bin/env node
// Falsification probes for the drafted declaration's conventions (no marks exist,
// so the probes target the claims made without marks). Single process, one file.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const SRC = join(ROOT, "punct/by-source/muse_hebrew_english_ground_truth_dictionary.jsonl");
const DECLF = join(ROOT, "punct/pilot/muse_hebrew_english_ground_truth_dictionary/declaration.json");
const SK = "muse_hebrew_english_ground_truth_dictionary";
const rows = readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

// P1 "every route is one word": the longest routes, where fused multi-word tokens would show
const longest = [...rows].sort((a, b) => [...b.route].length - [...a.route].length).slice(0, 12).map((r) => `${r.key}: ${r.route}`);
// P2 fused-word probe: route is the concatenation of two other routes in the provider, each >= 4 letters
const vocab = new Set(rows.map((r) => r.route));
const fused = [];
for (const r of rows) {
  const w = r.route; if (w.length < 10) continue;
  for (let i = 4; i <= w.length - 4; i += 1) if (vocab.has(w.slice(0, i)) && vocab.has(w.slice(i))) { fused.push(`${r.key}: ${w} = ${w.slice(0, i)}+${w.slice(i)}`); break; }
}
// P3 a route that is a single letter (an abbreviation would normally carry a period)
const oneLetter = rows.filter((r) => [...r.route].length === 1).map((r) => `${r.key}: ${r.route}`);
const twoLetter = rows.filter((r) => [...r.route].length === 2).length;
// P4 apostrophe-dropping: contraction stems such as "dont", "cant", "im", "youre", "isnt" (a dropped apostrophe is a mark the provider removed)
const contr = /^(dont|cant|wont|isnt|arent|wasnt|werent|didnt|doesnt|couldnt|shouldnt|wouldnt|im|ive|youre|youve|theyre|weve|hes|shes|lets|thats|whats|theres|ill|id|aint|hadnt|hasnt|havent|mustnt|neednt|o|s|t|d|ll|re|ve|m)$/;
const contractions = rows.filter((r) => contr.test(r.route)).map((r) => `${r.key}: ${r.route}`);
// P5 the machine path: import the real machine and confirm an undeclared provider ships whole,
// and simulate a declared-with-empty-set provider by the machine's own unknownMarks test
const mach = await import(join(ROOT, "ghp/reader/tools/declaration-v1.mjs"));
let machWhole = 0, machOther = 0;
for (const r of rows) { const x = mach.readingOf(r.route, r.def, SK); if (x.readings.length === 1 && x.readings[0] === r.route) machWhole += 1; else machOther += 1; }
const inStore = Object.prototype.hasOwnProperty.call(mach.DECLARATIONS.providers, SK);
// P6 American spelling in the draft's own authored prose (CLAUDE.md), excluding quoted source words
const declText = readFileSync(DECLF, "utf8");
const british = (declText.match(/\b(licence|catalogue|analys|colour|behaviour|organis|recognis|authoris|realis|normalis)\w*/gi) || []);
const shapeKeys = Object.keys(JSON.parse(declText).providers[SK]);
const base = JSON.parse(readFileSync(join(ROOT, "ghp/reader/tools/declarations-v1.json"), "utf8"));
const m14Keys = Object.keys(base.providers.wikisource_strongs_explicit_forms || {});
const missingVsM14 = m14Keys.filter((k) => !shapeKeys.includes(k));
const extraVsM14 = shapeKeys.filter((k) => !m14Keys.includes(k));
// P7 records after the first on a multi-route key (the 'second record' wording)
const perKey = new Map(); for (const r of rows) perKey.set(r.key, (perKey.get(r.key) || 0) + 1);
let multi = 0, multiRoutes = 0; for (const n of perKey.values()) if (n > 1) { multi += 1; multiRoutes += n; }
const out = { second_or_later_records: multiRoutes - multi, multi_keys: multi, multi_routes: multiRoutes, fused_all: fused.map((x) => x.split(": ")[1]), longest, fused_count: fused.length, fused_examples: fused.slice(0, 10), one_letter_routes: oneLetter.length, one_letter_examples: oneLetter.slice(0, 12), two_letter_routes: twoLetter,
  contraction_stems: contractions.length, contraction_examples: contractions.slice(0, 15),
  machine: { provider_in_store_declarations: inStore, rows_whole: machWhole, rows_other: machOther },
  british_words_in_declaration: british, keys_missing_vs_m14: missingVsM14, keys_extra_vs_m14: extraVsM14 };
writeFileSync(join(HERE, "probe-result.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
