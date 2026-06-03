# Agent 7 Reader Surface Team Cadence

Generated: 2026-06-03T00:00:00-04:00

Authority: Agent 7 execution manager under Agent 13 mission owner

Source plan: `reports/agent10-team-release-operating-plan-2026-06-03.md`

Publication status: `blocked_no_render`

## Decision

Agent 7 adopts Agent 10's team release operating plan as the current reader-surface cadence, with Orot fill as the flagship priority and bounded public-surface expansion explicitly allowed while Agent 1 and Agent 2 blockers remain unresolved.

Priority order:

1. Protect old-HUD exposure at `0` for every current public reader surface.
2. Advance Orot fill only through bounded pipeline-generated route-claim work, source/license filtering, runtime thresholds, and QA packet review.
3. If Orot fill is blocked by Agent 1 source/license evidence, Agent 2 transform authority, Agent 13 semantic authority, or Agent 4 runtime limits, Agent 10 may continue bounded current-HUD public-surface expansion that does not consume the Agent 1/2 critical path.
4. Do not convert fallback public-surface expansion into Orot deprioritization. It is the release-owner workstream that keeps useful reader coverage moving while the Orot fill gate is blocked.

This is a cadence and queue-management packet only. It creates no QA acceptance, public/runtime acceptance, publication readiness, source/provenance acceptance, Definition authority, usage-as-definition authority, accepted gloss, accepted text, or translation output.

## Active Queue

| Lane | Current assignment | Expected artifact | Manager cadence |
|---|---|---|---|
| Agent 10 | Release owner; protect old-HUD `0`, maintain live proof, advance Orot when gates allow, otherwise ship bounded current-HUD reader improvements | `reports/agent10-*-route-package-proof-2026-06-03.md`, `reports/agent10-*-live-browser-proof-2026-06-03.json`, blocker reports | Keep active; do not stall behind Agent 1/2 unless a shared runtime, old-HUD, or authority blocker affects all bounded packages |
| Agent 2 | Determine whether an existing transform can emit a top-50 dry-run Orot route-claim JSONL, or write the transform spec | `reports/agent2-orot-fill-producing-transform-spec-2026-06-03.md`; optional `.local-cache/definition-routes/orot-agent2-pilot-answer-claims.jsonl` if fully pipeline-proven | Wake now if idle; cap to top `50`; report exact blocker rather than inventing definitions |
| Agent 1 | Map source/license blockers for top `100` Orot gap tokens, including known incomplete curated rows | `reports/agent1-orot-top100-source-blocker-map-2026-06-03.md` | Wake now if idle; do not interrupt if already producing the blocker map unless Agent 6 requests a smaller source-custody packet |
| Agent 3 | Cluster Orot gap queue into mechanical buckets that Agent 2 can target without semantic arbitration | `reports/agent3-orot-gap-mechanical-buckets-2026-06-03.md` | Wake now if idle; keep output navigational and non-authoritative |
| Agent 4 | Prepare Orot runtime thresholds; run proof only after Agent 10 has a new local Orot package | `reports/agent4-orot-fill-runtime-thresholds-2026-06-03.md` | Wake for threshold report now; wake for runtime proof only after package exists |
| Agent 6 | Define minimum Orot fill evidence packet; review Deuteronomy Stage B only if Agent 7/10 routes it | `reports/agent6-orot-fill-evidence-requirements-2026-06-03.md` | Wake when evidence requirements are needed before first Orot fill packet, or when a complete packet exists |
| Agent 12 | Enforce top-N pilots, payload thresholds, dry-run/report-only posture while semantic/source blockers remain | `reports/agent12-orot-fill-budget-boundary-2026-06-03.md` | Wake when package scope grows beyond top-N, payload/runtime thresholds are unknown, or broad render/payload risk appears |
| Agent 13 | Mission owner; semantic/pipeline authority exception only | no routine artifact required by this packet | Wake only for a new semantic authority decision or priority change |

## Agent 10 Cadence

Agent 10 remains active in release-owner mode while Agent 1 and Agent 2 work the Orot blockers.

Allowed Agent 10 fallback lane:

