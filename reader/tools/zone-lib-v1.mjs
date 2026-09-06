// Synthesis lane · shared reading and verification for zone builders.
//
// Everything a zone is built from arrives here and is checked here, so that
// both the base builder and the commentary builder answer to the same
// assertions. A builder that cannot prove a claim throws; it never emits a
// zone with the claim quietly downgraded.

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";
import { exactK, joinsNext, joinsPrev } from "./k-normalization-v2.mjs";

export const sha256File = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/** Fail loudly and by name. A refused build is a result; a silent one is not. */
export const require_ = (cond, code, detail) => {
  if (!cond) throw new Error(`${code} — ${detail}`);
};

/**
 * Read one serve NDJSON: line 1 is the walk provenance, the rest are rows in
 * ascending C0 order. Verifies the shape it depends on rather than assuming
 * it: ascending ids, no duplicates, contiguous token ordinals inside a unit.
 */
export const readServe = async (path) => {
  const rl = createInterface({ input: createReadStream(path, "utf8"), crlfDelay: Infinity });
  let provenance = null;
  const units = new Map(); // unit_id -> { rows: [], first: c0, last: c0 }
  let rows = 0, held = 0, lastId = -1;
  const statuses = new Map();

  for await (const line of rl) {
    if (!line) continue;
    const rec = JSON.parse(line);
    if (!provenance) { provenance = rec.provenance; require_(provenance, "SERVE_NO_PROVENANCE", path); continue; }

    const id = rec.c0_numeric_id;
    require_(Number.isInteger(id), "SERVE_BAD_ID", JSON.stringify(rec).slice(0, 120));
    require_(id > lastId, "SERVE_NOT_ASCENDING", `${id} after ${lastId}`);
    lastId = id;
    statuses.set(rec.status, (statuses.get(rec.status) || 0) + 1);

    const unit = rec.location?.local_unit_id;
    require_(unit, "SERVE_NO_UNIT", String(id));
    let u = units.get(unit);
    if (!u) { u = { rows: [], first: id, last: id }; units.set(unit, u); }
    require_(
      rec.token_ordinal_in_unit === u.rows.length + 1,
      "SERVE_ORDINAL_GAP",
      `${unit}: expected ${u.rows.length + 1}, got ${rec.token_ordinal_in_unit}`,
    );
    u.rows.push(rec);
    u.last = id;
    rows += 1;
    if (!rec.visible_in_hebrew_reader) held += 1;
  }

  require_(rows > 0, "SERVE_EMPTY", path);
  return { provenance, units, rows, held, statuses, first: [...units.values()][0].first, last: lastId };
};

/**
 * The identity oracle. The bridge is the sealed allocation of C0 rows to
 * units; a zone claims a unit is verified only when the bridge's own row
 * count and C0 range for that unit match what was served, ordinal for
 * ordinal. Anything else is recorded as drift on the section, never hidden.
 */
export const readBridge = (path, workId) => {
  const text = gunzipSync(readFileSync(path)).toString("utf8");
  const lines = text.split("\n");
  const header = lines[0].split(",");
  const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  for (const need of ["work_id", "unit_id", "c0_rows", "min_c0_numeric_id", "max_c0_numeric_id", "b_id", "n_id"])
    require_(col[need] !== undefined, "BRIDGE_MISSING_COLUMN", need);
  // The columns this reader touches are all slug-shaped and appear before any
  // free-text column, so a plain split is safe — but only if the file carries
  // no quoting at all. Check rather than trust.
  require_(!text.includes('"'), "BRIDGE_QUOTED_FIELDS", "bridge carries quoted fields; naive split would misalign");

  const units = new Map();
  let bId = null, nId = null;
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const f = line.split(",");
    if (f[col.work_id] !== workId) continue;
    units.set(f[col.unit_id], {
      c0_rows: Number(f[col.c0_rows]),
      min: Number(f[col.min_c0_numeric_id]),
      max: Number(f[col.max_c0_numeric_id]),
    });
    bId = bId ?? f[col.b_id];
    nId = nId ?? f[col.n_id];
  }
  require_(units.size > 0, "BRIDGE_WORK_ABSENT", workId);
  return { units, b_id: bId, n_id: nId, sha256: sha256File(path) };
};

/**
 * Coordinates come from the sealed unit id and nothing else. A unit id is a
 * locator — the plain location label an access aid may render — so the page
 * may print "7:14" in English without borrowing a word it has no D+M for.
 *
 * `slug` is the work's own id tail, so the parse is anchored, not sniffed:
 * tanakh/i-kings -> i-kings -> i-kings-7-14 -> chapter 7, section 14.
 */
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

