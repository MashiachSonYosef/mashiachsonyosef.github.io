#!/usr/bin/env node
// Synthesis lane · plan-rule-v1-the-build-is-derived-and-every-fact-prints-its-basis
//
// The build plan: every published work's parameters, derived rather than typed,
// each fact carrying the basis it stands on.
//
// Why this exists. build.sh named a work thirty-two times — c0 ranges, work
// ids, titles, a deploy list — and every one of those literals was a hand copy
// of a field the Y ledger already carries. A hand copy is right until the day
// the record changes, and then it is wrong in a file nobody thinks of as data.
// Adding a work meant editing the script, which is why two published works and
// nine hundred and ninety-seven to come would each have been a hand job.
//
// So the parameters are derived here, from two sources with a strict order:
//
//   1. A work's Y ledger. Found by shape, not by filename — any fixture in
//      data/ whose nodes carry a WORK node with a content_work_id — so a new
//      ledger is picked up by being put in the directory. Its WORK node
//      supplies the work id, both titles, the c0 range, the unit count and the
//      order. Basis: SEALED_Y_LEDGER. A ledger whose status is not PASS is
//      reported and not derived from.
//
//   2. data/work-records-v1.js, for a work that is published but has no
//      ledger yet. Basis: TYPED_AWAITING_LEDGER, and the entry names the day
//      it dies. A work with BOTH is refused outright — two sources for one
//      fact is how drift starts, and the fix is deleting the typed entry, not
//      trusting this tool to pick.
//
// The record's `descriptors` ride along either way: byline, coordinate
// labels, family name, licence links — plain English for usability, the one
// kind of typing allowed, kept per work and out of the script.
//
// Addresses: the rule is the work id's last segment. Two works predate the
// rule and are published under older names; the plan carries both, and the
// difference is reported as awaiting the republish step rather than either
// renamed today or silently kept forever.
//
// Outputs:
//   --out  build/build-plan-v1.json   the plan with its receipts
//   --tsv  build/build-plan-v1.tsv    the same rows for the shell to read:
//          W <work_id> <basis> <published_as> <title_en> <title_he|-> <c0_first> <c0_last> <y_fixture|-> <byline> <coord_labels> <license_links|-> <family_en>
//          A <base_work> <comm_work> <by>
//          P <work_id> <pack> <carried_map>
//
// Run: node tools/plan-build-v1.mjs [--out build/build-plan-v1.json] [--tsv build/build-plan-v1.tsv]

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { workHoldsFromLedgers } from "./work-holds-v1.mjs";

export const PLAN_RULE_ID = "plan-rule-v1-the-build-is-derived-and-every-fact-prints-its-basis";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const DATA = join(K3, "data");
const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const outPath = arg("--out", "build/build-plan-v1.json");
const tsvPath = arg("--tsv", "build/build-plan-v1.tsv");

const parse = (raw) => {
  const at = raw.indexOf("{");
  if (at < 0) return null;
  try { return JSON.parse(raw.slice(at).replace(/\)\s*;?\s*$/u, "").replace(/;\s*$/u, "")); }
  catch { return null; }
};
const sha16 = (p) => createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 16);
const c0num = (id) => Number(String(id || "").replace(/^C0-0*/u, ""));

// ---- source 1 · every Y ledger in data/, found by shape -------------------
const ledgers = [], notPass = [];
for (const f of readdirSync(DATA).filter((x) => x.endsWith(".js"))) {
  const j = parse(readFileSync(join(DATA, f), "utf8"));
  if (!j || !Array.isArray(j.nodes)) continue;
  const work = j.nodes.find((n) => n && n.node_kind === "WORK" && n.content_work_id);
  if (!work) continue;
  if (j.status !== "PASS") { notPass.push({ file: f, status: j.status }); continue; }
  ledgers.push({ file: f, sha: sha16(join(DATA, f)), fixture: j, work });
}

