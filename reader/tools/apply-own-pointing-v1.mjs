#!/usr/bin/env node
// GUARDS: own-pointing-rule-v1-a-row-whose-headwords-carry-no-points-takes-its-own-records-pointed-head-forms
// LEDGER: M
// it writes, on the rows of English Wiktionary's two dictionaries whose own
// headwords carry no points (M), the pointed head forms the row's own record
// gives, after those headwords. No text is changed and no row is judged here.
//
// ENGLISH WIKTIONARY POINTS ITS WORDS, AND ITS ROWS DID NOT SAY SO.
//
// The store's rows of Kaikki's two dictionaries from English Wiktionary (the
// sources whose index key is kaikki_wiktionary_hebrew or
// kaikki_wiktionary_aramaic) carry at [6] the catalog's source_headword: the
// entry's page title, its bare letters (on 16 November 2026, M13 16,339 of
// its 16,340 rows, M60 2,381 of 2,388). Graded by them every such row is
// NORMALIZED, as if its source were silent on pointing. It is not: each
// record names the forms it heads its word with, pointed and tagged
// "canonical" (the page אב heads the father with אָב, the swelling with
// אֵב, the construct with אַב), and the corpus lane's dictionary store
// (data/dictionary-store, relay v84), which serves each record whole, lists
// those forms among the record's own headwords. Until 16 November 2026 a
// row the grade could not place stood under "only this pointing" as if it
// pointed every way; from that day it qualifies for none (unpointed-row-
// rule-v1; the owner, task 134: «if its no pointing why would that in your
// head auto qualify it for all pointings rather than none»), and these rows
// would have been held back wholesale for a silence that is the catalog's,
// not Wiktionary's. Measured on live main (8797fa4d5b) before this was
// written: of 514,078 pairs of such a row and a word place standing
// unpointed, Wiktionary's own forms point 287,528 as the place, 193,547
// otherwise (Genesis 1:22's verb: «Pro-», «his bull»), 33,003 not at all.
//
// THE RULE. A row of one of those sources whose own headwords carry no
// points takes after them the distinct pointed canonical forms of the
// records it belongs to. Its records are those of its own m id that stand
// under its letters (the dictionary store's key: the letters of the row's
// key, LETTERS KEY v1.1), whose own word is those letters (a record listed
// there only for another of its headwords is another word's), and one of
// whose senses gives the row's route text as a gloss, or a raw gloss, byte
// for byte. The forms are written as the record writes them, in its order,
// each once, after every headword the row already carries, which stays as
// it is and where it is. A row whose own headwords already point (the
// catalog gave it a pointed headword) is not this rule's, nor is a row that
// names no headword at all (none does today). A row no record
// gives its text, or whose records give no pointed form, is left as it is,
// and counted with why.
//
// WHAT READS [6], AND SO WHAT THIS MOVES (read 16 November 2026). The grade
// (tools/pointing-grade-v1.mjs gradeRow, the page's copy, and through them
// the projector's leaders, the recount and the checks that model the gate):
// that is the point. The piece class (one-letter headwords; no row of these
// sources is one letter under a one-letter key). The exporter's record as
// received (zone.html: its "headword:" line), which then prints the
// record's pointed forms after its letters, as the dictionary store lists
// the record's headwords. No card, pill or line prints [6]. Two store tools
// read it: tools/strike-rows-v1.mjs, whose "headword" action holds a row to
// the headwords a list names (a list read before this rule ran would name
// these rows bare and be refused, in words), and tools/apply-route-delta-
// v1.mjs, which copies a removed row's headwords to the row that replaces it.
// Two checks hold rows to the headwords a list gave them: the landing's
// (check-fold-strike-landing-v1 F4: 131 rows of M13 and 201 of M60 landed)
// and call 5's re-keys (check-audit-calls-v1 A4: 40 of them); each now asks
// a row's headwords as they stood before this rule laid any
// (headwordsBeforeOwnPointing), and the forms after them are this rule's,
// held by check-own-pointing-v1. A row a landing or a round lands later
// carries its list's headwords bare until this tool runs again.
//
// RUN AGAIN, IT MOVES NOTHING. A row's own headwords are its leading run of
// headwords with no points; the pointed forms after them are this rule's.
// The catalog gives no row of these sources a mixed shape (every row's
// headwords all bare or all pointed: measured 16 November 2026), so the two
// are told apart by the points alone, and a row whose headwords mix them in
// any other order is refused. So a second run computes the same headwords,
// moves no row and, where the store's index already names this run's
// inputs and counts, writes nothing. Over a store laid from another
// dictionary store the forms are laid again from this one, the row's own
// headwords kept. --dry prints and writes nothing. --on gives the moment the
// run is recorded under (tools/step-moment-v1.mjs); with none it is the
// clock's. Its last line of counts is its figures as JSON, for a script that
// holds a run to what was rehearsed.
//
// REFUSED, each in words and with nothing written: a source of the two
// whose dictionary store entry is not the store's (another key or label
// under the same m id); a dictionary store with no shards; a row whose
// headwords mix bare and pointed in an order neither the catalog nor this
// rule makes.
//
// Usage: node tools/apply-own-pointing-v1.mjs [--store data/route-store]
//          [--dictionary-store data/dictionary-store]
//          [--receipt data/own-pointing-receipt-v1.json] [--on <moment>] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { isPointed } from "./pointing-grade-v1.mjs";
import { givenMoment, momentOf } from "./step-moment-v1.mjs";
import { startedAs } from "./main-guard-v1.mjs";

