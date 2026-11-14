# zone.html: a run's line is let down to fit its column (fitRunLine, 2026-10-23) when its children stand in more
# than one row. A joiner beside a hidden sign's gap is not drawn since 14 November 2026, and an element that is not
# drawn reads a rectangle whose top is 0: counted, it made a second row of every run that holds a gap, and every
# such run was let down to four fifths of its size (Amos 1:3, «Gilead» under the object marker's run, 8.24px where
# its neighbors stand at 10.56px). A child that is not drawn now stands in no row.
# Refused unless its text stands exactly once.
# python3 -I 92-a-joiner-not-drawn-stands-in-no-row.py <reader dir>
import os, sys
path = os.path.join(sys.argv[1], "zone.html")
s = open(path, encoding="utf-8").read()
old = "    const fits = () => { const tops = new Set(); for (const c of line.children) tops.add(Math.round(c.getBoundingClientRect().top)); return tops.size <= 1 && line.scrollWidth <= colW + 1; };\n"
new = ("    // a child the line does not draw (a joiner beside a hidden sign's gap, 2026-11-14) stands in no row: its\n"
       "    // rectangle reads a top of 0, and counted it let every run that holds a gap down to four fifths\n"
       "    const fits = () => { const tops = new Set(); for (const c of line.children) if (c.getClientRects().length) tops.add(Math.round(c.getBoundingClientRect().top)); return tops.size <= 1 && line.scrollWidth <= colW + 1; };\n")
n = s.count(old)
if n != 1: sys.exit(f"expected one fits line, found {n}")
open(path, "w", encoding="utf-8").write(s.replace(old, new))
print("zone.html: 1 edit")
