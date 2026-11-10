#!/bin/bash
# The line under a word against its card's first reading, across books, on one build.
# bash proofs-across-books.sh <before|after> <orders|verses|rest> <log>
#   before: the shipped commit's reader (port 8915). after: the build tree's (port 8899).
#   orders: the spellings whose masoretic or vowels-differ leader moved, six books.
#   verses: "cites here" at verses whose own list differs from the first verse's and names another leader, three books.
#   rest:   a name leading under another spelling, the two order columns, and the 80-word survey (one book).
# Each line of the log is one run of line-vs-first-pill.mjs. Nothing is written but the log.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
SIDE="$1"; SET="$2"; LOG="$3"
case "$SIDE" in
  before) R="$S/old/reader"; URL="http://127.0.0.1:8915/zone.html";;
  after)  R="$S/pt/reader";  URL="http://127.0.0.1:8899/zone.html";;
  *) echo "side: before or after"; exit 2;;
esac
P="$S/v30/probes/line-vs-first-pill.mjs"; C="$S/v30/cases"
STANDS="--ls fh.pointing-stands-2026-11-06=1"
run() { # <title> <book> <cases> <switches...>
  local title="$1" book="$2" cases="$3"; shift 3
  [ -f "$C/$cases" ] || { echo "== $SIDE · $title · $cases: no such case list" >> "$LOG"; return; }
  echo "== $SIDE · $title · $cases" >> "$LOG"
  node "$P" "$R" "$URL" "$book" "$C/$cases" "$@" --show 6 >> "$LOG" 2>&1 || echo "   (the probe exited $?)" >> "$LOG"
}
: > "$LOG"
case "$SET" in
  orders)
    for b in genesis isaiah psalms ruth daniel jonah; do
      run "masoretic order, the Masorah kept · the reading moved" "$b" "$b-m-reading.json" --ls fh.masorah=keep --ls fh.def.order=masoretic $STANDS
      run "masoretic order, the Masorah kept · the credit moved"  "$b" "$b-m-credit.json"  --ls fh.masorah=keep --ls fh.def.order=masoretic $STANDS
      run "the Masorah lifted (letters) · the reading moved"       "$b" "$b-x-reading.json" --ls fh.masorah=letters $STANDS
      run "the Masorah lifted (letters) · the credit moved"        "$b" "$b-x-credit.json"  --ls fh.masorah=letters $STANDS
    done;;
  verses)
    for b in genesis psalms amos; do
      run "cites here, the Masorah kept · a verse whose own list names another leader" "$b" "$b-cites-own.json" --ls fh.masorah=keep --ls fh.def.order=cites $STANDS
    done;;
  rest)
    run "oldest first · a name leads and the pills keep another spelling of it" amos amos-names-other-text.json --ls fh.def.order=oldest
    run "fewest characters, the Masorah kept · keys the column did not hold"     amos amos-missing-characters.json --ls fh.masorah=keep --ls fh.def.order=characters $STANDS
    run "fewest characters, the Masorah kept · keys the column held stale"       amos amos-stale-characters.json   --ls fh.masorah=keep --ls fh.def.order=characters $STANDS
    run "the corpus's own, the Masorah kept · keys the column did not hold"      amos amos-missing-corpus.json     --ls fh.masorah=keep --ls fh.def.order=corpus $STANDS
    run "the corpus's own, the Masorah kept · keys the column held stale"        amos amos-stale-corpus.json       --ls fh.masorah=keep --ls fh.def.order=corpus $STANDS
    run "at rest · 80 words spread over the book"                                 amos amos-sample-80.json
    run "the Masorah lifted (letters) · 80 words spread over the book"            amos amos-sample-80.json --ls fh.masorah=letters $STANDS
    run "masoretic order, the Masorah kept · 80 words spread over the book"       amos amos-sample-80.json --ls fh.masorah=keep --ls fh.def.order=masoretic $STANDS;;
  *) echo "set: orders, verses or rest"; exit 2;;
esac
echo "PROOFS-DONE $SIDE $SET" >> "$LOG"
