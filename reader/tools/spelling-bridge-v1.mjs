// Synthesis lane · the one reading of the corpus lane's spelling bridge (relay v202): the places whose pieces a zone carries
// GUARDS: spelling-bridge-rule-v1-where-our-text-spells-a-word-otherwise-and-step-names-our-spelling-the-place-reads-steps-own-words-for-it-cut-on-our-letters
// LEDGER: -
// no frame letter. The one reading of the corpus lane's spelling bridge: it
// reads the pinned files and a zone, and writes nothing.
//
// WHERE OUR TEXT SPELLS A WORD OTHERWISE AND STEP NAMES OUR SPELLING, THE
// PLACE READS STEP'S OWN WORDS FOR IT, CUT ON OUR LETTERS.
//
// At 1,173 places our text spells a word otherwise than the Leningrad text
// STEP and MACULA follow. Lattice v12 reads those two under their own
// spelling, so it gives such a place no reading and, at most of them, no
// pieces: the page had nothing of the place's own to draw. Until ship 11c
// (21 November 2026) the line there was bare and the page printed STEP's own
// words as a fill; once STEP's rows stood under our spelling the line was no
// longer bare, and the first row by rank led at every place of one spelling.
// Daniel 4:21 read 4:16's «O lord/ my», and I Samuel 26:7 read 26:11's
// «[is the] place of head/ his».
//
// The corpus lane's relay v202 (Moses, 20 November 2026 AD) lists every one
// of the places with its class and, at 1,035 of them, STEP's pieces cut onto
// our letters. It is kept byte for byte under data/spelling-bridge/, named
// by its pin. The pin says which classes are laid (`laid`) and why each of
// the others is not (`not_laid`): that is the page lane's decision, kept as
// data.
//
// WHAT A ZONE CARRIES FOR A LAID PLACE, said here once for the tool that
// writes it (tools/apply-spelling-bridge-v1.mjs) and the check that holds it
// (tools/check-spelling-bridge-v1.mjs):
//
//   pieces   the word carries the place's pieces (pg), each as a zone writes
//            a piece: its letters (ours, as the list cuts them), its English,
//            its source and its role. The English is STEP's own words for
//            the place as STEP writes them: the words of the one form row of
//            the same relay that is named for the place (landed, or listed
//            as not landed because the store already printed it), cut at the
//            stroke, each part kept as it is cut. The list's own English for
//            the piece is the same words with STEP's square and angle
//            brackets taken off, and is held equal to it, the brackets
//            aside. The reader draws the place's line from the pieces as it
//            does at every place that carries them (zone.html, placeLine).
//   tags     none are written. A zone's tag is the lattice's, and the place
//            keeps what it carries (the pin's `tags` says so and counts it).
//
// A place is found on its zone by its verse, its number among the verse's
// words (the marks not counted) and the lattice's surface, all three; it is
// a plain word under the list's key. Anything else is said in words and is
// the caller's to refuse or to count.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { lettersOf } from "./read-words-v1.mjs";

export const SPELLING_BRIDGE_RULE_ID = "spelling-bridge-rule-v1-where-our-text-spells-a-word-otherwise-and-step-names-our-spelling-the-place-reads-steps-own-words-for-it-cut-on-our-letters";
export const SPELLING_BRIDGE_HOME = "data/spelling-bridge";
export const SPELLING_BRIDGE_TOOL = "tools/apply-spelling-bridge-v1.mjs";
// how a zone names STEP's aligned translation as a piece's source
export const PIECE_SOURCE = "tahot";

/** The pin and the files it names, each read only as the bytes the pin names. Throws PinFault, in words. */
export const readBridge = (pinPath) => {
  if (!existsSync(pinPath)) throw new PinFault(`${pinPath} is not here`);
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  if (pin.schema_version !== "SPELLING_BRIDGE_PIN_V1") throw new PinFault(`${pinPath}: schema ${pin.schema_version}, not SPELLING_BRIDGE_PIN_V1`);
  if (pin.rule_id !== SPELLING_BRIDGE_RULE_ID) throw new PinFault(`${pinPath}: its rule_id is not ${SPELLING_BRIDGE_RULE_ID}`);
  for (const k of ["rule", "receipt", "places", "form_rows_not_landed"]) if (!pin[k] || !pin[k].file) throw new PinFault(`${pinPath} names no ${k}`);
  if (!pin.form_rows || !pin.form_rows.at) throw new PinFault(`${pinPath} names no form rows`);
  const home = dirname(pinPath);
  const take = (d, lines = false) => (lines ? readPinnedLines : readPinned)(join(home, pin.folder, d.file), d, `${pin.folder}/${d.file}`);
  take(pin.rule);
  const receipt = JSON.parse(take(pin.receipt).toString("utf8"));
  const landed = readPinnedLines(join(home, pin.form_rows.at), pin.form_rows, pin.form_rows.at);
  return { pin, receipt, places: take(pin.places, true), landed, notLanded: take(pin.form_rows_not_landed, true) };
};

