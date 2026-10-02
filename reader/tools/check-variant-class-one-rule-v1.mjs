#!/usr/bin/env node
// GUARDS: variant-site-grouping-v1-one-alignment-rule-per-encoding-class
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The fleet holds a set of works for RAW_SITE_AWAITS_KQ_REVIEW: each carries
// parenthesis- or bracket-wrapped runs of corpus script that no standing
// review covers. The grouping tool reads every held work's served text and
// files the work under one encoding class by the shape its sites take. The
// declaring file says why:
//
//   "a Q map must be BUILT per work, and its input is an alignment — but
//    each ENCODING CLASS needs one alignment rule, not 110 bespoke reviews."
//
// So the rule is one alignment rule per encoding class. The tool's output is
// build/variant-site-grouping-v1.json and a CSV of the same rows for the
// channel. This check reads that output and judges it against the tool's own
// law, quoted from the tool's source rather than retyped here: the shape set
// is the shapes literal, the class set is the class expression, and the rule
// a class names is the shape's own description in the tool's header.
//
//   L1  the grouping ledger was written under the rule the tool declares
//   L2  every work in the ledger has exactly one class
//   L3  the class set is closed: every class is one the tool can emit
//   L4  every class present names one alignment rule
//   L5  a work's class is the one the tool's own law computes from its counts
//   L6  a work's shape counts sum to its sites
//   L7  json and csv agree row for row
//   L8  the grouping covers exactly the works the fleet holds for the review
//
// L8 is the one that goes stale. The fleet ledger is re-run; the grouping is
// not re-run with it; a work newly held for the review has no class and so no
// rule will be written for it. That is a red, not a note.
//
// What this check does NOT prove: that the alignment rules themselves have
// been written, that the shape fingerprints are right (it does not re-scan
// any served text), or that a work filed MIXED has since been given its own
// review. It proves the grouping is one whole, closed, consistent ledger over
// the held set, so the rules can be written once per class.
//
// Run: node tools/check-variant-class-one-rule-v1.mjs [--grouping build/variant-site-grouping-v1.json]
//                                                     [--csv build/variant-site-grouping-v1.csv]
//                                                     [--fleet build/fleet-ledger-v2.json]
//                                                     [--tool tools/group-variant-sites-v1.mjs]
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const GROUPING = arg("grouping", join(K3, "build", "variant-site-grouping-v1.json"));
const CSV = arg("csv", join(K3, "build", "variant-site-grouping-v1.csv"));
const FLEET = arg("fleet", join(K3, "build", "fleet-ledger-v2.json"));
const TOOL = arg("tool", join(HERE, "group-variant-sites-v1.mjs"));

const RULE = "variant-site-grouping-v1-one-alignment-rule-per-encoding-class";
const HOLD_REASON = /RAW_SITE_AWAITS_KQ_REVIEW/;

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (xs, n = 3) => xs.filter(Boolean).slice(0, n).join(" · ");

if (!existsSync(GROUPING)) { console.log(`SKIPPED — no grouping ledger at ${GROUPING}`); process.exit(3); }
if (!existsSync(CSV)) { console.log(`SKIPPED — no grouping csv at ${CSV}`); process.exit(3); }
if (!existsSync(TOOL)) { console.log(`SKIPPED — no declaring tool at ${TOOL}, so the law this check quotes cannot be read`); process.exit(3); }

// ── the tool's own law ────────────────────────────────────────────────────
// The shape set is the shapes literal the tool writes into every row. The
// class expression names what else a class can be: the mixed prefix and the
// two literals for a work that yielded no shape at all.
const src = readFileSync(TOOL, "utf8");
const shapesLiteral = (src.match(/shapes:\s*\{([^}]*)\}/) || [])[1] || "";
const SHAPES = [...shapesLiteral.matchAll(/([A-Z][A-Z0-9]*)\s*:/g)].map((m) => m[1]);
const classLine = (src.match(/\.class = (.+);/) || [])[1] || "";
const NO_SHAPE_CLASSES = [...classLine.matchAll(/"([A-Z_]+)"/g)].map((m) => m[1]);
const MIXED = (classLine.match(/`([A-Z_]+)\$\{/) || [])[1] || null;
const TWO_THIRDS = /total \* \(2 \/ 3\)/.test(classLine);
const OWN_EYES = /needs its own eyes/.test(src);

// The rule a shape names: its line in the tool's header, first line only.
const describe = {};
for (const m of src.matchAll(/^\/\/ {3}([A-Z][A-Z0-9]*) +(.+)$/gm)) if (SHAPES.includes(m[1]) && !describe[m[1]]) describe[m[1]] = m[2].trim();

const CLOSED = new Set([...SHAPES, ...(MIXED ? SHAPES.map((s) => MIXED + s) : []), ...NO_SHAPE_CLASSES]);
// class -> the one rule it names, or null when it names none. A no-shape
// class is closed (the tool emits it) and rule-less (nothing was grouped).
const ruleOf = (cls) => {
  if (SHAPES.includes(cls) && describe[cls]) return `${cls}: ${describe[cls]}`;
  if (MIXED && cls.startsWith(MIXED)) {
    const top = cls.slice(MIXED.length);
    return SHAPES.includes(top) && describe[top] && OWN_EYES ? `${top} rule, under the work's own eyes` : null;
  }
  return null;
};

