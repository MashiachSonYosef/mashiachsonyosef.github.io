#!/usr/bin/env node
// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. It reads the places files and the zones and prints, for a
// verse, each word of ours with what STEP and MACULA say there, as words. It
// writes nothing.
//
// WHY. The places files are tables of numbers; a person checks them by
// reading a verse. This prints a verse the way a person reads STEP's own
// row: the reference, the type, each part with its Hebrew, its English
// exactly as STEP writes it (between « »; a leading space is STEP's), its
// tag (the root's in curly brackets), its grammar; then the marks, the
// variants column whole; then MACULA's morphs with MACULA's own columns
// (text, «gloss», «english», Strong number, lemma, class, stem, sense, SDBH
// entry, domains). --full prints one line a part and every cell of a row;
// --brief prints a line a source and writes «=» for «one for one, the same
// letters».
//
// Run: node tools/print-place-answers-v1.mjs [--places data/place-answers-v1/places] [--zones data/zones] [--full | --brief] <book> <chapter:verse[-verse][#entry]> [<book> <chapter:verse> …]
//   e.g. node tools/print-place-answers-v1.mjs genesis 1:1-5 ruth 3:12 ruth 3:12#4   (#4: only the entry of that index)
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { readZone } from "./place-answers-sources-v1.mjs";
import { openPlaces, cutOurs, ourLens } from "./place-answers-places-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const argv = process.argv.slice(2); const rest = [];
let PLACES = join(K3, "data", "place-answers-v1", "places"), ZONES = join(K3, "data", "zones"), FULL = false, BRIEF = false;
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === "--places") { PLACES = argv[i + 1]; i += 1; } else if (argv[i] === "--zones") { ZONES = argv[i + 1]; i += 1; } else if (argv[i] === "--full") FULL = true; else if (argv[i] === "--brief") BRIEF = true; else rest.push(argv[i]);
}
if (rest.length < 2 || rest.length % 2) { console.error("usage: print-place-answers-v1.mjs [--places dir] [--zones dir] [--full] <book> <chapter:verse[-verse]> …"); process.exit(2); }

const lettersWords = (x) => (x === "same" ? "the same letters" : x === "another word" ? "ANOTHER WORD stands there: their reading is not this word's" : `spelled otherwise: ${x}`);
const cutWords = (o) => (o.cutState === "theirs" ? "" : o.cutState === "their variant's" ? ` · the cut on our letters is STEP's own, from its variant ${o.cutFromVariant.who}= which writes the row in our letters: ${o.cut.join("+")}` : o.cutState === "carried" ? ` · their cut carried onto our letters: ${o.cut.join("+")}` : o.cutState === "shared" ? " · shares a part of theirs with its neighbor" : " · their cut NOT carried: the parts stand with their own letters only");
const title = (s) => s.split("-").map((x) => (/^i+$/.test(x) ? x.toUpperCase() : x[0].toUpperCase() + x.slice(1))).join(" ");

/** STEP at a form. Short: the row, how it meets, then the parts on one line
 *  (Hebrew, «English as STEP writes it», tag with the root's in curly
 *  brackets, grammar), the marks, and the variants column whole where the
 *  row has one. With --full, one line a part and every cell of the row. */
