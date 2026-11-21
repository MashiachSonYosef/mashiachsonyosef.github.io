# Ship 10b, patch 2: zone.html reads a default source's unit from the source's own data (the spans the bake lays in
# the book's file, relay v209): the words of a unit take the unit's one line; in one cell it prints once, apart
# each keeps the line as it rests (the page's own rule of 15 November for the units it could tell).
import sys, io
p = sys.argv[1] + "/zone.html"
s = io.open(p, encoding="utf-8").read()
MID = chr(0xb7)            # the middle dot, which the page writes as an escape in its script
ESC = chr(92) + "u00b7"
def rep(a, b, n=1):
    global s
    a, b = a.replace(MID, ESC), b.replace(MID, ESC)
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

# A · the helpers, ahead of the line a word reads from the source
rep(r'''  // (the source's line at one word, its neighbors not asked: defaultAt, below, holds a reading across words together)
''', r'''  // RULE: default-spans-rule-v1-a-default-sources-line-that-reads-several-words-is-one-unit-of-those-words-read-from-the-sources-own-data
  // THE WORDS A SOURCE'S LINE READS, FROM THE SOURCE'S OWN DATA (21 November 2026). A source's line may read more
  // than the word it is filed at: UBS's lemma of two words («Kadesh-Barnea», filed at the first word and at no
  // other), BDB's headword of two words («Beersheba», filed at both), a MACULA word our text writes as two.
  // Printed where it is filed, UBS's name stood under its first word with another source's reading of the second
  // beside it (413 lines of the 39 books), and BDB's stood twice (82). The corpus lane's spans list (relay v209)
  // gives the words each line reads by its source's own data, and the bake lays, in the book's file, each source's
  // units of two or more words with the places their line is filed at (DEFAULT_PICKS.spans; tools/default-spans-v1.mjs
  // says which lines land). So the words of a unit take the unit's one line (defaultAtWord), are one unit
  // (dfltUnitOf) and print as the page already printed the units it could tell: once over them where they stand in
  // one cell, each keeping its line as it rests where they stand apart, the card saying what the source reads
  // across them. STEP's own mark across words is the line at rest and is not read here: nothing at rest moves.
  let DFLT_SPANS = null, DFLT_WORD_AT = null;
  // the word at place n (WORD_N's inverse)
  const dfltWordAt = (n) => {
    if (!DFLT_WORD_AT) { DFLT_WORD_AT = []; for (const sec of zone.sections || []) for (const w of sec.words || []) DFLT_WORD_AT.push(w); }
    return DFLT_WORD_AT[n - 1] || null;
  };
  // the book file's units by source: each place of a unit -> the unit, and each place a unit's line is filed at
  // that is none of its words -> the unit (read once per book file)
  const dfltSpans = () => {
    if (DFLT_SPANS && DFLT_SPANS.of === DEFAULT_PICKS) return DFLT_SPANS;
    const sp = (DEFAULT_PICKS && DEFAULT_PICKS.spans) || {}, by = { of: DEFAULT_PICKS };
    for (const src of ["macula", "ubs", "bdb"]) {
      const at = new Map(), beside = new Map();
      for (const u of Array.isArray(sp[src]) ? sp[src] : []) {
        if (!Array.isArray(u) || !Array.isArray(u[0]) || !Array.isArray(u[1]) || u[0].length < 2) continue;
        const unit = { src, ns: u[0], filed: u[1] };
        for (const n of unit.ns) at.set(n, unit);
        for (const n of unit.filed) if (!unit.ns.includes(n)) beside.set(n, unit);
      }
      by[src] = { at, beside };
    }
    DFLT_SPANS = by;
    return by;
  };
  // a unit as the page reads it: its line is read at the first place it is filed with a line pick (lineAt), and a
  // unit filed with none is none (BDB's records with no highlighted words)
  const dfltSpanRead = (u) => { if (u && u.lineAt === undefined) u.lineAt = u.filed.find((f) => !!lineOf(u.src, f)) || null; return u && u.lineAt ? u : null; };
  // the unit of a source's a place stands in, or null
  const dfltSpanUnit = (src, n) => (DEFAULT_PICKS && n && src && src !== "step" ? dfltSpanRead(dfltSpans()[src].at.get(n)) : null);
  // the unit whose line is filed at a place that is none of its words, or null: the line is theirs, not this word's
  const dfltSpanBeside = (src, n) => (DEFAULT_PICKS && n && src && src !== "step" ? dfltSpanRead(dfltSpans()[src].beside.get(n)) : null);
  // whether the page asks the source at every word of a unit: no word of it a pair, none yielding to a switch
  // (placeYields). A unit it does not is not read as one: none of its words takes the source's line
  const dfltSpanWhole = (u) => u.ns.every((m) => { const w = dfltWordAt(m); return !!w && !w.mark && !w.kq && !placeYields(w); });
  // (the source's line at one word, its neighbors not asked: defaultAt, below, holds a reading across words together)
''')

