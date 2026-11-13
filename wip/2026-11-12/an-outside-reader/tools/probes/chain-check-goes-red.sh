#!/usr/bin/env bash
# The chain check, shown to fail when the chain is not the card, three ways. It works on a copy of one book's chain
# in a scratch folder, so the tree's own chain is never touched; the one file of the tree it changes (C) is put back
# byte for byte.
#   A  two links swapped by hand, past the window the book's page prints, in a list of pills a card prints at rest
#      and no card prints lifted; the index written again over it. The file still hangs together, its counts are
#      true and its page is the page: only opening the card can tell.
#   B  the same in a list a card prints only with the switches lifted.
#   C  one data file the cards were read off made one byte longer: the builder refuses to write the index, and the
#      check says the file is not of this tree.
# bash chain-check-goes-red.sh <reader dir> <scratch dir> <a chained book>
set -u
R="$1"; W="$2"; BOOK="$3"
HERE="$(cd "$(dirname "$0")" && pwd)"
rm -rf "$W/chain" && mkdir -p "$W/chain/$BOOK"
cd "$R"
cp "../chain/$BOOK/chain-v1.json.gz" "../chain/$BOOK/index.html" "$W/chain/$BOOK/"
cp "$W/chain/$BOOK/chain-v1.json.gz" "$W/kept.json.gz"
verdict() { grep -E "^FAIL|^all checks passed|FAILED$" "$1" | cut -c1-430; }
index() { node tools/build-chain-book-v2.mjs --index --dir "$W/chain" > "$W/index.log" 2>&1; echo "   the index written again: exit $? · $(grep -E '^Error: |books ·' "$W/index.log" | head -1 | cut -c1-260)"; }

index
echo "the copy as it was read:"
node tools/check-chain-book-v2.mjs --dir "$W/chain" > "$W/0.log" 2>&1; echo "   exit $?"; verdict "$W/0.log" | sed 's/^/   /'

for STATE in rest lifted; do
  echo "$([ "$STATE" = rest ] && echo A || echo B) · two links swapped by hand in a list of pills a card prints only $([ "$STATE" = rest ] && echo "at rest" || echo "with the switches lifted"):"
  python3 -I "$HERE/chain-swap-two-links.py" "$W/chain/$BOOK/chain-v1.json.gz" "$STATE" | sed 's/^/   /'
  index
  node tools/check-chain-book-v2.mjs --dir "$W/chain" > "$W/$STATE.log" 2>&1; echo "   exit $?"; verdict "$W/$STATE.log" | sed 's/^/   /'
  cp "$W/kept.json.gz" "$W/chain/$BOOK/chain-v1.json.gz"; cmp -s "$W/kept.json.gz" "$W/chain/$BOOK/chain-v1.json.gz" && echo "   the copy put back, byte for byte"
done
index

FILE="$(python3 -I "$HERE/chain-a-file-it-names.py" "$W/chain/$BOOK/chain-v1.json.gz")"
echo "C · $FILE, which the cards were read off, one byte longer:"
cp "$FILE" "$W/file.kept"
printf ' ' >> "$FILE"
index
node tools/check-chain-book-v2.mjs --dir "$W/chain" > "$W/c.log" 2>&1; echo "   exit $?"; verdict "$W/c.log" | sed 's/^/   /'
cp "$W/file.kept" "$FILE"; cmp -s "$FILE" "$W/file.kept" && echo "   $FILE put back, byte for byte"
index
echo "everything back:"
node tools/check-chain-book-v2.mjs --dir "$W/chain" > "$W/back.log" 2>&1; echo "   exit $?"; verdict "$W/back.log" | sed 's/^/   /'