/**
 * A sealed unit id names its work in one of three ways, and the parse anchors
 * on that name rather than sniffing the id:
 *
 *   <slug>-<tail>                         the plain form: i-kings-7-14
 *   <anything>--<slug>-<tail>             the family-prefixed form:
 *                                         tanakh-chizkuni--chizkuni-introduction-1
 *   <anything>--sefaria-<slug>-<tail>     the same, with the source named
 *   <anything>-<slug>--<tail>             the slug-first form, the work's own
 *                                         name before the double hyphen and
 *                                         the locator after it:
 *                                         midrash-sifra--ia-haisifradeverav00corc--page-00001
 *                                         geonim-teshuvot-hageonim-coronel--teshuvot-hageonim-1
 *
 * What comes after the name is the tail. An id that names its work in none
 * of these ways is a stream id — a capture or repair stream's own numbering,
 * ap80-…-0000001 — and carries no locator of its own.
 *
 * The fourth form was added 2026-09-02: nine works (2,342 units, 2.2M rows)
 * held as stream ids under the first three, and every one of their ids
 * carries the work's name — before the double hyphen rather than after.
 */
export const anchorUnitId = (unitId, slug) => {
  const s = escRe(slug);
  let m = new RegExp(`^${s}-(.*)$`, "u").exec(unitId);
  if (m) return { tail: m[1], anchored: true };
  m = new RegExp(`^.*?--(?:sefaria-)?${s}(?:-(.*))?$`, "u").exec(unitId);
  if (m) return { tail: m[1] || "", anchored: true };
  m = new RegExp(`^(?:.*-)?${s}--(.+)$`, "u").exec(unitId);
  if (m) return { tail: m[1], anchored: true };
  return { tail: null, anchored: false };
};

/**
 * A page-scan tail: ia-<scan>--page-<n>. The Internet Archive scan the
 * capture read is named in the tail, and the page is the unit's own place in
 * it. The page number is the ordinal; the scan is a witness, kept on the
 * zone's numbering record so a reader can see which scan the pages are of.
 */
const PAGE_SCAN = /^ia-([^-]+)--page-0*(\d+)$/u;

/**
 * A tail read plainly. A hyphen between two numbers is the chain's own
 * nesting and prints as ":"; every other hyphen is a space. Nothing is
 * translated: "gate-of-prayer-introduction-1" is the sealed id's own words,
 * printed the way the door already prints a recorded work id — hyphens as
 * spaces — so that an access aid can name a place without borrowing a word
 * it has no D+M for.
 */
export const readTailPlainly = (tail) => tail.replace(/(\d)-(?=\d)/gu, "$1:").replace(/-/gu, " ").trim();

/**
 * What one sealed unit id says about its own place. Four kinds:
 *   nested   <chapter>-<section>, in the plain or the prefixed form
 *   ordinal  …--unit-<n>, or a bare <n> after the work's name
 *   named    any other tail: a path of names and numbers the chain sealed
 *   stream   an id that does not name its work at all
 * The first two are exactly what this parse always accepted, and their
 * results are byte-identical to before.
 */
export const parseUnitId = (unitId, slug) => {
  const m = new RegExp(`^${escRe(slug)}-(\\d+)-(\\d+)$`, "u").exec(unitId);
  if (m) return { kind: "nested", chapter: Number(m[1]), section: Number(m[2]), label: `${m[1]}:${m[2]}` };
  const f = /--unit-0*(\d+)$/u.exec(unitId);
  if (f) return { kind: "ordinal", chapter: Number(f[1]), section: 1, label: String(Number(f[1])), flat: true };
  const a = anchorUnitId(unitId, slug);
  if (!a.anchored) return { kind: "stream", flat: true };
  const pg = PAGE_SCAN.exec(a.tail);
  if (pg) return { kind: "ordinal", chapter: Number(pg[2]), section: 1, label: String(Number(pg[2])), flat: true, scan: pg[1] };
  const nn = /^(\d+)-(\d+)$/u.exec(a.tail);
  if (nn) return { kind: "nested", chapter: Number(nn[1]), section: Number(nn[2]), label: `${nn[1]}:${nn[2]}` };
  const n = /^(\d+)$/u.exec(a.tail);
  if (n) return { kind: "ordinal", chapter: Number(n[1]), section: 1, label: String(Number(n[1])), flat: true };
  return { kind: "named", tail: a.tail, flat: true };
};

