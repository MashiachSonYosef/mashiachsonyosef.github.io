# Agent 6 Orot 14-Row Non-Public Add-Candidate Verdict

Date: 2026-06-04

Disposition: WARN-ACCEPTED for exact non-public package append only.

## Scope Reviewed

Artifacts reviewed:

- `reports/agent10-orot-14-row-nonpublic-add-candidate-packet-2026-06-04.md`
- `reports/agent10-orot-14-row-nonpublic-add-candidate-packet-2026-06-04.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`
- `reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json`
- `reports/agent13-orot-candidate-label-policy-decision-2026-06-04.json`
- `reports/agent6-orot-2026-06-04-authority-docket-verdict.md`

Reviewed boundary: add-candidate clearance for 14 rows / 150 occurrences to the non-public Orot reader-hint placeholder/candidate package only.

Not reviewed or accepted: public/runtime output, answer eligibility, route JSONL/shard writes, source/token-index/lexical-payload mutation, definition-content rows, accepted text, publication readiness, source/provenance custody acceptance, license acceptance, Definition authority, usage-as-definition authority, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text.

## Evidence Checks

- Current anchor package measured as 113 rows / 4239 occurrences.
- Candidate packet measured as 14 rows / 150 occurrences.
- Candidate token overlap with current package: 0.
- Duplicate token IDs inside packet: 0.
- All 14 candidate rows are present in Agent 1 review with `status: allowed`.
- Agent 13 June 4 policy allows `counterpart candidate` and `project-preferred counterpart candidate` only for non-public transform/dry-run planning.
- All 14 rows preserve token ID, occurrence count, selected claim ID, selected claim file, source row link, source/license lane, attribution requirement, and source manifest requirement.
- All 14 rows keep the following output/authority flags false: `answer_eligible`, `promote_to_answer`, `approved_for_public_emit`, `public_emit_ready`, `public_hud_emit_allowed`, `route_jsonl_emit_allowed`, `public_mutation_allowed_here`, `runtime_mutation_allowed_here`, `accepted_text`, `definition_content_row`, and `nc_definition_content_row`.
- Packet zero counts remain 0 for public HUD rows, route JSONL rows, route shard writes, runtime files changed, source files changed, token-index files changed, lexical-payload files changed, definition-content rows, NC definition-content rows, answer rows, and accepted-text rows.
- Source claim file `.local-cache/definition-routes/source-layer-definition-claims.jsonl` exists.
- Excluded rows remain excluded from this clearance: 10 external-link-only rows and 1 metadata-only row.

## Cleared Rows

Cleared for append to `data/build/orot/reader-hint-placeholder-candidates.json` only if the appended records match the reviewed packet rows exactly and preserve all source/license/attribution/provenance fields.

| token_id | occurrences | cleared subset | required controls |
| --- | ---: | --- | --- |
| `tok-c3c61224118a` | 31 | CC BY 4.0 counterpart candidate | OpenScriptures attribution/source manifest preserved; non-public only |
| `tok-c00726f9c271` | 2 | CC BY 4.0 counterpart candidate | OpenScriptures attribution/source manifest preserved; non-public only |
| `tok-eed4f84c09ac` | 22 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-0c8d92179033` | 19 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-cceb19874253` | 16 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-e2ce674d9f4b` | 15 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-b857d40da544` | 14 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-e26cf1bf873c` | 13 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-1cd255ea2c77` | 5 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-4385095993ec` | 3 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-74486428ad56` | 3 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-bb2527ed1403` | 3 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-0a3189fbf6e5` | 2 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |
| `tok-7da0e59043bf` | 2 | project-authored / CC0 project-preferred counterpart candidate | project-preferred disclosure required; competing edges preserved |

Cleared row count: 14.

Cleared occurrence count: 150.

Blocked row count within the reviewed 14-row append boundary: 0.

## Warning Controls

1. The two CC BY 4.0 rows may be appended only as non-public candidate planning records. Their source name, source URL/source row ID where present, CC BY 4.0 label, license URL, and source manifest linkage must remain attached. This verdict does not authorize public display or global license acceptance.
2. The twelve project-preferred rows may be appended only with the required disclosure: `project-preferred counterpart candidate; reader convenience only; competing edges preserved`. The 35 competing upstream edges in the packet must remain preserved and reachable for later review. No project-preferred row may become answer authority, top match, verified text, accepted gloss, or accepted text from this verdict.
3. Agent 1's row-level `display_allowed_from_agent1_lane` value is not public/runtime clearance. For this docket, all 14 rows remain non-public only until a separate Agent 6 public/runtime docket clears a changed package.

## Acceptance Conditions

Agent 10 may append only the 14 cleared rows above to the non-public Orot placeholder/candidate package if:

- The appended row set is exactly the reviewed 14 token IDs and 150 occurrences.
- The package continues to mark all public/runtime/output/answer/definition/accepted-text flags false for these rows.
- The package preserves source row IDs, selected claim IDs, selected claim file, source family/type, observed license, attribution text, source manifest requirement, competing edges, Agent 13 label status, and Agent 1 row status.
- The package does not add public HUD rows, route JSONL rows, route shard writes, runtime files, source files, token-index files, lexical payload files, definition-content rows, NC definition-content rows, answer rows, or accepted-text rows.
- The post-append package is validated or accompanied by a count/proof report showing expected package count 127 rows / 4389 occurrences, assuming the current 113 rows / 4239 occurrences anchor has not changed.

## Remains Blocked

- The 10 external-link-only rows remain excluded.
- The 1 metadata-only row remains excluded.
- Public/runtime/output mutation remains blocked.
- Answer eligibility remains blocked.
- Route JSONL/shard writes remain blocked.
- Source/token-index/lexical-payload mutation remains blocked.
- Definition-content rows remain blocked.
- Accepted text, accepted gloss, translation output, and publication readiness remain blocked.
- Source/provenance custody and license acceptance remain unaccepted beyond this exact non-public append boundary.

## Agent 8 Callback

Disposition: WARN-ACCEPTED for exact non-public append of 14 rows / 150 occurrences.

Docket path: `reports/agent6-orot-14-row-nonpublic-add-candidate-verdict-2026-06-04.md`

Next executable route: Agent 10 may append only the 14 cleared rows to the non-public Orot placeholder/candidate package, then return a post-append proof report with the expected package count 127 rows / 4389 occurrences and zero public/runtime/output/answer/definition/accepted-text emissions.

No Agent 1 follow-up is required before this exact non-public append because all 14 rows are present in the cited Agent 1 artifact with `status: allowed`. Agent 1 is required again before any source/license posture is widened or before excluded external-link-only / metadata-only rows are reconsidered.

No Agent 4 route is required before this exact non-public append. Agent 4/runtime proof is required only after a changed public/runtime package exists and Agent 6 is asked to review public/runtime behavior.

What must not be accepted: QA acceptance beyond this docket, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, or any public reader output.
