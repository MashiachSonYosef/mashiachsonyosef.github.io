// Synthesis lane · the one reading of the corpus lane's list of read words (relay v192, amended by relay v192.1)
// GUARDS: read-words-rule-v1-each-read-word-of-a-read-form-of-several-words-carries-its-own-entry-and-the-place-reads-their-pieces
// LEDGER: -
// no frame letter. The one reading of the corpus lane's list of read words:
// it reads the pinned files and a zone, and writes nothing.
//
// EACH READ WORD OF A READ FORM OF SEVERAL WORDS CARRIES ITS OWN ENTRY, AND
// THE PLACE READS THEIR PIECES.
//
// At 28 places written one way and read another, the read form holds two or
// three words. Lattice v12 keeps such a place as one position, so its read
// form carried no tag for any of its words, and at 14 of the 28 it carried
// no pieces either: the page read each read word by its bare letters, and
// the line at Job 38:1 said «manna» where TAHOT reads «from». The corpus
// lane's relay v192 (Moses, 14 November 2026 AD) lists, for each of the 57
// read words, its main tag as TAHOT writes it and its pieces as TAHOT gives
// them, keyed to lattice v12 by book, position and the place's surface. It
// is kept byte for byte under data/read-words/, named by its pin.
//
// WHAT A ZONE CARRIES FOR A LISTED PLACE, said here once for the tool that
// writes it (tools/apply-read-words-v1.mjs) and the check that holds it
// (tools/check-read-words-v1.mjs):
//
//   tags     each read word's own region carries its main tag (tg), one tag
//            and never a list; a read word TAHOT gives no main tag carries
//            none. The reader asks a read word's entry by its own key
//            (zone.html, tagHolder), so its rows of another entry are
//            withheld as at any tagged place (the entry gate,
//            tools/entry-gate-v1.mjs).
//   pieces   the word carries the read words' pieces in read-word order
//            (pg), each as a zone writes a piece: its letters, TAHOT's
//            English for it, its source and its role. Where the lattice
//            gave the place pieces of its own (use TIES_EXISTING_PIECES)
//            the zone's stand and are held equal to the list's; where it
//            gave none (use NEW_PIECES) the list's are written, and the
//            reader draws the place's line from them as it does at every
//            place that carries pieces. A place whose pieces the pin holds
//            back (pieces_held: they do not spell its read words) carries
//            none until the lane answers; where the entry holds "tags and
//            pieces", the place is held whole and its read words carry no
//            tag either (holdsWhole).
//   named    the pin may name a reading the page lane holds the line to
//            (named_readings): a listed place's read word and what its
//            pieces read. It is the list's, or the pin is refused.
//
// A place is found on its zone by its verse and the lattice's surface:
// exactly one word of the verse carries it, written one way and read another,
// and its read words are the list's, letter for letter. Since the amendment
// every line names its place's own word number (`place`, the verse and the
// word's number in it as the page counts words), and the word found is held
// to it. Anything else is said in words and is the caller's to refuse or to
// count.
//
// THE AMENDMENT (relay v192.1, 20 November 2026 AD) changes three things and
// nothing else: every line carries its word place; at Psalms 10:10 the piece
// TAHOT spells otherwise carries the edition's letters, so the place's pieces
// spell its read words and the pin holds it no longer; and one more list,
// the tag a lattice piece lost. At Genesis 14:17 TAHOT writes its mark inside
// the word, the lattice's reader stopped at it, and the piece carried no tag
// and no English of TAHOT's. The list names the piece as the lattice has it
// and as it is set (lostTagsOf): the projection reads the tag as the piece's
// own, and the zone's piece takes TAHOT's words for the place. The amended
// list and the lost tags are kept in the amendment's own folder; the list it
// amends is named by its bytes and kept nowhere.
//
// The list's second file, the stroke's two facts at the 16 places of relay
// v179, adds nothing a zone lacks: the zones carry both facts from the list
// data/paseq-place/ pins (tools/apply-paseq-place-v1.mjs). It is held equal
// to that list, line for line (strokesAgainst), and writes nothing.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";

export const READ_WORDS_RULE_ID = "read-words-rule-v1-each-read-word-of-a-read-form-of-several-words-carries-its-own-entry-and-the-place-reads-their-pieces";
export const READ_WORDS_HOME = "data/read-words";
export const READ_WORDS_TOOL = "tools/apply-read-words-v1.mjs";
export const PASEQ_PLACE_HOME = "data/paseq-place";

