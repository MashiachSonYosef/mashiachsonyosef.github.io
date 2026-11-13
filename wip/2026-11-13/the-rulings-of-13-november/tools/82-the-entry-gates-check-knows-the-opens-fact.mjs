// check-entry-gate-v1's E2 knows every fact a row may carry and faults one no tool writes. Ruling 4 gave a row a new
// fact, opens (tools/apply-sense-openings-v1.mjs: the entry and the point of the numbered sense the row opens), and
// E2 faulted all 2,008 marked rows for it. E2 now knows the fact and holds its shape: a string naming an entry, then
// a point where there is one. Which rows carry it, and that each carries its line's entry and point, is
// check-sense-openings-v1's to hold (O3), as which rows carry a name is the names check's.
// node 82-the-entry-gates-check-knows-the-opens-fact.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-entry-gate-v1.mjs"), [
  [`//   E2  every row's facts are well formed: an object of known facts only,
//       none empty; n a list of Strong's numbers with no repeat; t a list of
//       lettered tags, each of a number in n, on a row of the first
//       parting's sources only; b a list of entries, on a row of the second
//       parting's only; and no row ends in an empty slot
`,
   `//   E2  every row's facts are well formed: an object of known facts only,
//       none empty; n a list of Strong's numbers with no repeat; t a list of
//       lettered tags, each of a number in n, on a row of the first
//       parting's sources only; b a list of entries, on a row of the second
//       parting's only; opens an entry and the point of the numbered sense
//       the row opens (tools/apply-sense-openings-v1.mjs; which rows carry it
//       is check-sense-openings-v1's to hold); and no row ends in an empty
//       slot
`],
  [`const KNOWN = new Set(["n", "t", "b", "name"]);
`,
   `const KNOWN = new Set(["n", "t", "b", "name", "opens"]);
`],
  [`        if (Array.isArray(f.b) && FACT_OF.get(m) !== "b") faults.push(\`\${where}: BDB's entries on a row of a source the parting does not read\`);
`,
   `        if (Array.isArray(f.b) && FACT_OF.get(m) !== "b") faults.push(\`\${where}: BDB's entries on a row of a source the parting does not read\`);
        if ("opens" in f && (typeof f.opens !== "string" || !/^\\S+( \\S+)?$/u.test(f.opens))) faults.push(\`\${where}: opens is not an entry and its point\`);
`],
]);
