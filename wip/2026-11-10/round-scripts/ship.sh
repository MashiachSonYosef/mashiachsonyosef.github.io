#!/bin/bash
set -euo pipefail
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
cd $S/pt
git fetch -q origin main gh-pages
[ "$(git rev-parse origin/main)" = "$(git rev-parse HEAD)" ] || { echo "origin/main moved past our base; stop"; exit 1; }
git add -A
git status --short | grep -v '^M  \|^A  \|^D  \|^R  ' && { echo "unstaged leftovers; stop"; exit 1; } || true
{ cat $S/v26/commit.txt; printf '\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01YaByYdukgpv1g24zxvj3Td\n'; } > $S/v26/commit-final.txt
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -F $S/v26/commit-final.txt
MAIN=$(git rev-parse HEAD)
echo "main commit $MAIN"
git push -q origin HEAD:refs/heads/main
GHP=$(git rev-parse origin/gh-pages)
export GIT_INDEX_FILE=$S/v26/ghpages.index
rm -f $GIT_INDEX_FILE
git read-tree $MAIN
git update-index --cacheinfo 100644,$(git rev-parse $GHP:README.md),README.md
TREE=$(git write-tree)
unset GIT_INDEX_FILE
C=$(git -c user.name=Claude -c user.email=noreply@anthropic.com commit-tree $TREE -p $GHP -p $MAIN -m "gh-pages follows main")
git push -q origin $C:refs/heads/gh-pages
echo "gh-pages commit $C"
git fetch -q origin main gh-pages
echo "origin/main $(git rev-parse --short origin/main) · origin/gh-pages $(git rev-parse --short origin/gh-pages)"
