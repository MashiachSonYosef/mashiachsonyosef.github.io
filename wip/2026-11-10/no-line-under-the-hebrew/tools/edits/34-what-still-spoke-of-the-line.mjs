// Two places still spoke of the line a run wore, after edit 30 took it off the page (the owner's ruling, 2026-11-10):
//   tools/build-toggle-design-v1.mjs  the /toggles/ page listed "Two-word underlines" among the things waiting to be
//     drawn ("None is drawn ... Comes back span by span when the run store lands"). The span store landed in
//     October (check-span-store-v1 dates a review of the page's cells to 2026-10-17) and its places stand on the
//     book pages, each one cell, one card and one blob (S1, S2: 2,845 places in 39 books), so the entry was
//     already untrue; and the line it is named for is gone. The entry leaves the waiting list.
//   tools/project-hud-runs-v1.mjs  its header said the page gives a run's words "one line, one strip and one card"
//     and that a maqaf chain is joined "into one cell with one line". Comments only; the rule's id, which is written
//     into the forty files this tool projected, keeps the words it was given.
// node 34-what-still-spoke-of-the-line.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);

edit(T("build-toggle-design-v1.mjs"), [
  [`<li><b>Two-word underlines.</b> One cell, one card and one blob over two or more spaced words, only where one dictionary record defines the span as one thing. None is drawn: the record that named the spans was wrong ("the data is wrong lets leave it out for now"), and the shelf answers two spans in all. Comes back span by span when the run store lands.</li>
`, ``],
]);

edit(T("project-hud-runs-v1.mjs"), [
  [`// words stands in the zone the page draws, so the page can give its words one
// line, one strip and one card — the same lane the run cards already take:`,
   `// words stands in the zone the page draws, so the page can give its words one
// cell and one card — the same lane the run cards already take. (The cell's
// ink row wore one gold line too, which is what the rule's id still says,
// until the owner's ruling of 2026-11-10: "i think we can get rid of
// underlining because when things are underlined theyre already put into 1
// card, 1 hud". The id is written into every file this tool projected and is
// left as it was given.)`],
  [`//     kind MAQAF_CHAIN alone is not written either (the page already joins a
//     maqaf chain into one cell with one line); every other HUD of two or more`,
   `//     kind MAQAF_CHAIN alone is not written either (the page already joins a
//     maqaf chain into one cell); every other HUD of two or more`],
]);
