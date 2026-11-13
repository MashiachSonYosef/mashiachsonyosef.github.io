// Synthesis lane · stems-extension-rule-v1-three-more-dictionaries-name-their-stems-as-the-owner-set-their-branches-and-a-row-beside-the-store-is-asked-its-stem-too
// LEDGER: -
// no frame letter. It reads the corpus lane's extension and the owner's
// pinned ruling on it, and writes nothing.
//
// THE STEMS OF THREE MORE DICTIONARIES.
//
// The binyan ledger's file 2 names the stems of the store's rows where BDB,
// TAHOT and MACULA say them. The corpus lane extended it (relay v173, 13
// November 2026) to the UBS dictionary and the SDBH, whose rows the store
// serves, and to Jastrow, whose rows stand in the dictionary beside the
// store: one line for every row of theirs on a verb's letters, in file 2's
// own format (m, key, rank, route, stems, basis), 31,487 lines. Its rule
// stands in data/stems-extension/, beside its receipt and a pin that names
// the file itself by its size and its sha256. The file is 7 MB and is kept on
// the corpus lane's store, as the two binyan files are; a tool or a check
// that reads it is given it by name and takes it only as the bytes the pin
// names.
//
// Two of its sources say less than their work knows, and the lane left each
// to the owner as a branch on the line:
//
//   the_ubs_edition   the SDBH as served names no stem. It is the same work
//                     as the UBS dictionary, and the branch holds the verdict
//                     of the UBS edition's meanings of the same entry with
//                     the same gloss, where there is one.
//   the_base_stem     Jastrow names a stem over each block of senses, and
//                     prints no name over the senses an entry gives first.
//                     By his order those are the base stem's (qal, or peal
//                     in an Aramaic entry), and the branch holds that.
//
// The owner set both (ruling 2 of 13 November 2026, «1-5. agree go ahead»:
// the_ubs_edition rests at THE_UBS_EDITION, the_base_stem at THE_BASE_STEM).
// The ruling is read from the lane's own pin of it (tools/rulings-v1.mjs),
// never from this file. How a setting is read:
//
//   a branch set to the option of its own name   the line takes the verdict
//                     it carries under that name (stems and basis), where
//                     that verdict is not null; where it is null the line
//                     stands as its source wrote it
//   a branch set to NONE   the line stands as its source wrote it
//   any other setting, or a branch no pinned ruling sets   refused, in words
//
// A line whose stems are known gives them to its row by the row's own m,
// rank and route under its key, as file 2's lines do. A row beside the store
// is a row like the store's (overlay-rule-v2), so the page asks it its stem
// as it asks the store's rows: a reading whose stems are known and share no
// family with the word's is withheld under "only" and counted with the rest.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { rulingsPinned, rulingOf, cited } from "./rulings-v1.mjs";

export const STEMS_EXTENSION_RULE_ID = "stems-extension-rule-v1-three-more-dictionaries-name-their-stems-as-the-owner-set-their-branches-and-a-row-beside-the-store-is-asked-its-stem-too";
const HERE = dirname(fileURLToPath(import.meta.url));
export const STEMS_EXTENSION_DIR = join(HERE, "..", "data", "stems-extension");
export const STEMS_EXTENSION_HOME = "reader/data/stems-extension";   // the same folder as a record names it

/** The id a row's stems are kept under, beneath its key: the row's own m, rank and route. */
export const stemsId = (m, rank, route) => `${m}\u0001${rank}\u0001${route}`;

/** What a line gives its row under the settings: { stems, basis, by } where `by` names the branch that spoke, or null where the line stands as its source wrote it. */
export const verdictOf = (line, resting) => {
  const own = { stems: Array.isArray(line.stems) ? line.stems : [], basis: line.basis, by: null };
  const b = line.branch || null;
  if (!b) return own;
  if (typeof b.name !== "string" || !Array.isArray(b.options)) throw new PinFault(`a line under «${line.key}» carries a branch with no name or no options`);
  if (!resting.has(b.name)) throw new PinFault(`a line under «${line.key}» carries the branch ${b.name}, which no pinned ruling sets`);
  const set = resting.get(b.name);
  if (!b.options.includes(set)) throw new PinFault(`the ruling sets ${b.name} to ${set}, which is not one of the line's options (${b.options.join(", ")})`);
  if (set === "NONE") return own;
  if (set !== b.name.toUpperCase()) throw new PinFault(`the ruling sets ${b.name} to ${set}, a setting this lane has not been told how to read`);
  const v = b[b.name];
  if (v == null) return own;
  if (!Array.isArray(v.stems) || typeof v.basis !== "string") throw new PinFault(`the branch ${b.name} on a line under «${line.key}» holds no stems or no basis`);
  return { stems: v.stems, basis: v.basis, by: b.name };
};

/** The extension as the corpus lane wrote it and as the owner set it: the pin, the lane's receipt, the ruling, and
 *  every line with what it gives its row. `file` is the lane's row-stems-extension file on this machine; a file that
 *  is not the bytes the pin names is refused (PinFault). */
export const readStemsExtension = (file, { dir = STEMS_EXTENSION_DIR, rulings = null } = {}) => {
  const pin = JSON.parse(readFileSync(join(dir, "PIN.json"), "utf8"));
  if (pin.schema_version !== "STEMS_EXTENSION_PIN_V1" || !pin.lines) throw new PinFault(`the pin names no file of lines (${join(dir, "PIN.json")})`);
  readPinned(join(dir, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
  const receipt = JSON.parse(readPinned(join(dir, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
  const raw = readPinnedLines(file, pin.lines, pin.lines.file);
  const ruling = rulingOf(rulings || rulingsPinned(), pin.lines.sha256, (r) => Array.isArray(r.branches), "the setting of the stems extension's branches");
  const resting = new Map(ruling.branches.map((b) => [b.name, b.resting]));
  const lines = raw.map((l, at) => {
    if (typeof l.m !== "string" || typeof l.key !== "string" || !Number.isInteger(l.rank) || typeof l.route !== "string") throw new PinFault(`${pin.lines.file} line ${at + 1} names no m, key, rank or route`);
    return { m: l.m, key: l.key, rank: l.rank, route: l.route, written: { stems: Array.isArray(l.stems) ? l.stems : [], basis: l.basis }, branch: l.branch ? l.branch.name : null, ...verdictOf(l, resting) };
  });
  return { pin, receipt, ruling, cited: cited(ruling), resting, lines };
};
