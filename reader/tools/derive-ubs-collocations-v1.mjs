#!/usr/bin/env node
// GUARDS: ubs-collocations-rule-v1-a-row-carries-the-collocations-its-ubs-meanings-name-and-the-places-ubs-own-pick-names-it
// LEDGER: M R
// it writes the list of the UBS dictionary's rows (M) whose every meaning of
// their text (R) UBS marks with a collocation, each with those collocations
// and the places UBS's own default pick names it, and a receipt of how the
// list was read. It writes no row of the store:
// tools/apply-ubs-collocations-v1.mjs lays the list on the rows.
//
// UBS'S OWN COLLOCATION MARK LANDS OVER ITS CATEGORY, NOT AS A LIST.
//
// The corpus lane's call 7b (relay v189) listed 1,261 rows of the UBS
// dictionary to set a press away, found by an English test (a row that opens
// «literally:» or holds « > ») and split by UBS's own mark. The lead's call of
// 15 November 2026 reworks it: «UBS's own phrase mark ... is a kind its
// source states», and the owner's rule of the same day is that each
// dictionary is a category and a rule runs over the whole shelf; a list that
// names rows one at a time mends only those rows. So the mark is read here
// over every row of the dictionary, from UBS's own file, and the record of
// dictionary kinds rests the category shut (its entry ubs-collocation),
// standing where UBS's own pick names the row (question 10, taken: «keep them
// on the card at rest»).
//
// THE MARK. UBS's own file (UBSHebrewDic-v0.9.2-en.JSON) gives each meaning
// of an entry (entry, then BaseForms, then LEXMeanings, known by its LEXID)
// the field LEXCollocations; a meaning is marked where it holds at least one
// collocation. A row of the store reaches its meanings through the catalog's
// own route file (ubs-sdbh-hebrew-definition-routes-v1.csv.gz): a line whose
// normalized_key is the row's key and whose r_route_text is the row's text
// names one of the row's meanings by its lex_id, as the calls' RULE.md reads
// it. Both files stay on the corpus lane's store and are given on the command
// line; each is read only as the bytes data/ubs-collocations/PIN.json names.
//
// THE CATEGORY (the lead's calls 5 to 7 of 15 November 2026, on the design of
// ships 5 and 6): a row of the UBS dictionary every meaning of whose text
// carries a collocation, and which carries no name fact. Two edges, each said
// in the receipt with its rows:
//   - a row whose text is also the text of a meaning with no collocation is
//     not of it: UBS itself says the text is also a plain meaning
//     (also_plain);
//   - a row the names gate reads as a name (its facts carry name) is not of
//     it: «The Bible dictionaries' own name entries keep the gate as it is:
//     they stand where the text's word is a name» (name_rows).
// A row's collocations are every collocation its meanings name, byte for
// byte as UBS writes them, each once, in the order of the meanings' LEXIDs
// (the dictionary's own order); its meanings are those LEXIDs.
//
// THE PLACES (picked_at). Where UBS's own default pick names a row of the
// category, the row stands on the card at rest there. A place is written
// "<book slug> <chapter>:<verse>:<word>": the slug of the ledger's book file,
// and the label the default picks bake gives the place (the section's label
// and the word's number in it, scribal marks not counted), the label the
// page's DFLT_PLACES holds, e.g. "i-samuel 6:10:15". The picks are read from
// the default picks ledger (data/default-picks/PIN.json: the three rows
// tables and the 39 book files receipt-v1 names, each held to its bytes),
// every UBS pick of every piece, and each row a pick names is followed
// through the row-strikes record from the store the ledger's v1.2 read
// (tools/row-strikes-follow-v1.mjs), as the bake of the default picks follows
// it. A row's places are in the ledger's order: its books as receipt-v1 lists
// them, its places in their order; each place once.
//
// REFUSED, in words and with nothing written:
//   - a pinned file is not its bytes (the dictionary, the route file, the
//     default picks' pin, rows tables, receipts and book files, call 7b's
//     list);
//   - the store does not name exactly one source of the UBS dictionary;
//   - a row of the dictionary the route file does not reach, or a lex_id
//     the route file names that the dictionary does not hold: what a row's
//     meanings say is never guessed;
//   - two rows of the category under one name (key, rank, source, sha16);
//   - a UBS pick naming a row of the dictionary that the store does not hold
//     as named and the row-strikes record does not say where it went, and a
//     line of call 7b likewise;
//   - the list or its receipt as derived is not the bytes the pin names
//     (made_here). --dry prints what would be written, with the sha256, and
//     writes nothing; that is how the pin was first written.
//
// Run twice on the same inputs it writes the same bytes: it holds no clock.
// The summary ends in one line of its figures as JSON (`figures {...}`).
//
// Usage: node tools/derive-ubs-collocations-v1.mjs --dictionary <UBSHebrewDic-v0.9.2-en.JSON>
//          --routes <ubs-sdbh-hebrew-definition-routes-v1.csv.gz> --ledger <dir holding default-picks-v1/,
//          default-picks-v1.1/ and default-picks-v1.2/> [--store data/route-store] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { factsOf } from "./gloss-store-v1.mjs";
import { readPinned, readPinnedLines, heldToPin, sha256Of, PinFault } from "./pinned-v1.mjs";
import { openFollower, followedRecord, followedSaid, sha16Of, FollowFault } from "./row-strikes-follow-v1.mjs";

