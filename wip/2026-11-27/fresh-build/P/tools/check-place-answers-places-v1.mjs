#!/usr/bin/env node
// RUN: given
// GUARDS: place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. A check reads the places files, their pin, the zones and
// the two sources' own files, and judges them; it writes nothing.
//
// A READING STANDS AT A WORD ONLY WHERE A SOURCE PUTS IT THERE BY THAT
// SOURCE'S OWN ADDRESS (27 November 2026, the fresh build; the rule is said
// in tools/place-answers-places-v1.mjs and tools/place-answers-meet-v1.mjs).
// data/place-answers-v1/places/ holds, for every word of the 39 books, what
// STEP's word-by-word file and MACULA's table say there. This holds it:
//
//   P1  the pin is a pin of the places; every book's file is the bytes the
//       pin names; the 39 books are all there
//   P2  the sources given on the command line are the files the pin names
//       (STEP's four TAHOT files, MACULA's table), by sha256
//   P3  every word of every book has a record: each zone is the bytes the
//       book's file was made from; every entry of the zone that is not a
//       mark has exactly one record, with the zone's own forms in the zone's
//       order; no mark and no missing entry has one
//   P4  every STEP string is byte for byte a cell of the pinned file: every
//       row of the book in STEP's file stands in the book's file, in order,
//       under its own line number, each of the twelve cells equal
//   P5  every MACULA string is byte for byte a cell of the pinned table,
//       the same way; MACULA's words are cut where its ref changes
//   P6  every meeting says what is true of the bytes: the letters are the
//       same where it says so; the named changes laid on their letters give
//       ours; the cut carried onto our letters counts our letters; a verse
//       numbered otherwise is so; a span on STEP's written form names a
//       «K=» variant; a variant said to write the row in our letters does,
//       and a cut said to be its own is; two words of ours on one of theirs
//       make its letters
//   P7  a book's words meet their rows in order: on each line the rows
//       never run backward
//   P8  every row of STEP's and every word of MACULA's is either met by a
//       word of ours or listed as unmet
//   P9  the counts of each way of meeting, counted again from the records,
//       are the pin's and each file's own
//
// Run: node tools/check-place-answers-places-v1.mjs --step <dir of STEP's files> --macula <macula-hebrew.tsv> [--places data/place-answers-v1/places] [--zones data/zones]
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS, readZone, readTextExact, sha256Of, stepReading, stepVariants, meetLetters } from "./place-answers-sources-v1.mjs";
import { applyChanges, changesFromText, letterChanges, isSpelling } from "./place-answers-meet-v1.mjs";
import { openPlaces, PLACES_RULE_ID, KINDS, ROLES, meetingClass, entryClass } from "./place-answers-places-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const PLACES = arg("places", join(K3, "data", "place-answers-v1", "places")), ZONES = arg("zones", join(K3, "data", "zones"));
const STEP_DIR = arg("step"), MACULA_PATH = arg("macula");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (xs, k = 3) => xs.slice(0, k).join(" · ") + (xs.length > k ? ` · and ${nf(xs.length - k)} more` : "");

if (!existsSync(join(PLACES, "PIN.json"))) { console.log("no pin of the places in this tree: nothing to hold (skipped)"); process.exit(3); }
if (!STEP_DIR || !MACULA_PATH) { console.error("this check reads the sources' own files: --step <dir of STEP's four TAHOT files> --macula <macula-hebrew.tsv>"); process.exit(2); }
const pin = JSON.parse(readFileSync(join(PLACES, "PIN.json"), "utf8"));

// P1
const p1 = [];
if (pin.schema !== "PLACE_ANSWERS_PLACES_PIN_V1" || pin.rule_id !== PLACES_RULE_ID) p1.push("the pin's schema or rule is not the places'");
for (const [slug] of BOOKS) {
  const f = pin.files && pin.files[slug];
  if (!f) { p1.push(`${slug}: not in the pin`); continue; }
  const path = join(PLACES, f.file);
  if (!existsSync(path)) { p1.push(`${slug}: no file`); continue; }
  const buf = readFileSync(path);
  if (buf.length !== f.bytes || sha256Of(buf) !== f.sha256) p1.push(`${slug}: the file is not the bytes the pin names`);
}
check("P1 the pin is a pin of the places, and every book's file is the bytes it names", !p1.length, p1.length ? first(p1) : `${Object.keys(pin.files).length} books, ${nf(pin.counts.bytes)} bytes`);

