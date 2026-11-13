#!/usr/bin/env bash
# Ruling 4's proofs on the build tree, one after another so none reads the tree while another alters it: the round run
# whole (the store changed, so every step from the zones on), the check of the openings alone, the whole suite, the
# same-product gate against the live build, then the openings' check broken on purpose thirteen ways. Each stage
# writes its own log and one line to the progress file when it ends, so a run cut short says where it stopped. The
# last stage alters one file at a time and puts it back from <scratch>/kept, and its own progress file names the file.
# usage: ship-openings-proofs.sh <scratchpad> [stages, default "round check suite gate red"]
set -u
S="$1"; STAGES="${2:-round check suite gate red}"
L="$S/v33/logs"; P="$L/n09-proofs-progress.txt"
LATTICE="$S/dl-v2/v2/corpus/lattice-v12"
LEDGER="$S/dl-v178/v2/ledgers/all/row-entries/row-entries-v1/row-entries-v1.jsonl"
STEMS="$S/dl-v2/v2/corpus/binyan-ledger/build-r2"
EXTENSION="$S/dl-v178/v2/ledgers/all/stems-extension/stems-extension-v1/row-stems-extension-v1.jsonl"
say() { echo "$(date -u +%H:%M:%S) $*" >> "$P"; }
print_tree() { git -C "$S/pt" ls-files -m -o --exclude-standard -z | (cd "$S/pt" && xargs -0 sha256sum) | grep -v " reader/build/" | sha256sum | cut -c1-64; }
cd "$S/pt/reader"
say "begin: $STAGES"
for stage in $STAGES; do
  case "$stage" in
    round)
      bash tools/round-v1.sh --stamp 2026-11-13 --lattice "$LATTICE" --stems "$STEMS" --stems-extension "$EXTENSION" > "$L/n10-round.txt" 2>&1
      say "round (every step) · exit $?" ;;
    chain-door)
      bash tools/round-v1.sh --stamp 2026-11-13 --lattice "$LATTICE" --stems "$STEMS" --stems-extension "$EXTENSION" --steps chain,door > "$L/n10b-round-chain-door.txt" 2>&1
      say "round (chain, door) · exit $?" ;;
    lines-chain-door)
      # the page moved (edit 79): what is read off it is read again; the zones, stamps, search index and records are not
      bash tools/round-v1.sh --stamp 2026-11-13 --lattice "$LATTICE" --stems "$STEMS" --stems-extension "$EXTENSION" --steps lines,chain,door > "$L/n15-round-lines-chain-door.txt" 2>&1
      say "round (lines, chain, door) · exit $?" ;;
    check)
      node tools/check-sense-openings-v1.mjs > "$L/n11-check-sense-openings.txt" 2>&1
      say "check-sense-openings · exit $?" ;;
    suite)
      LATTICE_DIR="$LATTICE" ROW_ENTRIES_LEDGER="$LEDGER" STEMS_EXTENSION="$EXTENSION" node tools/run-checks-v1.mjs > "$L/n12-suite.txt" 2>&1
      say "suite · exit $? · $(grep -c -E '^FAIL|FAILED' "$L/n12-suite.txt") line(s) naming a failure" ;;
    gate)
      node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff "$L/n13-gate-diff.txt" > "$L/n13-gate.txt" 2>&1
      say "gate · exit $?" ;;
    red)
      BEFORE="$(print_tree)"
      bash "$S/v33/probes/openings-checks-go-red-v1.sh" "$S/pt/reader" "$S/v33/trial/red" amos M46 > "$L/n14-openings-check-goes-red.txt" 2>&1
      say "red · exit $?"
      AFTER="$(print_tree)"
      { echo "the tree's changed and new files, fingerprinted (the checks' own logs left out):"; echo "  before the faults: $BEFORE"; echo "  after they were put back: $AFTER"; [ "$BEFORE" = "$AFTER" ] && echo "  the same" || echo "  NOT THE SAME"; } > "$L/n14-tree-before-and-after.txt"
      say "tree · $([ "$BEFORE" = "$AFTER" ] && echo "the same before and after" || echo "NOT THE SAME")" ;;
  esac
done
say "end"
