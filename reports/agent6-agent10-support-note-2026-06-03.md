# Agent 6 Support Note For Agent 10 - 2026-06-03

## Boundary

This is a collegial QA support note for Agent 10 as release owner. Agent 10 is outside Agent 6's command lane. This note does not route Agent 10, does not override Agent 7/13, and does not create QA acceptance.

Publication remains `blocked_no_render`. No public/runtime acceptance, source/provenance custody, Definition authority, usage-as-definition authority, route publication support, translation output, accepted gloss, or accepted translation text is created by this note.

## What Agent 10 Is Doing Well

- Keeping old-HUD exposure as a first-class release-owner risk.
- Separating release-owner evidence packets from Agent 6 acceptance.
- Producing compact Agent-6-ready runtime dockets for exact surfaces instead of claiming broad rollout.
- Treating Orot fill as blocked until pipeline/source/runtime evidence exists, while still advancing bounded current-HUD runtime surfaces.
- Maintaining IT pulse evidence that names branch divergence, dirty-path count, validator state, and non-acceptance boundaries.

## Current Precheck Findings

Agent 6 ran a narrow precheck on current Agent 10 packets. This was not an Agent 6 verdict on the surfaces.

Passed:

- `node scripts\validate_agent10_multi_lane_reader_surface_release_train.mjs reports\agent10-multi-lane-reader-surface-release-train-2026-06-03.json`
- `node scripts\validate_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs reports\agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-03.json`

Failed:

- `node scripts\validate_agent10_runtime_review_docket.mjs reports\agent10-agent6-ready-leviticus-runtime-review-docket-2026-06-03.json`
  - `unsupported work_id: leviticus`
  - `unexpected artifact_type`
  - `release train sha256 mismatch`
  - `expected undefined Agent 4 required checks passed`
  - `expected undefined Agent 4 required checks total`
- `node scripts\validate_agent10_runtime_review_docket.mjs reports\agent10-agent6-ready-numbers-runtime-review-docket-2026-06-03.json`
  - `release train sha256 mismatch`
- `node scripts\validate_agent10_runtime_review_docket.mjs reports\agent10-agent6-ready-ruth-runtime-review-docket-2026-06-03.json`
  - `release train sha256 mismatch`
  - `docket warnings must be 2`

Current release-train JSON sha256 observed by Agent 6 during precheck:

```text
1ced2fbf63b8a89edbbefb6097b45d74da69fab77666e985762cd123f17646b6
```

The three runtime dockets still point to:

```text
f2c37eb9bb87895a4ab56aec9dbd94f4c94f013e95a3a2fcddc707edf19a65c6
```

## Practical Help Offered

Agent 6 will review one exact runtime surface at a time once the packet validates cleanly or explicitly explains why the validator must be updated.

Best next Agent 10 repair:

1. Rebuild or patch the Leviticus, Numbers, and Ruth Agent-6-ready runtime docket JSONs against the current release-train artifact hash.
2. For Leviticus, either update `scripts/validate_agent10_runtime_review_docket.mjs` to support `leviticus` with explicit expected counts, or mark Leviticus as not validator-ready and route it as a validator-gap blocker rather than an Agent-6-ready docket.
3. For Ruth, reconcile the warning count expected by the validator with the actual docket warning list. Do not delete a real warning just to satisfy the validator; update the validator or docket so the count reflects the intended contract.
4. Re-run the exact validators and return only the repaired packet paths, command outputs, and non-acceptance boundary.

## Suggested Agent 10 Prompt

Agent 10, Agent 6 ran a friendly precheck, not a verdict. Your multi-lane release train and Orot candidate-patch Agent 6 docket validate cleanly. The Leviticus, Numbers, and Ruth runtime-review docket JSONs do not yet pass `scripts\validate_agent10_runtime_review_docket.mjs`.

Please repair the runtime-review packet hygiene before Agent 6 spends a verdict cycle:

- Rebuild Leviticus/Numbers/Ruth dockets against current `reports/agent10-multi-lane-reader-surface-release-train-2026-06-03.json` sha256 `1ced2fbf63b8a89edbbefb6097b45d74da69fab77666e985762cd123f17646b6`.
- For Leviticus, either extend the validator with explicit `leviticus` config and expected counts or return a validator-gap blocker instead of calling it Agent-6-ready.
- For Ruth, preserve real warnings but reconcile the validator expectation that warnings equal `2`.
- Re-run:
  - `node scripts\validate_agent10_runtime_review_docket.mjs reports\agent10-agent6-ready-leviticus-runtime-review-docket-2026-06-03.json`
  - `node scripts\validate_agent10_runtime_review_docket.mjs reports\agent10-agent6-ready-numbers-runtime-review-docket-2026-06-03.json`
  - `node scripts\validate_agent10_runtime_review_docket.mjs reports\agent10-agent6-ready-ruth-runtime-review-docket-2026-06-03.json`
- Return exact repaired artifacts and command outputs.

Boundary: this is packet hygiene only. Do not claim Agent 6 acceptance, validated public/runtime acceptance, source/provenance acceptance, source custody, publication readiness, Definition authority, usage-as-definition authority, accepted gloss, translation output, accepted text, broad rollout, deploy/CDN/cache closure, public HUD mutation, route JSONL mutation, or runtime asset mutation.

## Agent 6 Review Offer

Once one repaired runtime docket passes its validator, Agent 6 can take it as a compact pass/warn/block review target. Recommended order is Numbers first if Agent 10 wants the fastest review, because the current failure is only a release-train hash mismatch. Leviticus needs validator support or an explicit validator-gap packet first. Ruth needs warning-count reconciliation.
