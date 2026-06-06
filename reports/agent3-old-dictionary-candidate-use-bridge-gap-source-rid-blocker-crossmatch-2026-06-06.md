# Agent 3 Old-Dictionary Bridge-Gap Source-RID Blocker Crossmatch

Generated: 2026-06-06T11:31:12.982Z

## Status

- Status: evidence-ready
- Lane: Agent 3 linkage/dedupe/navigation only
- Authority: no source, license, Definition, runtime, publication, answer, gloss, or accepted-text claim
- Handoff owner: Agent 10 for release/package intake; Agent 6 only by exact boundary packet through the release owner

## Inputs

- Gap workset: reports/agent3-old-dictionary-candidate-use-queue-source-bridge-gap-workset-2026-06-06.json
- Source-RID blocker matrix: reports/agent3-old-dictionary-candidate-use-source-rid-blocker-matrix-2026-06-06.json
- Source-RID dedupe coverage crossmatch: reports/agent3-old-dictionary-candidate-use-source-rid-dedupe-coverage-crossmatch-2026-06-06.json

## Counts

| Metric | Count |
| --- | ---: |
| Gap source RIDs crossmatched | 30 |
| Gap source-RID references | 30 |
| Source-RID reference occurrence memberships | 389 |
| Source RIDs with blocker row | 30 |
| Source RIDs missing blocker row | 0 |
| Source RIDs with queue/source coverage | 0 |
| Source RIDs missing queue/source coverage | 30 |
| Blocker present, coverage missing | 30 |
| Unique gap queue IDs | 14 |
| Unique gap token IDs | 14 |
| Prefix rows | 12 |
| Blocker current blocker total | 300 |
| Rows missing source citation | 30 |
| Rows missing transform rule | 30 |
| Rows requiring Agent 6 boundary | 30 |

## Coverage Status

| Coverage status | Source RIDs | Source-RID refs | Occurrence memberships | With blocker | With queue/source coverage |
| --- | ---: | ---: | ---: | ---: | ---: |
| source_rid_blocker_present_queue_source_coverage_missing | 30 | 30 | 389 | 30 | 0 |

## Prefix Rows

| Prefix | Source RIDs | Source-RID refs | Occurrence memberships |
| --- | ---: | ---: | ---: |
| A | 5 | 5 | 40 |
| C | 4 | 4 | 28 |
| D | 3 | 3 | 117 |
| E | 2 | 2 | 18 |
| I | 1 | 1 | 7 |
| M | 5 | 5 | 90 |
| N | 1 | 1 | 14 |
| P | 1 | 1 | 13 |
| R | 1 | 1 | 8 |
| S | 1 | 1 | 5 |
| U | 4 | 4 | 29 |
| V | 2 | 2 | 20 |

## Handoff

- Next safe action: Use this crossmatch to route all 30 gap source RIDs as known source-RID blocker rows that are absent from queue/source dedupe coverage; do not treat blocker presence as source acceptance or transform readiness.
- Stop condition: Stop at source-RID blocker/coverage crossmatch evidence; no source text read, no source-family selection made, no transform output emitted, no Definition answer selected, and no acceptance action taken.

