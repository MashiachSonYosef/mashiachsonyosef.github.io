#!/bin/bash
# Ship 16 on a reader tree at main (or main with ship 15), in order: ship 12's tools (copied and patched, each once:
# a step whose mark the tree holds already is said and passed), ship 16's tool patches, the pin with the list of relay
# v210, the re-admission's record, the kinds and the ledgers' manifest, the re-admission, the list derived and landed,
# the store steps, the source record emitted from the source ledger v1.1 and checked, the strike tool run dry. It stops
# at the first fault and says where.
# Usage: apply-16.sh <reader dir> <moment prefix, as 2026-11-22T07:00:> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; AT=${2:?moment prefix}; W=${3:?log dir}; mkdir -p $W; L=$W/apply.log
T=$S/s20w/tools; T12=$S/s15w/tools
D=$S/dl-v210-data/v2/ledgers/all/send-back/send-back-v1.1
LEDGER=$S/dl-v210-data/v2/ledgers/all/toggle-ledgers/source-corpus-v1.1.json
HELD=/home/user/mashiachsonyosef.github.io/wip/2026-11-21/v207/the-35-sources-as-the-index-held-them.json
SHIP12=/home/user/mashiachsonyosef.github.io/wip/2026-11-21/v207/readmission-v1.json
. $S/s19w/env.sh
cd $R || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
store() { python3 -c "import json;i=json.load(open('data/route-store/index.json'));print(i['store_version'], i['counts']['routes'], 'routes', i['counts']['keys'], 'keys')"; }
# once <file> <mark> <what> <command...>: the command, unless the file holds the mark already; it must leave the mark
once() {
  local f=$1 mark=$2 what=$3; shift 3
  if [ -f "$f" ] && grep -qF -- "$mark" "$f"; then echo "  $what: stands already" | tee -a $L; return 0; fi
  "$@" >> $L 2>&1 || stop "$what"
  grep -qF -- "$mark" "$f" || stop "$what (it left no mark)"
  echo "  $what: applied" | tee -a $L
}
say "the inputs: each the bytes the letter of relay v210 names"
for x in "bc6a03402bbbd680acebd7d8652c549e8a0138c76bdc99add5d1ea067ccfc6b5 $D/RULE.md" "e031f0b3d5c765508b5bb4dd8a417bc0bfba258d2b49eadd6077e980245beb6b $D/receipt-v1.1.json" \
  "fbdb06ede7e90254d505a2ef619614d6ea5f31866973f488f00985e198fca878 $D/landing-own-language-v1.1.jsonl" "1ca01ac0a26bc391a8034e25cb1f93ef58c3782f2731eb8681044732ab69cbfc $D/withdrawn-harkavy-v1.1.json" \
  "8d9caf8c5c5f253f307ce9ffac176d77c01642e7fb72fcb1ae4241c4b9c78bbc $LEDGER"; do
  set -- $x; [ "$(sha256sum "$2" | cut -c1-64)" = "$1" ] || stop "$2 is not the bytes the letter names"
done
echo "  5 files, each its sha256" | tee -a $L
say "the store before: $(store)"

say "ship 12's tools"
once tools/pinned-v1.mjs "bytesToKeep" "the pinned reader (a gzipped list)" cp $T12/pinned-v1.mjs tools/
once tools/derive-landings-v1.mjs "the hole the strike left" "the landings' derivation (the hole a strike left)" cp $T12/derive-landings-v1.mjs tools/
once tools/strike-rows-v1.mjs "a list kept gzipped (the landings' large lists" "the row tool's gzipped lists (patch 2)" python3 -I $T12/patch-02-strike-rows-gz.py tools/strike-rows-v1.mjs
once tools/project-lattice-v12-v1.mjs "listedRowsAloneLabels" "the lattice's door (patch 5)" python3 -I $T12/patch-05-lattice-door.py .
once tools/readmit-sources-v1.mjs "READMISSION_RULE_ID" "the re-admission tool" cp $T12/readmit-sources-v1.mjs tools/
once tools/check-readmission-v1.mjs "READMISSION_RULE_ID" "the re-admission's check" cp $T12/check-readmission-v1.mjs tools/
once tools/check-landings-v1.mjs 'const HOLE = "the hole the strike left";' "the landings' check: holes (patch 6)" python3 -I $T12/patch-06-check-landings-holes.py .
once tools/check-language-admitted-v1.mjs "const reAdmitted = new Set(" "the admission's check: a re-admitted source (patch 7)" python3 -I $T12/patch-07-check-language-admitted.py .
once tools/strike-language-v1.mjs "THE RE-ADMISSIONS ARE CARRIED FORWARD" "the strike tool keeps a re-admission (patch 8)" python3 -I $T12/patch-08-strike-language-keeps-readmission.py .
once tools/emit-lane-state-v1.mjs "A SOURCE STRUCK AND BACK SINCE" "the lane state (patch 10)" python3 -I $T12/patch-10-lane-state.py .
[ -f PIPELINE.md ] && once PIPELINE.md "readmission-rule-v1" "the document (patch 9)" python3 -I $T12/patch-09-pipeline-doc.py .