/** The Hebrew letters of a string, alef to tav: no point, accent, maqaf or bracket. */
export const lettersOf = (t) => String(t ?? "").replace(/[^\u05D0-\u05EA]/gu, "");
// a tag as the lattice writes one: a Strong's number, with STEP's letter where it carries one
const TAG = /^H\d+[A-Za-z]?$/u;
const USES = ["NEW_PIECES", "TIES_EXISTING_PIECES"];

/** The pin and the files it names, each read only as the bytes the pin names
 *  and each in the pin's folder or the folder its own entry names: the rule,
 *  the receipt, the counts, the list and the strokes; and, where the pin
 *  carries an amendment, its rule, its two receipts and its list of lost
 *  tags. Throws PinFault, in words. */
export const readReadWords = (pinPath) => {
  if (!existsSync(pinPath)) throw new PinFault(`${pinPath} is not here`);
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  if (pin.schema_version !== "READ_WORDS_PIN_V1") throw new PinFault(`${pinPath}: schema ${pin.schema_version}, not READ_WORDS_PIN_V1`);
  for (const k of ["rule", "receipt", "read_words", "strokes", "counts"]) if (!pin[k] || !pin[k].file) throw new PinFault(`${pinPath} names no ${k}`);
  const take = (d, lines = false, folder = d.folder || pin.folder) => (lines ? readPinnedLines : readPinned)(join(dirname(pinPath), folder, d.file), d, `${folder}/${d.file}`);
  take(pin.rule);
  const receipt = JSON.parse(take(pin.receipt).toString("utf8"));
  const counts = JSON.parse(take(pin.counts).toString("utf8"));
  let amendment = null, lostTags = [];
  if (pin.amendment) {
    const a = pin.amendment;
    for (const k of ["rule", "receipt", "verify_receipt"]) if (!a[k] || !a[k].file) throw new PinFault(`${pinPath}: its amendment names no ${k}`);
    if (!pin.read_words.amends || !pin.lost_tags || !pin.lost_tags.file) throw new PinFault(`${pinPath}: its amendment names no list it amends, or no list of lost tags`);
    take(a.rule, false, a.folder);
    amendment = { receipt: JSON.parse(take(a.receipt, false, a.folder).toString("utf8")), verify: JSON.parse(take(a.verify_receipt, false, a.folder).toString("utf8")) };
    lostTags = take(pin.lost_tags, true);
  } else if (pin.read_words.amends || pin.lost_tags) throw new PinFault(`${pinPath} names an amended list or lost tags, and no amendment`);
  return { pin, receipt, counts, amendment, lostTags, lines: take(pin.read_words, true), strokes: take(pin.strokes, true) };
};

/** Where a file of the pin is kept, as a zone's record names it: its folder and its name. */
export const pinnedAt = (pin, d) => `${d.folder || pin.folder}/${d.file}`;

/** The list of relay v179 the paseq pin names, read only as those bytes. Throws PinFault. */
export const readPaseqList = (pinPath) => {
  if (!existsSync(pinPath)) throw new PinFault(`${pinPath} is not here`);
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  if (pin.schema_version !== "PASEQ_PLACE_PIN_V1" || !pin.places) throw new PinFault(`${pinPath} names no list of paseq places`);
  return { pin, lines: readPinnedLines(join(dirname(pinPath), pin.folder, pin.places.file), pin.places, `${pin.folder}/${pin.places.file}`) };
};

/** Where the lane's receipts and the pin part: the receipt of relay v192
 *  names the two lists, the counts and the rule by the pin's bytes and sha256
 *  (the list of read words being the one the pin's list amends, where it
 *  amends one), and read the strokes against the list the paseq pin names;
 *  and the amendment's receipt names the amended list and the lost tags by
 *  the pin's bytes, read the list the pin says it amends and the pin's counts,
 *  was made under the amendment's rule, and its second count agrees. [] where
 *  they agree. */
