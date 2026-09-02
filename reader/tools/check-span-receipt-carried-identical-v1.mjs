#!/usr/bin/env node
// GUARDS: span-carry-rule-v1-a-receipt-may-travel-only-to-a-table-proved-identical
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// A span receipt says which sealed file a zone's component layer came from,
// by path and by sha256. Two zones once shipped with the layer and no receipt,
// and the fix was not to write one by hand but to carry the neighbor's, and
// only after proving the two tables were the same table. The declaring tool,
// tools/carry-span-receipt-v1.mjs, puts it this way:
//
//     "This compares the two tables completely before it copies anything:
//      every key on both sides, and for each key the component surfaces, the
//      roles, the split rule and the confidence, compared after resolving
//      both zones' interning tables. One difference anywhere and nothing is
//      written."
//
// and, on the one thing it refuses to do:
//
//     "it will not carry a receipt onto a partial match. A table that covers
//      some of the target's keys is a withholding ... and the honest answer
//      there is a build with the template rather than a receipt over a
//      subset."
//
// The tool proves identity on the day it runs. Nothing proves it afterwards.
// A zone can be respanned, a source can be rebuilt against a newer template,
// a source can be withdrawn from the shelf, and the carried receipt goes on
// saying "the same table, form for form" about a table that is no longer
// that. This check reads every zone whose receipt says it was carried and
// asks the question again, today, against the zone it names.
//
// How a carried receipt is marked. The tool writes, under
// emitted_from.span_layer, a receipt_carried object holding the rule id, the
// path it was carried from (from), the source work's name (from_work), and a
// sentence saying what was proved. It copies the source zone's own source
// (path, bytes, sha256) into the target's span_layer.source and records the
// target's form count in forms_with_a_component_system. Those are the fields
// judged here.
//
//   L0  the declaring tool still declares the rule this check guards
//   L1  every carried mark names the carry rule and another zone on this disk
//   L2  the two span tables are identical, key for key and component for
//       component: surfaces, roles, split rule, confidence, both sides resolved
//       through their own interning tables
//   L3  the receipt that traveled is the receipt the source zone carries now,
//       by path and sha256, and the source zone has one of its own to give
//   L4  the carried receipt's form count is this zone's form count
//   L5  no zone carries spans and no receipt at all
//
// L5 is check-sealed-layers-v1's question too. It is asked here as well
// because a table with no receipt is the exact state the carry tool was
// written to end, and a check about carrying should say when there is
// something left to carry.
//
// What this does NOT prove: that the sealed file the receipt names is the
// file the source zone was really built from. That is the source zone's own
// receipt and the build's honesty, and check-sealed-layers-v1 reads it. Nor
// that the source zone's table is right; only that the carried zone's table
// is the same one. A receipt over an identical wrong table is still a
// receipt over that table.
//
// Run: node tools/check-span-receipt-carried-identical-v1.mjs [--zones data/zones]
//                                                             [--tool tools/carry-span-receipt-v1.mjs]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { basename, dirname, isAbsolute, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const TOOL = arg("tool", join(K3, "tools", "carry-span-receipt-v1.mjs"));

const RULE_ID = "span-carry-rule-v1-a-receipt-may-travel-only-to-a-table-proved-identical";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

// ── L0 · the declaring tool ────────────────────────────────────────────────
// The tool cannot be imported: it reads its flags at load and exits without
// them. Its source is read as text instead, the way the frame record is
// quoted by the checks that rule on it. The id it exports is the id it writes
// into every receipt it carries, so the two must agree or the marks judged
// below are marks of some other rule.
if (existsSync(TOOL)) {
  const m = readFileSync(TOOL, "utf8").match(/CARRY_RULE_ID\s*=\s*"([^"]+)"/);
  const declared = m ? m[1] : null;
  check("L0  the declaring tool still declares the rule this check guards",
    declared === RULE_ID,
    declared === RULE_ID ? `quoted from ${basename(TOOL)}`
      : declared ? `the tool now declares ${declared}` : "no CARRY_RULE_ID found in the tool");
} else {
  console.log(`  --  no carry tool at ${TOOL}; the rule id is taken from this file's GUARDS line this run`);
}

