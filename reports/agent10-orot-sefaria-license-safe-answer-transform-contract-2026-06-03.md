# Agent 10 Orot Sefaria License-Safe Answer Transform Contract

Status: bounded transform-contract planning packet.

Owner lane: Agent 10 release owner, responding to Agent 8 route from Agent 12 / Oracle 9 advisory.

Highest permissible claim: this packet defines the license-safe answer-transform contract and exact blocker route for future Orot fill work. It does not accept QA, source/provenance, license, public/runtime, publication, route support, Definition authority, usage-as-definition authority, answer rows, definition text, product/data state, or translation text.

## Inputs Checked

- `reports/agent12-agent10-orot-sefaria-definition-coverage-advisory-2026-06-03.md`
- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json`
- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.md`
- `reports/agent2-orot-sefaria-answer-transform-spec-2026-06-03.md`
- `reports/agent10-agent1-sefaria-lexicon-license-boundary-request-2026-06-03.md`
- `reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.json`
- `reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.md`
- `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.json`
- `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.md`

## Current Measured State

Top-500 Sefaria hit audit:

- Rows audited: `500`.
- Occurrences audited: `8427`.
- Rows with any Sefaria hit: `314`.
- Occurrences covered by any Sefaria hit: `6006`.
- Answer rows emitted: `0`.
- Public HUD rows emitted: `0`.
- Route JSONL rows emitted: `0`.
- Definition content stored: `0`.

Public-domain-observed preview:

- Public-domain-observed rows: `297`.
- Public-domain-observed occurrences: `5747`.
- Strict exact preview rows / occurrences: `78` / `1461`.
- Prefix or clitic preview rows / occurrences: `129` / `3035`.
- Morphology-disambiguation rows / occurrences: `90` / `1251`.
- Blocked-only non-public-domain or unresolved rows / occurrences: `17` / `259`.
- No Sefaria hit rows / occurrences: `186` / `2421`.
- Projected final hint occurrences if strict exact rows later clear: `41534`.
- Projected final hint occurrences if prefix/clitic rows later clear too: `44569`.
- Answer rows emitted: `0`.
- Source rows emitted: `0`.
- Public HUD rows emitted: `0`.
- Route JSONL rows emitted: `0`.

The projections are planning numbers only. They do not authorize output rows, reader hints, source storage, display, or publication.

## Source Families By Status

### Cleared-If-Agent1/6

These families have observed Sefaria version metadata consistent with a public-domain-friendly route, but they are not cleared until Agent 1 custody and Agent 6 boundary disposition are recorded:

| Family | Observed license metadata | Current allowed use | Blocker |
| --- | --- | --- | --- |
| `Jastrow Dictionary` | `Public Domain` | metadata audit and planning only | Agent 1 custody plus Agent 6 storage/display boundary |
| `BDB Dictionary` | `Public Domain` | metadata audit and planning only | Agent 1 custody plus Agent 6 storage/display boundary |
| `BDB Aramaic Dictionary` | `Public Domain` | metadata audit and planning only | Agent 1 custody plus Agent 6 storage/display boundary |

### Blocked

These families must not produce public/runtime answer text under the current boundary:

| Family | Observed status | Current allowed use | Blocker |
| --- | --- | --- | --- |
| `Klein Dictionary` | `CC-BY-NC` observed | metadata audit only unless explicitly cleared | noncommercial-license decision and owner/Agent 1/6 posture |
| `BDB Augmented Strong` | no independent license observed in version scout | metadata audit only | independent source/license/custody evidence |
| CAL-style external lexicons | copyright-sensitive or unclear in this lane | external citation/lookup planning only | explicit license posture and custody route |
| Any unclear family | unresolved | metadata/link-only at most | family-specific Agent 1/6 disposition |

### Metadata/Link-Only Until Disposition

All Sefaria-derived rows remain metadata/link-only until a family-specific disposition exists. Metadata/link-only does not permit answer text, accepted glosses, route JSONL, public HUD rows, or source payload writes.

## Future Fill-Producing Candidate Packet Contract

A future Agent 2 packet may be fill-producing only if it creates new candidate rows with every field below. Existing evidence, phrase, paraphrase, form-reference, or audit rows must not be relabeled into answers.

Required row identity fields:

- `candidate_id`.
- `token_id`.
- `surface`.
- `normalized`.
- `occurrences`.
- `source_family`.
- `parent_lexicon`.
- `headword`.
- `rid`.
- `source_ref`.
- `source_url`.

Required license and custody fields:

- `license_custody_status`.
- `license_custody_family_status`.
- `agent1_custody_artifact`.
- `agent6_boundary_artifact`.
- `storage_allowed`.
- `display_allowed`.
- `metadata_only`.
- `attribution_required`.
- `attribution_text`.
- `version_title`.
- `version_source`.

Required morphology fields:

- `morphology_relation`.
- `morphology_rule_id`.
- `morphology_confidence_basis`.
- `surface_to_headword_rule`.
- `prefix_or_clitic_removed`.
- `normalization_rule_id`.

Allowed morphology values before Agent 6 review:

