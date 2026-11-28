#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It reads the whole of data/place-answers-v1/ (the places,
// the entries, the bridges) and the zones, and prints for a verse each word
// of ours with what every source says there by its own address. It writes
// nothing.
//
// WHAT IT PRINTS UNDER A WORD (27 November 2026, the fresh build):
//
//   STEP      the row or rows the word meets and how; each part with its
//             Hebrew, its English exactly as STEP writes it, its tag (the
//             root's in curly brackets), its grammar; marks; variants
//   MACULA    the word's morphs with MACULA's own columns
//   by the tag of each part (the bridge: tools of the entries' builder made
//   it; a tag is a Strong's number by STEP's own design)
//             what each dictionary says under that tag: the entry found,
//             said EXACT, AMBIGUOUS (how many) or ABSENT (why), and its
//             first glosses or renderings in the source's own order
//   this place, by the source's own citation
//             Brown-Driver-Briggs (both files): of the entries the word's
//             tag reaches, the senses that cite this verse
//             the UBS dictionary: the senses that cite this very word. It
//             cites verse and word. Its word number is not written in any
//             other file; measured against the data it is twice the place of
//             MACULA's morph row in the verse, suffixes and the Aramaic
//             article ending not counted and a word number MACULA's table
//             skips counted as one (the entry the STEP tag reaches cites that
//             number at 96.4 in 100 of the words whose entry cites the verse
//             at all; measured 27 November 2026 over the 39 books). So the
//             number is reckoned
//             through the meeting of our text with MACULA's, and CHECKED at
//             every word: a sense is said to cite this very word only where
//             its entry is one the word's tag reaches, or its lemma has the
//             letters of MACULA's lemma for the morph. A citation that falls
//             on the word's number under another entry is not laid on the
//             word; where the tag's entry cites the verse at another number
//             that is said as a citation of the verse.
//
// All three citing sources number verses as the Hebrew does (measured: where
// STEP's reference gives two numbers they cite under the Hebrew one), so a
// verse is looked up under the source edition's own Hebrew number: STEP's
// for the two BDB files, MACULA's for the UBS dictionary.
//
// MACULA's own SDBH mark is printed as MACULA gives it and is not used as a
// bridge: its ids are not those of the published UBS file.
//
// Run: node tools/say-place-answers-verse-v1.mjs [--tight | --long] [--dir data/place-answers-v1] [--zones data/zones] <book> <chapter:verse[-verse][#entry]> …
//   default  a line a source under each tag, each time the tag stands
//   --tight  the sources run together on a line; a tag's dictionaries said once and pointed back
//            to after; a plain meeting (one for one, the same letters) not said; STEP's and
//            MACULA's Hebrew of each part, MACULA's lemma, SDBH mark and domains left to the
//            default print
//   --long   more of each list
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { readZone } from "./place-answers-sources-v1.mjs";
import { openPlaces, cutOurs, ourLens } from "./place-answers-places-v1.mjs";

// The entries and the bridges are the other builder's files (gzip of one JSON object each). Two things of
// its reading library (place-answers-entries-lib-v1.mjs) are needed to read and print them, and are said
// again here so that this tool reads those files with nothing but itself: how a file is opened, and that a
// string keeps the source file's own character references (&amp; stays &amp;) until it is printed.
const readGzJson = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
const printable = (s) => s.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|amp|lt|gt|quot|apos|emsp|nbsp);/gu, (all, r) => {
  if (r[0] === "#") return String.fromCodePoint(r[1] === "x" ? parseInt(r.slice(2), 16) : parseInt(r.slice(1), 10));
  return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", emsp: String.fromCodePoint(0x2003), nbsp: String.fromCodePoint(0xa0) }[r];
});

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const argv = process.argv.slice(2); const rest = [];
let DIR = join(K3, "data", "place-answers-v1"), ZONES = join(K3, "data", "zones"), TIGHT = false, LONG = false;
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === "--dir") { DIR = argv[i + 1]; i += 1; } else if (argv[i] === "--zones") { ZONES = argv[i + 1]; i += 1; } else if (argv[i] === "--tight") TIGHT = true; else if (argv[i] === "--long") LONG = true; else rest.push(argv[i]);
}
if (rest.length < 2 || rest.length % 2) { console.error("usage: say-place-answers-verse-v1.mjs [--tight | --long] [--dir …] [--zones …] <book> <chapter:verse[-verse][#entry]> …"); process.exit(2); }
for (const need of ["places", "entries", "bridges"]) if (!existsSync(join(DIR, need))) { console.error(`${DIR} holds no ${need}/: the places and the entries are made by their own builders`); process.exit(2); }

