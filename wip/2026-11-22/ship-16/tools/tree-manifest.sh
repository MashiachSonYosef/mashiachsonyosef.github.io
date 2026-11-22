#!/bin/bash
# Every file of the sandbox that differs from main, with the sha256 of its bytes now (a removed file reads "gone").
cd /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s12 || exit 1
{ git diff --name-only; git ls-files --others --exclude-standard; } | sort -u | while read -r f; do
  if [ -f "$f" ]; then echo "$(sha256sum "$f" | cut -c1-64) $f"; else echo "gone $f"; fi
done
