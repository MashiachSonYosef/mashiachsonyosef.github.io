// The lattice sidecar carries a key's row stems only where a card of the book can ask them
// (stems-carried-rule-v1, tools/stems-carried-v1.mjs). Nothing the page draws or withholds moves; the
// sidecars lose the stems of keys no card asks.
// node 84-the-sidecar-carries-the-stems-a-card-can-ask.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "project-lattice-v12-v1.mjs"), [
  [`import { readStemsExtension, stemsId, STEMS_EXTENSION_RULE_ID, STEMS_EXTENSION_HOME } from "./stems-extension-v1.mjs";
`,
   `import { readStemsExtension, stemsId, STEMS_EXTENSION_RULE_ID, STEMS_EXTENSION_HOME } from "./stems-extension-v1.mjs";
import { STEMS_CARRIED_RULE_ID, keysAskedWithStems } from "./stems-carried-v1.mjs";
`],
  // the extension's rows, remembered by key, so its count can be of the rows the sidecar carries
  [`let extensionSaid = null;   // what the sidecar says of the extension, or null where none was read
`,
   `let extensionSaid = null;   // what the sidecar says of the extension, or null where none was read
const extensionIdsByKey = new Map();   // key -> the ids of its rows the extension gave stems
`],
  [`    held[id] = l.stems;
    given += 1;
`,
   `    held[id] = l.stems;
    if (!extensionIdsByKey.has(l.key)) extensionIdsByKey.set(l.key, new Set());
    extensionIdsByKey.get(l.key).add(id);
    given += 1;
`],
  // the stems carried: the keys a card can ask, from the finished grades and the zone's own words
  [`// ---- the sidecar ----------------------------------------------------------
`,
   `// ---- the stems carried -----------------------------------------------------
// THE STEMS A CARD CAN ASK (stems-carried-rule-v1, tools/stems-carried-v1.mjs):
// a key's rows' stems where a card of this book or a leader baked here asks
// them, and nothing else. The leaders above were baked from every key's.
const keysAsked = keysAskedWithStems(zone, grades);
const stemsCarried = {};
const stemsCarriedSaid = { rule: STEMS_CARRIED_RULE_ID, keys_with_stems: 0, keys_carried: 0, rows_with_stems: 0, rows_carried: 0 };
for (const [k, held] of Object.entries(stemsByKey)) {
  const n = Object.keys(held).length;
  stemsCarriedSaid.keys_with_stems += 1;
  stemsCarriedSaid.rows_with_stems += n;
  if (!keysAsked.has(k)) continue;
  stemsCarried[k] = held;
  stemsCarriedSaid.keys_carried += 1;
  stemsCarriedSaid.rows_carried += n;
}
// the extension's count is of the rows the sidecar carries; the rows it named on this book's keys are said beside it
if (extensionSaid) {
  let carried = 0;
  for (const [k, ids] of extensionIdsByKey) if (keysAsked.has(k)) carried += ids.size;
  extensionSaid.rows_named_on_this_books_keys = extensionSaid.rows_given_stems_in_this_book;
  extensionSaid.rows_given_stems_in_this_book = carried;
}

// ---- the sidecar ----------------------------------------------------------
`],
  [`stems: stemsByKey, binyan: { rule: STEM_FAMILY_RULE_ID, files: binyanFiles,`,
   `stems: stemsCarried, binyan: { rule: STEM_FAMILY_RULE_ID, files: binyanFiles, carried: stemsCarriedSaid,`],
  [`stems[key]: the known stems of each row on the key, by m, rank and route: the store's rows, and where the extension was read the rows of the dictionary beside the store that it names; a row not listed has no known stem"`,
   `stems[key]: the known stems of each row on a key a card of this book asks them under (carried, stems-carried-rule-v1: a word's, a read half's or a piece's key whose pointed surface has a known stem here, or a graded surface's own key with one), by m, rank and route: the store's rows, and where the extension was read the rows of the dictionary beside the store that it names; on a key carried, a row not listed has no known stem"`],
]);
