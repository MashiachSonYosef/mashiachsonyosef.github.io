#!/usr/bin/env node
// Synthesis lane · serve one book of the Tanakh from the corpus lane's
// restore v5 of the Miqra according to the Masorah edition
//
// RULE: serve-from-restore-rule-v1-the-restore-is-the-text-the-split-is-this-lanes-the-rights-are-the-records
// LEDGER: C0
// the ink at its position: every row this writes is one position of the text —
// a word, a piece of a word the joiner holds, or a scribal mark standing alone.
//
// 2026-09-06. The corpus lane restored the edition's apparatus from the
// Sefaria BSON dump — every ketiv-qere site as (ketiv) [qere], every
// scribal mark as its own row (sof pasuq, paseq, section marks, inverted
// nun, brick gaps), the letters the scribes wrote large, small, suspended or
// dotted recorded on their words — and published a receipt per book with a
// hash over the row surfaces and a reversibility verdict. Thirty-nine files,
// twenty-four books, 292,199 rows, 39/39 PASS under the frame's C0 refusal
// lines on the corpus lane's side.
//
// This tool turns one restore into the serve shape every builder reads, so
// the twenty-four books go through the SAME builder, the SAME reader and the
// SAME checks as every other work — the owner's one rule: a single pipeline.
// What it decides, and nothing else:
//
//   1. the restore's rows are whitespace tokens; the frame's C0 is the word
//      (RULE 2, owner: a maqaf compound is one C0 per word). So a row that
//      carries a maqaf is cut at its maqafs here, the joiner riding on the
//      piece before it, exactly as the corpus lane's reseal cut the other
//      3,042 works. A ketiv-qere site is cut around, never through: the site
//      is one C0 whole (RULE 1), and a word the source joined to it by maqaf
//      is its own C0 beside it.
//   2. a row the restore marks OFF is one INKOFF C0, keyless (rules 4, 5, 6,
//      10, 11); the builder types it from its surface and this tool holds
//      that type to the restore's own flag.
//   3. the letter marks ride to the piece that carries the letter (rule 12).
//   4. identity is positional: the corpus lane's registry assigns the sealed
//      ids after the twenty-four pass, so every id here is the position of
//      the C0 within its book under this restore, and the bridge says so.
//   5. rights come from data/mam-restore-v5-rights-v1.json, a record, and a
//      book absent from it does not serve.
//
// Everything is checked as it is done: the restore's surface hash is
// reproduced from the bytes before a row is read; every row's pieces rejoin
// byte-equal to the row; every declared site is read back from its surface
// by the builder's own reader; and the book's counts on every axis are held
// to the corpus lane's book cards. A disagreement refuses, by name.
//
// Run: node tools/serve-from-restore-v5.mjs --work tanakh/genesis --restore <csv.gz> --receipt <json>
//        [--cards <book-cards-v2.json>] [--rights data/mam-restore-v5-rights-v1.json]
//        --out <ndjson> --bridge-out <csv.gz>
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { markOf, kqSiteOf, MAQAF } from "./zone-lib-v1.mjs";
import { measureWord, MEASURE_RULE_ID, piecesOf as piecesOfText, lettersOf as lettersOfText } from "./bookword-measure-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const WORK = arg("work") || die("MISSING_ARG", "--work");
const RESTORE = arg("restore") || die("MISSING_ARG", "--restore");
const RECEIPT = arg("receipt") || die("MISSING_ARG", "--receipt");
const CARDS = arg("cards", null);
const RIGHTS = arg("rights", `${HERE}/../data/mam-restore-v5-rights-v1.json`);
const OUT = arg("out") || die("MISSING_ARG", "--out");
const BRIDGE_OUT = arg("bridge-out") || die("MISSING_ARG", "--bridge-out");
const RULE = "serve-from-restore-rule-v1-the-restore-is-the-text-the-split-is-this-lanes-the-rights-are-the-records";
const ROUTE = "MAM_RESTORE_V5_SERVE__POSITIONAL_PROTOTYPE";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const nfc = (s) => String(s ?? "").normalize("NFC");
const slug = WORK.split("/").pop();

