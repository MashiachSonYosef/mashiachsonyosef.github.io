#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It lays the line the second reader draws under each word
// beside the line the live reader draws there, and counts; it writes only
// the table it is asked for.
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
// The two can differ only where STEP's parts at the word are not what the
// live line was made from (the live line is another source's, or stands
// under two words, or there is none): the places' builder lists those words
// (tools/compare-place-answers-with-resting-lines-v1.mjs --table). Given
// that table with --listed, every difference found here must be a word of
// that list; one that is not fails the run (exit 1).
//
// Run: node tools/compare-place-answers-page-with-resting-lines-v1.mjs [--page data/place-answers-v1/page] [--lines data/resting-lines] [--listed <the places' table>] [--table out.tsv]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS } from "./place-answers-sources-v1.mjs";
import { plainLine } from "./place-answers-page-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const PAGE = arg("page", join(K3, "data", "place-answers-v1", "page")), LINES = arg("lines", join(K3, "data", "resting-lines")), LISTED = arg("listed"), TABLE = arg("table");
if (!existsSync(join(PAGE, "index.json")) || !existsSync(LINES)) { console.log("the second reader's files or the live reader's lines are not on this disk"); process.exit(3); }
const readGz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const N = (x) => Number(x).toLocaleString("en-US");
// the words the places' builder lists as not STEP's line today: book, verse, entry
const listed = new Set(); if (LISTED) for (const line of readFileSync(LISTED, "utf8").split("\n")) { const c = line.split("\t"); if (c.length > 3 && /^\d+$/u.test(c[3])) listed.add(`${c[0]}|${c[1]}|${c[3]}`); }
const index = JSON.parse(readFileSync(join(PAGE, "index.json"), "utf8"));
const chaptersOf = new Map(index.books.map((b) => [b.book, b.chapters]));
let words = 0, same = 0, withGap = 0, noLine = 0, sharedLine = 0; const differ = [];
for (const [book] of BOOKS) {
  const rl = readGz(join(LINES, `${book}.json.gz`)); const lineOfVerse = new Map(rl.sections.map(([label, rows]) => [label, rows]));
  for (const ch of chaptersOf.get(book)) {
    const doc = readGz(join(PAGE, book, `${ch}.json.gz`));
    for (const v of doc.verses) {
      const lineAt = new Map(); for (const r of lineOfVerse.get(v.l) || []) for (let k = 0; k < r[1]; k += 1) lineAt.set(r[0] + k, r);
      for (const e of v.e) {
        if (e.m !== undefined) continue; words += 1;
        // the line the page draws: the read form's (a word written and not read: the written form's), as the chapter
        // file carries it (t.g where a sign is hidden, else the parts trimmed and joined); two read forms' lines are joined
        const lines = []; for (const f of e.f) { if (e.k === 2 ? false : f.r === 2) continue; if (!f.t || !f.t.p) continue; const g = f.t.g !== undefined ? f.t.g : plainLine(f.t.p); if (!lines.includes(g)) lines.push(g); }
        const mine = lines.join(" + "); const row = lineAt.get(e.i);
        if (!row) noLine += 1; else if (row[1] !== 1) sharedLine += 1;
        const today = row ? row[2] : null;
        if (today === mine) { same += 1; if (mine.includes("\u200b")) withGap += 1; } else differ.push([book, v.l, e.i, e.s, today === null ? "(no line)" : today.replace(/\u200b/gu, "␣"), mine.replace(/\u200b/gu, "␣"), row ? row[3] : ""]);
      }
    }
  }
}
const outside = LISTED ? differ.filter((d) => !listed.has(`${d[0]}|${d[1]}|${d[2]}`)) : [];
console.log(`${N(words)} words. The second reader's line is the live reader's line, character for character, at ${N(same)} (${N(withGap)} of them with a hidden sign's gap); it differs at ${N(differ.length)}.`);
console.log(`  today's lines: none under ${N(noLine)} words, one line under more than one word at ${N(sharedLine)}`);
if (LISTED) console.log(`  the places' builder lists ${N(listed.size)} words whose line today is not STEP's; of the ${N(differ.length)} differences ${N(differ.length - outside.length)} are words of that list and ${N(outside.length)} are not`);
for (const d of (LISTED ? outside : differ).slice(0, 25)) console.log(`  ${d[0]} ${d[1]} entry ${d[2]} ${d[3]}: today «${d[4]}» (${d[6]}) · here «${d[5]}»`);
if (TABLE) { writeFileSync(TABLE, ["book\tverse\tentry\tword\ttoday's line\tthe second reader's line\ttoday's credit", ...differ.map((d) => d.join("\t"))].join("\n") + "\n"); console.log(`  the differences are written to ${TABLE}`); }
process.exit(LISTED && outside.length ? 1 : 0);
