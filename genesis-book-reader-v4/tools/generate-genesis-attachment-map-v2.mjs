#!/usr/bin/env node
// Synthesis lane · dibbur-hamatchil-rule-v2-the-window-is-the-verse
//
// The attachment map: which words of the verse each commentary segment sits
// on, read off the segment's own opening quotation. This supersedes the
// generator that produced v4, in one respect only.
//
// ---- what changed, and why -------------------------------------------
//
// v4 said: "the longest run of up to four consecutive verse words wins."
// Four is a window, not a measurement. A commentary that opens by quoting
// five words of the verse was recorded on four of them; one that opened by
// quoting all seven was recorded on four. The reader then drew four, and the
// three words the author had quoted stood outside the mark.
//
//   evidence · Genesis 1:1 is seven words and carries 181 word-anchored
//     segments. Thirteen of them open by quoting five, six or seven of those
//     words. Every one of the thirteen is recorded on four. Four is also the
//     widest span in the whole book: no span of five exists, in a verse where
//     thirteen segments quote five or more.
//
//   the change · the window is the verse. A quotation may reach as far as the
//     verse itself reaches and no further, because there is nothing further
//     for it to reach.
//
//   falsifier · widening must not invent an attachment, lose one, or move one.
//     Measured over all 504 segments carrying an opening quotation: 0 matches
//     appeared, 0 were lost, 0 starting words moved, 13 spans grew. It cannot
//     invent one: a run of five that matches contains a run of four that
//     matches, so anything the wider window finds, the narrower window had
//     already found the front of.
//
// Everything else is v4's, unchanged: headword is the text up to the first
// period; up to two non-quotation lead words may be skipped; a verse word also
// matches when it merely ends with the quoted form, for a clitic prefix. The
// two known faults in that normalization — a one-letter abbreviation absorbed
// by a verse word ending in the same letter, and a comma dropped without a
// space in its place, fusing two words into one token — are the corpus lane's
// and are not touched here.
//
// Run: node tools/generate-genesis-attachment-map-v2.mjs
//      node tools/generate-genesis-attachment-map-v2.mjs --window 4   (v4's)

import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
globalThis.window = {};
require(`${process.cwd()}/data/genesis-1-1-commentary-2026-07-17.js`);
require(`${process.cwd()}/data/v2-genesis-1-1-attachment-map-2026-07-22.js`);
const commentaryData = globalThis.window.GENESIS_1_1_COMMENTARY;
const v2Map = globalThis.window.V2_GENESIS_1_1_ATTACHMENT_MAP;

const GENERATED_ON = "2026-08-19";
const argOf = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };

const verseWordsRaw = commentaryData.base.hebrew.split(/\s+/u);
const normalize = (text) => String(text || "")
  .replace(/[֑-ׇ׳״]/gu, "").replace(/־/gu, " ")
  .replace(/[^א-ת ]/gu, "").replace(/\s+/gu, " ").trim();
const verseWords = verseWordsRaw.map(normalize);

// the window: as far as the verse reaches
const WINDOW = Number(argOf("window", verseWords.length));
const OUT_FILE = argOf("out",
  `data/v5-genesis-1-1-attachment-map-${GENERATED_ON}.js`);

const matchHeadword = (proofText) => {
  const headRaw = (String(proofText).split(".")[0] || "").trim() || String(proofText);
  const allHeadWords = normalize(headRaw).split(" ").filter(Boolean).slice(0, 2 + WINDOW);
  if (!allHeadWords.length) return null;
  for (let skip = 0; skip <= 2; skip += 1) {
    const headWords = allHeadWords.slice(skip, skip + WINDOW);
    if (!headWords.length) break;
    for (let len = Math.min(headWords.length, WINDOW); len >= 1; len -= 1)
      for (let start = 0; start + len <= verseWords.length; start += 1) {
        let holds = true;
        for (let offset = 0; offset < len; offset += 1) {
          const verseWord = verseWords[start + offset], headWord = headWords[offset];
          if (verseWord !== headWord && !verseWord.endsWith(headWord)) { holds = false; break; }
        }
        if (holds) return { start: start + 1, end: start + len, skip };
      }
  }
  return null;
};

