# Ship 13: tools/check-read-words-v1.mjs holds the amendment of relay v192.1: the zone's record names it and its lost
# tags, and a new law (R9) holds a lost tag's place on its zone and in the record of the lines at rest.
import sys
p = sys.argv[1] + "/tools/check-read-words-v1.mjs"
t = open(p, encoding="utf-8").read()
def sub(a, b, n=1):
    global t
    if t.count(a) != n: sys.exit("patch-09: expected %d of: %s (found %d)" % (n, a[:100], t.count(a)))
    t = t.replace(a, b)
sub("""//   R1  the pin's five files are the bytes it names; the lane's receipt
//       names the two lists, the counts and the rule the same, and read the
//       strokes against the list the paseq pin names; the list is well""",
    """//   R1  the pin's files are the bytes it names (since relay v192.1 the
//       list is the amended one, kept with the list of lost tags and the
//       amendment's rule and receipts in the amendment's own folder); the
//       lane's receipt names the two lists, the counts and the rule the
//       same (the list being the one the pin's list amends), and read the
//       strokes against the list the paseq pin names; the amendment's
//       receipt names the amended list and the lost tags by the pin's
//       bytes, read the list it amends, and its second count agrees; every
//       line names its place's own word number; the list is well""")
sub("""//   R3  every listed place is found once on its zone, by its verse and the
//       lattice's surface, with the list's read words letter for letter;""",
    """//   R3  every listed place is found once on its zone, by its verse and the
//       lattice's surface, the word its own word place numbers, with the
//       list's read words letter for letter;""")
sub("""//   R5  each zone's record names the list and what its places carry, as a
//       recount gives it (a place the pin holds whole with its tags held),
//       and its write is typed; a zone whose every place is held whole is
//       not written, and carries no record""",
    """//   R5  each zone's record names the list, the amendment and what its
//       places carry, as a recount gives it (a place the pin holds whole
//       with its tags held; a lost tag's place with its tag and its piece),
//       and its write is typed; a zone whose every place is held whole and
//       that holds no lost tag is not written, and carries no record""")
sub("""//
// Run: node tools/check-read-words-v1.mjs""",
    """//   R9  the tag a lattice piece lost (relay v192.1): the list's lines are
//       as the amendment's rule has them; each names a plain word of its
//       zone, the word its word place numbers, which carries the tag the
//       list sets (tg, written by the projection; no entry of a lemma
//       beside it) and, as its one piece, TAHOT's words for the place,
//       credited to TAHOT; and the record of the lines at rest draws that
//       place's line from the piece
//
// Run: node tools/check-read-words-v1.mjs""")
sub("""import { linesOnPage } from "./resting-lines-v1.mjs";""", """import { linesOnPage, readRecord, RESTING_DIR } from "./resting-lines-v1.mjs";""")
sub("""  placesOf, namedReadings, findPlace, wordNumberOf, carriedAt, piecesDue, HOLDS, holdsWhole, severalReadWords, strokesAgainst,
} from "./read-words-v1.mjs";""",
    """  placesOf, namedReadings, findPlace, wordNumberOf, carriedAt, piecesDue, HOLDS, holdsWhole, severalReadWords, strokesAgainst,
  lostTagsOf, findLostTag, lostTagCarried, pinnedAt,
} from "./read-words-v1.mjs";""")
# R5: the zones that carry a record, and the record's new fields
sub("""  const books = [...new Set(at.filter((x) => !x.whole).map((x) => x.place.book))];
  for (const book of books) {
    const zone = readZone(book), here = at.filter((x) => x.place.book === book);""",
    """  const lostList = lostTagsOf(read).tags;
  const books = [...new Set([...at.filter((x) => !x.whole).map((x) => x.place.book), ...lostList.map((l) => l.book)])];
  for (const book of books) {
    const zone = readZone(book), here = at.filter((x) => x.place.book === book);
    if (!zone) { faults.push(`${book}: its zone is not on disk`); continue; }
    // the lost tags of the book, as the zone's record names them
    const lostHere = lostList.filter((l) => l.book === book).map((l) => { const f = findLostTag(zone, l); return f.fault ? null : { ref: l.ref, section_word: f.at, word: l.word_number, tag: l.tag, piece: l.piece.g, stood: l.was.g }; });""")
