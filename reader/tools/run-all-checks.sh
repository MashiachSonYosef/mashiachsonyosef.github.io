#!/usr/bin/env bash
# Every check, in one run, with a verdict at the end.
#
# The browser checks need the zone served: python3 -m http.server 8899 in this
# directory. check-nothing-invented reads the corpus off disk instead.
cd "$(dirname "$0")/.." || exit 1

# Which works to run against, asked of the directory rather than typed here.
# This line used to read ?b=genesis. When genesis was withdrawn the default
# went on naming it, and every check that took a URL opened a page for a work
# that was not there — a suite that cannot run reports nothing, which reads
# like green. Given an argument, that argument still wins and only it runs.
if [ -n "$1" ]; then
  ZONES=("$1")
else
  # The fleet-scale form of the sweep law. "Every URL check against every
  # work" was written for a two-zone shelf; at thousands of zones it is a
  # multi-week suite, which is a suite that never reports. What actually
  # varies per zone is already covered without a browser: every bin's bytes
  # are hashed against the store's pins on every run. What the browser
  # checks verify is the reader's behavior — one codebase — so the sweep
  # walks every SHAPE the shelf carries rather than every instance: each
  # coordinate shape, a titled and an untitled zone, a Hebrew-id and a
  # Latin-id slug, the largest and the smallest bin, and the shelf's first
  # and last in sort order. Derived, never typed; deduped; the panel grows
  # by itself the day a new shape appears.
  mapfile -t SLUGS < <(node -e '
    const { readFileSync, readdirSync, statSync } = await import("node:fs");
    const { gunzipSync } = await import("node:zlib");
    const { zonesOnDisk } = await import("./tools/zones-on-disk-v1.mjs");
    const all = zonesOnDisk();
    const pick = new Map(); // reason -> slug (first match wins, sorted order)
    const sizes = all.map((z) => [z, statSync(`data/zones/${z}.bin`).size]);
    pick.set("first", all[0]);
    pick.set("last", all[all.length - 1]);
    pick.set("largest", sizes.reduce((a, c) => (c[1] > a[1] ? c : a))[0]);
    pick.set("smallest", sizes.reduce((a, c) => (c[1] < a[1] ? c : a))[0]);
    for (const z of all) {
      const needTitle = !pick.has("titled"), needBare = !pick.has("untitled");
      const needFlat = !pick.has("flat"), needNested = !pick.has("nested"), needNamed = !pick.has("named");
      const needHe = !pick.has("hebrew-id"), needLat = !pick.has("latin-id");
      const needKq = !pick.has("kq");
      if (!(needTitle || needBare || needFlat || needNested || needNamed || needHe || needLat || needKq)) break;
      const zz = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8"));
      const shape = String((zz.emitted_from || {}).coordinate_shape || "");
      // a zone carrying ketiv-qere sites: the pair's presentation is a shape of its own
      if (needKq && Number((zz.counts || {}).kq_sites) > 0) pick.set("kq", z);
      // three shapes, each its own slot: the named sequence shares a prefix
      // with the plain one and must not be allowed to fill its slot instead
      if (needNamed && shape.startsWith("SEALED_UNIT_SEQUENCE_NAMED")) pick.set("named", z);
      else if (needFlat && shape.startsWith("SEALED_UNIT_SEQUENCE")) pick.set("flat", z);
      if (needNested && shape.startsWith("CHAPTER_SECTION")) pick.set("nested", z);
      if (needTitle && (zz.work_he_tokens || []).some((t) => t.k)) pick.set("titled", z);
      if (needBare && !(zz.work_he_tokens || []).length) pick.set("untitled", z);
      if (needHe && /[\u0590-\u05FF]/u.test(z)) pick.set("hebrew-id", z);
      if (needLat && !/[\u0590-\u05FF]/u.test(z)) pick.set("latin-id", z);
    }
    for (const z of new Set(pick.values())) console.log(z);
  ' --input-type=module 2>/dev/null)
  if [ "${#SLUGS[@]}" -eq 0 ]; then
    echo "no zone on disk — refusing to run a suite against nothing"; exit 2
  fi
  ZONES=()
  for z in "${SLUGS[@]}"; do ZONES+=("http://127.0.0.1:8899/zone.html?b=$z"); done
  echo "shape panel: ${SLUGS[*]}"
fi

# The server the browser checks need, owned by the run. Containers restart
# and shells reset; a suite that assumes somebody else's server reports every
# browser check as a crash the moment that assumption breaks — it happened
# three times in one night. If 8899 answers, it is used; if not, one is
# started here and stopped when the run ends.
if ! curl -s -o /dev/null --max-time 2 http://127.0.0.1:8899/zone.html; then
  python3 -m http.server 8899 --directory . >/dev/null 2>&1 &
  SRV_PID=$!
  trap '[ -n "$SRV_PID" ] && kill "$SRV_PID" 2>/dev/null' EXIT
  for _ in $(seq 1 20); do
    curl -s -o /dev/null --max-time 2 http://127.0.0.1:8899/zone.html && break
    sleep 0.5
  done
fi

# The plan the no-URL checks read is derived and gitignored: a fresh checkout
# has no build/ and eight checks used to crash on its absence — a crash that
# reads as the site broken when it is the scaffold that is missing. Derive it.
node tools/plan-build-v1.mjs --out build/build-plan-v1.json --tsv build/build-plan-v1.tsv >/dev/null

pass=0; fail=0; skip=0; failed=(); skipped=()
# A check that takes no URL is the same check whichever work is served, so it
# runs once. A check that takes one runs against every work: the second work
# used to be checked by nothing at all, which is not a smaller kind of
# unchecked than the first.
run_once_done=""
for URL in "${ZONES[@]}"; do
if [ "${#ZONES[@]}" -gt 1 ]; then
  echo; echo "── ${URL##*b=} ──────────────────────────────────────────────"
fi
for t in tools/check-*.mjs; do
  name=$(basename "$t" .mjs)
  printf '%-28s ' "$name"
  # the corpus check reads off disk and takes no URL.
  # check-english-license-v1 was in this list and is not one of these: a licence
  # chip is per-zone data, so listing it here verified the site's core licence
  # rule on one book out of thousands. It takes a URL and now runs against every
  # zone in the panel; check-every-reading-licensed-v1 sweeps the whole shelf
  # off disk for the prior question, whether there is a licence to show at all.
  case "$name" in
    check-nothing-invented-v1|check-kq-carried-v1|check-attachment-grain-v1|check-corpus-clean-v1|check-store-pinned-v1|check-licence-names-v1|check-page-agrees-with-store-v1|check-clean-address-v1|check-provider-characters-v1|check-sense-split-v1|check-nothing-hand-typed-v1|check-nothing-hard-wired-v1|check-antiquity-tier-v1|check-sealed-layers-v1|check-frame-coverage-v1|check-w-grain-v1|check-nothing-unlanded-v1|check-build-derived-v1|check-docs-name-what-is-here-v1|check-derived-ranges-v1|check-kq-presentation-v1|check-variant-site-v1|check-zone-store-v1|check-door-word-card-v1|check-title-from-c0-v1|check-suggested-title-v1|check-root-card-credit-v1|check-work-attribution-display-v3|check-reference-groups-v1|check-language-admitted-v1|check-apparatus-not-stripped-v1|check-work-attachment-v1|check-no-import-side-effects-v1|check-nothing-welded-v1|check-implicit-maqaf-v1|check-script-admitted-v1|check-ledger-declared-v1|check-every-reading-licensed-v1|check-partial-serve-declared-v1|check-poc-fenced-v1|check-workspace-staged-v1|check-zone-store-reachable-v1|check-zone-store-crossing-v1|check-body-is-text-binding-is-rights-v1|check-commentary-section-aligned-v1|check-fixture-never-served-v1|check-front-door-opens-title-v1|check-k-maqaf-preserved-v1|check-manifest-prints-unguarded-v1|check-mark-inventory-closed-v1|check-numbering-gap-witnessed-v1|check-posture-names-from-record-v1|check-respan-projection-v1|check-serve-oracle-checked-v1|check-span-receipt-carried-identical-v1|check-variant-class-one-rule-v1) args=() ;;
    *) args=("$URL") ;;
  esac
  # the no-URL checks are about the tree, not about a work: once is enough
  if [ "${#args[@]}" -eq 0 ]; then
    case "$run_once_done" in *"|$name|"*) printf 'ran already\n'; continue ;; esac
    run_once_done="$run_once_done|$name|"
  fi
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
    # a check that died without a FAIL line still says how it died
    if ! echo "$out" | grep -qE '^FAIL|PAGE ERROR'; then echo "$out" | tail -3 | sed 's/^/    ¦ /'; fi
    fail=$((fail+1)); failed+=("$name")
  fi
done
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
