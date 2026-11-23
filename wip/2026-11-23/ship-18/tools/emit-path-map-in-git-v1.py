#!/usr/bin/env python3
"""The store cut in the path map, corrected (23 November 2026): the files that left the store and were named as kept on
the corpus lane's disk alone are also in git, on the lane's corpus-staging branch.

The section after_the_cut of reader/data/store-path-map-v1.json was written by
wip/2026-11-23/store-move/tools/emit-path-map-after-cut-v1.py from the lane's lists and the check of every file. Seven
of the sixteen files that left the store were named there on_the_corpus_lane_disk_only. The corpus lane corrected it
on 23 November 2026: all seven are also in git on corpus-staging, under corpus-lane-builds/moses-coverage-trial-v1/
(the three files of jastrow-word-senses-v1/) and corpus-lane-builds/moses-read-words-v1/ (the four of read-words-v1/).
So each such entry keeps its disk path and says where git holds the same file: the lane's folder of the build under
<the Tabernacle> is the folder git holds it in, on that branch. The rule that names where a file that left the store
stands says so too, and the section names the correction. Nothing else moves. Run again, it writes nothing.

Usage: python3 -I emit-path-map-in-git-v1.py <reader dir>
"""
import json, sys
from pathlib import Path

R = Path(sys.argv[1])
mp = R / "data" / "store-path-map-v1.json"
raw = mp.read_text(encoding="utf-8")
m = json.loads(raw)
lay = lambda o: json.dumps(o, ensure_ascii=False, indent=1) + "\n"
assert lay(m) == raw, "the map's layout is not the one this script writes"
a = m["after_the_cut"]
BRANCH = "corpus-staging"
ROOT = "<the Tabernacle>/"
# the corpus lane's correction names these two folders, and the files under each
FOLDERS = {"corpus-lane-builds/moses-coverage-trial-v1/": "jastrow-word-senses-v1/", "corpus-lane-builds/moses-read-words-v1/": "read-words-v1/"}
OLD_RULE = "an address of the also-held list that leaves the store (16, superseded) stands in this repository or on the corpus lane's disk, named below"
NEW_RULE = ("an address of the also-held list that leaves the store (16, superseded) stands in this repository, or on the corpus "
            "lane's disk and in git on its corpus-staging branch at the same path under the lane's folder of builds, named below")
moved = 0
for addr, e in a["left_the_store"].items():
    disk = e.get("on_the_corpus_lane_disk_only")
    if disk is None:
        continue
    assert disk.startswith(ROOT), disk
    path = disk[len(ROOT):]
    folder = next((f for f in FOLDERS if path.startswith(f + FOLDERS[f])), None)
    assert folder, f"{addr}: {path} is under no folder the corpus lane's correction names"
    a["left_the_store"][addr] = {"on_the_corpus_lane_disk": disk, "in_git": {"branch": BRANCH, "path": path}}
    moved += 1
got = [k for k, e in a["left_the_store"].items() if "in_git" in e]
assert len(got) == 7 and all("on_the_corpus_lane_disk_only" not in e for e in a["left_the_store"].values()), (len(got), "seven entries are corrected, and none says the disk alone")
by = {f: sum(1 for k in got if a["left_the_store"][k]["in_git"]["path"].startswith(f)) for f in FOLDERS}
assert by == {"corpus-lane-builds/moses-coverage-trial-v1/": 3, "corpus-lane-builds/moses-read-words-v1/": 4}, by
if OLD_RULE in a["rule"]:
    a["rule"][a["rule"].index(OLD_RULE)] = NEW_RULE
assert NEW_RULE in a["rule"]
a["corrected"] = {
    "on": "2026-11-23",
    "by": "the corpus lane",
    "what": ("the seven files this section named as kept on the corpus lane's disk alone are also in git, on its corpus-staging "
             "branch: the three of jastrow-word-senses-v1/ under corpus-lane-builds/moses-coverage-trial-v1/, the four of "
             "read-words-v1/ under corpus-lane-builds/moses-read-words-v1/. Each keeps its disk path and names its path in git"),
    "entries": 7,
}
out = lay(m)
if out != raw:
    mp.write_text(out, encoding="utf-8")
    print(f"written {mp.name} · {moved} entries of after_the_cut.left_the_store say where git holds them ({', '.join(f'{f} {n}' for f, n in by.items())})")
else:
    print(f"{mp.name} says it already: nothing to write")
