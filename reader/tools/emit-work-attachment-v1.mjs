#!/usr/bin/env node
// GUARDS: work-attachment-rule-v1-parallel-numbering-is-not-intent
// LEDGER: V U
// what attaches to a location, and work-to-work relationals. Every row is a work naming a base and the relation it stands in to it.
//
//
// What every work that names another work stands in, recorded as U, X and V.
//
// The row is called a work, never a commentary. "-on-" is written the same by
// a commentary and by a translation, and 18 of the 32 here are Targum — an
// Aramaic translation is not a commentary because it shares a preposition.
//
// The owner's ruling, 2026-08-31, in his words: "commentary should auto open
// their base work," and "you'd need to ensure the commentary edition matches
// the original by intent, not proportionally (e.g. not same edition, but
// correctly pointed for each edition)."
//
// Those two sentences split along the U/V line the frame already draws.
//
//   U — the work-to-work standing. A commentary whose own recorded id names
//       its base is declaring that base itself. That is the attestation, and
//       it is enough to open the two together.
//
//   X — what attests the U. Here it is the commentary's own name, which is
//       the strongest kind of self-declaration available and the weakest kind
//       of external evidence: nobody outside the work has said it. Recorded
//       as what it is, never dressed up.
//
//   V — the unit-grain attachment: this segment of the commentary sits on
//       that passage of the base. This is what the second sentence governs,
//       and it is the one that must not be granted on numbering.
//
// Why numbering cannot be the evidence. A commentary's units and its base's
// units often run parallel — boaz-on-mishnah-beitzah-1-1 beside
// mishnah-beitzah-1-1 — and every one of them lands. That proves two
// numbering schemes agree. It does not prove the commentary is discussing
// that passage, and under editions, where chapters and mishnayot renumber,
// the arithmetic keeps pointing confidently at whatever now holds the number.
// Proportional, in the owner's word. So V is granted only on intent:
//
//   the catchword test — the commentary's own dibur hamatchil, quoted from
//   the passage it means, found in the passage the attachment claims
//
// A catchword that lands in the claimed unit and nowhere else confirms it. One
// that lands only somewhere else contradicts it. One that lands in many units
// is a common word and settles nothing. One that lands nowhere is not evidence
// of a variant unless the work it aims at is a work we serve — and a
// super-commentary's catchwords usually aim past the base at the commentary
// beneath it.
//
// Emitted from the zones on disk. Nothing here is typed: the pairs are found
// by id, the counts are measured, and a pair the shelf drops leaves the record
// on the next run.
//
// Run: node tools/emit-work-attachment-v1.mjs [--zones data/zones]
//        [--out data/work-attachment-v1.json]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const OUT = arg("out", join(K3, "data", "work-attachment-v1.json"));

export const ATTACH_RULE_ID = "work-attachment-rule-v1-parallel-numbering-is-not-intent";

// the marker a commentary writes before quoting: dalet, gershayim or the
// ASCII quote it is often typed as, then he — the abbreviation of
// dibur hamatchil. Written as codepoints: this file may reason about the
// script, it may not carry a glyph of it.
const DH = /\u05d3["\u05f4]\u05d4/;
// the catchword runs to the first word carrying a closing mark — where the
// commentary itself stops quoting. No closer inside five words means the
// boundary was not found and the site is not testable.
const CLOSER = /[\]).,:;]/;
// alef through tav — every Hebrew letter, nothing else. A catchword is
// compared on its letters, because the commentary is unpointed and the base
// is not, and a mark of pointing is not a difference of word.
const LETTERS_ONLY = /[^\u05d0-\u05ea]/g;
const MAX_CATCHWORD = 5;

const load = (f) => JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
const bare = (s) => String(s || "").replace(LETTERS_ONLY, "");

/** Every dibur hamatchil in a commentary zone, with its quoted catchword. */
export const catchwordsOf = (zone) => {
  const out = [];
  for (const sec of zone.sections || []) {
    const ws = sec.words || [];
    ws.forEach((w, i) => {
      if (!DH.test(w.s)) return;
      const cw = [];
      for (let j = i + 1; j < Math.min(i + 1 + MAX_CATCHWORD, ws.length); j += 1) {
        cw.push(ws[j]);
        if (CLOSER.test(ws[j].s)) break;
      }
      const bounded = cw.length && CLOSER.test(cw[cw.length - 1].s);
      out.push({
        unit: sec.unit,
        words: cw.length,
        text: cw.map((x) => x.s).join(" "),
        keys: cw.map((x) => bare(x.k)).filter(Boolean),
        boundary_found: bounded,
      });
    });
  }
  return out;
};

