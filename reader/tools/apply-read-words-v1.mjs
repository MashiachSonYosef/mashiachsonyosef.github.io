// apply-read-words-v1 · each read word of a read form of several words is written on the zone with its own entry, and the place with their pieces
//
// GUARDS: read-words-rule-v1-each-read-word-of-a-read-form-of-several-words-carries-its-own-entry-and-the-place-reads-their-pieces
// LEDGER: -
// no frame letter. This reads the corpus lane's list of read words, pinned
// in data/read-words/, and writes on the zones it names a tag on each read
// word and, where the place had none, the place's pieces; it moves no word,
// no position, no count and no key.
//
// THE GAP IT FILLS IS THE LATTICE'S, named by the page lane on 13 November
// 2026 and answered by the corpus lane in relay v192 (Moses, 14 November
// 2026 AD). At 28 places written one way and read another the read form
// holds two or three words. Lattice v12 keeps such a place as one position:
// its read form carries no tag for any of its words, and at 14 of the 28 it
// carries no pieces, because TAHOT gives the read words in two or three
// rows, or in one row with the stroke between them, or spells one of them
// otherwise. So the page read each of those read words by its bare letters.
// At Job 38:1 the line said «manna» under the read word TAHOT tags «from»,
// and at I Chronicles 27:12 «to make bricks» under «of the/ Ben». What the
// list is and what a zone carries for it is said once, in
// tools/read-words-v1.mjs; this tool writes it.
//
// WHAT THIS WRITES, place by place.
//   On each read word's own region, tg: its main tag as TAHOT writes it (56
//   of the 57 read words; the one TAHOT gives no main tag carries none, and
//   so do the read words of a place the pin holds whole).
//   The projection writes a place's tag on the word, or on the half its
//   pieces spell; a read word of several is neither, so its tag is written
//   here, after the projection, which clears every region's tag as it runs.
//   On the word of a place the lattice gave no pieces, pg: the read words'
//   pieces in read-word order, each as a zone writes a piece (its letters,
//   TAHOT's English, its source, its role), laid as the word's last field
//   whatever the zone held before, so the same inputs give the same bytes.
//   At a place the lattice gave pieces of its own, nothing: the zone's
//   pieces must equal the list's, or this refuses. At a place whose pieces
//   the pin holds back, nothing: the zone must carry none. At a place the
//   pin holds whole (its entry holds «tags and pieces»), nothing at all: its
//   read words carry no tag and the word no pieces, as before the list, or
//   this refuses, so its card and its line stand as they were until the lane
//   answers.
//
// WHAT IT PROVES FIRST, every one a refusal that writes nothing. The pin's
// five files are the bytes it names, and the lane's receipt names them the
// same. The list is well formed: each read word's letters, its main tag the
// tag of its one core piece, its pieces TAHOT's; each place's pieces spell
// its read words unless the pin holds them back, and the pin holds a place's
// pieces or the place whole, nothing else. The stroke facts of the
// same relay equal the list data/paseq-place/ pins, line for line, and
// call among the listed places exactly the listed places that carry a
// stroke: they write nothing here, and that pin and its tool stand as they
// are. Each
// zone is projected from the lattice the lane read. Each place is found by
// its verse and the lattice's surface, once, with the list's read words,
// letter for letter; at the six places that carry a stroke, that word is
// the word relay v179 numbers. A place carries either none of its tags or
// all of them as the list gives them (none where the pin holds it whole),
// and its pieces as its kind says.
// Anything else, a place that carries other tags or other pieces, or a tag
// on a read word of several that no line names in any work on disk, is a
// refusal.
//
// IT IS RUN BY THE ROUND, after the lattice projection (tools/round-v1.sh),
// and whenever the place's pieces are laid again. Run over zones that carry
// its work it writes nothing.
//
// The lane's next lattice carries each read word's tag and pieces itself
// (the list's rule, section 8). A zone projected from it is refused here,
// and the pin is retired then; it is never to be run past a refusal.
//
// A LOST TAG'S PLACE (relay v192.1). Where the lattice's piece lost TAHOT's
// tag and English (Genesis 14:17, the one line of the amendment's list), the
// projection reads the tag as the piece's own, and this tool lays TAHOT's
// words for the place on the zone's piece, which carried MACULA's: the place
// then reads STEP's own words as every other place of the word does. The word
// is the one its word place numbers; its piece is the one piece as it stood
// (written) or as set (nothing to do), and anything else is refused.
//
// The write is typed on each zone it changes (single-pass-exemption-v1,
// tools/zone-post-build-v1.mjs), with what the zone carries in
// emitted_from.read_words.
//
// Run: node tools/apply-read-words-v1.mjs --stamp <YYYY-MM-DD> [--zones data/zones] [--pin data/read-words/PIN.json] [--paseq-pin data/paseq-place/PIN.json] [--dry]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { PinFault } from "./pinned-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";
import {
  READ_WORDS_RULE_ID, READ_WORDS_HOME, READ_WORDS_TOOL, PASEQ_PLACE_HOME, readReadWords, readPaseqList, receiptAgainst, latticeRead,
  placesOf, findPlace, wordNumberOf, carriedAt, piecesDue, HOLDS, holdsWhole, severalReadWords, strokesAgainst,
  lostTagsOf, findLostTag, lostTagCarried, pinnedAt,
} from "./read-words-v1.mjs";

