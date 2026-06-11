# Spark-10 Orot Post-205 Frontier Check (2026-06-04)

## Command results

1. `node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs data/build/orot/reader-hint-placeholder-candidates.json`
- Status: PASS
- Exit code: 0
- Stdout summary: `non-public reader-hint placeholder package validation passed for data/build/orot/reader-hint-placeholder-candidates.json.`
- Stderr summary: none

2. `node scripts/validate_agent1_orot_missing_lexicon_linkage_candidates.mjs reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json`
- Status: PASS
- Exit code: 0
- Stdout summary: `Agent 1 Orot missing lexicon linkage candidate validation passed for reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json.`
- Stderr summary: none

3. `node -e "const fs=require('fs'); ..."`
- Status: PASS
- Exit code: 0
- Stdout summary: `frontier assertions passed`
- Stderr summary: none

4. `git diff --check -- scripts/build_agent10_orot_post_205_frontier.mjs reports/agent10-orot-post-205-frontier-and-blockers-2026-06-04.json reports/agent10-orot-post-205-frontier-and-blockers-2026-06-04.md`
- Status: PASS
- Exit code: 0
- Stdout summary: none
- Stderr summary: none

## Observed checks
- package anchor observed: **332 rows / 6156 occurrences** (expected 332 / 6156)
- top-500 representation observed: public-domain missing **0**, NC/unresolved missing **0** (expected both 0)
- remaining no-Sefaria-hit observed: **186 rows / 2421 occurrences** (expected 186 rows / 2421 occurrences)

## Emissions
- zero public/runtime/output/answer/definition/accepted-text emissions observed in this mechanical check.

## Blocker
- None.
