# Agent10 Agent6-Ready Boundary Packet: Public-Domain Ref-Sample Gap

Date: 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

## Review Scope

`nonpublic_public_domain_ref_sample_gap_planning_evidence_only`

Agent 6 question:

Pass/warn/block whether the exact Agent 1 public-domain ref-sample gap manifest may be carried as non-public metadata-gap planning evidence only for the 93 commercial-clean rows / 1362 occurrences lacking public-domain ref samples or ref counts.

## Inputs

- `reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.md`
- `reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json`
- `reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-validation-result-2026-06-05.json`
- `reports/agent6-old-dictionary-public-domain-citation-metadata-custody-boundary-verdict-2026-06-05.md`
- `reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json`

Exact row payload remains in `reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json` at `public_domain_ref_gap_rows[]`. This packet does not duplicate row payload.

## Counts

| field | value |
|---|---:|
| public-domain rows | 297 |
| public-domain occurrences | 5747 |
| rows with ref samples or ref count | 204 |
| occurrences with ref samples or ref count | 4385 |
| rows without ref samples or ref count | 93 |
| occurrences without ref samples or ref count | 1362 |
| gap rows with RIDs | 93 |
| gap RID total | 270 |
| gap rows with headwords | 93 |
| gap headword total | 251 |

## Lane Split

| lane | rows | occurrences | status |
|---|---:|---:|---|
| `commercial_clean_candidate` | 93 | 1362 | metadata-only ref-sample gap; Agent 6 boundary required |
| `noncommercial_educational_candidate` | 0 | 0 | not part of this packet |
| `metadata_or_link_only` | 0 | 0 | not part of this packet |
| `blocked_or_needs_review` | 0 | 0 | not reclassified by this packet |

## Family Gap Partitions

| source family | lane | rows | occurrences | blocker |
|---|---|---:|---:|---|
| Jastrow Dictionary | `commercial_clean_candidate` | 6 | 89 | `jastrow_dictionary_public_domain_ref_sample_gap_needs_source_family_boundary_if_refs_required` |
| BDB Dictionary | `commercial_clean_candidate` | 91 | 1339 | `bdb_dictionary_public_domain_ref_sample_gap_needs_source_family_boundary_if_refs_required` |
| BDB Aramaic Dictionary | `commercial_clean_candidate` | 22 | 434 | `bdb_aramaic_dictionary_public_domain_ref_sample_gap_needs_source_family_boundary_if_refs_required` |

Family partitions are nonexclusive; this packet does not authorize exclusive source-family selection.

## Exact Blockers

| blocker | rows | occurrences | handoff owner |
|---|---:|---:|---|
| `public_domain_ref_sample_gap_rows_are_metadata_only_not_candidate_text` | 93 | 1362 | Agent 6 for future boundary if refs are required; Agent 2 blocked now |
| `public_domain_ref_sample_gap_needs_source_family_boundary_if_ref_samples_required` | 93 | 1362 | Agent 1 records exact gap; Agent 6 decides future source-family boundary requirements |

## Zero Counters

- allowed transform rows now: `0`
- candidate text rows now: `0`
- accepted gloss rows now: `0`
- answer rows now: `0`
- definition-content rows now: `0`
- source rows emitted now: `0`
- public HUD rows now: `0`
- route JSONL rows now: `0`
- Agent 6 delivery now in source artifact: `0`
- queue/render/staging/release mutations: `0`

## Requested Carry

Only `carry_as_nonpublic_planning_evidence_only=true`.

Not requested and not authorized: treating gap rows as candidate text, candidate use, transform, source-row emission, definition text storage, answer eligibility, public/runtime mutation, route-shard write, source/license/legal acceptance, commercial export, or release action.

## Stop Condition

Stop at Agent6-ready packet unless and until Agent 6 returns an exact verdict. No candidate use, transform, source-row emission, candidate text, output, public/runtime, answer, definition, export, or release step is authorized by this packet.

Highest permissible claim: Agent 10 prepared an Agent6-ready old-dictionary public-domain ref-sample gap boundary packet for non-public planning evidence only.

What must not be accepted: no QA/source/provenance/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no public reader output, no route-shard edit, no public/runtime mutation, no candidate text export, no definition-content storage, no commercial export permission, no release action.
