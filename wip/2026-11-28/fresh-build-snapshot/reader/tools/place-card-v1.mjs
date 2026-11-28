// Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
// LEDGER: -
// no frame letter. The code that draws the body of the place card, said
// once. It reads nothing by itself and writes nothing; a page runs it.
//
// WHY THIS IS A FILE. Two pages open the place card: the live reader
// (reader/zone.html), on a book that has place answers, and the trial page
// (reader/place.html). The card says what each source says at this very
// word, by that source's own address, and then each dictionary's own entry
// under the number STEP gives the word. Its words, their order, the credits
// and the notes must be the same on both pages, drawn from the same files
// (data/place-answers-v1/page/, projected by
// tools/project-place-answers-page-v1.mjs and held by
// tools/check-place-answers-page-v1.mjs). So the drawing lives here and
// both pages carry it.
//
// ONE RULE, ONE PLACE. Each page carries the lines from the one that opens
// "const placeCardOf = (host) => {" to the line "// end of the place card
// (tools/place-card-v1.mjs)", as they stand below but for "export" and the
// page's own indent, and tools/check-place-card-one-place-v1.mjs lifts the
// three copies out, holds them line for line, and runs the block on its
// own over a chapter's file. So nothing between those two lines reaches
// outside them: the block uses the browser's own names (document, fetch,
// Response, DecompressionStream) and what the page hands it, and no name of
// the page that carries it.
//
// WHAT A PAGE HANDS IT (host):
//   data    the address of data/place-answers-v1/page/, with its closing
//           slash, as the page reaches it
//   fault   a function given one sentence when a file could not be fetched
//
// WHAT IT GIVES BACK:
//   index()            the page files' index (index.json), asked once
//   chapter(book, n)   a chapter's file, asked once
//   entryAt(doc, label, i)   the verse and the word of a chapter's file at
//                      a verse's label and the word's place among the
//                      verse's entries (marks counted), or null
//   draw(body, doc, verse, entry, alive)   the card's body for that word,
//                      drawn into `body`: how the two editions meet at the
//                      word, «At this word», «In the dictionaries», the
//                      word's other parts, the credits. `alive()` answers
//                      whether the card this was drawn for still stands
//                      open; a file that lands after it shut draws nothing
//   kindWords(k)       a word's kind in words (written and read; written,
//                      not read; read, not written), by the file's number
//   credits()          the credits in full, one paragraph a source
//   style(scope)       the card body's own look, as style rules under the
//                      selector `scope` (the element `draw` draws into)
//   pillsAt(doc, ref, n, reading, a, b, t)   the pills of one cell of the
//                      live reader's card (THE PILLS, below): what each
//                      source reads on that part of the word by its own
//                      address, in the card's order, each with its address
//
// No Hebrew letter is typed here: every one arrives in the data. Nothing is
// matched by letters, and there is no list of readings to choose from.

