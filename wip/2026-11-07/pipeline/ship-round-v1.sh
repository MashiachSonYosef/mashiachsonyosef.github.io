#!/bin/bash
# Synthesis lane · one ship, as it was run by hand on 6 and 7 November 2026 (the macro review's first debt):
# the store moved by its lists, then the bake and the regloss, the sidecars, the finish, the commentary zones,
# the 48 checks in two chains, the gate against the live build, the ship (main, then gh-pages follows main).
#
# Usage, from reader/:  tools/ship-round-v1.sh <round dir> <stamp YYYY-MM-DD> [phase ...]
#   phases: bake project finish commentary checks gate ship   (default: all but ship)
#   the round dir holds the stage outputs and logs; the live-comparison worktree for the gate is $ROUND/../old
#   (main as deployed), served on 8914, the build on 8912 and its reader on 8899.
# Every step is a repository tool; nothing here is typed by hand. A step that refuses stops the ship.
set -euo pipefail
ROUND=${1:?round dir}; STAMP=${2:?stamp}; shift 2; PHASES=${*:-"bake project finish commentary checks gate"}
R=$(pwd); [ -f tools/zones-on-disk-v1.mjs ] || { echo "run from reader/"; exit 2; }
mkdir -p $ROUND/baked $ROUND/regloss $ROUND/proj/zones $ROUND/proj/sidecars $ROUND/regloss-comm $ROUND/zones-before
has() { case " $PHASES " in *" $1 "*) return 0;; *) return 1;; esac; }
served() { node -e 'const { zonesServed } = await import("./tools/zones-on-disk-v1.mjs"); console.log(zonesServed().join(" "))' --input-type=module; }
LATTICE=${LATTICE:-$ROUND/../lattice-v12}            # the corpus lane's lattice v12, one file per book
STEMS=${STEMS:-$ROUND/../binyan-ledger/build-r2}       # place-stems-v2.jsonl and row-stems-v2.jsonl
CHAIN_BOOKS="amos habakkuk haggai hosea joel jonah malachi micah nahum obadiah zechariah zephaniah"

finish() {  # the chain books, the search index, the pointing recount, the re-pin, the c0 refusals, the serve-gate receipt, the front door, the lane state, the ledger index, the manifest, the deploy root
  for b in $CHAIN_BOOKS; do node tools/build-chain-book-v1.mjs --zone data/zones/$b.bin --out ../chain/$b > /dev/null; done
  node tools/bake-search-index-v1.mjs > /dev/null && node tools/build-chain-book-v1.mjs --index --dir ../chain > /dev/null
  node tools/emit-pointing-grade-recount-v1.mjs > /dev/null
  node tools/repin-zone-store-v1.mjs .
  node tools/check-c0-refusals-v1.mjs --write | grep -E "PASS|REFUSED" | head -2
  node tools/update-serve-gate-receipt-v1.mjs --head HEAD   # TODO: the inline python of finish2.sh (the served set unchanged, every served zone passed, the hashes carried) becomes this tool
  node tools/build-front-door-v1.mjs --history data/none.json > $ROUND/build.log 2>&1
  node tools/emit-lane-state-v1.mjs >> $ROUND/build.log 2>&1
  node tools/emit-ledger-index-v1.mjs >> $ROUND/build.log 2>&1
  node tools/pipeline-manifest-v1.mjs --stamp $STAMP >> $ROUND/build.log 2>&1
  cp -a deploy-root/. ..
  echo FINISH-OK
}

