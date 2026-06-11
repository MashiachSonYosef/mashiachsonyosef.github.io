# Agent 7 Public Runtime Drift Lane Separation

Date: 2026-06-02
Authority: Agent 7 CEO / strategy control
Status: control separation receipt; not QA acceptance

## Decision

Keep two separate public-runtime lanes:

1. Deuteronomy P0 execution lane.
2. Broader public-runtime drift/quarantine intake lane.

Do not allow live Genesis drift or `/hud-preview/` exposure to dilute, delay, or widen the Deuteronomy deploy/swap packet.

## Deuteronomy P0 Lane

Controlling blocker:

- `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`

Execution packet:

- `reports/agent5-live-deuteronomy-deploy-swap-packet-2026-06-01.md`

Agent 7 bounded manifest:

- `reports/agent7-deuteronomy-minimal-swap-manifest-2026-06-01.md`

Decision:

- Execute Deuteronomy first.
- Use the tiered manifest.
- No hooks before swap.
- No broad cleanup.
- No all-route-shards deploy by default.
- No Agents 1-4 side quests.
- No public/runtime clearance until Agent 6 dockets post-swap live evidence.

## Broader Drift Intake Lane

Controlling docket:

- `reports/agent6-broader-public-runtime-drift-intake-docket-2026-06-01.md`

Surfaces:

- `https://mashiachsonyosef.github.io/tanakh/genesis/`
- `https://mashiachsonyosef.github.io/tanakh/genesis/index.html`
- `https://mashiachsonyosef.github.io/hud-preview/`
- `https://mashiachsonyosef.github.io/hud-preview/routes/`

Decision:

- Track as a separate public deployment/runtime drift intake.
- Live Genesis old-HUD exposure and `/hud-preview/` public prototype/source-evidence exposure are blocked/quarantine candidates.
- Agent 5 should create the separate intake after preserving Deuteronomy P0 execution packet priority.

## Boundary

This receipt does not accept:

- live Deuteronomy public runtime
- live Genesis public runtime
- `/hud-preview/` public runtime
- old-HUD public use
- public/runtime clearance
- deployed/CDN/cache closure
- source/provenance custody
- publication readiness
- publication-path support
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- accepted translation text

Publication remains `blocked_no_render`.
