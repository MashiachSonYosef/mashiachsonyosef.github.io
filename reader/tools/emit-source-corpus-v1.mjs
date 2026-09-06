#!/usr/bin/env node
// RULE: source-corpus-rule-v1-a-witness-names-the-body-it-describes-or-is-not-sorted-by-one
// LEDGER: M
// the witness and what it may be asked about: this record carries, for every
// witness the route store cites, which body of text that witness declares
// itself to describe, and refuses outright the ones that describe a language
// outside Hebrew and Aramaic.
//
// 2026-09-06. M has always carried who said it, on what terms, and when. It
// did not carry WHAT BODY OF TEXT the source describes, and without that the
// reader's default sorter — lexicons of the text's own era first — cannot be
// built, because nothing on the card says which era a lexicon is of.
//
// The corpus lane classified all 79 of its source labels from each source's
// own title, and found more than a gap. Three of them describe languages the
// frame refuses absolutely: a Yiddish dictionary, an Arabic one, and a table
// of non-Hebrew languages written in Hebrew letters. Between them they were
// feeding 8,173 cards into the twenty-four books, and they were not harmless:
// the Yiddish source glosses the Hebrew word for "then" as "when", because
// the same letters are a Yiddish word, and it hands back "rebbe" and "cohen"
// — English loanwords fed onto the Hebrew they came from.
//
// This lane's route store never admitted any of the three; that was checked
// row by row across all 676,463 of them before this record was written, and
// it holds. So this is not a repair. It is the boundary made explicit, so it
// cannot drift the day the corpus lane's word layer is wired in: a witness
// arrives classified, or it arrives unclassified and is named here, and a
// witness the corpus lane refuses can never be served whatever else changes.
//
// Run: node tools/emit-source-corpus-v1.mjs --ledger <source-corpus-v1.json> --stamp YYYY-MM-DD
//        [--store data/route-store] [--out data/source-corpus-v1.json]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const LEDGER = arg("ledger") || die("MISSING_ARG", "--ledger");
const STAMP = arg("stamp") || die("MISSING_ARG", "--stamp");
const STORE = arg("store", join(K3, "data", "route-store"));
const OUT = arg("out", join(K3, "data", "source-corpus-v1.json"));
// Where the ledger came from, said as the address the other lane ships to and
// never as a path on whatever machine ran this.
const LEDGER_AT = "r2:mishkan/moses-ledgers/toggle-ledgers-v1/source-corpus-v1.json";

const ledgerBytes = readFileSync(LEDGER);
const ledger = JSON.parse(ledgerBytes.toString("utf8"));
if (ledger.schema !== "mishkan.moses.toggle.source_corpus.v1")
  die("UNEXPECTED_LEDGER_SCHEMA", String(ledger.schema));
const byLabel = new Map((ledger.sources || []).map((s) => [s.source, s]));

const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const mSources = index.m_sources || {};

// Which witnesses the store actually cites, read from the shards rather than
// from the index: a witness recorded and never cited is not something this
// lane serves, and a witness cited is, whatever the index says.
const cited = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const rows of Object.values(shard)) for (const r of rows) cited.set(r[3], (cited.get(r[3]) || 0) + 1);
}

const witnesses = {}, unclassified = [], refused = [];
for (const [m, rows] of [...cited.entries()].sort((a, b) => b[1] - a[1])) {
  const label = (mSources[m] || {}).label || null;
  const row = label ? byLabel.get(label) : null;
  if (!label) { unclassified.push({ m, label: null, rows, why: "the store cites this witness and its index does not record it" }); continue; }
  if (!row) { unclassified.push({ m, label, rows, why: "the corpus lane's ledger does not carry this label; its 79 answer the twenty-four books, this shelf is wider" }); continue; }
  witnesses[m] = { label, corpus: row.declared_corpus, evidence: row.evidence || null, rows };
  if (row.declared_corpus === "REFUSED") refused.push({ m, label, rows, why: row.evidence || "refused by M" });
}

const counts = {};
for (const w of Object.values(witnesses)) counts[w.corpus] = (counts[w.corpus] || 0) + 1;

const record = {
  schema_version: "SOURCE_CORPUS_V1",
  rule_id: "source-corpus-rule-v1-a-witness-names-the-body-it-describes-or-is-not-sorted-by-one",
  what: "for every witness this lane's route store cites, the body of text that witness declares itself to describe — the field the reader's era sorter reads, and the field that refuses a source describing a language outside Hebrew and Aramaic",
  stamp: STAMP,
  ledger: {
    at: LEDGER_AT,
    sha256: createHash("sha256").update(ledgerBytes).digest("hex"),
    generated: ledger.generated || null,
    law: ledger.law || null,
    classified_by: "the corpus lane, from each source's own title",
    sources_in_the_ledger: (ledger.sources || []).length,
  },
  values: ledger.values || {},
  witnesses_cited_here: cited.size,
  witnesses_classified: Object.keys(witnesses).length,
  by_value: counts,
  refused_and_cited_here: refused,
  unclassified,
  witnesses,
  says: refused.length
    ? `${refused.length} witness(es) this shelf cites are refused by M and must not be served`
    : "no witness this shelf cites is one M refuses",
};
const out = JSON.stringify(record, null, 2) + "\n";
if (/\b[A-Za-z]:[\\/](?![\\/])|\/(?:home|root|tmp|mnt|Users)\/|Users[\\/]/u.test(out))
  die("PATH_IN_RECORD", "a machine path reached the record; refusing to write it");
writeFileSync(OUT, out);
console.log(`${OUT.replace(K3 + "/", "")}: ${cited.size} witnesses cited · ${Object.keys(witnesses).length} classified · ${unclassified.length} not in the ledger · ${refused.length} refused`);
for (const [v, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${v.toLowerCase()}`);
