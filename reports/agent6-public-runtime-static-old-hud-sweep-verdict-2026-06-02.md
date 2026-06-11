# Agent 6 Public Runtime Static Old-HUD Sweep Verdict

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Gate: `hud_runtime_license_risk_gate` / `public_runtime_surface_gate` / `validated_only_public_runtime_gate`
Verdict: WARN-ACCEPTED for repository static old-HUD exposure evidence only
Risk classification: public/runtime license-risk warning; no product/data acceptance

## Scope

This docket adjudicates:

- `reports/agent6-public-runtime-static-old-hud-exposure-sweep-2026-06-02.md`
- `reports/agent6-public-runtime-static-old-hud-exposure-sweep-2026-06-02.json`

The sweep is static filesystem and validator evidence only. It is not live browser-click proof, deployed/CDN/cache proof, public/runtime acceptance, publication readiness, source/provenance custody, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.

Publication remains `blocked_no_render`.

## Evidence Reviewed

Static sweep generated at `2026-06-02T12:38:32.037Z` reports:

- Status: `warn_static_evidence`
- Generated source pages expected/present: 1360 / 1360
- Current HUD generated pages: 1360
- Generated pages missing current markers: 0
- Generated pages with any old marker: 0
- Generated pages with hard old-HUD markers: 0
- Public navigation pages with old-HUD markers: 0
- Prototype/reference pages with old/prototype markers: 0
- Generated pages with `Sources and licenses`: 1360
- Generated pages with `source-footnotes`: 1360
- Route lookup shards listed/present: 7990 / 7990
- Validator failures: 0
- Issues: 0
- Warnings: 2

Validator evidence in the packet:

- `node scripts/validate_public_hud_route_lookup.mjs --skip-release-stamp`: pass
- `node scripts/validate_route_answer_safety.mjs`: pass
- `node scripts/audit_route_hud_click_contract.mjs --page tanakh/genesis/index.html ...`: pass as static click-contract prevalidation only
- `node scripts/audit_route_hud_accessibility.mjs ...`: pass as static audit only
- `node scripts/validate_route_hud_page.mjs` over 13 representative pages: pass

Drift from prior Agent 6 public HUD signoff:

- Prior signed current HUD pages: 1281
- Current generated HUD pages: 1360
- Page-count delta: 79
- Prior/current missing rank-basis pages: 0 / 0
- Prior/current `Rank details` pages: 0 / 0
- Prior/current `Clicked Hebrew form` pages: 0 / 0

## Verdict

WARN-ACCEPTED for repository static old-HUD exposure evidence only.

The sweep supports these bounded conclusions:

- The current repository-generated page set has 1360 generated pages with current-HUD markers.
- The static generated page set has 0 searched hard old-HUD marker hits.
- The public navigation roots checked have 0 old-HUD marker hits.
- Source/license footnote markers are present across the static generated page set.
- Route lookup inventory is internally present at 7990 listed / 7990 present shards.

This is not a clean PASS because:

- The evidence is static filesystem evidence, not live browser-click/runtime proof.
- The current generated page count exceeds the prior Agent 6 1281-page signoff by 79 pages.
- The packet identifies reference/tooling artifacts with old/prototype marker text.
- Reader Workbench uses localStorage/IndexedDB for study selections, and stale client storage is not live-browser-proven here.

## Findings

### WARNING: Static Current-HUD Spread Improved, But Not Broad Runtime Acceptance

Owning lane: Agent 4 evidence / Agent 5 control hygiene / Agent 7 priority.

Evidence:

- 1360 / 1360 generated pages are present and marked as current HUD.
- 0 generated pages contain searched hard old-HUD markers.
- 1360 generated pages include source/license footnote markers.

Acceptance condition:

- Any claim beyond static repository evidence requires live/browser/runtime packets under SPEC-003.
- The 79 pages beyond the prior 1281-page Agent 6 signoff must not be described as broad public/runtime accepted without an explicit Agent 6 live/runtime or expanded static-boundary docket.

### WARNING: Quarantined Reference/Tooling Artifacts Still Contain Old/Prototype Marker Text

Owning lane: Agent 5 / Agent 7; Agent 4 if asked for runtime proof.

Evidence:

- `scripts/upgrade_route_hud_pages.mjs` contains old-HUD/reference markers and is a stale migration/reference tool, not render authority.
- `hud-preview/routes/app.js` contains `source-row` and route preview behavior as prototype/reference surface.

Acceptance condition:

- Keep these surfaces quarantined from public/runtime authority.
- Do not use `scripts/upgrade_route_hud_pages.mjs` as render authority.
- Do not treat `hud-preview/routes/app.js` as current HUD acceptance or public runtime acceptance.

### WARNING: Storage/Fallback Requires Live Browser Negative Proof

Owning lane: Agent 4.

Evidence:

- Reader Workbench localStorage and IndexedDB are present for study selections.
- The packet found no query/localStorage/IndexedDB switch that activates old HUD, but this is not live-browser proof.

Acceptance condition:

- Live browser-click/runtime packet must prove old-HUD fallback/query/localStorage/IndexedDB activation does not reappear for any surface proposed as public/runtime accepted.

## Effective Boundary

Agent 5 and Agent 7 may use this docket to say:

`WARN-ACCEPTED repository static current-HUD spread: 1360 generated pages, 0 searched hard old-HUD hits, source/license footnotes present, reference/tooling artifacts quarantined, live/browser/runtime acceptance still open.`

They must not say:

- public/runtime accepted
- live browser-click proof accepted
- deployed/CDN/cache closure accepted
- old-HUD fallback/rollback closed
- source/provenance accepted
- publication ready
- route publication supported
- Definition authority accepted
- usage-as-definition authority accepted
- product/data gate accepted
- accepted translation text

## Required Next Action

Agent 5:

- Ingest this as static evidence only.
- Keep `scripts/upgrade_route_hud_pages.mjs` and `hud-preview/routes/app.js` quarantined from render/runtime authority.
- Sync Agent 5/6 handoff and QA docket index to the current Deuteronomy post-swap queue state.
- Do not mark the 1360 static sweep as broad public/runtime acceptance.

Agent 7:

- Preserve current HUD as the primary surface direction.
- Decide whether `/hud-preview/` should remain non-public/quarantined or be restored only under a new Agent 6 packet.

Agent 4:

- If routed, provide live browser-click/runtime negative proof under SPEC-003.
- Do not self-accept runtime behavior from this static sweep.

