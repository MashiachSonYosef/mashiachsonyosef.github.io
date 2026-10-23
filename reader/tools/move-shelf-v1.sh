#!/usr/bin/env bash
# Move the shelf: the bins leave the served branch and stand on the base.
# GUARDS: zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight
#
# One ruled value and three proofs, in order, fail-closed at each:
#   1. the base is written into the store record (the owner's ruling, by name)
#   2. every pin is reachable and exact at that base, over the page's own wire
#   3. the reader still refuses a forged bin, and still renders an honest one
# Only after all three do the bins leave the branch. They stay on this disk —
# every build and check reads them here — and a fresh checkout gets them back
# with tools/pull-zones-from-store-v1.mjs, verified before written.
#
# Run: tools/move-shelf-v1.sh <public base url>
set -euo pipefail
cd "$(dirname "$0")/.."
BASE="${1:?public base url for the zones prefix, e.g. https://zones.example/site/zones}"

node tools/emit-zone-store-v1.mjs --base "$BASE"
node tools/check-zone-store-reachable-v1.mjs
node tools/check-zone-store-v1.mjs

# the seals stay; the weight goes. --cached: the files remain on disk.
git rm -r --cached --quiet data/zones
IGN=../.gitignore
grep -qxF 'reader/data/zones/*.bin' "$IGN" 2>/dev/null || echo 'reader/data/zones/*.bin' >> "$IGN"
echo
echo "the shelf stands at $BASE · $(ls data/zones/*.bin | wc -l) bins untracked, still on disk · commit and deploy"
