# Ship 10a, patch 10: the second read's two findings (20 November 2026).
#  1 a lay that no relay followed emptied the element maps of run cards still on the page (the license runs on):
#    nothing is laid where nothing would follow
#  2 a triple tap that closed a card owing a relay lost the line it had just selected: a relay waits for a
#    selection the reader holds
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:100])
    s = s.replace(old, new)
rep('''    // lay the lanes for the switches as they stand; a switch away from the
    // default waits for the book's file first, so the sections build into it
    HUD_LANES.lay = async () => {''', '''    // the places the lanes would set aside as the switches now stand, laying nothing (cellsFollow asks before it lays)
    HUD_LANES.restedSig = () => spanCardsOf().rested.map((pl) => `${pl.ref}:${pl.first}`).join(" ");
    // lay the lanes for the switches as they stand; a switch away from the
    // default waits for the book's file first, so the sections build into it
    HUD_LANES.lay = async () => {''')
rep('''    const must = lanesAll, was = LANES_SIG, n0 = LANES_N;
    lanesOwed = false; lanesAll = false;
    const follow = () => { if (must || LANES_SIG !== was) relayBuiltSections(); };
    const laying = HUD_LANES.lay();
    // the lanes are laid within the call where no file is to be fetched (the license runs resting off, or their
    // file here already), and the built sections follow in the same turn: a card closed and a word pressed at once
    // opens on the cells as they now stand, as it did while the lanes were laid at the press. Where the lay waited
    // on a file and a card was opened meanwhile, the card is left standing and the sections are owed whole
    if (LANES_N !== n0) follow();
    else laying.then(() => { if (activeEl) { lanesOwed = true; lanesAll = true; } else follow(); });
  };''', '''    const must = lanesAll, was = LANES_SIG, n0 = LANES_N;
    lanesOwed = false; lanesAll = false;
    // NOTHING IS LAID WHERE NOTHING WOULD FOLLOW (the second read of 20 November 2026). A lay makes the run cards'
    // maps of their words' elements anew, which the sections fill as they are built; a lay no relay followed left
    // them empty under run cards still on the page, with the license runs on (a named run's card then opened on
    // the sort's first reading, not its line's, and lit no word). So the places the switches would set aside are
    // asked first, and where they are the ones laid the lanes stand as they are
    if (!must && HUD_LANES.restedSig && HUD_LANES.restedSig() === was) return;
    const follow = () => { if (must || LANES_SIG !== was) relayBuiltSections(); };
    const laying = HUD_LANES.lay();
    // the lanes are laid within the call where no file is asked for (the license runs resting off), and the built
    // sections follow in the same turn: a card closed and a word pressed at once opens on the cells as they now
    // stand, as it did while the lanes were laid at the press. With the license runs on the lay ends a turn
    // later; where a card was opened meanwhile it is left standing and the sections are owed whole
    if (LANES_N !== n0) follow();
    else laying.then(() => { if (activeEl) { lanesOwed = true; lanesAll = true; } else follow(); });
  };''')
rep('''    if (lanesOwed) setTimeout(() => payLanes(), 0);
  };''', '''    // (and not under a selection the reader holds: a triple press closes the card and selects its line, and the
    // sections laid again a turn later took the line just selected with them; the cells follow once it is let go)
    if (lanesOwed) setTimeout(() => {
      const held = () => { const sel = window.getSelection ? window.getSelection() : null; return !!sel && !sel.isCollapsed; };
      if (!held()) { payLanes(); return; }
      const later = () => { if (held()) return; document.removeEventListener("selectionchange", later); payLanes(); };
      document.addEventListener("selectionchange", later);
    }, 0);
  };''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
