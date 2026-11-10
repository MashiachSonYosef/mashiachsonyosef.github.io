#!/bin/bash
cd /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/pt/reader || exit 1
for c in check-export-v1 check-page-fetches-v1 check-nothing-hand-typed-v1 check-lane-state-v1 check-choice-memory-v1 check-run-card-forms-v1 check-blanks-pill-v1 check-card-channels-v1 check-block-in-table-v1 check-lattice-parts-in-card-v1 check-carrier-survives-v1 check-every-reading-licensed-v1 check-front-door-opens-title-v1 check-catalog-case-v1 check-zone-store-v1 check-scope-derived-v1 check-witnessed-order-v1 check-search-v1 check-language-admitted-v1 check-declarations-branch-v1 check-source-corpus-v1 check-frame-coverage-v1 check-overlays-v1 check-work-status-v1 check-hebrew-is-red-v1 check-masoretic-gold-v1 check-blob-precision-v1 check-color-channels-v1; do
  if [ ! -f "tools/$c.mjs" ]; then echo "$c MISSING"; continue; fi
  out=$(timeout 1500 node "tools/$c.mjs" 2>&1); code=$?
  echo "$c $code"
  echo "$out" > /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v26/out-$c.txt
  if [ "$code" != "0" ]; then echo "$out" | grep -E "FAIL|SKIPPED|PAGE ERROR" | head -6 | sed 's/^/    /' | cut -c1-300; fi
done
echo CHAIN-DONE
