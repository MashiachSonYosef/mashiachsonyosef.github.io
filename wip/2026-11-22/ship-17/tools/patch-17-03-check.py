# Ship 17, patch 3 (22 November 2026): tools/check-spelling-bridge-v1.mjs holds bridge v1.1 and the places it lays.
# B1 reads v1.1 beside v1 and holds it to v1, line by line; B3 holds that the places of new pieces the pin does not lay,
# the places held within their class among them, carry none; B4 and B5 owe, where STEP's own reading stands (call 4,
# the default picks' index), STEP's words under STEP's credit, as the page draws them ahead of the place's pieces, and
# hold those words to be the pieces drawn; B6, new, holds each laid piece's words to its part as STEP writes it, by a
# road of its own.
# Each replacement's old text must occur once; a replacement whose new text stands already is passed.
# Usage: python3 -I patch-17-03-check.py <reader dir>
import io, sys
p = sys.argv[1] + "/tools/check-spelling-bridge-v1.mjs"; s = io.open(p, encoding="utf-8").read()
done = []
def swap(old, new):
    global s
    if s.count(new) == 1 and (old not in new or s.count(old) == 1): done.append("stands"); return
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new); done.append("applied")

swap("""// for the place writes it. What a zone carries for a laid place is said
// once, in tools/spelling-bridge-v1.mjs, and judged by it here. The laws:
//
//   B1  the pin's files are the bytes it names, and the lane's receipt
//       names the three lists the same; the list recounts to the lane's own
//       counts; every class of the list is named by the pin, laid or not,
//       with the list's count; each laid place's pieces are STEP's, in
//       order, and spell our letters; one form row of the relay is named
//       for the place, under its key, and its words cut at the stroke are
//       the pieces' English, the brackets aside; and each reading the pin
//       names is the list's
""", """// for the place writes it. What a zone carries for a laid place is said
// once, in tools/spelling-bridge-v1.mjs, and judged by it here.
//
// SHIP 17 (22 November 2026; the lane's relay v214, bridge v1.1). The pin
// reads v1.1 beside v1 and lays the other places of new pieces too, each
// piece worded by its part of STEP's column as written, its ends trimmed;
// it holds within their class the places whose pieces carry STEP's «}+» tag,
// the places that are pairs, and the places call 4 of relay v189 holds as they
// rest (STEP's words written with « | »), and the places where call 4 makes
// STEP's own reading stand. Those were laid in ship 17's first build: the
// page asks the default source's layer before the place's pieces, so the line
// at rest stayed STEP's words under STEP's credit, and the pieces read the
// place a second way beside it, on its card (check-compspan-coverage-v1 C3)
// and across words under a source pressed (check-rulings-under-sources-v1
// U8). They wait for the page lane. B4 and B5 still owe, at any laid place the
// default picks' index marks as standing, STEP's words under STEP's credit,
// and hold them to be the pieces drawn. The laws:
//
//   B1  the pin's files are the bytes it names, v1's and v1.1's, and the
//       lane's receipts name the lists the same, v1.1's reading v1's files
//       as the pin names them; each line of v1.1, its added fields taken
//       off, is v1's line; the list recounts to the lane's own counts; every
//       kind of the list (its class, its use and what holds it within its
//       class) is named by the pin, laid or not, with the list's count; each
//       laid place's pieces are STEP's, in order, and spell our letters, and
//       each piece's part as v1.1 writes it is its row's column cut at the
//       stroke, the marks off it giving v1's English; at a place worded by
//       its form row, one form row of relay v202 is named for the place,
//       under its key, and its words cut at the stroke are the pieces'
//       parts as v1.1 writes them, byte for byte; and each reading the pin
//       names is the list's
""")

