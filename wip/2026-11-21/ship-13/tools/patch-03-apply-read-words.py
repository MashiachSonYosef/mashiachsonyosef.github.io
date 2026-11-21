# Ship 13: tools/apply-read-words-v1.mjs lays TAHOT's words on the piece at a lost tag's place (relay v192.1), and
# names the amended list and the lost tags in each zone's record.
import sys
p = sys.argv[1] + "/tools/apply-read-words-v1.mjs"
t = open(p, encoding="utf-8").read()
def sub(a, b, n=1):
    global t
    if t.count(a) != n: sys.exit("patch-03: expected %d of: %s (found %d)" % (n, a[:90], t.count(a)))
    t = t.replace(a, b)

sub("""// The write is typed on each zone it changes (single-pass-exemption-v1,""",
    """// A LOST TAG'S PLACE (relay v192.1). Where the lattice's piece lost TAHOT's
// tag and English (Genesis 14:17, the one line of the amendment's list), the
// projection reads the tag as the piece's own, and this tool lays TAHOT's
// words for the place on the zone's piece, which carried MACULA's: the place
// then reads STEP's own words as every other place of the word does. The word
// is the one its word place numbers; its piece is the one piece as it stood
// (written) or as set (nothing to do), and anything else is refused.
//
// The write is typed on each zone it changes (single-pass-exemption-v1,""")
sub("""  placesOf, findPlace, wordNumberOf, carriedAt, piecesDue, HOLDS, holdsWhole, severalReadWords, strokesAgainst,
} from "./read-words-v1.mjs";""",
    """  placesOf, findPlace, wordNumberOf, carriedAt, piecesDue, HOLDS, holdsWhole, severalReadWords, strokesAgainst,
  lostTagsOf, findLostTag, lostTagCarried, pinnedAt,
} from "./read-words-v1.mjs";""")
sub("""for (const f of strokesAgainst(read.strokes, paseq.lines, places)) fault(f);
if (faults.length) refuse();
""", """for (const f of strokesAgainst(read.strokes, paseq.lines, places)) fault(f);
const { tags: lostTags, faults: lostFaults } = lostTagsOf(read);
for (const f of lostFaults) fault(f);
if (faults.length) refuse();
""")
sub("""const zones = new Map();   // book -> { zone, zPath, here: [{ place, found, carried, due }] }
for (const place of places) {
  if (!zones.has(place.book)) {
    const zPath = join(ZONES, `${place.book}.bin`);
    if (!existsSync(zPath)) { fault(`${place.book}: ${zPath} is not on disk`); zones.set(place.book, null); continue; }
    const zone = gz(zPath);
    // the list is keyed to the lattice's positions: the zone must be projected from the file the lane read
    const from = (((((zone.emitted_from || {}).toggles || {}).lattice || {}).source || {}).positions || {}).sha256 || null;
    if (!from || from !== latticeRead(read.receipt, place.book)) { fault(`${place.book}: the zone is projected from lattice positions ${String(from).slice(0, 12)}, and the lane read its list from ${String(latticeRead(read.receipt, place.book)).slice(0, 12)}`); zones.set(place.book, null); continue; }
    zones.set(place.book, { zone, zPath, here: [] });
  }
  const held = zones.get(place.book);
  if (!held) continue;""",
    """const zones = new Map();   // book -> { zone, zPath, here: [{ place, found, carried, due }], lost: [{ lost, found, carried }] }
// a book's zone, opened once: the lists are keyed to the lattice's positions, so the zone must be projected from the file the lane read
const zoneOf = (book) => {
  if (!zones.has(book)) {
    const zPath = join(ZONES, `${book}.bin`);
    if (!existsSync(zPath)) { fault(`${book}: ${zPath} is not on disk`); zones.set(book, null); return null; }
    const zone = gz(zPath);
    const from = (((((zone.emitted_from || {}).toggles || {}).lattice || {}).source || {}).positions || {}).sha256 || null;
    if (!from || from !== latticeRead(read.receipt, book)) { fault(`${book}: the zone is projected from lattice positions ${String(from).slice(0, 12)}, and the lane read its list from ${String(latticeRead(read.receipt, book)).slice(0, 12)}`); zones.set(book, null); return null; }
    zones.set(book, { zone, zPath, here: [], lost: [] });
  }
  return zones.get(book);
};
for (const place of places) {
  const held = zoneOf(place.book);
  if (!held) continue;""")
