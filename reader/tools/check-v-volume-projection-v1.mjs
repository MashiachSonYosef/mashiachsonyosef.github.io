#!/usr/bin/env node
// RUN: tree
// GUARDS: v-volume-rule-v1-a-count-is-served-only-with-the-scope-it-was-counted-over
//
// THE COUNTS, READ BACK OFF THE SHELF. The card check presses the page; this
// one opens the 39 sidecars and asks whether the numbers in them are the
// numbers the corpus lane shipped and whether they can hold each other up.
//
//   L1  every book the V ledger covers carries a volume sidecar, and no other
//       book does. WHICH BOOKS THOSE ARE is the ledger's own book table, one
//       row a book, and the receipt of the projection carries its row count.
//       A work this door serves that the ledger does not cover carries no
//       sidecar and is named here as outside the ledger. Until 10 November
//       2026 the law read "every served book", which was the same thing while
//       the door served only what V covers and stopped being so on 8 November,
//       when an edition work outside it was put on the shelf: the check went
//       red on a page that was telling the truth (it prints no count it does
//       not have).
//   L2  THE NAME IS HELD. The owner ruled on 2026-09-14 that V's proposed
//       book_display_name values are used as shipped. All 39 already agreed,
//       character for character, with the name the zone carries from its own
//       edition metadata — two lanes arriving at the same 39 names apart. So
//       the ruling costs nothing and buys this: the day one of them moves,
//       a check fails instead of a page printing two names for one book.
//   L3  THE COUNTS NEST. The verses of a chapter sum to the chapter's own
//       count, and the chapters of a book to the book's. This is what makes
//       "no commentary on this verse, 408 in this chapter" a sentence a
//       reader cannot disprove by adding up the verses.
//   L4  every reference counted is a verse this book actually draws, and
//       every chapter counted is a chapter it has
//   L5  the sum over the 39 books is the corpus lane's own total for pairs
//       that reach a verse — the whole ledger, landed, counted once
//   L6  one scope, said the same way on all 39, and it is the owner's phrase
//   L7  the word layer is named as NOT carried, so nothing reads its absence
//       as a zero, and no sidecar carries a word-keyed count
//
// Run: node tools/check-v-volume-projection-v1.mjs
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { zonesServed, zonesWithVolume } from "./zones-on-disk-v1.mjs";

const ZONES = process.env.ZONES_DIR || "data/zones";
const RECEIPT = process.env.V_VOLUME_RECEIPT || "data/v-volume-receipt-v1.json";
const SCOPE_SAY = "among the works indexed so far";
// The corpus lane's own figure, from v-ledger-v2.json:
// the_merged_anchors.work_unit_id_pairs.reaching_a_verse. Five of the 50,346
// folded pairs reach no verse and so are on no book's count.
const PAIRS_REACHING_A_VERSE = 50341;

const served = zonesServed(ZONES);
const withVolume = zonesWithVolume(ZONES);
if (!withVolume.length) {
  console.log("SKIPPED — no zone carries a <slug>.volume.bin, so check-v-volume-projection-v1 has no count to read");
  process.exit(3);
}

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");

const load = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));

console.log(`— ${withVolume.length} volume sidecar(s) on a shelf of ${served.length} served book(s) —`);

// L1 ------------------------------------------------------------------------
// the ledger's coverage, off the receipt of the projection: the projector
// writes one sidecar a row of the ledger's book table and refuses a row this
// door does not serve, so "as many sidecars as rows, every one of them a served
// book" is "every book the ledger covers carries one"
const receipt = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
const bookTable = receipt ? (((receipt.source || {}).tables || []).find((t) => /book-volume/.test(t.file)) || null) : null;
const covered = bookTable ? bookTable.rows : null;
const servedSet = new Set(served);
const outside = served.filter((z) => !existsSync(join(ZONES, `${z}.volume.bin`)));
const stray = withVolume.filter((z) => !servedSet.has(z));
check("L1  every book the V ledger covers carries a volume sidecar, and no other book does",
  covered !== null && stray.length === 0 && withVolume.length === covered && receipt.sidecars === covered,
  covered === null ? `no receipt of the projection at ${RECEIPT}, so the ledger's coverage cannot be read`
    : stray.length ? `${stray.length} sidecar(s) for a book this door does not serve — ${few(stray)}`
    : `${withVolume.length} sidecar(s) · the ledger's book table has ${covered} row(s) · the receipt says ${receipt.sidecars}${outside.length ? ` · outside the ledger, and carrying none: ${few(outside, 6)}` : ""}`);

