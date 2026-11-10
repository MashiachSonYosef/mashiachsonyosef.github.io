#!/usr/bin/env bash
# Synthesis lane · the round: the served shelf, projected again over the records as they stand
#
# WHAT THIS IS. The zones the door serves are built once, from the corpus
# lane's sealed text, by the route builders (serve-from-restore-v5 for the
# thirty-nine books, serve-edition-v1 for an edition work); that build needs
# the corpus lane's own files and is not run on a checkout. Everything a zone
# says ABOUT its words (the reading on the line, the witnessed columns, the
# lattice's grades, the count beside its witnesses) is a projection of records
# this repository holds, and when a record moves the projection is made again.
# That is a round. From 6 October to 10 November 2026 it was run from scripts
# kept outside the repository, which meant the site could be re-made only on
# the machine that held them, and nothing in the tree said how the published
# bytes had been produced. This file is those scripts.
#
# WHAT IT WRITES. Every zone it touches is typed for it: each step that
# writes a zone after its build records itself on the zone (emitted_from.
# post_build, under single-pass-exemption-v1), so the bytes say who wrote
# them. Run twice on the same inputs with the same stamp, the outputs are the
# same bytes.
#
# WHAT IT NEEDS FROM OUTSIDE THE TREE, and only these: the corpus lane's
# lattice (one file per book) and its two binyan files, which are too large
# to keep beside the door. They are named on the command line and never
# guessed; a round with no lattice re-projects nothing and says so.
#
# WHAT IT DOES NOT RUN: the tools that change the store itself (the ledgers'
# divisions, the sources' years, a strike, a landing). Each of those writes a
# receipt of what it did to the rows, and run again over a store that already
# carries its work it writes a receipt of having done nothing over the one
# that says what was done (measured 10 November 2026: "rows whose slot moved"
# 13 became 0, and the day of the application became the day of the re-run).
# They are run once, when their own input arrives, and the round follows.
#
#   usage:  tools/round-v1.sh --stamp YYYY-MM-DD
#             [--lattice <folder holding lattice-<book>-v12.json and its positions and routes>]
#             [--stems <folder holding place-stems-v2.jsonl and row-stems-v2.jsonl>]
#             [--steps zones,stamps,chain,records,door]   (default: all, in that order)
#
# A step that fails stops the round. Nothing is copied over the site's root
# until the door has been built whole.
set -euo pipefail
cd "$(dirname "$0")/.."

STAMP=""; LATTICE=""; STEMS=""; STEPS="zones,stamps,chain,records,door"
while [ $# -gt 0 ]; do
  case "$1" in
    --stamp) STAMP="${2:?--stamp needs a date}"; shift 2 ;;
    --lattice) LATTICE="${2:?--lattice needs a folder}"; shift 2 ;;
    --stems) STEMS="${2:?--stems needs a folder}"; shift 2 ;;
    --steps) STEPS="${2:?--steps needs a list}"; shift 2 ;;
    *) echo "round-v1: unknown argument $1" >&2; exit 2 ;;
  esac
done
case "$STAMP" in ????-??-??) ;; *) echo "round-v1: --stamp YYYY-MM-DD is required" >&2; exit 2 ;; esac
has() { case ",$STEPS," in *",$1,"*) return 0 ;; *) return 1 ;; esac; }
WORK=build/round-v1
mkdir -p "$WORK"
served() { node --input-type=module -e 'import { zonesServed } from "./tools/zones-on-disk-v1.mjs"; console.log(zonesServed().join("\n"));'; }

