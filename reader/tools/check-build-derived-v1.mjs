#!/usr/bin/env node
// GUARDS: plan-rule-v1-the-build-is-derived-and-every-fact-prints-its-basis, work-record-rule-v1-a-ledger-wins-and-a-typed-entry-dies-the-day-one-lands
//
// The build is derived, the derivation is true, and the script cannot slide
// back to naming works by hand.
//
// Three claims, each of which has actually been false here:
//
//   1. Every parameter the plan derives agrees with what the published zone's
//      own receipts record. This is the proof that deriving from the Y ledger
//      is safe: the zone was built from typed values, so if ledger-derived
//      values equal the zone's receipts, the typed values were copies all
//      along — which is the finding, said with numbers. c0 range against the
//      identity oracle, unit count against the sealed count, chapter count
//      against the zone's nodes, both titles against the masthead, the work
//      id against the bridge receipt.
//
//   2. Every published work is reachable by the plan — from a ledger, or from
//      a typed entry that says TYPED_AWAITING_LEDGER to its face. A work the
//      plan cannot reach would silently stop being rebuilt, which is how four
//      stale zones once stayed on the server for months.
//
//   3. build.sh names no work. No c0 range, no work id, no title, no slug in
//      its code — comments may tell history, code may not repeat it. The
//      thirty-two literals this replaces were each one edit away from
//      contradicting the record they copied.
//
// Reads off disk, re-derives the plan fresh so a stale build/ cannot vouch
// for itself. Takes no URL.
//
// Run: node tools/check-build-derived-v1.mjs

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// ---- the plan, derived fresh ----------------------------------------------
let planOut = "";
let planCode = 0;
try {
  planOut = execFileSync("node", [join(K3, "tools", "plan-build-v1.mjs"),
    "--out", "build/.check-plan.json", "--tsv", "build/.check-plan.tsv"],
  { cwd: K3, encoding: "utf8" });
} catch (e) { planCode = e.status ?? 1; planOut = String(e.stdout || "") + String(e.stderr || ""); }
if (!existsSync(join(K3, "build", ".check-plan.json"))) {
  console.log("FAIL  the plan tool produced no plan");
  console.log(planOut.split("\n").map((l) => "      " + l).join("\n"));
  process.exit(1);
}
const plan = JSON.parse(readFileSync(join(K3, "build", ".check-plan.json"), "utf8"));

console.log(`— the plan derives, and says what from —`);
check("  the plan tool ran to a plan", planCode === 0 || (plan.in_the_work_directory_and_not_planned || []).length > 0,
  `${plan.works.length} works · ${plan.planned_from.ledgers.length} from a ledger`);
for (const w of plan.works)
  check(`  ${w.work_id} carries a basis and its source`,
    ["SEALED_Y_LEDGER", "TYPED_AWAITING_LEDGER", "WITHHELD_ADDRESS_ONLY"].includes(w.basis) && !!w.derived_from,
    `${w.basis} · ${w.derived_from}`);

