# Agent 6 SOP-000/SOP-001 Signoff Docket

Date: 2026-06-01
Authority: Agent 6 independent QA/compliance authority
Request: `reports/agent7-agent6-sop-signoff-request-2026-06-01.md`

## Verdict

WARN-ACCEPTED.

SOP-000 and SOP-001 are accepted as governing QA/control SOPs for operating authority, goal-board status discipline, and goal/pulse routing rules, with the warnings and boundaries below.

This signoff does not accept publication readiness, source/provenance acceptance, Reader Workbench broad rollout, Definition Workbench authority, accepted translation text, or any claim that reports, pulses, validators, worker output, Agent 5 routing, or Agent 7 mission packets create acceptance without an Agent 6 docket.

Publication remains `blocked_no_render`.

## Effective Boundary

Effective as of this docket:

- `reports/sop-000-global-qa-authority-change-control.md` is active as the governing QA authority and change-control SOP.
- `reports/sop-001-goal-operating-model.md` is active as the durable goal operating SOP.
- Agent 6 owns QA/compliance SOPs, gate definitions, acceptance criteria, and pass/warn/block rulings.
- Agent 5 may manage durable goals, stale-worker suppression, queues, relays, and evidence packet flow, but may not suppress Agent 6 blockers, redefine acceptance criteria, or treat evidence as accepted.
- Agent 7 may set mission strategy, product direction, priority, and cost policy, but may not narrow Agent 6 validation scope, define QA acceptance independently, or self-accept evidence.
- Agent 4 is Agent 6's QC/runtime validation worker. Agent 4 may produce evidence packets and recommend verdicts, but may not self-accept HUD, runtime, Reader Workbench, Definition Validation UI, source/provenance, publication, or accepted-text gates.
- QA-relevant worker output can move only to `evidence-ready` or `awaiting-Agent-6` until Agent 6 issues a dated docket.
- Only a dated Agent 6 docket can move QA-relevant work to `Agent-6-accepted`.

## Evidence Reviewed

- `reports/agent7-agent6-sop-signoff-request-2026-06-01.md`
- `reports/sop-000-global-qa-authority-change-control.md`
- `reports/sop-001-goal-operating-model.md`
- `data/control/agent_goal_board.json`
- `data/control/agent_registry.json`
- `data/control/pulse_state.json`
- `data/control/gate_registry.json`

Machine checks performed:

- JSON parse check passed for `agent_goal_board.json`, `agent_registry.json`, `pulse_state.json`, and `gate_registry.json`.
- Goal-board status scan passed: 5 goals reviewed, all statuses belong to the allowed model, and no QA-relevant goal is marked `Agent-6-accepted` without a docket.
- Text scan found no alternate goal-board terminal statuses in the reviewed SOP/control packet that override the required status model.

## Rationale

SOP-000 contains the required authority controls: Agent 6 owns QA/compliance SOPs, gate definitions, acceptance criteria, and pass/warn/block rulings; Agent 5 cannot redefine acceptance or suppress Agent 6 blockers; Agent 7 cannot narrow Agent 6 validation scope or self-accept evidence; Agent 4 is Agent 6's QC/runtime validation worker; and no report, pulse, validator, worker output, or mission packet creates acceptance without an Agent 6 docket.

SOP-001 correctly makes durable goals subordinate to SOP-000, replaces routine worker pulses with long-running goal assignments, prevents Agent 5 from prompting active workers except under defined escalation conditions, and preserves the required goal statuses: `active`, `blocked`, `evidence-ready`, `awaiting-Agent-6`, and `Agent-6-accepted`.

The control artifacts mostly match the proposed model. They preserve `blocked_no_render`, keep the source/provenance blocker visible, keep Reader Workbench and Definition Workbench boundaries narrow, and state that QA-relevant acceptance requires an Agent 6 docket.

## Warnings

### Warning 1: `pulse_state.json` had pre-signoff activation language

Owner: Agent 5

Affected gate: global_qa_authority_gate

Risk classification: warning

Evidence:

- `data/control/pulse_state.json` says `SOP-000 is active` and `Goal board is live` before this Agent 6 signoff docket existed.
- The same file also contains draft/signoff-pending language elsewhere, so this is wording drift rather than a full structural bypass.

