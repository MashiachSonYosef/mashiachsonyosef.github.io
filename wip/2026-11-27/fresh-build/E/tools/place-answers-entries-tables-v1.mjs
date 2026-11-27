// place-answers-entries-tables-v1
//
// Three sources that come as plain records, each into its own entries:
//
//   stepbible_tbesh_gloss     STEP's brief lexicon, one line per lettered number
//   ubs_sdbh_hebrew_v0_9_2    the UBS Dictionary of Biblical Hebrew (JSON)
//   unfoldingword_uhal        unfoldingWord's lexicon, one file per Strong's number
//
// TBESH: the line is kept by STEP's own lettered number (its second column)
// with its first seven columns as the file has them. The eighth column,
// Meaning, is NOT taken: the file says of it "Permission should be gained
// from Online Bible before these definitions are applied in any project".
//
// UBS: the file's own structure is kept under the file's own field names:
// the entry (MainId, Lemma, StrongCodes), its BaseForms, each base form's
// LEXMeanings (the senses), each with its definition, glosses and the
// references it cites. The Strong's codes stand on the ENTRY only; the file
// puts none on a base form or a sense, and the entries say so by keeping the
// codes where the file has them.
//
// UHAL: the file of an entry is kept whole, with a view of its own headings
// (Word data, Senses, Glosses, Citations).

import { BY_UHB } from "./place-answers-entries-lib-v1.mjs";

export function buildTbesh({ buf }) {
  const text = buf.toString("utf8");
  const entries = {};
  const counts = { lines: 0, lettered_by_step: 0, with_an_open_scriptures_letter_in_the_first_column: 0, relation_named: 0, strings: 0, columns_per_line: {} };
  let header = null, lineNo = 0, at = 0;
  for (const line of text.split("\n")) {
    lineNo++;
    const lineAt = at;
    at += Buffer.byteLength(line, "utf8") + 1;
    const cols = line.replace(/\r$/, "").split("\t");
    if (cols[0] === "eStrong#") { header = { line: lineNo, cols }; continue; }
    if (!/^H\d{4}/.test(cols[0]) || cols.length < 8) continue;
    const m = /^(H\d{4}[A-Za-z]?)\s*=\s*(.*)$/.exec(cols[1]);
    if (!m) throw new Error("TBESH: second column not read at line " + lineNo + ": " + cols[1]);
    const id = m[1];
    if (entries[id]) throw new Error("TBESH: the lettered number stands on two lines: " + id);
    const e = { line: lineNo, at: lineAt, eStrong: cols[0], dStrong: cols[1], uStrong: cols[2], Hebrew: cols[3], Transliteration: cols[4], Morph: cols[5], Gloss: cols[6] };
    if (m[2]) { e.relation = m[2]; counts.relation_named++; }
    entries[id] = e;
    counts.lines++;
    counts.strings += 7;
    counts.columns_per_line[cols.length] = (counts.columns_per_line[cols.length] || 0) + 1;
    if (/[A-Za-z]$/.test(id)) counts.lettered_by_step++;
    if (/[a-z]$/.test(cols[0])) counts.with_an_open_scriptures_letter_in_the_first_column++;
  }
  if (!header) throw new Error("TBESH: the header line was not found");
  return { entries, counts, header };
}

// ---------------------------------------------------------------- UBS

const pick = (o, keys) => { const out = {}; for (const k of keys) if (o[k] !== null && o[k] !== undefined && !(Array.isArray(o[k]) && o[k].length === 0) && o[k] !== "") out[k] = o[k]; return out; };

/** What is kept of each level, by the file's own field names. A field that
 *  is null, empty or an empty list in the file is left out; nothing else is
 *  changed. The check walks the same names in the source file. */
export const UBS_KEPT = {
  entry: ["MainId", "Lemma", "StrongCodes", "AlternateLemmas", "HasAramaic", "Notes"],
  note: ["Caller", "Content", "References"],
  baseForm: ["BaseFormID", "PartsOfSpeech", "MeaningsOfName", "RelatedLemmas", "RelatedNames"],
  meaning: ["LEXID", "LEXEntryCode", "LEXIndent", "LEXForms", "LEXCollocations", "LEXSynonyms", "LEXAntonyms", "LEXLinks", "LEXReferences"],
  domain: ["Domain", "DomainCode", "DomainSource", "DomainSourceCode"],
  sense: ["LanguageCode", "DefinitionShort", "DefinitionLong", "Glosses", "Comments"],
};

