#!/usr/bin/env bash
# Scratch (builder H2): spoil the module for each law named, run the one-place check, keep its failing lines, restore.
set -u
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; R=$S/s16/reader; LOG=$1; shift
cp $R/tools/place-card-v1.mjs $S/s46w/h2-clean-card.mjs
for law in "$@"; do
  cp $S/s46w/h2-clean-card.mjs $R/tools/place-card-v1.mjs
  python3 -I $S/s46w/scripts/h2-spoil.py $R/tools/place-card-v1.mjs $law >> $LOG
  (cd $R && node tools/check-place-card-one-place-v1.mjs 2>&1 | grep -E "^FAIL|failing$" | cut -c1-500) >> $LOG
  echo >> $LOG
done
cp $S/s46w/h2-clean-card.mjs $R/tools/place-card-v1.mjs; cmp $R/tools/place-card-v1.mjs $S/s46w/h2-clean-card.mjs && rm $S/s46w/h2-clean-card.mjs && echo "module restored" >> $LOG
