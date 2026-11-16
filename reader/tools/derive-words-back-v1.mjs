#!/usr/bin/env node
// GUARDS: words-back-landing-rule-v1-the-lanes-words-back-land-by-key-and-rank-held-where-the-printed-text-sets-a-hebrew-character-against-a-latin-letter-or-a-digit
// LEDGER: M R D
// it writes the list of rows of the unabridged BDB (M) whose route text (R)
// and definition text (D) take the words our build took out of them back,
// and the list of the corpus lane's lines that are held, with why. It writes
// no row of the store: tools/strike-rows-v1.mjs lands the first list.
//
// THE WORDS OUR BUILD TOOK OUT OF BDB'S OPENINGS GO BACK, BY KEY AND RANK.
//
// The catalog's step that made the unabridged BDB's openings of a numbered
// sense took every Hebrew piece out of them and left a space, so a note
// printed «often named with , and then». The owner answered call 11 of 13
// November 2026 with the lane's recommendation: give the words back. The
// corpus lane's relay v187 (14 November) lists, for every row of relay
// v174's openings whose own opening lost words, the opening with BDB's words
// in their places (words_back), the places that close at print (closes),
// the note as it prints (prints), the closes the row holds today
// (route_closes) and a status (data/made-spaces/words-back-v1/, kept byte for
// byte; data/made-spaces/PIN.json names it under words_back). The owner's
// note of 14 November takes questions 17 and 18 as recommended: the rows
// whose Hebrew order the witness settled land with the done rows, and the
// rows held for an unsettled order or a damaged provider file stay notes
// with gaps.
//
// ONE HOLD, OVER THE PRINTED TEXT (words-back-landing-rule-v1, the design of
// ships 5 and 6, section 6; «an example names a class»). The plan named five
// rows where BDB's Hebrew prints run into a Latin letter («...57»,
// «...C518»); the class they stand for is a Hebrew character (U+0590 to
// U+05FF) set directly against a Latin letter or a digit in the printed
// text. The rule runs over the whole list. Such a seam is made two ways,
// both the lane's own (its RULE.md): inside words_back, where a piece's own
// tags read as nothing; and by a close, where a tag stands between a piece
// and its neighbor with no whitespace. Either way the row is held whole and
// put back to the lane: landing it with the seam-making close held would
// print a space our build made, which the made spaces close at print.
//
// EVERY LINE IS PROVED AGAIN ON THE STORE IT MEETS. The list was read at the
// store its receipt names (4d1357b26ca5). Each line names its row by key and
// rank, as relay v174 does; the row is followed through the row-strikes
// record from that store (tools/row-strikes-follow-v1.mjs) and must stand as
// read: the source's one row at that key and rank, its route text the
// line's, its definition text the same text, its closes (slot 9) the line's
// route_closes on both halves (none where the line names none), and its
// facts naming the line's one entry as the sense it opens. A line's closes
// must be spaces of words_back, rising, and its prints words_back with them
// taken out. A row that lands must not fold: no row of the same source holds
// its new words under its key. The lane's rows that lost nothing
// (in-921-lost-none) are proved to stand as read too.
//
// WHAT IT WRITES, beside the pin (data/made-spaces/<derived.folder>/):
//   retext-v1.jsonl  one line per row that lands, in the list's order: the
//                    retext tools/strike-rows-v1.mjs reads (action retext,
//                    from_slot words_back): m, key, rank, route (as served),
//                    to_text (words_back), closes, route_closes, prints, the
//                    sense it opens (opens), its status and its line
//   held-v1.jsonl    one line per line held: its row, its status, and why
//                    (a seam, with how it is made, or the lane's own hold)
//
// REFUSED, in words and with nothing written: a pinned file that is not its
// bytes; a line that is not well formed; a row that does not stand as read,
// or that a round moved, struck or retexted since (once the retext has
// landed, this refuses: it derives the list on the store before it); a
// retext that would fold; and lists as derived that are not the bytes the
// pin names (derived). --dry prints what would be written, with the sha256,
// and writes nothing; that is how the pin was first written.
//
// Run twice on the same store it writes the same bytes: it holds no clock.
// The summary ends in one line of its figures as JSON (`figures {...}`).
//
// Usage: node tools/derive-words-back-v1.mjs [--store data/route-store] [--dry]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, factsOf, closed, CLOSES_SLOT } from "./gloss-store-v1.mjs";
import { readPinned, readPinnedLines, heldToPin, sha256Of, PinFault } from "./pinned-v1.mjs";
import { openFollower, sha16Of, FollowFault } from "./row-strikes-follow-v1.mjs";

