# Agent 6 Tracked-Deletion Baseline: Public HUD And Support Files - 2026-06-05

## Disposition

BLOCK / NEEDS OWNER DECISION.

Decision option: `C exact blocker / needs owner decision`.

This is non-destructive deletion-baseline classification only. It does not restore, stage, reset, delete, preserve deletions as intentional, publish, accept, or release anything.

## Repo Scope

- Workdir: `C:/Users/owner/Documents/translations`
- Target scope: tracked deletions only
- Target paths:
  - `D data/public-hud/**`
  - `D .github/workflows/deploy-lightweight-pages.yml`
  - `D 404.html`
  - `D assets/css/reader-workbench.css`
- Basis: `git status --porcelain=v1 -z --untracked-files=all`

## Files Classified

| class | count |
|---|---:|
| total tracked deletions in repo | 12231 |
| target tracked deletions classified here | 11940 |
| `data/public-hud/**` tracked deletions | 11937 |
| `.github/workflows/deploy-lightweight-pages.yml` deletion | 1 |
| `404.html` deletion | 1 |
| `assets/css/reader-workbench.css` deletion | 1 |

Support target file existence:

| file | git status | exists in working tree |
|---|---|---|
| `.github/workflows/deploy-lightweight-pages.yml` | deleted | false |
| `404.html` | deleted | false |
| `assets/css/reader-workbench.css` | deleted | true |

The `assets/css/reader-workbench.css` case is especially unsafe to classify as simple absence because Git reports it as deleted while the filesystem currently has a file at that path. That implies index/worktree state requires separate inspection before staging or restoration.

## Category Counts

Public HUD routes with tracked deletions:

| route | deleted files |
|---|---:|
| `orot` | 3188 |
| `exodus` | 1624 |
| `numbers` | 1434 |
| `leviticus` | 1142 |
| `genesis` | 1097 |
| `deuteronomy` | 978 |
| `zechariah` | 806 |
| `amos` | 650 |
| `ruth` | 410 |
| `zephaniah` | 318 |
| `jonah` | 290 |

Public HUD file-kind classification:

| kind | deleted files |
|---|---:|
| `route-lookup` | 11894 |
| `chunks` | 11 |
| `manifest` | 11 |
| `occurrences` | 11 |
| `reader-hints` | 10 |

Interpretation:

- The target deletion batch is dominated by route-lookup shard removal.
- The batch covers 11 public-HUD route families, not a single route.
- Route-level manifests, occurrences, chunks, and reader-hints are also deleted, so this is not merely shard pruning.
- The deletion batch overlaps current public/runtime surface evidence and cannot be treated as safe generated-noise cleanup.

## Queued Items Also Validated

Queue health was checked separately:

- Command: `node scripts/validate_agent6_validation_queue.mjs`
- Result: passed with `0` warnings
- Report: `reports/agent6-validation-queue-health.md`

No queued item verdict or queue-state mutation is created by this docket.

## Proposed Non-Destructive Batch

Batch name: `tracked-deletion-baseline-public-hud-support`.

Permitted next actions:

- carry this classification docket as evidence;
- ask owner / Agent 10 / Agent 7 to choose restore, preserve-deletion, or continue blocker;
- run route-level existence/hash comparison against a known intended public-HUD build artifact if one exists;
- inspect `assets/css/reader-workbench.css` index/worktree discrepancy without staging.

Forbidden next actions from this docket alone:

- `git add -A`;
- `git reset --hard`;
- blind deletion;
- broad restore;
- staging deletion batch;
- treating deletions as intentional;
- treating deletions as accidental;
- public/runtime acceptance;
- source/license/legal acceptance;
- release action.

## Decision Options

| option | classification | Agent 6 ruling |
|---|---|---|
| A | restore accidental missing baseline | not cleared by this docket |
| B | preserve intentional deletion batch | not cleared by this docket |
| C | exact blocker / needs owner decision | selected |

Rationale:

- `11937` public-HUD tracked deletions could represent accidental loss of the current public reader dependency baseline.
- The same deletion set could also represent intentional generated-output replacement or quarantine, but no changed-input/release-owner proof is attached here.
- The three support deletions include deployment, root 404, and Reader Workbench CSS surfaces; those are not safe to bundle blindly with generated public-HUD shards.
- Agent 6 cannot decide A or B without owner/release-owner intent and a changed-input package.

## Exact Blocker

`public_hud_tracked_deletion_baseline_owner_decision_required`

Blocking evidence:

- `11937` tracked deletions under `data/public-hud/**`
- `11894` deleted `route-lookup` files
- route manifests/chunks/occurrences/reader-hints also deleted
- 11 affected routes: `orot`, `exodus`, `numbers`, `leviticus`, `genesis`, `deuteronomy`, `zechariah`, `amos`, `ruth`, `zephaniah`, `jonah`
- deleted deployment/runtime support files: `.github/workflows/deploy-lightweight-pages.yml`, `404.html`, `assets/css/reader-workbench.css`

Required missing decision:

- Owner or Agent 10/Agent 7 must state whether the public-HUD deletion baseline is accidental missing data to restore, intentional deletion to preserve, or an unresolved blocker to hold.

Minimum evidence before A or B:

- route-level intended baseline or changed-input package;
- statement whether current public reader dependencies should exist in repo;
- old-HUD/current-HUD impact statement;
- release-owner decision for deployment workflow and `404.html`;
- explanation of the `assets/css/reader-workbench.css` deleted-but-present discrepancy.

## Agent 7 Approval / Publication Need

Agent 7 approval/publication is required for any control-state, release-path, strategy, durable queue-state, or publication-path change that depends on this classification.

This Agent 6 docket can support the decision, but it does not activate or publish the decision.

## Handoff Owner

| issue | handoff owner |
|---|---|
| choose A/B/C for public-HUD deletion baseline | owner, with Agent 10 release-owner recommendation |
| changed-input/release package for public-HUD baseline | Agent 10 |
| runtime impact proof after a concrete changed package exists | Agent 4 |
| control-state publication if decision is durable | Agent 7 |
| queue/control hygiene after decision | Agent 5 / Agent 7 |

## Stop Condition

The target tracked-deletion baseline is classified and exact blocker is recorded. No restore, staging, reset, deletion, broad cleanup, queue/control mutation, public/runtime acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, answer eligibility, publication readiness, accepted text, commercial export authorization, NC commercial authorization, or release action was performed.

