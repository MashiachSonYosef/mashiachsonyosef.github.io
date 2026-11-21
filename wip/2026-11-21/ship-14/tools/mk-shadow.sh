#!/bin/bash
# A light copy of the ship tree's reader folder for building one mend: its own zone.html, everything else by symlink,
# served on its own port. The ship tree is not touched. Usage: mk-shadow.sh <name> <port>
set -euo pipefail
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
NAME=${1:?name}; PORT=${2:?port}; D=$S/s18w/shadow/$NAME
mkdir -p $D
# the tools are copied, not linked: a check finds its tree from its own file's real place
for f in $S/s13/reader/* ; do b=$(basename $f); [ "$b" = "zone.html" ] && continue; [ "$b" = "tools" ] && { [ -e "$D/tools" ] || cp -r "$f" "$D/tools"; continue; }; [ -e "$D/$b" ] || ln -s "$f" "$D/$b"; done
[ -e $D/zone.html ] || cp $S/s13/reader/zone.html $D/zone.html
[ -e $D/zone.html.base ] || cp $S/s13/reader/zone.html $D/zone.html.base
pkill -f "http.server $PORT --bind 127.0.0.1" || true
(cd $D && setsid nohup python3 -m http.server $PORT --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 1
curl -sf -o /dev/null "http://127.0.0.1:$PORT/zone.html" && echo "shadow $NAME on $PORT: $D"
