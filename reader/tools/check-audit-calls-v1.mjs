#!/usr/bin/env node
// RUN: tree
// GUARDS: audit-calls-rule-v1-a-call-lands-as-its-list-names-each-row-and-the-record-says-where-each-row-went
// GUARDS: audit-calls-landing-rule-v1-each-call-lands-as-its-landing-says-rows-through-the-row-strikes-tool-a-rule-under-its-own-id-or-held-with-the-reason, steps-reading-stands-rule-v1-where-step-spells-or-parts-the-word-otherwise-its-own-pick-1-is-the-line-credited-to-step, run-reads-its-words-rule-v1-a-run-whose-every-word-has-its-own-reading-at-the-place-reads-word-by-word-the-joined-reading-a-press-away, ubs-collocations-rule-v1-a-row-carries-the-collocations-its-ubs-meanings-name-and-the-places-ubs-own-pick-names-it
// GUARDS: row-strike-rule-v7-a-named-list-strikes-withholds-re-keys-rejoins-re-heads-retexts-restores-or-lands-a-row-the-hole-is-typed-and-a-landed-cut-is-counted-a-retext-from-words-back-keeps-the-rows-closes-and-facts
// LEDGER: -
// no frame letter. A check reads the lists, the record and the store and
// judges them; it is not the ledger for one.
//
// EACH AUDIT CALL LANDED AS ITS LIST NAMES IT, ROW BY ROW, AND THE RECORD SAYS
// WHERE EACH ROW WENT.
//
// The owner's audit ended in eight calls, each with the corpus lane's
// recommendation, and on 14 November 2026 the owner took them all. The lane
// sent each call as a list the page can land (relay v189; the lists are kept
// byte for byte in data/audit-calls/calls-v1/, and PIN.json names them and
// says how each lands). Three of them act on rows of the store, through
// tools/strike-rows-v1.mjs, and leave their rounds in data/row-strikes-v1.json:
//
//   call 5  rows under a key that ends in a maqaf, a key no card ever asks:
//           5,403 struck (the plain key holds their words), 357 moved to the
//           plain key, which lacked them
//   call 6  449 rows that only name a class of word, or stand for words
//           their source has not written yet: to be withheld. HELD
//   call 2  2 rows the lane read as not their source's sentence: to be
//           withheld; and 42 openings of the unabridged BDB named so that
//           they are NOT withheld (another relay gives them their words
//           back). HELD
//
// CALLS 6 AND 2 ARE HELD (15 November 2026, the day they were rehearsed, by
// the lead of the page lane on the owner's rule: a row is set apart only on
// what its own source says of it, and never row by row). Call 6's test reads
// a row's English text, that it only names its class of word, and not
// anything the row's own source says of it; it withholds true readings:
// «verb» under the Hebrew word for verb, «pronoun» under the word for
// pronoun, MACULA's own «surname» at Isaiah 45:4:9. Call 2's two rows are
// their source's own sentence, and only looked otherwise because the page's
// own round of 7 November decoded the source's font codes in them. Neither
// lands. Their lists stay pinned, byte for byte, as data, and the pin records
// each as held with its reason (the landing's `held`); this check holds that
// no line of either list was struck or withheld. The rehearsal that landed
// them is kept beside the steps' script, not in the tree that ships.
//
// What is held here, each read again from the lists and none taken from a
// tool's word:
//
//   A1  the lane's rule, receipt, counts, second count and twelve lists are
//       the bytes the pin names; the lane's receipt names each list by the
//       same size and sha256; and call 4's list is the bytes the default
//       picks' own pin names for it, the one list two pins name
//   A2  call 5: one round of the record landed its list, under the reason
//       the pin gives and with no line left off; every line of the list is
//       a row of that round with the line's own action (a strike, or a
//       re-key that landed under the line's plain key with the headwords the
//       line names, none folded), and the round holds no other row
//   A3  no key of the store ends in a maqaf
//   A4  the rows call 5 moved stand: each once under its plain key at the
//       rank the round gave it, with its source, its words and those
//       headwords. Where a moved row stands now is asked of the follower
//       (tools/row-strikes-follow-v1.mjs, the one rule for following a row
//       through the rounds of the record), read at the store call 5's
//       round ran on; this check walks no round of the record itself. One
//       a later round took or moved again is followed there and named, not
//       failed; one the follower refuses (a retext, a fold, a rejoin, a
//       row strike the record does not hold) fails, in the follower's words
//   A5  the re-key map (data/audit-calls/call5-rekey-map-v1.jsonl) is the
//       bytes the pin names and says what the round says: one line per
//       moved row, the name it had and the name it has
//   A6  call 6 is held: the pin records it so, with the reason; no round of
//       the record landed its list; and every line's row stands in the store
//       as the list names it, once, by key, rank, source and words, with no
//       round of the record having struck or withheld it. The one exception
//       is named, not passed over: a line the pin's landing leaves off for
//       call 5 names a row under a key that ends in a maqaf, which call 5's
//       own list strikes and its round struck
//   A7  call 2 is held: the pin records it so, with the reason; no round
//       landed its list; and its two rows stand, struck or withheld by no
//       round
//   A8  no row call 5 struck stands in the store
//   A9  the 42 openings call 2 names stand, each once at its key and rank
//       under its source, with the words the list gives it; or, where the
//       round that lands relay v187's words back (a retext from the slot
//       words_back, row-strike-rule-v7) retexted it, with the words that
//       round gave it, which print as the list says the row prints once its
//       words are back; and no round of the record struck or withheld one
//
// Calls 7, 4 and 3 land in ships 5 and 6 (the pin's landings, under
// audit-calls-landing-rule-v1): call 7 as an order and a kind, call 4 as the
// default picks' stands, call 3 as a rule of the page held to relay v181's
// list of the lines over several words.
//
//   A10 call 4: the default picks' index stands STEP's own words as the line
//       (step_words [n, words, 1]) at exactly the places of the list whose
//       action makes STEP's words the line, whose words hold no « | », and
//       whose zone word is not a pair whose read form is several words, each
//       with the list's words byte for byte, and at no other; each place of
//       the list is a zone word carrying the list's letters, and every place
//       falls in one class: stands, « | » held, the action none, or the read
//       form of several words (v192's), counted as the bake's receipt
//       counts them where it has run
//   A11 call 3: each of relay v181's lines over several words reads in the
//       records of the resting lines word by word, each of its words under
//       a line of its own, where every word of it has its own reading at the
//       place (its place pieces, which print where every piece says
//       something, or a place where STEP's reading stands, A10's); and
//       otherwise it is held over exactly its words with v181's text and
//       credit (a bridged mark set aside, as the page sets it aside)
//   A12 call 7: 7a lands no fact (no row of its list carries collocations or
//       picked_at, and no row of the store a fact the facts slot does not
//       name); 7b's rows are UBS's own category where they carry no name
//       fact (each carries collocations), its rows outside it named by class
//       (a name row; or a row whose text is also a plain meaning, which the
//       derived list's receipt counts); 7c's and 7d's rows carry no
//       collocations; and each 7e line whose row is of the category has its
//       place in that row's picked_at, the others named by class. Until the
//       store steps lay the facts (the store's index holds no
//       ubs_collocations) A12 is not judged, and the check exits 3
//
// Run: node tools/check-audit-calls-v1.mjs [--store data/route-store] [--record data/row-strikes-v1.json]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { follower, sha16Of, FollowFault } from "./row-strikes-follow-v1.mjs";
import { routePrinted, factsOf, FACTS_WRITTEN_BY } from "./gloss-store-v1.mjs";
import { readRecord, recordPath } from "./resting-lines-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
const RECORD = arg("record", join(K3, "data", "row-strikes-v1.json"));
const HOME = join(K3, "data", "audit-calls");
const RULE = "audit-calls-rule-v1-a-call-lands-as-its-list-names-each-row-and-the-record-says-where-each-row-went";
const MAQAF = "\u05be";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");
const idOf = (m, key, rank, route) => [m, key, rank, route].join("\u0001");

