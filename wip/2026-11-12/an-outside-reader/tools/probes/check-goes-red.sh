#!/usr/bin/env bash
# The chapter-pages check, shown to fail when the list is not the line, two ways, each undone exactly afterwards:
#   A  one reading changed by hand in one chapter page's list (the record and the reader untouched);
#   B  one reading changed by hand in one work's kept record, and the door built again from it, so the list prints
#      the changed reading while the reader draws the true one. The door cannot refuse this: the record still names
#      the page and the files as they stand. Only reading the page again can catch it.
# bash check-goes-red.sh <reader dir> <scratch dir> <a book whose record to change, one whose only chapter the check reads>
set -u
R="$1"; W="$2"; BOOK="$3"
mkdir -p "$W"
cd "$R"
verdict() { grep -E "^FAIL|^all checks passed|FAILED$" "$1" | cut -c1-360; }

PAGE="$(ls -d ../genesis/1/index.html)"
cp "$PAGE" "$W/page.kept"
python3 -I - "$PAGE" <<'EOF'
import sys
p = sys.argv[1]
s = open(p, encoding="utf8").read()
a = "<span>in + beginning<sup>"
assert s.count(a) >= 1, "the reading to change is not on the page"
open(p, "w", encoding="utf8").write(s.replace(a, "<span>in + the beginning<sup>", 1))
EOF
echo "A · one reading changed by hand in the list of $(dirname "$PAGE" | sed 's#^\.\./##'):"
node tools/check-chapter-pages-v3.mjs > "$W/a.log" 2>&1; echo "   exit $?"; verdict "$W/a.log" | sed 's/^/   /'
cp "$W/page.kept" "$PAGE"; cmp -s "$PAGE" "$W/page.kept" && echo "   the page put back, byte for byte"

REC="data/resting-lines/$BOOK.json.gz"
cp "$REC" "$W/record.kept"
python3 -I - "$REC" <<'EOF'
import gzip, json, sys
p = sys.argv[1]
d = json.loads(gzip.open(p).read())
u = d["sections"][0][1][0]
print("   the record's first line of its first verse was", json.dumps(u[2]), "and is changed to", json.dumps(u[2] + " (changed by hand)"))
u[2] = u[2] + " (changed by hand)"
open(p, "wb").write(gzip.compress(json.dumps(d, ensure_ascii=False, separators=(",", ":")).encode("utf8"), 9, mtime=0))
EOF
echo "B · one reading changed by hand in the record of $BOOK, the door built again from it:"
node tools/build-front-door-v1.mjs > "$W/door-b.log" 2>&1; echo "   the door: exit $? · $(grep -E '^Error: |chapter pages:' "$W/door-b.log" | head -1 | cut -c1-200)"
cp -a deploy-root/. ..
node tools/check-chapter-pages-v3.mjs > "$W/b.log" 2>&1; echo "   exit $?"; verdict "$W/b.log" | sed 's/^/   /'
cp "$W/record.kept" "$REC"; cmp -s "$REC" "$W/record.kept" && echo "   the record put back, byte for byte"
node tools/build-front-door-v1.mjs > "$W/door-back.log" 2>&1; echo "   the door built again from the true record: exit $?"
cp -a deploy-root/. ..
