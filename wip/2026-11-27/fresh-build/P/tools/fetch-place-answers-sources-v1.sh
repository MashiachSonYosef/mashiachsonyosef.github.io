#!/usr/bin/env bash
# Page lane · place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address
# LEDGER: -
# no frame letter. It downloads the two sources the places are made from, each
# into its own new folder, and writes what it fetched (revision, bytes, sha256)
# beside them. It runs nothing it downloads and sends nothing but the request.
#
#   STEP's four word-by-word files (TAHOT)   STEPBible/STEPBible-Data, folder «Translators Amalgamated OT+NT»
#   MACULA's table                           Clear-Bible/macula-hebrew, WLC/tsv/macula-hebrew.tsv (large file storage)
#
# Usage: tools/fetch-place-answers-sources-v1.sh <new folder> [STEP revision] [MACULA revision]
#   With no revision the provider's latest is asked for and written down.
#   Then: tools/make-place-answers-places-v1.sh <that folder>
set -u
OUT="${1:?a new folder to download into}"; STEP_REV="${2:-}"; MAC_REV="${3:-}"
if [ -e "$OUT/step" ] || [ -e "$OUT/macula" ]; then echo "$OUT already holds downloads: name a new folder"; exit 2; fi
mkdir -p "$OUT/step" "$OUT/macula" || exit 1
latest() { git ls-remote "https://github.com/$1" HEAD | cut -f1; }
[ -n "$STEP_REV" ] || STEP_REV="$(latest STEPBible/STEPBible-Data)"
[ -n "$MAC_REV" ] || MAC_REV="$(latest Clear-Bible/macula-hebrew)"
if [ -z "$STEP_REV" ] || [ -z "$MAC_REV" ]; then echo "could not learn a provider's latest revision"; exit 1; fi
get() { # address, file to write
  for try in 1 2 3 4; do
    if curl -sS -f -L --retry 2 -o "$2" "$1"; then return 0; fi
    sleep $((try * 2))
  done
  echo "FAILED  $1"; return 1
}
enc() { printf '%s' "$1" | sed 's/ /%20/g; s/+/%2B/g'; }
T="Translators Amalgamated OT+NT"; fail=0
for part in Gen-Deu Jos-Est Job-Sng Isa-Mal; do
  name="TAHOT $part - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt"
  get "https://raw.githubusercontent.com/STEPBible/STEPBible-Data/$STEP_REV/$(enc "$T")/$(enc "$name")" "$OUT/step/$(printf '%s' "$name" | sed 's/ /_/g')" || fail=1
done
get "https://media.githubusercontent.com/media/Clear-Bible/macula-hebrew/$MAC_REV/WLC/tsv/macula-hebrew.tsv" "$OUT/macula/macula-hebrew.tsv" || fail=1
[ "$fail" = 0 ] || exit 1
{
  printf 'step_revision\t%s\n' "$STEP_REV"
  printf 'macula_revision\t%s\n' "$MAC_REV"
  for f in "$OUT"/step/* "$OUT"/macula/*; do printf '%s\t%s\t%s\n' "$(sha256sum "$f" | cut -d' ' -f1)" "$(stat -c %s "$f")" "$(basename "$f")"; done
} > "$OUT/fetched.tsv"
cat "$OUT/fetched.tsv"
