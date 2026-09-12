#!/usr/bin/env node
// Synthesis lane · hoh-sidecar-rule-v1-a-hebrew-definition-is-served-by-volume-and-quotes-only-from-the-floor
//
// Hebrew on Hebrew: a dictionary that defines a Hebrew word in Hebrew, hung
// beside a book zone the way a commentary is, so the card a word opens can
// also show what the dictionary says about it — laid out like the verse,
// Hebrew on top and its English underneath, every word answering from the
// same catalog as the page.
//
// The first such dictionary is Ben Yehuda's (data/ben-yehuda-posture-v1.json
// is its posture record, and tools/BEN-YEHUDA-PIPELINE-v1.md the road its
// entries take from the corpus lane to this tool). Nothing here is his; this
// tool reads a delivered entries file and a posture record and writes what
// they together permit. It has no opinion about any word.
//
// The rule, declared before output:
//   1. An entry is served only from a volume the posture record declares
//      served. An entry from any other volume is emitted HELD, by volume,
//      with its headword and no text — never dropped and never guessed at.
//   2. An entry Ben Yehuda marked with an asterisk — a word he coined or
//      reconstructed — is emitted HELD, with the reason, and no text. The
//      owner's ruling: no coinage is served, anywhere, ever.
//   3. The floor is the floor. A headword past the last headword the served
//      volumes reach cannot be in a served volume; an entry that says
//      otherwise is a refusal, because the delivery and the record disagree
//      and this tool will not pick.
//   4. Strata are served by their type, as the corpus lane typed them at
//      delivery: quotes (the ancient citations) and prose (his own Hebrew)
//      are emitted as words with exact keys; foreign glosses and comparanda
//      are counted and never emitted. A stratum of an unknown type is a
//      refusal, not a guess.
//   5. The sidecar is per zone: it carries the entries the zone's own words
//      can ask for — under a word's headword (the look-up-by projection) or
//      under its form — and its gloss is the store projected over the words
//      the emitted strata contain, with the M that licenses each reading.
//   6. Until the posture record says a delivery has landed, a sidecar may
//      stand only beside a fixture. The check holds that line; this tool
//      says so on the file.
//
// Delivered row (JSONL, one entry per line):
//   { "headword": "<pointed headword>", "headword_key": "<exact K of it>",
//     "volume": 3, "asterisk": false,
//     "strata": [ { "kind": "quote"|"prose"|"foreign"|"comparandum",
//                   "text": "<as printed>", "ref": "<citation, if a quote>",
//                   "lang": "<for foreign/comparandum>" } ] }
//
// Run: node tools/build-hoh-sidecar-v1.mjs --zone <slug> --entries <file.jsonl[.gz]>
//        --stamp YYYY-MM-DD [--posture data/ben-yehuda-posture-v1.json]
//        [--store data/route-store] [--out data/zones/<slug>.hoh.bin]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { exactK } from "./k-normalization-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { glossMFor } from "./gloss-m-v1.mjs";

export const RULE_ID = "hoh-sidecar-rule-v1-a-hebrew-definition-is-served-by-volume-and-quotes-only-from-the-floor";
export const SCHEMA = "ZONE_HOH_V1";
export const HELD = Object.freeze({ VOLUME_NOT_DECLARED: "VOLUME_NOT_DECLARED", ASTERISK_PENDING_READ: "ASTERISK_PENDING_READ" });
export const STRATA_SERVED = Object.freeze(["quote", "prose"]);
export const STRATA_WITHHELD = Object.freeze(["foreign", "comparandum"]);

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");

