# Agent 5 Six-Agent Core Goals

Generated: 2026-05-31T13:13:07-04:00

## Purpose

This file defines one core goal for each worker lane, Agent 5, and Agent 6. It is meant to keep the project coordinated when chat context is incomplete, relay prompts are forgotten, or agent sessions reset.

Hierarchy update:

- Agent 6 is the QA authority above Agent 5.
- Agent 5 owns CEO/control architecture, coordination, and release gates.
- Agent 5 is project manager and relay layer to Agent 6: Agent 5 frames QA questions, prioritizes samples, and turns Agent 6 findings into relays for Agents 1-4.
- Agent 5 may create validators and spot-checks, but QA disputes and final QA calls escalate to Agent 6.
- Each Agent 5 pulse should produce a new control delta when possible: a changed relay state, new release gate, updated risk, refined workflow, Agent 6 QA brief, or clearer stop/continue decision.

Relay state must be evidence-based:

- `proposed`: Agent 5 wrote the relay, but there is no confirmation or observed implementation.
- `sent`: user confirmed the relay was pasted to the worker.
- `acknowledged`: worker responded and accepted/acted on it.
- `observed adopted`: workspace changes or worker updates clearly implement the relay.
- `not adopted`: worker output conflicts with the relay or ignores the relevant contract.
- `obsolete`: no longer needed.

## Agent 1 Core Goal: Source And Render Hygiene

Core goal:

- Keep the corpus source/render surface coherent without creating hidden generated-page drift.

Success metrics:

- Source metadata is valid and license fields are explicit.
- Rendered pages are traceable to current source data and render scripts.
- Overlay/export artifacts are present only where they are intended deliverables.
- No partial render claims without report notes.
- No CPU-heavy render loops without a clear batch boundary and stop condition.

Failure modes:

- Generated pages change in bulk without a source/report explanation.
- Site chrome or overlay exports are stale relative to source pages.
- License/source labels are presentational but not machine-checkable.
- Agent 1 duplicates Agent 4's HUD runtime work instead of preserving render hygiene.

Agent 5 one-on-one:

```text
Agent 1, report source/render hygiene only. Which source files, render outputs, and overlay/export artifacts changed? What render batch or source-import boundary do they belong to? What validation proves the changes are coherent, and what generated-page drift risk remains?
```

## Agent 2 Core Goal: Definition Route Release Candidate

Core goal:

- Produce the authoritative answer-eligible definition route layer for the current release.

Success metrics:

- A current route release stamp exists with status `release_candidate`.
- Public lookup manifest, public card count, shard count, and route-store counts reconcile.
- `answer_eligible=true` is the only path into the HUD top Definition slot.
- Ambiguous/evidence-only rows are counted and blocked from answer authority.
- Every answer/evidence row has source, citation, and license metadata.
- Agent 4 can consume one authoritative public lookup path without guessing.

Failure modes:

- The lane keeps expanding route families instead of freezing a release candidate.
- A local audit passes, but public lookup shards are stale.
- Evidence rows or ambiguous rows can rank into the visible Definition slot.
- Agent 2 duplicates Agent 3 by trying to infer broad usage meaning.

Agent 5 one-on-one:

```text
Agent 2, prove definition-route release readiness, not more coverage. What is the current release stamp ID, public card count, shard count, answer-eligible count, ambiguous count, evidence-only count, and source/license coverage? Which exact manifest/files should Agent 4 consume? What is the smallest remaining step before your lane freezes?
```

## Agent 3 Core Goal: Usage Navigation, Not Definitions

Core goal:

- Produce a usage-navigation/concordance layer that links users to other occurrences in context without claiming definition authority.

Success metrics:

- Public handoff index contains selected useful targets only.
- Rows are typed as observed usage evidence, not definitions.
- Supported/candidate/weak rows can be reader/workbench visible.
- Ambiguous rows remain audit-only or behind review.
- Each visible row has occurrence link, source ref, context snippet, usage frame/status/score, and optional related Agent 2 route IDs.
- No copied definitions in Agent 3 payloads; definitions resolve through Agent 2 at the linked occurrence.

Failure modes:

- Agent 3 tries to define words from broad usage graphs.
- HUD receives `definition: undefined` or fake definition rows from Agent 3.
- Ambiguous rows are promoted reader-facing.
- Broad expansion continues without selected-target handoff quality.
- Agent 3 duplicates Agent 2 by importing route definitions into usage payloads.

Agent 5 one-on-one:

```text
Agent 3, report usage-navigation readiness only. Which selected targets are public, how many visible supported/candidate/weak links exist, how many ambiguous rows remain audit-only, and what fields make each link clickable in context? Confirm you are not emitting definition authority, only occurrence links plus usage frame/status/source metadata.
```

## Agent 4 Core Goal: Truthful Workbench HUD

Core goal:

