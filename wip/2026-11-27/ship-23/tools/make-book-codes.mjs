// Write the place answers' book-codes record from the tables the two tools hold today, and keep a copy of every
// exported table to compare against once the tools read the record instead.
import { writeFileSync } from "node:fs";
const L = await import(process.argv[2] + "/tools/place-answers-entries-lib-v1.mjs");
const P = await import(process.argv[2] + "/tools/place-answers-sources-v1.mjs");
const inv = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));
const osis = inv(L.BY_OSIS), step = inv(L.BY_STEP), uhb = inv(L.BY_UHB);
const heb = new Map([...L.BY_HEBREW_NAME].map(([k, v]) => [v, [...k].map((c) => c.codePointAt(0))]));
const macula = new Map(P.BOOKS.map(([b, , m]) => [b, m])), stepP = new Map(P.BOOKS.map(([b, s]) => [b, s]));
const books = L.OUR_BOOKS.map((b, i) => {
  if (L.BY_ENGLISH_NUMBER[i + 1] !== b || stepP.get(b) !== step[b] || P.BOOKS[i][0] !== b) throw new Error(`the tables disagree at ${b}`);
  return { book: b, english_number: i + 1, step: step[b], macula: macula.get(b), osis: osis[b], uhb: uhb[b], hebrew_name_codepoints: heb.get(b) };
});
const rec = {
  schema: "PLACE_ANSWERS_BOOK_CODES_V1",
  rule: "Each source names the thirty-nine books its own way; this record maps each source's own name for a book to the slug the zones use. It is data, not code, so no tool names a work in its own source (check-scope-derived-v1 S1).",
  sources: {
    step: "STEP's book code, as in Gen.1.1#01=L (TAHOT and TBESH)",
    macula: "MACULA Hebrew's book code",
    osis: "the Open Scriptures BDB's OSIS book name, as in <ref r=\"Job.8.12\">",
    uhb: "unfoldingWord's book code, as in rc://he/uhb/book/exo/6/24",
    english_number: "the book's number in the English Bible's order, as the unabridged BDB's <ref b=\"…\"> and the UBS dictionary's references count books",
    hebrew_name_codepoints: "the Hebrew Wikisource edition's book name, as code points, because a tool carries no Hebrew letters",
  },
  books,
};
writeFileSync(process.argv[3], JSON.stringify(rec, null, 1) + "\n");
writeFileSync(process.argv[4], JSON.stringify({ OUR_BOOKS: L.OUR_BOOKS, BY_ENGLISH_NUMBER: L.BY_ENGLISH_NUMBER, BY_OSIS: L.BY_OSIS, BY_STEP: L.BY_STEP, BY_UHB: L.BY_UHB, BY_HEBREW_NAME: [...L.BY_HEBREW_NAME], BOOKS: P.BOOKS }));
console.log("wrote", books.length, "books");
