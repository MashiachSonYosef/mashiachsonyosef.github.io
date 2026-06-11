# Agent 6 Old-Dictionary Source-Family/License-Lane Planning Verdict - 2026-06-04

## Disposition

WARN-ACCEPTED for non-public old-dictionary source-family/license-lane planning evidence and supplemental lane-partition planning evidence only.

The exact Agent 1 old-dictionary excluded-row license-lane re-audit may be carried as non-public source-family/license-lane planning evidence only. The exact Agent 1 separated export-partition artifact may be carried as supplemental non-public lane-partition planning evidence only.

This clears the Agent 2 / Agent 10 handoff blocker only for missing old-dictionary source-family/license-lane planning evidence. It does not authorize candidate text consumption, candidate text export, source/provenance acceptance, license/legal acceptance, commercial export, NC commercial use, Definition authority, answer eligibility, public/runtime mutation, route-shard writes, publication readiness, accepted text, public reader output, or definition-content storage.

## Evidence Reviewed

- `reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.md`
- `reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.json`
- `reports/agent10-agent6-ready-old-dictionary-license-lane-export-partitions-supplement-2026-06-04.md`
- `reports/agent10-agent6-ready-old-dictionary-license-lane-export-partitions-supplement-2026-06-04.json`
- `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.md`
- `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- `reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.md`
- `reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json`
- `reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md`
- `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json`
- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
- `reports/agent1-orot-next-missed-source-family-map-2026-06-04.json`
- `reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json`

## Validation Observed

Agent 6 ran the named validators and scoped diff check:

- `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
- `node scripts/validate_agent1_old_dictionary_license_lane_export_partitions.mjs`
- JSON parse/read checks for the Agent 10 packets and Agent 1 source artifacts.
- `git diff --check -- reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.md reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.json reports/agent10-agent6-ready-old-dictionary-license-lane-export-partitions-supplement-2026-06-04.md reports/agent10-agent6-ready-old-dictionary-license-lane-export-partitions-supplement-2026-06-04.json reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.md reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.md reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json`

Observed result: validators passed; scoped diff check passed.

## Primary Planning Boundary

The primary re-audit may be carried as non-public source-family/license-lane planning evidence only with these counts:

- Audited rows / occurrences: `500` / `8427`.
- Public-domain-observed rows / occurrences: `297` / `5747`.
- Blocked-only / non-public-domain / unresolved rows / occurrences: `17` / `259`.
- No-Sefaria-hit rows / occurrences: `186` / `2421`.
- Next missed rows / occurrences: `50` / `1193`.

Accepted source-family lane planning evidence:

- Jastrow Dictionary: `commercial_clean_candidate`, `210` source-family rows / `4474` occurrences.
- BDB Dictionary: `commercial_clean_candidate`, `221` source-family rows / `4418` occurrences.
- BDB Aramaic Dictionary: `commercial_clean_candidate`, `69` source-family rows / `2048` occurrences.
- Klein Dictionary: `noncommercial_educational_candidate`, `214` source-family rows / `4444` occurrences.
- BDB Augmented Strong: `blocked_or_needs_review`, `222` source-family rows / `4435` occurrences.

## Supplemental Partition Boundary

The supplemental separated export-partition artifact may be carried as non-public lane-partition planning evidence only:

- `commercial_clean_candidate`: `3` source families, `500` source-family rows / `10940` occurrences.
- `noncommercial_educational_candidate`: `1` source family, `214` source-family rows / `4444` occurrences.
- `metadata_or_link_only`: `0` source families, `0` rows / `0` occurrences.
- `blocked_or_needs_review`: `1` source family, `222` source-family rows / `4435` occurrences.

The supplemental partition counts are source-family partition rows, not unique cleared candidate rows. Do not compare or promote them as equivalent to the primary unique audited/public-domain row counts.

## Lane Rulings

`commercial_clean_candidate` source-family planning lane:

- Jastrow Dictionary, BDB Dictionary, and BDB Aramaic Dictionary may be carried as commercial-clean planning evidence only.
- This does not authorize source/provenance acceptance, license/legal acceptance, candidate text consumption, candidate text export, definition-content storage, answer eligibility, commercial export, public/runtime mutation, route-shard write, publication readiness, or accepted text.

`noncommercial_educational_candidate` lane:

- Klein Dictionary may be carried only in a separated NC educational planning lane.
- Required flags must remain:
  - `derived_from_nc=true`
  - `commercial_export_allowed=false`
  - `attribution_required=true`
  - `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
  - `corpus_contamination=false`
- NC/Klein rows must not be mixed into commercial-clean output or export partitions.
- No NC definition-content storage, display, public mutation, answer emission, candidate text export, accepted text, commercial export, or NC commercial authorization is cleared.

`blocked_or_needs_review` lane:

- BDB Augmented Strong remains blocked/review-only.
- Required missing evidence remains:
  - independent source/license/custody basis;
  - source URL or version source;
  - license label and allowed fields;
  - later Agent 6 boundary if evidence appears.
- No Agent 2 candidate text consumption may use this family.

`metadata_or_link_only` lane:

- The supplemental partition records `0` rows / `0` occurrences.
- No metadata/link-only output behavior is cleared by this docket.

## Handoff Blocker Effect

The prior Agent 2 / Agent 10 blocker `missing_agent1_old_dictionary_excluded_row_license_lane_assignment` may be considered resolved only for non-public source-family/license-lane planning evidence intake.

It remains blocked for any downstream use that would consume candidate text, export candidate text, store definition content, create answer eligibility, write route shards, mutate public/runtime surfaces, claim source/license/legal acceptance, claim Definition authority, claim publication support/readiness, or produce accepted text.

## Zero-Emission Counters Preserved

The following remain `0`:

- Answer rows.
- Source rows emitted.
- Public HUD rows.
- Route JSONL rows.
- Route shard writes.
- Runtime files changed.
- Source files changed.
- Token-index files changed.
- Lexical payload files changed.
- Definition-content rows.
- NC definition-content rows.
- Accepted-text rows.
- Public reader output rows.

## What Must Not Be Accepted

- QA acceptance beyond this exact docket.
- Source/provenance acceptance.
- License or legal acceptance.
- Definition authority.
- Usage-as-definition authority.
- Answer acceptance.
- Answer eligibility.
- Public/runtime acceptance.
- Public/runtime mutation.
- Route-shard edit or write.
- Route publication support.
- Publication readiness.
- Product/data acceptance.
- Translation output.
- Accepted gloss or accepted text.
- Public reader output.
- Definition-content storage.
- Candidate text consumption.
- Candidate text export.
- Commercial export permission.
- NC commercial authorization.
- NC rows as commercial-clean.

## Next Allowed Action

Agent 10 / Agent 2 may carry the old-dictionary lane evidence forward as non-public planning context and may update handoff/blocker language to say the lane-assignment packet is no longer missing.

Any changed package that requests candidate text consumption, candidate text export, definition-content storage, answer eligibility, source/license acceptance, public/runtime behavior, route-shard writes, accepted text, commercial export, NC public display, or NC commercial use requires a new exact Agent 6 boundary packet.
