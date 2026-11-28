// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It reads the bytes handed to it into entries and hands
// them back; it writes nothing.
//
// place-answers-entries-strongs-v1
//
// Strong's dictionary of 1890 in its two editions, each read from its own
// file into its own entries, keyed by Strong's number:
//
//   openscriptures_strongs             HebrewStrong.xml (Open Scriptures)
//   wikisource_strongs_explicit_forms  the Hebrew Wikisource edition
//
// What Strong himself says his entry is (PLAN OF THE BOOK, items 4 to 6, and
// SIGNS EMPLOYED, read from the scan's text in the earlier pass): the
// etymology and meaning, then "after the punctuation-mark :--" all the
// renderings of the Authorized Version, condensed with ( ) and [ ], some
// carrying the sign + (a rendering of this word together with others) or
// x (a rendering that comes from a Hebrew idiom). So the list after the mark
// is HIS list, each item whole as he condensed it; it is kept as a list with
// each item's sign, never cut at a comma inside a bracket.
//
// The Open Scriptures file lost most + signs (it writes 39; the Wikisource
// edition 539 in the entries both hold). Where a rendering opens after two
// or more blanks, the blanks are the trace of the lost sign: that is kept as
// a fact on the item, and where the Wikisource edition writes the sign on
// the same rendering of the same entry, the item says so. Nothing is added
// to the item's own text.

import { readMarkup, textOf, hebrewNumber, BY_HEBREW_NAME } from "./place-answers-entries-lib-v1.mjs";

// ------------------------------------------------------------ the list

/** Bracket depth walk. Returns for each character index the depth BEFORE it,
 *  counting ( and [ up and ) and ] down, never below zero; and whether the
 *  text balances. */
