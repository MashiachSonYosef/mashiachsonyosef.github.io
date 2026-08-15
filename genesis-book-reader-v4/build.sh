#!/usr/bin/env bash
# The Tabernacle · synthesis lane · one pass, sources to site
#
# Every published byte comes out of this file. There is no step that edits a
# zone after it is written, and no step that reaches for anything the corpus
# lane has not sealed. Run it twice on the same inputs and the outputs are
# byte-identical; that is the whole point of it existing.
#
#   usage:  ./build.sh <workspace-mirror> <bridge.csv.gz> <serve-dir> <stamp>
#   e.g.    ./build.sh ../mirror ../bridge.csv.gz ../serves 2026-08-15
#
# Stage 0, the mirror, is planned rather than assembled by hand:
#     node tools/plan-mirror.mjs --phase 1 --root "<corpus root>"
#     node tools/plan-mirror.mjs --phase 2 --mirror <mirror> --range A-B --root "<corpus root>"
# and the two lists are handed to the file bridge. Phase 2 is re-runnable and
# reproduces the mirror exactly, so the mirror is an output too.

set -euo pipefail
MIRROR="${1:?workspace mirror}"
BRIDGE="${2:?identity bridge csv.gz}"
SERVES="${3:?directory for serve output}"
STAMP="${4:?emission date, YYYY-MM-DD}"
mkdir -p "$SERVES" build data/zones site/data/zones

echo "── 1 · serve each work id-by-id from the sealed artifacts ──────────────"
serve () { # <name> <c0-range> <oracle sample>
  [ -f "$SERVES/$1.ndjson" ] || node tools/mishkan-serve-v1.mjs "$2" \
    --workspace "$MIRROR" --oracle "$3" --out "$SERVES/$1.ndjson"
}
serve genesis        69828900-69846706 24   # tanakh/genesis
serve 1kings         69859535-69870902 24   # tanakh/i-kings
serve targum-1kings  70513734-70527384 24   # targum/targum-jonathan-on-i-kings

echo "── 2 · the route store, from the sealed definition packages ────────────"
[ -f data/route-store/index.json ] || node tools/build-route-store.mjs \
  "$DEFPOC_RDM" "$DEFPOC_BREADTH" --out data/route-store

echo "── 3 · titles, read out of the Y ledger where one is promoted ──────────"
node tools/extract-y-nodes.mjs \
  --fixture data/y-genesis-navigation-v1.js --work tanakh/genesis --out build/y-genesis.json

echo "── 4 · zones ───────────────────────────────────────────────────────────"
node tools/build-zone.mjs \
  --serve "$SERVES/genesis.ndjson" --bridge "$BRIDGE" --store data/route-store \
  --work tanakh/genesis --title "Genesis" --title-he "בראשית" \
  --byline "Miqra according to the Masorah · served from the sealed terminal artifacts" \
  --coord-labels "chapter,verse" --y build/y-genesis.json \
  --license-links data/license-links-tanakh.json --stamp "$STAMP" \
  --out data/zones/genesis.bin

node tools/build-zone.mjs \
  --serve "$SERVES/1kings.ndjson" --bridge "$BRIDGE" --store data/route-store \
  --work tanakh/i-kings --title "I Kings" \
  --byline "Nevi'im · Miqra according to the Masorah · served from the sealed terminal artifacts" \
  --coord-labels "chapter,verse" \
  --license-links data/license-links-tanakh.json --stamp "$STAMP" \
  --out data/zones/1kings.bin

echo "── 5 · commentary, served from the same chain as the text ──────────────"
node tools/build-commentary-zone.mjs \
  --base-serve "$SERVES/1kings.ndjson" --base-work tanakh/i-kings \
  --serve "$SERVES/targum-1kings.ndjson" --work targum/targum-jonathan-on-i-kings \
  --title "Targum Jonathan on I Kings" --family "Targum Jonathan" \
  --bridge "$BRIDGE" --store data/route-store --stamp "$STAMP" \
  --out data/zones/1kings-commentary.bin

echo "── 6 · assemble the site ───────────────────────────────────────────────"
cp data/zones/*.bin site/data/zones/
rm -rf site/data/route-store && cp -r data/route-store site/data/route-store

echo "── 7 · verify by rendering, not by reading ─────────────────────────────"
node tools/verify-zone.mjs --root site --book 1kings
node tools/verify-zone.mjs --root site --book genesis

echo "done · $(du -sh site | cut -f1) in site/"