export const UBS_COLLOCATIONS_RULE_ID = "ubs-collocations-rule-v1-a-row-carries-the-collocations-its-ubs-meanings-name-and-the-places-ubs-own-pick-names-it";
// the source key of the UBS dictionary in the store's index, as the record of dictionary kinds files it (ubs-dictionary)
export const UBS_SOURCE_KEY = "ubs_sdbh_hebrew_v0_9_2";
const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const DICTIONARY = arg("dictionary"), ROUTES = arg("routes"), LEDGER = arg("ledger");
const HOME = join(K3, "data", "ubs-collocations");
const PICKS_PIN = join(K3, "data", "default-picks", "PIN.json");
const CALLS = join(K3, "data", "audit-calls");
const refuse = (why) => { console.log(`REFUSED — ${why}`); process.exit(1); };
const n0 = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const pinned = (fn) => { try { return fn(); } catch (e) { if (e instanceof PinFault || e instanceof FollowFault) refuse(e.message); throw e; } };
if (!DICTIONARY || !ROUTES || !LEDGER) refuse("usage: --dictionary <UBSHebrewDic-v0.9.2-en.JSON> --routes <ubs-sdbh-hebrew-definition-routes-v1.csv.gz> --ledger <the default picks ledger's folder> [--store data/route-store] [--dry]: the two files of UBS and the ledger are named on the command line, never guessed");

// ---- the pin, and UBS's two files as its bytes ----------------------------------------------
const pinPath = join(HOME, "PIN.json");
if (!existsSync(pinPath)) refuse(`the pin of UBS's collocations is missing (${pinPath})`);
const pin = JSON.parse(readFileSync(pinPath, "utf8"));
if (pin.schema_version !== "UBS_COLLOCATIONS_PIN_V1" || pin.rule_id !== UBS_COLLOCATIONS_RULE_ID || !pin.dictionary || !pin.routes || !pin.made_here || typeof pin.made_here !== "object") refuse(`${pinPath} is not a pin of UBS's collocations under ${UBS_COLLOCATIONS_RULE_ID} (UBS_COLLOCATIONS_PIN_V1: the dictionary, the route file, and what is made here)`);
const listPin = pin.made_here.list || null, receiptPin = pin.made_here.receipt || null;
const dictBytes = pinned(() => readPinned(DICTIONARY, pin.dictionary, pin.dictionary.file));
const routeBytes = pinned(() => readPinned(ROUTES, pin.routes, pin.routes.file));

// ---- UBS's meanings: LEXID -> its collocations (null where it holds none) ---------------------
const meaning = new Map();
let meanings = 0, marked = 0;
{
  let entries;
  try { entries = JSON.parse(dictBytes.toString("utf8")); } catch (e) { refuse(`${pin.dictionary.file} is not JSON (${e.message})`); }
  if (!Array.isArray(entries)) refuse(`${pin.dictionary.file} is not a list of entries`);
  for (const e of entries) for (const b of (e && Array.isArray(e.BaseForms) ? e.BaseForms : [])) for (const m of (b && Array.isArray(b.LEXMeanings) ? b.LEXMeanings : [])) {
    if (!m || typeof m.LEXID !== "string" || !m.LEXID) refuse(`${pin.dictionary.file} holds a meaning with no LEXID`);
    if (meaning.has(m.LEXID)) refuse(`${pin.dictionary.file} holds the meaning ${m.LEXID} twice`);
    const c = m.LEXCollocations;
    if (c !== null && c !== undefined && !(Array.isArray(c) && c.every((x) => typeof x === "string" && x))) refuse(`${pin.dictionary.file}: the meaning ${m.LEXID} holds LEXCollocations that is not a list of texts`);
    meanings += 1;
    const has = Array.isArray(c) && c.length ? c : null;
    if (has) marked += 1;
    meaning.set(m.LEXID, has);
  }
}

