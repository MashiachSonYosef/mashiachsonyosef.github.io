// check-made-spaces-v1's M6 recomputes, by a second road, the readings of every row that carries the made spaces'
// slot: its printed route cut at its own marks. Ruling 4 gave 132 of those rows (the unabridged BDB's openings of a
// numbered sense that also carry a closed space) no reading, and M6 still expected one. The second road now reads the
// row's own fact: a row whose facts name the numbered sense it opens gives no reading. Its route and record still
// print as their lines say, and M6 still holds them to it.
// node 83-the-made-spaces-check-knows-a-note-gives-no-reading.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-made-spaces-v1.mjs"), [
  [`//   M6  by a second road, what prints: a row's route as printed is its line's
//       \`prints\`; its record as printed is its definition line's; and its
//       readings are that \`prints\` cut at the row's own marks, each mark's
//       place less the closes before it
`,
   `//   M6  by a second road, what prints: a row's route as printed is its line's
//       \`prints\`; its record as printed is its definition line's; and its
//       readings are that \`prints\` cut at the row's own marks, each mark's
//       place less the closes before it, or none where the row's facts say it
//       only opens a numbered sense of its entry (sense-openings-rule-v1)
`],
  [`import { openRouteStore, MADE_SPACES_RULE_ID, CLOSES_SLOT, routePrinted, recordPrinted, readingKey, printedForm } from "./gloss-store-v1.mjs";
`,
   `import { openRouteStore, MADE_SPACES_RULE_ID, CLOSES_SLOT, routePrinted, recordPrinted, readingKey, printedForm, factsOf } from "./gloss-store-v1.mjs";
`],
  [`  const want = pieces.map((x) => x.trim()).filter(Boolean);
`,
   `  // a row that only opens a numbered sense prints as a note and gives no reading (sense-openings-rule-v1)
  const want = (factsOf(row) || {}).opens ? [] : pieces.map((x) => x.trim()).filter(Boolean);
`],
]);
