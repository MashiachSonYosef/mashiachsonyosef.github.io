#!/bin/bash
# Ship 20 (23 November 2026) on a reader tree at main 7f6c862105, or main with ship 19, in order:
#   1. the inputs: every file a pin will name is the bytes its relay's letter names (v213, v219, v220);
#   2. the tools: the names gate's lists read in one place (tools/name-lists-v1.mjs, new); the name rows' tool, the
#      projection and the names check taught the lists of rows beside names v2's and the addition to the places
#      (patches 20-01 to 20-03); the spelling bridge's reading, tool and check taught bridge v1.2 (patches 20-04 to
#      20-06); the document (patch 20-07);
#   3. the pins: the names pin takes relay v213's list of name rows, relay v219's addition to names v1's places and its
#      list of the translation tables' name rows (not M51's, whose lines have not landed); the spelling bridge's pin
#      takes bridge v1.2 (relay v220) in place of v1.1 as the list laid from, and the class held for STEP's «}+» tag
#      goes, its 42 places counted under the holds of call 4 they stand under;
#   4. the store: the name rows laid, then the sense openings and UBS's collocations (the category derived again dry,
#      the bytes its pin names), then every store step once more, dry: nothing left to write;
#   5. the spelling bridge laid again from v1.2: no piece moves, each zone's record names v1.2's list; then the
#      bridge check's laws that open no page.
# The places' addition is laid on the words by the round's projection (tools/project-lattice-v12-v1.mjs), which the
# round runs after this. A step whose work the tree carries already is said and passed; over a tree that carries all of
# it this writes nothing. It stops at the first fault and says where.
# Usage: apply-20.sh <reader dir> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; W=${2:?log dir}; mkdir -p $W; L=$W/apply.log
T=$S/s29w/tools
V213=$S/dl-v213-data/v2/ledgers/all/names/names-landed-v1
V219=$S/dl-v219-data/v2/ledgers/all/names/places-at-bridge-v1
V220=$S/dl-v220-data/v2/ledgers/all/spelling-bridge/bridge-v1.2
AT=2026-11-23T20:00:
DAY=2026-11-23
. $S/s21w/env.sh
cd $R || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
# run <what> <command...>: the command, its words into the log and its last line said; it stops here on a fault
run() { local what=$1; shift; "$@" > $W/step.out 2>&1; local c=$?; cat $W/step.out >> $L; tail -1 $W/step.out | cut -c1-300 | sed 's/^/  /' | tee -a $L; [ $c = 0 ] || stop "$what"; }
store() { python3 -c "import json;i=json.load(open('data/route-store/index.json'));print(i['store_version'], i['counts']['routes'], 'routes', i['counts']['keys'], 'keys')"; }

say "ship 20 on $R ($(git -C "$R" rev-parse --short=10 HEAD 2>/dev/null || echo 'not a git tree'))"
say "the inputs: each file the bytes its relay's letter names"
n=0
while read -r sha size f; do
  [ -f "$f" ] || stop "$f is not here"
  [ "$(stat -c %s "$f")" = "$size" ] && [ "$(sha256sum "$f" | cut -c1-64)" = "$sha" ] || stop "$f is not the bytes its letter names"
  n=$((n + 1))
done <<EOF
abe6dc8ffea453476b07dd761407f591893791dc82bacccdfe31a0fdf3e8537f 10931 $V213/RULE.md
72a97546c5254a7a7b5b63f6eee076998a5665c6f68de6acb0b0ff2613e013d3 51081 $V213/receipt-v1.json
d1a246c3b0de6388b2ddd6c31e8f531087752c3b67c07ea4a6189c9279a9eaaa 4255 $V213/name-rows-landed-v1.jsonl
87fe763095e99470abad0cb938e2c5d0b46b781d459047f7b6991503da6c34aa 21127 $V219/RULE.md
93fdb08dafd354e1936dc3fe821e107e445ee7262acc19e19557ccb546714f3c 51666 $V219/receipt-v1.json
7a389ecc7330f796f851a8a0798842dbe0de70911255503a0b4b66aa52101583 5261 $V219/places-v1.1-additions.jsonl
aee9144291a1a6669b4628b07ee717e6f865ed641a3a0ce32fa420c8ee628330 1367 $V219/name-rows-tables-v1.jsonl
f0ccd566bf9ce9b311ccceed87785e4b0a8e0c6fbbe1b4e10f9036597e0399dd 13696 $V220/RULE.md
e2c15ed6aa7749d663d132ffb3880054d9ecdca67be2592c4b91e66c2b5eafa3 105892 $V220/receipt-v1.2.json
873c4df5ff14bb5ac2cc055d206dc3fdf49adc55405c8ecda53e9564a77d97aa 2234102 $V220/bridge-places-v1.2.jsonl
e74cd12858bec068c9b9e5f59e01cca691c273e3e3cf716a73559dd6fbd51f59 23385 $V220/changes-v1.2.jsonl
EOF
echo "  $n files, each its size and sha256 (v213 3, v219 4, v220 4)" | tee -a $L
say "the store before: $(store)"

