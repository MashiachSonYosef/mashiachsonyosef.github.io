#!/usr/bin/env node
// Synthesis lane · front-door-rule-v1-the-door-lists-what-the-zones-carry
//
// The site's front door, built from the zones rather than typed — both of its
// faces: the page a reader arrives at, and the README somebody browsing the
// repository arrives at. Both said the same kind of thing and both went stale
// the same way, so both are now read out of the zones at build time.
//
// It was typed. Two books were named by hand with their section counts written
// out beside them, and when a third work arrived — the commentary, 181 units
// across 58 works on Genesis and 817 on I Kings — the door did not mention it,
// because nothing was going to notice that it should. A door somebody
// maintains by hand is a door that is out of date the moment it is not
// maintained, and nobody can tell by looking.
//
// So it reads the zones and says what is in them. Add a book and it appears.
// Add a commentary and it appears under its book with its own count.
//
// Two rules this page keeps, and keeps by construction rather than by memory:
//
//   1. It prints no Hebrew it cannot stand behind. A book's own title is
//      corpus text; it appears here exactly as its zone carries it — the
//      ledger's word — with the store's licensed reading beside it under
//      "commonly force read as", the same two-row frame as the masthead
//      inside. The title is a doorway: pressing it opens the book, where the
//      same word opens its full record. A work whose ledger has not named a
//      title shows the open slot instead, in the masthead's own words. No
//      other Hebrew may appear, and the guard below holds the page to that.
//   2. Every number names its grain and its pinned source. Physical and
//      named-shelf C0 counts come from the sealed physical handoff; the
//      rendered count is recomputed from the COMPspan records actually
//      carried by the built zones. Those grains are never made to impersonate one
//      another.
//
//   --zones  directory of built zones        (default data/zones)
//   --out    directory to write the door into (default deploy-root)
//   --physical-handoff exact compact physical count handoff
//   --count-bindings    exact atlas/overlay/hash binding record
//
// Run: node tools/build-front-door-v1.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { openRouteStore } from "./gloss-store-v1.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", "data/zones");
const OUT = arg("out", "deploy-root");
const PLAN = arg("plan", "build/build-plan-v1.json");

