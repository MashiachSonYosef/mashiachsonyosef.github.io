import sys
root = sys.argv[1]
def patch(path, reps):
    p = root + '/' + path
    s = open(p, encoding='utf-8').read()
    for old, new in reps:
        assert s.count(old) == 1, (path, s.count(old), old[:90])
        s = s.replace(old, new)
    assert not any(0x590 <= ord(c) <= 0x5ff for c in s if False), path
    open(p, 'w', encoding='utf-8').write(s)
    print('patched', path)

# ---- check-span-store-v1: S2 knows the places set aside at rest ----
patch('tools/check-span-store-v1.mjs', [
('''//   S2  every place of a book is laid as one cell whose ink is the key, with
''', '''//   S2  (since 20 November 2026, words-stand-alone-rule-v1: at rest a place
//       is a cell only where a row of it stands, of a dictionary that does
//       not rest shut, no pointer, not held back by the place; the others
//       are set aside, their words words, and are counted here against the
//       page's own count, never called lost)
//       every place of a book is laid as one cell whose ink is the key, with
'''),
('''  const keyRows = Object.fromEntries(Object.entries(onDisk.keys || {}).map(([k, rs]) => [k, rs.map((r) => [r.slots[3], shutRow(r)])]));
''', '''  const keyRows = Object.fromEntries(Object.entries(onDisk.keys || {}).map(([k, rs]) => [k, rs.map((r) => [r.slots[3], shutRow(r), r.row_id, !!r.form_of])]));
'''),
('''    const out = { skippedAt: st.skipped.map((x) => `${x.ref}\\u0001${x.key}`), absorbed: [], absorbedLoose: [], inner: 0, places: st.places, laid: st.laid,''',
 '''    const out = { skippedAt: st.skipped.map((x) => `${x.ref}\\u0001${x.key}`), absorbed: [], absorbedLoose: [], inner: 0, places: st.places, laid: st.laid, rested: st.rested || 0, aside: 0, asideCell: [],'''),
('''    const skippedAt = new Set(out.skippedAt);
    const spanCells = new Set(cells.map((c) => `${c.__run.label}\\u0001${c.__run.spanKey}`));
''', '''    const skippedAt = new Set(out.skippedAt);
    const spanCells = new Set(cells.map((c) => `${c.__run.label}\\u0001${c.__run.spanKey}`));
    // THE PLACES SET ASIDE AT REST (words-stand-alone-rule-v1): where the dictionaries that rest shut are shut on a
    // book baked at rest, a place none of whose rows stands (resting open, no source of it switched off, no pointer,
    // not held back by the place under «only this pointing») is no cell: its words are words
    const atRestNow = !!window.__kindsHere && window.__kinds === "shut", onlyNow = (window.__masorah || "only") === "only";
    const stands = (pl) => (keyRows[pl.key] || []).some(([m, shut, id, pointer]) => !shut && !off.has(m) && !pointer && !(onlyNow && pl.held && (pl.held[id] === "otherwise" || pl.held[id] === "silent")));
'''),
('''      if (skippedAt.has(at) || spanCells.has(at)) continue;
''', '''      if (atRestNow && !stands(pl)) { out.aside += 1; if (spanCells.has(at)) out.asideCell.push(`${pl.ref} ${pl.key}`); continue; }
      if (skippedAt.has(at) || spanCells.has(at)) continue;
'''),
('''kindsSaid && r2.laid + r2.overlapped === r2.places && r2.skipped.length === 0 && r2.absorbedLoose.length === 0''',
 '''kindsSaid && r2.laid + r2.overlapped + r2.aside === r2.places && r2.rested === r2.aside && r2.asideCell.length === 0 && r2.skipped.length === 0 && r2.absorbedLoose.length === 0'''),
('''    `${r2.laid} of ${r2.places} places laid [places]${r2.overlapped ? ` (${r2.overlapped} overlapping another, as the store marks them, not laid)` : ""} · ${r2.cells} cells on the page` +''',
 '''    `${r2.laid} of ${r2.places} places laid [places]${r2.overlapped ? ` (${r2.overlapped} overlapping another, as the store marks them, not laid)` : ""}${r2.aside || r2.rested ? ` · ${r2.aside} set aside at rest, no row of theirs standing (the page says ${r2.rested})` : ""}${r2.asideCell.length ? ` · A CELL WHERE NO ROW STANDS: ${r2.asideCell.slice(0, 3).join(" | ")}` : ""} · ${r2.cells} cells on the page` +'''),
])