const arg = (name, dflt = null) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : dflt; };
const STAMP = arg("stamp"), ZONES = arg("zones", "data/zones"), PIN = arg("pin", `${READ_WORDS_HOME}/PIN.json`), PASEQ_PIN = arg("paseq-pin", `${PASEQ_PLACE_HOME}/PIN.json`);
const DRY = process.argv.includes("--dry");
if (!STAMP || !/^\d{4}-\d{2}-\d{2}$/u.test(STAMP)) { console.log(`usage: --stamp <YYYY-MM-DD> [--zones data/zones] [--pin ${READ_WORDS_HOME}/PIN.json] [--paseq-pin ${PASEQ_PLACE_HOME}/PIN.json] [--dry]`); process.exit(2); }

const faults = [];
const fault = (say) => { faults.push(say); console.log(`FAIL  ${say}`); };
const refuse = () => { console.log(`\napply-read-words-v1: ${faults.length} fault(s); nothing written`); process.exit(1); };
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

// ── the pin, the list, and the strokes held to relay v179's ─────────────
let read = null, paseq = null;
try { read = readReadWords(PIN); paseq = readPaseqList(PASEQ_PIN); } catch (e) { if (!(e instanceof PinFault)) throw e; fault(e.message); refuse(); }
for (const f of receiptAgainst(read, paseq.pin)) fault(f);
const { places, faults: listFaults } = placesOf(read);
for (const f of listFaults) fault(f);
for (const h of Array.isArray(read.pin.pieces_held) ? read.pin.pieces_held : []) if (!HOLDS.includes(h.holds ?? "pieces")) fault(`the pin holds ${JSON.stringify(h.holds)} at ${h.book} ${h.ref}, and an entry holds ${HOLDS.map((x) => `"${x}"`).join(" or ")}`);
for (const f of strokesAgainst(read.strokes, paseq.lines, places)) fault(f);
const { tags: lostTags, faults: lostFaults } = lostTagsOf(read);
for (const f of lostFaults) fault(f);
if (faults.length) refuse();

// ── each place, on its zone ─────────────────────────────────────────────
const zones = new Map();   // book -> { zone, zPath, here: [{ place, found, carried, due }], lost: [{ lost, found, carried }] }
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
  if (!held) continue;
  const where = `${place.book} ${place.ref}`;
  const found = findPlace(held.zone, place);
  if (found.fault) { fault(`${where}: ${found.fault}`); continue; }
  const carried = carriedAt(found, place), due = piecesDue(place), whole = holdsWhole(place);
  if (whole && carried.tags !== "none") { fault(`${where}: the pin holds the place whole, and its read words carry the tags ${JSON.stringify(found.reads.map((r) => r.tg ?? null))}`); continue; }
  if (carried.tags === "other") { fault(`${where}: its read words carry the tags ${JSON.stringify(found.reads.map((r) => r.tg ?? null))}, and the list gives ${JSON.stringify(place.words.map((w) => w.tag))}`); continue; }
  if (due === "tied" && carried.pieces !== "the list's") { fault(`${where}: the lattice gave the place pieces of its own, and the zone's are not the list's (${carried.pieces === "none" ? "it carries none" : JSON.stringify(found.word.pg)})`); continue; }
  if (due === "held" && carried.pieces !== "none") { fault(`${where}: the pin holds the place's pieces back, and the zone carries ${JSON.stringify(found.word.pg)}`); continue; }
  if (due === "written" && carried.pieces === "other") { fault(`${where}: the zone carries pieces that are not the list's (${JSON.stringify(found.word.pg)})`); continue; }
  held.here.push({ place, found, carried, due, whole });
}
// each lost tag, on its zone: the word its word place numbers, tagged by the projection, its one piece as it stood or as set
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
if (faults.length) refuse();
// at a place that carries a stroke, the word found by its surface is the word relay v179 numbers
for (const [at, s] of read.strokes.entries()) {
  if (!s.among_the_listed_places) continue;
  const P = s.on_the_place || {};
  const hit = ((zones.get(s.book) || {}).here || []).find((h) => h.place.lattice.i === P.i && h.place.lattice.j === P.j);
  const n = Number(String(paseq.lines[at].place).split(":")[2]);
  if (!hit) fault(`${s.book} ${s.ref}: the stroke facts call the place a listed place, and no listed place found on the zone stands at its position`);
  else if (wordNumberOf(hit.found.sec, hit.found.at) !== n) fault(`${s.book} ${s.ref}: the place found by its surface is word ${wordNumberOf(hit.found.sec, hit.found.at)} of its verse, and relay v179 numbers it ${n}`);
}
// no tag on a read word of several that no line names, in any work on disk
for (const book of zonesOnDisk(ZONES)) {
  const held = zones.get(book);
  const zone = held ? held.zone : gz(join(ZONES, `${book}.bin`));
  const owned = new Set((held ? held.here : []).map((h) => h.found.word));
  for (const x of severalReadWords(zone)) if (!owned.has(x.word) && x.reads.some((r) => r.tg !== undefined)) fault(`${book} ${x.sec.label}: a read word of ${x.word.s} carries a tag no line names`);
}
if (faults.length) refuse();