export const receiptAgainst = ({ pin, receipt, amendment }, paseqPin) => {
  const out = [];
  const said = (receipt && receipt.outputs) || {};
  for (const d of [pin.read_words.amends || pin.read_words, pin.strokes, pin.counts, pin.rule]) {
    const o = said[d.file];
    if (!o || o.bytes !== d.bytes || o.sha256 !== d.sha256) out.push(`the lane's receipt names ${d.file} as ${o ? `${o.bytes} bytes, ${String(o.sha256).slice(0, 12)}` : "nothing"}, and the pin as ${d.bytes} bytes, ${String(d.sha256).slice(0, 12)}`);
  }
  const read = ((receipt && receipt.inputs) || {})["v179 list"];
  if (!read || read.sha256 !== paseqPin.places.sha256 || read.bytes !== paseqPin.places.bytes) out.push(`the lane's receipt read the strokes against a list of ${read ? String(read.sha256).slice(0, 12) : "no sha256"}, and ${PASEQ_PLACE_HOME}/PIN.json names ${String(paseqPin.places.sha256).slice(0, 12)}`);
  if (pin.amendment) {
    const a = (amendment && amendment.receipt) || {}, v = (amendment && amendment.verify) || {};
    const outs = new Map((Array.isArray(a.outputs) ? a.outputs : []).map((o) => [o.file, o]));
    for (const d of [pin.read_words, pin.lost_tags]) {
      const o = outs.get(d.file);
      if (!o || o.bytes !== d.bytes || o.sha256 !== d.sha256) out.push(`the amendment's receipt names ${d.file} as ${o ? `${o.bytes} bytes, ${String(o.sha256).slice(0, 12)}` : "nothing"}, and the pin as ${d.bytes} bytes, ${String(d.sha256).slice(0, 12)}`);
    }
    const sameBytes = (x, d) => !!x && !!d && x.bytes === d.bytes && x.sha256 === d.sha256;
    if (!sameBytes((a.inputs || {})["v192 list"], pin.read_words.amends)) out.push(`the amendment's receipt did not read the list the pin says its list amends (${String(((a.inputs || {})["v192 list"] || {}).sha256).slice(0, 12)} against ${String((pin.read_words.amends || {}).sha256).slice(0, 12)})`);
    if (!sameBytes((a.inputs || {})["v192 counts"], pin.counts)) out.push("the amendment's receipt did not read the counts the pin names");
    if (((a.rule || {}).sha256 || null) !== pin.amendment.rule.sha256) out.push("the amendment's receipt was not made under the amendment's rule as the pin names it");
    if (!(v.agree === true && v.failures === 0)) out.push("the amendment's second count does not say it agrees");
  }
  return out;
};

/** The lattice positions file the lane read a book's places from, by its sha256, as the lane's receipt names it; null where it names none. */
export const latticeRead = (receipt, book) => (((receipt && receipt.inputs) || {})[`lattice v12 ${book}`] || {}).sha256 || null;

/** The readings the pin holds by name (named_readings): [{ book, ref, read_word, reads }], `reads` as the list gives the read word's pieces, a slash between them. */
export const namedReadings = (pin) => (Array.isArray(pin.named_readings) ? pin.named_readings : []);
// what the list gives the read word a named reading points at, written the same way; null where it gives no such read word
const readingOf = (places, r) => { const p = places.find((x) => x.book === r.book && x.ref === r.ref), w = p ? p.words[r.read_word - 1] : null; return w ? w.pieces.map((x) => x.g).join("/ ") : null; };

/** The list by place, in its own order. A place is
 *    { book, ref, word_number, surface, lattice: { i, j }, use, held, words, pieces, spells }
 *  (`word_number` the place's own word number in its verse, from the line's
 *  `place`; null on a list that carries none, which only an unamended pin may)
 *  and each of its words { n, letters, tag, pieces, spells }: the read word's
 *  number, its letters, its main tag (null where TAHOT writes none) and its
 *  pieces as a zone writes a piece ({ k, g, s, r }). `pieces` is the read
 *  words' pieces in order; `spells` says they spell the read words; `held` is
 *  the pin's entry that holds the place's pieces back, or null. `faults`
 *  says, in words, every line or place that is not as the lane's rule has
 *  it, and every reading the pin names that the list does not give. */
