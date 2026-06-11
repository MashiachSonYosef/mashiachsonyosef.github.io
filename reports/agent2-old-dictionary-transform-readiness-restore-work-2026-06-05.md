# Agent 2 Restore Work - Transform Readiness (Old-Dictionary)

Generated: 2026-06-05T23:20:00.000Z

| Field | Value |
| --- | --- |
| target | Agent 2 definition/lemma/reader-hint readiness from Agent 1 classified lanes |
| files used | `reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json`<br>`reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json`<br>`reports/agent2-agent1-transform-lane-handoff-receipt-2026-06-05.json`<br>`reports/agent1-old-dictionary-agent6-boundary-question-packet-2026-06-05.json`<br>`reports/agent2-state.md` |
| lane counts / rows consumed | source_family_rows: 500; audited_occurrences: 8427; commercial_clean_candidate: 500 rows / 10940 occurrences / 0 allowed now; noncommercial_educational_candidate: 214 rows / 4444 occurrences / 0 allowed now; blocked_or_needs_review: 222 rows / 4435 occurrences / 0 allowed now; metadata_or_link_only: 0; consumed definition/lemma/reader-hint now: 0 |
| output artifact path | `reports/agent2-old-dictionary-transform-readiness-restore-work-2026-06-05.json` |
| exact blockers | `old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation`<br>`old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation`<br>`old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation`<br>`old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization`<br>`old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong::missing_independent_source_license_custody_basis` |
| handoff owner | commercial_clean: Agent 10 package intake + Agent 6 exact row/subset boundary/morphology; noncommercial_educational: Agent 1 for NC packet + Agent 6 exact NC boundary; blocked/review: Agent 1 for evidence + Agent 6 for boundary |
| stop condition | No definition/lemma/reader-hint content, no candidate text, no answer/public/runtime/route/export/release action until exact Agent 6 boundary verdict + approved morphology relation + missing source/license/custody evidence are provided. |
| timeout records | `Get-Content ...` `timeout_ms`: 120000, `timed_out`: false, `next_safe_action`: continue blocker-focused readiness handoff. |
