#!/usr/bin/env node
// Synthesis lane · proper-name-rule-v1-a-name-leads-with-the-name-when-the-witness-reading-the-place-and-the-entry-it-belongs-to-name-it-alike
// LEDGER: -
// no frame letter. This changes no letter of the text and no row of the
// store: it is the one definition by which a key's line leads with a name
// instead of with the derivation a dictionary gives first, computed at
// projection time (tools/regloss-zone.mjs) and baked into the zone's own
// gloss table, so the line, the porch and the card read one field.
//
// A DERIVATION IS NOT A READING. The dictionaries define a name by where it
// came from, because that is what a dictionary does with a name: Strong's
// entry for the letters of Israel opens "he will rule as God", BDB's opens
// "Ēl persisteth", and under oldest-first the line printed the derivation as
// if it were what the word says (the owner, 2026-09-27, on Amos 1:1). The
// name is in the same entry, three senses later, and never led because it
// was never first. Same rule, wrong class of row.
//
// TWO WITNESSES NAME IT ALIKE, OR NOTHING MOVES. Whether a word IS a name at
// its place is not this lane's to decide, and a dictionary entry alone
// cannot say it: the letters of Cain are also a spear, the letters of
// Israel's "words of" are also a Levite called Dibri. So the rule asks two
// records that speak to different things and moves only where they agree:
//
//   1. THE WITNESS READING THE PLACE. The corpus lane's lattice carries, on
//      every word, TAHOT's own English for that word at that place (the
//      word's pg core, source tahot — Tyndale House's per-occurrence
//      alignment, CC BY 4.0). Where that English carries a capitalised
//      token, TAHOT read the word as a name here. Where it does not — "the
//      words of", "a human" — the word is not a name here, whatever the
//      dictionaries also carry under its letters, and the rule holds off.
//   2. THE ENTRY IT BELONGS TO. Strong's (1890) closes every entry with the
//      forms the King James Version prints for it — a usage list, the oldest
//      such record on the shelf. Among the readings of Strong's rows whose
//      own headword pointing matches this word's (pointing-grade-rule-v1,
//      grade m — the same test that keeps Dibri off "the words of"), a bare
//      capitalised form equal to the witness's name, ignoring case and the
//      period Strong's writes at the end of a list, is the entry's own name
//      for it. A transliteration ("Jisraël", "Jehudah", "Jarobam") never
//      equals what TAHOT prints and so never leads; the KJV form does.
//
//   Then, and only then, the key's line is that form, credited as every
//   reading is credited (gloss-m-rule-v1: the oldest witness of the printed
//   reading, its carriers, its alternate). The derivation stays on the card
//   as a pill, unmoved and unhidden — it is a reading of the entry, not of
//   the word. Where the witnesses disagree (TAHOT "Yahweh", Strong's
//   "Jehovah"; TAHOT "Gaza", Strong's "Azzah") nothing moves and the count
//   says so: a name the site would have to choose is a name it does not
//   choose.
//
// PER KEY, OVER THE BOOK. The gloss table is keyed by the written form, so
// the rule is applied per key over every place that form stands in this
// book: every place TAHOT reads must read a name, one name, and the
// Strong's form must match the pointing at every one of them. A key whose
// places disagree — a name at one place, a common noun at another — is
// held, and the line keeps the oldest reading it always had. What is held,
// and why, is counted on the zone's receipt.
//
// WHAT YIELDS TO WHAT. The name lead is the base line (zone.gloss). A
// reader's own switches still govern it exactly as they govern every base
// reading: a carrier switched off, a licence class preferred, the Masorah
// lifted, a lattice or witnessed order chosen — each moves the line by its
// own baked column or leader, and the card's sort yields with it
// (zone.html sortPool, nameLead). The page never chooses; it reads.
import { gradeRow } from "./pointing-grade-v1.mjs";

export const PROPER_NAME_RULE_ID = "proper-name-rule-v1-a-name-leads-with-the-name-when-the-witness-reading-the-place-and-the-entry-it-belongs-to-name-it-alike";
export const PROPER_NAME_RULE_TEXT =
  "a key's line is a Strong's KJV form (a bare capitalised reading of a Strong's row whose headword pointing matches the word at every place it stands) " +
  "when TAHOT's own English for the word at every place it stands carries that same name (case and Strong's terminal period ignored) and no place reads otherwise; " +
  "the derivation stays on the card; where the two witnesses disagree or either is silent nothing moves";

