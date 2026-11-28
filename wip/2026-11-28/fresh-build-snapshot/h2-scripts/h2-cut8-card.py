import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
def sub(old, new):
    global s
    assert s.count(old) == 1, (old[:80], s.count(old)); s = s.replace(old, new)

# 1. the say/why hooks go, with their comment; what the data says stays said by the data
sub('''  // WHAT THE DATA SAYS, THE CARD SAYS (27 November 2026). A record's language, the label of the point a verse is
  // cited under (its stem, its number, its letter), and the sentences of ours about a number's records are the
  // data's, never a word typed here:
  //   a record's language   the record's own line («BIBLICAL ARAMAIC»), in the card's letter case
  //   a citation's label    the labels the chapter file gives the citation (h.b: its fifth and sixth places), as
  //                         given; «the opening» only where it gives none
  //   a row's sentences     a tag's line may carry say: { <dictionary>: [sentence, …] }: printed at the head of
  //                         that dictionary's row under the number, in place of the card's own count of records
  //   a record's sentence   a word's form, or a tag's line, may carry why: { <entry id>: sentence or [sentence, …] }:
  //                         printed under that entry's one line; the form's, which is this word's, before the line's
  // Until the projection writes say and why, the card says what it said before, from the data's counts.
  const languageOf = (rec) => String((rec && rec.language) || "").toLowerCase().replace(/\\b\\p{L}/gu, (c) => c.toUpperCase());
  const labelsOf = (b) => b.slice(4, 6).filter((x) => typeof x === "string" && x);
  const sentences = (x) => (Array.isArray(x) ? x : typeof x === "string" ? [x] : []).filter((s) => typeof s === "string" && s);
''', '''  // WHAT THE DATA SAYS, THE CARD SAYS (27 November 2026). A record's language is the record's own line («BIBLICAL
  // ARAMAIC»), in the card's letter case; where a verse is cited in a record (its stem, its point's labels) is what the
  // chapter file gives the citation (h.b, read by unabridgedWhere alone); never a word typed here.
  const languageOf = (rec) => String((rec && rec.language) || "").toLowerCase().replace(/\\b\\p{L}/gu, (c) => c.toUpperCase());
''')

sub('''  // it is. runs: [{ t, kind }], in the record's order; most: how many plain runs to print before saying how many.
  const SAID_AS_MEANING = ["main_gloss", "opening"];
  // the kinds the page's files draw a citation's words from (OPENING_KINDS, tools/place-answers-page-v1.mjs);
  // tools/check-place-card-one-place-v1.mjs P6 reads the citations by that list and holds the card to it
  const CITED_KINDS = ["opening", "tagged_gloss", "main_gloss"];
''', '''  // it is. runs: [{ t, kind }], in the record's order; most: how many plain runs to print before saying how many. A
  // citation's runs come with their kinds in the chapter file (h.b: its seventh place, [words, kind] each), so the card
  // fetches no record to say them.
  const SAID_AS_MEANING = ["main_gloss", "opening"];
''')

sub('''  /** A unit of an unabridged record (a paragraph's head, a point, or a sub-point of either), by its place. */
  const unitOf = (e, bi, pi, si) => { const blk = (e.blocks || [])[bi]; if (!blk) return null; const u = pi < 0 ? blk.head : (blk.points || [])[pi]; return !u ? null : si < 0 ? u : (u.sub || [])[si] || null; };
''', '')

