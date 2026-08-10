#!/usr/bin/env node
// Pipelineable generator: the Genesis 1:1 attachment map, full pass.
//
// Reads the verse's Hebrew and every recorded commentary/targum segment,
// matches each segment's own opening quotation (dibbur hamatchil) against
// the verse's normalized word sequence, and emits an attachment map that:
//   - carries the human-validated v2 claims byte-for-byte (proven edges
//     stay proven; nothing is promoted),
//   - adds one VISUAL_SUGGESTION_ONLY claim per word-matched segment,
//     labeled only with data derived from the sources (the quoted words,
//     the span, the match basis) — no editorial commentary,
//   - leaves unmatched segments out of the map entirely; they remain
//     visible as verse-level witnesses in the rail and ledger.
//
// Rerun any time the commentary data changes:
//   node tools/generate-genesis-1-1-attachment-map.mjs
//
// Matching rule (same as the reader's runtime matcher):
//   - headword = segment proof text up to the first period,
//   - normalization strips nikkud/te'amim, splits maqaf, keeps letters,
//   - up to two non-quotation lead words may be skipped (e.g. "ve-amar"),
//   - the longest run of up to four consecutive verse words wins; a verse
//     word also matches when it merely ends with the quoted form (clitic
//     prefixes: "בראשית" quoted as "ראשית").

import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "data");
const require = createRequire(import.meta.url);

globalThis.window = {};
require(join(dataDir, "genesis-1-1-commentary-2026-07-17.js"));
require(join(dataDir, "v2-genesis-1-1-attachment-map-2026-07-22.js"));

const commentaryData = window.GENESIS_1_1_COMMENTARY;
const v2Map = window.V2_GENESIS_1_1_ATTACHMENT_MAP;

const GENERATED_ON = "2026-08-10";
const OUT_FILE = join(
  dataDir,
  `v4-genesis-1-1-attachment-map-${GENERATED_ON}.js`,
);

const verseWordsRaw = commentaryData.base.hebrew.split(/\s+/u);
const normalize = (text) =>
  String(text || "")
    .replace(/[֑-ׇ׳״]/gu, "")
    .replace(/־/gu, " ")
    .replace(/[^א-ת ]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
const verseWords = verseWordsRaw.map(normalize);

const matchHeadword = (proofText) => {
  const headRaw =
    (String(proofText).split(".")[0] || "").trim() || String(proofText);
  const allHeadWords = normalize(headRaw)
    .split(" ")
    .filter(Boolean)
    .slice(0, 6);
  if (!allHeadWords.length) return null;
  for (let skip = 0; skip <= 2; skip += 1) {
    const headWords = allHeadWords.slice(skip, skip + 4);
    if (!headWords.length) break;
    for (let len = Math.min(headWords.length, 4); len >= 1; len -= 1) {
      for (let start = 0; start + len <= verseWords.length; start += 1) {
        let holds = true;
        for (let offset = 0; offset < len; offset += 1) {
          const verseWord = verseWords[start + offset];
          const headWord = headWords[offset];
          if (verseWord !== headWord && !verseWord.endsWith(headWord)) {
            holds = false;
            break;
          }
        }
        if (holds) {
          return { start: start + 1, end: start + len, skip };
        }
      }
    }
  }
  return null;
};

const slug = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");

const spanText = (start, end) =>
  start === end ? `word ${start}` : `words ${start}–${end}`;

const carriedClaims = v2Map.claims.map((claim) => claim);
const carriedRefs = new Set(
  carriedClaims.map((claim) => claim.commentary_unit_ref),
);

const families = [
  ...(commentaryData.commentary || []),
  ...(commentaryData.targum || []),
];

const generated = [];
let displayOrder = carriedClaims.length;
const stats = {
  segments_total: 0,
  segments_word_matched: 0,
  segments_carried: carriedRefs.size,
  segments_left_as_verse_witnesses: 0,
  families_with_word_anchors: 0,
};

families.forEach((family) => {
  const familyTitle =
    family.collective_title_en || family.family_title || "Unnamed work";
  let familyMatches = 0;
  (family.segments || []).forEach((segment, segmentIndex) => {
    stats.segments_total += 1;
    if (carriedRefs.has(segment.ref)) return;
    const proofText = segment.he?.proof_text || "";
    const match = proofText ? matchHeadword(proofText) : null;
    if (!match) {
      stats.segments_left_as_verse_witnesses += 1;
      return;
    }
    stats.segments_word_matched += 1;
    familyMatches += 1;
    displayOrder += 1;
    const ordinal = segmentIndex + 1;
    const quoted = verseWordsRaw
      .slice(match.start - 1, match.end)
      .join(" ");
    generated.push({
      claim_id: `gen-${slug(segment.ref)}`,
      commentary_unit_ref: segment.ref,
      source_anchor_ref: "Genesis 1:1",
      display_order: displayOrder,
      lane: displayOrder,
      short_label: String(displayOrder),
      display_title:
        family.commentary_kind === "TARGUM"
          ? `${familyTitle} · Verse 1:1`
          : `${familyTitle} · Comment ${ordinal}`,
      anchor_label: `${
        match.skip > 0 ? "Interior headword cue" : "Opening-phrase cue"
      } · ${spanText(match.start, match.end)}`,
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
  map_id: `v4-genesis-1-1-attachment-map-${GENERATED_ON}`,
  supersedes: "v3-genesis-1-1-attachment-map-2026-08-10",
  generated_on: GENERATED_ON,
  generator: "tools/generate-genesis-1-1-attachment-map.mjs",
  provenance:
    "Full pass over every recorded Genesis 1:1 segment. The four v2 claims are carried unchanged (proven edges stay proven). Every other claim was generated by matching the segment's own opening quotation against the verse's normalized word sequence; up to two non-quotation lead words may be skipped. Labels carry only source-derived data. Segments without a word-level match are not claimed; they remain verse-level witnesses in the ledger.",
  match_stats: stats,
  base_ref: "Genesis 1:1",
  base_word_count: verseWords.length,
  claims: [...carriedClaims, ...generated],
};

const body = `window.V2_GENESIS_1_1_ATTACHMENT_MAP = Object.freeze(${JSON.stringify(
  map,
  null,
  2,
)});\n`;
writeFileSync(OUT_FILE, body);

const perWord = Array.from({ length: verseWords.length + 1 }, () => 0);
map.claims.forEach((claim) => {
  const span =
    claim.asserted_edge && claim.asserted_edge.grain !== "VERSE"
      ? claim.asserted_edge
      : claim.visual_hint;
  if (!span || !Number.isInteger(span.start_word_index)) return;
  for (
    let index = span.start_word_index;
    index <= span.end_word_index;
    index += 1
  ) {
    if (perWord[index] !== undefined) perWord[index] += 1;
  }
});

console.log(`wrote ${OUT_FILE}`);
console.log("stats:", JSON.stringify(stats));
console.log("claims total:", map.claims.length);
console.log("claims covering words 1..7:", perWord.slice(1).join(", "));