# ---- check-span-grade-v1: G6 knows a place none of whose rows stands under «only» is no cell ----
patch('tools/check-span-grade-v1.mjs', [
('''//       what it held back by why (window.__spanHeld); the named reading is
//       absent or stands as the pin names it
''', '''//       what it held back by why (window.__spanHeld); the named reading is
//       absent or stands as the pin names it. Since 20 November 2026
//       (words-stand-alone-rule-v1) a place none of whose rows stands under
//       «only» is no cell there: its words are words, its card is its
//       word's own and offers no rung of the key, and it is a cell again
//       under «keep»
'''),
('''    if (!rung) return { fault: "the card offers no rung of the place's key" };
''', '''    // no cell at the place and no rung of its key on the word's own card: the place set aside (words-stand-alone-rule-v1)
    if (!rung && !cell) { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await sleep(150); return { noCell: true, pool: [], ov: [], pills: [], held: null, said: "" }; }
    if (!rung) return { fault: "the card offers no rung of the place's key" };
'''),
('''        if (only.fault || keep.fault) { g6.push({ ok: false, say: `${at}: ${only.fault || keep.fault}` }); return; }
        const poolOnly = new Set(only.pool.map(low)), poolKeep = new Set(keep.pool.map(low));
''', '''        if (only.fault || keep.fault || keep.noCell) { g6.push({ ok: false, say: `${at}: ${only.fault || keep.fault || "no cell at the place under «keep»"}` }); return; }
        // whether a row of the place stands under «only»: resting open, no pointer, not held back by the place
        const standsOnly = (books.get(book).file.keys[c.pl.key] || []).some((r) => !shut(book, r) && !r.form_of && !["otherwise", "silent"].includes((c.pl.held || {})[r.row_id]));
        if (!!only.noCell !== !standsOnly) { g6.push({ ok: false, say: `${at}: ${standsOnly ? "a row of the place stands under «only», and the page lays no cell there" : "no row of the place stands under «only», and the page lays a cell there"}` }); return; }
        const poolOnly = new Set(only.pool.map(low)), poolKeep = new Set(keep.pool.map(low));
'''),
('''        g6.push({ ok: !leaked.length && !lost.length && counted && named,
''', '''        if (only.noCell) g6.push({ ok: true, say: `${at}: no row of the place stands under «only» (it holds back ${wantHeld.otherwise} pointed otherwise, ${wantHeld.silent} with no pointing), so the place is no cell there and its words are words; a cell again under «keep»` });
        else g6.push({ ok: !leaked.length && !lost.length && counted && named,
'''),
])

# ---- check-card-opens-on-the-line-v1: a sign's cell is no run ----
patch('tools/check-card-opens-on-the-line-v1.mjs', [
('''      const runsNow = () => [...document.querySelectorAll("section.seg .he-text .wjoin")].filter((r) => { const rg = r.querySelector(":scope > .g"); return !!rg && !rg.classList.contains("bare"); });
''', '''      // (a cell with no key of its own is no run: a word whose whole line is a hidden sign stands beside the word its
      // stroke joins it to, one breath and two cards, words-stand-alone-rule-v1; its gap is no reading to press)
      const runsNow = () => [...document.querySelectorAll("section.seg .he-text .wjoin")].filter((r) => { const rg = r.querySelector(":scope > .g"); return !!r.__key && !!rg && !rg.classList.contains("bare"); });
'''),
])
