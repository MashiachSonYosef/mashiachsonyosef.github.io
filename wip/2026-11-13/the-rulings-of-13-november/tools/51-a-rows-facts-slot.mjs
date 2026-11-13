// A row gets a slot for what the corpus lane's ledgers say of it (its entry's numbers; later, that it is a name), and
// every tool that sets or clears one of a row's optional slots does it through one function, so none shortens a row
// past a slot that is another tool's.
// node 51-a-rows-facts-slot.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "gloss-store-v1.mjs"), [
  [`export const recordPrinted = (row) => (row[2] ? closed(String(row[2]), closesOf(row, 2)) : routePrinted(row));
`,
   `export const recordPrinted = (row) => (row[2] ? closed(String(row[2]), closesOf(row, 2)) : routePrinted(row));
// WHAT THE CORPUS LANE'S LEDGERS SAY OF A ROW RIDES ON THE ROW (13 November
// 2026): slot 10, an object, each key written by the tool of its own ledger
// and by no other. Its keys so far:
//   n     the Strong's numbers of the entries its own source files the row
//         under ("H1254"), as the row entries ledger gives them (relay v172)
//   t     for a row whose entries are STEP's own tags, those of them that
//         carry STEP's letter ("H1254A")
//   b     for a row of a source that names BDB's own entries, those entries
//   name  1 where every entry its own source gives the row is a name (relay
//         v177)
// A row with none of these carries no such slot. The texts are not touched.
export const FACTS_SLOT = 10;
export const factsOf = (row) => { const f = row.length > FACTS_SLOT ? row[FACTS_SLOT] : null; return f && typeof f === "object" && !Array.isArray(f) ? f : null; };
// A ROW'S SLOTS PAST ITS SEVENTH ARE OPTIONAL AND STAND BY POSITION. One is
// set by filling the slots before it with null, and taken off by setting it
// null and dropping every null the row then ends in, never below the seven
// slots every row holds.
export const setSlot = (row, at, value) => {
  if (value === null || value === undefined) { if (row.length > at) row[at] = null; }
  else { while (row.length < at) row.push(null); row[at] = value; }
  while (row.length > 7 && row[row.length - 1] === null) row.length -= 1;
  return row;
};
// some of a row's facts set (a value) or taken off (null). The keys are kept in one order, so a row's bytes do not
// depend on which tool wrote first
export const setFacts = (row, facts) => {
  const now = { ...(factsOf(row) || {}) };
  for (const [k, v] of Object.entries(facts)) { if (v === null || v === undefined) delete now[k]; else now[k] = v; }
  const keys = Object.keys(now).sort();
  return setSlot(row, FACTS_SLOT, keys.length ? Object.fromEntries(keys.map((k) => [k, now[k]])) : null);
};
`],
]);
