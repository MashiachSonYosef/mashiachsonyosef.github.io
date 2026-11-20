import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
old = '''  .wjoin > .g.parts .g-sep { color: var(--tekhelet-dim); align-self: flex-start; }
'''
new = '''  /* A PART THAT PRINTS ITS PLACE'S PIECES IS AS WIDE AS THEY ARE, as a single
     word's line is (.he-text > .wb > .g:has(> .g-pcs), below). The pieces
     stand on one line and do not wrap, so held to a cell's width they ran
     past their own part and were cut at its edge (the owner's drawing of 19
     November 2026 at Isaiah 2:9, «anc» for «and»: 27 rows of Isaiah, every
     one a joined cell's). The row still wraps at the cell and never passes
     the page (its own cap, above); a part ruled to a long reading keeps the
     cell's width. */
  .wjoin > .g.parts .g-part:has(> .g-pcs) { max-width: none; }
''' + old
assert s.count(old) == 1
s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
