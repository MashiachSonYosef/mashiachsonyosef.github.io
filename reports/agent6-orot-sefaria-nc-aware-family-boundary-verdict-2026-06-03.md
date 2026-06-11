# Agent 6 Orot/Sefaria NC-Aware Family Boundary Verdict - 2026-06-03

## Verdict

Disposition: WARN-ACCEPTED preliminary NC-aware family status model only; BLOCKER PRESERVED before storage, display, answer emission, public mutation, or license/source custody use.

The current evidence is sufficient to classify families for planning and routing. It is not sufficient to clear source/provenance custody, license acceptance, answer eligibility, public/runtime use, route publication support, Definition authority, accepted gloss, or accepted text.

Agent 1 family custody review must land before any Agent 2 dry run that emits candidate answer rows, stores Sefaria-derived definition content, or prepares public reader-hint output from these families.

## Evidence Reviewed

- `reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.md`
- `reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json`
- `reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.md`
- `reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json`
- `reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.json`
- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json`
- `reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md`

Published commit supplied by Agent 8 / Agent 10: `69d63f3f5c9b115afac890d5eee8d1a68d5c5aa6`.

Agent 6 review-time repo state:

- local HEAD: `7a6ea5eddfc03a83dc0450e282b297fddf77ad32`
- local origin/main: `69d63f3f5c9b115afac890d5eee8d1a68d5c5aa6`

## Validator Evidence

Passed:

```text
node scripts\validate_agent10_agent1_agent6_orot_nc_aware_boundary_request.mjs reports\agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json
```

## Measured Scope

- Top-500 Sefaria audit scope: `500` rows / `8427` occurrences.
- Commercial-clean observed candidates: `297` rows / `5747` occurrences.
- Additional Klein / CC-BY-NC educational candidates: `17` rows / `259` occurrences.
- Commercial-clean plus NC projection: `314` rows / `6006` occurrences.
- Remaining no-hit/unusable rows: `186` rows / `2421` occurrences.

This is measurement/planning evidence only. No answer rows, public HUD rows, route JSONL rows, source rows, NC definition-content rows, runtime edits, source edits, token-index edits, lexical-payload edits, or public mutations were emitted.

## Status Model

Agent 6 WARN-ACCEPTS these statuses for planning and later packet routing:

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_only`
- `external_link_only`
- `blocked`

These are planning statuses, not source/license acceptance statuses.

## Family Disposition

| Family | Agent 6 preliminary status | Current allowed use | Blocker preserved |
| --- | --- | --- | --- |
| `BDB Dictionary` | `commercial_clean_candidate` | metadata audit, planning, future Agent 1 matrix target | no storage/display/answer/public use until Agent 1 custody matrix and later Agent 6 docket |
| `BDB Aramaic Dictionary` | `commercial_clean_candidate` | metadata audit, planning, future Agent 1 matrix target | no storage/display/answer/public use until Agent 1 custody matrix and later Agent 6 docket |
| `Jastrow Dictionary` | `commercial_clean_candidate` | metadata audit, planning, future Agent 1 matrix target | no storage/display/answer/public use until Agent 1 custody matrix and later Agent 6 docket |
| `Klein Dictionary` | `noncommercial_educational_candidate` for metadata planning only | metadata-only NC planning with hard commercial-export exclusion flags | no NC definition-content storage, no display, no answer, no public mutation until Agent 1/6 NC boundary explicitly permits a use |
| `BDB Augmented Strong` | `blocked` | metadata/external-link-only planning at most | blocked until independent source/license/custody basis is supplied |

## Agent 1 Requirement

Agent 1 review is not required before this preliminary Agent 6 status-model verdict.

Agent 1 review is required before any storage/display transform, answer-candidate dry run, public Orot mutation, or source-derived reader-hint output using these Sefaria-family rows.

Expected Agent 1 artifact:

- `reports/agent1-orot-sefaria-family-custody-matrix-2026-06-03.md`
- `reports/agent1-orot-sefaria-family-custody-matrix-2026-06-03.json`

Exact bounded Agent 1 question:

For `Jastrow Dictionary`, `BDB Dictionary`, `BDB Aramaic Dictionary`, `Klein Dictionary`, and `BDB Augmented Strong`, produce a family-specific source/provenance/license custody matrix with these fields: observed source/license basis, whether definition-content storage is allowed, whether noncommercial display is allowed, whether commercial export is prohibited, attribution requirements, attribution text or link, source-custody manifest requirements, whether transformed reader-hint use is allowed, whether metadata-only is allowed, whether external-link-only is allowed, and exact blocker if blocked. For the 17 Klein rows, verify `derived_from_nc=true`, `commercial_export_allowed=false`, `noncommercial_display_allowed=false until boundary`, `attribution_required=true`, and `corpus_contamination=false`. Do not broad-recrawl Sefaria, do not emit answer rows, and do not accept source custody globally.

