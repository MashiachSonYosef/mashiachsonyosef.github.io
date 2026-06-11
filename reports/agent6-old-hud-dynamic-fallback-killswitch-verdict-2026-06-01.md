# Agent 6 Old-HUD Dynamic/Fallback Kill-Switch Verdict

Date: 2026-06-01
Authority: Agent 6 independent QA/compliance
Gate: `hud_runtime_license_risk_gate`
Queue item: `agent6-old-hud-quarantine-killswitch-coverage`
Verdict: WARN-ACCEPTED for repository-file static plus simulated dynamic/fallback kill-switch evidence only
Risk classification: warning; legacy license/public-runtime risk remains bounded, not cleared for live deployment

## Scope Accepted

This docket accepts the Agent 4 packet as evidence that, within the local repository file set and Node VM/static-navigation method:

- generated public pages use the current HUD marker set and do not expose searched old-HUD markers
- public navigation roots do not resolve to old-HUD-marked targets
- generated pages do not import `scripts/upgrade_route_hud_pages.mjs`
- Reader Workbench import/runtime controls reject evidence-only, missing-source/license, and non-`not_a_translation` selections
- usage evidence cannot become a selected Definition answer in the tested dynamic control
- representative route lookup, answer safety, and page validators pass

## Scope Not Accepted

This docket does not accept:

- old-HUD public use
- old-HUD fallback/rollback as a public feature
- live browser-click proof
- deployed/CDN/stale-bundle proof
- public/runtime expansion beyond already docketed HUD boundaries
- source/provenance custody
- publication readiness or publication-path support
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- accepted translation text

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `data/control/agent6_validation_queue.json`
- `reports/agent5-agent6-old-hud-quarantine-killswitch-packet-2026-06-01.md`
- `reports/agent6-old-hud-static-quarantine-docket-2026-06-01.md`
- `reports/agent6-old-hud-queue-preservation-receipt-2026-06-01.md`
- `reports/agent4-old-hud-dynamic-fallback-exposure-report-2026-06-01.md`
- `reports/agent4-old-hud-dynamic-fallback-exposure-report-2026-06-01.json`
- `reports/agent4-old-hud-dynamic-validator-evidence-2026-06-01.md`
- `reports/agent4-old-hud-dynamic-click-contract-genesis-2026-06-01.md`
- `reports/agent4-old-hud-dynamic-click-contract-genesis-2026-06-01.json`
- `scripts/audit_old_hud_dynamic_fallback.mjs`
- `reports/agent6-validation-queue-health.md`

