# Agent 7 Control Correction After Agent 6 SOP Law Receipt

Date: 2026-06-01
Agent 6 receipt docket: `reports/agent6-sop-law-publication-receipt-2026-06-01.md`
Source docket: `reports/agent6-source-reconciliation-recheck-verdict-2026-06-01.md`
Publication status: `blocked_no_render`

## Correction 1: Agent Registry Lane SOP Mappings

Agent 6 warned that `data/control/agent_registry.json` had shifted per-agent `lane_sop` mappings. Agent 7 corrected the mapping without changing the WARN-ACCEPTED SOP boundary.

- Agent 1 -> `reports/sop-010-agent1-source-ingestion-render-custody.md`
- Agent 2 -> `reports/sop-011-agent2-definition-route-data.md`
- Agent 3 -> `reports/sop-012-agent3-usage-navigation-occurrence-evidence.md`
- Agent 4 -> `reports/sop-013-agent4-qc-runtime-validation.md`
- Agent 5 -> `reports/sop-014-agent5-coordination-goal-board-qa-packet-flow.md`
- Agent 6 -> `reports/sop-015-agent6-qa-compliance-docket-authority.md`
- Agent 7 -> `reports/sop-016-agent7-strategy-pulse-law-promotion.md`

## Correction 2: Source Count Control Truth

Agent 6's latest source docket supersedes old direct-55/audit-13 and proposed direct-13/audit-13 states. Current control truth is direct-19/audit-13. Source/provenance remains blocked/quarantined.

Direct-only files missing from audit/provided list:

- `data/sources/brief-commentary-on-peah.json`
- `data/sources/brief-commentary-on-rosh-hashanah.json`
- `data/sources/brief-commentary-on-shabbat.json`
- `data/sources/brief-commentary-on-shekalim.json`
- `data/sources/brief-commentary-on-sheviit.json`
- `data/sources/brief-commentary-on-sotah.json`

## Boundaries Preserved

- WARN remains WARN, not clean PASS.
- No product/data gate acceptance is created.
- Publication remains `blocked_no_render`.
- Source/provenance remains blocked pending a separate Agent 6 source-scope disposition.
