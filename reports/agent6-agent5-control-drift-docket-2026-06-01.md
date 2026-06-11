# Agent 6 Agent 5 Control Drift Docket

Generated: 2026-06-01T00:18:00-04:00
Agent: Agent 6, independent QA/compliance authority

## Verdict

Agent 5 partially accepted the Agent 6 publication correction, but the control board is not current enough for priority relay.

Publication gate wording is correctly tightened as `blocked_no_render`. However, Agent 5 still carries stale public-HUD rank-basis blocker language and stale source-audit scope counts. This creates control drift: Agent 5 can misroute the next execution slot even while recording the publication blocker correctly.

## Findings

### Blocker: Agent 5 control priority is stale

Owner: Agent 5

Evidence:

- `reports/agent6-validation-cycle-2026-06-01.md` says public HUD truth gate passes.
- The same report says current HUD pages: 1281, pages with `article.dataset.rankBasis`: 1281, and pages containing `Rank details`: 0.
- `data/control/pipeline_state.json` still says current bottleneck owner is Agent 4 for `hud_truth_gate`.
- `data/control/pipeline_state.json` still prioritizes rank-basis migration as active blocker.
- `data/control/gate_registry.json` still marks `hud_truth_gate` as `blocked_rank_basis_migration` with 61 present, 1206 missing, and 1204 `Rank details` pages.
- `reports/agent5-pipeline-priority-handoff.md` still says public HUD is not sitewide accepted because only 61/1267 pages have `article.dataset.rankBasis`.

Acceptance condition:

Agent 5 must refresh control surfaces from the latest Agent 6 validation cycle. Public HUD truth may be carried as passed/accepted-with-boundary or monitoring, but not as the active execution blocker unless new evidence supersedes `reports/agent6-validation-cycle-2026-06-01.md`.

### Warning: Source-audit scope count is stale

Owner: Agent 5, then Agent 1

Evidence:

- `reports/agent6-validation-cycle-2026-06-01.md` reports 8 untracked source files and 6716 untracked source units.
- `data/control/pipeline_state.json` and `data/control/gate_registry.json` still refer to 7 untracked source JSON files.
- The untracked source set includes `machzor-rosh-hashanah-ashkenaz.json` with CC-BY material, so the count is not cosmetic.

Acceptance condition:

Agent 5 must update the source-audit scope warning to 8 untracked source files, preserve the file list, and assign Agent 1 to reconcile tracked audit coverage before any source/provenance acceptance claim.

### Pass: Publication blocker wording is correctly recorded

Owner: Agent 5

Evidence:

- `data/control/pipeline_state.json`, `data/control/gate_registry.json`, `data/control/qa_docket_index.json`, and Agent 5 handoff reports record `blocked_no_render`.
- They preserve the Agent 6 acceptance condition: real publication render artifact, rendered rows point to accepted decision rows, `license_profile.direct_translation_use_ok=true`, manifest source match, attribution bundle where required, and exclusion of `workbench_ok_publication_review` rows unless an explicit output-license decision exists.

Acceptance condition:

Keep this wording. Do not downgrade publication from `blocked_no_render` until a real render artifact passes the render-contract gate.

## Corrected Priority Order

1. Agent 5 corrects control drift: publication remains the top release blocker; stale HUD rank-basis blocker language must be removed or downgraded to monitoring.
2. Agent 1 receives the next provenance correction: reconcile 8 untracked source files and the Kaikki/report-truth warnings.
3. Agent 4 is not the current top blocker unless new live HUD evidence contradicts the Agent 6 validation cycle.
4. Agent 2 and Agent 3 remain monitor-only unless new definition authority or usage-boundary leaks appear.

## Relay Prompt

```text
Agent 5, Agent 6 accepts that you recorded the publication blocker, but your control board still has stale HUD and source-scope state. Refresh `pipeline_state.json`, `gate_registry.json`, and priority handoffs from `reports/agent6-validation-cycle-2026-06-01.md`: public HUD truth is no longer the active rank-basis blocker on that evidence set because it reports 1281/1281 pages with article.dataset.rankBasis and 0 Rank details pages. Keep publication as top release blocker at blocked_no_render. Also update the source-audit scope warning from 7 to 8 untracked source files and preserve the untracked file list, including the CC-BY Machzor source. Do not route Agent 4 as the immediate execution slot unless new evidence supersedes Agent 6's validation cycle.
```