/** Which units of the base carry this exact sequence of keys, in order. */
const unitsCarrying = (base, keys) => {
  const hit = [];
  for (const sec of base.sections || []) {
    const ks = (sec.words || []).map((w) => bare(w.k));
    for (let i = 0; i + keys.length <= ks.length; i += 1)
      if (keys.every((k, j) => ks[i + j] === k)) { hit.push(sec.unit); break; }
  }
  return hit;
};

// The atlas knows how many units every work has, served or not — so a base
// that is not on the shelf can still say how big it is.
const ATLAS = JSON.parse(readFileSync(join(K3, "data", "corpus-atlas-v1.json"), "utf8"));
const baseUnitsOf = {};
(function walk(o) {
  if (!o || typeof o !== "object") return;
  if (o.id && typeof o.units === "number") baseUnitsOf[String(o.id).split("/").pop()] = o.units;
  for (const v of Object.values(o)) walk(v);
})(ATLAS);

const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
const onShelf = new Set(bins.map((f) => f.replace(/\.bin$/, "")));

// A work declares its base in its own id: "<work>-on-<base>". What it does
// NOT declare is the relation. "On" is not a kind: Boaz comments on the
// Mishnah, Targum Jonathan translates Isaiah, and both spell it "-on-". So
// the target is read from the name and the relation is read only where the
// name actually carries a word for it — targum being the Aramaic translation
// of a book, which names itself. Everything else stands UNDETERMINED, because
// deciding between commentary-of, translation-of and recension-of on no
// evidence is the invention this record exists to refuse.
const RELATION_WORDS = [
  { pattern: /^targum-/, relation: "translation-of",
    because: "the work's own name begins with targum, the Aramaic translation of a book" },
];
const pairs = [];
for (const f of bins) {
  const id = f.replace(/\.bin$/, "");
  const at = id.indexOf("-on-");
  if (at < 0) continue;
  const target = id.slice(at + 4);
  const named = RELATION_WORDS.find((r) => r.pattern.test(id));
  pairs.push({
    id, target, targetServes: onShelf.has(target),
    relation: named ? named.relation : "UNDETERMINED",
    baseUnits: baseUnitsOf[target] || null,
    relationBecause: named ? named.because
      : "the name gives the target and not the kind: \"-on-\" is written the same by a commentary, "
      + "a translation and a set of notes. U's relation awaits something that says which.",
  });
}

// A work that carries a unit for every unit of its base runs PARALLEL to it:
// it stands instead of the text, aligned. One that carries units for a
// fraction of it is SELECTIVE: it stands about the text, at chosen places.
// That is the difference between a translation and a commentary, and it is
// measurable — so the shape is read from coverage and never from the name.
// Coverage gives the family; the name, where it carries a word for it, gives
// which of U s parallel kinds. Neither is guessed.
const shapeOf = (p, units, labelOverlap) => {
  if (!p.baseUnits) return { verdict: "UNKNOWN", because: "the atlas has no unit count for the base" };
  const coverage = units / p.baseUnits;
  const pct = `${(100 * coverage).toFixed(0)}%`;

  // Coverage is a ratio of two unit counts, and that means nothing unless the
  // two works number the same way. The notes on Midrash Lekach Tov to Esther
  // carry 254 units labelled by chapter and verse of Esther; the midrash they
  // annotate carries 10, which is how many chapters Esther has. 254 over 10 is
  // not 2540% of anything — it is verses over chapters. So the numbering is
  // established first, by whether this work's own unit labels exist in the
  // base's label space, and only a work that numbers the same way is asked
  // what fraction of the base it covers.
  if (labelOverlap === null) {
    // The labels cannot be read, but an exact agreement between two counts
    // derived independently — this work's own sections, and the atlas's figure
    // for the base — is not a coincidence that happens to a work numbering by
    // some other scheme. It is weaker than reading the labels and it is not
    // nothing, so it is recorded as its own verdict rather than being thrown
    // in with the genuinely unknown.
    if (units === p.baseUnits)
      return { verdict: "PARALLEL_BY_COUNT", units, base_units: p.baseUnits, coverage: pct, exact: true,
        because: "the base is not on the shelf and its labels cannot be read, but this work carries "
          + "exactly as many units as the atlas records for the base. Two counts derived apart from "
          + "each other landing on the same number is evidence of the same numbering; it is not the "
          + "same as having checked, and this verdict says which one it is." };
    return { verdict: "SCHEME_UNVERIFIED", units, base_units: p.baseUnits, ratio_of_counts: pct,
      because: "the base is not on the shelf, so its unit labels cannot be read, and the counts do not "
        + "agree. The ratio of the two is recorded and is not a coverage figure: two works numbering "
        + "differently produce a ratio that says nothing about how much of the base is covered." };
  }
  if (labelOverlap < 0.9)
    return { verdict: "NUMBERS_DIFFERENTLY", units, base_units: p.baseUnits, ratio_of_counts: pct,
      label_overlap: `${(100 * labelOverlap).toFixed(0)}%`,
      because: "fewer than nine in ten of this work's unit labels stand in the base's label space, so "
        + "the two number by different schemes and no ratio between their counts is a coverage figure" };

  const verdict = coverage >= 0.95 && coverage <= 1.05 ? "PARALLEL"
    : coverage < 0.95 ? "SELECTIVE" : "LARGER_THAN_ITS_BASE";
  return {
    verdict, units, base_units: p.baseUnits, coverage: pct, exact: units === p.baseUnits,
    label_overlap: `${(100 * labelOverlap).toFixed(0)}%`,
    because: verdict === "PARALLEL"
      ? "the two number the same way, and there is a unit for every unit of the base — it stands "
        + "instead of the text, aligned"
      : verdict === "SELECTIVE"
      ? "the two number the same way, and this work carries units for a fraction of the base — it "
        + "stands about the text, at chosen places"
      : "more units than the base has, under the same numbering — a divergence between the two, "
        + "not a shape",
  };
};

