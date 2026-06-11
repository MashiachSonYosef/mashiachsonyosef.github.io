# Agent 10 fullscreen HUD and old-HUD quarantine evidence - 2026-06-02

## Scope

Agent 10 changed the live lightweight public artifact after owner direction that the replacement HUD should be full screen and the old HUD is more dangerous.

This note is deployment/runtime evidence only. It does not claim translation acceptance, definition authority, source publication readiness, or Agent 6 validation closure.

## Commit and deployment

- Commit: `765a98a8920d6dcdd897f71abe3cf218f8abc19a`
- Commit message: `Make public HUD fullscreen and quarantine old HUDs`
- Workflow: `Deploy Lightweight Pages`
- Run ID: `26823729263`
- Build job: `79085152793`, `success`
- Deploy job: `79085189424`, `success`
- Deployment ID: `4905082307`
- Deployment status ID: `13976363398`
- Deployment state: `success`
- Environment URL: `https://mashiachsonyosef.github.io/`

Only the custom lightweight workflow appeared for this commit. The prior legacy automatic branch Pages build did not reappear for SHA `765a98a8920d6dcdd897f71abe3cf218f8abc19a`.

## Artifact boundary

The workflow sparse-checkout and artifact copy now include only:

- `.nojekyll`
- `404.html`
- `index.html`
- `tanakh/deuteronomy/index.html`
- `assets/css/reader-workbench.css`
- `assets/js/reader-workbench.js`
- `data/public-hud/deuteronomy/**`

The build log reported:

- `.site`: `2.3M`
- uploaded Pages zip: `256564 bytes`
- artifact ID: `7359409690`

The workflow now refuses deployment if any of these old HUD markers are found inside `.site`:

- `Clicked Hebrew form`
- `Best actual hit`
- `data-hud-renderings`
- `data-hud-breakdown`
- `Potential options`
- `No lexical entry yet.`
- `lexical-fields`

## Live HTTP evidence

Live checks after deployment:

| URL | Status | Bytes | Evidence |
| --- | ---: | ---: | --- |
| `/` | 200 | 2390 | one non-favicon link: `tanakh/deuteronomy/`; no old HUD markers |
| `/tanakh/deuteronomy/` | 200 | 1313952 | Route HUD page live; no old HUD markers |
| `/assets/css/reader-workbench.css` | 200 | 3526 | contains fullscreen HUD CSS, including `height: 100dvh` |
| `/assets/js/reader-workbench.js` | 200 | 62336 | fullscreen runtime live |
| `/tanakh/genesis/` | 404 | 1409 | custom `Not Published` page; no old HUD markers |
| `/ari/pri-etz-chaim/` | 404 | 1409 | custom `Not Published` page; no old HUD markers |

The root page no longer exposes the previous generated library index of old-HUD links. Old generated paths are not public in this artifact.

## Live browser click evidence

Browser probe clicked `[data-lexical-index="tok-21613e763fe6"]` on the live Deuteronomy page.

Desktop viewport:

- Viewport: `1366 x 900`
- HUD rect: `x=0`, `y=0`, `width=1366`, `height=900`
- HUD title: `Route HUD: אֵ֣לֶּה`
- `aria-modal`: `true`
- `html.route-hud-open`: `true`
- `.route-card` count: `53`
- `.route-answer-card` count: `1`
- Sources and licenses present: `true`
- Console/page errors: `0`

Mobile viewport:

- Viewport: `390 x 844`
- HUD rect: `x=0`, `y=0`, `width=390`, `height=844`
- HUD title: `Route HUD: אֵ֣לֶּה`
- `aria-modal`: `true`
- `html.route-hud-open`: `true`
- `.route-card` count: `53`
- `.route-answer-card` count: `1`
- Sources and licenses present: `true`
- Console/page errors: `0`

Runtime dependencies observed in both browser probes returned `200`:

- `/assets/css/reader-workbench.css`
- `/assets/js/reader-workbench.js`
- `/data/public-hud/deuteronomy/occurrences.json`
- `/data/public-hud/deuteronomy/manifest.json`
- `/data/public-hud/deuteronomy/chunks/deuteronomy-001.json`
- `/data/public-hud/deuteronomy/route-lookup/manifest.json`
- `/data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json`

Old HUD markers remained absent in the browser probes:

- `Clicked Hebrew form`: absent
- `Best actual hit`: absent
- `data-hud-renderings`: `0`

## Boundary notes

- This swap removes old HUD exposure from the live lightweight public artifact.
- The full corpus and older generated pages remain local until they are safely swapped or cleared.
- The report does not claim the local corpus-wide render has been regenerated.
- If the team wants every local generated page upgraded, that should use a bounded render/validation lane and remain separate from this public deployment containment.
