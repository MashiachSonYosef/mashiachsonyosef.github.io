#!/usr/bin/env node
// Synthesis lane · v-ledger-counter-verification-rule-v1-an-anchor-is-checked-against-the-word-this-lane-draws
// LEDGER: -
// It writes no record of the frame. It reads the corpus lane's V ledger and
// this lane's own zones and reports whether the two agree; the record it
// produces is a finding, and data/v-ledger-posture-v1.json is where a finding
// that has been ruled on lives.
//
// V IS AN ANCHOR, NOT A LATTICE. It carries a pointer from a base word to the
// commentary units whose opening catchword names that word, and a count from a
// verse to how much commentary sits on it. It has no opinion on what a comment
// says, and the commentary's own words are a token stream it does not hold.
//
// WHAT THIS CHECKS, and it is the one thing the serving lane owes the corpus
// lane before anything is wired: that every anchor lands on the word THIS lane
// draws. V points into lattice v12 by book + i + j; this lane's zones are
// projected from the same lattice by the same join, so the two can be laid
// against each other position by position:
//
//   V1  every anchored position is an ON position of the lattice
//   V2  the reference V names is the reference the lattice gives that position
//   V3  the surface V names is the surface the lattice gives that position
//   V4  the word this lane's own zone draws at that slot exists
//   V5  i repeats and j does not — the fact the whole join rests on
//
// AND WHAT IT CANNOT CHECK, said plainly: whether the catchword really names
// this word. That is the corpus lane's resolution and its own recount's
// question. This file asks only whether the pointer points at what it says.
//
// Run: node tools/verify-v-ledger-v2-v1.mjs --ledger <dir with v-reverse-index-v2.jsonl.gz>
//                                           --lattice <dir with positions-<book>-v12.jsonl.gz>
//      Both live outside this repository. Without them this SKIPS by name.
import { readFileSync, createReadStream, existsSync } from "node:fs";
import { gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const LEDGER = arg("ledger");
const LATTICE = arg("lattice");
const ZONES = arg("zones", join(K3, "data", "zones"));
const SKIP = "verify-v-ledger-v2-v1";

const INDEX = LEDGER ? join(LEDGER, "v-reverse-index-v2.jsonl.gz") : null;
if (!INDEX || !existsSync(INDEX)) {
  console.log(`SKIPPED — no V reverse index at ${INDEX || "--ledger <dir>"}, so ${SKIP} has no anchor to check`);
  process.exit(3);
}
if (!LATTICE || !existsSync(LATTICE)) {
  console.log(`SKIPPED — no lattice positions at ${LATTICE || "--lattice <dir>"}; V points into the lattice and cannot be checked without it`);
  process.exit(3);
}

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");
const keysOf = (w) => (w.w ? w.w.map((x) => x.k).filter(Boolean) : w.k ? [w.k] : []);

const byBook = new Map();
for (const line of gunzipSync(readFileSync(INDEX)).toString("utf8").trim().split("\n")) {
  if (!line) continue;
  const r = JSON.parse(line);
  if (!byBook.has(r.book)) byBook.set(r.book, []);
  byBook.get(r.book).push(r);
}

let checked = 0, refOk = 0, surfaceOk = 0, drawnOk = 0, onPositions = 0, iRepeat = 0, books = 0;
const notOn = [], refBad = [], surfaceBad = [], notDrawn = [], jBad = [];
for (const [book, rows] of byBook) {
  const zonePath = join(ZONES, `${book}.bin`);
  const posPath = join(LATTICE, `positions-${book}-v12.jsonl.gz`);
  if (!existsSync(zonePath) || !existsSync(posPath)) { notOn.push(`${book}: no zone or no lattice file`); continue; }
  books += 1;
  const zone = JSON.parse(gunzipSync(readFileSync(zonePath)).toString("utf8"));
  const pos = new Map(), byRef = new Map(), iSeen = new Map();
  let lastJ = -1, jAscending = true;
  const rl = createInterface({ input: createReadStream(posPath).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const l of rl) {
    if (!l) continue;
    const p = JSON.parse(l);
    if (p.c0 !== "ON") continue;
    if (pos.has(p.j)) jBad.push(`${book}: j ${p.j} appears twice`);
    if (p.j <= lastJ) jAscending = false;
    lastJ = p.j;
    pos.set(p.j, p);
    iSeen.set(p.i, (iSeen.get(p.i) || 0) + 1);
    if (!byRef.has(p.ref)) byRef.set(p.ref, []);
    byRef.get(p.ref).push(p.j);
  }
  if (!jAscending) jBad.push(`${book}: j is not ascending in file order`);
  onPositions += pos.size;
  for (const [, n] of iSeen) if (n > 1) iRepeat += n - 1;
  const drawn = new Map();
  for (const s of zone.sections || []) drawn.set(s.label, (s.words || []).filter((w) => !w.mark && keysOf(w).length));
  for (const r of rows) {
    checked += 1;
    const p = pos.get(r.j);
    if (!p) { notOn.push(`${book} j=${r.j}`); continue; }
    if (p.ref === r.ref) refOk += 1; else refBad.push(`${book} j=${r.j}: V ${r.ref}, lattice ${p.ref}`);
    if (p.surface === r.surface) surfaceOk += 1; else surfaceBad.push(`${book} j=${r.j}`);
    const ix = (byRef.get(p.ref) || []).indexOf(r.j);
    if ((drawn.get(p.ref) || [])[ix]) drawnOk += 1; else notDrawn.push(`${book} ${p.ref}[${ix}]`);
  }
}

console.log(`— ${books} book(s) carry an anchor · ${checked.toLocaleString()} anchored positions —`);
check("V1  every anchored position is an ON position of the lattice", notOn.length === 0,
  notOn.length ? `${notOn.length} — ${few(notOn)}` : `${checked.toLocaleString()} found`);
check("V2  the reference V names is the reference the lattice gives", refBad.length === 0,
  refBad.length ? `${refBad.length} — ${few(refBad)}` : `${refOk.toLocaleString()} agree`);
check("V3  the surface V names is the surface the lattice gives", surfaceBad.length === 0,
  surfaceBad.length ? `${surfaceBad.length} — ${few(surfaceBad)}` : `${surfaceOk.toLocaleString()} agree`);
check("V4  this lane's own zone draws a word at that slot", notDrawn.length === 0,
  notDrawn.length ? `${notDrawn.length} — ${few(notDrawn)}` : `${drawnOk.toLocaleString()} drawn`);
check("V5  j is unique and ascending; i is not, which is why the join is on both", jBad.length === 0,
  jBad.length ? `${jBad.length} — ${few(jBad)}` : `${onPositions.toLocaleString()} ON positions read · i repeats ${iRepeat.toLocaleString()} times across maqaf parts`);

console.log("\n  what this does not say: that the catchword names this word. That is the");
console.log("  corpus lane's resolution, and its own recount is where it is answered.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
