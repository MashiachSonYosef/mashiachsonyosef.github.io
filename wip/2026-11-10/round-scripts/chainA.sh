#!/bin/bash
cd /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/pt/reader || exit 1
for c in check-pointing-gate-v1 check-pointing-grade-v1 check-masorah-toggle-v1 check-span-store-v1 check-card-opens-on-the-line-v1 check-line-reads-the-place-v1 check-lattice-projection-v1 check-page-agrees-with-store-v1 check-proper-name-v1 check-piece-class-v1 check-first-reading-is-sorted-v1 check-reading-rows-v1 check-source-switch-v1 check-kq-carried-v1 check-run-line-follows-division-v1 check-route-store-exact-k-v1 check-store-continuity-v1 check-store-pinned-v1 check-provider-characters-v1 check-zone-single-pass-receipts-v1 check-pointing-store-landing-v1 check-chain-book-v1 check-read-form-offsets-v1 check-ledger-divisions-v1 check-kq-graded-v1 check-source-years-v1; do
  if [ ! -f "tools/$c.mjs" ]; then echo "$c MISSING"; continue; fi
  out=$(timeout 1500 node "tools/$c.mjs" 2>&1); code=$?
  echo "$c $code"
  echo "$out" > /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v26/out-$c.txt
  if [ "$code" != "0" ]; then echo "$out" | grep -E "FAIL|SKIPPED|PAGE ERROR" | head -6 | sed 's/^/    /' | cut -c1-300; fi
done
echo CHAIN-DONE
