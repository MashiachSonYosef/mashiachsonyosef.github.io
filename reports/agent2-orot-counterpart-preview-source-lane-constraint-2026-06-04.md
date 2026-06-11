# Agent 2 Orot Counterpart Preview Source-Lane Constraint

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE

## Target

Constrain the existing Orot counterpart hint patch preview under the newer Agent 13 / Oracle 9 source-lane policy.

## Preview Artifact

- JSON: `reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json`
- Report: `reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.md`
- Builder: `scripts/build_agent2_orot_counterpart_hint_patch_preview.mjs`
- Validator: `scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs`

## Counts

- Candidate preview rows: 31.
- Candidate preview occurrences: 1202.
- Prefix/stem contract rows / occurrences: 12 / 178.
- Project-preferred rows / occurrences: 19 / 1024.
- Missing-linkage rows outside preview: 13.
- Missing-linkage occurrences outside preview: 129.
- Approved patch rows: 0.
- Answer rows emitted: 0.
- Public HUD rows emitted: 0.
- Route JSONL rows emitted: 0.
- Match-percent available rows: 0.

## Validator

Command:

```powershell
node scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json
```

Result:

```text
Agent 2 Orot counterpart hint patch preview validation passed for reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json.
```

## Source-Lane Constraint

This preview is not a release/package candidate under the newer lane policy. It remains blocked from promotion/export until an exact source-family lane review and boundary packet exists.

Preserved constraints:

- New/missed dictionaries are not presumed NC.
- Old excluded dictionary rows are not presumed blocked.
- Actual source lanes must be preserved from source-family evidence.
- Commercial-clean and NC educational rows must remain separated in any future export.
- NC rows may be consumed only from the `noncommercial_educational_candidate` partition with required flags.
- Metadata/link-only rows must not emit definition text.
- Blocked/review rows stay out of candidate text exports.
- Existing preview text is candidate review text only, not accepted gloss/text.

## Exact Blocker

`orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary`

Missing before any approved patch or public/export use:

- Agent 1 source-family / license-lane classification for each row/subset.
- Separate lane partitioning for commercial-clean and NC educational rows.
- Metadata/link-only and blocked/review exclusion rules.
- Agent 6 row/subset boundary.
- Transform run that writes an approved non-public patch artifact.
- Public/runtime review if any public artifact is proposed later.

## Spark-1 Handoff

Spark-1 may rerun the preview validator mechanically. Spark-1 must not promote preview rows to candidate patch rows, answer rows, public HUD rows, route JSONL rows, accepted text, or definition-content rows.

## Agent 6 Boundary

No Agent 6 boundary is opened now.

Future boundary question must be row/subset specific and lane-preserving:

May these exact Agent-1-classified Orot counterpart rows be used/stored/displayed within their assigned source lane while preserving zero answer eligibility, zero accepted gloss/text, zero public emit, source-lane separation, and no route-shard/public/runtime mutation?

Agent 2 does not answer this boundary question.

## Non-Acceptance Boundary

No QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, approved reader-hint patch, or NC commercial authorization is claimed.