- `exact_after_mark_strip`.
- `prefix_or_clitic_proven_by_rule`.
- `blocked_needs_morphology_disambiguation`.
- `blocked_no_allowed_relation`.

Required disambiguation fields:

- `candidate_count`.
- `selected_candidate_id`.
- `selection_rule_id`.
- `selection_basis`.
- `alternative_candidate_ids`.
- `manual_semantic_arbitration`.

Required values:

- `manual_semantic_arbitration`: `false`.
- `selection_basis` must be deterministic pipeline evidence, not highest score as truth.

Required answer fields:

- `answer_text`.
- `answer_text_source_field`.
- `answer_text_transform_rule_id`.
- `answer_text_license_scope`.
- `answer_text_omits_markup`.
- `answer_text_is_reader_hint`.

Required non-authority fields:

- `answer_role`: `reader_answer_candidate`.
- `answer_eligible`: `true`.
- `candidate_status`: `candidate_not_accepted`.
- `boundary_safe`: `true`.
- `not_definition_authority`: `true`.
- `not_usage_as_definition`: `true`.
- `not_translation_output`: `true`.
- `not_accepted_gloss`: `true`.
- `not_accepted_translation_text`: `true`.
- `not_publication_readiness`: `true`.

## Zero-Emission Stop Condition

Until Agent 1/6 family-specific disposition lands:

- Emit `0` answer rows.
- Emit `0` answer-candidate rows.
- Emit `0` source rows.
- Emit `0` public HUD rows.
- Emit `0` route JSONL rows.
- Store `0` definition-content rows.
- Mutate `0` source files.
- Mutate `0` lexical payload files.
- Mutate `0` runtime HTML/HUD/shard files.
- Run no render/deploy/browser/public validators for this Sefaria lane.

Permitted work while waiting:

- Metadata-only audit expansion.
- Contract validators.
- Agent 1/6 custody packets.
- Agent 2 dry-run planning that writes no candidate/output rows.

## Next Required Calls

### Agent 1

Objective: produce a family-specific source/provenance/license custody matrix for:

- `Jastrow Dictionary`.
- `BDB Dictionary`.
- `BDB Aramaic Dictionary`.
- `Klein Dictionary`.
- `BDB Augmented Strong`.

Required output: one Agent 1 artifact that states for each family whether storage and display are allowed, metadata-only is allowed, external-link-only is allowed, or the family is blocked. It must name required attribution and source-custody manifest requirements.

### Agent 6

Objective: issue a pass/warn/block boundary disposition over the Agent 1 family matrix plus this transform contract.

Required output: one Agent 6 artifact that states which families, if any, may be used by Agent 2 for a zero-or-safe fill-producing dry run, and which row-level evidence Agent 2 must provide.

### Agent 2

Objective after Agent 1/6 only: run a zero-or-safe fill-producing dry run over cleared families, starting with strict exact rows before prefix/clitic rows.

Initial dry-run target:

- Strict exact pass: test the `78` strict exact preview rows / `1461` occurrences.
- If clean: test the `129` prefix/clitic rows / `3035` occurrences only under deterministic morphology rules.
- Keep `final_hint_occurrences > 40073`.
- Denylist total: `0`.
- Old-HUD total: `0`.
- Public HUD mutation before Agent 6 review: `0`.

## Exact Blocker

Blocked from answer emission by missing Agent 1/6 family-specific license/custody disposition.

Smallest unblock route:

1. Agent 1 returns a source/provenance/license custody matrix for the five Sefaria lexicon families.
2. Agent 6 returns a boundary disposition accepting or blocking use of those family statuses for an Agent 2 zero-or-safe dry run.
3. Agent 2 runs a dry run over cleared families only, emitting no public HUD/runtime output unless separately approved.

## Agent 8 Callback

- Status: Agent 10 license-safe answer-transform contract packet produced.
- Artifact path: `reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md`.
- Selected page or blocker: Orot flagship data-fill bridge; blocked from answer emission by missing Agent 1/6 family-specific license/custody disposition.
- Agent 1 needed: yes, for family-specific source/provenance/license custody matrix.
- Agent 6 needed: yes, for pass/warn/block boundary over Agent 1 matrix and this transform contract.
- Agent 2 needed: only after Agent 1/6 disposition, for a zero-or-safe dry run over cleared families.
- Agent 4 needed: no; no public/runtime artifact changed.
- Agent 7/13 decision needed: only if unresolved, noncommercial, or semantic-policy exceptions are proposed.
- Next recommended executable route: send this packet plus the existing license-boundary request to Agent 1/6; do not run answer emission, render, deploy, browser proof, or public validators for this Sefaria lane until a fill-producing candidate packet exists.

## What Must Not Be Accepted

- QA acceptance.
- Source/provenance acceptance.
- License acceptance.
- Public/runtime acceptance.
- Publication readiness.
- Route publication support.
- Definition authority.
- Product/data acceptance.
- Usage-as-definition authority.
- Answer-row acceptance.
- Definition-text acceptance.
- Accepted gloss.
- Accepted translation text.
