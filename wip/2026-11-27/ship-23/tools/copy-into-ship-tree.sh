#!/bin/bash
# Ship 23: carry the place card from the builder's sandbox (S/s16) into the ship tree (S/s13), both at live main.
# Carries what the page and its checks read: zone.html, place.html, the place answers' tools, and of the data only
# data/place-answers-v1/page/ with PIN.json, sources.json and lines-known-to-differ.tsv. The intermediates
# (entries/, places/, bridges/) hold whole copies of the sources' files and are made again by the one command;
# they stay out (STEP's licence summary: «Please do not post copies of this data file elsewhere»).
# Refuses if the sandbox's zone.html still pins the old card (the meta reader-card line a forced run inserts),
# or if either tree is not at the same commit. Writes a sha256 manifest of everything carried.
set -euo pipefail
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
FROM=$S/s16; TO=${1:-$S/s13}; OUT=${2:-$S/s31w/ship23}
mkdir -p $OUT
[ "$(git -C $FROM rev-parse HEAD)" = "$(git -C $TO rev-parse HEAD)" ] || { echo "REFUSED: the trees are at different commits"; exit 1; }
[ -z "$(git -C $TO status --porcelain)" ] || { echo "REFUSED: the ship tree is not clean"; exit 1; }
if grep -q '<meta name="reader-card"' $FROM/reader/zone.html; then echo "REFUSED: the sandbox's zone.html pins the old card (a forced run's meta line)"; exit 1; fi
cd $FROM
{ git diff --name-only; git ls-files --others --exclude-standard; } | sort -u \
 | grep -v -E '^reader/data/place-answers-v1/(entries|places|bridges)/' > $OUT/carried.txt
# a folder git lists whole is listed by its files
python3 -I - "$OUT/carried.txt" <<'PY'
import sys, os
p=sys.argv[1]; out=[]
for l in open(p).read().split('\n'):
    if not l: continue
    if l.endswith('/'):
        for r,_,fs in os.walk(l):
            for f in fs: out.append(os.path.join(r,f))
    else: out.append(l)
skip=('reader/data/place-answers-v1/entries/','reader/data/place-answers-v1/places/','reader/data/place-answers-v1/bridges/')
out=sorted(x for x in out if not x.startswith(skip))
open(p,'w').write('\n'.join(out)+'\n')
PY
while read -r f; do mkdir -p "$TO/$(dirname "$f")"; cp -p "$f" "$TO/$f"; done < $OUT/carried.txt
cd $TO && xargs -a $OUT/carried.txt sha256sum > $OUT/carried.sha256
(cd $FROM && sha256sum -c --quiet $OUT/carried.sha256) && echo "carried $(wc -l < $OUT/carried.txt) files, each equal to the sandbox's"
du -sh $TO/reader/data/place-answers-v1
