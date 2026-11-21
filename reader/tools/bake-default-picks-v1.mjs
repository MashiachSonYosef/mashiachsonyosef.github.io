#!/usr/bin/env node
// bake-default-picks-v1 · each source's own pick at every word place, laid on the zone's words for the default-source pills
//
// RULE: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second
// LEDGER: -
// no frame letter. It reads the corpus lane's pinned ledger of default picks
// (named on the command line), the served zones, the served route store and
// the records of the resting lines (data/resting-lines/, what the page draws
// as each work opens, read off the page by tools/bake-resting-lines-v1.mjs),
// and writes into data/: one file per book under data/default-picks/, their
// index data/default-picks/index.json, the lane's three rules and three
// receipts kept beside them byte for byte, and
// data/default-picks-receipt-v1.json. No row is judged here and no text is
// changed.
//
// «SO ITS NOT JUST STEP, THATS JUST ONE OPTION.» The line under each word
// rests on STEP's reading (TAHOT's translation at the place). The owner, 14
// November 2026: «can we serve up each of the default toggles now so its not
// just STEP, thats just one option», and «even if its 99.9% TAHOT you could
// still auto select a second source if it fills in the 0.1%». The corpus lane
// wrote, for every word place of the 39 books, each source's own picks: STEP's,
// MACULA's, the UBS dictionary's and the unabridged BDB's, numbered 1, 2, 3 in
// the source's own order (relay v180, default-picks-v1/RULE.md); mended
// STEP's dictionary picks (relay v180.1, default-picks-v1.1/RULE-AMENDMENT.md);
// and mended STEP's and BDB's picks again on the word numbering v1.1, with the
// re-points of its question 1 and of the audit's call 5 (relay v195,
// default-picks-v1.2/RULE-AMENDMENT.md). This tool applies v1.1 over v1 and
// v1.2 over v1.1, lays the picks on the zone's words and counts, for each
// source, where it has a line of its own and where each other source fills
// what it leaves.
//
// A PLACE IS A ZONE WORD. Place n is WORD_N (zone.html): one-based over every
// entry of the zone's sections, marks included, in section order. The ledger
// names a place by its section label and the word's number among the
// section's words that are not marks ("3:14:2"); the i-th ledger line must be
// the i-th such word, or the book is refused.
//
// THE ONE COUNTING RULE (the bake, the page and the checks hold the same one).
// A pick's words are a line pick where they hold a letter or a digit and are
// not the UBS dictionary's «NO DATA YET»: a sign or a stop alone (UBS's «-»,
// MACULA's «?» and «`») is no pick for any source, and the card prints it as
// given.
//   - STEP has a line where its pick 1, after the mends, is a line pick, or
//     where the zone's place pieces (pg) are all there and every one carries
//     words (the place reading, which the line prints today), and where the
//     line as it rests draws one: the place reading, STEP's own words, or
//     today's line (below, THE LINE AS IT RESTS);
//   - MACULA has a line where the word is not a ketiv/qere word (kq) and its
//     pick is a line pick;
//   - UBS has a line where the word is not kq and some piece's pick 1 is a
//     line pick;
//   - BDB has a line where the word is not kq and its pick 1's record's
//     highlighted words (the ledger's slot 5) are a line pick;
//   - fills[x][y] counts the places where x has no line and y has one; at a
//     place where STEP has a pick and its line rests bare, no fill of STEP's
//     counts it (its second does not fill it) and STEP fills nothing there,
//     while the other sources' has and fills count it as anywhere else (the
//     page prints their lines there);
//   - rest_step[x][y] counts, for a first x and a second y that are not STEP,
//     the places where neither x nor y has a line and STEP's line as it rests
//     draws one: STEP is the last to fill out every source (the owner, 16
//     November 2026: «shouldnt the other 3.3% just default to STEP?»), so the
//     note names STEP's share by its count, and today's line only where
//     STEP's line has nothing either;
//   - STEP's leaves are the places where STEP has no pick (no line pick at
//     pick 1, no pieces that answer) and the word is not kq. Its second
//     source fills them, and only them (v1.2 leaves one, and no source picks
//     there).
// The second source is not stored: the page works it out from fills among the
// sources a reader has on (the one that fills most; a tie goes to the earlier
// pill: STEP, MACULA, UBS, BDB; none where every fill is 0). This tool works it
// out the same way, with every source on, only to count and to say.
//
// STEP'S OWN WORDS WHERE TODAY'S LINE IS BARE (the owner's question 2 of 14
// November, recommendation B). The line under STEP is today's line wherever
// that prints words. Where it is bare and STEP has a pick, it is STEP's own
// pick 1 words, credited to STEP; a pick that names no row, or names one the
// card's entry gate withholds, prints so too (relay v195, sections 2 and 8).
// Today's line is the page's own, worked out on the page, so the index carries
// every place where it may be bare under STEP's words (step_words): the words
// that are not kq, whose zone place pieces do not answer, where STEP's pick 1
// is a line pick. Each is STEP's reading (kind r), which STEP credits to TAHOT
// (M4). The page prints them where its own line is bare, and nowhere else.
// HELD: where STEP reads one written word as two TAHOT words («not | peoples»,
// «like | a hearth»), the ledger's pick 1 is the first of them only, and its
// words alone would stand under the whole word as half of STEP's reading. The
// corpus lane's call 4 (relay v189, accepted by the owner) lists those places,
// writing STEP's words for them with « | » between the two, and holds them
// until the lane says how STEP's line reads there (its open question 1, put
// back to the lane); so the index carries no STEP words at a place call 4
// writes with « | », and those places keep today's line. The list is the
// lane's file, kept in this tree byte for byte (data/audit-calls/calls-v1/)
// and held to its pin (held_split_v189).
//
// STEP'S OWN READING STANDS WHERE STEP SPELLS OR PARTS THE WORD OTHERWISE
// (steps-reading-stands-rule-v1, 15 November 2026: the corpus lane's call 4
// of relay v189, accepted by the owner, «where STEP spells or parts the word
// otherwise (853 places), STEP's reading stands»; question 4, «the line under
// STEP is always credited to STEP»). The same list names the places by STEP's
// own tie there (open-q11, open-q1, open-q14), never by their name. A place of
// it stands where the list's action is steps_words_are_the_line, STEP's words
// hold no « | » (held, above), and the zone word is not a pair whose read form
// is several words (the zone's own kq.words_read: the read words of relay
// v192 carry those places). At a place that stands, the line under STEP is
// STEP's own pick 1, credited to STEP, whatever today's line is: the index
// carries it as [n, words, 1] (a pair among them), it never rests bare, and
// it is counted as printing; the rows it replaces stay on the card. Held by
// class and counted: the list's « | » places, its places whose action is
// none, and its pairs whose read form is several words. Refused: a place of
// the list whose zone word does not carry the list's letters (s), a place
// that stands where STEP's pick 1 after the mends is not the list's words
// byte for byte, and an action the list does not define. Question 3's words
// (STEP's words wherever STEP has a pick) stay held: only the list's
// category stands.
//
// THE LINE AS IT RESTS. STEP's layer is the line as it rests: TAHOT's reading
// at the place, STEP's own words where today's line is bare, and elsewhere
// today's line, whose chip names its own source. So STEP's line is counted
// only where that line draws one. Its own words are never drawn at a pair
// (kq: a pair keeps today's line) or at a place held above; there, where the
// place pieces do not answer, the line as it rests is today's line, and where
// today's line is bare it draws nothing, though STEP has a pick: STEP has no
// line there (has.step), it is no place STEP leaves (its second fills only
// those), and no fill of STEP's or by STEP counts it; the other sources' has
// and fills count it as anywhere else. Whether today's line is bare there is read
// off the page's own record of the line at rest (data/resting-lines/<book>
// .json.gz): no line of the record stands over the word. At rest the default
// sources move nothing at those places (no STEP words, and STEP's second fills
// nothing there), so the record's line
// there is today's whether or not it was read with the defaults laid. The
// round reads the lines after this bake, and bakes again after them with
// --receipt-only, which writes the receipt of the records just read and
// refuses where they would move the index; check-default-picks-v1 D3, which
// holds the index to the records as they stand, is red there too.
// The same records give the lines at rest over more than one word (a joined
// run's one line), and which of them each source reads whole.
//
// WHAT IS WRITTEN. data/default-picks/<book>.bin, gzip -9 of minified JSON:
//   { schema_version: DEFAULT_PICKS_BOOK_V1, rule_id, book,
//     zone: { entries, places, places_sha256 (the place labels in WORD_N
//             order, joined by a line feed) },
//     ledger: { file, sha256, mend_places: { step_v1_1, step_v1_2, bdb_v1_2 },
//               store_read, store_resolved },
//     bdb_words: [ each BDB record's highlighted words, once per record ],
//     places: [ for WORD_N n at places[n - 1]: null at a mark or where no
//               source picks, else [step, macula, ubs, bdb] ],
//     spans: { rule_id, macula: [...], ubs: [...], bdb: [...] }: where the
//               tree pins the corpus lane's spans list (relay v209,
//               data/default-picks/spans-v1/PIN.json), each source's units
//               of two or more words its first pick's line reads, as
//               [[n, ...the unit's words], [n, ...where the line is filed]]
//               in the order of their first word (tools/default-spans-v1.mjs
//               says which lines land); absent where the tree pins none }
// where each slot is 0 where the source has no pick, or
//   step    [[kind (0 r, 1 v, 2 a), words | 0, the variant's letter], ...]:
//           the ledger's words byte for byte after the mends; a variant's
//           Hebrew, word number and line are not carried;
//   macula  its words, byte for byte; its line where they are a line pick;
//   ubs     [line | 0, [[piece, words], ...]]: line is the pick 1 glosses of
//           the pieces whose pick 1 is a line pick, joined by " + "; piece is
//           the piece's place in the ledger's list of the word's pieces, from
//           0; the picks of a piece stand in its own order and the page
//           numbers them from 1 within the piece; glosses byte for byte,
//           " / " and «-» kept;
//   bdb     [[sense, w], ...]: sense is the marker of the ledger's
//           point<p>:<marker>. with its period dropped, "" for the entry;
//           w is a one-based index into bdb_words, 0 where the record has
//           no highlighted words.
// data/default-picks/index.json, which the page fetches at boot, carries the
// sources (id, pill, M ids) and per book: file, bytes, sha256, entries,
// places, kq, has, fills; step_leaves, a row per STEP leaf: [n, MACULA's
// line | 0, UBS's line | 0, [BDB's sense, BDB's words] | 0]; and step_words,
// a row per place STEP's words may fill: [n, STEP's pick 1 words]. So the line
// at rest needs no book file. It carries no second source.
//
// REFUSED, each in words and with nothing written:
//   1. a pinned file, or a book file held to receipt-v1's outputs, is not the
//      bytes named; the three receipts name other bytes than the pin; or the
//      added rows are not numbered on from the table before them;
//   2. a zone word has no ledger place, a ledger place has no zone word, or
//      the order differs;
//   3. a mend line names a place v1 lacks, or names one twice; v1.1's mend
//      changes a pick of kind r; where v1.1 has STEP picks, v1.2's mend
//      changes a pick's number, kind, entry, gloss, words or a variant's
//      letter or Hebrew (only the rows it names and a variant's word number
//      and line may change), or adds a pick that is not a variant behind a
//      broken bar (a kind v pick after a variant of the same word number and
//      line);
//   4. picks not numbered 1 to n (for UBS, within each piece); a pick of kind
//      v without its [letter, Hebrew, word number, line]; a pick of another
//      kind than r, v or a; a BDB meaning that is neither point<p>:<marker>.
//      nor "the entry"; STEP's pick 1 of another kind than r at a place its
//      words may fill;
//   5. a named row the served store does not hold under its key with its
//      rank, its source id and its text's sha256, and that the row-strikes
//      record does not account for (THE ROWS FOLLOWED, below); a row a round
//      struck since that a pick still names; a row whose source id the store
//      names in no m_sources, a pick naming a row the tables do not hold, or
//      a pill crediting a source the store does not name;
//   6. one BDB record with two different highlights at two of its picks;
//   7. a carried text holding U+FFFD or a control character other than a line
//      feed (U+000A, which is counted);
//   8. a count that misses what the receipts say: receipt-v1's picks per place
//      for each source (for UBS, the picks of the place's fullest piece, as
//      UBS numbers them within each piece) and its places; receipt-v1.1's
//      mend (places, picks changed by kind, picks that fall together) and its
//      v1 counts of variants and alternatives, from which the counts after
//      the mend follow; receipt-v1.2's mend (lines, the places that gain
//      picks and the picks they gain by kind, the variants behind a broken
//      bar, the places with no STEP pick before and after), its BDB mend
//      (places, picks before and after), its rows, from which the picks by
//      kind after v1.2 follow, and the counts of the lists beside the picks;
//   9. a list beside the picks that v1.2 does not bear out: a waiting pick
//      that is not a STEP reading naming no row with its entry and words; an
//      entry-gate line whose pick does not name its withheld row (an active
//      line) or does not name the rows it says (a stale one); a line of the
//      list after the re-points whose pick does not name the rows it says; a
//      re-point to a row the tables do not hold; a branch line that does not
//      rest off. No branch is baked.
//      receipt-v1's own variant_picks and alternative_picks are not held; the
//      receipt here records them beside the counts (question 2 to the lane);
//  10. a book with no record of its resting lines, or one whose record is not
//      of the zone's sections (their number and labels): where the line as it
//      rests is bare is read off the record, never guessed.
//
// THE ROWS FOLLOWED (15 November 2026). The rows tables name each row as the
// store held it when v1.2 read it (its receipt names that version). Named
// lists have moved rows since (tools/strike-rows-v1.mjs, each round kept in
// data/row-strikes-v1.json), so a row not found as named is asked of that
// record (tools/row-strikes-follow-v1.mjs), and nothing is guessed:
//   - a row a round moved to another key (call 5 of relay v189: the rows
//     under a key ending in a maqaf that the plain key lacked) is found
//     under the name it has now, and counted with the picks that name it;
//   - a row a round struck is counted where no pick names it any more (v1.2
//     re-pointed every pick off the rows call 5 strikes: its own list,
//     call5_repoints, says where to), and refused where one still does;
//   - a row a round withheld is counted as withheld, with the picks that
//     name it: it prints nothing on a card, and the pick stands on its other
//     rows or on the source's own words;
//   - a row the record says nothing of is refused, as before (refusal 5).
// The two lists of v1.2 that speak of call 5 are held to the same record:
// each row of call5_repoints is as v1.2 read it, or went where its line says
// (struck with a row to point to, moved with none); and each pick that waits
// on call 5's re-key (picks_waiting) names a row that is still under its key
// with a maqaf, or now stands under the plain key its line names. A row a
// round retexted since (relay v187, the words our build took out given back:
// row-strikes-follow-rule-v2) keeps its key and rank and is found under the
// name of the words it took; its text, as the card prints it, is the one
// what prints a pill's words reads (picks_printed), and it is counted apart
// (rows_retexted_and_found_under_their_new_name).
//
// COUNTED, in data/default-picks-receipt-v1.json: per book and per source, has
// and fills; the rest fills (STEP's leaves its second fills), each with its
// place; the places STEP's words may fill, by book, with those naming no row
// by their waiting status and those on the entry gate's lists; the places
// where STEP has a pick and its line rests bare, by cause, each with its
// place, and the records read; the leaves the zone's place pieces answer;
// each source's picks that are a sign alone, and UBS's «NO DATA YET»; BDB pick
// 1s with no highlight; line picks naming no row, or whose first named row is
// another source's; under each first source, the picks the card prints as
// pills for it and for its second (STEP's where its own words print), by the
// rows the pick names (a row of its own source, another source's only, or
// none), whether a named row under a key the card asks prints it whole, and
// whether the card makes it: no row of the pill's own source under the keys
// the card asks at the place (the word's own, its pieces') prints it, so the
// card makes a pill of the source's own words (picks_printed); the
// lines at rest over more than one word, and how many of them each source
// reads at every word, at some, or at none (runs_read_whole); lines holding a
// slash; lines over 40 characters; line feeds; ketiv/qere words; rows found
// twice; the lists beside v1.2's picks, by status, class and cause.
//
// Idempotent: only changed bytes are written, so a second run writes nothing.
// --dry prints and writes nothing. Nothing it prints holds Hebrew.
// --receipt-only writes the receipt alone, and refuses where any other file
// would change: the round runs the bake so a second time, after its lines
// step, so that the receipt it ships is of the records of the resting lines
// that step read (their zones the zones on disk), while the index and the
// book files stay those the records and the lines were read with.
//
// Run: node tools/bake-default-picks-v1.mjs --ledger <dir holding default-picks-v1/, default-picks-v1.1/ and default-picks-v1.2/> [--out data/default-picks] [--zones data/zones] [--store data/route-store] [--records data/resting-lines] [--pin data/default-picks/PIN.json] [--receipt data/default-picks-receipt-v1.json] [--receipt-only] [--dry]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { readPinned, readPinnedLines, sha256Of, PinFault } from "./pinned-v1.mjs";
import { startedAs } from "./main-guard-v1.mjs";
import { readRecord, RESTING_DIR } from "./resting-lines-v1.mjs";
import { openFollower, followedRecord, followedSaid, FollowFault } from "./row-strikes-follow-v1.mjs";
import { printedForm, routePrinted, signsOff } from "./gloss-store-v1.mjs";
import { readDefaultSpans, unitsOfBook, SPAN_SOURCES, DEFAULT_SPANS_RULE_ID, DEFAULT_SPANS_HOME } from "./default-spans-v1.mjs";

