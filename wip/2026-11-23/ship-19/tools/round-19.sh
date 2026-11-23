#!/bin/bash
# Ship 19's measure (23 November 2026), on the sandbox S/s11 after apply-19.sh: the round's steps far enough to bake the
# resting lines of every book (the zones, stamps, search, defaults and records; the form-of record; the lines), then
# every resting line against main (S/old, read only). No server on a fixed port: the lines step serves the tree on a
# port the machine gives. Resumable: a step done is kept.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s28w/logs/round; P=$O/pipeline.log
T=$S/s11
mkdir -p $O/done
. $S/s28w/env.sh
cd $T/reader || exit 1
step() { local name=$1; shift; [ -e $O/done/$name ] && { echo "$name kept (done before)" >> $P; return 0; }; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; [ $code = 0 ] && touch $O/done/$name; return $code; }
stop() { echo "STOPPED at $1" >> $P; exit 1; }
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD) + ship 19 applied, store $(python3 -c "import json;print(json.load(open('data/route-store/index.json'))['store_version'])")" >> $P
[ "$(git -C $S/old rev-parse --short=10 HEAD)" = "7f6c862105" ] || stop "S/old is not main 7f6c862105"
PICKS=$S/v54/picks-v1-2/ledger
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --lattice-delta $LATTICE_DELTA_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS)
if [ ! -e $O/done/round ]; then
  step round "${ROUND[@]}" --steps zones,stamps,search,defaults,records || {
    if grep -q "the default picks' receipt was not written\|the default picks do not hold over the records just read" $O/round.log; then
      echo "round: the defaults bake again, then records" >> $P
      step round-again "${ROUND[@]}" --steps defaults,records && touch $O/done/round || stop round-again
    else stop round; fi
  }
fi
step formof timeout 1800 node tools/bake-form-of-pills-v1.mjs || stop formof
if [ ! -e $O/done/lines ]; then
  step lines "${ROUND[@]}" --steps lines || {
    if grep -q "the default picks' receipt was not written\|the default picks do not hold over the records just read" $O/lines.log; then
      echo "lines: the records read anew move the default picks; the defaults bake again, then the records and the lines" >> $P
      step defaults-again "${ROUND[@]}" --steps defaults,records || stop defaults-again
      step lines-again "${ROUND[@]}" --steps lines && touch $O/done/lines || stop lines-again
    else stop lines; fi
  }
fi
step linesdiff node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop linesdiff
echo "DONE $(date -u +%FT%TZ)" >> $P
