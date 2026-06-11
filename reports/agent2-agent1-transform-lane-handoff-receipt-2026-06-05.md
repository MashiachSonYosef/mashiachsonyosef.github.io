# Agent 2 Agent1 Transform Lane Handoff Receipt

Generated: 2026-06-05T23:59:59.995Z

Target: old-dictionary-excluded-row-license-lane-reaudit transform-lane handoff
Status: agent1_transform_lane_handoff_consumed_as_nonpublic_planning_evidence_waiting_exact_boundary

| target | required Agent1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |
| --- | --- | --- | --- | --- | --- |
| old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary | row_subset_id, source_family, license_lane, transform_lane, evidence_path, occurrences, derived_from_nc, commercial_export_allowed, attribution_required, corpus_contamination, agent6_boundary_required, agent2_transform_allowed_now, answer_eligible, public_emit, missing_evidence, handoff_owner | consume exact row/subset evidence and release Agent2 nonpublic definition/lemma/reader-hint package only after Agent6 exact boundary + approved morphology relation | none | Agent 10 release owner then Agent 6 boundary | Stop at Agent2 transform-lane handoff receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, or release action. |
| old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary | row_subset_id, source_family, license_lane, transform_lane, evidence_path, occurrences, derived_from_nc, commercial_export_allowed, attribution_required, corpus_contamination, agent6_boundary_required, agent2_transform_allowed_now, answer_eligible, public_emit, missing_evidence, handoff_owner | consume exact row/subset evidence and release Agent2 nonpublic definition/lemma/reader-hint package only after Agent6 exact boundary + approved morphology relation | none | Agent 10 release owner then Agent 6 boundary | Stop at Agent2 transform-lane handoff receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, or release action. |
| old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary | row_subset_id, source_family, license_lane, transform_lane, evidence_path, occurrences, derived_from_nc, commercial_export_allowed, attribution_required, corpus_contamination, agent6_boundary_required, agent2_transform_allowed_now, answer_eligible, public_emit, missing_evidence, handoff_owner | consume exact row/subset evidence and release Agent2 nonpublic definition/lemma/reader-hint package only after Agent6 exact boundary + approved morphology relation | none | Agent 10 release owner then Agent 6 boundary | Stop at Agent2 transform-lane handoff receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, or release action. |
| old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary | row_subset_id, source_family, license_lane, transform_lane, evidence_path, occurrences, derived_from_nc, commercial_export_allowed, attribution_required, corpus_contamination, agent6_boundary_required, agent2_transform_allowed_now, answer_eligible, public_emit, missing_evidence, handoff_owner | consume as separate NC educational partition only; no commercial-clean transforms and no candidate content until Agent6/Agent 1 NC boundary packet confirms | Agent 6/public boundary before any display/storage/public/answer/export behavior | Agent 1 for NC lane packet; Agent 6 for exact NC row/subset boundary | Stop at Agent2 transform-lane handoff receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, or release action. |
| old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong | row_subset_id, source_family, license_lane, transform_lane, evidence_path, occurrences, derived_from_nc, commercial_export_allowed, attribution_required, corpus_contamination, agent6_boundary_required, agent2_transform_allowed_now, answer_eligible, public_emit, missing_evidence, handoff_owner | remain blocked/review hold until independent source/license/custody and Agent6 boundary are supplied | independent source/license/custody basis, source URL or version source, license label and allowed fields, Agent 6 boundary if evidence appears | Agent 1 if evidence appears; otherwise blocked/review | Stop at Agent2 transform-lane handoff receipt. Do not transform, store candidate text, store definition/lemma/reader-hint content, mark answers, write routes/shards, mutate runtime/public/source/token-index/lexical files, export candidate text, claim accepted text, commercial export, or release action. |

## Counts

- Source family count: 5.
- Audited rows: 500.
- Audited occurrences: 8427.
- Commercial-clean source families: 3.
- Noncommercial educational source families: 1.
- Blocked/review source families: 1.

## Exact Blockers

- old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary: Remain out of Agent 2 candidate text transform until missing source/license/custody evidence and Agent 6 boundary are supplied.
- old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong: Remain out of Agent 2 candidate text transform until missing source/license/custody evidence and Agent 6 boundary are supplied.

## Non-Acceptance Boundary

- No Definition authority
- No answer acceptance
- No answer eligibility
- No source/license/legal acceptance
- No accepted gloss/text
- No public/runtime mutation
- No route-shard edit
- No candidate text export
- No definition/lemma/reader-hint content storage
- No commercial export authorization
- No NC commercial authorization
- No release action

