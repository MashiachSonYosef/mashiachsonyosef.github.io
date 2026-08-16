#!/usr/bin/env bash
# The Tabernacle · synthesis lane · one pass, sources to site
#
# Every published byte comes out of this file. There is no step that edits a
# zone after it is written, and no step that reaches for anything the corpus
# lane has not sealed. Run it twice on the same inputs and the outputs are
# byte-identical; that is the whole point of it existing.
#
#   usage:  ./build.sh <workspace-mirror> <bridge.csv.gz> <serve-dir> <stamp> [compspan.csv.gz]
#   e.g.    ./build.sh ../mirror ../bridge.csv.gz ../serves 2026-08-16 \
#             ../ledgers/work/composition-map-v6/w-to-compspan-template-v6.csv.gz
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
# The COMPspan template is optional: without it a zone offers whole forms only
# and says so in its own receipts. With it, every form carries its component
# list, and the reader derives the blocks and the complete divisions from that.
SPANS="${5:-}"
SPAN_ARG=()
if [ -n "$SPANS" ]; then SPAN_ARG=(--spans "$SPANS"); fi
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
# Genesis is built without --spans on purpose. Adding the component layer to a
# published book changes what every word offers, so it is its own decision and
# not a side effect of running this script.

node tools/build-zone.mjs \
  --serve "$SERVES/1kings.ndjson" --bridge "$BRIDGE" --store data/route-store \
  --work tanakh/i-kings --title "I Kings" \
  --byline "Nevi'im · Miqra according to the Masorah · served from the sealed terminal artifacts" \
  --coord-labels "chapter,verse" \
  --license-links data/license-links-tanakh.json --stamp "$STAMP" \
  ${SPAN_ARG[@]+"${SPAN_ARG[@]}"} --out data/zones/1kings.bin

# A commentary of the sealed chain is a work like any other, so it is also
# published as a book of its own rather than only quoted eleven words at a
# time through a card.
node tools/build-zone.mjs \
  --serve "$SERVES/targum-1kings.ndjson" --bridge "$BRIDGE" --store data/route-store \
  --work targum/targum-jonathan-on-i-kings --title "Targum Jonathan on I Kings" \
  --byline "Aramaic · served from the sealed terminal artifacts, attached to I Kings by the coordinates both works carry" \
  --coord-labels "chapter,verse" --stamp "$STAMP" \
  ${SPAN_ARG[@]+"${SPAN_ARG[@]}"} --out data/zones/targum-1kings.bin

echo "── 5 · commentary, served from the same chain as the text ──────────────"
# Coordinate identity is symmetric, so the same builder runs both ways and
# neither work is demoted to being only the other's apparatus.
node tools/build-commentary-zone.mjs \
  --base-serve "$SERVES/1kings.ndjson" --base-work tanakh/i-kings \
  --serve "$SERVES/targum-1kings.ndjson" --work targum/targum-jonathan-on-i-kings \
  --title "Targum Jonathan on I Kings" --family "Targum Jonathan" --published-as targum-1kings \
  --bridge "$BRIDGE" --store data/route-store --stamp "$STAMP" \
  ${SPAN_ARG[@]+"${SPAN_ARG[@]}"} --out data/zones/1kings-commentary.bin

node tools/build-commentary-zone.mjs \
  --base-serve "$SERVES/targum-1kings.ndjson" --base-work targum/targum-jonathan-on-i-kings \
  --serve "$SERVES/1kings.ndjson" --work tanakh/i-kings \
  --title "I Kings" --family "I Kings" --published-as 1kings \
  --bridge "$BRIDGE" --store data/route-store --stamp "$STAMP" \
  ${SPAN_ARG[@]+"${SPAN_ARG[@]}"} --out data/zones/targum-1kings-commentary.bin

echo "── 6 · assemble the site ───────────────────────────────────────────────"
cp data/zones/*.bin site/data/zones/
rm -rf site/data/route-store && cp -r data/route-store site/data/route-store

echo "── 7 · verify by rendering, not by reading ─────────────────────────────"
node tools/verify-zone.mjs --root site --book 1kings
node tools/verify-zone.mjs --root site --book genesis

echo "done · $(du -sh site | cut -f1) in site/"
