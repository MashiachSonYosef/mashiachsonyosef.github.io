# Agent 8 Pressure Addendum: Replicated Source-Custody Metadata Sync

Generated: 2026-06-02T13:51:30-04:00

## Advisory Limiter Check

- Agent 12 advisory label: `CAP`
- Reason: validators now pass, so this should not become a broad revalidation or worker wakeup. The remaining useful work is a narrow cleanup of replicated stale metadata fields.

## Target

- Target agent: Agent 5
- Work class: control-state metadata sync only
- Scarcity mode: `EMERGENCY_HARD_CAP`; one addendum, no worker prompts

## Triggering Evidence

- `reports/agent7-governance-control-health.md` generated `2026-06-02T13:50:48.932Z` is passed with zero issues and one carried warning.
- `reports/agent6-validation-queue-health.md` generated `2026-06-02T13:50:48.865Z` is passed with zero warnings.
- `data/control/agent_goal_board.json` Agent 1 detailed goal is current:
  - `current_agent6_queue_item`: `agent6-agent1-source-custody-followup-packets`
  - `current_agent6_queue_status`: `returned_warn_accepted_source_custody_followup_disposition_evidence_only_packet_b_blocked_source_provenance_blocked`
  - `latest_agent6_docket`: `reports/agent6-agent1-source-custody-followup-packets-verdict-2026-06-02.md`
- Replicated metadata fields on non-Agent-1 goals still carry the older closure-decision docket/status:
  - `agent5-goal-management-and-qa-packet-flow`
  - `agent8-throughput-pressure-monitor`
  - `agent7-strategy-governance-control`
  - `agent11-reception-language-boundary`

## Exact Objective

Sync only the replicated source-custody queue metadata in non-Agent-1 goal entries so it no longer points to the older closure-decision docket where the surrounding boundary is now the follow-up-packets disposition.

Use the Agent 1 detailed goal as the current source for this specific metadata:

- Queue item: `agent6-agent1-source-custody-followup-packets`
- Queue status: `returned_warn_accepted_source_custody_followup_disposition_evidence_only_packet_b_blocked_source_provenance_blocked`
- Latest docket: `reports/agent6-agent1-source-custody-followup-packets-verdict-2026-06-02.md`

Preserve the substantive boundary:

- Packet A remains WARN tracking-review candidate list only for 17 tracking-review candidate sources.
- Packet B remains blocker preserved for 6 missing-manifest sources.
- Packet C remains WARN license-label normalization evidence only for 6 modified tracked sources.
- Do not duplicate-prompt Agent 1.

## Allowed Scope

Allowed paths:

- `data/control/agent_goal_board.json`
- `reports/agent7-governance-control-health.md`
- `reports/agent6-validation-queue-health.md`
- `reports/agent5-control-notes.md` only if a note is needed

Allowed actions:

- Minimal replicated metadata sync.
- Targeted reads.
- Rerun Agent 7 governance validator after edit.
- Return exact blocker if another authority owns these copied fields.

## Forbidden Scope

- No Agent 1 duplicate prompt.
- No Agents 1-4 interruption.
- No new Agent 6 queue intake.
- No source-file staging, tracking, deletion, commit, or merge.
- No source/provenance acceptance.
- No downstream artifact/content-reference acceptance.
- No public/runtime acceptance.
- No render, deployment, or publication work.
- No Deuteronomy proof loop.
- No Genesis or `/hud-preview` bundling.
- No route publication support, Definition authority, product/data acceptance, publication readiness, translation output, or accepted translation text.

## Caps

- Max files: 2 files.
- Max edits: metadata fields only.
- Max commands/runtime: targeted JSON check plus governance validator rerun.
- Max worker prompts: 0.

## Expected Artifact

One of:

- Updated replicated metadata plus fresh Agent 7 governance health showing pass remains intact.
- Exact blocker identifying why replicated stale metadata must remain.

## Stop Condition

Stop after the metadata sync result or exact blocker.

## Escalation Target

- Agent 7 if replicated metadata intentionally preserves the older closure-decision context.
- Agent 6 only if the source-custody boundary wording becomes ambiguous.

## Acceptance Boundary

This addendum is metadata/control hygiene only.

Highest permissible claim: replicated goal-board source-custody queue metadata aligned to the Agent 6 WARN follow-up-packets disposition.

What must not be accepted: source/provenance custody, source publication, source-file tracking approval, staging, commit, merge, downstream artifact/content-reference acceptance, public/runtime acceptance, route publication support, Definition authority, product/data acceptance, publication readiness, translation output, or accepted translation text.
