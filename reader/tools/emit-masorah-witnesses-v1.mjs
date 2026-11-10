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
// consolidation of the held masorah register) and from its three counts of
// Leningrad, one on each rendering of tanach.us (each counter's own
// counts.json), held to its reconciliation of the three. Nothing here is a
// figure this lane typed; each row names the record it was read from, and
// the record's hash rides on the file.
//
// Classes (the corpus lane's certificate v2, kept): COUNTED_THIS_TEXT — a
// man who counted this printed edition; THE_MASORAH — a figure the masorah
// itself states, or a masoretic treatise; LATER_AUTHORITY — a later author's
// sum or citation; TALMUD_GEONIM — a figure the Talmud or a Gaon gives;
// HELD_EDITION — another edition this project holds, counted the same way.
//
// Run: node tools/emit-masorah-witnesses-v1.mjs --cards <book-cards-v2.json>
//        --reconcile <RECONCILE-v1.md> --counters <the folder holding wlc-nikkud/, wlc-taamim/ and wlc-letters/, each with its counts.json>
//        [--correction <RECONCILE-v1-correction-1.md>] [--out data/masorah-witnesses-v1.json] --stamp YYYY-MM-DD
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, join } from "node:path";

const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const CARDS = arg("cards") || die("MISSING_ARG", "--cards");
const RECON = arg("reconcile") || die("MISSING_ARG", "--reconcile");
const COUNTERS = arg("counters") || die("MISSING_ARG", "--counters");
const OUT = arg("out", "data/masorah-witnesses-v1.json");
const STAMP = arg("stamp") || die("MISSING_ARG", "--stamp");
const CORRECTION = arg("correction");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const cardsBytes = readFileSync(CARDS), reconBytes = readFileSync(RECON);
const cards = JSON.parse(cardsBytes.toString("utf8"));
if (cards.schema !== "mishkan.moses.book_count_cards.v2") die("CARDS_SCHEMA", cards.schema);
const recon = reconBytes.toString("utf8");
const CARDS_SRC = `${basename(CARDS)} (corpus lane, ${cards.generated})`;
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

// ---- the held edition: Leningrad, as the corpus lane counted it -------------
// THREE COUNTERS, ONE FIGURE (2026-11-10). The corpus lane counted Leningrad
// three times, once on each rendering of tanach.us that Sefaria serves (with
// the vowels, with the accents, the letters alone), and each counter's own
// counts.json states six numbers for every book. Four of them every rendering
// can carry, and the three agree on all four in every book: verses,
// words_split (the written branch, each maqaf piece a word), letters_written
// and letters_read. Those are read here, and a book the three count
// differently is refused. (Since the same day each states a seventh, the
// read branch counted apart; see THE READ BRANCH below.)
//
// This used to read the reconciliation's first table instead, which sets the
// letters-only rendering's JOINED counts beside the other two's. That
// rendering carries no maqaf (upstream put a space for each one), so its
// joined count is a split count, and the table's first figure was taken for
// the split axis. In one book the rendering keeps its maqafs (418, every one
// in Ecclesiastes), so there that figure is a joined count: the stamp set
// Leningrad's 2,573 joined words beside our 2,987 counted apart and showed a
// difference of 414 that is not real (the corpus lane, 2026-11-10). Counted
// apart, the held text has 2,987 words there, as all three counters say.
//
// THE READ BRANCH (the corpus lane's relay v167, 10 November 2026). Until
// that day no counter stated a split count of the read branch. This wrote
// the read row from the letters-only counter's joined count wherever that
// rendering carried no maqaf, and where it carried them (one book) the record
// held no figure and the stamp showed no row. The corpus lane then added the
// count to all three counters (words_read_split: the read branch, each maqaf
// piece a word; the six figures each counter shipped unchanged), and the
// three, which build the read branch three different ways, agree on it in
// every book and every total. So the read row is read as every other figure
// is: what the three agree on, or a refusal. Nothing is worked out here, and
// a set of counters that does not state the figure is refused by name.
const RENDERINGS = ["nikkud", "taamim", "letters"];
const counter = {};
for (const r of RENDERINGS) {
  const name = `wlc-${r}/counts.json`;
  let bytes; try { bytes = readFileSync(join(COUNTERS, `wlc-${r}`, "counts.json")); } catch (e) { die("COUNTER_MISSING", `${name}: ${String(e.message || e).slice(0, 80)}`); }
  const d = JSON.parse(bytes.toString("utf8"));
  if (d.rendering !== r) die("COUNTER_RENDERING", `${name} says it counted "${d.rendering}"`);
  if (!d.books || !d.totals) die("COUNTER_SHAPE", name);
  counter[r] = { d, name, sha: sha(bytes) };
}
const AGREED_SRC = `${RENDERINGS.map((r) => counter[r].name).join(" = ")} (corpus lane; the three renderings agree)`;
// the figure the three agree on, or a refusal naming who said what
const agreed = (kind, key, field) => {
  const v = RENDERINGS.map((r) => (counter[r].d[kind][key] || {})[field]);
  if (!v.every((x) => Number.isInteger(x))) die("LENINGRAD_FIGURE_MISSING", `${key} ${field}`);
  if (!v.every((x) => x === v[0])) die("LENINGRAD_RENDERINGS_DISAGREE", `${key} ${field}: ${RENDERINGS.map((r, i) => `${r} ${v[i]}`).join(", ")}`);
  return v[0];
};
const heldRow = (measure, axis, figure) => ({ measure, axis, figure, witness: LENINGRAD, class: "HELD_EDITION", source: AGREED_SRC });
// verses, the read branch and the written branch counted apart, and the
// written letters: the four rows a book's stamp sets beside ours
const fourRows = (kind, key) => [
  heldRow("verses", "verses", agreed(kind, key, "verses")),
  heldRow("words", "words", agreed(kind, key, "words_read_split")),
  heldRow("words", "words_written", agreed(kind, key, "words_split")),
  heldRow("letters", "letters", agreed(kind, key, "letters_written")),
];
const lenRows = (slug) => fourRows("books", slug);
// the sections, from the counters' own totals. The Torah and the whole carry
// the four rows; the Prophets and the Writings carry the verses, as this
// record has always carried them. (The whole had no read row while one book
// of it had none.)
const lenSections = {
  torah: fourRows("totals", "torah"),
  neviim: [heldRow("verses", "verses", agreed("totals", "neviim", "verses"))],
  ketuvim: [heldRow("verses", "verses", agreed("totals", "ketuvim", "verses"))],
  tanakh: fourRows("totals", "tanakh"),
};

