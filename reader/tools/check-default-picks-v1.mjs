#!/usr/bin/env node
// RUN: tree
// GUARDS: default-picks-rule-v1-each-source-prints-its-own-pick-and-the-source-that-fills-most-of-what-it-leaves-is-its-second
// LEDGER: -
// no frame letter. A check reads the bake, the corpus lane's ledger where this
// machine holds it, and the page, and judges them; it is not the ledger for
// one.
//
// THE DEFAULT SOURCES, HELD TO THE LEDGER AND TO THE PAGE (the owner, 14
// November 2026: «can we serve up each of the default toggles now so its not
// just STEP, thats just one option»; «when they select it maybe it notes to
// them its partial and they need to select a secondary other source to fill
// it out and %s then»; «even if its 99.9% TAHOT you could still auto select a
// second source if it fills in the 0.1%»). Four pills on the row, «STEP»
// «MACULA» «UBS» «BDB», one lit at a time; STEP is today's line and rests
// lit; every source carries a second, the one that fills the most of what it
// leaves in the book, or the reader's own; where both leave a word, today's
// line stands. tools/bake-default-picks-v1.mjs lays the corpus lane's picks
// (default picks v1, with the v1.1 STEP mend and the v1.2 STEP and BDB
// mends) on the zones; this check never imports its reader, its counter or
// its share function, only its rule id, and hashes with node's own sha256: a
// check that reads the ledger the way the bake reads it proves only that one
// function agrees with itself.
//
// One counting rule, held here as the bake and the page hold it. A pick's
// words are a line pick where they hold a letter or a digit and are not
// «NO DATA YET»: a sign or a stop alone (UBS's «-», MACULA's «?» and «`») is
// no pick for any source. At place n (WORD_N: one-based over every entry,
// marks included, in section order): STEP has a line where its mended pick 1
// is a line pick, or where the zone's place pieces are all there and each
// carries words, and where its line as it rests draws one; MACULA, UBS and
// BDB have none at a ketiv/qere word; MACULA has one where its pick is a
// line pick; UBS where some piece's pick 1 is one; BDB where its pick 1's
// record's highlighted words are one. fills[x][y] counts the places where x
// has no line and y has one; at a place where STEP's line rests bare no fill
// of STEP's or by STEP counts it, and the other sources' count it as anywhere
// else. A share is printed from its own count, never as a remainder.
//
// THE LINE AS IT RESTS. STEP's own words are never drawn at a pair or at a
// place call 4 holds (below); where the place pieces do not answer there,
// today's line stands, and where the page's own record of the resting lines
// (data/resting-lines/<book>.json.gz) holds no line over the word, STEP's
// line as it rests is bare: STEP has no line there, the place is not one
// STEP leaves (its second fills only those), and it counts in no fill of
// STEP's or by STEP; the other sources' has and fills count it as anywhere
// else. The
// record's line there is today's whether or not it was read with the
// defaults laid, since they move nothing there.
//
// THE LINE UNDER STEP (the owner's question 2 of 14 November, recommendation
// B) is today's line wherever that prints words; where today's line is bare
// and STEP has a pick, it is STEP's own pick 1 words, credited to STEP (M4),
// drawn as the page draws a reading's packing (a "/" a joint); STEP's second
// fills only the places STEP leaves, where STEP has no pick at all. The index
// carries STEP's words at every place they may fill (step_words: no pair, the
// zone's pieces do not answer, STEP's pick 1 a line pick of its reading, and
// not a place the corpus lane's call 4, relay v189, writes with « | », where
// the ledger's pick 1 is only the first of two TAHOT words); which of them are
// bare is read off the page.
//
// NODE LAWS, over all 39 books:
//   D0  the rule this check guards is the rule the bake declares, and the one
//       the index, every book file and the receipt carry; the index's sources
//       are the plan's fixed table (STEP M4 and M19, MACULA M3, UBS M18, BDB
//       M46)
//   D1  the bake is the ledger: (a) every pinned file and every ledger book
//       file is the bytes named; (b) every place's picks are this check's own
//       parse of the ledger with the mends applied, and a book file holds a
//       place for every entry of its zone; (c) the kinds are the receipts':
//       after v1.1, the variants and alternatives each as receipt-v1.1's
//       in_v1 less those that fall together, the picks changed by kind as it
//       says; after v1.2, the places, picks gained by kind, the variants
//       behind a broken bar, the places with no STEP pick, the BDB mend and
//       the rows as receipt-v1.2 says, and the kinds v1.1's with the gain
//       (r 305,481, v 908, a 5,404); (d) every book file is the bytes the
//       index names, and its zone (entries, places and the sha256 of its
//       place labels) is the zone on disk (judged without the ledger too).
//       --ledger naming a folder that does not hold the ledger is a fault
//   D2  every row a pick names is found again in the served store under its
//       key, with its rank, its source id and its text's sha256, or where
//       the row-strikes record says it went since the store v1.2 read
//       (tools/row-strikes-follow-v1.mjs): a row a round moved to another
//       key is found under the name it has now; a row a round struck is
//       named by no pick any more; a row a round withheld is counted as
//       withheld with the picks that name it; anything else is missing. The
//       receipt's own account of those rows is this recount's. The picks
//       that wait on call 5's re-key each name a row still under its key
//       with a maqaf or one that now stands under the plain key its line
//       names. A row found twice is counted and named
//   D3  the index's counts (has, fills, the places STEP leaves, the places
//       STEP's words may fill) are those this check counts from the book
//       files, the zones and the records of the resting lines (where STEP's
//       line rests bare, which the receipt lists too); the second source of
//       every first in every book follows the row's order on a tie, and is
//       the one the receipt names
//   D5  (node) no place STEP leaves is one the zone's place pieces answer, or
//       a pair; the fills at rest are counted, and the record's lines at the
//       places STEP's words may fill (those it draws bare are the words that
//       gain STEP's words at rest) and at the places call 4 holds (those it
//       draws bare stay bare), each counted here; and over every record read
//       with the default sources laid (its read_off.state says so), at every
//       place STEP's words may fill: a line is drawn, and one under STEP's
//       credit that is not today's (no TAHOT row under a key the card asks
//       there is drawn so) is STEP's words as the line draws them (a "/" a
//       joint, a piece that is a sign alone the hidden sign's gap)
//   D20 (node) the receipt's pills the card prints (picks_printed) are this
//       check's: under each first and its second, each source's pills where
//       its words print (STEP's own words only where they print, read off the
//       records as D5 reads them), and those the card makes, where no row of
//       the pill's own source under a key the card asks (the word's own, its
//       pieces') prints it whole
//   D19 (node) the source words the page prints whole: at rest none holds a
//       "/"; under each source none is a text a TAHOT (M4) row prints in that
//       book; and the rows of the whole store that print one of them are the
//       two measured on 14 November, listed
//
// PAGE LAWS, on works found from the data, never named here: w1 the smallest
// work (fewest places) holding a place both STEP and its second leave; w2 the
// smallest where STEP has no second; w3 the smallest with a fill at rest at a
// word today's line draws bare; w4 a work on disk the index does not list.
// "Today's line" is read off the page itself, with the index refused, so the
// page draws no default layer (the risk the plan guards: the index fails to
// load and the page stands as it was).
//   D4  a first visit: «STEP» alone is pressed, the pills are the index's in
//       its order, the note is hidden, nothing is kept, the second is the one
//       counted here, and the Menu mirrors the four pills and no chooser
//   D5  at rest every line is today's, byte for byte, except exactly at the
//       places STEP leaves that its second fills, and at the places today's
//       line draws bare where STEP's words may fill: there the second's line
//       under the second's chip, or STEP's words under STEP's, and its card
//       pressed on it
//   D6  each pill, pressed on the row and in the Menu, leaves one lit; the
//       choice is kept and a reload keeps it, ?default= is not kept; the note
//       shows by its rule, its shares are this check's of the index's counts,
//       and it says only what is true of the line as drawn (STEP's: what its
//       layer is, the line as it rests, then the share where STEP has its
//       own reading and that line stands; a source STEP's layer fills out is
//       filled out by «the line as it rests»); a lit pill pressed again does
//       what the plan says
//   D7  under each source, every line of w1-w3 is the model: a pair keeps
//       today's line, a joined run keeps its line unless the source reads
//       every word of it, a word of a reading the place gives across words
//       («Beth-» «-lehem», «Tubal-» «Cain»: a reading ending with a hyphen
//       goes on in the next word) keeps its line unless one source has a line
//       at every word of it, else the source's line, else the second's (STEP
//       as a second is the line under STEP: today's line, or STEP's words
//       where today's is bare), else today's line
//   D8  the second can be changed: the lines that move are the model's, the
//       note follows, the choice is kept for that source, reset brings auto
//   D9  a ruling outranks a source, across switching, across joined words
//       out and back, and back on STEP
//   D10 reset from a source with a chosen second and a ruling: STEP with its
//       auto second, every line the record's
//   D11 back on STEP after each source is the first paint: every line, and
//       the first five cards
//   D12 the card answers as the line under each source, on the first twenty
//       words; at rest the card's line of the place's pieces names whose
//       pieces they are («here STEP reads » where they are TAHOT's, «here
//       MACULA reads » where they are MACULA's: every place of w1-w3 whose
//       pieces are MACULA's alone, found in the zone, is opened for it), and
//       the BSB's line stays
//   D13 a source's picks 2..n stand on the card in the ledger's order, UBS's
//       numbered in each piece, a variant's letter as given; STEP's after its
//       pieces' line where the pieces are TAHOT's, else on its own line (the
//       sample holds every place whose pieces are MACULA's alone and the
//       first with no pieces that answer, where STEP has picks 2..n)
//   D14 w4: no pills, no note, no book file asked, its lines the record's
//   D15 the index is asked once, at boot; the book file not at rest, once at
//       the first card, at load under a kept source; refused, every line is
//       the line as it rests (the layer under STEP), the note says it could
//       not be fetched, nothing throws
//   D16 no page error anywhere, and every reading came to rest
//   D17 under «oldest first» no pill is lit and the line is today's; a pill
//       pressed puts the line back on «the source here»
//   D18 a source switched off: its pill cannot be pressed, the second is found
//       again among the sources on, no chip names it
//   D19 (page) at rest no line prints a "/" that today's line does not
//
// THE FAULT HARNESS (--self-test): each law is run again on a fault and must
// go red, said "  ok  Hn the law went red as it should". Node side, on copies
// held in memory: H1 one STEP pick's words changed (D1), H2 v1.2's mend left
// off at one place (D1), H3 one row's sha16 flipped (D2), H4 one tie broken
// the other way (D3), H5 a sign alone and BDB's picks with no words counted
// as lines, and that fault only (D3), H13 an index whose has.step counts the
// places where STEP's line rests bare (D3). Page side: H6 the left share printed
// as a remainder (D6, on the page's own notes; under --node not judged
// here). Through p.route,
// never touching the disk: H7 one MACULA pick changed in a served book file
// (D7 red at exactly that place), H8 the book file refused (D15 stays green),
// H9 an index with other fills (D4), H10 a source kept before a "first visit"
// (D4, and the state the resting lines record, read by linesInPage, is one
// bake-resting-lines-v1's own refusal, defaultsNotAtRest, refuses). On the
// cards of w1 at rest, read as they are and again with a fault: H11 the line
// of the pieces naming STEP at the places whose pieces are MACULA's alone
// (D12), H12 STEP's picks 2..n dropped from its own line at the places D13
// samples so (D13).
//
// Without --ledger, D1 (but d) and D2 say "not judged here"; with --ledger
// naming a folder that does not hold every pinned file, they fail. --node
// judges the node laws only (the round runs it so, after the bake). Nothing
// printed holds Hebrew: a text from a source is printed with any Hebrew as
// U+ codes.
//
// Run: node tools/check-default-picks-v1.mjs [--ledger <dir holding default-picks-v1/, default-picks-v1.1/ and default-picks-v1.2/>] [--node] [--self-test]
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { linesOnPage, readRecord, recordPath } from "./resting-lines-v1.mjs";
import { DEFAULT_PICKS_RULE_ID } from "./bake-default-picks-v1.mjs";
import { defaultsNotAtRest } from "./bake-resting-lines-v1.mjs";
import { openFollower, FollowFault } from "./row-strikes-follow-v1.mjs";
import { routePrinted, signsOff } from "./gloss-store-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const DP = join(K3, "data", "default-picks");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };
const LEDGER = arg("ledger");
// --ledger given at all: a folder that does not hold the ledger is then a fault, not a machine without it
const LEDGER_ASKED = process.argv.includes("--ledger");
const NODE_ONLY = process.argv.includes("--node");
const SELF_TEST = process.argv.includes("--self-test");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const side = (n, d) => console.log(`  --  ${n}${d ? "  ·  " + d : ""}`);
const first = (list, k = 3) => list.slice(0, k).join(" | ");
// a text from a source, printed with any Hebrew as its U+ codes
const plain = (t) => String(t).replace(/[\u0590-\u05FF\uFB1D-\uFB4F]/gu, (c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
const said = (t, k = 48) => `«${plain(String(t).length > k ? `${String(t).slice(0, k)}…` : t)}»`;
const n0 = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const readGz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- the rule's own words, held here ----------------------------------------------------------------------------
const NO_DATA_YET = "NO DATA YET";
const THE_ENTRY = "the entry";
const POINT = /^point\d+:([^.:\s]+)\.$/u;
const SENSE_SAYS = " · sense ";
const SLOT = { step: 0, macula: 1, ubs: 2, bdb: 3 };   // the book file's slots, DEFAULT_PICKS_BOOK_V1
const KIND_OF = { r: 0, v: 1, a: 2 };
const hasText = (s) => typeof s === "string" && s.length > 0;
const wordy = (s) => typeof s === "string" && /[\p{L}\p{N}]/u.test(s);
// a pick's words that are a line pick, for every source: a letter or a digit, and not «NO DATA YET»
const linePick = (t) => wordy(t) && t !== NO_DATA_YET;
// the pills and the M ids each credits, as the plan's table fixes them (§1, §2.4): never read from the index judged
const FIXED_SOURCES = [
  { id: "step", pill: "STEP", m: { r: "M4", v: "M19", a: "M19" } },
  { id: "macula", pill: "MACULA", m: "M3" },
  { id: "ubs", pill: "UBS", m: "M18" },
  { id: "bdb", pill: "BDB", m: "M46" },
];
// the cause receipt-v1.2 gives the one pick v1.2 adds where v1.1 had picks
const BROKEN_BAR = "a second variant behind a broken bar";
// a share as the note prints it: 0, all, under a tenth, over 99.9, else floored to one decimal
const pct = (c, all) => {
  if (!all || !c || c <= 0) return "0%";
  if (c >= all) return "100%";
  if (c * 1000 < all) return "<0.1%";
  if (c * 1000 >= 999 * all) return ">99.9%";
  return `${(Math.floor((1000 * c) / all) / 10).toFixed(1)}%`;
};
// the text the page draws for a source's own words: whole (the source words of spanJoin), a closing stop dropped
const drawn = (t) => String(t).trim().replace(/\.$/u, "");
// the text the page draws for STEP's own words: a reading's packing, each "/" a joint (spanJoin), as the place
// reading's pieces are drawn, a closing stop dropped
const packed = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");
// STEP's words as the line draws them at rest: their packing under the signs switch at rest, a piece that is a sign
// alone, beside pieces that carry words, drawn as the hidden sign's gap (the page's signsOffLine, which S1 of
// check-same-product-v1 holds too): «<on>/ thousands/ his» is the gap, then «thousands + his»
const drawnStep = (t) => signsOff(packed(t));
// a line read off the page that draws no words: none, or only the hidden sign's gap
const blank = (t) => !String(t || "").replace(/\u200b/gu, "").trim();
// a line and a pill read alike: a "/" and a "+" both a joint, a closing stop dropped
const fold = (t) => String(t || "").replace(/\s*[/+]\s*/gu, " + ").replace(/\s+/gu, " ").trim().replace(/\.$/u, "");

// ---- what is on the disk ----------------------------------------------------------------------------------------
const INDEX_PATH = join(DP, "index.json");
if (!existsSync(INDEX_PATH)) { console.log("SKIPPED — no data/default-picks/index.json: the default picks are not baked on this tree (tools/bake-default-picks-v1.mjs)"); process.exit(3); }
const INDEX_BYTES = readFileSync(INDEX_PATH);
const IX = JSON.parse(INDEX_BYTES.toString("utf8"));
const PIN = readJson(join(DP, "PIN.json"));
const RECEIPT_PATH = join(K3, "data", "default-picks-receipt-v1.json");
const RECEIPT = existsSync(RECEIPT_PATH) ? readJson(RECEIPT_PATH) : null;
const IDS = (IX.sources || []).map((s) => s.id);
const PILL = Object.fromEntries((IX.sources || []).map((s) => [s.id, s.pill]));
const MOF = (id, kind = "r") => { const s = (IX.sources || []).find((x) => x.id === id); return !s ? null : typeof s.m === "string" ? s.m : s.m[kind]; };
const BOOKS = Object.keys(IX.books || {});
const zoneRead = (b) => readGz(join(K3, "data", "zones", `${b}.bin`));
const bookFileOf = new Map();
const bookRead = (b) => { if (!bookFileOf.has(b)) bookFileOf.set(b, readGz(join(DP, IX.books[b].file))); return bookFileOf.get(b); };
console.log(`— ${DEFAULT_PICKS_RULE_ID} —`);
console.log(`${BOOKS.length} books in the index · sources ${IDS.map((s) => PILL[s]).join(", ")} · ledger ${LEDGER || "not on this machine"}${NODE_ONLY ? " · node laws only" : ""}${SELF_TEST ? " · the fault harness" : ""}`);

// ---- the counting rule, over a zone and a book file -------------------------------------------------------------
const pgAnswers = (w) => Array.isArray(w.pg) && w.pg.length > 0 && w.pg.every((x) => String((x && x.g) || "").trim() !== "");
/** A zone's words with their place: n (WORD_N), the section i, the entry e within it, the label the ledger names
 *  (section label and the word's number among the section's words that are not marks), whether it is a pair word,
 *  whether its place pieces answer, and its keys. Kept per book, the zone itself let go. */
const placesOf = (zone) => {
  const out = [];
  let n = 0;
  (zone.sections || []).forEach((sec, i) => {
    let k = 0;
    (sec.words || []).forEach((w, e) => {
      n += 1;
      const mark = !!(w && w.mark);
      out.push({ n, i, e, mark, label: mark ? null : `${sec.label}:${++k}`, k: mark ? 0 : k, kq: !!(w && w.kq), pgA: !mark && pgAnswers(w),
        // whose the place's pieces are, by the lattice's witness on each (tahot, macula)
        pgS: mark || !Array.isArray(w.pg) ? [] : [...new Set(w.pg.map((x) => x && x.s).filter(Boolean))],
        // whether the place's reading, as its pieces print it, ends with a hyphen: it goes on in the next word, a
        // reading the place gives across words (TAHOT's «from/ Beth-» «-lehem», «Tubal-» «Cain»), held together on
        // the line (acrossOf)
        endsHalf: !mark && pgAnswers(w) && /-$/u.test(String(w.pg[w.pg.length - 1].g).trim()),
        keys: mark ? [] : [w.k, ...(Array.isArray(w.pg) ? w.pg.map((x) => x && x.k) : [])].filter(Boolean) });
    });
  });
  return out;
};
const slimOf = new Map();
/** A book's places, its work's name and the texts of its baked table, read once. */
const slim = (b) => {
  if (!slimOf.has(b)) { const z = zoneRead(b); slimOf.set(b, { places: placesOf(z), work: z.work || b, gloss: Object.values(z.gloss || {}).filter((v) => typeof v === "string" && v.includes("/")), sections: (z.sections || []).map((s) => ({ label: String(s.label), words: (s.words || []).length })) }); }
  return slimOf.get(b);
};
/** A source's line at a place, as the rule reads it from the book file: true for STEP (whose words the line prints
 *  only where today's line is bare, step_words), the text for the others, null where it has none. `any` is the fault
 *  H5, and only it: a sign alone and BDB's picks with no words counted as lines; a pair word is still no line. */
const lineAt = (bf, p, src, any = false, pairs = true) => {
  const at = bf.places[p.n - 1];
  const ok = (t) => (any ? hasText(t) : linePick(t));
  if (src === "step") { const s = at && at[0]; return (Array.isArray(s) && s.length && ok(s[0][1])) || p.pgA ? true : null; }
  if ((p.kq && pairs) || !at) return null;
  const slot = at[SLOT[src]];
  if (!slot) return null;
  if (src === "macula") return ok(slot) ? slot : null;
  if (src === "ubs") {
    const seen = new Set(), parts = [];
    for (const [piece, words] of slot[1] || []) {
      if (seen.has(piece)) continue;
      seen.add(piece);
      if (ok(words)) parts.push(words);
    }
    return parts.length ? parts.join(" + ") : null;
  }
  if (src === "bdb") {
    const [sense, w] = slot[0] || [];
    const words = w ? bf.bdb_words[w - 1] : null;
    if (!hasText(words)) return any ? "" : null;
    if (!ok(words)) return null;
    return sense !== "" ? `${words}${SENSE_SAYS}${sense}` : words;
  }
  return null;
};
/** The places the corpus lane's call 4 (relay v189) writes STEP's words with « | »: STEP reads the written word as two
 *  TAHOT words and the ledger's pick 1 is the first only. Read here from the copy kept in the tree, held to its pin. */
const SPLIT_HELD = (() => {
  const e = PIN.held_split_v189;
  const p = e && typeof e.file === "string" ? join(DP, e.file) : null;
  if (!p || !existsSync(p)) return { set: new Set(), fault: "the pin names no kept copy of call 4 (held_split_v189), or it is not here" };
  const bytes = readFileSync(p);
  const lines = bytes.toString("utf8").split("\n").filter(Boolean);
  if (bytes.length !== e.bytes || sha256(bytes) !== e.sha256 || lines.length !== e.lines) return { set: new Set(), fault: `${e.file}: ${bytes.length} bytes, ${lines.length} lines, sha ${sha256(bytes).slice(0, 12)}, not its pin's` };
  return { set: new Set(lines.map((l) => JSON.parse(l)).filter((d) => typeof d.steps_words === "string" && d.steps_words.includes(" | ")).map((d) => `${d.book} ${d.p}`)), fault: null };
})();
/** STEP's own words at a place where they may fill the line: no pair, the zone's pieces do not answer, STEP's pick 1
 *  is a line pick of its reading (kind r, credited M4), and call 4 does not write the place with « | »; else null. */
const stepWordsAt = (bf, p, b) => {
  if (p.mark || p.kq || p.pgA || SPLIT_HELD.set.has(`${b} ${p.label}`)) return null;
  const s = (bf.places[p.n - 1] || [])[SLOT.step];
  return Array.isArray(s) && s.length && s[0][0] === KIND_OF.r && linePick(s[0][1]) ? s[0][1] : null;
};
/** The page's own record of the line at rest for a work (data/resting-lines/<work>.json.gz), read once. */
const RECORDS = new Map();
const recordOf = (b) => { if (!RECORDS.has(b)) RECORDS.set(b, readRecord(recordPath(K3, b))); return RECORDS.get(b); };
/** Whether STEP has a pick at a place and its line as it rests is bare there: a pair, or a place call 4 holds, whose
 *  pieces do not answer, STEP's pick 1 a line pick, and no line of the record over the word. null where the work has
 *  no record, so it cannot be told. */
const restsBareAt = (bf, p, b) => {
  if (p.mark || p.pgA || !(p.kq || SPLIT_HELD.set.has(`${b} ${p.label}`))) return false;
  const s = (bf.places[p.n - 1] || [])[SLOT.step];
  if (!(Array.isArray(s) && s.length && linePick(s[0][1]))) return false;
  const rec = recordOf(b);
  if (!rec || !Array.isArray(rec.sections) || !rec.sections[p.i]) return null;
  return !(rec.sections[p.i][1] || []).some((u) => Array.isArray(u) && p.e >= u[0] && p.e < u[0] + u[1]);
};
/** The counts the index carries for a book, made here from the zone, the book file and the record of its resting
 *  lines; with the places STEP's line rests bare at, and those it cannot tell for want of a record. */
const countBook = (within, bf, any = false, b = bf.book) => {
  const has = Object.fromEntries(IDS.map((s) => [s, 0]));
  const fills = Object.fromEntries(IDS.map((x) => [x, Object.fromEntries(IDS.filter((y) => y !== x).map((y) => [y, 0]))]));
  const leaves = [], words = [], bare = [], unknown = [];
  let places = 0, kq = 0, entries = 0;
  for (const p of within) {
    entries += 1;
    if (p.mark) continue;
    places += 1;
    if (p.kq) kq += 1;
    const line = Object.fromEntries(IDS.map((s) => [s, lineAt(bf, p, s, any) !== null]));
    const rests = restsBareAt(bf, p, b);
    if (rests === null) unknown.push(p.label);
    if (rests) { bare.push(p.label); line.step = false; }
    for (const x of IDS) {
      if (line[x]) { has[x] += 1; continue; }
      // where STEP's line rests bare its second fills nothing: it fills the places STEP leaves, and only them
      if (x === "step" && rests) continue;
      for (const y of IDS) if (y !== x && line[y]) fills[x][y] += 1;
    }
    if (!line.step && !rests && !p.kq) {
      const at = bf.places[p.n - 1];
      const b0 = at && at[SLOT.bdb] ? at[SLOT.bdb][0] : null;
      const bw = b0 && b0[1] ? bf.bdb_words[b0[1] - 1] : null;
      leaves.push([p.n, lineAt(bf, p, "macula") || 0, lineAt(bf, p, "ubs") || 0, line.bdb && hasText(bw) ? [b0[0], bw] : 0]);
    }
    const sw = stepWordsAt(bf, p, b);
    if (sw !== null) words.push([p.n, sw]);
  }
  return { entries, places, kq, has, fills, step_leaves: leaves, step_words: words, bare, unknown };
};
/** The second source: of the other sources on, the one that fills most of what x leaves, a tie to the earlier in
 *  `order`; none where every fill is 0. */
const autoSecond = (fills, x, on = IDS, order = IDS) => {
  let best = null;
  for (const y of order) if (y !== x && on.includes(y) && fills[x][y] > 0 && (best === null || fills[x][y] > fills[x][best])) best = y;
  return best;
};
const tied = (fills, x, best) => !!best && IDS.some((y) => y !== x && y !== best && fills[x][y] === fills[x][best]);
// a leaf's line for a source, as the index carries it
const leafLine = (leaf, src) => {
  if (!leaf) return null;
  if (src === "macula") return hasText(leaf[1]) ? leaf[1] : null;
  if (src === "ubs") return hasText(leaf[2]) ? leaf[2] : null;
  if (src === "bdb") { const b = leaf[3]; return Array.isArray(b) && hasText(b[1]) ? (b[0] !== "" ? `${b[1]}${SENSE_SAYS}${b[0]}` : b[1]) : null; }
  return null;
};
/** The note's sentences, each share from its own count, said only of the line as drawn (the lead's rule of 14
 *  November 2026): STEP's layer is the line as it rests, so STEP's note says what that layer is and then the share
 *  where STEP has its own reading and that line stands (has.step, which leaves out a held place or a pair whose line
 *  rests bare), and a source filled out by STEP's layer is filled out by «the line as it rests»;
 *  `left` prints the share today's line keeps (the fault H6 prints it as a remainder). `macula` is the number of the
 *  book's words whose place pieces are MACULA's alone, which STEP's layer names. */
const AS_IT_RESTS = "the line as it rests";
const upFirst = (t) => `${t[0].toUpperCase()}${t.slice(1)}`;
const stepLayerSay = (macula) => `${AS_IT_RESTS}: ${macula ? `the place’s own reading (TAHOT’s, and MACULA’s at ${n0(macula)} word${macula === 1 ? "" : "s"})` : "TAHOT’s reading at the place"}, STEP’s own words only where today’s line was bare, and elsewhere today’s line, whose chip names its own source`;
const maculaPiecesIn = (b) => slim(b).places.filter((p) => same(p.pgS, ["macula"])).length;
const leftOwn = (c, b, hx, N) => (c > 0 ? pct(c, N) : null);
const noteSay = ({ first, second, auto, counts, work, left = leftOwn, macula = 0 }) => {
  const N = counts.places, hx = counts.has[first];
  const X = PILL[first];
  const b = second ? counts.fills[first][second] : 0;
  const c = N - hx - b, l = left(c, b, hx, N);
  const chosen = second === auto ? ", chosen for this book." : ".";
  if (first === "step") {
    const s = `${upFirst(stepLayerSay(macula))}.`;
    if (hx >= N) return `${s} STEP has its own reading, and this line stands, at every word of ${work}.`;
    let t = `${s} STEP has its own reading, and this line stands, at ${pct(hx, N)} of ${work}.`;
    // a second fills only where STEP has none; the rest said of the line as drawn: where STEP's line rests bare it
    // may still have a pick, held, or at a pair
    if (second) t += ` Where STEP has none, ${PILL[second]} fills out ${pct(b, N)}${chosen}`;
    if (l) t += ` Today’s line stands at the other ${l}.`;
    return t;
  }
  if (hx >= N) return `${X} reads every word of ${work}.`;
  let s = `${X} is partial: its own reading at ${pct(hx, N)} of ${work}.`;
  s += second ? ` ${second === "step" ? upFirst(AS_IT_RESTS) : PILL[second]} fills out ${pct(b, N)}${chosen}` : " No other source reads the rest.";
  if (l) s += ` Today’s line stands at the other ${l}.`;
  return s;
};
// the fault H6: the share today's line keeps, printed as what the two shares before it leave of a hundred
const leftRemainder = (c, b, hx, N) => {
  const fl = (x) => (x >= N ? 100 : Math.floor((1000 * x) / N) / 10);
  const r = Math.round((100 - fl(hx) - fl(b)) * 10) / 10;
  return r > 0 ? `${r.toFixed(1)}%` : null;
};
// the chooser's buttons: every other source, with what it would fill; none where no other source fills anything
const chooserSays = (first, second, counts, on = IDS) => (IDS.some((y) => y !== first && counts.fills[first][y] > 0) ? IDS.filter((y) => y !== first).map((y) => ({
  y, text: `${PILL[y]} ${pct(counts.fills[first][y], counts.places)}`, pressed: y === second, disabled: !counts.fills[first][y] || !on.includes(y),
})) : []);

// ---- the ledger, parsed here ------------------------------------------------------------------------------------
const PINNED = ["rule", "receipt", "rows", "amendment", "receipt_v1_1", "mend", "rows_added",
  "amendment_v1_2", "receipt_v1_2", "mend_v1_2", "bdb_mend_v1_2", "rows_added_v1_2",
  "picks_waiting_v1_2", "entry_gate_v1_2", "entry_gate_after_call5_v1_2", "call5_repoints_v1_2", "branch_merged_v1_2", "branch_small_letter_v1_2"];
const ledgerFile = (rel) => join(LEDGER, rel);
// the ledger is here only where the folder --ledger names holds every pinned file; --ledger naming a folder that
// does not, or naming none, is a fault said under D1 and D2, never a machine without the ledger
const ledgerLacks = LEDGER ? PINNED.filter((k) => !PIN[k] || !existsSync(ledgerFile(PIN[k].file))).map((k) => (PIN[k] ? PIN[k].file : k)) : [];
const ledgerHere = !!LEDGER && !ledgerLacks.length;
const ledgerFault = LEDGER_ASKED && !ledgerHere
  ? (LEDGER ? `--ledger names ${LEDGER}, which holds no ${ledgerLacks.slice(0, 3).join(", ")}${ledgerLacks.length > 3 ? ` and ${ledgerLacks.length - 3} more` : ""}` : "--ledger names no folder")
  : null;
const linesOfFile = (p) => readFileSync(p, "utf8").split("\n").filter((l) => l.length).map((l) => JSON.parse(l));
let MEND11 = null, MEND12 = null, BDB12 = null, R1 = null, R11 = null, R12 = null;
if (ledgerHere) {
  R1 = JSON.parse(readFileSync(ledgerFile(PIN.receipt.file), "utf8"));
  R11 = JSON.parse(readFileSync(ledgerFile(PIN.receipt_v1_1.file), "utf8"));
  R12 = JSON.parse(readFileSync(ledgerFile(PIN.receipt_v1_2.file), "utf8"));
  const byPlace = (k, slot) => new Map(linesOfFile(ledgerFile(PIN[k].file)).map((d) => [`${d.book} ${d.p}`, d[slot]]));
  MEND11 = byPlace("mend", "step");
  MEND12 = byPlace("mend_v1_2", "step");
  BDB12 = byPlace("bdb_mend_v1_2", "bdb");
}
const senseOf = (x) => (x[2] === THE_ENTRY ? "" : (POINT.exec(String(x[2])) || [])[1]);
const KINDS0 = () => ({ r: 0, v: 0, a: 0 });
/** A book's places as this check reads the ledger: the slots each book-file place must hold, v1.1's mend applied
 *  over v1 and v1.2's over v1.1 (or, for the fault H2, v1.2's left off at `skip`); and the kinds of STEP's picks at
 *  each layer, with what each mend did: v1's variants and alternatives found again in v1.1's list by kind and
 *  entry (one not found fell together, one found with other words, rows or meaning was changed), and the places
 *  and picks v1.2 gains where v1.1 has none, or adds where it has some. */
const REFS = new Map();   // row number -> how many picks name it after the mends, counted as D1 reads the books (for D2)
const expectedPlaces = (book, lines, zp, { skip = null, refs = null } = {}) => {
  const names = (list) => { if (refs) for (const r of Array.isArray(list) ? list : []) refs.set(r, (refs.get(r) || 0) + 1); };
  const words = zp.filter((p) => !p.mark);
  const out = new Array(zp.length).fill(null);
  const faults = [];
  if (words.length !== lines.length) faults.push(`${book}: the zone has ${n0(words.length)} words and the ledger ${n0(lines.length)} places`);
  const kinds = { v1: KINDS0(), v1_1: KINDS0(), v1_2: KINDS0() };
  const m11 = { changed: { v: 0, a: 0 }, merged: { v: 0, a: 0 } };
  const m12 = { gained_places: 0, gained: KINDS0(), added: 0, added_not_v: 0, none_v1_1: 0, none_v1_2: 0 };
  const bdbM = { places: 0, before: 0, after: 0 };
  const per = { step: {}, macula: {}, ubs: {}, bdb: {} };
  const tally = (s, k) => { const b = k >= 3 ? "3+" : String(k); per[s][b] = (per[s][b] || 0) + 1; };
  const count = (into, list) => { for (const x of list) if (x[1] in into) into[x[1]] += 1; };
  words.forEach((p, i) => {
    const d = lines[i];
    if (!d || d.p !== p.label) { if (faults.length < 5) faults.push(`${book}: ledger line ${i + 1} is ${d ? d.p : "missing"} and the zone's word there is ${p.label}`); return; }
    const key = `${book} ${d.p}`;
    const v1 = Array.isArray(d.step) ? d.step : [];
    count(kinds.v1, v1);
    tally("step", v1.length);
    const s11 = MEND11.has(key) ? MEND11.get(key) : v1;
    if (MEND11.has(key)) {
      let j = 0;
      for (const x of v1) {
        if (x[1] === "r") continue;
        let k = j;
        while (k < s11.length && !(s11[k][1] === x[1] && s11[k][2] === x[2])) k += 1;
        if (k >= s11.length) { if (x[1] in m11.merged) m11.merged[x[1]] += 1; continue; }
        if (!same(x.slice(1), s11[k].slice(1)) && x[1] in m11.changed) m11.changed[x[1]] += 1;
        j = k + 1;
      }
    }
    count(kinds.v1_1, s11);
    if (!s11.length) m12.none_v1_1 += 1;
    const mended = MEND12.has(key) && key !== skip;
    const st = mended ? MEND12.get(key) : s11;
    if (mended && !s11.length) { m12.gained_places += 1; count(m12.gained, st); }
    else if (mended) for (const x of st.slice(s11.length)) { m12.added += 1; if (x[1] !== "v") m12.added_not_v += 1; }
    count(kinds.v1_2, st);
    if (!st.length) m12.none_v1_2 += 1;
    const step = st.map((x) => { const it = [KIND_OF[x[1]], hasText(x[4]) ? x[4] : 0]; if (x[1] === "v") it.push(x[6][0]); return it; });
    for (const x of st) names(x[5]);
    if (d.macula && Array.isArray(d.macula[1])) for (const pc of d.macula[1]) names(Array.isArray(pc) ? pc[3] : null);
    const mac = d.macula && hasText(d.macula[0]) ? d.macula[0] : 0;
    tally("macula", d.macula ? 1 : 0);
    const picks = [], parts = [];
    let most = 0;
    (d.ubs || []).forEach((pc, pi) => {
      const list = pc[2] || [];
      most = Math.max(most, list.length);
      list.forEach((x) => { picks.push([pi, hasText(x[2]) ? x[2] : 0]); names(x[3]); });
      if (list.length && linePick(list[0][2])) parts.push(list[0][2]);
    });
    tally("ubs", most);
    const ubs = picks.length ? [parts.length ? parts.join(" + ") : 0, picks] : 0;
    const v1Bdb = d.bdb || [];
    tally("bdb", v1Bdb.length);
    const bdbList = BDB12.has(key) ? BDB12.get(key) : v1Bdb;
    if (BDB12.has(key)) { bdbM.places += 1; bdbM.before += v1Bdb.length; bdbM.after += bdbList.length; }
    for (const x of bdbList) names(x[4]);
    const bdb = bdbList.length ? bdbList.map((x) => [senseOf(x), hasText(x[5]) ? x[5] : 0]) : 0;
    const slots = [step.length ? step : 0, mac, ubs, bdb];
    out[p.n - 1] = slots.every((s) => s === 0) ? null : slots;
  });
  return { places: out, faults, kinds, m11, m12, bdbM, per };
};
/** Where a book file's places differ from the ledger's, each place's BDB words read through bdb_words. */
const placesDiffer = (book, bf, want) => {
  const got = (bf.places || []).map((at) => (at && at[SLOT.bdb] ? [...at.slice(0, 3), at[SLOT.bdb].map(([s, w]) => [s, w ? bf.bdb_words[w - 1] : 0])] : at));
  const out = [];
  if (got.length !== want.length) out.push(`${book}: the book file holds ${n0(got.length)} places and the zone ${n0(want.length)} entries`);
  for (let i = 0; i < Math.min(got.length, want.length); i += 1) if (!same(got[i], want[i])) out.push(`${book} n ${i + 1}: the file holds ${plain(JSON.stringify(got[i])).slice(0, 90)}, the ledger ${plain(JSON.stringify(want[i])).slice(0, 90)}`);
  return out;
};

// ---- D0 · the rule, and the sources ----------------------------------------------------------------------------
{
  const guarded = (/^\/\/ GUARDS:\s*(\S+)/mu.exec(readFileSync(fileURLToPath(import.meta.url), "utf8")) || [])[1];
  const others = [];
  if (IX.rule_id !== DEFAULT_PICKS_RULE_ID) others.push(`the index carries ${IX.rule_id}`);
  if (RECEIPT && RECEIPT.rule_id !== DEFAULT_PICKS_RULE_ID) others.push(`the receipt carries ${RECEIPT.rule_id}`);
  for (const b of BOOKS) { const f = bookRead(b); if (f.rule_id !== DEFAULT_PICKS_RULE_ID) others.push(`${b}.bin carries ${f.rule_id}`); }
  check("D0  the rule this check guards is the rule the bake declares, and the one its index, book files and receipt carry", guarded === DEFAULT_PICKS_RULE_ID && !others.length,
    guarded !== DEFAULT_PICKS_RULE_ID ? `guarded ${guarded}, the bake ${DEFAULT_PICKS_RULE_ID}` : others.length ? first(others) : `${BOOKS.length} book files, the index and ${RECEIPT ? "the receipt" : "no receipt"}`);
  // the pills, their order and the M ids they credit are the plan's table, not whatever the index judged says
  const say = (list) => (list || []).map((s) => `${s.pill} ${typeof s.m === "string" ? s.m : JSON.stringify(s.m)}`).join(", ");
  check("D0  the index's sources are the plan's table: STEP M4 (its variants and alternatives M19), MACULA M3, UBS M18, BDB M46, in that order", same(IX.sources, FIXED_SOURCES),
    same(IX.sources, FIXED_SOURCES) ? say(IX.sources) : `the index: ${say(IX.sources)}; the table: ${say(FIXED_SOURCES)}`);
}

// ---- D1 · the bake is the ledger ----------------------------------------------------------------------------------
const D1 = { a: [], b: [], c: null, d: [] };
// (d) without the ledger: each book file is the bytes the index names, and of the zone on disk
for (const b of BOOKS) {
  const e = IX.books[b], bytes = readFileSync(join(DP, e.file));
  if (sha256(bytes) !== e.sha256 || bytes.length !== e.bytes) D1.d.push(`${e.file}: ${bytes.length} bytes, sha ${sha256(bytes).slice(0, 12)}, the index names ${e.bytes} and ${String(e.sha256).slice(0, 12)}`);
  const zp = slim(b).places, labels = zp.filter((p) => !p.mark).map((p) => p.label);
  const z = bookRead(b).zone || {};
  const want = { entries: zp.length, places: labels.length, places_sha256: sha256(Buffer.from(labels.join("\n"), "utf8")) };
  if (!same([z.entries, z.places, z.places_sha256], [want.entries, want.places, want.places_sha256])) D1.d.push(`${e.file}: its zone is ${z.entries} entries, ${z.places} places, labels ${String(z.places_sha256).slice(0, 12)}; the zone on disk ${want.entries}, ${want.places}, ${want.places_sha256.slice(0, 12)}`);
  if (e.entries !== want.entries || e.places !== want.places) D1.d.push(`${b}: the index says ${e.entries} entries and ${e.places} places, the zone on disk ${want.entries} and ${want.places}`);
}
// the copies kept beside the book files are the pinned bytes
const keptFaults = [];
for (const k of PINNED) {
  const e = PIN[k];
  if (!e || !e.kept) continue;
  const p = join(DP, e.file);
  if (!existsSync(p)) { keptFaults.push(`${e.file} is not kept`); continue; }
  const bytes = readFileSync(p);
  if (bytes.length !== e.bytes || sha256(bytes) !== e.sha256) keptFaults.push(`${e.file}: ${bytes.length} bytes, sha ${sha256(bytes).slice(0, 12)}`);
}
if (IX.pin !== "data/default-picks/PIN.json") keptFaults.push(`the index names its pin as ${IX.pin}`);
// every relay the pin lists has its letter named, by its path on the corpus lane's store and its sha256, as every other
// pin in the tree names its relay's letter (a letter named inside an entry, as call 4's, counts for its relay)
const LETTERED = new Map([...(Array.isArray(PIN.letters) ? PIN.letters : []), ...Object.values(PIN).filter((e) => e && typeof e === "object" && !Array.isArray(e) && e.relay && e.letter)].map((e) => [String(e.relay), e]));
for (const r of PIN.relays || []) {
  const e = LETTERED.get(String(r));
  if (!e || !/^r2:mishkan\/v2\/letters\/[^/]+\/FOR-ELIJAH-v[0-9.]+\.md$/u.test(e.letter || "") || !/^[0-9a-f]{64}$/u.test(e.letter_sha256 || "")) keptFaults.push(`the pin names no letter for relay ${r} (its path on the corpus lane's store and its sha256)`);
}
if (SPLIT_HELD.fault) keptFaults.push(SPLIT_HELD.fault);
const LEDGER_BOOKS = new Map();   // book -> its parsed ledger lines, kept only for the harness's book
let harnessBook = null;
if (ledgerHere) {
  for (const k of PINNED) {
    const e = PIN[k], p = ledgerFile(e.file);
    const bytes = readFileSync(p);
    if (bytes.length !== e.bytes || sha256(bytes) !== e.sha256) D1.a.push(`${e.file}: ${bytes.length} bytes, sha ${sha256(bytes).slice(0, 12)}, pinned ${e.bytes} and ${e.sha256.slice(0, 12)}`);
    else if (Number.isInteger(e.lines) && bytes.toString("utf8").split("\n").filter((l) => l.length).length !== e.lines) D1.a.push(`${e.file}: not the ${n0(e.lines)} lines pinned`);
  }
  const v1Dir = dirname(PIN.receipt.file);
  const outputs = R1.outputs || [];
  const outBooks = outputs.map((o) => o.file.replace(/\.jsonl$/u, ""));
  if (same([...outBooks].sort(), [...BOOKS].sort()) === false) D1.a.push(`receipt-v1 lists ${outBooks.length} books and the index ${BOOKS.length}`);
  // the harness's book: the one with the fewest places among those v1.2's mend touches
  harnessBook = [...BOOKS].filter((b) => [...MEND12.keys()].some((k) => k.startsWith(`${b} `))).sort((a, b) => IX.books[a].places - IX.books[b].places || (a < b ? -1 : 1))[0] || null;
  const kinds = { v1: KINDS0(), v1_1: KINDS0(), v1_2: KINDS0() };
  const m11 = { changed: { v: 0, a: 0 }, merged: { v: 0, a: 0 } };
  const m12 = { gained_places: 0, gained: KINDS0(), added: 0, added_not_v: 0, none_v1_1: 0, none_v1_2: 0 };
  const bdbM = { places: 0, before: 0, after: 0 };
  const add = (into, from) => { for (const [k, v] of Object.entries(from)) if (typeof v === "number") into[k] = (into[k] || 0) + v; else add(into[k], v); };
  const per = { step: {}, macula: {}, ubs: {}, bdb: {} };
  for (const o of outputs) {
    const book = o.file.replace(/\.jsonl$/u, "");
    const p = ledgerFile(join(v1Dir, o.file));
    if (!existsSync(p)) { D1.a.push(`${o.file} is not in the ledger`); continue; }
    const bytes = readFileSync(p);
    if (bytes.length !== o.bytes || sha256(bytes) !== o.sha256) { D1.a.push(`${o.file}: ${bytes.length} bytes, sha ${sha256(bytes).slice(0, 12)}, receipt-v1 names ${o.bytes} and ${o.sha256.slice(0, 12)}`); continue; }
    if (!IX.books[book]) continue;
    const lines = bytes.toString("utf8").split("\n").filter((l) => l.length).map((l) => JSON.parse(l));
    if (book === harnessBook) LEDGER_BOOKS.set(book, lines);
    const want = expectedPlaces(book, lines, slim(book).places, { refs: REFS });
    D1.b.push(...want.faults, ...placesDiffer(book, bookRead(book), want.places));
    add(kinds, want.kinds); add(m11, want.m11); add(m12, want.m12); add(bdbM, want.bdbM);
    for (const s of Object.keys(per)) for (const [b, c] of Object.entries(want.per[s])) per[s][b] = (per[s][b] || 0) + c;
  }
  const cFaults = [];
  const hold = (what, got, want, by) => { if (got !== want) cFaults.push(`${what} ${n0(got)} here; ${by} says ${n0(want)}`); };
  // after v1.1: each kind on its own, from receipt-v1.1's own figures
  const M = R11.mend || {}, inV = (M.variants || {}).in_v1, inA = (M.alternatives || {}).in_v1;
  hold("v1's variants", kinds.v1.v, inV, "receipt-v1.1");
  hold("v1's alternatives", kinds.v1.a, inA, "receipt-v1.1");
  hold("the places v1.1's mend lists", MEND11.size, M.places_whose_step_picks_change, "receipt-v1.1");
  hold("the variants v1.1 changes", m11.changed.v, (M.picks_changed_by_kind || {}).v, "receipt-v1.1");
  hold("the alternatives v1.1 changes", m11.changed.a, (M.picks_changed_by_kind || {}).a, "receipt-v1.1");
  hold("the picks that fall together", m11.merged.v + m11.merged.a, M.picks_that_fall_together, "receipt-v1.1");
  hold("the variants after v1.1", kinds.v1_1.v, inV - m11.merged.v, "receipt-v1.1's in_v1 less those that fall together");
  hold("the alternatives after v1.1", kinds.v1_1.a, inA - m11.merged.a, "receipt-v1.1's in_v1 less those that fall together");
  hold("the readings after v1.1", kinds.v1_1.r, kinds.v1.r, "v1 (v1.1 changes no reading)");
  // after v1.2: receipt-v1.2's own figures, and the kinds that follow from them
  const S = R12.step || {}, B = R12.bdb || {}, RW = R12.rows || {};
  hold("the places v1.2's STEP mend lists", MEND12.size, S.places_changed, "receipt-v1.2");
  hold("the places that gain STEP picks", m12.gained_places, S.places_gaining_picks, "receipt-v1.2");
  for (const k of ["r", "v", "a"]) hold(`the picks of kind ${k} they gain`, m12.gained[k], (S.picks_gained_by_kind || {})[k], "receipt-v1.2");
  hold("the picks v1.2 adds where v1.1 has some", m12.added, (S.places_changed_by_cause || {})[BROKEN_BAR], "receipt-v1.2 (variants behind a broken bar)");
  hold("of them not a variant", m12.added_not_v, 0, "the amendment");
  hold("the places with no STEP pick after v1.1", m12.none_v1_1, S.places_with_no_step_pick_v11, "receipt-v1.2");
  hold("the places with no STEP pick after v1.2", m12.none_v1_2, S.places_with_no_step_pick_v12, "receipt-v1.2");
  for (const k of ["r", "v", "a"]) hold(`STEP's picks of kind ${k} after v1.2`, kinds.v1_2[k], kinds.v1_1[k] + m12.gained[k] + (k === "v" ? m12.added : 0), "v1.1's with the picks gained and added");
  hold("the places v1.2's BDB mend lists", BDB12.size, B.places_changed, "receipt-v1.2");
  hold("BDB's picks there before", bdbM.before, B.picks_before, "receipt-v1.2");
  hold("BDB's picks there after", bdbM.after, B.picks_after, "receipt-v1.2");
  hold("the rows of v1.1's tables", PIN.rows.lines + PIN.rows_added.lines, RW.v1_1_table, "receipt-v1.2");
  hold("the rows v1.2 adds", PIN.rows_added_v1_2.lines, RW.added, "receipt-v1.2");
  hold("the places", BOOKS.reduce((a, b) => a + IX.books[b].places, 0), R12.places, "receipt-v1.2");
  for (const s of Object.keys(per)) {
    const want = (R1.picks_per_place || {})[s] || {};
    for (const b of new Set([...Object.keys(want), ...Object.keys(per[s])])) if ((want[b] || 0) !== (per[s][b] || 0)) cFaults.push(`${PILL[s] || s} has ${n0(per[s][b] || 0)} places with ${b} picks; receipt-v1 says ${n0(want[b] || 0)}`);
  }
  D1.c = { kinds, m11, m12, bdbM, faults: cFaults };
}
check("D1  the bake is the ledger: (d) every book file is the bytes the index names and of the zone on disk, the kept rules and receipts are the pinned bytes, and the pin names every relay's letter", !D1.d.length && !keptFaults.length,
  D1.d.length || keptFaults.length ? first([...D1.d, ...keptFaults]) : `${BOOKS.length} book files, their entries, places and place labels the zones', ${PINNED.filter((k) => PIN[k] && PIN[k].kept).length} kept files, call 4's list (${SPLIT_HELD.set.size} places it writes with « | »), and the letters of relays ${(PIN.relays || []).join(", ")}`);
if (ledgerFault) check("D1  (a, b, c) the ledger --ledger names is here", false, ledgerFault);
else if (!ledgerHere) side("D1  (a, b, c) not judged here: the ledger is not on this machine", "give --ledger <dir holding default-picks-v1/, default-picks-v1.1/ and default-picks-v1.2/>");
else {
  const k3 = (k) => `r ${n0(k.r)}, v ${n0(k.v)}, a ${n0(k.a)}`;
  check("D1  (a) every pinned file and every ledger book file is the bytes named", !D1.a.length, D1.a.length ? first(D1.a) : `${PINNED.length} pinned files and ${(R1.outputs || []).length} book files`);
  check("D1  (b) every place's picks are this check's own parse of the ledger, the mends applied, and a place for every entry", !D1.b.length,
    D1.b.length ? `${D1.b.length} places differ · ${first(D1.b, 2)}` : `${n0(BOOKS.reduce((a, b) => a + IX.books[b].entries, 0))} entries in ${BOOKS.length} books`);
  const C = D1.c;
  check("D1  (c) the kinds are the receipts': after v1.1 each kind as receipt-v1.1 says; after v1.2 the places, the picks gained and added, the BDB mend and the rows as receipt-v1.2 says", !C.faults.length,
    `${C.faults.length ? `${C.faults.length} · ${first(C.faults)} · ` : ""}after v1.1 ${k3(C.kinds.v1_1)} (changed v ${C.m11.changed.v}, a ${n0(C.m11.changed.a)}; fall together v ${C.m11.merged.v}, a ${C.m11.merged.a}); after v1.2 ${k3(C.kinds.v1_2)} (${C.m12.gained_places} places gain ${k3(C.m12.gained)}, ${C.m12.added} added behind a broken bar; no STEP pick at ${C.m12.none_v1_1}, then ${C.m12.none_v1_2}; BDB ${C.bdbM.places} places, ${C.bdbM.before} picks before, ${C.bdbM.after} after); picks per place as receipt-v1 counts them`);
  const r1s = R1.step || {};
  if (r1s.variant_picks !== C.kinds.v1_1.v || r1s.alternative_picks !== C.kinds.v1_1.a) side("D1  (c) receipt-v1's own STEP counts are not held", `it says v ${n0(r1s.variant_picks)}, a ${n0(r1s.alternative_picks)}; v1's book files hold v ${n0(C.kinds.v1.v)}, a ${n0(C.kinds.v1.a)} (question 2 to the corpus lane, answered in relay v195: counted before the builder joined picks)`);
  side("D1  (c) the measure of relay v195's landing", "after v1.2: r 305,481, v 908, a 5,404");
}

// ---- D2 · every named row re-resolves ----------------------------------------------------------------------------
const STORE = join(K3, "data", "route-store");
const shardOf = (key) => sha256(Buffer.from(key, "utf8")).slice(0, 2);
const shard = (sh) => { const p = join(STORE, "shards", `${sh}.bin`); return existsSync(p) ? readGz(p) : {}; };
const rowsUnder = (served, [key, rank, m, h]) => (served[key] || []).filter((x) => Array.isArray(x) && x[0] === rank && x[3] === m && typeof x[1] === "string" && sha256(Buffer.from(x[1], "utf8")).slice(0, 16) === h);
/** Every row of the tables found again: as named, or where `follow` (the row-strikes record, from the store the
 *  tables were read at) says it went. A row a round moved is found under the name it has now; a row a round struck or
 *  withheld is set apart; a row found twice is said; anything else is missing. `refs` counts the picks naming a row. */
const resolveRows = (rows, { follow = null, refs = null } = {}) => {
  const missing = [], twice = [], notAsNamed = [], followed = [], struck = [], withheld = [];
  const byShard = new Map();
  rows.forEach((r, i) => { const sh = shardOf(r[0]); if (!byShard.has(sh)) byShard.set(sh, []); byShard.get(sh).push(i); });
  for (const sh of [...byShard.keys()].sort()) {
    const served = shard(sh);
    for (const i of byShard.get(sh)) {
      const found = rowsUnder(served, rows[i]);
      if (!found.length) notAsNamed.push(i);
      else if (found.length > 1) twice.push(i);
    }
  }
  const cache = new Map();
  const servedAt = (key) => { const sh = shardOf(key); if (!cache.has(sh)) cache.set(sh, shard(sh)); return cache.get(sh); };
  for (const i of notAsNamed) {
    const went = follow ? follow.nowOf(rows[i]) : { state: "served" };
    if (went.state === "struck") struck.push(i);
    else if (went.state === "withheld") withheld.push(i);
    else if (went.state === "re-keyed" && rowsUnder(servedAt(went.name[0]), went.name).length === 1) followed.push(i);
    else missing.push(i);
  }
  const picks = (list) => list.reduce((a, i) => a + ((refs && refs.get(i)) || 0), 0);
  return { missing, twice, followed, struck, withheld, still_named: struck.filter((i) => refs && refs.get(i)), picks: { followed: picks(followed), withheld: picks(withheld) } };
};
let ROWS = null;
if (ledgerFault) check("D2  every row a pick names is found again in the served store", false, ledgerFault);
else if (ledgerHere) {
  ROWS = [PIN.rows, PIN.rows_added, PIN.rows_added_v1_2].flatMap((e) => linesOfFile(ledgerFile(e.file)));
  const storeIndex = readJson(join(STORE, "index.json"));
  const mSources = storeIndex.m_sources || {};
  const unnamed = [...new Set(ROWS.map((r) => r[2]))].filter((m) => !mSources[m]);
  // where the rows the tables name have gone since the store v1.2 read, by the row-strikes record
  let follow = null, D2 = null, followWhy = "";
  try {
    follow = openFollower({ data: join(K3, "data"), index: storeIndex, readAt: (((R12.inputs || {}).page_store || {}).store_version) || null });
    D2 = resolveRows(ROWS, { follow, refs: REFS });
  } catch (e) { if (e instanceof FollowFault) followWhy = e.message; else throw e; }
  if (!D2) check("D2  every row a pick names is found again in the served store, as named or where the row-strikes record says it went", false, followWhy);
  else {
    const mine = { rows_re_keyed_and_found_under_their_new_name: { rows: D2.followed.length, picks_naming_them: D2.picks.followed }, rows_struck_since_that_no_pick_names: D2.struck.length - D2.still_named.length, rows_withheld_since: { rows: D2.withheld.length, picks_naming_them: D2.picks.withheld } };
    const said = ((RECEIPT || {}).rows || {}).followed || null;
    const off = !RECEIPT ? [] : !said ? ["the receipt gives no account of the rows followed"] : Object.keys(mine).filter((k) => !same(typeof mine[k] === "object" ? { rows: (said[k] || {}).rows, picks_naming_them: (said[k] || {}).picks_naming_them } : said[k], mine[k])).map((k) => `the receipt's ${k} is ${JSON.stringify(said[k])} and this recount gives ${JSON.stringify(mine[k])}`);
    check("D2  every row a pick names is found again in the served store under its key, rank, source id and text, or where the row-strikes record says it went since the store v1.2 read: moved and found there, struck and named by no pick, or withheld and counted so; the receipt's account of them is this recount's", !D2.missing.length && !D2.still_named.length && !unnamed.length && !off.length,
      `${n0(ROWS.length)} rows (${n0(PIN.rows.lines)} of v1, ${n0(PIN.rows_added.lines)} added by v1.1, ${n0(PIN.rows_added_v1_2.lines)} by v1.2) · ${D2.missing.length} missing${D2.missing.length ? ` (${D2.missing.slice(0, 3).map((i) => `row ${n0(i)} ${ROWS[i][2]} rank ${ROWS[i][1]}`).join(", ")})` : ""}${unnamed.length ? ` · source ids the store does not name: ${unnamed.join(", ")}` : ""} · since store ${follow.readAt}, ${follow.rounds.length} round(s): ${n0(D2.followed.length)} rows moved to another key and found there (${n0(D2.picks.followed)} picks name them), ${n0(D2.struck.length)} struck${D2.still_named.length ? `, ${n0(D2.still_named.length)} OF THEM STILL NAMED BY A PICK (${D2.still_named.slice(0, 3).map((i) => `row ${n0(i)} ${ROWS[i][2]} rank ${ROWS[i][1]}`).join(", ")})` : " and named by no pick"}, ${n0(D2.withheld.length)} withheld (${n0(D2.picks.withheld)} picks name them)${off.length ? ` · ${first(off)}` : ""}`);
    side("D2  rows found more than once", D2.twice.length ? D2.twice.map((i) => `row ${n0(i)} (${ROWS[i][2]}, rank ${ROWS[i][1]})`).join(", ") : "none");
    // the picks that wait on call 5's re-key: each names a row still under its key with a maqaf, or one that now stands under the plain key its line names
    const waits = linesOfFile(ledgerFile(PIN.picks_waiting_v1_2.file)).filter((x) => x && x.status === "WAITS_FOR_CALL5_REKEY");
    const W = { picks: waits.length, rows: 0, rows_now_under_their_plain_key: 0, picks_whose_row_now_stands_under_its_plain_key: 0 }, faults = [], all = new Set(), moved = new Set();
    const cache = new Map();
    const servedAt = (key) => { const sh = shardOf(key); if (!cache.has(sh)) cache.set(sh, shard(sh)); return cache.get(sh); };
    try {
      for (const x of waits) {
        if (!Array.isArray(x.call5_row) || typeof x.to_key !== "string") { faults.push(`${x.book} ${x.p}: names no row and key`); continue; }
        const id = JSON.stringify(x.call5_row), went = follow.nowOf(x.call5_row);
        all.add(id);
        if (went.state === "served") { if (rowsUnder(servedAt(x.call5_row[0]), x.call5_row).length !== 1) faults.push(`${x.book} ${x.p}: its row is not under its key with a maqaf, and the record does not say it moved`); continue; }
        if (went.state !== "re-keyed" || went.name[0] !== x.to_key || rowsUnder(servedAt(went.name[0]), went.name).length !== 1) { faults.push(`${x.book} ${x.p}: its row was ${went.state}, and does not stand under the plain key its line names`); continue; }
        moved.add(id); W.picks_whose_row_now_stands_under_its_plain_key += 1;
      }
    } catch (e) { if (e instanceof FollowFault) faults.push(e.message); else throw e; }
    W.rows = all.size; W.rows_now_under_their_plain_key = moved.size;
    const saidW = (((RECEIPT || {}).lists_beside_v1_2 || {}).picks_waiting || {}).waits_for_call5_rekey || null;
    if (RECEIPT && !same(saidW, W)) faults.push(`the receipt says ${JSON.stringify(saidW)} and this recount gives ${JSON.stringify(W)}`);
    check("D2  the picks that wait on call 5's re-key each name a row still under its key with a maqaf, or one that now stands under the plain key its line names, as the receipt counts them", !faults.length,
      faults.length ? `${faults.length} · ${first(faults)}` : `${n0(W.picks)} picks on ${W.rows} rows · ${n0(W.picks_whose_row_now_stands_under_its_plain_key)} now with their row under the plain key (${W.rows_now_under_their_plain_key} rows), ${n0(W.picks - W.picks_whose_row_now_stands_under_its_plain_key)} still waiting`);
  }
} else side("D2  not judged here: the ledger is not on this machine", "the rows tables stay on the corpus lane's store");

// ---- D3 · the index's counts ------------------------------------------------------------------------------------
/** The index's counts held to this check's, and the second of every first to the receipt's. `tie` (the fault H4,
 *  where no second ties in the data) makes one in memory, in this check's counts and the index's alike: in book b,
 *  z fills as much of what x leaves as x's second s. */
const judgeD3 = ({ any = false, order = IDS, tie = null, index = IX } = {}) => {
  const faults = [], seconds = Object.fromEntries(IDS.map((s) => [s, { by: {}, none: 0, ties: 0 }])), bare = [];
  // the receipt's places where STEP's line rests bare, by book
  const listed = new Map();
  for (const x of (RECEIPT && RECEIPT.step_line_rests_bare && RECEIPT.step_line_rests_bare.places) || []) { if (!listed.has(x.book)) listed.set(x.book, []); listed.get(x.book).push(x.place); }
  for (const b of BOOKS) {
    let e = index.books[b];
    const c = countBook(slim(b).places, bookRead(b), any, b);
    if (c.unknown.length) faults.push(`${b}: no record of its resting lines, so whether STEP's line rests bare at ${c.unknown.length} place(s) cannot be told (${first(c.unknown)})`);
    bare.push(...c.bare.map((l) => `${b} ${l}`));
    if (!same(c.bare, listed.get(b) || [])) faults.push(`${b}: STEP's line rests bare here at ${c.bare.join(", ") || "no place"}; the receipt lists ${(listed.get(b) || []).join(", ") || "none"}`);
    if (tie && tie.made && b === tie.b) {
      const tied2 = (f) => { const g = structuredClone(f); g[tie.x][tie.z] = g[tie.x][tie.s]; return g; };
      c.fills = tied2(c.fills);
      e = { ...e, fills: tied2(e.fills) };
    }
    for (const k of ["entries", "places", "kq", "has", "fills", "step_leaves", "step_words"]) if (!same(c[k], e[k])) faults.push(`${b}: ${k} is ${plain(JSON.stringify(c[k])).slice(0, 80)} here, ${plain(JSON.stringify(e[k])).slice(0, 80)} in the index`);
    // the UBS line the bake laid on each place is the pick 1 glosses joined
    const bf = bookRead(b);
    for (const p of slim(b).places) {
      const at = bf.places[p.n - 1];
      if (p.mark || !at || !at[SLOT.ubs]) continue;
      const want = lineAt(bf, p, "ubs", false, false);
      if ((at[SLOT.ubs][0] || null) !== want) { faults.push(`${b} n ${p.n}: the book file's UBS line is ${said(at[SLOT.ubs][0])}, its pick 1 glosses ${said(want)}`); break; }
    }
    const rb = RECEIPT && RECEIPT.books ? RECEIPT.books[b] : null;
    for (const x of IDS) {
      const s = autoSecond(c.fills, x, IDS, order);
      if (!s) seconds[x].none += 1;
      else { seconds[x].by[s] = (seconds[x].by[s] || 0) + 1; if (tied(c.fills, x, s)) seconds[x].ties += 1; }
      if (!rb || !rb.second || (rb.second[x] || null) !== s) faults.push(`${b}: ${PILL[x]}'s second is ${s ? PILL[s] : "none"} here and ${rb && rb.second ? (rb.second[x] ? PILL[rb.second[x]] : "none") : "unread"} in the receipt`);
    }
  }
  return { faults, seconds, bare };
};
const D3 = judgeD3();
const secSay = (x) => `${PILL[x]}: ${Object.entries(D3.seconds[x].by).map(([y, k]) => `${PILL[y]} in ${k}`).join(", ") || "none"}${D3.seconds[x].none ? `, none in ${D3.seconds[x].none}` : ""}${D3.seconds[x].ties ? ` (${D3.seconds[x].ties} ties)` : ""}`;
check("D3  the index's counts are this check's, from the book files, the zones and the records of the resting lines, and every second follows the row's order and is the receipt's", !D3.faults.length,
  D3.faults.length ? `${D3.faults.length} · ${first(D3.faults, 2)}` : `${BOOKS.length} books · seconds ${IDS.map(secSay).join(" · ")} · STEP has a pick and its line rests bare at ${D3.bare.length} place(s), counted in no has.step and in no fill of STEP's or by STEP, as the receipt lists${D3.bare.length ? `: ${D3.bare.join(", ")}` : ""}`);
side("D3  the measure of relay v195's landing for the seconds", "STEP: none in 39 books; MACULA, UBS and BDB: STEP in 39");

// ---- what the card asks, and where STEP's own words print ---------------------------------------------------------
/** The rows the served store holds under a key, as [source id, the text as the card prints it (made spaces closed)],
 *  kept for every key of a shard once the shard is read. */
const PRINTED_UNDER = new Map(), SHARDS_READ = new Set();
const servedUnder = (key) => {
  const sh = shardOf(key);
  if (!SHARDS_READ.has(sh)) {
    SHARDS_READ.add(sh);
    for (const [k, list] of Object.entries(shard(sh))) PRINTED_UNDER.set(k, (Array.isArray(list) ? list : []).filter((x) => Array.isArray(x) && typeof x[1] === "string").map((x) => [x[3], routePrinted(x)]));
  }
  return PRINTED_UNDER.get(key) || [];
};
// a pill's reading as the card groups readings: a closing stop dropped, case folded, its "/" a joint or kept whole
const pillKeys = (t) => { const s = String(t).trim().replace(/\.$/u, "").toLowerCase(); return [s, s.split("/").map((x) => x.trim()).filter(Boolean).join(" + ")]; };
const samePill = (a, b) => { const [x1, x2] = pillKeys(a), [y1, y2] = pillKeys(b); return x1 === y1 || x2 === y2; };
/** Whether a line the record draws over a place is today's line, a TAHOT row's: one under a key the card asks there
 *  (the word's own, its pieces') that is drawn so. */
const todayAt = (p, line) => p.keys.some((k) => servedUnder(k).some(([m, t]) => m === MOF("step") && drawnStep(t) === line));
/** Whether STEP's own words print at a place they may fill, read off the record of the resting lines: it draws no line
 *  over the word (a record of the page before the default sources were laid: today's line is bare there), or draws
 *  them, as the line draws them, under STEP's credit, where the line is not today's. */
const stepPrints = (rec, p, words) => {
  const u = ((rec.sections[p.i] || [])[1] || []).find((x) => p.e >= x[0] && p.e < x[0] + x[1]) || null;
  return !u || (u[1] === 1 && u[3] === MOF("step") && u[2] === drawnStep(words) && !todayAt(p, u[2]));
};

// ---- D5 (node) · the places STEP leaves, and those its own words may fill -----------------------------------------
const FILLS = new Map();   // book -> Map(n -> { src, text, m }): the second's fills at rest, every source on
const STEP_WORDS = new Map();   // book -> Map(n -> STEP's words): the places STEP's own words fill where today's line is bare
{
  const answered = [];
  let total = 0, bare = 0;
  for (const b of BOOKS) {
    const e = IX.books[b], s = autoSecond(e.fills, "step");
    const at = new Map(slim(b).places.map((p) => [p.n, p]));
    const m = new Map();
    for (const leaf of e.step_leaves) {
      const p = at.get(leaf[0]);
      if (!p || p.pgA || p.kq) answered.push(`${b} ${p ? p.label : `n ${leaf[0]}`}`);
      const t = s ? leafLine(leaf, s) : null;
      if (t) { m.set(leaf[0], { src: s, text: t, m: MOF(s) }); total += 1; } else bare += 1;
    }
    FILLS.set(b, m);
    STEP_WORDS.set(b, new Map((e.step_words || []).map(([n, t]) => [n, t])));
  }
  const want = RECEIPT && RECEIPT.rest_fills ? RECEIPT.rest_fills.count : null;
  const words = [...STEP_WORDS.values()].reduce((a, m) => a + m.size, 0);
  check("D5  (node) no place STEP leaves is one the zone's place pieces answer, or a pair; the fills at rest are counted", !answered.length && (want === null || want === total),
    answered.length ? first(answered) : `${n0(total)} fills by the second at rest in ${[...FILLS.values()].filter((m) => m.size).length} books${want === null ? "" : ` (the receipt: ${n0(want)})`}; ${bare} place(s) STEP and its second both leave; ${n0(words)} places STEP's own words may fill, in ${[...STEP_WORDS.values()].filter((m) => m.size).length} books (no pair, no answering pieces, by D3)`);
  // what the record of the resting lines draws there. Read before the default sources were laid it is today's line,
  // and a place it draws bare is a word that gains STEP's words at rest. Read with them laid (its read_off.state
  // says so), it draws a line at every such place: today's line where that prints, else STEP's own words; so a place
  // it draws bare is an owed line missing, and a line of one word under STEP's credit that is not today's (no TAHOT
  // row the card asks there is drawn so) is STEP's words, as the line draws them (the hidden sign's gap for a sign
  // alone), or a fault: a law over all 39 books
  const drawsNone = {}, drawsStep = {}, drawsToday = {}, rows = [], laid = [], missingLines = [], wrongLines = [];
  let other = 0, noRecord = 0;
  const lineOver = (rec, p) => ((rec.sections[p.i] || [])[1] || []).find((x) => p.e >= x[0] && p.e < x[0] + x[1]) || null;
  // the places call 4 writes with « | » that STEP's words would else fill: held, no STEP words in the index, and
  // today's line stands; where the record draws it bare it stays bare at rest
  const held = [], heldBare = [];
  for (const b of BOOKS) {
    const rec = readRecord(recordPath(K3, b));
    if (!rec) { noRecord += STEP_WORDS.get(b).size; continue; }
    const withDefaults = !!(((rec.read_off || {}).state || {}).defaults);
    if (withDefaults) laid.push(b);
    for (const [n, t] of STEP_WORDS.get(b)) {
      const p = slim(b).places[n - 1];
      const u = lineOver(rec, p);
      if (!u || (u[1] === 1 && blank(u[2]))) { drawsNone[b] = (drawsNone[b] || 0) + 1; rows.push(`${b} ${p.label} ${said(t, 30)}`); if (withDefaults) missingLines.push(`${b} ${p.label} ${said(t, 30)}`); continue; }
      if (u[1] !== 1 || u[3] !== MOF("step")) { other += 1; continue; }
      if (todayAt(p, u[2])) { if (u[2] === drawnStep(t)) drawsToday[b] = (drawsToday[b] || 0) + 1; else other += 1; continue; }
      if (u[2] === drawnStep(t)) drawsStep[b] = (drawsStep[b] || 0) + 1;
      else if (withDefaults) wrongLines.push(`${b} ${p.label}: ${said(u[2], 30)}, STEP's words drawn ${said(drawnStep(t), 30)}`);
      else other += 1;
    }
    const bf = bookRead(b);
    for (const p of slim(b).places) {
      if (p.mark || p.kq || p.pgA || !SPLIT_HELD.set.has(`${b} ${p.label}`)) continue;
      const s = (bf.places[p.n - 1] || [])[SLOT.step];
      if (!(Array.isArray(s) && s.length && linePick(s[0][1]))) continue;
      held.push(`${b} ${p.label}`);
      const u = lineOver(rec, p);
      if (!u || (u[1] === 1 && blank(u[2]))) heldBare.push(`${b} ${p.label}`);
    }
  }
  const sum = (o) => Object.values(o).reduce((a, k) => a + k, 0);
  const byBook = (o) => Object.entries(o).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).map(([b, k]) => `${b} ${k}`).join(", ");
  check("D5  (node) the records read with the default sources laid draw a line at every place STEP's own words may fill, and where it is not today's (no TAHOT row the card asks there is drawn so) it is STEP's words as the line draws them, the hidden sign's gap for a sign alone", !missingLines.length && !wrongLines.length,
    missingLines.length || wrongLines.length ? `${missingLines.length ? `${missingLines.length} drawn bare: ${first(missingLines)}` : ""}${missingLines.length && wrongLines.length ? " · " : ""}${wrongLines.length ? `${wrongLines.length} drawn otherwise: ${first(wrongLines)}` : ""}` : `${laid.length} of ${BOOKS.length} records read with them laid${laid.length < BOOKS.length ? ` (the others, read before, are today's line and judge nothing)` : ""}`);
  side("D5  (node) the record's lines at the places STEP's own words may fill", `${n0(sum(drawsNone))} draw no line, in ${Object.keys(drawsNone).length} books (while the record is today's line, each a word that gains STEP's words at rest)${sum(drawsNone) ? `: ${byBook(drawsNone)}; e.g. ${first(rows, 3)}` : ""} · ${n0(sum(drawsStep))} draw STEP's own words under its credit where today's line is bare · ${n0(sum(drawsToday))} draw them as today's line, a TAHOT row the card asks · ${n0(other)} draw another line${noRecord ? ` · ${noRecord} in works with no record` : ""}`);
  side("D5  (node) the places call 4 writes with « | », held", `${n0(held.length)} where STEP's pick 1 is a line pick, no pair, no pieces that answer: no STEP words in the index, today's line stands; the record draws ${heldBare.length} of them bare, and they stay bare at rest${heldBare.length ? ` (${heldBare.join(", ")})` : ""}`);
}

// ---- D20 (node) · the pills the card prints, as the receipt counts them -------------------------------------------
/** A source's pills at a place, as the card prints them where its line is printed: pick 1 (UBS's line of its pieces'
 *  pick 1s, BDB's words with the sense's number), then picks 2..n with words (UBS's numbered in each piece), each
 *  [its text, the source id that credits it]. STEP's pick 1 is its reading's (M4); its variants and alternatives M19. */
const pillsOf = (bf, p, src) => {
  const at = bf.places[p.n - 1], slot = at ? at[SLOT[src]] : 0;
  if (!slot) return [];
  if (src === "step") return slot.map((x) => [x[1], MOF("step", ["r", "v", "a"][x[0]])]).filter(([t], j) => j === 0 || hasText(t));
  if (src === "macula") return [[slot, MOF("macula")]];
  if (src === "ubs") { const seen = new Set(); return [[slot[0], MOF("ubs")], ...(slot[1] || []).filter(([pc, w]) => { const more = seen.has(pc); seen.add(pc); return more && hasText(w); }).map(([, w]) => [w, MOF("ubs")])]; }
  if (src === "bdb") return slot.map(([sense, w], j) => [w ? `${bf.bdb_words[w - 1]}${sense !== "" ? `${SENSE_SAYS}${sense}` : ""}` : null, MOF("bdb")]).filter(([t], j) => j === 0 || hasText(t));
  return [];
};
{
  // the receipt's picks_printed (bake-default-picks-v1), counted again here: under each first x with its second y in
  // each book, the pills the card prints for the source whose words the line prints (x's where x has a line; y's where
  // x has none and y fills; STEP's own words only where they print, never where they only may; STEP's picks 2..n are
  // text at rest, pills under another first), and those the card makes: no row of the pill's own source that the
  // store holds under a key the card asks there (the word's own, its pieces') prints it whole
  const got = Object.fromEntries(IDS.map((x) => [x, {}]));
  const add = (x, y, p, list) => { for (const [t, own] of list) { const c = (got[x][y] = got[x][y] || { pills: 0, made: 0 }); c.pills += 1; if (!p.keys.some((k) => servedUnder(k).some(([m, r]) => m === own && samePill(r, t)))) c.made += 1; } };
  let noRecord = 0;
  for (const b of BOOKS) {
    const bf = bookRead(b), rec = readRecord(recordPath(K3, b)), ix = IX.books[b];
    if (!rec) { noRecord += 1; continue; }
    const second = Object.fromEntries(IDS.map((x) => [x, autoSecond(ix.fills, x)]));
    const leaves = new Set(ix.step_leaves.map((l) => l[0]));
    for (const p of slim(b).places) {
      if (p.mark || !bf.places[p.n - 1]) continue;
      const rests = restsBareAt(bf, p, b);
      const has = Object.fromEntries(IDS.map((s) => [s, lineAt(bf, p, s) !== null && !(s === "step" && rests)]));
      const sw = stepWordsAt(bf, p, b);
      const prints = sw !== null && stepPrints(rec, p, sw);
      if (prints) add("step", "step", p, pillsOf(bf, p, "step").slice(0, 1));
      if (second.step && leaves.has(p.n) && has[second.step]) add("step", second.step, p, pillsOf(bf, p, second.step).slice(0, 1));
      for (const x of IDS.filter((s) => s !== "step")) {
        if (has[x]) { add(x, x, p, pillsOf(bf, p, x)); continue; }
        const y = second[x];
        if (y === "step" ? prints : y && has[y]) add(x, y, p, pillsOf(bf, p, y));
      }
    }
  }
  const want = (RECEIPT && RECEIPT.picks_printed && RECEIPT.picks_printed.by_first) || {};
  const faults = [];
  for (const x of IDS) for (const y of new Set([...Object.keys(got[x]), ...Object.keys(want[x] || {})])) {
    const g = got[x][y] || { pills: 0, made: 0 }, w = (want[x] || {})[y] || {};
    if (g.pills !== w.pills || g.made !== w.made) faults.push(`under ${PILL[x]}, ${PILL[y]}'s pills ${n0(g.pills)} here (made ${n0(g.made)}), ${w.pills === undefined ? "none" : n0(w.pills)} in the receipt (made ${w.made === undefined ? "none" : n0(w.made)})`);
  }
  const say = IDS.map((x) => `${PILL[x]}: ${Object.entries(got[x]).map(([y, c]) => `${PILL[y]} ${n0(c.pills)} (made ${n0(c.made)})`).join(", ") || "none"}`).join(" · ");
  check("D20 (node) the receipt's pills the card prints (picks_printed), each source's where its words print and STEP's only where its own words print, and those the card makes, no row of the pill's own source under a key the card asks printing it, are this check's", !!RECEIPT && !faults.length && !noRecord,
    faults.length ? `${faults.length} · ${first(faults, 2)}` : `${say}${noRecord ? ` · ${noRecord} works with no record` : ""}`);
}

// ---- D19 (node) · the source words ----------------------------------------------------------------------------
/** The "/"-bearing texts the page keeps whole for a first source in a book (rebuildSourceWords): its lines and its
 *  picks, and the second's where it has none; under STEP only the second's lines where STEP leaves a word. */
const picksText = (bf, n, src) => {
  const at = bf.places[n - 1], slot = at ? at[SLOT[src]] : 0;
  if (!slot) return [];
  if (src === "macula") return hasText(slot) ? [slot] : [];
  if (src === "ubs") return (slot[1] || []).map(([, w]) => w).filter(hasText);
  if (src === "bdb") return slot.map(([s, w]) => (w ? (s !== "" ? `${bf.bdb_words[w - 1]}${SENSE_SAYS}${s}` : bf.bdb_words[w - 1]) : null)).filter(hasText);
  return [];
};
const sourceWords = (b, first, second) => {
  const out = new Set();
  const add = (t) => { if (typeof t === "string" && t.includes("/")) out.add(t); };
  const e = IX.books[b];
  if (first === "step") { if (second) for (const leaf of e.step_leaves) add(leafLine(leaf, second)); return out; }
  const bf = bookRead(b);
  for (const p of slim(b).places) {
    if (p.mark || !bf.places[p.n - 1]) continue;
    const t1 = lineAt(bf, p, first, false, false);
    add(t1); picksText(bf, p.n, first).forEach(add);
    if (second && second !== "step" && !t1) { add(lineAt(bf, p, second, false, false)); picksText(bf, p.n, second).forEach(add); }
  }
  return out;
};
const MEASURED_COLLISIONS = [["M3", "thumbs/big toes of"], ["M17", "juice of purslane / mallows"]];
{
  const atRest = [], all = new Set(), perBook = new Map();
  for (const b of BOOKS) {
    const s = autoSecond(IX.books[b].fills, "step");
    for (const t of sourceWords(b, "step", s)) atRest.push(`${b} ${said(t)}`);
    const mine = new Set();
    for (const x of IDS.filter((y) => y !== "step")) for (const z of [null, ...IDS.filter((y) => y !== x)]) for (const t of sourceWords(b, x, z)) { mine.add(t); all.add(t); }
    perBook.set(b, mine);
  }
  // every row of the served store that prints one of them, and every zone's baked table
  const hits = [];
  const m4 = [];
  for (let i = 0; i < 256; i += 1) {
    const served = shard(i.toString(16).padStart(2, "0"));
    for (const [key, rows] of Object.entries(served)) for (const r of rows) {
      if (!Array.isArray(r)) continue;
      if (typeof r[1] === "string" && all.has(r[1])) { hits.push([r[3], r[1]]); if (r[3] === "M4") m4.push([key, r[1]]); }
    }
  }
  const inBook = [];
  for (const [key, t] of m4) for (const b of BOOKS) if (perBook.get(b).has(t) && slim(b).places.some((p) => p.keys.includes(key))) inBook.push(`${b} ${said(t)}`);
  const glossHits = [];
  for (const b of BOOKS) for (const v of slim(b).gloss) if (perBook.get(b).has(v)) glossHits.push(`${b} ${said(v)}`);
  const got = [...new Set(hits.map(([m, t]) => `${m} ${t}`))].sort();
  const want = MEASURED_COLLISIONS.map(([m, t]) => `${m} ${t}`).sort();
  check("D19 (node) the source words the page prints whole: none at rest; under each source none a TAHOT row prints in that book; the store's rows that print one are the two measured, and no zone's table holds one",
    !atRest.length && !inBook.length && same(got, want) && !glossHits.length,
    `${n0(all.size)} texts with a "/" over ${BOOKS.length} books · at rest ${atRest.length ? first(atRest) : "none"} · TAHOT rows ${inBook.length ? first(inBook) : "none"} · store rows ${got.map((x) => said(x, 40)).join(", ") || "none"}${same(got, want) ? " (as measured)" : ` (measured: ${want.map((x) => said(x, 40)).join(", ")})`} · zone tables ${glossHits.length ? first(glossHits) : "none"}`);
}

// ==== THE PAGE ====================================================================================================
const PAGE = !NODE_ONLY && !SELF_TEST;
const HARNESS_PAGE = SELF_TEST && !NODE_ONLY;
const byPlaces = [...BOOKS].sort((a, b) => IX.books[a].places - IX.books[b].places || (a < b ? -1 : 1));
// w1: the smallest work holding a place both STEP and its second leave; w2: the smallest where STEP has no second
const W1 = byPlaces.find((b) => slim(b).places.some((p) => !p.mark && lineAt(bookRead(b), p, "step") === null && !FILLS.get(b).has(p.n))) || null;
const W2 = byPlaces.find((b) => !autoSecond(IX.books[b].fills, "step")) || null;
const W4 = zonesOnDisk().find((z) => !IX.books[z]) || null;
const pageErrors = [], unsettled = [];
let tree = null, browser = null;
const sectionsOf = (b) => slim(b).sections;
const placeIn = new Map();   // book -> Map("i:e" -> place)
const placeAt = (b, i, e) => {
  if (!placeIn.has(b)) placeIn.set(b, new Map(slim(b).places.map((p) => [`${p.i}:${p.e}`, p])));
  return placeIn.get(b).get(`${i}:${e}`) || null;
};
/** The words of a reading the place gives across words, the one a place is a word of, or null: a word whose reading
 *  ends with a hyphen and the next word of its section that is not a mark, whether or not that one's begins with one
 *  (TAHOT's «Beth-» «-lehem» and «Tubal-» «Cain» alike: the review of the toggles fixes, 15 November 2026). */
const acrossIn = new Map();   // book -> Map(n -> places)
const acrossOf = (b, p) => {
  if (!acrossIn.has(b)) {
    const m = new Map();
    let prev = null;
    for (const q of slim(b).places) {
      if (q.mark) continue;
      if (prev && prev.i === q.i && prev.endsHalf) { const c = m.get(prev.n) || [prev]; c.push(q); m.set(prev.n, c); m.set(q.n, c); }
      prev = q;
    }
    acrossIn.set(b, m);
  }
  return p ? acrossIn.get(b).get(p.n) || null : null;
};

// the page has answered its sources: the book file landed or failed where it was needed
const ready = (p) => p.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 60000 }).catch(() => {});
/** A page of a work, opened as a first visit opens it: nothing kept on the device but `kept`, the files named in
 *  `refuse` refused, those in `serve` answered by the function given. What it asks for and every error it throws are
 *  kept with it. */
const open = async (work, { query = "", kept = {}, refuse = [], serve = [] } = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript((k) => { try { if (!sessionStorage.getItem("dp-check")) { localStorage.clear(); for (const [a, v] of Object.entries(k)) localStorage.setItem(a, v); sessionStorage.setItem("dp-check", "1"); } } catch { /* a page with no memory is a first visit */ } }, kept);
  const p = await ctx.newPage();
  const asked = [], errors = [];
  p.on("pageerror", (e) => { const m = String((e && e.message) || e).slice(0, 160); errors.push(m); pageErrors.push(`${work}${query}: ${m}`); });
  p.on("request", (r) => asked.push(r.url().replace(tree.base, "").split("?")[0]));
  for (const pat of refuse) await p.route(pat, (r) => r.abort());
  for (const [pat, fn] of serve) await p.route(pat, fn);
  await p.goto(`${tree.base}/zone.html?b=${work}${query}`, { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await ready(p);
  return { ctx, p, asked, errors, work, close: () => ctx.close() };
};
const INDEX_AT = "**/data/default-picks/index.json";
const bookAt = (b) => `**/data/default-picks/${IX.books[b] ? IX.books[b].file : `${b}.bin`}`;
/** The lines of a work as linesOnPage reads them; a reading that does not come to rest is said (D16). */
const lines = async (s, opts = {}) => {
  try { return await linesOnPage(s.p, { settleMs: 300, ...opts }); } catch (e) { unsettled.push(`${s.work}: ${String(e.message).slice(0, 140)}`); return null; }
};
const press = async (s, id) => { await s.p.evaluate((x) => { const b = document.getElementById(x); if (b) b.click(); }, id); await s.p.waitForTimeout(250); await ready(s.p); };
/** IN THE PAGE. The row's source pills, the note under them, what the device keeps and what the page says. */
const rowNow = () => {
  const pills = [...document.querySelectorAll("#default-pick button")].map((b) => ({ id: b.id, text: b.textContent.trim(), pressed: b.getAttribute("aria-pressed"), disabled: b.disabled, title: b.title,
    dir: ((document.getElementById(b.getAttribute("aria-describedby") || "") || {}).textContent || "").trim() }));
  const g = document.getElementById("default-pick"), note = document.getElementById("default-note");
  const say = note ? note.querySelector(".say") : null;
  const chooser = note ? [...note.querySelectorAll(".def-order button")].map((b) => ({ y: b.dataset.second, text: b.textContent.trim(), pressed: b.getAttribute("aria-pressed") === "true", disabled: b.disabled, id: b.id || "" })) : [];
  let kept = null, keptSecond = null, order = null;
  try { kept = localStorage.getItem("fh.defaults"); keptSecond = localStorage.getItem("fh.defaults.second"); order = localStorage.getItem("fh.def.order"); } catch { /* nothing kept */ }
  return { pills, groupHidden: !g || g.hidden, noteHidden: !note || note.hidden, say: say ? say.textContent : null, chooser, kept, keptSecond, order, state: window.__default ? JSON.parse(JSON.stringify(window.__default)) : null };
};
const row = (s) => s.p.evaluate(rowNow);
/** The Menu, opened as a reader opens it from the bar, and its buttons. */
const menu = async (s) => {
  await s.p.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight - innerHeight, 2400)));
  await s.p.waitForTimeout(400);
  await s.p.waitForSelector("#nav:not([hidden])", { timeout: 5000 }).catch(() => {});
  if (await s.p.evaluate(() => { const m = document.getElementById("menuPick"); return !!m && m.hidden; })) await s.p.click("#navMenu").catch(() => {});
  await s.p.waitForTimeout(200);
  return s.p.evaluate(() => { const m = document.getElementById("menuPick"); return !m ? null : { open: !m.hidden, items: [...m.querySelectorAll("button")].map((x) => ({ id: x.dataset.for || "", text: (x.firstChild || {}).textContent || "", pressed: x.getAttribute("aria-pressed"), said: (x.lastChild || {}).textContent || "" })) }; });
};

