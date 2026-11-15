#!/usr/bin/env node
// LEDGER: R
// which readings of the route catalog (R) are a pointer to another entry, and
// the English the pointer resolves to. The corpus lane classed and resolved
// them and the owner ruled on its branches; this folds its map into the one
// map the card reads.
//
// HEBREW DEFINED BY HEBREW, THE MAP THE CARD READS (the owner, on the card
// of a two-word number: "the issue is defining hebrew with hebrew"; ask 2 of
// 23 October to the corpus lane; its answers v85 and v101, its reissue v175
// of 13 November 2026, map v1.3, and its v191 of 14 November, map v1.4, the
// lines of v1.3 that v1.4 changes; kept in data/pointer-entries/ as the lane
// wrote them and laid together by tools/pointer-map-v1.mjs).
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
//            English is that entry's first sense in the source's own order.
//            For the pointer's own target, the first of:
//            1. a row the store serves with that English, of the pointer's
//               own source (since v1.4 the lane looks for it at the key it
//               followed to, the key the pointer names and the word's own
//               key, in that order);
//            2. where the pointer's own words cannot tell the target's
//               entries apart, the source's own first entry (the owner, 13
//               November: «1-3. ok agree», ruling 7), where the store serves
//               a row with that entry's English;
//            3. otherwise the English the lane's map carries for that entry
//               from the source's own file, a ruled print, on either branch
//               (the entry named, or ruling 7's first where the ruling rests
//               there). The owner, 14 November, of the 458 pure pointers
//               whose English no row of their source serves: «just go with
//               your recommendations its fine», where the recommendation
//               was to print the English the corpus lane's map carries
//               (call 8). The ruled print is the pointer's own source's
//               English (the lane writes the pointer's own m on it, and this
//               holds it), so the pill stays the source's row and its credit.
//            Otherwise it has no resolution and the pill prints the
//            pointer's own text, as it always has for an unresolved one.
//            So does a line whose resolution is itself the text of a
//            reading the lane classes as a pure pointer: under the
//            resolution's own key for a served row, under any key for a
//            ruled print, which stands under none.
//   MIXED    Its own text, whole, as the source wrote it (the owner, 13
//            November: «1-5. agree go ahead», ruling 5). It is not carried
//            to the page at all: a reading the map does not hold prints as
//            itself.
//   the rest Not carried: JUDGMENT and USAGE_NOTE wait on the owner's
//            branch, and NOT is no pointer.
//
// A POINTER THAT PRINTS A NAME'S ENGLISH CARRIES THE NAME'S MARK (names-gate-
// rule-v1; the review of 14 November 2026). Where the row a pointer resolves
// to is one its own source gives as a name (the corpus lane's list of name
// rows, data/names/, the mark the names gate reads off the row itself), the
// pill prints a name: «Sukkot» for the pointer at sukkot, «Huram» at hiram.
// At a place that is not a name the names gate withholds that row, so the
// pill that prints its English is withheld there too. The row is found in
// the list as the list tells rows apart, by its key, its rank, its m id and
// the first 16 hex of the sha256 of its text, all as the lane's map names
// the row; the resolution then carries name: 1, and the page gates it. A
// ruled print stands on no served row and carries no such mark.
//
// Both rulings are read from the corpus lane's own pin of them
// (data/rulings/, tools/rulings-v1.mjs). They name map v1.3 by its sha256,
// and v1.4's rule keeps v1.3 standing in every part it does not name, so
// they are looked up by the sha256 of the map the first relay sent; the
// record names each, and every file the map was laid from. Nothing is
// respelled: the pill's text stays the source's bytes on the card; the
// resolution rides beside it.
//
// REFUSED, with nothing written: a map, rule or receipt that is not the
// bytes its pin names, or lines that do not lay together as the pin says
// (tools/pointer-map-v1.mjs); a ruling that is missing, or is on another file
// than the map; a line of a class this tool does not know; a ruled print, on
// any slot of any line, of another rule than the lane's, credited to another
// m id than its line's, that does not say the store does not serve it, that
// fills a branch it does not have, or that stands beside a served resolution
// of its own slot; a text that one key holds both as a pointer the page
// resolves and as a MIXED reading (the page finds a pill's entry by its
// text, and would print over the MIXED one); a list of name rows that is not
// the bytes its pin names.
//
// Usage: node tools/bake-form-of-pills-v1.mjs [--from data/pointer-entries] [--rulings data/rulings] [--names data/names] [--out data/form-of-pills-v1.json]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PinFault, readPinnedLines, sha256Of } from "./pinned-v1.mjs";
import { rulingsPinned, rulingOf, cited, RULINGS_DIR } from "./rulings-v1.mjs";
import { pointerMap } from "./pointer-map-v1.mjs";
import { NAMES_GATE_RULE_ID } from "./names-gate-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const FROM = arg("from", join(K3, "data", "pointer-entries"));
const OUT = arg("out", join(K3, "data", "form-of-pills-v1.json"));
const NAMES = arg("names", join(K3, "data", "names"));
const NAMES_HOME = "reader/data/names";   // the same folder as a record names it
const RULE_ID = "form-of-pills-rule-v2-the-pointer-stays-the-sources-bytes-the-resolution-rides-beside-it-a-pure-pointer-prints-the-english-the-lanes-map-carries";
const RULED_PRINT_RULE = "pointer-map-v1.4";   // the lane's own name for the rule its ruled prints are written under (RULE.md v1.4 §5)
const refuse = (why) => { console.error(`REFUSED · ${why}`); process.exit(1); };
const noDot = (t) => String(t).replace(/\.$/u, "");