console.log(`— ${RULE} —\n`);
if (!existsSync(join(HOME, "PIN.json"))) { console.log("SKIPPED — no audit calls on this disk (data/audit-calls/PIN.json)"); process.exit(3); }
if (!existsSync(join(STORE, "index.json"))) { console.log(`SKIPPED — no store at ${STORE}`); process.exit(3); }
const pin = JSON.parse(readFileSync(join(HOME, "PIN.json"), "utf8"));

// ---- A1: the pinned bytes ------------------------------------------------------------------------
const pinFaults = [];
const lists = {};
const held = (read) => { try { return read(); } catch (e) { if (!(e instanceof PinFault)) throw e; pinFaults.push(e.message); return null; } };
if (pin.schema_version !== "AUDIT_CALLS_PIN_V1" || !pin.lists || !Array.isArray(pin.landings)) pinFaults.push("the pin is not AUDIT_CALLS_PIN_V1 with its lists and how each lands");
for (const k of ["rule", "counts", "verify_receipt"]) held(() => readPinned(join(HOME, pin.folder, (pin[k] || {}).file || k), pin[k] || {}, `${pin.folder}/${(pin[k] || {}).file || k}`));
const receiptBytes = held(() => readPinned(join(HOME, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`));
const theirs = receiptBytes ? (JSON.parse(receiptBytes.toString("utf8")).outputs || {}) : {};
for (const [k, p] of Object.entries(pin.lists || {})) {
  lists[k] = held(() => readPinnedLines(join(HOME, pin.folder, p.file), p, `${pin.folder}/${p.file}`)) || [];
  const o = theirs[p.file];
  if (receiptBytes && (!o || o.sha256 !== p.sha256 || o.bytes !== p.bytes || o.lines !== p.lines)) pinFaults.push(`the lane's receipt does not name ${p.file} by the size, sha256 and lines its pin names`);
}
// call 4's list stands in two pins: this one, and the default picks', whose bake reads it
const picksPinPath = join(K3, "data", "default-picks", "PIN.json");
let twoPins = "the default picks' pin is not on this disk";
if (existsSync(picksPinPath)) {
  const theirsToo = JSON.parse(readFileSync(picksPinPath, "utf8")).held_split_v189 || null, mine = (pin.lists || {}).call4_steps_reading_stands || {};
  if (!theirsToo) twoPins = "the default picks' pin does not name call 4's list";
  else {
    if (theirsToo.sha256 !== mine.sha256 || theirsToo.bytes !== mine.bytes || theirsToo.lines !== mine.lines) pinFaults.push(`call 4's list is ${mine.bytes} bytes, ${String(mine.sha256).slice(0, 12)} in this pin and ${theirsToo.bytes} bytes, ${String(theirsToo.sha256).slice(0, 12)} in the default picks' pin`);
    twoPins = "call 4's list is the same bytes in the default picks' pin";
  }
}
check("A1  the lane's rule, receipt, counts, second count and lists are the bytes the pin names, and the lane's receipt names each list by the same bytes", pinFaults.length === 0,
  pinFaults.length ? first(pinFaults) : `relay ${pin.relay} · 4 files and ${Object.keys(lists).length} lists (${nf(Object.values(lists).reduce((a, l) => a + l.length, 0))} lines) · ${twoPins}`);

// ---- the record's rounds, and the store's keys and the rows this check asks of it ------------------
const record = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, "utf8")) : { rounds: [] };
const rounds = Array.isArray(record.rounds) ? record.rounds : [];
const landing = (call) => (pin.landings || []).find((l) => l.call === call) || { leave_off: [] };
const roundsOf = (k) => rounds.filter((r) => r.list && r.list.sha256 === ((pin.lists || {})[k] || {}).sha256);
const L5 = lists.call5_maqaf_keys || [], L6 = lists.call6_withhold || [], L2 = lists.call2_withhold || [], OPENINGS = lists.call2_bdb_openings_not_withheld || [];
const R5 = roundsOf("call5_maqaf_keys"), R6 = roundsOf("call6_withhold"), R2 = roundsOf("call2_withhold");