export function keepUbsEntry(src) {
  const e = pick(src, UBS_KEPT.entry);
  if (src.StrongCodes) e.StrongCodes = src.StrongCodes; // kept even where empty: the file's own statement
  if (e.Notes) e.Notes = src.Notes.map((n) => pick(n, UBS_KEPT.note));
  e.BaseForms = (src.BaseForms || []).map((bf) => {
    const b = pick(bf, UBS_KEPT.baseForm);
    b.LEXMeanings = (bf.LEXMeanings || []).map((mn) => {
      const x = pick(mn, UBS_KEPT.meaning);
      if (mn.LEXDomains && mn.LEXDomains.length) x.LEXDomains = mn.LEXDomains.map((d) => pick(d, UBS_KEPT.domain));
      x.LEXSenses = (mn.LEXSenses || []).map((s) => pick(s, UBS_KEPT.sense));
      return x;
    });
    return b;
  });
  return e;
}

/** A UBS Strong's code read apart. The file writes "H3651", "A3652" (an
 *  Aramaic entry), "H0859b" (a letter of its own), and at a few entries two
 *  codes joined by "+" or a bare number. Returns every number in the code. */
export function ubsCodeNumbers(code) {
  const out = [];
  for (const m of code.matchAll(/([HA]?)(\d{4})([a-z]?)/g)) out.push({ language: m[1], number: +m[2], letter: m[3] });
  return out;
}

export function buildUbs({ buf }) {
  const src = JSON.parse(buf.toString("utf8"));
  const entries = {};
  const counts = { entries: 0, base_forms: 0, senses: 0, glosses: 0, definitions: 0, references: 0, senses_with_no_reference: 0,
    entries_with_no_strong_code: 0, entries_with_one_code: 0, entries_with_several_codes: 0, entries_with_several_base_forms: 0,
    entries_with_several_codes_and_several_base_forms: 0, strong_codes: 0, codes_with_a_letter: 0, codes_aramaic: 0, codes_of_another_shape: 0,
    strong_codes_on_a_base_form_or_a_sense: 0, notes: 0, strings: 0 };
  src.forEach((raw, i) => {
    const e = { i, ...keepUbsEntry(raw) };
    if (entries[raw.MainId]) throw new Error("UBS: MainId twice: " + raw.MainId);
    entries[raw.MainId] = e;
    counts.entries++;
    const codes = raw.StrongCodes || [];
    counts.strong_codes += codes.length;
    if (!codes.length) counts.entries_with_no_strong_code++; else if (codes.length === 1) counts.entries_with_one_code++; else counts.entries_with_several_codes++;
    for (const c of codes) {
      if (/^H\d{4}$/.test(c)) continue;
      if (/^A\d{4}[a-z]?$/.test(c)) counts.codes_aramaic++;
      if (/^[HA]\d{4}[a-z]$/.test(c)) counts.codes_with_a_letter++;
      if (!/^[HA]\d{4}[a-z]?$/.test(c)) counts.codes_of_another_shape++;
    }
    const bfs = raw.BaseForms || [];
    counts.base_forms += bfs.length;
    if (bfs.length > 1) counts.entries_with_several_base_forms++;
    if (bfs.length > 1 && codes.length > 1) counts.entries_with_several_codes_and_several_base_forms++;
    counts.notes += (raw.Notes || []).length;
    counts.strings += 1 + codes.length + (raw.Notes || []).length;
    for (const bf of bfs) {
      for (const k of Object.keys(bf)) if (/strong/i.test(k)) counts.strong_codes_on_a_base_form_or_a_sense++;
      for (const mn of bf.LEXMeanings || []) {
        for (const k of Object.keys(mn)) if (/strong/i.test(k)) counts.strong_codes_on_a_base_form_or_a_sense++;
        counts.senses++;
        const refs = mn.LEXReferences || [];
        counts.references += refs.length;
        if (!refs.length) counts.senses_with_no_reference++;
        for (const s of mn.LEXSenses || []) {
          counts.glosses += (s.Glosses || []).length;
          if (s.DefinitionShort) counts.definitions++;
          if (s.DefinitionLong) counts.definitions++;
          counts.strings += (s.Glosses || []).length + (s.DefinitionShort ? 1 : 0) + (s.DefinitionLong ? 1 : 0);
        }
        counts.strings += refs.length;
      }
    }
  });
  return { entries, counts };
}

// ---------------------------------------------------------------- UHAL

/** One UHAL file (markdown) into a view of its own headings. Every string of
 *  the view is a run of the file's text; `at` is its offset in the text. */