// ---- the route file: a row's key and text -> its meanings ----------------------------------------
const csv = (text) => {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (q) { if (ch === "\"") { if (text[i + 1] === "\"") { f += "\""; i += 1; } else q = false; } else f += ch; }
    else if (ch === "\"") q = true;
    else if (ch === ",") { row.push(f); f = ""; }
    else if (ch === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (ch !== "\r") f += ch;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
};
const meaningsOfRow = new Map();   // key \u0001 text -> Set(lex_id)
{
  const R = csv(gunzipSync(routeBytes).toString("utf8"));
  const head = R.shift() || [];
  const col = Object.fromEntries(head.map((h, i) => [h, i]));
  for (const need of ["normalized_key", "r_route_text", "lex_id"]) if (col[need] === undefined) refuse(`${pin.routes.file} has no column ${need}`);
  R.forEach((r, i) => {
    if (r.length !== head.length) refuse(`${pin.routes.file} line ${i + 2} has ${r.length} fields, its header ${head.length}`);
    const id = r[col.lex_id];
    if (!meaning.has(id)) refuse(`${pin.routes.file} line ${i + 2} names the meaning ${id}, which ${pin.dictionary.file} does not hold`);
    const k = `${r[col.normalized_key]}\u0001${r[col.r_route_text]}`;
    (meaningsOfRow.get(k) || meaningsOfRow.set(k, new Set()).get(k)).add(id);
  });
}

// ---- the store: every row of the UBS dictionary, read once ------------------------------------
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const ubsIds = Object.entries(index.m_sources || {}).filter(([, s]) => s && s.key === UBS_SOURCE_KEY).map(([m]) => m);
if (ubsIds.length !== 1) refuse(`the store names ${ubsIds.length} sources under ${UBS_SOURCE_KEY}, not one`);
const M = ubsIds[0];
const byLexId = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const C = { rows: 0, reached: 0, marked_rows: 0, category: 0, name_rows: 0, also_plain: 0, also_plain_and_name: 0 };
const markedKeys = new Set();
const category = new Map();   // name joined -> the list line
const named = new Map();      // every row of the dictionary by name joined -> its class, for what a pick or call 7b names
const nameOf = (k, row) => [k, row[0], M, sha16Of(row[1])];
const join1 = (name) => name.join("\u0001");
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    if (String(row[3]) !== M) continue;
    C.rows += 1;
    const ids = meaningsOfRow.get(`${k}\u0001${row[1]}`);
    if (!ids) refuse(`${pin.routes.file} reaches no meaning of the row of ${M} at rank ${row[0]} (${sha16Of(row[1])}): what its meanings say is never guessed`);
    C.reached += 1;
    const id = join1(nameOf(k, row));
    if (named.has(id)) refuse(`two rows of ${M} stand under one name (rank ${row[0]}, ${sha16Of(row[1])})`);
    const mk = [...ids].filter((x) => meaning.get(x)).sort(byLexId);
    if (!mk.length) { named.set(id, "unmarked"); continue; }
    C.marked_rows += 1; markedKeys.add(k);
    const every = mk.length === ids.size, isName = !!(factsOf(row) || {}).name;
    if (!every) { C.also_plain += 1; if (isName) C.also_plain_and_name += 1; named.set(id, "also_plain"); continue; }
    if (isName) { C.name_rows += 1; named.set(id, "name_row"); continue; }
    C.category += 1;
    named.set(id, "category");
    category.set(id, { k, rank: row[0], m: M, sha: sha16Of(row[1]), collocations: [...new Set(mk.flatMap((x) => meaning.get(x)))], meanings: mk, picked_at: [] });
  }
}
const categoryKeys = new Set([...category.values()].map((x) => x.k));