swap("""//   B3  nothing else is written: each zone's record names the list and its
//       laid places as a recount gives them, and its write is typed; a zone
//       with no laid place carries no record; and a place of the list the
//       lattice gives no pieces that the pin does not lay carries none
//   B4  in the record of the lines at rest, the line over every laid place
//       is its pieces in order as the page draws them with the signs at
//       rest, under that word alone, credited to the pieces' source; and
//       each reading the pin names is recorded so
//   B5  on the page as a first visit opens it, in each book the pin names a
//       reading of: the line under every laid place of the book is its
//       pieces; and the card opened on a named place stands on the place's
""", """//   B3  nothing else is written: each zone's record names v1.1's list, the
//       list it extends and its laid places as a recount gives them, and its
//       write is typed; a zone with no laid place carries no record; and
//       every place of the list the lattice gives no pieces that the pin
//       does not lay carries none, each place held within its class found
//       on its zone (STEP's «}+» places, the pairs, the places call 4
//       holds and the places where call 4 makes STEP's reading stand)
//   B4  in the record of the lines at rest, the line over every laid place
//       is its pieces in order as the page draws them with the signs at
//       rest, under that word alone, credited to the pieces' source; but
//       where STEP's own reading stands (the default picks' index marks the
//       place [n, words, 1]) it is STEP's own words, drawn so, credited to
//       STEP's reading, and those words drawn are the place's pieces drawn;
//       and each reading the pin names is recorded so
//   B6  the words as STEP writes them, by a road of its own: on every laid
//       place's zone word, each piece's words are its part of STEP's column
//       as v1.1's own line for the place writes it, its ends trimmed where
//       the place is worded as written, byte for byte where its form row
//       words it; and the part with its square and angle brackets taken
//       out, its spaces closed and its ends trimmed, character by character,
//       is v1's English for the piece on v1's own line
//   B5  on the page as a first visit opens it, in each book the pin names a
//       reading of: the line under every laid place of the book is as B4
//       owes it; and the card opened on a named place stands on the place's
""")

swap("""//   --node   the laws that open no page (B1 to B4)
""", """//   --node   the laws that open no page (B1 to B4, and B6)
""")

swap("""  SPELLING_BRIDGE_RULE_ID, SPELLING_BRIDGE_HOME, SPELLING_BRIDGE_TOOL, PIECE_SOURCE, readBridge, receiptAgainst, laidOf, findBridgePlace, carriedAt, namedReadings,
} from "./spelling-bridge-v1.mjs";
""", """  SPELLING_BRIDGE_RULE_ID, SPELLING_BRIDGE_HOME, SPELLING_BRIDGE_TOOL, PIECE_SOURCE, readBridge, receiptAgainst, v11Against, heldOf, laidOf, findBridgePlace, carriedAt, namedReadings,
} from "./spelling-bridge-v1.mjs";
""")

swap("""const CREDIT = `PIECE:${PIECE_SOURCE.toUpperCase()}`;
""", """const CREDIT = `PIECE:${PIECE_SOURCE.toUpperCase()}`;
// WHERE STEP'S OWN READING STANDS (steps-reading-stands-rule-v1; ship 17, 22 November 2026). The page asks the default
// source's layer before the place's pieces (zone.html, lineUnder), and at a place call 4 of relay v189 marks, STEP's own
// pick 1 is the line under STEP whatever today's line is (defaultAtWord), credited to STEP's reading. The default picks'
// index marks those places [n, words, 1], n the word's place counted over every entry of the zone, marks included, in
// section order (the page's WORD_N). Read on the page before and after the pieces were laid (ship 17's probe): there
// the line at rest keeps STEP's words and STEP's credit, and the card gains the place's reading above its pills.
const PICKS_INDEX = join(K3, "data", "default-picks", "index.json");
const picks = existsSync(PICKS_INDEX) ? JSON.parse(readFileSync(PICKS_INDEX, "utf8")) : null;
const STEP_CREDIT = ((((picks && picks.sources) || []).find((x) => x && x.id === "step") || {}).m || {}).r || null;
const standsIn = new Map();   // book -> Map(n -> STEP's words), where STEP's reading stands
const standsOf = (book) => {
  if (!standsIn.has(book)) standsIn.set(book, new Map(((((picks && picks.books) || {})[book] || {}).step_words || []).filter((r) => Array.isArray(r) && r[2] === 1).map((r) => [r[0], r[1]])));
  return standsIn.get(book);
};
const placeN = (zone, si, at) => { let n = 0; for (let i = 0; i < si; i += 1) n += ((zone.sections[i] || {}).words || []).length; return n + at + 1; };
""")

