# Agent 5 Role-Based QA Gate Model

Generated: 2026-05-31T13:52:42-04:00

## Control Decision

Workbench evidence does not need 100% QA acceptance before display. Accepted definitions and future translation text do.

The project needs role-based gates, not one universal pass/fail score.

## Gate Types

| gate | purpose | minimum bar | acceptance owner |
|---|---|---|---|
| `display_gate` | Can this item appear in workbench/HUD evidence lanes? | source/lane label present; not blocked; not misleading authority | Agent 5 contract, Agent 6 can overrule |
| `definition_authority_gate` | Can this item occupy the top Definition slot? | `answer_eligible=true`, answer role allows definition, source/license present, not ambiguous/evidence-only | Agent 2 data, Agent 4 rendering, Agent 6 acceptance |
| `usage_navigation_gate` | Can this item appear as Usage Elsewhere? | occurrence link works, status supported/candidate/weak, ambiguous rows audit-only | Agent 3 data, Agent 6 acceptance |
| `translation_publication_gate` | Can this item become accepted translation text? | accepted decision row, source anchor, license profile direct-use OK, attribution bundle if required | Agent 6 acceptance |
| `compliance_gate` | Can this item support publication or public release claims? | provenance and license class are explicit; review-needed rows cannot silently publish | Agent 6 acceptance |
| `token_integrity_gate` | Does the clicked/rendered item refer to the correct source occurrence? | whole surface/maqaf/prefix/suffix identity preserved or clearly labeled as analysis | Agent 4 implementation, Agent 6 acceptance |

## Hidden Scores

Use hidden QA scores as diagnostics, not as a single authority score:

- `qa_display_score`: readiness for workbench display.
- `qa_authority_score`: readiness for answer/definition authority.
- `qa_compliance_score`: provenance/license confidence.
- `qa_token_integrity_score`: confidence that clicked/rendered occurrence identity is correct.
- `qa_source_trace_score`: confidence that source refs, anchors, citations, and license rows are traceable.

Suggested scale:

- `100`: accepted for that role by Agent 6 or a strict validated contract.
- `80-99`: safe for role with warnings.
- `50-79`: workbench-visible candidate only.
- `1-49`: audit/review-only.
- `0`: blocked.

Scores are lane-specific. An item can be `qa_display_score=80` and `qa_authority_score=0`.

## Display Policy

Workbench display:

- Show `supported` evidence normally when labeled.
- Show `candidate` evidence with a candidate label.
- Show `weak` evidence in lower-priority evidence/navigation lanes.
- Hide `ambiguous` evidence by default or show only in audit/review mode.
- Do not show `blocked` evidence.

Definition slot:

- Requires `definition_authority_gate`.
- Usage evidence, ambiguous rows, form references, and evidence-only rows cannot occupy this slot.

Usage Elsewhere:

- Requires `usage_navigation_gate`.
- Does not import or duplicate definitions.
- Links to the target occurrence where Agent 2 route definitions resolve in context.

Future translation publication:

- Requires `translation_publication_gate` and `compliance_gate`.
- `workbench_ok_publication_review` rows cannot become accepted translation output without explicit review.

## Agent Ownership

- Agent 1: source/render hygiene signals and source/license display surfaces.
- Agent 2: `definition_authority_gate` inputs.
- Agent 3: `usage_navigation_gate` inputs.
- Agent 4: HUD lane rendering and `token_integrity_gate`.
- Agent 5: gate contracts, relay state, board integration, and Agent 6 docket preparation.
- Agent 6: final QA/compliance acceptance and blocker classification.

## Current Project Implication

Agent 3 rows should not be blocked from the workbench just because they are not definitions. They should be shown as usage navigation when link integrity passes and status is supported/candidate/weak.

Agent 2 rows should not become public Definition authority unless the answer gate passes.

Future translation mode should not use any row directly unless it passes publication/compliance gates.

This keeps the "more evidence is better" workbench philosophy while preventing weak or non-authoritative data from becoming truth.
