# zone.html and build-toggle-design-v1.mjs: the frames' pill says «framed», not «gold frames» (the owner, 14 November
# 2026, of the label held for this update: "maybe just "framed" no gold"). The reset pill's tooltip names it as the
# pill does ("framed off"); the switches page says "the frames". The address flag ?blobs=, the stored choice
# (fh.blobs) and the code's own names stay. Each edit is refused unless its text stands exactly once.
# python3 -I 119-the-pill-says-framed.py <reader dir>
import os, sys
R = sys.argv[1]
def edit(rel, pairs):
    p = os.path.join(R, rel); s = open(p, encoding="utf-8").read()
    for old, new in pairs:
        n = s.count(old)
        if n != 1: sys.exit(f"{rel}: expected one of {old[:90]!r}, found {n}")
        s = s.replace(old, new)
    open(p, "w", encoding="utf-8").write(s); print(f"{rel}: {len(pairs)} edits")
edit("zone.html", [
    ("""         "gold frames" (the owner, 2026-11-14: "oh gold frame is a good wording
         lets use that on the pill over blob"); the address flag ?blobs= and the
         choice kept on the device keep their names. -->
    <span class="mode-pick"><button type="button" class="blob-btn on" id="blobPill" aria-pressed="true" aria-describedby="blobState">gold frames</button>""",
     """         "framed" (the owner, 2026-11-14: "oh gold frame is a good wording
         lets use that on the pill over blob", and then "maybe just "framed" no
         gold"); the address flag ?blobs= and the choice kept on the device keep
         their names. -->
    <span class="mode-pick"><button type="button" class="blob-btn on" id="blobPill" aria-pressed="true" aria-describedby="blobState">framed</button>"""),
    ("""title="the switches back to their default (English off, gold frames off, card numbering on,""",
     """title="the switches back to their default (English off, framed off, card numbering on,"""),
])
edit("tools/build-toggle-design-v1.mjs", [
    ("""?blobs=runs</a> draws the gold frames on runs alone, as before 10 October;""",
     """?blobs=runs</a> draws the frames on runs alone, as before 10 October;"""),
])
