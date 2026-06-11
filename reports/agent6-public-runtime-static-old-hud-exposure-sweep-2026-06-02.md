# Agent 4 SPEC-003 Old-HUD Exposure Report

Generated: 2026-06-02T12:38:32.037Z

## Verdict Request

- Requested Agent 6 action: pass / warn / block this SPEC-003 old-HUD exposure packet.
- Agent 4 does not self-accept this packet.
- Old HUD remains `quarantined_legacy_license_risk`.
- Publication remains `blocked_no_render`.
- This is static filesystem and validator evidence only, not live browser-click proof.

## Summary

- Status: warn_static_evidence
- Generated source pages expected/present: 1360 / 1360
- Current HUD generated pages: 1360
- Generated pages missing current markers: 0
- Generated pages with hard old-HUD markers: 0
- Public navigation pages with old-HUD markers: 0
- Prototype/reference pages with old/prototype markers: 0
- Generated pages with source/license footnotes: 1360
- Route lookup shards listed/present: 7990 / 7990
- Validator failures: 0
- Issues: 0
- Warnings: 2

## Required Evidence

- Current HUD docket: `reports/agent6-public-hud-signoff-2026-06-01.md`
- SPEC-003: `reports/spec-003-hud-runtime-validation.md`
- Agent 6 SPEC-003 verdict: `reports/agent6-spec-003-hud-runtime-validation-verdict-2026-06-01.md`
- Public navigation paths checked: `index.html`, `about/index.html`, `library/index.html`
- Runtime files inspected: `assets/js/reader-workbench.js`, `assets/css/reader-workbench.css`, `scripts/render_site.ps1`, `scripts/validate_route_hud_page.mjs`, `scripts/audit_route_hud_rollout_watch.mjs`, `scripts/upgrade_route_hud_pages.mjs`, `hud-preview/index.html`, `hud-preview/routes/index.html`, `hud-preview/routes/app.js`
- Route lookup manifest: `data/definitions/hud-route-lookup/manifest.json`
- Representative route-HUD pages: `tanakh/genesis/index.html`, `tanakh/exodus/index.html`, `halakhah/urim-vetumim-urim/index.html`, `halakhah/meirat-einayim-on-shulchan-arukh-choshen-mishpat/index.html`, `other/beer-hagolah/index.html`, `jewish-thought/kuzari/index.html`, `midrash/yefeh-toar-on-bereshit-rabbah/index.html`, `targum/targum-jonathan-on-genesis/index.html`, `mishnah/mishnah-berakhot/index.html`, `chasidut/baal-shem-tov/index.html`, `gra/aderet-eliyahu/index.html`, `liturgy/siddur-sefard/index.html`, `tosefta/brief-commentary-on-yoma/index.html`

## Marker Counts

### Generated current-HUD markers

| marker | page count |
|---|---:|
| `data-lexical-hud` | 1360 |
| `data-route-hud-panel` | 1360 |
| `selectRouteAnswer` | 1360 |
| `lookupCandidateTreatments` | 1360 |
| `Sources and licenses` | 1360 |
| `Usage evidence` | 1360 |
| `article.dataset.rankBasis` | 1360 |
| `answer_eligible` | 1360 |
| `answer_role` | 1360 |
| `source-footnotes` | 1360 |
| `hud_route_lookup_manifest_url` | 1360 |

### Generated old-HUD markers

- none

### Public-navigation old-HUD markers

- none

### All public-HTML old/prototype markers

- none

## Runtime / Fallback / Storage

- Generated pages importing `assets/js/reader-workbench.js`: 1287
- Generated pages importing `scripts/upgrade_route_hud_pages.mjs`: 0
- Reader Workbench localStorage: true
- Reader Workbench IndexedDB: true
- Query-string activation markers in current runtime: false
- Route-preview fallback runtime in current asset: true
- Interpretation: storage is for study-sheet selections; this packet found no query/localStorage/IndexedDB switch that activates old HUD, but stale client bundles/storage are not live-browser-proven here.

## Validator Results

- public route lookup: pass (exit 0)
  Command: `node scripts/validate_public_hud_route_lookup.mjs --skip-release-stamp`
  Output: Public HUD route lookup validation passed.
- route answer safety: pass (exit 0)
  Command: `node scripts/validate_route_answer_safety.mjs`
  Output: Route answer safety validation passed.