export const placeCardOf = (host) => {
  const DATA = String(host.data);
  const fault = (words) => { if (typeof host.fault === "function") host.fault(String(words)); };
  /** An element with a class and text or children. */
  const el = (tag, cls, ...kids) => { const n = document.createElement(tag); if (cls) n.className = cls; for (const k of kids) if (k !== null && k !== undefined && k !== "") n.append(k); return n; };
  /** A file of the page's data: plain JSON, or the gzip of JSON (.json.gz), fetched once. A fetch that failed is let go, so the next asking asks again. */
  const fetched = new Map();
  const getFile = (rel) => {
    if (!fetched.has(rel)) fetched.set(rel, (async () => {
      const r = await fetch(DATA + rel); if (!r.ok) throw new Error(`${rel}: ${r.status}`);
      if (!rel.endsWith(".gz")) return r.json();
      return new Response(r.body.pipeThrough(new DecompressionStream("gzip"))).json();
    })().catch((err) => { fetched.delete(rel); throw err; }));
    return fetched.get(rel);
  };
  let INDEX = null;
  let FILED = { tags_a_file: 50, unabridged_records_a_file: 50 };
  const index = () => getFile("index.json").then((ix) => { INDEX = ix; FILED = ix.filed || FILED; return ix; });
  const chapter = (book, n) => index().then(() => getFile(`${book}/${n}.json.gz`));
  const entryAt = (doc, label, i) => { const v = ((doc && doc.verses) || []).find((x) => x.l === label); const e = v ? v.e.find((x) => x.m === undefined && x.i === i) : null; return e ? { v, e } : null; };
  /** For printing only: a source file's own character references resolved (the data keeps them as the file
   *  writes them, so that every string is the file's). The unabridged BDB's file writes a backslash before
   *  the wide space that indents a lettered point; the two are a blank here. */
  const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", emsp: "\u2003", nbsp: "\u00a0" };
  const printable = (s) => String(s).replace(/\\?&(#x[0-9A-Fa-f]+|#[0-9]+|amp|lt|gt|quot|apos|emsp|nbsp);/g, (all, r) => (r[0] === "#" ? String.fromCodePoint(r[1] === "x" ? parseInt(r.slice(2), 16) : parseInt(r.slice(1), 10)) : NAMED[r]));
  const tidy = (s) => printable(s).replace(/\s+/g, " ").trim();
  const he = (s) => el("span", "he", s);
  const rd = (s) => el("span", "rd", s);
  const lic = (s) => el("span", "lic", s);
  const pad3 = (n) => String(n).padStart(3, "0");
  const tagFile = (tag) => `entries/t/${pad3(Math.floor(Number(tag.slice(1, 5)) / FILED.tags_a_file))}.json.gz`;
  const unFile = (id) => `entries/u/${pad3(Math.floor(Number(id.slice(3)) / FILED.unabridged_records_a_file))}.json.gz`;
  const stepsOwn = (tag) => /^H9\d\d\d$/.test(tag);
  /** The number in a tag as STEP writes it (a written form's tag can come with its brackets and a blank). */
  const numberOf = (tag) => (/H\d{4}[A-Za-z]?/.exec(tag || "") || [null])[0];
  // WHAT THE DATA SAYS, THE CARD SAYS (27 November 2026). A record's language is the record's own line («BIBLICAL
  // ARAMAIC»), in the card's letter case; where a verse is cited in a record (its stem, its point's labels) is what the
  // chapter file gives the citation (h.b, read by unabridgedWhere alone); never a word typed here.
  const languageOf = (rec) => String((rec && rec.language) || "").toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  // THE RECORD'S ITALICS, SAID ONE WAY WHEREVER THE CARD PRINTS THEM (the audit of 27 November 2026, section 7: «Special
  // uses:», «see, further», «phrases:», «note here» printed inside «» as if they were meanings). The unabridged BDB sets
  // a meaning in italics, and also a grammar word, a heading, a cross-reference. Only a run the entries file classes as
  // the entry's meaning (main_gloss) or as the words a unit opens with (opening) is printed as a meaning, inside «»;
  // any other run is printed plain, as the record's italics, after «in italics in the record:», with no claim of what
  // it is. runs: [{ t, kind }], in the record's order; most: how many plain runs to print before saying how many. A
  // citation's runs come with their kinds in the chapter file (h.b: its seventh place, [words, kind] each), so the card
  // fetches no record to say them.
  const SAID_AS_MEANING = ["main_gloss", "opening"];
  const italicsSaid = (runs, most = Infinity) => {
    const meant = runs.filter((x) => SAID_AS_MEANING.includes(x.kind)).map((x) => tidy(x.t)).filter(Boolean);
    const plain = [...new Set(runs.filter((x) => !SAID_AS_MEANING.includes(x.kind)).map((x) => tidy(x.t)).filter(Boolean))];
    const out = [];
    if (meant.length) out.push(rd(meant.map((x) => `«${x}»`).join(", ")));
    if (plain.length) {
      out.push(el("span", "gap", `${meant.length ? " · " : ""}in italics in the record: `));
      plain.slice(0, most).forEach((x, i) => { if (i) out.push(el("span", "gap", " · ")); out.push(el("span", "it", x)); });
      if (plain.length > most) out.push(el("span", "gap", ` … (${plain.length})`));
    }
    return out;
  };

  // what each source is called on the card, and its license (plain names; the credits in full say the rest)
  const SRC = {
    step: ["STEP Bible", "CC BY 4.0"],
    macula: ["MACULA Hebrew", "CC BY 4.0"],
    stepbible_tbesh_gloss: ["STEP Bible's brief lexicon", "CC BY 4.0"],
    openscriptures_strongs: ["Strong's dictionary", "Open Scriptures file, CC BY 4.0"],
    openscriptures_bdb_1906: ["Brown-Driver-Briggs, the Open Scriptures file", "CC BY 4.0"],
    unabridged_bdb_1906: ["Brown-Driver-Briggs, unabridged", "public domain"],
    ubs_sdbh_hebrew_v0_9_2: ["UBS Dictionary of Biblical Hebrew", "CC BY-SA 4.0"],
    openscriptures_lexical_index: ["Lexical Index", "Open Scriptures, CC BY 4.0"],
    unfoldingword_uhal: ["unfoldingWord Hebrew and Aramaic Lexicon", "CC BY-SA 4.0"],
  };
  const srcHead = (key, extra) => { const d = el("div", "src", el("b", "", SRC[key][0]), lic(SRC[key][1])); if (extra) d.append(el("span", "", extra)); return d; };
  // how a number reaches an entry, in plain words, by the letter the data gives
  const REACHED = { N: "found by the number alone", L: "found by the number and its letter", T: "filed under STEP's own number", E: "found by the number and the letter that STEP's list and the Lexical Index both give", S: "several lines of the index name this one entry" };
  const ABSENT = { 0: "This dictionary has no entry under this number.", B: "The index names no entry of Brown-Driver-Briggs for this number.", P: "This is STEP's own number; no dictionary is filed under it.", W: "This dictionary files one entry under this number, and by its own reference to Brown-Driver-Briggs that entry is another word of the number than the one STEP's letter names." };
  const KIND_WORDS = ["", "written and read", "written, not read", "read, not written"];
  const kindWords = (k) => KIND_WORDS[k] || "";

  /** The line of a row: a list of pieces joined by a plus sign. */
  const joinPlus = (nodes) => { const out = []; nodes.forEach((n, i) => { if (i) out.push(el("span", "plus", "+")); out.push(n); }); return out; };
  /** A row of a word's parts, in the record's order: the parts run right to left, as Hebrew does, so the part the
   *  record puts first stands furthest right (the live reader's law, parts-direction-rule-v1); each part reads its
   *  Hebrew and then its English, left to right inside it. */
  const partsLine = (parts) => { const p = el("p", "line part-row", ...joinPlus(parts.map((x) => { x.classList.add("part-of-row"); return x; }))); p.dir = "rtl"; return p; };

  /** Where an unabridged line stands in its record, from the line's stem fields (b[10] the stem as the record names it,
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
   *  gloss for the paragraph and the entry's numeral) is marked ‡, and the card says so once for each such paragraph, with the
   *  number the line stands under (b[9]) and the numeral BDB gives the entry that number reaches. */
  const drawUnabridgedHere = (h, body) => {
    if (!h.b) return;
    const row = el("div", "row", srcHead("unabridged_bdb_1906", "cites this verse"));
    for (const b of h.b) row.append(el("p", "line", he(b[7]), " ", el("span", "gap", `${unabridgedWhere(b)} `), ...italicsSaid(b[6].map(([t, kind]) => ({ t, kind }))), b[14] ? el("span", "gap", " †") : "", b[15] ? el("span", "gap", " ‡") : ""));
    const many = Math.max(...h.b.map((b) => b[8]));
    if (many > 1) row.append(el("p", "sub", `STEP's number for this word stands on ${many} records of this file. Only a record whose own headword is this word's is shown here.`));
    if (h.b.some((b) => b[13])) row.append(el("p", "sub", "Where a point's label names another stem, the file has written a cross-reference into the label; the line names the stem the record's own headings put the verse under."));
    const times = Math.max(0, ...h.b.map((b) => b[14] || 0));
    if (times) row.append(el("p", "sub", `† BDB cites this verse; this number stands ${times} times in it, and BDB does not say which word it means.`));
    const numbered = new Set(); for (const b of h.b) if (b[15]) { const g = b[15].gloss.length ? ` ${b[15].gloss.map((x) => `«${tidy(x)}»`).join(", ")}` : ""; numbered.add(`‡ BDB files this verse under another word of the same letters (${b[15].another}.${g}); STEP's number ${b[9]} is BDB's ${b[15].entry}.`); }
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
  const drawHere = (f, body) => {
    const t = f.t;
    if (t && t.p) {
      const row = el("div", "row", srcHead("step"));
      row.append(partsLine(t.p.map((p) => el("span", "", he(p[3]), " ", p[0] === null ? el("span", "gap", "(no English given)") : rd(p[0].trim())))));
      row.append(el("p", "sub", `STEP's own address: ${t.rows.join(" + ")}`));
      body.append(row);
    } else if (t && t.other) {
      const row = el("div", "row", srcHead("step", "another word stands here in its text"));
      row.append(partsLine(t.other.map((p) => el("span", "", he(p[0]), " ", p[1] === null ? "" : rd(p[1].trim())))), el("p", "sub", `STEP's own address: ${t.rows.join(" + ")}. Its reading is not laid on this word.`));
      body.append(row);
    }
    const m = f.m || f.mo;
    if (m) {
      // MACULA's plain English word is the reading; its wording of the part in this sentence stands smaller beside it where the two differ
      const dotted = (x) => x[0].replace(/\./g, " ");
      const row = el("div", "row", srcHead("macula", f.mo ? "another word stands here in its text" : ""));
      row.append(partsLine(m.map((x) => el("span", "", he(x[2]), " ", rd(x[1]), x[0] && dotted(x) !== x[1] ? el("small", "ctx", ` ${dotted(x)}`) : ""))));
      if (m.some((x) => x[0] && dotted(x) !== x[1])) row.append(el("p", "sub", "In small letters: MACULA's wording of the part in this sentence, where it differs from its plain English word."));
      body.append(row);
    }
    const h = f.h || {};
    if (h.u) {
      const very = h.u.filter((u) => u[1] < 2), verse = h.u.filter((u) => u[1] >= 2);
      const glosses = (u) => (u[2].length ? u[2].map((g) => `«${tidy(g)}»`).join(", ") : "(a sense with no gloss)");
      if (very.length) {
        const row = el("div", "row", srcHead("ubs_sdbh_hebrew_v0_9_2", "cites this very word"));
        // a sense under the entry STEP's number reaches is the word's own; one found by MACULA's dictionary form names the part it stands on
        for (const u of very) row.append(el("p", "line", u[1] === 1 ? he(u[3]) : "", u[1] === 1 ? " " : "", rd(glosses(u)), u[1] === 1 ? el("span", "gap", " *") : ""));
        if (very.some((u) => u[1] === 1)) row.append(el("p", "sub", "* STEP's number for this part reaches no entry of this dictionary; the entry is the one under MACULA's dictionary form of the part."));
        body.append(row);
      }
      if (verse.length) {
        const row = el("div", "row", srcHead("ubs_sdbh_hebrew_v0_9_2", "cites this verse"));
        for (const u of verse) row.append(el("p", "line", rd(glosses(u))));
        row.append(el("p", "sub", "The dictionary counts the words of a verse in its own way. Here its count does not land on this word, so this is said of the verse, under the same entry, and not of the word."));
        body.append(row);
      }
    }
    if (h.o) {
      const row = el("div", "row", srcHead("openscriptures_bdb_1906", "cites this verse"));
      for (const o of h.o) row.append(el("p", "line", o[2] ? el("span", "gap", `${o[2]} `) : "", rd(o[3].length ? o[3].map((d) => `«${tidy(d)}»`).join(", ") : "(no meaning is marked in this sense)")));
      body.append(row);
    }
    drawUnabridgedHere(h, body);
  };

  // ---- each dictionary's entry, in the dictionary's own structure
  /** A stretch of text with marked runs: marks are [offset, length, how to wrap]. */
  const marked = (text, from, to, marks) => {
    const out = []; let at = from;
    for (const [a, n, wrap] of marks.filter((m) => m[0] >= from && m[0] + m[1] <= to).sort((x, y) => x[0] - y[0])) { if (a < at) continue; if (a > at) out.push(printable(text.slice(at, a))); out.push(wrap(printable(text.slice(a, a + n)))); at = a + n; }
    if (at < to) out.push(printable(text.slice(at, to)));
    return out;
  };
  const kv = (k, ...v) => el("p", "", el("span", "k", k), ...v);

  const DRAW = {
    stepbible_tbesh_gloss: {
      first: (e) => [he(e.Hebrew), " ", rd(`«${tidy(e.Gloss)}»`)],
      whole: (e) => [kv("STEP's number", e.uStrong), kv("Strong's number", e.eStrong), kv("word", he(e.Hebrew), ` ${e.Transliteration}`), kv("kind", e.Morph), kv("gloss", rd(tidy(e.Gloss))), e.relation ? kv("STEP's note", tidy(e.relation)) : null],
    },
    openscriptures_strongs: {
      // the row's one line is his meaning as he wrote it, the glosses the file tags drawn as on the opened entry; his list of
      // renderings (the Authorized Version's, in the order of the alphabet) stands in the opened entry
      first: (e) => {
        if (e.meaning) { const marks = (e.meaning.defs || []).map((d) => [d[0], d[1], (s) => el("span", "def", s)]); for (const w of e.meaning.words || []) marks.push([w.at, w.t.length, (s) => he(s)]); return marked(e.meaning.t, 0, e.meaning.t.length, marks); }
        if (e.source) return [el("span", "gap", "(he gives no meaning apart; his derivation:) "), printable(e.source.t)];
        return [el("span", "gap", "(he gives no meaning)")];
      },
      whole: (e) => {
        const out = [el("p", "", he(e.w.t), ` ${e.w.pron ? `(${e.w.pron}) ` : ""}${e.w.pos || ""}`)];
        const field = (name, f) => { if (!f) return; const marks = []; for (const d of f.defs || []) marks.push([d[0], d[1], (s) => el("span", "def", s)]); for (const w of f.words || []) marks.push([w.at, w.t.length, (s) => he(s)]); out.push(kv(name, ...marked(f.t, 0, f.t.length, marks))); };
        field("derivation", e.source); field("meaning", e.meaning);
        const u = e.usage;
        if (u) {
          const r = (u.renderings || []).filter((x) => !x.empty);
          out.push(kv("his list of renderings", `as he lists it${r.some((x) => x.sign) ? "; × marks a rendering from a Hebrew idiom, + one made with other words" : ""}`));
          const ol = el("ol", "rend");
          for (const x of r) {
            const li = el("li", "", x.sign ? el("span", "sign", x.sign) : "", tidy(x.t));
            if (x.lost_sign_trace && x.wikisource_sign) li.append(el("small", "", `this file lost a sign here; the Wikisource edition writes ${x.wikisource_sign}`));
            if (x.lost_sign_trace_inside && x.as_wikisource_writes_it) li.append(el("small", "", `a sign is lost inside; the Wikisource edition writes ${tidy(x.as_wikisource_writes_it)}`));
            if (x.unbalanced) li.append(el("small", "", "the file's brackets do not balance here; kept whole, as written"));
            ol.append(li);
          }
          out.push(ol);
          if (u.after_list) out.push(kv("after his list", tidy(u.after_list.t)));
        }
        for (const n of e.provider_notes || []) out.push(el("p", "how", `Open Scriptures' note: ${tidy(typeof n === "string" ? n : n.t)}`));
        return out;
      },
    },
    openscriptures_lexical_index: {
      first: (e) => [he(e.w), " ", e.def !== undefined ? rd(`«${tidy(e.def)}»`) : el("span", "gap", "(no gloss)")],
      whole: (e) => [kv("word", he(e.w), ` ${e.xlit || ""} ${e.pos || ""}`), e.def !== undefined ? kv("gloss", rd(tidy(e.def))) : null, kv("points to", [e.xref.bdb ? `Brown-Driver-Briggs ${e.xref.bdb}` : "", e.xref.strong ? `Strong's ${e.xref.strong}${e.xref.aug || ""}` : "", e.xref.twot ? `TWOT ${e.xref.twot}` : ""].filter(Boolean).join(" · "))],
    },
    openscriptures_bdb_1906: {
      first: (e) => {
        // the meanings the file marks, in its order, grouped by the sense each stands in: the first group is the line
        const seen = new Set(); const groups = [];
        for (const df of e.defs || []) { if (df.phrase) { if (seen.has(df.phrase.at)) continue; seen.add(df.phrase.at); } const key = df.sense ? df.sense.join(".") : ""; let g = groups[groups.length - 1]; if (!g || g.key !== key) { g = { key, d: [] }; groups.push(g); } g.d.push(tidy(df.phrase ? df.phrase.t : df.joined ? df.joined.whole : df.t)); }
        const w = (e.w || [])[0]; const more = groups.slice(1).reduce((a, g) => a + g.d.length, 0);
        return [w ? he(w.t) : "", " ", groups.length ? rd(groups[0].d.map((x) => `«${x}»`).join(", ")) : el("span", "gap", "(no meaning is marked in this entry)"), more ? el("span", "gap", ` … and ${more} more in its senses`) : ""];
      },
      whole: (e, cited) => {
        // the entry's running text, its senses in their own nesting; the meanings the file marks are drawn as glosses
        const marks = []; for (const d of e.defs || []) marks.push([d.at, d.t.length, (s) => el("span", "def", s)]); for (const w of e.w || []) marks.push([w.at, w.t.length, (s) => he(s)]);
        const text = e.text; const top = e.senses || []; const out = [];
        const run = (a, b) => el("span", "", ...marked(text, a, b, marks));
        out.push(el("p", "", run(0, top.length ? top[0].at : text.length)));
        const sense = (s, path) => {
          const kids = s.senses || []; const label = s.n !== undefined ? `${s.n}.` : ""; // a stem's name (Qal, Niph.) stands in the sense's own text
          const d = el("div", "sense", label ? el("span", "lab", label) : "", run(s.at, kids.length ? kids[0].at : s.at + s.len));
          if (cited.has(path.join("."))) { d.classList.add("cited"); d.append(el("span", "cited-note", "cites this verse")); }
          kids.forEach((k, i) => d.append(sense(k, [...path, i])));
          return d;
        };
        top.forEach((s, i) => out.push(sense(s, [i])));
        if (cited.has("")) out.push(el("p", "how", "This verse is cited in the entry outside its numbered senses."));
        out.push(el("p", "how", `${e.type === "root" ? "A root entry. " : ""}${e.status && e.status.p ? `Page ${e.status.p} of the lexicon. ` : ""}The file's own account: a work in progress; it marks the meanings and keeps the outline of the senses, not the whole of the printed entry.`));
        return out;
      },
    },
    ubs_sdbh_hebrew_v0_9_2: {
      // The dictionary's numbers sit on the whole entry, and an entry can hold several words of one spelling (its base forms).
      // The base form that holds a sense cited at this very word stands first; where none is, the base forms in the file's
      // order, said as such. `cited` is { very, verse }: the senses cited at this very word, and at the verse only.
      first: (e, cited) => {
        const forms = e.BaseForms || []; const gl = (m) => (((m.LEXSenses || [])[0] || {}).Glosses || []).map((g) => `«${tidy(g)}»`).join(", ") || "(no gloss)";
        const lead = forms.filter((b) => (b.LEXMeanings || []).some((m) => cited.very.has(m.LEXID)));
        const out = [he(e.Lemma), " "];
        if (lead.length) { lead.forEach((b, i) => { const ms = b.LEXMeanings || []; const hit = ms.filter((m) => cited.very.has(m.LEXID)); if (i) out.push(el("span", "gap", " | ")); out.push(rd(hit.map(gl).join(" | ")), ms.length > hit.length ? el("span", "gap", ` … (${ms.length} senses of this word)`) : ""); }); return out; }
        if (forms.length > 1) out.push(el("span", "gap", "no sense is cited at this very word; the words of this entry in the file's order: "));
        forms.forEach((b, i) => { const ms = b.LEXMeanings || []; if (i) out.push(el("span", "gap", " | ")); if (forms.length > 1) out.push(el("span", "gap", `${i + 1}. `)); out.push(rd(ms.length ? gl(ms[0]) : "(no sense)"), ms.length > 1 ? el("span", "gap", ` … (${ms.length} senses)`) : ""); });
        return out;
      },
      whole: (e, cited) => {
        const forms = e.BaseForms || []; const lead = forms.filter((b) => (b.LEXMeanings || []).some((m) => cited.very.has(m.LEXID)));
        const out = [el("p", "", he(e.Lemma), (e.StrongCodes || []).length ? ` · its numbers: ${e.StrongCodes.join(", ")}` : "")];
        const draw = (b) => {
          const nodes = [el("p", "", el("span", "k", forms.length > 1 ? `word ${forms.indexOf(b) + 1} of ${forms.length} under this entry` : "the word"), (b.PartsOfSpeech || []).join(", "))];
          for (const m of b.LEXMeanings || []) {
            const s = (m.LEXSenses || [])[0] || {}; const d = el("div", "sense", rd((s.Glosses || []).map((g) => `«${tidy(g)}»`).join(", ") || "(no gloss)"));
            if (cited.very.has(m.LEXID) || cited.verse.has(m.LEXID)) { d.classList.add("cited"); d.append(el("span", "cited-note", cited.very.has(m.LEXID) ? "cites this very word" : "cites this verse")); }
            if (s.DefinitionShort) d.append(el("p", "", tidy(s.DefinitionShort)));
            const facts = []; if ((m.LEXForms || []).length) facts.push(m.LEXForms.join(", ")); if ((m.LEXDomains || []).length) facts.push(`field: ${m.LEXDomains.map((x) => x.Domain).join(", ")}`); facts.push(`cited at ${m.verses_cited} ${m.verses_cited === 1 ? "place" : "places"}`);
            const fp = el("p", "how", facts.join(" · ")); if ((m.LEXCollocations || []).length) { fp.append(" · with "); m.LEXCollocations.forEach((c, i) => { if (i) fp.append(", "); fp.append(he(c)); }); } d.append(fp);
            if (s.Comments) d.append(el("p", "how", tidy(s.Comments)));
            nodes.push(d);
          }
          return nodes;
        };
        const rest = lead.length ? forms.filter((b) => !lead.includes(b)) : [];
        if (!lead.length && forms.length > 1) out.push(el("p", "how", "No sense of this entry is cited at this very word; its words stand in the file's order."));
        for (const b of lead.length ? lead : forms) out.push(...draw(b));
        if (rest.length) {
          const btn = el("button", "more-btn", `Other words under this entry: ${rest.length}`); btn.type = "button"; btn.setAttribute("aria-expanded", "false");
          const more = el("div", "more"); more.hidden = true; for (const b of rest) more.append(...draw(b));
          btn.addEventListener("click", () => { more.hidden = !more.hidden; btn.setAttribute("aria-expanded", String(!more.hidden)); });
          out.push(btn, more);
        }
        return out;
      },
    },
    unfoldingword_uhal: {
      first: (e) => { const g = []; for (const s of e.senses || []) for (const x of s.glosses || []) g.push(tidy(x.t)); return [he(e.headword.t), " ", g.length ? rd(g.slice(0, 6).map((x) => `«${x}»`).join(", ")) : el("span", "gap", "(no gloss)"), g.length > 6 ? el("span", "gap", ` … (${g.length})`) : ""]; },
      whole: (e) => [el("p", "", he(e.headword.t), ` ${e.part_of_speech ? tidy(e.part_of_speech.t) : ""}`), ...(e.senses || []).map((s) => el("div", "sense", el("span", "lab", `sense ${s.label}`), s.title ? `${tidy(s.title.t)} ` : "", rd((s.glosses || []).map((x) => `«${tidy(x.t)}»`).join(", ")), (s.citations || []).length ? el("p", "how", `cites ${s.citations.map((c) => tidy(c.t)).join("; ")}`) : ""))],
    },
  };

  /** One line for a record of the unabridged BDB, from the head a tag's file holds of it. The entry's meaning, or the
   *  words its opening opens with, where the file classes italic runs so. Else the italic runs the file does not
   *  class as a grammar word, a word of another language, a verse's wording, an abbreviation or an outline letter:
   *  the first two, printed as they stand and said as the record's italics, with no claim of what they are, and how
   *  many there are where there are more. Else what its head has in bold. */
  const NOT_SAID_AS_ITALICS = ["grammar_word", "other_language", "verse_wording", "abbreviation", "outline_letter"];
  const unabridgedFirst = (hd, several) => {
    const its = (hd.head.italics || []).filter((x) => tidy(x.t));
    const main = its.filter((x) => x.kind === "main_gloss"), open = its.filter((x) => x.kind === "opening");
    const plain = its.filter((x) => !SAID_AS_MEANING.includes(x.kind) && !NOT_SAID_AS_ITALICS.includes(x.kind));
    const said = main.length ? italicsSaid(main)
      : open.length ? italicsSaid(open)
      : plain.length ? italicsSaid(plain, 2)
      : (hd.head.bold || []).length ? [el("span", "gap", `(no meaning in italics; in bold: ${hd.head.bold.map((x) => tidy(x.t)).join(", ")})`)]
      : [el("span", "gap", "(its opening carries no meaning in italics)")];
    return [hd.head.headword ? he(hd.head.headword.t) : "", " ", ...said, several && languageOf(hd) ? el("span", "gap", ` (${languageOf(hd)})`) : ""];
  };
  const ITALIC_SAYS = { main_gloss: "the entry's meaning", tagged_gloss: "a meaning", opening: "the words this point opens with", rendering_of_hebrew: "the English of the Hebrew just quoted", verse_wording: "the English of the verse cited", grammar_word: "a grammar word", abbreviation: "an abbreviation", other_language: "a word of another language", outline_letter: "an outline letter", unclassed: "italic in the lexicon; the file does not tell what it is" };
  /** A record of the unabridged BDB whole: its paragraphs, each with its opening and its points in order. */
  const unabridgedWhole = (e, cited, own) => {
    const out = []; const kindOf = new Map();
    const note = (u) => { for (const it of u.italics || []) kindOf.set(it.k, it.kind); };
    e.blocks.forEach((blk, bi) => {
      const starts = new Map(); note(blk.head); (blk.head.sub || []).forEach((s, si) => { starts.set(s.k[0], ["sub", `${bi}|-1|${si}`]); note(s); });
      (blk.points || []).forEach((pt, pi) => { starts.set(pt.k[0], ["point", `${bi}|${pi}|-1`]); note(pt); (pt.sub || []).forEach((s, si) => { starts.set(s.k[0], ["sub", `${bi}|${pi}|${si}`]); note(s); }); });
      // a stem heading inside running text starts a unit of its own (the stem's head); a heading that labels a point makes that point the stem's head too
      const also = new Map(); (blk.stems || []).forEach((h, x) => { if (h.point === undefined) starts.set(h.k, ["stem", `${bi}|s${x}`]); else also.set(`${bi}|${h.point}|-1`, `${bi}|s${x}`); });
      const isCited = (key) => cited.has(key) || (also.has(key) && cited.has(also.get(key)));
      let unit = el("div", "unit"); if (isCited(`${bi}|-1|-1`)) { unit.classList.add("cited"); unit.append(el("span", "cited-note", "cites this verse")); }
      const para = el("div", ""); para.append(unit); let empty = true;
      for (let i = blk.k[0]; i < blk.k[1]; i += 1) {
        if (starts.has(i)) { const [cls, key] = starts.get(i); unit = el(cls === "stem" ? "span" : "div", `unit ${cls}`); if (isCited(key)) { unit.classList.add("cited"); unit.append(el("span", "cited-note", "cites this verse")); } para.append(unit); empty = true; }
        const p = e.k[i];
        if (typeof p === "string") { let s = printable(p).replace(/[\u2003\u00a0]/g, " "); if (empty) s = s.replace(/^\s+/, ""); if (s) { unit.append(s); empty = false; } continue; }
        const [what, text] = p;
        if (what === "<") { if (text === "<br>" && !empty) unit.append(el("br")); else if (/^<placeholder/.test(text)) { const g = el("span", "gap", "[…]"); g.title = "a word in another script, which this file leaves out"; unit.append(g); } continue; }
        empty = false;
        if (what === "bdbheb" || what === "bdbarc") unit.append(he(printable(text)));
        else if (what === "b") unit.append(el("b", "", printable(text)));
        else if (what === "highlight" || what === "highlightword") { const k = kindOf.get(i) || "unclassed"; const em = el("em", SAID_AS_MEANING.includes(k) ? "gl" : ["grammar_word", "abbreviation", "other_language", "outline_letter"].includes(k) ? "gr" : "", printable(text)); em.title = ITALIC_SAYS[k]; unit.append(em); }
        else if (what === "ref") unit.append(el("span", "ref", printable(text)));
        else if (what === "sup") unit.append(el("sup", "", printable(text)));
        else if (what === "sub") unit.append(el("sub", "", printable(text)));
        else if (what === "transliteration") unit.append(el("em", "gr", printable(text)));
        else unit.append(printable(text));
      }
      if (e.blocks.length > 1) out.push(el("p", "k", `paragraph ${bi + 1} of ${e.blocks.length}${own ? (own.includes(bi) ? " · this word's headword" : " · another headword") : ""}`));
      out.push(para);
    });
    out.push(el("p", "how", `${languageOf(e) || "The record names no language"}${e.strong && e.strong.length ? `. The file lists this record under the numbers ${e.strong.join(", ")}` : ""}. Italic words are the lexicon's own. Where the record's structure tells what an italic run is, it is drawn so: the entry's meaning, or the words a point opens with, in blue; a grammar word, an abbreviation or a word of another language in gray; any other italic as the record sets it.`));
    return out;
  };

  /** The dictionaries under one of STEP's numbers: each in the fixed order, one line, opening to the whole entry. */
  const drawEntries = async (tag, forms, body, alive) => {
    const box = el("div", ""); body.append(box);
    box.append(el("h3", "", "In the dictionaries"), el("p", "form-h", `STEP gives this word the number ${tag}. Each dictionary's own entry under that number:`));
    const wait = el("p", "form-h", "Opening the dictionaries…"); box.append(wait);
    let F; try { F = await getFile(tagFile(tag)); } catch (err) { wait.textContent = "The dictionaries could not be fetched."; fault(err.message); return; }
    if (!alive()) return; wait.remove();
    const line = F.tags[tag]; if (!line) { box.append(el("p", "form-h", "STEP writes this number only in its note on the form written. The dictionaries are listed here for the numbers of STEP's main text, so none is shown under it.")); box.dataset.ready = "1"; return; }
    // what cites this place, by entry, so that the sense can be marked when the entry is opened
    const citedO = new Map(), citedB = new Map(), citedU = new Map(); const byMacula = new Set();
    for (const f of forms) {
      const h = f.h || {}; for (const id of f.ow || []) byMacula.add(id);
      for (const o of h.o || []) { if (!citedO.has(o[0])) citedO.set(o[0], new Set()); citedO.get(o[0]).add(o[1] ? o[1].join(".") : ""); }
      for (const b of h.b || []) { if (!citedB.has(b[0])) citedB.set(b[0], new Set()); citedB.get(b[0]).add(b[12] ? `${b[1]}|s${b[11]}` : `${b[1]}|${b[2]}|${b[3]}`); }
      for (const u of h.u || []) { const id = `${u[0].slice(0, 6)}000000000`; if (!citedU.has(id)) citedU.set(id, { very: new Set(), verse: new Set() }); citedU.get(id)[u[1] < 2 ? "very" : "verse"].add(u[0]); }
    }
    for (const key of INDEX.dictionaries) {
      const [how, ...ids0] = line.b[key];
      // A DICTIONARY WHOSE ENTRY IS NOT ON HAND HERE HAS NO ROW (the audit of 27 November 2026, section 7): the data
      // says «absent here» (H) where a number's entry is not among the files on hand, and nothing on hand shows that
      // the entry is there, so the card says nothing of it, as of any source with no answer here. Since the ninth cut
      // no dictionary's line says H (unfoldingWord's lexicon is read whole); the rule stays for a source read in part.
      // A line that says W (unfoldingWord's one entry under the number is, by its own reference to Brown-Driver-Briggs,
      // another word of the number than STEP's letter names) names no entry, and its row says why (ABSENT.W)
      if (how === "H") continue;
      const row = el("div", "row", srcHead(key)); box.append(row);
      if (!ids0.length) { row.append(el("p", "sub", ABSENT[how] || "No entry.")); continue; }
      const isU = key === "ubs_sdbh_hebrew_v0_9_2", isB = key === "unabridged_bdb_1906";
      const citedOf = key === "openscriptures_bdb_1906" ? citedO : isB ? citedB : isU ? citedU : new Map();
      const citedAt = (id) => citedOf.get(id) || (isU ? { very: new Set(), verse: new Set() } : new Set());
      const cites = (id) => { const c = citedOf.get(id); return !!c && (isU ? c.very.size + c.verse.size > 0 : c.size > 0); };
      const several = ids0.length > 1;
      // where a number reaches several records, the one that cites this place stands first
      let ids = ids0.slice().sort((x, y) => (cites(y) ? 1 : 0) - (cites(x) ? 1 : 0)); let behind = [];
      let numeralOther = new Set(), numeralHere = null;
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
      } else if (several) row.append(el("p", "sub", `This number reaches ${ids.length} records of this dictionary; nothing in the files says which is meant.${ids.some(cites) ? " The record that cites this place stands first." : ""}`));
      const drawRecords = (list, into) => {
        for (const id of list) {
          const holder = several ? el("li", "") : into; if (several) into.append(holder);
          const cited = citedAt(id);
          const first = el("p", "line"); holder.append(first);
          if (isB) first.append(...unabridgedFirst(F.unabridged[id], several)); else first.append(...DRAW[key].first(F.entries[key][id], cited));
          if (cites(id)) first.append(el("span", "cited-note", isU ? (cited.very.size ? "cites this very word" : "cites this verse") : "cites this verse"));
          if (isB && numeralOther.has(id)) holder.append(el("p", "sub", `BDB numbers this another word of the same letters (${[numeralHere, F.unabridged[id].head.numeral].filter(Boolean).map((x) => `${x}.`).join(", ")})`));
          const btn = el("button", "open", "Open the whole entry"); btn.type = "button"; btn.setAttribute("aria-expanded", "false"); btn.dataset.src = key; btn.dataset.id = id;
          const whole = el("div", "entry"); whole.hidden = true; holder.append(btn, whole);
          btn.addEventListener("click", async () => {
            const open = whole.hidden; btn.setAttribute("aria-expanded", String(open)); btn.textContent = open ? "Close the entry" : "Open the whole entry"; whole.hidden = !open;
            if (!open || whole.dataset.drawn) return;
            whole.dataset.drawn = "1";
            try {
              if (isB) { whole.append(el("p", "how", "Opening the record…")); const U = await getFile(unFile(id)); whole.replaceChildren(...unabridgedWhole(U.entries[id], cited, (line.own || {})[id] || null)); }
              else whole.append(...DRAW[key].whole(F.entries[key][id], cited).filter(Boolean));
              if (REACHED[how]) whole.append(el("p", "how", `This entry is ${REACHED[how]} (${id}).`));
              whole.dataset.ready = "1";
            } catch (err) { whole.replaceChildren(el("p", "how", "The entry could not be fetched.")); delete whole.dataset.drawn; fault(err.message); }
          });
        }
      };
      if (ids.length) { const list = several ? el("ul", "records") : row; if (several) row.append(list); drawRecords(ids, list); }
      if (behind.length) {
        const btn = el("button", "more-btn", `Other records this number also stands on: ${behind.length}`); btn.type = "button"; btn.setAttribute("aria-expanded", "false");
        const ul = el("ul", "records"); ul.hidden = true; drawRecords(behind, ul);
        btn.addEventListener("click", () => { ul.hidden = !ul.hidden; btn.setAttribute("aria-expanded", String(!ul.hidden)); });
        row.append(btn, ul);
      }
    }
    box.dataset.ready = "1";
  };

  // ---- THE PILLS (27 November 2026; the owner, on the card of Genesis 1:3 word 5: «you dont get to skip R pills and
  // compspan and selectable gloss just because we can play around with how the cards list off D/M»). The live
  // reader's card keeps its frame, its divisions, its cells and its pills, and fills a cell's pills from these files:
  // a pill stands in a cell only where a source puts that reading on that part of the word by its own address, or by
  // a bridge a source declares. Nothing is matched by letters. A cell is named as the frame names it: the verse's
  // label, the word's number in the verse as written (marks not counted), which reading of a pair (form, ketiv,
  // qere), and the cell's letters [a, b] among the word's t letters.
  //   STEP          its gloss of each of its pieces in that piece's cell; its pieces' glosses joined as the line
  //                 joins them ("/") in the whole word's cell
  //   MACULA        its words in the cells its own letters make (a part with no letters of its own stands only in the
  //                 whole word's reading); its parts joined in the whole word's cell
  //   dictionaries  under the number STEP gives a piece, each dictionary's own entry as «In the dictionaries» draws
  //                 it, in that piece's cell: the strings the card prints as the entry's meaning, split only at the
  //                 source's own marks (a «» run of a meaning or an opening, a <def>, a gloss); never a run printed
  //                 plain as the record's italics, never Strong's list of renderings; where a number stands on several
  //                 records of the unabridged BDB, those the card shows as this word's alone
  //   first         in a dictionary's pills, a UBS sense that cites this very word, and a BDB line or sense that
  //                 cites this verse
  //   order         STEP, MACULA, UBS, the two BDB files, then the others as «In the dictionaries» lists them
  // Each pill names its source (src: the place's "step" and "macula", else the dictionary's key) and its address
  // (how): the words a reader can find it by in the listing under the pills.
  const LETTER_FROM = "\u05d0", LETTER_TO = "\u05ea";
  const lettersIn = (s) => [...String(s || "")].filter((c) => c >= LETTER_FROM && c <= LETTER_TO).length;
  /** Each part's letters [a, b] in its word, in order; a part with no letters of its own has none (null). */
  const spansOf = (hebs) => { let a = 0; return hebs.map((h) => { const n = lettersIn(h); const r = n ? [a, a + n - 1] : null; a += n; return r; }); };
  const nthWord = (v, n) => { let k = 0; for (const x of v.e) { if (x.m !== undefined) continue; k += 1; if (k === n) return x; } return null; };
  /** The form of a word a reading names: the only one, else the written (ketiv) or the read (qere) form; «qere:1»
   *  (or «ketiv:1») names the second word of a half written as several words, each a form of its own. */
  const formFor = (e, reading, t) => {
    const nth = /^(ketiv|qere):(\d+)$/u.exec(String(reading));
    if (nth) { const half = e.f.filter((f) => (nth[1] === "ketiv" ? f.r === 2 : f.r !== 2)); return half.length > 1 ? half[Number(nth[2])] || null : half[0] || null; }
    if (e.f.length === 1) return e.f[0];
    const pick = reading === "ketiv" ? e.f.filter((f) => f.r === 2) : reading === "qere" ? e.f.filter((f) => f.r !== 2) : [];
    if (pick.length < 2) return pick[0] || null;
    return pick.find((f) => f.t && f.t.p && f.t.p.reduce((n, p) => n + lettersIn(p[3]), 0) === t) || null;
  };
  /** «In the dictionaries»: the records of a dictionary under a number that the card shows as this word's (drawEntries' rule). */
  const recordsShown = (key, line, forms) => {
    const [how, ...ids0] = line.b[key] || ["0"];
    if (how === "H" || !ids0.length) return [];
    if (key !== "unabridged_bdb_1906") return ids0;
    const byMacula = new Set(forms.flatMap((f) => f.ow || []));
    const other = new Set(forms.flatMap((f) => f.ol || []).filter((id) => ids0.includes(id)));
    const numeralOther = new Set((line.on || []).filter((id) => ids0.includes(id) && !other.has(id)));
    const own = new Set([...Object.keys(line.own || {}), ...ids0.filter((id) => byMacula.has(id))].filter((id) => !other.has(id) && !numeralOther.has(id)));
    return ids0.filter((id) => own.has(id));
  };
  /** The strings «In the dictionaries» prints as an entry's meaning: its one line's, and the whole entry's. */
  const meaningsOf = (key, e) => {
    if (!e) return [];
    if (key === "stepbible_tbesh_gloss") return [e.Gloss];
    if (key === "openscriptures_strongs") return e.meaning ? (e.meaning.defs || []).map((d) => e.meaning.t.slice(d[0], d[0] + d[1])) : [];
    if (key === "openscriptures_lexical_index") return e.def !== undefined ? [e.def] : [];
    if (key === "unfoldingword_uhal") return (e.senses || []).flatMap((x) => (x.glosses || []).map((g) => g.t));
    if (key === "ubs_sdbh_hebrew_v0_9_2") return (e.BaseForms || []).flatMap((b) => (b.LEXMeanings || []).flatMap((m) => ((m.LEXSenses || [])[0] || {}).Glosses || []));
    if (key === "openscriptures_bdb_1906") {
      // the one line's meanings (the first sense's, as the line prints them), then every meaning the whole entry marks
      const seen = new Set(); const groups = [];
      for (const df of e.defs || []) { if (df.phrase) { if (seen.has(df.phrase.at)) continue; seen.add(df.phrase.at); } const k = df.sense ? df.sense.join(".") : ""; let g = groups[groups.length - 1]; if (!g || g.key !== k) { g = { key: k, d: [] }; groups.push(g); } g.d.push(df.phrase ? df.phrase.t : df.joined ? df.joined.whole : df.t); }
      return [...(groups[0] ? groups[0].d : []), ...bdbMarked(e)];
    }
    if (key === "unabridged_bdb_1906") {
      // the record's one line: its head's runs the file classes as the entry's meaning, else as its opening
      const its = (e.head.italics || []).filter((x) => tidy(x.t));
      const main = its.filter((x) => x.kind === "main_gloss");
      return (main.length ? main : its.filter((x) => x.kind === "opening")).map((x) => x.t);
    }
    return [];
  };
  /** The meanings the Open Scriptures BDB's whole entry prints (DRAW.openscriptures_bdb_1906.whole, by marked): each
   *  run of its text (its head, then each sense up to its first sub-sense), the marks inside the run in order, a mark
   *  that starts inside the one before it skipped; a meaning mark prints the entry's own letters at its place. */
  const bdbMarked = (e) => {
    const marks = [...(e.defs || []).map((d) => [d.at, d.t.length, 1]), ...(e.w || []).map((w) => [w.at, w.t.length, 0])];
    const out = []; const top = e.senses || [];
    const run = (from, to) => { let at = from; for (const [a, n, def] of marks.filter((m) => m[0] >= from && m[0] + m[1] <= to).sort((x, y) => x[0] - y[0])) { if (a < at) continue; if (def) out.push(e.text.slice(a, a + n)); at = a + n; } };
    run(0, top.length ? top[0].at : e.text.length);
    const sense = (x) => { const kids = x.senses || []; run(x.at, kids.length ? kids[0].at : x.at + x.len); kids.forEach(sense); };
    top.forEach(sense);
    return out;
  };
  const MEANT = ["main_gloss", "opening"];
  /** UBS's own phrase mark: the glosses of the meanings the entries under a number give under a collocation (their
   *  LEXCollocations), where no meaning of those entries without one gives the same gloss. The page rests them shut by
   *  the dictionary kinds record, except where UBS cites this very word. */
  const ubsCollocations = (es) => {
    const ms = es.flatMap((e) => ((e && e.BaseForms) || []).flatMap((x) => x.LEXMeanings || []));
    const gl = (m) => (((m.LEXSenses || [])[0] || {}).Glosses || []).map(tidy);
    const plain = new Set(ms.filter((m) => !(m.LEXCollocations || []).length).flatMap(gl));
    return new Set(ms.filter((m) => (m.LEXCollocations || []).length).flatMap(gl).filter((g) => !plain.has(g)));
  };
  /** A cell's pills: { pills: [{ text, src, how, cites, colloc }], form, why } (why: a sentence where the cell can have none;
   *  colloc: a UBS gloss of a meaning under a collocation alone, ubsCollocations). */
  const pillsAt = async (doc, ref, n, reading, a, b, t) => {
    await index();
    const v = ((doc && doc.verses) || []).find((x) => x.l === ref); const e = v ? nthWord(v, n) : null;
    if (!e) return { pills: [], form: null, why: "The card's files hold no word at this place." };
    const f = formFor(e, reading, t);
    if (!f) return { pills: [], form: null, why: "The card's files do not say which form of the word this is." };
    const out = []; const seen = new Set();
    const add = (text, src, how, cites = false, colloc = false) => { const s = tidy(text); if (!s || seen.has(`${src}\u0001${s}`)) return; seen.add(`${src}\u0001${s}`); out.push({ text: s, src, how, cites, ...(colloc ? { colloc: true } : {}) }); };
    const whole = a === 0 && b === t - 1;
    const tp = f.t && f.t.p ? f.t.p : null; const rows = f.t && f.t.rows ? f.t.rows.join(" + ") : "";
    const stepSpans = tp ? spansOf(tp.map((p) => p[3])) : [];
    const stepFits = !!tp && tp.reduce((k, p) => k + lettersIn(p[3]), 0) === t;
    const at = (spans) => spans.findIndex((r) => r && r[0] === a && r[1] === b);
    const part = stepFits ? at(stepSpans) : -1;
    // STEP at this word
    if (tp) {
      if (whole && tp.every((p) => p[0] !== null && tidy(p[0]))) add(tp.map((p) => tidy(p[0])).join("/"), "step", `STEP at this word (${rows}), its parts as the line joins them`);
      if (part >= 0 && tp[part][0] !== null) add(tp[part][0], "step", `STEP at this word (${rows}), part ${part + 1} of ${tp.length}`);
    }
    // MACULA at this word, by its own division of the word
    const m = f.m || null;
    if (m) {
      const ms = spansOf(m.map((x) => x[2]));
      if (whole && m.every((x) => tidy(x[1]))) add(m.map((x) => tidy(x[1])).join("/"), "macula", "MACULA at this word, its parts joined");
      const i = m.reduce((k, x, j) => (k >= 0 ? k : ms[j] && ms[j][0] === a && ms[j][1] === b ? j : -1), -1);
      if (i >= 0) add(m[i][1], "macula", `MACULA at this word, part ${i + 1} of ${m.length}`);
    }
    // the dictionaries, under the number STEP gives the piece this cell is
    const tag = part >= 0 ? numberOf(tp[part][1]) : null;
    const h = f.h || {};
    if (tag && !stepsOwn(tag)) {
      let F = null; try { F = await getFile(tagFile(tag)); } catch (err) { fault(err.message); }
      const line = F && F.tags ? F.tags[tag] : null;
      const lists = new Map(INDEX.dictionaries.map((k) => [k, []]));
      const put = (key, text, how, cites = false, colloc = false) => lists.get(key).push([text, how, cites, colloc]);
      // what cites here comes first in its dictionary's pills
      for (const u of h.u || []) {
        if (u[1] >= 2) continue;
        const ent = `${u[0].slice(0, 6)}000000000`;
        const mine = u[1] === 0 ? !!line && (line.b.ubs_sdbh_hebrew_v0_9_2 || []).slice(1).includes(ent) : lettersIn(u[3]) === b - a + 1 && (f.m || []).some((x, j) => { const r = spansOf(f.m.map((y) => y[2]))[j]; return r && r[0] === a && r[1] === b && x[2] === u[3]; });
        if (mine) for (const g of u[2]) put("ubs_sdbh_hebrew_v0_9_2", g, `UBS sense ${u[0]}, cited at this very word${u[1] === 1 ? " (its entry by MACULA's dictionary form of the part)" : ""}`, true);
      }
      for (const bl of h.b || []) if (bl[9] === tag) for (const [txt, kind] of bl[6]) if (MEANT.includes(kind)) put("unabridged_bdb_1906", txt, `unabridged BDB ${bl[0]}, its line that cites this verse`, true);
      for (const o of h.o || []) if (o[4] === tag) for (const d of o[3]) put("openscriptures_bdb_1906", d, `Open Scriptures BDB ${o[0]}, its sense that cites this verse`, true);
      const coll = line ? ubsCollocations(recordsShown("ubs_sdbh_hebrew_v0_9_2", line, e.f).map((id) => ((F.entries || {}).ubs_sdbh_hebrew_v0_9_2 || {})[id])) : new Set();
      if (line) for (const key of INDEX.dictionaries) for (const id of recordsShown(key, line, e.f)) {
        const ent = key === "unabridged_bdb_1906" ? (F.unabridged || {})[id] : ((F.entries || {})[key] || {})[id];
        for (const txt of meaningsOf(key, ent)) put(key, txt, `${SRC[key][0]} ${id}, under ${tag}`, false, key === "ubs_sdbh_hebrew_v0_9_2" && coll.has(tidy(txt)));
      }
      const ORDER = ["ubs_sdbh_hebrew_v0_9_2", "openscriptures_bdb_1906", "unabridged_bdb_1906"];
      for (const key of [...ORDER, ...INDEX.dictionaries.filter((k) => !ORDER.includes(k))]) {
        const list = lists.get(key) || [];
        // the BDB lines and senses that cite here lead both BDB files
        if (key === "openscriptures_bdb_1906") for (const x of (lists.get("unabridged_bdb_1906") || []).filter((y) => y[2])) add(x[0], "unabridged_bdb_1906", x[1], true);
        for (const x of list) add(x[0], key, x[1], x[2], x[3]);
      }
    }
    // a UBS sense found by MACULA's dictionary form stands on its part where STEP gives that part no dictionary's
    // number (none, or one of STEP's own)
    if (!tag || stepsOwn(tag)) for (const u of h.u || []) if (u[1] === 1 && f.m) { const ms = spansOf(f.m.map((y) => y[2])); f.m.forEach((x, j) => { if (ms[j] && ms[j][0] === a && ms[j][1] === b && x[2] === u[3]) for (const g of u[2]) add(g, "ubs_sdbh_hebrew_v0_9_2", `UBS sense ${u[0]}, cited at this very word (its entry by MACULA's dictionary form of the part)`, true); }); }
    return { pills: out, form: f.s || e.s, why: out.length ? null : "No source reads this part by itself here." };
  };
  // STEP's credit as its license summary asks it (relay v224: «Attribute the data to Tyndale House and STEPBible.org,
  // and include a link to STEPBible.github.io/STEPBible-Data as the source of this data»), in one place: the credits
  // below print it, and credits("step") hands it to the page, which prints it under every STEP record of the older
  // card and in its export
  // (name: the data's own name, for the link where a line has little room: the older card's record line)
  const STEP_CREDIT = { words: "data created by STEPBible.org based on work at Tyndale House, Cambridge", href: "https://STEPBible.github.io/STEPBible-Data", text: "STEPBible.github.io/STEPBible-Data", name: "STEPBible-Data" };
  /** The credits in full: one paragraph a source, as each source asks to be credited; the revisions are the data's own.
   *  credits("step"): STEP's own credit, its words and its link, for a page that names a STEP record elsewhere. */
  const credits = (only) => {
    if (only === "step") return { ...STEP_CREDIT };
    const S = (INDEX && INDEX.sources) || {}; const rev = (k) => ((S[k] || {}).revision || (((S[k] || {}).files || [])[0] || {}).revision || "");
    const link = (href, text) => { const a = el("a", "", text || href.replace(/^https?:\/\//, "")); a.href = href; a.rel = "noopener"; return a; };
    const p = (...kids) => el("p", "", ...kids);
    return [
      p(el("b", "", "STEP Bible. "), `The English under each word, the division of a word into its parts, the number on each part and the brief lexicon are ${STEP_CREDIT.words} (CC BY 4.0). Source: `, link(STEP_CREDIT.href, STEP_CREDIT.text), `. Revision ${rev("step_tahot")}.`),
      p(el("b", "", "MACULA. "), "MACULA Hebrew Linguistic Datasets, available at ", link("https://github.com/Clear-Bible/macula-hebrew/"), ` (CC BY 4.0). Its English is from the Cherith Glosses for the Hebrew Old Testament, by Andi Wu, © 2022 Cherith Analytics (CC BY 4.0). Revision ${rev("macula_hebrew")}.`),
      p(el("b", "", "UBS Dictionary of Biblical Hebrew. "), "© United Bible Societies, 2023. Adapted from Semantic Dictionary of Biblical Hebrew © 2000-2023 United Bible Societies. Licensed under ", link("http://creativecommons.org/licenses/by-sa/4.0/", "CC BY-SA 4.0"), ". Shown here in part: each sense with its glosses, definition and fields, and the count of the verses it cites in place of the list. ", link("https://github.com/ubsicap/ubs-open-license"), `, ${rev("ubs_sdbh_hebrew_v0_9_2")}.`),
      p(el("b", "", "Strong's dictionary, Brown-Driver-Briggs and the Lexical Index, the Open Scriptures files. "), "From the Open Scriptures Hebrew Bible Project's Hebrew Lexicon (CC BY 4.0); Strong's dictionary (1890) and Brown, Driver and Briggs (1906) are in the public domain. ", link("https://github.com/openscriptures/HebrewLexicon"), `, revision ${rev("openscriptures_strongs")}. Where that file of Strong's has lost a sign, the sign named is the one the Hebrew Wikisource edition of Strong's writes (CC BY-SA 4.0).`),
      p(el("b", "", "Brown-Driver-Briggs, unabridged. "), "The Brown-Driver-Briggs Hebrew and English Lexicon: a public domain document; formatting developed for use in marvel.bible by Eliran Wong; source provided by Tim Morton, the developer of Bible Analyzer; Scripture references parsed by Stephen Ku and his associates. ", link("https://github.com/eliranwong/unabridged-BDB-Hebrew-lexicon"), `, revision ${rev("unabridged_bdb_1906")}.`),
      p(el("b", "", "unfoldingWord Hebrew and Aramaic Lexicon. "), `© unfoldingWord (CC BY-SA 4.0). The whole lexicon is read here: one entry under each Strong's number its own list names, with no letter, and unfoldingWord marks every entry as needing edits. Under a number it has no entry for, the card says so. Where its entry is, by its own reference to Brown-Driver-Briggs, another word of the number than the one STEP's letter names, the card says so and does not show it. Revision ${rev("unfoldingword_uhal")}.`),
      p("Every line of the card stands where its source puts it: at this verse and word, or under the number STEP gives the word. The file and revision of each source are written in the card's data (", link(`${DATA}index.json`, "index.json"), ")."),
    ];
  };

  /** The card's body for one word of a chapter's file: how the two editions meet at it, what each source says at
   *  it, the dictionaries under each number of the word a dictionary can be filed by, the word's other parts,
   *  and the credits. */
  const draw = (body, doc, v, e, alive) => {
    body.replaceChildren(); body.scrollTop = 0;
    // how the two editions meet at this word, where it is not one for one with the same letters
    const says = []; for (const f of e.f) for (const s of (f.t || {}).say || []) if (!says.includes(s)) says.push(s);
    if (says.length) body.append(el("div", "say", ...says.map((s) => el("p", "", s))));
    if (e.f.some((f) => f.t && f.t.w === 0) && v.un) body.append(el("div", "say", el("p", "", "In this verse STEP's text has words that meet no word of ours:"), ...v.un.map((u) => el("p", "", he(u[1]), " ", rd(u[2]), el("span", "gap", ` (${u[0]})`)))));
    body.append(el("h3", "", "At this word"));
    const here = el("div", ""); body.append(here); let drawn = 0;
    for (const f of e.f) {
      if (e.f.length > 1) here.append(el("p", "form-h", f.r === 2 ? "The form written: " : "The form read: ", he(f.s)));
      const before = here.childElementCount; drawHere(f, here); drawn += here.childElementCount - before;
    }
    // what each source says here is drawn whole at once from the chapter's file: nothing at this word waits on a record
    here.dataset.ready = "1";
    pairSentence(e, here);
    if (!drawn) here.append(el("p", "form-h", "No source gives a reading at this word."));
    // the dictionaries, under each number of the word that a dictionary can be filed by: the root's first
    const parts = []; for (const f of e.f) for (const p of (f.t || {}).p || []) if (numberOf(p[1])) parts.push([p[0], numberOf(p[1]), p[2], p[3]]);
    const tags = []; for (const p of parts.slice().sort((a, b) => b[2] - a[2])) if (!stepsOwn(p[1]) && !tags.includes(p[1])) tags.push(p[1]);
    const own = parts.filter((p) => stepsOwn(p[1]));
    for (const tag of tags) drawEntries(tag, e.f, body, alive);
    const tail = el("div", ""); body.append(tail);
    if (own.length) {
      const seen = new Set(); const box = el("div", "", el("h3", "", "The other parts of this word"));
      for (const p of own) { const k = `${p[3]}|${p[1]}`; if (seen.has(k)) continue; seen.add(k); box.append(el("p", "form-h", he(p[3]), " ", p[0] === null ? "" : rd(p[0].trim()), ` · STEP's own number ${p[1]} for a prefix, an ending or a mark. No dictionary is filed under STEP's own numbers.`)); }
      tail.append(box);
    }
    // each source credited in short on the card, and in full one press away, inside the card
    const full = el("div", "credits-full"); full.hidden = true;
    const btn = el("button", "more-btn", "Whose words these are: the credits in full"); btn.type = "button"; btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => { if (!full.childElementCount) full.append(...credits()); full.hidden = !full.hidden; btn.setAttribute("aria-expanded", String(!full.hidden)); });
    tail.append(el("p", "c-credit", "STEP Bible: Tyndale House, Cambridge, and STEPBible.org, CC BY 4.0. MACULA Hebrew Linguistic Datasets, CC BY 4.0; its English is Cherith's. UBS Dictionary of Biblical Hebrew © United Bible Societies, CC BY-SA 4.0. Strong's and Brown-Driver-Briggs: the Open Scriptures files, CC BY 4.0; the unabridged Brown-Driver-Briggs as formatted by Eliran Wong, public domain."), btn, full);
  };

  // the card body's own look, each rule under the element `draw` draws into; the colors and the faces are the page's own
  // names, and every glyph is one of the page's inks (tools/check-color-channels-v1.mjs): the three dyes and their dims,
  // the marks' gold, silver for numbers alone; our own small words (a label, a note, a reference) in the argaman's dim
  const RULES = [
    ["&", "direction: ltr; text-align: left; font: 16px/1.6 Georgia, \"Times New Roman\", serif; color: var(--ink);"],
    [".he", "font-family: \"Frank Ruehl CLM\", \"Frank Ruehl\", \"David Libre\", \"SBL Hebrew\", Georgia, serif; color: var(--shani-ink); direction: rtl; unicode-bidi: isolate;"],
    [".rd", "font-family: 'reading', Georgia, serif; font-weight: 500; color: var(--tekhelet-ink);"],
    ["a", "color: var(--argaman-dim);"],
    ["button", "font: inherit; color: inherit;"],
    ["p", "margin: 0;"],
    ["h3", "font-size: 0.68rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 400; color: var(--faint); margin: 0.9rem 0 0.3rem;"],
    ["h3:first-child", "margin-top: 0.1rem;"],
    [".say", "margin: 0 0 0.5rem; padding: 0.35rem 0.55rem; border: 1px dashed var(--bronze-dim); border-radius: 0.45rem; font-size: 0.84rem; line-height: 1.4; color: var(--ink);"],
    [".say .he", "font-size: 1.15rem;"],
    [".say p", "margin: 0 0 0.25rem;"],
    [".say p:last-child", "margin: 0;"],
    [".form-h", "font-size: 0.8rem; color: var(--muted); margin: 0.6rem 0 0.2rem;"],
    [".form-h .he", "font-size: 1.15rem;"],
    [".row", "border-top: 1px solid rgba(127, 96, 68, 0.35); padding: 0.4rem 0 0.42rem;"],
    [".row:first-of-type", "border-top: none;"],
    [".row .src", "display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.25rem 0.5rem; font-size: 0.72rem; letter-spacing: 0.04em; color: var(--muted);"],
    [".row .src b", "font-weight: 400; color: var(--ink-strong); font-size: 0.8rem; letter-spacing: 0.02em;"],
    [".lic", "font-size: 0.62rem; letter-spacing: 0.05em; border: 1px solid var(--bronze-dim); border-radius: 999px; padding: 0 0.42rem; color: var(--muted); white-space: nowrap;"],
    [".row .line", "margin: 0.12rem 0 0; font-size: 0.95rem; line-height: 1.45; overflow-wrap: anywhere;"],
    [".row .line .he", "font-size: 1.2rem;"],
    [".row .line.part-row", "direction: rtl; text-align: left;"],
    [".row .line.part-row > .part-of-row", "direction: ltr; unicode-bidi: isolate;"],
    [".row .sub", "margin: 0.1rem 0 0; font-size: 0.76rem; color: var(--muted); line-height: 1.4;"],
    [".row .sub .he", "font-size: 1.02rem;"],
    [".def", "font-family: 'reading', Georgia, serif; font-weight: 500; color: var(--tekhelet-ink);"],
    [".row .line small.ctx", "font-size: 0.72em; color: var(--muted);"],
    [".records[hidden], .more[hidden], .entry[hidden], .credits-full[hidden]", "display: none;"],
    [".more-btn", "display: block;"],
    [".plus", "color: var(--faint); padding: 0 0.3em;"],
    [".open, .more-btn", "margin-top: 0.3rem; border: 1px solid var(--line); border-radius: 0.45rem; background: var(--bg); padding: 0.2rem 0.6rem; font-size: 0.74rem; letter-spacing: 0.03em; cursor: pointer; min-height: 2rem;"],
    [".open[aria-expanded=\"true\"], .more-btn[aria-expanded=\"true\"]", "background: var(--press-wash); box-shadow: 0 0 0 1px var(--bronze);"],
    [".entry", "margin: 0.4rem 0 0.1rem; padding: 0.45rem 0.55rem; border: 1px solid var(--bronze-dim); border-radius: 0.45rem; font-size: 0.86rem; line-height: 1.5; overflow-wrap: anywhere;"],
    [".entry .he", "font-size: 1.12rem;"],
    [".entry p", "margin: 0 0 0.35rem;"],
    [".entry p:last-child", "margin: 0;"],
    [".entry .k", "font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--faint); margin-right: 0.4em;"],
    [".entry .how", "font-size: 0.74rem; color: var(--muted); font-style: italic;"],
    [".entry ol.rend", "margin: 0.1rem 0 0.4rem; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 0.25rem 0.3rem;"],
    [".entry ol.rend li", "border: 1px solid rgba(127, 96, 68, 0.45); border-radius: 0.4rem; padding: 0 0.4rem;"],
    [".entry ol.rend li .sign", "color: var(--shani-dim); padding-right: 0.25em;"],
    [".entry ol.rend li small", "display: block; font-size: 0.66rem; color: var(--muted); line-height: 1.3;"],
    [".entry .def", "font-family: 'reading', Georgia, serif; font-weight: 500; color: var(--tekhelet-ink);"],
    [".sense", "margin: 0.2rem 0 0.2rem 0; padding-left: 0.7rem; border-left: 1px solid rgba(127, 96, 68, 0.35);"],
    [".sense > .lab", "font-weight: 400; color: var(--ink-strong); margin-right: 0.35em;"],
    [".cited", "background: var(--press-wash); outline: 1px solid var(--bronze); border-radius: 0.3rem; padding-right: 0.35rem;"],
    [".cited-note", "font: 0.68rem/1.3 Georgia, serif; letter-spacing: 0.05em; color: var(--muted); margin-left: 0.5em; white-space: nowrap; border: 1px solid var(--bronze-dim); border-radius: 999px; padding: 0 0.4rem;"],
    [".unit > .cited-note, .sense > .cited-note", "display: table; margin: 0.1rem 0 0.2rem;"],
    [".unit", "margin: 0.25rem 0;"],
    [".unit.stem", "display: inline; margin: 0;"],
    [".unit.point", "padding-left: 0.6rem; border-left: 1px solid rgba(127, 96, 68, 0.35);"],
    [".unit.sub", "padding-left: 1.3rem; border-left: 1px solid rgba(127, 96, 68, 0.2);"],
    [".entry em", "font-style: italic;"],
    [".entry em.gl", "font-style: normal; font-family: 'reading', Georgia, serif; font-weight: 500; color: var(--tekhelet-ink);"],
    [".entry em.gr", "color: var(--faint);"],
    [".entry .ref", "color: var(--muted); font-size: 0.82em; white-space: nowrap;"],
    [".gap", "color: var(--faint); font-size: 0.8em;"],
    [".it", "font-style: italic;"],
    [".records", "margin: 0.2rem 0 0; padding: 0; list-style: none;"],
    [".records li", "margin: 0.25rem 0; padding-left: 0.6rem; border-left: 2px solid rgba(127, 96, 68, 0.35);"],
    [".c-credit", "margin-top: 1rem; font-size: 0.7rem; line-height: 1.45; color: var(--muted); border-top: 1px solid rgba(127, 96, 68, 0.35); padding-top: 0.5rem;"],
    [".credits-full", "margin: 0.4rem 0 0.2rem; font-size: 0.74rem; line-height: 1.5; color: var(--muted); overflow-wrap: anywhere;"],
    [".credits-full p", "margin: 0 0 0.5rem;"],
    [".credits-full b", "font-weight: 400; color: var(--ink-strong);"],
  ];
  const style = (scope) => RULES.map(([sel, decl]) => `${sel.split(", ").map((s) => (s === "&" ? scope : `${scope} ${s}`)).join(", ")} { ${decl} }`).join("\n");

  return { index, chapter, entryAt, draw, kindWords, credits, style, pillsAt };
};
// end of the place card (tools/place-card-v1.mjs)
