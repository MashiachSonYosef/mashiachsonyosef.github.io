# Agent 6 Usage Route Concentration Docket

Generated: 2026-05-31T14:45:27-04:00

## Purpose

This Agent 6 autonomous QA pass checks the active Agent 3 downstream boundary:

- whether usage-navigation artifacts remain usage-only rather than becoming definition authority,
- whether route-linked usage rows are diversified or concentrated into one upstream route answer,
- whether dormant export paths could bypass the translation-memory publication gate later.

No implementation changes were made.

## Acceptance Call

Agent 3's current usage-navigation row model is acceptable as usage-only.

Agent 3's current selected concordance is not operationally independent from Agent 2 because every route-linked row points to the same upstream Kaikki route answer.

Overlay export is currently dormant, but its schema is still a latent bypass path for future publication if it is repopulated without translation-memory gates.

## Findings

### Warning: Agent 3 row model preserves usage-only authority correctly

Owning lane: Agent 3

Evidence:

- `data/workbench-evidence/public-handoff-index.json` explicitly says:
  - `artifact_role: usage_evidence_index`
  - `final_ranking_authority: false`
  - `visible_answer_authority: false`
  - `carries_text_rows: false`
  - consumers must not treat frame labels or usage notes as definitions or generate English translations from this contract.
- `data/workbench-evidence/usage-concordance.json` uses:
  - `row_role: "usage_navigation"`
  - `observed_usage_only: true`
  - `authority.usage_navigation_only: true`
  - `authority.ranks_routes: false`
  - `authority.selects_visible_result: false`
- `reports/workbench-usage-navigation-handoff.md` and `reports/workbench-smoke-pipeline-validation.md` both preserve the same boundary in reports and validations.

Control interpretation:

- The usage layer is not pretending to be a definition layer in its own contract.
- This is an acceptable warning-free result at the row-model level.

Acceptance condition:

- Keep the explicit anti-authority fields in the public handoff index and concordance row model.
- Do not compress them away in later “cleanup” or export steps.

### Warning: all 2,390 route-linked usage rows depend on one upstream route ID

Owning lanes: Agent 3 and Agent 5

Evidence:

- `reports/workbench-usage-route-link-check.md` reports:
  - 2,390 route-linked rows
  - 2,390 resolved route links
  - 1 unique route ID
- That route ID is `def-kaikki-lemma-e4f94cd5131316a8`.
- `reports/workbench-usage-sample-index.md` shows both clusters:
  - `reshit-opening-time-order`
  - `reshit-first-yield-priority`
  both resolve to the same route ID.
- `data/workbench-evidence/usage-concordance.json` confirms each sampled row carries `agent2_route_ids: ["def-kaikki-lemma-e4f94cd5131316a8"]`.

Control interpretation:

- Agent 3 is not copying route definitions into usage rows, which is good.
- But the current selected handoff is effectively a one-route dependency graph. If that one upstream route card is wrong, overbroad, or policy-blocked, the entire selected concordance inherits the same weakness.

Acceptance condition:

- Agent 5 should document this as a concentration risk, not a broad lexical coverage win.
- Agent 3 should not claim semantic plurality or route independence while the selected handoff collapses to one upstream route ID.
- Agent 6 should re-sample after additional route diversity exists, or after Agent 5 explicitly freezes this lane as a narrow seeded pilot only.

### Warning: the one upstream route ID is the same Kaikki route already carrying publication-review risk

Owning lanes: Agent 2, Agent 3, and Agent 5

Evidence:

- The unique usage-linked route ID is `def-kaikki-lemma-e4f94cd5131316a8`.
- The earlier Agent 6 route/publication review already identified Kaikki-based answer authority as a publication-control issue where the route layer is not itself gated by `license_profile.direct_translation_use_ok`.
- The current selected usage-navigation system therefore depends entirely on a route answer family sourced from Kaikki/Wiktionary `CC BY-SA 4.0 / GFDL`.

Control interpretation:

- This is not a public HUD labeling blocker by itself because the usage layer still presents observed Hebrew context and links.
- It is a downstream governance warning because the usage system is not merely “linked to route data” in the abstract; it is concentrated on one share-alike/copyleft-reviewed route card family.

Acceptance condition:

- Agent 5 must keep Agent 3 in usage-navigation mode only.
- Agent 5 must not let the usage-concordance link graph be described as independent semantic validation of the route answer.
- Any future translation or summary layer must still pass through translation-memory license gates, not the usage route link.

### Warning: source freshness remains stale, so selected usage claims are not exhaustive

Owning lane: Agent 5

Evidence:

- `data/workbench-evidence/public-handoff-index.json` reports `corpus_exhaustive: false` and `source_freshness.status: stale`.
- `reports/workbench-smoke-pipeline-validation.md` reports source freshness stale with current source files greater than artifact scan and modified/created-after-artifact counts still nonzero.

Control interpretation:

- This does not break the selected handoff contract.
- It does block any claim that the current usage-navigation layer is current-corpus exhaustive.

Acceptance condition:

- Keep every report and relay statement scoped to selected smoke/seeded coverage only.

### Warning: overlay export is a latent bypass path, but currently dormant

Owning lanes: Agent 4 and Agent 5

Evidence:

- `scripts/generate_overlay_exports.mjs` exports `translation`, `translator_notes`, and `done_status` directly from overlay JSON.
- Unlike translation-memory rows, overlay exports do not carry:
  - `decision_status`
  - `license_profile`
  - `direct_translation_use_ok`
  - `not_a_translation_yet`
- Current runtime state is dormant:
  - root `overlay-export.csv` contains only the header row
  - sampled `data/overlays/*.json` files are effectively empty shells
  - no active overlay translation rows were found in the current workspace state

Control interpretation:

- This is not an active publication leak today.
- It is still a latent architectural bypass because the export schema can emit translation-like columns without the stronger translation-memory contract.

Acceptance condition:

- If overlay export is ever repopulated for public release use, Agent 5 must either:
  - route that output through translation-memory validation first, or
  - explicitly declare overlay exports non-authoritative workspace artifacts only.

## Relay For Agent 5

Tell Agent 3:

- Row-level usage-only discipline is holding.
- Do not represent the current handoff as semantically independent from Agent 2 while all rows point to one route ID.

Tell Agent 2:

- The Agent 3 handoff currently concentrates entirely on one of your Kaikki-backed route answers.
- Any weakness in that route answer propagates through the whole selected usage lane.

Tell Agent 4:

- Overlay export is dormant now, but if it is revived for public use, it cannot skip the stronger translation-memory controls.

Tell Agent 5:

- Current Agent 3 status is acceptable as usage-only but fragile as a dependency graph.
- The correct management statement is: “selected concordance passes contract and link integrity, but semantic/risk concentration remains high because all rows collapse to one Kaikki-backed upstream route.”