export const WORDS_BACK_LANDING_RULE_ID = "words-back-landing-rule-v1-the-lanes-words-back-land-by-key-and-rank-held-where-the-printed-text-sets-a-hebrew-character-against-a-latin-letter-or-a-digit";
// the source the list's rows are of, by its key in the store's index
const BDB_SOURCE_KEY = "unabridged_bdb_1906";
const STATUS = { done: "lands", done_hebrew_order_settled_by_the_witness: "lands", held_hebrew_order_unsettled: "held", held_damaged_in_the_provider_file: "held" };
const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const HOME = join(K3, "data", "made-spaces");
const refuse = (why) => { console.log(`REFUSED — ${why}`); process.exit(1); };
const n0 = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const pinned = (fn) => { try { return fn(); } catch (e) { if (e instanceof PinFault || e instanceof FollowFault) refuse(e.message); throw e; } };

// THE SEAM: a Hebrew character directly beside a Latin letter or a digit (the rule's whole test)
const HEB = /[\u0590-\u05FF]/u, LAT = /[A-Za-z0-9]/u, LETTER = /[A-Za-z]/u;
export const seamsOf = (t) => {
  const out = [];
  const s = String(t ?? "");
  for (let i = 1; i < s.length; i += 1) {
    const a = s[i - 1], b = s[i];
    if ((HEB.test(a) && LAT.test(b)) || (LAT.test(a) && HEB.test(b))) out.push({ at: i, kind: LETTER.test(HEB.test(a) ? b : a) ? "letter" : "digit" });
  }
  return out;
};

// ---- the pin, the lane's list -----------------------------------------------------------------
const pinPath = join(HOME, "PIN.json");
if (!existsSync(pinPath)) refuse(`the pin of the made spaces is missing (${pinPath})`);
const wb = (JSON.parse(readFileSync(pinPath, "utf8")) || {}).words_back;
if (!wb || !wb.folder || !wb.rule || !wb.list || !wb.in_921_lost_none || !Array.isArray(wb.receipts) || !wb.read_at_store_version) refuse(`${pinPath} names no words back (its words_back: the lane's folder, rule, list, rows that lost nothing, receipts, and the store they were read at)`);
const derived = wb.derived || {};
const at = (p) => join(HOME, wb.folder, p.file);
const lines = pinned(() => {
  readPinned(at(wb.rule), wb.rule, `${wb.folder}/${wb.rule.file}`);
  for (const r of wb.receipts) readPinned(at(r), r, `${wb.folder}/${r.file}`);
  return readPinnedLines(at(wb.list), wb.list, `${wb.folder}/${wb.list.file}`);
});
const lostNone = pinned(() => readPinnedLines(at(wb.in_921_lost_none), wb.in_921_lost_none, `${wb.folder}/${wb.in_921_lost_none.file}`));

// ---- the store, and the record since the list was read ----------------------------------------
const store = openRouteStore(STORE);
const index = store.index;
const ids = Object.entries(index.m_sources || {}).filter(([, s]) => s && s.key === BDB_SOURCE_KEY).map(([m]) => m);
if (ids.length !== 1) refuse(`the store names ${ids.length} sources under ${BDB_SOURCE_KEY}, not one`);
const M = ids[0];
const follow = pinned(() => openFollower({ data: dirname(STORE), index, readAt: wb.read_at_store_version }));
// the row a line names, as the store holds it now: followed from the store the list was read at, and standing as read
const rowOf = (where, key, rank, route) => {
  const went = pinned(() => follow.nowOf([key, rank, M, sha16Of(route)]));
  if (went.state !== "served") refuse(`${where}: the row-strikes record says its row was ${went.state} since ${wb.read_at_store_version}${went.state === "retexted" ? " (the retext has landed: this list is derived on the store before it)" : ""}`);
  const rows = (store.routesWhole(key) || []).filter((r) => String(r[3]) === M && r[0] === rank);
  if (rows.length !== 1) refuse(`${where}: ${rows.length} rows of ${M} stand at its key and rank`);
  if (rows[0][1] !== route) refuse(`${where}: the row at its key and rank serves another route text than the line's`);
  return rows[0];
};

