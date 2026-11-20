#!/bin/bash
# Ship 11c, rehearsal in the sandbox: derive and land the three lists in the pin's order.
# Usage: rehearse-landings.sh <reader dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; R=${1:?reader dir}; O=$S/s13w/rehearsal; mkdir -p $O
cd $R
DER='{}'
n=0
for id in whole-renderings-v1 call5-returns-v1 bridge-form-rows-v1; do
  n=$((n+1))
  node tools/derive-landings-v1.mjs --list $id --dry > $O/derive-$id-dry.log 2>&1 || { echo "derive $id (dry) refused:"; tail -2 $O/derive-$id-dry.log | cut -c1-400; exit 1; }
  DER=$(python3 - "$DER" "$id" "$O/derive-$id-dry.log" <<'PY'
import sys, json
der = json.loads(sys.argv[1]); fig = [l for l in open(sys.argv[3], encoding='utf-8') if l.startswith('figures ')][0]
der[sys.argv[2]] = json.loads(fig[len('figures '):])['files']; print(json.dumps(der))
PY
)
  python3 -I $S/s13w/make-landings-pin.py $S $R "$DER" > /dev/null
  node tools/derive-landings-v1.mjs --list $id > $O/derive-$id.log 2>&1 || { echo "derive $id refused:"; tail -2 $O/derive-$id.log | cut -c1-400; exit 1; }
  grep "^landings" $O/derive-$id.log | cut -c1-420
  REASON=$(python3 -c "import json,sys;p=json.load(open('data/landings/PIN.json'));print([l for l in p['lists'] if l['id']==sys.argv[1]][0]['landed_by']['reason'])" $id)
  node tools/strike-rows-v1.mjs --list data/landings/derived/land-$id.jsonl --reason "$REASON" --on 2026-11-20T22:00:0$n.000Z > $O/land-$id.log 2>&1 || { echo "landing $id refused:"; tail -3 $O/land-$id.log | cut -c1-500; exit 1; }
  grep -E "^  land |written|store " $O/land-$id.log | cut -c1-300 | head -4
done
echo REHEARSED
