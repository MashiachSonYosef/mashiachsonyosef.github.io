# Oracle 9 Public HUD Hide Note - 2026-06-01

## Current State

- Repository `main` is patched at [2a7b6c0](https://github.com/MashiachSonYosef/mashiachsonyosef.github.io/commit/2a7b6c054c038b27d39b5b244cfb7ec7114bfcd6).
- Raw GitHub now serves quarantine pages:
  - [hud-preview/index.html](https://raw.githubusercontent.com/MashiachSonYosef/mashiachsonyosef.github.io/main/hud-preview/index.html)
  - [hud-preview/routes/index.html](https://raw.githubusercontent.com/MashiachSonYosef/mashiachsonyosef.github.io/main/hud-preview/routes/index.html)
- Public GitHub Pages is still serving the old artifact at [mashiachsonyosef.github.io/hud-preview/](https://mashiachsonyosef.github.io/hud-preview/).
- Public [mashiachsonyosef.github.io/hud-preview/routes/](https://mashiachsonyosef.github.io/hud-preview/routes/) has not yet served the route quarantine page.
- Pages source is legacy branch deploy from `main` at `/`.
- Pages build history showed one errored automatic build for commit `2a7b6c0`, then a manually requested rebuild for the same commit with status `building` as of the last check.

## Methodology

- Replaced public HUD preview HTML with a small `noindex` quarantine page.
- Replaced public route preview HTML with a small `noindex` quarantine page.
- Updated HUD validators so quarantine pages are treated as intentional public-runtime shutdowns, while renderer checks remain active.
- Validated locally in the full workspace.
- Used a clean sparse clone under `.codex-tmp/hide-hud-sparse` to commit only the four intended files because the main workspace is heavily dirty from other agents.
- Pushed directly to `main`, then checked raw GitHub, live GitHub Pages, Pages source metadata, and Pages build history.

## Changes Made

- `hud-preview/index.html`: removed the interactive HUD sampler and served only a quarantine notice.
- `hud-preview/routes/index.html`: removed route preview runtime and served only a quarantine notice.
- `scripts/validate_hud_contract.mjs`: skips preview-specific checks only when quarantine markers are present.
- `scripts/validate_hud_route_preview.mjs`: exits successfully when the route preview is intentionally quarantined.

## Verification

- `node --check scripts/validate_hud_contract.mjs`: pass.
- `node --check scripts/validate_hud_route_preview.mjs`: pass.
- `node scripts/validate_hud_route_preview.mjs`: pass, printed `HUD route preview is quarantined from public runtime.`
- `node scripts/validate_hud_contract.mjs`: pass, printed `HUD contract validation passed.`
- Raw GitHub [hud-preview/index.html](https://raw.githubusercontent.com/MashiachSonYosef/mashiachsonyosef.github.io/main/hud-preview/index.html): status 200, quarantine marker present, old `HUD Sampler` absent.
- Raw GitHub [hud-preview/routes/index.html](https://raw.githubusercontent.com/MashiachSonYosef/mashiachsonyosef.github.io/main/hud-preview/routes/index.html): status 200, quarantine marker present, old preview absent.
- Live [hud-preview](https://mashiachsonyosef.github.io/hud-preview/): still old artifact, `last-modified: Sat, 30 May 2026 16:38:34 GMT`, title `HUD Sampler | Hebrew Source Workbench`.

## Plain-English Translation

The code is hidden in the repository, but the public website is still showing an old GitHub Pages build. This is now a publishing/build problem, not a local code-change problem.

## Suggestions To Agent 7

- Treat old HUD exposure as a live Pages publication blocker until [mashiachsonyosef.github.io/hud-preview/](https://mashiachsonyosef.github.io/hud-preview/) contains `data-public-runtime-quarantine`.
- Do not mark the HUD public surface resolved based only on repository `main` or raw GitHub links.
- Prioritize diagnosing the legacy Pages build failures before producing more governance documents.
- Keep the owner-facing status as: `repo hidden, public artifact stale`.

## Decision Needed From Owner

If the Pages build stays failed or stuck, choose one publication lane:

- Fix the legacy Pages build so `main` deploys again.
- Move Pages to a GitHub Actions artifact deployment with an explicit public artifact.
- Temporarily unpublish the entire GitHub Pages site only if hiding the old HUD is more important than keeping the rest of the site live.
