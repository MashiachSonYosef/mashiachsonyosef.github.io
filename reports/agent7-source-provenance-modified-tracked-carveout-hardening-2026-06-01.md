# Agent 7 Source Provenance Modified Tracked Carve-Out Hardening

Generated: 2026-06-01T17:46:00Z

## CEO Decision

- Continue source/provenance blocked governance.
- No worker-lane interruption is warranted.
- No Agent 6 docket is requested; this is governance-control hardening that preserves an existing Agent 6 source-scope boundary.

## What Changed

- Added a structured `modified_tracked_source_files_outside_docket` list and count to:
  - `data/control/pipeline_state.json`
  - `data/control/gate_registry.json`
  - `data/control/agent_goal_board.json`
- Added the same six-file carve-out to the active `render_shell` stage in `data/control/pipeline_state.json`.
- Added validator coverage to `scripts/validate_agent7_governance_control.mjs` so the six modified tracked source files cannot be silently absorbed into the Agent 6 direct-23/audit-23 source-scope/report-truth docket.

## Six Modified Tracked Source Files Outside Docket

- `data/sources/abarbanel-on-guide-for-the-perplexed.json`
- `data/sources/crescas-on-guide-for-the-perplexed.json`
- `data/sources/efodi-on-guide-for-the-perplexed.json`
- `data/sources/narboni-on-guide-for-the-perplexed.json`
- `data/sources/shem-tov-on-guide-for-the-perplexed.json`
- `data/sources/yahel-ohr-on-zohar.json`

## Boundaries Preserved

- Agent 6 direct-23/audit-23 remains WARN-ACCEPTED for source-scope/report truth only.
- All 23 untracked source files remain quarantined.
- The six modified tracked source files are outside the 23-file docket and require separate custody/drift treatment before any source/provenance, page/render, public/runtime, route publication support, or accepted-text reliance.
- Publication remains `blocked_no_render`.
- This correction creates no QA acceptance, no source/provenance custody acceptance, no product/data gate acceptance, no public/runtime acceptance, and no accepted translation text.

## Verification

- `data/control/pipeline_state.json`, `data/control/gate_registry.json`, and `data/control/agent_goal_board.json` parse as JSON.
- `node scripts\validate_agent7_governance_control.mjs` passed with 1 expected warning about legacy workbench handoff authority.
- `node scripts\validate_agent6_validation_queue.mjs` passed with 0 warnings.
- `node scripts\validate_agent5_control_readiness.mjs` passed with 3 known warnings.
- `git status --porcelain=v1 -- data\sources` reports 29 changed source files total: 23 untracked plus 6 modified tracked.

## Agent 5 Next Tick

- No worker prompt is needed for this correction.
- Do not prompt Agent 1 only to repeat the 23-file count.
- Route future source work only for separate custody/exclusion handling, the six modified tracked source files, source/provenance drift, or Agent 6-requested evidence.

## Agent 8 Watch Item

- Pressure Agent 5 only if the six modified tracked source files are treated as accepted by the direct-23/audit-23 docket, omitted from source/provenance blockers, or used for public/runtime/publication reliance without a separate Agent 6 docket.
