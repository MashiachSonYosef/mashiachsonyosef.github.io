import sys
from pathlib import Path
S = Path(sys.argv[1])
t = (S / "commit.txt.in").read_text(encoding="utf-8")
u8 = ("- check-rulings-under-sources-v1 U8 held that a reading across two words, the hyphen at the end of the first only, which a source reads at one word and not the other, keeps the line as it rests at both. "
      "Where the source's line reads both words by the list (UBS's «Bath-Rabbim» at Song of Songs 7:5, «Pahath-Moab»), that is no reading in part, and the law went red on this tree. "
      "It now owes such a pair one line over both words, the unit's own, or both words as they rest where the page holds the unit back; a pair read in part owes what it did. "
      "Under UBS 131 of the 164 pairs of the kind are units by the list. Read in Nehemiah under UBS: 1 held as it rests, 6 under one line.\n")
anchor = "- tools/round-v1.sh holds the spans' node laws with the default picks'; PIPELINE.md says where the spans come from.\n"
assert t.count(anchor) == 1
t = t.replace(anchor, u8 + anchor)
gate = ("THE ROUND, THE GATE AND THE SUITE\n\n"
        "- The round was run from the start on this page. Its record of the lines at rest, set against live: no entry moves in 40 works. "
        "The page's engine file is cut again from the page (reader/engine-52af171151ef.js, in place of reader/engine-4d2d464a131b.js) and the 1,272 pages that load it name it.\n"
        "- The gate, live (ship 13) against this tree, with the standing expectations: 30,945 lines compared on 18 pages under every switch both carry, 0 differ; "
        "26 moved as owed, all under UBS pressed: 20 to a unit's one line («Beth-» «-lehem» to «Bethlehem» in Ruth 1), 6 to the line as it rests where the unit's words stand apart. "
        "54 cards compared, none differing.")
suite = ("- The suite: 199 checks, 196 clean on the whole run. Two of the three that were not were known before this ship: check-reading-rows-v1 R1 (the small phone's rows, red on live too) "
         "and check-nothing-unlanded-v1 (it passes once pushed). The third was this ship's own, law U8 of check-rulings-under-sources-v1, mended as above in the check alone: "
         "the page and every built file stand as the round left them (the pipeline's manifest written again comes to the same bytes), the check run again alone holds its eleven laws, "
         "and the eight checks that read the tools' own text hold.")
assert t.count("@@GATE@@\n\n@@SUITE@@") == 1
t = t.replace("@@GATE@@\n\n@@SUITE@@", gate + "\n" + suite)
t = t.rstrip("\n") + "\n"
assert "@@" not in t
(S / "commit.txt").write_text(t, encoding="utf-8")
print(len(t.splitlines()), "lines")