export function readUhalFile(text) {
  const v = {};
  let m;
  if ((m = /^# (.*)$/m.exec(text))) v.headword = { t: m[1], at: m.index + 2 };
  const field = (label) => { const r = new RegExp("^\\* " + label + ":[ \\t]*(.*)$", "m").exec(text); return r ? { t: r[1], at: r.index + r[0].length - r[1].length } : null; };
  const strongs = field("Strongs"); if (strongs && strongs.t) v.strongs = strongs;
  const twot = field("TWOT"); if (twot && twot.t) v.twot = twot;
  // two files of the lexicon name these two lines otherwise (Lexical Entry, Root Lexeme)
  for (const [key, labels] of [["bdb_reference", ["BDB Reference", "Lexical Entry"]], ["bdb_root", ["BDB Root", "Root Lexeme"]]]) for (const label of labels) {
    const f = field(label);
    if (f && f.t && !v[key]) { const l = /^\[([^\]]*)\]\(rc:\/\/en\/bdb\/dict\/([^)]*)\)/.exec(f.t); v[key] = l ? { ...f, shown: l[1], bdb_id: l[2], label } : { ...f, label }; }
  }
  // the part of speech stands on the line itself, or in the paragraph under it
  const posLine = field("Part of Speech");
  if (posLine && posLine.t.trim()) v.part_of_speech = posLine;
  else if ((m = /^\* Part of Speech:[ \t]*\n\n?([^\n*#][^\n]*)$/m.exec(text))) v.part_of_speech = { t: m[1], at: m.index + m[0].length - m[1].length };
  const senses = [];
  const heads = [...text.matchAll(/^### Sense ([^:\n]*):[ \t]*([^\n]*)$/gm)];
  heads.forEach((h, i) => {
    const from = h.index + h[0].length, to = i + 1 < heads.length ? heads[i + 1].index : text.length;
    const body = text.slice(from, to);
    const s = { label: h[1] };
    if (h[2].trim()) s.title = { t: h[2], at: h.index + h[0].length - h[2].length }; // "Hiphil stem"
    const part = (name) => {
      const r = new RegExp("^#### " + name + ":[ \\t]*\\n([\\s\\S]*?)(?=^#### |(?![\\s\\S]))", "m").exec(body);
      if (!r) return null;
      const raw = r[1];
      const lead = /^\s*/.exec(raw)[0].length;
      const t = raw.slice(lead).replace(/\s+$/, "");
      return t ? { t, at: from + r.index + r[0].length - raw.length + lead } : null;
    };
    const def = part("Definition"); if (def) s.definition = def;
    const gl = part("Glosses");
    if (gl) {
      s.glosses_as_written = gl;
      // the file separates the glosses of a sense by semicolons
      s.glosses = [];
      let off = 0;
      for (const piece of gl.t.split(";")) {
        const lead = /^\s*/.exec(piece)[0].length;
        const t = piece.slice(lead).replace(/\s+$/, "");
        if (t) s.glosses.push({ t, at: gl.at + off + lead });
        off += piece.length + 1;
      }
    }
    const ex = part("Explanation"); if (ex) s.explanation = ex;
    const ci = part("Citations");
    if (ci) {
      s.citations_as_written = ci;
      s.citations = [];
      for (const c of ci.t.matchAll(/\[([^\]]*)\]\(rc:\/\/he\/uhb\/book\/([a-z0-9]+)\/(\d+)\/(\d+)\)/g)) {
        s.citations.push({ t: c[1], at: ci.at + c.index + 1, book: BY_UHB[c[2]] || null, source_book: c[2], chapter: +c[3], verse: +c[4] });
      }
    }
    senses.push(s);
  });
  v.senses = senses;
  return v;
}

/** recordsText: the corpus lane's record file for UHAL (each line holds one
 *  file of the lexicon whole in "D", and the file's own name). */
export function buildUhalFromRecords({ recordsText, recordsName }) {
  const entries = {};
  const counts = { entries: 0, senses: 0, senses_with_a_gloss: 0, glosses: 0, citations: 0, with_a_bdb_reference: 0, strings: 0 };
  let lineNo = 0;
  for (const line of recordsText.split("\n")) {
    lineNo++;
    if (!line) continue;
    const rec = JSON.parse(line);
    const name = /([^/]+)\.md$/.exec(rec.file);
    const v = readUhalFile(rec.D);
    const id = v.strongs ? v.strongs.t.trim() : (name ? name[1] : null);
    if (!id) throw new Error("UHAL: no number at record line " + lineNo);
    if (entries[id]) throw new Error("UHAL: number twice: " + id);
    const e = { read_from: { file: recordsName, line: lineNo, field: "D", the_lanes_own_note_of_its_file: rec.file }, file_name: name ? name[1] + ".md" : null, ...v, text: rec.D };
    entries[id] = e;
    counts.entries++;
    if (v.bdb_reference && v.bdb_reference.bdb_id) counts.with_a_bdb_reference++;
    counts.strings += 2;
    for (const s of v.senses) {
      counts.senses++;
      if (s.glosses && s.glosses.length) counts.senses_with_a_gloss++;
      counts.glosses += (s.glosses || []).length;
      counts.citations += (s.citations || []).length;
      counts.strings += (s.glosses || []).length + (s.citations || []).length;
    }
  }
  const sorted = {};
  for (const k of Object.keys(entries).sort()) sorted[k] = entries[k];
  return { entries: sorted, counts };
}
