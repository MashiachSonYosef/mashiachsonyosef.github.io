#!/usr/bin/env bash
# The Tabernacle · synthesis lane · the plan tier's build, sources to site
#
# WHAT THIS IS TODAY (10 November 2026). This file builds the works of the
# plan's tier from the corpus lane's sealed workspace: serve, zone,
# commentary, site. It needs that workspace (a mirror of the sealed corpus)
# and so does not run on a checkout. It is not how the bytes the site
# publishes today are made. The served shelf was built by the route builders
# (tools/serve-from-restore-v5.mjs for the thirty-nine books, tools/serve-
# edition-v1.mjs for an edition work), which need the corpus lane's files
# too, and every served zone has since been written again, many times, by
# the projections tools/round-v1.sh runs and by a few tools run by hand when
# their input arrived. Each of those writes is typed on the zone it changed,
# and tools/pipeline-manifest-v1.mjs reads them back off the bins: its last
# table says which tool wrote which bins and whether a build file runs it.
#
# The paragraph that stood here until that day said every published byte
# with a generator came out of this file and that no step edits a zone after
# it is written. Both were true in August and neither is now, and the second
# stage below had stood broken since a line was put inside its command: it
# ran the store's manifest and then tried to run two unset names as a
# program.
#
# Within its own tier the law is unchanged: no step here edits a zone after
# it is written, and nothing reaches for what the corpus lane has not
# sealed.
#
# This file names no work. It used to name three, thirty-two times — c0
# ranges, work ids, titles, a deploy list — and every literal was a hand copy
# of a field the Y ledger already carries, one edit away from contradicting
# the record. The parameters now come from tools/plan-build-v1.mjs, which
# derives them from the Y ledgers in data/ and, for a published work whose
# ledger has not landed yet, from data/work-records-v1.js, where the values
# are typed in the open under a basis that says so. Adding a work is putting
# its ledger in data/ — not editing this file. check-build-derived-v1 fails
# the suite if a work-naming literal ever comes back here.
#
#   usage:  ./build.sh <workspace-mirror> <bridge.csv.gz> <serve-dir> <stamp> [compspan.csv.gz]
#           ./build.sh --plan [stamp]     derive and print, run nothing
#
# Stage 0, the mirror, is planned rather than assembled by hand:
#     node tools/plan-mirror.mjs --phase 1 --root "<corpus root>"
#     node tools/plan-mirror.mjs --phase 2 --mirror <mirror> --range A-B --root "<corpus root>"
# and the two lists are handed to the file bridge. Phase 2 is re-runnable and
# reproduces the mirror exactly, so the mirror is an output too.

set -euo pipefail
# The engine directory's name, read from where this script runs, never typed.
ENGINE="$(basename "$PWD")"

echo "── 0 · the plan, derived from the ledgers ──────────────────────────────"
node tools/plan-build-v1.mjs --out build/build-plan-v1.json --tsv build/build-plan-v1.tsv
PLAN=build/build-plan-v1.tsv
# The basis and holds file the pages read their own incompleteness from —
# derived from the plan and the hold ledgers in data/, never typed.
node tools/emit-work-basis-v1.mjs --plan build/build-plan-v1.json
# The licence-posture projection the pages read names, permissions and
# obligations from — one projection of tools/declarations-v1.json, never
# re-derived from a posture key's letters.
node tools/emit-license-postures-v1.mjs

# Every work's C0 range, derived from the atlas so none is ever typed, and
# the fleet plan that says what stands between each work and being built.
node tools/emit-derived-work-ranges-v1.mjs
node tools/plan-fleet-v1.mjs

if [ "${1:-}" = "--plan" ]; then
  STAMP="${2:-STAMP}"
  echo
  echo "── what would run, and from which basis ────────────────────────────────"
  while IFS=$'\t' read -r kind f1 f2 f3 f4 f5 f6 f7 f8 f9 f10 f11 f12; do
    case "$kind" in
      W) echo "  serve $f3 $f6-$f7 · build-zone --work $f1 --title \"$f4\"$( [ "$f5" != "-" ] && printf ' --title-he <ledger>' )$( [ "$f8" != "-" ] && printf ' --y <%s>' "$f8" ) → data/zones/$f3.bin   [$f2]" ;;
      H) echo "  WITHHELD $f2 ($f3) · held since $f4 — $f5" ;;
      A) echo "  commentary: $f2 attached onto $f1 by $f3" ;;
      P) echo "  pack sidecar for $f1: $f2" ;;
    esac
  done < "$PLAN"
  exit 0
fi

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

# A clean checkout already carries each admitted successor at its published
# path. Stage those exact pinned bytes before the ordinary zone build can
# replace them; after construction they are reinstalled generically from the
# binding. The stage is deleted by a successful install.
node tools/install-pinned-zone-successors-v1.mjs --mode stage \
  --bindings data/front-door-three-count-bindings-v1.json \
  --zones data/zones --stage build/pinned-zone-successors-v1

