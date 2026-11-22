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
# THE ZONES STEP ENDS WITH THE READ WORDS. The lattice projection clears, as
# it runs, every tag on a word and on a half of a place written one way and
# read another. So the corpus lane's list of the read words of a read form
# of several words (data/read-words/, relay v192) is laid after it, on every
# round: tools/apply-read-words-v1.mjs gives each such read word its own tag
# and, where the lattice gave the place no pieces, the place its pieces. It
# reads only this tree, and over zones that carry its work it writes nothing.
#
# THE ZONES STEP BEGINS WITH THE SPELLING BRIDGE (data/spelling-bridge/, relays
# v202 and v214): tools/apply-spelling-bridge-v1.mjs gives a place our text
# spells otherwise than the Leningrad text, where the corpus lane's list cuts
# STEP's pieces onto our letters, STEP's own words for the place, as STEP
# writes them, as its pieces (since 22 November 2026, ship 17, at the other
# places of new pieces too, from bridge v1.1). It runs first because the line read
# again reads a name's lead off a place's pieces (tools/proper-name-v1.mjs)
# and the lattice projection reads them too. It reads only this tree, and
# over zones that carry its work it writes nothing.
#
# WHAT IT NEEDS FROM OUTSIDE THE TREE, and only these: the corpus lane's
# lattice (one file per book), the lists of its delta over that lattice
# (pinned in data/lattice-delta/PIN.json, each by its size and sha256: the
# projection reads a listed entry's names and grades from them, and is never
# run without them once the tree pins them), its two binyan files and their
# extension to
# three more dictionaries (pinned in data/stems-extension/ by its size and
# sha256), and its ledger of each source's own picks at every word place (the
# default sources' pills; pinned in data/default-picks/PIN.json; with it,
# where the tree pins it, the list of the words each pick's line reads,
# data/default-picks/spans-v1/PIN.json, in the same folder as spans-v1/), which are
# too large to keep beside the door. They are named on the command line and
# never guessed; a round with no lattice re-projects nothing and says so, and
# one with no ledger of picks bakes none and says so. And, for
# the lines step, a browser this machine can open (tools/playwright-v1.mjs):
# the plain list under every chapter is a recording of the lines the reader
# itself draws, read off the page (tools/bake-resting-lines-v1.mjs), and the
# door refuses a recording that is not of the page and the files it builds
# from. A round that cannot read the lines stops there, before the door.
# The chain step needs the same browser: a chained book's links are what
# each word's card prints, read off the page with every word pressed
# (tools/build-chain-book-v2.mjs), so it runs where the page is whole,
# after the records and the lines.
#
# WHAT IT DOES NOT RUN: the tools that change the store itself (the ledgers'
# divisions, the sources' years, the made spaces' closes, a strike, a
# landing, and the derivation of the list a landing lands from the corpus
# lane's list and the store it meets). Each of those writes a
# receipt of what it did to the rows, and run again over a store that already
# carries its work it writes a receipt of having done nothing over the one
# that says what was done (measured 10 November 2026: "rows whose slot moved"
# 13 became 0, and the day of the application became the day of the re-run).
# They are run once, when their own input arrives, and the round follows.
# A strike or a landing, the ledgers' divisions and the made spaces' closes
# may each be given the moment they are recorded under (--on,
# tools/step-moment-v1.mjs), so a step rehearsed on one tree can be held,
# file by file, to the same step run on the tree that ships.
# The facts a list of the corpus lane lays on the rows are of the same kind
# and are not run here either (the row entries, the name rows and the sense
# openings, each laid by a tool of its own): each is run once after a store
# change, takes --on as well, and reads its list through the row-strikes
# follower (the module row-strikes-follow-v1), which follows each row the
# list names through the row-strikes record to where it stands on this
# store. The default picks' bake below reads its rows tables through the
# same module. None of them is named here by its path: the pipeline's
# manifest counts a path in this file as a tool the round runs.
#
#   usage:  tools/round-v1.sh --stamp YYYY-MM-DD
#             [--lattice <folder holding lattice-<book>-v12.json and its positions and routes>]
#             [--lattice-delta <folder holding the lists data/lattice-delta/PIN.json names>]
#             [--stems <folder holding place-stems-v2.jsonl and row-stems-v2.jsonl>]
#             [--stems-extension <the corpus lane's row-stems-extension-v1.jsonl>]
#             [--default-picks <folder holding default-picks-v1/, default-picks-v1.1/ and default-picks-v1.2/, and spans-v1/ where the tree pins the spans>]
#             [--steps zones,stamps,search,defaults,records,lines,chain,door]   (default: all, in that order)
#
# A step that fails stops the round. Nothing is copied over the site's root
# until the door has been built whole.
set -euo pipefail
cd "$(dirname "$0")/.."