// ---- the model of a line ------------------------------------------------------------------------------------------
/** The line a word reads from the default sources: X's own, else the second's, else none, which is today's line; a
 *  pair keeps today's line. The line under STEP, first or second, is today's line, or STEP's own words where today's
 *  line is `bare` and the index carries them (step_words), under STEP's credit and drawn as a reading's packing; STEP's
 *  second fills only the places STEP leaves. `line` is the text as the page draws it. */
const layerAt = (b, X, Y, p, bare = false) => {
  if (!p || p.mark || p.kq) return null;
  const bf = bookRead(b);
  const of = (src, t, layer) => (t ? { src, text: t, line: src === "step" ? drawnStep(t) : drawn(t), m: MOF(src), layer } : null);
  const stepOwn = (layer) => of("step", bare ? STEP_WORDS.get(b).get(p.n) || null : null, layer);
  if (X === "step") {
    const leaf = IX.books[b].step_leaves.find((r) => r[0] === p.n);
    return of(Y, leaf && Y ? leafLine(leaf, Y) : null, "second") || stepOwn("first");
  }
  const t1 = of(X, lineAt(bf, p, X), "first");
  if (t1 || !Y) return t1;
  return Y === "step" ? stepOwn("second") : of(Y, lineAt(bf, p, Y), "second");
};
/** A word of a reading the place gives across words takes a source's line only where that source has a line at every
 *  word of it, and else keeps today's line, as its neighbor does (the review of 15 November 2026: under MACULA and UBS
 *  one half stood alone, «Bethlehem» «-lehem» at Ruth 1:1:10-11). d: the word's own layer (layerAt). */
