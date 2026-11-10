#!/usr/bin/env bash
# Every check, in one run, with a verdict at the end.
#
# The run itself is tools/run-checks-v1.mjs, which reads how each check is run
# from the check's own header (its RUN line) and keeps the two servers the
# page checks ask. This file is the name the documents and the hands know.
#
#   tools/run-all-checks.sh                     each check once, on the work it picks itself
#   tools/run-all-checks.sh <reader address>    the page checks against that work (zone.html?b=<work>)
#   tools/run-all-checks.sh --panel             the page checks against one work per shape the shelf carries
#
# Until 10 November 2026 this file carried a typed list of the checks that
# take no address and handed every other check one; the list went stale and a
# whole run reported reds that were this file's (the header of the runner
# tells it). Any other argument is passed through to the runner.
cd "$(dirname "$0")/.." || exit 1
if [ -n "${1:-}" ] && [ "${1#--}" = "$1" ]; then
  ZONE="$1"; shift
  exec node tools/run-checks-v1.mjs --zone "$ZONE" "$@"
fi
exec node tools/run-checks-v1.mjs "$@"
