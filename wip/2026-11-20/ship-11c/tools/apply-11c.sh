#!/bin/bash
# Ship 11c on a reader tree, in order: the tools, the pin with the lane's three lists, each list derived and landed
# in its turn, the entries laid again, then the checks nearest the landings.
# Usage: apply-11c.sh <reader dir> <moment prefix, as 2026-11-21T01:00:0> <log dir>   (the landings take :01 to :03, the store steps :10 to :16)
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; AT=${2:?moment prefix}; W=${3:?log dir}; mkdir -p $W; L=$W/apply.log
. $S/s12w/env.sh
cd $R || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
say "tools"
python3 $S/s13w/patch-strike-rows-facts.py tools/strike-rows-v1.mjs >> $L 2>&1 || stop "the strike tool's facts"
python3 $S/s13w/patch-entries-landed.py tools/apply-row-entries-v1.mjs >> $L 2>&1 || stop "the entries tool's landed rows"
python3 $S/s13w/patch-check-entry-gate-landed.py tools/check-entry-gate-v1.mjs >> $L 2>&1 || stop "the entry gate check's landed rows"
python3 $S/s13w/patch-landed-twin.py tools/apply-row-entries-v1.mjs tools/check-entry-gate-v1.mjs >> $L 2>&1 || stop "the landed twin"
cp $S/s13w/derive-landings-v1.mjs $S/s13w/check-landings-v1.mjs tools/ || stop "the new tools"
python3 $S/s13w/patch-strike-rule-v8.py tools >> $L 2>&1 || stop "the rule's version 8"
python3 $S/s13w/patch-second-road-back.py tools >> $L 2>&1 || stop "the second road's landed rows"
for f in strike-rows-v1 apply-row-entries-v1 check-entry-gate-v1 derive-landings-v1 check-landings-v1 check-audit-calls-v1 check-fold-strike-landing-v1 check-store-continuity-v1 check-words-back-v1 made-spaces-second-road-v1 apply-made-spaces-v1 check-made-spaces-v1; do node --check tools/$f.mjs >> $L 2>&1 || stop "syntax of $f"; done
say "the pin, and each list derived and landed in its turn"
python3 -I $S/s13w/make-landings-pin.py $S $R '{}' >> $L 2>&1 || stop "the pin"
LAND_AT=$AT LAND_LOGS=$W bash $S/s13w/rehearse-landings.sh $R >> $L 2>&1; tail -1 $L | grep -q "^REHEARSED" || stop "the landings"
bash $S/s13w/store-steps-11c.sh $R ${AT%0} $W || stop "the store steps"
say "the checks nearest the landings"
for c in check-landings-v1 check-words-back-v1 check-store-continuity-v1 check-fold-strike-landing-v1 check-made-spaces-v1 check-sense-openings-v1 check-own-pointing-v1 check-ledger-divisions-v1 check-names-gate-v1 check-dictionary-kinds-v1; do
  node tools/$c.mjs > $W/$c.log 2>&1; echo "  $c exit $?" | tee -a $L
done
node tools/check-entry-gate-v1.mjs --ledger $ROW_ENTRIES_LEDGER --list $ROW_ENTRIES_LISTS > $W/check-entry-gate-v1.log 2>&1; echo "  check-entry-gate-v1 exit $?" | tee -a $L
say "APPLIED"
