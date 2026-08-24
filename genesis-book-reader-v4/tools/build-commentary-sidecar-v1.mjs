#!/usr/bin/env node
// Synthesis lane · zone-commentary-rule-v2-everything-recorded-stands-somewhere
//
// The commentary sidecar for a book whose commentary came from outside the
// sealed chain: emitted from the pack the chain holds, plus the attachment map
// that says which words of which section each segment sits on.
//
// ---- what changed from the tool this replaces -------------------------
//
// It was written for one verse. The pack path, the name of the global, the
// section id and the base text were all fixed, and the base text came from a
// field holding exactly one verse — so the builder had to reconcile the pack's
// copy of the words against the zone's, word by word, and refuse if the two did
// not spell out the same.
//
// The words now come from the zone and from nowhere else. There is only one
// source, so there is nothing to reconcile: the map counts words of a section,
// the section is in the zone, and the indices line up by construction. A
// reconciliation that cannot disagree is a reconciliation that need not exist.
//
// Two things this still does not do. It does not decide a span — the map
// decides, and the map's own generator is beside this file. It does not reach
// past the licence: a segment whose record is not open, or carries no
// original-language text, is not emitted, and is counted where it was dropped.
//
//   --pack   the sealed commentary pack
//   --map    the attachment map
//   --zone   the book zone the anchors are resolved against
//   --store  the route store to project readings from
//   --out    where to write
//   --verify compare against an existing sidecar and print the differences
//            rather than writing
//
// Run: node tools/build-commentary-sidecar-v1.mjs --verify data/zones/genesis-commentary.bin

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { createRequire } from "node:module";
import { exactK, K_RULE_ID } from "./k-normalization-v1.mjs";
import { MAQAF } from "./zone-lib-v1.mjs";
import { readSpanSlice, cellsOf, SPAN_RULE_ID } from "./span-slice-v1.mjs";
import { openRouteStore, GLOSS_RULE_ID, GLOSS_RULE_TEXT } from "./gloss-store-v1.mjs";
import { thePack, refusal } from "./planned-packs-v1.mjs";

const require = createRequire(import.meta.url);
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};

// Four defaults, four hand copies, all four naming a withdrawn proof of
// concept. A tool that reaches for a filename when told nothing will one day
// publish the wrong body of text under the right work's address, and the only
// evidence will be a date in a name nobody reads.
const chosen = thePack(arg("pack", null));
if (!chosen) { console.error(refusal("build-commentary-sidecar-v1")); process.exit(2); }
const PACK = chosen.pack;
const ZONE = arg("zone", null);
if (!ZONE) { console.error("NO_ZONE_NAMED — pass --zone: the work a sidecar sits on is never assumed"); process.exit(2); }
const slug = String(ZONE).split("/").pop().replace(/\.bin$/u, "");
const MAP = arg("map", `data/attachment-map-${slug}.js`);
const OUT = arg("out", `data/zones/${slug}-commentary.bin`);
const VERIFY = arg("verify", null);

const sha = (s) => createHash("sha256").update(s).digest("hex");
const readZone = (f) => JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));

globalThis.window = {};
const packBody = readFileSync(PACK, "utf8");
require(PACK.startsWith("/") ? PACK : `${process.cwd()}/${PACK}`);
const mapBody = readFileSync(MAP, "utf8");
require(MAP.startsWith("/") ? MAP : `${process.cwd()}/${MAP}`);
const pack = window.GENESIS_1_1_COMMENTARY ||
  Object.values(window).find((v) => v && v.base && Array.isArray(v.commentary));
const map = window.V2_GENESIS_1_1_ATTACHMENT_MAP ||
  Object.values(window).find((v) => v && Array.isArray(v.claims));
if (!pack) throw new Error(`${PACK} defined no commentary pack — refusing output`);
if (!map) throw new Error(`${MAP} defined no attachment map — refusing output`);

