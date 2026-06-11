# Agent 2 Orot Definition Fill Plan

Date: 2026-06-03

Status: block for Stage A execution until the reader-hint export command emits a denylist proof with zero blocked-row dependencies.

Highest permissible claim: Orot has additional pipeline-supported reader-hint candidates, but they are candidate/readability evidence only. This report does not claim Definition authority, usage-as-definition authority, accepted glosses, accepted translation text, source/provenance acceptance, QA acceptance, public/runtime acceptance, publication readiness, or route publication support.

## Scope

Lane: definition-route pipeline diagnosis only.

Inputs checked:

- `reports/agent10-orot-fill-expansion-plan-2026-06-03.md`
- `reports/agent1-orot-fill-source-row-evidence-2026-06-03.md`
- `data/lexical/orot.manifest.json`
- `data/lexical/occurrences/orot.json`
- `data/lexical/orot-chunks/**`
- `data/definitions/hud-route-lookup/manifest.json`
- `.codex-tmp/hud-deploy-live/data/public-hud/orot/**`
- current route/HUD validation scripts

## Current Coverage

Measurement definitions:

- Unique token IDs are rows in `data/lexical/orot-chunks/**` `token_index.forms`.
- Occurrences are from `data/lexical/occurrences/orot.json`.
- Public reader hints are entries in `.codex-tmp/hud-deploy-live/data/public-hud/orot/reader-hints.json`.
- Route-answer support follows Agent 10's full Orot lookup-candidate pass using current HUD lookup-candidate behavior.

Current measured state:

| surface | token IDs | occurrences | note |
|---|---:|---:|---|
| Orot total | 17,307 | 59,806 | lexical/occurrence pipeline data |
| Public reader hints now | 5,720 | 33,151 | current exact-route reader hints |
| Lookup-candidate route answers | 10,704 | 45,687 | Stage A ceiling before source-row denylist filtering |
| Immediate Stage A gain | 4,984 | 12,536 | candidate hints only, not accepted text |
| Remaining true pipeline gaps | 6,603 | 14,119 | needs upstream route/gap work |

Conclusion: Orot is still gapful. Stage A can likely expand inline hints if and only if the export excludes Agent 1's blocked curated rows.

## Agent 1 Blocker

Agent 1 returned `block` for these exact rows:

- `curated|lex-aph-h639|source metadata incomplete`
- `curated|lex-mashiach-h4899|source metadata incomplete`
- `curated|lex-ruach-h7307|source metadata incomplete`
- `curated|lex-yhwh-h3068|source metadata incomplete`

Execution rule: Stage A may proceed only if the expanded reader hints do not depend on those rows as source-clean evidence.

Dependency scan result from this pass:

| artifact root | files checked | files with blocked ID hits | meaning |
|---|---:|---:|---|
| `data/definitions/hud-route-lookup` | 7,991 | 0 | current route cards do not contain the four blocked IDs |
| `.codex-tmp/hud-deploy-live/data/public-hud/orot` | 6 | 0 | current public Orot package does not contain the four blocked IDs |
| `data/lexical/orot-chunks` | 18 | 12 | lexical chunks do contain the blocked entries, so direct lexical-source promotion is not safe |
| `data/lexical/source-layers` | 9 | 1 | source-layer strings exist, but Agent 1's exact-source verdict remains blocking |

Current public reader hints also have zero blocked-ID hits.

## Safest Stage A Command Path

There is no committed `build_public_hud_reader_hints` or equivalent full Orot reader-hint export script visible in `scripts/`. The existing reusable primitives are:

- `assets/js/reader-workbench.js` lookup-candidate behavior
- `scripts/audit_route_hud_word_sample.mjs` lookup-candidate/answer-selection audit logic
- `scripts/validate_route_answer_safety.mjs`
- `scripts/validate_public_hud_route_lookup.mjs`
- `scripts/validate_public_hud_route_cards.mjs`
- `scripts/validate_public_hud_normalized_keys.mjs`

Therefore the safe Stage A path is:

1. Dry-run a full Orot lookup-candidate reader-hint export using the same lookup-candidate and answer-selection behavior as the current HUD runtime.
2. Apply a hard denylist before writing hints:
   - `lex-aph-h639`
   - `lex-mashiach-h4899`
   - `lex-ruach-h7307`
   - `lex-yhwh-h3068`
   - `curated|lex-aph-h639`
   - `curated|lex-mashiach-h4899`
   - `curated|lex-ruach-h7307`
   - `curated|lex-yhwh-h3068`
3. Exclude any candidate answer card or hint whose serialized route card, source rows, source IDs, source-row IDs, or secondary source-row IDs contain a denylisted value.
4. Re-run answer selection after removing blocked candidates; do not hand-pick substitute English text.
5. Emit proof counts before publication/package replacement:
   - `candidate_hint_token_ids`
   - `candidate_hint_occurrences`
   - `blocked_candidate_token_ids`
   - `blocked_candidate_occurrences`
   - `remaining_true_gap_token_ids`
   - `remaining_true_gap_occurrences`
   - `blocked_source_row_hits`