// where each row call 5 moved stands now (A4) is the follower's answer, read at the store call 5's round ran on, so
// that call 5's round is the first it follows the row through; never this check's own walk of the record
let follow = null, followWhy = "call 5's list was not landed by exactly one round of the record, so the follower was not asked";
const nowOfMoved = new Map();   // the list's line (from 1) -> the follower's answer for the row the line moved, or { fault }
if (R5.length === 1) {
  const readAt = (R5[0].store_version || {}).was || null;
  try {
    follow = follower({ record, index: JSON.parse(readFileSync(join(STORE, "index.json"), "utf8")), readAt });
    if (!follow.rounds.length || follow.rounds[0].ran_at !== R5[0].ran_at) { followWhy = `the follower, read at store ${readAt}, where call 5's round began, does not follow the rows through call 5's round first`; follow = null; }
  } catch (e) { if (e instanceof FollowFault) followWhy = e.message; else throw e; }
}
if (follow) L5.forEach((e, i) => {
  if (e.action !== "re-key") return;
  try { nowOfMoved.set(i + 1, follow.nowOf([e.key, e.rank, String(e.m), sha16Of(e.route)])); } catch (f) { if (f instanceof FollowFault) nowOfMoved.set(i + 1, { fault: f.message }); else throw f; }
});
// call 7's lists (A12): each row named by key, rank, source and sha16, followed from the store the calls were read on
const L7 = { a: lists.call7a_strongs_sign_a_press_away || [], b: lists.call7b_ubs_phrases_a_press_away || [], c: lists.call7c_ubs_one_word_senses_at_rest || [], d: lists.call7d_sdbh_held || [], e: lists.call7e_ubs_phrase_rows_named_by_a_ubs_pick || [] };
const UBS_SAID = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8")).ubs_collocations || null;
const callsReadAt = (() => { try { return ((JSON.parse(readFileSync(join(HOME, pin.folder, pin.receipt.file), "utf8")).inputs || {})["<given> store-now"] || {}).store_version || null; } catch { return null; } })();
let follow7 = null, follow7Why = null;
const now7 = new Map();   // "<list> <line>" -> the follower's answer for the row the line names
if (UBS_SAID) {
  try { follow7 = follower({ record, index: JSON.parse(readFileSync(join(STORE, "index.json"), "utf8")), readAt: callsReadAt }); } catch (e) { if (e instanceof FollowFault) follow7Why = e.message; else throw e; }
  if (follow7) for (const [lk, L] of Object.entries(L7)) L.forEach((e, i) => {
    const name = [e.k ?? e.key, e.rank, String(e.m), e.sha ?? sha16Of(e.route)];
    try { now7.set(`${lk} ${i}`, follow7.nowOf(name)); } catch (f) { if (f instanceof FollowFault) now7.set(`${lk} ${i}`, { fault: f.message }); else throw f; }
  });
}
const wanted = new Set([...L5.flatMap((e) => (e.action === "re-key" ? [e.key, e.to_key] : [e.key])), ...L6.map((e) => e.key), ...L2.map((e) => e.key), ...OPENINGS.map((e) => e.key)]);
for (const a of now7.values()) if (Array.isArray(a.name)) wanted.add(a.name[0]);
// a row a later round moved again is asked of the store under the key the follower names
for (const a of nowOfMoved.values()) if (Array.isArray(a.name)) wanted.add(a.name[0]);
const rowsAt = new Map();   // key -> its rows, for the keys this check asks
const maqafKeys = [];
let keys = 0;
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) {
    keys += 1;
    if (k.endsWith(MAQAF)) maqafKeys.push(`${k} (${rows.length} rows, shard ${f.slice(0, 2)})`);
    if (wanted.has(k)) rowsAt.set(k, rows);
  }
}
const standing = (m, key, rank, route) => (rowsAt.get(key) || []).filter((r) => r[0] === rank && String(r[3]) === m && r[1] === route);

