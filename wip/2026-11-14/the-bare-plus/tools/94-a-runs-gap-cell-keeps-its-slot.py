# zone.html: a hidden sign's gap keeps its slot in a maqaf run's cell as it does among a line's pieces (the owner,
# 16 October 2026: nothing left out; 14 November 2026: keep the gap, drop the joiner). The run's own cells take
# min-width 0 so a long reading can wrap inside its cell (2026-10-31), and that rule, the more particular, held the
# gap's cell to nothing: 0px wide on the old page and the new. While the joiner stood beside it, the "+" marked the
# spot; with the joiner gone the gap's cell must hold its slot itself. Refused unless its text stands exactly once.
# python3 -I 94-a-runs-gap-cell-keeps-its-slot.py <reader dir>
import os, sys
path = os.path.join(sys.argv[1], "zone.html")
s = open(path, encoding="utf-8").read()
old = "  .g-pp.at-gap, .g-sep.at-gap { display: none; }   /* and no joiner beside it (2026-11-14) */\n"
new = old + ("  /* and a run's cell keeps that place too: the run's own cells take min-width 0 so a long reading wraps inside\n"
             "     its cell, which held a gap's cell to nothing; with no joiner beside it to mark the spot, it holds its slot */\n"
             "  .wjoin > .g.parts .g-part.gap { min-width: 0.55em; }\n")
n = s.count(old)
if n != 1: sys.exit(f"expected one at-gap rule, found {n}")
open(path, "w", encoding="utf-8").write(s.replace(old, new))
print("zone.html: 1 edit")