// ---- every line, proved again --------------------------------------------------------------
const retext = [], held = [];
const C = { lines: lines.length, by_status: {}, lands: { done: 0, done_hebrew_order_settled_by_the_witness: 0 }, held: { seam: 0, seam_in_words_back: 0, seam_made_by_a_close: 0, held_hebrew_order_unsettled: 0, held_damaged_in_the_provider_file: 0 },
  closes: { rows_with_closes: 0, closes: 0, by_status: {} }, rows_holding_closes_today: 0 };
const seen = new Set();
lines.forEach((l, i) => {
  const where = `${wb.list.file} line ${i + 1} (${M} rank ${l.rank})`;
  if (typeof l.key !== "string" || !l.key || !Number.isInteger(l.rank) || typeof l.route !== "string" || !l.route) refuse(`${where} names no key, rank or route`);
  if (!Object.hasOwn(STATUS, l.status)) refuse(`${where} has the status ${JSON.stringify(l.status)}, which this tool does not know`);
  if (!Array.isArray(l.entries) || l.entries.length !== 1 || typeof l.entries[0] !== "string") refuse(`${where} names no one entry and point`);
  if (typeof l.words_back !== "string" || !l.words_back || typeof l.prints !== "string" || !Array.isArray(l.closes)) refuse(`${where} names no words back, prints or closes`);
  const rc = l.route_closes === undefined ? [] : l.route_closes;
  if (!Array.isArray(rc) || rc.some((c) => !Number.isInteger(c) || c < 0 || c >= l.route.length || l.route[c] !== " ")) refuse(`${where}: its route_closes are not spaces of its route`);
  l.closes.forEach((c, j) => {
    if (!Number.isInteger(c) || c < 0 || c >= l.words_back.length || l.words_back[c] !== " ") refuse(`${where}: the close at ${c} is not a space of its words back`);
    if (j && c <= l.closes[j - 1]) refuse(`${where}: its closes are not in rising order`);
  });
  if (closed(l.words_back, l.closes) !== l.prints) refuse(`${where}: its prints is not its words back with the closes taken out`);
  const id = `${l.key}\u0001${l.rank}`;
  if (seen.has(id)) refuse(`${where}: an earlier line names the same key and rank`);
  seen.add(id);
  // the row as read
  const row = rowOf(where, l.key, l.rank, l.route);
  if (row[2] !== l.route) refuse(`${where}: the row's definition text is not its route text`);
  if (!same(row.length > CLOSES_SLOT ? row[CLOSES_SLOT] : null, rc.length ? [rc, rc] : null)) refuse(`${where}: the row's closes (slot 9) are not the line's route_closes on both halves`);
  if (rc.length) C.rows_holding_closes_today += 1;
  if ((factsOf(row) || {}).opens !== l.entries[0]) refuse(`${where}: the row does not carry the line's entry as the sense it opens`);
  C.by_status[l.status] = (C.by_status[l.status] || 0) + 1;
  const from = { relay: wb.relay, list: wb.list.file, line: i + 1 };
  if (STATUS[l.status] === "held") {
    C.held[l.status] += 1;
    held.push({ m: M, key: l.key, rank: l.rank, route: l.route, status: l.status, held_because: l.status, from });
    return;
  }
  const seams = seamsOf(l.prints);
  if (seams.length) {
    const inside = seamsOf(l.words_back).length > 0;
    C.held.seam += 1; C.held[inside ? "seam_in_words_back" : "seam_made_by_a_close"] += 1;
    held.push({ m: M, key: l.key, rank: l.rank, route: l.route, status: l.status, held_because: "seam",
      seam: { made: inside ? "in words_back, where a piece's own tags read as nothing" : "by a close, where a tag stood between a piece and its neighbor", kinds: [...new Set(seams.map((s) => s.kind))], at: seams.map((s) => s.at) }, from });
    return;
  }
  // a retext from words back does not fold: no row of the same source holds the new words under this key
  if ((store.routesWhole(l.key) || []).some((r) => r !== row && String(r[3]) === M && r[1] === l.words_back)) refuse(`${where}: a row of ${M} under its key already holds its words back; a retext from words back does not fold`);
  C.lands[l.status] += 1;
  if (l.closes.length) {
    C.closes.rows_with_closes += 1; C.closes.closes += l.closes.length;
    const b = (C.closes.by_status[l.status] ||= { rows: 0, closes: 0 });
    b.rows += 1; b.closes += l.closes.length;
  }
  retext.push({ action: "retext", m: M, key: l.key, rank: l.rank, route: l.route, to_text: l.words_back, from_slot: "words_back", closes: l.closes, route_closes: rc, prints: l.prints,
    opens: l.entries[0], status: l.status, from });
});
// the lane's rows that lost nothing stand as read too
lostNone.forEach((l, i) => {
  const where = `${wb.in_921_lost_none.file} line ${i + 1} (${M} rank ${l.rank})`;
  if (typeof l.key !== "string" || !Number.isInteger(l.rank) || typeof l.route !== "string") refuse(`${where} names no key, rank or route`);
  if (seen.has(`${l.key}\u0001${l.rank}`)) refuse(`${where}: the list of rows that lost words names the same key and rank`);
  rowOf(where, l.key, l.rank, l.route);
});