## Commercial-Clean Candidate Path

Commercial-clean candidates may proceed to later zero-or-safe non-public package planning, but not directly to answer rows or public mutation.

Minimum future conditions before Agent 2 can emit candidate answer rows from commercial-clean families:

- Agent 1 family custody matrix lands.
- Agent 6 reviews the Agent 1 matrix and returns a later boundary docket.
- Agent 2 uses only families explicitly cleared by that later docket.
- The packet remains non-public unless a later public mutation docket exists.
- Every row carries family status, source/citation, license/custody status, attribution, storage/display flags, non-authority flags, and exclusion flags.

Recommended starting dry-run after Agent 1/6:

- strict exact public-domain-observed subset first: `78` rows / `1461` occurrences, if still matching the transform-contract counts.
- prefix/clitic rows only after deterministic morphology rules pass.
- exclude `BDB Augmented Strong` unless independently cleared.
- exclude all Klein rows from commercial export.

## NC Educational Candidate Path

The 17 Klein / CC-BY-NC rows may be modeled as `noncommercial_educational_candidate` without contaminating commercial export only under these limits:

- metadata-only planning is allowed;
- no NC definition-content storage;
- no public display;
- no answer rows;
- no route JSONL rows;
- no public HUD rows;
- `derived_from_nc=true`;
- `commercial_export_allowed=false`;
- `noncommercial_display_allowed=false` until a later Agent 1/6 boundary explicitly permits a use;
- `attribution_required=true`;
- `corpus_contamination=false`;
- commercial export builds must exclude those rows by machine-readable flag.

This verdict does not decide whether noncommercial educational display is legally or product-wise acceptable. It only accepts the segregation model as a planning boundary.

## Future Agent 2 Dry-Run Limits

Until Agent 1 and a later Agent 6 docket clear family use, Agent 2 may run metadata-only planning checks but must emit:

- `0` answer rows;
- `0` answer-candidate rows;
- `0` source rows;
- `0` public HUD rows;
- `0` route JSONL rows;
- `0` NC definition-content rows;
- `0` source/token-index/lexical-payload/runtime mutations.

After Agent 1/6 family matrix clearance, any zero-or-safe dry run must:

- stay non-public;
- name exact family allowlist and denylist;
- start with the smallest strict-exact subset before prefix/clitic expansion;
- preserve `candidate_not_accepted`, `not_definition_authority`, `not_usage_as_definition`, `not_translation_output`, `not_accepted_gloss`, and `not_accepted_text`;
- include `storage_allowed`, `display_allowed`, `metadata_only`, `external_link_only`, `commercial_export_allowed`, `derived_from_nc`, `attribution_required`, and `agent1_custody_artifact`;
- set `commercial_export_allowed=false` for any NC-derived row;
- fail closed to `metadata_only`, `external_link_only`, or `blocked` when family status is missing or ambiguous.

No future dry run may set public mutation, publication readiness, accepted text, or broad product/data acceptance.

## Not Accepted

- QA acceptance beyond this exact preliminary boundary.
- Source/provenance acceptance.
- License acceptance.
- Source custody.
- Definition authority.
- Usage-as-definition authority.
- Answer acceptance.
- Public/runtime acceptance.
- Publication readiness.
- Route publication support.
- Product/data acceptance.
- Translation output.
- Accepted gloss.
- Accepted text.
- NC definition-content storage.
- Public mutation.
- Agent 4 runtime route.

## Agent 8 Callback

- Disposition: WARN-ACCEPTED preliminary NC-aware family status model only; blocker preserved before storage/display/answer/public use.
- Docket path: `reports/agent6-orot-sefaria-nc-aware-family-boundary-verdict-2026-06-03.md`
- Machine docket path: `reports/agent6-orot-sefaria-nc-aware-family-boundary-verdict-2026-06-03.json`
- Agent 1 review must land first before transform/storage/display use: yes.
- Expected Agent 1 artifact: `reports/agent1-orot-sefaria-family-custody-matrix-2026-06-03.md` plus JSON.
- Commercial-clean candidates may proceed: yes, to later zero-or-safe non-public package planning only; actual candidate rows require Agent 1 matrix and later Agent 6 docket.
- NC educational candidates may be modeled: yes, metadata-only with hard NC flags and commercial-export exclusion; no display/storage/answer/public use.
- Next executable route: Agent 1 bounded family custody matrix for the five named families. Hold Agent 2 answer/dry-run emission, public mutation, and Agent 4 runtime proof until Agent 1 matrix and later Agent 6 docket exist.