if has bake; then
  [ "$(ls $ROUND/zones-before | wc -l)" = "0" ] && cp data/zones/*.bin $ROUND/zones-before/
  : > $ROUND/regloss/all.log
  for b in $(served); do
    node tools/bake-witnessed-order-v1.mjs --zone data/zones/$b.bin --stamp $STAMP --out $ROUND/baked/$b.bin >> $ROUND/bake.log 2>&1 && code=0 || code=$?
    if [ "$code" = "3" ]; then cp data/zones/$b.bin $ROUND/baked/$b.bin; elif [ "$code" != "0" ]; then echo "$b BAKE-FAILED $code"; exit 1; fi
    node tools/regloss-zone.mjs --zone $ROUND/baked/$b.bin --out $ROUND/regloss/$b.bin --stamp $STAMP > $ROUND/regloss/$b.log 2>&1 || { echo "$b REGLOSS-FAILED"; exit 1; }
    echo "$b 0" >> $ROUND/regloss/all.log
  done
  node tools/compare-zones-v1.mjs $ROUND/zones-before $ROUND/regloss > $ROUND/regloss-compare.txt   # TODO: regloss-compare.py becomes this tool (what moved per column, the base gloss changes listed)
  for f in $ROUND/regloss/*.bin; do cp $f data/zones/$(basename $f); done
  echo BAKE-DONE
fi
if has project; then
  : > $ROUND/proj/all.log
  for f in data/zones/*.bin; do
    b=$(basename $f .bin); case "$b" in *.*) continue;; esac
    [ -f $LATTICE/lattice-$b-v12.json ] || continue
    node tools/project-lattice-v12-v1.mjs --zone $f --lattice $LATTICE --stamp $STAMP --out $ROUND/proj/zones/$b.bin --sidecar $ROUND/proj/sidecars/$b.lattice.bin --place-stems $STEMS/place-stems-v2.jsonl --row-stems $STEMS/row-stems-v2.jsonl > $ROUND/proj/$b.log 2>&1 || { echo "$b PROJECT-FAILED"; exit 1; }
    echo "$b 0" >> $ROUND/proj/all.log
  done
  for f in $ROUND/proj/zones/*.bin $ROUND/proj/sidecars/*.bin; do cp $f data/zones/$(basename $f); done
  echo PROJECT-DONE
fi
if has finish; then finish; fi
if has commentary; then
  for f in data/zones/*.commentary.bin; do
    b=$(basename $f .bin)
    node tools/regloss-zone.mjs --zone $f --out $ROUND/regloss-comm/$b.bin --stamp $STAMP > $ROUND/regloss-comm/$b.log 2>&1 || { echo "$b REGLOSS-FAILED"; exit 1; }
  done
  for f in $ROUND/regloss-comm/*.bin; do cp $f data/zones/$(basename $f); done
  finish
  echo COMMENTARY-DONE
fi
if has checks; then
  # the 48 checks of the round chains (tools/round-checks-v1.txt lists them: chain A the store and the page, chain B the rest); every red stops the ship
  # but the two the environment makes (check-zone-store's pins of the unserved shelf, check-frame-coverage V), which say so themselves
  bad=0
  while read -r c; do
    [ -z "$c" ] && continue
    timeout 1500 node tools/$c.mjs > $ROUND/out-$c.txt 2>&1 && code=0 || code=$?
    echo "$c $code"; [ "$code" = "0" ] || grep -E "FAIL|SKIPPED|PAGE ERROR" $ROUND/out-$c.txt | head -4 | sed 's/^/    /'
    [ "$code" = "0" ] || bad=$((bad+1))
  done < tools/round-checks-v1.txt
  echo "CHECKS-DONE red $bad"
fi
if has gate; then
  node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $ROUND/gate-diff.txt > $ROUND/gate.log 2>&1 && echo "gate green" || echo "gate: differences, see $ROUND/gate-diff.txt"
  node tools/gate-account-v1.mjs $ROUND/gate-diff.txt   # TODO: gate-account2.py becomes this tool (a difference is explained by a print, a join, the bake's own move, a landed text; else flagged)
  echo GATE-DONE
fi
if has ship; then
  git fetch -q origin main gh-pages
  [ "$(git rev-parse origin/main)" = "$(git rev-parse HEAD)" ] || { echo "origin/main moved past our base; stop"; exit 1; }
  git add -A
  git commit -q -F $ROUND/commit.txt
  MAIN=$(git rev-parse HEAD); git push -q origin HEAD:refs/heads/main
  GHP=$(git rev-parse origin/gh-pages)
  export GIT_INDEX_FILE=$ROUND/ghpages.index; rm -f $GIT_INDEX_FILE
  git read-tree $MAIN; git update-index --cacheinfo 100644,$(git rev-parse $GHP:README.md),README.md
  TREE=$(git write-tree); unset GIT_INDEX_FILE
  C=$(git commit-tree $TREE -p $GHP -p $MAIN -m "gh-pages follows main"); git push -q origin $C:refs/heads/gh-pages
  echo "main $MAIN · gh-pages $C"
fi
