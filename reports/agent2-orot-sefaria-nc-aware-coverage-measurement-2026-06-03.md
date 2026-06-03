# Agent 2 Orot/Sefaria NC-Aware Coverage Measurement

Generated: 2026-06-03T13:41:31.381Z

## Boundary

Zero-emission measurement only. This packet stores row metadata and token IDs only. It does not emit answer rows, source rows, public HUD rows, route JSONL rows, runtime/source/token-index/lexical-payload mutations, NC definition content, translation output, accepted gloss, or accepted text.

It does not claim source/provenance acceptance, license acceptance, QA acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, or product/data acceptance.

## Inputs

- Oracle 9 NC policy callback: `reports/oracle9-agent10-nc-orot-honeypot-policy-callback-2026-06-03.md`
- Existing Sefaria hit audit: `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json`
- Sefaria license scout: `reports/agent10-sefaria-lexicon-license-scout-addendum-2026-06-03.json`
- Public-domain preview: `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-03.json`
- Transform contract: `reports/agent10-orot-sefaria-license-safe-answer-transform-contract-2026-06-03.md`

No network/API calls were performed.

## Measurement Scope

- Scoped rows: 500
- Scoped occurrences: 8427
- Existing Orot hint occurrences from audit source counts: 40073
- Total Orot occurrences from audit source counts: 59806

## Coverage Counts

| Lane | Rows | Occurrences | Scoped row rate | Scoped occurrence rate | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| Commercial-clean candidate | 297 | 5747 | 59.4% | 68.2% | observed Public Domain family hit; Agent 1/6 boundary still required |
| Additional NC educational candidate | 17 | 259 | 3.4% | 3.1% | Klein / observed CC-BY-NC increment; Agent 1/6 boundary still required |
| Commercial-clean + NC educational | 314 | 6006 | 62.8% | 71.3% | arithmetic planning projection only |
| Unresolved/blocked only | 0 | 0 | 0.0% | 0.0% | metadata/link-only/blocked until boundary |
| No-hit or unusable in scoped Sefaria lane | 186 | 2421 | 37.2% | 28.7% | no Sefaria hit in this audit |
| Remaining after commercial-clean + NC | 186 | 2421 | 37.2% | 28.7% | still not fillable by this lane |

## Projection

If Agent 1/6 later clears the commercial-clean observed lane, the scoped top-500 increment would project to 45820 final hint occurrences out of 59806 total Orot occurrences (76.6%).

If Agent 1/6 later clears both commercial-clean observed and NC educational lanes, the scoped top-500 increment would project to 46079 final hint occurrences out of 59806 total Orot occurrences (77.0%).

These are arithmetic projections only, not source, license, Definition, answer, QA, runtime, product, or publication acceptance.

## NC Commercial-Export Exclusion Rows

These are the 17 incremental Klein / observed CC-BY-NC rows (259 occurrences) that would need future commercial-export exclusion if Agent 1/6 later approves them as NC-derived.

| Priority | Token ID | Occurrences | Category | NC family | Required flags |
| ---: | --- | ---: | --- | --- | --- |
| 46 | `tok-e1419d66ddac` | 33 | route_cards_without_answer_eligible | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 47 | `tok-09a1636a29b2` | 32 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 57 | `tok-3b3b23913614` | 30 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 59 | `tok-1a6106348f82` | 29 | route_cards_without_answer_eligible | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 98 | `tok-e3f57c129127` | 20 | route_cards_without_answer_eligible | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 118 | `tok-24d0fe4dc457` | 17 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 161 | `tok-da3c733e62e9` | 14 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 169 | `tok-6166f1a4fa92` | 13 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 190 | `tok-dd1eea95c2a3` | 12 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 195 | `tok-292c48eab8fb` | 11 | route_cards_without_answer_eligible | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 324 | `tok-fb9a2ed877ae` | 8 | no_route_cards | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 326 | `tok-1fb8cc9987d7` | 7 | route_cards_without_answer_eligible | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 343 | `tok-663d95d67734` | 7 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 352 | `tok-8dc563525306` | 7 | route_cards_without_answer_eligible | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 374 | `tok-f6281bedc002` | 7 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 425 | `tok-83eb6d219c1c` | 6 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |
| 435 | `tok-9cf963c5483d` | 6 | ambiguous_answer_candidates | Klein Dictionary | `derived_from_nc=true`, `commercial_export_allowed=false` |

Rows with both Klein and commercial-clean observed families are not counted as additional NC coverage. If a later transform uses Klein content for those overlap rows, it must apply the same NC flags.

## Agent 1/6 Matrix Schema Request

Required status options:

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_only`
- `external_link_only`
- `blocked`

Required family fields:

- `family`
- `observed_license_source_basis`
- `status`
- `storage_allowed`
- `noncommercial_display_allowed`
- `commercial_export_prohibited`
- `attribution_required`
- `attribution_text_or_link_required`
- `source_custody_manifest_required`
- `transformed_reader_hint_allowed`
- `metadata_only_allowed`
- `external_link_only_allowed`
- `exact_blocker_if_blocked`

Required NC row flags:

- `license_group=CC_BY_NC`
- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `noncommercial_display_allowed=false` until Agent 1/6 boundary explicitly allows
- `attribution_required=true`
- `corpus_contamination=false`

## Blockers

- Agent 1/6 family-specific boundary is required before storage/display/transform eligibility for observed Public Domain families.
- Agent 1/6 family-specific boundary is required before any Klein / CC-BY-NC noncommercial display or transformed reader-hint use.
- Klein-derived rows must remain excluded from any future commercial export if later approved as NC-derived.
- BDB Augmented Strong remains blocked or metadata/link-only until independent license/source custody boundary is recorded.
- No answer rows, source rows, public HUD rows, route JSONL rows, runtime/source/token-index/lexical-payload mutation, or NC definition-content storage are authorized by this measurement.

## Agent 8 Callback

Agent 8 direct callback delivery unavailable; callback requires relay.

```xml
<codex_delegation>
  <source_thread_id>019e85ac-94ff-7a00-8aef-3dffdbe3c657</source_thread_id>
  <input>## Agent 8 Callback

Status: Agent 2 NC-aware Orot/Sefaria coverage measurement packet produced for Agent 10/Agent 1/Agent 6 planning.
Artifact path: reports/agent2-orot-sefaria-nc-aware-coverage-measurement-2026-06-03.json
Measured counts: commercial-clean candidate 297 rows / 5747 occurrences; additional NC educational candidate 17 rows / 259 occurrences; commercial-clean plus NC 314 rows / 6006 occurrences; remaining no-hit/unusable 186 rows / 2421 occurrences.
Next executable route: Agent 10 may route this packet to Agent 1/6 for NC-aware family custody/display boundary review; keep answer emission and public mutation at zero.
Stop condition: wait for Agent 1/6 boundary before any NC display/storage/reader-hint transform, answer eligibility, public HUD rows, route JSONL rows, runtime mutation, or publication path.
Highest permissible claim: Agent 2 NC-aware coverage measurement packet produced for Agent 10/Agent 1/Agent 6 planning only.
What must not be accepted: no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, product/data acceptance, translation output, accepted gloss, or accepted text.</input>
</codex_delegation>
```

## What Must Not Be Accepted

- QA acceptance
- Source/provenance acceptance
- License acceptance
- Definition authority
- Usage-as-definition authority
- Answer acceptance
- Public/runtime acceptance
- Publication readiness
- Product/data acceptance
- Translation output
- Accepted gloss
- Accepted text
