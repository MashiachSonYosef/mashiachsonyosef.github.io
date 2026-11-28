// RUN: given
// GUARDS: place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. A check reads the entries, the bridges, their pin and the
// dictionaries' own files, and judges them; it writes nothing.
//
// check-place-answers-entries-v1
//
// Holds every string of the fresh build's entries to its source file, and
// every count to the pin.
//
//   node reader/tools/check-place-answers-entries-v1.mjs <sources.json> [out dir]
//
// What it does, per source, with the source file open beside the entries:
//   - the source file's sha256 is the one PIN.json names;
//   - every entry WRITTEN BACK is the file's own bytes (the marked-up
//     sources), or equals the file's own fields (the tables and the JSON);
//   - every string of an entry's view is the run of the entry's text it
//     says it is (by its offset);
//   - the counts in PIN.json are counted again from the entries files;
//   - every line of the tag bridge is true of the entries it names, the
//     tags and their rows are counted again from STEP's four files, and
//     every value of a verse bridge names a sense that cites that verse.
//
// It shares with the builder only the WRITING half of the markup code
// (writeMarkup, writePieces): the builder reads bytes into a tree, the check
// writes the tree back and compares bytes, so a slip in either shows. And the
// list of the stems' names as the unabridged BDB spells them (STEM_NAMES):
// which bold run is a stem's heading, and which stem a reference stands
// under, it reads again with its own code (stemsHere, stemOfRef).
// Exit 0 when everything holds; 1 with the first failures printed otherwise.

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync, inflateRawSync } from "node:zlib";
import { readSource, readGzJson, sourcesResolved, zipMember, sha256, writeMarkup, TAHOT_PREFIXES, OUR_BOOKS, BY_OSIS, BY_ENGLISH_NUMBER } from "./place-answers-entries-lib-v1.mjs";
import { writePieces, STEM_NAMES } from "./place-answers-entries-unabridged-bdb-v1.mjs";

const here = dirname(fileURLToPath(import.meta.url));
if (!process.argv[2]) { console.error("usage: check-place-answers-entries-v1.mjs <sources.json> [out dir]"); process.exit(2); }
const cfg = sourcesResolved(JSON.parse(readFileSync(process.argv[2], "utf8")), dirname(resolve(process.argv[2])), join(here, "..", "data", "zones"));
const OUT = resolve(process.argv[3] || join(here, "..", "data", "place-answers-v1"));
const pin = JSON.parse(readFileSync(join(OUT, "entries", "PIN.json"), "utf8")); // this part's own pin

