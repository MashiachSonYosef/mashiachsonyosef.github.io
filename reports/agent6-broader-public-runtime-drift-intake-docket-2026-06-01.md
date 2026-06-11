# Agent 6 Broader Public Runtime Drift Intake Docket

Date: 2026-06-01
Authority: Agent 6 independent QA/compliance
Gate: `public_runtime_surface_gate` / `hud_runtime_license_risk_gate`
Related blocker: `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`
Related decision receipt: `reports/agent6-live-deployment-runtime-closure-decision-receipt-2026-06-01.md`
Related specification: `reports/spec-001-public-runtime-surface-control.md`
Verdict: BLOCKER for separate broader public-runtime drift intake; do not bundle into Deuteronomy P0 swap
Risk classification: public/runtime license-provenance blocker

## Scope Reviewed

- live URL `https://mashiachsonyosef.github.io/hud-preview/`
- live URL `https://mashiachsonyosef.github.io/hud-preview/routes/`
- live URL `https://mashiachsonyosef.github.io/tanakh/genesis/`
- live URL `https://mashiachsonyosef.github.io/tanakh/genesis/index.html`
- live URL `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`
- local file `hud-preview/index.html`
- local file `tanakh/genesis/index.html`
- `reports/spec-001-public-runtime-surface-control.md`
- `reports/agent6-old-hud-static-quarantine-docket-2026-06-01.md`
- `reports/agent6-old-hud-dynamic-fallback-killswitch-verdict-2026-06-01.md`
- `reports/agent7-live-deployment-runtime-closure-decision-2026-06-01.md`
- `data/control/agent6_validation_queue.json`

## Validation Runs

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings.
- `node scripts\validate_agent7_governance_control.mjs`: passed with 1 known warning.
- `node scripts\validate_agent5_control_readiness.mjs`: passed with 3 known warnings.

## Live Evidence

Fresh live probe:

- `https://mashiachsonyosef.github.io/tanakh/genesis/`
  - HTTP 200
  - length 1741754
  - ETag `"6a1b1287-1d23c5"`
  - Cache-Control `max-age=600`
  - Last-Modified `Sat, 30 May 2026 16:38:31 GMT`
  - `Route HUD`: absent
  - `Clicked Hebrew form`: present
  - `reader-workbench.js`: absent
  - `lexical-hud`: present
  - `sourceSummary`: present
  - `allowLowConfidenceFallback`: present
  - `No lexical entry yet.`: present
- `https://mashiachsonyosef.github.io/tanakh/genesis/index.html`
  - HTTP 200
  - length 1741754
  - ETag `"6a1b1289-1d23c5"`
  - Cache-Control `max-age=600`
  - Last-Modified `Sat, 30 May 2026 16:38:33 GMT`
  - `Route HUD`: absent
  - `Clicked Hebrew form`: present
  - `reader-workbench.js`: absent
  - `lexical-hud`: present
  - `sourceSummary`: present
  - `allowLowConfidenceFallback`: present
  - `No lexical entry yet.`: present
- `https://mashiachsonyosef.github.io/hud-preview/`
  - HTTP 200
  - length 11594
  - title `HUD Sampler | Hebrew Source Workbench`
  - ETag `"6a1b1288-2db6"`
  - Cache-Control `max-age=600`
  - Last-Modified `Sat, 30 May 2026 16:38:32 GMT`
  - searched old-HUD markers were absent in the fetched HTML
- `https://mashiachsonyosef.github.io/hud-preview/routes/`
  - HTTP 404

Local comparison:

- `tanakh/genesis/index.html` is current locally: it includes `Route HUD`, imports `../../assets/js/reader-workbench.js`, and contains Reader Workbench markup.
- `hud-preview/index.html` is a public preview/prototype page with source/license fixture rows, including:
  - `OpenScriptures HebrewLexicon`, license `CC BY 4.0`
  - `Hebrew Wiktionary via Kaikki`, license `CC BY-SA 4.0 / GFDL`
  - imported Hebrew/citable source fixture rows with retained source-version license language
  - UI text stating preview rows are fixtures, not exported lexical data

## Findings

### BLOCKER: Live Genesis Is Serving Old HUD While Local Genesis Is Current

Owning lane: Agent 5 / Agent 7 deployment coordination; Agent 4 may provide post-swap proof if routed.

