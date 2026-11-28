#!/usr/bin/env bash
# Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
# LEDGER: -
# no frame letter. The one command that makes the places again: it builds
# data/place-answers-v1/places/ from the zones and the two sources' own files,
# then holds what it built with the check. It reads the downloads by path and
# runs nothing from inside them.
#
# Usage: tools/make-place-answers-places-v1.sh <folder made by fetch-place-answers-sources-v1.sh>
#    or: tools/make-place-answers-places-v1.sh <dir of STEP's four TAHOT files> <STEP revision> <macula-hebrew.tsv> <MACULA revision>
# Given a newer file of a source, the same command makes the same output for it.
set -u
cd "$(dirname "$0")/.." || exit 1
if [ "$#" = 1 ]; then
  D="$1"; [ -f "$D/fetched.tsv" ] || { echo "$D holds no fetched.tsv: fetch the sources first"; exit 2; }
  STEP="$D/step"; MAC="$D/macula/macula-hebrew.tsv"
  STEP_REV="$(awk -F'\t' '$1=="step_revision"{print $2}' "$D/fetched.tsv")"; MAC_REV="$(awk -F'\t' '$1=="macula_revision"{print $2}' "$D/fetched.tsv")"
elif [ "$#" = 4 ]; then STEP="$1"; STEP_REV="$2"; MAC="$3"; MAC_REV="$4"
else echo "usage: $0 <fetched folder>   or   $0 <STEP dir> <STEP revision> <macula tsv> <MACULA revision>"; exit 2; fi
node tools/build-place-answers-places-v1.mjs --step "$STEP" --step-revision "$STEP_REV" --macula "$MAC" --macula-revision "$MAC_REV" ${ZONES_DIR:+--zones "$ZONES_DIR"} ${TABLE:+--table "$TABLE"} || exit 1
echo
node tools/check-place-answers-places-v1.mjs --step "$STEP" --macula "$MAC" ${ZONES_DIR:+--zones "$ZONES_DIR"}
