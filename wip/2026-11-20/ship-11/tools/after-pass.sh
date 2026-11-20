#!/bin/bash
# Ship 11, after a pass ends: the document, the gate's names class (once), the manifest, the gate, the nearest checks.
# Usage: after-pass.sh <pass> ; writes after-<pass>.log
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; T=$S/s11; PASSN=${1:?pass}; L=$S/s11w/after-$PASSN.log
. ${ENVFILE:-$S/v54/integrate/env.sh}
grep -q "^DONE" $S/${WDIR:-s11w}/$PASSN/pipeline.log || { echo "the pass $PASSN has not ended" >> $L; exit 1; }
cd $T/reader
grep -q "names v2's, relay v198" PIPELINE.md || python3 $S/s11w/patch-pipeline-doc.py PIPELINE.md >> $L 2>&1
grep -q "NAMES_GATE_RULE_ID" tools/check-same-product-v1.mjs || python3 $S/s11w/patch-gate-names.py tools/check-same-product-v1.mjs >> $L 2>&1
node tools/pipeline-manifest-v1.mjs --stamp 2026-11-16 > $S/s11w/manifest-$PASSN.log 2>&1; echo "manifest exit $? $(date -u +%T)" >> $L
rm -f $S/s11w/gate.log $S/s11w/gate-diff.txt
bash $S/s11w/gate-11.sh --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json --expect data/audit-calls/PIN.json --expect data/form-of-pills-v1.json --expect data/name-rows-receipt-v1.json
cp $S/s11w/gate.log $S/s11w/gate-$PASSN.log; cp $S/s11w/gate-diff.txt $S/s11w/gate-diff-$PASSN.txt 2>/dev/null
echo "gate done $(date -u +%T): $(tail -1 $S/s11w/gate.log | cut -c1-80)" >> $L
timeout 2400 node tools/run-checks-v1.mjs --only '^(check-names-gate-v1|check-names-pill-v1|check-proper-name-v1|check-entry-gate-v1|check-form-of-v1|check-dictionary-kinds-v1|check-default-picks-v1|check-store-continuity-v1|check-store-pinned-v1|check-record-pinned-v1)$' --jobs 3 --timeout 1500 > $S/s11w/near-checks-$PASSN.log 2>&1
echo "near checks exit $? $(date -u +%T)" >> $L
echo "AFTER DONE" >> $L
