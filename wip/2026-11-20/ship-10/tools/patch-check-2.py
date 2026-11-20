import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)

rep('''//   A1  on a first visit the page says the joined words rest as separate
//       words, draws no chain as one cell, and does not ask for the book's
//       run file, which it lays nothing from
''', '''//   A1  on a first visit the page says the joined words rest as separate
//       words, draws no chain as one cell, and does not ask for the book's
//       run file, which it lays nothing from. A joined cell is a place of
//       the span store, or a sign's cell: a word whose whole line is a sign
//       (the object marker's) stays beside the word its stroke joins it to,
//       its sign a gap in the row, so the hidden sign keeps its place and no
//       word stands with nothing under it; such a cell has no key and no
//       card of its own
''')
rep('''//   A4  a card standing on a run asks each word of it as its own word: its
//       own pointed form, its place's entry, whether its place is a name;
//       and a word of a place set aside opens its own card, gated by its
//       own entry, with no chain at its top
''', '''//   A4  a card standing on a run asks each word of it as its own word: its
//       own pointed form, its place's entry, whether its place is a name;
//       a word of a place set aside opens its own card, gated by its own
//       entry, with no chain at its top; and so does each word of a sign's
//       cell
''')
rep('''    for (const j of s.querySelectorAll(".he-text .wjoin")) cells.push({ label, key: j.__key || null, chain: !!j.__chain, span: !!(j.__run && j.__run.spanKey), n: (j.__words || []).length });
''', '''    for (const j of s.querySelectorAll(".he-text .wjoin")) {
      // a word's own line, kept in the cell undrawn: is it a sign and nothing else
      const own = [...j.querySelectorAll(".wj-ink > .wb")].map((wb) => { const g = wb.querySelector(":scope > .g"); if (!g) return ""; const c = g.cloneNode(true); c.querySelectorAll(".g-lic, .g-pcs-lic").forEach((y) => y.remove()); return c.textContent.replace(/\\s+/g, " ").trim(); });
      cells.push({ label, key: j.__key || null, chain: !!j.__chain, span: !!(j.__run && j.__run.spanKey), n: (j.__words || []).length,
        signs: own.filter((t) => /^(<[^>]*>|\\[[^\\]]*\\]|\\u00bf|~|X|\\u00d7|\\+)$/u.test(t)).length, gaps: j.querySelectorAll(":scope > .g .g-part.gap").length, joinedByStroke: (j.__words || []).slice(0, -1).every((w) => w && w.presentation_join && w.presentation_join.join_next_without_separator) });
    }
''')
rep('''  const stray = rest.cells.filter((c) => !c.span);
  if (stray.length) a1.push(`${stray.length} joined cell(s) that are no place of the span store, first at ${stray[0].label}`);
  if (runFileAsked) a1.push(`the book's run file was asked for ${runFileAsked} time(s) and nothing is laid from it`);
  check("A1  a first visit: the joined words rest as separate words, no chain is one cell, the run file is not asked for", a1.length === 0, a1.length ? few(a1) : `${rest.sections} sections, ${rest.cells.length} joined cells, each a place of the span store`);
''', '''  // a sign's cell: no key of its own, its words joined by the stroke, one of them a sign alone and drawn as a gap, another carrying the reading
  const signCell = (c) => !c.span && !c.chain && !c.key && c.joinedByStroke && c.signs >= 1 && c.signs < c.n && c.gaps === c.signs;
  const stray = rest.cells.filter((c) => !c.span && !signCell(c));
  if (stray.length) a1.push(`${stray.length} joined cell(s) that are neither a place of the span store nor a sign's cell, first at ${stray[0].label} (${stray[0].n} words, ${stray[0].signs} a sign alone, ${stray[0].gaps} gaps drawn)`);
  if (runFileAsked) a1.push(`the book's run file was asked for ${runFileAsked} time(s) and nothing is laid from it`);
  check("A1  a first visit: the joined words rest as separate words, no chain is one cell, the run file is not asked for", a1.length === 0, a1.length ? few(a1) : `${rest.sections} sections, ${rest.cells.filter((c) => c.span).length} cells that are a place of the span store, ${rest.cells.filter(signCell).length} where a sign keeps its place beside its word`);
''')
rep('''  if (aside.length && !own) a4.push("no word of a place set aside could be opened");
  check("A4  a run's card asks each word as its own word, and a word of a place set aside opens its own card under its own entry", a4.length === 0, a4.length ? few(a4) : `${wordsAsked} words of ${asked.length} runs, ${own} words of places set aside`);
''', '''  if (aside.length && !own) a4.push("no word of a place set aside could be opened");
  // (c) each word of a sign's cell opens its own card
  const signs = await page.evaluate(async () => {
    const out = [];
    const cell = [...document.querySelectorAll("section.seg .he-text .wjoin")].find((j) => !j.__key && !j.__chain && !(j.__run && j.__run.spanKey) && j.querySelector(":scope > .g .g-part.gap"));
    if (!cell) return out;
    for (const wb of cell.querySelectorAll(".wj-ink > .wb")) {
      const w = wb.__word, t = wb.querySelector(":scope > .w span") || wb.querySelector(":scope > .w");
      t.scrollIntoView({ block: "center" }); t.click();
      await new Promise((r) => setTimeout(r, 900));
      const h = document.querySelector("#hud");
      out.push({ s: w ? w.s : "", open: !!h && !h.hidden, b: h && !h.hidden ? ((h.querySelector(".head b") || {}).textContent || "").trim() : "", chain: !!(h && h.querySelector(".b-chain")), run: !!(h && /one card for the run/iu.test(h.textContent)) });
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await new Promise((r) => setTimeout(r, 200));
    }
    return out;
  });
  const bare = (x) => String(x).replace(/\\u05be[\\u0591-\\u05c7]*$/u, "");
  for (const c of signs) {
    if (!c.open) { a4.push(`no card opened on ${esc(c.s)} of a sign's cell`); continue; }
    if (c.b !== c.s && c.b !== bare(c.s)) a4.push(`in a sign's cell the card of ${esc(c.s)} is headed ${esc(c.b)}`);
    if (c.chain || c.run) a4.push(`in a sign's cell the card of ${esc(c.s)} is a run's, or carries a chain at its top`);
  }
  if (new Set(signs.map((c) => c.b)).size !== signs.length) a4.push("two words of a sign's cell opened one card");
  check("A4  a run's card asks each word as its own word, and a word of a place set aside opens its own card under its own entry", a4.length === 0, a4.length ? few(a4) : `${wordsAsked} words of ${asked.length} runs, ${own} words of places set aside, ${signs.length} words of a sign's cell`);
''')
open(p, 'w', encoding='utf-8').write(s)
bad = [(i + 1, hex(ord(c))) for i, line in enumerate(s.split('\n')) for c in line if 0x590 <= ord(c) <= 0x5ff]
print('ok; hebrew-block characters:', bad[:3])
