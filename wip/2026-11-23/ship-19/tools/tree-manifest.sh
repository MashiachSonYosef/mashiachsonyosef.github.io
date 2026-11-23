#!/bin/bash
# Every file of a sandbox tree that differs from its commit, with the sha256 of its bytes now (a removed file reads
# "gone"), sorted; the tree is the git checkout holding the reader. Usage: tree-manifest.sh <checkout dir>
cd ${1:?checkout dir} || exit 1
{ git diff --name-only; git ls-files --others --exclude-standard; } | sort -u | while read -r f; do
  if [ -f "$f" ]; then echo "$(sha256sum "$f" | cut -c1-64) $f"; else echo "gone $f"; fi
done
