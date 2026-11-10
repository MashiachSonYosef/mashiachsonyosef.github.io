#!/bin/bash
# 10 November: the sign ruling's divisions and the years on the store; regloss every served zone and commentary zone, re-project the 39 sidecars, finish
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
rm -f $S/v26/regloss/*.bin $S/v26/proj/zones/*.bin $S/v26/proj/sidecars/*.bin $S/v26/regloss-comm/*.bin
$S/v26/regloss-bake.sh
tail -1 $S/v26/regloss/all.log; grep -v " 0$" $S/v26/regloss/all.log | grep -v DONE
python3 -I $S/v26/regloss-compare.py > $S/v26/regloss-compare.txt 2>&1
head -24 $S/v26/regloss-compare.txt
for f in $S/v26/regloss/*.bin; do cp $f $S/pt/reader/data/zones/$(basename $f); done
$S/v26/regloss-comm.sh
tail -1 $S/v26/regloss-comm/all.log; grep -v " 0$" $S/v26/regloss-comm/all.log | grep -v DONE
python3 -I $S/v26/comm-compare.py > $S/v26/comm-compare.txt 2>&1; head -12 $S/v26/comm-compare.txt
for f in $S/v26/regloss-comm/*.bin; do cp $f $S/pt/reader/data/zones/$(basename $f); done
$S/v26/reproj.sh
tail -1 $S/v26/proj/all.log; grep -v " 0$" $S/v26/proj/all.log | grep -v DONE
python3 -I $S/v26/leaders-diff.py $S > $S/v26/leaders-diff.txt 2>&1; head -1 $S/v26/leaders-diff.txt
$S/v26/finish.sh > $S/v26/finish.log 2>&1; echo "FINISH-EXIT $?"; tail -5 $S/v26/finish.log
echo PIPELINE-DONE
