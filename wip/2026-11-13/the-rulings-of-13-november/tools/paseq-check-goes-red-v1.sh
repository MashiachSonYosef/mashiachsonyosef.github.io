#!/usr/bin/env bash
# The check of the paseq's place, broken on purpose: each fault is put into the tree, the zones are pinned again where
# a zone changed (the page refuses a zone its record does not pin), the check is run, the law that must go red is
# looked for, and every file the fault or the pinning touched is put back from the copies kept first and fingerprinted.
# usage: paseq-check-goes-red-v1.sh <reader dir> <scratch> ["modes"]
set -u
R="$1"; T="$2"; MODES="${3:-pin-sha zone-drop zone-word zone-stray css-always css-mark js-word js-press js-text js-export js-export-place}"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$T/kept"
declare -A LAW=( [pin-sha]=P1 [zone-drop]=P2 [zone-word]=P2 [zone-stray]=P2 [css-always]=P3 [css-mark]=P4 [js-word]=P4 [js-press]=P5 [js-text]=P3 [js-export]=P6 [js-export-place]=P6 )
FILES="zone.html data/paseq-place/PIN.json data/zones/job.bin data/zone-store-v1.json"
keep() { for f in $FILES; do mkdir -p "$T/kept/$(dirname "$f")"; cp -p "$R/$f" "$T/kept/$f"; done; }
back() { for f in $FILES; do cp -p "$T/kept/$f" "$R/$f"; done; }
print() { (cd "$R" && sha256sum $FILES | sha256sum | cut -c1-16); }
keep
BEFORE="$(print)"
caught=0; total=0
for m in $MODES; do
  total=$((total + 1))
  python3 -I "$HERE/paseq-faults-v1.py" "$R" "$m" || { echo "$m: the fault was not put in"; back; continue; }
  case "$m" in zone-*) (cd "$R" && node tools/emit-zone-store-v1.mjs > /dev/null 2>&1) ;; esac
  out="$(cd "$R" && timeout 900 node tools/check-paseq-place-v1.mjs 2>&1)"
  want="${LAW[$m]}"
  if echo "$out" | grep -q "^FAIL  $want "; then caught=$((caught + 1)); verdict="caught by $want"; else verdict="NOT CAUGHT by $want"; fi
  echo "$m: $verdict · red: $(echo "$out" | grep -o '^FAIL  P[0-9]' | sed 's/FAIL  //' | tr '\n' ' ')"
  echo "$out" | grep "^FAIL  $want " | cut -c1-260 | sed 's/^/    /'
  back
  [ "$(print)" = "$BEFORE" ] || { echo "the tree was NOT put back after $m"; exit 2; }
done
echo "caught $caught of $total · the tree put back as it was ($BEFORE)"
