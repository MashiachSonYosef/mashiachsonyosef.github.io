#!/usr/bin/env node
// Synthesis lane · declarations-branch-rule-v1-a-branch-is-what-the-source-says-about-itself-and-a-reserved-token-is-never-a-branch
// LEDGER: -
// no frame letter. This serves no reading and changes no letter: it projects
// the corpus lane's per-source declarations ledger onto the sources this site
// actually holds, so the rail's source row can open into what each source
// SAYS ABOUT ITSELF.
//
// THE MENORAH. One stem per source, one branch per aspect the source declares,
// one leaf per value the source names. The owner's frame: the primary toggle is
// the source itself, each removable, expanding into a branch of that source's
// own declarations. Nothing here is composed, folded, or inferred — every
// string drawn is the source's own, at the address the corpus lane recorded.
//
// THE ONE RULE THAT DECIDES WHAT IS DRAWN — contract v6 §7.1/§7.2:
//
//   A values[] entry that is a RESERVED TOKEN is not a value the source
//   declares. Drop it before drawing a branch, then read
//   values_tail_not_enumerated to know the list is partial.
//
// The test is EXACT STRING MEMBERSHIP against an explicit list of ten strings,
// and nothing else. No regex, no shape, no prefix, suffix, bracket or capital
// rule. A source that writes its own values in capitals is indistinguishable
// from the corpus lane's plumbing under a shape test: `PBH` is Sefaria's code
// for post-biblical Hebrew, `YIVO` the Yiddish standard orthography, `BDB` a
// whole lexicon row's title, `NOT_IN_COPYRIGHT` archive.org's own rights
// statement and the only value its row carries. An earlier draft that dropped
// by shape deleted all four and nineteen strings in all, emptying two rows
// that hold a real declaration.
//
// So the list is NOT typed here. It is parsed out of the contract's own §7.2
// code block — the contract being one of the 29 files this tool re-hashes
// against the shipped manifest before it reads a line — and cross-checked
// against the vocabulary file's own list. If the two disagree, or if any of
// the nineteen named survivors would be dropped, this refuses to write.
//
// AND THE FLAG IS NOT THE TEST. values_tail_not_enumerated warns that the
// list is partial; it never decides what a token is. In v7 every row carrying
// a token also carries the flag, and that is a fact about this build, not a
// rule: v6 had four rows carrying a token with no flag. Drop by the token
// test; then read the flag.
//
// WHAT IS A BRANCH. The eleven aspects the contract's own honest-heights
// table names — language, dialect_or_variety, period, register,
// part_of_speech, script, pointing, sense_type, semantic_domain,
// grammatical_form_label, edition_or_version — parsed from that table, not
// typed here, because §3 says an aspect is one of these "or a non-branch
// name". Every other aspect, and every row the ledger itself marks
// CHANNEL_NOT_A_BRANCH, LICENCE_MATERIAL_PARKED or WORK_IDENTITY, is carried
// BESIDE the branches under its own name — a source's statement of what it
// is remains a real thing it says, and hiding it would be this lane choosing
// what the reader may weigh.
// Observations are counted and NEVER drawn: "this column is filled on N of M"
// is a measurement of ours, not a declaration of theirs.
//
// SHORT BRANCHES ARE HONEST. Script is 0 of 102 keys; period is 0 of 102.
// Nothing here fills a gap: a source that declares nothing has no branch, and
// where the source's own bytes say it does not declare, the silence is drawn
// as silence with the ledger's own silence_class.
//
// Run: node tools/project-declarations-v1.mjs --ledger <dir holding fix/> [--store data/route-store]
//        [--out data/source-declarations-v1.bin] [--receipt data/source-declarations-receipt-v1.json] [--stamp YYYY-MM-DD]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { openRouteStore } from "./gloss-store-v1.mjs";

export const DECLARATIONS_RULE_ID = "declarations-branch-rule-v1-a-branch-is-what-the-source-says-about-itself-and-a-reserved-token-is-never-a-branch";
export const DECLARATIONS_SCHEMA = "SOURCE_DECLARATIONS_V1";