export const placesOf = ({ pin, lines }) => {
  const faults = [], places = [], byId = new Map();
  const idOf = (book, L) => `${book} ${(L || {}).i} ${(L || {}).j}`;
  for (const [at, l] of lines.entries()) {
    const where = `${pin.read_words.file} line ${at + 1} (${l.book} ${l.ref}, read word ${l.n})`;
    const L = l.lattice_v12 || {};
    if (!l.book || !l.ref || typeof L.surface !== "string" || !Number.isInteger(L.i) || !Number.isInteger(L.j)) { faults.push(`${where}: names no book, verse or lattice position with its surface`); continue; }
    // the place's own word number (relay v192.1): its verse, a colon, the word's number in the verse
    const wn = typeof l.place === "string" && l.place.startsWith(`${l.ref}:`) && /^[1-9]\d*$/u.test(l.place.slice(l.ref.length + 1)) ? Number(l.place.slice(l.ref.length + 1)) : null;
    if (wn === null && (l.place !== undefined || pin.read_words.amends)) faults.push(`${where}: names no word place of its verse (${JSON.stringify(l.place ?? null)})`);
    let p = byId.get(idOf(l.book, L));
    if (!p) { p = { book: l.book, ref: l.ref, word_number: wn, surface: L.surface, lattice: { i: L.i, j: L.j }, use: l.use, of: l.read_words_in_place, held: null, words: [] }; byId.set(idOf(l.book, L), p); places.push(p); }
    if (l.ref !== p.ref || wn !== p.word_number || L.surface !== p.surface || l.use !== p.use || l.read_words_in_place !== p.of) faults.push(`${where}: its verse, word place, surface, use or count of read words is not its place's`);
    if (l.n !== p.words.length + 1) faults.push(`${where}: read word ${l.n} stands where read word ${p.words.length + 1} is due`);
    if (!USES.includes(l.use)) faults.push(`${where}: use ${l.use}`);
    if (typeof l.letters !== "string" || !l.letters || lettersOf(l.read_word) !== l.letters) faults.push(`${where}: its letters are not its read word's`);
    const given = Array.isArray(l.pieces) ? l.pieces : [];
    const pieces = given.map((x) => ({ k: x.consonants, g: x.english_tahot, s: String(x.source || "").toLowerCase(), r: x.role }));
    if (!pieces.length || given.some((x, i) => x.index !== i || x.source !== "TAHOT" || typeof x.consonants !== "string" || !x.consonants || lettersOf(x.consonants) !== x.consonants
      || typeof x.english_tahot !== "string" || !x.english_tahot.trim() || x.english_tahot !== x.english_tahot.trim() || typeof x.role !== "string" || !x.role))
      faults.push(`${where}: a piece is not TAHOT's, in order, with its letters, its English and its role`);
    // the main tag is the tag of the read word's one core piece, as the lattice gives a place its tag
    const cores = given.filter((x) => x.role === "core" && x.tag);
    const tag = l.main_tag ?? null;
    if (tag === null ? cores.length !== 0 : !(TAG.test(String(tag)) && cores.length === 1 && cores[0].tag === tag)) faults.push(`${where}: its main tag ${JSON.stringify(tag)} is not the tag of its one core piece`);
    const tie = Array.isArray(l.lattice_piece_indexes) ? l.lattice_piece_indexes : [];
    p.words.push({ n: l.n, letters: l.letters, tag, pieces, tie, spells: pieces.map((x) => x.k).join("") === l.letters });
  }
  const holds = Array.isArray(pin.pieces_held) ? pin.pieces_held : [];
  for (const p of places) {
    const where = `${p.book} ${p.ref}`;
    if (p.words.length !== p.of || p.of < 2) faults.push(`${where}: ${p.words.length} read word(s) listed, of ${p.of}`);
    p.pieces = p.words.flatMap((w) => w.pieces);
    p.spells = p.words.every((w) => w.spells);
    p.held = holds.find((h) => idOf(h.book, h.lattice_v12) === idOf(p.book, p.lattice)) || null;
    const tied = p.words.flatMap((w) => w.tie);
    if (p.use === "TIES_EXISTING_PIECES") {
      // the lattice's own pieces, in order, are the read words' pieces in order
      if (tied.length !== p.pieces.length || tied.some((x, i) => x !== i)) faults.push(`${where}: the lattice pieces it ties are not the read words' pieces in order`);
      if (!p.spells) faults.push(`${where}: its pieces do not spell its read words`);
      if (p.held) faults.push(`${where}: the pin holds back the pieces of a place the lattice gives pieces of its own`);
    } else {
      if (tied.length) faults.push(`${where}: a place with no pieces of its own ties lattice pieces`);
      if (!p.spells && !p.held) faults.push(`${where}: its pieces do not spell its read words, and the pin does not hold them back`);
      if (p.spells && p.held) faults.push(`${where}: the pin holds back pieces that spell the place's read words`);
    }
  }
  for (const h of holds) if (!places.some((p) => p.held === h)) faults.push(`the pin holds back the pieces of ${h.book} ${h.ref}, which the list does not name at that position`);
  for (const r of namedReadings(pin)) {
    const reads = readingOf(places, r);
    if (reads !== r.reads) faults.push(`the pin names read word ${r.read_word} of ${r.book} ${r.ref} as «${r.reads}», and the list gives ${reads === null ? "no such read word" : `«${reads}»`}`);
  }
  return { places, faults };
};

