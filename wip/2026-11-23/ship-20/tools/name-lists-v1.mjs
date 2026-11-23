// Synthesis lane · the names gate's lists as their pin names them: the rows of every list that marks a row, and the places with the corpus lane's addition laid on names v1's list
// GUARDS: names-gate-rule-v1-a-row-its-own-source-gives-as-a-name-is-withheld-where-the-word-on-the-page-is-not-a-name
// LEDGER: -
// no frame letter. It reads the lists data/names/PIN.json names and writes
// nothing.
//
// THE NAME ROWS COME FROM MORE THAN ONE LIST (ship 20, 23 November 2026).
// Names v2 (relay v198, 20 November 2026) lists the served rows whose every
// entry its own source marks a name: 21,292 rows read at one store. Rows
// landed since were never read for it, so they stood at every place whatever
// their source says. The corpus lane marks them by the same rule, list by
// list, each with its own rule and receipt:
//
//   relay v213 (21 November 2026)   the rows relays v200, v201 and v202
//       landed, read by names v2's rule unchanged: 22 rows, every one TAHOT's
//       (M4), a name by TAHOT's own grammar on the line its record names.
//       Its receipt names the store it read them at, and each line names its
//       row by key, rank, m id and sha16, as names v2's lines do.
//   relay v219 (22 November 2026)   the translation tables' rows (M78,
//       M103), read by their English entry's own part of speech: 6 rows of
//       the 126 table lines relay v210 keeps, which ships 16 and 18 landed.
//       Its letter: «lay `name: 1` on each row they name, joined by `k`, `m`
//       and `sha` (the route's)». The lane read no served store for these
//       lines, so a line names no rank to follow and its row is found by key,
//       m id and sha16 in the store as it stands, exactly one row or a fault.
//       Its 832 rows of STEP's expanded Strong (M51) wait with their lines,
//       which have not landed (the owner's word), and are not read here.
//
// So each list of rows says how its lines find their row (`join` in the
// pin): by key, rank, m id and sha16, followed through the row-strikes
// record from the store its own receipt names (tools/row-strikes-follow-v1.mjs);
// or by key, m id and sha16 in the store as it stands. A row is listed once
// over every list.
//
// THE PLACES ARE NAMES V1'S LIST WITH THE LANE'S ADDITION LAID ON IT (relay
// v219, 22 November 2026). Names v1 (relay v177) read TAHOT's grammar on the
// lines word numbering v1 tied to each place. At 7 places of the spelling
// bridge that numbering tied none, so names v1 never read TAHOT there; at 1
// of them neither witness named the place and it was not listed: Ezekiel
// 27:6 word 11, «Kittim», which TAHOT marks a place's name. Once v213's row
// of it carried the mark, the gate would have held it back at the one place
// it was landed for. The lane's addition (places-v1.1-additions.jsonl), laid
// as its letter's section 1 says, and names v1's file is not rewritten:
//
//   ADDED          the place goes in between the two lines of names v1 its
//                  `beside` names, in names v1's line shape (book, place,
//                  address, by);
//   WITNESS_ADDED  names v1's line its `names_v1` names takes the `by` the
//                  addition gives, every witness names v1 gave it kept.
//
// The list then holds 34,578 places (names v1's 34,577 and 1), 33,847 with
// TAHOT among the witnesses. Anything else in the addition is refused in
// words: a change of another kind, a line of names v1 that is not the place,
// a witness taken off, a place listed twice.
//
//   nameRowLists(dir, pin) -> [{ relay, letter, folder, rule, receipt, rows,
//       theirs, lines, join, readAt, main }]  every list of rows the pin
//       names, names v2's first (main); rows is the list's pin entry, theirs
//       its receipt read, readAt the store its lines are followed from (null
//       where they are joined in the store as it stands)
//   namePlaces(dir, pin) -> { v1, additions, laid, added, witnessAdded,
//       addition, theirs }  names v1's lines, the addition's, and the list as
//       laid (names v1's where the pin names no addition); addition is its
//       pin entry, theirs its receipt read
//   rowIdOf(line, join)   how a line names its row: "k rank m sha" or "k m sha"
// Each throws PinFault, in words.
import { join as joinPath } from "node:path";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";

export const NAMES_HOME = "reader/data/names";
// the two ways a list's lines name their row (the pin's `join.by`)
export const JOIN_FOLLOWED = ["k", "rank", "m", "sha"];
export const JOIN_AS_IT_STANDS = ["k", "m", "sha"];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** How a line names its row under its list's join, as one string. */
export const rowIdOf = (l, by) => by.map((f) => String(l[f])).join("\u0001");

// one list of rows: its rule, its receipt and its lines, each the bytes the pin names, and how its lines find their row
const listOf = (dir, e, { relay, letter, folder, main }) => {
  for (const k of ["rule", "receipt", "name_rows"]) if (!e[k] || !e[k].file) throw new PinFault(`the names pin names no ${k} for the rows of relay ${relay}`);
  readPinned(joinPath(dir, folder, e.rule.file), e.rule, `${folder}/${e.rule.file}`);
  const theirs = JSON.parse(readPinned(joinPath(dir, folder, e.receipt.file), e.receipt, `${folder}/${e.receipt.file}`).toString("utf8"));
  const lines = readPinnedLines(joinPath(dir, folder, e.name_rows.file), e.name_rows, `${folder}/${e.name_rows.file}`);
  // names v2 names no join: its lines are followed from the store its receipt names, as since ship 11
  const j = main ? { by: JOIN_FOLLOWED, followed: true } : e.join || null;
  if (!j || !(same(j.by, JOIN_FOLLOWED) || same(j.by, JOIN_AS_IT_STANDS)) || (j.followed === true) !== same(j.by, JOIN_FOLLOWED)) throw new PinFault(`the names pin says of the rows of relay ${relay} no join this reading knows: by key, rank, m id and sha16, followed from the store the lane's receipt names; or by key, m id and sha16 in the store as it stands`);
  const readAt = j.followed ? (((theirs.inputs || {}).route_store || {}).store_version) || null : null;
  if (j.followed && !readAt) throw new PinFault(`the lane's receipt of relay ${relay} names no store its rows were read at, so its lines cannot be followed`);
  return { relay, letter, folder, rule: e.rule, receipt: e.receipt, rows: e.name_rows, theirs, lines, join: j.by, readAt, main };
};

