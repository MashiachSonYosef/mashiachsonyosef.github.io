// The one reading of a word's card that the gates' checks share (tools/gated-card-v1.mjs) also says the card's
// notes: what the page says of them, the line as it stands, and where it stands. The check of the sense openings
// reads them from here, as the entry gate's and the names gate's checks read the pills.
// node 77-the-card-read-off-the-page-says-its-notes.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "gated-card-v1.mjs"), [
  [`// says so, what the card takes its place for, and the line under the word.
// This is that one reading.
`,
   `// says so, what the card takes its place for, and the line under the word.
// This is that one reading. It also reads the card's notes (the words a
// dictionary opens a numbered sense with, sense-openings-rule-v1), for
// tools/check-sense-openings-v1.mjs.
`],
  [`  if (!wb) return { fault: "the word is not on the page" };
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
`,
   `  if (!wb) return { fault: "the word is not on the page" };
  // what the last card said of its notes is not this card's
  window.__poolNotes = null;
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
`],
  [`    entry: window.__cardEntry || "", name: window.__cardName || "",
`,
   `    entry: window.__cardEntry || "", name: window.__cardName || "",
    // the card's notes: what the page says they are, and the line that prints them ([source, entry, point, the
    // note as printed] for each), how many it says it holds, and whether it stands with the record or in the band
    notes: ((line) => ({ said: window.__poolNotes || [], counted: line ? Number(line.dataset.notes) : 0, text: line ? line.textContent : "",
      where: line ? (line.closest(".d-card") ? "record" : line.closest(".b-read") ? "band" : "elsewhere") : null,
      spans: line ? [...line.querySelectorAll(".sense-note")].map((x) => [x.dataset.m || "", x.dataset.entry || "", x.dataset.point || "", x.textContent]) : [] }))(hud.querySelector(".sense-notes")),
`],
]);
