#!/usr/bin/env node
// RUN: tree
// GUARDS: place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. A check reads the second reader's files, the places, the
// entries, the bridges and the zones, and judges; it writes nothing.
//
// THE SECOND READER'S FILES SAY ONLY WHAT THE PLACES AND THE ENTRIES SAY
// (27 November 2026, the fresh build). data/place-answers-v1/page/ is what
// reader/place.html fetches: a file a chapter, and the dictionaries by STEP
// tag. tools/project-place-answers-page-v1.mjs projects it by rule. This
// holds it, with the places, the entries and the bridges open beside it:
//
//   G1  the pin is a pin of the page's files; it was made from the two
//       parts' pins as they stand; every file it counts is there with the
//       bytes it names, and no file stands there that it does not count
//   G2  every chapter of every book has its file, and the index lists them
//   G3  every entry of our text stands in its verse in order, as the zone
//       writes it: each word, each scribal mark, each form of a pair
//   G4  every STEP string is the string of the places: the rows met, each
//       part's English, tag, root mark and Hebrew, how the word meets them;
//       and the line under the word is the reader's own line for those parts
//       (tools/gloss-store-v1.mjs), carried only where a sign is hidden
//   G5  every MACULA string is the string of the places
//   G6  every sense said to cite a place is found again by its address: the
//       verse bridge lists it under that verse (and, for the UBS dictionary,
//       at that word number); the tag reaches its entry by the tag bridge
//       (or the entry's lemma is MACULA's for the morph); its words are the
//       entry's own. And no BDB sense the two bridges give for a word is
//       left out. A paragraph of the unabridged BDB is said to cite a place
//       only where its own headword has the letters of the word's lemma
//       (STEP's brief lexicon's headword for the number, read without what
//       stands in its square brackets: the other words of a combination the
//       number is one word of; the Lexical Index's; or MACULA's lemma for a
//       morph that carries the number):
//       every line said passes that test, every citing paragraph that passes
//       it is said, and the records that are a word's by MACULA's lemma
//       alone are named on its form. The test is coded here again, apart
//       from the projection's. Every headword of STEP's that carries a square
//       bracket has a relation said in the file's own column and letters left
//       outside the brackets, and they are the headwords the pin names
//   G7  the sentences that say how the two editions meet are the rule's
//       sentences for the places' record of the word, and no others
//   G8  every tag of STEP's stands in the one file its number names, with
//       the bridge's own line; every entry it reaches stands beside it and is
//       the entry of entries/ with only the named keys left out
//   G9  every record of the unabridged BDB stands whole in the one file its
//       number names
//   G10 the index says what the bridge and the pins say
//   G11 the counts, counted again, are the pin's
//
// What it shares with the projection (tools/place-answers-page-v1.mjs): the
// shape, the keys left out, how a file is named, the label of a BDB sense,
// and the sentences of G7. What it does NOT share: the finding of a sense at
// a place. G6 looks each one up again from the page file's own statement.
//
// Exit 0 when everything holds, 1 otherwise, 3 where the page's files have
// not been made on this disk.
//
// Run: node tools/check-place-answers-page-v1.mjs [--dir data/place-answers-v1] [--page <folder>] [--zones data/zones]
//   --page  judge another folder of page files (a spoiled copy) against the same places and entries
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS, readZone } from "./place-answers-sources-v1.mjs";
import { openPlaces } from "./place-answers-places-v1.mjs";
import { printedForm, signOnly, joinDrawn, SIGN_GAP } from "./gloss-store-v1.mjs";
import { CHAPTER_SCHEMA, TAGS_SCHEMA, UNABRIDGED_SCHEMA, INDEX_SCHEMA, PAGE_PIN_SCHEMA, DICTIONARIES, INLINE, LEFT_OUT, tagFile, unabridgedFile, isStepsOwn, meetingWords, bdbSenseLabel, OPENING_KINDS } from "./place-answers-page-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const argv = process.argv.slice(2);
let DIR = join(K3, "data", "place-answers-v1"), ZONES = join(K3, "data", "zones"), PAGE = null;
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === "--dir") { DIR = argv[i + 1]; i += 1; } else if (argv[i] === "--zones") { ZONES = argv[i + 1]; i += 1; } else if (argv[i] === "--page") { PAGE = argv[i + 1]; i += 1; }
  else { console.error("usage: check-place-answers-page-v1.mjs [--dir <place answers folder>] [--page <folder>] [--zones <zones folder>]"); process.exit(2); }
}
PAGE = PAGE || join(DIR, "page");
if (!existsSync(join(PAGE, "PIN.json")) || !existsSync(join(DIR, "places")) || !existsSync(join(DIR, "entries"))) { console.log(`SKIPPED: the second reader's files are not made on this disk (${PAGE}); tools/make-place-answers-v1.sh <sources folder> makes them`); process.exit(3); }

let bad = 0; const notes = {};
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
/** A law's failures, kept by law: the first few are printed with the law. */
const miss = (law, what) => { (notes[law] ||= []).push(what); };
const verdict = (law, name, good) => { const f = notes[law] || []; check(`${law} ${name}`, f.length === 0, f.length ? `${f.length.toLocaleString("en-US")} — ${f.slice(0, 4).join(" ¦ ")}${f.length > 4 ? " ¦ …" : ""}` : good); };
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const readGz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const N = (x) => Number(x).toLocaleString("en-US");

