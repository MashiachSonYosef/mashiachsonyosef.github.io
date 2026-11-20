# Ship 10a, patch 8: the independent review's findings (20 November 2026), each read in the code first.
#  1 a search's hit on a word of a keyless cell opened a chain's card with no key
#  3 the cells did not follow the pointing where it moved by itself (first load, another switch's settling)
#  4 the cells owed stayed owed when a card closed by any road but a press away or Escape
#  5 a word's own card in a keyless cell wore the cell's first-to-last address
#  6 the cells did not follow the source switches
#  7 a relay nothing owed (the debt left standing; a same-value press)
#  8 the lanes were laid under an open card and the sections later, so the two parted meanwhile
#  9 the held line's chip said its source had no line there
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:100])
    s = s.replace(old, new)

# -- the declarations
rep('''  let lanesOwed = false;                  // the cells are to be laid again once no card stands open (payLanes)
  let payLanes = () => {};                // lays them, where they are owed and no card stands open (set beside the relay)
''', '''  let lanesOwed = false;                  // the cells are to follow a switch once no card stands open (cellsFollow)
  let lanesAll = false;                   // and every built section is owed whatever the lanes say (the signs switch)
  let LANES_SIG = "";                     // the places set aside as the lanes were last laid, to tell a lay that moved a cell
  let cellsFollow = () => {};             // the lanes laid again and the built sections with them (set beside the relay)
  let payLanes = () => {};                // the same, where it is owed and no card stands open (asked as a card closes)
''')
# -- the signature, where the lanes are laid
rep('''      window.__spanStore = { places: SPAN_BOOK ? SPAN_BOOK.places : 0, cards: spans.cards.length, laid: laidSpans, skipped: spans.skipped, rested: spans.rested.length };
''', '''      window.__spanStore = { places: SPAN_BOOK ? SPAN_BOOK.places : 0, cards: spans.cards.length, laid: laidSpans, skipped: spans.skipped, rested: spans.rested.length };
      LANES_SIG = spans.rested.map((pl) => `${pl.ref}:${pl.first}`).join(" ");
''')
# -- the pointing settled by itself at first load: the lanes were laid before it settled
rep('''      // the pointing's default, once the order and the lattice are known
      settleDefaultPointing();
''', '''      // the pointing's default, once the order and the lattice are known; the lanes were laid before it settled, and
      // the places a row holds back under «only this pointing» are not the ones under the other positions
      if (settleDefaultPointing() && HUD_LANES.lay) await HUD_LANES.lay();
''')
# -- the pointing moved by itself after a switch
rep('''    const reopen = () => { repaintGlossOrder(); reopenCard(); };
    if (masorah === "only" && !latticeStore) latticeReady().then(reopen); else reopen();
  };
  window.__masorah = masorah;
''', '''    const reopen = () => { repaintGlossOrder(); reopenCard(); };
    if (masorah === "only" && !latticeStore) latticeReady().then(reopen); else reopen();
    cellsFollow();
  };
  window.__masorah = masorah;
''')
# -- the pointing switch pressed
rep('''        // the cells follow the switch (words-stand-alone-rule-v1): a place the span store names is a cell where a row
        // of it stands, and a row the place holds back under «only this pointing» stands under the other positions.
        // The lanes are laid again, and the built sections where the places set aside moved: at once where no card
        // stands open, and otherwise when the card closes (payLanes)
        if (kindsHere && HUD_LANES.lay) { const was = window.__spanStore ? window.__spanStore.rested || 0 : 0; HUD_LANES.lay().then(() => { if ((window.__spanStore ? window.__spanStore.rested || 0 : 0) !== was) { lanesOwed = true; payLanes(); } }); }
''', '''        // the cells follow the switch (words-stand-alone-rule-v1): a place the span store names is a cell where a row
        // of it stands, and a row the place holds back under «only this pointing» stands under the other positions
        cellsFollow();
''')
# -- the sources
rep('''        rebuildSourceWords(); paintDefaultPills(); dfltRailRows(); dfltSay();
        repaintGlossOrder();
        reopenCard();
      },
      now: () => (sourcesOff.size ?''', '''        rebuildSourceWords(); paintDefaultPills(); dfltRailRows(); dfltSay();
        repaintGlossOrder();
        reopenCard();
        // and the cells follow (words-stand-alone-rule-v1): a place whose only standing row is this source's is
        // words while it is off (54 places of the 39 books stand on one source alone)
        cellsFollow();
      },
      now: () => (sourcesOff.size ?''')
# -- the signs
rep('''if (paintBlanks) paintBlanks(); if (maqafJoin === "pieces" && HUD_TOGGLES_IX) { lanesOwed = true; payLanes(); } },''',
    '''if (paintBlanks) paintBlanks(); if (maqafJoin === "pieces" && HUD_TOGGLES_IX) cellsFollow(true); },''')
rep('''      // sections are laid again, at once where no card stands open and otherwise when the card closes (payLanes)
''', '''      // sections are laid again, at once where no card stands open and otherwise when the card closes (cellsFollow)
''')
# -- the joined-words and runs switches lay and relay everything themselves: nothing is owed after
rep('''    HUD_LANES.lay().then(() => { if (HUD_LANES.relaySections) HUD_LANES.relaySections(); });
  };
  const segRow = ''', '''    HUD_LANES.lay().then(() => { lanesOwed = false; lanesAll = false; if (HUD_LANES.relaySections) HUD_LANES.relaySections(); });
  };
  const segRow = ''')