export const OWN_POINTING_RULE_ID = "own-pointing-rule-v1-a-row-whose-headwords-carry-no-points-takes-its-own-records-pointed-head-forms";
/** The sources whose rows this rule reads, by their key in the store's index. */
export const OWN_POINTING_SOURCE_KEYS = Object.freeze(["kaikki_wiktionary_hebrew", "kaikki_wiktionary_aramaic"]);
/** LETTERS KEY v1.1, the dictionary store's: the string's canonical decomposition, then only U+05D0 to U+05EA. */
export const lettersKey = (t) => [...String(t ?? "").normalize("NFD")].filter((c) => c >= "\u05D0" && c <= "\u05EA").join("");
/** A row's headwords, split: its own (the leading run with no points) and the pointed forms after them, or null
 *  where the slot is no list, or where they mix in an order neither the catalog nor this rule makes. */
export const splitHeadwords = (hw) => {
  if (!Array.isArray(hw)) return null;
  const at = hw.findIndex(isPointed);
  if (at < 0) return { own: hw, laid: [] };
  if (!hw.slice(at).every(isPointed)) return null;
  return { own: hw.slice(0, at), laid: hw.slice(at) };
};

/** A row's headwords as they stood before this rule laid any: for a row of the rule's sources whose own headwords
 *  carry no points, those own headwords (the forms after them are this rule's); for every other row, all of them.
 *  For a check that holds a row's headwords to a list read before this rule ran (a landing's, a re-key's). */
export const headwordsBeforeOwnPointing = (row, mSources) => {
  const src = (mSources || {})[String(row[3])];
  if (!src || !OWN_POINTING_SOURCE_KEYS.includes(src.key)) return row[6];
  const split = splitHeadwords(row[6]);
  return split && split.own.length ? split.own : row[6];
};