/** Where the lane's receipt and the pin part: the receipt names the three lists by the pin's bytes and sha256. [] where they agree. */
export const receiptAgainst = ({ pin, receipt }) => {
  const out = [];
  const said = new Map((Array.isArray(receipt && receipt.outputs) ? receipt.outputs : []).map((o) => [o.file, o]));
  for (const [d, file] of [[pin.places, pin.places.file], [pin.form_rows_not_landed, pin.form_rows_not_landed.file], [pin.form_rows, String(pin.form_rows.at).split("/").pop()]]) {
    const o = said.get(file);
    if (!o || o.bytes !== d.bytes || o.sha256 !== d.sha256) out.push(`the lane's receipt names ${file} as ${o ? `${o.bytes} bytes, ${String(o.sha256).slice(0, 12)}` : "nothing"}, and the pin as ${d.bytes} bytes, ${String(d.sha256).slice(0, 12)}`);
  }
  return out;
};

// a class and its use, as one name
const kindOf = (cls, use) => `${cls} · ${use === null || use === undefined ? "no pieces" : use}`;
// STEP's words for a piece with its square and angle brackets taken off, the spaces closed: how the list writes a piece's English
const bracketsAside = (t) => String(t ?? "").replace(/[\[\]<>]/gu, "").replace(/\s+/gu, " ").trim();
const idOf = (book, place) => `${book} ${place}`;

/** The list read against the pin: the places the pin lays, each ready for a zone.
 *    { laid, counts, faults }
 *  `laid` holds, in the list's order, { book, ref, place, n, surface, key, words, tag, pieces }:
 *  the verse, the place as the list writes it (chapter:verse:word), the word's
 *  number in its verse, the lattice's surface, our letters, STEP's own words for
 *  the place (its form row's), the core piece's tag (kept for the record, never
 *  written) and the pieces as a zone writes a piece ({ k, g, s, r }).
 *  `counts` is the list by class and use, recounted. `faults` says, in words,
 *  every class the pin does not name or miscounts, and every laid place that is
 *  not as the rule above has it, and every reading the pin names that the list
 *  does not give. */