// the entry's witness: the two Strong's records on the shelf, told by their
// labels — the dictionary (Open Scriptures) and the concordance with its
// explicit form lists (Hebrew Wikisource), both 1890
export const isStrongs = (label) => /^Strong's Hebrew (Dictionary|concordance)/u.test(String(label || ""));
// one capitalised token, Strong's list terminator allowed at its end
const NAME_FORM = /^[A-Z][A-Za-z'À-ſ-]+\.?$/u;
const stripDot = (t) => String(t).replace(/\.$/u, "");

/** The capitalised token TAHOT prints for a word, outside its brackets, or
 *  null: "[the] words of" → null, "<of> Cain" → "Cain", "O Israel" → "Israel"
 *  ("O" and "I" are not names: a name is a capital followed by a lowercase
 *  letter). */
export const nameTokenOf = (text) => {
  const toks = String(text || "").replace(/\[[^\]]*\]|<[^>]*>|\([^)]*\)/gu, " ").split(/[\s/+]+/u).filter(Boolean);
  for (const w of toks) {
    const c = w.replace(/^[^A-Za-z]+|[^A-Za-z]+$/gu, "");
    if (/^[A-Z][a-z]/u.test(c)) return c;
  }
  return null;
};

/** The place's witness on one word: TAHOT's core piece. Returns the name
 *  token, "" when TAHOT read the word and printed no name, and null when
 *  TAHOT did not read this word (no core piece on it). */
export const tahotNameOf = (word) => {
  const core = (word && word.pg ? word.pg : []).find((p) => p && p.s === "tahot" && p.r === "core");
  if (!core) return null;
  return nameTokenOf(core.g) || "";
};

/** The entry's witness: the Strong's form for `key` equal to `name`, among
 *  rows whose headword pointing matches every surface in `surfaces`.
 *  A form without the list terminator is preferred to the same form with
 *  it; then the store's own rank. Returns { text, m } or null. */
export const strongsNameFor = (store, key, surfaces, name) => {
  const rows = store.routesFor(key) || [];
  const want = stripDot(name).toLowerCase();
  const hits = [];
  for (const row of rows) {
    const m = store.index.m_sources[row[3]];
    if (!m || !isStrongs(m.label)) continue;
    if (!surfaces.every((s) => gradeRow(row, s) === "m")) continue;
    for (const sense of store.packSplit(String(row[1]))) {
      const sp = store.readingSplit(sense);
      if (sp.damaged) continue;
      for (const rd of sp.readings) if (NAME_FORM.test(rd) && stripDot(rd).toLowerCase() === want) hits.push({ text: rd, m: row[3], rank: Number(row[0]), dot: /\.$/u.test(rd) });
    }
  }
  hits.sort((a, b) => (a.dot - b.dot) || (a.rank - b.rank) || a.text.localeCompare(b.text));
  return hits.length ? { text: hits[0].text, m: hits[0].m } : null;
};

/** The rule over one zone: the keys whose line leads with a name, and the
 *  keys it held back, with why. `gloss` is the base table (oldest first), read
 *  only to count what moves. */
export const nameLeadsFor = (store, zone, gloss = {}) => {
  const places = new Map();   // key → [{ s, wit }]
  for (const sec of zone.sections || []) for (const w of sec.words || []) {
    // a run or a pair is read by its pieces and its whole forms elsewhere;
    // a word with no written surface has no pointing to match
    if (!w || w.w || w.kq || !w.k || typeof w.s !== "string" || !w.s.trim()) continue;
    if (!places.has(w.k)) places.set(w.k, []);
    places.get(w.k).push({ s: w.s.trim(), wit: tahotNameOf(w) });
  }
  const leads = {}, names = {}, carriers = {};
  const counts = { keys_named_somewhere: 0, led: 0, words_led: 0, moved: 0, held_named_at_some_places_only: 0, held_two_names: 0, held_no_matching_form: 0 };
  const held = { named_at_some_places_only: [], two_names: [], no_matching_form: [] };
  const note = (list, s) => { if (list.length < 12) list.push(s); };
  for (const [k, ps] of places) {
    const wits = ps.map((p) => p.wit).filter((x) => x !== null);
    // TAHOT read no place of this form as a name: not a candidate, nothing to say
    if (!wits.some((x) => x !== "")) continue;
    counts.keys_named_somewhere += 1;
    // a name at one place and a common word at another (Adam and "a man",
    // Cain's letters as a spear): the letters are not one word here, and
    // the key is not led
    if (wits.some((x) => x === "")) { counts.held_named_at_some_places_only += 1; note(held.named_at_some_places_only, `${k}: ${[...new Set(wits.filter(Boolean))].join(" / ")} at some places, not at others`); continue; }
    const distinct = [...new Set(wits.map((x) => x.toLowerCase()))];
    if (distinct.length > 1) { counts.held_two_names += 1; note(held.two_names, `${k}: ${[...new Set(wits)].join(" / ")}`); continue; }
    const surfaces = [...new Set(ps.map((p) => p.s))];
    const hit = strongsNameFor(store, k, surfaces, wits[0]);
    if (!hit) { counts.held_no_matching_form += 1; note(held.no_matching_form, `${k}: ${wits[0]} (line: ${gloss[k] ?? "—"})`); continue; }
    leads[k] = hit.text; names[k] = wits[0]; carriers[k] = hit.m;
    counts.led += 1; counts.words_led += ps.length;
    if (gloss[k] !== hit.text) counts.moved += 1;
  }
  return { rule: PROPER_NAME_RULE_ID, leads, names, carriers, counts, held };
};
