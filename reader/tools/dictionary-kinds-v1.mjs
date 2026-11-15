// Synthesis lane · dictionary-kinds-rule-v1-each-dictionary-is-filed-by-what-it-says-it-is-and-a-kind-or-a-category-it-marks-in-its-own-data-may-rest-shut
// GUARDS: dictionary-kinds-rule-v1-each-dictionary-is-filed-by-what-it-says-it-is-and-a-kind-or-a-category-it-marks-in-its-own-data-may-rest-shut
// LEDGER: -
// no frame letter. The rule's own functions: they read the record of what
// each dictionary is, a row of the store and a zone, and write nothing.
//
// EACH DICTIONARY IS A CATEGORY. A country called Peru stood on the card of
// the verb "be fruitful", and the owner answered the card with its class
// (15 November 2026): «we need to think in terms of each dictionary as a
// category», and of the names one dictionary marks, «wouldnt the wiser
// thing be to doubt all wiktionary "name" categories?». A card is never
// edited. A ruling falls on a dictionary, or on a kind of entry its own data
// marks, and runs over the whole shelf.
//
// THE RECORD, data/dictionary-kinds-v1.json, kept by hand:
//   families   every source key the store's index names, filed in exactly
//              one family (one work, as the page lane's table of 15 November
//              2026 files it), and each overlay's keys in families of that
//              overlay; each family under one kind, with the work's own words
//              for itself, byte for byte from the table, or the table's own
//              clause saying it has none (silent)
//   kinds      bible, general-with-entries, rabbinic, aramaic,
//              lists-and-bases and other, each with the table's shapes it
//              gathers
//   rests_off  what rests shut. An entry names kinds or families of the
//              store, and may name a fact a row carries in its facts slot
//              (FACTS_SLOT of tools/gloss-store-v1.mjs), with `is` (the fact
//              equals a value) or `has` (the fact is a list holding a value)
//              beside it, or neither (the fact is there). The first ship
//              holds two: the kind of word lists, knowledge bases and
//              encyclopedia titles, and what English Wiktionary files as a
//              name in its Hebrew and its Aramaic entries (fact name)
//   scope      which zones rest shut: a zone whose own fields equal
//              scope.zone. Today that is the thirty-nine books, the zones
//              served from the corpus lane's restore of the Miqra according
//              to the Masorah; the Tikkunei Zohar, a Targum beside a book and
//              a fixture keep today's rest
//
// A ROW RESTS SHUT under the first entry, in the record's order, whose keys
// hold its source's key and whose fact, if it names one, the row carries.
// Nothing leaves the store: the card holds a shut row back, a press away,
// and the bakes leave it out of what the line under a word reads at rest.
// A row is known by its source's key, never by its M id, so a new table of a
// known source is filed with no edit; a key the record does not file is
// refused, never guessed.
//
// The packagings beside the store are not dictionaries and are not filed:
// the dictionary store, the piece store (its pieces are TAHOT's and
// MACULA's own, under their keys) and the span store, whose own two sources
// stand in no index these functions read, so no entry reaches a row of theirs.
//
// ONE RULE, ONE PLACE. The page carries restsOffOf and restsOffIds under the
// same names, from the line that opens "const restsOffOf = (rec, mSources,
// factsOf) => " to the line "// end of the kinds' rule
// (tools/dictionary-kinds-v1.mjs)", as they stand below but for "export",
// and check-dictionary-kinds-v1 K2 runs the page's two and these over every
// row of the store. So nothing between those two lines reaches outside them.

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const DICTIONARY_KINDS_RULE_ID = "dictionary-kinds-rule-v1-each-dictionary-is-filed-by-what-it-says-it-is-and-a-kind-or-a-category-it-marks-in-its-own-data-may-rest-shut";
export const DICTIONARY_KINDS_SCHEMA = "DICTIONARY_KINDS_V1";
const KINDS_FILE = "dictionary-kinds-v1.json";
// the record as the page fetches it from the reader's root, and as a stamp names it
export const DICTIONARY_KINDS_RECORD = `data/${KINDS_FILE}`;