# B · the first's line at a word: a unit's one line; a line filed beside its words is not this word's
rep(r'''    if (held) return dfltOn("step") ? stepOwn("held", first) : null;
    const t1 = lineOf(first, n);
''', r'''    if (held) return dfltOn("step") ? stepOwn("held", first) : null;
    // a word of a unit of the first's (default-spans-rule-v1) takes the unit's one line, read at the place it is
    // filed, wherever in the unit this word stands and whether or not the source files a line at this word too;
    // the picks the card lists ride on that place (n). A unit the page does not ask the source at every word of
    // is not read: its words go on to the second and the line as it rests, as a word the source has no line at
    const u1 = dfltSpanUnit(first, n);
    if (u1 && dfltSpanWhole(u1)) {
      const d = made(first, lineOf(first, u1.lineAt), "first", null, dfltOwn(first, u1.lineAt));
      if (d) return Object.assign(d, { n: u1.lineAt, unit: u1 });
    }
    const t1 = u1 || dfltSpanBeside(first, n) ? null : lineOf(first, n);
''')

# C · a unit of the source's own data is read whole by it
rep(r'''  const dfltAcross = (word) => {
    const d = defaultAtWord(word);
    const across = d ? dfltHalvesOf(word) : null;
''', r'''  const dfltAcross = (word) => {
    const d = defaultAtWord(word);
    // a unit of the source's own data is read by it at every word (defaultAtWord gave each the unit's line)
    if (d && d.unit) return d;
    const across = d ? dfltHalvesOf(word) : null;
''')

# D · the unit a word's line is a word of
rep(r'''  const dfltUnitOf = (word) => {
    const ws = word && DEFAULT_PICKS ? dfltEntriesOf(word) || dfltHalvesOf(word) : null;
    const d = ws ? dfltAcross(word) : null;
''', r'''  const dfltUnitOf = (word) => {
    // told by the source's own data where the book's file gives it (default-spans-rule-v1): the unit's words
    const d0 = word && DEFAULT_PICKS ? dfltAcross(word) : null;
    if (d0 && d0.unit) return d0.unit.ns.map(dfltWordAt);
    const ws = word && DEFAULT_PICKS ? dfltEntriesOf(word) || dfltHalvesOf(word) : null;
    const d = ws ? dfltAcross(word) : null;
''')

