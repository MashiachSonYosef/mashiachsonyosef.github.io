# Agent 2 Source-Lane Assignment Preflight Fixture Package

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE

## Target

Provide a bounded fixture proving the Agent 2 source-lane preflight validator can accept a correctly shaped Agent 1 lane-assignment packet while preserving zero authority/public/answer boundaries.

## Files

- `scripts/validate_agent2_source_lane_assignment_packet.mjs`
- `data/definitions/agent2-source-lane-assignment-preflight-fixture.json`
- `reports/agent2-source-lane-assignment-preflight-fixture-package-2026-06-04.md`
- `reports/agent2-source-lane-assignment-preflight-fixture-package-2026-06-04.json`

## Command

```powershell
node scripts/validate_agent2_source_lane_assignment_packet.mjs data/definitions/agent2-source-lane-assignment-preflight-fixture.json
```

Expected result:

```text
Agent 2 source-lane assignment packet validation passed. Rows: 4; lanes: {"commercial_clean_candidate":1,"noncommercial_educational_candidate":1,"metadata_or_link_only":1,"blocked_or_needs_review":1}.
```

## Counts

- Fixture rows: 4.
- Commercial-clean rows: 1.
- NC educational rows: 1.
- Metadata/link-only rows: 1.
- Blocked/review rows: 1.
- Candidate rows emitted: 0.
- Definition text rows emitted: 0.
- Answer-eligible rows: 0.
- Public emit rows: 0.

## Boundary

This fixture is contract-shape proof only. It is not Agent 1 acceptance, source/license/legal acceptance, Definition authority, answer acceptance, accepted gloss/text, public output, NC commercial authorization, or publication readiness.

## Stop Condition

Stop after validating the fixture and preserving the missing real Agent 1 workset blocker.