// P2
const p2 = []; const stepFiles = new Map();
for (const f of pin.sources.step_tahot.files) {
  const path = join(STEP_DIR, f.name);
  if (!existsSync(path)) { p2.push(`${f.name}: not in ${STEP_DIR}`); continue; }
  const t = readTextExact(path);
  if (t.sha256 !== f.sha256 || t.bytes !== f.bytes) p2.push(`${f.name}: sha256 ${t.sha256.slice(0, 12)}…, the pin names ${f.sha256.slice(0, 12)}…`);
  stepFiles.set(f.name, t.text.split("\n"));
}
let maculaLines = null;
{
  const f = pin.sources.macula_hebrew.files[0];
  if (!existsSync(MACULA_PATH)) p2.push(`${MACULA_PATH}: no such file`);
  else { const t = readTextExact(MACULA_PATH); if (t.sha256 !== f.sha256 || t.bytes !== f.bytes) p2.push(`MACULA's table: sha256 ${t.sha256.slice(0, 12)}…, the pin names ${f.sha256.slice(0, 12)}…`); maculaLines = t.text.split("\n"); }
}
check("P2 the sources given are the files the pin names", !p2.length, p2.length ? first(p2) : `STEP's four files at ${String(pin.sources.step_tahot.revision).slice(0, 8)}, MACULA's table at ${String(pin.sources.macula_hebrew.revision).slice(0, 8)}`);
if (p2.length) { console.log("\nthe byte checks cannot run on other files than the pin's"); process.exit(1); }

// the rows of each book in the sources' own files, by line
const STEP_REF = /^([1-3]?[A-Z][a-z]{1,2})\.(\d+)\.(\d+)(?:\((\d+)\.(\d+)\))?#(\d+)=(.+)$/;
const stepLinesOf = new Map(); // code → [{file, line}]
for (const [name, lines] of stepFiles) lines.forEach((line, i) => {
  if (!line || line.indexOf("\t") < 0) return;
  const m = STEP_REF.exec(line.slice(0, line.indexOf("\t"))); if (!m) return;
  if (!stepLinesOf.has(m[1])) stepLinesOf.set(m[1], []);
  stepLinesOf.get(m[1]).push({ name, line: i + 1 });
});
const macHead = maculaLines[0].split("\t"); const macRef = macHead.indexOf("ref");
const macLinesOf = new Map();
for (let i = 1; i < maculaLines.length; i += 1) { if (!maculaLines[i]) continue; const ref = maculaLines[i].split("\t")[macRef]; const code = ref.slice(0, ref.indexOf(" ")); if (!macLinesOf.has(code)) macLinesOf.set(code, []); macLinesOf.get(code).push(i + 1); }

const p3 = [], p4 = [], p5 = [], p6 = [], p7 = [], p8 = [], p9 = [];
const tally = { words: 0, kinds: {}, step: {}, macula: {}, entries: {}, stepRows: 0, macRows: 0, stepCells: 0, macCells: 0, meetings: 0, withStep: 0, withMacula: 0, withNeither: 0 };
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };

