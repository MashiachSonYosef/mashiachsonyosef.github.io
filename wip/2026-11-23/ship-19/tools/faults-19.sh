#!/bin/bash
# Ship 19 (23 November 2026): each law ship 19 changes in check-entry-gate-v1 fails once by a deliberate fault, then the
# fault is undone and the pin is the same bytes as before. The faults are made in the pin only (and, for the list
# beside, a copy of v211's list with its first two rows changing places, named in place of v211's own):
#   A  E2: the other list's entry no longer lands b (facts n only), while its rows carry b: b on a row of a source no
#      parting reads and no list of the pin lands it on
#   B  E16: the list beside English Wiktionary's names its first two rows out of order: a line of the list beside names
#      another row than the list's line at the same place
#   C  E16: the list beside is named under another relay than the index's record names
# Usage: faults-19.sh <reader dir> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; W=${2:?log dir}; mkdir -p $W
. $S/s28w/env.sh
cd $R || exit 1
PIN=data/row-entries/PIN.json
cp $PIN $W/PIN.json.kept; KEPT=$(sha256sum $PIN | cut -c1-64)
SWAPPED=$S/s28w/work/faults/facts-slot-t-v1.1-swapped.tsv
undo() { cp $W/PIN.json.kept $PIN; [ "$(sha256sum $PIN | cut -c1-64)" = "$KEPT" ] || { echo "THE PIN WAS NOT PUT BACK"; exit 1; }; }
trap undo EXIT
edit() { python3 -I - $PIN "$@" <<'EOF'
import sys, json, hashlib
path, what = sys.argv[1], sys.argv[2]
p = json.load(open(path, encoding="utf-8"))
w = [l for l in p["lists"] if l["name"] == "English Wiktionary"][0]
c = [l for l in p["lists"] if l["name"] == "Classical Hebrew Words and Hebrew Wiktionary"][0]
if what == "A": c["facts"] = ["n"]
if what == "B":
    b = open(sys.argv[3], "rb").read()
    w["facts_from"]["t"]["list"]["sha256"] = hashlib.sha256(b).hexdigest(); w["facts_from"]["t"]["list"]["bytes"] = len(b)
if what == "C": w["facts_from"]["t"]["relay"] = "v203"
open(path, "w", encoding="utf-8").write(json.dumps(p, ensure_ascii=False, indent=1) + "\n")
EOF
}
for f in A B C; do
  if [ $f = B ]; then edit B $SWAPPED; LISTS="$S/dl-v218-data/v2/ledgers/all/entry-ledger/lists-v1.1/facts-slot-wiktionary-v1.1.tsv:$SWAPPED"; else edit $f; LISTS=$ROW_ENTRIES_LISTS; fi
  ROW_ENTRIES_LISTS=$LISTS timeout 3000 node tools/check-entry-gate-v1.mjs > $W/fault-$f.log 2>&1; code=$?
  undo
  echo "fault $f: exit $code"; grep -E "^FAIL" $W/fault-$f.log | cut -c1-420
done
echo "the pin put back: $(sha256sum $PIN | cut -c1-16) (kept $(echo $KEPT | cut -c1-16))"
