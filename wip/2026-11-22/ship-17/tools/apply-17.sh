#!/bin/bash
# Ship 17 (22 November 2026): the spelling bridge's pieces at the other places of new pieces (relay v214, bridge v1.1),
# on a reader tree at main b0f147b6b0 or at that with ship 16, in order, stopping at the first fault and saying where:
#   1. the inputs: v1.1's files, each the bytes relay v214's letter names
#   2. v1.1's rule, receipt and list kept in data/spelling-bridge/bridge-v1.1/, byte for byte (as ship 11d kept v1's)
#   3. the tools: the one reading, the laying tool, the check (patches 17-01 to 17-03), the words of the round, the
#      gate and PIPELINE.md (17-04); each parses
#   4. the pin, made from the list (every count recounted, every sha256 read off the file and held to the letter's)
#   5. the laying: the tool proves everything first and lays; run again, it writes nothing
#   6. what is laid, by class and book; the 206 against v1.1 on their zones; the check's laws that open no page
# Run again on a tree that holds it, each step says it stands and nothing moves.
# Usage: apply-17.sh <reader dir> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; W=${2:?log dir}
mkdir -p "$W" || exit 1; W=$(cd "$W" && pwd); L=$W/apply.log
T=$S/s22w/tools
D=$S/dl-v214-data/v2/ledgers/all/spelling-bridge/bridge-v1.1
LETTER=$S/dl-letters-v210-v217/v2/letters/moses-spelling-bridge-v1/FOR-ELIJAH-v214.md
STAMP=2026-11-22
cd "$R" || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
say "ship 17 on $R ($(git -C "$R" rev-parse --short=10 HEAD 2>/dev/null || echo 'not a git tree'))"

say "the inputs: each the bytes relay v214's letter names"
[ -f "$LETTER" ] || stop "the letter of relay v214 is not at $LETTER"
for x in "c30ff06a56b0e5c25f7a8b77475a080973ce9c7949a0a4c4146f61000e4c8f13 RULE.md" "7143e17fb073e97b90f1217f15c4312252139cb6fb92645ffc975f0a3af75616 receipt-v1.1.json" \
  "9a0dc88362101a3400fc1bd886f35606f3d230a34277cde3b3f1e64bdf134460 bridge-places-v1.1.jsonl"; do
  set -- $x
  [ "$(sha256sum "$D/$2" | cut -c1-64)" = "$1" ] || stop "$D/$2 is not the bytes the letter names"
  grep -qF -- "- bridge-v1.1/$2: " "$LETTER" && grep -F -- "- bridge-v1.1/$2: " "$LETTER" | grep -qF "sha256 $1" || stop "the letter does not name $2 as $1"
done
echo "  3 files kept, each its sha256 as the letter names it (the pin holds the other 8 of the folder to the letter too)" | tee -a $L

say "v1.1 kept in data/spelling-bridge/bridge-v1.1/"
mkdir -p data/spelling-bridge/bridge-v1.1 || stop "the folder"
for f in RULE.md receipt-v1.1.json bridge-places-v1.1.jsonl; do
  if [ -f data/spelling-bridge/bridge-v1.1/$f ]; then cmp -s "$D/$f" data/spelling-bridge/bridge-v1.1/$f || stop "data/spelling-bridge/bridge-v1.1/$f stands, and is not the lane's bytes"; echo "  $f: stands already" | tee -a $L
  else cp "$D/$f" data/spelling-bridge/bridge-v1.1/$f && cmp -s "$D/$f" data/spelling-bridge/bridge-v1.1/$f || stop "copying $f"; echo "  $f: kept" | tee -a $L; fi
done

say "the tools"
for p in patch-17-01-reading patch-17-02-apply patch-17-03-check patch-17-04-docs; do
  python3 -I $T/$p.py "$R" 2>&1 | tee -a $L | sed 's/^/  /'; [ ${PIPESTATUS[0]} = 0 ] || stop "$p"
done
for f in spelling-bridge-v1 apply-spelling-bridge-v1 check-spelling-bridge-v1 check-same-product-v1; do node --check tools/$f.mjs >> $L 2>&1 || stop "the syntax of tools/$f.mjs"; done
bash -n tools/round-v1.sh >> $L 2>&1 || stop "the syntax of tools/round-v1.sh"
echo "  4 tools parse, and the round" | tee -a $L

say "the pin"
python3 -I $T/make-pin-17.py "$R" "$D" "$LETTER" 2>&1 | tee -a $L | sed 's/^/  /'; [ ${PIPESTATUS[0]} = 0 ] || stop "the pin"

say "the laying (the tool proves the pins, the receipts, v1.1 against v1 and every laid place first)"
node tools/apply-spelling-bridge-v1.mjs --stamp $STAMP --list > $W/lay.log 2>&1 || { grep -E "^FAIL|faults?" $W/lay.log | head -5 | cut -c1-400 | tee -a $L; stop "the laying"; }
grep -E "^[0-9,]+ places listed|^  pieces:|^nothing to write" $W/lay.log | cut -c1-400 | tee -a $L
echo "  $(grep -c '^wrote ' $W/lay.log) zone(s) written" | tee -a $L
node tools/apply-spelling-bridge-v1.mjs --stamp $STAMP > $W/lay-again.log 2>&1 || stop "the laying, run again"
grep -q "^nothing to write" $W/lay-again.log || stop "the laying, run again, would write"
echo "  run again: $(grep -E '^  pieces:' $W/lay-again.log | sed 's/^ *//') · $(tail -1 $W/lay-again.log)" | tee -a $L

say "what is laid; the 206 against v1.1"
node $T/summary-17.mjs "$R" "$W" 2>&1 | tee -a $L | sed 's/^/  /'; [ ${PIPESTATUS[0]} = 0 ] || stop "the summary"

say "the check's laws that open no page"
node tools/check-spelling-bridge-v1.mjs --node > $W/check-node.log 2>&1
grep -E "^(  ok|FAIL)  B" $W/check-node.log | cut -c1-300 | sed 's/^/  /' | tee -a $L
for b in B1 B2 B3 B6; do grep -qE "^  ok +$b " $W/check-node.log || stop "check-spelling-bridge-v1 $b (see $W/check-node.log)"; done
if grep -qE "^  ok +B4 " $W/check-node.log; then echo "  B4 ok" | tee -a $L
else echo "  B4 waits for the round: the record of the lines at rest is the tree's as it was, and its faults are the lines that move ($(grep '^FAIL  B4' $W/check-node.log | sed -E 's/.*  ·  ([0-9]+) · .*/\1/') of them)" | tee -a $L; fi
say "APPLIED"