// ---- source 2 · the typed record ------------------------------------------
let record = null, recordFile = null;
for (const f of readdirSync(DATA).filter((x) => x.endsWith(".js"))) {
  const j = parse(readFileSync(join(DATA, f), "utf8"));
  if (j && j.schema_version === "WORK_RECORDS_V1") { record = j; recordFile = f; }
}
if (!record) { console.error("NO_WORK_RECORD — data/ carries no WORK_RECORDS_V1 file"); process.exit(2); }
const descriptors = record.descriptors || {};
const typed = record.typed_awaiting_ledger || {};
// A withholding has two possible sources and a strict order between them, the
// same order every other fact here stands under.
//
//   1. A hold ledger. Found by shape — any CSV in data/ carrying hold_id,
//      base_work_id and status — with a status that holds the WORK rather than
//      a commentary on it. Basis: SEALED_HOLD_LEDGER. The reason is the
//      ledger's own status string; nothing here composes one.
//   2. data/work-records-v1.js, for a work held with no ledger row yet.
//      Basis: TYPED_AWAITING_HOLD_LEDGER, and the entry names the day it dies.
//
// A work with BOTH is refused outright — two sources for one fact is how drift
// starts — exactly as a work with both a Y ledger and a typed entry is.
//
// None of this was here before. The door worked out which works were held by
// noticing no zone answered for them, which cannot tell a zone deleted by
// accident from a work deliberately withdrawn, and build.sh never saw the
// distinction at all.
const ledgerHolds = workHoldsFromLedgers(DATA);
const typedHolds = record.withheld || {};
const heldBoth = Object.keys(typedHolds).filter((id) => ledgerHolds[id]);
if (heldBoth.length) {
  console.error(`A_WORK_IS_HELD_BY_A_LEDGER_AND_BY_A_TYPED_ENTRY — refusing to plan.`);
  for (const id of heldBoth)
    console.error(`  ${id} is held by ${ledgerHolds[id].source} (${ledgerHolds[id].hold_id}), so its withheld entry in ${recordFile} must be deleted`);
  process.exit(2);
}
const withheld = { ...typedHolds, ...ledgerHolds };

// ---- the one refusal -------------------------------------------------------
const both = ledgers.map((l) => l.work.content_work_id).filter((id) => typed[id]);
if (both.length) {
  console.error(`A_WORK_HAS_A_LEDGER_AND_A_TYPED_ENTRY — refusing to plan.`);
  for (const id of both) console.error(`  ${id} · its ledger has landed, so its typed entry in ${recordFile} must be deleted`);
  process.exit(2);
}