// ---- the places UBS's own pick names a row of the category -------------------------------------
if (!existsSync(PICKS_PIN)) refuse(`the default picks' pin is not here (${PICKS_PIN})`);
const pp = JSON.parse(readFileSync(PICKS_PIN, "utf8"));
for (const k of ["receipt", "receipt_v1_2", "rows", "rows_added", "rows_added_v1_2"]) if (!pp[k] || typeof pp[k].file !== "string") refuse(`the default picks' pin names no ${k}`);
const at = (e) => join(LEDGER, e.file);
const r1 = JSON.parse(pinned(() => readPinned(at(pp.receipt), pp.receipt)).toString("utf8"));
const r12 = JSON.parse(pinned(() => readPinned(at(pp.receipt_v1_2), pp.receipt_v1_2)).toString("utf8"));
const picksReadAt = ((r12.inputs || {}).page_store || {}).store_version || null;
const table = [pp.rows, pp.rows_added, pp.rows_added_v1_2].flatMap((e) => pinned(() => readPinnedLines(at(e), e)));
table.forEach((r, i) => { if (!Array.isArray(r) || typeof r[0] !== "string" || !Number.isInteger(r[1]) || typeof r[2] !== "string" || !/^[0-9a-f]{16}$/u.test(r[3] || "")) refuse(`row ${i} of the default picks' rows tables is not [key, rank, source id, sha16]`); });
const outputs = Array.isArray(r1.outputs) ? r1.outputs : [];
if (!outputs.length || outputs.some((o) => !o || !/^[a-z0-9-]+\.jsonl$/u.test(o.file || "") || !Number.isInteger(o.lines))) refuse("the default picks' receipt-v1 names no book files in outputs[]");
const follow = pinned(() => openFollower({ data: dirname(STORE), index, readAt: picksReadAt }));
// a row the tables name, where it stands now: its name joined, or null where a round since took it off the store
const nowCache = new Map();
const goneAnswers = [], rekeyed = [], retexted = [];
const nowOfRow = (r) => {
  if (nowCache.has(r)) return nowCache.get(r);
  const name = table[r];
  let now = join1(name);
  if (!named.has(now)) {
    const went = pinned(() => follow.nowOf(name));
    if (went.state === "struck" || went.state === "withheld") { goneAnswers.push(went); now = null; }
    else if (went.state === "re-keyed" || went.state === "retexted") {
      (went.state === "re-keyed" ? rekeyed : retexted).push(went);
      now = join1(went.name);
      if (!named.has(now)) refuse(`row ${r} of the default picks' rows tables (${name[2]}, rank ${name[1]}, ${name[3]}) was ${went.state} since the store the ledger read, and the store does not hold it under the name the record gives`);
    } else refuse(`row ${r} of the default picks' rows tables (${name[2]}, rank ${name[1]}, ${name[3]}) is not in the store as named, and the row-strikes record says no round since moved it`);
  }
  nowCache.set(r, now);
  return now;
};
const refs = { picks: 0, pick1: 0, places: 0, rows_named: new Set(), naming_a_row_now_gone: 0 };
for (const o of outputs) {
  const book = o.file.replace(/\.jsonl$/u, "");
  const lines = pinned(() => readPinnedLines(join(LEDGER, dirname(pp.receipt.file), o.file), o));
  lines.forEach((d, i) => {
    if (!d || typeof d.p !== "string" || !/^\d+:\d+:\d+$/u.test(d.p)) refuse(`${o.file} line ${i + 1} names no place chapter:verse:word`);
    if (d.ubs == null) return;
    if (!Array.isArray(d.ubs)) refuse(`${o.file} line ${i + 1}: UBS's pieces are not a list`);
    const place = `${book} ${d.p}`;
    let hit = false;
    d.ubs.forEach((pc, pi) => {
      const picks = Array.isArray(pc) && Array.isArray(pc[2]) ? pc[2] : null;
      if (!picks) refuse(`${o.file} line ${i + 1}: UBS piece ${pi + 1} holds no list of picks`);
      for (const x of picks) {
        if (!Array.isArray(x) || !Number.isInteger(x[0]) || !(x[3] === undefined || x[3] === null || Array.isArray(x[3]))) refuse(`${o.file} line ${i + 1}: a UBS pick is not [number, meaning, glosses, rows]`);
        for (const r of x[3] || []) {
          if (!Number.isInteger(r) || r < 0 || r >= table.length) refuse(`${o.file} line ${i + 1}: a UBS pick names row ${r}, which the rows tables do not hold`);
          if (table[r][2] !== M) continue;
          const now = nowOfRow(r);
          if (now === null) { refs.naming_a_row_now_gone += 1; continue; }
          const line = category.get(now);
          if (!line) continue;
          refs.picks += 1;
          if (x[0] === 1) refs.pick1 += 1;
          refs.rows_named.add(now);
          hit = true;
          if (line.picked_at[line.picked_at.length - 1] !== place && !line.picked_at.includes(place)) line.picked_at.push(place);
        }
      }
    });
    if (hit) refs.places += 1;
  });
}

