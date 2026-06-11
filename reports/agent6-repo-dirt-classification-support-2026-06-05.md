# Agent 6 Repo Dirt Classification Support - 2026-06-05

## Disposition

WARN-BLOCKING SUPPORT DOCKET.

This is non-destructive repo-dirt classification only. It does not stage, delete, revert, clean, accept, publish, or clear any QA/product/source/runtime gate.

## Repo Scope

- Workdir: `C:/Users/owner/Documents/translations`
- Branch: `main`
- HEAD observed: `e7f6da84a`
- Snapshot command basis: `git status --porcelain=v1 -z --untracked-files=all`
- Files classified: `17239` dirty status records

## Category Counts

| category | count | classification |
|---|---:|---|
| tracked deletions | 12231 | P0 needs-owner/release-owner review before any staging |
| modified tracked files | 1490 | needs lane packet or owner/release classification |
| added tracked files | 22 | can be batched only with matching validation/provenance |
| untracked files | 3496 | classify before staging; do not `git add -A` |

## Path-Family Counts

| path family | dirty records | classification |
|---|---:|---|
| `data/public-hud` | 11937 | P0 public-runtime/generated-output churn candidate; blocks package truth until reconciled |
| `reports` | 2777 | support evidence plus report-deletion risk; batchable only by docket family |
| site pages | 1541 | public/runtime surface dirt; release-owner packet required |
| `scripts` | 442 | validator/builder provenance dirt; batch with corresponding evidence only |
| other `data` | 435 | source/lexical/generated data; source-lane review required |
| `tanakh` | 49 | public page/runtime dirt; release-owner packet required |
| `data/definitions` | 19 | definition/workbench planning data; Agent 2/6 boundary required |
| `data/control` | 16 | control-state dirt; Agent 7/5 publication or queue hygiene proof required |
| temp/noise | 9 | delete only after explicit owner approval |
| `data/translation-memory` | 4 | source/provenance risk; Agent 1/6 review required |
| `assets`, `hud-preview`, `orot`, root artifacts | 10 | runtime/support dirt; exact packet required |

## Deletion Classification

Tracked deletions are the highest risk because they can silently remove public/runtime data, validators, reports, or deployment support.

| deletion family | count | preliminary classification |
|---|---:|---|
| `data/public-hud` deleted files | 11937 | generated-output churn candidate, but treated as P0 until release owner proves intentional replacement/quarantine |
| `reports` deleted files | 236 | provenance/docket loss risk; hold |
| `scripts` deleted files | 55 | validator/builder loss risk; hold |
| deployment/runtime support deletions | 3 | `.github/workflows/deploy-lightweight-pages.yml`, `404.html`, `assets/css/reader-workbench.css`; hold |

Sample deleted public-HUD paths:

- `data/public-hud/amos/chunks/amos-001.json`
- `data/public-hud/amos/manifest.json`
- `data/public-hud/amos/occurrences.json`
- `data/public-hud/amos/reader-hints.json`

## Untracked Classification

| untracked family | count | preliminary classification |
|---|---:|---|
| `reports` | 2474 | support evidence; batch by agent/date/scope, excluding raw logs unless explicitly wanted |
| `scripts` | 344 | possible validators/builders; require matching report packet before staging |
| other `data` | 336 | likely lexical/generated data; source/provenance or generator packet needed |
| site-page overlays | 305 | generated/export surface; release-owner classification needed |
| `data/control` | 16 | canonical control-risk; must not remain untracked if relied on by validators/control claims |
| `data/definitions` | 7 | workbench/sample planning; Agent 2/6 boundary needed |
| `data/translation-memory` | 4 | source/provenance risk; Agent 1/6 boundary needed |
| temp/noise | 9 | deletion candidate only with explicit owner approval |

Sample untracked temp/noise paths:

