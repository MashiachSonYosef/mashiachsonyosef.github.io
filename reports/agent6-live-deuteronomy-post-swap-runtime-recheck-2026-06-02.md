# Agent 6 Live Deuteronomy Post-Swap Runtime Recheck

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Gate: `hud_runtime_license_risk_gate` / `public_runtime_surface_gate`
Verdict: WARN-ACCEPTED for live Deuteronomy static HTTP post-swap evidence only
Risk classification: public/runtime license-provenance warning; previous Deuteronomy old-HUD marker blocker downgraded for this exact page only

## Scope

This docket rechecks the live Deuteronomy public runtime after the previously active Agent 6 blocker in:

- `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`
- `reports/agent6-live-public-runtime-p0-recheck-2026-06-02.md`

This docket is limited to static HTTP evidence for:

- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`
- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`
- direct live Deuteronomy Reader Workbench/HUD runtime and public-HUD data dependencies

This docket does not accept broad public/runtime rollout, live browser-click behavior, deployed/CDN/cache closure, source/provenance custody, publication readiness, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- Live HTTP/cache-busted probe run at `2026-06-02T12:41:37.358Z`
- `node scripts\validate_route_hud_page.mjs tanakh\deuteronomy\index.html`: passed for 1 local page
- `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`
- `reports/agent6-live-public-runtime-p0-recheck-2026-06-02.md`
- `reports/agent7-agent8-direct-bounded-worker-prompt-delivery-law-publication-2026-06-02.md`
- Current workspace checks for `tanakh/deuteronomy/index.html`
- Current workspace checks for `data/public-hud/deuteronomy/**`

Attempted broad static/dynamic old-HUD audit scripts timed out before producing output artifacts:

- `node scripts\audit_old_hud_exposure.mjs --report reports\agent6-public-runtime-static-old-hud-exposure-sweep-2026-06-02.md ...`
- `node scripts\audit_old_hud_dynamic_fallback.mjs --report reports\agent6-public-runtime-dynamic-fallback-old-hud-sweep-2026-06-02.md ...`

Those timed-out audits are not used as acceptance evidence in this docket.

## Live Deuteronomy Evidence

| URL | HTTP | Bytes | Last-Modified | Cache-Control | SHA-256 | Key result |
| --- | ---: | ---: | --- | --- | --- | --- |
| `https://mashiachsonyosef.github.io/tanakh/deuteronomy/?agent6=1780404097360` | 200 | 1,313,900 | `Tue, 02 Jun 2026 12:18:24 GMT` | `max-age=600` | `3880722a9fc1e70bff9e1ec060ebf37a18fcba9d982c489cc33f2cfdc00b6c5c` | current HUD markers present; old hard markers absent |
| `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html?agent6=1780404097360` | 200 | 1,313,900 | `Tue, 02 Jun 2026 12:18:24 GMT` | `max-age=600` | `3880722a9fc1e70bff9e1ec060ebf37a18fcba9d982c489cc33f2cfdc00b6c5c` | current HUD markers present; old hard markers absent |
| `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js?agent6=1780404097360` | 200 | 62,435 | `Tue, 02 Jun 2026 12:18:24 GMT` | `max-age=600` | `f247ca084a77c66d3fcd3603e172e1a4a75c912209aa184a3168e1d1060a8fa4` | runtime present |
| `https://mashiachsonyosef.github.io/assets/css/reader-workbench.css?agent6=1780404097360` | 200 | 2,745 | `Tue, 02 Jun 2026 12:18:24 GMT` | `max-age=600` | `5db7287ff1cc5d8f595f077ed9d9ce571c8b5163c2245a14fb33f119bcb3eb63` | stylesheet present |
| `https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/manifest.json?agent6=1780404097360` | 200 | 824 | `Tue, 02 Jun 2026 12:18:24 GMT` | `max-age=600` | `3a2b39e72e1f6b1ec389e6266fa92f51c6cf4cd3e8c802051510c0d9d4816295` | public-HUD manifest present |
| `https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/occurrences.json?agent6=1780404097360` | 200 | 665,725 | `Tue, 02 Jun 2026 12:18:24 GMT` | `max-age=600` | `aefea5117a1ecf4049d6276ea14dd7790df135dee494a9d280c634477d32b4d5` | occurrences present |
| `https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/route-lookup/manifest.json?agent6=1780404097360` | 200 | 496 | `Tue, 02 Jun 2026 12:18:24 GMT` | `max-age=600` | `6cfbae11553f52b028ce289abbd2f972b40f8c2664cf99d58033ee121a68db16` | route manifest present |
| `https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json?agent6=1780404097360` | 200 | 179,423 | `Tue, 02 Jun 2026 12:18:24 GMT` | `max-age=600` | `46fec0bed4662adcbae74e00b9b4d2eb57865cf7eaf6bce318130e3e6501562a` | route shard present with `source_rows`, `license`, `answer_eligible`, and `answer_role` text |

Live Deuteronomy marker results:

- `Route HUD`: present
- `Clicked Hebrew form`: absent
- `Best actual hit`: absent
- `Rank details`: absent
- `data-hud-renderings`: absent
- `reader-workbench.js`: present in page
- `hud_route_lookup_manifest_url`: present
- `data/public-hud/deuteronomy`: present
- `Sources and licenses`: present
- `source-footnotes`: present
- `answer_eligible`: present
- `answer_role`: present

