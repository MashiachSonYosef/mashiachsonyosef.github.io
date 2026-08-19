#!/usr/bin/env node
// Synthesis lane -> corpus lane · what the Genesis attachment map records for
// each commentary's span, and where the reader cannot follow it.
//
// The reader draws the span the chain recorded. This lists every place that
// span disagrees with something else the chain also carries, so the corpus
// lane can decide which of the two is right. It decides nothing itself and
// changes nothing.
//
// Four findings, each named in its own column so they sort apart:
//
//  MAPPED_SPAN_OFF_BY_ONE  the entry carries the verse span — first and last
//    verse word, counted from one — and the same span mapped to the zone's
//    words. The two read under one convention on 106 of 181. On the other 75
//    the mapped span starts one word later than the verse span it came from,
//    and on 49 of those it collapses to a span of no words at all. This is why
//    the reader does not read the mapped span at all.
//
//  SPAN_STOPS_AT_FOUR  the map's own matcher takes "the longest run of up to
//    four consecutive verse words". Eleven comments open by quoting five, six
//    or seven, and every one of them is recorded on four. The bound is
//    declared in the generator, so this is a list of where it bites rather
//    than a fault report.
//
//  SUFFIX_MATCH_REACHED_TOO_FAR  a verse word also matches when it merely ends
//    with the quoted form, which is right for a clitic prefix and wrong for an
//    abbreviation: one comment's second head token is a one-letter
//    abbreviation, and a verse word ending in that letter absorbed it.
//
//  PUNCTUATION_FUSED_THE_HEAD  normalization drops the comma without putting a
//    space in its place, so two words written with no space after a comma
//    become one token that matches nothing. Tested by running the map's own
//    matcher twice — once on the head as it stands, once with every comma
//    turned into a space — and listing only the entries where the two runs
//    give different spans.
//
// Run: node tools/commentary-span-findings-v1.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const load = (f) => JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));
const zone = load("data/zones/genesis.bin");
const cm = load("data/zones/genesis-commentary.bin");
const sec = zone.sections[0];

const POINTS = /[̀-֑ͯ-ׇ]/g;
const bare = (t) => String(t || "").normalize("NFD").replace(POINTS, "").replace(/[^א-ת]/g, "");

// The map's own matcher, copied from the generator that produced the spans, so
// the comparison below is against what it did and not a paraphrase of it:
// headword = the text up to the first period; up to two lead words may be
// skipped; the longest run of up to four consecutive verse words wins; a verse
// word also matches when it merely ends with the quoted form.
const MARKS = /[֑-ׇ׳״]/gu;
const mapNormalize = (text) => String(text || "")
  .replace(MARKS, "").replace(/־/gu, " ")
  .replace(/[^א-ת ]/gu, "").replace(/\s+/gu, " ").trim();
const verseWords = sec.words.map((w) => mapNormalize(w.s));
const matchHeadword = (proofText) => {
  const headRaw = (String(proofText).split(".")[0] || "").trim() || String(proofText);
  const allHeadWords = mapNormalize(headRaw).split(" ").filter(Boolean).slice(0, 6);
  if (!allHeadWords.length) return null;
  for (let skip = 0; skip <= 2; skip += 1) {
    const headWords = allHeadWords.slice(skip, skip + 4);
    if (!headWords.length) break;
    for (let len = Math.min(headWords.length, 4); len >= 1; len -= 1)
      for (let start = 0; start + len <= verseWords.length; start += 1) {
        let holds = true;
        for (let off = 0; off < len; off += 1) {
          const vw = verseWords[start + off], hw = headWords[off];
          if (vw !== hw && !vw.endsWith(hw)) { holds = false; break; }
        }
        if (holds) return { start: start + 1, end: start + len, skip };
      }
  }
  return null;
};
const spanText = (m) => (m ? `${m.start}-${m.end}` : "no match");

const rows = [];
for (const [pos, list] of Object.entries(cm.units["genesis-1-1"].words || {}))
  for (const e of list) rows.push({ pos: Number(pos), e });

// how far the comment's own opening quotation runs from where it was attached
const quotedRun = (e, pos) => {
  const o = String(e.text || "").trim().split(/\s+/, 12).map(bare);
  let n = 0;
  while (n < o.length && pos + n < sec.words.length && o[n] && o[n] === bare(sec.words[pos + n].s)) n += 1;
  return n;
};

const out = [[
  "finding", "ref", "attached_word_index", "verse_span", "verse_span_words",
  "mapped_span", "mapped_span_words", "opening_quotation_words",
  "span_if_commas_were_spaces", "opening_text",
].join(",")];
const csv = (v) => `"${String(v).replace(/"/g, '""')}"`;
const tally = {};
const add = (finding, r, quoted, spaced) => {
  tally[finding] = (tally[finding] || 0) + 1;
  const v = r.e.v_words, z = r.e.z_words;
  out.push([
    finding, r.e.ref, r.pos,
    v ? `${v[0]}-${v[1]}` : "", v ? v[1] - v[0] + 1 : "",
    z ? `${z[0]}-${z[1]}` : "", z ? z[1] - z[0] : "",
    quoted, spaced,
    String(r.e.text || "").trim().split(/\s+/).slice(0, 9).join(" "),
  ].map(csv).join(","));
};

for (const r of rows) {
  const v = r.e.v_words, z = r.e.z_words;
  const quoted = quotedRun(r.e, r.pos);
  const raw = String(r.e.text || "");
  const asIs = matchHeadword(raw);
  const spaced = matchHeadword(raw.replace(/,/g, " "));
  const sp = spanText(spaced);
  const run = v ? v[1] - v[0] + 1 : 0;
  if (v && z && z[0] !== v[0] - 1) add("MAPPED_SPAN_OFF_BY_ONE", r, quoted, sp);
  if (run === 4 && quoted > 4) add("SPAN_STOPS_AT_FOUR", r, quoted, sp);
  if (quoted > 0 && quoted < run && !(run === 4 && quoted > 4)) add("SUFFIX_MATCH_REACHED_TOO_FAR", r, quoted, sp);
  if (spanText(asIs) !== sp) add("PUNCTUATION_FUSED_THE_HEAD", r, quoted, sp);
}

writeFileSync("commentary-span-findings-v1.csv", out.join("\n") + "\n");
console.log(`${rows.length} attachments read from data/zones/genesis-commentary.bin`);
for (const [k, n] of Object.entries(tally).sort()) console.log(`  ${k}  ${n}`);
console.log(`\ncommentary-span-findings-v1.csv  ${out.length - 1} rows`);
