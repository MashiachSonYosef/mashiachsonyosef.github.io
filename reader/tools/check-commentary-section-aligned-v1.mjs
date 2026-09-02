#!/usr/bin/env node
// GUARDS: zone-commentary-rule-v2-sealed-chain-section-aligned
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// A commentary zone is a sidecar, <slug>.commentary.bin, that rides beside the
// book zone <slug>.bin and hangs a second work of the sealed chain under the
// book's sections. tools/build-commentary-zone.mjs declares how the two are
// joined, before any output:
//
//   "1. Both works are read from their own serve output. A commentary unit is
//       never invented for a base unit that has none.
//    2. Attachment is by coordinate identity of the two sealed unit ids ...
//       The chapter and section numbers are the chain's own; this builder
//       renumbers nothing.
//    3. The alignment must be total in both directions. A base section with
//       no commentary unit is fine and simply carries none; a commentary unit
//       with no base section is a refusal, because it would mean the two works
//       disagree about the shape of the book and the page would be hiding it."
//
// The builder refuses at build time. This check reads what was written and
// asks the same questions of the file, because a refusal at build time proves
// nothing about a bin built earlier, built by hand, or edited since. A sidecar
// keyed to a section the book does not have is commentary the page silently
// drops. A sidecar whose numbers came from a counter puts a comment under the
// wrong verse and prints the right label over it.
//
//   L1  the builder still declares the rule this check enforces
//   L2  every commentary unit names a base section the book carries, and the
//       sidecar sits beside the zone of the work it names
//   L3  chapter and section numbers are read from the sealed unit ids, not
//       from a counter: the key's coordinate, the attached unit's coordinate,
//       the printed label and the base section's own label all agree
//   L4  no commentary unit is invented or folded: every attached unit is one
//       sealed id, attached once, carrying its own words, and the bridge's
//       count of sealed units is the count that found a section
//   L5  where the commentary work is also a zone on this shelf, the words
//       attached under a section are the words that zone carries for the same
//       sealed unit
//   L6  the receipts count what is on disk
//   L7  every attachment stands on the declared basis
//
// What this does not prove: that the words open, gloss or cut (rule 4 of the
// builder, the gloss and span layers); that the license carried is the right
// one (rule 5, check-every-reading-licensed-v1 and check-licence-carried-v1);
// that the serve rows behind the ids are the sealed chain's
// (check-serve-oracle-checked-v1); or that the page draws a commentary under
// its section, which needs a browser (check-commentary-in-line-v1).
//
// Run: node tools/check-commentary-section-aligned-v1.mjs [--zones data/zones]
//                                                         [--builder tools/build-commentary-zone.mjs]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const BUILDER = arg("builder", join(HERE, "build-commentary-zone.mjs"));

const RULE = "zone-commentary-rule-v2-sealed-chain-section-aligned";
const SCHEMA = "ZONE_COMMENTARY_V2";
const BASIS = "SEALED_UNIT_COORDINATE_IDENTITY";
const STATE = "PROVEN_EDGE";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
// The first dozen offenders are named; the rest are counted.
const note = (arr, s) => { arr.push(arr.length < 12 ? s : null); };
const few = (arr, n = 3) => arr.filter(Boolean).slice(0, n).join(" · ");

// ── the declaration ───────────────────────────────────────────────────────
// L1 — the builder still says what this gate assumes it says. A gate whose
// premise has been edited out from under it is worse than no gate.
if (!existsSync(BUILDER)) {
  console.log(`SKIPPED — no builder at ${BUILDER}, so the rule this gate enforces cannot be quoted`);
  process.exit(3);
}
{
  const src = readFileSync(BUILDER, "utf8");
  const gone = [];
  if (!src.includes(RULE)) gone.push("the rule id");
  if (!/total in both directions/u.test(src)) gone.push("the totality clause");
  if (!/renumbers nothing/u.test(src)) gone.push("the renumbering clause");
  check("L1  the builder still declares the rule this check enforces",
    gone.length === 0,
    gone.length
      ? `${gone.join(", ")} gone from ${BUILDER.split("/").pop()} — this gate has no authority until it is back`
      : "quoted from the attachment rule declared before output");
}