let map, mixedRuling, severalRuling, namesPin, nameRows;
try {
  map = pointerMap(FROM);
  const rulings = rulingsPinned(arg("rulings", RULINGS_DIR));
  mixedRuling = rulingOf(rulings, map.base_sha256, (r) => r.class === "MIXED" && typeof r.print === "string", "on what a MIXED reading prints");
  severalRuling = rulingOf(rulings, map.base_sha256, (r) => r.branch === "several_branch" && "resting" in r, "on the branch of a pointer that cannot tell its entries apart");
  // the names gate's list of the rows their own source gives as a name, as the lane wrote it
  namesPin = JSON.parse(readFileSync(join(NAMES, "PIN.json"), "utf8"));
  if (namesPin.schema_version !== "NAMES_PIN_V1" || !namesPin.name_rows) throw new PinFault(`the names pin names no list of name rows (${join(NAMES, "PIN.json")})`);
  nameRows = readPinnedLines(join(NAMES, namesPin.folder, namesPin.name_rows.file), namesPin.name_rows, `${namesPin.folder}/${namesPin.name_rows.file}`);
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
// a served row as the list tells rows apart: its key, rank, m id and the first 16 hex of the sha256 of its text
const rowId = (key, rank, m, text) => [key, rank, m, sha256Of(Buffer.from(String(text), "utf8")).slice(0, 16)].join("\u0001");
const NAME_ROWS = new Set(nameRows.map((l) => [l.k, l.rank, l.m, l.sha].join("\u0001")));
const isNameRow = (r) => !!(r && r.key && NAME_ROWS.has(rowId(r.key, r.rank, r.m, r.text)));
const { lines } = map;
const SEVERAL = severalRuling.resting;   // FIRST_IN_THE_SOURCES_ORDER, UNRESOLVED, or null while the branch rests unset
if (![null, "UNRESOLVED", "FIRST_IN_THE_SOURCES_ORDER"].includes(SEVERAL)) refuse(`the ruling rests the several branch at "${SEVERAL}", which is none of its options`);
const TAKES_FIRST = SEVERAL === "FIRST_IN_THE_SOURCES_ORDER";

// every ruled print of the map, on every slot (the line's own target and each further one), is held to the rule's
// own terms, whether or not this bake prints it
const served = (r) => (r && r.text ? r : null);
const firstOf = (slot) => (slot.several_branch || {}).first_in_the_sources_order || null;
{
  const faults = [];
  for (const [i, p] of lines.entries()) {
    const fo = p.form_of || {};
    for (const slot of [fo, ...(Array.isArray(fo.also) ? fo.also : [])]) {
      const rp = slot.ruled_print;
      if (!rp) continue;
      const first = firstOf(slot);
      const why = rp.rule !== RULED_PRINT_RULE ? `its rule is "${rp.rule}"`
        : rp.m !== p.m_id ? `it is credited to ${rp.m}, its line to ${p.m_id}`
          : rp.served !== false ? "it does not say the store does not serve it"
            : typeof rp.text !== "string" || !rp.text ? "it has no text"
              : !(rp.fills === "resolved" || (rp.fills === "first_in_the_sources_order" && first)) ? `it fills "${rp.fills}", which its slot does not have`
                : served(slot.resolved) || (first && served(first.resolved)) ? "its slot has a served resolution beside it" : null;
      if (why) faults.push(`line ${i + 1} (${p.key}, ${p.m_id}): ${why}`);
    }
  }
  if (faults.length) refuse(`${faults.length} ruled print(s) break the rule's own terms: ${faults.slice(0, 3).join(" · ")}`);
}

// the texts the lane itself classes as a pure pointer: a resolution that is one of them is no English (the lane takes
// an entry's first sense that the source does not tag as a pointer, and a sense can be one untagged). A served row
// stands under its key and is held to that key's pointers; a ruled print stands under none and is held to them all
const pureTexts = new Map(), pureAnywhere = new Set();
for (const p of lines) if (p.class === "FORM_OF") { (pureTexts.get(p.key) || pureTexts.set(p.key, new Set()).get(p.key)).add(noDot(p.text)); pureAnywhere.add(noDot(p.text)); }
const isEnglish = (res) => !!res && !!res.text && !(res.ruled ? pureAnywhere : pureTexts.get(res.key) || new Set()).has(noDot(res.text));

const byKey = {};
const mixedTexts = new Map();   // key -> the texts its MIXED readings hold
const counts = { pills: 0, keys: 0, by_class: {}, carried: 0, resolved: 0, resolved_by: { the_pointers_own_words: 0, the_sources_first_entry: 0, the_ruled_print: 0 }, resolved_how: {},
  unresolved: 0, unresolved_why: {}, mixed_printing_their_own_words: 0, with_branch_unset: 0,
  resolved_to_a_name: { what: "pointers resolved to a served row its own source gives as a name (the names gate's list): the page withholds their pill where the place is not a name", pointers: 0 },
  ruled_prints: { what: "pointers that print the English the lane's map carries for their entry, which the store serves no row of their source with: by the branch they fill", resolved: 0, first_in_the_sources_order: 0 } };
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
  // the pointer's own target only, in the order of the head of this file
  const first = firstOf(fo), rp = fo.ruled_print || null;
  const own = served(fo.resolved);
  const taken = !own && TAKES_FIRST && first ? served(first.resolved) : null;
  const ruled = !own && !taken && rp && (rp.fills === "resolved" || TAKES_FIRST) ? rp : null;
  const named = own || taken || (ruled && { key: null, text: ruled.text, how: ruled.how, ruled: true });
  const res = isEnglish(named) ? named : null;
  const why = res ? undefined : named ? "THE_RESOLUTION_IS_ITSELF_A_POINTER" : (fo.resolved_why || "UNSAID");
  // the names gate's mark, where the served row resolved to is a name's
  const aName = !!res && !res.ruled && isNameRow(res);
  if (aName) counts.resolved_to_a_name.pointers += 1;
  if (res) {
    counts.resolved += 1;
    counts.resolved_by[own ? "the_pointers_own_words" : taken ? "the_sources_first_entry" : "the_ruled_print"] += 1;
    counts.resolved_how[res.how] = (counts.resolved_how[res.how] || 0) + 1;
    if (res.ruled) counts.ruled_prints[ruled.fills] += 1;
  } else {
    counts.unresolved += 1;
    counts.unresolved_why[why] = (counts.unresolved_why[why] || 0) + 1;
  }
  // the pill's own text rides in the map so the page matches a pill by
  // string equality (no hashing in the browser) and can show the target as
  // the source wrote it, cut out of the text at the lane's byte offsets
  (byKey[p.key] = byKey[p.key] || []).push({
    m: p.m_id, t: p.text, sha: p.text_sha256.slice(0, 16), class: p.class, at: Array.isArray(fo.at) ? fo.at : null,
    relation: fo.relation || "", target: fo.key || "", kind: fo.kind || "",
    resolved: !res ? null : res.ruled ? { key: null, text: res.text, ruled: true } : { key: res.key, text: res.text, ...(aName ? { name: 1 } : {}) }, why,
  });
}
// a text one key holds both as a resolved pointer and as a MIXED reading: the page finds a pill's entry by its text
const both = [];
for (const [k, list] of Object.entries(byKey)) for (const e of list) if (e.resolved && (mixedTexts.get(k) || new Set()).has(noDot(e.t))) both.push(`${k} «${e.t.slice(0, 60)}»`);
if (both.length) refuse(`${both.length} text(s) stand under one key both as a pointer the page resolves and as a MIXED reading: ${both.slice(0, 3).join(" · ")}`);

