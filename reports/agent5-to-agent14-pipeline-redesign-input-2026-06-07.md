# Agent 5 Input To Agent 14 - Pipeline Redesign

Generated: 2026-06-07

Source: Agent 5 orchestration/proof lane input for Agent 14 company redesign.

## Position

Agent 5 should become the pipeline compiler and execution receipt lane, not a broad coordinator, status-pulse author, or acceptance authority.

The redesign should move from SOP language to executable specifications. Each pipeline should be runnable by a weaker model because the hard thinking is encoded in contracts, required fields, validators, stop conditions, and exact handoffs.

## Agent 5 Pipeline Proposal

### 1. Intake Compile

Input: owner/Agent 7/Agent 8/Agent 10 direction, returned worker artifact, or exact blocker.

Agent 5 converts the input into a runnable work contract only if every required field exists:

`pipeline_id | target | lane | files | exact command/script | output artifact | schema/counts | validator | authority boundary | repo-dirt rule | timeout | stop condition | handoff owner`

If a field is missing, Agent 5 returns `missing_task_field_blocker` instead of asking a worker to infer the gap.

### 2. Direct Production Routing

Primary workers remain direct:

- Agent 1: source/license/custody/source-lane classification and Hebrew import.
- Agent 2: definition/lemma/reader-hint transforms after source-lane evidence.
- Agent 3: crossmatch/linkage/dedupe/navigation matrices.
- Agent 4: validators/prereqs/runtime checks only on exact changed input.
- Agent 10: release/package strategy and Agent 6-ready boundary packets.

Agent 5 routes only exact contracts or exact blockers. It should not route vague goals like "finish Orot" or "check definitions."

### 3. Return Intake

Every return must be converted into one of four states:

- `usable_output`: artifact exists, schema/counts present, validator result present or exact missing-validator blocker.
- `authority_boundary_needed`: Agent 6, Agent 7, or Agent 10 handoff required before use.
- `missing_task_field_blocker`: output is not runnable/usable because a named field is missing.
- `process_timeout`: command exceeded a bounded timeout and must not be treated as evidence.

Minimum return row:

`agent | target | useful artifact/contract | counts/rows | validator | exact blocker | next handoff | stop condition`

### 4. Dirty Repo Pipeline

The repo should never be treated as ambient chaos. Dirty repo state becomes a product pipeline:

`file | source lane | artifact class | owner | generated/manual | keep/stage/exclude/rebuild | validator | blocker | stop condition`

Agent 5 should enforce:

- no `git add -A`;
- no `git reset --hard`;
- no blind deletion;
- no "untracked means junk";
- no "generated means safe";
- every dirty file gets classified into a staging/rebuild/exclude decision.

This is one of the highest-value chaos reducers because it turns repo dirt into executable inventory.

### 5. Renderable Corpus Pipeline

Ordinary corpus pages should become visible before every definition is approved.

Agent 5 should own the perpetual render/churn queue after pipeline shape is proven:

`work_id | source_file | render command | unresolved rows | TBD display rule | output page | validator | promotion gate | blocker`

Rules:

- `TBD` is display-integrity only.
- `TBD` is not accepted definition, accepted gloss, answer text, source/license acceptance, or final validation.
- Ordinary source-page visibility does not require every definition to be approved.
- Agent 7/Agent 10 gates are needed only when a page is promoted to featured/proved/Orot-style pipeline status.
- Do not touch Orot unless owner explicitly reopens Orot.

Near-term safe queue source from current Agent 5 proof: `data/sources/daniel.json` with `work_id=daniel`, after confirming exact non-Orot render command.

### 6. Timeout And Stop-Control

Every local process needs a timeout or documented interactive reason before it starts.

Required timeout report:

`process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`

A still-running process is not evidence. A hung command must not be retried without changing timeout, scope, or stop condition.

## What Agent 5 Should Stop Doing

- Stop producing long coordination narratives when a compact receipt would work.
- Stop preserving `no_queued_item` as a stable end state.
- Stop routing work when required fields are missing.
- Stop treating proof/control state as valuable unless it makes a pipeline callable, restorable, or safer to run.
- Stop asking strong models to infer missing runes that should be explicit contract fields.

## What Agent 5 Should Preserve

- Exact artifact paths.
- Counts and schema.
- Validator results.
- Authority boundaries.
- Row/subset-specific Agent 6 questions.
- Agent 7/Agent 10 promotion gates.
- Process timeout records.
- Repo-dirt classification.
- Next executable handoff.

## Recommended Company Shape

Use specifications, not SOPs, as the execution substrate:

1. `Spec`: defines the pipeline contract and allowed states.
2. `Runner`: executes exact commands only.
3. `Validator`: checks schema/counts/boundaries.
4. `Gate`: names who can promote or accept.
5. `Receipt`: records artifact, blocker, next handoff.

If a weaker model cannot run the task from the spec, the spec is incomplete.

## Boundary

This is design input only. No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no release action, no Orot mutation, and no repo cleanup action.