// one round, under the pin's reason: the faults of a call's round that every call shares
const roundFaults = (name, found, call) => {
  if (found.length !== 1) return [`${found.length} rounds of the row-strikes record landed ${name}'s list`];
  const want = landing(call);
  return found[0].reason === want.reason ? [] : [`${name}'s round stands under the reason «${found[0].reason}», and the pin gives «${want.reason}»`];
};

// ---- A2: call 5 ------------------------------------------------------------------------------------
const moved = [];   // each re-key line with the row of the round that moved it
{
  const faults = roundFaults("call 5", R5, 5);
  const r = R5[0] || { rows: [], list: {}, counts: {} };
  if ((r.list.left_off || []).length) faults.push(`call 5's round left ${r.list.left_off.length} line(s) off`);
  const byId = new Map((r.rows || []).map((x) => [idOf(x.m, x.key, x.rank, x.route), x]));
  let strikes = 0;
  L5.forEach((e, i) => {
    const x = byId.get(idOf(e.m, e.key, e.rank, e.route)), where = `line ${i + 1} (${e.m} ${e.key} rank ${e.rank})`;
    if (!x) { if (R5.length === 1) faults.push(`${where} is no row of the round`); return; }
    if (e.action === "strike") { strikes += 1; if (x.action !== "strike") faults.push(`${where} is a strike in the list and a ${x.action} in the round`); return; }
    if (x.action !== "re-key" || x.folded_into || x.to_key !== e.to_key || !Number.isInteger(x.to_rank) || !same(x.to_headwords, e.to_headwords)) faults.push(`${where} is a re-key to ${e.to_key} in the list, and the round did not land it there as a row of its own with the list's headwords`);
    else moved.push({ e, x, line: i + 1 });
  });
  if (R5.length === 1 && r.rows.length !== L5.length) faults.push(`the round holds ${r.rows.length} rows and the list ${L5.length} lines`);
  check("A2  call 5: one round landed its list under the pin's reason, with no line left off; every line is a row of the round with the line's action, a re-key landed under its plain key with the list's headwords, and the round holds no other row",
    L5.length > 0 && faults.length === 0, faults.length ? `${faults.length} · ${first(faults)}` : `${nf(L5.length)} lines · ${nf(strikes)} struck · ${moved.length} moved to ${new Set(moved.map((y) => y.e.to_key)).size} plain keys, none folded · the round of ${r.ran_at}, store ${(r.store_version || {}).was} -> ${(r.store_version || {}).now}`);
}

// ---- A3: no key ends in a maqaf ----------------------------------------------------------------------
check("A3  no key of the store ends in a maqaf", maqafKeys.length === 0, maqafKeys.length ? `${nf(maqafKeys.length)} keys end in one · ${first(maqafKeys)}` : `${nf(keys)} keys read`);

// ---- A4: the moved rows stand ------------------------------------------------------------------------
{
  const faults = follow ? [] : [followWhy], since = [];
  for (const { e, x, line } of follow ? moved : []) {
    const a = nowOfMoved.get(line) || { fault: "the follower was not asked of it" };
    if (a.fault) { faults.push(`line ${line}: ${a.fault}`); continue; }
    const by = a.by ? a.by.list || `the round of ${a.by.ran_at}` : "";
    // a later round took it: named, not failed
    if (a.state === "struck" || a.state === "withheld") { since.push(`line ${line}: ${a.state} since by ${by}`); continue; }
    if (a.state !== "re-keyed") { faults.push(`line ${line}: the follower finds the row ${a.state} as the list names it, and call 5's round moved it`); continue; }
    const [key, rank] = a.name, again = key !== x.to_key || rank !== x.to_rank;
    if (again) since.push(`line ${line}: moved again to ${key} rank ${rank} by ${by}`);
    const rows = standing(e.m, key, rank, e.route), where = `line ${line}: ${e.m} «${String(e.route).slice(0, 40)}» at ${key} rank ${rank}`;
    if (rows.length !== 1) faults.push(`${where} stands ${rows.length} times`);
    else if (!again && !same(rows[0][6], e.to_headwords)) faults.push(`${where} carries the headwords ${JSON.stringify(rows[0][6])}, not ${JSON.stringify(e.to_headwords)}`);
  }
  check("A4  the rows call 5 moved stand, each once under its plain key at the rank the round gave it, with its source, its words and the headwords its line names; where each stands now is the follower's answer: one a later round took or moved again is named, and one the follower refuses fails",
    moved.length > 0 && faults.length === 0, faults.length ? `${faults.length} · ${first(faults)}` : `${moved.length} rows · followed from store ${follow.readAt} through ${follow.rounds.length} round(s) of the record, call 5's the first${since.length ? ` · ${since.length} acted on since: ${first(since)}` : " · none acted on by a later round"}`);
}

