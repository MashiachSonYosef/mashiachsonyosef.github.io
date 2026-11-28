#!/usr/bin/env bash
# Scratch (builder H2): set the sandbox's page files to one of three states for a run of checks, and back.
#   before    the tree as the lead handed it: reader/zone.html as committed (HEAD), reader/place.html as handed over
#             (S/s46w/kept/place.html.as-handed-over), and neither of the place card's two tools
#   older     this work, with the page resting on the older card: one line in reader/zone.html's head,
#             <meta name="reader-card" content="spelling">
#   after     this work as it stands (restored from the copy taken at the first switch away from it)
# Every state is reached from "after" and goes back to it; the copy of "after" is held to its sha256 on the way back.
# usage: h2-swap.sh <before|older|after>
set -euo pipefail
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
R=$S/s16/reader
K=$S/s46w/h2-swap
FILES="zone.html place.html tools/place-card-v1.mjs tools/check-place-card-one-place-v1.mjs"
mkdir -p "$K/after/tools"
state() { cat "$K/state" 2>/dev/null || echo after; }
case "$1" in
  before|older)
    [ "$(state)" = after ] || { echo "the sandbox is in state $(state); go back to after first"; exit 2; }
    for f in $FILES; do cp -p "$R/$f" "$K/after/$f"; done
    (cd "$R" && sha256sum $FILES) > "$K/after.sha256"
    if [ "$1" = before ]; then
      git -C "$S/s16" show HEAD:reader/zone.html > "$R/zone.html"
      cp "$S/s46w/kept/place.html.as-handed-over" "$R/place.html"
      rm "$R/tools/place-card-v1.mjs" "$R/tools/check-place-card-one-place-v1.mjs"
    else
      python3 -I - "$R/zone.html" <<'EOF'
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
a = '<meta charset="utf-8">\n'
assert s.count(a) == 1
open(p, "w", encoding="utf-8").write(s.replace(a, a + '<meta name="reader-card" content="spelling">\n', 1))
EOF
    fi
    echo "$1" > "$K/state" ;;
  after)
    [ "$(state)" != after ] || { echo "already after"; exit 0; }
    for f in $FILES; do cp -p "$K/after/$f" "$R/$f"; done
    (cd "$R" && sha256sum -c --quiet "$K/after.sha256") && echo after > "$K/state" ;;
  *) echo "usage: h2-swap.sh <before|older|after>"; exit 2 ;;
esac
echo "state: $(state)"; git -C "$S/s16" status --short reader/zone.html reader/place.html reader/tools/place-card-v1.mjs reader/tools/check-place-card-one-place-v1.mjs