// ---- 1 · the receipt, and the bytes held to it ------------------------------
const receipt = JSON.parse(readFileSync(RECEIPT, "utf8"));
if (!String(receipt.status || "").startsWith("PASS_MOSES_MAM_APPARATUS_RESTORED_V5")) die("RESTORE_NOT_PASS", `${basename(RECEIPT)}: ${receipt.status}`);
if (receipt.work_id !== WORK) die("RESTORE_WORK_MISMATCH", `${receipt.work_id} vs ${WORK}`);
if (!String((receipt.reversibility_gate || {}).verdict || "").startsWith("PASS")) die("RESTORE_NOT_REVERSIBLE", (receipt.reversibility_gate || {}).verdict);
const gz = readFileSync(RESTORE);
const csvText = gunzipSync(gz).toString("utf8");
const csvSplit = (line) => { const o = []; let cur = "", q = false; for (let i = 0; i < line.length; i += 1) { const c = line[i]; if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i += 1; } else q = false; } else cur += c; } else if (c === '"') q = true; else if (c === ",") { o.push(cur); cur = ""; } else cur += c; } o.push(cur); return o; };
const lines = csvText.split("\n").filter((l) => l.length);
const header = csvSplit(lines[0]);
for (const need of ["surface", "key", "ref", "kq", "ketiv", "qere", "source_order", "c0_off", "spi", "inverted_nun", "kq_trivial", "implicit_maqaf", "scribal", "scribal_detail", "paseq", "shirah", "gap", "sof_pasuq"])
  if (!header.includes(need)) die("RESTORE_MISSING_COLUMN", need);
const rows = lines.slice(1).map((l) => Object.fromEntries(csvSplit(l).map((v, i) => [header[i], v])));
const surfaceSha = sha(rows.map((r) => r.surface).join("\n") + "\n");
if (surfaceSha !== receipt.surface_sha256) die("RESTORE_HASH_MISMATCH", `${basename(RESTORE)}: bytes ${surfaceSha.slice(0, 12)}…, receipt ${String(receipt.surface_sha256).slice(0, 12)}…`);
if (rows.length !== Number(receipt.counts.positions)) die("RESTORE_ROWS_VS_RECEIPT", `${rows.length} rows, receipt says ${receipt.counts.positions}`);

// ---- 2 · rights, before a row of text is served -----------------------------
if (!existsSync(RIGHTS)) die("RIGHTS_RECORD_MISSING", RIGHTS);
const rightsBytes = readFileSync(RIGHTS);
const rightsRec = JSON.parse(rightsBytes.toString("utf8"));
const rw = (rightsRec.works || {})[WORK];
if (!rw) die("RIGHTS_NOT_IN_CUSTODY", `${basename(RIGHTS)} carries no row for ${WORK}; fail-closed, nothing serves`);
const lic = rightsRec.licence || {};
if (lic.terminal_resolution_state !== "RESOLVED") die("RIGHTS_HOLD_UNRESOLVED", lic.terminal_resolution_state);
const needsCredit = lic.reader_display_axis !== "ALLOW";
if (needsCredit && !(rw.credit && String(rw.credit.line || "").trim())) die("RIGHTS_ATTRIBUTION_NOT_IN_CUSTODY", `${WORK}: reader display is ${lic.reader_display_axis} and no credit line is in hand`);
if (rw.restore_surface_sha256 && rw.restore_surface_sha256 !== surfaceSha) die("RIGHTS_RECORD_NAMES_ANOTHER_RESTORE", `${WORK}: the rights record was written for surface ${String(rw.restore_surface_sha256).slice(0, 12)}…, this restore is ${surfaceSha.slice(0, 12)}…`);
const rights = {
  reader_display_axis: lic.reader_display_axis, public_distribution_axis: lic.public_distribution_axis,
  attribution_required: lic.attribution_required, noncommercial_required: lic.noncommercial_required,
  share_alike_required: lic.share_alike_required, no_derivatives_required: lic.no_derivatives_required,
  normalized_license_class: lic.normalized_license_class, license_version: lic.license_version, terminal_resolution_state: lic.terminal_resolution_state,
};
const visible = rights.reader_display_axis === "ALLOW" || (rights.reader_display_axis === "ALLOW_WITH_ATTRIBUTION" && !!(rw.credit && rw.credit.line));