// ---- the sources, opened beside the page's files
const bridge = readGz(join(DIR, "bridges", "step-tag-to-entry.json.gz"));
const VERSES = {}; for (const k of ["openscriptures_bdb_1906", "unabridged_bdb_1906", "ubs_sdbh_hebrew_v0_9_2"]) VERSES[k] = readGz(join(DIR, "bridges", `verse-to-sense-${k}.json.gz`)).verses;
const ENTRIES = {}; for (const k of DICTIONARIES) ENTRIES[k] = readGz(join(DIR, "entries", `${k}.json.gz`)).entries;
const pin = JSON.parse(readFileSync(join(PAGE, "PIN.json"), "utf8"));
const index = existsSync(join(PAGE, "index.json")) ? JSON.parse(readFileSync(join(PAGE, "index.json"), "utf8")) : {};

// ---- G1 the pin and the files
{
  check("G1 the pin is a pin of the page's files", pin.schema === PAGE_PIN_SCHEMA, String(pin.schema));
  for (const rel of ["places/PIN.json", "entries/PIN.json"]) { const buf = readFileSync(join(DIR, rel)); const m = (pin.made_from || {})[rel]; if (!m || m.sha256 !== sha256(buf) || m.bytes !== buf.length) miss("G1", `${rel} is not the pin the page's files were made from`); }
  const all = []; const walk = (d, rel) => { for (const n of readdirSync(d).sort()) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p, `${rel}${n}/`); else if (`${rel}${n}` !== "PIN.json") { const buf = readFileSync(p); all.push([`${rel}${n}`, buf.length, sha256(buf)]); } } };
  walk(PAGE, ""); all.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const roll = (list) => sha256(Buffer.from(list.map(([rel, bytes, sum]) => `${rel}\t${bytes}\t${sum}\n`).join(""), "utf8"));
  const group = (name, test, want) => { const list = all.filter(([rel]) => test(rel)); if (!want || want.files !== list.length || want.bytes !== list.reduce((a, x) => a + x[1], 0) || want.sha256_of_the_list !== roll(list)) miss("G1", `${name}: the files on disk are not the files the pin counts`); return list.length; };
  const m = pin.made || {};
  const nCh = group("the chapters", (rel) => /^[a-z-]+\/\d+\.json\.gz$/u.test(rel), m.chapters);
  for (const [book] of BOOKS) group(`the chapters of ${book}`, (rel) => rel.startsWith(`${book}/`), (m.chapters_by_book || {})[book]);
  const nT = group("the tag files", (rel) => rel.startsWith("entries/t/"), m.tag_files), nU = group("the unabridged BDB's files", (rel) => rel.startsWith("entries/u/"), m.unabridged_files);
  const ix = all.find(([rel]) => rel === "index.json"); if (!ix || !m["index.json"] || m["index.json"].sha256 !== ix[2]) miss("G1", "index.json is not the file the pin names");
  if (all.length !== nCh + nT + nU + 1) miss("G1", `${all.length - nCh - nT - nU - 1} files stand in the folder that the pin does not count`);
  verdict("G1", "the pin was made from the two parts' pins as they stand, and counts every file there", `${N(nCh)} chapters, ${N(nT)} tag files, ${N(nU)} unabridged BDB files, the index`);
}

// ---- G2 to G7, book by book
const counts = { books: 0, chapters: 0, verses: 0, words: 0, marks: 0, forms: 0, forms_with_steps_parts: 0, forms_with_maculas_morphs: 0, words_where_the_editions_differ: 0, sentences: 0,
  here: { ubs_at_this_very_word_by_the_tags_entry: 0, ubs_at_this_very_word_by_maculas_lemma: 0, ubs_at_the_verse_another_word_number: 0, ubs_at_the_verse_no_word_of_maculas: 0, bdb_open_scriptures_at_the_verse: 0, bdb_unabridged_at_the_verse: 0, words_with_a_ubs_sense_at_this_very_word: 0, words_with_any: 0 },
  steps_rows_no_word_of_ours_meets: 0,
  lines_under_a_word_with_a_sign_hidden: 0,
  headword: { unabridged_lines_not_drawn_under_a_number_of_one_record: 0, unabridged_lines_not_drawn_under_a_number_of_several_records: 0, unabridged_lines_drawn_by_maculas_lemma_alone: 0, words_where_a_line_is_not_drawn: 0, forms_with_a_record_by_maculas_lemma_alone: 0,
    words_under_a_number_of_several_records: { one_record_is_the_words: 0, several_are: 0, none_is: 0 }, steps_headwords_read_without_their_square_brackets: {} } };