export const laidOf = ({ pin, places, landed, notLanded }) => {
  const faults = [], laid = [], counts = new Map();
  const lays = Array.isArray(pin.laid) ? pin.laid : [], leaves = Array.isArray(pin.not_laid) ? pin.not_laid : [];
  const named = new Map();
  for (const [list, lay] of [[lays, true], [leaves, false]]) for (const e of list) {
    const k = kindOf(e.class, e.use);
    if (named.has(k)) faults.push(`the pin names ${k} twice`);
    named.set(k, { lay, places: e.places });
  }
  // the form rows by the place they are named for
  const rowAt = new Map();
  for (const [rows, file] of [[landed, "the landed form rows"], [notLanded, pin.form_rows_not_landed.file]]) for (const [at, r] of rows.entries()) {
    if (typeof r.key !== "string" || typeof r.route !== "string" || !Array.isArray(r.places)) { faults.push(`${file} line ${at + 1}: names no key, words or places`); continue; }
    for (const p of r.places) (rowAt.get(idOf(p.book, p.place)) || rowAt.set(idOf(p.book, p.place), []).get(idOf(p.book, p.place))).push(r);
  }
  for (const [at, l] of places.entries()) {
    const where = `${pin.places.file} line ${at + 1} (${l.book} ${l.place})`;
    const k = kindOf(l.class, l.use);
    counts.set(k, (counts.get(k) || 0) + 1);
    const how = named.get(k);
    if (!how) { faults.push(`${where}: the pin names no ${k}`); continue; }
    if (!how.lay) continue;
    const L = l.lattice_v12 || {};
    const m = /^(\d+):(\d+):(\d+)$/u.exec(String(l.place || ""));
    if (!l.book || !l.ref || !m || `${m[1]}:${m[2]}` !== l.ref || typeof L.surface !== "string" || !L.surface) { faults.push(`${where}: names no book, verse, word number or lattice surface`); continue; }
    const given = Array.isArray(l.pieces) ? l.pieces : [];
    if (!given.length || given.some((x, i) => x.index !== i || x.source !== "TAHOT" || typeof x.consonants !== "string" || !x.consonants || lettersOf(x.consonants) !== x.consonants || lettersOf(x.hebrew) !== x.consonants
      || typeof x.english_tahot !== "string" || !x.english_tahot.trim() || typeof x.role !== "string" || !x.role)) { faults.push(`${where}: a piece is not STEP's, in order, with our letters, its English and its role`); continue; }
    if (typeof l.key_ours !== "string" || !l.key_ours || given.map((x) => x.consonants).join("") !== l.key_ours || lettersOf(l.our_form) !== l.key_ours || lettersOf(L.surface) !== l.key_ours) { faults.push(`${where}: its pieces, its form or the lattice's surface do not spell its key`); continue; }
    const rows = rowAt.get(idOf(l.book, l.place)) || [];
    if (rows.length !== 1) { faults.push(`${where}: ${rows.length} form rows are named for the place`); continue; }
    const row = rows[0];
    if (row.key !== l.key_ours) { faults.push(`${where}: its form row stands under another key`); continue; }
    const parts = row.route.split("/");
    if (parts.length !== given.length || parts.some((t, i) => !t.trim() || bracketsAside(t) !== bracketsAside(given[i].english_tahot))) { faults.push(`${where}: its form row reads «${row.route}», and its pieces ${given.map((x) => `«${x.english_tahot}»`).join(" ")}`); continue; }
    const cores = given.filter((x) => x.role === "core" && x.tag).map((x) => String(x.tag));
    laid.push({ book: l.book, ref: l.ref, place: l.place, n: Number(m[3]), surface: L.surface, key: l.key_ours, words: row.route, tag: cores.length === 1 ? cores[0] : cores.length ? cores : null,
      pieces: given.map((x, i) => ({ k: x.consonants, g: parts[i], s: PIECE_SOURCE, r: x.role })) });
  }
  for (const [k, how] of named) if ((counts.get(k) || 0) !== how.places) faults.push(`the pin counts ${how.places} place(s) of ${k}, and the list holds ${counts.get(k) || 0}`);
  for (const r of Array.isArray(pin.named_readings) ? pin.named_readings : []) {
    const p = laid.find((x) => x.book === r.book && x.place === r.place);
    if (!p || p.words !== r.reads) faults.push(`the pin names ${r.book} ${r.place} as «${r.reads}», and the list ${p ? `gives «${p.words}»` : "lays no such place"}`);
  }
  return { laid, counts, faults };
};

/** The word's number in its verse as the page counts words, the marks not counted. */
export const wordNumberOf = (sec, at) => (sec.words || []).slice(0, at + 1).filter((w) => !w.mark).length;

/** A laid place on its zone: { sec, si, at, word }, the section, its number,
 *  the word's number in the section's entries and the word; or { fault }, in words. */
export const findBridgePlace = (zone, place) => {
  const secs = (zone.sections || []).map((sec, si) => ({ sec, si })).filter((x) => x.sec.label === place.ref);
  if (secs.length !== 1) return { fault: `${secs.length} sections are labeled ${place.ref}` };
  const { sec, si } = secs[0];
  const words = sec.words || [];
  const at = words.findIndex((w, i) => !w.mark && wordNumberOf(sec, i) === place.n);
  if (at < 0) return { fault: `the verse holds no word ${place.n}` };
  const word = words[at];
  if (word.s !== place.surface) return { fault: `word ${place.n} is ${word.s}, and the lattice's surface is ${place.surface}` };
  if (!word.k || Array.isArray(word.w) || word.kq) return { fault: `word ${place.n} is not a plain word` };
  if (word.k !== place.key) return { fault: `word ${place.n} stands under the key ${word.k}, and the list's key is ${place.key}` };
  return { sec, si, at, word };
};

/** What a zone's word carries against a laid place: "none" where it carries no
 *  pieces, "the list's" where they are the place's pieces, each field the same,
 *  else "other". */
export const carriedAt = (word, place) => {
  const pg = word.pg;
  if (pg === undefined) return "none";
  return Array.isArray(pg) && pg.length === place.pieces.length && pg.every((x, i) => !!x && Object.keys(x).length === 4 && x.k === place.pieces[i].k && x.g === place.pieces[i].g && x.s === place.pieces[i].s && x.r === place.pieces[i].r) ? "the list's" : "other";
};

/** The readings the pin holds by name: [{ book, place, reads }]. */
export const namedReadings = (pin) => (Array.isArray(pin.named_readings) ? pin.named_readings : []);
