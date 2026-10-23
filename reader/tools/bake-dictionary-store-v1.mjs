// THE DICTIONARY STORE, SERVED (Moses, FOR-ELIJAH-v79, dictionary store
// v1.1; the owner, 2026-10-17: "simple toggle, cards unchanged, hud opens to
// a table hud", and on 2026-10-18 "lets go live with the toggle"). The lane's
// serve shards are copied byte for byte: each holds, for every LETTERS KEY
// v1.1 in it, the records with a headword of those letters (their own
// fields), the xrefs among them, and the exact readings TAHOT and MACULA give
// at the places with those letters, each with its places. Nothing is
// re-encoded, so every shard can be checked against the lane's own sha256.
// The page's index carries what a card needs to name a source and its
// licence, and the store's version, which every shard URL carries.
//
// Refused, never patched: a shard whose bytes are not the lane's, a key in
// the wrong shard, a record of a source the page has struck (the language
// admission strike, the source strikes), and a record whose source names a
// licence the page has no posture for.
//
// Usage: node tools/bake-dictionary-store-v1.mjs --from <dictionary-store-v1.N build dir>
//          [--relay <the relay that hands the build over>] [--build <the R2 prefix the shards were read from>]
// v1.2 (FOR-ELIJAH-v79.1, 22 October 2026): every place carries lang
// (HEBREW | ARAMAIC, from its own source's line) and every row langs; nothing
// else differs from v1.1 (its I10). The index's language fields ride along.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const FROM = arg("--from");
if (!FROM) { console.error("usage: --from <dictionary-store-v1.N build dir> [--relay <relay>] [--build <prefix>]"); process.exit(2); }
const RELAY = arg("--relay") || "FOR-ELIJAH-v79.md";
const BUILD = arg("--build") || "corpus-lane-builds/moses-dictionary-store-v1/v1.1/build/dictionary-store-v1.1/serve/shards/";
// The store is written beside the served one and put in its place only when
// whole: a refused bake leaves the served store as it was.
const OUT = new URL("../data/dictionary-store/", import.meta.url).pathname;
const TMP = OUT.replace(/\/$/u, "") + ".tmp/";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const fail = (m) => { console.error(`REFUSED: ${m}`); rmSync(TMP, { recursive: true, force: true }); process.exit(1); };

const dix = JSON.parse(readFileSync(join(FROM, "index.json"), "utf8"));
const route = JSON.parse(readFileSync(new URL("../data/route-store/index.json", import.meta.url), "utf8"));
const postures = JSON.parse(readFileSync(new URL("../data/license-postures-v1.json", import.meta.url), "utf8")).postures;
const piece = JSON.parse(readFileSync(new URL("../data/piece-store/index.json", import.meta.url), "utf8"));
const struck = new Set([...((route.language_admission || {}).struck_m_ids || []), ...((route.source_strikes || {}).struck_m_ids || [])]);

// the lane's own list of its serve files, with their bytes and sha256
const listed = new Map((dix.files || []).filter((f) => /^serve\/shards\//u.test(f.path)).map((f) => [f.path.replace(/^serve\/shards\//u, ""), f]));
const names = readdirSync(join(FROM, "serve/shards")).filter((f) => /^[0-9a-f]{2}\.json\.gz$/u.test(f)).sort();
if (names.length !== 256 || listed.size !== 256) fail(`256 shards expected: ${names.length} on disk, ${listed.size} listed`);

rmSync(TMP, { recursive: true, force: true });
mkdirSync(join(TMP, "shards"), { recursive: true });
const counts = { shards: 0, keys: 0, records: 0, readings: 0, places: 0, bytes: 0 };
const usedM = new Map();
const sums = [];
for (const name of names) {
  const buf = readFileSync(join(FROM, "serve/shards", name));
  const want = listed.get(name);
  if (!want || want.bytes !== buf.length || want.sha256 !== sha(buf)) fail(`${name} is not the lane's bytes`);
  const hex = name.slice(0, 2);
  const obj = JSON.parse(gunzipSync(buf).toString("utf8"));
  for (const [key, v] of Object.entries(obj)) {
    if (!key || sha(Buffer.from(key, "utf8")).slice(0, 2) !== hex) fail(`key ${JSON.stringify(key)} stands in shard ${hex}`);
    counts.keys += 1;
    for (const r of v.records) {
      if (struck.has(r.m)) fail(`a record of ${r.m}, a source the page has struck, stands under ${JSON.stringify(key)}`);
      usedM.set(r.m, (usedM.get(r.m) || 0) + 1);
      counts.records += 1;
    }
    for (const g of v.readings) { counts.readings += 1; counts.places += g.places.length; }
  }
  writeFileSync(join(TMP, "shards", `${hex}.bin`), buf);
  sums.push(want.sha256);
  counts.shards += 1; counts.bytes += buf.length;
}

// every source a shard names, with the licence the page can name
const m_sources = {};
for (const m of [...usedM.keys()].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))) {
  const s = dix.m_sources[m];
  if (!s) fail(`${m} has no line in the store's m_sources`);
  const lic = (s.licence || {}).short_label;
  if (!lic || !postures[lic]) fail(`${m} names a licence the page has no posture for: ${lic}`);
  m_sources[m] = { key: s.key, label: s.label, licence: lic, records_served: usedM.get(m) };
}
const readings_sources = {};
for (const [src, m] of [["tahot", "PIECE:TAHOT"], ["macula", "PIECE:MACULA"]]) {
  const s = (piece.m_sources || {})[m];
  if (!s || !postures[s.licensePosture]) fail(`${m} has no licence the page can name`);
  readings_sources[src] = { m, key: s.key, label: s.label, licence: s.licensePosture };
}

const index = {
  rule: "dictionary-store-serve-v1-the-lanes-shards-byte-for-byte-a-card-reads-one-key",
  from: { relay: RELAY, store: dix.store, date: dix.date, build: BUILD, version_of: dix.version_of || null },
  standing_rule: dix.standing_rule,
  letters_key: dix.letters_key,
  exact_reading: dix.exact_reading,
  page_numbering: dix.page_numbering,
  served_version: dix.served_version,
  shard_rule: (dix.serve || {}).shard_rule,
  key_rule: (dix.serve || {}).key_rule,
  // v1.2: the language at a place, as the lane defines and reads it
  language_at_a_place: dix.language_at_a_place || null,
  language_rules: dix.language_rules || null,
  store_version: sha(Buffer.from(sums.join("\n"))).slice(0, 12),
  m_sources,
  readings_sources,
  counts,
};
writeFileSync(join(TMP, "index.json"), JSON.stringify(index, null, 1) + "\n");
rmSync(OUT, { recursive: true, force: true });
renameSync(TMP, OUT);
console.log(`dictionary store baked: ${counts.shards} shards, ${counts.keys} keys, ${counts.records} records, ${counts.readings} readings at ${counts.places} places, ${(counts.bytes / 1e6).toFixed(1)} MB, ${usedM.size} sources, store_version ${index.store_version}`);