const read = (f) => JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));
const has = (f) => existsSync(join(ZONES, f));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n = (x) => Number(x).toLocaleString("en-US");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const TEXT_PIN_RULE = "EXACT_GIT_BLOB_BYTES__LF_ENFORCED_BY_GITATTRIBUTES_V1";
const TEXT_PIN_PATHS = [
  "genesis-book-reader-v4/data/corpus-atlas-v1.json",
  "genesis-book-reader-v4/data/bezelal-front-door-counts-handoff-v1.json",
  "genesis-book-reader-v4/data/front-door-three-count-bindings-v1.json",
];
const exactLfActual = (label, bytes) => {
  if (bytes.includes(0x0d))
    throw new Error(`${label} violates ${TEXT_PIN_RULE}: CR byte present; checkout must honor text eol=lf`);
  return { bytes: bytes.length, sha256: sha256(bytes), byte_hash_rule: TEXT_PIN_RULE };
};
const readPinnedJson = (label, path, pin) => {
  const bytes = readFileSync(path);
  if (pin.byte_hash_rule !== TEXT_PIN_RULE)
    throw new Error(`${label} has unsupported byte/hash rule ${pin.byte_hash_rule || "(missing)"}`);
  const actual = exactLfActual(label, bytes);
  if (actual.bytes !== pin.bytes || actual.sha256 !== pin.sha256)
    throw new Error(`${label} is not its pin: expected ${pin.bytes} bytes ${pin.sha256}, got ${actual.bytes} bytes ${actual.sha256}`);
  return { value: JSON.parse(bytes.toString("utf8")), actual };
};
const assertPinnedBytes = (label, bytes, pin) => {
  const actual = { bytes: bytes.length, sha256: sha256(bytes) };
  if (actual.bytes !== pin.bytes || actual.sha256 !== pin.sha256)
    throw new Error(`${label} is not its pin: expected ${pin.bytes} bytes ${pin.sha256}, got ${actual.bytes} bytes ${actual.sha256}`);
  return actual;
};
const requireCount = (name, value) => {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${name} is not a non-negative safe integer`);
  return value;
};

// ---- what the zones carry ------------------------------------------------
//
// The books the door offers used to be a typed list of two, which is how the
// door and the build could disagree about what is published — the Targum was
// a published work a reader could open and the door never mentioned it as
// one. The list now comes from the same plan the build runs from, derived
// fresh so a stale build/ cannot vouch for itself, in the ledgers' own order.
// A work added by its ledger appears here without anyone editing a list.
//
// The byline is NOT among the things carried over. Each zone already carries
// its own, and an earlier build typed a trimmed copy of it into this list —
// two strings for one fact, and the copy is the one on the page. The zone's
// byline is printed whole, exactly as the zone carries it.
execFileSync("node", ["tools/plan-build-v1.mjs", "--out", PLAN, "--tsv", PLAN.replace(/\.json$/, ".tsv")], { stdio: "pipe" });
const plan = JSON.parse(readFileSync(PLAN, "utf8"));
// What each work's build stands on, and what the Y lane holds back from it —
// derived by tools/emit-work-basis-v1.mjs from the plan and the hold ledgers.
// The door prints incompleteness rather than presenting a typed-basis work
// with a sealed work's face; a door that cannot read the basis file would be
// choosing that face back, so it refuses instead.
execFileSync("node", ["tools/emit-work-basis-v1.mjs", "--plan", PLAN], { stdio: "pipe" });
const WB = JSON.parse(readFileSync(arg("basis", "data/work-basis-v1.json"), "utf8"));
// The same catalog the masthead asks at runtime, asked once at build time:
// does a record read this title's own form as the common name? Where one
// does, its licence rides the force-read line, exactly as it does inside.
const STORE = openRouteStore(arg("store", "data/route-store"));
// A posture's name comes from the declarations record — the same record the
// reader loads as data/license-postures-v1.json — never re-derived from the
// letters of the key. A posture the record does not declare is named by its
// key, verbatim: the visible cue that a declaration is missing.
const POSTURE_NAMES = Object.fromEntries(
  Object.entries(JSON.parse(readFileSync("tools/declarations-v1.json", "utf8")).export_postures)
    .map(([key, row]) => [key, row.name])
);
const licenseName = (posture) => {
  const p = String(posture || "");
  if (!p) return "License unrecorded";
  return POSTURE_NAMES[p] || p;
};
const titleReading = (tokens, en) => {
  const key = (tokens || []).map((t) => t.k).filter(Boolean)[0];
  if (!key) return null;
  const routes = STORE.routesFor(key);
  if (!routes) return null;
  // Exact sense match only — a plain ";"-split cannot create a false exact
  // equal (a fragment cut inside brackets keeps its bracket and matches
  // nothing), so the store's own depth rule is not re-implemented here.
  const hits = routes.filter((row) => {
    const senses = String(row[1] || "").split(";").map((x) => x.trim());
    return row[1] === en || senses.includes(en);
  }).filter((row) => STORE.index.m_sources[row[3]]);
  if (!hits.length) return null;
  hits.sort((a, c) => {
    const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10);
    return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9);
  });
  const m = STORE.index.m_sources[hits[0][3]];
  return { lic: licenseName(m.licensePosture), label: m.label || "", year: m.sourceYear || "" };
};
// The atlas: every family and every work the bridge records, built or not,
// emitted by tools/emit-corpus-atlas-v1.mjs with the bridge's sha as its
// receipt. The door refuses to run without it — a door listing only what
// happens to be built would silently shrink the library to this lane's
// output, and silent truncation reads as coverage.
const ATLAS_PATH = arg("atlas", "data/corpus-atlas-v1.json");
const PHYSICAL_HANDOFF_PATH = arg("physical-handoff", "data/bezelal-front-door-counts-handoff-v1.json");
const COUNT_BINDINGS_PATH = arg("count-bindings", "data/front-door-three-count-bindings-v1.json");
const BINDINGS_BYTES = readFileSync(COUNT_BINDINGS_PATH);
const BINDINGS_ACTUAL = exactLfActual("count bindings", BINDINGS_BYTES);
const BINDINGS = JSON.parse(BINDINGS_BYTES.toString("utf8"));
if (BINDINGS.schema !== "mishkan.bezalel.front_door_three_count_bindings.v1")
  throw new Error(`unexpected count binding schema ${BINDINGS.schema || "(missing)"}`);
if (BINDINGS.exact_text_input_policy?.rule !== TEXT_PIN_RULE ||
    BINDINGS.exact_text_input_policy?.gitattributes_path !== ".gitattributes" ||
    JSON.stringify(BINDINGS.exact_text_input_policy?.paths) !== JSON.stringify(TEXT_PIN_PATHS))
  throw new Error("count binding exact-text input policy moved or is incomplete");
const atlasPinned = readPinnedJson("logical atlas", ATLAS_PATH, BINDINGS.inputs.logical_atlas);
const handoffPinned = readPinnedJson("physical handoff", PHYSICAL_HANDOFF_PATH, BINDINGS.inputs.physical_handoff);
const ATLAS = atlasPinned.value;
const PHYSICAL = handoffPinned.value;
if (PHYSICAL.schema !== "mishkan.bezalel.front_door_three_count_handoff.v1")
  throw new Error(`unexpected physical handoff schema ${PHYSICAL.schema || "(missing)"}`);
const physicalRows = requireCount("physical_terminal_c0_rows", PHYSICAL.physical.physical_terminal_c0_rows);
const namedShelfRows = requireCount("physical_and_logically_mapped_rows", PHYSICAL.logical.physical_and_logically_mapped_rows);
const logicalPlanRows = requireCount("logical_plan_rows", PHYSICAL.logical.logical_plan_rows);
const logicalPlanNotPhysicalRows = requireCount("logical_plan_not_physical_rows", PHYSICAL.logical.logical_plan_not_physical_rows);
const physicalUnmappedRows = requireCount("physically_queryable_logical_shelf_unmapped_rows", PHYSICAL.logical.physically_queryable_logical_shelf_unmapped_rows);
if (logicalPlanRows !== namedShelfRows + logicalPlanNotPhysicalRows)
  throw new Error("logical plan partition does not close");
if (physicalRows !== namedShelfRows + physicalUnmappedRows)
  throw new Error("physical partition does not close");
if (ATLAS.totals.c0_rows !== logicalPlanRows)
  throw new Error(`logical atlas total ${ATLAS.totals.c0_rows} disagrees with pinned logical plan ${logicalPlanRows}`);
for (const [name, pin] of Object.entries({ physical_atlas: BINDINGS.inputs.physical_atlas, logical_overlay: BINDINGS.inputs.logical_overlay })) {
  if (!pin || !/^[0-9a-f]{64}$/.test(pin.sha256 || "")) throw new Error(`${name} has no exact SHA-256 pin`);
}
const GENESIS_V3 = BINDINGS.inputs.genesis_clean_successor_v3;
if (!GENESIS_V3 || GENESIS_V3.grain !== "ONE_RENDER_RECORD_PER_COMPSPAN")
  throw new Error("clean Genesis v3 binding is absent or has the wrong grain");
for (const [name, pin] of Object.entries({
  genesis_zone: GENESIS_V3.zone,
  genesis_front_door_handoff: GENESIS_V3.front_door_handoff,
  genesis_defect_provenance: GENESIS_V3.defect_provenance,
  genesis_validation: GENESIS_V3.validation,
  genesis_closed_world_seal: GENESIS_V3.closed_world_seal,
})) {
  if (!pin || !Number.isSafeInteger(pin.bytes) || pin.bytes <= 0 || !/^[0-9a-f]{64}$/.test(pin.sha256 || ""))
    throw new Error(`${name} has no exact byte/SHA-256 pin`);
}
// The family ledger: the synthesis lane's ruling over the bridge's family
// VALUES — authored on the owner's authorization, checked by
// check-family-ledger-v1, and dying the day a corpus-side family record
// lands. The door derives its sections from it; a bridge value the ledger
// does not rule surfaces verbatim in its own section, never swallowed.
const LEDGER = JSON.parse(readFileSync(arg("family-ledger", "data/family-ledger-v1.json"), "utf8"));
const BOOKS = plan.works.map((w) => ({
  slug: w.published_as, zone: `${w.published_as}.bin`,
  work_id: w.work_id, address_by_rule: w.address_by_rule, basis: w.basis,
  serve_state: w.serve_state || "SERVED",
  withheld_reason: w.withheld_reason || "",
  withheld_basis: w.withheld_basis || "",
  withheld_from: w.withheld_from || "",
  held: (WB.works[w.published_as] || {}).held_commentaries || 0,
}));
// Attachment is directional for presentation: the record's pair is
// [base, commentary], the same direction the Y schema's attachment_y_node_id
// points — from the commentary to what it stands on. A commentary work keeps
// its own page and its own address; the door seats it with its base, because
// a commentary is read where its base is read.
const commentaryOf = new Map();   // base slug -> [commentary slugs]
const seated = new Set();         // commentary slugs that sit with a base
const slugOfWork = new Map(plan.works.map((w) => [w.work_id, w.published_as]));
for (const a of plan.attachments || []) {
  const base = slugOfWork.get(a.pair[0]), comm = slugOfWork.get(a.pair[1]);
  if (!base || !comm) continue;
  if (!commentaryOf.has(base)) commentaryOf.set(base, []);
  commentaryOf.get(base).push(comm);
  seated.add(comm);
}

const books = [];
let cleanGenesisZonesSeen = 0;
for (const b of BOOKS) {
  if (!has(b.zone)) continue;
  const zonePath = join(ZONES, b.zone);
  const zoneBytes = readFileSync(zonePath);
  const z = JSON.parse(gunzipSync(zoneBytes).toString("utf8"));
  const sections = (z.sections || []).length;
  const words = (z.sections || []).reduce((t, s) => t + (s.words || []).length, 0);
  if (b.work_id === "tanakh/genesis") {
    cleanGenesisZonesSeen += 1;
    assertPinnedBytes("clean Genesis v3 zone", zoneBytes, GENESIS_V3.zone);
    const clean = z.clean_successor || {};
    const counts = GENESIS_V3.counts || {};
    const joinedRecords = (clean.presentation_join_groups || [])
      .reduce((total, group) => total + (group.canonical_successor_occurrence_ids || []).length, 0);
    // The pin must be the pin for the file being read. This compared the
    // binding's declared paths against two literals naming one work, which is
    // the same claim written twice and one of them typed here: if Bezalel ever
    // reissued the binding at a different path, the literal would refuse it
    // rather than follow it. The comparison is against what this loop actually
    // opened, which is derived from the zones directory.
    if (!String(GENESIS_V3.zone.path || "").endsWith(`/${b.zone}`) ||
        GENESIS_V3.zone.module_path !== `${ZONES}/${b.zone}`.replace(/^\.\//u, "") ||
        words !== counts.rendered_compspan_records ||
        z.counts?.words !== counts.rendered_compspan_records ||
        z.counts?.clean_compspan_successor_occurrences !== counts.canonical_compspan_records ||
        z.counts?.source_orthographic_records !== counts.folded_source_orthographic_records ||
        z.counts?.physical_c0_rows !== counts.physical_c0_rows ||
        clean.one_render_record_per_compspan !== true ||
        clean.canonical_compspan_successor_occurrences !== counts.canonical_compspan_records ||
        clean.rendered_records !== counts.rendered_compspan_records ||
        clean.source_orthographic_records !== counts.folded_source_orthographic_records ||
        clean.presentation_join_groups?.length !== counts.presentation_join_groups ||
        joinedRecords !== counts.presentation_join_records ||
        clean.raw_markup_rows !== counts.raw_markup_records ||
        clean.apparatus_rows_rendered_as_text !== counts.apparatus_records_rendered_as_text ||
        clean.mid_word_split_rows !== counts.mid_word_split_records)
      throw new Error("clean Genesis v3 zone semantics disagree with their pinned binding");
  }
  // its commentary, if any zone carries some for it
  // A book can carry both grains at once, and Genesis does: some commentary is
  // placed on a word, the rest stands on the section because nothing places it
  // any closer. An earlier version of this took whichever grain it met first
  // and printed that one, which named half of what was there.
  let onWord = 0, onSection = 0, heldLicence = 0, noText = 0, byCoordinate = 0, noCloser = 0, worksCount = 0;
  const side = `${b.slug}-commentary.bin`;
  if (has(side)) {
    const c = read(join(ZONES, side));
    const seen = new Set();
    for (const unit of Object.values(c.units || {})) {
      for (const list of Object.values(unit.words || {}))
        for (const e of list) { onWord += 1; seen.add(e.family_en || e.ref); }
      for (const e of unit.section || []) {
        onSection += 1; seen.add(e.family_en || e.ref);
        if (e.held === "licence") heldLicence += 1;
        else if (e.held) noText += 1;
        // The section is not one thing. For 1 Kings the chain itself puts the
        // commentary there, by coordinate; for Genesis it is where a segment
        // stands when nothing places it closer. Saying "on the section" for
        // both would flatten a proof and a shrug into one number.
        else if (e.basis === "SEALED_UNIT_COORDINATE_IDENTITY") byCoordinate += 1;
        else noCloser += 1;
      }
    }
    worksCount = (c.works && c.works.length) ? c.works.length : seen.size;
  }
  const units = onWord + onSection;
  if (!z.byline) throw new Error(`${b.zone} carries no byline — the door prints the zone's and will not invent one`);
  // The title's own gloss, by the same rule every word in the reader is
  // glossed under: the store's oldest displayable reading for the form's
  // exact key. This is the answer to the title being unreadable — not the
  // force-read, the record.
  const titleKey = (z.work_he_tokens || []).map((t) => t.k).filter(Boolean)[0] || null;
  const titleGloss = titleKey ? (STORE.glossFor(titleKey).text || "") : "";
  books.push({ ...b, en: z.work || b.slug, byline: z.byline, sections, words,
    zoneBytes: zoneBytes.length, zoneSha256: sha256(zoneBytes),
    he: z.work_he || "", heGloss: titleGloss, defOpen: !!(titleKey && titleGloss),
    reading: titleReading(z.work_he_tokens, z.work || b.slug),
    units, onWord, onSection, heldLicence, noText, byCoordinate, noCloser, works: worksCount });
}
if (!books.length) throw new Error(`no zones found in ${ZONES} — refusing to write a door with nothing behind it`);
// Genesis, when it is here, must be the exact sealed v3 bytes — that check runs
// above, inside the loop, and is untouched. What is relaxed is the requirement
// that Genesis be here at all. A door builder that cannot describe the site
// without one particular work in it cannot describe a withdrawal, and a
// withdrawal is precisely when the door most needs rebuilding: every count it
// prints was left standing at five works because this line refused to run.
if (cleanGenesisZonesSeen > 1) throw new Error(`expected at most one Genesis zone, found ${cleanGenesisZonesSeen}`);

