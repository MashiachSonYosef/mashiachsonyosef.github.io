// check-form-of-v1 looked for a pointer's pill by the pointer's text as the source wrote it. The page carries it on
// the pill as it prints (a "/" in the source's text prints " + "), so a pointer whose text holds one was passed
// over and the next word tried: Amos 1:1's first word carries «Feminine singular imperative of ... + ...» on a pill
// and was reported as carrying none. The pill is matched by the printed form, and so is the count of pills that
// print the pointer bare. Applies after edit 54.
// node 55-a-pointer-is-matched-as-it-prints.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-form-of-v1.mjs"), [
  [`const pointerPill = (card, e) => card.pills.findIndex((x) => x.pointer && noDot(x.pointer) === noDot(e.t) && x.by.split(/[\\s,]+/u).includes(e.m));`,
   `// the pill carries the pointer's own text as it prints (printedForm: a "/" of the source's prints " + ")
const pointerPill = (card, e) => card.pills.findIndex((x) => x.pointer && printedForm(x.pointer) === printedForm(e.t) && x.by.split(/[\\s,]+/u).includes(e.m));`],
  [`  const bare = first.pills.filter((x) => noDot(x.t) === noDot(found.e.t)).length;`,
   `  const bare = first.pills.filter((x) => printedForm(x.t) === printedForm(found.e.t)).length;`],
]);
