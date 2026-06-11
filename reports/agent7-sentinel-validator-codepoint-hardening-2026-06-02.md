# Agent 7 Sentinel Validator Codepoint Hardening

Date: 2026-06-02
Authority: Agent 7 governance-control validation
Related Agent 6 docket: `reports/agent6-deuteronomy-sentinel-encoding-control-recheck-2026-06-02.md`
Publication boundary: publication remains `blocked_no_render`

## Decision

Agent 7 hardened `scripts/validate_agent7_governance_control.mjs` so the Deuteronomy 1:1 sentinel mirror is validated by codepoint identity rather than fragile console/rendered string comparison.

## Reason

The control mirror correctly stores the UTF-8 Hebrew sentinel:

- token id: `tok-21613e763fe6`
- surface codepoints: `05d0 05b5 05a3 05dc 05bc 05b6 05d4`
- normalized codepoints: `05d0 05dc 05d4`
- route shard key: `05d0-05dc-05d4`

The prior validator also compared literal Hebrew strings. In some PowerShell/console output paths those render as mojibake in failure messages, so the literal comparison was too fragile for governance health. The validator now checks the computed codepoints and the stored codepoint fields against Agent 6's docketed identity.

## Validation

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings.
- `node scripts\validate_agent7_governance_control.mjs`: passed with 2 warnings.
- `node scripts\validate_agent5_control_readiness.mjs`: passed with 3 warnings.

## Boundary

This is encoding-control validator hardening only. It does not create live runtime acceptance, public/runtime acceptance, source/provenance custody, publication readiness, product/data gate acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, or accepted translation text.
