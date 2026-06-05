# Agent 3 Definition Workbench Usage Collision Integrity Digest

Generated: 2026-06-02T12:53:35.546Z

## Status

- Status: evidence-ready
- Focus token: ראשית
- Boundary: integrity/drift digest only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.

## Counts

- Digest entries: 12
- Artifact keys: 4
- Data/report/validator entries: 4/4/4
- Files present / SHA-256 present: 12/12
- Evidence-ready data artifacts: 4/4
- Total bytes: 4886939
- Manifest reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Digest Entries

| artifact | role | bytes | sha256 | path |
|---|---|---:|---|---|
| focus_collision_audit | data | 3398674 | 37109b642dd13adb2444582069a87f84d83f7c93caddb2b2f37687a8128fc350 | data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json |
| focus_collision_audit | report | 6291 | e9c3591fb61774375105051fde6744ddfca044643cab013081e0c2cfae5dc9ed | reports/agent3-definition-workbench-usage-focus-collision-audit-reshit.md |
| focus_collision_audit | validator | 9778 | 1178f5b5e411b78c62cc5b78725d2fa882cb8f68c209941d4e6ebec4e30fe1cc | scripts/validate_agent3_definition_workbench_usage_focus_collision_audit.mjs |
| collision_review_queue | data | 346343 | 46059bfd0756c7c9849a7c2471c11f97915c89796bd5206ae8e615db1a0011a5 | data/definitions/agent3-definition-workbench-usage-collision-review-queue-reshit.json |
| collision_review_queue | report | 15633 | 8a1d70364e38d504e3cc50844226de08e23bbf1d735640822e17fcd38411cd47 | reports/agent3-definition-workbench-usage-collision-review-queue-reshit.md |
| collision_review_queue | validator | 9935 | e72520334f68e84786df46b71a0392130069170818c999e5787902c09f0a088d | scripts/validate_agent3_definition_workbench_usage_collision_review_queue.mjs |
| collision_review_reverse_index | data | 1052003 | a330bc43630bae32c89175f80ea2cf7073caad51582157db24fca2dfe8f3b2d5 | data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json |
| collision_review_reverse_index | report | 12056 | d0572905cd33956fb3b57b76e326e929631f8630ae0690e00709b12f19690ea0 | reports/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.md |
| collision_review_reverse_index | validator | 12676 | e8e03267fb4aef45610b6cbbc180f7332a642da5190053e8ac9c329b7413d019 | scripts/validate_agent3_definition_workbench_usage_collision_review_reverse_index.mjs |
| collision_handoff_manifest | data | 11420 | e4d211589d4f5543f95d18529a5007fc90ea2b78e2e8de53a5772cb59b8440b6 | data/definitions/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.json |
| collision_handoff_manifest | report | 3281 | 653dda74e3ede9ef28dde0398dac3f2d42c89a53109a97a38bd9223024363501 | reports/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.md |
| collision_handoff_manifest | validator | 8849 | 4490e39ea13b4771076115314ec25ffa08f572b23dc3b68aae7fb6bf7f2823bd | scripts/validate_agent3_definition_workbench_usage_collision_handoff_manifest.mjs |

## Checks

| check | status | detail |
|---|---|---|
| digest_entries_present | passed | entries 12 |
| all_files_present | passed | present 12/12 |
| roles_complete | passed | data/report/validator 4/4/4 |
| hashes_and_sizes_present | passed | hash/bytes/total 12/12/4886939 |
| data_artifacts_evidence_ready | passed | evidence-ready data 4/4 |
| manifest_boundary_zero | passed | manifest reader/payload/forbidden 0/0/0 |
| manifest_no_side_effects | passed | manifest source/broad/queue/submitted 0/0/0/0 |
| digest_boundary_zero | passed | digest reader/payload/forbidden 0/0/0 |
| digest_no_side_effects | passed | digest source/broad/queue/submitted 0/0/0/0 |

This digest is Agent 3 QA/drift scaffolding only. It records file identity for usage-navigation artifacts and does not mutate queues, inspect source text, or convert usage rows into definitions.