## Validation Run

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings.
- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp`: passed.
- `node scripts\validate_route_answer_safety.mjs`: passed.
- `node scripts\validate_route_hud_page.mjs --page tanakh\genesis\index.html --page tanakh\exodus\index.html --page halakhah\urim-vetumim-urim\index.html --page halakhah\meirat-einayim-on-shulchan-arukh-choshen-mishpat\index.html --page other\beer-hagolah\index.html --page jewish-thought\kuzari\index.html --page midrash\yefeh-toar-on-bereshit-rabbah\index.html --page targum\targum-jonathan-on-genesis\index.html --page mishnah\mishnah-berakhot\index.html --page chasidut\baal-shem-tov\index.html --page gra\aderet-eliyahu\index.html --page liturgy\siddur-sefard\index.html --page tosefta\brief-commentary-on-yoma\index.html`: passed for 13 pages.

Deviation:
- `node scripts\audit_old_hud_dynamic_fallback.mjs` emitted a completed report but the shell wrapper returned a timeout. Agent 6 therefore did not count that command as a clean shell pass by itself; this verdict relies on the emitted report, independent JSON recounts, and direct validator runs above.

## Machine Counts Recounted

- generated pages expected: 1360
- generated pages present: 1360
- generated pages with old-HUD markers: 0
- generated pages importing Reader Workbench runtime: 1243
- generated pages importing stale upgrade tool: 0
- public navigation links resolved: 2726
- public navigation targets with old-HUD markers: 0
- dynamic runtime controls: 8
- dynamic runtime control failures: 0
- validator failures reported by packet: 0
- issues: 0
- warnings: 3
- generated pages with source/license rows: 1360
- generated pages with source footnotes: 1360
- generated imports without observable cache-busting query: 1243

## Findings

### WARN-ACCEPTED: Old-HUD Repository Exposure Is Quarantined In Current File Evidence

Owning lane: Agent 4 evidence; Agent 5/7 control publication

Evidence:
- 1360 / 1360 generated pages were present.
- 0 generated pages had searched old-HUD markers.
- 0 generated pages imported `scripts/upgrade_route_hud_pages.mjs`.
- 2726 public navigation targets resolved with 0 old-HUD marker hits and 0 targets to quarantined preview.

Acceptance condition met:
- For repository-file evidence only, old-HUD markers and stale upgrade-tool imports are not present in the audited generated public page set.

Warning limit:
- This is not live browser-click, deployed-site, CDN, HTTP cache, or stale-bundle proof.

### WARN-ACCEPTED: Runtime Negative Controls Preserve Reader/Definition Boundaries

Owning lane: Agent 4 evidence; Agent 2/3/4 affected

Evidence:
- 8 dynamic runtime controls ran with 0 failures.
- Negative controls rejected old-HUD-looking query-string exposure, non-`not_a_translation` import payloads, evidence-only imported selections, and imported selections missing source/license rows.
- Usage-as-definition negative control did not select high-score usage evidence as the Definition answer.
- Positive controls still accepted a valid `not_a_translation` answer selection with source/license rows.

Acceptance condition met:
- In the Node VM simulated runtime method, tested import and selection controls keep evidence-only/usage rows from becoming Definition authority and preserve source/license row requirements.

Warning limit:
- This does not prove all browser storage, all browser click paths, all deployment states, or broad Reader Workbench behavior.

### WARN: Preview Fallback And Stale Upgrade Tool Remain Quarantined Reference Surfaces

Owning lane: Agent 4 / Agent 5

Evidence:
- `hud-preview/` remains a prototype/reference surface with route preview fallback.
- `scripts/upgrade_route_hud_pages.mjs` remains in the workspace and contains stale old-HUD marker strings.
- Generated pages do not import the stale upgrade tool.

Acceptance condition:
- Keep `hud-preview/` and `scripts/upgrade_route_hud_pages.mjs` explicitly quarantined and non-authoritative. They must not be used as render authority, rollback authority, public fallback, or evidence of accepted old-HUD behavior.

### WARN: Stale Bundle / Cache-Busting Risk Is Not Cleared

Owning lane: Agent 4 / Agent 5

Evidence:
- 1243 generated pages import `assets/js/reader-workbench.js` without an observable cache-busting query string.
- File evidence does not expose HTTP cache headers, CDN state, browser cache behavior, or deployed bundle freshness.

Acceptance condition:
- Before any claim of deployed public-runtime closure, provide live/deployment evidence or a cache-busting/versioned-asset control that proves stale old-HUD bundles cannot remain reachable.

## Affected Gates

- `hud_runtime_license_risk_gate`: WARN-ACCEPTED for repository-file static plus simulated dynamic/fallback kill-switch evidence only.
- `public_runtime_surface_gate`: no new broad public/runtime acceptance.
- `source_provenance_gate`: no source/provenance custody acceptance.
- `definition_integrity_gate`: no Definition authority acceptance; usage-as-definition remains blocked.
- `reader_workbench_gate`: no broad rollout acceptance.
- `publication_gate`: remains `blocked_no_render`.

## Disposition

The previous open requirement for a SPEC-003-shaped Agent 4 dynamic/fallback old-HUD exposure packet is satisfied at the repository-file/static-plus-simulated level.

The following remain open:

- live browser-click proof
- deployed/CDN/cache stale-bundle proof
- public old-HUD fallback/rollback closure
- source/provenance custody
- publication render validation

## Required Next Action

Agent 5 may record this queue item as returned WARN-ACCEPTED with the status:

`returned_warn_accepted_repo_static_simulated_dynamic_killswitch_evidence_only_deployment_gate_open`

Agent 5 and Agent 7 must preserve the warning boundary exactly. Agent 4 should not be re-prompted on this packet unless Agent 5/7 need deployment/cache-busting evidence or a live browser-click packet.
