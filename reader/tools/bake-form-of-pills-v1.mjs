#!/usr/bin/env node
// LEDGER: R
// which readings of the route catalog (R) are a pointer to another entry, and
// the English the pointer resolves to. The corpus lane classed and resolved
// them and the owner ruled on its branches; this folds its file into the one
// map the card reads.
//
// HEBREW DEFINED BY HEBREW, THE MAP THE CARD READS (the owner, on the card
// of a two-word number: "the issue is defining hebrew with hebrew"; ask 2 of
// 23 October to the corpus lane; its answers v85 and v101, and since 13
// November 2026 its reissue v175, pointer-entries-v1/zone-pills-v1.3.jsonl,
// kept in data/pointer-entries/ as the lane wrote it).
//
// A pill of the route catalog whose text is a pointer to another entry in the
// source's own words ("singular construct state form of <the target in
// Hebrew> (av).") is classed by the lane: FORM_OF (the whole reading
// points), MIXED (English of its own, and a pointer), JUDGMENT and USAGE_NOTE
// (a branch the owner has not set), NOT. What the card prints for each:
//
//   FORM_OF  The English of the entry the pointer names, with the pointer
//            beside it. Until v175 the target was found by its bare letters,
//            and the first row under them was taken: a pointer to one
//            pointed word printed whichever entry shared its letters (the
//            preposition «with» printed «A nation, a people»). The lane now
//            reads the target from the pointer's own bytes, its points, its
//            romanization, a gloss it quotes, and names the entry; the
//            English is that entry's first sense in the source's own order,
//            where the store serves a row with it.
//            Where the pointer's own words cannot tell the target's entries
//            apart, the line takes the source's own first entry (the owner,
//            13 November: «1-3. ok agree», ruling 7), where the store
//            serves a row with that entry's English.
//            Otherwise it has no resolution and the pill prints the
//            pointer's own text, as it always has for an unresolved one.
//            So does a line whose resolution is itself a reading the lane
//            classes as a pure pointer: that is no English to print.
//   MIXED    Its own text, whole, as the source wrote it (the owner, 13
//            November: «1-5. agree go ahead», ruling 5). It is not carried
//            to the page at all: a reading the map does not hold prints as
//            itself.
//   the rest Not carried: JUDGMENT and USAGE_NOTE wait on the owner's
//            branch, and NOT is no pointer.
//
// NOT DONE HERE, and counted so it can be asked: the lines whose named entry
// has an English the store serves no row with (the lane carries that English
// in the line, `not_served.english`). Printing a text the store does not
// serve is not this tool's to decide; those pills print the pointer's own
// text until the owner says.
//
// Both rulings are read from the corpus lane's own pin of them
// (data/rulings/, tools/rulings-v1.mjs), by the sha256 of the map they rule,
// and the record names each. Nothing is respelled: the pill's text stays the
// source's bytes on the card; the resolution rides beside it.
//
// REFUSED, with nothing written: a map, rule or receipt that is not the
// bytes its pin names; a ruling that is missing, or is on another file than
// this map; a line of a class this tool does not know; a text that one key
// holds both as a pointer the page resolves and as a MIXED reading (the page
// finds a pill's entry by its text, and would print over the MIXED one).
//
// Usage: node tools/bake-form-of-pills-v1.mjs [--from data/pointer-entries] [--rulings data/rulings] [--out data/form-of-pills-v1.json]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { rulingsPinned, rulingOf, cited, RULINGS_DIR } from "./rulings-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const FROM = arg("from", join(K3, "data", "pointer-entries"));
const OUT = arg("out", join(K3, "data", "form-of-pills-v1.json"));
const HOME = "reader/data/pointer-entries";   // the same folder as the record names it
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const noDot = (t) => String(t).replace(/\.$/u, "");

