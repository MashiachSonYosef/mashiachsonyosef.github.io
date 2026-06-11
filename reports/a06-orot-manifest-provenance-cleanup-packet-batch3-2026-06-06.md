# A06 Orot Manifest Provenance Cleanup Packet Batch 3 - 2026-06-06

Status: A06_OROT_MANIFEST_PROVENANCE_READY

Scope: evidence-only cleanup provenance packet for `data/lexical/orot.manifest.json`.

Boundary: no staging, no revert, no deletion, no regeneration, no publication/release, no source/license/legal/Definition/product/answer/accepted-text acceptance, and no public/runtime mutation.

## Route Split

A06 is evidence, validator, and repo-cleaning production only. A07 remains approval, final validation, release gate, and cleanup-action approval owner.

## Process Timeout Record

process_timeout | command | timeout | partial_output_or_artifact | next_safe_action
--- | --- | --- | --- | ---
process_timeout | `rg -n -m 50 "orot\.manifest\.json|orot manifest|data/lexical/orot\.manifest" scripts reports data -g "*.mjs" -g "*.js" -g "*.json" -g "*.md"` | 120000ms | timed out before completing generator/provenance search | stopped broad search; narrowed only once
process_timeout | `rg -n -m 50 "orot\.manifest\.json|orot manifest|data/lexical/orot\.manifest" scripts -g "*.mjs" -g "*.js"` | 60000ms | timed out before completing scripts-only search | stopped search per A14 interrupt; used A10 generator-path consult result

## A10 Generator-Path Evidence

- Generator path: `scripts/write_lexical_payloads.mjs`.
- Writer block: `writeJson(path.join(lexicalRoot, `${workId}.manifest.json`), ...)`.
- For Orot, `workId=orot`, resolving to `data/lexical/orot.manifest.json`.
- A10 consult view: defer by default; because compare found only `generated_at` changed and chunk counts unchanged, this is timestamp churn, not release/package content evidence.

## Manifest Evidence

path | status | diff summary | generator/provenance evidence | validation result | proposed action | approval owner | rollback path | stop condition
--- | --- | --- | --- | --- | --- | --- | ---
`data/lexical/orot.manifest.json` | modified unstaged | `generated_at` changed from `2026-05-23T13:53:23.299Z` to `2026-05-30T06:16:50.794Z`; `schema_version=1`; `work_id=orot`; chunk count unchanged at `18`; entry-count sum unchanged at `14668`; changed chunk count `0` | A10 identifies generator as `scripts/write_lexical_payloads.mjs` writing `${workId}.manifest.json` under lexical root | JSON parse passed; structural compare against HEAD showed no chunk-count or entry-count change; compare did not establish release/package content evidence | REVERT_AFTER_A07_APPROVAL | A07 | restore `data/lexical/orot.manifest.json` from HEAD only after A07 approves cleanup action | stop with evidence-ready docket; no action by A06

## Proposed Action

REVERT_AFTER_A07_APPROVAL.

Reason: A06 agrees with the A10 consult result. The current observed manifest change is generated timestamp churn only, not meaningful release/package content evidence. If the cleanup goal is a cleaner repo, reverting this manifest is appropriate only after A07 approves the cleanup action.

## Blockers

- No A06 blocker remains for classification.
- Cleanup action remains blocked pending A07 approval.

## What This Does Not Accept

This packet does not accept source/provenance, license/legal posture, Definition authority, usage-as-definition authority, answer eligibility, accepted gloss/text, public/runtime behavior, publication readiness, product/data gates, release action, or any cleanup action.
