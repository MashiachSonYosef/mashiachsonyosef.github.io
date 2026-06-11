# Agent 5 CEO Control Board

Generated: 2026-05-31T12:34:36-04:00

Supersession note, 2026-05-31T21:31:11-04:00: Agent 7 is now CEO/priority authority. This file is retained as historical control context. Agent 5's current operating role is pipeline-priority and handoff-quality, defined in `reports/agent5-pipeline-priority-handoff.md`.

## Current Board State

This is the current control map for the multi-agent workbench effort. It is intentionally lightweight and should be refreshed by Agent 5 control passes, not by render/build jobs.

Core lane goals and one-on-one prompts are defined in `reports/agent5-five-agent-core-goals.md`. Despite the historical filename, that file now includes Agent 6 as QA authority.

Role-based QA gate model is defined in `reports/agent5-role-based-qa-gate-model.md`.

Pipeline master plan is defined in `reports/agent5-workbench-pipeline-master-plan.md`.

Regulatory audit operating packet is defined in `reports/agent5-regulatory-audit-operating-packet.md`.

Agent 5 operating model:

- CEO/priority layer for Agents 1-4.
- Project manager and relay layer to Agent 6.
- Not the final QA authority; Agent 6 is downstream QA and can overrule Agent 5.
- Main function: prioritization. Decide what matters next, what can wait, what should stop, and which lane deserves scarce prompt/CPU/user attention.
- Not the main function: micromanaging agents that already know their lanes.
- Each pulse should evolve the control system: update a gate, relay state, risk, decision, QA brief, lane priority, or workflow assumption instead of merely repeating the previous pulse.
- Each pulse should infer lane state from artifacts/reports when possible instead of depending on user-relayed worker summaries.

Priority rule:

- If multiple lanes are active, Agent 5 should not add work by default. Rank the bottlenecks.
- If a lane is idle and not blocked, send only a generic autonomous-continue signal unless a higher-priority correction exists.
- If Agent 6 returns a blocker, route that above normal lane continuation.
- If a worker is making progress on the current top priority, do not distract it with lower-priority coordination.

| lane | owner | current status | finish condition | control call |
|---|---|---|---|---|
| Definition route data | Agent 2 | green | route release stamp, public lookup shards, and route-card counts agree | Observed adopted release-candidate discipline; keep frozen unless next release is explicit. |
| Workbench usage evidence | Agent 3 | green/yellow | selected public handoff stays validated, usage-only, and not final-answer authority | Observed adopted usage-navigation/concordance; freshness remains bounded. |
| HUD render/runtime | Agent 4 | red/yellow | word click preserves source token identity and HUD semantics match behavior | Render inventory and answer-safety are now report-backed; token integrity/accessibility still need Agent 6 acceptance. |
| Source/render custody | Agent 1 | yellow | generated/source artifacts are traceable to source/license and render reports | Render-count drift is explained, but latest Eliyah Rabbah lexical report has a source-label/mojibake contradiction. |
| Translation memory/control | Agent 5 | green/yellow | decision rows preserve source anchors, license profile, and occurrence identity | Keep extending contracts and validators, not generated pages. |
| Independent QA authority | Agent 6 | green/yellow | validates release gates and can overrule Agent 5 control assumptions | QA is above Agent 5; escalate final acceptance/blocker calls here. |

## Critical Path

1. Agent 4 HUD runtime truth is the top release blocker. Public HUD cannot be QA-accepted until a fresh audit shows `split_token_mismatch = 0`, modal/accessibility errors `= 0`, and sampled public pages show visible, non-misleading `source_name`, `source_id`, and `license` rows.
2. Agent 5 publication gate remains `blocked_no_render`. This is important, but it is not the main story until the live HUD truth layer stops being debatable.
3. Agent 1 provenance label discipline follows: fix contradictory report wording, mojibake, and public label ambiguity such as shorthand `PD`.
4. Agent 2 preserves route/publication boundary hardening. Current route stamp and answer-safety controls are useful but do not clear public HUD QA.
5. Agent 3 keeps usage/concentration warnings visible. Current rows are usage-navigation only, but one-route concentration means this lane is not independent semantic confirmation.
6. Agent 6 independently verifies QA gates and overrules Agent 5 if observed HUD/output contradicts the board.

## Product Direction

The real product is a repeatable pipeline. The near-term visible output is a dense workbench that preserves enough evidence to make future translations possible without recollecting data.

That means:

- More evidence is good if every row is typed by role, confidence, source, and license.
- More evidence is bad if it collapses into one `definition` slot or one untyped English gloss.
- The HUD should expose density, but must not misrepresent authority.
- Future translation mode should be a filtered decision layer over this evidence, not a fresh data collection project.
- Compliance/provenance is a release blocker for publication, not a polish task. Agent 5 tracks evidence and labels; Agent 6 accepts or blocks QA.
- Workbench display does not require 100% QA acceptance; answer authority and publication do. Use role-based gates instead of one universal hidden score.
- Every cycle should freeze inputs, generate one layer, stamp/handoff, run narrow validators, brief Agent 6, relay corrections, then repeat.

