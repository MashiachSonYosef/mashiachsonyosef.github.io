// Compare the verifier's counts (verify.out.json) with the counts the draft summary claims; writes compare.out.json.
import { readFileSync, writeFileSync } from "node:fs";
const D = process.argv[2];
const v = JSON.parse(readFileSync(`${D}/verify.out.json`, "utf8"));
const claimed = {
  "(": { "paren.optional_words": 23603, "paren.suffix_syllable": 9589, "paren.alternatives": 9177, "paren.prefix_syllable": 2526, "paren.list_aside": 527, "paren.head_aside": 174, "paren.opener_never_closed": 120, "paren.note": 77 },
  ")": { "paren.optional_words": 23603, "paren.suffix_syllable": 9589, "paren.alternatives": 9177, "paren.prefix_syllable": 2526, "paren.list_aside": 527, "paren.head_aside": 174, "paren.closer_with_nothing_open": 141, "paren.note": 77 },
  ",": { "comma.in_group": 22129, "comma.in_unclosed_group": 733, "comma.in_head_aside": 259, "comma.note_prose": 57, "comma.rendering_separator": 1 },
  "-": { "hyphen.suffix_syllable": 12118, "hyphen.prefix_syllable": 2734, "hyphen.detached_syllable": 527, "hyphen.opener_tail": 310, "hyphen.compound": 226, "hyphen.bare_in_group": 3, "hyphen.misplaced_opener_tail": 1 },
  X: { "x.whole_rendering": 11263, "x.in_group": 543, "x.mid_rendering": 104 },
  "+": { "plus.whole_rendering": 4387, "plus.in_group": 275, "plus.mid_rendering": 81 },
  ".": { "period.ellipsis": 616, "period.abbreviation": 126, "period.list_end": 108, "period.note_sentence_end": 68, "period.stray_in_rendering": 8, "period.head_sentence_end": 6 },
  ";": { "semicolon.head_separator": 218, "semicolon.rendering_separator": 102, "semicolon.opener": 97, "semicolon.in_head_aside": 82, "semicolon.note_prose": 38 },
  "`": { "backtick.ayin_in_transliteration": 213 }, "'": { "apostrophe.english": 113 }, "\"": { "quote.quotation": 26 }, "&": { "ampersand.in_rendering": 18 },
  ":": { "colon.citation": 7, "colon.opener": 2 }, "?": { "question.interrogative": 5 }, "!": { "exclamation.in_rendering": 1 }, POINT: { "point.in_hebrew_word": 442 },
};
const occClaimed = { "(": 45793, ")": 45814, ",": 23179, "-": 15919, X: 11910, "+": 4743, ".": 932, ";": 537, "`": 213, "'": 113, "\"": 26, "&": 18, ":": 9, "?": 5, "!": 1, POINT: 442 };
const rows = []; let agree = 0, differ = 0;
for (const [m, shapes] of Object.entries(claimed)) {
  const got = v.shapes[m] || {};
  const unexplained = v.shapes[`${m}\u0000UNEXPLAINED`] || 0;
  const occ = Object.values(got).reduce((a, b) => a + b, 0) + unexplained;
  rows.push({ mark: m, occurrences_claimed: occClaimed[m], occurrences_found: occ, unexplained_under_stated_tests: unexplained });
  for (const [s, c] of Object.entries(shapes)) {
    let mine = got[s] || 0; let note = "";
    if (s === "paren.head_aside") { mine += got["paren.NO_OPENER_REGION"] || 0; note = "head + no-opener definitions"; }
    if (s === "comma.in_head_aside") { mine += got["comma.NO_OPENER_REGION"] || 0; note = "head + no-opener definitions"; }
    if (s === "period.ellipsis") { note = `'...' runs only; two-dot runs: ${got["period.ellipsis_TWO_DOTS"] || 0}`; }
    const ok = mine === c; ok ? agree++ : differ++;
    rows.push({ mark: m, shape: s, claimed: c, found: mine, diff: mine - c, note });
  }
}
const v3claimed = { same: 148133, v3_divides_decl_whole: 8, decl_divides_v3_whole: 121, divided_differently: 15, v3_withholds: 229, same_print_differently: 196 };
const v3hClaimed = { same: 148361, v3_divides_decl_whole: 8, decl_divides_v3_whole: 122, divided_differently: 15 };
const v3rows = Object.entries(v3claimed).map(([k, c]) => ({ kind: k, claimed: c, found: v.v3[k], diff: v.v3[k] - c }));
const v3hrows = Object.entries(v3hClaimed).map(([k, c]) => ({ kind: k, claimed: c, found: v.v3_damaged_held_whole[k], diff: v.v3_damaged_held_whole[k] - c }));
const out = { shape_counts_agree: agree, shape_counts_differ: differ, rows, v3: v3rows, v3_damaged_held_whole: v3hrows, declaration_division: v.declStats };
writeFileSync(`${D}/compare.out.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ agree, differ, differing: rows.filter((r) => r.diff), occ: rows.filter((r) => r.occurrences_claimed !== undefined && (r.occurrences_claimed !== r.occurrences_found || r.unexplained_under_stated_tests)), v3: v3rows.filter((r) => r.diff), v3h: v3hrows.filter((r) => r.diff) }, null, 1));
