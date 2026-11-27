#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It lays the line the second reader draws under each word
// beside the line the live reader draws there, and counts; it writes only
// the table it is asked for, and the list of the known differences when it
// is asked to make that list.
//
// THE LINE UNDER A WORD FOLLOWS THE LIVE READER (the second cut, 27 November
// 2026). The second reader (reader/place.html) draws STEP's English under
// each word by the live reader's own rule for signs: a part of STEP's that
// is only a sign is not drawn, and where every part is a sign they stand
// (tools/gloss-store-v1.mjs: printedForm, signsOff). The live reader's lines
// are recorded in data/resting-lines/<book>.json.gz. This reads the second
// reader's chapter files (data/place-answers-v1/page/), draws each word's
// line as the page draws it, and compares it, character for character, with
// the live line under the same word.
//
// THE DIFFERENCES THAT ARE KNOWN ARE A LIST (the third cut, 27 November
// 2026). The two lines differ at a few words, each for a cause that is
// known. They are held as a list beside the pins
// (data/place-answers-v1/lines-known-to-differ.tsv): one line a word, with
// its cause and who lists it.
//
//   the places' comparison   the words whose line today is not STEP's own
//                            parts (tools/compare-place-answers-with-resting-lines-v1.mjs
//                            --table). The cause is that tool's verdict, and
//                            for a word it calls different, today's credit.
//   this tool                the words of ALSO below, each with its cause.
//
// Every cause is judged against the data at every run. The run passes (exit
// 0) when the differences found are exactly the list: a difference that is
// not listed fails it, and so does a listed word that no longer differs, and
// a cause that no longer holds.
//
// The two causes this tool gives:
//   «the live line is another source's»: the live reader credits the line to
//   another source than STEP's word-by-word file; the second reader prints
//   STEP's own parts.
//   «the live page tests a tied word's whole line with its one-sign test; a
//   word of two signs slips it»: the live page first hides signs inside each
//   word's own line (a word whose every piece is a sign keeps them all), then
//   across a run of tied words hides a word whose whole line is one sign. A
//   word of two signs is not one sign, so it stands on the live page where a
//   word of one sign becomes a gap. By the live rule's own words («a part
//   that is a sign alone keeps its place as a gap, unless every part is
//   one») both are gaps, and the second reader draws both as gaps.
//
// --write-list --listed <the places' table> makes the list again, from that
// table and the words of ALSO, and then judges as always.
//
// Run: node tools/compare-place-answers-page-with-resting-lines-v1.mjs [--page data/place-answers-v1/page] [--lines data/resting-lines] [--list <the list>] [--table out.tsv]
//      node tools/compare-place-answers-page-with-resting-lines-v1.mjs --write-list --listed <the places' table>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS } from "./place-answers-sources-v1.mjs";
import { plainLine, piecesOf, drawnForms, tiedOn } from "./place-answers-page-v1.mjs";
import { signOnly, SIGN_GAP } from "./gloss-store-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i > -1 ? argv[i + 1] : d; };
const PAGE = arg("page", join(K3, "data", "place-answers-v1", "page")), LINES = arg("lines", join(K3, "data", "resting-lines")), LISTED = arg("listed"), TABLE = arg("table");
const LIST = arg("list", join(PAGE, "..", "lines-known-to-differ.tsv")), WRITE = argv.includes("--write-list");
if (!existsSync(join(PAGE, "index.json")) || !existsSync(LINES)) { console.log("the second reader's files or the live reader's lines are not on this disk"); process.exit(3); }
if (WRITE && (!LISTED || !existsSync(LISTED))) { console.error("--write-list needs --listed <the places' table> (node tools/compare-place-answers-with-resting-lines-v1.mjs --table <file> makes it)"); process.exit(2); }
if (!WRITE && !existsSync(LIST)) { console.log(`the list of the known differences is not on this disk (${LIST}); --write-list --listed <the places' table> makes it`); process.exit(3); }
const readGz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const N = (x) => Number(x).toLocaleString("en-US");
const shown = (s) => s.split(SIGN_GAP).join("␣");

