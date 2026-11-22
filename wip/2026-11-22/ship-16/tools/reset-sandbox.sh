#!/bin/bash
# The sandbox as the brief gives it: S/s12 at main 571e4a449a, clean, with ship 12's tool copies and patches 02, 05,
# 06, 07, 08, 09 and 10 applied (as apply-12.sh applied them), proved by the hash of the diff recorded before any run.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; T12=$S/s15w/tools
cd $S/s12 || exit 1
[ "$(git rev-parse --short=10 HEAD)" = "571e4a449a" ] || { echo "not at 571e4a449a"; exit 1; }
git checkout -q -- . && git clean -fdq || exit 1
cd reader
cp $T12/pinned-v1.mjs $T12/derive-landings-v1.mjs $T12/readmit-sources-v1.mjs $T12/check-readmission-v1.mjs tools/ || exit 1
python3 -I $T12/patch-02-strike-rows-gz.py tools/strike-rows-v1.mjs > /dev/null || exit 1
for p in patch-05-lattice-door patch-06-check-landings-holes patch-07-check-language-admitted patch-08-strike-language-keeps-readmission patch-09-pipeline-doc patch-10-lane-state; do
  python3 -I $T12/$p.py . > /dev/null || { echo "$p"; exit 1; }
done
cd ..
[ "$(git diff | sha256sum | cut -c1-64)" = "effed718d1ace7f5d0587e6e90f046ec1b11e40eaf14b37d4e612e5d8f3f39d5" ] || { echo "the diff is not the given state's"; exit 1; }
echo "the sandbox as given: main 571e4a449a with ship 12's tools"
