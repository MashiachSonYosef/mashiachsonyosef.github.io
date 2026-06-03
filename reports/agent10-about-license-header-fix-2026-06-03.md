# Agent 10 About / License Header Fix - 2026-06-03

## Scope

Agent 10 release-owner fix for the public reader breadcrumb target `About / License`.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Issue

Reader pages linked to `/about/`, but the lightweight Pages artifact did not copy `about/index.html` into `.site/about/`.

Observed before fix:

- Raw repository file existed: `about/index.html`
- Live URL `https://mashiachsonyosef.github.io/about/`: `404`
- Live title before fix: `Not Published`

## Changes

Commit: `6d574819b`

- Updated `.github/workflows/deploy-lightweight-pages.yml`
  - Added `/about/index.html` to sparse checkout.
  - Created `.site/about`.
  - Copied `about/index.html` into `.site/about/`.
- Replaced `about/index.html` with a lightweight Route HUD boundary page.
  - No scripts.
  - No HUD runtime nodes.
  - No old-HUD marker text.
  - No source/provenance, Definition, translation, or QA acceptance claims.

## Static Proof

Local checks before deployment:

- `about/index.html` existed.
- Workflow contained `/about/index.html`.
- Workflow contained `cp -a about/index.html .site/about/`.
- Marker/runtime scan over `about/index.html`: no hits for old-HUD marker strings, HUD runtime selectors, script tags, or accepted-translation wording.
- Breadcrumb resolution from sampled reader pages to `about/index.html`: pass for Orot, Deuteronomy, Genesis, and Ruth.

Local file-browser inspection was unavailable because the in-app browser blocked direct `file://` navigation. Live HTTPS browser proof was supplied after deployment.

## Live Proof

Live URL checked:

- `https://mashiachsonyosef.github.io/about/index.html`

Cache-busted fetch after workflow deployment:

- HTTP status: `200`
- Title: `About / License - Mashiach Son Yosef Library`
- Bytes: `3653`
- Last modified: `Wed, 03 Jun 2026 04:34:47 GMT`
- Not Published text: absent

Live browser HTTPS proof:

- URL: `https://mashiachsonyosef.github.io/about/`
- H1: `About / License`
- Page state: `about_page_present`
- Script count: `0`
- Route HUD node count: `0`
- Old-marker text hits: `0`
- Horizontal overflow: `false`

Regression spot-check after deployment:

- `https://mashiachsonyosef.github.io/`: `200`, no old-marker hits.
- `https://mashiachsonyosef.github.io/orot/`: `200`, no old-marker hits.
- `https://mashiachsonyosef.github.io/data/public-hud/orot/route-lookup/manifest.json`: `200`.
- Orot selected token count: `8729`
- Orot public route key count: `9494`
- Orot card count: `23506`

## Remaining Limits

- This is a bounded release-owner header/navigation fix only.
- It is not QA acceptance or validated public/runtime acceptance.
- It does not accept source/provenance custody or semantic correctness.
- Reports remain excluded from the lightweight Pages artifact by workflow config; this report is repository evidence, not a public page.

## Agent 8 Callback

Status: `about_license_header_fix_live_passed`

Artifact path: `reports/agent10-about-license-header-fix-2026-06-03.md`

Selected issue: reader breadcrumb `/about/` returned Not Published because the Pages artifact omitted `about/index.html`.

Agent 1 needed: no.

Agent 2 needed: no.

Agent 4 needed: no.

Agent 6 needed: only for acceptance claims.

Agent 7/13 decision needed: no hard blocker.

Next recommended executable route: continue tangible public-surface hardening by checking the remaining header/footer links on current public reader pages.