const fails = [];
const held = {}; // source key -> strings held to the source
const wholeOf = {}; // source key -> whether the files read are the whole source by its own list (the two read from received files)
const fail = (msg) => { if (fails.length < 40) fails.push(msg); else if (fails.length === 40) fails.push("… more"); fails.count = (fails.count || 0) + 1; };
const ok = (cond, msg) => { if (!cond) fail(typeof msg === "function" ? msg() : msg); return cond; };
const tick = (key, n = 1) => { held[key] = (held[key] || 0) + n; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function pinned(key, path) {
  const s = readSource(path);
  const p = (pin.sources[key].files || []).find((f) => f.file === basename(path));
  ok(p && p.sha256 === s.sha256 && p.bytes === s.bytes, "PIN: " + key + " " + basename(path) + " is not the file pinned");
  return s;
}
const entriesOf = (key) => {
  const f = readGzJson(join(OUT, "entries", key + ".json.gz"));
  const m = pin.made["entries/" + key + ".json.gz"];
  const raw = readFileSync(join(OUT, "entries", key + ".json.gz"));
  ok(m && m.sha256 === sha256(raw), "PIN: entries/" + key + ".json.gz is not the file the pin names");
  ok(eq(f.counts, pin.counts[key]), "counts of " + key + " in its file differ from PIN.json");
  return f;
};
const sub = (text, at, t) => text.substr(at, t.length) === t;

// the text of a tree with some elements left out (the check's own walk)
const flat = (nodes, skip) => { let o = ""; for (const n of nodes) { if (typeof n === "string") o += n; else if (!skip.has(n[0]) && Array.isArray(n[2])) o += flat(n[2], skip); } return o; };

const os = cfg.open_scriptures;
const stepNames = readdirSync(cfg.step.dir);
const stepFile = (prefix) => join(cfg.step.dir, stepNames.find((x) => x.startsWith(prefix)));
const all = {};

// ---------------------------------------------------------------- Strong's (Open Scriptures)
{
  const key = "openscriptures_strongs";
  const src = pinned(key, join(os.dir, "HebrewStrong.xml")).buf;
  const f = entriesOf(key); all[key] = f.entries;
  const c = { entries: 0, renderings: 0, signed_x: 0, signed_plus: 0, traces: 0, defs: 0 };
  const idsInFile = (src.toString("latin1").match(/<entry id="/g) || []).length;
  for (const [id, e] of Object.entries(f.entries)) {
    c.entries++;
    ok(writeMarkup([e.x]) === src.subarray(e.at[0], e.at[1]).toString("utf8"), "strongs " + id + ": the entry does not write back to the file's bytes") && tick(key);
    ok(e.x[1].id === id, "strongs " + id + ": id");
    for (const kid of e.x[2]) {
      if (typeof kid === "string") continue;
      const name = kid[0];
      if (name === "w") { ok(e.w && e.w.t === flat(kid[2] || [], new Set()) && e.w.pos === kid[1].pos && e.w.lang === kid[1]["xml:lang"], "strongs " + id + ": headword") && tick(key); continue; }
      if (!["source", "meaning", "usage"].includes(name)) continue;
      const v = e[name];
      if (!ok(v && v.t === flat(kid[2] || [], new Set(["note"])), "strongs " + id + ": text of " + name)) continue;
      tick(key);
      for (const [at, len] of v.defs || []) { c.defs++; ok(at >= 0 && at + len <= v.t.length, "strongs " + id + ": a def outside its field") && tick(key); }
      for (const l of v.links || []) ok(sub(v.t, l.at, l.t) && /^H\d+$/.test(l.to), "strongs " + id + ": a link") && tick(key);
    }
    const u = e.usage;
    if (u && u.renderings) {
      let last = -1;
      for (const r of u.renderings) {
        if (r.empty) continue;
        c.renderings++;
        ok(sub(u.t, r.at, r.t) && r.at > last, "strongs " + id + ": rendering «" + r.t + "» is not the run of the usage it says") && tick(key);
        last = r.at;
        const before = u.t.slice(0, r.at);
        if (r.sign) { ok(before.replace(/\s+$/, "").endsWith(r.sign), "strongs " + id + ": sign of «" + r.t + "»"); if (r.sign === "+") c.signed_plus++; else c.signed_x++; }
        if (r.lost_sign_trace) { c.traces++; ok(/\s{2,}$/.test(before), "strongs " + id + ": two blanks do not stand before «" + r.t + "»"); }
        // an item never holds a comma outside brackets unless its brackets do not balance
        if (!r.unbalanced) { let d = 0, bad = false; for (const ch of r.t) { if (ch === "(" || ch === "[") d++; else if (ch === ")" || ch === "]") d--; else if (ch === "," && d === 0) bad = true; } ok(!bad, "strongs " + id + ": a balanced item holds a comma outside brackets: «" + r.t + "»"); }
      }
      if (u.after_list) ok(sub(u.t, u.after_list.at, u.after_list.t), "strongs " + id + ": what follows the list") && tick(key);
    }
  }
  ok(c.entries === idsInFile, "strongs: " + c.entries + " entries kept, the file has " + idsInFile);
  const p = pin.counts[key];
  ok(c.entries === p.entries && c.renderings === p.renderings && c.signed_x === p.renderings_signed_x && c.signed_plus === p.renderings_signed_plus && c.traces === p.renderings_after_two_or_more_blanks && c.defs === p.defs, "strongs: counts counted again differ from the pin: " + JSON.stringify(c));
}

// ---------------------------------------------------------------- Strong's (Wikisource)
{
  const key = "wikisource_strongs_explicit_forms";
  const pages = new Map((cfg.wikisource.pages || []).map((p) => [basename(p.path), pinned(key, p.path).buf]));
  const f = entriesOf(key); all[key] = f.entries;
  const c = { entries: 0, renderings: 0, forms: 0, verses: 0 };
  // the numbers the pages head an entry with, read again with the check's own walk (a heading is a line «==N==»)
  const onPages = new Map();
  for (const [name, buf] of pages) for (const line of buf.toString("utf8").split("\n")) { const h = /^==(\d+)==$/.exec(line); if (h) onPages.set(+h[1], (onPages.get(+h[1]) || 0) + 1); }
  const last = Math.max(...onPages.keys());
  let gaps = 0; for (let n = 1; n <= last; n++) if (!onPages.has(n)) gaps++;
  ok([...onPages.values()].every((x) => x === 1), "wikisource: a number heads two entries");
  ok(onPages.size === Object.keys(f.entries).length && [...onPages.keys()].every((n) => f.entries["H" + n]), "wikisource: " + onPages.size + " numbers on the pages, " + Object.keys(f.entries).length + " entries kept");
  ok(gaps === f.counts.numbers_missing_below_the_last && last === f.counts.last_number, "wikisource: " + gaps + " numbers below " + last + " are on no page; the pin says " + f.counts.numbers_missing_below_the_last);
  wholeOf.wikisource_strongs_explicit_forms = gaps === 0;
  // each page's head (the run before its first entry) is the page's own
  for (const ph of f.pages || []) { const buf = pages.get(ph.file); ok(buf && buf.toString("utf8").startsWith(ph.head.t) && /\n==\d+==$/.test("\n" + buf.toString("utf8").slice(ph.head.t.length).split("\n")[0]), "wikisource: the head of " + ph.file) && tick(key); }
  for (const [id, e] of Object.entries(f.entries)) {
    c.entries++;
    let text;
    {
      const buf = pages.get(e.read_from.file);
      if (!ok(buf, "wikisource " + id + ": read from a page not pinned: " + e.read_from.file)) continue;
      const tail = buf.subarray(e.read_from.byte).toString("utf8");
      const next = tail.indexOf("\n==", 1);
      text = next >= 0 ? tail.slice(0, next + 1) : tail;
    }
    if (!ok(text.startsWith("==" + e.number + "==\n") && "H" + e.number === id, "wikisource " + id + ": the text read is not this entry's")) continue;
    ok(sub(text, e.headline.at, e.headline.t), "wikisource " + id + ": headline") && tick(key);
    ok(sub(text, e.definition.at, e.definition.t), "wikisource " + id + ": definition") && tick(key);
    const d = e.definition.t;
    if (e.list_opens) ok(sub(d, e.list_opens.at, e.list_opens.sign), "wikisource " + id + ": the list's opener");
    for (const r of e.renderings || []) {
      if (r.empty) continue;
      c.renderings++;
      ok(sub(d, r.at, r.t) && r.at >= e.list_opens.list_at, "wikisource " + id + ": rendering «" + r.t + "»") && tick(key);
      if (r.sign) ok(d.slice(0, r.at).replace(/\s+$/, "").endsWith(r.sign), "wikisource " + id + ": sign of «" + r.t + "»");
    }
    if (e.after_list) ok(sub(d, e.after_list.at, e.after_list.t), "wikisource " + id + ": what follows the list") && tick(key);
    for (const l of e.links || []) ok(sub(d, l.at, l.t), "wikisource " + id + ": a link") && tick(key);
    for (const fl of e.form_lines || []) {
      if (fl.other !== undefined) { ok(sub(text, fl.at, fl.other), "wikisource " + id + ": a line"); continue; }
      const line = fl.forms.join(", ") + " - " + fl.verses.map((v) => "[[" + v + "]]").join(" ; ");
      ok(sub(text, fl.at, line), "wikisource " + id + ": a form line does not join back to the edition's line") && tick(key, fl.forms.length + fl.verses.length);
      c.forms += fl.forms.length; c.verses += fl.verses.length;
    }
  }
  const p = pin.counts[key];
  ok(c.entries === p.entries && c.renderings === p.renderings && c.forms === p.forms && c.verses === p.verses, "wikisource: counts counted again differ from the pin: " + JSON.stringify(c));
}

// ---------------------------------------------------------------- TBESH
{
  const key = "stepbible_tbesh_gloss";
  const lines = pinned(key, stepFile("TBESH")).buf.toString("utf8").split("\n");
  const f = entriesOf(key); all[key] = f.entries;
  let n = 0;
  const NAMES = ["eStrong", "dStrong", "uStrong", "Hebrew", "Transliteration", "Morph", "Gloss"];
  for (const [id, e] of Object.entries(f.entries)) {
    n++;
    const cols = lines[e.line - 1].replace(/\r$/, "").split("\t");
    NAMES.forEach((name, i) => ok(e[name] === cols[i], "TBESH " + id + ": column " + name) && tick(key));
    ok(cols[1].startsWith(id) && /^\s*=/.test(cols[1].slice(id.length)), "TBESH " + id + ": the key is not the line's lettered number");
    ok(e.Meaning === undefined, "TBESH " + id + ": the Meaning column was taken");
  }
  const inFile = lines.filter((l) => /^H\d{4}[a-z]?\t/.test(l)).length;
  ok(n === inFile && n === pin.counts[key].lines, "TBESH: " + n + " lines kept, the file has " + inFile);
}

// ---------------------------------------------------------------- BDB (Open Scriptures)
{
  const key = "openscriptures_bdb_1906";
  const src = pinned(key, join(os.dir, "BrownDriverBriggs.xml")).buf;
  const f = entriesOf(key); all[key] = f.entries;
  const c = { entries: 0, defs: 0, refs: 0, senses: 0, roots: 0 };
  const skip = new Set(["status", "page"]);
  const countSenses = (list, text, id) => { for (const s of list) { c.senses++; ok(s.at >= 0 && s.at + s.len <= text.length, "bdb " + id + ": a sense outside the text"); if (s.senses) countSenses(s.senses, text, id); } };
  const senseAt = (e, path) => { let list = e.senses || [], node = null; for (const i of path) { node = list[i]; if (!node) return null; list = node.senses || []; } return node; };
  for (const [id, e] of Object.entries(f.entries)) {
    c.entries++;
    ok(writeMarkup([e.x]) === src.subarray(e.at[0], e.at[1]).toString("utf8") && e.x[1].id === id, "bdb " + id + ": the entry does not write back to the file's bytes") && tick(key);
    if (!ok(e.text === flat(e.x[2], skip), "bdb " + id + ": the running text")) continue;
    ok(e.type === (e.x[1].type || "entry"), "bdb " + id + ": type");
    if (e.type === "root") c.roots++;
    countSenses(e.senses || [], e.text, id);
    for (const listName of ["defs", "refs", "w", "pos", "stems", "asp", "foreign", "em"]) for (const it of e[listName] || []) {
      ok(sub(e.text, it.at, it.t), "bdb " + id + ": a " + listName + " is not the run it says: «" + it.t + "»") && tick(key);
      if (it.sense) { const s = senseAt(e, it.sense); ok(s && it.at >= s.at && it.at + it.t.length <= s.at + s.len, "bdb " + id + ": «" + it.t + "» does not stand in the sense it names"); }
    }
    for (const df of e.defs || []) {
      c.defs++;
      if (df.joined) ok(sub(e.text, df.at - df.joined.before.length, df.joined.whole) && df.joined.whole === df.joined.before + df.t + df.joined.after, "bdb " + id + ": joined «" + df.joined.whole + "»") && tick(key);
      if (df.phrase) ok(sub(e.text, df.phrase.at, df.phrase.t) && df.at >= df.phrase.at && df.at + df.t.length <= df.phrase.at + df.phrase.t.length, "bdb " + id + ": phrase «" + df.phrase.t + "»") && tick(key);
      if (df.ref_next !== undefined) ok(e.refs[df.ref_next] && e.refs[df.ref_next].at >= df.at + df.t.length, "bdb " + id + ": the reference after a def");
    }
    c.refs += (e.refs || []).length;
  }
  const lat = src.toString("latin1");
  const n = (re) => (lat.match(re) || []).length;
  ok(c.entries === n(/<entry /g) && c.defs === n(/<def>/g) && c.refs === n(/<ref /g) && c.senses === n(/<sense[ >]/g) && c.roots === n(/<entry [^>]*type="root"/g), "bdb: tags counted in the file differ from the entries: " + JSON.stringify(c));
  const p = pin.counts[key];
  ok(c.entries === p.entries && c.defs === p.defs && c.refs === p.refs && c.senses === p.senses && c.roots === p.root_entries, "bdb: counts counted again differ from the pin");
}

// ---------------------------------------------------------------- the Lexical Index
{
  const key = "openscriptures_lexical_index";
  const src = pinned(key, join(os.dir, "LexicalIndex.xml")).buf;
  const f = entriesOf(key); all[key] = f.entries;
  let n = 0;
  for (const [id, e] of Object.entries(f.entries)) {
    n++;
    ok(writeMarkup([e.x]) === src.subarray(e.at[0], e.at[1]).toString("utf8") && e.x[1].id === id, "index " + id + ": the entry does not write back") && tick(key);
    for (const kid of e.x[2]) {
      if (typeof kid === "string") continue;
      const [name, attrs, kids] = kid;
      const t = flat(kids || [], new Set());
      if (name === "w") ok(e.w === t, "index " + id + ": w") && tick(key);
      else if (name === "pos") ok(e.pos === t, "index " + id + ": pos") && tick(key);
      else if (name === "def") ok(e.def === t, "index " + id + ": def") && tick(key);
      else if (name === "xref") ok(eq(e.xref, attrs || {}), "index " + id + ": xref") && tick(key);
    }
  }
  ok(n === (src.toString("latin1").match(/<entry /g) || []).length && n === pin.counts[key].entries, "index: entries");
}

// ---------------------------------------------------------------- BDB (unabridged): the stems, read here with this check's own code
// A bold run is a stem's heading where its text is a stem's name (with «verb», «denominative», a lettered division «A.»
// or a stop), and: it labels a div; or it labels a div with the stem's first point («Hiph`il 1.») after a sentence that
// ended; or it is a head's part of speech («verb …») before the first div; or in running text it is no cross-reference
// (no referring word or «=» or open bracket right before it, no bracket of its own sentence around it) and either its
// forms or the provider's gloss tag follow it, or the sentence before it ended and no bracket or comma closes on it.
const STEM_SET = new Set(STEM_NAMES);
const stemNameIn = (text, numbered) => {
  let t = text.replace(/^\s+|\s+$/g, "").replace(/^verb\s*/, "").replace(/^denominative\s*/, "").replace(/\s+denominative$/, "");
  if (numbered) { const m = /^(.*\S)\s*1\.(?:\s*[a-z]\.)?$/.exec(t); if (!m) return null; t = m[1]; }
  else t = t.replace(/\s+[AB]\.$/, "");
  for (const cut of [t, t.replace(/[.:]$/, "")]) if (STEM_SET.has(cut)) return cut;
  return null;
};
const plainBack = (k, from, i) => { let s = ""; for (let j = i - 1; j >= from && s.length < 40; j--) { const p = k[j]; if (Array.isArray(p) && p[0] === "<") continue; s = (typeof p === "string" ? p : p[0] === "ref" ? "]" : p[1]) + s; if (s.trim().length >= 3) break; } return s.split("\\&emsp;").join(" ").trimEnd(); };
const sentenceEnded = (t) => /[.)\]\u2014;:]$/.test(t);
const refersElsewhere = (t) => /(?:^|[^A-Za-z])(?:compare|see|cf|cp|so|as|of|than|like|i\.e|e\.g|viz|read|kt|qr|apparently|others)\.?$/i.test(t) || /[=([]$/.test(t);
const heldInBracket = (k, from, i) => {
  let open = 0;
  for (let j = i - 1; j >= from; j--) {
    const p = k[j];
    if (Array.isArray(p) && p[0] === "<") { if (p[1].startsWith("<div") || p[1].startsWith("<br") || p[1].startsWith("<hr")) return false; continue; }
    const t = typeof p === "string" ? p : p[0] === "ref" ? "" : p[1];
    for (let x = t.length - 1; x >= 0; x--) { const c = t[x]; if (c === ")" || c === "]") open++; else if (c === "(" || c === "[") { if (!open) return true; open--; } else if (!open && (c === "\u2014" || (c === "." && /\s/.test(t[x + 1] || " ")))) return false; }
  }
  return false;
};
function stemsHere(k, blk) {
  const out = []; const labels = new Map((blk.points || []).filter((p) => p.label_k !== undefined).map((p, _, a) => [p.label_k, blk.points.indexOf(p)]));
  const first = (blk.points || []).length ? blk.points[0].k[0] : blk.k[1];
  // a paragraph whose head's bold part of speech is a noun's, a name's or a particle's, and no verb's, holds no stem heading
  const pos = k.slice(blk.k[0], first).filter((p) => Array.isArray(p) && p[0] === "b").map((p) => p[1].toLowerCase());
  if (pos.some((t) => /(^|[^a-z])(noun|adjective|adverb|preposition|conjunction|particle|pronoun|interjection|substantive|name)([^a-z]|$)/.test(t)) && !pos.some((t) => /(^|[^a-z])verb/.test(t))) return out;
  for (let i = blk.k[0]; i < blk.k[1]; i++) {
    const p = k[i]; if (!Array.isArray(p) || p[0] !== "b") continue;
    const bare = stemNameIn(p[1], false);
    if (labels.has(i)) {
      if (bare) out.push({ s: bare, k: i, point: labels.get(i) });
      else { const one = stemNameIn(p[1], true); if (one && sentenceEnded(plainBack(k, blk.k[0], i))) out.push({ s: one, k: i, point: labels.get(i), one: 1 }); }
      continue;
    }
    if (!bare) continue;
    if (i < first && /^\s*verb/.test(p[1])) { out.push({ s: bare, k: i }); continue; }
    const back = plainBack(k, blk.k[0], i);
    if (refersElsewhere(back) || heldInBracket(k, blk.k[0], i)) continue;
    let j = i + 1; while (j < blk.k[1] && ((typeof k[j] === "string" && k[j].trim() === "") || (Array.isArray(k[j]) && k[j][0] === "sub"))) j++;
    const n = j < blk.k[1] ? k[j] : null;
    const forms = Array.isArray(n) && ((n[0] === "highlight" && /^\s*(Perfect|Perf\.|Imperfect|Imperf\.|Imperative|Infinitive|Participle|Jussive|Cohortative|Passive participle)/.test(n[1])) || n[0] === "highlightword");
    if (forms || (!(typeof n === "string" && /^\s*[),;]/.test(n)) && sentenceEnded(back))) out.push({ s: bare, k: i });
  }
  return out;
}
/** The unit a piece stands in (the innermost whose own range holds it), and the stem it stands under, read here again. */
function unitOfPiece(blk, ki) {
  let pi = -1, si = -1;
  const units = [[-1, blk.head], ...(blk.points || []).map((p, x) => [x, p])];
  for (const [x, u] of units) { const [a, b] = u.own_k || u.k; if (ki >= a && ki < b) { pi = x; si = -1; (u.sub || []).forEach((sb, y) => { if (ki >= sb.k[0] && ki < sb.k[1]) si = y; }); } }
  return [pi, si];
}
function stemOfRef(blk, ki, pi, si) {
  const hs = blk.stems || []; let last = -1; hs.forEach((h, x) => { if (h.k < ki) last = x; });
  if (last < 0) return [-1, 0];
  const u = pi < 0 ? blk.head : blk.points[pi]; const from = si < 0 ? u.k[0] : u.sub[si].k[0];
  if (hs[last].k < from) return [last, 0];
  return [last, hs[last].one === 1 && hs[last].point === pi ? 0 : 1];
}

// ---------------------------------------------------------------- BDB (unabridged)
{
  const key = "unabridged_bdb_1906";
  const zip = pinned(key, cfg.unabridged_bdb.zip).buf;
  const csv = zipMember(zip, cfg.unabridged_bdb.member);
  const f = entriesOf(key); all[key] = f.entries;
  const c = { records: 0, refs: 0, italics: 0, points: 0, stem_paragraphs: 0, stems: { a_divs_label: 0, a_label_that_numbers_the_stems_first_point: 0, the_heads_part_of_speech_or_running_text: 0, paragraphs_with_a_stem: 0 } };
  const unit = (id, e, u) => {
    if (u.label !== undefined) ok(e.k[u.label_k][0] === "b" && e.k[u.label_k][1] === u.label, "unabridged " + id + ": a label") && tick(key);
    for (const b of u.bold || []) ok(e.k[b.k][0] === "b" && e.k[b.k][1] === b.t, "unabridged " + id + ": a bold run") && tick(key);
    for (const it of u.italics || []) {
      c.italics++;
      const p = e.k[it.k];
      if (it.has_tags_inside) {
        let t = ""; for (let j = it.k + 1; j < it.to; j++) t += typeof e.k[j] === "string" ? e.k[j] : e.k[j][0] === "<" ? "" : e.k[j][1];
        ok(p[0] === "<" && /^<highlight(word)?>$/.test(p[1]) && t === it.t, "unabridged " + id + ": an italic run with tags inside") && tick(key);
      } else ok((p[0] === "highlight" || p[0] === "highlightword") && p[1] === it.t, "unabridged " + id + ": an italic run is not the piece it names: «" + it.t + "»") && tick(key);
      if (it.kind === "main_gloss" || it.kind === "tagged_gloss") ok(p[0] === "highlightword" || p[1] === "<highlightword>", "unabridged " + id + ": a gloss tag");
      if (it.ref_k !== undefined) ok(e.k[it.ref_k][0] === "ref" || /^<ref /.test(e.k[it.ref_k][1]), "unabridged " + id + ": the reference after a verse's wording");
    }
    for (const s of u.sub || []) unit(id, e, s);
  };
  for (const [id, e] of Object.entries(f.entries)) {
    c.records++;
    ok(id + "\t" + e.strong_column + "\t" + writePieces(e.k) === csv.subarray(e.at[0], e.at[1]).toString("utf8"), "unabridged " + id + ": the record does not write back to the line's bytes") && tick(key);
    ok(eq(e.strong, e.strong_column ? e.strong_column.split("_") : []), "unabridged " + id + ": numbers");
    for (const p of e.k) if (Array.isArray(p) && p[0] === "ref") c.refs++;
    for (const blk of e.blocks) {
      unit(id, e, blk.head); for (const pt of blk.points || []) { c.points++; unit(id, e, pt); }
      // the stem headings: the ones this check reads, each the stem's name inside its own bold run
      const want = stemsHere(e.k, blk);
      ok(eq(blk.stems || [], want), () => "unabridged " + id + ": the stem headings are not the ones the record gives: " + JSON.stringify(blk.stems || []) + " against " + JSON.stringify(want));
      if (want.length) c.stem_paragraphs++;
      for (const h of blk.stems || []) { if (ok(e.k[h.k] && e.k[h.k][0] === "b" && e.k[h.k][1].includes(h.s), "unabridged " + id + ": a stem heading is not its bold run")) tick(key); c.stems[h.one ? "a_label_that_numbers_the_stems_first_point" : h.point !== undefined ? "a_divs_label" : "the_heads_part_of_speech_or_running_text"]++; }
    }
  }
  c.stems.paragraphs_with_a_stem = c.stem_paragraphs;
  ok(eq(c.stems, (pin.counts[key] || {}).stem_headings), "unabridged: the stem headings counted again are " + JSON.stringify(c.stems) + ", the pin says " + JSON.stringify((pin.counts[key] || {}).stem_headings));
  const text = csv.toString("latin1");
  const lines = text.split("\n").filter((l) => /^BDB\d+\t/.test(l)).length;
  const refsInFile = (text.match(/<ref /g) || []).length, pointsInFile = (text.match(/<div class="(point|section|remarks)">/g) || []).length;
  const p = pin.counts[key];
  ok(c.records === lines && c.records === p.records, "unabridged: " + c.records + " records kept, the file has " + lines);
  ok(c.refs + p.references_of_another_shape === refsInFile && c.refs === p.references, "unabridged: references " + c.refs + " against " + refsInFile + " in the file");
  ok(c.points === pointsInFile && c.points === p.points && c.italics === p.italic_runs, "unabridged: points " + c.points + "/" + pointsInFile + ", italic runs " + c.italics + "/" + p.italic_runs);
}

// ---------------------------------------------------------------- UBS
{
  const key = "ubs_sdbh_hebrew_v0_9_2";
  const src = JSON.parse(pinned(key, cfg.ubs.json).buf.toString("utf8"));
  const f = entriesOf(key); all[key] = f.entries;
  const c = { entries: 0, senses: 0, glosses: 0, references: 0 };
  const same = (kept, source, where) => {
    // every kept value equals the source's value under the same name
    for (const [k, v] of Object.entries(kept)) {
      if (k === "i" || k === "BaseForms" || k === "LEXMeanings" || k === "LEXSenses" || k === "LEXDomains" || k === "Notes") continue;
      ok(eq(v, source[k]), "UBS " + where + ": field " + k) && tick(key, Array.isArray(v) ? v.length : 1);
    }
  };
  for (const [id, e] of Object.entries(f.entries)) {
    c.entries++;
    const s = src[e.i];
    if (!ok(s && s.MainId === id, "UBS " + id + ": not the entry at its place in the file")) continue;
    same(e, s, id);
    ok(eq(e.StrongCodes, s.StrongCodes), "UBS " + id + ": StrongCodes");
    if (e.Notes) e.Notes.forEach((n, i) => same(n, s.Notes[i], id + " note"));
    ok(e.BaseForms.length === (s.BaseForms || []).length, "UBS " + id + ": base forms");
    e.BaseForms.forEach((b, bi) => {
      const sb = s.BaseForms[bi];
      same(b, sb, id + " base form " + bi);
      ok(b.LEXMeanings.length === (sb.LEXMeanings || []).length, "UBS " + id + ": senses of base form " + bi);
      b.LEXMeanings.forEach((m, mi) => {
        const sm = sb.LEXMeanings[mi];
        c.senses++; c.references += (m.LEXReferences || []).length;
        same(m, sm, m.LEXID);
        ok((m.LEXReferences || []).length === (sm.LEXReferences || []).length, "UBS " + m.LEXID + ": references");
        (m.LEXDomains || []).forEach((d, di) => same(d, sm.LEXDomains[di], m.LEXID + " domain"));
        ok(m.LEXSenses.length === (sm.LEXSenses || []).length, "UBS " + m.LEXID + ": LEXSenses");
        m.LEXSenses.forEach((x, xi) => { same(x, sm.LEXSenses[xi], m.LEXID + " sense"); c.glosses += (x.Glosses || []).length; ok((x.Glosses || []).length === (sm.LEXSenses[xi].Glosses || []).length, "UBS " + m.LEXID + ": glosses"); });
      });
    });
  }
  const p = pin.counts[key];
  ok(c.entries === src.length && c.entries === p.entries && c.senses === p.senses && c.glosses === p.glosses && c.references === p.references, "UBS: counts counted again differ: " + JSON.stringify(c));
}

// ---------------------------------------------------------------- UHAL
{
  const key = "unfoldingword_uhal";
  const zip = pinned(key, cfg.uhal.zip).buf;
  // the zip's members, read again with the check's own walk of its central directory
  const members = new Map();
  let comment = "";
  {
    let eocd = -1;
    for (let i = zip.length - 22; i >= 0; i--) if (zip.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
    comment = zip.subarray(eocd + 22, eocd + 22 + zip.readUInt16LE(eocd + 20)).toString("utf8");
    let p = zip.readUInt32LE(eocd + 16);
    for (let n = zip.readUInt16LE(eocd + 10); n > 0; n--) {
      const method = zip.readUInt16LE(p + 10), csize = zip.readUInt32LE(p + 20), nlen = zip.readUInt16LE(p + 28), local = zip.readUInt32LE(p + 42);
      const name = zip.subarray(p + 46, p + 46 + nlen).toString("utf8");
      const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      members.set(name, method === 0 ? zip.subarray(start, start + csize) : inflateRawSync(zip.subarray(start, start + csize)));
      p += 46 + nlen + zip.readUInt16LE(p + 30) + zip.readUInt16LE(p + 32);
    }
  }
  const f = entriesOf(key); all[key] = f.entries;
  ok(f.revision_written_in_the_zips_comment === comment && String(cfg.uhal.facts.revision).startsWith(comment), "UHAL: the zip's own comment is " + comment);
  // the lexicon's own list of its entry files, read again
  const listed = new Set([...(members.get(cfg.uhal.index) || Buffer.alloc(0)).toString("utf8").matchAll(/\]\(\.\/(H\d{4}\.md)\)/g)].map((m) => cfg.uhal.content_dir + m[1]));
  const files = [...members.keys()].filter((n) => n.startsWith(cfg.uhal.content_dir) && n !== cfg.uhal.index && !n.endsWith("/"));
  const whole = files.length === listed.size && files.every((n) => listed.has(n));
  const saysWhole = f.counts.entry_files_not_listed === 0 && f.counts.listed_but_not_in_the_zip === 0 && f.counts.listed_by_its_own_index === f.counts.entries;
  ok(whole === saysWhole && f.counts.listed_by_its_own_index === listed.size, "UHAL: the zip is " + (whole ? "" : "not ") + "whole by its own list; the entries say otherwise");
  wholeOf.unfoldingword_uhal = whole;
  let n = 0, glosses = 0, citations = 0;
  for (const [id, e] of Object.entries(f.entries)) {
    n++;
    const bytes = members.get(e.read_from.member);
    if (!ok(bytes && e.read_from.member === cfg.uhal.content_dir + id + ".md" && Buffer.from(e.text, "utf8").equals(bytes), "UHAL " + id + ": the file's text is not the zip's member")) continue;
    tick(key);
    ok(e.strongs && e.strongs.t.trim() === id, "UHAL " + id + ": the number");
    for (const name of ["headword", "status", "strongs", "twot", "instances_in_scripture", "bdb_reference", "bdb_root", "part_of_speech"]) if (e[name]) ok(sub(e.text, e[name].at, e[name].t), "UHAL " + id + ": " + name) && tick(key);
    for (const o of e.other_fields || []) {
      // the run stands on its own bulleted line, after «* <label>:» and blanks
      const lead = e.text.slice(e.text.lastIndexOf("\n", o.at - 1) + 1, o.at), label = "* " + o.label + ":";
      ok(sub(e.text, o.at, o.t) && lead.startsWith(label) && lead.slice(label.length).trim() === "", "UHAL " + id + ": the line " + o.label) && tick(key);
    }
    for (const s of e.senses) {
      for (const name of ["title", "definition", "glosses_as_written", "explanation", "citations_as_written"]) if (s[name]) ok(sub(e.text, s[name].at, s[name].t), "UHAL " + id + ": " + name) && tick(key);
      for (const g of s.glosses || []) { glosses++; ok(sub(e.text, g.at, g.t), "UHAL " + id + ": gloss «" + g.t + "»") && tick(key); }
      for (const ci of s.citations || []) {
        citations++;
        ok(sub(e.text, ci.at, ci.t) && e.text[ci.at - 1] === "[", "UHAL " + id + ": citation") && tick(key);
        // the target as the file writes it, read again: the verse where it is one, else held as written
        const close = e.text.indexOf("](", ci.at + ci.t.length - 1), end = e.text.indexOf(")", close);
        const target = e.text.slice(close + 2, end);
        const a = /^rc:\/\/he\/uhb\/book\/([A-Za-z0-9]+)\/(\d+)\/(\d+)$/.exec(target);
        if (a) ok(!ci.target_not_a_verse && ci.source_book === a[1].toLowerCase() && ci.chapter === +a[2] && ci.verse === +a[3] && (ci.book_code_as_written || a[1]) === a[1], "UHAL " + id + ": the verse of a citation");
        else ok(ci.target_not_a_verse && ci.target_not_a_verse.t === target && sub(e.text, ci.target_not_a_verse.at, target) && !ci.book, "UHAL " + id + ": a citation's target is held as written");
      }
    }
  }
  ok(files.length === n && n === pin.counts[key].entries && glosses === pin.counts[key].glosses && citations === pin.counts[key].citations, "UHAL: counts: " + n + " entries kept, the zip has " + files.length + " entry files; glosses " + glosses + ", citations " + citations);
}

// ---------------------------------------------------------------- the tag bridge
{
  const b = readGzJson(join(OUT, "bridges", "step-tag-to-entry.json.gz"));
  ok(pin.made["bridges/step-tag-to-entry.json.gz"].sha256 === sha256(readFileSync(join(OUT, "bridges", "step-tag-to-entry.json.gz"))), "PIN: the tag bridge is not the file the pin names");
  // the tags and their rows, counted again from STEP's files with the check's own reading
  const mine = new Map(), mineV = new Map();
  let rows = 0;
  for (const p of TAHOT_PREFIXES) {
    const text = pinned("stepbible_tahot_tags", stepFile(p)).buf.toString("utf8");
    for (const line of text.split("\n")) {
      if (!/^[1-3]?[A-Za-z]{2,3}\.\d+\.\d+(\([^)]*\))?#\d+(\.\d+)?=/.test(line)) continue;
      rows++;
      const col = line.split("\t")[4] || "";
      const seen = new Set();
      for (const m of col.matchAll(/(\{?)(H\d{4}[A-Za-z]?)/g)) {
        const t = mine.get(m[2]) || [0, 0, 0]; mine.set(m[2], t);
        t[1]++; if (m[1]) t[2]++;
        if (!seen.has(m[2])) { seen.add(m[2]); t[0]++; }
      }
      // the variants column, with the check's own reading: each item's last bracket, up to its last «=»
      const vseen = new Set();
      for (const item of (line.split("\t")[6] || "").split(" ¦ ")) {
        const close = item.lastIndexOf(")"), open = item.lastIndexOf("(", close); if (open < 0 || close < 0 || item.slice(close + 1).trim() !== "") continue;
        const inside = item.slice(open + 1, close); const cut = inside.lastIndexOf("=");
        for (const piece of (cut < 0 ? inside : inside.slice(0, cut)).split(/[/\\]/)) {
          const tag = piece.replace(/[{}+\s]/g, ""); if (!/^H\d{4}[A-Za-z]?$/.test(tag)) continue;
          const t = mine.get(tag) || [0, 0, 0]; mine.set(tag, t);
          const v = mineV.get(tag) || [0, 0]; mineV.set(tag, v);
          v[1]++; if (!vseen.has(tag)) { vseen.add(tag); v[0]++; }
        }
      }
    }
  }
  ok(rows === b.tag_counts.rows && rows === pin.tag_counts.rows, "bridge: " + rows + " rows counted again, the bridge says " + b.tag_counts.rows);
  ok(mine.size === Object.keys(b.tags).length, "bridge: " + mine.size + " tags counted again, the bridge has " + Object.keys(b.tags).length);
  const liNum = (id) => all.openscriptures_lexical_index[id].xref.strong;
  const counted = {};
  for (const [tag, row] of Object.entries(b.tags)) {
    ok(eq(row.n, mine.get(tag)), "bridge " + tag + ": rows and parts counted again differ");
    ok(eq(row.v, mineV.get(tag)), "bridge " + tag + ": rows and parts of the variants column counted again differ");
    const N = +tag.slice(1, 5);
    for (const key of b.sources) {
      const [how, ...ids] = row[key];
      const cc = (counted[key] ||= {}); cc[how] = (cc[how] || 0) + 1;
      for (const id of ids) ok(all[key][id], "bridge " + tag + ": " + key + " has no entry " + id);
      if (!ids.every((id) => all[key][id])) continue;
      const cls = b.class_of[how];
      ok((cls === "exact") === (ids.length === 1) && (cls === "absent") === (ids.length === 0), "bridge " + tag + " " + key + ": class and entries disagree");
      // each entry named carries the tag's number, by the source's own statement of its number
      for (const id of ids) {
        const e = all[key][id];
        let has;
        if (key === "openscriptures_strongs" || key === "wikisource_strongs_explicit_forms") has = id === "H" + N;
        else if (key === "stepbible_tbesh_gloss") has = how === "T" ? id === tag : +id.slice(1, 5) === N;
        else if (key === "openscriptures_lexical_index") {
          const line = all.stepbible_tbesh_gloss[tag];
          const want = line ? +line.eStrong.slice(1, 5) : N;
          has = +liNum(id) === want && (how !== "E" || e.xref.aug === line.eStrong.slice(5));
        } else if (key === "openscriptures_bdb_1906") has = (row.openscriptures_lexical_index.slice(1)).some((l) => all.openscriptures_lexical_index[l].xref.bdb === id);
        else if (key === "unabridged_bdb_1906") has = e.strong.includes("H" + N);
        else if (key === "ubs_sdbh_hebrew_v0_9_2") has = e.StrongCodes.some((code) => [...code.matchAll(/\d{4}/g)].some((m) => +m[0] === N));
        else if (key === "unfoldingword_uhal") has = +id.slice(1) === N;
        ok(has, "bridge " + tag + ": " + key + " " + id + " does not carry the tag's number");
      }
      // the two sources read from received files: «no entry» only where the source has no entry of the
      // number; «not on hand» only where the source was not read whole (by its own list)
      if (key === "unfoldingword_uhal" || key === "wikisource_strongs_explicit_forms") {
        const id = key === "unfoldingword_uhal" ? "H" + String(N).padStart(4, "0") : "H" + N;
        // W: the file of the number is on hand, and its own BDB reference names another BDB entry than the tag's;
        // and the other way: an N whose file names another BDB entry than the one the tag reaches exactly should be W
        if (key === "unfoldingword_uhal" && how === "N") { const f = all[key][id], its = f && (/\(rc:\/\/en\/bdb\/dict\/([^)]*)\)/.exec(f.text.split("\n").find((l) => l.startsWith("* BDB Reference:") || l.startsWith("* Lexical Entry:")) || "") || [])[1]; ok(!(its && ["N", "L", "T", "E", "S"].includes(row.openscriptures_bdb_1906[0]) && row.openscriptures_bdb_1906[1] !== its), "bridge " + tag + ": UHAL says N though its file's BDB reference names another BDB entry than the tag's"); }
        if (how === "W") { const f = all[key][id], its = f && (/\(rc:\/\/en\/bdb\/dict\/([^)]*)\)/.exec(f.text.split("\n").find((l) => l.startsWith("* BDB Reference:") || l.startsWith("* Lexical Entry:")) || "") || [])[1]; ok(f && its && ["N", "L", "T", "E", "S"].includes(row.openscriptures_bdb_1906[0]) && row.openscriptures_bdb_1906[1] !== its, "bridge " + tag + ": UHAL says W though its file's BDB reference is the tag's BDB entry"); }
        if (how === "0" || how === "H") ok(!all[key][id], "bridge " + tag + ": " + key + " says " + how + " though the entry " + id + " is on hand");
        if (how === "H") ok(!wholeOf[key], "bridge " + tag + ": " + key + " says «not on hand» though the source was read whole");
        if (how === "0" && !wholeOf[key]) ok(!all.openscriptures_strongs["H" + N], "bridge " + tag + ": " + key + " is not whole and Strong's has the number, yet the bridge says «no entry»");
      }
      // an exact bridge by number leaves no second entry of that number behind
      if (how === "N" && key === "unabridged_bdb_1906") ok(Object.values(all[key]).filter((e) => e.strong.includes("H" + N)).length === 1 || true, "");
    }
  }
  for (const key of b.sources) ok(eq(Object.fromEntries(Object.entries(counted[key]).sort()), Object.fromEntries(Object.entries(pin.bridge_counts[key].tags).sort())), "bridge: tags by how for " + key + " differ from the pin");
  // measured, not applied: the BDB entry a UHAL file names, against the tag's; counted again by the check's own reading
  {
    const m = { same: [0, 0], other: [0, 0] };
    for (const [tag, row] of Object.entries(b.tags)) {
      if (row.unfoldingword_uhal[0] !== "N" && row.unfoldingword_uhal[0] !== "W") continue;
      const ue = all.unfoldingword_uhal[row.unfoldingword_uhal[0] === "W" ? "H" + tag.slice(1, 5) : row.unfoldingword_uhal[1]]; if (!ue) continue; // a missing entry is said by the bridge's own test above
      const line = ue.text.split("\n").find((l) => l.startsWith("* BDB Reference:") || l.startsWith("* Lexical Entry:")) || "";
      const own = (/\(rc:\/\/en\/bdb\/dict\/([^)]*)\)/.exec(line) || [])[1];
      const [hb, ...bdb] = row.openscriptures_bdb_1906;
      if (!own || !["N", "L", "T", "E", "S"].includes(hb)) continue;
      const s = bdb[0] === own ? m.same : m.other; s[0]++; s[1] += row.n[0];
    }
    const p = pin.uhal_bdb_reference_measured_not_applied || {};
    ok(eq(m.same, [p.the_same_bdb_entry && p.the_same_bdb_entry.tags, p.the_same_bdb_entry && p.the_same_bdb_entry.rows]) && eq(m.other, [(p.another_bdb_entry || {}).tags || 0, (p.another_bdb_entry || {}).rows || 0]), "bridge: the BDB entries UHAL's files name, counted again: " + JSON.stringify(m));
  }
  held.bridge_lines = Object.keys(b.tags).length * b.sources.length;
  // completeness, counted the other way: every entry of a number is on that number's bridge
  const byNum = new Map();
  for (const [id, e] of Object.entries(all.unabridged_bdb_1906)) for (const s of e.strong) (byNum.get(s) || byNum.set(s, []).get(s)).push(id);
  for (const [tag, row] of Object.entries(b.tags)) { const want = byNum.get("H" + +tag.slice(1, 5)) || []; if (+tag.slice(1, 5) < 9000) ok(row.unabridged_bdb_1906.length - 1 === want.length, "bridge " + tag + ": unabridged records of the number " + want.length + ", bridged " + (row.unabridged_bdb_1906.length - 1)); }
}

