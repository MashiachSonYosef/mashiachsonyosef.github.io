#!/usr/bin/env python3
"""Ship 15, patch 02: STEP's letters may stand on a row whose list lands them.

check-entry-gate-v1 E2 held STEP's letters (t) to the rows of the first parting's sources (TAHOT, TBESH). With relay
v211 English Wiktionary's list lands t too, read from TBESH's own columns, so a row of a source whose list of the pin
lands t may carry them; every other law on a lettered tag (each a letter of a number the row carries) stands. The
entries tool's own words on lists say the same.

Usage: python3 patch-02-entry-gate-letters-on-a-list.py <reader dir>
"""
import sys
from pathlib import Path

R = Path(sys.argv[1])


def edit(rel, pairs):
    p = R / rel
    t = p.read_text(encoding="utf-8")
    for old, new in pairs:
        assert t.count(old) == 1, (rel, t.count(old), old[:80])
        t = t.replace(old, new)
    p.write_text(t, encoding="utf-8")
    print("patched", rel)


edit("tools/check-entry-gate-v1.mjs", [
    ("""//       none empty; n a list of Strong's numbers with no repeat; t a list of
//       lettered tags, each of a number in n, on a row of the first
//       parting's sources only; b a list of entries, on a row of the second
""", """//       none empty; n a list of Strong's numbers with no repeat; t a list of
//       lettered tags, each of a number in n, on a row of the first
//       parting's sources, or of a source whose list of the pin lands t
//       (relay v211: English Wiktionary's, its letters read from TBESH's own
//       columns, 22 November 2026); b a list of entries, on a row of the second
"""),
    ("""          if (FACT_OF.get(m) !== "t") faults.push(`${where}: STEP's letters on a row of a source the parting does not read`);""",
     """          if (FACT_OF.get(m) !== "t" && !(((LIST_M.get(m) || {}).facts) || []).includes("t")) faults.push(`${where}: STEP's letters on a row of a source neither the parting reads nor a list of the pin lands them on`);"""),
])

edit("tools/apply-row-entries-v1.mjs", [
    ("""// entry names. Of a list's facts only those its pin entry lands (facts) are written: the numbers (n), which the gate
// itself reads. STEP's letters and BDB's own entries are the two partings of ruling 6, which names the sources whose
// rows they read; on a joined row they are counted (facts_not_landed) and not written. A row of a list's source
""", """// entry names. Of a list's facts only those its pin entry lands (facts) are written: the numbers (n), which the gate
// itself reads, and, where the pin entry says so, STEP's letters (t: English Wiktionary's list since relay v211, whose
// letters TBESH's own columns tie so that none holds back a letter of the same word). STEP's letters and BDB's own
// entries are the two partings of ruling 6; a fact a list gives and its pin entry does not land is counted
// (facts_not_landed) and not written. A row of a list's source
"""),
])