// ── what there is to do ─────────────────────────────────────────────────
const all = [...zones.values()].flatMap((z) => z.here), allLost = [...zones.values()].flatMap((z) => z.lost);
const toSet = allLost.filter((h) => h.carried === "as it stood");
// a place the pin holds whole is given nothing: no tag and no piece
const toTag = all.filter((h) => !h.whole && h.carried.tags === "none"), toLay = all.filter((h) => h.due === "written" && h.carried.pieces === "none");
const heldWhole = all.filter((h) => h.whole);
const count = (list, f) => list.reduce((n, h) => n + f(h), 0);
const tagged = (h) => h.place.words.filter((w) => w.tag !== null).length;
console.log(`${read.lines.length} lines · ${places.length} places on ${zones.size} zones · ${count(all, (h) => h.place.words.length)} read words, ${count(all, tagged)} with a main tag`);
console.log(`  tags: ${count(toTag, tagged)} to write at ${toTag.length} place(s) · ${count(all.filter((h) => !h.whole && h.carried.tags === "the list's"), tagged)} already written, the same · ${count(heldWhole, tagged)} at ${heldWhole.length} place(s) held whole by the pin${heldWhole.length ? ` (${heldWhole.map((h) => `${h.place.book} ${h.place.ref}`).join(", ")})` : ""}`);
console.log(`  pieces: ${toLay.length} place(s) to lay (${count(toLay, (h) => h.place.pieces.length)} pieces) · ${all.filter((h) => h.due === "written" && h.carried.pieces === "the list's").length} already laid, the same · ${all.filter((h) => h.due === "tied").length} place(s) whose own pieces are the list's (${count(all.filter((h) => h.due === "tied"), (h) => h.place.pieces.length)} pieces) · ${all.filter((h) => h.due === "held").length} held back by the pin${all.some((h) => h.due === "held") ? ` (${all.filter((h) => h.due === "held").map((h) => `${h.place.book} ${h.place.ref}`).join(", ")})` : ""}`);
console.log(`  strokes: ${read.strokes.length} of ${paseq.lines.length} lines equal relay ${paseq.pin.relay}'s list; nothing to write`);
if (read.pin.lost_tags) console.log(`  lost tags: ${allLost.length} place(s) · ${toSet.length} piece(s) to set with TAHOT's words · ${allLost.length - toSet.length} already set, the same${allLost.map((h) => ` · ${h.lost.book} ${h.lost.ref} word ${h.lost.word_number} ${h.lost.tag}: «${h.lost.was.g}» to «${h.lost.piece.g}»`).join("")}`);
for (const h of all) console.log(`  ${h.place.book} ${h.place.ref} · word ${wordNumberOf(h.found.sec, h.found.at)} · ${h.place.words.map((w) => `${w.letters} ${w.tag ?? "no main tag"}`).join(" · ")} · ${h.whole ? "held whole by the pin: no tag, no piece" : `pieces ${h.due}${h.due === "written" ? `: ${h.place.pieces.map((x) => x.g).join(" / ")}` : ""}`}`);
if (!toTag.length && !toLay.length && !toSet.length) { console.log("nothing to write"); process.exit(0); }
if (DRY) { console.log("--dry: nothing written"); process.exit(0); }