export const DEFAULT_PICKS_RULE_ID = "default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second";

// The pills, in their order, which is also the order that breaks a tie for the second source. The M ids are
// the served sources each pill credits: STEP's reading is TAHOT's (M4), its variants and alternatives print
// through its dictionary TBESH (M19).
const SOURCES = [
  { id: "step", pill: "STEP", m: { r: "M4", v: "M19", a: "M19" } },
  { id: "macula", pill: "MACULA", m: "M3" },
  { id: "ubs", pill: "UBS", m: "M18" },
  { id: "bdb", pill: "BDB", m: "M46" },
];
const IDS = SOURCES.map((s) => s.id);
const PILL = Object.fromEntries(SOURCES.map((s) => [s.id, s.pill]));
const KIND = { r: 0, v: 1, a: 2 };
const OWN_M = { r: "M4", v: "M19", a: "M19", macula: "M3", ubs: "M18", bdb: "M46" };
// the UBS dictionary's word for a meaning it has not written yet: no line (question 8 to the lane)
const NO_DATA_YET = "NO DATA YET";
const THE_ENTRY = "the entry";
const POINT = /^point\d+:([^.:\s]+)\.$/;
const SENSE_SAYS = " \u00b7 sense ";
const LONG = 40;
// the pins the tool holds; those kept beside the book files are the rules and the receipts
const PINNED = ["rule", "receipt", "rows", "amendment", "receipt_v1_1", "mend", "rows_added",
  "amendment_v1_2", "receipt_v1_2", "mend_v1_2", "bdb_mend_v1_2", "rows_added_v1_2",
  "picks_waiting_v1_2", "entry_gate_v1_2", "entry_gate_after_call5_v1_2", "call5_repoints_v1_2", "branch_merged_v1_2", "branch_small_letter_v1_2"];
const KEPT = ["rule", "receipt", "amendment", "receipt_v1_1", "amendment_v1_2", "receipt_v1_2"];
// the files receipt-v1.2 names among its outputs, each held to its pin
const V12_OUT = ["mend_v1_2", "bdb_mend_v1_2", "rows_added_v1_2", "picks_waiting_v1_2", "entry_gate_v1_2", "entry_gate_after_call5_v1_2", "call5_repoints_v1_2", "branch_merged_v1_2", "branch_small_letter_v1_2"];
// receipt-v1.2's cause for the one pick v1.2 adds where v1.1 had picks
const BROKEN_BAR = "a second variant behind a broken bar";
// how call 4 (relay v189) writes STEP's words where STEP reads one written word as two TAHOT words
const SPLIT = " | ";
// call 4's action where STEP's words are the line, and the rule the places of that category stand under
const STANDS_ACTION = "steps_words_are_the_line";
const STANDS_ACTIONS = new Set([STANDS_ACTION, "none"]);
export const STEPS_READING_STANDS_RULE_ID = "steps-reading-stands-rule-v1-where-step-spells-or-parts-the-word-otherwise-its-own-pick-1-is-the-line-credited-to-step";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");

class Refused extends Error {
  constructor(why) { super(Array.isArray(why) ? why.join("\n") : why); this.whys = Array.isArray(why) ? why : [why]; }
}

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const shardOf = (key) => sha256(Buffer.from(key, "utf8")).slice(0, 2);
const hasText = (s) => typeof s === "string" && s.length > 0;
const wordy = (s) => typeof s === "string" && /[\p{L}\p{N}]/u.test(s);
// a pick's words that are a line pick, for every source: a letter or a digit, and not «NO DATA YET»
const linePick = (s) => wordy(s) && s !== NO_DATA_YET;
// words that are only one angle-bracketed mark of STEP's («<obj.>»), counted where STEP's words may fill
const ANGLE_MARK = /^\s*<[^>]*>\s*$/u;
// a pill's reading as the card groups readings (readingKey): a closing stop dropped, case folded, and its "/"
// either a joint (a row's packing) or kept whole (a source's own words); two texts are one pill where either way
// reads them alike
const pillKeys = (t) => { const s = String(t).trim().replace(/\.$/u, "").toLowerCase(); return [s, s.split("/").map((x) => x.trim()).filter(Boolean).join(" + ")]; };
const samePill = (a, b) => { const [x1, x2] = pillKeys(a), [y1, y2] = pillKeys(b); return x1 === y1 || x2 === y2; };
// the rows a pill's pick names, as the corpus lane names them (its own source's rows that print its words where there
// are any, else every row under its key that prints them): a row of the pick's own source, another source's row
// only, or none; and apart, whether a row it names under a key the card asks at the place (the word's own, or one of
// its pieces') prints the pill's whole reading, and whether the card makes the pill (made: no row of the pill's own
// source that the store holds under a key the card asks prints it whole, so the card makes a row of the source's own
// words, credited to it)
const PRINTED = ["names_a_row_of_its_own_source", "names_another_sources_row_only", "names_no_row", "printed_whole_by_a_row_it_names", "made"];
// STEP's words as the line draws them at rest: the reading's printed form, its "/" a joint, under the signs switch at
// rest (signsOff: a piece that is a sign alone, beside pieces that carry words, is the hidden sign's gap)
const drawnStep = (t) => signsOff(printedForm(t));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const chars = (s) => [...s].length;
// numbers grouped by threes, the same on every machine (no locale)
export const n0 = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// a share as the page prints it: each from its own count, never a remainder
export const pct = (c, all) => {
  if (!all || c <= 0) return "0%";
  if (c >= all) return "100%";
  if (c * 1000 < all) return "<0.1%";
  if (c * 1000 >= 999 * all) return ">99.9%";
  return `${(Math.floor((1000 * c) / all) / 10).toFixed(1)}%`;
};
// the second source as the page works it out, every source on: the one that fills most of what x leaves,
// a tie to the earlier pill, none where every fill is 0
export const autoSecond = (fills, x) => {
  let best = null;
  for (const y of IDS) if (y !== x && fills[x][y] > 0 && (best === null || fills[x][y] > fills[x][best])) best = y;
  return best;
};
const tiedSecond = (fills, x, best) => !!best && IDS.some((y) => y !== x && y !== best && fills[x][y] === fills[x][best]);
const emptyFills = () => Object.fromEntries(IDS.map((x) => [x, Object.fromEntries(IDS.filter((y) => y !== x).map((y) => [y, 0]))]));
// rest_step: for each first and each second that is not STEP, the places both leave where STEP's line as it rests draws one
const emptyRestStep = () => Object.fromEntries(IDS.filter((x) => x !== "step").map((x) => [x, Object.fromEntries(IDS.filter((y) => y !== x && y !== "step").map((y) => [y, 0]))]));
const bucket = (k) => (k >= 3 ? "3+" : String(k));
const tally = (o, k) => { o[k] = (o[k] || 0) + 1; };
// a carried text: no replacement character, no control character but a line feed
const BAD_CHAR = /[\uFFFD\u0000-\u0009\u000B-\u001F\u007F-\u009F]/u;
const HEBREW = /[\u0590-\u05FF\uFB1D-\uFB4F]/u;
// what v1.2 may not change in a STEP pick where v1.1 has picks: its number, kind, entry, gloss and words, and
// a variant's letter and Hebrew (its rows, and a variant's word number and line, may change)
const stepCore = (x) => (Array.isArray(x) ? [x[0], x[1], x[2], x[3], x[4], x[1] === "v" && Array.isArray(x[6]) ? x[6].slice(0, 2) : null] : null);
// a variant behind a broken bar: of kind v, after a variant of the same TAHOT word number and line
const behindBrokenBar = (x, prev) => Array.isArray(x) && Array.isArray(prev) && x[1] === "v" && prev[1] === "v" && Array.isArray(x[6]) && Array.isArray(prev[6])
  && Number.isInteger(x[6][2]) && x[6][2] === prev[6][2] && hasText(x[6][3]) && x[6][3] === prev[6][3];
// a variant as v1.2 writes it: [letter, Hebrew, word number, line]
const variantShaped = (v) => Array.isArray(v) && v.length === 4 && hasText(v[0]) && typeof v[1] === "string" && Number.isInteger(v[2]) && hasText(v[3]);

