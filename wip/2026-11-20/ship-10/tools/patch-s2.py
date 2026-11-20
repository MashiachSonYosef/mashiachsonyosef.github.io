import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:90])
    s = s.replace(old, new)
B = chr(92)
rep('''    const spanCells = new Set(cells.map((c) => `${c.__run.label}''' + B + '''u0001${c.__run.spanKey}`));
''', '''    const spanCells = new Set(cells.map((c) => `${c.__run.label}''' + B + '''u0001${c.__run.spanKey}`));
    // a cell named by its place: the verse, the place's first word and its key. A verse may hold one key at two
    // places, one standing and one set aside (Genesis 22:14, words 6-7 and 12-13, the second holding both its rows
    // back as pointed otherwise), and the cell of the one is not the other's
    const spanCellsAt = new Set(cells.filter((c) => c.__run.span).map((c) => `${c.__run.span.ref}''' + B + '''u0001${c.__run.span.first}''' + B + '''u0001${c.__run.spanKey}`));
''')
rep('''      if (atRestNow && !stands(pl)) { out.aside += 1; if (spanCells.has(at)) out.asideCell.push(`${pl.ref} ${pl.key}`); continue; }''',
    '''      if (atRestNow && !stands(pl)) { out.aside += 1; if (spanCellsAt.has(`${pl.ref}''' + B + '''u0001${pl.first}''' + B + '''u0001${pl.key}`)) out.asideCell.push(`${pl.ref} ${pl.first}-${pl.last} ${pl.key}`); continue; }''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