if has zones; then
  echo "── zones · the witnessed columns baked, the line read again ────────────"
  rm -rf "$WORK/zones" && mkdir -p "$WORK/zones"
  for b in $(served); do
    # exit 3: the corpus lane shipped no witnessed order for this work, and
    # the zone goes on as it is
    code=0
    node tools/bake-witnessed-order-v1.mjs --zone "data/zones/$b.bin" --stamp "$STAMP" --out "$WORK/zones/$b.baked.bin" > "$WORK/zones/$b.bake.log" 2>&1 || code=$?
    if [ "$code" = "3" ]; then cp "data/zones/$b.bin" "$WORK/zones/$b.baked.bin"
    elif [ "$code" != "0" ]; then echo "round-v1: bake-witnessed-order failed on $b (exit $code)" >&2; tail -5 "$WORK/zones/$b.bake.log" >&2; exit 1; fi
    node tools/regloss-zone.mjs --zone "$WORK/zones/$b.baked.bin" --out "$WORK/zones/$b.bin" --stamp "$STAMP" > "$WORK/zones/$b.regloss.log" 2>&1 \
      || { echo "round-v1: regloss failed on $b" >&2; tail -5 "$WORK/zones/$b.regloss.log" >&2; exit 1; }
  done
  for b in $(served); do cp "$WORK/zones/$b.bin" "data/zones/$b.bin"; done

  echo "── zones · the commentary beside each book, its line read again ────────"
  rm -rf "$WORK/commentary" && mkdir -p "$WORK/commentary"
  for f in data/zones/*.commentary.bin; do
    [ -f "$f" ] || continue
    n="$(basename "$f")"
    case "$n" in fixture-*) continue ;; esac
    node tools/regloss-zone.mjs --zone "$f" --out "$WORK/commentary/$n" --stamp "$STAMP" > "$WORK/commentary/$n.log" 2>&1 \
      || { echo "round-v1: regloss failed on $n" >&2; tail -5 "$WORK/commentary/$n.log" >&2; exit 1; }
  done
  for f in "$WORK"/commentary/*.bin; do [ -f "$f" ] && cp "$f" "data/zones/$(basename "$f")"; done

  if [ -n "$LATTICE" ]; then
    echo "── zones · the lattice projected over each book it grades ──────────────"
    [ -n "$STEMS" ] || { echo "round-v1: --lattice needs --stems (the binyan files the projection reads)" >&2; exit 2; }
    rm -rf "$WORK/lattice" && mkdir -p "$WORK/lattice"
    for b in $(served); do
      [ -f "$LATTICE/lattice-$b-v12.json" ] || continue
      node tools/project-lattice-v12-v1.mjs --zone "data/zones/$b.bin" --lattice "$LATTICE" --stamp "$STAMP" \
        --out "$WORK/lattice/$b.bin" --sidecar "$WORK/lattice/$b.lattice.bin" \
        --place-stems "$STEMS/place-stems-v2.jsonl" --row-stems "$STEMS/row-stems-v2.jsonl" > "$WORK/lattice/$b.log" 2>&1 \
        || { echo "round-v1: the lattice projection failed on $b" >&2; tail -5 "$WORK/lattice/$b.log" >&2; exit 1; }
    done
    for f in "$WORK"/lattice/*.bin; do [ -f "$f" ] && cp "$f" "data/zones/$(basename "$f")"; done
  else
    echo "   no --lattice given: the lattice sidecars stand as they are, and so does every order they carry"
  fi
fi

if has stamps; then
  echo "── stamps · each book's count, set beside the witness record as it stands ──"
  for b in $(served); do node tools/restamp-zone-v1.mjs --zone "data/zones/$b.bin" --stamp "$STAMP" | grep -v "left as it is" || true; done
fi

if has chain; then
  echo "── chain · the chain books, from the zones they print ──────────────────"
  # which books have a chain book is the chain's own folder, never a list here
  for d in ../chain/*/; do
    b="$(basename "$d")"
    [ -f "data/zones/$b.bin" ] || continue
    node tools/build-chain-book-v1.mjs --zone "data/zones/$b.bin" --out "../chain/$b" > /dev/null
  done
  node tools/bake-search-index-v1.mjs > /dev/null
  node tools/build-chain-book-v1.mjs --index --dir ../chain > /dev/null
fi

if has records; then
  echo "── records · what the shelf is, judged and sealed ──────────────────────"
  node tools/emit-pointing-grade-recount-v1.mjs > /dev/null
  # The gate and the count each write their receipt and then judge it. The
  # receipt is what the next steps read; a law that fails here is printed and
  # the round goes on to the door only if the receipt was written, so the
  # checks that follow the round meet the fault where it is and not a door
  # built over half a shelf.
  node tools/check-c0-refusals-v1.mjs --write > "$WORK/gate.log" 2>&1 || true
  grep -E "^FAIL|PASS ·|receipt written" "$WORK/gate.log" || true
  grep -q "receipt written" "$WORK/gate.log" || { echo "round-v1: the gate wrote no receipt" >&2; tail -8 "$WORK/gate.log" >&2; exit 1; }
  node tools/check-bookword-count-v1.mjs --write > "$WORK/count.log" 2>&1 || true
  grep -E "^FAIL|receipt written|stamps:" "$WORK/count.log" || true
  grep -q "receipt written" "$WORK/count.log" || { echo "round-v1: the count wrote no receipt" >&2; tail -8 "$WORK/count.log" >&2; exit 1; }
  node tools/emit-zone-store-v1.mjs
  node tools/emit-store-manifest-v1.mjs > /dev/null
  node tools/bake-overlay-book-counts-v1.mjs | tail -1
fi

if has door; then
  echo "── door · the front door and every book's own pages ────────────────────"
  node tools/build-front-door-v1.mjs > "$WORK/door.log" 2>&1 || { echo "round-v1: the door did not build" >&2; tail -8 "$WORK/door.log" >&2; exit 1; }
  node tools/emit-lane-state-v1.mjs --stamp "$STAMP" > /dev/null
  node tools/emit-ledger-index-v1.mjs --stamp "$STAMP" > /dev/null
  node tools/pipeline-manifest-v1.mjs --stamp "$STAMP" > /dev/null
  cp -a deploy-root/. ..
fi
echo "round-v1: done ($STEPS) · stamp $STAMP"
