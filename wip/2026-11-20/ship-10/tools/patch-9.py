# Ship 10a, patch 9: the cells follow at once where the lanes are laid at once (no file to fetch), as they did
# before patch 8, and a card opened while a lay waited on a file is never closed by it.
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:100])
    s = s.replace(old, new)
rep('''  let LANES_SIG = "";                     // the places set aside as the lanes were last laid, to tell a lay that moved a cell
''', '''  let LANES_SIG = "";                     // the places set aside as the lanes were last laid, to tell a lay that moved a cell
  let LANES_N = 0;                        // how many times the lanes were laid, to tell a lay that ended within its call
''')
rep('''      LANES_SIG = spans.rested.map((pl) => `${pl.ref}:${pl.first}`).join(" ");
''', '''      LANES_SIG = spans.rested.map((pl) => `${pl.ref}:${pl.first}`).join(" "); LANES_N += 1;
''')
rep('''    const must = lanesAll, was = LANES_SIG;
    lanesOwed = false; lanesAll = false;
    HUD_LANES.lay().then(() => { if (must || LANES_SIG !== was) relayBuiltSections(); });
  };''', '''    const must = lanesAll, was = LANES_SIG, n0 = LANES_N;
    lanesOwed = false; lanesAll = false;
    const follow = () => { if (must || LANES_SIG !== was) relayBuiltSections(); };
    const laying = HUD_LANES.lay();
    // the lanes are laid within the call where no file is to be fetched (the license runs resting off, or their
    // file here already), and the built sections follow in the same turn: a card closed and a word pressed at once
    // opens on the cells as they now stand, as it did while the lanes were laid at the press. Where the lay waited
    // on a file and a card was opened meanwhile, the card is left standing and the sections are owed whole
    if (LANES_N !== n0) follow();
    else laying.then(() => { if (activeEl) { lanesOwed = true; lanesAll = true; } else follow(); });
  };''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
