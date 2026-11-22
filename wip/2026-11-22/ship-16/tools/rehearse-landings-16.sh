#!/bin/bash
# Ship 16: derive and land the one list of relay v210 that this ship pins (the own-language list v1.1): derived dry,
# its two derived lists pinned, derived, landed. PanLex's lines are named not landed, held with their source.
# Usage: [LAND_AT=<moment, less its last digit and .000Z>] rehearse-landings-16.sh <reader dir> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; R=${1:?reader dir}; O=${2:?log dir}; mkdir -p $O
T=$S/s20w/tools
cd $R || exit 1
n=0
for id in send-back-own-language-v1.1; do
  n=$((n+1))
  node tools/derive-landings-v1.mjs --list $id --dry > $O/derive-$id-dry.log 2>&1 || { echo "derive $id (dry) refused:"; tail -2 $O/derive-$id-dry.log | cut -c1-500; exit 1; }
  grep "^figures " $O/derive-$id-dry.log | sed 's/^figures //' > $O/fig-$id.json
  grep -q '"the_pin_names_these_bytes":true' $O/fig-$id.json || python3 -I $T/pin-add-send-back-v1.1.py $R x --derived $id $O/fig-$id.json > /dev/null || exit 1
  node tools/derive-landings-v1.mjs --list $id > $O/derive-$id.log 2>&1 || { echo "derive $id refused:"; tail -2 $O/derive-$id.log | cut -c1-500; exit 1; }
  grep "^landings" $O/derive-$id.log | cut -c1-520
  python3 -c "import json,sys;print(json.dumps({k:v for k,v in json.load(open(sys.argv[1])).items() if k not in ('files','by_kind')}))" $O/fig-$id.json | cut -c1-700
  REASON=$(python3 -c "import json,sys;p=json.load(open('data/landings/PIN.json'));print([l for l in p['lists'] if l['id']==sys.argv[1]][0]['landed_by']['reason'])" $id)
  node tools/strike-rows-v1.mjs --list data/landings/derived/land-$id.jsonl.gz --reason "$REASON" --on ${LAND_AT:-2026-11-22T07:00:0}$n.000Z > $O/land-$id.log 2>&1 || { echo "landing $id refused:"; tail -3 $O/land-$id.log | cut -c1-600; exit 1; }
  grep -E "^  land |written|store " $O/land-$id.log | cut -c1-300 | head -4
done
echo REHEARSED
