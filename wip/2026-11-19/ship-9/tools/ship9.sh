#!/bin/bash
# Ship the ship-9 tree (scratch s9, branch ship9) as ONE commit on main, then gh-pages follows main.
set -euo pipefail
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
cd $S/s9
pgrep -f "pipeline-9[ab].sh" > /dev/null && { echo "a pipeline is still running; stop"; exit 1; }
git fetch -q origin +refs/heads/main:refs/remotes/origin/main +refs/heads/gh-pages:refs/remotes/origin/gh-pages
BASE=$(git rev-parse ba41813560)
[ "$(git rev-parse origin/main)" = "$BASE" ] || { echo "origin/main moved past our base; stop"; exit 1; }
git merge-base --is-ancestor $BASE HEAD || { echo "HEAD does not stand on the base; stop"; exit 1; }
[ -s $S/s9w/commit.txt ] || { echo "no commit message; stop"; exit 1; }
git reset -q --soft $BASE
git add -A
git status --short | grep -v '^M  \|^A  \|^D  \|^R  ' && { echo "unstaged leftovers; stop"; exit 1; } || true
{ cat $S/s9w/commit.txt; printf '\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01YaByYdukgpv1g24zxvj3Td\n'; } > $S/s9w/commit-final.txt
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -F $S/s9w/commit-final.txt
MAIN=$(git rev-parse HEAD)
echo "main commit $MAIN"
git push -q origin HEAD:refs/heads/main
GHP=$(git rev-parse origin/gh-pages)
export GIT_INDEX_FILE=$S/s9w/ghpages.index
rm -f $GIT_INDEX_FILE
git read-tree $MAIN
git update-index --cacheinfo 100644,$(git rev-parse $GHP:README.md),README.md
TREE=$(git write-tree)
unset GIT_INDEX_FILE
C=$(git -c user.name=Claude -c user.email=noreply@anthropic.com commit-tree $TREE -p $GHP -p $MAIN -m "gh-pages follows main")
git push -q origin $C:refs/heads/gh-pages
echo "gh-pages commit $C"
git fetch -q origin +refs/heads/main:refs/remotes/origin/main +refs/heads/gh-pages:refs/remotes/origin/gh-pages
echo "origin/main $(git rev-parse --short origin/main) · origin/gh-pages $(git rev-parse --short origin/gh-pages)"