/** A listed place on its zone: { sec, si, at, word, reads }, the section, its
 *  number, the word's number in the section's entries, the word and its read
 *  regions in order; or { fault }, in words. */
export const findPlace = (zone, place) => {
  const secs = (zone.sections || []).map((sec, si) => ({ sec, si })).filter((x) => x.sec.label === place.ref);
  if (secs.length !== 1) return { fault: `${secs.length} sections are labeled ${place.ref}` };
  const { sec, si } = secs[0];
  const words = sec.words || [];
  const hits = words.map((w, at) => at).filter((at) => words[at].s === place.surface);
  if (hits.length !== 1) return { fault: `${hits.length} word(s) of ${place.ref} carry the lattice's surface ${place.surface}` };
  const word = words[hits[0]];
  if (place.word_number !== null && place.word_number !== undefined && wordNumberOf(sec, hits[0]) !== place.word_number) return { fault: `the word that carries the lattice's surface is word ${wordNumberOf(sec, hits[0])} of ${place.ref}, and the list numbers its place ${place.word_number}` };
  if (!word.kq || !Array.isArray(word.w)) return { fault: `the word of ${place.ref} that carries the lattice's surface is not written one way and read another` };
  const reads = word.w.filter((r) => r && r.role === "QERE");
  if (reads.length !== place.words.length) return { fault: `${reads.length} read word(s) on the zone, ${place.words.length} in the list` };
  const off = place.words.find((w, i) => lettersOf(reads[i].s) !== w.letters || reads[i].k !== w.letters);
  if (off) return { fault: `read word ${off.n} is ${reads[off.n - 1].s} under the key ${reads[off.n - 1].k} on the zone, and ${off.letters} in the list` };
  return { sec, si, at: hits[0], word, reads };
};

/** The word's number in its verse as the page counts words, the marks not counted. */
export const wordNumberOf = (sec, at) => (sec.words || []).slice(0, at + 1).filter((w) => !w.mark).length;

// a zone's piece is the list's where its letters, its role and its source are, and its English is, the ends trimmed as the page trims them
const samePiece = (has, want) => !!has && has.k === want.k && has.r === want.r && has.s === want.s && String(has.g ?? "").trim() === want.g;

/** What a zone carries at a place it was found at, against the list:
 *    tags    "none" where no read word carries a tag, "the list's" where
 *            each carries its main tag and a read word with none carries
 *            none, else "other"
 *    pieces  "none" where the word carries no pieces, "the list's" where
 *            they are the read words' pieces in order, else "other" */
export const carriedAt = ({ word, reads }, place) => {
  const has = reads.map((r) => (r.tg === undefined ? null : r.tg));
  const tags = has.every((t) => t === null) ? "none" : has.every((t, i) => t === place.words[i].tag) ? "the list's" : "other";
  const pg = word.pg;
  const pieces = pg === undefined ? "none" : Array.isArray(pg) && pg.length === place.pieces.length && pg.every((x, i) => samePiece(x, place.pieces[i])) ? "the list's" : "other";
  return { tags, pieces };
};

/** What the list gives a place's pieces: "written" (the lattice gave none,
 *  the list's stand on the zone), "tied" (the zone's own stand, equal to the
 *  list's) or "held" (the pin holds them back, and the zone carries none). */
export const piecesDue = (place) => (place.held ? "held" : place.use === "TIES_EXISTING_PIECES" ? "tied" : "written");

/** What the pin holds at a place (pieces_held): its pieces, or, where the entry
 *  holds "tags and pieces", the place whole: no tag and no piece on its read
 *  words until the lane answers. One reading of the hold, for the apply and the check. */