// ---- 3 · the rows become C0s ----------------------------------------------
const LETTER = /[\u05d0-\u05ea]/u;
const KIND_OF = { OTIYOT_GEDOLOT: "LARGE", OTIYOT_KETANOT: "SMALL", OTIYOT_TELUYOT: "SUSPENDED", OTIYOT_MENUKADOT: "DOTTED" };
const MARK_OF_FLAG = (r) => r.sof_pasuq === "1" ? "SOF_PASUQ" : r.paseq === "1" ? "PASEQ" : r.spi === "samekh" ? "SETUMAH" : r.spi === "pe" ? "PETUCHAH"
  : r.gap === "1" ? "BRICK_GAP" : (r.inverted_nun === "1" || r.spi === "invnun") ? "INVERTED_NUN" : null;
const KQ_GROUP = /\(([^()]*)\)|\[([^\[\]]*)\]/gu;
// the letter marks of a row, as (kind, 1-based letter index over the row)
const letterMarksOf = (r) => {
  if (!r.scribal_detail) return [];
  const out = [];
  for (const part of r.scribal_detail.split("|")) {
    const m = /^([A-Z_]+)@([\d.]+)$/u.exec(part.trim());
    if (!m || !KIND_OF[m[1]]) die("LETTER_MARK_UNREAD", `${r.ref}: ${part}`);
    for (const n of m[2].split(".")) out.push({ kind: KIND_OF[m[1]], at: Number(n) });
  }
  return out;
};
// letter marks placed on the pieces a row was cut into: each piece owns the
// letters it prints, so an index over the row becomes an index over a piece
const placeLetterMarks = (pieces, marks) => {
  if (!marks.length) return;
  const spans = []; let seen = 0;
  for (const p of pieces) { const n = [...nfc(p.surface)].filter((c) => LETTER.test(c)).length; spans.push({ from: seen + 1, to: seen + n, p }); seen += n; }
  for (const mk of marks) {
    const sp = spans.find((x) => mk.at >= x.from && mk.at <= x.to);
    if (!sp) die("LETTER_MARK_OFF_THE_ROW", `letter ${mk.at} of a row with ${seen} letters`);
    const local = mk.at - sp.from + 1;
    const list = (sp.p.letter_marks = sp.p.letter_marks || []);
    const same = list.find((x) => x.kind === mk.kind);
    if (same) same.letters.push(local); else list.push({ kind: mk.kind, letters: [local] });
  }
};
// cut a run of maqaf-joined words into pieces, the joiner riding on the piece
// before it; an empty piece means a joiner at an edge or doubled, which the
// frame refuses (R2: a compound torn)
const cutAtMaqaf = (text, where) => {
  const parts = text.split(MAQAF);
  if (parts.some((p) => !p)) die("MAQAF_AT_EDGE", `${where}: ${JSON.stringify(text)}`);
  return parts.map((p, i) => ({ surface: i < parts.length - 1 ? p + MAQAF : p }));
};