sub("""// a place that does not stand as the list has it is said once: what follows is judged on the places as they all stand
if (faults.length) refuse();""",
    """// each lost tag, on its zone: the word its word place numbers, tagged by the projection, its one piece as it stood or as set
for (const lost of lostTags) {
  const held = zoneOf(lost.book);
  if (!held) continue;
  const where = `${lost.book} ${lost.ref} word ${lost.word_number}`;
  const found = findLostTag(held.zone, lost);
  if (found.fault) { fault(`${where}: ${found.fault}`); continue; }
  if (found.word.tg !== lost.tag) { fault(`${where}: the projection gave the word the tag ${JSON.stringify(found.word.tg ?? null)}, and the list sets ${lost.tag} (tools/project-lattice-v12-v1.mjs reads the lost tag; run it first)`); continue; }
  const carried = lostTagCarried(found.word, lost);
  if (carried === "other") { fault(`${where}: the zone's pieces are neither the piece as it stood nor as set (${JSON.stringify(found.word.pg ?? null)})`); continue; }
  held.lost.push({ lost, found, carried });
}
// a place that does not stand as the list has it is said once: what follows is judged on the places as they all stand
if (faults.length) refuse();""")
sub("""const all = [...zones.values()].flatMap((z) => z.here);""",
    """const all = [...zones.values()].flatMap((z) => z.here), allLost = [...zones.values()].flatMap((z) => z.lost);
const toSet = allLost.filter((h) => h.carried === "as it stood");""")
sub("""console.log(`  strokes: ${read.strokes.length} of ${paseq.lines.length} lines equal relay ${paseq.pin.relay}'s list; nothing to write`);""",
    """console.log(`  strokes: ${read.strokes.length} of ${paseq.lines.length} lines equal relay ${paseq.pin.relay}'s list; nothing to write`);
if (read.pin.lost_tags) console.log(`  lost tags: ${allLost.length} place(s) · ${toSet.length} piece(s) to set with TAHOT's words · ${allLost.length - toSet.length} already set, the same${allLost.map((h) => ` · ${h.lost.book} ${h.lost.ref} word ${h.lost.word_number} ${h.lost.tag}: «${h.lost.was.g}» to «${h.lost.piece.g}»`).join("")}`);""")
sub("""if (!toTag.length && !toLay.length) { console.log("nothing to write"); process.exit(0); }""",
    """if (!toTag.length && !toLay.length && !toSet.length) { console.log("nothing to write"); process.exit(0); }""")
sub("""const toDo = new Set([...toTag, ...toLay]);
for (const { zone, zPath, here } of zones.values()) {
  if (!here.some((h) => toDo.has(h))) continue;""",
    """const toDo = new Set([...toTag, ...toLay, ...toSet]);
for (const { zone, zPath, here, lost } of zones.values()) {
  if (!here.some((h) => toDo.has(h)) && !lost.some((h) => toDo.has(h))) continue;
  // a lost tag's piece: TAHOT's words for the place, in the piece's own place among the word's fields
  for (const { lost: l, found } of lost) found.word.pg = [{ k: l.piece.k, g: l.piece.g, s: l.piece.s, r: l.piece.r }];""")
sub("""    relay: read.pin.relay,
    letter: read.pin.letter,
    list: { file: `${read.pin.folder}/${read.pin.read_words.file}`, sha256: read.pin.read_words.sha256, lines: read.pin.read_words.lines },""",
    """    relay: read.pin.relay,
    letter: read.pin.letter,
    ...(read.pin.amendment ? { amended_by: { relay: read.pin.amendment.relay, letter: read.pin.amendment.letter } } : {}),
    list: { file: pinnedAt(read.pin, read.pin.read_words), sha256: read.pin.read_words.sha256, lines: read.pin.read_words.lines },
    ...(lost.length ? { lost_tags: { file: pinnedAt(read.pin, read.pin.lost_tags), sha256: read.pin.lost_tags.sha256, here: lost.map((h) => ({ ref: h.lost.ref, section_word: h.found.at, word: h.lost.word_number, tag: h.lost.tag, piece: h.lost.piece.g, stood: h.lost.was.g })) } } : {}),""")
sub("""      "No word, position, count or key moved",""",
    """      ...(lost.length ? ["At a lost tag's place the lattice's piece carried no tag and no English of TAHOT's, because TAHOT writes its mark inside the word and the lattice's reader stopped at it; the projection reads the tag as the piece's own, and the word's piece carries TAHOT's words for the place where it carried MACULA's"] : []),
      "No word, position, count or key moved",""")
sub("""    fields: ["emitted_from.read_words", "sections[].words[].w[].tg", ...(laid.length ? ["sections[].words[].pg"] : [])],
    why: "a read form of two or three words carried no tag for any of its words in the lattice the zone was projected from, and at some places no pieces; the corpus lane's list (relay v192) gives each read word its main tag and its pieces",""",
    """    fields: ["emitted_from.read_words", ...(here.length ? ["sections[].words[].w[].tg"] : []), ...(laid.length || lost.length ? ["sections[].words[].pg"] : [])],
    why: here.length
      ? `a read form of two or three words carried no tag for any of its words in the lattice the zone was projected from, and at some places no pieces; the corpus lane's list (relay v192${read.pin.amendment ? `, amended by relay ${read.pin.amendment.relay}` : ""}) gives each read word its main tag and its pieces${lost.length ? "; and a lattice piece that lost TAHOT's tag and English takes TAHOT's words for its place" : ""}`
      : "a lattice piece lost TAHOT's tag and English where TAHOT writes its mark inside the word; the corpus lane's list of lost tags gives the piece TAHOT's words for its place",""")
open(p, "w", encoding="utf-8").write(t)
print("patch-03 ok")
