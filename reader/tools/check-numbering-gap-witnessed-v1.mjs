#!/usr/bin/env node
// GUARDS: numbering-gap-rule-v1-a-witnessed-gap-is-a-fact-not-a-fault
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE RULE. When the sealed unit ids of a work skip a chapter number, the
// zone says so. tools/build-zone.mjs, section 3a, declares it:
//
//   "A witnessed skip ADMITS — the sealed ids skip it, so the shelf skips it
//    — recorded as a typed fact on the zone's own receipts, each gap named
//    (after N, next M). A witnessed start-offset ADMITS the same way (the
//    recorded shape where an introduction displaces the count). Nothing is
//    renumbered and no ordinal is invented to fill a gap."
//
// and, on the other half of the same gate:
//
//   "Two sealed units claiming the same address cannot both be that address:
//    a DUPLICATE ordinal still refuses."
//
// WHY IT EXISTS. The gate used to refuse any chapter sequence that was not
// exactly 1..N. The corpus lane measured the whole bridge on 2026-08-30:
// 1,027 works carry witnessed skips or start-offsets and none carries a
// duplicate ordinal. So 863 works joined the shelf with their gaps recorded
// instead of being held for them. A gap that is recorded is a fact a reader
// can see. A gap that is silently absorbed, or a declaration that names a
// gap the ids do not have, is the page saying something about the book that
// the sealed ids do not say.
//
// The record lives at emitted_from.numbering on the zone:
//   { rule_id, starts_at?, gaps: [{ after, next }, ...], note }
// and is absent when the chapters run 1..N with no skip.
//
// THE LAWS. The witnessed chapters are read off each section's sealed unit
// id with the builder's own parser (parseWorkCoordinates in zone-lib-v1),
// anchored on the work id the zone's receipt names, so the check reads the
// ids exactly the way the builder read them.
//
//   L0  the declaring file still carries the rule under this id, so this
//       check has something to enforce
//   L1  every witnessed skip is declared: where the chapters skip from N to
//       M, the zone's gaps list names { after: N, next: M }
//   L2  every declared gap is witnessed: no gaps entry names a skip the
//       chapters do not make
//   L3  a start-offset is declared exactly: starts_at is the first chapter
//       when that chapter is not 1, and absent when it is
//   L4  contiguous numbering from 1 declares no gap and no start: no gap or start-offset on
//       a zone whose chapters run 1..N without a skip
//   L5  a declaration is typed: it names this rule id, gaps is an array of
//       integer pairs with next > after + 1, starts_at is an integer if given
//   L6  nothing renumbered, no ordinal invented: the zone's nodes carry
//       exactly the witnessed chapter numbers in order, and each section
//       points at the node of its own chapter
//   L7  a collision is a fault: no two sections of a zone claim the same
//       coordinate label
//   L8  the shape this check reads the ids under is the shape the zone was
//       built under, so the witnessed chapters are the builder's and not a
//       different reading of the same ids
//
// WHAT THIS DOES NOT PROVE. That the skip is right. The sealed ids skip a
// chapter because the source has none, or because the capture lost one; this
// check cannot tell which, and does not try. That is the corpus lane's
// question. It does not open a page to see the gap printed. It does not read
// commentary zones, which another builder writes with no numbering record.
//
// Run: node tools/check-numbering-gap-witnessed-v1.mjs [--zones data/zones]
//                                                      [--builder tools/build-zone.mjs]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseWorkCoordinates } from "./zone-lib-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const BUILDER = arg("builder", join(K3, "tools", "build-zone.mjs"));

const RULE_ID = "numbering-gap-rule-v1-a-witnessed-gap-is-a-fact-not-a-fault";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(BUILDER)) { console.log(`SKIPPED — no declaring file at ${BUILDER}, so the rule cannot be quoted`); process.exit(3); }
if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }

// L0 — the premise. A check whose rule has been edited out of the builder
// is judging zones against a law nobody declares any more.
const builderSrc = readFileSync(BUILDER, "utf8");
const guarded = builderSrc.includes(`// GUARDS: ${RULE_ID}`);
const emitted = builderSrc.includes(`rule_id: "${RULE_ID}"`);
check("L0  the declaring file still carries the rule under this id",
  guarded && emitted,
  guarded && emitted
    ? `quoted from ${BUILDER.split("/").slice(-2).join("/")}: the gate is guarded and the record names the rule`
    : `${guarded ? "" : "no GUARDS line for it; "}${emitted ? "" : "no numbering record naming it; "}the builder no longer declares this rule`);