say "ship 16's tools"
python3 -I $T/patch-16-01-derive-landings-held.py . >> $L 2>&1 || stop "the derivation: a source the pin holds back (patch 16-01)"
python3 -I $T/patch-16-02-check-landings-held.py . >> $L 2>&1 || stop "the landings' check: a line held with its source (patch 16-02)"
python3 -I $T/patch-16-03-readmission-held.py . >> $L 2>&1 || stop "the re-admission and its check: a source the record holds back (patch 16-03)"
python3 -I $T/patch-16-04-source-corpus-by-row.py . >> $L 2>&1 || stop "the source record and its check: the ledger v1.1, BY_ROW (patch 16-04)"
python3 -I $T/patch-16-08-language-shelf-by-row.py . >> $L 2>&1 || stop "the language shelf of a witness judged row by row: the record, its check, gloss-m and the page (patch 16-08)"
[ -f PIPELINE.md ] && { python3 -I $T/patch-16-07-pipeline-doc.py . >> $L 2>&1 || stop "the document (patch 16-07)"; }
python3 -I $T/patch-16-09-held-lines.py . >> $L 2>&1 || stop "a line the pin holds back by itself: the derivation, the checks, the re-admission, the source record, the document (patch 16-09)"
for f in pinned-v1 derive-landings-v1 strike-rows-v1 project-lattice-v12-v1 readmit-sources-v1 check-readmission-v1 check-landings-v1 check-language-admitted-v1 strike-language-v1 emit-lane-state-v1 check-lane-state-v1 emit-source-corpus-v1 check-source-corpus-v1 gloss-m-v1; do
  node --check tools/$f.mjs >> $L 2>&1 || stop "syntax of $f"
done
node -e 'const s=require("fs").readFileSync("zone.html","utf8");const re=/<script\b[^>]*>([\s\S]*?)<\/script>/g;let m,b="";while((m=re.exec(s)))if(m[1].length>b.length)b=m[1];require("fs").writeFileSync(process.argv[1],b)' $W/page-script.mjs && node --check $W/page-script.mjs >> $L 2>&1 || stop "syntax of the page's script"
rm -f $W/page-script.mjs
echo "  14 tools and the page's script parse" | tee -a $L

say "the pin, the records"
python3 -I $T/pin-add-send-back-v1.1.py $R $D 2>&1 | tee -a $L | tail -1 | cut -c1-300; [ ${PIPESTATUS[0]} = 0 ] || stop "the pin"
python3 -I $T/make-readmission-record-v1.1.py $R $HELD $D $SHIP12 2>&1 | tee -a $L | tail -1 | cut -c1-300; [ ${PIPESTATUS[0]} = 0 ] || stop "the re-admission's record"
python3 -I $T/patch-16-05-kinds.py $R 2>&1 | tee -a $L | tail -1 | cut -c1-300; [ ${PIPESTATUS[0]} = 0 ] || stop "the kinds"
python3 -I $T/patch-16-06-ledgers-excluded.py $R 2>&1 | tee -a $L | tail -1 | cut -c1-300; [ ${PIPESTATUS[0]} = 0 ] || stop "the ledgers' manifest"

say "the re-admission"
node tools/readmit-sources-v1.mjs --stamp 2026-11-22 > $W/readmit.log 2>&1 || { tail -2 $W/readmit.log | cut -c1-400 | tee -a $L; stop "the re-admission"; }
grep "^re-admission\|^written" $W/readmit.log | cut -c1-300 | tee -a $L
node tools/readmit-sources-v1.mjs --stamp 2026-11-22 > $W/readmit-again.log 2>&1 || stop "the re-admission, run again"
grep -q "^nothing to write" $W/readmit-again.log || stop "the re-admission, run again, would write"
tail -1 $W/readmit-again.log | cut -c1-200 | tee -a $L

say "the list derived and landed"
LAND_AT=${AT}0 bash $T/rehearse-landings-16.sh $R $W >> $L 2>&1; tail -1 $L | grep -q "^REHEARSED" || { tail -4 $L; stop "the landing"; }
grep "^landings\|^{\"list\"" $L | cut -c1-400
node tools/derive-landings-v1.mjs --list send-back-own-language-v1.1 --dry > $W/derive-again.log 2>&1
grep -q "holds the landing of \"send-back-own-language-v1.1\" already" $W/derive-again.log || stop "the list, derived again, is not refused as landed"
echo "  derived again: refused, the row-strikes record holds its landing" | tee -a $L
say "the store after the landing: $(store)"

bash $T/store-steps-16.sh $R ${AT} $W || stop "the store steps"

say "the source record, emitted from the source ledger v1.1, and its check"
node tools/emit-source-corpus-v1.mjs --ledger $LEDGER --stamp 2026-11-22 > $W/source-corpus.log 2>&1 || { tail -3 $W/source-corpus.log | tee -a $L; stop "the source record"; }
cut -c1-200 $W/source-corpus.log | tee -a $L
node tools/check-source-corpus-v1.mjs --ledger $LEDGER > $W/check-source-corpus.log 2>&1 || { grep FAIL $W/check-source-corpus.log | cut -c1-300 | tee -a $L; stop "the source record's check"; }
grep -E "^(  ok|FAIL)" $W/check-source-corpus.log | cut -c1-260 | tee -a $L

say "the strike tool run dry: it strikes nothing and would write nothing"
node tools/strike-language-v1.mjs --dry > $W/strike-language-dry.log 2>&1 || stop "the strike tool, dry"
grep -E "^  sources [0-9]+ → [0-9]+" $W/strike-language-dry.log | cut -c1-200 | tee -a $L
grep -q "routes [0-9]* → [0-9]* (0 struck)" $W/strike-language-dry.log || stop "the strike tool would strike a row"
say "APPLIED · store $(store)"