/** Every list of name rows the pin names: names v2's first, then each of `more_name_rows` in the pin's order. */
export const nameRowLists = (dir, pin) => {
  if (!pin || pin.schema_version !== "NAMES_PIN_V1" || !pin.name_rows || !pin.rule || !pin.receipt) throw new PinFault("the names pin names no list of name rows with its rule and receipt");
  const out = [listOf(dir, pin, { relay: pin.relay, letter: pin.letter, folder: pin.folder, main: true })];
  const more = pin.more_name_rows === undefined ? [] : pin.more_name_rows;
  if (!Array.isArray(more)) throw new PinFault("the names pin's more_name_rows is not a list");
  for (const e of more) {
    if (!e || !e.relay || !e.folder) throw new PinFault("the names pin names a list of name rows with no relay or folder");
    out.push(listOf(dir, e, { relay: e.relay, letter: e.letter, folder: e.folder, main: false }));
  }
  return out;
};

/** The name places: names v1's list, and with the pin's addition laid on it as relay v219's letter says. */
export const namePlaces = (dir, pin) => {
  if (!pin || pin.schema_version !== "NAMES_PIN_V1" || !pin.place_names) throw new PinFault("the names pin names no list of name places");
  const P = pin.place_names, folder = P.folder || pin.folder;
  const v1 = readPinnedLines(joinPath(dir, folder, P.file), P, `${folder}/${P.file}`);
  const A = P.additions;
  if (!A) return { v1, additions: [], laid: v1, added: 0, witnessAdded: 0, addition: null, theirs: null };
  for (const k of ["folder", "file", "rule", "receipt"]) if (!A[k]) throw new PinFault(`the names pin names no ${k} for the addition to the list of name places`);
  readPinned(joinPath(dir, A.folder, A.rule.file), A.rule, `${A.folder}/${A.rule.file}`);
  const theirs = JSON.parse(readPinned(joinPath(dir, A.folder, A.receipt.file), A.receipt, `${A.folder}/${A.receipt.file}`).toString("utf8"));
  const additions = readPinnedLines(joinPath(dir, A.folder, A.file), A, `${A.folder}/${A.file}`);
  const idOf = (l) => `${l.book} ${l.place}`;
  const listed = new Map(v1.map((l, i) => [idOf(l), i]));
  const by = v1.map((l) => l.by);              // names v1's witnesses, line by line, as laid
  const after = new Map();                      // names v1's line index -> the places put in after it
  let added = 0, witnessAdded = 0;
  additions.forEach((a, at) => {
    const where = `${A.file} line ${at + 1} (${a && a.book} ${a && a.place})`;
    if (!a || typeof a.book !== "string" || typeof a.place !== "string" || typeof a.address !== "string" || !Array.isArray(a.by) || !a.by.length) throw new PinFault(`${where} is not a book, a place, an address and the witnesses that say so`);
    if (a.change === "WITNESS_ADDED") {
      const n = a.names_v1 && Number.isInteger(a.names_v1.line) ? a.names_v1.line : null;
      const l = n ? v1[n - 1] : null;
      if (!l || idOf(l) !== idOf(a) || l.address !== a.address || !same(l.by, a.names_v1.by)) throw new PinFault(`${where}: names v1's line ${n} is not this place as the addition reads it`);
      if (by[n - 1] !== l.by) throw new PinFault(`${where}: names v1's line ${n} is given witnesses twice`);
      if (l.by.some((w) => !a.by.includes(w)) || a.by.length <= l.by.length) throw new PinFault(`${where}: gives ${JSON.stringify(a.by)} where names v1 gives ${JSON.stringify(l.by)}; a witness is added, none taken off`);
      by[n - 1] = a.by; witnessAdded += 1;
    } else if (a.change === "ADDED") {
      const b = a.beside || {}, x = b.before || {}, y = b.after || {};
      if (a.names_v1 !== null || listed.has(idOf(a))) throw new PinFault(`${where}: an added place is one names v1 lists already`);
      if (!Number.isInteger(x.line) || y.line !== x.line + 1 || !v1[x.line - 1] || !v1[y.line - 1] || v1[x.line - 1].place !== x.place || v1[y.line - 1].place !== y.place || !same(v1[x.line - 1].by, x.by) || !same(v1[y.line - 1].by, y.by)) throw new PinFault(`${where}: the two lines of names v1 it goes in between are not names v1's lines ${x.line} and ${y.line} as it reads them`);
      (after.get(x.line - 1) || after.set(x.line - 1, []).get(x.line - 1)).push({ book: a.book, place: a.place, address: a.address, by: a.by });
      listed.set(idOf(a), -1); added += 1;
    } else throw new PinFault(`${where}: a change of the kind ${JSON.stringify(a.change)}, which the letter does not name`);
  });
  const laid = [];
  v1.forEach((l, i) => { laid.push(by[i] === l.by ? l : { ...l, by: by[i] }); for (const p of after.get(i) || []) laid.push(p); });
  return { v1, additions, laid, added, witnessAdded, addition: A, theirs };
};
