#!/usr/bin/env node
// title-key-rule-v1-only-what-the-store-already-attests
//
// A title is corpus text. The reader can open any word of the text and see the
// records behind it — except the titles, which arrive from the walk carrying
// their surface and no key, so the page has nothing to ask the store about and
// correctly refuses to open them.
//
// That refusal was reading as a principle. It is not one: the store answers for
// these forms. It carries "one" for א׳ and "two" for ב׳ from Jastrow 1903, and
// fifteen readings for בראשית including "Genesis" itself. The keys were simply
// never attached.
//
// So this attaches them, and only where the store already answers:
//
//   1. The surface is the ledger's, verbatim. Nothing is retyped or corrected.
//   2. The key is computed by this project's own declared normaliser, the same
//      one the store was keyed with — not by a rule invented here.
//   3. A key is kept only if the store has that key. A form the catalogue has
//      never seen gets no key and still opens nothing, which is the honest
//      answer rather than an empty card.
//   4. A token the ledger has marked as a NUMBER is left alone. The ledger says
//      why, in its own words: it "reuses a letter's identity to name a number
//      and is not an occurrence of that letter, so the catalog is not asked
//      about it". The catalogue will answer anyway — it has "one" for א׳ from
//      Jastrow, and "talent" for כ׳ from the same record, which is the exact
//      bleed the ledger's rule exists to stop. Where the ledger has ruled, this
//      does not overrule it.
//   5. Nothing else in the zone moves.
//
// Usage: node tools/name-the-titles-v1.mjs --zone in.bin --out out.bin --stamp id
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const { exactK, K_RULE_ID } = await import(join(HERE, "k-normalization-v1.mjs"));
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const inPath = arg("--zone"), outPath = arg("--out"), stamp = arg("--stamp");
const storeDir = arg("--store", join(HERE, "..", "data", "route-store"));
if (!inPath || !outPath || !stamp) { console.error("MISSING_ARG — --zone --out --stamp"); process.exit(2); }

const shardCache = new Map();
const attests = (k) => {
  const shard = createHash("sha256").update(k, "utf8").digest("hex").slice(0, 2);
  if (!shardCache.has(shard)) {
    const p = join(storeDir, "shards", `${shard}.bin`);
    shardCache.set(shard, existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : {});
  }
  const rows = shardCache.get(shard)[k];
  return Array.isArray(rows) && rows.length > 0;
};

const zone = JSON.parse(gunzipSync(readFileSync(inPath)).toString("utf8"));
// Read the ledger's own basis before touching anything it labelled.
const ledger = (zone.emitted_from || {}).y_ledger || {};
const numeralChapters = String(ledger.chapter_label_basis || "").toUpperCase().includes("NUMERAL");
let named = 0, refused = 0, already = 0, leftToTheLedger = 0;
const refusedForms = new Set(), namedForms = new Set();

const nameToken = (t) => {
  if (!t || !t.s) return t;
  if (t.k) { already += 1; return t; }
  const k = exactK(t.s);
  if (k && attests(k)) { t.k = k; named += 1; namedForms.add(t.s); }
  else { refused += 1; refusedForms.add(t.s); }
  return t;
};

// the work's own title, which the walk carries as a string and nothing else
if (zone.work_he && !zone.work_he_tokens) {
  zone.work_he_tokens = String(zone.work_he).split(/\s+/).filter(Boolean).map((s) => nameToken({ s }));
}
let takenBack = 0;
for (const n of zone.nodes || []) {
  if (numeralChapters) {
    // and if a key was put here by an earlier run of this tool, take it back:
    // the ledger's rule stands whether or not the catalogue would answer.
    for (const t of n.name_tokens || []) { if (t.k) { delete t.k; takenBack += 1; } }
    leftToTheLedger += (n.name_tokens || []).length;
  } else (n.name_tokens || []).forEach(nameToken);
  (n.part_tokens || []).forEach(nameToken);
}

zone.emitted_from = zone.emitted_from || {};
zone.emitted_from.title_keys = {
  rule_id: "title-key-rule-v1-only-what-the-store-already-attests",
  key_rule: K_RULE_ID,
  stamp,
  named,
  refused,
  already_keyed: already,
  left_to_the_ledger: leftToTheLedger,
  keys_taken_back: takenBack,
  left_to_the_ledger_because: numeralChapters ? ledger.numeral_rule || ledger.chapter_label_basis : null,
  named_forms: [...namedForms].slice(0, 40),
  refused_forms: [...refusedForms].slice(0, 40),
  note: "A title token's surface is the ledger's, verbatim. Its key is computed by this project's own normaliser and kept only where the route store already answers for it; a form the catalogue has never seen keeps no key and opens nothing.",
};
writeFileSync(outPath, gzipSync(Buffer.from(JSON.stringify(zone), "utf8"), { level: 9 }));
console.log(`${outPath}: ${named} title tokens named, ${refused} refused, ${already} already keyed, ` +
  `${leftToTheLedger} left to the ledger's own rule, ${takenBack} keys taken back` +
  (namedForms.size ? ` · e.g. ${[...namedForms].slice(0, 6).join(" ")}` : "") +
  (refusedForms.size ? ` · refused e.g. ${[...refusedForms].slice(0, 6).join(" ")}` : ""));
