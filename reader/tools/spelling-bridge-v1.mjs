// Synthesis lane · the one reading of the corpus lane's spelling bridge (relays v202 and v214): the places whose pieces a zone carries
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
// BRIDGE V1.1 (the corpus lane's relay v214 of 21 November 2026; ship 17, 22
// November 2026). v1 took STEP's square and angle brackets off each piece's
// English, so ship 11d could word only the places a form row of the same relay
// is named for (206), the form rows keeping STEP's column whole. v1.1 is v1's
// lines in v1's order, every v1 field as v1 wrote it, with three fields more:
// on each piece its part of STEP's Translation column as STEP writes it
// (english_tahot_as_written, brackets and the space after the stroke kept) and
// where it comes from, and on each line its rows' columns whole. So the other
// places of new pieces can be worded as STEP writes them. v1's files stay
// pinned as they are, as what v1.1 extends, and v1.1 is read only where each
// of its lines, its added fields taken off, is v1's line, key order and all.
//
// WHAT A ZONE CARRIES FOR A LAID PLACE, said here once for the tool that
// writes it (tools/apply-spelling-bridge-v1.mjs) and the check that holds it
// (tools/check-spelling-bridge-v1.mjs):
//
//   pieces   the word carries the place's pieces (pg), each as a zone writes
//            a piece: its letters (ours, as the list cuts them), its English,
//            its source and its role. The English is STEP's own words for
//            the place as STEP writes them, by the road the pin names for the
//            place's class (`words`):
//              form_row    the words of the one form row of relay v202 named
//                          for the place (landed, or listed as not landed
//                          because the store already printed it), cut at the
//                          stroke, each part kept as it is cut: the 206 places
//                          ship 11d laid on 21 November 2026. Each part is held
//                          to the piece's part as v1.1 writes it, byte for
//                          byte, so nothing laid there moves.
//              as_written  the piece's part as v1.1 writes it, with the spaces
//                          taken off its ends, as the lane's letter says to do
//                          when the pieces are joined (ship 17).
//            Either way the piece's part is its row's column cut at the
//            stroke, and the marks taken off it (STEP's square and angle
//            brackets out, runs of spaces closed to one, the ends trimmed)
//            give v1's English for the piece (the lane's v1.1 RULE, section
//            2); a place where they do not is a fault, and nothing is laid.
//            The reader draws the place's line from the pieces as it does at
//            every place that carries them (zone.html, placeLine), each piece
//            trimmed, so the space a form row keeps after the stroke draws
//            nothing.
//   tags     none are written. A zone's tag is the lattice's, and the place
//            keeps what it carries (the pin's `tags` says so and counts it).
//
// HELD WITHIN A CLASS (22 November 2026). Two kinds of place of new pieces are
// held whatever their class, said here once, and the pin names each with its
// count (`held`), the list recounted:
//   a_piece_whose_tag_is_not_plain   a piece's tag is not «H», digits and
//            letters. STEP writes «{H4648G}+» where one tag goes on over the
//            next Hebrew word, and v1 cut it to «H4648G}+», so the piece is not
//            read as the word's own and at some places the roles move (the
//            lane's v214 letter, section 5). The lane mends it in bridge v1.2
//            (relay v218); the place waits for the mend and is not read around
//            the fault.
//   a_pair   the lattice's surface writes a pair, a written form and a read
//            form (round and square brackets): the zone's word there is a pair,
//            whose line a zone carries by its own rule, and the bridge lays
//            pieces on a plain word only.
//   a_place_call_4_holds   call 4 of the corpus lane's relay v189 writes
//            STEP's words at the place with « | », one written word read as
//            two of STEP's, and the house holds the place's line as it rests
//            until the corpus lane says how STEP's line reads there (the
//            owner's question 2, put back to the lane). The bridge does not
//            lay pieces past that hold (the page lane's call, 22 November
//            2026): at Psalms 44:15 they would print «not + peoples» where the
//            word reads «among the peoples». The places are read as the hold
//            itself reads them, never listed here: call 4's landing in the
//            audit calls' pin, while it still holds the class of STEP's words
//            written with « | », and the list that landing names, the bytes
//            the default picks' bake (the list's one reader) reads through its
//            own pin, every place whose STEP's words hold « | » (the bake's
//            SPLIT). When the lane answers call 4 and the hold is lifted, the
//            same rule lets them in.
//   a_place_where_steps_reading_stands   call 4 makes STEP's own pick 1 the
//            line at the place whatever today's line is (its action
//            steps_words_are_the_line, STEP's words holding no « | »; the
//            default picks' bake marks the place so and the page asks it before
//            the place's pieces). Laid there, the pieces left the line as it was
//            and read the place a second way beside it (ship 17's suite, 22
//            November 2026): the card opened on the whole word, STEP's pick
//            pressed, with the place's pieces said above it as «here STEP
//            reads» (check-compspan-coverage-v1 C3, Amos 1:10), and under a
//            source pressed a reading across two words kept the pieces where
//            the line as it rests is STEP's words (check-rulings-under-sources-v1
//            U8, Esther 9:18). The place waits until the page lane says how a
//            place both read is drawn. Read from the same record as the hold
//            above: call 4's list, while its landing lands that action.
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

