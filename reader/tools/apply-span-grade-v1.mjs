#!/usr/bin/env node
// GUARDS: span-grade-rule-v1-a-joined-reading-with-no-pointing-or-pointed-otherwise-where-step-tags-its-words-as-separate-entries-rests-held-back
// LEDGER: M
// it writes, on each place of the span store, which rows (M) the place holds
// back under «only this pointing», and why, from the corpus lane's grade of
// each row, kept here byte for byte, and STEP's own tags on the place's
// words. No grade is decided here, and no row and no text is changed.
//
// A JOINED READING POINTED OTHERWISE RESTS HELD BACK WHERE STEP TAGS ITS
// WORDS AS SEPARATE ENTRIES, AND ONE WITH NO POINTING RESTS HELD BACK.
//
// Some dictionaries file two or more words as one entry: «Beersheba»,
// «Ben-Hadad», «Monday», «the Jewish people». The span store (data/span-store/
// <book>.json, the corpus lane's v2.1) lists such an entry under the ink's
// bare letters at every place the letters stand, so an entry pointed as other
// words (עַם־יִשְׂרָאֵל, «the Jewish people», at «with Israel», עִם־יִשְׂרָאֵל)
// stands beside one that is the words themselves. Since ships 5 and 6 each
// word of a run reads its own reading on the line, the joined reading a press
// away (run-reads-its-words-rule-v1), so what this decides is which joined
// readings a run's card offers at rest.
//
// The corpus lane graded every row at every place (relay v169, 12 November
// 2026; data/span-grade/, its rule RULE.md): same, same word, silent (the row
// has no pointed headword) or otherwise. 9,222 rows at 2,845 places: same
// 8,189, same word 382, silent 279, otherwise 372. By hand, about a third of
// the otherwise rows are another word on the same letters and about two
// thirds the place's own name or phrase in the form the verse gives it (a
// name in pause, «Beersheba» with שָׁבַע against the entry's שֶׁבַע), and
// neither the lane's classes (at a pause, before a maqaf) nor the zone's
// headword part them. STEP's own tags do (the page lane's probe of 16
// November 2026, wip/2026-11-16/the-four-cards/, logs/span-tags.txt): where
// STEP tags every word of the place with one entry, the row is the place's
// own name; where STEP tags the words as separate entries, it is mostly
// another word.
//
// THE RULE (the owner, 16 November 2026: «ok go ahead» to card 1 of the four
// cards, task 92, and the same morning's call on a row with no pointing,
// task 134: «if its no pointing why would that in your head auto qualify it
// for all pointings rather than none»), at each place, for each row it names:
//
//   same, same word   stands.
//   silent            rests held back: «silent», no pointing.
//   otherwise         rests held back, «otherwise», where STEP's tags name
//                     no one entry over every word of the place; stands
//                     where they name one, or where a word carries no tag.
//
// STEP'S TAG is TAHOT's Strong's number on the word's core, as the zone
// carries it (data/zones/<book>.bin: the word's tg, or, on a word written one
// way and read another, the tg of its region whose letters are the word's,
// else its first tagged region; tagHolder, zone.html), read with STEP's
// letter set aside (numberOf, tools/entry-gate-v1.mjs: H3026A and H3026B are
// one entry, Jegar-sahadutha). One entry: some number every word carries.
// The place's words are the verse's words with the scribes' marks left out,
// from its first to its last, as the span store numbers them.
//
// NO GUARD. A single word's rows are held back by the pointing only where some
// row points as the place does (the guard of 6 November 2026, «a pointing no
// source attests withholds nothing»), so a card is never emptied of every
// reading. A run's joined readings may all rest held back at a place, because
// its words one by one always remain on the card.
//
// WHAT IS WRITTEN. On each place of a book file, after its other members:
//
//   held: { <row_id>: "otherwise" | "silent", ... }
//
// in the order of the place's row_ids, only where the place holds a row back;
// a place that holds none carries no held. Nothing else in the file moves: a
// place's other members and every row are the lane's, byte for byte, and the
// book file keeps the bake's own byte shape (one line, no indent). The span
// store's index says so (span_grade), and the receipt
// (data/span-grade-receipt-v1.json) names the inputs by their sha256 and
// counts the rows by grade, by STEP's tags and by source. The page reads
// held on the place a card stands on (zone.html: spanPlaceAt,
// spanPlaceOfCell, poolFor) and never the key's: one key stands at many
// places, and its rows rest held back at one and stand at another
// («Ramoth-gilead» where STEP tags its two words as two entries, and at II
// Chronicles 18:2, where a word of it carries no tag).
//
// REFUSED, each in words and with nothing written:
//   - a file that is not the bytes its pin names, a lane's receipt that names
//     other figures for the list or the rule, or a second count that does not
//     agree with the list;
//   - a list whose grades, recounted, are not the receipt's, or a grade the
//     rule does not name;
//   - a line whose place the served store does not hold (its book, verse,
//     first and last word and key), or holds other than once, or with other
//     rows than the line grades, in another order or under other sources;
//     a served place no line grades, or one two lines grade;
//   - a place whose words in the zone do not spell its key, or a word whose
//     tag is not of TAHOT's shape (H, its number, one letter or none).
// A place's held is written whole from the rule on every run, so a held the
// rule does not give is never kept.
//
// THE STORE THE LANE READ. The lane's receipt names the served book files it
// graded by the sha256 of the set; read with every held taken out, they are
// those bytes today, and the receipt says so (the_store_was_that_version).
// Where they are not, every place and row is still held to the list as
// above, and the run says the store moved.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints and
// writes nothing. --on gives the moment the run is recorded under
// (tools/step-moment-v1.mjs); with none it is the clock's. Not run by the
// round: it changes the span store, and is run once when its input arrives,
// as the other store tools are (tools/round-v1.sh says why), and again after
// the span store is baked again (tools/bake-span-store-v2.mjs writes no held)
// or a store tool rewrites its rows (the years, the ledgers' divisions keep
// a place's held, since they write the book file whole as they read it).
//
// Run: node tools/apply-span-grade-v1.mjs [--on <moment>] [--dry]
//        [--pin data/span-grade/PIN.json] [--span-store data/span-store]
//        [--zones data/zones] [--receipt data/span-grade-receipt-v1.json]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { readPinned, readPinnedLines, sha256Of, PinFault } from "./pinned-v1.mjs";
import { numberOf } from "./entry-gate-v1.mjs";
import { givenMoment, momentOf } from "./step-moment-v1.mjs";
import { startedAs } from "./main-guard-v1.mjs";