const units = new Map();   // unit id -> C0 records, in order
const unitOrder = [];
let lastRef = null;
const stats = { rows: rows.length, on_rows: 0, off_rows: 0, kq_rows: 0, maqaf_rows: 0, pieces_from_maqaf: 0, inkoff_keys_dropped: 0, letter_marks: 0, implicit_maqaf: 0, shirah_rows: 0, marks: {} };
rows.forEach((r, i) => {
  const m = /^(\d+):(\d+)$/u.exec(r.ref);
  if (!m) die("REF_UNREAD", `row ${i + 1}: ${r.ref}`);
  const unit = `${slug}-${Number(m[1])}-${Number(m[2])}`;
  if (unit !== lastRef) {
    if (units.has(unit)) die("UNIT_NOT_CONTIGUOUS", `${unit} reappears at row ${i + 1}`);
    units.set(unit, []); unitOrder.push(unit); lastRef = unit;
  }
  const out = units.get(unit);
  const pieces = [];
  if (r.c0_off === "1") {
    stats.off_rows += 1;
    const typed = markOf(r.surface);
    const flagged = MARK_OF_FLAG(r);
    if (!typed) die("MARK_NOT_TYPED", `row ${i + 1} (${r.ref}): the restore marks ${JSON.stringify(r.surface)} OFF and the builder types no mark for it`);
    if (flagged && typed.kind !== flagged) die("MARK_FLAG_DISAGREES", `row ${i + 1} (${r.ref}): restore says ${flagged}, the surface types as ${typed.kind}`);
    if (!flagged && typed.kind !== "EMPTY_VERSE") die("MARK_UNFLAGGED", `row ${i + 1} (${r.ref}): ${typed.kind} carries no restore flag`);
    if (r.key) stats.inkoff_keys_dropped += 1;   // the restore keyed a section mark by its letter; a mark is keyless (C0 REFUSES: an INKOFF mark carrying a key)
    stats.marks[typed.kind] = (stats.marks[typed.kind] || 0) + 1;
    pieces.push({ surface: r.surface, off: true });
  } else if (r.kq === "1") {
    stats.kq_rows += 1;
    // sliced raw: the bytes the source wrote, never a canonical reordering
    const s = r.surface;
    const groups = [...s.matchAll(KQ_GROUP)];
    if (!groups.length) die("KQ_ROW_WITHOUT_GROUPS", `row ${i + 1} (${r.ref}): ${s}`);
    const first = groups[0].index, last = groups[groups.length - 1].index + groups[groups.length - 1][0].length;
    let pre = s.slice(0, first), site = s.slice(first, last), post = s.slice(last);
    // a joiner right after the site belongs to the site (it joins the site to
    // the next word); the pieces before and after are their own C0s
    if (post.startsWith(MAQAF)) { site += MAQAF; post = post.slice(1); }
    if (pre) { if (!pre.endsWith(MAQAF)) die("KQ_SITE_GLUED_BEFORE", `row ${i + 1} (${r.ref}): ${s}`); pieces.push(...cutAtMaqaf(pre.slice(0, -1), `row ${i + 1}`).map((p, j, a) => ({ surface: p.surface + (j === a.length - 1 ? MAQAF : "") }))); }
    const declared = { ketiv: r.ketiv || null, qere: r.qere || null, order: r.source_order || null, trivial: r.kq_trivial === "1" };
    const read = kqSiteOf(site, declared);
    if (!read) die("KQ_SITE_NOT_READ", `row ${i + 1} (${r.ref}): ${site}`);
    // the restore's columns name each branch bare; a joiner at the branch's
    // edge belongs to the site (it joins the site to the next word), so the
    // edges are stripped before the two are held to each other
    const bare = (t) => nfc(t ?? "").replace(/^\u05be+|\u05be+$/gu, "");
    if (bare(declared.ketiv) !== bare(read.ketiv) || bare(declared.qere) !== bare(read.qere)) die("KQ_SITE_DISAGREES", `row ${i + 1} (${r.ref}): restore says ketiv ${JSON.stringify(r.ketiv)} qere ${JSON.stringify(r.qere)}, the surface reads ${JSON.stringify(read.ketiv)} / ${JSON.stringify(read.qere)}`);
    if (post && !read.joins_next) die("KQ_SITE_GLUED_AFTER", `row ${i + 1} (${r.ref}): ${s}`);
    pieces.push({ surface: site, kq: declared });
    if (post) pieces.push(...cutAtMaqaf(post, `row ${i + 1}`));
  } else {
    stats.on_rows += 1;
    if (r.surface.includes(MAQAF)) { stats.maqaf_rows += 1; const cut = cutAtMaqaf(r.surface, `row ${i + 1} (${r.ref})`); stats.pieces_from_maqaf += cut.length; pieces.push(...cut); }
    else pieces.push({ surface: r.surface });
    // the source marks some words it prints in one form as a ketiv-qere of
    // spelling (the restore's kq_trivial on a row with no site); the flag
    // rides to the row's pieces so the card can say the source marks it
    if (r.kq_trivial === "1") { stats.kq_trivial_rows = (stats.kq_trivial_rows || 0) + 1; for (const p of pieces) p.kq_trivial = true; }
  }
  // every row's pieces rejoin to the row, byte for byte, before anything else
  const rejoined = pieces.map((p) => p.surface).join("");
  if (rejoined !== r.surface) die("REJOIN_NOT_BYTE_EQUAL", `row ${i + 1} (${r.ref}): ${JSON.stringify(r.surface)} vs ${JSON.stringify(rejoined)}`);
  const marks = letterMarksOf(r);
  if (marks.length) { placeLetterMarks(pieces.filter((p) => !p.off), marks); stats.letter_marks += marks.length; }
  if (r.implicit_maqaf === "1") { stats.implicit_maqaf += 1; for (const p of pieces) if (p.surface.endsWith(MAQAF)) p.maqaf_implicit = true; }
  if (r.shirah === "1") { stats.shirah_rows += 1; for (const p of pieces) p.shirah = true; }
  for (const p of pieces) { p.restore_row = i + 1; out.push(p); }
});