// ---- 1 · derivation against the zones' own receipts ------------------------
console.log(`\n— what the plan derives equals what the zones' receipts record —`);
const ZONES = join(K3, "data", "zones");
const zoneOf = new Map();
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin"))) {
  const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
  if ((z.emitted_from || {}).test_instrument) continue;
  // Only what the comparison below reads is kept. This map used to hold every
  // whole zone, and at 3,390 zones that is more than one heap holds: the check
  // died mid-run, and a check that dies reports nothing while reading as red.
  if (Array.isArray(z.sections) && z.sections.length) zoneOf.set(f.replace(/\.bin$/, ""), {
    emitted_from: { identity_oracle: (z.emitted_from || {}).identity_oracle },
    work_receipts: z.work_receipts, work: z.work, work_he: z.work_he,
    counts: { sections: (z.counts || {}).sections }, nodes: new Array((z.nodes || []).length),
  });
}
// A work the record holds has no zone on purpose. This loop used to demand one
// from every work the plan named, so withdrawing three works turned three
// deliberate holdings into three red lines that said nothing was published —
// which is true, and is the point, and is not a failure. What IS a failure is
// a held work that built a zone anyway, and that is asserted instead.
for (const w of plan.works) {
  const z = zoneOf.get(w.published_as);
  if (w.serve_state === "WITHHELD") {
    check(`  ${w.work_id} is withheld and built no zone`, !z,
      z ? `a zone was built for a work the record holds` : `held since ${w.withheld_since}`);
    continue;
  }
  if (!z) { check(`  ${w.work_id} has a published zone to check against`, false, `nothing published as ${w.published_as}`); continue; }
  const oracle = (z.emitted_from || {}).identity_oracle || {};
  const wr = typeof z.work_receipts === "string" ? z.work_receipts : ((z.work_receipts || {}).b_n || "");
  const rows = [];
  if (oracle.first_c0_numeric_id !== undefined) {
    // a zone whose identity is positional (the restore route, until the
    // corpus lane's registry assigns the sealed ids) carries no sealed range
    // to agree with: the plan's range is the ledger's and the zone says whose
    // its ids are; the row prints both and does not call that a disagreement
    const positional = ((((z.emitted_from || {}).walk || {}).identity || {}).tier === "PROTOTYPE_POSITIONAL");
    rows.push(["c0 range", `${w.c0_first}-${w.c0_last}`, positional ? `${oracle.first_c0_numeric_id}-${oracle.last_c0_numeric_id} (positional; the sealed range awaits the registry)` : `${oracle.first_c0_numeric_id}-${oracle.last_c0_numeric_id}`,
      positional || (w.c0_first === oracle.first_c0_numeric_id && w.c0_last === oracle.last_c0_numeric_id)]);
    rows.push(["unit count", w.unit_count, oracle.sealed_units, w.unit_count === oracle.sealed_units]);
  } else {
    rows.push(["unit count", w.unit_count, (z.counts || {}).sections, w.unit_count === (z.counts || {}).sections]);
  }
  rows.push(["work id", w.work_id, wr.includes(`work_id=${w.work_id}`) ? w.work_id : wr.slice(0, 40), wr.includes(`work_id=${w.work_id}`)]);
  rows.push(["English title", w.title_en, z.work, w.title_en === z.work]);
  rows.push(["Hebrew title", w.title_he || "(none)", z.work_he || "(none)", (w.title_he || "") === (z.work_he || "")]);
  if (w.basis === "SEALED_Y_LEDGER") {
    const raw = readFileSync(join(K3, w.y_fixture), "utf8");
    const fx = JSON.parse(raw.slice(raw.indexOf("{")).replace(/;\s*$/u, ""));
    const chapters = (fx.nodes || []).filter((n) => n.node_kind === "CHAPTER" && n.content_work_id === w.work_id).length;
    rows.push(["chapters", chapters, (z.nodes || []).length, chapters === (z.nodes || []).length]);
  }
  const off = rows.filter((r) => !r[3]);
  check(`  ${w.work_id} · ${rows.length} parameters agree`, off.length === 0,
    off.length ? off.map((r) => `${r[0]}: plan ${r[1]} vs zone ${r[2]}`).join(" | ")
      : rows.map((r) => `${r[0]} ${r[1]}`).join(" · ").slice(0, 110));
}

// ---- 2 · nothing published is out of the plan's reach ----------------------
//
// data/zones is the work directory and may hold scratch — the in-line
// commentary check keeps its fixture there. site/ is the published set, and
// there a zone the plan does not reach is a stale work being served, which is
// exactly how four dead zones once stayed live for months.
console.log(`\n— nothing published is out of the plan's reach —`);
const planned = new Set(plan.works.map((w) => w.published_as));
const SITE = join(K3, "site", "data", "zones");
if (existsSync(SITE)) {
  const unplanned = readdirSync(SITE).filter((x) => x.endsWith(".bin"))
    .map((f) => f.replace(/\.bin$/, "").replace(/-commentary$/, ""))
    .filter((slug) => !planned.has(slug));
  check("  every zone the site serves is one the plan builds", unplanned.length === 0,
    unplanned.length ? `serving with no plan entry: ${[...new Set(unplanned)].join(", ")}`
      : `${readdirSync(SITE).filter((x) => x.endsWith(".bin")).length} served, all planned`);
} else {
  console.log("  --  no site/ here to compare against — the work directory alone is not the published set");
}
for (const o of (plan.in_the_work_directory_and_not_planned || []))
  console.log(`        in the work directory, not planned, not published: ${o.file} (${o.work})`);

// ---- 3 · and the script cannot name a work again ---------------------------
console.log(`\n— build.sh names no work in its code —`);
const src = readFileSync(join(K3, "build.sh"), "utf8")
  .split("\n").map((l) => l.replace(/(^|\s)#.*$/u, "")).join("\n");
const c0Literals = src.match(/\b\d{8}\b/g) || [];
check("  no c0 range is typed in it", c0Literals.length === 0,
  c0Literals.length ? `found ${c0Literals.slice(0, 4).join(", ")}` : "0 eight-digit literals in code");
const idLiterals = src.match(/\b(tanakh|targum)\/[a-z-]+/g) || [];
check("  no work id is typed in it", idLiterals.length === 0,
  idLiterals.length ? `found ${[...new Set(idLiterals)].join(", ")}` : "0");
const named = plan.works.flatMap((w) => [w.title_en, w.published_as])
  .filter((t) => new RegExp(`(["']|\\b)${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(["']|\\b)`, "u").test(src));
check("  no title and no slug is typed in it", named.length === 0,
  named.length ? `found ${named.join(", ")}` : `checked ${plan.works.length * 2} names`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
