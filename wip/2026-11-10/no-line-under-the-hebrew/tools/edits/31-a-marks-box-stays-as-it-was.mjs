// Edit 30 took out the rule that kept every word's bottom border unseen, and with it went the clause that kept a
// scribal mark's: a mark's letters are boxed in dim gold on all four sides by their own rule, and since 19 October
// the box has stood open at the foot (the rule against a line under a single word took its bottom side). The proof
// of edit 30 found the box closed on the new page (84 marks in Amos). The owner asked for the underlines to go, not
// for the marks' boxes to change, so the box stays exactly as the live page draws it.
// node 31-a-marks-box-stays-as-it-was.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "zone.html"), [
  [`  .wb > .w { border-bottom: 1px solid transparent; border-radius: 0; }
`,
   `  .wb > .w { border-bottom: 1px solid transparent; border-radius: 0; }
  /* a scribal mark's own box (dim gold, above) has stood open at the foot
     since 2026-10-19, when the line under a single word went and took the
     box's bottom side with it; it is left exactly so */
  .wb.mark > .w { border-bottom-color: transparent; }
`],
]);