/** The pin and the files it names, each read only as the bytes the pin names: v1's (relay v202) and v1.1's (relay
 *  v214), which extends them. Throws PinFault, in words. */
export const readBridge = (pinPath) => {
  if (!existsSync(pinPath)) throw new PinFault(`${pinPath} is not here`);
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  if (pin.schema_version !== "SPELLING_BRIDGE_PIN_V1") throw new PinFault(`${pinPath}: schema ${pin.schema_version}, not SPELLING_BRIDGE_PIN_V1`);
  if (pin.rule_id !== SPELLING_BRIDGE_RULE_ID) throw new PinFault(`${pinPath}: its rule_id is not ${SPELLING_BRIDGE_RULE_ID}`);
  for (const k of ["rule", "receipt", "places", "form_rows_not_landed"]) if (!pin[k] || !pin[k].file) throw new PinFault(`${pinPath} names no ${k}`);
  if (!pin.form_rows || !pin.form_rows.at) throw new PinFault(`${pinPath} names no form rows`);
  const v = pin.v1_1;
  if (!v || !v.folder || v.extends !== pin.folder) throw new PinFault(`${pinPath} names no v1.1 of the list that extends ${pin.folder}`);
  for (const k of ["rule", "receipt", "places"]) if (!v[k] || !v[k].file) throw new PinFault(`${pinPath} names no ${k} of v1.1`);
  const home = dirname(pinPath);
  const take = (d, lines = false) => (lines ? readPinnedLines : readPinned)(join(home, pin.folder, d.file), d, `${pin.folder}/${d.file}`);
  take(pin.rule);
  const receipt = JSON.parse(take(pin.receipt).toString("utf8"));
  const landed = readPinnedLines(join(home, pin.form_rows.at), pin.form_rows, pin.form_rows.at);
  const take11 = (d, lines = false) => (lines ? readPinnedLines : readPinned)(join(home, v.folder, d.file), d, `${v.folder}/${d.file}`);
  take11(v.rule);
  const receipt11 = JSON.parse(take11(v.receipt).toString("utf8"));
  return { pin, receipt, places: take(pin.places, true), landed, notLanded: take(pin.form_rows_not_landed, true), receipt11, places11: take11(v.places, true), call4: call4HoldOf(home, pin, pinPath) };
};

// CALL 4'S HOLD, read as the house makes it (HELD WITHIN A CLASS, above): STEP's words written with « | », the
// default picks' bake's SPLIT (tools/bake-default-picks-v1.mjs)
export const CALL4_SPLIT = " | ";
/** The places call 4 holds as they rest, by «book c:v:w», with where they were read: { places, holding, file, sha256,
 *  listed }. Read through the pin's `held_with_call_4`: the audit calls' pin, call 4's landing there and the list it
 *  names, held to the bytes the default picks' pin names for the bake. Throws PinFault, in words. */
