# Agent 6 Owner Route Decision Request - 2026-06-02

## Purpose
Agent 6 has WARN-ACCEPTED the Deuteronomy delivery-blocker evidence only. The public/runtime blocker remains active. The lane now requires an owner-approved delivery route before Agent 5 can produce bounded deploy/swap execution evidence.

This packet is a decision request, not deployment authorization, implementation acceptance, or public/runtime clearance.

## Current Evidence
Latest Agent 6 verification:

- Check time: `2026-06-02T01:46:40.530Z` for live probe.
- Branch: `main`.
- Local HEAD: `228910413f5621e134e03f686c3e3481d9ef814d`.
- `origin/main`: `2a7b6c054c038b27d39b5b244cfb7ec7114bfcd6`.
- Divergence: `origin/main...HEAD = 1 behind / 53 ahead`.
- `git push --dry-run origin main`: exit `1`, rejected `main -> main (non-fast-forward)`.
- `.github` directory in this checkout: absent.
- `assets/js/reader-workbench.js`: exists locally as untracked; absent from `origin/main`.
- `assets/css/reader-workbench.css`: exists locally as untracked; absent from `origin/main`.

Live public state remains blocked:

- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`: HTTP 200, old-HUD markers present; `Route HUD`, `reader-workbench.js`, and `data-hud-runtime-contract` absent.
- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`: same old-HUD result.
- Five root current runtime/data dependencies return HTTP 404:
  - `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js`
  - `https://mashiachsonyosef.github.io/assets/css/reader-workbench.css`
  - `https://mashiachsonyosef.github.io/data/lexical/deuteronomy.manifest.json`
  - `https://mashiachsonyosef.github.io/data/lexical/occurrences/deuteronomy.json`
  - `https://mashiachsonyosef.github.io/data/definitions/hud-route-lookup/manifest.json`
- `https://mashiachsonyosef.github.io/hud-preview/`: HTTP 200 stale HUD Sampler, no `data-public-runtime-quarantine`.
- `https://mashiachsonyosef.github.io/tanakh/genesis/`: HTTP 200 old-HUD markers present.

## Decision Required
Owner must authorize exactly one route before Agent 5 attempts deploy/swap evidence:

### Option A: Clean Deploy Branch/Worktree
Authorize a clean deploy branch or separate worktree based on current `origin/main`, staging only the bounded Deuteronomy P0 artifact set.

QA preference: safest bounded route because it avoids deploying broad unrelated dirty-tree changes.

Minimum required artifact set:

- `tanakh/deuteronomy/index.html`
- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- `data/lexical/deuteronomy.manifest.json`
- `data/lexical/occurrences/deuteronomy.json`
- `data/definitions/hud-route-lookup/manifest.json`

### Option B: Selected-Artifact Deployment Path
Provide or authorize a deployment workflow/path that publishes the exact bounded artifact set without branch reconciliation.

QA condition: Agent 5 must record the exact command/workflow, artifact hashes, target branch/site, and post-deploy live probe.

### Option C: Reconcile and Deploy Divergent Main
Authorize explicit branch reconciliation and deployment from divergent local `main`.

QA warning: this is broader than the Deuteronomy P0 swap and must not be implied silently. It risks bundling unrelated generated/site changes into public runtime.

## Rejected Non-Options
- Another no-drift live proof loop.
- Direct `git push origin main` from the current divergent dirty checkout without owner authorization.
- Pulling Agent 4 into runtime validation before post-swap evidence exists.
- Interrupting Agents 1-3 for this deployment-route blocker.
- Bundling `/hud-preview/` or Genesis drift into Deuteronomy P0 acceptance.

## Agent 6 Acceptance Condition After Owner Route
Agent 6 will not downgrade the live Deuteronomy blocker until a post-swap packet proves:

- Live Deuteronomy no longer exposes old-HUD markers.
- Live current HUD/runtime contract is present on the bounded Deuteronomy page.
- Required root runtime/data dependencies return HTTP 200 and match the approved bounded artifact set or an explicitly approved replacement set.
- Source/license/citation rows are present and not misleading for the bounded public page.
- Broader `/hud-preview/` and Genesis drift remain separate blockers.
- No publication readiness, accepted translation text, source/provenance custody, route publication support, Definition authority, usage-as-definition authority, or product/data acceptance is claimed by implication.

## Boundary
Publication remains `blocked_no_render`. Live Deuteronomy remains BLOCKED. This packet requests owner route selection only and creates no acceptance.
