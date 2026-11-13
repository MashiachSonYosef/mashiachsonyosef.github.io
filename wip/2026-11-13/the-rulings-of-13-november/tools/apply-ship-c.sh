#!/bin/bash
# The two gates put into the build tree, in the order the tree is made:
#   1. the edit scripts (the store reader, the projector, the page, the made spaces' tool and check, four checks, the
#      pipeline document), each refused unless its text stands
#   2. the new modules, tools and checks
#   3. the corpus lane's files as pinned (the row entries ledger's rule and receipt; the names lists), from the
#      development copy
#   4. the store's tools: the row entries, the name rows, the made spaces
# Then the tree is set beside the development copy the gates were proven in: every file the edit scripts changed
# must be the development copy's file, byte for byte, and the store must come out at the same version.
# usage: apply-ship-c.sh <scratchpad>
set -euo pipefail
S="$1"
PT="$S/pt/reader"; DEV="$S/pc/reader"; E="$S/v31/edits"
LEDGER="$S/dl-v178/v2/ledgers/all/row-entries/row-entries-v1/row-entries-v1.jsonl"
[ -z "$(git -C "$S/pt" status --short)" ] || { echo "the build tree is not clean; stop"; exit 1; }
cd "$PT"
for n in 51 52 53 58 59 60 62 63 65; do node "$E"/$n-*.mjs "$PT"; done
for f in entry-gate-v1 names-gate-v1 place-leaders-v1 gated-card-v1 apply-row-entries-v1 apply-name-rows-v1 check-entry-gate-v1 check-names-gate-v1; do cp "$S/v31/new/$f.mjs" "tools/$f.mjs"; done
cp -r "$DEV/data/row-entries" data/
cp -r "$DEV/data/names" data/
node tools/apply-row-entries-v1.mjs --ledger "$LEDGER" | tail -2 | cut -c1-500
node tools/apply-name-rows-v1.mjs | tail -2 | cut -c1-500
node tools/apply-made-spaces-v1.mjs | tail -1 | cut -c1-300
differs=0
for f in zone.html tools/gloss-store-v1.mjs tools/project-lattice-v12-v1.mjs tools/apply-made-spaces-v1.mjs tools/check-made-spaces-v1.mjs tools/check-pointing-gate-v1.mjs tools/check-masorah-toggle-v1.mjs tools/check-names-pill-v1.mjs tools/check-source-switch-v1.mjs; do
  if cmp -s "$f" "$DEV/$f"; then echo "the development copy's file: $f"; else echo "DIFFERS from the development copy: $f"; differs=1; fi
done
echo "store here $(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["store_version"])' data/route-store/index.json) · in the development copy $(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["store_version"])' "$DEV/data/route-store/index.json")"
exit $differs
