#!/bin/bash
# Ship 18 (23 November 2026; ship 16's steps, as they stood), the store steps after the landings, in the order of ships 5 and 6 (the ledgers' divisions, the years held,
# the made spaces, the own pointing, the entries, the names, the sense openings, UBS's collocations), each given its
# moment. Run in the environment of the round (S/s21w/env.sh), with the English Wiktionary list the tree's row entries' pin
# names: v203's on main, v211's on main with ship 15. Usage: store-steps-18.sh <reader dir> <moment prefix, as 2026-11-21T01:00:> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; AT=${2:?moment prefix}; W=${3:?log dir}; mkdir -p $W; L=$W/apply.log
. $S/s21w/env.sh
cd $R || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
last() { grep -v "^figures " $1 | grep -v "^dry run\|^written" | tail -1 | cut -c1-330 | tee -a $L; }
UBS="${UBS_SOURCE_CACHE:-$S/v77/ship56-design/call7-signs/dl-ubs/old-local-999-footsteps/ledgers/work/ldmprs/source-cache/ubs-sdbh-hebrew-2026-07-15}"
PICKS=$S/v54/picks-v1-2/ledger
# the English Wiktionary list the row entries' pin names on this tree, of the two the lane has sent (v211's, which the
# environment names, and v203's, which main's pin still names): the step refuses a list its pin does not name
WIKT=$(python3 -I - data/row-entries/PIN.json "$ROW_ENTRIES_LISTS" $S/dl-v203-data/v2/ledgers/all/entry-ledger/wiktionary-v1/facts-slot-wiktionary-v1.tsv <<'PYX'
import sys, json, hashlib
pin = json.load(open(sys.argv[1], encoding="utf-8"))
want = {l["list"]["sha256"] for l in pin.get("lists", []) if l.get("name") == "English Wiktionary"}
for c in sys.argv[2:]:
    try: h = hashlib.sha256(open(c, "rb").read()).hexdigest()
    except OSError: continue
    if h in want: print(c); break
PYX
)
[ -n "$WIKT" ] || stop "no English Wiktionary list the row entries' pin names"
echo "  the row entries' English Wiktionary list: $WIKT" | tee -a $L
say "the ledgers' divisions"
node tools/apply-ledger-divisions-v1.mjs --on ${AT}10.000Z > $W/ledgers.log 2>&1 || stop "the ledgers' divisions"; grep "^ledger divisions ·" $W/ledgers.log | cut -c1-300 | tee -a $L
say "the sources' years (held: none moves)"
node tools/apply-source-years-v1.mjs --dry > $W/years.log 2>&1 || stop "the sources' years"; grep -q "· 0 years move in the store (0 shards) · 0 in the span store (0 books)" $W/years.log || stop "a source's year would move"
say "the made spaces"
node tools/apply-made-spaces-v1.mjs --on ${AT}11.000Z > $W/made-spaces.log 2>&1 || { grep REFUSED $W/made-spaces.log | cut -c1-400 | tee -a $L; stop "the made spaces"; }; last $W/made-spaces.log
say "the own pointing"
node tools/apply-own-pointing-v1.mjs --on ${AT}12.000Z > $W/own-pointing.log 2>&1 || { grep REFUSED $W/own-pointing.log | cut -c1-400 | tee -a $L; stop "the own pointing"; }; last $W/own-pointing.log
say "the entries"
node tools/apply-row-entries-v1.mjs --ledger $ROW_ENTRIES_LEDGER --list $WIKT --list data/row-entries/entry-ledger-classical-and-hebrew-wiktionary-v1/facts-slot-v1.tsv --on ${AT}13.000Z > $W/entries.log 2>&1 || { grep REFUSED $W/entries.log | cut -c1-400 | tee -a $L; stop "the entries"; }
grep "^  given:\|^written" $W/entries.log | cut -c1-260 | tee -a $L
say "the names"
node tools/apply-name-rows-v1.mjs --on ${AT}14.000Z > $W/names.log 2>&1 || { grep REFUSED $W/names.log | cut -c1-400 | tee -a $L; stop "the names"; }; last $W/names.log
say "the sense openings"
node tools/apply-sense-openings-v1.mjs --on ${AT}15.000Z > $W/sense-openings.log 2>&1 || { grep REFUSED $W/sense-openings.log | cut -c1-400 | tee -a $L; stop "the sense openings"; }; last $W/sense-openings.log
say "UBS's collocations: the category derived again dry (the list must be the pin's bytes; no name moved and no row of UBS's landed), then laid"
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
say "each tool once more, dry: nothing left to write"
for t in apply-ledger-divisions-v1 apply-made-spaces-v1 apply-own-pointing-v1 apply-name-rows-v1 apply-sense-openings-v1 apply-ubs-collocations-v1; do
  node tools/$t.mjs --dry > $W/again-$t.log 2>&1 || stop "$t, dry again"
  grep -E "· 0 slots move ·|· 0 rows move|0 rows move \(" $W/again-$t.log | grep -v "^  " | tail -1 | cut -c1-80 | sed "s/^/  $t: /" | tee -a $L
done
node tools/apply-row-entries-v1.mjs --ledger $ROW_ENTRIES_LEDGER --list $WIKT --list data/row-entries/entry-ledger-classical-and-hebrew-wiktionary-v1/facts-slot-v1.tsv --dry > $W/again-entries.log 2>&1 || stop "the entries, dry again"
grep -o '"rows_moved":[0-9]*' $W/again-entries.log | head -1 | sed 's/^/  apply-row-entries-v1: /' | tee -a $L
say "STORE STEPS DONE · store $(python3 -c "import json;print(json.load(open('data/route-store/index.json'))['store_version'])")"
