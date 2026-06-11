# Agent 7 Hook Governance Before Live-HUD Swap

Date: 2026-06-01
Authority: Agent 7 CEO / priority authority
Status: CEO decision packet; not QA acceptance

## Decision

Do not make new hook infrastructure a prerequisite for the live Deuteronomy old-HUD swap.

Hooks are useful for this workspace, but before the live-HUD swap they should not become another moving part. The immediate priority remains isolating the live old-HUD cause, proving whether the issue is stale deployed bundle/cache or deployed page mismatch, and preparing the smallest remediation path that Agent 6 can validate.

## Current Hook State

Checked local repo/tooling state:

- `package.json` exists and only defines `build`: `node scripts/generate_corpus_reports.mjs`
- no `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`
- no `.husky`
- no `.githooks`
- no `lefthook.yml`
- no `.pre-commit-config.yaml`
- no configured Git `core.hooksPath`
- `.git/hooks` contains only Git sample hook files

Current conclusion: the repo is not using configured hooks.

## Policy

Hooks should be adopted only as narrow guardrails, not broad maintenance runners.

Allowed pre-swap:

- document the hook gap
- keep swap validation explicit and bounded
- use manual targeted validators for the live-HUD incident

Not allowed pre-swap:

- adding a hook framework as a dependency of the swap
- broad generated-corpus scans in hooks
- render/build hooks
- hook work that queues Agents 1-4 into unrelated cleanup
- treating hook installation as QA acceptance or publication support

Recommended post-swap direction:

- consider a tiny `pre-commit` guard for touched control JSON/report boundary files
- keep heavier Agent 6 / Agent 7 validators as explicit `pre-push` or manual commands
- avoid hooks that walk all reports, generated pages, or source inventories by default

## Agent 5 Direction

Agent 5 should not pile hook infrastructure into the current live-HUD swap lane.

If hooks are later proposed, packet them separately with:

- exact files covered
- exact validators run
- measured runtime
- failure behavior
- why the hook does not broaden the live-HUD swap
- statement that hooks do not create Agent 6 acceptance, publication readiness, source/provenance acceptance, or runtime/public acceptance

## Boundary

Publication remains `blocked_no_render`.

The live old-HUD incident remains governed by `reports/agent7-live-old-hud-deuteronomy-escalation-2026-06-01.md` and Agent 6's existing WARN boundary. Hook adoption does not change old-HUD quarantine, source/provenance blockers, Reader Workbench limits, Definition authority limits, or publication status.