for (const [slug, code, mcode] of BOOKS) {
  const f = pin.files && pin.files[slug]; if (!f || !existsSync(join(PLACES, f.file))) continue;
  const P = openPlaces(join(PLACES, f.file)); const doc = P.doc;
  const zone = readZone(join(ZONES, `${slug}.bin`));
  // P3
  if (zone.sha256 !== doc.zone.sha256) p3.push(`${slug}: the zone is not the bytes the file was made from`);
  if (doc.sections.length !== zone.sections.length) p3.push(`${slug}: ${doc.sections.length} sections, the zone has ${zone.sections.length}`);
  const forms = []; // every form with its text, for P6
  zone.sections.forEach((sec, si) => {
    const recs = new Map((doc.sections[si] || []).map((r) => [r[0], r]));
    if (recs.size !== (doc.sections[si] || []).length) p3.push(`${slug} ${sec.label}: an entry with two records`);
    sec.entries.forEach((e, ei) => {
      const rec = recs.get(ei);
      if (e.mark) { if (rec) p3.push(`${slug} ${sec.label} entry ${ei}: a mark has a record`); return; }
      if (!rec) { p3.push(`${slug} ${sec.label} entry ${ei}: a word has no record`); return; }
      recs.delete(ei); tally.words += 1;
      const fs = e.forms ? e.forms : [{ s: e.s, role: "plain" }];
      const hasR = fs.some((x) => x.role === "read"), hasW = fs.some((x) => x.role === "written");
      const kind = !e.forms ? 0 : hasR && hasW ? 1 : hasW ? 2 : 3;
      if (rec[1] !== kind) p3.push(`${slug} ${sec.label} entry ${ei}: kind ${KINDS[rec[1]]}, the zone's word is ${KINDS[kind]}`);
      if (rec[2].length !== fs.length || rec[2].some((x, k) => ROLES[x[0]] !== fs[k].role)) { p3.push(`${slug} ${sec.label} entry ${ei}: the forms are not the zone's`); return; }
      bump(tally.kinds, KINDS[kind]); bump(tally.entries, entryClass(kind, rec[2]));
      let hasStep = false, hasMac = false;
      rec[2].forEach((x, k) => {
        forms.push({ si, ei, k, label: sec.label, role: fs[k].role, kind, s: fs[k].s, letters: meetLetters(fs[k].s), R: x[1], W: x[2], M: x[3] });
        const asked = { R: fs[k].role !== "written", W: fs[k].role === "written", M: fs[k].role !== "written" || kind === 2 };
        if (asked.R !== (x[1] !== null && x[1] !== undefined)) p3.push(`${slug} ${sec.label} entry ${ei}: the read line is asked of the wrong form`);
        if (asked.W && !x[2]) p3.push(`${slug} ${sec.label} entry ${ei}: a written form with no written-line meeting`);
        if (!asked.W && x[2] && fs[k].role !== "plain") p3.push(`${slug} ${sec.label} entry ${ei}: a read form with a written-line meeting`);
        if (asked.M !== (x[3] !== null && x[3] !== undefined)) p3.push(`${slug} ${sec.label} entry ${ei}: MACULA is asked of the wrong form`);
        for (const [m, src, line] of [[x[1], "step", "read line"], [x[2], "step", "written line"], [x[3], "macula", ""]]) {
          if (!m) continue;
          bump(tally[src], `${fs[k].role}${line ? ` | ${line}` : ""} | ${meetingClass(m)}`);
          if (m[0] !== 0 && m[1] !== 1) { if (src === "step") hasStep = true; else hasMac = true; }
        }
      });
      if (hasStep) tally.withStep += 1; if (hasMac) tally.withMacula += 1; if (!hasStep && !hasMac) tally.withNeither += 1;
    });
    for (const ei of recs.keys()) p3.push(`${slug} ${sec.label} entry ${ei}: a record for an entry the zone does not have`);
  });

  // P4
  const lines = stepFiles.get(doc.step.file); const want = stepLinesOf.get(code) || [];
  if (!lines) p4.push(`${slug}: STEP's file ${doc.step.file} is not one of the pin's`);
  else {
    if (want.length !== doc.step.rows || want.some((w) => w.name !== doc.step.file)) p4.push(`${slug}: ${doc.step.rows} rows, STEP's file has ${want.length} for ${code}`);
    for (let i = 0; i < doc.step.rows; i += 1) {
      if (!want[i] || want[i].line !== doc.step.line[i]) { p4.push(`${slug} row ${i}: line ${doc.step.line[i]}, STEP's row ${i} of ${code} stands at line ${want[i] && want[i].line}`); break; }
      const src = lines[doc.step.line[i] - 1].split("\t"); const got = P.stepCells(i);
      for (let c = 0; c < 12; c += 1) { tally.stepCells += 1; if (got[c] !== (src[c] === undefined ? "" : src[c])) { p4.push(`${slug} line ${doc.step.line[i]} column ${doc.step.columns[c]}: «${got[c]}» is not the file's «${src[c]}»`); } }
      for (let c = 12; c < src.length; c += 1) if (src[c] !== "") p4.push(`${slug} line ${doc.step.line[i]}: STEP's file holds a cell past the twelfth that the book's file does not`);
    }
    tally.stepRows += doc.step.rows;
  }
  // P5
  {
    const wantM = macLinesOf.get(mcode) || [];
    if (wantM.length !== doc.macula.rows) p5.push(`${slug}: ${doc.macula.rows} morph rows, MACULA's table has ${wantM.length} for ${mcode}`);
    if (JSON.stringify(doc.macula.columns) !== JSON.stringify(macHead)) p5.push(`${slug}: the columns are not the table's heading`);
    let w = 0, lastRef = null;
    for (let i = 0; i < doc.macula.rows; i += 1) {
      if (wantM[i] !== doc.macula.line[i]) { p5.push(`${slug} morph row ${i}: line ${doc.macula.line[i]}, the table's stands at line ${wantM[i]}`); break; }
      const src = maculaLines[doc.macula.line[i] - 1].split("\t"); const got = P.maculaCells(i);
      if (src.length !== got.length) p5.push(`${slug} line ${doc.macula.line[i]}: ${got.length} cells, the table's line has ${src.length}`);
      for (let c = 0; c < got.length; c += 1) { tally.macCells += 1; if (got[c] !== src[c]) p5.push(`${slug} line ${doc.macula.line[i]} column ${macHead[c]}: «${got[c]}» is not the table's «${src[c]}»`); }
      if (got[macRef] !== lastRef) { if (doc.macula.words[w] !== i) p5.push(`${slug} morph row ${i}: MACULA's word begins here (${got[macRef]}) and the file's word ${w} does not`); w += 1; lastRef = got[macRef]; }
    }
    if (doc.macula.words.length !== w + 1 || doc.macula.words[w] !== doc.macula.rows) p5.push(`${slug}: the list of MACULA's words does not end at its last row`);
    tally.macRows += doc.macula.rows;
  }

  // P6, P7, P8
  const stepMet = new Uint8Array(doc.step.rows), macMet = new Uint8Array(doc.macula.words.length - 1);
  const sharedGroups = new Map();
  const judge = (F, m, src, line) => {
    if (!m || m[0] === 0) return;
    tally.meetings += 1;
    const [way, letters, spans, cut, share, verse, alike, cutOf] = m; const where = `${slug} ${F.label} entry ${F.ei} (${src}${line ? " " + line : ""})`;
    const list = [].concat(spans); const theirParts = []; let otherVerse = false; const keys = new Set();
    for (const sp of list) {
      const key = Array.isArray(sp) ? sp[0] : sp;
      if (src === "step") {
        if (!(key >= 0 && key < doc.step.rows)) { p6.push(`${where}: a row that is not there`); return; }
        stepMet[key] = 1; const row = P.stepRow(key); let reading = row.reading;
        if (Array.isArray(sp) && sp.length === 4) { const v = row.variants[sp[3]]; if (!v || v.who !== "K" || !v.hebrew) { p6.push(`${where}: the variant named is not a «K=» variant with Hebrew`); return; } reading = stepReading(v.hebrew, v.english, v.tags, v.grammar); keys.add(`${key}/K`); } else keys.add(`${key}`);
        if (!reading) { p6.push(`${where}: the row has no Hebrew to meet`); return; }
        const flat = []; for (const w of reading.words) for (const p of w.parts) flat.push(p.letters);
        const from = Array.isArray(sp) ? sp[1] : 0, to = Array.isArray(sp) ? sp[2] : flat.length;
        if (!(from >= 0 && to <= flat.length && from < to)) { p6.push(`${where}: parts ${from}..${to} of a reading of ${flat.length}`); return; }
        for (let k = from; k < to; k += 1) theirParts.push(meetLetters(flat[k]));
        if (row.verse !== F.label) otherVerse = true;
        if (way === 4 && !(reading.words.length > 1 && reading.words.some((w) => w.from === from && w.to === to))) p6.push(`${where}: said to be one word of a row that holds several, and the span is not one of its words`);
        if (way === 1 && !(from === 0 && to === flat.length && reading.words.length === 1)) p6.push(`${where}: said to be one for one, and the span is not the whole of a one-word reading`);
        if (way === 3 && !(reading.words.length > 1 && from === 0 && to === flat.length)) p6.push(`${where}: said to be one row marked as two words, and it is not the whole of such a row`);
      } else {
        if (!(key >= 0 && key < doc.macula.words.length - 1)) { p6.push(`${where}: a word of MACULA's that is not there`); return; }
        macMet[key] = 1; const w = P.maculaWord(key); keys.add(`${key}`);
        const from = Array.isArray(sp) ? sp[1] : 0, to = Array.isArray(sp) ? sp[2] : w.rows.length;
        if (!(from >= 0 && to <= w.rows.length && from < to)) { p6.push(`${where}: morphs ${from}..${to} of a word of ${w.rows.length}`); return; }
        for (let k = from; k < to; k += 1) theirParts.push(meetLetters(w.rows[k].text));
        const mm = /^\S+ (\d+):(\d+)!/.exec(w.ref); if (`${mm[1]}:${mm[2]}` !== F.label) otherVerse = true;
      }
    }
    if (alike || cutOf) {
      // a variant said to write the row in our letters must do so; a cut said to be a variant's must be that variant's
      if (src !== "step" || way !== 1 || letters === 0 || typeof spans !== "number") p6.push(`${where}: variants with our letters are named where they cannot be`);
      else {
        const row = P.stepRow(spans);
        for (const vi of alike || []) { const v = row.variants[vi]; const rd = v && v.hebrew ? stepReading(v.hebrew, v.english, v.tags, v.grammar) : null; if (!rd || meetLetters(rd.words.map((w) => w.letters).join("")) !== F.letters) p6.push(`${where}: variant ${vi} is said to have our letters and has not`); }
        if (cutOf) { const v = row.variants[cutOf - 1]; const rd = v && v.hebrew ? stepReading(v.hebrew, v.english, v.tags, v.grammar) : null; const lens = []; if (rd) for (const w of rd.words) for (const q of w.parts) lens.push(Array.from(meetLetters(q.letters)).length); if (!rd || !(alike || []).includes(cutOf - 1) || rd.parts !== row.reading.parts || JSON.stringify(lens) !== JSON.stringify(cut)) p6.push(`${where}: the cut is said to be variant ${cutOf - 1}'s own and is not`); }
      }
    }
    if (!!verse !== otherVerse) p6.push(`${where}: the verse is ${otherVerse ? "" : "not "}numbered otherwise, and the record says the opposite`);
    if (way === 2 && keys.size < 2) p6.push(`${where}: said to be two rows, and the spans are one row`);
    const theirs = theirParts.join("");
    if (way >= 5) {
      // two or three of ours on one of theirs: gathered and judged together below
      const gk = `${src}|${line}|${JSON.stringify(list.map((sp) => (Array.isArray(sp) ? [sp[0], sp[3] === undefined ? -1 : sp[3]] : [sp, -1])))}`;
      if (!sharedGroups.has(gk)) sharedGroups.set(gk, []);
      sharedGroups.get(gk).push({ F, m, where, theirs, src, key: list.map((sp) => (Array.isArray(sp) ? sp[0] : sp))[0] });
      if (way === 5 && !(letters === 0 && cut === 0 && F.letters === theirs)) p6.push(`${where}: said to be parted at their part cut, and its letters are not the letters of its parts`);
      if (way === 6 && cut !== -2) p6.push(`${where}: a shared word whose cut is not said to be shared`);
      return;
    }
    if (letters === 0) { if (F.letters !== theirs) p6.push(`${where}: said to be the same letters: ours ${F.letters}, theirs ${theirs}`); if (cut !== 0) p6.push(`${where}: the same letters and a cut that is not theirs as it stands`); return; }
    if (letters === 1) { const ch = letterChanges(F.letters, theirs); if (F.letters === theirs || isSpelling(ch.distance, F.letters, theirs)) p6.push(`${where}: said to be another word, and it is the same or a spelling`); if (cut !== -1) p6.push(`${where}: another word with a cut`); return; }
    let made = null; try { made = applyChanges(theirs, changesFromText(letters)); } catch (e) { made = null; }
    if (made !== F.letters) { p6.push(`${where}: the named changes ${letters} laid on ${theirs} do not give ${F.letters}`); return; }
    if (Array.isArray(cut)) { if (cut.length !== theirParts.length || cut.reduce((a, b) => a + b, 0) !== Array.from(F.letters).length || cut.some((n) => n <= 0 && theirParts.length === cut.length && n < 0)) p6.push(`${where}: the cut ${cut.join("+")} does not count our ${Array.from(F.letters).length} letters over their ${theirParts.length} parts`); } else if (cut !== -1) p6.push(`${where}: spelled otherwise, and the cut is neither carried nor said not to be`);
  };
  for (const F of forms) { judge(F, F.R, "step", "read line"); judge(F, F.W, "step", "written line"); judge(F, F.M, "macula", ""); }
  for (const [gk, members] of sharedGroups) {
    // members stand in the book's order; cut them into runs by their share number
    let run = [];
    const close = () => {
      if (!run.length) return;
      const way = run[0].m[0], letters = run[0].m[1];
      const ours = run.map((x) => x.F.letters).join("");
      let theirs;
      if (way === 5) theirs = run.map((x) => x.theirs).join("");
      else {
        // a shared word of theirs: its letters are those of the union of the members' part ranges
        const src = run[0].src, sp0 = [].concat(run[0].m[2])[0];
        const key = Array.isArray(sp0) ? sp0[0] : sp0; let flat;
        if (src === "step") { const row = P.stepRow(key); let reading = row.reading; if (Array.isArray(sp0) && sp0.length === 4) { const v = row.variants[sp0[3]]; reading = stepReading(v.hebrew, v.english, v.tags, v.grammar); } flat = []; for (const w of reading.words) for (const p of w.parts) flat.push(meetLetters(p.letters)); } else flat = P.maculaWord(key).rows.map((r) => meetLetters(r.text));
        let lo = Infinity, hi = -1;
        for (const x of run) { const sp = [].concat(x.m[2])[0]; const from = Array.isArray(sp) ? sp[1] : 0, to = Array.isArray(sp) ? sp[2] : flat.length; lo = Math.min(lo, from); hi = Math.max(hi, to); }
        theirs = flat.slice(lo, hi).join("");
      }
      if (run.length < 2) p6.push(`${run[0].where}: said to share a word of theirs with a neighbor, and no neighbor shares it`);
      else if (letters === 0 ? ours !== theirs : (() => { try { return applyChanges(theirs, changesFromText(letters)) !== ours; } catch (e) { return true; } })()) p6.push(`${run[0].where}: ${run.length} words of ours (${ours}) do not make their word (${theirs})`);
      run = [];
    };
    for (const x of members) { const share = x.m[4] || 0; if (share === 0) close(); else if (!run.length || share !== run.length) { p6.push(`${x.where}: a share number out of order`); } run.push(x); }
    close();
  }
  // P7: on each line the rows never run backward
  for (const [name, pick, src] of [["read line", (F) => (F.role !== "written" ? F.R : null), "step"], ["written line", (F) => (F.role === "written" ? F.W : null), "step"], ["MACULA", (F) => F.M, "macula"]]) {
    let last = -1, lastPart = -1;
    for (const F of forms) {
      const m = pick(F); if (!m || m[0] === 0) continue;
      const list = [].concat(m[2]);
      const firstKey = Array.isArray(list[0]) ? list[0][0] : list[0], lastKey = Array.isArray(list[list.length - 1]) ? list[list.length - 1][0] : list[list.length - 1];
      if (firstKey < last) { p7.push(`${slug} ${F.label} entry ${F.ei} (${name}): meets ${src === "step" ? "row" : "word"} ${firstKey} after ${last}`); }
      last = Math.max(last, lastKey);
    }
  }
  // P8
  const unmetS = new Set(doc.step.unmet), unmetM = new Set(doc.macula.unmet);
  for (let i = 0; i < doc.step.rows; i += 1) if (!!stepMet[i] === unmetS.has(i)) { p8.push(`${slug}: STEP's row ${i} (${P.stepCells(i)[0]}) is ${stepMet[i] ? "met and listed as unmet" : "neither met nor listed"}`); }
  for (let i = 0; i < doc.macula.words.length - 1; i += 1) if (!!macMet[i] === unmetM.has(i)) { p8.push(`${slug}: MACULA's word ${i} is ${macMet[i] ? "met and listed as unmet" : "neither met nor listed"}`); }
  // P9, the book's own counts
  if (doc.counts.words !== forms.reduce((a, F) => a + (F.k === 0 ? 1 : 0), 0)) p9.push(`${slug}: the file counts ${doc.counts.words} words`);
}

