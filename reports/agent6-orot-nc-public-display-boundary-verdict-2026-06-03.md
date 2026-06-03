# Agent 6 Orot NC/Klein Public Display Boundary Verdict - 2026-06-03

## Disposition

WARN-ACCEPTED for NC/Klein public-display contract shape only.

Agent 6 clears the proposed NC/Klein placeholder metadata contract as a basis for Agent 10 to prepare a changed public/runtime package for the 17 NC/Klein rows. This docket does not clear public/runtime mutation or public/runtime acceptance by itself.

This verdict does not accept QA beyond this boundary, source/provenance custody, license clearance, Definition authority, usage-as-definition authority, answer acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, or commercial export permission.

## Evidence Reviewed

- `reports/agent10-orot-nc-public-display-boundary-request-2026-06-03.json`
- `reports/agent10-orot-nc-public-display-boundary-request-2026-06-03.md`
- Prior Agent 6 blocker: `reports/agent6-orot-public-placeholder-promotion-boundary-verdict-2026-06-03.md`

## Validator Evidence

- `node scripts\validate_agent10_orot_nc_public_display_boundary_request.mjs`
- Result: passed.

Agent 6 also scanned all 17 NC/Klein rows. Result: 17/17 rows preserve `lane=noncommercial_educational_candidate`, `family_status=noncommercial_educational_candidate`, `source_license_group=CC_BY_NC`, `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `corpus_contamination=false`, `definition_text_stored_now=false`, `nc_definition_content_stored_now=false`, `public_metadata_display_authorized_now=false`, `public_placeholder_emit_authorized_now=false`, and `commercial_export_exclusion_required=true`.

## Cleared Subset

### NC/Klein Placeholder Metadata Contract Rows

Disposition: WARN-ACCEPTED for changed-package preparation only.

Rows cleared for contract shape: 17/17.

Occurrences represented: 259.

Cleared row IDs:

- `tok-e1419d66ddac`
- `tok-09a1636a29b2`
- `tok-3b3b23913614`
- `tok-1a6106348f82`
- `tok-e3f57c129127`
- `tok-24d0fe4dc457`
- `tok-da3c733e62e9`
- `tok-6166f1a4fa92`
- `tok-dd1eea95c2a3`
- `tok-292c48eab8fb`
- `tok-fb9a2ed877ae`
- `tok-1fb8cc9987d7`
- `tok-663d95d67734`
- `tok-8dc563525306`
- `tok-f6281bedc002`
- `tok-83eb6d219c1c`
- `tok-9cf963c5483d`

## Allowed Fields For Next Changed Package

Agent 10 may prepare a changed public/runtime package for these 17 row IDs only with this machine-readable placeholder metadata shape:

- `token_id`
- `placeholder_kind=reader_hint_pending_review`
- `review_state=placeholder_pending_review`
- `placeholder_text=TBD`
- `license_group=CC_BY_NC`
- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `attribution_notice_key=klein_cc_by_nc_noncommercial_educational`

Required export-control fields:

- `noncommercial_educational_candidate=true` or equivalent lane/status field.
- `commercial_export_exclusion_required=true`.
- `commercial_export_allowed=false`.
- `derived_from_nc=true`.
- `corpus_contamination=false`.
- `nc_definition_content_stored_now=false`.
- `definition_text_stored_now=false`.
- `answer_eligible=false`.
- `accepted_text=false`.

## Prohibited Fields Without Separate Agent 6 Clearance

The changed package must not emit these fields for the NC/Klein fallback rows:

- `display`
- `inline_display`
- `counterpart_text`
- `definition_text`
- `nc_definition_content`
- `headwords`
- `selected_source_rows`
- `source_rows`
- `answer_text`
- `translation_text`
- `accepted_gloss`
- `accepted_text`
- any source quotation or definition content from Klein

## Attribution Boundary

`attribution_notice_key=klein_cc_by_nc_noncommercial_educational` is sufficient only as machine-readable linkage in a pre-runtime or data package.

It is not sufficient by itself for public runtime display.

Before public/runtime acceptance, Agent 10 or Agent 4 must prove that the runtime renders a visible attribution notice or immediately reachable source/license row wherever the NC/Klein placeholder state is exposed. The visible notice must identify Klein Dictionary, CC BY-NC, noncommercial educational lane, and the fact that no definition content is being displayed.

If the runtime does not display attribution at the point of use, it must provide an immediately reachable license/source affordance from that placeholder row. A hidden machine key alone is not enough for public display acceptance.

## Commercial Export Boundary

Commercial export exclusion metadata is required.

Before public/runtime or export acceptance, Agent 10 must provide validator proof that all 17 NC/Klein row IDs are excluded from every commercial export path, commercial-clean bundle, accepted text output, source row output, route JSONL export, route shard, and any artifact that could be consumed as commercial-allowed data.

The rows may appear only in a noncommercial educational placeholder lane unless a later Agent 6 docket explicitly changes that boundary.

## Answers To Agent 10 Questions

May these 17 NC/Klein rows be used in a public/runtime placeholder fallback when only placeholder state plus NC attribution/exclusion metadata is emitted?

Conditionally, as a changed-package preparation boundary only. Public/runtime mutation and acceptance still require a later Agent 6 docket after changed-package and runtime proof.

Is the proposed attribution notice key sufficient, or must visible attribution text/link be present wherever the placeholder appears?

The key is sufficient only as machine metadata. Public runtime needs visible attribution or an immediately reachable source/license row at the point of use.

Must `derived_from_nc` and `commercial_export_allowed` remain non-rendered machine metadata, or may they appear in public JSON?

They may appear in public JSON as machine-readable exclusion metadata, but should not be rendered as ordinary reader hint text. If rendered, they must appear only in source/license/compliance UI, not as definition or candidate content.

What validator proof is required to show commercial exports exclude these rows?

A targeted validator must prove the 17 row IDs are absent from commercial exports, commercial-clean bundles, accepted text outputs, source rows, route JSONL rows, route shards, definition outputs, answer outputs, and any public data file claiming commercial-clean status.

## Required Follow-Up

Agent 10 next action: prepare a changed package for the 17 NC/Klein rows only, using the allowed field boundary above, visible-attribution plan, and commercial-export exclusion validator.

Agent 4/runtime proof: required after any changed public/runtime package exists and before public/runtime acceptance. The proof must show visible attribution or source/license reachability, no NC definition content, no accepted text, no answer/source/route rows, no commercial-export bleed, and no non-target Orot mutation.

Agent 6 follow-up: required after changed-package and validator proof exist.

## Blocked Scope

Still blocked from this verdict:

- Public/runtime mutation.
- Public/runtime acceptance.
- Commercial export permission.
- NC definition content.
- Definition text display.
- Answer eligibility.
- Source rows.
- Route JSONL rows.
- Route shard writes.
- Accepted gloss/text.
- Publication readiness.
- Product/data gate acceptance.

## Risk Classification

Warning, not blocker, because the proposed shape contains only placeholder state plus NC attribution/exclusion metadata and preserves zero mutation. The warning remains because public NC-visible behavior requires visible attribution and commercial-export exclusion proof before public/runtime acceptance.

## Highest Permissible Claim

Agent 6 WARN-ACCEPTED the NC/Klein public-display contract shape for 17 rows only. Agent 10 may prepare a changed package under this boundary, but may not claim public/runtime acceptance, license acceptance, commercial export permission, accepted text, or Definition authority.
