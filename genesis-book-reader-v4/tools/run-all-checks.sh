#!/usr/bin/env bash
# Every check, in one run, with a verdict at the end.
#
# The browser checks need the zone served: python3 -m http.server 8899 in this
# directory. check-nothing-invented reads the corpus off disk instead.
cd "$(dirname "$0")/.." || exit 1
URL="${1:-http://127.0.0.1:8899/zone.html?b=1kings}"
pass=0; fail=0; skip=0; failed=(); skipped=()
for t in tools/check-*.mjs; do
  name=$(basename "$t" .mjs)
  printf '%-28s ' "$name"
  # the corpus check reads off disk and takes no URL
  case "$name" in
    check-nothing-invented-v1|check-page-agrees-with-store-v1|check-clean-address-v1|check-provider-characters-v1|check-sense-split-v1|check-nothing-hand-typed-v1|check-nothing-hard-wired-v1) args=() ;;
    *) args=("$URL") ;;
  esac
  out=$(timeout 600 node "$t" "${args[@]}" 2>&1); rc=$?
  # A check that could not reach its inputs did not pass and did not fail. It
  # is counted apart, and named, so an empty run cannot read as a clean one.
  if [ "$rc" -eq 3 ]; then
    printf 'skipped — %s\n' "$(echo "$out" | head -1 | sed 's/^SKIPPED — //')"
    skip=$((skip+1)); skipped+=("$name")
  elif [ "$rc" -eq 0 ]; then
    printf 'ok   %s\n' "$(echo "$out" | grep -cE '^  ok  ') assertions"
    pass=$((pass+1))
  else
    printf 'FAILED\n'
    echo "$out" | grep -E '^FAIL|PAGE ERROR' | sed 's/^/    /'
    fail=$((fail+1)); failed+=("$name")
  fi
done
echo
# What the checks do not cover is as much a result as what they do. The
# manifest reads it out of the source every run, so the number is in front of
# whoever ran the checks rather than in a document nobody opened.
node tools/pipeline-manifest-v1.mjs --stamp "$(date +%F)" | sed -n '2,3p;/NO BUILD STEP/p' | sed 's/^/  /'
echo
if [ "$fail" -eq 0 ]; then echo "all $pass suites passed"; else
  echo "$fail of $((pass+fail)) suites FAILED: ${failed[*]}"; fi
if [ "$skip" -gt 0 ]; then echo "$skip could not run here: ${skipped[*]}"; fi
exit "$fail"
