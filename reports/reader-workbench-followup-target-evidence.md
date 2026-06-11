# Reader Workbench Follow-Up Target Evidence

Updated: 2026-06-01

## Scope

- Purpose: prepare the next bounded Reader Workbench evidence packet after Agent 6 accepted the first eight representative pages only.
- Target file: `data/control/reader_workbench_followup_targets.json`.
- Status: ready for Agent 5 packaging toward Agent 6, not accepted.
- Boundary: local-only Guided Gloss Assembly; `publication_status=not_a_translation`.
- Not claimed: publication readiness, accepted translation text, broad rollout, browser click proof, or deferred-page acceptance.

## Candidate Follow-Up Pages

- `tanakh/rashi-on-genesis/index.html`
- `halakhah/abudarham/index.html`
- `kabbalah/ketem-paz-on-zohar/index.html`
- `rav-kook/orot-ha-kodesh/index.html`

Blocked:

- `other/beer-hagolah/index.html`
- Blockers: `source_not_tracked`, `missing_reader_workbench_markers`.

## Checks

- `node --check scripts\validate_reader_workbench_followup_targets.mjs` passed.
- `node scripts\validate_reader_workbench_followup_targets.mjs` passed: 4 included targets, 1 blocked target, 0 warnings.
- `node --check scripts\validate_reader_workbench_expansion_sample.mjs` passed.
- `node scripts\validate_reader_workbench_expansion_sample.mjs --targets data/control/reader_workbench_followup_targets.json --work-id abudarham` passed.
- `node scripts\validate_route_hud_page.mjs --page tanakh\rashi-on-genesis\index.html --page halakhah\abudarham\index.html --page kabbalah\ketem-paz-on-zohar\index.html --page rav-kook\orot-ha-kodesh\index.html` passed for 4 pages.
- `node scripts\validate_reader_workbench_runtime.mjs` passed.
- `node scripts\validate_reader_workbench_boundary.mjs` passed with 21 checks.
- `node scripts\validate_reader_workbench_deferred_targets.mjs` passed: 4 ready after rerender, 1 blocked.
- `node scripts\audit_route_hud_click_contract.mjs --page <follow-up page> --sample-limit 36` passed for all four candidate pages.
- `node --check scripts\validate_reader_workbench_followup_continuity.mjs` passed.
- `node scripts\validate_reader_workbench_followup_continuity.mjs` passed: 4 included targets, 1 blocked target, 0 issues, 0 warnings, 52/52 sampled answer/source-license rows.

## Export / Import Sample

- Target: `halakhah/abudarham/index.html`.
- Source: `data/sources/abudarham.json`.
- Import count: 1.
- Export selection count: 1.
- Reimport count: 1.
- Preserved source fields: `source_name`, `source_id`, `source_url`, `license`, `license_url`.
- Preserved authority fields: `answer_eligible=true`, `answer_role=answer`, `publication_status=not_a_translation`.

## Click-Contract Prevalidation

- `tanakh/rashi-on-genesis/index.html`: pass; 0 paragraph count mismatches, 0 alignment failures, 16 sampled answer-eligible source/license rows, 0 missing lookup shards.
- `halakhah/abudarham/index.html`: pass; 3 paragraph split-token alignments, 0 alignment failures, 16 sampled answer-eligible source/license rows, 2 no-shard lookup coverage metrics.
- `kabbalah/ketem-paz-on-zohar/index.html`: pass; 3 paragraph split-token/hyphen alignments, 0 alignment failures, 9 sampled answer-eligible source/license rows, 4 no-shard lookup coverage metrics.
- `rav-kook/orot-ha-kodesh/index.html`: pass; 3 paragraph split-token/hyphen alignments, 0 alignment failures, 11 sampled answer-eligible source/license rows, 1 no-shard lookup coverage metric.

## Continuity Audit

- Report: `reports/reader-workbench-followup-continuity-audit.md`.
- JSON: `reports/reader-workbench-followup-continuity-audit.json`.
- Summary: passed with 0 issues, 0 warnings, 0 paragraph alignment failures, 9 split-token/hyphen alignments, 52 sampled answer-eligible rows, and 52 sampled source/license rows.

## Acceptance Boundary

- This packet is evidence for a follow-up Agent 6 review, not acceptance.
- The four candidate pages should not be called accepted until Agent 6 writes that verdict.
- `beer-hagolah` should remain excluded until Agent 1 resolves source custody and a complete Reader Workbench page exists.
- Static click-contract prevalidation is not live browser click proof.
- Publication remains `blocked_no_render`.
