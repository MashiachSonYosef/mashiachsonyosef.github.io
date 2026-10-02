#!/usr/bin/env node
// GUARDS: language-admission-rule-v1-a-source-that-is-not-hebrew-or-aramaic-cannot-define-an-a
//
// The strike is a one-time act; this is the standing law. It re-derives the
// admission decision from each source's own label — it does not trust the
// struck list — so a catalog shipped tomorrow carrying a Yiddish, Ladino or
// Judeo-Arabic lexicon fails here rather than reaching a page.
//
// Three places a non-admitted source could stand:
//   1. the store index, as an M record
//   2. a store shard, as a route pointing at an M the index no longer holds
//   3. a published zone, as the licence chip under a printed English word
//
// The third is the one a reader sees, so it is checked against the zones on
// disk and not inferred from the first two.
//
// Run: node tools/check-language-admitted-v1.mjs [--zones data/zones]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { classify, ADMISSION_RULE_ID, ADMITTED_LANGUAGES } from "./strike-language-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const STORE = join(K3, "data", "route-store");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

console.log(`— ${ADMISSION_RULE_ID} —`);
console.log(`  admitted: ${ADMITTED_LANGUAGES.join(", ")}\n`);

const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));

// 0 · the strike is on record, with its reasoning, where anyone can read it
const RECORD = join(K3, "data", "language-admission-v1.json");
check("the admission record stands beside the store", existsSync(RECORD), "data/language-admission-v1.json");
if (existsSync(RECORD)) {
  const rec = JSON.parse(readFileSync(RECORD, "utf8"));
  check("  every struck source carries the label and phrase that struck it",
    (rec.struck_sources || []).length > 0
      && rec.struck_sources.every((s) => s.m_id && s.label && s.reason && (s.evidence || s.reason.includes("NAMES_NO"))),
    `${(rec.struck_sources || []).length} struck, each with its evidence`);
}

// 1 · the index
const inIndex = Object.entries(index.m_sources)
  .map(([m, v]) => [m, v.label, classify(v.label)])
  .filter(([, , d]) => !d.admitted);
check("no source in the store index names a language outside Hebrew and Aramaic",
  inIndex.length === 0,
  inIndex.length ? inIndex.map(([m, , d]) => `${m} (${d.evidence})`).join(" · ") : `${Object.keys(index.m_sources).length} sources, all admitted`);

// 2 · the shards
let routes = 0; const orphaned = new Map();
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const rows of Object.values(body)) for (const r of rows) {
    routes += 1;
    if (!index.m_sources[r[3]]) orphaned.set(r[3], (orphaned.get(r[3]) || 0) + 1);
  }
}
check("no route in any shard points at a source the index does not hold",
  orphaned.size === 0,
  orphaned.size ? [...orphaned].map(([m, n]) => `${m}×${n}`).join(" ") : `${routes.toLocaleString()} routes, every M present`);

// 3 · the zones — what a reader would actually meet
const bins = existsSync(ZONES) ? readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort() : [];
const offenders = [];
let zonesRead = 0, glossesRead = 0, offenderCount = 0;
for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  for (const [k, v] of Object.entries(z.gloss_m || {})) {
    glossesRead += 1;
    if (classify(v.m || "").admitted) continue;
    offenderCount += 1;
    if (offenders.length < 10)
      offenders.push(`${z.work} · ${k} = "${(z.gloss || {})[k] || ""}" from ${classify(v.m || "").evidence}`);
  }
}
check("no published zone prints a reading from a non-admitted source",
  offenderCount === 0,
  offenderCount
    ? `${offenderCount} readings — ${offenders.join(" | ")}`
    : `${zonesRead} zones, ${glossesRead.toLocaleString()} licensed readings, all admitted`);

