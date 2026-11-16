#!/usr/bin/env node
// RUN: tree
// GUARDS: own-pointing-rule-v1-a-row-whose-headwords-carry-no-points-takes-its-own-records-pointed-head-forms
// LEDGER: -
// no frame letter. A check reads the store and the dictionary store and
// judges them; it is not the ledger for one.
//
// A ROW OF ENGLISH WIKTIONARY CARRIES ITS OWN RECORD'S POINTING, AND NOTHING
// ELSE MOVES. The store's rows of Kaikki's two dictionaries from English
// Wiktionary carry at [6] the entry's page title, its bare letters; each
// record heads its word with pointed forms tagged "canonical", which the
// dictionary store (data/dictionary-store) serves whole. Since 16 November
// 2026 a row its source does not point qualifies for no pointing
// (unpointed-row-rule-v1), and tools/apply-own-pointing-v1.mjs lays each
// record's pointed forms on its rows, after their own headwords. What is
// held here, each recomputed by this check's own road (the records indexed by
// their glosses, not the tool's per-letters lists) and none read from the
// tool's receipt:
//
//   O1  the sources: the store holds sources under the two keys, and where the
//       dictionary store names one of their m ids it names it the same, by key
//       and label
//   O2  every row of those sources carries, after its own headwords (the
//       leading run with no points, never empty), exactly the distinct pointed
//       canonical forms of the records it belongs to, in the records' order:
//       the records of its own m id under its letters whose own word is those
//       letters and one of whose senses gives its route text as a gloss or a
//       raw gloss. A row whose headwords all point is the catalog's and
//       carries nothing of this rule's; a row whose headwords mix bare and
//       pointed in any other order is a fault
//   O3  the store's index names the run: this rule, the dictionary store it
//       read (the bytes on this disk: its index's sha256 and its shards'),
//       and, source by source, counts that are this check's recount; and the
//       store's version history names the rule's last move of a shard
//
// SKIPS by name when no dictionary store is on this disk.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { isPointed } from "./pointing-grade-v1.mjs";
import { OWN_POINTING_RULE_ID, OWN_POINTING_SOURCE_KEYS } from "./apply-own-pointing-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
const DICT = arg("dictionary-store", join(K3, "data", "dictionary-store"));
let bad = 0;
const check = (name, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${name}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const letters = (t) => [...String(t ?? "").normalize("NFD")].filter((c) => c >= "\u05D0" && c <= "\u05EA").join("");
if (!existsSync(join(DICT, "index.json")) || !existsSync(join(DICT, "shards"))) { console.log(`SKIPPED — no dictionary store on this disk (${DICT}), so no record to hold a row to`); process.exit(3); }
console.log(`— ${OWN_POINTING_RULE_ID} —`);

// ---- O1 ------------------------------------------------------------------------------------------
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const dixBytes = readFileSync(join(DICT, "index.json"));
const dix = JSON.parse(dixBytes.toString("utf8"));
const sources = Object.entries(index.m_sources || {}).filter(([, s]) => s && OWN_POINTING_SOURCE_KEYS.includes(s.key)).map(([m]) => m);
const misnamed = sources.filter((m) => (dix.m_sources || {})[m] && ((dix.m_sources[m].key !== index.m_sources[m].key) || (dix.m_sources[m].label !== index.m_sources[m].label)));
check("O1  the store holds sources under English Wiktionary's two keys, and the dictionary store names each of them as the store does",
  sources.length > 0 && misnamed.length === 0, misnamed.length ? `named otherwise: ${misnamed.join(", ")}` : `${sources.join(", ")} (${OWN_POINTING_SOURCE_KEYS.join(", ")})`);

// ---- the records, by this check's own road: m, letters and a gloss -> the pointed canonical forms, in order -----
const wanted = new Set(sources);
const byGloss = new Map();
const dictShards = readdirSync(join(DICT, "shards")).filter((f) => f.endsWith(".bin")).sort();
const dictDigest = createHash("sha256");
for (const f of dictShards) {
  const bytes = readFileSync(join(DICT, "shards", f));
  dictDigest.update(bytes);
  const body = JSON.parse(gunzipSync(bytes).toString("utf8"));
  for (const [k, entry] of Object.entries(body)) for (const rec of (entry && entry.records) || []) {
    if (!wanted.has(String(rec.m))) continue;
    let j = null;
    try { j = JSON.parse(String(rec.D || "")); } catch { continue; }
    if (!j || letters(j.word) !== k) continue;
    const forms = [];
    for (const x of j.forms || []) if (x && (x.tags || []).includes("canonical") && isPointed(x.form) && !forms.includes(x.form)) forms.push(x.form);
    const glosses = new Set();
    for (const s of j.senses || []) { for (const g of s.glosses || []) glosses.add(g); for (const g of s.raw_glosses || []) glosses.add(g); }
    for (const g of glosses) {
      const id = `${rec.m}\u0001${k}\u0001${g}`;
      const had = byGloss.get(id) || [];
      for (const x of forms) if (!had.includes(x)) had.push(x);
      byGloss.set(id, had);
    }
  }
}

const dictShardsSha = dictDigest.digest("hex");

// ---- O2: every row of those sources ------------------------------------------------------------------------
const recount = {};
const tallyOf = (m) => (recount[m] ||= { rows: 0, rows_pointing_on_their_own: 0, rows_naming_no_headword: 0, rows_whose_own_headwords_carry_no_points: 0, rows_carrying_their_records_forms: 0, forms_carried: 0 });
const faults = [];
let held = 0, bare = 0;
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    const m = String(row[3]);
    if (!wanted.has(m)) continue;
    const t = tallyOf(m); t.rows += 1;
    const hw = row[6];
    const where = `${f} ${k} (${m}, rank ${row[0]})`;
    if (!Array.isArray(hw)) { faults.push(`${where}: no headword slot`); continue; }
    let own = 0; while (own < hw.length && !isPointed(hw[own])) own += 1;
    if (hw.slice(own).some((h) => !isPointed(h))) { faults.push(`${where}: its headwords ${JSON.stringify(hw)} mix bare and pointed`); continue; }
    if (own === 0) { if (hw.length) t.rows_pointing_on_their_own += 1; else t.rows_naming_no_headword += 1; continue; }
    t.rows_whose_own_headwords_carry_no_points += 1;
    const ownHw = hw.slice(0, own);
    const want = (byGloss.get(`${m}\u0001${letters(k)}\u0001${String(row[1] ?? "")}`) || []).filter((x) => !ownHw.includes(x));
    const has = hw.slice(own);
    if (want.length) { t.rows_carrying_their_records_forms += 1; t.forms_carried += want.length; }
    if (!same(has, want)) { faults.push(`${where} «${String(row[1]).slice(0, 40)}»: carries ${JSON.stringify(has)} after its own headwords, and its records give ${JSON.stringify(want)}`); continue; }
    if (want.length) held += 1; else bare += 1;
  }
}
check("O2  every row of those sources carries, after its own headwords, exactly the pointed head forms of the records it belongs to, and nothing else",
  faults.length === 0, faults.length ? `${nf(faults.length)} rows · ${faults.slice(0, 3).join(" | ")}` : `${nf(held)} rows carry their records' forms · ${nf(bare)} rows whose records give their text no pointed form, or that no record gives, carry none`);