/** The reserved list, read out of the contract's own §7.2 code block. Never typed here. */
export const reservedFromContract = (contractText) => {
  const block = /const RESERVED = new Set\(\[([\s\S]*?)\]\);/u.exec(String(contractText));
  if (!block) return null;
  const out = [];
  const re = /"((?:[^"\\]|\\.)*)"/gu;
  let m;
  while ((m = re.exec(block[1]))) out.push(JSON.parse(`"${m[1]}"`));
  return out;
};

/** The ELEVEN branch names, parsed from the contract's own honest-heights
 *  table (§4, first column) — the contract's §3 says an aspect is one of these
 *  "or a non-branch name", so the menorah's branches are exactly these and
 *  every other aspect is a channel. Parsed, never typed. */
export const branchAspectsFromContract = (contractText) => {
  const sec = /\n## 4\.[\s\S]*?\n(\|[\s\S]*?)\n\s*\n/u.exec(String(contractText));
  if (!sec) return null;
  const out = [];
  for (const line of sec[1].split("\n")) {
    const m = /^\|\s*([a-z_]+)\s*\|/u.exec(line.trim());
    if (m && m[1] !== "aspect") out.push(m[1]);
  }
  return out;
};

/** §7.2, entire: exact string membership. The only test this file runs on a value. */
export const branchValues = (row, reserved) => (row.values || []).filter((v) => !reserved.has(String(v.value)));

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };

if (import.meta.url === `file://${process.argv[1]}`) {
  const LEDGER = arg("--ledger"), STORE = arg("--store", "data/route-store");
  const OUT = arg("--out", "data/source-declarations-v1.bin"), RECEIPT = arg("--receipt", "data/source-declarations-receipt-v1.json");
  const STAMP = arg("--stamp", new Date().toISOString().slice(0, 10));
  if (!LEDGER) { console.error("missing --ledger <dir holding fix/CONTRACT-declarations-v6.md and the three jsonl files>"); process.exit(2); }
  const FIX = existsSync(join(LEDGER, "fix")) ? join(LEDGER, "fix") : LEDGER;
  const sha = (b) => createHash("sha256").update(b).digest("hex");
  const readF = (n) => readFileSync(join(FIX, n));

  // ── the pins, before a line is read ──────────────────────────────────────
  const manifest = JSON.parse(readF("MANIFEST-declarations-v6.json").toString("utf8"));
  let matched = 0, bytes = 0; const differ = [], absent = [];
  for (const e of manifest.entries || []) {
    const p = join(FIX, e.file);
    if (!existsSync(p)) { absent.push(e.file); continue; }
    const b = readFileSync(p); bytes += b.length;
    if (sha(b) === e.sha256 && b.length === e.bytes) matched += 1; else differ.push(e.file);
  }
  if (differ.length || absent.length) { console.error(`LEDGER_PIN_FAILED · ${differ.length} differ, ${absent.length} absent: ${[...differ, ...absent].slice(0, 6).join(", ")}`); process.exit(1); }
  if (bytes !== manifest.bytes) { console.error(`LEDGER_BYTES ${bytes} vs manifest ${manifest.bytes}`); process.exit(1); }

  // ── the reserved list, from the contract, cross-checked ──────────────────
  const contract = readF("CONTRACT-declarations-v6.md").toString("utf8");
  const fromContract = reservedFromContract(contract);
  if (!fromContract || !fromContract.length) { console.error("CONTRACT_HAS_NO_RESERVED_BLOCK — §7.2's code block did not parse; refusing to guess"); process.exit(1); }
  const vocab = JSON.parse(readF("vocabulary-v7.json").toString("utf8"));
  const fromVocab = ((vocab.THE_DECLARATION_VOCABULARY || {}).the_list_as_exact_strings) || [];
  const same = fromContract.length === fromVocab.length && [...fromContract].sort().every((s, i) => s === [...fromVocab].sort()[i]);
  if (!same) { console.error(`RESERVED_LISTS_DISAGREE · contract ${JSON.stringify(fromContract)} · vocabulary ${JSON.stringify(fromVocab)}`); process.exit(1); }
  const RESERVED = new Set(fromContract);

  // the eleven, from the contract's own table
  const ELEVEN = branchAspectsFromContract(contract);
  if (!ELEVEN || ELEVEN.length !== 11) { console.error(`CONTRACT_BRANCH_TABLE_UNREAD · parsed ${ELEVEN ? ELEVEN.length : 0} aspect names from §4, expected 11 — refusing to guess which aspects are branches`); process.exit(1); }
  const BRANCH = new Set(ELEVEN);

  // ── the nineteen the shape test deleted; every one must survive ──────────
  const NINETEEN = ((vocab.the_nineteen_the_v6_verifiers_named || {}).values) || [];
  const wrongly = NINETEEN.filter((v) => RESERVED.has(v));
  if (wrongly.length) { console.error(`RESERVED_WOULD_DROP_A_SOURCE_VALUE · ${wrongly.join(", ")} — refusing`); process.exit(1); }

  const lines = (n) => readF(n).toString("utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  const decls = lines("declaration-store-v7.jsonl"), notDecl = lines("not-declared-v7.jsonl"), obs = lines("observations-v7.jsonl");

  // ── the join, §5: m_ids[i] === m_sources[<m_id>].key, exact equality ─────
  const store = openRouteStore(STORE);
  const mSources = store.index.m_sources || {};
  const byKey = new Map();            // catalog key -> reader ids
  for (const [id, m] of Object.entries(mSources)) {
    const k = String(m.key || "");
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k).push(id);
  }
  const reach = (row) => [...new Set((row.m_ids || []).filter((k) => byKey.has(k)))];

  const stems = {};
  const stemOf = (key) => {
    if (!stems[key]) stems[key] = {
      key, m_ids: [...(byKey.get(key) || [])].sort(),
      labels: [...new Set((byKey.get(key) || []).map((id) => mSources[id].label))].sort(),
      source_keys: [], branches: [], channels: [], silent: [], observations: 0,
    };
    return stems[key];
  };
  const cover = (r) => ({
    n: r.coverage_n ?? null, of: r.coverage_denominator ?? null, pct: r.coverage_pct_display ?? r.coverage_pct ?? null,
    // the denominator's OWN NAME rides with the number: the contract warns
    // that nine kaikki rows carry a 71-record coverage while citing a
    // 76,354-record parent, so a reader must never divide by a file's size
    of_what: r.coverage_denominator_name ?? null, basis: r.coverage_basis ?? null,
    upper_bound: r.coverage_is_upper_bound === true ? true : undefined,
  });
  const stats = { rows: decls.length, rows_reaching_us: 0, entries: 0, entries_dropped: 0, distinct_dropped: new Set(), records_named_by_dropped: 0, rows_emptied: 0, branches: 0, channels: 0, values: 0, tails: 0, silent: 0, observations: 0, source_values_dropped: [] };

  for (const r of decls) {
    const hit = reach(r); if (!hit.length) continue;
    stats.rows_reaching_us += 1;
    const all = r.values || [];
    stats.entries += all.length;
    const kept = branchValues(r, RESERVED);
    for (const v of all) if (RESERVED.has(String(v.value))) {
      stats.entries_dropped += 1; stats.distinct_dropped.add(String(v.value));
      stats.records_named_by_dropped += Number(v.n) || 0;
      if (NINETEEN.includes(String(v.value))) stats.source_values_dropped.push(String(v.value));
    }
    if (all.length && !kept.length) stats.rows_emptied += 1;
    // a branch is one of the eleven the contract names AND not a row the
    // ledger itself marks as a channel; everything else is carried beside
    // the branches under its own name, never as one
    const notABranch = !BRANCH.has(r.aspect) || r.aspect_class === "CHANNEL_NOT_A_BRANCH" || r.aspect_class === "LICENCE_MATERIAL_PARKED" || r.row_class === "WORK_IDENTITY";
    const entry = {
      aspect: r.aspect, grain: r.grain ?? null, where: r.declared_where ?? null, cover: cover(r),
      values: kept.map((v) => ({ v: String(v.value), n: v.n ?? null })),
      // the flag, read AFTER the drop and never used as the test
      tail: r.values_tail_not_enumerated === true ? true : undefined,
      distinct_total: r.distinct_values_total ?? undefined,
      dropped: all.length - kept.length || undefined,
      vocab: r.vocabulary ?? undefined, party: r.declaring_party ?? undefined,
      // the ledger's own mark that a value is this lane's decoding, not the source's string
      decoded: r.value_decoded ?? undefined,
      klass: r.aspect_class ?? (r.row_class ?? (BRANCH.has(r.aspect) ? undefined : "NOT_ONE_OF_THE_ELEVEN")),
      // which WORK of this source said it: a catalog key can gather several
      // of the ledger's works, and one may declare where another is silent
      work: r.work_id ?? r.source_key,
    };
    stats.values += entry.values.length; if (entry.tail) stats.tails += 1;
    for (const key of hit) {
      const st = stemOf(key);
      if (!st.source_keys.includes(r.source_key)) st.source_keys.push(r.source_key);
      if (notABranch) { st.channels.push(entry); stats.channels += 1; } else { st.branches.push(entry); stats.branches += 1; }
    }
  }
  // the silences, in the source's own bytes
  for (const r of notDecl) {
    const hit = reach(r); if (!hit.length) continue;
    for (const key of hit) {
      const st = stemOf(key);
      if (!st.source_keys.includes(r.source_key)) st.source_keys.push(r.source_key);
      st.silent.push({ aspect: r.aspect, why: r.silence_class ?? null, where: r.declared_where ?? null, work: r.work_id ?? r.source_key });
      stats.silent += 1;
    }
  }
  for (const r of obs) { const hit = reach(r); for (const key of hit) { stemOf(key).observations += 1; stats.observations += 1; } }

  // the refusal the contract asks for, re-run on what this lane actually drew
  if (stats.source_values_dropped.length) { console.error(`DROPPED_A_SOURCE_VALUE · ${[...new Set(stats.source_values_dropped)].join(", ")} — refusing to write`); process.exit(1); }

  for (const st of Object.values(stems)) {
    const rank = { language: 0, dialect_or_variety: 1, period: 2, register: 3, part_of_speech: 4, script: 5, pointing: 6, sense_type: 7, semantic_domain: 8, grammatical_form_label: 9, edition_or_version: 10 };
    const by = (a, b) => (rank[a.aspect] ?? 90) - (rank[b.aspect] ?? 90) || String(a.aspect).localeCompare(String(b.aspect)) || String(a.where).localeCompare(String(b.where));
    st.branches.sort(by); st.channels.sort(by);
    st.silent.sort((a, b) => (rank[a.aspect] ?? 90) - (rank[b.aspect] ?? 90) || String(a.aspect).localeCompare(String(b.aspect)));
    st.source_keys.sort();
  }

  const sidecar = {
    schema_version: DECLARATIONS_SCHEMA, rule_id: DECLARATIONS_RULE_ID, projected_on: STAMP,
    source: {
      ledger: "moses-parse-source-and-declaration-v1/declaration-store-v7/", candidate_only: true,
      contract: { file: "CONTRACT-declarations-v6.md", sha256: sha(readF("CONTRACT-declarations-v6.md")) },
      manifest: { file: "MANIFEST-declarations-v6.json", files: (manifest.entries || []).length, bytes: manifest.bytes, all_matched: true },
      files: ["declaration-store-v7.jsonl", "not-declared-v7.jsonl", "observations-v7.jsonl"].map((f) => ({ file: f, sha256: sha(readF(f)), rows: lines(f).length })),
    },
    the_branches: { eleven: ELEVEN, read_from: "the contract's own honest-heights table (§4, first column); §3 says an aspect is one of these or a non-branch name", everything_else: "carried beside the branches under its own name, never drawn as one" },
    the_rule: {
      id: DECLARATIONS_RULE_ID, contract: "v6 §7.1 and §7.2",
      test: "exact string membership against the ten strings below, compared with ===; no regex, no shape, no prefix, suffix, bracket or capitalisation rule",
      reserved: fromContract, reserved_read_from: "the contract's own §7.2 code block, cross-checked against vocabulary-v7.json; never typed in this lane",
      the_flag: "values_tail_not_enumerated warns the list is partial; it is never the test for what a token is",
      nineteen_that_must_survive: NINETEEN,
    },
    join: "m_ids[i] === m_sources[<m_id>].key, exact string equality, never against the object key (contract §5)",
    what_is_not_drawn: {
      channels: "a row the ledger marks CHANNEL_NOT_A_BRANCH, LICENCE_MATERIAL_PARKED or WORK_IDENTITY is carried beside the branches, named, never as a branch",
      observations: "counted, never drawn: a measurement of ours is not a declaration of theirs",
      gaps: "nothing is filled: script is 0 of 102 keys and period 0 of 102, and a source that declares nothing has no branch",
      our_labels: "30 declaration rows carry a value that is the corpus lane's label, decoding or paraphrase rather than the field's own string (66 on the wider reading); the ledger marks the decoded ones and both figures are in its own receipt",
    },
    counts: {
      stems: Object.keys(stems).length, catalog_keys_on_this_site: byKey.size,
      reader_ids_reached: [...new Set(Object.values(stems).flatMap((s) => s.m_ids))].length, reader_ids_on_this_site: Object.keys(mSources).length,
      declaration_rows: decls.length, declaration_rows_reaching_us: stats.rows_reaching_us,
      branches: stats.branches, channels: stats.channels, values_drawn: stats.values,
      rows_whose_list_is_partial: stats.tails, silences: stats.silent, observations_not_drawn: stats.observations,
      entries_seen: stats.entries, entries_dropped_as_reserved: stats.entries_dropped,
      distinct_reserved_dropped: [...stats.distinct_dropped].sort(), records_named_by_dropped_entries: stats.records_named_by_dropped,
      rows_the_rule_empties_completely: stats.rows_emptied, source_values_dropped: 0,
    },
    stems,
  };
  const body = gzipSync(Buffer.from(JSON.stringify(sidecar)), { level: 9 });
  writeFileSync(OUT, body);
  const receipt = {
    schema_version: "SOURCE_DECLARATIONS_RECEIPT_V1", rule: DECLARATIONS_RULE_ID, on: STAMP,
    sidecar: { path: OUT, bytes: body.length, sha256: sha(body) },
    ledger_pins: { files: (manifest.entries || []).length, matched, bytes, manifest_bytes: manifest.bytes },
    store: { dir: STORE, store_version: store.index.store_version, schema: store.index.schema_version },
    reserved: fromContract, nineteen_that_survive: NINETEEN,
    counts: sidecar.counts,
    what_this_does_not_say: [
      "that a value can filter a reading — the store carries no per-row declaration, so a branch SAYS what a source declares and never withholds a row by it",
      "that the branch is the whole of what a source declares — where values_tail_not_enumerated is true the list is a part, and the branch says so",
      "that a value is the source's own words in every case — the ledger names 30 rows (66 on the wider reading) whose value is the corpus lane's label or decoding",
      "anything about the sources this site does not hold: 19 of the ledger's cache directories were never taken by the catalog",
    ],
  };
  writeFileSync(RECEIPT, JSON.stringify(receipt, null, 1));
  const c = sidecar.counts;
  console.log(`${OUT}: ${c.stems} stems (of ${c.catalog_keys_on_this_site} catalog keys) · ${c.branches} branches · ${c.channels} channels · ${c.values_drawn.toLocaleString()} values · ${c.silences} silences · ${(body.length / 1024).toFixed(0)} KB`);
  console.log(`  the rule: ${c.entries_dropped_as_reserved} entries dropped as reserved (${c.distinct_reserved_dropped.length} distinct, naming ${c.records_named_by_dropped_entries.toLocaleString()} records) · rows emptied ${c.rows_the_rule_empties_completely} · SOURCE VALUES DROPPED ${c.source_values_dropped} · partial lists ${c.rows_whose_list_is_partial}`);
  console.log(`  reaches ${c.reader_ids_reached} of this site's ${c.reader_ids_on_this_site} reader sources · ${c.observations_not_drawn} observations counted and not drawn · receipt ${RECEIPT}`);
}