// ---- 4 · the count, on every axis, held to the corpus lane's cards ----------
const count = { verses: unitOrder.length, words: 0, words_written: 0, letters: 0, letters_read: 0, c0_on: 0, c0_off: 0, kq_sites: 0 };
for (const unit of unitOrder) for (const p of units.get(unit)) {
  const w = p.off ? { s: p.surface, mark: markOf(p.surface) } : p.kq ? { s: p.surface, kq: true } : { s: p.surface };
  const m = measureWord(w);
  if (m.off) { count.c0_off += 1; continue; }
  count.c0_on += 1; if (m.kq) count.kq_sites += 1;
  count.words += m.words; count.words_written += m.words_written; count.letters += m.letters; count.letters_read += m.letters_read;
}
// THE READ AXIS AND A KETIV THE TRADITION DOES NOT READ. This lane's
// measure (bookword-measure-rule-v1) counts on the read branch the words of
// the qere, and for a site with a ketiv and no qere — written, not read —
// counts none. The corpus lane's counters read a ROW that has nothing to
// read on its written form: a ketiv-only site standing alone as a row is
// counted on the read axis there, a ketiv-only site inside a compound is
// not. Four books carry such rows (Ezekiel, II Samuel, Jeremiah, Ruth), and
// on those the corpus lane's figures stand above this measure by exactly
// those rows' words and letters. The written axes and the verses are held
// exactly; the read axes are held exactly OR to that convention, and which
// one is written on the receipt — a difference named, never absorbed.
const piecesByRow = new Map();
for (const unit of unitOrder) for (const p of units.get(unit)) { if (!piecesByRow.has(p.restore_row)) piecesByRow.set(p.restore_row, []); piecesByRow.get(p.restore_row).push(p); }
const unread = { words: 0, letters: 0, rows: 0 };
for (const unit of unitOrder) for (const p of units.get(unit)) if (p.kq && p.kq.ketiv && !p.kq.qere && piecesByRow.get(p.restore_row).length === 1) { unread.rows += 1; unread.words += piecesOfText(p.kq.ketiv).length; unread.letters += lettersOfText(p.kq.ketiv); }
const readAxisConvention = { cards: "a row with nothing to read is read on its written form: a ketiv-only site standing alone as a row is counted on the read axis", ours: "a ketiv the tradition does not read counts none on the read axis (bookword-measure-rule-v1)", unread_ketiv_rows: unread };
let cardsHeld = null;
if (CARDS) {
  const cards = JSON.parse(readFileSync(CARDS, "utf8"));
  const card = (cards.books || []).find((b) => b.book === slug);
  if (!card) die("NO_CARD_FOR_BOOK", slug);
  const off = [], convention = [];
  for (const k of ["verses", "words_written", "letters", "c0_off"]) if (Number(card.ours[k]) !== count[k]) off.push(`${k} ${count[k]} vs card ${card.ours[k]}`);
  for (const [k, extra] of [["words", unread.words], ["letters_read", unread.letters]]) {
    if (Number(card.ours[k]) === count[k]) continue;
    if (extra && Number(card.ours[k]) === count[k] + extra) { convention.push(`${k}: card ${card.ours[k]} = ours ${count[k]} + ${extra} for the unread ketiv`); continue; }
    off.push(`${k} ${count[k]} vs card ${card.ours[k]}`);
  }
  if (off.length) die("COUNT_DISAGREES_WITH_CARDS", `${slug}: ${off.join(", ")}`);
  cardsHeld = { record: basename(CARDS), sha256: sha(readFileSync(CARDS)), agreed_on: ["verses", "words_written", "letters", "c0_off", ...(convention.length ? [] : ["words", "letters_read"])], card_c0_on_before_split: Number(card.ours.c0_on),
    ...(convention.length ? { read_axis_convention: { ...readAxisConvention, difference: convention } } : {}) };
}
if (count.c0_off !== Number(receipt.counts.off_positions)) die("OFF_COUNT_VS_RECEIPT", `${count.c0_off} vs ${receipt.counts.off_positions}`);
const receiptPieces = Number(receipt.counts.pieces_after_maqaf_split);
const receiptHeld = count.words === receiptPieces ? "exact" : (unread.words && count.words + unread.words === receiptPieces) ? "to the corpus lane's read-axis convention" : null;
if (!receiptHeld) die("WORDS_VS_RECEIPT", `read words ${count.words} vs receipt pieces_after_maqaf_split ${receiptPieces}${unread.words ? ` (${unread.words} unread ketiv words standing alone would not close the gap)` : ""}`);