swap("""  if (bridge) {
    faults.push(...receiptAgainst(bridge));
    const got = laidOf(bridge);
""", """  if (bridge) {
    faults.push(...receiptAgainst(bridge));
    faults.push(...v11Against(bridge));
    const got = laidOf(bridge);
""")

swap("""  check("B1  the pin's files are the bytes it names and the lane's receipt names the three lists the same; the list recounts to the lane's own counts; every class is named by the pin, laid or not, with the list's count; each laid place's pieces are STEP's and spell our letters, one form row is named for it, and its words cut at the stroke are the pieces' English, the brackets aside; each named reading is the list's",
    !!bridge && faults.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : `relay ${bridge.pin.relay} · list ${bridge.pin.places.sha256.slice(0, 12)} · ${nf(bridge.places.length)} places in ${counts.size} classes · ${nf(laid.length)} laid (${nf(laid.reduce((s, p) => s + p.pieces.length, 0))} pieces; ${laid.filter((p) => /[\\[<]/u.test(p.words)).length} whose words carry a bracket of STEP's) · ${namedReadings(bridge.pin).length} readings named`);
}""", """  const by = (xs, f) => { const m = new Map(); for (const x of xs) m.set(f(x), (m.get(f(x)) || 0) + 1); return [...m].map(([k, v]) => `${k} ${nf(v)}`).join(", "); };
  const rowWorded = laid.filter((p) => p.worded === "form_row"), rowPieces = rowWorded.flatMap((p) => p.pieces);
  const heldBy = (l) => heldOf(l, bridge.call4);
  const held = bridge ? (bridge.places11 || []).filter(heldBy) : [];
  check("B1  the pin's files are the bytes it names, v1's and v1.1's, and the lane's receipts name the lists the same; each line of v1.1, its added fields off, is v1's line; the list recounts to the lane's own counts; every kind is named by the pin, laid or not, with the list's count; each laid place's pieces are STEP's and spell our letters, each piece's part as v1.1 writes it is its row's column cut at the stroke and the marks off it give v1's English; a place worded by its form row has one, whose parts are the parts as v1.1 writes them byte for byte; each named reading is the list's",
    !!bridge && faults.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : `relays ${bridge.pin.relay} and ${bridge.pin.v1_1.relay} · list v1.1 ${bridge.pin.v1_1.places.sha256.slice(0, 12)}, extending v1 ${bridge.pin.places.sha256.slice(0, 12)} · ${nf(bridge.places11.length)} places in ${counts.size} kinds · ${nf(laid.length)} laid (${nf(laid.reduce((s, p) => s + p.pieces.length, 0))} pieces; by class ${by(laid, (p) => p.cls)}; worded ${by(laid, (p) => p.worded)}; ${laid.filter((p) => /[\\[<]/u.test(p.words)).length} whose words carry a bracket of STEP's) · held within a class: ${by(held, heldBy)} (call 4's hold read from ${bridge.call4.file} ${bridge.call4.sha256.slice(0, 12)}, ${bridge.call4.holding ? `${nf(bridge.call4.places.size)} places it holds` : "its landing holds nothing now"}, ${bridge.call4.landing_stands ? `${nf(bridge.call4.stands.size)} where STEP's reading stands` : "its landing makes none stand now"}) · at the ${nf(rowWorded.length)} worded by their form rows each part is v1.1's byte for byte (${nf(rowPieces.length)} pieces, ${nf(rowPieces.filter((q) => q.g !== q.g.trim()).length)} keeping STEP's space at an end, which the page trims) · ${namedReadings(bridge.pin).length} readings named`);
}""")

