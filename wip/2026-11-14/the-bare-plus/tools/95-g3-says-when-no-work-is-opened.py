# check-sign-gap-joiner-v1, G3: where no work's recording holds all three shapes, no page is opened, and the line
# says so in words instead of printing an empty list. Refused unless its text stands exactly once.
# python3 -I 95-g3-says-when-no-work-is-opened.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
old = "  g3.notOff.length ? `the signs switch was not off: ${first(g3.notOff)}`\n"
new = ("  !g3.opened.length ? \"no work's recording holds all three shapes of a gap, so no page was opened\"\n"
       "    : g3.notOff.length ? `the signs switch was not off: ${first(g3.notOff)}`\n")
if s.count(old) != 1: sys.exit(f"expected one, found {s.count(old)}")
open(p, "w", encoding="utf-8").write(s.replace(old, new))
print("check-sign-gap-joiner-v1.mjs: 1 edit")
