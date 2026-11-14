# zone.html, after edit 97: the place's set stands on top while the card stands on the set's own division (the set
# whole or any block of it), and not on the whole form or another division, where the rule of 20 September stands
# as it did: the set is not a reading of the form as one word. Refused unless its text stands exactly once.
# python3 -I 97b-the-set-stands-on-top-on-its-own-division.py <reader dir>
import os, sys
path = os.path.join(sys.argv[1], "zone.html")
s = open(path, encoding="utf-8").read()
old = """        // stays on top (core-block-rule-v1, the owner, 14 November 2026): on a
        // block of the set's division the set is said whole above the block's own
        // readings, as what the source reads at this place, never as one of them.
        const hit = setCut ? { g: spanJoin(placeSet.text), s: word.pg[0].s }
"""
new = """        // stays on top (core-block-rule-v1, the owner, 14 November 2026): on the
        // set's own division, a block of it pressed as much as the set whole, the
        // set is said whole above the readings, as what the source reads at this
        // place, never as one of them; on the whole form and on any other
        // division it is not said, as before.
        const hit = setCut ? (cover === setCut ? { g: spanJoin(placeSet.text), s: word.pg[0].s } : null)
"""
if s.count(old) != 1: sys.exit("not found")
open(path, "w", encoding="utf-8").write(s.replace(old, new))
print("zone.html: 1 edit")
