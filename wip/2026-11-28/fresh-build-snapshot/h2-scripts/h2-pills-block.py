import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
def sub(old, new):
    global s
    assert s.count(old) == 1, (old[:80], s.count(old)); s = s.replace(old, new)

PILLS = r'''
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
  const LETTER_FROM = "א", LETTER_TO = "ת";
  const lettersIn = (s) => [...String(s || "")].filter((c) => c >= LETTER_FROM && c <= LETTER_TO).length;
  /** Each part's letters [a, b] in its word, in order; a part with no letters of its own has none (null). */
  const spansOf = (hebs) => { let a = 0; return hebs.map((h) => { const n = lettersIn(h); const r = n ? [a, a + n - 1] : null; a += n; return r; }); };
  const nthWord = (v, n) => { let k = 0; for (const x of v.e) { if (x.m !== undefined) continue; k += 1; if (k === n) return x; } return null; };
  /** The form of a word a reading names: the only one, else the written (ketiv) or the read (qere) form. */
  const formFor = (e, reading, t) => {
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
      return [...(groups[0] ? groups[0].d : []), ...(e.defs || []).map((d) => d.t)];
    }
    if (key === "unabridged_bdb_1906") {
      // the record's one line: its head's runs the file classes as the entry's meaning, else as its opening
      const its = (e.head.italics || []).filter((x) => tidy(x.t));
      const main = its.filter((x) => x.kind === "main_gloss");
      return (main.length ? main : its.filter((x) => x.kind === "opening")).map((x) => x.t);
    }
    return [];
  };
  const MEANT = ["main_gloss", "opening"];
  /** A cell's pills: { pills: [{ text, src, how, cites }], form, why } (why: a sentence where the cell can have none). */
  const pillsAt = async (doc, ref, n, reading, a, b, t) => {
    const v = ((doc && doc.verses) || []).find((x) => x.l === ref); const e = v ? nthWord(v, n) : null;
    if (!e) return { pills: [], form: null, why: "The card's files hold no word at this place." };
    const f = formFor(e, reading, t);
    if (!f) return { pills: [], form: null, why: "The card's files do not say which form of the word this is." };
    const out = []; const seen = new Set();
    const add = (text, src, how, cites = false) => { const s = tidy(text); if (!s || seen.has(`${src}\u0001${s}`)) return; seen.add(`${src}\u0001${s}`); out.push({ text: s, src, how, cites }); };
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
      const put = (key, text, how, cites = false) => lists.get(key).push([text, how, cites]);
      // what cites here comes first in its dictionary's pills
      for (const u of h.u || []) {
        if (u[1] >= 2) continue;
        const ent = `${u[0].slice(0, 6)}000000000`;
        const mine = u[1] === 0 ? !!line && (line.b.ubs_sdbh_hebrew_v0_9_2 || []).slice(1).includes(ent) : lettersIn(u[3]) === b - a + 1 && (f.m || []).some((x, j) => { const r = spansOf(f.m.map((y) => y[2]))[j]; return r && r[0] === a && r[1] === b && x[2] === u[3]; });
        if (mine) for (const g of u[2]) put("ubs_sdbh_hebrew_v0_9_2", g, `UBS sense ${u[0]}, cited at this very word${u[1] === 1 ? " (its entry by MACULA's dictionary form of the part)" : ""}`, true);
      }
      for (const bl of h.b || []) if (bl[9] === tag) for (const [txt, kind] of bl[6]) if (MEANT.includes(kind)) put("unabridged_bdb_1906", txt, `unabridged BDB ${bl[0]}, its line that cites this verse`, true);
      for (const o of h.o || []) if (o[4] === tag) for (const d of o[3]) put("openscriptures_bdb_1906", d, `Open Scriptures BDB ${o[0]}, its sense that cites this verse`, true);
      if (line) for (const key of INDEX.dictionaries) for (const id of recordsShown(key, line, e.f)) {
        const ent = key === "unabridged_bdb_1906" ? (F.unabridged || {})[id] : ((F.entries || {})[key] || {})[id];
        for (const txt of meaningsOf(key, ent)) put(key, txt, `${SRC[key][0]} ${id}, under ${tag}`);
      }
      const ORDER = ["ubs_sdbh_hebrew_v0_9_2", "openscriptures_bdb_1906", "unabridged_bdb_1906"];
      for (const key of [...ORDER, ...INDEX.dictionaries.filter((k) => !ORDER.includes(k))]) {
        const list = lists.get(key) || [];
        // the BDB lines and senses that cite here lead both BDB files
        if (key === "openscriptures_bdb_1906") for (const x of (lists.get("unabridged_bdb_1906") || []).filter((y) => y[2])) add(x[0], "unabridged_bdb_1906", x[1], true);
        for (const x of list) add(x[0], key, x[1], x[2]);
      }
    }
    // a UBS sense found by MACULA's dictionary form stands on a part STEP does not number apart
    if (!tag) for (const u of h.u || []) if (u[1] === 1 && f.m) { const ms = spansOf(f.m.map((y) => y[2])); f.m.forEach((x, j) => { if (ms[j] && ms[j][0] === a && ms[j][1] === b && x[2] === u[3]) for (const g of u[2]) add(g, "ubs_sdbh_hebrew_v0_9_2", `UBS sense ${u[0]}, cited at this very word (its entry by MACULA's dictionary form of the part)`, true); }); }
    return { pills: out, form: f.s || e.s, why: out.length ? null : "No source reads this part by itself here." };
  };
'''
sub('''  /** The credits in full: one paragraph a source,''', PILLS.lstrip("\n") + '''  /** The credits in full: one paragraph a source,''')
sub('''  return { index, chapter, entryAt, draw, kindWords, credits, style };''', '''  return { index, chapter, entryAt, draw, kindWords, credits, style, pillsAt };''')
sub('''//   style(scope)       the card body's own look, as style rules under the
//                      selector `scope` (the element `draw` draws into)''', '''//   style(scope)       the card body's own look, as style rules under the
//                      selector `scope` (the element `draw` draws into)
//   pillsAt(doc, ref, n, reading, a, b, t)   the pills of one cell of the
//                      live reader's card (THE PILLS, below): what each
//                      source reads on that part of the word by its own
//                      address, in the card's order, each with its address''')
open(p, "w", encoding="utf-8").write(s)
