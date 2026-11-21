#!/bin/bash
# Ship 13: project every book with the delta into a scratch folder (the tree's zones are not written).
S=<scratch>
. $S/s12w/env.sh
cd $S/s13/reader
DEL=$S/dl-v208-data/v2/ledgers/all/lattice-delta/delta-v13-v1; ST=$S/dl-v2/v2/corpus/binyan-ledger/build-r2
OUT=$S/s16w/try; mkdir -p $OUT
one() { b=$1; node tools/project-lattice-v12-v1.mjs --zone data/zones/$b.bin --lattice "$LATTICE_DIR" --stamp 2026-11-16 --out $OUT/$b.bin --sidecar $OUT/$b.lattice.bin --place-stems $ST/place-stems-v2.jsonl --row-stems $ST/row-stems-v2.jsonl --row-stems-extension "$STEMS_EXTENSION" --delta $DEL > $OUT/$b.log 2>&1 || echo "FAILED $b: $(tail -1 $OUT/$b.log | cut -c1-400)"; }
export -f one; export S LATTICE_DIR STEMS_EXTENSION DEL ST OUT
ls $LATTICE_DIR | sed -n 's/^lattice-\(.*\)-v12.json$/\1/p' | xargs -P 4 -I{} bash -c 'one {}'
echo "projected: $(ls $OUT/*.lattice.bin | wc -l) sidecars"
grep -h "delta v208" $OUT/*.log | awk '{n+=1} END {print n " books report the delta"}'
grep -h "lost tags" $OUT/*.log
