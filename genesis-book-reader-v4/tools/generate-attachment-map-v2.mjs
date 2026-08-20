#!/usr/bin/env node
// Synthesis lane · dibbur-hamatchil-rule-v2-the-window-is-the-verse
//
// Which words of a section each commentary segment sits on, read off the
// segment's own opening quotation.
//
// ---- what changed from the tool this replaces -------------------------
//
// It was written for one verse and said so eleven times: the pack's path, the
// name of the global it arrives in, the anchor "Genesis 1:1" as a literal on
// every claim, the base text taken from a field that holds exactly one verse.
// It produced a correct map and it could never have produced a second one.
//
// Now: the pack is an argument, the anchors are whatever the pack carries, and
// the words each segment is matched against come from the zone — the book
// itself, which holds every section — rather than from a single field. An
// anchor the zone does not carry is refused rather than guessed at.
//
// ---- the rule, unchanged -----------------------------------------------
//
// A commentary points at what it is about by opening with a quotation of it.
// The headword is the segment's own text up to its first period; up to two
// non-quotation lead words may be skipped; a section word also matches when it
// merely ends with the quoted form, for a clitic prefix; and the quotation may
// run as far as the section itself runs and no further, because there is
// nothing further for it to reach.
//
//   evidence · Genesis 1:1 is seven words and carries 181 word-anchored
//     segments. Thirteen open by quoting five, six or seven of them.
//   falsifier · widening the window to the section must not invent an
//     attachment, lose one, or move one. Measured over all 504 segments that
//     carry an opening quotation: 0 appeared, 0 were lost, 0 starting words
//     moved, 13 spans grew.
//
// What this produces is a suggestion and says so on every claim it makes. The
// other way a commentary attaches — coordinate identity, where two works of
// the sealed chain carry the same unit ids — needs none of this and is done by
// tools/build-commentary-zone.mjs, which proves its edges instead of
// suggesting them.
//
//   --pack     the sealed commentary pack
//   --carried  an earlier map whose claims are carried through unchanged
//   --zone     the book zone the anchors are resolved against
//   --window   longest run to match (default: the section's own length)
//   --out      where to write
//
// Run: node tools/generate-attachment-map-v2.mjs --pack … --zone … --out …

import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const abs = (p) => (p.startsWith("/") ? p : `${process.cwd()}/${p}`);

const PACK = arg("pack", "data/genesis-1-1-commentary-2026-07-17.js");
const CARRIED = arg("carried", "data/v2-genesis-1-1-attachment-map-2026-07-22.js");
const ZONE = arg("zone", "data/zones/genesis.bin");
const GENERATED_ON = arg("stamp", "2026-08-19");
const OUT_FILE = arg("out", `data/v5-attachment-map-${GENERATED_ON}.js`);
const WINDOW_ARG = arg("window", null);

globalThis.window = {};
require(abs(PACK));
require(abs(CARRIED));
// the packs name their own global; take whichever one this file defined
const g = globalThis.window;
const commentaryData = g.GENESIS_1_1_COMMENTARY ||
  Object.values(g).find((v) => v && v.base && Array.isArray(v.commentary));
const carriedMap = g.V2_GENESIS_1_1_ATTACHMENT_MAP ||
  Object.values(g).find((v) => v && Array.isArray(v.claims));
if (!commentaryData) throw new Error(`${PACK} defined no commentary pack — refusing output`);

const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));

// ---- anchors, resolved against the book -------------------------------
//
// A segment names the section it is on in the pack's own words ("Genesis 1:1").
// The zone names the same section as a work and a label. The two are lined up
// by looking the anchor up in an index built from the zone — not by parsing it,
// because a coordinate that has to be parsed is a coordinate that can be parsed
// wrong. An anchor with no section is refused and counted.
const normalize = (text) => String(text || "")
  .replace(/[֑-ׇ׳״]/gu, "").replace(/־/gu, " ")
  .replace(/[^א-ת ]/gu, "").replace(/\s+/gu, " ").trim();

const sectionAt = new Map();
for (const sec of zone.sections || []) {
  const words = (sec.words || []).map((w) => w.s);
  const entry = { unit: sec.unit, label: sec.label, raw: words, norm: words.map(normalize) };
  sectionAt.set(`${zone.work} ${sec.label}`, entry);
  sectionAt.set(sec.unit, entry);
}

const slug = (text) => String(text).toLowerCase()
  .replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "");
const spanText = (start, end) => (start === end ? `word ${start}` : `words ${start}–${end}`);