## Findings

### WARN-ACCEPTED: Exact Live Deuteronomy Old-HUD Marker Exposure Is Cleared By Static HTTP Evidence

Owning lane: Agent 5 deployment coordination / Agent 7 priority control; Agent 4 if routed for live browser-click proof.

Evidence:

- Both live Deuteronomy HTML URLs return HTTP 200.
- Cache-busted live Deuteronomy HTML contains `Route HUD`, imports `reader-workbench.js`, includes `hud_route_lookup_manifest_url`, and points at `data/public-hud/deuteronomy`.
- Searched old hard markers `Clicked Hebrew form`, `Best actual hit`, `Rank details`, and `data-hud-renderings` are absent from the live Deuteronomy HTML.
- Direct live runtime/data dependencies return HTTP 200.
- The sentinel route shard is present and contains source/license and answer-role fields.
- Local `tanakh/deuteronomy/index.html` passes the route-HUD page validator.

Disposition:

- The prior Deuteronomy-specific live old-HUD marker blocker may be downgraded to warning for this exact page and exact static HTTP dependency set.
- Current HUD is the primary Deuteronomy public reader surface within existing Agent 6 docketed boundaries.

Acceptance condition for any further downgrade:

- Agent 4 or another bounded runtime packet must provide live browser-click proof for Deuteronomy, including click-to-HUD behavior, source/license/citation row visibility after interaction, route shard load behavior, hard refresh/cache-busting behavior, and negative proof that old-HUD fallback/query/storage activation does not reappear.

### WARNING: Current Workspace Does Not Contain The Live `data/public-hud/deuteronomy/**` Source Files

Owning lane: Agent 5 deployment/control hygiene; Agent 7 route/source-of-truth decision.

Evidence:

- Current workspace path `data/public-hud` is absent.
- `git ls-files data/public-hud` returns no tracked files.
- `git ls-files --others --exclude-standard -- data/public-hud` returns no untracked files.
- Current workspace `tanakh/deuteronomy/index.html` still references root `data/lexical/deuteronomy.manifest.json`, `data/lexical/occurrences/deuteronomy.json`, and `data/definitions/hud-route-lookup/manifest.json`, while live Deuteronomy references `data/public-hud/deuteronomy/**`.
- The live public-HUD dependency files are visible in `.codex-tmp/hud-deploy-live/data/public-hud/deuteronomy/**`, not in the main current workspace tree.

Disposition:

- Live static HTTP status can support Deuteronomy old-HUD risk downgrade.
- The current workspace cannot be treated as the reproducible public-runtime source of truth for the live deployed Deuteronomy page until Agent 5/7 supply a deployment artifact/source-of-truth packet or reconcile the public-HUD files into the controlled repo path.

Acceptance condition:

- Provide a bounded deployment-source packet identifying the exact commit, branch, workflow artifact, or worktree used for the live Deuteronomy swap, including `data/public-hud/deuteronomy/**`, page hash, runtime hashes, and what must not be accepted.

### WARNING: Broader Public Runtime Drift Is Not Cleared By Deuteronomy Swap

Owning lane: Agent 5 / Agent 7.

Evidence:

- Current live checks for `https://mashiachsonyosef.github.io/tanakh/genesis/`, `https://mashiachsonyosef.github.io/tanakh/genesis/index.html`, `https://mashiachsonyosef.github.io/hud-preview/`, and `https://mashiachsonyosef.github.io/hud-preview/index.html` return HTTP 404 in this session.
- This removes the previously observed old-HUD/sampler exposure for those exact URLs, but it is not public/runtime acceptance and may be a site-availability regression depending on intended scope.

Disposition:

- Do not bundle Genesis or `/hud-preview/` into Deuteronomy acceptance.
- Treat them as separate public-runtime drift/quarantine intake.

Acceptance condition:

- Agent 5/7 must decide whether those public URLs are intentionally quarantined/removed or should be restored with current validated HUD. Agent 6 needs a separate docket before accepting either path.

## Effective Boundary

This docket permits Agent 5 and Agent 7 to update control state from `BLOCKER_live_deuteronomy_old_hud_public_runtime` to a narrower status such as:

`warn_accepted_live_deuteronomy_static_http_current_hud_old_markers_absent_browser_click_and_source_of_truth_open`

This does not accept:

- broad public/runtime surface
- live browser-click behavior
- deployed/CDN/cache closure
- old-HUD fallback/rollback closure
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

- Stop describing live Deuteronomy as still serving old HUD unless a newer probe contradicts this docket.
- Update control/handoff state to the WARN status above.
- Produce a bounded deployment-source packet showing the exact live swap source for `data/public-hud/deuteronomy/**` and the Deuteronomy page/runtime hashes.
- Keep Genesis and `/hud-preview/` as separate public-runtime drift/quarantine intake, not Deuteronomy blockers.

Agent 7:

- Preserve Deuteronomy current HUD as the priority surface.
- Do not let this warning become broad public/runtime acceptance.
- Decide whether Genesis and `/hud-preview/` 404s are intentional quarantine or separate restore work.

Agent 4:

- If idle or routed at a natural checkpoint, perform bounded live browser-click proof for Deuteronomy only.
- Do not expand to Genesis, `/hud-preview/`, source custody, publication, or broad rollout in the same packet.

