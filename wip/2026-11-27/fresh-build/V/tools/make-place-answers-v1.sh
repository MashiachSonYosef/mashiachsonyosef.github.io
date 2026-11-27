#!/usr/bin/env bash
# Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
# LEDGER: -
# no frame letter. THE ONE COMMAND of the fresh build: from a folder of the
# sources' own files it makes the whole of data/place-answers-v1/ and holds
# it with each part's check. It reads the sources by path and runs nothing
# from inside them.
#
#   1  places/    STEP and MACULA at every word of our text      build-place-answers-places-v1.mjs
#   2  entries/, bridges/   each dictionary's entries, the bridges   build-place-answers-entries-v1.mjs
#   3  PIN.json   the two parts' pins joined                       join-place-answers-pin-v1.mjs
#   4  both checks, each with the sources open beside what was made
#   5  page/      the second reader's files, projected from 1 and 2, with their check, and the pin joined again
#                 (left out with --parts-only)
#
# Usage: tools/make-place-answers-v1.sh <sources folder> [--parts-only]
#   <sources folder> holds sources.json, the folder's own map: where each
#   source's file stands inside it, who gave it, at which revision. Given a
#   newer file of a source (put it in the folder, change its path and revision
#   in the map), the same command makes the same output for it. The zones are
#   the tree's own (data/zones) unless the map names a folder of them.
# One heavy process runs at a time. The first failure stops the making; a
# failed check does not stop the other checks, and the command exits 1.
set -u
cd "$(dirname "$0")/.." || exit 1
D="${1:-}"; ONLY="${2:-}"
if [ -z "$D" ] || [ ! -f "$D/sources.json" ]; then echo "usage: $0 <sources folder> [--parts-only]   (the folder holds sources.json)"; exit 2; fi
MAP="$D/sources.json"
val() { node tools/say-place-answers-sources-v1.mjs "$MAP" "$1"; }
STEP="$(val step.dir)" || exit 2; STEP_REV="$(val step.revision_whole)" || exit 2
MAC="$(val macula.tsv)" || exit 2; MAC_REV="$(val macula.revision_whole)" || exit 2
ZONES="$(val zones_dir)" || exit 2
t0=$(date +%s); step() { echo; echo "== $1 ($(( $(date +%s) - t0 )) s)"; }

step "1 the places: STEP and MACULA at every word"
node tools/build-place-answers-places-v1.mjs --step "$STEP" --step-revision "$STEP_REV" --macula "$MAC" --macula-revision "$MAC_REV" --zones "$ZONES" || exit 1
step "2 the entries and the bridges"
node tools/build-place-answers-entries-v1.mjs "$MAP" || exit 1
step "3 the one pin"
node tools/join-place-answers-pin-v1.mjs || exit 1

fail=0
step "4a the check of the places"
node tools/check-place-answers-places-v1.mjs --step "$STEP" --macula "$MAC" --zones "$ZONES" || fail=1
step "4b the check of the entries and the bridges"
node tools/check-place-answers-entries-v1.mjs "$MAP" || fail=1

if [ "$ONLY" != "--parts-only" ] && [ "$fail" = 0 ]; then
  step "5a the second reader's files"
  node tools/project-place-answers-page-v1.mjs --zones "$ZONES" || exit 1
  node tools/join-place-answers-pin-v1.mjs || exit 1
  step "5b the check of the second reader's files"
  node tools/check-place-answers-page-v1.mjs --zones "$ZONES" || fail=1
fi
step "the one pin, judged against the parts as they stand"
node tools/join-place-answers-pin-v1.mjs --check || fail=1
echo; echo "== done in $(( $(date +%s) - t0 )) s: $([ "$fail" = 0 ] && echo "everything holds" || echo "A CHECK FAILED")"
exit "$fail"