- Render a dense, truthful, accessible workbench HUD where click targets preserve source token identity and each evidence lane is visually and semantically distinct.

Success metrics:

- Whole surface tokens, maqaf compounds, prefixes, and suffixes do not lose occurrence identity.
- Top Definition slot only uses Agent 2 answer-eligible rows.
- Agent 3 rows render in a separate Usage Elsewhere / Usage Evidence lane.
- Missing definitions show `observed usage only`, not `undefined`.
- Source/license/citation rows remain visible and machine-traceable.
- HUD accessibility semantics match behavior: non-modal inspector or true modal, not mixed.
- Keyboard close/focus restore works; live loading/error states are announced.

Failure modes:

- Runtime wrapping splits source tokens differently than the source text.
- Maqaf or hyphen handling changes the clicked occurrence.
- Agent 3 evidence appears as definitions.
- The HUD declares modal semantics without modal behavior.
- Polished UI hides authority labels, ambiguity, or license constraints.

Agent 5 one-on-one:

```text
Agent 4, report HUD truthfulness. Did the split-token/whole-surface guard land? Which validator proves maqaf/hyphen/prefix/suffix click identity? Does Definition read only Agent 2 answer-eligible rows? Where do Agent 3 usage links render? Have HUD semantics been made non-modal inspector or true modal? What remains before marketing-polish claims are safe?
```

## Agent 5 Core Goal: Control Architecture And Finish Criteria

Core goal:

- Keep all lanes coordinated around typed authority, release gates, and future translation readiness without duplicating worker implementation lanes or overriding Agent 6 QA authority.

Success metrics:

- Control board stays current.
- Relay prompts have state: proposed, sent, acknowledged, observed adopted, not adopted, or obsolete.
- Small validators/contracts catch cross-lane drift before broad work repeats.
- Agent 2/3/4 ownership stays distinct.
- QA questions are routed to Agent 6 when they require final acceptance, rejection, or detailed word-by-word verification.
- Agent 6 receives concise, scoped QA briefs instead of broad "check everything" requests.
- Future translation memory can be built from current evidence without recollecting source data.
- Reports explain stop/continue calls with evidence, not vibes.

Failure modes:

- Agent 5 assumes a relay was sent or adopted without evidence.
- Control notes become passive QA rather than lane direction.
- Agent 5 duplicates worker jobs instead of making contracts/gates.
- Agent 5 treats its spot checks as final QA instead of escalating to Agent 6.
- Research does not translate into local constraints or validators.
- The project gains data but loses authority boundaries.

Agent 5 self-review:

```text
Agent 5, prove control value. What new artifact, validator, release gate, or lane decision did this pass create? Which relay states changed by confirmation or observed adoption? Which agent is the current bottleneck, why, and what is the smallest next control action?
```

## Agent 6 Core Goal: Independent QA Authority

Core goal:

- Verify the workbench output independently and decide whether the produced artifacts are correct enough to advance.

Success metrics:

- Word-level HUD checks compare clicked surface word, normalized form, maqaf/hyphen behavior, prefix/suffix handling, definition slot, morphology, source refs, citations, and license rows.
- QA samples cover representative Tanakh, commentary, Orot/workbench, and route-card cases.
- Agent 6 reports concrete defects with affected lane ownership.
- Agent 6 distinguishes blocker, warning, polish, and acceptable-risk findings.
- Agent 6 confirms when Agent 5 control assumptions are wrong, stale, or too optimistic.

Failure modes:

- QA becomes another implementation lane.
- QA only reruns validators without manual/semantic judgment.
- QA accepts HUD output without checking source/citation/license alignment.
- QA findings lack responsible lane ownership.
- Agent 5 ignores or downranks Agent 6 findings.

Agent 5 one-on-one with Agent 6:

```text
Agent 6, act as independent QA authority over Agent 5's control board. Which current release gates are truly verified, which are only assumed from reports, and which worker lane owns each blocker? Give blocker/warning/polish categories and the smallest verification sample that would change your confidence.
```

Agent 5 project-manager promise to Agent 6:

```text
Agent 5 will not ask Agent 6 to inspect everything. Agent 5 will provide scoped QA briefs: what is report-backed, what is assumed, what changed since last pulse, which samples matter, and which worker lane owns any likely correction.
```

## Current Bottleneck Order

1. Agent 4: split-token / whole-surface HUD integrity, then HUD semantic accessibility.
2. Agent 2: preserve route release-candidate discipline and avoid new expansion before freeze.
3. Agent 3: keep usage navigation scoped and avoid definition authority.
4. Agent 1: keep render/source drift explainable.
5. Agent 5: maintain relay-state tracking and cross-lane release gates.
6. Agent 6: independently verify QA gates and overrule Agent 5 when observed output contradicts the control board.

## Control Principle

The workbench can be dense, but authority must stay typed. More data is good only when every row says what it is allowed to do.