const wholeAcross = (b, X, Y, p, d) => {
  const across = d ? acrossOf(b, p) : null;
  return !across || across.every((q) => q === p || (layerAt(b, X, Y, q) || {}).src === d.src) ? d : null;
};
/** Every line of a work under X with its second Y, from today's lines (`base`, the page read with no default layer):
 *  per section, its units by their first entry, as linesOnPage gives them. A joined run keeps its line unless X
 *  reads every word of it, and then each word reads X's line; a word of a reading the place gives across words keeps
 *  its line unless one source has a line at every word of it (wholeAcross). */
const modelOf = (b, X, Y, base) => sectionsOf(b).map((sec, i) => {
  const m = new Map(), covered = new Set();
  for (const u of (base.sections[i] || { units: [] }).units) {
    const [f, c] = u;
    for (let e = f; e < f + c; e += 1) covered.add(e);
    if (c > 1) {
      const run = Array.from({ length: c }, (_, j) => placeAt(b, i, f + j));
      const takes = X !== "step" && run.every((p) => p && !p.mark && !p.kq && lineAt(bookRead(b), p, X) !== null);
      if (takes) for (const p of run) m.set(p.e, [p.e, 1, drawn(lineAt(bookRead(b), p, X)), MOF(X)]);
      else m.set(f, u);
      continue;
    }
    const d = wholeAcross(b, X, Y, placeAt(b, i, f), layerAt(b, X, Y, placeAt(b, i, f), blank(u[2])));
    m.set(f, d ? [f, 1, d.line, d.m] : u);
  }
  for (let e = 0; e < sec.words; e += 1) {
    if (covered.has(e)) continue;
    const d = wholeAcross(b, X, Y, placeAt(b, i, e), layerAt(b, X, Y, placeAt(b, i, e), true));
    if (d) m.set(e, [e, 1, d.line, d.m]);
  }
  return m;
});
/** Where a reading differs from the model, each said by its verse and entry. */
const differ = (b, model, got, skip = new Set()) => {
  const out = [];
  model.forEach((m, i) => {
    const g = new Map(((got.sections[i] || {}).units || []).map((u) => [u[0], u]));
    for (const e of [...new Set([...m.keys(), ...g.keys()])].sort((x, y) => x - y)) {
      if (skip.has(`${i}:${e}`) || same(m.get(e), g.get(e))) continue;
      out.push({ i, e, want: m.get(e) || null, got: g.get(e) || null, where: `${b} ${sectionsOf(b)[i].label} entry ${e + 1}` });
    }
  });
  return out;
};
const sayDiff = (d) => `${d.where}: ${d.got ? `${said(d.got[2], 30)} [${d.got[3]}]` : "no line"}, owed ${d.want ? `${said(d.want[2], 30)} [${d.want[3]}]` : "no line"}`;
const unitCount = (r) => (r ? r.sections.reduce((a, s) => a + s.units.length, 0) : 0);