let nameOk = 0, nestBad = [], refBad = [], chBad = [], scopes = new Set(), total = 0;
let withCount = 0, versesCarried = 0, chaptersCarried = 0, wordLayer = [], nameBad = [];
for (const z of withVolume) {
  const v = load(join(ZONES, `${z}.volume.bin`));
  const zone = load(join(ZONES, `${z}.bin`));

  // L2 · the name, held against the zone's own
  if (v.display_name === zone.work) nameOk += 1;
  else nameBad.push(`${z}: sidecar "${v.display_name}", zone "${zone.work}"`);

  // L3 · the counts nest
  const perChapter = new Map();
  for (const [ref, n] of Object.entries(v.verses || {})) {
    const ch = String(ref).split(":")[0];
    perChapter.set(ch, (perChapter.get(ch) || 0) + n);
  }
  let sumCh = 0;
  for (const [ch, n] of Object.entries(v.chapters || {})) {
    sumCh += n;
    if ((perChapter.get(ch) || 0) !== n) nestBad.push(`${z} ${ch}: verses sum ${perChapter.get(ch) || 0}, chapter says ${n}`);
  }
  for (const ch of perChapter.keys()) if (!(v.chapters || {})[ch]) nestBad.push(`${z} ${ch}: verses carry a count, the chapter carries none`);
  if (sumCh !== (v.book || {}).pairs) nestBad.push(`${z}: chapters sum ${sumCh}, book says ${(v.book || {}).pairs}`);

  // L4 · every reference is a verse this book draws
  const labels = new Set((zone.sections || []).map((s) => s.label));
  const chapters = new Set([...labels].map((l) => String(l).split(":")[0]));
  for (const ref of Object.keys(v.verses || {})) if (!labels.has(ref)) refBad.push(`${z} ${ref}`);
  for (const ch of Object.keys(v.chapters || {})) if (!chapters.has(ch)) chBad.push(`${z} ch ${ch}`);

  // L5 · the totals
  total += (v.book || {}).pairs || 0;
  if ((v.book || {}).pairs) withCount += 1;
  versesCarried += Object.keys(v.verses || {}).length;
  chaptersCarried += Object.keys(v.chapters || {}).length;

  // L6 · one scope
  scopes.add((v.scope || {}).say);

  // L7 · nothing word-keyed rides here
  if (!v.the_word_layer_is_not_carried) wordLayer.push(`${z}: says nothing about the word layer`);
  if (v.words || v.positions || (v.book || {}).pairs_word_anchored) wordLayer.push(`${z}: carries a word-keyed count`);
}

check("L2  the name V proposed is the name this book's own zone carries",
  nameBad.length === 0, nameBad.length ? `${nameBad.length} — ${few(nameBad)}` : `${nameOk} of ${withVolume.length} agree, character for character`);
check("L3  the counts nest — verses into chapters, chapters into books",
  nestBad.length === 0, nestBad.length ? `${nestBad.length} — ${few(nestBad)}` : `${chaptersCarried} chapter(s) and ${withCount} book(s) add up exactly`);
check("L4  every reference counted is a verse this book draws",
  refBad.length === 0 && chBad.length === 0,
  refBad.length || chBad.length ? `${refBad.length + chBad.length} — ${few([...refBad, ...chBad])}` : `${versesCarried.toLocaleString()} verse(s), ${chaptersCarried} chapter(s)`);
check(`L5  the ${withVolume.length} books carry the whole ledger, counted once`,
  total === PAIRS_REACHING_A_VERSE,
  `${total.toLocaleString()} of the corpus lane's ${PAIRS_REACHING_A_VERSE.toLocaleString()} folded pairs that reach a verse`);
check("L6  one scope, said the same way on every book, and it is the owner's phrase",
  scopes.size === 1 && scopes.has(SCOPE_SAY),
  `${scopes.size} wording(s) — ${few([...scopes].map((x) => JSON.stringify(x)))}`);
check("L7  the word layer is named as not carried, and no sidecar carries one",
  wordLayer.length === 0, wordLayer.length ? `${wordLayer.length} — ${few(wordLayer)}` : `${withVolume.length} say so by name`);

console.log(`\n  ${withCount} book(s) carry commentary and ${withVolume.length - withCount} carry none · ${versesCarried.toLocaleString()} verses of ${withVolume.length} books${outside.length ? ` · ${outside.length} served work(s) outside the ledger` : ""}`);
console.log("  what this does not say: that a comment is any good, or that this site can open it. V is an anchor.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