const HEBREW = /[\u0590-\u05FF\uFB1D-\uFB4F]/u;   // a Hebrew letter, point or presentation form
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const TOP = ["schema_version", "rule_id", "version", "kept_by", "table", "scope", "kinds", "families", "rests_off"];
const FAMILY = ["id", "family", "kind", "shape", "shelf", "overlay", "keys", "says", "where", "files", "own_words", "silent"];
const SCOPE = ["say", "zone", "how", "ruling"];

/** What does not hold in a record of this schema, in one sentence, or null. Read without the store: the record's
 *  own shape, its kinds, its families, its scope, and the words of each resting entry. Which keys an entry shuts,
 *  and whether the record files every key of a store, are restsOffOf's to answer, since only it holds the index. */
export const kindsFault = (rec) => {
  if (!rec || typeof rec !== "object" || Array.isArray(rec)) return "it is not a record";
  const said = [];
  const text = (x) => typeof x === "string" && x.length > 0;
  const english = (x) => text(x) && !HEBREW.test(x);
  const plain = (x) => !!x && typeof x === "object" && !Array.isArray(x);
  const only = (o, fields, what) => { for (const k of Object.keys(o)) if (!fields.includes(k)) said.push(`${what} carries ${k}, which this schema does not hold`); };
  only(rec, TOP, "the record");
  if (rec.schema_version !== DICTIONARY_KINDS_SCHEMA) said.push(`its schema is ${rec.schema_version}, not ${DICTIONARY_KINDS_SCHEMA}`);
  if (rec.rule_id !== DICTIONARY_KINDS_RULE_ID) said.push(`it names the rule ${rec.rule_id}`);
  if (!/^\d{4}-\d{2}-\d{2}[a-z]?$/u.test(String(rec.version))) said.push(`its version ${rec.version} is not a day with a letter`);
  if (!text(rec.kept_by) || !text(rec.table)) said.push("it does not say how it is kept or which table it files from");

  const kinds = plain(rec.kinds) ? rec.kinds : {};
  if (!Object.keys(kinds).length) said.push("it names no kind");
  const shapes = new Set();
  for (const [k, v] of Object.entries(kinds)) {
    if (!KEBAB.test(k)) said.push(`the kind ${k} is not a kebab-case id`);
    if (!plain(v)) { said.push(`the kind ${k} is not an object`); continue; }
    only(v, ["say", "shapes"], `the kind ${k}`);
    if (!english(v.say)) said.push(`the kind ${k} says nothing, or says it with a Hebrew letter`);
    if (!Array.isArray(v.shapes) || !v.shapes.length || !v.shapes.every(text)) said.push(`the kind ${k} gathers no shape`);
    for (const s of Array.isArray(v.shapes) ? v.shapes : []) { if (shapes.has(s)) said.push(`the shape ${s} is under two kinds`); shapes.add(s); }
  }

  const families = Array.isArray(rec.families) ? rec.families : [];
  if (!families.length) said.push("it files no family");
  const ids = new Set(), names = new Set(), filed = new Map();
  for (const f of families) {
    if (!plain(f)) { said.push("a family is not an object"); continue; }
    const at = `the family ${f.id}`;
    only(f, FAMILY, at);
    if (!KEBAB.test(String(f.id)) || ids.has(f.id)) said.push(`${at}: its id is not a kebab-case id of its own`);
    ids.add(f.id);
    if (!text(f.family) || names.has(f.family)) said.push(`${at}: its name is missing, or another family's`);
    names.add(f.family);
    if (!plain(kinds[f.kind])) said.push(`${at} is under ${f.kind}, which is no kind of the record`);
    else if (!(kinds[f.kind].shapes || []).includes(f.shape)) said.push(`${at}: its shape ${f.shape} is not one its kind ${f.kind} gathers`);
    if (f.shelf === "store") { if (f.overlay !== undefined) said.push(`${at} is of the store and names an overlay`); }
    else if (f.shelf === "overlay") { if (!KEBAB.test(String(f.overlay))) said.push(`${at} is beside the store and names no overlay`); }
    else said.push(`${at}: its shelf ${f.shelf} is neither store nor overlay`);
    if (!Array.isArray(f.keys) || !f.keys.length || !f.keys.every(text)) said.push(`${at} files no source key`);
    for (const k of Array.isArray(f.keys) ? f.keys : []) {
      const index = f.shelf === "overlay" ? `the overlay ${f.overlay}` : "the store";
      const slot = `${index}\u0000${k}`;
      if (filed.has(slot)) said.push(`${index}'s key ${k} is filed twice (${filed.get(slot)}, ${f.id})`);
      filed.set(slot, f.id);
    }
    if (!text(f.says) || !text(f.where)) said.push(`${at} does not carry the table's two cells, says and where`);
    if (!plain(f.files) || !Object.keys(f.files).length) said.push(`${at} names no record of this tree that its where names`);
    else for (const [named, path] of Object.entries(f.files)) {
      if (!text(f.where) || !f.where.includes(named)) said.push(`${at}: its where does not name ${named}`);
      if (!text(path)) said.push(`${at}: ${named} is given no path`);
    }
    if (!Array.isArray(f.own_words)) said.push(`${at} carries no list of its own words`);
    else if (f.own_words.length) {
      if (f.silent !== undefined) said.push(`${at} has its own words and is called silent`);
      for (const w of f.own_words) if (!text(w) || !text(f.says) || !f.says.includes(`«${w}»`)) said.push(`${at}: «${w}» is not a quote of what it says it is`);
    } else if (!text(f.silent) || !text(f.says) || !f.says.includes(f.silent)) said.push(`${at} has no own words and does not say, in the table's own clause, that it is silent`);
  }

  if (!Array.isArray(rec.rests_off)) said.push("it holds no list of what rests shut");
  const eids = new Set();
  for (const e of Array.isArray(rec.rests_off) ? rec.rests_off : []) {
    if (!plain(e)) { said.push("a resting entry is not an object"); continue; }
    const at = `the resting entry ${e.id}`;
    if (!KEBAB.test(String(e.id)) || eids.has(e.id)) said.push(`${at}: its id is not a kebab-case id of its own`);
    eids.add(e.id);
    if (!english(e.say)) said.push(`${at} says nothing, or says it with a Hebrew letter`);
    if (!text(e.ruling)) said.push(`${at} names no ruling`);
    for (const list of ["kinds", "families"]) if (e[list] !== undefined && (!Array.isArray(e[list]) || !e[list].every(text))) said.push(`${at}: its ${list} is not a list of names`);
  }

  const s = rec.scope;
  if (!plain(s)) said.push("it names no scope");
  else {
    only(s, SCOPE, "the scope");
    if (!english(s.say) || !text(s.how) || !text(s.ruling)) said.push("the scope does not say what it is, how a zone is known to be of it, and by whose ruling");
    if (!plain(s.zone) || !Object.keys(s.zone).length || !Object.values(s.zone).every(text)) said.push("the scope names no field of a zone to know it by");
    else if (s.zone.schema_version === undefined) said.push("the scope does not name a zone's schema");
  }
  return said.length ? said.join("; ") : null;
};