// ---- the card -----------------------------------------------------------------------------------------------------
/** IN THE PAGE. The card standing open, as a reader reads it. */
const cardNow = () => {
  const h = document.getElementById("hud");
  const pills = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")];
  const pressed = pills.find((x) => x.getAttribute("aria-pressed") === "true");
  const more = (el) => (el ? [...el.querySelectorAll(".r-more > span")].map((x) => x.textContent) : []);
  const piece = document.querySelector("#hud .r-piece:not(.r-sug)");
  const act = document.querySelector(".wb.active");
  const g = act ? act.querySelector(":scope > .g") : null;
  const c = g ? g.cloneNode(true) : null;
  if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  return {
    open: !!h && !h.hidden, n: pills.length,
    pills: pills.map((x) => `${x.getAttribute("aria-pressed") === "true" ? "*" : ""}${x.textContent.trim()}`),
    first: pills[0] ? { text: pills[0].textContent.trim(), title: pills[0].title || "", by: pills[0].dataset.by || "", pressed: pills[0] === pressed } : null,
    pressed: pressed ? pressed.textContent.trim() : null,
    now: ((document.querySelector("#hud .r-now .v") || {}).textContent || "").trim(), nowK: ((document.querySelector("#hud .r-now .k") || {}).textContent || "").trim(),
    line: c ? c.textContent.trim() : null, chosen: !!(act && act.classList.contains("chosen")),
    piece: piece ? { i: ((piece.querySelector(":scope > i") || {}).textContent || ""), b: ((piece.querySelector(":scope > b") || {}).textContent || ""), more: more(piece) } : null,
    dflt: [...document.querySelectorAll("#hud .r-dflt")].map((x) => ({ src: x.dataset.src, i: ((x.querySelector(":scope > i") || {}).textContent || ""), b: ((x.querySelector(":scope > b") || {}).textContent || ""), n: ((x.querySelector(":scope > .n") || {}).textContent || ""), on: !!x.querySelector(".r-on"), more: more(x) })),
    sug: !!document.querySelector("#hud .r-sug"),
    core: !!document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]') && document.querySelectorAll("#hud .b-cell .s-pills button").length > 1,
  };
};
const settledCard = async (s, test = (c) => c.open && (c.n > 0 || c.dflt.length > 0)) => {
  let last = "", now = null;
  for (let k = 0; k < 40; k += 1) {
    await s.p.waitForTimeout(150);
    now = await s.p.evaluate(cardNow);
    const key = JSON.stringify(now);
    if (test(now) && key === last) return now;
    last = key;
  }
  return now;
};
/** A word's card, opened by its address (verse and number among the verse's words), as a reader's link opens it. */
const openAt = async (s, label) => {
  await s.p.keyboard.press("Escape"); await s.p.waitForTimeout(120);
  await s.p.evaluate((h) => { location.hash = h; }, label);
  return settledCard(s);
};
const shut = async (s) => { await s.p.keyboard.press("Escape"); await s.p.waitForTimeout(120); };
/** The first `k` words of a work that stand under a line of their own, opened by a press as a reader presses them. */
const firstCards = async (s, k) => {
  const out = [];
  for (let j = 0; j < k; j += 1) {
    const ok = await s.p.evaluate((x) => {
      const wb = [...document.querySelectorAll("section.seg .he-text .wb:not(.mark)")].filter((w) => !w.closest(".wjoin") && w.querySelector(":scope > .g:not(.bare)"))[x];
      if (!wb) return null;
      wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click();
      const sec = wb.closest("section.seg");
      return { sec: Number(String(sec.id).slice(1)), e: [...sec.querySelectorAll(".he-text .wb")].indexOf(wb) };
    }, j);
    if (!ok) break;
    const c = await settledCard(s);
    out.push({ ...ok, ...c });
    await shut(s);
  }
  return out;
};

