# Ship 23, third edit (found by the suite): the door's title card opened on its readings only where the title had a
# gloss (defOpen), and the gloss is now read at the title's place, so a title the first verse does not hold (Daniel)
# opened on no readings. The card's opening keeps its old ground, the store's own readings of the title's key; only
# the gloss printed under the title is read at its place. Usage: python3 -I ship23-edits-3.py <tree root>
import sys, pathlib
p = pathlib.Path(sys.argv[1]) / "reader/tools/build-front-door-v1.mjs"
s = p.read_text(encoding="utf-8")
old = "defOpen: !!(titleKey && titleGloss),"
assert s.count(old) == 1
s = s.replace(old, "defOpen: !!(titleKey && (STORE.glossFor(titleKey).text || \"\")),")
p.write_text(s, encoding="utf-8")
print("edit applied")