swap("""    if (rec.rule_id !== SPELLING_BRIDGE_RULE_ID || rec.applied_by !== SPELLING_BRIDGE_TOOL || rec.relay !== bridge.pin.relay || (rec.list || {}).sha256 !== bridge.pin.places.sha256 || (rec.list || {}).lines !== bridge.pin.places.lines)
      faults.push(`${book}: its record does not name the rule, the tool, the relay or the list as the pin does`);""", """    if (rec.rule_id !== SPELLING_BRIDGE_RULE_ID || rec.applied_by !== SPELLING_BRIDGE_TOOL || rec.relay !== bridge.pin.v1_1.relay || (rec.list || {}).sha256 !== bridge.pin.v1_1.places.sha256 || (rec.list || {}).lines !== bridge.pin.v1_1.places.lines || (rec.extends || {}).sha256 !== bridge.pin.places.sha256)
      faults.push(`${book}: its record does not name the rule, the tool, the relay, the list or the list it extends as the pin does`);""")

swap("""  // a place the lattice gives no pieces and the pin does not lay: found the same way where it is a plain word, it carries none
  const laidIds = new Set(laid.map(saidOf));
  for (const l of bridge.places) {
    if (l.use !== "NEW_PIECES" || laidIds.has(`${l.book} ${l.place}`)) continue;
    const zone = readZone(l.book), m = /^(\\d+):(\\d+):(\\d+)$/u.exec(String(l.place));
    if (!zone || !m) continue;
    const sec = (zone.sections || []).find((s) => s.label === l.ref);
    const word = sec ? (sec.words || []).filter((w) => !w.mark)[Number(m[3]) - 1] : null;
    if (!word || word.s !== (l.lattice_v12 || {}).surface) continue;
    unlaid += 1;
    if (word.pg !== undefined) faults.push(`${l.book} ${l.place} (${l.class}): the pin does not lay it, and the word carries pieces`);
  }
  check("B3  nothing else is written: each zone's record names the list and its laid places as a recount gives them, and its write is typed; a zone with no laid place carries no record; and a place of the list the lattice gives no pieces that the pin does not lay carries none",
    faults.length === 0 && records === byBook.size,
    faults.length ? `${faults.length} · ${first(faults)}` : `${records} zones' records recount · ${without} zones on disk with no laid place carry none · ${nf(unlaid)} places the pin does not lay carry no pieces`);""", """  // a place the lattice gives no pieces and the pin does not lay: found the same way, it carries none; a place held within
  // its class (heldOf: STEP's «}+» places, the pairs, the places call 4 holds) is found, or it is a fault, since whether it
  // carries any could not be said
  const laidIds = new Set(laid.map(saidOf));
  const heldSeen = new Map();
  for (const l of bridge.places11) {
    if (l.use !== "NEW_PIECES" || laidIds.has(`${l.book} ${l.place}`)) continue;
    const why = heldOf(l, bridge.call4);
    const zone = readZone(l.book), m = /^(\\d+):(\\d+):(\\d+)$/u.exec(String(l.place));
    const sec = zone && m ? (zone.sections || []).find((s) => s.label === l.ref) : null;
    const word = sec ? (sec.words || []).filter((w) => !w.mark)[Number(m[3]) - 1] : null;
    if (!word || word.s !== (l.lattice_v12 || {}).surface) { if (why) faults.push(`${l.book} ${l.place} (held: ${why}): not found on its zone by its verse, its word number and the lattice's surface`); continue; }
    unlaid += 1;
    if (why) heldSeen.set(why, (heldSeen.get(why) || 0) + 1);
    if (word.pg !== undefined) faults.push(`${l.book} ${l.place} (${l.class}${why ? `, held: ${why}` : ""}): the pin does not lay it, and the word carries pieces`);
  }
  check("B3  nothing else is written: each zone's record names v1.1's list, the list it extends and its laid places as a recount gives them, and its write is typed; a zone with no laid place carries no record; and every place of the list the lattice gives no pieces that the pin does not lay carries none, each place held within its class found on its zone",
    faults.length === 0 && records === byBook.size,
    faults.length ? `${faults.length} · ${first(faults)}` : `${records} zones' records recount · ${without} zones on disk with no laid place carry none · ${nf(unlaid)} places the pin does not lay carry no pieces${heldSeen.size ? ` (held within their class: ${[...heldSeen].map(([k, v]) => `${nf(v)} ${k}`).join(", ")})` : ""}`);""")