// ---- A5: the re-key map ----------------------------------------------------------------------------------
{
  const p = (pin.made_here || {}).call5_rekey_map || null, faults = [];
  let map = [];
  if (!p) faults.push("the pin names no re-key map (made_here.call5_rekey_map)");
  else try { map = readPinnedLines(join(HOME, p.file), p, p.file); } catch (e) { if (!(e instanceof PinFault)) throw e; faults.push(e.message); }
  if (map.length && map.length !== moved.length) faults.push(`the map holds ${map.length} lines and the round moved ${moved.length} rows`);
  map.forEach((l, i) => {
    const y = moved[i];
    if (!y) return;
    const h = sha16Of(y.e.route);
    if (!same(l.from, [y.e.key, y.e.rank, y.e.m, h]) || !same(l.to, [y.x.to_key, y.x.to_rank, y.e.m, h])) faults.push(`map line ${i + 1} does not say what the round says of list line ${y.line}`);
    const named = !!y.e.default_picks_naming_it && Object.values(y.e.default_picks_naming_it).some((c) => c > 0);
    if (l.named_by_a_pick !== named) faults.push(`map line ${i + 1} says ${l.named_by_a_pick ? "a pick names" : "no pick names"} the row, and the list says otherwise`);
  });
  check("A5  the re-key map is the bytes the pin names and says what the round says: one line per moved row, the name it had and the name it has", !!p && map.length > 0 && faults.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : `${map.length} lines · ${map.filter((l) => l.named_by_a_pick).length} of the rows named by a default pick · ${p.file} ${String(p.sha256).slice(0, 12)}`);
}

