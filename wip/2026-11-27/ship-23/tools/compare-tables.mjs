import { readFileSync } from "node:fs";
const L = await import(process.argv[2] + "/tools/place-answers-entries-lib-v1.mjs");
const P = await import(process.argv[2] + "/tools/place-answers-sources-v1.mjs");
const now = JSON.stringify({ OUR_BOOKS: L.OUR_BOOKS, BY_ENGLISH_NUMBER: L.BY_ENGLISH_NUMBER, BY_OSIS: L.BY_OSIS, BY_STEP: L.BY_STEP, BY_UHB: L.BY_UHB, BY_HEBREW_NAME: [...L.BY_HEBREW_NAME], BOOKS: P.BOOKS });
console.log(now === readFileSync(process.argv[3], "utf8") ? "every table equals what the tools held before" : "TABLES DIFFER");
