#!/usr/bin/env node
// GUARDS: made-spaces-rule-v1-a-space-our-build-put-where-a-tag-stood-closes-at-print-as-the-corpus-lanes-list-names-it
// LEDGER: M R D
// it writes, on the rows of the sources the corpus lane's lists name (M), the
// places of the route text (R) and of the definition text (D) that close at
// print. No place is decided here and no text is changed.
//
// THE SPACE IN «Amos , an Israelite prophet» IS OURS, AND IT CLOSES AT PRINT.
//
// The provider's file holds `<def>Amos</def>, an Israelite prophet`. Our own
// build turns a field of that XML into served text in one step whose first
// act puts one space where each tag stood, so the store serves a space before
// the comma that the provider never wrote. The corpus lane traces every such
// space, source by source, and its rule stands beside its lists (RULE.md in
// each relay's folder under data/made-spaces/): a space is MADE when the
// provider's file holds tags and no whitespace there, and a made space CLOSES
// unless closing would join two things the provider's markup alone held
// apart. One list per source names, for each served text that holds a made
// space, the places that close, counted from 0 in UTF-16 units of the text.
//
// THE LISTS COME RELAY BY RELAY (data/made-spaces/PIN.json names each: v168,
// 12 November 2026 AD, the two Open Scriptures dictionaries; v178, 13
// November, the unabridged BDB; v188.1, 14 November, the first two again as
// they stand once the lane's landing v188 is in the store, in v168's place,
// with a new receipt for the third). A relay's folder is kept as the corpus
// lane keeps it, byte for byte, and each list is read with the receipt its
// entry names: which source it is, the store it was read from, the counts
// the lane states. A list is matched to its receipt by its bytes (its
// sha256, its size, its count of lines) and never by its name: v188.1's
// receipts are the builders' own and name the lists as the builders did,
// while the files as shipped carry the relay's names. A source has one
// list; a second naming it is refused.
//
// A relay may also name texts where a space must NEVER close (`never_closed`
// in the pin). The unabridged BDB's opening of a sense had whole Hebrew
// words taken out of it by our build, each leaving one space: «often named
// with , and then». That space stands for words of the provider's and is not
// a made space. No list closes one, and a list line that named such a place
// among its closes would be refused here.
//
// This tool writes the lists onto the rows. NOTHING IN A TEXT IS CHANGED: the
// route text and the definition text stay the bytes the corpus lane serves,
// because every list, ledger, lattice and strike names a row by those bytes.
// What is written is one more slot:
//
//   row[9] = [the route text's closes or null, the definition text's or null]
//
// on a row of a listed source whose route text or definition text is a line
// of its source's list with at least one close, and on no other row. A row
// with no close carries none: the slot is absent, or stands empty where the
// row carries a later one (its facts, slot 10). The readers take the characters at
// those places out when they print (tools/gloss-store-v1.mjs: closed,
// routePrinted, recordPrinted, readingsOf; zone.html: the same names), after
// the ledger's division, so no cut moves: a piece cut from a route text takes
// the closes that fall inside it.
//
// REFUSED, each in words and with nothing written:
//   - a file that is not the bytes its pin names, or a pin that names other
//     bytes than the corpus lane's own receipt of that relay gives a list, or
//     another rule than the one that receipt names for its lists;
//   - a receipt that read a store no page served as such (v188.1's read
//     «4d1357b26ca5+v188») whose pin does not say what store that is
//     (read_at), or says another;
//   - a line that is not well formed: a text listed twice, a close that is
//     not a space of its text, closes out of order, or a `prints` that is not
//     the text with its closes taken out;
//   - a close at a place the same source's never-closed file names;
//   - a list whose source the store does not hold under that m id and key, or
//     a second list for a source;
//   - a row that carries a print slot (row[8]) and a close on its route text:
//     the print slot's texts are written by the ledger tool from the served
//     bytes, and nothing here says where a close falls inside one. None does
//     today. The corpus lane's next ledger with print fields writes each
//     print text already closed (relay v178, section 4), and that is where
//     the two are joined;
//   - a row of a source no list names that carries the slot;
//   - a row of the span store whose text is a line with a close (the lane
//     read that store too and found none; its rows carry no such slot);
//   - while a source's rows are the rows its list was read from: a line whose
//     row counts are not the store's, or rows holding a close that are not
//     the count the corpus lane's receipt states;
//   - where a receipt read a served store with a landing laid on it (THE
//     SECOND ROAD, tools/made-spaces-second-road-v1.mjs): a line whose row
//     counts, or a source whose rows and rows holding a close, are not the
//     receipt's less the rows the row-strikes record took since that store
//     and the lines of the landing the page did not land, and less, for the
//     rows holding a close, the rows a round retexted since without folding
//     (their old texts lose them; the rows stay); or records that cannot say
//     how the two stores differ;
//   - rows the row-strikes record says a round retexted from words back
//     (below) when the pin names no list of them, or not the list that round
//     landed; a line of that list that is not well formed; or a row so
//     retexted that does not serve its words back in both its texts, or
//     stands at its key and rank other than once.
//
// THE WORDS BACK (ship 6, relay v187). A row of the unabridged BDB whose
// opening of a sense lost Hebrew words to our build takes them back by key
// and rank (tools/derive-words-back-v1.mjs lists the rows, and
// tools/strike-rows-v1.mjs retexts them, rule v7). Its new text is no line of
// any relay's list: it takes its closes from the list that round landed
// (data/made-spaces/PIN.json, words_back.derived.retext), by its key and
// rank, where its route text is that list's words back, on both halves of
// slot 9 as the retext wrote them. Those rows and closes are counted apart
// (rows_closed_from_words_back, closes_from_words_back), since no relay's
// receipt counts them; the rows' old texts lose them on the second road.
//
// WHEN ARE A SOURCE'S ROWS THE ROWS ITS LIST WAS READ FROM? When the store is
// the version the relay's receipt names; or when every move of the store
// since that version is this rule's own, which changes no text; or when the
// source's rows hold exactly the texts they held when an earlier run found
// them so. The index keeps two sha256 of each source's rows, each row as its
// key, its route text and its definition text (index.made_spaces.sources):
// texts_sha256, the rows as they stand, and texts_sha256_as_read, the rows as
// they stood when a run last found them the rows the list was read from.
// While the two are the same the rows are those rows, and texts_are_as_read
// says so. A ledger answered anew, a year written or an entry set on a row
// moves the store's version and none of these texts, and the counts are
// still held. After a row of the source is struck, landed or re-keyed the
// two differ, the same comparisons are recorded and no longer refuse: the
// closes of every text the list names still hold. A receipt that read a
// served store with a landing laid on it is never on that first road, since
// no served store is the one it read: its counts are held by the second
// road, on every run.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints
// and writes nothing. --on gives the moment the run is recorded under
// (tools/step-moment-v1.mjs); with none it is the clock's. Its last line of
// counts is its figures as JSON, for a script that holds a run to what was
// rehearsed.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { MADE_SPACES_RULE_ID, CLOSES_SLOT, closed, setSlot } from "./gloss-store-v1.mjs";
import { secondRoad, fallOf } from "./made-spaces-second-road-v1.mjs";
import { readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { RECORD_FILE } from "./row-strikes-follow-v1.mjs";
import { givenMoment, momentOf } from "./step-moment-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const SPAN = arg("span-store", join(K3, "data", "span-store"));
const LISTS = arg("lists", join(K3, "data", "made-spaces"));
const RECEIPT = arg("receipt", join(K3, "data", "made-spaces-receipt-v1.json"));
const HOME = "reader/data/made-spaces";   // where the relays' folders stand in the repository, as the index and the receipt name them
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// the moment the run is recorded under, where one is given (read before anything else, so a moment that is none stops here)
let GIVEN_ON = null;
try { GIVEN_ON = givenMoment(); } catch (e) { refuse(e.message); }

// ---- the relays, as the corpus lane wrote them -----------------------------------------
const pinPath = join(LISTS, "PIN.json");
if (!existsSync(pinPath)) refuse(`the pin of the made-spaces lists is missing (${pinPath})`);
const pin = JSON.parse(readFileSync(pinPath, "utf8"));
if (pin.schema_version !== "MADE_SPACES_PIN_V3" || !Array.isArray(pin.relays) || !pin.relays.length) refuse(`the pin names no relays (${pinPath}: MADE_SPACES_PIN_V3 is one entry per relay whose lists are read)`);
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const pinned = (relay, p, folder = relay.folder) => {
  const name = `${folder}/${p.file}`, path = join(LISTS, folder, p.file);
  if (!existsSync(path)) refuse(`${name} is named in the pin and is not here`);
  const bytes = readFileSync(path);
  if (bytes.length !== p.bytes || sha256(bytes) !== p.sha256) refuse(`${name} is not the bytes its pin names (${bytes.length} bytes, ${sha256(bytes)}; the pin: ${p.bytes}, ${p.sha256})`);
  return bytes;
};
// the lines of a pinned file, each parsed, the count held to the pin's
const jsonLines = (bytes, name, count) => {
  const text = bytes.toString("utf8");
  if (!text.endsWith("\n")) refuse(`${name} does not end in a line end`);
  const raw = text.slice(0, -1).split("\n");
  if (raw.length !== count) refuse(`${name} holds ${raw.length} lines and its pin says ${count}`);
  return raw.map((s, at) => { try { return JSON.parse(s); } catch (e) { return refuse(`${name} line ${at + 1} is not JSON (${e.message})`); } });
};
// the source a relay's receipt gives a file, held to the store's own name for that m id
const held = (relay, src) => {
  const mine = (index.m_sources || {})[src.m_id];
  if (!mine || mine.key !== src.source_key || mine.label !== src.label) refuse(`${src.m_id} is ${mine ? `${mine.key} (${mine.label})` : "no source"} in the store and ${src.source_key} (${src.label}) in the corpus lane's receipt of relay ${relay.relay}`);
  return src;
};
// a pinned file and a file the receipt names are the same bytes: the same sha256, size and count of lines. A receipt
// may name a file otherwise than it was shipped (relay v188.1's are the builders' own), so a name decides nothing
const sameBytes = (theirs, p) => !!theirs && theirs.sha256 === p.sha256 && theirs.bytes === p.bytes && theirs.lines === p.lines;
// the source the receipt gives a pinned file's bytes to: `slot` reads, of one of the receipt's sources, the file it gives it
const sourceOf = (relay, theirs, p, slot) => {
  const name = `${relay.folder}/${p.file}`;
  if (!(theirs.outputs || []).some((o) => sameBytes(o, p))) refuse(`the corpus lane's receipt of relay ${relay.relay} names no output of the bytes its pin names for ${name} (${p.lines} lines, ${p.bytes} bytes, ${p.sha256})`);
  const srcs = (theirs.sources || []).filter((s) => sameBytes(slot(s), p));
  if (srcs.length !== 1) refuse(`the corpus lane's receipt of relay ${relay.relay} gives the bytes of ${name} to ${srcs.length} sources`);
  return held(relay, srcs[0]);
};

const LISTED = new Map();   // m id -> { key, label, relay, file, sha256, lines: Map(text -> line), theirs, readAt }
const NEVER = new Map();    // m id -> { key, relay, file, sha256, places: Map(text -> the spaces of the text that stand for words taken out) }
const RELAYS = [];          // each relay as the index names it
const FOUND_NONE = [];      // the sources a relay's receipt says it read and found no made space in
for (const relay of pin.relays) {
  pinned(relay, relay.rule);
  const theirs = JSON.parse(pinned(relay, relay.receipt).toString("utf8"));   // the corpus lane's own receipt: which source each list is, and its counts
  // the rule its lists were built under, as the receipt names it, is a rule this pin holds: the relay's own, or the one
  // of the relay whose lists it reissues (lists_rule)
  const listsRule = relay.lists_rule || relay.rule;
  if (relay.lists_rule) pinned(relay, relay.lists_rule, relay.lists_rule.folder);
  if (!theirs.rule || theirs.rule.sha256 !== listsRule.sha256) refuse(`the corpus lane's receipt of relay ${relay.relay} names ${String((theirs.rule || {}).sha256).slice(0, 12)} as the rule of its lists, and the pin holds ${String(listsRule.sha256).slice(0, 12)}`);
  const readAt = (((theirs.inputs || {}).route_store || {}).store_version) || null;   // the store version this relay's lists were read from
  if (!readAt) refuse(`the corpus lane's receipt of relay ${relay.relay} names no store version it read`);
  // a served store's version is twelve hex characters; a receipt that read anything else read a store no page served
  // as such, and its pin says what store that is
  const servedAsSuch = /^[0-9a-f]{12}$/u.test(readAt);
  if (servedAsSuch ? !!relay.read_at : !relay.read_at || relay.read_at.store_version !== readAt) refuse(`the corpus lane's receipt of relay ${relay.relay} read the store «${readAt}»${servedAsSuch ? ", a served store's version, and its pin gives it a read_at" : relay.read_at ? `, and its pin's read_at says «${relay.read_at.store_version}»` : ", which is no served store's version, and its pin does not say what store that is (read_at)"}`);
  RELAYS.push({ relay: relay.relay, of: relay.of, letter: relay.letter, from: relay.from, folder: `${HOME}/${relay.folder}`, rule: `${HOME}/${relay.folder}/${relay.rule.file}`,
    receipt: `${HOME}/${relay.folder}/${relay.receipt.file}`, read_at_store_version: readAt });
  for (const p of relay.lists || []) {
    const src = sourceOf(relay, theirs, p, (s) => s.list), name = `${relay.folder}/${p.file}`;
    if (LISTED.has(src.m_id)) refuse(`two lists name ${src.m_id}: ${LISTED.get(src.m_id).file} and ${name}`);
    const lines = new Map();
    jsonLines(pinned(relay, p), name, p.lines).forEach((l, at) => {
      const where = `${name} line ${at + 1}`;
      if (typeof l.text !== "string" || !l.text || !Array.isArray(l.closes) || typeof l.prints !== "string") refuse(`${where} names no text, no closes or no prints`);
      if (lines.has(l.text)) refuse(`${where} names a text an earlier line names: «${l.text.slice(0, 60)}»`);
      l.closes.forEach((c, i) => {
        if (!Number.isInteger(c) || c < 0 || c >= l.text.length || l.text[c] !== " ") refuse(`${where}: the close at ${c} is not a space of the text «${l.text.slice(0, 60)}»`);
        if (i && c <= l.closes[i - 1]) refuse(`${where}: its closes are not in rising order`);
      });
      for (const c of l.kept || []) if (!Number.isInteger(c) || l.text[c] !== " " || l.closes.includes(c)) refuse(`${where}: the kept place ${c} is not a space of the text, or is one of its closes`);
      if (closed(l.text, l.closes) !== l.prints) refuse(`${where}: its prints is not its text with the closes taken out`);
      lines.set(l.text, l);
    });
    LISTED.set(src.m_id, { key: src.source_key, label: src.label, relay: relay.relay, file: name, sha256: p.sha256, lines, theirs: src, readAt, readAtIs: relay.read_at || null });
  }
  for (const p of relay.never_closed || []) {
    const src = sourceOf(relay, theirs, p, (s) => (s.words_taken_out || {}).list), name = `${relay.folder}/${p.file}`;
    if (NEVER.has(src.m_id)) refuse(`two never-closed files name ${src.m_id}: ${NEVER.get(src.m_id).file} and ${name}`);
    const places = new Map();
    jsonLines(pinned(relay, p), name, p.lines).forEach((l, at) => {
      const where = `${name} line ${at + 1}`;
      if (typeof l.text !== "string" || !l.text || !Array.isArray(l.at)) refuse(`${where} names no text or no places`);
      if (places.has(l.text)) refuse(`${where} names a text an earlier line names: «${l.text.slice(0, 60)}»`);
      // a place is the space that stands for the words, or the text's start or end where the words stood there
      for (const a of l.at) if (!Number.isInteger(a) || a < 0 || a > l.text.length || (a > 0 && a < l.text.length && l.text[a] !== " ")) refuse(`${where}: the place ${a} is not a space of the text, its start or its end`);
      places.set(l.text, l.at.filter((a) => l.text[a] === " "));
    });
    NEVER.set(src.m_id, { key: src.source_key, relay: relay.relay, file: name, sha256: p.sha256, places });
  }
  for (const s of theirs.sources || []) if (s.list === null) { held(relay, s); FOUND_NONE.push({ m: s.m_id, key: s.source_key, relay: relay.relay }); }
}
// a space that stands for words taken out never closes
for (const [m, L] of LISTED) {
  const N = NEVER.get(m);
  if (N) for (const [text, l] of L.lines) {
    const stands = N.places.get(text) || [];
    const hit = l.closes.find((c) => stands.includes(c));
    if (hit !== undefined) refuse(`${L.file}: the close at ${hit} of «${text.slice(0, 60)}» is a space ${N.file} says stands for words taken out`);
  }
}

// ---- the words back: the rows a round retexted from BDB's words, and the closes the list that landed them gives ----
const WB = new Map();   // `${m}\u0001${key}\u0001${rank}` -> { m, key, rank, text, closes, met }
let wbList = null;
{
  const recordPath = join(LISTS, "..", RECORD_FILE);
  const rounds = existsSync(recordPath) ? (JSON.parse(readFileSync(recordPath, "utf8")).rounds || []) : [];
  const took = rounds.map((r) => ({ r, rows: (r.rows || []).filter((x) => x.action === "retext" && x.from_slot === "words_back") })).filter((x) => x.rows.length);
  if (took.length) {
    const d = (pin.words_back || {}).derived || {};
    if (!d.folder || !d.retext) refuse(`the row-strikes record holds ${took.length} round(s) that retexted rows from words back, and the pin names no list of them (words_back.derived.retext)`);
    if (took.length !== 1 || !took[0].r.list || took[0].r.list.sha256 !== d.retext.sha256) refuse(`rows were retexted from words back by ${took.length} round(s) (${took.map((x) => (x.r.list ? x.r.list.file : "no list")).join(", ")}), not once by the list the pin names (${d.folder}/${d.retext.file})`);
    const name = `${d.folder}/${d.retext.file}`;
    let lines;
    try { lines = readPinnedLines(join(LISTS, d.folder, d.retext.file), d.retext, name); } catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
    const byId = new Map();
    lines.forEach((l, at) => {
      const where = `${name} line ${at + 1}`;
      if (l.from_slot !== "words_back" || typeof l.to_text !== "string" || !l.to_text || !Array.isArray(l.closes) || typeof l.prints !== "string") refuse(`${where} names no words back, closes or prints`);
      if (!LISTED.has(String(l.m))) refuse(`${where} retexts a row of ${l.m}, which no list names`);
      l.closes.forEach((c, i) => { if (!Number.isInteger(c) || l.to_text[c] !== " " || (i > 0 && c <= l.closes[i - 1])) refuse(`${where}: its closes are not spaces of its words back in rising order`); });
      if (closed(l.to_text, l.closes) !== l.prints) refuse(`${where}: its prints is not its words back with the closes taken out`);
      const id = `${l.m}\u0001${l.key}\u0001${l.rank}`;
      if (byId.has(id)) refuse(`${where} names a row an earlier line names`);
      byId.set(id, l);
    });
    // the rows the round retexted, each a line of the list with the words the round wrote (a line left off is no row of it)
    for (const x of took[0].rows) {
      const id = `${x.m}\u0001${x.key}\u0001${x.rank}`, l = byId.get(id);
      if (!l || l.to_text !== x.to_text) refuse(`the row-strikes record says ${x.m} ${x.key} rank ${x.rank} took words back that ${name} does not give it`);
      WB.set(id, { m: String(x.m), key: x.key, rank: x.rank, text: l.to_text, closes: l.closes, met: 0 });
    }
    wbList = { list: `${HOME}/${name}`, sha256: d.retext.sha256, round: { ran_at: took[0].r.ran_at, list: took[0].r.list.file } };
  }
}

// ---- every row of the store ----------------------------------------------------------------
const tally = {};
const of = (m) => (tally[m] ||= { rows: 0, rows_with_a_close_on_the_route_text: 0, rows_with_a_close_on_the_definition_text: 0, rows_with_a_close_on_either: 0,
  closes_on_route_texts: 0, closes_on_definition_texts: 0, rows_a_ledger_divides_with_a_close_on_the_route_text: 0, closes_that_stand_at_a_ledgers_cut: 0,
  rows_serving_a_text_with_words_taken_out: 0, rows_retexted_from_words_back: 0, rows_closed_from_words_back: 0, closes_from_words_back: 0, rows_moved: 0 });
const served = new Map();   // m id -> Map(text -> [rows serving it as the route text, as the definition text])
const texts = new Map();    // m id -> one line per row of the source: its key, its route text, its definition text
const closesOf = (L, text) => { const l = L.lines.get(String(text ?? "")); return l && l.closes.length ? l.closes : null; };
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
const touched = [];
for (const name of shardNames) {
  const path = join(STORE, "shards", name);
  const body = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
  let moved = 0;
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    const m = String(row[3]), L = LISTED.get(m);
    if (!L) {
      if ((row[CLOSES_SLOT] ?? null) !== null) refuse(`${name} ${k}: a row of ${m}, which no list names, carries the closes slot`);
      continue;
    }
    const t = of(m); t.rows += 1;
    (texts.get(m) || texts.set(m, []).get(m)).push(JSON.stringify([k, row[1] ?? null, row[2] ?? null]));
    const seen = (served.get(m) || served.set(m, new Map()).get(m));
    for (const f of [1, 2]) { const s = String(row[f] ?? ""); if (L.lines.has(s)) (seen.get(s) || seen.set(s, [0, 0]).get(s))[f - 1] += 1; }
    const N = NEVER.get(m);
    if (N && (N.places.has(String(row[1] ?? "")) || N.places.has(String(row[2] ?? "")))) t.rows_serving_a_text_with_words_taken_out += 1;
    // a row that took its words back: its closes are the ones the list that landed it gives, counted apart
    const wb = WB.get(`${m}\u0001${k}\u0001${row[0]}`);
    if (wb) {
      if (row[1] !== wb.text || row[2] !== wb.text) refuse(`${name} ${k} (${m}, rank ${row[0]}): the row-strikes record says this row took its words back, and it does not serve them in both its texts`);
      if (wb.closes.length && Array.isArray(row[8])) refuse(`${name} ${k} (${m}, rank ${row[0]}): the row carries a print slot and a close on the words it took back`);
      wb.met += 1; t.rows_retexted_from_words_back += 1;
      if (wb.closes.length) { t.rows_closed_from_words_back += 1; t.closes_from_words_back += wb.closes.length; }
      const want = wb.closes.length ? [wb.closes, wb.closes] : null;
      if (same(row[CLOSES_SLOT] ?? null, want)) continue;
      t.rows_moved += 1; moved += 1;
      if (DRY) continue;
      setSlot(row, CLOSES_SLOT, want);
      continue;
    }
    const route = closesOf(L, row[1]), definition = closesOf(L, row[2]);
    if (route) {
      if (Array.isArray(row[8])) refuse(`${name} ${k} (${m}, rank ${row[0]}): the row carries a print slot and a close on its route text «${String(row[1]).slice(0, 60)}»`);
      t.rows_with_a_close_on_the_route_text += 1; t.closes_on_route_texts += route.length;
      const cuts = Array.isArray(row[7]) ? row[7] : [];
      if (cuts.length) { t.rows_a_ledger_divides_with_a_close_on_the_route_text += 1; t.closes_that_stand_at_a_ledgers_cut += route.filter((c) => cuts.includes(c)).length; }
    }
    if (definition) { t.rows_with_a_close_on_the_definition_text += 1; t.closes_on_definition_texts += definition.length; }
    if (route || definition) t.rows_with_a_close_on_either += 1;
    const want = route || definition ? [route, definition] : null;
    const has = row[CLOSES_SLOT] ?? null;
    if (same(has, want)) continue;
    t.rows_moved += 1; moved += 1;
    if (DRY) continue;
    setSlot(row, CLOSES_SLOT, want);   // a later slot stays where it is
  }
  if (moved) { touched.push(name); if (!DRY) writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 })); }
}
for (const wb of WB.values()) if (wb.met !== 1) refuse(`${wb.m} ${wb.key} rank ${wb.rank}, which the row-strikes record says took its words back, stands ${wb.met} times in the store`);

