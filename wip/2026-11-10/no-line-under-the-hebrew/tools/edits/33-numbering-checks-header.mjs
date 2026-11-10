// The card-numbering check's own account of N12 still listed "a run's line" among the gold a number keeps clear of.
// node 33-numbering-checks-header.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "tools", "check-card-numbering-v1.mjs"), [
  [`//       more from every other gold pixel (a frame's line, a run's line, a
//       point, an accent) and from every letter's and reading's ink ("the`,
   `//       more from every other gold pixel (a frame's line, a point, an
//       accent; a run wore a line too until 2026-11-10) and from every
//       letter's and reading's ink ("the`],
]);
