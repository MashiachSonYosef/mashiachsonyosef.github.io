# Agent 4 Deuteronomy Baseline Runtime/Prereq Evidence - 2026-06-04

## Lane

`DEUTERONOMY_REPLICATION | baseline validator/prereq only`

## Exact Command

Command routed:

```powershell
node scripts/audit_live_deuteronomy_runtime.mjs
```

Command behavior:

- The exact command produced the expected default Deuteronomy runtime evidence artifacts.
- The shell call timed out at the harness timeout after artifact generation; the spawned node/chrome cleanup did not return cleanly.
- Agent 4 stopped the just-spawned stale process set after confirming the report/JSON/screenshot existed.
- This is recorded as a cleanup warning, not public/runtime acceptance.

## Produced Evidence Artifacts

- Report: `reports/agent4-live-deuteronomy-browser-runtime-evidence-2026-06-04.md`
- JSON: `reports/agent4-live-deuteronomy-browser-runtime-evidence-2026-06-04.json`
- Screenshot: `reports/agent4-live-deuteronomy-hud-click-2026-06-04.png`
- Agent 4 expected wrapper: `reports/agent4-deuteronomy-baseline-runtime-prereq-evidence-2026-06-04.md`

## Baseline Result

Status: `warn_live_deuteronomy_runtime_evidence`

JSON summary:

- Static HTTP status: `200`
- Static page old-HUD marker hits: `0`
- Clicked token ID: `tok-21613e763fe6`
- Route cards after click: `6`
- Answer cards after click: `1`
- Source/license rows after click: `3`
- Clicked HUD old-HUD marker hits: `0`
- Route shard `200` responses after click: `1`
- Issues: `0`
- Warnings: `1`

Checks reported true:

- `static_http_current_no_old`
- `click_to_hud_opened`
- `source_license_visible_after_click`
- `route_shard_loaded_after_click`
- `hard_refresh_current_no_old`
- `query_negative_no_old`
- `storage_negative_no_old`

Warning preserved:

- `Runtime script URL is not visibly versioned/cache-busted in page markup; hard refresh/cache-busted navigation was tested, but CDN stale-bundle closure is not accepted.`

## Stop Condition

Stop after exact runtime/prereq baseline command result.

No additional Deuteronomy proof loop was run.

## What Remains Blocked

- Public/runtime acceptance remains blocked.
- QA acceptance remains blocked.
- Publication readiness remains blocked.
- CDN/cache closure beyond the cache-busted and hard-refresh checks remains blocked.
- Any candidate-data replication beyond baseline prerequisite evidence requires a changed package/input, command list, expected output, and stop condition.

## Boundary

No public/runtime acceptance, QA acceptance, source/license acceptance, source/provenance acceptance, Definition authority, runtime acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss, translation output, or accepted text is claimed.

Publication remains `blocked_no_render`.
