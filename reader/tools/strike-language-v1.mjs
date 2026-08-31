#!/usr/bin/env node
// GUARDS: language-admission-rule-v1-a-source-that-is-not-hebrew-or-aramaic-cannot-define-an-a
//
// The frame's first letter says what this project is made of: A is a
// "licensable hebrew or aramaic span." Everything downstream — N, the
// COMPspan lattice, D, R, M — hangs off that span. So a dictionary of some
// other language is not a weak source for an A. It is not a source for an A
// at all, because it is not answering about the same thing.
//
// The store did not know that. It is keyed by byte-exact Hebrew-script
// strings, and several languages are written in Hebrew script, so a Yiddish
// lexicon and a Hebrew lexicon collide on the same key and the catalog cannot
// tell them apart. What that produced, live, on 3,065 published books:
//
//   לענין  served as "Lenin"   on Boaz on Mishnah Beitzah
//   כעלם   served as "Chelm"   on Bechinat Olam
//   דעם    served as "the"     on Aramaic Targum to Ruth   (Yiddish article)
//   קלב    served as "heart"   on Boaz on Mishnah Gittin   (Arabic qalb)
//
// לענין is ל + ענין, "regarding the matter of" — among the most common
// phrases in rabbinic Hebrew. It is not Lenin.
//
// The rule, declared before output:
//   1. ADMITTED: a source whose own label names Hebrew, Aramaic, or Chaldee
//      (the older name for Aramaic), and a source whose label names no
//      language at all. The unnamed ones are the scholarly lexica — Jastrow,
//      Davidson, ETCBC, STEP — every one of which declares Hebrew and/or
//      Aramaic on its own title page; Davidson's is literally the Analytical
//      Hebrew and Chaldee Lexicon.
//   2. STRUCK: a source whose own label names a language outside that set.
//   3. STRUCK: a source whose own label declares itself NON-Hebrew without
//      naming which language it is. A source that cannot say it is not
//      Yiddish is not admitted on the strength of not having been asked.
//      Absence of a claim has never been a claim anywhere else in this
//      project and is not one here.
//   4. Nothing is struck by hand. The decision is read from the label the
//      source shipped, the matched phrase is recorded beside every decision,
//      and the whole classification — struck and kept alike — is written to
//      data/language-admission-v1.json so a stranger can audit each call.
//   5. A struck M loses its record AND its routes. Leaving the routes to be
//      filtered later by rule 5 of the gloss store would leave the text in
//      the shipped store, one bug away from display.
//
// Idempotent: a store already struck reports zero and rewrites nothing.
//
// Run: node tools/strike-language-v1.mjs [--store data/route-store] [--dry]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
const DRY = process.argv.includes("--dry");

export const ADMISSION_RULE_ID =
  "language-admission-rule-v1-a-source-that-is-not-hebrew-or-aramaic-cannot-define-an-a";

// The languages an A may be written in, per the frame's own definition of A.
export const ADMITTED_LANGUAGES = ["Hebrew", "Aramaic", "Chaldee"];

// Language words looked for in a source's own label. The list is deliberately
// wider than what the store happens to carry, so a new source in a new
// language is classified rather than waved through as "no language named".
const LANGUAGE_WORDS = [
  "Hebrew", "Aramaic", "Chaldee", "Syriac", "Samaritan",
  "Yiddish", "Ladino", "Judeo-Arabic", "Arabic", "Persian", "Turkish",
  "Greek", "Latin", "Akkadian", "Ugaritic", "Phoenician", "Coptic",
  "Amharic", "Russian", "Polish", "German", "English",
];
// English is the target language of every gloss in this store — every label
// names it, and naming it says nothing about the source's headwords.
const NOT_A_HEADWORD_LANGUAGE = new Set(["English"]);

// A label that declares itself non-Hebrew, or names only "a language written
// in Hebrew script" without saying which. Rule 3.
const UNNAMED_NON_HEBREW = /non-Hebrew-language|Hebrew-script-language/i;

