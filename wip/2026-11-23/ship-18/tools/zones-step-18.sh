#!/bin/bash
# Ship 18 (23 November 2026): the tools of the round's zones step that the landing and the hold touch, run as the round
# runs them (tools/round-v1.sh): the Tikkunei Zohar's columns baked and its line read again, every commentary zone's
# line read again, then the held places laid (tools/apply-held-places-v1.mjs). Nothing else of the round.
# Usage: zones-step-18.sh <reader dir> <stamp YYYY-MM-DD> <log dir>
R=${1:?reader dir}; STAMP=${2:?stamp}; W=${3:?log dir}; mkdir -p $W/zones $W/commentary
cd $R || exit 1
stop() { echo "STOPPED at $1"; exit 1; }
b=tikkunei-zohar; code=0
node tools/bake-witnessed-order-v1.mjs --zone "data/zones/$b.bin" --stamp "$STAMP" --out "$W/zones/$b.baked.bin" > "$W/zones/$b.bake.log" 2>&1 || code=$?
if [ "$code" = "3" ]; then cp "data/zones/$b.bin" "$W/zones/$b.baked.bin"; elif [ "$code" != "0" ]; then stop "bake $b"; fi
node tools/regloss-zone.mjs --zone "$W/zones/$b.baked.bin" --out "$W/zones/$b.bin" --stamp "$STAMP" > "$W/zones/$b.regloss.log" 2>&1 || stop "regloss $b"
cp "$W/zones/$b.bin" "data/zones/$b.bin"
for f in data/zones/*.commentary.bin; do
  n="$(basename "$f")"; case "$n" in fixture-*) continue ;; esac
  node tools/regloss-zone.mjs --zone "$f" --out "$W/commentary/$n" --stamp "$STAMP" > "$W/commentary/$n.log" 2>&1 || stop "regloss $n"
done
for f in "$W"/commentary/*.bin; do cp "$f" "data/zones/$(basename "$f")"; done
node tools/apply-held-places-v1.mjs --stamp "$STAMP" --list > "$W/held-places.log" 2>&1 || { tail -5 "$W/held-places.log"; stop "the held places"; }
grep -v "^  targum\|^  aramaic" "$W/held-places.log"
echo "ZONES STEP DONE"