// ---- the span store: read, never written ---------------------------------------------------
let spanRows = 0;
if (existsSync(join(SPAN, "index.json"))) {
  for (const f of readdirSync(SPAN).filter((x) => /^[a-z0-9-]+\.json$/u.test(x) && x !== "index.json").sort()) {
    const file = JSON.parse(readFileSync(join(SPAN, f), "utf8"));
    for (const rows of Object.values(file.keys || {})) for (const r of rows) {
      const L = r && Array.isArray(r.slots) ? LISTED.get(String(r.slots[3])) : null;
      if (!L) continue;
      spanRows += 1;
      if (closesOf(L, r.slots[1]) || closesOf(L, r.slots[2])) refuse(`the span store's ${f} holds a row of ${r.slots[3]} whose text is a list line with a close: «${String(r.slots[1]).slice(0, 60)}»`);
    }
  }
}

// ---- are a source's rows the rows its list was read from ----------------------------------
const history = index.store_version_history || [];
// every move the store has made since it was the version `from` is this rule's, which changes no text: the moves
// from the last one that started there, each starting where the one before ended, the last ending at the store's version
const movedOnlyByThisRule = (from) => {
  const at = history.map((h) => h.was).lastIndexOf(from);
  if (at < 0) return false;
  const since = history.slice(at);
  return since.every((h, i) => h.why === MADE_SPACES_RULE_ID && (!i || h.was === since[i - 1].now)) && since[since.length - 1].now === index.store_version;
};
const recorded = ((index.made_spaces || {}).sources) || {};
// the sha256 a source's rows had when a run last found them the rows its list was read from, as the index keeps it
// for the same relay's reading. A record written before the index kept it apart held one sha256 and the flag:
// where that flag says the rows were as read, its sha256 is the one.
const asReadWas = (m, L) => {
  const r = recorded[m];
  if (!r || r.read_at_store_version !== L.readAt) return null;
  return r.texts_sha256_as_read !== undefined ? r.texts_sha256_as_read : r.texts_are_as_read === true ? r.texts_sha256 : null;
};
const asRead = (m, L, fingerprint) => {
  if (index.store_version === L.readAt) return "the store is the version the list was read from";
  if (movedOnlyByThisRule(L.readAt)) return "every move of the store since that version is this rule's, which changes no text";
  if (asReadWas(m, L) === fingerprint) return "the source's rows hold the texts they held when an earlier run found them as read";
  return null;
};