say "the tools"
if cmp -s $T/name-lists-v1.mjs tools/name-lists-v1.mjs; then echo "  tools/name-lists-v1.mjs: stands already" | tee -a $L
else cp $T/name-lists-v1.mjs tools/name-lists-v1.mjs && echo "  tools/name-lists-v1.mjs: written" | tee -a $L; fi
for p in 01-name-rows 02-projection 03-names-check 04-bridge-reading 05-bridge-tool 06-bridge-check 07-document; do
  run "patch 20-$p" python3 -I $T/patch-20-$p.py .
done
for f in name-lists-v1 apply-name-rows-v1 project-lattice-v12-v1 check-names-gate-v1 spelling-bridge-v1 apply-spelling-bridge-v1 check-spelling-bridge-v1 check-same-product-v1; do
  node --check tools/$f.mjs >> $L 2>&1 || stop "syntax of $f"
done
echo "  8 tools parse" | tee -a $L

say "the pins"
run "the names pin" python3 -I $T/pin-names-20.py $R $V213 $V219
run "the spelling bridge's pin" python3 -I $T/pin-bridge-v1.2.py $R $V220
node --input-type=module -e '
import { readFileSync } from "node:fs";
import { nameRowLists, namePlaces } from "./tools/name-lists-v1.mjs";
const pin = JSON.parse(readFileSync("data/names/PIN.json", "utf8"));
const lists = nameRowLists("data/names", pin), p = namePlaces("data/names", pin);
console.log(`  the names pin read: ${lists.map((L) => `relay ${L.relay} ${L.lines.length} rows`).join(", ")} · places ${p.v1.length} of names v1, laid with relay ${p.addition.relay}'"'"'s addition ${p.laid.length} (${p.added} added, ${p.witnessAdded} witnesses added; ${p.laid.filter((l) => l.by.includes("tahot")).length} with TAHOT)`);
' 2>&1 | tee -a $L; [ ${PIPESTATUS[0]} = 0 ] || stop "the names pin, read"

say "the store"
bash $T/store-steps-20.sh $R $AT $W || stop "the store steps"

say "the spelling bridge, laid again from v1.2 (no piece moves; each zone's record names v1.2)"
node tools/apply-spelling-bridge-v1.mjs --stamp $DAY > $W/bridge.log 2>&1 || { grep -E "^FAIL" $W/bridge.log | head -5 | cut -c1-400 | tee -a $L; stop "the spelling bridge"; }
grep -E "^[0-9,]+ places listed|^  pieces:|^wrote|^nothing to write" $W/bridge.log | cut -c1-200 | sed 's/^/  /' | tee -a $L
node tools/apply-spelling-bridge-v1.mjs --stamp $DAY > $W/bridge-again.log 2>&1 || stop "the spelling bridge, again"
grep -q "^nothing to write" $W/bridge-again.log || stop "the spelling bridge, laid again, would write"
echo "  laid again: nothing to write" | tee -a $L
node tools/check-spelling-bridge-v1.mjs --node > $W/check-bridge-node.log 2>&1
grep -E "^(  ok|FAIL)" $W/check-bridge-node.log | cut -c1-200 | tee -a $L
grep -q "^FAIL" $W/check-bridge-node.log && stop "the spelling bridge's check (its laws that open no page)"
say "APPLIED · store $(store)"