// ── the shelf, read once ──────────────────────────────────────────────────
const readZone = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));

// The tool's own comparison, kept in step with it: what a zone says about a
// form, with every interned index turned back into the thing it names.
const resolveTable = (z) => {
  const out = new Map();
  for (const [k, sp] of Object.entries(z.spans || {}))
    out.set(k, JSON.stringify([
      sp[0],
      (sp[1] || []).map((i) => (z.span_roles || [])[i]),
      (z.span_rules || [])[sp[2]],
      (z.span_conf || [])[sp[3]],
    ]));
  return out;
};

// Where a carried receipt's `from` points. The tool records the path it was
// handed, relative to the engine directory. The directory under check is
// tried first so a fixture is judged against its own copy of a source.
const locate = (from) => {
  const s = String(from || "");
  if (!s) return null;
  const tried = [join(ZONES, basename(s)), isAbsolute(s) ? s : join(K3, s)];
  return tried.find((p) => existsSync(p)) || null;
};

const carried = [];               // { f, path, work, table, layer, mark }
const bare = [];                  // spans and no receipt at all
let zonesRead = 0, unreadable = 0, instruments = 0, formsTotal = 0;
for (const f of bins) {
  const p = join(ZONES, f);
  let z;
  try { z = readZone(p); } catch { unreadable += 1; continue; }
  zonesRead += 1;
  const ef = z.emitted_from || {};
  if (ef.test_instrument) instruments += 1;
  const forms = Object.keys(z.spans || {}).length;
  formsTotal += forms;
  const layer = ef.span_layer || null;
  const src = (layer || {}).source || {};
  if (forms > 0 && !(src.path && src.sha256)) {
    if (bare.length < 12) bare.push(`${z.work || f} (${forms.toLocaleString()} forms)`); else bare.push(null);
  }
  if (layer && layer.receipt_carried) {
    carried.push({ f, path: resolvePath(p), work: String(z.work || f), table: resolveTable(z), layer, mark: layer.receipt_carried });
  }
}

console.log(`— ${zonesRead} zones · ${formsTotal.toLocaleString()} component systems · ${carried.length} receipt${carried.length === 1 ? "" : "s"} carried` +
  (instruments ? ` · ${instruments} test instrument${instruments === 1 ? "" : "s"}` : "") +
  (unreadable ? ` · ${unreadable} unreadable` : "") + " —\n");

