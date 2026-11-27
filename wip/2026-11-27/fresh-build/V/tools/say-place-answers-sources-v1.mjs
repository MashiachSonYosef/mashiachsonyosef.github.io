#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It prints one value of a sources folder's map
// (sources.json) with its path made whole; it writes nothing.
//
// WHY THIS IS A FILE. The one command that makes the place answers
// (tools/make-place-answers-v1.sh) is a shell script, and two of the tools it
// runs take their sources as arguments. The folder's map is JSON; this reads
// it the same way the entries' builder does (paths against the folder the map
// stands in) and hands the shell one value, so the shell parses no JSON.
//
// Run: node tools/say-place-answers-sources-v1.mjs <sources.json> <dotted name>
//   e.g. step.dir · step.revision_whole · macula.tsv · macula.revision_whole
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sourcesResolved } from "./place-answers-entries-lib-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const [mapPath, name] = process.argv.slice(2);
if (!mapPath || !name) { console.error("usage: say-place-answers-sources-v1.mjs <sources.json> <dotted name>"); process.exit(2); }
const cfg = sourcesResolved(JSON.parse(readFileSync(mapPath, "utf8")), dirname(resolve(mapPath)), join(HERE, "..", "data", "zones"));
let v = cfg;
for (const k of name.split(".")) v = v === undefined || v === null ? undefined : v[k];
if (typeof v !== "string" || !v) { console.error(`the map ${mapPath} names no ${name}`); process.exit(1); }
console.log(v);
