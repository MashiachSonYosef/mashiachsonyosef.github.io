#!/usr/bin/env bash
# The door, asked to build over resting lines that are not of the tree it builds from: the page changed by one
# byte after the lines were read, then a file the page asks for changed by one byte. Each time the door is run
# into a scratch folder and its exit and its own words are printed; then the file is put back exactly and the door
# is run once more to show it builds.
# bash door-refuses-stale-lines.sh <reader dir> <scratch dir>
set -u
R="$1"; W="$2"
mkdir -p "$W"
cd "$R"
try() {
  rm -rf "$W/out"
  node tools/build-front-door-v1.mjs --out "$W/out" > "$W/door.log" 2>&1
  code=$?
  echo "   exit $code · $(grep -E '^Error: |chapter pages:' "$W/door.log" | head -1 | cut -c1-420)"
}
echo "the tree as it stands:"; try
cp zone.html "$W/zone.html.kept"
printf '\n' >> zone.html
echo "zone.html one byte longer than when the lines were read:"; try
cp "$W/zone.html.kept" zone.html
cmp -s zone.html "$W/zone.html.kept" && echo "   zone.html put back, byte for byte"
F=data/source-defaults-v1.json
cp "$F" "$W/kept.json"
printf ' ' >> "$F"
echo "$F one byte longer:"; try
cp "$W/kept.json" "$F"
cmp -s "$F" "$W/kept.json" && echo "   $F put back, byte for byte"
G="$(ls data/resting-lines/*.json.gz | head -1)"
mv "$G" "$W/kept.gz"
echo "one work's record taken away ($(basename "$G")):"; try
mv "$W/kept.gz" "$G"
echo "everything back:"; try
rm -rf "$W/out"