// ---- the plan --------------------------------------------------------------
const slugOf = (id) => String(id).split("/").pop();
const works = [];
for (const l of ledgers) {
  const id = l.work.content_work_id;
  const d = descriptors[id] || {};
  works.push({
    work_id: id,
    basis: "SEALED_Y_LEDGER",
    derived_from: `${l.file} · ${l.sha}… · node ${l.work.y_node_id}`,
    y_fixture: `data/${l.file}`,
    title_en: l.work.public_ref,
    title_he: l.work.label_hebrew || "",
    c0_first: c0num(l.work.content_first_c0_id),
    c0_last: c0num(l.work.content_last_c0_id),
    unit_count: Number(l.work.content_unit_count),
    order: l.work.order_path || "",
    address_by_rule: slugOf(id),
    published_as: slugOf(id),
    byline: d.byline || "",
    coord_labels: d.coord_labels || "section,paragraph",
    family_en: d.family_en || l.work.public_ref,
    license_links: d.license_links || "",
  });
}
for (const [id, t] of Object.entries(typed)) {
  const d = descriptors[id] || {};
  // An address is derived from the work id — the last segment, by the address
  // rule — never typed. A typed address survived here once and diverged from
  // the rule the moment it was written. Refuse rather than prefer either.
  if (t.published_as || d.published_as)
    throw new Error(`AN_ADDRESS_IS_DERIVED_NOT_TYPED · ${id} carries published_as in ${recordFile} — delete it; the address rule derives "${slugOf(id)}"`);
  works.push({
    work_id: id,
    basis: t.basis || "TYPED_AWAITING_LEDGER",
    derived_from: `${recordFile} · typed on ${record.recorded_on}`,
    y_fixture: "",
    title_en: t.title_en,
    title_he: "",
    c0_first: Number(t.c0_first),
    c0_last: Number(t.c0_last),
    unit_count: Number(t.unit_count),
    order: "",
    address_by_rule: slugOf(id),
    published_as: slugOf(id),
    byline: d.byline || "",
    coord_labels: d.coord_labels || "section,paragraph",
    family_en: d.family_en || t.title_en,
    license_links: d.license_links || "",
  });
}
// ---- the serve state, read off the record ---------------------------------
const known = new Set(works.map((w) => w.work_id));
// A withheld entry keeps a published address for a withdrawn work — the
// address law — and since the typed work register was emptied (the owner's
// ruling, 2026-08-30: no hand-done books at all), a withheld work is no
// longer necessarily a work this plan derives. It must still name a REAL
// work: the atlas is the census that says so.
const ATLAS_PATH = arg("atlas", "data/corpus-atlas-v1.json");
const atlasKnown = new Map(); // id -> the atlas row (the census's own facts)
let atlasSha = "";
try {
  const A = JSON.parse(readFileSync(ATLAS_PATH, "utf8"));
  atlasSha = sha16(ATLAS_PATH);
  for (const fam of Object.values(A.families)) for (const w of fam.works) atlasKnown.set(String(w.id), w);
} catch { /* no atlas on this disk — the plan-known set alone judges */ }
const orphanHolds = Object.keys(withheld).filter((id) => !known.has(id) && !atlasKnown.has(id));
if (orphanHolds.length) {
  console.error(`A_WITHHOLDING_NAMES_NO_WORK — refusing to plan.`);
  for (const id of orphanHolds) console.error(`  ${id} is withheld in ${recordFile} and is not a work this plan derives`);
  process.exit(2);
}
// a withheld work the plan no longer derives still gets a stub row, so the
// door keeps its address answering — the address law, nothing more
for (const id of Object.keys(withheld)) {
  if (works.some((w) => w.work_id === id)) continue;
  const at = atlasKnown.get(id) || {};
  works.push({ work_id: id, published_as: id.split("/").pop(),
    title_en: id.split("/").pop().replace(/[-_]+/g, " "),
    basis: "WITHHELD_ADDRESS_ONLY",
    derived_from: atlasSha ? `${ATLAS_PATH} · ${atlasSha}` : "the withheld register alone",
    // the atlas records first + row count; last is their arithmetic
    c0_first: at.c0_first ?? null,
    c0_last: (at.c0_first != null && at.c0_rows != null) ? at.c0_first + at.c0_rows - 1 : null,
    unit_count: at.units ?? null,
    byline: "", coord_labels: "section,paragraph", family_en: "", license_links: "" });
}
for (const w of works) {
  const h = withheld[w.work_id];
  w.serve_state = h ? "WITHHELD" : "SERVED";
  w.withheld_basis = h ? (h.basis || "TYPED_AWAITING_HOLD_LEDGER") : "";
  w.withheld_from = h ? (h.source ? `${h.source} · ${h.hold_id}` : `${recordFile} · typed on ${h.since || record.recorded_on}`) : "";
  w.withheld_since = h ? h.since || "" : "";
  // A ledger row's reason is its status, verbatim. A typed entry's reason is
  // the sentence typed with it, which is a sentence this lane wrote and says so.
  w.withheld_reason = h ? (h.status || h.reason || "") : "";
  w.withheld_ends_when = h ? h.ends_when || "" : "";
}

works.sort((a, b) => (a.order || "zzz").localeCompare(b.order || "zzz") || a.work_id.localeCompare(b.work_id));

// What sits in data/zones that the plan does not reach. data/zones is a work
// directory, not the site: the in-line commentary check keeps its fixture
// there because that is the one place the reader fetches a zone from, so a
// stray here is scratch until the moment it reaches site/ — and stage 6 of
// build.sh publishes only what the plan built, so it cannot. Strays are
// reported by name; whether one has actually been PUBLISHED is a fact about
// site/, and check-build-derived-v1 is what fails on that.
const planned = new Set(works.map((w) => w.published_as));
const strays = [];
// A test instrument is not a work and is not a stray: it is a file somebody
// made on purpose for a check to press. It is named rather than skipped —
// silence about a file in the work directory is how an orphan lives.
const instruments = [];
const ZONES = join(DATA, "zones");
if (existsSync(ZONES)) {
  const { gunzipSync } = await import("node:zlib");
  for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin"))) {
    const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
    const ti = (z.emitted_from || {}).test_instrument;
    if (ti) { instruments.push({ file: f, is: ti.is || z.work || "a test instrument", generator: ti.generator || "" }); continue; }
    if (!Array.isArray(z.sections) || !z.sections.length) continue;
    const slug = f.replace(/\.bin$/, "").replace(/-commentary$/, "");
    if (!planned.has(slug)) strays.push({ file: f, work: z.work });
  }
}

