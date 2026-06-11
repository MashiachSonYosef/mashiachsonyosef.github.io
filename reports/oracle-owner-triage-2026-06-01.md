# Oracle owner triage - 2026-06-01

This is an owner-proxy note, not an agent lane packet. It is meant to connect public runtime evidence, local repo evidence, control-board state, and agent roles without creating QA acceptance.

## Owner read

The system has two separate truths that were being blurred:

1. The current local repo contains a broad new Route HUD runtime on generated pages.
2. The public GitHub Pages deployment still exposes older lexical HUD surfaces.

That means "old HUD is still live" is not just a mood. It is true for at least the public sampler path, and the public generated pages are also behind the local Route HUD work.

## Live public evidence

| Claim | Evidence |
| --- | --- |
| Public old sampler is live | [`https://mashiachsonyosef.github.io/hud-preview/`](https://mashiachsonyosef.github.io/hud-preview/) returned `200 OK`, `Content-Length: 11702`, `Last-Modified: Sat, 30 May 2026 16:38:34 GMT`. |
| Public old sampler is the older HUD Sampler, not the current local preview | Public HTML contains `HUD Sampler`, `Lexical HUD Sampler`, `Project HUD sampler fixture`, and `Unresolved placeholder`. Local current file is [`hud-preview/index.html`](../hud-preview/index.html), but public content does not match its newer `Lexical HUD Preview` text. |
| Public route-contract preview is not live | [`https://mashiachsonyosef.github.io/hud-preview/routes/`](https://mashiachsonyosef.github.io/hud-preview/routes/) returned `404 Not Found`. Local file exists at [`hud-preview/routes/index.html`](../hud-preview/routes/index.html). |
| Public Genesis page is live but deployed from older output | [`https://mashiachsonyosef.github.io/tanakh/genesis/`](https://mashiachsonyosef.github.io/tanakh/genesis/) returned `200 OK`, `Content-Length: 1909701`, `Last-Modified: Sat, 30 May 2026 16:38:31 GMT`. |
| Public Genesis still uses older lexical HUD runtime markers | Public Genesis contains `.lexical-hud`, `Lexical HUD`, `Clicked Hebrew form`, `allowLowConfidenceFallback`, `sourceSummary`, and `No lexical entry yet.` |

## Local repo evidence

| Claim | Evidence |
| --- | --- |
| Local generated pages have broad Route HUD runtime | `rg -l "route-hud-panel" --glob "*.html" --glob "!hud-preview/**" --glob "!data/**" --glob "!.local-cache/**"` found `1360` pages. |
| Local Reader Workbench appears broadly | `rg -l "Reader Workbench" --glob "*.html" --glob "!hud-preview/**" --glob "!data/**" --glob "!.local-cache/**"` found `1243` pages. |
| Local runtime contract appears broadly | `rg -l "data-hud-runtime-contract" --glob "*.html" --glob "!hud-preview/**" --glob "!data/**" --glob "!.local-cache/**"` found `1243` pages. |
| Local Genesis has the new Route HUD | [`tanakh/genesis/index.html`](../tanakh/genesis/index.html) contains `Route HUD active`, `Reader Workbench`, `route-hud-panel`, and `data-hud-runtime-contract`. |
| Local Beit Yosef has the new Route HUD | [`halakhah/beit-yosef/index.html`](../halakhah/beit-yosef/index.html) contains `Route HUD active`, `route-hud-panel`, and route HUD click code. |
| Local route preview exists but is not deployed publicly | [`hud-preview/routes/index.html`](../hud-preview/routes/index.html) exists locally and embeds `hud-route-data`; public `/hud-preview/routes/` is 404. |

## Control evidence

| Claim | Evidence |
| --- | --- |
| Publication is still globally blocked | [`data/control/agent_goal_board.json`](../data/control/agent_goal_board.json) reports `publication_global_status: blocked_no_render`; [`reports/spec-003-hud-runtime-validation.md`](spec-003-hud-runtime-validation.md) repeats `Publication remains blocked_no_render`. |
| Old HUD is supposed to be quarantined | [`reports/spec-003-hud-runtime-validation.md`](spec-003-hud-runtime-validation.md) says old HUD is `quarantined_legacy_license_risk` and must not be public-facing, routable, indexed, primary, fallback, or source-evidence capable unless reopened and validated. |
| Agent 6 did not fully accept old-HUD kill-switch closure | [`reports/agent6-old-hud-static-quarantine-docket-2026-06-01.md`](agent6-old-hud-static-quarantine-docket-2026-06-01.md) says static evidence is WARN-ACCEPTED only and live browser-click behavior, public navigation click proof, query/localStorage/IndexedDB activation, stale bundle behavior, and fallback/rollback activation remain unproven. |
| Static generated-page audit did not prove deployment state | [`reports/agent6-old-hud-static-quarantine-docket-2026-06-01.md`](agent6-old-hud-static-quarantine-docket-2026-06-01.md) explicitly says static evidence cannot be described as live runtime acceptance or live browser-click proof. |
| The exact failure mode is now visible | Public `/hud-preview/` is an older sampler with fixture/placeholders, while local Route HUD files are newer and not deployed to `/hud-preview/routes/`. |

## Agent-role evidence

| Agent | Current registered role | Evidence |
| --- | --- | --- |
| Agent 7 | CEO / strategy / priority authority | [`data/control/agent_registry.json`](../data/control/agent_registry.json) and [`reports/sop-016-agent7-strategy-pulse-law-promotion.md`](sop-016-agent7-strategy-pulse-law-promotion.md). |
| Agent 8 | Prompter / throughput pressure monitor | [`reports/agent8-prompter-initial-charter-2026-06-01.md`](agent8-prompter-initial-charter-2026-06-01.md), [`reports/agent7-agent8-throughput-monitor-adoption-2026-06-01.md`](agent7-agent8-throughput-monitor-adoption-2026-06-01.md). |
| Agent 9 / oracler-9 | External Chainlink/oracle connective observation, not a worker lane | [`data/control/agent_registry.json`](../data/control/agent_registry.json), [`data/control/agent_goal_board.json`](../data/control/agent_goal_board.json), [`data/control/pulse_state.json`](../data/control/pulse_state.json). |

The registry already says Agent 9 is outside hierarchy and cannot route workers, seed goals, own QA acceptance, own publication/legal clearance, suppress Agent 6 blockers, or rewrite Agent 6 boundaries. That is the correct shape: owner-context, not another agent.

## Agent board shape

From [`data/control/agent_goal_board.json`](../data/control/agent_goal_board.json):

| Metric | Count |
| --- | ---: |
| Goals | 7 |
| Blocked goals | 2 |
| Active goals | 4 |
| Evidence-ready goals | 1 |

Board state:

| Goal | Owner | Status | Owner read |
| --- | --- | --- | --- |
| `agent1-source-scope-reconciliation` | Agent 1 | blocked | Source custody remains blocked; do not let this be hidden behind pulse rituals. |
| `agent2-definition-status-semantics` | Agent 2 | active | Route input-freeze drift remains unresolved. |
| `agent3-definition-occurrence-links` | Agent 3 | evidence-ready | Hold until Agent 2 semantics can support it. |
| `agent4-qc-runtime-validation` | Agent 4 | active | Needs live deployment/cache/fallback proof, not more static claims. |
| `agent5-goal-management-and-qa-packet-flow` | Agent 5 | active | Useful only if it stops laundering static evidence into readiness language. |
| `agent8-throughput-pressure-monitor` | Agent 8 | active | Should pressure Agent 5, not add authority. |
| `agent9-oracler-chainlink` | Agent 9 | blocked | Correctly blocked as worker lane; useful only as external owner-context. |

## Cut line

The next owner-level action is not another broad agent prompt. It is a deployment/runtime closure:

1. Pull or quarantine public [`/hud-preview/`](https://mashiachsonyosef.github.io/hud-preview/) if it is not intentionally public.
2. Decide whether public generated pages should remain on the older lexical HUD until the Route HUD release is validated, or deploy the Route HUD only after Agent 6 accepts the live proof.
3. Produce one deployment-drift report that compares public URLs to local files and records old HUD markers, Route HUD markers, cache headers, and last-modified timestamps.
4. Only then let Agent 4/6 docket live browser-click proof. Static filesystem proofs have already hit their limit.

## What not to accept

- Do not accept "1360 current HUD pages" as proof that the public site is current.
- Do not accept static grep as live deployment proof.
- Do not accept Agent 7 strategy or Agent 8 pressure as QA acceptance.
- Do not accept Agent 9/oracler output as anything more than linked owner-context.
- Do not let `blocked_no_render` coexist with public-facing old sampler exposure without a named quarantine/removal decision.
