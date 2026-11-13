#!/usr/bin/env bash
# The check of the sense openings (tools/check-sense-openings-v1.mjs), shown to fail when what it guards is not so.
# Each fault is put into one file of the tree by openings-tamper-v1.py, the check is run, and the file is put back
# from a kept copy, byte for byte.
#     A  the list of openings is other bytes than its pin names
#     B  the pinned rulings are other bytes than their pin names
#     C  a listed row of the store loses its mark
#     D  a row of the ruled source that no line names is given a mark
#     E  a marked row names another point than its line gives
#     F  the index's record counts one row more than is marked
#     G  the index's record cites the ruling with another print than the pinned one
#     H  a book's sidecar gives a surface the words of a note as its leader
#     I  the page's readingsOfRow reads a marked row as any other
#     J  the page's pool leaves the marked rows among its rows and takes no notes
#     K  the page takes its notes from every row of the key, whatever its switches withhold
#     L  the page puts no notes line with the record
#     M  the store's reader reads a marked row as any other
# bash openings-checks-go-red-v1.sh <reader dir> <scratch dir> <a book whose sidecar to change> <the ruled source's m id> ["<letters to run>"]
# Each fault writes a line to <scratch dir>/progress.txt as it begins and as it is put back, so a run cut short says
# which file is still to put back (<scratch dir>/kept is its copy).
set -u
R="$1"; W="$2"; BOOK="$3"; M="$4"; ONLY="${5:-}"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$W"
cd "$R"
verdict() { grep -E "^FAIL|^all checks passed|FAILED$|^PAGE ERROR|Error" "$1" | cut -c1-300; }
run() { node tools/check-sense-openings-v1.mjs; }
wanted() { [ -z "$ONLY" ] || [[ " $ONLY " == *" $1 "* ]]; }
try() {   # <letter> <what is said> <the file changed> <mode and its arguments...>
  local letter="$1" said="$2" file="$3"; shift 3
  wanted "$letter" || return 0
  echo "$letter · $said:"
  cp "$file" "$W/kept"
  echo "$(date -u +%H:%M:%S) $letter begins: $file is changed, its copy is $W/kept" >> "$W/progress.txt"
  python3 -I "$HERE/openings-tamper-v1.py" "$@" | sed 's/^/   /'
  run > "$W/$letter.log" 2>&1; echo "   exit $?"; verdict "$W/$letter.log" | sed 's/^/   /'
  cp "$W/kept" "$file"; cmp -s "$W/kept" "$file" && echo "   $file put back, byte for byte"
  echo "$(date -u +%H:%M:%S) $letter put back" >> "$W/progress.txt"
}
if [ -z "$ONLY" ]; then
  echo "the tree as it stands:"
  run > "$W/0.log" 2>&1; echo "   exit $?"; verdict "$W/0.log" | sed 's/^/      /'
fi
LIST="$(ls data/sense-openings/*/numbered-sense-openings-*.jsonl | head -1)"
RUL="$(ls data/rulings/*/rulings-*.json | head -1)"
# a shard that holds a marked row: the first, by name
SHARD="$(python3 -I -c "
import glob, gzip, json, sys
for p in sorted(glob.glob('data/route-store/shards/*.bin')):
    body = json.loads(gzip.open(p).read().decode('utf-8'))
    if any(len(r) > 10 and isinstance(r[10], dict) and 'opens' in r[10] for rows in body.values() for r in rows):
        print(p); break
")"
SIDE="data/zones/$BOOK.lattice.bin"
try A "the list of openings is other bytes than its pin names" "$LIST" swap "$LIST"
try B "the pinned rulings are other bytes than their pin names" "$RUL" swap "$RUL"
try C "a listed row of the store loses its mark" "$SHARD" mark-drop "$SHARD"
try D "a row of the ruled source that no line names is given a mark" "$SHARD" mark-add "$SHARD" "$M"
try E "a marked row names another point than its line gives" "$SHARD" mark-point "$SHARD"
try F "the index's record counts one row more than is marked" data/route-store/index.json index-count data/route-store/index.json
try G "the index's record cites the ruling with another print than the pinned one" data/route-store/index.json index-print data/route-store/index.json
try H "$BOOK's sidecar gives a surface the words of a note as its leader" "$SIDE" leader-note "$SIDE" data/route-store/shards
try I "the page's readingsOfRow reads a marked row as any other" zone.html page-reads zone.html
try J "the page's pool leaves the marked rows among its rows and takes no notes" zone.html page-keeps zone.html
try K "the page takes its notes from every row of the key, whatever its switches withhold" zone.html page-all zone.html
try L "the page puts no notes line with the record" zone.html page-band zone.html
try M "the store's reader reads a marked row as any other" tools/gloss-store-v1.mjs reader-reads tools/gloss-store-v1.mjs
echo "everything back:"
run > "$W/back.log" 2>&1; echo "   exit $?"; verdict "$W/back.log" | sed 's/^/      /'