export const SPAN_GRADE_RULE_ID = "span-grade-rule-v1-a-joined-reading-with-no-pointing-or-pointed-otherwise-where-step-tags-its-words-as-separate-entries-rests-held-back";
export const SPAN_GRADE_HOME = "data/span-grade";
export const SPAN_GRADE_TOOL = "tools/apply-span-grade-v1.mjs";
export const GRADES = ["same", "same word", "silent", "otherwise"];
// why a place holds a row back: the grade's own name
export const HELD_WHY = ["otherwise", "silent"];
// STEP's tags on the place's words: what they say of one entry over the place
export const STEP_SAYS = { one: "one entry", none: "a word with no tag", several: "separate entries" };
// TAHOT's tag: H, its number, and STEP's letter (a capital, or a small one where STEP ran past its capitals for one name)
export const TAG_SHAPE = /^H\d+[A-Za-z]?$/u;

// the tag holder of a word, as the page's tagHolder finds it: the word, or its region whose letters are the word's, else its first tagged region
export const tagHolderOf = (word) => {
  if (!word) return null;
  if (word.tg) return word;
  const tagged = (word.w || word.kqw || []).filter((r) => r && r.tg);
  return tagged.find((r) => r.k === word.k) || tagged[0] || null;
};
export const tagsOf = (word) => { const h = tagHolderOf(word); return h ? [].concat(h.tg).map(String) : []; };
// what STEP's tags say over a place's words: "one" (some number every word carries), "none" (a word carries no number), "several"
export const stepSays = (wordsTags) => {
  const nums = wordsTags.map((tags) => [...new Set(tags.map(numberOf).filter(Boolean))]);
  if (!nums.length || nums.some((n) => !n.length)) return "none";
  return nums.reduce((a, n) => a.filter((x) => n.includes(x))).length ? "one" : "several";
};
// why the place holds the row back, or null where it stands
export const heldWhy = (grade, says) => (grade === "silent" ? "silent" : grade === "otherwise" && says === "several" ? "otherwise" : null);
// the bare letters of a word as written, U+05D0 to U+05EA
const lettersIn = (s) => [...String(s || "")].filter((c) => c >= "\u05d0" && c <= "\u05ea").join("");
// a book file as the lane baked it: every place's held taken out, in the bake's own byte shape
export const laneBytesOf = (file) => JSON.stringify({ ...file, placesList: (file.placesList || []).map((pl) => { const { held, ...rest } = pl; return rest; }) });
// the sha256 of a set of files: the lines «<file> <sha256 of the file>», one per file in name order, each ending in a line feed (the lane's receipts' own way)
export const setSha256 = (pairs) => sha256Of(Buffer.from([...pairs].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map(([f, s]) => `${f} ${s}\n`).join(""), "utf8"));

