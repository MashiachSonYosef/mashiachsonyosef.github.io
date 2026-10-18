#!/bin/bash
# Cross-family sharing inside the sample: union of the main runs' unit tables (chunk and line), read-only.
M=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap
RUNS="licence cold witnessed compspan census iawave staging runback hud editions"
for mode in cdc line; do
  files=""; for r in $RUNS; do [ -f $M/tables/$r/ovl.$mode.tab ] && files="$files $M/tables/$r/ovl.$mode.tab"; done
  $M/scripts/tabmerge $files > $M/tables/55-union-$mode.tsv
  u=$(awk -F'\t' '$1=="union"{print $5}' $M/tables/55-union-$mode.tsv)
  s=$(awk -F'\t' '$1!="union"{s+=$5} END{print s}' $M/tables/55-union-$mode.tsv)
  echo -e "union-$mode\t$u"; echo -e "sum-$mode\t$s"
done > $M/tables/55-union.txt
cat $M/tables/55-union.txt
