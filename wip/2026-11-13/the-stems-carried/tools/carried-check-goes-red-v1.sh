#!/usr/bin/env bash
# The check of the stems carried, broken on purpose: each fault is put into the tree (a data fault rewrites one
# book's lattice sidecar; a code fault changes a tool, and the book is projected again with it), the check is run,
# the law that must go red is looked for, and every file the fault touched is put back from the copies kept first
# and fingerprinted. The extension's B4 is run for the fault meant for it.
# usage: carried-check-goes-red-v1.sh <reader dir> <scratch> <book> ["modes"]
# env: LATTICE (the lattice folder), STEMS (the folder of the binyan files), EXTENSION (the extension's lines), STAMP
set -u
R="$1"; T="$2"; B="$3"; MODES="${4:-rule-gone count-off dead-key drop-key wrong-stem drop-ext-row proj-all module-none}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROWS="$STEMS/row-stems-v2.jsonl"
mkdir -p "$T/kept" "$T/proj"
declare -A LAW=( [rule-gone]=C1 [count-off]=C1 [dead-key]=C2 [drop-key]=C3 [wrong-stem]=C3 [drop-ext-row]=B4 [proj-all]=C2 [module-none]=C3 )
FILES="data/zones/$B.lattice.bin tools/project-lattice-v12-v1.mjs tools/stems-carried-v1.mjs"
keep() { for f in $FILES; do mkdir -p "$T/kept/$(dirname "$f")"; cp -p "$R/$f" "$T/kept/$f"; done; }
back() { for f in $FILES; do cp -p "$T/kept/$f" "$R/$f"; done; }
print() { (cd "$R" && sha256sum $FILES | sha256sum | cut -c1-16); }
keep
BEFORE="$(print)"
caught=0; total=0
for m in $MODES; do
  total=$((total + 1))
  python3 -I "$HERE/carried-faults-v1.py" "$R" "$m" "$B" "$ROWS" || { echo "$m: the fault was not put in"; back; continue; }
  case "$m" in proj-all|module-none)
    if (cd "$R" && node tools/project-lattice-v12-v1.mjs --zone "data/zones/$B.bin" --lattice "$LATTICE" --stamp "$STAMP" \
        --out "$T/proj/$B.bin" --sidecar "$T/proj/$B.lattice.bin" \
        --place-stems "$STEMS/place-stems-v2.jsonl" --row-stems "$ROWS" --row-stems-extension "$EXTENSION" > "$T/proj/$m.log" 2>&1); then
      cp "$T/proj/$B.lattice.bin" "$R/data/zones/$B.lattice.bin"
    else echo "$m: the projection failed (see $T/proj/$m.log)"; fi ;;
  esac
  want="${LAW[$m]}"
  if [ "$want" = B4 ]; then out="$(cd "$R" && STEMS_EXTENSION="$EXTENSION" timeout 1800 node tools/check-stems-extension-v1.mjs 2>&1)"
  else out="$(cd "$R" && timeout 900 node tools/check-stems-carried-v1.mjs --row-stems "$ROWS" 2>&1)"; fi
  if echo "$out" | grep -q "^FAIL  $want "; then caught=$((caught + 1)); verdict="caught by $want"; else verdict="NOT CAUGHT by $want"; fi
  echo "$m: $verdict · red: $(echo "$out" | grep -o '^FAIL  [A-Z][0-9]' | sed 's/FAIL  //' | tr '\n' ' ')"
  echo "$out" | grep "^FAIL  $want " | cut -c1-300 | sed 's/^/    /'
  back
  [ "$(print)" = "$BEFORE" ] || { echo "the tree was NOT put back after $m"; exit 2; }
done
echo "caught $caught of $total · the tree put back as it was ($BEFORE)"
