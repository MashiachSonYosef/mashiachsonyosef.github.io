#!/usr/bin/env bash
# The paseq's place (relay v179) on the build tree, after ruling 4 is committed there: the pin and the two tools brought
# over from the worktree they were made in, edits 80 and 81, the zones written, then the round from the stamps on (the
# zones changed and the page changed; the zone step itself is not run, its tools keep the facts), the check, the suite,
# the gate against the live build, and the check broken on purpose nine ways. One stage after another, each with its
# own log and a line in the progress file.
# usage: ship-paseq-proofs.sh <scratchpad> [stages, default "bring apply round check suite gate red"]
set -u
S="$1"; STAGES="${2:-bring apply round check suite gate red}"
L="$S/v34/logs"; P="$L/p09-proofs-progress.txt"
LATTICE="$S/dl-v2/v2/corpus/lattice-v12"
LEDGER="$S/dl-v178/v2/ledgers/all/row-entries/row-entries-v1/row-entries-v1.jsonl"
STEMS="$S/dl-v2/v2/corpus/binyan-ledger/build-r2"
EXTENSION="$S/dl-v178/v2/ledgers/all/stems-extension/stems-extension-v1/row-stems-extension-v1.jsonl"
say() { echo "$(date -u +%H:%M:%S) $*" >> "$P"; }
cd "$S/pt/reader"
say "begin: $STAGES"
for stage in $STAGES; do
  case "$stage" in
    bring)
      mkdir -p data/paseq-place && cp -a "$S/p179/reader/data/paseq-place/." data/paseq-place/ \
        && cp -p "$S/p179/reader/tools/apply-paseq-place-v1.mjs" "$S/p179/reader/tools/check-paseq-place-v1.mjs" tools/ \
        && (cd "$S/v34/edits" && node 80-the-paseq-prints-inside-the-read-form.mjs "$S/pt/reader" && node 81-the-pipeline-names-the-paseq-place.mjs "$S/pt/reader") > "$L/p10-bring.txt" 2>&1
      say "bring (pin, tools, edits 80 and 81) · exit $?" ;;
    apply)
      { node tools/apply-paseq-place-v1.mjs --stamp 2026-11-13 && node tools/apply-paseq-place-v1.mjs --stamp 2026-11-13; } > "$L/p11-apply.txt" 2>&1
      say "apply (and again, to write nothing) · exit $?" ;;
    round)
      bash tools/round-v1.sh --stamp 2026-11-13 --lattice "$LATTICE" --stems "$STEMS" --stems-extension "$EXTENSION" --steps stamps,search,records,lines,chain,door > "$L/p12-round.txt" 2>&1
      say "round (stamps to door) · exit $?" ;;
    check)
      node tools/check-paseq-place-v1.mjs > "$L/p13-check-paseq-place.txt" 2>&1
      say "check-paseq-place · exit $?" ;;
    suite)
      LATTICE_DIR="$LATTICE" ROW_ENTRIES_LEDGER="$LEDGER" STEMS_EXTENSION="$EXTENSION" node tools/run-checks-v1.mjs > "$L/p14-suite.txt" 2>&1
      say "suite · exit $? · $(grep -c -E '^FAIL|FAILED' "$L/p14-suite.txt") line(s) naming a failure" ;;
    gate)
      node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff "$L/p15-gate-diff.txt" > "$L/p15-gate.txt" 2>&1
      say "gate · exit $?" ;;
    red)
      bash "$S/v34/probes/paseq-check-goes-red-v1.sh" "$S/pt/reader" "$S/v34/trial/red" > "$L/p16-check-goes-red.txt" 2>&1
      say "red · exit $?" ;;
  esac
done
say "end"