// ---- the causes
const BY_PLACES = "the places' comparison", BY_THIS = "this tool";
const OTHER_SOURCE = "the live line is another source's";
const TWO_SIGNS = "the live page tests a tied word's whole line with its one-sign test; a word of two signs slips it";
// the words this tool lists itself: book, verse, the word's place among the verse's entries, the cause
const ALSO = [["judges", "19:13", 2, OTHER_SOURCE], ["ii-samuel", "5:8", 9, TWO_SIGNS], ["isaiah", "10:15", 12, TWO_SIGNS]];
// the credit the live reader gives a line it made of STEP's own parts
const STEPS_CREDIT = "PIECE:TAHOT";
// the places' verdicts, as that tool writes them
const NO_LINE = "no line today", SHARED = "today's line stands under more than one word", NO_PARTS = "different: the record gives no parts of STEP's as this word's", DIFFERENT = "different; today's credit ";
/** Whether a cause holds at a word that differs. d: what was found there (the live line and its credit, how many
 *  words the live line stands under, the second reader's line, the pieces of the word's own parts, whether the
 *  word is tied to a neighbor). */
function holds(cause, d) {
  if (cause === OTHER_SOURCE) return d.today !== null && d.credit !== "" && d.credit !== STEPS_CREDIT;
  if (cause === TWO_SIGNS) return d.tied && d.pieces.length >= 2 && d.pieces.every(signOnly) && d.today === d.pieces.join(" + ") && d.mine !== "" && d.mine.split(SIGN_GAP).join("") === "";
  if (cause === NO_LINE) return d.today === null;
  if (cause === SHARED) return d.today !== null && d.under !== 1;
  if (cause === NO_PARTS) return d.today !== null && d.under === 1;
  if (cause.startsWith(DIFFERENT)) return d.today !== null && d.under === 1 && d.credit === cause.slice(DIFFERENT.length);
  return false;
}

// ---- the list: made again where asked, else read
const keyOf = (book, verse, entry) => `${book}|${verse}|${entry}`;
if (WRITE) {
  const rows = [];
  for (const line of readFileSync(LISTED, "utf8").split("\n")) { const c = line.split("\t"); if (c.length > 8 && /^\d+$/u.test(c[3])) rows.push([c[0], c[1], c[3], c[6] === "different" ? DIFFERENT + c[8] : c[6], BY_PLACES]); }
  const have = new Set(rows.map((r) => keyOf(r[0], r[1], r[2])));
  for (const [book, verse, entry, cause] of ALSO) { if (have.has(keyOf(book, verse, entry))) { console.error(`${book} ${verse} entry ${entry} is listed by the places' comparison and by this tool`); process.exit(1); } rows.push([book, verse, String(entry), cause, BY_THIS]); }
  writeFileSync(LIST, ["book\tverse\tentry\tcause\tlisted by", ...rows.map((r) => r.join("\t"))].join("\n") + "\n");
  console.log(`the list is made: ${N(rows.length)} words in ${LIST}`);
}
const list = new Map();
for (const line of readFileSync(LIST, "utf8").split("\n").slice(1)) { const c = line.split("\t"); if (c.length < 5) continue; list.set(keyOf(c[0], c[1], c[2]), { book: c[0], verse: c[1], entry: c[2], cause: c[3], by: c[4] }); }

// ---- every word: the line the page draws beside the live line
const index = JSON.parse(readFileSync(join(PAGE, "index.json"), "utf8"));
const chaptersOf = new Map(index.books.map((b) => [b.book, b.chapters]));
let words = 0, same = 0, withGap = 0, noLine = 0, sharedLine = 0; const differ = [];
for (const [book] of BOOKS) {
  const rl = readGz(join(LINES, `${book}.json.gz`)); const lineOfVerse = new Map(rl.sections.map(([label, rows]) => [label, rows]));
  for (const ch of chaptersOf.get(book)) {
    const doc = readGz(join(PAGE, book, `${ch}.json.gz`));
    for (const v of doc.verses) {
      const lineAt = new Map(); for (const r of lineOfVerse.get(v.l) || []) for (let k = 0; k < r[1]; k += 1) lineAt.set(r[0] + k, r);
      let before = null; // the entry before this one, where it is a word
      for (const e of v.e) {
        if (e.m !== undefined) { before = null; continue; }
        words += 1;
        // the line the page draws: the read form's (a word written and not read: the written form's), as the chapter
        // file carries it (t.g where a sign is hidden, else the parts trimmed and joined); two read forms' lines are joined
        const lines = []; const pieces = [];
        for (const f of drawnForms(e)) { if (!f.t || !f.t.p) continue; pieces.push(...piecesOf(f.t.p)); const g = f.t.g !== undefined ? f.t.g : plainLine(f.t.p); if (!lines.includes(g)) lines.push(g); }
        const mine = lines.join(" + "); const row = lineAt.get(e.i);
        if (!row) noLine += 1; else if (row[1] !== 1) sharedLine += 1;
        const today = row ? row[2] : null;
        if (today === mine) { same += 1; if (mine.includes(SIGN_GAP)) withGap += 1; }
        else differ.push({ book, verse: v.l, entry: String(e.i), word: e.s, today, mine, credit: row ? row[3] || "" : "", under: row ? row[1] : 0, pieces, tied: tiedOn(e) || (before !== null && tiedOn(before)) });
        before = e;
      }
    }
  }
}

