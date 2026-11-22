#!/bin/bash
# Ship 17 (22 November 2026): each law of check-spelling-bridge-v1 that ship 17 changed or added is made to fail once,
# by a deliberate fault on the tree, and the fault is undone at once, the files put back byte for byte from copies
# taken before. Run on a tree apply-17.sh has laid. Usage: tests-17.sh <reader dir> <log dir> [B5]
#   B1  a laid piece's part as v1.1 writes it, whose marks off no longer give v1's English (list and pin made to agree)
#   B3  pieces laid by hand at a place held within its class (a «}+» place; a place call 4 holds; a place where call 4 makes STEP's reading stand)
#   B4  a laid place marked in the index as one where STEP's reading stands, with words other than its pieces
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
part() { python3 -I - "$LIST" "$PIN" "$1" "$2" "$3" <<'PY'
import sys, hashlib, io
lst, pin, old, new, tail = sys.argv[1:6]
b = open(lst, "rb").read()
for o, n in [(f'"english_tahot_as_written":"{old}"', f'"english_tahot_as_written":"{new}"'), (f'"{old}{tail}"', f'"{new}{tail}"')]:
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

echo "-- B1: Isaiah 56:10 word 1, piece 1 «watchmen» written «watchman», its column too" | tee -a $L
keep $LIST $PIN; part "watchmen" "watchman" "/ its" | tee -a $L
node tools/check-spelling-bridge-v1.mjs --node > $W/t-b1.log 2>&1; law B1 $W/t-b1.log
back $LIST $PIN

echo "-- B6: the same piece written «[watchmen]», its column too (the marks off still give v1's «watchmen»)" | tee -a $L
keep $LIST $PIN; part "watchmen" "[watchmen]" "/ its" | tee -a $L
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

echo "-- B3: pieces laid by hand at Amos 1:10 word 6, a place where call 4 makes STEP's reading stand" | tee -a $L
keep data/zones/amos.bin
node $T/exp-lay.mjs "$R" "$R/$LIST" amos 1:10:6 | sed 's/^/  /' | tee -a $L
node tools/check-spelling-bridge-v1.mjs --node > $W/t-b3-stands.log 2>&1; law B3 $W/t-b3-stands.log
back data/zones/amos.bin

echo "-- B4: Genesis 13:3 word 12, a laid place, marked in the index as one where STEP's reading stands, with words «tent/ her»" | tee -a $L
keep $IX
python3 -I - $IX data/zones/genesis.bin <<'PY2'
import json, sys, gzip
p = sys.argv[1]; ix = json.load(open(p, encoding="utf-8"))
z = json.loads(gzip.open(sys.argv[2]).read())
n = 0
for s in z["sections"]:
    if s.get("label") == "13:3":
        plain = [i for i, w in enumerate(s["words"]) if not w.get("mark")]
        n += plain[11] + 1; break
    n += len(s.get("words") or [])
rows = ix["books"]["genesis"]["step_words"]
mine = [r for r in rows if r[0] == n]
if mine: mine[0][1:] = ["tent/ her", 1]
else: rows.append([n, "tent/ her", 1])
json.dump(ix, open(p, "w", encoding="utf-8"), ensure_ascii=False)
print(f"  the index now marks Genesis place {n} as standing, STEP's words «tent/ her»")
PY2
node tools/check-spelling-bridge-v1.mjs --node > $W/t-b4.log 2>&1; law B4 $W/t-b4.log
if [ "$3" = B5 ]; then node tools/check-spelling-bridge-v1.mjs > $W/t-b5.log 2>&1; law B5 $W/t-b5.log; fi
back $IX
echo "== done · $(date -u +%T)" | tee -a $L