const zone = readZone(ZONE);
// The same lookup the map generator used: an anchor is found in the book, not
// parsed out of a string.
const sectionAt = new Map();
for (const sec of zone.sections || []) {
  sectionAt.set(`${zone.work} ${sec.label}`, sec);
  sectionAt.set(sec.unit, sec);
}

// ---- the commentary's own words -----------------------------------------
//
// commentary-words-rule-v1-separate-at-the-spaces-the-author-typed
//
// A commentary arrives as one run of the author's characters. To let a reader
// open a word of it, the run has to be cut into words — and the only cut that
// is not ours is the one already in the text: the spaces the author typed.
// That cut keeps every piece, every piece is a run of the author's own
// characters in the author's own order, and nothing is joined that was
// written apart. It is the same clause the comma and the semicolon are
// separated under, and it is checked the same way: put the pieces back
// together and you must get the text.
//
// What prints is the piece exactly as written, punctuation and all. Only the
// key that asks the store is stripped, and only for the asking — a word whose
// characters leave nothing lexical behind carries no key, is printed, and
// opens nothing. The maqaf is the one mark inside a word that divides it,
// because the chain's own key rule preserves it; the pieces either side open
// on their own and the maqaf prints between them without opening.
const TOKEN_RULE_ID = "commentary-words-rule-v1-separate-at-the-spaces-the-author-typed";
const tokenise = (text, ref) => {
  const out = [];
  for (const piece of String(text || "").split(/\s+/)) {
    if (!piece) continue;
    const w = { s: piece };
    const k = exactK(piece);
    if (!k) { out.push(w); continue; }
    if (!k.includes(MAQAF)) { w.k = k; out.push(w); continue; }
    const regions = piece.split(MAQAF).map((p) => ({ s: p, k: exactK(p) }));
    if (regions.map((x) => x.k).join(MAQAF) !== k)
      throw new Error(`${ref}: the pieces either side of a maqaf do not rejoin — refusing output`);
    w.w = regions.filter((x) => x.k);
    out.push(w);
  }
  const back = out.map((x) => x.s).join("");
  if (back !== String(text || "").replace(/\s+/gu, ""))
    throw new Error(`${ref}: the words do not put the commentary back together — refusing output`);
  return out;
};

// ---- the segments, by reference -----------------------------------------
const families = [...(pack.commentary || []), ...(pack.targum || [])];
const segOf = new Map();
for (const f of families)
  for (const s of f.segments || []) segOf.set(s.ref, { seg: s, family: f });

// ---- the works, and their own names --------------------------------------
//
// A commentary's title is corpus text like any other title, and it was the one
// title on this page still being handed to the reader as a bare English label.
// It gets what a book's title gets: the Hebrew keyed the same way, so it opens
// the same card, and the English standing beside it as the name it is commonly
// read by rather than as the thing itself. Measured over Genesis: the store
// answers for 55 of the 58 works. The other three print bare, which is the
// honest result — a title nobody has a record for is not a title we invent one
// for.
const works = [];
const workAt = new Map();
const workIndex = (family) => {
  const en = family.collective_title_en || family.family_title || null;
  const he = family.collective_title_he || null;
  const key = `${en}|${he}`;
  if (workAt.has(key)) return workAt.get(key);
  const at = works.length;
  works.push({
    family_en: en,
    family_he: he,
    he_tokens: he ? tokenise(he, `title of ${en}`) : [],
    kind: family.commentary_kind || null,
    index: family.commentary_index || null,
  });
  workAt.set(key, at);
  return at;
};

// ---- emit ----------------------------------------------------------------
const units = {};
const counts = { attached: 0, on_section: 0, held_licence: 0, no_text: 0,
  in_record: 0, sections: 0, per_word: {}, skipped_license: 0,
  skipped_no_text: 0, skipped_no_section: 0, glossed_words: 0 };
