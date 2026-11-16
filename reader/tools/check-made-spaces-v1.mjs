#!/usr/bin/env node
// RUN: tree
// GUARDS: made-spaces-rule-v1-a-space-our-build-put-where-a-tag-stood-closes-at-print-as-the-corpus-lanes-list-names-it, provider-note-rule-v1-the-providers-remark-on-its-own-file-prints-apart-from-the-text-it-stands-in
// LEDGER: -
// no frame letter. A check reads the lists, the store and the pages and
// judges them; it is not the ledger for one.
//
// A SPACE OUR OWN BUILD MADE CLOSES WHERE A TEXT PRINTS, AND NOTHING ELSE
// MOVES. The store served «Amos , an Israelite prophet» where the provider's
// file holds «Amos, an Israelite prophet»: our build put a space where each
// tag of the provider's XML stood. The corpus lane traces every such space,
// source by source, and lists the places that close (data/made-spaces/, one
// folder per relay with its rule and its receipt; PIN.json names them).
// tools/apply-made-spaces-v1.mjs writes those places on the rows, in slot 9,
// and the readers leave the characters there out when they print. The
// store's texts are not touched.
//
// What is held here, each recomputed and none read from the tool's receipt:
//
//   M1  every relay's lists, its rule, its receipt, its never-closed files
//       and the files it sent beside them are the bytes their pin names, and
//       so are the lists and the receipt of a relay it replaces, kept as the
//       record of the first reading. Its receipt names each list by the same
//       bytes (sha256, size, lines; never by its name: relay v188.1's
//       receipts are the builders' own) and gives it its source, which the
//       store holds under that m id, key and label; it names the rule of its
//       lists by the sha256 of a rule the pin holds; a receipt that read a
//       store no page served as such has its pin say what store that is; no
//       source has two lists
//   M2  every line is well formed: its closes are spaces of its text, in
//       rising order; its `prints` is the text with them taken out; a kept
//       place is a space that does not close. A never-closed line's places
//       are spaces of its text, or its start or end, and no list closes a
//       space that stands for words taken out. A line with the provider's
//       note (provider-note-rule-v1) holds the note's words where its
//       in_text and in_prints say, and its prints_without_the_note is its
//       `prints` less one run that holds the note; the pin says how a note
//       prints and whose file each listed source's notes are on (note_print)
//   M3  every row of the store, read again from the lists: a row of a listed
//       source whose route text or definition text is a line with a close
//       carries exactly those places in slot 9, and no other row carries the
//       slot; a line with a note gives its text the places its
//       prints_without_the_note leaves out (read here by a second road: the
//       run that `prints` and prints_without_the_note do not share, placed
//       back in the text past its closes), and the row carries the note's
//       words and its provider, as the pin names it, in the slot's third
//       place; no row carries a print slot and a close on its route text; no
//       close stands at a mark its ledger divides at; the span store's rows
//       of the listed sources hold no close. A row a round retexted from
//       words back (relay v187, row-strike-rule-v7) is no line of a relay's
//       list: it stands once at its key and rank under the words back the
//       pinned list that landed it gives (words_back.derived.retext), and
//       carries that list's closes on both halves of slot 9, or none where
//       it gives none; those rows are counted apart from a relay's
//   M4  the store's index names the rule, the pin, the relays, the lists and
//       the never-closed files, each source's rows as they stand now (the
//       sha256 of their keys and texts) and totals that are a recount's, and
//       the pin's ruling on the provider's note with the lines and the rows
//       that carry one, as recounted; and
//       it says a source's rows are the rows its list was read from exactly
//       where they stand as they stood when a run found them so (the second
//       sha256 it keeps)
//   M5  the corpus lane's own counts, for each source whose rows are the rows
//       its list was read from: the rows that hold a close, and the rows
//       that still print a space before a comma once closed (the provider's
//       own spaces and the spaces that stand for words taken out, which are
//       never touched). The rows are those rows where the store's own history
//       shows no move but this rule's since the version the relay read, or
//       where they hold the texts the index recorded when that was so. For a
//       source whose rows have moved on, the counts are said and not judged.
//       (That record is the index's own witness: an index whose flag and
//       second sha256 were both rewritten cannot be told from a store that
//       moved on, and its counts are then said, not judged.)
//       Where a receipt read a served store with a landing laid on it (relay
//       v188.1: no served store is ever that one), its counts are judged by
//       THE SECOND ROAD (tools/made-spaces-second-road-v1.mjs): each line's
//       row counts, the source's rows, its rows that hold a close and its
//       rows that still print a space before a comma are the receipt's, less
//       the rows the row-strikes record took since that store and the lines
//       of the landing the page did not land. And those rows and lines are
//       the ones the lane's own count names (meets-v1.json, kept beside the
//       lists): every row gone behind a list line is a row its falls name,
//       every row its falls name of a list the page has landed is gone, and
//       the lines not landed behind a list line are the lines its skip
//       names. A road the records cannot open fails, in words: that is
//       where a row retexted since stands until relay v187 lands with its
//       own part of the road
//   M6  by a second road, what prints: a row's route as printed is its line's
//       `prints` (for a row that took its words back, the words-back list's
//       line's; for a line with the provider's note, its
//       prints_without_the_note); its record as printed is its definition
//       line's, read so; and its
//       readings are that `prints` cut at the row's own marks, each mark's
//       place less the closes before it, or none where the row's facts say it
//       only opens a numbered sense of its entry (sense-openings-rule-v1)
//   M7  the page's own functions, read out of zone.html and run, give what
//       the store reader gives for every row that carries the slot: the
//       route, the record, the readings
//   M8  the front door's card carries the same functions, read out of the
//       built door and run on the same rows
//   M9  no line a zone bakes prints a made space: no reading in a zone's
//       table, nor in a witnessed column, is a row's reading as it stood
//       before closing, or with the provider's note inline (a line's
//       `prints`, where it has a note), where no row prints it so now
//   M10 on the page: words whose cards hold such a row are pressed with every
//       switch lifted, for each listed source rows whose route closes and
//       rows whose definition alone does; no pill prints a reading as it
//       stood before closing, the closed reading stands on a pill credited
//       to its source, the record under that pill is the definition as it
//       prints, and the card calls the reading a piece of its record only
//       where the store does
//   M11 on the page, the provider's note (the owner's card 3 of 16 November
//       2026, «ok go ahead»): a served word whose card holds a row whose text
//       holds a note is pressed with every switch lifted; no pill prints the
//       note's words, the pill of that row prints its line's
//       prints_without_the_note, the record under it prints the same, and
//       the record carries the note apart, its words exactly the line's
//       note.words, credited to the provider the pin names
//
// Run: node tools/check-made-spaces-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, MADE_SPACES_RULE_ID, PROVIDER_NOTE_RULE_ID, CLOSES_SLOT, routePrinted, recordPrinted, providerNoteOf, readingKey, printedForm, factsOf } from "./gloss-store-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { pageReading } from "./page-reading-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";
import { STATES } from "./card-readings-v1.mjs";
import { secondRoad, fallOf } from "./made-spaces-second-road-v1.mjs";
import { readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { RECORD_FILE } from "./row-strikes-follow-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const STORE = join(K3, "data", "route-store");
const LISTS = join(K3, "data", "made-spaces");
const HOME = "reader/data/made-spaces";   // the same folder as the index names it
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");

console.log(`— ${MADE_SPACES_RULE_ID} —\n`);
if (!existsSync(join(LISTS, "PIN.json"))) { console.log("SKIPPED — no made-spaces lists on this disk (data/made-spaces/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(LISTS, "PIN.json"), "utf8"));
const relays = Array.isArray(pin.relays) ? pin.relays : [];
const store = openRouteStore(STORE);
const index = store.index;

// ---- M1: the pinned bytes, relay by relay ---------------------------------------------------
const pinFaults = [];
if (pin.schema_version !== "MADE_SPACES_PIN_V3" || !relays.length) pinFaults.push("the pin names no relays (MADE_SPACES_PIN_V3)");
const bytesOf = (relay, p, folder = relay.folder) => {
  const name = `${folder}/${p.file}`, path = join(LISTS, folder, p.file);
  if (!existsSync(path)) { pinFaults.push(`${name} is not here`); return null; }
  const b = readFileSync(path);
  if (b.length !== p.bytes || sha256(b) !== p.sha256) pinFaults.push(`${name} is ${b.length} bytes, ${sha256(b).slice(0, 12)}; its pin names ${p.bytes}, ${String(p.sha256).slice(0, 12)}`);
  return b;
};
const raws = [];        // each list's bytes with its relay and its source, read line by line in M2
const rawsNever = [];   // each never-closed file's, the same
const readAtOf = {};    // relay -> the store version its receipt says the lists were read from
let pinnedFiles = 0;
for (const relay of relays) {
  bytesOf(relay, relay.rule);
  const receipt = bytesOf(relay, relay.receipt);
  pinnedFiles += 2;
  const theirs = receipt ? JSON.parse(receipt.toString("utf8")) : { outputs: [], sources: [], inputs: {} };
  readAtOf[relay.relay] = (((theirs.inputs || {}).route_store || {}).store_version) || null;
  if (!readAtOf[relay.relay]) pinFaults.push(`relay ${relay.relay}: its receipt names no store version it read`);
  // the rule its lists were built under, as the receipt names it, is a rule the pin holds: the relay's own, or the
  // one of the relay whose lists it reissues
  const listsRule = relay.lists_rule || relay.rule;
  if (relay.lists_rule) { bytesOf(relay, relay.lists_rule, relay.lists_rule.folder); pinnedFiles += 1; }
  if (receipt && (!theirs.rule || theirs.rule.sha256 !== listsRule.sha256)) pinFaults.push(`relay ${relay.relay}: its receipt names another rule for its lists than the pin holds`);
  // a served store's version is twelve hex characters; a receipt that read anything else has its pin say what store that is
  const readAt = readAtOf[relay.relay], servedAsSuch = /^[0-9a-f]{12}$/u.test(String(readAt));
  if (readAt && (servedAsSuch ? !!relay.read_at : !relay.read_at || relay.read_at.store_version !== readAt)) pinFaults.push(`relay ${relay.relay}: its receipt read «${readAt}», and its pin ${relay.read_at ? `says «${relay.read_at.store_version}»` : "does not say what store that is (read_at)"}`);
  // the files the relay sent beside its lists, and the lists and receipt it replaces: kept, each the bytes its pin names
  for (const p of [...(relay.beside || []), ...(relay.meets ? [relay.meets] : []), ...((relay.receipt || {}).replaces ? [relay.receipt.replaces] : [])]) { bytesOf(relay, p); pinnedFiles += 1; }
  if (relay.replaces) for (const p of [relay.replaces.receipt, ...(relay.replaces.lists || [])].filter(Boolean)) { bytesOf(relay, p, relay.replaces.folder); pinnedFiles += 1; }
  // a pinned file and a file the receipt names are the same bytes: sha256, size and count of lines, whatever the name
  const sameBytes = (t, p) => !!t && t.sha256 === p.sha256 && t.bytes === p.bytes && t.lines === p.lines;
  // the source the receipt gives a pinned file's bytes to: `slot` reads, of one of its sources, the file it gives it
  const sourceOf = (p, slot) => {
    const name = `${relay.folder}/${p.file}`;
    if (!(theirs.outputs || []).some((o) => sameBytes(o, p))) pinFaults.push(`relay ${relay.relay}: the corpus lane's receipt names no output of the bytes its pin names for ${name}`);
    const srcs = (theirs.sources || []).filter((s) => sameBytes(slot(s), p));
    if (srcs.length !== 1) { pinFaults.push(`relay ${relay.relay}: the corpus lane's receipt gives the bytes of ${name} to ${srcs.length} sources`); return null; }
    const mine = index.m_sources[srcs[0].m_id];
    if (!mine || mine.key !== srcs[0].source_key || mine.label !== srcs[0].label) pinFaults.push(`${srcs[0].m_id} is not ${srcs[0].source_key} in the store's index`);
    return srcs[0];
  };
  for (const p of relay.lists || []) {
    const b = bytesOf(relay, p), src = sourceOf(p, (s) => s.list);
    pinnedFiles += 1;
    if (src && raws.some((r) => r.src.m_id === src.m_id)) pinFaults.push(`two lists name ${src.m_id}`);
    else if (b && src) raws.push({ relay: relay.relay, name: `${relay.folder}/${p.file}`, p, src, text: b.toString("utf8"), entry: relay });
  }
  for (const p of relay.never_closed || []) {
    const b = bytesOf(relay, p), src = sourceOf(p, (s) => (s.words_taken_out || {}).list);
    pinnedFiles += 1;
    if (b && src) rawsNever.push({ relay: relay.relay, name: `${relay.folder}/${p.file}`, p, src, text: b.toString("utf8") });
  }
}
check("M1  every relay's lists, rule, receipt, never-closed files and the files kept beside them are the bytes their pin names; its receipt names each list by the same bytes and gives it its source, which the store holds so, and names the rule of its lists by a rule the pin holds; a receipt that read a store no page served has its pin say what store that is; no source has two lists", pinFaults.length === 0,
  pinFaults.length ? first(pinFaults) : `${relays.length} relays (${relays.map((r) => `${r.relay}${r.replaces ? `, in the place of ${r.replaces.relay}` : ""}`).join("; ")}) · ${pinnedFiles} files: ${raws.length} lists, ${rawsNever.length} never-closed, a rule and a receipt each, and the files kept beside them`);

// ---- M2: every line ---------------------------------------------------------------------------
// the text with the characters at `places` taken out, typed here on its own: one character at a time
const without = (text, places) => { let s = ""; for (let i = 0; i < text.length; i += 1) if (!places.includes(i)) s += text[i]; return s; };
// how the pin says a provider's note prints (provider-note-rule-v1): apart, credited to the provider whose file it is
const notePrint = pin.note_print && pin.note_print.rule_id === PROVIDER_NOTE_RULE_ID && pin.note_print.how === "apart" && pin.note_print.by && typeof pin.note_print.ruling === "string" ? pin.note_print : null;
// THE PLACES A NOTE TAKES OUT, BY A SECOND ROAD. The tool widens the note's words over the spaces our build made beside
// them; here the line's two prints are set side by side instead: prints_without_the_note is `prints` less one run, the
// run they do not share (the longest prefix they share, then the rest of the difference), which must hold the note's
// words; the run's places in `prints` are carried back to the text's past its closes, and joined to the closes. null
// where the line is not so
const notePlacesBySecondRoad = (l) => {
  const P = l.prints, Q = l.note.prints_without_the_note, gone = P.length - Q.length;
  if (gone <= 0) return null;
  let a = 0;
  while (a < Q.length && a < l.note.in_prints[0] && P[a] === Q[a]) a += 1;
  const b = a + gone;
  if (P.slice(0, a) + P.slice(b) !== Q || a > l.note.in_prints[0] || b < l.note.in_prints[1]) return null;
  // the text's place of each place of `prints`: the text with its closes passed over
  const back = [];
  for (let i = 0; i < l.text.length; i += 1) if (!l.closes.includes(i)) back.push(i);
  return [...new Set([...l.closes, ...back.slice(a, b)])].sort((x, y) => x - y);
};
const lineFaults = []; let lines = 0, closing = 0, closes = 0, kept = 0, noted = 0;
const LISTED = new Map();   // m id -> { key, relay, file, sha256, lines: Map(text -> line), theirs, readAt }
const NEVER = new Map();    // m id -> { key, relay, file, sha256, places: Map(text -> the spaces of the text that stand for words taken out) }
const linesOf = (name, p, text) => {
  const rows = text.endsWith("\n") ? text.slice(0, -1).split("\n") : (lineFaults.push(`${name} does not end in a line end`), text.split("\n"));
  if (rows.length !== p.lines) lineFaults.push(`${name} holds ${rows.length} lines; its pin says ${p.lines}`);
  return rows.map((s, at) => { try { return JSON.parse(s); } catch { lineFaults.push(`${name} line ${at + 1} is not JSON`); return null; } });
};
for (const { relay, name, p, src, text, entry } of raws) {
  const map = new Map();
  linesOf(name, p, text).forEach((l, at) => {
    if (!l) return;
    lines += 1;
    const where = `${name} line ${at + 1}`;
    if (typeof l.text !== "string" || !Array.isArray(l.closes) || typeof l.prints !== "string") { lineFaults.push(`${where}: no text, closes or prints`); return; }
    if (map.has(l.text)) lineFaults.push(`${where}: its text is named twice`);
    if (l.closes.some((c, i) => !Number.isInteger(c) || l.text[c] !== " " || (i && c <= l.closes[i - 1]))) lineFaults.push(`${where}: a close is not a space of the text, or the closes do not rise`);
    if ((l.kept || []).some((c) => l.text[c] !== " " || l.closes.includes(c))) lineFaults.push(`${where}: a kept place is not a space of the text, or is one of its closes`);
    if (without(l.text, l.closes) !== l.prints) lineFaults.push(`${where}: prints is not the text with its closes taken out`);
    if (l.closes.length) closing += 1;
    closes += l.closes.length; kept += (l.kept || []).length; if (l.note) noted += 1;
    // the provider's note: its words where the line says, and the places its print without the note leaves out of the text
    l.places = l.closes;
    if (l.note !== undefined) {
      const nt = l.note || {}, by = notePrint && notePrint.by ? notePrint.by[src.source_key] : null;
      const said = (x, t) => Array.isArray(x) && x.length === 2 && t.slice(x[0], x[1]) === nt.words && x[0] < x[1];
      if (typeof nt.words !== "string" || !nt.words || !said(nt.in_text, l.text) || !said(nt.in_prints, l.prints) || typeof nt.prints_without_the_note !== "string") lineFaults.push(`${where}: its note does not hold its words where in_text and in_prints say, or gives no print without it`);
      else if (!notePrint || typeof by !== "string" || !by) lineFaults.push(`${where} carries the provider's note, and the pin says nothing of how it prints or whose file it is on (note_print, ${PROVIDER_NOTE_RULE_ID})`);
      else {
        const places = notePlacesBySecondRoad(l);
        if (!places) lineFaults.push(`${where}: its prints_without_the_note is not its prints less one run that holds the note`);
        else { l.places = places; l.slotNote = { words: nt.words, by }; }
      }
    }
    map.set(l.text, l);
  });
  LISTED.set(src.m_id, { key: src.source_key, relay, file: name, sha256: p.sha256, lines: map, theirs: src, readAt: readAtOf[relay], readAtIs: entry.read_at || null, meets: entry.meets ? join(LISTS, entry.folder, entry.meets.file) : null });
}
let neverTexts = 0, standing = 0, inBoth = 0;
for (const { relay, name, p, src, text } of rawsNever) {
  const places = new Map();
  linesOf(name, p, text).forEach((l, at) => {
    if (!l) return;
    const where = `${name} line ${at + 1}`;
    if (typeof l.text !== "string" || !l.text || !Array.isArray(l.at)) { lineFaults.push(`${where}: no text or no places`); return; }
    if (places.has(l.text)) lineFaults.push(`${where}: its text is named twice`);
    // a place is the space that stands for the words, or the text's start or its end where the words stood there
    if (l.at.some((a) => !Number.isInteger(a) || a < 0 || a > l.text.length || (a !== 0 && a !== l.text.length && l.text[a] !== " "))) lineFaults.push(`${where}: a place is not a space of the text, its start or its end`);
    const spaces = l.at.filter((a) => l.text[a] === " ");
    neverTexts += 1; standing += spaces.length;
    places.set(l.text, spaces);
  });
  NEVER.set(src.m_id, { key: src.source_key, relay, file: name, sha256: p.sha256, places });
  const L = LISTED.get(src.m_id);
  if (L) for (const [t, l] of L.lines) {
    const stands = places.get(t);
    if (!stands) continue;
    inBoth += 1;
    if (l.closes.some((c) => stands.includes(c))) lineFaults.push(`${L.file}: «${t.slice(0, 50)}» closes a space that ${name} says stands for words taken out`);
  }
}
check("M2  every line is well formed: closes are spaces of the text and rise, prints is the text with them taken out, a kept place does not close; a never-closed place is a space, a start or an end, and no list closes a space that stands for words taken out", lineFaults.length === 0,
  lineFaults.length ? first(lineFaults) : `${nf(lines)} lines · ${nf(closing)} with a close · ${nf(closes)} closes · ${kept} made spaces kept · ${noted} with a note · ${nf(neverTexts)} never-closed texts with ${nf(standing)} spaces that stand for words, ${inBoth} of them texts a list names too`);

// ---- the words back (ship 6, relay v187): the rows a round retexted from words_back (row-strike-rule-v7) take the
// closes and the print the list that landed them gives (data/made-spaces/PIN.json, words_back.derived.retext), by key
// and rank, where their route text is that list's words back; read here from the record and the pinned list
const WB = new Map();   // `${m}\u0001${key}\u0001${rank}` -> { text, closes, prints, met }
const wbFaults = [];
{
  const recordPath = join(LISTS, "..", RECORD_FILE);
  const rounds = existsSync(recordPath) ? (JSON.parse(readFileSync(recordPath, "utf8")).rounds || []) : [];
  const took = rounds.map((r) => ({ r, rows: (r.rows || []).filter((x) => x.action === "retext" && x.from_slot === "words_back") })).filter((x) => x.rows.length);
  if (took.length) {
    const d = (pin.words_back || {}).derived || {};
    if (!d.folder || !d.retext) wbFaults.push(`the row-strikes record holds ${took.length} round(s) that retexted rows from words back, and the pin names no list of them`);
    else if (took.length !== 1 || !took[0].r.list || took[0].r.list.sha256 !== d.retext.sha256) wbFaults.push(`rows were retexted from words back by ${took.length} round(s), not once by the list the pin names`);
    else {
      let lines = [];
      try { lines = readPinnedLines(join(LISTS, d.folder, d.retext.file), d.retext, `${d.folder}/${d.retext.file}`); } catch (e) { if (!(e instanceof PinFault)) throw e; wbFaults.push(e.message); }
      const byId = new Map(lines.map((l) => [`${l.m}\u0001${l.key}\u0001${l.rank}`, l]));
      for (const x of took[0].rows) {
        const id = `${x.m}\u0001${x.key}\u0001${x.rank}`, l = byId.get(id);
        if (!l || l.to_text !== x.to_text || !Array.isArray(l.closes) || typeof l.prints !== "string") { wbFaults.push(`${x.m} ${x.key} rank ${x.rank}: the round retexted it to words the pinned list does not give it`); continue; }
        WB.set(id, { text: l.to_text, closes: l.closes, prints: l.prints, met: 0 });
      }
    }
  }
}
// the line of a row's text: a relay's list line, or for a row that took its words back, the words-back list's (its
// closes on both halves of slot 9, as the retext wrote them)
const wbOf = (k, row) => { const w = WB.get(`${row[3]}\u0001${k}\u0001${row[0]}`); return w && String(row[1] ?? "") === w.text ? w : null; };

// ---- M3: every row of the store -------------------------------------------------------------
const lineOf = (L, text) => { const l = L && L.lines.get(String(text ?? "")); return l && l.closes.length ? l : null; };
// the line of a text whose row carries places: a close, or the provider's note (provider-note-rule-v1), whose places are
// the closes and the note's run; a line's print, where it has a note, is its print without it
const placedOf = (L, text) => { const l = L && L.lines.get(String(text ?? "")); return l && l.places && l.places.length ? l : null; };
const printOf = (l) => (l.slotNote ? l.note.prints_without_the_note : l.prints);
const lineAt = (L, k, row, slot) => { const w = wbOf(k, row); if (w && String(row[slot] ?? "") === w.text) return w.closes.length ? w : null; return lineOf(L, row[slot]); };
const comma = / ,/u;
const rowFaults = [];
const slotted = [];   // [key, row] for every row that carries the slot
const recount = {};   // m id -> { rows, route, definition, either, stillRoute, stillRecord, texts: one line per row, served: list text -> [rows serving it as the route text, as the definition text] }
let storeRows = 0, notedRows = 0;
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    storeRows += 1;
    const m = String(row[3]), L = LISTED.get(m);
    // the slot is asked by what it holds: a row may carry a later slot (its facts), whose shape is its own check's
    const has = row[CLOSES_SLOT] ?? null;
    if (!L) { if (has !== null) rowFaults.push(`${f} ${k} (${m}): a row of a source no list names carries the slot`); continue; }
    const c = (recount[m] ||= { rows: 0, route: 0, definition: 0, either: 0, stillRoute: 0, stillRecord: 0, texts: [], served: new Map() });
    c.rows += 1;
    c.texts.push(JSON.stringify([k, row[1] ?? null, row[2] ?? null]));
    for (const f of [1, 2]) { const s = String(row[f] ?? ""); if (L.lines.has(s)) (c.served.get(s) || c.served.set(s, [0, 0]).get(s))[f - 1] += 1; }
    const r = lineAt(L, k, row, 1), d = lineAt(L, k, row, 2), wb = wbOf(k, row);
    // a row that took its words back holds the closes the words-back list gives it: counted apart, as the tool counts
    // them (rows_closed_from_words_back), since no relay's receipt counts them
    if (wb) { wb.met += 1; if (r || d) c.closedFromWordsBack = (c.closedFromWordsBack || 0) + 1; }
    else {
      if (r) c.route += 1;
      if (d) c.definition += 1;
      if (r || d) c.either += 1;
    }
    // what the slot holds: each text's places (a note's run with the closes) and, where a text holds the provider's note,
    // the note in the third place; a row that took its words back holds the closes the words-back list gives
    const pr = wb ? r : placedOf(L, row[1]), pd = wb ? d : placedOf(L, row[2]);
    const note = wb ? null : (pd && pd.slotNote) || (pr && pr.slotNote) || null;
    if (note) notedRows += 1;
    const want = pr || pd ? [pr ? pr.places || pr.closes : null, pd ? pd.places || pd.closes : null, ...(note ? [note] : [])] : null;
    if (!same(has, want)) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): the lists give ${JSON.stringify(want)}, the row carries ${JSON.stringify(has)}`);
    if (pr && pr.slotNote && ((Array.isArray(row[7]) && row[7].length) || Array.isArray(row[8]))) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): the provider's note on a route text its ledger divides or prints a part of`);
    if (r && Array.isArray(row[8])) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): a print slot and a close on the route text`);
    if (r && Array.isArray(row[7]) && r.closes.some((x) => row[7].includes(x))) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): a close stands at a mark the ledger divides at`);
    if (has) slotted.push([k, row]);
    // what the source's rows still print before a comma once closed, over every row of the source (M5); a row that took
    // its words back is counted apart, as its closes are above: no relay's receipt counts its new words
    if (wb) {
      if (comma.test(routePrinted(row))) c.stillRouteFromWordsBack = (c.stillRouteFromWordsBack || 0) + 1;
      if (row[2] && comma.test(recordPrinted(row))) c.stillRecordFromWordsBack = (c.stillRecordFromWordsBack || 0) + 1;
    } else {
      if (comma.test(routePrinted(row))) c.stillRoute += 1;
      if (row[2] && comma.test(recordPrinted(row))) c.stillRecord += 1;
    }
  }
}
let spanRows = 0;
const SPAN = join(K3, "data", "span-store");
if (existsSync(join(SPAN, "index.json"))) for (const f of readdirSync(SPAN).filter((x) => /^[a-z0-9-]+\.json$/u.test(x) && x !== "index.json").sort()) {
  const file = JSON.parse(readFileSync(join(SPAN, f), "utf8"));
  for (const rows of Object.values(file.keys || {})) for (const r of rows) {
    const L = r && Array.isArray(r.slots) ? LISTED.get(String(r.slots[3])) : null;
    if (!L) continue;
    spanRows += 1;
    if (lineOf(L, r.slots[1]) || lineOf(L, r.slots[2])) rowFaults.push(`the span store's ${f}: a row of ${r.slots[3]} holds a text with a close`);
  }
}
rowFaults.push(...wbFaults);
for (const [id, w] of WB) if (w.met !== 1) rowFaults.push(`${id.split("\u0001").join(" ")}: a row retexted from words back stands ${w.met} times at its key and rank under its words back`);
const total = (f) => Object.values(recount).reduce((a, c) => a + c[f], 0);
check("M3  every store row carries exactly the closes the lists give its texts (and, where a text holds the provider's note, the note's run with them and the note itself), and no other row carries the slot; none has a print slot with a route close, or a close at a ledger's mark; the span store's rows hold none", rowFaults.length === 0,
  rowFaults.length ? `${rowFaults.length} · ${first(rowFaults)}` : `${nf(storeRows)} store rows read · ${nf(total("rows"))} of ${LISTED.size} listed sources · ${nf(total("either"))} carry the slot (${nf(total("route"))} close on the route text, ${nf(total("definition"))} on the definition text) · ${nf(spanRows)} span rows of those sources, none with a close`);