const held = { zone: 0, step: 0, macula: 0, here: 0, sentences: 0 };
const KIND = ["plain", "written and read", "written, not read", "read, not written"];
const lettersOf = (x) => Array.from(String(x || "")).filter((ch) => { const c = ch.codePointAt(0); return c >= 0x5d0 && c <= 0x5ea; }).join("");
const ubsEntryOf = (lexid) => ENTRIES.ubs_sdbh_hebrew_v0_9_2[`${lexid.slice(0, 6)}000000000`];
// ---- the headword test, coded here apart from the projection: letters are the consonants, the five end-of-word shapes folded
const FOLD = new Map([[0x5da, 0x5db], [0x5dd, 0x5de], [0x5df, 0x5e0], [0x5e3, 0x5e4], [0x5e5, 0x5e6]]);
const folded = (s) => { let o = ""; for (const ch of String(s || "")) { const c = ch.codePointAt(0); if (c >= 0x5d0 && c <= 0x5ea) o += String.fromCodePoint(FOLD.get(c) || c); } return o; };
/** A headword of STEP's without what stands in its square brackets (read here letter by letter, apart from the projection's). */
const outsideBrackets = (s) => { let o = "", depth = 0; for (const ch of String(s || "")) { if (ch === "[") depth += 1; else if (ch === "]") { if (depth) depth -= 1; o += " "; } else if (!depth) o += ch; } return o; };
// every headword of STEP's brief lexicon that carries a square bracket, with its relation column; each must say a relation and keep letters outside the brackets
for (const id of Object.keys(ENTRIES.stepbible_tbesh_gloss).sort()) { const e = ENTRIES.stepbible_tbesh_gloss[id]; const h = String(e.Hebrew || ""); if (!h.includes("[") && !h.includes("]")) continue;
  counts.headword.steps_headwords_read_without_their_square_brackets[id] = e.relation || "";
  if (!e.relation) miss("G6", `${id}: STEP's headword carries square brackets and its relation column says nothing`);
  if (!folded(outsideBrackets(h))) miss("G6", `${id}: STEP's headword has no letter outside its square brackets`); }
const LEMMAS = new Map();
/** The letters of a number's lemma as STEP's brief lexicon (its headword outside its square brackets) and the Lexical Index give it. */
const lemmaSet = (tag) => { let s = LEMMAS.get(tag); if (s) return s; s = new Set(); const row = bridge.tags[tag];
  if (row) { for (const id of row.stepbible_tbesh_gloss.slice(1)) { const L = folded(outsideBrackets((ENTRIES.stepbible_tbesh_gloss[id] || {}).Hebrew)); if (L) s.add(L); } for (const id of row.openscriptures_lexical_index.slice(1)) { const L = folded((ENTRIES.openscriptures_lexical_index[id] || {}).w); if (L) s.add(L); } }
  LEMMAS.set(tag, s); return s; };