const call4HoldOf = (home, pin, pinPath) => {
  const c = pin.held_with_call_4;
  if (!c || !c.audit_calls_pin || !Number.isInteger(c.call) || !c.tool_pin || !c.tool_entry) throw new PinFault(`${pinPath} names no audit calls' pin, call, and tool's pin for call 4's hold (held_with_call_4)`);
  const ap = join(home, c.audit_calls_pin), tp = join(home, c.tool_pin);
  if (!existsSync(ap) || !existsSync(tp)) throw new PinFault(`${pinPath}: ${existsSync(ap) ? c.tool_pin : c.audit_calls_pin} is not here, so call 4's hold cannot be read`);
  const audit = JSON.parse(readFileSync(ap, "utf8")), tool = JSON.parse(readFileSync(tp, "utf8"));
  const landing = (Array.isArray(audit.landings) ? audit.landings : []).find((x) => x && x.call === c.call);
  const entry = landing && audit.lists ? audit.lists[landing.list] : null;
  if (!landing || !entry || !entry.file) throw new PinFault(`${c.audit_calls_pin} names no landing of call ${c.call} and its list`);
  const list = readPinnedLines(join(dirname(ap), audit.folder, entry.file), entry, `${audit.folder}/${entry.file}`);
  const read = tool[c.tool_entry];
  if (!read || read.bytes !== entry.bytes || read.sha256 !== entry.sha256) throw new PinFault(`${c.tool_pin} names call ${c.call}'s list for its bake (${c.tool_entry}) as other bytes than ${c.audit_calls_pin} does`);
  // the hold stands while call 4's landing still holds the class of STEP's words written with « | »
  const holding = (Array.isArray(landing.holds) ? landing.holds : []).some((h) => String((h && h.class) || "").includes(`«${CALL4_SPLIT}»`));
  const places = new Set(holding ? list.filter((d) => d && typeof d.steps_words === "string" && d.steps_words.includes(CALL4_SPLIT)).map((d) => `${d.book} ${d.p}`) : []);
  // where STEP's reading stands: the action the pin names, while call 4's landing lands it, STEP's words holding no « | »
  if (typeof c.stands_action !== "string" || !c.stands_action) throw new PinFault(`${pinPath} names no action of call 4 that makes STEP's reading stand (held_with_call_4.stands_action)`);
  const landing_stands = String(landing.lands || "").includes(c.stands_action);
  const stands = new Set(landing_stands ? list.filter((d) => d && d.action === c.stands_action && typeof d.steps_words === "string" && !d.steps_words.includes(CALL4_SPLIT)).map((d) => `${d.book} ${d.p}`) : []);
  return { places, holding, stands, landing_stands, file: `${audit.folder}/${entry.file}`, sha256: entry.sha256, listed: list.length };
};

/** Where the lane's receipts and the pin part: v1's receipt names its three lists by the pin's bytes and sha256; v1.1's
 *  names its list and its rule so, and reads v1's files, which it extends, as the pin names them. [] where they agree. */
