#!/bin/bash
# project every book the lattice grades, with the ship-8 tree, into wk/p8/out (4 at a time); the live tree's sidecars stay
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
. $S/v54/integrate/env.sh
STEMS=$S/dl-v2/v2/corpus/binyan-ledger/build-r2
cd $S/s8/reader; mkdir -p $S/wk/p8/out
ls $LATTICE_DIR | sed -n 's/^lattice-\(.*\)-v12\.json$/\1/p' | xargs -P 4 -I{} sh -c "node tools/project-lattice-v12-v1.mjs --zone data/zones/{}.bin --lattice $LATTICE_DIR --stamp 2026-11-17 --out $S/wk/p8/out/{}.bin --sidecar $S/wk/p8/out/{}.lattice.bin --place-stems $STEMS/place-stems-v2.jsonl --row-stems $STEMS/row-stems-v2.jsonl --row-stems-extension $STEMS_EXTENSION > $S/wk/p8/out/{}.log 2>&1 || echo FAIL {}"
echo done