# 2. the unabridged lines at this word: where each stands, its marks, and the sentences the marks call for
sub('''  /** What each source says at this very word: one row a source, in a fixed order; a source with no answer is not drawn. */
  const drawHere = (f, body, alive, later) => {''', '''  /** Where an unabridged line stands in its record, from the line's stem fields (b[10] the stem as the record names it,
   *  b[12] 1 in the stem's own head, b[13] 1 where the point's label names another stem): the stem with its point, or
   *  the stem's own head before its numbered senses; the point's labels as the file gives them (b[4], b[5]). */
  const unabridgedWhere = (b) => {
    const label = [b[4], b[5]].filter(Boolean).join(" ");
    if (b[12]) return `${b[10]}, before its numbered senses`;
    if (!b[10]) return label || "the opening";
    if (b[13]) return `${b[10]}, at a point the file labels «${label}»`;
    return label.startsWith(b[10]) ? label : `${b[10]} ${label || "(its opening)"}`;
  };
  /** The unabridged BDB's «cites this verse» lines at one form. A line BDB's quoted form does not give to one of the
   *  words that carry the number (b[14]: how many words of the verse carry it) is marked †, and the card says so once.
   *  A line of a paragraph BDB numbers otherwise than STEP's number (b[15]: {another, gloss, entry}, BDB's numeral and
   *  gloss for the paragraph and the entry's numeral) is marked ‡, and the card says so once for each such paragraph. */
  const drawUnabridgedHere = (h, body) => {
    if (!h.b) return;
    const row = el("div", "row", srcHead("unabridged_bdb_1906", "cites this verse"));
    for (const b of h.b) row.append(el("p", "line", he(b[7]), " ", el("span", "gap", `${unabridgedWhere(b)} `), ...italicsSaid(b[6].map(([t, kind]) => ({ t, kind }))), b[14] ? el("span", "gap", " †") : "", b[15] ? el("span", "gap", " ‡") : ""));
    const many = Math.max(...h.b.map((b) => b[8]));
    if (many > 1) row.append(el("p", "sub", `STEP's number for this word stands on ${many} records of this file. Only a record whose own headword is this word's is shown here.`));
    if (h.b.some((b) => b[13])) row.append(el("p", "sub", "Where a point's label names another stem, the file has written a cross-reference into the label; the line names the stem the record's own headings put the verse under."));
    const times = Math.max(0, ...h.b.map((b) => b[14] || 0));
    if (times) row.append(el("p", "sub", `† BDB cites this verse; this number stands ${times} times in it, and BDB does not say which word it means.`));
    const numbered = new Set(); for (const b of h.b) if (b[15]) { const g = b[15].gloss.length ? ` «${b[15].gloss.map(tidy).join(", ")}»` : ""; numbered.add(`‡ BDB files this verse under another word of the same letters (${b[15].another}.${g}); STEP's number is ${b[15].entry}.`); }
    for (const s of numbered) row.append(el("p", "sub", s));
    body.append(row);
  };
  /** At a word written one way and read another, the unabridged lines that stand under both forms, said once. */
  const pairSentence = (e, here) => {
    if (e.k !== 1 || e.f.length !== 2) return;
    const key = (b) => JSON.stringify(b.slice(0, 13)); const first = new Set(((e.f[0].h || {}).b || []).map(key));
    const both = ((e.f[1].h || {}).b || []).filter((b) => first.has(key(b))).length;
    if (both) here.append(el("p", "form-h", `${both === 1 ? "One line" : `${both} lines`} of the unabridged Brown-Driver-Briggs stand${both === 1 ? "s" : ""} under both forms: STEP's grammar does not give the two forms different stems there, so nothing in the files tells which form the record means.`));
  };
  /** What the card says of the records a number stands on: how many are this word's, and how many are set behind for their language. */
  const unabridgedSays = (ids0, first, other, tongue, said, citesFirst) => {
    const set = ids0.filter((id) => other.has(id)).length;
    const lang = set ? ` ${set === 1 ? "One is a" : `${set} are`} Biblical ${tongue[1]} record${set === 1 ? "" : "s"}; ${said} this word is ${tongue[0]}.` : "";
    const head = `This number stands on ${ids0.length} records of this file.`;
    if (first.length === 1) return `${head}${lang} One has this word's own headword${set ? " in its language" : ""}.`;
    if (first.length) return `${head}${lang} ${first.length} of them have this word's own headword${set ? " in its language" : ""}, and nothing in the files says which is meant.${citesFirst ? " The record that cites this verse stands first." : ""}`;
    return `${head}${lang} None has this word's own headword${set ? " in its language" : ""}.`;
  };

  /** What each source says at this very word: one row a source, in a fixed order; a source with no answer is not drawn. */
  const drawHere = (f, body) => {''')