// ---- the door ------------------------------------------------------------
// A typed-basis work and a sealed work do not wear the same face, and held
// commentary is counted where the book is offered rather than silently
// absent — but in the door's own quiet voice, never as an alarm. The frame
// is recorded as never being grounds to declare a work deficient; an open
// slot is simply named, and the line goes away when its record lands.
const incBits = (b) => {
  const bits = [];
  if (b.basis === "TYPED_AWAITING_LEDGER") bits.push("awaiting its Y ledger — its coordinates stand typed in the open until then");
  if (b.held) bits.push(`${n(b.held)} commentary slots open`);
  return bits;
};
// The card is the collapsed face, so it carries what must never fold away:
// both title rows — the book's own word first, the force-read below it — and
// the bare counts. Everything else about the group (its chain line, its open
// slots, the works seated with it, its commentary) stands behind one quiet
// fold whose summary names each thing it holds, with its count, so nothing
// is out of sight without being said.
const bookCard = (b) => `    <div class="bookcard">
      <span class="row trow"><span class="lab">book title</span>${b.he
        ? (b.defOpen
          ? `<a class="titleway" href="/${b.slug}?t=open" title="open this word\u2019s own record — readings oldest source first"><span class="he" lang="he" dir="rtl">${esc(b.he)}</span><span class="g">${esc(b.heGloss)}</span></a>`
          : `<span class="he" lang="he" dir="rtl">${esc(b.he)}</span>`)
        : `<span class="he none">none is recorded in the ledger</span>`}</span>
      <a class="book" href="/${b.slug}">
      <span class="row"><span class="lab">commonly force read as</span><span class="en">${esc(b.en)}</span>${b.reading
        ? `<span class="chip" title="${esc(b.reading.label)}${b.reading.year ? ` \u00b7 ${esc(b.reading.year)}` : ""}">${esc(b.reading.lic)}</span>` : ""}</span>
      <span class="of">${n(b.sections)} sections · ${n(b.words)} rendered COMPspan records</span>
      </a>
    </div>`;

// A commentary entry is its own way in, so it opens one. ?c=open tells the
// reader to press the first mark the book carries and the first work behind it
// — the same path a finger takes — rather than landing at the top of the book
// with everything shut. The book's own entry above still opens the book.
// Where each one stands, and how many this page holds rather than prints. A
// count with a bound inside it that nobody prints reads as a total.
const whereLine = (b) => {
  const parts = [];
  if (b.onWord) parts.push(`${n(b.onWord)} on the word it opens by quoting`);
  if (b.byCoordinate) parts.push(`${n(b.byCoordinate)} on the section by coordinate`);
  if (b.noCloser) parts.push(`${n(b.noCloser)} on the section, nothing places them closer`);
  if (b.heldLicence) parts.push(`${n(b.heldLicence)} kept off by a licence`);
  if (b.noText) parts.push(`${n(b.noText)} named, with no text in the record`);
  return parts.join(" · ");
};
const commentaryLine = (b) => (b.units
  ? `      <a class="sub-book" href="/${b.slug}?c=open"><span class="en">Commentary on ${esc(b.en)}</span><span class="of">${n(b.units)} carried${b.works ? ` from ${n(b.works)} work${b.works === 1 ? "" : "s"}` : ""} — ${whereLine(b)}</span></a>`
  : null);

const totalUnits = books.reduce((t, b) => t + b.units, 0);
const bySlug = new Map(books.map((b) => [b.slug, b]));
// One group per base work: its card, the works seated with it, and every way
// its commentary opens. A seated work is still its own book — the row says so
// and goes to it — it is just found where it is read.
const groupFor = (b) => {
  const subs = [];
  let seatedCount = 0;
  for (const cslug of commentaryOf.get(b.slug) || []) {
    const c = bySlug.get(cslug);
    if (!c) continue;
    seatedCount += 1;
    subs.push(`      <a class="sub-work" href="/${c.slug}">${c.he
        ? `<span class="he" lang="he" dir="rtl">${esc(c.he)}</span>`
        : `<span class="he none">none is recorded in the ledger</span>`}<span class="en">${esc(c.en)}</span><span class="of">its own book · ${n(c.sections)} sections · ${n(c.words)} words · ${esc(c.byline)}</span>${incBits(c).length ? `<span class="of slots">${esc(incBits(c).join(" · "))}</span>` : ""}</a>`);
    const cl = commentaryLine(c);
    if (cl) subs.push(cl);
  }
  const cl = commentaryLine(b);
  if (cl) subs.push(cl);
  // What the fold holds, said on its face with the counts it holds it at.
  // A fold that says "more" hides; a fold that says "1 work seated with it ·
  // commentary · 612 carried · 11 commentary slots open" only shortens.
  const bits = [];
  if (seatedCount) bits.push(`${n(seatedCount)} work${seatedCount === 1 ? "" : "s"} seated with it`);
  if (b.units) bits.push(`commentary · ${n(b.units)} carried`);
  if (b.basis === "TYPED_AWAITING_LEDGER") bits.push("awaiting its Y ledger");
  if (b.held) bits.push(`${n(b.held)} commentary slots open`);
  const foldRows = [`      <span class="of fold-line">${esc(b.byline)}</span>`];
  if (incBits(b).length) foldRows.push(`      <span class="of slots fold-line">${esc(incBits(b).join(" · "))}</span>`);
  return `    <div class="workgroup">
${bookCard(b)}
      <details class="fold">
      <summary>${esc(bits.join(" · ") || "its record line")}</summary>
${foldRows.join("\n")}
${subs.join("\n")}
      </details>
    </div>`;
};
// ---- the library, whole, on the ledger's shelves --------------------------
// The atlas says what exists; the ledger says where it stands and what each
// shelf is called. A canonical family pools every bridge value the ledger
// folds into it, renders its Hebrew name where the ledger gives one (each
// keyed token verified against the store; the gloss under it is the store's
// oldest displayable reading, the same rule as every title), keeps the open
// slot where it does not, and says on the fold's inside which bridge values
// it holds — the receipt of the fold. The two review values the corpus lane
// left open stand together in their own held section, and any bridge value
// the ledger has not ruled surfaces verbatim in a section of its own.
const byWorkId = new Map(books.map((b) => [b.work_id, b]));
for (const b of books) {
  let found = false;
  for (const f of Object.values(ATLAS.families)) if (f.works.some((w) => w.id === b.work_id)) { found = true; break; }
  if (!found) throw new Error(`${b.work_id} is published but the atlas does not know it — the bridge and the zones disagree; refusing output`);
}
const seatedBaseOf = new Map();   // seated slug -> base book
for (const [base, comms] of commentaryOf) for (const c of comms) seatedBaseOf.set(c, bySlug.get(base));

const valueOwner = new Map();     // bridge value -> ledger family id | "(awaiting)"
for (const f of LEDGER.families) for (const m of f.members) valueOwner.set(m, f.id);
for (const m of LEDGER.awaiting.members) valueOwner.set(m, "(awaiting)");

const poolOf = (values) => {
  const rows = [];
  for (const v of values) {
    const af = ATLAS.families[v];
    if (!af) continue;
    for (const w of af.works) rows.push({ atlas: w, book: byWorkId.get(w.id) || null, value: v });
  }
  rows.sort((a, b) => a.atlas.c0_first - b.atlas.c0_first);
  return rows;
};
const sums = (rows) => ({
  works: rows.length,
  built: rows.filter((r) => r.book).length,
  units: rows.reduce((t, r) => t + r.atlas.units, 0),
});
const families = LEDGER.families.map((lf) => {
  const present = lf.members.filter((m) => ATLAS.families[m]);
  return { ledger: lf, members: present, rows: poolOf(present) };
}).filter((f) => f.rows.length);
const unruled = Object.keys(ATLAS.families).filter((v) => !valueOwner.has(v));
const awaitingRows = poolOf(LEDGER.awaiting.members.filter((m) => ATLAS.families[m]));

const atlasRow = (w) => {
  const segs = w.id.split("/");
  const name = segs[segs.length - 1];
  const pre = segs.slice(0, -1).join("/");
  return `      <span class="atlas-row" data-p="${esc(pre)}"><span class="aw" dir="auto">${esc(name)}</span><span class="au">${n(w.units)} unit${w.units === 1 ? "" : "s"}</span></span>`;
};
const seatedRow = (b) => {
  const base = seatedBaseOf.get(b.slug);
  return `      <a class="atlas-row built" href="/${b.slug}"><span class="aw">${esc(b.en)}</span><span class="au">its own book · seated with ${esc(base ? base.en : "its base")} — reads there · ${n(b.sections)} sections</span></a>`;
};
const rowsHtml = (rows) => rows.map((r) => {
  if (!r.book) return atlasRow(r.atlas);
  if (seated.has(r.book.slug)) return seatedRow(r.book);
  return groupFor(r.book);
});
// A family's name is words of the ledger, and a word answers for itself:
// each keyed token is a real control that opens the word's own record — the
// store's readings, oldest source first, each with its licence — in a card
// on this page, separately from the fold it happens to sit in. A token the
// store is silent on prints and opens nothing, the numeral rule's law.
const famHeadHe = (lf) => {
  if (!lf.he) return `<span class="he none">none is recorded in the ledger</span>`;
  const key = (lf.he_tokens || []).map((t) => t.k).filter(Boolean)[0] || null;
  const gloss = key ? (STORE.glossFor(key).text || "") : "";
  const words = (lf.he_tokens || []).map((t) => t.k
    ? `<button type="button" class="fw" data-k="${esc(t.k)}" title="open this word’s own record — readings oldest source first">${esc(t.s)}</button>`
    : `<span class="fw inert">${esc(t.s)}</span>`).join(" ");
  return `<span class="fam-he" data-named-by="family-ledger-v1#${esc(lf.id)}"><span class="he" lang="he" dir="rtl">${words}</span>${gloss ? `<span class="g">${esc(gloss)}</span>` : ""}</span>`;
};
const familySection = (fam) => {
  const lf = fam.ledger;
  const s = sums(fam.rows);
  const bits = [`${n(s.works)} work${s.works === 1 ? "" : "s"}`];
  if (s.built) bits.push(`${n(s.built)} built`);
  bits.push(`${n(s.units)} units`);
  const reading = titleReading(lf.he_tokens || [], lf.en);
  const foldLines = [`      <span class="of fold-line">${esc(lf.what)}</span>`];
  foldLines.push(`      <span class="of slots fold-line">the bridge records ${fam.members.length === 1 ? "this shelf as" : "these as"}: ${esc(fam.members.join(" · "))} — folded here by ${esc(LEDGER.schema_version)}, which dies the day the corpus rules the column</span>`);
  // The home page rests fully collapsed into the grouping: every family
  // folded to its two-row head, the built ones included — a tap opens a
  // shelf, the search box opens whatever matches. Nothing rests open.
  return `    <section class="family">
      <details class="fam">
      <summary>
        <span class="row"><span class="lab">family</span>${famHeadHe(lf)}</span>
        <span class="row"><span class="lab">commonly force read as</span><span class="en">${esc(lf.en)}</span>${reading
          ? `<span class="chip" title="${esc(reading.label)}${reading.year ? ` · ${esc(reading.year)}` : ""}">${esc(reading.lic)}</span>` : ""}<span class="of">${esc(bits.join(" · "))}</span></span>
      </summary>
      <div class="fgroups">
${foldLines.join("\n")}
${rowsHtml(fam.rows).join("\n")}
      </div>
      </details>
    </section>`;
};
const awaitingSection = () => {
  if (!awaitingRows.length) return "";
  const s = sums(awaitingRows);
  return `    <section class="family">
      <details class="fam">
      <summary>
        <span class="row"><span class="lab">held for review</span><span class="he none">the corpus lane&#8217;s own review markers, standing open</span></span>
        <span class="row"><span class="lab">recorded in the bridge as</span><span class="en">${esc(LEDGER.awaiting.members.join(" · "))}</span><span class="of">${n(s.works)} works · ${n(s.units)} units</span></span>
      </summary>
      <div class="fgroups">
      <span class="of fold-line">${esc(LEDGER.awaiting.why)}</span>
${rowsHtml(awaitingRows).join("\n")}
      </div>
      </details>
    </section>`;
};
const unruledSection = (v) => {
  const rows = poolOf([v]);
  const s = sums(rows);
  return `    <section class="family">
      <details class="fam">
      <summary>
        <span class="row"><span class="lab">family</span><span class="he none">none is recorded in the ledger</span></span>
        <span class="row"><span class="lab">recorded in the bridge as</span><span class="en">${esc(v)}</span><span class="of">${n(s.works)} works · ${n(s.units)} units · the family ledger has not ruled this value</span></span>
      </summary>
      <div class="fgroups">
${rowsHtml(rows).join("\n")}
      </div>
      </details>
    </section>`;
};
// The reader count is a different grain from C0. It is the exact number of
// COMPspan records the built zones carry now, recomputed from those zone bytes on
// every run. A future zone successor therefore changes this snapshot without
// anyone editing a typed count.
const renderedTally = {
  compspan_records: books.reduce((total, b) => total + b.words, 0),
  built_zones: books.length,
  zones: books.map((b) => ({
    path: `${ZONES}/${b.zone}`.replace(/\\/g, "/"),
    work_id: b.work_id,
    rendered_compspan_records: b.words,
    bytes: b.zoneBytes,
    sha256: b.zoneSha256,
  })),
};
renderedTally.zone_manifest_sha256 = sha256(Buffer.from(JSON.stringify(renderedTally.zones)));

