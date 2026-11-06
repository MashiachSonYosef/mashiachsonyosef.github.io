#!/usr/bin/env node
// GUARDS: read-form-offsets-rule-v1-a-read-forms-piece-without-letters-takes-the-lanes-alignment-or-none
// LEDGER: -
// THE READ FORM'S PIECES, PLACED (the corpus lane's v108, 6 November 2026).
//
// At a ketiv/qere place the piece store gives each source's pieces of the
// read form (and of a few written forms), but at 475 of the 578 places where
// a read form divides, some piece carries no letter offsets: the store writes
// null where the form's letters run on past the word's own numbering. The
// page asks a piece claim at a cell's own letters [a, b], so a claim with no
// letters answers no cell, and the card of Nahum 2:6:4 read its whole word
// and none of its pieces from the place.
//
// The lane aligned them (corpus-lane-builds/moses-read-form-offsets-v1,
// build/read-form-offsets-v1.jsonl): a group (one place, one source, one
// reading) is aligned when its pieces' letters, joined, equal the side's
// letters, a MACULA record being the piece itself and a TAHOT record the
// whole word split at its "/". 1,158 of 1,166 groups align; the 1,292
// offsets the store already holds all equal the alignment; 8 groups do not
// align and get none, rather than a guess. The page lane counted it again
// from the served store and agrees on every group.
//
// This bakes the aligned groups, as received, into one small served file the
// card reads only where a read form's piece has no letters of its own. Where
// the store gives letters, the store's stand; the next piece store carries
// the same offsets, and this file then has nothing to fill.
//
// Usage: node tools/bake-read-form-offsets-v1.mjs --from <read-form-offsets-v1.jsonl> --relay <relay file name> [--out data/read-form-offsets-v1.json]
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename } from "node:path";

export const READ_FORM_OFFSETS_RULE_ID = "read-form-offsets-rule-v1-a-read-forms-piece-without-letters-takes-the-lanes-alignment-or-none";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const FROM = arg("from", ""), RELAY = arg("relay", ""), OUT = arg("out", "data/read-form-offsets-v1.json");
if (!FROM || !RELAY) { console.error("usage: --from <read-form-offsets-v1.jsonl> --relay <the relay that hands it over>"); process.exit(2); }

const bytes = readFileSync(FROM);
const books = {};
const counts = { groups: 0, aligned: 0, not_aligned: 0, pieces: 0, by_reading: {}, by_source: {} };
const notAligned = [];
for (const line of bytes.toString("utf8").split("\n")) {
  if (!line.trim()) continue;
  const g = JSON.parse(line);
  counts.groups += 1;
  counts.by_reading[g.reading] = (counts.by_reading[g.reading] || 0) + 1;
  counts.by_source[g.source] = (counts.by_source[g.source] || 0) + 1;
  if (!g.aligned || !Array.isArray(g.pieces)) { counts.not_aligned += 1; notAligned.push(`${g.book} ${g.place} ${g.source} ${g.reading}`); continue; }
  // every piece once, in order, its letters a run inside the side's letters
  const ok = g.pieces.every((p, i) => Array.isArray(p) && p.length === 3 && Number.isInteger(p[1]) && Number.isInteger(p[2]) && p[1] <= p[2] && (i === 0 ? p[1] === 0 : p[1] === g.pieces[i - 1][2] + 1))
    && g.pieces[g.pieces.length - 1][2] === [...String(g.side_letters || "")].length - 1;
  if (!ok) { console.error(`REFUSED: ${g.book} ${g.place} ${g.source} ${g.reading} says aligned, and its pieces do not tile the side's letters`); process.exit(1); }
  counts.aligned += 1; counts.pieces += g.pieces.length;
  ((books[g.book] ||= {})[g.place] ||= {})[`${g.source}|${g.reading}`] = g.pieces;
}
const record = {
  schema_version: "READ_FORM_OFFSETS_V1",
  rule_id: READ_FORM_OFFSETS_RULE_ID,
  what: "per book, per place (chapter:verse:word, marks not counted), per source and reading: each piece of the form as [piece, start, end], letter indexes from 0, inclusive, over the side's letters; the card takes a piece's letters from here only where the piece store gives it none",
  from: { file: basename(FROM), bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), relay: RELAY, lane: "corpus-lane-builds/moses-read-form-offsets-v1/build/" },
  counts,
  not_aligned: { count: notAligned.length, groups: notAligned, says: "no offsets rather than a guess; those cards keep the fallback" },
  books,
};
writeFileSync(OUT, JSON.stringify(record) + "\n");
console.log(`${OUT}: ${counts.aligned} of ${counts.groups} groups aligned (${counts.pieces} pieces) over ${Object.keys(books).length} books · ${counts.not_aligned} without offsets · from ${record.from.sha256.slice(0, 12)}`);
