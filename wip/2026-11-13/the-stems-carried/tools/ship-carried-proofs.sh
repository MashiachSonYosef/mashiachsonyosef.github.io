#!/usr/bin/env bash
# The stems carried (stems-carried-rule-v1) on the build tree, after the round has projected every book under it:
# the new check and the extension's, the measures against the live build (lines at rest, the chain books, weights,
# the files that must not move), the suite, the gate against the live build, and the check broken on purpose.
# One stage after another, each with its own log and a line in the progress file.
# usage: ship-carried-proofs.sh <scratchpad> [stages, default "check ext measure suite gate red"]
set -u
S="$1"; STAGES="${2:-check ext measure suite gate red}"
L="$S/v36/logs"; P="$L/s09-proofs-progress.txt"
N=/home/user/mashiachsonyosef.github.io/wip/2026-11-13/the-rulings-of-13-november/tools
export LATTICE="$S/dl-v2/v2/corpus/lattice-v12"
LEDGER="$S/dl-v178/v2/ledgers/all/row-entries/row-entries-v1/row-entries-v1.jsonl"
export STEMS="$S/dl-v2/v2/corpus/binyan-ledger/build-r2"
export EXTENSION="$S/dl-v178/v2/ledgers/all/stems-extension/stems-extension-v1/row-stems-extension-v1.jsonl"
export STAMP=2026-11-13
say() { echo "$(date -u +%H:%M:%S) $*" >> "$P"; }
cd "$S/pt/reader"
say "begin: $STAGES"
for stage in $STAGES; do
  case "$stage" in
    check)
      node tools/check-stems-carried-v1.mjs --row-stems "$STEMS/row-stems-v2.jsonl" > "$L/s10-check-stems-carried.txt" 2>&1
      say "check-stems-carried · exit $?" ;;
    ext)
      STEMS_EXTENSION="$EXTENSION" node tools/check-stems-extension-v1.mjs > "$L/s11-check-stems-extension.txt" 2>&1
      say "check-stems-extension · exit $?" ;;
    measure)
      python3 -I "$N/lines-before-and-after.py" "$S/old/reader" "$S/pt/reader" > "$L/s12-lines-before-and-after.txt" 2>&1
      python3 -I "$N/chain-cards-before-and-after.py" "$S/old/chain" "$S/pt/chain" > "$L/s13-chain-cards-before-and-after.txt" 2>&1
      { echo "the zones folder, every file:"; du -cb "$S/old/reader/data/zones/"* | tail -1; du -cb "$S/pt/reader/data/zones/"* | tail -1
        echo "the lattice sidecars:"; du -cb "$S/old/reader/data/zones/"*.lattice.bin | tail -1; du -cb "$S/pt/reader/data/zones/"*.lattice.bin | tail -1
        echo "files of data/ that differ between the live build and this one, outside the zones:"
        (cd "$S/old/reader/data" && find . -type f ! -path './zones/*' | sort | xargs sha256sum) > "$L/.old-data.sha"
        (cd "$S/pt/reader/data" && find . -type f ! -path './zones/*' | sort | xargs sha256sum) > "$L/.new-data.sha"
        diff "$L/.old-data.sha" "$L/.new-data.sha" | grep '^[<>]' | awk '{print $1, $3}' | sort -k2 | uniq
        echo "zone files that differ, by kind:"
        for f in "$S/pt/reader/data/zones/"*.bin; do b=$(basename "$f"); cmp -s "$f" "$S/old/reader/data/zones/$b" || echo "$b"; done | sed -E 's/^[a-z0-9-]+\.//' | sort | uniq -c
      } > "$L/s14-weights-and-files.txt" 2>&1
      say "measure (lines, chain, weights, files) · done" ;;
    suite)
      LATTICE_DIR="$LATTICE" ROW_ENTRIES_LEDGER="$LEDGER" STEMS_EXTENSION="$EXTENSION" ROW_STEMS="$STEMS/row-stems-v2.jsonl" node tools/run-checks-v1.mjs > "$L/s15-suite.txt" 2>&1
      say "suite · exit $? · $(grep -c -E '^FAIL|FAILED' "$L/s15-suite.txt") line(s) naming a failure" ;;
    gate)
      node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff "$L/s16-gate-diff.txt" > "$L/s16-gate.txt" 2>&1
      say "gate · exit $?" ;;
    red)
      bash "$S/v36/probes/carried-check-goes-red-v1.sh" "$S/pt/reader" "$S/v36/trial/red" amos > "$L/s17-check-goes-red.txt" 2>&1
      say "red · exit $?" ;;
  esac
done
say "end"