/**
 * Coordinates come from the sealed unit id and nothing else. A unit id is a
 * locator — the plain location label an access aid may render — so the page
 * may print "7:14" in English without borrowing a word it has no D+M for.
 *
 * This is the per-unit form, kept for the callers that align two works by
 * label (a commentary on its base). It accepts the nested and ordinal kinds
 * and refuses the rest. It is wider than it was by exactly the anchoring: a
 * family-prefixed nested id and a bare ordinal after the work's name now
 * parse where the old two-regex form refused them, so a commentary whose
 * ids are prefixed aligns to its base by the same label it always would
 * have carried. A named tail cannot align anything by itself, so a caller
 * that needs one goes through parseWorkCoordinates, which decides the shape
 * for the whole work.
 */
export const parseCoordinates = (unitId, slug) => {
  const p = parseUnitId(unitId, slug);
  if (p.kind === "nested") return { chapter: p.chapter, section: p.section, label: p.label };
  if (p.kind === "ordinal") return { chapter: p.chapter, section: 1, label: p.label, flat: true };
  require_(false, "UNIT_ID_UNPARSED",
    `${unitId} reads as neither ${slug}-<chapter>-<section> nor …--unit-<ordinal>`);
  return null;
};

/**
 * The whole work's coordinates, in served (c0) order. A zone speaks one
 * coordinate language, decided for the work and not per unit:
 *
 *   CHAPTER_SECTION           every unit is nested: chapter and section are
 *                             the id's own numbers.
 *   SEALED_UNIT_SEQUENCE      every unit carries its ordinal in its id (the
 *                             Ben-Yehuda shelf and kin): one sealed unit is
 *                             one top-level section, and the locator is the
 *                             bare ordinal.
 *   SEALED_UNIT_SEQUENCE_NAMED  anything else. One sealed unit is still one
 *                             top-level section; its ordinal is its place in
 *                             the chain's own order, which the chain sealed;
 *                             its locator is its tail read plainly — the
 *                             sealed id's own words — or its place, for a
 *                             stream id that has no tail. No hierarchy is
 *                             built from the names: the chain sealed them as
 *                             a label, and a label is what they print as.
 *
 * Nothing is renumbered and no ordinal is invented: the order is the c0
 * order, which is the only sequence the chain records for every unit.
 */
export const parseWorkCoordinates = (unitIds, slug) => {
  const per = unitIds.map((u) => [u, parseUnitId(u, slug)]);
  // A stream id names no locator, and a locator this parse would give it
  // would be its place in the order — an ordinal the sealed id does not
  // carry. That is the one thing this parse may not do. Twenty-eight works
  // carry such ids, eight of them with page numbers the position would
  // silently renumber across witnessed gaps; they stay held, by name, until
  // an anchor is written for the form their ids take.
  const stream = per.find(([, p]) => p.kind === "stream");
  require_(!stream, "UNIT_ID_UNPARSED",
    `${stream && stream[0]} does not name its work in any form this parse reads (plain, prefixed, or sefaria-prefixed), so no locator can be read from it and none is invented`);
  const kinds = new Set(per.map(([, p]) => p.kind));
  const shape = kinds.size === 1 && kinds.has("nested") ? "CHAPTER_SECTION"
    : kinds.size === 1 && kinds.has("ordinal") ? "SEALED_UNIT_SEQUENCE"
      : "SEALED_UNIT_SEQUENCE_NAMED";
  const coords = new Map();
  // What the ids witness that the named shape does not build: their own
  // ordinals and their own nesting. Recorded so the zone can say it.
  const witnessed = { ordinal_units: 0, ordinal_gaps: [], ordinal_starts_at: null, nested_units: 0, nested_chapters: new Set(), scans: new Set() };
  let prevOrd = null;
  per.forEach(([u, p], i) => {
    // a page-scan id names the scan its pages are of, whatever the shape
    if (p.scan) witnessed.scans.add(p.scan);
    if (shape === "CHAPTER_SECTION") coords.set(u, { chapter: p.chapter, section: p.section, label: p.label });
    else if (shape === "SEALED_UNIT_SEQUENCE") coords.set(u, { chapter: p.chapter, section: 1, label: p.label, flat: true });
    else {
      const ord = i + 1;
      // an id whose tail is empty names the work and nothing under it: the
      // unit is the whole work, and its locator is the work's own name
      const label = p.kind === "named" ? (p.tail ? readTailPlainly(p.tail) : readTailPlainly(slug)) : p.label;
      coords.set(u, { chapter: ord, section: 1, label, flat: true, named: true });
      if (p.kind === "ordinal") {
        witnessed.ordinal_units += 1;
        if (prevOrd === null) { if (p.chapter !== 1) witnessed.ordinal_starts_at = p.chapter; }
        else if (p.chapter > prevOrd + 1) witnessed.ordinal_gaps.push({ after: prevOrd, next: p.chapter });
        prevOrd = p.chapter;
      }
      if (p.kind === "nested") { witnessed.nested_units += 1; witnessed.nested_chapters.add(p.chapter); }
    }
  });
  witnessed.nested_chapters = witnessed.nested_chapters.size;
  witnessed.scans = [...witnessed.scans].sort();
  return { shape, coords, witnessed };
};

