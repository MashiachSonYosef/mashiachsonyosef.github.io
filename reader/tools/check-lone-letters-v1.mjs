#!/usr/bin/env node
// LEDGER: C0
// GUARDS: lone-letter-rule-v1-a-letter-the-print-leaves-standing-alone-is-printed-as-printed-and-marked-by-the-record-that-names-it
//
// A built zone and the corpus lane's record of its lone letters, held to each
// other both ways: every record row is one word of the zone, at the unit and
// word index the record names, with the record's surface and its mark on the
// word; every word of the zone that carries a letter mark is a record row;
// and every word whose whole surface is one prefix letter carries a mark,
// which is the condition the refusals gate reads (C0.bare-prefix-letter).
// Nothing is repaired; a difference is named and the check fails.
//
// Run: node tools/check-lone-letters-v1.mjs --zone <zone .bin> --marks <record jsonl>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const ZONE = arg("zone"), MARKS = arg("marks");
if (!ZONE || !MARKS) { console.error("usage: --zone <zone .bin> --marks <record jsonl>"); process.exit(2); }

const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));
const marks = readFileSync(MARKS, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const stripPoints = (s) => String(s ?? "").normalize("NFC").replace(/[\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7]/gu, "");
const core = (s) => stripPoints(s).replace(/[\u05c0\u05c3()\[\]]/gu, "");
const PREFIX = /^[\u05d1\u05db\u05dc\u05d5\u05d4\u05de\u05e9]$/u;

let fails = 0;
const check = (name, ok, detail) => { console.log(`  ${ok ? "ok " : "BAD"} ${name}${detail ? `  ·  ${detail}` : ""}`); if (!ok) fails += 1; };

const byUnit = new Map(zone.sections.map((sec) => [sec.unit, sec.words || []]));
// L1 every record row is the zone word it names, surface for surface, with the record's mark
let found = 0, surfaceDiffers = 0, unmarked = 0, missing = 0; const firstBad = [];
for (const m of marks) {
  const words = byUnit.get(m.unit);
  const w = words && words[m.word_index_in_unit];
  if (!w) { missing += 1; if (firstBad.length < 3) firstBad.push(`${m.unit}:${m.word_index_in_unit} no word`); continue; }
  if (String(w.s) !== String(m.surface)) { surfaceDiffers += 1; if (firstBad.length < 3) firstBad.push(`${m.unit}:${m.word_index_in_unit} ${JSON.stringify(w.s)} vs ${JSON.stringify(m.surface)}`); continue; }
  const lm = Array.isArray(w.letter_marks) ? w.letter_marks : [];
  if (!lm.some((x) => x.kind === m.mark && x.class === m.class)) { unmarked += 1; if (firstBad.length < 3) firstBad.push(`${m.unit}:${m.word_index_in_unit} mark absent`); continue; }
  found += 1;
}
check("L1  every record row is the zone word it names, with the record's surface and mark", found === marks.length, `${found} of ${marks.length} · ${missing} no word · ${surfaceDiffers} surface differs · ${unmarked} unmarked${firstBad.length ? " · " + firstBad.join("; ") : ""}`);
// L2 every marked word of the zone is a record row
const recordKeys = new Set(marks.map((m) => `${m.unit}|${m.word_index_in_unit}`));
let marked = 0, stray = 0; let strayFirst = null;
for (const [unit, words] of byUnit) words.forEach((w, i) => { if (Array.isArray(w.letter_marks) && w.letter_marks.length) { marked += 1; if (!recordKeys.has(`${unit}|${i}`)) { stray += 1; strayFirst = strayFirst || `${unit}:${i}`; } } });
check("L2  every marked word of the zone is a record row", stray === 0, `${marked} marked words · ${stray} outside the record${strayFirst ? " (first " + strayFirst + ")" : ""}`);
// L3 every bare prefix-letter word carries a mark (the gate's condition)
let bare = 0, bareUnmarked = 0; let bareFirst = null;
for (const [unit, words] of byUnit) words.forEach((w, i) => { if (w.mark || w.kq) return; if (!PREFIX.test(core(w.s))) return; bare += 1; if (!(Array.isArray(w.letter_marks) && w.letter_marks.length)) { bareUnmarked += 1; bareFirst = bareFirst || `${unit}:${i} ${JSON.stringify(w.s)}`; } });
check("L3  every word whose whole surface is one prefix letter carries a mark", bareUnmarked === 0, `${bare} such words · ${bareUnmarked} unmarked${bareFirst ? " (first " + bareFirst + ")" : ""}`);
// L4 the classes recount
const byClass = {}; for (const m of marks) byClass[m.class] = (byClass[m.class] || 0) + 1;
const zoneByClass = {}; for (const [, words] of byUnit) for (const w of words) for (const x of (w.letter_marks || [])) zoneByClass[x.class] = (zoneByClass[x.class] || 0) + 1;
check("L4  the marks by class recount from the zone", JSON.stringify(byClass, Object.keys(byClass).sort()) === JSON.stringify(zoneByClass, Object.keys(byClass).sort()), Object.entries(byClass).map(([k, v]) => `${k} ${v}`).join(" · "));
// L5 the zone's provenance names the record
const lm = zone.emitted_from && zone.emitted_from.walk && zone.emitted_from.walk.letter_marks;
check("L5  the zone's walk names the record and its rows", !!(lm && lm.rows === marks.length && lm.marked === marks.length), lm ? `${lm.record} ${String(lm.sha256).slice(0, 12)} · ${lm.rows} rows · ${lm.marked} marked` : "no record named");
console.log(fails ? `\n${fails} check(s) failed` : "\nall checks passed");
process.exit(fails ? 1 : 0);
