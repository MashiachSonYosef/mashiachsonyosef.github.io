#!/usr/bin/env node
// GUARDS: store-continuity-rule-v1-every-row-the-store-lost-is-a-row-a-rule-removed
//
// THE ROWS ARE ACCOUNTED FOR END TO END, OR THE STORE LOST SOMETHING.
//
// check-route-store-exact-k-v1 L9 already asks whether the index's counts are
// what the shards hold. That is CONSISTENCY, and it is not enough: a pass that
// drops rows and then re-emits the index from the shards it has left produces
// a perfectly consistent store that is missing rows. L9 passes. The loss
// becomes invisible the moment it is written down.
//
// That is not hypothetical. It happened here. The store before the language
// admission strike declared 774,277 routes; its shards held 773,847. 430 rows
// of one source — Strong's Hebrew concordance via Hebrew Wikisource, a source
// the gate keeps — were not in the copy the site was built from. The strike
// then ran, recomputed the counts, and every consistency check went green over
// a store 430 rows short, with no rule behind the loss. The corpus lane found
// it and named it; this side's own records prove it three ways.
//
// So this asks the other question: is every row the store no longer holds a
// row that a NAMED RULE removed?
//
//   C1  the whole strike closes: rows before − rows the strike struck = rows
//       served. A residue is rows lost with no rule behind them, and it is
//       named in routes, not in percentages
//   C2  round by round: each round's own routes_before is the round before
//       it, less what that round struck. A round whose input is smaller than
//       its predecessor's output is a round that was handed a short copy
//   C3  the struck-ranks record and the admission record agree on how many
//       routes the strike took, and name the same two store versions
//   C4  every version in the store's history moved for a reason the store can
//       name, and a fold-identity move (the pointing store landing) moved no
//       rows at all
//   C5  the per-source figures the index carries are what the shards hold —
//       the cuts_by_source table, which is the one per-source count the index
//       keeps, and which localised the 430 to its source
//
// Where a number the arithmetic needs is not on the shelf, this says so and
// does not guess. It never invents a "before" from the store in front of it.
//
// Run: node tools/check-store-continuity-v1.mjs [--store data/route-store]
//        [--pre <a pre-strike store index.json, for C1/C2/C5>]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

export const CONTINUITY_RULE_ID = "store-continuity-rule-v1-every-row-the-store-lost-is-a-row-a-rule-removed";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const note = (n, d) => console.log(`  --  ${n}  ·  ${d}`);
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
const n = (v) => (v === null || v === undefined ? "—" : Number(v).toLocaleString());

const STORE = arg("--store", "data/route-store");
if (!existsSync(join(STORE, "index.json"))) { console.log(`SKIPPED — no store at ${STORE}`); process.exit(3); }
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const la = index.language_admission || {};
const recPath = la.record && existsSync(la.record) ? la.record : "data/language-admission-v1.json";
const rec = existsSync(recPath) ? JSON.parse(readFileSync(recPath, "utf8")) : null;
const srPath = join(STORE, "struck-ranks-v1.json.gz");
const sr = existsSync(srPath) ? JSON.parse(gunzipSync(readFileSync(srPath)).toString("utf8")) : null;
console.log(`— ${STORE} · ${index.store_version} · ${n(index.counts && index.counts.routes)} routes —`);

// the pre-strike total: taken from a pre-strike index the caller names, or
// from the admission record's own first round if it carries one. Never from
// the store in front of us — that is the number under test.
const PRE = arg("--pre", "data/store-before-strike-witness-v1.json");
let preRoutes = null, preFrom = null;
if (PRE && existsSync(PRE)) { const p = JSON.parse(readFileSync(PRE, "utf8")); preRoutes = num(p.counts && p.counts.routes); preFrom = `${p.recovered_from || PRE} (${p.store_version})`; }
else if (rec && rec.cumulative && rec.cumulative.routes_before !== undefined) { preRoutes = num(rec.cumulative.routes_before); preFrom = "the admission record's cumulative block"; }

const served = num(index.counts && index.counts.routes);
const cumStruck = num(rec && rec.cumulative && rec.cumulative.routes_struck) ?? num(la.cumulative && la.cumulative.routes_struck);

// C1 — the whole strike closes
if (preRoutes === null) note("C1  the whole strike closes: rows before − rows struck = rows served",
  `no pre-strike total on the shelf, and this refuses to take one from the store under test — pass --pre <a pre-strike index.json>`);
else {
  const residue = preRoutes - (cumStruck ?? 0) - served;
  check("C1  the whole strike closes: rows before, less the rows it struck, are the rows served",
    residue === 0,
    `${n(preRoutes)} before (${preFrom}) − ${n(cumStruck)} struck = ${n(preRoutes - (cumStruck ?? 0))}, served ${n(served)}${residue === 0 ? "" : ` · ${n(Math.abs(residue))} row${Math.abs(residue) === 1 ? "" : "s"} ${residue > 0 ? "LOST WITH NO RULE BEHIND THEM" : "MORE THAN THE ARITHMETIC ALLOWS"}`}`);
}

