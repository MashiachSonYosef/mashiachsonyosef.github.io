# Agent 12 Process Timeout Cap - Agent 10 / Agent 6

Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE.

Boundary: limiter/support advice only. No QA, source/license, Definition, runtime, public, release, product, answer, or accepted-text claim.

## Current Rule

Every local command, validator, repo scan, browser automation, server, watcher, or helper must have an explicit timeout, bounded stop condition, or documented interactive reason before it starts.

## Timeout Log

process_timeout | command | timeout | partial_output_or_artifact | next_safe_action
--- | --- | --- | --- | ---
timeout | `netstat -ano` / stop listener on port `8765` | 10000 ms | no completed output; command exceeded timeout while trying to identify/stop the old proof helper | do not repeat broad `netstat`; use exact known PID or a bounded socket check only
timeout | `Stop-Process -Id 37860` plus bounded socket check | 5000 ms | no completed output; prior evidence identified PID `37860` as the old proof helper listener | do not retry same PowerShell stop path without a changed mechanism
timeout | `cmd /c taskkill /PID 37860 /F` | 5000 ms | no completed output; exact-PID Windows kill path also exceeded timeout | treat local cleanup as exact blocker; no new helper/server on `8765` until port/process state is proven by a bounded method
prior_timeout | broad `Get-CimInstance Win32_Process` process inspection | 10000 ms | process-inspection attempts timed out before this packet | do not retry broad process scans; inspect only exact PID/profile/path with timeout
timeout | `Get-Item reports/agent12-process-timeout-cap-agent10-agent6-2026-06-05.md` plus scoped `git status` | 10000 ms | no completed output; `apply_patch` already confirmed artifact creation | do not use git/status as proof path while local process state is unstable; rely on direct patch success unless a later bounded status succeeds

## Agent 10 / Agent 6 Cap Table

lane | cap/allow | reason | exact next useful work | stop condition
--- | --- | --- | --- | ---
Agent 10 release/package integration | allow bounded package validators, package truth checks, and Agent 6 boundary packet assembly | package truth needs exact changed inputs and exact validation status | run only named validators with explicit `timeout_ms`, artifact path, and expected output class | validator artifact exists, timeout is recorded, or exact missing field is named
Agent 10 local helpers | cap unbounded servers, watchers, browser sessions, and repeated hung commands | still-running processes are not evidence and can consume the lane | if a helper is needed, record port/PID, timeout or interactive reason, and shutdown command before launch | helper is stopped, or an exact process cleanup blocker is recorded
Agent 6 repo-cleaning pipeline | allow bounded dirty-repo classification and docket generation | repo state affects package truth and validator inputs | classify tracked deletions, untracked artifacts, generated churn, and support evidence with bounded scans | docket artifact exists or exact unknown file/source class remains
Agent 6 repo-validation pipeline | allow exact validators on named files/subsets | validation should answer a scoped package question | validate only named changed inputs with timeout and output artifact | pass/fail/blocker artifact exists
Agent 6 queued-item validation | allow queue batches with bounded word/time slice and exact item stop | queued validation should not starve repo work or become a vague backlog | process queued items only from a named queue artifact with item ids and expected verdict shape | all queued items in slice are docketed, or missing field is named
Browser/HUD proof | allow only bounded browser automation with URL, viewport, timeout, and screenshot/DOM artifact | runtime proof requires visible output, but unbounded browser waits are waste | run one scoped browser proof per changed package input | screenshot/DOM artifact exists or timeout log records the blocker
Repo scans | cap long scans without progress limit or timeout | broad repo scans have been a current failure mode | use `rg`/direct paths/known JSON first; broad scans require timeout and output cap | bounded result set exists or exact narrower search is named

## One-Line Enforcement Rule

If a process cannot name its timeout, artifact, and stop condition before launch, Agent 10/6 should not launch it; if it times out, record the timeout row and change scope before retrying.

## Exact Blocker

`process_cleanup_blocker_port_8765_pid_37860`: the old local proof helper was previously identified on port `8765`, but three bounded stop/inspection paths timed out. No further Agent 12 retries should occur without a changed mechanism or owner-directed local OS cleanup.