// What fraction of this work's own unit labels stand in the base's label
// space. This, and not a count of rows, is what says whether two works number
// the same way: Boaz writes ten times more per note than the Mishnah does, and
// numbers by exactly the same chapter and mishnah. Verbosity is not grain.
// null when the base is not on the shelf and its labels cannot be read.
const labelOverlapFor = (p, C) => {
  if (!p.targetServes) return null;
  const B = load(`${p.target}.bin`);
  const baseLabels = new Set((B.sections || []).map((s) => s.label));
  const mine = (C.sections || []).map((s) => s.label);
  if (!mine.length) return null;
  return mine.filter((l) => baseLabels.has(l)).length / mine.length;
};

// A unit whose text the source opens with a round bracket is the source
// saying something about that unit's standing, not about a word inside it.
// Targum Jonathan brackets Joshua 21:36-37 — the Levitical cities of Reuben,
// Bezer, Jahzah, Kedemoth and Mephaath — which are present in some Masoretic
// manuscripts and absent from others, and it brackets Isaiah 50:10-11 the same
// way. Our Joshua carries 656 units and the Targum 658: the divergence and the
// editor's own mark of it are both in the data.
//
// This records where the mark is and says nothing about what it means. Which
// tradition each side follows is an attestation nobody here has, and naming
// the editions on both sides is the work that ruling calls for — not choosing
// between them.
const bracketedUnits = (zone) => {
  const out = [];
  const secs = zone.sections || [];
  for (let i = 0; i < secs.length; i += 1) {
    const ws = (secs[i].words || []).map((w) => String(w.s));
    if (!ws.length || !ws[0].startsWith("(")) continue;
    // the bracket may close in this unit or in a later one; walk until it does
    let closesAt = null;
    for (let j = i; j < Math.min(i + 8, secs.length); j += 1) {
      const t = (secs[j].words || []).map((w) => String(w.s)).join(" ");
      if (t.includes(")")) { closesAt = secs[j].label; break; }
    }
    out.push({ opens_at: secs[i].label, closes_at: closesAt, unclosed: closesAt === null });
  }
  return out;
};

