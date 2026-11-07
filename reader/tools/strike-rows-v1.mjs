#!/usr/bin/env node
// GUARDS: row-strike-rule-v5-a-named-list-strikes-withholds-re-keys-rejoins-re-heads-retexts-restores-or-lands-a-row-and-the-hole-is-typed
// LEDGER: M R
// Acts on named store ROWS, not whole sources: rows a provider's parse filed
// under a key that is not their word's, rows the owner has ruled off the
// cards, and rows a cut left in pieces. Each is named by the corpus lane in a
// list the page lane reviewed, row by row (m, key, rank, route, an action).
//
// The first use (6 November 2026, under version 1): the corpus lane's
// one-letter forms, v103.2 (moses-one-letter-forms-v1, strike-list-v1.jsonl).
// Wikisource's Strong's concordance (M14) filed 17 records under a bare
// letter whose word they are not: "to write", "not", "to inquire" under the
// vav, "to strike" under the he, and more. Their renderings sat on the card
// of every prefix or suffix of that letter (173 rows). One record, Manasseh,
// is the name's own and was moved to its word. A row a branch holds back
// while its resting option stands (B01, "what" on the letter mem) is struck
// the same way and named with the branch, so a ruling the other way puts it
// back from this record. The owner ruled B01 on 6 November: kept withheld.
//
// VERSION 2 (6 November 2026, the corpus lane's store lists v146). Version 1
// knew two actions. The lists name five, and one way a re-key can land:
//   strike    the row goes; it renders nothing, or nothing of its key
//   withhold  the row goes from the cards under an owner's ruling (a reading
//             in another language printed as English); kept whole here, as a
//             strike is, so a ruling the other way puts it back
//   re-key    the row moves to its word's key and takes the source's own
//             headword there (to_headwords): version 1 moved Manasseh with
//             the letter's headword, so the pointing grade read it against
//             the letter. Where the new key already holds the same text, the
//             row FOLDS: the store keeps one row per key and text (rule 1 of
//             tools/build-route-store.mjs), so the moved row is taken and the
//             rows it folds into are named. Where the list says whether the
//             key holds the text, the store must agree, or this refuses
//   headword  the row stays and its headwords are mended to the source's own
//             (Manasseh, whose headword version 1 left as the letter)
//   rejoin    rows a cut left in pieces become one row, the source's whole
//             run, at the first named row's rank; the others go. A run the
//             key already holds folds the pieces into it
// VERSION 3 (6 November 2026, the owner: "why not just fix it"). One more:
//   retext    the row's route text becomes a text the row itself already
//             carries (from_slot "definition": its definition slot), because
//             what the route held beyond it was never the provider's: the
//             filing tag this corpus's own script wrote on ConceptNet's rows,
//             "he (n, wikt, en 2)", whose definition slot holds "he". The
//             store keeps the old route whole in this record. Where the same
//             source already holds the new text under the key, the row FOLDS
//             into it, as a re-key does; a landed retext keeps its rank and
//             takes no row off. Its slots (row[7], row[8]) are cleared, for
//             apply-ledger-divisions to derive again from the new text.
// VERSION 4 (6 November 2026, the code review of that day). A FOLD IS THE
// SAME SOURCE'S. The store holds one text under several sources for 17,575
// key-and-text pairs (36,189 rows), and a card credits each: a row of one
// source is no row of another. Version 2 folded a re-keyed row into ANY
// source's row holding its text under the new key, and a rejoin the same,
// so 73 re-keyed rows (M36's "heritage" under ירשה, M4's, M46's) lost their
// source's credit on the card, its switch cost and its "sole". From this
// version a re-key or a rejoin folds only into a row of the same source, as
// a retext always did; and one more action puts the 73 back:
//   restore   a row this record holds whole (a fold of an earlier round)
//             lands again under the key it was re-keyed to, as a row of its
//             own at the key's next rank, unless the same source holds its
//             text there by now (then it is counted as already held, and
//             nothing lands). The list names the row whole and the round it
//             was folded in; the record types where it came from.
//   land      a row the store never held (version 5, 7 November 2026): a
//             rendering the store's cut lost before a verse reference's
//             colon (the corpus lane's landing list, relay v147), a withheld
//             run decoded, a name moved to its own key. The list names the
//             key, the rank it lands at (its record's rank, so the record's
//             own renderings stand before the pieces the store cut from it;
//             the next rank where the key is new), the text, the record's
//             definition and headwords, and the source's year as its rows
//             carry it. It lands unless the same source holds the text under
//             that key already (then counted as already held). A landing
//             types no rank: it fills no hole and makes none.
// The arithmetic: routes_struck counts every row a round takes off the store
// (a strike, a withholding, a re-key that folds, and the rows a rejoin joins
// beyond the one it keeps), routes_rekeyed the re-keys that land as a row of
// their own, routes_restored the rows a restore lands, routes_landed the rows a landing adds, by_action each. Every row taken, and every re-keyed row's old
// rank, is typed in the store's struck-ranks record; ranks are never
// renumbered, and a re-keyed row takes the next rank of its new key.
//
// It refuses before it writes: every list row must name exactly one row the
// served store holds under that (m, key, rank, route), no row twice; a re-key
// names a key that is not the one it leaves; a re-heading names the
// headwords the row has now; a rejoin's rows share their m and definition.
//
// Usage: node tools/strike-rows-v1.mjs --list <list.jsonl> --reason "<why>"
//          [--branches <branches.json> --branch B01] [--store data/route-store]
//          [--leave-off "<m>|<key>|<why>"]... [--dry]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { recordStruckRanks } from "./emit-struck-ranks-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const args = (n) => process.argv.flatMap((a, i) => (a === `--${n}` ? [process.argv[i + 1]] : []));
const STORE = arg("store", join(K3, "data", "route-store"));
const DRY = process.argv.includes("--dry");
const LIST = arg("list", null);
const BRANCHES = arg("branches", null);
const BRANCH = arg("branch", null);
const REASON = arg("reason", "");
export const ROW_STRIKE_RULE_ID = "row-strike-rule-v5-a-named-list-strikes-withholds-re-keys-rejoins-re-heads-retexts-restores-or-lands-a-row-and-the-hole-is-typed";
const RECORD = join(K3, "data", "row-strikes-v1.json");
if (!LIST || !REASON || (BRANCHES && !BRANCH) || (BRANCH && !BRANCHES)) {
  console.log("usage: --list <list.jsonl> --reason \"<the review this stands on>\" [--branches <branches.json> --branch B01] [--store dir] [--leave-off \"<m>|<key>|<why>\"]... [--dry]");
  process.exit(2);
}
const refuse = (msg) => { console.log(`REFUSED — ${msg}`); process.exit(1); };
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const shardOf = (k) => `${sha256(Buffer.from(k, "utf8")).slice(0, 2)}.bin`;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const ACTIONS = ["strike", "withhold", "re-key", "headword", "rejoin", "retext", "restore", "land"];

