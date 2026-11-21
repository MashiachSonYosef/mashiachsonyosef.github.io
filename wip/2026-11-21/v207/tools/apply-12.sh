#!/bin/bash
# Ship 12 on a reader tree, in order: the tools, the pin with the two lists that land now, the re-admission's record,
# the kinds and the ledgers' manifest, the re-admission, each list derived and landed in its turn, the store steps.
# Usage: apply-12.sh <reader dir> <moment prefix, as 2026-11-21T08:00:> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=${1:?reader dir}; AT=${2:?moment prefix}; W=${3:?log dir}; mkdir -p $W; L=$W/apply.log
D=$S/dl-v207-data/v2/ledgers/all/send-back/send-back-v1
HELD=/home/user/mashiachsonyosef.github.io/wip/2026-11-21/v207/the-35-sources-as-the-index-held-them.json
. $S/s12w/env.sh
cd $R || exit 1
say() { echo "== $1 · $(date -u +%T)" | tee -a $L; }
stop() { echo "STOPPED at $1" | tee -a $L; exit 1; }
say "tools"
cp $S/s15w/tools/pinned-v1.mjs $S/s15w/tools/derive-landings-v1.mjs tools/ || stop "the pinned reader and the landings' derivation (a gzipped list; the hole a strike left)"
python3 $S/s15w/tools/patch-02-strike-rows-gz.py tools/strike-rows-v1.mjs >> $L 2>&1 || stop "the row tool's gzipped lists"
python3 $S/s15w/tools/patch-05-lattice-door.py . >> $L 2>&1 || stop "the lattice's door"
cp $S/s15w/tools/readmit-sources-v1.mjs $S/s15w/tools/check-readmission-v1.mjs tools/ || stop "the re-admission tool and its check"
python3 $S/s15w/tools/patch-06-check-landings-holes.py . >> $L 2>&1 || stop "the landings' check (holes)"
python3 $S/s15w/tools/patch-07-check-language-admitted.py . >> $L 2>&1 || stop "the admission's check (a re-admitted source)"
python3 $S/s15w/tools/patch-08-strike-language-keeps-readmission.py . >> $L 2>&1 || stop "the strike tool keeps a re-admission"
python3 $S/s15w/tools/patch-10-lane-state.py . >> $L 2>&1 || stop "the lane state"
[ -f PIPELINE.md ] && { grep -q "readmission-rule-v1" PIPELINE.md || python3 $S/s15w/tools/patch-09-pipeline-doc.py . >> $L 2>&1 || stop "the document"; }
for f in pinned-v1 derive-landings-v1 strike-rows-v1 project-lattice-v12-v1 readmit-sources-v1 check-readmission-v1 check-landings-v1 check-language-admitted-v1 strike-language-v1 emit-lane-state-v1 check-lane-state-v1; do node --check tools/$f.mjs >> $L 2>&1 || stop "syntax of $f"; done
say "the pin, the records"
python3 -I $S/s15w/tools/pin-add-send-back.py $R $D >> $L 2>&1 || stop "the pin"
python3 -I $S/s15w/tools/make-readmission-record.py $R $HELD $D >> $L 2>&1 || stop "the re-admission's record"
python3 -I $S/s15w/tools/patch-03-kinds.py $R >> $L 2>&1 || stop "the kinds"
python3 -I $S/s15w/tools/patch-04-ledgers-excluded.py $R >> $L 2>&1 || stop "the ledgers' manifest"
say "the re-admission"
node tools/readmit-sources-v1.mjs --stamp 2026-11-21 > $W/readmit.log 2>&1 || { tail -2 $W/readmit.log | cut -c1-400 | tee -a $L; stop "the re-admission"; }
grep "^re-admission\|^written" $W/readmit.log | cut -c1-300 | tee -a $L
node tools/readmit-sources-v1.mjs --stamp 2026-11-21 2>&1 | tail -1 | cut -c1-200 | tee -a $L
say "each list derived and landed in its turn"
LAND_AT=${AT}0 bash $S/s15w/rehearse-landings-12.sh $R $W >> $L 2>&1; tail -1 $L | grep -q "^REHEARSED" || { tail -4 $L; stop "the landings"; }
grep "^landings\|^written" $L | cut -c1-260
bash $S/s13w/store-steps-11c.sh $R ${AT} $W || stop "the store steps"
say "the strike tool run dry: it strikes nothing and would write nothing"
node tools/strike-language-v1.mjs --dry > $W/strike-language-dry.log 2>&1 || stop "the strike tool, dry"
grep -E "^  sources [0-9]+ → [0-9]+" $W/strike-language-dry.log | cut -c1-200 | tee -a $L
grep -q "routes [0-9]* → [0-9]* (0 struck)" $W/strike-language-dry.log || stop "the strike tool would strike a row"
say "APPLIED · store $(python3 -c "import json;print(json.load(open('data/route-store/index.json'))['store_version'], json.load(open('data/route-store/index.json'))['counts']['routes'])")"