- Genesis click contract: pass (exit 0)
  Command: `node scripts/audit_route_hud_click_contract.mjs --page tanakh/genesis/index.html --report reports/agent4-old-hud-exposure-click-contract-genesis-2026-06-01.md --json reports/agent4-old-hud-exposure-click-contract-genesis-2026-06-01.json --sample-limit 36`
  Output: Route HUD click contract prevalidation passed: reports/agent4-old-hud-exposure-click-contract-genesis-2026-06-01.md
- HUD accessibility static audit: pass (exit 0)
  Command: `node scripts/audit_route_hud_accessibility.mjs --pages tanakh/genesis/index.html,halakhah/urim-vetumim-urim/index.html,other/beer-hagolah/index.html,targum/targum-jonathan-on-genesis/index.html --report reports/agent4-old-hud-exposure-accessibility-2026-06-01.md --json reports/agent4-old-hud-exposure-accessibility-2026-06-01.json`
  Output: }
- representative route HUD pages: pass (exit 0)
  Command: `node scripts/validate_route_hud_page.mjs --page tanakh/genesis/index.html --page tanakh/exodus/index.html --page halakhah/urim-vetumim-urim/index.html --page halakhah/meirat-einayim-on-shulchan-arukh-choshen-mishpat/index.html --page other/beer-hagolah/index.html --page jewish-thought/kuzari/index.html --page midrash/yefeh-toar-on-bereshit-rabbah/index.html --page targum/targum-jonathan-on-genesis/index.html --page mishnah/mishnah-berakhot/index.html --page chasidut/baal-shem-tov/index.html --page gra/aderet-eliyahu/index.html --page liturgy/siddur-sefard/index.html --page tosefta/brief-commentary-on-yoma/index.html`
  Output: Route HUD page validation passed for 13 page(s).

## Source / License / Citation Visibility

- Generated pages with `Sources and licenses`: 1360
- Generated pages with `source-footnotes`: 1360
- Generated pages with both: 1360
- Route lookup validator checks source rows in public route cards; see validator result above.

## Split Token / Maqaf / Hyphen

- Scoped evidence: Genesis static click-contract prevalidation samples maqaf tokens and lookup candidates; this is not browser-click proof.
- Click-contract report: `reports/agent4-old-hud-exposure-click-contract-genesis-2026-06-01.md`

## Usage-As-Definition Negative Test

- Boundary: non-answer cards must not carry answer_score; usage/evidence cards cannot become answer authority by score alone
- Control passed: synthetic usage evidence answer leak is detected

## Positive And Negative Controls

- pass / old_hud_marker: synthetic old-HUD markers are detected
- pass / current_contract: synthetic current HUD without rank basis is detected
- pass / source_license_visibility: synthetic HUD without Sources and licenses marker is detected
- pass / usage_as_definition: synthetic usage evidence answer leak is detected

## Drift From Agent 6 Public HUD Signoff

- Prior signed current HUD pages: 1281
- Current generated HUD pages: 1360
- Page-count delta: 79
- Prior/current missing rank-basis pages: 0 / 0
- Prior/current Rank details pages: 0 / 0
- Prior/current Clicked Hebrew form pages: 0 / 0

## Deviations

- Static filesystem and validator evidence only; no live browser-click proof.
- hud-preview prototype/reference HTML remains in the workspace and is direct-path routable if the entire repository is served; it is not linked by public navigation and is not current HUD acceptance.
- scripts/upgrade_route_hud_pages.mjs remains a stale migration/reference tool and is explicitly not render authority.
- Reader Workbench localStorage/IndexedDB state is inspected statically only; stale client storage activation is not live-tested here.

## Quarantined Surfaces

- `scripts/upgrade_route_hud_pages.mjs`: stale migration/reference script; forbidden as render authority; markers=Clicked Hebrew form, Best actual hit, Full source and license rows, No lexical entry yet., Potential options, data-hud-renderings, lexical-fields
- `hud-preview/routes/app.js`: HUD prototype/reference artifact; not current public HUD acceptance; markers=source-row

## Issues

- none

## Warnings

- 2 reference/tooling artifact(s) mention old-HUD or prototype markers but are not public runtime imports
- Reader Workbench uses localStorage/IndexedDB for study selections; no old-HUD activation key was found, but stale client storage is not live-browser-proven here

## What Must Not Be Accepted

- Old HUD public use, fallback, route exposure, runtime activation, or source-evidence capability.
- Publication readiness or publication-path support.
- Source/provenance acceptance.
- Live browser-click proof from this static packet.
- Reader Workbench broad rollout.
- Definition Workbench authority.
- Route publication support.
- Usage-as-definition authority.
- Accepted translation text.
- Worker evidence or this report as Agent 6 acceptance.