export const bakeDefaultPicks = ({ ledger, zones, store, pinPath, records = join(K3, RESTING_DIR) }) => {
  const whys = [];
  const refuse = (why) => { if (whys.length < 200) whys.push(why); };

  // 1 · the pins, and the receipts naming the same bytes
  if (!existsSync(pinPath)) throw new Refused(`the pin ${pinPath} is not here`);
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  for (const k of PINNED) {
    const e = pin[k];
    if (!e || typeof e.file !== "string" || !Number.isInteger(e.bytes) || !/^[0-9a-f]{64}$/.test(e.sha256 || "")) throw new Refused(`the pin names no file, bytes and sha256 for ${k}`);
  }
  const at = (e) => join(ledger, e.file);
  const kept = KEPT.map((k) => ({ k, entry: pin[k], bytes: readPinned(at(pin[k]), pin[k]) }));
  const keptJson = (k) => JSON.parse(kept.find((x) => x.k === k).bytes.toString("utf8"));
  const r1 = keptJson("receipt"), r11 = keptJson("receipt_v1_1"), r12 = keptJson("receipt_v1_2");
  const names = (what, a, b) => {
    if (!a || !b || a.sha256 !== b.sha256 || a.bytes !== b.bytes || (Number.isInteger(a.lines) && Number.isInteger(b.lines) && a.lines !== b.lines))
      throw new Refused(`${what} names other bytes than the pin (${a ? `${a.bytes} bytes, ${a.sha256}` : "nothing"} against ${b.bytes} bytes, ${b.sha256})`);
  };
  const outOf = (r, e) => (r.outputs || []).find((o) => o && o.file === basename(e.file));
  names("receipt-v1's rule", r1.rule, pin.rule);
  names("receipt-v1's rows table", r1.rows_table, pin.rows);
  names("receipt-v1.1's rule amendment", r11.rule_amendment, pin.amendment);
  names("receipt-v1.1's receipt of v1", r11.v1 && r11.v1.receipt, pin.receipt);
  names("receipt-v1.1's rows table of v1", r11.v1 && r11.v1.rows_table, pin.rows);
  names("receipt-v1.1's mend", outOf(r11, pin.mend), pin.mend);
  names("receipt-v1.1's added rows", outOf(r11, pin.rows_added), pin.rows_added);
  const in12 = r12.inputs || {};
  names("receipt-v1.2's rule amendment", r12.rule_amendment, pin.amendment_v1_2);
  names("receipt-v1.2's receipt of v1", in12.v1_receipt, pin.receipt);
  names("receipt-v1.2's rows table of v1", in12.v1_rows_table, pin.rows);
  names("receipt-v1.2's receipt of v1.1", in12.v1_1_receipt, pin.receipt_v1_1);
  names("receipt-v1.2's mend of v1.1", in12.v1_1_step_mend, pin.mend);
  names("receipt-v1.2's added rows of v1.1", in12.v1_1_rows_added, pin.rows_added);
  for (const k of V12_OUT) names(`receipt-v1.2's ${basename(pin[k].file)}`, outOf(r12, pin[k]), pin[k]);
  // each table of added rows numbered on from the end of the tables before it
  const v11Rows = pin.rows.lines + pin.rows_added.lines;
  if (r1.rows_table.lines !== pin.rows.lines || outOf(r11, pin.rows_added).first_row_number !== pin.rows.lines || pin.rows_added.first_row_number !== pin.rows.lines) throw new Refused(`v1.1's added rows are not numbered on from the end of v1's table (${n0(pin.rows.lines)} lines)`);
  if (outOf(r12, pin.rows_added_v1_2).first_row_number !== v11Rows || pin.rows_added_v1_2.first_row_number !== v11Rows) throw new Refused(`v1.2's added rows are not numbered on from the end of v1.1's tables (${n0(v11Rows)} rows)`);
  // the places call 4 writes STEP's words with « | »: the list kept in this tree, held to its pin
  const hs = pin.held_split_v189;
  if (!hs || typeof hs.file !== "string" || !Number.isInteger(hs.bytes) || !/^[0-9a-f]{64}$/.test(hs.sha256 || "")) throw new Refused("the pin names no file, bytes and sha256 for held_split_v189, the corpus lane's call 4 (relay v189)");
  const call4 = readPinnedLines(join(dirname(pinPath), hs.file), hs);
  if (call4.some((d) => !d || typeof d.book !== "string" || typeof d.p !== "string" || !(d.steps_words === null || typeof d.steps_words === "string"))) throw new Refused(`${hs.file} has a line that is not {book, p, steps_words}`);
  const heldSplit = new Set(call4.filter((d) => typeof d.steps_words === "string" && d.steps_words.includes(SPLIT)).map((d) => `${d.book} ${d.p}`));
  // every place of call 4, by book and place, for its letters, its class and, where it stands, its words (the stands)
  const call4At = new Map();
  for (const [i, d] of call4.entries()) {
    if (!STANDS_ACTIONS.has(d.action)) throw new Refused(`${hs.file} line ${i + 1} names the action ${JSON.stringify(d.action)}, which this bake does not know (${[...STANDS_ACTIONS].join(", ")})`);
    if (typeof d.s !== "string" || !d.s) throw new Refused(`${hs.file} line ${i + 1} names no letters (s)`);
    if (d.action === STANDS_ACTION && typeof d.steps_words !== "string") throw new Refused(`${hs.file} line ${i + 1} makes STEP's words the line and names none`);
    const id = `${d.book} ${d.p}`;
    if (call4At.has(id)) throw new Refused(`${hs.file} names ${id} twice`);
    call4At.set(id, d);
  }
  const outputs = Array.isArray(r1.outputs) ? r1.outputs : [];
  if (!outputs.length || outputs.some((o) => !o || !/^[a-z0-9-]+\.jsonl$/.test(o.file || "") || !Number.isInteger(o.lines))) throw new Refused("receipt-v1 names no book files in outputs[]");
  const v1Dir = dirname(pin.receipt.file);

  // 2 · the rows: every row a pick names, found again in the served store by key, rank, source id and the
  // first 16 hex of its text's sha256
  const rows = [pin.rows, pin.rows_added, pin.rows_added_v1_2].flatMap((e) => readPinnedLines(at(e), e));
  rows.forEach((r, i) => {
    if (!Array.isArray(r) || typeof r[0] !== "string" || !Number.isInteger(r[1]) || typeof r[2] !== "string" || !/^[0-9a-f]{16}$/.test(r[3] || "")) throw new Refused(`row ${n0(i)} of the rows tables is not [key, rank, source id, sha16]`);
  });
  // a row as the lists beside the picks name it, [key, rank, source id, sha16], to its number
  const rowNumber = new Map(rows.map((r, i) => [JSON.stringify(r), i]));
  const storeIx = JSON.parse(readFileSync(join(store, "index.json"), "utf8"));
  const mSources = storeIx.m_sources || {};
  for (const s of SOURCES) for (const m of new Set(typeof s.m === "string" ? [s.m] : Object.values(s.m))) {
    if (!mSources[m]) throw new Refused(`the served store names no source ${m}, which the ${s.pill} pill credits`);
  }
  const rowM = new Array(rows.length).fill(null);
  // each row's text as the card prints it (made spaces closed), for what prints a pill's words (picks_printed)
  const rowText = new Array(rows.length).fill(null);
  // every row the store holds under a key, as [its source id, its text as the card prints it], kept for every key of
  // a shard once the shard is read: what a key the card asks at a place prints (picks_printed)
  const printedUnder = new Map(), shardsRead = new Set();
  const shardBody = (sh) => { const p = join(store, "shards", `${sh}.bin`); return existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : {}; };
  const readShard = (sh) => {
    const served = shardBody(sh);
    if (!shardsRead.has(sh)) {
      shardsRead.add(sh);
      for (const [k, list] of Object.entries(served)) printedUnder.set(k, (Array.isArray(list) ? list : []).filter((x) => Array.isArray(x) && typeof x[1] === "string").map((x) => [x[3], routePrinted(x)]));
    }
    return served;
  };
  const servedUnder = (key) => { const sh = shardOf(key); if (!shardsRead.has(sh)) readShard(sh); return printedUnder.get(key) || []; };
  const byShard = new Map();
  rows.forEach((r, i) => { const sh = shardOf(r[0]); if (!byShard.has(sh)) byShard.set(sh, []); byShard.get(sh).push(i); });
  const missing = new Map();   // row number -> places naming it (up to 5)
  const doubles = [];
  let foundOnce = 0;
  const rowsUnder = (served, [key, rank, m, h]) => (served[key] || []).filter((x) => Array.isArray(x) && x[0] === rank && x[3] === m && typeof x[1] === "string" && sha256(Buffer.from(x[1], "utf8")).slice(0, 16) === h);
  const notAsNamed = [];
  for (const sh of [...byShard.keys()].sort()) {
    const served = readShard(sh);
    for (const i of byShard.get(sh)) {
      const m = rows[i][2];
      const found = rowsUnder(served, rows[i]);
      if (!found.length) { notAsNamed.push(i); continue; }
      if (!mSources[m]) { refuse(`row ${n0(i)} is served under ${m}, which the store's m_sources does not name`); continue; }
      if (found.length > 1) doubles.push({ row: i, m, rank: rows[i][1], found: found.length, one_text: found.every((x) => x[1] === found[0][1]) });
      else foundOnce += 1;
      rowM[i] = m;
      rowText[i] = routePrinted(found[0]);
    }
  }
  // THE ROWS FOLLOWED: a row not found as named is asked of the row-strikes record, from the store v1.2 read
  let follow;
  try { follow = openFollower({ data: dirname(store), index: storeIx, readAt: ((in12.page_store || {}).store_version) || null }); }
  catch (e) { if (e instanceof FollowFault) throw new Refused(e.message); throw e; }
  const followedTo = new Map(), retextedTo = new Map(), struckSince = new Map(), withheldSince = new Map();   // row number -> the follower's answer
  const refCount = new Int32Array(rows.length);   // how many picks name each row, counted in the pass below
  const namedAt = new Map();                      // a struck row -> the first places naming it
  {
    const cache = new Map();
    const served = (key) => { const sh = shardOf(key); if (!cache.has(sh)) cache.set(sh, shardBody(sh)); return cache.get(sh); };
    for (const i of notAsNamed) {
      let went;
      try { went = follow.nowOf(rows[i]); } catch (e) { if (e instanceof FollowFault) throw new Refused(e.message); throw e; }
      if (went.state === "struck") { struckSince.set(i, went); namedAt.set(i, []); continue; }
      if (went.state === "withheld") { withheldSince.set(i, went); continue; }
      // a row moved to another key, or given other words, is found under the name it has now
      const found = went.state === "re-keyed" || went.state === "retexted" ? rowsUnder(served(went.name[0]), went.name) : [];
      if (found.length !== 1) { missing.set(i, []); continue; }   // the record says nothing of it, or the store does not hold it where the record says
      (went.state === "retexted" ? retextedTo : followedTo).set(i, went);
      rowM[i] = rows[i][2];
      // its text as the card prints it (made spaces closed), as a row found as named is read above
      rowText[i] = routePrinted(found[0]);
    }
  }

  // 3 · the mends: the whole step (or bdb) array of each listed place, v1.1's over v1 and v1.2's over v1.1
  const mendOf = (e, slot, what) => {
    const m = new Map();
    readPinnedLines(at(e), e).forEach((d, i) => {
      if (!d || typeof d.book !== "string" || typeof d.p !== "string" || !Array.isArray(d[slot])) { refuse(`${what} line ${i + 1} names no book, place and ${slot} picks`); return; }
      const id = `${d.book} ${d.p}`;
      if (m.has(id)) refuse(`${what} names ${id} twice`);
      m.set(id, { book: d.book, picks: d[slot], used: false });
    });
    return m;
  };
  const mends = [mendOf(pin.mend, "step", "v1.1's STEP mend"), mendOf(pin.mend_v1_2, "step", "v1.2's STEP mend"), mendOf(pin.bdb_mend_v1_2, "bdb", "v1.2's BDB mend")];
  const [mend11, mend12, bdbMend] = mends;

  // 3b · the lists beside v1.2's picks, each held to the picks at its place in the pass below
  const listOf = (k) => readPinnedLines(at(pin[k]), pin[k]);
  const waiting = listOf("picks_waiting_v1_2"), gate = listOf("entry_gate_v1_2"), gate5 = listOf("entry_gate_after_call5_v1_2"), repoints = listOf("call5_repoints_v1_2");
  const branches = { merged: listOf("branch_merged_v1_2"), small_letter: listOf("branch_small_letter_v1_2") };
  const listed = new Map();   // book and place -> { waiting, gate, gate5, book, used }
  const listAt = (what, d, i) => {
    if (!d || typeof d.book !== "string" || typeof d.p !== "string") { refuse(`${what} line ${i + 1} names no book and place`); return null; }
    const id = `${d.book} ${d.p}`;
    if (!listed.has(id)) listed.set(id, { waiting: [], gate: [], gate5: [], book: d.book, used: false });
    return listed.get(id);
  };
  waiting.forEach((d, i) => { const l = listAt("the waiting list", d, i); if (l) l.waiting.push(d); });
  gate.forEach((d, i) => { const l = listAt("the entry gate's list", d, i); if (l) l.gate.push(d); });
  gate5.forEach((d, i) => { const l = listAt("the entry gate's list after the re-points", d, i); if (l) l.gate5.push(d); });
  for (const [name, list] of Object.entries(branches)) list.forEach((d, i) => { if (!d || d.rests !== "off") refuse(`the ${name} branch's line ${i + 1} does not rest off: no branch is baked`); });
  const rowsOf = (list) => (Array.isArray(list) ? list.map((r) => rows[r] || null) : null);
  const lists = {
    waiting: { by_status: {}, first_picks: 0, waits_for_call5_rekey: { picks: 0, rows: 0, rows_now_under_their_plain_key: 0, picks_whose_row_now_stands_under_its_plain_key: 0 } },
    gate: { active: 0, stale: 0, by_bake: {}, by_class: {}, until_row_entries_v1_1_lands: 0 },
    gate5: { by_cause: {} },
    repoints: { lines: repoints.length, by_class: {}, references_by_class: {}, to_none: 0, rows_as_v1_2_read_them: 0, rows_struck_since: 0, rows_re_keyed_since: 0 },
  };
  const asks = (name) => { try { return follow.nowOf(name); } catch (e) { if (e instanceof FollowFault) throw new Refused(e.message); throw e; } };
  repoints.forEach((d, i) => {
    if (!d || typeof d.class !== "string" || !Number.isInteger(d.references)) { refuse(`call 5's re-point line ${i + 1} names no class and references`); return; }
    tally(lists.repoints.by_class, d.class);
    lists.repoints.references_by_class[d.class] = (lists.repoints.references_by_class[d.class] || 0) + d.references;
    if (d.to === null) lists.repoints.to_none += 1;
    else if (!rowNumber.has(JSON.stringify(d.to))) refuse(`call 5's re-point line ${i + 1} points to a row the rows tables do not hold`);
    // the row is as v1.2 read it, or went where its line says: struck where the line gives a row to point to, moved where it gives none
    if (!Array.isArray(d.row)) { refuse(`call 5's re-point line ${i + 1} names no row`); return; }
    const went = asks(d.row);
    if (went.state === "served") lists.repoints.rows_as_v1_2_read_them += 1;
    else if (went.state === "struck" && d.to !== null) { lists.repoints.rows_struck_since += 1; if (rowM[rowNumber.get(JSON.stringify(d.to))] === null) refuse(`call 5's re-point line ${i + 1} points to a row the served store does not hold`); }
    else if (went.state === "re-keyed" && d.to === null && went.name[0] === d.to_key) lists.repoints.rows_re_keyed_since += 1;
    else refuse(`call 5's re-point line ${i + 1} is not borne out by the row-strikes record: its row was ${went.state}${went.state === "re-keyed" ? " to another key than the line names" : ""}, and the line ${d.to === null ? "says it moves to the plain key" : "gives a row to point to"}`);
  });
  // the picks that wait on call 5's re-key: each names a row still under its key with a maqaf, or one that now stands under the plain key its line names
  {
    const W = lists.waiting.waits_for_call5_rekey, all = new Set(), moved = new Set();
    waiting.forEach((x, i) => {
      if (!x || x.status !== "WAITS_FOR_CALL5_REKEY") return;
      if (!Array.isArray(x.call5_row) || typeof x.to_key !== "string") { refuse(`the waiting list's line ${i + 1} waits on call 5's re-key and names no row and key`); return; }
      W.picks += 1;
      const id = JSON.stringify(x.call5_row), went = asks(x.call5_row);
      all.add(id);
      if (went.state === "served") return;
      if (went.state !== "re-keyed" || went.name[0] !== x.to_key) { refuse(`the waiting list's line ${i + 1} waits on call 5's re-key, and its row was ${went.state}${went.state === "re-keyed" ? " to another key than the line names" : ""}`); return; }
      moved.add(id);
      W.picks_whose_row_now_stands_under_its_plain_key += 1;
    });
    W.rows = all.size;
    W.rows_now_under_their_plain_key = moved.size;
  }

  // 4 · per book, in the order receipt-v1 lists them
  const recordWords = new Map();   // BDB record -> its highlighted words as first read (refusal 6)
  const perPlace = Object.fromEntries(IDS.map((s) => [s, {}]));
  const tallyPlace = (s, k) => tally(perPlace[s], bucket(k));
  const mend11Count = { places: 0, unchanged: 0, changed: { v: 0, a: 0 }, merged: { v: 0, a: 0 } };
  const mend12Count = { places: 0, gained: { places: 0, picks: { r: 0, v: 0, a: 0 } }, broken_bar: 0 };
  const bdbMendCount = { places: 0, picks_before: 0, picks_after: 0 };
  const kinds = { v1: { r: 0, v: 0, a: 0 }, v1_1: { r: 0, v: 0, a: 0 }, v1_2: { r: 0, v: 0, a: 0 } };
  const noStepPick = { v1_1: 0, v1_2: 0 };
  const C = {
    kq: 0, step_pick1_not_r: 0, step_words_empty_string: 0, step_picks_without_words: 0, readings_naming_no_row: 0,
    sign_only_pick1: { step: {}, macula: {}, ubs: {}, bdb: {} }, ubs_no_data_yet_pick1: 0, ubs_no_data_yet_picks: 0,
    bdb_pick1_without_highlight: 0, bdb_picks_without_highlight: 0,
    line_feeds: [], hebrew_in_texts: { step: 0, macula: 0, ubs: 0, bdb: 0 },
  };
  const stepWordsC = { count: 0, naming_no_row: 0, by_waiting_status: {}, entry_gate: {}, entry_gate_after_call5: 0, angle_mark_only: 0,
    held_split: { listed: heldSplit.size, held: 0, places: [] } };
  // call 4's places, by the class the bake reads at each (STEPS_READING_STANDS_RULE_ID)
  const standsC = { listed: call4At.size, met: 0, letters_equal: 0, by_class: { stands: 0, read_form_of_several_words: 0, held_split: 0, none: 0 },
    stands: { places: 0, plain_words: 0, pairs: 0, whose_place_pieces_answer: 0, words_equal: 0, were_bare_before: 0 } };
  const linePicks = Object.fromEntries(IDS.map((s) => [s, { picks: 0, naming_no_row: 0, first_row_another_sources: 0, first_row_by_m: {} }]));
  const slashes = { macula: 0, ubs: 0, bdb: 0 };
  // BDB's line is its record's highlighted words and « · sense N»; bdb_words counts the highlighted words alone
  const long = Object.fromEntries(["macula", "ubs", "bdb", "bdb_words"].map((s) => [s, { over: 0, longest: 0, longest_at: null }]));
  // where STEP has a pick and its line as it rests is bare (a pair, or a place call 4 writes with « | »), and the
  // records of the resting lines that say so
  const restsBare = { pair: 0, held_split: 0, places: [] };
  const recordsRead = { read: 0, of_the_zone_on_disk: 0, of_another_zone: [] };
  // the lines at rest over more than one word, and which of them each source reads at every word
  const runs = { lines: 0, words: 0, by_source: Object.fromEntries(IDS.map((s) => [s, { every_word: 0, some_words: 0, no_word: 0 }])) };
  // a pill by the rows its pick names (PRINTED): [0 its own source's, 1 another source's only, 2 none; whether one of
  // them under a key the card asks (`keys`: the word's own, its pieces') prints the pill's whole reading; and whether
  // the card makes it: no row of the pill's own source under those keys prints it whole]
  const pillOf = (txt, list, own, keys) => {
    // a row the store no longer serves (a round withheld it since) prints nothing: the pill stands on the pick's other rows
    const rs = (Array.isArray(list) ? list : []).filter((r) => Number.isInteger(r) && r >= 0 && r < rows.length && rowM[r] !== null);
    return [!rs.length ? 2 : rs.some((r) => rowM[r] === own) ? 0 : 1,
      rs.some((r) => keys.includes(rows[r][0]) && typeof rowText[r] === "string" && samePill(rowText[r], txt)) ? 1 : 0,
      keys.some((k) => servedUnder(k).some(([m, t]) => m === own && samePill(t, txt))) ? 0 : 1];
  };
  // per first source, its pills and its second's where the line is theirs, by what prints their words
  const picksPrinted = Object.fromEntries(IDS.map((x) => [x, {}]));
  const books = [];
  // THE WORDS A SOURCE'S LINE READS (default-spans-rule-v1): the corpus lane's spans list, where this tree pins it,
  // read beside the default picks only as the bytes its pin names
  const spansPin = join(dirname(pinPath), "spans-v1", "PIN.json");
  let spansRead = null;
  try { spansRead = readDefaultSpans(spansPin, ledger); } catch (e) { if (e instanceof PinFault) throw new Refused(`the spans list: ${e.message}`); throw e; }
  const spanCount = Object.fromEntries(SPAN_SOURCES.map((x) => [x, { lines: 0, units: 0, words: 0, nested: 0, filed_beside: 0, filed_with_a_line: 0 }]));

  for (const o of outputs) {
    const book = o.file.replace(/\.jsonl$/, "");
    const lines = readPinnedLines(join(ledger, v1Dir, o.file), o);
    const zp = join(zones, `${book}.bin`);
    if (!existsSync(zp)) { refuse(`${book}: the ledger has ${n0(lines.length)} places and the zones hold no ${book}.bin`); continue; }
    const zoneBytes = readFileSync(zp);
    const zone = JSON.parse(gunzipSync(zoneBytes).toString("utf8"));
    const entries = [];
    (zone.sections || []).forEach((sec, si) => {
      let k = 0;
      (sec.words || []).forEach((w, ei) => entries.push(w && w.mark ? null : { w, label: `${sec.label}:${++k}`, si, ei }));
    });
    const placeAt = [];
    entries.forEach((e, i) => { if (e) placeAt.push(i); });
    if (placeAt.length !== lines.length) { refuse(`${book}: the zone has ${n0(placeAt.length)} words and the ledger ${n0(lines.length)} places`); continue; }
    const off = lines.findIndex((d, i) => !d || d.p !== entries[placeAt[i]].label);
    if (off >= 0) { refuse(`${book}: ledger line ${off + 1} is place ${lines[off] && lines[off].p} and the zone's word there is ${entries[placeAt[off]].label}`); continue; }
    // the page's own record of the line at rest: whether a line of it stands over an entry of a section
    const recPath = join(records, `${book}.json.gz`);
    const restRec = readRecord(recPath);
    if (!restRec) { refuse(`${book}: no record of its resting lines (${relative(K3, recPath).split("\\").join("/")}): where STEP's line as it rests is bare is read off it, never guessed (tools/bake-resting-lines-v1.mjs reads the lines)`); continue; }
    const zs = zone.sections || [];
    if (!Array.isArray(restRec.sections) || restRec.sections.length !== zs.length || restRec.sections.some((s, i) => !Array.isArray(s) || !Array.isArray(s[1]) || String(s[0]) !== String(zs[i].label))) {
      refuse(`${book}: its record of the resting lines is not of the zone's sections (${Array.isArray(restRec.sections) ? restRec.sections.length : 0} in the record, ${zs.length} in the zone)`);
      continue;
    }
    recordsRead.read += 1;
    if (((restRec.read_off || {}).files || {})[`data/zones/${book}.bin`] === sha256(zoneBytes)) recordsRead.of_the_zone_on_disk += 1;
    else recordsRead.of_another_zone.push(book);
    const underALine = (si, ei) => restRec.sections[si][1].some((u) => Array.isArray(u) && ei >= u[0] && ei < u[0] + u[1]);
    // the record's line over a word, or null
    const lineOver = (si, ei) => restRec.sections[si][1].find((u) => Array.isArray(u) && ei >= u[0] && ei < u[0] + u[1]) || null;
    // per place, what the tallies after the pass need: which sources have a line, whether STEP's words may fill it,
    // and what prints each source's pills there (pick 1, then picks 2..n with words)
    const lineBits = new Uint8Array(entries.length);
    // each source's first pick at a place, by the id its ledger gives it (a span line is proved to be that pick)
    const firstPick = new Array(entries.length).fill(null);
    const stepWordsAt = new Uint8Array(entries.length);
    const pillsAt = new Array(entries.length).fill(null);

    const places = new Array(entries.length).fill(null);
    const bdbWords = [];
    const bdbAt = new Map();   // record -> its one-based index in bdb_words
    const has = Object.fromEntries(IDS.map((s) => [s, 0]));
    const fills = emptyFills();
    const restStep = emptyRestStep();
    const leaves = [];
    const leafLabels = [];
    const stepWords = [];
    const answered = [];
    let kq = 0;
    const mendPlaces = { step_v1_1: 0, step_v1_2: 0, bdb_v1_2: 0 };
    const text = (s, src, where) => {
      if (typeof s !== "string") return;
      if (BAD_CHAR.test(s)) refuse(`${book} ${where}: a ${PILL[src]} text holds U+FFFD or a control character other than a line feed`);
      if (s.includes("\n")) C.line_feeds.push([book, where, PILL[src]]);
      if (HEBREW.test(s)) C.hebrew_in_texts[src] += 1;
    };
    const rowsNamed = (list, where) => {
      if (!Array.isArray(list)) { refuse(`${book} ${where}: a pick's rows are not a list`); return []; }
      for (const r of list) {
        if (!Number.isInteger(r) || r < 0 || r >= rows.length) { refuse(`${book} ${where}: a pick names row ${r}, which the rows tables do not hold`); continue; }
        if (missing.has(r) && missing.get(r).length < 5) missing.get(r).push(`${book} ${where}`);
        refCount[r] += 1;
        if (namedAt.has(r) && namedAt.get(r).length < 3) namedAt.get(r).push(`${book} ${where}`);
      }
      return list;
    };
    const countLinePick = (src, own, list) => {
      const c = linePicks[src];
      c.picks += 1;
      if (!list.length) { c.naming_no_row += 1; return; }
      const m = rowM[list[0]];
      if (m && m !== own) { c.first_row_another_sources += 1; tally(c.first_row_by_m, m); }
    };
    const printed = (src, s, where) => {
      if (src in slashes && s.includes("/")) slashes[src] += 1;
      const L = chars(s), x = long[src];
      if (L > LONG) x.over += 1;
      if (L > x.longest) { x.longest = L; x.longest_at = `${book} ${where}`; }
    };
    const signOnly = (src, t) => { if (hasText(t) && !wordy(t)) tally(C.sign_only_pick1[src], t); };

    for (let i = 0; i < lines.length; i += 1) {
      const d = lines[i];
      const { w, label, si, ei } = entries[placeAt[i]];
      const n = placeAt[i] + 1;
      const id = `${book} ${label}`;
      const isKq = !!w.kq;
      if (isKq) { kq += 1; C.kq += 1; }

      // STEP: v1's picks, then v1.1's where it lists the place, then v1.2's
      const v1Step = Array.isArray(d.step) ? d.step : [];
      if (d.step != null && !Array.isArray(d.step)) refuse(`${book} ${label}: STEP's picks are not a list`);
      for (const x of v1Step) if (Array.isArray(x) && x[1] in kinds.v1) kinds.v1[x[1]] += 1;
      tallyPlace("step", v1Step.length);
      let st = v1Step;
      const m11 = mend11.get(id);
      if (m11) {
        m11.used = true;
        mendPlaces.step_v1_1 += 1;
        mend11Count.places += 1;
        st = m11.picks;
        if (same(st, v1Step)) mend11Count.unchanged += 1;
        const rOf = (list) => list.filter((x) => Array.isArray(x) && x[1] === "r");
        if (!same(rOf(st), rOf(v1Step))) refuse(`${book} ${label}: v1.1's mend changes a pick of kind r`);
        // v1's picks of kind v and a, each found again in the mended list in order by kind and entry: one not
        // found fell together with another; one found with other words, rows or meaning was changed
        let j = 0;
        for (const x of v1Step) {
          if (!Array.isArray(x) || x[1] === "r") continue;
          let k = j;
          while (k < st.length && !(Array.isArray(st[k]) && st[k][1] === x[1] && st[k][2] === x[2])) k += 1;
          if (k >= st.length) { if (x[1] in mend11Count.merged) mend11Count.merged[x[1]] += 1; continue; }
          if (!same(x.slice(1), st[k].slice(1)) && x[1] in mend11Count.changed) mend11Count.changed[x[1]] += 1;
          j = k + 1;
        }
      }
      for (const x of st) if (Array.isArray(x) && x[1] in kinds.v1_1) kinds.v1_1[x[1]] += 1;
      if (!st.length) noStepPick.v1_1 += 1;
      const m12 = mend12.get(id);
      if (m12) {
        m12.used = true;
        mendPlaces.step_v1_2 += 1;
        mend12Count.places += 1;
        const was = st;
        st = m12.picks;
        if (!was.length) {
          mend12Count.gained.places += 1;
          for (const x of st) if (Array.isArray(x) && x[1] in mend12Count.gained.picks) mend12Count.gained.picks[x[1]] += 1;
        } else {
          const k = was.findIndex((x, j) => !same(stepCore(x), stepCore(st[j])));
          if (k >= 0) refuse(`${book} ${label}: v1.2's mend changes STEP pick ${k + 1}'s number, kind, entry, gloss, words or variant (only its rows and a variant's word number and line may change)`);
          for (let j = was.length; j < st.length; j += 1) {
            if (behindBrokenBar(st[j], st[j - 1])) mend12Count.broken_bar += 1;
            else refuse(`${book} ${label}: v1.2's mend adds STEP pick ${j + 1}, which is not a variant behind a broken bar`);
          }
        }
      }
      if (!st.length) noStepPick.v1_2 += 1;
      const stepSlot = [];
      st.forEach((x, k) => {
        if (!Array.isArray(x) || x[0] !== k + 1) { refuse(`${book} ${label}: STEP's picks are not numbered 1 to ${st.length}`); return; }
        if (!(x[1] in KIND)) { refuse(`${book} ${label}: STEP pick ${k + 1} is of kind ${x[1]}, not r, v or a`); return; }
        kinds.v1_2[x[1]] += 1;
        const words = x[4];
        if (words === "") C.step_words_empty_string += 1;
        if (!hasText(words)) C.step_picks_without_words += 1;
        text(words, "step", label);
        const item = [KIND[x[1]], hasText(words) ? words : 0];
        if (x[1] === "v") {
          if (!variantShaped(x[6])) { refuse(`${book} ${label}: STEP pick ${k + 1} is a meaning variant without its [letter, Hebrew, word number, line]`); return; }
          item.push(x[6][0]);
        }
        const named = rowsNamed(x[5], label);
        if (x[1] === "r" && hasText(words) && !named.length) C.readings_naming_no_row += 1;
        stepSlot.push(item);
      });
      if (st.length && st[0][1] !== "r") C.step_pick1_not_r += 1;
      if (st.length) signOnly("step", st[0][4]);
      const stepPick1 = st.length > 0 && linePick(st[0][4]);
      const pg = Array.isArray(w.pg) ? w.pg : [];
      const pgAnswers = pg.length > 0 && pg.every((x) => String((x && x.g) || "").trim() !== "");

      // the lists beside v1.2's picks, held to the picks at this place
      const L = listed.get(id);
      if (L) {
        L.used = true;
        for (const x of L.waiting) {
          const p = st[x.n - 1];
          if (!p || p[1] !== "r" || p[2] !== x.entry || p[4] !== x.words || (Array.isArray(p[5]) && p[5].length)) refuse(`${book} ${label}: the waiting list's pick ${x.n} is not a STEP reading of v1.2 with its entry and words naming no row`);
          tally(lists.waiting.by_status, String(x.status));
          if (x.n === 1) lists.waiting.first_picks += 1;
        }
        for (const x of L.gate) {
          const p = st.find((y) => Array.isArray(y) && y[1] === "r" && y[2] === x.entry && y[4] === x.words);
          const stale = /^none/u.test(String(x.bake));
          const withheld = (x.withheld_rows || []).map((r) => rowNumber.get(JSON.stringify(r)));
          const namesWithheld = !!p && withheld.some((r) => r !== undefined && (p[5] || []).includes(r));
          if (!p || (stale ? namesWithheld || !same(rowsOf(p[5]), x.rows_now) : !namesWithheld)) refuse(`${book} ${label}: the entry gate's ${stale ? "stale" : "active"} line for ${x.entry} is not borne out by v1.2's pick (${stale ? "the rows it names now" : "its withheld row"})`);
          tally(lists.gate.by_bake, String(x.bake));
          tally(lists.gate.by_class, String(x.class));
          if (stale) lists.gate.stale += 1; else lists.gate.active += 1;
          if (x.until_row_entries_v1_1_lands) lists.gate.until_row_entries_v1_1_lands += 1;
        }
        for (const x of L.gate5) {
          const p = st[x.n - 1];
          if (!p || p[2] !== x.entry || p[4] !== x.words || !same(rowsOf(p[5]), x.v1_2_rows)) refuse(`${book} ${label}: the entry gate's line after the re-points for pick ${x.n} is not v1.2's pick with the rows it names`);
          tally(lists.gate5.by_cause, String(x.cause));
        }
      }

      // MACULA: one pick, its pieces' words joined by a space, carried as given
      const mac = d.macula;
      if (mac != null && !(Array.isArray(mac) && Array.isArray(mac[1]))) refuse(`${book} ${label}: MACULA's pick is not [words, pieces]`);
      tallyPlace("macula", mac ? 1 : 0);
      const macWords = mac && hasText(mac[0]) ? mac[0] : null;
      if (macWords) { text(macWords, "macula", label); signOnly("macula", macWords); }
      const macRows = mac && Array.isArray(mac[1]) ? mac[1].flatMap((pc) => rowsNamed(Array.isArray(pc) ? pc[3] : null, label)) : [];

      // UBS: picks piece by piece, each piece's numbered from 1
      if (d.ubs != null && !Array.isArray(d.ubs)) refuse(`${book} ${label}: UBS's pieces are not a list`);
      const pieces = Array.isArray(d.ubs) ? d.ubs : [];
      const ubsPicks = [], ubsParts = [], ubsRows = [];
      // receipt-v1 counts a place's UBS picks as its fullest piece's, since UBS numbers them within each piece
      let ubsMost = 0;
      pieces.forEach((pc, pi) => {
        const picks = Array.isArray(pc) && Array.isArray(pc[2]) ? pc[2] : null;
        if (!picks) { refuse(`${book} ${label}: UBS piece ${pi + 1} holds no list of picks`); return; }
        picks.forEach((x, k) => {
          if (!Array.isArray(x) || x[0] !== k + 1) { refuse(`${book} ${label}: UBS's picks of piece ${pi + 1} are not numbered 1 to ${picks.length}`); return; }
          if (x[2] === NO_DATA_YET) C.ubs_no_data_yet_picks += 1;
          text(x[2], "ubs", label);
          rowsNamed(x[3], label);
          ubsPicks.push([pi, hasText(x[2]) ? x[2] : 0]);
        });
        ubsMost = Math.max(ubsMost, picks.length);
        if (!picks.length || !Array.isArray(picks[0])) return;
        const t = picks[0][2];
        if (t === NO_DATA_YET) C.ubs_no_data_yet_pick1 += 1;
        signOnly("ubs", t);
        if (linePick(t)) { ubsParts.push(t); ubsRows.push(...(Array.isArray(picks[0][3]) ? picks[0][3] : [])); }
      });
      tallyPlace("ubs", ubsMost);
      const ubsLine = ubsParts.length ? ubsParts.join(" + ") : null;

      // BDB: its records' meanings, each with the record's highlighted words; v1.2's array where it lists the place
      if (d.bdb != null && !Array.isArray(d.bdb)) refuse(`${book} ${label}: BDB's picks are not a list`);
      let b = Array.isArray(d.bdb) ? d.bdb : [];
      tallyPlace("bdb", b.length);
      const bm = bdbMend.get(id);
      if (bm) {
        bm.used = true;
        mendPlaces.bdb_v1_2 += 1;
        bdbMendCount.places += 1;
        bdbMendCount.picks_before += b.length;
        b = bm.picks;
        bdbMendCount.picks_after += b.length;
      }
      const bdbSlot = [];
      const senseOf = (x) => (x[2] === THE_ENTRY ? "" : (POINT.exec(String(x[2])) || [])[1]);
      b.forEach((x, k) => {
        if (!Array.isArray(x) || x[0] !== k + 1) { refuse(`${book} ${label}: BDB's picks are not numbered 1 to ${b.length}`); return; }
        const sense = senseOf(x);
        if (sense === undefined) { refuse(`${book} ${label}: BDB pick ${k + 1}'s meaning is neither point<p>:<marker>. nor "${THE_ENTRY}"`); return; }
        const rec = String(x[1]);
        if (!recordWords.has(rec)) recordWords.set(rec, x[5]);
        else if (!same(recordWords.get(rec), x[5])) refuse(`${book} ${label}: BDB record ${rec} has other highlighted words here than at another of its picks`);
        rowsNamed(x[4], label);
        let wi = 0;
        if (hasText(x[5])) {
          text(x[5], "bdb", label);
          if (!bdbAt.has(rec)) { bdbWords.push(x[5]); bdbAt.set(rec, bdbWords.length); }
          wi = bdbAt.get(rec);
        } else C.bdb_picks_without_highlight += 1;
        bdbSlot.push([sense, wi]);
      });
      if (b.length && !hasText(b[0][5])) C.bdb_pick1_without_highlight += 1;
      if (b.length) signOnly("bdb", b[0][5]);

      // the one counting rule. STEP has a pick where its pick 1 is a line pick or the place pieces answer; it has a
      // line where the line as it rests draws one too: at a pair, or a place call 4 writes with « | », its own words
      // are never drawn, and where the pieces do not answer and no line of the record stands over the word, today's
      // line there is bare and so is STEP's (THE LINE AS IT RESTS)
      const stepPicks = stepPick1 || pgAnswers;
      const isHeld = heldSplit.has(`${book} ${label}`);
      // call 4 at this place: its letters are the zone word's, and its class (STEP'S OWN READING STANDS)
      const c4 = call4At.get(id) || null;
      let isStands = false;
      if (c4) {
        standsC.met += 1;
        if (w.s !== c4.s) refuse(`${book} ${label}: call 4 names this place by letters the zone word does not carry`);
        else standsC.letters_equal += 1;
        const readsSeveral = !!(w.kq && Number(w.kq.words_read) > 1);
        const cls = c4.action !== STANDS_ACTION ? "none" : readsSeveral ? "read_form_of_several_words" : c4.steps_words.includes(SPLIT) ? "held_split" : "stands";
        standsC.by_class[cls] += 1;
        if (cls === "stands") {
          isStands = true;
          if (!(st.length && st[0][4] === c4.steps_words)) refuse(`${book} ${label}: STEP's reading stands here (call 4), and STEP's pick 1 after the mends is not call 4's words byte for byte`);
          else standsC.stands.words_equal += 1;
          standsC.stands.places += 1;
          standsC.stands[isKq ? "pairs" : "plain_words"] += 1;
          if (pgAnswers) standsC.stands.whose_place_pieces_answer += 1;
          if (stepPick1 && !pgAnswers && (isKq || isHeld) && !underALine(si, ei)) standsC.stands.were_bare_before += 1;
        }
      }
      // a place where STEP's reading stands never rests bare: its own words are drawn there, a pair among them
      const stepRestsBare = stepPick1 && !pgAnswers && (isKq || isHeld) && !isStands && !underALine(si, ei);
      if (stepRestsBare) {
        restsBare[isKq ? "pair" : "held_split"] += 1;
        restsBare.places.push({ book, place: label, n, why: isKq ? "a pair: its line keeps today's, which is bare" : "call 4 writes STEP's words here with « | »: held, and today's line is bare" });
      }
      const line = {
        step: stepPicks && !stepRestsBare,
        macula: !isKq && linePick(macWords),
        ubs: !isKq && !!ubsLine,
        bdb: !isKq && b.length > 0 && Array.isArray(b[0]) && linePick(b[0][5]) && senseOf(b[0]) !== undefined,
      };
      for (const x of IDS) {
        if (line[x]) { has[x] += 1; continue; }
        // where STEP's line rests bare its second fills nothing (it fills the places STEP leaves, and only them)
        if (x === "step" && stepRestsBare) continue;
        for (const y of IDS) if (y !== x && line[y]) fills[x][y] += 1;
        // what x and its second y both leave, STEP's line still reads (STEP the last to fill out)
        if (x !== "step" && line.step) for (const y of IDS) if (y !== x && y !== "step" && !line[y]) restStep[x][y] += 1;
      }
      lineBits[n - 1] = IDS.reduce((a, x, j) => a | (line[x] ? 1 << j : 0), 0);
      const bdbLine = line.bdb ? [senseOf(b[0]), b[0][5]] : 0;
      if (!stepPicks && !isKq) {
        leaves.push([n, line.macula ? macWords : 0, line.ubs ? ubsLine : 0, bdbLine]);
        leafLabels.push(label);
      }
      // what prints each source's pills here, where its line is printed: pick 1 (UBS's line of its pieces' pick 1s,
      // BDB's words with the sense's number), then picks 2..n with words (UBS's numbered in each piece)
      // the keys the card asks at this place: the word's own and its pieces'
      const keys = [...new Set([w.k, ...pg.map((x) => x && x.k)].filter(hasText))];
      const tally4 = (list) => { const t = [0, 0, 0, 0, 0]; for (const [txt, rws, own] of list) { const [c, whole, made] = pillOf(txt, rws, own, keys); t[c] += 1; t[3] += whole; t[4] += made; } return t; };
      const stepMore = st.slice(1).filter((x) => Array.isArray(x) && hasText(x[4])).map((x) => [x[4], x[5], OWN_M[x[1]]]);
      const ubsMore = [];
      pieces.forEach((pc) => (Array.isArray(pc) && Array.isArray(pc[2]) ? pc[2] : []).forEach((x, k) => { if (k >= 1 && Array.isArray(x) && hasText(x[2])) ubsMore.push([x[2], x[3], OWN_M.ubs]); }));
      const bdbText = (x) => `${x[5]}${senseOf(x) ? `${SENSE_SAYS}${senseOf(x)}` : ""}`;
      const bdbMore = b.slice(1).filter((x) => Array.isArray(x) && hasText(x[5]) && senseOf(x) !== undefined).map((x) => [bdbText(x), x[4], OWN_M.bdb]);
      pillsAt[n - 1] = {
        step: [stepPick1 ? pillOf(st[0][4], st[0][5], OWN_M[st[0][1]] || OWN_M.r, keys) : null, tally4(stepMore)],
        macula: [line.macula ? pillOf(macWords, macRows, OWN_M.macula, keys) : null, [0, 0, 0, 0, 0]],
        ubs: [line.ubs ? pillOf(ubsLine, ubsRows, OWN_M.ubs, keys) : null, tally4(ubsMore)],
        bdb: [line.bdb ? pillOf(bdbText(b[0]), b[0][4], OWN_M.bdb, keys) : null, tally4(bdbMore)],
      };
      if (!stepPick1 && pgAnswers && !isKq) answered.push([book, label, n, [...new Set(pg.map((x) => String((x && x.g) || "").trim() ? String((x && x.s) || "") : ""))].sort().join("+"), line.macula ? 1 : 0]);
      // what the receipt says of the pick whose words the index carries at this place
      const sayStepWords = () => {
        stepWordsC.count += 1;
        if (ANGLE_MARK.test(st[0][4])) stepWordsC.angle_mark_only += 1;
        if (!(Array.isArray(st[0][5]) && st[0][5].length)) stepWordsC.naming_no_row += 1;
        const W = L ? L.waiting.find((x) => x.n === 1) : null;
        if (W) tally(stepWordsC.by_waiting_status, String(W.status));
        const G = L ? L.gate.find((x) => x.entry === st[0][2] && x.words === st[0][4]) : null;
        if (G) tally(stepWordsC.entry_gate, String(G.bake));
        if (L && L.gate5.some((x) => x.n === 1)) stepWordsC.entry_gate_after_call5 += 1;
      };
      // STEP's own reading stands (call 4): its pick 1 is the line under STEP, credited to STEP, whatever today's line
      // is, a pair among them; the index marks the row so ([n, words, 1]), and it prints
      if (isStands) {
        if (st[0][1] !== "r") refuse(`${book} ${label}: STEP's reading stands here (call 4), and its pick 1 is of kind ${st[0][1]}, which the line's credit (M4, STEP's reading) does not name`);
        else {
          stepWords.push([n, st[0][4], 1]);
          stepWordsAt[n - 1] = 2;
          sayStepWords();
        }
      // STEP's own words, where the page's own line may be bare: its reading, credited to TAHOT
      } else if (stepPick1 && !pgAnswers && !isKq && heldSplit.has(`${book} ${label}`)) {
        stepWordsC.held_split.held += 1;
        stepWordsC.held_split.places.push(`${book} ${label}`);
      } else if (stepPick1 && !pgAnswers && !isKq) {
        if (st[0][1] !== "r") refuse(`${book} ${label}: STEP's pick 1, whose words its line may print, is of kind ${st[0][1]}, which the line's credit (M4, STEP's reading) does not name`);
        else {
          stepWords.push([n, st[0][4]]);
          stepWordsAt[n - 1] = 1;
          // WHERE THEY PRINT (picks_printed): where today's line there is bare, which the record of the resting lines
          // says: it draws no line over the word (a record of the page before the default sources were laid), or it
          // draws STEP's words as the line draws them, under STEP's credit, where no TAHOT row the card asks there is
          // drawn so (one that is makes the line today's, that row's: II Kings 17:6:2 «<the>/ ninth» is drawn as
          // STEP's «<of the>/ ninth» is)
          const u = lineOver(si, ei);
          const drawn = u && u[1] === 1 ? String(u[2]) : null;
          if (!u || (drawn === drawnStep(st[0][4]) && u[3] === OWN_M.r && !keys.some((k) => servedUnder(k).some(([m, t]) => m === OWN_M.r && drawnStep(t) === drawn)))) stepWordsAt[n - 1] = 2;
          sayStepWords();
        }
      }

      // the line picks and their rows, for the receipt
      if (stepPick1) countLinePick("step", OWN_M[st[0][1]] || OWN_M.r, Array.isArray(st[0][5]) ? st[0][5] : []);
      if (line.macula) { countLinePick("macula", OWN_M.macula, macRows); printed("macula", macWords, label); }
      if (line.ubs) { countLinePick("ubs", OWN_M.ubs, ubsRows); printed("ubs", ubsLine, label); }
      if (line.bdb) {
        countLinePick("bdb", OWN_M.bdb, Array.isArray(b[0][4]) ? b[0][4] : []);
        printed("bdb", `${b[0][5]}${bdbLine[0] ? `${SENSE_SAYS}${bdbLine[0]}` : ""}`.replace(/\.$/, ""), label);
        printed("bdb_words", b[0][5], label);
      }

      const slots = [stepSlot.length ? stepSlot : 0, macWords || 0, ubsPicks.length ? [ubsLine || 0, ubsPicks] : 0, bdbSlot.length ? bdbSlot : 0];
      places[n - 1] = slots.every((s) => s === 0) ? null : slots;
      firstPick[n - 1] = {
        macula: !!mac,
        ubs: new Map(pieces.filter((pc) => Array.isArray(pc) && Array.isArray(pc[2]) && Array.isArray(pc[2][0])).map((pc) => [pc[0], pc[2][0][1]])),
        bdb: Array.isArray(b[0]) ? [b[0][1], b[0][2]] : null,
      };
    }

    // THE PILLS THE CARD PRINTS FOR A SOURCE, under each first source with its second for this book (every source
    // on): the first's own pick 1 and picks 2..n where it has a line, and its second's where the second fills. Under
    // STEP its line is today's except where its own words fill a bare line (step_words, counted where they print:
    // stepWordsAt 2), its picks 2..n are said as text, not pills, and its second fills only the places it leaves;
    // under the others, STEP as the second prints only its own words, where they print
    const has1 = (n, x) => (lineBits[n - 1] >> IDS.indexOf(x)) & 1;
    const leafAt = new Set(leaves.map((l) => l[0]));
    const pp = (x, y) => { if (!picksPrinted[x][y]) picksPrinted[x][y] = [0, 0, 0, 0, 0]; return picksPrinted[x][y]; };
    const addPills = (x, y, at, more) => {
      if (at[0]) { pp(x, y)[at[0][0]] += 1; pp(x, y)[3] += at[0][1]; pp(x, y)[4] += at[0][2]; }
      if (more) at[1].forEach((k, c) => { pp(x, y)[c] += k; });
    };
    const secondOf = Object.fromEntries(IDS.map((x) => [x, autoSecond(fills, x)]));
    for (const i of placeAt) {
      const n = i + 1, at = pillsAt[i];
      if (!at) continue;
      if (stepWordsAt[i] === 2) addPills("step", "step", at.step, false);
      const y0 = secondOf.step;
      if (y0 && leafAt.has(n) && has1(n, y0)) addPills("step", y0, at[y0], false);
      for (const x of IDS.filter((s) => s !== "step")) {
        if (has1(n, x)) { addPills(x, x, at[x], true); continue; }
        const y = secondOf[x];
        if (y === "step" ? stepWordsAt[i] === 2 : y && has1(n, y)) addPills(x, y, at[y], true);
      }
    }
    // THE LINES AT REST OVER MORE THAN ONE WORD (a joined run's one line, as the record keeps it), and which of them
    // each source reads at every word (a source other than STEP takes such a run only there), some, or none
    let start = 0;
    const firstN = zs.map((sec) => { const f = start; start += (sec.words || []).length; return f; });
    restRec.sections.forEach(([, units], si) => {
      for (const u of units) {
        if (!Array.isArray(u) || !(u[1] > 1)) continue;
        const ns = [];
        for (let e = u[0]; e < u[0] + u[1]; e += 1) if (entries[firstN[si] + e]) ns.push(firstN[si] + e + 1);
        if (ns.length < 2) continue;
        runs.lines += 1;
        runs.words += ns.length;
        for (const x of IDS) {
          const k = ns.filter((n) => has1(n, x)).length;
          runs.by_source[x][k === ns.length ? "every_word" : k ? "some_words" : "no_word"] += 1;
        }
      }
    });

    const labels = placeAt.map((i) => entries[i].label);
    // THE UNITS OF THE SPANS LIST (default-spans-rule-v1), by WORD_N. Every line that lands is proved to be the pick
    // this bake has just read at its place: MACULA's pick, UBS's first pick of the piece the line names by that
    // meaning's id, BDB's first pick by its record and meaning. A line that is not refuses the book
    let spansOut = null;
    if (spansRead) {
      const nOf = new Map(placeAt.map((i) => [entries[i].label, i + 1]));
      const spanLines = spansRead.byBook.get(book) || [];
      for (const r of spanLines) {
        const n = nOf.get(r.p), fp = n ? firstPick[n - 1] : null;
        if (!fp) { refuse(`${book} ${r.p}: the spans list files a line of ${r.source} at a place the zone does not hold`); continue; }
        const ok = r.source === "macula" ? fp.macula
          : r.source === "ubs" ? typeof r.piece === "string" && fp.ubs.get(r.piece) === r.id
            : Array.isArray(r.id) && Array.isArray(fp.bdb) && fp.bdb[0] === r.id[0] && fp.bdb[1] === r.id[1];
        if (!ok) refuse(`${book} ${r.p}: the spans list's line of ${r.source} (${JSON.stringify(r.id)}) is not that source's first pick at the place as the default picks give it`);
      }
      let units = null;
      try { units = unitsOfBook(book, spanLines, nOf); } catch (e) { if (!(e instanceof PinFault)) throw e; refuse(e.message); }
      if (units) {
        spansOut = { rule_id: DEFAULT_SPANS_RULE_ID };
        for (const x of SPAN_SOURCES) {
          spansOut[x] = units[x].units.map((u) => [u.places.map((p) => nOf.get(p)), u.filed.map((p) => nOf.get(p))]);
          const c = spanCount[x];
          c.lines += units[x].lines; c.units += units[x].units.length; c.nested += units[x].nested; c.filed_beside += units[x].filed_beside;
          c.words += units[x].units.reduce((a, u) => a + u.places.length, 0);
          c.filed_with_a_line += units[x].units.filter((u) => u.filed.some((p) => has1(nOf.get(p), x))).length;
        }
      }
    }
    const bookFile = {
      schema_version: "DEFAULT_PICKS_BOOK_V1",
      rule_id: DEFAULT_PICKS_RULE_ID,
      book,
      zone: { entries: entries.length, places: placeAt.length, places_sha256: sha256(Buffer.from(labels.join("\n"), "utf8")) },
      ledger: { file: o.file, sha256: o.sha256, mend_places: mendPlaces, store_read: ((in12.page_store || {}).store_version) || null, store_resolved: storeIx.store_version || null },
      bdb_words: bdbWords,
      places,
      ...(spansOut ? { spans: spansOut } : {}),
    };
    const raw = Buffer.from(JSON.stringify(bookFile), "utf8");
    const gz = gzipSync(raw, { level: 9 });
    books.push({ book, work: zone.work || book, gz, raw: raw.length, entries: entries.length, places: placeAt.length, kq, has, fills, restStep, leaves, leafLabels, stepWords, answered, mendPlaces });
  }

  // 5 · what must hold across the books
  // a book refused above is not read through, so its mend and list lines say nothing more
  const listedBooks = new Set(outputs.map((o) => o.file.replace(/\.jsonl$/, "")));
  const read = new Set(books.map((x) => x.book));
  for (const [what, mend] of [["v1.1's STEP mend", mend11], ["v1.2's STEP mend", mend12], ["v1.2's BDB mend", bdbMend]]) for (const [id, m] of mend) {
    if (!listedBooks.has(m.book)) refuse(`${what} names ${id}, in a book receipt-v1 does not list`);
    else if (read.has(m.book) && !m.used) refuse(`${what} names ${id}, a place v1 lacks`);
  }
  for (const [id, l] of listed) if (read.has(l.book) && !l.used) refuse(`a list beside v1.2's picks names ${id}, a place v1 lacks`);
  // every place of call 4 is a zone word (STEP'S OWN READING STANDS)
  if (books.length === outputs.length && standsC.met !== standsC.listed) refuse(`call 4 names ${n0(standsC.listed)} places and ${n0(standsC.met)} of them are words of the zones`);
  for (const [i, where] of missing) refuse(`row ${n0(i)} (${rows[i][2]}, rank ${rows[i][1]}) is not in the served store under its key with its text, and the row-strikes record does not say where it went${where.length ? `; named at ${where.join(", ")}` : "; no place names it"}`);
  // a row a round struck since: v1.2 re-pointed its picks, so none names it; one that does is refused
  for (const [i, where] of namedAt) if (where.length) refuse(`row ${n0(i)} (${rows[i][2]}, rank ${rows[i][1]}) was struck by ${struckSince.get(i).by.list} since the store v1.2 read, and ${n0(refCount[i])} pick(s) still name it (${where.join(", ")})`);
  const refsOf = (map) => [...map.keys()].reduce((a, i) => a + refCount[i], 0);
  const bySource = (map) => { const o = {}; for (const i of map.keys()) tally(o, rows[i][2]); return o; };
  const rowsFollowed = {
    ...followedRecord(follow, { left: [...struckSince.values(), ...withheldSince.values()], rekeyed: [...followedTo.values()], retexted: [...retextedTo.values()] }),
    rows_re_keyed_and_found_under_their_new_name: { rows: followedTo.size, picks_naming_them: refsOf(followedTo), by_source: bySource(followedTo) },
    ...(retextedTo.size ? { rows_retexted_and_found_under_their_new_name: { rows: retextedTo.size, picks_naming_them: refsOf(retextedTo), by_source: bySource(retextedTo) } } : {}),
    rows_struck_since_that_no_pick_names: struckSince.size,
    rows_withheld_since: { rows: withheldSince.size, picks_naming_them: refsOf(withheldSince), by_source: bySource(withheldSince) },
  };
  const totalPlaces = books.reduce((a, x) => a + x.places, 0);
  if (books.length === outputs.length) {
    if (totalPlaces !== r1.places) refuse(`the books hold ${n0(totalPlaces)} places and receipt-v1 says ${n0(r1.places)}`);
    if (r11.places !== undefined && totalPlaces !== r11.places) refuse(`the books hold ${n0(totalPlaces)} places and receipt-v1.1 says ${n0(r11.places)}`);
    if (totalPlaces !== r12.places) refuse(`the books hold ${n0(totalPlaces)} places and receipt-v1.2 says ${n0(r12.places)}`);
    for (const s of IDS) {
      const want = (r1.picks_per_place || {})[s] || {};
      const keys = new Set([...Object.keys(want), ...Object.keys(perPlace[s])]);
      for (const k of keys) if ((want[k] || 0) !== (perPlace[s][k] || 0)) refuse(`${PILL[s]} has ${n0(perPlace[s][k] || 0)} places with ${k} picks and receipt-v1 says ${n0(want[k] || 0)}`);
    }
    const hold = (what, got, want, by) => { if (got !== want) refuse(`${what}: ${n0(got)} here and ${by} says ${n0(want)}`); };
    const holdAll = (what, got, want, by) => { for (const k of new Set([...Object.keys(want || {}), ...Object.keys(got)])) hold(`${what}, ${k}`, got[k] || 0, (want || {})[k], by); };
    const M = r11.mend || {};
    const h11 = (what, got, want) => hold(what, got, want, "receipt-v1.1");
    h11("the places whose STEP picks change", mend11Count.places - mend11Count.unchanged, M.places_whose_step_picks_change);
    h11("v1.1's mend lines", mend11Count.places, M.places_whose_step_picks_change);
    h11("the alternatives the mend changes", mend11Count.changed.a, (M.picks_changed_by_kind || {}).a);
    h11("the variants the mend changes", mend11Count.changed.v, (M.picks_changed_by_kind || {}).v);
    h11("the picks that fall together", mend11Count.merged.a + mend11Count.merged.v, M.picks_that_fall_together);
    h11("v1's alternatives", kinds.v1.a, (M.alternatives || {}).in_v1);
    h11("v1's variants", kinds.v1.v, (M.variants || {}).in_v1);
    h11("the alternatives after v1.1's mend", kinds.v1_1.a, (M.alternatives || {}).in_v1 - mend11Count.merged.a);
    h11("the variants after v1.1's mend", kinds.v1_1.v, (M.variants || {}).in_v1 - mend11Count.merged.v);
    h11("the readings after v1.1's mend", kinds.v1_1.r, kinds.v1.r);
    const S = r12.step || {}, h12 = (what, got, want) => hold(what, got, want, "receipt-v1.2");
    h12("v1.2's STEP mend lines", mend12Count.places, S.places_changed);
    h12("the places that gain STEP picks", mend12Count.gained.places, S.places_gaining_picks);
    holdAll("the STEP picks they gain by kind", mend12Count.gained.picks, S.picks_gained_by_kind, "receipt-v1.2");
    h12("the variants added behind a broken bar where v1.1 has picks", mend12Count.broken_bar, (S.places_changed_by_cause || {})[BROKEN_BAR]);
    h12("the places with no STEP pick after v1.1", noStepPick.v1_1, S.places_with_no_step_pick_v11);
    h12("the places with no STEP pick after v1.2", noStepPick.v1_2, S.places_with_no_step_pick_v12);
    // the picks by kind after v1.2 follow from v1.1's, the picks gained, and the variants behind a broken bar
    for (const k of ["r", "v", "a"]) hold(`STEP's picks of kind ${k} after v1.2`, kinds.v1_2[k], kinds.v1_1[k] + (mend12Count.gained.picks[k] || 0) + (k === "v" ? mend12Count.broken_bar : 0), "v1.1's with the picks receipt-v1.2 says are gained and added");
    const B = r12.bdb || {};
    h12("v1.2's BDB mend lines", bdbMendCount.places, B.places_changed);
    h12("BDB's picks at those places before", bdbMendCount.picks_before, B.picks_before);
    h12("BDB's picks at those places after", bdbMendCount.picks_after, B.picks_after);
    h12("the rows of v1.1's tables", v11Rows, (r12.rows || {}).v1_1_table);
    h12("the rows v1.2 adds", pin.rows_added_v1_2.lines, (r12.rows || {}).added);
    const Q1 = r12.question_1 || {}, Q6 = r12.question_6 || {}, AF = r12.entry_gate_after_the_repoints || {}, C5 = r12.call5 || {};
    h12("the STEP readings that still name no row", C.readings_naming_no_row, Q1.still_naming_no_row);
    h12("the waiting list's picks", waiting.length, Q1.still_naming_no_row);
    holdAll("the waiting list by status", lists.waiting.by_status, Q1.by_status, "receipt-v1.2");
    h12("the entry gate's lines", gate.length, Q6.lines);
    h12("the entry gate's active lines", lists.gate.active, Q6.active_lines);
    h12("the entry gate's stale lines", lists.gate.stale, Q6.stale_lines);
    holdAll("the entry gate's lines by bake", lists.gate.by_bake, Q6.by_bake, "receipt-v1.2");
    holdAll("the entry gate's lines by class", lists.gate.by_class, Q6.by_class, "receipt-v1.2");
    h12("the stale lines waiting on row entries v1.1", lists.gate.until_row_entries_v1_1_lands, (Q6.stale_let_through_by || {})["row entries v1.1 only"]);
    h12("the entry gate's lines after the re-points", gate5.length, AF.picks);
    holdAll("the entry gate's lines after the re-points by cause", lists.gate5.by_cause, AF.by_cause, "receipt-v1.2");
    h12("call 5's re-point lines", repoints.length, C5.rows_named_in_v1_2);
    holdAll("call 5's re-point lines by class", lists.repoints.by_class, C5.rows_named_in_v1_2_by_class, "receipt-v1.2");
    holdAll("call 5's references by class", lists.repoints.references_by_class, C5.references_in_v1_2_by_class, "receipt-v1.2");
    h12("the merged branch's picks", branches.merged.length, (r12.merged_branch || {}).picks);
    h12("the small-letter branch's lines", branches.small_letter.length, (r12.small_letter_branch || {}).lines);
  }
  if (whys.length) throw new Refused(whys);

  // 6 · the index, which the page reads at boot
  const index = {
    schema_version: "DEFAULT_PICKS_INDEX_V1",
    rule_id: DEFAULT_PICKS_RULE_ID,
    generated_by: "tools/bake-default-picks-v1.mjs",
    pin: relative(K3, pinPath).split("\\").join("/"),
    store_version: storeIx.store_version || null,
    sources: SOURCES.map((s) => ({ id: s.id, pill: s.pill, m: s.m })),
    books: Object.fromEntries(books.map((x) => [x.book, {
      file: `${x.book}.bin`, bytes: x.gz.length, sha256: sha256(x.gz), entries: x.entries, places: x.places, kq: x.kq,
      has: x.has, fills: x.fills, rest_step: x.restStep, step_leaves: x.leaves, step_words: x.stepWords,
    }])),
  };
  const indexBytes = Buffer.from(`${JSON.stringify(index)}\n`, "utf8");

  // 7 · the receipt
  const total = { places: totalPlaces, entries: 0, kq: 0, has: Object.fromEntries(IDS.map((s) => [s, 0])), fills: emptyFills(), second_fills: Object.fromEntries(IDS.map((s) => [s, 0])) };
  const seconds = Object.fromEntries(IDS.map((s) => [s, { by_source: {}, none: 0, ties: 0, tied_books: [] }]));
  const restFills = [];
  const perBook = {};
  for (const x of books) {
    total.entries += x.entries;
    total.kq += x.kq;
    const auto = {};
    for (const s of IDS) {
      total.has[s] += x.has[s];
      for (const y of IDS) if (y !== s) total.fills[s][y] += x.fills[s][y];
      const best = autoSecond(x.fills, s);
      auto[s] = best;
      if (!best) seconds[s].none += 1;
      else {
        tally(seconds[s].by_source, best);
        total.second_fills[s] += x.fills[s][best];
        if (tiedSecond(x.fills, s, best)) { seconds[s].ties += 1; seconds[s].tied_books.push(x.book); }
      }
    }
    const slot = { macula: 1, ubs: 2, bdb: 3 }[auto.step];
    x.restFills = 0;
    x.leaves.forEach((leaf, i) => {
      if (!slot || !leaf[slot]) return;
      x.restFills += 1;
      const t = Array.isArray(leaf[slot]) ? `${leaf[slot][1]}${leaf[slot][0] ? `${SENSE_SAYS}${leaf[slot][0]}` : ""}` : leaf[slot];
      restFills.push([x.book, x.leafLabels[i], leaf[0], PILL[auto.step], t]);
    });
    perBook[x.book] = {
      work: x.work, entries: x.entries, places: x.places, kq: x.kq, mend_places: x.mendPlaces,
      has: x.has, fills: x.fills, second: auto, second_tied: Object.fromEntries(IDS.map((s) => [s, tiedSecond(x.fills, s, auto[s])])),
      step_leaves: x.leaves.length, rest_fills: x.restFills, step_words: x.stepWords.length,
      file: { name: `${x.book}.bin`, bytes: x.gz.length, raw_bytes: x.raw, sha256: sha256(x.gz) },
    };
  }
  const restBooks = books.filter((x) => x.restFills > 0);
  const answeredAll = books.flatMap((x) => x.answered);
  const leavesAll = books.flatMap((x) => x.leaves);
  const receipt = {
    schema_version: "DEFAULT_PICKS_RECEIPT_V1",
    rule_id: DEFAULT_PICKS_RULE_ID,
    generated_by: "tools/bake-default-picks-v1.mjs",
    what: "each source's own picks at every word place of the books receipt-v1 lists (the corpus lane's default picks v1, with the v1.1 mend of STEP's dictionary picks and the v1.2 mend of STEP's and BDB's picks), laid on the zones' words by WORD_N and counted by one rule: a pick's words are a line pick where they hold a letter or digit and are not NO DATA YET (a sign alone is no pick for any source); STEP has a line where its pick 1 is a line pick or the zone's place pieces all carry words, and where the line as it rests draws one (not at a pair, or a place call 4 writes with « | », where its own words are never drawn, the pieces do not answer and the record of the resting lines holds no line over the word: step_line_rests_bare); MACULA, UBS and BDB have a line where the word is not ketiv/qere and, for MACULA, its pick is a line pick, for UBS some piece's pick 1 is one, for BDB pick 1's record's highlighted words are one; fills[x][y] counts the places where x has no line and y has one, never a place where STEP's line rests bare; STEP's second fills only the places STEP leaves (no pick); where the page's own line is bare and STEP's pick 1 is a line pick of its reading, the line under STEP prints those words, credited to STEP (step_words). The second source is the page's to work out; the one named here is worked out with every source on",
    pin: index.pin,
    ledger: {
      relays: pin.relays || null,
      from: pin.from || null,
      book_files: outputs.length,
      store_read: { v1: ((r1.inputs || {}).route_store || {}).store_version || null, v1_2: (in12.page_store || {}).store_version || null },
      store_resolved: storeIx.store_version || null,
    },
    shape: {
      book_file: "data/default-picks/<book>.bin: gzip -9 of minified JSON; places[n - 1] for WORD_N n is null at a mark or where no source picks, else [step, macula, ubs, bdb], each 0 where the source has no pick; step [[kind 0 r | 1 v | 2 a, words | 0, a variant's letter], ...]; macula its words, as given; ubs [line | 0, [[piece (from 0, in the ledger's list of the word's pieces), words], ...]], the picks of a piece in its order, numbered from 1 within the piece by the page; bdb [[sense marker, or \"\" for the entry, one-based index into bdb_words | 0], ...]",
      index: "data/default-picks/index.json: sources (id, pill, M ids) and per book file, bytes, sha256, entries, places, kq, has, fills, rest_step (for a first and a second that are not STEP, the places both leave where STEP's line as it rests draws one: STEP fills out last), step_leaves ([n, MACULA's line | 0, UBS's line | 0, [BDB's sense, BDB's words] | 0], one per place STEP leaves that is not ketiv/qere) and step_words ([n, STEP's pick 1 words], one per place that is not ketiv/qere, whose zone place pieces do not answer, where STEP's pick 1 is a line pick of its reading, and not where the corpus lane's call 4 writes STEP's words with « | »: the line under STEP prints them where the page's own line there is bare; and [n, STEP's pick 1 words, 1], one per place where STEP's own reading stands, call 4's category, a pair among them: the line under STEP prints them whatever today's line is, steps_reading_stands); has.step counts the places where the line under STEP as it rests draws a line (step_line_rests_bare); no second source",
    },
    rows: {
      named: rows.length, of_v1: pin.rows.lines, added_by_v1_1: pin.rows_added.lines, added_by_v1_2: pin.rows_added_v1_2.lines,
      found_once: foundOnce, found_more_than_once: doubles.length, missing: 0,
      found_more_than_once_rows: doubles,
      followed: {
        what: "the rows the tables name that are not in the store as named, each where the row-strikes record says it went since the store v1.2 read (tools/row-strikes-follow-v1.mjs): moved to another key and found there, with the picks that name it; struck, and named by no pick (v1.2 re-pointed them); withheld, with the picks that name it, which stand on their other rows or on the source's own words. found_once and found_more_than_once count the rows found as named",
        ...rowsFollowed,
      },
    },
    mend: {
      v1_1: {
        places: mend11Count.places,
        picks_changed: mend11Count.changed,
        picks_that_fall_together: mend11Count.merged,
        receipt_v1_says: { variant_picks: (r1.step || {}).variant_picks ?? null, alternative_picks: (r1.step || {}).alternative_picks ?? null, held: false, why: "receipt-v1's own counts of variants and alternatives are not those of its book files; the counts held are receipt-v1.1's (question 2 to the corpus lane, answered in relay v195: they were counted before the builder joined picks of one entry and words)" },
      },
      v1_2: {
        places: mend12Count.places,
        places_gaining_picks: mend12Count.gained.places, picks_gained_by_kind: mend12Count.gained.picks,
        variants_added_behind_a_broken_bar: mend12Count.broken_bar,
        bdb: bdbMendCount,
      },
      places_with_no_step_pick: noStepPick,
      picks_by_kind: kinds,
    },
    picks_per_place_in_v1: perPlace,
    totals: {
      what: "summed over the books: has, the places where each source has a line (for STEP, where its line as it rests draws one: step_line_rests_bare); fills and second_fills, as shape.index counts them; shares, has (own) and second_fills (second) over the places",
      books: books.length, entries: total.entries, places: total.places, kq_words: total.kq,
      has: total.has, fills: total.fills, second_fills: total.second_fills,
      shares: Object.fromEntries(IDS.map((s) => [s, { own: pct(total.has[s], total.places), second: pct(total.second_fills[s], total.places) }])),
    },
    second_source: Object.fromEntries(IDS.map((s) => [s, { ...seconds[s], tied_books: seconds[s].tied_books }])),
    step_leaves: {
      what: "places where STEP has no pick (its pick 1 no line pick, and no place pieces that answer) and the word is not ketiv/qere; the index carries each with the other sources' lines. A place where STEP has a pick and its line as it rests is bare is none of them (step_line_rests_bare): its second does not fill it",
      count: leavesAll.length,
      with_a_line: { macula: leavesAll.filter((l) => l[1]).length, ubs: leavesAll.filter((l) => l[2]).length, bdb: leavesAll.filter((l) => l[3]).length },
      with_no_line: leavesAll.filter((l) => !l[1] && !l[2] && !l[3]).length,
      with_no_line_places: books.flatMap((x) => x.leaves.map((l, i) => [l, x.leafLabels[i]]).filter(([l]) => !l[1] && !l[2] && !l[3]).map(([l, label]) => ({ book: x.book, place: label, n: l[0] }))),
    },
    rest_fills: {
      what: "STEP's leaves its second source (worked out with every source on) fills: the lines the second moves on a first visit",
      count: restFills.length, books: restBooks.length,
      by_book: Object.fromEntries(restBooks.map((x) => [x.book, x.restFills])),
      places: restFills.map(([book, label, n, src, t]) => ({ book, place: label, n, source: src, line: t })),
    },
    step_words: {
      what: "places that are not ketiv/qere, whose zone place pieces do not answer, where STEP's pick 1 is a line pick of its reading (kind r), and that the corpus lane's call 4 (relay v189) does not write with « | »: the index carries each with its words, and the line under STEP prints them, credited to STEP (M4), where the page's own line there is bare (the owner's question 2 of 14 November, recommendation B); a pick naming no row, or naming a row the entry gate withholds, prints so too (relay v195, sections 2 and 8). Which of them are bare is the page's: today's line is worked out on the page. HELD (held_split): where call 4 writes STEP's words with « | », STEP reads one written word as two TAHOT words and its pick 1 is the first of them only, so the index carries no STEP words there and the line keeps today's until the lane says how STEP's line reads (its open question 1); held counts those places that would else be here, listed the places call 4 writes so; where today's line at one of them is bare, the line under STEP draws nothing there (step_line_rests_bare). The places where STEP's own reading stands (call 4's category, steps_reading_stands) are among them too, each whatever its pieces and at a pair as well, with its words marked as standing",
      ...stepWordsC,
      books: books.filter((x) => x.stepWords.length).length,
      by_book: Object.fromEntries(books.filter((x) => x.stepWords.length).map((x) => [x.book, x.stepWords.length])),
    },
    steps_reading_stands: {
      rule_id: STEPS_READING_STANDS_RULE_ID,
      what: "the places of the corpus lane's call 4 (relay v189: data/audit-calls/calls-v1/, held to data/default-picks/PIN.json's held_split_v189), each by the class the bake reads at the zone word: stands where the list's action is steps_words_are_the_line, STEP's words hold no « | » and the zone word is not a pair whose read form is several words (kq.words_read); there the line under STEP is STEP's own pick 1, credited to STEP, whatever today's line is, and the index carries it as [n, words, 1]. Held by class: held_split (« | »: the owner's question 2, put back to the lane), none (the list's action), read_form_of_several_words (v192's read words carry those places). letters_equal: the zone word carries the list's letters; words_equal: at a place that stands, STEP's pick 1 after the mends is the list's words byte for byte; were_bare_before: the places that stand where the line under STEP rested bare before (pairs whose record draws no line)",
      ...standsC,
    },
    step_line_rests_bare: {
      what: "places where STEP has a pick (its pick 1 a line pick) and its line as it rests draws nothing: its own words are never drawn at a pair (ketiv/qere: the pair keeps today's line) or at a place call 4 writes with « | » (held), and where the place pieces do not answer, today's line stands there; where the record of the resting lines holds no line over the word, that line is bare. Such a place is not counted in has.step, is no place STEP leaves (its second does not fill it), and counts in no fill of STEP's or by STEP; the other sources' has and fills count it as anywhere else, as the page prints their lines there. Read off the records as they stand (records); the default sources move nothing at these places, so the record's line there is today's whether or not it was read with them laid",
      count: restsBare.places.length, pair: restsBare.pair, held_split: restsBare.held_split,
      places: restsBare.places,
      records: { dir: relative(K3, records).split("\\").join("/") || records, ...recordsRead },
    },
    picks_printed: {
      what: "under each first source, with its second for each book (worked out with every source on), the pills the card prints for the source whose words the line prints: the first's pick 1, and its picks 2..n with words, where it has a line; its second's where the second fills. Under STEP: its pick 1 where its own words print (step_words, where the page's own line is bare: the record of the resting lines draws no line over the word, a record of the page before the default sources were laid, or draws STEP's words as the line draws them under STEP's credit, M4, where no TAHOT row under a key the card asks there is drawn so, which would make the line today's), its picks 2..n said as text and not as pills, and its second's pick 1 at the places STEP leaves; under the others, STEP as the second prints its pick 1, and its picks 2..n as pills, where its own words print. Each pill by the rows its pick names, as the corpus lane names them (its own source's rows that print its words where there are any, else every row under its key that prints them): a row of its own source, another source's row only, or none; how many of them a row they name, standing under a key the card asks at the place (the word's own, or one of its pieces'), prints whole, read as the card reads a pill (a closing stop dropped, case folded, a \"/\" a joint or kept whole, the made spaces closed); and made, the pills no row of the pill's own source that the served store holds under a key the card asks prints whole: the card makes a row of the source's own words for each, credited to it. Made is the least the card makes: where the card's gates (the pointing, the entry, the names) withhold the row that prints a pill, or a ledger's division prints it in parts, the card makes that pill too; those are not judged here. The corpus lane's receipt-v1 counts every pick of v1 by the rows it names (its picks_printed)",
      by_first: Object.fromEntries(IDS.map((x) => [x, Object.fromEntries(Object.entries(picksPrinted[x]).map(([y, t]) => [y, { pills: t[0] + t[1] + t[2], ...Object.fromEntries(PRINTED.map((k, c) => [k, t[c]])) }]))])),
    },
    runs_read_whole: {
      what: "the lines at rest over more than one word (a joined run's one line, as the records of the resting lines keep it), with the words under them, and for each source at how many of those lines it has a line at every word, at some, or at none. A run keeps its joined line at rest only where some word of it has no reading of its own at the place (its place pieces, or STEP's words where STEP's own reading stands; a bridged mark set aside): every other run reads its words one by one, the joined reading a press away (run-reads-its-words-rule-v1, question 8, taken). So these are the runs held so; on the page a source other than STEP takes such a run only where it has a line at every word, and under STEP the run's own line stands",
      run_lines: runs.lines, words: runs.words, by_source: runs.by_source,
    },
    place_reading_answers: {
      what: "places where STEP's pick 1 is no line pick, the word is not ketiv/qere, and the zone's place pieces all carry words: STEP has a line there (the place reading), so nothing is filled",
      count: answeredAll.length,
      places: answeredAll.map(([book, label, n, pieces, mac]) => ({ book, place: label, n, pieces, macula_has_words: !!mac })),
    },
    signs: {
      what: "pick 1s (for UBS, each piece's pick 1) whose words are a sign or a stop alone, by source and text: no pick for the line, printed on the card as given",
      sign_only_pick1: C.sign_only_pick1,
      ubs_no_data_yet_pick1: C.ubs_no_data_yet_pick1,
      ubs_no_data_yet_picks: C.ubs_no_data_yet_picks,
    },
    bdb: { records: recordWords.size, pick1_without_highlight: C.bdb_pick1_without_highlight, picks_without_highlight: C.bdb_picks_without_highlight },
    step: { pick1_not_kind_r: C.step_pick1_not_r, picks_without_words: C.step_picks_without_words, words_empty_string: C.step_words_empty_string, readings_naming_no_row: C.readings_naming_no_row },
    lists_beside_v1_2: {
      what: "the lists receipt-v1.2 issues beside the picks, each held to v1.2's picks at its places and counted; none moves a line (the line under STEP prints the ledger's words, credited to STEP, whatever a pick's row); the two branches rest off and are not baked",
      picks_waiting: { lines: waiting.length, ...lists.waiting },
      entry_gate: { lines: gate.length, ...lists.gate },
      entry_gate_after_call5: { lines: gate5.length, ...lists.gate5 },
      call5_repoints: lists.repoints,
      branches: { merged: { lines: branches.merged.length, rests: "off" }, small_letter: { lines: branches.small_letter.length, rests: "off" } },
    },
    line_picks: {
      what: "each source's line pick and its named rows. For MACULA, UBS and BDB it is the pick that prints the source's line, at every place the source has one (has). For STEP it is its pick 1 wherever that is a line pick, a pair and a place where its line as it rests is bare among them (step_line_rests_bare); the line under STEP prints its words only where today's line is bare (step_words), and today's line, under its own chip, stands elsewhere. Its named rows: none, or a first named row whose source is not the pick's own (M4 for STEP's reading, M19 for its variants and alternatives, M3, M18, M46)",
      ...linePicks,
    },
    lines_holding_a_slash: slashes,
    lines_over_40_characters: long,
    line_feeds: { count: C.line_feeds.length, places: C.line_feeds.map(([book, where, src]) => ({ book, place: where, source: src })) },
    hebrew_in_carried_texts: C.hebrew_in_texts,
    ...(spansRead ? { spans: {
      rule_id: DEFAULT_SPANS_RULE_ID,
      what: "the words each source's line reads, from the corpus lane's spans list (relay v209), laid in each book's file as spans: per source, the units of two or more words its first pick's line reads, each with the words it is filed at, by WORD_N. Every line that lands was proved to be the pick the bake read at its place. filed_with_a_line counts the units some filed place of which has a line of the source, which are the units the page can print; the others are laid and inert",
      pin: { file: `${DEFAULT_SPANS_HOME}/PIN.json`, sha256: sha256(readFileSync(spansPin)), relay: spansRead.pin.relay, list: { file: spansRead.pin.spans.file, bytes: spansRead.pin.spans.bytes, sha256: spansRead.pin.spans.sha256, lines: spansRead.pin.spans.lines } },
      lines_by_class: spansRead.classes,
      by_source: spanCount,
    } } : {}),
    books: perBook,
    index: { file: "index.json", bytes: indexBytes.length, sha256: sha256(indexBytes) },
    sizes: { book_files_bytes: books.reduce((a, x) => a + x.gz.length, 0), book_files_raw_bytes: books.reduce((a, x) => a + x.raw, 0) },
  };
  const receiptBytes = Buffer.from(`${JSON.stringify(receipt, null, 1)}\n`, "utf8");
  return { books, index, indexBytes, receipt, receiptBytes, kept, total, seconds, restFills, doubles, mend11Count, mend12Count, bdbMendCount, kinds, rows, foundOnce, leavesAll, rowsFollowed };
};