/** The record, read from the folder that holds it (reader/data, the store's parent), with the sha256 of its bytes:
 *  { rec, sha256, path }. Refuses, by throwing one sentence, a record that is missing, is not JSON, or does not hold
 *  (kindsFault). */
export const readKinds = (dataDir) => {
  const path = join(dataDir, KINDS_FILE);
  if (!existsSync(path)) throw new Error(`no record of dictionary kinds at ${path} (readKinds takes the folder that holds it, reader/data): refusing`);
  const bytes = readFileSync(path);
  let rec;
  try { rec = JSON.parse(bytes.toString("utf8")); } catch (e) { throw new Error(`${path} is not JSON (${e.message}): refusing`); }
  const fault = kindsFault(rec);
  if (fault) throw new Error(`${path} does not hold: ${fault}; refusing`);
  return { rec, sha256: createHash("sha256").update(bytes).digest("hex"), path };
};

/** Whether a zone is one the record rests shut: its own fields equal the scope's. Ask it of a book's own zone (the
 *  parsed bin), never of a sidecar; a commentary, a lattice and a volume are not books. Refuses what is not a zone. */
export const restsOffIn = (rec, zone) => {
  if (!zone || typeof zone !== "object" || typeof zone.schema_version !== "string") throw new Error("restsOffIn was given something that is not a zone (it carries no schema_version): refusing");
  return Object.entries(rec.scope.zone).every(([field, value]) => zone[field] === value);
};

