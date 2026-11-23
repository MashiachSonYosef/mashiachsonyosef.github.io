#!/usr/bin/env python3
"""The store cut of 22 November 2026: PIPELINE.md says where a file it names on the lane's store stands now.
Usage: python3 patch-pipeline-doc-after-cut.py <reader dir>"""
import sys
from pathlib import Path
p = Path(sys.argv[1]) / "PIPELINE.md"
t = p.read_text(encoding="utf-8")
old = """> and which tool wrote which bins. The sections below are kept as the record
> of why the rules are what they are.
"""
new = """> and which tool wrote which bins. The sections below are kept as the record
> of why the rules are what they are.
>
> Since 23 November 2026 the corpus lane's store keeps its text files
> compressed (its store cut of 22 November). A file this document says stays
> on the lane's store, and every other store address a pin or record here
> names, now stands as the same address with `.gz` after it, or as a member
> of a part, or (16 superseded files) in this repository or on the lane's own
> disk: `data/store-path-map-v1.json`, its section `after_the_cut`, says
> which, from the lane's two lists kept in `data/store-path-map/`, every file
> held to the bytes its list names. The round reads no store address: its
> inputs are local copies held to the bytes their pins name, and no pin or
> record is rewritten for the move.
"""
assert t.count(old) == 1, t.count(old)
p.write_text(t.replace(old, new), encoding="utf-8")
print("patched", p)