// ---- 5 · identity: positional, and said so -----------------------------------
let at = 0;
const bridgeLines = ["work_id,unit_id,c0_rows,min_c0_numeric_id,max_c0_numeric_id,b_id,n_id"];
for (const unit of unitOrder) { const n = units.get(unit).length; bridgeLines.push(`${WORK},${unit},${n},${at + 1},${at + n},B-MAM-RESTORE-V5,N-POSITIONAL-PROTOTYPE`); at += n; }
const total = at;
const bridgeCsv = bridgeLines.join("\n") + "\n";
if (bridgeCsv.includes('"')) die("BRIDGE_QUOTED", WORK);
mkdirSync(dirname(BRIDGE_OUT), { recursive: true });
const bridgeGz = gzipSync(Buffer.from(bridgeCsv, "utf8"));
writeFileSync(BRIDGE_OUT, bridgeGz);

// ---- 6 · the serve --------------------------------------------------------
const provenance = {
  rule: RULE,
  route: ROUTE,
  restore_oracle: {
    kind: "MAM_RESTORE_V5",
    restore: basename(RESTORE), restore_gz_sha256: sha(gz),
    receipt: basename(RECEIPT), receipt_status: receipt.status,
    edition: receipt.edition, source: receipt.source,
    surface_sha256: surfaceSha, surface_sha256_reproduced: true,
    rows_restore: rows.length, rows_served: total,
    maqaf_rows_cut: stats.maqaf_rows, pieces_from_maqaf: stats.pieces_from_maqaf, kq_sites: stats.kq_rows, off_rows: stats.off_rows,
    marks: stats.marks, inkoff_keys_dropped: stats.inkoff_keys_dropped, letter_marks: stats.letter_marks, implicit_maqaf_rows: stats.implicit_maqaf, shirah_rows: stats.shirah_rows, kq_trivial_rows: stats.kq_trivial_rows || 0,
    reversibility: "every row's pieces rejoin byte-equal to the row: the joiner rides on the piece before it, a ketiv-qere site is cut around and never through",
    boundary_law: receipt.boundary_law, key_law: receipt.key_law,
    restore_reversibility_gate: receipt.reversibility_gate,
    count: { rule: MEASURE_RULE_ID, ...count, receipt_pieces_after_maqaf_split: receiptPieces, receipt_held: receiptHeld, ...(unread.rows ? { read_axis_convention: readAxisConvention } : {}), ...(cardsHeld ? { held_to: cardsHeld } : {}) },
    countersign: "website lane, 2026-09-06: hash reproduced from the bytes, every row rejoined, every declared site read back from its surface, every axis held to the corpus lane's book cards before a row was served",
  },
  identity: {
    bridge: basename(BRIDGE_OUT), bridge_sha256: sha(bridgeGz), units: unitOrder.length, c0_first: 1, c0_last: total, rows: total,
    tier: "PROTOTYPE_POSITIONAL",
    note: "every id is the C0's position within this book under restore v5; the corpus lane's registry assigns the sealed ids after the twenty-four books pass, and this bridge is replaced by that one",
  },
  rights: {
    source: "MAM_RESTORE_V5_RIGHTS_RECORD",
    record: basename(RIGHTS), record_sha256: sha(rightsBytes),
    licence_id: rw.license_id, raw_license: rw.raw_license,
    ...(rw.credit ? { credit: rw.credit } : {}),
    basis: rightsRec.basis || "the edition's own licence as its provider states it, one record for the thirty-nine files of the restore; the credit is printed on every page, which is what discharges the display condition",
    binding_scope_successor: { first: 1, last: total, rows: total },
  },
};
mkdirSync(dirname(OUT), { recursive: true });
const outLines = [JSON.stringify({ provenance })];
at = 0;
for (const unit of unitOrder) {
  let ord = 0;
  for (const p of units.get(unit)) {
    ord += 1; at += 1;
    outLines.push(JSON.stringify({
      c0_numeric_id: at,
      status: "FOUND_EXACT",
      location: { local_unit_id: unit },
      token_ordinal_in_unit: ord,
      exact_surface_form: p.surface,
      visible_in_hebrew_reader: visible,
      reader_display_axis: rights.reader_display_axis,
      public_distribution_axis: rights.public_distribution_axis,
      attribution_required: rights.attribution_required,
      noncommercial_required: rights.noncommercial_required,
      share_alike_required: rights.share_alike_required,
      no_derivatives_required: rights.no_derivatives_required,
      rights_authority: { normalized_license_class: rights.normalized_license_class, license_version: rights.license_version, terminal_resolution_state: rights.terminal_resolution_state },
      ...(p.kq ? { kq: p.kq } : {}),
      ...(p.letter_marks ? { letter_marks: p.letter_marks } : {}),
      ...(p.maqaf_implicit ? { maqaf_implicit: true } : {}),
      ...(p.shirah ? { shirah: true } : {}),
      ...(p.kq_trivial ? { kq_trivial: true } : {}),
      restore_row: p.restore_row,
    }));
  }
}
writeFileSync(OUT, outLines.join("\n") + "\n");
console.log(`${OUT}: ${total.toLocaleString()} C0s from ${rows.length.toLocaleString()} restore rows · ${unitOrder.length.toLocaleString()} verses · ` +
  `${count.words.toLocaleString()} words read / ${count.words_written.toLocaleString()} written · ${count.letters.toLocaleString()} letters written · ` +
  `${count.c0_on.toLocaleString()} on, ${count.c0_off.toLocaleString()} off · ${stats.kq_rows} kq sites · ${stats.maqaf_rows.toLocaleString()} rows cut at a maqaf · ${stats.letter_marks} letter marks` +
  `${cardsHeld ? " · held to the book cards on every axis" : ""}`);
