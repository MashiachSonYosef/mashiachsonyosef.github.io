# Ship 11a: UBS's collocation rows derived again on the store with names v2. The category holds no name row
# (ubs-collocations-rule-v1), and names v2 marks three rows of it that relay v188 landed and names v1 never read.
# The pin's made_here names the bytes the derive now writes; the note says when and why.
import json, sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:70])
    t = t.replace(old, new)
rep('"bytes": 689389', '"bytes": 688859')
rep('694d3fcd096b31dc6420cd44733dfc41a11e43057c78da6888fe9068d1f074c1', 'a334f5791196f93a7c3d406910ed6865013dbd8f92cf60631dedbd17aedfdb2d')
rep('"lines": 2649', '"lines": 2646')
rep('2,649 rows on 764 keys, 2,643 of them with places; derived on the store ccec4fa3071b and kept beside this pin', '2,646 rows on 762 keys, 2,643 of them with places; derived on the store 15909b6c523c (names v2, 20 November 2026) and kept beside this pin')
rep('"bytes": 3879', '"bytes": 3966')
rep('8bca4d34d7d7dad96472c6964b7bb8aaf516de52c08e145c83ad44fe5e666334', '1c4201a2e7619e45f9112a2ba487781fbeb6849628fa1315a30bbb0bad6f0c80')
rep('the category (2,649 rows on 764 keys) and the rows not of it by class (425 name rows, 47 also a plain meaning)', 'the category (2,646 rows on 762 keys) and the rows not of it by class (428 name rows, 47 also a plain meaning)')
rep('followed from 4d1357b26ca5 through 2 rounds, none of which moved a row they name', 'followed from 4d1357b26ca5 through 3 rounds, none of which moved a row they name')
ADD = " DERIVED AGAIN ON 20 NOVEMBER 2026 (ship 11): names v2 (relay v198) reads the rows relay v188 landed, which names v1 did not, and marks three rows of the category as names (the UBS dictionary's own part of speech says name: \u00abJehoram\u00bb, \u00abJehosheba\u00bb and \u00abBeersheba\u00bb). A name row is not of the category, so the list is 2,646 rows on 762 keys, 428 name rows are not of it, and the three rows lose the facts; no pick named any of the three. The figures above this sentence are the first derivation's, on the combined ship's store."
TAIL = "its list replaces the derived one under the same apply tool"
assert t.count(TAIL + '"') == 1, t.count(TAIL + '"')
t = t.replace(TAIL + '"', TAIL + "." + ADD + '"')
json.loads(t)
open(p, 'w', encoding='utf-8').write(t)
print('pin patched')