const countReceipt = {
  schema: "mishkan.bezalel.front_door_three_count_receipt.v1",
  status: "PASS_PINNED_INPUTS__CURRENT_ZONE_SNAPSHOT__DYNAMIC_RENDER_GRAIN",
  exact_text_input_policy: BINDINGS.exact_text_input_policy,
  grains: {
    physical_c0_rows: "C0_ROWS",
    named_shelf_c0_rows: "C0_ROWS",
    rendered_compspan_records: "ONE_RECORD_PER_COMPSPAN__NOT_C0_ROWS",
  },
  snapshot: {
    kind: "CURRENT_BUILT_ZONE_BYTES_AT_BUILD_TIME",
    recomputed_from_zone_bytes_on_every_build: true,
    future_zone_successor_behavior: "RECOMPUTE_RENDERED_COMPSPAN_RECORDS_WITHOUT_TYPED_COUNT_EDIT",
    zone_manifest_sha256: renderedTally.zone_manifest_sha256,
  },
  counts: {
    current_physical_c0_rows: physicalRows,
    physically_backed_c0_rows_on_named_work_unit_shelves: namedShelfRows,
    rendered_compspan_records: renderedTally.compspan_records,
    logical_plan_c0_rows: logicalPlanRows,
    logical_plan_c0_rows_not_physical: logicalPlanNotPhysicalRows,
    physical_c0_rows_not_yet_mapped_to_named_shelf: physicalUnmappedRows,
  },
  equations: {
    logical_plan_partition: logicalPlanRows === namedShelfRows + logicalPlanNotPhysicalRows ? "PASS" : "FAIL",
    physical_partition: physicalRows === namedShelfRows + physicalUnmappedRows ? "PASS" : "FAIL",
  },
  inputs: {
    logical_atlas: { path: ATLAS_PATH, ...atlasPinned.actual },
    physical_handoff: { path: PHYSICAL_HANDOFF_PATH, ...handoffPinned.actual },
    count_bindings: { path: COUNT_BINDINGS_PATH, ...BINDINGS_ACTUAL },
    physical_atlas: BINDINGS.inputs.physical_atlas,
    logical_overlay: BINDINGS.inputs.logical_overlay,
    genesis_clean_successor_v3: GENESIS_V3,
  },
  rendered: renderedTally,
};
const countReceiptJson = JSON.stringify(countReceipt, null, 2) + "\n";
const sectionsHtml = [
  ...families.map(familySection),
  awaitingSection(),
  ...unruled.map(unruledSection),
].filter(Boolean);

