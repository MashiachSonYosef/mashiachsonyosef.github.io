# Ship 10b, patch 5: tools/check-same-product-v1.mjs (the gate): under a source pressed, a word of a unit the new
# build's book file gives from that source's own data (spans, default-spans-rule-v1) is owed the unit's one line
# where its words stand in one cell, and the line as it rests where they stand apart, where the unit holds a pair,
# and at a place the unit's line is filed beside its words.
import sys, io
p = sys.argv[1] + "/tools/check-same-product-v1.mjs"
s = io.open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

rep('''// source reads at every word of it, reads as it rests once the words stand
// apart, which the default picks' expectation already holds (unitsIn).
''', '''// source reads at every word of it, reads as it rests once the words stand
// apart, which the default picks' expectation already holds (unitsIn).
// THE WORDS A SOURCE'S LINE READS (default-spans-rule-v1; ship 10b of 21
// November 2026). The default picks' expectation holds this too, from the
// spans the new build's book files carry (the units of two or more words a
// source's first pick's line reads, by that source's own data; relay v209).
// Under that source pressed, at a word of a unit filed with a line of it:
// where the unit's words stand in one cell of the new build, the unit's one
// line is owed at every word of it, the source's, and the words the older
// build printed where the line is filed, wherever it printed the source's
// there; where they stand apart, where the unit holds a pair, and at a place
// the line is filed beside the words it reads, the line as it rests is owed
// (an older build printed the source's line under the word it is filed at,
// and another source's reading of the unit's other words beside it: UBS's
// «Kadesh-Barnea» then STEP's «Barnea»). The owed lines are read from the
// book files and the page, never named.
''')

rep('''let heldSeen = 0, apartSeen = 0;
''', '''let heldSeen = 0, apartSeen = 0;
// and per book, per source, the units the book's file gives from the source's own data (spans): each word of a unit
// read as one -> { ns, lineAt }, and the places owed the line as it rests (a unit's words where it holds a pair, a
// place its line is filed beside its words)
const SPANS = new Map();
const spanSeen = { one: 0, rests: 0 };
''')

rep('''      byUnit.set(x, units);
    }
  }
  return HELD.get(z).get(src) || null;
};
''', '''      // THE WORDS THE SOURCE'S LINE READS, from its own data (the book file's spans; zone.html dfltSpanUnit): a unit
      // filed with a line of the source is that unit before the marks above are asked. Read as one where no word of
      // it is a pair: its words are the unit (apart, each rests: the loop below reads the cells), and the unit's one
      // line is owed where they stand in one cell. Where it holds a pair none of its words takes the source's line,
      // and neither does a place its line is filed beside its words: the line as it rests
      const wordAtN = new Map(words.map((q) => [q.n, q]));
      const one = new Map(), rests = new Set();
      for (const u of (((bf.spans || {})[x]) || [])) {
        if (!Array.isArray(u) || !Array.isArray(u[0]) || !Array.isArray(u[1]) || u[0].length < 2) continue;
        const lineN = u[1].find((n) => lineAt(n, x)) || null;
        if (!lineN) continue;
        const whole = u[0].every((n) => wordAtN.has(n) && !wordAtN.get(n).w.kq);
        for (const n of u[1]) if (!u[0].includes(n)) rests.add(n);
        for (const n of u[0]) { if (whole) { one.set(n, { ns: u[0], lineAt: lineN }); units.set(n, u[0]); } else { rests.add(n); units.delete(n); } }
      }
      if (!SPANS.has(z)) SPANS.set(z, new Map());
      SPANS.get(z).set(x, { one, rests });
      byUnit.set(x, units);
    }
  }
  return HELD.get(z).get(src) || null;
};
// per source, the units its own data gives (heldIn, SPANS), or null
const spansIn = (z, src) => (heldIn(z, src) ? (SPANS.get(z) || new Map()).get(src) || null : null);
''')