function printStep(label, o, ours, pad) {
  if (!o) return;
  if (o.way === 0) { console.log(`${pad}STEP ${label}: no row of STEP's`); return; }
  const rows = o.rows.map((r) => r.ref).join(" + ");
  const seamOfRow = o.way === 4 ? ` (STEP's mark between the row's words: ${o.rows[0].reading && !o.onWrittenForm ? o.rows[0].reading.seams.map((x) => x.mark).join(" ") : "in the variant"})` : "";
  const plainMeeting = o.way === 1 && o.letters === "same" && !o.onWrittenForm && !o.verseNumberedOtherwise;
  const head = `${pad}STEP ${label}${label ? ": " : ""}${rows} · ${BRIEF && plainMeeting ? "=" : `${o.wayWords}${seamOfRow} · ${lettersWords(o.letters)}${cutWords(o)}${o.onWrittenForm ? " · this is STEP's WRITTEN form, from its variants column" : ""}${o.verseNumberedOtherwise ? " · the verse is numbered otherwise" : ""}`}`;
  const lens = ourLens(o, o.parts.map((p) => p.letters));
  const mine = lens && ours ? cutOurs(ours, lens) : null;
  if (!BRIEF) console.log(head);
  if (FULL) {
    o.parts.forEach((p, k) => {
      const seam = o.seams.find((x) => x.before === k);
      if (seam) console.log(`${pad}   seam ${seam.mark} (STEP's own mark between two words of one row)`);
      console.log(p.en === undefined ? `${pad}   part ${k + 1}: ${p.he}  (${p.whole === "does not cut alike" ? "this variant's Hebrew and tags do not cut alike: read it whole below" : "STEP gives this form's Hebrew only"})${mine ? `  · ours: ${mine[k]}` : ""}` : `${pad}   part ${k + 1}: ${p.he}  «${p.en}»  ${p.root ? "{" + p.tag + "} root" : p.tag}${p.coversNext ? " +(covers the next word too)" : ""}  ${p.lang}:${p.gram}${mine ? `  · ours: ${mine[k]}` : ""}`);
    });
    if (o.marks.length) console.log(`${pad}   marks: ${o.marks.map((m) => (m.he === " " ? "(space)" : `«${m.he}» ${m.tag === undefined ? "" : m.tag}`)).join(" · ")}`);
  } else {
    const bits = o.parts.map((p, k) => { const seam = o.seams.find((x) => x.before === k); return `${seam ? `[seam ${seam.mark}] ` : ""}${p.en === undefined ? `${p.he} (${p.whole === "does not cut alike" ? "this variant's Hebrew and tags do not cut alike: read it whole below" : "STEP gives this form's Hebrew only"})` : `${p.he} «${p.en}» ${p.root ? "{" + p.tag + "}" : p.tag}${p.coversNext ? "+" : ""} ${p.gram}`}`; });
    console.log(`${BRIEF ? head + " ·  " : pad + "     "}${bits.join("  |  ")}${o.marks.length ? `   marks: ${o.marks.map((m) => (m.he === " " ? "(space)" : `«${m.he}» ${m.tag === undefined ? "" : m.tag}`)).join(" · ")}` : ""}${mine && (o.cutState === "carried" || o.cutState === "their variant's") ? `   ours cut: ${mine.join(" | ")}` : ""}`);
  }
  for (const v of o.variantsWithOurLetters) console.log(`${pad}     STEP's own variant with our letters: ${v.raw.trim()}`);
  o.rows.forEach((r, ri) => {
    if (o.variants[ri]) console.log(`${pad}     the variant taken: ${o.variants[ri].raw}`);
    if (FULL) {
      console.log(`${pad}   row ${r.ref} whole: ${r.hebrew || "(no Hebrew)"} | ${r.translation} | ${r.dstrongs} | ${r.grammar}${r.meaning_variants.trim() ? ` | meaning variants: ${r.meaning_variants}` : ""}${r.spelling_variants.trim() ? ` | spelling variants: ${r.spelling_variants}` : ""}`);
      console.log(`${pad}   more of the row: transliteration ${r.transliteration} | root ${r.root_dstrong_instance} | alternative ${r.alternative_strongs_instance} | expanded ${r.expanded_strong_tags}`);
    } else if (r.meaning_variants.trim() || r.spelling_variants.trim() || o.rows.length > 1 || o.way >= 3 || !r.hebrew) {
      console.log(`${pad}     row ${r.ref} whole: ${r.hebrew || "(no Hebrew)"} | ${r.translation} | ${r.dstrongs} | ${r.grammar}${r.meaning_variants.trim() ? ` | meaning variants: ${r.meaning_variants}` : ""}${r.spelling_variants.trim() ? ` | spelling variants: ${r.spelling_variants}` : ""}`);
    }
  });
}
/** MACULA at a form: the word, how it meets, then each morph with MACULA's
 *  own columns: text, «gloss», «english», Strong number as MACULA writes it,
 *  lemma, class, stem, sense, the SDBH entry and the domains. */
