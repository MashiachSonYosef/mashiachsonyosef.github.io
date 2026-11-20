import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:90])
    s = s.replace(old, new)

# the header: the class said
rep('''// SHIP 5'S LANDINGS (the design of ships 5 and 6, section 8; the lead's calls
''', '''// THE WORDS STAND ALONE AT REST (words-stand-alone-rule-v1, ship 10 of 20
// November 2026). Owed with no file named: the rule is the page's own, so it
// is read from the two pages, and holds only where the new build's zone.html
// declares the rule and the old build's does not. On S2, the first card of a
// word that stood in a joined cell on the old build (a chain's, or a place's
// the new build sets aside) is the word's own card: the joined cell's card
// asked its words with no pointing and no entry, so the word's own card,
// which passes its gates, may lose pills. It stands at the word's own place,
// it gains no pill, and the same reading stays pressed; the order of a pool
// its gates filtered is its own and is not asked. On S1 nothing is owed by
// this rule itself: a line under a source pressed, at a word of one unit that
// source reads at every word of it, reads as it rests once the words stand
// apart, which the default picks' expectation already holds (unitsIn).
// SHIP 5'S LANDINGS (the design of ships 5 and 6, section 8; the lead's calls
''')
# the rule read from the two pages
rep('''const s1 = [], s2 = [], skipped = [], failed = [], expected = [];
''', '''// words-stand-alone-rule-v1, read from the two pages: owed only where the new page declares it and the old does not
const WSA_RULE = "words-stand-alone-rule-v1-at-rest-each-word-is-its-own-cell-and-card-and-a-joined-cell-stands-only-where-a-dictionary-that-stands-files-it";
const pageDeclares = async (origin, rule) => { try { const r = await fetch(`${origin}/reader/zone.html`); return r.ok && (await r.text()).includes(`RULE: ${rule}`); } catch { return false; } };
const WSA = (await pageDeclares(NEW, WSA_RULE)) && !(await pageDeclares(OLD, WSA_RULE));
const s1 = [], s2 = [], skipped = [], failed = [], expected = [];
''')
rep('''const owedCards = { stands: 0, "strongs sign": 0, runs: 0, "the pointer fold": 0 };''',
    '''const owedCards = { stands: 0, "strongs sign": 0, runs: 0, "the pointer fold": 0, "a word that left a joined cell, its own card": 0 };''')
# the card's class
rep('''    // what the old card owes, by class: each old pill keyed as the card groups them (its printed form, case folded)
''', '''    // words-stand-alone-rule-v1: the first card of a word that stood in a joined cell on the old build and whose card
    // on the new stands at the word's own place is the word's own card, gated as any word's: it may lose pills the
    // joined cell's card carried ungated, it gains none, and the same reading stays pressed
    if (WSA && C.at && A.at && A.at[0] === C.at[0] && A.at[1] === C.at[1] && own && C.place === own) {
      const la = ((a.states.default || {})[C.at[0]] || [])[C.at[1]] || null;
      if (la && la[4]) {
        const oldK = new Set(A.said.map(key)), gainedW = C.said.filter((t) => !oldK.has(key(t)));
        const pa = A.said.find((t) => t.startsWith("*")), pc = C.said.find((t) => t.startsWith("*"));
        if (!gainedW.length && (pa ? key(pa) : null) === (pc ? key(pc) : null)) {
          owedCards["a word that left a joined cell, its own card"] += 1;
          if (DIFF) diffLines.push(`== ${z} ${ch} card ${i + 1} (words stand alone: its word stood in a joined cell, and the card is the word's own at ${own}; ${A.said.length - C.said.length} pill(s) fewer, none gained, the same reading pressed)\\n  old: ${x}\\n  new: ${y}\\n  only old: ${A.said.filter((t) => !C.said.includes(t)).join(" | ")}`);
          continue;
        }
      }
    }
    // what the old card owes, by class: each old pill keyed as the card groups them (its printed form, case folded)
''')
rep('''${RUNS ? ", and the card of a word of a run that fell, opened on the word" : ""}`, !failed.length && cardsCompared > 0 && !s2.length,''',
    '''${RUNS ? ", and the card of a word of a run that fell, opened on the word" : ""}${WSA ? ", and the card of a word that stood in a joined cell and stands alone on the new build, the word's own card with its gates: no pill gained, the same reading pressed" : ""}`, !failed.length && cardsCompared > 0 && !s2.length,''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
