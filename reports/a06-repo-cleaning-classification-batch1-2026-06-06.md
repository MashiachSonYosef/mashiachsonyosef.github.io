# A06 Repo-Cleaning Classification Batch 1

Date: 2026-06-06

Status: A06_REPO_CLEANUP_PACKET_READY / EVIDENCE-READY ONLY.

Route split confirmed:
- A06: evidence, validators, repo-cleaning production packets.
- A07: approval, SOP, final validation, release gate, cleanup approval.

Safety confirmations:
- No destructive commands run.
- No `git add -A`.
- No `git reset --hard`.
- No blind deletion.
- No staging.
- Existing validated words preserved; redo only changed/flagged rows.

## Scoped Dirt Snapshot

Command:

```text
git status --porcelain=v1 -- index.html tanakh/daniel/index.html orot/index.html data/lexical/orot.manifest.json reports/a14-a08-splash-header-org-pipeline-2026-06-06.md reports/sop-026-a06-repo-cleaning-production-pipeline-2026-06-06.md reports/daniel-prehud-fullbook-preview.html scripts/build_daniel_prehud_fullbook_preview.mjs
```

Result:

```text
 M data/lexical/orot.manifest.json
MM index.html
 M orot/index.html
 M tanakh/daniel/index.html
?? reports/a14-a08-splash-header-org-pipeline-2026-06-06.md
?? reports/daniel-prehud-fullbook-preview.html
?? reports/sop-026-a06-repo-cleaning-production-pipeline-2026-06-06.md
?? scripts/build_daniel_prehud_fullbook_preview.mjs
```

## Classification Table

| path | git status | class | evidence | proposed action | risk | validator/result | rollback path | owner | stop condition |
|---|---:|---|---|---|---|---|---|---|---|
| `index.html` | `MM` | `USER_WORK_PRESERVE` | Root page has owner splash/header/library work; contains `Hebrew Source Workbench`, `library-stack`, Daniel card, Orot card. Staged plus unstaged changes indicate active user/agent work. | No cleanup action. Preserve pending A07/A05 route decision. | high | Scoped `git diff --check`: only LF/CRLF warning. | Do not revert without A07/owner exact approval. | A05/A07/owner | Preserve; no A06 approval. |
| `tanakh/daniel/index.html` | ` M` | `GENERATED_CANDIDATE` | Daniel render candidate exists with Route HUD markers and source notes; A14 says Daniel visibility requires A10 proof and A07 approval. | Preserve as generated candidate; no release/publication claim. | high | Scoped `git diff --check`: no whitespace error reported. | Regenerate only via approved Daniel render/preview pipeline or A07 action. | A10/A07 | Await A10 proof/A07 approval before visibility/release. |
| `orot/index.html` | ` M` | `KEEP_AUTHORITATIVE` | Orot is active render-style surface; Route HUD markers present. | Preserve; no cleanup action from dirty status alone. | high | Scoped `git diff --check`: only LF/CRLF warning. | Do not revert without exact Orot surface decision. | A10/A07/owner | Preserve current Orot surface until exact changed-row/surface review. |
| `data/lexical/orot.manifest.json` | ` M` | `GENERATED_CANDIDATE` | JSON parses; one-line manifest diff with generated timestamp/content churn risk. | Preserve pending generator/provenance classification; no cleanup action. | medium | `node -e JSON.parse(...)`: passed; scoped `git diff --check`: LF/CRLF warning. | Regenerate from known Orot lexical build or restore only with A07/owner approval. | A10/A02 | Classify generator before staging/revert. |
| `reports/a14-a08-splash-header-org-pipeline-2026-06-06.md` | `??` | `KEEP_AUTHORITATIVE` | A14 routing/evidence packet for splash/header org; required for coordination. | Preserve as evidence artifact. | low | Read first 40 lines; content is bounded routing packet. | Remove only if A07/owner supersedes/quarantines. | A14/A08/A07 | Keep for route evidence. |
| `reports/sop-026-a06-repo-cleaning-production-pipeline-2026-06-06.md` | `??` | `KEEP_AUTHORITATIVE` | Owner-directed A06 repo-cleaning pipeline draft/adoption evidence. | Preserve as control/evidence artifact. | low | Read full artifact; consistent with A06 production/A07 approval split. | Remove only if A07/owner supersedes/quarantines. | A06/A07/A14 | Keep for pipeline evidence. |
| `reports/daniel-prehud-fullbook-preview.html` | `??` | `PREVIEW_ONLY` | Large generated Daniel preview output from local builder; not publication/release evidence. | Preserve as preview artifact; A07 approval required before cleanup/delete/stage. | medium | Paired builder syntax passed. | Regenerate via `scripts/build_daniel_prehud_fullbook_preview.mjs`; delete only with A07 approval. | A10/A07 | Keep as preview until A07 decides. |
| `scripts/build_daniel_prehud_fullbook_preview.mjs` | `??` | `GENERATED_CANDIDATE` | Builder for Daniel pre-HUD preview; reads Daniel source and public lexical claims, writes preview/report. | Preserve as generator candidate; no staging/cleanup action. | medium | `node --check`: passed. | Remove only if preview route rejected by A07/owner. | A10/A07 | Keep pending route decision. |

## Class Counts

| class | count |
|---|---:|
| `KEEP_AUTHORITATIVE` | 3 |
| `GENERATED_CANDIDATE` | 3 |
| `PREVIEW_ONLY` | 1 |
| `STALE_REVERT_CANDIDATE` | 0 |
| `DELETE_CANDIDATE_REQUIRES_A07` | 0 |
| `UNKNOWN_DO_NOT_TOUCH` | 0 |
| `USER_WORK_PRESERVE` | 1 |

## Validators / Checks

| command | timeout | result |
|---|---:|---|
| `node -e "JSON.parse(... data/lexical/orot.manifest.json ...)"` | 120000ms | passed |
| `node --check scripts\build_daniel_prehud_fullbook_preview.mjs` | 120000ms | passed |
| `git diff --check -- <batch paths>` | 120000ms | passed with LF/CRLF warnings for `data/lexical/orot.manifest.json`, `index.html`, `orot/index.html` |

## Safe Next Cleanup Candidates

No deletion, revert, staging, or cleanup action is safe without A07 approval.

Potential next A06 evidence-only packets:
- `index.html` splash/header scoped diff packet for A07/A05.
- Daniel preview generator/output packet for A10/A07.
- Orot manifest generator/provenance packet before any stage/revert decision.

## A07 Approval Required

A07 approval is required before:
- staging any file in this batch;
- deleting or quarantining preview artifacts;
- reverting any tracked file;
- publishing/releasing Daniel visibility;
- treating Orot manifest/page changes as accepted.

## Blockers

- `index.html` is `MM`; staged and unstaged changes require owner/A07 route before any cleanup decision.
- Daniel page/preview are not release-ready from this packet; A10 actual-page proof and A07 approval are required.
- `data/lexical/orot.manifest.json` generator/provenance is not classified deeply enough for staging/revert.

## Boundary

No cleanup deletion, staging, reset, publication/release, source/license/legal acceptance, Definition authority, product/data acceptance, answer acceptance, accepted text, or public/runtime acceptance is created by this packet.
