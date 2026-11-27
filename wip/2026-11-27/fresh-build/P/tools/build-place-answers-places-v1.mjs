#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It reads our zones, STEP's four TAHOT files and MACULA's
// table, and writes data/place-answers-v1/places/: for every word of the 39
// books, what the two sources that read the Bible word by word say there,
// each by its own address. It reads nothing else: not the store, not the
// lattices, not a bridge list, not the reading a zone carries.
//
// WHAT IT MAKES (27 November 2026, the fresh build; the frame is
// wip/2026-11-27/fresh-build/FRAME.md, the layers wip/2026-11-27/THE-LAYERS.md).
//
//   places/<book>.json.gz   one record for every word of the book as our
//                           text writes it, addressed by section index and
//                           entry index; STEP's rows of the book, every cell
//                           whole; MACULA's morph rows of the book, every
//                           cell whole; the shape, said in the file's head
//   places/PIN.json         the source files (provider, revision, bytes,
//                           sha256), the rule in words, the counts
//
// THE RULE. A reading stands at a word only where a source puts it there by
// the source's own address. Our text and STEP's (and MACULA's) are two
// editions of the same verses; a word of ours meets a row of theirs by its
// place in the verse (tools/place-answers-meet-v1.mjs says how), and the
// record names the meeting: one for one, one for two, two for one; the same
// letters, or the letters by which the spelling differs; a verse numbered
// otherwise; a word written one way and read another, each form with the
// reading STEP gives for it; another word; no row. A source's cells are
// copied, never cut, joined or respelled: the cut of a row into parts is
// read from the cells by the reader (tools/place-answers-places-v1.mjs), by
// STEP's own marks.
//
// GIVEN A NEWER FILE of a source the same command makes the same output for
// it: point --step or --macula at it and name its revision.
//
// Run: node tools/build-place-answers-places-v1.mjs --step <dir of STEP's files> --step-revision <id>
//        --macula <macula-hebrew.tsv> --macula-revision <id> [--zones data/zones] [--out data/place-answers-v1/places]
//        [--only genesis,ruth] [--table <tsv of every meeting that is not plain>]
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS, readZone, readTahot, readMacula, stepReading, stepVariants, meetLetters, STEP_COLUMNS, sha256Of } from "./place-answers-sources-v1.mjs";
import { meetLines, letterChanges, changesText, isSpelling, carryCut } from "./place-answers-meet-v1.mjs";
import { PLACES_SCHEMA, PLACES_RULE_ID, PLACES_RULE, WAYS, KINDS, ROLES, SHAPE_WORDS, meetingClass, entryClass } from "./place-answers-places-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones")), OUT = arg("out", join(K3, "data", "place-answers-v1", "places"));
const STEP_DIR = arg("step"), STEP_REV = arg("step-revision", ""), MACULA_PATH = arg("macula"), MACULA_REV = arg("macula-revision", "");
const ONLY = arg("only") ? arg("only").split(",") : null, TABLE = arg("table");
if (!STEP_DIR || !MACULA_PATH) { console.error("usage: --step <dir> --step-revision <id> --macula <tsv> --macula-revision <id>"); process.exit(2); }
const nf = (x) => Number(x).toLocaleString("en-US");

const tahot = readTahot(STEP_DIR);
if (tahot.odd.length || tahot.extraCells) { console.error(`STEP's files hold lines this tool cannot read as rows: ${tahot.odd.slice(0, 5).join(" · ")}; cells past the twelfth: ${tahot.extraCells}`); process.exit(1); }
const macula = readMacula(MACULA_PATH);
if (macula.odd.length) { console.error(`MACULA's table holds lines this tool cannot read: ${macula.odd.slice(0, 5).join(" · ")}`); process.exit(1); }
const iMacText = macula.columns.indexOf("text");

/** One meeting of a line, turned into what each of our forms is told.
 *  `unitOf(j)` describes their word j: { key, from, to, total, variant,
 *  several, partLetters } (its row or MACULA word; the parts it takes of the
 *  reading; whether the reading holds several words). */
