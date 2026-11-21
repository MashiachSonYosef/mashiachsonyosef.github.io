// Synthesis lane · the one reading of the corpus lane's delta over lattice v12 (relay v208): the names and the grades a listed entry takes
// GUARDS: lattice-delta-rule-v1-a-listed-entry-of-the-lattice-takes-the-corpus-lanes-own-later-names-and-grades-and-every-other-entry-stands-as-the-lattice-has-it
// LEDGER: -
// no frame letter. The one reading of the corpus lane's lattice delta: it
// reads the pinned files and the lists they name, and writes nothing.
//
// A LISTED ENTRY OF THE LATTICE TAKES THE CORPUS LANE'S OWN LATER NAMES AND
// GRADES, AND EVERY OTHER ENTRY STANDS AS THE LATTICE HAS IT.
//
// Lattice v12 grades every card of every position against the word as the
// text points it, and says which cards name the verse. Two things in it were
// behind this lane's page (the letters of 16 and 17 November 2026 AD):
//
//   the names   v12 read only TAHOT's verses, and not the 21,917 TAHOT rows
//               whose verse carries a second number in brackets, and none of
//               MACULA's. So "cites here" named no MACULA reading at all, and
//               a reading TAHOT gives at eight verses was named at one.
//   the grades  the lattice graded a card by the first pointing grade. The
//               page grades a row by pointing grade v5 (a word-initial dagesh
//               lene, qamats qatan, a shureq, the joining dagesh set aside),
//               and a row that carries no headwords of its own falls to its
//               card's grade in the lattice: the old one.
//
// The corpus lane's relay v208 (Moses, 20 November 2026 AD) writes no new
// lattice. It lists, keyed to v12's own lines by book, position (j) and
// entry: for each entry that gains a name, the whole widened list of the
// cards that name the verse; and for each entry some card of which the
// page's rule grades otherwise, each such card with its grade in the lattice
// and its grade by the page's rule. A third list, the places whose core
// carries no tag with the entries of MACULA's lemma, lands nothing here: the
// projection writes those entries itself, from the store as served.
//
// The rule and the receipts are kept under data/lattice-delta/ byte for
// byte, named by their pin. The lists stay on the lane's store, as the
// lattice does; a tool is handed their folder and reads each only as the
// bytes the pin names.
//
// WHAT THE PROJECTION DOES WITH A LISTED ENTRY, said here once for the tool
// that applies it (tools/project-lattice-v12-v1.mjs) and the check that holds
// it (tools/check-lattice-delta-v1.mjs):
//
//   names    the entry's list of the cards that name its verse is the
//            delta's, whole. The delta's line is the lattice's entry: the
//            position's own verse and surface (the names list writes the
//            whole place, both halves of a place written one way and read
//            another), the entry's own reading (the form, or a written or a
//            read half) and key, and every name the lattice gave it is still
//            in the list (namesFault).
//   grades   (the grades list writes the entry's own surface, the half it
//            grades) each card the line names moves from the grade the lattice gave
//            it, which must be the grade the line says the lattice gave it,
//            to the page's (gradesFault). A grade is a fact about a pointed
//            surface and repeats wherever the surface does, so the lines of
//            one surface under one key name the same cards (sameChanges).
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { readPinned, sha256Of, PinFault } from "./pinned-v1.mjs";

export const LATTICE_DELTA_RULE_ID = "lattice-delta-rule-v1-a-listed-entry-of-the-lattice-takes-the-corpus-lanes-own-later-names-and-grades-and-every-other-entry-stands-as-the-lattice-has-it";
export const LATTICE_DELTA_HOME = "data/lattice-delta";
export const LATTICE_DELTA_LISTS = ["names_this_verse", "grade_v5", "untagged_places"];
export const GRADES = ["VOWEL_MATCH", "NORMALIZED", "VOWEL_MISMATCH"];

/** The pin, with its rule and its two receipts read only as the bytes it
 *  names, and the lane's receipt held to name each list by the pin's bytes.
 *  Throws PinFault, in words. */
