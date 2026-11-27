// place-answers-entries-openscriptures-v1
//
// Two files of the Open Scriptures Hebrew Lexicon, each into its own entries:
//
//   openscriptures_bdb_1906        BrownDriverBriggs.xml, keyed by BDB's id (a.ab.ac)
//   openscriptures_lexical_index   LexicalIndex.xml, keyed by its own id (aab)
//
// The BDB file is running text with tags in it. Its own documentation says a
// <def> is "a definition, as distinguished in BDB either by bold face or by
// italics", so the tag follows the type and can stop in the middle of a word
// ("(sun)<def>set</def>") or stand on a related word's meaning in the
// opening bracket of a root. So every entry is kept WHOLE as the file has it
// (a tree that writes back to the file's bytes), and beside it a view says
// where each tag stood in the entry's running text: each sense in its own
// nesting with its number and stem, each <def> with the text it is joined to
// and the sense it stands in, each <ref> with the sense it stands in.
// Nothing is flattened into rows, and nothing is decided about a def here:
// the view states the facts a reader needs to decide (is the entry a root;
// does the def stand in a bracket before the first sense; is it part of a
// word; does a reference follow it).

import { readMarkup, textOf } from "./place-answers-entries-lib-v1.mjs";

/** The entry's running text with the tags out, and where each tag stood.
 *  The <status> element (the provider's own work state and page) and <page>
 *  marks are not BDB's text: they are held apart. */