// which segments the map speaks for, so the pass below can take everything else
const claimedRefs = new Set(map.claims.map((c) => c.commentary_unit_ref));

for (const claim of map.claims) {
  const found = segOf.get(claim.commentary_unit_ref);
  if (!found) continue;
  const { seg, family } = found;
  const he = seg.he || {};
  // A claim we cannot print is not dropped here — it falls through to the pass
  // below, which stands it on the section by name and says why it is held.
  if (!he.source_text_present || !String(he.proof_text || "").trim()) { counts.skipped_no_text += 1; claimedRefs.delete(seg.ref); continue; }
  if (he.license_disposition !== "OPEN_OR_PUBLIC_DOMAIN") { counts.skipped_license += 1; claimedRefs.delete(seg.ref); continue; }

  const anchor = claim.source_anchor_ref || seg.source_anchor_ref || "";
  const section = sectionAt.get(anchor);
  if (!section) { counts.skipped_no_section += 1; continue; }

  // A claim with no word to point at is not a word-level placement. It goes
  // to the section with the rest, rather than quietly nowhere.
  const hint = claim.visual_hint || claim.asserted_edge || null;
  if (!hint || !hint.start_word_index) { claimedRefs.delete(seg.ref); continue; }
  // V's attachment grain policy, honoured here rather than argued with:
  //
  //   section by default; word pairing requires explicit exact
  //   normalized-surface evidence
  //
  // The map is honest about which of its hints have that and which are the
  // convention read by eye — it stamps every one with a basis. What this file
  // used to check was whether a word index existed, not where it came from, so
  // a hint the map itself calls NOT_PROVEN became a v_words span and the reader
  // drew a mark on a word for it. 180 of 182.
  //
  // An allowlist rather than a denylist: a basis this file has not been taught
  // to trust goes to the section, which is where V puts it by default anyway.
  const WORD_GRADE_BASIS = new Set(["EXPLICIT_VISIBLE_HEADWORD"]);
  const hintBasis = hint.basis || hint.proof_basis || "";
  if (!WORD_GRADE_BASIS.has(hintBasis)) {
    counts.not_word_grade = (counts.not_word_grade || 0) + 1;
    counts.not_word_grade_by_basis = counts.not_word_grade_by_basis || {};
    counts.not_word_grade_by_basis[hintBasis || "(none)"] =
      (counts.not_word_grade_by_basis[hintBasis || "(none)"] || 0) + 1;
    claimedRefs.delete(seg.ref);
    continue;
  }
  // The map counted the section's own words, so its indices are the zone's
  // indices, off by the one that turns counting-from-one into counting-from-zero.
  const vs = hint.start_word_index, ve = hint.end_word_index;
  const pos = vs - 1;
  if (pos < 0 || ve > section.words.length) { counts.skipped_no_section += 1; claimedRefs.delete(seg.ref); continue; }

  const unit = (units[section.unit] = units[section.unit] || { words: {} });
  const words = unit.words;
  (words[pos] = words[pos] || []).push({
    ref: seg.ref,
    he_ref: seg.he_ref,
    title: claim.display_title,
    topic: claim.topic,
    family_en: family.collective_title_en || family.family_title,
    family_he: family.collective_title_he,
    years: seg.composition_date_evidence || [],
    version_title: he.version_title,
    license: he.license,
    source_url: seg.source_url,
    text: he.proof_text,
    words: tokenise(he.proof_text, seg.ref),
    work: workIndex(family),
    state: claim.claim_state,
    basis: hint.basis || hint.proof_basis,
    v_words: [vs, ve],
    z_words: [pos, ve],
  });
  counts.attached += 1;
  counts.per_word[pos] = (counts.per_word[pos] || 0) + 1;
}