// ── the write ───────────────────────────────────────────────────────────
const toDo = new Set([...toTag, ...toLay, ...toSet]);
for (const { zone, zPath, here, lost } of zones.values()) {
  if (!here.some((h) => toDo.has(h)) && !lost.some((h) => toDo.has(h))) continue;
  // a lost tag's piece: TAHOT's words for the place, in the piece's own place among the word's fields
  for (const { lost: l, found } of lost) found.word.pg = [{ k: l.piece.k, g: l.piece.g, s: l.piece.s, r: l.piece.r }];
  for (const { place, found, due, whole } of here) {
    if (!whole) found.reads.forEach((r, i) => { if (place.words[i].tag !== null) r.tg = place.words[i].tag; });
    // the pieces, the word's last field: laid again where the zone carried them, so no earlier run shows in the bytes
    if (due === "written") { delete found.word.pg; found.word.pg = place.pieces.map((x) => ({ k: x.k, g: x.g, s: x.s, r: x.r })); }
  }
  const laid = here.filter((h) => h.due === "written"), wholeHere = here.filter((h) => h.whole);
  const ef = zone.emitted_from || (zone.emitted_from = {});
  ef.read_words = {
    rule_id: READ_WORDS_RULE_ID,
    applied_on: STAMP,
    applied_by: READ_WORDS_TOOL,
    pin: `${READ_WORDS_HOME}/PIN.json`,
    relay: read.pin.relay,
    letter: read.pin.letter,
    ...(read.pin.amendment ? { amended_by: { relay: read.pin.amendment.relay, letter: read.pin.amendment.letter } } : {}),
    list: { file: pinnedAt(read.pin, read.pin.read_words), sha256: read.pin.read_words.sha256, lines: read.pin.read_words.lines },
    ...(lost.length ? { lost_tags: { file: pinnedAt(read.pin, read.pin.lost_tags), sha256: read.pin.lost_tags.sha256, here: lost.map((h) => ({ ref: h.lost.ref, section_word: h.found.at, word: h.lost.word_number, tag: h.lost.tag, piece: h.lost.piece.g, stood: h.lost.was.g })) } } : {}),
    counts: {
      places: here.length, read_words: count(here, (h) => h.place.words.length), read_words_tagged: count(here.filter((h) => !h.whole), tagged),
      places_laid_with_the_lists_pieces: laid.length, places_whose_own_pieces_are_the_lists: here.filter((h) => h.due === "tied").length, places_whose_pieces_are_held_back: here.filter((h) => h.due === "held").length,
    },
    here: here.map((h) => ({ ref: h.place.ref, section_word: h.found.at, word: wordNumberOf(h.found.sec, h.found.at), tags: h.whole ? "held" : h.place.words.map((w) => w.tag), pieces: h.due })),
    // said of a place held whole only on a zone that holds one, so a zone that holds none keeps the words it had
    what: [
      "each of these places is written one way and read as two or three words. Each read word's own region carries its main tag as TAHOT writes it (tg; none where TAHOT gives none), so the reader asks each read word its own entry. Where the lattice gave the place no pieces, the word carries the read words' pieces in order (pg), and the reader draws the place's line from them; where it gave pieces, they stand and equal the list's; where the pin holds them back, the word carries none",
      ...(wholeHere.length ? ["Where the pin holds a place whole (its tags held), its read words carry no tag and the word no pieces, as before the list"] : []),
      ...(lost.length ? ["At a lost tag's place the lattice's piece carried no tag and no English of TAHOT's, because TAHOT writes its mark inside the word and the lattice's reader stopped at it; the projection reads the tag as the piece's own, and the word's piece carries TAHOT's words for the place where it carried MACULA's"] : []),
      "No word, position, count or key moved",
    ].join(". "),
  };
  typePostBuildWrite(zone, {
    tool: READ_WORDS_TOOL,
    fields: ["emitted_from.read_words", ...(here.length ? ["sections[].words[].w[].tg"] : []), ...(laid.length || lost.length ? ["sections[].words[].pg"] : [])],
    why: here.length
      ? `a read form of two or three words carried no tag for any of its words in the lattice the zone was projected from, and at some places no pieces; the corpus lane's list (relay v192${read.pin.amendment ? `, amended by relay ${read.pin.amendment.relay}` : ""}) gives each read word its main tag and its pieces${lost.length ? "; and a lattice piece that lost TAHOT's tag and English takes TAHOT's words for its place" : ""}`
      : "a lattice piece lost TAHOT's tag and English where TAHOT writes its mark inside the word; the corpus lane's list of lost tags gives the piece TAHOT's words for its place",
    expires: "with this zone's projection from the corpus lane's next lattice, which carries each read word's tag and pieces itself",
    stamp: STAMP,
  });
  writeZone(zPath, zone);
  console.log(`wrote ${zPath} · ${here.length} place(s)`);
}
