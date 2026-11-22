#!/bin/bash
# Ship 16: the checks the brief names, on a reader tree after apply-16.sh, each with its log and its exit.
# Usage: run-checks-16.sh <reader dir> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; O=${2:?log dir}; mkdir -p $O
LEDGER=$S/dl-v210-data/v2/ledgers/all/toggle-ledgers/source-corpus-v1.1.json
. $S/s19w/env.sh
cd $R || exit 1
one() { local name=$1; shift; local t0=$(date +%s); timeout 2400 "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)"; grep -E "^ *(ok|FAIL|--)  " $O/$name.log | cut -c1-230 | sed 's/^/    /'; }
for c in check-readmission-v1 check-landings-v1 check-language-admitted-v1 check-lane-state-v1 check-ledger-declared-v1 check-no-import-side-effects-v1 check-nothing-hand-typed-v1 check-scope-derived-v1; do
  one $c node tools/$c.mjs
done
one check-source-corpus-v1 node tools/check-source-corpus-v1.mjs --ledger $LEDGER
