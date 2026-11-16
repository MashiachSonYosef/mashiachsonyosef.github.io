#!/bin/bash
# Ship 7 (the four cards of 16 November and tasks 134 and 135), integrated in S/s7, branch ship7: the store tools in
# the order the builders gave (the made spaces' note, then English Wiktionary's own pointing, then the span grade's
# dry run), the whole round with the zones, the switches page, every resting line against live, the checks the
# builders named, the whole suite, the gate. A store tool or the round that fails stops the run; a check that fails is
# logged and the run goes on, so one pass shows every red.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s7w/pipe; P=$O/pipeline.log
T=$S/s7
mkdir -p $O
. $S/v54/integrate/env.sh
cd $T/reader
touch $S/v63/PIPELINE-RUNNING
step() { local name=$1; shift; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; return $code; }
stop() { echo "STOPPED at $1" >> $P; rm -f $S/v63/PIPELINE-RUNNING; exit 1; }
: > $P
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD)" >> $P
# the suite's runner and the gate use whatever answers on 8899 (the reader) and 8912 (the site): serve this tree there
pkill -f "http.server 8899 --bind 127.0.0.1" ; pkill -f "http.server 8912 --bind 127.0.0.1" ; sleep 1
(cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html && curl -sf -o /dev/null http://127.0.0.1:8912/ || stop serve
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || stop "serve (live on 8914)"
echo "serve: 8899 is S/s7/reader, 8912 is S/s7, 8914 is S/old (live 8797fa4d5b)" >> $P
# 1. the store tools, each once, on its own moment
step store-made-spaces node tools/apply-made-spaces-v1.mjs --on 2026-11-16T18:00:00.000Z || stop store-made-spaces
step store-own-pointing-dry node tools/apply-own-pointing-v1.mjs --dry || stop store-own-pointing-dry
step store-own-pointing node tools/apply-own-pointing-v1.mjs --on 2026-11-16T18:00:01.000Z || stop store-own-pointing
step store-span-grade-dry node tools/apply-span-grade-v1.mjs --dry || stop store-span-grade-dry
# 2. the round, whole
PICKS=$S/v54/picks-v1-2/ledger
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS)
if ! step round "${ROUND[@]}"; then
  if grep -q "the default picks' receipt was not written\|the default picks do not hold over the records just read" $O/round.log; then
    echo "round: the records read anew move the default picks' index; the defaults bake again, then records, lines, chain, door" >> $P
    step round-again "${ROUND[@]}" --steps defaults,records,lines,chain,door || stop round-again
  else stop round; fi
fi
# 3. the switches page
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
# 4. every resting line against live, each moved entry listed and classed
step lines node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop lines
# 5. the checks the builders named: logged, the run goes on
step c-own-pointing timeout 1800 node tools/check-own-pointing-v1.mjs
step c-pointing-grade timeout 1800 node tools/check-pointing-grade-v1.mjs
step c-piece-class timeout 1800 node tools/check-piece-class-v1.mjs
step c-pointing-gate timeout 1800 node tools/check-pointing-gate-v1.mjs
step c-masorah timeout 1800 node tools/check-masorah-toggle-v1.mjs
step c-source-switch timeout 1800 node tools/check-source-switch-v1.mjs
step c-sign timeout 1800 node tools/check-sign-does-not-lead-v1.mjs --lattice $LATTICE_DIR
step c-lattice timeout 1800 node tools/check-lattice-projection-v1.mjs
step c-entry timeout 1800 node tools/check-entry-gate-v1.mjs --ledger $ROW_ENTRIES_LEDGER --ledger-was $ROW_ENTRIES_LEDGER_WAS --lattice $LATTICE_DIR
step c-names timeout 1800 node tools/check-names-gate-v1.mjs
step c-sense-openings timeout 1800 node tools/check-sense-openings-v1.mjs
step c-landing timeout 900 node tools/check-fold-strike-landing-v1.mjs
step c-audit timeout 900 node tools/check-audit-calls-v1.mjs
step c-made-spaces timeout 1800 node tools/check-made-spaces-v1.mjs
step c-hedges timeout 1800 node tools/check-strongs-hedges-v1.mjs
step c-whole-form timeout 1800 node tools/check-whole-form-parts-v1.mjs
step c-span-grade timeout 1800 node tools/check-span-grade-v1.mjs
step c-span-store timeout 1800 node tools/check-span-store-v1.mjs
step c-source-years timeout 900 node tools/check-source-years-v1.mjs
step c-run-forms timeout 1800 node tools/check-run-card-forms-v1.mjs
step c-run-division timeout 1800 node tools/check-run-line-follows-division-v1.mjs
step c-picks timeout 3600 node tools/check-default-picks-v1.mjs --ledger $PICKS
step c-sorted timeout 900 node tools/check-first-reading-is-sorted-v1.mjs
# 6. the whole suite, then the gate
step suite node tools/run-checks-v1.mjs --jobs 3 --timeout 1500
step gate timeout 7200 node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $O/gate-diff.txt --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json --expect data/audit-calls/PIN.json --expect data/form-of-pills-v1.json
echo "DONE $(date -u +%FT%TZ)" >> $P
rm -f $S/v63/PIPELINE-RUNNING