// ---- M4: the index ------------------------------------------------------------------------------
// a source's rows as they stand: the sha256 of one line per row (its key, its route text, its definition text), sorted
const standsAs = (m) => sha256(((recount[m] || {}).texts || []).slice().sort().join("\n") + "\n");
const ms = index.made_spaces || null;
const wantLists = [...LISTED.entries()].map(([m, L]) => ({ m, key: L.key, relay: L.relay, file: `${HOME}/${L.file}`, sha256: L.sha256 }));
const wantNever = [...NEVER.entries()].map(([m, N]) => ({ m, key: N.key, relay: N.relay, file: `${HOME}/${N.file}`, sha256: N.sha256, texts: N.places.size }));
const indexFaults = [];
if (!ms) indexFaults.push("the index names no made spaces (index.made_spaces)");
else {
  if (ms.rule_id !== MADE_SPACES_RULE_ID) indexFaults.push(`the index names the rule ${ms.rule_id}`);
  if (ms.pin !== `${HOME}/PIN.json`) indexFaults.push(`the index names the pin ${ms.pin}`);
  if (!same((ms.relays || []).map((r) => [r.relay, r.folder, r.read_at_store_version]), relays.map((r) => [r.relay, `${HOME}/${r.folder}`, readAtOf[r.relay]]))) indexFaults.push("the index does not name the pin's relays, each with its folder and the store version it read");
  if (!same(ms.lists, wantLists)) indexFaults.push("the index does not name the pinned lists by their sha256");
  if (!same(ms.never_closed, wantNever)) indexFaults.push("the index does not name the pinned never-closed files by their sha256");
  for (const [m, L] of LISTED) {
    const r = (ms.sources || {})[m];
    if (!r || r.key !== L.key || r.relay !== L.relay || r.read_at_store_version !== L.readAt) indexFaults.push(`the index does not say which relay ${m}'s list is of, or the version it was read from`);
    else if (r.texts_sha256 !== standsAs(m)) indexFaults.push(`the index's record of ${m}'s rows (${String(r.texts_sha256).slice(0, 12)}) is not the rows as they stand (${standsAs(m).slice(0, 12)}): the tool has not run since they moved`);
    else if (r.texts_are_as_read !== (typeof r.texts_sha256_as_read === "string" && r.texts_sha256_as_read === r.texts_sha256)) indexFaults.push(`the index says ${m}'s rows ${r.texts_are_as_read ? "are" : "are not"} the rows its list was read from, and its two records of them (as read ${String(r.texts_sha256_as_read).slice(0, 12)}, as they stand ${String(r.texts_sha256).slice(0, 12)}) say otherwise`);
  }
  for (const m of Object.keys(ms.sources || {})) if (!LISTED.has(m)) indexFaults.push(`the index records rows of ${m}, which no list names`);
  // the provider's note (provider-note-rule-v1): the pin's ruling, and the lines and rows that carry one, recounted
  const wantNotes = notePrint ? { rule_id: PROVIDER_NOTE_RULE_ID, how: notePrint.how, by: notePrint.by, lines: noted, rows: notedRows } : undefined;
  if (!same(ms.provider_notes, wantNotes)) indexFaults.push(`the index records the provider's notes as ${JSON.stringify(ms.provider_notes)}, and the pin and a recount give ${JSON.stringify(wantNotes)}`);
  const t = ms.totals || {};
  if (t.rows_of_listed_sources !== total("rows") || t.rows_carrying_the_slot !== total("either") || t.rows_with_a_close_on_the_route_text !== total("route") || t.rows_with_a_close_on_the_definition_text !== total("definition"))
    indexFaults.push(`the index's totals (${t.rows_of_listed_sources}, ${t.rows_carrying_the_slot}, ${t.rows_with_a_close_on_the_route_text}, ${t.rows_with_a_close_on_the_definition_text}) are not a recount's (${total("rows")}, ${total("either")}, ${total("route")}, ${total("definition")})`);
}
check("M4  the store's index names the rule, the pin, its relays, the lists and the never-closed files, each source's rows as they stand, and totals that are a recount's", indexFaults.length === 0,
  indexFaults.length ? first(indexFaults) : `applied ${String(ms.applied_on).slice(0, 10)} · this rule's last move of the store ${ms.store_version_before} -> ${ms.store_version} · ${LISTED.size} sources' rows recorded`);