export const readLatticeDeltaPin = (pinPath) => {
  if (!existsSync(pinPath)) throw new PinFault(`${pinPath} is not here`);
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  if (pin.schema_version !== "LATTICE_DELTA_PIN_V1") throw new PinFault(`${pinPath}: schema ${pin.schema_version}, not LATTICE_DELTA_PIN_V1`);
  for (const k of ["rule", "receipt", "verify_receipt"]) if (!pin[k] || !pin[k].file) throw new PinFault(`${pinPath} names no ${k}`);
  const take = (d) => readPinned(join(dirname(pinPath), pin.folder, d.file), d, `${pin.folder}/${d.file}`);
  take(pin.rule);
  const receipt = JSON.parse(take(pin.receipt).toString("utf8"));
  const verify = JSON.parse(take(pin.verify_receipt).toString("utf8"));
  const said = new Map((Array.isArray(receipt.outputs) ? receipt.outputs : []).map((o) => [o.file, o]));
  for (const k of LATTICE_DELTA_LISTS) {
    const d = (pin.lists || {})[k];
    if (!d || !d.file || !Number.isInteger(d.lines) || typeof d.lands !== "boolean") throw new PinFault(`${pinPath} names no list ${k} with its lines and whether it lands`);
    const o = said.get(d.file);
    if (!o || o.bytes !== d.bytes || o.sha256 !== d.sha256) throw new PinFault(`the lane's receipt names ${d.file} as ${o ? `${o.bytes} bytes, ${String(o.sha256).slice(0, 12)}` : "nothing"}, and the pin as ${d.bytes} bytes, ${String(d.sha256).slice(0, 12)}`);
  }
  return { pin, receipt, verify };
};

/** Whether a list of the pin lands. */
export const lands = (pin, k) => !!((pin.lists || {})[k] || {}).lands;

// a list's lines, the file read only as the bytes the pin names: [raw line], the last line end taken off
const rawLines = (dir, d) => {
  const p = join(dir, d.file);
  if (!existsSync(p)) throw new PinFault(`${d.file} is named in the lattice delta's pin and is not in ${dir}`);
  const bytes = readFileSync(p);
  const sha = sha256Of(bytes);
  if (bytes.length !== d.bytes || sha !== d.sha256) throw new PinFault(`${d.file} is not the bytes its pin names (${bytes.length} bytes, ${sha}; the pin: ${d.bytes}, ${d.sha256})`);
  const text = (/\.gz$/u.test(d.file) ? gunzipSync(bytes) : bytes).toString("utf8");
  if (!text.endsWith("\n")) throw new PinFault(`${d.file} does not end in a line end`);
  const raw = text.slice(0, -1).split("\n");
  if (raw.length !== d.lines) throw new PinFault(`${d.file} holds ${raw.length} lines and its pin says ${d.lines}`);
  return raw;
};
// the lines of one book, parsed; a line opens with its book, as the lane writes it
const linesOf = (raw, book, name) => {
  const head = `{"book":${JSON.stringify(book)},`;
  const out = [];
  for (const [at, s] of raw.entries()) {
    if (!s.startsWith('{"book":"')) throw new PinFault(`${name} line ${at + 1} does not open with its book`);
    if (!s.startsWith(head)) continue;
    try { out.push(JSON.parse(s)); } catch (e) { throw new PinFault(`${name} line ${at + 1} is not JSON (${e.message})`); }
  }
  return out;
};

/** One book's lines of the lists, each list's file read only as the bytes
 *  the pin names:
 *    names    Map(j -> Map(entry -> line)), the entries that gain a name
 *    spans    the lines for a span card (the lattice's own span cards, which
 *             this lane's projection does not read: counted, never applied)
 *    grades   Map(j -> Map(entry -> line)), the entries with a card graded otherwise
 *    untagged the untagged places' lines (read where `withUntagged`)
 *  and `listed`, each list's count of lines for the book. A list the pin does
 *  not land is not read, but for the untagged places where asked. Throws
 *  PinFault, in words, where a file is not its pin's bytes or two lines name
 *  one entry. */
