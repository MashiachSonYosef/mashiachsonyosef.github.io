import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new)
bs = chr(92)
old = '''        signs: own.filter((t) => /^(<[^>]*>|''' + bs + '''[[^''' + bs + ''']]*''' + bs + ''']|''' + bs + '''u00bf|~|X|''' + bs + '''u00d7|''' + bs + '''+)$/u.test(t)).length, gaps: j.querySelectorAll(":scope > .g .g-part.gap").length,'''
assert s.count(old) == 1, s.count(old)
new = '''        // a word whose every piece is a sign; and of those, the ones that are one sign, which the row draws as a gap
        signs: own.filter((t) => t && t.split(" + ").every(isSign)).length, oneSign: own.filter((t) => isSign(t)).length, gaps: j.querySelectorAll(":scope > .g .g-part.gap").length,'''
s = s.replace(old, new)
rep('''const read = (keys) => page.evaluate((keys) => {
  const cells = [];
''', '''const read = (keys) => page.evaluate((keys) => {
  const cells = [];
  const isSign = (t) => /^(<[^>]*>|''' + bs + '''[[^''' + bs + ''']]*''' + bs + ''']|''' + bs + '''u00bf|~|X|''' + bs + '''u00d7|''' + bs + '''+)$/u.test(String(t).trim());
''')
rep('''  const signCell = (c) => !c.span && !c.chain && !c.key && c.joinedByStroke && c.signs >= 1 && c.signs < c.n && c.gaps === c.signs;
''', '''  const signCell = (c) => !c.span && !c.chain && !c.key && c.joinedByStroke && c.signs >= 1 && c.signs < c.n && c.gaps === c.oneSign;
''')
rep('''(${stray[0].n} words, ${stray[0].signs} a sign alone, ${stray[0].gaps} gaps drawn)`);''', '''(${stray[0].n} words, ${stray[0].signs} all signs, ${stray[0].oneSign} one sign, ${stray[0].gaps} gaps drawn)`);''')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