// C2 — round by round
const rounds = (rec && Array.isArray(rec.rounds)) ? rec.rounds : [];
const roundCounts = rec && rec.counts ? rec.counts : null;
if (!roundCounts || roundCounts.routes_before === undefined) note("C2  round by round, each round's input is the round before it", "the admission record carries no per-round routes_before");
else if (preRoutes === null) note("C2  round by round, each round's input is the round before it", "no pre-strike total to start the chain from");
else {
  // the record keeps the LAST round's own before/struck; the rounds before it
  // are the cumulative less that round. Two rounds is what this can check
  // without a per-round routes figure on every round.
  const lastBefore = num(roundCounts.routes_before), lastStruck = num(roundCounts.routes_struck);
  const earlierStruck = (cumStruck ?? 0) - (lastStruck ?? 0);
  const shouldBe = preRoutes - earlierStruck;
  const gap = shouldBe - lastBefore;
  check("C2  the last round was handed what the rounds before it left, not a shorter copy",
    gap === 0,
    `rounds before it struck ${n(earlierStruck)} of ${n(preRoutes)}, leaving ${n(shouldBe)}; the last round records ${n(lastBefore)} in front of it${gap === 0 ? "" : ` · SHORT BY ${n(gap)} — the loss is at or before this round's input`}`);
  check("  and that round's own arithmetic closes", lastBefore - (lastStruck ?? 0) === served,
    `${n(lastBefore)} − ${n(lastStruck)} = ${n(lastBefore - (lastStruck ?? 0))}, served ${n(served)}`);
}

// C3 — the two records agree
if (!sr || !rec) note("C3  the struck-ranks record and the admission record agree", `${sr ? "" : "no struck-ranks record"}${!sr && !rec ? " and " : ""}${rec ? "" : "no admission record"} beside the store`);
else {
  const srRanks = num(sr.counts && sr.counts.ranks), made = (sr.made || [])[0] || {};
  const sameCount = srRanks === cumStruck;
  const sameAfter = made.after_store_version && (made.after_store_version === index.store_version || (index.store_version_history || []).some((h) => h.was === made.after_store_version || h.now === made.after_store_version));
  check("C3  the struck-ranks record and the admission record agree on the strike, and name the store it ran between",
    sameCount && !!made.before_store_version && !!sameAfter,
    `struck-ranks ${n(srRanks)} ranks · admission ${n(cumStruck)} routes · between ${made.before_store_version || "—"} and ${made.after_store_version || "—"}`);
}

// C4 — every version move names a reason, and a fold move moves no rows
const hist = index.store_version_history || [];
const unnamed = hist.filter((h) => !h.why);
const ps = index.pointing_store || {};
const foldMoves = hist.filter((h) => ps.rule && h.why === ps.rule);
check("C4  every version this store moved through names the rule that moved it",
  hist.length > 0 && unnamed.length === 0,
  `${hist.length} move(s)${unnamed.length ? ` · ${unnamed.length} with no rule named` : ""}${foldMoves.length ? ` · ${foldMoves.length} of them a fold-identity landing` : ""}`);
if (foldMoves.length) check("  and a fold-identity landing moved no rows: it is the same store with one slot added",
  ps.landable === true, `pointing_store.landable ${String(ps.landable)} — proved shard by shard by check-pointing-store-landing-v1`);

// C5 — the one per-source table the index keeps, against the shards
const witness = existsSync(PRE) ? JSON.parse(readFileSync(PRE, "utf8")) : null;
const cutsDeclared = (index.counts || {}).cuts_by_source || (witness && witness.cuts_by_source) || null;
if (!cutsDeclared) note("C5  the index's per-source cut counts are what the shards hold", "this index carries no cuts_by_source table");
else {
  const onDisk = new Map();
  let rows = 0;
  for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
    const d = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
    for (const rs of Object.values(d)) for (const r of rs) { rows += 1; if (r.length > 5 && r[5] === 1) onDisk.set(r[3], (onDisk.get(r[3]) || 0) + 1); }
  }
  // scoped to the sources this store still admits: a source the strike removed
  // holds no rows and no cuts BY THE RULE, and counting that as a shortfall
  // would be this check calling a named removal a loss
  const admitted = new Set(Object.keys(index.m_sources || {}));
  const off = [], byStrike = [];
  for (const [m, c] of Object.entries(cutsDeclared)) {
    const got = onDisk.get(m) || 0;
    if (num(c) === got) continue;
    if (!admitted.has(m)) { byStrike.push(m); continue; }
    off.push(`${m}: index says ${n(c)}, shards hold ${n(got)} (short ${n(num(c) - got)})`);
  }
  for (const [m, c] of onDisk) if (cutsDeclared[m] === undefined) off.push(`${m}: shards hold ${n(c)}, the index names none`);
  check("C5  the index's per-source cut counts are what the shards hold, for every source this store still admits",
    off.length === 0, off.length ? off.slice(0, 4).join(" · ") : `${Object.keys(cutsDeclared).length} sources named · ${byStrike.length} of them removed by the strike and holding none by that rule · ${n(rows)} rows walked`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
