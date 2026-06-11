# Agent 6 Old-HUD Static Quarantine Docket

Date: 2026-06-01
Authority: Agent 6 independent QA/compliance authority
Gate: `hud_runtime_license_risk_gate`
Queue item: `agent6-old-hud-quarantine-killswitch-coverage`
Related spec: `reports/spec-003-hud-runtime-validation.md`

## Verdict

WARN-ACCEPTED for static filesystem evidence only.

The current static evidence supports a bounded finding that generated public HUD pages in the audited source-work set are current-HUD pages and do not contain the searched stale old-HUD markers.

The old-HUD quarantine / kill-switch gate is not fully accepted. Live browser-click behavior, public navigation click proof, query/localStorage/IndexedDB activation, stale bundle behavior, and full fallback/rollback activation proof remain unproven.

Publication remains `blocked_no_render`. Old HUD remains `quarantined_legacy_license_risk`.

## Evidence Reviewed

- `reports/agent5-agent6-old-hud-quarantine-killswitch-packet-2026-06-01.md`
- `reports/agent6-public-hud-signoff-2026-06-01.md`
- `reports/spec-001-public-runtime-surface-control.md`
- `reports/spec-003-hud-runtime-validation.md`
- `reports/route-hud-rollout-watch.md`
- `reports/route-hud-rollout-watch.json`
- `reports/agent7-route-hud-rollout-watch-static-ingest-2026-06-01.md`
- `scripts/audit_route_hud_rollout_watch.mjs`
- `reports/agent6-validation-queue-health.md`

Machine checks run:

- `node scripts\validate_agent6_validation_queue.mjs`
- `node scripts\audit_route_hud_rollout_watch.mjs`
- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp`
- `node scripts\validate_route_answer_safety.mjs`
- `rg -n --glob '*.html' --glob '!reports/**' --glob '!node_modules/**' --glob '!data/**' "Best actual hit|Full source and license rows|Clicked Hebrew form|Rank details|allowLowConfidenceFallback|data-hud-breakdown|sourceSummary ="`
- `rg -n --glob '*.js' --glob '*.css' --glob '!reports/**' --glob '!node_modules/**' --glob '!data/**' "Best actual hit|Full source and license rows|Clicked Hebrew form|Rank details|allowLowConfidenceFallback|data-hud-breakdown|sourceSummary =" assets scripts`

## Recounted Static Evidence

Queue health:

- Status: passed.
- Issues: 0.
- Warnings: 0.
- Publication global status: `blocked_no_render`.

Route HUD rollout watch:

- Status: passed.
- Source records: 1360.
- Source records with `work_slug`: 1360.
- Generated pages: 1360.
- Current HUD pages: 1360.
- Pages with Usage evidence: 1360.
- Missing pages: 0.
- Non-HUD generated pages: 0.
- Source newer than page: 0.
- Rows missing current markers: 0.
- Rows with stale markers: 0.
- Empty occurrence URL rows: 0.
- Issues: 0.
- Warnings: 0.

Static stale-marker search:

- Public HTML search returned no matches for the old-HUD/stale marker set.
- `assets` / `scripts` JavaScript and CSS search returned no matches for the old-HUD/stale marker set.

Runtime-source validators:

- Public HUD route lookup validation passed.
- Route answer safety validation passed.

## Accepted Static Boundary

Accepted with warning:

- The audited generated-page set currently has 1360 generated pages with current HUD markers.
- The audited generated-page set has 0 non-HUD generated pages.
- The audited generated-page set has 0 rows missing required current markers.
- The audited generated-page set has 0 rows with searched stale old-HUD markers.
- No searched old-HUD/stale markers were found in scoped public HTML, JavaScript, or CSS search paths.
- Static route lookup and answer-safety validators pass.

This supports static control confidence that old HUD is not exposed as a generated-page primary HUD in the audited filesystem set.

## Warning Limits

This docket does not prove:

- live browser-click behavior,
- browser navigation reachability,
- deployment/CDN/stale bundle state,
- query-string activation paths,
- localStorage activation paths,
- IndexedDB activation paths,
- every rollback/fallback activation path,
- full source/license/citation row semantics for every displayed card,
- source/provenance custody,
- public/runtime expansion,
- publication readiness.

Static evidence can support warning-level quarantine conclusions only. It cannot be described as live runtime acceptance or live browser-click proof.

## Remaining Blockers

The old-HUD quarantine / kill-switch gate remains open until a SPEC-003-shaped Agent 4 packet proves, or explicitly quarantines, the dynamic and fallback paths:

- public navigation clicks,
- route/index/generated inventories,
- runtime imports,
- fallback/rollback activation,
- query string behavior,
- localStorage behavior,
- IndexedDB behavior,
- stale bundle/deployment risk,
- source/license/citation visibility for any exposed source-derived evidence,
- positive and negative controls.

Any discovered old-HUD public, routable, indexed, primary, fallback, or source-evidence-capable exposure is a blocker until removed or explicitly quarantined and re-docketed.

## What Must Not Be Accepted

- New HUD rollout beyond existing Agent 6 dockets.
- Public/runtime acceptance.
- Old-HUD public use or fallback.
- Source/provenance acceptance.
- Publication readiness.
- Live browser-click proof.
- Reader Workbench broad rollout.
- Definition authority.
- Route publication support.
- Usage-as-definition authority.
- Future publication path support.
- Product/data gate acceptance.
- Accepted translation text.

## Affected Agents

- Agent 4: must produce the dynamic/fallback old-HUD exposure report under SPEC-003; no self-acceptance.
- Agent 5: may record this static docket as warning-level static evidence only and must keep the old-HUD kill-switch gate open.
- Agent 7: may use this as strategy/control evidence only; no law publication may widen it into public/runtime acceptance.

## Affected Gates

- `hud_runtime_license_risk_gate`: WARN-ACCEPTED for static evidence only; full old-HUD kill-switch remains unaccepted.
- `hud_truth_gate`: current HUD remains accepted only within existing Agent 6 docketed boundaries.
- `public_runtime_surface_spec_gate`: unchanged; SPEC-001 controls public/runtime exposure.
- `hud_runtime_validation_spec_gate`: unchanged; SPEC-003 controls HUD runtime validation packets.
- `compliance_publication_gate`: unchanged; publication remains `blocked_no_render`.

## Exact Boundary To Relay

```text
Agent 6 WARN-ACCEPTED the old-HUD quarantine static evidence by reports/agent6-old-hud-static-quarantine-docket-2026-06-01.md. Static evidence shows 1360 generated pages, 1360 current HUD pages, 0 non-HUD pages, 0 missing current-marker rows, 0 stale-marker rows, 0 issues, 0 warnings, no searched old-HUD/stale markers in scoped public HTML/JS/CSS, route lookup passed, and answer safety passed. This is static filesystem evidence only. It does not accept live browser-click proof, dynamic navigation reachability, query/localStorage/IndexedDB activation, stale bundle behavior, fallback/rollback paths, source/provenance, public/runtime expansion, publication readiness, old-HUD public use, or accepted translation text. Old HUD remains quarantined_legacy_license_risk. The full old-HUD kill-switch gate remains open pending a SPEC-003-shaped Agent 4 dynamic/fallback exposure packet.
```
