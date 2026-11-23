#!/usr/bin/env python3
# Ship 20 (23 November 2026): the document says what ship 20 lays: the names' more lists and the places' addition, and bridge v1.2
# A patch of exact replacements on PIPELINE.md: each old text occurs once and its new text not at all, and is replaced; a
# replacement whose new text stands once and whose old text is gone is said and passed, so over a file that carries the
# patch it writes nothing. Anything else is refused and nothing is written.
# Usage: python3 -I <this> <reader dir>
import os, sys
P = os.path.join(sys.argv[1], 'PIPELINE.md')
PAIRS = [
    ("> mark, and the list of name places is still names v1's; the pin gives each\n> its own folder, rule and receipt). The round's projection writes on each word the entry that\n> stands at its place and whether the place is a name. The reader asks both\n",
     "> mark, and the list of name places is still names v1's; the pin gives each\n> its own folder, rule and receipt. Since 23 November 2026 (ship 20) the\n> rows the lane marks by the same rule in lists of their own are marked\n> beside names v2's: relay v213's, the 22 rows relays v200 and v202\n> landed, and relay v219's, 6 rows of the translation tables, each list\n> with its own rule and receipt and the way its lines find their row; and\n> the list of places read is names v1's with relay v219's addition laid\n> on it, Ezekiel 27:6 word 11 added and TAHOT a witness at 6 more places,\n> names v1's file kept as it is: `tools/name-lists-v1.mjs`). The round's projection writes on each word the entry that\n> stands at its place and whether the place is a name. The reader asks both\n"),
    ("> English; at the 206 each form row's part is v1.1's part byte for byte, so\n> nothing laid there moves. The lattice reads STEP under the Leningrad\n> spelling and gives these places nothing, so the line there was whatever row\n",
     "> English; at the 206 each form row's part is v1.1's part byte for byte, so\n> nothing laid there moves. Since 23 November (ship 20) the list laid from\n> is bridge v1.2 (relay v220), v1.1's lines with STEP's «{…}+» tags read as\n> STEP's key says, read only where each of its lines, its added fields taken\n> off and the changes it names set back, is v1.1's line; no laid place is\n> among the 43 it mends, so nothing laid moves. The lattice reads STEP under the Leningrad\n> spelling and gives these places nothing, so the line there was whatever row\n"),
    ("> everywhere else. The pin says which of the list's kinds are laid and why\n> each of the others is not; the places whose pieces carry STEP's «}+» tag\n> wait for bridge v1.2 (relay v218), the places that are pairs keep a pair's\n> line, and two kinds wait on call 4 of relay v189, read where call 4 itself\n",
     "> everywhere else. The pin says which of the list's kinds are laid and why\n> each of the others is not; the places that are pairs keep a pair's\n> line, and two kinds wait on call 4 of relay v189, read where call 4 itself\n"),
    ("> line, on its card and across words, until the page lane says how such a\n> place is drawn. The rule's id and the pin's shape keep their\n> versions (22 November 2026): no rule of the house asks either to move when a\n",
     "> line, on its card and across words, until the page lane says how such a\n> place is drawn (the owner ruled on 23 November 2026, «steps is fine»: STEP's\n> reading governs there). The 42 places of new pieces held for STEP's «}+»\n> tag until bridge v1.2 stand under these two holds now: 40 that call 4\n> holds as they rest, 2 where STEP's reading stands. The rule's id and the pin's shape keep their\n> versions (22 November 2026): no rule of the house asks either to move when a\n"),
]
s = open(P, encoding="utf-8").read()
todo = stood = 0
for o, n in PAIRS:
    if s.count(o) == 1 and s.count(n) == 0: todo += 1
    elif s.count(o) == 0 and s.count(n) == 1: stood += 1
    else: sys.exit(f"REFUSED · PIPELINE.md: a replacement's old text occurs {s.count(o)} times and its new text {s.count(n)}; nothing written ({o[:70]!r})")
if not todo:
    print(f"stands already · PIPELINE.md ({stood} of {len(PAIRS)} replacements carried)"); sys.exit(0)
for o, n in PAIRS:
    if s.count(o) == 1 and s.count(n) == 0: s = s.replace(o, n)
open(P, "w", encoding="utf-8").write(s)
print(f"patched · PIPELINE.md ({todo} of {len(PAIRS)} replacements made{f', {stood} carried already' if stood else ''})")