rep('''        const holds = SRC_OF_STATE.has(name) ? heldIn(z, SRC_OF_STATE.get(name)) : null;
        const unit = SRC_OF_STATE.has(name) ? (unitsIn(z, SRC_OF_STATE.get(name)) || new Map()).get(nOf(i)) : null;
        const apart = !!unit && !unit.every((w) => { const r = (C[k][w - firstN(z, k) - 1] || [])[4]; return !!r && r === y[4]; });
        if (((holds && holds.has(nOf(i))) || apart) && x[0] === y[0]) {
          const rest = c.states.default && c.states.default[k] ? c.states.default[k][i] : null;
          if (rest && y[1] === rest[1] && y[2] === rest[2] && y[3] === rest[3]) {
            if (x[1] !== y[1] || x[2] !== y[2]) { if (apart) apartSeen += 1; else heldSeen += 1; if (DIFF) diffLines.push(`${apart ? "held apart" : "held whole"}: ${z} ${ch} ${name} ${k} #${i + 1}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); }
            continue;
          }
          expected.push(`${at}: "${y[1]}" [${y[3]}], the line as it rests owed at a word of ${apart ? `one unit ${name} reads at every word of it, its words standing apart` : `a reading across words ${name} does not read whole`} ("${rest ? rest[1] : ""}" [${rest ? rest[3] : ""}])`);
          continue;
        }
''', '''        const holds = SRC_OF_STATE.has(name) ? heldIn(z, SRC_OF_STATE.get(name)) : null;
        const unit = SRC_OF_STATE.has(name) ? (unitsIn(z, SRC_OF_STATE.get(name)) || new Map()).get(nOf(i)) : null;
        const apart = !!unit && !unit.every((w) => { const r = (C[k][w - firstN(z, k) - 1] || [])[4]; return !!r && r === y[4]; });
        // THE WORDS THE SOURCE'S LINE READS (default-spans-rule-v1): a word of a unit the book's file gives from the
        // source's own data, its words in one cell of the new build: the unit's one line at every word of it, the
        // source's, and the words the older build printed where the line is filed, where it printed the source's
        const spans = SRC_OF_STATE.has(name) ? spansIn(z, SRC_OF_STATE.get(name)) : null;
        const span = spans && !apart ? spans.one.get(nOf(i)) || null : null;
        if (span && x[0] === y[0] && (x[1] !== y[1] || x[2] !== y[2] || x[3] !== y[3])) {
          const m = M_OF.get(SRC_OF_STATE.get(name));
          const cells = span.ns.map((w) => C[k][w - firstN(z, k) - 1] || null), filed = A[k][span.lineAt - firstN(z, k) - 1] || null;
          if (y[3] === m && cells.every((r) => !!r && r[1] === y[1] && r[2] === y[2] && r[3] === y[3]) && (!filed || filed[3] !== m || filed[1] === y[1])) {
            spanSeen.one += 1;
            if (DIFF) diffLines.push(`a unit's one line: ${z} ${ch} ${name} ${k} #${i + 1}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`);
            continue;
          }
          if (y[3] === m) { expected.push(`${at}: "${y[1]}" [${y[3]}], one line of ${name} owed over the ${span.ns.length} words of a unit its own data gives, the words it prints where the line is filed`); continue; }
        }
        const spanRests = !!spans && spans.rests.has(nOf(i));
        if (((holds && holds.has(nOf(i))) || apart || spanRests) && x[0] === y[0]) {
          const rest = c.states.default && c.states.default[k] ? c.states.default[k][i] : null;
          if (rest && y[1] === rest[1] && y[2] === rest[2] && y[3] === rest[3]) {
            if (x[1] !== y[1] || x[2] !== y[2]) { if (spans && (spans.one.has(nOf(i)) || spanRests)) spanSeen.rests += 1; else if (apart) apartSeen += 1; else heldSeen += 1; if (DIFF) diffLines.push(`${apart ? "held apart" : spanRests ? "not the unit's line here" : "held whole"}: ${z} ${ch} ${name} ${k} #${i + 1}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); }
            continue;
          }
          expected.push(`${at}: "${y[1]}" [${y[3]}], the line as it rests owed at a word of ${apart ? `one unit ${name} reads at every word of it, its words standing apart` : spanRests ? `a unit of ${name}'s that holds a pair, or where its line is filed beside the words it reads` : `a reading across words ${name} does not read whole`} ("${rest ? rest[1] : ""}" [${rest ? rest[3] : ""}])`);
          continue;
        }
''')

rep('''${apartSeen} at a word of one unit a source reads at every word of it, its words standing apart`);''',
    '''${apartSeen} at a word of one unit a source reads at every word of it, its words standing apart; at a word of a unit a source's own data gives (spans), ${spanSeen.one} moved to the unit's one line and ${spanSeen.rests} to the line as it rests`);''')
io.open(p, "w", encoding="utf-8").write(s)
print("patched", p)
