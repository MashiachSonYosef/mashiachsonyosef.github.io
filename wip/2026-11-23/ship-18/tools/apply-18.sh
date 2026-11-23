#!/bin/bash
# Ship 18 (23 November 2026) on a reader tree at main b1acf1e220, in order: the corpus lane's relay v221.
#   1. the tools: the held places (the rule's module, the round's tool, its check), the laws that read held lines
#      taught a line let go and a list that re-reads another (patch 18-01), the page and the round taught the hold
#      (patch 18-02);
#   2. the pins: relay v221's resting call kept in data/held-places/ (each file the bytes the letter names); the
#      landings' pin lets the two held lines go to a list that re-reads the list v1.1;
#   3. the landing: that list derived dry, its two derived lists pinned, derived, landed (round 24 of the row-strikes
#      record), then every store step after a landing, and each once more, dry: nothing left to write;
#   4. the records: the re-admission's record counts from the pin, the re-admission run (nothing to write), the
#      source record emitted from the source ledger v1.1 and checked, the strike tool run dry;
#   5. the two record fixes: the spelling bridge's pin and its tool's reason (the owner's ruling of 23 November 2026),
#      the path map (the seven files that left the store are in git on corpus-staging too).
# A step whose work the tree carries already is said and passed, and run over a tree that carries all of it this
# writes nothing. It stops at the first fault and says where. The holds themselves are laid by the round's zones step
# (tools/apply-held-places-v1.mjs, right after the commentary's line is read again); the round follows this.
# Usage: apply-18.sh <reader dir> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; W=${2:?log dir}; mkdir -p $W; L=$W/apply.log
T=$S/s26w/tools
D=$S/dl-v221-data/v2/ledgers/all/send-back/two-table-rows-v1
LETTER=$S/dl-v221-data/v2/letters/moses-send-back-v1/FOR-ELIJAH-v221.md
LEDGER=$S/dl-v210-data/v2/ledgers/all/toggle-ledgers/source-corpus-v1.1.json
ID=send-back-own-language-v1.1-let-go-v221
AT=2026-11-23T10:00:
DAY=2026-11-23
. $S/s21w/env.sh
cd $R || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
# run <what> <command...>: the command, its words into the log and its last line said; it stops here on a fault
run() { local what=$1; shift; "$@" > $W/step.out 2>&1; local c=$?; cat $W/step.out >> $L; tail -1 $W/step.out | cut -c1-300 | sed 's/^/  /'; [ $c = 0 ] || stop "$what"; }
# moved <log>: a dry run of a store step that would move nothing (at least one count of none, and no count of some)
moved() { grep -qE '· 0 slots move ·|· 0 rows move|0 rows move \(|"rows_moved":0' $1 && ! grep -qE '· [1-9][0-9,]* (rows|slots) move|"rows_moved":[1-9]' $1; }
store() { python3 -c "import json;i=json.load(open('data/route-store/index.json'));print(i['store_version'], i['counts']['routes'], 'routes', i['counts']['keys'], 'keys')"; }

say "the inputs: the letter of relay v221 and the source ledger v1.1, each the bytes named"
[ "$(sha256sum $LEDGER | cut -c1-64)" = 8d9caf8c5c5f253f307ce9ffac176d77c01642e7fb72fcb1ae4241c4b9c78bbc ] || stop "the source ledger v1.1 is not the bytes the letter of relay v210 names"
head -1 $LETTER | grep -q " v221 " || stop "the letter given is not relay v221's"
echo "  each file of two-table-rows-v1 the pin keeps is held to the letter's bytes by the pin's own tool, below" | tee -a $L
say "the store before: $(store)"

say "the tools"
for f in held-places-v1.mjs apply-held-places-v1.mjs check-held-places-v1.mjs; do
  if cmp -s $T/$f tools/$f; then echo "  tools/$f: stands already" | tee -a $L; else cp $T/$f tools/$f && echo "  tools/$f: written" | tee -a $L; fi
done
python3 -I $T/patch-18-01-let-go.py . >> $L 2>&1 || stop "a line let go and a list that re-reads another: the derivation, the checks, the re-admission, the source record (patch 18-01)"
python3 -I $T/patch-18-02-hold.py . >> $L 2>&1 || stop "the hold at a place: the page, the round, the document (patch 18-02)"
grep -E "^(patched|stands already)" $L | tail -9 | sed 's/^/  /'
for f in held-places-v1 apply-held-places-v1 check-held-places-v1 derive-landings-v1 check-landings-v1 readmit-sources-v1 check-readmission-v1 emit-source-corpus-v1 check-source-corpus-v1; do
  node --check tools/$f.mjs >> $L 2>&1 || stop "syntax of $f"
done
bash -n tools/round-v1.sh || stop "syntax of the round"
node -e 'const s=require("fs").readFileSync("zone.html","utf8");const re=/<script\b[^>]*>([\s\S]*?)<\/script>/g;let m,b="";while((m=re.exec(s)))if(m[1].length>b.length)b=m[1];require("fs").writeFileSync(process.argv[1],b)' $W/page-script.mjs && node --check $W/page-script.mjs >> $L 2>&1 || stop "syntax of the page's script"
rm -f $W/page-script.mjs
echo "  9 tools, the round and the page's script parse" | tee -a $L

say "the pins"
run "the held places' pin" python3 -I $T/pin-held-places-v221.py $R $D $LETTER
run "the landings' pin: the two lines let go" python3 -I $T/pin-let-go-v221.py $R

