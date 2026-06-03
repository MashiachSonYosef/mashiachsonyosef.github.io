# Agent 6 Orot Public Placeholder Promotion Boundary Verdict - 2026-06-03

## Disposition

BLOCK for direct public placeholder promotion as currently proposed.

Agent 6 does not clear any of the 63 rows for direct merge into `data/public-hud/orot/reader-hints.json` with `display`, `inline_display`, and `counterpart_text` set to `TBD`.

Agent 6 does allow Agent 10 to prepare a separate export/runtime-fallback packet under the field and subset limits below. That fallback packet is not accepted by this docket; it must return to Agent 6 before any public/runtime mutation.

## Evidence Reviewed

- `reports/agent10-agent6-orot-public-placeholder-promotion-boundary-request-2026-06-03.json`
- `reports/agent10-agent6-orot-public-placeholder-promotion-boundary-request-2026-06-03.md`
- `data/build/orot/reader-hint-placeholder-candidates.json`
- `data/public-hud/orot/reader-hints.json`
- Prior non-public Agent 6 docket: `reports/agent6-orot-owner-priority-work-packet-verdict-2026-06-03.md`

## Validation Checks

- Parsed the boundary request JSON.
- Parsed the 63-row source package JSON.
- Parsed the current public reader-hints JSON.
- Scanned 63 source rows for exact `TBD` display/counterpart text, allowed labels, placeholder status, definition-content flags, answer flags, public emit flags, NC containment flags, and duplicate token IDs.
- Compared the 63 source rows against the current 20-row public reader-hints file.

## Findings

### Blocker 1: Non-Public Package Cannot Be Public-Merged As-Is

Owner: Agent 10.

Classification: blocker.

Evidence: `data/build/orot/reader-hint-placeholder-candidates.json` declares `non_public_package_only=true`, `no_public_hud_output=true`, `no_runtime_files=true`, `no_public_mutation=true`, and every scanned row preserves `approved_for_public_emit=false`, `public_emit_ready=false`, `public_hud_emit_allowed=false`, and `route_jsonl_emit_allowed=false`.

Acceptance condition: Agent 10 must produce a new export packet that explicitly changes the operation from non-public package custody to public-safe placeholder/fallback export, without reusing contradictory false public-emission flags as if they were clearance.

### Blocker 2: Direct Public `display` / `inline_display` / `counterpart_text` = `TBD` Is Not Cleared

Owner: Agent 10.

Classification: blocker.

Evidence: all 63 source rows use `display=TBD`, `inline_display=TBD`, and `counterpart_text=TBD`. In the public reader-hints schema, `display` and `inline_display` are reader-facing candidate text fields. Promoting literal `TBD` into those fields would create public reader output, not merely a private placeholder.

Acceptance condition: Public-safe placeholder output must not use `display`, `inline_display`, or `counterpart_text` for `TBD`. Use renamed, non-authoritative fields such as `placeholder_text`, `placeholder_kind`, or `review_state`, and require the runtime to render a clearly labeled pending-review state rather than a candidate definition field.

### Blocker 3: Six Rows Collide With Existing Public Reader-Hints

Owner: Agent 10.

Classification: blocker.

Evidence: 6 of the 63 placeholder rows already exist in `data/public-hud/orot/reader-hints.json` with non-`TBD` candidate displays. Direct merge would duplicate or downgrade current public candidate rows.

Blocked overlap IDs:

- `tok-20d2e105fd77`
- `tok-2a86b3eaee9b`
- `tok-1b76a9f88fc7`
- `tok-cf9427570b0a`
- `tok-42a5e912cd97`
- `tok-e2d80b36f5bc`

Acceptance condition: any later export must be merge-safe: no duplicate token IDs, no overwrite of existing non-`TBD` public candidate rows, and no downgrade from existing candidate text to `TBD`.

### Blocker 4: NC/Klein Metadata Is Not Cleared For Public Display

Owner: Agent 10, with Agent 1 custody boundary if Agent 10 wants NC metadata visible.

Classification: blocker.

Evidence: 17 rows are `noncommercial_educational_candidate` with `source_license_group=CC_BY_NC`, `derived_from_nc=true`, `commercial_export_allowed=false`, and `attribution_required=true`. The current request asks whether metadata-only public display is allowed, but the packet does not provide a public NC attribution/display contract, noncommercial-only route proof, or commercial-export exclusion proof for a public artifact.

