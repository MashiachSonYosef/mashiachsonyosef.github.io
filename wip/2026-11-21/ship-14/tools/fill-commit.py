import sys
from pathlib import Path
S = Path(sys.argv[1])
t = (S / "commit.txt.in").read_text(encoding="utf-8")


def rep(old, new):
    global t
    assert t.count(old) == 1, (t.count(old), old[:70])
    t = t.replace(old, new)


rep("@@REST@@", "no line under a word moves")
rep("- check-dictionary-kinds-v1 K4 held the panel's line to the ledger ids off, the very line the fault reports. It now counts the chips a reader sees off.\n",
    "- check-dictionary-kinds-v1 K4 held the panel's line to the ledger ids off, the very line the fault reports. It now counts the chips a reader sees off.\n"
    "- check-same-product-v1 (the gate) learned in ship 10b that a unit's one line is owed where the older build printed its words apart. Live prints that line too now, nothing moves, and such a word fell through to an older law that held it to the line as it rests: 8 lines called not as owed with 0 lines differing. The line standing on both builds, at every word of the unit under the source's credit, is owed as it stands.\n"
    "- The new load check asks the served run indexes for a book both list; check-scope-derived-v1 forbids a check naming a work by a zone's path or by a slug of the plan, and that law stands as it was.\n")
gate = ("THE ROUND, THE GATE AND THE SUITE\n\n"
        "- The round was run from the start on this page. Its record of the lines at rest, set against live: no entry moves. "
        "The page's engine file is cut again from the page (reader/engine-64a4725e3cf3.js, in place of reader/engine-52af171151ef.js) and the 1,272 pages that load it name it.\n"
        "- The gate, live (ship 10b) against this tree, with the standing expectations: 30,945 lines compared on 18 pages under every switch both carry, 0 differ and none moved; "
        "26 stand as a unit's one line on both builds. 54 cards compared, none differing. Its first run was red for the gate's own reason, above; the gate alone was mended and run again.")
suite = ("- The suite: 204 checks, 202 clean. The two that are not were known before this ship: check-reading-rows-v1 R1 (the small phone's rows, red on live too, the same nine) "
         "and check-nothing-unlanded-v1 (it passes once pushed). The suite ran after the gate's mend, on the tree as shipped.")
rep("@@GATE@@\n\n@@SUITE@@", gate + "\n" + suite)
t = t.rstrip("\n") + "\n"
assert "@@" not in t
(S / "commit.txt").write_text(t, encoding="utf-8")
print(len(t.splitlines()), "lines")