// ---- call 7b, read against the category -------------------------------------------------------
const callsPin = JSON.parse(readFileSync(join(CALLS, "PIN.json"), "utf8"));
const b7Pin = (callsPin.lists || {}).call7b_ubs_phrases_a_press_away;
if (!b7Pin) refuse("data/audit-calls/PIN.json names no list call7b_ubs_phrases_a_press_away");
const b7 = pinned(() => readPinnedLines(join(CALLS, callsPin.folder, b7Pin.file), b7Pin, `${callsPin.folder}/${b7Pin.file}`));
const callsReadAt = ((((JSON.parse(pinned(() => readPinned(join(CALLS, callsPin.folder, callsPin.receipt.file), callsPin.receipt)).toString("utf8")).inputs) || {})["<given> store-now"]) || {}).store_version || null;
const follow7b = pinned(() => openFollower({ data: dirname(STORE), index, readAt: callsReadAt }));
const b7Class = {};
for (const [i, l] of b7.entries()) {
  if (typeof l.k !== "string" || !Number.isInteger(l.rank) || l.m !== M || !/^[0-9a-f]{16}$/u.test(String(l.sha))) refuse(`${b7Pin.file} line ${i + 1} names no row of ${M} by key, rank and sha16`);
  const went = pinned(() => follow7b.nowOf([l.k, l.rank, l.m, l.sha]));
  if (went.state !== "struck" && went.state !== "withheld" && !named.has(join1(went.name))) refuse(`${b7Pin.file} line ${i + 1} (${l.m}, rank ${l.rank}, ${l.sha}) is ${went.state} by the row-strikes record, and the store does not hold it under that name`);
  const cls = went.state === "struck" || went.state === "withheld" ? went.state : named.get(join1(went.name));
  b7Class[cls] = (b7Class[cls] || 0) + 1;
}

