#!/usr/bin/env node
// Synthesis lane · the witnesses a count is stamped beside
//
// RULE: count-stamp-rule-v1-the-count-is-stamped-beside-the-witnesses-that-published-one
// LEDGER: Y
// what has been counted and by whom: the record it writes holds each witness's
// own published figure, per book and per section, with the axis it counted on.
//
// The owner's ruling (2026-09-05): the count is our stamp of proof, not a
// gate. Every book page carries its own count on every axis, and beside it
// the figures other men reached for the same book — the masorah at the end
// of the book, the later authorities who summed it, and the Leningrad Codex
// counted the same way — each with its difference from ours shown, sign and
// all. Nothing is adjusted and nothing is withheld for differing; a
// difference is shown as a difference.
//
// This record holds THEIR figures, each with its axis and its witness, so
// the builder can stamp a zone without reading anything but the zone and
// this file. The figures come from the corpus lane's book cards (its
// consolidation of the held masorah register) and its Leningrad
// reconciliation (three renderings of tanach.us, counted and agreed on
// every axis carried here). Nothing here is a figure this lane typed; each
// row names the record it was read from, and the record's hash rides on
// the file.
//
// Classes (the corpus lane's certificate v2, kept): COUNTED_THIS_TEXT — a
// man who counted this printed edition; THE_MASORAH — a figure the masorah
// itself states, or a masoretic treatise; LATER_AUTHORITY — a later author's
// sum or citation; TALMUD_GEONIM — a figure the Talmud or a Gaon gives;
// HELD_EDITION — another edition this project holds, counted the same way.
//
// Run: node tools/emit-masorah-witnesses-v1.mjs --cards <book-cards-v2.json>
//        --reconcile <RECONCILE-v1.md> [--out data/masorah-witnesses-v1.json] --stamp YYYY-MM-DD
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename } from "node:path";

const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const CARDS = arg("cards") || die("MISSING_ARG", "--cards");
const RECON = arg("reconcile") || die("MISSING_ARG", "--reconcile");
const OUT = arg("out", "data/masorah-witnesses-v1.json");
const STAMP = arg("stamp") || die("MISSING_ARG", "--stamp");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const cardsBytes = readFileSync(CARDS), reconBytes = readFileSync(RECON);
const cards = JSON.parse(cardsBytes.toString("utf8"));
if (cards.schema !== "mishkan.moses.book_count_cards.v2") die("CARDS_SCHEMA", cards.schema);
const recon = reconBytes.toString("utf8");
const CARDS_SRC = `${basename(CARDS)} (corpus lane, ${cards.generated})`;
const RECON_SRC = `${basename(RECON)} (corpus lane)`;
const LENINGRAD = "Leningrad Codex (tanach.us via Sefaria), counted the same way by the corpus lane";

const classOf = (witness) => {
  const w = String(witness);
  if (/talmud|gaon|kiddushin/iu.test(w)) return "TALMUD_GEONIM";
  if (/masorah|dikdukei|ben asher/iu.test(w)) return "THE_MASORAH";
  return "LATER_AUTHORITY";
};
const int = (s) => { const n = Number(String(s).replace(/[,\s]/gu, "")); if (!Number.isInteger(n)) die("NOT_AN_INTEGER", String(s)); return n; };
const AXIS_OF_MEASURE = { verses: "verses", words: "words", letters: "letters" };

// ---- the cards: per book and per section --------------------------------
const rowsOfGroups = (groups) => {
  const rows = [];
  for (const g of groups) {
    const axis = AXIS_OF_MEASURE[g.measure];
    if (!axis) die("CARD_MEASURE", g.measure);
    for (const w of (g.counted_this_text || [])) rows.push({ measure: g.measure, axis, figure: int(w.figure), witness: w.witness, class: "COUNTED_THIS_TEXT", ...(w.layer && w.layer !== g.measure ? { layer: w.layer } : {}), source: CARDS_SRC });
    for (const w of (g.other_scrolls || [])) rows.push({ measure: g.measure, axis, figure: int(w.figure), witness: w.witness, class: classOf(w.witness), ...(w.layer && w.layer !== g.measure ? { layer: w.layer } : {}), source: CARDS_SRC });
    if (g.note && rows.length) rows[rows.length - 1].group_note = g.note;
  }
  return rows;
};

