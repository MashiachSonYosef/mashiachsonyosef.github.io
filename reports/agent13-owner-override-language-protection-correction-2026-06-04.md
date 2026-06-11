# Agent 13 Owner Override Language Protection Correction - 2026-06-04

Status: `pipeline_safe_language_correction_applied`.

## Trigger

Oracle 9 returned a critical correction: owner intent and Agent 14 / owner-emergency language must not be framed as bypass authority.

Rejected framing:

- `owner_forced`
- `owner_forced_control_posture_active`
- any implication that Agent 14 can force NC, SOP-021, control posture, corpus mutation, source lanes, or publication state into effect.

## Corrected Language

Use pipeline-safe terms:

- `pipeline_pending_control_posture_proposal`
- `owner_requested_pipeline_review`

## Files Corrected

- `reports/sop-021-current-action-preservation-and-drift-control.md`
- `data/control/sop_revision_queue.json`
- `data/control/agent_registry.json`
- `data/control/agent_goal_board.json`

## Agent 6 Blocker Repair

Agent 6 returned `BLOCKED` because SOP-021 still contained bypass-implying human-readable wording:

- `Owner Forced Control Posture`
- `The owner has forced this correction into active control posture as of 2026-06-04.`

That wording has been replaced in `reports/sop-021-current-action-preservation-and-drift-control.md` with:

- section heading: `Owner Requested Pipeline Review Posture`
- active-state boundary: owner intent does not by itself create active SOP law, active corpus state, source-lane state, public/runtime state, publication readiness, Definition authority, answer eligibility, accepted text, NC public display, or NC commercial authorization.
- review boundary: any active QA/compliance boundary requires an exact Agent 6 docket, and any durable law/control publication requires Agent 7 publication of the exact Agent 6-signed boundary where applicable.

The follow-up line now says `owner-requested pipeline-review proposal`, not active control posture.

## Protected Pipeline Rule

NC rows may enter only through the normal pipeline:

1. Agent 1 source-family evidence.
2. Separated `noncommercial_educational_candidate` proposal.
3. Agent 6 exact row/subset boundary review.
4. Agent 10 package/use only within the cleared boundary.
5. Agent 7 activation/publication only if applicable.

Until then, NC rows are not usable reader/definition output and are not commercial-clean.

## Agent 14 Boundary

Agent 14 is advisory / override-watch only.

Agent 14 is not a bypass authority and cannot convert owner intent, NC policy, SOP posture, corpus mutation, source lanes, or publication state into active law/corpus/public state.

## Required Protection Docket

Agent 6 should review a protection docket stating:

No agent, including Agent 14, can convert owner intent, NC policy, or control posture into active law, corpus state, source-lane state, public/runtime state, publication readiness, Definition authority, answer eligibility, or accepted text without the required Agent 6 / Agent 7 pipeline step.

## Boundary

No QA acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, runtime/publication/product/answer acceptance, accepted gloss/text, NC commercial authorization, or release action is claimed.
