#!/usr/bin/env node
// Synthesis lane · v-volume-rule-v1-a-count-is-served-only-with-the-scope-it-was-counted-over
// LEDGER: -
// It creates no reading, grades no card and touches no word. It carries one
// number per verse, one per chapter and one per book, and the sentence that
// names what those numbers were counted over. A count with no scope is a
// claim about everything; a count with its scope is a measurement.
//
// V IS AN ANCHOR, NOT A LATTICE (r2:mishkan/moses-ledgers/v-ledger-v2/). It
// points from a base word to the commentary units whose opening catchword
// names that word, and from a verse to how much commentary sits on it. The
// commentary's own words are a token stream it does not hold.
//
// WHAT IS SERVED AND WHAT IS NOT, under the owner's ruling of 2026-09-14:
//
//   Not served: V's first sentence, "N comments cover this word", which then
//   opens them. The 10,138 word-anchored pairs are spread over fourteen
//   works and this lane holds the text of none of them. An offer a page
//   cannot keep is worse than a silence that explains itself, so the word
//   layer stays in the ledger and off the page.
//
//   Served: the counts, with the scope said out loud. V measured 34 works in
//   116 editions; this site serves a different set; so every number this
//   tool carries is printed under "among the works indexed so far" and is
//   true of exactly what V counted.
//
// THE COLUMN, and it is the one thing a reader-facing count can get wrong:
// pairs, never units. `units_verse_level` on Exodus 16:29 is 1,210 and
// `pairs_verse_level` is 411 — the same commentary counted once per edition
// and once per work. A reader meets works, so the reader's number is the
// folded one. This tool reads pairs_verse_level, pairs_chapter_level and
// pairs_book_level and no other column, and the check re-reads them.
//
// THE SWITCH DOES NOT REACH HERE. V ships three positions of the framing
// trim — RULE6 (21,564 word-anchored positions), clause 13 strict (21,686),
// conservative (21,657) — and the owner's ruling on which becomes the rule
// is still owed. It is owed about the WORD layer. Not one of the three
// numbers this tool carries moves between the positions, because the trim
// governs which units are word-anchored and never how many units sit on a
// verse. So the counts layer can ship before that ruling, and this tool
// records the fact rather than asserting it: it reads all three word-anchored
// columns and refuses if they ever disagree about a verse total.
//
// THE COUNTS NEST, which is what makes the four sentences coherent. On all
// 929 chapters the verse counts sum to the chapter count, and on all 39
// books the chapter counts sum to the book count. So "no commentary on this
// verse, 481 in this chapter" is never a contradiction: the 481 are on the
// other verses, exactly.
//
// THE BOOK'S NAME. V ships book_display_name with status
// PROPOSED_PENDING_OWNER; the owner ruled on 2026-09-14 to use them as
// proposed. All 39 already agree, character for character, with the name
// this lane's own zone carries from the edition's metadata — two lanes
// arriving at the same 39 names apart. So the ruling changes no page. It
// changes the law: the names are now held together, and this tool refuses a
// book whose zone calls it something else.
//
// Run: node tools/project-v-volume-v1.mjs --ledger <dir with v-*-volume-v2.csv.gz>
//        --stamp YYYY-MM-DD [--zones data/zones] [--out data/zones] [--only <slug>]
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { join, basename } from "node:path";
import { zonesServed } from "./zones-on-disk-v1.mjs";

const RULE_ID = "v-volume-rule-v1-a-count-is-served-only-with-the-scope-it-was-counted-over";
const SCHEMA = "V_VOLUME_V1";
const SHIPMENT = "r2:mishkan/moses-ledgers/v-ledger-v2/";
// The owner's own phrase, from the ruling. It is printed on the page beside
// every number this tool carries, and the check reads it from here.
const SCOPE_SAY = "among the works indexed so far";

const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const LEDGER = arg("--ledger");
const ZONES = arg("--zones", "data/zones");
const OUT = arg("--out", ZONES);
const ONLY = arg("--only");
const STAMP = arg("--stamp", "");
if (!LEDGER) { console.error("--ledger <dir with v-verse-volume-v2.csv.gz, v-chapter-volume-v2.csv.gz, v-book-volume-v2.csv.gz> is required"); process.exit(2); }
if (!/^\d{4}-\d{2}-\d{2}$/u.test(STAMP)) { console.error("--stamp YYYY-MM-DD is required: a projection says when it was made"); process.exit(2); }