/** MACULA's lemma letters for the number at a word: its morphs that carry the number. */
const maculaSet = (tag, mo) => { const s = new Set(); if (!mo || mo.way === 0 || mo.letters === "another word") return s; const n = Number(tag.slice(1, 5)); for (const x of mo.morphs) if (Number.parseInt(x.strongnumberx, 10) === n) { const L = folded(x.lemma); if (L) s.add(L); } return s; };
const headOf = (e, para) => { const b = e.blocks[para]; return b && b.head.headword ? folded(b.head.headword.t) : ""; };
const parasOf = (e, set) => { const out = []; e.blocks.forEach((b, i) => { const L = b.head.headword ? folded(b.head.headword.t) : ""; if (L && set.has(L)) out.push(i); }); return out; };
const ownOfTag = (tag) => { const o = {}; const row = bridge.tags[tag]; for (const id of row ? row.unabridged_bdb_1906.slice(1) : []) { const ps = parasOf(ENTRIES.unabridged_bdb_1906[id], lemmaSet(tag)); if (ps.length) o[id] = ps; } return o; };
const indexBooks = new Map((index.books || []).map((b) => [b.book, b]));
for (const [book] of BOOKS) {
  const zoneFile = join(ZONES, `${book}.bin`); const zone = readZone(zoneFile); const rawZone = readGz(zoneFile);
  const P = openPlaces(join(DIR, "places", `${book}.json.gz`));
  const where0 = `${book}`;
  if (P.doc.zone.sha256 !== zone.sha256) miss("G3", `${book}: the places were made from another zone`);
  const chapters = [...new Set(zone.sections.map((s) => s.ch))];
  const dirOf = join(PAGE, book); const have = existsSync(dirOf) ? readdirSync(dirOf).filter((n) => /^\d+\.json\.gz$/u.test(n)).map((n) => Number(n.split(".")[0])).sort((a, b) => a - b) : [];
  if (!same(have, chapters.slice().sort((a, b) => a - b))) miss("G2", `${book}: its chapter files are ${have.length}, its chapters ${chapters.length}`);
  const ib = indexBooks.get(book); if (!ib || !same(ib.chapters, chapters) || ib.title !== zone.work) miss("G2", `${book}: the index does not list its chapters and its name as the zone has them`);
  const byline = String(rawZone.byline || ""); const cut = byline.indexOf(" · "); const credit = cut >= 0 ? byline.slice(0, cut) : byline;
  const says = {}; for (const sec of rawZone.sections) for (const w of sec.words || []) if (w.mark && w.mark.kind && w.mark.says && !says[w.mark.kind]) says[w.mark.kind] = w.mark.says;
  const unmet = new Map(); for (const i of P.doc.step.unmet || []) { const r = P.stepRow(i); if (!unmet.has(r.verse)) unmet.set(r.verse, []); unmet.get(r.verse).push([r.ref, r.hebrew, r.translation]); }
  const V = { o: VERSES.openscriptures_bdb_1906[book] || {}, b: VERSES.unabridged_bdb_1906[book] || {}, u: VERSES.ubs_sdbh_hebrew_v0_9_2[book] || {} };
  let si = 0;
  for (const ch of chapters) {
    const f = join(dirOf, `${ch}.json.gz`); if (!existsSync(f)) { si += zone.sections.filter((s) => s.ch === ch).length; continue; }
    const doc = readGz(f); counts.chapters += 1;
    if (doc.schema !== CHAPTER_SCHEMA || doc.book !== book || doc.chapter !== ch || doc.title !== zone.work) miss("G3", `${where0} ${ch}: the file's head is not this chapter's`);
    if (doc.credit !== credit || !same(doc.marks, says)) miss("G3", `${where0} ${ch}: the credit line or the marks' words are not the zone's`);
    held.zone += 2 + Object.keys(says).length;
    const secs = zone.sections.filter((s) => s.ch === ch);
    if (secs.length !== (doc.verses || []).length) { miss("G3", `${where0} ${ch}: ${(doc.verses || []).length} verses in the file, ${secs.length} in the zone`); si += secs.length; continue; }
    secs.forEach((sec, vi) => {
      const v = doc.verses[vi]; const at = `${book} ${sec.label}`; counts.verses += 1;
      if (v.l !== sec.label) miss("G3", `${at}: the label is ${v.l}`);
      if (!same(v.un || [], unmet.get(sec.label) || [])) miss("G4", `${at}: STEP's rows no word of ours meets are not the places'`);
      counts.steps_rows_no_word_of_ours_meets += (v.un || []).length; held.step += 3 * (v.un || []).length;
      if (v.e.length !== sec.entries.length) { miss("G3", `${at}: ${v.e.length} entries in the file, ${sec.entries.length} in the zone`); si += 1; return; }
      sec.entries.forEach((en, ei) => {
        const pe = v.e[ei];
        if (en.mark) { counts.marks += 1; held.zone += 2; if (pe.m !== (en.mark === true ? "" : en.mark) || pe.s !== en.s || pe.f) miss("G3", `${at} entry ${ei}: the mark is not the zone's`); return; }
        counts.words += 1; held.zone += 1;
        const W = P.wordAt(si, ei);
        if (pe.i !== ei || pe.s !== en.s || !W || (pe.k || 0) !== KIND.indexOf(W.kind) || !Array.isArray(pe.f) || pe.f.length !== W.forms.length) { miss("G3", `${at} entry ${ei}: the word is not the zone's word with the places' kind and forms`); return; }
        let any = false, very = false, differs = false, notDrawn = false;
        W.forms.forEach((fm, fi) => {
          const pf = pe.f[fi]; const atF = `${at} entry ${ei}${W.forms.length > 1 ? ` form ${fi}` : ""}`; counts.forms += 1;
          if ((pf.r || 0) !== ["plain", "read", "written"].indexOf(fm.role)) miss("G3", `${atF}: the form's role`);
          if (en.forms ? pf.s !== en.forms[fi].s : pf.s !== undefined) miss("G3", `${atF}: the form is not as the zone writes it`); else if (en.forms) held.zone += 1;
          // ---- G4 STEP
          const o = fm.role === "written" ? fm.step.written : fm.step.read; const t = pf.t; const dict = [];
          if (!o) { if (t) miss("G4", `${atF}: STEP is said where the places do not ask it`); }
          else if (!t) miss("G4", `${atF}: STEP's meeting is missing`);
          else {
            if (t.w !== o.way) miss("G4", `${atF}: the way of meeting is ${t.w}, the places' ${o.way}`);
            if (o.way === 0) { if (t.rows || t.p || t.other) miss("G4", `${atF}: rows are said where the places have none`); }
            else {
              if (!same(t.rows, o.rows.map((r) => r.ref))) miss("G4", `${atF}: STEP's rows are not the places'`); held.step += o.rows.length;
              const letters = o.letters === "same" ? undefined : o.letters === "another word" ? 1 : o.letters;
              if (t.l !== letters) miss("G4", `${atF}: the letters named are not the places'`);
              if (!!t.wf !== !!o.onWrittenForm || (t.vn || null) !== (o.verseNumberedOtherwise ? o.rows[0].verse : null)) miss("G4", `${atF}: the written form or the verse's number is not as the places say`);
              if (o.letters === "another word") { if (t.p || !same(t.other, o.parts.map((p) => [p.he, p.en === undefined ? null : p.en]))) miss("G4", `${atF}: where another word stands, STEP's word is not the places'`); held.step += 2 * o.parts.length; }
              else {
                const want = o.parts.map((p) => { const a = [p.en === undefined ? null : p.en, p.tag || null, p.root ? 1 : 0, p.he]; if (p.coversNext) a.push(1); return a; });
                if (!same(t.p, want)) miss("G4", `${atF}: STEP's parts are not the places' (${JSON.stringify(t.p).slice(0, 80)})`); held.step += 3 * o.parts.length; counts.forms_with_steps_parts += 1;
                for (const p of o.parts) if (p.tag && !isStepsOwn(p.tag) && !dict.includes(p.tag)) dict.push(p.tag);
              }
            }
            // ---- G7 the sentences
            const w = meetingWords({ kind: W.kind, role: fm.role, o, R: fm.raw.R, W: fm.raw.W });
            if (!same(t.say || [], w.say) || !!t.d !== w.differs) miss("G7", `${atF}: the sentences are not the rule's for the places' record`);
            counts.sentences += (t.say || []).length; held.sentences += (t.say || []).length; if (t.d) differs = true;
          }
          // ---- G5 MACULA
          const mo = fm.macula; const wantM = mo && mo.way !== 0 ? mo.morphs.map((x) => [x.gloss, x.english, x.text]) : null;
          const another = !!mo && mo.letters === "another word";
          if (!same(another ? pf.mo || null : pf.m || null, wantM) || (another ? pf.m : pf.mo)) miss("G5", `${atF}: MACULA's morphs are not the places'`);
          if (wantM) { held.macula += 3 * wantM.length; if (!another) counts.forms_with_maculas_morphs += 1; }
          // ---- G6 the senses that cite this place, each found again by its address
          const h = pf.h || {}; const stepStands = !!o && o.way !== 0 && o.letters !== "another word"; const hv = stepStands ? o.rows[0].verse : null;
          if (pf.h) any = true;
          const reached = (key) => { const s = new Set(); for (const tag of dict) for (const id of (bridge.tags[tag] || {})[key] ? bridge.tags[tag][key].slice(1) : []) s.add(id); return s; };
          for (const [id, path, label, defs, tag] of h.o || []) {
            counts.here.bdb_open_scriptures_at_the_verse += 1; held.here += 1 + defs.length;
            const e = ENTRIES.openscriptures_bdb_1906[id]; const row = bridge.tags[tag];
            const cited = (V.o[hv] || []).some((x) => x[0] === id && same(x[1], path));
            const mine = []; const seen = new Set(); if (e) for (const df of e.defs || []) { if (path === null ? df.sense : !same(df.sense, path)) continue; if (df.phrase) { if (seen.has(df.phrase.at)) continue; seen.add(df.phrase.at); } mine.push(df.phrase ? df.phrase.t : df.joined ? df.joined.whole : df.t); }
            if (!e || !dict.includes(tag) || !row || !row.openscriptures_bdb_1906.slice(1).includes(id) || !cited || label !== bdbSenseLabel(e, path) || !same(defs, mine)) miss("G6", `${atF}: BDB (Open Scriptures) ${id} is not found again at ${hv} under ${tag} with these words`);
          }
          for (const [id, para, point, sub, lp, ls, its, headword, n, tag] of h.b || []) {
            counts.here.bdb_unabridged_at_the_verse += 1; held.here += 3 + its.length;
            const e = ENTRIES.unabridged_bdb_1906[id]; const row = bridge.tags[tag];
            const cited = (V.b[hv] || []).some((x) => x[0] === id && x[1] === para && x[2] === point && x[3] === sub);
            let okWords = false;
            if (e && e.blocks[para]) { const blk = e.blocks[para]; const pt = point >= 0 ? (blk.points || [])[point] : null; const sb = sub >= 0 ? ((pt || blk.head).sub || [])[sub] : null; const unit = sb || pt || blk.head;
              okWords = (point < 0 || !!pt) && (sub < 0 || !!sb) && lp === (pt ? pt.label || "" : "") && ls === (sb ? sb.label || "" : "") && headword === (blk.head.headword ? blk.head.headword.t : "") && same(its, (unit.italics || []).filter((x) => OPENING_KINDS.includes(x.kind)).slice(0, 3).map((x) => x.t)); }
            if (!e || !dict.includes(tag) || !row || !row.unabridged_bdb_1906.slice(1).includes(id) || n !== row.unabridged_bdb_1906.length - 1 || !cited || !okWords || !(headOf(e, para) && (lemmaSet(tag).has(headOf(e, para)) || maculaSet(tag, mo).has(headOf(e, para))))) miss("G6", `${atF}: BDB (unabridged) ${id} is not found again at ${hv} under ${tag} with these words`);
          }
          // no BDB sense the bridges give for the word is left out
          if (stepStands) {
            const wantO = new Set(), wantB = new Set(); const ro = reached("openscriptures_bdb_1906"), rb = reached("unabridged_bdb_1906");
            for (const x of V.o[hv] || []) if (ro.has(x[0])) wantO.add(`${x[0]}|${x[1] ? x[1].join(".") : ""}`);
            // the unabridged BDB, number by number: a citing paragraph is wanted only where its headword has the lemma's letters
            for (const tag of dict) {
              const ids = new Set((bridge.tags[tag] || { unabridged_bdb_1906: [] }).unabridged_bdb_1906.slice(1)); const seenK = new Set(); const ms = maculaSet(tag, mo), ls = lemmaSet(tag);
              for (const x of V.b[hv] || []) {
                if (!ids.has(x[0])) continue; const k = `${x[0]}|${x[1]}|${x[2]}|${x[3]}`; if (seenK.has(k)) continue; seenK.add(k);
                const L = headOf(ENTRIES.unabridged_bdb_1906[x[0]], x[1]);
                if (L && (ls.has(L) || ms.has(L))) { wantB.add(k); if (!ls.has(L)) counts.headword.unabridged_lines_drawn_by_maculas_lemma_alone += 1; }
                else { counts.headword[ids.size > 1 ? "unabridged_lines_not_drawn_under_a_number_of_several_records" : "unabridged_lines_not_drawn_under_a_number_of_one_record"] += 1; notDrawn = true; }
              }
            }
            const haveO = new Set((h.o || []).map((x) => `${x[0]}|${x[1] ? x[1].join(".") : ""}`)), haveB = new Set((h.b || []).map((x) => `${x[0]}|${x[1]}|${x[2]}|${x[3]}`));
            if (wantO.size !== haveO.size || [...wantO].some((k) => !haveO.has(k)) || wantB.size !== haveB.size || [...wantB].some((k) => !haveB.has(k))) miss("G6", `${atF}: the BDB senses that cite ${hv} under the word's tags are not all said`);
          } else if ((h.o || []).length || (h.b || []).length) miss("G6", `${atF}: BDB is said where STEP's parts do not stand`);
          { // the records that are this word's by MACULA's lemma alone
            const want = []; for (const tag of dict) { const row = bridge.tags[tag]; if (!row) continue; const ms = maculaSet(tag, mo); if (!ms.size) continue; for (const id of row.unabridged_bdb_1906.slice(1)) { const e = ENTRIES.unabridged_bdb_1906[id]; if (!parasOf(e, lemmaSet(tag)).length && parasOf(e, ms).length && !want.includes(id)) want.push(id); } }
            if (!same(pf.ow || [], want)) miss("G6", `${atF}: the records that are this word's by MACULA's lemma alone are not as named`);
            if (pf.ow) counts.headword.forms_with_a_record_by_maculas_lemma_alone += 1; }
          const ubsReached = reached("ubs_sdbh_hebrew_v0_9_2");
          for (const [lexid, how, glosses, morph, n] of h.u || []) {
            counts.here[["ubs_at_this_very_word_by_the_tags_entry", "ubs_at_this_very_word_by_maculas_lemma", "ubs_at_the_verse_another_word_number", "ubs_at_the_verse_no_word_of_maculas"][how]] += 1; if (how < 2) very = true; held.here += 1 + glosses.length;
            const e = ubsEntryOf(lexid); let sense = null; if (e) for (const b of e.BaseForms || []) for (const m of b.LEXMeanings || []) if (m.LEXID === lexid) sense = m;
            const okWords = !!sense && same(glosses, ((sense.LEXSenses || [])[0] || {}).Glosses || []);
            // the verse the citation stands under: MACULA's own number of the word, or STEP's where MACULA has no word
            const mv = how === 3 ? hv : mo && mo.way !== 0 ? (/^\S+ (\d+:\d+)!/u.exec(mo.words[0].ref) || [])[1] : null;
            const cited = (V.u[mv] || []).some((x) => x[0] === lexid && x[1] === n);
            const eid = `${lexid.slice(0, 6)}000000000`;
            const okHow = how === 1 ? !!e && !!mo && mo.morphs.some((x) => x.text === morph && lettersOf(e.Lemma) !== "" && lettersOf(e.Lemma) === lettersOf(x.lemma)) && !ubsReached.has(eid)
              : how === 0 ? ubsReached.has(eid) && !!mo && mo.morphs.some((x) => x.text === morph)
              : how === 2 ? ubsReached.has(eid) && !!mo && mo.way !== 0
              : how === 3 ? ubsReached.has(eid) && (!mo || mo.way === 0) : false;
            if (!okWords || !cited || !okHow) miss("G6", `${atF}: the UBS sense ${lexid} is not found again (${!okWords ? "its words" : !cited ? `the verse ${mv} at word ${n}` : "how it reaches the word"})`);
          }
        });
        if (any) counts.here.words_with_any += 1; if (very) counts.here.words_with_a_ubs_sense_at_this_very_word += 1; if (differs) counts.words_where_the_editions_differ += 1;
        if (notDrawn) counts.headword.words_where_a_line_is_not_drawn += 1;
        { // under each number of the word that reaches several unabridged records: how many are this word's
          const seenT = new Set();
          for (const pf of pe.f) for (const p of (pf.t || {}).p || []) {
            const row = p[1] ? bridge.tags[p[1]] : null; if (!row || row.unabridged_bdb_1906.length < 3 || seenT.has(p[1])) continue; seenT.add(p[1]);
            const mine = new Set(Object.keys(ownOfTag(p[1]))); for (const g of pe.f) for (const id of g.ow || []) if (row.unabridged_bdb_1906.includes(id)) mine.add(id);
            counts.headword.words_under_a_number_of_several_records[mine.size === 1 ? "one_record_is_the_words" : mine.size ? "several_are" : "none_is"] += 1;
          }
        }
      });
      { // G4, the lines under the words of the verse: the reader's rule (its own pieces, signs and joiner), judged over
        // the words a maqaf ties, coded here apart from the projection. A mark ends a run; a pair's other form stands alone.
        const want = new Map();
        const pcs = (f) => { const tx = printedForm(((f.t || {}).p || []).map((p) => (p[0] === null ? "" : p[0])).join("/")); return tx ? tx.split(" + ") : []; };
        const judge = (fs) => { const P2 = fs.map(pcs); const stand = P2.flat().every(signOnly); fs.forEach((f, i) => want.set(f, joinDrawn(stand ? P2[i] : P2[i].map((x) => (signOnly(x) ? SIGN_GAP : x))))); };
        let run = [];
        for (const e of v.e) {
          if (e.m !== undefined) { if (run.length) judge(run); run = []; continue; }
          for (const f of e.f) { if (e.k === 2 || f.r !== 2) run.push(f); else judge([f]); }
          if (!e.s.replace(/[\])]+$/u, "").endsWith("\u05be")) { judge(run); run = []; }
        }
        if (run.length) judge(run);
        for (const e of v.e) for (const f of e.f || []) {
          if (!f.t || !f.t.p) { if (f.t && f.t.g !== undefined) miss("G4", `${book} ${sec.label} entry ${e.i}: a line is carried where STEP's parts do not stand`); continue; }
          const plain = f.t.p.map((p) => (p[0] === null ? "" : p[0].trim())).filter(Boolean).join(" + ");
          if ((f.t.g === undefined ? plain : f.t.g) !== want.get(f) || f.t.g === plain) miss("G4", `${book} ${sec.label} entry ${e.i}: the line under the word is not the reader's line for STEP's parts`);
          if (f.t.g !== undefined) { counts.lines_under_a_word_with_a_sign_hidden += 1; held.step += 1; }
        }
      }
      si += 1;
    });
  }
  counts.books += 1;
}
verdict("G2", "every chapter of every book has its file, and the index lists them", `${counts.books} books, ${N(counts.chapters)} chapters`);
verdict("G3", "every entry of our text stands in its verse in order, as the zone writes it", `${N(counts.verses)} verses, ${N(counts.words)} words, ${N(counts.marks)} marks, ${N(counts.forms)} forms; ${N(held.zone)} strings held to the zones`);
verdict("G4", "every STEP string is the string of the places", `${N(held.step)} strings held; ${N(counts.forms_with_steps_parts)} forms with STEP's parts`);
verdict("G5", "every MACULA string is the string of the places", `${N(held.macula)} strings held; ${N(counts.forms_with_maculas_morphs)} forms with MACULA's morphs`);
verdict("G6", "every sense said to cite a place is found again by its address, and no BDB sense is left out", `${N(held.here)} strings held; UBS at this very word ${N(counts.here.ubs_at_this_very_word_by_the_tags_entry)} by the tag's entry and ${N(counts.here.ubs_at_this_very_word_by_maculas_lemma)} by MACULA's lemma, at the verse ${N(counts.here.ubs_at_the_verse_another_word_number + counts.here.ubs_at_the_verse_no_word_of_maculas)}; BDB ${N(counts.here.bdb_open_scriptures_at_the_verse)} (Open Scriptures) and ${N(counts.here.bdb_unabridged_at_the_verse)} (unabridged)`);
verdict("G7", "the sentences that say how the two editions meet are the rule's for the places' record", `${N(held.sentences)} sentences on ${N(counts.words_where_the_editions_differ)} words where the editions differ and on the verses numbered otherwise`);