const args = process.argv.slice(2);
const arg = (f, d = null) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const slug = arg("--zone"), entriesPath = arg("--entries"), stamp = arg("--stamp");
const posturePath = arg("--posture", join(K3, "data", "ben-yehuda-posture-v1.json"));
const storeDir = arg("--store", join(K3, "data", "route-store"));
if (!slug || !entriesPath || !stamp) { console.error("usage: --zone <slug> --entries <jsonl[.gz]> --stamp YYYY-MM-DD [--posture …] [--store …] [--out …]"); process.exit(2); }
const outPath = arg("--out", join(ZONES, `${slug}.hoh.bin`));

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const refuse = (code, detail) => { console.error(`REFUSED ${code}: ${detail}`); process.exit(1); };

// ---- the inputs, each with its hash ---------------------------------------
const zonePath = join(ZONES, `${slug}.bin`);
if (!existsSync(zonePath)) refuse("NO_ZONE", zonePath);
const zoneRaw = readFileSync(zonePath);
const zone = JSON.parse(gunzipSync(zoneRaw).toString("utf8"));
const postureRaw = readFileSync(posturePath);
const posture = JSON.parse(postureRaw.toString("utf8"));
if (posture.schema_version !== "BEN_YEHUDA_POSTURE_V1") refuse("POSTURE_UNREAD", `${posturePath} is ${posture.schema_version}`);
const entriesRaw = readFileSync(entriesPath);
const entriesText = entriesPath.endsWith(".gz") ? gunzipSync(entriesRaw).toString("utf8") : entriesRaw.toString("utf8");
const rows = entriesText.split("\n").filter(Boolean).map((l, i) => { try { return JSON.parse(l); } catch { return refuse("ENTRY_UNREAD", `line ${i + 1}`); } });

const served = new Set(posture.served_volumes || []);
const floor = posture.floor || {};
const pastLetters = new Set(floor.letters_past_the_floor || []);
const floorKey = String(floor.ends_at_headword_key || "");
// a headword is past the floor when its first letter is one the served
// volumes never reach, or when it sorts after the last headword they do
// reach under that letter (code-point order is alphabet order for Hebrew)
const pastTheFloor = (key) => {
  const first = key[0];
  if (pastLetters.has(first)) return true;
  return floorKey && first === floorKey[0] && key > floorKey;
};

// ---- rule 5 · what this zone's words can ask for -------------------------
const askable = new Set();
const joinStats = { words_on: 0, with_headword: 0, past_the_floor: 0 };
for (const sec of zone.sections || []) for (const w of sec.words || []) {
  if (w.mark) continue;
  const ks = w.w ? w.w.map((r) => r.k) : (w.k ? [w.k] : []);
  if (!ks.length) continue;
  joinStats.words_on += 1;
  for (const k of ks) if (k) askable.add(k);
  if (w.h) { joinStats.with_headword += 1; askable.add(w.h); }
  if ((w.h || ks[0]) && pastTheFloor(w.h || ks[0])) joinStats.past_the_floor += 1;
}

// ---- rules 1 to 4 · every delivered entry ---------------------------------
const entries = {};
const counts = { entries_read: rows.length, entries_on_this_zone: 0, entries_not_on_this_zone: 0, served: 0,
  held_by_volume: 0, held_by_asterisk: 0, strata_emitted: { quote: 0, prose: 0 }, strata_withheld: { foreign: 0, comparandum: 0 },
  words: 0, glossed_words: 0 };