// ── the ledger ────────────────────────────────────────────────────────────
const g = JSON.parse(readFileSync(GROUPING, "utf8"));
const rows = Array.isArray(g.ledger) ? g.ledger : [];
const present = new Map();
for (const r of rows) present.set(String(r.class), (present.get(String(r.class)) || 0) + 1);

console.log(`— ${rows.length} works · ${present.size} classes present · ${SHAPES.length} shapes declared by the tool (${SHAPES.join(" ")}) —\n`);

// L1
check("L1  the grouping ledger was written under the rule the tool declares",
  g.rule === RULE && src.includes(`"${RULE}"`),
  g.rule === RULE ? (src.includes(`"${RULE}"`) ? `ran ${g.ran_at || "(undated)"}` : "the tool no longer declares this rule")
    : `the ledger names ${JSON.stringify(g.rule)}`);

// L2 — one class per work: a class on every row, no work twice, and the
// tool's own tallies (works, classes) agree with the rows.
const noClass = rows.filter((r) => typeof r.class !== "string" || !r.class).map((r) => r.work);
const seen = new Set(), twice = [];
for (const r of rows) { if (seen.has(r.work)) twice.push(r.work); seen.add(r.work); }
const tally = g.classes || {};
const tallyOff = [...new Set([...Object.keys(tally), ...present.keys()])].filter((c) => (tally[c] || 0) !== (present.get(c) || 0));
const tallySum = Object.values(tally).reduce((a, b) => a + b, 0);
check("L2  every work in the ledger has exactly one class",
  rows.length > 0 && noClass.length === 0 && twice.length === 0 && g.works === rows.length && tallyOff.length === 0 && tallySum === rows.length,
  !rows.length ? "the ledger is empty"
    : noClass.length ? `${noClass.length} without a class — ${few(noClass)}`
      : twice.length ? `${twice.length} filed twice — ${few(twice)}`
        : g.works !== rows.length ? `works says ${g.works}, ledger holds ${rows.length}`
          : tallyOff.length ? `class tally disagrees with the rows for ${few(tallyOff)}`
            : tallySum !== rows.length ? `class tally sums to ${tallySum} over ${rows.length} works`
              : `${rows.length} works, ${rows.length} classes, the tally sums to ${tallySum}`);

// L3 — closed set
const open = [...present.keys()].filter((c) => !CLOSED.has(c));
const tallyOpen = Object.keys(tally).filter((c) => !CLOSED.has(c));
check("L3  the class set is closed: every class is one the tool can emit",
  CLOSED.size > 0 && open.length === 0 && tallyOpen.length === 0,
  !CLOSED.size ? "no class set could be read from the tool"
    : open.length || tallyOpen.length ? `outside the set: ${few([...new Set([...open, ...tallyOpen])], 4)}`
      : `${CLOSED.size} classes possible, ${present.size} present: ${[...present.keys()].sort().join(" ")}`);

// L4 — one rule per class present. A no-shape class holds works that were
// never grouped; they count as works whose class names no rule.
const ruleless = [...present.keys()].filter((c) => !ruleOf(c));
const rulelessWorks = rows.filter((r) => ruleless.includes(String(r.class))).map((r) => `${r.work} (${r.class})`);
const mixedN = MIXED ? rows.filter((r) => String(r.class).startsWith(MIXED)).length : 0;
check("L4  every class present names one alignment rule",
  present.size > 0 && ruleless.length === 0,
  ruleless.length ? `${rulelessWorks.length} work(s) in a class that names no rule — ${few(rulelessWorks)}`
    : `${present.size} classes resolve to ${new Set([...present.keys()].map(ruleOf)).size} rules` +
      (mixedN ? `; ${mixedN} work(s) are ${MIXED}* and take their shape's rule under their own eyes` : ""));

// L5 — the class is the one the tool's law computes: dominant shape, two
// thirds to hold it alone, the mixed prefix otherwise, no-shape literals when
// nothing was counted. Ties fall to the first key, as the tool's sort does.
const misfiled = [];
if (TWO_THIRDS && NO_SHAPE_CLASSES.length === 2) {
  const [ERR, NONE] = NO_SHAPE_CLASSES;
  for (const r of rows) {
    const shapes = r.shapes || {};
    const total = Object.values(shapes).reduce((a, b) => a + b, 0);
    const [top, n] = Object.entries(shapes).sort((a, c) => c[1] - a[1])[0] || ["", 0];
    const want = total === 0 ? (r.error ? ERR : NONE) : (n >= total * (2 / 3) ? top : `${MIXED || ""}${top}`);
    if (want !== r.class) misfiled.push(`${r.work} is ${r.class}, its counts say ${want}`);
  }
}
check("L5  a work's class is the one the tool's own law computes from its counts",
  TWO_THIRDS && NO_SHAPE_CLASSES.length === 2 && misfiled.length === 0,
  !TWO_THIRDS ? "the tool's threshold is no longer two thirds; this check must be rewritten before it can judge"
    : NO_SHAPE_CLASSES.length !== 2 ? `expected two no-shape classes in the tool, read ${NO_SHAPE_CLASSES.length}`
      : misfiled.length ? `${misfiled.length} misfiled — ${few(misfiled)}`
        : `${rows.length} recomputed, none differ`);

