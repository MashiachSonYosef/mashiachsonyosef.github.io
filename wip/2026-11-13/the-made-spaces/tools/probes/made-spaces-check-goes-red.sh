#!/usr/bin/env bash
# check-made-spaces-v1, shown to fail when what it guards is not so, four ways. Each fault is put into one file of
# the tree by made-spaces-tamper.py, the check is run, and the file is put back from a kept copy, byte for byte.
#   A  a store row that should carry its route's closes carries no slot
#   B  a store row's first close moved one place on
#   C  the page's `closed` keeps the space it should leave out
#   D  a list's first line names another place than the corpus lane wrote
# bash made-spaces-check-goes-red.sh <reader dir> <scratch dir>
set -u
R="$1"; W="$2"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$W"
cd "$R"
verdict() { grep -E "^FAIL|^all checks passed|FAILED$" "$1" | cut -c1-460; }
LIST="$(ls data/made-spaces-v1/*.jsonl | head -1)"
try() {   # <letter> <what is said> <mode> <file>
  echo "$1 · $2:"
  cp "$4" "$W/kept"
  python3 -I "$HERE/made-spaces-tamper.py" "$3" "$4" | sed 's/^/   /'
  node tools/check-made-spaces-v1.mjs > "$W/$1.log" 2>&1; echo "   exit $?"; verdict "$W/$1.log" | sed 's/^/   /'
  cp "$W/kept" "$4"; cmp -s "$W/kept" "$4" && echo "   $4 put back, byte for byte"
}
echo "the tree as it stands:"
node tools/check-made-spaces-v1.mjs > "$W/0.log" 2>&1; echo "   exit $?"; verdict "$W/0.log" | sed 's/^/   /'
try A "a store row that should carry its route's closes carries no slot" drop data/route-store/shards/00.bin
try B "a store row's first close moved one place on" shift data/route-store/shards/00.bin
try C "the page's own function keeps the space it should leave out" page zone.html
try D "a list's first line names another place than the corpus lane wrote" list "$LIST"
echo "everything back:"
node tools/check-made-spaces-v1.mjs > "$W/back.log" 2>&1; echo "   exit $?"; verdict "$W/back.log" | sed 's/^/   /'
