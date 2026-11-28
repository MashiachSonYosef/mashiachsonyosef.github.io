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
#   taken from the corpus lane's store, by key and sha256: the public host refuses this machine
#     unfoldingWord's lexicon, the repository zip its host packs           git.door43.org (the commit is the zip's own comment)
#     the Hebrew Wikisource edition of Strong's, its nine pages            he.wikisource.org (no revision recorded)
#   The lane put both on its store as received (relay v223, FB1); a page is
#   stored gzipped and unpacks to the page as received. The stored object is
#   held to its sha256 (the map names it) and what the build reads to the
#   pin's. The store is read only through a read-only client the environment
#   names, called as  $PLACE_ANSWERS_STORE_READER get <folder> <key>  and
#   writing <folder>/<key> (e.g. PLACE_ANSWERS_STORE_READER="node r2.mjs",
#   with NODE_USE_ENV_PROXY=1); the client takes its credentials from the
#   environment, and this script never sees them and writes nothing to the
#   store. Without a client, the files are taken from a folder given as the
#   second argument: the stored object by the key's file name, or the file as
#   received by its own name, each held to its sha256. With neither the script
#   says which files are still wanted and exits 4 with everything else in place.
#   (Until the ninth cut three files were taken by hand from such a folder and
#   stood for part of these two: the lane's record files M7.jsonl and M14.jsonl,
#   and the one page H1.)
#
# What stands where, each revision and each sha256 come from the last build's
# own map and pins (tools/say-place-answers-fetch-plan-v1.mjs prints the
# plan). The folder it fills is a sources folder: it carries sources.json,
# and tools/make-place-answers-v1.sh <that folder> makes the place answers.
#
# Usage: [PLACE_ANSWERS_STORE_READER="<read-only client>"] tools/fetch-place-answers-sources-v1.sh <new folder> [<folder holding the store's files>]
set -u
cd "$(dirname "$0")/.." || exit 1
OUT="${1:-}"; GIVEN="${2:-}"
if [ -z "$OUT" ]; then echo "usage: [PLACE_ANSWERS_STORE_READER=\"<read-only client>\"] $0 <new folder> [<folder holding the store's files>]"; exit 2; fi
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
# the first file under the folder given with this name and these bytes
given() { [ -n "$GIVEN" ] || return 1; while IFS= read -r cand; do if [ "$(sum "$cand")" = "$2" ]; then echo "$cand"; return 0; fi; done < <(find -L "$GIVEN" -type f -name "$1" 2>/dev/null); return 1; }
WORK="$OUT/.store-objects" # where the client writes what it reads; removed at the end
while IFS=$'\t' read -r kind rel sha bytes what osha obytes packing host why; do
  dest="$OUT/$rel"; mkdir -p "$(dirname "$dest")"
  if [ "$kind" = fetch ]; then
    if ! get "$what" "$dest"; then echo "FAILED to fetch  $rel  from $what"; fail=1; continue; fi
  elif [ "$kind" = store ]; then
    obj=""
    if [ -n "${PLACE_ANSWERS_STORE_READER:-}" ]; then
      mkdir -p "$WORK"
      if $PLACE_ANSWERS_STORE_READER get "$WORK" "$what" < /dev/null > /dev/null && [ -f "$WORK/$what" ]; then obj="$WORK/$what"; else echo "FAILED to read  $what  from the store"; fail=1; continue; fi
    elif ! obj="$(given "$(basename "$what")" "$osha")"; then
      # the file as received, by its own name and the pin's bytes
      if recv="$(given "$(basename "$rel")" "$sha")"; then cp "$recv" "$dest" || { fail=1; continue; }; fi
    fi
    if [ -n "$obj" ]; then
      got="$(sum "$obj")"
      if [ "$got" != "$osha" ]; then echo "NOT THE STORED OBJECT  $what  sha256 $got, the map says $osha"; fail=1; continue; fi
      if [ "$packing" = gzip ]; then gzip -dc < "$obj" > "$dest" || { echo "NOT UNPACKED  $what"; fail=1; continue; }; else cp "$obj" "$dest" || { fail=1; continue; }; fi
    elif [ ! -f "$dest" ]; then
      echo "NOT FETCHED  $rel  ($bytes bytes, sha256 $sha): the corpus lane's store holds it as $what ($obytes bytes, sha256 $osha); $host: $why; name a read-only client in PLACE_ANSWERS_STORE_READER${GIVEN:+, or no file of either name with those bytes stands under $GIVEN}"; wanted=$((wanted + 1)); continue
    fi
  else echo "the plan has a line of a kind this script does not know: $kind"; fail=1; continue
  fi
  got="$(sum "$dest")"
  if [ "$got" != "$sha" ]; then echo "NOT THE PINNED FILE  $rel  sha256 $got, the pin says $sha"; fail=1; continue; fi
  n=$((n + 1)); echo "ok  $rel  $bytes bytes  $kind"
done < "$PLAN"
rm -rf "$WORK"
cp data/place-answers-v1/sources.json "$OUT/sources.json" || fail=1
{ # what the places' own maker reads (tools/make-place-answers-places-v1.sh <folder>)
  printf 'step_revision\t%s\n' "$(node tools/say-place-answers-sources-v1.mjs "$OUT/sources.json" step.revision_whole)"
  printf 'macula_revision\t%s\n' "$(node tools/say-place-answers-sources-v1.mjs "$OUT/sources.json" macula.revision_whole)"
  for f in "$OUT"/step/* "$OUT"/macula/*; do [ -f "$f" ] && printf '%s\t%s\t%s\n' "$(sum "$f")" "$(stat -c %s "$f")" "$(basename "$f")"; done
} > "$OUT/fetched.tsv"
echo
if [ "$fail" != 0 ]; then echo "the folder is NOT whole: a fetch failed or a file is not the pinned one"; exit 1; fi
if [ "$wanted" != 0 ]; then echo "$n files in place, each the pinned bytes; $wanted are wanted from the corpus lane's store: name a read-only client in PLACE_ANSWERS_STORE_READER, or give a folder that holds them as the second argument"; exit 4; fi
echo "$n files in place, each the pinned bytes. Then: tools/make-place-answers-v1.sh $OUT"
