# A06 Repo-Cleaning Action Docket Batch 2

Date: 2026-06-06

Status: A06_REPO_CLEANUP_ACTION_DOCKET_READY / EVIDENCE-READY ONLY.

Route split:
- A06: evidence, validators, repo-cleaning production.
- A07: approval, SOP, final validation, release gate, cleanup approval.

No cleanup action was taken. No staging, deletion, reset, revert, publication, release, public/runtime mutation, or acceptance action was performed.

## Scope

Batch-2 converts Batch-1 classification into A07-ready proposed actions for these files only:

- `index.html`
- `tanakh/daniel/index.html`
- `orot/index.html`
- `data/lexical/orot.manifest.json`
- `reports/a14-a08-splash-header-org-pipeline-2026-06-06.md`
- `reports/sop-026-a06-repo-cleaning-production-pipeline-2026-06-06.md`
- `reports/daniel-prehud-fullbook-preview.html`
- `scripts/build_daniel_prehud_fullbook_preview.mjs`
- `reports/a09-lower-agent-health-restore-batch1-2026-06-06.md`
- `reports/a06-repo-cleaning-classification-batch1-2026-06-06.md`

## Validator / Evidence Commands

| command | timeout | result |
|---|---:|---|
| `git status --porcelain=v1 -- <scope>` | 120000ms | completed; 4 modified tracked, 6 untracked |
| `Get-Item -LiteralPath <scope>` | 120000ms | all 10 scoped files present |
| `git diff --check -- <scope>` | 120000ms | passed with LF/CRLF warnings for `data/lexical/orot.manifest.json`, `index.html`, `orot/index.html` |
| `git diff --stat -- <tracked scope>` | 120000ms | completed |
| `git diff --cached --stat -- <tracked scope>` | 120000ms | completed; staged changes only in `index.html` |

## Action Docket