// THE RULE ITSELF, AS THE PAGE CARRIES IT (see ONE RULE, ONE PLACE above).
//
// restsOffOf(rec, mSources, factsOf) resolves each resting entry to the store's source keys once, and gives the
// rule: (row) => the first entry, in the record's order, whose keys hold mSources[row[3]].key and whose fact, if it
// names one, the row carries (factsOf(row)[fact] is truthy; with `is`, equal to it; with `has`, a list holding it),
// else null. A row whose M id the index does not name answers null: an overlay's row, a span store source's.
// It refuses, by throwing one sentence, a record that does not hold over this index: a key the index names that no
// family of the store files, a key two families file, an entry that shuts no key of the store or names a family
// beside it, an entry it cannot read.
// restsOffIds(rec, mSources) gives the M ids every row of which rests shut whatever its facts (an entry that names
// no fact holds their key), sorted as M1, M2, ... M10: the ids the search and the rail know the kind by.
export const restsOffOf = (rec, mSources, factsOf) => {
  const said = [];
  const all = Array.isArray(rec.families) ? rec.families : [];
  const store = all.filter((f) => f.shelf === "store");
  const filed = new Map();   // source key -> the family of the store that files it
  for (const f of store) for (const k of f.keys) {
    if (filed.has(k)) said.push(`${k} is filed by two families (${filed.get(k).id}, ${f.id})`);
    else filed.set(k, f);
  }
  for (const m of Object.keys(mSources)) if (!filed.has((mSources[m] || {}).key)) said.push(`the index's ${m} (${(mSources[m] || {}).key}) is filed by no family of the store`);
  const reads = ["id", "say", "kinds", "families", "fact", "is", "has", "ruling"];
  const entries = (Array.isArray(rec.rests_off) ? rec.rests_off : []).map((e) => {
    const keys = new Set();
    for (const field of Object.keys(e)) if (!reads.includes(field)) said.push(`the entry ${e.id} carries ${field}, which this rule does not read`);
    for (const k of e.kinds || []) {
      if (!rec.kinds || !rec.kinds[k]) said.push(`the entry ${e.id} names the kind ${k}, which the record does not hold`);
      for (const f of store) if (f.kind === k) for (const x of f.keys) keys.add(x);
    }
    for (const id of e.families || []) {
      const f = all.find((x) => x.id === id);
      if (!f || f.shelf !== "store") said.push(`the entry ${e.id} names ${id}, which is no family of the store`);
      else for (const x of f.keys) keys.add(x);
    }
    if (!keys.size) said.push(`the entry ${e.id} shuts no source key of the store`);
    if ((e.is !== undefined || e.has !== undefined) && !e.fact) said.push(`the entry ${e.id} compares a value and names no fact`);
    if (e.is !== undefined && e.has !== undefined) said.push(`the entry ${e.id} reads both is and has`);
    return { e, keys };
  });
  if (said.length) throw new Error(`the record of dictionary kinds does not hold over this store's index: ${said.join("; ")}`);
  const byM = new Map();   // M id -> the entries whose keys hold its source's key, in the record's order
  return (row) => {
    const m = row[3];
    const source = Object.hasOwn(mSources, m) ? mSources[m] : null;
    if (!source) return null;
    let list = byM.get(m);
    if (!list) { list = entries.filter((x) => x.keys.has(source.key)).map((x) => x.e); byM.set(m, list); }
    for (const e of list) {
      if (!e.fact) return e;
      const v = (factsOf(row) || {})[e.fact];
      if (e.is !== undefined ? v === e.is : e.has !== undefined ? Array.isArray(v) && v.includes(e.has) : !!v) return e;
    }
    return null;
  };
};
export const restsOffIds = (rec, mSources) => {
  const shut = restsOffOf(rec, mSources, () => null);
  return Object.keys(mSources).filter((m) => shut([null, null, null, m]) !== null).sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0));
};
// end of the kinds' rule (tools/dictionary-kinds-v1.mjs)