const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Tabernacle</title>
<meta name="description" content="A Hebrew reader built on a sealed chain: every reading traceable to the record that carries it, and every record to the licence it was released under.">
<style>
  /* colour-role-rule-v1 · the roles are the ledgers and the values are ours.
     The reader paints the recorded contract — structure gold, base surface
     purple — and the door had been wearing an invented blue-grey instead,
     so the way in looked like a different building than the rooms. Same
     tokens as zone.html, verbatim. */
  :root { --bg:#0c0910; --panel:#150f1d; --panel2:#110c18; --line:#261d33; --ink:#ece1c4;
          --ink-strong:#f6ecd2; --muted:#a99a80; --faint:#7a6f5c;
          --gold:#e8c46a; --gold-dim:#9a7f3f; --amber:#d9a441;
          --sel:#6fb5f0; --sel-dim:#3f6f93; --sel-ink:#071019;
          --shani:#c0563f; --shesh:#d8c7a4; --link:#d8c7a4; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body { margin:0; min-height:100vh; background:var(--bg); color:var(--ink);
         font:16px/1.6 Georgia,"Times New Roman",serif; display:flex; align-items:center;
         justify-content:center; padding:1.4rem 1rem; overflow-x:hidden; }
  main { width:100%; max-width:40rem; }
  h1 { margin:0 0 .35rem; font-size:2.1rem; letter-spacing:.02em; color:var(--gold); }
  p.sub { margin:0 0 .4rem; color:var(--muted); font-size:.9rem; }
  .countboard { margin:.8rem 0 1.2rem; padding:.75rem; border:1px solid var(--line);
                border-radius:.65rem; background:var(--panel2); }
  .countgrid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.45rem; }
  .count { margin:0; padding:.45rem .5rem; border-left:2px solid var(--gold-dim); }
  .count .num { display:block; color:var(--ink-strong); font-size:1rem; font-variant-numeric:tabular-nums; }
  .count .grain { display:block; color:var(--muted); font-size:.7rem; line-height:1.35; }
  .count-detail, .count-grain, .count-audit { margin:.55rem 0 0; color:var(--faint); font-size:.68rem; line-height:1.45; }
  .count-grain { color:var(--muted); }
  .count-audit a { color:var(--gold-dim); }
  @media (max-width:620px) { .countgrid { grid-template-columns:1fr; } }
  .books { display:flex; flex-direction:column; gap:.55rem; }
  .bookcard { display:flex; flex-direction:column; align-items:flex-start; gap:.15rem;
           border:1px solid var(--line); border-radius:.7rem; background:var(--panel);
           padding:.7rem .9rem .6rem; }
  .bookcard:hover { border-color:var(--gold-dim); }
  a.book { display:flex; flex-direction:column; align-items:flex-start; gap:.15rem;
           text-decoration:none; color:var(--ink); align-self:stretch; }
  /* Two ways in, and the Hebrew one comes first: the title opens the word's
     own record — readings oldest source first — because the answer this
     project gives to an unreadable word is never the force-read below it. */
  a.titleway { text-decoration:none; display:inline-flex; flex-direction:column; align-items:flex-start; gap:.05rem; }
  a.titleway .g { font-size:.72rem; color:var(--muted); border-bottom:1px dotted var(--gold-dim); }
  a.titleway:hover .g { color:var(--gold); }
  a.titleway:hover .he { color:var(--shesh-bright, #eadbbd); }
  /* The title is the book's own. The English beside it is not a translation of
     it and must not be able to be read as one — it is how a reader who does not
     read Hebrew finds and refers to the book. So each line says which of the
     two it is before the thing itself. The labels are ours; the title is not. */
  .bookcard .row { display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; }
  .bookcard .lab { flex:0 0 auto; min-width:7rem; font-size:.6rem; letter-spacing:.18em;
                text-transform:uppercase; color:var(--faint); }
  .bookcard .en { font-size:1.05rem; font-variant:small-caps; letter-spacing:.12em; color:var(--gold-dim); }
  .bookcard .he, a.sub-work .he { font-family:"Frank Ruehl CLM","David Libre","SBL Hebrew",Georgia,serif;
    font-size:1.25rem; color:var(--shesh); }
  .bookcard .he.none, a.sub-work .he.none { font-family:Georgia,serif; font-size:.85rem;
    font-style:italic; color:var(--faint); }
  .bookcard .chip { font-size:.62rem; letter-spacing:.06em; color:var(--muted);
    border:1px solid var(--line); border-radius:.6rem; padding:.1rem .45rem; }
  a.sub-work .he { font-size:1.05rem; margin-right:.5rem; }
  .bookcard .of { margin-top:.25rem; color:var(--faint); font-size:.76rem; }
  .bookcard .of.slots, a.sub-work .of.slots { margin-top:.2rem; font-style:italic; }
  /* The commentary is not a third book. It arrives shut, and what is behind it
     is one entry per book, each going to the book it belongs to — because that
     is where a commentary is read. */
  #find { margin:0 0 1rem; }
  #find input { width:100%; padding:.6rem .9rem; border:1px solid var(--line); border-radius:.55rem;
    background:var(--panel); color:var(--ink); font:inherit; font-size:.92rem; }
  #find input::placeholder { color:var(--faint); }
  #find input:focus { outline:none; border-color:var(--gold-dim); }
  .workgroup { border:1px solid var(--line); border-radius:.7rem; background:var(--panel); overflow:hidden; }
  .workgroup .bookcard { border:none; border-radius:0; background:none; }
  a.sub-work { display:block; padding:.6rem .9rem .6rem 1.7rem; border-top:1px solid var(--line);
    text-decoration:none; color:var(--ink); }
  a.sub-work:hover { background:rgba(224,182,79,.06); }
  a.sub-work .en { display:block; font-size:.98rem; color:var(--gold-dim); }
  a.sub-work .of { display:block; margin-top:.2rem; color:var(--faint); font-size:.78rem; }
  /* A family is the outermost frame, and its head is the same register at
     family grain: Hebrew name (an open slot until a ledger names one), the
     force-read below, the sums of what it holds on the fold's face. Nested
     folds: the family folds its groups; each group folds its record lines. */
  section.family { }
  details.fam > summary { list-style:none; cursor:pointer; padding:.3rem .15rem .45rem; }
  details.fam > summary::-webkit-details-marker { display:none; }
  details.fam > summary .row { display:flex; align-items:baseline; gap:.55rem; flex-wrap:wrap; }
  details.fam > summary .lab { flex:0 0 auto; min-width:7rem; font-size:.6rem; letter-spacing:.18em;
    text-transform:uppercase; color:var(--faint); }
  details.fam > summary .en { font-size:1.15rem; font-variant:small-caps; letter-spacing:.14em; color:var(--gold);
    overflow-wrap:anywhere; min-width:0; }
  details.fam > summary .he.none { font-family:Georgia,serif; font-size:.85rem; font-style:italic; color:var(--faint); }
  details.fam > summary .fam-he { display:inline-flex; flex-direction:column; align-items:flex-start; gap:.05rem; }
  details.fam > summary .fam-he .he { font-family:"Frank Ruehl CLM","David Libre","SBL Hebrew",Georgia,serif;
    font-size:1.3rem; color:var(--shesh); }
  details.fam > summary .fam-he .g { font-size:.7rem; color:var(--muted); }
  .fam-he .fw { font:inherit; color:inherit; background:none; border:none; padding:0; cursor:pointer; }
  .fam-he .fw:hover { color:var(--gold); }
  .fam-he .fw.inert { cursor:default; }
  /* The word's own record, on this page — and it is the reader's card, not a
     new one. The door had grown its own list-shaped thing for the same job the
     HUD already does, which made the way in look like a different building
     than the rooms for the second time. Every rule below is zone.html's, with
     the same tokens: the head is the word, the reading stands under its own
     label, the routes are pills with one lit, and the record beneath carries
     the source and the licence that never scroll away. */
  #wcard { position:fixed; z-index:70; max-width:23rem; width:min(23rem,92vw); max-height:min(84vh,50rem);
    left:50%; transform:translateX(-50%); bottom:1rem;
    display:flex; flex-direction:column; overflow-y:auto; overflow-x:hidden;
    background:var(--panel); border:1px solid #2c4a63; border-radius:.7rem;
    padding:.85rem 1.05rem; box-shadow:0 14px 40px rgba(0,0,0,.6); }
  #wcard[hidden] { display:none; }
  #wcard .head { display:flex; justify-content:space-between; align-items:baseline; gap:.6rem;
    border-bottom:1px solid var(--line); padding-bottom:.4rem; margin-bottom:.3rem; flex:0 0 auto; }
  #wcard .head b { font-size:1.55rem; color:var(--ink-strong);
    font-family:"Frank Ruehl CLM","Frank Ruehl","David Libre","SBL Hebrew",Georgia,serif; }
  #wcard .head button { background:none; border:0; color:var(--link); font-size:1.15rem; cursor:pointer; }
  #wcard p { margin:.45rem 0; }
  #wcard .r-now { flex:0 0 auto; margin:.1rem 0 .35rem; padding-bottom:.35rem;
    border-bottom:1px solid var(--line); direction:ltr; }
  #wcard .r-now .k { display:block; color:var(--faint); font-size:.68rem;
    letter-spacing:.08em; text-transform:uppercase; }
  #wcard .r-now .v { display:block; color:var(--ink-strong); font-size:.94rem; line-height:1.3;
    overflow-wrap:anywhere; max-height:3.9em; overflow-y:auto; overflow-x:hidden; }
  #wcard .r-now .v.none { color:var(--faint); font-style:italic; }
  #wcard .r-label { margin:.5rem 0 .3rem; color:var(--faint); font-size:.74rem;
    letter-spacing:.06em; text-transform:uppercase; }
  #wcard .r-pills { display:flex; flex-wrap:wrap; gap:.35rem; direction:ltr;
    overflow-y:auto; overflow-x:hidden; min-height:0; max-height:34vh; }
  #wcard .r-pills button { border:1px solid var(--line); background:var(--panel2); color:var(--muted);
    border-radius:.9rem; padding:.22rem .7rem; font:inherit; font-size:.76rem; cursor:pointer;
    max-width:100%; text-align:left; white-space:normal; overflow-wrap:anywhere; }
  #wcard .r-pills button[aria-pressed="true"] { background:var(--sel); border-color:var(--sel);
    color:#171105; font-weight:bold; }
  #wcard .d-card { margin-top:.55rem; border-top:1px solid var(--line); padding-top:.45rem;
    flex:0 0 auto; display:flex; flex-direction:column; overflow:hidden; max-height:32vh; }
  #wcard .d-body { flex:1 1 auto; min-height:1.2rem; overflow-y:auto; color:var(--ink); font-size:.86rem; }
  #wcard .d-foot { flex:0 0 auto; padding-top:.15rem; color:var(--muted); font-size:.78rem; }
  #wcard .d-foot a { color:var(--link); }
  #wcard .lic-chip { display:inline-block; margin-inline-start:.45rem; padding:.02rem .5rem;
    border-radius:999px; background:rgba(216,199,164,.12); border:1px solid rgba(216,199,164,.3);
    color:var(--shesh); font-size:.72rem; }
  #wcard .prov { color:var(--faint); font-size:.72rem; margin:.35rem 0 0; }
  /* P — the sources carrying the same record as the selected reading. Same
     rules as the reader's card: a corroboration is not a louder kind of
     source, so it wears the same chip at a smaller weight. */
  #wcard .d-also { margin:.3rem 0 0; padding-top:.3rem; border-top:1px dotted var(--line);
    display:flex; flex-wrap:wrap; align-items:baseline; gap:.3rem .45rem; }
  #wcard .d-also-lab { flex:1 0 100%; color:var(--faint); font-size:.66rem;
    letter-spacing:.08em; text-transform:uppercase; }
  #wcard .d-also-m { font:inherit; font-size:.74rem; color:var(--muted); cursor:pointer;
    background:var(--panel2); border:1px solid var(--line); border-radius:.6rem;
    padding:.16rem .55rem; text-align:left; max-width:100%; }
  #wcard .d-also-m:hover { border-color:var(--sel-dim); color:var(--ink); }
  #wcard .d-also-read { display:block; color:var(--faint); font-size:.68rem; }
  #wcard .d-also-more { font:inherit; font-size:.72rem; color:var(--muted);
    background:var(--panel2); border:1px solid var(--line); border-radius:.5rem;
    padding:.16rem .4rem; cursor:pointer; max-width:100%; }
  #wshade { position:fixed; inset:0; background:rgba(5,3,8,.55); z-index:69; }
  #wshade[hidden] { display:none; }
  details.fam > summary .of { color:var(--faint); font-size:.74rem; font-variant:normal; letter-spacing:normal; }
  details.fam > summary > .row:first-child::before { content:"\u25b8"; color:var(--gold-dim); font-size:.8rem; }
  details.fam[open] > summary > .row:first-child::before { content:"\u25be"; }
  details.fam > summary:hover .en { color:var(--shesh); }
  .fgroups { display:flex; flex-direction:column; gap:.55rem; }
  .fgroups > .fold-line { display:block; margin:0; padding:.05rem .35rem; color:var(--faint); font-size:.76rem; }
  .fgroups > .fold-line.slots { font-style:italic; font-size:.7rem; }
  /* A work not yet built: its recorded id and its measured size, quiet and
     unlinked — nothing links to nothing. A built work seated elsewhere links
     to its own page and says where it reads. */
  .atlas-row { display:flex; align-items:baseline; gap:.6rem; padding:.16rem .35rem;
    font-size:.8rem; color:var(--faint); text-decoration:none; flex-wrap:wrap; min-width:0; }
  .atlas-row .aw { color:var(--muted); unicode-bidi:plaintext; flex:1 1 auto; min-width:0;
    overflow-wrap:anywhere;
    font-family:"Frank Ruehl CLM","David Libre","SBL Hebrew",Georgia,serif; }
  .atlas-row .au { font-size:.68rem; white-space:nowrap; }
  a.atlas-row.built .aw { color:var(--gold-dim); }
  a.atlas-row.built:hover .aw { color:var(--gold); }
  /* One quiet fold per group. Its face is the summary line built above —
     each folded thing named with its count — so collapsed is shorter, never
     blinder. Closed is the resting state; the search box opens it when a
     match would otherwise be out of sight. */
  .workgroup details.fold { border-top:1px solid var(--line); }
  .workgroup details.fold > summary { list-style:none; cursor:pointer;
    padding:.4rem .9rem; color:var(--faint); font-size:.72rem; font-style:italic;
    display:flex; align-items:baseline; gap:.45rem; }
  .workgroup details.fold > summary::-webkit-details-marker { display:none; }
  .workgroup details.fold > summary::before { content:"\u25b8"; font-style:normal;
    color:var(--gold-dim); transition:transform 140ms; }
  .workgroup details.fold[open] > summary::before { content:"\u25be"; }
  .workgroup details.fold > summary:hover { color:var(--muted); }
  .workgroup details.fold .fold-line { display:block; margin:0; padding:.05rem .9rem .4rem; }
  a.sub-book { display:block; padding:.6rem .9rem .6rem 1.7rem; border-top:1px solid var(--line);
    text-decoration:none; color:var(--ink); }
  a.sub-book:hover { background:rgba(224,182,79,.06); }
  a.sub-book .en { display:block; font-size:.98rem; color:var(--gold-dim); }
  a.sub-book .of { display:block; margin-top:.2rem; color:var(--faint); font-size:.78rem; }
  footer { margin-top:2.2rem; color:var(--faint); font-size:.78rem; }
  footer a { color:var(--gold-dim); }