const slugs = zonesOnDisk(ZONES);
if (!slugs.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

// A short list of offenders, with a count of the rest. Twelve names is
// enough to open one; the count is what says how wide it is.
const bucket = () => ({ n: 0, names: [] });
const add = (b, name) => { b.n += 1; if (b.names.length < 12) b.names.push(name); };
const said = (b, none) => b.n ? `${b.n} zone(s) — ${b.names.slice(0, 4).join(" · ")}` : none;

const gapKey = (g) => `${g.after}>${g.next}`;
const isInt = (v) => Number.isInteger(v);

const undeclared = bucket(), phantom = bucket(), startWrong = bucket(), spurious = bucket();
const untyped = bucket(), renumbered = bucket(), collided = bucket(), reshaped = bucket();
let zonesRead = 0, unreadable = 0, declared = 0, gapsWitnessed = 0, gapsDeclared = 0, startsWitnessed = 0;
const shapesSeen = new Map();

for (const slug of slugs) {
  const f = `${slug}.bin`;
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { unreadable += 1; continue; }
  zonesRead += 1;
  const sections = z.sections || [];
  const ef = z.emitted_from || {};

  // The builder anchors the parse on the tail of --work. The receipt carries
  // that work id, and the file name stands in only when the receipt does not.
  const m = String((z.work_receipts || {}).b_n || "").match(/work_id=([^\s·]+)/u);
  const workSlug = m ? m[1].split("/").pop() : slug;

  // ── what the sealed ids witness, read the builder's way ──────────────────
  const { shape, coords } = parseWorkCoordinates(sections.map((s) => s.unit), workSlug);
  shapesSeen.set(shape, (shapesSeen.get(shape) || 0) + 1);
  const chapters = [...new Set([...coords.values()].map((c) => c.chapter))].sort((a, b) => a - b);
  const witnessed = [];
  for (let i = 1; i < chapters.length; i += 1)
    if (chapters[i] !== chapters[i - 1] + 1) witnessed.push({ after: chapters[i - 1], next: chapters[i] });
  const startsAt = chapters.length && chapters[0] !== 1 ? chapters[0] : null;
  gapsWitnessed += witnessed.length;
  if (startsAt !== null) startsWitnessed += 1;

  // L8 — the zone names the shape it was built under; the parser must still
  // decide the same one, or the chapters above are not the builder's.
  const builtShape = String(ef.coordinate_shape || "").split(/\s/u)[0];
  if (builtShape && builtShape !== shape) add(reshaped, `${slug} (built ${builtShape}, read ${shape})`);

  // ── what the zone declares ───────────────────────────────────────────────
  const num = ef.numbering || null;
  const declaredGaps = num && Array.isArray(num.gaps) ? num.gaps : [];
  if (num) { declared += 1; gapsDeclared += declaredGaps.length; }

  // L5 — typed, or it is not a record of anything
  if (num) {
    const wellFormed = num.rule_id === RULE_ID
      && Array.isArray(num.gaps)
      && num.gaps.every((g) => g && isInt(g.after) && isInt(g.next) && g.next > g.after + 1)
      && (num.starts_at === undefined || (isInt(num.starts_at) && num.starts_at > 1));
    if (!wellFormed) add(untyped, `${slug} (${num.rule_id === RULE_ID ? "malformed gaps or starts_at" : `rule_id ${JSON.stringify(num.rule_id)}`})`);
  }

  // L1 / L2 — the two directions of the same equality, reported apart so the
  // red names which way the zone lies
  const w = new Set(witnessed.map(gapKey));
  const d = new Set(declaredGaps.filter((g) => g && isInt(g.after) && isInt(g.next)).map(gapKey));
  const missing = witnessed.filter((g) => !d.has(gapKey(g)));
  const invented = declaredGaps.filter((g) => !(g && w.has(gapKey(g))));
  if (missing.length) add(undeclared, `${slug} (after ${missing[0].after}, next ${missing[0].next}${missing.length > 1 ? ` +${missing.length - 1}` : ""})`);
  if (invented.length) add(phantom, `${slug} (${invented[0] && isInt(invented[0].after) ? `after ${invented[0].after}, next ${invented[0].next}` : "malformed"})`);

  // L3 — the start-offset, both directions
  const declaredStart = num && num.starts_at !== undefined ? num.starts_at : null;
  if (declaredStart !== startsAt)
    add(startWrong, `${slug} (first chapter ${chapters.length ? chapters[0] : "none"}, declared ${declaredStart === null ? "nothing" : declaredStart})`);

  // L4 — silence where there is nothing to say. A record that names a gap or
  // a start the ids do not witness is the fault; a record that names none
  // and carries only what the ids witness (the named shape writes one, so
  // the reader can see its ordinals were read, not built) says nothing false.
  if (num && !witnessed.length && startsAt === null
      && ((Array.isArray(num.gaps) && num.gaps.length) || num.starts_at !== undefined)) add(spurious, slug);

  // L6 — the nodes are the witnessed chapters and nothing else
  const nodes = z.nodes || [];
  const nodeNums = nodes.map((nd) => nd && nd.num);
  let nodesAgree = nodeNums.length === chapters.length && nodeNums.every((v, i) => v === chapters[i]);
  if (nodesAgree) {
    for (const s of sections) {
      const c = coords.get(s.unit);
      const nd = nodes[s.node];
      if (!c || !nd || nd.num !== c.chapter) { nodesAgree = false; break; }
    }
  }
  if (!nodesAgree) add(renumbered, `${slug} (nodes ${JSON.stringify(nodeNums.slice(0, 6))}${nodeNums.length > 6 ? "..." : ""} vs ids ${JSON.stringify(chapters.slice(0, 6))}${chapters.length > 6 ? "..." : ""})`);

  // L7 — one address, one unit
  const labels = new Set();
  let dup = null;
  for (const s of sections) {
    if (labels.has(s.label)) { dup = s.label; break; }
    labels.add(s.label);
  }
  if (dup !== null) add(collided, `${slug} (label ${JSON.stringify(dup)} claimed twice)`);
}

console.log(`\n— ${zonesRead} zones read${unreadable ? ` (${unreadable} unreadable)` : ""} · ${declared} declare a numbering record · ` +
  `${gapsWitnessed} gaps witnessed, ${gapsDeclared} declared · ${startsWitnessed} start-offsets witnessed · ` +
  `shapes ${[...shapesSeen.entries()].map(([s, n]) => `${s} x${n}`).join(", ")} —\n`);

check("L1  every witnessed skip is declared as a gap",
  undeclared.n === 0,
  said(undeclared, `${gapsWitnessed} witnessed skip(s), each named in its zone's record`));

check("L2  every declared gap is a skip the sealed ids make",
  phantom.n === 0,
  said(phantom, `${gapsDeclared} declared gap(s), none the ids fail to witness`));

check("L3  a start-offset is declared exactly when the first chapter is not 1",
  startWrong.n === 0,
  said(startWrong, startsWitnessed ? `${startsWitnessed} zone(s) start past 1 and say so` : "every zone starts at 1 and none says otherwise"));

check("L4  contiguous numbering from 1 declares no gap and no start",
  spurious.n === 0,
  said(spurious, `${zonesRead - declared} zone(s) run 1..N unbroken and carry no record`));

check("L5  every numbering record is typed under this rule",
  untyped.n === 0,
  said(untyped, declared ? `${declared} record(s), each naming ${RULE_ID}` : "no record on this shelf to type"));

check("L6  nothing renumbered, no ordinal invented: the nodes are the witnessed chapters",
  renumbered.n === 0,
  said(renumbered, "every node is a chapter the sealed ids witness, and every section sits under its own"));

check("L7  a collision is a fault: no two sections claim the same address",
  collided.n === 0,
  said(collided, "one address, one unit, across the shelf"));

check("L8  the ids are read under the shape the zone was built under",
  reshaped.n === 0,
  said(reshaped, "the parser still decides the shape each zone records"));

console.log("\n  what this does not say: that a witnessed skip is a skip in the book. The");
console.log("  sealed ids may skip a chapter the source never had, or one the capture");
console.log("  lost; which it is belongs to the corpus lane. This says the shelf reports");
console.log("  the ids as sealed: every skip named, none invented, nothing renumbered.");
console.log("  It does not open a page, and it does not read commentary zones.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