# The plan's rows, held for the stages that join works to each other.
#
# A W row means serve it. A work this lane is holding gets an H row instead,
# and never reaches a stage that could publish it — the state is declared in
# data/work-records-v1.js and derived by plan-build-v1, not worked out here
# from which files happen to exist. This script once had no idea a work could
# be held: five works were named, three had been withdrawn from the site, and
# a single run of this file would have put all five back.
declare -A PUB TITLE TITLE_HE YFIX BYLINE LABELS LINKS FAMILY RANGE
WORKS=()
HELD=()
while IFS=$'\t' read -r kind h1 h2 h3 h4 h5; do
  [ "$kind" = "H" ] || continue
  HELD+=("$h1")
  echo "  withheld · $h1 ($h2) since $h4"
done < "$PLAN"
while IFS=$'\t' read -r kind f1 f2 f3 f4 f5 f6 f7 f8 f9 f10 f11 f12; do
  [ "$kind" = "W" ] || continue
  WORKS+=("$f1")
  PUB[$f1]="$f3"; TITLE[$f1]="$f4"; TITLE_HE[$f1]="$f5"; RANGE[$f1]="$f6-$f7"
  YFIX[$f1]="$f8"; BYLINE[$f1]="$f9"; LABELS[$f1]="$f10"; LINKS[$f1]="$f11"; FAMILY[$f1]="$f12"
done < "$PLAN"

echo "── 1 · serve each work id-by-id from the sealed artifacts ──────────────"
for W in "${WORKS[@]}"; do
  [ -f "$SERVES/${PUB[$W]}.ndjson" ] || node tools/mishkan-serve-v1.mjs "${RANGE[$W]}" \
    --workspace "$MIRROR" --oracle 24 --out "$SERVES/${PUB[$W]}.ndjson"
done

echo "── 2 · the route store, from the sealed definition packages ────────────"
# (the two packages are named in the environment by whoever holds them; a
# checkout that carries the store does not need them)
[ -f data/route-store/index.json ] || node tools/build-route-store.mjs \
  "${DEFPOC_RDM:?the sealed RDM definition package}" "${DEFPOC_BREADTH:?the sealed breadth package}" --out data/route-store
# and the pin over what it built: every store file by exact bytes and sha256
node tools/emit-store-manifest-v1.mjs

echo "── 3 · titles, read out of the Y ledger where one is promoted ──────────"
for W in "${WORKS[@]}"; do
  [ "${YFIX[$W]}" = "-" ] || node tools/extract-y-nodes.mjs \
    --fixture "${YFIX[$W]}" --work "$W" --out "build/y-${PUB[$W]}.json"
done

echo "── 4 · zones ───────────────────────────────────────────────────────────"
# Every zone is built with the component layer when the template is supplied.
# Genesis once shipped without it — the decision was deferred in a comment
# nobody read, and the book the front door opens first offered whole forms
# only. A sealed layer can only be withheld, never added, and withholding is
# the act that needs justifying.
for W in "${WORKS[@]}"; do
  EXTRA=()
  [ "${TITLE_HE[$W]}" = "-" ] || EXTRA+=(--title-he "${TITLE_HE[$W]}")
  [ "${YFIX[$W]}" = "-" ] || EXTRA+=(--y "build/y-${PUB[$W]}.json")
  [ "${LINKS[$W]}" = "-" ] || EXTRA+=(--license-links "${LINKS[$W]}")
  node tools/build-zone.mjs \
    --serve "$SERVES/${PUB[$W]}.ndjson" --bridge "$BRIDGE" --store data/route-store \
    --work "$W" --title "${TITLE[$W]}" \
    --byline "${BYLINE[$W]}" \
    --coord-labels "${LABELS[$W]}" --stamp "$STAMP" \
    ${EXTRA[@]+"${EXTRA[@]}"} \
    ${SPAN_ARG[@]+"${SPAN_ARG[@]}"} --out "data/zones/${PUB[$W]}.bin"
done

node tools/install-pinned-zone-successors-v1.mjs --mode install \
  --bindings data/front-door-three-count-bindings-v1.json \
  --zones data/zones --stage build/pinned-zone-successors-v1

echo "── 5 · commentary, served from the same chain as the text ──────────────"
# Coordinate identity is symmetric, so the plan emits each pair both ways and
# neither work is demoted to being only the other's apparatus.
while IFS=$'\t' read -r kind BASE COMM BY; do
  [ "$kind" = "A" ] || continue
  node tools/build-commentary-zone.mjs \
    --base-serve "$SERVES/${PUB[$BASE]}.ndjson" --base-work "$BASE" \
    --serve "$SERVES/${PUB[$COMM]}.ndjson" --work "$COMM" \
    --title "${TITLE[$COMM]}" --family "${FAMILY[$COMM]}" --published-as "${PUB[$COMM]}" \
    --bridge "$BRIDGE" --store data/route-store --stamp "$STAMP" \
    ${SPAN_ARG[@]+"${SPAN_ARG[@]}"} --out "data/zones/${PUB[$BASE]}.commentary.bin"