// ---- A6, A7: calls 6 and 2 are held -------------------------------------------------------------------------
// a held call: the pin says so and why; no round landed its list; every line's row stands, taken by no round, but
// the lines the pin's landing leaves off for call 5, each a row call 5's own round struck
const heldLaw = (law, name, call, L, found) => {
  const faults = [], want = landing(call), h = want.held || null, said = [];
  if (!h || !h.on || typeof h.why !== "string" || !h.why.trim()) faults.push(`the pin does not record ${name} as held, with the day and the reason (its landing's held)`);
  if (found.length) faults.push(`${found.length} round(s) of the row-strikes record landed ${name}'s list (${found.map((r) => r.ran_at).join(", ")}): a held call lands nothing`);
  let stand = 0;
  L.forEach((e, i) => {
    const where = `line ${i + 1} (${e.m} rank ${e.rank} «${String(e.route).slice(0, 30)}»)`;
    const took = rounds.flatMap((r) => (r.rows || []).filter((y) => ["strike", "withhold"].includes(y.action) && y.m === e.m && y.key === e.key && y.rank === e.rank && y.route === e.route).map((y) => ({ y, r })))[0] || null;
    const left = (want.leave_off || []).find((w) => w.m === e.m && w.key === e.key) || null;
    if (left) {
      // the same row stands on call 5's list, under a key that ends in a maqaf: call 5's round struck it, and that is said
      if (took && R5.includes(took.r) && took.y.action === "strike" && e.key.endsWith(MAQAF)) said.push(`line ${i + 1}, ${e.m} rank ${e.rank} «${e.route}», is a row call 5's own list strikes, and its round struck it (the pin: «${left.why}»)`);
      else faults.push(`${where} is left off in the pin as a row call 5 struck, and call 5's round did not strike it`);
      return;
    }
    if (took) { faults.push(`${where} was ${took.y.action === "strike" ? "struck" : "withheld"} by ${took.r.list ? took.r.list.file : "a round with no list"}`); return; }
    const rows = standing(e.m, e.key, e.rank, e.route);
    if (rows.length !== 1) faults.push(`${where} stands ${rows.length} times in the store`); else stand += 1;
  });
  check(`${law}  ${name} is held: the pin records it so, with the reason; no round of the record landed its list; and every line's row stands in the store as the list names it, struck or withheld by no round${(want.leave_off || []).length ? ", but the line the pin leaves off, a row call 5's own round struck" : ""}`,
    L.length > 0 && faults.length === 0, faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${L.length} lines · ${stand} rows stand${said.length ? ` · ${said.join("; ")}` : ""} · held on ${h.on}: ${h.why}`);
};
heldLaw("A6", "call 6", 6, L6, R6);
heldLaw("A7", "call 2", 2, L2, R2);

// ---- A8: what the calls took is gone -----------------------------------------------------------------------
{
  const taken = L5.filter((e) => e.action === "strike"), still = [];
  for (const e of taken) if (standing(e.m, e.key, e.rank, e.route).length) still.push(`${e.m} ${e.key} rank ${e.rank} «${String(e.route).slice(0, 40)}»`);
  check("A8  no row call 5 struck stands in the store", taken.length > 0 && still.length === 0, still.length ? `${nf(still.length)} still stand · ${first(still)}` : `${nf(taken.length)} rows asked by key, rank, source and words`);
}

// ---- A9: the 42 openings stand ---------------------------------------------------------------------------
{
  // the rows the round that lands relay v187's words back retexted (row-strike-rule-v7: a retext from words_back)
  const wordsBack = new Map();
  for (const r of rounds) for (const y of r.rows || []) if (y.action === "retext" && y.from_slot === "words_back") wordsBack.set(`${y.m}\u0001${y.key}\u0001${y.rank}`, y);
  const faults = []; let back = 0;
  for (const [i, e] of OPENINGS.entries()) {
    const where = `line ${i + 1} (${e.m} ${e.key} rank ${e.rank})`;
    const y = wordsBack.get(`${e.m}\u0001${e.key}\u0001${e.rank}`) || null;
    if (y && y.route !== e.route) { faults.push(`${where} was retexted from «${String(y.route).slice(0, 40)}», and the list reads «${String(e.route).slice(0, 40)}»`); continue; }
    const words = y ? y.to_text : e.route;
    const rows = (rowsAt.get(e.key) || []).filter((r) => r[0] === e.rank && String(r[3]) === e.m && r[1] === words);
    if (rows.length !== 1) faults.push(`${where} stands ${rows.length} times with ${y ? "the words the retext gave it" : "the words the list gives it"}`);
    else if (y) {
      if (routePrinted(rows[0]) !== e.v187_prints) faults.push(`${where} prints «${String(routePrinted(rows[0])).slice(0, 50)}», and the list says it prints «${String(e.v187_prints).slice(0, 50)}» once its words are back`);
      else back += 1;
    }
    const texts = [e.route, ...(y ? [y.to_text] : [])];
    const took = rounds.flatMap((r) => (r.rows || []).filter((x) => ["strike", "withhold"].includes(x.action) && x.m === e.m && x.key === e.key && x.rank === e.rank && texts.includes(x.route)).map(() => (r.list ? r.list.file : "a round with no list")))[0];
    if (took) faults.push(`${where} was struck or withheld by ${took}`);
  }
  check("A9  the openings of the unabridged BDB that call 2 names stand, each once at its key and rank under its source, with the words the list gives it, or, retexted by the round that lands the words back, with the words it gave them, printing as the list says they print once back; no round struck or withheld one",
    OPENINGS.length > 0 && faults.length === 0, faults.length ? `${faults.length} · ${first(faults)}` : `${OPENINGS.length} openings · ${OPENINGS.length - back} with the words the list read, ${back} with their words back${wordsBack.size ? ` (the words-back round retexted ${wordsBack.size} rows)` : " (no round has given words back yet)"}`);
}

// ---- the zones' places, numbered as the default picks number them (WORD_N: every entry of the book in order, a mark
// counted too), each word labeled as the ledger labels it (the verse and the word's number in it, the marks not counted)
const zoneCache = new Map();
const placesOfBook = (book) => {
  if (zoneCache.has(book)) return zoneCache.get(book);
  const path = join(K3, "data", "zones", `${book}.bin`);
  let out = null;
  if (existsSync(path)) {
    const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    const byLabel = new Map(), sections = new Map(), nAt = new Map();
    let n = 0;
    for (const sec of z.sections || []) {
      let k = 0;
      const words = sec.words || [];
      sections.set(String(sec.label), words);
      words.forEach((w, entry) => { n += 1; if (!w || w.mark) return; k += 1; byLabel.set(`${sec.label}:${k}`, { n, w, entry }); nAt.set(`${sec.label}\u0001${entry}`, n); });
    }
    out = { byLabel, sections, nAt };
  }
  zoneCache.set(book, out);
  return out;
};
const picksIx = existsSync(join(K3, "data", "default-picks", "index.json")) ? JSON.parse(readFileSync(join(K3, "data", "default-picks", "index.json"), "utf8")) : null;
const standsIn = new Map();   // "<book> <n>" -> STEP's words, where the index stands them
if (picksIx) for (const [b, e] of Object.entries(picksIx.books || {})) for (const r of e.step_words || []) if (r[2] === 1) standsIn.set(`${b} ${r[0]}`, r[1]);

// ---- A10: call 4's stands in the index -------------------------------------------------------------------------------
{
  const L4 = lists.call4_steps_reading_stands || [], faults = [];
  const cls = { stands: 0, read_form_of_several_words: 0, held_split: 0, none: 0 };
  const want = new Map();
  let pairs = 0;
  if (!picksIx) faults.push("no index of the default picks on this disk (data/default-picks/index.json)");
  for (const [b, e] of Object.entries((picksIx || {}).books || {})) for (const r of e.step_words || []) if (r.length > 2 && r[2] !== 1) faults.push(`${b} place ${r[0]}: the index carries a third element ${JSON.stringify(r[2])} the rule does not name`);
  L4.forEach((d, i) => {
    const at = (placesOfBook(d.book) || { byLabel: new Map() }).byLabel.get(d.p), where = `line ${i + 1} (${d.book} ${d.p})`;
    if (!at) { faults.push(`${where} is no word of the zones`); return; }
    if (at.w.s !== d.s) faults.push(`${where} names letters its zone word does not carry`);
    const c = d.action !== "steps_words_are_the_line" ? "none" : at.w.kq && Number(at.w.kq.words_read) > 1 ? "read_form_of_several_words" : String(d.steps_words).includes(" | ") ? "held_split" : "stands";
    cls[c] += 1;
    if (c === "stands") { want.set(`${d.book} ${at.n}`, d.steps_words); if (at.w.kq) pairs += 1; }
  });
  for (const [id, words] of want) { if (!standsIn.has(id)) faults.push(`${id}: call 4 stands STEP's words here, and the index does not`); else if (standsIn.get(id) !== words) faults.push(`${id}: the index stands «${standsIn.get(id)}», call 4 «${words}»`); }
  for (const id of standsIn.keys()) if (!want.has(id)) faults.push(`${id}: the index stands STEP's words at a place call 4 does not`);
  const rc = existsSync(join(K3, "data", "default-picks-receipt-v1.json")) ? (JSON.parse(readFileSync(join(K3, "data", "default-picks-receipt-v1.json"), "utf8")).steps_reading_stands || null) : null;
  if (rc && JSON.stringify(rc.by_class) !== JSON.stringify(cls)) faults.push(`the bake's receipt counts the classes ${JSON.stringify(rc.by_class)}, the list read here ${JSON.stringify(cls)}`);
  check("A10 call 4: the index stands STEP's own words as the line at exactly the places of the list whose action makes them the line, with no « | » and no read form of several words, each with the list's words, and at no other; every place a zone word with the list's letters, in one class",
    L4.length > 0 && cls.stands > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(L4.length)} places · stands ${nf(cls.stands)} (${nf(cls.stands - pairs)} words, ${pairs} pairs) · « | » held ${cls.held_split} · none ${cls.none} · read form of several words ${cls.read_form_of_several_words}${rc ? " · as the bake's receipt counts them" : " · the bake's receipt says nothing of them yet"}`);
}

// ---- A11: call 3, relay v181's lines over several words -----------------------------------------------------------------
{
  const p3 = pin.call3_lines_over_several_words_v181 || null, faults = [];
  let lines = [], wordByWord = 0, held = 0;
  if (!p3 || !p3.list) faults.push("the pin names no list of relay v181's lines over several words");
  else try { lines = readPinnedLines(join(HOME, p3.folder, p3.list.file), p3.list, `${p3.folder}/${p3.list.file}`); } catch (e) { if (!(e instanceof PinFault)) throw e; faults.push(e.message); }
  const recs = new Map();
  const recOf = (b) => { if (!recs.has(b)) { const r = readRecord(recordPath(K3, b)); recs.set(b, r ? new Map((r.sections || []).map(([label, units]) => [String(label), units || []])) : null); } return recs.get(b); };
  lines.forEach((l, i) => {
    const where = `line ${i + 1} (${l.book} ${l.first}-${l.last} «${String(l.line).slice(0, 30)}»)`;
    const z = placesOfBook(l.book), r = recOf(l.book);
    if (!z || !r) { faults.push(`${where}: ${!z ? "no zone" : "no record of the resting lines"} of ${l.book} here`); return; }
    const a = z.byLabel.get(l.first), b = z.byLabel.get(l.last);
    const label = String(l.first).replace(/:\d+$/u, "");
    if (!a || !b || label !== String(l.last).replace(/:\d+$/u, "")) { faults.push(`${where}: its first and last words are not two words of one verse of the zone`); return; }
    const words = z.sections.get(label).slice(a.entry, b.entry + 1);
    // a word's own reading at the place: its place pieces, where every piece says something, or a place where STEP's
    // reading stands (A10's); a mark is set aside
    const own = words.map((w, j) => (w && !w.mark ? { e: a.entry + j, own: (Array.isArray(w.pg) && w.pg.length > 0 && w.pg.every((x) => String((x && x.g) || "").trim())) || standsIn.has(`${l.book} ${z.nAt.get(`${label}\u0001${a.entry + j}`)}`) } : null)).filter(Boolean);
    const units = r.get(label) || [];
    const whole = units.find((u) => u[0] === a.entry && u[1] === b.entry - a.entry + 1);
    if (own.every((o) => o.own)) {
      if (own.every((o) => units.some((u) => u[0] === o.e && u[1] === 1))) wordByWord += 1;
      else faults.push(`${where}: every word has its own reading at the place, and the record ${whole ? `reads it whole, «${String(whole[2]).slice(0, 30)}» [${whole[3]}]` : "does not read each word under a line of its own"}`);
    } else if (whole && whole[2] === l.line && whole[3] === l.credit) held += 1;
    else faults.push(`${where}: some word has no reading of its own at the place, and the record ${whole ? `holds it as «${String(whole[2]).slice(0, 30)}» [${whole[3]}], not v181's «${String(l.line).slice(0, 30)}» [${l.credit}]` : "does not hold it over exactly its words"}`);
  });
  check("A11 call 3: each of relay v181's lines over several words reads word by word in the records where every word has its own reading at the place, and otherwise is held over exactly its words with v181's text and credit",
    lines.length > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} (of ${nf(lines.length)} lines, ${nf(wordByWord)} read word by word and ${held} held as the rule holds them) · ${first(faults)}` : `${nf(lines.length)} lines · ${nf(wordByWord)} read word by word · ${held} held, some word of each with no reading of its own`);
}