if (PAGE || HARNESS_PAGE) {
  tree = await serveTree(K3);
  browser = await (await loadPlaywright()).chromium.launch(launchOptions());
}

// what a source's other picks say on the card, after its line: « · 2 «pleasant» (another number)»
const moreWant = (b, n, src) => {
  const bf = bookRead(b), at = bf.places[n - 1], slot = at ? at[SLOT[src]] : 0;
  if (!slot) return [];
  const one = (k, w, note) => ` · ${k}${w ? ` «${w}»` : ""}${note ? ` (${note})` : w ? "" : " (no words given)"}`;
  // a reading after STEP's first (kind r again) is the word read in more than one, said so: «STEP reads this word as two»
  const rs = src === "step" ? slot.filter((x) => x[0] === 0).length : 0, rFirst = src === "step" ? slot.findIndex((x) => x[0] === 0) : -1;
  const asMany = rs > 1 ? `STEP reads this word as ${["", "one", "two", "three", "four"][rs] || rs}` : "";
  if (src === "step") return slot.map((x, j) => ({ k: j + 1, w: x[1] || null, note: x[0] === 1 ? `a meaning variant${x[2] ? `, ${x[2]}` : ""}` : x[0] === 2 ? "another number" : j !== rFirst ? asMany : "" })).filter((x) => x.k >= 2).map((x) => one(x.k, x.w, x.note));
  if (src === "ubs") {
    let piece = null, k = 0;
    const all = (slot[1] || []).map(([pc, w]) => { if (pc !== piece) { piece = pc; k = 0; } k += 1; return { k, w: w || null }; });
    return all.filter((x) => !(x.k === 1 && linePick(x.w) && hasText(slot[0]))).map((x) => one(x.k, x.w, ""));
  }
  if (src === "bdb") {
    const ps = slot.map(([sense, w], j) => ({ k: j + 1, w: w ? bf.bdb_words[w - 1] : null, note: sense !== "" ? `sense ${sense}` : THE_ENTRY }));
    return ps.filter((x) => !(x.k === 1 && !!ps[0].w)).map((x) => one(x.k, x.w, x.note));
  }
  return [];
};
const SUG = existsSync(join(K3, "data", "source-suggested", "index.json")) ? readJson(join(K3, "data", "source-suggested", "index.json")) : null;
const V = {};   // each page law's faults and what it saw
const law = (k) => { if (!V[k]) V[k] = { faults: [], saw: [] }; return V[k]; };