// U+05BE HEBREW PUNCTUATION MAQAF, named by its codepoint. A tool in this
// tree may not supply a character of the text any more than the page may,
// and a glyph in a literal here is that file typing one. The escape is the
// same character and makes no claim to have written it.
export const MAQAF = "\u05be";

/**
 * Words as the zone stores them.
 *
 * One row of C0 is one occurrence, and the block on the page is the
 * occurrence. What is clickable inside that block is whatever the ledger says
 * the occurrence contains: exact K preserves the boundary maqaf (FRAME rule
 * 7), and the W inventory records the pieces either side of it as separate W.
 * So an occurrence written with a maqaf carries more than one W, and each of
 * them opens on its own.
 *
 *   no maqaf   { s, k }
 *   maqaf      { s, w: [{ s, k }, …] }   regions in printed order
 *   held       { s, held: true }         the chain's script rule, not ours
 *
 * The regions are cut from the printed surface, not rebuilt from the key, so
 * a region's `s` is always a substring of what the page shows. An edge maqaf
 * (`\u05dc\u05d7\u05dd\u05be`, three occurrences in this work) yields one region and a maqaf that
 * belongs to the next occurrence; the maqaf still prints, and it does not
 * open, because it is not a W.
 */
// A ketiv-qere site, as the sealed stream writes it: the ketiv bare and
// unvocalized on one row, the qere vocalized in square brackets on the next,
// in the same unit (genesis-8-17: the ketiv, then the qere in brackets). One occurrence, one
// word of the book, counted once — the owner's ruling of 2026-09-02 (one
// occurrence, one C0). The store still seals two rows for it, so until the
// corpus lane reseals the site as one row this pairs the two here, says so
// on the word (kq.rows), and counts the position. Both halves ride as
// written: the ketiv's letters and the qere's letters each keyed, roles
// named, under kq-rule-v1-both-halves-as-written. Nothing is chosen between
// them; the page underlines the one the English follows.
//
// One convention is read: the qere in square brackets, vocalized, after a
// bare ketiv (BRACKETED_QERE — the MAM-derived books, genesis-8-17). A
// second convention was tried on 2026-09-02 for streams that write no
// brackets (a bare row followed by a vocalized row) and withdrawn the same
// day: those streams also carry the Masorah's own annotation words flattened
// to bare tokens — a note of the Yemenite reading, of a small letter, of the
// Ashkenazi tradition — and the rule read them as ketivs (Leviticus 6:2,
// Numbers 25:11, Esther 8:11). A ketiv the carrier does not mark is not
// findable in the carrier, which is Q's own law; those books wait for the
// corpus lane's reseal that writes the site as one row, (ketiv) [qere].
// Codepoints are escaped: a tool may not type a character of the text.
const KQ_VOWEL = /[\u0591-\u05C7]/u;                       // any vowel, accent or point
const KQ_LETTERS = "\u05D0-\u05EA";                          // alef..tav
const KQ_KEPT = "\u05BE\u05F3\u05F4";                        // maqaf, geresh, gershayim
const KQ_QERE = new RegExp("^\\[[" + KQ_LETTERS + "\u0591-\u05C7" + KQ_KEPT + "]+\\]$", "u");
const KQ_KETIV = new RegExp("^[" + KQ_LETTERS + KQ_KEPT + "]+$", "u");
const KQ_LETTER = new RegExp("[" + KQ_LETTERS + "]", "gu");
export const kqPairAt = (rows, i) => {
  const q = rows[i + 1], k = rows[i];
  if (!q || !k || !q.visible_in_hebrew_reader || !k.visible_in_hebrew_reader) return null;
  const qs = String(q.exact_surface_form || ""), ks = String(k.exact_surface_form || "");
  if (!(KQ_KETIV.test(ks) && !KQ_VOWEL.test(ks) && (ks.match(KQ_LETTER) || []).length >= 2)) return null;
  // a qere is vocalized: a bracketed bare word in an unvocalized stream is an
  // editorial mark (Tosefta Kilayim carries 47 of them), not a qere
  if (KQ_QERE.test(qs) && KQ_VOWEL.test(qs)) return "BRACKETED_QERE";
  return null;
};

