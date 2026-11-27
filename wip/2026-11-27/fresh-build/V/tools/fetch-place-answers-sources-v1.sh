#!/usr/bin/env bash
# Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
# LEDGER: -
# no frame letter. FROM NOTHING: it fills a new folder with every source file
# the place answers are made from, each at the revision the pin names, and
# holds each to the pin's sha256. It runs nothing it downloads and sends
# nothing but the request.
#
#   fetched from its provider's public address
#     STEP's four word-by-word files (TAHOT) and its brief lexicon (TBESH)   STEPBible/STEPBible-Data
#     MACULA's table                                                         Clear-Bible/macula-hebrew (large file storage)
#     Strong's, Brown-Driver-Briggs, the Lexical Index (and schema, readme)  openscriptures/HebrewLexicon
#     the unabridged Brown-Driver-Briggs (the zip, its README)                eliranwong/unabridged-BDB-Hebrew-lexicon
#     the UBS dictionary (the JSON, README, LICENSE; the earlier JSON)       ubsicap/ubs-open-license
#   NOT fetched: no public address this machine reaches serves them
#     the corpus lane's record of the Hebrew Wikisource edition of Strong's, and the one page of it
#     the corpus lane's record of unfoldingWord's lexicon
#   These are taken from a folder given as the second argument (searched by
#   file name, held to the same sha256); with no such folder the script says
#   which files are still wanted and exits 4 with everything else in place.
#
# What stands where, each revision and each sha256 come from the last build's
# own map and pins (tools/say-place-answers-fetch-plan-v1.mjs prints the
# plan). The folder it fills is a sources folder: it carries sources.json,
# and tools/make-place-answers-v1.sh <that folder> makes the place answers.
#
# Usage: tools/fetch-place-answers-sources-v1.sh <new folder> [<folder holding the files that cannot be fetched>]
set -u
cd "$(dirname "$0")/.." || exit 1
OUT="${1:-}"; GIVEN="${2:-}"
if [ -z "$OUT" ]; then echo "usage: $0 <new folder> [<folder holding the files that cannot be fetched>]"; exit 2; fi
if [ -e "$OUT" ] && [ -n "$(ls -A "$OUT" 2>/dev/null)" ]; then echo "$OUT already holds files: name a new folder"; exit 2; fi
mkdir -p "$OUT" || exit 1
PLAN="$OUT/fetch-plan.tsv"
node tools/say-place-answers-fetch-plan-v1.mjs > "$PLAN" || { echo "the plan could not be read from the last build's map and pins"; exit 3; }
get() { # address, file to write
  for try in 1 2 3 4; do
    if curl -sS -f -L --retry 2 -o "$2" "$1"; then return 0; fi
    sleep $((try * 2))
  done
  return 1
}
sum() { sha256sum "$1" | cut -d' ' -f1; }
fail=0; wanted=0; n=0
while IFS=$'\t' read -r kind rel sha bytes what why; do
  dest="$OUT/$rel"; mkdir -p "$(dirname "$dest")"
  if [ "$kind" = fetch ]; then
    if ! get "$what" "$dest"; then echo "FAILED to fetch  $rel  from $what"; fail=1; continue; fi
  else
    found=""
    if [ -n "$GIVEN" ]; then
      # every file of that name under the folder given; the one with the pin's bytes is taken
      while IFS= read -r cand; do if [ "$(sum "$cand")" = "$sha" ]; then found="$cand"; break; fi; done < <(find -L "$GIVEN" -type f -name "$what" 2>/dev/null)
    fi
    if [ -z "$found" ]; then echo "NOT FETCHED  $rel  ($bytes bytes, sha256 $sha): $why${GIVEN:+; no file of that name with those bytes stands under $GIVEN}"; wanted=$((wanted + 1)); continue; fi
    cp "$found" "$dest" || { fail=1; continue; }
  fi
  got="$(sum "$dest")"
  if [ "$got" != "$sha" ]; then echo "NOT THE PINNED FILE  $rel  sha256 $got, the pin says $sha"; fail=1; continue; fi
  n=$((n + 1)); echo "ok  $rel  $bytes bytes  $kind"
done < "$PLAN"
cp data/place-answers-v1/sources.json "$OUT/sources.json" || fail=1
{ # what the places' own maker reads (tools/make-place-answers-places-v1.sh <folder>)
  printf 'step_revision\t%s\n' "$(node tools/say-place-answers-sources-v1.mjs "$OUT/sources.json" step.revision_whole)"
  printf 'macula_revision\t%s\n' "$(node tools/say-place-answers-sources-v1.mjs "$OUT/sources.json" macula.revision_whole)"
  for f in "$OUT"/step/* "$OUT"/macula/*; do [ -f "$f" ] && printf '%s\t%s\t%s\n' "$(sum "$f")" "$(stat -c %s "$f")" "$(basename "$f")"; done
} > "$OUT/fetched.tsv"
echo
if [ "$fail" != 0 ]; then echo "the folder is NOT whole: a fetch failed or a file is not the pinned one"; exit 1; fi
if [ "$wanted" != 0 ]; then echo "$n files in place, each the pinned bytes; $wanted cannot be fetched from here: give a folder that holds them as the second argument"; exit 4; fi
echo "$n files in place, each the pinned bytes. Then: tools/make-place-answers-v1.sh $OUT"