const matchHeadword = (proofText, sec) => {
  const WINDOW = WINDOW_ARG ? Number(WINDOW_ARG) : sec.norm.length;
  const headRaw = (String(proofText).split(".")[0] || "").trim() || String(proofText);
  const allHeadWords = normalize(headRaw).split(" ").filter(Boolean).slice(0, 2 + WINDOW);
  if (!allHeadWords.length) return null;
  for (let skip = 0; skip <= 2; skip += 1) {
    const headWords = allHeadWords.slice(skip, skip + WINDOW);
    if (!headWords.length) break;
    for (let len = Math.min(headWords.length, WINDOW); len >= 1; len -= 1)
      for (let start = 0; start + len <= sec.norm.length; start += 1) {
        let holds = true;
        for (let offset = 0; offset < len; offset += 1) {
          const sw = sec.norm[start + offset], hw = headWords[offset];
          if (sw !== hw && !sw.endsWith(hw)) { holds = false; break; }
        }
        if (holds) return { start: start + 1, end: start + len, skip };
      }
  }
  return null;
};

const carriedClaims = (carriedMap && carriedMap.claims) ? carriedMap.claims.map((c) => c) : [];
const carriedRefs = new Set(carriedClaims.map((c) => c.commentary_unit_ref));
const families = [...(commentaryData.commentary || []), ...(commentaryData.targum || [])];

const generated = [];
let displayOrder = carriedClaims.length;
const stats = {
  segments_total: 0, segments_word_matched: 0, segments_carried: carriedRefs.size,
  segments_left_as_verse_witnesses: 0, families_with_word_anchors: 0,
  anchors_seen: 0, anchors_the_zone_does_not_carry: 0,
  widest_span: 0, spans_over_four: 0,
};
const anchors = new Set(), missingAnchors = new Set();

families.forEach((family) => {
  const familyTitle = family.collective_title_en || family.family_title || "Unnamed work";
  let familyMatches = 0;
  (family.segments || []).forEach((segment, segmentIndex) => {
    stats.segments_total += 1;
    if (carriedRefs.has(segment.ref)) return;
    const anchorRef = segment.source_anchor_ref || commentaryData.base?.ref || "";
    anchors.add(anchorRef);
    const sec = sectionAt.get(anchorRef);
    if (!sec) { missingAnchors.add(anchorRef); stats.segments_left_as_verse_witnesses += 1; return; }
    const proofText = segment.he?.proof_text || "";
    const match = proofText ? matchHeadword(proofText, sec) : null;
    if (!match) { stats.segments_left_as_verse_witnesses += 1; return; }
    stats.segments_word_matched += 1;
    familyMatches += 1;
    displayOrder += 1;
    const width = match.end - match.start + 1;
    if (width > stats.widest_span) stats.widest_span = width;
    if (width > 4) stats.spans_over_four += 1;
    generated.push({
      claim_id: `gen-${slug(segment.ref)}`,
      commentary_unit_ref: segment.ref,
      source_anchor_ref: anchorRef,
      display_order: displayOrder,
      lane: displayOrder,
      short_label: String(displayOrder),
      display_title: family.commentary_kind === "TARGUM"
        ? `${familyTitle} · Verse ${sec.label}` : `${familyTitle} · Comment ${segmentIndex + 1}`,
      anchor_label: `${match.skip > 0 ? "Interior headword cue" : "Opening-phrase cue"} · ${spanText(match.start, match.end)}`,
      topic: sec.raw.slice(match.start - 1, match.end).join(" "),
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
stats.anchors_seen = anchors.size;
stats.anchors_the_zone_does_not_carry = missingAnchors.size;

const map = {
  map_id: `v5-attachment-map-${GENERATED_ON}`,
  supersedes: carriedMap ? carriedMap.map_id : null,
  generated_on: GENERATED_ON,
  generator: "tools/generate-attachment-map-v2.mjs",
  rule_id: "dibbur-hamatchil-rule-v2-the-window-is-the-verse",
  match_window: WINDOW_ARG ? Number(WINDOW_ARG) : "the section's own length",
  provenance:
    "Full pass over every recorded segment in the pack. Claims carried from an earlier map are carried unchanged (proven edges stay proven). Every other claim was generated by matching the segment's own opening quotation against the words of the section it names, taken from the zone; up to two non-quotation lead words may be skipped, and the quotation may run as far as the section itself runs. Labels carry only source-derived data. Segments without a word-level match are not claimed; they remain verse-level witnesses in the ledger. An anchor the zone does not carry is refused and counted, never guessed.",
  match_stats: stats,
  base_ref: [...anchors][0] || null,
  anchors: [...anchors].sort(),
  claims: [...carriedClaims, ...generated],
};

writeFileSync(OUT_FILE, `window.V2_GENESIS_1_1_ATTACHMENT_MAP = Object.freeze(${JSON.stringify(map, null, 2)});\n`);
console.log(`${OUT_FILE} · ${map.claims.length} claims over ${stats.anchors_seen} anchor${stats.anchors_seen === 1 ? "" : "s"}`);
console.log(`  ${JSON.stringify(stats)}`);
if (missingAnchors.size) console.log(`  anchors the zone does not carry: ${[...missingAnchors].slice(0, 5).join(", ")}`);