function viewOfBdbEntry(el) {
  let text = "";
  const defs = [], refs = [], words = [], poss = [], stems = [], asps = [], foreign = [], ems = [], pages = [];
  let status = null;
  const senses = [];
  const walk = (nodes, path, senseList) => {
    for (const n of nodes) {
      if (typeof n === "string") { text += n; continue; }
      const [name, attrs, kids] = n;
      if (name === "status") { status = { t: textOf(kids || []), ...(attrs || {}) }; continue; }
      if (name === "page") { pages.push({ at: text.length, p: attrs && attrs.p }); continue; }
      if (name === "sense") {
        const node = { at: text.length };
        if (attrs && attrs.n !== undefined) node.n = attrs.n;
        const sub = [];
        const myPath = path.concat(senseList.length);
        senseList.push(node);
        walk(kids || [], myPath, sub);
        node.len = text.length - node.at;
        if (sub.length) node.senses = sub;
        continue;
      }
      const at = text.length;
      if (Array.isArray(kids)) walk(kids, path, senseList);
      const rec = { t: text.slice(at), at };
      if (path.length) rec.sense = path;
      if (name === "def") defs.push(rec);
      else if (name === "ref") { refs.push({ ...rec, r: attrs && attrs.r }); }
      else if (name === "w") { if (attrs) Object.assign(rec, attrs); words.push(rec); }
      else if (name === "pos") poss.push(rec);
      else if (name === "stem") stems.push(rec);
      else if (name === "asp") asps.push(rec);
      else if (name === "foreign") { if (attrs) Object.assign(rec, attrs); foreign.push(rec); }
      else if (name === "em") ems.push(rec);
    }
  };
  walk(el[2], [], senses);

  // each sense's own stem: a <stem> that stands in the sense and in none of its sub-senses
  const senseAt = (path) => { let list = senses, node = null; for (const i of path) { node = list[i]; list = node.senses || []; } return node; };
  for (const s of stems) if (s.sense) { const node = senseAt(s.sense); (node.stems ||= []).push(s.t); }

  // bracket depth before each character of the running text
  const depth = new Uint8Array(text.length + 1);
  let d = 0;
  for (let i = 0; i < text.length; i++) {
    depth[i] = d;
    const c = text[i];
    if (c === "(" || c === "[") d++;
    else if ((c === ")" || c === "]") && d > 0) d--;
  }
  depth[text.length] = d;
  const firstSense = senses.length ? senses[0].at : text.length;

  // what a def is joined to
  const marks = [...words.map((w) => ({ k: "w", at: w.at, end: w.at + w.t.length })), ...refs.map((r, i) => ({ k: "ref", i, at: r.at, end: r.at + r.t.length }))].sort((a, b) => a.at - b.at);
  defs.forEach((df, i) => {
    const end = df.at + df.t.length;
    // The part of a word the tag left outside: the run of Latin letters,
    // digits, hyphens, apostrophes and brackets directly before and directly
    // after the def. BDB's dash, a comma, a full stop or a blank ends the run.
    // Only a run that holds a letter or a digit makes the def part of a word:
    // "(sun)" + "set"; a bare bracket does not (the def then says in_bracket).
    const glue = /[\p{Script=Latin}\p{N}()\[\]\-'\u2019]/u;
    let a = df.at; while (a > 0 && glue.test(text[a - 1])) a--;
    let b = end; while (b < text.length && glue.test(text[b])) b++;
    const pre = text.slice(a, df.at), post = text.slice(end, b);
    const lettered = /[\p{Script=Latin}\p{N}]/u;
    if (lettered.test(pre) || lettered.test(post)) df.joined = { before: pre, after: post, whole: pre + df.t + post };
    if (depth[df.at] > 0) df.in_bracket = depth[df.at];
    if (df.at < firstSense && senses.length) df.before_first_sense = true;
    // a Hebrew word directly before (blanks only between), a reference directly after
    const before = marks.filter((m) => m.end <= df.at).pop();
    if (before && before.k === "w" && /^\s*$/.test(text.slice(before.end, df.at))) df.after_hebrew = true;
    const next = marks.find((m) => m.at >= end);
    if (next && next.k === "ref" && /^[\s,;]*$/.test(text.slice(end, next.at))) df.ref_next = next.i;
  });
  // defs that are one phrase: the text between two neighbors is only blanks
  // and brackets or hyphens, with at least one bracket or hyphen ("I (we) pray"),
  // or nothing at all
  let run = [0];
  const flush = () => {
    if (run.length < 2) return;
    const first = defs[run[0]], last = defs[run[run.length - 1]];
    let start = first.at, end = last.at + last.t.length;
    const lack = () => { let o = 0, c = 0; for (const ch of text.slice(start, end)) { if (ch === "(" || ch === "[") o++; else if (ch === ")" || ch === "]") c++; } return o - c; };
    // widen over brackets glued directly to the ends, only as far as balance needs
    for (let k = lack(); k > 0 && end < text.length && /[)\]]/.test(text[end]); k--) end++;
    for (let k = lack(); k < 0 && start > 0 && /[(\[]/.test(text[start - 1]); k++) start--;
    if (lack() !== 0) return; // the brackets do not balance: these defs are not one phrase
    const phrase = text.slice(start, end);
    run.forEach((k, j) => { defs[k].phrase = { t: phrase, at: start, i: j, n: run.length }; });
  };
  for (let i = 1; i < defs.length; i++) {
    const between = text.slice(defs[i - 1].at + defs[i - 1].t.length, defs[i].at);
    if (between === "" || (/^[\s()\[\]-]*$/.test(between) && /[()\[\]-]/.test(between))) run.push(i);
    else { flush(); run = [i]; }
  }
  flush();

  const v = { text };
  if (status) v.status = status;
  if (senses.length) v.senses = senses;
  if (words.length) v.w = words;
  if (poss.length) v.pos = poss;
  if (stems.length) v.stems = stems;
  if (asps.length) v.asp = asps;
  if (defs.length) v.defs = defs;
  if (refs.length) v.refs = refs;
  if (foreign.length) v.foreign = foreign;
  if (ems.length) v.em = ems;
  if (pages.length) v.pages = pages;
  return v;
}

export function buildOpenScripturesBdb({ buf }) {
  const latin = buf.toString("latin1");
  const entries = {};
  const counts = { entries: 0, root_entries: 0, entries_with_a_numeral: 0, entries_marked_form_false: 0, senses: 0, senses_numbered: 0, stems: 0, defs: 0,
    defs_joined_to_text: 0, defs_in_a_phrase: 0, defs_in_a_bracket_before_the_first_sense_or_with_no_sense: 0, defs_of_one_letter: 0, defs_a_reference_follows: 0,
    refs: 0, refs_inside_a_sense: 0, pos: 0, strings: 0, character_references: 0, tags_not_nesting: 0, parts: 0, sections: 0 };
  // which part and section an entry stands in (BDB's own alphabet and root groups)
  const partAt = [...latin.matchAll(/<part id="([^"]+)"/g)].map((m) => [m.index, m[1]]);
  const sectionAt = [...latin.matchAll(/<section id="([^"]+)"/g)].map((m) => [m.index, m[1]]);
  counts.parts = partAt.length; counts.sections = sectionAt.length;
  const re = /<entry [\s\S]*?<\/entry>/g;
  let m;
  const countSenses = (list) => { for (const s of list) { counts.senses++; if (s.n !== undefined) counts.senses_numbered++; if (s.senses) countSenses(s.senses); } };
  while ((m = re.exec(latin))) {
    const from = m.index, to = from + m[0].length;
    const { nodes, odd } = readMarkup(latin, from, to);
    counts.tags_not_nesting += odd;
    const el = nodes[0];
    const attrs = el[1];
    const e = { at: [from, to], id: attrs.id, type: attrs.type || "entry" };
    if (attrs.mod) e.numeral = attrs.mod;
    if (attrs.form) e.form = attrs.form;
    if (attrs.cite) e.cite = attrs.cite;
    Object.assign(e, viewOfBdbEntry(el));
    e.x = el;
    entries[attrs.id] = e;
    counts.entries++;
    if (e.type === "root") counts.root_entries++;
    if (e.numeral) counts.entries_with_a_numeral++;
    if (e.form === "false") counts.entries_marked_form_false++;
    countSenses(e.senses || []);
    counts.stems += (e.stems || []).length;
    counts.pos += (e.pos || []).length;
    for (const df of e.defs || []) {
      counts.defs++; counts.strings++;
      if (df.joined) counts.defs_joined_to_text++;
      if (df.phrase) counts.defs_in_a_phrase++;
      if (df.in_bracket && (df.before_first_sense || !e.senses)) counts.defs_in_a_bracket_before_the_first_sense_or_with_no_sense++;
      if ([...df.t].length === 1) counts.defs_of_one_letter++;
      if (df.ref_next !== undefined) counts.defs_a_reference_follows++;
    }
    for (const r of e.refs || []) { counts.refs++; counts.strings++; if (r.sense) counts.refs_inside_a_sense++; }
    counts.strings += 1 + (e.w || []).length + (e.pos || []).length + (e.stems || []).length;
    counts.character_references += (e.text.match(/&(#x?[0-9A-Fa-f]+|[a-z]+);/g) || []).length;
  }
  return { entries, counts };
}

export function buildLexicalIndex({ buf }) {
  const latin = buf.toString("latin1");
  const entries = {};
  const counts = { entries: 0, with_a_strong_number: 0, with_a_bdb_id: 0, with_an_added_letter: 0, with_a_twot_number: 0, with_a_gloss: 0, strings: 0, tags_not_nesting: 0, parts: {} };
  const partAt = [...latin.matchAll(/<part xml:lang="([^"]+)"/g)].map((m) => [m.index, m[1]]);
  const re = /<entry [\s\S]*?<\/entry>/g;
  let m;
  while ((m = re.exec(latin))) {
    const from = m.index, to = from + m[0].length;
    const { nodes, odd } = readMarkup(latin, from, to);
    counts.tags_not_nesting += odd;
    const el = nodes[0];
    const e = { at: [from, to], id: el[1].id };
    let lang = null;
    for (const [at, l] of partAt) if (at < from) lang = l;
    e.lang = lang; // the <part xml:lang> the entry stands in
    counts.parts[lang] = (counts.parts[lang] || 0) + 1;
    for (const kid of el[2]) {
      if (typeof kid === "string") continue;
      const [name, attrs, sub] = kid;
      if (name === "w") { e.w = textOf(sub || []); if (attrs && attrs.xlit !== undefined) e.xlit = attrs.xlit; }
      else if (name === "pos") e.pos = textOf(sub || []);
      else if (name === "def") e.def = textOf(sub || []);
      else if (name === "xref") e.xref = { ...(attrs || {}) };
      else if (name === "etym") { e.etym = { ...(attrs || {}) }; const t = textOf(sub || []); if (t) e.etym.t = t; }
    }
    e.x = el;
    entries[e.id] = e;
    counts.entries++;
    counts.strings += 1 + (e.def !== undefined ? 1 : 0) + (e.pos !== undefined ? 1 : 0);
    if (e.xref && e.xref.strong) counts.with_a_strong_number++;
    if (e.xref && e.xref.bdb) counts.with_a_bdb_id++;
    if (e.xref && e.xref.aug) counts.with_an_added_letter++;
    if (e.xref && e.xref.twot) counts.with_a_twot_number++;
    if (e.def !== undefined) counts.with_a_gloss++;
  }
  return { entries, counts };
}