export const receiptAgainst = ({ pin, receipt, receipt11 }) => {
  const out = [];
  const said = new Map((Array.isArray(receipt && receipt.outputs) ? receipt.outputs : []).map((o) => [o.file, o]));
  for (const [d, file] of [[pin.places, pin.places.file], [pin.form_rows_not_landed, pin.form_rows_not_landed.file], [pin.form_rows, String(pin.form_rows.at).split("/").pop()]]) {
    const o = said.get(file);
    if (!o || o.bytes !== d.bytes || o.sha256 !== d.sha256) out.push(`the lane's receipt names ${file} as ${o ? `${o.bytes} bytes, ${String(o.sha256).slice(0, 12)}` : "nothing"}, and the pin as ${d.bytes} bytes, ${String(d.sha256).slice(0, 12)}`);
  }
  const v = pin.v1_1 || {}, r11 = receipt11 || {};
  const said11 = new Map((Array.isArray(r11.outputs) ? r11.outputs : []).map((o) => [o.file, o]));
  const o = said11.get(v.places.file);
  if (!o || o.bytes !== v.places.bytes || o.sha256 !== v.places.sha256) out.push(`the lane's v1.1 receipt names ${v.places.file} as ${o ? `${o.bytes} bytes, ${String(o.sha256).slice(0, 12)}` : "nothing"}, and the pin as ${v.places.bytes} bytes, ${String(v.places.sha256).slice(0, 12)}`);
  if (!r11.rule || r11.rule.file !== v.rule.file || r11.rule.sha256 !== v.rule.sha256) out.push(`the lane's v1.1 receipt names its rule as ${r11.rule ? `${r11.rule.file} ${String(r11.rule.sha256).slice(0, 12)}` : "nothing"}, and the pin as ${v.rule.file} ${String(v.rule.sha256).slice(0, 12)}`);
  // the files of v1 v1.1 was built from (its receipt's input «bridge v1»), against the pin's own entries for them
  const read = ((r11.inputs || {})["bridge v1"] || {}).files || {};
  for (const [d, file] of [[pin.rule, pin.rule.file], [pin.receipt, pin.receipt.file], [pin.places, pin.places.file], [pin.form_rows_not_landed, pin.form_rows_not_landed.file], [pin.form_rows, String(pin.form_rows.at).split("/").pop()]]) {
    const f = read[file];
    if (!f || f.bytes !== d.bytes || f.sha256 !== d.sha256) out.push(`the lane's v1.1 receipt read v1's ${file} as ${f ? `${f.bytes} bytes, ${String(f.sha256).slice(0, 12)}` : "nothing"}, and the pin names it as ${d.bytes} bytes, ${String(d.sha256).slice(0, 12)}`);
  }
  return out;
};

// THE FIELDS V1.1 ADDS (its RULE, section 3), on each piece and on each line. Taken off, each line of v1.1 is v1's line.
export const ADDED_ON_A_PIECE = ["english_tahot_as_written", "english_tahot_as_written_from"];
export const ADDED_ON_A_LINE = ["translation_columns_as_tahot_writes_them"];
/** v1.1 against v1, line by line: each line carries the added fields, and with them taken off is v1's line, every
 *  field and its order (v1's lines are their own JSON, so this is v1's line byte for byte). [] where it holds. */
export const v11Against = ({ places, places11 }) => {
  const out = [];
  if (places11.length !== places.length) out.push(`v1.1 holds ${places11.length} lines, and v1 ${places.length}`);
  for (const [at, l] of places11.entries()) {
    const where = `v1.1 line ${at + 1} (${l.book} ${l.place})`;
    if (!Array.isArray(l[ADDED_ON_A_LINE[0]])) { out.push(`${where} carries no ${ADDED_ON_A_LINE[0]}`); continue; }
    if ((Array.isArray(l.pieces) ? l.pieces : []).some((x) => !x || typeof x[ADDED_ON_A_PIECE[0]] !== "string" || !x[ADDED_ON_A_PIECE[1]])) { out.push(`${where}: a piece carries no part as STEP writes it, or not where it comes from`); continue; }
    const x = JSON.parse(JSON.stringify(l));
    for (const k of ADDED_ON_A_LINE) delete x[k];
    for (const q of Array.isArray(x.pieces) ? x.pieces : []) for (const k of ADDED_ON_A_PIECE) delete q[k];
    if (JSON.stringify(x) !== JSON.stringify(places[at])) out.push(`${where}, its added fields taken off, is not v1's line ${at + 1}`);
  }
  return out;
};

// THE PLACES HELD WITHIN A CLASS (HELD WITHIN A CLASS, above), each reason by its name in the pin
export const HELD = {
  a_piece_whose_tag_is_not_plain: "a piece's tag is not «H», digits and letters (STEP's «}+»; the lane mends it in bridge v1.2, relay v218)",
  a_pair: "the lattice's surface writes a pair, and the bridge lays pieces on a plain word only",
  a_place_call_4_holds: "call 4 of relay v189 writes STEP's words here with « | », and the house holds the line as it rests until the corpus lane says how STEP's line reads there",
  a_place_where_steps_reading_stands: "call 4 of relay v189 makes STEP's own pick 1 the line here, and the page asks it before the place's pieces: laid, the place would be read two ways, its card and a reading across words disagreeing with its line, until the page lane says how a place both read is drawn",
};
const PLAIN_TAG = /^H[0-9A-Za-z]+$/u;
const PAIR_MARKS = /[()\[\]]/u;
/** What holds a place of new pieces within its class, by HELD's name, or null; a place of any other use is held by its
 *  use. `call4` is readBridge's call4 (the places call 4 holds); the reasons are asked in HELD's order. */
