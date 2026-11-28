#!/usr/bin/env node
// RUN: tree
// GUARDS: place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. A check reads the place card's module, the two pages that
// carry its block and the card's files, and judges; it writes nothing.
//
// THE PLACE CARD IS DRAWN BY ONE BLOCK, AND BOTH PAGES CARRY IT (27 November
// 2026). The live reader (reader/zone.html) and the trial page
// (reader/place.html) open the same card: what each source says at this very
// word, then each dictionary's own entry. The code that draws its body lives
// in tools/place-card-v1.mjs, between the line that opens placeCardOf and
// the line that closes the block, and each page carries those lines. This
// holds the three copies to one another and runs the block away from any
// page:
//
//   P1  the module holds the block once, opened and closed once, and the
//       block runs on its own: lifted out of its source and handed nothing
//       but a stand-in for the browser's document and a fetch that reads the
//       card's files from this disk, it gives its eight functions. So it
//       names nothing of a page that carries it
//   P2  reader/place.html carries the block once, line for line as the
//       module holds it (the page's own indent apart, "export" apart)
//   P3  reader/zone.html carries the block once, line for line likewise
//   P4  neither page draws the card's body by any other code: each makes
//       the card once (handing the block the address of the card's files),
//       calls its draw once, puts the block's own style rules under the
//       element it draws into, and writes none of the card's own sentences
//       and labels a second time outside the block
//   P5  no Hebrew letter is typed in the block: every one arrives in the data
//   P6  run on its own over chapters of the card's files (the first, the
//       middle and the last chapter of every book the index lists), the
//       block draws, for every word, under «At this word», the file's own
//       strings and no others: each source's row in the fixed order, each
//       part's Hebrew and English as the file holds them; a citation of the
//       unabridged BDB with its words inside «» only where the chapter file
//       classes a run as the entry's meaning or as the words its unit opens
//       with (each run carries its kind there, held to the record by
//       tools/check-place-answers-page-v1.mjs G6), every other run plain, as
//       the record's italics. What must
//       stand there is worked out here again from the files, by code the
//       block does not share. And under «In the dictionaries» every number's
//       box is drawn whole, one row a dictionary in the index's order, and no
//       row for a dictionary whose entry is not on hand here (the data's H)
//   P7  on every fiftieth of those words, each whole entry opens: the block
//       draws every dictionary's entry from its file without a fault
//   P8  what the data says, the card says: a citation's stem and its point's
//       labels, and a record's language, planted in a copy of the files, each
//       print as planted. The card reads no name that no data writes
//   P9  the unabridged record's one line, read off the block for every record
//       a number reaches: where the head holds no italic run the file classes
//       as the entry's meaning or opening, the italic runs it does not class
//       as grammar, another language, a verse's wording, an abbreviation or
//       an outline letter print plain, as they stand, the first two and how
//       many, after «in italics in the record:»; never «no meaning in
//       italics» over them (Ruth 3:12 word 5 is the case named)
//
// P10 to P14 judge every word of every chapter that carries an unabridged
// «cites this verse» line or is written one way and read another; P15 one
// word of every case of a number's records and the language STEP says, in
// every chapter, and every word of the chapters P6 runs over:
//   P10 the dagger: a line whose 15th field counts the words of the verse
//       the number stands on is marked †, no other line is, and the row says
//       once «† BDB cites this verse; this number stands n times in it, and
//       BDB does not say which word it means.» with the largest count
//   P11 the double dagger: a line of a paragraph BDB numbers otherwise (its
//       16th field) is marked ‡, no other line is, and the row says once for
//       each such paragraph «‡ BDB files this verse under another word of the
//       same letters (II. «gloss»); STEP's number H5971A is BDB's I.»: the
//       number the line stands under, and the numeral BDB gives the entry that
//       number reaches
//   P12 where the line stands: the stem the record's headings put the verse
//       under, with the point's labels («Qal 2. b», or the stem before the
//       label where the label does not open with it); the stem alone in its
//       own head («Qal, before its numbered senses»); the labels, or «the
//       opening», under no stem; the stem and the label as the file writes
//       it where the label names another stem
//   P13 the stray label: a row with a line whose point's label names another
//       stem says once why the line names the stem it names, and no other
//       row says it
//   P14 the pair: at a word written one way and read another, the lines
//       that stand under both forms (their first 13 fields the same) are
//       counted and said once, «One line of the unabridged
//       Brown-Driver-Briggs stands under both forms: …»; where none is, no
//       word of it
//   P16 the pills (THE PILLS, in the block: what the live reader's card
//       offers in a cell): every pill is a string the listing prints as
//       that source's meaning; a whole word's reading, each of its parts
//   P17 no pill stands without its source and an address that names this
//       word's STEP row or a record
//   P18 every meaning the listing prints as this word's, at this word and
//       on the one line of each record shown as this word's, is a pill in
//       the cell of the part it stands on or is filed under
//   P19 under a number whose unfoldingWord line says W (the ninth cut: its
//       one entry is, by its own reference to Brown-Driver-Briggs, another
//       word of the number than STEP's letter names), no cell offers an
//       unfoldingWord pill, and the row says why; no line that says W in
//       any tag file names an entry
//   P20 a UBS pill is marked as UBS's own phrase mark (colloc: a gloss of a meaning under a collocation, which the
//       page rests shut by the dictionary kinds record, the brief of 27 November 2026, F3) exactly where the number's
//       UBS entry gives it only under a collocation and UBS does not cite it at this very word
//   (P16 to P20 run over every fifth word of the chapters P6 runs over)
//   P15 the language: where a number's records include ones the forms name
//       as of the other language (ol), the unabridged row says how many and
//       the language STEP's row at this word says (else STEP's lexicon),
//       and those records do not stand among the ones shown first; where a
//       number stands on one record only and it is of the other language, the
//       row says it is not said to cite this word
//
// Exit 3, never a pass, where the card's files are not made on this disk
// (tools/make-place-answers-v1.sh makes them).
//
// Usage: node tools/check-place-card-one-place-v1.mjs [--every]
//   --every  P6 over every chapter of every book (about a minute), not three a book
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const READER = join(HERE, "..");
const PAGE_FILES = join(READER, "data", "place-answers-v1", "page");
const MODULE = join(HERE, "place-card-v1.mjs");
const PAGES = [["reader/place.html", join(READER, "place.html"), "CARD"], ["reader/zone.html", join(READER, "zone.html"), "PLACE"]];
const EVERY = process.argv.includes("--every");