export const readLatticeDelta = (pinPath, dir, book, { withUntagged = false } = {}) => {
  const { pin, receipt, verify } = readLatticeDeltaPin(pinPath);
  const byEntry = (lines, name) => {
    const m = new Map(), spans = [];
    for (const l of lines) {
      if (l.span !== undefined) { spans.push(l); continue; }
      if (!Number.isInteger(l.j) || !Number.isInteger(l.entry)) throw new PinFault(`${name}: a line of ${book} ${l.ref} names no position and entry`);
      const at = m.get(l.j) || m.set(l.j, new Map()).get(l.j);
      if (at.has(l.entry)) throw new PinFault(`${name}: two lines name entry ${l.entry} of ${book} position ${l.j}`);
      at.set(l.entry, l);
    }
    return { m, spans };
  };
  const out = { pin, receipt, verify, names: new Map(), spans: [], grades: new Map(), untagged: [], listed: {} };
  if (lands(pin, "names_this_verse")) {
    const d = pin.lists.names_this_verse, lines = linesOf(rawLines(dir, d), book, d.file);
    const { m, spans } = byEntry(lines, d.file);
    out.names = m; out.spans = spans; out.listed.names_this_verse = lines.length;
  }
  if (lands(pin, "grade_v5")) {
    const d = pin.lists.grade_v5, lines = linesOf(rawLines(dir, d), book, d.file);
    const { m, spans } = byEntry(lines, d.file);
    if (spans.length) throw new PinFault(`${d.file}: a line of ${book} grades a span card, and the lane compares none`);
    out.grades = m; out.listed.grade_v5 = lines.length;
  }
  if (withUntagged) { const d = pin.lists.untagged_places; out.untagged = linesOf(rawLines(dir, d), book, d.file); out.listed.untagged_places = out.untagged.length; }
  return out;
};

// the same list of whole numbers, in order
const sameInts = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

// why a line is not the entry of the position it names: the position's verse and surface, the entry's reading and key
const entryFault = (line, { ref, surface, reading, key }) => (line.ref !== ref || line.surface !== surface || line.reading !== reading || line.key !== key
  ? `it names ${line.ref} ${line.surface}, the ${line.reading} under ${line.key}, and the lattice's entry is ${ref} ${surface}, the ${reading} under ${key}` : null);

/** Why a names line is not the lattice's entry, in words; null where it is.
 *  `ref` and `surface` are the position's, `reading` and `key` the entry's,
 *  and `was` is the list lattice v12 gives the entry. The line's list is
 *  whole numbers rising, holds every name v12 gave, and the names it adds are
 *  exactly the others. */
export const namesFault = (line, { ref, surface, reading, key, was }) => {
  const off = entryFault(line, { ref, surface, reading, key });
  if (off) return off;
  const list = line.names_this_verse;
  if (!Array.isArray(list) || !list.length || list.some((v, i) => !Number.isInteger(v) || v < 0 || (i > 0 && v <= list[i - 1]))) return "its list is not whole numbers rising";
  const old = Array.isArray(was) ? was : [];
  const lost = old.filter((v) => !list.includes(v));
  if (lost.length) return `the lattice names card(s) ${lost.join(", ")} here, and its list does not`;
  const added = list.filter((v) => !old.includes(v));
  if (!sameInts(added, line.added)) return `it says it adds ${JSON.stringify(line.added)}, and its list adds ${JSON.stringify(added)} to the lattice's`;
  return null;
};

/** Why a grades line is not the lattice's entry, in words; null where it is.
 *  `surface` is the entry's own, as the grades list writes it. `gradeOf(ix)` is the grade lattice v12 gives card ix of the entry's key
 *  (one of GRADES, or null where it gives none). Each change is
 *  [card, the lattice's grade, the page's grade, the step], the cards rising,
 *  the two grades different, and the first the lattice's own. */
export const gradesFault = (line, { ref, surface, reading, key, gradeOf }) => {
  const off = entryFault(line, { ref, surface, reading, key });
  if (off) return off;
  const ch = line.changes;
  if (!Array.isArray(ch) || !ch.length) return "it names no card";
  for (const [i, c] of ch.entries()) {
    if (!Array.isArray(c) || !Number.isInteger(c[0]) || c[0] < 0 || !GRADES.includes(c[1]) || !GRADES.includes(c[2]) || c[1] === c[2]) return `change ${i + 1} is not a card with its two grades`;
    if (i > 0 && c[0] <= ch[i - 1][0]) return "its cards do not rise";
    const has = gradeOf(c[0]);
    if (has !== c[1]) return `it says the lattice grades card ${c[0]} ${c[1]}, and the lattice grades it ${has === null ? "nothing" : has}`;
  }
  return null;
};

/** Whether two grades lines name the same cards with the same grades. */
export const sameChanges = (a, b) => {
  const x = (a && a.changes) || [], y = (b && b.changes) || [];
  return x.length === y.length && x.every((c, i) => c[0] === y[i][0] && c[1] === y[i][1] && c[2] === y[i][2]);
};