const rows = [];
for (const p of pairs) {
  const C = load(`${p.id}.bin`);
  const marks = catchwordsOf(C);
  const testableMarks = marks.filter((m) => m.boundary_found && m.keys.length);

  const row = {
    work: p.id,
    units: (C.sections || []).length,
    U: {
      relation: p.relation,
      shape: shapeOf(p, (C.sections || []).length, labelOverlapFor(p, C)),
      units_the_source_brackets: bracketedUnits(C),
      relation_read_from: p.relationBecause,
      target: p.target,
      target_on_the_shelf: p.targetServes,
      may_open_together: p.targetServes,
      withheld_reason: p.targetServes ? null
        : "the base work is not on the shelf, so there is nothing to open beside it",
    },
    X: {
      attests: "U",
      kind: p.relation === "UNDETERMINED" ? "THE_WORK_NAMES_ITS_OWN_TARGET" : "THE_WORK_NAMES_ITS_OWN_TARGET_AND_RELATION",
      evidence: p.id,
      strength: "self-declaration — the work's own recorded id names what it stands on. Nobody outside "
        + "the work has said it, and this record does not pretend otherwise.",
    },
  };

  if (!p.targetServes) {
    row.V = {
      granted: false,
      reason: "BASE_NOT_ON_THE_SHELF",
      note: "no base to test intent against; the question is not reached",
    };
    rows.push(row);
    continue;
  }

  const B = load(`${p.target}.bin`);
  const baseUnits = new Set((B.sections || []).map((s) => s.unit));

  // what numbering alone would claim: the commentary's unit id with the
  // commentary's own prefix removed, looked for among the base's unit ids
  const prefix = p.id.slice(0, p.id.indexOf("-on-") + 4);
  let parallel = 0;
  for (const s of C.sections || [])
    if (baseUnits.has(String(s.unit).replace(prefix, ""))) parallel += 1;

  // what intent says
  let confirm = 0, contradict = 0, nowhere = 0, ambiguous = 0;
  const witnesses = [];
  for (const m of testableMarks) {
    const claimed = String(m.unit).replace(prefix, "");
    const carriers = [...new Set(unitsCarrying(B, m.keys))];
    let verdict;
    if (!carriers.length) { nowhere += 1; verdict = "LANDS_NOWHERE"; }
    else if (!carriers.includes(claimed)) { contradict += 1; verdict = "LANDS_ONLY_ELSEWHERE"; }
    else if (carriers.length > 1) { ambiguous += 1; verdict = "LANDS_HERE_AND_ELSEWHERE__SETTLES_NOTHING"; }
    else { confirm += 1; verdict = "LANDS_HERE_AND_ONLY_HERE"; }
    if (witnesses.length < 8)
      witnesses.push({ claimed_unit: claimed, catchword: m.text, words: m.words, verdict,
        units_carrying_it: carriers.length });
  }

  row.V = {
    granted: confirm > 0 && contradict === 0,
    reason: confirm > 0 && contradict === 0 ? "INTENT_SHOWN_BY_CATCHWORD" : "NO_INTENT_EVIDENCE",
    numbering_only: {
      commentary_units: (C.sections || []).length,
      base_units: baseUnits.size,
      units_whose_number_exists_in_the_base: parallel,
      weight: "none — this is the proportional pointing the ruling refuses. Two schemes agreeing "
        + "about numbers says nothing about which passage is meant, and renumbers with the edition.",
    },
    catchword_test: {
      markers_found: marks.length,
      boundary_not_found: marks.length - testableMarks.length,
      tested: testableMarks.length,
      confirm_the_claimed_unit: confirm,
      contradict_it: contradict,
      land_here_and_elsewhere: ambiguous,
      land_nowhere: nowhere,
    },
    witnesses,
  };
  rows.push(row);
}

const served = rows.filter((r) => r.U.target_on_the_shelf);
const record = {
  schema: "work-attachment-v1",
  rule_id: ATTACH_RULE_ID,
  emitted_by: "tools/emit-work-attachment-v1.mjs",
  emitted_on: new Date().toISOString().slice(0, 10),
  derived_from: "the zones on disk — the pairs are found by id, the counts are measured, and nothing here is typed",
  ruling:
    "A commentary attaches at unit grain only when its intent is shown: its own catchwords, quoted from "
    + "the passage it means, found in the passage the attachment claims. Numbering that runs parallel is "
    + "not intent — it is proportional pointing, and it renumbers with the edition. A commentary with no "
    + "intent evidence still stands as its own work and opens beside its base at work grain, on the "
    + "strength of its own name.",
  ruled_by:
    "the owner, 2026-08-31, in his words: \"commentary should auto open their base work\" and "
    + "\"you'd need to ensure the commentary edition matches the original by intent, not proportionally "
    + "(e.g. not same edition, but correctly pointed for each edition)\"",
  totals: {
    works_declaring_a_base: rows.length,
    by_relation: rows.reduce((m, r) => { m[r.U.relation] = (m[r.U.relation] || 0) + 1; return m; }, {}),
    base_on_the_shelf: served.length,
    base_missing: rows.length - served.length,
    U_attested: rows.length,
    V_granted: rows.filter((r) => r.V.granted).length,
    V_refused_for_want_of_intent: rows.filter((r) => r.V.reason === "NO_INTENT_EVIDENCE").length,
    units_the_source_brackets: rows.reduce((n, r) => n + (r.U.units_the_source_brackets || []).length, 0),
    catchwords_tested: served.reduce((n, r) => n + (r.V.catchword_test?.tested || 0), 0),
    catchwords_confirming: served.reduce((n, r) => n + (r.V.catchword_test?.confirm_the_claimed_unit || 0), 0),
  },
  pairs: rows,
};

writeFileSync(OUT, JSON.stringify(record, null, 1));
const t = record.totals;
console.log(`${t.works_declaring_a_base} works declare a base · ${t.base_on_the_shelf} of those bases serve`);
console.log(`  by relation: ${JSON.stringify(t.by_relation)}`);
console.log(`  U attested by the work's own name : ${t.U_attested}`);
console.log(`  V granted on shown intent          : ${t.V_granted}`);
console.log(`  V refused for want of intent       : ${t.V_refused_for_want_of_intent}`);
console.log(`  catchwords tested ${t.catchwords_tested} · confirming ${t.catchwords_confirming}`);
console.log(`written to ${OUT}`);