6. Proceed only if `blocked_source_row_hits = 0` in the final staged `reader-hints.json`.

The next command should be a dry-run/proof command, not a publish command. If Agent 10 has the package-local reader-hint builder that produced the current Orot/Jonah public-hud packages, run it in dry-run mode with denylist proof enabled. If no such command exists, Stage A is blocked until that pipeline command is added or surfaced.

Required proof command shape:

```powershell
node scripts/<existing-reader-hint-export>.mjs `
  --work-id orot `
  --strategy lookup-candidate `
  --lexical-manifest data/lexical/orot.manifest.json `
  --occurrences data/lexical/occurrences/orot.json `
  --chunks-dir data/lexical/orot-chunks `
  --route-lookup data/definitions/hud-route-lookup/manifest.json `
  --deny-source-row lex-aph-h639 `
  --deny-source-row lex-mashiach-h4899 `
  --deny-source-row lex-ruach-h7307 `
  --deny-source-row lex-yhwh-h3068 `
  --dry-run `
  --proof reports/agent2-orot-stage-a-reader-hint-denylist-proof-2026-06-03.json
```

Required validation after a staged output exists:

```powershell
node scripts/validate_route_answer_safety.mjs
node scripts/validate_public_hud_route_lookup.mjs --skip-release-stamp
node scripts/validate_public_hud_route_cards.mjs
node scripts/validate_public_hud_normalized_keys.mjs
```

Targeted denylist proof after staging:

```powershell
rg -n "lex-aph-h639|lex-mashiach-h4899|lex-ruach-h7307|lex-yhwh-h3068|curated\\|lex-aph-h639|curated\\|lex-mashiach-h4899|curated\\|lex-ruach-h7307|curated\\|lex-yhwh-h3068" .codex-tmp/hud-deploy-live/data/public-hud/orot
```

Expected result for Stage A proceed: zero matches.

## Stage B Recommendation

Do not publish all lookup-candidate Orot route shards now. Agent 10's packet estimates:

- exact-key filtered route shard package: 3,367 shards / 398.23 MiB
- lookup-candidate filtered route shard package: 4,031 shards / 488.20 MiB

Recommended top-N sequence:

1. Top 50 source-clean fillable token IDs only.
2. Top 100 only after Agent 4 runtime/payload proof.
3. Top 250 only after top 100 stays within payload and current-HUD behavior gates.

Stage B must reuse the same denylist exclusion proof as Stage A. A token is not source-clean for Stage B if its selected route cards rely on any of the four Agent 1-blocked curated rows.

## Remaining Gap Classification

After Stage A's lookup-candidate expansion, the expected true pipeline gaps are:

- 6,603 token IDs
- 14,119 occurrences

These are not safe to fill by manual definition text. Classify them with existing route/gap tools:

```powershell
node scripts/build_definition_gap_queue.mjs `
  --phrase=.local-cache/definition-routes/source-phrase-evidence.jsonl `
  --citable=.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl `
  --csv=.local-cache/definition-routes/orot-definition-gap-queue.csv `
  --report=reports/agent2-orot-definition-gap-queue-2026-06-03.md
```

Then rebuild route artifacts only if the current definition-route inputs have changed through approved pipeline sources:

```powershell
node scripts/build_definition_routes.mjs
node scripts/build_hud_route_store.mjs
node scripts/build_hud_route_lookup.mjs
node scripts/validate_hud_route_lookup.mjs
```

Do not use gap rows as accepted definitions. They are queue and route-diagnosis inputs only.

## Validator Evidence

Commands run in this pass:

```powershell
node scripts/validate_route_answer_safety.mjs
node scripts/validate_public_hud_route_lookup.mjs --skip-release-stamp
node scripts/validate_public_hud_route_cards.mjs
node scripts/validate_public_hud_normalized_keys.mjs
```

Results:

- Route answer safety validation passed.
- Public HUD route lookup validation passed.
- Public HUD route card scan passed: 539,661 cards, 175,216 tokens, 7,990 shards.
- Public HUD normalized key audit passed: 175,216 tokens, 0 issue tokens.

Targeted current Orot public-package old-HUD marker scan:

- files checked: 6
- old-HUD marker hits: 0

The broad old-HUD exposure audit timed out in an earlier attempt, so this report does not claim global old-HUD acceptance.

## Next Command For Agent 10

Do not publish Stage A yet.

Next command: run or surface the existing reader-hint export command in dry-run/proof mode with the denylist above. If no such command exists, the exact blocker is: no existing committed pipeline command was found that regenerates Orot reader hints with lookup-candidate behavior and proves exclusion of Agent 1's four blocked curated rows.

Stage A may proceed only after the dry-run proof reports:

- `blocked_source_row_hits = 0`
- expanded hint count at or below the lookup-candidate ceiling of 10,704 token IDs / 45,687 occurrences
- residual gap count explicitly reported
- all output hints remain `candidate_not_authority` / `reader_hint_not_translation`
