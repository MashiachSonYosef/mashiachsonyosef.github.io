# Agent 5 Workbench Pipeline Master Plan

Generated: 2026-05-31T13:54:45-04:00

## Real Goal

The real goal is a repeatable pipeline, not a one-time HUD fix.

The pipeline should turn source texts into a dense translation workbench, then later into publishable translation decisions, without recollecting evidence.

## Pipeline Principle

Every artifact must know its role.

- Source text is not evidence.
- Evidence is not a definition.
- A definition candidate is not answer authority.
- Usage navigation is not definition authority.
- Workbench display is not publication clearance.
- Accepted translation text is the narrowest output layer.

## End-To-End Pipeline

| stage | output | owner | gate | QA authority |
|---|---|---|---|---|
| 1. Source ingestion | normalized source records, source refs, license metadata | Agent 1 | source/render hygiene gate | Agent 6 for compliance samples |
| 2. Render shell | generated pages, anchors, HUD container | Agent 1 + Agent 4 | render traceability gate | Agent 6 for representative UI samples |
| 3. Definition route build | answer/evidence route cards | Agent 2 | route release gate | Agent 6 for authority samples |
| 4. Public route lookup | public manifest and shards | Agent 2 | release stamp + card/shard reconciliation | Agent 6 for source/license samples |
| 5. Usage evidence graph | selected handoff packages | Agent 3 | selected-target gate | Agent 6 for usage-source samples |
| 6. Usage navigation | concordance links, snippets, statuses, route IDs | Agent 3 | usage navigation gate | Agent 6 for link/context samples |
| 7. HUD integration | Definition, morphology, usage, source/license lanes | Agent 4 | token integrity + lane authority gate | Agent 6 for HUD acceptance |
| 8. Workbench QA | blocker/warning/polish docket | Agent 6 | QA acceptance gate | Agent 6 |
| 9. Translation memory | decision rows with anchors, candidates, license profile | Agent 5 + future translation lane | translation decision gate | Agent 6 for publication samples |
| 10. Publication candidate | accepted translation rows + attribution bundle | future translation lane | publication/compliance gate | Agent 6 + human/legal review |

## Recurring Cycle

Each cycle should follow this order:

1. Freeze inputs for the cycle.
2. Generate/update one layer only.
3. Write a release or handoff stamp.
4. Run that layer's narrow validator.
5. Agent 5 updates the control board and QA docket.
6. Agent 6 samples and accepts/blocks.
7. Agent 5 relays exact corrections to the owning production agent.
8. Repeat only after the blocker is closed or explicitly deferred.

## Gates

Source/render hygiene gate:

- source records have refs and license fields.
- generated page anchors are stable.
- render outputs are traceable to source and render script.
- generated-page drift is explained.

Route release gate:

- release stamp exists.
- input freeze exists.
- public card count and shard count reconcile.
- `answer_eligible` / `answer_role` are preserved.
- evidence-only/ambiguous rows cannot become Definition authority.

Usage navigation gate:

- selected targets only.
- supported/candidate/weak rows visible; ambiguous rows audit-only.
- occurrence links resolve.
- route links resolve when present.
- no definition authority emitted by Agent 3.

HUD truth gate:

- clicked surface occurrence identity is preserved.
- maqaf/hyphen/prefix/suffix behavior is explicit.
- Definition slot only reads Agent 2 authority.
- Usage Elsewhere reads Agent 3 navigation rows.
- source/license/citation rows remain visible.
- accessibility semantics match behavior.

Translation decision gate:

- decision row has source anchor.
- decision row has surface occurrence ID.
- decision row has status.
- candidate/ambiguous rows are not accepted translation text.
- license profile exists.

Publication/compliance gate:

- only accepted rows can publish.
- `license_profile.direct_translation_use_ok=true`.
- attribution bundle present when required.
- review-needed/copyleft rows cannot silently publish.
- Agent 6 accepts compliance boundary.

## Current Pipeline State

Green/report-backed:

- Agent 2 route release candidate: `hud-route-rc-2026-05-31T16-55-29-957Z`.
- Public route lookup: 539,661 cards, 7,990 shards.
- Agent 3 usage navigation: 2,390 concordance rows, 0 bad URLs, 0 unresolved route links.
- Translation-memory scaffold: source anchors, license profiles, attribution manifest exist.

Yellow:

- Agent 3 source freshness is bounded; not site-wide exhaustive.
- Route-HUD page strict validation has inventory/count drift: current report says 1,239 route-HUD pages but latest full strict validator count is 1,235.
- Compliance and role-based gate models are pending Agent 6 acceptance.

Red/current bottleneck:

- Agent 4 HUD truth gate: token identity, maqaf/hyphen/prefix/suffix behavior, usage lane rendering, and accessibility semantics still need Agent 6 acceptance.

## Optimized Workflow Now

Do not expand broad data while the display truth gate is red.

Immediate sequence:

1. Wait for Agent 6 response on compliance and role-gate prompts.
2. Keep Agent 2 frozen unless Agent 6 finds a route/source/license blocker.
3. Keep Agent 3 in usage-navigation maintenance unless Agent 6 finds a concordance/source blocker.
4. Push Agent 4 only after Agent 6's QA criteria are clear: fix token identity, lane authority, and accessibility semantics.
5. Agent 5 updates validators/contracts to encode Agent 6's accepted gates.

## Long-Term Translation Path

Translation mode should be a separate downstream lane.

It should consume:

- Agent 1 source anchors and license metadata.
- Agent 2 answer-eligible definitions.
- Agent 3 usage navigation/context.
- Agent 4 verified HUD semantics.
- Agent 5 translation-memory contracts.
- Agent 6 accepted QA/compliance gates.

It should produce:

- candidate translation decisions.
- accepted translation decisions.
- rejection/ambiguity reasons.
- attribution bundle.
- publication risk report.

It should not:

- publish directly from route cards.
- publish directly from usage evidence.
- treat workbench display as legal clearance.
- rely on untyped snippets.

## Agent 5 Role In The Pipeline

Agent 5 is not the QA authority and not another production lane.

Agent 5 owns:

- pipeline architecture.
- release and handoff gates.
- relay state.
- Agent 6 QA briefs.
- cross-lane bottleneck calls.
- small validators/contracts that prevent layer collapse.

Agent 5 must turn every Agent 6 blocker into:

```text
Owning lane:
Required correction:
Evidence:
Acceptance condition:
Smallest validation step:
```

## Next Control Artifacts To Add

- `pipeline_state.json`: machine-readable current stage/gate status.
- `qa_docket_index.json`: Agent 6 prompts, status, findings, owners, acceptance conditions.
- `relay_state.json`: proposed/sent/acknowledged/observed/obsolete state for each worker prompt.
- `gate_registry.json`: canonical names and acceptance rules for all gates.

These should be small additive sidecars, not replacements for current reports.
