#!/usr/bin/env python3
# The one line of a repository check that holds the old count of finding 9, amended to follow the mend.
#
#   usage: python3 patch-check-kinds.py <reader dir>
#
# tools/check-dictionary-kinds-v1.mjs, law K4 "the rail's line counts as off only the reader's own switches":
# its arithmetic held the line's "N off" to the number of ledger ids in the reader's set of sources off. On a
# fresh load that set holds one id (MSAM2, resting off by the record of defaults) whose source stands in the block
# of dictionaries shut at rest and draws no chip on the strip, so the law required "13 dictionaries, 1 off" over a
# fold saying "13 sources, all on": the very line finding 9 reports. With patch.py applied the line counts the
# strip's chips, and this law goes red until its arithmetic counts them too. Two exact replacements, each once.
import sys

EDITS = [
    # the page's state, as the check reads it: and how many chips of the strip stand switched off
    ('''          railText: tok ? tok.textContent : null, railTitle: tok ? tok.title : null,
''', '''          railText: tok ? tok.textContent : null, railTitle: tok ? tok.title : null,
          // the chips of the strip a reader sees switched off, which the rail's line counts (21 November 2026: it
          // counted ledger ids, and said one off at rest for a source that draws no chip on the strip)
          stripOff: document.querySelectorAll("#sourcesRow .src-row.off").length,
'''),
    ('''s3.railText !== null && Number(offN || 0) === s3.off.length && ''',
     '''s3.railText !== null && Number(offN || 0) === s3.stripOff && '''),
]


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: python3 patch-check-kinds.py <reader dir>")
    path = sys.argv[1].rstrip("/") + "/tools/check-dictionary-kinds-v1.mjs"
    with open(path, encoding="utf-8", newline="") as f:
        text = f.read()
    for old, new in EDITS:
        assert text.count(old) == 1, "an old string does not stand exactly once: %r" % old[:70]
    for old, new in EDITS:
        text = text.replace(old, new)
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)
    print("patched %s: %d replacements" % (path, len(EDITS)))


if __name__ == "__main__":
    main()