</style>
</head>
<body>
<main>
  <!-- Built by tools/build-front-door-v1.mjs from pinned physical/logical
       authorities and the zones. Every count below names its grain. -->
  <h1>The Tabernacle</h1>
  <p class="sub">A Hebrew reader on a sealed chain. Every reading traces to the record that carries it, and every record to the licence it was released under.</p>
  <section class="countboard" aria-label="Audited corpus counts"
    data-text-input-byte-rule="${TEXT_PIN_RULE}"
    data-logical-atlas-sha256="${atlasPinned.actual.sha256}"
    data-physical-handoff-sha256="${handoffPinned.actual.sha256}"
    data-physical-atlas-sha256="${BINDINGS.inputs.physical_atlas.sha256}"
    data-logical-overlay-sha256="${BINDINGS.inputs.logical_overlay.sha256}"
    data-genesis-clean-zone-sha256="${GENESIS_V3.zone.sha256}"
    data-genesis-clean-handoff-sha256="${GENESIS_V3.front_door_handoff.sha256}"
    data-genesis-clean-validation-sha256="${GENESIS_V3.validation.sha256}"
    data-genesis-clean-seal-sha256="${GENESIS_V3.closed_world_seal.sha256}"
    data-rendered-zone-manifest-sha256="${renderedTally.zone_manifest_sha256}">
    <div class="countgrid">
      <p class="count" data-count="current-physical-c0"><span class="num">${n(physicalRows)}</span><span class="grain">current physical C0 rows</span></p>
      <p class="count" data-count="named-shelf-c0"><span class="num">${n(namedShelfRows)}</span><span class="grain">physically backed C0 rows on named work/unit shelves</span></p>
      <p class="count" data-count="rendered-compspan-records"><span class="num">${n(renderedTally.compspan_records)}</span><span class="grain">rendered COMPspan records in ${n(renderedTally.built_zones)} built zones</span></p>
    </div>
    <p class="count-grain">The rendered figure is a current-zone snapshot and a different grain: it counts one record per COMPspan actually carried by the built-zone bytes, not C0 rows. It is recomputed from those zones on every build.</p>
    <p class="count-detail">Logical plan: ${n(logicalPlanRows)} C0 rows across ${n(ATLAS.totals.works)} works and ${n(ATLAS.totals.units)} units · logical-plan C0 rows not physical: ${n(logicalPlanNotPhysicalRows)} · physical C0 rows not yet mapped to a named shelf: ${n(physicalUnmappedRows)}</p>
    <p class="count-audit"><a href="/front-door-counts-receipt-v1.json">Open the count receipt</a> · logical atlas ${atlasPinned.actual.sha256.slice(0, 12)} · physical handoff ${handoffPinned.actual.sha256.slice(0, 12)} · physical atlas ${BINDINGS.inputs.physical_atlas.sha256.slice(0, 12)} · logical overlay ${BINDINGS.inputs.logical_overlay.sha256.slice(0, 12)} · zone-successor seal ${GENESIS_V3.closed_world_seal.sha256.slice(0, 12)}</p>
  </section>
  <script id="front-door-counts-receipt" type="application/json">${JSON.stringify(countReceipt).replace(/</g, "\\u003c")}</script>
  <form id="find" role="search" onsubmit="return go(event)">
    <input id="q" type="search" autocomplete="off" spellcheck="false"
      placeholder="find a book — its name, however you type it"
      aria-label="find a book" oninput="sift()">
  </form>
  <nav class="books">