// 4 · EVERY COUNT SAYS WHAT IT WAS COUNTED OVER.
//
// The strike ran in rounds, and the counts block describes ONE of them while
// the struck list covers all of them: 27 sources and 79,095 routes next to 49
// ids. Nothing in either number was wrong. What was missing was the set each
// was taken over, and a number with no set beside it is read as covering
// everything there is — the same law the owner ruled for the counts panel on
// the card, and the same fault as a mark that sits on every word.
//
// This one is not theoretical. The unlabelled figure travelled to the peer
// lane, was restated there as the whole strike, and had to be corrected in
// both directions. The index is the copy that carries it: the reader fetches
// it on every page load, so it is the most public sentence this lane writes
// about its own strike.
{
  const la = index.language_admission || {};
  const rec = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, "utf8")) : null;
  const saysScope = (c) => !!(c && typeof c.scope === "string" && /\bnot the whole strike\b/iu.test(c.scope));

  check("  the index's counts say they are one round and not the strike",
    saysScope(la.counts), la.counts ? `scope: ${JSON.stringify((la.counts || {}).scope || null)}` : "no counts block");
  check("  and the record's counts say the same",
    !rec || saysScope(rec.counts), rec ? `scope: ${JSON.stringify((rec.counts || {}).scope || null)}` : "no record");

  // The cumulative figure is the one a stranger actually wants, so it has to
  // be there, and the parts of it this lane cannot establish have to be null
  // rather than filled with the nearest number to hand.
  const cum = la.cumulative || {};
  check("  a cumulative figure stands beside them, covering every round",
    Number.isInteger(cum.sources_struck) && cum.sources_struck === (la.struck_m_ids || []).length,
    `cumulative says ${cum.sources_struck} source(s) struck; the struck list holds ${(la.struck_m_ids || []).length}`);
  // A cumulative route figure is either measured and says where from, or it is
  // null and says why. What it may never be is a number with nothing behind
  // it — which is how a one-round count came to stand for a whole strike in
  // the first place.
  const from = cum.routes_and_keys_from || null;
  check("  a cumulative route count either names its source or is null with its reason",
    cum.routes_struck === null
      ? typeof cum.why_keys_left_with_no_route_is_null === "string"
      : Number.isFinite(cum.routes_struck) && !!from && !!from.record && !!from.how,
    cum.routes_struck === null ? "null, reason given"
      : `${Number(cum.routes_struck).toLocaleString()} routes over ${Number(cum.keys_touched || 0).toLocaleString()} keys, from ${from ? from.record : "nowhere named"}`);
  // And it must cover the whole strike, not a part of it wearing the word
  // "cumulative" — the exact substitution this section exists to stop.
  check("  and it covers every struck source, not a subset",
    cum.routes_struck === null || (from && from.covers_m_ids === (la.struck_m_ids || []).length),
    from ? `covers ${from.covers_m_ids} of ${(la.struck_m_ids || []).length} struck ids` : "no source named");

  // A round is a delta. The total written down as an event is not a round, and
  // the shelf carried one for a fortnight: three rounds of 10, 39 and 49 for a
  // strike of 49, the third holding no id the other two did not.
  const rounds = (rec && rec.rounds) || [];
  const sets = rounds.map((r) => new Set(r.struck || []));
  const restating = sets.filter((s, i) => {
    const others = new Set(sets.filter((_, j) => j !== i).flatMap((x) => [...x]));
    return sets.length > 1 && s.size === others.size && [...s].every((m) => others.has(m));
  });
  check("  no round in the record is the total wearing a round's clothes",
    restating.length === 0,
    restating.length ? `${restating.length} round(s) hold exactly what the others hold between them`
      : `${rounds.length} round(s), each with ids the others do not have`);
  check("  the index agrees with the record on how many rounds there were",
    !rec || la.rounds === rec.rounds.length, `index ${la.rounds} · record ${rec ? rec.rounds.length : "—"}`);

  // And where the file disagrees with itself it says so, rather than being
  // quietly corrected into agreement it has not earned.
  const sizes = rounds.map((r) => (r.struck || []).length);
  const agrees = !rec || sizes.includes((rec.counts || {}).sources_struck);
  check("  a partition the record cannot establish is marked as reconstructed",
    agrees || typeof (rec.rounds_partition_is_reconstructed) === "string",
    agrees ? "counts and rounds[] agree on the last round" : "counts and rounds[] disagree, and the record says so");
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
