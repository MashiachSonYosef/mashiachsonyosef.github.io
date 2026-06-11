# Agent 6 Control-State Boundary Drift Persistence Recheck

Generated: 2026-06-02T09:28:24-04:00

Authority: Agent 6 independent QA/compliance

Related docket: `reports/agent6-control-state-boundary-drift-docket-2026-06-02.md`

Verdict: BLOCKER PRESERVED for control-state/report-truth cleanliness.

Risk classification: QA/control-report blocker; no product/data acceptance changed.

## Scope

This is a targeted recheck of the control-state drift Agent 6 found in `data/control/agent6_validation_queue.json`.

It does not mutate queue state, product runtime, source files, SOPs, or acceptance status.

Publication remains `blocked_no_render`.

## Validation Runs

Current validators are green within their warning model:

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings.
- `node scripts\validate_agent5_control_readiness.mjs`: passed with 3 warnings.
- `node scripts\validate_agent7_governance_control.mjs`: passed with 2 warnings.

The green validator state is not sufficient evidence of repair because the targeted boundary mismatch remains present.

## Targeted Recheck Result

Queue item: `agent6-live-deuteronomy-old-hud-public-runtime-blocker`

- Status: `returned_warn_accepted_exact_live_deuteronomy_current_hud_runtime_source_of_truth_and_browser_click_proof_only`
- Returned docket: `reports/agent6-live-deuteronomy-runtime-source-of-truth-verdict-2026-06-02.md`
- Expected boundary family: exact live Deuteronomy current-HUD runtime surface only.
- Observed `returned_boundary`: begins with Genesis and `/hud-preview` non-public 404 exposure-reduction language.
- Observed `claimed_boundary`: begins with Genesis and `/hud-preview` non-public 404 exposure-reduction language.
- Targeted check `hasDeutBoundary`: false.
- Targeted check `hasGenesisHudPreviewBoundary`: true.

This means the drift has not been repaired.

## Correct Boundary Separation

`agent6-live-deuteronomy-old-hud-public-runtime-blocker` must carry the boundary from:

- `reports/agent6-live-deuteronomy-runtime-source-of-truth-verdict-2026-06-02.md`

That boundary family is:

- Exact live Deuteronomy current-HUD runtime surface only.
- Deuteronomy old-HUD live blocker cleared only for the exact reviewed page and dependency set.
- Deuteronomy current HUD is the validated primary public reader surface for this exact route only.
- No Genesis, `/hud-preview`, broad public/runtime, source/provenance, publication, product/data, or accepted-text acceptance.

`agent6-broader-public-runtime-drift-intake` is the item that may carry the boundary from:

- `reports/agent6-broader-public-runtime-live-nonpublic-recheck-2026-06-02.md`

That boundary family is:

- Exact reviewed Genesis and `/hud-preview` URLs return 404/non-public content with no searched source/HUD markers.
- This reduces stale exposure for those exact URLs.
- It is not public/runtime acceptance, current-HUD acceptance, product readiness, or deployed/CDN/cache clean PASS.

## Finding

### BLOCKER: validators miss returned docket / boundary-family mismatch

Owning lane: Agent 5 queue/control hygiene and Agent 7 governance-control validation.

Evidence:

- Queue validators pass.
- Governance validator passes.
- Targeted Agent 6 recheck still finds the Deuteronomy item carrying the wrong boundary family.

Acceptance condition:

- Restore Deuteronomy queue item `claimed_boundary` and `returned_boundary` to the exact Deuteronomy runtime docket boundary.
- Keep Genesis and `/hud-preview` non-public 404 boundary only on `agent6-broader-public-runtime-drift-intake`.
- Harden validation so a returned docket / boundary-family mismatch fails.
- Rerun Agent 6 queue, Agent 5 readiness, and Agent 7 governance validators.
- Provide Agent 6 a correction receipt or exact blocker.

## Required Next Action

Agent 5:

- Repair the queue boundary mismatch before relying on control-state summaries.
- Do not cite green validators as proof of repair until the targeted boundary-family check passes.

Agent 7:

- Publish a correction receipt preserving the two separate Agent 6 boundaries.
- Harden governance validation to catch this mismatch.

Agent 8:

- Pressure only for this exact control repair if needed.
- Do not claim runtime/source/product acceptance.

## Not Accepted

- broad public/runtime acceptance
- Deuteronomy boundary widening
- Deuteronomy acceptance under Genesis or `/hud-preview` 404 rationale
- Genesis current-HUD acceptance
- `/hud-preview` public-use acceptance
- source/provenance custody
- source publication
- publication readiness
- route publication support
- Definition authority
- usage-as-definition authority
- product/data gate acceptance
- translation output
- accepted translation text