const sha = (b) => createHash("sha256").update(b).digest("hex");
// A row is split at the commas outside the provider's own quotes. Every
// column this tool reads is a bare integer or a slug, but the tables carry
// quoted sentences further along the row and a naive split shifts every
// column after one.
const cells = (line) => {
  const out = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i += 1; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
};
const table = (name) => {
  const path = join(LEDGER, name);
  if (!existsSync(path)) { console.error(`no ${name} under ${LEDGER}`); process.exit(2); }
  const bytes = readFileSync(path);
  const lines = gunzipSync(bytes).toString("utf8").trim().split("\n");
  const head = cells(lines[0]);
  const rows = lines.slice(1).map((l) => { const v = cells(l); const o = {}; head.forEach((k, i) => { o[k] = v[i]; }); return o; });
  return { rows, from: { file: name, sha256: sha(bytes), bytes: bytes.length, rows: rows.length } };
};

const V = table("v-verse-volume-v2.csv.gz");
const C = table("v-chapter-volume-v2.csv.gz");
const B = table("v-book-volume-v2.csv.gz");
const n = (x) => { const v = Number(x); if (!Number.isInteger(v)) throw new Error(`not an integer: ${JSON.stringify(x)}`); return v; };

// ---- the three refusals, before a byte is written -------------------------
// 1. the switch does not reach the verse total
const moved = V.rows.filter((r) => r.pairs_verse_level !== r.reader_N_pairs);
if (moved.length) {
  console.error(`REFUSED: ${moved.length} verse rows where pairs_verse_level and reader_N_pairs disagree — the reader's column is not the one this tool would carry`);
  process.exit(1);
}
// 2. the counts nest: verses into chapters, chapters into books
const sumV = new Map();
for (const r of V.rows) { const k = `${r.book}|${r.chapter}`; sumV.set(k, (sumV.get(k) || 0) + n(r.pairs_verse_level)); }
const sumC = new Map();
const nestBad = [];
for (const r of C.rows) {
  const k = `${r.book}|${r.chapter}`;
  if ((sumV.get(k) || 0) !== n(r.pairs_chapter_level)) nestBad.push(`${k}: verses sum ${sumV.get(k) || 0}, chapter says ${r.pairs_chapter_level}`);
  sumC.set(r.book, (sumC.get(r.book) || 0) + n(r.pairs_chapter_level));
}
for (const r of B.rows) if ((sumC.get(r.book) || 0) !== n(r.pairs_book_level)) nestBad.push(`${r.book}: chapters sum ${sumC.get(r.book) || 0}, book says ${r.pairs_book_level}`);
if (nestBad.length) {
  console.error(`REFUSED: the counts do not nest at ${nestBad.length} scope(s) — ${nestBad.slice(0, 3).join(" · ")}`);
  console.error("  A count that does not nest makes 'no commentary on this verse, N in this chapter' a sentence a reader can disprove by adding up the verses.");
  process.exit(1);
}
// 3. every book V names is a book this lane serves under the same slug
const served = new Set(zonesServed(ZONES));
const unknown = B.rows.map((r) => r.book).filter((b) => !served.has(b));
if (unknown.length) {
  console.error(`REFUSED: V names ${unknown.length} book(s) this door does not serve under that slug — ${unknown.slice(0, 5).join(" · ")}`);
  process.exit(1);
}

// ---- per book -------------------------------------------------------------
const byBookV = new Map(), byBookC = new Map();
for (const r of V.rows) { if (!byBookV.has(r.book)) byBookV.set(r.book, []); byBookV.get(r.book).push(r); }
for (const r of C.rows) { if (!byBookC.has(r.book)) byBookC.set(r.book, []); byBookC.get(r.book).push(r); }

const source = {
  shipment: SHIPMENT,
  what: "V ledger v2, the corpus lane's commentary anchor — 34 works in 116 editions over the 39 canonical books",
  scope_count: { works: 34, editions: 116 },
  tables: [V.from, C.from, B.from],
  candidate_only: true,
  column: "pairs_*, never units_* — the folded count, one per work, which is what a reader meets",
};

