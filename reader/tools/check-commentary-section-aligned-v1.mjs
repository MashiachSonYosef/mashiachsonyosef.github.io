#!/usr/bin/env node
// GUARDS: zone-commentary-rule-v2-sealed-chain-section-aligned, zone-commentary-rule-v3-two-zones-one-coordinate
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// A commentary zone is a sidecar, <slug>.commentary.bin, that rides beside the
// book zone <slug>.bin and hangs a second work of the sealed chain under the
// book's sections. Two builders write that sidecar, and each declares how the
// two works are joined, before any output:
//
//   tools/build-commentary-zone.mjs (rule v2, from the serve output):
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
//   tools/build-commentary-sidecar-v2.mjs (rule v3, from two finished zones):
//   the same three clauses read one step later, from the zones the fleet
//   already built and verified, plus a second basis it names on every entry:
//   where the work's id carries one more number than the base's
//   (ibn-ezra-on-zechariah-1-1-2 against zechariah-1-1) the base coordinate is
//   the work's PREFIX and the extra number is the work's own order inside the
//   section. Nothing is renumbered, folded, or inferred.
//
// The builders refuse at build time. This check reads what was written and
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
//       the printed label and the base section's own label all agree; under
//       the prefix basis the unit's extra number is the order the entry names
//   L4  no commentary unit is invented or folded: every attached unit is one
//       sealed id, attached once, carrying its own words, and the sealed count
//       of the commentary work (the bridge's under v2, its own zone's under v3)
//       is the count that found a section
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
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));

const SCHEMA = "ZONE_COMMENTARY_V2";
const IDENTITY = "SEALED_UNIT_COORDINATE_IDENTITY";
const PREFIX = "SEALED_UNIT_COORDINATE_PREFIX";
const STATE = "PROVEN_EDGE";
// The two rules a sidecar may stand under, each with the builder that declares
// it and the clauses this gate assumes are still in that builder's text.
const RULES = {
  "zone-commentary-rule-v2-sealed-chain-section-aligned": {
    builder: join(HERE, "build-commentary-zone.mjs"),
    clauses: [["the totality clause", /total in both directions/u], ["the renumbering clause", /renumbers nothing/u]],
    bases: [IDENTITY], alignmentRule: (r) => r === IDENTITY,
    sealedCount: "identity_oracle",
  },
  "zone-commentary-rule-v3-two-zones-one-coordinate": {
    builder: join(HERE, "build-commentary-sidecar-v2.mjs"),
    // the clauses wrap across comment lines, so "//" may stand inside them
    clauses: [["the invention clause", /never[\s/]+invented/u], ["the refusal clause", /no base section is a[\s/]+refusal/u], ["the renumbering clause", /nothing is renumbered/u]],
    bases: [IDENTITY, PREFIX], alignmentRule: (r) => String(r || "").startsWith(IDENTITY) && String(r).includes(PREFIX),
    sealedCount: "own_zone",
  },
};

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
// The first dozen offenders are named; the rest are counted.
const note = (arr, s) => { arr.push(arr.length < 12 ? s : null); };
const few = (arr, n = 3) => arr.filter(Boolean).slice(0, n).join(" · ");

// ── the declaration ───────────────────────────────────────────────────────
// L1 — each builder still says what this gate assumes it says. A gate whose
// premise has been edited out from under it is worse than no gate. A rule
// whose builder is absent has no authority here, and a sidecar of that rule
// is judged against a declaration nobody can quote — which is a failure of
// the sidecar's, not a skip.
const quoted = new Set();
{
  const gone = [];
  for (const [id, r] of Object.entries(RULES)) {
    if (!existsSync(r.builder)) continue;
    const src = readFileSync(r.builder, "utf8");
    const missing = [];
    if (!src.includes(id)) missing.push("the rule id");
    for (const [name, re] of r.clauses) if (!re.test(src)) missing.push(name);
    if (missing.length) gone.push(`${missing.join(", ")} gone from ${r.builder.split("/").pop()}`);
    else quoted.add(id);
  }
  check("L1  the builder still declares the rule this check enforces",
    gone.length === 0 && quoted.size > 0,
    gone.length ? `${gone.join(" · ")} — this gate has no authority until it is back`
      : quoted.size ? `quoted from the attachment rule declared before output in ${[...quoted].map((id) => RULES[id].builder.split("/").pop()).join(" and ")}`
        : "no builder of either rule is here to quote");
}

