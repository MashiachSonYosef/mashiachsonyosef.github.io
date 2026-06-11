# Agent 10 HUD lightweight post-swap evidence - 2026-06-02

## Scope

Agent 10 deployed a bounded public HUD package for the Deuteronomy route HUD while keeping the full corpus, lexical data, source data, and full generated site local at `C:\Users\owner\Documents\translations`.

This is deployment/runtime evidence only. It does not claim translation acceptance, source publication readiness, accepted definition authority, or Agent 6 validation closure.

## Commits

- `22f57508a03bdebab65db0db767e10131986ac74` - `Deploy lightweight Deuteronomy HUD`
- `b198239171c4b7191bd2796cf5da1230f2aa0281` - `Publish HUD Pages artifact sparsely`

Both pushes were fast-forward updates to `main`.

## Public artifact boundary

Published artifact contents are intentionally small:

- `.nojekyll`
- `index.html`
- `tanakh/deuteronomy/index.html`
- `assets/css/reader-workbench.css`
- `assets/js/reader-workbench.js`
- `data/public-hud/deuteronomy/**`

The GitHub Actions build log for run `26819165730`, build job `79068769394`, reported:

- `.site`: `2.9M`
- uploaded Pages zip: `308933 bytes`
- artifact ID: `7357415749`

The prior root/static approach was not viable because the repo still contains about `2,268,654,368` tracked bytes outside the excluded lexical/source directories, mostly generated HTML pages. That remains above the GitHub Pages artifact limit path and is not shipped in this deployment.

## GitHub Pages deployment

- Workflow: `Deploy Lightweight Pages`
- Run ID: `26819165730`
- Run status: `completed`
- Run conclusion: `success`
- Build job: `79068769394`, `success`
- Deploy job: `79068798762`, `success`
- Deployment ID: `4903992349`
- Deployment status ID: `13973291609`
- Deployment state: `success`
- Environment URL: `https://mashiachsonyosef.github.io/`
- Pages build version: `b198239171c4b7191bd2796cf5da1230f2aa0281`

Note: GitHub also started the legacy automatic `pages build and deployment` run `26819164273` for the same commit. As of the evidence window it remained stuck/in progress in its `Upload artifact` step. It is not the successful custom deployment above. Recommended IT follow-up is to switch Pages source fully to GitHub Actions, or otherwise disable the legacy branch-source build path, if repository settings access is available.

## Live HTTP evidence

All live checks below were made against `https://mashiachsonyosef.github.io/` after deployment success.

| URL | Status | Last-Modified | Bytes |
| --- | ---: | --- | ---: |
| `/tanakh/deuteronomy/` | 200 | Tue, 02 Jun 2026 12:18:24 GMT | 1313900 |
| `/tanakh/deuteronomy/index.html` | 200 | Tue, 02 Jun 2026 12:18:24 GMT | 1313900 |
| `/assets/js/reader-workbench.js` | 200 | Tue, 02 Jun 2026 12:18:24 GMT | 62435 |
| `/assets/css/reader-workbench.css` | 200 | Tue, 02 Jun 2026 12:18:24 GMT | 2745 |
| `/data/public-hud/deuteronomy/occurrences.json` | 200 | Tue, 02 Jun 2026 12:18:24 GMT | 665725 |
| `/data/public-hud/deuteronomy/manifest.json` | 200 | Tue, 02 Jun 2026 12:18:24 GMT | 824 |
| `/data/public-hud/deuteronomy/chunks/deuteronomy-001.json` | 200 | Tue, 02 Jun 2026 12:18:24 GMT | 13291 |
| `/data/public-hud/deuteronomy/route-lookup/manifest.json` | 200 | Tue, 02 Jun 2026 12:18:24 GMT | 496 |
| `/data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json` | 200 | Tue, 02 Jun 2026 12:18:24 GMT | 179423 |

Marker evidence from `/tanakh/deuteronomy/`:

- `Route HUD`: `3`
- `reader-workbench.js`: `1`
- `data/public-hud/deuteronomy`: `6`
- `Clicked Hebrew form`: `0`
- `Best actual hit`: `0`
- `data-hud-renderings`: `0`
- `data/lexical/deuteronomy`: `0`
- `data/definitions/hud-route-lookup`: `0`

## Live browser click evidence

Browser probe:

- URL: `https://mashiachsonyosef.github.io/tanakh/deuteronomy/?codex_probe=1780402977869`
- Click target: `[data-lexical-index="tok-21613e763fe6"]`
- HUD title after click: `Route HUD: אֵ֣לֶּה`
- HUD hidden: `false`
- Rendered `.route-card` count: `53`
- Rendered `.route-answer-card` count: `1`
- Sources and licenses section present: `true`
- Old `Clicked Hebrew form` marker present: `false`
- Old `Best actual hit` marker present: `false`
- `data-hud-renderings` attributes present: `0`
- Reader script present: `true`
- Console errors: `0`
- Page errors: `0`

Runtime dependency responses observed in the browser were all `200`:

- `/assets/css/reader-workbench.css`
- `/assets/js/reader-workbench.js`
- `/data/public-hud/deuteronomy/occurrences.json`
- `/data/public-hud/deuteronomy/manifest.json`
- `/data/public-hud/deuteronomy/chunks/deuteronomy-001.json`
- `/data/public-hud/deuteronomy/route-lookup/manifest.json`
- `/data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json`

First rendered route card text began:

`#1אֵלֶּהform of זה5Strict Hebrew matches | 84% | exact`

## Boundary notes for Agent 6 and Agent 7

- The full HUD/corpus data remains local on this computer.
- The public deployment is a bounded runtime proof for the Deuteronomy HUD replacement path.
- The deployment does not publish the full lexical/source datasets.
- The deployment does not clear translation, source, definition, or publication acceptance.
- Remaining IT issue: the legacy automatic branch Pages build path is still noisy and should be disabled or switched fully to Actions when settings access is available.
