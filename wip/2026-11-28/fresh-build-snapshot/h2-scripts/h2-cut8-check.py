import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
def sub(old, new):
    global s
    assert s.count(old) == 1, (old[:90], s.count(old)); s = s.replace(old, new)

# the head: P6's citations read their kinds from the chapter file; P8 without say and why; P10 to P15
sub('''//       part's Hebrew and English as the file holds them; a citation of the
//       unabridged BDB with its words inside «» only where the record's own
//       file classes a run as the entry's meaning or as the words its unit
//       opens with, every other run plain, as the record's italics. What must''', '''//       part's Hebrew and English as the file holds them; a citation of the
//       unabridged BDB with its words inside «» only where the chapter file
//       classes a run as the entry's meaning or as the words its unit opens
//       with (each run carries its kind there, held to the record by
//       tools/check-place-answers-page-v1.mjs G6), every other run plain, as
//       the record's italics. What must''')
sub('''//   P8  what the data says, the card says: a citation's label (its stem,
//       point and letter), a row's sentences under a number (a tag's line's
//       say) and a record's sentence (a form's or a line's why), planted in a
//       copy of the files, each print as planted, and the row's sentences
//       stand in place of the card's own count of records''', '''//   P8  what the data says, the card says: a citation's stem and its point's
//       labels, and a record's language, planted in a copy of the files, each
//       print as planted. The card reads no name that no data writes''')
sub('''//       italics» over them (Ruth 3:12 word 5 is the case named)
//''', '''//       italics» over them (Ruth 3:12 word 5 is the case named)
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
//       same letters (II. «gloss»); STEP's number is I.»
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
//   P15 the language: where a number's records include ones the forms name
//       as of the other language (ol), the unabridged row says how many and
//       the language STEP's row at this word says (else STEP's lexicon),
//       and those records do not stand among the ones shown first; where a
//       number stands on one record only and it is of the other language, the
//       row says it is not said to cite this word
//''')
sub('''// the kinds the projection draws a citation's words from: the card must read the citations by the same list
import { OPENING_KINDS } from "./place-answers-page-v1.mjs";
''', '')

# P6's citations: the kinds the chapter file gives each run
sub('''// THE RECORD'S ITALICS AT A CITATION: a run the entries file classes as the entry's meaning or as the words its unit
// opens with is printed inside «», the rest plain (each once), as the record's italics. The kinds are read here from
// the record's own file on disk, the unit found by its place, each run of the citation met in the unit's order.
const recordFiles = new Map();
const recordOf = (id) => { const f = `${String(Math.floor(Number(id.slice(3)) / ((JSON.parse(readFileSync(join(PAGE_FILES, "index.json"), "utf8")).filed || {}).unabridged_records_a_file || 50))).padStart(3, "0")}.json.gz`; if (!recordFiles.has(f)) recordFiles.set(f, JSON.parse(gunzipSync(readFileSync(join(PAGE_FILES, "entries", "u", f))).toString("utf8"))); return recordFiles.get(f).entries[id]; };
const citedWords = (b) => {
  const e = recordOf(b[0]); const blk = e && e.blocks[b[1]]; const top = blk ? (b[2] < 0 ? blk.head : blk.points[b[2]]) : null; const unit = top ? (b[3] < 0 ? top : (top.sub || [])[b[3]]) : null;
  const its = (unit && unit.italics) || []; let k = 0;
  const runs = b[6].map((t) => { while (k < its.length && !(its[k].t === t && OPENING_KINDS.includes(its[k].kind))) k += 1; return k < its.length ? [t, its[k++].kind] : [t, null]; });
  const meant''', '''// THE RECORD'S ITALICS AT A CITATION: a run the chapter file classes as the entry's meaning or as the words its unit
// opens with is printed inside «», the rest plain (each once), as the record's italics. Each run of a citation comes
// with its kind in the file ([words, kind]); tools/check-place-answers-page-v1.mjs G6 holds the kinds to the record.
const citedWords = (b) => {
  const runs = b[6];
  const meant''')

