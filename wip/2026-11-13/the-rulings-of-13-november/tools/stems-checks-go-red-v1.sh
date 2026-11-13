#!/usr/bin/env bash
# The check of the stems extension (tools/check-stems-extension-v1.mjs), shown to fail when what it guards is not so.
# Each fault is put into one file of the tree by stems-tamper-v1.py, the check is run, and the file is put back from
# a kept copy, byte for byte. One fault (I) is not put into the tree at all: the check is handed a copy of the
# corpus lane's file of lines that is other bytes.
#     A  the extension's receipt is other bytes than its pin names
#     B  the pinned rulings are other bytes than their pin names
#     C  in a book's sidecar, a row of the extension carries another stem than its line gives
#     D  in a book's sidecar, a row of the extension loses its stems
#     E  in a book's sidecar, a row no line names is given stems
#     F  a book's sidecar says a branch rests otherwise than the ruling sets it
#     G  a book's sidecar counts one row more than it gave stems
#     H  the page does not ask the rows beside the store their stem
#     I  the file of lines handed to the check is other bytes than its pin names
# bash stems-checks-go-red-v1.sh <reader dir> <scratch dir> <the file of lines> <a book whose sidecar to change> <the extension's m ids, comma separated> ["<letters to run>"]
# Each fault writes a line to <scratch dir>/progress.txt as it begins and as it is put back, so a run cut short says
# which file is still to put back (<scratch dir>/kept is its copy).
set -u
R="$1"; W="$2"; LINES="$3"; BOOK="$4"; MS="$5"; ONLY="${6:-}"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$W"
cd "$R"
verdict() { grep -E "^FAIL|^all checks passed|FAILED$|^PAGE ERROR|Error" "$1" | cut -c1-300; }
stems() { node tools/check-stems-extension-v1.mjs --extension "${1:-$LINES}"; }
SIDE="data/zones/$BOOK.lattice.bin"
wanted() { [ -z "$ONLY" ] || [[ " $ONLY " == *" $1 "* ]]; }
try() {   # <letter> <what is said> <the file changed> <mode and its arguments...>
  local letter="$1" said="$2" file="$3"; shift 3
  wanted "$letter" || return 0
  echo "$letter · $said:"
  cp "$file" "$W/kept"
  echo "$(date -u +%H:%M:%S) $letter begins: $file is changed, its copy is $W/kept" >> "$W/progress.txt"
  python3 -I "$HERE/stems-tamper-v1.py" "$@" | sed 's/^/   /'
  stems > "$W/$letter.log" 2>&1; echo "   exit $?"; verdict "$W/$letter.log" | sed 's/^/   /'
  cp "$W/kept" "$file"; cmp -s "$W/kept" "$file" && echo "   $file put back, byte for byte"
  echo "$(date -u +%H:%M:%S) $letter put back" >> "$W/progress.txt"
}
if [ -z "$ONLY" ]; then
  echo "the tree as it stands:"
  stems > "$W/0.log" 2>&1; echo "   exit $?"; verdict "$W/0.log" | sed 's/^/      /'
fi
RCPT="$(ls data/stems-extension/*/receipt-*.json | head -1)"
RUL="$(ls data/rulings/*/rulings-*.json | head -1)"
try A "the extension's receipt is other bytes than its pin names" "$RCPT" swap "$RCPT"
try B "the pinned rulings are other bytes than their pin names" "$RUL" swap "$RUL"
try C "in $BOOK's sidecar, a row of the extension carries another stem than its line gives" "$SIDE" stem-change "$SIDE" "$MS"
try D "in $BOOK's sidecar, a row of the extension loses its stems" "$SIDE" stem-drop "$SIDE" "$MS"
try E "in $BOOK's sidecar, a row no line names is given stems" "$SIDE" stem-add "$SIDE" "$MS"
try F "$BOOK's sidecar says a branch rests otherwise than the ruling sets it" "$SIDE" record-branch "$SIDE"
try G "$BOOK's sidecar counts one row more than it gave stems" "$SIDE" record-count "$SIDE"
try H "the page does not ask the rows beside the store their stem" zone.html page-beside-off zone.html
if wanted I; then
  echo "I · the file of lines handed to the check is other bytes than its pin names:"
  cp "$LINES" "$W/lines-other-bytes.jsonl"
  python3 -I "$HERE/stems-tamper-v1.py" swap "$W/lines-other-bytes.jsonl" | sed 's/^/   /'
  stems "$W/lines-other-bytes.jsonl" > "$W/I.log" 2>&1; echo "   exit $?"; verdict "$W/I.log" | sed 's/^/   /'
  rm -f "$W/lines-other-bytes.jsonl"
fi
echo "everything back:"
stems > "$W/back.log" 2>&1; echo "   exit $?"; verdict "$W/back.log" | sed 's/^/      /'
