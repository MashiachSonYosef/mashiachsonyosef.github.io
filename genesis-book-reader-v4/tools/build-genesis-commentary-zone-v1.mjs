#!/usr/bin/env node
// Synthesis lane · zone-commentary-rule-v1-word-anchored-open-license-only
//
// The Genesis 1:1 commentary sidecar, emitted from its two sources: the
// commentary pack the chain sealed, and the attachment map that says which
// words of the verse each segment sits on. It exists because the sidecar it
// emits did not: the tool that first made it was written and run in a session
// whose workspace is gone, so the published file had no re-runnable source.
// A published byte with no build step behind it is a byte nobody can check.
//
// Two things this does not do. It does not decide a span — the map decides,
// and the map's own generator is beside this file. It does not reach past the
// licence: a segment whose record is not open, or carries no original-language
// text, is not emitted, and is counted where it was dropped.
//
//   --pack   the sealed commentary pack
//   --map    the attachment map
//   --zone   the book zone, for the words the anchors land on
//   --unit   the section id inside that zone
//   --store  the route store to project readings from
//   --out    where to write
//   --verify compare against an existing sidecar and print the differences
//            rather than writing
//
// Run: node tools/build-genesis-commentary-zone-v1.mjs --verify data/zones/genesis-commentary.bin

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { createRequire } from "node:module";
import { exactK, K_RULE_ID } from "./k-normalization-v1.mjs";
import { MAQAF } from "./zone-lib-v1.mjs";
import { openRouteStore, GLOSS_RULE_ID, GLOSS_RULE_TEXT } from "./gloss-store-v1.mjs";

const require = createRequire(import.meta.url);
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};

const PACK = arg("pack", "data/genesis-1-1-commentary-2026-07-17.js");
const MAP = arg("map", "data/v5-genesis-1-1-attachment-map-2026-08-19.js");
const ZONE = arg("zone", "data/zones/genesis.bin");
const UNIT = arg("unit", "genesis-1-1");
const OUT = arg("out", "data/zones/genesis-commentary.bin");
const VERIFY = arg("verify", null);

const sha = (s) => createHash("sha256").update(s).digest("hex");
const readZone = (f) => JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));

globalThis.window = {};
const packBody = readFileSync(PACK, "utf8");
require(PACK.startsWith("/") ? PACK : `${process.cwd()}/${PACK}`);
const pack = window.GENESIS_1_1_COMMENTARY;
const mapBody = readFileSync(MAP, "utf8");
require(MAP.startsWith("/") ? MAP : `${process.cwd()}/${MAP}`);
const map = window.V2_GENESIS_1_1_ATTACHMENT_MAP;

const zone = readZone(ZONE);
const section = (zone.sections || []).find((s) => s.unit === UNIT);
if (!section) throw new Error(`${ZONE} carries no section ${UNIT} — refusing output`);

// ---- verse word -> zone word -------------------------------------------
//
// The map counts the verse's own words. The zone may hold more of them than
// the verse does, because a zone word is a morpheme and one written word can
// be several. The two are lined up by running the zone's keys together until
// they spell the verse word, which is the only join that needs no rule of its
// own: it either comes out exactly or it does not come out.
const bare = (t) => String(t || "").replace(/[֑-ׇ׳״]/gu, "")
  .replace(/־/gu, "").replace(/[^א-ת]/gu, "");