/** The decision for one source, with the evidence that produced it. */
export const classify = (label) => {
  const l = String(label || "");
  const named = LANGUAGE_WORDS.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(l))
    .filter((w) => !NOT_A_HEADWORD_LANGUAGE.has(w));
  const unnamedNonHebrew = UNNAMED_NON_HEBREW.exec(l);
  if (unnamedNonHebrew)
    return { admitted: false, reason: "DECLARES_ITSELF_NON_HEBREW_WITHOUT_NAMING_A_LANGUAGE",
      evidence: unnamedNonHebrew[0], languages_named: named };
  const outside = named.filter((w) => !ADMITTED_LANGUAGES.includes(w));
  if (outside.length)
    return { admitted: false, reason: "NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC",
      evidence: outside.join(" + "), languages_named: named };
  if (named.length)
    return { admitted: true, reason: "NAMES_AN_ADMITTED_LANGUAGE",
      evidence: named.join(" + "), languages_named: named };
  return { admitted: true, reason: "NAMES_NO_LANGUAGE__SCHOLARLY_LEXICON_ADMITTED_ON_ITS_TITLE_PAGE",
    evidence: "", languages_named: [] };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
  const decisions = {};
  const struck = new Set();
  for (const [m, rec] of Object.entries(index.m_sources)) {
    const d = classify(rec.label);
    decisions[m] = { label: rec.label, ...d };
    if (!d.admitted) struck.add(m);
  }

  // what the strike costs, counted before anything is written
  let routesBefore = 0, routesStruck = 0, keysBefore = 0, keysEmptied = 0;
  const emptied = [];
  const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
  const rewritten = new Map();
  for (const name of shardNames) {
    const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", name))).toString("utf8"));
    const out = {};
    for (const [k, rows] of Object.entries(body)) {
      keysBefore += 1; routesBefore += rows.length;
      const kept = rows.filter((r) => !struck.has(r[3]));
      routesStruck += rows.length - kept.length;
      if (kept.length) out[k] = kept;
      else { keysEmptied += 1; if (emptied.length < 12) emptied.push(k); }
    }
    rewritten.set(name, out);
  }

  const record = {
    rule_id: ADMISSION_RULE_ID,
    ran_at: new Date().toISOString(),
    admitted_languages: ADMITTED_LANGUAGES,
    basis: "the frame's definition of A: a licensable hebrew or aramaic span. A source that is not "
      + "answering about Hebrew or Aramaic is not a weak source for an A, it is not a source for one.",
    struck_sources: [...struck].map((m) => ({ m_id: m, ...decisions[m] })),
    kept_sources: Object.entries(decisions).filter(([, d]) => d.admitted)
      .map(([m, d]) => ({ m_id: m, reason: d.reason, evidence: d.evidence, label: d.label })),
    counts: { sources_before: Object.keys(index.m_sources).length, sources_struck: struck.size,
      routes_before: routesBefore, routes_struck: routesStruck,
      keys_before: keysBefore, keys_left_with_no_route: keysEmptied },
    keys_left_with_no_route_examples: emptied,
  };

  console.log(`— ${ADMISSION_RULE_ID} —`);
  for (const s of record.struck_sources)
    console.log(`  STRUCK  ${s.m_id.padEnd(5)} ${s.reason}  ·  ${s.evidence || "—"}\n          ${s.label}`);
  console.log(`\n  sources ${record.counts.sources_before} → ${record.counts.sources_before - struck.size}`
    + `  ·  routes ${routesBefore} → ${routesBefore - routesStruck} (${routesStruck} struck)`
    + `  ·  ${keysEmptied} keys left with no route`);
  if (emptied.length) console.log(`  e.g. ${emptied.join(" ")}`);

  if (DRY) { console.log("\n--dry — nothing written"); process.exit(0); }
  if (!struck.size) { console.log("\nalready struck — nothing to write"); process.exit(0); }

  for (const [name, body] of rewritten)
    writeFileSync(join(STORE, "shards", name), gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 }));
  index.m_sources = Object.fromEntries(Object.entries(index.m_sources).filter(([m]) => !struck.has(m)));
  index.language_admission = {
    rule_id: ADMISSION_RULE_ID,
    admitted_languages: ADMITTED_LANGUAGES,
    record: "data/language-admission-v1.json",
    struck_m_ids: [...struck],
    counts: record.counts,
  };
  index.counts = { ...index.counts, keys: keysBefore - keysEmptied, routes: routesBefore - routesStruck };
  writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
  writeFileSync(join(K3, "data", "language-admission-v1.json"), JSON.stringify(record, null, 1));
  console.log(`\nstore rewritten · data/language-admission-v1.json written`);
}