if (startedAs(import.meta.url)) {
  const HERE = dirname(fileURLToPath(import.meta.url));
  const K3 = join(HERE, "..");
  const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
  const DRY = process.argv.includes("--dry");
  const STORE = arg("store", join(K3, "data", "route-store"));
  const DICT = arg("dictionary-store", join(K3, "data", "dictionary-store"));
  const RECEIPT = arg("receipt", join(K3, "data", "own-pointing-receipt-v1.json"));
  const HOME = "reader/data/dictionary-store";   // where the dictionary store stands in the repository, as the index and the receipt name it
  const sha256 = (b) => createHash("sha256").update(b).digest("hex");
  const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
  const n = (x) => Number(x).toLocaleString("en-US");
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  // the moment the run is recorded under, where one is given (read before anything else, so a moment that is none stops here)
  let GIVEN_ON = null;
  try { GIVEN_ON = givenMoment(); } catch (e) { refuse(e.message); }

  // ---- the store's sources this rule reads, held to the dictionary store's own names -------------
  const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
  const dixBytes = readFileSync(join(DICT, "index.json"));
  const dix = JSON.parse(dixBytes.toString("utf8"));
  const SOURCES = Object.entries(index.m_sources || {}).filter(([, s]) => s && OWN_POINTING_SOURCE_KEYS.includes(s.key)).map(([m]) => m);
  if (!SOURCES.length) refuse(`the store holds no source under ${OWN_POINTING_SOURCE_KEYS.join(" or ")}`);
  for (const m of SOURCES) {
    const theirs = (dix.m_sources || {})[m];
    if (theirs && (theirs.key !== index.m_sources[m].key || theirs.label !== index.m_sources[m].label)) refuse(`${m} is ${index.m_sources[m].key} (${index.m_sources[m].label}) in the store and ${theirs.key} (${theirs.label}) in the dictionary store`);
  }

  // ---- the records: per m id and letters, each record whose own word is those letters, with its pointed canonical
  // forms and every gloss and raw gloss of its senses -------------------------------------------------------------
  const dictShards = existsSync(join(DICT, "shards")) ? readdirSync(join(DICT, "shards")).filter((f) => f.endsWith(".bin")).sort() : [];
  if (!dictShards.length) refuse(`the dictionary store holds no shards (${join(DICT, "shards")})`);
  const dictDigest = createHash("sha256");
  const records = new Map();   // `${m}\u0001${letters}` -> [{ rid, forms, glosses }]
  const wanted = new Set(SOURCES);
  let recordsRead = 0, recordsNotJson = 0;
  for (const f of dictShards) {
    const bytes = readFileSync(join(DICT, "shards", f));
    dictDigest.update(bytes);
    const body = JSON.parse(gunzipSync(bytes).toString("utf8"));
    for (const [k, entry] of Object.entries(body)) for (const rec of (entry && entry.records) || []) {
      if (!wanted.has(String(rec.m))) continue;
      let j = null;
      try { j = JSON.parse(String(rec.D || "")); } catch { j = null; }
      if (!j || typeof j !== "object") { recordsNotJson += 1; continue; }
      if (lettersKey(j.word) !== k) continue;
      recordsRead += 1;
      const forms = [];
      for (const x of Array.isArray(j.forms) ? j.forms : []) if (x && Array.isArray(x.tags) && x.tags.includes("canonical") && typeof x.form === "string" && isPointed(x.form) && !forms.includes(x.form)) forms.push(x.form);
      const glosses = new Set();
      for (const s of Array.isArray(j.senses) ? j.senses : []) for (const g of [...(s.glosses || []), ...(s.raw_glosses || [])]) if (typeof g === "string") glosses.add(g);
      const id = `${rec.m}\u0001${k}`;
      (records.get(id) || records.set(id, []).get(id)).push({ rid: rec.rid, forms, glosses });
    }
  }
  const inputs = { dictionary_store: { index: `${HOME}/index.json`, index_sha256: sha256(dixBytes), shards: dictShards.length, shards_sha256: dictDigest.digest("hex"), store_version: dix.store_version || null } };

  // ---- every row of the store ----------------------------------------------------------------------------
  const tally = {};
  const of = (m) => (tally[m] ||= { key: index.m_sources[m].key, label: index.m_sources[m].label, rows: 0, rows_pointing_on_their_own: 0, rows_naming_no_headword: 0, rows_whose_own_headwords_carry_no_points: 0,
    rows_carrying_their_records_forms: 0, forms_carried: 0, rows_with_two_or_more_forms: 0, rows_left_bare: { no_record_of_its_source_under_its_letters: 0, no_record_gives_its_text: 0, its_records_give_no_pointed_form: 0 }, rows_moved: 0 });
  const firstLeft = {};   // m -> reason -> the first few rows left bare, for the receipt
  const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
  const touched = [];
  for (const name of shardNames) {
    const path = join(STORE, "shards", name);
    const body = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    let moved = 0;
    for (const [k, rows] of Object.entries(body)) for (const row of rows) {
      const m = String(row[3]);
      if (!wanted.has(m)) continue;
      const t = of(m); t.rows += 1;
      const split = splitHeadwords(row[6]);
      if (!split) refuse(`${name} ${k} (${m}, rank ${row[0]}): its headwords ${JSON.stringify(row[6])} are no list, or mix bare and pointed in an order neither the catalog nor this rule makes`);
      // a row whose own headwords point is the catalog's, not this rule's; a row that names no headword at all is
      // left as it is too, since forms laid on it could not be told from a pointing of its own on the next run
      if (!split.own.length) { if (split.laid.length) t.rows_pointing_on_their_own += 1; else t.rows_naming_no_headword += 1; continue; }
      t.rows_whose_own_headwords_carry_no_points += 1;
      const L = lettersKey(k);
      const cands = records.get(`${m}\u0001${L}`) || [];
      const mine = cands.filter((r) => r.glosses.has(String(row[1] ?? "")));
      const forms = [];
      for (const r of mine) for (const f of r.forms) if (!forms.includes(f) && !split.own.includes(f)) forms.push(f);
      let why = null;
      if (!cands.length) why = "no_record_of_its_source_under_its_letters";
      else if (!mine.length) why = "no_record_gives_its_text";
      else if (!forms.length) why = "its_records_give_no_pointed_form";
      if (why) {
        t.rows_left_bare[why] += 1;
        const fl = ((firstLeft[m] ||= {})[why] ||= []);
        if (fl.length < 5) fl.push({ key: k, rank: row[0], route: String(row[1] ?? "").slice(0, 80) });
      } else {
        t.rows_carrying_their_records_forms += 1; t.forms_carried += forms.length;
        if (forms.length > 1) t.rows_with_two_or_more_forms += 1;
      }
      const want = [...split.own, ...forms];
      if (same(row[6], want)) continue;
      t.rows_moved += 1; moved += 1;
      if (!DRY) row[6] = want;
    }
    if (moved) { touched.push(name); if (!DRY) writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 })); }
  }

  // ---- what the run found ------------------------------------------------------------------------------
  const sum = (f) => Object.values(tally).reduce((a, s) => a + s[f], 0);
  const sumLeft = (w) => Object.values(tally).reduce((a, s) => a + s.rows_left_bare[w], 0);
  const totals = { sources: SOURCES.length, rows: sum("rows"), rows_pointing_on_their_own: sum("rows_pointing_on_their_own"), rows_naming_no_headword: sum("rows_naming_no_headword"), rows_whose_own_headwords_carry_no_points: sum("rows_whose_own_headwords_carry_no_points"),
    rows_carrying_their_records_forms: sum("rows_carrying_their_records_forms"), forms_carried: sum("forms_carried"),
    rows_left_bare: { no_record_of_its_source_under_its_letters: sumLeft("no_record_of_its_source_under_its_letters"), no_record_gives_its_text: sumLeft("no_record_gives_its_text"), its_records_give_no_pointed_form: sumLeft("its_records_give_no_pointed_form") },
    records_read: recordsRead, records_whose_text_is_no_record: recordsNotJson };
  const moved = sum("rows_moved");
  for (const [m, s] of Object.entries(tally)) console.log(`  ${m.padEnd(5)} ${s.key.padEnd(26)} rows ${String(s.rows).padStart(6)} · own headwords pointed ${String(s.rows_pointing_on_their_own).padStart(6)} · bare ${String(s.rows_whose_own_headwords_carry_no_points).padStart(6)} · carry their records' forms ${String(s.rows_carrying_their_records_forms).padStart(6)} (${n(s.forms_carried)} forms) · left bare: no record under its letters ${s.rows_left_bare.no_record_of_its_source_under_its_letters}, no record gives its text ${s.rows_left_bare.no_record_gives_its_text}, no pointed form ${s.rows_left_bare.its_records_give_no_pointed_form} · moved ${s.rows_moved}`);
  console.log(`own pointing · ${SOURCES.length} sources (${SOURCES.join(", ")}) · ${n(totals.rows)} rows · ${n(totals.rows_carrying_their_records_forms)} carry their records' pointed forms (${n(totals.forms_carried)} forms) · ${n(moved)} rows move (${touched.length} shards) · the dictionary store ${inputs.dictionary_store.store_version}, ${n(recordsRead)} records read`);
  // what the index names: each source's rows as they stand (what a run moved is the receipt's, not the store's)
  const standing = Object.fromEntries(Object.entries(tally).map(([m, { rows_moved: _moved, ...rest }]) => [m, rest]));
  const record = { inputs, sources: standing, totals };
  const had = index.own_pointing || null;
  const nothingToWrite = !moved && !!had && Object.keys(record).every((k) => same(had[k], record[k]));
  // the run's figures, one line of JSON, for a script that holds a run to what was rehearsed
  console.log(`figures ${JSON.stringify({ store_version: index.store_version || null, dictionary_store: inputs.dictionary_store, rows_moved: Object.fromEntries(Object.entries(tally).map(([m, s]) => [m, s.rows_moved])), shards_moved: touched.length,
    rows_carrying_their_records_forms: totals.rows_carrying_their_records_forms, forms_carried: totals.forms_carried, rows_left_bare: totals.rows_left_bare, the_index_names_this_run: nothingToWrite })}`);
  if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
  if (nothingToWrite) { console.log("nothing moves and the index names this run's inputs and counts — nothing written"); process.exit(0); }

  // ---- write: the index, the receipt -------------------------------------------------------------------
  const on = momentOf(GIVEN_ON);
  const digest = createHash("sha256");
  // the shards' weight on disk, which the index states (counts.shard_bytes_total): a headword written moves its
  // shard's bytes, so the total is taken again from the shards as they now stand
  let shardBytes = 0;
  for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
  const was = index.store_version || null, now = digest.digest("hex").slice(0, 12);
  const WHAT = "a row of English Wiktionary's dictionaries (the sources under kaikki_wiktionary_hebrew and kaikki_wiktionary_aramaic) whose own headwords carry no points carries after them, in slot 6, the distinct pointed canonical forms of the records it belongs to (the dictionary store's records of its own m id under its letters whose own word is those letters and one of whose senses gives its route text as a gloss), verbatim and in the record's order; the headwords it carried stay as they were and where they were; the texts are the served bytes, unchanged; a row no record gives its text, or whose records give no pointed form, carries nothing more";
  // the versions on either side of this rule's last move of a shard: kept as they were when a run moves none
  const lastMove = now !== was || !had ? { store_version_before: was, store_version: now } : { store_version_before: had.store_version_before, store_version: had.store_version };
  index.own_pointing = { rule_id: OWN_POINTING_RULE_ID, applied_on: on, applied_by: "tools/apply-own-pointing-v1.mjs", ...record, ...lastMove, what: WHAT };
  index.counts = { ...(index.counts || {}), shard_bytes_total: shardBytes };
  if (now !== was) { index.store_version = now; index.store_version_history = [...(index.store_version_history || []), { was, now, why: OWN_POINTING_RULE_ID, on }]; }
  writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
  const prior = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
  writeFileSync(RECEIPT, JSON.stringify({ schema_version: "OWN_POINTING_RECEIPT_V1", rule_id: OWN_POINTING_RULE_ID, what: WHAT,
    runs: [...((prior && prior.runs) || []), { ran_at: on, store_version: { was, now }, inputs, shards_rewritten: touched.length, rows_moved: moved, totals, sources: tally, first_rows_left_bare: firstLeft }] }, null, 1) + "\n");
  console.log(`written · store ${was} -> ${now}${now === was ? " (no shard moved)" : ""} · shards weigh ${n(shardBytes)} bytes · index.own_pointing names the run · receipt ${RECEIPT}`);
}
