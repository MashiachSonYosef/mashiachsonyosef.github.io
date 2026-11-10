// Synthesis lane · the words of a zone, walked one way
// LEDGER: -
// no frame letter. This reads a zone and decides nothing: it is the one walk
// over a zone's word entries, so a tool that must visit "every word" visits
// the same words as every other tool.
//
// WHY THIS IS A FILE. A book's zone holds its words under sections; a
// commentary's zone holds them under units, each with the words of its own
// section and the words filed under each word it comments on. Until 10
// November 2026 the walk was typed again wherever it was needed, four times
// in the re-gloss tool alone, and one copy forgot the units: every commentary
// zone priced a source switch at 0 lines beside thousands of forms that
// change (the review of that day, T4).
//
// An entry is whatever the zone holds at a place: a word, a scribal mark
// (entry.mark), or a word written one way and read another (entry.w, its
// halves). The walk hands over entries as they stand and filters nothing;
// what counts as a word is the caller's question, answered with the helpers
// below so that it, too, is answered one way.

/** Every list of word entries a zone holds, in the zone's own order: one per
 *  section of a book; for a commentary, one per entry of each unit. */
export const wordListsOf = (zone) => {
  const lists = [];
  for (const sec of (zone && zone.sections) || []) lists.push(sec.words || []);
  for (const u of Object.values((zone && zone.units) || {}))
    for (const e of [...(u.section || []), ...Object.values(u.words || {}).flat()]) lists.push((e && e.words) || []);
  return lists;
};

/** Every word entry of a zone, marks and pairs included, in order. */
export const entriesOf = (zone) => wordListsOf(zone).flat();

/** A scribal mark: the verse end, a section break, the bar between two words. Not a word. */
export const isMark = (entry) => !!(entry && entry.mark);

/** The keys an entry is looked up under: a word's own key, or each half's
 *  where the word is written one way and read another. A mark has none. */
export const keysOfEntry = (entry) => {
  if (!entry || entry.mark) return [];
  if (Array.isArray(entry.w)) return entry.w.map((r) => r && r.k).filter(Boolean);
  return entry.k ? [entry.k] : [];
};