const wordsOf = (text) => String(text).split(/\s+/u).filter(Boolean).map((s) => ({ s, k: exactK(s) })).filter((w) => w.k);
const keysUsed = new Set();
for (const r of rows) {
  const headword = String(r.headword || "");
  if (!headword) refuse("ENTRY_WITHOUT_HEADWORD", JSON.stringify(r).slice(0, 120));
  const key = exactK(headword);
  if (r.headword_key && r.headword_key !== key) refuse("ENTRY_KEY_DISAGREES", `${headword}: delivered ${r.headword_key}, the K rule says ${key}`);
  if (!askable.has(key)) { counts.entries_not_on_this_zone += 1; continue; }
  counts.entries_on_this_zone += 1;
  const volume = Number(r.volume);
  if (!Number.isInteger(volume) || volume < 1) refuse("ENTRY_WITHOUT_VOLUME", headword);
  const held = [];
  if (!served.has(volume)) held.push(HELD.VOLUME_NOT_DECLARED);
  if (r.asterisk === true) held.push(HELD.ASTERISK_PENDING_READ);
  // rule 3: a served volume cannot hold a headword past the floor
  if (served.has(volume) && pastTheFloor(key)) refuse("ENTRY_PAST_THE_FLOOR_CLAIMS_A_SERVED_VOLUME", `${headword} (volume ${volume}) is past ${floorKey} — the delivery and the posture record disagree`);
  if (entries[key]) refuse("ENTRY_DUPLICATED", `${headword} delivered twice`);
  const entry = { headword, key, volume, asterisk: r.asterisk === true, served: held.length === 0, held: held.length ? held : null, strata: [] };
  for (const s of r.strata || []) {
    const kind = String(s.kind || "");
    if (STRATA_WITHHELD.includes(kind)) { counts.strata_withheld[kind] += 1; continue; }
    if (!STRATA_SERVED.includes(kind)) refuse("STRATUM_KIND_UNKNOWN", `${headword}: ${JSON.stringify(kind)}`);
    if (held.length) continue;                       // held: the headword prints, the text does not
    const words = wordsOf(s.text);
    if (!words.length) refuse("STRATUM_WITHOUT_TEXT", `${headword}: a ${kind} stratum with nothing in it`);
    for (const w of words) keysUsed.add(w.k);
    counts.strata_emitted[kind] += 1; counts.words += words.length;
    entry.strata.push({ kind, words, text: String(s.text), ...(s.ref ? { ref: String(s.ref) } : {}) });
  }
  if (held.length) counts[held.includes(HELD.ASTERISK_PENDING_READ) ? "held_by_asterisk" : "held_by_volume"] += 1;
  else counts.served += 1;
  entries[key] = entry;
}

// ---- rule 5 · the store, projected over the strata's own words ------------
const store = openRouteStore(storeDir);
const { table: gloss, counts: glossCounts, sha256: glossSha } = store.tableFor([...keysUsed]);
const { gloss_m: glossM } = glossMFor(store, gloss);
// the component layer, when the sealed template is at hand (--spans): the
// strata's own keys sliced from it and interned as build-zone interns them;
// without the template the sidecar says what it awaits, in its own file
const spansPath = arg("--spans");
const spanRoles = [], spanRules = [], spanConf = [], spans = {};
let spanLayer;
if (spansPath) {
  const { readSpanSlice, SPAN_RULE_ID } = await import("./span-slice-v1.mjs");
  const slice = await readSpanSlice(spansPath, keysUsed);
  const intern = (arr, v) => { let i = arr.indexOf(v); if (i < 0) { i = arr.length; arr.push(v); } return i; };
  for (const [k, sp] of slice.spans) spans[k] = [sp.s, sp.r.map((r) => intern(spanRoles, r)), intern(spanRules, sp.rule), intern(spanConf, sp.conf)];
  spanLayer = { rule: SPAN_RULE_ID, source: slice.source, rows_scanned: slice.scanned, forms_with_a_component_system: Object.keys(spans).length, held_for_a_double_answer: slice.held };
} else {
  spanLayer = { awaits: "the sealed COMPspan template (pass --spans <w-to-compspan-template>.csv.gz); the strata's words open on the card with whole forms only until then", status: "withheld: template not supplied" };
}
for (const e of Object.values(entries)) for (const s of e.strata) for (const w of s.words) if (gloss[w.k]) counts.glossed_words += 1;

// ---- how the zone's words fare against what was delivered ----------------
joinStats.with_entry_under_headword = 0; joinStats.with_entry_under_form = 0; joinStats.without_entry = 0;
for (const sec of zone.sections || []) for (const w of sec.words || []) {
  if (w.mark) continue;
  const ks = w.w ? w.w.map((r) => r.k) : (w.k ? [w.k] : []);
  if (!ks.length) continue;
  if (w.h && entries[w.h]) joinStats.with_entry_under_headword += 1;
  else if (ks.some((k) => entries[k])) joinStats.with_entry_under_form += 1;
  else joinStats.without_entry += 1;
}