let bad = 0;
const check = (name, ok, said = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${name}${said ? `  ·  ${said}` : ""}`); };
const first = (list, n = 3) => `${list.slice(0, n).join(" | ")}${list.length > n ? ` … and ${list.length - n} more` : ""}`;

// ---- the block as a source holds it: { lines, body } | { fault } ---------------------------------------------------
const HEAD = /\n[ \t]*(?:export )?const placeCardOf = \(host\) => \{\n/gu;
const END = "// end of the place card (tools/place-card-v1.mjs)";
const lift = (path) => {
  const src = readFileSync(path, "utf8");
  const heads = [...src.matchAll(HEAD)];
  if (heads.length !== 1) return { fault: `it opens the block ${heads.length} times` };
  const a = heads[0].index + 1;
  const z = src.indexOf(END, a);
  if (z < 0 || src.indexOf(END, z + 1) >= 0) return { fault: `it does not close the block exactly once with "${END}"` };
  const body = src.slice(a, z).replace(/^([ \t]*)export const /mu, "$1const ");
  return { body, lines: body.split("\n").map((l) => l.trim()).filter(Boolean), outside: src.slice(0, a) + src.slice(z + END.length) };
};

// ---- a stand-in for the browser's document: enough of an element to be drawn into and read back -------------------
const makeDocument = () => {
  class Text { constructor(t) { this.data = String(t); this.parent = null; } get textContent() { return this.data; } remove() { if (this.parent) this.parent.drop(this); } }
  class Element {
    constructor(tag) { this.tagName = tag; this.className = ""; this.kids = []; this.parent = null; this.dataset = {}; this.attrs = {}; this.hidden = false; this.listeners = {}; this.title = ""; this.scrollTop = 0; }
    get classList() { const el = this; const list = () => el.className.split(/\s+/u).filter(Boolean); return { add: (c) => { if (!list().includes(c)) el.className = [...list(), c].join(" "); }, remove: (c) => { el.className = list().filter((x) => x !== c).join(" "); }, contains: (c) => list().includes(c) }; }
    take(k) { const n = typeof k === "object" && k !== null ? k : new Text(k); if (n.parent) n.parent.drop(n); n.parent = this; return n; }
    drop(n) { this.kids = this.kids.filter((x) => x !== n); n.parent = null; }
    append(...ks) { for (const k of ks) this.kids.push(this.take(k)); }
    replaceChildren(...ks) { for (const k of this.kids) k.parent = null; this.kids = []; this.append(...ks); }
    remove() { if (this.parent) this.parent.drop(this); }
    get children() { return this.kids.filter((k) => k instanceof Element); }
    get childElementCount() { return this.children.length; }
    get lastChild() { return this.kids[this.kids.length - 1] || null; }
    get textContent() { return this.kids.map((k) => k.textContent).join(""); }
    set textContent(t) { this.replaceChildren(String(t)); }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return Object.hasOwn(this.attrs, k) ? this.attrs[k] : null; }
    addEventListener(what, fn) { (this.listeners[what] = this.listeners[what] || []).push(fn); }
    /** every element under this one, in the order of the page, that the test passes */
    all(test, out = []) { for (const k of this.children) { if (test(k)) out.push(k); k.all(test, out); } return out; }
    is(cls) { return this.classList.contains(cls); }
  }
  return { createElement: (tag) => new Element(tag) };
};
// the card's files, read from this disk at the address the block asks: the page's own fetch, standing in
const DATA_AT = "card-files/";
const bytesAsked = new Map();
const fetchFromDisk = async (url) => {
  const rel = String(url).startsWith(DATA_AT) ? String(url).slice(DATA_AT.length) : null;
  const path = rel === null ? null : join(PAGE_FILES, rel);
  if (!path || rel.includes("..") || !existsSync(path)) return new Response("not here", { status: 404 });
  bytesAsked.set(rel, (bytesAsked.get(rel) || 0) + 1);
  return new Response(readFileSync(path), { status: 200 });
};

// the one stand-in document: the block draws with it, and this check makes the element it draws into with it
const STAND_IN = makeDocument();

// ---- P1 to P5: the three copies ------------------------------------------------------------------------------------
const own = lift(MODULE);
check("P1  the module holds the block once, opened and closed once", !own.fault, own.fault ? `tools/place-card-v1.mjs: ${own.fault}` : `${own.lines.length} lines`);
if (own.fault) { console.log(`\n${bad} failing`); process.exit(1); }
const faults = [];
let card = null;
try {
  const placeCardOf = new Function("document", "fetch", `"use strict";\n${own.body}\nreturn placeCardOf;`)(STAND_IN, fetchFromDisk);
  card = placeCardOf({ data: DATA_AT, fault: (words) => faults.push(words) });
} catch (e) { card = null; check("P1  the block runs on its own, lifted out of its source", false, e.message); }
const GIVES = ["index", "chapter", "entryAt", "draw", "kindWords", "credits", "style", "pillsAt"];
if (card) check("P1  the block runs on its own, lifted out of its source, and gives its eight functions", GIVES.every((k) => typeof card[k] === "function") && Object.keys(card).length === GIVES.length, Object.keys(card).join(", "));

const copies = [];
for (const [name, path, as] of PAGES) {
  const law = name.endsWith("place.html") ? "P2" : "P3";
  if (!existsSync(path)) { check(`${law}  ${name} carries the block once, line for line`, false, "the page is not in this tree"); continue; }
  const c = lift(path);
  if (c.fault) { check(`${law}  ${name} carries the block once, line for line`, false, c.fault); continue; }
  const differs = [];
  for (let i = 0; i < Math.max(c.lines.length, own.lines.length); i += 1) if (c.lines[i] !== own.lines[i]) { differs.push(`line ${i + 1} of the block: the page has «${String(c.lines[i]).slice(0, 70)}», the module «${String(own.lines[i]).slice(0, 70)}»`); if (differs.length > 3) break; }
  check(`${law}  ${name} carries the block once, line for line as the module holds it`, differs.length === 0, differs.length ? first(differs, 1) : `${c.lines.length} lines, each the module's`);
  copies.push([name, c, as]);
}
{
  // the card's own words: every string of the block that is a sentence or a label of several words. A page that drew
  // any part of the card's body by other code would have to write one of them again
  const sentences = [...new Set([...own.body.matchAll(/"((?:[^"\\\n]|\\.){14,})"/gu)].map((m) => m[1]).filter((t) => /[A-Za-z] [A-Za-z]/u.test(t) && !/^[a-z-]+: /u.test(t) && !/[;{}]/u.test(t)))];
  const said = [];
  for (const [name, c, as] of copies) {
    const draws = [...c.outside.matchAll(new RegExp(`\\b${as}\\.draw\\(`, "gu"))].length;
    const made = [...c.outside.matchAll(/\bplaceCardOf\(\{/gu)].length;
    const styled = [...c.outside.matchAll(new RegExp(`\\b${as}\\.style\\(`, "gu"))].length;
    const again = sentences.filter((t) => c.outside.includes(`"${t}"`));
    if (draws !== 1) said.push(`${name} calls ${as}.draw ${draws} times`);
    if (made !== 1) said.push(`${name} makes the card ${made} times`);
    if (styled !== 1) said.push(`${name} takes the block's style ${styled} times`);
    if (again.length) said.push(`${name} writes again, outside the block: ${again.slice(0, 3).map((t) => `"${t.slice(0, 50)}"`).join(", ")}`);
  }
  check("P4  neither page draws the card's body by other code: each makes the card once, draws through it once, takes its style once, and writes none of the card's own words a second time", said.length === 0 && copies.length === PAGES.length,
    said.length ? first(said) : `${sentences.length} sentences and labels of the block looked for outside it in each page`);
}
{
  const HEBREW = /[\u0590-\u05FF\uFB1D-\uFB4F]/u;
  const at = own.lines.findIndex((l) => HEBREW.test(l));
  check("P5  no Hebrew letter is typed in the block", at < 0, at < 0 ? "" : `line ${at + 1} of the block`);
}

// ---- P6, P7: the block, run on its own over the card's files -------------------------------------------------------
if (!card) { console.log(`\n${bad} failing`); process.exit(1); }
if (!existsSync(join(PAGE_FILES, "index.json"))) {
  console.log("  --  P6, P7 not judged: the card's files are not made on this disk (tools/make-place-answers-v1.sh)");
  console.log(bad ? `\n${bad} failing` : "\nthe three copies hold; the block was not run over the card's files, which are not here: not a pass");
  process.exit(bad ? 1 : 3);
}
// what the card must print under «At this word» for a word, from the chapter's file: [the source's name, its strings]
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", emsp: "\u2003", nbsp: "\u00a0" };
const resolved = (s) => String(s).replace(/\\?&(#x[0-9A-Fa-f]+|#[0-9]+|amp|lt|gt|quot|apos|emsp|nbsp);/gu, (all, r) => (r[0] === "#" ? String.fromCodePoint(r[1] === "x" ? parseInt(r.slice(2), 16) : parseInt(r.slice(1), 10)) : NAMED[r]));
const oneLine = (s) => resolved(s).replace(/\s+/gu, " ").trim();
const quoted = (list, none) => (list.length ? list.map((g) => `«${oneLine(g)}»`).join(", ") : none);
// THE RECORD'S ITALICS AT A CITATION: a run the chapter file classes as the entry's meaning or as the words its unit
// opens with is printed inside «», the rest plain (each once), as the record's italics. Each run of a citation comes
// with its kind in the file ([words, kind]); tools/check-place-answers-page-v1.mjs G6 holds the kinds to the record.
const citedWords = (b) => {
  const runs = b[6];
  const meant = runs.filter(([, kind]) => kind === "main_gloss" || kind === "opening").map(([t]) => oneLine(t)).filter(Boolean);
  const plain = [...new Set(runs.filter(([, kind]) => kind !== "main_gloss" && kind !== "opening").map(([t]) => oneLine(t)).filter(Boolean))];
  return [...(meant.length ? [meant.map((x) => `«${x}»`).join(", ")] : []), ...plain];
};
const mustStand = (e) => {
  const rows = [];
  for (const f of e.f) {
    const t = f.t;
    if (t && t.p) rows.push(["STEP Bible", t.p.flatMap((p) => (p[0] === null ? [p[3]] : [p[3], p[0].trim()]))]);
    else if (t && t.other) rows.push(["STEP Bible", t.other.flatMap((p) => (p[1] === null ? [p[0]] : [p[0], p[1].trim()]))]);
    const m = f.m || f.mo; if (m) rows.push(["MACULA Hebrew", m.flatMap((x) => [x[2], x[1]])]);
    const h = f.h || {};
    if (h.u) {
      const very = h.u.filter((u) => u[1] < 2), verse = h.u.filter((u) => u[1] >= 2);
      if (very.length) rows.push(["UBS Dictionary of Biblical Hebrew", very.flatMap((u) => (u[1] === 1 ? [u[3], quoted(u[2], "(a sense with no gloss)")] : [quoted(u[2], "(a sense with no gloss)")]))]);
      if (verse.length) rows.push(["UBS Dictionary of Biblical Hebrew", verse.map((u) => quoted(u[2], "(a sense with no gloss)"))]);
    }
    if (h.o) rows.push(["Brown-Driver-Briggs, the Open Scriptures file", h.o.map((o) => quoted(o[3], "(no meaning is marked in this sense)"))]);
    if (h.b) rows.push(["Brown-Driver-Briggs, unabridged", h.b.flatMap((b) => [b[7], ...citedWords(b)])]);
  }
  return rows;
};
const settle = () => new Promise((r) => setImmediate(r));
const index = await card.index();
let chapters = 0, words = 0, asData = 0, boxes = 0, rowsDrawn = 0, opened = 0, entriesOpened = 0, notOnHand = 0;
// a tag's line, read here from its file on disk; and each dictionary's name on the card, as the index's order names them
const tagFiles = new Map();
const tagFileOf = (tag) => { const f = `${String(Math.floor(Number(tag.slice(1, 5)) / ((index.filed || {}).tags_a_file || 50))).padStart(3, "0")}.json.gz`; if (!tagFiles.has(f)) tagFiles.set(f, JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, "entries", "t", f))).toString("utf8"))); return tagFiles.get(f); };
const tagLine = (tag) => tagFileOf(tag).tags[tag] || null;
const SOURCE_NAMES = { stepbible_tbesh_gloss: "STEP Bible's brief lexicon", openscriptures_strongs: "Strong's dictionary", openscriptures_bdb_1906: "Brown-Driver-Briggs, the Open Scriptures file", unabridged_bdb_1906: "Brown-Driver-Briggs, unabridged", ubs_sdbh_hebrew_v0_9_2: "UBS Dictionary of Biblical Hebrew", openscriptures_lexical_index: "Lexical Index", unfoldingword_uhal: "unfoldingWord Hebrew and Aramaic Lexicon" };
const differs = [], notWhole = [], notOpened = [];
const P6_CHAPTERS = [];
const t0 = Date.now();
for (const b of index.books) {
  const want = EVERY ? b.chapters : [...new Set([b.chapters[0], b.chapters[Math.floor(b.chapters.length / 2)], b.chapters[b.chapters.length - 1]])];
  for (const n of want) {
    const doc = await card.chapter(b.book, n);
    P6_CHAPTERS.push(`${b.book}/${n}`);
    // the file as this check reads it, apart from the block's own reading of it
    const mine = JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, b.book, `${n}.json.gz`))).toString("utf8"));
    chapters += 1;
    const drawn = [];
    for (const v of mine.verses) for (const e of v.e) {
      if (e.m !== undefined) continue;
      words += 1;
      const at = card.entryAt(doc, v.l, e.i);
      const where = `${b.book} ${v.l} entry ${e.i}`;
      if (!at) { differs.push(`${where}: the block finds no word there`); continue; }
      const body = STAND_IN.createElement("div");
      card.draw(body, doc, at.v, at.e, () => true);
      drawn.push([where, body, e, words]);
    }
    // what each source says here is drawn at once from the chapter's file, and the dictionaries land after their
    // files do: wait for every word of this chapter, then read them
    const hereOf = (body) => { const h3 = body.all((x) => x.tagName === "h3").find((x) => x.textContent === "At this word"); return h3 ? body.children[body.children.indexOf(h3) + 1] : null; };
    for (let spin = 0; spin < 4000; spin += 1) { await settle(); if (drawn.every(([, body]) => (hereOf(body) || { dataset: { ready: "1" } }).dataset.ready === "1" && body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries").every((h) => h.parent.dataset.ready === "1"))) break; }
    for (const [where, body, e] of drawn) {
      const here = hereOf(body);
      const got = here && here.dataset.ready === "1" ? here.all((x) => x.is("row")).map((r) => [r.all((x) => x.tagName === "b")[0].textContent, r.all((x) => x.is("he") || x.is("rd") || x.is("it")).filter((x) => { for (let y = x.parent; y && y !== r; y = y.parent) if (y.is("line")) return true; return false; }).map((x) => x.textContent)]) : null;
      if (JSON.stringify(got) === JSON.stringify(mustStand(e))) asData += 1; else if (differs.length < 20) differs.push(`${where}: drawn ${JSON.stringify(got).slice(0, 200)}, the file gives ${JSON.stringify(mustStand(e)).slice(0, 200)}`); else differs.push(where);
    }
    for (const [where, body, , nth] of drawn) {
      for (const h of body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries")) {
        boxes += 1; const box = h.parent;
        const rows = box.children.filter((x) => x.is("row"));
        rowsDrawn += rows.length;
        // one row a dictionary in the index's order, but a dictionary whose entry is not on hand here (H), which has none
        const tag = (/the number (H\d{4}[A-Za-z]?)\./u.exec(box.textContent) || [])[1];
        const line = tag ? tagLine(tag) : null;
        const owed = line ? index.dictionaries.filter((k) => line.b[k][0] !== "H") : null;
        if (line) for (const k of index.dictionaries) if (line.b[k][0] === "H") notOnHand += 1;
        const names = rows.map((r) => (r.all((y) => y.tagName === "b")[0] || {}).textContent);
        const whole = box.dataset.ready === "1" && ((owed && JSON.stringify(names) === JSON.stringify(owed.map((k) => SOURCE_NAMES[k]))) || (rows.length === 0 && /only in its note on the form written/u.test(box.textContent)));
        if (!whole) notWhole.push(where);
      }
      if (nth % 50 !== 0) continue;
      const btns = body.all((x) => x.tagName === "button" && x.is("open"));
      opened += 1;
      for (const btn of btns) for (const fn of btn.listeners.click || []) await fn();
      for (const btn of btns) { entriesOpened += 1; const whole = btn.parent.children[btn.parent.children.indexOf(btn) + 1]; if (!(whole && whole.dataset.ready === "1" && !whole.hidden && whole.textContent.length > 0)) notOpened.push(`${where}: ${btn.dataset.src} ${btn.dataset.id}`); }
    }
  }
}
check(`P6  run on its own, the block draws under «At this word» the file's own strings and no others, at every word of ${EVERY ? "every chapter" : "the first, the middle and the last chapter of every book"}`, differs.length === 0 && words > 0,
  differs.length ? first(differs, 2) : `${words.toLocaleString("en-US")} words of ${chapters} chapters of ${index.books.length} books, ${asData.toLocaleString("en-US")} as the file gives them (${Math.round((Date.now() - t0) / 100) / 10} s)`);
check("P6  and every number's dictionaries are drawn whole, one row a dictionary in the index's order, and none for a dictionary whose entry is not on hand here", notWhole.length === 0 && boxes > 0,
  notWhole.length ? first(notWhole) : `${boxes.toLocaleString("en-US")} numbers, ${rowsDrawn.toLocaleString("en-US")} rows; ${notOnHand.toLocaleString("en-US")} rows not drawn, the entry not on hand`);
check("P7  on every fiftieth of those words each whole entry opens from its file", notOpened.length === 0 && faults.length === 0 && entriesOpened > 0,
  notOpened.length ? first(notOpened) : faults.length ? `the block said: ${first(faults)}` : `${opened.toLocaleString("en-US")} words, ${entriesOpened.toLocaleString("en-US")} whole entries opened, ${bytesAsked.size} files asked, none twice: ${[...bytesAsked.values()].every((n) => n === 1)}`);

// ---- P8: what the data says, the card says -------------------------------------------------------------------------
// A citation's stem and its point's labels, and a record's language, are the data's: planted in a copy of the files,
// read through a second card made with a fetch that serves the copy, each must print as planted. The card reads no
// name that no data writes: nothing else is planted, and nothing else is looked for.
{
  const PLANT = { stem: "Plantedstem", point: "7.", sub: "z", language: "PLANTED TONGUE", said: "Planted Tongue" };
  let planted = null; const said = [];
  // a word of a chapter that has a citation of the unabridged BDB and whose number stands on several of its records
  for (const b of index.books) {
    if (planted) break;
    const n = b.chapters[0];
    const mine = JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, b.book, `${n}.json.gz`))).toString("utf8"));
    for (const v of mine.verses) for (const e of v.e) {
      if (planted || e.m !== undefined) continue;
      const f = e.f.find((x) => x.h && x.h.b && x.t && x.t.p); if (!f) continue;
      const cite = f.h.b[0]; const tag = cite[9]; if (!tag) continue;
      const tf = `entries/t/${String(Math.floor(Number(tag.slice(1, 5)) / ((index.filed || {}).tags_a_file || 50))).padStart(3, "0")}.json.gz`;
      const T = JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, tf))).toString("utf8"));
      const line = T.tags[tag]; if (!line || line.b.unabridged_bdb_1906.length < 3) continue;
      if (!(line.own || {})[cite[0]] || !T.unabridged[cite[0]]) continue;
      planted = { book: b.book, n, label: v.l, i: e.i, tag, tf, record: cite[0] };
      // the line under a stem at a point and a sub-point of it, not in the stem's own head, its label not naming another stem
      cite[4] = PLANT.point; cite[5] = PLANT.sub; cite[10] = PLANT.stem; cite[12] = 0; if (cite.length > 13) cite[13] = 0;
      T.unabridged[cite[0]].language = PLANT.language;
      planted.chapter = mine; planted.tags = T;
    }
  }
  if (!planted) check("P8  what the data says, the card says", false, "no word with a citation of the unabridged BDB under a number of several records was found to plant in");
  else {
    const gz = (o) => Buffer.from(JSON.stringify(o));
    const fetchPlanted = async (url) => {
      const rel = String(url).slice(DATA_AT.length);
      if (rel === `${planted.book}/${planted.n}.json.gz`) return new Response(new Blob([gz(planted.chapter)]).stream().pipeThrough(new CompressionStream("gzip")), { status: 200 });
      if (rel === planted.tf) return new Response(new Blob([gz(planted.tags)]).stream().pipeThrough(new CompressionStream("gzip")), { status: 200 });
      return fetchFromDisk(url);
    };
    const second = new Function("document", "fetch", `"use strict";\n${own.body}\nreturn placeCardOf;`)(STAND_IN, fetchPlanted)({ data: DATA_AT, fault: (w) => said.push(w) });
    const doc = await second.chapter(planted.book, planted.n);
    const at = second.entryAt(doc, planted.label, planted.i);
    const body = STAND_IN.createElement("div");
    second.draw(body, doc, at.v, at.e, () => true);
    for (let spin = 0; spin < 2000; spin += 1) { await settle(); if (body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries").every((h) => h.parent.dataset.ready === "1")) break; }
    const rowB = body.all((x) => x.is("row") && x.all((y) => y.tagName === "b")[0]?.textContent === "Brown-Driver-Briggs, unabridged");
    const lines = rowB.flatMap((r) => r.all((x) => x.is("line")));
    const missing = [];
    if (!lines.some((l) => (l.children[1] || { textContent: "" }).textContent === `${PLANT.stem} ${PLANT.point} ${PLANT.sub} `)) missing.push("the citation's stem and labels");
    // the record's one line under «In the dictionaries», where the number stands on several records
    const oneLine = lines.find((l) => { const kids = l.parent.children; const btn = kids[kids.indexOf(l) + 1]; return btn && btn.dataset.id === planted.record; });
    if (!oneLine || !oneLine.textContent.includes(` (${PLANT.said})`)) missing.push("the record's language");
    check("P8  what the data says, the card says: a citation's stem and its point's labels, and a record's language, planted in a copy of the files, each print as planted", missing.length === 0 && said.length === 0,
      missing.length ? `${planted.book} ${planted.label} entry ${planted.i}: not as planted: ${missing.join("; ")}` : said.length ? first(said) : `planted at ${planted.book} ${planted.label} entry ${planted.i}, under ${planted.tag} (record ${planted.record})`);
  }
}

// ---- P9: the unabridged record's one line ----------------------------------------------------------------------------
// The line says «no meaning in italics» only where the record's head holds no italic run the file leaves unclassed
// (or classes as a meaning or as the English of the Hebrew); where it holds such runs and no meaning or opening, the
// first two print as they stand, said as «in italics in the record», and how many there are where there are more.
// Every record's line is read off the block itself: each number of every tag file drawn as a word of its own, so
// every record the number stands on is drawn, those behind the button too. What the line must say is worked out
// here again from the head, by code the block does not share.
{
  const { readdirSync } = await import("node:fs");
  const SAID_AS_ITALICS = (k) => !["main_gloss", "opening", "grammar_word", "other_language", "verse_wording", "abbreviation", "outline_letter"].includes(k);
  const files = readdirSync(join(PAGE_FILES, "entries", "t")).filter((f) => f.endsWith(".json.gz")).sort();
  const want = new Map();   // record -> { italics: the runs said as italics, or null where the line says a meaning or an opening, or nothing }
  const tags = [];
  for (const f of files) {
    const T = JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, "entries", "t", f))).toString("utf8"));
    tags.push(...Object.keys(T.tags));
    for (const [id, hd] of Object.entries(T.unabridged)) {
      if (want.has(id)) continue;
      const its = hd.head.italics || [];
      const meaning = its.some((x) => (x.kind === "main_gloss" || x.kind === "opening") && oneLine(x.t));
      const plain = [...new Set(its.filter((x) => SAID_AS_ITALICS(x.kind)).map((x) => oneLine(x.t)).filter(Boolean))];
      want.set(id, meaning || !plain.length ? null : plain);
    }
  }
  const got = new Map();
  const fakeDoc = { verses: [] };
  for (let k = 0; k < tags.length; k += 500) {
    const bodies = tags.slice(k, k + 500).map((tag) => {
      const body = STAND_IN.createElement("div");
      card.draw(body, fakeDoc, { l: "0:0", e: [] }, { i: 0, s: "", f: [{ t: { rows: ["-"], p: [["-", tag, 1, "-"]] } }] }, () => true);
      return body;
    });
    for (let spin = 0; spin < 4000; spin += 1) { await settle(); if (bodies.every((b) => b.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries").every((h) => h.parent.dataset.ready === "1"))) break; }
    for (const body of bodies) for (const btn of body.all((x) => x.tagName === "button" && x.is("open") && x.dataset.src === "unabridged_bdb_1906")) {
      if (got.has(btn.dataset.id)) continue;
      // the record's one line: the nearest line before its button, in the same holder
      const kids = btn.parent.children; let j = kids.indexOf(btn) - 1; while (j >= 0 && !kids[j].is("line")) j -= 1;
      got.set(btn.dataset.id, j >= 0 ? kids[j].textContent : "");
    }
  }
  const wrong = []; let italics = 0, more = 0;
  for (const [id, plain] of want) {
    const line = got.get(id);
    if (line === undefined) { wrong.push(`${id}: no number draws it`); continue; }
    if (plain) {
      italics += 1; if (plain.length > 2) more += 1;
      const must = `in italics in the record: ${plain.slice(0, 2).join(" · ")}${plain.length > 2 ? ` … (${plain.length})` : ""}`;
      if (!line.includes(must)) wrong.push(`${id}: «${line}», where the head gives «${must}»`);
    } else if (line.includes("in italics in the record")) wrong.push(`${id}: «${line}» says italics where the head has a meaning or none`);
    if (/no meaning in italics/u.test(line) && plain) wrong.push(`${id}: «${line}» says no meaning in italics over italic runs`);
  }
  // the case the brief names: Ruth 3:12 word 5, written and not read
  const ruth = await card.chapter("ruth", 3); const w5 = card.entryAt(ruth, "3:12", 4); let ruthLine = "";
  if (w5) {
    const body = STAND_IN.createElement("div"); card.draw(body, ruth, w5.v, w5.e, () => true);
    for (let spin = 0; spin < 2000; spin += 1) { await settle(); if (body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries").every((h) => h.parent.dataset.ready === "1")) break; }
    const rowB = body.all((x) => x.is("row") && (x.all((y) => y.tagName === "b")[0] || {}).textContent === "Brown-Driver-Briggs, unabridged")[0];
    ruthLine = rowB ? (rowB.all((x) => x.is("line"))[0] || { textContent: "" }).textContent : "";
  }
  check("P9  the unabridged record's one line prints the record's own italics where the file classes none as its meaning, the first two and how many, and never says «no meaning in italics» over them", wrong.length === 0 && got.size > 0,
    wrong.length ? first(wrong) : `${want.size.toLocaleString("en-US")} records drawn under ${tags.length.toLocaleString("en-US")} numbers; ${italics} say «in italics in the record», ${more} of them with more than two runs; Ruth 3:12 word 5: «${ruthLine}»`);
}

// ---- P10 to P15: the marks, where a line stands, and the sentences they call for ------------------------------------
// What each must say is written here again, apart from the block, from the chapter file and the tag files.
{
  const { readdirSync } = await import("node:fs");
  const UNABRIDGED = "Brown-Driver-Briggs, unabridged";
  const nameOf = (r) => (r.all((y) => y.tagName === "b")[0] || { textContent: "" }).textContent;
  const kidSubs = (row) => row.children.filter((x) => x.is("sub")).map((x) => x.textContent);
  const fail = { P10: [], P11: [], P12: [], P13: [], P14: [], P15: [] };
  const seen = { P10: 0, P11: 0, P12: 0, P13: 0, P14: 0, P15: 0 }; let wordsJudged = 0, sampled = 0, ddSeen = "";
  const note = (law, where, words) => { fail[law].push(`${where}: ${words}`); };
  const STRAY = "Where a point's label names another stem, the file has written a cross-reference into the label; the line names the stem the record's own headings put the verse under.";
  const whereWords = (b) => {
    const label = [b[4], b[5]].filter((x) => x).join(" ");
    if (b[12]) return `${b[10]}, before its numbered senses`;
    if (!b[10]) return label || "the opening";
    if (b[13]) return `${b[10]}, at a point the file labels «${label}»`;
    return label.startsWith(b[10]) ? label : `${b[10]} ${label || "(its opening)"}`;
  };
  /** P10 to P14 at one word: `here` is the element under «At this word». */
  const judgeHere = (where, e, here) => {
    wordsJudged += 1;
    const rows = here.children.filter((x) => x.is("row") && nameOf(x) === UNABRIDGED);
    const forms = e.f.filter((f) => f.h && f.h.b);
    if (rows.length !== forms.length) { note("P12", where, `${rows.length} rows of the unabridged BDB for ${forms.length} forms that cite it`); return; }
    forms.forEach((f, fi) => {
      const row = rows[fi]; const lines = row.children.filter((x) => x.is("line")); const subs = kidSubs(row);
      if (lines.length !== f.h.b.length) { note("P12", where, `${lines.length} lines for ${f.h.b.length} citations`); return; }
      f.h.b.forEach((b, li) => {
        const line = lines[li]; seen.P12 += 1;
        const got = (line.children[1] || { textContent: "" }).textContent.replace(/ $/u, "");
        if (got !== whereWords(b)) note("P12", where, `line ${li + 1} stands «${got}», the file puts it at «${whereWords(b)}»`);
        const marks = line.children.filter((x) => x.is("gap") && (x.textContent === " †" || x.textContent === " ‡")).map((x) => x.textContent.trim()).join("");
        if (b[14]) seen.P10 += 1; if (b[15]) seen.P11 += 1; if (b[13]) seen.P13 += 1;
        if (marks.includes("†") !== !!b[14]) note("P10", where, `line ${li + 1} ${b[14] ? "carries no †" : "is marked † with no count in the file"}`);
        if (marks.includes("‡") !== !!b[15]) note("P11", where, `line ${li + 1} ${b[15] ? "carries no ‡" : "is marked ‡ with no other numeral in the file"}`);
      });
      const most = Math.max(0, ...f.h.b.map((b) => b[14] || 0));
      const dag = subs.filter((t) => t.startsWith("† "));
      const dagWant = most ? [`† BDB cites this verse; this number stands ${most} times in it, and BDB does not say which word it means.`] : [];
      if (JSON.stringify(dag) !== JSON.stringify(dagWant)) note("P10", where, `the row says ${JSON.stringify(dag)}, the file gives ${JSON.stringify(dagWant)}`);
      const ddWant = [...new Set(f.h.b.filter((b) => b[15]).map((b) => `‡ BDB files this verse under another word of the same letters (${b[15].another}.${b[15].gloss.length ? ` ${b[15].gloss.map((g) => `«${oneLine(g)}»`).join(", ")}` : ""}); STEP's number ${b[9]} is BDB's ${b[15].entry}.`))];
      const dd = subs.filter((t) => t.startsWith("‡ ")); if (!ddSeen && ddWant.length) ddSeen = `${where}: «${ddWant[0]}»`;
      if (JSON.stringify(dd) !== JSON.stringify(ddWant)) note("P11", where, `the row says ${JSON.stringify(dd)}, the file gives ${JSON.stringify(ddWant)}`);
      const stray = subs.filter((t) => t === STRAY).length; const strayWant = f.h.b.some((b) => b[13]) ? 1 : 0;
      if (stray !== strayWant) note("P13", where, `the row says why a label names another stem ${stray} times, the file calls for it ${strayWant} times`);
    });
    // P14 the pair: the lines under both forms, counted here
    const said = here.children.filter((x) => x.is("form-h") && / under both forms: /u.test(x.textContent)).map((x) => x.textContent);
    let want = [];
    if (e.k === 1 && e.f.length === 2) {
      const key = (b) => JSON.stringify(b.slice(0, 13)); const one = new Set(((e.f[0].h || {}).b || []).map(key));
      const n = ((e.f[1].h || {}).b || []).filter((b) => one.has(key(b))).length;
      if (n) { seen.P14 += 1; want = [`${n === 1 ? "One line" : `${n} lines`} of the unabridged Brown-Driver-Briggs stand${n === 1 ? "s" : ""} under both forms: STEP's grammar does not give the two forms different stems there, so nothing in the files tells which form the record means.`]; }
    }
    if (JSON.stringify(said) !== JSON.stringify(want)) note("P14", where, `the card says ${JSON.stringify(said)}, the file gives ${JSON.stringify(want)}`);
  };
  /** P15 at one word whose dictionaries have landed: each number's unabridged row. */
  const judgeLanguage = (where, e, body) => {
    const rowLg = e.f.map((f) => (f.t || {}).lg).find((x) => x);
    const ol = new Set(e.f.flatMap((f) => f.ol || []));
    for (const h of body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries")) {
      const box = h.parent; const tag = (/the number (H\d{4}[A-Za-z]?)\./u.exec(box.textContent) || [])[1]; const line = tag ? tagLine(tag) : null;
      if (!line) continue;
      const [how, ...ids0] = line.b.unabridged_bdb_1906; if (how === "H" || !ids0.length) continue;
      const row = box.children.find((x) => x.is("row") && nameOf(x) === UNABRIDGED); if (!row) { note("P15", where, `${tag}: no row of the unabridged BDB`); continue; }
      const other = ids0.filter((id) => ol.has(id)); const subs = kidSubs(row);
      const lg = rowLg || line.lg || null; const t0 = lg === "a" ? "Aramaic" : "Hebrew", t1 = lg === "a" ? "Hebrew" : "Aramaic";
      const said = rowLg ? "STEP's row at this word says" : "STEP's lexicon says";
      const talks = subs.filter((t) => /Biblical (Hebrew|Aramaic) record/u.test(t));
      if (!other.length) { if (talks.length) note("P15", where, `${tag}: the row speaks of a record's language where the forms name none of its records: «${talks[0]}»`); continue; }
      seen.P15 += 1;
      if (ids0.length > 1) {
        const head = `This number stands on ${ids0.length} records of this file. ${other.length === 1 ? "One is a" : `${other.length} are`} Biblical ${t1} record${other.length === 1 ? "" : "s"}; ${said} this word is ${t0}.`;
        if (!(subs[0] || "").startsWith(head)) note("P15", where, `${tag}: the row says «${subs[0]}», where it must open «${head}»`);
        const shown = (row.children.find((x) => x.tagName === "ul" && x.is("records") && !x.hidden) || { all: () => [] }).all((x) => x.tagName === "button" && x.is("open")).map((x) => x.dataset.id);
        const up = shown.filter((id) => other.includes(id)); if (up.length) note("P15", where, `${tag}: a record of the other language stands among those shown first: ${up.join(", ")}`);
      } else {
        const want = `This record is a Biblical ${t1} record, and ${said} this word is ${t0}, so it is not said to cite this word.`;
        if (!subs.includes(want)) note("P15", where, `${tag}: the row says ${JSON.stringify(subs)}, where it must say «${want}»`);
      }
    }
  };
  const hereOf = (body) => { const h3 = body.all((x) => x.tagName === "h3").find((x) => x.textContent === "At this word"); return h3 ? body.children[body.children.indexOf(h3) + 1] : null; };
  const waitDicts = async (bodies) => { for (let spin = 0; spin < 4000; spin += 1) { await settle(); if (bodies.every((b) => b.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries").every((h) => h.parent.dataset.ready === "1"))) break; } };
  const tagsOf = (e) => [...new Set(e.f.flatMap((f) => ((f.t || {}).p || []).map((p) => (/H\d{4}[A-Za-z]?/u.exec(p[1] || "") || [null])[0]).filter((t) => t && !/^H9\d\d\d$/u.test(t))))].sort();
  const cases = new Set(); const p6 = new Set(P6_CHAPTERS);
  for (const b of index.books) for (const n of b.chapters) {
    const mine = JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, b.book, `${n}.json.gz`))).toString("utf8"));
    const whole = p6.has(`${b.book}/${n}`) || EVERY; const sample = [];
    for (const v of mine.verses) for (const e of v.e) {
      if (e.m !== undefined) continue;
      const where = `${b.book} ${v.l} entry ${e.i}`;
      const cites = e.f.some((f) => f.h && f.h.b); const pair = e.k === 1 && e.f.length === 2;
      // the language: one word of each case (its numbers, the records the forms name as of the other language, the language STEP's row says), and every word of the chapters P6 runs over
      const ol = [...new Set(e.f.flatMap((f) => f.ol || []))].sort(); const key = ol.length ? JSON.stringify([tagsOf(e), ol, e.f.map((f) => (f.t || {}).lg).find((x) => x) || ""]) : null;
      const lang = whole || (key && !cases.has(key)); if (key) cases.add(key);
      if (!cites && !pair && !lang) continue;
      const body = STAND_IN.createElement("div");
      card.draw(body, mine, v, e, lang ? () => true : () => false);
      if (cites || pair) judgeHere(where, e, hereOf(body));
      if (lang) sample.push([where, e, body]);
    }
    if (sample.length) { sampled += sample.length; for (let k = 0; k < sample.length; k += 400) { const part = sample.slice(k, k + 400); await waitDicts(part.map((x) => x[2])); for (const [where, e, body] of part) judgeLanguage(where, e, body); } }
  }
  const said = (law) => (fail[law].length ? `${fail[law].length} found wrong: ${first(fail[law], 2)}` : "");
  check("P10 a line BDB's quoted form does not give to one word is marked †, no other line is, and the row says once how many times the number stands in the verse", fail.P10.length === 0 && seen.P10 > 0, said("P10") || `${seen.P10.toLocaleString("en-US")} lines marked †, at ${wordsJudged.toLocaleString("en-US")} words judged`);
  check("P11 a line of a paragraph BDB numbers otherwise is marked ‡, no other line is, and the row says once for each such paragraph BDB's numeral and gloss, then «STEP's number <the line's number> is BDB's <the numeral BDB gives the entry that number reaches>.»", fail.P11.length === 0 && seen.P11 > 0, said("P11") || `${seen.P11.toLocaleString("en-US")} lines marked ‡; ${ddSeen}`);
  check("P12 every line stands where the file puts it: the stem with its point's labels, the stem's own head, the labels or the opening under no stem, the label as written where it names another stem", fail.P12.length === 0 && seen.P12 > 0, said("P12") || `${seen.P12.toLocaleString("en-US")} lines`);
  check("P13 a row with a line whose point's label names another stem says once why the line names its stem, and no other row says it", fail.P13.length === 0 && seen.P13 > 0, said("P13") || `${seen.P13.toLocaleString("en-US")} lines whose label names another stem`);
  check("P14 at a word written one way and read another, the lines under both forms are counted and said once, and nothing is said where there are none", fail.P14.length === 0 && seen.P14 > 0, said("P14") || `${seen.P14.toLocaleString("en-US")} words with lines under both forms`);
  check("P15 where a number's records include ones of the other language, the row says how many and the language STEP says, and none of them stands among those shown first", fail.P15.length === 0 && seen.P15 > 0, said("P15") || `${seen.P15.toLocaleString("en-US")} rows that say it, at ${sampled.toLocaleString("en-US")} words drawn whole (${cases.size.toLocaleString("en-US")} cases)`);
}

// ---- P16 to P18: the pills of the live reader's card (THE PILLS, in placeCardOf) ------------------------------------
// The live reader's card keeps its frame and fills each cell's pills from these files (pillsAt). Every fifth word of
// the chapters P6 runs over (every word with --every) is drawn whole, its whole entries opened, and its cells asked
// for their pills: each STEP part, each MACULA part, the whole word, each form. What the listing prints as a
// meaning is read off the drawn listing (a «» run of a meaning or an opening, a gloss, a <def>); what must be a pill
// is worked out here again from the files and the listing, by code the block does not share.
{
  const UNA = "unabridged_bdb_1906";
  const NAME_KEY = { "STEP Bible": "step", "MACULA Hebrew": "macula" };
  for (const [k, nm] of Object.entries(SOURCE_NAMES)) NAME_KEY[nm] = k;
  const LET = (s) => [...String(s || "")].filter((c) => c >= "\u05d0" && c <= "\u05ea").length;
  const spans = (hebs) => { let a = 0; return hebs.map((h) => { const n = LET(h); const r = n ? [a, a + n - 1] : null; a += n; return r; }); };
  // the card's own words in a reading's place («(no sense)», «(no gloss)») are no meaning
  const OWN_WORDS = /^\((no |a sense with no )/u;
  const runs = (s) => { const t = String(s); const q = [...t.matchAll(/«([^»]*)»/gu)].map((m) => oneLine(m[1])).filter(Boolean); return (q.length ? q : [oneLine(t)].filter(Boolean)).filter((x) => !OWN_WORDS.test(x)); };
  const tagOf = (s) => (/H\d{4}[A-Za-z]?/u.exec(s || "") || [null])[0];
  const fail = { P16: [], P17: [], P18: [], P19: [], P20: [] }; let wordsJ = 0, cellsJ = 0, pillsJ = 0, meaningsJ = 0, maculaOtherwise = 0, emptyCells = 0, wCells = 0, wRowsSaid = 0, ubsJ = 0, collocJ = 0;
  const words = [];
  for (const key of P6_CHAPTERS) {
    const [book, ch] = key.split("/");
    const mine = JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, book, `${ch}.json.gz`))).toString("utf8"));
    for (const v of mine.verses) { let n = 0; for (const e of v.e) { if (e.m !== undefined) continue; n += 1; if (EVERY || (wordsJ++ % 5 === 0)) words.push({ book, ch, v, e, n, doc: mine }); } }
  }
  wordsJ = 0;
  for (let k = 0; k < words.length; k += 300) {
    const part = words.slice(k, k + 300);
    for (const w of part) { w.body = STAND_IN.createElement("div"); card.draw(w.body, w.doc, w.v, w.e, () => true); }
    for (let spin = 0; spin < 4000; spin += 1) { await settle(); if (part.every((w) => w.body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries").every((h) => h.parent.dataset.ready === "1"))) break; }
    for (const w of part) for (const btn of w.body.all((x) => x.tagName === "button" && x.is("open"))) for (const fn of btn.listeners.click || []) await fn();
    for (const w of part) {
      wordsJ += 1;
      const where = `${w.book} ${w.v.l} word ${w.n}`;
      // what the listing prints as a meaning, by source: every row's lines, and every whole entry opened
      const printed = new Map(); const said = (src, s) => { if (!printed.has(src)) printed.set(src, new Set()); printed.get(src).add(s); };
      for (const row of w.body.all((x) => x.is("row"))) {
        const src = NAME_KEY[(row.all((y) => y.tagName === "b")[0] || {}).textContent]; if (!src) continue;
        for (const x of row.all((y) => y.is("rd") || y.is("def") || (y.tagName === "em" && y.is("gl")))) {
          // a part's reading in its row stands whole; a quoted meaning is each of its «» runs
          for (const s of (y => (y.is("rd") ? runs(y.textContent) : [oneLine(y.textContent)]))(x)) said(src, s);
        }
      }
      // the records each dictionary shows as this word's, under each number: [tag, key, the one line's meanings]
      const shownLines = [];
      for (const h of w.body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries")) {
        const box = h.parent; const tag = (/the number (H\d{4}[A-Za-z]?)\./u.exec(box.textContent) || [])[1]; if (!tag) continue;
        for (const row of box.children.filter((x) => x.is("row"))) {
          const key = NAME_KEY[(row.all((y) => y.tagName === "b")[0] || {}).textContent]; if (!key) continue;
          if (row.children.some((x) => x.is("sub") && /so it is not said to cite this word/u.test(x.textContent))) continue;
          const list = row.children.find((x) => x.tagName === "ul" && x.is("records") && !x.hidden);
          const lines = list ? list.children.map((li) => li.children.find((x) => x.is("line"))).filter(Boolean) : row.children.filter((x) => x.is("line"));
          for (const ln of lines) shownLines.push([tag, key, ln.all((y) => y.is("rd") || y.is("def")).flatMap((y) => (y.is("rd") ? runs(y.textContent) : [oneLine(y.textContent)]))]);
        }
      }
      w.e.f.forEach((f) => {
        const reading = w.e.f.length === 1 ? "form" : f.r === 2 ? "ketiv" : "qere";
        const tp = (f.t && f.t.p) || []; const t = tp.reduce((s, p) => s + LET(p[3]), 0);
        if (!t) return;
        const ss = spans(tp.map((p) => p[3])); const ms = f.m ? spans(f.m.map((x) => x[2])) : [];
        const cells = new Map(); const cellOf = (r) => { const key = `${r[0]}-${r[1]}`; if (!cells.has(key)) cells.set(key, { r, must: [] }); return cells.get(key); };
        cellOf([0, t - 1]); ss.forEach((r) => r && cellOf(r));
        const mFits = f.m && ms.filter(Boolean).length && JSON.stringify(ms.filter(Boolean)) === JSON.stringify(ss.filter(Boolean));
        if (f.m && !mFits) maculaOtherwise += 1;
        // what must be a pill, from the files: STEP's and MACULA's words at this word in their parts' cells (MACULA's where
        // its cut is STEP's), what cites here in the cell of the number it stands under, and every meaning a shown record's
        // one line prints, in the cell of the part whose number it is filed under
        tp.forEach((p, i) => { if (ss[i] && p[0] !== null && oneLine(p[0])) cellOf(ss[i]).must.push(["step", oneLine(p[0])]); });
        if (mFits) f.m.forEach((x, i) => { if (ms[i] && oneLine(x[1])) cellOf(ms[i]).must.push(["macula", oneLine(x[1])]); });
        const partOfTag = (tag) => tp.findIndex((p) => tagOf(p[1]) === tag);
        const h = f.h || {};
        for (const b of h.b || []) { const i = partOfTag(b[9]); if (i >= 0 && ss[i]) for (const [txt, kind] of b[6]) if (kind === "main_gloss" || kind === "opening") cellOf(ss[i]).must.push([UNA, oneLine(txt)]); }
        for (const o of h.o || []) { const i = partOfTag(o[4]); if (i >= 0 && ss[i]) for (const d of o[3]) cellOf(ss[i]).must.push(["openscriptures_bdb_1906", oneLine(d)]); }
        // a UBS sense cited at this very word: by the number's entry, in the cell of the part whose number files it; by
        // MACULA's dictionary form, in the cell of the MACULA part it names
        for (const u of h.u || []) {
          if (u[1] >= 2) continue;
          let r = null;
          if (u[1] === 1) { const j = (f.m || []).findIndex((x, k) => ms[k] && x[2] === u[3]); r = j >= 0 ? ms[j] : null; }
          else { const ent = `${u[0].slice(0, 6)}000000000`; const i = tp.findIndex((p) => { const tg = tagOf(p[1]); const ln = tg && !/^H9\d\d\d$/u.test(tg) ? tagLine(tg) : null; return !!ln && (ln.b.ubs_sdbh_hebrew_v0_9_2 || []).slice(1).includes(ent); }); r = i >= 0 ? ss[i] : null; }
          if (r) for (const g of u[2]) if (oneLine(g)) cellOf(r).must.push(["ubs_sdbh_hebrew_v0_9_2", oneLine(g)]);
        }
        for (const [tag, key, ms2] of shownLines) { const i = partOfTag(tag); if (i >= 0 && ss[i]) for (const s of ms2) cellOf(ss[i]).must.push([key, s]); }
        w.cells = (w.cells || []).concat([...cells.values()].map((c) => ({ ...c, reading, t, f })));
      });
    }
    // each cell asked for its pills, and judged
    for (const w of part) for (const c of w.cells || []) {
      const where = `${w.book} ${w.v.l} word ${w.n} ${c.reading} [${c.r[0]}, ${c.r[1]}]`;
      const got = await card.pillsAt(w.doc, w.v.l, w.n, c.reading, c.r[0], c.r[1], c.t);
      cellsJ += 1; if (!got.pills.length) emptyCells += 1;
      const printedOf = (src) => { const set = new Set(); for (const row of w.body.all((x) => x.is("row"))) { const s = NAME_KEY[(row.all((y) => y.tagName === "b")[0] || {}).textContent]; if (s !== src) continue; for (const y of row.all((z) => z.is("rd") || z.is("def") || (z.tagName === "em" && z.is("gl")))) for (const q of (y.is("rd") ? runs(y.textContent) : [oneLine(y.textContent)])) set.add(q); } return set; };
      const have = new Map();
      for (const p of got.pills) {
        pillsJ += 1;
        // P17: a source the card names, and an address
        if (!(p.src === "step" || p.src === "macula" || SOURCE_NAMES[p.src]) || typeof p.how !== "string" || !p.how.trim()) fail.P17.push(`${where}: «${p.text}» (${p.src}) stands with no address`);
        else if (p.src === "step" && !(c.f.t && p.how.includes(c.f.t.rows.join(" + ")))) fail.P17.push(`${where}: «${p.text}» names no STEP row of this word`);
        else if (SOURCE_NAMES[p.src] && !(p.how.includes(` under ${tagOf(p.how.slice(p.how.lastIndexOf(" under ")))}`) && tagOf(p.how.slice(p.how.lastIndexOf(" under "))) || /cites this verse|cited at this very word/u.test(p.how))) fail.P17.push(`${where}: «${p.text}» names no record of ${p.src} under a number, and nothing that cites here`);
        // P16: the listing prints it as that source's meaning (a whole word's reading: each of its parts)
        const set = printedOf(p.src);
        const ok = p.text.includes("/") && (p.src === "step" || p.src === "macula") ? p.text.split("/").every((x) => set.has(x)) : set.has(p.text);
        if (!ok) fail.P16.push(`${where}: «${p.text}» (${p.src}) is no meaning the listing prints for that source`);
        (have.get(p.src) || have.set(p.src, new Set()).get(p.src)).add(p.text);
      }
      // P19: under a number whose unfoldingWord line says W, no unfoldingWord pill, and the row says why
      { const tp = (c.f.t && c.f.t.p) || []; const ss = spans(tp.map((x) => x[3])); const i = ss.findIndex((r) => r && r[0] === c.r[0] && r[1] === c.r[1]); const tg = i >= 0 ? tagOf(tp[i][1]) : null;
        const ln = tg && !/^H9\d\d\d$/u.test(tg) ? tagLine(tg) : null;
        if (ln && (ln.b.unfoldingword_uhal || [])[0] === "W") {
          wCells += 1;
          if (got.pills.some((x) => x.src === "unfoldingword_uhal")) fail.P19.push(`${where}: ${tg} says W and the cell offers an unfoldingWord pill`);
          const box = w.body.all((x) => x.tagName === "h3" && x.textContent === "In the dictionaries").map((h) => h.parent).find((b) => b.textContent.includes(`the number ${tg}.`));
          const row = box ? box.children.find((x) => x.is("row") && (x.all((y) => y.tagName === "b")[0] || {}).textContent === SOURCE_NAMES.unfoldingword_uhal) : null;
          if (row && row.children.some((x) => x.is("sub") && /another word of the number than the one STEP's letter names/u.test(x.textContent))) wRowsSaid += 1; else fail.P19.push(`${where}: ${tg} says W and its unfoldingWord row does not say why`);
        } }
      // P20: a UBS pill is marked as UBS's own phrase mark (colloc) exactly where it is a gloss of a meaning of the
      // number's UBS entry under a collocation (LEXCollocations), given by no meaning of the entry without one, and the
      // pill is not cited at this very word; the page rests those shut by the dictionary kinds record
      { const tp = (c.f.t && c.f.t.p) || []; const ss = spans(tp.map((x) => x[3])); const i = ss.findIndex((r) => r && r[0] === c.r[0] && r[1] === c.r[1]); const tg = i >= 0 ? tagOf(tp[i][1]) : null;
        const ln = tg && !/^H9\d\d\d$/u.test(tg) ? tagLine(tg) : null;
        const [how, ...ids] = ln ? ln.b.ubs_sdbh_hebrew_v0_9_2 || ["0"] : ["0"];
        const coll = new Set(), plain = new Set();
        if (how !== "H") for (const id of ids) { const e = ((tagFileOf(tg).entries || {}).ubs_sdbh_hebrew_v0_9_2 || {})[id]; for (const bf of (e && e.BaseForms) || []) for (const m of bf.LEXMeanings || []) for (const g of ((m.LEXSenses || [])[0] || {}).Glosses || []) ((m.LEXCollocations || []).length ? coll : plain).add(oneLine(g)); }
        for (const p of got.pills.filter((x) => x.src === "ubs_sdbh_hebrew_v0_9_2")) {
          ubsJ += 1; if (p.colloc) collocJ += 1;
          const want = !p.cites && coll.has(p.text) && !plain.has(p.text);
          if (!!p.colloc !== want) fail.P20.push(`${where}: UBS's «${p.text}» ${p.colloc ? "is marked" : "is not marked"} as a gloss under a collocation alone, and ${want ? "is one" : "is not one"}${p.cites ? " (cited at this very word)" : ""}`);
        } }
      // P18: every meaning the listing shows as this word's in this cell is a pill of the cell
      for (const [src, s] of c.must) { meaningsJ += 1; if (!(have.get(src) || new Set()).has(s)) fail.P18.push(`${where}: «${s}» (${src}) is printed and is no pill here`); }
    }
    for (const w of part) { w.body = null; w.cells = null; }
  }
  const said = (law) => (fail[law].length ? `${fail[law].length} found wrong: ${first(fail[law], 2)}` : "");
  check("P16 every pill a cell offers is a string the listing prints as that source's meaning (a whole word's reading: each of its parts)", fail.P16.length === 0 && pillsJ > 0, said("P16") || `${pillsJ.toLocaleString("en-US")} pills in ${cellsJ.toLocaleString("en-US")} cells of ${wordsJ.toLocaleString("en-US")} words`);
  check("P17 no pill stands without its source and an address that names this word's STEP row or a record", fail.P17.length === 0 && pillsJ > 0, said("P17") || `${pillsJ.toLocaleString("en-US")} pills`);
  // and every line of every tag file that says W names no entry of unfoldingWord's
  let wLines = 0, wWithIds = 0;
  { const { readdirSync } = await import("node:fs");
    for (const f of readdirSync(join(PAGE_FILES, "entries", "t")).filter((x) => x.endsWith(".json.gz"))) {
      const T = JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, "entries", "t", f))).toString("utf8"));
      for (const ln of Object.values(T.tags)) { const u = ln.b.unfoldingword_uhal || []; if (u[0] === "W") { wLines += 1; if (u.length > 1) wWithIds += 1; } }
    } }
  if (wWithIds) fail.P19.push(`${wWithIds} lines say W and name an entry`);
  check("P19 under a number whose unfoldingWord line says W (its one entry, by its own reference to Brown-Driver-Briggs, another word of the number), no cell offers an unfoldingWord pill, and the row says why", fail.P19.length === 0 && wCells > 0,
    fail.P19.length ? `${fail.P19.length} found wrong: ${first(fail.P19, 2)}` : `${wCells.toLocaleString("en-US")} cells under a W number, ${wRowsSaid.toLocaleString("en-US")} rows saying why; ${wLines.toLocaleString("en-US")} lines say W in the tag files, none naming an entry`);
  check("P20 a UBS pill is marked as a gloss under a collocation alone exactly where its meaning under the number's UBS entry names a collocation, no meaning without one gives it, and UBS does not cite it at this very word", fail.P20.length === 0 && collocJ > 0,
    fail.P20.length ? `${fail.P20.length} found wrong: ${first(fail.P20, 2)}` : `${collocJ.toLocaleString("en-US")} of ${ubsJ.toLocaleString("en-US")} UBS pills marked`);
  check("P18 every meaning the listing prints as this word's (at this word, and on the one line of each record shown as this word's) is a pill in its cell", fail.P18.length === 0 && meaningsJ > 0, said("P18") || `${meaningsJ.toLocaleString("en-US")} meanings; ${emptyCells.toLocaleString("en-US")} cells with no pill; ${maculaOtherwise.toLocaleString("en-US")} forms MACULA divides otherwise than STEP, its parts held to the whole word alone`);
}

console.log(bad ? `\n${bad} failing` : "\nthe place card is drawn by one block, and both pages carry it");
process.exit(bad ? 1 : 0);