const plan = {
  schema_version: "BUILD_PLAN_V1",
  serve_state_basis: (record.withheld_basis || {}).these_are || "",
  rule_id: PLAN_RULE_ID,
  planned_from: {
    ledgers: ledgers.map((l) => ({ file: l.file, sha256_16: l.sha, work_id: l.work.content_work_id })),
    ledgers_not_pass: notPass,
    record: recordFile,
  },
  works,
  attachments: record.attachments || [],
  commentary_packs: record.commentary_packs || [],
  in_the_work_directory_and_not_planned: strays,
  test_instruments: instruments,
};

mkdirSync(join(K3, "build"), { recursive: true });
writeFileSync(join(K3, outPath), JSON.stringify(plan, null, 1));
const esc = (v) => (v === "" || v === null || v === undefined ? "-" : String(v));
// The shell reads this file as the build's instruction list, so a W row means
// serve it. A held work keeps an H row — the door needs to know it exists and
// why it is not here — and never reaches a stage that would publish it. An
// attachment with a held side builds nothing: half a pair is not a commentary.
const isHeld = new Map(works.map((w) => [w.work_id, w.serve_state === "WITHHELD"]));
const bothSidesServed = (a, b) => !isHeld.get(a) && !isHeld.get(b);
const tsv = [
  ...works.filter((w) => w.serve_state === "SERVED").map((w) => ["W", w.work_id, w.basis, w.published_as, w.title_en, esc(w.title_he),
    w.c0_first, w.c0_last, esc(w.y_fixture), w.byline, w.coord_labels, esc(w.license_links), w.family_en].join("\t")),
  ...works.filter((w) => w.serve_state === "WITHHELD").map((w) =>
    ["H", w.work_id, w.published_as, w.title_en, w.withheld_basis, w.withheld_from, w.withheld_reason].join("\t")),
  ...(record.attachments || []).filter((a) => bothSidesServed(a.pair[0], a.pair[1])).flatMap((a) => [
    ["A", a.pair[0], a.pair[1], a.by].join("\t"),
    ["A", a.pair[1], a.pair[0], a.by].join("\t"),
  ]),
  ...(record.commentary_packs || []).filter((p) => !isHeld.get(p.work_id)).map((p) => ["P", p.work_id, p.pack, p.carried_map].join("\t")),
].join("\n") + "\n";
writeFileSync(join(K3, tsvPath), tsv);

// ---- said out loud ---------------------------------------------------------
const servedCount = works.filter((w) => w.serve_state === "SERVED").length;
const heldCount = works.length - servedCount;
console.log(`— the build, derived · ${works.length} works · ${servedCount} served, ${heldCount} withheld —`);
const pad = Math.max(...works.map((w) => w.work_id.length));
for (const w of works) {
  const state = w.serve_state === "WITHHELD" ? " · WITHHELD" : "";
  console.log(`  ${w.work_id.padEnd(pad)}  ${String(w.c0_first)}-${String(w.c0_last)} · ${String(w.unit_count).padStart(5)} units · ${w.basis}${state}`);
  console.log(`  ${"".padEnd(pad)}  from ${w.derived_from}`);
  if (w.serve_state === "WITHHELD") {
    console.log(`  ${"".padEnd(pad)}  held · ${w.withheld_basis} · from ${w.withheld_from}`);
    console.log(`  ${"".padEnd(pad)}  ${w.withheld_reason}`);
  }
  if (w.published_as !== w.address_by_rule)
    console.log(`  ${"".padEnd(pad)}  published as "${w.published_as}" · the address rule says "${w.address_by_rule}" — awaiting the republish step`);
}
for (const n of notPass) console.log(`  a ledger that is not PASS is not derived from: ${n.file} · ${n.status}`);
for (const o of strays) console.log(`  in the work directory and not planned — ${o.file} (${o.work}) · not published by this build`);
for (const t of instruments) {
  console.log(`  a test instrument, not a work — ${t.file} · ${t.is}`);
  if (/^NOT IN THIS TREE/u.test(t.generator))
    console.log(`      and it has no generator here: ${t.generator}`);
}
console.log(`  ${outPath} · ${tsvPath}`);
process.exit(0);