sub('''    if (h.b) {
      const row = el("div", "row", srcHead("unabridged_bdb_1906", "cites this verse"));
      // the words of the cited unit are the record's italics: how each is said waits on its kind, which the record
      // itself holds (its file is fetched; the line says its headword and label at once)
      for (const b of h.b) {
        const words = el("span", "");
        row.append(el("p", "line", he(b[7]), " ", el("span", "gap", `${labelsOf(b).join(" ") || "the opening"} `), words));
        if (b[6].length) later.push(getFile(unFile(b[0])).then((U) => {
          if (!alive()) return;
          const u = unitOf((U.entries || {})[b[0]] || {}, b[1], b[2], b[3]); const its = (u && u.italics) || [];
          // each of the citation's runs is the unit's run of the same words among the kinds a citation's words are
          // drawn from, met in the unit's order (a run of the same words and another kind is not it)
          let k = 0; const runs = b[6].map((t) => { while (k < its.length && !(its[k].t === t && CITED_KINDS.includes(its[k].kind))) k += 1; return k < its.length ? { t, kind: its[k++].kind } : { t, kind: null }; });
          words.replaceChildren(...italicsSaid(runs));
        }, (err) => { if (alive()) words.replaceChildren(el("span", "gap", "(the record could not be fetched)")); fault(err.message); }));
      }
      const many = Math.max(...h.b.map((b) => b[8]));
      if (many > 1) row.append(el("p", "sub", `STEP's number for this word stands on ${many} records of this file. Only a record whose own headword is this word's is shown here.`));
      body.append(row);
    }
  };''', '''    drawUnabridgedHere(h, body);
  };''')

# 3. the record whole: a stem heading inside running text starts a unit of its own
sub('''      let unit = el("div", "unit"); if (cited.has(`${bi}|-1|-1`)) { unit.classList.add("cited"); unit.append(el("span", "cited-note", "cites this verse")); }''',
'''      // a stem heading inside running text starts a unit of its own (the stem's head); a heading that labels a point makes that point the stem's head too
      const also = new Map(); (blk.stems || []).forEach((h, x) => { if (h.point === undefined) starts.set(h.k, ["stem", `${bi}|s${x}`]); else also.set(`${bi}|${h.point}|-1`, `${bi}|s${x}`); });
      const isCited = (key) => cited.has(key) || (also.has(key) && cited.has(also.get(key)));
      let unit = el("div", "unit"); if (isCited(`${bi}|-1|-1`)) { unit.classList.add("cited"); unit.append(el("span", "cited-note", "cites this verse")); }''')
sub('''        if (starts.has(i)) { const [cls, key] = starts.get(i); unit = el("div", `unit ${cls}`); if (cited.has(key)) {''',
'''        if (starts.has(i)) { const [cls, key] = starts.get(i); unit = el(cls === "stem" ? "span" : "div", `unit ${cls}`); if (isCited(key)) {''')