function meetingsOf(M, O, T, unitOf, verseOfT) {
  const out = new Map();
  for (const G of M.groups) {
    if (!G.a.length) continue;
    if (!G.b.length) { for (const i of G.a) out.set(i, { way: 0 }); continue; }
    const units = G.b.map(unitOf);
    const o = G.a.map((i) => O[i].letters).join(""), t = units.map((u) => u.partLetters.join("")).join("");
    let letters = 0, ops = null;
    if (o !== t) { const ch = letterChanges(o, t); ops = ch.ops; letters = isSpelling(ch.distance, o, t) ? changesText(ch.ops) : 1; }
    const otherVerse = G.a.some((i) => G.b.some((j) => O[i].verse !== verseOfT(j)));
    const spanOf = (u, from = u.from, to = u.to) => (from === 0 && to === u.total && u.variant < 0 ? u.key : u.variant < 0 ? [u.key, from, to] : [u.key, from, to, u.variant]);
    if (G.a.length === 1) {
      const partLens = []; for (const u of units) for (const L of u.partLetters) partLens.push(Array.from(L).length);
      let cut = 0;
      if (letters === 1) cut = -1; else if (letters !== 0) cut = carryCut(o, t, ops, partLens) || -1;
      const keys = new Set(units.map((u) => `${u.key}/${u.variant}`));
      let way;
      if (units.length === 1) way = units[0].several ? 4 : 1;
      else way = keys.size === 1 ? 3 : 2;
      // the words of one row taken together are one span of that row
      const spans = keys.size === 1 && units.length > 1 ? [spanOf(units[0], units[0].from, units[units.length - 1].to)] : units.map((u) => spanOf(u));
      out.set(G.a[0], { way, letters, spans: spans.length === 1 && typeof spans[0] === "number" ? spans[0] : spans, cut, otherVerse, pass: G.pass });
      continue;
    }
    // two or three of ours for one of theirs
    const u = units[0]; const lens = u.partLetters.map((L) => Array.from(L).length);
    const bounds = [0]; for (const L of lens) bounds.push(bounds[bounds.length - 1] + L);
    let at = 0; const shares = []; let divided = o === t && units.length === 1;
    for (const i of G.a) {
      const s = at, e = at + Array.from(O[i].letters).length; at = e;
      if (o === t && units.length === 1) {
        let pf = bounds.findIndex((b, k) => k < lens.length && bounds[k + 1] > s), pt = pf;
        while (pt < lens.length && bounds[pt] < e) pt += 1;
        if (!bounds.includes(s) || !bounds.includes(e)) divided = false;
        shares.push([pf, pt]);
      } else shares.push([0, lens.length]);
    }
    G.a.forEach((i, k) => {
      const [pf, pt] = shares[k];
      const sp = spanOf(u, u.from + pf, u.from + pt);
      out.set(i, { way: divided ? 5 : 6, letters, spans: typeof sp === "number" ? sp : [sp], cut: divided ? 0 : -2, share: [k, G.a.length], otherVerse, pass: G.pass });
    });
  }
  return out;
}
const packMeeting = (m) => {
  if (!m) return null;
  if (m.way === 0) return [0];
  const a = [m.way, m.letters, m.spans, m.cut, m.share ? m.share[0] : 0, m.otherVerse ? 1 : 0, m.alike && m.alike.length ? m.alike : 0, m.cutOf || 0];
  while (a.length > 4 && a[a.length - 1] === 0) a.pop();
  return a;
};

const totals = { words: 0, kinds: {}, step: {}, macula: {}, entries: {}, seams: {}, alike: {}, cutOf: {}, cutDisagrees: [], withStep: 0, withMacula: 0, withNeither: 0, neither: [], stepRows: 0, maculaRows: 0, maculaWords: 0, stepUnmet: {}, maculaUnmet: 0, bytes: 0, anchored: { step_read: 0, step_written: 0, macula: 0 }, verses: 0, regions: { step_read: 0, step_written: 0, macula: 0 }, plainLineDiffers: [] };
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const table = [];
const pinBooks = {};
mkdirSync(OUT, { recursive: true });