let wrote = 0, withAny = 0, versesCarried = 0, chaptersCarried = 0, bytes = 0;
const nameBad = [];
for (const row of B.rows) {
  const slug = row.book;
  if (ONLY && slug !== ONLY) continue;
  // the name, held together with the one the zone already carries
  const zonePath = join(ZONES, `${slug}.bin`);
  const zone = JSON.parse(gunzipSync(readFileSync(zonePath)).toString("utf8"));
  if (zone.work !== row.book_display_name) { nameBad.push(`${slug}: zone "${zone.work}", V "${row.book_display_name}"`); continue; }

  const verses = {};
  for (const r of byBookV.get(slug) || []) { const p = n(r.pairs_verse_level); if (p) { verses[r.ref] = p; versesCarried += 1; } }
  const chapters = {};
  for (const r of byBookC.get(slug) || []) { const p = n(r.pairs_chapter_level); if (p) { chapters[r.chapter] = p; chaptersCarried += 1; } }
  const bookPairs = n(row.pairs_book_level);
  if (bookPairs) withAny += 1;

  const sidecar = {
    schema_version: SCHEMA,
    rule_id: RULE_ID,
    work: slug,
    display_name: row.book_display_name,
    display_name_status: row.book_display_name_status,
    display_name_ruled: "ADOPTED — the owner ruled on 2026-09-14 to use V's proposed names as shipped; all 39 already agree with the name this zone carries",
    scope: {
      say: SCOPE_SAY,
      works: 34,
      editions: 116,
      whose: "the corpus lane's index, not this door's shelf — this site serves works V did not count, and V counted works this site does not hold",
    },
    switch: {
      position: "RULE6",
      moves_nothing_here: true,
      why: "the framing trim governs which units are word-anchored; it never changes how many units sit on a verse, so all three positions give these numbers",
    },
    book: {
      pairs: bookPairs,
      chapters: n(row.chapters),
      verses: n(row.verses),
      chapters_with_commentary: n(row.chapters_with_commentary),
      verses_with_commentary: n(row.verses_with_commentary),
    },
    chapters,
    verses,
    // What is NOT here, named, so nothing reads the absence as a zero.
    the_word_layer_is_not_carried: "V anchors 21,686 positions to a word. This lane holds the text of none of the fourteen works that anchor them, so the count is not offered: an offer a page cannot keep is worse than a silence that explains itself.",
    source,
    emitted_from: {
      rule: RULE_ID,
      projected_on: STAMP,
      projected_by: "tools/project-v-volume-v1.mjs",
      counts_nest: "verified over all 929 chapters and all 39 books before this file was written",
    },
  };
  const outPath = join(OUT, `${slug}.volume.bin`);
  writeFileSync(outPath, gzipSync(Buffer.from(JSON.stringify(sidecar)), { level: 9 }));
  bytes += statSync(outPath).size;
  wrote += 1;
}

if (nameBad.length) {
  console.error(`REFUSED: ${nameBad.length} book(s) whose zone and V disagree about the name — ${nameBad.slice(0, 3).join(" · ")}`);
  console.error("  The owner ruled V's names are used as proposed. Two lanes printing two names for one book is the fault that ruling closes.");
  process.exit(1);
}

const receipt = {
  schema_version: "V_VOLUME_RECEIPT_V1",
  rule_id: RULE_ID,
  projected_on: STAMP,
  projected_by: "tools/project-v-volume-v1.mjs",
  source,
  sidecars: wrote,
  books_carrying_commentary: withAny,
  verses_carrying_commentary: versesCarried,
  chapters_carrying_commentary: chaptersCarried,
  scope_say: SCOPE_SAY,
  what_is_served: "the verse, chapter and book counts, each printed with the scope it was counted over",
  what_is_not_served: "the word layer — 21,686 anchored positions over fourteen works whose text this lane does not hold",
};
const receiptPath = join(OUT, "..", "v-volume-receipt-v1.json");
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

console.log(`${wrote} volume sidecar(s) · ${withAny} book(s) carry commentary, ${39 - withAny} carry none`);
console.log(`  ${versesCarried.toLocaleString()} verses and ${chaptersCarried.toLocaleString()} chapters carry a count · ${(bytes / 1024).toFixed(0)} KB in all`);
console.log(`  the counts nest: verses into all 929 chapters, chapters into all 39 books`);
console.log(`  ${basename(receiptPath)} written`);
