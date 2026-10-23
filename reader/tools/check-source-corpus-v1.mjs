#!/usr/bin/env node
// GUARDS: source-corpus-rule-v1-a-witness-names-the-body-it-describes-or-is-not-sorted-by-one
// LEDGER: M
// the witness and what body it describes: this holds the served route store to
// the corpus lane's classification, and refuses outright any witness that
// describes a language outside Hebrew and Aramaic.
//
// M's own words: the witness must be a source of Hebrew or Aramaic — the
// language it defines, not the language it defines in. A Yiddish dictionary is
// never admitted, and no Yiddish word is ever defined from a Yiddish source.
// That rule was written down long before anything could test it, because
// nothing on a card said what body its witness describes.
//
// On 2026-09-06 the corpus lane classified every source label from its own
// title and found three that M refuses — a Yiddish dictionary, an Arabic one,
// and a table of non-Hebrew languages written in Hebrew letters — feeding
// 8,173 cards into the twenty-four books, and producing wrong Hebrew through
// homographs: the letters that read "then" in Hebrew glossed "when" from the
// Yiddish word spelled the same way.
//
// None of the three is in this lane's store, checked row by row across all of
// them. This file is what keeps that true. It is the cheap half of a rule
// whose expensive half — reading eighty title pages — the other lane did.
//
//   L1  every witness the store cites is one the corpus ledger classifies,
//       or is named here as unclassified: named, not failed, because the
//       ledger answers the twenty-four books and this shelf is wider
//   L2  NO witness the store cites is one M refuses. This is the line.
//   L3  the record was emitted from the ledger it names, and the ledger it
//       names is the one on disk
//
// Run: node tools/check-source-corpus-v1.mjs [--ledger <the lane's ledger, to re-hash>]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const RECORD = join(K3, "data", "source-corpus-v1.json");
const STORE = join(K3, "data", "route-store");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(RECORD)) { console.log(`SKIPPED — no corpus record at ${RECORD.replace(K3 + "/", "")}; emit it with tools/emit-source-corpus-v1.mjs`); process.exit(3); }
if (!existsSync(join(STORE, "index.json"))) { console.log("SKIPPED — no route store on this disk"); process.exit(3); }
const rec = JSON.parse(readFileSync(RECORD, "utf8"));
const mSources = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8")).m_sources || {};

// what the store cites NOW, read from the shards — not from the record, which
// is the thing being checked
const cited = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const rows of Object.values(shard)) for (const r of rows) cited.set(r[3], (cited.get(r[3]) || 0) + 1);
}

const known = rec.witnesses || {};
const namedUnclassified = new Set((rec.unclassified || []).map((u) => u.m));
const strays = [...cited.keys()].filter((m) => !known[m] && !namedUnclassified.has(m));
check(`L1  every witness the store cites is classified or named as unclassified (${cited.size} cited)`,
  strays.length === 0,
  strays.length
    ? `${strays.length} cite nobody in the record: ${strays.slice(0, 4).map((m) => `${m} ${(mSources[m] || {}).label || "no label"}`).join(" · ").slice(0, 200)} — re-emit the record`
    : `${Object.keys(known).length} classified · ${namedUnclassified.size} named as outside the ledger`);

// L2 · the line itself
const REFUSED = "REFUSED";
const served = [...cited.entries()].filter(([m]) => (known[m] || {}).corpus === REFUSED);
check("L2  no witness this shelf cites is one M refuses",
  served.length === 0,
  served.length
    ? `${served.length} refused witness(es) are cited by ${served.reduce((t, [, n]) => t + n, 0).toLocaleString()} rows: ${served.map(([m]) => `${m} ${known[m].label}`).join(" · ").slice(0, 220)}`
    : `${cited.size} witnesses, none describing a language outside Hebrew and Aramaic${(rec.values || {}).REFUSED ? ` — the ledger refuses ${rec.values.REFUSED.sources} source(s) and this shelf cites none of them` : ""}`);

// L3 · the record stands on the ledger it names
const ledgerPath = arg("ledger");
if (ledgerPath && existsSync(ledgerPath)) {
  const sha = createHash("sha256").update(readFileSync(ledgerPath)).digest("hex");
  check("L3  the record was emitted from the ledger it names", sha === (rec.ledger || {}).sha256,
    sha === (rec.ledger || {}).sha256 ? `${sha.slice(0, 12)}… · ${rec.ledger.sources_in_the_ledger} sources classified by the corpus lane`
      : `the ledger on disk hashes ${sha.slice(0, 12)}…, the record was emitted from ${String((rec.ledger || {}).sha256).slice(0, 12)}… — re-emit`);
} else {
  console.log(`  --  L3 the ledger itself is not on this disk; the record names it at ${(rec.ledger || {}).at || "an address it does not give"} and carries its hash`);
}

console.log();
console.log("  M's line, in its own words: the witness must be a source of Hebrew or Aramaic —");
console.log("  the language it defines, not the language it defines in. A source outside that");
console.log("  set is refused entirely, not ranked last, because a wrong definition from a");
console.log("  forbidden source is not a weaker reading; it is a different language's word");
console.log("  wearing these letters.");
process.exit(bad ? 1 : 0);