${sectionsHtml.join("\n")}
  </nav>
  <div id="wshade" hidden></div>
  <div id="wcard" role="dialog" aria-label="the word&#8217;s own record" hidden>
    <div class="head"><b dir="rtl"></b><button type="button" aria-label="Close">&#215;</button></div>
    <p class="r-now"><span class="k">reading</span><span class="v"></span></p>
    <p class="r-label">Exact selectable routes</p>
    <div class="r-pills"></div>
    <div class="d-card"><div class="d-body"></div><div class="d-foot"></div></div>
    <p class="prov"></p>
  </div>
  <script>
  // Finding is the search box's job, not a record's. A book has one name row
  // inside; here a reader may type that name any way hands actually type it —
  // "1 kings", "1-kings", "i-kings" — and reach the same address. The loose
  // matching is ours and lives only in this box.
  var norm = function (t) {
    t = String(t).toLowerCase();
    t = t.replace(/\\b(iii)\\b/g, "3").replace(/\\b(ii)\\b/g, "2").replace(/\\b(i)\\b/g, "1");
    return t.replace(/[^a-z0-9\\u0590-\\u05FF]+/g, "");
  };
  var atlasRows = [].slice.call(document.querySelectorAll(".atlas-row")).map(function (r) {
    var aw = r.querySelector(".aw");
    return { el: r, key: norm((r.getAttribute("data-p") || "") + " " + (aw ? aw.textContent : "") + " " + (r.getAttribute("href") || "")) };
  });
  var groups = [].slice.call(document.querySelectorAll(".workgroup")).map(function (g) {
    var names = [].slice.call(g.querySelectorAll(".en")).map(function (e) { return e.textContent; });
    [].slice.call(g.querySelectorAll(".he:not(.none)")).forEach(function (e) { names.push(e.textContent); });
    [].slice.call(g.querySelectorAll("a[href]")).forEach(function (a) {
      names.push(a.getAttribute("href").replace(/^\\//, "").replace(/\\?.*$/, ""));
    });
    return { el: g, keys: names.map(norm), first: g.querySelector("a.book") };
  });
  function sift() {
    var q = norm(document.getElementById("q").value);
    groups.forEach(function (g) {
      g.el.hidden = !!q && !g.keys.some(function (k) { return k.indexOf(q) >= 0; });
      // A live search opens the fold: the row that matched may stand behind
      // it, and a hit the reader cannot see is a miss. An emptied box folds
      // the groups back to rest.
      var d = g.el.querySelector("details.fold");
      if (d) d.open = !!q && !g.el.hidden;
    });
    // The atlas rows sift like the groups do: a row is hidden when it does
    // not match, so an opened family shows the matches and not the thousands
    // around them.
    atlasRows.forEach(function (r) {
      r.el.hidden = !!q && r.key.indexOf(q) < 0;
    });
    // The family frame follows its contents: hidden when everything inside
    // is, opened by a live match, restored to its resting state — carried on
    // the element itself — when the box empties.
    [].slice.call(document.querySelectorAll("section.family")).forEach(function (fs) {
      var any = [].slice.call(fs.querySelectorAll(".workgroup, .atlas-row")).some(function (g) { return !g.hidden; });
      fs.hidden = !!q && !any;
      var d = fs.querySelector("details.fam");
      if (d) d.open = q ? any : d.hasAttribute("data-rest-open");
    });
  }
  // ---- the word's own record, on the door ------------------------------
  // A family name's word opens the store's card for its exact key: readings
  // oldest source first, each with the licence of the record that carries
  // it — the same law as the reader's HUD, fetched from the same store,
  // shard by shard as words are pressed. Pressing the word never toggles
  // the fold it sits in; the fold is the summary's, the word is its own.
  var STORE_BASE = "/genesis-book-reader-v4/data/route-store/";
  var storeIndex = null, shardCache = {};
  // The names are the declarations record's, embedded at build time — the
  // same record the reader fetches. An unknown posture prints verbatim.
  var POSTURE_NAMES = ${JSON.stringify(POSTURE_NAMES)};
  function licName(p) {
    p = String(p || "");
    if (!p) return "License unrecorded";
    return POSTURE_NAMES[p] || p;
  }
  function shardOf(k) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(k)).then(function (buf) {
      var b = new Uint8Array(buf)[0];
      return (b < 16 ? "0" : "") + b.toString(16);
    });
  }
  var wcard = document.getElementById("wcard"), wshade = document.getElementById("wshade");
  function closeCard() { wcard.hidden = true; wshade.hidden = true; }
  wshade.addEventListener("click", closeCard);
  wcard.querySelector(".head button").addEventListener("click", closeCard);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCard(); });
  // One selected reading at a time, and the record under it is the record of
  // that reading — the reader's law, the reader's card. A pill press moves the
  // selection and repaints the record; nothing else on the door moves.
  function paint(rows, idx, idx0) {
    var r = rows[idx], m = (storeIndex.m_sources || {})[r[3]] || {};
    wcard.querySelector(".r-now .v").textContent = r[1];
    [].slice.call(wcard.querySelectorAll(".r-pills button")).forEach(function (b, i) {
      b.setAttribute("aria-pressed", i === idx ? "true" : "false");
    });
    var body = wcard.querySelector(".d-body");
    body.textContent = r[2] || r[1];
    var foot = wcard.querySelector(".d-foot");
    foot.replaceChildren();
    foot.append((m.label || r[3]) + (r[4] && r[4] !== "S_NO_SOURCE_YEAR" ? " \u00b7 " + r[4] : ""));
    var chip = document.createElement("span"); chip.className = "lic-chip";
    chip.textContent = licName(m.licensePosture); foot.append(chip);
    if (m.licensePointer) {
      var a = document.createElement("a"); a.href = m.licensePointer; a.target = "_blank";
      a.rel = "noreferrer"; a.textContent = "License terms";
      foot.append(" ", a);
    }
    // P · the grouper for M, when two M report the exact same D. One reading
    // stands on one record; when another source carries that same record it
    // is corroboration, and a card that shows one source for a definition two
    // sources carry is quietly under-reporting what the store holds. Pressing
    // a corroborating source goes to how that source read it.
    // P counts M, not rows. One provider's entry can separate into many
    // readings on the declaration's own marks — Strong's alone splits into
    // nineteen for one form — and every piece carries that provider's single
    // record. Counting rows called one source eighteen; the grouper is M.
    var D = r[2] || r[1] || "";
    var also = [], seenM = {};
    seenM[r[3]] = 1;
    for (var j = 0; j < rows.length; j += 1) {
      if (j === idx) continue;
      if ((rows[j][2] || rows[j][1] || "") !== D) continue;
      if (seenM[rows[j][3]]) continue;
      seenM[rows[j][3]] = 1;
      also.push(j);
    }
    if (!also.length) return;
    var P_INLINE = 3;
    var line = document.createElement("p"); line.className = "d-also";
    var lab = document.createElement("span"); lab.className = "d-also-lab";
    lab.textContent = "the same record, carried by " + also.length + " more source" + (also.length === 1 ? "" : "s");
    line.append(lab);
    var srcBtn = function (j) {
      var mj = (storeIndex.m_sources || {})[rows[j][3]] || {};
      var btn = document.createElement("button"); btn.type = "button"; btn.className = "d-also-m";
      btn.append((mj.label || rows[j][3]) + " · " + (rows[j][4] && rows[j][4] !== "S_NO_SOURCE_YEAR" ? rows[j][4] : "no source year"));
      var c2 = document.createElement("span"); c2.className = "lic-chip";
      c2.textContent = licName(mj.licensePosture); btn.append(c2);
      var rd = document.createElement("span"); rd.className = "d-also-read";
      rd.textContent = "reads it \u201c" + rows[j][1] + "\u201d";
      btn.append(rd);
      btn.addEventListener("click", function (ev) { ev.stopPropagation(); paint(rows, j); });
      return btn;
    };
    also.slice(0, P_INLINE).forEach(function (j) { line.append(srcBtn(j)); });
    if (also.length > P_INLINE) {
      var restJ = also.slice(P_INLINE);
      var sel = document.createElement("select"); sel.className = "d-also-more";
      var o0 = document.createElement("option"); o0.value = "";
      o0.textContent = restJ.length + " more source" + (restJ.length === 1 ? "" : "s") + "\u2026";
      sel.append(o0);
      restJ.forEach(function (j, i2) {
        var mj = (storeIndex.m_sources || {})[rows[j][3]] || {};
        var o = document.createElement("option"); o.value = String(i2);
        o.textContent = (mj.label || rows[j][3]) + " \u00b7 " + rows[j][4] + " \u00b7 reads it \u201c" + rows[j][1] + "\u201d";
        sel.append(o);
      });
      sel.addEventListener("change", function (ev) {
        ev.stopPropagation();
        var j = restJ[Number(sel.value)];
        if (j !== undefined) paint(rows, j);
      });
      line.append(sel);
    }
    // the body scrolls, the foot is pinned — corroboration goes in the part
    // that can yield, so the source line beneath it never can
    body.append(line);
  }
  function openCard(surface, key) {
    wcard.querySelector(".head b").textContent = surface;
    wcard.querySelector(".head b").setAttribute("lang", "he");
    var pills = wcard.querySelector(".r-pills");
    wcard.querySelector(".r-now .v").textContent = "reading the records\u2026";
    wcard.querySelector(".r-now .v").className = "v none";
    pills.replaceChildren();
    wcard.querySelector(".d-body").textContent = "";
    wcard.querySelector(".d-foot").replaceChildren();
    wcard.querySelector(".prov").textContent = "";
    wcard.hidden = false; wshade.hidden = false;
    var idxP = storeIndex ? Promise.resolve(storeIndex)
      : fetch(STORE_BASE + "index.json").then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { storeIndex = j; return j; });
    Promise.all([idxP, shardOf(key)]).then(function (pair) {
      var idx = pair[0], sh = pair[1];
      if (!idx) { wcard.querySelector(".r-now .v").textContent = "the store\u2019s index could not be read"; return null; }
      var url = STORE_BASE + "shards/" + sh + ".bin" + (idx.store_version ? "?v=" + idx.store_version : "");
      var shP = shardCache[sh] ? Promise.resolve(shardCache[sh])
        : fetch(url).then(function (r) { return r.ok ? r.body.pipeThrough(new DecompressionStream("gzip")) : null; })
          .then(function (s) { return s ? new Response(s).json() : null; })
          .then(function (j) { shardCache[sh] = j; return j; });
      return shP.then(function (shard) {
        var rows = (shard && shard[key]) || [];
        if (!rows.length) {
          wcard.querySelector(".r-now .v").textContent = "no reading in the catalog for this form";
          return;
        }
        // oldest source first — the same order the reader's own card uses, and
        // the same one the masthead's chip is chosen by
        rows = rows.slice().sort(function (a, b) {
          var ya = parseInt(a[4], 10), yb = parseInt(b[4], 10);
          ya = isNaN(ya) ? 9e9 : ya; yb = isNaN(yb) ? 9e9 : yb;
          return (ya - yb) || (a[0] - b[0]);
        });
        wcard.querySelector(".r-now .v").className = "v";
        rows.forEach(function (r, i) {
          var m = (idx.m_sources || {})[r[3]] || {};
          var b = document.createElement("button");
          b.type = "button"; b.textContent = r[1];
          b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
          b.title = (r[4] && r[4] !== "S_NO_SOURCE_YEAR" ? r[4] + " \u00b7 " : "") + (m.label || r[3]);
          b.addEventListener("click", function () { paint(rows, i); });
          pills.append(b);
        });
        paint(rows, 0);
        wcard.querySelector(".prov").textContent =
          rows.length + " reading" + (rows.length === 1 ? "" : "s") + " \u00b7 oldest source first \u00b7 " +
          (idx.rule_id || "the route store");
      });
    }).catch(function () { wcard.querySelector(".r-now .v").textContent = "the store could not be reached"; });
  }
  document.addEventListener("click", function (e) {
    var w = e.target.closest ? e.target.closest(".fw[data-k]") : null;
    if (!w) return;
    e.preventDefault();          // the fold's toggle is the summary's default — cancelled
    e.stopPropagation();
    openCard(w.textContent, w.getAttribute("data-k"));
  }, true);
  function go(e) {
    e.preventDefault();
    var live = groups.filter(function (g) { return !g.el.hidden; });
    if (live.length && document.getElementById("q").value.trim()) location.href = live[0].first.getAttribute("href");
    return false;
  }
  </script>
  <!-- A book's own title is corpus text and is not printed here. This page
       carries no records, so it can cite nothing; it says only how each book is
       commonly named, and the title itself waits inside, where it opens. -->
  <footer>A book's own title is printed where it can be opened — inside the reader, out of the ledger, with the records behind it. This page names a built book as it is commonly read, and names everything not yet built by its recorded id alone, exactly as the bridge carries it — some ids hold the work's own Hebrew title, and that is the record showing, not this page translating. The Hebrew of each built book carries its own licence, named on the page it is read from and in anything exported from it.</footer>
</main>
</body>
</html>
`;

// ---- the other face of the door ------------------------------------------
//
// The README described a proof slice of two verses with two commentators on it,
// months after the two books and their commentary had shipped whole. Nobody
// lied; it was written once and never had a reason to change. So it is written
// from the same counts as the page.
// A work is withheld because the record says so, not because no zone happened
// to answer for it. This list used to be derived from the absence of a file,
// which meant a zone deleted by accident printed the same honest-looking page
// as a work deliberately held, and nothing anywhere could tell the two apart.
// So the plan carries the state, this reads it, and the two ways they can
// disagree are both errors rather than pages.
const withheldBooks = BOOKS.filter((b) => b.serve_state === "WITHHELD");
const servedWithNoZone = BOOKS.filter((b) => b.serve_state !== "WITHHELD" && !books.some((x) => x.slug === b.slug));
if (servedWithNoZone.length) {
  console.error("A_SERVED_WORK_HAS_NO_ZONE — refusing to build the door.");
  for (const b of servedWithNoZone)
    console.error(`  ${b.work_id} is not withheld in the record and ${join(ZONES, b.zone)} does not answer for it`);
  console.error("  Either the zone build did not run, or the work is being held — and a holding is declared in the record, never left to an absent file.");
  process.exit(2);
}
const heldWithAZone = withheldBooks.filter((b) => books.some((x) => x.slug === b.slug));
if (heldWithAZone.length) {
  console.error("A_WITHHELD_WORK_BUILT_A_ZONE — refusing to build the door.");
  for (const b of heldWithAZone)
    console.error(`  ${b.work_id} is withheld in the record and ${b.zone} was built anyway`);
  process.exit(2);
}
const titleCase = (t) => String(t).split("-").map((w) =>
  (w.length <= 2 && w === w.toLowerCase() && /^[ivx]+$/.test(w)) ? w.toUpperCase()
    : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// The README is for somebody arriving at the repository, and what they need is
// the rules this code is held to — not a snapshot of the corpus. Counts moved
// out entirely: they were three copies of numbers the receipt already carries,
// they went stale on every build, and "15,790 rendered COMPspan records" tells
// a reader nothing they could act on. Grain vocabulary went with them. What is
// left is what stays true between builds, so this file changes when the design
// changes and not when a work lands.
const readme = `# The Tabernacle

A Hebrew reader on a sealed chain. Every reading printed under a word traces to
the record that carries it, and every record to the licence it was released
under. No English is forced: a word offers every reading its sources attest, one
at a time, and the reader chooses.