// ---- what is written, held to the pin -------------------------------------------------------
const bytesOf = (list) => Buffer.from(list.map((x) => JSON.stringify(x)).join("\n") + "\n", "utf8");
const out = [[derived.retext, bytesOf(retext), retext.length, "retext"], [derived.held, bytesOf(held), held.length, "held"]];
const ok = out.map(([p, b, count]) => heldToPin(b, count, p));
const figures = { rule_id: WORDS_BACK_LANDING_RULE_ID, store_version: index.store_version || null, read_at_store_version: wb.read_at_store_version, rounds_since: follow.rounds.length,
  lines: C.lines, by_status: C.by_status, retexted: retext.length, lands: C.lands, held: held.length, held_by_why: C.held,
  rows_with_closes: C.closes.rows_with_closes, closes: C.closes.closes, closes_by_status: C.closes.by_status,
  rows_holding_closes_today: C.rows_holding_closes_today, lost_none_standing: lostNone.length,
  files: out.map(([p, b, count, what]) => ({ what, file: p ? `${derived.folder}/${p.file}` : null, bytes: b.length, sha256: sha256Of(b), lines: count })), the_pin_names_these_bytes: ok.every(Boolean) };
console.log(`words back · relay ${wb.relay} · ${n0(C.lines)} lines read at ${wb.read_at_store_version}, followed through ${follow.rounds.length} round(s) to store ${index.store_version}, every row standing as read · ${n0(retext.length)} land (${C.lands.done} done, ${C.lands.done_hebrew_order_settled_by_the_witness} settled by the witness) · ${n0(held.length)} held: ${C.held.seam} where the printed text sets a Hebrew character against a Latin letter or a digit (${C.held.seam_in_words_back} in words back, ${C.held.seam_made_by_a_close} by a close), ${C.held.held_hebrew_order_unsettled} unsettled, ${C.held.held_damaged_in_the_provider_file} damaged · ${C.closes.rows_with_closes} landing rows carry ${C.closes.closes} closes · ${lostNone.length} rows that lost nothing stand as read`);
for (const [p, b, count, what] of out) console.log(`  ${what} ${p ? `${derived.folder}/${p.file}` : "(the pin names none)"} · ${count} lines · ${b.length} bytes · sha256 ${sha256Of(b)}`);
console.log(`figures ${JSON.stringify(figures)}`);
if (DRY) { console.log(`dry run — nothing written · the pin ${figures.the_pin_names_these_bytes ? "names these bytes" : "names other bytes, or none"}`); process.exit(0); }
if (!derived.folder) refuse("the pin names no folder for the derived lists (words_back.derived.folder)");
out.forEach(([p, b, count, what], i) => { if (!ok[i]) refuse(`the ${what} list as derived (${count} lines, ${b.length} bytes, ${sha256Of(b)}) is not the bytes the pin names (${p ? `${p.lines} lines, ${p.bytes} bytes, ${p.sha256}` : "nothing"})`); });
mkdirSync(join(HOME, derived.folder), { recursive: true });
for (const [p, b] of out) writeFileSync(join(HOME, derived.folder, p.file), b);
console.log(`written · data/made-spaces/${derived.folder}/${derived.retext.file} and ${derived.held.file}, the bytes the pin names`);
