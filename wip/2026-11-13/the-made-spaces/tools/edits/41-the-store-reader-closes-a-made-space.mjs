// A space our own build put where a tag stood closes at print (made-spaces-rule-v1; the corpus lane's relay v168).
// The store reader is where a row's texts become what prints, so the rule stands there once: `closed` takes the
// characters at a row's closes out, `routePrinted` and `recordPrinted` are a row's two texts as they print, and
// `readingsOf` gives each piece the closes that fall inside it. A text the corpus lane shipped is still looked for
// in the served bytes, which is what the lane wrote it in.
// node 41-the-store-reader-closes-a-made-space.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "gloss-store-v1.mjs"), [
  // the rule's own names, beside the printed form they feed
  [`export const readingKey = (t) => printedForm(t).toLowerCase();
`,
   `export const readingKey = (t) => printedForm(t).toLowerCase();
// MADE SPACES CLOSE AT PRINT (made-spaces-rule-v1, 13 November 2026). Our own
// build put one space where each tag of a provider's XML stood, so the store
// serves «Amos , an Israelite prophet» where the provider wrote «Amos, an
// Israelite prophet». The corpus lane traced every such space and listed the
// places that close (relay v168; data/made-spaces-v1/), and
// tools/apply-made-spaces-v1.mjs writes them on the row, in slot 9: [the
// route text's closes or null, the definition text's or null], UTF-16 units
// from 0, rising. The texts stay the served bytes, because every list, ledger
// and lattice names a row by them; the characters at those places are taken
// out here, where a text is printed. The page carries the same three
// functions under the same names.
export const MADE_SPACES_RULE_ID = "made-spaces-rule-v1-a-space-our-build-put-where-a-tag-stood-closes-at-print-as-the-corpus-lanes-list-names-it";
export const CLOSES_SLOT = 9;
/** \`text\` from \`from\` to \`to\` with the characters at \`places\` left out. */
export const closed = (text, places, from = 0, to = text.length) => {
  let out = "", at = from;
  for (const c of places || []) if (c >= at && c < to) { out += text.slice(at, c); at = c + 1; }
  return out + text.slice(at, to);
};
const closesOf = (row, field) => (Array.isArray(row[CLOSES_SLOT]) ? row[CLOSES_SLOT][field - 1] : null) || null;
/** A row's route text as it prints, and its record: the definition text, or the route where it has none. */
export const routePrinted = (row) => closed(String(row[1] ?? ""), closesOf(row, 1));
export const recordPrinted = (row) => (row[2] ? closed(String(row[2]), closesOf(row, 2)) : routePrinted(row));
`],
  // the rule's text, as the zones' receipts carry it
  [`  "a source with no ledger is one reading as written, whole, until its ledger lands (7 November 2026); " +
`,
   `  "a source with no ledger is one reading as written, whole, until its ledger lands (7 November 2026); " +
  "a space our own build made in a text closes where the text prints, at the places its row names (row[9]; made-spaces-rule-v1); " +
`],
  // the readings of a row: each piece takes the closes that fall inside it
  [`  const readingsOf = (row) => {
    const text = String(row[1] ?? "");
    if (!ledgerOf(row[3])) { const t = text.trim(); return t ? [t] : []; }
    // the print slot (ledger-division-rule-v2): where the row's ledger and the
    // owner's answer say the row prints a part of itself, or no pill, row[8]
    // holds the texts ([] for no pill), and the row prints those and nothing else
    if (Array.isArray(row[8])) return row[8].map((x) => String(x));
    const cuts = Array.isArray(row[7]) ? row[7] : [];
    if (!cuts.length) { const t = text.trim(); return t ? [t] : []; }
    const pieces = []; let from = 0;
    for (const i of cuts) { pieces.push(text.slice(from, i)); from = i + 1; }
    pieces.push(text.slice(from));
    return pieces.map((x) => x.trim()).filter(Boolean);
  };
`,
   `  // \`shut\` is the made spaces of the route text that close (made-spaces-rule-v1):
  // the row's own for what prints, none for the pieces of the served bytes
  const readingsWith = (row, shut) => {
    const text = String(row[1] ?? "");
    if (!ledgerOf(row[3])) { const t = closed(text, shut).trim(); return t ? [t] : []; }
    // the print slot (ledger-division-rule-v2): where the row's ledger and the
    // owner's answer say the row prints a part of itself, or no pill, row[8]
    // holds the texts ([] for no pill), and the row prints those and nothing else
    if (Array.isArray(row[8])) return row[8].map((x) => String(x));
    const cuts = Array.isArray(row[7]) ? row[7] : [];
    if (!cuts.length) { const t = closed(text, shut).trim(); return t ? [t] : []; }
    const pieces = []; let from = 0;
    for (const i of cuts) { pieces.push(closed(text, shut, from, i)); from = i + 1; }
    pieces.push(closed(text, shut, from));
    return pieces.map((x) => x.trim()).filter(Boolean);
  };
  const readingsOf = (row) => readingsWith(row, closesOf(row, 1));
`],
  // a text the lane shipped is in the served bytes, so it is looked for among the row's pieces as served
  [`   *  hold it. null where no served row accounts for the text. (The code review of 6 November 2026: an exact`,
   `   *  hold it, read in the served bytes as the lane's text is (a made space
   *  closes only where a text prints). null where no served row accounts for the text. (The code review of 6 November 2026: an exact`],
  [`    const holds = (list) => list.find((r) => readingsOf(r).some((x) => readingKey(x) === tk)) || null;`,
   `    const holds = (list) => list.find((r) => readingsWith(r, null).some((x) => readingKey(x) === tk)) || null;`],
]);
