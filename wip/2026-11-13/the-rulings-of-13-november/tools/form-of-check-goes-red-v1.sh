#!/usr/bin/env bash
# check-form-of-v1, shown to fail when what it guards is not so, nine ways. Each fault is put into one file of the
# tree by form-of-tamper-v1.py, the check is run against the tree's own pages, and the file is put back from a kept
# copy, byte for byte.
#   A  the corpus lane's map is other bytes than its pin names (same size)
#   B  the owner's rulings as the lane pinned them are other bytes
#   C  the record gives a resolved pointer another English than the lane's file
#   D  a pure pointer of the lane's file is missing from the record
#   E  the record resolves a pointer the lane's file and the rulings leave unresolved
#   F  the record carries the readings with English of their own as pointers, each with an English (ruling 5 undone)
#   G  the page finds a pointer's entry by its text as written (the fault found and fixed on 13 November)
#   H  the page prints a resolved pointer's English without the pointer beside it
#   I  the pill does not carry the pointer's own text
# bash form-of-check-goes-red-v1.sh <reader dir> <scratch dir> <the address the reader dir is served at>
set -u
R="$1"; W="$2"; BASE="$3"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$W"
cd "$R"
verdict() { grep -E "^FAIL|^all checks passed|^PAGE ERROR" "$1" | cut -c1-330; }
PIN_DIR=data/pointer-entries
MAP="$(ls $PIN_DIR/*/zone-pills-*.jsonl | head -1)"
RULINGS="$(ls data/rulings/*/*.json | head -1)"
RECORD=data/form-of-pills-v1.json
try() {   # <letter> <what is said> <the file changed> <mode and its arguments...>
  local letter="$1" said="$2" file="$3"; shift 3
  echo "$letter · $said:"
  cp "$file" "$W/kept"
  python3 -I "$HERE/form-of-tamper-v1.py" "$@" | sed 's/^/   /'
  node tools/check-form-of-v1.mjs "$BASE" > "$W/$letter.log" 2>&1; echo "   exit $?"; verdict "$W/$letter.log" | sed 's/^/   /'
  cp "$W/kept" "$file"; cmp -s "$W/kept" "$file" && echo "   $file put back, byte for byte"
}
echo "the tree as it stands:"
node tools/check-form-of-v1.mjs "$BASE" > "$W/0.log" 2>&1; echo "   exit $?"; verdict "$W/0.log" | sed 's/^/   /'
try A "the corpus lane's map is other bytes than its pin names" "$MAP" swap "$MAP"
try B "the owner's rulings as the lane pinned them are other bytes" "$RULINGS" swap "$RULINGS"
try C "the record gives a resolved pointer another English than the lane's file" "$RECORD" record-english "$RECORD"
try D "a pure pointer of the lane's file is missing from the record" "$RECORD" record-drop "$RECORD"
try E "the record resolves a pointer the lane's file and the rulings leave unresolved" "$RECORD" record-resolve "$RECORD"
try F "the record carries the readings with English of their own as pointers with an English" "$RECORD" record-mixed-all "$RECORD" "$MAP"
try G "the page finds a pointer's entry by its text as written" zone.html page-as-written zone.html
try H "the page prints a resolved pointer's English without the pointer beside it" zone.html page-says zone.html
try I "the pill does not carry the pointer's own text" zone.html page-no-pointer zone.html
echo "everything back:"
node tools/check-form-of-v1.mjs "$BASE" > "$W/back.log" 2>&1; echo "   exit $?"; verdict "$W/back.log" | sed 's/^/   /'
git status --short | head -20