say "the two lines let go, derived and landed"
node tools/derive-landings-v1.mjs --list $ID --dry > $W/derive-dry.log 2>&1; DRYCODE=$?
if grep -q "holds the landing of \"$ID\" already" $W/derive-dry.log; then
  LANDED_BEFORE=1
  echo "  landed already: the row-strikes record holds the landing of $ID" | tee -a $L
else
  LANDED_BEFORE=0
  [ $DRYCODE = 0 ] || { tail -2 $W/derive-dry.log | cut -c1-500 | tee -a $L; stop "the list, derived dry"; }
  grep "^figures " $W/derive-dry.log | sed 's/^figures //' > $W/fig-$ID.json
  run "the derived lists pinned" python3 -I $T/pin-let-go-v221.py $R --derived $W/fig-$ID.json
  node tools/derive-landings-v1.mjs --list $ID > $W/derive.log 2>&1 || { tail -2 $W/derive.log | cut -c1-500 | tee -a $L; stop "the list, derived"; }
  grep "^landings" $W/derive.log | cut -c1-400 | tee -a $L
  REASON=$(python3 -c "import json,sys;p=json.load(open('data/landings/PIN.json'));print([l for l in p['lists'] if l['id']==sys.argv[1]][0]['landed_by']['reason'])" $ID)
  node tools/strike-rows-v1.mjs --list data/landings/derived/land-$ID.jsonl --reason "$REASON" --on ${AT}01.000Z > $W/land.log 2>&1 || { tail -3 $W/land.log | cut -c1-600 | tee -a $L; stop "the landing"; }
  grep -E "^  land |^written" $W/land.log | cut -c1-300 | head -2 | tee -a $L
  node tools/derive-landings-v1.mjs --list $ID --dry > $W/derive-again.log 2>&1
  grep -q "holds the landing of \"$ID\" already" $W/derive-again.log || stop "the list, derived again, is not refused as landed"
  echo "  derived again: refused, the row-strikes record holds its landing" | tee -a $L
fi
say "the store after the landing: $(store)"

if [ $LANDED_BEFORE = 0 ]; then
  bash $T/store-steps-18.sh $R $AT $W || stop "the store steps"
else
  say "the store steps: each once more, dry, nothing left to write"
  WIKT=$(python3 -I - data/row-entries/PIN.json "$ROW_ENTRIES_LISTS" <<'PYX'
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
  for t in apply-ledger-divisions-v1 apply-made-spaces-v1 apply-own-pointing-v1 apply-name-rows-v1 apply-sense-openings-v1 apply-ubs-collocations-v1; do
    node tools/$t.mjs --dry > $W/again-$t.log 2>&1 || stop "$t, dry"
    moved $W/again-$t.log || stop "$t would write"
    echo "  $t: nothing to write" | tee -a $L
  done
  node tools/apply-source-years-v1.mjs --dry > $W/again-years.log 2>&1 || stop "the sources' years, dry"
  grep -q "· 0 years move in the store (0 shards) · 0 in the span store (0 books)" $W/again-years.log || stop "a source's year would move"
  node tools/apply-row-entries-v1.mjs --ledger $ROW_ENTRIES_LEDGER --list $WIKT --list data/row-entries/entry-ledger-classical-and-hebrew-wiktionary-v1/facts-slot-v1.tsv --dry > $W/again-entries.log 2>&1 || stop "the entries, dry"
  moved $W/again-entries.log || stop "the entries would move a row"
  echo "  apply-source-years-v1, apply-row-entries-v1: nothing to write" | tee -a $L
fi

say "the records: the re-admission, the source record, the strike tool"
run "the re-admission's record" python3 -I $T/readmission-let-go-v221.py $R
node tools/readmit-sources-v1.mjs --stamp $DAY > $W/readmit.log 2>&1 || { tail -2 $W/readmit.log | cut -c1-400 | tee -a $L; stop "the re-admission"; }
grep -q "^nothing to write" $W/readmit.log || stop "the re-admission would write: its sources stood re-admitted before this ship"
tail -1 $W/readmit.log | cut -c1-200 | tee -a $L
cp data/source-corpus-v1.json $W/source-corpus-before.json
node tools/emit-source-corpus-v1.mjs --ledger $LEDGER --stamp $DAY > $W/source-corpus.log 2>&1 || { tail -3 $W/source-corpus.log | tee -a $L; stop "the source record"; }
cmp -s data/source-corpus-v1.json $W/source-corpus-before.json && echo "  data/source-corpus-v1.json: the same bytes" | tee -a $L || grep "M78\|M103" $W/source-corpus.log | cut -c1-300 | tee -a $L
node tools/check-source-corpus-v1.mjs --ledger $LEDGER > $W/check-source-corpus.log 2>&1 || { grep FAIL $W/check-source-corpus.log | cut -c1-300 | tee -a $L; stop "the source record's check"; }
grep -E "^(  ok|FAIL)" $W/check-source-corpus.log | cut -c1-160 | tee -a $L
node tools/strike-language-v1.mjs --dry > $W/strike-language-dry.log 2>&1 || stop "the strike tool, dry"
grep -q "routes [0-9]* → [0-9]* (0 struck)" $W/strike-language-dry.log || stop "the strike tool would strike a row"
grep -E "^  sources [0-9]+ → [0-9]+" $W/strike-language-dry.log | cut -c1-200 | tee -a $L

say "the two record fixes"
run "the spelling bridge's pin" python3 -I $T/patch-18-03-spelling-bridge-pin.py .
run "the spelling bridge's tool" python3 -I $T/patch-18-04-spelling-bridge-tool.py .
node --check tools/spelling-bridge-v1.mjs >> $L 2>&1 || stop "syntax of spelling-bridge-v1"
run "the path map" python3 -I $T/emit-path-map-in-git-v1.py $R
say "APPLIED · store $(store)"