// ---- G8 the tags
{
  /** The entry of entries/ with the named keys left out, compared whole with the page's. */
  const sameEntry = (key, got, src) => {
    const rule = LEFT_OUT[key]; const want = {}; for (const k of Object.keys(src)) if (!rule.keys.includes(k)) want[k] = src[k];
    if (key !== "ubs_sdbh_hebrew_v0_9_2") return same(got, want);
    // the UBS dictionary: each sense without its list of verses, and with the count of them
    const strip = (e) => ({ ...e, BaseForms: (e.BaseForms || []).map((b) => ({ ...b, LEXMeanings: (b.LEXMeanings || []).map((m) => { const c = { ...m }; delete c.LEXReferences; delete c.verses_cited; return c; }) })) });
    if (!same(strip(got), strip(want))) return false;
    return (src.BaseForms || []).every((b, bi) => (b.LEXMeanings || []).every((m, mi) => { const g = got.BaseForms[bi].LEXMeanings[mi]; return g.verses_cited === (m.LEXReferences || []).length && g.LEXReferences === undefined; }));
  };
  const seen = new Set(); let files = 0; const entries = Object.fromEntries(DICTIONARIES.map((k) => [k, 0])); let strings = 0;
  const byHead = { a_number_of_one_record: { the_record_is_the_words: { tags: 0, words: 0 }, it_is_not: { tags: 0, words: 0 } }, a_number_of_several_records: { one_record_is_the_words: { tags: 0, words: 0 }, several_are: { tags: 0, words: 0 }, none_is: { tags: 0, words: 0 } } };
  const dirT = join(PAGE, "entries", "t");
  for (const name of existsSync(dirT) ? readdirSync(dirT).sort() : []) {
    const file = name.replace(/\.json\.gz$/u, ""); const F = readGz(join(dirT, name)); files += 1;
    if (F.schema !== TAGS_SCHEMA || F.file !== file) miss("G8", `${name}: its head is not this file's`);
    const named = Object.fromEntries(DICTIONARIES.map((k) => [k, new Set()]));
    for (const [tag, line] of Object.entries(F.tags || {})) {
      if (seen.has(tag)) miss("G8", `${tag} stands in two files`); seen.add(tag);
      const row = bridge.tags[tag];
      if (!row || tagFile(tag) !== file) { miss("G8", `${tag} is no tag of the bridge's, or stands in the wrong file (${file})`); continue; }
      if (!same(line.n, row.n) || !same(line.v, row.v) || !same(Object.keys(line.b), DICTIONARIES) || DICTIONARIES.some((k) => !same(line.b[k], row[k]))) miss("G8", `${tag}: its line is not the bridge's`);
      // the unabridged BDB's records that are the number's by their headword: named on every tag that reaches a record
      if (row.unabridged_bdb_1906.length > 1) {
        const own = ownOfTag(tag); if (!same(line.own, own)) miss("G8", `${tag}: the records named as the number's own by their headword are not the ones the test gives`);
        const n = Object.keys(own).length; const slot = row.unabridged_bdb_1906.length === 2 ? (n ? byHead.a_number_of_one_record.the_record_is_the_words : byHead.a_number_of_one_record.it_is_not) : n === 1 ? byHead.a_number_of_several_records.one_record_is_the_words : n ? byHead.a_number_of_several_records.several_are : byHead.a_number_of_several_records.none_is;
        slot.tags += 1; slot.words += row.n[0];
      } else if (line.own !== undefined) miss("G8", `${tag}: records are named as its own where it reaches none`);
      for (const k of DICTIONARIES) for (const id of row[k].slice(1)) named[k].add(id);
    }
    for (const k of INLINE) {
      const got = (F.entries || {})[k] || {};
      if (!same(Object.keys(got).sort(), [...named[k]].sort())) miss("G8", `${name}: the entries of ${k} beside the tags are not the ones the tags reach`);
      for (const [id, e] of Object.entries(got)) { entries[k] += 1; strings += 1; if (!ENTRIES[k][id] || !sameEntry(k, e, ENTRIES[k][id])) miss("G8", `${name}: ${k} ${id} is not the entry of entries/ with the named keys left out`); }
    }
    const heads = F.unabridged || {};
    if (!same(Object.keys(heads).sort(), [...named.unabridged_bdb_1906].sort())) miss("G8", `${name}: the unabridged BDB's heads beside the tags are not the ones the tags reach`);
    for (const [id, hd] of Object.entries(heads)) { entries.unabridged_bdb_1906 += 1; const e = ENTRIES.unabridged_bdb_1906[id]; if (!e || !same(hd, { strong: e.strong, language: e.language, paragraphs: e.blocks.length, head: e.blocks[0].head })) miss("G8", `${name}: the head of ${id} is not the record's`); }
  }
  for (const tag of Object.keys(bridge.tags)) if (!seen.has(tag)) miss("G8", `${tag} of the bridge stands in no file`);
  const pt = pin.tags || {};
  if (pt.tags !== seen.size || pt.files !== files || !same(pt.entries, entries) || !same(pt.unabridged_by_headword, byHead)) miss("G11", "the tags, their files and the entries beside them, counted again, are not the pin's");
  verdict("G8", "every tag stands in the one file its number names with the bridge's own line, and every entry beside it is the entry of entries/", `${N(seen.size)} tags in ${files} files; entries beside them: ${DICTIONARIES.map((k) => `${k} ${N(entries[k])}`).join(", ")}`);
}

