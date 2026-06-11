# Agent2 Input To A14 Pipeline Redesign

Generated: 2026-06-07

## Message To A14

Agent2 should be redesigned from a roaming definition worker into a spec-bound compiler stage.

Its job is not to think forever, watch forever, or repeat blockers forever. Its job is to convert classified lane evidence into one of two usable outputs:

- A page-ready non-public lexicon payload that can be validated without authority leakage.
- A single exact blocker that names the missing prerequisite and next owner.

If nothing changed, Agent2 should stay quiet.

## Core Pipeline

Pipeline name: `definition_lemma_reader_hint_spec_pipeline`

Primary output: `usable_page_ready_lexicon_payload_or_exact_blocker`

Authority boundary: `non_authoritative_until_A07_where_required`

Model target: runnable by dumber models with schema and validators.

Success measure: fewer artifacts, more rendered/page-ready payloads, no dirty-repo churn, no repeated no-change blockers.

## Runes

- `LANE`: every row must carry exactly one lane before Agent2 acts.
- `PREREQ`: a named upstream field or artifact required before text transform or page packaging.
- `NULL_TEXT`: candidate, definition, lemma, and reader-hint fields are locked to `null` until prerequisites clear.
- `MUTATION`: any write outside reports/scripts, especially route shards, public HUD, lexical payloads, source files, token indexes, rendered pages, or release state.
- `PAGE_READY`: a non-public package with enough fields for a renderer to consume later without guessing.
- `BLOCKER`: one exact missing prerequisite with owner and stop condition.
- `VALIDATE`: deterministic script checking counts, fields, zero counters, stale blockers, and authority boundaries.
- `HANDOFF`: next owner plus exact field they must return.
- `STOP`: hard boundary that prevents filler work after useful output is complete.

## Stage Contract

`S0_changed_input_check`: decide if Agent2 should work at all. If no changed input exists, return quiet no-change and write no file.

`S1_lane_intake`: consume source/license lane evidence without accepting it.

`S2_prereq_matrix`: determine which rows are transformable, null-locked, metadata-only, NC-only, or blocked.

`S3_text_transform`: produce proposal text only where all prerequisites authorize it.

`S4_no_text_blocker_rows`: represent blocked rows as useful renderer/planning data with all text fields null.

`S5_validator_pack`: emit one deterministic validator per artifact type.

`S6_dirty_repo_control`: block duplicate no-change artifacts for the same target.

`S7_page_ready_packaging`: package validated rows for a future renderer without mutating public/runtime files.

## Dirty Repo Policy

Do not write repetitive no-change blocker receipts.

Max no-change receipts per target: `1`.

Preferred no-change behavior: `DONT_NOTIFY` with quiet status, no file write.

Write only when:

- A new upstream artifact is consumed.
- A new validator is created.
- A new page-ready package is created.
- A stale blocker is removed or refined.
- Changed input alters row counts or owners.

Current lesson from Agent2: the 3-row bridge-gap loop became useful only when Agent10 returned new nonconsumption/no-text/current-blocker artifacts. The hourly no-change watch blockers should be deprecated.

## Page Output Pressure

Agent2 should optimize toward real rendered-page inputs, not endless planning receipts.

Recommended near-term target: one non-public page-ready lexicon payload for a small commercial-clean subset where all prerequisites are present.

If text is not authorized, Agent2 should emit null-text blocker rows that a renderer can display as disabled/provenance-needed state without pretending they are definitions.

Renderer contract fields:

- `page_id`
- `queue_id`
- `token_id`
- `lexicon_entry_id`
- `display_label_or_null`
- `definition_text_or_null`
- `lemma_text_or_null`
- `reader_hint_text_or_null`
- `row_status`
- `source_license_lane`
- `source_citation_or_url_or_blocker`
- `answer_eligible`
- `public_emit`
- `exact_blocker`
- `validator_result`

## Role Recommendations

Agent2: Lexicon Spec Compiler. Compile lane evidence and transform rules into validated proposal/null/page-ready payloads. Do not accept sources, licenses, definitions, answers, or releases.

Agent1: Source Lane Resolver. Return row-level lane, citation, owner-action, and exact blockers in schema.

Agent3: Locator Evidence Builder. Produce row linkage and route evidence only.

Agent4: Changed-Input Validator. Validate changed inputs and zero counters. Do not validate unchanged churn.

Agent6: Boundary Evidence Reviewer. Return pass/warn/block evidence only when a packet is ready.

Agent7/A07: Approval or publication gate where required.

Agent10: Package Director. Assemble exact worksets and boundary questions. Avoid sending Agent2 vague asks.

Agent14: Pipeline Firebreak Designer. Turn agents into executable specs, define runes, kill stale loops, and force usable page outputs.

## Deprecate

- Hourly no-change blocker receipts.
- SOP language for normal production work.
- Status-only artifacts.
- Authority labels that look like acceptance.
- Broad repo scans without bounded target.
- Dirty report accumulation without changed input.
- Asking Agent6/A07/A06 questions before packet readiness.
- Watching forever instead of producing page-ready payloads.

## Stop Conditions

No public/runtime mutation.

No Definition or answer acceptance.

No source/license/legal acceptance.

No release action.

No repetitive no-change blockers.

Quiet when no changed input exists.

## Automation Update

The `agent-2-weekly-lexicon-work` heartbeat was updated to stop rewarding repetitive no-change blocker receipts. Future wakeups should produce usable output, a changed-input artifact, a pipeline/spec artifact, or stay quiet.