// ---- the reconciliation, held to the counters ------------------------------
// The corpus lane's reconciliation is its own account of the three counts. It
// is no longer where a figure is read from, and it is still read: every
// number its two per-book tables state must be the number the counters state,
// so the two records cannot drift apart unseen. Section 1 gives the
// letters-only rendering's joined counts beside the other two's ("| book |
// written, letters / nikkud = taamim | Δ | read, letters / nikkud = taamim |
// Δ |"); section 4 gives verses and the written letters ("| book | verses |
// joined WLC → MAM | Δ | letters WLC → MAM | Δ |").
const reconSays = {};
for (const line of recon.split("\n")) {
  const m1 = /^\| ([a-z-]+) \| (\d+) \/ (\d+) \| [+−-]?\d+ \| (\d+) \/ (\d+) \| [+−-]?\d+ \|$/u.exec(line.trim());
  if (m1) { reconSays[m1[1]] = { ...(reconSays[m1[1]] || {}), written_letters: int(m1[2]), written_pointed: int(m1[3]), read_letters: int(m1[4]), read_pointed: int(m1[5]) }; continue; }
  const m2 = /^\| ([a-z-]+) \| (\d+) \| (\d+) → \d+(?: \(alpha \d+\))? \| [^|]+ \| (\d+) → \d+ \| [^|]+ \|$/u.exec(line.trim());
  if (m2) reconSays[m2[1]] = { ...(reconSays[m2[1]] || {}), verses: int(m2[2]), joined: int(m2[3]), letters: int(m2[4]) };
}
const heldToRecon = (slug) => {
  const R = reconSays[slug];
  if (!R || [R.verses, R.letters, R.joined, R.written_letters, R.written_pointed, R.read_letters, R.read_pointed].some((x) => !Number.isInteger(x))) die("RECONCILIATION_ROW_MISSING", slug);
  const L = counter.letters.d.books[slug], N = counter.nikkud.d.books[slug], T = counter.taamim.d.books[slug];
  const off = [
    ["verses", R.verses, agreed("books", slug, "verses")], ["letters", R.letters, agreed("books", slug, "letters_written")],
    ["written joined, letters-only", R.written_letters, L.words_written_joined], ["read joined, letters-only", R.read_letters, L.words_read_joined],
    ["written joined, with vowels", R.written_pointed, N.words_written_joined], ["read joined, with vowels", R.read_pointed, N.words_read_joined],
    ["written joined, with accents", R.written_pointed, T.words_written_joined], ["read joined, with accents", R.read_pointed, T.words_read_joined],
    ["written joined, section 4", R.joined, N.words_written_joined],
  ].filter(([, a, b]) => a !== b);
  if (off.length) die("RECONCILIATION_DISAGREES", `${slug}: ${off.map(([what, a, b]) => `${what} ${a} vs the counter's ${b}`).join("; ")}`);
};

const CLASS_ORDER = ["COUNTED_THIS_TEXT", "THE_MASORAH", "LATER_AUTHORITY", "TALMUD_GEONIM", "HELD_EDITION"];
const MEASURE_ORDER = ["verses", "words", "letters"];
const sortRows = (rows) => rows.sort((a, b) => MEASURE_ORDER.indexOf(a.measure) - MEASURE_ORDER.indexOf(b.measure) || CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class) || a.axis.localeCompare(b.axis));

const books = {};
for (const b of cards.books) { heldToRecon(b.book); books[b.book] = { section: b.section, rows: sortRows([...rowsOfGroups(b.groups), ...lenRows(b.book)]) }; }
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
    ...RENDERINGS.map((r) => ({ record: counter[r].name, sha256: counter[r].sha, what: `the corpus lane's count of Leningrad on the ${r === "letters" ? "letters-only" : r === "nikkud" ? "vowelled" : "accented"} rendering of tanach.us: seven numbers per book (the six it shipped, and the read branch counted apart, added on 10 November 2026), the figures the held edition's rows are read from` })),
    { record: basename(RECON), sha256: sha(reconBytes), what: "the corpus lane's Leningrad reconciliation of the three counts: every figure its per-book tables state is held to the counters' own, and a disagreement refuses the record" },
    ...(CORRECTION ? [{ record: basename(CORRECTION), sha256: sha(readFileSync(CORRECTION)), what: "the corpus lane's correction to that reconciliation: the sentence that the letters-only rendering's joined count is a split count in every book is true of 38 and not of one; the tables stand" }] : []),
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
