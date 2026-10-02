#!/usr/bin/env node
// LEDGER: M
// the source record and the readings hanging off it. This writes a finding
// ABOUT M sources and strikes none of them: it records what a review found
// and measured, so a ruling can be made on it and audited after.
// GUARDS: language-admission-rule-v1-a-source-that-is-not-hebrew-or-aramaic-cannot-define-an-a
//
// The language sweep of 2026-09-02, and what it actually found.
//
// The admission rule reads a source's label and provenance. It struck
// forty-nine sources and it cannot see the case it was written for: Harkavy's
// Yiddish hid behind "Hebrew-English" and was found by a reader tapping a
// word. So every kept source was judged by the words it defines — a sample
// of sixty routes per source, three refuters on every flag, a critic on the
// method — and the critic's verdict was that the method could not see a
// Harkavy-class leak either: the store's keys carry no pointing, the rows no
// etymology, sixty draws miss a one-percent contamination half the time, and
// the one decisive test had not been run.
//
// So it was run. The struck Yiddish sources' own headwords were recovered
// from the pre-strike store in this repository's history, and every kept
// route was asked: is your key one a Yiddish lexicon knows and no curated
// Hebrew or Aramaic source carries, and does your text merely romanize it?
//
// Three inputs, all derived, none typed:
//   --result   the review's per-source verdicts (a workflow's return value)
//   --tiers    the residue split into prefixed Hebrew, romanized-only, and
//              unknown-with-English-gloss, each with tapped positions
//   --wide     the same romanization test without the Yiddish condition
//   --yiddish  the recovered Yiddish headword set with its provenance commit
//
// Run: node tools/emit-language-sweep-record-v1.mjs --result <json> --tiers <json>
//        --wide <json> --residue <json> [--out data/language-sweep-v1.json]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const need = (n) => { const v = arg(n); if (!v) { console.error(`MISSING_ARG --${n}`); process.exit(1); } return JSON.parse(readFileSync(v, "utf8")); };
const result = need("result"), tiers = need("tiers"), wide = need("wide"), residue = need("residue");
const OUT = arg("out", join(K3, "data", "language-sweep-v1.json"));
const YCOMMIT = arg("yiddish-commit", "c0c19b5ed5d49db3321c0cb3a568ab0fbcb2509e");

const sources = result.sources.map((s) => ({
  m: s.m, label: s.label, routes: s.routes, keys: s.keys,
  verdict: s.verdict, confidence: s.confidence,
  proposed_languages_field: s.proposed_languages_field || [],
  other_languages: s.other_languages || [],
  refuters: (s.refuters || []).map((r) => ({ lens: r.lens, refuted: r.refuted })),
}));
const tierOut = (name) => ({
  ...tiers.summary[name],
  keys: tiers.tiers[name].map((e) => ({ k: e.k, routes: e.routes.map((r) => ({ m: r.m, text: r.text })), tapped: e.tapped ? { occurrences: e.tapped.occ, works: e.tapped.works.length } : null }))
    .sort((a, b) => ((b.tapped || {}).occurrences || 0) - ((a.tapped || {}).occurrences || 0)),
});
const record = {
  schema_version: "LANGUAGE_SWEEP_V1",
  rule_id: "language-admission-rule-v1-a-source-that-is-not-hebrew-or-aramaic-cannot-define-an-a",
  emitted_by: "tools/emit-language-sweep-record-v1.mjs",
  what_this_is: "A finding, not a strike. Every kept M source was judged by the words it defines; the method's own critic found it unable to see a Harkavy-class leak; the decisive test was then run over the whole store and is recorded here with its numbers. Nothing in the store changed on the strength of this record. A ruling on the residue is the owner's.",
  ran_on: "2026-09-02",
  review: {
    method: "one judge per source over a sample of up to sixty routes spread evenly across the source's contribution; three refuters (orthography, provenance, definitions) on every flag, one refuter on every clearance below high confidence; a completeness critic over the whole",
    outcome: { judged: sources.length, flags_standing: (result.standing_flags || []).length, clearances_overturned: (result.overturned_clears || []).length, no_routes: sources.filter((s) => s.verdict === "NO_ROUTES").length },
    critic_gaps: result.critic.gaps, critic_method_faults: result.critic.method_faults, critic_reread: result.critic.sources_to_reread,
    sources,
  },
  decisive_test: {
    what: "kept-source keys that a struck Yiddish lexicon knows and no curated Hebrew or Aramaic source carries, from aggregator sources only; curated means the compiler tagged the headword's language, aggregator means an alignment product that tags by script",
    yiddish_headwords: { count: residue.Y, recovered_from: `reader/data/route-store at commit ${YCOMMIT}, the store as it stood before the first strike, sources M40 M63 M104 M168 (Kaikki Yiddish) and the twelve Harkavy shards` },
    curated_sources: residue.curated, aggregator_sources: residue.aggregators, curated_key_count: residue.H,
    suspect_keys: residue.suspect_keys, suspect_routes: residue.suspect_routes, suspect_routes_by_source: residue.per_source,
    tiers: {
      prefixed_hebrew: { note: "a clitic letter stripped leaves a curated Hebrew key; these are Hebrew words the curated set lacks in their prefixed form, and they stay", ...tierOut("prefixed_hebrew") },
      romanized_only: { note: "every route on the key merely romanizes it — Yiddish function words glossed by their German cognate, Ashkenazi names glossed by their spelling. Not a definition of anything. The narrow strike candidate.", ...tierOut("romanized_only") },
      unknown_with_english_gloss: { note: "a Yiddish lexicon knows the key, no curated source carries it, and the gloss is English. Most are ordinary Hebrew the curated set happens to lack; a few are Yiddish. Separating them needs a Yiddish headword ruling, not a rule.", ...tierOut("yiddish_or_unknown_with_english_gloss") },
    },
    wide_form: { what: "every aggregator route on an uncurated key whose gloss merely romanizes the key, Yiddish or not — names, mostly", routes: wide.routes, keys: wide.keys, tapped_positions: wide.tapped, works: wide.works, by_source: wide.per_source, sample: wide.sample.slice(0, 60) },
  },
  what_this_does_not_say: "that any source is clean. It says the label rule strikes what it can see, the review could not see past it, and the decisive test found a residue of a known size in known places. It also does not say Syriac: three Kaikki Aramaic sources serve Classical Syriac senses under the Wiktionary umbrella of Aramaic, the admission rule names Syriac as struck, and the store carries no dialect tag to separate them; that is a ruling, recorded here as open.",
};
writeFileSync(OUT, JSON.stringify(record, null, 1) + "\n");
console.log(`${OUT}: ${sources.length} sources judged · residue ${residue.suspect_routes} routes on ${residue.suspect_keys} keys · romanized-only ${tiers.summary.romanized_only.routes} routes at ${tiers.summary.romanized_only.tapped} tapped positions · wide ${wide.routes} routes`);
