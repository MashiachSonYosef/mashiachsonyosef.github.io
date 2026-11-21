#!/bin/bash
# Ship 13, after its pass ends: the manifest, the round's zones step run once more (the same bytes owed), the gate
# (live, ship 11d, on 8914 against this tree on 8912) with the four standing expectations and the bridge's pin, then
# the checks nearest the bridge. Usage: after-12.sh <pass>   ; writes S/s15w/after-<pass>.log
S=<scratch>; T=$S/s13; PASSN=${1:?pass}; shift; L=$S/s16w/after-$PASSN.log
. $S/s16w/env.sh
grep -q "^DONE" $S/s16w/$PASSN/pipeline.log || { echo "the pass $PASSN has not ended" >> $L; exit 1; }
cd $T/reader
node tools/pipeline-manifest-v1.mjs --stamp 2026-11-16 > $S/s16w/manifest-$PASSN.log 2>&1; echo "manifest exit $? $(date -u +%T)" >> $L
curl -sf -o /dev/null http://127.0.0.1:8912/ || (cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html || (cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2; t0=$(date +%s)
timeout 7200 node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $S/s16w/gate-diff-$PASSN.txt --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json --expect data/audit-calls/PIN.json --expect data/form-of-pills-v1.json --expect data/spelling-bridge/PIN.json "$@" > $S/s16w/gate-$PASSN.log 2>&1
echo "gate exit $? ($(( $(date +%s) - t0 )) s) $(date -u +%T): $(tail -1 $S/s16w/gate-$PASSN.log | cut -c1-120)" >> $L
[ -n "${GATE_ONLY:-}" ] && { echo "AFTER DONE (the gate alone)" >> $L; exit 0; }
timeout 3000 node tools/run-checks-v1.mjs --only '^(check-spelling-bridge-v1|check-read-words-v1|check-line-reads-the-place-v1|check-compspan-coverage-v1|check-piece-store-v1|check-disk-gloss-is-the-line-v1|check-entry-gate-v1|check-default-picks-v1|check-card-opens-on-the-line-v1|check-whole-form-parts-v1|check-blob-every-v1|check-pointing-gate-v1|check-audit-calls-v1|check-form-of-v1|check-landings-v1|check-names-gate-v1|check-chapter-pages-v3|check-chain-book-v2|check-nothing-hand-typed-v1|check-demonstrations-v1)$' --jobs 3 --timeout 1500 > $S/s16w/near-checks-$PASSN.log 2>&1
echo "near checks exit $? $(date -u +%T)" >> $L
echo "AFTER DONE" >> $L
