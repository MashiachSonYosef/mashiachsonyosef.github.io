# Agent 1 Spark-1 Pipeline Contract - Workbench Source/License/Custody Inventory - 2026-06-04

Status: `pipeline_contract_runnable_validated`.

## Target

- workset: `workbench-source-license-custody-inventory`
- input files: `10`
- source rows: `105747`
- unique works: `1112`
- unique source ids: `1144`
- licenses: `4`

## Command

```powershell
node scripts/build_agent1_workbench_source_license_custody_inventory.mjs
node scripts/validate_agent1_workbench_source_license_custody_inventory.mjs
node scripts/validate_agent1_spark1_workbench_source_license_custody_contract.mjs
```

## Classification

- `commercial_clean_candidate`: `105747` source rows, pending Agent 6/legal boundary.
- `noncommercial_educational_candidate`: `0` source rows; preserve NC separation if future rows appear.
- `metadata_or_link_only`: `0` source rows.
- `blocked_or_needs_review`: `0` source rows.
- `CC-BY-SA`: `5581` source rows require explicit share-alike boundary treatment and are not commercial-export-authorized by this packet.

## Boundary

This is a runnable Spark-1 source/license/custody contract only. It does not accept source/provenance, license/legal posture, QA, Definition authority, answer output, public/runtime behavior, publication readiness, product/data status, accepted gloss/text, NC commercial authorization, or CC-BY-SA commercial export authorization.
