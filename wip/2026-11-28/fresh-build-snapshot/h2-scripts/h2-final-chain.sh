#!/usr/bin/env bash
# Scratch (builder H2): the final runs on the final code, one browser at a time, in turn; each step's log says when it ended
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; L=$S/s46w/logs; cd $S/s46w/scripts
node h2-suite.mjs $S/s16/reader $L/suite-69.txt $L/suite-frame-rest-final --timeout 900 > $L/suite-frame-rest-final.log 2>&1
node h2-suite.mjs $S/s16/reader $L/frame-compspan.txt $L/suite-frame-compspan-rest-final --timeout 1500 > $L/suite-frame-compspan-rest-final.log 2>&1
node h2-walk.mjs $S/s16 $L/walk-frame-final.json ruth:1-4 genesis:1-5 exodus:20 numbers:7 deuteronomy:5 joshua:21 judges:20 i-samuel:17 ii-samuel:7 ii-kings:6 isaiah:9 jeremiah:3 ezekiel:6 amos:7 psalms:44 psalms:68 psalms:119 proverbs:22 job:38 daniel:2 nehemiah:7 ii-chronicles:34 > $L/walk-frame-final.log 2>&1; echo "walk exit $?" >> $L/walk-frame-final.log
node h2-f6.mjs $S/s16 $L/resting-among-pills.tsv $L/f6-141-final.json > $L/f6-141-final.log 2>&1; echo "f6 exit $?" >> $L/f6-141-final.log
node h2-press.mjs $S/s16 $L/press-words-2.json $L/press-frame-final.json > $L/press-frame-final.log 2>&1; echo "press exit $?" >> $L/press-frame-final.log
node h2-shot.mjs $S/s16 $S/s46w/shots-frame $L/shot-jobs-frame-retake.json > $L/shots-frame-retake.log 2>&1; echo "shots exit $?" >> $L/shots-frame-retake.log
bash h2-swap.sh older > $L/suite-frame-forced-final.swap.log 2>&1; grep -c 'name="reader-card"' $S/s16/reader/zone.html >> $L/suite-frame-forced-final.swap.log
node h2-suite.mjs $S/s16/reader $L/suite-69.txt $L/suite-frame-forced-final --timeout 900 > $L/suite-frame-forced-final.log 2>&1
node h2-suite.mjs $S/s16/reader $L/frame-compspan.txt $L/suite-frame-compspan-forced-final --timeout 1500 > $L/suite-frame-compspan-forced-final.log 2>&1
bash h2-swap.sh after >> $L/suite-frame-forced-final.swap.log 2>&1; echo "meta lines after: $(grep -c 'name="reader-card"' $S/s16/reader/zone.html)" >> $L/suite-frame-forced-final.swap.log
echo "chain done" >> $L/suite-frame-forced-final.swap.log
