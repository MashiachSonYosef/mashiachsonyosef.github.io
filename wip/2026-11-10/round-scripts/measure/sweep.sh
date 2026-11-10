#!/bin/bash
# the numbers' room on several works, both readers, two widths: bash sweep.sh <base url with ?b=> <out file> [css]
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
BASE="$1"; OUT="$2"; : > "$OUT"
run() { node $S/v27/numroom.mjs "$BASE$1" "$2" "$3" 2>&1 | grep -v "^\s*\[" >> "$OUT.$1.$2.$3"; }
for b in genesis exodus psalms daniel isaiah job esther tikkunei-zohar; do
  run $b en 412 & run $b he 412 & wait
  run $b en 1280 & run $b he 1280 & wait
done
for f in "$OUT".*; do cat "$f" >> "$OUT"; rm -f "$f"; done
echo SWEEP-DONE