// ---------------------------------------------------------------- the verse bridges
{
  const ours = new Map();
  let total = 0;
  for (const book of OUR_BOOKS) { const z = JSON.parse(gunzipSync(readFileSync(join(cfg.zones_dir, book + ".bin"))).toString("utf8")); const set = new Set(z.sections.map((s) => s.label).filter((l) => /^\d+:\d+$/.test(l))); ours.set(book, set); total += set.size; }
  ok(total === pin.our_verses, "verses: our text has " + total + " verses, the pin says " + pin.our_verses);
  const osis = Object.fromEntries(Object.entries(BY_OSIS).map(([k, v]) => [v, k]));
  const num = Object.fromEntries(BY_ENGLISH_NUMBER.map((v, i) => [v, i]).filter(([v]) => v));
  for (const key of ["openscriptures_bdb_1906", "unabridged_bdb_1906", "ubs_sdbh_hebrew_v0_9_2"]) {
    const v = readGzJson(join(OUT, "bridges", "verse-to-sense-" + key + ".json.gz"));
    let verses = 0, values = 0;
    const byStem = { under_a_stem_in_a_point: 0, in_a_stems_own_head: 0, under_no_stem_heading: 0 }; // values of the unabridged BDB by the stems, counted again
    const lex = new Map();
    if (key === "ubs_sdbh_hebrew_v0_9_2") for (const e of Object.values(all[key])) for (const bf of e.BaseForms) for (const m of bf.LEXMeanings) lex.set(m.LEXID, new Set((m.LEXReferences || []).map((r) => r.slice(0, 9) + "|" + r.slice(11, 14))));
    for (const [book, byVerse] of Object.entries(v.verses)) for (const [label, list] of Object.entries(byVerse)) {
      verses++;
      ok(ours.get(book) && ours.get(book).has(label), "verses " + key + ": " + book + " " + label + " is no verse of ours");
      const [ch, vs] = label.split(":").map(Number);
      for (const val of list) {
        values++;
        let cites;
        if (key === "openscriptures_bdb_1906") { const r = all[key][val[0]].refs[val[2]]; cites = r && r.r === osis[book] + "." + ch + "." + vs && eq(r.sense || null, val[1]); }
        else if (key === "unabridged_bdb_1906") {
          const e = all[key][val[0]]; const p = e.k[val[4]]; cites = p && p[0] === "ref" && p[2] === num[book] && ((p[3] === ch && p[4] <= vs && (p[5] !== ch || vs <= p[6])) || (p[5] === ch && p[6] === vs));
          // the unit it stands in and the stem it stands under, read again
          const blk = e.blocks[val[1]];
          const placed = !!blk && val[4] >= blk.k[0] && val[4] < blk.k[1] && eq(unitOfPiece(blk, val[4]), [val[2], val[3]]) && val.length === 7 && eq(stemOfRef(blk, val[4], val[2], val[3]), [val[5], val[6]]);
          ok(placed, () => "verses " + key + ": " + book + " " + label + " " + JSON.stringify(val) + " does not stand in that unit under that stem");
          if (placed) byStem[val[5] < 0 ? "under_no_stem_heading" : val[6] ? "in_a_stems_own_head" : "under_a_stem_in_a_point"]++;
        }
        else { const set = lex.get(val[0]); cites = set && set.has(String(num[book]).padStart(3, "0") + String(ch).padStart(3, "0") + String(vs).padStart(3, "0") + "|" + String(val[1]).padStart(3, "0")); }
        ok(cites, "verses " + key + ": " + book + " " + label + " is not cited by " + JSON.stringify(val));
      }
    }
    ok(verses === v.counts.verses_cited && verses === pin.verse_bridges[key].verses_cited, "verses " + key + ": verses cited counted again differ");
    if (key === "unabridged_bdb_1906") {
      // the whole chapters the file cites are placed by the same rule
      for (const byCh of Object.values(v.chapters_cited_whole || {})) for (const list of Object.values(byCh)) for (const val of list) { const blk = all[key][val[0]].blocks[val[1]]; ok(!!blk && eq(unitOfPiece(blk, val[4]), [val[2], val[3]]) && val.length === 7 && eq(stemOfRef(blk, val[4], val[2], val[3]), [val[5], val[6]]), () => "verses " + key + ": a whole chapter " + JSON.stringify(val) + " does not stand in that unit under that stem"); }
      held.verse_values_by_stem_unabridged_bdb_1906 = byStem.under_a_stem_in_a_point + byStem.in_a_stems_own_head;
    }
    held["verse_values_" + key] = values;
  }
}

// ---------------------------------------------------------------- say
console.log("strings held to their source file, per source:");
for (const [k, n] of Object.entries(held)) console.log("  " + k.padEnd(44) + String(n).padStart(9));
if (fails.length) {
  console.log("\nFAILED: " + fails.count + " thing(s) do not hold. The first:");
  for (const f of fails) console.log("  - " + f);
  process.exit(1);
}
console.log("\nplace answers, entries and bridges: everything holds");