/** Today's lines of a work: the page read with its index refused, so it draws no default layer. */
const BASE = new Map();
const baseOf = async (b) => {
  if (!BASE.has(b)) { const s = await open(b, { refuse: [INDEX_AT] }); try { BASE.set(b, await lines(s)); } finally { await s.close(); } }
  return BASE.get(b);
};
const REST = new Map();

/** A work's line of what D13 samples there: said with what it saw, never counted as a card judged. */
const D13_SAMPLED = ": STEP's picks 2..n judged after TAHOT's pieces at ";
/** D13 on cards found from the book file: places where a source has more than one pick. STEP's are sampled where its
 *  pieces' line says them (the first three places whose pieces are TAHOT's) and where they stand on a line of their own
 *  (every place whose pieces are MACULA's alone, and the first with no pieces that answer). */
/** D13's sample of a work, found from its book file: the places it opens for each source. */
const d13Sample = (b) => {
  const bf = bookRead(b), want = { step: [], stepOwn: [], ubs: [], bdb: [] };
  for (const p of slim(b).places) {
    if (p.mark || p.kq) continue;
    const at = bf.places[p.n - 1];
    if (!at) continue;
    const several = Array.isArray(at[0]) && at[0].length > 1;
    if (want.step.length < 3 && several && p.pgA && p.pgS.includes("tahot")) want.step.push(p);
    if (several && !p.pgS.includes("tahot") && (p.pgA ? same(p.pgS, ["macula"]) : !want.stepOwn.some((x) => !x.pgA))) want.stepOwn.push(p);
    if (want.ubs.length < 3 && at[2] && (at[2][1] || []).filter((x) => x[0] === (at[2][1][0] || [])[0]).length > 1) want.ubs.push(p);
    if (want.bdb.length < 3 && Array.isArray(at[3]) && at[3].length > 1) want.bdb.push(p);
  }
  return want;
};
/** D13 on one card read at a place: { fault } where the source's picks 2..n are not the ledger's on it, { saw } where
 *  they are, or { saw, skip } where STEP's line is not on the card. STEP's picks follow its pieces' line where the
 *  pieces are TAHOT's (STEP's reading at this place), and stand on a line of their own (`own`) where they are another
 *  source's or none answer. */
const moreJudged = (b, p, src, own, c) => {
  const wantMore = moreWant(b, p.n, src);
  const stepPiece = c.piece && c.piece.i === `here ${PILL.step} reads ` ? c.piece : null;
  const line = src !== "step" ? c.dflt.find((x) => x.src === src) : own ? c.dflt.find((x) => x.src === "step") : stepPiece || c.dflt.find((x) => x.src === "step");
  if (src === "step" && !own && !line) return { saw: `${b} ${p.label}: STEP's line not on this card`, skip: true };
  if (!line) return { fault: `${b} ${p.label}: no line «here ${PILL[src]} reads»${own ? " of its own (the pieces here are not TAHOT's)" : ""} on the card` };
  const gotMore = line.more;
  const where = own ? ` (its own line, the pieces ${p.pgA ? p.pgS.join("+") : "none that answer"})` : "";
  if (!same(gotMore, wantMore)) return { fault: `${b} ${p.label} ${PILL[src]}${where}: the card says ${plain(gotMore.join("")).slice(0, 120)}, the ledger ${plain(wantMore.join("")).slice(0, 120)}` };
  return { saw: `${b} ${p.label} ${PILL[src]}${where} ${plain(wantMore.join("")).slice(0, 60)}` };
};
const d13 = async (s, b) => {
  const want = d13Sample(b);
  // what is sampled where, said first: STEP's picks judged after its pieces' line, and on a line of their own
  law("D13").saw.unshift(`${b}${D13_SAMPLED}${want.step.length} place(s), on their own line at ${want.stepOwn.length}${want.stepOwn.length ? ` (${want.stepOwn.map((p) => `${p.label} ${p.pgA ? p.pgS.join("+") : "no pieces"}`).join(", ")})` : ""}`);
  // the first card asks for the book's file; the cards are read once it is here
  const any = [...want.step, ...want.stepOwn, ...want.ubs, ...want.bdb][0];
  if (any) { await openAt(s, any.label); await ready(s.p); await s.p.waitForTimeout(300); await shut(s); }
  for (const [src, own] of [["step", false], ["step", true], ["ubs", false], ["bdb", false]]) for (const p of own ? want.stepOwn : want[src]) {
    const c = await openAt(s, p.label);
    await shut(s);
    const j = moreJudged(b, p, src, own, c);
    if (j.fault) law("D13").faults.push(j.fault); else law("D13").saw.push(j.saw);
  }
};
/** D12 at rest at every place whose pieces are MACULA's alone, found in the zone: the card's line of the pieces says
 *  «here MACULA reads», never STEP's, and STEP's picks stand on a line of their own. */
let macPiecesSeen = 0;
const macPiecePlaces = (b) => slim(b).places.filter((x) => !x.mark && !x.kq && x.pgA && same(x.pgS, ["macula"]));
/** D12 on the card read at such a place: a fault in words, or null. */
const macPieceFault = (b, p, c) => {
  const stepOwn = c.dflt.some((x) => x.src === "step");
  return !c.piece || c.piece.i !== `here ${PILL.macula} reads ` || !stepOwn ? `at rest ${b} ${p.label}, whose pieces are MACULA's alone: the line of the pieces ${c.piece ? `begins ${said(c.piece.i)}` : "is not on the card"}${stepOwn ? "" : ", and STEP's picks have no line of their own"}` : null;
};
const macPieces = async (s, b) => {
  for (const p of macPiecePlaces(b)) {
    const c = await openAt(s, p.label);
    await shut(s);
    macPiecesSeen += 1;
    const f = macPieceFault(b, p, c);
    if (f) law("D12").faults.push(f);
    else law("D12").saw.push(`at rest ${b} ${p.label}, MACULA's pieces: ${said(`${c.piece.i}${c.piece.b}`, 60)}, STEP's picks on their own line`);
  }
};

/** D11 and D12 (at rest) on w1: the first cards at rest; each source and back to STEP is the first paint. */
const d11d12 = async (s, b, R) => {
  const C0 = await firstCards(s, 20);
  const listed = !!(SUG && SUG.books && SUG.books[b]);
  // the line of the place's pieces names whose they are: STEP's where they are TAHOT's, MACULA's where they are MACULA's
  const pieceSaid = C0.filter((c) => c.piece).map((c) => c.piece.i);
  const whose = (c) => { const ps = (placeAt(b, c.sec, c.e) || { pgS: [] }).pgS; return [ps.includes("tahot") ? PILL.step : null, ps.includes("macula") ? PILL.macula : null].filter(Boolean).map((x) => `here ${x} reads `); };
  const misnamed = C0.filter((c) => c.piece && !whose(c).includes(c.piece.i));
  if (misnamed.length) law("D12").faults.push(`at rest the card's line of the place's pieces begins ${said(misnamed[0].piece.i)} at s${misnamed[0].sec} entry ${misnamed[0].e + 1}, whose pieces are ${(placeAt(b, misnamed[0].sec, misnamed[0].e) || { pgS: [] }).pgS.join(", ") || "none"}`);
  if (listed && !C0.some((c) => c.sug)) law("D12").faults.push(`at rest none of the first ${C0.length} cards of ${b} carries the BSB's line`);
  for (const c of C0) if (!c.core && c.pressed !== null && !(fold(c.pressed) === fold(c.line) && fold(c.now) === fold(c.line))) law("D12").faults.push(`at rest ${b} s${c.sec} entry ${c.e + 1}: the line ${said(c.line, 30)}, the row ${said(c.now, 30)}, pressed ${said(c.pressed, 30)}`);
  law("D12").saw.push(`at rest ${C0.length} cards of ${b}: ${pieceSaid.filter((t) => t === `here ${PILL.step} reads `).length} say «here STEP reads», ${pieceSaid.filter((t) => t === `here ${PILL.macula} reads `).length} «here MACULA reads», ${C0.filter((c) => c.sug).length} carry the BSB's line`);
  const key = (c) => JSON.stringify([c.pills, c.pressed, c.now]);
  const five = C0.slice(0, 5).map(key);
  for (const X of IDS.filter((x) => x !== "step")) {
    await press(s, `default-${X}`);
    await press(s, "default-step");
    const L = await lines(s);
    const d = L ? differ(b, R.sections.map((sec) => new Map(sec.units.map((u) => [u[0], u]))), L) : [{ where: "the lines were not read" }];
    if (d.length) law("D11").faults.push(`after ${PILL[X]}: ${d.length} line(s) moved · ${d.slice(0, 2).map((x) => (x.got ? sayDiff(x) : x.where)).join(" | ")}`);
    const C1 = (await firstCards(s, 5)).map(key);
    const moved = five.map((k, j) => (k === C1[j] ? null : j + 1)).filter(Boolean);
    if (moved.length) law("D11").faults.push(`after ${PILL[X]}: card(s) ${moved.join(", ")} of the first five differ`);
    law("D11").saw.push(`${PILL[X]} and back: ${L ? unitCount(L) : 0} lines, ${C1.length} cards`);
  }
};

/** Whether today's line (`base`) draws no words at a place: no line over it, or a line of its own that is blank. */
const bareIn = (base, p) => { const u = ((base.sections[p.i] || { units: [] }).units).find((x) => p.e >= x[0] && p.e < x[0] + x[1]); return !u || (u[1] === 1 && blank(u[2])); };
/** The fills at rest in a work, read against today's lines: the second's at the places STEP leaves, and STEP's own
 *  words, under STEP's credit, at the places today's line draws bare. */
const restFillsOf = (b, base) => {
  const out = new Map(FILLS.get(b));
  for (const [n, t] of STEP_WORDS.get(b)) if (bareIn(base, slim(b).places[n - 1])) out.set(n, { src: "step", text: t, m: MOF("step") });
  return out;
};

