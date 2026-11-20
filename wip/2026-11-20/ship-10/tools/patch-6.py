import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)

# (a) the copy: no space after a word that ends in the stroke
rep('''      if (out) out += prev && g.line && prev.line === g.line ? " " : "\\n";
''', '''      // (a word the scribes joined to the next with their stroke is copied touching it, as the text writes it: each
      // is its own cell at rest, words-stand-alone-rule-v1, and the copy put a space after the stroke)
      if (out) out += prev && g.line && prev.line === g.line ? (/\\u05be[\\u0591-\\u05c7]*$/u.test(out) ? "" : " ") : "\\n";
''')

# (c) a sign's cell is laid by the place's own pieces, which nothing the reader does moves
rep('''      // the word's whole line is a sign and nothing else (appendWord: such a word stays beside the word its stroke joins it to)
      signAlone: !!line && String(line).split(" + ").every((x) => signOnly(x)),
''', '''      // the place's own reading is a sign and nothing else, every piece of it (appendWord: such a word stays beside
      // the word its stroke joins it to). Read from the zone's pieces, never from the line as it now stands: a
      // reading the reader pressed, or another first source, moves the line and must not move a cell's edge (a
      // ruled cell is laid as the page lays it at first paint, check-ruled-equals-first-paint-v1 E1)
      signAlone: Array.isArray(word.pg) && word.pg.length > 0 && word.pg.every((x) => !!x && signOnly(String(x.g || ""))),
''')

# (d) a unit held apart keeps its line as it rests, STEP's own words too
rep('''  const defaultAtWord = (word) => {
    if (!DFLT_BOOK || !word || word.kq || placeYields(word)) return null;
''', '''  // (held: the source's line at this word is held back, one unit whose words stand apart, and the word keeps its
  // line as it rests; that line is STEP's own words where today's line is bare, which no other layer draws)
  const defaultAtWord = (word, held = false) => {
    if (!DFLT_BOOK || !word || word.kq || placeYields(word)) return null;
''')
rep('''    const t1 = lineOf(first, n);
    if (t1) return at(made(first, t1, "first", null, dfltOwn(first, n)));
''', '''    if (held) return dfltOn("step") ? stepOwn("rest", first) : null;
    const t1 = lineOf(first, n);
    if (t1) return at(made(first, t1, "first", null, dfltOwn(first, n)));
''')
rep('''    if (!beneath) { const d = defaultAt(word); if (d) return d; }
''', '''    if (!beneath) {
      const d = defaultAt(word); if (d) return d;
      // A UNIT HELD APART KEEPS ITS LINE AS IT RESTS, STEP'S OWN WORDS TOO (20 November 2026). Where a source reads
      // one unit at every word of it and the words stand apart, its line is held and each word keeps the line it
      // rests on. At a word whose resting line is STEP's own words (today's line bare there), nothing below draws
      // them, and the word stood blank: Daniel 1:8 under MACULA, UBS or BDB, the first word of the king's food
      // (check-rulings-under-sources-v1 U10). Rare while a stroke joined such words into one cell; at rest now
      // each is its own (words-stand-alone-rule-v1)
      if (dfltApartUnit(word)) { const r = defaultAtWord(word, true); if (r) return r; }
    }
''')

# (b) the pointing switch: the cells follow it
rep('''        if (id === "only" && !latticeStore) latticeReady().then(reopen); else reopen();
''', '''        if (id === "only" && !latticeStore) latticeReady().then(reopen); else reopen();
        // the cells follow the switch (words-stand-alone-rule-v1): a place the span store names is a cell where a row
        // of it stands, and a row the place holds back under «only this pointing» stands under the other positions.
        // The lanes are laid again, and the built sections where the places set aside moved: at once where no card
        // stands open, and otherwise when the card closes (payLanes)
        if (kindsHere && HUD_LANES.lay) { const was = window.__spanStore ? window.__spanStore.rested || 0 : 0; HUD_LANES.lay().then(() => { if ((window.__spanStore ? window.__spanStore.rested || 0 : 0) !== was) { lanesOwed = true; payLanes(); } }); }
''')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
