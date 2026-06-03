# Agent 2 Orot Sefaria Answer Transform Spec

Status: transform boundary specification only.

Owner lane: Agent 2 pipeline data, routed by Agent 10.

Highest permissible claim: this document defines the gates required before Sefaria lexicon metadata can become a future answer-candidate row. It does not approve any lexicon, source custody, definition text, accepted gloss, translation text, public HUD output, QA state, or publication readiness.

## Current Evidence

Input audit:

- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json`
- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.md`

Audit result:

- Top Orot gap rows audited: `500`.
- Scoped occurrences: `8427`.
- Rows with any Sefaria lexicon hit: `314`.
- Occurrences covered by any Sefaria lexicon hit: `6006`.
- Row hit rate: `62.8%`.
- Occurrence hit rate: `71.3%`.
- Answer rows emitted: `0`.
- Public HUD rows emitted: `0`.
- Route JSONL rows emitted: `0`.
- Definition content stored: `0`.

Observed lexicon families:

- `Jastrow Dictionary`.
- `Klein Dictionary`.
- `BDB Augmented Strong`.
- `BDB Dictionary`.
- `BDB Aramaic Dictionary`.

## Non-Authority Policy

A Sefaria hit is source-discovery evidence only.

It is not:

- a definition authority decision;
- a usage-as-definition decision;
- an accepted gloss;
- an accepted translation;
- a reader-facing text approval;
- a QA acceptance;
- source/provenance custody acceptance;
- publication readiness.

The inline English counterpart and match percent, when later generated, remain reader convenience hints. They are not semantic truth or accepted translation text.

## Candidate Row Eligibility Gates

Agent 2 may set `answer_eligible=true` for a new Sefaria-derived answer-candidate row only when all gates below are true.

### Gate 1: License And Custody

Required fields:

- `lexicon_family`.
- `lexicon_name`.
- `license_custody_status`.
- `license_custody_artifact`.
- `source_storage_scope`.
- `attribution_required`.
- `display_allowed`.
- `storage_allowed`.

Allowed `license_custody_status` values:

- `agent1_6_cleared_for_storage_and_display`.
- `agent1_6_cleared_for_link_or_citation_only`.
- `blocked_unresolved_license`.

Only `agent1_6_cleared_for_storage_and_display` may permit storing answer text.

`agent1_6_cleared_for_link_or_citation_only` may permit metadata/link rows but must not create reader-facing answer text.

`blocked_unresolved_license` must emit no answer row.

### Gate 2: Morphology Relation

Required fields:

- `surface`.
- `normalized`.
- `headword`.
- `morphology_relation`.
- `morphology_rule_id`.
- `morphology_confidence_basis`.

Allowed `morphology_relation` values before Agent 6 review:

- `exact_after_mark_strip`.
- `prefix_or_clitic_possible`.
- `needs_morphology_disambiguation`.
- `blocked_no_allowed_relation`.

Only `exact_after_mark_strip` may proceed automatically to the next gate.

`prefix_or_clitic_possible` must remain candidate-only unless a pipeline morphology rule proves the prefix or clitic relationship.

`needs_morphology_disambiguation` and `blocked_no_allowed_relation` must emit no answer row.

### Gate 3: Candidate Disambiguation

Required fields:

- `candidate_count`.
- `lexicon_hit_count`.
- `selected_candidate_id`.
- `selection_rule_id`.
- `selection_basis`.
- `alternative_candidate_ids`.
- `manual_semantic_arbitration`.

`manual_semantic_arbitration` must be `false`.

Allowed selection bases:

- exact single lexicon hit after approved morphology relation;
- deterministic pipeline ranking from approved source family;
- deterministic tie-break rule approved in this transform spec or later Agent 6-reviewed amendment.

Disallowed selection bases:

- highest score automatically becomes truth;
- Agent 2 invented definition;
- Agent 10 product preference;
- manual semantic judgment;
- phrase/paraphrase/form-reference row flipped into an answer.

### Gate 4: Source Citation

Required fields:

- `source_url`.
- `source_ref`.
- `rid`.
- `headword`.
- `parent_lexicon`.
- `parent_lexicon_source`.
- `parent_lexicon_attribution`.
- `source_capture_artifact`.

At least one stable citation field must resolve:

- `source_url`; or
- `source_ref`; or
- `rid` plus `parent_lexicon` and `headword`.

If no stable citation field resolves, emit no answer row.

### Gate 5: Answer Text Source

Required fields:

- `answer_text`.
- `answer_text_source_field`.
- `answer_text_transform_rule_id`.
- `answer_text_license_scope`.
- `answer_text_omits_markup`.
- `answer_text_is_reader_hint`.

This audit intentionally stores no answer text.

Future answer text may come only from a source field approved by Agent 1/6 for storage and display. The transform must strip unsafe markup and must preserve citation metadata. The result is a reader hint candidate, not accepted text.

## Output Contract

A future answer-candidate row must be a new row, not a relabeled evidence row.

Required output fields:

- `candidate_id`.
- `token_id`.
- `surface`.
- `normalized`.
- `occurrences`.
- `lexicon_entry_id`.
- `source_family`.
- `source_url`.
- `source_ref`.
- `source_rid`.
- `headword`.
- `answer_text`.
- `answer_role`.
- `answer_eligible`.
- `candidate_status`.
- `boundary_safe`.
- `license_custody_status`.
- `morphology_relation`.
- `selection_rule_id`.
- `match_percent_basis`.
- `not_definition_authority`.
- `not_usage_as_definition`.
- `not_translation_output`.
- `not_accepted_gloss`.
- `not_accepted_translation_text`.

Required values for a usable candidate:

- `answer_role`: `reader_answer_candidate`.
- `answer_eligible`: `true`.
- `candidate_status`: `candidate_not_accepted`.
- `boundary_safe`: `true`.
- `not_definition_authority`: `true`.
- `not_usage_as_definition`: `true`.
- `not_translation_output`: `true`.
- `not_accepted_gloss`: `true`.
- `not_accepted_translation_text`: `true`.

## Dry-Run Target

After Agent 1/6 license/custody gates and Agent 2 transform gates are satisfied, Agent 10 may run a downstream dry run.

Useful target:

- `final_hint_occurrences > 40073`.
- Denylist total: `0`.
- Old-HUD marker total: `0`.
- Public HUD mutation before Agent 6 review: `0`.

## Agent 8 Callback

- Status: transform spec produced.
- Artifact path: `reports/agent2-orot-sefaria-answer-transform-spec-2026-06-03.md`.
- Selected page or blocker: Orot flagship data-fill transform boundary; no public page mutation.
- Agent 1 needed: yes, for lexicon-family license/custody status.
- Agent 2 needed: yes, for pipeline-only candidate transform after gates.
- Agent 4 needed: no, because no runtime artifact changed.
- Agent 7/13 decision needed: only if the mission wants unresolved lexicon text stored/displayed despite missing custody.
- Next recommended executable route: Agent 1/6 license-boundary review, then Agent 2 zero-or-safe dry-run transform.

## What Must Not Be Accepted

- QA acceptance.
- Validated public/runtime acceptance.
- Source custody.
- Source/provenance acceptance.
- Definition authority.
- Usage-as-definition authority.
- Translation output.
- Accepted gloss.
- Accepted translation text.
- Public HUD mutation.
- Route JSONL mutation.
- Publication readiness.