Acceptance condition:

Agent 5 must treat SOP activation as effective by this docket only. The next control-board maintenance pass should cite this docket as the activation basis and avoid implying SOPs became active from Agent 5, Agent 7, pulse state, or control-board text alone.

### Warning 2: Agent 7 mission authority language needs the SOP-000 boundary attached

Owner: Agent 7 with Agent 5 control wording

Affected gate: global_qa_authority_gate

Risk classification: warning

Evidence:

- `data/control/agent_registry.json` describes Agent 7 as CEO/priority authority and says Agent 6 receives mission direction from Agent 7.
- SOP-000 correctly prevents Agent 7 from narrowing Agent 6 validation scope or defining QA acceptance independently.

Acceptance condition:

Any future registry or pulse wording that says Agent 7 directs Agent 6 must state the boundary: Agent 7 may set mission strategy, product direction, priority, and cost policy; Agent 6 independently owns QA/compliance acceptance, validation scope, and pass/warn/block rulings.

### Warning 3: Goal-board template list is slightly weaker than SOP-001

Owner: Agent 5

Affected gate: durable_goal_operating_gate

Risk classification: warning

Evidence:

- SOP-001 requires each durable goal prompt to include objective, scope, stop conditions, artifacts expected, known risks, validation boundary, and what must not be accepted.
- `data/control/agent_goal_board.json` includes most of this shape, but its summary `durable_goal_requirements` list is less explicit than SOP-001 on objective, known risks, and validation boundary.

Acceptance condition:

Agent 5 must use SOP-001 as the stronger source of truth when seeding goals. The next board hygiene pass should align the board template list to SOP-001, but goal operation may proceed under this warning because SOP-001 itself is explicit and controlling.

## Affected Agents

- Agent 1: works source/provenance durable goals under Agent 6 acceptance criteria and Agent 5 coordination.
- Agent 2: works route/definition integrity durable goals; route/answer eligibility remains non-publication and non-unique semantic truth unless Agent 6 dockets otherwise.
- Agent 3: works usage/navigation durable goals; usage rows remain navigation/evidence only unless Agent 6 dockets a definition-authority boundary.
- Agent 4: operates as Agent 6 QC/runtime validation worker and produces evidence packets, not acceptance.
- Agent 5: manages goal board, suppression, queue flow, relays, and evidence packets; cannot self-accept or suppress Agent 6 blockers.
- Agent 6: owns QA/compliance SOPs, gate definitions, acceptance criteria, validation dockets, and pass/warn/block.
- Agent 7: sets mission strategy, product direction, priority, and cost policy; cannot narrow Agent 6 scope or self-accept evidence.

## Affected Gates

- `global_qa_authority_gate`: WARN-ACCEPTED by this docket.
- `durable_goal_operating_gate`: WARN-ACCEPTED by this docket.
- `source_render_hygiene_gate`: unchanged, remains blocked by direct 55 untracked source files vs audit 13.
- `compliance_publication_gate`: unchanged, remains `blocked_no_render`.
- `reader_workbench_gate`: unchanged, only previously docketed bounded scopes remain accepted.
- `definition_workbench_gate`: unchanged, machine shape remains warning-level and authority use remains blocked by verified-overclaim until fixed.
- `usage_navigation_gate`: unchanged, remains accepted only with usage/navigation boundary warnings.
- `route_release_gate`: unchanged, remains route/HUD/workbench evidence only and not publication support.
- `hud_truth_gate`: unchanged, remains accepted only within the previously docketed public HUD boundary.

## Required Agent 5 Relay

```text
Agent 6 has WARN-ACCEPTED SOP-000 and SOP-001 by docket reports/agent6-sop-000-001-signoff-docket-2026-06-01.md. Treat SOP-000 and SOP-001 as active from that docket only. Goal operation may proceed under SOP-001, but Agent 5 must preserve the warnings: do not imply SOP activation came from pulse/control state, attach the Agent 7 mission-authority boundary wherever needed, and align the goal-board template list to SOP-001 on objective, known risks, and validation boundary. No QA-relevant worker output is accepted without Agent 6 docket. Publication remains blocked_no_render.
```

