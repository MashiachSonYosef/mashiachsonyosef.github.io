#!/usr/bin/env python3
# Ship 11c, after its suite: the two faults the suite found.
# 1. tools/derive-landings-v1.mjs wrote the maqaf as a glyph in a string literal (check-nothing-hand-typed-v1): written
#    as its code point.
# 2. data/rule-demonstrations-v1.json named Amos 9:6 as a verse with a word of no card (check-demonstrations-v1 L8). The
#    landings give that word a card. The address is now Amos 6:3, whose fourth word has none; the count is the shelf's
#    as measured on this tree (1,829 words in 36 of the 39 books; the record's 1,623 in 39 was typed on 3 September and
#    live stood at 1,897 in 37); Amos 3:11's note says what stands there (one of its thirteen words).
# Usage: patch-after-the-suite.py <reader dir>. Checks first, writes nothing if any check fails; a second run is a no-op.
import sys, io
R = sys.argv[1]
def sub(path, pairs):
    t = io.open(path, encoding="utf-8", newline="").read()
    done = all(new in t and old not in t for old, new in pairs)
    if done: print("already patched:", path); return
    for old, new in pairs:
        if t.count(old) != 1: sys.exit("REFUSED: %s holds %d of %r" % (path, t.count(old), old[:60]))
    for old, new in pairs: t = t.replace(old, new)
    io.open(path, "w", encoding="utf-8", newline="").write(t); print("patched:", path)
MAQAF = "־"
sub(R + "/tools/derive-landings-v1.mjs", [('const MAQAF = "' + MAQAF + '";', 'const MAQAF = "\\u05BE";')])
sub(R + "/data/rule-demonstrations-v1.json", [
    ('          "sites": 1623,\n          "books": 39,\n', '          "sites": 1829,\n          "books": 36,\n'),
    ('"note": "two of the fourteen words in this verse have no reading; the card says', '"note": "one of the thirteen words in this verse has no reading; the card says'),
    ('              "book": "amos",\n              "label": "9:6"\n', '              "book": "amos",\n              "label": "6:3"\n'),
])
