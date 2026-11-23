#!/bin/bash
# Ship 19 (23 November 2026): the checks after apply-19.sh and the round, on the sandbox, each into its own log with its
# exit code and its FAIL lines. A check run with a page is handed the tree served on a port the machine gives (ship
# 18's with-served-tree.mjs). Usage: checks-19.sh <reader dir> <log dir> [check ...]
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; W=${2:?log dir}; shift 2; mkdir -p $W
. $S/s28w/env.sh
cd $R || exit 1
SERVED=/home/user/mashiachsonyosef.github.io/wip/2026-11-23/ship-18/tools/with-served-tree.mjs
ALL="check-entry-gate-v1 check-landings-v1 check-names-gate-v1 check-default-picks-v1 check-nothing-hand-typed-v1 check-no-import-side-effects-v1 check-ledger-declared-v1 check-words-back-v1 check-dictionary-kinds-v1 check-sense-openings-v1 check-made-spaces-v1 check-audit-calls-v1 check-read-words-v1 check-stems-extension-v1 check-strongs-hedges-v1 check-sign-does-not-lead-v1 check-span-grade-v1 check-pointing-grade-v1 check-pointing-gate-v1 check-span-store-v1 check-search-v1"
for c in ${@:-$ALL}; do
  t0=$(date +%s)
  case $c in
    check-default-picks-v1) timeout 3000 node tools/$c.mjs --node > $W/$c.log 2>&1 ;;
    check-pointing-grade-v1|check-pointing-gate-v1|check-span-store-v1|check-search-v1) timeout 3000 node $SERVED $R tools/$c.mjs > $W/$c.log 2>&1 ;;
    *) timeout 3000 node tools/$c.mjs > $W/$c.log 2>&1 ;;
  esac
  code=$?
  echo "$c exit $code ($(( $(date +%s) - t0 )) s) · $(grep -c '^  ok' $W/$c.log) ok, $(grep -c '^FAIL' $W/$c.log) FAIL, $(grep -c '^  --' $W/$c.log) not judged · $(tail -1 $W/$c.log | cut -c1-160)" | tee -a $W/verdicts.txt
  grep "^FAIL" $W/$c.log | cut -c1-400 | sed 's/^/    /' | tee -a $W/verdicts.txt
done
