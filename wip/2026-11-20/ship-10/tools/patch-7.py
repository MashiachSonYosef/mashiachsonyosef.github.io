# Ship 10a, patch 7: the card at a word of a unit held apart reads the line the word keeps (dfltHeldLine),
# as lineUnder draws it: its pill, its "on the line" mark, the export's citation.
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:80])
    s = s.replace(old, new)

# 1. the one function
rep('''  const dfltUnitHeld = (word) => { const ws = word ? dfltApartUnit(word) : null, d = ws ? dfltAcross(word) : null; return d ? { d, ws } : null; };
''', '''  const dfltUnitHeld = (word) => { const ws = word ? dfltApartUnit(word) : null, d = ws ? dfltAcross(word) : null; return d ? { d, ws } : null; };
  // THE LINE SUCH A WORD KEEPS WHERE NOTHING ELSE DRAWS IT (20 November 2026): STEP's own words, where today's
  // line is bare there or STEP's reading stands (defaultAtWord, held), or null where the place's own line or the
  // table's answers. One function for the line (lineUnder), the card that opens on it (its pill, its «on the
  // line» mark) and the export's citation, so the three cannot part: the line alone read it at first, and the
  // card at Daniel 1:8:8 under MACULA stood on no reading under a line that had one
  const dfltHeldLine = (word) => (word && dfltApartUnit(word) ? defaultAtWord(word, true) : null);
''')
# 2. lineUnder
rep('''      if (dfltApartUnit(word)) { const r = defaultAtWord(word, true); if (r) return r; }''',
    '''      { const r = dfltHeldLine(word); if (r) return r; }''')
# 3. the export
rep('''        const at = defaultAt(w) || placeLine(w);
        const drawn = at && (at.why === "default" ? at : placeShown(at));''',
    '''        const at = defaultAt(w) || dfltHeldLine(w) || placeLine(w);
        const drawn = at && (at.why === "default" ? at : placeShown(at));''')
# 4. the card: the place set, the place of a cell, the layer remembered
rep('''    const placeSet = (ruledOnPieces || !defaultAt(word)) && bin === zone''',
    '''    const placeSet = (ruledOnPieces || !(defaultAt(word) || dfltHeldLine(word))) && bin === zone''')
rep('''        return w && w.k === surface ? defaultAt(w) || placeLine(w) : null;''',
    '''        return w && w.k === surface ? defaultAt(w) || dfltHeldLine(w) || placeLine(w) : null;''')
rep('''      return surface === region.k ? defaultAt(word) || (region.role === "QERE" ? dfltPairStands(word) : null) || placeLine(word) : null;''',
    '''      return surface === region.k ? defaultAt(word) || dfltHeldLine(word) || (region.role === "QERE" ? dfltPairStands(word) : null) || placeLine(word) : null;''')
rep('''    hudLayer = !opts.run && bin === zone && word ? { word, d: dAt ? dAt.text : null } : null;''',
    '''    hudLayer = !opts.run && bin === zone && word ? { word, d: ((dAt || dfltHeldLine(word)) || {}).text || null } : null;''')
rep('''        if (activeEl && hudLayer && ((defaultAt(hudLayer.word) || {}).text || null) !== hudLayer.d) reopenCard();''',
    '''        if (activeEl && hudLayer && ((defaultAt(hudLayer.word) || dfltHeldLine(hudLayer.word) || {}).text || null) !== hudLayer.d) reopenCard();''')
# 5. the sources at this word: whose words the line prints
rep('''      if (d) return { n, on: d.src, piece: false, filling: d.layer === "second" || d.layer === "rest" ? d.of : null };
''', '''      if (d) return { n, on: d.src, piece: false, filling: d.layer === "second" || d.layer === "rest" ? d.of : null };
      // a word of a unit held apart whose line is STEP's own words: STEP's are on the line, and they fill out
      // no one (the first has a reading here, held, as the label says)
      { const h = dfltHeldLine(word); if (h) return { n, on: h.src, piece: false, filling: null }; }
''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