const bridge = readGzJson(join(DIR, "bridges", "step-tag-to-entry.json.gz"));
const VERSES = {}; const versesOf = (k) => (VERSES[k] ||= readGzJson(join(DIR, "bridges", `verse-to-sense-${k}.json.gz`)).verses);
const ENTRIES = {}; const entriesOf = (k) => (ENTRIES[k] ||= readGzJson(join(DIR, "entries", `${k}.json.gz`)).entries);
const N = LONG ? 12 : TIGHT ? 2 : 6; // how many items of a list are printed
const q = (s) => `«${printable(String(s)).replace(/\s+/gu, " ").trim()}»`;
const some = (list, n = N, sep = " | ") => (list.length <= n ? list.join(sep) : TIGHT ? `${list.slice(0, n).join(sep)}… (${list.length})` : `${list.slice(0, n).join(sep)}${sep}… (${list.length} in all)`);
const title = (s) => s.split("-").map((x) => (/^i+$/u.test(x) ? x.toUpperCase() : x[0].toUpperCase() + x.slice(1))).join(" ");

// ---- the sources of the bridge, in the order they are printed
const SOURCES = [
  ["stepbible_tbesh_gloss", "STEP's TBESH", "TBESH"],
  ["openscriptures_strongs", "Strong's (Open Scriptures)", "Strong OS"],
  ["wikisource_strongs_explicit_forms", "Strong's (Wikisource)", "Strong WS"],
  ["openscriptures_lexical_index", "Lexical Index", "LexIndex"],
  ["openscriptures_bdb_1906", "BDB (Open Scriptures)", "BDB-OS"],
  ["unabridged_bdb_1906", "BDB (unabridged)", "BDB-un"],
  ["ubs_sdbh_hebrew_v0_9_2", "UBS dictionary", "UBS"],
  ["unfoldingword_uhal", "UHAL", "UHAL"],
];
const WHY_ABSENT = { 0: "the source has no entry for this number", P: "STEP's own number; no dictionary of Strong's numbers has it", H: "the source has the entry but its file is not on hand", B: "the Lexical Index names no BDB entry for it" };

/** Strong's rendering as he lists it, with his sign. */
const rendering = (r) => (r.sign ? `${r.sign} ` : "") + printable(r.t) + (r.lost_sign_trace && r.wikisource_sign ? ` [sign lost in this file; Wikisource writes ${r.wikisource_sign}]` : "") + (r.unbalanced ? " [brackets unbalanced in the file; held whole]" : "");
/** The Open Scriptures BDB: the label of a sense by its path, and the defs that stand in it. */
function bdbSenseLabel(e, path) {
  if (!path) return "outside every sense";
  let senses = e.senses || [], label = "";
  for (const i of path) { const s = senses[i]; if (!s) break; label += (label ? " " : "") + (s.stems ? `${s.stems.join("/")} ` : "") + (s.n !== undefined ? `${s.n}.` : s.stems ? "" : "(unnumbered)"); senses = s.senses || []; }
  return label.trim();
}
const bdbDefText = (df) => q(df.phrase ? df.phrase.t : df.joined ? df.joined.whole : df.t);
function bdbDefsOf(e, path) {
  const seen = new Set(); const out = [];
  for (const df of e.defs || []) {
    const same = path === null ? !df.sense : df.sense && df.sense.length === path.length && df.sense.every((x, j) => x === path[j]);
    if (!same) continue;
    if (df.phrase) { if (seen.has(df.phrase.at)) continue; seen.add(df.phrase.at); }
    out.push(bdbDefText(df));
  }
  return out;
}
/** The Open Scriptures BDB: its defs in the file's order, grouped by the sense each stands in. */
function bdbFirst(e) {
  const groups = []; const seen = new Set();
  for (const df of e.defs || []) {
    if (df.phrase) { if (seen.has(df.phrase.at)) continue; seen.add(df.phrase.at); }
    const key = df.sense ? df.sense.join(".") : "";
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) { g = { key, label: df.sense ? bdbSenseLabel(e, df.sense) : "", defs: [] }; groups.push(g); }
    g.defs.push(bdbDefText(df));
  }
  return groups.map((g) => `${g.label ? g.label + " " : ""}${g.defs.join(", ")}`);
}
/** The unabridged BDB: the italic runs of a head, point or sub-point that open it or carry the provider's gloss tag. */
const unIts = (u, kinds) => (u.italics || []).filter((x) => kinds.includes(x.kind)).map((x) => q(x.t));
const unMain = (e) => { const h = e.blocks[0].head; const m = unIts(h, ["main_gloss"]); return m.length ? m.join(", ") : unIts(h, ["opening"]).length ? `(no main gloss; the head opens with ${unIts(h, ["opening"]).join(", ")})` : TIGHT ? "(no gloss)" : "(the head carries no gloss)"; };
/** The UBS dictionary: the senses of an entry in the file's order, each by its glosses. */
function ubsSenses(e) { const out = []; for (const b of e.BaseForms || []) for (const m of b.LEXMeanings || []) out.push({ id: m.LEXID, glosses: ((m.LEXSenses || [])[0] || {}).Glosses || [], pos: (b.PartsOfSpeech || []).join(", ") }); return out; }

