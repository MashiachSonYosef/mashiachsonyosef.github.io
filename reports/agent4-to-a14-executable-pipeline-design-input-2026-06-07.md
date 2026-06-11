# Agent 4 input for A14 executable pipeline redesign

Generated: 2026-06-07

Target: A14 company/pipeline redesign

Source lane: Agent 4 validator/prereq/runtime evidence

Delivery note: direct thread delivery tool was not available in this session. Registry lookup showed Agent 14 target thread `019e8ab3-9e1c-73c0-9ddd-ade729449057`.

## Core recommendation

Agent 4 should become a deterministic validation compiler, not a status agent.

The useful output is not "Agent 4 says pass." The useful output is a small, machine-readable proof packet that says:

1. what changed,
2. what exact validator ran,
3. what it checked,
4. what counts it found,
5. what blockers remain,
6. what artifact is safe for the next pipeline stage,
7. what must not be claimed yet.

If there is no changed input, Agent 4 should emit one exact blocker and stop. It should not poll endlessly, rerun unchanged validators, or produce governance prose.

## Proposed Agent 4 pipeline

### 1. Intake

Input contract:

- `changed_input_artifact`: exact file path for a candidate package, route packet, runtime evidence packet, or upstream proof.
- `package_owner`: producing lane, usually Agent 10 or Agents 1-3.
- `validator_family`: one of `source_lane`, `definition_transform`, `crossmatch_route`, `hud_runtime`, `reader_workbench`, `release_prereq`, `repo_hygiene`.
- `expected_output`: exact proof packet path.
- `approval_route`: A07 only for approval/SOP/final validation/release gate. A06 outputs are evidence-ready only.

If `changed_input_artifact` is missing, Agent 4 emits `changed_input_blocker` with:

- missing package path,
- needed command list,
- expected output schema,
- validator/gate,
- package owner,
- A07 boundary trigger,
- stop condition.

### 2. Validator selection

Agent 4 should not invent validators during a run.

The pipeline should maintain a registry like:

```json
{
  "validator_family": "crossmatch_route",
  "artifact_glob": "reports/agent3-*-route-*.json",
  "command": "node scripts/validate_agent3_route_packet.mjs --input={input}",
  "timeout_ms": 120000,
  "output_schema": "agent4_validator_prereq_packet",
  "accepts_markdown": false,
  "approval_authority": "A07",
  "evidence_authority": "A06/Agent4"
}
```

This lets a smaller model execute the same lane without deciding what matters.

### 3. Run

Every command must have:

- exact command string,
- timeout,
- expected output,
- stop condition.

Timeout result shape:

```text
process_timeout | command | timeout | partial_output_or_artifact | next_safe_action
```

No still-running process counts as evidence.

### 4. Proof packet

Agent 4 output should be JSON first, Markdown second.

Minimum JSON fields:

```json
{
  "artifact_type": "agent4_validator_prereq_packet",
  "target": "",
  "changed_input_artifact": "",
  "validator_commands": [],
  "counts": {},
  "result": "passed|failed|blocked|warn",
  "exact_blockers": [],
  "handoff_owner": "",
  "approval_route": "A07",
  "non_acceptance_boundary": [],
  "stop_condition": ""
}
```

Markdown should be a readable receipt, not a second source of truth.

### 5. Gate

Agent 4 should run the packet self-validator on its own proof packet:

```text
node scripts/validate_agent4_validator_prereq_packet.mjs --input={packet}
```

If a new proof packet was added, it may run the bounded packet sweep gate once. If no new proof packet exists, it must not rerun the sweep.

### 6. Handoff

Handoff is always to the next owner, not to "the company."

Examples:

- Agent 10: package/release intake.
- Agent 1: source/license/custody correction.
- Agent 2: transform/definition correction.
- Agent 3: route/crossmatch correction.
- A07: approval/SOP/final validation/release gate when the packet is boundary-ready.

## What Agent 4 should not do

- No acceptance claims.
- No publication readiness claims.
- No source/license/legal approval.
- No Definition authority.
- No answer/gloss/accepted-text authority.
- No repo cleanup mutation.
- No broad runtime proof loop without a named changed surface.
- No repeated unchanged validator churn.
- No "waiting" artifacts unless they are exact blockers with wake conditions.

## How this supports usable output

The key shift is from agent personality to pipeline artifact.

Agent 4 should produce durable, boring, repeatable evidence packets that can be consumed by Agent 10 and A07. The value is that any model can rerun the same artifact path and command list and get the same answer.

The pipeline should make dirty repo risk visible by requiring every changed package to have:

- owner,
- input path,
- validator command,
- output path,
- counts,
- blockers,
- non-acceptance boundary,
- next handoff.

That is the unit of usable output.

## Suggested A14 design rule

Every lane should have three files:

1. `lane-contract.json`: stable schema and validator registry.
2. `current-intake.json`: current changed input or exact blocker.
3. `latest-proof.json`: last validated proof packet.

If a lane cannot fill those three files, it is not executable enough yet.

## Agent 4 rune definitions

`changed_input_artifact`: the only thing Agent 4 is allowed to validate.

`validator_command`: exact executable proof command with timeout.

`proof_packet`: durable JSON evidence emitted by Agent 4.

`blocker`: missing field or failed condition that prevents a downstream claim.

`approval_route`: A07 for approval/final validation/release; never A06.

`evidence_ready`: a packet can be reviewed. It is not accepted.

`no_churn`: do not rerun unchanged validators without changed input.

## Immediate executable next step

Create a shared validator registry for Agent 4 with entries for the validator families already used in this repo, then make the changed-input selector consume that registry instead of relying on hardcoded filename heuristics.

That would make Agent 4 runnable by a weaker model because the model only needs to:

1. select changed input,
2. look up validator by artifact type,
3. run exact command,
4. emit proof packet,
5. validate proof packet,
6. stop.