// ---- what is asked ------------------------------------------------------------
const leaveOff = args("leave-off").map((s) => { const [m, key, ...why] = String(s).split("|"); return { m, key, why: why.join("|") }; });
if (leaveOff.some((l) => !l.m || !l.key || !l.why)) refuse("a --leave-off names its m, its key and why: \"<m>|<key>|<why it stays off>\"");
const listBytes = readFileSync(LIST);
const leftOff = [];
const asked = [];
listBytes.toString("utf8").split("\n").forEach((l, i) => {
  if (!l.trim()) return;
  const e = JSON.parse(l), line = i + 1;
  if (!ACTIONS.includes(e.action)) refuse(`list line ${line}: action "${e.action}" is none of ${ACTIONS.join(", ")}`);
  const lo = leaveOff.find((x) => x.m === e.m && x.key === e.key);
  if (lo) { leftOff.push({ line, m: e.m, key: e.key, action: e.action, why: lo.why }); return; }
  if (e.action === "re-key" && (!e.to_key || e.to_key === e.key)) refuse(`list line ${line}: a re-key names no other key`);
  if (e.action === "headword" && (!Array.isArray(e.headwords_now) || !Array.isArray(e.headwords_to))) refuse(`list line ${line}: a re-heading names the headwords now and the headwords to`);
  if (e.action === "rejoin" && (!Array.isArray(e.rows) || !e.rows.length || typeof e.rejoined_text !== "string" || !e.rejoined_text)) refuse(`list line ${line}: a rejoin names its rows and the text they rejoin to`);
  if (e.action === "retext" && (typeof e.to_text !== "string" || !e.to_text.trim() || !["definition", "source_unicode"].includes(e.from_slot))) refuse(`list line ${line}: a retext names the text the row takes (to_text) and where it comes from (from_slot "definition", the row's own slot; or "source_unicode", the source's own Unicode for a run it wrote in a font encoding, with the runs decoded)`);
  if (e.action === "retext" && e.from_slot === "source_unicode" && (!Array.isArray(e.runs) || !e.runs.length || e.runs.some((r) => !r || typeof r.run !== "string" || typeof r.decoded !== "string" || !r.key_rule))) refuse(`list line ${line}: a retext from the source's Unicode names each run, its decoding and the key rule`);
  if (e.action === "land") {
    if (typeof e.route !== "string" || !e.route.trim()) refuse(`list line ${line}: a landing names the text it lands (route)`);
    if (!Number.isInteger(e.rank) || e.rank < 1) refuse(`list line ${line}: a landing names the rank it lands at`);
    if (typeof e.definition !== "string" || !e.definition.trim()) refuse(`list line ${line}: a landing names the record's definition the row stands on (definition)`);
    if (!Array.isArray(e.headwords) || !e.headwords.length || e.headwords.some((h) => typeof h !== "string" || !h)) refuse(`list line ${line}: a landing names the record's headwords`);
    if (typeof e.year !== "string") refuse(`list line ${line}: a landing names the row's year as the source's rows carry it (year)`);
  }
  if (e.action === "retext" && e.to_text === e.route) refuse(`list line ${line}: a retext names the text the row already has`);
  if (e.action === "restore") {
    const r = e.row;
    if (!Array.isArray(r) || r.length < 7 || String(r[3]) !== String(e.m) || r[1] !== e.route) refuse(`list line ${line}: a restore names the row whole (seven slots, its m and route the list's)`);
    if (!e.restored_from || typeof e.restored_from !== "object" || !e.restored_from.round || !e.restored_from.key) refuse(`list line ${line}: a restore names the round and the key it was folded from (restored_from)`);
  }
  const named = e.action === "rejoin" ? e.rows.map((x) => ({ rank: x.rank, route: x.route })) : e.action === "restore" || e.action === "land" ? [] : [{ rank: e.rank, route: e.route }];
  asked.push({ line, m: e.m, key: e.key, action: e.action, named, to_key: e.action === "re-key" ? e.to_key : null,
    to_headwords: Array.isArray(e.to_headwords) ? e.to_headwords : null,
    to_key_holds_text: typeof e.to_key_holds_text === "boolean" ? e.to_key_holds_text : null,
    to_key_holds: Array.isArray(e.to_key_holds) ? e.to_key_holds : null,
    headwords_now: e.headwords_now ?? null, headwords_to: e.headwords_to ?? null,
    rejoined_text: e.rejoined_text ?? null, to_text: e.action === "retext" ? e.to_text : null, from_slot: e.action === "retext" ? e.from_slot : null,
    runs: e.action === "retext" && Array.isArray(e.runs) ? e.runs : null,
    land: e.action === "land" ? { rank: e.rank, route: e.route, definition: e.definition, headwords: e.headwords, year: e.year, rank_from: e.rank_from ?? null, strongs: e.strongs ?? null, beside: Array.isArray(e.beside) ? e.beside : null, definition_source: e.definition_source ?? null, record_loc: e.record_loc ?? null, record_file: e.record_file ?? null } : null,
    restore_row: e.action === "restore" ? [...e.row.slice(0, 7)] : null, restored_from: e.action === "restore" ? e.restored_from : null, why: "list", list_why: e.why ?? null, kind: e.kind ?? null });
});
for (const lo of leaveOff) if (!leftOff.some((x) => x.m === lo.m && x.key === lo.key)) refuse(`--leave-off ${lo.m}|${lo.key} names no line of the list`);
let branch = null;
if (BRANCHES) {
  const bBytes = readFileSync(BRANCHES);
  const b = JSON.parse(bBytes.toString("utf8")).find((x) => x.id === BRANCH);
  if (!b) refuse(`${BRANCHES} names no branch ${BRANCH}`);
  const resting = (b.options || []).find((o) => o.id === b.resting);
  if (!resting || resting.id !== "withheld") refuse(`branch ${BRANCH} rests on "${b.resting}", not on withholding; nothing to strike for it`);
  branch = { id: b.id, name: b.name, question: b.question, resting: b.resting, means: resting.means, file: basename(BRANCHES), sha256: sha256(bBytes) };
  for (const r of b.rows || []) asked.push({ line: null, m: r.m, key: r.key, action: "strike", named: [{ rank: r.rank, route: r.route }], to_key: null, why: `branch ${b.id} resting (${b.resting})` });
}