// ---- the judgment: the differences are exactly the list, each for its cause
const found = new Set(differ.map((d) => keyOf(d.book, d.verse, d.entry)));
const unlisted = differ.filter((d) => !list.has(keyOf(d.book, d.verse, d.entry)));
const gone = [...list.values()].filter((x) => !found.has(keyOf(x.book, x.verse, x.entry)));
const listedHere = differ.filter((d) => list.has(keyOf(d.book, d.verse, d.entry)));
const causeFails = listedHere.filter((d) => !holds(list.get(keyOf(d.book, d.verse, d.entry)).cause, d));
const byCause = new Map(); for (const d of listedHere) { const x = list.get(keyOf(d.book, d.verse, d.entry)); const k = `${x.cause}\t${x.by}`; byCause.set(k, (byCause.get(k) || 0) + 1); }
const say = (d) => `  ${d.book} ${d.verse} entry ${d.entry} ${d.word}: today «${d.today === null ? "(no line)" : shown(d.today)}» (${d.credit}) · here «${shown(d.mine)}»`;
console.log(`${N(words)} words. The second reader's line is the live reader's line, character for character, at ${N(same)} (${N(withGap)} of them with a hidden sign's gap); it differs at ${N(differ.length)}.`);
console.log(`  today's lines: none under ${N(noLine)} words, one line under more than one word at ${N(sharedLine)}`);
const listedBy = (who) => [...list.values()].filter((x) => x.by === who).length;
console.log(`  the list of the known differences holds ${N(list.size)} words: ${N(listedBy(BY_PLACES))} listed by ${BY_PLACES}, ${N(listedBy(BY_THIS))} by ${BY_THIS}`);
console.log("  the differences found that are on the list, by cause:");
for (const [k, n] of [...byCause].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))) { const [cause, by] = k.split("\t"); console.log(`  ${N(n).padStart(6)}  ${cause}  (${by})`); }
for (const d of listedHere.filter((x) => list.get(keyOf(x.book, x.verse, x.entry)).by === BY_THIS)) console.log(say(d));
const ok = unlisted.length === 0 && gone.length === 0 && causeFails.length === 0;
if (unlisted.length) { console.log(`FAIL  ${N(unlisted.length)} differences are not on the list:`); for (const d of unlisted.slice(0, 25)) console.log(say(d)); }
if (gone.length) { console.log(`FAIL  ${N(gone.length)} words of the list no longer differ:`); for (const x of gone.slice(0, 25)) console.log(`  ${x.book} ${x.verse} entry ${x.entry} (${x.cause})`); }
if (causeFails.length) { console.log(`FAIL  at ${N(causeFails.length)} listed words the cause does not hold:`); for (const d of causeFails.slice(0, 25)) console.log(`${say(d)} · listed as: ${list.get(keyOf(d.book, d.verse, d.entry)).cause}`); }
if (ok) console.log(`  ok  the differences are exactly the list (${N(differ.length)} words), and every cause holds`);
if (TABLE) { writeFileSync(TABLE, ["book\tverse\tentry\tword\ttoday's line\tthe second reader's line\ttoday's credit\tcause\tlisted by", ...differ.map((d) => { const x = list.get(keyOf(d.book, d.verse, d.entry)); return [d.book, d.verse, d.entry, d.word, d.today === null ? "(no line)" : shown(d.today), shown(d.mine), d.credit, x ? x.cause : "NOT LISTED", x ? x.by : ""].join("\t"); })].join("\n") + "\n"); console.log(`  the differences are written to ${TABLE}`); }
process.exit(ok ? 0 : 1);