// ---- and everything the map made no claim about --------------------------
//
// The map claims 182 of the 612 segments the pack maps to Genesis 1:1. The
// other 430 are what its own stats call verse witnesses: the chain maps them
// to this verse and our catchword matcher found nothing to hang them on. An
// earlier build shipped only the 182, and the page said "181 attached" as
// though that were what the verse carried. It was a third of it. Rashbam and
// Abarbanel were not on the page at all, and nothing anywhere said so.
//
// The pack's own sibling fixture already recorded where they belong:
// nested-rashi-hud-2026-07-17 carries unmatched_commentary_owner = SECTION.
// A commentary nobody could place on a word is owned by the section. So they
// are emitted on the section — which is the one place they can stand without
// anybody pretending to know more than the record says.
//
// This is the opposite of a guess. A word-anchored entry is a placement we
// made; a section entry is a placement we did not make and are not making.
for (const f of families) {
  for (const seg of f.segments || []) {
    if (claimedRefs.has(seg.ref)) continue;
    const he = seg.he || {};
    const section = sectionAt.get(seg.source_anchor_ref || f.source_anchor_ref || "");
    if (!section) { counts.skipped_no_section += 1; continue; }
    const unit = (units[section.unit] = units[section.unit] || { words: {} });
    const rest = (unit.section = unit.section || []);
    const common = {
      ref: seg.ref,
      he_ref: seg.he_ref,
      family_en: f.collective_title_en || f.family_title,
      family_he: f.collective_title_he,
      years: seg.composition_date_evidence || [],
      version_title: he.version_title,
      license: he.license,
      source_url: seg.source_url,
      work: workIndex(f),
    };
    // The order of these two questions is the whole of the honesty.
    //
    // An earlier build asked about the licence first, so a segment with no
    // body in the pack was reported as "held on licence" — which reads as this
    // page refusing to print something it has. Measured over all 612 segments
    // the record maps to Genesis 1:1: every single one of the 108 that cannot
    // be printed has no source text at all. Not one is kept off this page by a
    // licence. Asking the licence first invented a refusal on three of them,
    // including Onkelos, whose CC-BY-NC is the same licence this reader
    // already ships the whole Hebrew of 1 Kings under.
    //
    // Nobody has authority to hold a text. A licence can forbid, and a record
    // can be empty, and those are different facts. The empty one is asked
    // first, because it is the one that is true here.
    if (!he.source_text_present || !String(he.proof_text || "").trim()) {
      rest.push({ ...common, held: "no text", state: "NO_SOURCE_TEXT_IN_THE_RECORD",
        basis: "RECORDED_WITHOUT_SOURCE_TEXT", disposition: he.license_disposition || null,
        licence_says: he.license || null, text: "", words: [] });
      counts.no_text += 1;
      continue;
    }
    // A body that exists and a licence that forbids printing it. Today this
    // fires for nothing at all, and the count says so on every build.
    if (he.license_disposition !== "OPEN_OR_PUBLIC_DOMAIN") {
      rest.push({ ...common, held: "licence", disposition: he.license_disposition || null,
        state: "HELD_ON_LICENCE", basis: "HELD_PENDING_LICENCE_REVIEW", text: "", words: [] });
      counts.held_licence += 1;
      continue;
    }
    rest.push({ ...common, text: he.proof_text, words: tokenise(he.proof_text, seg.ref),
      state: "VERSE_WITNESS", basis: "VERSE_MAPPED_NO_WORD_ANCHOR" });
    counts.on_section += 1;
  }
}
counts.sections = Object.keys(units).length;
counts.in_record = families.reduce((t, f) => t + (f.segments || []).length, 0);

