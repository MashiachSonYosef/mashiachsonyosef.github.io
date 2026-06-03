# Agent 6 Orot License-Safe Coverage Repair Add-Candidates Verdict - 2026-06-03

## Disposition

WARN-ACCEPTED for direct non-public placeholder addition only.

Agent 6 clears 50/50 candidate rows for addition to the next non-public Orot reader-hint candidate package, provided every cleared row preserves the exact placeholder and non-emission boundary below.

This verdict does not clear definition text, answer eligibility, translation output, accepted gloss/text, public HUD output, runtime behavior, publication readiness, source/provenance custody, license acceptance, route publication support, product/data gate acceptance, or QA acceptance beyond this exact add-candidate boundary.

## Evidence Reviewed

- `reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.md`
- `reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json`
- `reports/agent2-orot-sefaria-nc-aware-top-candidate-dry-run-2026-06-03.md`
- `reports/agent2-orot-sefaria-nc-aware-top-candidate-dry-run-2026-06-03.json`
- `reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json`
- `reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json`
- `reports/agent10-orot-sefaria-nc-aware-zero-emission-transform-spec-2026-06-03.json`

## Validator Evidence

- `node scripts\validate_agent2_orot_sefaria_nc_aware_top_candidate_dry_run.mjs`
- Result: passed.
- `node scripts\validate_agent10_orot_license_safe_coverage_repair_add_candidates.mjs`
- Result: passed.

Agent 6 also performed a row-level contract scan across the 50 candidate rows. Result: 0 violations for allowed label, `placeholder_status=placeholder_only`, `counterpart_text=TBD`, no definition text storage, no public emit flag, no pre-Agent-6 add flag, no pre-Agent-6 clearance flag, lane status, and required NC flags.

## Cleared Subsets

### Commercial-Clean Placeholder Rows

Disposition: WARN-ACCEPTED for non-public placeholder addition only.

Rows cleared: 33/33.

Occurrences represented: 2,658.

Allowed source-family status in this packet: BDB Dictionary, BDB Aramaic Dictionary, and Jastrow Dictionary metadata as `PUBLIC_DOMAIN_OBSERVED` placeholder evidence only.

Cleared row IDs:

- `tok-20d2e105fd77`
- `tok-f7199bc62ed1`
- `tok-2a86b3eaee9b`
- `tok-6f3c380a7be9`
- `tok-bff9af2524d1`
- `tok-1b76a9f88fc7`
- `tok-cf9427570b0a`
- `tok-dfcf4cc0af67`
- `tok-35bce35c1de4`
- `tok-42a5e912cd97`
- `tok-e858e9fa8bb8`
- `tok-1bfe6fea9d85`
- `tok-180d57091846`
- `tok-3fc615d98aec`
- `tok-b9470f18041a`
- `tok-16b3c5cb6ffe`
- `tok-c3803c6fde17`
- `tok-1282c4d855bc`
- `tok-e2d80b36f5bc`
- `tok-12372a227ead`
- `tok-7431485e6a2d`
- `tok-89757cf23d0a`
- `tok-589103867952`
- `tok-eb666901ae2d`
- `tok-3e2962a4fa72`
- `tok-cbcaf5b860b3`
- `tok-2a3aa32e04a0`
- `tok-cf451baa2149`
- `tok-158f1752a1df`
- `tok-887435dda3ab`
- `tok-36d28ba0f9a5`
- `tok-8ccbbb100a39`
- `tok-f1522f221367`

### Noncommercial Educational Placeholder Rows

Disposition: WARN-ACCEPTED for non-public placeholder addition only, with hard NC containment.

Rows cleared: 17/17.

Occurrences represented: 259.

Required NC flags: `license_group=CC_BY_NC`, `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `corpus_contamination=false`.

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

## Cleared Fields

Agent 6 clears only these fields for the cleared rows:

- `target_token_id`
- `surface`
- `normalized`
- `occurrences`
- `lane`
- `family_status`
- `source_families`
- `headwords`
- `refs_count`
- `provisional_label`
- `placeholder_status`
- `counterpart_text` when the exact value is `TBD`
- `placeholder_text_stored_now`
- `definition_text_stored_now`
- `source_license_group`
- `derived_from_nc`
- `commercial_export_allowed`
- `noncommercial_display_planning_allowed`
- `noncommercial_display_public_or_runtime_authorized`
- `attribution_required`
- `corpus_contamination`
- `cleared_by_agent6_now`
- `add_now_before_agent6`
- `public_emit_ready`

## Acceptance Conditions

- `counterpart_text` must remain exactly `TBD`.
- `TBD` must remain placeholder text only. It is not definition text, answer text, translation text, accepted gloss, verified text, top-match text, or reader-facing public output.
- `placeholder_status` must remain `placeholder_only`.
- `definition_text_stored_now` must remain `false`.
- `public_emit_ready` must remain `false`.
- No answer rows, source rows, public HUD rows, route JSONL rows, runtime files, source files, token-index files, lexical payload files, or public mutation files may be emitted from this verdict.
- Noncommercial educational rows must remain excluded from commercial export and public/runtime display unless a later Agent 6 docket explicitly clears a narrower downstream operation.
- Any change from `TBD` to lexical content, definition content, gloss content, answer text, translation text, source text, or public display text requires a new Agent 6 review before addition.
- The downstream add packet must record this docket path and only mark rows cleared by Agent 6 if their row contents still match this reviewed packet.

## Blocked Rows

Rows blocked within this exact non-public placeholder-add boundary: 0.

Rows remain blocked for all downstream uses outside this boundary: 50.

## Risk Classification

Warning, not blocker, because the operation stores non-public placeholder metadata and literal `TBD` placeholder text, while preserving zero emission and NC containment. The warning remains necessary because NC-family rows are present and because placeholder rows can become license/provenance risk if later transformed into content, answer authority, public HUD output, source rows, or exportable data without a separate Agent 6 docket.

## Agent 10 Boundary

Highest permissible Agent 10 claim after this verdict:

Only the 50 rows explicitly listed in this docket were cleared by Agent 6 for non-public placeholder addition with `TBD` counterpart text under the exact stated boundary.

Agent 10 may not claim source/license acceptance, QA acceptance beyond this docket, public/runtime acceptance, publication readiness, route publication support, Definition authority, usage-as-definition authority, product/data acceptance, translation output, accepted gloss, or accepted text.