sub("""    else if (!same(rec.here, mine.here) || !same(rec.counts, mine.counts)) faults.push(`${book}: the zone's record says ${JSON.stringify(rec.counts)} and a recount gives ${JSON.stringify(mine.counts)}${same(rec.counts, mine.counts) ? ", and its places are not the recount's" : ""}`);""",
    """    else if (!same(rec.here, mine.here) || !same(rec.counts, mine.counts)) faults.push(`${book}: the zone's record says ${JSON.stringify(rec.counts)} and a recount gives ${JSON.stringify(mine.counts)}${same(rec.counts, mine.counts) ? ", and its places are not the recount's" : ""}`);
    else if (rec.list.file !== pinnedAt(read.pin, read.pin.read_words) || !same(rec.amended_by ?? null, read.pin.amendment ? { relay: read.pin.amendment.relay, letter: read.pin.amendment.letter } : null)) faults.push(`${book}: the zone's record names the list's file or the amendment otherwise than the pin`);
    else if (!same(rec.lost_tags ?? null, lostHere.length ? { file: pinnedAt(read.pin, read.pin.lost_tags), sha256: read.pin.lost_tags.sha256, here: lostHere } : null)) faults.push(`${book}: the zone's record of its lost tags is not the list's (${JSON.stringify(rec.lost_tags ?? null).slice(0, 160)})`);""")
sub("""  check("R5  each zone's record names the list and what its places carry, as a recount gives it (a place the pin holds whole with its tags held), and its write is typed", faults.length === 0 && books.length > 0,""",
    """  check("R5  each zone's record names the list, the amendment and what its places carry, as a recount gives it (a place the pin holds whole with its tags held; a lost tag's place with its tag and piece), and its write is typed", faults.length === 0 && books.length > 0,""")
# R9, before the page laws
sub("""// ---- R6, R7: the page -----------------------------------------------------------------------------""",
    """// ---- R9: the tag a lattice piece lost ----------------------------------------------------------------
{
  const faults = [], said = [];
  const { tags, faults: listFaults } = lostTagsOf(read);
  faults.push(...listFaults);
  if (!!read.pin.lost_tags !== !!read.pin.amendment) faults.push("the pin names lost tags and no amendment, or an amendment and no lost tags");
  for (const l of tags) {
    const where = `${l.book} ${l.ref} word ${l.word_number}`, zone = readZone(l.book);
    if (!zone) { faults.push(`${where}: its zone is not on disk`); continue; }
    const found = findLostTag(zone, l);
    if (found.fault) { faults.push(`${where}: ${found.fault}`); continue; }
    const w = found.word;
    if (w.tg !== l.tag || w.te !== undefined || w.tl !== undefined) { faults.push(`${where}: carries tg ${JSON.stringify(w.tg ?? null)}${w.te !== undefined ? ` and te ${JSON.stringify(w.te)}` : ""}, and the list sets ${l.tag} as the piece's own`); continue; }
    if (lostTagCarried(w, l) !== "set") { faults.push(`${where}: its pieces are ${JSON.stringify(w.pg ?? null)}, and the list sets ${JSON.stringify(l.piece)}`); continue; }
    // the record of the lines at rest: the place's line is its piece, as the page draws it, credited to the piece's source
    const rec = readRecord(join(K3, RESTING_DIR, `${l.book}.json.gz`));
    const sec = rec ? (rec.sections || []).find((s) => s[0] === l.ref) : null;
    const unit = sec ? (sec[1] || []).find((u) => u[0] <= found.at && found.at < u[0] + Math.max(1, u[1])) || null : null;
    const want = printedForm(l.piece.g), who = `PIECE:${l.piece.s.toUpperCase()}`;
    if (!rec) { faults.push(`${l.book}: no record of its lines at rest`); continue; }
    if (!unit || unit[1] !== 1 || unit[2] !== want || unit[3] !== who) { faults.push(`${where}: the record's line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"})` : "nothing"}, and its piece reads «${want}» (${who})`); continue; }
    said.push(`${zone.work || l.book} ${l.ref} word ${l.word_number} ${l.tag} «${unit[2]}»`);
  }
  check("R9  a tag a lattice piece lost: the word its word place numbers carries the tag as its own and TAHOT's words for the place as its one piece, and the record of the lines at rest draws its line from the piece",
    faults.length === 0 && said.length === tags.length,
    faults.length ? `${faults.length} · ${first(faults)}` : tags.length ? said.join(" · ") : "the pin names no lost tag");
}

// ---- R6, R7: the page -----------------------------------------------------------------------------""")
open(p, "w", encoding="utf-8").write(t)
print("patch-09 ok")