/** D5, D19, D13 (and for w1 D11 and D12 at rest) on a work at rest. */
const atRest = async (b, isW1) => {
  const B = await baseOf(b);
  const s = await open(b);
  try {
    const R = await lines(s);
    REST.set(b, R);
    if (!B || !R) { law("D5").faults.push(`${b}: the lines were not read`); return; }
    const second = autoSecond(IX.books[b].fills, "step");
    const fills = restFillsOf(b, B);
    // D5: the model at rest is today's line with STEP's leaves filled by its second, and STEP's own words where it is bare
    const d = differ(b, modelOf(b, "step", second, B), R);
    law("D5").faults.push(...d.map(sayDiff));
    const rec = readRecord(recordPath(K3, b));
    let asToday = 0, asFilled = 0, fillsDrawn = 0, underRun = 0;
    if (!rec) law("D5").faults.push(`${b}: no record of its resting lines`);
    else R.sections.forEach((sec, i) => {
      const recU = new Map((rec.sections[i] ? rec.sections[i][1] : []).map((u) => [u[0], u]));
      const baseU = new Map(((B.sections[i] || {}).units || []).map((u) => [u[0], u]));
      for (const e of new Set([...sec.units.map((u) => u[0]), ...recU.keys()])) {
        const p = placeAt(b, i, e), u = sec.units.find((x) => x[0] === e) || null, r = recU.get(e) || null;
        const filled = !!(p && fills.has(p.n) && u && u[1] === 1 && u[3] === fills.get(p.n).m);
        if (filled) { fillsDrawn += 1; if (same(r, u)) asFilled += 1; else if (same(r, baseU.get(e) || null)) asToday += 1; else law("D5").faults.push(`${b} ${sectionsOf(b)[i].label} entry ${e + 1}: the record holds ${r ? said(r[2], 30) : "no line"}, neither the fill nor today's line`); continue; }
        if (!same(r, u)) law("D5").faults.push(`${b} ${sectionsOf(b)[i].label} entry ${e + 1}: the page ${u ? said(u[2], 30) : "draws no line"} [${u ? u[3] : ""}], the record ${r ? said(r[2], 30) : "no line"} [${r ? r[3] : ""}]`);
      }
    });
    for (const n of fills.keys()) { const p = slim(b).places[n - 1]; if (((B.sections[p.i] || { units: [] }).units).some((u) => u[1] > 1 && p.e >= u[0] && p.e < u[0] + u[1])) underRun += 1; }
    law("D5").saw.push(`${b}: ${unitCount(R)} lines, ${fillsDrawn} of ${fills.size} fill(s) drawn${underRun ? ` (${underRun} under a joined run's line, which stands)` : ""}; the record ${!rec ? "absent" : fillsDrawn === 0 ? "as the page" : asFilled === fillsDrawn ? "carries the fills" : asToday === fillsDrawn ? "is of the page before the defaults" : `carries ${asFilled} fill(s), today's line at ${asToday}`}`);
    // D19 (page): no line at rest prints a "/" today's line does not
    let slashed = 0;
    R.sections.forEach((sec, i) => { for (const u of sec.units) if (u[2].includes("/")) { slashed += 1; const t = ((B.sections[i] || { units: [] }).units.find((x) => x[0] === u[0]) || [])[2]; if (t !== u[2]) law("D19").faults.push(`${b} ${sectionsOf(b)[i].label} entry ${u[0] + 1}: ${said(u[2], 30)} at rest, ${said(t || "", 30)} today`); } });
    law("D19").saw.push(`${b}: ${slashed} line(s) at rest print a "/", each as today's`);
    // D5's cards: at each fill drawn, the card pressed on the line; where the second fills, its reading row naming it
    for (const n of fills.keys()) {
      const p = slim(b).places[n - 1], f = fills.get(n);
      const u = (R.sections[p.i] || { units: [] }).units.find((x) => x[0] === p.e && x[1] === 1);
      if (!u) continue;
      const c = await openAt(s, p.label);
      const kOk = f.src === "step" || c.nowK.startsWith(`reading · ${PILL[f.src]} at this place · ${PILL.step} has none here`);
      if (!(c.pressed !== null && fold(c.pressed) === fold(u[2]) && kOk)) law("D5").faults.push(`${b} ${p.label}: the line ${said(u[2], 30)}, the card pressed ${c.pressed === null ? "nothing" : said(c.pressed, 30)}, its row ${said(c.nowK, 60)}`);
      else law("D5").saw.push(`${b} ${p.label} ${said(u[2], 30)} [${u[3]}], its card pressed on it`);
      await shut(s);
    }
    // D13: a source's other picks on the card, in the ledger's order
    await d13(s, b);
    // D12: the cards at the places whose pieces are MACULA's alone
    await macPieces(s, b);
    if (isW1) await d11d12(s, b, R);
  } finally { await s.close(); }
};

/** D7 (and on w1 D8 and D12) under each source other than STEP, opened for one load (?default=). */
const underEach = async (b, isW1) => {
  const B = await baseOf(b);
  for (const X of IDS.filter((x) => x !== "step")) {
    const s = await open(b, { query: `&default=${X}` });
    try {
      const L = await lines(s);
      const Y = autoSecond(IX.books[b].fills, X);
      if (!L || !B) { law("D7").faults.push(`${b} under ${PILL[X]}: the lines were not read`); continue; }
      const d = differ(b, modelOf(b, X, Y, B), L);
      law("D7").faults.push(...d.map((x) => `under ${PILL[X]} ${sayDiff(x)}`));
      const credits = new Set(L.sections.flatMap((sec) => sec.units.map((u) => u[3])));
      law("D7").saw.push(`${b} under ${PILL[X]} (second ${Y ? PILL[Y] : "none"}): ${unitCount(L)} lines, ${L.sections.reduce((a, sec) => a + sec.units.filter((u) => u[3] === MOF(X)).length, 0)} ${PILL[X]}'s${credits.has(MOF("step")) ? "" : ""}`);
      if (!isW1) continue;
      // D12 under X: the first twenty cards answer as the line, X's own pick first and pressed where it reads the word
      const C = await firstCards(s, 20);
      let own = 0;
      for (const c of C) {
        if (c.core || c.pressed === null) continue;
        if (!(fold(c.pressed) === fold(c.line) && fold(c.now) === fold(c.line))) law("D12").faults.push(`under ${PILL[X]} s${c.sec} entry ${c.e + 1}: the line ${said(c.line, 30)}, the row ${said(c.now, 30)}, pressed ${said(c.pressed, 30)}`);
        const p = placeAt(b, c.sec, c.e), dd = layerAt(b, X, Y, p);
        if (dd && dd.layer === "first") {
          own += 1;
          if (!(c.first && c.first.pressed && c.first.title.startsWith(`${PILL[X]} 1 at this place`) && c.first.by.split(" ").includes(MOF(X)) && c.nowK.startsWith(`reading · ${PILL[X]} at this place`)))
            law("D12").faults.push(`under ${PILL[X]} ${p.label}: the first pill ${c.first ? `${said(c.first.text, 30)} (${c.first.by}, ${said(c.first.title, 40)})` : "none"}${c.first && c.first.pressed ? "" : " not pressed"}, the row ${said(c.nowK, 50)}`);
        }
      }
      law("D12").saw.push(`under ${PILL[X]} ${C.length} cards, ${own} on ${PILL[X]}'s own pick`);
      // D8: each other source chosen as the second
      const counts = IX.books[b], work = slim(b).work;
      for (const Z of IDS.filter((y) => y !== X && y !== Y)) {
        const can = await s.p.evaluate((z) => { const x = document.querySelector(`#default-note .def-order button[data-second="${z}"]`); return x && !x.disabled ? (x.click(), true) : false; }, Z);
        if (!can) { law("D8").saw.push(`${PILL[X]}: ${PILL[Z]} fills nothing in ${b}, its button cannot be pressed`); continue; }
        await s.p.waitForTimeout(250); await ready(s.p);
        const L2 = await lines(s), r = await row(s);
        const d2 = L2 ? differ(b, modelOf(b, X, Z, B), L2) : [{ where: "the lines were not read" }];
        const moved = L2 ? differ(b, L.sections.map((sec) => new Map(sec.units.map((u) => [u[0], u]))), L2).length : 0;
        const kept = (() => { try { return JSON.parse(r.keptSecond || "{}")[X] || null; } catch { return null; } })();
        const say = noteSay({ first: X, second: Z, auto: Y, counts, work });
        if (d2.length || r.say !== say || kept !== Z || !r.state || r.state.second !== Z) law("D8").faults.push(`${PILL[X]} filled out by ${PILL[Z]}: ${d2.length ? `${d2.length} line(s) off the model · ${d2.slice(0, 2).map((x) => (x.got !== undefined ? sayDiff(x) : x.where)).join(" | ")}` : ""}${r.say !== say ? ` the note says ${said(r.say, 90)}, owed ${said(say, 90)}` : ""}${kept !== Z ? ` kept ${r.keptSecond}` : ""}`);
        else law("D8").saw.push(`${PILL[X]} then ${PILL[Z]}: ${moved} line(s) moved, as the model`);
      }
      // the second chosen is kept for that first alone; the auto source pressed clears it
      if (Y) {
        await s.p.evaluate((y) => { const x = document.querySelector(`#default-note .def-order button[data-second="${y}"]`); if (x) x.click(); }, Y);
        await s.p.waitForTimeout(250);
        const r = await row(s);
        if (!r.state || r.state.second !== Y || (r.state.chosen || {})[X]) law("D8").faults.push(`${PILL[X]}: pressing ${PILL[Y]}, the auto second, left ${r.state ? r.state.second : "nothing"} in force`);
      }
    } finally { await s.close(); }
  }
};

/** D4 on a page read at a first visit: STEP alone lit, the index's pills in its order, no note, nothing kept, the
 *  second counted here; the Menu mirroring the four pills and no chooser. */
const judgeD4 = (r, b, m, ix = IX) => {
  const faults = [];
  const e = ix.books[b], want = autoSecond(IX.books[b].fills, "step");
  const lit = r.pills.filter((x) => x.pressed === "true");
  if (lit.length !== 1 || lit[0].id !== "default-step") faults.push(`pressed: ${lit.map((x) => x.text).join(", ") || "none"}`);
  if (!same(r.pills.map((x) => [x.id, x.text]), IDS.map((x) => [`default-${x}`, PILL[x]]))) faults.push(`the pills read ${r.pills.map((x) => x.text).join(" ")}`);
  if (r.groupHidden) faults.push("the pills are hidden");
  if (!r.noteHidden) faults.push(`the note shows ${said(r.say, 60)}`);
  if (r.kept !== null || r.keptSecond !== null) faults.push(`the device keeps ${r.kept} and ${r.keptSecond}`);
  if (!r.state || r.state.on !== "step" || (r.state.second || null) !== want) faults.push(`the page says ${r.state ? `${r.state.on}, its second ${r.state.second}` : "nothing"}; counted here: step, its second ${want}`);
  const dir = `${pct(e.has.step, e.places)}${want && e.has.step < e.places ? ` · then ${PILL[want]}` : ""}`;
  if (lit[0] && lit[0].dir !== dir) faults.push(`under the lit pill ${said(lit[0].dir)}, owed ${said(dir)}`);
  if (m) {
    const items = m.items.filter((x) => /^default-/u.test(x.id));
    if (!same(items.map((x) => [x.id, x.text, x.pressed]), r.pills.map((x) => [x.id, x.text, x.pressed]))) faults.push(`the Menu holds ${items.map((x) => `${x.text}${x.pressed === "true" ? "*" : ""}`).join(" ") || "no source"}`);
    if (m.items.some((x) => !x.id)) faults.push("the Menu holds a button standing for no pill of the row (the note's chooser)");
  }
  return faults;
};

/** D4 and D6 on w1, from a first visit. */
const pillsAndNote = async (b) => {
  const s = await open(b);
  try {
    const r0 = await row(s), m0 = await menu(s);
    law("D4").faults.push(...judgeD4(r0, b, m0));
    law("D4").saw.push(`${b}: ${r0.pills.map((x) => `${x.text}${x.pressed === "true" ? "*" : ""}`).join(" ")} · under the lit pill ${said(r0.pills[0] ? r0.pills[0].dir : "")} · the Menu ${m0 ? m0.items.filter((x) => /^default-/u.test(x.id)).length : 0} of them`);
    await s.p.keyboard.press("Escape");
    const counts = IX.books[b], work = slim(b).work;
    const f6 = law("D6").faults, notes = [];
    const one = (r, X, how) => {
      const lit = r.pills.filter((x) => x.pressed === "true").map((x) => x.id);
      if (!same(lit, [`default-${X}`])) f6.push(`${how}: lit ${lit.join(", ") || "none"}`);
      if (!r.state || r.state.on !== X) f6.push(`${how}: the page says ${r.state ? r.state.on : "nothing"}`);
    };
    // the row: each pill pressed, the note opened by it
    for (const X of [...IDS.filter((x) => x !== "step"), "step"]) {
      await press(s, `default-${X}`);
      const r = await row(s), Y = autoSecond(counts.fills, X);
      one(r, X, `${PILL[X]} pressed on the row`);
      if (r.kept !== X) f6.push(`${PILL[X]} pressed: the device keeps ${r.kept}`);
      const say = noteSay({ first: X, second: Y, auto: Y, counts, work, macula: maculaPiecesIn(b) }), ch = chooserSays(X, Y, counts);
      notes.push({ X, say: r.say });
      if (r.noteHidden || r.say !== say) f6.push(`${PILL[X]} pressed: the note ${r.noteHidden ? "is hidden" : `says ${said(r.say, 100)}`}, owed ${said(say, 100)}`);
      if (!same(r.chooser.map((c) => [c.y, c.text, c.pressed, c.disabled]), ch.map((c) => [c.y, c.text, c.pressed, c.disabled]))) f6.push(`${PILL[X]} pressed: the chooser reads ${r.chooser.map((c) => `${c.text}${c.pressed ? "*" : ""}${c.disabled ? "(dead)" : ""}`).join(" ")}, owed ${ch.map((c) => `${c.text}${c.pressed ? "*" : ""}${c.disabled ? "(dead)" : ""}`).join(" ")}`);
      if (r.chooser.some((c) => c.id)) f6.push(`${PILL[X]} pressed: a chooser button carries an id, so the Menu would mirror it`);
    }
    // the lit STEP opens and shuts the note; a lit source other than STEP gives the line back to STEP
    await press(s, "default-step"); const shutNote = await row(s);
    await press(s, "default-step"); const openNote = await row(s);
    if (!shutNote.noteHidden || openNote.noteHidden) f6.push(`the lit STEP pressed twice: the note ${shutNote.noteHidden ? "shut" : "stayed"}, then ${openNote.noteHidden ? "stayed shut" : "opened"}`);
    await press(s, "default-ubs"); await press(s, "default-ubs");
    const back = await row(s);
    one(back, "step", "the lit UBS pressed again");
    if (!back.noteHidden) f6.push("the lit UBS pressed again: the note still shows");
    // the Menu: each press lights its pill in the row and in the Menu, and the Menu stays open
    for (const X of ["bdb", "step"]) {
      await menu(s);
      await s.p.click(`#menuPick button[data-for="default-${X}"]`).catch(() => f6.push(`the Menu has no ${PILL[X]}`));
      await s.p.waitForTimeout(300); await ready(s.p);
      const r = await row(s), m = await s.p.evaluate(() => { const x = document.getElementById("menuPick"); return { open: !!x && !x.hidden, lit: x ? [...x.querySelectorAll("button")].filter((y) => /^default-/u.test(y.dataset.for || "") && y.getAttribute("aria-pressed") === "true").map((y) => y.dataset.for) : [] }; });
      one(r, X, `${PILL[X]} pressed in the Menu`);
      if (!same(m.lit, [`default-${X}`]) || !m.open) f6.push(`${PILL[X]} pressed in the Menu: the Menu ${m.open ? "" : "closed, "}lights ${m.lit.join(", ") || "none"}`);
    }
    await s.p.keyboard.press("Escape");
    // kept: a reload keeps it; ?default= is for one load and is not kept
    await press(s, "default-ubs");
    await s.p.reload({ waitUntil: "networkidle" }); await s.p.waitForSelector("section.seg .he-text .wb"); await ready(s.p);
    const re = await row(s);
    one(re, "ubs", "after a reload");
    await s.p.goto(`${tree.base}/zone.html?b=${b}&default=bdb`, { waitUntil: "networkidle" }); await s.p.waitForSelector("section.seg .he-text .wb"); await ready(s.p);
    const once = await row(s);
    one(once, "bdb", "?default=bdb");
    if (once.kept !== "ubs") f6.push(`?default=bdb: the device keeps ${once.kept}, not the UBS kept before`);
    law("D6").saw.push(`${b}: ${notes.map((x) => `${PILL[x.X]} ${said(x.say, 70)}`).join(" | ")}`);
    return notes;
  } finally { await s.close(); }
};

/** D9 and D10 on w1: a ruling across the sources, then reset from a source with a chosen second. A ruling reaches
 *  every place its form stands (its pill says so), and on a card that opened on a block it rules that block's piece;
 *  so its reach is read off the page, as the lines it moved, and held there. */
const rulingAndReset = async (b) => {
  const R = REST.get(b), B = await baseOf(b);
  const s = await open(b);
  const f9 = law("D9").faults, f10 = law("D10").faults;
  try {
    const leaves = new Set(IX.books[b].step_leaves.map((x) => x[0]));
    const asMap = (L) => L.sections.map((sec) => new Map(sec.units.map((u) => [u[0], u])));
    // a word to rule: one word under a line of its own, no pair and no leaf, where MACULA reads otherwise
    const pickWord = (L, not) => {
      for (const [i, sec] of L.sections.entries()) for (const u of sec.units) {
        const p = placeAt(b, i, u[0]);
        if (u[1] !== 1 || !p || p.kq || leaves.has(p.n) || not.has(`${i}:${u[0]}`)) continue;
        const t = lineAt(bookRead(b), p, "macula");
        if (t && drawn(t) !== u[2]) return { p, i, e: u[0] };
      }
      return null;
    };
    const rule = async (w) => {
      await openAt(s, w.p.label);
      const took = await s.p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((y) => y.getAttribute("aria-pressed") !== "true" && !y.textContent.includes("+")); if (!x) return null; x.click(); return x.textContent.trim(); });
      await s.p.waitForTimeout(800); await shut(s);
      return took;
    };
    const chosen = (w) => s.p.evaluate(([i, e]) => { const wb = document.querySelectorAll(`#s${i} .he-text .wb`)[e]; return !!wb && wb.classList.contains("chosen"); }, [w.i, w.e]);
    // the ruled lines: every place a reading pressed moved, as the page drew it after the press
    const ruled = new Map();
    const reachOf = (before, after) => differ(b, asMap(before), after).filter((d) => d.got).map((d) => [`${d.i}:${d.e}`, d.got]);
    const held = (L, how) => {
      for (const [k, u] of ruled) {
        const [i, e] = k.split(":").map(Number);
        const g = L && L.sections[i] ? L.sections[i].units.find((x) => x[0] === e) || null : null;
        if (!same(g, u)) f9.push(`${how}: ${sectionsOf(b)[i].label} entry ${e + 1} reads ${g ? said(g[2], 30) : "nothing"} [${g ? g[3] : ""}], ruled ${said(u[2], 30)} [${u[3]}]`);
      }
    };
    const A = pickWord(R, new Set());
    if (!A) { f9.push(`no word of ${b} to rule`); return; }
    const tookA = await rule(A);
    const LA = await lines(s);
    if (!LA) { f9.push("the lines were not read after the ruling"); return; }
    for (const [k, u] of reachOf(R, LA)) ruled.set(k, u);
    const uA = ruled.get(`${A.i}:${A.e}`);
    if (!tookA || !uA || !fold(uA[2]).includes(fold(tookA)) || !(await chosen(A))) f9.push(`${A.p.label}: pressed ${said(tookA || "nothing")}, the line ${uA ? said(uA[2]) : "did not move"}`);
    const skip = () => new Set(ruled.keys());
    for (const X of IDS.filter((x) => x !== "step")) {
      await press(s, `default-${X}`);
      const L = await lines(s);
      held(L, `under ${PILL[X]}`);
      if (!(await chosen(A))) f9.push(`under ${PILL[X]} ${A.p.label} is no longer marked chosen`);
      const d = L ? differ(b, modelOf(b, X, autoSecond(IX.books[b].fills, X), B), L, skip()) : [];
      if (d.length) f9.push(`under ${PILL[X]} with a ruling, ${d.length} other line(s) off the model \u00b7 ${sayDiff(d[0])}`);
    }
    const relay = (label) => s.p.evaluate((t) => { const l = [...document.querySelectorAll(".row .lab")].find((x) => x.textContent.startsWith("joined words")); const x = l && [...l.nextElementSibling.querySelectorAll("button")].find((y) => y.textContent === t); if (x) x.click(); return !!x; }, label);
    const relayed = (await relay("as separate words")) && (await s.p.waitForTimeout(1200), await relay("as written"));
    await s.p.waitForTimeout(1500);
    const LR = await lines(s);
    if (!relayed) f9.push("the joined words switch was not found");
    else held(LR, "joined words out and back");
    // a ruling under a source stays when the line goes back to STEP
    // the first word whose card offers another reading to press
    let Bw = null, tookB = null;
    const tried = skip();
    if (LR) for (let k = 0; k < 12 && !tookB; k += 1) {
      const w = pickWord(LR, tried);
      if (!w) break;
      tried.add(`${w.i}:${w.e}`);
      const t = await rule(w);
      if (t) { Bw = w; tookB = t; }
    }
    const LB = await lines(s);
    if (LR && LB) for (const [k, u] of reachOf(LR, LB)) ruled.set(k, u);
    await press(s, "default-step");
    const LS = await lines(s);
    if (!Bw || !tookB) f9.push("no second word to rule under a source");
    else held(LS, "back on STEP");
    law("D9").saw.push(`${b} ${A.p.label} ruled ${said(tookA || "")}${Bw ? `, ${Bw.p.label} ruled ${said(tookB || "")} under ${PILL[IDS[IDS.length - 1]]}` : ""}: ${ruled.size} line(s) ruled in all, held under every source, joined words out and back, and back on STEP`);
    // D10: from a source with a chosen second and the rulings
    await press(s, "default-macula");
    const Z = await s.p.evaluate(() => { const x = [...document.querySelectorAll("#default-note .def-order button")].find((y) => !y.disabled && y.getAttribute("aria-pressed") !== "true"); if (!x) return null; x.click(); return x.dataset.second; });
    await s.p.waitForTimeout(300); await ready(s.p);
    const before = await row(s);
    const enabled = await s.p.evaluate(() => { const x = document.getElementById("resetPill"); return !!x && !x.disabled; });
    // pressed as the other pills are (press): reset draws every built line again, and on a work this size, every
    // section built, that runs past a click's 30 s wait (II Samuel: about a minute; live main ace7f07eba too)
    if (enabled) await s.p.evaluate(() => document.getElementById("resetPill").click());
    await s.p.waitForTimeout(1200); await ready(s.p);
    const after = await row(s), L0 = await lines(s);
    const d = L0 ? differ(b, R.sections.map((sec) => new Map(sec.units.map((u) => [u[0], u]))), L0) : [{ where: "the lines were not read" }];
    if (!Z || !before.state || (before.state.chosen || {}).macula !== Z) f10.push(`no second chosen under MACULA (${Z})`);
    if (!enabled) f10.push("the reset pill could not be pressed");
    if (!after.state || after.state.on !== "step" || Object.keys(after.state.chosen || {}).length || after.state.second !== autoSecond(IX.books[b].fills, "step") || after.keptSecond !== null)
      f10.push(`after reset the page says ${after.state ? `${after.state.on}, second ${after.state.second}, chosen ${JSON.stringify(after.state.chosen)}` : "nothing"}, kept ${after.keptSecond}`);
    if (d.length) f10.push(`after reset ${d.length} line(s) are not the first paint's · ${d.slice(0, 2).map((x) => (x.got !== undefined ? sayDiff(x) : x.where)).join(" | ")}`);
    law("D10").saw.push(`${b}: MACULA filled out by ${Z ? PILL[Z] : "?"}, two rulings; reset ${enabled ? "pressed" : "not pressable"}; after it ${L0 ? unitCount(L0) : 0} lines`);
  } finally { await s.close(); }
};

/** D14 on w4: no pills, no note, no book file, its lines its record's (the first sections). */
const noDefaults = async (w) => {
  const s = await open(w);
  try {
    const r = await row(s);
    const asked = s.asked.filter((u) => /\/data\/default-picks\/[^/]+\.bin$/u.test(u));
    const L = await lines(s, { from: 0, to: 4 }), rec = readRecord(recordPath(K3, w));
    const f = law("D14").faults;
    if (!r.groupHidden || !r.noteHidden) f.push(`${w}: the pills ${r.groupHidden ? "are hidden" : "show"}, the note ${r.noteHidden ? "is hidden" : "shows"}`);
    if (asked.length) f.push(`${w}: asked for ${asked.join(", ")}`);
    if (!rec || !L) f.push(`${w}: ${!rec ? "no record" : "the lines were not read"}`);
    else L.sections.forEach((sec, i) => { if (!same(sec.units, rec.sections[i] ? rec.sections[i][1] : null)) f.push(`${w} section ${sec.label}: the lines are not the record's`); });
    law("D14").saw.push(`${w}: no pills, no note, no book file; ${L ? L.sections.length : 0} section(s), ${L ? unitCount(L) : 0} lines, as the record`);
  } finally { await s.close(); }
};

// the book file refused: every line is the line as it rests (the layer under STEP, its second's fills and its own words
// where today's line is bare: one rule while a source waits for its file, or could not have it), the note says it
// could not be fetched, nothing throws
const restModel = (b, B) => modelOf(b, "step", autoSecond(IX.books[b].fills, "step"), B);
const judgeRefused = (d, r, errors) => {
  const out = [];
  if (d.length) out.push(`with the book file refused, ${d.length} line(s) are not the line as it rests · ${d.slice(0, 2).map((x) => (x.got !== undefined ? sayDiff(x) : x.where)).join(" | ")}`);
  if (r.noteHidden || !/could not be fetched/u.test(r.say || "")) out.push(`with the book file refused, the note ${r.noteHidden ? "is hidden" : `says ${said(r.say || "", 80)}`}`);
  if (errors.length) out.push(`with the book file refused, the page threw: ${errors[0]}`);
  return out;
};

/** D15 on w1: what is asked for, and when; the book file refused. */
const fetches = async (b) => {
  const f = law("D15").faults;
  const isIndex = (u) => /\/data\/default-picks\/index\.json$/u.test(u), isBook = (u) => u.endsWith(`/data/default-picks/${IX.books[b].file}`);
  const s = await open(b);
  try {
    const i0 = s.asked.filter(isIndex).length, b0 = s.asked.filter(isBook).length;
    await firstCards(s, 1); await ready(s.p); await s.p.waitForTimeout(400);
    const b1 = s.asked.filter(isBook).length;
    await firstCards(s, 2);
    const b2 = s.asked.filter(isBook).length, i2 = s.asked.filter(isIndex).length;
    if (i0 !== 1 || i2 !== 1) f.push(`the index asked ${i0} time(s) at load, ${i2} in all`);
    if (b0 !== 0 || b1 !== 1 || b2 !== 1) f.push(`the book file asked ${b0} time(s) at load, ${b1} by the first card, ${b2} after a second`);
    law("D15").saw.push(`${b} at rest: the index once at load, the book file ${b0} at load, ${b1} with the first card, ${b2 - b1} more with the second`);
  } finally { await s.close(); }
  const k = await open(b, { kept: { "fh.defaults": "ubs" } });
  try {
    const n = k.asked.filter(isBook).length;
    if (n !== 1) f.push(`with UBS kept, the book file asked ${n} time(s) at load`);
  } finally { await k.close(); }
  const B = await baseOf(b);
  const x = await open(b, { query: "&default=ubs", refuse: [bookAt(b)] });
  try {
    const L = await lines(x), r = await row(x);
    const d = L && B ? differ(b, restModel(b, B), L) : [{ where: "the lines were not read" }];
    const judged = judgeRefused(d, r, x.errors);
    f.push(...judged);
    law("D15").saw.push(`${b} under UBS with its book file refused: ${L ? unitCount(L) : 0} lines as they rest, the note ${said(r.say || "", 60)}`);
  } finally { await x.close(); }
};
/** D17 on w1: under «oldest first». */
const oldestFirst = async (b) => {
  const f = law("D17").faults;
  const kept = { "fh.def.order": "oldest" };
  const s0 = await open(b, { kept, refuse: [INDEX_AT] });
  const Bo = await lines(s0).finally(() => s0.close());
  const s = await open(b, { kept });
  try {
    const r = await row(s), L = await lines(s);
    const d = L && Bo ? differ(b, Bo.sections.map((sec) => new Map(sec.units.map((u) => [u[0], u]))), L) : [{ where: "the lines were not read" }];
    if (r.pills.some((x) => x.pressed === "true")) f.push(`under oldest first ${r.pills.filter((x) => x.pressed === "true").map((x) => x.text).join(", ")} is lit`);
    if (d.length) f.push(`under oldest first ${d.length} line(s) are not today's · ${d.slice(0, 2).map((x) => (x.got !== undefined ? sayDiff(x) : x.where)).join(" | ")}`);
    if (r.noteHidden || !/^The line reads «oldest first» on the switches\./u.test(r.say || "")) f.push(`under oldest first the note ${r.noteHidden ? "is hidden" : `says ${said(r.say || "", 80)}`}`);
    await press(s, "default-ubs");
    const r2 = await row(s);
    if (!same(r2.pills.filter((x) => x.pressed === "true").map((x) => x.id), ["default-ubs"]) || r2.order !== "place" || !r2.state || r2.state.on !== "ubs") f.push(`UBS pressed under oldest first: lit ${r2.pills.filter((x) => x.pressed === "true").map((x) => x.text).join(", ") || "none"}, the order kept ${r2.order}`);
    law("D17").saw.push(`${b}: ${L ? unitCount(L) : 0} lines as today's under oldest first, no pill lit; UBS pressed puts the line on the source here`);
  } finally { await s.close(); }
};

