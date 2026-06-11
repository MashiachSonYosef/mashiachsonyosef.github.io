# Agent 13 Repo Dirt Production Blocker Triage Order - 2026-06-04

Status: active production blocker.

Mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.

Boundary: non-destructive classification only. This does not authorize `git add -A`, `git reset --hard`, blind deletion, QA acceptance, source/license acceptance, runtime acceptance, publication readiness, product/data acceptance, answer acceptance, Definition authority, accepted gloss, or accepted text.

## Live Snapshot

Command:

`git status --porcelain=v1`

Current count snapshot:

| Status | Count |
|---|---:|
| Total changed paths | 16827 |
| `D ` tracked deletions | 12231 |
| `??` untracked | 2878 |
| ` M` unstaged modifications | 1423 |
| `A ` staged additions | 202 |
| `M ` staged modifications | 65 |
| `MM` staged+unstaged modifications | 26 |
| `AM` staged additions with unstaged modifications | 2 |

Largest concentrations:

| Group | Count |
|---|---:|
| `D  data/public-hud` | 11937 |
| `?? reports` | 2174 |
| ` M halakhah` | 762 |
| `?? scripts` | 293 |
| `D  reports` | 236 |
| `?? data/lexical` | 92 |
| ` M data/lexical` | 91 |
| `A  data/definitions` | 44 |

## Why This Blocks Production

A dirty tree at this size makes changed-input truth unclear.

Agent 4 cannot reliably prove validator/prereq/runtime effects if the baseline is undefined.

Agent 10 cannot reliably assemble release/package or Agent 6 boundary packets if tracked deletions, generated reports, scripts, and data additions have not been classified into coherent batches.

## Non-Destructive Triage Order

| Lane | Current blocker | Required output | Owner | Stop condition |
|---|---|---|---|---|
| Agent 1 | Source/data deletions and untracked source-like data need custody classification. | Classify tracked `data/public-hud` deletions and untracked `data/sources` / source-like data as intentional replacement, accidental missing data, production artifact, or noise. | Agent 1 | Classification artifact with counts and exact blockers; no staging/deletion. |
| Agent 2 | Definition data additions/modifications and untracked lexical data need lane-aware classification. | Classify definition/lexical changed paths into production candidate, generated intermediate, stale/noise, or needs Agent 6 boundary. Preserve source/export lane flags. | Agent 2 | Classification artifact with counts and exact blockers; no merge into reader output. |
| Agent 3 | Crossmatch/linkage/navigation outputs may be mixed with repo dirt. | Classify route/linkage/dedupe matrices and generated reports/scripts into coherent batch candidates. | Agent 3 | Batch map with files used, counts, next command, and missing fields. |
| Agent 4 | Validation baseline is unclear. | Produce a changed-input validation triage plan: which validators can run meaningfully now, which are blocked by dirty baseline, and exact changed inputs required. | Agent 4 | Validator/prereq blocker packet; no repeated unchanged-input churn. |
| Agent 10 | Release/package truth is unreliable until coherent batches exist. | Produce release-owner dirt triage: what can become an Agent 6 boundary packet, what is blocked, and what must not be staged. | Agent 10 | Exact batch/blocker list for Agent 6 or staging plan proposal. |
| Agent 7 / Agent 5 | Support lanes must prevent blind cleanup. | Staff the above lane-specific classification work and preserve delivery proof. | Agent 7 / Agent 5 | Every primary lane has artifact or exact blocker. |

## Hard Caps

- Do not run `git add -A`.
- Do not run `git reset --hard`.
- Do not blindly delete untracked files.
- Do not assume tracked deletions are bad until classified.
- Do not assume untracked reports/scripts/data are production artifacts until classified.
- Do not let repo cleanup replace the four project goals; this triage exists to unblock them.

## Agent 8 Callback

Route this as a production blocker correction:

`repo dirt | 16827 changed paths | changed-input/package truth unclear | Agents 1/2/3/4/10 classify lane-owned dirt into coherent batches or exact blockers | Agent 7 staffs, Agent 5 preserves proof | stop when no blind cleanup risk remains and Agent 10/Agent 4 can name reliable changed-input truth`
