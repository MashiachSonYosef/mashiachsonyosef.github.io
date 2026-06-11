# Agent 6 Old-Dictionary Public-Domain Ref-Sample Gap Boundary Verdict - 2026-06-05

## Disposition

WARN-ACCEPTED for non-public metadata-gap planning evidence only.

Agent 10 may carry Agent 1's exact old-dictionary public-domain ref-sample gap manifest as non-public planning evidence only:

- Public-domain rows / occurrences: `297` / `5747`
- Rows with ref samples or ref count / occurrences: `204` / `4385`
- Rows without ref samples or ref count / occurrences: `93` / `1362`
- Gap rows with RIDs / RID total: `93` / `270`
- Gap rows with headwords / headword total: `93` / `251`
- Source artifact: `reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json`
- Exact row payload: `public_domain_ref_gap_rows[]`

Ref-gap rows are metadata-only. They are not candidate text, source text, definition text, answer text, accepted gloss, source/provenance acceptance, license/legal acceptance, commercial export permission, or release readiness.

## Evidence Reviewed

- `reports/agent10-agent6-ready-old-dictionary-public-domain-ref-sample-gap-boundary-packet-2026-06-05.md`
- `reports/agent10-agent6-ready-old-dictionary-public-domain-ref-sample-gap-boundary-packet-2026-06-05.json`
- `reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.md`
- `reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json`
- `reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-validation-result-2026-06-05.json`
- `reports/agent6-old-dictionary-public-domain-citation-metadata-custody-boundary-verdict-2026-06-05.md`
- `reports/agent1-old-dictionary-public-domain-citation-metadata-custody-2026-06-05.json`

## Validator Run

- `node scripts/validate_agent10_old_dictionary_public_domain_ref_sample_gap_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-public-domain-ref-sample-gap-boundary-packet-2026-06-05.json`
- Result: passed. Gap rows: `93`; occurrences: `1362`.

## Independent Recount

Independent recount over `reports/agent1-old-dictionary-public-domain-ref-sample-gap-manifest-2026-06-05.json`:

| metric | count |
|---|---:|
| public-domain rows | 297 |
| public-domain occurrences | 5747 |
| rows with ref samples or ref count | 204 |
| occurrences with ref samples or ref count | 4385 |
| gap rows | 93 |
| gap occurrences | 1362 |
| unique gap token IDs | 93 |
| duplicate gap token IDs | 0 |
| unique gap queue IDs | 93 |
| gap RID rows | 93 |
| gap RID total | 270 |
| gap headword rows | 93 |
| gap headword total | 251 |
| nonzero zero-counters | 0 |
| exact text payload fields observed | 0 |

Family gap partitions are nonexclusive:

| source family | lane | rows | occurrences | token hash |
|---|---|---:|---:|---|
| Jastrow Dictionary | `commercial_clean_candidate` | 6 | 89 | ok |
| BDB Dictionary | `commercial_clean_candidate` | 91 | 1339 | ok |
| BDB Aramaic Dictionary | `commercial_clean_candidate` | 22 | 434 | ok |

Nonexclusive partition check:

- Family partition token ID total: `119`
- Unique family partition token IDs: `93`
- Interpretation: some rows appear in more than one public-domain dictionary family. This verdict does not select a source family.

## Exact Blockers Preserved

| blocker | rows | occurrences |
|---|---:|---:|
| `public_domain_ref_sample_gap_rows_are_metadata_only_not_candidate_text` | 93 | 1362 |
| `public_domain_ref_sample_gap_needs_source_family_boundary_if_ref_samples_required` | 93 | 1362 |

## Warnings

1. The 93 gap rows may be carried only as metadata-gap planning evidence. They cannot be used as candidate text, source text, definition text, answer text, accepted gloss, or public reader output.
2. The family partitions are nonexclusive. This docket does not choose Jastrow, BDB, or BDB Aramaic for any row.
3. The lane is `commercial_clean_candidate` metadata planning only. This does not create source/provenance acceptance, license/legal acceptance, commercial export permission, or source publication.
4. If later work requires ref samples, source-family selection, source-row emission, candidate use, transform, definition-content storage, answer eligibility, public/runtime mutation, route-shard write, commercial export, publication readiness, or release action, a later exact Agent 6 packet is required.

## Affected Agents And Gates

| lane | effect |
|---|---|
| Agent 10 | may carry the manifest as non-public metadata-gap planning evidence only |
| Agent 1 | ref-gap manifest evidence is accepted as planning evidence only; no source/license/legal acceptance created |
| Agent 2 | no transform, candidate-use, source-row emission, answer, or export authority created |
| Agent 4 | no runtime/public proof route opened |
| Agent 7 | still required for control publication, release-path activation, or durable state publication if applicable |

Affected gates:

- ref-sample gap planning gate: WARN-ACCEPTED for exact artifact only
- source/provenance/license/legal gate: not accepted
- source-family selection gate: blocked
- candidate-use gate: blocked
- transform gate: blocked
- source-row emission gate: blocked
- Definition authority gate: blocked
- answer eligibility gate: blocked
- public/runtime gate: not accepted
- publication/release gate: not accepted
- commercial export gate: blocked

## What Must Not Be Accepted

No QA acceptance beyond this docket, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, candidate text export, definition-content storage, commercial export permission, or release action.

## Stop Condition

This dated Agent 6 verdict exists for the exact old-dictionary public-domain ref-sample gap planning boundary only. No implementation, staging, cleanup, queue-state update, source mutation, source-row emission, transform, candidate use, candidate text export, definition-content storage, route mutation, runtime mutation, public output, answer eligibility, accepted text, commercial export, publication readiness, or release action was performed.

