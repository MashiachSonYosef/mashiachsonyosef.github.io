#!/bin/bash
# STEP's Hebrew files at one revision of STEPBible-Data, each into the folder given (made new).
# Usage: fetch-step.sh <revision> <out dir>
set -u
REV="$1"; OUT="$2"
mkdir -p "$OUT"
BASE="https://raw.githubusercontent.com/STEPBible/STEPBible-Data/$REV"
get() { # folder, file name
  local url="$BASE/$(printf '%s' "$1" | sed 's/ /%20/g; s/+/%2B/g')/$(printf '%s' "$2" | sed 's/ /%20/g; s/+/%2B/g')"
  local to="$OUT/$(printf '%s' "$2" | sed 's/ /_/g')"
  for try in 1 2 3 4; do
    if curl -sS -f -L --retry 2 -o "$to" "$url"; then echo "ok  $(stat -c %s "$to")  $(sha256sum "$to" | cut -c1-16)  $2"; return 0; fi
    sleep $((try * 2))
  done
  echo "FAILED  $2"; return 1
}
T="Translators Amalgamated OT+NT"
get "$T" "TAHOT Gen-Deu - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt"
get "$T" "TAHOT Jos-Est - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt"
get "$T" "TAHOT Job-Sng - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt"
get "$T" "TAHOT Isa-Mal - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt"
get "Lexicons" "TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt"
