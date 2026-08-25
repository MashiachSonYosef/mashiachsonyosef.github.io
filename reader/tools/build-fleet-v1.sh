#!/usr/bin/env bash
# The fleet driver: every staged work goes to the gates, and the gates decide.
#
# The owner's ruling, 2026-08-25 (SERVE-LAW-2026-08-25.md): admission is the
# pipeline's. If a work passes the gates it goes in; if it fails, it — or the
# exact occurrence at fault — is held automatically, with the reason printed.
# Nobody admits a work by hand, and nothing is added one by one: the derived
# ranges name every work, the mirror decides which are staged, and this loop
# takes all of them.
#
# Per staged work, the same chain the planned works ride:
#   serve      mishkan-serve over the sealed artifacts — the rights catalog
#              rides per occurrence, and an occurrence whose display axis the
#              rights record does not allow is not displayable, word by word
#   zone       build-zone from the serve rows, the same store, the same rules
# A failure at either stage holds that one work with the stage and the
# refusal recorded in build/fleet-report-v1.tsv; the loop continues. A zone
# that lands in data/zones joins the serve set by the zones-on-disk law and
# faces every zone gate in the suite before anything deploys.
#
# Titles and descriptors are not invented: a fleet work has no ledgered or
# typed English title, so its address is read plainly — the licence law
# already prints exactly that until a licensed record backs a name — its
# byline is build-zone's honest default, and its coordinate label is the
# bridge's own grain word.
#
# Run: bash tools/build-fleet-v1.sh <mirror> <bridge.csv.gz> <serves-dir> <stamp> [spans]
set -euo pipefail
cd "$(dirname "$0")/.."

MIRROR="${1:?workspace mirror}"
BRIDGE="${2:?identity bridge csv.gz}"
SERVES="${3:?directory for serve output}"
STAMP="${4:?emission date, YYYY-MM-DD}"
SPANS="${5:-}"
SPAN_ARG=()
if [ -n "$SPANS" ]; then SPAN_ARG=(--spans "$SPANS"); fi
mkdir -p "$SERVES" build data/zones

node tools/emit-derived-work-ranges-v1.mjs
node tools/plan-fleet-v1.mjs --mirror "$MIRROR"

FLEET_TSV=build/fleet-plan-v1.tsv
REPORT=build/fleet-report-v1.tsv
: > "$REPORT"

STAGED=$(grep -c '^S' "$FLEET_TSV" 2>/dev/null || true)
if [ "${STAGED:-0}" = "0" ]; then
  echo "fleet: nothing staged in this mirror — the report is empty and honest"
  exit 0
fi

BUILT=0
HELD=0
while IFS=$'\t' read -r kind WID PUB LO HI; do
  [ "$kind" = "S" ] || continue
  # a fleet work never overwrites a zone the plan owns
  if [ -f "data/zones/$PUB.bin" ]; then
    echo -e "SKIP\t$WID\talready-on-disk" >> "$REPORT"; continue
  fi
  if [ ! -f "$SERVES/$PUB.ndjson" ]; then
    if ! node tools/mishkan-serve-v1.mjs "$LO-$HI" \
        --workspace "$MIRROR" --oracle 24 --out "$SERVES/$PUB.ndjson" 2> "build/fleet-$PUB.err"; then
      echo -e "HELD\t$WID\tserve\t$(tail -1 "build/fleet-$PUB.err" | tr '\t' ' ')" >> "$REPORT"
      HELD=$((HELD+1)); rm -f "$SERVES/$PUB.ndjson"; continue
    fi
  fi
  # The text gate. Markup, apparatus carried as words, wrapped variant
  # marks, mid-word splits — any of them and the work is held here, before
  # a zone can exist. This is how the failure of 2026-08-23 is refused
  # automatically instead of remembered.
  if ! node tools/check-corpus-clean-v1.mjs "$SERVES/$PUB.ndjson" --gate > "build/fleet-$PUB.clean" 2>&1; then
    echo -e "HELD\t$WID\ttext\t$(tail -1 "build/fleet-$PUB.clean" | tr '\t' ' ')" >> "$REPORT"
    HELD=$((HELD+1)); continue
  fi
  if ! node tools/build-zone.mjs \
      --serve "$SERVES/$PUB.ndjson" --bridge "$BRIDGE" --store data/route-store \
      --work "$WID" --title "$(echo "$PUB" | tr '-' ' ')" \
      --byline "" --coord-labels "unit" --stamp "$STAMP" \
      ${SPAN_ARG[@]+"${SPAN_ARG[@]}"} --out "data/zones/$PUB.bin" 2> "build/fleet-$PUB.err"; then
    echo -e "HELD\t$WID\tzone\t$(tail -1 "build/fleet-$PUB.err" | tr '\t' ' ')" >> "$REPORT"
    HELD=$((HELD+1)); rm -f "data/zones/$PUB.bin"; continue
  fi
  echo -e "BUILT\t$WID\t$PUB" >> "$REPORT"
  BUILT=$((BUILT+1))
done < "$FLEET_TSV"

echo "fleet: $BUILT built · $HELD held — every hold named in $REPORT"
echo "next: rebuild the door, run the full suite; nothing deploys red"