// L6 — shapes sum to sites, over the declared shape set and nothing else
const offSum = [], strayShape = [];
for (const r of rows) {
  const shapes = r.shapes || {};
  const keys = Object.keys(shapes);
  if (keys.length !== SHAPES.length || keys.some((k) => !SHAPES.includes(k))) strayShape.push(`${r.work} counts ${keys.join(" ")}`);
  const total = keys.reduce((a, k) => a + (Number(shapes[k]) || 0), 0);
  if (total !== r.sites) offSum.push(`${r.work} sums to ${total}, sites ${r.sites}`);
}
const sitesAll = rows.reduce((a, r) => a + (Number(r.sites) || 0), 0);
check("L6  a work's shape counts sum to its sites",
  offSum.length === 0 && strayShape.length === 0,
  strayShape.length ? `${strayShape.length} count a shape the tool does not declare — ${few(strayShape)}`
    : offSum.length ? `${offSum.length} off — ${few(offSum)}`
      : `${sitesAll.toLocaleString()} sites over ${rows.length} works, every row sums`);

// L7 — the csv is the ledger, row for row, written the way the tool writes it
const csvLines = readFileSync(CSV, "utf8").split("\n");
if (csvLines.length && csvLines[csvLines.length - 1] === "") csvLines.pop();
const header = `work,family,units,sites,${SHAPES.join(",")},class,example`;
const csvRow = (r) => {
  const e = (r.examples || [])[0];
  return [r.work, r.family, r.units, r.sites, ...SHAPES.map((s) => (r.shapes || {})[s]), r.class,
    JSON.stringify(e ? `${e.unit} w${e.word}` : "")].join(",");
};
const disagree = [];
for (let i = 0; i < Math.max(rows.length, csvLines.length - 1); i += 1) {
  const want = rows[i] ? csvRow(rows[i]) : null, got = csvLines[i + 1] ?? null;
  if (want !== got) disagree.push(`line ${i + 2}: ${want === null ? "csv row with no ledger row" : got === null ? `${rows[i].work} has no csv row` : `${rows[i].work} differs`}`);
}
check("L7  json and csv agree row for row",
  csvLines[0] === header && disagree.length === 0,
  csvLines[0] !== header ? `header is ${JSON.stringify(csvLines[0] || "")}`
    : disagree.length ? `${disagree.length} row(s) — ${few(disagree)}`
      : `${csvLines.length - 1} csv rows match ${rows.length} ledger rows in order`);

// L8 — the grouping is over the held set and nothing else. Read from the
// fleet's own ledger by the same test the tool uses to draw its list.
if (!existsSync(FLEET)) {
  console.log(`  --  no fleet ledger at ${FLEET}; whether the grouping covers every held work went unasked`);
} else {
  const f = JSON.parse(readFileSync(FLEET, "utf8"));
  const held = (f.ledger || []).filter((r) => r.verdict === "HOLD" && HOLD_REASON.test(r.reason || ""));
  const heldSet = new Set(held.map((r) => r.work));
  const unclassed = held.filter((r) => !seen.has(r.work)).map((r) => r.work);
  const notHeld = rows.filter((r) => !heldSet.has(r.work)).map((r) => r.work);
  const when = `fleet ran ${f.ran_at || "(undated)"}, grouping ran ${g.ran_at || "(undated)"}`;
  check("L8  the grouping covers exactly the works the fleet holds for the review",
    held.length > 0 && unclassed.length === 0 && notHeld.length === 0,
    !held.length ? `the fleet ledger holds no work for the review; ${when}`
      : unclassed.length ? `${unclassed.length} held work(s) have no class — ${few(unclassed, 4)}; ${when}`
        : notHeld.length ? `${notHeld.length} grouped work(s) are not held — ${few(notHeld, 4)}; ${when}`
          : `${held.length} held, ${rows.length} grouped, the same set; ${when}`);
}

console.log("\n  what this does not say: that an alignment rule has been WRITTEN for any");
console.log("  class, or that the shapes were counted rightly. This check does not re-scan");
console.log("  served text. It says the grouping is one closed, consistent ledger over the");
console.log("  held set, each work under one class and each class under one rule, so the");
console.log("  review can be written once per class and not once per work.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