// ── L1..L4 · every carried receipt, asked again today ─────────────────────
const badMark = [], notSame = [], drifted = [], miscounted = [];
let formsCompared = 0, sourcesRead = 0;
for (const c of carried) {
  const mark = c.mark || {};
  const label = c.work;

  // L1 · the mark is a mark of this rule and points at another zone on disk
  const srcPath = locate(mark.from);
  if (mark.rule !== RULE_ID) { badMark.push(`${label}: marked under ${mark.rule || "no rule"}`); continue; }
  if (!srcPath) { badMark.push(`${label}: from ${JSON.stringify(String(mark.from || ""))} is not on this disk`); continue; }
  if (resolvePath(srcPath) === c.path) { badMark.push(`${label}: carried from itself`); continue; }

  let s;
  try { s = readZone(srcPath); } catch { badMark.push(`${label}: ${basename(srcPath)} cannot be read`); continue; }
  sourcesRead += 1;

  // L2 · the two tables, compared the way the tool compared them
  const A = c.table, B = resolveTable(s);
  const onlyHere = [...A.keys()].filter((k) => !B.has(k));
  const onlyThere = [...B.keys()].filter((k) => !A.has(k));
  const differ = [...A.keys()].filter((k) => B.has(k) && A.get(k) !== B.get(k));
  formsCompared += A.size;
  if (A.size === 0 || onlyHere.length || onlyThere.length || differ.length) {
    const ex = differ.length ? ` e.g. ${differ.slice(0, 2).join(", ")}` : onlyHere.length ? ` e.g. ${onlyHere.slice(0, 2).join(", ")}` : "";
    notSame.push(`${label} vs ${s.work || basename(srcPath)}: ${A.size.toLocaleString()} here, ${B.size.toLocaleString()} there, ` +
      `${onlyHere.length} only here, ${onlyThere.length} only there, ${differ.length} differ${ex}`);
  }

  // L3 · the receipt on this zone is the receipt the source zone carries now
  const mine = (c.layer || {}).source || {};
  const theirs = ((s.emitted_from || {}).span_layer || {}).source || {};
  if (!(theirs.path && theirs.sha256)) drifted.push(`${label}: ${s.work || basename(srcPath)} names no sealed file of its own`);
  else if (mine.path !== theirs.path || mine.sha256 !== theirs.sha256)
    drifted.push(`${label}: carries ${String(mine.path || "no path")} ${String(mine.sha256 || "no sha").slice(0, 12)}, ` +
      `source now says ${theirs.path} ${theirs.sha256.slice(0, 12)}`);

  // L4 · the count the receipt states is the count this zone has
  const stated = (c.layer || {}).forms_with_a_component_system;
  if (stated !== A.size) miscounted.push(`${label}: receipt says ${stated ?? "nothing"}, zone holds ${A.size.toLocaleString()}`);
}

const none = "no receipt has traveled on this shelf, so there was nothing to judge";
const first = (xs, n = 3) => xs.filter(Boolean).slice(0, n).join(" · ");

check("L1  every carried mark names the carry rule and another zone on this disk",
  badMark.length === 0,
  badMark.length ? `${badMark.length} cannot be judged — ${first(badMark)}`
    : carried.length ? `${carried.length} mark${carried.length === 1 ? "" : "s"}, each naming a source zone that is here` : none);

check("L2  the two span tables are identical, key for key and component for component",
  notSame.length === 0,
  notSame.length ? `${notSame.length} not the same table — ${first(notSame, 2)}`
    : sourcesRead ? `${formsCompared.toLocaleString()} forms compared on surfaces, roles, split rule and confidence across ${sourcesRead} pair${sourcesRead === 1 ? "" : "s"}; 0 differ, 0 on one side only`
      : none);

check("L3  the receipt that traveled is the receipt the source zone carries now",
  drifted.length === 0,
  drifted.length ? `${drifted.length} drifted — ${first(drifted, 2)}`
    : sourcesRead ? "same sealed file by path and sha256 on both sides of every carry" : none);

check("L4  the carried receipt's form count is this zone's form count",
  miscounted.length === 0,
  miscounted.length ? `${miscounted.length} miscounted — ${first(miscounted)}`
    : sourcesRead ? "every carried receipt counts the table it sits on" : none);

// ── L5 · what is left to carry ────────────────────────────────────────────
check("L5  no zone carries spans and no receipt at all",
  bare.length === 0,
  bare.length ? `${bare.length} table${bare.length === 1 ? "" : "s"} with no sealed file named — ${first(bare)}`
    : `every one of the ${(zonesRead - instruments).toLocaleString()} zones with a component layer names the sealed file it came from`);

console.log("\n  what this does not say: that the sealed file a receipt names is the file the");
console.log("  source zone was built from, or that the source's table is right. It says that");
console.log("  a receipt which traveled still sits on the table it was proved against, and");
if (!carried.length) {
  console.log("  on this shelf none has traveled. L1 to L4 found nothing to judge; that is a");
  console.log("  fact about the shelf, and the gate stands so a carry cannot arrive unmet.");
} else {
  console.log(`  it says so for ${carried.length} of them today.`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