// ---- what is written, held to the pin ----------------------------------------------------------
const lines = [...category.values()].sort((a, b) => (a.k < b.k ? -1 : a.k > b.k ? 1 : a.rank - b.rank));
const listBytes = Buffer.from(lines.map((x) => JSON.stringify(x)).join("\n") + "\n", "utf8");
const withPlaces = lines.filter((x) => x.picked_at.length).length;
const followed = followedRecord(follow, { left: goneAnswers, rekeyed, retexted });
const receipt = {
  schema_version: "UBS_COLLOCATION_ROWS_RECEIPT_V1",
  rule_id: UBS_COLLOCATIONS_RULE_ID,
  generated_by: "tools/derive-ubs-collocations-v1.mjs",
  what: "the rows of the UBS dictionary every meaning of whose text UBS's own file marks with a collocation (LEXCollocations, read through the catalog's route file), less the rows the names gate reads as a name, each with its collocations as UBS writes them, its meanings' LEXIDs, and the places UBS's own default pick names it (picked_at); read on the store named here, the picks followed through the row-strikes record from the store the default picks ledger v1.2 read",
  inputs: {
    dictionary: { file: pin.dictionary.file, bytes: pin.dictionary.bytes, sha256: pin.dictionary.sha256 },
    routes: { file: pin.routes.file, bytes: pin.routes.bytes, sha256: pin.routes.sha256 },
    default_picks: { pin: "data/default-picks/PIN.json", rows_tables: [pp.rows, pp.rows_added, pp.rows_added_v1_2].map((e) => ({ file: e.file, sha256: e.sha256, lines: e.lines })), book_files: outputs.length, read_at_store_version: picksReadAt },
    call7b: { pin: "data/audit-calls/PIN.json", file: b7Pin.file, sha256: b7Pin.sha256, lines: b7Pin.lines, read_at_store_version: callsReadAt },
    store_version: index.store_version || null,
    source: { m: M, key: UBS_SOURCE_KEY },
  },
  meanings: { all: meanings, with_a_collocation: marked },
  rows: { of_the_dictionary: C.rows, reached_by_the_route_file: C.reached, marked: C.marked_rows, marked_keys: markedKeys.size },
  category: { rows: C.category, keys: categoryKeys.size, rows_with_places: withPlaces, rows_with_no_place: C.category - withPlaces },
  not_of_it: {
    name_rows: { rows: C.name_rows, why: "the names gate reads the row as a name (its facts carry name): «The Bible dictionaries' own name entries keep the gate as it is: they stand where the text's word is a name»" },
    also_plain: { rows: C.also_plain, of_them_name_rows: C.also_plain_and_name, why: "the row's text is also the text of a meaning UBS gives no collocation: UBS itself says the text is also a plain meaning" },
  },
  picked_at: { references: refs.picks, at_pick_1: refs.pick1, places: refs.places, rows_named: refs.rows_named.size, references_to_a_row_a_round_took_since: refs.naming_a_row_now_gone, followed },
  call7b: { lines: b7.length, by_class: b7Class },
  list: { file: listPin ? listPin.file : "ubs-collocation-rows-v1.jsonl", bytes: listBytes.length, sha256: sha256Of(listBytes), lines: lines.length },
};
const receiptBytes = Buffer.from(`${JSON.stringify(receipt, null, 1)}\n`, "utf8");
const out = [[listPin, listBytes, lines.length, "list"], [receiptPin, receiptBytes, undefined, "receipt"]];
const held = out.map(([p, b, count]) => heldToPin(b, count, p));
const figures = { store_version: index.store_version || null, meanings: meanings, meanings_with_a_collocation: marked, rows_of_the_dictionary: C.rows, rows_reached: C.reached, rows_marked: C.marked_rows, marked_keys: markedKeys.size,
  rows: C.category, keys: categoryKeys.size, name_rows: C.name_rows, also_plain: C.also_plain, rows_with_places: withPlaces,
  references: refs.picks, references_at_pick_1: refs.pick1, places: refs.places, rows_named_by_a_pick: refs.rows_named.size, rounds_since_the_picks: follow.rounds.length,
  call7b_inside: b7Class.category || 0, call7b_by_class: b7Class,
  files: out.map(([p, b, count, what]) => ({ what, file: p ? p.file : null, bytes: b.length, sha256: sha256Of(b), ...(count !== undefined ? { lines: count } : {}) })), the_pin_names_these_bytes: held.every(Boolean) };
console.log(`UBS's collocations · ${n0(meanings)} meanings, ${n0(marked)} with a collocation · store ${index.store_version}: ${n0(C.rows)} rows of ${M}, every one reached by the route file; the mark reaches ${n0(C.marked_rows)} rows on ${n0(markedKeys.size)} keys · the category ${n0(C.category)} rows on ${n0(categoryKeys.size)} keys (not of it: ${n0(C.name_rows)} name rows, ${n0(C.also_plain)} rows also a plain meaning) · UBS's picks: ${n0(refs.picks)} references (${n0(refs.pick1)} at pick 1) at ${n0(refs.places)} places name ${n0(refs.rows_named.size)} rows of it (${n0(withPlaces)} carry places) · followed from ${picksReadAt}: ${followedSaid(followed)} · call 7b: ${JSON.stringify(b7Class)}`);
for (const [p, b, count, what] of out) console.log(`  ${what} ${p ? p.file : "(the pin names none)"} · ${count !== undefined ? `${n0(count)} lines · ` : ""}${n0(b.length)} bytes · sha256 ${sha256Of(b)}`);
console.log(`figures ${JSON.stringify(figures)}`);
if (DRY) { console.log(`dry run — nothing written · the pin ${figures.the_pin_names_these_bytes ? "names these bytes" : "names other bytes, or none"}`); process.exit(0); }
out.forEach(([p, b, count, what], i) => { if (!held[i]) refuse(`the ${what} as derived (${count !== undefined ? `${count} lines, ` : ""}${b.length} bytes, ${sha256Of(b)}) is not the bytes the pin names under made_here.${what} (${p ? `${p.bytes} bytes, ${p.sha256}` : "nothing"})`); });
for (const [p, b] of out) writeFileSync(join(HOME, basename(p.file)), b);
console.log(`written · data/ubs-collocations/${listPin.file} and ${receiptPin.file}, the bytes the pin names`);