// ---- the store, and every named row found in it, once ---------------------------
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
const shards = new Map(shardNames.map((n) => [n, JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", n))).toString("utf8"))]));
let routesBefore = 0, keysBefore = 0;
for (const body of shards.values()) for (const rows of Object.values(body)) { keysBefore += 1; routesBefore += rows.length; }
const rowsOf = (k) => { const b = shards.get(shardOf(k)); return (b && b[k]) || []; };

const claimed = new Set();
for (const e of asked) {
  // a restore names no row of the store: its row is in this record, and the store must NOT hold it (checked as it lands)
  e.rows = e.named.map((n) => {
    const id = `${e.m}|${e.key}|${n.rank}|${n.route}`;
    const hits = rowsOf(e.key).filter((r) => String(r[3]) === e.m && r[0] === n.rank && r[1] === n.route);
    if (hits.length !== 1) refuse(`${id} names ${hits.length} rows of the served store; a list row names exactly one`);
    if (claimed.has(hits[0])) refuse(`${id} is named twice`);
    claimed.add(hits[0]);
    return hits[0];
  });
  if (e.action === "headword" && !same(e.rows[0][6], e.headwords_now)) refuse(`${e.m}|${e.key}|${e.named[0].rank}: its headwords are ${JSON.stringify(e.rows[0][6])}, not ${JSON.stringify(e.headwords_now)} as the list says`);
  if (e.action === "rejoin" && e.rows.some((r) => r[2] !== e.rows[0][2])) refuse(`the rejoin on ${e.m}|${e.key} names rows of more than one definition`);
  if (e.action === "retext" && e.from_slot === "definition" && String(e.rows[0][2] ?? "") !== e.to_text) refuse(`${e.m}|${e.key}|${e.named[0].rank}: the row's definition slot is «${String(e.rows[0][2] ?? "").slice(0, 60)}», not «${e.to_text}» as the list says; a retext takes only what the row itself carries`);
  // a retext from the source's own Unicode takes only what the row carries
  // too: every run the list decodes stands in the route between dollar signs,
  // and the route with each run replaced by its decoding is the text the list
  // names, byte for byte; nothing else of the route moves
  if (e.action === "retext" && e.from_slot === "source_unicode") {
    let t = e.rows[0][1];
    for (const r of e.runs) { const enc = `$$${r.run}$$`; if (!t.includes(enc)) refuse(`${e.m}|${e.key}|${e.named[0].rank}: the route holds no run «${enc}» to decode`); t = t.split(enc).join(r.decoded); }
    if (t !== e.to_text) refuse(`${e.m}|${e.key}|${e.named[0].rank}: the route with its runs decoded reads «${t}», not «${e.to_text}» as the list says`);
    if (t.includes("$$")) refuse(`${e.m}|${e.key}|${e.named[0].rank}: a run is left undecoded in «${t}»`);
  }
  if (e.action === "re-key" && e.to_key_holds_text !== null) {
    // what the key held before this list touched it, from any source: the list was read against that store (the
    // fold itself, below, is the same source's only)
    const holders = rowsOf(e.to_key).filter((r) => r[1] === e.named[0].route).map((r) => `${r[3]}@${r[0]}`);
    if ((holders.length > 0) !== e.to_key_holds_text) refuse(`${e.m}|${e.key}|${e.named[0].rank} -> ${e.to_key}: the list says the key ${e.to_key_holds_text ? "holds" : "does not hold"} «${e.named[0].route}», the store says ${holders.length ? holders.join(",") : "it does not"}`);
    if (e.to_key_holds && !same([...holders].sort(), [...e.to_key_holds].sort())) refuse(`${e.m}|${e.key}|${e.named[0].rank} -> ${e.to_key}: the list names ${e.to_key_holds.join(",")} as holding the text, the store ${holders.join(",")}`);
  }
}

// ---- the round, counted before anything is written --------------------------------
const ranks = { keys: {}, rows: 0, keys_touched: 0, on_struck_records: 0, on_other_records: 0 };
const taken = [];               // every row acted on, whole, with what was done with it
const perSource = {}, cutsTaken = {};
const byAction = { strike: 0, withhold: 0, re_key_landed: 0, re_key_folded: 0, rejoin_joins: 0, rejoin_rows_taken: 0, rejoin_folded: 0, headword: 0, retext: 0, retext_folded: 0, restore: 0, restore_already_held: 0, land: 0, land_already_held: 0 };
let routesLanded = 0; const landedNow = new Set();
const keysTouched = new Set(), keysEmptied = [], keysMadeNew = [];
const touchedShards = new Set();
let routesTaken = 0, routesRekeyed = 0, routesRestored = 0;
const typeRank = (key, r) => { (ranks.keys[key] ||= []).push([r[0], String(r[3])]); ranks.rows += 1; ranks.on_struck_records += 1; perSource[r[3]] = (perSource[r[3]] || 0) + 1; };
const takeOff = (key, r) => {
  const body = shards.get(shardOf(key));
  const left = body[key].filter((x) => x !== r);
  if (left.length === body[key].length) refuse(`internal: ${key} rank ${r[0]} was not where it was found`);
  if (left.length) body[key] = left; else { delete body[key]; keysEmptied.push(key); }
  keysTouched.add(key); touchedShards.add(shardOf(key));
};
for (const e of asked) {
  if (e.action === "land") {
    const L = e.land;
    const row = [L.rank, L.route, L.definition, String(e.m), L.year, null, L.headwords];
    const held = rowsOf(e.key).filter((x) => String(x[3]) === String(e.m) && x[1] === L.route);
    if (held.length) {
      byAction.land_already_held += 1;
      taken.push({ action: "land", why: e.why, kind: e.kind ?? null, key: e.key, row, land: L, already_held: held.map((x) => ({ rank: x[0], m: String(x[3]) })) });
      continue;
    }
    const toBody = shards.get(shardOf(e.key));
    const toRows = toBody[e.key] || [];
    if (!toBody[e.key]) keysMadeNew.push(e.key);
    // in rank order (the store's rows stand so under every key): before the
    // first row of a higher rank, and before this source's rows of the same
    // rank that stood before this run, so the record's own renderings stand
    // before the pieces the store cut from it, in the list's order; after
    // every other source's row of that rank
    let at = toRows.findIndex((x) => Number(x[0]) > L.rank || (Number(x[0]) === L.rank && String(x[3]) === String(e.m) && !landedNow.has(x)));
    if (at < 0) at = toRows.length;
    toBody[e.key] = [...toRows.slice(0, at), row, ...toRows.slice(at)];
    landedNow.add(row);
    keysTouched.add(e.key); touchedShards.add(shardOf(e.key));
    routesLanded += 1; byAction.land += 1;
    taken.push({ action: "land", why: e.why, kind: e.kind ?? null, key: e.key, row, land: L, landed_at: at });
    continue;
  }
  if (e.action === "restore") {
    const r = e.restore_row;
    const held = rowsOf(e.key).filter((x) => String(x[3]) === String(r[3]) && x[1] === r[1]);
    if (held.length) {
      byAction.restore_already_held += 1;
      taken.push({ action: "restore", why: e.why, kind: e.kind ?? null, key: e.key, row: r, restored_from: e.restored_from, already_held: held.map((x) => ({ rank: x[0], m: String(x[3]) })) });
      continue;
    }
    const toBody = shards.get(shardOf(e.key));
    const toRows = toBody[e.key] || [];
    if (!toBody[e.key]) keysMadeNew.push(e.key);
    const next = toRows.reduce((a, x) => Math.max(a, Number(x[0]) || 0), 0) + 1;
    const landed = [next, ...r.slice(1, 7)];
    toBody[e.key] = [...toRows, landed];
    keysTouched.add(e.key); touchedShards.add(shardOf(e.key));
    routesRestored += 1; byAction.restore += 1;
    taken.push({ action: "restore", why: e.why, kind: e.kind ?? null, key: e.key, row: r, to_rank: next, restored_from: e.restored_from, ...(e.to_headwords ? { to_headwords: e.to_headwords } : {}) });
    continue;
  }
  if (e.action === "strike" || e.action === "withhold") {
    const r = e.rows[0];
    takeOff(e.key, r); typeRank(e.key, r); routesTaken += 1; byAction[e.action] += 1;
    if (r.length > 5 && r[5] === 1) cutsTaken[r[3]] = (cutsTaken[r[3]] || 0) + 1;
    taken.push({ action: e.action, why: e.why, kind: e.kind ?? null, key: e.key, row: r });
    continue;
  }
  if (e.action === "headword") {
    const r = e.rows[0], was = r[6];
    r[6] = e.headwords_to;
    keysTouched.add(e.key); touchedShards.add(shardOf(e.key)); byAction.headword += 1;
    taken.push({ action: "headword", why: e.why, kind: e.kind ?? null, key: e.key, row: [...r.slice(0, 6), was], headwords_to: e.headwords_to });
    continue;
  }
  if (e.action === "retext") {
    const r = e.rows[0];
    // the same source already holds the new text under this key: the row folds into it, as a re-key does
    const holders = rowsOf(e.key).filter((x) => x !== r && String(x[3]) === String(r[3]) && x[1] === e.to_text);
    if (holders.length) {
      takeOff(e.key, r); typeRank(e.key, r); routesTaken += 1; byAction.retext_folded += 1;
      if (r.length > 5 && r[5] === 1) cutsTaken[r[3]] = (cutsTaken[r[3]] || 0) + 1;
      taken.push({ action: "retext", why: e.why, kind: e.kind ?? null, key: e.key, row: r, to_text: e.to_text, from_slot: e.from_slot, ...(e.runs ? { runs: e.runs } : {}), folded_into: holders.map((x) => ({ rank: x[0], m: String(x[3]) })) });
      continue;
    }
    const was = [...r];
    r[1] = e.to_text; r.length = Math.min(r.length, 7);
    keysTouched.add(e.key); touchedShards.add(shardOf(e.key)); byAction.retext += 1;
    taken.push({ action: "retext", why: e.why, kind: e.kind ?? null, key: e.key, row: was, to_text: e.to_text, from_slot: e.from_slot, ...(e.runs ? { runs: e.runs } : {}) });
    continue;
  }
  if (e.action === "re-key") {
    const r = e.rows[0];
    takeOff(e.key, r); typeRank(e.key, r);
    const toBody = shards.get(shardOf(e.to_key));
    const toRows = toBody[e.to_key] || [];
    const holders = toRows.filter((x) => x[1] === r[1] && String(x[3]) === String(r[3]));
    if (holders.length) {
      // the same source holds this text under the key already: the row folds into its own source's row (version 4; a row of another source is no row of this one)
      routesTaken += 1; byAction.re_key_folded += 1;
      if (r.length > 5 && r[5] === 1) cutsTaken[r[3]] = (cutsTaken[r[3]] || 0) + 1;
      taken.push({ action: "re-key", why: e.why, kind: e.kind ?? null, key: e.key, row: r, to_key: e.to_key, folded_into: holders.map((x) => ({ rank: x[0], m: String(x[3]) })) });
      continue;
    }
    if (!toBody[e.to_key]) keysMadeNew.push(e.to_key);
    const next = toRows.reduce((a, x) => Math.max(a, Number(x[0]) || 0), 0) + 1;
    const moved = [next, ...r.slice(1)];
    if (e.to_headwords) moved[6] = e.to_headwords;
    toBody[e.to_key] = [...toRows, moved];
    keysTouched.add(e.to_key); touchedShards.add(shardOf(e.to_key));
    routesRekeyed += 1; byAction.re_key_landed += 1;
    taken.push({ action: "re-key", why: e.why, kind: e.kind ?? null, key: e.key, row: r, to_key: e.to_key, to_rank: next, ...(e.to_headwords ? { to_headwords: e.to_headwords } : {}) });
    continue;
  }
  // rejoin: the first named row keeps its rank and takes the whole run; the rest go
  const order = e.rows.map((r, i) => ({ r, i })).sort((a, b) => (a.r[0] - b.r[0]) || (a.i - b.i)).map((x) => x.r);
  const holders = rowsOf(e.key).filter((x) => x[1] === e.rejoined_text && !e.rows.includes(x) && String(x[3]) === String(e.rows[0][3]));
  const keep = holders.length ? null : order[0];
  for (const r of order) {
    if (r === keep) continue;
    takeOff(e.key, r); typeRank(e.key, r); routesTaken += 1; byAction.rejoin_rows_taken += 1;
    if (r.length > 5 && r[5] === 1) cutsTaken[r[3]] = (cutsTaken[r[3]] || 0) + 1;
  }
  if (keep) {
    const body = shards.get(shardOf(e.key));
    body[e.key] = body[e.key].map((x) => (x === keep ? [keep[0], e.rejoined_text, ...keep.slice(2)] : x));
    keysTouched.add(e.key); touchedShards.add(shardOf(e.key));
    byAction.rejoin_joins += 1;
  } else byAction.rejoin_folded += 1;
  taken.push({ action: "rejoin", why: e.why, kind: e.kind ?? null, key: e.key, rows: e.rows, rejoined_text: e.rejoined_text,
    ...(keep ? { kept_rank: keep[0] } : { folded_into: holders.map((x) => ({ rank: x[0], m: String(x[3]) })) }) });
}
ranks.keys_touched = Object.keys(ranks.keys).length;
const keysAfter = keysBefore - keysEmptied.length + keysMadeNew.length;
const routesAfter = routesBefore - routesTaken + routesRestored + routesLanded;     // a re-key that lands moves a row; it neither takes nor adds one; a restore adds one back; a landing adds one the store never held
let routesNow = 0; for (const body of shards.values()) for (const rows of Object.values(body)) routesNow += rows.length;
if (routesNow !== routesAfter) refuse(`internal: the shards hold ${routesNow} routes, the arithmetic says ${routesAfter}`);
console.log(`row strike v5 · ${routesTaken} taken, ${routesRekeyed} re-keyed and landed, ${routesRestored} restored, ${routesLanded} landed, of ${routesBefore.toLocaleString()} routes · ${JSON.stringify(byAction)} · ${keysTouched.size} keys touched · ${keysEmptied.length} emptied · ${keysMadeNew.length} new · per source ${JSON.stringify(perSource)}${leftOff.length ? ` · ${leftOff.length} line(s) left off` : ""}${branch ? ` · branch ${branch.id} resting ${branch.resting}` : ""}`);
for (const t of taken.filter((x) => x.action === "re-key")) console.log(`  re-key ${t.key} rank ${t.row[0]} "${t.row[1]}" -> ${t.to_key} ${t.folded_into ? `folds into ${t.folded_into.map((f) => `${f.m}@${f.rank}`).join(",")}` : `rank ${t.to_rank}${t.to_headwords ? ` headwords ${JSON.stringify(t.to_headwords)}` : ""}`}`);
for (const t of taken.filter((x) => x.action === "rejoin")) console.log(`  rejoin ${t.key} ${t.rows.map((r) => `${r[3]}@${r[0]}`).join("+")} -> «${t.rejoined_text}»${t.folded_into ? ` folds into ${t.folded_into.map((f) => `${f.m}@${f.rank}`).join(",")}` : ` at rank ${t.kept_rank}`}`);
for (const t of taken.filter((x) => x.action === "headword")) console.log(`  headword ${t.key} rank ${t.row[0]} "${t.row[1]}" ${JSON.stringify(t.row[6])} -> ${JSON.stringify(t.headwords_to)}`);
{ const rt = taken.filter((x) => x.action === "retext"); if (rt.length) console.log(`  retext ${rt.length} rows (${rt.filter((x) => x.folded_into).length} fold), e.g. ${rt.slice(0, 3).map((t) => `${t.key} rank ${t.row[0]} "${t.row[1]}" -> "${t.to_text}"${t.folded_into ? " (folds)" : ""}`).join("; ")}`); }
{ const rs = taken.filter((x) => x.action === "restore"); if (rs.length) console.log(`  restore ${rs.length} rows (${rs.filter((x) => x.already_held).length} already held), e.g. ${rs.slice(0, 3).map((t) => `${t.key} ${t.row[3]} "${t.row[1]}"${t.already_held ? " (held)" : ` rank ${t.to_rank}`}`).join("; ")}`); }
{ const ld = taken.filter((x) => x.action === "land"); if (ld.length) console.log(`  land ${ld.length} rows (${ld.filter((x) => x.already_held).length} already held), e.g. ${ld.slice(0, 3).map((t) => `${t.key} ${t.row[3]} rank ${t.row[0]} "${t.row[1]}"${t.already_held ? " (held)" : ""}`).join("; ")}`); }
for (const l of leftOff) console.log(`  left off: line ${l.line} ${l.m} ${l.key} (${l.action}) — ${l.why}`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }

// ---- the shards, then the version from their bytes ---------------------------------
for (const name of touchedShards) writeFileSync(join(STORE, "shards", name), gzipSync(Buffer.from(JSON.stringify(shards.get(name))), { level: 9 }));
const digest = createHash("sha256"); let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12), on = new Date().toISOString();
const ranAt = on.slice(0, 10);

// the typed hole, in the one struck-ranks record, beside the other strikes'
recordStruckRanks(STORE, ranks, {
  how: "written by the row strike as it struck",
  before_store_version: was, after_store_version: now,
  admission_rule: ROW_STRIKE_RULE_ID, rule_id: ROW_STRIKE_RULE_ID, reason: REASON,
  struck_m_ids: Object.keys(perSource), rows: ranks.rows, keys: ranks.keys_touched, on: ranAt,
});

// the record, cumulative: prior rounds carried, each round its own line
let prior = null; try { prior = JSON.parse(readFileSync(RECORD, "utf8")); } catch { prior = null; }
// a round written before rounds carried their rule ran under the rule the record then named
const rounds = [...((prior && prior.rounds) || []).map((r) => ({ rule_id: (prior && prior.rule_id) || null, ...r })), {
  rule_id: ROW_STRIKE_RULE_ID, ran_at: on, reason: REASON,
  list: { file: basename(LIST), sha256: sha256(listBytes), lines: asked.filter((e) => e.why === "list").length, left_off: leftOff },
  branch,
  counts: { routes_before: routesBefore, routes_struck: routesTaken, routes_rekeyed: routesRekeyed, routes_restored: routesRestored, routes_landed: routesLanded, by_action: byAction, keys_before: keysBefore, keys_touched: keysTouched.size, keys_emptied: keysEmptied.length, keys_made: keysMadeNew.length, per_source: perSource, cuts_taken: cutsTaken },
  store_version: { was, now },
  rows: taken.map((t) => (t.action === "rejoin"
    ? { action: t.action, why: t.why, kind: t.kind, key: t.key, m: String(t.rows[0][3]), rejoined_text: t.rejoined_text, rows: t.rows, ...(t.kept_rank !== undefined ? { kept_rank: t.kept_rank } : { folded_into: t.folded_into }) }
    : { action: t.action, why: t.why, kind: t.kind, key: t.key, rank: t.row[0], m: String(t.row[3]), route: t.row[1], row: t.row,
      ...(t.to_key ? { to_key: t.to_key } : {}), ...(t.to_rank !== undefined ? { to_rank: t.to_rank } : {}), ...(t.folded_into ? { folded_into: t.folded_into } : {}),
      ...(t.to_headwords ? { to_headwords: t.to_headwords } : {}), ...(t.headwords_to ? { headwords_to: t.headwords_to } : {}), ...(t.to_text ? { to_text: t.to_text, from_slot: t.from_slot } : {}),
      ...(t.runs ? { runs: t.runs } : {}), ...(t.land ? { land: t.land, ...(t.landed_at !== undefined ? { landed_at: t.landed_at } : {}) } : {}),
      ...(t.restored_from ? { restored_from: t.restored_from } : {}), ...(t.already_held ? { already_held: t.already_held } : {}) })),
}];
const sumBy = (k) => rounds.reduce((a, r) => { for (const [x, v] of Object.entries((r.counts && r.counts[k]) || {})) a[x] = (a[x] || 0) + v; return a; }, {});
const cumulative = {
  routes_struck: rounds.reduce((a, r) => a + r.counts.routes_struck, 0),
  routes_rekeyed: rounds.reduce((a, r) => a + r.counts.routes_rekeyed, 0),
  routes_restored: rounds.reduce((a, r) => a + (r.counts.routes_restored || 0), 0),
  routes_landed: rounds.reduce((a, r) => a + (r.counts.routes_landed || 0), 0),
  by_action_since_version_2: sumBy("by_action"),
  keys_touched: rounds.reduce((a, r) => a + r.counts.keys_touched, 0),
  rounds: rounds.length,
};
const record = {
  schema_version: "ROW_STRIKES_V2", rule_id: ROW_STRIKE_RULE_ID,
  what: "every store row a named list the page lane reviewed struck, withheld, re-keyed, rejoined, re-headed, retexted, restored or landed: rows a provider's parse filed under a key that is not their word's, rows the owner ruled off the cards, rows a cut left in pieces, every row a branch's resting option withholds until the owner rules, and the rows an earlier round folded into another source's row and a later round put back; each row is kept whole here, so what went can be read and put back; the rank each row taken or re-keyed left is typed in the store's struck-ranks record and never renumbered",
  ran_at: on, rounds, rulings: (prior && prior.rulings) || [], cumulative,
  counts_scope: "cumulative is the whole of this record; rounds[] holds each round's own arithmetic. routes_struck counts every row a round took off the store: a strike, a withholding, a re-key whose text its new key already held from the same source (it folds; before version 4, from any source), and the rows a rejoin joined beyond the one it kept. routes_rekeyed counts the re-keys that landed as a row of their own; a re-heading takes nothing; routes_restored counts the rows a restore landed back (version 4), routes_landed the rows a landing added that the store never held (version 5), so rows before, less routes_struck, plus routes_restored and routes_landed, are the rows served. by_action splits each round from version 2 on",
};
writeFileSync(RECORD, JSON.stringify(record, null, 1));

// the index: the counts moved, the cut table moved with the rows it counted,
// the version renamed with its reason
const counts = { ...(index.counts || {}), keys: keysAfter, routes: routesAfter, shards: shardNames.length, shard_bytes_total: shardBytes };
if (counts.cuts_by_source) {
  counts.cuts_by_source = { ...counts.cuts_by_source };
  for (const [m, c] of Object.entries(cutsTaken)) if (counts.cuts_by_source[m] !== undefined) counts.cuts_by_source[m] -= c;
  if (Number.isFinite(Number(counts.readings_that_are_a_cut_of_a_sibling_record))) counts.readings_that_are_a_cut_of_a_sibling_record = Object.values(counts.cuts_by_source).reduce((a, x) => a + x, 0);
}
index.counts = counts;
index.store_version = now;
index.store_version_history = [...(index.store_version_history || []), { was, now, why: ROW_STRIKE_RULE_ID, on }];
index.row_strikes = { rule_id: ROW_STRIKE_RULE_ID, record: "reader/data/row-strikes-v1.json", cumulative };
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
console.log(`written · store ${was} -> ${now} · ${routesAfter.toLocaleString()} routes served · record ${RECORD}`);
