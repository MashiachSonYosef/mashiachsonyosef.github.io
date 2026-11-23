#!/bin/bash
# Ship 20 (23 November 2026): the checks the brief names and those that read what ship 20 changes, on a reader tree after
# apply-20.sh and the round, each with its log, its exit and its laws. Pages are served on a port the machine gives.
# Usage: run-checks-20.sh <reader dir> <log dir> [check ...]
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; O=${2:?log dir}; shift 2; mkdir -p $O
. $S/s21w/env.sh
export ROW_ENTRIES_LISTS
cd $R || exit 1
one() { local name=$1; shift; local t0=$(date +%s); timeout 3000 "$@" > $O/$name.log 2>&1; local code=$?; printf "%-40s exit %s (%s s) · ok %s FAIL %s\n" $name $code $(( $(date +%s) - t0 )) $(grep -cE "^ *ok  " $O/$name.log) $(grep -cE "^FAIL" $O/$name.log); grep -E "^FAIL" $O/$name.log | cut -c1-260 | sed 's/^/    /'; }
LIST=${*:-"check-names-gate-v1 check-spelling-bridge-v1 check-held-places-v1 check-entry-gate-v1 check-landings-v1 check-nothing-hand-typed-v1 check-no-import-side-effects-v1 check-ledger-declared-v1 check-lattice-projection-v1 check-zone-single-pass-receipts-v1 check-sidecars-all-named-v1 check-store-continuity-v1 check-words-back-v1 check-dictionary-kinds-v1 check-form-of-v1 check-sense-openings-v1 check-pointing-gate-v1 check-proper-name-v1 check-line-reads-the-place-v1 check-piece-store-v1 check-read-words-v1 check-audit-calls-v1"}
for c in $LIST; do
  case $c in
    check-spelling-bridge-v1) one check-spelling-bridge-v1-node node tools/check-spelling-bridge-v1.mjs --node; one check-spelling-bridge-v1-page node tools/check-spelling-bridge-v1.mjs ;;
    check-default-picks-v1) one $c node tools/$c.mjs --node --ledger $DEFAULT_PICKS_LEDGER ;;
    *) if grep -q "^// RUN: page" tools/$c.mjs; then one $c node $S/s29w/tools/with-served-tree.mjs $R tools/$c.mjs; else one $c node tools/$c.mjs; fi ;;
  esac
done
