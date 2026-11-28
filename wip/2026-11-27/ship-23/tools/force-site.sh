#!/bin/bash
# Pin today's card on every page of the ship tree for a run of the gate, and take the pin off after. The book and
# chapter pages are generated from zone.html, so the meta reader-card line must be in each page's own head.
# force: writes a sha256 manifest of every page first, then inserts the line after the charset line of each.
# unforce: removes exactly that line from each, then checks every page against the manifest.
# Usage: force-site.sh force|unforce <tree> <work dir>
set -euo pipefail
MODE=$1; T=$2; O=$3; M=$O/site-pages.sha256; LIST=$O/site-pages.txt
LINE='<meta name="reader-card" content="spelling">'
cd $T
if [ $MODE = force ]; then
  { ls reader/zone.html; find . -mindepth 2 -maxdepth 3 -name index.html -not -path './reader/*' | sed 's|^\./||'; } | sort -u > $LIST
  xargs -a $LIST grep -L '<meta charset="utf-8">' > $O/site-pages-nocharset.txt || true
  [ -s $O/site-pages-nocharset.txt ] && grep -v -x -f $O/site-pages-nocharset.txt $LIST > $LIST.tmp && mv $LIST.tmp $LIST
  if xargs -a $LIST grep -l "$LINE" | grep -q .; then echo "REFUSED: a page already carries the pin"; exit 1; fi
  xargs -a $LIST sha256sum > $M
  xargs -a $LIST sed -i "0,/<meta charset=\"utf-8\">/s||<meta charset=\"utf-8\">\n$LINE|"
  echo "pinned $(xargs -a $LIST grep -l "$LINE" | wc -l) of $(wc -l < $LIST) pages"
else
  xargs -a $LIST sed -i "/^$LINE\$/d"
  sha256sum -c --quiet $M && echo "unpinned: every page equals its manifest"
fi
