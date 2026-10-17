#!/usr/bin/env node
// Bakes the corpus lane's piece store v2 (FOR-ELIJAH-v77, normalized: records
// once under a hash id, claims apart) into the served shape: one file per
// book holding the claims at each place as short arrays and the records
// they name, and an index naming the two PIECE sources with their license.
// Share the record, never share the claim: a served claim carries no text
// of its own; its English is a slice of its record's D by the lane's byte
// ranges, cut here from that one copy.
// The served record is [m, headword, R, year]: the record's source line (D,
// a TSV row of TAHOT or MACULA) stays in the lane's store under the same rid
// (corpus-lane-builds/moses-piece-store-v2/build/piece-store-v2/records/)
// and is not served; the page shows R, the record's own reading, as the
// piece's definition.
// Usage: node tools/bake-piece-store-v1.mjs --from <build>/piece-store-v2 --relay <relay file name> [--out data/piece-store]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const FROM = arg("from", ""), OUT = arg("out", "data/piece-store"), RELAY = arg("relay", "");
if (!FROM || !existsSync(join(FROM, "index.json"))) { console.error("usage: --from <folder holding index.json, claims/, records/>"); process.exit(2); }
if (!RELAY) { console.error("--relay <the relay file that hands this build over> is required"); process.exit(2); }
// the build's own name, from its folder (piece-store-v2)
const BUILD = basename(FROM.replace(/\/+$/u, ""));
const ix = JSON.parse(readFileSync(join(FROM, "index.json"), "utf8"));
mkdirSync(OUT, { recursive: true });
const sliceD = (D, r, recs, byRid) => {
  if (!Array.isArray(r)) return null;
  const parts = [];
  for (const seg of r) {
    if (!Array.isArray(seg)) continue;
    const [s, e, i] = seg; const d = i === undefined ? D : (byRid.get(recs[i]) || {}).D;
    if (typeof d !== "string") continue;
    parts.push(Buffer.from(d, "utf8").subarray(s, e).toString("utf8"));
  }
  return parts.length ? parts.join(" ") : null;
};
let claimsAll = 0, recsAll = 0, recsReceived = 0, placesAll = 0, withR = 0;
const perSrc = {};
// WHAT IS NOT SERVED, by rule, each counted on its own (the review of
// 2026-10-17 found the first count named only one of them)
const WITHHELD = {
  joins_whole_word: { value: 0, axis: "claims", why: "a whole-word claim on a word its source divides names two or more records (MACULA) or two or more ranges of one record (TAHOT): the lane's join of the pieces' slices, not a reading the source prints; the pieces are served", per_source: {} },
  joins_run: { value: 0, axis: "claims", why: "a run claim (a tile of two or more pieces) is likewise the lane's join of its pieces' slices; the pieces are served", per_source: {} },
  tahot_two_word_line: { value: 0, axis: "claims", why: "one TAHOT line over two ink words (a maqaf pair, a qere read but not written, or words TAHOT writes with only a slash between them): its record is named at more than one word of the verse, and the later word's claims point into the first word's part of the line, so they are withheld and the first word's kept; and on a line TAHOT splits over one ink word, a whole-word claim that takes only part of the line (Numbers 7:59, Pedah of Pedah/ /zur)", per_source: {} },
  tahot_division_not_its_own: { value: 0, axis: "claims", why: "a TAHOT claim filed under a division declared alongside (MACULA's cut) where TAHOT keeps the word whole: TAHOT's English for the whole word would stand on one piece", per_source: {} },
};
for (const w of Object.values(WITHHELD)) w.per_kind = {};
const withhold = (rule, src, kind) => { const w = WITHHELD[rule]; w.value += 1; w.per_source[src] = (w.per_source[src] || 0) + 1; w.per_kind[kind] = (w.per_kind[kind] || 0) + 1; };
for (const book of ix.books) {
  const byRid = new Map();
  for (const src of ["tahot", "macula"]) {
    const f = join(FROM, "records", src, `${book}.jsonl`);
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) { if (!line) continue; const r = JSON.parse(line); byRid.set(r.rid, r); recsReceived += 1; }
  }
  const places = {}, records = {};
  const claimLines = readFileSync(join(FROM, "claims", `${book}.jsonl`), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  // which words of a verse each TAHOT record is named at, and under which
  // obj at one place (words[0], words[1]): a record named at two words is a
  // line over two ink words; its first word is the lowest w in the verse
  const firstWordOf = new Map(), objsAt = new Map();
  for (const c of claimLines) {
    if (c[4] !== "tahot" || !c[7] || !c[7][0]) continue;
    const rid = c[7][0], at = `${rid}\u0001${c[1]}`;
    const fw = firstWordOf.get(at); if (fw === undefined || c[2] < fw.min) firstWordOf.set(at, { min: c[2], words: new Set([...(fw ? fw.words : []), c[2]]) }); else fw.words.add(c[2]);
    const o = c[15] && typeof c[15].obj === "string" ? c[15].obj : null;
    if (o) { const k = `${at}\u0001${c[2]}`; if (!objsAt.has(k)) objsAt.set(k, new Set()); objsAt.get(k).add(o); }
  }
  for (const c of claimLines) {
    const [p, ref, w, pi, src, kind, reading, rec, r, cut, sign, cell, letters] = c;
    claimsAll += 1; perSrc[src] = (perSrc[src] || 0) + 1;
    // THE LANE'S JOINS ARE NOT READINGS: a whole-word or run claim that names
    // two or more records (MACULA) or two or more ranges of one record (TAHOT,
    // "in/ beginning") has for its R the slices joined by the lane ("in
    // beginning"); the pieces carry the records, so the join is counted and
    // not served (the owner, 2026-10-16: "each piece in the + sign is RMD";
    // "share the record, never share the claim")
    if ((rec && rec.length > 1) || (r && r.length > 1)) { withhold(kind === "RUN" ? "joins_run" : "joins_whole_word", src, kind); continue; }
    // A TAHOT CLAIM ON A DIVISION TAHOT DOES NOT MAKE: the lane files it under
    // the division declared alongside (its 16th element names
    // declared_alongside), where TAHOT's own line keeps the word in one part
    const opt = c[15];
    if (src === "tahot" && kind === "DIVISION" && opt && typeof opt.obj === "string" && /^declared_alongside\[/u.test(opt.obj)) { withhold("tahot_division_not_its_own", src, kind); continue; }
    const rid = rec && rec[0]; const R0 = rid ? byRid.get(rid) : null;
    // A TAHOT LINE OVER TWO INK WORDS, found by what it covers: the record is
    // named at more than one word of the verse, or at one place under both
    // words[0] and words[1]. The later word's claims point into the first
    // word's part of the line; the first word's claims are its own.
    if (src === "tahot" && rid) {
      const fw = firstWordOf.get(`${rid}\u0001${ref}`);
      const objs = objsAt.get(`${rid}\u0001${ref}\u0001${w}`);
      const opt16 = c[15] && typeof c[15].obj === "string" ? c[15].obj : null;
      if ((fw && fw.words.size > 1 && w !== fw.min) || (opt16 === "words[1]" && objs && objs.has("words[0]"))) { withhold("tahot_two_word_line", src, kind); continue; }
      // a line TAHOT splits over one ink word (its gap not NONE): a whole-word
      // claim must take the whole line, not one part of it
      const oneWord = (!fw || fw.words.size === 1) && !(objs && objs.has("words[0]") && objs.has("words[1]"));
      if (oneWord && R0 && R0.gap && R0.gap !== "NONE" && kind === "WHOLE_WORD") {
        const whole = sliceD(R0.D, r, rec, byRid);
        if (!whole || whole.replace(/\s+/gu, " ").trim() !== String(R0.R).replace(/\s+/gu, " ").trim()) { withhold("tahot_two_word_line", src, kind); continue; }
      }
    }
    const R = R0 ? sliceD(R0.D, r, rec, byRid) : null;
    if (R) withR += 1;
    const key = `${ref}:${w}`;
    if (!places[key]) { places[key] = []; placesAll += 1; }
    places[key].push([pi, src, kind, reading, letters ? letters[0] : null, letters ? letters[1] : null, R, rid || null, cut, !!sign]);
    if (R0 && !records[rid]) { records[rid] = [R0.m, (R0.headwords || [])[0] || "", R0.R, R0.year || "S_NO_SOURCE_YEAR"]; recsAll += 1; }
  }
  writeFileSync(join(OUT, `${book}.json`), JSON.stringify({ book, places, records }));
}
const m_sources = {};
for (const ml of ix.m_lines || []) {
  const raw = JSON.parse(ml.raw);
  m_sources[ml.m] = { key: raw.key, label: ml.m === "PIECE:TAHOT" ? "STEPBible TAHOT: the aligned translation's pieces (PIECE:TAHOT)" : "MACULA Hebrew: the morphology's pieces (PIECE:MACULA)", licensePosture: raw.short_label, licensePointer: `${ml.file}#L${ml.line}`, sourceYear: "S_NO_SOURCE_YEAR", from: BUILD, licence_label: raw.licence_label || "" };
}
const withheldAll = Object.values(WITHHELD).reduce((t, w) => t + w.value, 0);
writeFileSync(join(OUT, "index.json"), JSON.stringify({ rule: "piece-store-serve-v1-a-claim-carries-no-text-its-english-is-a-slice-of-its-records-d", from: { relay: RELAY, build: BUILD, rule: ix.rule, recipe: ix.recipe, date: ix.date },
  // the books with a file here: the page asks for no other
  books: [...ix.books],
  m_sources,
  counts: { claims_received: { value: claimsAll, axis: "claims", per_source: perSrc }, claims: { value: claimsAll - withheldAll, axis: "claims", what: "served: the received claims less every rule below" }, withheld: WITHHELD, claims_with_english: { value: withR, axis: "claims" }, records_received: { value: recsReceived, axis: "records" }, records_named: { value: recsAll, axis: "records", what: "served: the records a served claim names" }, records_not_named: { value: recsReceived - recsAll, axis: "records", why: "every claim naming them is withheld (most are MACULA records named only by a whole-word or run join); they stay in the lane's store" }, places: { value: placesAll, axis: "places" }, books: { value: ix.books.length, axis: "books" } } }, null, 1));
console.log(`${OUT}: ${claimsAll} claims received, ${claimsAll - withheldAll} served (${withR} with English) at ${placesAll} places · ${recsReceived} records received, ${recsAll} named · ${ix.books.length} books · sources ${Object.keys(m_sources).join(", ")}`);
for (const [k, w] of Object.entries(WITHHELD)) console.log(`  withheld ${k}: ${w.value} ${JSON.stringify(w.per_source)}`);