// ---- the readings, projected over the commentary's own keys --------------
//
// The same projection the book gets, over a different key list. A commentary
// is a work, so its words open the way any word opens: the store is asked
// about exactly the keys this sidecar contains, one reading per key is baked
// so the panel paints without fetching 256 shards, and the card computes the
// rest live from the store. A key the store does not answer for prints its
// Hebrew and opens nothing, which is the honest result and not a gap.
const store = openRouteStore(arg("store", "data/route-store"));
// pass-through-rule-v1 · the commentary's own words open the same way the
// book's do, so they get the same component layer. Withholding it would make
// a commentary word less openable than the word it comments on, for no reason
// a record supports.
const spansPath = arg("spans", null);
const keys = new Set();
const addKeys = (ws) => {
  for (const w of ws || []) {
    if (w.w) w.w.forEach((r) => { if (r.k) keys.add(r.k); });
    else if (w.k) keys.add(w.k);
  }
};
const everyEntry = function* () {
  for (const u of Object.values(units)) {
    for (const list of Object.values(u.words || {})) for (const e of list) yield e;
    for (const e of u.section || []) yield e;
  }
};
for (const e of everyEntry()) addKeys(e.words);
// and the works' own names, so a title opens the way a word of the text opens
for (const w of works) addKeys(w.he_tokens);
const span = spansPath ? await readSpanSlice(spansPath, keys) : null;
// interned the same way every other zone interns them
const intern = (arr, v) => { let i = arr.indexOf(v); if (i < 0) { i = arr.length; arr.push(v); } return i; };
const spanRoles = [], spanRules = [], spanConf = [];
const spans = {};
if (span) for (const [k, sp] of span.spans)
  spans[k] = [sp.s, sp.r.map((r) => intern(spanRoles, r)), intern(spanRules, sp.rule), intern(spanConf, sp.conf)];
const askFor = new Set(keys);
if (span) for (const [, sp] of span.spans) for (const c of cellsOf(sp.s)) askFor.add(c.surface);
const projected = store.tableFor([...askFor]);
let carrying = 0, wordsTotal = 0;
for (const e of everyEntry())
  for (const w of e.words || []) {
    wordsTotal += 1;
    const rs = w.w ? w.w : (w.k ? [{ k: w.k }] : []);
    if (rs.some((r) => projected.table[r.k])) carrying += 1;
  }
counts.glossed_words = carrying;
counts.words = wordsTotal;

const out = {
  schema_version: "ZONE_COMMENTARY_V1",
  rule_id: "zone-commentary-rule-v2-everything-recorded-stands-somewhere",
  work: zone.work || "Genesis",
  emitted_from: {
    attachment_map: { id: map.map_id, sha256: sha(mapBody) },
    commentary_pack: { id: `v-commentary-poc-genesis-1-1-${pack.generated_on}`, sha256: sha(packBody) },
    note: "claims ride with their own map state (PROVEN_EDGE vs VISUAL_SUGGESTION_ONLY) and basis; " +
      "verse-word anchors mapped to the zone morpheme words by running the zone's keys together until " +
      "they spell the verse word; only open-licensed segments with ridable original-language text ship — " +
      "the license is the only gate; pack segments the map carries no word claim for are not attached " +
      "(the attachment map is the authority)",
    word_layer: {
      rule: TOKEN_RULE_ID,
      key_rule: K_RULE_ID,
      why: "a commentary is a work, so its own words open the way any word opens; the run is cut " +
        "only at the spaces its author typed, and the pieces are checked to put the run back together",
    },
    gloss_layer: {
      rule: `${GLOSS_RULE_ID}: ${GLOSS_RULE_TEXT}`,
      gloss_table_sha256: projected.sha256,
      keys_asked: projected.counts.keys_asked,
      distinct_forms_glossed: projected.counts.glossed,
      distinct_forms_bare: projected.counts.no_exact_route + projected.counts.no_displayable_route,
      no_exact_route: projected.counts.no_exact_route,
      no_displayable_route: projected.counts.no_displayable_route,
      grain: span ? "cell surface" : "whole form",
    },
    span_layer: span
      ? {
          rule: SPAN_RULE_ID,
          source: span.source,
          rows_scanned: span.scanned,
          forms_with_a_component_system: span.spans.size,
        }
      : { status: "no span slice supplied — this zone offers whole forms only" },
  },
  counts,
  works,
  span_roles: spanRoles,
  span_rules: spanRules,
  span_conf: spanConf,
  spans,
  units,
  gloss: projected.table,
};