if (startedAs(import.meta.url)) {
  const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
  const LEDGER = arg("ledger");
  if (!LEDGER) {
    console.log("usage: node tools/bake-default-picks-v1.mjs --ledger <dir holding default-picks-v1/, default-picks-v1.1/ and default-picks-v1.2/> [--out data/default-picks] [--zones data/zones] [--store data/route-store] [--records data/resting-lines] [--pin data/default-picks/PIN.json] [--receipt data/default-picks-receipt-v1.json] [--receipt-only] [--dry]");
    process.exit(2);
  }
  const OUT = arg("out", join(K3, "data", "default-picks"));
  const ZONES = arg("zones", join(K3, "data", "zones"));
  const STORE = arg("store", join(K3, "data", "route-store"));
  const RECORDS = arg("records", join(K3, RESTING_DIR));
  const PIN = arg("pin", join(K3, "data", "default-picks", "PIN.json"));
  const RECEIPT = arg("receipt", join(K3, "data", "default-picks-receipt-v1.json"));
  const DRY = process.argv.includes("--dry");
  // THE RECEIPT ALONE, from the records of the resting lines as the round's lines step has just read them (round-v1.sh
  // runs the bake so after its lines step): the index and the book files were baked before the records and the lines,
  // which read them, so they are not written here, and where the records read anew would move one of them the bake
  // refuses and writes nothing
  const RECEIPT_ONLY = process.argv.includes("--receipt-only");
  console.log(`\u2014 ${DEFAULT_PICKS_RULE_ID} \u2014`);
  console.log(`LEDGER: ${LEDGER}`);
  try {
    const r = bakeDefaultPicks({ ledger: LEDGER, zones: ZONES, store: STORE, pinPath: PIN, records: RECORDS });
    const { total, seconds, mend11Count: m11, mend12Count: m12, bdbMendCount: bm, kinds, receipt } = r;
    const k3 = (k) => `r ${n0(k.r)}, v ${n0(k.v)}, a ${n0(k.a)}`;
    console.log(`  pins: ${PINNED.length} files and ${r.books.length} book files are the bytes the pin and receipt-v1 name; the three receipts name the pinned bytes`);
    console.log(`  rows: ${n0(r.rows.length)} named (v1 ${n0(receipt.rows.of_v1)}, v1.1 ${n0(receipt.rows.added_by_v1_1)}, v1.2 ${n0(receipt.rows.added_by_v1_2)}) · ${n0(r.foundOnce)} found once · ${r.doubles.length} found more than once${r.doubles.length ? ` (${r.doubles.map((d) => `row ${n0(d.row)} ${d.m} x${d.found}`).join(", ")})` : ""} · 0 missing`);
    const RF = r.rowsFollowed, WC = receipt.lists_beside_v1_2.picks_waiting.waits_for_call5_rekey, RP = receipt.lists_beside_v1_2.call5_repoints;
    console.log(`  rows followed since the store v1.2 read (${RF.read_at_store_version}), ${RF.rounds_since.length} round(s): ${followedSaid(RF)} · ${n0(RF.rows_re_keyed_and_found_under_their_new_name.rows)} found under the key a round moved them to (${n0(RF.rows_re_keyed_and_found_under_their_new_name.picks_naming_them)} picks name them) · ${n0(RF.rows_struck_since_that_no_pick_names)} struck and named by no pick · ${n0(RF.rows_withheld_since.rows)} withheld (${n0(RF.rows_withheld_since.picks_naming_them)} picks name them) · call 5's re-point list: ${n0(RP.rows_struck_since)} rows struck, ${RP.rows_re_keyed_since} moved, ${n0(RP.rows_as_v1_2_read_them)} as v1.2 read them · picks waiting on call 5's re-key: ${n0(WC.picks)} on ${WC.rows} rows, ${n0(WC.picks_whose_row_now_stands_under_its_plain_key)} of them now with a row under the plain key (${WC.rows_now_under_their_plain_key} rows)`);
    console.log(`figures ${JSON.stringify({ store_version: r.index.store_version, rows_named: r.rows.length, found_once: r.foundOnce, found_more_than_once: r.doubles.length,
      rows_re_keyed_and_found: RF.rows_re_keyed_and_found_under_their_new_name.rows, picks_naming_re_keyed_rows: RF.rows_re_keyed_and_found_under_their_new_name.picks_naming_them,
      rows_retexted_and_found: (RF.rows_retexted_and_found_under_their_new_name || { rows: 0 }).rows, picks_naming_retexted_rows: (RF.rows_retexted_and_found_under_their_new_name || { picks_naming_them: 0 }).picks_naming_them,
      rows_struck_since_that_no_pick_names: RF.rows_struck_since_that_no_pick_names, rows_withheld_since: RF.rows_withheld_since.rows, picks_naming_withheld_rows: RF.rows_withheld_since.picks_naming_them,
      repoints_struck: RP.rows_struck_since, repoints_re_keyed: RP.rows_re_keyed_since, repoints_as_read: RP.rows_as_v1_2_read_them,
      waiting_on_call5_picks: WC.picks, waiting_on_call5_rows: WC.rows, waiting_on_call5_picks_now_with_a_row: WC.picks_whose_row_now_stands_under_its_plain_key, waiting_on_call5_rows_now_under_their_plain_key: WC.rows_now_under_their_plain_key,
      has: receipt.totals.has, step_leaves: receipt.step_leaves.count, rest_fills: receipt.rest_fills.count, step_words: receipt.step_words.count,
      stands: receipt.steps_reading_stands.by_class.stands, stands_by_class: receipt.steps_reading_stands.by_class, stands_pairs: receipt.steps_reading_stands.stands.pairs, stands_were_bare_before: receipt.steps_reading_stands.stands.were_bare_before,
      step_line_rests_bare: receipt.step_line_rests_bare.count, run_lines: receipt.runs_read_whole.run_lines, run_words: receipt.runs_read_whole.words, index_sha256: receipt.index.sha256 })}`);
    console.log(`  mend v1.1: ${n0(m11.places)} places · alternatives ${n0(m11.changed.a)} and variants ${n0(m11.changed.v)} changed · ${m11.merged.a + m11.merged.v} fall together (a ${m11.merged.a}, v ${m11.merged.v}) · after it ${k3(kinds.v1_1)} (receipt-v1 says v ${n0(receipt.mend.v1_1.receipt_v1_says.variant_picks)}, a ${n0(receipt.mend.v1_1.receipt_v1_says.alternative_picks)}: not held, question 2)`);
    console.log(`  mend v1.2: ${n0(m12.places)} places · ${n0(m12.gained.places)} gain STEP picks (${k3(m12.gained.picks)}) · ${m12.broken_bar} variant behind a broken bar where v1.1 has picks · BDB ${n0(bm.places)} places, ${n0(bm.picks_before)} picks before, ${n0(bm.picks_after)} after · after it ${k3(kinds.v1_2)} · no STEP pick at ${n0(receipt.mend.places_with_no_step_pick.v1_1)} places, then ${n0(receipt.mend.places_with_no_step_pick.v1_2)}`);
    const L2 = receipt.lists_beside_v1_2;
    console.log(`  beside v1.2: waiting ${n0(L2.picks_waiting.lines)} ${JSON.stringify(L2.picks_waiting.by_status)} · entry gate ${n0(L2.entry_gate.lines)} (${n0(L2.entry_gate.active)} active, ${L2.entry_gate.stale} stale, ${L2.entry_gate.until_row_entries_v1_1_lands} until row entries v1.1) · after the re-points ${L2.entry_gate_after_call5.lines} ${JSON.stringify(L2.entry_gate_after_call5.by_cause)} · call 5 ${n0(L2.call5_repoints.lines)} rows, references ${JSON.stringify(L2.call5_repoints.references_by_class)} · branches merged ${L2.branches.merged.lines}, small-letter ${L2.branches.small_letter.lines}, both off`);
    for (const x of r.books) {
      const second = receipt.books[x.book].second.step;
      console.log(`  ok  ${x.book} · ${n0(x.places)} places · STEP ${n0(x.has.step)} · MACULA ${n0(x.has.macula)} · UBS ${n0(x.has.ubs)} · BDB ${n0(x.has.bdb)} · STEP leaves ${n0(x.leaves.length)} (${second ? `${PILL[second]} ${n0(x.restFills)}` : "no second"}) · STEP's words ${n0(x.stepWords.length)} · ${n0(x.gz.length)} bytes`);
    }
    const share = (s) => {
      const by = Object.entries(seconds[s].by_source).sort((a, b) => b[1] - a[1]).map(([y, k]) => `${PILL[y]} in ${k}`).join(", ");
      return `${PILL[s]} ${pct(total.has[s], total.places)} (${n0(total.has[s])}), then +${pct(total.second_fills[s], total.places)} (${n0(total.second_fills[s])}; second ${by || "none"}${seconds[s].none ? `, none in ${seconds[s].none}` : ""}${seconds[s].ties ? `; ${seconds[s].ties} ties` : ""})`;
    };
    console.log(`  all ${r.books.length} · ${n0(total.places)} places · ${n0(total.entries)} entries · ${n0(total.kq)} ketiv/qere words`);
    for (const s of ["step", "macula", "ubs", "bdb"]) console.log(`    ${share(s)}`);
    console.log(`  STEP's leaves ${n0(receipt.step_leaves.count)} (MACULA ${receipt.step_leaves.with_a_line.macula}, UBS ${receipt.step_leaves.with_a_line.ubs}, BDB ${receipt.step_leaves.with_a_line.bdb}, none ${receipt.step_leaves.with_no_line}${receipt.step_leaves.with_no_line_places.length ? `: ${receipt.step_leaves.with_no_line_places.map((x) => `${x.book} ${x.place}`).join(", ")}` : ""}) · rest fills ${n0(receipt.rest_fills.count)} in ${receipt.rest_fills.books} books · the place reading answers at ${receipt.place_reading_answers.count}`);
    if (receipt.rest_fills.count) console.log(`  rest fills by book: ${Object.entries(receipt.rest_fills.by_book).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([b, k]) => `${b} ${k}`).join(", ")}`);
    const SW = receipt.step_words;
    console.log(`  STEP's words where the page's line may be bare: ${n0(SW.count)} places in ${SW.books} books · naming no row ${SW.naming_no_row} ${JSON.stringify(SW.by_waiting_status)} · on the entry gate's lists ${JSON.stringify(SW.entry_gate)} and ${SW.entry_gate_after_call5} · only a mark ${SW.angle_mark_only} · held where call 4 writes STEP's words with « | » ${SW.held_split.held} (of ${SW.held_split.listed} it lists so)`);
    const SR = receipt.steps_reading_stands;
    console.log(`  STEP's own reading stands (call 4): ${n0(SR.by_class.stands)} of ${n0(SR.listed)} places (${n0(SR.stands.plain_words)} words, ${n0(SR.stands.pairs)} pairs; ${n0(SR.stands.were_bare_before)} rested bare before) · held: « | » ${SR.by_class.held_split}, none ${SR.by_class.none}, a read form of several words ${SR.by_class.read_form_of_several_words} · letters equal ${n0(SR.letters_equal)}, words equal ${n0(SR.stands.words_equal)}`);
    const RB = receipt.step_line_rests_bare;
    console.log(`  STEP has a pick and its line as it rests is bare at ${RB.count} places (pairs ${RB.pair}, held where call 4 writes with « | » ${RB.held_split}): not in has.step, no leaf, in no fill of STEP's or by STEP${RB.count ? `; ${RB.places.map((x) => `${x.book} ${x.place}`).join(", ")}` : ""} · records of the resting lines read ${RB.records.read} (${RB.records.of_the_zone_on_disk} of the zone on disk${RB.records.of_another_zone.length ? `, of another zone: ${RB.records.of_another_zone.join(", ")}` : ""})`);
    const PP = receipt.picks_printed.by_first;
    console.log(`  pills the card prints, under each first (made: no row of the pill's own source under a key the card asks prints it whole, so the card makes it): ${IDS.map((x) => `${PILL[x]}: ${Object.entries(PP[x]).map(([y, t]) => `${PILL[y]} ${n0(t.pills)} (made ${n0(t.made)})`).join(", ") || "none"}`).join(" · ")}`);
    const RW = receipt.runs_read_whole;
    console.log(`  lines at rest over more than one word: ${n0(RW.run_lines)} over ${n0(RW.words)} words; read at every word by ${IDS.map((x) => `${PILL[x]} ${n0(RW.by_source[x].every_word)}`).join(", ")}`);
    console.log(`  signs alone (no pick): ${JSON.stringify(receipt.signs.sign_only_pick1)} · NO DATA YET pick 1s ${receipt.signs.ubs_no_data_yet_pick1} (picks ${receipt.signs.ubs_no_data_yet_picks}) · BDB pick 1s with no highlight ${n0(receipt.bdb.pick1_without_highlight)} · line feeds ${receipt.line_feeds.count}`);
    console.log(`  line picks naming no row: ${IDS.map((s) => `${PILL[s]} ${n0(receipt.line_picks[s].naming_no_row)}`).join(", ")} · first row another source's: ${IDS.map((s) => `${PILL[s]} ${n0(receipt.line_picks[s].first_row_another_sources)}`).join(", ")}`);
    console.log(`  book files ${n0(receipt.sizes.book_files_bytes)} bytes gz (${n0(receipt.sizes.book_files_raw_bytes)} raw) · index ${n0(r.indexBytes.length)} bytes · receipt ${n0(r.receiptBytes.length)} bytes`);
    // write: the kept rules and receipts, the book files, the index, then the receipt; only changed bytes
    const plan = [
      ...r.kept.map((k) => [join(OUT, k.entry.file), k.bytes]),
      ...r.books.map((x) => [join(OUT, `${x.book}.bin`), x.gz]),
      [join(OUT, "index.json"), r.indexBytes],
      [RECEIPT, r.receiptBytes],
    ];
    let moved = 0;
    if (RECEIPT_ONLY) {
      const would = plan.filter(([path, bytes]) => path !== RECEIPT && !(existsSync(path) && readFileSync(path).equals(bytes))).map(([path]) => relative(process.cwd(), path));
      if (would.length) throw new Refused(`--receipt-only: the records of the resting lines as they now stand would move ${would.length} file(s) the records and the lines read (${would.slice(0, 3).join(", ")}${would.length > 3 ? ", ..." : ""}): bake the defaults and read the lines again (round-v1.sh --steps defaults,records,lines)`);
    }
    for (const [path, bytes] of plan) {
      if (RECEIPT_ONLY && path !== RECEIPT) continue;
      const was = existsSync(path) ? readFileSync(path) : null;
      if (was && was.equals(bytes)) continue;
      moved += 1;
      if (DRY) continue;
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, bytes);
    }
    const of = RECEIPT_ONLY ? 1 : plan.length;
    console.log(DRY ? `  --dry: ${moved} of ${of} files would change; nothing written` : moved ? `  wrote ${moved} of ${of} files (${RECEIPT_ONLY ? "the receipt alone: " : `${relative(process.cwd(), OUT) || "."}, `}${relative(process.cwd(), RECEIPT)}) · index sha256 ${sha256Of(r.indexBytes)}` : `  the same as before: nothing written (${of} files)`);
  } catch (e) {
    if (e instanceof Refused || e instanceof PinFault) {
      for (const why of e.whys || [e.message]) console.error(`REFUSED · ${why}`);
      console.error("REFUSED · nothing written");
      process.exit(1);
    }
    throw e;
  }
}
