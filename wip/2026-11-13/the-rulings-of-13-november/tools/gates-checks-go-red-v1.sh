#!/usr/bin/env bash
# The checks of the two gates, shown to fail when what they guard is not so. Each fault is put into one file of the
# tree by gates-tamper-v1.py, the check that should catch it is run, and the file is put back from a kept copy,
# byte for byte.
#   the entry gate (tools/check-entry-gate-v1.mjs)
#     A  a row is filed under another number than its ledger line gives
#     B  a row loses its facts
#     C  a row's STEP tag carries another letter
#     D  a word carries another tag than the lattice's
#     E  a leader a kind of place holds is another text
#     F  a surface loses its leaders at a kind of place
#     G  the page's pool keeps the rows of another entry
#     H  the page's numberOf writes a number another way
#     I  the page reads the surface's own leaders at every place
#     J  the ledger's receipt is other bytes than its pin names
#     S  the card names the place's entry by its number alone, where a row is asked by letter (run last)
#   the names gate (tools/check-names-gate-v1.mjs)
#     K  a listed row loses its mark
#     L  a row no line lists is marked a name
#     M  a listed place loses its mark
#     N  a place no line lists is marked a name place
#     O  the page's pool keeps the rows given as a name
#     P  the page's nameWithheld is turned about
#     Q  the list of name places is other bytes than its pin names
#   the made spaces (tools/check-made-spaces-v1.mjs)
#     R  the index says a source's rows are not the rows its list was read from, while they are (the fault the
#        check did not catch on 13 November's first ship)
# bash gates-checks-go-red-v1.sh <reader dir> <scratch dir> <lattice dir> <row entries ledger> <a book whose zone to change> <m id of a made-spaces source> ["<letters to run, e.g. D M N>"]
# With letters named, only those faults are tried (the tree as it stands is not judged first; it is judged after).
set -u
R="$1"; W="$2"; LATTICE="$3"; LEDGER="$4"; BOOK="$5"; MS="$6"; ONLY="${7:-}"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$W"
cd "$R"
verdict() { grep -E "^FAIL|^all checks passed|FAILED$|^PAGE ERROR|Error" "$1" | cut -c1-300; }
entry() { LATTICE_DIR="$LATTICE" node tools/check-entry-gate-v1.mjs --ledger "$LEDGER" --lattice "$LATTICE"; }
names() { node tools/check-names-gate-v1.mjs; }
spaces() { node tools/check-made-spaces-v1.mjs; }
SHARDS=data/route-store/shards
ZONE="data/zones/$BOOK.bin"; SIDE="data/zones/$BOOK.lattice.bin"
try() {   # <letter> <which check> <what is said> <the file changed> <mode and its arguments...>
  local letter="$1" which="$2" said="$3" file="$4"; shift 4
  if [ -n "$ONLY" ] && [[ " $ONLY " != *" $letter "* ]]; then return 0; fi
  echo "$letter · $said:"
  cp "$file" "$W/kept"
  python3 -I "$HERE/gates-tamper-v1.py" "$@" | sed 's/^/   /'
  "$which" > "$W/$letter.log" 2>&1; echo "   exit $?"; verdict "$W/$letter.log" | sed 's/^/   /'
  cp "$W/kept" "$file"; cmp -s "$W/kept" "$file" && echo "   $file put back, byte for byte"
}
find_shard() { python3 -I "$HERE/gates-tamper-v1.py" find "$SHARDS" "$1"; }
if [ -z "$ONLY" ]; then
  echo "the tree as it stands:"
  for c in entry names spaces; do "$c" > "$W/0-$c.log" 2>&1; echo "   $c · exit $?"; verdict "$W/0-$c.log" | sed 's/^/      /'; done
fi
SN="$(find_shard n)"; ST="$(find_shard t)"; SM="$(find_shard name)"
try A entry "a row is filed under another number than its ledger line gives" "$SN" facts-number "$SN"
try B entry "a row loses its facts" "$SN" facts-drop "$SN"
try C entry "a row's STEP tag carries another letter" "$ST" facts-letter "$ST"
try D entry "a word carries another tag than the lattice's" "$ZONE" word-tag "$ZONE"
try E entry "a leader a kind of place holds is another text" "$SIDE" leader "$SIDE"
try F entry "a surface loses its leaders at a kind of place" "$SIDE" leader-drop "$SIDE"
try G entry "the page's pool keeps the rows of another entry" zone.html page-entry-off zone.html
try H entry "the page's numberOf writes a number another way" zone.html page-entry-number zone.html
try I entry "the page reads the surface's own leaders at every place" zone.html page-leaders-own zone.html
RCPT="$(ls data/row-entries/*/receipt-*.json | head -1)"
try J entry "the ledger's receipt is other bytes than its pin names" "$RCPT" swap "$RCPT"
try K names "a listed row loses its mark" "$SM" name-drop "$SM"
try L names "a row no line lists is marked a name" "$SN" name-add "$SN"
try M names "a listed place loses its mark" "$ZONE" np-drop "$ZONE"
try N names "a place no line lists is marked a name place" "$ZONE" np-add "$ZONE"
try O names "the page's pool keeps the rows given as a name" zone.html page-name-off zone.html
try P names "the page's nameWithheld is turned about" zone.html page-name-fn zone.html
PLACES="$(ls data/names/*/place-names-*.jsonl | head -1)"
try Q names "the list of name places is other bytes than its pin names" "$PLACES" swap "$PLACES"
try R spaces "the index says $MS's rows are not the rows its list was read from, while they are" data/route-store/index.json stale data/route-store/index.json "$MS"
try S entry "the card names the place's entry by its number alone, where a row is asked by letter" zone.html page-entry-said zone.html
echo "everything back:"
for c in entry names spaces; do "$c" > "$W/back-$c.log" 2>&1; echo "   $c · exit $?"; verdict "$W/back-$c.log" | sed 's/^/      /'; done