STAMP=""; LATTICE=""; LATTICE_DELTA=""; STEMS=""; EXTENSION=""; DEFAULT_PICKS=""; STEPS="zones,stamps,search,defaults,records,lines,chain,door"
while [ $# -gt 0 ]; do
  case "$1" in
    --stamp) STAMP="${2:?--stamp needs a date}"; shift 2 ;;
    --lattice) LATTICE="${2:?--lattice needs a folder}"; shift 2 ;;
    --lattice-delta) LATTICE_DELTA="${2:?--lattice-delta needs a folder}"; shift 2 ;;
    --stems) STEMS="${2:?--stems needs a folder}"; shift 2 ;;
    --stems-extension) EXTENSION="${2:?--stems-extension needs a file}"; shift 2 ;;
    --default-picks) DEFAULT_PICKS="${2:?--default-picks needs a folder}"; shift 2 ;;
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
  echo "── zones · where our text spells a word otherwise, STEP's own words for the place ─"
  # first: the line read again reads a name's lead off the place's pieces, and
  # so does the lattice projection. A zone that carries the list's pieces is
  # counted and left as it is
  node tools/apply-spelling-bridge-v1.mjs --stamp "$STAMP" > "$WORK/spelling-bridge.log" 2>&1 \
    || { echo "round-v1: the spelling bridge's pieces were not laid" >&2; grep -E "^FAIL" "$WORK/spelling-bridge.log" >&2 || true; tail -2 "$WORK/spelling-bridge.log" >&2; exit 1; }
  grep -E "^  pieces:" "$WORK/spelling-bridge.log" | sed 's/^  /   /' || true

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
    [ -n "$EXTENSION" ] || { echo "round-v1: --lattice needs --stems-extension (the file data/stems-extension/PIN.json names; the projection reads it beside the binyan files)" >&2; exit 2; }
    # the delta over the lattice: due where the tree pins it, and never handed to a tree that pins none (the projection refuses either way; said here first)
    DELTA_ARGS=()
    if [ -f data/lattice-delta/PIN.json ]; then
      [ -n "$LATTICE_DELTA" ] || { echo "round-v1: this tree pins the lattice delta (data/lattice-delta/PIN.json), so --lattice needs --lattice-delta (the folder holding its lists)" >&2; exit 2; }
      DELTA_ARGS=(--delta "$LATTICE_DELTA")
    elif [ -n "$LATTICE_DELTA" ]; then echo "round-v1: --lattice-delta names a folder, and this tree pins no lattice delta" >&2; exit 2; fi
    rm -rf "$WORK/lattice" && mkdir -p "$WORK/lattice"
    for b in $(served); do
      [ -f "$LATTICE/lattice-$b-v12.json" ] || continue
      node tools/project-lattice-v12-v1.mjs --zone "data/zones/$b.bin" --lattice "$LATTICE" --stamp "$STAMP" \
        --out "$WORK/lattice/$b.bin" --sidecar "$WORK/lattice/$b.lattice.bin" \
        --place-stems "$STEMS/place-stems-v2.jsonl" --row-stems "$STEMS/row-stems-v2.jsonl" --row-stems-extension "$EXTENSION" "${DELTA_ARGS[@]}" > "$WORK/lattice/$b.log" 2>&1 \
        || { echo "round-v1: the lattice projection failed on $b" >&2; tail -5 "$WORK/lattice/$b.log" >&2; exit 1; }
    done
    for f in "$WORK"/lattice/*.bin; do [ -f "$f" ] && cp "$f" "data/zones/$(basename "$f")"; done
  else
    echo "   no --lattice given: the lattice sidecars stand as they are, and so does every order they carry"
  fi

  echo "── zones · each read word of a read form of several words, its own entry ─"
  # after the lattice, whether or not it was projected: a zone that carries
  # the list's tags and pieces is counted and left as it is
  node tools/apply-read-words-v1.mjs --stamp "$STAMP" > "$WORK/read-words.log" 2>&1 \
    || { echo "round-v1: the read words were not laid" >&2; grep -E "^FAIL" "$WORK/read-words.log" >&2 || true; tail -2 "$WORK/read-words.log" >&2; exit 1; }
  grep -E "^  (tags|pieces):" "$WORK/read-words.log" | sed 's/^  /   /' || true
fi

if has stamps; then
  echo "── stamps · each book's count, set beside the witness record as it stands ──"
  for b in $(served); do node tools/restamp-zone-v1.mjs --zone "data/zones/$b.bin" --stamp "$STAMP" | grep -v "left as it is" || true; done
fi

if has search; then
  echo "── search · the index the search box reads, from the zones as they stand ─"
  # Jastrow's word senses first: the record the page holds them back by, which
  # the search index reads so that it takes no word sense as a reading
  node tools/bake-word-senses-v2.mjs | tail -1
  node tools/bake-search-index-v1.mjs > /dev/null
fi

if has defaults; then
  echo "── defaults · each source's own picks laid on the zones, and counted ────"
  # After the zones (the picks are laid on their words, a pair word and a
  # place's pieces read off them) and before the records and the lines: the
  # gate opens pages, which read the index at boot, and each record the
  # lines step writes names the index among the files its page read
  # (read_off.files; bake-resting-lines-v1 refuses a reading whose page did
  # not read it, defaultsNotAtRest), so a record is read again when the
  # index moves. No manifest names these files (emit-store-manifest-v1 pins
  # data/route-store alone): the index names each book file by its bytes
  # and sha256, and the receipt names the index. The bake reads the records
  # of the resting lines as they stand, for where STEP's line as it rests is
  # bare, where STEP's own words print and for the lines over more than one
  # word; those records were read off the zones before this round's zones
  # step, so the lines step reads them again after it, and bakes again with
  # --receipt-only: the receipt that ships is of the records it read (one
  # rule, the bake's, run twice), and that pass refuses where the records
  # read anew would move the index (bake the defaults again).
  # The corpus lane's ledger is named on the command line and never guessed.
  if [ -n "$DEFAULT_PICKS" ]; then
    node tools/bake-default-picks-v1.mjs --ledger "$DEFAULT_PICKS" > "$WORK/defaults.log" 2>&1 || { echo "round-v1: the default picks were not baked" >&2; grep -E "^REFUSED" "$WORK/defaults.log" >&2 || true; tail -3 "$WORK/defaults.log" >&2; exit 1; }
    tail -1 "$WORK/defaults.log"
  else
    echo "   no --default-picks given: data/default-picks stands as it is"
  fi
  # the check's node laws: the rule, the index's counts against the book
  # files and the zones as they now stand, the source words, and with the
  # ledger the bake against it; its page laws run with the suite
  # (exit 3: no picks are baked on this tree, which is said and not a fault)
  code=0
  node tools/check-default-picks-v1.mjs --node ${DEFAULT_PICKS:+--ledger "$DEFAULT_PICKS"} > "$WORK/defaults-check.log" 2>&1 || code=$?
  if [ "$code" = "3" ]; then sed -n 's/^SKIPPED/   skipped/p' "$WORK/defaults-check.log"
  elif [ "$code" != "0" ]; then echo "round-v1: the default picks do not hold" >&2; grep -E "^FAIL" "$WORK/defaults-check.log" >&2 || true; tail -2 "$WORK/defaults-check.log" >&2; exit 1
  else echo "   $(grep -cE '^  ok  ' "$WORK/defaults-check.log") node laws held (tools/check-default-picks-v1.mjs --node)"; fi
  # the words each source's line reads (default-spans-rule-v1): the pin, and every book's spans, recounted from
  # the list where the ledger is given; its page laws run with the suite (exit 3: the tree pins no spans)
  code=0
  node tools/check-default-spans-v1.mjs --node ${DEFAULT_PICKS:+--ledger "$DEFAULT_PICKS"} > "$WORK/defaults-spans-check.log" 2>&1 || code=$?
  if [ "$code" = "3" ]; then sed -n 's/^SKIPPED/   skipped/p' "$WORK/defaults-spans-check.log"
  elif [ "$code" != "0" ]; then echo "round-v1: the default picks' spans do not hold" >&2; grep -E "^FAIL" "$WORK/defaults-spans-check.log" >&2 || true; tail -2 "$WORK/defaults-spans-check.log" >&2; exit 1
  else echo "   $(grep -cE '^  ok  ' "$WORK/defaults-spans-check.log") node laws held (tools/check-default-spans-v1.mjs --node)"; fi
fi

if has records; then
  echo "── records · what the shelf is, judged and sealed ──────────────────────"
  node tools/emit-pointing-grade-recount-v1.mjs --stamp "$STAMP" > /dev/null
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

if has lines; then
  echo "── lines · what the reader draws as each work opens, read off the page ─"
  # a record still of this tree is kept as it is; a work whose page or files
  # have moved is read again. The door, next, refuses any that is not.
  node tools/bake-resting-lines-v1.mjs > "$WORK/lines.log" 2>&1 || { echo "round-v1: the resting lines were not read" >&2; grep -E "^FAIL" "$WORK/lines.log" >&2 || true; tail -3 "$WORK/lines.log" >&2; exit 1; }
  tail -1 "$WORK/lines.log"
  # every resting line set beside the line HEAD's record holds over the same word (the completeness critic of 15
  # November 2026: the all-lines comparison a step of the round, now that ships move resting lines on purpose): each
  # line that moved, with the counts by work and by credit before and after, in a report the lead names each ship's
  # owed classes from. A report, not a law: it stops the round only where it cannot read a record
  node tools/compare-resting-lines-v1.mjs --before HEAD --out "$WORK/resting-lines-compare.json" || { echo "round-v1: the resting lines could not be compared with HEAD's records" >&2; exit 1; }
  # the default picks' receipt, of the records just read: the bake again,
  # writing the receipt alone, then the check's node laws over it
  if [ -n "$DEFAULT_PICKS" ] && [ -f data/default-picks/index.json ]; then
    node tools/bake-default-picks-v1.mjs --ledger "$DEFAULT_PICKS" --receipt-only > "$WORK/defaults-receipt.log" 2>&1 || { echo "round-v1: the default picks' receipt was not written" >&2; grep -E "^REFUSED" "$WORK/defaults-receipt.log" >&2 || true; tail -3 "$WORK/defaults-receipt.log" >&2; exit 1; }
    tail -1 "$WORK/defaults-receipt.log"
    node tools/check-default-picks-v1.mjs --node --ledger "$DEFAULT_PICKS" > "$WORK/defaults-receipt-check.log" 2>&1 || { echo "round-v1: the default picks do not hold over the records just read" >&2; grep -E "^FAIL" "$WORK/defaults-receipt-check.log" >&2 || true; tail -2 "$WORK/defaults-receipt-check.log" >&2; exit 1; }
    echo "   $(grep -cE '^  ok  ' "$WORK/defaults-receipt-check.log") node laws held over the records just read (tools/check-default-picks-v1.mjs --node)"
  fi
fi

if has chain; then
  echo "── chain · the chain books, each word pressed and its card read ────────"
  # which books have a chain book is the chain's own folder, never a list
  # here. A file still of this tree is kept as it is; a book whose page or
  # files have moved is read again, and the index is not written over one
  # that is not of this tree.
  node tools/build-chain-book-v2.mjs > "$WORK/chain.log" 2>&1 || { echo "round-v1: the chain was not read" >&2; grep -E "^FAIL" "$WORK/chain.log" >&2 || true; tail -3 "$WORK/chain.log" >&2; exit 1; }
  tail -2 "$WORK/chain.log" | head -1
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
