// The page's factsOf stood in the entry gate's block, below senseOpened, which now asks it: the linter's
// no-use-before-define. It moves up beside the other functions that read a row (closed, routePrinted, recordPrinted),
// where what a row's facts say is read once for every gate. The entry gate's check lifted it with the gate's whole
// block; it now lifts it by its own text, as tools/page-reading-v1.mjs does.
// node 79-the-page-reads-a-rows-facts-before-it-asks-them.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const FACTS = `  const factsOf = (row) => { const f = Array.isArray(row) && row.length > 10 ? row[10] : null; return f && typeof f === "object" && !Array.isArray(f) ? f : null; };
`;

edit(join(R, "zone.html"), [
  [`  const entrySaid = (place) => (place.lettered ? [...new Set(place.tags)] : place.numbers);
${FACTS}`,
   `  const entrySaid = (place) => (place.lettered ? [...new Set(place.tags)] : place.numbers);
`],
  [`  // THE WORDS THAT OPEN A NUMBERED SENSE ARE A NOTE, NOT A READING
  // (sense-openings-rule-v1, 13 November 2026).`,
   `  // WHAT THE CORPUS LANE'S LEDGERS SAY OF A ROW rides on the row, in its
  // facts slot (row[10], an object; FACTS_SLOT in tools/gloss-store-v1.mjs):
  // the entry its own source files it under, whether its source gives it as
  // a name, the numbered sense it opens. Read here once for every gate.
${FACTS}  // THE WORDS THAT OPEN A NUMBERED SENSE ARE A NOTE, NOT A READING
  // (sense-openings-rule-v1, 13 November 2026).`],
]);

edit(join(R, "tools", "check-entry-gate-v1.mjs"), [
  ["  page = new Function(`${grab(\"\\n  const numberOf = (tag) => \", \"\\n  window.__entryGate = \")}",
   "  page = new Function(`${grab(\"\\n  const factsOf = (row) => \", \";\\n\")}${grab(\"\\n  const numberOf = (tag) => \", \"\\n  window.__entryGate = \")}"],
]);