## Current Release Gates

- Route release stamp: pass.
- Route release gate: pass.
- Workbench public handoff: pass with bounded freshness warning.
- Workbench usage navigation links: pass.
- Translation-memory source anchors: pass.
- Translation-memory license profiles: pass.
- Translation attribution manifest: pass.
- Compliance QA docket: pending Agent 6 acceptance.
- Role-based QA gate model: pending Agent 6 acceptance.
- Pipeline master plan: active Agent 5 control model.
- Route HUD page report: pass/report-backed; latest render watch reports 1,253 source records, 1,253 generated pages, 1,253 route-HUD pages, and 1,253 pages with `Usage evidence`.
- Route HUD localhost smoke: pass/report-backed for `other/beer-hagolah/` and `tanakh/genesis/`.
- Route answer safety: pass/report-backed; evidence-only cards do not become answer authority.
- Public HUD QA acceptance: accepted-with-boundary by Agent 6 on bounded static evidence; do not represent this as browser-click proof.
- Source/render provenance report: warning; latest Eliyah Rabbah lexical build report says Kaikki was not used while one parsed-form sample is labeled `kaikki`, and visible Hebrew samples are mojibake.
- HUD word-click sample audit: bounded split-token boundary pass reports 0 errors and 0 warnings across 9 sampled pages.
- HUD accessibility audit: bounded pass reports 0 errors and 0 warnings, with one `dense_inline_targets` info note.
- Stale HUD contract tools: warning remains active.

## Coordination Rules

- Do not let Agent 2 and Agent 3 solve the same problem. Agent 2 owns answer-eligible definition routes. Agent 3 owns observed usage evidence.
- Do not let Agent 4 render Agent 3 rows as definitions. They need a separate `Usage evidence` lane.
- Do not let generated HTML become the authority. Source sidecars, release stamps, and validators are the authority.
- Do not ask for broad graph expansion until public handoff freshness and display semantics are controlled.
- Do not ship marketing polish claims until word-click integrity and HUD semantics are resolved.
- Do not ship publication claims or accepted translation output until Agent 6 accepts provenance/license boundaries.
- Require worker updates to use `reports/agent5-agent-update-protocol.md` when an autonomous session ends, stalls, or hands off risk.
- Treat Agent 6 as QA boss: Agent 5 coordinates and recommends, but final QA acceptance/blocker calls belong to Agent 6.
- Agent 5 should feed Agent 6 concise QA briefs, sample requests, and contradiction reports; Agent 6 returns acceptance/blocker findings that Agent 5 turns into lane relays.
- Agent 5 should mark lane state by evidence: accepted, observed adopted, report-backed, pending, drift, noncompliant, or needs QA.

## Relay Queue

Agent 4 relay sent 2026-05-31T15:44:15-04:00:

```text
Agent 6 accepts the Agent 4 HUD truth gate with boundary. The prior HUD runtime blocker is cleared on bounded static evidence: split-token audit 0/0/0 across 9 sampled pages, accessibility audit 0/0 with only `dense_inline_targets` info, source-row sample 0 source-row errors, and validators passed. Do not call this browser-proven click reachability; call it static truth-gate acceptance with continuing watch status. Priority now shifts to `blocked_no_render` publication readiness, then Agent 1 provenance label discipline. Continue HUD work only as bounded watch/regression protection; do not run broad renders unless new drift or Agent 6 asks.
```

Carry forward, but do not interrupt Agent 2 unless he resumes expansion without stamping:

```text
Stay in release-candidate discipline. Preserve the current route stamp and only regenerate public lookup shards from a frozen input set. Do not add a new route family until route claims, public manifest counts, and HUD render/runtime contract all reconcile to one release candidate.
```

Carry forward, but do not interrupt Agent 3 unless broad expansion resumes:

```text
Keep the workbench lane as usage evidence, not definition authority. Maintain selected public handoff packages with supported/candidate/weak rows visible and ambiguous rows audit-only. Refresh freshness deliberately; do not promote broad unscoped graph output into the reader HUD.
```

Carry forward, but do not interrupt Agent 1 unless the source lane is in handoff mode or Agent 6 asks:

```text
Reconcile the Eliyah Rabbah lexical build report before it is used as provenance evidence. It states "legacy source-exclusion wording claimed Kaikki was unused" but a newly resolved parsed-form sample is labeled "(kaikki)", and the visible Hebrew samples are mojibake. Do not broaden the build; patch the source-label/reporting path or explain the legacy row source, rerun only the targeted report/validator, and hand off exact source/license fields for Agent 6.
```

## Next Agent 5 Passes

- Keep `reports/agent6-qa-escalation-brief.md` current for Agent 6.
- Track each pulse's novel control delta; avoid repeating the same QA unless new evidence exists.
- Run the HUD accessibility audit after Agent 4 changes render/runtime source.
- Re-run the word-click sample audit after Agent 4's split-token guard.
- Add freshness checks for the public handoff index only if Agent 3 changes sources or manifests.
- Expand translation memory only from rows with source anchors and license profiles.
- Keep creating small validators and control reports; avoid broad generated-page mutation.