check("P3 every word of every book has a record, with the zone's own forms", !p3.length, p3.length ? first(p3) : `${nf(tally.words)} words; ${Object.entries(tally.kinds).map(([k, n]) => `${k} ${nf(n)}`).join(", ")}`);
check("P4 every STEP string is byte for byte a cell of the pinned file", !p4.length, p4.length ? first(p4) : `${nf(tally.stepRows)} rows, ${nf(tally.stepCells)} cells`);
check("P5 every MACULA string is byte for byte a cell of the pinned table", !p5.length, p5.length ? first(p5) : `${nf(tally.macRows)} morph rows, ${nf(tally.macCells)} cells`);
check("P6 every meeting says what is true of the bytes", !p6.length, p6.length ? first(p6, 6) : `${nf(tally.meetings)} meetings judged`);
check("P7 a book's words meet their rows in order", !p7.length, p7.length ? first(p7) : "");
check("P8 every row of STEP's and every word of MACULA's is met or listed as unmet", !p8.length, p8.length ? first(p8) : "");
const same = (a, b) => JSON.stringify(Object.entries(a || {}).sort()) === JSON.stringify(Object.entries(b || {}).sort());
if (pin.counts.words !== tally.words) p9.push(`the pin counts ${pin.counts.words} words, the records ${tally.words}`);
if (!same(pin.counts.kinds, tally.kinds)) p9.push("the pin's kinds are not the records'");
if (!same(pin.counts.words_by_how_the_editions_meet, tally.entries)) p9.push("the pin's counts of how the editions meet are not the records'");
if (!same(pin.counts.step_meetings_by_form, tally.step)) p9.push("the pin's counts of STEP's meetings are not the records'");
if (!same(pin.counts.macula_meetings_by_form, tally.macula)) p9.push("the pin's counts of MACULA's meetings are not the records'");
if (pin.counts.words_with_steps_parts !== tally.withStep || pin.counts.words_with_maculas_morphs !== tally.withMacula || pin.counts.words_with_neither !== tally.withNeither) p9.push("the pin's counts of words with STEP's parts, with MACULA's morphs, with neither are not the records'");
if (pin.counts.step_rows !== tally.stepRows || pin.counts.macula_morph_rows !== tally.macRows) p9.push("the pin's counts of rows are not the files'");
check("P9 the counts of each way of meeting are the pin's and each file's own", !p9.length, p9.length ? first(p9) : `${Object.keys(tally.entries).length} ways among the words; with STEP's parts ${nf(tally.withStep)}, with MACULA's morphs ${nf(tally.withMacula)}, with neither ${nf(tally.withNeither)}`);
console.log(bad ? `\n${bad} law(s) broken` : "\nthe places hold");
process.exit(bad ? 1 : 0);