// A ketiv-qere site sealed as ONE row, in the source's own notation (the
// corpus lane's kq reseal, and every book of the restore v5): the ketiv in
// parentheses, the qere in square brackets, in either order the source
// writes them; a branch one word or several; a maqaf that joins the site to
// its neighbour riding at the site's edge, inside the bracket or after it.
// One word of the book — RULE 1 (owner): one C0, both readings, the reading
// selected above it and never here. Both branches are keyed by the site's
// own rule; a stream's key column is the corpus lane's and is not read.
//
// Two forms need a declaration to be read as a site, because the surface
// alone is ambiguous: a lone parenthesised run is an apparatus site under
// the variant-sites law unless the serve declares it a ketiv the tradition
// does not read, and a lone bracketed word is the two-row convention's qere
// unless the serve declares it a qere with no ketiv. The restore v5 declares
// every site it carries (ketiv, qere, order), and the builder holds the
// declaration to the surface: a declared site the surface does not write
// refuses the build.
const KQ_GROUP = /\(([^()]*)\)|\[([^\[\]]*)\]/gu;
const KQ_KETIV_TEXT = new RegExp("^[" + KQ_LETTERS + KQ_KEPT + " ]+$", "u");
const nfc = (s) => String(s ?? "").normalize("NFC");
const piecesOf = (text) => nfc(text).split(/\s+/u).flatMap((t) => t.split(MAQAF)).filter(Boolean);
// The surface is sliced RAW: a canonical reordering of a word's points is
// the same text and different bytes, and the ink on the page must be the
// bytes the source wrote (five sites of Genesis reorder under NFC). Only the
// comparisons normalize.
export const kqSiteOf = (surface, declared = null) => {
  const s = String(surface ?? "");
  const groups = [...s.matchAll(KQ_GROUP)];
  if (!groups.length) return null;
  const first = groups[0].index, last = groups[groups.length - 1].index + groups[groups.length - 1][0].length;
  // nothing but a joiner may stand outside the groups, and nothing but
  // spaces and joiners between them: a word glued to the site is not a site
  if (!/^\u05be*$/u.test(s.slice(0, first)) || !/^\u05be*$/u.test(s.slice(last))) return null;
  for (let i = 1; i < groups.length; i += 1) {
    const between = s.slice(groups[i - 1].index + groups[i - 1][0].length, groups[i].index);
    if (!/^[\s\u05be]*$/u.test(between)) return null;
  }
  let ketiv = null, qere = null;
  const order = [];
  for (const g of groups) {
    if (g[1] !== undefined) { if (ketiv !== null) return null; ketiv = g[1]; order.push("K"); }
    else { if (qere !== null) return null; qere = g[2]; order.push("Q"); }
  }
  // a ketiv is bare letters; a qere is vocalized — a bare bracketed word in
  // an unvocalized stream is an editorial mark (Tosefta Kilayim carries 47)
  if (ketiv !== null && !(KQ_KETIV_TEXT.test(ketiv) && !KQ_VOWEL.test(ketiv))) return null;
  if (qere !== null && !KQ_VOWEL.test(qere)) return null;
  if ((ketiv === null || qere === null) && !declared) return null;
  const shape = order.join("");
  return {
    ketiv, qere,
    order: shape === "KQ" ? "KETIV_THEN_QERE" : shape === "QK" ? "QERE_THEN_KETIV" : shape === "K" ? "KETIV_ONLY" : "QERE_ONLY",
    joins_next: /\u05be[\u0591-\u05c7]*[\])]?$/u.test(s),
  };
};
// The word a site becomes: every word of every branch its own region, in the
// source's order, keyed on its own; a branch of one word keeps its brackets
// on the region so the page prints the carrier whole, a branch of several
// words gives each word a bare region and the brackets print as carrier text.
const rawPiecesOf = (text) => String(text ?? "").split(/\s+/u).flatMap((t) => t.split(MAQAF)).filter(Boolean);
const bareText = (t) => String(t ?? "").replace(/^\u05be+|\u05be+$/gu, "");
const kqWord = (r, site) => {
  const s = String(r.exact_surface_form);
  // A branch of one word keeps its brackets on the region so the page prints
  // the carrier whole — unless the source wrote the joiner inside the
  // bracket ([qere־]): the joiner is the site's, not the word's, and a region
  // carrying a maqaf reads to the page as a joined interval rather than a
  // word, which left the qere half of 54 sites without a card (2026-09-06).
  // Such a branch gives the bare word as its region and the bracket and the
  // joiner print as carrier text, exactly as a branch of several words does.
  const regionsOfBranch = (text, role, wrapped) => {
    const ps = rawPiecesOf(text);
    if (ps.length === 1 && ps[0] === text) return [{ s: wrapped, k: exactK(ps[0]), role }];
    return ps.map((p) => ({ s: p, k: exactK(p), role }));
  };
  const w = [];
  for (const g of s.matchAll(KQ_GROUP)) {
    if (g[1] !== undefined) w.push(...regionsOfBranch(g[1], "KETIV", g[0]));
    else w.push(...regionsOfBranch(g[2], "QERE", g[0]));
  }
  const word = {
    s,
    w,
    // each branch named bare: a joiner at a branch's edge is the site's, and
    // the surface above carries it as written
    kq: {
      k: site.ketiv === null ? null : bareText(site.ketiv), q: site.qere === null ? null : bareText(site.qere), order: site.order, rows: 1, convention: "ONE_ROW_PARENS_KETIV_BRACKETS_QERE",
      words_read: site.qere === null ? 0 : piecesOf(site.qere).length,
      words_written: site.ketiv === null ? 0 : piecesOf(site.ketiv).length,
      ...(r.kq && r.kq.trivial ? { trivial: true } : {}),
    },
    ...(site.joins_next ? { presentation_join: MAQAF_JOIN } : {}),
  };
  return carried(r, word);
};