// ── the coordinate a sealed unit id carries ───────────────────────────────
// Read from the id and from nothing else, the way the builders read it. This
// is a second reading rather than an import of a builder's own parser, so
// that a parser that started counting would be caught by a reader that did
// not. The id shapes accepted for alignment:
//   <slug>-<chapter>-<section>                  the plain nested id
//   <slug>-<chapter>-<section>-<order>          the nested id with the work's own order (prefix basis)
//   <anything>--[sefaria-]<slug>-<c>-<s>        the family-prefixed nested id
//   ...--unit-<n>, or <slug>-<n>                a bare ordinal
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const coordOf = (unitId, slug) => {
  const s = escRe(slug);
  let m = new RegExp(`^(?:.*?--(?:sefaria-)?)?${s}-(\\d+)-(\\d+)$`, "u").exec(unitId);
  if (m) return { coord: `${m[1]}:${m[2]}`, order: null };
  m = new RegExp(`^${s}-(\\d+)-(\\d+)-(\\d+)$`, "u").exec(unitId);
  if (m) return { coord: `${m[1]}:${m[2]}`, order: Number(m[3]) };
  m = /--unit-0*(\d+)$/u.exec(unitId) || new RegExp(`^(?:.*?--(?:sefaria-)?)?${s}-0*(\\d+)$`, "u").exec(unitId);
  if (m) return { coord: String(Number(m[1])), order: null };
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

const otherRule = [], unreadable = [], unquoted = [];
const noBase = [], wrongBase = [], orphans = [];          // L2
const renumbered = [];                                    // L3
const invented = [];                                      // L4
const wordsDiffer = [];                                   // L5
const receipts = [];                                      // L6
const offBasis = [];                                      // L7
let judged = 0, entriesRead = 0, wordsRead = 0, compared = 0, ownZonesUsed = 0;
const byRule = {};
const uncompared = [];

for (const f of candidates) {
  const slug = f.replace(/\.commentary\.bin$/u, "");
  const com = load(f);
  if (!com) { unreadable.push(f); continue; }
  if (com.fixture) { instruments.push(f); continue; }
  const al = ((com.emitted_from || {}).alignment) || {};
  const rule = RULES[com.rule_id] || (com.schema_version === SCHEMA || al.rule === IDENTITY ? RULES["zone-commentary-rule-v2-sealed-chain-section-aligned"] : null);
  const ruleId = RULES[com.rule_id] ? com.rule_id : rule ? "zone-commentary-rule-v2-sealed-chain-section-aligned" : null;
  if (!rule) { otherRule.push(`${f} (${com.rule_id || "no rule named"})`); continue; }
  if (!quoted.has(ruleId)) { note(unquoted, `${f} stands under ${ruleId}, whose builder could not be quoted`); }
  judged += 1; byRule[ruleId] = (byRule[ruleId] || 0) + 1;

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

  // L5 — each commentary work's own zone, when it is on this shelf
  const ownByWork = works.map((w) => {
    const wid = String((w && w.id) || "");
    for (const cand of [w && w.zone, wid.split("/").pop()]) {
      if (!cand || `${cand}.bin` === `${slug}.bin` || !existsSync(join(ZONES, `${cand}.bin`))) continue;
      const z = load(`${cand}.bin`);
      if (!z) continue;
      const words = new Map();
      for (const s of z.sections || []) words.set(String(s.unit), (s.words || []).map((x) => String(x.s || "")));
      return { zone: `${cand}.bin`, words };
    }
    return null;
  });
  ownByWork.forEach((o, i) => {
    if (o) ownZonesUsed += 1;
    else uncompared.push(`${slug} (${(works[i] && works[i].id) || "?"})`);
  });

  // L3, L4, L7 — every entry under every key
  const seenUnit = new Map();
  const attachedPerWork = works.map(() => 0);
  let attachedKeys = 0, wordsHere = 0;
  for (const k of keys) {
    const u = units[k] || {};
    const entries = Array.isArray(u.section) ? u.section : [];
    if (!entries.length) { note(invented, `${slug}: ${k} is keyed but carries no entry`); continue; }
    attachedKeys += 1;
    const keyCoord = (coordOf(k, baseSlug) || {}).coord ?? null;
    const sec = baseSections.get(k);
    for (const e of entries) {
      entriesRead += 1;
      const w = works[e.work];
      if (w) attachedPerWork[e.work] += 1;
      const commSlug = w ? String(w.zone || String(w.id || "").split("/").pop()) : "";
      const unitId = String(e.unit || "");
      const uc = commSlug ? coordOf(unitId, commSlug) : null;
      const unitCoord = uc ? uc.coord : null, order = uc ? uc.order : null;
      const label = String(e.label || ""), ref = String(e.ref || "");

      // L3 — four places say the coordinate, and they are one coordinate.
      // Under v2 the ref is "<work> <coord>"; under v3 the ref is the work's
      // own section label, which is the coordinate itself, with the order
      // after it where the prefix basis applies, and the label ends with it.
      const secLabel = sec ? String(sec.label || "") : null;
      const said = order === null ? keyCoord : `${keyCoord}:${order}`;
      const refAgrees = rule.sealedCount === "identity_oracle" ? ref.endsWith(` ${keyCoord}`) : ref === said;
      const labelAgrees = label.endsWith(` · ${said}`);
      const agree = keyCoord !== null && unitCoord !== null && keyCoord === unitCoord && refAgrees && labelAgrees &&
        (secLabel === null || secLabel === keyCoord) &&
        (order === null ? e.order == null : e.order === order);
      if (!agree)
        note(renumbered, `${slug}: ${k} <- ${unitId || "(no unit)"} · ids say ${keyCoord ?? "?"} / ${unitCoord ?? "?"}${order !== null ? ` order ${order} (entry says ${e.order})` : ""}` +
          ` · ref ${JSON.stringify(ref)} · label ${JSON.stringify(label)} · section label ${JSON.stringify(secLabel)}`);

      // L4 — one sealed id, attached once, carrying its own words
      if (!w) note(invented, `${slug}: ${k} names work #${e.work}, which the sidecar does not carry`);
      if (!unitId) note(invented, `${slug}: ${k} names no commentary unit`);
      else if (seenUnit.has(unitId)) note(invented, `${slug}: ${unitId} attached under both ${seenUnit.get(unitId)} and ${k}`);
      else seenUnit.set(unitId, k);
      const ws = Array.isArray(e.words) ? e.words : [];
      const surfaces = ws.map((x) => String((x && x.s) || ""));
      wordsHere += ws.length;
      // a held entry ships no words on purpose and says so; that is rule 5,
      // not an invention
      if (!ws.length && !e.held) note(invented, `${slug}: ${unitId || k} carries no words`);
      else if (surfaces.some((s) => !s)) note(invented, `${slug}: ${unitId} carries a word with no surface`);
      else if (ws.length && surfaces.join(" ") !== String(e.text || "")) note(invented, `${slug}: ${unitId} text is not the join of its words`);

      // L5 — the same words the work's own zone carries for that unit
      const own = w ? ownByWork[e.work] : null;
      if (own && unitId && ws.length) {
        const theirs = own.words.get(unitId);
        compared += 1;
        if (!theirs) note(wordsDiffer, `${slug}: ${own.zone} carries no unit ${unitId}`);
        else if (theirs.length !== surfaces.length || theirs.some((s, i) => s !== surfaces[i]))
          note(wordsDiffer, `${slug}: ${unitId} · ${surfaces.length} words here, ${theirs.length} in ${own.zone}` +
            `${theirs.length === surfaces.length ? `, first difference at word ${theirs.findIndex((s, i) => s !== surfaces[i]) + 1}` : ""}`);
      }

      // L7 — the basis it stands on: one of the rule's, and the prefix basis
      // only where the id actually carries the extra number
      const basisOk = rule.bases.includes(e.basis) && e.state === STATE &&
        (e.basis === PREFIX ? order !== null : order === null);
      if (!basisOk)
        note(offBasis, `${slug}: ${unitId || k} stands on ${e.basis || "no basis"} / ${e.state || "no state"}${order !== null && e.basis !== PREFIX ? " with an order its basis does not name" : ""}`);
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
  expect("alignment.commentary_units_without_base_section", al.commentary_units_without_base_section, 0);
  if (rule.sealedCount === "identity_oracle") {
    expect("alignment.attached", al.attached, attachedKeys);
    expect("alignment.commentary_units", al.commentary_units, seenUnit.size);
  } else {
    // v3 counts per work: units attached, and the work's own unit count,
    // which under the totality clause are the same number
    const pw = Array.isArray(al.per_work) ? al.per_work : [];
    if (pw.length !== works.length) note(receipts, `${slug}: alignment.per_work carries ${pw.length} work(s), the sidecar ${works.length}`);
    pw.forEach((r, i) => {
      expect(`alignment.per_work[${i}].attached`, r.attached, attachedPerWork[i] || 0);
      expect(`alignment.per_work[${i}].commentary_units`, r.commentary_units, attachedPerWork[i] || 0);
      const own = ownByWork[i];
      if (own) expect(`alignment.per_work[${i}].commentary_units (against ${own.zone})`, r.commentary_units, own.words.size);
    });
    expect("counts.attached_units", counts.attached_units, seenUnit.size);
    expect("counts.works", counts.works, works.length);
    expect("counts.held_works", counts.held_works, works.filter((w) => w && w.held).length);
  }
  if (base) {
    expect("counts.base_sections", counts.base_sections, baseSections.size);
    expect("counts.base_sections_without_commentary", counts.base_sections_without_commentary, withoutCommentary);
    expect("alignment.base_sections", al.base_sections, baseSections.size);
    expect("alignment.base_sections_without_commentary", al.base_sections_without_commentary, withoutCommentary);
  }
  // The commentary work was sealed with this many units. Every one of them
  // must stand under a section; if fewer do, two ids folded onto one
  // coordinate and one of them was dropped without a word.
  if (rule.sealedCount === "identity_oracle") {
    const sealed = ((com.emitted_from || {}).identity_oracle || {}).sealed_units;
    if (!Number.isInteger(sealed)) note(invented, `${slug}: the identity oracle records no sealed unit count`);
    else if (sealed !== seenUnit.size) note(invented, `${slug}: the bridge sealed ${sealed} units, ${seenUnit.size} stand under a section`);
  } else {
    works.forEach((w, i) => {
      const own = ownByWork[i];
      if (!own) note(invented, `${slug}: ${(w && w.zone) || "work #" + i} is not a zone on this shelf, so its sealed count cannot be read`);
      else if (own.words.size !== attachedPerWork[i]) note(invented, `${slug}: ${own.zone} carries ${own.words.size} units, ${attachedPerWork[i]} stand under a section`);
    });
  }

  // L7 — what the sidecar says of itself
  if (com.rule_id !== ruleId) note(offBasis, `${slug}: rule_id is ${JSON.stringify(com.rule_id)}`);
  if (com.schema_version !== SCHEMA) note(offBasis, `${slug}: schema_version is ${JSON.stringify(com.schema_version)}`);
  if (!rule.alignmentRule(al.rule)) note(offBasis, `${slug}: alignment.rule is ${JSON.stringify(al.rule)}`);
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

console.log(`\n— ${bins.length} zones · ${judged} sidecar(s) judged (${Object.entries(byRule).map(([id, n]) => `${n} under ${id.replace(/^zone-commentary-rule-/u, "")}`).join(", ")}) · ${entriesRead.toLocaleString()} attachments · ${wordsRead.toLocaleString()} commentary words` +
  `${instruments.length ? ` · ${instruments.length} instrument(s) set aside` : ""}${otherRule.length ? ` · ${otherRule.length} of another rule` : ""}` +
  `${unreadable.length ? ` · ${unreadable.length} unreadable: ${few(unreadable, 2)}` : ""} —`);
if (unquoted.length) { bad += 1; console.log(`FAIL  L1  ${unquoted.filter(Boolean).length} sidecar(s) stand under a rule whose builder could not be quoted: ${few(unquoted, 2)}`); }

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
    : "every attached unit is one sealed id, attached once, carrying its own words, and the sealed count is the count attached");

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
    : `${IDENTITY} (or ${PREFIX} where the id carries the order) / ${STATE} on every entry, ${SCHEMA} under its declared rule`);

console.log("\n  what this does not say: that a commentary's words open, gloss or cut; that the");
console.log("  license each entry carries is the right one; that the serve rows behind the ids");
console.log("  are the sealed chain's; or that the page draws a commentary under its section.");
console.log("  Each of those has its own guard. This one says the two works agree about the");
console.log("  shape of the book, section by section, on the numbers the chain sealed.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
