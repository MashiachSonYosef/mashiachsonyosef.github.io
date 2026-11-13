// The page's printed-form helper (spanJoin: a "/" of the source's prints " + ", a closing period is not counted)
// was defined some 1,170 lines below the pointer map's code, which now asks it three times. It moves, with its own
// words, to stand above that code, so every use of it comes after it. Nothing it does changes.
// Applies after edit 56.
// node 61-the-printed-form-stands-above-its-first-use.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const HELPER = `  // The reader's display law: route texts pack morpheme spans with "/"; the
  // page never shows the raw packing — spans join with " + ", exactly the
  // reader's own cell join. One route on display at a time, everywhere.
  // And the one other mark the page does not show: a period closing a
  // reading. Strong's ends every usage list with one ("Israel.", "spear.")
  // and a definition that is a sentence ends with one; neither is part of
  // the word, and a line that printed "Israel." under a name read as a typo
  // the day names began to lead (proper-name-rule-v1). The stored text is
  // untouched: the pill, the record beneath it and the export still carry
  // the period, and the porch and every check join readings by this same
  // function, to the character.
  const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\\.$/, "");
`;
const POINTERS = `  // HEBREW DEFINED BY HEBREW (the owner, on the card of a two-word number:
`;

edit(join(R, "zone.html"), [
  [HELPER, ""],
  [POINTERS, HELPER + POINTERS],
]);
