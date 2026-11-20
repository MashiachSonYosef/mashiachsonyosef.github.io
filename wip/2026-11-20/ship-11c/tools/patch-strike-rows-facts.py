# Ship 11c: a landing writes the facts its line names (n, t, b: the entries its own source gives the row) onto the row
# it lands, and the row-strikes record keeps them with the row. Until now a landed row carried none.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)
rep('''import { closed, setSlot, factsOf, CLOSES_SLOT } from "./gloss-store-v1.mjs";''', '''import { closed, setSlot, setFacts, factsOf, CLOSES_SLOT } from "./gloss-store-v1.mjs";''')
rep('''    if (e.cut !== undefined && e.cut !== null && e.cut !== 1) refuse(`list line ${line}: a landing's cut is 1 (its words are a cut of a sibling record) or nothing, not ${JSON.stringify(e.cut)}`);
  }''', '''    if (e.cut !== undefined && e.cut !== null && e.cut !== 1) refuse(`list line ${line}: a landing's cut is 1 (its words are a cut of a sibling record) or nothing, not ${JSON.stringify(e.cut)}`);
    // THE FACTS A LANDING NAMES (20 November 2026, the corpus lane's v200, v201 and v202): the entries its own source
    // gives the row (n its numbers, t STEP's lettered tags, b BDB's own entries), written onto the row as it lands
    if (e.facts !== undefined && e.facts !== null) {
      if (typeof e.facts !== "object" || Array.isArray(e.facts)) refuse(`list line ${line}: a landing's facts are an object`);
      for (const [k, v] of Object.entries(e.facts)) if (!["n", "t", "b"].includes(k) || !Array.isArray(v) || !v.length || v.some((y) => typeof y !== "string" || !y)) refuse(`list line ${line}: a landing's facts are the entries its own source gives the row (n, t, b), each a list of them; not ${k}: ${JSON.stringify(v)}`);
      if (e.facts.n && e.facts.n.some((y) => !/^H[1-9]\\d*$/u.test(y))) refuse(`list line ${line}: a landing's numbers are H and digits`);
    }
  }''')
rep('''cut: e.cut === 1 ? 1 : null } : null,''', '''cut: e.cut === 1 ? 1 : null, ...(e.facts && Object.keys(e.facts).length ? { facts: e.facts } : {}) } : null,''')
rep('''    const row = [L.rank, L.route, L.definition, String(e.m), L.year, L.cut, L.headwords];''', '''    const row = [L.rank, L.route, L.definition, String(e.m), L.year, L.cut, L.headwords];
    if (L.facts) setFacts(row, L.facts);''')
open(p, 'w', encoding='utf-8').write(t)
print('strike-rows patched: a landing writes its facts')
