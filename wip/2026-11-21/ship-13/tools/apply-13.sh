#!/bin/bash
# Ship 13 (the lattice: relays v208 and v192.1), on a tree of ship 11d as shipped (340cff8e3b): the two pins and their
# files, the delta's reader and its check, and the patches. It writes no zone and no store row: the round does.
# Usage: apply-13.sh <reader dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; W=$S/s16w; R=${1:?reader dir}
stop() { echo "STOPPED: $1"; exit 1; }
cd $R || stop "no reader dir"
[ -z "$(git status --porcelain . | head -1)" ] || stop "the tree is not clean"
python3 -I $W/tools/make-lattice-delta-pin.py . $S/dl-v208-data/v2/ledgers/all/lattice-delta/delta-v13-v1 $S/dl-v209/v2/letters/moses-lattice-delta-v1/FOR-ELIJAH-v208.md || stop "the lattice delta's pin"
python3 -I $W/tools/make-read-words-pin.py . $S/dl-v192.1-data/v2/ledgers/all/read-words/read-words-v1.1 $S/dl-v209/v2/letters/moses-read-words-v1/FOR-ELIJAH-v192.1.md || stop "the read words' pin"
cp $W/tools/lattice-delta-v1.mjs $W/tools/check-lattice-delta-v1.mjs tools/ || stop "the delta's reader and its check"
for p in patch-01-projector patch-02-read-words-reader patch-03-apply-read-words patch-05-projector-says patch-06-round patch-07-check-lattice-projection patch-08-check-entry-gate patch-09-check-read-words patch-10-pipeline-doc patch-11-page-line-keeps-its-pill patch-12-check-lattice-orders; do
  python3 $W/tools/$p.py . || stop $p
done
for f in tools/project-lattice-v12-v1.mjs tools/read-words-v1.mjs tools/apply-read-words-v1.mjs tools/lattice-delta-v1.mjs tools/check-lattice-delta-v1.mjs tools/check-lattice-projection-v1.mjs tools/check-entry-gate-v1.mjs tools/check-read-words-v1.mjs; do node --check $f || stop "syntax: $f"; done
bash -n tools/round-v1.sh || stop "syntax: the round"
# the record of what body of text each source describes, emitted again from the corpus lane's ledger as it stands on
# the store (its correction of 6 September refuses fifteen sources; the copy in the tree was older and said three)
node tools/emit-source-corpus-v1.mjs --ledger $S/dl-source-corpus/moses-ledgers/toggle-ledgers-v1/source-corpus-v1.json --stamp 2026-11-21 || stop "the source corpus record"
node tools/check-source-corpus-v1.mjs --ledger $S/dl-source-corpus/moses-ledgers/toggle-ledgers-v1/source-corpus-v1.json | grep -E "^(  ok|FAIL)" | cut -c1-200
git status --short . | sed 's/^/  /'
echo "APPLIED"