function depths(s) {
  const d = new Array(s.length + 1);
  let depth = 0, unmatchedClose = 0;
  for (let i = 0; i < s.length; i++) {
    d[i] = depth;
    const c = s[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") { if (depth > 0) depth--; else unmatchedClose++; }
  }
  d[s.length] = depth;
  return { d, balanced: depth === 0 && unmatchedClose === 0 };
}

/** Where Strong's list stops inside a text that starts at the list: the
 *  first full stop outside every bracket that ends the text, or that is
 *  followed by blanks and a capital letter (his "Compare …", "See …", or a
 *  remark on the entry). Returns the index of that full stop, or -1. */
function listStop(s) {
  const { d } = depths(s);
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== "." || d[i] !== 0) continue;
    const rest = s.slice(i + 1);
    if (/^\s*$/.test(rest)) return i;
    if (/^\s+["']?[A-Z]/.test(rest)) return i;
  }
  return -1;
}

// Strong's two signs. The Open Scriptures file writes his multiplication sign
// as the sign itself (U+00D7); the Wikisource edition writes a capital X.
const SIGN_OPEN_SCRIPTURES = /^(\xd7|\+)(?=\s)/;
const SIGN_WIKISOURCE = /^(\xd7|X|\+)(?=\s)/;

/** Cut a list at the commas that stand outside every bracket. Each item is
 *  the run between two such commas with its outer blanks left off. Two or
 *  more blanks before an item are counted, because in the Open Scriptures
 *  file they stand where a sign was lost.
 *
 *  Where the file's brackets do not balance, nothing is cut inside the run
 *  that does not balance: a bracket left open keeps the rest of the list as
 *  one item (the comma walk never returns to the outside), and a bracket
 *  closed that no piece opened is held together with the pieces before it,
 *  back to the nearest piece that opens a bracket. Such an item says
 *  "unbalanced" and how many comma pieces it holds; it is the file's own
 *  bytes, and which bracket is the slip is not decided here.
 *  base: the offset of `list` in the field's text. */
function cutList(list, base, SIGN) {
  const { d } = depths(list);
  const pieces = [];
  let start = 0;
  for (let i = 0; i <= list.length; i++) {
    if (i === list.length || (list[i] === "," && d[i] === 0)) { pieces.push([start, i]); start = i + 1; }
  }
  const strayClose = (t) => { let depth = 0; for (const c of t) { if (c === "(" || c === "[") depth++; else if (c === ")" || c === "]") { if (depth === 0) return true; depth--; } } return false; };
  // join a piece that closes an unopened bracket to the pieces before it
  const runs = [];
  for (const [a, b] of pieces) {
    const t = list.slice(a, b);
    if (strayClose(t)) {
      let j = runs.length - 1;
      while (j >= 0 && !/[(\[]/.test(list.slice(runs[j][0], runs[j][1]))) j--;
      if (j >= 0) { const from = runs[j][0], n = runs.slice(j).reduce((k, r) => k + r[2], 0) + 1; runs.length = j; runs.push([from, b, n]); continue; }
    }
    runs.push([a, b, 1]);
  }
  const items = [];
  for (const [a, b, n] of runs) {
    const raw = list.slice(a, b);
    const lead = /^\s*/.exec(raw)[0].length;
    const body = raw.slice(lead).replace(/\s+$/, "");
    if (!body) { if (raw.length || items.length) items.push({ t: "", at: base + a + lead, empty: true }); continue; }
    const item = { t: body, at: base + a + lead };
    const sg = SIGN.exec(body);
    if (sg) {
      const after = body.slice(sg[0].length);
      const gap = /^\s*/.exec(after)[0].length;
      item.sign = sg[1];
      item.t = after.slice(gap);
      item.at = base + a + lead + sg[0].length + gap;
    }
    if (lead >= 2) item.blanks_before = lead;
    if (!depths(item.t).balanced) item.unbalanced = true;
    if (n > 1) item.comma_pieces_held_whole = n;
    items.push(item);
  }
  return items;
}

// For asking the Wikisource edition about the SAME rendering only: brackets
// and blanks aside, in lower case ("(for-) asmuch as yet" and "(for-)asmuch as
// yet" are one rendering). It never changes what an item holds.
const squeeze = (s) => s.replace(/[()\[\]\s]/g, "").toLowerCase();

// ------------------------------------------------------------ Wikisource

/** One entry of the Wikisource edition from its wikitext.
 *  text: the entry's wikitext, from "==N==" to the line before the next. */
export function readWikisourceEntry(text) {
  const head = /^==(\d+)==\n\{\{ltr\|1=\n'''([\s\S]*?)''':/.exec(text);
  if (!head) return null;
  const number = +head[1];
  const defStart = head[0].length;
  const close = text.indexOf("}}\n", defStart);
  const defEnd = close >= 0 ? close : text.lastIndexOf("}}");
  if (defEnd < 0) return null;
  const definition = text.slice(defStart, defEnd);
  const e = { number, headline: { t: head[2], at: head[0].length - head[2].length - 4 }, definition: { t: definition, at: defStart } };
  const hw = /^(.*) \((.*)\)$/.exec(head[2]);
  if (hw) { e.headword = hw[1]; e.pronunciation = hw[2]; }

  // links to other entries, as the edition writes them: [[../H0#346|<headword>]]
  const links = [];
  for (const m of definition.matchAll(/\[\[\.\.\/H\d#(\d+)\|([^\]]*)\]\]/g)) links.push({ at: m.index, t: m[0], to: "H" + m[1], shown: m[2] });
  if (links.length) e.links = links;

  // Where the list opens. Strong's own sign is ":--". The edition writes it
  // as a colon nearly everywhere; at some entries it kept a dash or two after
  // the colon or after a semicolon. Tried in this order: a colon with dashes;
  // a semicolon with dashes; the last colon followed by a blank that is not a
  // verse's colon (between two digits) and not inside a link, with a dash
  // that follows the blank counted into the sign. Where none stands, the
  // entry has no list opener and the definition is held whole, uncut.
  let open = null;
  let m;
  const isVerseColon = (i) => i > 0 && /\d/.test(definition[i - 1]) && /\d/.test(definition[i + 1] || "");
  const inLink = (i) => links.some((l) => i >= l.at && i < l.at + l.t.length);
  if ((m = /:\s*--?\s*/.exec(definition)) && !inLink(m.index)) open = { sign: m[0].replace(/\s+$/, ""), at: m.index, list_at: m.index + m[0].replace(/\s+$/, "").length };
  else if ((m = /; ?--?(?=[^\s-])/.exec(definition))) open = { sign: m[0], at: m.index, list_at: m.index + m[0].length };
  else {
    let last = -1;
    for (const c of definition.matchAll(/:(?=[\s(\[])/g)) {
      if (isVerseColon(c.index) || inLink(c.index)) continue;
      last = c.index;
    }
    if (last >= 0) open = { sign: ":", at: last, list_at: last + 1 };
  }
  if (open) {
    e.list_opens = open;
    const tail = definition.slice(open.list_at);
    const stop = listStop(tail);
    const list = stop >= 0 ? tail.slice(0, stop) : tail;
    e.renderings = cutList(list, open.list_at, SIGN_WIKISOURCE);
    if (stop >= 0) {
      e.list_stop = { at: open.list_at + stop };
      const after = tail.slice(stop + 1);
      if (after.trim()) e.after_list = { t: after.replace(/^\s+/, ""), at: open.list_at + stop + 1 + /^\s*/.exec(after)[0].length };
    }
  }

  // the entry's spelled forms and the verses it lists for them
  const rest = text.slice(defEnd + 2);
  const formLines = [];
  let off = defEnd + 2;
  for (const line of rest.split("\n")) {
    if (line.includes(" - [[")) {
      const cut = line.indexOf(" - [[");
      const forms = line.slice(0, cut).split(", ");
      const verses = line.slice(cut + 3).split(" ; ").map((v) => v.replace(/^\[\[/, "").replace(/\]\]$/, ""));
      formLines.push({ at: off, forms, verses });
    } else if (line.trim()) formLines.push({ at: off, other: line });
    off += line.length + 1;
  }
  if (formLines.length) e.form_lines = formLines;
  return e;
}

/** A verse as the edition writes it ("<book> <chapter>, <verse>" in Hebrew
 *  letters) to ours: [book slug, chapter, verse], or null. */
export function wikisourceVerse(v) {
  const m = /^(.*) ([^ ,]+), ([^ ,]+)$/.exec(v);
  if (!m) return null;
  const book = BY_HEBREW_NAME.get(m[1]);
  const ch = hebrewNumber(m[2]), vs = hebrewNumber(m[3]);
  return book && ch && vs ? [book, ch, vs] : null;
}

/** All entries of the edition, from its own pages. pages: the page files as
 *  the edition gives them (raw wikitext), each {name, text}. A page opens with
 *  the edition's book template ({{…|…}}: the author, the book, the page before
 *  and after) and holds a thousand entries, each from its heading «==N==» to
 *  the next: the definition inside {{ltr|1=…}} (the headword and its
 *  pronunciation in bold, a colon, and Strong's text), then the entry's
 *  spelled forms, each line «forms, … - [[book chapter, verse]] ; …». An
 *  entry is keyed by the number its heading writes.
 *
 *  The edition is WHOLE where the pages hold every number from 1 to the last
 *  once: only then is a number they lack a number the edition has no entry
 *  for. A number twice stops the reading. */
export function buildWikisource({ pages }) {
  const entries = {};
  const counts = { entries: 0, pages: pages.length, from_page_file: 0, numbers_missing_below_the_last: 0, no_list_opener: 0, entries_with_no_form_line: 0,
    renderings: 0, renderings_signed_x: 0, renderings_signed_plus: 0, renderings_unbalanced: 0, form_lines: 0, forms: 0, verses: 0, verses_not_read: 0, links: 0, strings: 0 };
  const openers = {};
  const fromPage = new Map();
  const pageHeads = [];
  for (const page of pages) {
    const text = page.text;
    const heads = [...text.matchAll(/^==(\d+)==$/gm)];
    if (!heads.length) throw new Error("wikisource: no entry on the page " + page.name);
    // what stands before the first entry: the edition's book template, held as a run of the page
    pageHeads.push({ file: page.name, entries: heads.length, first: +heads[0][1], last: +heads[heads.length - 1][1], head: { t: text.slice(0, heads[0].index), at: 0 } });
    for (let i = 0; i < heads.length; i++) {
      const from = heads[i].index, to = i + 1 < heads.length ? heads[i + 1].index : text.length;
      if (fromPage.has(+heads[i][1])) throw new Error("wikisource: the number " + heads[i][1] + " twice, on " + fromPage.get(+heads[i][1]).page + " and " + page.name);
      fromPage.set(+heads[i][1], { page: page.name, at: Buffer.byteLength(text.slice(0, from), "utf8"), text: text.slice(from, to) });
    }
  }
  const add = (number, text, where) => {
    const e = readWikisourceEntry(text);
    if (!e) throw new Error("wikisource: entry not read: " + number + " " + where.file);
    Object.assign(e, { read_from: where });
    entries["H" + number] = e;
    counts.entries++;
    if (!e.list_opens) counts.no_list_opener++;
    else openers[e.list_opens.sign] = (openers[e.list_opens.sign] || 0) + 1;
    for (const r of e.renderings || []) {
      if (r.empty) continue;
      counts.renderings++; counts.strings++;
      if (r.sign === "X" || r.sign === "×") counts.renderings_signed_x++;
      if (r.sign === "+") counts.renderings_signed_plus++;
      if (r.unbalanced) counts.renderings_unbalanced++;
    }
    counts.links += (e.links || []).length;
    if (!(e.form_lines || []).some((fl) => fl.forms)) counts.entries_with_no_form_line++;
    counts.strings += 2 + (e.links || []).length + (e.after_list ? 1 : 0);
    for (const fl of e.form_lines || []) {
      if (!fl.forms) continue;
      counts.form_lines++; counts.forms += fl.forms.length; counts.verses += fl.verses.length;
      counts.strings += fl.forms.length + fl.verses.length;
      for (const v of fl.verses) if (!wikisourceVerse(v)) counts.verses_not_read++;
    }
  };
  for (const [number, p] of fromPage) {
    add(number, p.text, { file: p.page, byte: p.at });
    counts.from_page_file++;
  }
  const last = Math.max(...fromPage.keys());
  for (let n = 1; n <= last; n++) if (!fromPage.has(n)) counts.numbers_missing_below_the_last++;
  counts.last_number = last;
  counts.list_openers = openers;
  const sorted = {};
  for (const k of Object.keys(entries).sort((a, b) => +a.slice(1) - +b.slice(1))) sorted[k] = entries[k];
  return { entries: sorted, counts, pages: pageHeads, whole: counts.numbers_missing_below_the_last === 0 };
}

// ------------------------------------------------------------ Open Scriptures

/** The text of one field with the provider's <note> elements left out (they
 *  are Open Scriptures' words, not Strong's), and where each tag stood. */
function fieldView(kids) {
  let text = "";
  const defs = [], links = [], notes = [], words = [];
  const walk = (nodes) => {
    for (const n of nodes) {
      if (typeof n === "string") { text += n; continue; }
      const [name, attrs, sub] = n;
      if (name === "note") { notes.push({ at: text.length, t: textOf(sub || []) }); continue; }
      const at = text.length;
      if (Array.isArray(sub)) walk(sub);
      if (name === "def") defs.push([at, text.length - at]);
      else if (name === "w" && attrs && attrs.src) links.push({ at, t: text.slice(at), to: attrs.src });
      else if (name === "w") words.push({ at, t: text.slice(at), ...(attrs || {}) });
    }
  };
  walk(kids);
  const v = { t: text };
  if (defs.length) v.defs = defs;
  if (links.length) v.links = links;
  if (words.length) v.words = words;
  if (notes.length) v.provider_notes = notes;
  return v;
}

export function buildOpenScripturesStrongs({ buf, wikisource }) {
  const latin = buf.toString("latin1");
  const entries = {};
  const counts = { entries: 0, with_meaning: 0, with_usage: 0, defs: 0, renderings: 0, renderings_signed_x: 0, renderings_signed_plus: 0,
    renderings_after_two_or_more_blanks: 0, of_those_wikisource_writes_plus: 0, of_those_wikisource_writes_x: 0, of_those_wikisource_has_the_rendering_unsigned: 0,
    of_those_no_wikisource_entry_on_hand: 0, of_those_wikisource_entry_lacks_the_rendering: 0,
    renderings_with_two_or_more_blanks_inside: 0, of_those_wikisource_writes_a_sign_there: 0,
    renderings_unbalanced: 0, comma_pieces_held_whole_in_unbalanced_items: 0, empty_pieces: 0, pointers: 0, links: 0, provider_notes: 0, strings: 0, tags_not_nesting: 0 };
  const re = /<entry id="(H\d+)">[\s\S]*?<\/entry>/g;
  let m;
  while ((m = re.exec(latin))) {
    const from = m.index, to = from + m[0].length;
    const { nodes, odd } = readMarkup(latin, from, to);
    counts.tags_not_nesting += odd;
    const el = nodes[0];
    const id = m[1];
    const e = { at: [from, to], x: el };
    for (const kid of el[2]) {
      if (typeof kid === "string") continue;
      const [name, attrs, sub] = kid;
      if (name === "w") e.w = { t: textOf(sub), pos: attrs.pos, pron: attrs.pron, xlit: attrs.xlit, lang: attrs["xml:lang"] };
      else if (name === "source") e.source = fieldView(sub || []);
      else if (name === "meaning") e.meaning = fieldView(sub || []);
      else if (name === "usage") e.usage = fieldView(sub || []);
      else if (name === "note") (e.provider_notes ||= []).push(textOf(sub || []));
    }
    counts.entries++;
    for (const f of ["source", "meaning", "usage"]) {
      if (!e[f]) continue;
      counts.strings++;
      counts.defs += (e[f].defs || []).length;
      counts.links += (e[f].links || []).length;
      counts.provider_notes += (e[f].provider_notes || []).length;
    }
    counts.provider_notes += (e.provider_notes || []).length;
    if (e.meaning) counts.with_meaning++;
    if (e.usage) {
      counts.with_usage++;
      const text = e.usage.t;
      const stop = listStop(text);
      const list = stop >= 0 ? text.slice(0, stop) : text;
      const items = cutList(list, 0, SIGN_OPEN_SCRIPTURES);
      const ws = wikisource && wikisource[id];
      const wsItems = ws && ws.renderings ? ws.renderings.filter((r) => !r.empty) : null;

      for (const it of items) {
        if (it.empty) { counts.empty_pieces++; continue; }
        counts.renderings++; counts.strings++;
        if (it.sign === "×" || it.sign === "X") counts.renderings_signed_x++;
        if (it.sign === "+") counts.renderings_signed_plus++;
        if (it.unbalanced) counts.renderings_unbalanced++;
        if (it.comma_pieces_held_whole) counts.comma_pieces_held_whole_in_unbalanced_items += it.comma_pieces_held_whole;
        // the same trace inside an item: a bracket that opens on blanks, "(  as) yet", where Strong wrote "(+ as) yet"
        if (/\s{2,}/.test(it.t)) {
          counts.renderings_with_two_or_more_blanks_inside++;
          it.lost_sign_trace_inside = true;
          const key = squeeze(it.t);
          const w = wsItems && wsItems.find((r) => squeeze(r.t.replace(/(^|[(\[\s])[+X\xd7]\s/g, "$1")) === key && r.t !== it.t);
          if (w) { it.as_wikisource_writes_it = w.t; counts.of_those_wikisource_writes_a_sign_there++; }
        }
        if (!it.sign && it.blanks_before >= 2) {
          counts.renderings_after_two_or_more_blanks++;
          it.lost_sign_trace = true; // the file's own bytes: two or more blanks stand before this rendering
          if (!wsItems) { it.wikisource = "no entry on hand"; counts.of_those_no_wikisource_entry_on_hand++; }
          else {
            const key = squeeze(it.t);
            const w = wsItems.find((r) => squeeze(r.t) === key);
            if (!w) { it.wikisource = "the entry does not list this rendering in these words"; counts.of_those_wikisource_entry_lacks_the_rendering++; }
            else if (w.sign === "+") { it.wikisource_sign = "+"; counts.of_those_wikisource_writes_plus++; }
            else if (w.sign) { it.wikisource_sign = w.sign; counts.of_those_wikisource_writes_x++; }
            else { it.wikisource = "lists it with no sign"; counts.of_those_wikisource_has_the_rendering_unsigned++; }
          }
        }
      }
      e.usage.renderings = items;
      if (stop >= 0) {
        e.usage.list_stop = { at: stop };
        const after = text.slice(stop + 1);
        if (after.trim()) {
          const lead = /^\s*/.exec(after)[0].length;
          const t = after.slice(lead);
          const at = stop + 1 + lead;
          const kind = /^(See|Compare|Comp\.)\b/.test(t) ? "pointer" : "remark";
          e.usage.after_list = { t, at, kind, links: (e.usage.links || []).filter((l) => l.at >= at).map((l) => l.to) };
          if (kind === "pointer") counts.pointers++;
          counts.strings++;
        }
      }
    }
    entries[id] = e;
  }
  return { entries, counts };
}