// ---- the second road: a receipt that read a served store with a landing laid on it ---------
// one road for the sources whose receipts read the same store; null for a source whose receipt read a served store
const roads = new Map();
const secondOf = (L) => {
  if (!L.readAtIs) return null;
  const id = JSON.stringify(L.readAtIs);
  if (!roads.has(id)) roads.set(id, secondRoad({ data: join(LISTS, ".."), index, readAt: L.readAtIs, listed: [...LISTED].filter(([, x]) => JSON.stringify(x.readAtIs) === id).map(([m]) => m) }));
  return roads.get(id);
};

// ---- the lists against the store, and against the corpus lane's own counts -----------------
const sources = {}, named = {}, bySecondRoad = {};
for (const [m, L] of LISTED) {
  const t = of(m), seen = served.get(m) || new Map();
  const fingerprint = sha256((texts.get(m) || []).sort().join("\n") + "\n");
  const road = asRead(m, L, fingerprint);
  const second = road ? null : secondOf(L);
  if (second && !second.open) refuse(`${m}: its receipt read «${L.readAt}», a store no page served, and the second road is shut: ${second.why}`);
  let agree = 0, differ = 0, unserved = 0; const differing = [];
  for (const [text, l] of L.lines) {
    const [r1, r2] = seen.get(text) || [0, 0];
    if (!r1 && !r2) unserved += 1;
    if (r1 === (l.rows_field_1 || 0) && r2 === (l.rows_field_2 || 0)) agree += 1;
    else { differ += 1; if (differing.length < 12) differing.push({ text: text.slice(0, 80), list: [l.rows_field_1 || 0, l.rows_field_2 || 0], store: [r1, r2] }); }
  }
  const stated = ((L.theirs.rows_axis || {}).route_store) || {};
  const counts = { route: [t.rows_with_a_close_on_the_route_text, stated.field_1_holds_a_close], definition: [t.rows_with_a_close_on_the_definition_text, stated.field_2_holds_a_close], either: [t.rows_with_a_close_on_either, stated.either_holds_a_close] };
  const countsAgree = Object.values(counts).every(([a, b]) => a === b);
  if (road && differ) refuse(`${L.file}: ${differ} line(s) state row counts that are not this store's, and the source's rows are the rows the list was read from (${L.readAt}: ${road}); first: ${JSON.stringify(differing[0])}`);
  if (road && !countsAgree) refuse(`${m}: rows holding a close are ${JSON.stringify(counts)} (here, the corpus lane's receipt) and the source's rows are the rows the list was read from (${L.readAt}: ${road})`);
  // by the second road: each line's counts, the source's rows and its rows holding a close are the receipt's, less the
  // rows the row-strikes record took since the store it read and the lines of the landing the page did not land
  if (second) {
    const off = [...(second.gone.get(m) || []), ...(second.notLanded.get(m) || [])];
    // a row retexted since without folding stays a row of the source; its old texts lose it, so it falls from the rows holding a close
    const re = (second.retexted && second.retexted.get(m)) || [], lost = [...off, ...re];
    let held = 0; const unheld = [];
    for (const [text, l] of L.lines) {
      const [r1, r2] = seen.get(text) || [0, 0], [f1, f2] = fallOf(second, m, text);
      if (r1 === (l.rows_field_1 || 0) - f1 && r2 === (l.rows_field_2 || 0) - f2) held += 1;
      else unheld.push({ text: text.slice(0, 80), list: [l.rows_field_1 || 0, l.rows_field_2 || 0], less: [f1, f2], store: [r1, r2] });
    }
    const less = { rows: off.length, route: lost.filter((x) => closesOf(L, x.route)).length, definition: lost.filter((x) => closesOf(L, x.definition)).length, either: lost.filter((x) => closesOf(L, x.route) || closesOf(L, x.definition)).length };
    const byRoad = { rows: [t.rows, stated.rows - less.rows], route: [counts.route[0], counts.route[1] - less.route], definition: [counts.definition[0], counts.definition[1] - less.definition], either: [counts.either[0], counts.either[1] - less.either] };
    if (unheld.length) refuse(`${L.file}: ${unheld.length} line(s) state row counts that, less the rows gone since ${second.base} and the lines of relay ${second.landing.relay} not landed, are not this store's (the second road; the receipt read «${L.readAt}»); first: ${JSON.stringify(unheld[0])}`);
    if (!Object.values(byRoad).every(([a, b]) => a === b)) refuse(`${m}: its rows, and its rows holding a close on the route text, the definition text and either, are ${JSON.stringify(byRoad)} (here; the corpus lane's receipt less the rows gone since ${second.base} and the lines of relay ${second.landing.relay} not landed): the second road does not hold (the receipt read «${L.readAt}»)`);
    bySecondRoad[m] = { the_receipt_read: L.readAt, a_served_store: second.base, with_the_landing_of_relay: second.landing.relay, rounds_of_the_row_strikes_record_since: second.rounds.map((r) => r.list),
      rows_gone_since: (second.gone.get(m) || []).length, lines_of_the_landing_not_landed: (second.notLanded.get(m) || []).length, ...(re.length ? { rows_retexted_since: re.length } : {}), lines_whose_row_counts_are_the_receipts_less_those: held,
      rows_and_rows_with_a_close_here_and_by_the_road: byRoad };
  }
  const noted = [...L.lines.values()].filter((l) => l.note);
  named[m] = { key: L.key, relay: L.relay, read_at_store_version: L.readAt, texts_sha256: fingerprint, texts_sha256_as_read: road ? fingerprint : asReadWas(m, L), texts_are_as_read: !!road };
  sources[m] = { key: L.key, label: L.label, relay: L.relay, list: { file: `${HOME}/${L.file}`, sha256: L.sha256, lines: L.lines.size,
      lines_with_a_close: [...L.lines.values()].filter((l) => l.closes.length).length, lines_no_row_serves: unserved,
      made_spaces_kept: [...L.lines.values()].reduce((a, l) => a + (l.kept || []).length, 0), lines_with_a_note: noted.length },
    ...(NEVER.has(m) ? { never_closed: { file: `${HOME}/${NEVER.get(m).file}`, sha256: NEVER.get(m).sha256, texts: NEVER.get(m).places.size,
      texts_with_a_space_that_stands_for_words: [...NEVER.get(m).places.values()].filter((x) => x.length).length, texts_the_list_names_too: [...L.lines.keys()].filter((x) => NEVER.get(m).places.has(x)).length } } : {}),
    ...t,
    read_at_store_version: L.readAt, texts_sha256: fingerprint, the_rows_are_the_rows_the_list_was_read_from: road || false,
    against_the_list: { lines_whose_row_counts_are_the_stores: agree, lines_whose_row_counts_differ: differ, ...(differ ? { first_differing: differing } : {}) },
    against_the_corpus_lanes_receipt: { rows_with_a_close_here_and_there: counts, agree: countsAgree },
    ...(second ? { by_the_second_road: bySecondRoad[m] } : {}) };
  console.log(`  ${m.padEnd(4)} ${L.key.padEnd(26)} relay ${L.relay} · rows ${String(t.rows).padStart(6)} · a close on the route text ${String(t.rows_with_a_close_on_the_route_text).padStart(6)} · on the definition text ${String(t.rows_with_a_close_on_the_definition_text).padStart(6)} · on either ${String(t.rows_with_a_close_on_either).padStart(6)} · ${n(t.closes_on_route_texts)} and ${n(t.closes_on_definition_texts)} closes · divided by a ledger too ${t.rows_a_ledger_divides_with_a_close_on_the_route_text} (${t.closes_that_stand_at_a_ledgers_cut} closes at a cut) · list lines ${L.lines.size} (${agree} with the store's row counts, ${differ} not; ${unserved} no row serves)${NEVER.has(m) ? ` · ${n(t.rows_serving_a_text_with_words_taken_out)} rows serve a text with words taken out, none closed there` : ""} ${t.rows_retexted_from_words_back ? ` · ${n(t.rows_retexted_from_words_back)} rows took their words back (${n(t.rows_closed_from_words_back)} closed there, ${n(t.closes_from_words_back)} closes, counted apart)` : ""} · moved ${t.rows_moved} · ${road ? `as read at ${L.readAt}: ${road}` : second ? `its receipt read «${L.readAt}»: its counts are held by the second road (${bySecondRoad[m].rows_gone_since} rows gone since ${second.base}, ${bySecondRoad[m].lines_of_the_landing_not_landed} lines of relay ${second.landing.relay} not landed${bySecondRoad[m].rows_retexted_since ? `, ${bySecondRoad[m].rows_retexted_since} rows retexted since` : ""})` : `the source's rows have moved on from ${L.readAt}: its counts are recorded, not held`}`);
}
const sum = (f) => Object.values(sources).reduce((a, s) => a + s[f], 0);
const totals = { sources: LISTED.size, rows_of_listed_sources: sum("rows"), rows_carrying_the_slot: sum("rows_with_a_close_on_either"),
  rows_with_a_close_on_the_route_text: sum("rows_with_a_close_on_the_route_text"), rows_with_a_close_on_the_definition_text: sum("rows_with_a_close_on_the_definition_text"),
  closes_on_route_texts: sum("closes_on_route_texts"), closes_on_definition_texts: sum("closes_on_definition_texts"),
  span_store_rows_of_listed_sources: spanRows, span_store_rows_with_a_close: 0,
  ...(WB.size ? { rows_retexted_from_words_back: sum("rows_retexted_from_words_back"), rows_closed_from_words_back: sum("rows_closed_from_words_back"), closes_from_words_back: sum("closes_from_words_back") } : {}) };
const moved = sum("rows_moved");
const foundNone = FOUND_NONE.filter((s) => !LISTED.has(s.m));
console.log(`made spaces · ${pin.relays.length} relays (${pin.relays.map((r) => r.relay).join(", ")}) · ${LISTED.size} sources with a list${foundNone.length ? `, ${foundNone.length} read with none (${foundNone.map((s) => s.m).join(", ")})` : ""} · ${n(totals.rows_of_listed_sources)} rows · ${n(totals.rows_carrying_the_slot)} carry the slot (${n(totals.rows_with_a_close_on_the_route_text)} close on the route text, ${n(totals.rows_with_a_close_on_the_definition_text)} on the definition text) · ${n(moved)} rows move (${touched.length} shards) · the span store's ${n(spanRows)} rows of these sources hold no close`);
// the run's figures, one line of JSON, for a script that holds a run to what was rehearsed
console.log(`figures ${JSON.stringify({ store_version: index.store_version, relays: pin.relays.map((r) => r.relay), rows_moved: Object.fromEntries(Object.entries(sources).map(([m, s]) => [m, s.rows_moved])), shards_moved: touched.length,
  rows_carrying_the_slot: totals.rows_carrying_the_slot, closed_from_words_back: { rows_retexted: sum("rows_retexted_from_words_back"), rows: sum("rows_closed_from_words_back"), closes: sum("closes_from_words_back") }, counts_held: Object.fromEntries(Object.entries(sources).map(([m, s]) => [m, s.the_rows_are_the_rows_the_list_was_read_from ? "as read" : s.by_the_second_road ? "the second road" : "recorded, not held"])),
  by_the_second_road: bySecondRoad })}`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
// what the index names: the pin, its relays, each list and never-closed file, and each source's rows as they stand
const record = { pin: `${HOME}/PIN.json`, relays: RELAYS,
  lists: [...LISTED.entries()].map(([m, L]) => ({ m, key: L.key, relay: L.relay, file: `${HOME}/${L.file}`, sha256: L.sha256 })),
  never_closed: [...NEVER.entries()].map(([m, N]) => ({ m, key: N.key, relay: N.relay, file: `${HOME}/${N.file}`, sha256: N.sha256, texts: N.places.size })),
  read_and_found_none: foundNone, sources: named,
  ...(wbList ? { words_back: { ...wbList, rows: WB.size, rows_with_a_close: sum("rows_closed_from_words_back"), closes: sum("closes_from_words_back") } } : {}) };
const had = index.made_spaces || null;
if (!moved && had && Object.keys(record).every((k) => same(had[k], record[k]))) { console.log("nothing moves and the index names these relays, lists and rows — nothing written"); process.exit(0); }

// ---- write: the index, the receipt -------------------------------------------------------------
const on = momentOf(GIVEN_ON);
const digest = createHash("sha256");
// the shards' weight on disk, which the index states (counts.shard_bytes_total; check-route-store-exact-k L10): a slot
// written into a row moves its shard's bytes, so the total is taken again from the shards as they now stand
let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
const WHAT = "a row of a source the corpus lane's made-spaces lists name carries, in slot 9, the places of its route text and of its definition text that close at print ([the route text's or null, the definition text's or null], UTF-16 units from 0), where its text is a line of its source's list with a close; the texts themselves are the served bytes, unchanged, and a reader takes the characters at those places out when it prints, after the ledger's division; a row with no close carries no such slot";
// the versions on either side of this rule's last move of a shard: kept as they were when a run moves none
const lastMove = now !== was || !had ? { store_version_before: was, store_version: now } : { store_version_before: had.store_version_before, store_version: had.store_version };
index.made_spaces = { rule_id: MADE_SPACES_RULE_ID, applied_on: on, applied_by: "tools/apply-made-spaces-v1.mjs", ...record, ...lastMove, what: WHAT, totals };
index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
if (now !== was) { index.store_version = now; index.store_version_history = [...history, { was, now, why: MADE_SPACES_RULE_ID, on }]; }
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
const prior = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
writeFileSync(RECEIPT, JSON.stringify({ schema_version: "MADE_SPACES_RECEIPT_V2", rule_id: MADE_SPACES_RULE_ID, what: WHAT,
  pin: { file: `${HOME}/PIN.json`, relays: RELAYS },
  runs: [...((prior && prior.runs) || []), { ran_at: on, store_version: { was, now }, relays: pin.relays.map((r) => r.relay), shards_rewritten: touched.length, rows_moved: moved, totals, read_and_found_none: foundNone, sources }] }, null, 1) + "\n");
console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · shards weigh ${n(shardBytes)} bytes · index.made_spaces names ${LISTED.size} lists of ${pin.relays.length} relays · receipt ${RECEIPT}`);