export const wordsOf = (rows) => {
  const out = [];
  for (let i = 0; i < rows.length; i += 1) {
    const r = rows[i];
    const declared = r.kq || null;
    const site = r.visible_in_hebrew_reader ? kqSiteOf(r.exact_surface_form, declared) : null;
    if (declared) {
      require_(site, "KQ_DECLARED_NOT_READ", `${r.c0_numeric_id}: the serve declares a ketiv-qere site and the surface ${JSON.stringify(String(r.exact_surface_form).slice(0, 40))} does not write one`);
      // a declaration names each branch bare; a joiner at a branch's edge is
      // the site's (it joins the site to the next word), so edges are
      // stripped before the declaration is held to the surface
      const bare = (t) => nfc(t ?? "").replace(/^\u05be+|\u05be+$/gu, "");
      require_(bare(declared.ketiv) === bare(site.ketiv) && bare(declared.qere) === bare(site.qere),
        "KQ_DECLARATION_DISAGREES", `${r.c0_numeric_id}: the declared ketiv or qere is not what the surface writes`);
    }
    if (site) { out.push(kqWord(r, site)); continue; }
    const convention = kqPairAt(rows, i);
    if (convention) {
      const ks = rows[i].exact_surface_form, qs = rows[i + 1].exact_surface_form;
      const kq = { k: ks, q: qs, order: "KETIV_THEN_QERE", rows: 2, convention };
      out.push({
        s: ks + " " + qs,
        w: [{ s: ks, k: exactK(ks), role: "KETIV" }, { s: qs, k: exactK(qs), role: "QERE" }],
        kq,
      });
      i += 1;
      continue;
    }
    out.push(wordOf(rows[i]));
  }
  // the word after a maqaf-joined word knows it, so its own card can say so.
  // Only a word whose ink carries the joiner joins the next: the flag this
  // loop writes on the follower names the SAME rule, and reading the rule's
  // name alone made every word to the end of the verse "after a maqaf"
  // (2026-09-06, found on Genesis 1:5 — thirteen thousand followers for
  // three thousand joiners).
  for (let i = 1; i < out.length; i += 1) {
    const prev = out[i - 1].presentation_join;
    if (!(prev && prev.join_next_without_separator && prev.why && prev.why.startsWith("maqaf-rule-v2"))) continue;
    out[i].after_maqaf = true;
    // the reader groups a joined run in one wrapper: the word after a joiner
    // says it joins the previous, the maqaf word already says it joins the
    // next, and a middle word of a chain says both
    out[i].presentation_join = { ...(out[i].presentation_join || {}), join_previous_without_separator: true, why: (out[i].presentation_join || {}).why || MAQAF_JOIN.why };
  }
  return out;
};

