#!/bin/bash
# Ship 20 (23 November 2026): the store steps ship 20's lists move, in the order of ships 5 and 6 from the names on (the
# names, the sense openings, UBS's collocations: the category derived again dry first, and it must be the bytes its pin
# names, since it reads the names), each given its moment; then every store step once more, dry, each finding nothing to
# write (as ship 18's second run did), the entries' with the lists the row entries' pin names found by their bytes (on
# main and on main with ship 19 alike). Run in the environment of the round (S/s21w/env.sh).
# Usage: store-steps-20.sh <reader dir> <moment prefix, as 2026-11-23T20:00:> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; AT=${2:?moment prefix}; W=${3:?log dir}; mkdir -p $W; L=$W/apply.log
T=$S/s29w/tools
. $S/s21w/env.sh
cd $R || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
last() { grep -v "^figures " $1 | grep -v "^dry run\|^written" | tail -1 | cut -c1-400 | tee -a $L; }
# moved <log>: a dry run of a store step that would move nothing (at least one count of none, and no count of some)
moved() { grep -qE '· 0 slots move ·|· 0 rows move|0 rows move \(|"rows_moved":0' $1 && ! grep -qE '· [1-9][0-9,]* (rows|slots) move|"rows_moved":[1-9]' $1; }
UBS="${UBS_SOURCE_CACHE:-$S/v77/ship56-design/call7-signs/dl-ubs/old-local-999-footsteps/ledgers/work/ldmprs/source-cache/ubs-sdbh-hebrew-2026-07-15}"
PICKS=$S/v54/picks-v1-2/ledger

say "the names"
node tools/apply-name-rows-v1.mjs --on ${AT}14.000Z > $W/names.log 2>&1 || { grep REFUSED $W/names.log | cut -c1-400 | tee -a $L; stop "the names"; }; last $W/names.log
grep "^written\|^nothing moves" $W/names.log | cut -c1-200 | sed 's/^/  /' | tee -a $L
say "the sense openings"
node tools/apply-sense-openings-v1.mjs --on ${AT}15.000Z > $W/sense-openings.log 2>&1 || { grep REFUSED $W/sense-openings.log | cut -c1-400 | tee -a $L; stop "the sense openings"; }; last $W/sense-openings.log
say "UBS's collocations: the category derived again dry (the list must be the pin's bytes: no row of UBS's is a name row it was not), then laid"
node tools/derive-ubs-collocations-v1.mjs --dictionary "$UBS/UBSHebrewDic-v0.9.2-en.JSON" --routes "$UBS/ubs-sdbh-hebrew-definition-routes-v1.csv.gz" --ledger "$PICKS" --dry > $W/ubs-derive.log 2>&1
python3 - $W/ubs-derive.log data/ubs-collocations/PIN.json > $W/ubs-held.log <<'PY'
import sys, json
fig = [l for l in open(sys.argv[1], encoding="utf-8") if l.startswith("figures ")]
if not fig: print("  the derive printed no figures"); sys.exit(1)
got = [f for f in json.loads(fig[-1][8:])["files"] if f["what"] == "list"][0]
pin = open(sys.argv[2], encoding="utf-8").read()
ok = got["sha256"] in pin
print(f"  the category as derived now: {got['file']} {got['bytes']} bytes {got['sha256'][:12]} · {'the bytes the pin names' if ok else 'NOT the bytes the pin names'}")
sys.exit(0 if ok else 1)
PY
held=$?; cat $W/ubs-held.log | tee -a $L; [ $held = 0 ] || stop "UBS's collocations, derived"
node tools/apply-ubs-collocations-v1.mjs --on ${AT}16.000Z > $W/ubs-apply.log 2>&1 || { grep REFUSED $W/ubs-apply.log | cut -c1-400 | tee -a $L; stop "UBS's collocations, laid"; }; last $W/ubs-apply.log

say "every store step once more, dry: nothing left to write"
for t in apply-ledger-divisions-v1 apply-made-spaces-v1 apply-own-pointing-v1 apply-name-rows-v1 apply-sense-openings-v1 apply-ubs-collocations-v1; do
  node tools/$t.mjs --dry > $W/again-$t.log 2>&1 || stop "$t, dry"
  moved $W/again-$t.log || stop "$t would write"
  echo "  $t: nothing to write" | tee -a $L
done
grep -q '"the_index_names_this_run":true' $W/again-apply-name-rows-v1.log || stop "the names: the index does not name the lists as the pin does"
node tools/apply-source-years-v1.mjs --dry > $W/again-years.log 2>&1 || stop "the sources' years, dry"
grep -q "· 0 years move in the store (0 shards) · 0 in the span store (0 books)" $W/again-years.log || stop "a source's year would move"
echo "  apply-source-years-v1: nothing to write" | tee -a $L
LISTS=$(python3 -I $T/pinned-entry-lists-20.py $R "$ROW_ENTRIES_LISTS" \
  $S/dl-v218-data/v2/ledgers/all/entry-ledger/lists-v1.1/facts-slot-wiktionary-v1.1.tsv \
  $S/dl-v211-data/v2/ledgers/all/entry-ledger/tbesh-letters-v1/facts-slot-t-v1.1.tsv \
  $S/dl-v203-data/v2/ledgers/all/entry-ledger/wiktionary-v1/facts-slot-wiktionary-v1.tsv)
[ $? = 0 ] && [ -n "$LISTS" ] || stop "a list the row entries' pin names is not here: $LISTS"
LISTARGS=(); for f in $LISTS; do LISTARGS+=(--list "$f"); done
node tools/apply-row-entries-v1.mjs --ledger $ROW_ENTRIES_LEDGER "${LISTARGS[@]}" --dry > $W/again-entries.log 2>&1 || { grep REFUSED $W/again-entries.log | cut -c1-400 | tee -a $L; stop "the entries, dry"; }
moved $W/again-entries.log || stop "the entries would move a row"
echo "  apply-row-entries-v1: nothing to write ($(( ${#LISTARGS[@]} / 2 )) lists, each a list the pin names, found by its bytes)" | tee -a $L
say "STORE STEPS DONE · store $(python3 -c "import json;print(json.load(open('data/route-store/index.json'))['store_version'])")"