// ---- O3: the index names the run ---------------------------------------------------------------------------
const rec = index.own_pointing || null;
const ds = rec && rec.inputs && rec.inputs.dictionary_store;
const countsOf = (s) => (s ? { rows: s.rows, rows_pointing_on_their_own: s.rows_pointing_on_their_own, rows_naming_no_headword: s.rows_naming_no_headword, rows_whose_own_headwords_carry_no_points: s.rows_whose_own_headwords_carry_no_points,
  rows_carrying_their_records_forms: s.rows_carrying_their_records_forms, forms_carried: s.forms_carried } : null);
const countsDiffer = rec ? Object.keys(recount).filter((m) => !same(countsOf((rec.sources || {})[m]), recount[m])) : [];
const lastMove = [...(index.store_version_history || [])].reverse().find((h) => h.why === OWN_POINTING_RULE_ID) || null;
const o3 = !!rec && rec.rule_id === OWN_POINTING_RULE_ID && !!ds && ds.index_sha256 === sha256(dixBytes) && ds.shards === dictShards.length && ds.shards_sha256 === dictShardsSha && countsDiffer.length === 0
  && !!lastMove && lastMove.now === rec.store_version && lastMove.was === rec.store_version_before;
const o3Why = () => (!rec ? "the store's index names no run of tools/apply-own-pointing-v1.mjs (run it, --on <moment>, then the round)"
  : rec.rule_id !== OWN_POINTING_RULE_ID ? `the index names ${rec.rule_id}`
    : !ds || ds.index_sha256 !== sha256(dixBytes) ? "the index names another dictionary store than the one on this disk"
      : countsDiffer.length ? `the counts of ${countsDiffer.join(", ")} are not this check's recount: ${JSON.stringify(recount[countsDiffer[0]])}`
        : !lastMove ? "the store's history names no move of this rule"
          : `the history's last move of this rule (${lastMove.was} -> ${lastMove.now}) is not the one the index names, or the dictionary store's shards are not the bytes it read`);
check("O3  the store's index names the run: this rule, the dictionary store on this disk, counts that are this check's recount, and the rule's last move in the store's history",
  o3, o3 ? `applied ${rec.applied_on} · store ${rec.store_version_before} -> ${rec.store_version} · the dictionary store ${ds.store_version} · ${Object.entries(recount).filter(([, s]) => s.rows_carrying_their_records_forms).map(([m, s]) => `${m} ${nf(s.rows_carrying_their_records_forms)} rows`).join(", ")}` : o3Why());

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
