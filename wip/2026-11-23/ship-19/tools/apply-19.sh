#!/bin/bash
# Ship 19 (23 November 2026) on a reader tree at main 7f6c862105 (or main with ship 20), in order: the corpus lane's
# relay v218, the entry lists v1.1, and with them BDB's own entries (b), landed for the first time.
#   1. the inputs: each file of relay v218 the pin keeps is the bytes the letter names (the pin's own patch holds them),
#      and English Wiktionary's two reissues name the same rows line for line and differ only where each relay says
#      (v211's in t, v218's in n and b with what_changes and class on the lines its changes name), as v218's reissue
#      of v204's list does against v204's: else it stops here and decides nothing;
#   2. the tools: the entries tool lands b from a list and reads a fact from the list beside another (patch 19-02); the
#      entry gate's check lets b stand on a row whose list lands it and reads the list beside (patch 19-03); the
#      document (patch 19-04); the leaders the projector bakes at a kind of place gather BDB's entries from every row
#      of the key, as the page does, and so does the check that walks them (patch 19-05), and the document says so
#      (patch 19-06);
#   3. the pin: v218's lists in place of v211's (n and b) and v204's, v211's kept beside for t (patch 19-01);
#   4. the store steps, then each once more, dry: nothing left to write.
# A step whose work the tree carries already is said and passed, and run over a tree that carries all of it this
# writes nothing. It stops at the first fault and says where. The round follows it.
# Usage: apply-19.sh <reader dir> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; W=${2:?log dir}; mkdir -p $W; L=$W/apply.log
T=$S/s28w/tools
V218=$S/dl-v218-data/v2/ledgers/all/entry-ledger/lists-v1.1
LETTER=$S/dl-letters-v218-v220/v2/letters/moses-entry-ledger-v1/FOR-ELIJAH-v218.md
V203=$S/dl-v203-data/v2/ledgers/all/entry-ledger/wiktionary-v1/facts-slot-wiktionary-v1.tsv
V204=$S/dl-v204-data/v2/ledgers/all/entry-ledger/classical-and-hebrew-wiktionary-v1/facts-slot-v1.tsv
V211=$S/dl-v211-data/v2/ledgers/all/entry-ledger/tbesh-letters-v1/facts-slot-t-v1.1.tsv
AT=2026-11-23T14:00:
. $S/s28w/env.sh
cd $R || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
# run <what> <command...>: the command, its words into the log and its last line said; it stops here on a fault
run() { local what=$1; shift; "$@" > $W/step.out 2>&1; local c=$?; cat $W/step.out >> $L; tail -1 $W/step.out | cut -c1-300 | sed 's/^/  /'; [ $c = 0 ] || stop "$what"; }
store() { python3 -c "import json;i=json.load(open('data/route-store/index.json'));print(i['store_version'], i['counts']['routes'], 'routes', i['counts']['keys'], 'keys')"; }

say "the inputs: the letter of relay v218, and the lists each relay names, held line by line"
head -1 $LETTER | grep -q " v218 " || stop "the letter given is not relay v218's"
for x in "4cb9e9ce6b30331e04eecbdd35ff945c302ceafa354f4a4b7deeecaef0cbd99e $V203" "a6e3271cbf7a328ae53d4ce38ea4459662d98c76c334a96f5bc4290684b2344e $V211" \
  "5bc044bad2003f468592933fb5cf9c5f0ccbc54a608973ce4b466c351a6f1aeb $V204" "b16c45ce865f2262976dd6edad22d7e3776fdb478ac9fc4a25b81e88bea669d7 $V218/facts-slot-wiktionary-v1.1.tsv" \
  "c4c0c9d2bc917fc615296dbaed8ecad6d30209519dc53e5bd4cf78fc80f41eed $V218/facts-slot-v1.1.tsv" "c592c888c829b4a27e74f6d8774fbc3834550e82cf3a27e24390f8a66955f9c4 $V218/changes-v1.1.jsonl"; do
  set -- $x; [ "$(sha256sum "$2" | cut -c1-64)" = "$1" ] || stop "$2 is not the bytes its relay's letter names"
done
echo "  6 lists, each the bytes its relay's letter names (v203, v211, v204; v218's two and its changes)" | tee -a $L
run "the two reissues of English Wiktionary's list, and v218's reissue of v204's, line by line" \
  python3 -I $T/compare-entry-lists-v1.py $V203 $V211 $V218/facts-slot-wiktionary-v1.1.tsv $V204 $V218/facts-slot-v1.1.tsv $V218/changes-v1.1.jsonl $W/compare-entry-lists.json
grep -q '"verdict": "THE SAME ROWS, AND EACH DIFFERS ONLY WHERE ITS RELAY SAYS"' $W/compare-entry-lists.json || stop "the lists do not name the same rows"
say "the store before: $(store)"

say "the tools"
run "the entries tool: b from a list, and a fact from the list beside another (patch 19-02)" python3 -I $T/patch-19-02-entries-tool-b-and-a-list-beside.py .
run "the entry gate's check: b on a row whose list lands it, and the list beside (patch 19-03)" python3 -I $T/patch-19-03-entry-gate-b-on-a-list.py .
if [ -f PIPELINE.md ]; then run "the document (patch 19-04)" python3 -I $T/patch-19-04-pipeline-doc.py .; fi
run "the leaders at a kind of place: BDB's entries gathered from the whole key (patch 19-05)" python3 -I $T/patch-19-05-leaders-gather-the-whole-key.py .
if [ -f PIPELINE.md ]; then run "the document: the leaders at rest (patch 19-06)" python3 -I $T/patch-19-06-pipeline-doc-leaders.py .; fi
for f in apply-row-entries-v1 check-entry-gate-v1 project-lattice-v12-v1 check-sign-does-not-lead-v1; do node --check tools/$f.mjs >> $L 2>&1 || stop "syntax of $f"; done
echo "  4 tools parse" | tee -a $L

say "the pin"
run "the row entries' pin: the entry lists v1.1 (patch 19-01)" python3 -I $T/patch-19-01-entries-pin-lists-v1.1.py $R $V218 $LETTER

say "the store steps"
CANDIDATES="$V218/facts-slot-wiktionary-v1.1.tsv $V211 $V203"
LISTS=$(python3 -I $T/pinned-lists-19.py $R "$ROW_ENTRIES_LISTS" $CANDIDATES) || stop "a list the pin names is not here: $LISTS"
LISTARGS=(); for f in $LISTS; do LISTARGS+=(--list "$f"); done
node tools/apply-row-entries-v1.mjs --ledger $ROW_ENTRIES_LEDGER "${LISTARGS[@]}" --dry > $W/entries-dry.log 2>&1 || { grep REFUSED $W/entries-dry.log | cut -c1-400 | tee -a $L; stop "the entries, rehearsed"; }
grep "^  list ·" $W/entries-dry.log | cut -c1-400 | tee -a $L
if grep -q '"rows_moved":0,' $W/entries-dry.log && grep -q '"the_index_names_this_run":true' $W/entries-dry.log; then
  echo "  the entries stand already: no row moves and the index names the lists as the pin does" | tee -a $L
  bash $T/store-steps-dry-19.sh $R $W || stop "the store steps, each once more, dry"
else
  bash $T/store-steps-19.sh $R $AT $W || stop "the store steps"
fi
say "APPLIED · store $(store)"