swap("""const NAMED = namedReadings(bridge.pin);
{
  const faults = [], named = [];
  let lines = 0;""", """const NAMED = namedReadings(bridge.pin);
// the line owed at rest over a laid place: STEP's own words, drawn, under STEP's credit, where its reading stands there;
// the place's pieces drawn under the pieces' credit elsewhere (WHERE STEP'S OWN READING STANDS, above)
const owedAtRest = (x) => {
  const pieces = drawn(x.place), w = standsOf(x.place.book).get(placeN(readZone(x.place.book), x.found.si, x.found.at));
  return w === undefined ? { text: pieces, credit: CREDIT, stands: false, pieces } : { text: signsOff(printedForm(w)), credit: STEP_CREDIT, stands: true, pieces };
};
{
  const faults = [], named = [];
  let lines = 0, standing = 0;""")

swap("""    const want = drawn(x.place);
    if (!unit || unit[1] !== 1 || unit[2] !== want || unit[3] !== CREDIT) { faults.push(`${saidOf(x.place)}: the record's line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"}) under ${unit[1]} word(s)` : "nothing"}, and its pieces read «${want}» (${CREDIT})`); continue; }
    lines += 1;
    if (NAMED.some((r) => r.book === book && r.place === x.place.place)) named.push(`${(readZone(book) || {}).work || book} ${x.place.ref} «${unit[2]}»`);
  }
  check("B4  in the record of the lines at rest, the line over every laid place is its pieces in order as the page draws them with the signs at rest, under that word alone, credited to the pieces' source; and each reading the pin names is recorded so",
    faults.length === 0 && lines === laid.length && named.length === NAMED.length,
    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${nf(lines)} lines are their place's pieces (${CREDIT}) · ${named.join(" · ")}`);
}""", """    const want = owedAtRest(x);
    if (want.stands && want.text !== want.pieces) { faults.push(`${saidOf(x.place)}: STEP's reading stands here, and its words drawn «${want.text}» are not the place's pieces drawn «${want.pieces}»`); continue; }
    if (!unit || unit[1] !== 1 || unit[2] !== want.text || unit[3] !== want.credit) { faults.push(`${saidOf(x.place)}: the record's line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"}) under ${unit[1]} word(s)` : "nothing"}, and ${want.stands ? "STEP's reading, which stands here, reads" : "its pieces read"} «${want.text}» (${want.credit})`); continue; }
    lines += 1;
    if (want.stands) standing += 1;
    if (NAMED.some((r) => r.book === book && r.place === x.place.place)) named.push(`${(readZone(book) || {}).work || book} ${x.place.ref} «${unit[2]}»`);
  }
  check("B4  in the record of the lines at rest, the line over every laid place is its pieces in order as the page draws them with the signs at rest, under that word alone, credited to the pieces' source, or, where STEP's own reading stands, STEP's words credited to STEP's reading, which are the pieces drawn; and each reading the pin names is recorded so",
    faults.length === 0 && lines === laid.length && named.length === NAMED.length,
    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${nf(lines)} lines are their place's pieces (${nf(lines - standing)} credited ${CREDIT}; ${nf(standing)} where STEP's reading stands, its words the pieces', credited ${STEP_CREDIT}) · ${named.join(" · ")}`);
}

// ---- B6: the words as STEP writes them, by a road of its own ----------------------------------------
{
  const faults = [];
  const v1At = new Map(bridge.places.map((l) => [`${l.book} ${l.place}`, l]));
  const v11At = new Map(bridge.places11.map((l) => [`${l.book} ${l.place}`, l]));
  // the marks taken off a part, character by character: every square and angle bracket out, every run of white space
  // one space, none at the ends (the lane's v1.1 RULE, section 2)
  const marksOff = (t) => { let o = "", gap = false; for (const c of String(t)) { if (c === "[" || c === "]" || c === "<" || c === ">") continue; if (/\\s/u.test(c)) { gap = true; continue; } if (gap && o) o += " "; gap = false; o += c; } return o; };
  let pieces = 0, trimmed = 0, kept = 0;
  for (const x of at) {
    const l = v11At.get(saidOf(x.place)), l1 = v1At.get(saidOf(x.place));
    const pg = Array.isArray(x.found.word.pg) ? x.found.word.pg : [], ps = l && Array.isArray(l.pieces) ? l.pieces : [];
    if (!l || !l1 || pg.length !== ps.length) { faults.push(`${saidOf(x.place)}: the zone word carries ${pg.length} piece(s), and v1.1's line for the place ${l ? ps.length : "is not found"}`); continue; }
    for (const [i, q] of ps.entries()) {
      const part = String(q.english_tahot_as_written), g = String((pg[i] || {}).g), owed = x.place.worded === "form_row" ? part : part.trim();
      const v1 = String((((l1.pieces || [])[i]) || {}).english_tahot);
      if (g !== owed) faults.push(`${saidOf(x.place)} piece ${i + 1}: the zone carries «${g}», and its part as STEP writes it is «${part}»${x.place.worded === "form_row" ? "" : ", owed with its ends trimmed"}`);
      else if (marksOff(part) !== v1) faults.push(`${saidOf(x.place)} piece ${i + 1}: «${part}» with the marks off is «${marksOff(part)}», and v1's English is «${v1}»`);
      else { pieces += 1; if (x.place.worded === "form_row") kept += 1; else trimmed += 1; }
    }
  }
  check("B6  the words as STEP writes them, by a road of its own: on every laid place's zone word each piece's words are its part of STEP's column as v1.1's line writes it, its ends trimmed where the place is worded as written, byte for byte where its form row words it; and the part, the marks off, is v1's English for the piece",
    faults.length === 0 && at.length === laid.length,
    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${nf(pieces)} pieces at ${nf(at.length)} places: ${nf(trimmed)} their part with its ends trimmed, ${nf(kept)} their part byte for byte (worded by their form rows), every part with the marks off v1's English`);
}""")