// ---- the reconciliation: Leningrad per book --------------------------------
// Two tables. Section 1 gives, per book, the three-rendering agreement on the
// split axes ("| book | written-split / written-joined | Δ | read-split /
// read-joined | Δ |"); section 4 gives, per book, verses and the written
// letters ("| book | verses | joined WLC → MAM | Δ | letters WLC → MAM | Δ |").
const len = {};
for (const line of recon.split("\n")) {
  const m1 = /^\| ([a-z-]+) \| (\d+) \/ (\d+) \| [+−-]?\d+ \| (\d+) \/ (\d+) \| [+−-]?\d+ \|$/u.exec(line.trim());
  if (m1) { len[m1[1]] = { ...(len[m1[1]] || {}), words_written: int(m1[2]), words: int(m1[4]) }; continue; }
  const m2 = /^\| ([a-z-]+) \| (\d+) \| (\d+) → \d+(?: \(alpha \d+\))? \| [^|]+ \| (\d+) → \d+ \| [^|]+ \|$/u.exec(line.trim());
  if (m2) len[m2[1]] = { ...(len[m2[1]] || {}), verses: int(m2[2]), letters: int(m2[4]) };
}
const lenRows = (slug) => {
  const L = len[slug];
  if (!L || [L.verses, L.words, L.words_written, L.letters].some((x) => !Number.isInteger(x))) die("LENINGRAD_ROW_MISSING", slug);
  return [
    { measure: "verses", axis: "verses", figure: L.verses, witness: LENINGRAD, class: "HELD_EDITION", source: RECON_SRC },
    { measure: "words", axis: "words", figure: L.words, witness: LENINGRAD, class: "HELD_EDITION", source: RECON_SRC },
    { measure: "words", axis: "words_written", figure: L.words_written, witness: LENINGRAD, class: "HELD_EDITION", source: RECON_SRC },
    { measure: "letters", axis: "letters", figure: L.letters, witness: LENINGRAD, class: "HELD_EDITION", source: RECON_SRC },
  ];
};
// the section totals the reconciliation states in its headline paragraph
const headline = (re) => { const m = re.exec(recon); if (!m) die("LENINGRAD_HEADLINE", re.source); return int(m[1]); };
const lenSections = {
  torah: [
    { measure: "verses", axis: "verses", figure: headline(/Torah ([\d,]+) verses;/u) },
    { measure: "words", axis: "words", figure: headline(/MAM read-split is exactly [\d,]+ \(Leningrad ([\d,]+)\)/u) },
    { measure: "words", axis: "words_written", figure: headline(/\/ ([\d,]+) split; letters/u) },
    { measure: "letters", axis: "letters", figure: headline(/letters ([\d,]+) written \/\n?[\d,]+ read\. Neviim/u) },
  ],
  neviim: [{ measure: "verses", axis: "verses", figure: headline(/Neviim ([\d,]+) verses, Ketuvim/u) }],
  ketuvim: [{ measure: "verses", axis: "verses", figure: headline(/Neviim [\d,]+ verses, Ketuvim ([\d,]+),/u) }],
  tanakh: [
    { measure: "verses", axis: "verses", figure: headline(/\*\*Tanakh ([\d,]+) verses\*\*/u) },
    { measure: "words", axis: "words_written", figure: headline(/Tanakh words [\d,]+ \/ [\d,]+ \/ ([\d,]+);/u) },
    { measure: "letters", axis: "letters", figure: headline(/Tanakh letters ([\d,]+) \//u) },
  ],
};
for (const rows of Object.values(lenSections)) for (const r of rows) Object.assign(r, { witness: LENINGRAD, class: "HELD_EDITION", source: RECON_SRC });

const CLASS_ORDER = ["COUNTED_THIS_TEXT", "THE_MASORAH", "LATER_AUTHORITY", "TALMUD_GEONIM", "HELD_EDITION"];
const MEASURE_ORDER = ["verses", "words", "letters"];
const sortRows = (rows) => rows.sort((a, b) => MEASURE_ORDER.indexOf(a.measure) - MEASURE_ORDER.indexOf(b.measure) || CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class) || a.axis.localeCompare(b.axis));

const books = {};
for (const b of cards.books) books[b.book] = { section: b.section, rows: sortRows([...rowsOfGroups(b.groups), ...lenRows(b.book)]) };
const sections = {};
for (const s of cards.sections) sections[s.scope] = { books: cards.books.filter((b) => s.scope === "tanakh" || b.section === s.scope).map((b) => b.book), rows: sortRows([...rowsOfGroups(s.groups), ...(lenSections[s.scope] || [])]) };

const record = {
  schema_version: "MASORAH_WITNESSES_V1",
  rule_id: "count-stamp-rule-v1-the-count-is-stamped-beside-the-witnesses-that-published-one",
  emitted_by: "tools/emit-masorah-witnesses-v1.mjs",
  recorded_on: STAMP,
  what: "the figures other men reached for each book and each section of the Tanakh, on the axis each counted, so a built zone can be stamped beside them; ours is never in this file — the builder measures the zone and writes the difference",
  derived_from: [
    { record: basename(CARDS), sha256: sha(cardsBytes), what: "the corpus lane's book count cards v2: its consolidation of the held masorah register, per book and per section" },
    { record: basename(RECON), sha256: sha(reconBytes), what: "the corpus lane's Leningrad reconciliation: three renderings of tanach.us counted and agreed, per book" },
  ],
  classes: {
    COUNTED_THIS_TEXT: "a man who counted this printed edition; binding on the axis he counted",
    THE_MASORAH: "a figure the masorah itself states, or a masoretic treatise (Dikdukei haTe'amim)",
    LATER_AUTHORITY: "a later author's sum or citation",
    TALMUD_GEONIM: "a figure the Talmud or a Gaon gives; shown, not binding",
    HELD_EDITION: "another edition this project holds, counted the same way on the same axes",
  },
  axes: {
    verses: "verses as the edition divides them",
    words: "the read branch, each maqaf piece a word",
    words_written: "the written branch, each maqaf piece a word",
    letters: "letters of the written branch",
    letters_read: "letters of the read branch",
  },
  books, sections,
};
const text = JSON.stringify(record, null, 2) + "\n";
if (/\b[A-Za-z]:[\\/](?![\\/])|\/(?:home|root|tmp|mnt|Users)\/|Users[\\/]/u.test(text)) die("PATH_IN_RECORD", "a local path reached the record; refusing to write it");
writeFileSync(OUT, text);
const nRows = Object.values(books).reduce((n, b) => n + b.rows.length, 0);
console.log(`${OUT}: ${Object.keys(books).length} books, ${nRows} witness rows · ${Object.keys(sections).length} sections, ${Object.values(sections).reduce((n, s) => n + s.rows.length, 0)} rows`);
