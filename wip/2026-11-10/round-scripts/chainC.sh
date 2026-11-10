#!/bin/bash
# Chain C: the drawing checks outside chains A and B (frames, run lines, the card's head, numbers, colors, the switches).
# Usage: chainC.sh <tree> <tag> [port]   (tree: the checkout whose reader/ is checked; tag names the out files)
# Two of them take the page's address and skip without one (check-maqaf-pair-drawn-v1, check-parts-read-right-to-left-v1):
# they are given the default zone's. check-lone-letters-v1 is not here: it holds a zone to the corpus lane's record of its
# lone letters and wants that record (--zone, --marks); it is a pipeline tool, not a drawing check.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
TREE=${1:-$S/pt}; TAG=${2:-new}; PORT=${3:-8899}
OUT=$S/v28/outC; mkdir -p "$OUT"
cd "$TREE/reader" || exit 1
ZONEURL=$(node -e 'import("./tools/zones-on-disk-v1.mjs").then((m) => console.log(m.defaultZoneUrl()))' | sed "s#127.0.0.1:[0-9]*#127.0.0.1:$PORT#")
echo "the default zone's address: $ZONEURL"
run() {
  local c="$1"; shift
  if [ ! -f "tools/$c.mjs" ]; then echo "$c MISSING"; return; fi
  local out code
  out=$(timeout 900 node "tools/$c.mjs" "$@" 2>&1); code=$?
  echo "$c $code${1:+ [$1]}"
  echo "$out" > "$OUT/$TAG-$c${2:+-$2}.txt"
  if [ "$code" != "0" ]; then echo "$out" | grep -E "FAIL|SKIPPED|PAGE ERROR|Error" | head -5 | sed 's/^/    /' | cut -c1-300; fi
}
for c in check-blob-every-v1 check-ruled-equals-first-paint-v1 check-ruled-mark-v1 check-ruled-split-fits-v1 check-masoretic-gold-v1 \
  check-nothing-overlaps-v1 check-underline-joins-v1 check-hud-runs-v1 check-run-cards-v1 check-usable-card-v1 check-pill-whole-v1 \
  check-card-numbering-v1 check-line-follows-card-v1 check-selection-v1 check-kq-lead-follows-switch-v1 check-kq-presentation-v1 \
  check-hoh-in-card-v1 check-reset-pill-v1 check-menu-switches-v1 check-hud-toggles-v1 check-names-pill-v1 check-dictionary-toggle-v1 \
  check-door-find-v1 check-door-word-card-v1 check-drag-offscreen-v1 check-contents-shut-v1; do
  run "$c"
done
for c in check-maqaf-pair-drawn-v1 check-parts-read-right-to-left-v1; do run "$c" "$ZONEURL"; done
# the numbering check in each reader, on the pages with run cards (the check's own header names both addresses)
for q in "b=exodus" "b=exodus&mode=en" "b=genesis&mode=en" "b=psalms"; do
  run check-card-numbering-v1 "http://127.0.0.1:$PORT/zone.html?$q" "$(echo "$q" | tr '&=' '--')"
done
echo CHAINC-DONE