counts.keys = Object.keys(byKey).length;
counts.carried = Object.values(byKey).reduce((n, l) => n + l.length, 0);   // the pills in the map: FORM_OF; a MIXED one prints as itself, the rest wait on the owner
const out = {
  schema_version: "FORM_OF_PILLS_V4",
  rule_id: RULE_ID,
  what: "by route key, the pills of the 39 books whose whole text is a pointer to another entry (FORM_OF), each with its source M id, its own text (the page matches a pill by its own bytes) and the first 16 hex of its sha256, the byte range of the target inside that text, the relation as the source states it, the target key and kind, and the first English of the entry the pointer names, in the source's own order (else why not): a row of the pointer's own source the store serves with it (resolved.key, the key it stands under), or, where the store serves none, the English the corpus lane's map carries for that entry from the source's own file, by the owner's answer (a ruled print: resolved.ruled, and no key). A pointer that cannot tell its entries apart takes the source's own first entry, by the owner's ruling. Where the served row resolved to is one its own source gives as a name (the corpus lane's list of name rows, the names gate's mark), resolved.name is 1, and the page withholds the pill where the place is not a name, as it withholds that row; a ruled print stands on no row and carries no such mark. A MIXED pill (English of its own, and a pointer) prints its own text whole, by the owner's ruling, and is not here; JUDGMENT and USAGE_NOTE pills wait on the owner's branch and are not here; NOT pills are not pointers.",
  taken_from: {
    what: `the corpus lane's map as its relays lay it (tools/pointer-map-v1.mjs): ${map.relays.map((r) => r.relay).join(", then ")}`,
    relays: map.relays.map((r) => ({ relay: r.relay, letter: r.letter, ...(r.letter_sha256 ? { letter_sha256: r.letter_sha256 } : {}), ...r.file })),
    sha256: map.assembled_sha256, lines: lines.length,
  },
  names: {
    rule: NAMES_GATE_RULE_ID,
    what: "the rows their own source gives as a name, as the corpus lane listed them for the names gate; a resolution to one of them carries name: 1",
    pin: `${NAMES_HOME}/PIN.json`, relay: namesPin.relay, letter: namesPin.letter,
    list: { file: `${NAMES_HOME}/${namesPin.folder}/${namesPin.name_rows.file}`, bytes: namesPin.name_rows.bytes, sha256: namesPin.name_rows.sha256, lines: nameRows.length },
  },
  rulings: {
    looked_up_by: { sha256: map.base_sha256, why: "the rulings name the map the first relay sent, and each later relay's rule keeps that map standing in every part it does not name" },
    a_mixed_reading: { ...cited(mixedRuling), class: mixedRuling.class, print: mixedRuling.print },
    several_entries: { ...cited(severalRuling), branch: severalRuling.branch, resting: SEVERAL },
  },
  counts, keys: byKey,
};
writeFileSync(OUT, JSON.stringify(out));
const r = counts.resolved_by;
console.log(`form-of pills baked from relays ${map.relays.map((x) => x.relay).join(" + ")} (the map as laid ${map.assembled_sha256.slice(0, 12)}): ${counts.pills} pills read, by class ${JSON.stringify(counts.by_class)} · ${counts.carried} carried under ${counts.keys} keys: ${counts.resolved} resolved (${r.the_pointers_own_words} by the pointer's own words, ${r.the_sources_first_entry} by the source's first entry, ruling ${severalRuling.n}, ${r.the_ruled_print} by a ruled print: ${counts.ruled_prints.resolved} of the entry named, ${counts.ruled_prints.first_in_the_sources_order} of the source's first entry), ${counts.unresolved} not ${JSON.stringify(counts.unresolved_why)} · ${counts.resolved_to_a_name.pointers} resolved to a row its source gives as a name (names list ${namesPin.relay}, ${nameRows.length} rows) · ${counts.mixed_printing_their_own_words} MIXED print their own words (ruling ${mixedRuling.n}) · ${counts.with_branch_unset} wait on the owner's branch · ${OUT} ${JSON.stringify(out).length} bytes`);