// RULE 2 (owner, 2026-09-02): a maqaf compound is one C0 per word. The corpus
// lane's reseal wrote each word as its own row with the joiner riding on the
// word before; the site prints the two adjacent, no separator, because the
// ink is continuous, and gives each its own card. The join is a presentation
// fact carried on the word, in the shape the reader already draws.
const MAQAF_JOIN = Object.freeze({
  join_next_without_separator: true,
  separator_between_group_records: "",
  why: "maqaf-rule-v2-one-c0-per-word: the joiner rides on this word and the next word follows it without a space, as the ink is written",
});
// THE SOURCE'S OWN MARKS, TYPED AS THE FRAME NAMES THEM.
//
// The frame's Q letter points at a mark, and names its kinds: kq, petuchah,
// setumah, inverted nun, masorah. Three of them are a glyph in the ink and can
// be recognised here, once, so that every gate and every card downstream reads
// one classification rather than each guessing from the shape.
//
//   * a lone samekh wrapped in brackets is a CLOSED section (setumah): the
//     section ends here and the next begins on the same line
//   * a lone pe is an OPEN section (petuchah): the next begins on a new line
//   * U+05C6, the inverted nun, brackets a passage the tradition reads as
//     standing apart
//
// A mark is NOT a word of the book. The owner's rules 4 and 5: one C0, off by
// default, keyless — it marks structure, so it opens no reading and the
// catalog is never asked to answer for it. Rule 6 parts company on one point
// and the type carries that too: the section marks are scribal bookkeeping
// and a reader may turn them off; the inverted nunim speak about the text and
// may never be hidden.
const MARK_BRACKETS = { "(": ")", "{": "}", "[": "]" };
const MARK_LETTERS = { "\u05e1": "SETUMAH", "\u05e4": "PETUCHAH" };
const INVERTED_NUN = "\u05c6";
// The marks the owner's rules 10 and 11 give their own INKOFF C0 (2026-09-05:
// every scribal mark that belongs to no word is its own position, whether or
// not the source spaced it). The corpus lane's restore v5 writes each one as
// its own row; the builder types it here, once, and the page obeys the type.
//   U+05C3 SOF PASUQ      the verse-end mark
//   U+05C0 PASEQ          the bar between two words
//   U+25AF               the restore's stand-in for a brick gap in a song line
//                        (the source wrote a run of eight non-breaking spaces)
//   U+2014 EM DASH        what the edition prints where a numbered verse is
//                        not written (Joshua 21:36-37)
// Sof pasuq and paseq are bookkeeping about the page and a reader may turn
// them off, as with the section marks; a gap and a dash are the shape of
// the text itself and stay.
const SOF_PASUQ = "\u05c3", PASEQ = "\u05c0", BRICK_GAP = "\u25af", EMPTY_VERSE_DASH = "\u2014";
export const markOf = (surface) => {
  const t = String(surface || "").trim();
  if (t.includes(INVERTED_NUN) && [...t].every((c) => c === INVERTED_NUN || /\s/u.test(c)))
    return { kind: "INVERTED_NUN", glyph: INVERTED_NUN, toggleable: false,
      says: "a scribal bracket, not a word of the book: the passage between these two marks is set apart by the scribes themselves" };
  if (t.length === 3 && MARK_BRACKETS[t[0]] === t[2] && MARK_LETTERS[t[1]])
    return { kind: MARK_LETTERS[t[1]], glyph: t[1], bracket: t[0], toggleable: true,
      says: MARK_LETTERS[t[1]] === "SETUMAH"
        ? "a closed section: not a word of the book, but the scribes' mark that a section ends here and the next begins on the same line"
        : "an open section: not a word of the book, but the scribes' mark that a section ends here and the next begins on a new line" };
  if (t === SOF_PASUQ)
    return { kind: "SOF_PASUQ", glyph: t, toggleable: true,
      says: "the end of a verse: not a word of the book, but the scribes' mark that the verse closes here" };
  if (t === PASEQ)
    return { kind: "PASEQ", glyph: t, toggleable: true,
      says: "a paseq: not a word of the book, but the scribes' bar standing between two words" };
  if (t === BRICK_GAP)
    return { kind: "BRICK_GAP", glyph: t, toggleable: false, stands_for: "the run of eight non-breaking spaces the source wrote inside this line of the song",
      says: "a gap in a song line: not a word of the book, but the space the scribes leave inside a line where the song is written brick over brick" };
  if (t === EMPTY_VERSE_DASH)
    return { kind: "EMPTY_VERSE", glyph: t, toggleable: false,
      says: "a dash where the verse stands empty: the numbering counts a verse this edition does not write, and the edition prints a dash in its place" };
  return null;
};
export const MARK_KINDS = Object.freeze(["SETUMAH", "PETUCHAH", "INVERTED_NUN", "SOF_PASUQ", "PASEQ", "BRICK_GAP", "EMPTY_VERSE"]);