// ---- M5: the corpus lane's own counts -------------------------------------------------------
// by the store's own history: walking back from the store's version over moves that are this rule's (which changes no
// text), is the version the relay read reached?
const history = index.store_version_history || [];
const reachedByThisRuleAlone = (from) => {
  let v = index.store_version;
  for (let i = history.length - 1; v !== from && i >= 0; i -= 1) {
    if (history[i].now !== v || history[i].why !== MADE_SPACES_RULE_ID) return false;
    v = history[i].was;
  }
  return v === from;
};
// the second road, one for the sources whose receipts read the same store; null for a receipt that read a served store
const roads = new Map();
const secondOf = (L) => {
  if (!L.readAtIs) return null;
  const id = JSON.stringify(L.readAtIs);
  if (!roads.has(id)) roads.set(id, secondRoad({ data: join(K3, "data"), index, readAt: L.readAtIs, listed: [...LISTED].filter(([, x]) => JSON.stringify(x.readAtIs) === id).map(([mm]) => mm) }));
  return roads.get(id);
};
const countFaults = [], judgedSources = [], saidOnly = [];
for (const [m, L] of LISTED) {
  const stated = ((L.theirs.rows_axis || {}).route_store) || {}, c = recount[m] || { rows: 0, route: 0, definition: 0, either: 0, stillRoute: 0, stillRecord: 0, served: new Map() };
  const sc = stated.space_before_a_comma || {};
  // the receipt's five counts, each less what a road takes from it (nothing, on the first road)
  const pairsLess = (less) => [["rows with a close on the route text", c.route, stated.field_1_holds_a_close - less.route], ["on the definition text", c.definition, stated.field_2_holds_a_close - less.definition], ["on either", c.either, stated.either_holds_a_close - less.either],
    ["rows whose route still prints a space before a comma", c.stillRoute, (sc.field_1 || {}).rows_that_still_print_one_after_closing - less.stillRoute], ["rows whose definition still does", c.stillRecord, (sc.field_2 || {}).rows_that_still_print_one_after_closing - less.stillRecord]];
  const pairs = pairsLess({ route: 0, definition: 0, either: 0, stillRoute: 0, stillRecord: 0 });
  const differing = pairs.filter(([, here, there]) => here !== there).map(([what, here, there]) => `${m}: ${what} ${here} here, ${there} in the corpus lane's receipt`);
  const said = `${m} ${nf(c.route)}/${nf(c.definition)}/${nf(c.either)} rows close, ${c.stillRoute} and ${c.stillRecord} still print a space before a comma${c.stillRouteFromWordsBack || c.stillRecordFromWordsBack ? ` (and of the rows that took their words back, counted apart, ${c.stillRouteFromWordsBack || 0} and ${c.stillRecordFromWordsBack || 0})` : ""}`;
  const rec = (ms && ms.sources && ms.sources[m]) || null;
  const byHistory = !!L.readAt && reachedByThisRuleAlone(L.readAt);
  const byRecord = !!rec && rec.read_at_store_version === L.readAt && typeof rec.texts_sha256_as_read === "string" && rec.texts_sha256_as_read === standsAs(m);
  if (byHistory && rec && rec.texts_are_as_read !== true) countFaults.push(`${m}: the store's history shows no move but this rule's since ${L.readAt}, and the index says the source's rows are not the rows its list was read from`);
  const second = byHistory || byRecord ? null : secondOf(L);
  if (byHistory || byRecord) { countFaults.push(...differing); judgedSources.push(`${said} (as read at ${L.readAt}, ${byHistory ? "by the store's history" : "by the texts the index recorded"})`); }
  else if (second && !second.open) countFaults.push(`${m}: its receipt read «${L.readAt}», a store no page served, and the second road is shut: ${second.why}`);
  else if (second) {
    // the rows gone since the store the receipt read, and the lines of the landing not landed, each with its texts as
    // its list prints them (a line's own `prints`, the text with its closes taken out)
    const off = [...(second.gone.get(m) || []), ...(second.notLanded.get(m) || [])];
    // and the rows a round retexted since without folding (relay v187's words back, the second road's retexted): each
    // stays a row of the source, with other words, so its old texts lose it and the rows do not
    const moved = (second.retexted && second.retexted.get(m)) || [];
    const lost = [...off, ...moved];
    const routeOf = (x) => { const l = lineOf(L, x.route); return l ? l.prints : x.route; }, recordOf = (x) => { if (!x.definition) return routeOf(x); const l = lineOf(L, x.definition); return l ? l.prints : x.definition; };
    const less = { route: lost.filter((x) => lineOf(L, x.route)).length, definition: lost.filter((x) => lineOf(L, x.definition)).length, either: lost.filter((x) => lineOf(L, x.route) || lineOf(L, x.definition)).length,
      stillRoute: lost.filter((x) => comma.test(routeOf(x))).length, stillRecord: lost.filter((x) => x.definition && comma.test(recordOf(x))).length };
    const faults = pairsLess(less).filter(([, here, there]) => here !== there).map(([what, here, there]) => `${m}: ${what} ${here} here, ${there} by the second road`);
    if (c.rows !== stated.rows - off.length) faults.push(`${m}: ${nf(c.rows)} rows here, ${nf(stated.rows - off.length)} by the second road (the receipt's ${nf(stated.rows)} less ${off.length})`);
    let heldLines = 0;
    for (const [text, l] of L.lines) {
      const [r1, r2] = c.served.get(text) || [0, 0], [f1, f2] = fallOf(second, m, text);
      if (r1 === (l.rows_field_1 || 0) - f1 && r2 === (l.rows_field_2 || 0) - f2) heldLines += 1;
      else if (faults.length < 6) faults.push(`${L.file}: «${text.slice(0, 50)}» states ${l.rows_field_1 || 0} and ${l.rows_field_2 || 0} rows, less ${f1} and ${f2} by the second road, and ${r1} and ${r2} serve it`);
      else faults.push(null);
    }
    countFaults.push(...faults.filter(Boolean));
    judgedSources.push(`${said} (by the second road: the receipt's counts at «${L.readAt}», less ${(second.gone.get(m) || []).length} rows gone since ${second.base} and ${(second.notLanded.get(m) || []).length} lines of relay ${second.landing.relay} not landed${moved.length ? `, ${moved.length} rows retexted since off their old texts` : ""}; ${nf(heldLines)} of ${nf(L.lines.size)} lines hold)`);
  }
  else saidOnly.push(`${said}${differing.length ? ` (${differing.length} of the corpus lane's counts differ now)` : ""}, its rows have moved on from ${L.readAt}`);
}
// the lane's own count of where its lists meet the other relays (meets-v1.json), against what the second road took:
// one reading of it per road, over the sources whose lists that road counts
const meetsSaid = [];
for (const second of roads.values()) {
  if (!second.open) continue;
  const mine = [...LISTED].filter(([, L]) => secondOf(L) === second);
  const meetsPath = (mine.find(([, L]) => L.meets) || [null, {}])[1].meets;
  if (!meetsPath || !existsSync(meetsPath)) continue;
  const meets = JSON.parse(readFileSync(meetsPath, "utf8"));
  // the lane's count names each list as it shipped it and by its sha256; a list kept here under another name is the same bytes
  const theirName = new Map((((meets.inputs || {}).lists_after_v188) || []).map((l) => [l.sha256, l.file]));
  for (const [m, L] of mine) if (!theirName.has(L.sha256)) countFaults.push(`the lane's count (${meetsPath.split("/").pop()}) was not made over ${m}'s list ${L.file} (${L.sha256.slice(0, 12)})`);
  const listName = (L) => theirName.get(L.sha256) || L.file.split("/").pop(), landed = new Set(second.rounds.map((r) => r.list));
  // rows gone behind a list line, as the page's record has them: list, text, then the rows
  const gone = [];
  for (const [m, L] of mine) for (const x of second.gone.get(m) || []) for (const text of new Set([x.route, x.definition])) if (L.lines.has(text)) gone.push({ list: listName(L), text, m, key: x.key, rank: x.rank, action: x.action });
  const named = ((meets.v189 || {}).falls || []).flatMap((f) => (f.by || []).map((b) => ({ list: f.list, text: f.text, m: b.m, key: b.key, rank: b.rank, action: b.action, of: String(b.file).split("/").pop() })));
  const idOf = (x) => [x.list, x.text, x.m, x.key, x.rank, x.action].join("\u0001");
  const namedIds = new Set(named.map(idOf)), goneIds = new Set(gone.map(idOf));
  for (const x of gone) if (!namedIds.has(idOf(x))) countFaults.push(`${x.m} ${x.key} rank ${x.rank} (${x.action}) is gone behind «${x.text.slice(0, 40)}» of ${x.list}, and the lane's count of the falls (${meetsPath.split("/").pop()}) does not name it`);
  const due = named.filter((x) => landed.has(x.of));
  for (const x of due) if (!goneIds.has(idOf(x))) countFaults.push(`the lane's count names ${x.m} ${x.key} rank ${x.rank} (${x.action}, ${x.of}) as gone behind «${x.text.slice(0, 40)}», its list has landed, and the row-strikes record did not take it`);
  // the lines of the landing not landed that stand behind a list line: the lane's own skip
  const fieldOf = (L, x) => [L.lines.has(x.route) ? "route" : null, L.lines.has(x.definition) ? "definition" : null].filter(Boolean).join(" and ");
  const skipped = mine.flatMap(([m, L]) => (second.notLanded.get(m) || []).filter((x) => fieldOf(L, x)).map((x) => [x.key, x.rank, m, listName(L), fieldOf(L, x)])).map((x) => x.join("\u0001")).sort();
  const skip = meets.v188_maqaf_skip || {};
  const theirs = (skip.lines || []).map((l) => [l.v188_key, l.v188_rank, l.m, l.list, l.field].join("\u0001")).sort();
  if (!same(skipped, theirs)) countFaults.push(`${skipped.length} line(s) of relay ${second.landing.relay} not landed stand behind a list line, and the lane's count names ${theirs.length} (v188_maqaf_skip), or other ones`);
  const notLandedOfThese = mine.reduce((a, [m]) => a + (second.notLanded.get(m) || []).length, 0);
  if (skip.of_M9_M5_M46 !== undefined && skip.of_M9_M5_M46 !== notLandedOfThese) countFaults.push(`${notLandedOfThese} lines of relay ${second.landing.relay} not landed are of these sources, and the lane's count says ${skip.of_M9_M5_M46}`);
  meetsSaid.push(`the lane's own count (${meetsPath.split("/").pop()}): ${gone.length} of the ${named.length} rows its ${((meets.v189 || {}).falls || []).length} falls name are gone${due.length === named.length ? ", every list of them landed" : `, ${named.length - due.length} of them of a list not landed yet`}; of the ${notLandedOfThese} lines not landed of these sources, ${skipped.length} stand${skipped.length === 1 ? "s" : ""} behind a list line, as its skip names`);
}
if (judgedSources.length) check("M5  the corpus lane's own counts are the store's, for each source whose rows are the rows its list was read from, or by the second road where its receipt read a served store with a landing laid on it: the rows that hold a close, and the rows that still print a space before a comma once closed", countFaults.length === 0,
  countFaults.length ? `${countFaults.length} · ${first(countFaults)}` : `${judgedSources.join(" · ")}${meetsSaid.length ? ` · ${meetsSaid.join(" · ")}` : ""}${saidOnly.length ? ` · said, not judged: ${saidOnly.join(" · ")}` : ""}`);
else if (countFaults.length) check("M5  the corpus lane's own counts are the store's, for each source whose rows are the rows its list was read from, or by the second road", false, `${countFaults.length} · ${first(countFaults)}`);
else console.log(`  --  M5  said, not judged: no source's rows are the rows its list was read from · ${saidOnly.join(" · ")}`);

// ---- M6: what prints, by a second road -------------------------------------------------------
const printFaults = [];
for (const [k, row] of slotted) {
  const L = LISTED.get(String(row[3]));
  const wb = wbOf(k, row);
  const r = wb ? lineAt(L, k, row, 1) : placedOf(L, row[1]), d = wb ? lineAt(L, k, row, 2) : placedOf(L, row[2]);
  const where = `${k} (${row[3]}, rank ${row[0]})`;
  // a line's print: its `prints`, or where it holds the provider's note, its prints_without_the_note
  const route = r ? (wb ? r.prints : printOf(r)) : String(row[1] ?? "");
  if (routePrinted(row) !== route) printFaults.push(`${where}: the route prints «${routePrinted(row).slice(0, 50)}», its line says «${route.slice(0, 50)}»`);
  const record = row[2] ? (d ? (wb ? d.prints : printOf(d)) : String(row[2])) : route;
  if (recordPrinted(row) !== record) printFaults.push(`${where}: the record prints «${recordPrinted(row).slice(0, 50)}», its line says «${record.slice(0, 50)}»`);
  if (Array.isArray(row[8])) continue;   // a print slot's texts are the ledger's (and M3 refuses one beside a route close)
  // the readings: the printed route cut at the row's marks, each mark's place less the closes before it
  const shut = r ? r.places || r.closes : [];
  const cuts = (Array.isArray(row[7]) ? row[7] : []).map((i) => i - shut.filter((c) => c < i).length);
  const pieces = []; let from = 0;
  for (const i of cuts) { pieces.push(route.slice(from, i)); from = i + 1; }
  pieces.push(route.slice(from));
  // a row that only opens a numbered sense prints as a note and gives no reading (sense-openings-rule-v1)
  const want = (factsOf(row) || {}).opens ? [] : pieces.map((x) => x.trim()).filter(Boolean);
  if (!same(store.readingsOf(row), want)) printFaults.push(`${where}: the readings are ${JSON.stringify(store.readingsOf(row)).slice(0, 80)}, the printed route cut at its marks gives ${JSON.stringify(want).slice(0, 80)}`);
}
check("M6  by a second road: a row's route and record print as their lines' `prints` (prints_without_the_note, where a line holds the provider's note), and its readings are that printed route cut at the row's own marks", printFaults.length === 0,
  printFaults.length ? `${printFaults.length} · ${first(printFaults)}` : `${nf(slotted.length)} rows · ${slotted.filter(([, row]) => Array.isArray(row[7])).length} of them divided by a ledger · ${slotted.filter(([, row]) => Array.isArray(row[CLOSES_SLOT]) && row[CLOSES_SLOT][2]).length} printing without the provider's note`);

// ---- M7: the page's functions -------------------------------------------------------------------
{
  let page = null, why = "";
  try { page = pageReading(readFileSync(join(K3, "zone.html"), "utf8"), index); } catch (e) { why = e.message; }
  const faults = [];
  if (page) for (const [k, row] of slotted) {
    if (page.routePrinted(row) !== routePrinted(row)) faults.push(`${k} (${row[3]}): the route`);
    if (page.recordPrinted(row) !== recordPrinted(row)) faults.push(`${k} (${row[3]}): the record`);
    if (!same(page.readingsOfRow(row), store.readingsOf(row))) faults.push(`${k} (${row[3]}): the readings`);
  }
  check("M7  the page's own functions, read out of zone.html and run, give what the store reader gives for every row that carries the slot", !!page && faults.length === 0,
    !page ? `the page's functions could not be read: ${why}` : faults.length ? `${faults.length} · ${first(faults)}` : `${nf(slotted.length)} rows: the route, the record and the readings agree`);
}

// ---- M8: the front door's card ------------------------------------------------------------------
{
  const doorPath = join(K3, "..", "index.html");
  let door = null, why = "";
  if (!existsSync(doorPath)) why = "no built door beside the reader (index.html)";
  else try {
    const html = readFileSync(doorPath, "utf8");
    const a = html.indexOf("function closed(text, places) {"), z = html.indexOf("function recordPrinted(row) {");
    if (a < 0 || z < a || html.indexOf("function closed(text, places) {", a + 1) >= 0) throw new Error("the door does not hold the three functions once");
    door = new Function(`${html.slice(a, html.indexOf("\n", z))}\n return { routePrinted, recordPrinted };`)();
  } catch (e) { why = e.message; }
  const faults = [];
  if (door) for (const [k, row] of slotted) {
    if (door.routePrinted(row) !== routePrinted(row)) faults.push(`${k} (${row[3]}): the route`);
    if (door.recordPrinted(row) !== recordPrinted(row)) faults.push(`${k} (${row[3]}): the record`);
  }
  check("M8  the front door's card carries the same functions, read out of the built door and run on the same rows", !!door && faults.length === 0,
    !door ? why : faults.length ? `${faults.length} · ${first(faults)}` : `${nf(slotted.length)} rows: the route and the record agree`);
}

// ---- M9: no baked line prints a made space ---------------------------------------------------
// per key: the readings its rows gave before closing that no row prints now (by the printed form, as the pool keys a reading)
const stale = new Map();
{
  const byKey = new Map();
  for (const [k, row] of slotted) if (row[CLOSES_SLOT][0] && !Array.isArray(row[8])) (byKey.get(k) || byKey.set(k, []).get(k)).push(row);
  for (const [k, rows] of byKey) {
    const now = new Set((store.routesFor(k) || []).flatMap((r) => store.readingsOf(r).map(readingKey)));
    const was = new Set();
    for (const row of rows) {
      const text = String(row[1]), ends = [...(Array.isArray(row[7]) ? row[7] : []), text.length];
      ends.forEach((end, x) => { const piece = text.slice(x ? ends[x - 1] + 1 : 0, end).trim(); if (piece && !now.has(readingKey(piece))) was.add(readingKey(piece)); });
      // a route text that holds the provider's note, as it printed with the note inline (its line's `prints`)
      const l = placedOf(LISTED.get(String(row[3])), row[1]);
      if (l && l.slotNote && !now.has(readingKey(l.prints.trim()))) was.add(readingKey(l.prints.trim()));
    }
    if (was.size) stale.set(k, was);
  }
}
{
  const ZONES = join(K3, "data", "zones");
  const faults = []; let files = 0, tables = 0, readings = 0;
  for (const f of existsSync(ZONES) ? readdirSync(ZONES).filter((x) => x.endsWith(".bin")).sort() : []) {
    let z;
    try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }   // not a zone's JSON (a shard of another kind)
    if (!z || typeof z.gloss !== "object" || !z.gloss) continue;
    files += 1;
    const cols = [["the line", z.gloss], ...Object.entries(z.gloss_orders || {}), ...Object.entries(z.gloss_deltas || {})];
    for (const [name, col] of cols) {
      if (!col || typeof col !== "object") continue;
      tables += 1;
      for (const [k, t] of Object.entries(col)) {
        if (typeof t !== "string") continue;
        readings += 1;
        const was = stale.get(k);
        if (was && was.has(readingKey(t))) faults.push(`${f} ${name} ${k}: «${t.slice(0, 50)}»`);
      }
    }
  }
  check("M9  no reading a zone bakes, in its line's table or a witnessed column, is a row's reading as it stood before closing, or with the provider's note inline", files > 0 && faults.length === 0,
    !files ? "no zone on this disk" : faults.length ? `${faults.length} · ${first(faults)}` : `${files} zone files · ${tables} tables · ${nf(readings)} readings · ${nf(stale.size)} keys hold a reading that closing changed`);
}

// ---- M10: on the page -----------------------------------------------------------------------------
// served words whose card holds a row of a listed source that the ledger leaves whole and that is the oldest of
// the store's rows carrying its reading, so the record under its pill is that row's unless an older row of a
// dictionary beside the store stands first there. Two kinds, asked of each listed source: a row whose route
// closes, where the pill itself changes; and a row whose route does not close and whose definition does, where the
// pill is as it was and the record under it changes (every row of a source whose routes hold no made space is of
// this kind). A source has a kind where a row of the store is of it
const KINDS = [
  { name: "route", most: 4, of: (r) => !!r[CLOSES_SLOT][0] && readingKey(String(r[1]).trim()) !== readingKey(routePrinted(r).trim()) },
  { name: "record", most: 4, of: (r) => !r[CLOSES_SLOT][0] && !!r[CLOSES_SLOT][1] && !!r[2] && printedForm(String(r[2])) !== printedForm(recordPrinted(r)) },
];
// a row that carries closes, asked by what the slot holds (a row may carry a later slot and none here), and that
// its ledger leaves whole
const whole = (r) => Array.isArray(r[CLOSES_SLOT]) && !Array.isArray(r[7]) && !Array.isArray(r[8]);
// the sources and kinds the store holds a whole row of: [m id, kind]
const ASKED = [...LISTED.keys()].flatMap((m) => KINDS.filter((kind) => slotted.some(([, r]) => String(r[3]) === m && whole(r) && kind.of(r))).map((kind) => [m, kind]));
const tag = (m, kind) => `${m} ${kind.name}`;
const picks = [];
{
  const seen = new Set(), found = Object.fromEntries(ASKED.map(([m, kind]) => [tag(m, kind), 0]));
  outer: for (const b of zonesServed()) {
    const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${b}.bin`))).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [e, w] of (sec.words || []).entries()) {
      if (!w.k || w.w || seen.has(w.k)) continue;
      const rows = (store.routesFor(w.k) || []).filter((r) => index.m_sources[r[3]]);
      for (const [m, kind] of ASKED) {
        if (found[tag(m, kind)] >= kind.most) continue;
        const row = rows.find((r) => String(r[3]) === m && whole(r) && kind.of(r) && store.carriersOf(rows, routePrinted(r).trim())[0] === r);
        if (!row) continue;
        seen.add(w.k); found[tag(m, kind)] += 1;
        picks.push({ kind: tag(m, kind), book: b, section: si, entry: e, label: sec.label, key: w.k, m, source: index.m_sources[m].label,
          printed: printedForm(routePrinted(row).trim()), record: printedForm(recordPrinted(row)), piece: row[5] === 1, was: [...(stale.get(w.k) || [])] });
        break;
      }
      if (ASKED.every(([m, kind]) => found[tag(m, kind)] >= kind.most)) break outer;
    }
  }
}
const lacking = ASKED.filter(([m, kind]) => !picks.some((pick) => pick.kind === tag(m, kind))).map(([m, kind]) => tag(m, kind));
if (!ASKED.length || lacking.length) check("M10 on the page, a card that holds such a row prints it closed", false, !ASKED.length ? "no row of the store carries the slot whole" : `no served word carries a whole row that leads its reading, of: ${lacking.join(", ")}`);
else {
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  const faults = [], seenOn = [], judged = Object.fromEntries(ASKED.map(([m, kind]) => [tag(m, kind), 0]));
  let pills = 0;
  try {
    for (const pick of picks) {
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
      try {
        const p = await ctx.newPage();
        const errors = [];
        p.on("pageerror", (e) => errors.push(String(e && e.message)));
        await p.goto(`${tree.base}/zone.html?b=${pick.book}`, { waitUntil: "networkidle" });
        // every switch that withholds a reading lifted, as the chain's second reading of a card lifts them
        await p.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, STATES.lifted.keep);
        await p.reload({ waitUntil: "networkidle" });
        await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        await linesOnPage(p, { from: pick.section, to: pick.section + 1 });
        const got = await p.evaluate(async ({ section, entry, m, printed }) => {
          const hud = document.getElementById("hud");
          const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });
          const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
          const sec = document.querySelectorAll("section.seg")[section];
          const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
          if (!wb) return { fault: "the word is not on the page" };
          (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
          const t0 = performance.now();
          while (!settled() && performance.now() - t0 < 20000) await turn();
          if (!settled()) return { fault: "the card's readings did not arrive" };
          const buttons = [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")];
          const said = buttons.map((x) => [x.textContent, x.dataset.by || ""]);
          const mine = buttons.find((x) => x.textContent === printed && (x.dataset.by || "").split(/[\s,]+/u).includes(m));
          let record = null, cut = null, credited = null;
          if (mine) {
            mine.click();
            await turn(); await turn();
            const d = hud.querySelector(".d-card .d-body .d-text"), att = hud.querySelector(".d-card .d-foot .att");
            record = d ? d.textContent : null;
            credited = att ? att.textContent : null;
            cut = !!hud.querySelector(".d-card .d-cut");
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return { said, record, cut, credited, found: !!mine };
        }, pick);
        const where = `${pick.book} ${pick.label}, entry ${pick.entry} (${pick.key})`;
        if (errors.length) faults.push(`${where}: the page threw: ${errors[0]}`);
        if (got.fault) { faults.push(`${where}: ${got.fault}`); continue; }
        pills += got.said.length;
        for (const [text] of got.said) if (pick.was.includes(readingKey(text))) faults.push(`${where}: a pill prints «${text.slice(0, 50)}», a reading as it stood before closing`);
        if (!got.found) continue;   // the card opened on a division of the word, where the whole form's rows are a press away
        // the record shown is the oldest carrier's: judged where the card's own source line names this row's source
        if (!String(got.credited || "").startsWith(`${pick.source} · `)) continue;
        seenOn.push(where); judged[pick.kind] += 1;
        if (got.record !== pick.record) faults.push(`${where}: under «${pick.printed.slice(0, 40)}» the record prints «${String(got.record).slice(0, 60)}», and as printed it is «${pick.record.slice(0, 60)}»`);
        // the reading is the row's whole route as it prints, so the card calls it a piece of its record only where the store marks the row as one
        if (got.cut !== pick.piece) faults.push(`${where}: the card ${got.cut ? "says" : "does not say"} «${pick.printed.slice(0, 40)}» is a piece cut out of its record, and the store ${pick.piece ? "marks" : "does not mark"} the row as one`);
      } finally { await ctx.close(); }
    }
  } finally { await browser.close().catch(() => {}); await tree.close(); }
  const unjudged = ASKED.filter(([m, kind]) => !judged[tag(m, kind)]).map(([m, kind]) => tag(m, kind));
  check("M10 on the page, with every switch lifted: no pill prints a reading as it stood before closing; for each listed source the closed reading stands on a pill of its source, the record under it is the definition as it prints, and it is called a piece only where the store marks it one", faults.length === 0 && unjudged.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : unjudged.length ? `no card showed the record of a row of: ${unjudged.join(", ")}` : `${picks.length} words pressed · ${nf(pills)} pills read · the record was read under ${ASKED.map(([m, kind]) => `${judged[tag(m, kind)]} of ${picks.filter((pick) => pick.kind === tag(m, kind)).length} ${m} rows whose ${kind.name} closes`).join(", ")}${seenOn.length ? ` (${seenOn[0]})` : ""}`);
}

// ---- M11: the provider's note, on the page ----------------------------------------------------------
// the rows whose text holds the provider's note, each on the card of a served word under its key (found in the store
// and the zones, never named here): pressed with every switch lifted, its pill and its record read, and the record's notes
{
  const noted = slotted.filter(([, r]) => providerNoteOf(r)).map(([k, row]) => {
    const L = LISTED.get(String(row[3])), l = placedOf(L, row[2]) || placedOf(L, row[1]);
    return { k, row, l, note: l && l.slotNote };
  });
  const asked = [];
  if (noted.length) {
    const want = new Map(noted.map((x) => [x.k, x]));
    outer: for (const b of zonesServed()) {
      const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${b}.bin`))).toString("utf8"));
      for (const [si, sec] of (z.sections || []).entries()) for (const [e, w] of (sec.words || []).entries()) {
        const x = w.k && !w.w ? want.get(w.k) : null;
        if (!x || asked.some((y) => y.x === x)) continue;
        asked.push({ x, book: b, section: si, entry: e, label: sec.label });
        if (asked.length === want.size) break outer;
      }
    }
  }
  const lacking = noted.filter((x) => !x.note || !asked.some((y) => y.x === x));
  if (!noted.length) check("M11 on the page, a text that holds the provider's note prints without it, and its record carries the note apart", false, "no row of the store carries the provider's note (slot 9's third place): the made spaces' tool has not laid the list's note, or the list holds none");
  else if (lacking.length) check("M11 on the page, a text that holds the provider's note prints without it, and its record carries the note apart", false, `${lacking.length} row(s) carrying the note stand under no served word, or under no line with a note: ${lacking.map((x) => `${x.k} (${x.row[3]}, rank ${x.row[0]})`).join(", ")}`);
  else {
    const tree = await serveTree(K3);
    const pw = await loadPlaywright();
    const browser = await pw.chromium.launch(launchOptions());
    const faults = [], said = [];
    try {
      for (const a of asked) {
        const { row, l, note } = a.x, m = String(row[3]);
        const printed = printedForm(routePrinted(row).trim()), record = printedForm(recordPrinted(row));
        const where = `${a.book} ${a.label}, entry ${a.entry} (${a.x.k}, ${m} rank ${row[0]})`;
        if (printed !== printedForm(printOf(l).trim())) faults.push(`${where}: the row's route prints «${printed.slice(0, 60)}», and its line without the note «${printOf(l).slice(0, 60)}»`);
        const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
        try {
          const p = await ctx.newPage();
          const errors = [];
          p.on("pageerror", (err) => errors.push(String(err && err.message)));
          await p.goto(`${tree.base}/zone.html?b=${a.book}`, { waitUntil: "networkidle" });
          await p.evaluate((kv) => { for (const [k2, v] of Object.entries(kv)) localStorage.setItem(k2, v); }, STATES.lifted.keep);
          await p.reload({ waitUntil: "networkidle" });
          await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
          await linesOnPage(p, { from: a.section, to: a.section + 1 });
          const got = await p.evaluate(async ({ section, entry, m, printed }) => {
            const hud = document.getElementById("hud");
            const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });
            const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
            const wb = (document.querySelectorAll("section.seg")[section] || document).querySelectorAll(".he-text .wb")[entry];
            if (!wb) return { fault: "the word is not on the page" };
            (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
            const t0 = performance.now();
            while (!settled() && performance.now() - t0 < 20000) await turn();
            if (!settled()) return { fault: "the card's readings did not arrive" };
            const buttons = [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")];
            const pills = buttons.map((x) => x.textContent);
            const mine = buttons.find((x) => x.textContent === printed && (x.dataset.by || "").split(/[\s,]+/u).includes(m));
            if (!mine) return { pills, found: false };
            mine.click();
            await turn(); await turn();
            const d = hud.querySelector(".d-card .d-body .d-text");
            const lines = [...hud.querySelectorAll(".d-card .d-body .sense-notes[data-notes-of=\"file\"]")].map((x) => ({ text: x.textContent, notes: [...x.querySelectorAll(".sense-note")].map((y) => [y.dataset.m || "", y.textContent]) }));
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
            return { pills, found: true, record: d ? d.textContent : null, lines };
          }, { section: a.section, entry: a.entry, m, printed });
          if (errors.length) faults.push(`${where}: the page threw: ${errors[0]}`);
          if (got.fault) { faults.push(`${where}: ${got.fault}`); continue; }
          const inline = (got.pills || []).filter((t) => t.includes(note.words));
          if (inline.length) faults.push(`${where}: a pill prints the provider's note inline: «${inline[0].slice(0, 70)}»`);
          if (!got.found) { faults.push(`${where}: no pill credited to ${m} prints «${printed.slice(0, 70)}» (the card's pills: ${got.pills.slice(0, 6).map((t) => `«${t.slice(0, 30)}»`).join(", ")})`); continue; }
          if (got.record !== record) faults.push(`${where}: the record prints «${String(got.record).slice(0, 70)}», and as printed it is «${record.slice(0, 70)}»`);
          const wantLine = `${note.by}, in a note on its own file: ${note.words}`;
          if (got.lines.length !== 1 || got.lines[0].text !== wantLine || !same(got.lines[0].notes, [[m, note.words]])) faults.push(`${where}: the record's notes of the file are ${JSON.stringify(got.lines).slice(0, 160)}, and the note is «${wantLine}»`);
          else said.push(`${where}: «${got.record.slice(0, 50)}» · «${got.lines[0].text}»`);
        } finally { await ctx.close(); }
      }
    } finally { await browser.close().catch(() => {}); await tree.close(); }
    check("M11 on the page, with every switch lifted: a text that holds the provider's note prints without it on its pill and in its record, no pill prints the note, and the record carries the note apart, its words exactly the line's, credited to the provider the pin names", faults.length === 0,
      faults.length ? `${faults.length} · ${first(faults)}` : `${asked.length} row(s) · ${said.join(" · ")}`);
  }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