let pin, lines, mixedRuling, severalRuling;
try {
  pin = JSON.parse(readFileSync(join(FROM, "PIN.json"), "utf8"));
  if (pin.schema_version !== "POINTER_ENTRIES_PIN_V1" || !pin.map) throw new PinFault(`the pin names no map (${join(FROM, "PIN.json")})`);
  readPinned(join(FROM, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
  readPinned(join(FROM, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`);
  lines = readPinnedLines(join(FROM, pin.folder, pin.map.file), pin.map, `${pin.folder}/${pin.map.file}`);
  const rulings = rulingsPinned(arg("rulings", RULINGS_DIR));
  mixedRuling = rulingOf(rulings, pin.map.sha256, (r) => r.class === "MIXED" && typeof r.print === "string", "on what a MIXED reading prints");
  severalRuling = rulingOf(rulings, pin.map.sha256, (r) => r.branch === "several_branch" && "resting" in r, "on the branch of a pointer that cannot tell its entries apart");
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
const SEVERAL = severalRuling.resting;   // FIRST_IN_THE_SOURCES_ORDER, UNRESOLVED, or null while the branch rests unset
if (![null, "UNRESOLVED", "FIRST_IN_THE_SOURCES_ORDER"].includes(SEVERAL)) refuse(`the ruling rests the several branch at "${SEVERAL}", which is none of its options`);

// the texts the lane itself classes as a pure pointer, by key: a resolution that is one of them is no English (the
// lane takes an entry's first sense that the source does not tag as a pointer, and a sense can be one untagged)
const pureTexts = new Map();
for (const p of lines) if (p.class === "FORM_OF") (pureTexts.get(p.key) || pureTexts.set(p.key, new Set()).get(p.key)).add(noDot(p.text));
const isEnglish = (res) => !!res && !!res.text && !(pureTexts.get(res.key) || new Set()).has(noDot(res.text));

const byKey = {};
const mixedTexts = new Map();   // key -> the texts its MIXED readings hold
const counts = { pills: 0, keys: 0, by_class: {}, carried: 0, resolved: 0, resolved_by: { the_pointers_own_words: 0, the_sources_first_entry: 0 }, resolved_how: {},
  unresolved: 0, unresolved_why: {}, mixed_printing_their_own_words: 0, with_branch_unset: 0,
  english_the_store_does_not_serve: { what: "pointers whose named entry has an English the store serves no row with; the pill prints the pointer's own text", the_pointer_names_its_entry: 0, the_sources_first_of_several: 0 } };
for (const p of lines) {
  counts.pills += 1;
  counts.by_class[p.class] = (counts.by_class[p.class] || 0) + 1;
  const fo = p.form_of || {};
  if (p.class === "MIXED") {
    counts.mixed_printing_their_own_words += 1;
    (mixedTexts.get(p.key) || mixedTexts.set(p.key, new Set()).get(p.key)).add(noDot(p.text));
    continue;
  }
  if (p.class !== "FORM_OF") {
    if (!["JUDGMENT", "USAGE_NOTE", "NOT"].includes(p.class)) refuse(`the map holds a line of the class "${p.class}", which this tool does not know`);
    if ((p.class === "JUDGMENT" || p.class === "USAGE_NOTE") && fo.branch && fo.branch.resting == null) counts.with_branch_unset += 1;
    continue;
  }
  const first = (fo.several_branch || {}).first_in_the_sources_order || null;
  const own = fo.resolved && fo.resolved.text ? fo.resolved : null;
  const taken = !own && SEVERAL === "FIRST_IN_THE_SOURCES_ORDER" && first && first.resolved && first.resolved.text ? first.resolved : null;
  const named = own || taken;
  const res = isEnglish(named) ? named : null;
  const why = res ? undefined : named ? "THE_RESOLUTION_IS_ITSELF_A_POINTER" : (fo.resolved_why || "UNSAID");
  if (res) {
    counts.resolved += 1;
    counts.resolved_by[own ? "the_pointers_own_words" : "the_sources_first_entry"] += 1;
    counts.resolved_how[res.how] = (counts.resolved_how[res.how] || 0) + 1;
  } else {
    counts.unresolved += 1;
    counts.unresolved_why[why] = (counts.unresolved_why[why] || 0) + 1;
    if (fo.not_served && fo.not_served.english) counts.english_the_store_does_not_serve.the_pointer_names_its_entry += 1;
    else if (first && !first.resolved && first.english) counts.english_the_store_does_not_serve.the_sources_first_of_several += 1;
  }
  // the pill's own text rides in the map so the page matches a pill by
  // string equality (no hashing in the browser) and can show the target as
  // the source wrote it, cut out of the text at the lane's byte offsets
  (byKey[p.key] = byKey[p.key] || []).push({
    m: p.m_id, t: p.text, sha: p.text_sha256.slice(0, 16), class: p.class, at: Array.isArray(fo.at) ? fo.at : null,
    relation: fo.relation || "", target: fo.key || "", kind: fo.kind || "",
    resolved: res ? { key: res.key, text: res.text } : null, why,
  });
}
// a text one key holds both as a resolved pointer and as a MIXED reading: the page finds a pill's entry by its text
const both = [];
for (const [k, list] of Object.entries(byKey)) for (const e of list) if (e.resolved && (mixedTexts.get(k) || new Set()).has(noDot(e.t))) both.push(`${k} «${e.t.slice(0, 60)}»`);
if (both.length) refuse(`${both.length} text(s) stand under one key both as a pointer the page resolves and as a MIXED reading: ${both.slice(0, 3).join(" · ")}`);

counts.keys = Object.keys(byKey).length;
counts.carried = Object.values(byKey).reduce((n, l) => n + l.length, 0);   // the pills in the map: FORM_OF; a MIXED one prints as itself, the rest wait on the owner
const out = {
  schema_version: "FORM_OF_PILLS_V2",
  rule_id: "form-of-pills-rule-v1-the-pointer-stays-the-sources-bytes-the-resolution-rides-beside-it",
  what: "by route key, the pills of the 39 books whose whole text is a pointer to another entry (FORM_OF), each with its source M id, its own text (the page matches a pill by its own bytes) and the first 16 hex of its sha256, the byte range of the target inside that text, the relation as the source states it, the target key and kind, and the first English of the entry the pointer names, in the source's own order, where the store serves a row with it (else why not). A pointer that cannot tell its entries apart takes the source's own first entry, by the owner's ruling. A MIXED pill (English of its own, and a pointer) prints its own text whole, by the owner's ruling, and is not here; JUDGMENT and USAGE_NOTE pills wait on the owner's branch and are not here; NOT pills are not pointers.",
  taken_from: { relay: pin.relay, letter: pin.letter, file: `${HOME}/${pin.folder}/${pin.map.file}`, sha256: pin.map.sha256, bytes: pin.map.bytes, lines: pin.map.lines },
  rulings: {
    a_mixed_reading: { ...cited(mixedRuling), class: mixedRuling.class, print: mixedRuling.print },
    several_entries: { ...cited(severalRuling), branch: severalRuling.branch, resting: SEVERAL },
  },
  counts, keys: byKey,
};
writeFileSync(OUT, JSON.stringify(out));
console.log(`form-of pills baked from relay ${pin.relay}: ${counts.pills} pills read, by class ${JSON.stringify(counts.by_class)} · ${counts.carried} carried under ${counts.keys} keys: ${counts.resolved} resolved (${counts.resolved_by.the_pointers_own_words} by the pointer's own words, ${counts.resolved_by.the_sources_first_entry} by the source's first entry, ruling ${severalRuling.n}), ${counts.unresolved} not ${JSON.stringify(counts.unresolved_why)} · ${counts.mixed_printing_their_own_words} MIXED print their own words (ruling ${mixedRuling.n}) · ${counts.english_the_store_does_not_serve.the_pointer_names_its_entry + counts.english_the_store_does_not_serve.the_sources_first_of_several} carry an English the store does not serve · ${counts.with_branch_unset} wait on the owner's branch · ${OUT} ${JSON.stringify(out).length} bytes`);
