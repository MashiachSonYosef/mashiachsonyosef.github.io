#!/usr/bin/env bash
# One-shot: scan the chain, then commit & push whatever changed on claude/chain-status.
# The workspace path comes from env.local (git-ignored) or the environment — never from
# anything committed on this branch.
set -u
cd "$(dirname "$0")"

if [ -f env.local ]; then
  set -a; . ./env.local; set +a
fi
if [ -z "${FOOTSTEPS_ROOT:-}" ]; then
  echo "FOOTSTEPS_ROOT is not set. Put it in env.local next to this script:" >&2
  echo '  FOOTSTEPS_ROOT=<path to the workspace>' >&2
  exit 1
fi

node tools/scan-chain-v1.mjs
scan_exit=$?
case "$scan_exit" in
  0) label="no change" ;;
  3) label="state changed" ;;
  2) label="INTEGRITY HOLD" ;;
  4) label="scanner ERROR" ;;  # ERROR heartbeat was still written — publish it
  *) echo "scan failed (exit $scan_exit) — not committing" >&2; exit "$scan_exit" ;;
esac

digest=$(node -e "const d=JSON.parse(require('fs').readFileSync('status/heartbeat.json','utf8')).state_digest; process.stdout.write((d||'none').slice(0,12))")
git add -A
if git diff --cached --quiet; then
  echo "nothing to commit ($label)"
else
  git -c commit.gpgsign=false commit -q -m "chain-status: ${label} (${digest})" || exit 1
  if ! git push -q origin HEAD:refs/heads/claude/chain-status; then
    echo "push rejected — the remote branch moved (another lane pushed)." >&2
    echo "Fetch and read origin/claude/chain-status before reconciling; do not force." >&2
    exit 1
  fi
  echo "pushed: ${label} (${digest})"
fi
exit "$scan_exit"
