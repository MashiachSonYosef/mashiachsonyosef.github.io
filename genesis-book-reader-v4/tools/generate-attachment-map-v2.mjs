#!/usr/bin/env node
// Synthesis lane · attachment-authorship-rule-v1-the-placement-is-ours-and-says-so
//                 · dibbur-hamatchil-rule-v2-the-window-is-the-verse
//
// Which words of a section each commentary segment sits on.
//
// ---- whose claim this is ------------------------------------------------
//
// Two different things arrive together and only one of them is anybody else's.
//
// WHICH COMMENT OF WHICH WORK, and which section it belongs to, is the chain's.
// It comes with the pack, it has a reference, and it is not this project's to
// decide.
//
// WHERE INSIDE THE SECTION IT SITS is not recorded anywhere. No source states
// it, no ledger carries it, and no licence covers it — a licence governs the
// text of a commentary, and this is not text. It is a placement, and this file
// makes it. Every word-level span in the map below was computed here, by the
// rule stated here, and calling it anything else would be this project taking
// credit from a source that never gave it and hiding an opinion inside a
// receipt.
//
// So: the placement is ours. It says so on the card, in the receipts, and here.
//
// ---- the convention we choose to honour ---------------------------------
//
// A commentary opens by quoting the words it is about. Printers set that
// opening quotation apart, readers have used it to find their place for
// centuries, and it is the reason a commentary can be laid beside a text at
// all. It is a convention of the literature. It is not a law, not a record,
// and not something anyone can grant or withhold permission for.
//
// This reader honours it, deliberately, and states the terms:
//
//   what it does · the segment's own text up to its first period is read as
//     its opening quotation; up to two non-quotation lead words may be skipped;
//     a section word matches when it equals the quoted form or ends with it,
//     for a clitic prefix; and the quotation may run as far as the section runs
//     and no further, because there is nothing further for it to reach. The
//     longest run that holds is the placement.
//
//   what it refuses · it will not place a segment whose opening quotation is
//     not in the section it names. It will not place a segment on a section the
//     zone does not carry. It will not extend a placement past what the
//     quotation covers, and it will not shorten one to look tidier. Where it
//     cannot place a segment it claims nothing and the segment stays a
//     section-level witness.
//
//   what it never claims · that the placement is right. Every claim it makes
//     carries VISUAL_SUGGESTION_ONLY and a basis of
//     DIBBUR_HAMATCHIL_SUGGESTION_NOT_PROVEN, which is this project's own token
//     for its own guess. A claim carried in from an earlier map that was proven
//     against a record keeps its proof and is not re-derived.
//
//   evidence · Genesis 1:1 is seven W and carries 181 word-anchored segments.
//     178 of them are placed by this rule; 4 are carried from a map that proved
//     its edges against a corpus fixture; 1 of those survives the licence gate.
//     Thirteen open by quoting five, six or seven words.
//
//     The comparison is between a quoted word and a run of the section's own
//     entries rather than a single entry, and that is deliberate rather than
//     defensive. The sealed HUD holds Genesis 1:1 as seven W; the chain's c0
//     rows for it are eight, because c0 is the finer grain. A zone built at
//     either grain places the same 178 with this rule. A zone built at c0 grain
//     and compared entry-to-word places 127, because a commentary opening on
//     the first written word matches neither half of a divided entry —
//     measured on 2026-08-21. The rule should not change its answer because the
//     grain changed, and now it does not.
//
//   falsifier · widening the window from four words to the section must not
//     invent a placement, lose one, or move one. Measured over all 504 segments
//     carrying an opening quotation: 0 appeared, 0 were lost, 0 starting words
//     moved, 13 spans grew. If any of those four numbers is not zero — or if a
//     placement covers words the segment does not quote — the rule is wrong.
//
// The other way a commentary attaches needs none of this: where two works of
// the sealed chain carry the same unit ids, the coordinate does the attaching
// and nothing is read at all. That is tools/build-commentary-zone.mjs, and it
// proves its edges rather than suggesting them. This file is for a commentary
// that arrived without one.
//
//   --pack     the sealed commentary pack
//   --carried  an earlier map whose claims are carried through unchanged
//   --zone     the book zone the anchors are resolved against
//   --window   longest run to place (default: the section's own length)
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
        // A quoted word is spelled by one entry, or by a run of them.
        //
        // The chain's c0 numbering is finer than W, and a zone built at that
        // grain holds the first word of the Torah as two entries. Comparing one
        // entry to one quoted word matched neither half, so fifty-one
        // commentaries that name the word they are about fell back to standing
        // on the whole verse — and the zone was briefly "repaired" instead,
        // which put the grain of the text under the convenience of this
        // matcher. It is the matcher that has to read what the record holds.
        //
        // So entries are joined only while they still spell the opening of the
        // quoted word, and the run ends the moment they spell all of it.
        // Nothing is joined that the quotation does not already account for,
        // and a single entry still matches exactly as before.
        let pos = start, holds = true;
        for (let offset = 0; offset < len; offset += 1) {
          const hw = headWords[offset];
          let acc = "", took = 0;
          while (pos < sec.norm.length) {
            const next = acc + sec.norm[pos];
            // the first entry may also merely END with the quoted word — the
            // older, looser test, kept for the forms it was written for
            if (took === 0 && sec.norm[pos].endsWith(hw)) { acc = hw; pos += 1; took += 1; break; }
            if (!hw.startsWith(next)) break;
            acc = next; pos += 1; took += 1;
            if (acc === hw) break;
          }
          if (acc !== hw || took === 0) { holds = false; break; }
        }
        if (holds && pos > start) return { start: start + 1, end: pos, skip };
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
  authorship_rule_id: "attachment-authorship-rule-v1-the-placement-is-ours-and-says-so",
  placed_by:
    "Which comment of which work, and which section it belongs to, is the chain's. Where inside " +
    "the section it sits is not recorded anywhere and no licence covers it: every word-level span " +
    "in this map was placed by tools/generate-attachment-map-v2.mjs, by honouring the convention " +
    "that a commentary opens by quoting what it is about. The placement is this project's own and " +
    "is claimed as a suggestion, never as a proof. Claims carried from an earlier map that proved " +
    "their edges against a record keep those proofs and were not re-derived.",
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
