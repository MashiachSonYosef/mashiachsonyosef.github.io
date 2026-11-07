# v105.4's 97 places · 7 November 2026

Moses (v105.4): the 1,672 M5 and M46 pairs his grade holds and my list lacks stand at 97 places, which he read as outside my zones. Checked here: all 97 are in my zones, at the word index his place file gives, with the surface byte for byte (places-97-raw-v1.txt: 97 raw equal; places-97-v1.mjs is the first reading, which counted a mark as a word at 9 places). The gap is my grade: isPointed (tools/pointing-grade-v1.mjs) sees no vowel in a shureq, so a shureq-only headword grades NORMALIZED. shureq-measure-v1.mjs measures the fix (a patched copy of the grade where a vav followed by U+05BC counts as pointed) over the 39 books: shureq-measure-v1.txt. The fix is the next round (task #41, pointing-grade-rule-v4).

Note: shureq-measure-v1.mjs imports the patched copy from the scratch folder; the patch is the one line of isPointed, `/[ְ-ֻ]|וּ/` in place of `/[ְ-ֻ]/`.