// ---- G9 the unabridged BDB's records
{
  const seen = new Set(); const dirU = join(PAGE, "entries", "u");
  for (const name of existsSync(dirU) ? readdirSync(dirU).sort() : []) {
    const file = name.replace(/\.json\.gz$/u, ""); const F = readGz(join(dirU, name));
    if (F.schema !== UNABRIDGED_SCHEMA || F.file !== file) miss("G9", `${name}: its head is not this file's`);
    for (const [id, e] of Object.entries(F.entries || {})) {
      if (seen.has(id)) miss("G9", `${id} stands in two files`); seen.add(id);
      const src = ENTRIES.unabridged_bdb_1906[id]; if (!src || unabridgedFile(id) !== file) { miss("G9", `${id} is no record of the entries', or stands in the wrong file`); continue; }
      const want = {}; for (const k of Object.keys(src)) if (!LEFT_OUT.unabridged_bdb_1906.keys.includes(k)) want[k] = src[k];
      if (!same(e, want)) miss("G9", `${id} is not the record of entries/ whole`);
    }
  }
  for (const id of Object.keys(ENTRIES.unabridged_bdb_1906)) if (!seen.has(id)) miss("G9", `${id} stands in no file`);
  if (pin.unabridged_records !== seen.size) miss("G11", "the unabridged BDB's records, counted again, are not the pin's");
  verdict("G9", "every record of the unabridged BDB stands whole in the one file its number names", `${N(seen.size)} records`);
}

