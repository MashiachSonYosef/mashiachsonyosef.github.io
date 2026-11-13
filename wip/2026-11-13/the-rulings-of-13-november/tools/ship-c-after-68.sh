#!/usr/bin/env bash
# After edit 68 (the card reader says a page that draws no word in words): the three faults that had ended in a
# timeout are tried again, the tree is judged as it stands afterwards (which is the two gate checks run on the mended
# reader), the checks that read the tools' own sources are run, and the tree's changed and new files are
# fingerprinted before and after so that "put back" is shown for the whole tree and not file by file.
# usage: ship-c-after-68.sh <scratchpad>
set -u
S="$1"
L="$S/v31/logs"; P="$L/l80-proofs-progress.txt"
LATTICE="$S/dl-v2/v2/corpus/lattice-v12"
LEDGER="$S/dl-v178/v2/ledgers/all/row-entries/row-entries-v1/row-entries-v1.jsonl"
say() { echo "$(date -u +%H:%M:%S) $*" >> "$P"; }
print_tree() { git -C "$S/pt" ls-files -m -o --exclude-standard -z | (cd "$S/pt" && xargs -0 sha256sum) | grep -v " reader/build/" | sha256sum | cut -c1-64; }
cd "$S/pt/reader"
say "begin: after edit 68"
BEFORE="$(print_tree)"
bash "$S/v31/probes/gates-checks-go-red-v1.sh" "$S/pt/reader" "$S/v31/trial-c/red-68" "$LATTICE" "$LEDGER" amos M9 "D M N" > "$L/l94-gates-checks-go-red-d-m-n-after-68.txt" 2>&1
say "red D M N · exit $?"
AFTER="$(print_tree)"
{ echo "the tree's changed and new files, fingerprinted (the checks' own logs left out):"; echo "  before the three faults: $BEFORE"; echo "  after they were put back: $AFTER"; [ "$BEFORE" = "$AFTER" ] && echo "  the same" || echo "  NOT THE SAME"; } > "$L/l94-tree-before-and-after.txt"
say "tree · $([ "$BEFORE" = "$AFTER" ] && echo "the same before and after" || echo "NOT THE SAME")"
: > "$L/l95-source-reading-checks-after-68.txt"
for c in check-docs-name-what-is-here-v1 check-manifest-prints-unguarded-v1 check-nothing-hand-typed-v1 check-scope-derived-v1; do
  node "tools/$c.mjs" > "$S/v31/trial-c/red-68/$c.log" 2>&1; code=$?
  echo "$c · exit $code · $(grep -c '^  ok' "$S/v31/trial-c/red-68/$c.log") ok, $(grep -c '^FAIL' "$S/v31/trial-c/red-68/$c.log") FAIL" >> "$L/l95-source-reading-checks-after-68.txt"
  grep -E '^FAIL' "$S/v31/trial-c/red-68/$c.log" | cut -c1-400 >> "$L/l95-source-reading-checks-after-68.txt"
done
say "source-reading checks · $(grep -c 'exit 0' "$L/l95-source-reading-checks-after-68.txt") of 4 exit 0"
say "end"
