# Agent 11 Public/Header Risk Scan Sidecar

Generated: 2026-06-03

Lane: Agent 11 reception/public-header risk scan only.

Boundary: static current-repo inspection plus existing report context. No fixes, no public deploy writes, no crawl, no browser proof, no QA/publication/runtime/source/provenance/Definition authority acceptance, and no translation-output or accepted-text claim.

## Surfaces Inspected

- `index.html`
- `orot/index.html`
- `tanakh/deuteronomy/index.html`
- `tanakh/genesis/index.html`
- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- Existing bounded reports: `reports/agent10-agent1-orot-fill-old-hud-exposure-2026-06-03.md`, `reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.md`, `reports/oracle9-owner-pulse-2026-06-03-0410Z.md`, `reports/oracle9-agent11-public-surface-reception-followup-2026-06-02.md`, `reports/oracle9-agent11-reception-surveillance-2026-06-02.md`, `reports/reader-workbench-boundary-report.md`

## Prioritized Punch List

### BLOCK: Header/HUD Labels Can Overstate Public Readiness

Risk: current local route pages present public-facing HUD language in navigation/header-adjacent regions while governance reports still separate visible runtime evidence from acceptance. Genesis and Deuteronomy both show `Route HUD active` in the table of contents and expose hidden `Reader Workbench` panels with `not_a_translation`; the HUD panel text includes `Definition` and `Sources and licenses`. Orot uses repeated `Route HUD active` badges across large TOC/section headings. Root copy says the workbench has route HUD support and no public English translation layer.

Evidence:
- `index.html:117-119` says route HUD support is present and no public English translation layer is displayed.
- `tanakh/deuteronomy/index.html:179`, `tanakh/deuteronomy/index.html:182`, `tanakh/deuteronomy/index.html:16688`, `tanakh/deuteronomy/index.html:16713`, `tanakh/deuteronomy/index.html:16721`.
- `tanakh/genesis/index.html:179`, `tanakh/genesis/index.html:182`, `tanakh/genesis/index.html:26609`, `tanakh/genesis/index.html:26634`, `tanakh/genesis/index.html:26642`.
- `orot/index.html:178`, `orot/index.html:181`, `orot/index.html:2794-2795`, `orot/index.html:10407`.
- `reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.md:27-31` records public-HUD source-row evidence as a queue candidate; `reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.md:46-55` says it can drift and does not clear source/provenance custody or acceptance.
- `reports/oracle9-owner-pulse-2026-06-03-0410Z.md:16` keeps publication globally `blocked_no_render`.

Agent 11 handling: treat the visible labels as reception risk until Agent 6 wording says exactly how public header/nav may describe HUD, Reader Workbench, source/license rows, and Definition labels without implying acceptance.

### WARN: Old-HUD/Preview Exposure Looks Unlinked Locally, But Direct-Path And Stale-Client Risk Remain

Risk: the four inspected local public surfaces did not show hard old-HUD strings or `hud-preview` links in the checked header/nav patterns, but existing Agent 10 evidence still keeps old HUD quarantined and notes direct-path preview and stale client storage limits. This should stay on Agent 10's radar as a header/navigation concern because public users can confuse prototype/runtime surfaces when direct paths or cached state exist.

Evidence:
- `reports/agent10-agent1-orot-fill-old-hud-exposure-2026-06-03.md:9-10` keeps old HUD quarantined and publication blocked.
- `reports/agent10-agent1-orot-fill-old-hud-exposure-2026-06-03.md:19-20` found zero hard old-HUD markers in generated/public navigation pages.
- `reports/agent10-agent1-orot-fill-old-hud-exposure-2026-06-03.md:122-124` says `hud-preview` is direct-path routable if the repo is served and Reader Workbench storage was not live-tested.
- `reports/agent10-agent1-orot-fill-old-hud-exposure-2026-06-03.md:138` repeats that stale client storage is not live-browser-proven.

Agent 11 handling: do not claim old-HUD public resolution from this scan; the bounded statement is only that the inspected local header/nav patterns did not reveal a direct link or hard marker.

### WARN: Static Mobile Header Layout Has A Likely Narrow-Viewport Compression Risk

Risk: the shared `.hero` header uses a two-column grid with a `minmax(220px, 0.34fr)` notes column across root, Orot, Deuteronomy, and Genesis, while the only narrow breakpoint shown in the same embedded CSS collapses `.reader-shell`, `.unit-grid`, and `.paired-shell`, not `.hero`. The header source-note column can therefore compete with title/summary space on small screens. Browser proof was not required or run, so this is a static layout risk, not a confirmed mobile defect.

Evidence:
- `index.html:20`, `orot/index.html:20`, `tanakh/deuteronomy/index.html:20`, `tanakh/genesis/index.html:20` define the shared two-column `.hero`.
- `index.html:108`, `orot/index.html:151`, `tanakh/deuteronomy/index.html:151`, `tanakh/genesis/index.html:151` collapse reader shells but not `.hero`.
- `orot/index.html:167`, `tanakh/deuteronomy/index.html:168`, `tanakh/genesis/index.html:168` place source notes in the header region.

Agent 11 handling: flag for Agent 10/static CSS review; do not alter markup or styles in this sidecar.

### NOTE: Root Navigation Includes Genesis And Deuteronomy; Orot Exists Locally And Is Public-Slice Context In Reports

Risk: root currently links Genesis and Deuteronomy in the library cards, while `orot/index.html` exists locally and existing owner-pulse context says the public root-card slice includes Orot. This scan did not crawl root card coverage or verify live state, so Agent 10 should avoid treating local root-card presence/absence alone as full public-nav truth.

Evidence:
- `index.html:147-156` links Deuteronomy and Genesis.
- `orot/index.html:160-167` shows Orot local header metadata.
- `reports/oracle9-owner-pulse-2026-06-03-0410Z.md:8-12` reports an 11-card public Route HUD slice including Orot, with current markers and Reader Workbench assets.
- `reports/oracle9-owner-pulse-2026-06-03-0410Z.md:91` warns against letting 10-surface language obscure Orot's separate public/reception burden.

Agent 11 handling: keep Orot as an explicit public/reception burden in wording, but do not turn this sidecar into live-route proof.

## Non-Acceptance

This sidecar does not accept:

- QA acceptance
- publication readiness
- public/runtime acceptance
- source/provenance custody
- source/license publication support
- Definition authority
- Reader Workbench broad rollout
- old-HUD resolution
- accepted translation text
- any deploy or public-file mutation