# -- the card closes: what is owed is paid, by whatever road it closed
rep('''    document.querySelectorAll(".wb.active, .wjoin.active").forEach((w) => w.classList.remove("active"));
    document.querySelectorAll(".wr.on").forEach((r) => r.classList.remove("on"));
  };
  // THE OPEN CARD, BUILT AGAIN UNDER A SWITCH''', '''    document.querySelectorAll(".wb.active, .wjoin.active").forEach((w) => w.classList.remove("active"));
    document.querySelectorAll(".wr.on").forEach((r) => r.classList.remove("on"));
    // the cells a switch moved while the card stood open follow now, by whatever road it closed (a press away,
    // Escape, the English pill, the reset, an export's menu); once this turn is over, so a card built again in
    // the same turn (reopenCard) keeps them owed
    if (lanesOwed) setTimeout(() => payLanes(), 0);
  };
  // THE OPEN CARD, BUILT AGAIN UNDER A SWITCH''')
# -- the one function, beside the relay
rep('''  payLanes = () => { if (!lanesOwed || activeEl) return; lanesOwed = false; relayBuiltSections(); };
''', '''  // THE CELLS FOLLOW A SWITCH (words-stand-alone-rule-v1). Which places stand as cells is read from the switches
  // as the lanes are laid (the dictionaries that rest shut, the pointing, the sources: spanCardsOf), and a sign's
  // cell from the signs switch as a section is built. When one of them moves, the lanes are laid again, and the
  // built sections with them where a cell moved (all: whatever the lanes say, the signs switch). Never under an
  // open card: the lanes and the cells on the page do not part, and a press of the card's own switch keeps its
  // card. What is owed is paid when the card closes, by whatever road (closeHud). The independent review of 20
  // November 2026: the lanes were laid at the press and the sections at the close, and only a press away or
  // Escape paid; the pointing moving by itself and the sources did not ask at all
  cellsFollow = (all = false) => {
    if (!HUD_LANES.lay) return;
    if (all) lanesAll = true;
    if (activeEl) { lanesOwed = true; return; }
    const must = lanesAll, was = LANES_SIG;
    lanesOwed = false; lanesAll = false;
    HUD_LANES.lay().then(() => { if (must || LANES_SIG !== was) relayBuiltSections(); });
  };
  payLanes = () => { if (lanesOwed && !activeEl) cellsFollow(); };
''')
# -- the kinds switch
rep('''    // THE CELLS FOLLOW THE SWITCH (words-stand-alone-rule-v1): a place the
    // span store names is a cell where a row of it stands, and which rows
    // stand moved with this switch. The lanes are laid again; the built
    // sections are laid again into them at once where no card stands open,
    // and otherwise when the reader closes the card (payLanes), so a press
    // of the card's own switch keeps its card
    if (HUD_LANES.lay) {
      const was = window.__spanStore ? window.__spanStore.rested || 0 : 0;
      HUD_LANES.lay().then(() => { if (was || (window.__spanStore && window.__spanStore.rested)) { lanesOwed = true; payLanes(); } });
    }
''', '''    // THE CELLS FOLLOW THE SWITCH (words-stand-alone-rule-v1): a place the
    // span store names is a cell where a row of it stands, and which rows
    // stand moved with this switch: at once where no card stands open, and
    // otherwise when the reader closes the card, so a press of the card's
    // own switch keeps its card (cellsFollow)
    cellsFollow();
''')
# -- a keyless cell is no run: each word opens its own card, pressed or landed on
rep('''      if (built.kqStand && !runEl.__key) { openRegion(lead, target); return; }
''', '''      if (built.kqStand && !runEl.__key) { openRegion(lead, target); return; }
      // and so any word of a cell with no key (a hidden sign's cell, words-stand-alone-rule-v1; a plain word beside
      // such a pair): the cell is no run and has no card, so a search's hit opens the word's own card, as a press
      // does. It opened a chain's card headed by the two words, whose rungs had no key (the review of 20 November)
      if (!runEl.__key) { openAt(lead, target); return; }
''')
# -- the address: a keyless cell's word is one word
rep('''      const host = el && el.closest ? (el.closest(".wjoin") || el.closest(".wb")) : null;
''', '''      // (a cell with no key is no run: a word's card there is one word's, and is numbered so)
      const cellOf = el && el.closest ? el.closest(".wjoin") : null;
      const host = el && el.closest ? ((cellOf && (cellOf.__key || !el.closest(".wb")) ? cellOf : null) || el.closest(".wb") || cellOf) : null;
''')
# -- the held line's own layer, and what its chip says
rep('''    if (held) return dfltOn("step") ? stepOwn("rest", first) : null;''',
    '''    if (held) return dfltOn("step") ? stepOwn("held", first) : null;''')
rep('''      : r.layer === "rest"
        ? `''', '''      : r.layer === "held"
        ? `${dfltPill(r.src)}’s own reading at this place, ${r.stands ? `where ${dfltPill(r.src)} spells or parts the word otherwise` : "where today’s line has no words"}: the line as it rests, ${dfltPill(r.of)} reading these words as one where they stand apart`
      : r.layer === "rest"
        ? `''')
# -- the switch's own words: where it rests, on the books it is live on
rep('''or each of its words as its own, which is where the page rests (a word that is only a hidden sign stays beside the word it is joined to)''',
    '''or each of its words as its own, which is where a book this switch is live on rests (a word that is only a hidden sign stays beside the word it is joined to)''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
