#!/bin/bash
# 10 November: bake the witnessed columns against the store as it stands now (the sign ruling's divisions, the years), then regloss every served zone
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
cd $S/pt/reader || exit 1
: > $S/v26/regloss/all.log
: > $S/v26/bake.log
for b in $(node -e 'const { zonesServed } = await import("./tools/zones-on-disk-v1.mjs"); console.log(zonesServed().join(" "))' --input-type=module); do
  node tools/bake-witnessed-order-v1.mjs --zone data/zones/$b.bin --stamp 2026-11-10 --out $S/v26/baked/$b.bin >> $S/v26/bake.log 2>&1
  code=$?
  if [ "$code" = "3" ]; then cp data/zones/$b.bin $S/v26/baked/$b.bin; elif [ "$code" != "0" ]; then echo "$b BAKE-FAILED $code" >> $S/v26/regloss/all.log; continue; fi
  node tools/regloss-zone.mjs --zone $S/v26/baked/$b.bin --out $S/v26/regloss/$b.bin --stamp 2026-11-10 > $S/v26/regloss/$b.log 2>&1
  echo "$b $?" >> $S/v26/regloss/all.log
done
echo REGLOSS-DONE >> $S/v26/regloss/all.log