const baseWorkId = (String((zone.work_receipts || {}).b_n || "").match(/work_id=([^\s·]+)/u) || [])[1] || slug;
const sidecar = {
  schema_version: SCHEMA,
  rule_id: RULE_ID,
  work: baseWorkId, work_title: zone.work || slug, base_zone: slug,
  source: {
    work: posture.work, posture_record: "data/ben-yehuda-posture-v1.json", posture_sha256: sha256(postureRaw),
    delivered: posture.delivery ? posture.delivery.delivered === true : false,
    entries: { path: entriesPath.split("/").pop(), sha256: sha256(entriesRaw), rows: rows.length },
    served_volumes: [...served].sort((a, b) => a - b),
    floor: { volume: floor.volume, ends_at_headword_key: floorKey, letters_past_the_floor: [...pastLetters] },
    // the ruling the served volumes stand on, as the record carries it — the
    // card prints this and nothing stronger; it is not a licence name
    ruling: posture.ruling ? { by: posture.ruling.by, on: posture.ruling.on, said: posture.ruling.said } : null,
  },
  emitted_from: {
    zone: { path: `data/zones/${slug}.bin`, sha256: sha256(zoneRaw) },
    join: { rule: "an entry is on this zone when its headword key is a word's headword (h, the look-up-by projection) or a word's form key (k); the card asks under the headword first, then the form", ...joinStats },
    posture: { rule: "served only from a declared volume; asterisk entries held; a headword past the floor in a served volume is a refusal", served_volumes: [...served].sort((a, b) => a - b) },
    strata: { rule: "served by type as delivered: quote and prose emitted as keyed words; foreign and comparandum counted, never emitted" },
    gloss_layer: { rule: "the route store projected over the emitted strata's own keys, with gloss_m from the same store", forms: Object.keys(gloss).length, licensed: Object.keys(glossM).length, gloss_table_sha256: glossSha, ...glossCounts },
    span_layer: spanLayer,
    standing: sidecar_standing(posture),
    build: { builder: "tools/build-hoh-sidecar-v1.mjs", single_pass: true, emitted: stamp },
  },
  counts, entries, span_roles: spanRoles, span_rules: spanRules, span_conf: spanConf, spans, gloss, gloss_m: glossM,
};
function sidecar_standing(p) {
  return p.delivery && p.delivery.delivered === true
    ? "delivered: the posture record says the corpus lane's delivery has landed, so this sidecar may stand beside a served zone"
    : "not delivered: the posture record says nothing has landed, so this sidecar may stand only beside a fixture (rule 6; check-hoh-sidecar-v1 holds the line)";
}
writeFileSync(outPath, gzipSync(Buffer.from(JSON.stringify(sidecar)), { level: 9 }));
console.log(`${outPath} · ${counts.entries_on_this_zone} of ${rows.length} entries on ${slug} · ${counts.served} served, ${counts.held_by_volume} held by volume, ${counts.held_by_asterisk} held by asterisk` +
  ` · strata: ${counts.strata_emitted.quote} quotes + ${counts.strata_emitted.prose} prose emitted, ${counts.strata_withheld.foreign} foreign + ${counts.strata_withheld.comparandum} comparanda withheld` +
  ` · ${counts.words} words, ${counts.glossed_words} glossed`);
console.log(`  zone: ${joinStats.words_on.toLocaleString()} words · ${joinStats.with_headword.toLocaleString()} carry a headword · ${joinStats.with_entry_under_headword} answer under it, ${joinStats.with_entry_under_form} under their form · ${joinStats.past_the_floor.toLocaleString()} past the floor · ${joinStats.without_entry.toLocaleString()} without an entry`);
