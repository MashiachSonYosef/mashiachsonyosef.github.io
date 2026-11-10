// Two things. The comment edit 28 wrote said eleven records became a quiet default: the proof found ten did, and the
// eleventh (the posture table) was read behind a catch that could not fire, because the same file is read without one
// earlier (logs/t19-door-refuses-before.log). And the three sorts the review named that ask the machine's locale how to
// order names (the door's tie between two books, the pipeline manifest's rules and tools): a sort by the names' own
// code points says the same thing on every machine.
// node 29-door-comment-true-and-sorts-by-code-point.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);

edit(T("build-front-door-v1.mjs"), [
  [`// A RECORD THE DOOR IS BUILT FROM IS READ, OR THE DOOR IS NOT BUILT. Until 10
// November 2026 eleven of them were read "if the file is there": an absent
// filing, order, status ruling, source classification, posture table, color
// contract, demonstrations record, overlay count, reference groups or
// address history became a quiet default, and the door was written without
// it and exited 0. Every one of them is in this repository, so an absent one
// is a broken tree, and a door built from a broken tree is not a door.`,
   `// A RECORD THE DOOR IS BUILT FROM IS READ, OR THE DOOR IS NOT BUILT. Until 10
// November 2026 ten of them were read "if the file is there": an absent
// filing, order, attestation, status ruling, source classification, color
// contract, demonstrations record, overlay count, reference groups or
// address history became a quiet default, and the door was written without
// it and exited 0 (proven by taking each away in turn). An eleventh, the
// posture table, was read behind a catch that could not fire. Every one of
// them is in this repository, so an absent one is a broken tree, and a door
// built from a broken tree is not a door.
// TWO NAMES ARE ORDERED BY THEIR OWN CODE POINTS, never by asking the machine
// how its language sorts: the same names file the same way wherever the
// door is built.
const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);`],
  [`|| x.book24.localeCompare(y.book24))`, `|| byCodePoint(x.book24, y.book24))`],
]);

edit(T("pipeline-manifest-v1.mjs"), [
  [`// ---- write ---------------------------------------------------------------
const ordered = [...rules.entries()].sort((a, b) => a[0].localeCompare(b[0]));`,
   `// ---- write ---------------------------------------------------------------
// names are ordered by their own code points, never by asking the machine how
// its language sorts: the same tree writes the same manifest on any machine
const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const ordered = [...rules.entries()].sort((a, b) => byCodePoint(a[0], b[0]));`],
  [`  const wrote = [...s.wrote.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(`,
   `  const wrote = [...s.wrote.entries()].sort((a, b) => byCodePoint(a[0], b[0])).map(`],
]);
