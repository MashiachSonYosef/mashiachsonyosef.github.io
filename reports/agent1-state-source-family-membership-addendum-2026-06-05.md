# Agent 1 State Addendum - Source-Family Membership Manifest - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | exact source-family token membership for old-dictionary reaudit | `reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json`; validator `scripts/validate_agent1_old_dictionary_source_family_membership_manifest.mjs` -> `reports/agent1-old-dictionary-source-family-membership-manifest-validation-result-2026-06-05.json` | source-family memberships are nonexclusive and still require Agent 6 boundary before any candidate use | stop before Agent 6 delivery, Agent 2 transform, candidate text, source/license/legal acceptance, Definition/runtime/publication/product/answer acceptance, queue mutation, render mutation, staging, or release action | current Agent 1 `019e975d-dc9f-7020-a7c8-885d083a837e`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

`old-dictionary-excluded-row-license-lane-reaudit source-family membership manifest` | `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json`; `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`; `reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json`; `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json` | 5 source families; nonexclusive family memberships 936 rows / 19819 occurrences; unique preview 500 rows / 8427 occurrences; Jastrow 210 / 4474; BDB Dictionary 221 / 4418; BDB Aramaic Dictionary 69 / 2048; Klein Dictionary 214 / 4444; BDB Augmented Strong 222 / 4435 | `commercial_clean_candidate` 3; `noncommercial_educational_candidate` 1; `metadata_or_link_only` 0; `blocked_or_needs_review` 1 | `jastrow_dictionary_missing_future_agent6_candidate_use_boundary_and_morphology_relation`; `bdb_dictionary_missing_future_agent6_candidate_use_boundary_and_morphology_relation`; `bdb_aramaic_dictionary_missing_future_agent6_candidate_use_boundary_and_morphology_relation`; `klein_dictionary_missing_agent6_nc_boundary_no_commercial_authorization`; `bdb_augmented_strong_missing_exact_source_license_custody_linkage` | Agent 2 blocked until exact lane evidence plus Agent 6 boundary; Agent 6 future boundary owner; Agent 10 package assembly only | zero Agent 6 delivery, zero transform rows, zero candidate-text rows, zero release route

Proof:

- Source-family membership validator result is `ok: true` as of `2026-06-05T13:38:48.183Z`.
- Klein remains `noncommercial_educational_candidate`, `derived_from_nc=true`, `commercial_export_allowed_now=false`, and `attribution_required=true`.
- BDB Augmented Strong remains `blocked_or_needs_review`.
- No QA, source/license/legal, Definition, runtime, publication, product, answer, accepted gloss/text, NC commercial authorization, queue, staging, render, or release acceptance is claimed.

State note:

- Direct patching of `reports/agent1-state.md` for this source-family manifest addendum failed during this turn, so this addendum preserves the recall pointer without mutating queue/runtime/public surfaces.
