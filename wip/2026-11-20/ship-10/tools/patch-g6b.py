import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:90])
    s = s.replace(old, new)
rep('''      // A PLACE NO ROW OF WHICH RESTS OPEN IS NO CELL UNDER EITHER POSITION (words-stand-alone-rule-v1): its words
      // are words, and its card is judged where its rows stand, with the dictionaries that rest shut opened for
      // the load (Deuteronomy 18:1's «the Jewish people», English Wiktionary's one row, held back as pointed
      // otherwise: no cell under «only» there either, a cell under «keep» that reads it)''',
'''      // A PLACE NO ROW OF WHICH RESTS OPEN IS NO CELL UNDER EITHER POSITION (words-stand-alone-rule-v1): its words
      // are words, and its card is judged where its rows stand, with the dictionaries that rest shut opened for
      // the load. Opened, every place is laid, as before the rule (Deuteronomy 18:1's «the Jewish people», English
      // Wiktionary's one row, held back as pointed otherwise: a cell under «only» whose card holds the row back
      // and says so, a cell under «keep» that reads it)''')
rep('''          const wantOnly = rowsOf(c).some((r) => !r.form_of && !heldBy(c, r)), wantKeep = rowsOf(c).some((r) => !r.form_of);
          const all = new Set([...c.kept, ...c.heldOnly]);
          const poolO = new Set(((o && o.pool) || []).map(low)), poolK = new Set(((k && k.pool) || []).map(low));
          const fault = !o || !k ? "not pressed with the dictionaries opened" : o.fault || k.fault
            || (!!o.noCell !== !wantOnly ? `opened, under «only» the page lays ${o.noCell ? "no cell" : "a cell"} and ${wantOnly ? "a row of the place stands" : "no row of the place stands"}` : null)
            || (!!k.noCell !== !wantKeep ? `opened, under «keep» the page lays ${k.noCell ? "no cell" : "a cell"} and ${wantKeep ? "a row of the place is no pointer" : "every row of the place is a pointer"}` : null)
            || ((c.under_only === "held" ? poolO.has(low(c.reads)) : !poolO.has(low(c.reads))) ? `opened, under «only» «${c.reads}» ${poolO.has(low(c.reads)) ? "stands" : "is absent"} (named ${c.under_only})` : null)
            || (wantKeep && all.has(low(c.reads)) && !poolK.has(low(c.reads)) ? `opened, under «keep» «${c.reads}» is absent` : null);
          g6.push({ ok: !fault, say: `${at}: no row of the place rests open, so the place is no cell under either position and its words are words; ${fault || `with the dictionaries that rest shut opened, ${o.noCell ? "no cell under «only»" : `a cell under «only», «${c.reads}» ${poolO.has(low(c.reads)) ? "standing" : "held back"}`} and ${k.noCell ? "no cell under «keep»" : `a cell under «keep» that reads «${c.reads}»`}`}` });''',
'''          const all = new Set([...c.kept, ...c.heldOnly]);
          const poolO = new Set(((o && o.pool) || []).map(low)), poolK = new Set(((k && k.pool) || []).map(low));
          const wantHeld = { otherwise: Object.values(c.held).filter((w) => w === "otherwise").length, silent: Object.values(c.held).filter((w) => w === "silent").length };
          const fault = !o || !k ? "not pressed with the dictionaries opened" : o.fault || k.fault
            || (o.noCell || k.noCell ? `opened, the page lays no cell at the place under ${o.noCell ? "«only»" : "«keep»"}` : null)
            || ((c.under_only === "held" ? poolO.has(low(c.reads)) : !poolO.has(low(c.reads))) ? `opened, under «only» «${c.reads}» ${poolO.has(low(c.reads)) ? "stands" : "is absent"} (named ${c.under_only})` : null)
            || (!o.held || o.held.otherwise !== wantHeld.otherwise || o.held.silent !== wantHeld.silent ? `opened, under «only» the card says it held back ${o.held ? `${o.held.otherwise} pointed otherwise, ${o.held.silent} with no pointing` : "nothing"} (the place: ${wantHeld.otherwise}, ${wantHeld.silent})` : null)
            || (all.has(low(c.reads)) && !poolK.has(low(c.reads)) ? `opened, under «keep» «${c.reads}» is absent` : null);
          g6.push({ ok: !fault, say: `${at}: no row of the place rests open, so the place is no cell under either position and its words are words; ${fault || `with the dictionaries that rest shut opened, a cell under «only», «${c.reads}» ${poolO.has(low(c.reads)) ? "standing" : "held back"} (held back ${o.held.otherwise} pointed otherwise, ${o.held.silent} with no pointing), and a cell under «keep» that reads «${c.reads}»`}` });''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
