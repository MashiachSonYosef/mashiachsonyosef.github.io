#!/bin/bash
# Ship 11c, after its pass ends: the manifest, the gate (live, ship 11, on 8914 against this tree on 8912) with the
# expectations given on the command line after the four standing ones, then the checks nearest the landings.
# Usage: after-11c.sh <pass> [--expect <data file>]...   ; writes S/s13w/after-<pass>.log
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; T=$S/s11; PASSN=${1:?pass}; shift; L=$S/s13w/after-$PASSN.log
. $S/s12w/env.sh
grep -q "^DONE" $S/s13w/$PASSN/pipeline.log || { echo "the pass $PASSN has not ended" >> $L; exit 1; }
cd $T/reader
node tools/pipeline-manifest-v1.mjs --stamp 2026-11-16 > $S/s13w/manifest-$PASSN.log 2>&1; echo "manifest exit $? $(date -u +%T)" >> $L
curl -sf -o /dev/null http://127.0.0.1:8912/ || (cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html || (cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2; t0=$(date +%s)
timeout 7200 node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $S/s13w/gate-diff-$PASSN.txt --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json --expect data/audit-calls/PIN.json --expect data/form-of-pills-v1.json "$@" > $S/s13w/gate-$PASSN.log 2>&1
echo "gate exit $? ($(( $(date +%s) - t0 )) s) $(date -u +%T): $(tail -1 $S/s13w/gate-$PASSN.log | cut -c1-120)" >> $L
[ -n "${GATE_ONLY:-}" ] && { echo "AFTER DONE (the gate alone)" >> $L; exit 0; }
timeout 3000 node tools/run-checks-v1.mjs --only '^(check-landings-v1|check-entry-gate-v1|check-made-spaces-v1|check-sense-openings-v1|check-own-pointing-v1|check-ledger-divisions-v1|check-names-gate-v1|check-names-pill-v1|check-dictionary-kinds-v1|check-words-back-v1|check-store-continuity-v1|check-fold-strike-landing-v1|check-audit-calls-v1|check-default-picks-v1|check-form-of-v1|check-store-pinned-v1|check-record-pinned-v1|check-ledger-declared-v1|check-source-years-v1)$' --jobs 3 --timeout 1500 > $S/s13w/near-checks-$PASSN.log 2>&1
echo "near checks exit $? $(date -u +%T)" >> $L
echo "AFTER DONE" >> $L