# 4. the dictionaries: the citation's key names the stem's head; the records' sentences are the card's, from the data's counts
sub('''citedB.get(b[0]).add(`${b[1]}|${b[2]}|${b[3]}`); }''', '''citedB.get(b[0]).add(b[12] ? `${b[1]}|s${b[11]}` : `${b[1]}|${b[2]}|${b[3]}`); }''')
sub('''      // the row's sentences of ours: the data's where the tag's line carries them (say), else the card's own, from the counts
      const dataSays = sentences((line.say || {})[key]);
      for (const s of dataSays) row.append(el("p", "sub", s));
      const say = (words) => { if (!dataSays.length) row.append(el("p", "sub", words)); };
      // a sentence of ours about one entry: this word's (a form's why), else the number's (the line's why)
      const whyOf = (id) => { for (const f of forms) { const w = sentences((f.why || {})[id]); if (w.length) return w; } return sentences((line.why || {})[id]); };
''', '')
sub('''      if (isB) {
        // The unabridged file lists a number on several records, and a record can be another word's. A record is this
        // word's where its own headword has the letters of the word's dictionary form (the data names them: own, and
        // on the word, ow). Those stand; the others wait behind one line.
        const own = new Set([...Object.keys(line.own || {}), ...ids0.filter((id) => byMacula.has(id))]);
        if (several) {
          behind = ids.filter((id) => !own.has(id)); ids = ids.filter((id) => own.has(id));
          say(ids.length === 1 ? `This number stands on ${ids0.length} records of this file. One has this word's own headword.` : ids.length ? `This number stands on ${ids0.length} records of this file. ${ids.length} of them have this word's own headword, and nothing in the files says which is meant.${ids.some(cites) ? " The record that cites this verse stands first." : ""}` : `This number stands on ${ids0.length} records of this file. None has this word's own headword.`);
        } else if (!own.has(ids0[0])) say("This record's headword is spelled otherwise than this word's dictionary form, so it is not said to cite this word.");
      } else if (several) say(`This number reaches ${ids.length} records of this dictionary; nothing in the files says which is meant.${ids.some(cites) ? " The record that cites this place stands first." : ""}`);''',
'''      let numeralOther = new Set(), numeralHere = null;
      if (isB) {
        // The unabridged file lists a number on several records, and a record can be another word's. A record is this word's
        // where its own headword has the letters of the word's dictionary form (own; on the word, ow), where it is of the
        // word's language (the forms name the records of the other: ol; the word's language is what STEP's row at this word
        // says, t.lg, else what STEP's lexicon says, lg), and where BDB does not number it as another word of the same
        // letters (on; the entry's numeral: nm). Those stand; the others wait behind one line.
        const other = new Set(forms.flatMap((f) => f.ol || []).filter((id) => ids0.includes(id)));
        const rowLg = forms.map((f) => (f.t || {}).lg).find(Boolean); const lg = rowLg || line.lg || null;
        const said = rowLg ? "STEP's row at this word says" : "STEP's lexicon says"; const tongue = lg === "a" ? ["Aramaic", "Hebrew"] : ["Hebrew", "Aramaic"];
        numeralOther = new Set((line.on || []).filter((id) => ids0.includes(id) && !other.has(id))); numeralHere = line.nm || null;
        const own = new Set([...Object.keys(line.own || {}), ...ids0.filter((id) => byMacula.has(id))].filter((id) => !other.has(id) && !numeralOther.has(id)));
        if (several) {
          behind = ids.filter((id) => !own.has(id)); ids = ids.filter((id) => own.has(id));
          const n = numeralOther.size;
          row.append(el("p", "sub", unabridgedSays(ids0, ids, other, tongue, said, ids.some(cites)) + (n ? ` ${n === 1 ? "One" : n} BDB numbers as another word of the same letters, and ${n === 1 ? "it waits" : "they wait"} behind.` : "")));
        } else if (other.has(ids0[0])) row.append(el("p", "sub", `This record is a Biblical ${tongue[1]} record, and ${said} this word is ${tongue[0]}, so it is not said to cite this word.`));
        else if (numeralOther.has(ids0[0])) row.append(el("p", "sub", "BDB numbers this record another word of the same letters, so it is not said to cite this word."));
        else if (!own.has(ids0[0])) row.append(el("p", "sub", "This record's headword is spelled otherwise than this word's dictionary form, so it is not said to cite this word."));
      } else if (several) row.append(el("p", "sub", `This number reaches ${ids.length} records of this dictionary; nothing in the files says which is meant.${ids.some(cites) ? " The record that cites this place stands first." : ""}`));''')
sub('''          for (const s of whyOf(id)) holder.append(el("p", "sub", s));
''', '''          if (isB && numeralOther.has(id)) holder.append(el("p", "sub", `BDB numbers this another word of the same letters (${[numeralHere, F.unabridged[id].head.numeral].filter(Boolean).map((x) => `${x}.`).join(", ")})`));
''')

# 5. the card's body: no record waited on at this word; the pair's sentence once
sub('''    const here = el("div", ""); body.append(here); let drawn = 0; const later = [];''', '''    const here = el("div", ""); body.append(here); let drawn = 0;''')
sub('''      const before = here.childElementCount; drawHere(f, here, alive, later); drawn += here.childElementCount - before;
    }
    // what each source says here stands whole once every record it waits on has landed (data-ready)
    if (later.length) { here.dataset.ready = "0"; Promise.allSettled(later).then(() => { here.dataset.ready = "1"; }); } else here.dataset.ready = "1";
    if (!drawn)''', '''      const before = here.childElementCount; drawHere(f, here); drawn += here.childElementCount - before;
    }
    // what each source says here is drawn whole at once from the chapter's file: nothing at this word waits on a record
    here.dataset.ready = "1";
    pairSentence(e, here);
    if (!drawn)''')

# 6. the look of a stem's head inside running text
sub('''    [".unit", "margin: 0.25rem 0;"],''', '''    [".unit", "margin: 0.25rem 0;"],
    [".unit.stem", "display: inline; margin: 0;"],''')
open(p, "w", encoding="utf-8").write(s)