const verseWords = String(pack.base.hebrew).split(/\s+/u).filter(Boolean);
const zoneStartOf = [];   // 1-based verse word -> 0-based zone word
const zoneEndOf = [];     // 1-based verse word -> 0-based zone word, last one
{
  let zi = 0;
  verseWords.forEach((vw, i) => {
    const want = bare(vw);
    let got = "", first = zi;
    while (zi < section.words.length && got !== want) {
      got += bare(section.words[zi].k || section.words[zi].s);
      zi += 1;
    }
    if (got !== want)
      throw new Error(`verse word ${i + 1} does not spell out of the zone's words — refusing output`);
    zoneStartOf[i + 1] = first;
    zoneEndOf[i + 1] = zi - 1;
  });
  if (zi !== section.words.length)
    throw new Error(`the zone holds ${section.words.length - zi} words the verse does not — refusing output`);
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
const words = {};
const counts = { attached: 0, per_word: {}, skipped_license: 0, skipped_no_text: 0, glossed_words: 0 };

for (const claim of map.claims) {
  const found = segOf.get(claim.commentary_unit_ref);
  if (!found) continue;
  const { seg, family } = found;
  const he = seg.he || {};
  if (he.license_disposition !== "OPEN_OR_PUBLIC_DOMAIN") { counts.skipped_license += 1; continue; }
  if (!he.source_text_present || !String(he.proof_text || "").trim()) { counts.skipped_no_text += 1; continue; }

  const hint = claim.visual_hint || claim.asserted_edge || null;
  if (!hint || !hint.start_word_index) continue;
  const vs = hint.start_word_index, ve = hint.end_word_index;
  const pos = zoneStartOf[vs];
  if (pos === undefined) continue;

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
    z_words: [zoneStartOf[vs], zoneEndOf[ve] + 1],
  });
  counts.attached += 1;
  counts.per_word[pos] = (counts.per_word[pos] || 0) + 1;
}

// ---- the readings, projected over the commentary's own keys --------------
//
// The same projection the book gets, over a different key list. A commentary
// is a work, so its words open the way any word opens: the store is asked
// about exactly the keys this sidecar contains, one reading per key is baked
// so the panel paints without fetching 256 shards, and the card computes the
// rest live from the store. A key the store does not answer for prints its
// Hebrew and opens nothing, which is the honest result and not a gap.
const store = openRouteStore(arg("store", "data/route-store"));
const keys = new Set();
const addKeys = (ws) => {
  for (const w of ws || []) {
    if (w.w) w.w.forEach((r) => { if (r.k) keys.add(r.k); });
    else if (w.k) keys.add(w.k);
  }
};
for (const list of Object.values(words)) for (const e of list) addKeys(e.words);
// and the works' own names, so a title opens the way a word of the text opens
for (const w of works) addKeys(w.he_tokens);
const projected = store.tableFor([...keys]);
let carrying = 0, wordsTotal = 0;
for (const list of Object.values(words))
  for (const e of list)
    for (const w of e.words || []) {
      wordsTotal += 1;
      const rs = w.w ? w.w : (w.k ? [{ k: w.k }] : []);
      if (rs.some((r) => projected.table[r.k])) carrying += 1;
    }
counts.glossed_words = carrying;
counts.words = wordsTotal;

const out = {
  schema_version: "ZONE_COMMENTARY_V1",
  rule_id: "zone-commentary-rule-v1-word-anchored-open-license-only",
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
    },
  },
  counts,
  works,
  units: { [UNIT]: { words } },
  gloss: projected.table,
};

if (VERIFY) {
  const was = readZone(VERIFY);
  const wasWords = ((was.units || {})[UNIT] || {}).words || {};
  const flat = (w) => {
    const m = new Map();
    for (const [p, list] of Object.entries(w)) for (const e of list) m.set(e.ref, { pos: Number(p), e });
    return m;
  };
  const A = flat(wasWords), B = flat(words);
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
console.log(`${OUT} · ${counts.attached} attachments · sha256 ${sha(body)}`);
console.log(`  per word: ${JSON.stringify(counts.per_word)}`);
console.log(`  skipped: ${counts.skipped_license} on licence, ${counts.skipped_no_text} with no text`);
console.log(`  words: ${counts.words} · ${counts.glossed_words} carry a reading`);
{
  const named = works.filter((w) => (w.he_tokens || []).some((t) => (t.w ? t.w.some((r) => projected.table[r.k]) : projected.table[t.k])));
  console.log(`  works: ${works.length} · ${named.length} whose own name the store answers for`);
}
console.log(`  keys: ${projected.counts.keys_asked} asked · ${projected.counts.glossed} answered · ` +
  `${projected.counts.no_exact_route} the catalog does not carry · ${projected.counts.no_displayable_route} unlicensed to print`);
