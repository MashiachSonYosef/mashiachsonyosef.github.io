#!/bin/bash
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
cd $S/pt/reader || exit 1
: > $S/v26/regloss-comm/all.log
for f in data/zones/*.commentary.bin; do
  b=$(basename $f .bin)
  node tools/regloss-zone.mjs --zone $f --out $S/v26/regloss-comm/$b.bin --stamp 2026-11-10 > $S/v26/regloss-comm/$b.log 2>&1
  echo "$b $?" >> $S/v26/regloss-comm/all.log
done
echo COMM-DONE >> $S/v26/regloss-comm/all.log
