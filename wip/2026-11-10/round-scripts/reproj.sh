#!/bin/bash
# 10 November: the 39 sidecars re-projected from the reglossed zones
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
cd $S/pt/reader || exit 1
B=$S/dl-moses/corpus-lane-builds/moses-binyan-ledger-v1/build-r2
: > $S/v26/proj/all.log
for f in data/zones/*.bin; do
  b=$(basename $f .bin); case "$b" in *.*) continue;; esac
  [ -f $S/lattice-dl/moses-ledgers/lattice-v12/lattice-$b-v12.json ] || continue
  node tools/project-lattice-v12-v1.mjs --zone $f --lattice $S/lattice-dl/moses-ledgers/lattice-v12 --stamp 2026-11-10 --out $S/v26/proj/zones/$b.bin --sidecar $S/v26/proj/sidecars/$b.lattice.bin --place-stems $B/place-stems-v2.jsonl --row-stems $B/row-stems-v2.jsonl > $S/v26/proj/$b.log 2>&1
  echo "$b $?" >> $S/v26/proj/all.log
done
echo REPROJ-DONE >> $S/v26/proj/all.log
