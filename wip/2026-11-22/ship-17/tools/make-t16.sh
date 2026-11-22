#!/bin/bash
# The test tree for ship 17 on main with ship 16 (22 November 2026): a copy of main's reader, with ship 16's file
# changes as S/s20w/apply-16.sh makes them (ship 12's tools copied and patched, then ship 16's patches), in its order.
# Ship 16's data steps (the pin, the records, the re-admission, the landing, the store steps) change no file ship 17
# reads or writes, and are not run. Run only on a copy made under S/s22w. Usage: make-t16.sh <reader copy> <log>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader copy}; L=${2:?log}
case "$R" in $S/s22w/*) ;; *) echo "refused: $R is not a copy under S/s22w"; exit 1 ;; esac
T=$S/s20w/tools; T12=$S/s15w/tools
cd $R || exit 1
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
cp $T12/pinned-v1.mjs $T12/derive-landings-v1.mjs $T12/readmit-sources-v1.mjs $T12/check-readmission-v1.mjs tools/ || stop "ship 12's tools"
for p in patch-02-strike-rows-gz.py; do python3 -I $T12/$p tools/strike-rows-v1.mjs >> $L 2>&1 || stop $p; done
for p in patch-05-lattice-door.py patch-06-check-landings-holes.py patch-07-check-language-admitted.py patch-08-strike-language-keeps-readmission.py patch-10-lane-state.py patch-09-pipeline-doc.py; do python3 -I $T12/$p . >> $L 2>&1 || stop $p; done
for p in patch-16-01-derive-landings-held.py patch-16-02-check-landings-held.py patch-16-03-readmission-held.py patch-16-04-source-corpus-by-row.py patch-16-08-language-shelf-by-row.py patch-16-07-pipeline-doc.py; do python3 -I $T/$p . >> $L 2>&1 || stop $p; done
echo "ship 16's file changes made on $R" | tee -a $L
