## Spark-1 Contract Run Artifact

Date: 2026-06-04  
Contract: `agent3-spark1-pipeline-contract-deuteronomy-phase2-linkage-dedupe-source-route-2026-06-04.json`  
Workset: `deuteronomy-linkage-dedupe-source-route-matrix`  
Work ID: `deuteronomy`  
Rows: `8113`  
Occurrences: `12595`  
Status: `runnable_contract`  
Lane: `linkage/dedupe/source-route`

| command | exit_code | notes |
|---|---:|---|
| `node scripts/build_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs` | `0` | wrote output artifacts; matrix generated |
| `node scripts/validate_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs` | `0` | validation passed |

### Output artifacts
- `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json`
- `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md`

### Row/occurrence metrics
- rows: `8113`
- occurrences: `12595`
- blocker_rows: `6779`
- downstream_rows: `1334`

### Blocker
- `none`

### Next continuable step
- Consume next ready Spark-1..6 contract from control lane when available.