// What a serve row may carry beside its surface, and the word keeps: the
// scribes' marks on a letter (rule 12 \u2014 an overlay on the letter, the word
// keeps its C0 and its key), a joiner the source spaced out and the owner's
// rule 2 reads as a maqaf all the same, and a row's place in a song passage.
// None of these is typed here; each is a fact the serve carried from the
// corpus lane's restore, and the word repeats it so the page can say it.
const carried = (r, w) => {
  if (Array.isArray(r.letter_marks) && r.letter_marks.length) w.letter_marks = r.letter_marks;
  if (r.maqaf_implicit) w.maqaf_implicit = true;
  if (r.shirah) w.shirah = true;
  // the source's own flag on a word it prints in one form while marking it a
  // ketiv-qere of spelling (the restore's kq_trivial); the word is one C0
  // with one surface, and the flag rides so the card can say the source
  // marks it
  if (r.kq_trivial) w.kq_trivial = true;
  return w;
};

const wordOf = (r) => {
    const surface = r.exact_surface_form;
    const w = { s: surface };
    if (!r.visible_in_hebrew_reader) { w.held = true; return w; }
    // a mark is keyless by rule: it marks structure, so no reading is asked
    // for it and none is served
    const mk = markOf(surface);
    if (mk) { w.mark = mk; return carried(r, w); }
    if (joinsNext(surface)) w.presentation_join = MAQAF_JOIN;
    if (joinsPrev(surface)) w.edge_maqaf = "LEADING";
    const k = exactK(surface);
    if (!k) return carried(r, w);
    if (!k.includes(MAQAF)) { w.k = k; return carried(r, w); }
    const pieces = surface.split(MAQAF);
    const regions = pieces.map((p) => ({ s: p, k: exactK(p) }));
    require_(
      regions.map((x) => x.k).join(MAQAF) === k,
      "MAQAF_REGIONS_DO_NOT_REJOIN",
      `${surface}: ${regions.map((x) => x.k).join(MAQAF)} vs ${k}`,
    );
    // The W set of a maqaf occurrence is the COMPcell lattice, not the atoms
    // alone: a chain of n atoms holds n(n+1)/2 W — every atom and every
    // contiguous joined interval, the whole included. The atoms tile the
    // printed surface; the joined intervals open from the maqaf marks that
    // make them. The body route used to emit only the atoms, which left the
    // whole of \u05d1\u05df\u05be\u05d9\u05d4\u05d5\u05d3\u05d4 unreachable — the lattice gate caught it the first
    // time a maqaf-carrying shelf faced it.
    const atoms = regions.filter((x) => x.k);
    const cells = [...atoms];
    for (let len = 2; len <= atoms.length; len += 1)
      for (let i = 0; i + len <= atoms.length; i += 1)
        cells.push({
          s: atoms.slice(i, i + len).map((a) => a.s).join(MAQAF),
          k: atoms.slice(i, i + len).map((a) => a.k).join(MAQAF),
        });
    w.w = cells;
    return carried(r, w);
};

/** Every W an occurrence contains, whether it carries one or several. */
export const regionsOf = (word) => (word.w ? word.w : word.k ? [{ s: word.s, k: word.k }] : []);

/**
 * One license posture per zone, computed from the rows rather than asserted.
 * Refuses to summarize a mixed set, because a single chip over two postures
 * would be a claim the receipts do not support.
 */
export const licensePosture = (units) => {
  const combos = new Map();
  for (const u of units.values())
    for (const r of u.rows) {
      const key = [
        r.rights_authority.normalized_license_class,
        r.rights_authority.license_version,
        r.reader_display_axis,
        r.public_distribution_axis,
        r.attribution_required,
        r.noncommercial_required,
        r.share_alike_required,
        r.no_derivatives_required,
        r.rights_authority.terminal_resolution_state,
      ].join(" · ");
      combos.set(key, (combos.get(key) || 0) + 1);
    }
  return [...combos.entries()].map(([k, n]) => ({ posture: k, rows: n })).sort((a, b) => b.rows - a.rows);
};