| path | current class | proposed cleanup action | exact reason | validation needed | rollback path | approval owner | stop condition |
|---|---|---|---|---|---|---|---|
| `index.html` | `USER_WORK_PRESERVE` | `PRESERVE_USER_WORK` | File is `MM` with substantial staged and unstaged homepage/library work; owner splash/header route is active and Daniel visibility is gated. | A07/A05 scoped homepage decision; no whole-corpus validation. | Do not revert; rollback requires exact A07/owner instruction and pre-action diff capture. | A07 / owner / A05 | Preserve until A07 approves exact homepage action. |
| `tanakh/daniel/index.html` | `GENERATED_CANDIDATE` | `DEFER_PENDING_A10_PROOF` | Daniel page is modified tracked render candidate; A14 states Daniel visibility requires A10 actual-page proof and A07 approval. | A10 page proof and A07 release/visibility decision. | Regenerate via approved Daniel renderer or revert only after A07 exact approval. | A10 / A07 | Defer; no release, staging, or revert from A06. |
| `orot/index.html` | `KEEP_AUTHORITATIVE` | `KEEP_UNSTAGED_UNTIL_OWNER_DECISION` | Active Orot reader surface; dirty status alone is not cleanup evidence. | If changed-row/surface concern appears, produce targeted Orot surface diff/provenance packet. | Revert only with exact A07/owner Orot decision. | A07 / owner / A10 | Preserve current Orot surface. |
| `data/lexical/orot.manifest.json` | `GENERATED_CANDIDATE` | `DEFER_PENDING_GENERATOR_PROVENANCE` | JSON parses but manifest is generated one-line churn; generator/provenance not yet classified deeply enough for stage/revert. | Orot manifest generator/provenance packet; compare generator output if requested. | Regenerate from known Orot lexical generator or revert only with A07 approval. | A07 / A10 / A02 | Defer staging/revert until provenance packet. |
| `reports/a14-a08-splash-header-org-pipeline-2026-06-06.md` | `KEEP_AUTHORITATIVE` | `STAGE_AFTER_A07_APPROVAL` | Routing evidence for splash/header org and Daniel visibility gate; useful control/report artifact. | A07 confirms report should be preserved in repo history. | Remove from staging if A07 blocks; file is untracked and can remain unstaged. | A07 / A14 | Stage only after A07 approval. |
| `reports/sop-026-a06-repo-cleaning-production-pipeline-2026-06-06.md` | `KEEP_AUTHORITATIVE` | `STAGE_AFTER_A07_APPROVAL` | Owner-directed A06 production pipeline evidence; supports current route split. | A07 confirms SOP/control evidence preservation. | Remove from staging if A07 blocks; file is untracked and can remain unstaged. | A07 / A14 | Stage only after A07 approval. |
| `reports/a09-lower-agent-health-restore-batch1-2026-06-06.md` | `KEEP_AUTHORITATIVE` | `STAGE_AFTER_A07_APPROVAL` | Agent health/restore observation-only report confirms route split and endpoint posture; useful control evidence. | A07 confirms report should be preserved in repo history. | Remove from staging if A07 blocks; file is untracked and can remain unstaged. | A07 / A09 / A14 | Stage only after A07 approval. |
| `reports/a06-repo-cleaning-classification-batch1-2026-06-06.md` | `KEEP_AUTHORITATIVE` | `STAGE_AFTER_A07_APPROVAL` | Batch-1 classification is direct prerequisite evidence for this docket. | A07 confirms repo-cleaning evidence packet should be preserved. | Remove from staging if A07 blocks; file is untracked and can remain unstaged. | A07 / A06 / A14 | Stage only after A07 approval. |
| `reports/daniel-prehud-fullbook-preview.html` | `PREVIEW_ONLY` | `DEFER_PENDING_A10_PROOF` | Large generated preview artifact; useful for review but not release evidence. Could be delete/quarantine candidate only after A07/A10 decision. | A10 confirms whether preview remains needed; A07 approves keep/stage/delete/quarantine. | Regenerate via `scripts/build_daniel_prehud_fullbook_preview.mjs`; delete only after A07 approval. | A10 / A07 | Defer; no delete or stage now. |
| `scripts/build_daniel_prehud_fullbook_preview.mjs` | `GENERATED_CANDIDATE` | `DEFER_PENDING_A10_PROOF` | Builder for Daniel preview; syntax previously passed; ownership/release path still pending. | A10 confirms generator is part of durable Daniel proof pipeline; A07 approves staging. | Remove only after A07/owner approval if preview route rejected. | A10 / A07 | Defer; no stage/delete now. |

## Proposed Action Counts

| proposed action | count |
|---|---:|
| `STAGE_AFTER_A07_APPROVAL` | 4 |
| `KEEP_UNSTAGED_UNTIL_OWNER_DECISION` | 1 |
| `DELETE_AFTER_A07_APPROVAL` | 0 |
| `REVERT_AFTER_A07_APPROVAL` | 0 |
| `DEFER_PENDING_A10_PROOF` | 3 |
| `DEFER_PENDING_GENERATOR_PROVENANCE` | 1 |
| `PRESERVE_USER_WORK` | 1 |

## A07 Approvals Needed

A07 approval is required before:

- staging the four report/control evidence artifacts;
- deleting/quarantining/staging Daniel preview artifacts;
- reverting or staging any tracked page/manifest file;
- approving Daniel visibility or release;
- accepting any Orot surface or manifest state.

## Blockers

- `index.html` has staged and unstaged changes; do not modify, stage further, or revert without exact A07/owner decision.
- Daniel proof is incomplete for visibility/release; A10 proof and A07 final validation are required.
- Orot manifest generator/provenance is not established in this docket.
- Preview artifacts are not delete candidates yet; A10/A07 must decide whether they are needed.

## Boundary

This docket is an A06 evidence packet only. It creates no cleanup deletion, staging, reset, revert, publication/release, source/license/legal acceptance, Definition authority, product/data acceptance, answer acceptance, accepted text, or public/runtime mutation.