for (const [slug, code, mcode] of BOOKS) {
  if (ONLY && !ONLY.includes(slug)) continue;
  const zone = readZone(join(ZONES, `${slug}.bin`));
  const rows = tahot.books.get(code) || [], mwords = macula.books.get(mcode) || [];
  if (!rows.length || !mwords.length) { console.error(`${slug}: no rows of STEP's (${rows.length}) or no words of MACULA's (${mwords.length})`); process.exit(1); }

  // our words and their forms
  const entries = []; const forms = [];
  zone.sections.forEach((sec, si) => sec.entries.forEach((e, ei) => {
    if (e.mark) return;
    const fs = e.forms ? e.forms : [{ s: e.s, role: "plain" }];
    const hasR = fs.some((f) => f.role === "read"), hasW = fs.some((f) => f.role === "written");
    const kind = !e.forms ? 0 : hasR && hasW ? 1 : hasW ? 2 : 3;
    const ent = { si, ei, kind, forms: [] };
    fs.forEach((f, fi) => {
      const letters = meetLetters(f.s);
      if (!letters) { console.error(`${slug} ${sec.label} entry ${ei}: a word with no letter`); process.exit(1); }
      const F = { si, ei, fi, role: f.role, s: f.s, letters, verse: sec.label, kind, R: null, W: null, M: null };
      ent.forms.push(F); forms.push(F);
    });
    entries.push(ent);
  }));

  // STEP's rows: the reading of each row, and of its written form where the variants give one («K=»)
  const info = rows.map((r) => {
    const c = r.cells;
    const main = c[1] === "" ? null : stepReading(c[1], c[3], c[4], c[5]);
    if (main && !main.regular) { console.error(`${c[0]}: STEP's four cells do not cut into the same number of pieces`); process.exit(1); }
    const vars = stepVariants(c[6], c[7]);
    if (vars.some((v) => v.kind === "unread")) { console.error(`${c[0]}: a variant this tool cannot read`); process.exit(1); }
    const kv = vars.findIndex((v) => v.who === "K");
    const written = kv >= 0 && vars[kv].hebrew ? stepReading(vars[kv].hebrew, vars[kv].english, vars[kv].tags, vars[kv].grammar) : null;
    return { main, vars, kv, written, light: r.type === "X" || r.type === "R", verse: `${r.hch}:${r.hvs}` };
  });
  const readT = [], writT = [];
  rows.forEach((r, ri) => {
    const I = info[ri];
    const push = (list, reading, variant) => reading.words.forEach((w, k) => {
      const L = meetLetters(w.letters); if (!L) return;
      list.push({ ri, k, variant, letters: L, verse: I.verse, light: I.light, unit: { key: ri, from: w.from, to: w.to, total: reading.parts, variant, several: reading.words.length > 1, partLetters: w.parts.map((p) => meetLetters(p.letters)) } });
    });
    if (I.main) push(readT, I.main, -1);
    if (I.written) push(writT, I.written, I.kv); else if (I.main) push(writT, I.main, -1);
  });
  const readO = forms.filter((f) => f.role !== "written"), writO = forms.filter((f) => f.role !== "read");
  const MR = meetLines(readO, readT), MW = meetLines(writO, writT);
  const mr = meetingsOf(MR, readO, readT, (j) => readT[j].unit, (j) => readT[j].verse);
  const mw = meetingsOf(MW, writO, writT, (j) => writT[j].unit, (j) => writT[j].verse);
  readO.forEach((f, i) => { f.R = mr.get(i) || { way: 0 }; });
  // STEP'S OWN VARIANT WITH OUR LETTERS. Where our word is one row of STEP's and the letters differ, the row's
  // variants column may itself write the row in our letters: «L=» (Leningrad's ink: the written letters with the
  // read points), «K=», or another edition's form («A», «H», «B»…). The record names every such variant. Where
  // one of them cuts into as many parts as the row's own reading, its cut IS STEP's cut of our spelling, and it
  // stands instead of a cut carried by rule («L=» first: it is the same reading, respelled).
  for (const f of readO) {
    const m = f.R; if (m.way !== 1 || m.letters === 0 || typeof m.spans !== "number") continue;
    const I = info[m.spans]; if (!I.main) continue;
    const alike = [];
    I.vars.forEach((v, vi) => {
      if (!v.hebrew) return;
      const rd = stepReading(v.hebrew, v.english, v.tags, v.grammar);
      if (meetLetters(rd.words.map((w) => w.letters).join("")) === f.letters) alike.push({ vi, rd, who: v.who });
    });
    if (!alike.length) continue;
    m.alike = alike.map((a) => a.vi);
    bump(totals.alike, alike.map((a) => a.who).sort().join("+"));
    if (m.letters === 1) continue;
    const fits = alike.filter((a) => a.rd.parts === I.main.parts && a.rd.words.length === I.main.words.length);
    const pick = fits.find((a) => a.who === "L") || fits[0];
    if (!pick) continue;
    const lens = []; for (const w of pick.rd.words) for (const p of w.parts) lens.push(Array.from(meetLetters(p.letters)).length);
    if (Array.isArray(m.cut) && JSON.stringify(m.cut) !== JSON.stringify(lens)) totals.cutDisagrees.push(`${slug} ${f.verse} entry ${f.ei} ${f.s}: carried by rule ${m.cut.join("+")}, STEP's own variant ${pick.who}= cuts ${lens.join("+")}`);
    bump(totals.cutOf, Array.isArray(m.cut) ? "the rule carried the same cut" : "the rule could not carry the cut");
    m.cut = lens; m.cutOf = pick.vi + 1;
  }
  writO.forEach((f, i) => {
    const m = mw.get(i) || { way: 0 };
    if (f.role === "written") { f.W = m; return; }
    // a plain word: the written line says something of its own only where it lands on STEP's written form
    const onWritten = m.way !== 0 && [].concat(m.spans).some((sp) => Array.isArray(sp) && sp.length === 4);
    if (onWritten) f.W = m;
    else {
      const rowsOf = (x) => (x.way === 0 ? "" : [].concat(x.spans).map((sp) => (Array.isArray(sp) ? sp[0] : sp)).join(","));
      if (rowsOf(m) !== rowsOf(f.R)) totals.plainLineDiffers.push(`${slug} ${f.verse} entry ${f.ei}: read line rows ${rowsOf(f.R)}, written line rows ${rowsOf(m)}`);
    }
  });
  const stepMet = new Uint8Array(rows.length);
  for (const f of forms) for (const m of [f.R, f.W]) if (m && m.way) for (const sp of [].concat(m.spans)) stepMet[Array.isArray(sp) ? sp[0] : sp] = 1;

  // MACULA's words: what is read, and a word of ours that is written and not read (passed over lightly)
  const macO = forms.filter((f) => f.role !== "written" || f.kind === 2).map((f) => f);
  const macLine = macO.map((f) => ({ letters: f.letters, verse: f.verse, light: f.role === "written" }));
  const macT = mwords.map((w, wi) => ({ letters: meetLetters(w.letters), verse: `${w.ch}:${w.vs}`, unit: { key: wi, from: 0, to: w.rows.length, total: w.rows.length, variant: -1, several: false, partLetters: w.rows.map((r) => meetLetters(r.cells[iMacText])) } }));
  const MM = meetLines(macLine, macT);
  const mm = meetingsOf(MM, macLine, macT, (j) => macT[j].unit, (j) => macT[j].verse);
  macO.forEach((f, i) => { f.M = mm.get(i) || { way: 0 }; });
  const macMet = new Uint8Array(mwords.length);
  for (const f of forms) if (f.M && f.M.way) for (const sp of [].concat(f.M.spans)) macMet[Array.isArray(sp) ? sp[0] : sp] = 1;

  // the file: one table of strings, STEP's rows and MACULA's rows by column, the words by section
  const strings = [""]; const sIdx = new Map([["", 0]]);
  const S = (x) => { let k = sIdx.get(x); if (k === undefined) { k = strings.length; strings.push(x); sIdx.set(x, k); } return k; };
  const column = (values) => {
    const distinct = new Set(values).size;
    return distinct * 2 > values.length ? { inline: values } : { table: values.map(S) };
  };
  const stepCols = STEP_COLUMNS.map((_, c) => column(rows.map((r) => r.cells[c])));
  const macRows = []; const macWordStart = [];
  for (const w of mwords) { macWordStart.push(macRows.length); for (const r of w.rows) macRows.push(r); }
  macWordStart.push(macRows.length);
  const macCols = macula.columns.map((_, c) => column(macRows.map((r) => r.cells[c])));
  const sections = zone.sections.map(() => []);
  for (const ent of entries) sections[ent.si].push([ent.ei, ent.kind, ent.forms.map((f) => [ROLES.indexOf(f.role), packMeeting(f.R), packMeeting(f.W), packMeeting(f.M)])]);
  const unmetStep = []; rows.forEach((r, ri) => { if (!stepMet[ri]) { unmetStep.push(ri); bump(totals.stepUnmet, r.type); } });
  const unmetMac = []; mwords.forEach((w, wi) => { if (!macMet[wi]) unmetMac.push(wi); });
  totals.maculaUnmet += unmetMac.length;

  // counts
  const counts = { words: entries.length, kinds: {}, step: {}, macula: {}, entries: {}, with_step: 0, with_macula: 0, with_neither: 0 };
  for (const ent of entries) {
    bump(counts.kinds, KINDS[ent.kind]);
    let hasStep = false, hasMac = false;
    for (const f of ent.forms) {
      for (const [m, src, line] of [[f.R, "step", "read line"], [f.W, "step", "written line"], [f.M, "macula", ""]]) {
        if (!m) continue;
        const key = `${f.role}${line ? ` | ${line}` : ""} | ${meetingClass(packMeeting(m))}`;
        bump(counts[src], key);
        const sameWord = m.way !== 0 && m.letters !== 1;
        if (src === "step" && m.way >= 2) {
          // where one word stands for two: the mark of STEP's own that gives the seam, named
          const sp0 = [].concat(m.spans); const readingOf = (sp) => (Array.isArray(sp) && sp.length === 4 ? info[sp[0]].written : info[Array.isArray(sp) ? sp[0] : sp].main);
          let seam;
          if (m.way === 2) seam = sp0.slice(0, -1).map((sp) => { const r = readingOf(sp); const last = r.words[r.words.length - 1]; return last.marks.some((mk) => mk.he === "\u05be") ? "STEP's row cut, the first row ending in its maqaf mark «\\\u05be»" : "STEP's row cut, no maqaf mark on the first row"; }).join(" ; ");
          else if (m.way === 3 || m.way === 4) seam = `STEP's seam mark «${readingOf(sp0[0]).seams.map((x) => x.mark).join("» «")}» inside one row`;
          else if (m.way === 5) seam = "STEP's part cut «/» inside one row";
          else seam = "no mark of STEP's (the word is one part of one row)";
          bump(totals.seams, `${WAYS[m.way]} · ${seam}`);
        }
        if (sameWord && src === "step") hasStep = true;
        if (sameWord && src === "macula") hasMac = true;
        const plain = f.role === "plain" && m.way === 1 && m.letters === 0 && !m.otherVerse && !(line === "written line");
        if (TABLE && !plain) {
          const spans = m.way ? [].concat(m.spans) : [];
          const their = src === "step" ? spans.map((sp) => { const r = rows[Array.isArray(sp) ? sp[0] : sp]; return `${r.cells[0]} ${r.cells[1]} «${r.cells[3]}»${Array.isArray(sp) && sp.length === 4 ? ` {variant ${sp[3]}: ${info[sp[0]].vars[sp[3]].raw}}` : ""}${Array.isArray(sp) ? ` [parts ${sp[1]}..${sp[2]}]` : ""}`; }).join(" ¦ ") : spans.map((sp) => { const w = mwords[Array.isArray(sp) ? sp[0] : sp]; return `${w.ref} ${w.rows.map((r) => r.cells[iMacText]).join("/")} «${w.rows.map((r) => r.cells[macula.columns.indexOf("gloss")]).join("/")}»`; }).join(" ¦ ");
          table.push([src, line || "-", slug, f.verse, f.si, f.ei, f.fi, KINDS[ent.kind], f.role, meetingClass(packMeeting(m)), f.s, typeof m.letters === "string" ? m.letters : "", Array.isArray(m.cut) ? m.cut.join("+") : m.cut === undefined ? "" : m.cut, their].join("\t"));
        }
      }
    }
    bump(counts.entries, entryClass(ent.kind, ent.forms.map((f) => [ROLES.indexOf(f.role), packMeeting(f.R), packMeeting(f.W), packMeeting(f.M)])));
    if (hasStep) counts.with_step += 1;
    if (hasMac) counts.with_macula += 1;
    if (!hasStep && !hasMac) { counts.with_neither += 1; totals.neither.push(`${slug} ${zone.sections[ent.si].label} section ${ent.si} entry ${ent.ei} ${ent.forms.map((f) => f.s).join(" ")}`); }
  }
  const doc = {
    schema: PLACES_SCHEMA, rule_id: PLACES_RULE_ID, book: slug, generated_by: "tools/build-place-answers-places-v1.mjs",
    shape: SHAPE_WORDS,
    zone: { file: `data/zones/${slug}.bin`, sha256: zone.sha256, bytes: zone.bytes, sections: zone.sections.length, words: entries.length },
    counts,
    ways: WAYS, kinds: KINDS, roles: ROLES,
    strings,
    step: { book: code, file: tahot.files[rows[0].file].name, file_sha256: tahot.files[rows[0].file].sha256, revision: STEP_REV, columns: STEP_COLUMNS, rows: rows.length, line: rows.map((r) => r.line), cells: stepCols, unmet: unmetStep },
    macula: { book: mcode, file: macula.file.name, file_sha256: macula.file.sha256, revision: MACULA_REV, columns: macula.columns, rows: macRows.length, line: macRows.map((r) => r.line), cells: macCols, words: macWordStart, unmet: unmetMac },
    sections,
  };
  const gz = gzipSync(Buffer.from(JSON.stringify(doc), "utf8"), { level: 9 });
  writeFileSync(join(OUT, `${slug}.json.gz`), gz);
  pinBooks[slug] = { file: `${slug}.json.gz`, bytes: gz.length, sha256: sha256Of(gz), zone_sha256: zone.sha256, words: entries.length, step_rows: rows.length, macula_rows: macRows.length, macula_words: mwords.length };
  totals.words += entries.length; totals.bytes += gz.length; totals.stepRows += rows.length; totals.maculaRows += macRows.length; totals.maculaWords += mwords.length;
  totals.withStep += counts.with_step; totals.withMacula += counts.with_macula; totals.withNeither += counts.with_neither;
  for (const k of ["kinds", "step", "macula", "entries"]) for (const [a, n] of Object.entries(counts[k])) bump(totals[k], a, n);
  totals.verses += zone.sections.length;
  totals.anchored.step_read += MR.anchoredVerses; totals.anchored.step_written += MW.anchoredVerses; totals.anchored.macula += MM.anchoredVerses;
  totals.regions.step_read += MR.regions.length; totals.regions.step_written += MW.regions.length; totals.regions.macula += MM.regions.length;
  if (MR.disorder || MW.disorder || MM.disorder) { console.error(`${slug}: the met verses do not stand in one order in both lines`); process.exit(1); }
  console.log(`${slug.padEnd(14)} ${nf(entries.length).padStart(7)} words · ${nf(rows.length).padStart(7)} rows of STEP's · ${nf(macRows.length).padStart(7)} morphs of MACULA's · ${nf(gz.length).padStart(9)} bytes`);
}

