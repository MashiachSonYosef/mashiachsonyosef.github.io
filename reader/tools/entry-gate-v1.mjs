// Synthesis lane · entry-gate-rule-v1-a-row-of-another-entry-than-the-words-is-withheld-and-a-row-of-its-own-entry-stands-whatever-its-points
// LEDGER: -
// no frame letter. The gate's own functions: they read a row's entry and a
// place's, and write nothing.
//
// THE ENTRY GATE: A ROW OF ANOTHER ENTRY THAN THE WORD'S IS WITHHELD, AND A
// ROW OF ITS OWN ENTRY STANDS WHATEVER ITS POINTS.
//
// The store keys a row by bare letters, and several words share a key: the
// verb "he created", the verb "he ate", the noun "field" in Aramaic. Until
// 13 November 2026 the page told them apart by the pointing of each row's
// headword alone, which withholds a row of the right entry whose dictionary
// form is pointed otherwise than the word in the verse, and keeps a row of
// another entry that happens to be pointed alike or not at all.
//
// The corpus lane's row entries ledger (relay v172) gives each row the entry
// its own source files it under, and the lattice gives each place the entry
// that stands there: the tag on the word's core piece, TAHOT's, a Strong's
// number with STEP's letter where STEP parts one number into several words
// (H1254A, H1254B; a capital, and a small letter where STEP ran past its
// capitals for one name, as H5838x among the men called Azariah). The owner
// ruled the gate (13 November 2026: «1-5. agree
// go ahead», ruling 1; «1-3. ok agree», ruling 6, its two further partings).
// As the lane measured it and the rulings state it:
//
//   The place's numbers are the numbers of its core pieces' tags. A place
//   with no tagged core piece is not gated.
//
//   THIS ENTRY   a row whose numbers hold one of the place's numbers. It is
//                kept whatever its headword's points.
//   ANOTHER      a row with numbers, none of them the place's. Withheld and
//                counted.
//   NO NUMBER    a row with no number. Left as it is: the pointing still
//                speaks for it.
//
//   and the two partings:
//
//   STEP'S LETTERS   a row that is this entry by its number, whose own
//                entries are STEP's tags and carry a letter, at a place
//                whose every core tag carries a letter: where none of the
//                row's lettered tags is one of the place's, it is another
//                entry. («he ate» is filed under H1254B and the place reads
//                H1254A.)
//   BDB'S OWN ENTRIES   a row with no number that names BDB's own entry:
//                where the key's rows of BDB's that carry one of the place's
//                numbers name entries, and this row's is none of them, it is
//                another entry. (BDB heads a root apart from its words and
//                gives the root no number.)
//
//   WHAT THE CARD NAMES   the place's entry as the place is asked: its tags
//                where every one carries a letter, else its numbers. A row
//                withheld by letter is its number's own, so the number
//                alone would misname it.
//
// A row carries what this reads in its facts slot (gloss-store-v1.mjs:
// n its numbers, t its lettered STEP tags, b BDB's own entries), written by
// tools/apply-row-entries-v1.mjs. The page carries these functions under the
// same names, and check-entry-gate-v1 runs the two side by side.
export const ENTRY_GATE_RULE_ID = "entry-gate-rule-v1-a-row-of-another-entry-than-the-words-is-withheld-and-a-row-of-its-own-entry-stands-whatever-its-points";

/** The Strong's number in a tag or an entry id: H and the digits, leading noughts off; null where it holds none. */
export const numberOf = (tag) => { const x = /^[HA]?0*(\d+)/u.exec(String(tag)); return x && x[1] !== "0" ? `H${x[1]}` : null; };
/** A tag with the leading noughts of its number taken off: H0853 is H853, H1254A stays. */
export const tagOf = (tag) => String(tag).replace(/^H0*/u, "H");
/** That tag where it carries STEP's letter, a capital or a small one, else null. */
export const letteredOf = (tag) => { const t = tagOf(tag); return /^H\d+[A-Za-z]$/u.test(t) ? t : null; };

/** What a place gives the gate, from its core pieces' tags as the lattice writes them; null where it has none. */
export const placeEntry = (coreTags) => {
  const tags = (coreTags || []).filter(Boolean).map(tagOf);
  const numbers = [...new Set(tags.map(numberOf).filter(Boolean))];
  if (!numbers.length) return null;
  return { tags, numbers, lettered: tags.every((t) => /[A-Za-z]$/u.test(t)) };
};

/** How the card names a place's entry: its tags where every one carries a letter (a row is asked by letter there), else its numbers. */
export const entrySaid = (place) => (place.lettered ? [...new Set(place.tags)] : place.numbers);

/** BDB's own entries that the key's rows give the place's numbers: of every row that names such entries (b) and carries one of the numbers. */
export const bdbEntriesAt = (place, factsOfRows) => {
  const out = new Set();
  for (const f of factsOfRows) if (f && Array.isArray(f.b) && Array.isArray(f.n) && f.n.some((x) => place.numbers.includes(x))) for (const e of f.b) out.add(e);
  return out;
};

/** A row's verdict at a place: "this", "other" or "none" (left as it is). `facts` is the row's facts slot or null. */
export const entryVerdict = (facts, place, bdbHere) => {
  const nums = facts && Array.isArray(facts.n) ? facts.n : [];
  if (!nums.length) {
    const b = facts && Array.isArray(facts.b) ? facts.b : [];
    return b.length && bdbHere.size && !b.some((e) => bdbHere.has(e)) ? "other" : "none";
  }
  if (!nums.some((x) => place.numbers.includes(x))) return "other";
  const t = facts && Array.isArray(facts.t) ? facts.t : [];
  return t.length && place.lettered && !t.some((x) => place.tags.includes(x)) ? "other" : "this";
};
