import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:90])
    s = s.replace(old, new)
rep('''          held: box ? Number(box.dataset.kindWithheld || 0) : 0, at: sec ? [sec.id, [...sec.querySelectorAll(".he-text .wb")].indexOf(wb)] : null };''',
    '''          held: box ? Number(box.dataset.kindWithheld || 0) : 0, at: sec ? [sec.id, [...sec.querySelectorAll(".he-text .wb")].indexOf(wb)] : null,
          // whether the word pressed stands in a joined cell (a chain's, a place's), as the page draws it
          joined: !!(wb && wb.closest(".wjoin")) };''')
rep('''    if (WSA && C.at && A.at && A.at[0] === C.at[0] && A.at[1] === C.at[1] && own && C.place === own) {
      const la = ((a.states.default || {})[C.at[0]] || [])[C.at[1]] || null;
      if (la && la[4]) {
        const oldK''', '''    if (WSA && C.at && A.at && A.at[0] === C.at[0] && A.at[1] === C.at[1] && own && C.place === own) {
      // (read from the card's own word, as the old page drew it: a chapter page's first cards may stand in a verse
      // whose lines this page's sample does not read)
      if (A.joined) {
        const oldK''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