function printMacula(o, ours, pad) {
  if (!o) { console.log(`${pad}MACULA: not asked (MACULA carries what is read)`); return; }
  if (o.way === 0) { console.log(`${pad}MACULA: no word of MACULA's`); return; }
  const plainM = o.way === 1 && o.letters === "same" && !o.verseNumberedOtherwise;
  const headM = `${pad}MACULA${BRIEF ? "" : ":"} ${o.words.map((w) => w.ref).join(" + ")} · ${BRIEF && plainM ? "=" : `${o.wayWords} · ${lettersWords(o.letters)}${cutWords(o)}${o.verseNumberedOtherwise ? " · the verse is numbered otherwise" : ""}`}`;
  if (!BRIEF) console.log(headM);
  const morph = (m) => {
    const bits = [`${m.text} «${m.gloss}» «${m.english}» ${m.strongnumberx} ${m.lemma} ${m.class}`];
    if (m.stem) bits.push(`stem ${m.stem}`);
    if (m.sensenumber) bits.push(`sense ${m.sensenumber}`);
    if (m.sdbh) bits.push(`sdbh ${m.sdbh}`);
    if (m.lexdomain) bits.push(`lex ${m.lexdomain}`);
    if (m.coredomain) bits.push(`core ${m.coredomain}`);
    if (m.contextualdomain) bits.push(`context ${m.contextualdomain}`);
    return bits.join(" · ");
  };
  if (!FULL) { console.log(`${BRIEF ? headM + " ·  " : pad + "     "}${o.morphs.map(morph).join("  |  ")}`); return; }
  o.morphs.forEach((m, k) => {
    console.log(`${pad}   morph ${k + 1} (${m["xml:id"]}): ${morph(m)} · ${m.pos} · ${m.morph}`);
    console.log(`${pad}      more: ${Object.entries(m).filter(([k2, v]) => v !== "" && !["index", "line", "xml:id", "ref", "text", "gloss", "english", "strongnumberx", "lemma", "class", "pos", "morph", "stem", "sensenumber", "sdbh", "lexdomain", "coredomain", "contextualdomain"].includes(k2)).map(([k2, v]) => `${k2} ${v}`).join(" · ")}`);
  });
}

for (let a = 0; a < rest.length; a += 2) {
  const book = rest[a], m = /^(\d+):(\d+)(?:-(\d+))?(?:#(\d+))?$/.exec(rest[a + 1]);
  const onlyEntry = m && m[4] !== undefined ? Number(m[4]) : null;
  if (!m) { console.error(`not chapter:verse: ${rest[a + 1]}`); process.exit(2); }
  const pf = join(PLACES, `${book}.json.gz`), zf = join(ZONES, `${book}.bin`);
  if (!existsSync(pf) || !existsSync(zf)) { console.error(`no places file or zone for ${book}`); process.exit(2); }
  const P = openPlaces(pf), zone = readZone(zf);
  const from = Number(m[2]), to = m[3] ? Number(m[3]) : from;
  for (let v = from; v <= to; v += 1) {
    const label = `${m[1]}:${v}`; const si = zone.sections.findIndex((s) => s.label === label);
    if (si < 0) { console.log(`\n${title(book)} ${label}: no such verse in our text`); continue; }
    console.log(`\n=== ${title(book)} ${label} (section ${si}) ===${BRIEF ? "   [= is: one for one, the same letters]" : ""}`);
    let n = 0;
    zone.sections[si].entries.forEach((e, ei) => {
      if (e.mark) return;
      n += 1;
      if (onlyEntry !== null && ei !== onlyEntry) return;
      const W = P.wordAt(si, ei);
      console.log(`${BRIEF ? "" : "\n"}${n}. ${e.s}   (entry ${ei}${W.kind === "plain" ? (BRIEF ? "" : "; plain") : `; ${W.kind}`})`);
      W.forms.forEach((f, fi) => {
        const text = e.forms ? e.forms[fi].s : e.s; let pad = "   ";
        if (e.forms) { console.log(`   the ${f.role} form ${text}`); pad = "      "; }
        printStep(f.role === "written" ? "(written line)" : BRIEF ? "" : "(read line)", f.role === "written" ? f.step.written : f.step.read, text, pad);
        if (f.role === "plain" && f.step.written) printStep("(this row's written form)", f.step.written, text, pad);
        printMacula(f.macula, text, pad);
      });
    });
  }
}