/** What one source says under one tag: [class, text]. */
function sayUnder(key, tag) {
  const row = bridge.tags[tag]; if (!row) return ["absent", "STEP's files use no such tag"];
  const [how, ...ids] = row[key]; const cls = bridge.class_of[how];
  if (cls === "absent") return ["absent", WHY_ABSENT[how] || bridge.how[how]];
  const E = entriesOf(key); const texts = [];
  const shown = key === "unabridged_bdb_1906" ? ids.slice(0, LONG ? 9 : TIGHT ? 1 : 3) : ids.slice(0, LONG ? 9 : TIGHT ? 1 : 2);
  const sep = TIGHT ? "" : ":";
  for (const id of shown) {
    const e = E[id]; if (!e) { texts.push(`${id} (not in the entries)`); continue; }
    if (key === "stepbible_tbesh_gloss") texts.push(`${TIGHT && id === tag ? "" : id + " "}${q(e.Gloss)}`);
    else if (key === "openscriptures_strongs") { const rs = ((e.usage && e.usage.renderings) || []).filter((r) => !r.empty).map(rendering); texts.push(`${id}${sep} ${rs.length ? some(rs) : "(no list of renderings)"}`); }
    else if (key === "wikisource_strongs_explicit_forms") { const rs = (e.renderings || []).filter((r) => !r.empty).map(rendering); texts.push(`${id}${sep} ${e.list_opens ? some(rs) : "(the edition writes no sign for the list here; the definition is held whole)"}`); }
    else if (key === "openscriptures_lexical_index") texts.push(`${TIGHT ? "" : id + " "}${e.def !== undefined ? q(e.def) : "(no gloss)"}`);
    else if (key === "openscriptures_bdb_1906") { const g = bdbFirst(e); texts.push(`${id}${e.type === "root" ? (TIGHT ? " (root)" : " (a root entry)") : ""}${sep} ${g.length ? some(g, TIGHT ? 1 : LONG ? 12 : 5, " ; ") : "(no def tagged)"}`); }
    else if (key === "unabridged_bdb_1906") texts.push(`${id}${sep} ${unMain(e)}`);
    else if (key === "ubs_sdbh_hebrew_v0_9_2") { const ss = ubsSenses(e); texts.push(`${id.slice(0, 6)}${sep} ${ss.length ? some(ss.map((x) => x.glosses.map(q).join(", ") || "(no gloss)"), TIGHT ? 2 : LONG ? 12 : 5) : "(no sense)"}`); }
    else if (key === "unfoldingword_uhal") { const gl = []; for (const x of e.senses || []) for (const g of x.glosses || []) gl.push(q(g.t)); texts.push(`${id}${sep} ${gl.length ? some(gl) : "(no gloss)"}`); }
  }
  if (ids.length > shown.length) texts.push(`${TIGHT ? "+" : "and "}${ids.length - shown.length}${TIGHT ? "" : " more"}`);
  return [cls === "ambiguous" ? `ambiguous (${ids.length})` : cls, texts.join(key === "unabridged_bdb_1906" || ids.length > 1 ? (TIGHT ? " ¦ " : "  ¦  ") : " ")];
}
/** Strong's two editions said together where their lists are the same: byte
 *  for byte, or but for the sign each writes (× in one file, X in the other)
 *  and a blank before a bracket. Said, never merged: each file keeps its bytes. */