// ── the coordinate a sealed unit id carries ───────────────────────────────
// Read from the id and from nothing else, the way the builder reads it. This
// is a second reading rather than an import of the builder's own parser, so
// that a parser that started counting would be caught by a reader that did
// not. The three id shapes the builder accepts for alignment:
//   <slug>-<chapter>-<section>                  the plain nested id
//   <anything>--[sefaria-]<slug>-<c>-<s>        the family-prefixed nested id
//   ...--unit-<n>, or <slug>-<n>                a bare ordinal
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const coordOf = (unitId, slug) => {
  const s = escRe(slug);
  let m = new RegExp(`^(?:.*?--(?:sefaria-)?)?${s}-(\\d+)-(\\d+)$`, "u").exec(unitId);
  if (m) return `${m[1]}:${m[2]}`;
  m = /--unit-0*(\d+)$/u.exec(unitId) || new RegExp(`^(?:.*?--(?:sefaria-)?)?${s}-0*(\\d+)$`, "u").exec(unitId);
  if (m) return String(Number(m[1]));
  return null;
};

// ── the shelf ─────────────────────────────────────────────────────────────
if (!existsSync(ZONES)) { console.log(`\nSKIPPED — no zones at ${ZONES}`); process.exit(bad ? 1 : 3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
const sidecars = bins.filter((f) => f.endsWith(".commentary.bin"));
// A fixture is a test instrument, never served; it copies a real sidecar and
// hangs entries at word positions on purpose. It is set aside, not judged.
const instruments = sidecars.filter((f) => f.startsWith("fixture-"));
const candidates = sidecars.filter((f) => !f.startsWith("fixture-"));

const cache = new Map();
const load = (f) => {
  if (cache.has(f)) return cache.get(f);
  let z = null;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { z = null; }
  cache.set(f, z);
  return z;
};

const otherRule = [], unreadable = [];
const noBase = [], wrongBase = [], orphans = [];          // L2
const renumbered = [];                                    // L3
const invented = [];                                      // L4
const wordsDiffer = [];                                   // L5
const receipts = [];                                      // L6
const offBasis = [];                                      // L7
let judged = 0, entriesRead = 0, wordsRead = 0, compared = 0, ownZonesUsed = 0;
const uncompared = [];

for (const f of candidates) {
  const slug = f.replace(/-commentary\.bin$/u, "");
  const com = load(f);
  if (!com) { unreadable.push(f); continue; }
  if (com.fixture) { instruments.push(f); continue; }
  const al = ((com.emitted_from || {}).alignment) || {};
  const thisRule = com.rule_id === RULE || com.schema_version === SCHEMA || al.rule === BASIS;
  if (!thisRule) { otherRule.push(`${f} (${com.rule_id || "no rule named"})`); continue; }
  judged += 1;

  const units = com.units || {};
  const keys = Object.keys(units);
  const works = Array.isArray(com.works) ? com.works : [];
  const baseWorkId = String(com.work || "");
  const baseSlug = baseWorkId.split("/").pop();

  // L2 — the book it rides beside
  const base = existsSync(join(ZONES, `${slug}.bin`)) ? load(`${slug}.bin`) : null;
  if (!base) {
    note(noBase, `${f} has no ${slug}.bin beside it — ${keys.length} units with no book at all`);
  }
  const baseSections = new Map();
  for (const s of (base && base.sections) || []) baseSections.set(String(s.unit), s);
  if (base) {
    // The base zone names its own work in its receipts. A sidecar that names
    // one work and sits beside the zone of another is keyed to the wrong book
    // even when, by coincidence of numbering, its keys happen to resolve.
    const said = JSON.stringify(base.work_receipts || "");
    if (baseWorkId && !said.includes(`work_id=${baseWorkId}`))
      note(wrongBase, `${f} names ${baseWorkId}; ${slug}.bin's receipts do not`);
    for (const k of keys) if (!baseSections.has(k)) note(orphans, `${slug}: ${k}`);
  }

  // L5 — the commentary work's own zone, when it is on this shelf
  const ownWords = new Map();
  let ownZone = null;
  for (const w of works) {
    const wid = String((w && w.id) || "");
    for (const cand of [w && w.zone, wid.split("/").pop()]) {
      if (!cand || `${cand}.bin` === `${slug}.bin` || !existsSync(join(ZONES, `${cand}.bin`))) continue;
      const z = load(`${cand}.bin`);
      if (!z) continue;
      ownZone = `${cand}.bin`;
      for (const s of z.sections || []) ownWords.set(String(s.unit), (s.words || []).map((x) => String(x.s || "")));
      break;
    }
    if (ownZone) break;
  }
  if (ownZone) ownZonesUsed += 1;
  else uncompared.push(`${slug} (${works.map((w) => (w && w.id) || "?").join(", ")})`);

  // L3, L4, L7 — every entry under every key
  const seenUnit = new Map();
  let attachedKeys = 0, wordsHere = 0;
  for (const k of keys) {
    const u = units[k] || {};
    const entries = Array.isArray(u.section) ? u.section : [];
    if (!entries.length) { note(invented, `${slug}: ${k} is keyed but carries no entry`); continue; }
    attachedKeys += 1;
    const keyCoord = coordOf(k, baseSlug);
    const sec = baseSections.get(k);
    for (const e of entries) {
      entriesRead += 1;
      const w = works[e.work];
      const commSlug = w && w.id ? String(w.id).split("/").pop() : "";
      const unitId = String(e.unit || "");
      const unitCoord = commSlug ? coordOf(unitId, commSlug) : null;
      const label = String(e.label || ""), ref = String(e.ref || "");

      // L3 — four places say the coordinate, and they are one coordinate
      const secLabel = sec ? String(sec.label || "") : null;
      const agree = keyCoord !== null && unitCoord !== null && keyCoord === unitCoord &&
        label.endsWith(` · ${keyCoord}`) && ref.endsWith(` ${keyCoord}`) &&
        (secLabel === null || secLabel === keyCoord);
      if (!agree)
        note(renumbered, `${slug}: ${k} <- ${unitId || "(no unit)"} · ids say ${keyCoord ?? "?"} / ${unitCoord ?? "?"}` +
          ` · label ${JSON.stringify(label)} · section label ${JSON.stringify(secLabel)}`);

      // L4 — one sealed id, attached once, carrying its own words
      if (!w) note(invented, `${slug}: ${k} names work #${e.work}, which the sidecar does not carry`);
      if (!unitId) note(invented, `${slug}: ${k} names no commentary unit`);
      else if (seenUnit.has(unitId)) note(invented, `${slug}: ${unitId} attached under both ${seenUnit.get(unitId)} and ${k}`);
      else seenUnit.set(unitId, k);
      const ws = Array.isArray(e.words) ? e.words : [];
      const surfaces = ws.map((x) => String((x && x.s) || ""));
      wordsHere += ws.length;
      if (!ws.length) note(invented, `${slug}: ${unitId || k} carries no words`);
      else if (surfaces.some((s) => !s)) note(invented, `${slug}: ${unitId} carries a word with no surface`);
      else if (surfaces.join(" ") !== String(e.text || "")) note(invented, `${slug}: ${unitId} text is not the join of its words`);

      // L5 — the same words the work's own zone carries for that unit
      if (ownZone && unitId) {
        const own = ownWords.get(unitId);
        compared += 1;
        if (!own) note(wordsDiffer, `${slug}: ${ownZone} carries no unit ${unitId}`);
        else if (own.length !== surfaces.length || own.some((s, i) => s !== surfaces[i]))
          note(wordsDiffer, `${slug}: ${unitId} · ${surfaces.length} words here, ${own.length} in ${ownZone}` +
            `${own.length === surfaces.length ? `, first difference at word ${own.findIndex((s, i) => s !== surfaces[i]) + 1}` : ""}`);
      }

      // L7 — the basis it stands on
      if (e.basis !== BASIS || e.state !== STATE)
        note(offBasis, `${slug}: ${unitId || k} stands on ${e.basis || "no basis"} / ${e.state || "no state"}`);
    }
  }
  wordsRead += wordsHere;

  // L6 — the receipts against the disk
  const counts = com.counts || {};
  const withoutCommentary = [...baseSections.keys()].filter((k) => !(units[k] && Array.isArray(units[k].section) && units[k].section.length)).length;
  const expect = (where, got, want) => {
    if (got !== want) note(receipts, `${slug}: ${where} says ${JSON.stringify(got)}, disk says ${want}`);
  };
  if (!com.counts) note(receipts, `${slug}: carries no counts`);
  if (!com.emitted_from || !com.emitted_from.alignment) note(receipts, `${slug}: carries no alignment receipt`);
  expect("counts.attached_sections", counts.attached_sections, attachedKeys);
  expect("counts.words", counts.words, wordsHere);
  expect("alignment.attached", al.attached, attachedKeys);
  expect("alignment.commentary_units", al.commentary_units, seenUnit.size);
  expect("alignment.commentary_units_without_base_section", al.commentary_units_without_base_section, 0);
  if (base) {
    expect("counts.base_sections", counts.base_sections, baseSections.size);
    expect("counts.base_sections_without_commentary", counts.base_sections_without_commentary, withoutCommentary);
    expect("alignment.base_sections", al.base_sections, baseSections.size);
    expect("alignment.base_sections_without_commentary", al.base_sections_without_commentary, withoutCommentary);
  }
  // The bridge sealed this many units of the commentary work. The builder
  // proves every one of them was served; if fewer stand under a section, two
  // ids folded onto one coordinate and one of them was dropped without a word.
  const sealed = ((com.emitted_from || {}).identity_oracle || {}).sealed_units;
  if (!Number.isInteger(sealed)) note(invented, `${slug}: the identity oracle records no sealed unit count`);
  else if (sealed !== seenUnit.size) note(invented, `${slug}: the bridge sealed ${sealed} units, ${seenUnit.size} stand under a section`);

  // L7 — what the sidecar says of itself
  if (com.rule_id !== RULE) note(offBasis, `${slug}: rule_id is ${JSON.stringify(com.rule_id)}`);
  if (com.schema_version !== SCHEMA) note(offBasis, `${slug}: schema_version is ${JSON.stringify(com.schema_version)}`);
  if (al.rule !== BASIS) note(offBasis, `${slug}: alignment.rule is ${JSON.stringify(al.rule)}`);
  works.forEach((w, i) => { if (!w || w.grain !== "SECTION") note(offBasis, `${slug}: work #${i} grain is ${JSON.stringify(w && w.grain)}`); });
}

if (!judged) {
  const why = [`${bins.length} zones on this shelf`];
  if (instruments.length) why.push(`${instruments.length} fixture instrument(s) set aside`);
  if (otherRule.length) why.push(`${otherRule.length} sidecar(s) of another rule left to their own guard: ${few(otherRule, 2)}`);
  if (unreadable.length) why.push(`${unreadable.length} unreadable: ${few(unreadable, 2)}`);
  console.log(`\nSKIPPED — no commentary sidecar of this rule is on this shelf (${why.join(" · ")}), so the alignment has nothing to be judged on`);
  process.exit(bad ? 1 : 3);
}

console.log(`\n— ${bins.length} zones · ${judged} sidecar(s) judged · ${entriesRead.toLocaleString()} attachments · ${wordsRead.toLocaleString()} commentary words` +
  `${instruments.length ? ` · ${instruments.length} instrument(s) set aside` : ""}${otherRule.length ? ` · ${otherRule.length} of another rule` : ""}` +
  `${unreadable.length ? ` · ${unreadable.length} unreadable: ${few(unreadable, 2)}` : ""} —`);

check("L2  every commentary unit names a base section the book carries",
  noBase.length + wrongBase.length + orphans.length === 0,
  noBase.length + wrongBase.length + orphans.length
    ? [noBase.length ? `${noBase.filter(Boolean).length} sidecar(s) with no book: ${few(noBase, 2)}` : "",
      wrongBase.length ? `${wrongBase.filter(Boolean).length} beside another work's zone: ${few(wrongBase, 2)}` : "",
      orphans.length ? `${orphans.length} unit(s) name a section the book does not have: ${few(orphans)}` : ""].filter(Boolean).join(" · ")
    : `${entriesRead.toLocaleString()} attachments, each under a section its book carries`);

check("L3  chapter and section numbers are read from the sealed unit ids, not from a counter",
  renumbered.length === 0,
  renumbered.length
    ? `${renumbered.length} disagree: ${few(renumbered, 2)}`
    : "key, attached unit, printed label and section label say one coordinate everywhere");

check("L4  no commentary unit is invented or folded",
  invented.length === 0,
  invented.length
    ? `${invented.length}: ${few(invented)}`
    : "every attached unit is one sealed id, attached once, carrying its own words, and the bridge's count is the count attached");

check("L5  the words attached are the words the commentary work's own zone carries",
  wordsDiffer.length === 0,
  wordsDiffer.length
    ? `${wordsDiffer.length} differ: ${few(wordsDiffer, 2)}`
    : compared
      ? `${compared.toLocaleString()} units compared against ${ownZonesUsed} zone(s)` +
        `${uncompared.length ? ` · uncompared, no zone of their own on this shelf: ${few(uncompared, 2)}` : ""}`
      : `no commentary work here is a zone of its own on this shelf, so this one went unasked: ${few(uncompared, 2)}`);

check("L6  the receipts count what is on disk",
  receipts.length === 0,
  receipts.length ? `${receipts.length} claim(s) the disk does not bear out: ${few(receipts, 2)}`
    : "attached, words, base sections and sections without commentary all count as recorded");

check("L7  every attachment stands on the declared basis",
  offBasis.length === 0,
  offBasis.length ? `${offBasis.length}: ${few(offBasis)}`
    : `${BASIS} / ${STATE} on every entry, ${SCHEMA} under ${RULE}`);

console.log("\n  what this does not say: that a commentary's words open, gloss or cut; that the");
console.log("  license each entry carries is the right one; that the serve rows behind the ids");
console.log("  are the sealed chain's; or that the page draws a commentary under its section.");
console.log("  Each of those has its own guard. This one says the two works agree about the");
console.log("  shape of the book, section by section, on the numbers the chain sealed.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