// ---- A12: call 7 -------------------------------------------------------------------------------------------------------------
if (!UBS_SAID) console.log("  --  A12 not judged: the store's index holds no record of the tool that lays UBS's collocations (index.ubs_collocations): the store steps have not run on this store, and a law not judged is not passed");
else {
  const faults = follow7 ? [] : [`the follower, read at the store the calls were read on (${callsReadAt}): ${follow7Why}`];
  const rowOf = (lk, i) => {
    const a = now7.get(`${lk} ${i}`);
    if (!a || a.fault) return { fault: a ? a.fault : "not followed" };
    if (a.state === "struck" || a.state === "withheld") return { gone: a.state };
    const [key, rank, m, h] = a.name;
    const rows = (rowsAt.get(key) || []).filter((r) => r[0] === rank && String(r[3]) === m && sha16Of(r[1]) === h);
    return rows.length === 1 ? { row: rows[0] } : { fault: `${rows.length} rows stand under the name the follower gives it` };
  };
  const has = (row, k) => { const f = factsOf(row); return !!f && Object.hasOwn(f, k); };
  // 7a: no fact
  let a7 = 0;
  L7.a.forEach((e, i) => { const x = rowOf("a", i); if (x.row) { a7 += 1; if (has(x.row, "collocations") || has(x.row, "picked_at")) faults.push(`7a line ${i + 1} (${e.k} rank ${e.rank}) carries UBS's facts`); } });
  const unknown = [];
  for (const rows of rowsAt.values()) for (const r of rows) { const f = factsOf(r); if (f) for (const k of Object.keys(f)) if (!Object.hasOwn(FACTS_WRITTEN_BY, k)) unknown.push(`${r[3]} rank ${r[0]} carries the fact ${k}`); }
  faults.push(...unknown.slice(0, 5));
  // 7b: the category, or a name row, or a row the derived list's receipt counts as also plain
  const b7 = { category: 0, name_row: 0, also_plain: 0 };
  L7.b.forEach((e, i) => { const x = rowOf("b", i); if (!x.row) { faults.push(`7b line ${i + 1} (${e.k} rank ${e.rank}): ${x.fault || x.gone}`); return; } b7[has(x.row, "collocations") ? "category" : has(x.row, "name") ? "name_row" : "also_plain"] += 1; });
  let receipt = null;
  try { const made = JSON.parse(readFileSync(join(K3, "data", "ubs-collocations", "PIN.json"), "utf8")).made_here.receipt; receipt = JSON.parse(readFileSync(join(K3, "data", "ubs-collocations", made.file), "utf8")); } catch { receipt = null; }
  // the receipt as tools/derive-ubs-collocations-v1.mjs writes it: call7b { lines, by_class }
  const said7b = receipt && receipt.call7b && receipt.call7b.by_class ? receipt.call7b.by_class : null;
  if (!said7b) faults.push("the derived list's receipt does not count call 7b's rows by class");
  else if (JSON.stringify({ category: said7b.category, name_row: said7b.name_row, also_plain: said7b.also_plain }) !== JSON.stringify(b7)) faults.push(`7b's rows read here: ${JSON.stringify(b7)}, and the derived list's receipt counts ${JSON.stringify(said7b)}`);
  // 7c and 7d: no collocations
  for (const lk of ["c", "d"]) L7[lk].forEach((e, i) => { const x = rowOf(lk, i); if (x.row && has(x.row, "collocations")) faults.push(`7${lk} line ${i + 1} (${e.k ?? e.key} rank ${e.rank}) carries collocations`); else if (!x.row && x.fault) faults.push(`7${lk} line ${i + 1}: ${x.fault}`); });
  // 7e: a line whose row is of the category names a place in its picked_at
  const e7 = { at_a_place_named: 0, name_row: 0, also_plain: 0 };
  L7.e.forEach((e, i) => {
    const x = rowOf("e", i);
    if (!x.row) { faults.push(`7e line ${i + 1}: ${x.fault || x.gone}`); return; }
    if (!has(x.row, "collocations")) { e7[has(x.row, "name") ? "name_row" : "also_plain"] += 1; return; }
    const at = factsOf(x.row).picked_at || [];
    if (at.includes(`${e.book} ${e.p}`)) e7.at_a_place_named += 1;
    else faults.push(`7e line ${i + 1} (${e.book} ${e.p}, ${e.k} rank ${e.rank}): the row is of the category and its picked_at does not name the place`);
  });
  check("A12 call 7: 7a lands no fact; 7b's rows are UBS's category, its others a name row or also a plain meaning as the derived list's receipt counts them; 7c and 7d carry no collocations; each 7e line whose row is of the category has its place in that row's picked_at, the others named by class",
    faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `7a ${nf(a7)} rows, none with a fact of UBS's · 7b ${nf(L7.b.length)}: ${nf(b7.category)} in the category, ${b7.name_row} name rows, ${b7.also_plain} also plain · 7c ${nf(L7.c.length)} and 7d ${L7.d.length} carry none · 7e ${nf(L7.e.length)}: ${nf(e7.at_a_place_named)} at a place their row names, ${e7.name_row} name rows, ${e7.also_plain} also plain`);
}

console.log(bad ? `\n${bad} FAILED` : UBS_SAID ? "\nall checks passed" : "\nSKIPPED — the rest holds; A12 is not judged until the store steps lay UBS's collocations, and a law not judged is not passed");
process.exit(bad ? 1 : UBS_SAID ? 0 : 3);
