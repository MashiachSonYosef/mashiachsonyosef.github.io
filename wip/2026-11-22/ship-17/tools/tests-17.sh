#!/bin/bash
# Ship 17 (22 November 2026): each law of check-spelling-bridge-v1 that ship 17 changed or added is made to fail once,
# by a deliberate fault on the tree, and the fault is undone at once, the files put back byte for byte from copies
# taken before. Run on a tree apply-17.sh has laid. Usage: tests-17.sh <reader dir> <log dir> [B5]
#   B1  a laid piece's part as v1.1 writes it, whose marks off no longer give v1's English (list and pin made to agree)
#   B3  pieces laid by hand at a place held within its class (a «}+» place; a place call 4 holds)
#   B4  STEP's words at a place where its reading stands, made other than the place's pieces
#   B6  a laid piece's part as v1.1 writes it, whose marks off still give v1's English, other than the zone's words
#   B5  (with B5, on a tree the page can read) as B4, on the page
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; W=${2:?log dir}; mkdir -p "$W"; L=$W/tests.log; T=$S/s22w/tools
cd "$R" || exit 1
LIST=data/spelling-bridge/bridge-v1.1/bridge-places-v1.1.jsonl; PIN=data/spelling-bridge/PIN.json; IX=data/default-picks/index.json
keep() { mkdir -p $W/kept; for f in "$@"; do cp -p "$f" "$W/kept/$(echo $f | tr / _)"; done; }
back() { for f in "$@"; do cp -p "$W/kept/$(echo $f | tr / _)" "$f"; cmp -s "$f" "$W/kept/$(echo $f | tr / _)" || { echo "NOT PUT BACK: $f" | tee -a $L; exit 1; }; done; echo "  put back, byte for byte: $*" | tee -a $L; }
law() { grep -E "^(FAIL|  ok)  $1 " "$2" | sed -E "s/^(.{6}$1).*  ·  /\1 ·· /" | cut -c1-420 | tee -a $L; }
# rewrite a piece's part and its column in the list, and the pin's figures for the list to agree
part() { python3 -I - "$LIST" "$PIN" "$1" "$2" <<'PY'
import sys, hashlib, io
lst, pin, old, new = sys.argv[1:5]
b = open(lst, "rb").read()
for o, n in [(f'"english_tahot_as_written":"{old}"', f'"english_tahot_as_written":"{new}"'), (f'"{old}/ them"', f'"{new}/ them"')]:
    o, n = o.encode(), n.encode()
    assert b.count(o) == 1, (o, b.count(o)); b = b.replace(o, n)
p = io.open(pin, encoding="utf-8").read()
was = hashlib.sha256(open(lst, "rb").read()).hexdigest(); wasn = len(open(lst, "rb").read())
assert p.count(was) == 1 and p.count(f'"bytes": {wasn}') == 1
p = p.replace(was, hashlib.sha256(b).hexdigest()).replace(f'"bytes": {wasn}', f'"bytes": {len(b)}')
open(lst, "wb").write(b); io.open(pin, "w", encoding="utf-8").write(p)
print("  the list and the pin now carry «%s» for «%s»" % (new, old))
PY
}
echo "== tests of ship 17's laws on $R · $(date -u +%T)" | tee $L

echo "-- B1: Genesis 35:5 word 8, piece 1 «[were] around» written «[were] round», its column too" | tee -a $L
keep $LIST $PIN; part "[were] around" "[were] round" | tee -a $L
node tools/check-spelling-bridge-v1.mjs --node > $W/t-b1.log 2>&1; law B1 $W/t-b1.log
back $LIST $PIN

echo "-- B6: the same piece written «[were] [around]», its column too (the marks off still give v1's «were around»)" | tee -a $L
keep $LIST $PIN; part "[were] around" "[were] [around]" | tee -a $L
node tools/check-spelling-bridge-v1.mjs --node > $W/t-b6.log 2>&1; law B6 $W/t-b6.log; law B2 $W/t-b6.log
back $LIST $PIN

echo "-- B3: pieces laid by hand at Numbers 2:12 word 10, a «}+» place the pin holds" | tee -a $L
keep data/zones/numbers.bin
node $T/exp-lay.mjs "$R" "$R/$LIST" numbers 2:12:10 | sed 's/^/  /' | tee -a $L
node tools/check-spelling-bridge-v1.mjs --node > $W/t-b3.log 2>&1; law B3 $W/t-b3.log
back data/zones/numbers.bin

echo "-- B3: pieces laid by hand at Psalms 44:15 word 6, a place call 4 holds as it rests (STEP's words «not | peoples»)" | tee -a $L
keep data/zones/psalms.bin
node $T/exp-lay.mjs "$R" "$R/$LIST" psalms 44:15:6 | sed 's/^/  /' | tee -a $L
node tools/check-spelling-bridge-v1.mjs --node > $W/t-b3-call4.log 2>&1; law B3 $W/t-b3-call4.log
back data/zones/psalms.bin

echo "-- B4: STEP's words at Genesis 8:20 word 8 (its reading stands there) made «<the>/ pure»" | tee -a $L
keep $IX
python3 -I - $IX <<'PY'
import json, sys
p = sys.argv[1]; ix = json.load(open(p, encoding="utf-8"))
rows = [r for r in ix["books"]["genesis"]["step_words"] if r[0] == 2955 and r[2:3] == [1]]
assert len(rows) == 1 and rows[0][1] == "<the>/ clean", rows
rows[0][1] = "<the>/ pure"
json.dump(ix, open(p, "w", encoding="utf-8"), ensure_ascii=False)
print("  the index now has STEP's words «<the>/ pure» at Genesis place 2955")
PY
node tools/check-spelling-bridge-v1.mjs --node > $W/t-b4.log 2>&1; law B4 $W/t-b4.log
if [ "$3" = B5 ]; then node tools/check-spelling-bridge-v1.mjs > $W/t-b5.log 2>&1; law B5 $W/t-b5.log; fi
back $IX
echo "== done · $(date -u +%T)" | tee -a $L
