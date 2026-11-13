#!/usr/bin/env bash
# check-made-spaces-v1, shown to fail when what it guards is not so, eight ways. Each fault is put into one file of
# the tree by made-spaces-tamper-v2.py, the check is run, and the file is put back from a kept copy, byte for byte.
#   A  a store row of the first relay's source that should carry its route's closes carries no slot
#   B  a store row's first close moved one place on
#   C  the page's `closed` keeps the space it should leave out
#   D  a list of the first relay names another place than the corpus lane wrote
#   E  a store row of the second relay's source loses its slot
#   F  the second relay's list closes a space that stands for words taken out
#   G  the index's record of a source's rows is another sha256
#   H  the index says a source's rows are not the rows its list was read from. This one is NOT a failure wherever
#      another rule has moved the store since the list was read: the check then has only the index's own record to go
#      by, so it stops judging that source's counts and says so on its M5 line ("said, not judged"). It fails only
#      where the store's own history shows no move but this rule's. Run here to show which of the two happens
# bash made-spaces-check-goes-red-v2.sh <reader dir> <scratch dir> <m id of the second relay's source> <m id of a first relay's source>
set -u
R="$1"; W="$2"; M2="$3"; M1="$4"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$W"
cd "$R"
verdict() { grep -E "^FAIL|^all checks passed|FAILED$|^  --" "$1" | cut -c1-420; }
LIST1="$(ls data/made-spaces/made-spaces-v1/*.jsonl | head -1)"
LIST2="$(ls data/made-spaces/made-spaces-v2/*.made-spaces-v2.jsonl | head -1)"
NEVER="$(ls data/made-spaces/made-spaces-v2/*.words-taken-out-v2.jsonl | head -1)"
SHARD1="$(python3 -I "$HERE/made-spaces-tamper-v2.py" find data/route-store/shards "$M1")"
SHARD2="$(python3 -I "$HERE/made-spaces-tamper-v2.py" find data/route-store/shards "$M2")"
try() {   # <letter> <what is said> <the file changed> <mode and its arguments...>
  local letter="$1" said="$2" file="$3"; shift 3
  echo "$letter · $said:"
  cp "$file" "$W/kept"
  python3 -I "$HERE/made-spaces-tamper-v2.py" "$@" | sed 's/^/   /'
  node tools/check-made-spaces-v1.mjs > "$W/$letter.log" 2>&1; echo "   exit $?"; verdict "$W/$letter.log" | sed 's/^/   /'
  cp "$W/kept" "$file"; cmp -s "$W/kept" "$file" && echo "   $file put back, byte for byte"
}
echo "the tree as it stands:"
node tools/check-made-spaces-v1.mjs > "$W/0.log" 2>&1; echo "   exit $?"; verdict "$W/0.log" | sed 's/^/   /'
try A "a store row of $M1 that should carry its route's closes carries no slot" "$SHARD1" drop "$SHARD1" "$M1"
try B "a store row's first close moved one place on" "$SHARD1" shift "$SHARD1" "$M1"
try C "the page's own function keeps the space it should leave out" zone.html page zone.html
try D "a list of the first relay names another place than the corpus lane wrote" "$LIST1" list "$LIST1"
try E "a store row of $M2 loses its slot" "$SHARD2" drop "$SHARD2" "$M2"
try F "the second relay's list closes a space that stands for words taken out" "$LIST2" never "$LIST2" "$NEVER"
try G "the index's record of $M2's rows is another sha256" data/route-store/index.json record data/route-store/index.json "$M2"
try H "the index says $M1's rows are not the rows its list was read from" data/route-store/index.json stale data/route-store/index.json "$M1"
echo "everything back:"
node tools/check-made-spaces-v1.mjs > "$W/back.log" 2>&1; echo "   exit $?"; verdict "$W/back.log" | sed 's/^/   /'