Evidence:
- Live Genesis has `Clicked Hebrew form`, `lexical-hud`, `sourceSummary`, `allowLowConfidenceFallback`, and `No lexical entry yet.` markers.
- Live Genesis lacks `Route HUD` and lacks `reader-workbench.js`.
- Local Genesis contains current Route HUD and Reader Workbench runtime markers.

Interpretation:
- This is public deployment/runtime drift, not a local render deficit.
- The old-HUD live exposure is source/provenance-sensitive because it can display source-derived lexical evidence under legacy behavior.

Acceptance condition:
- Either pull/quarantine live Genesis from public old-HUD exposure or deploy the current validated HUD page plus required direct dependencies, then provide Agent 6 with a post-swap live evidence packet.

### BLOCKER: Public HUD Preview Is An Undocketed Public Source-Evidence Surface

Owning lane: Agent 5 / Agent 7 deployment coordination

Evidence:
- `/hud-preview/` is public HTTP 200.
- Local preview content includes source/license fixture rows and third-party-license references including CC BY and CC BY-SA/GFDL.
- `/hud-preview/routes/` is public-routable but currently 404, showing the preview surface is stale/incomplete in deployment.
- No Agent 6 public-runtime acceptance docket was found for live `/hud-preview/` public use.

Interpretation:
- The fetched `/hud-preview/` HTML did not show the searched old-HUD markers, so it is not the same marker failure as live Genesis/Deuteronomy.
- It is still a public source-evidence/prototype surface without a live Agent 6 acceptance boundary and should be quarantined or removed from public reachability until a SPEC-001 packet validates it.

Acceptance condition:
- Pull or quarantine `/hud-preview/` from public runtime reachability, or submit a SPEC-001 packet proving route/index reachability, source/license/citation labeling, fixture-only boundaries, no stale old-HUD fallback, and no Definition/publication authority.

### CONTROL WARNING: Do Not Let Broader Drift Delay The Deuteronomy P0 Swap

Owning lane: Agent 5 / Agent 7

Evidence:
- Deuteronomy already has a live blocker and a bounded deploy/swap evidence requirement.
- Genesis and `/hud-preview/` are separate public drift surfaces.

Acceptance condition:
- Keep Deuteronomy as the immediate P0 execution path.
- Create a separate Agent 6 queue item or control intake for broader public deployment/runtime drift.
- Do not bundle `/hud-preview/` or Genesis remediation into the Deuteronomy deploy/swap packet unless the same deployment operation can include them without expanding the evidence boundary or delaying Deuteronomy.

## Required Intake Shape

Agent 5 should create a separate intake item for `public_runtime_deployment_drift_gate` covering:

- `https://mashiachsonyosef.github.io/tanakh/genesis/`
- `https://mashiachsonyosef.github.io/tanakh/genesis/index.html`
- `https://mashiachsonyosef.github.io/hud-preview/`
- `https://mashiachsonyosef.github.io/hud-preview/routes/`

Minimum fields:

- exact live URLs
- HTTP status, ETag, Last-Modified, Cache-Control
- current marker proof and old-marker proof
- local-vs-live comparison
- route/index reachability or public navigation evidence
- whether the surface is pulled, quarantined, or swapped
- post-remediation live proof
- what must not be accepted

## Effective Boundary

This docket creates a blocker/intake requirement only.

It does not clear:

- live Genesis public runtime
- `/hud-preview/` public runtime
- live Deuteronomy public runtime
- old-HUD public use
- deployed/CDN/cache closure
- broad public/runtime acceptance
- source/provenance custody
- publication readiness
- publication-path support
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- accepted translation text

Publication remains `blocked_no_render`.

## Required Next Action

Agent 5:
- Keep the Deuteronomy deploy/swap packet first.
- Create a separate broader public deployment/runtime drift intake for live Genesis and `/hud-preview/`.
- Mark live Genesis old-HUD exposure and `/hud-preview/` public prototype exposure as blocked/quarantine candidates until Agent 6 dockets remediation evidence.

Agent 7:
- Do not allow this broader drift intake to dilute or delay the Deuteronomy P0.
- Direct Agent 5 to preserve separate boundaries: Deuteronomy P0 execution packet first, broader public drift quarantine intake second.

Agent 4:
- If routed later, provide bounded post-remediation live/runtime proof for the exact broader drift URLs only.
