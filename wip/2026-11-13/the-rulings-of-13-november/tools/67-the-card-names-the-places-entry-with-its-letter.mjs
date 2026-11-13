// The card said «34 of another entry than H376, withheld» at a place tagged H376I, where the 34 are rows TAHOT files
// under H376G and H376H: the number's own rows, another entry by STEP's letter (ruling 6). Naming the number alone
// said something false of them. Measured on the thirty-nine books, the letter withholds a row the number keeps at
// 75,998 places, so the sentence was false at that many. The card now names the place's entry as the place is
// asked: its tags where every one carries STEP's letter (a row is asked by letter there), else its numbers. One
// function says it, in the gate's module and on the page under the same name; the check runs the two side by side
// (E6) and reads the card's line and its data against it (E9, E11).
// node 67-the-card-names-the-places-entry-with-its-letter.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "entry-gate-v1.mjs"), [
  [`// A row carries what this reads in its facts slot (gloss-store-v1.mjs:
`,
   `//   WHAT THE CARD NAMES   the place's entry as the place is asked: its tags
//                where every one carries a letter, else its numbers. A row
//                withheld by letter is its number's own, so the number
//                alone would misname it.
//
// A row carries what this reads in its facts slot (gloss-store-v1.mjs:
`],
  [`/** BDB's own entries that the key's rows give the place's numbers:`,
   `/** How the card names a place's entry: its tags where every one carries a letter (a row is asked by letter there), else its numbers. */
export const entrySaid = (place) => (place.lettered ? [...new Set(place.tags)] : place.numbers);

/** BDB's own entries that the key's rows give the place's numbers:`],
]);

edit(join(R, "zone.html"), [
  [`  const factsOf = (row) => { const f = Array.isArray(row) && row.length > 10 ? row[10] : null; return f && typeof f === "object" && !Array.isArray(f) ? f : null; };
  const bdbEntriesAt = (place, factsOfRows) => {`,
   `  const entrySaid = (place) => (place.lettered ? [...new Set(place.tags)] : place.numbers);
  const factsOf = (row) => { const f = Array.isArray(row) && row.length > 10 ? row[10] : null; return f && typeof f === "object" && !Array.isArray(f) ? f : null; };
  const bdbEntriesAt = (place, factsOfRows) => {`],
  [`  window.__entryGate = { numberOf, tagOf, placeEntry, factsOf, bdbEntriesAt, entryVerdict };`,
   `  window.__entryGate = { numberOf, tagOf, placeEntry, entrySaid, factsOf, bdbEntriesAt, entryVerdict };`],
  [`    // is neither, and the pointing speaks for it as before. The overlays'
    // rows carry no entry and are not asked.
`,
   `    // is neither, and the pointing speaks for it as before. The overlays'
    // rows carry no entry and are not asked. The card names the place's
    // entry as the place is asked (entrySaid): with STEP's letter where a
    // row is asked by letter, since a row withheld by letter is its
    // number's own.
`],
  [`        entryHere = place.numbers;`, `        entryHere = entrySaid(place);`],
]);

edit(join(R, "tools", "check-entry-gate-v1.mjs"), [
  [`import { ENTRY_GATE_RULE_ID, numberOf, tagOf, letteredOf, placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";`,
   `import { ENTRY_GATE_RULE_ID, numberOf, tagOf, letteredOf, placeEntry, entrySaid, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";`],
  [`\\n return { numberOf, tagOf, placeEntry, factsOf, bdbEntriesAt, entryVerdict, leadersKey, onlyLeaders };`,
   `\\n return { numberOf, tagOf, placeEntry, entrySaid, factsOf, bdbEntriesAt, entryVerdict, leadersKey, onlyLeaders };`],
  [`          if (!pp || !same(pp, mine.place) || !same([...pb].sort(), [...mine.bdbHere].sort())) { e6.faults.push(\`\${k} under \${tags.join(" ")}: the place or BDB's entries there\`); continue; }`,
   `          if (!pp || !same(pp, mine.place) || !same([...pb].sort(), [...mine.bdbHere].sort())) { e6.faults.push(\`\${k} under \${tags.join(" ")}: the place or BDB's entries there\`); continue; }
          if (!same(page.entrySaid(pp), entrySaid(mine.place))) { e6.faults.push(\`\${k} under \${tags.join(" ")}: how the card names the place's entry\`); continue; }`],
  [`      Object.assign(here, { tags, numbers: j.place.numbers, other: j.other, rows: rows.length });`,
   `      Object.assign(here, { tags, said: entrySaid(j.place), other: j.other, rows: rows.length });`],
  [`  const lineSays = (got, pick) => got.line.includes(\`\${pick.other} of another entry than \${pick.numbers.join(" or ")}, withheld\`);
  const counted = (got, pick) => !!got.data && Number(got.data.entryWithheld) === pick.other && got.data.entry === pick.numbers.join("|") && lineSays(got, pick);`,
   `  // the card names the place's entry as the place is asked: with STEP's letter where a row is asked by letter
  const lineSays = (got, pick) => got.line.includes(\`\${pick.other} of another entry than \${pick.said.join(" or ")}, withheld\`);
  const counted = (got, pick) => !!got.data && Number(got.data.entryWithheld) === pick.other && got.data.entry === pick.said.join("|") && lineSays(got, pick);`],
  [`//       the default its card withholds exactly those, says so on its
//       withheld line naming the place's numbers, and prints no reading
//       that only such rows carry; under "keep" it withholds none and the
//       reading is back
`,
   `//       the default its card withholds exactly those, says so on its
//       withheld line naming the place's entry (its tags where each
//       carries STEP's letter and a row is asked by letter, else its
//       numbers), and prints no reading that only such rows carry; under
//       "keep" it withholds none and the reading is back
`],
  [`its card withholds exactly those, says so naming the place's numbers, and prints no reading only such rows carry`,
   `its card withholds exactly those, says so naming the place's entry (with STEP's letter where a row is asked by letter), and prints no reading only such rows carry`],
]);