// run as a program, not imported (tools/main-guard-v1.mjs says why it is asked this way)
const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
if (startedAs(import.meta.url)) {
  const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
  const DRY = process.argv.includes("--dry");
  const PIN = arg("pin", join(K3, SPAN_GRADE_HOME, "PIN.json"));
  const SPAN = arg("span-store", join(K3, "data", "span-store"));
  const ZONES = arg("zones", join(K3, "data", "zones"));
  const RECEIPT = arg("receipt", join(K3, "data", "span-grade-receipt-v1.json"));
  let GIVEN_ON = null;
  try { GIVEN_ON = givenMoment(); } catch (e) { console.log(`apply-span-grade-v1: ${e.message}`); process.exit(2); }
  const n = (x) => Number(x).toLocaleString("en-US");

  const faults = [];
  const fault = (say) => { faults.push(say); console.log(`FAIL  ${say}`); };
  const refuse = () => { console.log(`\napply-span-grade-v1: ${faults.length} fault(s); nothing written`); process.exit(1); };

  // ── the pin, the list, the lane's receipt and its second count ────────────
  const pin = JSON.parse(readFileSync(PIN, "utf8"));
  const folder = join(dirname(PIN), pin.folder || "");
  let lines = [], laneReceipt = null, laneVerify = null;
  try {
    readPinned(join(folder, pin.rule.file), pin.rule);
    lines = readPinnedLines(join(folder, pin.list.file), pin.list);
    laneReceipt = JSON.parse(readPinned(join(folder, pin.receipt.file), pin.receipt).toString("utf8"));
    for (const b of pin.beside || []) { const bytes = readPinned(join(folder, b.file), b); if (b.file === "verify-receipt-v1.json") laneVerify = JSON.parse(bytes.toString("utf8")); }
  } catch (e) { if (!(e instanceof PinFault)) throw e; fault(e.message); refuse(); }
  const out0 = (laneReceipt.outputs || [])[0] || {};
  if (out0.sha256 !== pin.list.sha256 || out0.bytes !== pin.list.bytes || out0.lines !== pin.list.lines) fault(`the lane's receipt names its list ${out0.sha256} (${out0.bytes} bytes, ${out0.lines} lines), and the pin ${pin.list.sha256} (${pin.list.bytes} bytes, ${pin.list.lines} lines)`);
  if ((laneReceipt.rule || {}).sha256 !== pin.rule.sha256) fault(`the lane's receipt names its rule ${(laneReceipt.rule || {}).sha256}, and the pin ${pin.rule.sha256}`);
  if (!laneVerify || laneVerify.verdict !== "AGREE" || ((laneVerify.checked || {}).list || {}).sha256 !== pin.list.sha256) fault(`the lane's second count does not agree with the list the pin names (${laneVerify ? `${laneVerify.verdict}, of ${((laneVerify.checked || {}).list || {}).sha256}` : "no verify receipt beside it"})`);
  const byGrade = Object.fromEntries(GRADES.map((g) => [g, 0]));
  for (const o of lines) for (const r of o.rows || []) { if (!GRADES.includes(r.grade)) fault(`${o.book} ${o.ref} ${r.row_id}: the grade ${JSON.stringify(r.grade)} is none the rule names`); else byGrade[r.grade] += 1; }
  if (laneReceipt.places !== lines.length || GRADES.some((g) => (laneReceipt.rows_by_grade || {})[g] !== byGrade[g])) fault(`the list recounted is ${lines.length} places, ${GRADES.map((g) => `${g} ${byGrade[g]}`).join(", ")}, and the lane's receipt ${laneReceipt.places} places, ${GRADES.map((g) => `${g} ${(laneReceipt.rows_by_grade || {})[g]}`).join(", ")}`);
  if (faults.length) refuse();

  // ── the served store: each line's place, found once ────────────────────────
  const spanIndexPath = join(SPAN, "index.json");
  const spanIndex = JSON.parse(readFileSync(spanIndexPath, "utf8"));
  const bookFiles = readdirSync(SPAN).filter((f) => /^[a-z0-9-]+\.json$/u.test(f) && f !== "index.json").sort();
  const books = new Map();   // book -> { f, path, before (text), file, lane (lane bytes' sha256) }
  for (const f of bookFiles) {
    const path = join(SPAN, f);
    const before = readFileSync(path, "utf8");
    const file = JSON.parse(before);
    if (!file.book || !Array.isArray(file.placesList) || !file.keys) { fault(`${f} is not a book file of the span store`); continue; }
    books.set(file.book, { f, path, before, file, lane: sha256Of(Buffer.from(laneBytesOf(file), "utf8")) });
  }
  const laneSet = setSha256([...books.values()].map((b) => [b.f, b.lane]));
  const readAs = ((laneReceipt.inputs || {}).span_store || {}).books_sha256 || null;
  const storeWasThatVersion = laneSet === readAs;
  const graded = new Map();   // place object -> line
  for (const o of lines) {
    const b = books.get(o.book);
    const [first, last] = [o.w[0], o.w[o.w.length - 1]];
    const at = `${o.book} ${o.ref} ${first}-${last} ${o.key}`;
    if (!b) { fault(`${at}: the served store has no book file for ${o.book}`); continue; }
    const here = b.file.placesList.filter((pl) => pl.ref === o.ref && pl.first === first && pl.last === last && pl.key === o.key);
    if (here.length !== 1) { fault(`${at}: the served store holds the place ${here.length} times`); continue; }
    const pl = here[0];
    if (graded.has(pl)) { fault(`${at}: two lines grade the place`); continue; }
    const ids = (o.rows || []).map((r) => r.row_id);
    if (JSON.stringify(ids) !== JSON.stringify(pl.row_ids)) { fault(`${at}: the line grades the rows ${ids.join(",")}, and the place names ${pl.row_ids.join(",")}`); continue; }
    const rowsOfKey = new Map((b.file.keys[pl.key] || []).map((r) => [r.row_id, r]));
    const other = o.rows.filter((r) => !rowsOfKey.has(r.row_id) || String(rowsOfKey.get(r.row_id).slots[3]) !== String(r.m));
    if (other.length) { fault(`${at}: ${other.length} graded row(s) stand under the key under another source, or not at all (${other.map((r) => `${r.row_id} ${r.m}`).join(", ")})`); continue; }
    graded.set(pl, o);
  }
  for (const b of books.values()) for (const pl of b.file.placesList) if (!graded.has(pl)) fault(`${b.file.book} ${pl.ref} ${pl.first}-${pl.last} ${pl.key}: a served place no line of the list grades`);
  if (faults.length) refuse();

  // ── STEP's tags on each place's words ──────────────────────────────────────
  const zones = new Map();   // book -> Map(label -> words, marks left out)
  const wordsOf = (book, ref) => {
    if (!zones.has(book)) {
      const p = join(ZONES, `${book}.bin`);
      const m = new Map();
      if (existsSync(p)) for (const sec of JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")).sections || []) m.set(String(sec.label), (sec.words || []).filter((w) => !w.mark));
      zones.set(book, m);
    }
    return zones.get(book).get(String(ref)) || null;
  };
  const tagsRead = [];   // [book, ref, word number, tags]: what the receipt names by its sha256
  const placeSays = new Map();   // place -> { says, tags }
  for (const [pl, o] of graded) {
    const at = `${o.book} ${o.ref} ${pl.first}-${pl.last} ${pl.key}`;
    const ws = wordsOf(o.book, o.ref);
    if (!ws) { fault(`${at}: the zone ${o.book} has no verse ${o.ref}`); continue; }
    const words = ws.slice(pl.first - 1, pl.last);
    if (words.length !== pl.last - pl.first + 1) { fault(`${at}: the verse has ${ws.length} words`); continue; }
    const spelt = words.map((w, j) => lettersIn(w.s) + (j < words.length - 1 ? (w.presentation_join && w.presentation_join.join_next_without_separator ? "\u05be" : " ") : "")).join("");
    if (spelt !== pl.key) { fault(`${at}: the zone's words spell ${spelt}`); continue; }
    const tags = words.map(tagsOf);
    const odd = tags.flat().filter((t) => !TAG_SHAPE.test(t));
    if (odd.length) { fault(`${at}: a tag not of TAHOT's shape: ${odd.join(", ")}`); continue; }
    tags.forEach((t, j) => tagsRead.push([o.book, o.ref, pl.first + j, t]));
    placeSays.set(pl, { says: stepSays(tags), tags });
  }
  if (faults.length) refuse();

  // ── the rule, place by place ────────────────────────────────────────────────
  const C = {
    places: graded.size, rows: 0, places_holding_a_row: 0, places_holding_every_row: 0, rows_held: 0,
    by_grade: Object.fromEntries(GRADES.map((g) => [g, { rows: 0, held: 0 }])),
    otherwise_by_step_tags: { "one entry": 0, "a word with no tag": 0, "separate entries": 0 },
    otherwise_places_by_step_tags: { "one entry": 0, "a word with no tag": 0, "separate entries": 0 },
    by_source: {},
  };
  const byKey = new Map();   // key -> what its otherwise rows met, for the receipt
  const heldOf = new Map();   // place -> held object or null
  for (const [pl, o] of graded) {
    const { says, tags } = placeSays.get(pl);
    const held = {};
    let otherwiseHere = 0;
    for (const r of o.rows) {
      const why = heldWhy(r.grade, says);
      C.rows += 1; C.by_grade[r.grade].rows += 1;
      const s = (C.by_source[r.m] ||= { rows: 0, held_otherwise: 0, held_silent: 0, otherwise_kept_one_entry: 0, otherwise_kept_no_tag: 0 });
      s.rows += 1;
      if (r.grade === "otherwise") {
        otherwiseHere += 1;
        C.otherwise_by_step_tags[STEP_SAYS[says]] += 1;
        if (says === "one") s.otherwise_kept_one_entry += 1;
        if (says === "none") s.otherwise_kept_no_tag += 1;
        const k = `${says}\u0001${pl.key}\u0001${tags.map((t) => t.join("/") || "-").join(" + ")}`;
        const e = byKey.get(k) || { key: pl.key, step_tags: tags.map((t) => (t.length ? t.join("/") : null)), step_says: STEP_SAYS[says], otherwise_rows: 0, places: new Set(), first: `${o.book} ${o.ref}` };
        e.otherwise_rows += 1; e.places.add(`${o.book} ${o.ref}`); byKey.set(k, e);
      }
      if (!why) continue;
      held[r.row_id] = why;
      C.rows_held += 1; C.by_grade[r.grade].held += 1;
      if (why === "otherwise") s.held_otherwise += 1; else s.held_silent += 1;
    }
    if (otherwiseHere) C.otherwise_places_by_step_tags[STEP_SAYS[says]] += 1;
    const nHeld = Object.keys(held).length;
    if (nHeld) C.places_holding_a_row += 1;
    if (nHeld && nHeld === o.rows.length) C.places_holding_every_row += 1;
    heldOf.set(pl, nHeld ? held : null);
  }

  // ── the book files, written whole from the rule ─────────────────────────────
  const moved = [];   // { book, f, places_moved }
  for (const b of books.values()) {
    let placesMoved = 0;
    b.file.placesList = b.file.placesList.map((pl) => {
      const want = heldOf.get(pl);
      const { held: had, ...rest } = pl;
      if (JSON.stringify(had || null) !== JSON.stringify(want)) placesMoved += 1;
      return want ? { ...rest, held: want } : rest;
    });
    b.after = JSON.stringify(b.file);   // the bake's own byte shape: one line, no indent
    if (b.after !== b.before) moved.push({ book: b.file.book, f: b.f, places_moved: placesMoved });
  }

  // ── what is said of the run ─────────────────────────────────────────────────
  const priorIndex = spanIndex.span_grade || null;
  // a source's name, as the store's index gives it, else the span store's own (read only: the store is not written here)
  const storeSources = (() => { try { return JSON.parse(readFileSync(join(K3, "data", "route-store", "index.json"), "utf8")).m_sources || {}; } catch { return {}; } })();
  const labelOf = (m) => ((storeSources[m] || (spanIndex.m_sources || {})[m] || {}).label) || null;
  const priorReceipt = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
  const on = moved.length || !priorIndex ? momentOf(GIVEN_ON) : priorIndex.applied_on;
  const sources = Object.fromEntries(Object.entries(C.by_source).sort((a, b) => b[1].rows - a[1].rows || (a[0] < b[0] ? -1 : 1)));
  const listEntry = { file: `${pin.folder}/${pin.list.file}`, sha256: pin.list.sha256, lines: pin.list.lines };
  const WHAT = "a place of the span store names, under held, the rows it holds back under «only this pointing», each with why: «otherwise», a row the corpus lane grades pointed otherwise where STEP's own tags on the place's words (TAHOT's Strong's number on each word's core, its letter set aside) name no one entry over every word; «silent», a row with no pointed headword. A row graded same or same word stands, and so does one graded otherwise where STEP tags every word with one entry or a word carries no tag. Held is the place's own and never the key's: one key stands at many places. The reader leaves a held row out of the run's card at that place under «only» and counts it (pointed otherwise with the pointing's withheld, no pointing apart); under «keep» and «letters» it stands. A place that holds none carries no held; every other member of a place and every row is the lane's, byte for byte";
  const counts = { places: C.places, rows: C.rows, rows_held: C.rows_held, rows_held_otherwise: C.by_grade.otherwise.held, rows_held_silent: C.by_grade.silent.held, places_holding_a_row: C.places_holding_a_row, places_holding_every_row: C.places_holding_every_row };
  const indexRecord = {
    rule_id: SPAN_GRADE_RULE_ID, applied_on: on, applied_by: SPAN_GRADE_TOOL, pin: `${SPAN_GRADE_HOME}/PIN.json`, relay: pin.relay, list: listEntry,
    what: WHAT, counts, receipt: "data/span-grade-receipt-v1.json",
  };
  const receipt = {
    schema_version: "SPAN_GRADE_RECEIPT_V1",
    rule_id: SPAN_GRADE_RULE_ID,
    applied_on: on,
    applied_by: SPAN_GRADE_TOOL,
    what: WHAT,
    ruled: pin.ruled || null,
    pin: { file: `${SPAN_GRADE_HOME}/PIN.json`, sha256: sha256Of(readFileSync(PIN)) },
    inputs: {
      list: { ...listEntry, bytes: pin.list.bytes },
      rule: { file: `${pin.folder}/${pin.rule.file}`, bytes: pin.rule.bytes, sha256: pin.rule.sha256 },
      lanes_receipt: { file: `${pin.folder}/${pin.receipt.file}`, bytes: pin.receipt.bytes, sha256: pin.receipt.sha256 },
      span_store: {
        books: books.size,
        lane_books_sha256: laneSet,
        what: "the book files read with every place's held taken out, each in the bake's own byte shape, by the sha256 of the lines «<file> <sha256 of the file>» in name order (the lane's receipts' own way)",
        the_lane_read: readAs,
        the_store_was_that_version: storeWasThatVersion,
      },
      step_tags: {
        words: tagsRead.length,
        sha256: sha256Of(Buffer.from(tagsRead.map((x) => JSON.stringify(x)).join("\n"), "utf8")),
        what: "STEP's tags read on every word of every place, one JSON line [book, verse, word number, tags] each, in the list's order (the zones themselves move with every round; the tags read are what the rule reads)",
      },
    },
    counts: {
      ...counts,
      by_grade: C.by_grade,
      otherwise_rows_by_step_tags: C.otherwise_by_step_tags,
      otherwise_places_by_step_tags: C.otherwise_places_by_step_tags,
      axis: "rows (a row at a place) and places (where the span store joins words)",
    },
    by_source: Object.fromEntries(Object.entries(sources).map(([m, s]) => [m, { label: labelOf(m), ...s }])),
    otherwise_by_key: [...byKey.values()].sort((a, b) => (a.step_says < b.step_says ? -1 : a.step_says > b.step_says ? 1 : 0) || b.otherwise_rows - a.otherwise_rows || (a.key < b.key ? -1 : 1))
      .map((e) => ({ key: e.key, step_tags: e.step_tags, step_says: e.step_says, otherwise_rows: e.otherwise_rows, places: e.places.size, first: e.first })),
    // the book files that carry a held, as they stand after the run (not the run's own moves: a re-run moves none)
    books_carrying_held: [...books.values()].filter((b) => b.file.placesList.some((pl) => pl.held)).map((b) => b.f),
  };

  console.log(`span grade · relay ${pin.relay} · ${n(lines.length)} places graded, every one a served place · ${n(C.rows)} rows: ${GRADES.map((g) => `${g} ${n(C.by_grade[g].rows)}`).join(", ")}`);
  console.log(`  otherwise ${n(C.by_grade.otherwise.rows)}: STEP tags one entry ${n(C.otherwise_by_step_tags["one entry"])} (stand), a word with no tag ${n(C.otherwise_by_step_tags["a word with no tag"])} (stand), separate entries ${n(C.otherwise_by_step_tags["separate entries"])} (held back)`);
  console.log(`  silent ${n(C.by_grade.silent.rows)}: every one held back (no pointing)`);
  console.log(`  held back: ${n(C.rows_held)} rows at ${n(C.places_holding_a_row)} places (${n(C.places_holding_every_row)} hold every row of theirs)`);
  console.log(`  by source: ${Object.entries(sources).filter(([, s]) => s.held_otherwise || s.held_silent).map(([m, s]) => `${m} ${s.held_otherwise}+${s.held_silent}`).join(", ")} (otherwise+silent held)`);
  console.log(`  the store ${storeWasThatVersion ? "is the one the lane read (its book files, held set aside, are those bytes)" : `moved since the lane read it (${String(readAs).slice(0, 12)}, now ${laneSet.slice(0, 12)}); every place and row still holds to the list`}`);
  const indexMoves = JSON.stringify(priorIndex) !== JSON.stringify(indexRecord);
  const receiptMoves = !priorReceipt || JSON.stringify(priorReceipt) !== JSON.stringify(receipt);
  console.log(`  ${moved.length ? `${moved.length} book file(s) move (${n(moved.reduce((t, m) => t + m.places_moved, 0))} places): ${moved.map((m) => m.book).join(", ")}` : "no book file moves"}${indexMoves ? " · the index's record moves" : ""}${receiptMoves ? " · the receipt moves" : ""}`);
  console.log(JSON.stringify({ places: C.places, rows: C.rows, held: C.rows_held, held_otherwise: C.by_grade.otherwise.held, held_silent: C.by_grade.silent.held, books_moved: moved.length }));
  if (!moved.length && !indexMoves && !receiptMoves) { console.log("nothing to write"); process.exit(0); }
  if (DRY) { console.log("--dry: nothing written"); process.exit(0); }
  for (const b of books.values()) if (b.after !== b.before) writeFileSync(b.path, b.after);
  spanIndex.span_grade = indexRecord;
  writeFileSync(spanIndexPath, JSON.stringify(spanIndex, null, 1));
  writeFileSync(RECEIPT, `${JSON.stringify(receipt, null, 1)}\n`);
  console.log(`written: ${moved.length} book file(s), the index's span_grade, ${RECEIPT.replace(`${K3}/`, "")}`);
}