/** D18 on w1: MACULA switched off on the rail's sources. */
const sourceOff = async (b) => {
  const f = law("D18").faults;
  const R = REST.get(b);
  const off = [...new Set([...((R && R.state && R.state.sources_off) || []), MOF("macula")])];
  const kept = { "fh.sources.off": JSON.stringify(off) };
  const s0 = await open(b, { kept, refuse: [INDEX_AT] });
  const Bo = await lines(s0).finally(() => s0.close());
  const s = await open(b, { kept });
  try {
    const r = await row(s), L = await lines(s);
    const on = IDS.filter((x) => x !== "macula");
    const want = autoSecond(IX.books[b].fills, "step", on);
    const mac = r.pills.find((x) => x.id === "default-macula");
    if (!mac || !mac.disabled || !/ is switched off on the switches$/u.test(mac.title)) f.push(`MACULA's pill ${mac ? (mac.disabled ? `says ${said(mac.title, 60)}` : "can be pressed") : "is absent"}`);
    if (!r.state || (r.state.second || null) !== want) f.push(`the second is ${r.state ? r.state.second : "unsaid"}, counted here among the sources on: ${want}`);
    const d = L && Bo ? differ(b, modelOf(b, "step", want, Bo), L) : [{ where: "the lines were not read" }];
    if (d.length) f.push(`${d.length} line(s) off the model · ${d.slice(0, 2).map((x) => (x.got !== undefined ? sayDiff(x) : x.where)).join(" | ")}`);
    const named = L ? L.sections.flatMap((sec) => sec.units.filter((u) => String(u[3]).split(" ").includes(MOF("macula")))) : [];
    if (named.length) f.push(`${named.length} chip(s) name MACULA, switched off`);
    law("D18").saw.push(`${b} with MACULA off: its pill dead, the second ${want ? PILL[want] : "none"}, ${L ? unitCount(L) : 0} lines, no chip names it`);
  } finally { await s.close(); }
};

// a few pages at a time, each job's throw said under its law
const pool = async (jobs, k = 3) => {
  let next = 0;
  const run = async () => {
    while (next < jobs.length) {
      const [name, job] = jobs[next]; next += 1;
      try { await job(); } catch (e) { law(name).faults.push(`it threw: ${String((e && e.message) || e).split("\n")[0].slice(0, 160)}`); }
    }
  };
  await Promise.all(Array.from({ length: Math.min(k, jobs.length) }, run));
};
/** w3: the smallest work with a fill at rest at a word today's line draws bare, read off today's page. */
const findW3 = async () => {
  for (const b of byPlaces.filter((x) => FILLS.get(x).size || STEP_WORDS.get(x).size)) {
    const B = await baseOf(b);
    if (B && [...restFillsOf(b, B).keys()].some((n) => bareIn(B, slim(b).places[n - 1]))) return b;
  }
  return null;
};
const verdict = (k, title, judged = (v) => v.saw.length > 0) => {
  const v = law(k);
  check(`${k}  ${title}`, !v.faults.length && judged(v), v.faults.length ? `${v.faults.length} · ${first(v.faults, 2)}` : v.saw.length ? v.saw.join(" · ").slice(0, 700) : "nothing was judged");
};

if (PAGE) {
  let W3 = null;
  try {
    if (!W1 || !W2) side("the works", `w1 ${W1 || "none"}, w2 ${W2 || "none"}: the page laws that need them are not judged here`);
    await pool([["D5", () => baseOf(W1)], ["D5", () => baseOf(W2)], ["D5", async () => { W3 = await findW3(); }]]);
    if (!W3) side("D5  on w3 not judged here", "no work has a fill at rest at a word today's line draws bare");
    const works = [...new Set([W1, W2, W3].filter(Boolean))];
    console.log(`the works: w1 ${W1} (both STEP and its second leave a place), w2 ${W2} (STEP has no second), w3 ${W3} (a fill at a word today draws bare), w4 ${W4 || "none"} (not in the index)`);
    await pool([
      ...works.map((b) => ["D5", () => atRest(b, b === W1)]),
      ...works.map((b) => ["D7", () => underEach(b, b === W1)]),
      ["D4", () => pillsAndNote(W1)],
      ["D15", () => fetches(W1)],
      ["D17", () => oldestFirst(W1)],
      ...(W4 ? [["D14", () => noDefaults(W4)]] : []),
    ]);
    await pool([["D9", () => rulingAndReset(W1)], ["D18", () => sourceOff(W1)]]);
  } finally { await browser.close(); await tree.close(); }
  verdict("D4", "a first visit: «STEP» alone lit, the index's pills in its order, no note, nothing kept, the second counted here, the Menu mirroring the four pills and no chooser");
  verdict("D5", "at rest every line is today's, except exactly where STEP's second fills a place it leaves, or STEP's own words fill a word today's line draws bare: that line, its chip, its card pressed on it");
  verdict("D6", "each pill pressed on the row and in the Menu leaves one lit, is kept and kept over a reload, ?default= is not kept; the note and its shares are this check's; a lit pill pressed again does as the plan says");
  verdict("D7", "under each source every line of w1-w3 is the model: a pair and a run the source does not read whole keep today's line, else the source's, else its second's (STEP's: today's line, or its own words where that is bare), else today's");
  verdict("D8", "the second can be changed: the lines that move are the model's, the note follows, the choice is kept for that source, the auto source pressed clears it");
  verdict("D9", "a ruling outranks a source: across every source, joined words out and back, and back on STEP");
  verdict("D10", "reset from a source with a chosen second and two rulings: STEP with its auto second, every line the first paint's");
  verdict("D11", "back on STEP after each source is the first paint: every line, and the first five cards");
  if (!macPiecesSeen) side("D12  the cards at places whose pieces are MACULA's alone not judged here", "no work read at rest holds one");
  verdict("D12", "the card answers as the line under each source on the first twenty words, the source's own pick first and pressed; at rest the pieces' line names whose they are (every place of w1-w3 whose pieces are MACULA's alone opened for it, STEP's picks there on their own line), and the BSB's line");
  // judged only where a card was read: a work's line of what it samples (D13_SAMPLED) and a line not on its card are
  // said, and judge nothing
  verdict("D13", "a source's picks 2..n stand on the card in the ledger's order, UBS's numbered in each piece, a variant's letter as given", (v) => v.saw.some((x) => !/not on this card/u.test(x) && !x.includes(D13_SAMPLED)));
  if (W4) verdict("D14", "a work the index does not list: no pills, no note, no book file asked, its lines its record's");
  else side("D14  not judged here: every work on this disk is in the index");
  verdict("D15", "the index is asked once at boot; the book file not at rest, once at the first card, at load under a kept source; refused, every line is the line as it rests and the note says so");
  check("D16 no page error anywhere, and every reading came to rest", !pageErrors.length && !unsettled.length, pageErrors.length || unsettled.length ? first([...pageErrors, ...unsettled]) : "none");
  verdict("D17", "under «oldest first» no pill is lit and every line is today's; a pill pressed puts the line back on «the source here»");
  verdict("D18", "MACULA switched off: its pill dead, the second found again among the sources on, every line the model's, no chip names it");
  verdict("D19", "(page) at rest no line prints a \"/\" today's line does not");
} else if (!SELF_TEST) side("D4-D19 (page) not judged here: --node", "the node laws only");

// ==== THE FAULT HARNESS =============================================================================================
if (SELF_TEST) {
  console.log("\nthe fault harness: each law run again on a fault");
  const went = (h, base, red, what) => check(`${h}  the law went red as it should`, base && red, `${what}${base ? "" : " · the law is red without the fault, so this proves nothing"}`);
  // H1, H2: D1 on the harness's book
  if (!ledgerHere || !harnessBook) { side("H1  not judged here: the ledger is not on this machine"); side("H2  not judged here: the ledger is not on this machine"); }
  else {
    const hb = harnessBook, ledgerLines = LEDGER_BOOKS.get(hb), zp = slim(hb).places;
    const want = expectedPlaces(hb, ledgerLines, zp);
    const base = placesDiffer(hb, bookRead(hb), want.places);
    const copy = structuredClone(bookRead(hb));
    const at = copy.places.findIndex((x) => x && Array.isArray(x[0]) && hasText(x[0][0][1]));
    copy.places[at][0][0][1] = `${copy.places[at][0][0][1]} (a fault)`;
    const red1 = placesDiffer(hb, copy, want.places);
    went("H1", !base.length, red1.length === 1 && red1[0].includes(`n ${at + 1}:`), `one STEP pick's words changed in ${hb} at n ${at + 1}: D1 (b) finds ${red1.length} place(s)`);
    // a place whose slot v1.2's mend changes (most of its lines change only the rows a pick names, which no slot
    // carries): one of the places that gain STEP picks
    const slotOf = (st) => st.map((x) => { const it = [KIND_OF[x[1]], hasText(x[4]) ? x[4] : 0]; if (x[1] === "v") it.push(x[6][0]); return it; });
    const v11At = new Map(ledgerLines.map((d) => [`${hb} ${d.p}`, MEND11.get(`${hb} ${d.p}`) || d.step || []]));
    const key = [...MEND12.keys()].find((k) => k.startsWith(`${hb} `) && !same(slotOf(MEND12.get(k)), slotOf(v11At.get(k) || [])));
    if (!key) side("H2  not judged here", `no place of ${hb} whose slot v1.2's mend changes`);
    else {
      const red2 = placesDiffer(hb, bookRead(hb), expectedPlaces(hb, ledgerLines, zp, { skip: key }).places);
      went("H2", !base.length, red2.length >= 1, `v1.2's mend left off at ${key}: D1 (b) finds ${red2.length} place(s)`);
    }
  }
  // H3: D2 on one row with its sha16 flipped
  if (!ledgerHere) side("H3  not judged here: the ledger is not on this machine");
  else {
    const row0 = ROWS[0], flipped = [row0[0], row0[1], row0[2], `${row0[3].slice(0, 15)}${row0[3][15] === "0" ? "1" : "0"}`];
    const base = resolveRows([row0]), red = resolveRows([flipped]);
    went("H3", !base.missing.length, red.missing.length === 1, `row 0 (${row0[2]}, rank ${row0[1]}) with its sha16 flipped: D2 finds ${red.missing.length} missing`);
  }
  // H4, H5: D3
  // H4: a tie for a second broken the other way, the later source put before the earlier; where no second ties in
  // any book (so under v1.2), one is made in memory in the smallest book
  const T = (() => {
    for (const b of byPlaces) for (const x of IDS) {
      const fl = IX.books[b].fills, s = autoSecond(fl, x), z = s ? IDS.find((y) => y !== x && y !== s && fl[x][y] === fl[x][s]) : null;
      if (z) return { b, x, s, z, made: false };
    }
    const b = byPlaces[0];
    for (const x of IDS) {
      const s = autoSecond(IX.books[b].fills, x), z = s ? IDS.find((y) => y !== x && IDS.indexOf(y) > IDS.indexOf(s)) : null;
      if (z) return { b, x, s, z, made: true };
    }
    return null;
  })();
  if (!T) side("H4  not judged here", "no first has a second in any book");
  else {
    const order = IDS.filter((y) => y !== T.z);
    order.splice(order.indexOf(T.s), 0, T.z);
    const base = T.made ? judgeD3({ tie: T }) : D3, h4 = judgeD3({ order, tie: T });
    went("H4", !base.faults.length, h4.faults.length > 0, `${T.made ? `no second ties in the data; a tie made in memory in ${T.b}, ${PILL[T.z]} filling as much of what ${PILL[T.x]} leaves as ${PILL[T.s]}` : `the tie in ${T.b} for ${PILL[T.x]}'s second`}, broken toward ${PILL[T.z]}: D3 finds ${h4.faults.length} fault(s) · ${first(h4.faults, 1)}`);
  }
  const h5 = judgeD3({ any: true });
  went("H5", !D3.faults.length, h5.faults.length > 0, `a sign alone (UBS's «-», MACULA's «?» and «\u0060», STEP's «\u00bf») and BDB's picks with no words counted as lines, the pairs still none: D3 finds ${h5.faults.length} fault(s) · ${first(h5.faults, 1)}`);
  // H13: D3 on an index whose has.step counts the places where STEP's line rests bare, in the book holding most of them
  const restsIn = new Map();
  for (const x of D3.bare) { const b = x.split(" ")[0]; restsIn.set(b, (restsIn.get(b) || 0) + 1); }
  const h13At = [...restsIn.entries()].sort((a, c) => c[1] - a[1] || (a[0] < c[0] ? -1 : 1))[0];
  if (!h13At) side("H13 not judged here", "STEP's line rests bare at no place");
  else {
    const ix13 = structuredClone(IX);
    ix13.books[h13At[0]].has.step += h13At[1];
    const h13 = judgeD3({ index: ix13 });
    went("H13", !D3.faults.length, h13.faults.length > 0, `an index whose has.step counts the ${h13At[1]} place(s) of ${h13At[0]} where STEP's line rests bare: D3 finds ${h13.faults.length} fault(s) · ${first(h13.faults, 1)}`);
  }
  // H6: D6's note with the left share printed as a remainder
  const noteFaults = (notes, b, left) => notes.filter((x) => { const Y = autoSecond(IX.books[b].fills, x.X); return x.say !== noteSay({ first: x.X, second: Y, auto: Y, counts: IX.books[b], work: slim(b).work, left, macula: maculaPiecesIn(b) }); });
  let pageNotes = null;
  if (HARNESS_PAGE && W1) {
    tree = tree || await serveTree(K3);
    try {
      const s = await open(W1);
      try { pageNotes = []; for (const X of [...IDS.filter((x) => x !== "step"), "step"]) { await press(s, `default-${X}`); pageNotes.push({ X, say: (await row(s)).say }); } } finally { await s.close(); }
    } catch (e) { pageNotes = null; side("H6  the page's notes were not read", String(e.message).slice(0, 120)); }
  }
  if (pageNotes) {
    const base = noteFaults(pageNotes, W1, leftOwn), red = noteFaults(pageNotes, W1, leftRemainder);
    went("H6", !base.length, red.length > 0, `the left share as a remainder: D6 finds ${red.length} of ${pageNotes.length} notes of ${W1} wrong · ${red.length ? said(red[0].say, 90) : ""}`);
  } else if (!HARNESS_PAGE) side("H6  not judged here: --node", "D6 is a law of the page's own notes, and no page was read");
  else if (!W1) side("H6  not judged here: no work w1", "D6 is judged on w1's notes");
  // H7-H10, through p.route
  if (!HARNESS_PAGE || !W1) side("H7-H12 not judged here: --node", "the page side of the harness opens the page");
  else {
    try {
      const B = await baseOf(W1);
      const Y = autoSecond(IX.books[W1].fills, "macula");
      const model = modelOf(W1, "macula", Y, B);
      // H7: one MACULA pick changed in the served book file
      const p7 = slim(W1).places.find((p) => !p.mark && !p.kq && lineAt(bookRead(W1), p, "macula") && same((model[p.i].get(p.e) || [])[1], 1) && (model[p.i].get(p.e) || [])[3] === MOF("macula"));
      const mod = structuredClone(bookRead(W1));
      mod.places[p7.n - 1][1] = `${mod.places[p7.n - 1][1]} (a fault)`;
      const body = gzipSync(Buffer.from(JSON.stringify(mod), "utf8"), { level: 9 });
      const s0 = await open(W1, { query: "&default=macula" });
      let d0 = null;
      try { const L = await lines(s0); d0 = L ? differ(W1, model, L) : null; } finally { await s0.close(); }
      const s7 = await open(W1, { query: "&default=macula", serve: [[bookAt(W1), (r) => r.fulfill({ status: 200, contentType: "application/octet-stream", body })]] });
      let d7 = null;
      try { const L = await lines(s7); d7 = L ? differ(W1, model, L) : null; } finally { await s7.close(); }
      went("H7", !!d0 && !d0.length, !!d7 && d7.length === 1 && d7[0].i === p7.i && d7[0].e === p7.e, `${W1} ${p7.label}'s MACULA pick changed in the served file: D7 finds ${d7 ? d7.length : "no reading"} line(s) off the model${d7 && d7.length ? `, ${sayDiff(d7[0])}` : ""}`);
      // H8: the book file refused: D15 stays green
      const s8 = await open(W1, { query: "&default=macula", refuse: [bookAt(W1)] });
      try {
        const L = await lines(s8), r = await row(s8);
        const d = L ? differ(W1, restModel(W1, B), L) : [{ where: "the lines were not read" }];
        const j = judgeRefused(d, r, s8.errors);
        check("H8  the law stayed green as it should", !j.length, j.length ? first(j) : `${W1} under MACULA with its book file refused: every line as it rests, the note ${said(r.say || "", 60)}`);
      } finally { await s8.close(); }
      // H9: an index with another fills
      const ix9 = structuredClone(IX);
      ix9.books[W1].fills.step.ubs = IX.books[W1].fills.step.macula + 1;
      const s9a = await open(W1);
      let base9 = null;
      try { base9 = judgeD4(await row(s9a), W1, null); } finally { await s9a.close(); }
      const s9 = await open(W1, { serve: [[INDEX_AT, (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ix9) })]] });
      try { const red = judgeD4(await row(s9), W1, null); went("H9", !base9.length, red.length > 0, `an index whose fills make UBS STEP's second in ${W1}: D4 finds ${first(red, 1)}`); } finally { await s9.close(); }
      // H10: a source kept before a "first visit"
      const s10 = await open(W1, { kept: { "fh.defaults": "ubs" } });
      try {
        const r = await row(s10), red = judgeD4(r, W1, null);
        const L = await lines(s10, { from: 0, to: 1 });
        const st = (L && L.state) || {};
        // the resting lines' own bake asked: the state as linesInPage records it, the files the page asked for here
        const why = defaultsNotAtRest(K3, W1, st, tree.asked);
        went("H10", !base9.length, red.length > 0 && !!why, `UBS kept before a first visit: D4 finds ${first(red, 1)}; the state the resting lines record (${st.defaults}, second ${st.second}) is refused by bake-resting-lines-v1: ${why ? said(why, 120) : "no"}`);
      } finally { await s10.close(); }
      // H11, H12: the cards of w1 at rest at the places whose pieces are MACULA's alone (D12) and where STEP's picks
      // 2..n stand on a line of their own (D13's sample), judged as read, and again with a fault: the pieces' line
      // naming STEP (H11); STEP's picks 2..n dropped from its own line (H12)
      const macP = macPiecePlaces(W1), ownP = d13Sample(W1).stepOwn;
      const s11 = await open(W1);
      try {
        const readAt = async (list) => { const out = []; for (const p of list) { out.push([p, await openAt(s11, p.label)]); await shut(s11); } return out; };
        // the first card asks for the book's file; the cards are read once it is here
        if (macP.length || ownP.length) { await openAt(s11, (macP[0] || ownP[0]).label); await ready(s11.p); await s11.p.waitForTimeout(300); await shut(s11); }
        const cm = await readAt(macP), co = await readAt(ownP);
        if (!cm.length) side("H11 not judged here", `${W1} holds no place whose pieces are MACULA's alone`);
        else {
          const base = cm.map(([p, c]) => macPieceFault(W1, p, c)).filter(Boolean);
          const red = cm.map(([p, c]) => macPieceFault(W1, p, { ...c, piece: c.piece ? { ...c.piece, i: `here ${PILL.step} reads ` } : c.piece })).filter(Boolean);
          went("H11", !base.length, red.length === cm.length, `the line of the pieces naming STEP at the ${cm.length} place(s) of ${W1} whose pieces are MACULA's alone: D12 finds ${red.length} · ${first(red, 1)}`);
        }
        if (!co.length) side("H12 not judged here", `${W1} holds no place where STEP's picks 2..n stand on a line of their own`);
        else {
          const base = co.map(([p, c]) => moreJudged(W1, p, "step", true, c)).filter((j) => j.fault);
          const red = co.map(([p, c]) => moreJudged(W1, p, "step", true, { ...c, dflt: c.dflt.map((x) => (x.src === "step" ? { ...x, more: [] } : x)) })).filter((j) => j.fault);
          went("H12", !base.length, red.length === co.length, `STEP's picks 2..n dropped from its own line at the ${co.length} place(s) of ${W1} D13 samples so: D13 finds ${red.length} · ${red.length ? red[0].fault.slice(0, 120) : ""}`);
        }
      } finally { await s11.close(); }
    } catch (e) { check("H7-H12 the page side of the harness ran", false, String(e.message).split("\n")[0].slice(0, 160)); }
    finally { if (browser) await browser.close(); if (tree) await tree.close(); }
  }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