# E · the card: the label, and what each source reads at this word
rep(r'''      const p0 = dAt.src === "bdb" ? dfltPicks("bdb", WORD_N.get(word))[0] : null;
      nowK.textContent = `reading · ${dfltPill(dAt.src)} at this place${p0 ? ` · ${p0.note}` : ""}`;
''', r'''      const p0 = dAt.src === "bdb" ? dfltPicks("bdb", dAt.unit ? dAt.unit.lineAt : WORD_N.get(word))[0] : null;
      nowK.textContent = `reading · ${dfltPill(dAt.src)} at this place${p0 ? ` · ${p0.note}` : ""}${dAt.unit ? ` · one reading of these ${dAt.unit.ns.length} words` : ""}`;
''')
rep(r'''        if (src === pieceSaid || !dfltOn(src)) continue;
        const picks = dfltPicks(src, dfltHere.n);
        if (!picks.length) continue;
''', r'''        if (src === pieceSaid || !dfltOn(src)) continue;
        // a word of a unit of the source's (default-spans-rule-v1) says the unit's reading, read at the place it is
        // filed, and that it is one reading of the unit's words, whether the line prints it (in one cell) or holds
        // it (apart); the source's own picks at this very word, where it files others, stand after it
        const unit = dfltSpanUnit(src, dfltHere.n), unitAt = unit && dfltSpanWhole(unit) ? unit.lineAt : null;
        const picks = dfltPicks(src, unitAt || dfltHere.n);
        if (!picks.length) continue;
''')
rep(r'''        const said = src === "ubs" ? lineOf("ubs", dfltHere.n) : dfltLinePick(src === "bdb" ? picks[0].words : picks[0].text) ? (src === "bdb" ? picks[0].words : picks[0].text) : null;
''', r'''        const said = src === "ubs" ? lineOf("ubs", unitAt || dfltHere.n) : dfltLinePick(src === "bdb" ? picks[0].words : picks[0].text) ? (src === "bdb" ? picks[0].words : picks[0].text) : null;
''')
rep(r'''        if (dfltHere.on === src) line.append(dfltOnLine(dfltHere.filling));
        const more = dfltMore(picks.filter((x) => !onLine(x)));
''', r'''        if (unitAt && said) line.append(Object.assign(document.createElement("span"), { className: "n", textContent: ` · one reading of these ${unit.ns.length} words` }));
        if (dfltHere.on === src) line.append(dfltOnLine(dfltHere.filling));
        const here = unitAt && unitAt !== dfltHere.n ? dfltPicks(src, dfltHere.n).map((x) => ({ ...x, note: `${x.note ? `${x.note}, ` : ""}at this word alone` })) : [];
        const more = dfltMore([...picks.filter((x) => !onLine(x)), ...here]);
''')

# F · the comments that said what the page could not tell
rep(r'''  // readings in the 39 books, 361 more than the 313 written with both; read
  // in part by MACULA at 231, by UBS at 469, by BDB at 153). Not held: a
  // source's line that reads its neighbors' words where TAHOT marks nothing
  // across them (UBS's «Aram Zoba» at II Samuel 10:6:15, «Aram» «Zobah»
  // beside it), which the page cannot tell from that source's reading of the
  // word itself
''', r'''  // readings in the 39 books, 361 more than the 313 written with both; read
  // in part by MACULA at 231, by UBS at 469, by BDB at 153). A source's line
  // that reads its neighbors' words where TAHOT marks nothing across them
  // (UBS's «Aram Zoba» at II Samuel 10:6:15, «Aram» «Zobah» beside it) is
  // told by the source's own data, where the book's file gives it
  // (default-spans-rule-v1, dfltSpanUnit), and such a unit is read whole
''')
rep(r'''  // both its words) is two readings and prints twice. Not told: a source's
  // line that reads its neighbors' words where the data marks nothing across
  // them (UBS's «Aram Zoba» filed at the object marker of II Samuel 10:6:15,
  // «Aram» and «Zobah» beside it unread by UBS): the book file gives each
  // place UBS's meaning and its pieces but not the words that meaning covers,
  // which the corpus lane's ledger would have to give (UBS's own word span
  // for each meaning it files) before the page can tell it
''', r'''  // both its words) is two readings and prints twice. A source's line that
  // reads its neighbors' words where these marks tell nothing (UBS's «Aram
  // Zoba» filed at the object marker of II Samuel 10:6:15, «Aram» and
  // «Zobah» beside it) is told by the source's own data: the corpus lane's
  // spans list gives the words each line reads, the book's file carries the
  // units, and a unit it gives is read before these marks are asked
  // (default-spans-rule-v1, dfltSpanUnit)
''')
io.open(p, "w", encoding="utf-8").write(s)
print("patched", p)
