# Agent 5 Control Sidecars

Generated: 2026-05-31T14:05:22-04:00

## Purpose

These sidecars cut the user out of routine coordination. Agent 5 should update them from local evidence during pulses, using the user only as outside counsel/product owner for risk posture and publication decisions.

## Files

| sidecar | purpose |
|---|---|
| `data/control/pipeline_state.json` | machine-readable current pipeline stage state |
| `data/control/gate_registry.json` | canonical gates, owners, acceptance owners, evidence, and blockers |
| `data/control/relay_state.json` | relay status without relying only on chat memory |
| `data/control/qa_docket_index.json` | Agent 6 dockets, prompt state, focus, and possible owning lanes |

## Current Control Read

- Agent 2 route release discipline: observed adopted.
- Agent 3 usage navigation: observed adopted.
- Agent 4 HUD truth: current bottleneck and needs Agent 6 QA.
- Agent 1 source/render custody: needs observation from recent reports.
- Agent 6 compliance and role-gate prompts: sent and pending.
- User role: outside counsel/product owner, not routine state bus.

## Next Sidecar Improvements

- Add a small validator for these sidecars.
- Update pipeline state automatically from readiness reports where cheap.
- Add `last_observed_report` timestamps per lane.
- Record Agent 6 findings once returned.