- `--no-write`
- `.tmp-head-token-index.json`
- `.tmp_spark10_goal_cycle_snapshot.json`
- `tmp_validator_stderr.txt`
- `tmp_validator_stdout.txt`

## Proposed Non-Destructive Batches

### Batch A - QA Support Docket

Scope: this classification report and optional machine summary only.

Use: safe first staging batch if the owner wants a checkpoint commit. This does not clean the repo.

### Batch B - Evidence Reports

Scope: new/modified `reports/agent*.md`, `reports/agent*.json`, validator reports, and Agent 6 dockets that have matching task context.

Hold out:

- deleted reports
- `.spark*_*.log`
- reports whose linked source artifacts are absent

Owner lane: Agent 5/7 for control routing; Agent 10 where release packet related; Agent 6 for QA dockets.

### Batch C - Validators And Builders

Scope: added/modified `scripts/*.mjs` that have a matching report, validator command, and zero-output boundary.

Hold out:

- 55 deleted scripts
- orphan scripts with no report packet
- broad generators that mutate public/runtime/source surfaces without an exact release-owner packet

Owner lane: relevant worker lane plus Agent 10 for release packaging.

### Batch D - Control State

Scope: `data/control/*.json`.

Condition: only stage with Agent 7/Agent 5 publication or queue-health proof and exact boundaries.

Blocker: `16` untracked control files are too material to leave as invisible local state if validators or agents rely on them.

### Batch E - Runtime/Public-HUD/Site Surface

Scope: `data/public-hud/**`, site pages, `tanakh/**`, `orot/**`, `hud-preview/**`, `assets/**`, root public files.

Condition: do not stage until Agent 10 or release owner provides a changed-input package that explains:

- why `11937` public-HUD tracked deletions are intentional or restored
- which public routes are meant to be live
- whether old-HUD quarantine remains intact
- which files are generated output versus hand-authored runtime code

### Batch F - Temporary Noise

Scope: `--no-write`, `.tmp*`, `tmp_validator_*`.

Condition: explicit owner approval for deletion. No blind deletion.

## Exact Blockers

1. Public-HUD package truth is blocked by `11937` tracked deletions under `data/public-hud`. This must be classified as intentional generated-output replacement, quarantine, or accidental data loss before any public/runtime or release packet can be trusted.
2. Provenance and validator recountability are blocked by `236` deleted reports and `55` deleted scripts. These may remove the evidence chain and must not be staged as cleanup without an owner/agent-specific reason.
3. Control truth is blocked by `16` untracked `data/control` files if any current validator, queue, goal board, or gate state depends on them. Either publish them through the Agent 7/5 control path or mark them local-only with a reason.
4. Runtime/public claims are blocked by `1541` dirty site-page records plus `49` dirty `tanakh` records unless the release owner supplies exact route-level changed-input packets.
5. Source/provenance claims remain blocked for untracked or modified source/lexical/translation-memory data until Agent 1/6 classify row/source ownership.
6. Cleanup itself is blocked from destructive action. This docket authorizes classification only, not deletion, reset, restore, staging, or commit.

## Handoff Owners

| issue | handoff owner |
|---|---|
| public-HUD deletion reconciliation | Agent 10 release owner, with Agent 4 runtime proof if changed public surface exists |
| control-state untracked files | Agent 5/Agent 7 |
| source/lexical/translation-memory dirt | Agent 1, then Agent 6 docket if QA-relevant |
| definition/workbench planning files | Agent 2, then Agent 6 boundary if used downstream |
| usage/navigation packets | Agent 3 if applicable |
| runtime/browser changed-input proof | Agent 4 after a concrete changed package exists |
| temp/noise deletion | owner explicit approval |

## Stop Condition

Classification artifact exists. No staging, deletion, reverting, cleanup, product acceptance, source/provenance acceptance, license/legal acceptance, runtime/public acceptance, Definition authority, answer eligibility, publication readiness, accepted text, commercial export authorization, NC commercial authorization, or release action is created by this docket.

