#!/usr/bin/env node
// RUN: tree
// GUARDS: audit-calls-rule-v1-a-call-lands-as-its-list-names-each-row-and-the-record-says-where-each-row-went
// GUARDS: row-strike-rule-v6-a-named-list-strikes-withholds-re-keys-rejoins-re-heads-retexts-restores-or-lands-a-row-the-hole-is-typed-and-a-landed-cut-is-counted
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
//       under its source, with the words the list gives it now or the words
//       the list says it prints once its words are back; and no round of
//       the record struck or withheld one
//
// Calls 7, 4 and 3 are rules of the page (a phrase's meaning a press away,
// STEP's words as the line, a run's words at rest one by one). They land in a
// later ship with their own tools, and their laws join this check then; it
// says so, and judges nothing of them.
//
// Run: node tools/check-audit-calls-v1.mjs [--store data/route-store] [--record data/row-strikes-v1.json]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { follower, sha16Of, FollowFault } from "./row-strikes-follow-v1.mjs";

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
const wanted = new Set([...L5.flatMap((e) => (e.action === "re-key" ? [e.key, e.to_key] : [e.key])), ...L6.map((e) => e.key), ...L2.map((e) => e.key), ...OPENINGS.map((e) => e.key)]);
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
  const faults = []; let back = 0;
  for (const [i, e] of OPENINGS.entries()) {
    const texts = [e.route, e.v187_prints].filter((t) => typeof t === "string");
    const rows = (rowsAt.get(e.key) || []).filter((r) => r[0] === e.rank && String(r[3]) === e.m && texts.includes(r[1])), where = `line ${i + 1} (${e.m} ${e.key} rank ${e.rank})`;
    if (rows.length !== 1) faults.push(`${where} stands ${rows.length} times`);
    else if (rows[0][1] !== e.route) back += 1;
    const took = rounds.flatMap((r) => (r.rows || []).filter((y) => ["strike", "withhold"].includes(y.action) && y.m === e.m && y.key === e.key && y.rank === e.rank && texts.includes(y.route)).map(() => (r.list ? r.list.file : "a round with no list")))[0];
    if (took) faults.push(`${where} was struck or withheld by ${took}`);
  }
  check("A9  the openings of the unabridged BDB that call 2 names stand, each once at its key and rank under its source, with the words the list gives it or the words it says it prints once they are back; no round of the record struck or withheld one",
    OPENINGS.length > 0 && faults.length === 0, faults.length ? `${faults.length} · ${first(faults)}` : `${OPENINGS.length} openings · ${OPENINGS.length - back} with the words the list read, ${back} with their words back`);
}

console.log("  --  calls 7, 4 and 3 are rules of the page and land in a later ship with their own tools; their laws join this check then, and nothing of them is judged here");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
