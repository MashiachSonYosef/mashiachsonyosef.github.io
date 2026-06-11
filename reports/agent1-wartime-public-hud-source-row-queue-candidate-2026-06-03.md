# Agent 1 Wartime Public-HUD Source Row Queue Candidate

Generated: 2026-06-04T00:15:53.048Z

Boundary: candidate for Agent 5 relay / Agent 6 review only. This does not mutate the validation queue, stage files, commit, render, publish, run browser/runtime validation, or claim source/provenance acceptance.

## Requested Queue Item

- Request ID: `agent6-agent1-public-hud-source-row-review`
- Gate: `source_provenance_custody_gate/public_hud_route_card_source_row_gate`
- Status: `candidate_for_agent5_queue_relay_awaiting_agent6_review`
- Requested verdict: `pass_warn_block_public_hud_source_row_evidence_only`

## Current Evidence Summary

- Surfaces checked: 5
- JSON endpoints checked: 20
- JSON endpoints OK: 20
- Route cards extracted: 57
- Source/license rows extracted: 80
- Missing required source/license fields: 0
- Unique source labels: `Abudarham. Lisbon, 1489.`, `Ahavat Chesed -- Torat Emet`, `Akeidat Yitzchak, Pressburg 1849`, `Hebrew Wiktionary data via Kaikki/Wiktextract`, `Krakow, 1903`, `OpenScriptures morphHB`
- Unique licenses: `CC BY 4.0`, `CC BY-SA 4.0 / GFDL`, `Public Domain`

## Surfaces

- #1 `tanakh/deuteronomy/`: 24 route cards, 35 source/license rows, 0 missing source/license fields, shard `data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json`
- #2 `tanakh/genesis/`: 15 route cards, 20 source/license rows, 0 missing source/license fields, shard `data/public-hud/genesis/route-lookup/shards/05e8-05d0-05e9.json`
- #3 `tanakh/exodus/`: 6 route cards, 6 source/license rows, 0 missing source/license fields, shard `data/public-hud/exodus/route-lookup/shards/05e9-05de-05d5.json`
- #4 `tanakh/leviticus/`: 3 route cards, 5 source/license rows, 0 missing source/license fields, shard `data/public-hud/leviticus/route-lookup/shards/05d0.json`
- #5 `tanakh/numbers/`: 9 route cards, 14 source/license rows, 0 missing source/license fields, shard `data/public-hud/numbers/route-lookup/shards/05d9-05d4-05d5.json`

## Evidence Artifacts

- reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.md
- reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.json
- reports/agent1-wartime-public-hud-source-row-evidence-validator-result-2026-06-03.json
- reports/agent1-wartime-source-provenance-surface-blocker-map-2026-06-02.md
- reports/agent1-state.md
- scripts/build_agent1_wartime_public_hud_source_row_evidence.mjs
- scripts/validate_agent1_wartime_public_hud_source_row_evidence.mjs
- scripts/build_agent1_wartime_public_hud_source_row_queue_candidate.mjs

## Known Risks

- The packet uses live public-HUD JSON endpoints, so it records current source-row evidence and can drift after fetch time.
- Exodus and Leviticus current live JSON was HTTP 200 in the evidence packet even though older local prep reports recorded 404; that drift needs Agent 6 or Agent 7 interpretation before any runtime/publication claim.
- Visible source/license rows do not clear the separate 23 untracked source-file tracking review or six modified tracked license-normalization review.
- Agent 1 evidence and this queue candidate are not Agent 6 acceptance.

## Must Not Be Accepted

- source/provenance custody
- source/provenance acceptance
- source publication
- source-file tracking approval
- QA acceptance
- public/runtime acceptance
- publication readiness
- route publication support
- Definition authority
- product/data acceptance
- usage-as-definition authority
- translation output
- accepted translation text

## Agent 8 Callback

- status: public-HUD source-row queue candidate produced; evidence-ready / awaiting-Agent-6 only
- artifact: `reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.md`
- machine artifact: `reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.json`
- blockers: Agent 6 has not docketed this source-row evidence; source/provenance custody remains unresolved; runtime/publication status is out of Agent 1 scope
- next action needed: Agent 5/Agent 8 may relay `agent6-agent1-public-hud-source-row-review` to Agent 6 if the active public-reader slice needs source/provenance-sensitive row review
- continue condition: continue without render, staging, commit, publication, runtime validation, or custody acceptance