export const HOLDS_WHOLE = "tags and pieces";
export const HOLDS = ["pieces", HOLDS_WHOLE];
export const holdsWhole = (place) => !!place.held && place.held.holds === HOLDS_WHOLE;

/** The amendment's lost tags, each
 *    { book, ref, word_number, surface, lattice: { i, j }, index, tag, now, piece, was }
 *  the lattice piece by its position and its number among the position's
 *  pieces, the tag it takes, the piece as the lattice has it (`now`, the
 *  list's own fields) and the zone's piece after and before: `piece` with
 *  TAHOT's words for the place, credited to TAHOT as a zone credits a piece
 *  both sources give, and `was` with MACULA's, as a zone carries a piece only
 *  MACULA reads. `faults` says, in words, every line that is not as the
 *  amendment's rule has it: one piece, a core, untagged in the lattice,
 *  changed in its tag, its English of TAHOT's and its source and in nothing
 *  else. */
export const lostTagsOf = ({ pin, lostTags }) => {
  const tags = [], faults = [];
  const file = (pin.lost_tags || {}).file || "the list of lost tags";
  for (const [at, l] of (lostTags || []).entries()) {
    const where = `${file} line ${at + 1} (${l.book} ${l.ref})`;
    const L = l.lattice_v12 || {}, now = l.piece_now || {}, set = l.set || {}, piece = l.piece || {};
    const wn = typeof l.place === "string" && l.place.startsWith(`${l.ref}:`) && /^[1-9]\d*$/u.test(l.place.slice(l.ref.length + 1)) ? Number(l.place.slice(l.ref.length + 1)) : null;
    if (!l.book || !l.ref || wn === null || typeof L.surface !== "string" || !Number.isInteger(L.i) || !Number.isInteger(L.j)) { faults.push(`${where}: names no book, word place or lattice position with its surface`); continue; }
    const ix = Array.isArray(l.lattice_piece_indexes) && l.lattice_piece_indexes.length === 1 ? l.lattice_piece_indexes[0] : null;
    if (l.use !== "SETS_A_LOST_TAG" || !Number.isInteger(ix) || now.index !== ix || piece.index !== ix) { faults.push(`${where}: does not set a lost tag on one piece of the position`); continue; }
    if (!TAG.test(String(l.main_tag)) || set.tag !== l.main_tag || piece.tag !== l.main_tag || now.tag !== "" || now.role !== "core" || now.english_tahot !== "") faults.push(`${where}: its tag is not one main tag set on a core piece the lattice left untagged and without TAHOT's English`);
    if (typeof set.english_tahot !== "string" || !set.english_tahot.trim() || set.english_tahot !== set.english_tahot.trim() || piece.english_tahot !== set.english_tahot || set.source !== "TAHOT+MACULA" || piece.source !== set.source) faults.push(`${where}: what it sets is not TAHOT's English and the source of a piece both sources give`);
    const stays = ["index", "role", "hebrew", "consonants", "english_macula", "macula_class"];
    if (stays.some((k) => now[k] !== piece[k]) || Object.keys(piece).some((k) => !stays.includes(k) && !["tag", "english_tahot", "source"].includes(k)) || Object.keys(now).length !== Object.keys(piece).length)
      faults.push(`${where}: the piece as set differs from the piece as it stands in more than its tag, TAHOT's English and its source`);
    if (typeof now.consonants !== "string" || !now.consonants || lettersOf(now.consonants) !== now.consonants || lettersOf(L.surface) !== now.consonants || now.source !== "MACULA" || typeof now.english_macula !== "string" || !now.english_macula.trim())
      faults.push(`${where}: the piece as it stands is not the whole word, read by MACULA alone`);
    tags.push({ book: l.book, ref: l.ref, word_number: wn, surface: L.surface, lattice: { i: L.i, j: L.j }, index: ix, tag: l.main_tag, now,
      piece: { k: now.consonants, g: set.english_tahot, s: "tahot", r: now.role }, was: { k: now.consonants, g: String(now.english_macula ?? "").trim(), s: "macula", r: now.role } });
  }
  const ids = tags.map((x) => `${x.book} ${x.lattice.j}`);
  if (new Set(ids).size !== ids.length) faults.push(`${file}: two lines name one lattice position`);
  return { tags, faults };
};