Live site: https://mashiachsonyosef.github.io/

## What is served, and how much of it

The front page lists every work and counts what it holds. Exact figures, per-work
byte hashes and the inputs they were computed from are in
\`front-door-counts-receipt-v1.json\`, regenerated by every build. Those are the
authority; nothing here restates them.

A work whose address answers but whose text is not served says so at that
address, and returns when what it is waiting on is settled.

## The rules this code is held to

Read these before changing anything. Each is enforced by a check named in
\`genesis-book-reader-v4/PIPELINE-MANIFEST.md\`, which is generated and lists
every rule the code declares along with the check that guards it — and, at the
end of a run, what the checks do not cover.

- **Nothing is typed that the record can say.** No page and no tool supplies a
  character of the text, a work's name, a count, or a licence. Where you find a
  literal standing in for a record, that is the bug.
- **One reader.** A per-book page would be a second place for the standard not
  to apply, so there is not one.
- **A licence travels with the text it covers**, is named on the page the text
  is read from and in anything exported from it, and is never inherited from
  the book a work sits in.
- **A key keeps what the source wrote.** Points and cantillation come off; the
  boundary maqaf stays, in place. A word written with one keys with it and is
  never fused.
- **The reader may not draw finer than the record proves.** Where a record
  scopes a claim to a verse, the page draws it at the verse.
- **A refusal is printed, not swallowed.** A reading that cannot be traced is
  named as untraceable rather than quietly dropped.

## Building and checking

\`\`\`
cd genesis-book-reader-v4
./build.sh <mirror> <bridge.csv.gz> <serves> <YYYY-MM-DD>
tools/run-all-checks.sh
\`\`\`

The build runs from sealed inputs and is re-runnable: the same inputs give the
same bytes. The checks run against the rendered page rather than the source.
They sweep every work that is served, they name what they skipped and why, and
a run that could not reach its inputs is counted apart from one that passed —
an empty run must never read as a clean one.

## Two lanes

The corpus lane acquires, verifies and seals the text, the definition records
and the identity ledgers. Nothing in this repository reaches past what that lane
has sealed. The synthesis lane — this repository — builds the reader from those
artifacts and may not add a character to them.

## Licensing

There is no single licence. Every work carries its own, computed from its own
records. Nothing here is licensed as a whole, and nothing inherits a licence
from what it sits beside.

Served from the \`gh-pages\` branch.

`;

const redirect = (b) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(b.en)} · The Tabernacle</title>
<link rel="canonical" href="/${b.slug}">
<!-- One reader, reached by a clean address. The reader rewrites the bar back to
     /${b.slug} once it has loaded, so this path is what a reader sees, keeps and
     returns to — and this file is what makes returning to it work.

     The script goes first, and it is the only one of the two that carries
     anything asked of this address through: /${b.slug}?c=open has to still say
     c=open by the time the reader is the one reading it. The meta refresh below
     it is the fallback for a browser running no script, and it cannot carry a
     question — which is why it must not be the one that wins the race. -->
<script>var q=location.search.replace(/^[?]/,"");location.replace("/genesis-book-reader-v4/zone.html?b=${b.slug}&clean=${b.slug}"+(q?"&"+q:""));</script>
<meta http-equiv="refresh" content="0; url=/genesis-book-reader-v4/zone.html?b=${b.slug}&clean=${b.slug}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0910;
  color:#a99a80;font:16px Georgia,serif} a{color:#e8c46a}</style>
</head>
<body><p>Opening ${esc(b.en)} — <a href="/genesis-book-reader-v4/zone.html?b=${b.slug}&clean=${b.slug}">continue</a></p>
</body>
</html>
`;

// The only Hebrew this page may print is a title carried from a zone — the
// ledger's own word, shown in the masthead's frame. Scrub every carried title
// out and no Hebrew may remain: anything left is a character this page cannot
// stand behind. Checked here rather than trusted, because this file is
// generated and a generator can drift too.
const HEBREW = /[\u0590-\u05FF]/;
const scrubTitles = (text) => {
  // Two kinds of Hebrew stand on this page and both are records: the carried
  // zone titles, and the atlas rows' recorded ids (some ids hold the work's
  // own Hebrew title). One list, longest first — a carried title can sit
  // inside a recorded id (Genesis inside a Ben-Yehuda essay named for it),
  // and scrubbing the short one first would cut it out of the long one's
  // middle and orphan the remainder as Hebrew nobody owns.
  const known = [];
  for (const b of books) if (b.he) known.push(b.he);
  for (const lf of LEDGER.families) if (lf.he) for (const t of lf.he_tokens) known.push(t.s);
  for (const f of Object.values(ATLAS.families))
    for (const w of f.works) if (HEBREW.test(w.id)) known.push(esc(w.id.split("/").pop()));
  known.sort((a, b) => b.length - a.length);
  let t = text;
  for (const nm of known) t = t.split(nm).join("");
  return t;
};
if (HEBREW.test(scrubTitles(doc))) throw new Error("the front door printed a character of the text beyond the carried titles — refusing output");

if (HEBREW.test(readme)) throw new Error("the README printed a character of the text — refusing output");

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "index.html"), doc);
writeFileSync(join(OUT, "README.md"), readme);
writeFileSync(join(OUT, "front-door-counts-receipt-v1.json"), countReceiptJson);
// One page, used at a withheld work's own address and at any historical address
// that pointed to it. A withdrawal does not release a published address; it
// changes what the address has to say. The build after the work returns writes
// the ordinary stub over this one, because both are derived from the zones on
// disk and neither is typed into a list.
// The reason a work is held is a fact in the record, so the page prints the
// record's sentence rather than one typed here. A page that says the same
// thing about every held work is a page that stops being read.
// A withholding carries its own provenance onto the page, the same as every
// other claim here. A sentence this lane wrote and a status a ledger issued
// are different kinds of thing, and a reader is entitled to know which one is
// keeping a book from them.
const heldFrom = (b) => {
  if (!b || b.serve_state !== "WITHHELD") return "";
  if (b.withheld_basis === "SEALED_HOLD_LEDGER") return `Held by the record: ${b.withheld_from}`;
  return `Held by this lane, not yet by a record: ${b.withheld_from}`;
};
const heldPage = (reason = "", from = "") => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Withheld · The Tabernacle</title>
<link rel="canonical" href="/">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0910;
  color:#a99a80;font:16px/1.6 Georgia,serif;padding:2rem;text-align:center}
  a{color:#e8c46a} p{max-width:34rem} .prov{font-size:.82em;color:#6d6152}</style>
</head>
<body><p>This address is kept, and the work behind it is not being served.<br><br>
${reason ? esc(reason) + "<br><br>" : ""}Nothing is shown in the meantime, and the
address returns here when the holding ends.<br><br>
${from ? `<span class="prov">${esc(from)}</span><br><br>` : ""}<a href="/">The Tabernacle</a></p>
</body>
</html>
`;
for (const b of withheldBooks) {
  mkdirSync(join(OUT, b.slug), { recursive: true });
  writeFileSync(join(OUT, b.slug, "index.html"), heldPage(b.withheld_reason, heldFrom(b)));
}
for (const b of books) {
  mkdirSync(join(OUT, b.slug), { recursive: true });
  const r = redirect(b);
  if (HEBREW.test(r)) throw new Error(`${b.slug}: the address page printed a character of the text — refusing output`);
  writeFileSync(join(OUT, b.slug, "index.html"), r);
}

// A published address is a promise. Where a work has been republished under
// the address rule, the old address keeps answering — as a plain redirect to
// where the work now lives — driven by the recorded events in
// data/address-history-v1.json, never by a list typed here.
const HISTORY = arg("history", "data/address-history-v1.json");
if (existsSync(HISTORY)) {
  const hist = JSON.parse(readFileSync(HISTORY, "utf8"));
  for (const row of hist.republished || []) {
    const target = slugOfWork.get(row.to_work_id);
    if (!target) throw new Error(`address history points at ${row.to_work_id}, which the plan does not publish — refusing a redirect to nowhere`);
    const b = books.find((x) => x.slug === target);
    mkdirSync(join(OUT, row.from), { recursive: true });
    // A published address is a promise, and a withdrawal does not release it.
    // When the work an address points at is not currently served, the address
    // still answers — and says so, rather than forwarding a reader into a
    // reader with nothing in it. It stops saying so on the build after the
    // work comes back, because this is derived from the zones on disk and
    // never from a list typed here.
    if (!b) {
      const held = BOOKS.find((x) => x.slug === target);
      writeFileSync(join(OUT, row.from, "index.html"), heldPage(held ? held.withheld_reason : "", heldFrom(held)));
      continue;
    }
    const moved = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(b.en)} · The Tabernacle</title>
<link rel="canonical" href="/${target}">
<!-- This address was published on this site and later republished at
     /${target}, when its address was rederived from the work id by the
     address rule (${esc(row.on)}). A reader who kept this address still
     arrives; the bar is rewritten to where the work lives now. -->
<script>var q=location.search.replace(/^[?]/,"");location.replace("/${target}"+(q?"?"+q:""));</script>
<meta http-equiv="refresh" content="0; url=/${target}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0910;
  color:#a99a80;font:16px Georgia,serif} a{color:#e8c46a}</style>
</head>
<body><p>${esc(b.en)} now lives at <a href="/${target}">/${target}</a></p>
</body>
</html>
`;
    if (HEBREW.test(moved)) throw new Error(`${row.from}: the redirect page printed a character of the text — refusing output`);
    writeFileSync(join(OUT, row.from, "index.html"), moved);
  }
}

console.log(`${OUT}/index.html + README.md · ${books.length} books · ${n(totalUnits)} commentary units`);
for (const b of books)
  console.log(`  ${b.slug.padEnd(9)} ${n(b.sections)} sections · ${n(b.words)} rendered COMPspan records` +
    (b.units ? ` · ${n(b.units)} commentary from ${b.works} work${b.works === 1 ? "" : "s"} · ${whereLine(b)}` : " · no commentary"));
