import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:90])
    s = s.replace(old, new)

rep('''  const open = async (book, masorah) => {''', '''  const open = async (book, masorah, query = "") => {''')
rep('''    await page.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb");
    return { page, errors };''', '''    await page.goto(`${tree.base}/zone.html?b=${book}${query}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb");
    return { page, errors };''')
rep('''      here.forEach((c, i) => {
        const only = got.only[i], keep = got.keep[i];
        const at = `${book} ${c.pl.ref} ${c.pl.first}-${c.pl.last} (${c.why})`;
        if (only.fault || keep.fault || keep.noCell) { g6.push({ ok: false, say: `${at}: ${only.fault || keep.fault || "no cell at the place under «keep»"}` }); return; }
        // whether a row of the place stands under «only»: resting open, no pointer, not held back by the place
        const standsOnly = (books.get(book).file.keys[c.pl.key] || []).some((r) => !shut(book, r) && !r.form_of && !["otherwise", "silent"].includes((c.pl.held || {})[r.row_id]));
        if (!!only.noCell !== !standsOnly) { g6.push({ ok: false, say: `${at}: ${standsOnly ? "a row of the place stands under «only», and the page lays no cell there" : "no row of the place stands under «only», and the page lays a cell there"}` }); return; }
''', '''      // A PLACE NO ROW OF WHICH RESTS OPEN IS NO CELL UNDER EITHER POSITION (words-stand-alone-rule-v1): its words
      // are words, and its card is judged where its rows stand, with the dictionaries that rest shut opened for
      // the load (Deuteronomy 18:1's «the Jewish people», English Wiktionary's one row, held back as pointed
      // otherwise: no cell under «only» there either, a cell under «keep» that reads it)
      const rowsOf = (c) => books.get(book).file.keys[c.pl.key] || [];
      const heldBy = (c, r) => ["otherwise", "silent"].includes((c.pl.held || {})[r.row_id]);
      const aside = here.filter((c) => !rowsOf(c).some((r) => !shut(book, r) && !r.form_of));
      const opened = { only: new Map(), keep: new Map() };
      if (aside.length) for (const m of ["only", "keep"]) {
        const { page, errors } = await open(book, m, "&kinds=open");
        for (const c of aside) opened[m].set(c, await press(page, c));
        if (errors.length) g6.push({ ok: false, say: `${book} (the dictionaries that rest shut opened): page error ${errors[0]}` });
        await page.close();
      }
      here.forEach((c, i) => {
        const only = got.only[i], keep = got.keep[i];
        const at = `${book} ${c.pl.ref} ${c.pl.first}-${c.pl.last} (${c.why})`;
        if (only.fault || keep.fault) { g6.push({ ok: false, say: `${at}: ${only.fault || keep.fault}` }); return; }
        // whether a row of the place stands: resting open and no pointer; under «only», not held back by the place
        const standsKeep = rowsOf(c).some((r) => !shut(book, r) && !r.form_of);
        const standsOnly = rowsOf(c).some((r) => !shut(book, r) && !r.form_of && !heldBy(c, r));
        if (!!keep.noCell !== !standsKeep) { g6.push({ ok: false, say: `${at}: ${standsKeep ? "a row of the place rests open, and the page lays no cell there under «keep»" : "no row of the place rests open, and the page lays a cell there under «keep»"}` }); return; }
        if (!!only.noCell !== !standsOnly) { g6.push({ ok: false, say: `${at}: ${standsOnly ? "a row of the place stands under «only», and the page lays no cell there" : "no row of the place stands under «only», and the page lays a cell there"}` }); return; }
        if (keep.noCell) {
          const o = opened.only.get(c), k = opened.keep.get(c);
          const wantOnly = rowsOf(c).some((r) => !r.form_of && !heldBy(c, r)), wantKeep = rowsOf(c).some((r) => !r.form_of);
          const all = new Set([...c.kept, ...c.heldOnly]);
          const poolO = new Set(((o && o.pool) || []).map(low)), poolK = new Set(((k && k.pool) || []).map(low));
          const fault = !o || !k ? "not pressed with the dictionaries opened" : o.fault || k.fault
            || (!!o.noCell !== !wantOnly ? `opened, under «only» the page lays ${o.noCell ? "no cell" : "a cell"} and ${wantOnly ? "a row of the place stands" : "no row of the place stands"}` : null)
            || (!!k.noCell !== !wantKeep ? `opened, under «keep» the page lays ${k.noCell ? "no cell" : "a cell"} and ${wantKeep ? "a row of the place is no pointer" : "every row of the place is a pointer"}` : null)
            || ((c.under_only === "held" ? poolO.has(low(c.reads)) : !poolO.has(low(c.reads))) ? `opened, under «only» «${c.reads}» ${poolO.has(low(c.reads)) ? "stands" : "is absent"} (named ${c.under_only})` : null)
            || (wantKeep && all.has(low(c.reads)) && !poolK.has(low(c.reads)) ? `opened, under «keep» «${c.reads}» is absent` : null);
          g6.push({ ok: !fault, say: `${at}: no row of the place rests open, so the place is no cell under either position and its words are words; ${fault || `with the dictionaries that rest shut opened, ${o.noCell ? "no cell under «only»" : `a cell under «only», «${c.reads}» ${poolO.has(low(c.reads)) ? "standing" : "held back"}`} and ${k.noCell ? "no cell under «keep»" : `a cell under «keep» that reads «${c.reads}»`}`}` });
          g7.push({ ok: !c.restsOpen.includes(low(c.reads)), say: `${at}: «${c.reads}» absent (only rows that rest shut print it, and the place is no cell)` });
          g9.push({ judged: false, ok: true, say: `${at}: no cell at rest, nothing to order` });
          return;
        }
''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