done < "$PLAN"

# A pack fetched from outside the corpus has no C0 identity, so it attaches by
# its own map instead of by coordinate. Both steps are re-runnable and both
# refuse rather than guess, which is the only thing that makes an outside pack
# safe to publish.
echo "── 5b · pack commentary, from each pack and its attachment map ─────────"
while IFS=$'\t' read -r kind WID PACK CARRIED; do
  [ "$kind" = "P" ] || continue
  # The map's name is derived from the work it attaches to, and the day it was
  # made rides inside it. This line used to write data/v5-attachment-map-$STAMP.js,
  # so every build left a new tracked file and no build retired one — four
  # generations accumulated, and the tool that read a map named one of them by
  # hand, which is how the newest ended up being the one nothing used.
  node tools/generate-attachment-map-v2.mjs \
    --pack "$PACK" --carried "$CARRIED" \
    --zone "data/zones/${PUB[$WID]}.bin" --stamp "$STAMP"
  node tools/build-commentary-sidecar-v1.mjs \
    --pack "$PACK" --zone "data/zones/${PUB[$WID]}.bin" --store data/route-store
done < "$PLAN"

echo "── 6 · assemble the site ───────────────────────────────────────────────"
# The published set is exactly what this build produced, and nothing else.
#
# This copy used to be additive, so every zone ever deployed stayed deployed.
# Four of them were still being served months later — none built by this
# script, none on the front door, none touched by a check, and all of them
# reachable by typing ?b= into the reader. A deploy that only ever adds cannot
# un-say a thing it once said.
# And "exactly" is enforced rather than hoped: only the zones the plan names
# are copied, so scratch in the work directory — the in-line commentary
# check's fixture lives there — can never ship by sitting near the real ones.
mkdir -p "site/$ENGINE/data/zones"
rm -f "site/$ENGINE/data/zones"/*.bin
for W in "${WORKS[@]}"; do
  cp "data/zones/${PUB[$W]}.bin" "site/$ENGINE/data/zones/"
  [ -f "data/zones/${PUB[$W]}.commentary.bin" ] \
    && cp "data/zones/${PUB[$W]}.commentary.bin" "site/$ENGINE/data/zones/"
done
rm -rf "site/$ENGINE/data/route-store" && cp -r data/route-store "site/$ENGINE/data/route-store"

echo "── 7 · the front door, from the zones ──────────────────────────────────"
# The door used to be typed, which is why it did not mention the commentary:
# nothing was going to notice that it should. It is now read out of the zones,
# so a book or a commentary that exists is a book or a commentary that is
# offered.
# The count binding also pins any admitted zone successor. If an earlier build
# step recreates different bytes, the door refuses here; a successor cannot be
# silently reverted or replaced without an explicit binding update.
node tools/build-front-door-v1.mjs --zones data/zones --out deploy-root \
  --atlas data/corpus-atlas-v1.json \
  --physical-handoff data/bezelal-front-door-counts-handoff-v1.json \
  --count-bindings data/front-door-three-count-bindings-v1.json
cp deploy-root/index.html site/index.html
cp deploy-root/README.md site/README.md
cp deploy-root/front-door-counts-receipt-v1.json site/front-door-counts-receipt-v1.json
for W in "${WORKS[@]}"; do
  book="${PUB[$W]}"
  [ -f "deploy-root/$book/index.html" ] && mkdir -p "site/$book" \
    && cp "deploy-root/$book/index.html" "site/$book/index.html"
done

echo "── 7b · the reader ─────────────────────────────────────────────────────"
# zone.html is the one published file with no generator behind it: it is
# written by hand and copied here. That is recorded rather than hidden — the
# manifest prints it as having no build step every time anyone runs the checks.
cp zone.html "site/$ENGINE/zone.html"

echo "── 8 · verify by rendering, not by reading ─────────────────────────────"
# Every published work, not a chosen two: a work the verifier skips is a work
# whose breakage nobody hears about.
for W in "${WORKS[@]}"; do
  node tools/verify-zone.mjs --root site --book "${PUB[$W]}"
done

echo "── 9 · what the pipeline can prove about itself ────────────────────────"
node tools/pipeline-manifest-v1.mjs --stamp "$STAMP"

# And what the OTHER lane can find out without asking. This is last on purpose:
# it summarizes the store, the shelf and the sidecars as they finally stand, so
# it has to run after everything that could move them. It is in the build
# rather than run by hand because a state file somebody remembers to regenerate
# is a state file that is wrong exactly when it matters — the day a build
# changed something and nobody re-ran it.
node tools/emit-lane-state-v1.mjs

echo "done · $(du -sh site | cut -f1) in site/"