export const heldOf = (l, call4) => {
  if (!l || l.use !== "NEW_PIECES") return null;
  if ((Array.isArray(l.pieces) ? l.pieces : []).some((x) => !PLAIN_TAG.test(String((x && x.tag) || "")))) return "a_piece_whose_tag_is_not_plain";
  if (PAIR_MARKS.test(String((l.lattice_v12 || {}).surface || ""))) return "a_pair";
  if (!call4 || !(call4.places instanceof Set)) throw new PinFault("call 4's hold was not read, so a place it holds cannot be told");
  if (call4.places.has(`${l.book} ${l.place}`)) return "a_place_call_4_holds";
  if (!(call4.stands instanceof Set)) throw new PinFault("call 4's standing places were not read, so a place where STEP's reading stands cannot be told");
  if (call4.stands.has(`${l.book} ${l.place}`)) return "a_place_where_steps_reading_stands";
  return null;
};
// THE ROADS A LAID CLASS IS WORDED BY (WHAT A ZONE CARRIES, above), by their names in the pin
export const WORDED = { form_row: "the place's one form row of relay v202, cut at the stroke", as_written: "each piece's part as v1.1 writes it, its ends trimmed" };

// a class, its use and what holds it within its class, as one name
const kindOf = (cls, use, held) => `${cls} · ${use === null || use === undefined ? "no pieces" : use}${held ? ` · held: ${held}` : ""}`;
// STEP's words for a piece with its square and angle brackets taken off, the spaces closed: how the list writes a piece's
// English (v1), and the marks taken off of v1.1's RULE, section 2
const bracketsAside = (t) => String(t ?? "").replace(/[\[\]<>]/gu, "").replace(/\s+/gu, " ").trim();
const idOf = (book, place) => `${book} ${place}`;

/** The list read against the pin: the places the pin lays, each ready for a zone.
 *    { laid, counts, faults }
 *  `laid` holds, in the list's order, { book, ref, place, n, surface, key, cls, worded, words, as_written, tag, pieces }:
 *  the verse, the place as the list writes it (chapter:verse:word), the word's
 *  number in its verse, the lattice's surface, our letters, the place's class,
 *  the road its words come by (form_row or as_written), STEP's own words for the
 *  place (its form row's, or the pieces' parts as v1.1 writes them, joined at the
 *  stroke), each piece's part as v1.1 writes it, the core piece's tag (kept for
 *  the record, never written) and the pieces as a zone writes a piece
 *  ({ k, g, s, r }). The list read is v1.1 (it holds every field of v1).
 *  `counts` is the list by class, use and what holds a place within its class,
 *  recounted. `faults` says, in words, every kind the pin does not name or
 *  miscounts, and every laid place that is not as the rule above has it, and
 *  every reading the pin names that the list does not give. */