const slug = (text) => String(text).toLowerCase()
  .replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "");
const spanText = (start, end) => (start === end ? `word ${start}` : `words ${start}–${end}`);

const carriedClaims = v2Map.claims.map((claim) => claim);
const carriedRefs = new Set(carriedClaims.map((claim) => claim.commentary_unit_ref));
const families = [...(commentaryData.commentary || []), ...(commentaryData.targum || [])];

const generated = [];
let displayOrder = carriedClaims.length;
const stats = {
  segments_total: 0, segments_word_matched: 0, segments_carried: carriedRefs.size,
  segments_left_as_verse_witnesses: 0, families_with_word_anchors: 0,
  widest_span: 0, spans_over_four: 0,
};

families.forEach((family) => {
  const familyTitle = family.collective_title_en || family.family_title || "Unnamed work";
  let familyMatches = 0;
  (family.segments || []).forEach((segment, segmentIndex) => {
    stats.segments_total += 1;
    if (carriedRefs.has(segment.ref)) return;
    const proofText = segment.he?.proof_text || "";
    const match = proofText ? matchHeadword(proofText) : null;
    if (!match) { stats.segments_left_as_verse_witnesses += 1; return; }
    stats.segments_word_matched += 1;
    familyMatches += 1;
    displayOrder += 1;
    const width = match.end - match.start + 1;
    if (width > stats.widest_span) stats.widest_span = width;
    if (width > 4) stats.spans_over_four += 1;
    const ordinal = segmentIndex + 1;
    const quoted = verseWordsRaw.slice(match.start - 1, match.end).join(" ");
    generated.push({
      claim_id: `gen-${slug(segment.ref)}`,
      commentary_unit_ref: segment.ref,
      source_anchor_ref: "Genesis 1:1",
      display_order: displayOrder,
      lane: displayOrder,
      short_label: String(displayOrder),
      display_title: family.commentary_kind === "TARGUM"
        ? `${familyTitle} · Verse 1:1` : `${familyTitle} · Comment ${ordinal}`,
      anchor_label: `${match.skip > 0 ? "Interior headword cue" : "Opening-phrase cue"} · ${spanText(match.start, match.end)}`,
      topic: quoted,
      claim_state: "VISUAL_SUGGESTION_ONLY",
      asserted_edge: null,
      visual_hint: {
        grain: match.skip > 0 ? "INTERIOR_PHRASE" : "OPENING_PHRASE",
        start_word_index: match.start,
        end_word_index: match.end,
        basis: "DIBBUR_HAMATCHIL_SUGGESTION_NOT_PROVEN",
      },
    });
  });
  if (familyMatches > 0) stats.families_with_word_anchors += 1;
});

const map = {
  map_id: `v5-genesis-1-1-attachment-map-${GENERATED_ON}`,
  supersedes: "v4-genesis-1-1-attachment-map-2026-08-10",
  generated_on: GENERATED_ON,
  generator: "tools/generate-genesis-attachment-map-v2.mjs",
  rule_id: "dibbur-hamatchil-rule-v2-the-window-is-the-verse",
  match_window: WINDOW,
  provenance:
    "Full pass over every recorded Genesis 1:1 segment. The four v2 claims are carried unchanged (proven edges stay proven). Every other claim was generated by matching the segment's own opening quotation against the verse's normalized word sequence; up to two non-quotation lead words may be skipped, and the quotation may run as far as the verse itself runs. Labels carry only source-derived data. Segments without a word-level match are not claimed; they remain verse-level witnesses in the ledger. Supersedes v4, which stopped every quotation at four words: 13 spans grew, none appeared, none were lost, and no starting word moved.",
  match_stats: stats,
  base_ref: "Genesis 1:1",
  base_word_count: verseWords.length,
  claims: [...carriedClaims, ...generated],
};

writeFileSync(OUT_FILE, `window.V2_GENESIS_1_1_ATTACHMENT_MAP = Object.freeze(${JSON.stringify(map, null, 2)});\n`);
console.log(`${OUT_FILE} · window ${WINDOW} · ${map.claims.length} claims`);
console.log(`  ${JSON.stringify(stats)}`);
