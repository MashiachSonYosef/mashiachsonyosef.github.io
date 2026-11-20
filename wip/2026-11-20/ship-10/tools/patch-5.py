import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)
rep('''      set: (id) => { signsPref = id; try { localStorage.setItem(SIGNS_KEY, id); } catch { /* the choice still stands on this page */ } repaintGlossOrder(); if (redrawReadings) redrawReadings(); if (paintBlanks) paintBlanks(); },
''', '''      // the cells follow the switch too (words-stand-alone-rule-v1): a word whose whole line is a sign stands beside the
      // word its stroke joins it to only while the signs are off, and that is laid as a section is built; so the built
      // sections are laid again, at once where no card stands open and otherwise when the card closes (payLanes)
      set: (id) => { signsPref = id; try { localStorage.setItem(SIGNS_KEY, id); } catch { /* the choice still stands on this page */ } repaintGlossOrder(); if (redrawReadings) redrawReadings(); if (paintBlanks) paintBlanks(); if (maqafJoin === "pieces" && HUD_TOGGLES_IX) { lanesOwed = true; payLanes(); } },
''')
rep('''why: "the scribes join words with a small stroke: read the chain as one word with one line and one card, or each of its words as its own; a chain a dictionary names inside a run stays in that run either way. The joined or folded spelling a dictionary used for a chain waits on the weld ledger",''',
    '''why: "the scribes join words with a small stroke: read the chain as one word with one line and one card, or each of its words as its own, which is where the page rests (a word that is only a hidden sign stays beside the word it is joined to); a place a dictionary that stands files over two words is one cell either way. The joined or folded spelling a dictionary used for a chain waits on the weld ledger",''')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