if (VERIFY) {
  const was = readZone(VERIFY);
  const flat = (us) => {
    const m = new Map();
    for (const u of Object.values(us || {}))
      for (const [p, list] of Object.entries(u.words || {}))
        for (const e of list) m.set(e.ref, { pos: Number(p), e });
    return m;
  };
  const A = flat(was.units), B = flat(units);
  const diffs = { only_before: [], only_after: [], field: {} };
  for (const ref of A.keys()) if (!B.has(ref)) diffs.only_before.push(ref);
  for (const ref of B.keys()) if (!A.has(ref)) diffs.only_after.push(ref);
  const keysOf = ["ref", "he_ref", "title", "topic", "family_en", "family_he", "years",
    "version_title", "license", "source_url", "text", "state", "basis", "v_words", "z_words"];
  for (const [ref, b] of B) {
    const a = A.get(ref); if (!a) continue;
    if (a.pos !== b.pos) (diffs.field.attached_word = diffs.field.attached_word || []).push(ref);
    for (const k of keysOf)
      if (JSON.stringify(a.e[k]) !== JSON.stringify(b.e[k]))
        (diffs.field[k] = diffs.field[k] || []).push(`${ref}: ${JSON.stringify(a.e[k])} -> ${JSON.stringify(b.e[k])}`);
  }
  console.log(`rebuilt ${counts.attached} attachments · the file compared against carries ${(was.counts || {}).attached}`);
  console.log(`  only in the file : ${diffs.only_before.length}`);
  console.log(`  only in rebuild  : ${diffs.only_after.length}`);
  for (const [k, v] of Object.entries(diffs.field)) {
    console.log(`  ${k}: ${v.length} differ`);
    v.slice(0, 3).forEach((x) => console.log(`      ${x}`));
  }
  if (!Object.keys(diffs.field).length && !diffs.only_before.length && !diffs.only_after.length)
    console.log("  every field of every attachment is identical");
  process.exit(0);
}

const body = JSON.stringify(out);
writeFileSync(OUT, gzipSync(Buffer.from(body, "utf8"), { level: 9 }));
console.log(`${OUT} · ${counts.attached + counts.on_section + counts.held_licence + counts.no_text} of ${counts.in_record} recorded · sha256 ${sha(body)}`);
console.log(`  on a word: ${counts.attached} · on the section: ${counts.on_section} · ` +
  `kept off by a licence: ${counts.held_licence} · no source text in the record: ${counts.no_text}`);
console.log(`  over ${counts.sections} section${counts.sections === 1 ? "" : "s"} · per word: ${JSON.stringify(counts.per_word)}`);
// What is not here at all, and why. A number nobody prints is a number nobody
// can be held to.
{
  const shown = counts.attached + counts.on_section + counts.held_licence + counts.no_text;
  const missing = counts.in_record - shown;
  console.log(`  ${missing === 0 ? "nothing recorded is missing from this file" : `MISSING: ${missing} recorded segments reach no unit`}` +
    `${counts.skipped_no_section ? ` · ${counts.skipped_no_section} name a section the zone does not carry` : ""}`);
}
console.log(`  words: ${counts.words} · ${counts.glossed_words} carry a reading`);
{
  const named = works.filter((w) => (w.he_tokens || []).some((t) => (t.w ? t.w.some((r) => projected.table[r.k]) : projected.table[t.k])));
  console.log(`  works: ${works.length} · ${named.length} whose own name the store answers for`);
}
console.log(`  keys: ${projected.counts.keys_asked} asked · ${projected.counts.glossed} answered · ` +
  `${projected.counts.no_exact_route} the catalog does not carry · ${projected.counts.no_displayable_route} unlicensed to print`);
