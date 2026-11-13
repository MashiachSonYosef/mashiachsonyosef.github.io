#!/usr/bin/env bash
# Ship C's proofs on the build tree, one after another so none reads the tree while another alters it: the whole
# suite, the same-product gate against the live build, then the two gates' checks broken on purpose eighteen ways.
# Each stage writes its own log and one line here when it ends, so a run cut short says where it stopped. The last
# stage alters one file at a time and puts it back from <scratch>/kept: if it is cut short, that file is the one to
# put back, and its log's last line names it.
# usage: ship-c-proofs.sh <scratchpad> [stages, default "suite gate red"]
set -u
S="$1"; STAGES="${2:-suite gate red}"
L="$S/v31/logs"; P="$L/l80-proofs-progress.txt"
LATTICE="$S/dl-v2/v2/corpus/lattice-v12"
LEDGER="$S/dl-v178/v2/ledgers/all/row-entries/row-entries-v1/row-entries-v1.jsonl"
say() { echo "$(date -u +%H:%M:%S) $*" >> "$P"; }
cd "$S/pt/reader"
say "begin: $STAGES"
for stage in $STAGES; do
  case "$stage" in
    round)
      # the page changed after the lines and the chain books were read off it (edit 67): both record the page they
      # were read from, so they are read again, and the door is built over them
      bash tools/round-v1.sh --stamp 2026-11-13 --lattice "$LATTICE" --stems "$S/dl-v2/v2/corpus/binyan-ledger/build-r2" --steps lines,chain,door > "$L/l85-round-lines-chain-door.txt" 2>&1
      say "round (lines, chain, door) · exit $?" ;;
    suite)
      LATTICE_DIR="$LATTICE" ROW_ENTRIES_LEDGER="$LEDGER" node tools/run-checks-v1.mjs > "$L/l80-suite-ship-c.txt" 2>&1
      say "suite · exit $? · $(grep -c -E '^FAIL|FAILED' "$L/l80-suite-ship-c.txt") line(s) naming a failure" ;;
    gate)
      node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff "$L/l81-gate-ship-c-diff.txt" > "$L/l81-gate-ship-c.txt" 2>&1
      say "gate · exit $?" ;;
    red)
      bash "$S/v31/probes/gates-checks-go-red-v1.sh" "$S/pt/reader" "$S/v31/trial-c/red" "$LATTICE" "$LEDGER" amos M9 > "$L/l82-gates-checks-go-red.txt" 2>&1
      say "red · exit $?" ;;
  esac
done
say "end"