# P8: a citation's stem and labels, and a record's language, planted; no say, no why
sub('''// ---- P8: what the data says, the card says -------------------------------------------------------------------------
// A citation's label (its stem, point and letter), a row's sentences under a number (a tag's line's say) and a
// record's sentence (a form's or a line's why) are the data's: planted in a copy of the files, read through a second
// card made with a fetch that serves the copy, each must print as planted, and the card's own count of records must
// give way to the row's sentences.
{
  const PLANT = { label: "Planted-stem 1.", say: "PLANTED: a sentence of the row.", whyForm: "PLANTED: this word's sentence of the record.", whyLine: "PLANTED: the number's sentence of the record." };''', '''// ---- P8: what the data says, the card says -------------------------------------------------------------------------
// A citation's stem and its point's labels, and a record's language, are the data's: planted in a copy of the files,
// read through a second card made with a fetch that serves the copy, each must print as planted. The card reads no
// name that no data writes: nothing else is planted, and nothing else is looked for.
{
  const PLANT = { stem: "Plantedstem", point: "7.", sub: "z", language: "PLANTED TONGUE", said: "Planted Tongue" };''')
sub('''      planted = { book: b.book, n, label: v.l, i: e.i, tag, tf, record: cite[0], other: line.b.unabridged_bdb_1906[1] === cite[0] ? line.b.unabridged_bdb_1906[2] : line.b.unabridged_bdb_1906[1] };
      cite[4] = PLANT.label; cite[5] = "";
      f.why = { [planted.record]: PLANT.whyForm };
      line.say = { unabridged_bdb_1906: [PLANT.say] }; line.why = { [planted.other]: [PLANT.whyLine] };
      planted.chapter = mine; planted.tags = T;''', '''      if (!(line.own || {})[cite[0]] || !T.unabridged[cite[0]]) continue;
      planted = { book: b.book, n, label: v.l, i: e.i, tag, tf, record: cite[0] };
      // the line under a stem at a point and a sub-point of it, not in the stem's own head, its label not naming another stem
      cite[4] = PLANT.point; cite[5] = PLANT.sub; cite[10] = PLANT.stem; cite[12] = 0; if (cite.length > 13) cite[13] = 0;
      T.unabridged[cite[0]].language = PLANT.language;
      planted.chapter = mine; planted.tags = T;''')
sub('''    const text = body.textContent;
    const rowB = body.all((x) => x.is("row") && x.all((y) => y.tagName === "b")[0]?.textContent === "Brown-Driver-Briggs, unabridged");
    const inDicts = rowB.find((r) => r.all((x) => x.is("sub")).some((s) => s.textContent === PLANT.say));
    const missing = [];
    if (!text.includes(`${PLANT.label} `)) missing.push("the citation's label");
    if (!inDicts) missing.push("the row's sentence");
    if (inDicts && inDicts.all((x) => x.is("sub")).some((s) => /^This number stands on /u.test(s.textContent))) missing.push("the card's own count of records still stands beside the row's sentence");
    if (!text.includes(PLANT.whyForm)) missing.push("the word's sentence of a record");
    if (!text.includes(PLANT.whyLine)) missing.push("the number's sentence of a record");
    check("P8  what the data says, the card says: a citation's label, a row's sentences and a record's sentence planted in a copy of the files each print as planted, and the row's sentences stand in place of the card's own", missing.length === 0 && said.length === 0,
      missing.length ? `${planted.book} ${planted.label} entry ${planted.i}: not as planted: ${missing.join("; ")}` : said.length ? first(said) : `planted at ${planted.book} ${planted.label} entry ${planted.i}, under ${planted.tag} (records ${planted.record} and ${planted.other})`);''', '''    const rowB = body.all((x) => x.is("row") && x.all((y) => y.tagName === "b")[0]?.textContent === "Brown-Driver-Briggs, unabridged");
    const lines = rowB.flatMap((r) => r.all((x) => x.is("line")));
    const missing = [];
    if (!lines.some((l) => (l.children[1] || { textContent: "" }).textContent === `${PLANT.stem} ${PLANT.point} ${PLANT.sub} `)) missing.push("the citation's stem and labels");
    // the record's one line under «In the dictionaries», where the number stands on several records
    const oneLine = lines.find((l) => { const kids = l.parent.children; const btn = kids[kids.indexOf(l) + 1]; return btn && btn.dataset.id === planted.record; });
    if (!oneLine || !oneLine.textContent.endsWith(`(${PLANT.said})`)) missing.push("the record's language");
    check("P8  what the data says, the card says: a citation's stem and its point's labels, and a record's language, planted in a copy of the files, each print as planted", missing.length === 0 && said.length === 0,
      missing.length ? `${planted.book} ${planted.label} entry ${planted.i}: not as planted: ${missing.join("; ")}` : said.length ? first(said) : `planted at ${planted.book} ${planted.label} entry ${planted.i}, under ${planted.tag} (record ${planted.record})`);''')
open(p, "w", encoding="utf-8").write(s)