/** A lost tag's word on its zone: { sec, at, word }, the section, the word's
 *  number in the section's entries and the word; or { fault }, in words. It
 *  is the word its word place numbers, it carries the lattice's surface under
 *  the piece's letters, and it is a plain word (not written one way and read
 *  another). */
export const findLostTag = (zone, lost) => {
  const secs = (zone.sections || []).filter((sec) => sec.label === lost.ref);
  if (secs.length !== 1) return { fault: `${secs.length} sections are labeled ${lost.ref}` };
  const sec = secs[0], words = sec.words || [];
  let n = 0, at = -1;
  for (const [i, w] of words.entries()) { if (w && !w.mark) { n += 1; if (n === lost.word_number) { at = i; break; } } }
  if (at < 0) return { fault: `${lost.ref} holds no word ${lost.word_number}` };
  const word = words[at];
  if (word.s !== lost.surface || word.k !== lost.piece.k) return { fault: `word ${lost.word_number} of ${lost.ref} is ${word.s} under ${word.k}, and the list names ${lost.surface} under ${lost.piece.k}` };
  if (word.kq || word.w) return { fault: `word ${lost.word_number} of ${lost.ref} is written one way and read another` };
  return { sec, at, word };
};

/** What a zone's word carries at a lost tag's place, against the list:
 *  "set" where its pieces are the one piece as set, "as it stood" where they
 *  are the one piece as it stood, else "other". */
export const lostTagCarried = (word, lost) => {
  const pg = word.pg;
  if (!Array.isArray(pg) || pg.length !== 1) return "other";
  return samePiece(pg[0], lost.piece) ? "set" : samePiece(pg[0], lost.was) ? "as it stood" : "other";
};

/** Every word of a zone whose read form holds several words: [{ sec, at, word, reads }]. */
export const severalReadWords = (zone) => {
  const out = [];
  for (const sec of zone.sections || []) for (const [at, word] of (sec.words || []).entries()) {
    if (!word || !word.kq || !Array.isArray(word.w)) continue;
    const reads = word.w.filter((r) => r && r.role === "QERE");
    if (reads.length > 1) out.push({ sec, at, word, reads });
  }
  return out;
};

/** Where the lane's stroke facts part from the list the paseq pin names, line
 *  for line: the place and the stroke by their positions, the place's
 *  surface, its count of read words, the read word the stroke follows and its
 *  class, and the read form laid out with the stroke after that read word;
 *  and where a line's among_the_listed_places is not whether the list of read
 *  words (`places`, as placesOf gives them) names its place.
 *  [] where they are equal. */
export const strokesAgainst = (strokes, paseqLines, places) => {
  const out = [];
  if (strokes.length !== paseqLines.length) out.push(`${strokes.length} stroke lines against ${paseqLines.length} lines of relay v179`);
  for (const [at, s] of strokes.entries()) {
    const P = s.on_the_place || {};
    const listed = places.some((x) => x.book === s.book && x.lattice.i === P.i && x.lattice.j === P.j);
    if (s.among_the_listed_places !== listed) out.push(`stroke line ${at + 1} (${s.book} ${s.ref}) says among_the_listed_places ${JSON.stringify(s.among_the_listed_places)}, and the list of read words ${listed ? "names" : "does not name"} its place`);
    const p = paseqLines[at];
    if (!p) continue;
    const site = (p.lattice_v12 || {}).site || {}, mark = (p.lattice_v12 || {}).stroke || {};
    const K = s.on_the_stroke || {}, of = K.stands_in_read_form_of || {};
    const k = of.after_read_word, seq = Array.isArray(P.read_form_with_stroke) ? P.read_form_with_stroke : [];
    const laid = seq.length === s.read_words + 1 && seq.every((e, i) => (i === k ? !!e.stroke && e.stroke.i === K.i && e.stroke.j === K.j : e.read_word === (i < k ? i + 1 : i)));
    if (!(s.book === p.book && s.ref === p.ref && s.class === p.class && s.read_words === p.read_words && k === p.the_stroke_follows_read_word
      && P.i === site.i && P.j === site.j && P.surface === site.surface && of.i === site.i && of.j === site.j && K.i === mark.i && K.j === mark.j && laid))
      out.push(`stroke line ${at + 1} (${s.book} ${s.ref}) is not relay v179's line ${at + 1} (${p.book} ${p.place})`);
  }
  return out;
};