const strongAlike = (os, ws) => (os === ws ? "WS same" : os.replace(/\u00d7/gu, "X").replace(/\s+\(/gu, "(") === ws.replace(/\s+\(/gu, "(") ? "WS same but its sign X" : null);

const lettersWords = (x) => (x === "same" ? "the same letters" : x === "another word" ? "ANOTHER WORD stands there: their reading is not this word's" : `spelled otherwise: ${x}`);
const cutWords = (o) => (o.cutState === "theirs" ? "" : o.cutState === "their variant's" ? ` · cut on our letters STEP's own (its variant ${o.cutFromVariant.who}= writes the row in our letters): ${o.cut.join("+")}` : o.cutState === "carried" ? ` · cut carried onto our letters: ${o.cut.join("+")}` : o.cutState === "shared" ? " · shares a part of theirs with its neighbor" : " · cut not carried: the parts stand with their own letters only");

const saidTag = new Map(); // tag → where its dictionaries were printed (tight mode points back)
const notOnHand = new Set(), ownSeen = new Map(); // tight mode: said once at the end

for (let a = 0; a < rest.length; a += 2) {
  const book = rest[a], m = /^(\d+):(\d+)(?:-(\d+))?(?:#(\d+))?$/u.exec(rest[a + 1]);
  if (!m) { console.error(`not chapter:verse: ${rest[a + 1]}`); process.exit(2); }
  const onlyEntry = m[4] !== undefined ? Number(m[4]) : null;
  const pf = join(DIR, "places", `${book}.json.gz`), zf = join(ZONES, `${book}.bin`);
  if (!existsSync(pf) || !existsSync(zf)) { console.error(`no places file or zone for ${book}`); process.exit(2); }
  const P = openPlaces(pf), zone = readZone(zf), doc = P.doc;
  // the place of every morph row of MACULA's in its verse (the UBS dictionary's word number is twice that)
  // the UBS dictionary's word number of every morph row of MACULA's: its place in the verse, suffixes and the
  // Aramaic article ending not counted, a word number the table skips counted as one; 0 where not counted
  const iId = doc.macula.columns.indexOf("xml:id"), iPos = doc.macula.columns.indexOf("pos"), iClass = doc.macula.columns.indexOf("class"), iLang = doc.macula.columns.indexOf("lang"); const placeOf = new Array(doc.macula.rows);
  { let last = "", n = 0, lastWord = 0; for (let i = 0; i < doc.macula.rows; i += 1) { const cells = P.maculaCells(i); const id = cells[iId]; const v = id.slice(0, 9), word = Number(id.slice(9, 12)); if (v !== last) { last = v; n = 0; lastWord = 0; } if (word > lastWord + 1) n += word - lastWord - 1; lastWord = word; if (cells[iPos] === "suffix" || (cells[iClass] === "art" && cells[iLang] === "A")) placeOf[i] = 0; else { n += 1; placeOf[i] = n; } } }
  const from = Number(m[2]), to = m[3] ? Number(m[3]) : from;
  for (let v = from; v <= to; v += 1) {
    const label = `${m[1]}:${v}`; const si = zone.sections.findIndex((s) => s.label === label);
    if (si < 0) { console.log(`\n${title(book)} ${label}: no such verse in our text`); continue; }
    console.log(`\n=== ${title(book)} ${label} ===${TIGHT ? "" : "   [«=» is: one for one, the same letters]"}`);
    let n = 0;
    zone.sections[si].entries.forEach((e, ei) => {
      if (e.mark) return;
      n += 1; if (onlyEntry !== null && ei !== onlyEntry) return;
      const W = P.wordAt(si, ei);
      console.log(`${TIGHT ? "" : "\n"}${n}. ${e.s}${W.kind === "plain" ? "" : `   (${W.kind})`}`);
      W.forms.forEach((f, fi) => {
        const text = e.forms ? e.forms[fi].s : e.s; let pad = "   ";
        if (e.forms) { console.log(`   the ${f.role} form ${text}`); pad = "      "; }
        const o = f.role === "written" ? f.step.written : f.step.read;
        const tags = []; // the tags of the parts this form takes, in order
        // ---- STEP
        if (!o || o.way === 0) console.log(`${pad}STEP: no row of STEP's`);
        else {
          const plain = o.way === 1 && o.letters === "same" && !o.onWrittenForm && !o.verseNumberedOtherwise;
          const meetWords = `${o.wayWords} · ${lettersWords(o.letters)}${cutWords(o)}${o.onWrittenForm ? " · STEP's WRITTEN form, from its variants column" : ""}${o.verseNumberedOtherwise ? " · the verse is numbered otherwise" : ""}`;
          const head = TIGHT ? `${pad}STEP ${plain && o.rows[0].verse === label ? `#${o.rows[0].word}=${o.rows[0].type}` : o.rows.map((r) => r.ref).join(" + ")}${plain ? ":" : ` · ${meetWords} ·`}` : `${pad}STEP ${o.rows.map((r) => r.ref).join(" + ")} · ${plain ? "=" : meetWords} · `;
          const bits = o.parts.map((p, k) => { const seam = o.seams.find((x) => x.before === k); return `${seam ? `[seam ${seam.mark}] ` : ""}${p.en === undefined ? `${p.he} (${p.whole === "does not cut alike" ? "the variant's cells do not cut alike" : "STEP gives this form's Hebrew only"})` : `${TIGHT ? "" : p.he + " "}«${p.en}» ${p.root ? `{${p.tag}}` : p.tag}${p.coversNext ? "+" : ""}${TIGHT ? "" : " " + p.gram}`}`; });
          const lens = ourLens(o, o.parts.map((p) => p.letters)); const mine = lens && (o.cutState === "carried" || o.cutState === "their variant's") ? cutOurs(text, lens) : null;
          console.log(`${head} ${bits.join(TIGHT ? " | " : "  |  ")}${o.marks.length && !TIGHT ? `   marks: ${o.marks.map((mk) => (mk.he === " " ? "(space)" : `«${mk.he}» ${mk.tag === undefined ? "" : mk.tag}`)).join(" · ")}` : ""}${mine ? `   ours cut: ${mine.join(" | ")}` : ""}`);
          for (const vr of o.variantsWithOurLetters) console.log(`${pad}     STEP's own variant with our letters: ${vr.raw.trim()}`);
          o.rows.forEach((r, ri) => {
            if (o.variants[ri]) console.log(`${pad}     the variant taken: ${o.variants[ri].raw.trim()}`);
            if (r.meaning_variants.trim() || r.spelling_variants.trim() || o.rows.length > 1 || o.way >= 3 || !r.hebrew) console.log(`${pad}     row ${r.ref} whole: ${r.hebrew || "(no Hebrew)"} | ${r.translation} | ${r.dstrongs} | ${r.grammar}${r.meaning_variants.trim() ? ` | meaning variants: ${r.meaning_variants}` : ""}${r.spelling_variants.trim() ? ` | spelling variants: ${r.spelling_variants}` : ""}`);
          });
          if (o.letters !== "another word") for (const p of o.parts) if (p.tag) tags.push({ tag: p.tag, root: !!p.root || o.parts.filter((x) => x.tag && !/^H9\d\d\d$/u.test(x.tag)).length === 1, en: p.en });
        }
        // ---- MACULA
        const mo = f.macula;
        if (!mo) console.log(`${pad}MACULA: not asked (MACULA carries what is read)`);
        else if (mo.way === 0) console.log(`${pad}MACULA: no word of MACULA's`);
        else {
          const plainM = mo.way === 1 && mo.letters === "same" && !mo.verseNumberedOtherwise;
          const morph = (x) => { if (TIGHT) return `«${x.gloss}»${x.english === x.gloss ? "" : `/«${x.english}»`} ${x.strongnumberx} ${x.class}${x.stem ? " " + x.stem : ""}${x.sensenumber ? " s" + x.sensenumber : ""}`; const b = [`${x.text} «${x.gloss}» «${x.english}» ${x.strongnumberx} ${x.lemma} ${x.class}`]; if (x.stem) b.push(`stem ${x.stem}`); if (x.sensenumber) b.push(`sense ${x.sensenumber}`); if (x.sdbh) b.push(`sdbh ${x.sdbh}`); if (x.lexdomain) b.push(`lex ${x.lexdomain}`); if (x.coredomain) b.push(`core ${x.coredomain}`); if (x.contextualdomain) b.push(`context ${x.contextualdomain}`); return b.join(" · "); };
          const meetM = `${mo.wayWords} · ${lettersWords(mo.letters)}${cutWords(mo)}${mo.verseNumberedOtherwise ? " · the verse is numbered otherwise" : ""}`;
          if (TIGHT) console.log(`${pad}MACULA ${mo.words.map((w) => (plainM ? w.ref.replace(/^.*!/u, "!") : w.ref)).join(" + ")}${plainM ? ":" : ` · ${meetM} ·`} ${mo.morphs.map(morph).join(" | ")}`);
          else console.log(`${pad}MACULA ${mo.words.map((w) => w.ref).join(" + ")} · ${plainM ? "=" : meetM} ·  ${mo.morphs.map(morph).join("  |  ")}`);
        }
        // ---- by the tag of each part: what each dictionary says
        const own = tags.filter((t) => /^H9\d\d\d$/u.test(t.tag)), dict = tags.filter((t) => !/^H9\d\d\d$/u.test(t.tag));
        const ownText = (t) => { const [, id] = bridge.tags[t.tag] ? bridge.tags[t.tag].stepbible_tbesh_gloss : []; const ent = id ? entriesOf("stepbible_tbesh_gloss")[id] : null; return `${t.tag} ${ent ? q(ent.Gloss) : "(no line)"}`; };
        if (TIGHT) for (const t of own) ownSeen.set(t.tag, ownText(t));
        if (own.length && !TIGHT) console.log(`${pad}STEP's own numbers for a prefix, a suffix or a mark (no dictionary of Strong's numbers has them); TBESH says: ${own.map((t) => { const [, id] = bridge.tags[t.tag] ? bridge.tags[t.tag].stepbible_tbesh_gloss : []; const ent = id ? entriesOf("stepbible_tbesh_gloss")[id] : null; return `${t.tag} ${ent ? q(ent.Gloss) : "(no line)"}`; }).join(" · ")}`);
        for (const t of dict) {
          const where = `${title(book)} ${label} word ${n}`;
          if (TIGHT && saidTag.has(t.tag)) { console.log(`${pad}{${t.tag}}: as at ${saidTag.get(t.tag)}`); continue; }
          saidTag.set(t.tag, where);
          const lines = SOURCES.map(([key, name, short]) => { const [cls, txt] = sayUnder(key, t.tag); return { key, name, short, cls, txt }; });
          if (TIGHT) {
            const by = Object.fromEntries(lines.map((x) => [x.key, x]));
            const mark = (x) => (x.cls === "exact" ? "" : ` [${x.cls.replace("ambiguous (", "one of ").replace(")", "")}]`);
            const out = [];
            for (const x of lines) {
              if (x.cls.startsWith("absent")) { if (x.txt === WHY_ABSENT.H) notOnHand.add(x.short); else out.push(`${x.short}: ${x.txt === WHY_ABSENT[0] ? "no entry" : x.txt}`); continue; }
              if (x.key === "wikisource_strongs_explicit_forms" && !by.openscriptures_strongs.cls.startsWith("absent") && strongAlike(by.openscriptures_strongs.txt, x.txt)) continue;
              out.push(`${x.short}${mark(x)} ${x.txt}`);
            }
            console.log(`${pad}{${t.tag}}: ${out.join(" · ")}`);
          } else {
            console.log(`${pad}by the tag ${t.tag}${t.root ? " (the root)" : ""}, what each dictionary says:`);
            for (const x of lines) console.log(`${pad}   ${x.name.padEnd(27)} ${x.cls.toUpperCase().padEnd(14)} ${x.txt}`);
          }
        }
        // ---- this place, by the source's own citation
        const here = [];
        if (o && o.way !== 0 && o.letters !== "another word") {
          const hv = o.rows[0].verse; // STEP's Hebrew number of the row
          for (const t of dict) {
            const row = bridge.tags[t.tag]; if (!row) continue;
            // BDB, Open Scriptures: [id, sense path or null, the reference's index]
            { const ids = new Set(row.openscriptures_bdb_1906.slice(1)); const list = ((versesOf("openscriptures_bdb_1906")[book] || {})[hv] || []).filter((x) => ids.has(x[0])); const seen = new Set();
              for (const [id, path] of list) { const k = `${id}|${path ? path.join(".") : ""}`; if (seen.has(k)) continue; seen.add(k); const ent = entriesOf("openscriptures_bdb_1906")[id]; const defs = bdbDefsOf(ent, path); here.push(`${TIGHT ? "BDB-OS" : `BDB (Open Scriptures) cites this verse (${hv}) in`} ${id}, ${path ? "sense " + bdbSenseLabel(ent, path) : "outside every sense"}${defs.length ? ": " + some(defs, TIGHT ? 3 : 4, ", ") : ""}`); } }
            // BDB, unabridged: [id, paragraph, point (-1 the head), sub-point (-1 none), piece]
            { const ids = new Set(row.unabridged_bdb_1906.slice(1)); const list = ((versesOf("unabridged_bdb_1906")[book] || {})[hv] || []).filter((x) => ids.has(x[0])); const seen = new Set(); const units = [];
              for (const [id, para, point, sub] of list) { const k = `${id}|${para}|${point}|${sub}`; if (seen.has(k)) continue; seen.add(k); const ent = entriesOf("unabridged_bdb_1906")[id]; const blk = ent.blocks[para]; const pt = point >= 0 ? (blk.points || [])[point] : null; const sb = pt && sub >= 0 ? (pt.sub || [])[sub] : null; const unit = sb || pt || blk.head; const its = unIts(unit, ["opening", "tagged_gloss", "main_gloss"]); units.push(`${TIGHT && ids.size === 1 ? "" : id}${para ? ` paragraph ${para + 1}` : ""}${TIGHT ? (ids.size === 1 ? "" : " ") : ", "}${pt ? `${TIGHT ? "" : "point "}${pt.label || "(no number)"}${sb ? ` ${sb.label || ""}` : ""}` : "the head"}${its.length ? (TIGHT ? " " : ": ") + its.slice(0, TIGHT ? 1 : 2).join(", ") : ""}`); }
              if (units.length) here.push(`${TIGHT ? "BDB-un" : `BDB (unabridged) cites this verse (${hv}) in`} ${some(units, TIGHT ? 1 : LONG ? 9 : 3, " ; ")}${ids.size > 1 ? (TIGHT ? ` [${new Set(list.map((x) => x[0])).size} of ${ids.size} records]` : `   [${new Set(list.map((x) => x[0])).size} of the ${ids.size} records the tag reaches]`) : ""}`); }
          }
        }
        if (mo && mo.way !== 0 && mo.letters !== "another word") {
          // the UBS dictionary: [sense id, word number]; the number is reckoned (see the head of this file) and checked
          const ubsTagEntries = new Set(); for (const t of dict) { const row = bridge.tags[t.tag]; if (row) for (const id of row.ubs_sdbh_hebrew_v0_9_2.slice(1)) ubsTagEntries.add(id); }
          const UE = entriesOf("ubs_sdbh_hebrew_v0_9_2"); const lettersOnly = (x) => Array.from(String(x || "")).filter((ch) => { const c = ch.codePointAt(0); return c >= 0x5d0 && c <= 0x5ea; }).join("");
          const mm = /^\S+ (\d+):(\d+)!/u.exec(mo.words[0].ref); const mv = `${mm[1]}:${mm[2]}`; const all = (versesOf("ubs_sdbh_hebrew_v0_9_2")[book] || {})[mv] || [];
          const glossOf = (lexid) => { const ent = UE[`${lexid.slice(0, 6)}000000000`]; const sn = ent ? ubsSenses(ent).find((y) => y.id === lexid) : null; return sn ? sn.glosses.map(q).join(", ") || "(no gloss)" : "(not in the entries)"; };
          let rootSaid = false; const numbers = new Set();
          for (const x of mo.morphs) {
            const w = 2 * placeOf[x.index]; if (!w) continue; numbers.add(w);
            for (const [lexid] of all.filter((c) => c[1] === w)) {
              const eid = `${lexid.slice(0, 6)}000000000`; const ent = UE[eid];
              const byTag = ubsTagEntries.has(eid), byLemma = ent && lettersOnly(ent.Lemma) !== "" && lettersOnly(ent.Lemma) === lettersOnly(x.lemma);
              if (byTag) rootSaid = true;
              if (TIGHT && !byTag && (!byLemma || ["cj", "prep", "art"].includes(x.class))) continue; // the tight print leaves a prefix's own citation to the default print
              if (byTag || byLemma) here.push(TIGHT ? `UBS ${glossOf(lexid)}${byTag ? "" : " [by MACULA's lemma]"}` : `the UBS dictionary cites this very word (${mv}, its word ${w}: MACULA's morph ${x.text}): sense ${lexid} ${glossOf(lexid)} — ${byTag ? "an entry the tag reaches" : `entry ${eid.slice(0, 6)}, which has the letters of MACULA's lemma (the STEP tag of this part reaches no UBS entry)`}`);
              else if (!TIGHT) here.push(`(not laid on this word: the UBS dictionary cites its word ${w} of ${mv} under entry ${eid.slice(0, 6)} ${ent ? ent.Lemma : ""} ${glossOf(lexid)}, which is neither the tag's entry nor MACULA's lemma here: its word count differs in this verse)`);
            }
          }
          if (!rootSaid && ubsTagEntries.size) {
            // the tag's entry cites the verse, at another number than this word's: said as a citation of the verse
            const other = all.filter((c) => ubsTagEntries.has(`${c[0].slice(0, 6)}000000000`) && !numbers.has(c[1]));
            const seen = new Set();
            for (const [lexid, w] of other) { if (seen.has(lexid)) continue; seen.add(lexid); here.push(TIGHT ? `UBS (the verse, its word ${w}) ${glossOf(lexid)}` : `the UBS dictionary's entry for the tag cites this verse (${mv}) at its word ${w}, not this word's number as reckoned: sense ${lexid} ${glossOf(lexid)}`); }
          }
        }
        if ((!mo || mo.way === 0) && o && o.way !== 0 && o.letters !== "another word" && dict.length) {
          // no word of MACULA's to reckon a number by: the tag's UBS entry citing the verse is said as a citation of the verse
          const ubsTagEntries = new Set(); for (const t of dict) { const row = bridge.tags[t.tag]; if (row) for (const id of row.ubs_sdbh_hebrew_v0_9_2.slice(1)) ubsTagEntries.add(id); }
          const UE = entriesOf("ubs_sdbh_hebrew_v0_9_2"); const hv = o.rows[0].verse; const seen = new Set();
          for (const [lexid, w] of ((versesOf("ubs_sdbh_hebrew_v0_9_2")[book] || {})[hv] || []).filter((c) => ubsTagEntries.has(`${c[0].slice(0, 6)}000000000`))) {
            if (seen.has(lexid)) continue; seen.add(lexid); const ent = UE[`${lexid.slice(0, 6)}000000000`]; const sn = ent ? ubsSenses(ent).find((y) => y.id === lexid) : null; const gl = sn ? sn.glosses.map(q).join(", ") || "(no gloss)" : "";
            here.push(TIGHT ? `UBS (the verse, its word ${w}) ${gl}` : `the UBS dictionary's entry for the tag cites this verse (${hv}) at its word ${w} (MACULA carries no word here to reckon the number by): sense ${lexid} ${gl}`);
          }
        }
        if (here.length) { if (TIGHT) console.log(`${pad}here: ${here.join(" · ")}`); else { console.log(`${pad}this place, by the source's own citation:`); for (const h of here) console.log(`${pad}   ${h}`); } }
      });
    });
  }
}
if (TIGHT) {
  console.log("\nSaid once for the print above:");
  console.log("  STEP and MACULA: only what is not «one for one, the same letters» is said of a meeting; a part is «English as STEP writes it» and its tag, the root's tag in curly brackets (its Hebrew and grammar are in the default print); a morph is «gloss»/«english» (once where the two are the same), MACULA's Strong number, class, stem, sense number (its Hebrew, lemma, SDBH mark and domains are in the default print).");
  console.log("  {tag}: what each dictionary says under the tag by the bridge: the entry, exact unless [one of n] (ambiguous: the number reaches n entries; the first is shown) or a reason is given; then its first glosses or renderings in the source's own order, cut short with the count in brackets. Strong OS is Strong's in the Open Scriptures file; Strong WS (the Wikisource edition) is printed only where its list reads otherwise.");
  console.log("  here: the source's own citation of this place. BDB-OS, BDB-un: the entry the tag reaches cites this verse (its sense or point; the first, with the count where more; the record named where the bridge is ambiguous). UBS: a sense of the tag's entry cites this very word (verse and word); [by MACULA's lemma] where the tag reaches no UBS entry and the sense's entry has the letters of MACULA's lemma; «UBS (the verse, its word n)» where the tag's entry cites the verse at another number than this word's. A prefix's own UBS citation is in the default print.");
  if (ownSeen.size) console.log(`  STEP's own numbers for a prefix, a suffix or a mark (no dictionary of Strong's numbers has them), with TBESH's gloss: ${[...ownSeen.values()].sort().join(" · ")}`);
  if (notOnHand.size) console.log(`  Not printed under a tag where the source has the entry but its file is not on hand: ${[...notOnHand].join(", ")}.`);
}
