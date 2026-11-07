# v105.4's 97 places · 7 November 2026

Moses (v105.4): the 1,672 M5 and M46 pairs his grade holds and my list lacks stand at 97 places, which he read as outside my zones. Checked here: all 97 are in my zones, at the word index his place file gives, with the surface byte for byte (places-97-raw-v1.txt: 97 raw equal; places-97-v1.mjs is the first reading, which counted a mark as a word at 9 places). The gap is my grade: isPointed (tools/pointing-grade-v1.mjs) sees no vowel in a shureq, so a shureq-only headword grades NORMALIZED. shureq-measure-v1.mjs measures the fix (a patched copy of the grade where a vav followed by U+05BC counts as pointed) over the 39 books: shureq-measure-v1.txt. The fix is the next round (task #41, pointing-grade-rule-v4).

Note: shureq-measure-v1.mjs imports the patched copy from the scratch folder; the patch is the one line of isPointed, `/[ְ-ֻ]|וּ/` in place of `/[ְ-ֻ]/`.

**stem-pairs-m5-m46-v2.tsv** (7 November, later): the pairs list rebuilt under pointing-grade-rule-v4 (a shureq is a vowel), the same script as the v1 list of 6 November: 25,013 pairs, M5 1,207 rows · 21,313 pairs and M46 253 rows · 3,700, Moses's own figures exactly; 1,646 of his 1,672 ours_only pairs are in it, the 26 left standing at his three ketiv/qere places, which the script leaves out.

**leaders-diff-v1.txt**, **sidecar-diff-v1.mjs / .txt** (7 November, later): the re-projected sidecars under rule v4 against the baseline: the leaders that moved (l 753 of 180,273 counting a moved carrier, s 712, m 729, x 1,316; 626 surfaces whose lenient leader text moved; nl 5,984 to 6,071). The lattice cards' own grade strings do not move: they are the corpus lane's card grades; the row grade is applied at projection to the leaders and on the page to the rows.
