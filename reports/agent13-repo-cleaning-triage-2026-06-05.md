# Agent 13 Repo Cleaning Triage - 2026-06-05

Status: `classification_first_non_destructive`.

## Immediate Result

Removed 9 untracked root scratch files:

- `--no-write`
- `.tmp-head-token-index.json`
- `.tmp_spark10_goal_cycle_snapshot.json`
- `tmp_validator_stdout.txt`
- `tmp_validator_stderr.txt`
- `.tmp-tosefta-brief-01-workids.txt`
- `.tmp-tosefta-brief-02-workids.txt`
- `.tmp-tosefta-brief-03-workids.txt`
- `.tmp-mishnah-pd-workids.txt`

No tracked file was restored, staged, reset, or deleted.

## Current Dirty Snapshot

Command basis: `git status --porcelain=v1` after scratch cleanup.

| class | count |
|---|---:|
| total changed paths | 17251 |
| tracked deletions `D ` | 12231 |
| untracked `??` | 3500 |
| modified unstaged ` M` | 1423 |
| staged modified `M ` | 48 |
| mixed modified `MM` | 27 |
| staged added `A ` | 20 |
| added+modified `AM` | 2 |

Top roots:

| root | count |
|---|---:|
| `data` | 12196 |
| `reports` | 2985 |
| `halakhah` | 879 |
| `scripts` | 522 |
| `chasidut` | 116 |
| `midrash` | 103 |
| `tosefta` | 78 |
| `mishnah` | 61 |
| `tanakh` | 49 |

## Material Classes

| repo scope | files classified | category | next safe action | blocker |
|---|---:|---|---|---|
| `data/public-hud/**` tracked deletions | 11937 | high-risk tracked deletion batch | decide restore-vs-delete as one coherent public-HUD baseline batch | cannot assume intended deletion |
| deleted `reports/**` | 236 | historical/proof artifact deletions | classify as stale proof cleanup vs accidental loss | deleting reports can erase current audit trail |
| untracked `reports/**` | 2987 | generated proof/control artifacts | split production evidence vs noise before staging | do not `git add -A` |
| untracked `*/overlay-export.{csv,json,md}` | 231 | generated per-work overlay export artifacts | batch by corpus/work family only if owner wants to keep exports | may be generated churn |
| modified `*/index.html` pages | 1286 | broad generated static page churn | do not stage until source generator/package basis is known | changed-input truth unclear |
| `data/lexical/**` changed/untracked | 183 | lexicon/index package changes | route through Agent 1/2/3/10 package truth before staging | could affect definitions/crossmatch |

## Proposed Cleaning Pipeline

1. `tracked-deletion-baseline`:
   Classify `D data/public-hud/**`, `.github/workflows/deploy-lightweight-pages.yml`, `404.html`, and `assets/css/reader-workbench.css` as restore candidate, intentional removal, or generated replacement.

2. `report-artifact-retention`:
   Split `reports/**` into current operating evidence, historical evidence to keep, and generated noise to ignore/delete.

3. `generated-page-churn`:
   Classify modified `*/index.html` and untracked `overlay-export.*` as generator output requiring a generator/run manifest before staging.

4. `lexicon-package-truth`:
   Classify `data/lexical/**`, `data/definitions/**`, and `data/sources/**` as package inputs requiring Agent 1/2/3/10 ownership and Agent 6 boundary where relevant.

## Hard Caps

- No `git add -A`.
- No `git reset --hard`.
- No blind deletion.
- No restore of 11937 `data/public-hud/**` deletions until the intended baseline is known.
- No staging generated page churn without generator/package basis.
- No acceptance claims from repo-cleaning evidence.

## Exact Next Decision Needed

Choose the first cleaning batch:

| option | action | risk |
|---|---|---|
| A | Restore all `D data/public-hud/**` tracked deletions from HEAD as accidental missing baseline | may undo intentional public-HUD removal |
| B | Preserve deletions as intended and prepare a deletion batch | may erase runtime/proof baseline |
| C | First run Agent 6 repo-cleaning pipeline over `data/public-hud/**` deletion class | slower, safest |

Recommended: `C` unless owner confirms A or B.

