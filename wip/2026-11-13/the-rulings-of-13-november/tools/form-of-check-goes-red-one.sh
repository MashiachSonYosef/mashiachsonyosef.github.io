#!/usr/bin/env bash
# One of the nine ways of form-of-check-goes-red-v1.sh, run alone (the ninth did not apply on the first run: its
# text stood twice in the page; form-of-tamper-v1.py now names the one place).
# bash form-of-check-goes-red-one.sh <reader dir> <scratch dir> <the address the reader dir is served at> <letter> <what is said> <the file changed> <mode and its arguments...>
set -u
R="$1"; W="$2"; BASE="$3"; letter="$4"; said="$5"; file="$6"; shift 6
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$W"
cd "$R"
verdict() { grep -E "^FAIL|^all checks passed|^PAGE ERROR" "$1" | cut -c1-330; }
echo "$letter · $said:"
cp "$file" "$W/kept"
python3 -I "$HERE/form-of-tamper-v1.py" "$@" | sed 's/^/   /'
node tools/check-form-of-v1.mjs "$BASE" > "$W/$letter.log" 2>&1; echo "   exit $?"; verdict "$W/$letter.log" | sed 's/^/   /'
cp "$W/kept" "$file"; cmp -s "$W/kept" "$file" && echo "   $file put back, byte for byte"
echo "everything back:"
node tools/check-form-of-v1.mjs "$BASE" > "$W/back.log" 2>&1; echo "   exit $?"; verdict "$W/back.log" | sed 's/^/   /'