swap("""          const unit = (got.sections[0].units || []).find((u) => u[0] <= x.found.at && x.found.at < u[0] + Math.max(1, u[1])) || null;
          const want = drawn(x.place);
          if (!unit || unit[1] !== 1 || unit[2] !== want || unit[3] !== CREDIT) { faults.push(`${saidOf(x.place)}: the line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"})` : "nothing"}, and its pieces read «${want}» (${CREDIT})`); continue; }
          read.lines += 1;""", """          const unit = (got.sections[0].units || []).find((u) => u[0] <= x.found.at && x.found.at < u[0] + Math.max(1, u[1])) || null;
          const want = owedAtRest(x);
          if (want.stands && want.text !== want.pieces) { faults.push(`${saidOf(x.place)}: STEP's reading stands here, and its words drawn «${want.text}» are not the place's pieces drawn «${want.pieces}»`); continue; }
          if (!unit || unit[1] !== 1 || unit[2] !== want.text || unit[3] !== want.credit) { faults.push(`${saidOf(x.place)}: the line reads ${unit ? `«${unit[2]}» (${unit[3] || "no credit"})` : "nothing"}, and ${want.stands ? "STEP's reading, which stands here, reads" : "its pieces read"} «${want.text}» (${want.credit})`); continue; }
          read.lines += 1;
          if (want.stands) read.standing = (read.standing || 0) + 1;""")

swap("""  check("B5  on the page as a first visit opens it, in each book the pin names a reading of: the line under every laid place of the book is its pieces, and the card opened""", """  check("B5  on the page as a first visit opens it, in each book the pin names a reading of: the line under every laid place of the book is as B4 owes it, and the card opened""")

swap("""    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${read.lines} lines in ${books.length} books are their place's pieces · the cards: ${read.cards.join(" · ")}`);""", """    faults.length ? `${faults.length} · ${first(faults, 4)}` : `${read.lines} lines in ${books.length} books are their place's pieces (${read.standing || 0} of them STEP's reading, which stands there) · the cards: ${read.cards.join(" · ")}`);""")

io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print(f"{p}: {len(done)} replacements, {done.count('applied')} applied, {done.count('stands')} standing already")