const sorted = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)));
if (!ONLY) {
  const pin = {
    schema: "PLACE_ANSWERS_PLACES_PIN_V1", rule_id: PLACES_RULE_ID, rule: PLACES_RULE,
    generated_by: "tools/build-place-answers-places-v1.mjs",
    made_again_by: "node tools/build-place-answers-places-v1.mjs --step <dir of STEP's four TAHOT files> --step-revision <id> --macula <macula-hebrew.tsv> --macula-revision <id>",
    sources: {
      step_tahot: { provider: "STEPBible.org, based on work at Tyndale House Cambridge", repository: "https://github.com/STEPBible/STEPBible-Data", folder: "Translators Amalgamated OT+NT", license: "CC BY 4.0", credit: "Tyndale House and STEPBible.org; source: STEPBible.github.io/STEPBible-Data", revision: STEP_REV, files: tahot.files },
      macula_hebrew: { provider: "Clear Bible, Inc. (MACULA Hebrew Linguistic Datasets)", repository: "https://github.com/Clear-Bible/macula-hebrew", path: "WLC/tsv/macula-hebrew.tsv (in large file storage)", license: "CC BY 4.0", revision: MACULA_REV, files: [macula.file] },
      our_text: { what: "the zones of the 39 books: the surface of each entry, its marks, and the forms of a word written one way and read another; nothing else of a zone is read", files: Object.fromEntries(Object.entries(pinBooks).map(([b, v]) => [`data/zones/${b}.bin`, v.zone_sha256])) },
    },
    counts: {
      books: Object.keys(pinBooks).length, words: totals.words, kinds: sorted(totals.kinds),
      words_with_steps_parts: totals.withStep, words_with_maculas_morphs: totals.withMacula, words_with_neither: totals.withNeither, words_with_neither_named: totals.neither,
      words_by_how_the_editions_meet: sorted(totals.entries),
      step_meetings_by_form: sorted(totals.step), macula_meetings_by_form: sorted(totals.macula),
      step_seams_named_by_form: sorted(totals.seams),
      forms_whose_letters_a_variant_of_steps_row_writes: sorted(totals.alike), cut_taken_from_steps_own_variant: totals.cutOf, cut_by_rule_against_steps_own_variant: totals.cutDisagrees,
      step_rows: totals.stepRows, step_rows_no_word_of_ours_meets_by_type: sorted(totals.stepUnmet),
      macula_morph_rows: totals.maculaRows, macula_words: totals.maculaWords, macula_words_no_word_of_ours_meets: totals.maculaUnmet,
      verses: totals.verses, verses_met_whole_under_the_same_number: totals.anchored, stretches_met_between_them: totals.regions,
      plain_words_the_two_lines_place_otherwise: totals.plainLineDiffers,
      bytes: totals.bytes,
    },
    files: pinBooks,
  };
  writeFileSync(join(OUT, "PIN.json"), JSON.stringify(pin, null, 1) + "\n");
}
if (TABLE) writeFileSync(TABLE, ["source\tline\tbook\tverse\tsection\tentry\tform\tkind\trole\tmeeting\tours\tletters\tcut\ttheirs", ...table].join("\n") + "\n");
console.log(`\n${nf(totals.words)} words · with STEP's parts ${nf(totals.withStep)} · with MACULA's morphs ${nf(totals.withMacula)} · with neither ${nf(totals.withNeither)} · ${nf(totals.bytes)} bytes in all`);
console.log("\nwords by how the editions meet:"); for (const [k, n] of Object.entries(sorted(totals.entries))) console.log(`  ${nf(n).padStart(8)}  ${k}`);
console.log("\nSTEP, by form:"); for (const [k, n] of Object.entries(sorted(totals.step))) console.log(`  ${nf(n).padStart(8)}  ${k}`);
console.log("\nMACULA, by form:"); for (const [k, n] of Object.entries(sorted(totals.macula))) console.log(`  ${nf(n).padStart(8)}  ${k}`);
console.log("\nthe seams, named (STEP, by form):"); for (const [k, n] of Object.entries(sorted(totals.seams))) console.log(`  ${nf(n).padStart(8)}  ${k}`);
console.log("\nforms whose letters one of the row's own variants writes (by the variants that do):", JSON.stringify(sorted(totals.alike)), "· the cut taken from STEP's own variant:", JSON.stringify(totals.cutOf));
if (totals.cutDisagrees.length) { console.log("the cut by rule against STEP's own variant:"); for (const x of totals.cutDisagrees) console.log("  " + x); }
console.log("\nSTEP's rows no word of ours meets, by type:", JSON.stringify(sorted(totals.stepUnmet)), "· MACULA's words no word of ours meets:", totals.maculaUnmet);
if (totals.plainLineDiffers.length) { console.log("\nplain words the read line and the written line place otherwise:"); for (const x of totals.plainLineDiffers) console.log("  " + x); }
if (totals.neither.length) { console.log("\nwords with neither:"); for (const x of totals.neither) console.log("  " + x); }
