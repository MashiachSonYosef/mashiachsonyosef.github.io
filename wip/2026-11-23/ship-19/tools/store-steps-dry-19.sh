#!/bin/bash
# Ship 19 (23 November 2026): each store step once more, dry, as ship 18's second run did: each must find nothing to
# write (the sources' years: none moves; the entries: no row moves and the index names the lists as they are read).
# Run in the environment of the round (S/s28w/env.sh). Usage: store-steps-dry-19.sh <reader dir> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; W=${2:?log dir}; mkdir -p $W; L=$W/apply.log
. $S/s28w/env.sh
cd $R || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
# moved <log>: a dry run of a store step that would move nothing (at least one count of none, and no count of some)
moved() { grep -qE '· 0 slots move ·|· 0 rows move|0 rows move \(|"rows_moved":0' $1 && ! grep -qE '· [1-9][0-9,]* (rows|slots) move|"rows_moved":[1-9]' $1; }
CANDIDATES="$S/dl-v218-data/v2/ledgers/all/entry-ledger/lists-v1.1/facts-slot-wiktionary-v1.1.tsv $S/dl-v211-data/v2/ledgers/all/entry-ledger/tbesh-letters-v1/facts-slot-t-v1.1.tsv $S/dl-v203-data/v2/ledgers/all/entry-ledger/wiktionary-v1/facts-slot-wiktionary-v1.tsv"
LISTS=$(python3 -I $S/s28w/tools/pinned-lists-19.py $R "$ROW_ENTRIES_LISTS" $CANDIDATES)
[ $? = 0 ] && [ -n "$LISTS" ] || stop "a list the row entries' pin names is not here: $LISTS"
LISTARGS=(); for f in $LISTS; do LISTARGS+=(--list "$f"); done
say "each store step once more, dry: nothing left to write"
for t in apply-ledger-divisions-v1 apply-made-spaces-v1 apply-own-pointing-v1 apply-name-rows-v1 apply-sense-openings-v1 apply-ubs-collocations-v1; do
  node tools/$t.mjs --dry > $W/again-$t.log 2>&1 || stop "$t, dry"
  moved $W/again-$t.log || stop "$t would write"
  echo "  $t: nothing to write" | tee -a $L
done
node tools/apply-source-years-v1.mjs --dry > $W/again-years.log 2>&1 || stop "the sources' years, dry"
grep -q "· 0 years move in the store (0 shards) · 0 in the span store (0 books)" $W/again-years.log || stop "a source's year would move"
echo "  apply-source-years-v1: nothing to write" | tee -a $L
node tools/apply-row-entries-v1.mjs --ledger $ROW_ENTRIES_LEDGER "${LISTARGS[@]}" --dry > $W/again-entries.log 2>&1 || { grep REFUSED $W/again-entries.log | cut -c1-400 | tee -a $L; stop "the entries, dry"; }
moved $W/again-entries.log || stop "the entries would move a row"
grep -q '"the_index_names_this_run":true' $W/again-entries.log || stop "the entries: the index does not name the lists as the pin does"
echo "  apply-row-entries-v1: nothing to write (no row moves, and the index names the ledger and the lists as the pin does)" | tee -a $L