- choose one already-public current-HUD surface with low route coverage or missing route summary;
- build a bounded top-N cap-3 route package;
- run static validators, old-HUD marker scan, local browser proof, deploy proof, and live browser proof;
- record exact blocker instead of publishing when any old-HUD, payload, runtime, source, or authority gate fails;
- avoid work that consumes Agent 1/2 Orot blocker capacity or requires semantic authority.

Agent 10 should not publish Orot fill rows until the Orot promotion gate in the source plan is satisfied. Fallback public-surface expansion may continue without that Orot gate if it uses existing current-HUD runtime and existing pipeline-safe route data.

## Wake Rules

Wake Agent 6 when one of these is true:

- Agent 2 produces a top-50 Orot dry-run route-claim artifact and Agent 1/3/4 have supplied the minimum supporting evidence needed for a bounded QA packet.
- Agent 10 has a complete bounded public-surface package that needs a dated pass/warn/block verdict.
- Deuteronomy Stage B evidence needs a formal boundary verdict beyond Agent 10 proof.
- A worker tries to treat proof, live behavior, route claims, source rows, or fallback package success as acceptance.

Wake Agent 12 when one of these is true:

- Orot pilot scope exceeds top `50` without an Agent 7/13 decision.
- A package grows toward broad Orot fill, broad render, or payload expansion before Agent 4 thresholds exist.
- Agent 10 fallback work starts consuming Agent 1/2 critical-path attention.
- Repeated proof loops replace useful bounded artifacts.

Wake Agent 13 when one of these is true:

- Orot fill requires a new semantic authority boundary or a new transform authority not already allowed by existing pipeline law.
- Agent 10 asks to change mission priority away from Orot flagship fill plus bounded current-HUD expansion.
- All bounded current-HUD expansion is blocked and the next step would require a mission-level exception.

Wake Agent 4 when one of these is true:

- Agent 10 has a new local Orot package requiring runtime proof.
- Agent 12 flags payload/runtime risk and thresholds are insufficient.
- Old-HUD exposure becomes nonzero, poisoned storage revives old HUD, or current-HUD interaction regresses.

Wake Agent 1 or Agent 2 when one of these is true:

- Agent 1/2 are idle and their expected Orot artifacts are missing.
- Agent 6 requests source/provenance or route-data supplements for a bounded Orot evidence packet.
- Agent 10's fallback package encounters a source/license or route-data blocker that cannot be excluded mechanically.
- A high-impact Orot fill row is blocked by one of the known incomplete curated rows and needs exact exclusion or remediation mapping.

Do not wake Agent 1/2 merely because Agent 10 is continuing fallback public-surface expansion. Agent 10 is allowed to keep moving in that lane while the Orot critical path is unresolved.

## Queue Order

Immediate queue:

1. Agent 2: top-50 Orot fill transform feasibility or exact transform spec.
2. Agent 1: top-100 Orot source blocker/exclusion map.
3. Agent 3: Orot mechanical bucket report.
4. Agent 4: Orot runtime threshold report.
5. Agent 12: Orot budget boundary.
6. Agent 6: minimum Orot fill evidence requirements.
7. Agent 10: continue Orot release-owner support; if blocked, continue bounded current-HUD public-surface expansion under old-HUD `0`.

Review queue:

1. First complete Orot top-N dry-run evidence packet, if produced.
2. First complete Agent 10 fallback current-HUD public-surface package, if Orot remains blocked.
3. Deuteronomy Stage B boundary review only if Agent 7/10 explicitly needs a dated Agent 6 verdict beyond Agent 10 proof.

## Stop Conditions

Stop and route upward only when:

- old-HUD exposure becomes nonzero;
- a semantic authority decision is required;
- a source/license row cannot be excluded and blocks high-impact Orot fill;
- payload/runtime proof blocks every bounded Orot and fallback package;
- Agent 6 returns a BLOCK that changes queue priority;
- Agent 12 blocks scope and no smaller top-N/report-only packet remains.

If none of those occur, the cadence is continuous: Agent 1/2/3/4/12/6 produce bounded Orot gating artifacts, and Agent 10 continues either Orot package work or bounded current-HUD public-surface expansion.

## Not Accepted

This packet does not accept QA, public/runtime behavior, source/provenance custody, source publication, source-file tracking, publication readiness, route publication support, product/data gates, Definition authority, usage-as-definition authority, translation output, accepted gloss, accepted text, or accepted translation text.

Publication remains `blocked_no_render`.
