#!/bin/bash
# Ship 11d, pass 2: the zones as ship 11c shipped them (no pieces of the bridge), the pipeline whole with the bridge
# first in the round's zones step, then the zones and stamps steps once more: the same bytes are owed.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; T=$S/s11; L=$S/s14w/pass2.log
. $S/s12w/env.sh
cd $T && git checkout -q HEAD -- reader/data/zones && echo "zones restored to ship 11c: $(git status --short reader/data/zones | wc -l) differ from HEAD" > $L
PASS=pipe2 bash $S/s14w/pipeline-11d.sh; tail -9 $S/s14w/pipe2/pipeline.log >> $L
grep -q "^DONE" $S/s14w/pipe2/pipeline.log || { echo "PASS 2 STOPPED" >> $L; exit 1; }
cd $T/reader
sha256sum data/zones/*.bin > $S/s14w/zones-pass2.sha
t0=$(date +%s)
bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $S/v54/picks-v1-2/ledger --steps zones,stamps > $S/s14w/zones-again-pass2.log 2>&1; echo "zones and stamps again: exit $? ($(( $(date +%s) - t0 )) s)" >> $L
sha256sum data/zones/*.bin > $S/s14w/zones-pass2-again.sha
if cmp -s $S/s14w/zones-pass2.sha $S/s14w/zones-pass2-again.sha; then echo "SAME BYTES: all $(wc -l < $S/s14w/zones-pass2.sha) zone files, the round run on ship 11c's zones and its zones and stamps steps run again" >> $L; else echo "DIFFER:" >> $L; diff $S/s14w/zones-pass2.sha $S/s14w/zones-pass2-again.sha | grep "^>" | awk '{print $3}' >> $L; fi
grep -E "pieces:" $S/s14w/pipe2/round.log $S/s14w/zones-again-pass2.log | cut -c1-220 >> $L
echo "PASS 2 DONE $(date -u +%FT%TZ)" >> $L