export const laidOf = ({ pin, places11, landed, notLanded, call4 }) => {
  const faults = [], laid = [], counts = new Map();
  const lays = Array.isArray(pin.laid) ? pin.laid : [], leaves = Array.isArray(pin.not_laid) ? pin.not_laid : [];
  const named = new Map();
  for (const [list, lay] of [[lays, true], [leaves, false]]) for (const e of list) {
    const k = kindOf(e.class, e.use, e.held);
    if (named.has(k)) faults.push(`the pin names ${k} twice`);
    if (e.held && !Object.prototype.hasOwnProperty.call(HELD, e.held)) faults.push(`the pin holds ${k} for a reason this reading does not know`);
    if (lay && !Object.prototype.hasOwnProperty.call(WORDED, e.words)) faults.push(`the pin lays ${k} by a road this reading does not know (${JSON.stringify(e.words ?? null)})`);
    named.set(k, { lay, places: e.places, words: e.words });
  }
  // the form rows by the place they are named for
  const rowAt = new Map();
  for (const [rows, file] of [[landed, "the landed form rows"], [notLanded, pin.form_rows_not_landed.file]]) for (const [at, r] of rows.entries()) {
    if (typeof r.key !== "string" || typeof r.route !== "string" || !Array.isArray(r.places)) { faults.push(`${file} line ${at + 1}: names no key, words or places`); continue; }
    for (const p of r.places) (rowAt.get(idOf(p.book, p.place)) || rowAt.set(idOf(p.book, p.place), []).get(idOf(p.book, p.place))).push(r);
  }
  for (const [at, l] of places11.entries()) {
    const where = `${pin.v1_1.places.file} line ${at + 1} (${l.book} ${l.place})`;
    const k = kindOf(l.class, l.use, heldOf(l, call4));
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
    // each piece's part as v1.1 writes it: its row's column cut at the stroke, and the marks off it give v1's English
    const rowsOf = Array.isArray(l.tahot_rows) ? l.tahot_rows : [], cols = Array.isArray(l.translation_columns_as_tahot_writes_them) ? l.translation_columns_as_tahot_writes_them : [];
    const asWritten = [];
    let wrong = null;
    for (const x of given) {
      const t = x.english_tahot_as_written, from = x.english_tahot_as_written_from || {}, ri = rowsOf.indexOf(from.row);
      if (typeof t !== "string") { wrong = `piece ${x.index + 1} carries no part as STEP writes it`; break; }
      if (from.column !== 3 || ri < 0 || typeof cols[ri] !== "string" || cols[ri].split("/")[from.part] !== t) { wrong = `piece ${x.index + 1}'s part «${t}» is not part ${from.part} of its row's column as the line writes it`; break; }
      if (bracketsAside(t) !== x.english_tahot) { wrong = `piece ${x.index + 1}: the marks taken off «${t}» give «${bracketsAside(t)}», and v1's English is «${x.english_tahot}»`; break; }
      asWritten.push(t);
    }
    if (wrong) { faults.push(`${where}: ${wrong}`); continue; }
    let parts = null, words = null;
    if (how.words === "form_row") {
      const rows = rowAt.get(idOf(l.book, l.place)) || [];
      if (rows.length !== 1) { faults.push(`${where}: ${rows.length} form rows are named for the place`); continue; }
      const row = rows[0];
      if (row.key !== l.key_ours) { faults.push(`${where}: its form row stands under another key`); continue; }
      parts = row.route.split("/");
      if (parts.length !== given.length || parts.some((t, i) => !t.trim() || bracketsAside(t) !== bracketsAside(given[i].english_tahot))) { faults.push(`${where}: its form row reads «${row.route}», and its pieces ${given.map((x) => `«${x.english_tahot}»`).join(" ")}`); continue; }
      // the form row's parts are the pieces' parts as v1.1 writes them, byte for byte (ship 17's comparison at the 206)
      if (parts.some((t, i) => t !== asWritten[i])) { faults.push(`${where}: its form row's parts are ${parts.map((t) => `«${t}»`).join(" ")}, and v1.1 writes the pieces' parts ${asWritten.map((t) => `«${t}»`).join(" ")}`); continue; }
      words = row.route;
    } else {
      parts = asWritten.map((t) => t.trim());
      if (parts.some((t) => !t)) { faults.push(`${where}: a piece's part as STEP writes it is empty once its ends are trimmed`); continue; }
      words = asWritten.join("/");
    }
    const cores = given.filter((x) => x.role === "core" && x.tag).map((x) => String(x.tag));
    laid.push({ book: l.book, ref: l.ref, place: l.place, n: Number(m[3]), surface: L.surface, key: l.key_ours, cls: l.class, worded: how.words, words, as_written: asWritten, tag: cores.length === 1 ? cores[0] : cores.length ? cores : null,
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