// ---- G10 the index
{
  if (index.schema !== INDEX_SCHEMA) miss("G10", "the index is not an index of the page's files");
  if (!same(index.how, bridge.how) || !same(index.class_of, bridge.class_of)) miss("G10", "the index's words for how a tag reaches an entry are not the bridge's");
  if (!same(index.dictionaries, DICTIONARIES) || !same(index.left_out, LEFT_OUT)) miss("G10", "the index's dictionaries or the keys left out are not the rule's");
  if ((index.books || []).length !== BOOKS.length || new Set((index.books || []).map((b) => b.book)).size !== BOOKS.length) miss("G10", "the index does not list the 39 books once each");
  const pp = JSON.parse(readFileSync(join(DIR, "places", "PIN.json"), "utf8")), pe = JSON.parse(readFileSync(join(DIR, "entries", "PIN.json"), "utf8"));
  for (const k of ["step_tahot", "macula_hebrew"]) { const s = pp.sources[k], g = (index.sources || {})[k]; if (!g || g.revision !== s.revision || g.license !== s.license || !same(g.files, s.files.map((f) => ({ file: f.name, sha256: f.sha256 })))) miss("G10", `the index's ${k} is not the places' pin's`); }
  for (const k of DICTIONARIES) { const s = pe.sources[k], g = (index.sources || {})[k]; if (!g || g.work !== s.work || !same(g.files, s.files.map((f) => ({ file: f.file, sha256: f.sha256, provider: f.provider, repository: f.repository, revision: f.revision, license: f.license })))) miss("G10", `the index's ${k} is not the entries' pin's`); }
  verdict("G10", "the index says what the bridge and the two parts' pins say", `${(index.books || []).length} books; ${Object.keys(index.sources || {}).length} sources with their files and revisions`);
}

// ---- G11 the counts
if (!same(pin.counts, counts)) miss("G11", `the words, forms and senses, counted again, are not the pin's (${Object.keys(counts).filter((k) => !same(counts[k], (pin.counts || {})[k])).join(", ")})`);
verdict("G11", "the counts, counted again, are the pin's", `${N(counts.words)} words; ${N(counts.here.words_with_any)} with a sense that cites the place, ${N(counts.here.words_with_a_ubs_sense_at_this_very_word)} of them with a UBS sense at the very word`);

console.log(bad ? `\n${bad} FAILED` : "\nthe second reader's files hold");
process.exit(bad ? 1 : 0);
