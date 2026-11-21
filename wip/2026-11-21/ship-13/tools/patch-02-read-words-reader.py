# Ship 13: tools/read-words-v1.mjs reads the amendment of relay v192.1: a file kept in its own entry's folder, the
# amendment's rule and receipts, the word place on every line, and the list of lost tags.
import sys
p = sys.argv[1] + "/tools/read-words-v1.mjs"
t = open(p, encoding="utf-8").read()
def sub(a, b, n=1):
    global t
    if t.count(a) != n: sys.exit("patch-02: expected %d of: %s (found %d)" % (n, a[:90], t.count(a)))
    t = t.replace(a, b)

sub("""// Synthesis lane · the one reading of the corpus lane's list of read words (relay v192)""",
    """// Synthesis lane · the one reading of the corpus lane's list of read words (relay v192, amended by relay v192.1)""")
sub("""// A place is found on its zone by its verse and the lattice's surface (the
// lines carry no word number): exactly one word of the verse carries it,
// written one way and read another, and its read words are the list's,
// letter for letter. Anything else is said in words and is the caller's to
// refuse or to count.
""", """// A place is found on its zone by its verse and the lattice's surface:
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
""")
sub("""/** The pin and the five files it names, each read only as the bytes the pin
 *  names. Throws PinFault, in words. */""",
    """/** The pin and the files it names, each read only as the bytes the pin names
 *  and each in the pin's folder or the folder its own entry names: the rule,
 *  the receipt, the counts, the list and the strokes; and, where the pin
 *  carries an amendment, its rule, its two receipts and its list of lost
 *  tags. Throws PinFault, in words. */""")
sub("""  const take = (d, lines = false) => (lines ? readPinnedLines : readPinned)(join(dirname(pinPath), pin.folder, d.file), d, `${pin.folder}/${d.file}`);
  take(pin.rule);
  const receipt = JSON.parse(take(pin.receipt).toString("utf8"));
  const counts = JSON.parse(take(pin.counts).toString("utf8"));
  return { pin, receipt, counts, lines: take(pin.read_words, true), strokes: take(pin.strokes, true) };
};""",
    """  const take = (d, lines = false, folder = d.folder || pin.folder) => (lines ? readPinnedLines : readPinned)(join(dirname(pinPath), folder, d.file), d, `${folder}/${d.file}`);
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
export const pinnedAt = (pin, d) => `${d.folder || pin.folder}/${d.file}`;""")
sub("""/** Where the lane's receipt and the pin part: the receipt names the two
 *  lists, the counts and the rule by the pin's bytes and sha256, and read the
 *  strokes against the list the paseq pin names. [] where they agree. */
export const receiptAgainst = ({ pin, receipt }, paseqPin) => {
  const out = [];
  const said = (receipt && receipt.outputs) || {};
  for (const d of [pin.read_words, pin.strokes, pin.counts, pin.rule]) {""",
    """/** Where the lane's receipts and the pin part: the receipt of relay v192
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
  for (const d of [pin.read_words.amends || pin.read_words, pin.strokes, pin.counts, pin.rule]) {""")
sub("""  if (!read || read.sha256 !== paseqPin.places.sha256 || read.bytes !== paseqPin.places.bytes) out.push(`the lane's receipt read the strokes against a list of ${read ? String(read.sha256).slice(0, 12) : "no sha256"}, and ${PASEQ_PLACE_HOME}/PIN.json names ${String(paseqPin.places.sha256).slice(0, 12)}`);
  return out;
};""",
    """  if (!read || read.sha256 !== paseqPin.places.sha256 || read.bytes !== paseqPin.places.bytes) out.push(`the lane's receipt read the strokes against a list of ${read ? String(read.sha256).slice(0, 12) : "no sha256"}, and ${PASEQ_PLACE_HOME}/PIN.json names ${String(paseqPin.places.sha256).slice(0, 12)}`);
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
};""")
sub(""" *    { book, ref, surface, lattice: { i, j }, use, held, words, pieces, spells }""",
    """ *    { book, ref, word_number, surface, lattice: { i, j }, use, held, words, pieces, spells }
 *  (`word_number` the place's own word number in its verse, from the line's
 *  `place`; null on a list that carries none, which only an unamended pin may)""")
sub("""    let p = byId.get(idOf(l.book, L));
    if (!p) { p = { book: l.book, ref: l.ref, surface: L.surface, lattice: { i: L.i, j: L.j }, use: l.use, of: l.read_words_in_place, held: null, words: [] }; byId.set(idOf(l.book, L), p); places.push(p); }
    if (l.ref !== p.ref || L.surface !== p.surface || l.use !== p.use || l.read_words_in_place !== p.of) faults.push(`${where}: its verse, surface, use or count of read words is not its place's`);""",
    """    // the place's own word number (relay v192.1): its verse, a colon, the word's number in the verse
    const wn = typeof l.place === "string" && l.place.startsWith(`${l.ref}:`) && /^[1-9]\\d*$/u.test(l.place.slice(l.ref.length + 1)) ? Number(l.place.slice(l.ref.length + 1)) : null;
    if (wn === null && (l.place !== undefined || pin.read_words.amends)) faults.push(`${where}: names no word place of its verse (${JSON.stringify(l.place ?? null)})`);
    let p = byId.get(idOf(l.book, L));
    if (!p) { p = { book: l.book, ref: l.ref, word_number: wn, surface: L.surface, lattice: { i: L.i, j: L.j }, use: l.use, of: l.read_words_in_place, held: null, words: [] }; byId.set(idOf(l.book, L), p); places.push(p); }
    if (l.ref !== p.ref || wn !== p.word_number || L.surface !== p.surface || l.use !== p.use || l.read_words_in_place !== p.of) faults.push(`${where}: its verse, word place, surface, use or count of read words is not its place's`);""")
sub("""  const word = words[hits[0]];
  if (!word.kq || !Array.isArray(word.w)) return { fault: `the word of ${place.ref} that carries the lattice's surface is not written one way and read another` };""",
    """  const word = words[hits[0]];
  if (place.word_number !== null && place.word_number !== undefined && wordNumberOf(sec, hits[0]) !== place.word_number) return { fault: `the word that carries the lattice's surface is word ${wordNumberOf(sec, hits[0])} of ${place.ref}, and the list numbers its place ${place.word_number}` };
  if (!word.kq || !Array.isArray(word.w)) return { fault: `the word of ${place.ref} that carries the lattice's surface is not written one way and read another` };""")
sub("""/** Every word of a zone whose read form holds several words: [{ sec, at, word, reads }]. */""",
    """/** The amendment's lost tags, each
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
    const wn = typeof l.place === "string" && l.place.startsWith(`${l.ref}:`) && /^[1-9]\\d*$/u.test(l.place.slice(l.ref.length + 1)) ? Number(l.place.slice(l.ref.length + 1)) : null;
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

/** Every word of a zone whose read form holds several words: [{ sec, at, word, reads }]. */""")
open(p, "w", encoding="utf-8").write(t)
print("patch-02 ok")
