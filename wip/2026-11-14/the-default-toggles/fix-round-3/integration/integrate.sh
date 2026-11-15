#!/bin/bash
# The default toggles and ship 1 on the palette main: every check of the integration, the lines at rest and the cards
# against live (8914 serves main 857a3dc0fb), and the timings. One at a time, so the timings are not under contention.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v59; L=$S/v54/picks-v1-2/ledger; I=$S/v54/integrate/scripts
. $S/v54/integrate/env.sh
cd $S/pt/reader
run() { local name=$1 tag=$2; shift 2; local t0=$(date +%s); timeout 3600 node tools/$name.mjs "$@" > $O/$name$tag.log 2>&1; local code=$?;
  echo "$name$tag exit $code ($(( $(date +%s) - t0 )) s) · ok $(grep -cE '^ *ok ' $O/$name$tag.log) · FAIL $(grep -cE '^FAIL' $O/$name$tag.log)" >> $O/summary.txt; }
: > $O/summary.txt
run check-default-picks-v1 .node --ledger $L --node
run check-default-picks-v1 .self-test --ledger $L --self-test
run check-entry-gate-v1 "" --ledger $ROW_ENTRIES_LEDGER --ledger-was $ROW_ENTRIES_LEDGER_WAS --lattice $LATTICE_DIR
run check-word-senses-v1 ""
run check-woven-name-v1 ""
run check-color-channels-v1 ""
run check-form-of-v1 ""
run check-ruled-equals-first-paint-v1 ""
run check-dictionary-toggle-v1 ""
run check-line-reads-the-place-v1 ""
run check-menu-switches-v1 ""
run check-reset-pill-v1 ""
run check-card-opens-on-the-line-v1 ""
run check-line-follows-card-v1 .ruth --zone ruth
run check-default-picks-v1 .full --ledger $L
t0=$(date +%s); timeout 10800 node $I/rest-vs-live.mjs http://127.0.0.1:8899 http://127.0.0.1:8914/reader $O/rest-vs-live.json amos daniel deuteronomy ecclesiastes esther exodus ezekiel ezra genesis habakkuk haggai hosea i-chronicles i-kings i-samuel ii-chronicles ii-kings ii-samuel isaiah jeremiah job joel jonah joshua judges lamentations leviticus malachi micah nahum nehemiah numbers obadiah proverbs psalms ruth song-of-songs zechariah zephaniah > $O/rest-vs-live.log 2>&1; echo "rest-vs-live exit $? ($(( $(date +%s) - t0 )) s) · $(tail -1 $O/rest-vs-live.log | cut -c1-160)" >> $O/summary.txt
t0=$(date +%s); timeout 3600 node $I/cards-vs-live.mjs http://127.0.0.1:8899 http://127.0.0.1:8914/reader $O/cards-vs-live.json amos ruth psalms ezekiel daniel ii-samuel genesis nahum > $O/cards-vs-live.log 2>&1; echo "cards-vs-live exit $? ($(( $(date +%s) - t0 )) s) · $(tail -1 $O/cards-vs-live.log | cut -c1-160)" >> $O/summary.txt
for side in "http://127.0.0.1:8914/reader live" "http://127.0.0.1:8899 tree"; do set -- $side; for st in rest macula; do timeout 900 node $I/probe-reset-time.mjs $1 ii-samuel $2 $st >> $O/reset-timing.log 2>&1; done; done
echo "reset timings: $(grep -c 'reset press ran' $O/reset-timing.log) runs" >> $O/summary.txt
echo DONE >> $O/summary.txt
