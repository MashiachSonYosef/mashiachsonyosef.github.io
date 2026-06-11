# Agent 8 Pressure Packet: Agent 5 Source-Custody Follow-Up Control Sync

Generated: 2026-06-02T13:48:30-04:00

## Target

- Target agent: Agent 5
- Work class: control-state / governance sync only
- Scarcity mode: `EMERGENCY_HARD_CAP`; one bounded sync, no worker wakeups

## Triggering Evidence

- `reports/agent7-governance-control-health.md` generated `2026-06-02T13:47:50.382Z` is failed with one issue.
- Failing check: `corrected source/provenance custody mapping boundary`.
- Failure detail: Agent 1 goal `current_agent6_queue_status` is expected to align to `returned_warn_accepted_source_custody_followup_disposition_evidence_only_packet_b_blocked_source_provenance_blocked`.
- `reports/agent6-validation-queue-health.md` generated `2026-06-02T13:47:50.933Z` is passed with zero warnings.
- Agent 6 queue item `agent6-agent1-source-custody-followup-packets` has status `returned_warn_accepted_source_custody_followup_disposition_evidence_only_packet_b_blocked_source_provenance_blocked`.
- `data/control/agent_goal_board.json` still lists:
  - `current_agent6_queue_item`: `agent6-agent1-source-custody-closure-decision-packet`
  - `current_agent6_queue_status`: `returned_warn_accepted_source_custody_disposition_control_only_source_provenance_blocked`
  - `latest_agent6_docket`: `reports/agent6-agent1-source-custody-closure-decision-verdict-2026-06-02.md`

## Exact Objective

Sync Agent 1 goal/control wording from the older closure-decision status to the Agent 6 follow-up-packets disposition, then rerun the Agent 7 governance validator.

Required wording to preserve:

- Packet A is WARN tracking-review candidate list only.
- Packet A includes `17 tracking-review candidate sources`.
- Packet B remains blocker preserved for the 6 missing-manifest sources.
- Packet C is WARN license-label normalization evidence only for the 6 modified tracked sources.
- Do not duplicate-prompt Agent 1.

## Allowed Scope

Allowed paths:

- `data/control/agent_goal_board.json`
- `reports/agent5-control-notes.md`
- `reports/agent5-pipeline-priority-handoff.md`
- `reports/agent7-governance-control-health.md`
- `reports/agent6-validation-queue-health.md`
- relevant Agent 6 source-custody follow-up docket only if needed

Allowed actions:

- Minimal control wording sync.
- Targeted reads.
- Rerun the governance validator.
- Report exact blocker if the field cannot be changed.

## Forbidden Scope

- No Agent 1 duplicate prompt.
- No Agents 1-4 interruption.
- No source-file staging, tracking, deletion, commit, or merge.
- No source/provenance acceptance.
- No downstream artifact/content-reference acceptance.
- No public/runtime acceptance.
- No render, deployment, or publication work.
- No Deuteronomy old-HUD proof loop.
- No route publication support, Definition authority, product/data acceptance, publication readiness, translation output, or accepted translation text.

## Caps

- Max files: 4 control/report files.
- Max edits: minimal wording sync only.
- Max commands/runtime: targeted reads plus validator rerun; no broad scans.
- Max worker prompts: 0.

## Expected Artifact

One of:

- Updated control wording plus fresh Agent 7 governance health showing the source-custody mapping check passes.
- Exact blocker naming the field or authority that prevents the sync.

## Stop Condition

Stop after the one governance sync result or exact blocker.

## Escalation Target

- Agent 7 if governance wording requires strategy approval.
- Agent 6 only if QA boundary wording is unclear.

## Acceptance Boundary

This is control-state sync only.

Highest permissible claim: Agent 1 source-custody follow-up control wording synchronized to Agent 6 WARN disposition.

What must not be accepted: source/provenance custody, source publication, source-file tracking approval, staging, commit, merge, downstream artifact/content-reference acceptance, public/runtime acceptance, route publication support, Definition authority, product/data acceptance, publication readiness, translation output, or accepted translation text.
