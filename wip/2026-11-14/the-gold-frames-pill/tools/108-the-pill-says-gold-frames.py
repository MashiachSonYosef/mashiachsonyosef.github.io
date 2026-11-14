# zone.html and build-toggle-design-v1.mjs: the blob pill says «gold frames» (the owner, 14 November 2026: "oh gold
# frame is a good wording lets use that on the pill over blob"). Only the words a reader sees change: the pill's
# label, the reset pill's tooltip, and the switches page's sentence on ?blobs=runs. The address flag, the stored
# choice (fh.blobs) and the code's own names stay, so no bookmark or kept choice is lost.
# Each edit is refused unless its text stands exactly once.
# python3 -I 108-the-pill-says-gold-frames.py <reader dir>
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
    ("""    <!-- THE BLOB PILL (the owner, 2026-10-16: "just do it as a nice pill like
         the english reader toggle ... this one can sit live ... on off"): one
         pill beside the readers, on or off, kept on this device. -->
    <span class="mode-pick"><button type="button" class="blob-btn on" id="blobPill" aria-pressed="true" aria-describedby="blobState">blobs</button>""",
     """    <!-- THE BLOB PILL (the owner, 2026-10-16: "just do it as a nice pill like
         the english reader toggle ... this one can sit live ... on off"): one
         pill beside the readers, on or off, kept on this device. It says
         "gold frames" (the owner, 2026-11-14: "oh gold frame is a good wording
         lets use that on the pill over blob"); the address flag ?blobs= and the
         choice kept on the device keep their names. -->
    <span class="mode-pick"><button type="button" class="blob-btn on" id="blobPill" aria-pressed="true" aria-describedby="blobState">gold frames</button>"""),
    ("""title="the switches back to their default (English off, blobs off, card numbering on,""",
     """title="the switches back to their default (English off, gold frames off, card numbering on,"""),
])
edit("tools/build-toggle-design-v1.mjs", [
    ("""?blobs=runs</a> draws the blobs on runs alone, as before 10 October;""",
     """?blobs=runs</a> draws the gold frames on runs alone, as before 10 October;"""),
])
