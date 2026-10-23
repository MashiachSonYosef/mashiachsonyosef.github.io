#!/usr/bin/env node
// GUARDS: language-admission-rule-v1-a-source-that-is-not-hebrew-or-aramaic-cannot-define-an-a
// LEDGER: M R
// the source record and the readings hanging off it. This tool removes M records and the R routes they carry. It does not touch an A span or an N license: what it changes is WHICH sources are permitted to answer for an A.
//
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
//   0. A LABEL IS A CLAIM; A PROVENANCE IS A FACT. The decision reads the
//      source's key and license pointer FIRST, and the label only after. A
//      pointer naming a struck language strikes the source however its label
//      describes itself, because the pointer says which book was opened and
//      the label says only what somebody called it. This rule is here
//      because it was broken: twelve sources labeled "Harkavy 1925 exact
//      Hebrew-English dictionary equivalents" pointed at
//      source-cache/harkavy-yiddish-english-hebrew-1925 — Alexander
//      Harkavy's Yiddish-English-Hebrew dictionary, whose headwords are
//      Yiddish. The label-only rule admitted all twelve. They served 376
//      readings on 252 keys standing at 75,506 tappable positions across
//      2,427 books, among them RESH-YOD-ALEF-LAMED-YOD-SAMEKH-TAV as
//      "realist, naturalist" — a Yiddish headword, in a Hebrew reader.
//   1. ADMITTED: a source that NAMES Hebrew, Aramaic, or Chaldee (the older
//      name for Aramaic) somewhere in its own record. Admission is
//      affirmative. This project has one explicit subject — Hebrew, with
//      Aramaic as its single concession — and a source that has not said it
//      is answering about that subject has not qualified to answer for it.
//   1a. SILENCE IS NOT A DECLARATION. A source naming no language at all is
//      STRUCK. This rule replaces an earlier one of mine that admitted the
//      silent on the reasoning that they were scholarly lexica declaring
//      Hebrew on their own title pages. That reasoning was me vouching for a
//      book the record does not describe, and it is the same shape of error
//      as trusting a label over a provenance: an admission resting on what I
//      believe rather than on what the source says. The owner's ruling is
//      that coverage is not the goal — fifty books done right is the goal —
//      so a source that will not name its subject is simply not needed.
//      Twenty-seven were struck by this rule the day it was written:
//      Davidson 1855, Jastrow, ETCBC BHSA and STEP TAHOT, 79,095 routes over
//      12,847 keys. Every one of those four IS a Hebrew or Aramaic lexicon.
//      They are struck for not saying so, and the way back is not an
//      exception here — it is a label at the source that names what the
//      title page names, after which they pass this gate unchanged.
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
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { recordStruckRanks, readStruckRanks, STRUCK_RANKS_FILE } from "./emit-struck-ranks-v1.mjs";

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
//
// Syriac and Mandaic are named here even though both ARE Aramaic — Eastern
// dialects of it, in their own scripts and their own literatures. The owner's
// ruling names them out, and the reason the naming is load-bearing is that
// "Aramaic" alone would otherwise admit them: a label reading "Syriac" is
// struck because Syriac is not on the admitted list, and a label reading
// "Syriac Aramaic" is struck because a named language outside the admitted
// set beats a named language inside it. Without the words here, neither
// happens and a Mandaic lexicon walks in through the no-language-named door.
const LANGUAGE_WORDS = [
  "Hebrew", "Aramaic", "Chaldee", "Syriac", "Mandaic", "Samaritan",
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

/**
 * The decision for one source, with the evidence that produced it.
 *
 * Takes the whole source record when there is one, and falls back to a bare
 * label string so an older caller still works. The record's key and license
 * pointer are read BEFORE the label, per rule 0: they name the file the
 * readings were cut out of, and that is not a matter of description.
 */
export const classify = (source) => {
  const rec = (source && typeof source === "object") ? source : { label: source };
  const l = String(rec.label || "");

  // A DECLARED languages field beats every other signal, in both directions.
  // Reading a language out of prose is a heuristic; a field that names the
  // languages is the source answering the question it was asked. This exists
  // because Davidson was struck by rule 1a while its own acquisition manifest
  // had carried languages ["Hebrew","English","Chaldee"] the whole time — the
  // reviewed manifest this gate reads simply has no such field. So the way
  // back for a struck-but-Hebrew source is to carry the field, which is a
  // smaller and more honest edit than rewriting a prose label.
  if (Array.isArray(rec.languages) && rec.languages.length) {
    const declared = rec.languages.map(String);
    const headword = declared.filter((w) => !NOT_A_HEADWORD_LANGUAGE.has(w));
    const outside = headword.filter((w) => !ADMITTED_LANGUAGES.includes(w));
    if (outside.length)
      return { admitted: false, reason: "DECLARED_LANGUAGES_INCLUDE_ONE_OUTSIDE_HEBREW_AND_ARAMAIC",
        evidence: outside.join(" + "), languages_named: declared };
    if (headword.length)
      return { admitted: true, reason: "DECLARED_LANGUAGES_ARE_ADMITTED",
        evidence: headword.join(" + "), languages_named: declared };
  }
  // Word boundaries do not survive a path, where the language sits between
  // hyphens and slashes. So the provenance is scanned with its separators
  // turned into spaces, and the whole string is matched, not a \b form.
  const provenance = [rec.key, rec.licensePointer, rec.licensePosture, rec.source_path]
    .filter(Boolean).join(" ").replace(/[/_.\-]+/g, " ");
  const inProvenance = LANGUAGE_WORDS
    .filter((w) => !NOT_A_HEADWORD_LANGUAGE.has(w))
    .filter((w) => new RegExp(`\\b${w.replace(/-/g, " ")}\\b`, "i").test(provenance));
  const struckInProvenance = inProvenance.filter((w) => !ADMITTED_LANGUAGES.includes(w));
  if (struckInProvenance.length)
    return { admitted: false, reason: "PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC",
      evidence: `${struckInProvenance.join(" + ")} in ${rec.licensePointer || rec.key}`,
      languages_named: inProvenance,
      note: "the label did not say so; the file the readings were cut out of did" };
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
  // Rule 1a. Nothing named, anywhere in the record — not in the label, not
  // in the provenance. There is no claim here to admit.
  const admittedInProvenance = inProvenance.filter((w) => ADMITTED_LANGUAGES.includes(w));
  if (admittedInProvenance.length)
    return { admitted: true, reason: "PROVENANCE_NAMES_AN_ADMITTED_LANGUAGE",
      evidence: `${admittedInProvenance.join(" + ")} in ${rec.licensePointer || rec.key}`,
      languages_named: admittedInProvenance };
  return { admitted: false, reason: "NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION",
    evidence: "the record names no language, in its label or its provenance",
    languages_named: [],
    note: "admission is affirmative: a source answers for a Hebrew or Aramaic span only if it says "
      + "that is what it is answering about. If this source is a Hebrew or Aramaic lexicon, the fix "
      + "is a label at the source naming what its own title page names, not an exception here." };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
  const decisions = {};
  const struck = new Set();
  for (const [m, rec] of Object.entries(index.m_sources)) {
    const d = classify({ ...rec, m_id: m });
    decisions[m] = { label: rec.label, ...d };
    if (!d.admitted) struck.add(m);
  }

  // what the strike costs, counted before anything is written
  let routesBefore = 0, routesStruck = 0, keysBefore = 0, keysEmptied = 0;
  const emptied = [];
  const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
  const rewritten = new Map();
  // Every rank the strike takes is typed as it goes — key, rank, and the
  // record it stood on — so the hole it leaves can be told from a hole by
  // bug. The hole itself stays: renumbering would rewrite every citation.
  const struckRanks = { keys: {}, rows: 0, keys_touched: 0, on_struck_records: 0, on_other_records: 0 };
  for (const name of shardNames) {
    const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", name))).toString("utf8"));
    const out = {};
    for (const [k, rows] of Object.entries(body)) {
      keysBefore += 1; routesBefore += rows.length;
      const kept = rows.filter((r) => !struck.has(r[3]));
      routesStruck += rows.length - kept.length;
      for (const r of rows) if (struck.has(r[3])) {
        (struckRanks.keys[k] ||= []).push([r[0], String(r[3])]);
        struckRanks.rows += 1; struckRanks.on_struck_records += 1;
      }
      if (kept.length) out[k] = kept;
      else { keysEmptied += 1; if (emptied.length < 12) emptied.push(k); }
    }
    rewritten.set(name, out);
  }
  struckRanks.keys_touched = Object.keys(struckRanks.keys).length;

  // THE RECORD IS CUMULATIVE. Each run used to overwrite it, so after three
  // rounds the file on the shelf said 27 struck when 49 were struck, and the
  // 22 from the earlier rounds — every Harkavy source, every Kaikki Yiddish
  // and Arabic one — had vanished from the only document a stranger can
  // audit. A record that erases its own history is worse than no record: it
  // reads as an answer. Prior rounds are carried forward, deduplicated by
  // m_id, and each round keeps its own line.
  const priorPath = join(K3, "data", "language-admission-v1.json");
  let prior = null;
  try { prior = JSON.parse(readFileSync(priorPath, "utf8")); } catch { prior = null; }
  const priorStruck = (prior && prior.struck_sources) || [];
  const priorRounds = (prior && prior.rounds) || (prior
    ? [{ ran_at: prior.ran_at, struck: priorStruck.map((s) => s.m_id), counts: prior.counts }]
    : []);

  // The one sentence that keeps this block from being read as the strike.
  // Exported-shaped rather than typed twice, because the index summary carries
  // the same numbers and a scope that travels with only one copy of them is
  // the same number standing unlabelled somewhere else.
  const COUNTS_SCOPE_SAY =
    "the last round that struck anything, NOT the whole strike — see cumulative for that, "
    + "and rounds[] for what each round struck";

  // A ROUND IS A DELTA. THE TOTAL IS NOT A ROUND.
  //
  // The fallback directly above synthesizes a round out of the CUMULATIVE
  // struck list when a prior file has no rounds[] — which is right, once, for
  // a record that has no round history at all, and wrong the moment a record
  // that does have one is read by a run that recomputes every struck source
  // rather than only the new ones. Both happened. The shelf carried three
  // rounds of 10, 39 and 49 for a strike of 49 sources: the third held no id
  // the other two did not, and its timestamp sat an hour and a half BEFORE the
  // second. It was the total, written down as though it were an event.
  //
  // The test is exact, not a heuristic about size or order: a round whose id
  // set is precisely the union of every other round is a restatement of the
  // total. It cannot be a delta, because a delta that equals the whole has
  // nothing before it — and there is something before it, namely the rounds
  // that union to it. Nothing is deleted; the entry moves to
  // rounds_restating_the_total so the file still shows what it used to say.
  const foldRounds = (rs) => {
    const sets = rs.map((r) => new Set(r.struck || []));
    const kept = [], restating = [];
    sets.forEach((s, i) => {
      const others = new Set(sets.filter((_, j) => j !== i).flatMap((x) => [...x]));
      const isTotal = sets.length > 1 && s.size === others.size && [...s].every((m) => others.has(m));
      (isTotal ? restating : kept).push(rs[i]);
    });
    return { kept, restating };
  };

  // A round carries its own counts from here on. The rounds already on the
  // shelf carry none, which is why `cumulative` below has to say null for
  // routes and keys instead of summing; recording them now is what makes that
  // null temporary rather than permanent.
  const roundsNow = struck.size
    ? [...priorRounds, {
      ran_at: new Date().toISOString(),
      struck: [...struck],
      counts: { sources_struck: struck.size, routes_struck: routesStruck, keys_left_with_no_route: keysEmptied },
    }]
    : priorRounds;
  const folded = foldRounds(roundsNow);

  const record = {
    rule_id: ADMISSION_RULE_ID,
    ran_at: new Date().toISOString(),
    admitted_languages: ADMITTED_LANGUAGES,
    basis: "the frame's definition of A: a licensable hebrew or aramaic span. A source that is not "
      + "answering about Hebrew or Aramaic is not a weak source for an A, it is not a source for one.",
    struck_sources: (() => {
      const byId = new Map(priorStruck.map((s) => [s.m_id, s]));
      for (const m of struck) byId.set(m, { m_id: m, ...decisions[m] });
      return [...byId.values()].sort((a, b) =>
        Number(String(a.m_id).slice(1)) - Number(String(b.m_id).slice(1)));
    })(),
    // A run that strikes nothing is not a round. Appending one made the index
    // report four rounds while the record it summarizes held three, because
    // the record is only rewritten when it has changed and the index summary
    // was built from the in-memory value.
    rounds: folded.kept,
    // Carried forward, not recomputed from this run alone. Once a restating
    // entry has been folded out of rounds[], the NEXT run reads a rounds[]
    // with nothing to fold and would write an empty list here — erasing the
    // only trace of what the file used to claim. That is the very fault the
    // comment above this block was written about, committed a second time by
    // the code that fixes it.
    rounds_restating_the_total: (() => {
      const seen = new Set(), out = [];
      for (const r of [...((prior && prior.rounds_restating_the_total) || []), ...folded.restating]) {
        const key = JSON.stringify([r.ran_at, (r.struck || []).length]);
        if (seen.has(key)) continue;
        seen.add(key); out.push(r);
      }
      return out;
    })(),
    kept_sources: Object.entries(decisions).filter(([, d]) => d.admitted)
      .map(([m, d]) => ({ m_id: m, reason: d.reason, evidence: d.evidence, label: d.label })),
    // EVERY COUNT SAYS WHAT IT WAS COUNTED OVER.
    //
    // This block held six numbers describing ONE round, sitting beside a
    // struck list holding every round — 27 sources and 79,095 routes next to
    // 49 ids. Anybody reading it came away with a number for the strike that
    // was the number for its last part, and the peer lane did: the figure
    // travelled between lanes and was restated before it was caught.
    //
    // It is the same law the owner ruled for the counts panel on the card —
    // counts only, scope named — and it is the same fault as a mark that
    // covers every word: a number whose set is not beside it is read as
    // covering everything there is.
    counts: {
      scope: COUNTS_SCOPE_SAY,
      sources_before: Object.keys(index.m_sources).length,
      sources_struck: struck.size,
      routes_before: routesBefore,
      routes_struck: routesStruck,
      keys_before: keysBefore,
      keys_left_with_no_route: keysEmptied,
    },
    // And what is true of the whole strike, with the unknowns left unknown
    // rather than filled from the nearest number to hand. Sources are countable
    // because every struck id is on the list. Routes and keys are not: the
    // rounds before this file recorded per-round counts did not record them,
    // and the routes they removed are gone from the store that would have to
    // be counted to recover them. A cumulative route figure can only be had by
    // differencing this store against a pre-strike one, which is the corpus
    // lane's copy and not this lane's to assert.
    cumulative: (() => {
      // The first draft of this block said routes could not be counted
      // cumulatively — that it would take differencing this store against a
      // pre-strike copy, which this lane does not hold. Both halves were
      // wrong. The difference was taken on 2026-09-02 and written down beside
      // the store as struck-ranks-v1.json.gz: every rank the strike removed,
      // with the M record it stood on, reconstructed from the pre-strike store
      // against the struck one. It covers all the struck ids, not one round's.
      //
      // Which is the same failure as the one this whole block exists to fix,
      // one level up: I wrote down a confident sentence about what could not be
      // known without looking for whether it was already written down. The
      // number is read from the record now, and the record's own provenance is
      // carried with it so nobody has to take this file's word for it.
      const sr = (() => { try { return readStruckRanks(STORE); } catch { return null; } })();
      const made = sr && (sr.made || [])[0];
      const carriers = new Set();
      if (sr) for (const rows of Object.values(sr.keys || {})) for (const r of rows) carriers.add(r[1]);
      return {
        scope: "every round, deduplicated by m id",
        rounds: folded.kept.length,
        sources_struck: null, // filled below, once struck_sources is built
        routes_struck: sr ? sr.counts.ranks : null,
        keys_touched: sr ? sr.counts.keys : null,
        routes_and_keys_from: sr
          ? {
            record: `data/route-store/${STRUCK_RANKS_FILE}`,
            how: made ? made.how : null,
            before_store_version: made ? made.before_store_version : null,
            after_store_version: made ? made.after_store_version : null,
            covers_m_ids: made ? (made.struck_m_ids || []).length : null,
            // "covers" means the record was taken over all of them, not that
            // all of them left a mark. Four struck sources carried no route in
            // the pre-strike store at all, so they appear in no rank row — an
            // absence that looks like a hole in the record and is not one.
            of_which_carried_no_route: made
              ? (made.struck_m_ids || []).filter((m) => !carriers.has(m)).length
              : null,
            caveat: "a difference of two stores, not a sum of per-round counts: it says what the "
              + "struck store lacks that the pre-strike store held, across every round at once.",
          }
          : null,
        // MEASURED, NOT DECLARED UNOBTAINABLE. This field said null with a
        // reason, and the reason was false — the second time in this same
        // block I wrote a confident sentence about what could not be known
        // without trying it. The answer needs no git and no peer's copy: the
        // struck-rank record names every key the strike touched, and a key
        // that is touched and is now in no shard is a key the strike left
        // bare. Two files in this directory, one pass.
        keys_left_with_no_route: sr ? (() => {
          const live = new Set();
          for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")))
            for (const k of Object.keys(JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"))))
              live.add(k);
          return Object.keys(sr.keys).filter((k) => !live.has(k)).length;
        })() : null,
        keys_left_with_no_route_how: sr
          ? "keys named by struck-ranks-v1.json.gz that no shard still carries — the strike touched "
            + "more keys than it emptied, so this is smaller than keys_touched"
          : null,
      };
    })(),
    // Evidence a run that struck nothing cannot produce, and therefore must
    // not overwrite. `emptied` is [] on a repair run — writing it would drop
    // the twelve keys the strike left bare, which are the only examples in the
    // file of what the strike actually did to a reader's page. Same for the
    // store version the strike moved: a repair does not rewrite shards, so it
    // has no version change of its own to report and no business clearing the
    // one that happened.
    keys_left_with_no_route_examples: emptied.length
      ? emptied : ((prior && prior.keys_left_with_no_route_examples) || []),
    ...((prior && prior.store_version) ? { store_version: prior.store_version } : {}),
    // A standing fact about this file, emitted rather than remembered: it was
    // typed in by hand once, and the first run of the repair that follows
    // deleted it, because a field no tool writes is a field the next write
    // drops.
    record_is_cumulative:
      "every source struck in any round, deduplicated by m id. Earlier runs overwrote this file rather "
      + "than adding to it, so rounds had to be recovered from git and from re-running the classifier "
      + "over the pre-strike index; see rounds_partition_is_reconstructed for what that recovery can "
      + "and cannot establish.",
  };
  record.cumulative.sources_struck = record.struck_sources.length;

  // AND WHERE THE FILE DISAGREES WITH ITSELF, IT SAYS SO.
  //
  // counts describes the last round that struck anything. If no round in
  // rounds[] struck that many sources, then the two halves of this file
  // describe two different histories and at most one of them is what happened.
  // On the shelf today they do: counts says 27 sources, and rounds[] holds
  // rounds of 10 and 39 — because those two were RECONSTRUCTED by re-running
  // the classifier over a pre-strike index, which sorts every source by the
  // rule and cannot recover which run struck which. The reconstruction is
  // honest about the set and cannot be honest about the partition.
  //
  // Neither is corrected into the other, because I do not know which is right
  // and inventing agreement is how a record stops being evidence. The
  // disagreement is computed and written down, so the next person to read
  // these numbers meets the doubt at the same time as the numbers.
  // Recomputed rather than assigned once, because the repair path below
  // replaces record.counts with the last real round's numbers after this point
  // — and a note about counts that was written before counts settled is a note
  // about a number that is no longer there.
  const notePartition = (rec) => {
    const sizes = rec.rounds.map((r) => (r.struck || []).length);
    rec.rounds_partition_is_reconstructed =
      sizes.includes(rec.counts.sources_struck) ? null
        : `counts says the last round struck ${rec.counts.sources_struck} source(s), and no round in `
          + `rounds[] struck that many (${sizes.join(", ")}). The rounds were recovered by re-running `
          + `the classifier over a pre-strike index, which recovers the SET struck and not which run `
          + `struck it, so the per-round split is a reconstruction and the totals are not: `
          + `${rec.struck_sources.length} sources struck across ${rec.rounds.length} round(s) is measured.`;
    return rec;
  };
  notePartition(record);

  console.log(`— ${ADMISSION_RULE_ID} —`);
  for (const s of record.struck_sources)
    console.log(`  STRUCK  ${s.m_id.padEnd(5)} ${s.reason}  ·  ${s.evidence || "—"}\n          ${s.label}`);
  console.log(`\n  sources ${record.counts.sources_before} → ${record.counts.sources_before - struck.size}`
    + `  ·  routes ${routesBefore} → ${routesBefore - routesStruck} (${routesStruck} struck)`
    + `  ·  ${keysEmptied} keys left with no route`);
  if (emptied.length) console.log(`  e.g. ${emptied.join(" ")}`);

  if (DRY) { console.log("\n--dry — nothing written"); process.exit(0); }

  // A run with nothing new to strike still owes the record. The shards and
  // the index are only rewritten when something is actually struck, but the
  // audit file is repaired every run — otherwise a record that has drifted
  // from what is struck stays drifted forever, because the only code that
  // could fix it exits before reaching it.
  if (!struck.size) {
    let wrote = [];
    // A run that struck nothing has no round of its own, so its counts block
    // would be six zeros. Carrying the last real round's numbers forward is
    // what this file has always done and is right — as long as the block says
    // so, which is the whole of the fix: the numbers were never wrong, they
    // were unlabelled, and an unlabelled number is read as covering
    // everything there is.
    if (prior && prior.counts) {
      const { scope, ...n } = prior.counts;
      record.counts = { scope: COUNTS_SCOPE_SAY, ...n };
      notePartition(record);
    }
    // Compared on the whole record, not on one field. The old test was
    // `struck_sources.length differs`, which is blind to every repair that
    // does not change how many sources were struck — including this one: the
    // scope lines and the folded round would have been computed correctly,
    // found 49 === 49, and never been written. ran_at is stripped because it
    // moves every run and would make every run a rewrite.
    const stable = (r) => { const { ran_at, ...rest } = r || {}; return JSON.stringify(rest); };
    const recordAgrees = prior && stable(prior) === stable(record);
    if (!recordAgrees) {
      writeFileSync(priorPath, JSON.stringify(record, null, 1));
      wrote.push(`record ${(priorStruck || []).length} -> ${record.struck_sources.length} sources, `
        + `${(prior && prior.rounds || []).length} -> ${record.rounds.length} round(s)`);
    }
    // The index carries a summary OF the record, and a summary that disagrees
    // with what it summarizes is the same lie in a smaller font. It is synced
    // here even when nothing was struck, because the index is what the served
    // page reads and the record is only what a person opens.
    const cur = index.language_admission || {};
    // Compare every field the summary carries, not only the list length. A
    // sync keyed on one field leaves the others stale: the round count sat at
    // 4 in the index against 3 in the record because only struck_m_ids was
    // being compared, and 49 equalled 49. The comparison is now on the built
    // summary itself, so a field added to the summary is a field that syncs
    // without anybody remembering to add it to a condition.
    //
    // The index is the copy that matters most here. It is fetched by the
    // reader on every page load, which makes it the most public thing this
    // lane publishes and the one a peer lane reads — and the unlabelled 27
    // and 79,095 it carried are the numbers that actually travelled.
    const want = record.struck_sources.map((s) => s.m_id);
    const summary = {
      ...cur,
      rule_id: ADMISSION_RULE_ID,
      admitted_languages: ADMITTED_LANGUAGES,
      record: "data/language-admission-v1.json",
      struck_m_ids: want,
      rounds: record.rounds.length,
      counts: record.counts,
      cumulative: record.cumulative,
    };
    if (JSON.stringify(cur) !== JSON.stringify(summary)) {
      index.language_admission = summary;
      writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
      wrote.push(`index summary: ${(cur.struck_m_ids || []).length} -> ${want.length} ids, `
        + `${cur.rounds} -> ${record.rounds.length} round(s), counts and cumulative now name their scope`);
    }
    // The same repair for the counts: the index once said the shards weighed
    // 14,641,140 bytes when 12,898,585 were on disk, because the strike that
    // shrank them updated keys and routes and not the weight. The weight is
    // read off the disk here every run, so the index cannot describe a store
    // that is not the one shipped.
    {
      let onDisk = 0;
      for (const name of shardNames) onDisk += readFileSync(join(STORE, "shards", name)).length;
      const c = index.counts || {};
      if (c.shard_bytes_total !== onDisk || c.shards !== shardNames.length) {
        index.counts = { ...c, shards: shardNames.length, shard_bytes_total: onDisk };
        writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
        wrote.push(`index counts: shard bytes ${c.shard_bytes_total} -> ${onDisk}`);
      }
    }
    console.log(wrote.length
      ? `\nnothing new to strike · repaired: ${wrote.join(" · ")} across ${record.rounds.length} round(s)`
      : "\nalready struck — record and index agree, nothing to write");
    process.exit(0);
  }

  for (const [name, body] of rewritten)
    writeFileSync(join(STORE, "shards", name), gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 }));
  recordStruckRanks(STORE, struckRanks, {
    how: "written by the strike as it struck",
    before_store_version: index.store_version || null,
    admission_rule: ADMISSION_RULE_ID, struck_m_ids: [...struck],
    rows: struckRanks.rows, keys: struckRanks.keys_touched, on: new Date().toISOString().slice(0, 10),
  });

  // The store's identity is its bytes. The reader asks for a shard as
  // shards/xx.bin?v=<store_version>, so that token is the ONLY thing standing
  // between a returning reader and the copy already in their cache. Nothing
  // in this tree used to write it: the version shipped with the store and no
  // strike ever changed it, which means a strike rewrote the shelf and left
  // every warm cache serving the struck readings under an unchanged URL. A
  // strike that does not reach the reader is not a strike. So the version is
  // recomputed here from the shard bytes that were just written, and the
  // value it replaces is kept beside it — a store whose contents changed can
  // no longer wear the name of the store it used to be.
  const shardDigest = createHash("sha256");
  let shardBytes = 0;
  for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); shardDigest.update(b); shardBytes += b.length; }
  const before = index.store_version || null;
  index.store_version = shardDigest.digest("hex").slice(0, 12);
  index.store_version_history = [
    ...(index.store_version_history || []),
    { was: before, now: index.store_version, why: ADMISSION_RULE_ID, on: record.ran_at },
  ];
  record.store_version = { was: before, now: index.store_version,
    why: "the served shard URL carries this token; leaving it unchanged would let a warm cache keep serving struck readings" };
  index.m_sources = Object.fromEntries(Object.entries(index.m_sources).filter(([m]) => !struck.has(m)));
  index.language_admission = {
    rule_id: ADMISSION_RULE_ID,
    admitted_languages: ADMITTED_LANGUAGES,
    record: "data/language-admission-v1.json",
    struck_m_ids: record.struck_sources.map((s) => s.m_id),
    struck_this_round: [...struck],
    rounds: record.rounds.length,
    counts: record.counts,
    cumulative: record.cumulative,
  };
  // The counts describe the shards as shipped, so they are read off the
  // shards just written — a strike that shrank the shelf and left the index
  // saying the old weight described a store that was no longer there.
  index.counts = { ...index.counts, keys: keysBefore - keysEmptied, routes: routesBefore - routesStruck, shards: shardNames.length, shard_bytes_total: shardBytes };
  writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
  writeFileSync(join(K3, "data", "language-admission-v1.json"), JSON.stringify(record, null, 1));
  console.log(`\n  store_version ${before} → ${index.store_version}  (the shard URL changes, so warm caches refetch)`);
  console.log(`\nstore rewritten · data/language-admission-v1.json written`);
  console.log(`  repin with: node tools/emit-store-manifest-v1.mjs`);
}