Acceptance condition: NC/Klein rows must not be public-visible unless a later Agent 6-reviewed packet proves a noncommercial-only display boundary, required attribution behavior, no NC definition content, no commercial export path, no corpus contamination, and no public/runtime bleed into commercial-clean output.

## Subset Disposition

### Commercial-Clean Missed-Dictionary Placeholder Rows

Rows reviewed: 33.

Disposition: BLOCKED for direct public reader-hints merge.

Reason: direct `TBD` in public reader-facing fields is blocked, and 6 rows overlap existing public candidate rows.

Permitted next step: Agent 10 may prepare a public-safe fallback export packet for only the non-overlapping rows, if it removes or renames reader-facing `TBD` fields and proves merge safety.

### NC/Klein Educational Placeholder Rows

Rows reviewed: 17.

Disposition: BLOCKED for direct public reader-hints merge and blocked for public metadata display.

Reason: NC-derived rows require a separate public NC display and commercial-exclusion boundary. Placeholder-only status does not by itself clear public NC metadata.

Permitted next step: Agent 10 may prepare a separate NC-only boundary packet, but no public mutation is cleared now.

### Display-Integrity TBD Placeholder Rows

Rows reviewed: 13.

Disposition: BLOCKED for direct public reader-hints merge.

Reason: `TBD` in `display` / `inline_display` remains reader-facing public row content. These rows are lower license risk than NC rows, but the field shape is still not public-safe.

Permitted next step: Agent 10 may prepare a public-safe runtime fallback packet for these 13 rows first. The packet must avoid `display`, `inline_display`, and `counterpart_text`; use explicit pending-review placeholder fields; keep `answer_eligible=false`; and prove no route JSONL/source/definition/public HUD acceptance is created beyond the fallback.

## Required Field Changes Before Any Public/Runtime-Safe Candidate Output

Remove or do not emit these fields for placeholder rows in public reader-hints output:

- `display`
- `inline_display`
- `counterpart_text`
- `headwords` for NC/Klein rows
- `source_families` for NC/Klein rows unless a separate NC attribution/display docket clears them
- `source_license_group` for NC/Klein rows unless a separate NC attribution/display docket clears it
- `derived_from_nc` for public display unless retained only in non-rendered machine metadata with a validated exclusion gate

Rename or split these concepts before public output:

- Replace `approved_for_public_emit=false` with a separate field if needed, such as `public_placeholder_emit_allowed`, because an emitted public row cannot simultaneously claim public emit is false.
- Replace public reader text fields with non-authoritative state fields such as `placeholder_kind`, `review_state`, `placeholder_text`, or `display_state`.
- Use `label_status=placeholder_pending_review` or `candidate_not_approved`; do not rely on `placeholder_only` as public-facing status text.

Required public-safe invariant:

- `answer_eligible=false`
- `promote_to_answer=false`
- `definition_text_stored_now=false`
- `nc_definition_content_stored_now=false`
- `public_emit_ready=false` for definition/candidate-text emission
- no `selected_source_rows`
- no route JSONL rows
- no source rows
- no accepted text
- no publication readiness claim

## Answers To Agent 10 Questions

Are public reader-hints rows with `display`, `inline_display`, and `counterpart_text` exactly `TBD` allowed?

No. Blocked for all 63 rows as currently shaped.

Is an approved runtime/export fallback required instead?

Yes. Agent 10 may prepare a separate fallback packet, starting with the 13 display-integrity rows or the non-overlapping commercial-clean rows. It must return to Agent 6 before any public/runtime mutation.

Is NC/Klein metadata-only public display allowed with NC containment?

Not from this packet. Blocked pending a separate NC public display/attribution/commercial-exclusion boundary.

Which fields must be removed or renamed before public/runtime-safe candidate output?

At minimum: remove or do not emit `display`, `inline_display`, and `counterpart_text` for `TBD` placeholders; split public placeholder emit from definition/candidate-text emit; and keep NC source/license/headword metadata out of public display unless separately cleared.

## Effective Boundary

This is a public/runtime boundary review only. It does not accept public/runtime mutation, source/provenance custody, license clearance, Definition authority, usage-as-definition authority, answer acceptance, route publication support, publication readiness, product/data acceptance, translation output, accepted gloss, or accepted text.

Highest permissible claim after this docket:

Agent 6 blocked direct public promotion of the 63 Orot placeholder rows as currently shaped and authorized Agent 10 to prepare a narrower public-safe fallback/export packet for later Agent 6 review.
